import { Request, Response } from "express";
import { Sequelize, Op, where } from "sequelize";
import { encrypt, generateOnlyQrCode } from "../../provider/qrcode";
import GinBale from "../../models/gin-bale.model";

import GarmentType from "../../models/garment-type.model";
import GinProcess from "../../models/gin-process.model";
import Season from "../../models/season.model";
import Program from "../../models/program.model";
import CottonSelection from "../../models/cotton-selection.model";


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
    
                    for await (const bale of ginnerdata.bales) {
    
                        let baleData = {
                            process_id: ginnerdata.processId,
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
                    }
                            
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


export {
    uploadGinBales,
    uploadGinnerProcess,
    uploadGinCottonselection
}
