import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import ValidationFarmer from "../../models/validation-farmer.model";
import Farmer from "../../models/farmer.model";
import Brand from "../../models/brand.model";
import ICS from "../../models/ics.model";
import FarmGroup from "../../models/farm-group.model";
import Season from "../../models/season.model";
import Transaction from "../../models/transaction.model";
import Ginner from "../../models/ginner.model";
import Farm from "../../models/farm.model";
import sequelize from "../../util/dbConn";

const createValidationFarmer = async (req: Request, res: Response) => {
    try {
        const data = {
            date: req.body.date,
            season_id: req.body.seasonId,
            brand_id: req.body.brandId,
            farmGroup_id: req.body.farmGroupId,
            ics_id: req.body.icsId,
            farmer_id: req.body.farmerId,
            farmer_image: req.body.farmerImage,
            valid_identity: req.body.validIdentity,
            identity_others: req.body.identityOther,
            identity_id: req.body.identityId,
            identity_image: req.body.identityImage,
            cotton_purchaser: req.body.cottonPurchaser,
            market_rate: req.body.marketRate,
            payment_mode: req.body.paymentMode,
            payment_proof: req.body.paymentProof,
            proof_name: req.body.proofName,
            proof_document: req.body.proofDocument,
            is_ginner_supported: req.body.isGinnerSupported,
            ginner_supported_details: req.body.ginnerSupportedDetails,
            ginner_supported_others: req.body.ginnerSupportedOthers,
            support_mode: req.body.supportMode,
            verifier_inference: req.body.verifierInference,
            partially_verified: req.body.partially_verified
        };
        const result = await ValidationFarmer.create(data);
        res.sendSuccess(res, result);
    } catch (error) {
        console.log(error)
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}


const fetchValidationFarmerPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { brandId, icsId, farmGroupId }: any = req.query
    const offset = (page - 1) * limit;
    const whereCondition: any = {}
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by Season name
                { '$farmer.firstName$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by farmer name
                { '$farmGroup.name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by Ics name
                { '$brand.brand_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by Brand name
            ];
        }
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
        if (icsId) {
            const idArray: number[] = icsId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.ics_id = { [Op.in]: idArray };
        }


        let include = [
            {
                model: FarmGroup, as: 'farmGroup',
                attributes: ['id', 'name', 'status']
            },
            {
                model: ICS, as: 'ics',
                attributes: ['id', 'ics_name', 'ics_status']
            },
            {
                model: Brand, as: 'brand',
                attributes: ['id', 'brand_name', 'address']
            },
            {
                model: Farmer, as: 'farmer',
                attributes: ['id', 'firstName', 'lastName', "code"],
            },
            {
                model: Season, as: 'season'
            }
        ]

        //fetch data with pagination
        if (req.query.pagination === 'true') {
            const { count, rows } = await ValidationFarmer.findAndCountAll({
                where: whereCondition,
                include: include,
                offset: offset,
                limit: limit
            });
            let data = [];
            for await (const row of rows){
                const transactions = await Transaction.findAll({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")), 0), 'qty_purchased']
                    ],
                    where: {
                        farmer_id: row?.dataValues?.farmer_id, season_id: row?.dataValues?.season_id
                    },
                    group: ['farmer_id', 'season_id']
                })

                data.push({
                    ...row.dataValues,
                    transactions
                })
            }
            return res.sendPaginationSuccess(res, data, count);
        } else {
            const result = await ValidationFarmer.findAll({
                where: whereCondition,
                include: include
            });
            let data = [];
            for await (const row of result){
                const transactions = await Transaction.findAll({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")), 0), 'qty_purchased']
                    ],
                    where: {
                        farmer_id: row?.dataValues?.farmer_id, season_id: row?.dataValues?.season_id
                    },
                    group: ['farmer_id', 'season_id']
                })

                data.push({
                    ...row.dataValues,
                    transactions
                })
            }
            return res.sendSuccess(res, data);
        }

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const fetchValidationFarmer = async (req: Request, res: Response) => {

    const { id } = req.query

    const whereCondition: any = {}
    try {

        if (id) {
            whereCondition.id = id
        }


        let include = [
            {
                model: FarmGroup, as: 'farmGroup',
                attributes: ['id', 'name', 'status']
            },
            {
                model: ICS, as: 'ics',
                attributes: ['id', 'ics_name', 'ics_status']
            },
            {
                model: Brand, as: 'brand',
                attributes: ['id', 'brand_name', 'address']
            },
            {
                model: Farmer, as: 'farmer',
                attributes: ['id', 'firstName', 'lastName', "code"]
            },
            {
                model: Season, as: 'season'
            }
        ]

        //fetch data with pagination

        const data = await ValidationFarmer.findOne({
            where: whereCondition,
            include: include,
        });
        return res.sendSuccess(res, data);


    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}


const deleteValidationFarmer = async (req: Request, res: Response) => {
    try {
        const result = await ValidationFarmer.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, result);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}


const fetchPremiumFarmer = async (req: Request, res: Response) => {
    try {
        const {seasonId, farmerId}: any = req.query;

        if (!seasonId) {
            return res.sendError(res, 'NEED_SEASON_ID')
        }

        if (!farmerId) {
            return res.sendError(res, 'NEED_FARMER_ID')
        }

        const result = await Transaction.findAll({
            attributes: ["id","date", [Sequelize.literal('"ginner"."name"'), 'ginner_name'], "qty_purchased", "rate"],
            where: {
                farmer_id: farmerId,
                season_id: seasonId
            },
            include: [
                {
                    model: Ginner,
                    as: 'ginner',
                    attributes: ['id', 'name'],
                },
                {
                    model: Season,
                    as: 'season',
                    attributes: ['id', 'name'],
                },
                {
                    model: Farmer,
                    as: "farmer",
                },
                {
                    model: Farm,
                    as: "farm"
                  },
            ],
        });
        res.sendSuccess(res, result);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}


export {
    createValidationFarmer,
    fetchValidationFarmerPagination,
    fetchValidationFarmer,
    deleteValidationFarmer,
    fetchPremiumFarmer
};