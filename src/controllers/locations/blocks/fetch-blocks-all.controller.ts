import { Request, Response } from "express";
import { Op } from "sequelize";

import Country from "../../../models/country.model";
import State from "../../../models/state.model";
import District from "../../../models/district.model";
import Block from "../../../models/block.model";

const fetchBlocks = async (req: Request, res: Response) => {
  const { search, status } = req.query;

  const sortOrder = req.query.sort || "";
  //   const sortField = req.query.sortBy || '';
  const countryId: string = req.query.countryId as string;
  const stateId: string = req.query.stateId as string;
  const districtId: string = req.query.districtId as string;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const whereCondition: any = {};
  try {
    if (districtId) {
      const idArray: number[] = districtId
        .split(",")
        .map((id) => parseInt(id, 10));
      whereCondition.district_id = { [Op.in]: idArray };
      // whereCondition.district_id = districtId;
    }
    if (stateId) {
      const idArray: number[] = stateId
        .split(",")
        .map((id) => parseInt(id, 10));
      whereCondition["$district.state.id$"] = { [Op.in]: idArray };
    }
    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id) => parseInt(id, 10));
      whereCondition["$district.state.country.id$"] = { [Op.in]: idArray };
    }
    if (search) {
      whereCondition[Op.or] = [
        { block_name: { [Op.iLike]: `%${search}%` } }, // Search by state name
        { "$district.district_name$": { [Op.iLike]: `%${search}%` } }, // Search by country name
        { "$district.state.state_name$": { [Op.iLike]: `%${search}%` } }, // Search by country name
        {
          "$district.state.country.county_name$": { [Op.iLike]: `%${search}%` },
        }, // Search by country name
      ];
    }

    if (status === 'true') {
      whereCondition.block_status = true;
    }

    let queryOptions: any = {
      where: whereCondition,
      include: [
        {
          model: District,
          as: "district",
          include: [
            {
              model: State,
              as: "state",
              include: [{ model: Country, as: "country" }],
            },
          ],
        },
      ],
    };
    if (sortOrder === "asc" || sortOrder === "desc") {
      queryOptions.order = [["block_name", sortOrder]];
    }
    if (req.query.pagination === "true") {
      queryOptions.offset = offset;
      queryOptions.limit = limit;

      const { count, rows } = await Block.findAndCountAll(queryOptions);
      return res.sendPaginationSuccess(res, rows, count);
    } else {
      const block = await Block.findAll({
        where: whereCondition,
        include: [
          {
            model: District,
            as: "district",
            include: [
              {
                model: State,
                as: "state",
                include: [{ model: Country, as: "country" }],
              },
            ],
          },
        ],
      });
      return res.sendSuccess(res, block);
    }
  } catch (error) {
    return res.status(400).json(error);
  }
};

export default fetchBlocks;
