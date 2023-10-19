import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";

import TicketTracker from "../../models/ticket-tracker.model";
import TicketTrackerStatus from "../../models/ticketing-status.model";
import Spinner from "../../models/spinner.model";


const createTicketTracker = async (req: Request, res: Response) => {
    try {
        const lastTicket = await TicketTracker.findOne({
            order: [['ticket_no', 'DESC']],
            attributes: ['ticket_no'],
        });

        let nextTicketNo;
        if (lastTicket) {
            nextTicketNo = lastTicket.ticket_no + 1;
        } else {
            nextTicketNo = 1; // If there are no existing tickets
        }

        const data = {
            ticket_no: nextTicketNo,
            date: new Date(),
            process_id: req.body.processorId,
            processor_name: req.body.processorName,
            processor_type: req.body.processorType,
            ticket_type: req.body.ticketType,
            process_or_sales: req.body.processOrSales,
            style_mark_no: req.body.styleMarkNo,
            comments: req.body.comments,
            documents: req.body.documents,
            status: 'Pending'
        };
        const training = await TicketTracker.create(data);
        let dataa = await TicketTrackerStatus.create({
            status: 'Pending',
            comment: req.body.comments,
            user_id: req.body.userId,
            ticket_id: training.id
        })
        res.sendSuccess(res, training);
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const fetchTicketTracker = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const whereCondition: any = {}

    const { status, processor, from, to, processSale, processorId, brandId }: any = req.query;

    try {
        if (status) {
            const idArray: any[] = status
                .split(",")
                .map((id: any) => id);
            whereCondition.status = { [Op.in]: idArray };
        }

        if (processor) {
            const idArray: any[] = processor
                .split(",")
                .map((id: any) => id);
            whereCondition.processor_type = { [Op.in]: idArray };
        }

        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            let spinner = await Spinner.findAll({ where: { brand: { [Op.overlap]: idArray } } });
            const arry: number[] = spinner
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.process_id = { [Op.in]: arry };
        }

        if (processorId) {
            const idArray: number[] = processorId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.process_id = { [Op.in]: idArray };
        }

        if (from && to) {
            whereCondition.date = {
                [Op.between]: [from, to]
            }
        }

        if (processSale) {
            whereCondition.process_or_sales = processSale;
        }


        if (searchTerm) {
            whereCondition[Op.or] = [
                { ticket_type: { [Op.iLike]: `%${searchTerm}%` } },
                { processor_name: { [Op.iLike]: `%${searchTerm}%` } },
                { processor_type: { [Op.iLike]: `%${searchTerm}%` } },
                { process_or_sales: { [Op.iLike]: `%${searchTerm}%` } },
                { style_mark_no: { [Op.iLike]: `%${searchTerm}%` } },
                { comments: { [Op.iLike]: `%${searchTerm}%` } }
            ]
        }

        let queryOptions: any = {
            where: whereCondition,
        };

        if (req.query.pagination === 'true') {
            queryOptions.offset = offset;
            queryOptions.limit = limit;

            const { count, rows } = await TicketTracker.findAndCountAll(queryOptions);
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const training = await TicketTracker.findAll({
            });
            return res.sendSuccess(res, training);
        }

    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const updateTicketTrackerStatus = async (req: Request, res: Response) => {
    try {
        if (req.body.status === 'Approved'
            || req.body.status === 'Rejected' || req.body.status === 'Resolved'
            || req.body.status === 'In Progress') {
            const training = await TicketTracker.update({
                status: req.body.status,
                resolved_date: req.body.status === 'Resolved' ? Date.now() : null
            }, {
                where: {
                    id: req.body.id
                }
            });
        }
        let data = await TicketTrackerStatus.create({
            status: req.body.status,
            comment: req.body.comment,
            user_id: req.body.userId,
            ticket_id: req.body.id
        })

        res.sendSuccess(res, { data });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const fetchTicketTrackerStatus = async (req: Request, res: Response) => {

    try {
        const training = await TicketTrackerStatus.findAll({
            where: { ticket_id: req.query.ticketId },
            include: [{
                model: TicketTracker,
                as: 'ticket'
            }]
        });
        return res.sendSuccess(res, training);

    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const countTicketTracker = async (req: Request, res: Response) => {
    try {
        const whereCondition: any = {}
        if (req.query.status) {
            whereCondition.status = req.query.status;
        }
        const ticketTracker = await TicketTracker.findAll({
            where: whereCondition,
            attributes: [
                'processor_type',
                [Sequelize.fn('COUNT', Sequelize.col('processor_type')), 'count'],
            ],
            group: ['processor_type']
        });
        let data = []
        for (let track of ['garment', 'ginner', 'weaver', 'spinner', 'knitter']) {
            let ticket = ticketTracker.find((obj: any) => obj.processor_type === track);
            if (ticket) data.push(ticket);
            else data.push({
                "processor_type": track,
                "count": "0"
            })
        }
        res.sendSuccess(res, data);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

export {
    createTicketTracker,
    fetchTicketTracker,
    updateTicketTrackerStatus,
    fetchTicketTrackerStatus,
    countTicketTracker
};
