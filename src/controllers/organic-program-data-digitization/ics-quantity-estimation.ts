import { Request, Response } from "express";
import { Op } from "sequelize";
import IcsQuantityEstimation from "../../models/ics-quantity-estimation.model";
import Season from "../../models/season.model";
import FarmGroup from "../../models/farm-group.model";
import ICS from "../../models/ics.model";
import CropCurrentSeason from "../../models/crop-current-season.model";

const createIcsQuantityEstimation = async (req: Request, res: Response) => {
    try {
        const data = {
            season_id: req.body.season_id,
            farm_group_id: req.body.farm_group_id,
            ics_id: req.body.ics_id,
            no_of_farmer: req.body.no_of_farmer,
            total_area: req.body.total_area,
            est_cotton_area: req.body.est_cotton_area,
            estimated_lint: req.body.estimated_lint,
            verified_row_cotton: req.body.verified_row_cotton,
            verified_ginner: req.body.verified_ginner,
            crop_current_season_id: req.body.crop_current_season_id,
            organic_standard: req.body.organic_standard,
            certification_body: req.body.certification_body,
            scope_issued_date: req.body.scope_issued_date,
            scope_certification_validity: req.body.scope_certification_validity,
            scope_certification_no: req.body.scope_certification_no,
            nop_scope_certification_no: req.body.nop_scope_certification_no,
            district: req.body.district,
            state: req.body.state,
            remark: req.body.remark
        };
        const icsQuantityEstimation = await IcsQuantityEstimation.create(data);
        res.sendSuccess(res, icsQuantityEstimation);
    } catch (error) {
        console.error(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const fetchIcsQuantityEstimationPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'desc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

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
                model: ICS,
                as: "ics"
            },
            {
                model: CropCurrentSeason,
                as: "crop_current_season"
            }
        ];

        if (searchTerm) {
            whereCondition[Op.or] = [
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$farm_group.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$ics.ics_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { no_of_farmer: { [Op.iLike]: `%${searchTerm}%` } },
                { total_area: { [Op.iLike]: `%${searchTerm}%` } },
                { est_cotton_area: { [Op.iLike]: `%${searchTerm}%` } },
                { estimated_lint: { [Op.iLike]: `%${searchTerm}%` } },
                { verified_row_cotton: { [Op.iLike]: `%${searchTerm}%` } },
                { verified_ginner: { [Op.iLike]: `%${searchTerm}%` } },
                { '$crop_current_season.crop_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { organic_standard: { [Op.iLike]: `%${searchTerm}%` } },
                { certification_body: { [Op.iLike]: `%${searchTerm}%` } },
                { scope_issued_date: { [Op.iLike]: `%${searchTerm}%` } },
                { scope_certification_validity: { [Op.iLike]: `%${searchTerm}%` } },
                { scope_certification_no: { [Op.iLike]: `%${searchTerm}%` } },
                { nop_scope_certification_no: { [Op.iLike]: `%${searchTerm}%` } },
                { district: { [Op.iLike]: `%${searchTerm}%` } },
                { state: { [Op.iLike]: `%${searchTerm}%` } },
                { remark: { [Op.iLike]: `%${searchTerm}%` } }
            ];
        }

        if (req.query.pagination === "true") {
            const { count, rows } = await IcsQuantityEstimation.findAndCountAll({
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
            const icsQuantityEstimation = await IcsQuantityEstimation.findAll({
                where: whereCondition,
                include: includeRelations,
                order: [
                    ['id', sortOrder]
                ],
            });

            return res.sendSuccess(res, icsQuantityEstimation);
        }
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

const fetchIcsQuantityEstimation = async (req: Request, res: Response) => {
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
                model: ICS,
                as: "ics"
            },
            {
                model: CropCurrentSeason,
                as: "crop_current_season"
            }
        ];

        const icsQuantityEstimation = await IcsQuantityEstimation.findOne({
            where: { id: req.params.id },
            include: includeRelations
        });
        return res.sendSuccess(res, icsQuantityEstimation);
    } catch (error) {
        console.error(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const updateIcsQuantityEstimation = async (req: Request, res: Response) => {
    try {
        const icsQuantityEstimation = await IcsQuantityEstimation.update({
            season_id: req.body.season_id,
            farm_group_id: req.body.farm_group_id,
            ics_id: req.body.ics_id,
            no_of_farmer: req.body.no_of_farmer,
            total_area: req.body.total_area,
            est_cotton_area: req.body.est_cotton_area,
            estimated_lint: req.body.estimated_lint,
            verified_row_cotton: req.body.verified_row_cotton,
            verified_ginner: req.body.verified_ginner,
            crop_current_season_id: req.body.crop_current_season_id,
            organic_standard: req.body.organic_standard,
            certification_body: req.body.certification_body,
            scope_issued_date: req.body.scope_issued_date,
            scope_certification_validity: req.body.scope_certification_validity,
            scope_certification_no: req.body.scope_certification_no,
            nop_scope_certification_no: req.body.nop_scope_certification_no,
            district: req.body.district,
            state: req.body.state,
            remark: req.body.remark
        }, {
            where: { id: req.body.id }
        });

        res.sendSuccess(res, { icsQuantityEstimation });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const deleteIcsQuantityEstimation = async (req: Request, res: Response) => {
    try {
        const icsQuantityEstimation = await IcsQuantityEstimation.destroy({
            where: { id: req.body.id }
        });
        res.sendSuccess(res, { icsQuantityEstimation });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

export {
    createIcsQuantityEstimation,
    fetchIcsQuantityEstimationPagination,
    fetchIcsQuantityEstimation,
    updateIcsQuantityEstimation,
    deleteIcsQuantityEstimation
}