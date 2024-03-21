import { Request, Response } from "express";
import { Op } from "sequelize";

import Country from "../../../models/country.model";
import State from "../../../models/state.model";
import District from "../../../models/district.model";

const fetchDistricts = async (req: Request, res: Response) => {
  const { search, status } = req.query;
  const sortOrder = req.query.sort || "desc";
  const countryId: string = req.query.countryId as string;
  const stateId: string = req.query.stateId as string;
  //   const sortField = req.query.sortBy || '';
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (stateId) {
      const idArray: number[] = stateId
        .split(",")
        .map((id) => parseInt(id, 10));
      whereCondition.state_id = { [Op.in]: idArray };
    }
    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id) => parseInt(id, 10));
      //multi select country filter
      whereCondition["$state.country.id$"] = { [Op.in]: idArray };
    }
    if (status === 'true') {
      whereCondition.district_status = true;
    }

    if (search) {
      whereCondition[Op.or] = [
        { district_name: { [Op.iLike]: `%${search}%` } }, // Search by state name
        { "$state.state_name$": { [Op.iLike]: `%${search}%` } }, // Search by country name
        { "$state.country.county_name$": { [Op.iLike]: `%${search}%` } }, // Search by country name
      ];
    }

    let queryOptions: any = {
      where: whereCondition,
      include: [
        {
          model: State,
          as: "state",
          include: [{ model: Country, as: "country" }],
        },
      ],
    };
    if (sortOrder === "asc" || sortOrder === "desc") {
      queryOptions.order = [["id", sortOrder]];
    }

    if (req.query.pagination === "true") {
      queryOptions.offset = offset;
      queryOptions.limit = limit;

      const { count, rows } = await District.findAndCountAll(queryOptions);
      return res.sendPaginationSuccess(res, rows, count);
    } else {
      const district = await District.findAll({
        where: whereCondition,
        include: [
          {
            model: State,
            as: "state",
            include: [{ model: Country, as: "country" }],
          },
        ],
      });
      return res.sendSuccess(res, district);
    }
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message);
  }
};

const checkDistricts = async (req: Request, res: Response) => {
  try {
    const { stateId, districtName } = req.body;
    let whereCondition: any = {}
    if (req.body.id) {
      whereCondition = { state_id: stateId, district_name: { [Op.iLike]: districtName }, id: { [Op.ne]: req.body.id } }
    } else {
      whereCondition = { state_id: stateId, district_name: { [Op.iLike]: districtName } }
    }
    let result = await District.findOne({ where: whereCondition })

    res.sendSuccess(res, result ? { exist: true } : { exist: false });
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message);
  }
}

export { fetchDistricts, checkDistricts };
