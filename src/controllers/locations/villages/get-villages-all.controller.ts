import { Request, Response } from "express";
import { Op } from "sequelize";

import Country from "../../../models/country.model";
import State from "../../../models/state.model";
import District from "../../../models/district.model";
import Block from "../../../models/block.model";
import Village from "../../../models/village.model";

const fetchVillages = async (req: Request, res: Response) => {
  const { search } = req.query;

  const sortOrder = req.query.sort || "desc";
  const countryId: string = req.query.countryId as string;
  const stateId: string = req.query.stateId as string;
  const districtId: string = req.query.districtId as string;
  const blockId: string = req.query.blockId as string;

  //   const sortField = req.query.sortBy || '';
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const whereCondition: any = {};
  try {
    if (blockId) {
      const idArray: number[] = blockId
        .split(",")
        .map((id) => parseInt(id, 10));
      whereCondition.block_id = { [Op.in]: idArray };
      // whereCondition.block_id = blockId;
    }
    if (districtId) {
      const idArray: number[] = districtId
        .split(",")
        .map((id) => parseInt(id, 10));
      whereCondition["$block.district.id$"] = { [Op.in]: idArray };
    }
    if (stateId) {
      const idArray: number[] = stateId
        .split(",")
        .map((id) => parseInt(id, 10));
      whereCondition["$block.district.state.id$"] = { [Op.in]: idArray };
    }
    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id) => parseInt(id, 10));
      whereCondition["$block.district.state.country.id$"] = {
        [Op.in]: idArray,
      };
    }

    if (search) {
      whereCondition[Op.or] = [
        { village_name: { [Op.iLike]: `%${search}%` } }, // Search by state name
        { "$block.block_name$": { [Op.iLike]: `%${search}%` } }, // Search by district name
        { "$block.district.district_name$": { [Op.iLike]: `%${search}%` } }, // Search by district name
        { "$block.district.state.state_name$": { [Op.iLike]: `%${search}%` } }, // Search by state name
        {
          "$block.district.state.country.county_name$": {
            [Op.iLike]: `%${search}%`,
          },
        }, // Search by country name
      ];
    }

    let queryOptions: any = {
      where: whereCondition,
      include: [
        {
          model: Block,
          as: "block",
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
        },
      ],
    };
    if (sortOrder === "asc" || sortOrder === "desc") {
      queryOptions.order = [["id", sortOrder]];
    }
    if (req.query.pagination === "true") {
      queryOptions.offset = offset;
      queryOptions.limit = limit;

      const { count, rows } = await Village.findAndCountAll(queryOptions);
      return res.sendPaginationSuccess(res, rows, count);
    } else {
      const villages = await Village.findAll({
        where: whereCondition,
        include: [
          {
            model: Block,
            as: "block",
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
          },
        ],
        order : [["id", 'DESC']]
      });
      return res.sendSuccess(res, villages);
    }
  } catch (error) {
    return res.status(400).json(error);
  }
};

export default fetchVillages;
