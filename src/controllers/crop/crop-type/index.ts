import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import CropType from "../../../models/crop-type.model";
import Crop from "../../../models/crop.model";
import CropVariety from "../../../models/crop-variety.model";

const createCropType = async (req: Request, res: Response) => {
    try {
        const data = {
            crop_id: req.body.cropId,
            cropType_name: req.body.cropTypeName,
            cropType_status: true,
        };
        const cropType = await CropType.create(data);
        res.sendSuccess(res, cropType);
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const createCropTypes = async (req: Request, res: Response) => {
    try {
        // create multiple crop type at the time
        let pass = [];
        let fail = [];
        for await (const cropType of req.body.cropTypeName) {
            let crop = await CropType.findOne({ where: { cropType_name: { [Op.iLike]: cropType }, crop_id: req.body.cropId } })
            if (crop) {
                fail.push({ data: crop });
            } else {
                const crops = await CropType.create({ cropType_name: cropType, crop_id: req.body.cropId, cropType_status: true });
                pass.push({ data: crops });
            }
        }
        res.sendSuccess(res, { pass, fail });
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

// const fetchCropType = async (req: Request, res: Response) => {
//     const search = req.query.search || '';
//     const sortOrder = req.query.sort || 'asc';
//     const cropId = req.query.cropId;
//     const whereCondition: any = {}
//     try {
//         if (search) {
//             whereCondition[Op.or] = [
//                 { cropType_name: { [Op.iLike]: `%${search}%` } }, // Search by crop Type 
//                 { '$crop.crop_name$': { [Op.iLike]: `%${search}%` } }, // Search by crop name
//             ];
//         }

// if (cropId) {
//     whereCondition.crop_id = cropId;
// }
//         const cropType = await CropType.findAll({
//             where: whereCondition,
//             include: [
//                 {
//                     model: Crop, as: 'crop'
//                 }],
//             order: [
//                 ['cropType_name', sortOrder], // Sort the results based on the 'username' field and the specified order
//             ],
//         });
//         return res.sendSuccess(res, cropType);
//     } catch (error) {
//         return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
//     }
// }

const fetchCropTypePagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const status = req.query.status || '';
    const sortOrder = req.query.sort || 'desc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const cropId = req.query.cropId;
    const offset = (page - 1) * limit;
    const whereCondition: any = {}
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { cropType_name: { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type 
                { '$crop.crop_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop name
            ];
        }

        if (cropId) {
            whereCondition.crop_id = cropId;
        }
        if (status === 'true') {
            whereCondition.cropType_status = true
        }
        //fetch data with pagination
        if (req.query.pagination === 'true') {
            const { count, rows } = await CropType.findAndCountAll({
                where: whereCondition,
                include: [
                    {
                        model: Crop, as: 'crop'
                    }],
                order: [
                    ['id', sortOrder], // Sort the results based on the 'cropType_name' field and the specified order
                ],
                offset: offset,
                limit: limit
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const cropType = await CropType.findAll({
                where: whereCondition,
                include: [
                    {
                        model: Crop, as: 'crop'
                    }],
                order: [
                    ['id', sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
            });
            return res.sendSuccess(res, cropType);
        }

    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.message);
    }
}


const updateCropType = async (req: Request, res: Response) => {
    try {
        let result = await CropType.findOne({ where: { crop_id: req.body.cropId, cropType_name: { [Op.iLike]: req.body.cropTypeName }, id: { [Op.ne]: req.body.id } } })
        if (result) {
            return res.sendError(res, "ALREADY_EXITS");
        }
        const cropType = await CropType.update({
            crop_id: req.body.cropId,
            cropType_name: req.body.cropTypeName
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, cropType);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const updateCropTypeStatus = async (req: Request, res: Response) => {
    try {
        const cropType = await CropType.update({ cropType_status: req.body.status }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, cropType);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const deleteCropType = async (req: Request, res: Response) => {
    try {
        let count = await CropVariety.count({ where: { cropType_id: req.body.id } });
        if (count > 0) {
            return res.sendError(res, 'Can not delete beacause Crop Type is assosiated to another table');
        }
        const cropType = await CropType.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, cropType);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const checkCropTypes = async (req: Request, res: Response) => {
    try {
        let whereCondition: any = {}
        if (req.body.id) {
            whereCondition = { crop_id: req.body.cropId, cropType_name: { [Op.iLike]: req.body.cropTypeName }, id: { [Op.ne]: req.body.id } }
        } else {
            whereCondition = { crop_id: req.body.cropId, cropType_name: { [Op.iLike]: req.body.cropTypeName } }
        }
        let result = await CropType.findOne({ where: whereCondition })

        res.sendSuccess(res, result ? { exist: true } : { exist: false });
    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.message);
    }
}

export {
    createCropType,
    checkCropTypes,
    createCropTypes,
    fetchCropTypePagination,
    updateCropType,
    updateCropTypeStatus,
    deleteCropType
};