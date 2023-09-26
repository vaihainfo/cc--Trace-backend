import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import FarmProduct from "../../../models/farm-product.model";
import FarmItem from "../../../models/farm-item.model";

const createFarmProduct = async (req: Request, res: Response) => {
    try {
        const data = {
            farmItem_id: req.body.farmItemId,
            farmProduct: req.body.farmProduct,
            farmProduct_status: true,
        };
        const farmProduct = await FarmProduct.create(data);
        res.sendSuccess(res, farmProduct);
    } catch (error: any) {
        console.error(error.message);
        return res.sendError(res, error.message);
    }
}

const createFarmProducts = async (req: Request, res: Response) => {
    try {
        // create multiple Farm Product at the time
        let pass = [];
        let fail = [];
        for await (const obj of req.body.farmProduct) {
            let farmP = await FarmProduct.findOne({ where: { farmProduct: { [Op.iLike]: obj }, farmItem_id: req.body.farmItemId } })
            if (farmP) {
                fail.push({ data: farmP });
            } else {
                const farmsProduct = await FarmProduct.create({ farmProduct: obj, farmItem_id: req.body.farmItemId, farmProduct_status: true });
                pass.push({ data: farmsProduct });
            }
        }
        res.sendSuccess(res, { pass, fail });
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}


const fetchFarmProductPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'desc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const farmItemId = req.query.farmItemId;
    const offset = (page - 1) * limit;
    const status = req.query.status || '';
    const whereCondition: any = {}
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { farmProduct: { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type 
                { '$farmItem.farmItem$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop name
            ];
        }

        if (farmItemId) {
            whereCondition.farmItem_id = farmItemId;
        }

        if (status === 'true') {
            whereCondition.farmProduct_status = true;
        }
        //fetch data with pagination
        if (req.query.pagination === 'true') {
            const { count, rows } = await FarmProduct.findAndCountAll({
                where: whereCondition,
                include: [
                    {
                        model: FarmItem, as: 'farmItem'
                    }],
                order: [
                    ['id', sortOrder], // Sort the results based on the 'cropType_name' field and the specified order
                ],
                offset: offset,
                limit: limit
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const farmProucts = await FarmProduct.findAll({
                where: whereCondition,
                include: [
                    {
                        model: FarmItem, as: 'farmItem'
                    }],
                order: [
                    ['id', sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
            });
            return res.sendSuccess(res, farmProucts);
        }

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}


const updateFarmProduct = async (req: Request, res: Response) => {
    try {
        let result = await FarmProduct.findOne({
            where: {
                farmItem_id: req.body.farmItemId,
                farmProduct: { [Op.iLike]: req.body.farmProduct }, id: { [Op.ne]: req.body.id }
            }
        })
        if (result) {
            return res.sendError(res, "ALREADY_EXITS");
        }
        const farmProduct = await FarmProduct.update({
            farmItem_id: req.body.farmItemId,
            farmProduct: req.body.farmProduct
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, farmProduct);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const updateFarmProductStatus = async (req: Request, res: Response) => {
    try {
        const farmProduct = await FarmProduct.update({ farmProduct_status: req.body.status }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, farmProduct);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const deleteFarmProduct = async (req: Request, res: Response) => {
    try {
        const farmProduct = await FarmProduct.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, farmProduct);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}


export {
    createFarmProduct,
    createFarmProducts,
    fetchFarmProductPagination,
    updateFarmProduct,
    updateFarmProductStatus,
    deleteFarmProduct
};