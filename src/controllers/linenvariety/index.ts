import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import Linen from "../../models/linen.model";


const createLinen = async (req: Request, res: Response) => {
    try {
        let result = await Linen.findOne({ where: { name: { [Op.iLike]: req.body.name }, variety: { [Op.iLike]: req.body.variety } } })
        if (result) {
            return res.sendError(res, "ALREADY_EXITS");
        }
        const data = {
            name: req.body.name,
            variety: req.body.variety,
            status: true
        };
        const cottonMix = await Linen.create(data);
        res.sendSuccess(res, cottonMix);
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}


const fetchLinenPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'asc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const whereCondition: any = {}
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { name: { [Op.iLike]: `%${searchTerm}%` } }, // Search by name 
                { variety: { [Op.iLike]: `%${searchTerm}%` } }, // Search by address
            ];
        }
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await Linen.findAndCountAll({
                where: whereCondition,
                order: [
                    ['name', sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
                offset: offset,
                limit: limit
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const linen = await Linen.findAll({
                where: whereCondition,
                order: [
                    ['name', sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
            });
            return res.sendSuccess(res, linen);
        }

    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const updateLinen = async (req: Request, res: Response) => {
    try {
        let result = await Linen.findOne({ where: { name: { [Op.iLike]: req.body.name }, variety: { [Op.iLike]: req.body.variety }, id: { [Op.ne]: req.body.id } } })
        if (result) {
            return res.sendError(res, "ALREADY_EXITS");
        }
        const linen = await Linen.update({
            name: req.body.name,
            variety: req.body.variety
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, linen);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const updateLinenStatus = async (req: Request, res: Response) => {
    try {
        const linen = await Linen.update({
            status: req.body.status
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, linen);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const deleteLinen = async (req: Request, res: Response) => {
    try {
        const linen = await Linen.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { linen });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}


export {
    createLinen,
    fetchLinenPagination,
    updateLinen,
    updateLinenStatus,
    deleteLinen
};