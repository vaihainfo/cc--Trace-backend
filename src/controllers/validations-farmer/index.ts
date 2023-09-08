import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import ValidationFarmer from "../../models/validation-farmer.model";
import Farmer from "../../models/farmer.model";
import Brand from "../../models/brand.model";
import ICS from "../../models/ics.model";
import FarmGroup from "../../models/farm-group.model";

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
    const { brandId, icsId, farmGroupId } = req.query
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
            whereCondition.brand_id = brandId
        }
        if (icsId) {
            whereCondition.ics_id = icsId
        }
        if (farmGroupId) {
            whereCondition.farmGroup_id = farmGroupId
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
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const result = await ValidationFarmer.findAll({
                where: whereCondition,
                include: include
            });
            return res.sendSuccess(res, result);
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


export {
    createValidationFarmer,
    fetchValidationFarmerPagination,
    fetchValidationFarmer,
    deleteValidationFarmer
};