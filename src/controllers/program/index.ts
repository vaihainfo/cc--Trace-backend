import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";

import Program from "../../models/program.model";


const createProgram = async (req: Request, res: Response) => {
    try {
        const data = {
            program_name: req.body.programName,
            program_status: true
        };
        const program = await Program.create(data);
        res.sendSuccess(res, program);
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const createPrograms = async (req: Request, res: Response) => {
    try {
        // create multiple Program at the time
        let pass = [];
        let fail = [];
        for await (const obj of req.body.programName) {
            let result = await Program.findOne({ where: { program_name: { [Op.iLike]: obj } } })
            if (result) {
                fail.push({ data: result });
            } else {
                const result = await Program.create({ program_name: obj, program_status: true });
                pass.push({ data: result });
            }
        }
        res.sendSuccess(res, { pass, fail });
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const fetchProgramPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'desc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status || '';
    const whereCondition: any = {};
    try {
        if (status === 'true') {
            whereCondition.program_status = true;
        }
        if (searchTerm) {
            whereCondition.program_name = { [Op.iLike]: `%${searchTerm}%` }
        }
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await Program.findAndCountAll({
                where: whereCondition,
                order: [
                    ['id', sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
                offset: offset,
                limit: limit
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const program = await Program.findAll({
                where: whereCondition,
                order: [
                    ['id', sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
            });
            return res.sendSuccess(res, program);
        }

    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}


const updateProgram = async (req: Request, res: Response) => {
    try {
        let result = await Program.findOne({ where: { program_name: { [Op.iLike]: req.body.programName }, id: { [Op.ne]: req.body.id } } })
        if (result) {
            return res.sendError(res, "ALREADY_EXITS");
        }
        const program = await Program.update({
            program_name: req.body.programName
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { program });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const updateProgramStatus = async (req: Request, res: Response) => {
    try {
        const program = await Program.update({
            program_status: req.body.status
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { program });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const deleteProgram = async (req: Request, res: Response) => {
    try {
        const program = await Program.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { program });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}


export {
    createProgram,
    createPrograms,
    fetchProgramPagination,
    updateProgram,
    updateProgramStatus,
    deleteProgram
};