import { Request, Response } from "express";
import { Op } from "sequelize";
import PhysicalTraceabilityDataGinner from "../../../models/physical-traceability-data-ginner.model";
import PhysicalTraceabilityDataGinnerSample from "../../../models/physical-traceability-data-ginner-sample.model";
import Ginner from "../../../models/ginner.model";
import GinProcess from "../../../models/gin-process.model";
import PhysicalPartner from "../../../models/physical-partner.model";

const fetchPhysicalTraceabilityGinnerPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'desc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const whereCondition: any = {};
    const ginnerId: string = req.query.ginnerId as string;
    const physicalPartnerId: string = req.query.physicalPartnerId as string;

    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { data_of_sample_dispatch: { [Op.iLike]: `%${searchTerm}%` } },
                { operator_name: { [Op.iLike]: `%${searchTerm}%` } },
                { cotton_connect_executive_name: { [Op.iLike]: `%${searchTerm}%` } },
                { healixa_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { '$gin_process.lot_no$': { [Op.iLike]: `%${searchTerm}%` } }
            ];
        }

        if (ginnerId) {
            whereCondition.ginner_id = ginnerId;
        }
        if (physicalPartnerId) {
            whereCondition.physical_traceability_partner_id = physicalPartnerId;
        }

        const includeRelations = [
            { model: Ginner, as: 'ginner' },
            { model: GinProcess, as: 'gin_process' },
            { model: PhysicalPartner, as: 'physical_traceability_partner' }
        ];

        if (req.query.pagination === "true") {
            const { count, rows } = await PhysicalTraceabilityDataGinner.findAndCountAll({
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
            const physicalTraceabilityDataGinner = await PhysicalTraceabilityDataGinner.findAll({
                where: whereCondition,
                order: [
                    ['id', sortOrder]
                ],
                include: includeRelations
            });

            return res.sendSuccess(res, physicalTraceabilityDataGinner);
        }
    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const fetchPhysicalTraceabilityGinner = async (req: Request, res: Response) => {
    try {
        const includeRelations = [
            { model: Ginner, as: 'ginner' },
            { model: GinProcess, as: 'gin_process' },
            { model: PhysicalPartner, as: 'physical_traceability_partner' }
        ];

        const physicalTraceabilityGinner = await PhysicalTraceabilityDataGinner.findOne({
            where: { id: req.params.id },
            include: includeRelations
        });

        const physicalTraceabilityGinnerSample = await PhysicalTraceabilityDataGinnerSample.findAll({
            where: { physical_traceability_data_ginner_id: physicalTraceabilityGinner.id }
        });

        return res.sendSuccess(res, { ...physicalTraceabilityGinner.dataValues, physical_traceability_data_ginner_sample: physicalTraceabilityGinnerSample });
    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const addPhysicalTraceabilityGinnerResults = async (req: Request, res: Response) => {
    try {
        const physicalTraceabilityGinner = await PhysicalTraceabilityDataGinner.update({
            upload_report: req.body.upload_reports
        }, {
            where: { id: req.body.physicalTraceabilityGinnerId }
        });

        for await (const sample_result of req.body.sample_results) {
            await PhysicalTraceabilityDataGinnerSample.update({
                sample_result: sample_result.value
            }, {
                where: { id: sample_result.id }
            });
        }

        return res.sendSuccess(res, { physicalTraceabilityGinner });
    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const fetchPhysicalTraceabilityGinnerSamplesPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'desc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const whereCondition: any = {};
    const physicalTraceabilityGinnerId: string = req.query.physicalTraceabilityGinnerId as string;

    try {
        whereCondition.physical_traceability_data_ginner_id = physicalTraceabilityGinnerId;
        if (searchTerm) {
            whereCondition[Op.or] = [
                { original_sample_status: { [Op.iLike]: `%${searchTerm}%` } },
                { code: { [Op.iLike]: `%${searchTerm}%` } }
            ];
        }

        const includeRelations = [
            { model: PhysicalTraceabilityDataGinner, as: 'physical_traceability_data_ginner' }
        ];

        if (req.query.pagination === "true") {
            const { count, rows } = await PhysicalTraceabilityDataGinnerSample.findAndCountAll({
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
            const physicalTraceabilityDataGinnerSample = await PhysicalTraceabilityDataGinnerSample.findAll({
                where: whereCondition,
                order: [
                    ['id', sortOrder]
                ],
                include: includeRelations
            });

            return res.sendSuccess(res, physicalTraceabilityDataGinnerSample);
        }
    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

export {
    fetchPhysicalTraceabilityGinnerPagination,
    fetchPhysicalTraceabilityGinner,
    addPhysicalTraceabilityGinnerResults,
    fetchPhysicalTraceabilityGinnerSamplesPagination
}