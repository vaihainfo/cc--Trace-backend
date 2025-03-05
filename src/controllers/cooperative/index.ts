import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import Cooperative from "../../models/cooperative.model";


const createCooperative = async (req: Request, res: Response) => {
    try {
        let result = await Cooperative.findOne({ where: { name: { [Op.iLike]: req.body.name } } })
        if (result) {
            return res.sendError(res, "Cooperative Name already exist");
        }
        const data = {
            name: req.body.name,
            address: req.body.address,
            country: req.body.country,
            contact_person: req.body.contactPerson,
            mobile: req.body.mobile,
            email: req.body.email,
            status: true
        };
        const cooperative = await Cooperative.create(data);
        res.sendSuccess(res, cooperative);
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const fetchCooperativePagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'desc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status || '';
    const offset = (page - 1) * limit;
    const whereCondition: any = {}
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { name: { [Op.iLike]: `%${searchTerm}%` } }, // Search by name 
                { address: { [Op.iLike]: `%${searchTerm}%` } }, // Search by address
                { country: { [Op.iLike]: `%${searchTerm}%` } }, // Search by contry
                { contact_person: { [Op.iLike]: `%${searchTerm}%` } },// Search by contact person
                { mobile: { [Op.iLike]: `%${searchTerm}%` } },// Search by mobile
                { email: { [Op.iLike]: `%${searchTerm}%` } }// Search by email
            ];
        }
        if (status === 'true') {
            whereCondition.status = true
        }
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await Cooperative.findAndCountAll({
                where: whereCondition,
                order: [
                    ['id', sortOrder], // Sort the results based on the 'name' field and the specified order
                ],
                offset: offset,
                limit: limit
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const cooperative = await Cooperative.findAll({
                where: whereCondition,
                order: [
                    ['id', sortOrder], // Sort the results based on the 'name' field and the specified order
                ],
            });
            return res.sendSuccess(res, cooperative);
        }
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const updateCooperative = async (req: Request, res: Response) => {
    try {
        let result = await Cooperative.findOne({ where: { name: { [Op.iLike]: req.body.name }, id: { [Op.ne]: req.body.id } } })
        if (result) {
            return res.sendError(res, "ALREADY_EXITS");
        }
        const cooperative = await Cooperative.update({
            name: req.body.name,
            address: req.body.address,
            country: req.body.country,
            contact_person: req.body.contactPerson,
            mobile: req.body.mobile,
            email: req.body.email,
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, cooperative);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const updateCooperativeStatus = async (req: Request, res: Response) => {
    try {
        const cooperative = await Cooperative.update({
            status: req.body.status
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, cooperative);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const deleteCooperative = async (req: Request, res: Response) => {
    try {
        const cooperative = await Cooperative.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { cooperative });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}


export {
    createCooperative,
    fetchCooperativePagination,
    updateCooperative,
    updateCooperativeStatus,
    deleteCooperative
};