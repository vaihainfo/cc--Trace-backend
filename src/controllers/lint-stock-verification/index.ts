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
import SupplyChainManager from "../../models/supply-chain-manager.model";
import SupplyChainDirector from "../../models/supply-chain-director.model";
import BrandExecutive from "../../models/brand-executive.model";
import BrandManager from "../../models/brand-manager.model";
import PSTeam from "../../models/ps-team.model";

const getGinProcessLotNo = async (req: Request, res: Response) => {
  try {
    const ginnerId = req.query.ginnerId;

    if (!ginnerId) {
      return res.sendError(res, "No Ginner Id Found");
    }

    const [lotNo] = await sequelize.query(`
      SELECT gp.id, gp.lot_no,gp.reel_lot_no
        FROM gin_processes gp
        JOIN "gin-bales" gb ON gb.process_id = gp.id
        WHERE gp.ginner_id = ${ginnerId}
          AND gp.te_verified_status IS NULL
          AND gb.is_all_rejected IS NOT FALSE
          AND gp.greyout_status IS FALSE
          AND gb.sold_status IS FALSE
        GROUP BY gp.id`)

      return res.sendSuccess(res, lotNo);
    // } else {
    //   return res.sendError(res, "No Ginner Process is created for this Ginner");
    // }
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error?.message);
  }
};

