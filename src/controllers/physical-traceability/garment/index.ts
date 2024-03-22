import { Request, Response } from "express";
import { Op } from "sequelize";
import PhysicalTraceabilityDataGarment from "../../../models/physical-traceability-data-garment.model";
import PhysicalTraceabilityDataGarmentSample from "../../../models/physical-traceability-data-garment-sample.model";
import Garment from "../../../models/garment.model";
import GarmentProcess from "../../../models/garment-process..model";
import PhysicalPartner from "../../../models/physical-partner.model";

const fetchPhysicalTraceabilityGarmentPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'desc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const whereCondition: any = {};
    const garmentId: string = req.query.garmentId as string;
    const physicalPartnerId: string = req.query.physicalPartnerId as string;

    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { data_of_sample_dispatch: { [Op.iLike]: `%${searchTerm}%` } },
                { operator_name: { [Op.iLike]: `%${searchTerm}%` } }
            ];
        }

        if (garmentId) {
            whereCondition.garment_id = garmentId;
        }
        if (physicalPartnerId) {
            whereCondition.physical_traceability_partner_id = physicalPartnerId;
        }

        const includeRelations = [
            { model: Garment, as: 'garment' },
            { model: GarmentProcess, as: 'garm_process' },
            { model: PhysicalPartner, as: 'physical_traceability_partner' }
        ];

        if (req.query.pagination === "true") {
            const { count, rows } = await PhysicalTraceabilityDataGarment.findAndCountAll({
                where: whereCondition,
                order: [
                    ['id', sortOrder]
                ],
                include: includeRelations,
                offset: offset,
                limit: limit
            });

            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const physicalTraceabilityDataGarment = await PhysicalTraceabilityDataGarment.findAll({
                where: whereCondition,
                order: [
                    ['id', sortOrder]
                ],
                include: includeRelations
            });

            return res.sendSuccess(res, physicalTraceabilityDataGarment);
        }
    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const fetchPhysicalTraceabilityGarment = async (req: Request, res: Response) => {
    try {
        const includeRelations = [
            { model: Garment, as: 'garment' },
            { model: GarmentProcess, as: 'garm_process' },
            { model: PhysicalPartner, as: 'physical_traceability_partner' }
        ];

        const physicalTraceabilityGarment = await PhysicalTraceabilityDataGarment.findOne({
            where: { id: req.params.id },
            include: includeRelations
        });

        const physicalTraceabilityGarmentSample = await PhysicalTraceabilityDataGarmentSample.findAll({
            where: { physical_traceability_data_garment_id: physicalTraceabilityGarment.id }
        });

        return res.sendSuccess(res, { ...physicalTraceabilityGarment.dataValues, physical_traceability_data_garment_sample: physicalTraceabilityGarmentSample });
    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const addPhysicalTraceabilityGarmentResults = async (req: Request, res: Response) => {
    try {
        const physicalTraceabilityGarment = await PhysicalTraceabilityDataGarment.update({
            upload_report: req.body.upload_reports
        }, {
            where: { id: req.body.physicalTraceabilityGarmentId }
        });

        for await (const sample_result of req.body.sample_results) {
            await PhysicalTraceabilityDataGarmentSample.update({
                sample_result: sample_result.value
            }, {
                where: { id: sample_result.id }
            });
        }

        return res.sendSuccess(res, { physicalTraceabilityGarment });
    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const fetchPhysicalTraceabilityGarmentSamplesPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'desc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const whereCondition: any = {};
    const physicalTraceabilityGarmentId: string = req.query.physicalTraceabilityGarmentId as string;

    try {
        whereCondition.physical_traceability_data_garment_id = physicalTraceabilityGarmentId;
        if (searchTerm) {
            whereCondition[Op.or] = [
                { original_sample_status: { [Op.iLike]: `%${searchTerm}%` } },
                { code: { [Op.iLike]: `%${searchTerm}%` } }
            ];
        }

        const includeRelations = [
            { model: PhysicalTraceabilityDataGarment, as: 'physical_traceability_data_garment' }
        ];

        if (req.query.pagination === "true") {
            const { count, rows } = await PhysicalTraceabilityDataGarmentSample.findAndCountAll({
                where: whereCondition,
                order: [
                    ['id', sortOrder]
                ],
                include: includeRelations,
                offset: offset,
                limit: limit
            });

            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const physicalTraceabilityDataGarmentSample = await PhysicalTraceabilityDataGarmentSample.findAll({
                where: whereCondition,
                order: [
                    ['id', sortOrder]
                ],
                include: includeRelations
            });

            return res.sendSuccess(res, physicalTraceabilityDataGarmentSample);
        }
    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

export {
    fetchPhysicalTraceabilityGarmentPagination,
    fetchPhysicalTraceabilityGarment,
    addPhysicalTraceabilityGarmentResults,
    fetchPhysicalTraceabilityGarmentSamplesPagination
}