import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import ProcessorTraining from "../../models/processor-training.model";
import Brand from "../../models/brand.model";
import Country from "../../models/country.model";
import State from "../../models/state.model";
import Ginner from "../../models/ginner.model";
import ProcessTrainingProcessStatus from "../../models/process-training-process-status.model";
import Spinner from "../../models/spinner.model";
import Trader from "../../models/trader.model";
import Knitter from "../../models/knitter.model";
import Weaver from "../../models/weaver.model";
import Garment from "../../models/garment.model";


const createTraining = async (req: Request, res: Response) => {
    // create training
    try {
        const data = {
            training_type: req.body.trainingType,
            brand_id: req.body.brandId,
            country_id: req.body.countryId,
            state_id: req.body.stateId,
            processor: req.body.processor,
            training_mode: req.body.trainingMode,
            processor_name: req.body.processorName,
            training_description: req.body.trainingDescription,
            venue: req.body.venue,
            date: req.body.date,
            start_time: req.body.startTime,
            end_time: req.body.endTime,
            status: 'Pending'
        };
        const training = await ProcessorTraining.create(data);
        if (req.body.processor === 'Ginner') {
            if (req.body.processorName) {
                let create = await ProcessTrainingProcessStatus.create({
                    ginner_id: Number(req.body.processorName),
                    process_training_id: training.id,
                    status: 'Pending'
                })
            } else {
                let data = await Ginner.findAll({ where: { country_id: req.body.countryId, state_id: req.body.stateId } });
                for await (let obj of data) {
                    let create = await ProcessTrainingProcessStatus.create({
                        ginner_id: obj.id,
                        process_training_id: training.id,
                        status: 'Pending'
                    })
                }
            }
        }
        if (req.body.processor === 'Spinner') {
            if (req.body.processorName) {
                let create = await ProcessTrainingProcessStatus.create({
                    spinner_id: Number(req.body.processorName),
                    process_training_id: training.id,
                    status: 'Pending'
                })
            } else {
                let data = await Spinner.findAll({ where: { country_id: req.body.countryId, state_id: req.body.stateId } });
                for await (let obj of data) {
                    let create = await ProcessTrainingProcessStatus.create({
                        spinner_id: obj.id,
                        process_training_id: training.id,
                        status: 'Pending'
                    })
                }
            }
        }
        if (req.body.processor === 'Trader') {
            if (req.body.processorName) {
                let create = await ProcessTrainingProcessStatus.create({
                    trader_id: Number(req.body.processorName),
                    process_training_id: training.id,
                    status: 'Pending'
                })
            } else {
                let data = await Trader.findAll({ where: { country_id: req.body.countryId, state_id: req.body.stateId } });
                for await (let obj of data) {
                    let create = await ProcessTrainingProcessStatus.create({
                        trader_id: obj.id,
                        process_training_id: training.id,
                        status: 'Pending'
                    })
                }
            }
        }
        if (req.body.processor === 'Knitter') {
            if (req.body.processorName) {
                let create = await ProcessTrainingProcessStatus.create({
                    knitter_id: Number(req.body.processorName),
                    process_training_id: training.id,
                    status: 'Pending'
                })
            } else {
                let data = await Knitter.findAll({ where: { country_id: req.body.countryId, state_id: req.body.stateId } });
                for await (let obj of data) {
                    let create = await ProcessTrainingProcessStatus.create({
                        knitter_id: obj.id,
                        process_training_id: training.id,
                        status: 'Pending'
                    })
                }
            }
        }
        if (req.body.processor === 'Weaver') {
            if (req.body.processorName) {
                let create = await ProcessTrainingProcessStatus.create({
                    weaver_id: Number(req.body.processorName),
                    process_training_id: training.id,
                    status: 'Pending'
                })
            } else {
                let data = await Weaver.findAll({ where: { country_id: req.body.countryId, state_id: req.body.stateId } });
                for await (let obj of data) {
                    let create = await ProcessTrainingProcessStatus.create({
                        weaver_id: obj.id,
                        process_training_id: training.id,
                        status: 'Pending'
                    })
                }
            }
        }
        if (req.body.processor === 'Garment') {
            if (req.body.processorName) {
                let create = await ProcessTrainingProcessStatus.create({
                    garment_id: Number(req.body.processorName),
                    process_training_id: training.id,
                    status: 'Pending'
                })
            } else {
                let data = await Garment.findAll({ where: { country_id: req.body.countryId, state_id: req.body.stateId } });
                for await (let obj of data) {
                    let create = await ProcessTrainingProcessStatus.create({
                        garment_id: obj.id,
                        process_training_id: training.id,
                        status: 'Pending'
                    })
                }
            }
        }
        res.sendSuccess(res, training);
    } catch (error: any) {
        console.error(error)
        return res.sendError(res, error.message, error);
    }
}