const getGinSaleLotNo = async (req: Request, res: Response) => {
  try {
    const spinnerId = req.query.spinnerId;

    if (!spinnerId) {
      return res.sendError(res, "No Spinner Id Found");
    }
    const whereCondition: any = [];

    whereCondition.push(`gs.buyer = ${spinnerId}`)
    whereCondition.push(`gs.status IN ('Sold')`)
    whereCondition.push(`gs.greyout_status IS FALSE`)
    whereCondition.push(`gs.te_verified_status IS NULL`)
    whereCondition.push(`gs.be_verified_status IS NULL`)
    whereCondition.push(`gs.qty_stock > 1`)


    const whereClause = whereCondition.length > 0 ? `WHERE ${whereCondition.join(' AND ')} AND bd.total_qty > 0` : 'WHERE bd.total_qty > 0';

    let dataQuery = `
                WITH bale_details AS (
                    SELECT 
                        bs.sales_id,
                        COALESCE(
                            SUM(
                                CASE
                                WHEN gb.accepted_weight IS NOT NULL THEN gb.accepted_weight
                                ELSE CAST(gb.weight AS DOUBLE PRECISION)
                                END
                            ), 0
                        ) AS total_qty
                    FROM 
                        bale_selections bs
                    JOIN 
                        gin_sales gs ON bs.sales_id = gs.id
                    LEFT JOIN 
                        "gin-bales" gb ON bs.bale_id = gb.id
                    WHERE 
                        gs.status IN ('Sold')
                        AND (bs.spinner_status = true OR gs.status = 'Sold')
                    GROUP BY 
                        bs.sales_id
                )
                SELECT 
                    gs.id, gs.lot_no,gs.reel_lot_no,gs.invoice_no, gs.status
                FROM 
                    gin_sales gs
                LEFT JOIN 
                    ginners g ON gs.ginner_id = g.id
                LEFT JOIN 
                    seasons s ON gs.season_id = s.id
                LEFT JOIN 
                    programs p ON gs.program_id = p.id
                LEFT JOIN 
                    spinners sp ON gs.buyer = sp.id
                LEFT JOIN 
                    bale_details bd ON gs.id = bd.sales_id
                ${whereClause}
                ORDER BY 
                    gs."id" ASC`;

        const lotNo = await sequelize.query(dataQuery, {
                    type: sequelize.QueryTypes.SELECT,
                });

    return res.sendSuccess(res, lotNo);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error?.message);
  }
};

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
                    'greyout_status', gp.greyout_status,
                    'sold_status', gb.sold_status,
                    'te_verified_status', gb.te_verified_status,
                    'te_verified_weight', gb.te_verified_weight,
                    'gin_verified_status', gb.gin_verified_status,
                    'gin_verified_weight', gb.gin_verified_weight,
                    'scm_verified_status', gb.scm_verified_status,
                    'scm_verified_weight', gb.scm_verified_weight,
                    'scd_verified_status', gb.scd_verified_status,
                    'scd_verified_weight', gb.scd_verified_weight
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
            AND gb.is_all_rejected IS NOT FALSE
        GROUP BY 
            gp.id, gp.lot_no, gp.date, gp.press_no, gp.reel_lot_no, g.id
        ORDER BY 
            gp.id DESC;
      `
    );

    const simplifiedResults = results.map((item: any) => item.result);
    return res.sendSuccess(res, simplifiedResults);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error?.message);
  }
};

const getGinSalesLotDetials = async (req: Request, res: Response) => {
  try {
    const salesId = req.query.salesId;

    if (!salesId) {
      return res.sendError(res, "No Sales Id Found");
    }

    const [results] = await sequelize.query(
      `SELECT 
            jsonb_build_object(
                'id', gs.id,
                'ginner_id', g.id,
                'ginner_name', g.name,
                'spinner_name', ss.name,
                'spinner_id', ss.id,
                'lot_no', gs.lot_no,
                'date', gs.date,
                'press_no', gs.press_no,
                'reel_lot_no', gs.reel_lot_no,
                'greyout_status', gs.greyout_status,
                'total_qty', gs.total_qty,
                'no_of_bales', gs.no_of_bales,
                'received_qty', SUM(CAST(gb.weight AS DOUBLE PRECISION)),
                'accepted_total_qty', COALESCE(
                            SUM(
                                CASE
                                WHEN gb.accepted_weight IS NOT NULL THEN gb.accepted_weight
                                ELSE CAST(gb.weight AS DOUBLE PRECISION)
                                END
                            ), 0
                        ),
                'accepted_no_of_bales', COUNT(DISTINCT gb.id),
                'status', gs.status,
                'qty_stock', gs.qty_stock,
                'bales', jsonb_agg(jsonb_build_object(
                    'id', gb.id,
                    'bale_no', gb.bale_no,
                    'weight', gb.weight,
                    'old_weight', gb.old_weight,
                    'accepted_weight', gb.accepted_weight,
                    'sold_status', gb.sold_status,
                    'is_all_rejected', gb.is_all_rejected,
                    'greyout_status', gs.greyout_status
                ) ORDER BY gb.id ASC)
            ) AS result
        FROM 
            gin_sales gs
        JOIN 
            bale_selections bs ON gs.id = bs.sales_id
        JOIN 
            "gin-bales" gb ON gb.id = bs.bale_id AND (bs.spinner_status = true OR gs.status = 'Sold')
        JOIN 
            ginners g ON gs.ginner_id = g.id
        JOIN 
            spinners ss ON gs.buyer = ss.id
        JOIN 
            seasons s ON gs.season_id = s.id
        JOIN 
            programs p ON gs.program_id = p.id
        WHERE 
            gs.id = ${salesId}
            AND gs.status IN ('Sold', 'Partially Accepted', 'Partially Rejected')
        GROUP BY 
            gs.id, gs.lot_no, gs.date, gs.press_no, gs.reel_lot_no, g.id, ss.id
        ORDER BY 
            gs.id DESC;
      `
    );

    const simplifiedResults = results.map((item: any) => item.result);
    return res.sendSuccess(res, simplifiedResults);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error?.message);
  }
};

const createVerifiedLintStock = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction()
  try {
    if(!req.body.processorType){
      return res.sendError(res, 'Processor Type is needed either Ginner/Spinner');
    }

    const data = {
      te_id: req.body.teId,
      be_id: req.body.beId,
      ginner_id: req.body.ginnerId,
      spinner_id: req.body.spinnerId,
      country_id: req.body.countryId,
      state_id: req.body.stateId,
      process_id: req.body.processId,
      sales_id: req.body.salesId,
      processor_type: req.body.processorType,
      total_qty: req.body.totalQty,
      no_of_bales: req.body.noOfBales,
      date_initiated_te: req.body.date_initiated_te,
      date_initiated_be: req.body.date_initiated_be,
      lot_no: req.body.lotNo,
      reel_lot_no: req.body.reelLotNo,
      actual_total_qty: req.body.actualTotalQty,
      actual_no_of_bales: req.body.actualNoOfBales,
      consent_form_te: req.body.teId ? req.body.consentForm : null,
      uploaded_photos_te: req.body.teId ? req.body.uploadedPhotos : null,
      consent_form_be: req.body.beId ? req.body.consentForm : null,
      uploaded_photos_be: req.body.beId ? req.body.uploadedPhotos : null,
      status: req.body.status === "Accepted" ? "Accepted" : "Rejected",
      status_ginner: req.body.processorType?.toLowerCase() == 'ginner' ? 'Pending' : null,
      status_spinner: req.body.processorType?.toLowerCase() == 'spinner' ? 'Pending' : null,
    };
    const lintVerified = await LintStockVerified.create(data,{transaction});

    if (lintVerified) {
      if(req.body.processorType == 'Ginner' || req.body.processorType == 'ginner'){
        for await (const bale of req.body.bales) {
          let baleData = {
            gin_level_verify: true,
            te_verified_weight: bale.actualWeight,
            te_verified_status: bale.verifiedStatus,
          };
          const gin = await GinBale.update(baleData, {
            where: {
              id: bale.id,
            },
            transaction
          });
        }
  
        const gin = await GinProcess.update(
          {
            te_verified_status: req.body.status === "Accepted" ? true : false,
            te_verified_total_qty: req.body.actualTotalQty,
            te_verified_bales: req.body.actualNoOfBales,
            verification_status: 'Pending',
          },
          {
            where: {
              id: req.body.processId,
            },
            transaction
          }
        );
      }

      if(req.body.processorType == 'Spinner' || req.body.processorType == 'spinner'){
        // for await (const bale of req.body.bales) {
        //   let baleData = {
        //     spin_level_verify: true,
        //     te_sale_verified_weight: req.body.teId ? bale.actualWeight : null,
        //     te_sale_verified_status:  req.body.teId ? bale.verifiedStatus : null,
        //     be_verified_weight: req.body.beId ? bale.actualWeight : null,
        //     be_verified_status:  req.body.beId ? bale.verifiedStatus : null
        //   };
        //   const gin = await GinBale.update(baleData, {
        //     where: {
        //       id: bale.id,
        //     },
        //   });
        // }
  
        const gin = await GinSales.update(
          {
            te_verified_status: req.body.teId ? req.body.status === "Accepted" ? true : false : null,
            te_verified_total_qty: req.body.teId ? req.body.actualTotalQty : null,
            te_verified_bales: req.body.teId ? req.body.actualNoOfBales : null,
            be_verified_status: req.body.beId ? req.body.status === "Accepted" ? true : false : null,
            be_verified_total_qty: req.body.beId ? req.body.actualTotalQty : null,
            be_verified_bales: req.body.beId ? req.body.actualNoOfBales : null,
            verification_status: 'Pending',
          },
          {
            where: {
              id: req.body.salesId,
            },
            transaction
          }
        );
      }
    }

    await transaction.commit();
    return res.sendSuccess(res, lintVerified);
  } catch (error: any) {
    console.log(error);
    await transaction.rollback();
    return res.sendError(res, error?.message);
  }
};

const getLintVerifiedStocks = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const {
    ginnerId,
    teId,
    programId,
    brandId,
    stateId,
    countryId,
    spinnerId,
  }: any = req.query;
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
      whereCondition["$traceability_executive.brand$"] = {
        [Op.overlap]: idArray,
      };
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
      whereCondition["$traceability_executive.program_id$"] = {
        [Op.overlap]: idArray,
      };
    }

    whereCondition.processor_type = 'Ginner';

    let include = [
      {
        model: Ginner,
        as: "ginner",
        attributes: ["id", "name"],
      },
      {
        model: Spinner,
        as: "spinner",
        attributes: ["id", "name"],
      },
      {
        model: TraceabilityExecutive,
        as: "traceability_executive",
      },
      {
        model: Country,
        as: "country",
        attributes: ["id", "county_name"],
      },
      {
        model: State,
        as: "state",
        attributes: ["id", "state_name"],
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
    } else {
      const stock = await LintStockVerified.findAll({
        where: whereCondition,
        include: include,
        order: [["id", "desc"]],
      });
      return res.sendSuccess(res, stock);
    }
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error?.message);
  }
};

const getLintVerifiedStock = async (req: Request, res: Response) => {
  try {
    let stock = await LintStockVerified.findOne({
      where: {
        id: req.query.id,
      },
      include: [
        {
          model: Ginner,
          as: "ginner",
          attributes: ["id", "name", "brand"],
        },
        {
          model: Spinner,
          as: "spinner",
          attributes: ["id", "name", "brand"],
        },
        {
          model: TraceabilityExecutive,
          as: "traceability_executive",
          attributes: ["id", "name", "brand"],
        },
        {
          model: BrandExecutive,
          as: "brand_executive",
          attributes: ["id", "name", "brand"],
        },
        {
          model: SupplyChainManager,
          as: "supply_chain_manager",
          attributes: ["id", "name", "brand"],
        },
        {
          model: SupplyChainDirector,
          as: "supply_chain_director",
          attributes: ["id", "name", "brand"],
        },
        {
          model: BrandManager,
          as: "brand_manager",
          attributes: ["id", "name", "brand"],
        },
        {
          model: PSTeam,
          as: "ps_team",
          attributes: ["id", "name", "brand"],
        },
        {
          model: Country,
          as: "country",
          attributes: ["id", "county_name"],
        },
        {
          model: State,
          as: "state",
          attributes: ["id", "state_name"],
        },
        {
          model: GinProcess,
          as: "ginprocess",
        },
        {
          model: GinSales,
          as: "ginsales",
        },
      ],
    });

    if (stock) {
      if(stock?.dataValues?.processor_type === 'Ginner' && stock?.dataValues.process_id){

        let bales = await GinBale.findAll({
          attributes: [
            "id",
            "bale_no",
            "process_id",
            "weight",
            "old_weight",
            "sold_status",
            "te_verified_status",
            "te_verified_weight",
            "gin_verified_status",
            "gin_verified_weight",
            "scm_verified_status",
            "scm_verified_weight",
            "scd_verified_status",
            "scd_verified_weight",
            "gin_level_verify"
          ],
          where: { process_id: stock?.dataValues?.process_id, sold_status: false },
          order: [['id','asc']]
        });
        if (bales && bales.length > 0) {
          stock = {
            ...stock?.dataValues,
            bales,
          };
        }
      }
    }
    return res.sendSuccess(res, stock);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error?.message);
  }
};

//Ginner Stocks
const getGinnerVerifiedStocks = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const {
    ginnerId,
    teId,
    programId,
    brandId,
    stateId,
    countryId,
    spinnerId,
    scmId,
    status
  }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};

  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$traceability_executive.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$supply_chain_manager.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { "$country.county_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$state.state_name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }

    if (!ginnerId) {
      return res.sendError(res, "Ginner ID is required");
    }

    if (teId) {
      const idArray: number[] = teId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.te_id = { [Op.in]: idArray };
    }
    if (scmId) {
      const idArray: number[] = scmId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.scm_id = { [Op.in]: idArray };
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
      whereCondition["$ginner.brand$"] = { [Op.overlap]: idArray };
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
      whereCondition["$ginner.program_id$"] = { [Op.overlap]: idArray };
    }

    if(status == 'Pending'){
      whereCondition.status_ginner = 'Pending'
    }else if(status == 'Rejected'){
      whereCondition.status_ginner = 'Rejected'
    }else{
      whereCondition.status_ginner = 'Accepted'
    }

    whereCondition.status = { [Op.in]: ['Accepted', 'Rejected'] };

    whereCondition.processor_type = 'Ginner';

    let include = [
      {
        model: Ginner,
        as: "ginner",
        attributes: ["id", "name"],
      },
      {
        model: TraceabilityExecutive,
        as: "traceability_executive",
      },
      {
        model: SupplyChainManager,
        as: "supply_chain_manager",
      },
      {
        model: Country,
        as: "country",
        attributes: ["id", "county_name"],
      },
      {
        model: State,
        as: "state",
        attributes: ["id", "state_name"],
      },
      {
        model: GinProcess,
        as: "ginprocess",
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
    } else {
      const stock = await LintStockVerified.findAll({
        where: whereCondition,
        include: include,
        order: [["id", "desc"]],
      });
      return res.sendSuccess(res, stock);
    }
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error?.message);
  }
};

const editGinVerifiedStockConfirm = async (
  req: Request,
  res: Response
) => {
  try {
    const data = {
      scm_id: req.body.scmId,
      confirmed_gin_total_qty: req.body.confirmedTotalQty,
      confirmed_gin_no_of_bales: req.body.confirmedNoOfBales,
      consent_form_ginner: req.body.consentForm,
      uploaded_photos_ginner: req.body.uploadedPhotos,
      status_ginner: req.body.status === "Accepted" ? "Accepted" : "Rejected",
      status_scm: "Pending",
      reason_ginner: req.body.reason
    };

    const lintVerified = await LintStockVerified.update(data, {
      where: { id: req.body.id },
    });

    if (lintVerified) {
      for await (const bale of req.body.bales) {
        let baleData = {
          gin_verified_weight: bale.actualWeight,
          gin_verified_status: bale.verifiedStatus,
        };
        const gin = await GinBale.update(baleData, {
          where: {
            id: bale.id,
          },
        });
      }

      const gin = await GinProcess.update(
        {
          gin_verified_status: req.body.status === "Accepted" ? true : false,
          gin_verified_total_qty: req.body.confirmedTotalQty,
          gin_verified_bales: req.body.confirmedNoOfBales,
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
    console.log(error);
    return res.sendError(res, error?.message);
  }
};

const updateSCMVerifiedStockConfirm = async (
  req: Request,
  res: Response
) => {
  try {
    const data = {
      scd_id: req.body.scdId,
      confirmed_scm_total_qty: req.body.confirmedTotalQty,
      confirmed_scm_no_of_bales: req.body.confirmedNoOfBales,
      consent_form_scm: req.body.consentForm,
      uploaded_photos_scm: req.body.uploadedPhotos,
      status_scm: req.body.status === "Accepted" ? "Accepted" : "Rejected",
      status_scd: "Pending",
      reason_scm: req.body.reason
    };

    const lintVerified = await LintStockVerified.update(data, {
      where: { id: req.body.id },
    });

    if (lintVerified) {
      for await (const bale of req.body.bales) {
        let baleData = {
          scm_verified_weight: bale.actualWeight,
          scm_verified_status: bale.verifiedStatus,
        };
        const gin = await GinBale.update(baleData, {
          where: {
            id: bale.id,
          },
        });
      }

      const gin = await GinProcess.update(
        {
          scm_verified_status: req.body.status === "Accepted" ? true : false,
          scm_verified_total_qty: req.body.confirmedTotalQty,
          scm_verified_bales: req.body.confirmedNoOfBales,
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
    console.log(error);
    return res.sendError(res, error?.message);
  }
};

const updateSCDVerifiedStockConfirm = async (
  req: Request,
  res: Response
) => {
  try {
    const data = {
      confirmed_scd_total_qty: req.body.confirmedTotalQty,
      confirmed_scd_no_of_bales: req.body.confirmedNoOfBales,
      consent_form_scd: req.body.consentForm,
      uploaded_photos_scd: req.body.uploadedPhotos,
      status_scd: req.body.status === "Accepted" ? "Accepted" : "Rejected",
      reason_scd: req.body.reason
    };

    const lintVerified = await LintStockVerified.update(data, {
      where: { id: req.body.id },
    });

    if (lintVerified) {
      for await (const bale of req.body.bales) {
        let baleData = {
          scd_verified_weight: bale.actualWeight,
          scd_verified_status: bale.verifiedStatus,
        };
        const gin = await GinBale.update(baleData, {
          where: {
            id: bale.id,
          },
        });
      }

      const gin = await GinProcess.update(
        {
          scd_verified_status: req.body.status === "Accepted" ? true : false,
          scd_verified_total_qty: req.body.confirmedTotalQty,
          scd_verified_bales: req.body.confirmedNoOfBales,
          verification_status: 'Completed',
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
    console.log(error);
    return res.sendError(res, error?.message);
  }
};

const getSCMVerifiedStocks = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const {
    scmId,
    ginnerId,
    teId,
    programId,
    brandId,
    stateId,
    countryId,
    spinnerId,
    status
  }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};

  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$traceability_executive.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$supply_chain_director.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { "$country.county_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$state.state_name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }

    if (!scmId) {
      return res.sendError(res, "SCM ID is required");
    }
    if (scmId) {
      const idArray: number[] = scmId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.scm_id = { [Op.in]: idArray };
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
      whereCondition["$supply_chain_manager.brand$"] = { [Op.overlap]: idArray };
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
      whereCondition["$supply_chain_manager.program_id$"] = { [Op.overlap]: idArray };
    }

    if(status == 'Pending'){
      whereCondition.status_scm = 'Pending'
    }else if(status == 'Rejected'){
      whereCondition.status_scm = 'Rejected'
    }else{
      whereCondition.status_scm = 'Accepted'
    }
    
    // whereCondition.status = 'Accepted'
    whereCondition.status = { [Op.in]: ['Accepted', 'Rejected'] };
    whereCondition.status_ginner = { [Op.in]: ['Accepted', 'Rejected'] };
    whereCondition.processor_type = 'Ginner';

    let include = [
      {
        model: Ginner,
        as: "ginner",
        attributes: ["id", "name"],
      },
      {
        model: SupplyChainManager,
        as: "supply_chain_manager",
        attributes: ["id", "name"],
      },
      {
        model: SupplyChainDirector,
        as: "supply_chain_director",
        attributes: ["id", "name"],
      },
      {
        model: TraceabilityExecutive,
        as: "traceability_executive",
      },
      {
        model: Country,
        as: "country",
        attributes: ["id", "county_name"],
      },
      {
        model: State,
        as: "state",
        attributes: ["id", "state_name"],
      },
      {
        model: GinProcess,
        as: "ginprocess",
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
    } else {
      const stock = await LintStockVerified.findAll({
        where: whereCondition,
        include: include,
        order: [["id", "desc"]],
      });
      return res.sendSuccess(res, stock);
    }
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error?.message);
  }
};

const getSCDVerifiedStocks = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const {
    scmId,
    scdId,
    ginnerId,
    teId,
    programId,
    brandId,
    stateId,
    countryId,
    spinnerId,
    status
  }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};

  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$traceability_executive.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$supply_chain_manager.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { "$country.county_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$state.state_name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }

    if (!scdId) {
      return res.sendError(res, "SCD ID is required");
    }

    if (scdId) {
      const idArray: number[] = scdId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.scd_id = { [Op.in]: idArray };
    }

    if (scmId) {
      const idArray: number[] = scmId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.scm_id = { [Op.in]: idArray };
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
      whereCondition["$supply_chain_director.brand$"] = { [Op.overlap]: idArray };
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
      whereCondition["$supply_chain_director.program_id$"] = { [Op.overlap]: idArray };
    }

    if(status == 'Pending'){
      whereCondition.status_scd = 'Pending'
    }else if(status == 'Rejected'){
      whereCondition.status_scd = 'Rejected'
    }else{
      whereCondition.status_scd = 'Accepted'
    }

    // whereCondition.status_scm = 'Accepted'
    whereCondition.status_scm = { [Op.in]: ['Accepted', 'Rejected'] };
    // whereCondition.status = 'Accepted'
    whereCondition.status = { [Op.in]: ['Accepted', 'Rejected'] };
    whereCondition.status_ginner = { [Op.in]: ['Accepted', 'Rejected'] };
    whereCondition.processor_type = 'Ginner';

    let include = [
      {
        model: Ginner,
        as: "ginner",
        attributes: ["id", "name"],
      },
      {
        model: SupplyChainManager,
        as: "supply_chain_manager",
        attributes: ["id", "name"],
      },
      {
        model: SupplyChainDirector,
        as: "supply_chain_director",
        attributes: ["id", "name"],
      },
      {
        model: TraceabilityExecutive,
        as: "traceability_executive",
      },
      {
        model: Country,
        as: "country",
        attributes: ["id", "county_name"],
      },
      {
        model: State,
        as: "state",
        attributes: ["id", "state_name"],
      },
      {
        model: GinProcess,
        as: "ginprocess",
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
    } else {
      const stock = await LintStockVerified.findAll({
        where: whereCondition,
        include: include,
        order: [["id", "desc"]],
      });
      return res.sendSuccess(res, stock);
    }
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error?.message);
  }
};


const getListVerifiedStocks = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const {
    scmId,
    scdId,
    ginnerId,
    teId,
    programId,
    brandId,
    stateId,
    countryId,
    spinnerId,
    status
  }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};

  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$traceability_executive.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$supply_chain_manager.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$supply_chain_director.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { "$country.county_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$state.state_name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }

    if (scdId) {
      const idArray: number[] = scdId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.scd_id = { [Op.in]: idArray };
    }

    if (scmId) {
      const idArray: number[] = scmId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.scm_id = { [Op.in]: idArray };
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

    whereCondition.status_scd = 'Accepted'
    whereCondition.status_scm = 'Accepted'
    whereCondition.status_ginner = 'Accepted'
    whereCondition.status = 'Accepted'

    whereCondition.processor_type = 'Ginner';

    let include = [
      {
        model: Ginner,
        as: "ginner",
        attributes: ["id", "name"],
      },
      {
        model: SupplyChainManager,
        as: "supply_chain_manager",
        attributes: ["id", "name"],
      },
      {
        model: SupplyChainDirector,
        as: "supply_chain_director",
        attributes: ["id", "name"],
      },
      {
        model: TraceabilityExecutive,
        as: "traceability_executive",
        attributes: ["id", "name"],
      },
      {
        model: Country,
        as: "country",
        attributes: ["id", "county_name"],
      },
      {
        model: State,
        as: "state",
        attributes: ["id", "state_name"],
      },
      {
        model: GinProcess,
        as: "ginprocess",
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
    } else {
      const stock = await LintStockVerified.findAll({
        where: whereCondition,
        include: include,
        order: [["id", "desc"]],
      });
      return res.sendSuccess(res, stock);
    }
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error?.message);
  }
};

const getTypeWiseListVerifiedStocks = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const {
    scmId,
    scdId,
    ginnerId,
    teId,
    programId,
    brandId,
    stateId,
    countryId,
    type,
    spinnerId,
    status
  }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};

  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$traceability_executive.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$supply_chain_manager.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$supply_chain_director.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { "$country.county_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$state.state_name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }

    if (scdId) {
      const idArray: number[] = scdId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.scd_id = { [Op.in]: idArray };
    }

    if (scmId) {
      const idArray: number[] = scmId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.scm_id = { [Op.in]: idArray };
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

    if( type === 'Ginner'){
      whereCondition.status = 'Accepted';
      whereCondition.status_ginner = { [Op.in]: ['Accepted', 'Rejected'] };
    }else if(type === 'Supply_Chain_Manager'){
      whereCondition.status = 'Accepted';
      whereCondition.status_ginner = 'Accepted';
      whereCondition.status_scm = { [Op.in]: ['Accepted', 'Rejected'] };
    }else if(type === 'Supply_Chain_Director'){
      whereCondition.status = { [Op.in]: ['Accepted', 'Rejected'] };
      whereCondition.status_ginner = 'Accepted';
      whereCondition.status_scm = 'Accepted';
      whereCondition.status_scd = { [Op.in]: ['Accepted', 'Rejected'] };
    }

    whereCondition.processor_type = 'Ginner';

    let include = [
      {
        model: Ginner,
        as: "ginner",
        attributes: ["id", "name"],
      },
      {
        model: SupplyChainManager,
        as: "supply_chain_manager",
        attributes: ["id", "name"],
      },
      {
        model: SupplyChainDirector,
        as: "supply_chain_director",
        attributes: ["id", "name"],
      },
      {
        model: TraceabilityExecutive,
        as: "traceability_executive",
        attributes: ["id", "name"],
      },
      {
        model: Country,
        as: "country",
        attributes: ["id", "county_name"],
      },
      {
        model: State,
        as: "state",
        attributes: ["id", "state_name"],
      },
      {
        model: GinProcess,
        as: "ginprocess",
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
    } else {
      const stock = await LintStockVerified.findAll({
        where: whereCondition,
        include: include,
        order: [["id", "desc"]],
      });
      return res.sendSuccess(res, stock);
    }
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error?.message);
  }
};


const fetchTeGinner = async (req: Request, res: Response) => {
    try {
        const result = await TraceabilityExecutive.findOne({
            where: {
                id: req.query.teId,
            }
        });
        
        let ginners = [];
        if (result) {
          const mappedGinners = result.mapped_ginners;
           ginners = await Ginner.findAll({
            where: {
                id: mappedGinners,
                state_id: req.query.stateId
            },
        });
      }
      return res.sendSuccess(res, ginners);

    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
}

const fetchTeSpinner = async (req: Request, res: Response) => {
  try {
      const result = await TraceabilityExecutive.findOne({
          where: {
              id: req.query.teId 
          }
      });
      
      let spinners = [];
      if (result) {
        const mappedspinners = result.mapped_spinners;
         spinners = await Spinner.findAll({
          where: {
              id: mappedspinners,
              state_id: req.query.stateId
          },
      });
    }
    return res.sendSuccess(res, spinners);

  } catch (error: any) {
      console.log(error);
      return res.sendError(res, error.message);
  }
}

const fetchBeSpinner = async (req: Request, res: Response) => {
  try {
      const result = await BrandExecutive.findOne({
          where: {
              id: req.query.beId 
          }
      });
      
      let spinners = [];
      if (result) {
        const mappedspinners = result.mapped_spinners;
         spinners = await Spinner.findAll({
          where: {
              id: mappedspinners,
              state_id: req.query.stateId
          },
      });
    }
    return res.sendSuccess(res, spinners);

  } catch (error: any) {
      console.log(error);
      return res.sendError(res, error.message);
  }
}

const fetchTeCountries = async (req: Request, res: Response) => {
  try {
      const result = await TraceabilityExecutive.findOne({
          where: {
              id: req.query.teId 
          }
      });
      
      let countries = [];
      if (result) {
        const mappedCountry = result.country_id;
        countries = await Country.findOne({
          where: {
              id: mappedCountry,
          },
      });
    }
    return res.sendSuccess(res, countries);

  } catch (error: any) {
      console.log(error);
      return res.sendError(res, error.message);
  }
}

const fetchBeCountries = async (req: Request, res: Response) => {
  try {
      const result = await BrandExecutive.findOne({
          where: {
              id: req.query.beId 
          }
      });
      
      let countries = [];
      if (result) {
        const mappedCountry = result.country_id;
        countries = await Country.findOne({
          where: {
              id: mappedCountry,
          },
      });
    }
    return res.sendSuccess(res, countries);

  } catch (error: any) {
      console.log(error);
      return res.sendError(res, error.message);
  }
}

const fetchTeStates= async (req: Request, res: Response) => {
  try {
      const result = await TraceabilityExecutive.findOne({
          where: {
              id: req.query.teId 
          }
      });
      
      let states = [];
      if (result) {
        const mappedStates = result.mapped_states;
        states = await State.findAll({
          where: {
              id: mappedStates,
          },
      });
    }
    return res.sendSuccess(res, states);

  } catch (error: any) {
      console.log(error);
      return res.sendError(res, error.message);
  }
}

const fetchBeStates= async (req: Request, res: Response) => {
  try {
      const result = await BrandExecutive.findOne({
          where: {
              id: req.query.beId 
          }
      });
      
      let states = [];
      if (result) {
        const mappedStates = result.mapped_states;
        states = await State.findAll({
          where: {
              id: mappedStates,
          },
      });
    }
    return res.sendSuccess(res, states);

  } catch (error: any) {
      console.log(error);
      return res.sendError(res, error.message);
  }
}

//Spinner Flow
const getLintSpinVerifiedStocks = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const {
    ginnerId,
    teId,
    beId,
    programId,
    brandId,
    stateId,
    countryId,
    spinnerId,
  }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};

  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$spinner.name$": { [Op.iLike]: `%${searchTerm}%` } },
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

    if (beId) {
      const idArray: number[] = beId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.be_id = { [Op.in]: idArray };
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
        if(beId){
          whereCondition["$brand_executive.brand$"] = {
            [Op.overlap]: idArray,
          };
        }else{
          whereCondition["$traceability_executive.brand$"] = {
            [Op.overlap]: idArray,
          };
        }
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

      if(beId){
        whereCondition["$brand_executive.program_id$"] = {
          [Op.overlap]: idArray,
        };
      }else{
        whereCondition["$traceability_executive.program_id$"] = {
          [Op.overlap]: idArray,
        };
      }
    }

    whereCondition.processor_type = 'Spinner';

    let include = [
      {
        model: Spinner,
        as: "spinner",
        attributes: ["id", "name"],
      },
      {
        model: TraceabilityExecutive,
        as: "traceability_executive",
        attributes: ["id", "name"],
      },
      {
        model: BrandExecutive,
        as: "brand_executive",
        attributes: ["id", "name"],
      },
      {
        model: BrandManager,
        as: "brand_manager",
        attributes: ["id", "name"],
      },
      {
        model: PSTeam,
        as: "ps_team",
        attributes: ["id", "name"],
      },
      {
        model: Country,
        as: "country",
        attributes: ["id", "county_name"],
      },
      {
        model: State,
        as: "state",
        attributes: ["id", "state_name"],
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
    } else {
      const stock = await LintStockVerified.findAll({
        where: whereCondition,
        include: include,
        order: [["id", "desc"]],
      });
      return res.sendSuccess(res, stock);
    }
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error?.message);
  }
};

const updateSpinVerifiedStockConfirm = async (
  req: Request,
  res: Response
) => {
  const transaction = await sequelize.transaction()
  try {
    const data = {
      bm_id: req.body.bmId,
      confirmed_spin_total_qty: req.body.confirmedTotalQty,
      confirmed_spin_no_of_bales: req.body.confirmedNoOfBales,
      consent_form_spinner: req.body.consentForm,
      uploaded_photos_spinner: req.body.uploadedPhotos,
      status_spinner: req.body.status === "Accepted" ? "Accepted" : "Rejected",
      status_bm: "Pending",
      reason_spinner: req.body.reason
    };

    const lintVerified = await LintStockVerified.update(data, {
      where: { id: req.body.id },
      transaction
    });

    if (lintVerified) {
      const gin = await GinSales.update(
        {
          spin_verified_status: req.body.status === "Accepted" ? true : false,
          spin_verified_total_qty: req.body.confirmedTotalQty,
          spin_verified_bales: req.body.confirmedNoOfBales,
        },
        {
          where: {
            id: req.body.salesId,
          },
          transaction
        }
      );
    }

    await transaction.commit();
    return res.sendSuccess(res, lintVerified);
  } catch (error: any) {
    console.log(error);
    await transaction.rollback();
    return res.sendError(res, error?.message);
  }
};

const updateBMVerifiedStockConfirm = async (
  req: Request,
  res: Response
) => {
  const transaction = await sequelize.transaction()
  try {
    const data = {
      ps_id: req.body.psId,
      confirmed_bm_total_qty: req.body.confirmedTotalQty,
      confirmed_bm_no_of_bales: req.body.confirmedNoOfBales,
      consent_form_bm: req.body.consentForm,
      uploaded_photos_bm: req.body.uploadedPhotos,
      status_bm: req.body.status === "Accepted" ? "Accepted" : "Rejected",
      status_ps: "Pending",
      reason_bm: req.body.reason
    };

    const lintVerified = await LintStockVerified.update(data, {
      where: { id: req.body.id },
      transaction
    });

    if (lintVerified) {
      const gin = await GinSales.update(
        {
          bm_verified_status: req.body.status === "Accepted" ? true : false,
          bm_verified_total_qty: req.body.confirmedTotalQty,
          bm_verified_bales: req.body.confirmedNoOfBales,
        },
        {
          where: {
            id: req.body.salesId,
          },
          transaction
        }
      );
    }

    await transaction.commit();
    return res.sendSuccess(res, lintVerified);
  } catch (error: any) {
    console.log(error);
    await transaction.rollback();
    return res.sendError(res, error?.message);
  }
};

const updatePSVerifiedStockConfirm = async (
  req: Request,
  res: Response
) => {
  const transaction = await sequelize.transaction();
  try {
    const data = {
      confirmed_ps_total_qty: req.body.confirmedTotalQty,
      confirmed_ps_no_of_bales: req.body.confirmedNoOfBales,
      consent_form_ps: req.body.consentForm,
      uploaded_photos_ps: req.body.uploadedPhotos,
      status_ps: req.body.status === "Accepted" ? "Accepted" : "Rejected",
      reason_ps: req.body.reason
    };

    const lintVerified = await LintStockVerified.update(data, {
      where: { id: req.body.id },
      transaction
    });

    if (lintVerified) {
      let qtyStock =0;
      let greyOutQty = 0;
      let qtyStockBeforeVerification = 0;

      const ginsales = await GinSales.findOne({
        where:{
          id: req.body.salesId,
        },
        transaction
      })

      if(ginsales){
        qtyStockBeforeVerification =  ginsales?.qty_stock;
        if(req.body.status === "Accepted"){
          if(ginsales?.qty_stock > Number(req.body.confirmedTotalQty)){
            greyOutQty = ginsales?.qty_stock - Number(req.body.confirmedTotalQty);
          }
          qtyStock = Number(req.body.confirmedTotalQty);
        }else{
          if(ginsales?.qty_stock > Number(req.body.confirmedTotalQty)){
            qtyStock = ginsales?.qty_stock - Number(req.body.confirmedTotalQty);
          }
          greyOutQty = Number(req.body.confirmedTotalQty);
        }

        const gin = await GinSales.update(
          {
            ps_verified_status: req.body.status === "Accepted" ? true : false,
            ps_verified_total_qty: req.body.confirmedTotalQty,
            ps_verified_bales: req.body.confirmedNoOfBales,
            verification_status: 'Completed',
            qty_stock: qtyStock,
            greyed_out_qty: greyOutQty,
            qty_stock_before_verification: qtyStockBeforeVerification,
          },
          {
            where: {
              id: req.body.salesId,
            },
            transaction
          }
        );
      }
    }

    await transaction.commit();
    return res.sendSuccess(res, lintVerified);
  } catch (error: any) {
    console.log(error);
    await transaction.rollback();
    return res.sendError(res, error?.message);
  }
};

const getSpinnerVerifiedStocks = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const {
    ginnerId,
    teId,
    beId,
    programId,
    brandId,
    stateId,
    countryId,
    spinnerId,
    bmId,
    status
  }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};

  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$traceability_executive.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$brand_executive.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$brand_manager.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { "$country.county_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$state.state_name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }

    if (!spinnerId) {
      return res.sendError(res, "Spinner ID is required");
    }

    if (teId) {
      const idArray: number[] = teId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.te_id = { [Op.in]: idArray };
    }

    if (beId) {
      const idArray: number[] = beId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.te_id = { [Op.in]: idArray };
    }

    if (bmId) {
      const idArray: number[] = bmId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.bm_id = { [Op.in]: idArray };
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
      whereCondition["$spinner.brand$"] = { [Op.overlap]: idArray };
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
      whereCondition["$spinner.program_id$"] = { [Op.overlap]: idArray };
    }

    if(status == 'Pending'){
      whereCondition.status_spinner = 'Pending'
    }else if(status == 'Rejected'){
      whereCondition.status_spinner = 'Rejected'
    }else{
      whereCondition.status_spinner = 'Accepted'
    }

    whereCondition.status = { [Op.in]: ['Accepted', 'Rejected'] };
    whereCondition.processor_type = 'Spinner';

    let include = [
      {
        model: Ginner,
        as: "ginner",
        attributes: ["id", "name"],
      },
      {
        model: Spinner,
        as: "spinner",
        attributes: ["id", "name"],
      },
      {
        model: TraceabilityExecutive,
        as: "traceability_executive",
        attributes: ["id", "name"],
      },
      {
        model: BrandExecutive,
        as: "brand_executive",
        attributes: ["id", "name"],
      },
      {
        model: BrandManager,
        as: "brand_manager",
        attributes: ["id", "name"],
      },
      {
        model: PSTeam,
        as: "ps_team",
        attributes: ["id", "name"],
      },
      {
        model: Country,
        as: "country",
        attributes: ["id", "county_name"],
      },
      {
        model: State,
        as: "state",
        attributes: ["id", "state_name"],
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
    } else {
      const stock = await LintStockVerified.findAll({
        where: whereCondition,
        include: include,
        order: [["id", "desc"]],
      });
      return res.sendSuccess(res, stock);
    }
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error?.message);
  }
};

const getBMVerifiedStocks = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const {
    bmId,
    ginnerId,
    teId,
    beId,
    programId,
    brandId,
    stateId,
    countryId,
    spinnerId,
    status
  }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};

  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$spinner.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$traceability_executive.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$brand_executive.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$ps_team.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { "$country.county_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$state.state_name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }

    if (!bmId) {
      return res.sendError(res, "BM ID is required");
    }
    if (bmId) {
      const idArray: number[] = bmId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.bm_id = { [Op.in]: idArray };
    }

    if (teId) {
      const idArray: number[] = teId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.te_id = { [Op.in]: idArray };
    }

    if (beId) {
      const idArray: number[] = beId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.be_id = { [Op.in]: idArray };
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
      whereCondition["$brand_manager.brand$"] = { [Op.overlap]: idArray };
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
      whereCondition["$brand_manager.program_id$"] = { [Op.overlap]: idArray };
    }

    if(status == 'Pending'){
      whereCondition.status_bm = 'Pending'
    }else if(status == 'Rejected'){
      whereCondition.status_bm = 'Rejected'
    }else{
      whereCondition.status_bm = 'Accepted'
    }
    
    whereCondition.status = { [Op.in]: ['Accepted', 'Rejected'] };
    whereCondition.status_spinner = { [Op.in]: ['Accepted', 'Rejected'] };
    whereCondition.processor_type = 'Spinner';

    let include = [
      {
        model: Ginner,
        as: "ginner",
        attributes: ["id", "name"],
      },
      {
        model: Spinner,
        as: "spinner",
        attributes: ["id", "name"],
      },
      {
        model: BrandExecutive,
        as: "brand_executive",
        attributes: ["id", "name"],
      },
      {
        model: BrandManager,
        as: "brand_manager",
        attributes: ["id", "name"],
      },
      {
        model: PSTeam,
        as: "ps_team",
        attributes: ["id", "name"],
      },
      {
        model: TraceabilityExecutive,
        as: "traceability_executive",
        attributes: ["id", "name"],
      },
      {
        model: Country,
        as: "country",
        attributes: ["id", "county_name"],
      },
      {
        model: State,
        as: "state",
        attributes: ["id", "state_name"],
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
    } else {
      const stock = await LintStockVerified.findAll({
        where: whereCondition,
        include: include,
        order: [["id", "desc"]],
      });
      return res.sendSuccess(res, stock);
    }
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error?.message);
  }
};

const getPSVerifiedStocks = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const {
    bmID,
    psId,
    ginnerId,
    teId,
    beId,
    programId,
    brandId,
    stateId,
    countryId,
    spinnerId,
    status
  }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};

  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$spinner.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$traceability_executive.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$brand_executive.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$brand_manager.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { "$country.county_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$state.state_name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }

    if (!psId) {
      return res.sendError(res, "PS ID is required");
    }

    if (psId) {
      const idArray: number[] = psId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.ps_id = { [Op.in]: idArray };
    }

    if (bmID) {
      const idArray: number[] = bmID
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.bm_id = { [Op.in]: idArray };
    }

    if (teId) {
      const idArray: number[] = teId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.te_id = { [Op.in]: idArray };
    }

    if (beId) {
      const idArray: number[] = beId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.be_id = { [Op.in]: idArray };
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
      whereCondition["$ps_team.brand$"] = { [Op.overlap]: idArray };
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
      whereCondition["$ps_team.program_id$"] = { [Op.overlap]: idArray };
    }

    if(status == 'Pending'){
      whereCondition.status_ps = 'Pending'
    }else if(status == 'Rejected'){
      whereCondition.status_ps = 'Rejected'
    }else{
      whereCondition.status_ps = 'Accepted'
    }

    whereCondition.status_bm = { [Op.in]: ['Accepted', 'Rejected'] };
    whereCondition.status_spinner = { [Op.in]: ['Accepted', 'Rejected'] };
    whereCondition.status = { [Op.in]: ['Accepted', 'Rejected'] };
    whereCondition.processor_type = 'Spinner';

    let include = [
      {
        model: Ginner,
        as: "ginner",
        attributes: ["id", "name"],
      },
      {
        model: Spinner,
        as: "spinner",
        attributes: ["id", "name"],
      },
      {
        model: BrandExecutive,
        as: "brand_executive",
        attributes: ["id", "name"],
      },
      {
        model: BrandManager,
        as: "brand_manager",
        attributes: ["id", "name"],
      },
      {
        model: PSTeam,
        as: "ps_team",
        attributes: ["id", "name"],
      },
      {
        model: TraceabilityExecutive,
        as: "traceability_executive",
        attributes: ["id", "name"],
      },
      {
        model: Country,
        as: "country",
        attributes: ["id", "county_name"],
      },
      {
        model: State,
        as: "state",
        attributes: ["id", "state_name"],
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
    } else {
      const stock = await LintStockVerified.findAll({
        where: whereCondition,
        include: include,
        order: [["id", "desc"]],
      });
      return res.sendSuccess(res, stock);
    }
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error?.message);
  }
};

const getTypeWiseSpinVerifiedStocks = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const {
    bmId,
    psId,
    ginnerId,
    teId,
    beId,
    programId,
    brandId,
    stateId,
    countryId,
    type,
    spinnerId,
    status
  }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};

  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$spinner.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$traceability_executive.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$brand_executive.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$brand_manager.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$ps_team.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { "$country.county_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$state.state_name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }

    if (bmId) {
      const idArray: number[] = bmId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.bm_id = { [Op.in]: idArray };
    }

    if (psId) {
      const idArray: number[] = psId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.ps_id = { [Op.in]: idArray };
    }

    if (teId) {
      const idArray: number[] = teId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.te_id = { [Op.in]: idArray };
    }

    if (beId) {
      const idArray: number[] = beId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.be_id = { [Op.in]: idArray };
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
      whereCondition["$ps_team.brand$"] = { [Op.overlap]: idArray };
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
      whereCondition["$ps_team.program_id$"] = { [Op.overlap]: idArray };
    }

    if( type === 'Spinner'){
      whereCondition.status = 'Accepted';
      whereCondition.status_spinner = { [Op.in]: ['Accepted', 'Rejected'] };
    }else if(type === 'Brand_Manager'){
      whereCondition.status = 'Accepted';
      whereCondition.status_spinner = 'Accepted';
      whereCondition.status_bm = { [Op.in]: ['Accepted', 'Rejected'] };
    }else if(type === 'PS_Team'){
      whereCondition.status = { [Op.in]: ['Accepted', 'Rejected'] };
      whereCondition.status_spinner = 'Accepted';
      whereCondition.status_bm = 'Accepted';
      whereCondition.status_ps = { [Op.in]: ['Accepted', 'Rejected'] };
    }else if(type === 'Brand_Executive'){
      whereCondition.be_id = { [Op.not]: null }
    }else if(type === 'Traceability_Executive'){
      whereCondition.te_id = { [Op.not]: null }
    }

    whereCondition.processor_type = 'Spinner';

    let include = [
      {
        model: Ginner,
        as: "ginner",
        attributes: ["id", "name"],
      },
      {
        model: Spinner,
        as: "spinner",
        attributes: ["id", "name"],
      },
      {
        model: BrandExecutive,
        as: "brand_executive",
        attributes: ["id", "name"],
      },
      {
        model: BrandManager,
        as: "brand_manager",
        attributes: ["id", "name"],
      },
      {
        model: PSTeam,
        as: "ps_team",
        attributes: ["id", "name"],
      },
      {
        model: TraceabilityExecutive,
        as: "traceability_executive",
        attributes: ["id", "name"],
      },
      {
        model: Country,
        as: "country",
        attributes: ["id", "county_name"],
      },
      {
        model: State,
        as: "state",
        attributes: ["id", "state_name"],
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
    } else {
      const stock = await LintStockVerified.findAll({
        where: whereCondition,
        include: include,
        order: [["id", "desc"]],
      });
      return res.sendSuccess(res, stock);
    }
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error?.message);
  }
};

const getBrandListSpinVerifiedStocks = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const {
    bmId,
    psId,
    ginnerId,
    teId,
    beId,
    programId,
    brandId,
    stateId,
    countryId,
    spinnerId,
    status
  }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};

  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$spinner.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$traceability_executive.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$brand_executive.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$brand_manager.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$ps_team.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { "$country.county_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$state.state_name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }

    if (bmId) {
      const idArray: number[] = bmId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.bm_id = { [Op.in]: idArray };
    }

    if (psId) {
      const idArray: number[] = psId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.ps_id = { [Op.in]: idArray };
    }

    if (teId) {
      const idArray: number[] = teId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.te_id = { [Op.in]: idArray };
    }

    if (beId) {
      const idArray: number[] = beId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.be_id = { [Op.in]: idArray };
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
      whereCondition["$ps_team.brand$"] = { [Op.overlap]: idArray };
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
      whereCondition["$ps_team.program_id$"] = { [Op.overlap]: idArray };
    }

    whereCondition.status_ps = 'Accepted'
    whereCondition.status_bm = 'Accepted'
    whereCondition.status = 'Accepted'
    whereCondition.status_spinner = 'Accepted'

    whereCondition.processor_type = 'Spinner';

    let include = [
      {
        model: Ginner,
        as: "ginner",
        attributes: ["id", "name"],
      },
      {
        model: Spinner,
        as: "spinner",
        attributes: ["id", "name"],
      },
      {
        model: BrandExecutive,
        as: "brand_executive",
        attributes: ["id", "name"],
      },
      {
        model: BrandManager,
        as: "brand_manager",
        attributes: ["id", "name"],
      },
      {
        model: PSTeam,
        as: "ps_team",
        attributes: ["id", "name"],
      },
      {
        model: TraceabilityExecutive,
        as: "traceability_executive",
        attributes: ["id", "name"],
      },
      {
        model: Country,
        as: "country",
        attributes: ["id", "county_name"],
      },
      {
        model: State,
        as: "state",
        attributes: ["id", "state_name"],
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
    } else {
      const stock = await LintStockVerified.findAll({
        where: whereCondition,
        include: include,
        order: [["id", "desc"]],
      });
      return res.sendSuccess(res, stock);
    }
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error?.message);
  }
};



export {
  getGinProcessLotNo,
  getGinProcessLotDetials,
  createVerifiedLintStock,
  getLintVerifiedStocks,
  getLintVerifiedStock,
  getGinnerVerifiedStocks,
  editGinVerifiedStockConfirm,
  updateSCMVerifiedStockConfirm,
  updateSCDVerifiedStockConfirm,
  getSCMVerifiedStocks,
  getSCDVerifiedStocks,
  getListVerifiedStocks,
  getTypeWiseListVerifiedStocks,
  fetchTeGinner,
  fetchTeCountries,
  fetchTeStates,
  getGinSaleLotNo,
  getGinSalesLotDetials,
  fetchBeSpinner,
  fetchBeStates,
  fetchTeSpinner,
  fetchBeCountries,
  //Spinner
  updateSpinVerifiedStockConfirm,
  updateBMVerifiedStockConfirm,
  updatePSVerifiedStockConfirm,
  getLintSpinVerifiedStocks,
  getSpinnerVerifiedStocks,
  getBMVerifiedStocks,
  getPSVerifiedStocks,
  getTypeWiseSpinVerifiedStocks,
  getBrandListSpinVerifiedStocks
};