import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import ValidationProject from "../../models/validation-project.model";
import Brand from "../../models/brand.model";
import FarmGroup from "../../models/farm-group.model";
import Season from "../../models/season.model";

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
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
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
    deleteValidationProject
};