import { Request, Response } from "express";
import { Op } from "sequelize";

import User from "../../../models/user.model";
import hash from "../../../util/hash";

const createUser = async (req: Request, res: Response) => {
  const userExist = await User.findAll({
    where: {
      $or: [{ username: req.body.username }, { email: req.body.email }],
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
    position: req.body.position || "",
    countries_web: req.body.countriesWeb || null,
    // countries_web: [1],
    farm_group: req.body.farmGroups || null,
    access_level: req.body.accessLevel || null,
    role: req.body.role !== undefined ? Number(req.body.role) : null,
    status: req.body.status || true,
    country_id: req.body.country || null,
    state_id: req.body.state || null,
    district_id: req.body.districtsId || null,
    block_id: req.body.blocksId || null,
    village_id: req.body.villagesId || null,
    brand_mapped: req.body.brandsId || null,
    ticketApproveAccess: req.body.ticketApproveAccess || null,
    ticketCountryAccess: req.body.ticketCountryAccess || null,
    ticketAccessOnly: req.body.ticketAccessOnly || null,
    isManagementUser: req.body.isManagementUser ? true : false,
    isAgreementAgreed: false,
  };
  try {
    const user = await User.create(USER_MODEL);
    return res.sendSuccess(res, user, 200);
  } catch (error) {
    console.log(error)
    res.sendError(res, "ERR_NOT_ABLE_TO_CREATE_USER");
  }
}


const fetchUsers = async (req: Request, res: Response) => {
  const { search } = req.query;

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
  whereCondition.isManagementUser = true;
  let queryOptions: any = {
    where: whereCondition,
  };

  if (sortOrder === "asc" || sortOrder === "desc") {
    queryOptions.order = [["username", sortOrder]];
  }

  try {
    if (req.query.pagination === "true") {
      queryOptions.offset = offset;
      queryOptions.limit = limit;

      const { count, rows } = await User.findAndCountAll(queryOptions);
      return res.sendPaginationSuccess(res, rows, count);
    } else {
      const user = await User.findAll(queryOptions);
      return res.sendSuccess(res, user, 200);
    }
  } catch (error) {
    console.log(error)
    res.sendError(res, "ERR_AUTH_USERNAME_OR_EMAIL_ALREADY_EXIST");
  }
}

const fetchUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.query.id, {
      attributes: ["id", "username", "email", "firstname", "lastname", "mobile", "farm_group", "role", "position", "access_level", "countries_web", "country_id", "state_id", "district_id", "block_id", "village_id", "brand_mapped", "status"]
    });

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
    countries_web: req.body.countriesWeb || null,
    // countries_web: [1],
    farm_group: req.body.farmGroups || null,
    access_level: req.body.accessLevel || null,
    role: req.body.role !== undefined ? Number(req.body.role) : null,
    status: req.body.status || true,
    country_id: req.body.country || null,
    state_id: req.body.state || null,
    district_id: req.body.districtsId || null,
    block_id: req.body.blocksId || null,
    village_id: req.body.villagesId || null,
    brand_mapped: req.body.brandsId || null,
    isManagementUser: req.body.isManagementUser ? true : false,
  };
  try {
    const user = await User.update(USER_MODEL, {
      where: {
        id: req.body.id
      }
    });
    return res.sendSuccess(res, user, 200);
  } catch (error) {
    console.log(error)
    res.sendError(res, "ERR_AUTH_USERNAME_OR_EMAIL_ALREADY_EXIST");
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