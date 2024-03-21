import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";

import Season from "../../models/season.model";


const createSeason = async (req: Request, res: Response) => {
    try {
        let result = await Season.findOne({ where: { name: { [Op.iLike]: req.body.name } } });
        if (result) {
            return res.sendError(res, "Should not allow the duplicate entries");
        }
        const data = {
            name: req.body.name,
            from: req.body.from,
            to: req.body.to,
            status: true
        };
        const season = await Season.create(data);
        res.sendSuccess(res, season);
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}


const fetchSeasonPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'asc';
    const sortName = req.query.sortName || 'name';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await Season.findAndCountAll({
                where: {
                    name: { [Op.iLike]: `%${searchTerm}%` },
                },
                order: [
                    [sortName, sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
                offset: offset,
                limit: limit
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const season = await Season.findAll({
                where: {
                    name: { [Op.iLike]: `%${searchTerm}%` },
                },
                order: [
                    [sortName, sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
            });
            return res.sendSuccess(res, season);
        }

    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}


const updateSeason = async (req: Request, res: Response) => {
    try {
        let result = await Season.findOne({ where: { name: { [Op.iLike]: req.body.name }, id: { [Op.ne]: req.body.id } } });
        if (result) {
            return res.sendError(res, "Should not allow the duplicate entries");
        }
        const season = await Season.update({
            name: req.body.name,
            from: req.body.from,
            to: req.body.to
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { season });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const updateSeasonStatus = async (req: Request, res: Response) => {
    try {
        const season = await Season.update({
            status: req.body.status
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { season });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const deleteSeason = async (req: Request, res: Response) => {
    try {
        const season = await Season.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { season });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const checkSeasons = async (req: Request, res: Response) => {
    try {
        let whereCondition: any = {}
        if (req.body.id) {
            whereCondition = { name: { [Op.iLike]: req.body.name }, id: { [Op.ne]: req.body.id } }
        } else {
            whereCondition = { name: { [Op.iLike]: req.body.name } }
        }
        let result = await Season.findOne({ where: whereCondition })

        res.sendSuccess(res, result ? { exist: true } : { exist: false });
    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.message);
    }
}

export {
    createSeason,
    checkSeasons,
    fetchSeasonPagination,
    updateSeason,
    updateSeasonStatus,
    deleteSeason
};