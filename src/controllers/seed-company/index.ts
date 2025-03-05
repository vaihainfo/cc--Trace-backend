import { Request, Response } from "express";
import { Op } from "sequelize";
import SeedCompany from "../../models/seed-company.model";

const createSeedCompany = async (req: Request, res: Response) => {
    try {
        let result = await SeedCompany.findOne({ where: { name: { [Op.iLike]: req.body.seedCompanyName } } });
        if (result) {
            return res.sendError(res, "Seed compnay name already exist, please try different name.");
        }

        const data = {
            name: req.body.seedCompanyName,
            status: true
        };
        const seedCompany = await SeedCompany.create(data);
        res.sendSuccess(res, seedCompany);
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

const createSeedCompanies = async (req: Request, res: Response) => {
    try {
        let pass = [];
        let fail = [];
        for await (const seedCompanyName of req.body.seedCompanyNames) {
            let result = await SeedCompany.findOne({ where: { name: { [Op.iLike]: seedCompanyName } } })
            if (result) {
                fail.push({ data: result });
            } else {
                const result = await SeedCompany.create({ name: seedCompanyName, status: true });
                pass.push({ data: result });
            }
        }
        res.sendSuccess(res, { pass, fail });
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

const fetchSeedCompanyPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'desc';
    const status = req.query.status || '';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const whereCondition: any = {};
        if (status === 'true') {
            whereCondition.status = true;
        }
        if (searchTerm) {
            whereCondition.name = { [Op.iLike]: `%${searchTerm}%` }
        }

        if (req.query.pagination === "true") {
            const { count, rows } = await SeedCompany.findAndCountAll({
                where: whereCondition,
                order: [
                    ['id', sortOrder]
                ],
                offset: offset,
                limit: limit
            });

            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const seedCompany = await SeedCompany.findAll({
                where: whereCondition,
                order: [
                    ['id', sortOrder]
                ],
            });

            return res.sendSuccess(res, seedCompany);
        }
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

const updateSeedCompany = async (req: Request, res: Response) => {
    try {
        let result = await SeedCompany.findOne({ where: { name: { [Op.iLike]: req.body.seedCompanyName }, id: { [Op.ne]: req.body.id } } });
        if (result) {
            return res.sendError(res, "ALREADY_EXITS");
        }
        const seedCompany = await SeedCompany.update({
            name: req.body.seedCompanyName
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { seedCompany });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const updateSeedCompanyStatus = async (req: Request, res: Response) => {
    try {
        const seedCompany = await SeedCompany.update({ status: req.body.status }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { seedCompany });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const deleteSeedCompany = async (req: Request, res: Response) => {
    try {
        const seedCompany = await SeedCompany.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { seedCompany });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

export {
    createSeedCompany,
    createSeedCompanies,
    fetchSeedCompanyPagination,
    updateSeedCompany,
    updateSeedCompanyStatus,
    deleteSeedCompany
};