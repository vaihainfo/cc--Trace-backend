import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import Transaction from "../../models/transaction.model";
import District from "../../models/district.model";
import State from "../../models/state.model";
import Country from "../../models/country.model";
import Block from "../../models/block.model";
import Village from "../../models/village.model";
import Brand from "../../models/brand.model";
import Farmer from "../../models/farmer.model";
import Program from "../../models/program.model";
import Ginner from "../../models/ginner.model";
import Season from "../../models/season.model";
import CropGrade from "../../models/crop-grade.model";


const fetchTransactionsReport = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const sortOrder = req.query.sort || "desc";
  //   const sortField = req.query.sortBy || '';
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const countryId: string = req.query.countryId as string;
  const brandId: string = req.query.brandId as string;
  const farmGroupId: string = req.query.farmGroupId as string;
  const seasonId: string = req.query.seasonId as string;
  const programId: string = req.query.programId as string;
  const ginnerId: string = req.query.ginnerId as string;

  const whereCondition: any = {};

  try {
    // apply filters
    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id) => parseInt(id, 10));
      whereCondition.country_id = { [Op.in]: idArray };
    }
    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id) => parseInt(id, 10));
      whereCondition.brand_id = { [Op.in]: idArray };
    }
    if (farmGroupId) {
      const idArray: number[] = farmGroupId
        .split(",")
        .map((id) => parseInt(id, 10));
      whereCondition["$farmer.farmGroup_id$"] = { [Op.in]: idArray };
    }
    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id) => parseInt(id, 10));
      whereCondition.season_id = { [Op.in]: idArray };
    }

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id) => parseInt(id, 10));
      whereCondition.program_id = { [Op.in]: idArray };
    }

    if (ginnerId) {
      const idArray: number[] = ginnerId
        .split(",")
        .map((id) => parseInt(id, 10));
      whereCondition.mapped_ginner = { [Op.in]: idArray };
    }

    // apply search
    if (searchTerm) {
      whereCondition[Op.or] = [
        { farmer_code: { [Op.iLike]: `%${searchTerm}%` } },
        { total_amount: { [Op.iLike]: `%${searchTerm}%` } },
        { "$block.block_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$country.county_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$state.state_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$village.village_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$district.district_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$farmer.firstName$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    whereCondition.status = 'Sold';
    let queryOptions: any = {
      where: whereCondition,
      include: [
        {
          model: Village,
          as: "village",
          attributes: [
            "id",
            "village_name"
          ],
        },
        {
          model: Block,
          as: "block",
          attributes: [
            "id",
            "block_name"
          ],
        },
        {
          model: District,
          as: "district",
          attributes: [
            "id",
            "district_name"
          ],
        },
        {
          model: State,
          as: "state",
          attributes: [
            "id",
            "state_name"
          ],
        },
        {
          model: Country,
          as: "country",
          attributes: [
            "id",
            "county_name"
          ],
        },
        {
          model: Farmer,
          as: "farmer",
        },
        {
          model: Program,
          as: "program",
          attributes: [
            "id",
            "program_name"
          ],
        },
        {
          model: Season,
          as: "season",
          attributes: [
            "id",
            "name"
          ],
        },
        {
          model: Brand,
          as: "brand",
        },
        {
          model: Ginner,
          as: "ginner",
        },
        {
          model: CropGrade,
          as: "grade",
          attributes: [
            "id",
            "cropGrade"
          ],
        },
      ],
    };

    if (sortOrder === "asc" || sortOrder === "desc") {
      queryOptions.order = [["id", sortOrder]];
    }


    // apply pagination
    if (req.query.pagination === "true") {
      queryOptions.offset = offset;
      queryOptions.limit = limit;

      const { count, rows } = await Transaction.findAndCountAll(queryOptions);

      return res.sendPaginationSuccess(res, rows, count);
    } else {
      // fetch without filters
      const transaction = await Transaction.findAll(queryOptions);
      return res.sendSuccess(res, transaction);
    }
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

// total procured quantity with respective programs
const fetchSumOfQtyPurchasedByProgram = async (req: Request, res: Response) => {
  try {
    const sumByProgram = await Transaction.findAll({
      where: { status: 'Sold' },
      attributes: [
        "program_id",
        [Sequelize.col("program.program_name"), "program_name"],
        [Sequelize.fn("sum", Sequelize.cast(Sequelize.col("qty_purchased"), "decimal")), "total_qty_purchased"],
      ],
      include: [
        {
          model: Program,
          as: 'program',
          attributes: [],
        },
      ],
      group: ["program_id", Sequelize.col("program.program_name")],
    });

    return res.sendSuccess(res, sumByProgram);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

export {
  fetchTransactionsReport,
  fetchSumOfQtyPurchasedByProgram
};