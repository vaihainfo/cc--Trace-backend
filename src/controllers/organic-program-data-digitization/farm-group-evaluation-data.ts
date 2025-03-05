import { Request, Response } from "express";
import { Op } from "sequelize";
import FarmGroupEvaluation from "../../models/farm-group-evaluation.model";
import Season from "../../models/season.model";
import FarmGroup from "../../models/farm-group.model";
import Brand from "../../models/brand.model";
import Farmer from "../../models/farmer.model";

const createFarmGroupEvaluationData = async (req: Request, res: Response) => {
    try {
        let { farm_group_type, farm_group_id, farm_group_name, ...farmGroupEvaluationData } = req.body.data;

        if (farm_group_type === "NEW") {
            const data = {
                brand_id: req.body.data.brand_id,
                name: farm_group_name,
                status: true,
            };
            const farmGroup = await FarmGroup.create(data);
            farm_group_id = farmGroup.id;
        }

        const data = {
            ...farmGroupEvaluationData,
            farm_group_id
        };
        const farmGroupEvaluation = await FarmGroupEvaluation.create(data);
        res.sendSuccess(res, farmGroupEvaluation);
    } catch (error) {
        console.error(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const fetchFarmGroupEvaluationDataPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'desc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const brand_id = Number(req.query.brand_id);
    const farm_group_id = Number(req.query.farm_group_id);

    try {
        const whereCondition: any = {};
        const includeRelations = [
            {
                model: Season,
                as: "season",
            },
            {
                model: FarmGroup,
                as: "farm_group"
            },
            {
                model: Brand,
                as: "brand"
            }
        ];

        if (searchTerm) {
            whereCondition[Op.or] = [
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { agronomist_name: { [Op.iLike]: `%${searchTerm}%` } },
                { '$farm_group.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { address: { [Op.iLike]: `%${searchTerm}%` } },
                { registration_details: { [Op.iLike]: `%${searchTerm}%` } },
                { company_type: { [Op.iLike]: `%${searchTerm}%` } },
                { parent_company_name: { [Op.iLike]: `%${searchTerm}%` } },
                { owner_name: { [Op.iLike]: `%${searchTerm}%` } },
                { establishment_year: { [Op.iLike]: `%${searchTerm}%` } }
            ];
        }

        if (brand_id) {
            whereCondition.brand_id = { [Op.eq]: brand_id };
        }

        if (farm_group_id) {
            whereCondition.farm_group_id = { [Op.eq]: farm_group_id };
        }

        if (req.query.pagination === "true") {
            const { count, rows } = await FarmGroupEvaluation.findAndCountAll({
                where: whereCondition,
                include: includeRelations,
                order: [
                    ['id', sortOrder]
                ],
                offset: offset,
                limit: limit
            });

            return res.sendPaginationSuccess(res, rows, count);
        } else {
            let farmGroupEvaluation = await FarmGroupEvaluation.findAll({
                where: whereCondition,
                include: includeRelations,
                order: [
                    ['id', sortOrder]
                ],
            });

            return res.sendSuccess(res, farmGroupEvaluation);
        }
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

const fetchFarmGroupEvaluationData = async (req: Request, res: Response) => {
    try {
        const includeRelations = [
            {
                model: Season,
                as: "season",
            },
            {
                model: FarmGroup,
                as: "farm_group"
            },
            {
                model: Brand,
                as: "brand"
            }
        ];

        const farmGroupEvaluation = await FarmGroupEvaluation.findOne({
            where: { id: req.params.id },
            include: includeRelations
        });
        return res.sendSuccess(res, farmGroupEvaluation);
    } catch (error) {
        console.error(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const updateFarmGroupEvaluationData = async (req: Request, res: Response) => {
    try {
        let { farm_group_type, farm_group_id, farm_group_name, ...farmGroupEvaluationData } = req.body.data;

        if (farm_group_type === "NEW") {
            const data = {
                brand_id: req.body.data.brand_id,
                name: farm_group_name,
                status: true,
            };
            const farmGroup = await FarmGroup.create(data);
            farm_group_id = farmGroup.id;
        }

        const data = {
            ...farmGroupEvaluationData,
            farm_group_id
        };
        const farmGroupEvaluation = await FarmGroupEvaluation.update(data, {
            where: { id: req.body.id }
        });

        res.sendSuccess(res, { farmGroupEvaluation });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const deleteFarmGroupEvaluationData = async (req: Request, res: Response) => {
    try {
        const farmGroupEvaluation = await FarmGroupEvaluation.destroy({
            where: { id: req.body.id }
        });
        res.sendSuccess(res, { farmGroupEvaluation });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const countFarmerByBrandAndFarmGroup = async (req: Request, res: Response) => {
    try {
        let whereCondition: any = {};
        if (req.query.brand_id) {
            whereCondition.brand_id = req.query.brand_id;
        }
        if (req.query.farmGroup_id) {
            whereCondition.farmGroup_id = req.query.farmGroup_id;
        }
        const farmerCount = await Farmer.count({ where: whereCondition });
        res.sendSuccess(res, { farmerCount });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

export {
    createFarmGroupEvaluationData,
    fetchFarmGroupEvaluationDataPagination,
    fetchFarmGroupEvaluationData,
    updateFarmGroupEvaluationData,
    deleteFarmGroupEvaluationData,
    countFarmerByBrandAndFarmGroup
}