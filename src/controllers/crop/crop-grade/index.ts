import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import CropGrade from "../../../models/crop-grade.model";
import CropVariety from "../../../models/crop-variety.model";
import CropType from "../../../models/crop-type.model";
import Crop from "../../../models/crop.model";

const createCropGrade = async (req: Request, res: Response) => {
    try {
        const data = {
            cropVariety_id: req.body.cropVarietyId,
            cropGrade: req.body.cropGrade,
            cropGrade_status: true
        };
        const cropGrade = await CropGrade.create(data);
        res.sendSuccess(res, cropGrade);
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const createCropGrades = async (req: Request, res: Response) => {
    try {
        // create multiple crop type at the time
        let pass = [];
        let fail = [];
        for await (const cropGrade of req.body.cropGrade) {
            let result = await CropGrade.findOne({ where: { cropGrade: { [Op.iLike]: cropGrade }, cropVariety_id: req.body.cropVarietyId } })
            if (result) {
                fail.push({ data: result });
            } else {
                const cropsVariety = await CropGrade.create({ cropGrade: cropGrade, cropVariety_id: req.body.cropVarietyId, cropGrade_status: true });
                pass.push({ data: cropsVariety });
            }
        }
        res.sendSuccess(res, { pass, fail });
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

// const fetchCropGrade = async (req: Request, res: Response) => {
//     const searchTerm = req.query.search || '';
//     const sortOrder = req.query.sort || 'asc';
//     const cropVarietyId = req.query.cropVarietyId;
//     const whereCondition: any = {}
//     try {
//         if (searchTerm) {
//             whereCondition[Op.or] = [
//                 { cropGrade: { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type 
//                 { '$cropVariety.cropVariety$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type 
//                 { '$cropVariety.cropType.cropType_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type 
//                 { '$cropVariety.cropType.crop.crop_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop name
//             ];
//         }
//         if (cropVarietyId) {
//             whereCondition.cropVariety_id = cropVarietyId;
//         }
//         const cropGrade = await CropGrade.findAll({
//             where: whereCondition,
//             include: [{
//                 model: CropVariety, as: 'cropVariety', include:
//                     [{ model: CropType, as: 'cropType', include: [{ model: Crop, as: 'crop' }] }]
//             }],
//             order: [
//                 ['cropGrade', sortOrder], // Sort the results based on the 'username' field and the specified order
//             ],
//         });
//         return res.sendSuccess(res, cropGrade);
//     } catch (error) {
//         return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
//     }
// }

const fetchCropGradePagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const status = req.query.status || '';
    const sortOrder = req.query.sort || 'desc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const cropVarietyId = req.query.cropVarietyId;
    const offset = (page - 1) * limit;
    const whereCondition: any = {}
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { cropGrade: { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type 
                { '$cropVariety.cropVariety$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type 
                { '$cropVariety.cropType.cropType_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type 
                { '$cropVariety.cropType.crop.crop_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop name
            ];
        }
        if (cropVarietyId) {
            whereCondition.cropVariety_id = cropVarietyId;
        }
        if (status === 'true') {
            whereCondition.cropGrade_status = true
        }
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await CropGrade.findAndCountAll({
                where: whereCondition,
                include: [{
                    model: CropVariety, as: 'cropVariety', include:
                        [{ model: CropType, as: 'cropType', include: [{ model: Crop, as: 'crop' }] }]
                }],
                order: [
                    ['id', sortOrder],
                ],// Sort the results based on the 'cropGrade' field and the specified order
                offset: offset,
                limit: limit
            });

            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const cropGrade = await CropGrade.findAll({
                where: whereCondition,
                include: [{
                    model: CropVariety, as: 'cropVariety', include:
                        [{ model: CropType, as: 'cropType', include: [{ model: Crop, as: 'crop' }] }]
                }],
                order: [
                    ['id', sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
            });
            return res.sendSuccess(res, cropGrade);
        }


    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.message);
    }
}


const updateCropGrade = async (req: Request, res: Response) => {
    try {
        let result = await CropGrade.findOne({ where: { cropVariety_id: req.body.cropVarietyId, cropGrade: { [Op.iLike]: req.body.cropGrade }, id: { [Op.ne]: req.body.id } } })
        if (result) {
            return res.sendError(res, "ALREADY_EXITS");
        }
        const cropGrade = await CropGrade.update({
            cropVariety_id: req.body.cropVarietyId,
            cropGrade: req.body.cropGrade
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, cropGrade);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const updateCropGradeStatus = async (req: Request, res: Response) => {
    try {
        const cropGrade = await CropGrade.update({ cropGrade_status: req.body.status }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, cropGrade);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const deleteCropGrade = async (req: Request, res: Response) => {
    try {
        const cropGrade = await CropGrade.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, cropGrade);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}


export {
    createCropGrade,
    createCropGrades,
    fetchCropGradePagination,
    updateCropGrade,
    updateCropGradeStatus,
    deleteCropGrade
};