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


const fetchAllSeasonPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'asc';
    const sortName = req.query.sortName || 'name';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const brandId = Number(req.query.brandId);
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
            if(brandId){
                const seasonData:any = season.map((item:any)=> item.dataValues)
                return res.sendSuccess(res, seasonData?.slice(-3))
            }
            else{
                return res.sendSuccess(res, season);
            }
        }

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
    const brandId = Number(req.query.brandId);
    const offset = (page - 1) * limit;
    
    try {
        const allSeasons = await Season.findAll({
            where: {
                name: { [Op.iLike]: `%${searchTerm}%` }
            },
            order: [
                [sortName, sortOrder] 
            ],
            limit: limit,
            offset: offset            
        });
        const normalizeDate = (date: Date) => {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate());
        };
        const currentDate = normalizeDate(new Date());          
        let currentSeasonIndex = allSeasons.findIndex((season: any) => {
            const fromDate = normalizeDate(new Date(season.from));
            const toDate = normalizeDate(new Date(season.to));
            return currentDate >= fromDate && currentDate <= toDate;
        });

        if (currentSeasonIndex === -1) {
            currentSeasonIndex = allSeasons.length - 1;
        }

        const validSeasons = (sortOrder == 'desc')? allSeasons.slice(currentSeasonIndex , currentSeasonIndex + Number(limit)) :allSeasons.slice(0, currentSeasonIndex + 1);


        if (req.query.pagination === "true") {
            const paginatedSeasons = validSeasons.slice(offset, offset + limit);
            return res.sendPaginationSuccess(res, paginatedSeasons, validSeasons.length);
        } else {
            if (brandId) {
                const seasonData: any = validSeasons.map((item: any) => item.dataValues);
                return res.sendSuccess(res, seasonData.slice(-3));
            } else {
                return res.sendSuccess(res, validSeasons);
            }
        }

    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
};




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
    fetchAllSeasonPagination,
    fetchSeasonPagination,
    updateSeason,
    updateSeasonStatus,
    deleteSeason
};