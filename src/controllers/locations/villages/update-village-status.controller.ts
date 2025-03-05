import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";

import Village from "../../../models/village.model";


const updateVillageStatus = async (req: Request, res: Response) => {
    try {
        const status = await Village.update({
            village_status: req.body.status
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

export default updateVillageStatus;