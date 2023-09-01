import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";

import ProcessorTraining from "../../models/processor-training.model";
import Brand from "../../models/brand.model";
import Country from "../../models/country.model";
import State from "../../models/state.model";


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
        res.sendSuccess(res, training);
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}


const fetchTrainings = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || ''; 
    //   const sortField = req.query.sortBy || ''; 
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const whereCondition: any = {}

    const { brandId, trainingMode, countryId,stateId, processor } = req.query;

    try {
        if (brandId) {
            whereCondition.brand_id = brandId;
        }
        if (countryId) {
            whereCondition.country_id = countryId;
        }
        if (stateId) {
            whereCondition.state_id = stateId;
        }
        if (trainingMode) {
            whereCondition.training_mode = trainingMode;
        }
        if (brandId) {
            whereCondition.brand_id = brandId;
        }
        if (processor) {
            whereCondition.processor = processor;
        }

        if (searchTerm) {
            whereCondition[Op.or] = [
                { venue: { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type 
                { training_mode: { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type 
                // { date: { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type 
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
                    attributes: ['id','brand_name'],
                },
                {
                    model: Country,
                    as: 'country',
                    attributes: ['id','county_name'],
                },
                {
                    model: State,
                    as: 'state',
                    attributes: ['id','state_name'],
                }
            ],
        };
        if (sortOrder === 'asc' || sortOrder === 'desc') {
            queryOptions.order = [['date', sortOrder]];
        }

        if(req.query.pagination === 'true'){
            queryOptions.offset = offset;
            queryOptions.limit = limit;

            const { count, rows } = await ProcessorTraining.findAndCountAll(queryOptions);
            return res.sendPaginationSuccess(res, rows, count);
        }else{
            const training = await ProcessorTraining.findAll({
            });
            return res.sendSuccess(res, training);
        }

    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const fetchTraining = async (req: Request, res: Response) => {
    try {
            const training = await ProcessorTraining.findByPk(req.body.id, {
                include: [
                    {
                        model: Brand,
                        as: 'brand',
                        attributes: ['id','brand_name'],
                    },
                    {
                        model: Country,
                        as: 'country',
                        attributes: ['id','county_name'],
                    },
                    {
                        model: State,
                        as: 'state',
                        attributes: ['id','state_name'],
                    }
                ],
            });
            return res.sendSuccess(res, training);
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
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
        return res.sendError(res, error.message);
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
        return res.sendError(res, error.message);
    }
}

const deleteTraining = async (req: Request, res: Response) => {
    try {
        const training = await ProcessorTraining.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { training });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}


export {
    createTraining,
    fetchTrainings,
    fetchTraining,
    updateTraining,
    updateTrainingStatus,
    deleteTraining
};