import { Request, Response } from "express";
import { Op } from "sequelize";
import PhysicalTraceabilityDataWeaver from "../../../models/physical-traceability-data-weaver.model";
import PhysicalTraceabilityDataWeaverSample from "../../../models/physical-traceability-data-weaver-sample.model";
import Weaver from "../../../models/weaver.model";
import WeaverProcess from "../../../models/weaver-process.model";
import PhysicalPartner from "../../../models/physical-partner.model";

const fetchPhysicalTraceabilityWeaverPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'desc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const whereCondition: any = {};
    const weaverId: string = req.query.weaverId as string;
    const physicalPartnerId: string = req.query.physicalPartnerId as string;

    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { data_of_sample_dispatch: { [Op.iLike]: `%${searchTerm}%` } },
                { operator_name: { [Op.iLike]: `%${searchTerm}%` } }
            ];
        }

        if (weaverId) {
            whereCondition.weaver_id = weaverId;
        }
        if (physicalPartnerId) {
            whereCondition.physical_traceability_partner_id = physicalPartnerId;
        }

        const includeRelations = [
            { model: Weaver, as: 'weaver' },
            { model: WeaverProcess, as: 'weav_process' },
            { model: PhysicalPartner, as: 'physical_traceability_partner' }
        ];

        if (req.query.pagination === "true") {
            const { count, rows } = await PhysicalTraceabilityDataWeaver.findAndCountAll({
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
            const physicalTraceabilityDataWeaver = await PhysicalTraceabilityDataWeaver.findAll({
                where: whereCondition,
                order: [
                    ['id', sortOrder]
                ],
                include: includeRelations
            });

            return res.sendSuccess(res, physicalTraceabilityDataWeaver);
        }
    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const fetchPhysicalTraceabilityWeaver = async (req: Request, res: Response) => {
    try {
        const includeRelations = [
            { model: Weaver, as: 'weaver' },
            { model: WeaverProcess, as: 'weav_process' },
            { model: PhysicalPartner, as: 'physical_traceability_partner' }
        ];

        const physicalTraceabilityWeaver = await PhysicalTraceabilityDataWeaver.findOne({
            where: { id: req.params.id },
            include: includeRelations
        });

        const physicalTraceabilityWeaverSample = await PhysicalTraceabilityDataWeaverSample.findAll({
            where: { physical_traceability_data_weaver_id: physicalTraceabilityWeaver.id }
        });

        return res.sendSuccess(res, { ...physicalTraceabilityWeaver.dataValues, physical_traceability_data_weaver_sample: physicalTraceabilityWeaverSample });
    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const addPhysicalTraceabilityWeaverResults = async (req: Request, res: Response) => {
    try {
        const physicalTraceabilityWeaver = await PhysicalTraceabilityDataWeaver.update({
            upload_report: req.body.upload_reports
        }, {
            where: { id: req.body.physicalTraceabilityWeaverId }
        });

        for await (const sample_result of req.body.sample_results) {
            await PhysicalTraceabilityDataWeaverSample.update({
                sample_result: sample_result.value
            }, {
                where: { id: sample_result.id }
            });
        }

        return res.sendSuccess(res, { physicalTraceabilityWeaver });
    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const fetchPhysicalTraceabilityWeaverSamplesPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'desc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const whereCondition: any = {};
    const physicalTraceabilityWeaverId: string = req.query.physicalTraceabilityWeaverId as string;

    try {
        whereCondition.physical_traceability_data_weaver_id = physicalTraceabilityWeaverId;
        if (searchTerm) {
            whereCondition[Op.or] = [
                { original_sample_status: { [Op.iLike]: `%${searchTerm}%` } },
                { code: { [Op.iLike]: `%${searchTerm}%` } }
            ];
        }

        const includeRelations = [
            { model: PhysicalTraceabilityDataWeaver, as: 'physical_traceability_data_weaver' }
        ];

        if (req.query.pagination === "true") {
            const { count, rows } = await PhysicalTraceabilityDataWeaverSample.findAndCountAll({
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
            const physicalTraceabilityDataWeaverSample = await PhysicalTraceabilityDataWeaverSample.findAll({
                where: whereCondition,
                order: [
                    ['id', sortOrder]
                ],
                include: includeRelations
            });

            return res.sendSuccess(res, physicalTraceabilityDataWeaverSample);
        }
    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

export {
    fetchPhysicalTraceabilityWeaverPagination,
    fetchPhysicalTraceabilityWeaver,
    addPhysicalTraceabilityWeaverResults,
    fetchPhysicalTraceabilityWeaverSamplesPagination
}