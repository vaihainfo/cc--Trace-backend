import { Request, Response } from "express";
import { Sequelize, Op, where } from "sequelize";
import { encrypt, generateOnlyQrCode } from "../../provider/qrcode";
import GinBale from "../../models/gin-bale.model";
import GinSales from "../../models/gin-sales.model";
import BaleSelection from "../../models/bale-selection.model";
import GinProcess from "../../models/gin-process.model";
import CottonSelection from "../../models/cotton-selection.model";

// Ginner Process section - Data Migration

const uploadGinBales = async (req: Request, res: Response) => {
    try {
        let fail: any = [];
        let pass: any = [];
 
        for await (const bale of req.body.bales) {

            let baleData = {
                process_id: bale.process_id,
                bale_no: bale.baleNo,
                weight: bale.weight,
                staple: bale.staple,
                mic: bale.mic,
                strength: bale.strength,
                trash: bale.trash,
                color_grade: bale.colorGrade
            }
            const bales = await GinBale.create(baleData);
            let uniqueFilename = `gin_bale_qrcode_${Date.now()}.png`;
            let da = encrypt(`Ginner,Bale, ${bales.id}`);
            let aa = await generateOnlyQrCode(da, uniqueFilename);
            const gin = await GinBale.update({ qr: uniqueFilename }, {
                where: {
                    id: bales.id
                }
            });

            pass.push({
                success: true,
                message: "Bale uploaded for the Process"
            });
        }

       
        
        res.sendSuccess(res, { pass, fail });
    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const uploadGinCottonselection = async (req: Request, res: Response) => {
    try {
        let fail: any = [];
        let pass: any = [];
 
        for await (const cottonselection of req.body.cotton) {

            let cottonData = {
                process_id: cottonselection.process_id,
                transaction_id: cottonselection.transaction_id,
                qty_used: cottonselection.qty_used,
                createdAt:Date.now()
            }
            const cottons = await CottonSelection.create(cottonData);

            pass.push({
                success: true,
                data: cottons,
                message: "Cotton uploaded for the Process"
            });
            
           
        }

       
        res.sendSuccess(res, { pass, fail });
    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const uploadGinnerProcess = async (req: Request, res: Response) => {
    try {
        //console.log(req.body);
        let fail: any = [];
        let pass: any = []; 

        for await (const ginnerdata of req.body.ginners) {
            if (!ginnerdata.ginnerId) {
                fail.push({
                    success: false,
                    message: "Ginner Data cannot be empty"
                });
            } else {
                let processtype = await GinProcess.findOne({ where: { id: ginnerdata.processId } });
                if (processtype) {

                    const updateginprocess = await GinProcess.update({
                        ginner_id: ginnerdata.ginnerId,
                        program_id: ginnerdata.programId,
                        season_id: ginnerdata.seasonId,
                        total_qty: ginnerdata.totalQty,
                        no_of_bales: ginnerdata.noOfBales,
                        gin_out_turn: ginnerdata.got,
                        lot_no: ginnerdata.lotNo,
                        reel_lot_no: ginnerdata.reelLotNno,
                        press_no: ginnerdata.pressNo,
                        updatedAt: Date.now()
                    }, {
                        where: {
                            id: ginnerdata.processId
                        }
                    });
                    pass.push({
                        success: true,
                        data: ginnerdata.processId,
                        message: "Process is updated"
                    });
                }       
                else {
                    const data = {
                        id:ginnerdata.processId,
                        ginner_id: ginnerdata.ginnerId,
                        program_id: ginnerdata.programId,
                        season_id: ginnerdata.seasonId,
                        date: Date.now(),
                        total_qty: ginnerdata.totalQty,
                        no_of_bales: ginnerdata.noOfBales,
                        gin_out_turn: ginnerdata.got,
                        lot_no: ginnerdata.lotNo,
                        reel_lot_no: ginnerdata.reelLotNno,
                        press_no: ginnerdata.pressNo,
                    };
                    const ginprocess = await GinProcess.create(data);
    
                    let uniqueFilename = `gin_procees_qrcode_${Date.now()}.png`;
                    let da = encrypt(`${ginnerdata.processId}`);
                    let aa = await generateOnlyQrCode(da, uniqueFilename);
                    const gin = await GinProcess.update({ qr: uniqueFilename }, {
                        where: {
                            id: ginnerdata.processId
                        }
                    });
    
                    pass.push({
                        success: true,
                        data: ginprocess,
                        message: "Process is created"
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

// Ginner Sale Section - Data Migration

const uploadGinnerSale = async (req: Request, res: Response) => {
    try {
        //console.log(req.body);
        let fail: any = [];
        let pass: any = []; 

        for await (const ginnersaledata of req.body.ginnersale) {
            if (!ginnersaledata.ginnerId) {
                fail.push({
                    success: false,
                    message: "Ginner Data cannot be empty"
                });
            } else {
                let processtype = await GinSales.findOne({ where: { id: ginnersaledata.processId } });
                if (processtype) {

                    const updateginsale = await GinSales.update({
                        ginner_id: ginnersaledata.ginnerId,
                        program_id: ginnersaledata.programId,
                        season_id: ginnersaledata.seasonId,
                        date: ginnersaledata.date,
                        total_qty: ginnersaledata.totalQty,
                        no_of_bales: ginnersaledata.noOfBales,
                        choosen_bale: ginnersaledata.choosenBale,
                        lot_no: ginnersaledata.lotNo,
                        buyer: ginnersaledata.buyer,
                        shipping_address: ginnersaledata.shippingAddress,
                        transaction_via_trader: ginnersaledata.transactionViaTrader,
                        transaction_agent: ginnersaledata.transactionAgent,
                        candy_rate: ginnersaledata.candyRate,
                        rate: ginnersaledata.rate,
                        reel_lot_no: ginnersaledata.reelLotNno ? ginnersaledata.reelLotNno : null,
                        despatch_from: ginnersaledata.despatchFrom,
                        press_no: ginnersaledata.pressNo,
                        status: ginnersaledata.status,
                        qty_stock: ginnersaledata.totalQty
                    }, {
                        where: {
                            id: ginnersaledata.processId
                        }
                    });
                    pass.push({
                        success: true,
                        data: ginnersaledata.processId,
                        message: "Sales is updated"
                    });
                }       
                else {
                    const data = {
                        id:ginnersaledata.processId,
                        ginner_id: ginnersaledata.ginnerId,
                        program_id: ginnersaledata.programId,
                        season_id: ginnersaledata.seasonId,
                        date: ginnersaledata.date,
                        total_qty: ginnersaledata.totalQty,
                        no_of_bales: ginnersaledata.noOfBales,
                        choosen_bale: ginnersaledata.choosenBale,
                        lot_no: ginnersaledata.lotNo,
                        buyer: ginnersaledata.buyer,
                        shipping_address: ginnersaledata.shippingAddress,
                        transaction_via_trader: ginnersaledata.transactionViaTrader,
                        transaction_agent: ginnersaledata.transactionAgent,
                        candy_rate: ginnersaledata.candyRate,
                        rate: ginnersaledata.rate,
                        reel_lot_no: ginnersaledata.reelLotNno ? ginnersaledata.reelLotNno : null,
                        despatch_from: ginnersaledata.despatchFrom,
                        press_no: ginnersaledata.pressNo,
                        status: ginnersaledata.status,
                        qty_stock: ginnersaledata.totalQty
                    };
                    const ginSales = await GinSales.create(data); 
                            
                    let uniqueFilename = `gin_sales_qrcode_${Date.now()}.png`;
                    let da = encrypt("Ginner,Sale," + ginSales.id);
                    let aa = await generateOnlyQrCode(da, uniqueFilename);
                    const gin = await GinSales.update({ qr: uniqueFilename }, {
                        where: {
                            id: ginnersaledata.processId
                        }
                    });
     
                    pass.push({
                        success: true,
                        data: ginSales,
                        message: "Sale is created"
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

const uploadBalesSelection = async (req: Request, res: Response) => {
    try {
        let fail: any = [];
        let pass: any = [];
 
   
        for await (const bale of req.body.bales) {
            let baleData = {
                sales_id: bale.sales_id,
                bale_id: bale.bale_id,
            }
            const bales = await BaleSelection.create(baleData);
            const ginbaleSatus = await GinBale.update({ sold_status: true }, { where: { id: bale.bale_id } });
        }       
        
        res.sendSuccess(res, { pass, fail });
    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}



export {
    uploadGinBales,
    uploadGinnerProcess,
    uploadGinCottonselection,
    uploadGinnerSale,
    uploadBalesSelection
}
