import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";

import EntityLimit from "../../models/entity-limit.model";
import Brand from "../../models/brand.model";
import Spinner from "../../models/spinner.model";
import Trader from "../../models/trader.model";
import Knitter from "../../models/knitter.model";
import Weaver from "../../models/weaver.model";
import Garment from "../../models/garment.model";
import Ginner from "../../models/ginner.model";


// const createEntityLimit = async (req: Request, res: Response) => {
//     try {
//         const data = {
//             brand_id: req.body.brandId,
//             limit: req.body.limit,
//         };
//         const entityLimit = await EntityLimit.create(data);
//         res.sendSuccess(res, entityLimit);
//     } catch (error) {
//         console.log(error)
//         return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
//     }
// }

const fetchEntityLimits = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'asc';
    //   const sortField = req.query.sortBy || ''; 
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const whereCondition: any = {}

    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { brand_name: { [Op.iLike]: `%${searchTerm}%` } },
                { entity_limit: { [Op.eq]: searchTerm } },
            ];
        }

        const queryOptions: any = {
            where: whereCondition,
            offset: offset,
            limit: limit
        };

        if (sortOrder === 'asc' || sortOrder === 'desc') {
            queryOptions.order = [['brand_name', sortOrder]];
        }
        let { count, rows } = await Brand.findAndCountAll(queryOptions);
        let result = [];
        for await (let [index, item] of rows.entries()) {
            let [spinCount, TraderCount, KnitCount, weaverCount, ginnerCount, garmentCount] = await Promise.all([
                Spinner.count({ where: { brand: { [Op.contains]: [item.id] } } }),
                Trader.count({ where: { brand: { [Op.contains]: [item.id] } } }),
                Knitter.count({ where: { brand: { [Op.contains]: [item.id] } } }),
                Weaver.count({ where: { brand: { [Op.contains]: [item.id] } } }),
                Ginner.count({ where: { brand: { [Op.contains]: [item.id] } } }),
                Garment.count({ where: { brand: { [Op.contains]: [item.id] } } })
            ]);
            let used_limit = (spinCount + TraderCount + KnitCount + weaverCount + ginnerCount + garmentCount) || 0;
            result.push({
                id: item.id,
                brand_name: item.brand_name,
                entity_limit: item.entity_limit,
                used_limit: used_limit,
                remaining_limit: item.entity_limit - used_limit
            })
        }
        return res.sendPaginationSuccess(res, result, count);

    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}



const updateEntityLimit = async (req: Request, res: Response) => {
    try {
        const entityLimit = await Brand.update({
            entity_limit: req.body.limit
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { entityLimit });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}


// const deleteEntityLimit = async (req: Request, res: Response) => {
//     try {
//         const entityLimit = await EntityLimit.destroy({
//             where: {
//                 id: req.body.id
//             }
//         });
//         res.sendSuccess(res, { entityLimit });
//     } catch (error: any) {
//         return res.sendError(res, error.message);
//     }
// }


export {
    // createEntityLimit,
    fetchEntityLimits,
    updateEntityLimit,
    // deleteEntityLimit
};