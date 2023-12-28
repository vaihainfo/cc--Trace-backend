import { Request, Response } from "express";
import { Sequelize, Op, where } from "sequelize";
import GinnerOrder from "../../models/ginner-order.model";
import Season from "../../models/season.model";
import Program from "../../models/program.model";
import Ginner from "../../models/ginner.model";
import Brand from "../../models/brand.model";
import StyleMark from "../../models/style-mark.model";
import GarmentType from "../../models/garment-type.model";
import GinnerExpectedCotton from "../../models/ginner-expected-cotton.model";
import Village from "../../models/village.model";
import FarmGroup from "../../models/farm-group.model";
import Country from "../../models/country.model";
import State from "../../models/state.model";
import District from "../../models/district.model";
import Block from "../../models/block.model";
import Farmer from "../../models/farmer.model";
import ICS from "../../models/ics.model";
import Farm from "../../models/farm.model";
import { generateQrCode } from "../../provider/qrcode";
import ProcessorList from "../../models/processor-list.model";
import Transaction from "../../models/transaction.model";



const uploadGarmentType = async (req: Request, res: Response) => {
    try {
        let fail = [];
        let pass = [];
        for await (const data of req.body.garmentType) {
            if (!data.name) {
                fail.push({
                    success: false,
                    message: "Garment Type cannot be empty"
                });
            } else {
                let garmentType = await GarmentType.findOne({ where: { name: data.name } });
                if (garmentType) {
                    fail.push({
                        success: false,
                        data: { name: data.name },
                        message: "Already exist"
                    });
                } else {
                    const result = await GarmentType.create({ name: data.name });
                    pass.push({
                        success: true,
                        data: result,
                        message: "Garment Type created"
                    });
                }
            }
        }
        res.sendSuccess(res, { pass, fail });
    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const uploadGinnerProcess = async (req: Request, res: Response) => {
    try {
        let fail = [];
        let pass = [];
        for await (const data of req.body.garmentType) {
            if (!data.name) {
                fail.push({
                    success: false,
                    message: "Garment Type cannot be empty"
                });
            } else {
                let garmentType = await GarmentType.findOne({ where: { name: data.name } });
                if (garmentType) {
                    fail.push({
                        success: false,
                        data: { name: data.name },
                        message: "Already exist"
                    });
                } else {
                    const result = await GarmentType.create({ name: data.name });
                    pass.push({
                        success: true,
                        data: result,
                        message: "Garment Type created"
                    });
                }
            }
        }
        res.sendSuccess(res, { pass, fail });
    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}


export {
    uploadGarmentType,
    uploadGinnerProcess
}
