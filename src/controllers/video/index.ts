import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import Video from "../../models/video.model";

const createVideoName = async (req: Request, res: Response) => {
    try {
        const data = {
            country: req.body.country,
            brand: req.body.brand,
            processor: req.body.processor,
            title: req.body.title,
            description: req.body.description,
            video: req.body.video,
            status: true,
        };
        const result = await Video.create(data);
        res.sendSuccess(res, result);
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}


const fetchVideoNamePagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'asc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const brandId = req.query.brandId;
    const whereCondition: any = {}
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { processor: { [Op.iLike]: `%${searchTerm}%` } }, // Search by Video processor
                { title: { [Op.iLike]: `%${searchTerm}%` } }, // Search by Video title
                { description: { [Op.iLike]: `%${searchTerm}%` } }, // Search by Video description
            ];
        }

        if (brandId) {
            whereCondition.brand = { [Op.contains]: [brandId] }
        }

        //fetch data with pagination
        if (req.query.pagination === 'true') {
            const { count, rows } = await Video.findAndCountAll({
                where: whereCondition,
                order: [
                    ['title', sortOrder], // Sort the results based on the 'name' field and the specified order
                ],
                offset: offset,
                limit: limit
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const result = await Video.findAll({
                where: whereCondition,
                order: [
                    ['title', sortOrder], // Sort the results based on the 'name' field and the specified order
                ],
            });
            return res.sendSuccess(res, result);
        }

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}


const updateVideoName = async (req: Request, res: Response) => {
    try {
        const result = await Video.update({
            country: req.body.country,
            brand: req.body.brand,
            processor: req.body.processor,
            title: req.body.title,
            description: req.body.description,
            video: req.body.video,
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, result);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const updateVideoNameStatus = async (req: Request, res: Response) => {
    try {
        const result = await Video.update({
            status: req.body.status
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, result);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const deleteVideoName = async (req: Request, res: Response) => {
    try {
        const result = await Video.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, result);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}


export {
    createVideoName,
    fetchVideoNamePagination,
    updateVideoName,
    updateVideoNameStatus,
    deleteVideoName
};