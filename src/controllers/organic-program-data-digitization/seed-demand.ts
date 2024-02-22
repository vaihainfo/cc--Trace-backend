import { Request, Response } from "express";
import { Op } from "sequelize";
import SeedDemand from "../../models/seed_demand.model";
import Season from "../../models/season.model";
import SeedCompany from "../../models/seed-company.model";

const fetchSeedDemandPagination = async (req: Request, res: Response) => {
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
                model: SeedCompany,
                as: "seed_company"
            }
        ];

        if (searchTerm) {
            whereCondition[Op.or] = [
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { project_name: { [Op.iLike]: `%${searchTerm}%` } },
                { '$seed_company.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { seed_variety: { [Op.iLike]: `%${searchTerm}%` } },
                { numbers_of_packets: { [Op.iLike]: `%${searchTerm}%` } },
                { project_location: { [Op.iLike]: `%${searchTerm}%` } },
                { remark: { [Op.iLike]: `%${searchTerm}%` } }
            ];
        }

        if (req.query.pagination === "true") {
            const { count, rows } = await SeedDemand.findAndCountAll({
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
            const seedDemand = await SeedDemand.findAll({
                where: whereCondition,
                include: includeRelations,
                order: [
                    ['id', sortOrder]
                ],
            });

            return res.sendSuccess(res, seedDemand);
        }
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

const fetchSeedDemand = async (req: Request, res: Response) => {
    try {
        const includeRelations = [
            {
                model: Season,
                as: "season",
            },
            {
                model: SeedCompany,
                as: "seed_company"
            }
        ];

        const seedDemand = await SeedDemand.findOne({
            where: { id: req.params.id },
            include: includeRelations
        });
        return res.sendSuccess(res, seedDemand);
    } catch (error) {
        console.error(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const updateSeedDemand = async (req: Request, res: Response) => {
    try {
        const seedDemand = await SeedDemand.update({
            season_id: req.body.season_id,
            project_name: req.body.project_name,
            seed_company_id: req.body.seed_company_id,
            seed_variety: req.body.seed_variety,
            numbers_of_packets: req.body.numbers_of_packets,
            project_location: req.body.project_location,
            remark: req.body.remark,
        }, {
            where: { id: req.body.id }
        });

        res.sendSuccess(res, { seedDemand });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const deleteSeedDemand = async (req: Request, res: Response) => {
    try {
        const seedDemand = await SeedDemand.destroy({
            where: { id: req.body.id }
        });
        res.sendSuccess(res, { seedDemand });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

export {
    fetchSeedDemandPagination,
    fetchSeedDemand,
    updateSeedDemand,
    deleteSeedDemand
};