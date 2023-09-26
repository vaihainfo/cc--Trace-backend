import { Request, Response } from "express";
import { Op } from "sequelize";

import Country from "../../../models/country.model";
import State from "../../../models/state.model";

const fetchStates = async (req: Request, res: Response) => {
  const { search, status } = req.query;
  const sortOrder = req.query.sort || "desc";
  const countryId: string = req.query.countryId as string;
  //   const sortField = req.query.sortBy || '';
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const whereCondition: any = {};
  try {
    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id) => parseInt(id, 10));

      //multi select country filter
      whereCondition.country_id = { [Op.in]: idArray };

      //single country filter
      // whereCondition.country_id = countryId;
    }
    if (search) {
      whereCondition[Op.or] = [
        { state_name: { [Op.iLike]: `%${search}%` } }, // Search by state name
        { "$country.county_name$": { [Op.iLike]: `%${search}%` } }, // Search by country name
      ];
    }
    if (status === 'true') {
      whereCondition.state_status = true;
    }

    let queryOptions: any = {
      where: whereCondition,
      include: [
        {
          model: Country,
          as: "country",
        },
      ],
    };

    if (sortOrder === "asc" || sortOrder === "desc") {
      queryOptions.order = [["id", sortOrder]];
    }

    if (req.query.pagination === "true") {
      queryOptions.offset = offset;
      queryOptions.limit = limit;

      const { count, rows } = await State.findAndCountAll(queryOptions);
      return res.sendPaginationSuccess(res, rows, count);
    } else {
      const state = await State.findAll({
        where: whereCondition,
        include: [
          {
            model: Country,
            as: "country",
          },
        ],
      });
      return res.sendSuccess(res, state);
    }
  } catch (error) {
    return res.status(400).json(error);
  }
};

export default fetchStates;
