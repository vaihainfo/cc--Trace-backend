import { Request, Response } from "express";
// import { Op } from "sequelize";
import OldWeaverSales from "../../../models/old-weaver-sales.model";
import Season from "../../../models/season.model";
import FabricType from "../../../models/fabric-type.model";
import Program from "../../../models/program.model";
import { Op } from "sequelize";
import Weaver from "../../../models/weaver.model";

const fetchOldWeaverSales = async (req: Request, res: Response) => {
    // const searchTerm = req.query.search || "";
    const sortOrder = req.query.sort || "desc";
    const sortField = req.query.sortBy || "id";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const brandId = Number(req.query.brandId) || null;

    try {
        let queryOptions: any = {
            // where: { garment_name: { [Op.iLike]: `%${searchTerm}%` } },
            include: [
                {
                    model: Program,
                    as: "program_data",
                },
                {
                    model: Weaver,
                    as: "weaver",
                },
                {
                    model: FabricType,
                    as: "fabricType_data",
                },
                {
                    model: Season,
                    as: "season",
                },
            ],
        }
        if (sortOrder === "asc" || sortOrder === "desc") {
            let sort = sortOrder === 'asc' ? 'ASC' : 'DESC';
            queryOptions.order = [[sortField, sort]];
        }
        if (brandId)
            queryOptions.where = {
                ["$weaver.brand$"]: { [Op.contained]: [brandId] }
            }

        if (req.query.pagination === "true") {
            queryOptions.offset = offset;
            queryOptions.limit = limit;

            const { count, rows } = await OldWeaverSales.findAndCountAll(queryOptions);
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const oldWeaverSales = await OldWeaverSales.findAll(queryOptions);
            return res.sendSuccess(res, oldWeaverSales);
        }
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
}

export {
    fetchOldWeaverSales
};