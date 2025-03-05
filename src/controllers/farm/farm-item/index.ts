import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";

import FarmItem from "../../../models/farm-item.model";
import FarmProduct from "../../../models/farm-product.model";


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
        // create multiple Farm Items at the time
        let pass = [];
        let fail = [];
        for await (const farmItem of req.body.farmItem) {
            let farm = await FarmItem.findOne({ where: { farmItem: { [Op.iLike]: farmItem } } })
            if (farm) {
                fail.push({ data: farm });
            } else {
                const farms = await FarmItem.create({ farmItem: farmItem, farmItem_status: true });
                pass.push({ data: farms });
            }
        }
        res.sendSuccess(res, { pass, fail });
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
    const status = req.query.status || '';
    const whereCondition: any = {};
    try {

        if (status === 'true') {
            whereCondition.farmItem_status = true;
        }
        if (searchTerm) {
            whereCondition.farmItem = { [Op.iLike]: `%${searchTerm}%` }
        }
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await FarmItem.findAndCountAll({
                where: whereCondition,
                order: [
                    ['id', sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
                offset: offset,
                limit: limit
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const farms = await FarmItem.findAll({
                where: whereCondition,
                order: [
                    ['id', sortOrder], // Sort the results based on the 'username' field and the specified order
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
        let result = await FarmItem.findOne({ where: { farmItem: { [Op.iLike]: req.body.farmItem }, id: { [Op.ne]: req.body.id } } })
        if (result) {
            return res.sendError(res, "ALREADY_EXITS");
        }
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
        let count = await FarmProduct.count({ where: { farmItem_id: req.body.id } });
        if (count > 0) {
            return res.sendError(res, 'Can not delete beacause Farm Item is assosiated to another table');
        }
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

const checkFarms = async (req: Request, res: Response) => {
    try {
        let whereCondition: any = {}
        if (req.body.id) {
            whereCondition = { farmItem: { [Op.iLike]: req.body.farmItem }, id: { [Op.ne]: req.body.id } }
        } else {
            whereCondition = { farmItem: { [Op.iLike]: req.body.farmItem } }
        }
        let result = await FarmItem.findOne({ where: whereCondition })

        res.sendSuccess(res, result ? { exist: true } : { exist: false });
    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.message);
    }
}


export {
    createFarm,
    checkFarms,
    createFarms,
    fetchFarmsPagination,
    updateFarm,
    updateFarmStatus,
    deleteFarm
};