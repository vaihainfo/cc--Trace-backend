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
import TraceabilityExecutive from "../../../models/traceability-executive.model";
import SupplyChainManager from "../../../models/supply-chain-manager.model";
import SupplyChainDirector from "../../../models/supply-chain-director.model";

const createLSVUser = async (req: Request, res: Response) => {
  try {
        let userIds = [];
        let allUserInactive = false; 

        for await (let user of req.body.userData) {
            const userData = {
                firstname: user.firstname,
                lastname: user.lastname ? user.lastname : '',
                position: user.position,
                email: user.email,
                password: await hash.generate(user.password),
                status: user.status,
                username: user.username,
                role: req.body.process_role[0],
                process_role: req.body.process_role,
                mobile: user.mobile,
                is_lsv_user: true,
            };
            const result = await User.create(userData);
            userIds.push(result.id);
            if (user.status) {
                allUserInactive = true;
            }
        }

        let mainData: any = [];
        let data = {
            name: req.body.name,
            country_id: req.body.countryId,
            program_id: req.body.programIds,
            brand: req.body.brand,
            mobile: req.body.mobile,
            email: req.body.email,
            mapped_to: req.body.lsvMappedTo,
            mapped_states: req.body.lsvState || null,
            mapped_ginners: req.body.lsvGinners && req.body.lsvGinners.length > 0 ? req.body.lsvGinners : null,
            mapped_spinners: req.body.lsvSpinners && req.body.lsvSpinners.length > 0 ? req.body.lsvSpinners  : null,
        }

        if (req.body.processType.includes('Traceability Executive')) {
          let obj = {
              ...data,
              teUser_id: userIds,
              status: allUserInactive
          }

          const result = await TraceabilityExecutive.create(obj);
          mainData.push(result);
      }

      if (req.body.processType.includes('Supply Chain Manager')) {
        let obj = {
            ...data,
            scmUser_id: userIds,
            status: allUserInactive
        }

        const result = await SupplyChainManager.create(obj);
        mainData.push(result);
      }

      if (req.body.processType.includes('Supply Chain Director')) {
        let obj = {
            ...data,
            scdUser_id: userIds,
            status: allUserInactive
        }

        const result = await SupplyChainDirector.create(obj);
        mainData.push(result);
      }
      return res.sendSuccess(res, mainData);
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
  }


  const fetchAllLSVProcessor = async (req: Request, res: Response) => {
    try {
        if (!req.query.type) {
            return res.sendError(res, 'Need processor Type')
        }

        let userIds: any = [];
        let result;

        if (req.query.type === 'Traceability_Executive') {
            result = await TraceabilityExecutive.findOne({
                where: {
                    id: req.query.id
                }
            });
            if (result) {
                userIds = result.teUser_id;
            }
        }

        if (req.query.type === 'Supply_Chain_Manager') {
            result = await SupplyChainManager.findOne({
                where: {
                    id: req.query.id
                }
            });
            if (result) {
                userIds = result.scmUser_id;
            }
        }

        if (req.query.type === 'Supply_Chain_Director') {
            result = await SupplyChainDirector.findOne({
                where: {
                    id: req.query.id
                }
            });
            if (result) {
                userIds = result.scdUser_id;
            }
        }
       

        let userData = [];
        let [traceability_executive, supply_chain_manager, supply_chain_director] = await Promise.all([
            TraceabilityExecutive.findOne({ where: { teUser_id: { [Op.overlap]: userIds } } }),
            SupplyChainManager.findOne({ where: { scmUser_id: { [Op.overlap]: userIds } } }),
            SupplyChainDirector.findOne({ where: { scdUser_id: { [Op.overlap]: userIds } } })
        ]);

        if (result) {
            for await (let user of userIds) {
                let us = await User.findOne({
                    where: { id: user }, attributes: {
                        exclude: ["password", "createdAt", "updatedAt"]
                    },
                    include: [
                        {
                            model: UserRole,
                            as: "user_role",
                        }
                    ]
                });
                userData.push(us);
            }
        }
        return res.sendSuccess(res, result ? { traceability_executive, supply_chain_manager, supply_chain_director, userData } : {});

    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
}

  

  const fetchUsers = async (req: Request, res: Response) => {
    const { search, brandId, programId, stateId, countryId, ginnerId, spinnerId, processorType }: any = req.query;
  
    const sortOrder = req.query.sort || "";
    //   const sortField = req.query.sortBy || '';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};

    if (search) {
      whereCondition[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { "$country.count_name$": { [Op.iLike]: `%${search}%` } },
        { mobile: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (!req.query.processorType) {
      return res.sendError(res, 'Need processor Type')
    }

    if (programId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10)); 
      whereCondition.program_id = { [Op.overlap]: idArray };
    }

    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.brand = { [Op.overlap]: idArray };
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.country_id = { [Op.in]: idArray };
    }

    if (stateId) {
      const idArray: number[] = stateId
        .split(",")
        .map((id: any) => parseInt(id, 10));
  
      whereCondition.mapped_states = { [Op.overlap]: idArray };
    }

    if (ginnerId) {
      const idArray: number[] = ginnerId
        .split(",")
        .map((id: any) => parseInt(id, 10));
  
      whereCondition.mapped_ginners = { [Op.overlap]: idArray };
    }

    if (spinnerId) {
      const idArray: number[] = spinnerId
        .split(",")
        .map((id: any) => parseInt(id, 10));
  
      whereCondition.mapped_spinners = { [Op.overlap]: idArray };
    }
  
    let queryOptions: any = {
      where: whereCondition,
    };

    let include = [
        {
            model: Country, as: 'country', attributes: ['id', 'county_name']
        }
    ];

    queryOptions.include = include;
  
    let data =[];
    
    try {
      if (req.query.pagination === "true") {
        queryOptions.order = [["id", 'desc']];
        queryOptions.offset = offset;
        queryOptions.limit = limit;

        let results = [];
        let counts = 0;

        if(processorType === 'Traceability_Executive'){
          const { count, rows } = await TraceabilityExecutive.findAndCountAll(queryOptions);
          results = rows
          counts = count;
        }

        if(processorType === 'Supply_Chain_Manager'){
          const { count, rows } = await SupplyChainManager.findAndCountAll(queryOptions);
          results = rows
          counts = count;
        }

        if(processorType === 'Supply_Chain_Director'){
          const { count, rows } = await SupplyChainDirector.findAndCountAll(queryOptions);
          results = rows
          counts = count;
        }

        if(results && results.length > 0){
          for await(let item of results){
            let states = null;
            let brands = null;
            let ginners = null;
            let spinners = null;
            let programs = null;

            if(item?.dataValues?.program_id && item?.dataValues?.program_id.length > 0){
              programs = await Program.findAll({attributes: ['id', 'program_name'],where:{id: item?.dataValues?.program_id}})
            }

            if(item?.dataValues?.mapped_states && item?.dataValues?.mapped_states.length > 0){
              states = await State.findAll({attributes: ['id', 'state_name'],where:{id: item?.dataValues?.mapped_states}})
            }
  
            if(item?.dataValues?.brand && item?.dataValues?.brand.length > 0){
              brands = await Brand.findAll({attributes: ['id', 'brand_name'],where:{id: item?.dataValues?.brand}})
            }
  
            if(item?.dataValues?.mapped_ginners && item?.dataValues?.mapped_ginners.length > 0){
              ginners = await Ginner.findAll({attributes: ['id', 'name'],where:{id: item?.dataValues?.mapped_ginners}})
            }
  
            if(item?.dataValues?.mapped_spinners && item?.dataValues?.mapped_spinners.length > 0){
              spinners = await Spinner.findAll({attributes: ['id', 'name'],where:{id: item?.dataValues?.mapped_spinners}})
            }
  
            data.push({
              ...item?.dataValues,
              states,
              programs,
              brands,
              ginners,
              spinners
            })
          }
        }
  

        return res.sendPaginationSuccess(res, data, counts);
      } else {
        queryOptions.order = [["id", 'asc']];
        let results = [];

        if(processorType === 'Traceability_Executive'){
          const rows = await TraceabilityExecutive.findAll(queryOptions);
          results = rows
        }

        if(processorType === 'Supply_Chain_Manager'){
          const rows = await SupplyChainManager.findAll(queryOptions);
          results = rows
        }

        if(processorType === 'Supply_Chain_Director'){
          const rows = await SupplyChainDirector.findAll(queryOptions);
          results = rows
        }

        return res.sendSuccess(res, results, 200);
      }
    } catch (error: any) {
      console.log(error)
      res.sendError(res, error?.message);
    }
  }


  const fetchUser = async (req: Request, res: Response) => {
    try {
      const { id, processorType }: any = req.query;
      let results;
      let data = {};
      let userIds: any = [];

      if (!req.query.processorType) {
        return res.sendError(res, 'Need processor Type')
      }

        if(processorType === 'Traceability_Executive'){
          results= await TraceabilityExecutive.findOne(
            {where:{id: id},
            include:[
              {
                  model: Country, as: 'country', attributes: ['id', 'county_name']
              }
            ]
          });
          if (results) {
            userIds = results.teUser_id;
          }
        }

        if(processorType === 'Supply_Chain_Manager'){
          results = await SupplyChainManager.findOne(
            {where:{id: id},
            include:[
              {
                  model: Country, as: 'country', attributes: ['id', 'county_name']
              }
            ]
          });
          if (results) {
            userIds = results.scmUser_id;
          }
        }

        if(processorType === 'Supply_Chain_Director'){
          results = await SupplyChainDirector.findOne(
            {where:{id: id},
            include:[
              {
                  model: Country, as: 'country', attributes: ['id', 'county_name']
              }
            ]
          });
          if (results) {
            userIds = results.scdUser_id;
          }
        }

        if(results){
          let states = null;
            let brands = null;
            let ginners = null;
            let spinners = null;
            let programs = null;
            let userData = null;
            console.log(results)

            if(results?.dataValues?.program_id && results?.dataValues?.program_id.length > 0){
              programs = await Program.findAll({attributes: ['id', 'program_name'],where:{id: results?.dataValues?.program_id}})
            }

            if(results?.dataValues?.mapped_states && results?.dataValues?.mapped_states.length > 0){
              states = await State.findAll({attributes: ['id', 'state_name'],where:{id: results?.dataValues?.mapped_states}})
            }
  
            if(results?.dataValues?.brand && results?.dataValues?.brand.length > 0){
              brands = await Brand.findAll({attributes: ['id', 'brand_name'],where:{id: results?.dataValues?.brand}})
            }
  
            if(results?.dataValues?.mapped_ginners && results?.dataValues?.mapped_ginners.length > 0){
              ginners = await Ginner.findAll({attributes: ['id', 'name'],where:{id: results?.dataValues?.mapped_ginners}})
            }
  
            if(results?.dataValues?.mapped_spinners && results?.dataValues?.mapped_spinners.length > 0){
              spinners = await Spinner.findAll({attributes: ['id', 'name'],where:{id: results?.dataValues?.mapped_spinners}})
            }

            if(results?.dataValues?.mapped_spinners && results?.dataValues?.mapped_spinners.length > 0){
              spinners = await Spinner.findAll({attributes: ['id', 'name'],where:{id: results?.dataValues?.mapped_spinners}})
            }

            if(userIds && userIds.length > 0){
              userData = await User.findAll({
                where: { id: userIds }, 
                attributes: {
                    exclude: ["password", "createdAt", "updatedAt"]
                },
                include: [
                    {
                        model: UserRole,
                        as: "user_role",
                    }
                ]
            })
            }

            data = { ...results?.dataValues, states, programs, brands,ginners,spinners, userData }
        }

        return res.sendSuccess(res, data, 200);

    } catch (error: any) {
      console.log(error)
      res.sendError(res, error?.message);
    }
  }


  const updateProcessor = async (req: Request, res: Response) => {
    try {
        let userIds = [];
        let allUserInactive = false; 

        for await (let user of req.body.userData) {
            const userData = {
                firstname: user.firstname,
                lastname: user.lastname ? user.lastname : '',
                position: user.position,
                mobile: user.mobile,
                password: user.password ? await hash.generate(user.password) : undefined,
                status: user.status,
                role: req.body.process_role[0],
                process_role: req.body.process_role,
                is_lsv_user: true,
            };
            if (user.id) {
                const result = await User.update({...userData, username: user.username, email: user.email }, { where: { id: user.id } });
                userIds.push(user.id);
            } else {
                const result = await User.create({ ...userData, username: user.username, email: user.email });
                userIds.push(result.id);
            }
            if (user.status) {
                allUserInactive = true;
            }
        }

        let mainData: any = [];
        let data = {
          name: req.body.name,
          country_id: req.body.countryId,
          program_id: req.body.programIds,
          brand: req.body.brand,
          mobile: req.body.mobile,
          email: req.body.email,
          mapped_to: req.body.lsvMappedTo,
          mapped_states: req.body.lsvState || null,
          mapped_ginners: req.body.lsvGinners && req.body.lsvGinners.length > 0 ? req.body.lsvGinners : null,
          mapped_spinners: req.body.lsvSpinners && req.body.lsvSpinners.length > 0 ? req.body.lsvSpinners  : null,
        }

        if (req.body.processType.includes('Traceability Executive')) {
            let obj = {
                ...data,
                teUser_id: userIds,
                status: allUserInactive
              }
            if (req.body.teId) {
                const result = await TraceabilityExecutive.update(obj, { where: { id: req.body.teId } });
                mainData.push(result);
            } else {
                const result = await TraceabilityExecutive.create(obj);
                mainData.push(result);
            }
        }

        if (req.body.processType.includes('Supply Chain Manager')) {
            let obj = {
                ...data,
                scmUser_id: userIds,
                status: allUserInactive
            }
            if (req.body.scmId) {
                const result = await SupplyChainManager.update(obj, { where: { id: req.body.scmId } });
                mainData.push(result);
            } else {
                const result = await SupplyChainManager.create(obj);
                mainData.push(result);
            }
        }

        if (req.body.processType.includes('Supply Chain Director')) {
            let obj = {
                ...data,
                scdUser_id: userIds,
                status: allUserInactive
            }
            if (req.body.scdId) {
                const result = await SupplyChainDirector.update(obj, { where: { id: req.body.scdId } });
                mainData.push(result);
            } else {
                const result = await SupplyChainDirector.create(obj);
                mainData.push(result);
            }
        }

        if (req.body.deletedTeId) {
            const result = await TraceabilityExecutive.update({ teUser_id: [] }, { where: { id: req.body.deletedTeId } });
        }
        if (req.body.deletedScmId) {
            const result = await SupplyChainManager.update({ scmUser_id: [] }, { where: { id: req.body.deletedScmId } });
        }
        if (req.body.deletedScdId) {
            const result = await SupplyChainDirector.update({ scdUser_id: [] }, { where: { id: req.body.deletedScdId } });
        }

        res.sendSuccess(res, mainData);
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
}


const deleteLSVUser = async (req: Request, res: Response) => {
  try {
      let users = [];
      let userRole: any;

      if(req.body.processorType === 'Traceability_Executive'){
        const ginn = await TraceabilityExecutive.findOne({
            where: {
                id: req.body.id
            },
        });
  
        users = await User.findAll({
            where: {
                id: ginn.teUser_id
            },
        });

         userRole = await UserRole.findOne({
            where: Sequelize.where(
                Sequelize.fn('LOWER', Sequelize.col('user_role')),
                'traceability executive'
            )
        });
      }

      if(req.body.processorType === 'Supply_Chain_Manager'){
        const ginn = await SupplyChainManager.findOne({
            where: {
                id: req.body.id
            },
        });
  
        users = await User.findAll({
            where: {
                id: ginn.scmUser_id
            },
        });

         userRole = await UserRole.findOne({
            where: Sequelize.where(
                Sequelize.fn('LOWER', Sequelize.col('user_role')),
                'supply chain manager'
            )
        });
      }

      if(req.body.processorType === 'Supply_Chain_Director'){
        const ginn = await SupplyChainDirector.findOne({
            where: {
                id: req.body.id
            },
        });
  
        users = await User.findAll({
            where: {
                id: ginn.scdUser_id
            },
        });

         userRole = await UserRole.findOne({
            where: Sequelize.where(
                Sequelize.fn('LOWER', Sequelize.col('user_role')),
                'supply chain director'
            )
        });
      }

      for await (let user of users){
        const updatedProcessRole = user.process_role.filter((roleId: any) => roleId !== userRole.id);
  
        if (updatedProcessRole && updatedProcessRole.length > 0) {
            const updatedUser = await User.update({
                process_role: updatedProcessRole,
                role: updatedProcessRole[0]
            }, { where: { id: user.id } });
        } else {
            await User.destroy({ where: { id: user.id }});
        }
      }

      if(req.body.processorType === 'Traceability_Executive'){
          const ginner = await TraceabilityExecutive.destroy({
            where: {
                id: req.body.id
            }
        });
        return res.sendSuccess(res, { ginner });
      }

      if(req.body.processorType === 'Supply_Chain_Manager'){
        const ginner = await SupplyChainManager.destroy({
          where: {
              id: req.body.id
          }
        });
        return res.sendSuccess(res, { ginner });
      }

      if(req.body.processorType === 'Supply_Chain_Director'){
        const ginner = await SupplyChainDirector.destroy({
          where: {
              id: req.body.id
          }
        });
        return res.sendSuccess(res, { ginner });
      }
  } catch (error: any) {
      return res.sendError(res, error.message);
  }
}

  export { createLSVUser,fetchAllLSVProcessor, fetchUsers, fetchUser, updateProcessor, deleteLSVUser };