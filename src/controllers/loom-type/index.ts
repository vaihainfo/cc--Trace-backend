import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import LoomType from "../../models/loom-type.model";


const createLoomType = async (req: Request, res: Response) => {
    try {
        const data = {
            name: req.body.name,
            status: true
        };
        const loomType = await LoomType.create(data);
        res.sendSuccess(res, loomType);
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const createLoomTypes = async (req: Request, res: Response) => {
    try {
        // create multiple Loom Type at the time
        const data = req.body.name.map((obj: string) => {
            return { name: obj, status: true }
        })
        const loom = await LoomType.bulkCreate(data);
        res.sendSuccess(res, loom);
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}


const fetchLoomTypePagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'asc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    try {
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await LoomType.findAndCountAll({
                where: {
                    name: { [Op.iLike]: `%${searchTerm}%` },
                },
                order: [
                    ['name', sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
                offset: offset,
                limit: limit
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const loomType = await LoomType.findAll({
                where: {
                    name: { [Op.iLike]: `%${searchTerm}%` },
                },
                order: [
                    ['name', sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
            });
            return res.sendSuccess(res, loomType);
        }

    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}


const updateLoomType = async (req: Request, res: Response) => {
    try {
        const loomType = await LoomType.update({
            name: req.body.name
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, loomType);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const updateLoomTypeStatus = async (req: Request, res: Response) => {
    try {
        const loomType = await LoomType.update({
            status: req.body.status
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, loomType);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const deleteLoomType = async (req: Request, res: Response) => {
    try {
        const loomType = await LoomType.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { loomType });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}


export {
    createLoomType,
    createLoomTypes,
    fetchLoomTypePagination,
    updateLoomType,
    updateLoomTypeStatus,
    deleteLoomType
};