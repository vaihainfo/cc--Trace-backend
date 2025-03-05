import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import ValidationProject from "../../models/validation-project.model";
import Brand from "../../models/brand.model";
import FarmGroup from "../../models/farm-group.model";
import Season from "../../models/season.model";
import Farmer from "../../models/farmer.model";
import Farm from "../../models/farm.model";
import Transaction from "../../models/transaction.model";
import sequelize from "../../util/dbConn";
import GinSales from "../../models/gin-sales.model";
import Ginner from "../../models/ginner.model";

const createValidationProject = async (req: Request, res: Response) => {
    try {
        const data = {
            date: req.body.date,
            season_id: req.body.seasonId,
            brand_id: req.body.brandId,
            farmGroup_id: req.body.farmGroupId,
            no_of_farmers: req.body.noOfFarmers,
            cotton_purchased: req.body.cottonPurchased,
            qty_of_lint_sold: req.body.qtyOfLintSold ? req.body.qtyOfLintSold : undefined,
            premium_recieved: req.body.premiumRecieved,
            premium_transfered: req.body.premiumTransfered,
            premium_transfered_name: req.body.premiumTransferedName,
            premium_transfered_cost: req.body.premiumTransferedCost,
            avg_purchase_price: req.body.avgPurchasePrice,
            avg_market_price: req.body.avgMarketPrice,
            price_variance: req.body.priceVariance,
            calculated_avg_variance: req.body.calculatedAvgVariance,
            premium_transfer_claim: req.body.premiumTransferClaim,
            claim_variance: req.body.claimVariance
        };
        const result = await ValidationProject.create(data);
        res.sendSuccess(res, result);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}


const fetchValidationProjectPagination = async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { brandId, farmGroupId }: any = req.query
    const offset = (page - 1) * limit;
    const whereCondition: any = {}
    try {
        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.brand_id = { [Op.in]: idArray };
        }

        if (farmGroupId) {
            const idArray: number[] = farmGroupId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.farmGroup_id = { [Op.in]: idArray };
        }

        let include = [
            {
                model: FarmGroup, as: 'farmGroup',
                attributes: ['id', 'name', 'status']
            },
            {
                model: Brand, as: 'brand',
                attributes: ['id', 'brand_name', 'address']
            },
            {
                model: Season, as: 'season',
                attributes: ['id', 'name']
            }
        ]

        //fetch data with pagination
        if (req.query.pagination === 'true') {
            const { count, rows } = await ValidationProject.findAndCountAll({
                where: whereCondition,
                order: [['id', 'desc']],
                include: include,
                offset: offset,
                limit: limit
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const result = await ValidationProject.findAll({
                where: whereCondition,
                include: include

            });
            return res.sendSuccess(res, result);
        }

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const fetchValidation = async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    try {

        let include = [
            {
                model: FarmGroup, as: 'farmGroup',
                attributes: ['id', 'name', 'status']
            },
            {
                model: Brand, as: 'brand',
                attributes: ['id', 'brand_name', 'address']
            },
            {
                model: Season, as: 'season',
                attributes: ['id', 'name']
            }
        ]

        //fetch data with pagination
        const result = await ValidationProject.findByPk(req.query.id, {
            include: include
        });
        return res.sendSuccess(res, result);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const fetchProcuredData = async (req: Request, res: Response) => {
  try {
    let { seasonId, brandId, farmGroupId }: any = req.query;
    let whereCondition = {};

    if (!seasonId) {
      return res.sendError(res, "NEED_SEASON_ID");
    }

    if (!brandId) {
      return res.sendError(res, "NEED_BRAND_ID");
    }
    if (!farmGroupId) {
      return res.sendError(res, "NEED_FARMGROUP_ID");
    }

    if (brandId) {
      whereCondition = { "$farmer.brand_id$": brandId };
    }
    if (seasonId) {
      whereCondition = { season_id: seasonId };
    }
    if (farmGroupId) {
      whereCondition = { "$farmer.farmGroup_id$": farmGroupId };
    }

    const noOfFarmers = await Farm.findOne({
      where: whereCondition,
      attributes: [
        [
          Sequelize.fn("COUNT", Sequelize.literal("DISTINCT farmer_id")),
          "total_farmers",
        ],
      ],
      include: [
        {
          model: Farmer,
          as: "farmer",
          attributes: [],
        },
        {
          model: Season,
          as: "season",
          attributes: [],
        },
      ],
      group: ["farmer.brand_id", "farmer.farmGroup_id", "season_id"],
    });

    const procuredQty = await Transaction.findOne({
      attributes: [
        [
          sequelize.fn(
            "sum",
            Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")
          ),
          "procurement_seed_cotton",
        ],
      ],
      where: {
        "$farmer.brand_id$": brandId,
        "$farmer.farmGroup_id$": farmGroupId,
        "$farm.season_id$": seasonId,
      },
      include: [
        {
          model: Farmer,
          as: "farmer",
          attributes: [],
        },
        {
          model: Farm,
          as: "farm",
          attributes: [],
        },
      ],
      group: ["farmer.brand_id", "farmer.farmGroup_id", "farm.season_id"],
    });

    const lintSold = await GinSales.findOne({
      attributes: [
        [
          sequelize.fn("sum", Sequelize.literal("total_qty")),
          "total_qty_lint_sold",
        ],
      ],
      where: {
        season_id: seasonId,
        status: "Sold",
      },
      include: [
        {
          model: Ginner,
          as: "ginner",
          attributes: [],
          brand: { [Op.contains]: [brandId] },
        },
      ],
      group: ["season_id"],
    });

    let data: any = {
      noOfFarmers,
      procuredQty,
      lintSold,
    };

    res.sendSuccess(res, data);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const deleteValidationProject = async (req: Request, res: Response) => {
    try {
        const result = await ValidationProject.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, result);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}


export {
    createValidationProject,
    fetchValidationProjectPagination,
    fetchValidation,
    deleteValidationProject,
    fetchProcuredData
};