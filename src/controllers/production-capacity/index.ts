import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import ProdCapacity from "../../models/prod-capacity.model";


const createProdCapacity = async (req: Request, res: Response) => {
    try {
        const data = {
            name: req.body.name,
            status: true
        };
        const prodCapacity = await ProdCapacity.create(data);
        res.sendSuccess(res, prodCapacity);
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const createProdCapacities = async (req: Request, res: Response) => {
    try {
        // create multiple Production capacity at the time
        let pass = [];
        let fail = [];
        for await (const obj of req.body.name) {
            let result = await ProdCapacity.findOne({ where: { name: { [Op.iLike]: obj } } })
            if (result) {
                fail.push({ data: result });
            } else {
                const result = await ProdCapacity.create({ name: obj, status: true });
                pass.push({ data: result });
            }
        }
        res.sendSuccess(res, { pass, fail });
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const fetchProdCapacityPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'asc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    try {
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await ProdCapacity.findAndCountAll({
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
            const prodCapacity = await ProdCapacity.findAll({
                where: {
                    name: { [Op.iLike]: `%${searchTerm}%` },
                },
                order: [
                    ['name', sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
            });
            return res.sendSuccess(res, prodCapacity);
        }

    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const updateProdCapacity = async (req: Request, res: Response) => {
    try {
        let result = await ProdCapacity.findOne({ where: { name: { [Op.iLike]: req.body.name }, id: { [Op.ne]: req.body.id } } })
        if (result) {
            return res.sendError(res, "ALREADY_EXITS");
        }
        const prodCapacity = await ProdCapacity.update({
            name: req.body.name
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, prodCapacity);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const updateProdCapacityStatus = async (req: Request, res: Response) => {
    try {
        const prodCapacity = await ProdCapacity.update({
            status: req.body.status
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, prodCapacity);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const deleteProdCapacity = async (req: Request, res: Response) => {
    try {
        const prodCapacity = await ProdCapacity.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { prodCapacity });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}


export {
    createProdCapacity,
    createProdCapacities,
    fetchProdCapacityPagination,
    updateProdCapacity,
    updateProdCapacityStatus,
    deleteProdCapacity
};