import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import FarmGroup from "../../models/farm-group.model";
import ICS from "../../models/ics.model";

const createIcsName = async (req: Request, res: Response) => {
    try {
        const data = {
            farmGroup_id: req.body.farmGroupId,
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
        const data = req.body.ics.map((obj: any) => {
            return {
                farmGroup_id: req.body.farmGroupId,
                ics_name: obj.icsName,
                ics_latitude: obj.icsLatitude,
                ics_longitude: obj.icsLongitude,
                ics_status: true
            }
        })
        const result = await ICS.bulkCreate(data);
        res.sendSuccess(res, result);
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const fetchIcsNamePagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'asc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const farmGroupId: any = req.query.farmGroupId || '';
    const offset = (page - 1) * limit;
    const whereCondition: any = {}
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { ics_name: { [Op.iLike]: `%${searchTerm}%` } }, // Search by ics name
                { "$farmGroup.name$": { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type  
            ];
        }

        if (farmGroupId) {
            const idArray: number[] = farmGroupId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.farmGroup_id = { [Op.in]: idArray };
        }
        //fetch data with pagination
        if (req.query.pagination === 'true') {
            const { count, rows } = await ICS.findAndCountAll({
                where: whereCondition,
                include: [
                    {
                        model: FarmGroup, as: 'farmGroup'
                    }],
                order: [
                    ['ics_name', sortOrder], // Sort the results based on the 'ics name' field and the specified order
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
                    ['ics_name', sortOrder], // Sort the results based on the 'name' field and the specified order
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
        const result = await ICS.update({
            farmGroup_id: req.body.formGroupId,
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


export {
    createIcsName,
    createIcsNames,
    fetchIcsNamePagination,
    updateIcsName,
    updateIcsNameStatus,
    deleteIcsName
};