import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import YarnCount from "../../models/yarn-count.model";


const createYarnCount = async (req: Request, res: Response) => {
    try {
        const data = {
            yarnCount_name: req.body.yarnCountName,
            yarnCount_status: true
        };
        const yarnCount = await YarnCount.create(data);
        res.sendSuccess(res, yarnCount);
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const createYarnCounts = async (req: Request, res: Response) => {
    try {
        // create multiple Loom Type at the time
        const data = req.body.yarnCountName.map((obj: string) => {
            return { yarnCount_name: obj, yarnCount_status: true }
        })
        const yarnCounts = await YarnCount.bulkCreate(data);
        res.sendSuccess(res, yarnCounts);
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const fetchYarnCountPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'asc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    try {
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await YarnCount.findAndCountAll({
                where: {
                    yarnCount_name: { [Op.iLike]: `%${searchTerm}%` },
                },
                order: [
                    ['yarnCount_name', sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
                offset: offset,
                limit: limit
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const yarnCount = await YarnCount.findAll({
                where: {
                    yarnCount_name: { [Op.iLike]: `%${searchTerm}%` },
                },
                order: [
                    ['yarnCount_name', sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
            });
            return res.sendSuccess(res, yarnCount);
        }

    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const updateYarnCount = async (req: Request, res: Response) => {
    try {
        const yarnCount = await YarnCount.update({
            yarnCount_name: req.body.yarnCountName
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, yarnCount);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const updateYarnCountStatus = async (req: Request, res: Response) => {
    try {
        const yarnCount = await YarnCount.update({
            yarnCount_status: req.body.status
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, yarnCount);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const deleteYarnCount = async (req: Request, res: Response) => {
    try {
        const yarnCount = await YarnCount.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { yarnCount });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}


export {
    createYarnCount,
    createYarnCounts,
    fetchYarnCountPagination,
    updateYarnCount,
    updateYarnCountStatus,
    deleteYarnCount
};