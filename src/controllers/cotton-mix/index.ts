import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import CottonMix from "../../models/cotton-mix.model";


const createCottonMix = async (req: Request, res: Response) => {
    try {
        const data = {
            cottonMix_name: req.body.cottonMixName,
            cottonMix_status: true
        };
        const cottonMix = await CottonMix.create(data);
        res.sendSuccess(res, cottonMix);
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const createCottonMixes = async (req: Request, res: Response) => {
    try {
        // create multiple CottonMix/Blend at the time
        let pass = [];
        let fail = [];
        for await (const obj of req.body.cottonMixName) {
            let result = await CottonMix.findOne({ where: { cottonMix_name: { [Op.iLike]: obj } } })
            if (result) {
                fail.push({ data: result });
            } else {
                const result = await CottonMix.create({
                    cottonMix_name: obj,
                    cottonMix_status: true
                });
                pass.push({ data: result });
            }
        }
        res.sendSuccess(res, { pass, fail });
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const fetchCottonMixPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'asc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    try {
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await CottonMix.findAndCountAll({
                where: {
                    cottonMix_name: { [Op.iLike]: `%${searchTerm}%` },
                },
                order: [
                    ['cottonMix_name', sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
                offset: offset,
                limit: limit
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const cottonMix = await CottonMix.findAll({
                where: {
                    cottonMix_name: { [Op.iLike]: `%${searchTerm}%` },
                },
                order: [
                    ['cottonMix_name', sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
            });
            return res.sendSuccess(res, cottonMix);
        }

    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const updateCottonMix = async (req: Request, res: Response) => {
    try {
        let result = await CottonMix.findOne({ where: { cottonMix_name: { [Op.iLike]: req.body.cottonMixName }, id: { [Op.ne]: req.body.id } } })
        if (result) {
            return res.sendError(res, "ALREADY_EXITS");
        }
        const cottonMix = await CottonMix.update({
            cottonMix_name: req.body.cottonMixName
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, cottonMix);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const updateCottonMixStatus = async (req: Request, res: Response) => {
    try {
        const cottonMix = await CottonMix.update({
            cottonMix_status: req.body.status
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, cottonMix);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const deleteCottonMix = async (req: Request, res: Response) => {
    try {
        const cottonMix = await CottonMix.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { cottonMix });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}


export {
    createCottonMix,
    createCottonMixes,
    fetchCottonMixPagination,
    updateCottonMix,
    updateCottonMixStatus,
    deleteCottonMix
};