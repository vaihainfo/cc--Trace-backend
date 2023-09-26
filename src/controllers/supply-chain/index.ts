import { Request, Response } from "express";
import Rating from "../../models/rating.model";
import { Sequelize, Op, where } from "sequelize";

const createSupplyChainRating = async (req: Request, res: Response) => {
    try {
        const data = {
            user_id: req.body.userId,
            user_type: req.body.userType,
            rated_by: req.body.ratedBy,
            rated_by_type: req.body.ratedByType,
            process_or_sales: req.body.processOrSales,
            rating: req.body.rating,
            description: req.body.description
        }
        const training = await Rating.create(data);
        res.sendSuccess(res, training);
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}


const fetchSupplyChainRating = async (req: Request, res: Response) => {
    try {
        const rating = await Rating.findOne({
            where: {
                rated_by: req.body.ratedBy,
                rated_by_type: req.body.ratedByType,
                user_id: req.body.userId,
                user_type: req.body.userType,
            }
        });
        res.sendSuccess(res, rating);
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const updateSupplyChainRating = async (req: Request, res: Response) => {
    try {
        const rating = await Rating.update({
            rated_by: req.body.ratedBy,
            rated_by_type: req.body.ratedByType,
            user_id: req.body.userId,
            user_type: req.body.userType,
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, rating);
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

export {
    createSupplyChainRating,
    fetchSupplyChainRating,
    updateSupplyChainRating
}