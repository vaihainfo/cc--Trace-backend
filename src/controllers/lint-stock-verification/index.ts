import { Request, Response } from "express";
import GinProcess from "../../models/gin-process.model";
import Ginner from "../../models/ginner.model";
import { Sequelize, Op } from "sequelize";
import sequelize from "../../util/dbConn";
import LintStockVerified from "../../models/lint-stock-verified.model";


const getGinProcessLotNo = async (req: Request, res: Response) => {
    try {
        const ginnerId = req.query.ginnerId;

        if (!ginnerId) {
            return res.sendError(res, "No Ginner Id Found");
          }

        const lotNo = await GinProcess.findAll({
            attributes:['id','lot_no', 'reel_lot_no'],
            where: {ginner_id: ginnerId}
        });

        if(lotNo && lotNo.length > 0){
            return res.sendSuccess(res, lotNo);
        }else{
        return res.sendError(res, "No Ginner Process is created for this Ginner"); 
        }     
    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error?.message);
      }
}


const getGinProcessLotDetials = async (req: Request, res: Response) => {
    try {
        const processId = req.query.processId;

        if (!processId) {
            return res.sendError(res, "No Process Id Found");
          }

          
    const [results] = await sequelize.query(
        `SELECT 
            jsonb_build_object(
                'ginprocess', jsonb_build_object(
                    'id', gp.id,
                    'lot_no', gp.lot_no,
                    'date', gp.date,
                    'press_no', gp.press_no,
                    'reel_lot_no', gp.reel_lot_no,
                    'greyout_status', gp.greyout_status
                ),
                'weight', SUM(CAST(gb.weight AS DOUBLE PRECISION)),
                'no_of_bales', COUNT(DISTINCT gb.id),
                'bales', jsonb_agg(jsonb_build_object(
                    'id', gb.id,
                    'bale_no', gb.bale_no,
                    'weight', gb.weight,
                    'is_all_rejected', gb.is_all_rejected,
                    'greyout_status', gp.greyout_status
                ) ORDER BY gb.id ASC)
            ) AS result
        FROM 
            gin_processes gp
        JOIN 
            "gin-bales" gb ON gp.id = gb.process_id
        JOIN 
            ginners g ON gp.ginner_id = g.id
        JOIN 
            seasons s ON gp.season_id = s.id
        JOIN 
            programs p ON gp.program_id = p.id
        WHERE 
            gp.id = ${processId}
            AND gb.sold_status = false
        GROUP BY 
            gp.id, gp.lot_no, gp.date, gp.press_no, gp.reel_lot_no
        ORDER BY 
            gp.id DESC;
      `
      )

      const simplifiedResults = results.map((item: any) => item.result);
      return res.sendSuccess(res, simplifiedResults);  
    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error?.message);
      }
}


const createVerifiedLintStock = async (req: Request, res: Response) => {
    try {
        const data = {
            ginner_id: req.body.ginnerId,
            spinner_id: req.body.spinnerId,
            country_id: req.body.countryId,
            state_id: req.body.stateId,
            process_id: req.body.processId,
            sales_id: req.body.salesId,
            processor_type: req.body.processorType,
            total_qty: req.body.totalQty,
            no_of_bales: req.body.noOfBales,
            lot_no: req.body.lotNo,
            reel_lot_no: req.body.reelLotNo,
            actual_total_qty: req.body.actualTotalQty,
            actual_no_of_bales: req.body.actualNoOfBales,
            consent_form_te: req.body.consentForm,
            uploaded_photos_te: req.body.uploadedPhotos,
            status: 'Pending'
          };
          const lintVerified = await LintStockVerified.create(data);
      return res.sendSuccess(res, lintVerified);  
    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error?.message);
      }
}


export { getGinProcessLotNo, getGinProcessLotDetials, createVerifiedLintStock};