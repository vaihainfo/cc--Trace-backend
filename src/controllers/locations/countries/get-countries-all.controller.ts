import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";

import Country from "../../../models/country.model";

const fetchCountries = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const status = req.query.status || '';
  const sortOrder = req.query.sort || "desc";
  //   const sortField = req.query.sortBy || '';
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {

    let queryOptions: any = {
      where: { county_name: { [Op.iLike]: `%${searchTerm}%` } },
    }
    if (status === 'true') {
      queryOptions = { where: { county_name: { [Op.iLike]: `%${searchTerm}%` }, country_status: true } }
    }
    if (sortOrder === "asc" || sortOrder === "desc") {
      let sort = sortOrder === 'asc' ? 'ASC' : 'DESC';
      queryOptions.order = [["id", sort]];
    }

    if (req.query.pagination === "true") {
      queryOptions.offset = offset;
      queryOptions.limit = limit;

      const { count, rows } = await Country.findAndCountAll(queryOptions);
      return res.sendPaginationSuccess(res, rows, count);
    } else {
      const countries = await Country.findAll(queryOptions);
      return res.sendSuccess(res, countries);
    }
  } catch (error) {
    console.log(error);
    return res.sendError(res, "ERR_NOT_ABLE_TO_GET_COUNTRIES");
  }
};

export default fetchCountries;
