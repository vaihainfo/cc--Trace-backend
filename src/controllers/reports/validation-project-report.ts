import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import ValidationProject from "../../models/validation-project.model";
import Brand from "../../models/brand.model";
import FarmGroup from "../../models/farm-group.model";
import Season from "../../models/season.model";

const fetchValidationProjectReport = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};

  const farmGroupId: string = req.query.farmGroupId as string;
  const seasonId: string = req.query.seasonId as string;
  const brandId: string = req.query.brandId as string;

  const { endDate, startDate }: any = req.query;

  try {
    if (farmGroupId) {
      const idArray: number[] = farmGroupId
        .split(",")
        .map((id) => parseInt(id, 10));

      whereCondition.farmGroup_id = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id) => parseInt(id, 10));

      whereCondition.season_id = { [Op.in]: idArray };
    }
    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id) => parseInt(id, 10));

      whereCondition.brand_id = { [Op.in]: idArray };
    }

    
    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereCondition.createdAt = { [Op.between]: [startOfDay, endOfDay] }
  }

    let include = [
      {
        model: FarmGroup,
        as: "farmGroup",
        attributes: ["id", "name", "status"],
      },
      {
        model: Brand,
        as: "brand",
        attributes: ["id", "brand_name", "address"],
      },
      {
        model: Season,
        as: "season",
        attributes: ["id", "name"],
      },
    ];

    //fetch data with pagination
    if (req.query.pagination === "true") {
      const { count, rows } = await ValidationProject.findAndCountAll({
        where: whereCondition,
        include: include,
        offset: offset,
        limit: limit,
      });


      const response = await rows.map((row: any) => ({
        ...row.dataValues,
        premium_transfered_cost: row.dataValues.premium_transfered_cost.reduce((acc: any, val: any) => acc + parseFloat(val), 0),
      }))

      return res.sendPaginationSuccess(res, response, count);
    } else {
      const result = await ValidationProject.findAll({
        where: whereCondition,
        include: include,
      });
      return res.sendSuccess(res, result);
    }
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message);
  }
};

export { fetchValidationProjectReport };
