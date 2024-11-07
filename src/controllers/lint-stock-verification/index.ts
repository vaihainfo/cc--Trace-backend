import { Request, Response } from "express";
import GinProcess from "../../models/gin-process.model";
import Ginner from "../../models/ginner.model";
import { Sequelize, Op } from "sequelize";
import sequelize from "../../util/dbConn";
import LintStockVerified from "../../models/lint-stock-verified.model";
import GinBale from "../../models/gin-bale.model";
import Country from "../../models/country.model";
import State from "../../models/state.model";
import Spinner from "../../models/spinner.model";
import GinSales from "../../models/gin-sales.model";
import TraceabilityExecutive from "../../models/traceability-executive.model";


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
                'id', gp.id,
                'ginner_id', g.id,
                'ginner_name', g.name,
                'lot_no', gp.lot_no,
                'date', gp.date,
                'press_no', gp.press_no,
                'reel_lot_no', gp.reel_lot_no,
                'greyout_status', gp.greyout_status,
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
            gp.id, gp.lot_no, gp.date, gp.press_no, gp.reel_lot_no, g.id
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
            te_id: req.body.teId,
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

          if(lintVerified){

          for await (const bale of req.body.bales) {
            let baleData = {
              te_verified_weight: bale.actualWeight,
              te_verified_status: bale.verifiedStatus,
            };
            const gin = await GinBale.update(
                baleData,
              {
                where: {
                  id: bale.id,
                }
              }
            );
          }

          const gin = await GinProcess.update(
            { 
                te_verified_status: true,
                te_verified_total_qty:req.body.actualTotalQty,
                te_verified_bales: req.body.actualNoOfBales
            },
            {
              where: {
                id: req.body.processId,
              },
            }
          );

        }

      return res.sendSuccess(res, lintVerified);  
    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error?.message);
      }
}

const getLintVerifiedStocks =  async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { ginnerId, teId, programId, brandId, stateId,countryId, spinnerId }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};

  try {

    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { "$country.county_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$state.state_name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }

    if (teId) {
      const idArray: number[] = teId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.te_id = { [Op.in]: idArray };
    }

    if (ginnerId) {
      const idArray: number[] = ginnerId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.ginner_id = { [Op.in]: idArray };
    }

    if (spinnerId) {
      const idArray: number[] = spinnerId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.spinner_id = { [Op.in]: idArray };
    }

    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
        whereCondition["$traceability_executive.brand$"] = { [Op.overlap]: idArray };
    }

    if (stateId) {
      const idArray: number[] = stateId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.state_id = { [Op.in]: idArray };
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.country_id = { [Op.in]: idArray };
    }

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$traceability_executive.program_id$"] = { [Op.overlap]: idArray };
    }

    let include = [
      {
        model: Ginner,
        as: "ginner",
        attributes: ['id','name'],
      },
      {
        model: Spinner,
        as: "spinner",
        attributes: ['id','name'],
      },
      {
        model: TraceabilityExecutive,
        as: "traceability_executive",
      },
      {
        model: Country,
        as: "country",
        attributes: ['id','county_name'],
      },
      {
        model: State,
        as: "state",
        attributes: ['id','state_name'],
      },
      {
        model: GinProcess,
        as: "ginprocess",
      },
      {
        model: GinSales,
        as: "ginsales",
      },
    ];

    if (req.query.pagination === "true") {
      const { count, rows } = await LintStockVerified.findAndCountAll({
        where: whereCondition,
        include: include,
        offset: offset,
        limit: limit,
        order: [["id", "desc"]],
      });
      return res.sendPaginationSuccess(res, rows, count);
    }else{
      const stock = await LintStockVerified.findAll({
        where: whereCondition,
        include: include,
        order: [["id", "desc"]],
      });
      return res.sendSuccess(res, stock);
    } 
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error?.message);
  }
}


const getLintVerifiedStock = async (req: Request, res: Response) =>{
  try {
    const stock = await LintStockVerified.findOne({
      where: {
        id: req.body.id,
      },
      include:[
        {
          model: Ginner,
          as: "ginner",
          attributes: ['id','name'],
        },
        {
          model: Spinner,
          as: "spinner",
          attributes: ['id','name'],
        },
        {
          model: TraceabilityExecutive,
          as: "traceability_executive",
        },
        {
          model: Country,
          as: "country",
          attributes: ['id','county_name'],
        },
        {
          model: State,
          as: "state",
          attributes: ['id','state_name'],
        },
        {
          model: GinProcess,
          as: "ginprocess",
        },
        {
          model: GinSales,
          as: "ginsales",
        },
      ]
    })
    return res.sendSuccess(res, stock);   
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error?.message);
  }
}


export { getGinProcessLotNo, getGinProcessLotDetials, createVerifiedLintStock, getLintVerifiedStocks, getLintVerifiedStock};