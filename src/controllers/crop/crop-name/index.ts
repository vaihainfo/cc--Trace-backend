import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";

import Crop from "../../../models/crop.model";
import CropType from "../../../models/crop-type.model";


const createCrop = async (req: Request, res: Response) => {
    try {
        const data = {
            crop_name: req.body.cropName,
            crop_status: true
        };
        const crops = await Crop.create(data);
        res.sendSuccess(res, { crops });
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const createCrops = async (req: Request, res: Response) => {
    try {
        // create multiple crops at the time
        let pass = [];
        let fail = [];
        for await (const crop of req.body.cropsName) {
            let cop = await Crop.findOne({ where: { crop_name: { [Op.iLike]: crop } } })
            if (cop) {
                fail.push({ data: cop });
            } else {
                const crops = await Crop.create({ crop_name: crop, crop_status: true });
                pass.push({ data: crops });
            }
        }
        res.sendSuccess(res, { pass, fail });
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

// const fetchCrops = async (req: Request, res: Response) => {
//     const searchTerm = req.query.search || '';
//     const sortOrder = req.query.sort || 'asc';

//     try {
//         const crops = await Crop.findAll({
//             where: {
//                 crop_name: { [Op.iLike]: `%${searchTerm}%` },
//             },
//             order: [
//                 ['crop_name', sortOrder], // Sort the results based on the 'username' field and the specified order
//             ],
//         });
//         console.log('all countries', crops, searchTerm);
//         return res.sendSuccess(res, { crops });
//     } catch (error) {
//         console.log(error)
//         return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
//     }
// }

const fetchCropsPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const status = req.query.status || '';
    const sortOrder = req.query.sort || 'desc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {

        if (status === 'true') {
            whereCondition.crop_status = true;
        }
        if (searchTerm) {
            whereCondition.crop_name = { [Op.iLike]: `%${searchTerm}%` }
        }

        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await Crop.findAndCountAll({
                where: whereCondition,
                order: [
                    ['id', sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
                offset: offset,
                limit: limit
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const crops = await Crop.findAll({
                where: whereCondition,
                order: [
                    ['id', sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
            });
            return res.sendSuccess(res, { crops });
        }


    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}


const updateCrop = async (req: Request, res: Response) => {
    try {
        let cro = await Crop.findOne({ where: { crop_name: { [Op.iLike]: req.body.cropName }, id: { [Op.ne]: req.body.id } } })
        if (cro) {
            return res.sendError(res, "ALREADY_EXITS");
        }
        const crop = await Crop.update({ crop_name: req.body.cropName }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { crop });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const updateCropStatus = async (req: Request, res: Response) => {
    try {
        const crop = await Crop.update({ crop_status: req.body.status }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { crop });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const deleteCrop = async (req: Request, res: Response) => {
    try {
        let count = await CropType.count({ where: { crop_id: req.body.id } });
        if (count > 0) {
            return res.sendError(res, 'Can not delete beacause Crop is assosiated to another table');
        }
        const crop = await Crop.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { crop });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const checkCrops = async (req: Request, res: Response) => {
    try {
        let whereCondition: any = {}
        if (req.body.id) {
            whereCondition = { crop_name: { [Op.iLike]: req.body.cropName }, id: { [Op.ne]: req.body.id } }
        } else {
            whereCondition = { crop_name: { [Op.iLike]: req.body.cropName } }
        }
        let result = await Crop.findOne({ where: whereCondition })

        res.sendSuccess(res, result ? { exist: true } : { exist: false });
    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.message);
    }
}


export {
    createCrop,
    createCrops,
    fetchCropsPagination,
    updateCrop,
    updateCropStatus,
    deleteCrop,
    checkCrops
};