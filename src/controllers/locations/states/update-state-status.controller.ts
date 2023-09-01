import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";

import State from "../../../models/state.model";


const updateStateStatus = async (req: Request, res: Response) => {
    try {
        const status = await State.update({
            state_status: req.body.status
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

export default updateStateStatus;