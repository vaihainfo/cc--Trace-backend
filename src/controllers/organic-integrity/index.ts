import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import OrganicIntegrity from "../../models/organic-integrity.model";
import FarmGroup from "../../models/farm-group.model";
import ICS from "../../models/ics.model";
import Brand from "../../models/brand.model";
import Ginner from "../../models/ginner.model";
import Farmer from "../../models/farmer.model";
import Season from "../../models/season.model";


const createOrganicIntegrity = async (req: Request, res: Response) => {
    try {
        const data = {
            date: req.body.date,
            brand_id: req.body.brandId,
            season_id: req.body.seasonId,
            farmGroup_id: req.body.farmGroupId ? req.body.farmGroupId : null,
            ics_id: req.body.icsId ? req.body.icsId : null,
            test_stage: req.body.testStage,
            test_type: req.body.testType,
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
                { test_type: { [Op.iLike]: `%${searchTerm}%` } }, // Search by test_type
                { seal_no: { [Op.iLike]: `%${searchTerm}%` } }, // Search by seal_no
                { sample_code: { [Op.iLike]: `%${searchTerm}%` } }, // Search by sample_code
                { seed_lot: { [Op.iLike]: `%${searchTerm}%` } },// Search by seed_lot
                { '$farmGroup.name$': { [Op.iLike]: `%${searchTerm}%` } },  // Search by farm group name
                { '$ics.ics_name$': { [Op.iLike]: `%${searchTerm}%` } },  // Search by ics name
                { '$ginner.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$farmerdetails.firstName$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$farmerdetails.lastName$': { [Op.iLike]: `%${searchTerm}%` } },
            ];
        }
        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.brand_id = { [Op.in]: idArray };
        }
        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.season_id = { [Op.in]: idArray };
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
            },
            {
                model: Season, as: 'season'
            }
        ]
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await OrganicIntegrity.findAndCountAll({
                where: whereCondition,
                include: include,
                offset: offset,
                limit: limit,
                order: [["date", "desc"]]
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
            },
            {
                model: Season, as: 'season'
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
            season_id: req.body.seasonId,
            brand_id: req.body.brandId,
            farmGroup_id: req.body.farmGroupId ? req.body.farmGroupId : undefined,
            ics_id: req.body.icsId ? req.body.icsId : undefined,
            test_stage: req.body.testStage,
            test_type: req.body.testType,
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

const updateReportOrganicIntegrity = async (req: Request, res: Response) => {
    try {
        let updatedData = []
        for await (const update of req.body) {
            if (!update.id || !update.uploaded_reports) {
                throw new Error(`Missing id or uploaded_reports for record`);
            }

            const result = await OrganicIntegrity.update(
                { uploaded_reports: update.uploaded_reports },
                { where: { id: update.id } }
            );
            updatedData.push({
                data: result
            });
        }

        res.sendSuccess(res, updatedData);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const deleteReportFromOrganicIntegrity = async (req: Request, res: Response) => {
    try {
        const { id, reportToDelete } = req.body;

        if (!id || !reportToDelete) {
            return res.sendError(res, "Missing id or name of the report");
        }

        const organicIntegrity = await OrganicIntegrity.findOne({ where: { id } });

        if (!organicIntegrity) {
            return res.sendError(res, "Record not found.");
        }
        let currentReports = organicIntegrity.uploaded_reports || [];

        currentReports = currentReports.filter((report: string) => report !== reportToDelete);

        const result =  await OrganicIntegrity.update(
            { uploaded_reports: currentReports },
            { where: { id } }
        );

        res.sendSuccess(res, {...result, msg: "Report deleted successfully."});
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};


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
    updateReportOrganicIntegrity,
    deleteOrganicIntegrity,
    fetchOrganicIntegrity,
    deleteReportFromOrganicIntegrity
};