import { Request, Response } from "express";
import { Op } from "sequelize";
import OldKnitterSales from "../../../models/old-knitter-sales.model";
import Season from "../../../models/season.model";
import FabricType from "../../../models/fabric-type.model";
import Program from "../../../models/program.model";

const fetchOldKnitterSales = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const sortOrder = req.query.sort || "desc";
    const sortField = req.query.sortBy || "id";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        let queryOptions: any = {
            where: { garment_name: { [Op.iLike]: `%${searchTerm}%` } },
            include: [
                {
                    model: Season,
                    as: "season",
                },
                {
                    model: FabricType,
                    as: "fabricType_data",
                },
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

            const { count, rows } = await OldKnitterSales.findAndCountAll(queryOptions);
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const oldKnitterSales = await OldKnitterSales.findAll(queryOptions);
            return res.sendSuccess(res, oldKnitterSales);
        }
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
}

export {
    fetchOldKnitterSales
};