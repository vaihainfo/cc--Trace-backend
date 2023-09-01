import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";

import District from "../../../models/district.model";


const updateDistrictStatus = async (req: Request, res: Response) => {
    try {
        const status = await District.update({
            district_status: req.body.status
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { status });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

export default updateDistrictStatus;