import { Request, Response } from "express";
import { Op } from "sequelize";
import CropCurrentSeason from "../../models/crop-current-season.model";

const createCropCurrentSeason = async (req: Request, res: Response) => {
    try {
        let result = await CropCurrentSeason.findOne({ where: { crop_name: { [Op.iLike]: req.body.cropName } } });
        if (result) {
            return res.sendError(res, "Crop name already exist, please try different name.");
        }

        const cropCurrentSeason = await CropCurrentSeason.create({ crop_name: req.body.cropName });
        res.sendSuccess(res, cropCurrentSeason);
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

const createCropCurrentSeasons = async (req: Request, res: Response) => {
    try {
        let pass = [];
        let fail = [];
        for await (const cropName of req.body.cropNames) {
            let result = await CropCurrentSeason.findOne({ where: { crop_name: { [Op.iLike]: cropName } } })
            if (result) {
                fail.push({ data: result });
            } else {
                const result = await CropCurrentSeason.create({ crop_name: cropName });
                pass.push({ data: result });
            }
        }
        res.sendSuccess(res, { pass, fail });
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

const fetchCropCurrentSeasonPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'desc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const whereCondition: any = {};
        if (searchTerm) {
            whereCondition.crop_name = { [Op.iLike]: `%${searchTerm}%` }
        }

        if (req.query.pagination === "true") {
            const { count, rows } = await CropCurrentSeason.findAndCountAll({
                where: whereCondition,
                order: [
                    ['id', sortOrder]
                ],
                offset: offset,
                limit: limit
            });

            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const cropCurrentSeason = await CropCurrentSeason.findAll({
                where: whereCondition,
                order: [
                    ['id', sortOrder]
                ],
            });

            return res.sendSuccess(res, cropCurrentSeason);
        }
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

const updateCropCurrentSeason = async (req: Request, res: Response) => {
    try {
        let result = await CropCurrentSeason.findOne({ where: { crop_name: { [Op.iLike]: req.body.cropName }, id: { [Op.ne]: req.body.id } } });
        if (result) {
            return res.sendError(res, "ALREADY_EXITS");
        }
        const cropCurrentSeason = await CropCurrentSeason.update({
            crop_name: req.body.cropName
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { cropCurrentSeason });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const deleteCropCurrentSeason = async (req: Request, res: Response) => {
    try {
        const cropCurrentSeason = await CropCurrentSeason.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { cropCurrentSeason });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

export {
    createCropCurrentSeason,
    createCropCurrentSeasons,
    fetchCropCurrentSeasonPagination,
    updateCropCurrentSeason,
    deleteCropCurrentSeason
};