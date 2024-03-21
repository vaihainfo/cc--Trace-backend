import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";

import Block from "../../../models/block.model";


const updateBlockStatus = async (req: Request, res: Response) => {
    try {
        const status = await Block.update({
            block_status: req.body.status
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { status });
    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.message);
      }
}

export default updateBlockStatus;