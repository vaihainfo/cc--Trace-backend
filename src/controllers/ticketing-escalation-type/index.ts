import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";

import TicketEscalationTypes from "../../models/ticketing-escalation-type";


const createTicketEscalation = async (req: Request, res: Response) => {
    try {
        const data = {
            name: req.body.name,
            processor_type: req.body.processorType,
            correction_type: req.body.correctionType
        };
        const crops = await TicketEscalationTypes.create(data);
        res.sendSuccess(res, { crops });
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const createTicketEscalations = async (req: Request, res: Response) => {
    try {
        // create multiple crops at the time
        let pass = [];
        let fail = [];
        for await (const obj of req.body.ticketEscalation) {
            let result = await TicketEscalationTypes.findOne({ where: { name: { [Op.iLike]: obj.name } } })
            if (result) {
                fail.push(result);
            } else {
                const results = await TicketEscalationTypes.create({
                    name: obj.name,
                    processor_type: obj.processorType,
                    correction_type: obj.correctionType
                });
                pass.push(results);
            }
        }
        res.sendSuccess(res, { pass, fail });
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const fetchTicketEscalationPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const processorType = req.query.processorType || '';
    const correctionType = req.query.correctionType || '';
    const sortOrder = req.query.sort || 'desc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {

        if (searchTerm) {
            whereCondition.name = { [Op.iLike]: `%${searchTerm}%` }
        }
        if (processorType) {
            whereCondition.processor_type = { [Op.contains]: [processorType] }
        }
        if (correctionType) {
            whereCondition.correction_type = { [Op.contains]: [correctionType] }
        }
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await TicketEscalationTypes.findAndCountAll({
                where: whereCondition,
                order: [
                    ['id', sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
                offset: offset,
                limit: limit
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const crops = await TicketEscalationTypes.findAll({
                where: whereCondition,
                order: [
                    ['id', sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
            });
            return res.sendSuccess(res, crops);
        }


    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const deleteTicketEscalationTypes = async (req: Request, res: Response) => {
    try {

        const crop = await TicketEscalationTypes.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { crop });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}


export {
    createTicketEscalation,
    createTicketEscalations,
    fetchTicketEscalationPagination,
    deleteTicketEscalationTypes
};