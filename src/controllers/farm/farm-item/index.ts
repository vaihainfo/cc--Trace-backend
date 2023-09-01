import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";

import FarmItem from "../../../models/farm-item.model";


const createFarm = async (req: Request, res: Response) => {
    try {
        const data = {
            farmItem: req.body.farmItem,
            farmItem_status: true
        };
        const farm = await FarmItem.create(data);
        res.sendSuccess(res, farm);
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const createFarms = async (req: Request, res: Response) => {
    try {
        // create multiple crops at the time
        const data = req.body.farmItem.map((obj: string) => {
            return { farmItem: obj, farmItem_status: true }
        })
        const farms = await FarmItem.bulkCreate(data);
        res.sendSuccess(res, farms);
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const fetchFarmsPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'asc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    try {
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await FarmItem.findAndCountAll({
                where: {
                    farmItem: { [Op.iLike]: `%${searchTerm}%` },
                },
                order: [
                    ['farmItem', sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
                offset: offset,
                limit: limit
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const farms = await FarmItem.findAll({
                where: {
                    farmItem: { [Op.iLike]: `%${searchTerm}%` },
                },
                order: [
                    ['farmItem', sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
            });
            return res.sendSuccess(res, farms);
        }

    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}


const updateFarm = async (req: Request, res: Response) => {
    try {
        const farm = await FarmItem.update({ farmItem: req.body.farmItem }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { farm });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const updateFarmStatus = async (req: Request, res: Response) => {
    try {
        const farm = await FarmItem.update({ farmItem_status: req.body.status }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { farm });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const deleteFarm = async (req: Request, res: Response) => {
    try {
        const farm = await FarmItem.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { farm });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}


export {
    createFarm,
    createFarms,
    fetchFarmsPagination,
    updateFarm,
    updateFarmStatus,
    deleteFarm
};