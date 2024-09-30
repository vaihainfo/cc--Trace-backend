import { Request, Response } from "express";
// import { Op } from "sequelize";
import OldConsolidateReport from "../../../models/old-consolidated_traceability_report.model";
import Brand from "../../../models/brand.model";
import { Op } from "sequelize";

const fetchConsolidateOldReport = async (req: Request, res: Response) => {
    // const searchTerm = req.query.search || "";
    const sortOrder = req.query.sort || "desc";
    const sortField = req.query.sortBy || "id";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const brandId = Number(req.query.brandId) || null;
    console.log('====>');
    console.log(brandId);
   
    try {
        let queryOptions: any = {
            // where: { brand_name: { [Op.iLike]: `%${searchTerm}%` } },
            include: [
                {
                    model: Brand,
                    as: "brand",
                },
                             
            ],
        }
        if (sortOrder === "asc" || sortOrder === "desc") {
            let sort = sortOrder === 'asc' ? 'ASC' : 'DESC';
            queryOptions.order = [[sortField, sort]];
        }

        if (brandId)
            queryOptions.where = {
                brand_id : brandId
            }
         
            console.log('====>');
            console.log(queryOptions.where);    
        if (req.query.pagination === "true") {
            queryOptions.offset = offset;
            queryOptions.limit = limit;

            const { count, rows } = await OldConsolidateReport.findAndCountAll(queryOptions);

            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const oldGarmentSales = await OldConsolidateReport.findAll(queryOptions);
            
            return res.sendSuccess(res, oldGarmentSales);
        }
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}
export {
    fetchConsolidateOldReport
};