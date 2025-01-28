import { Request, Response } from "express";
// import { Op } from "sequelize";
import OldGarmentSales from "../../../models/old-garment-sales.model";
import Season from "../../../models/season.model";
import Program from "../../../models/program.model";
import Brand from "../../../models/brand.model";
import { Op } from "sequelize";
import Garment from "../../../models/garment.model";

const fetchOldGarmentSales = async (req: Request, res: Response) => {
    // const searchTerm = req.query.search || "";
    const sortOrder = req.query.sort || "desc";
    const sortField = req.query.sortBy || "id";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const brandId = Number(req.query.brandId) || null;
    const garmentId = Number(req.query.garmentId) || null;


    try {
        let queryOptions: any = {
            // where: { brand_name: { [Op.iLike]: `%${searchTerm}%` } },
            include: [
                {
                    model: Program,
                    as: "program_data",
                },
                {
                    model: Brand,
                    as: "brand",
                },
                {
                    model: Season,
                    as: "season",
                },
                {
                    model: Garment,
                    as: "garment",
                }
            ],
        }
        if (sortOrder === "asc" || sortOrder === "desc") {
            let sort = sortOrder === 'asc' ? 'ASC' : 'DESC';
            queryOptions.order = [[sortField, sort]];
        }

        if (brandId)
            queryOptions.where = {
                ["$garment.brand$"]: { [Op.contains]: [brandId] }
            }

            if (garmentId) {
                queryOptions.where = {
                    garment_id : garmentId
                };
              } 
        if (req.query.pagination === "true") {
            queryOptions.offset = offset;
            queryOptions.limit = limit;

            const { count, rows } = await OldGarmentSales.findAndCountAll(queryOptions);
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const oldGarmentSales = await OldGarmentSales.findAll(queryOptions);
            return res.sendSuccess(res, oldGarmentSales);
        }
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
}

export {
    fetchOldGarmentSales
};