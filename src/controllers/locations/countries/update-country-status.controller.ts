import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";

import Country from "../../../models/country.model";


const updateCountryStatus = async (req: Request, res: Response) => {
    try {
        const status = await Country.update({
            country_status: req.body.status
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

export default updateCountryStatus;