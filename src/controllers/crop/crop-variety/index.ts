import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import CropVariety from "../../../models/crop-variety.model";
import CropType from "../../../models/crop-type.model";
import Crop from "../../../models/crop.model";
import CropGrade from "../../../models/crop-grade.model";

const createCropVariety = async (req: Request, res: Response) => {
    try {
        const data = {
            cropType_id: req.body.cropTypeId,
            cropVariety: req.body.cropVariety,
            cropVariety_status: true,
        };
        const cropVariety = await CropVariety.create(data);
        res.sendSuccess(res, cropVariety);
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const createCropVarieties = async (req: Request, res: Response) => {
    try {
        // create multiple crop type at the time
        let pass = [];
        let fail = [];
        for await (const cropVariety of req.body.cropVariety) {
            let cropvariety = await CropVariety.findOne({ where: { cropVariety: { [Op.iLike]: cropVariety }, cropType_id: req.body.cropTypeId } })
            if (cropvariety) {
                fail.push({ data: cropvariety });
            } else {
                const cropsVariety = await CropVariety.create({ cropVariety: cropVariety, cropType_id: req.body.cropTypeId, cropVariety_status: true });
                pass.push({ data: cropsVariety });
            }
        }
        res.sendSuccess(res, { pass, fail });
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

// const fetchCropVariety = async (req: Request, res: Response) => {
//     const searchTerm = req.query.search || '';
//     const sortOrder = req.query.sort || 'asc';
//     const cropTypeId = req.query.cropTypeId;
//     const whereCondition: any = {}
//     try {
//         whereCondition.cropVariety = { [Op.iLike]: `%${searchTerm}%` }
//         if (cropTypeId) {
//             whereCondition.cropType_id = cropTypeId;
//         }
//         const cropVariety = await CropVariety.findAll({
//             where: whereCondition,
//             include: [
//                 {
//                     model: CropType, as: 'cropType', include: [{ model: Crop, as: 'crop', }]
//                 }],
//             order: [
//                 ['cropVariety', sortOrder], // Sort the results based on the 'username' field and the specified order
//             ],
//         });
//         return res.sendSuccess(res, cropVariety);
//     } catch (error) {
//         return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
//     }
// }

const fetchCropVarietyPagination = async (req: Request, res: Response) => {
    const status = req.query.status || '';
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'desc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const cropTypeId = req.query.cropTypeId;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { cropVariety: { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type 
                { '$cropType.cropType_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type 
                { '$cropType.crop.crop_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop name
            ];
        }
        if (cropTypeId) {
            whereCondition.cropType_id = cropTypeId;
        }

        if (status === 'true') {
            whereCondition.cropVariety_status = true
        }

        if (req.query.pagination === "true") {
            //fetch data with pagination
            const { count, rows } = await CropVariety.findAndCountAll({
                where: whereCondition,
                include: [
                    {
                        model: CropType, as: 'cropType', include: [{ model: Crop, as: 'crop', }]
                    }],
                order: [
                    ['id', sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
                offset: offset,
                limit: limit
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const cropVariety = await CropVariety.findAll({
                where: whereCondition,
                include: [
                    {
                        model: CropType, as: 'cropType', include: [{ model: Crop, as: 'crop', }]
                    }],
                order: [
                    ['id', sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
            });
            return res.sendSuccess(res, cropVariety);
        }

    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.message);
    }
}


const updateCropVariety = async (req: Request, res: Response) => {
    try {
        let result = await CropVariety.findOne({ where: { cropType_id: req.body.cropTypeId, cropVariety: { [Op.iLike]: req.body.cropVariety }, id: { [Op.ne]: req.body.id } } })
        if (result) {
            return res.sendError(res, "ALREADY_EXITS");
        }
        const cropVariety = await CropVariety.update({
            cropType_id: req.body.cropTypeId,
            cropVariety: req.body.cropVariety
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, cropVariety);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const updateCropVarietyStatus = async (req: Request, res: Response) => {
    try {
        const cropVariety = await CropVariety.update({ cropVariety_status: req.body.status }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, cropVariety);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const deleteCropVariety = async (req: Request, res: Response) => {
    try {
        let count = await CropGrade.count({ where: { cropVariety_id: req.body.id } });
        if (count > 0) {
            return res.sendError(res, 'Can not delete beacause Crop Variety is assosiated to another table');
        }
        const cropVariety = await CropVariety.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, cropVariety);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}


export {
    createCropVariety,
    createCropVarieties,
    fetchCropVarietyPagination,
    updateCropVariety,
    updateCropVarietyStatus,
    deleteCropVariety
};