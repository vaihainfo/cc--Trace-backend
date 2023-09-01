import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";

import UnitType from "../../../models/unit-type.model";


const createUnitType = async (req: Request, res: Response) => {
    try {
        const data = {
            unitType: req.body.unitType,
            unitType_status: true
        };
        const unitType = await UnitType.create(data);
        res.sendSuccess(res, unitType);
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const createUnitTypes = async (req: Request, res: Response) => {
    try {
        // create multiple crops at the time
        const data = req.body.unitType.map((obj: string) => {
            return { unitType: obj, unitType_status: true }
        })
        const unitTypes = await UnitType.bulkCreate(data);
        res.sendSuccess(res, unitTypes);
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const fetchUnitTypePagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'asc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    try {
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await UnitType.findAndCountAll({
                where: {
                    unitType: { [Op.iLike]: `%${searchTerm}%` },
                },
                order: [
                    ['unitType', sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
                offset: offset,
                limit: limit
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const unitTypes = await UnitType.findAll({
                where: {
                    unitType: { [Op.iLike]: `%${searchTerm}%` },
                },
                order: [
                    ['unitType', sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
            });
            return res.sendSuccess(res, unitTypes);
        }

    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}


const updateUnitType = async (req: Request, res: Response) => {
    try {
        const unitType = await UnitType.update({ unitType: req.body.unitType }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { unitType });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const updateUnitTypeStatus = async (req: Request, res: Response) => {
    try {
        const unitType = await UnitType.update({ unitType_status: req.body.status }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { unitType });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const deleteUnitType = async (req: Request, res: Response) => {
    try {
        const unitType = await UnitType.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { unitType });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}


export {
    createUnitType,
    createUnitTypes,
    fetchUnitTypePagination,
    updateUnitType,
    updateUnitTypeStatus,
    deleteUnitType
};