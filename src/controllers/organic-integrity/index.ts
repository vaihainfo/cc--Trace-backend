import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import OrganicIntegrity from "../../models/organic-integrity.model";
import FarmGroup from "../../models/farm-group.model";
import ICS from "../../models/ics.model";
import Brand from "../../models/brand.model";
import Ginner from "../../models/ginner.model";
import Farmer from "../../models/farmer.model";


const createOrganicIntegrity = async (req: Request, res: Response) => {
    try {
        const data = {
            date: req.body.date,
            brand_id: req.body.brandId,
            farmGroup_id: req.body.farmGroupId ? req.body.farmGroupId : null,
            ics_id: req.body.icsId ? req.body.icsId : null,
            test_stage: req.body.testStage,
            ginner_id: req.body.ginnerId ? req.body.ginnerId : undefined,
            farmer: req.body.farmer ? req.body.farmer : undefined,
            seal_no: req.body.sealNo,
            sample_code: req.body.sampleCode,
            seed_lot: req.body.seedLot,
            integrity_score: req.body.integrityScore,
            documents: req.body.documents
        };
        const organicIntegrity = await OrganicIntegrity.create(data);
        res.sendSuccess(res, organicIntegrity);
    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const fetchOrganicIntegrityPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { brandId, farmGroupId, icsId, seasonId, ginnerId }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {}
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { test_stage: { [Op.iLike]: `%${searchTerm}%` } }, // Search by test_stage 
                { seal_no: { [Op.iLike]: `%${searchTerm}%` } }, // Search by seal_no
                { sample_code: { [Op.iLike]: `%${searchTerm}%` } }, // Search by sample_code
                { seed_lot: { [Op.iLike]: `%${searchTerm}%` } },// Search by seed_lot
                { '$farmGroup.name$': { [Op.iLike]: `%${searchTerm}%` } },  // Search by farm group name
                { '$ics.ics_name$': { [Op.iLike]: `%${searchTerm}%` } }  // Search by ics name
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
     
        if (ginnerId) {
            const idArray: number[] = ginnerId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.ginner_id = { [Op.in]: idArray };
        }
        
        let include = [
            {
                model: FarmGroup, as: 'farmGroup'
            },
            {
                model: ICS, as: 'ics'
            },
            {
                model: Brand, as: 'brand'
            },
            {
                model: Ginner, as: 'ginner'
            },
            {
                model: Farmer, as: 'farmerdetails'
            }
        ]
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await OrganicIntegrity.findAndCountAll({
                where: whereCondition,
                include: include,
                offset: offset,
                limit: limit
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const data = await OrganicIntegrity.findAll({
                where: whereCondition,
                include: include
            });
            return res.sendSuccess(res, data);
        }
    } catch (error) {
        console.error(error)
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const fetchOrganicIntegrity = async (req: Request, res: Response) => {
    try {
        let include = [
            {
                model: FarmGroup, as: 'farmGroup'
            },
            {
                model: ICS, as: 'ics'
            },
            {
                model: Brand, as: 'brand'
            },
            {
                model: Ginner, as: 'ginner'
            },
            {
                model: Farmer, as: 'farmerdetails'
            }
        ]
        //fetch data with pagination

        const organicIntegrity = await OrganicIntegrity.findOne({
            where: { id: req.query.id },
            include: include
        });
        return res.sendSuccess(res, organicIntegrity);
    } catch (error) {
        console.error(error)
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const updateOrganicIntegrity = async (req: Request, res: Response) => {
    try {
        const organicIntegrity = await OrganicIntegrity.update({
            date: req.body.date,
            brand_id: req.body.brandId,
            farmGroup_id: req.body.farmGroupId ? req.body.farmGroupId : undefined,
            ics_id: req.body.icsId ? req.body.icsId : undefined,
            test_stage: req.body.testStage,
            ginner_id: req.body.ginnerId ? req.body.ginnerId : undefined,
            farmer: req.body.farmer ? req.body.farmer : undefined,
            seal_no: req.body.sealNo,
            sample_code: req.body.sampleCode,
            seed_lot: req.body.seedLot,
            integrity_score: req.body.integrityScore,
            documents: req.body.documents
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, organicIntegrity);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const deleteOrganicIntegrity = async (req: Request, res: Response) => {
    try {
        const organicIntegrity = await OrganicIntegrity.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { organicIntegrity });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}


export {
    createOrganicIntegrity,
    fetchOrganicIntegrityPagination,
    updateOrganicIntegrity,
    deleteOrganicIntegrity,
    fetchOrganicIntegrity
};