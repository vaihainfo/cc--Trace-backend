import { Request, Response } from "express";
const dbConn = require('../../../dist/util/dbConn');
import Ginner from "../../models/ginner.model";
import GinnerProcess from "../../models/gin-process.model";
import Spinner from "../../models/spinner.model";
import SpinnerProcess from "../../models/spin-process.model";
import GinnerSales from "../../models/gin-sales.model";
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
                const ginner = await Ginner.findOne({ where: { name: { [Op.iLike]: `${String(data.ginnerName).trim()}` } } });
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
const updateSpinProcessGreyoutStatusData = async (req: Request, res: Response) => {
    try {
        let fail = [];
        let pass = [];

        if (!req.body.excelData || !Array.isArray(req.body.excelData)) {
            throw new Error('Request Error');
        }

        for (const data of req.body.excelData) {
            if (!data.spinnerName) {
                fail.push({
                    success: false,
                    message: "Spinner Name cannot be empty"
                });
            } else if (!data.yarnreelLotNo) {
                fail.push({
                    success: false,
                    message: "Yarn Reel Lot no cannot be empty"
                });
            } else {
                
                const spinner = await Spinner.findOne({ where: { name: { [Op.iLike]: `${String(data.spinnerName).trim()}` } } });
                if (!spinner) {
                    fail.push({
                        success: false,
                        reelLotNo: data.yarnreelLotNo,  
                        spinnerName: data.spinnerName,   
                        message: "Spinner is not available"
                    });
                } else {
                    const existingRecords = await SpinnerProcess.findAll({
                        where: {
                            reel_lot_no: data.yarnreelLotNo,
                            spinner_id: spinner.id,
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
                            message: "Yarn stock is Greyed Out"
                        });
                    } else if (existingRecords.length > 1) {
                        fail.push({
                            success: false,
                            yarnreelLotNo: data.yarnreelLotNo,  
                            spinnerName: spinner.name,   
                            message: "More than one record found for Yarn reel lot no: " + data.yarnreelLotNo + ",Please resolve this issue before status update"
                        });
                    } else {
                        fail.push({
                            success: false,
                            yarnreelLotNo: data.yarnreelLotNo,  
                            spinnerName: spinner.name,    
                            message: "No record found to update the greyout status"
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
const updateGinSalesGreyoutStatusData = async (req: Request, res: Response) => {
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
            
            } 
            else if (!data.spinnerName) {
                fail.push({
                    success: false,
                    message: "Spinner Name cannot be empty"
                });
            }
            else if (!data.invoiceNo) {
                fail.push({
                    success: false,
                    message: "Invoice No cannot be empty"
                });
            } 
            else if (!data.lotNo) {
                fail.push({
                    success: false,
                    message: "Lot No cannot be empty"
                });
            } 
            else {
                const ginner = await Ginner.findOne({ where: { name: { [Op.iLike]: `${String(data.ginnerName).trim()}` } } });
                const spinner = await Spinner.findOne({ where: { name: { [Op.iLike]: `${String(data.spinnerName).trim()}` } } });
                if (!ginner) {
                    fail.push({
                        success: false,
                        invoiceNo: data.invoiceNo,  
                        ginnerName: data.ginnerName, 
                        spinnerName: data.spinnerName, 
                        message: "Ginner is not available"
                    });
                } 
                else if (!spinner) {
                    fail.push({
                        success: false,
                        invoiceNo: data.invoiceNo, 
                        ginnerName: data.ginnerName, 
                        spinnerName: data.spinnerName,   
                        message: "Spinner is not available"
                    });
                }
                else {
                    const existingRecords = await GinnerSales.findAll({
                        where: {
                            invoice_no: { [Op.iLike]: `%${String(data.invoiceNo).trim()}%` },
                            ginner_id: ginner.id,
                            buyer: spinner.id,
                            lot_no: { [Op.iLike]: `%${String(data.lotNo).trim()}%` },
                            greyout_status: false,
                            status: { [Op.in]: ["Sold", "Partially Accepted", "Partially Rejected"]  }
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
                            invoiceNo: data.invoiceNo,  
                            ginnerName: ginner.name, 
                            spinnerName: spinner.name,   
                            message: "More than one record found for invoice no: " + data.invoiceNo + ",Please resolve this issue before status update"
                        });
                    } else {
                        fail.push({
                            success: false,
                            invoiceNo: data.invoiceNo,  
                            ginnerName: ginner.name, 
                            spinnerName: spinner.name,
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
    updateGinProcessGreyoutStatusData,
    updateSpinProcessGreyoutStatusData,
    updateGinSalesGreyoutStatusData
}
