import { Request, Response } from "express";
import { Op } from "sequelize";
import PhysicalTraceabilityDataKnitter from "../../../models/physical-traceability-data-knitter.model";
import PhysicalTraceabilityDataKnitterSample from "../../../models/physical-traceability-data-knitter-sample.model";
import Knitter from "../../../models/knitter.model";
import KnitProcess from "../../../models/knit-process.model";
import PhysicalPartner from "../../../models/physical-partner.model";

const fetchPhysicalTraceabilityKnitterPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'desc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const whereCondition: any = {};
    const knitterId: string = req.query.knitterId as string;
    const physicalPartnerId: string = req.query.physicalPartnerId as string;

    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { data_of_sample_dispatch: { [Op.iLike]: `%${searchTerm}%` } },
                { operator_name: { [Op.iLike]: `%${searchTerm}%` } }
            ];
        }

        if (knitterId) {
            whereCondition.knitter_id = knitterId;
        }
        if (physicalPartnerId) {
            whereCondition.physical_traceability_partner_id = physicalPartnerId;
        }

        const includeRelations = [
            { model: Knitter, as: 'knitter' },
            { model: KnitProcess, as: 'knit_process' },
            { model: PhysicalPartner, as: 'physical_traceability_partner' }
        ];

        if (req.query.pagination === "true") {
            const { count, rows } = await PhysicalTraceabilityDataKnitter.findAndCountAll({
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
            const physicalTraceabilityDataKnitter = await PhysicalTraceabilityDataKnitter.findAll({
                where: whereCondition,
                order: [
                    ['id', sortOrder]
                ],
                include: includeRelations
            });

            return res.sendSuccess(res, physicalTraceabilityDataKnitter);
        }
    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const fetchPhysicalTraceabilityKnitter = async (req: Request, res: Response) => {
    try {
        const includeRelations = [
            { model: Knitter, as: 'knitter' },
            { model: KnitProcess, as: 'knit_process' },
            { model: PhysicalPartner, as: 'physical_traceability_partner' }
        ];

        const physicalTraceabilityKnitter = await PhysicalTraceabilityDataKnitter.findOne({
            where: { id: req.params.id },
            include: includeRelations
        });

        const physicalTraceabilityKnitterSample = await PhysicalTraceabilityDataKnitterSample.findAll({
            where: { physical_traceability_data_knitter_id: physicalTraceabilityKnitter.id }
        });

        return res.sendSuccess(res, { ...physicalTraceabilityKnitter.dataValues, physical_traceability_data_knitter_sample: physicalTraceabilityKnitterSample });
    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const addPhysicalTraceabilityKnitterResults = async (req: Request, res: Response) => {
    try {
        const physicalTraceabilityKnitter = await PhysicalTraceabilityDataKnitter.update({
            upload_report: req.body.upload_reports
        }, {
            where: { id: req.body.physicalTraceabilityKnitterId }
        });

        for await (const sample_result of req.body.sample_results) {
            await PhysicalTraceabilityDataKnitterSample.update({
                sample_result: sample_result.value
            }, {
                where: { id: sample_result.id }
            });
        }

        return res.sendSuccess(res, { physicalTraceabilityKnitter });
    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const fetchPhysicalTraceabilityKnitterSamplesPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'desc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const whereCondition: any = {};
    const physicalTraceabilityKnitterId: string = req.query.physicalTraceabilityKnitterId as string;

    try {
        whereCondition.physical_traceability_data_knitter_id = physicalTraceabilityKnitterId;
        if (searchTerm) {
            whereCondition[Op.or] = [
                { original_sample_status: { [Op.iLike]: `%${searchTerm}%` } },
                { code: { [Op.iLike]: `%${searchTerm}%` } }
            ];
        }

        const includeRelations = [
            { model: PhysicalTraceabilityDataKnitter, as: 'physical_traceability_data_knitter' }
        ];

        if (req.query.pagination === "true") {
            const { count, rows } = await PhysicalTraceabilityDataKnitterSample.findAndCountAll({
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
            const physicalTraceabilityDataKnitterSample = await PhysicalTraceabilityDataKnitterSample.findAll({
                where: whereCondition,
                order: [
                    ['id', sortOrder]
                ],
                include: includeRelations
            });

            return res.sendSuccess(res, physicalTraceabilityDataKnitterSample);
        }
    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

export {
    fetchPhysicalTraceabilityKnitterPagination,
    fetchPhysicalTraceabilityKnitter,
    addPhysicalTraceabilityKnitterResults,
    fetchPhysicalTraceabilityKnitterSamplesPagination
}