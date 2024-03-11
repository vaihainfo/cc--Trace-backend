import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";

import UnitType from "../../../models/unit-type.model";
import UnitSubType from "../../../models/unit-subtype.model";


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
        // create multiple Unit Type at the time
        let pass = [];
        let fail = [];
        for await (const obj of req.body.unitType) {
            let unit = await UnitType.findOne({ where: { unitType: { [Op.iLike]: obj }, } })
            if (unit) {
                fail.push({ data: unit });
            } else {
                const unit = await UnitType.create({ unitType: obj, unitType_status: true });
                pass.push({ data: unit });
            }
        }
        res.sendSuccess(res, { pass, fail });
    } catch (error) {
        return res.sendError(res, "ERR_NOT_ABLE_TO_CREATE_UNIT_TYPE");
    }
}

const fetchUnitTypePagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'desc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status || '';
    const whereCondition: any = {};
    try {

        if (status === 'true') {
            whereCondition.unitType_status = true;
        }
        if (searchTerm) {
            whereCondition.unitType = { [Op.iLike]: `%${searchTerm}%` }
        }
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await UnitType.findAndCountAll({
                where: whereCondition,
                order: [
                    ['id', sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
                offset: offset,
                limit: limit
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const unitTypes = await UnitType.findAll({
                where: whereCondition,
                order: [
                    ['id', sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
            });
            return res.sendSuccess(res, unitTypes);
        }

    } catch (error) {
        return res.sendError(res, "ERR_NOT_ABLE_TO_GET_UNITTYPE");
    }
}


const updateUnitType = async (req: Request, res: Response) => {
    try {
        let result = await UnitType.findOne({
            where: {
                unitType: { [Op.iLike]: req.body.unitType }, id: { [Op.ne]: req.body.id }
            }
        })
        if (result) {
            return res.sendError(res, "ALREADY_EXITS");
        }
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
        let count = await UnitSubType.count({ where: { unitType_id: req.body.id } });
        if (count > 0) {
            return res.sendError(res, 'Can not delete beacause Unit Type is assosiated to another table');
        }
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

const checkUnitTypes = async (req: Request, res: Response) => {
    try {
        let whereCondition: any = {}
        if (req.body.id) {
            whereCondition = { unitType: { [Op.iLike]: req.body.unitType }, id: { [Op.ne]: req.body.id } }
        } else {
            whereCondition = { unitType: { [Op.iLike]: req.body.unitType } }
        }
        let result = await UnitType.findOne({ where: whereCondition })

        res.sendSuccess(res, result ? { exist: true } : { exist: false });
    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.message);
    }
}


export {
    createUnitType,
    checkUnitTypes,
    createUnitTypes,
    fetchUnitTypePagination,
    updateUnitType,
    updateUnitTypeStatus,
    deleteUnitType
};