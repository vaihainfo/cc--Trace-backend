import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";

import EntityLimit from "../../models/entity-limit.model";
import Brand from "../../models/brand.model";


const createEntityLimit = async (req: Request, res: Response) => {
    try {
        const data = {
            brand_id: req.body.brandId,
            limit: req.body.limit,
        };
        const entityLimit = await EntityLimit.create(data);
        res.sendSuccess(res, entityLimit);
    } catch (error) {
        console.log(error)
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const fetchEntityLimits = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
  const sortOrder = req.query.sort || ''; 
//   const sortField = req.query.sortBy || ''; 
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const whereCondition: any = {}

    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { limit: { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type 
                { '$brand.brand_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop name
            ];
        }

        const queryOptions: any = {
            where: whereCondition,
            include: [
                {
                    model: Brand,
                    as: 'brand'
                }
            ],
            offset: offset,
            limit: limit
        };

        if (sortOrder === 'asc' || sortOrder === 'desc') {
            queryOptions.order = [['limit', sortOrder]];
        }
        const { count, rows } = await EntityLimit.findAndCountAll(queryOptions);
        return res.sendPaginationSuccess(res, rows, count);

    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const fetchEntityLimit = async (req: Request, res: Response) => {
    try {
            const entityLimit = await EntityLimit.findByPk(req.query.id, {
              include: [
                  {
                      model: Brand,
                      as: 'brand',
                      attributes: ['id','brand_name'], // Include only the name attribute of the category
                  },
              ],
          });
            return res.sendSuccess(res, entityLimit);
      }catch (error) {
          console.log(error)
          return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
        }
  }


const updateEntityLimit = async (req: Request, res: Response) => {
    try {
        const entityLimit = await EntityLimit.update({
            limit: req.body.limit
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


const deleteEntityLimit = async (req: Request, res: Response) => {
    try {
        const entityLimit = await EntityLimit.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { entityLimit });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}


export {
    createEntityLimit,
    fetchEntityLimits,
    fetchEntityLimit,
    updateEntityLimit,
    deleteEntityLimit
};