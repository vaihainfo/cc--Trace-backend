import { Request, Response } from "express";
import { Op } from "sequelize";
import SeedAvailability from "../../models/seed-availability.model";
import Season from "../../models/season.model";
import SeedCompany from "../../models/seed-company.model";

const fetchSeedAvailabilityPagination = async (req: Request, res: Response) => {
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
                { '$seed_company.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { variety: { [Op.iLike]: `%${searchTerm}%` } },
                { pkt: { [Op.iLike]: `%${searchTerm}%` } },
                { state: { [Op.iLike]: `%${searchTerm}%` } }
            ];
        }

        if (req.query.pagination === "true") {
            const { count, rows } = await SeedAvailability.findAndCountAll({
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
            const seedAvailability = await SeedAvailability.findAll({
                where: whereCondition,
                include: includeRelations,
                order: [
                    ['id', sortOrder]
                ],
            });

            return res.sendSuccess(res, seedAvailability);
        }
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

const fetchSeedAvailability = async (req: Request, res: Response) => {
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

        const seedAvailability = await SeedAvailability.findOne({
            where: { id: req.params.id },
            include: includeRelations
        });
        return res.sendSuccess(res, seedAvailability);
    } catch (error) {
        console.error(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const updateSeedAvailability = async (req: Request, res: Response) => {
    try {
        const seedAvailability = await SeedAvailability.update({
            season_id: req.body.season_id,
            seed_company_id: req.body.seed_company_id,
            lot_no: req.body.lot_no,
            variety: req.body.variety,
            pkt: req.body.pkt,
            state: req.body.state,
        }, {
            where: { id: req.body.id }
        });

        res.sendSuccess(res, { seedAvailability });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const deleteSeedAvailability = async (req: Request, res: Response) => {
    try {
        const seedAvailability = await SeedAvailability.destroy({
            where: { id: req.body.id }
        });
        res.sendSuccess(res, { seedAvailability });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

export {
    fetchSeedAvailabilityPagination,
    fetchSeedAvailability,
    updateSeedAvailability,
    deleteSeedAvailability
};