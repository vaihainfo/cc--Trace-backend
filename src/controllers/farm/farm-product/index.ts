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
        // create multiple crop type at the time
        const data = req.body.farmProduct.map((obj: string) => {
            return { farmProduct: obj, farmItem_id: req.body.farmItemId, farmProduct_status: true }
        })
        const farmProducts = await FarmProduct.bulkCreate(data);
        res.sendSuccess(res, farmProducts);
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}


const fetchFarmProductPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'asc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const farmItemId = req.query.farmItemId;
    const offset = (page - 1) * limit;
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
        //fetch data with pagination
        if (req.query.pagination === 'true') {
            const { count, rows } = await FarmProduct.findAndCountAll({
                where: whereCondition,
                include: [
                    {
                        model: FarmItem, as: 'farmItem'
                    }],
                order: [
                    ['farmProduct', sortOrder], // Sort the results based on the 'cropType_name' field and the specified order
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
                    ['farmProduct', sortOrder], // Sort the results based on the 'username' field and the specified order
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