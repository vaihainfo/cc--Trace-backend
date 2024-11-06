import { Request, Response } from "express";
import { Op, Sequelize } from "sequelize";

import User from "../../../models/user.model";
import hash from "../../../util/hash";
import UserRegistrations from "../../../models/user-registrations.model";
import Country from "../../../models/country.model";
import Program from "../../../models/program.model";
import UserRole from "../../../models/user-role.model";
import State from "../../../models/state.model";
import Brand from "../../../models/brand.model";
import Ginner from "../../../models/ginner.model";
import Spinner from "../../../models/spinner.model";

const createUser = async (req: Request, res: Response) => {
    const userExist = await User.findOne({
        where: {
            [Op.or]: [
              { username: req.body.username },
              { email: req.body.email }
            ]
          }
    })
  
    if (userExist) {
      return res.sendError(res, "ERR_AUTH_USERNAME_OR_EMAIL_ALREADY_EXIST");
    }
  
    const USER_MODEL = {
      username: req.body.username,
      email: req.body.email,
      password: await hash.generate(req.body.password),
      firstname: req.body.firstName || "",
      lastname: req.body.lastName || "",
      mobile: req.body.mobile || "",
      role: req.body.role !== undefined ? Number(req.body.role) : null,
      status: req.body.status || true,
      lsv_program: req.body.lsvProgram || null,
      lsv_brand: req.body.lsvBrand || null,
      lsv_country: req.body.lsvCountry || null,
      lsv_mapped_states: req.body.lsvState || null,
      lsv_mapped_ginners: req.body.lsvGinners && req.body.lsvGinners.length > 0 ? req.body.lsvGinners : null,
      lsv_mapped_spinners: req.body.lsvSpinners && req.body.lsvSpinners.length > 0 ? req.body.lsvSpinners  : null,
      lsv_mapped_to: req.body.lsvMappedTo ? req.body.lsvMappedTo : '',
      is_lsv_user: true,
      isAgreementAgreed: false,
    };
    try {
      const user = await User.create(USER_MODEL);
      return res.sendSuccess(res, user, 200);
    } catch (error: any) {
      console.error("Error appending data:", error);
      return res.sendError(res, error.message);
  }
  }

  

  const fetchUsers = async (req: Request, res: Response) => {
    const { search, brandId, userGroupId, programId, stateId, countryId, ginnerId, spinnerId }: any = req.query;
  
    const sortOrder = req.query.sort || "";
    //   const sortField = req.query.sortBy || '';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
  
    if (search) {
      whereCondition[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } }, // Search by state name
        { email: { [Op.iLike]: `%${search}%` } }, // Search by district name
        { firstname: { [Op.iLike]: `%${search}%` } }, // Search by district name
        { lastname: { [Op.iLike]: `%${search}%` } }, // Search by state name
        { mobile: { [Op.iLike]: `%${search}%` } }, // Search by country name
      ];
    }
    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
  
      whereCondition.lsv_brand = { [Op.overlap]: idArray };
      // whereCondition.processor_type = 'spinner';
    }
    if (userGroupId) {
      const idArray: number[] = userGroupId
        .split(",")
        .map((id: any) => parseInt(id, 10));
  
      whereCondition.role = { [Op.in]: idArray };
      // whereCondition.processor_type = 'spinner';
    }
    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
  
      whereCondition.lsv_country = { [Op.in]: idArray };
      // whereCondition.processor_type = 'spinner';
    }

    if (stateId) {
        const idArray: number[] = stateId
          .split(",")
          .map((id: any) => parseInt(id, 10));
    
        whereCondition.lsv_mapped_states = { [Op.overlap]: idArray };
        // whereCondition.processor_type = 'spinner';
      }

      if (ginnerId) {
        const idArray: number[] = ginnerId
          .split(",")
          .map((id: any) => parseInt(id, 10));
    
        whereCondition.lsv_mapped_ginners = { [Op.overlap]: idArray };
        // whereCondition.processor_type = 'spinner';
      }

      if (spinnerId) {
        const idArray: number[] = spinnerId
          .split(",")
          .map((id: any) => parseInt(id, 10));
    
        whereCondition.lsv_mapped_spinners = { [Op.overlap]: idArray };
        // whereCondition.processor_type = 'spinner';
      }
  
    whereCondition.is_lsv_user = true;
    let queryOptions: any = {
      where: whereCondition,
    };

    let include = [
        {
            model: Country, as: 'lsvcountry', attributes: ['id', 'county_name']
        },
        {
            model: Program, as: 'lsvprogram', attributes: ['id', 'program_name']
        },
        {
            model: UserRole, as: 'user_role'
        }
    ];

    queryOptions.include = include;
  
    queryOptions.order = [["id", 'desc']];
    let data =[];
  
    try {
      if (req.query.pagination === "true") {
        queryOptions.offset = offset;
        queryOptions.limit = limit;
  
        const { count, rows } = await User.findAndCountAll(queryOptions);

        for await(let item of rows){
          let states = null;
          let brands = null;
          let ginners = null;
          let spinners = null;
          if(item?.dataValues?.lsv_mapped_states && item?.dataValues?.lsv_mapped_states.length > 0){
            states = await State.findAll({attributes: ['id', 'state_name'],where:{id: item?.dataValues?.lsv_mapped_states}})
          }

          if(item?.dataValues?.lsv_brand && item?.dataValues?.lsv_brand.length > 0){
            brands = await Brand.findAll({attributes: ['id', 'brand_name'],where:{id: item?.dataValues?.lsv_brand}})
          }

          if(item?.dataValues?.lsv_mapped_ginners && item?.dataValues?.lsv_mapped_ginners.length > 0){
            ginners = await Ginner.findAll({attributes: ['id', 'name'],where:{id: item?.dataValues?.lsv_mapped_ginners}})
          }

          if(item?.dataValues?.lsv_mapped_spinners && item?.dataValues?.lsv_mapped_spinners.length > 0){
            spinners = await Spinner.findAll({attributes: ['id', 'name'],where:{id: item?.dataValues?.lsv_mapped_spinners}})
          }

          data.push({
            ...item?.dataValues,
            states,
            brands,
            ginners,
            spinners
          })
        }
        return res.sendPaginationSuccess(res, data, count);
      } else {
        const user = await User.findAll(queryOptions);
        return res.sendSuccess(res, user, 200);
      }
    } catch (error: any) {
      console.log(error)
      res.sendError(res, error?.message);
    }
  }


  const fetchUser = async (req: Request, res: Response) => {
    try {
      const user = await User.findOne({where:{id: req.query.id}});
  
      if (!user) {
        return res.sendError(res, "ERR_USER_NOT_EXIST");
      }
      return res.sendSuccess(res, user, 200);
    } catch (error) {
      console.log(error)
      res.sendError(res, "ERR_AUTH_USERNAME_OR_EMAIL_ALREADY_EXIST");
    }
  }
  
  const updateUser = async (req: Request, res: Response) => {
    try {
    const userExist = await User.findByPk(req.body.id);
  
    if (!userExist) {
      return res.sendError(res, "ERR_USER_NOT_EXIST");
    }
  
    const USER_MODEL = {
      username: req.body.username,
      email: req.body.email,
      password: req.body.password !== "" ? await hash.generate(req.body.password) : userExist.password,
      firstname: req.body.firstName || "",
      lastname: req.body.lastName || "",
      mobile: req.body.mobile || "",
      role: req.body.role !== undefined ? Number(req.body.role) : null,
      status: req.body.status || true,
      lsv_program: req.body.lsvProgram || null,
      lsv_brand: req.body.lsvBrand || null,
      lsv_country: req.body.lsvCountry || null,
      lsv_mapped_states: req.body.lsvState || null,
      lsv_mapped_ginners: req.body.lsvGinners && req.body.lsvGinners.length > 0 ? req.body.lsvGinners : null,
      lsv_mapped_spinners: req.body.lsvSpinners && req.body.lsvSpinners.length > 0 ? req.body.lsvSpinners  : null,
      lsv_mapped_to: req.body.lsvMappedTo ? req.body.lsvMappedTo : '',
    }

      const user = await User.update(USER_MODEL, {
        where: {
          id: req.body.id
        }
      });
      return res.sendSuccess(res, user, 200);
    } catch (error: any) {
      console.error("Error appending data:", error);
      return res.sendError(res, error.message);
    }
  }
  
  const deleteUser = async (req: Request, res: Response) => {
    try {
      const deleted = await User.destroy({
        where: {
          id: req.body.id
        }
      });
      res.sendSuccess(res, { deleted });
    } catch (error: any) {
      return res.sendError(res, error.message);
    }
  }

  export { createUser, fetchUsers, fetchUser, updateUser, deleteUser };