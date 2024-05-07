import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import FarmGroup from "../../models/farm-group.model";
import ICS from "../../models/ics.model";
import Season from "../../models/season.model";

const createIcsName = async (req: Request, res: Response) => {
    try {
        const data = {
            farmGroup_id: req.body.farmGroupId,
            season_id: req.body.seasonId,
            ics_name: req.body.icsName,
            ics_latitude: req.body.icsLatitude,
            ics_longitude: req.body.icsLongitude,
            ics_status: true,
        };
        const result = await ICS.create(data);
        res.sendSuccess(res, result);
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const createIcsNames = async (req: Request, res: Response) => {
    try {
        // create multiple ics 
        let pass = [];
        let fail = [];
        for await (const obj of req.body.ics) {
            let result = await ICS.findOne({ where: { farmGroup_id: req.body.farmGroupId,season_id: req.body.seasonId, ics_name: { [Op.iLike]: obj.icsName } } })
            if (result) {
                fail.push({ data: result });
            } else {
                const result = await ICS.create({
                    farmGroup_id: req.body.farmGroupId,
                    season_id: req.body.seasonId,
                    ics_name: obj.icsName,
                    ics_latitude: obj.icsLatitude,
                    ics_longitude: obj.icsLongitude,
                    ics_status: true
                });
                pass.push({ data: result });
            }
        }
        res.sendSuccess(res, { pass, fail });

    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const fetchIcsNamePagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'desc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const farmGroupId: any = req.query.farmGroupId || '';
    const seasonId: any = req.query.seasonId || '';
    const offset = (page - 1) * limit;
    const status = req.query.status || '';
    const whereCondition: any = {}
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { ics_name: { [Op.iLike]: `%${searchTerm}%` } }, // Search by ics name
                { "$farmGroup.name$": { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type  
            ];
        }
        if (status === 'true') {
            whereCondition.ics_status = true
        }

        if (farmGroupId) {
            const idArray: number[] = farmGroupId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.farmGroup_id = { [Op.in]: idArray };
        }

        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.season_id = { [Op.in]: idArray };
        }

        //fetch data with pagination
        if (req.query.pagination === 'true') {
            const { count, rows } = await ICS.findAndCountAll({
                where: whereCondition,
                include: [
                    {
                        model: FarmGroup, as: 'farmGroup'
                    },
                    {
                        model: Season, as: 'season'
                    }
                ],
                order: [
                    ['id', sortOrder], // Sort the results based on the 'ics name' field and the specified order
                ],
                offset: offset,
                limit: limit
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const result = await ICS.findAll({
                where: whereCondition,
                include: [
                    {
                        model: FarmGroup, as: 'farmGroup'
                    }],
                order: [
                    ['id', sortOrder], // Sort the results based on the 'name' field and the specified order
                ],
            });
            return res.sendSuccess(res, result);
        }

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}


const updateIcsName = async (req: Request, res: Response) => {
    try {
        let resul = await ICS.findOne({
            where: {
                farmGroup_id: req.body.formGroupId,
                season_id: req.body.seasonId,
                ics_name: { [Op.iLike]: req.body.icsName }, id: { [Op.ne]: req.body.id }
            }
        })
        if (resul) {
            return res.sendError(res, "ALREADY_EXITS");
        }
        const result = await ICS.update({
            farmGroup_id: req.body.formGroupId,
            season_id: req.body.seasonId,
            ics_name: req.body.icsName,
            ics_latitude: req.body.icsLatitude,
            ics_longitude: req.body.icsLongitude,
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

const updateIcsNameStatus = async (req: Request, res: Response) => {
    try {
        const result = await ICS.update({
            ics_status: req.body.status
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

const deleteIcsName = async (req: Request, res: Response) => {
    try {
        const result = await ICS.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, result);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const checkIcsNames = async (req: Request, res: Response) => {
    try {
        let whereCondition: any = {}
        if (req.body.id) {
            whereCondition = {
                farmGroup_id: req.body.formGroupId, ics_name: { [Op.iLike]: req.body.icsName }, id: { [Op.ne]: req.body.id }
            }
        } else {
            whereCondition = { farmGroup_id: req.body.formGroupId, ics_name: { [Op.iLike]: req.body.icsName } }
        }
        let result = await ICS.findOne({ where: whereCondition })

        res.sendSuccess(res, result ? { exist: true } : { exist: false });
    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.message);
    }
}


export {
    createIcsName,
    checkIcsNames,
    createIcsNames,
    fetchIcsNamePagination,
    updateIcsName,
    updateIcsNameStatus,
    deleteIcsName
};