import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";

import TicketTracker from "../../models/ticket-tracker.model";
import TicketTrackerStatus from "../../models/ticketing-status.model";
import Spinner from "../../models/spinner.model";
import User from "../../models/user.model";
import Ginner from "../../models/ginner.model";
import Knitter from "../../models/knitter.model";
import Weaver from "../../models/weaver.model";
import Garment from "../../models/garment.model";


const createTicketTracker = async (req: Request, res: Response) => {
    try {
        // Check if a ticket already exists with the same criteria
        const existingTicket = await TicketTracker.findOne({
            where: {
                process_id: req.body.processorId,
                processor_name: req.body.processorName,
                processor_type: req.body.processorType,
                style_mark_no: req.body.styleMarkNo,
                ticket_type: req.body.ticketType,
                process_or_sales: req.body.processOrSales,
                status: {
                    [Op.notIn]: ['Resolved', 'Rejected']
                }
            }
        });

        if (existingTicket) {
            // Ticket already exists
            return res.sendError(res, 'Ticket already exists with the same Lot Number, Data correction Type and Ticket Type');
        }

        const lastTicket = await TicketTracker.findOne({
            order: [['ticket_no', 'DESC']],
            attributes: ['ticket_no'],
        });

        let nextTicketNo;
        if (lastTicket) {
            nextTicketNo = Number(lastTicket.ticket_no) + 1;
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
    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.message);
    }
}

const fetchTicketTracker = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const whereCondition: any = {}

    const { status, processor, from, to, processSale, processorId, brandId, countryId }: any = req.query;

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
                .map((id: any) => id.toLowerCase());
                whereCondition.processor_type = {
                    [Op.iLike]: { [Op.any]: idArray.map(id => `%${id}%`) }
                };
        }

        if (brandId) {
            const idArray = brandId.split(",").map((id: any) => parseInt(id, 10));
        
            const [spinner, ginner, knitter, weaver, garment] = await Promise.all([
                Spinner.findAll({ where: { brand: { [Op.overlap]: idArray } } }),
                Ginner.findAll({ where: { brand: { [Op.overlap]: idArray } } }),
                Knitter.findAll({ where: { brand: { [Op.overlap]: idArray } } }),
                Weaver.findAll({ where: { brand: { [Op.overlap]: idArray } } }),
                Garment.findAll({ where: { brand: { [Op.overlap]: idArray } } })
            ]);
        
            const processorConditions = [
                { processor_type: { [Op.iLike]: 'spinner' }, process_id: { [Op.in]: spinner.map((spin: any) => spin.id) } },
                { processor_type: { [Op.iLike]: 'ginner' }, process_id: { [Op.in]: ginner.map((gin: any) => gin.id) } },
                { processor_type: { [Op.iLike]: 'knitter' }, process_id: { [Op.in]: knitter.map((knit: any) => knit.id) } },
                { processor_type: { [Op.iLike]: 'weaver' }, process_id: { [Op.in]: weaver.map((weave: any) => weave.id) } },
                { processor_type: { [Op.iLike]: 'garment' }, process_id: { [Op.in]: garment.map((gar: any) => gar.id) } }
            ];
        
            if (whereCondition[Op.or]) {
                whereCondition[Op.and] = whereCondition[Op.and] || [];
                whereCondition[Op.and].push({ [Op.or]: processorConditions });
            } else {
                whereCondition[Op.or] = processorConditions;
            }
        }
        
        if (countryId) {
            const idArray = countryId.split(",").map((id: any) => parseInt(id, 10));
        
            const [spinner, ginner, knitter, weaver, garment] = await Promise.all([
                Spinner.findAll({ where: { country_id: { [Op.in]: idArray } } }),
                Ginner.findAll({ where: { country_id: { [Op.in]: idArray } } }),
                Knitter.findAll({ where: { country_id: { [Op.in]: idArray } } }),
                Weaver.findAll({ where: { country_id: { [Op.in]: idArray } } }),
                Garment.findAll({ where: { country_id: { [Op.in]: idArray } } })
            ]);
        
            const processorConditions = [
                { processor_type: { [Op.iLike]: 'spinner' }, process_id: { [Op.in]: spinner.map((spin: any) => spin.id) } },
                { processor_type: { [Op.iLike]: 'ginner' }, process_id: { [Op.in]: ginner.map((gin: any) => gin.id) } },
                { processor_type: { [Op.iLike]: 'knitter' }, process_id: { [Op.in]: knitter.map((knit: any) => knit.id) } },
                { processor_type: { [Op.iLike]: 'weaver' }, process_id: { [Op.in]: weaver.map((weave: any) => weave.id) } },
                { processor_type: { [Op.iLike]: 'garment' }, process_id: { [Op.in]: garment.map((gar: any) => gar.id) } }
            ];
        
            if (whereCondition[Op.or]) {
                whereCondition[Op.and] = whereCondition[Op.and] || [];
                whereCondition[Op.and].push({ [Op.or]: processorConditions });
            } else {
                whereCondition[Op.or] = processorConditions;
            }
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
            const searchConditions = [
                { ticket_type: { [Op.iLike]: `%${searchTerm}%` } },
                { processor_name: { [Op.iLike]: `%${searchTerm}%` } },
                { processor_type: { [Op.iLike]: `%${searchTerm}%` } },
                { process_or_sales: { [Op.iLike]: `%${searchTerm}%` } },
                { style_mark_no: { [Op.iLike]: `%${searchTerm}%` } },
                { comments: { [Op.iLike]: `%${searchTerm}%` } }
            ];
        
            if (whereCondition[Op.or]) {
                whereCondition[Op.and] = whereCondition[Op.and] || [];
                whereCondition[Op.and].push({ [Op.or]: searchConditions });
            } else {
                whereCondition[Op.or] = searchConditions;
            }
        }

        let queryOptions: any = {
            where: whereCondition,
        };

        if (req.query.pagination === 'true') {
            queryOptions.offset = offset;
            queryOptions.limit = limit;
            queryOptions.order = [
                ['date', 'desc'], // Sort the results based on the 'username' field and the specified order
            ];

            const { count, rows } = await TicketTracker.findAndCountAll(queryOptions);
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const training = await TicketTracker.findAll({
            });
            return res.sendSuccess(res, training);
        }

    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.message);
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
        console.log(error)
        return res.sendError(res, error.message);
    }
}

