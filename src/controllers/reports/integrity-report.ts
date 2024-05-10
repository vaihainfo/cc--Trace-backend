import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import OrganicIntegrity from "../../models/organic-integrity.model";
import FarmGroup from "../../models/farm-group.model";
import ICS from "../../models/ics.model";
import Brand from "../../models/brand.model";
import Ginner from "../../models/ginner.model";
import Season from "../../models/season.model";

const getOrganicIntegrityReport = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const sortOrder = req.query.sort || "asc";
  //   const sortField = req.query.sortBy || '';
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const farmGroupId: string = req.query.farmGroupId as string;
  const brandId: string = req.query.brandId as string;
  const seasonId: string = req.query.seasonId as string;
  const whereCondition: any = {};
  try {
    if (farmGroupId) {
      const idArray: number[] = farmGroupId
        .split(",")
        .map((id) => parseInt(id, 10));

      whereCondition.farmGroup_id = { [Op.in]: idArray };
    }
    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id) => parseInt(id, 10));
      whereCondition.brand_id = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id) => parseInt(id, 10));
      whereCondition.season_id = { [Op.in]: idArray };
    }

    // apply search
    if (searchTerm) {
      whereCondition[Op.or] = [
        { test_stage: { [Op.iLike]: `%${searchTerm}%` } },
        { "$farmGroup.name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }


    const reports = await OrganicIntegrity.findAndCountAll({
      attributes: [
        "farmGroup_id",
        "test_stage",
        [Sequelize.col("farmGroup.name"), "farmGroup_name"],
        [Sequelize.col("ginner.name"), "ginner_name"],
        [Sequelize.col("season.name"), "season_name"],
        [
          Sequelize.fn(
            "SUM",
            Sequelize.literal(
              "CASE WHEN integrity_score = TRUE THEN 1 ELSE 0 END"
            )
          ),
          "positives",
        ],
        [
          Sequelize.fn(
            "SUM",
            Sequelize.literal(
              "CASE WHEN integrity_score = FALSE THEN 1 ELSE 0 END"
            )
          ),
          "negatives",
        ],
      ],
      include: [
        {
          model: FarmGroup,
          as: "farmGroup",
          attributes: [],
        },
        {
          model: Ginner,
          as: "ginner",
          attributes: [],
        },
        {
          model: Season,
          as: "season",
          attributes: [],
        },
      ],
      where: whereCondition,
      group: ["farmGroup_id", "ginner.id", "test_stage", Sequelize.col("farmGroup.name"),Sequelize.col("season.name")],
      order: [
        [
          Sequelize.col("farmGroup.name"),
          sortOrder === "desc" ? "DESC" : "ASC",
        ],
      ],
      limit: limit, // Number of records per page
      offset: offset,
    });

    //return required fields
    const formattedReports = reports.rows.map((report: any) => {
      const { farmGroup_id, season_name ,test_stage, farmGroup_name, positives, negatives, ginner_name } =
        report.dataValues;
      const total = Number(positives) + Number(negatives);

      //calculate percentage of negative integrity
      const negativePercentage = Number((negatives / total) * 100);

      return {
        farmGroup_id,
        season_name,
        farmGroup_name,
        test_stage,
        positives,
        negatives,
        ginner_name,
        negativePercentage: negativePercentage.toFixed(2),
      };
    });
    const totalCount = reports.count ? reports.count.length : 0;

    return res.sendPaginationSuccess(res, formattedReports, totalCount);
  } catch (error) {
    console.log(error);
    return res.sendError(res, "NOT_ABLE_TO_GET_INTEGRITY_REPORT");
  }
};

export {
  // fetchTransactionsReport,
  getOrganicIntegrityReport,
};
