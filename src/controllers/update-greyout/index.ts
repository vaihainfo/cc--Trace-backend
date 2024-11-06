import { Request, Response } from "express";
const dbConn = require('../../../dist/util/dbConn');
import Ginner from "../../models/ginner.model";
import GinnerProcess from "../../models/gin-process.model";
const sequelize = dbConn.default; 
const { Op, Sequelize } = require('sequelize');

const updateGinProcessGreyoutStatusData = async (req: Request, res: Response) => {
    try {
        let fail = [];
        let pass = [];

        if (!req.body.excelData || !Array.isArray(req.body.excelData)) {
            throw new Error('Request Error');
        }

        for (const data of req.body.excelData) {
            if (!data.ginnerName) {
                fail.push({
                    success: false,
                    message: "Ginner Name cannot be empty"
                });
            } else if (!data.reelLotNo) {
                fail.push({
                    success: false,
                    message: "Reel Lot no cannot be empty"
                });
            } else {
                const ginner = await Ginner.findOne({ where: { name: data.ginnerName } });
                if (!ginner) {
                    fail.push({
                        success: false,
                        reelLotNo: data.reelLotNo,  
                        ginnerName: data.ginnerName,   
                        message: "Ginner is not available"
                    });
                } else {
                    const existingRecords = await GinnerProcess.findAll({
                        where: {
                            reel_lot_no: data.reelLotNo,
                            ginner_id: ginner.id,
                            greyout_status: false
                        }
                    });

                    if (existingRecords.length === 1) {
                        const existingRecord = existingRecords[0];
                        existingRecord.greyout_status = true; 
                        await existingRecord.save();

                        pass.push({
                            success: true,
                            data: existingRecord,
                            message: "Lint stock is Greyed Out"
                        });
                    } else if (existingRecords.length > 1) {
                        fail.push({
                            success: false,
                            reelLotNo: data.reelLotNo,  
                            ginnerName: ginner.name,   
                            message: "More than one record found for reel lot no: " + data.reelLotNo + ",Please resolve this issue before status update"
                        });
                    } else {
                        fail.push({
                            success: false,
                            reelLotNo: data.reelLotNo,  
                            ginnerName: ginner.name,    
                            message: "No record found to update"
                        });
                    }
                }
            }
        }
        res.sendSuccess(res, { pass, fail });
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
};

export {
    updateGinProcessGreyoutStatusData
}
