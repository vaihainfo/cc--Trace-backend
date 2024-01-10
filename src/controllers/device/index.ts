import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import Device from "../../models/device.model";
import User from "../../models/user.model";

const createDevice = async (req: Request, res: Response) => {
    try {
        const data = {
            device_id: req.body.deviceId,
            staff_name: req.body.staffName,
            user_id: req.body.userId,
            entry_date: req.body.entryDate,
            status: true
        };
        const device = await Device.create(data);
        res.sendSuccess(res, device);
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

const fetchDevicePagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { brandId, farmGroupId, icsId } = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {}
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { device_id: { [Op.iLike]: `%${searchTerm}%` } }, // Search by device id 
                { staff_name: { [Op.iLike]: `%${searchTerm}%` } }, // Search by staff name
                { '$user.firstname$': { [Op.iLike]: `%${searchTerm}%` } },  // Search by user name            
            ];
        }

        let include = [
            {
                model: User, as: 'user', attributes: ['id', 'firstname', 'lastname', 'username']
            }
        ]
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await Device.findAndCountAll({
                where: whereCondition,
                include: include,
                offset: offset,
                limit: limit
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const data = await Device.findAll({
                where: whereCondition,
                include: include
            });
            return res.sendSuccess(res, data);
        }
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

const updateDeviceStatus = async (req: Request, res: Response) => {
    try {
        const device = await Device.update({ status: req.body.status }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { device });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const updateDevice = async (req: Request, res: Response) => {
    try {
        const device = await Device.update({
            user_id: req.body.userId
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, device);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}


const deleteDevice = async (req: Request, res: Response) => {
    try {
        const device = await Device.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { device });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

export {
    createDevice,
    fetchDevicePagination,
    updateDevice,
    updateDeviceStatus,
    deleteDevice
};