const fetchTrainings = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'desc';
    //   const sortField = req.query.sortBy || ''; 
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const whereCondition: any = {}

    const { brandId, trainingMode, countryId, stateId, processor }: any = req.query;

    try {
        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.brand_id = { [Op.in]: idArray };
        }
        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.country_id = { [Op.in]: idArray };
        }
        if (stateId) {
            const idArray: number[] = stateId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.state_id = { [Op.in]: idArray };
        }
        if (trainingMode) {
            const idArray: string[] = trainingMode
                .split(",")
                .map((id: any) => id);
            whereCondition.training_mode = { [Op.in]: idArray };
        }
        if (processor) {
            const idArray: string[] = processor
                .split(",")
                .map((id: any) => id);
            whereCondition.processor = { [Op.in]: idArray };
        }

        if (searchTerm) {
            whereCondition[Op.or] = [
                { venue: { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type 
                { training_mode: { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type 
                { training_type: { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type 
                // { start_time: { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type 
                // { end_time: { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type 
                { processor: { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type 
                { '$brand.brand_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop name
                { '$country.county_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$state.state_name$': { [Op.iLike]: `%${searchTerm}%` } },
            ];
        }

        let queryOptions: any = {
            where: whereCondition,
            include: [
                {
                    model: Brand,
                    as: 'brand',
                    attributes: ['id', 'brand_name'],
                },
                {
                    model: Country,
                    as: 'country',
                    attributes: ['id', 'county_name'],
                },
                {
                    model: State,
                    as: 'state',
                    attributes: ['id', 'state_name'],
                }
            ],
        };
        if (sortOrder === 'asc' || sortOrder === 'desc') {
            queryOptions.order = [['id', 'desc']];
        }

        if (req.query.pagination === 'true') {
            queryOptions.offset = offset;
            queryOptions.limit = limit;

            const { count, rows } = await ProcessorTraining.findAndCountAll(queryOptions);
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const training = await ProcessorTraining.findAll({
            });
            return res.sendSuccess(res, training);
        }

    } catch (error: any) {
        console.error(error)
        return res.sendError(res, error.message, error);
    }
}

const fetchTraining = async (req: Request, res: Response) => {
    try {
        const training = await ProcessorTraining.findByPk(req.query.id, {
            include: [
                {
                    model: Brand,
                    as: 'brand',
                    attributes: ['id', 'brand_name'],
                },
                {
                    model: Country,
                    as: 'country',
                    attributes: ['id', 'county_name'],
                },
                {
                    model: State,
                    as: 'state',
                    attributes: ['id', 'state_name'],
                }
            ],
        });
        return res.sendSuccess(res, training);
    } catch (error: any) {
        console.error(error)
        return res.sendError(res, error.message, error);
    }
}

const updateTraining = async (req: Request, res: Response) => {
    try {
        const training = await ProcessorTraining.update({
            date: req.body.date,
            start_time: req.body.startTime,
            end_time: req.body.endTime,
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { training });
    } catch (error: any) {
        console.error(error)
        return res.sendError(res, error.message, error);
    }
}

const updateTrainingStatus = async (req: Request, res: Response) => {
    try {
        const training = await ProcessorTraining.update({
            status: req.body.status
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { training });
    } catch (error: any) {
        console.error(error)
        return res.sendError(res, error.message, error);
    }
}

const deleteTraining = async (req: Request, res: Response) => {
    try {
        const training = await ProcessorTraining.destroy({
            where: {
                id: req.body.id
            }
        });
        const result = await ProcessTrainingProcessStatus.destroy({ where: { process_training_id: req.body.id } });
        res.sendSuccess(res, { training });
    } catch (error: any) {
        console.error(error)
        return res.sendError(res, error.message, error);
    }
}

const fecthTrainingStatus = async (req: Request, res: Response) => {
    try {
        const searchTerm = req.query.search || '';
        const whereCondition: any = {};
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        whereCondition.process_training_id = req.query.id;

        if (searchTerm) {
            whereCondition[Op.or] = [
                { feedback: { [Op.iLike]: `%${searchTerm}%` } }, // Search by Feedback
                { status: { [Op.iLike]: `%${searchTerm}%` } }, // Search by Status 
                { '$spinner.name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop name
                { '$ginner.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$weaver.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$garment.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$knitter.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$trader.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$process-training.country.county_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$process-training.state.state_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$process-training.venue$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$process-training.brand.brand_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$process-training.training_mode$': { [Op.iLike]: `%${searchTerm}%` } },
            ];
        }
        const { count, rows } =  await ProcessTrainingProcessStatus.findAndCountAll({
            where: whereCondition,
            include: [
                {
                    model: ProcessorTraining,
                    as: 'process-training',
                    include: [
                        {
                            model: Country,
                            as: 'country'
                        },
                        {
                            model: State,
                            as: 'state'
                        },
                        {
                            model: Brand,
                            as: 'brand'
                        }
                    ]
                },
                {
                    model: Spinner,
                    as: 'spinner',
                    attributes: ['id', 'name'],
                },
                {
                    model: Ginner,
                    as: 'ginner',
                    attributes: ['id', 'name'],
                },
                {
                    model: Weaver,
                    as: 'weaver',
                    attributes: ['id', 'name'],
                },
                {
                    model: Garment,
                    as: 'garment',
                    attributes: ['id', 'name'],
                },

                {
                    model: Knitter,
                    as: 'knitter',
                    attributes: ['id', 'name'],
                },
                {
                    model: Trader,
                    as: 'trader',
                    attributes: ['id', 'name'],
                }
            ],
            order: [
                [
                    'id', 'desc'
                ]
            ],
            offset: offset,
            limit: limit,
        });

        return res.sendPaginationSuccess(res, rows, count);
    } catch (error: any) {
        console.error(error)
        return res.sendError(res, error.message, error);
    }
}

const fecthTrainingStatusSpecific = async (req: Request, res: Response) => {
    try {
        const searchTerm = req.query.search || '';
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const whereCondition: any = {};
        const { spinnerId, ginnerId, weaverId, knitterId, traderId, garmentId, mode, date }: any = req.query;
        if (spinnerId) {
            whereCondition.spinner_id = spinnerId;
        }
        if (mode) {
            const idArray: any[] = mode.split(",").map((id: any) => id);
            whereCondition['$process-training.training_mode$']= { [Op.in]: idArray };
            // whereCondition['$process-training.training_mode$'] = mode;
        }
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setUTCHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setUTCHours(23, 59, 59, 999);
            whereCondition['$process-training.date$'] = { [Op.between]: [startOfDay, endOfDay] }
        }
        if (ginnerId) {
            whereCondition.ginner_id = ginnerId;
        }
        if (weaverId) {
            whereCondition.weaver_id = weaverId;
        }
        if (knitterId) {
            whereCondition.knitter_id = knitterId;
        }
        if (traderId) {
            whereCondition.trader_id = traderId;
        }
        if (garmentId) {
            whereCondition.garment_id = garmentId;
        }
        if (searchTerm) {
            whereCondition[Op.or] = [
                { feedback: { [Op.iLike]: `%${searchTerm}%` } }, // Search by Feedback
                { '$process-training.training_type$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by training type
                { status: { [Op.iLike]: `%${searchTerm}%` } }, // Search by Status 
                { '$spinner.name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by spinner name
                { '$ginner.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$weaver.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$garment.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$knitter.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$trader.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$process-training.country.county_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$process-training.state.state_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$process-training.venue$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$process-training.brand.brand_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$process-training.training_mode$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by training type
            ];
        }
        const { count, rows } = await ProcessTrainingProcessStatus.findAndCountAll({
            where: whereCondition,
            include: [
                {
                    model: ProcessorTraining,
                    as: 'process-training',
                    include: [
                        {
                            model: Country,
                            as: 'country'
                        },
                        {
                            model: State,
                            as: 'state'
                        },
                        {
                            model: Brand,
                            as: 'brand'
                        }
                    ]
                },
                {
                    model: Spinner,
                    as: 'spinner',
                    attributes: ['id', 'name'],
                },
                {
                    model: Ginner,
                    as: 'ginner',
                    attributes: ['id', 'name'],
                },
                {
                    model: Weaver,
                    as: 'weaver',
                    attributes: ['id', 'name'],
                },
                {
                    model: Garment,
                    as: 'garment',
                    attributes: ['id', 'name'],
                },

                {
                    model: Knitter,
                    as: 'knitter',
                    attributes: ['id', 'name'],
                },
                {
                    model: Trader,
                    as: 'trader',
                    attributes: ['id', 'name'],
                }
            ],
            order: [
                [
                    'id', 'desc'
                ]
            ],
            offset: offset,
            limit: limit,
        });
        return res.sendPaginationSuccess(res, rows, count);
    } catch (error: any) {
        console.error(error)
        return res.sendError(res, error.message, error);
    }
}

const updateTrainingProcessStatus = async (req: Request, res: Response) => {
    try {
        let body: any
        if (req.body.status) {
            body = {
                status: req.body.status
            }
        }
        if (req.body.feedback) {
            body = {
                feedback: req.body.feedback,
                subject: req.body.subject
            }
        }
        const training = await ProcessTrainingProcessStatus.update(body, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { training });
    } catch (error: any) {
        console.error(error)
        return res.sendError(res, error.message, error);
    }
}

const exportTrainingStatus = async (req: Request, res: Response) => {
    try {
        const excelFilePath = path.join('./upload', 'training-process-report.xlsx');
        const searchTerm = req.query.search || '';
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const whereCondition: any = {};
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet1');
        //mergin the cells for first row
        worksheet.mergeCells('A1:K1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'Cotton Connect | Training process report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };

        // Set bold font for header row
        const headerRow = worksheet.addRow([
            'S.No', 'Date', 'Name', 'Brand',
            'Processor', 'Country', 'State', 'Training Type', 'Venue', 'Status', 'Feedback'
        ]);
        headerRow.font = { bold: true };
        whereCondition.process_training_id = req.query.id
        if (searchTerm) {
            whereCondition[Op.or] = [
                { feedback: { [Op.iLike]: `%${searchTerm}%` } }, // Search by Feedback
                { status: { [Op.iLike]: `%${searchTerm}%` } }, // Search by Status 
                { '$spinner.name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop name
                { '$ginner.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$weaver.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$garment.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$knitter.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$trader.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$process-training.country.county_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$process-training.state.state_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$process-training.venue$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$process-training.brand.brand_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$process-training.training_mode$': { [Op.iLike]: `%${searchTerm}%` } },
            ];
        }
        const training = await ProcessTrainingProcessStatus.findAll({
            where: whereCondition,
            include: [
                {
                    model: ProcessorTraining,
                    as: 'process-training',
                    include: [
                        {
                            model: Country,
                            as: 'country'
                        },
                        {
                            model: State,
                            as: 'state'
                        },
                        {
                            model: Brand,
                            as: 'brand'
                        }
                    ]
                },
                {
                    model: Spinner,
                    as: 'spinner',
                    attributes: ['id', 'name'],
                },
                {
                    model: Ginner,
                    as: 'ginner',
                    attributes: ['id', 'name'],
                },
                {
                    model: Weaver,
                    as: 'weaver',
                    attributes: ['id', 'name'],
                },
                {
                    model: Garment,
                    as: 'garment',
                    attributes: ['id', 'name'],
                },

                {
                    model: Knitter,
                    as: 'knitter',
                    attributes: ['id', 'name'],
                },
                {
                    model: Trader,
                    as: 'trader',
                    attributes: ['id', 'name'],
                }
            ],
            order: [
                [
                    'id', 'desc'
                ]
            ],
            offset: offset,
            limit: limit,
        });
        // Append data to worksheet
        for await (const [index, item] of training.entries()) {
            const rowValues = Object.values({
                index: (index + 1),
                data: item['process-training'] ? item['process-training'].date : '',
                name: item['process-training'] ? item['process-training'].brand.brand_name : '',
                processor: item.spinner ? item.spinner.name :
                    item.ginner ? item.ginner.name :
                        item.weaver ? item.weaver.name :
                            item.garment ? item.garment.name :
                                item.trader ? item.trader.name :
                                    item.knitter ? item.knitter.name : '',
                country: item['process-training'] ? item['process-training'].country.county_name : '',
                state: item['process-training'] ? item['process-training'].state.state_name : '',
                mode: item['process-training'].training_mode,
                venue: item['process-training'].venue,
                status: item.status,
                feedback: item.feedback
            });
            worksheet.addRow(rowValues);
        }
        // // Auto-adjust column widths based on content
        worksheet.columns.forEach((column: any) => {
            let maxCellLength = 0;
            column.eachCell({ includeEmpty: true }, (cell: any) => {
                const cellLength = (cell.value ? cell.value.toString() : '').length;
                maxCellLength = Math.max(maxCellLength, cellLength);
            });
            column.width = Math.min(15, maxCellLength + 2); // Limit width to 30 characters
        });

        // Save the workbook
        await workbook.xlsx.writeFile(excelFilePath);
        res.status(200).send({
            success: true,
            messgage: 'File successfully Generated',
            data: process.env.BASE_URL + 'training-process-report.xlsx'
        })

    } catch (error: any) {
        console.error(error)
        return res.sendError(res, error.message, error);
    }
}


export {
    createTraining,
    fetchTrainings,
    fetchTraining,
    updateTraining,
    updateTrainingStatus,
    deleteTraining,
    fecthTrainingStatus,
    updateTrainingProcessStatus,
    exportTrainingStatus,
    fecthTrainingStatusSpecific
};