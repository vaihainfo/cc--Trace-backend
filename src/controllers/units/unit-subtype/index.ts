import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import UnitSubType from "../../../models/unit-subtype.model";
import UnitType from "../../../models/unit-type.model";

const createUnitSubType = async (req: Request, res: Response) => {
    try {
        const data = {
            unitType_id: req.body.unitTypeId,
            unitSubType: req.body.unitSubType,
            unitSubType_status: true,
        };
        const unitSubType = await UnitSubType.create(data);
        res.sendSuccess(res, unitSubType);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const createUnitSubTypes = async (req: Request, res: Response) => {
    try {
        // create multiple unit subtype at the time
        let pass = [];
        let fail = [];
        for await (const obj of req.body.unitSubType) {
            let unitSub = await UnitSubType.findOne({ where: { unitSubType: { [Op.iLike]: obj }, unitType_id: req.body.unitTypeId } })
            if (unitSub) {
                fail.push({ data: unitSub });
            } else {
                const unitSub = await UnitSubType.create({ unitSubType: obj, unitType_id: req.body.unitTypeId, unitSubType_status: true });
                pass.push({ data: unitSub });
            }
        }
        res.sendSuccess(res, { pass, fail });
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}


const fetchUnitSubTypePagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'asc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const unitTypeId = req.query.unitTypeId;
    const offset = (page - 1) * limit;
    const whereCondition: any = {}
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { unitSubType: { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type 
                { '$unitType.unitType$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop name
            ];
        }

        if (unitTypeId) {
            whereCondition.unitType_id = unitTypeId;
        }
        //fetch data with pagination
        if (req.query.pagination === 'true') {
            const { count, rows } = await UnitSubType.findAndCountAll({
                where: whereCondition,
                include: [
                    {
                        model: UnitType, as: 'unitType'
                    }],
                order: [
                    ['unitSubType', sortOrder], // Sort the results based on the 'cropType_name' field and the specified order
                ],
                offset: offset,
                limit: limit
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const unitSubTypes = await UnitSubType.findAll({
                where: whereCondition,
                include: [
                    {
                        model: UnitType, as: 'unitType'
                    }],
                order: [
                    ['unitSubType', sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
            });
            return res.sendSuccess(res, unitSubTypes);
        }

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}


const updateUnitSubType = async (req: Request, res: Response) => {
    try {
        let result = await UnitSubType.findOne({ where: { unitType_id: req.body.unitTypeId, unitSubType: { [Op.iLike]: req.body.unitSubType }, id: { [Op.ne]: req.body.id } } })
        if (result) {
            return res.sendError(res, "ALREADY_EXITS");
        }
        const unitSubType = await UnitSubType.update({
            unitType_id: req.body.unitTypeId,
            unitSubType: req.body.unitSubType
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, unitSubType);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const updateUnitSubTypeStatus = async (req: Request, res: Response) => {
    try {
        const unitSubType = await UnitSubType.update({ unitSubType_status: req.body.status }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, unitSubType);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const deleteUnitSubType = async (req: Request, res: Response) => {
    try {
        const unitSubType = await UnitSubType.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, unitSubType);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}


export {
    createUnitSubType,
    createUnitSubTypes,
    fetchUnitSubTypePagination,
    updateUnitSubType,
    updateUnitSubTypeStatus,
    deleteUnitSubType
};