import { Request, Response } from "express";
import { Op } from "sequelize";
import PhysicalTraceabilityDataSpinner from "../../../models/physical-traceability-data-spinner.model";
import PhysicalTraceabilityDataSpinnerSample from "../../../models/physical-traceability-data-spinner-sample.model";
import Spinner from "../../../models/spinner.model";
import SpinProcess from "../../../models/spin-process.model";
import PhysicalPartner from "../../../models/physical-partner.model";

const fetchPhysicalTraceabilitySpinnerPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'desc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const whereCondition: any = {};
    const spinnerId: string = req.query.spinnerId as string;
    const physicalPartnerId: string = req.query.physicalPartnerId as string;

    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { data_of_sample_dispatch: { [Op.iLike]: `%${searchTerm}%` } },
                { operator_name: { [Op.iLike]: `%${searchTerm}%` } },
                { healixa_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { '$spin_process.batch_lot_no$': { [Op.iLike]: `%${searchTerm}%` } }
            ];
        }

        if (spinnerId) {
            whereCondition.spinner_id = spinnerId;
        }
        if (physicalPartnerId) {
            whereCondition.physical_traceability_partner_id = physicalPartnerId;
        }

        const includeRelations = [
            { model: Spinner, as: 'spinner' },
            { model: SpinProcess, as: 'spin_process' },
            { model: PhysicalPartner, as: 'physical_traceability_partner' }
        ];

        if (req.query.pagination === "true") {
            const { count, rows } = await PhysicalTraceabilityDataSpinner.findAndCountAll({
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
            const physicalTraceabilityDataSpinner = await PhysicalTraceabilityDataSpinner.findAll({
                where: whereCondition,
                order: [
                    ['id', sortOrder]
                ],
                include: includeRelations
            });

            return res.sendSuccess(res, physicalTraceabilityDataSpinner);
        }
    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const fetchPhysicalTraceabilitySpinner = async (req: Request, res: Response) => {
    try {
        const includeRelations = [
            { model: Spinner, as: 'spinner' },
            { model: SpinProcess, as: 'spin_process' },
            { model: PhysicalPartner, as: 'physical_traceability_partner' }
        ];

        const physicalTraceabilitySpinner = await PhysicalTraceabilityDataSpinner.findOne({
            where: { id: req.params.id },
            include: includeRelations
        });

        const physicalTraceabilitySpinnerSample = await PhysicalTraceabilityDataSpinnerSample.findAll({
            where: { physical_traceability_data_spinner_id: physicalTraceabilitySpinner.id }
        });
        
        const responseData = {
            ...physicalTraceabilitySpinner.dataValues,
            haelixa_id: physicalTraceabilitySpinner.haelixa_id, 
            physical_traceability_data_spinner_sample: physicalTraceabilitySpinnerSample
        };

        return res.sendSuccess(res, responseData);
    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const addPhysicalTraceabilitySpinnerResults = async (req: Request, res: Response) => {
    try {
        const physicalTraceabilitySpinner = await PhysicalTraceabilityDataSpinner.update({
            upload_report: req.body.upload_reports
        }, {
            where: { id: req.body.physicalTraceabilitySpinnerId }
        });

        for await (const sample_result of req.body.sample_results) {
            await PhysicalTraceabilityDataSpinnerSample.update({
                sample_result: sample_result.value
            }, {
                where: { id: sample_result.id }
            });
        }

        return res.sendSuccess(res, { physicalTraceabilitySpinner });
    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const fetchPhysicalTraceabilitySpinnerSamplesPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'desc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const whereCondition: any = {};
    const physicalTraceabilitySpinnerId: string = req.query.physicalTraceabilitySpinnerId as string;

    try {
        whereCondition.physical_traceability_data_spinner_id = physicalTraceabilitySpinnerId;
        if (searchTerm) {
            whereCondition[Op.or] = [
                { original_sample_status: { [Op.iLike]: `%${searchTerm}%` } },
                { code: { [Op.iLike]: `%${searchTerm}%` } }
            ];
        }

        const includeRelations = [
            { model: PhysicalTraceabilityDataSpinner, as: 'physical_traceability_data_spinner' }
        ];

        if (req.query.pagination === "true") {
            const { count, rows } = await PhysicalTraceabilityDataSpinnerSample.findAndCountAll({
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
            const physicalTraceabilityDataSpinnerSample = await PhysicalTraceabilityDataSpinnerSample.findAll({
                where: whereCondition,
                order: [
                    ['id', sortOrder]
                ],
                include: includeRelations
            });

            return res.sendSuccess(res, physicalTraceabilityDataSpinnerSample);
        }
    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

export {
    fetchPhysicalTraceabilitySpinnerPagination,
    fetchPhysicalTraceabilitySpinner,
    addPhysicalTraceabilitySpinnerResults,
    fetchPhysicalTraceabilitySpinnerSamplesPagination
}