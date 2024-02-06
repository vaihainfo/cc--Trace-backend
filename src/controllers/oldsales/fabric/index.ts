import { Request, Response } from "express";
// import { Op } from "sequelize";
import OldDyingSales from "../../../models/old-dying-sales.model";
import OldPrintingSales from "../../../models/old-printing-sales.model";
import OldWashingSales from "../../../models/old-washing-sales.model";
import OldCompactingSales from "../../../models/old-compacting-sales.model";
import Program from "../../../models/program.model";

const fetchOldDyeingSales = async (req: Request, res: Response) => {
    // const searchTerm = req.query.search || "";
    const sortOrder = req.query.sort || "desc";
    const sortField = req.query.sortBy || "id";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        let queryOptions: any = {
            // where: { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
            include: [
                {
                    model: Program,
                    as: "program_data",
                }
            ],
        }
        if (sortOrder === "asc" || sortOrder === "desc") {
            let sort = sortOrder === 'asc' ? 'ASC' : 'DESC';
            queryOptions.order = [[sortField, sort]];
        }
        if (req.query.pagination === "true") {
            queryOptions.offset = offset;
            queryOptions.limit = limit;

            const { count, rows } = await OldDyingSales.findAndCountAll(queryOptions);
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const oldDyingSales = await OldDyingSales.findAll(queryOptions);
            return res.sendSuccess(res, oldDyingSales);
        }
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
}

const fetchOldPrintingSales = async (req: Request, res: Response) => {
    // const searchTerm = req.query.search || "";
    const sortOrder = req.query.sort || "desc";
    const sortField = req.query.sortBy || "id";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        let queryOptions: any = {
            // where: { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
            include: [
                {
                    model: Program,
                    as: "program_data",
                }
            ],
        }
        if (sortOrder === "asc" || sortOrder === "desc") {
            let sort = sortOrder === 'asc' ? 'ASC' : 'DESC';
            queryOptions.order = [[sortField, sort]];
        }
        if (req.query.pagination === "true") {
            queryOptions.offset = offset;
            queryOptions.limit = limit;

            const { count, rows } = await OldPrintingSales.findAndCountAll(queryOptions);
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const oldPrintingSales = await OldPrintingSales.findAll(queryOptions);
            return res.sendSuccess(res, oldPrintingSales);
        }
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
}

const fetchOldWashingSales = async (req: Request, res: Response) => {
    // const searchTerm = req.query.search || "";
    const sortOrder = req.query.sort || "desc";
    const sortField = req.query.sortBy || "id";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        let queryOptions: any = {
            // where: { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
            include: [
                {
                    model: Program,
                    as: "program_data",
                }
            ],
        }
        if (sortOrder === "asc" || sortOrder === "desc") {
            let sort = sortOrder === 'asc' ? 'ASC' : 'DESC';
            queryOptions.order = [[sortField, sort]];
        }
        if (req.query.pagination === "true") {
            queryOptions.offset = offset;
            queryOptions.limit = limit;

            const { count, rows } = await OldWashingSales.findAndCountAll(queryOptions);
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const oldWashingSales = await OldWashingSales.findAll(queryOptions);
            return res.sendSuccess(res, oldWashingSales);
        }
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
}
const fetchOldCompactingSales = async (req: Request, res: Response) => {
    // const searchTerm = req.query.search || "";
    const sortOrder = req.query.sort || "desc";
    const sortField = req.query.sortBy || "id";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        let queryOptions: any = {
            // where: { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
            include: [
                {
                    model: Program,
                    as: "program_data",
                }
            ],
        }
        if (sortOrder === "asc" || sortOrder === "desc") {
            let sort = sortOrder === 'asc' ? 'ASC' : 'DESC';
            queryOptions.order = [[sortField, sort]];
        }
        if (req.query.pagination === "true") {
            queryOptions.offset = offset;
            queryOptions.limit = limit;

            const { count, rows } = await OldCompactingSales.findAndCountAll(queryOptions);
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const oldCompactingSales = await OldCompactingSales.findAll(queryOptions);
            return res.sendSuccess(res, oldCompactingSales);
        }
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
}

export {
    fetchOldDyeingSales,
    fetchOldPrintingSales,
    fetchOldWashingSales,
    fetchOldCompactingSales
};