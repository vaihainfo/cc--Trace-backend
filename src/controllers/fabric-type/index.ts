import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";

import FabricType from "../../models/fabric-type.model";


const createFabricType = async (req: Request, res: Response) => {
    try {
        const data = {
            fabricType_name: req.body.fabricTypeName,
            fabricType_status: true
        };
        const fabricType = await FabricType.create(data);
        res.sendSuccess(res, fabricType);
    } catch (error) {
        return res.sendError(res, "ERR_NOT_ABLE_TO_CREATE_FABRIC_TYPE");
    }
}

const createFabricTypes = async (req: Request, res: Response) => {
    try {
        // create multiple Fabric Type at the time
        let pass = [];
        let fail = [];
        for await (const obj of req.body.fabricTypeName) {
            let result = await FabricType.findOne({ where: { fabricType_name: obj } })
            if (result) {
                fail.push({ data: result });
            } else {
                const result = await FabricType.create({ fabricType_name: obj, fabricType_status: true });
                pass.push({ data: result });
            }
        }
        res.sendSuccess(res, { pass, fail });
    } catch (error) {
        return res.sendError(res, "ERR_NOT_ABLE_TO_CREATE_FABRIC_TYPE");
    }
}

const fetchFebricTypePagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'desc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status || '';
    const whereCondition: any = {};
    try {

        if (status === 'true') {
            whereCondition.fabricType_status = true;
        }
        if (searchTerm) {
            whereCondition.fabricType_name = { [Op.iLike]: `%${searchTerm}%` }
        }
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await FabricType.findAndCountAll({
                where: whereCondition,
                order: [
                    ['id', sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
                offset: offset,
                limit: limit
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const febricType = await FabricType.findAll({
                where: whereCondition,
                order: [
                    ['id', sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
            });
            return res.sendSuccess(res, febricType);
        }

    } catch (error) {
        return res.sendError(res, "ERR_NOT_ABLE_TO_FETCH_FABRIC_TYPE");
    }
}


const updateFebricType = async (req: Request, res: Response) => {
    try {
        let result = await FabricType.findOne({ where: { fabricType_name: { [Op.iLike]: req.body.fabricTypeName }, id: { [Op.ne]: req.body.id } } })
        if (result) {
            return res.sendError(res, "ALREADY_EXITS");
        }
        const fabricType = await FabricType.update({
            fabricType_name: req.body.fabricTypeName
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { fabricType });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const updateFebricTypeStatus = async (req: Request, res: Response) => {
    try {
        const fabricType = await FabricType.update({
            fabricType_status: req.body.status
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { fabricType });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const deleteFebricType = async (req: Request, res: Response) => {
    try {
        const febricType = await FabricType.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { febricType });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const checkFabricTypes = async (req: Request, res: Response) => {
    try {
        let whereCondition: any = {}
        if (req.body.id) {
            whereCondition = { fabricType_name: { [Op.iLike]: req.body.fabricTypeName }, id: { [Op.ne]: req.body.id } }
        } else {
            whereCondition = { fabricType_name: { [Op.iLike]: req.body.fabricTypeName } }
        }
        let result = await FabricType.findOne({ where: whereCondition })

        res.sendSuccess(res, result ? { exist: true } : { exist: false });
    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.message);
    }
}

export {
    createFabricType,
    checkFabricTypes,
    createFabricTypes,
    fetchFebricTypePagination,
    updateFebricType,
    updateFebricTypeStatus,
    deleteFebricType
};