const fetchTicketTrackerStatus = async (req: Request, res: Response) => {

    try {
        const training = await TicketTrackerStatus.findAll({
            where: { ticket_id: req.query.ticketId },
            order: [
                ['createdAt', 'desc'], // Sort the results based on the 'username' field and the specified order
            ],
            include: [
                {
                    model: TicketTracker,
                    as: 'ticket'
                },
                {
                    model: User,
                    as: 'user'
                }
            ],

        });
        return res.sendSuccess(res, training);

    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.message);
    }
}

const countTicketTracker = async (req: Request, res: Response) => {
    try {
        const whereCondition: any = {};
        const { processor,programId, brandId, countryId, stateId, ginnerId, spinnerId, weaverId, knitterId, garmentId }: any = req.query;

        if (req.query.status) {
            whereCondition.status = req.query.status;
        }

        if (brandId) {
            const idArray = brandId.split(",").map((id: any) => parseInt(id, 10));
        
            const [spinner, ginner, knitter, weaver, garment] = await Promise.all([
                Spinner.findAll({ where: { brand: { [Op.overlap]: idArray } } }),
                Ginner.findAll({ where: { brand: { [Op.overlap]: idArray } } }),
                Knitter.findAll({ where: { brand: { [Op.overlap]: idArray } } }),
                Weaver.findAll({ where: { brand: { [Op.overlap]: idArray } } }),
                Garment.findAll({ where: { brand: { [Op.overlap]: idArray } } })
            ]);
        
            const processorConditions = [
                { processor_type: { [Op.iLike]: 'spinner' }, process_id: { [Op.in]: spinner.map((spin: any) => spin.id) } },
                { processor_type: { [Op.iLike]: 'ginner' }, process_id: { [Op.in]: ginner.map((gin: any) => gin.id) } },
                { processor_type: { [Op.iLike]: 'knitter' }, process_id: { [Op.in]: knitter.map((knit: any) => knit.id) } },
                { processor_type: { [Op.iLike]: 'weaver' }, process_id: { [Op.in]: weaver.map((weave: any) => weave.id) } },
                { processor_type: { [Op.iLike]: 'garment' }, process_id: { [Op.in]: garment.map((gar: any) => gar.id) } }
            ];
        
            if (whereCondition[Op.or]) {
                whereCondition[Op.and] = whereCondition[Op.and] || [];
                whereCondition[Op.and].push({ [Op.or]: processorConditions });
            } else {
                whereCondition[Op.or] = processorConditions;
            }
        }
        

        if (programId) {
            const idArray = programId.split(",").map((id: any) => parseInt(id, 10));
        
            const [spinner, ginner, knitter, weaver, garment] = await Promise.all([
                Spinner.findAll({ where: { program_id: { [Op.overlap]: idArray } } }),
                Ginner.findAll({ where: { program_id: { [Op.overlap]: idArray } } }),
                Knitter.findAll({ where: { program_id: { [Op.overlap]: idArray } } }),
                Weaver.findAll({ where: { program_id: { [Op.overlap]: idArray } } }),
                Garment.findAll({ where: { program_id: { [Op.overlap]: idArray } } })
            ]);
        
            const processorConditions = [
                { processor_type: { [Op.iLike]: 'spinner' }, process_id: { [Op.in]: spinner.map((spin: any) => spin.id) } },
                { processor_type: { [Op.iLike]: 'ginner' }, process_id: { [Op.in]: ginner.map((gin: any) => gin.id) } },
                { processor_type: { [Op.iLike]: 'knitter' }, process_id: { [Op.in]: knitter.map((knit: any) => knit.id) } },
                { processor_type: { [Op.iLike]: 'weaver' }, process_id: { [Op.in]: weaver.map((weave: any) => weave.id) } },
                { processor_type: { [Op.iLike]: 'garment' }, process_id: { [Op.in]: garment.map((gar: any) => gar.id) } }
            ];
        
            if (whereCondition[Op.or]) {
                whereCondition[Op.and] = whereCondition[Op.and] || [];
                whereCondition[Op.and].push({ [Op.or]: processorConditions });
            } else {
                whereCondition[Op.or] = processorConditions;
            }
        }

        if (countryId) {
            const idArray = countryId.split(",").map((id: any) => parseInt(id, 10));
        
            const [spinner, ginner, knitter, weaver, garment] = await Promise.all([
                Spinner.findAll({ where: { country_id: { [Op.in]: idArray } } }),
                Ginner.findAll({ where: { country_id: { [Op.in]: idArray } } }),
                Knitter.findAll({ where: { country_id: { [Op.in]: idArray } } }),
                Weaver.findAll({ where: { country_id: { [Op.in]: idArray } } }),
                Garment.findAll({ where: { country_id: { [Op.in]: idArray } } })
            ]);
        
            const processorConditions = [
                { processor_type: { [Op.iLike]: 'spinner' }, process_id: { [Op.in]: spinner.map((spin: any) => spin.id) } },
                { processor_type: { [Op.iLike]: 'ginner' }, process_id: { [Op.in]: ginner.map((gin: any) => gin.id) } },
                { processor_type: { [Op.iLike]: 'knitter' }, process_id: { [Op.in]: knitter.map((knit: any) => knit.id) } },
                { processor_type: { [Op.iLike]: 'weaver' }, process_id: { [Op.in]: weaver.map((weave: any) => weave.id) } },
                { processor_type: { [Op.iLike]: 'garment' }, process_id: { [Op.in]: garment.map((gar: any) => gar.id) } }
            ];
        
            if (whereCondition[Op.or]) {
                whereCondition[Op.and] = whereCondition[Op.and] || [];
                whereCondition[Op.and].push({ [Op.or]: processorConditions });
            } else {
                whereCondition[Op.or] = processorConditions;
            }
        }

        if (stateId) {
            const idArray = stateId.split(",").map((id: any) => parseInt(id, 10));
        
            const [spinner, ginner, knitter, weaver, garment] = await Promise.all([
                Spinner.findAll({ where: { state_id: { [Op.in]: idArray } } }),
                Ginner.findAll({ where: { state_id: { [Op.in]: idArray } } }),
                Knitter.findAll({ where: { state_id: { [Op.in]: idArray } } }),
                Weaver.findAll({ where: { state_id: { [Op.in]: idArray } } }),
                Garment.findAll({ where: { state_id: { [Op.in]: idArray } } })
            ]);
        
            const processorConditions = [
                { processor_type: { [Op.iLike]: 'spinner' }, process_id: { [Op.in]: spinner.map((spin: any) => spin.id) } },
                { processor_type: { [Op.iLike]: 'ginner' }, process_id: { [Op.in]: ginner.map((gin: any) => gin.id) } },
                { processor_type: { [Op.iLike]: 'knitter' }, process_id: { [Op.in]: knitter.map((knit: any) => knit.id) } },
                { processor_type: { [Op.iLike]: 'weaver' }, process_id: { [Op.in]: weaver.map((weave: any) => weave.id) } },
                { processor_type: { [Op.iLike]: 'garment' }, process_id: { [Op.in]: garment.map((gar: any) => gar.id) } }
            ];
        
            if (whereCondition[Op.or]) {
                whereCondition[Op.and] = whereCondition[Op.and] || [];
                whereCondition[Op.and].push({ [Op.or]: processorConditions });
            } else {
                whereCondition[Op.or] = processorConditions;
            }
        }

        const addProcessorFilter = (type : any, idArray : Array<number>) => {
            if (idArray && idArray.length > 0) {
                return {
                    processor_type: { [Op.iLike]: type },
                    process_id: { [Op.in]: idArray }
                };
            }
            return null;
        };


        let proConditions = [];

        if(ginnerId){
            proConditions.push(addProcessorFilter('ginner', ginnerId?.split(",").map((id: any) => parseInt(id, 10))));
        }

        if(spinnerId){
            proConditions.push(addProcessorFilter('spinner', spinnerId?.split(",").map((id: any) => parseInt(id, 10))));
        }


        if(knitterId){
            proConditions.push(addProcessorFilter('knitter', knitterId?.split(",").map((id: any) => parseInt(id, 10))));
        }


        if(weaverId){
            proConditions.push(addProcessorFilter('weaver', weaverId?.split(",").map((id: any) => parseInt(id, 10))));
        }


        if(garmentId){
            proConditions.push(addProcessorFilter('garment', garmentId?.split(",").map((id: any) => parseInt(id, 10))));
        }

            // Filter out null values
        const validProcessorFilters = proConditions.filter(filter => filter !== null);

        // Combine processor filters using Op.or
        if (validProcessorFilters.length > 0) {
            if (whereCondition[Op.or]) {
                whereCondition[Op.and] = whereCondition[Op.and] || [];
                whereCondition[Op.and].push({ [Op.or]: validProcessorFilters });
            } else {
                whereCondition[Op.or] = validProcessorFilters;
            }
        }


        const ticketTracker = await TicketTracker.findAll({
            where: whereCondition,
            attributes: [
                [Sequelize.literal('LOWER(processor_type)'), 'processor_type'],
                [Sequelize.fn('COUNT', Sequelize.col('*')), 'count'],
            ],
            group: [Sequelize.literal('LOWER(processor_type)')]
        });
        let data = []
        for (let track of ['Garment', 'Ginner', 'Weaver', 'Spinner', 'Knitter']) {
            let ticket = ticketTracker.find((obj: any) => obj?.processor_type?.toLowerCase() === track?.toLowerCase());
            if (ticket) {
                ticket.processor_type = track.charAt(0).toUpperCase() + track.slice(1).toLowerCase();
                data.push(ticket);
            } else {
                data.push({
                    "processor_type": track.charAt(0).toUpperCase() + track.slice(1).toLowerCase(),
                    "count": "0"
                });
            }
        }
        res.sendSuccess(res, data);
    } catch (error: any) {
        console.log(error)
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
