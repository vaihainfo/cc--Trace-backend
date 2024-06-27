import { Op, Sequelize, where } from "sequelize";
import { Request, Response, raw } from "express";
import GinProcess from "../../models/gin-process.model";
import GinBale from "../../models/gin-bale.model";
import Season from "../../models/season.model";
import Program from "../../models/program.model";
import Ginner from "../../models/ginner.model";
import CottonSelection from "../../models/cotton-selection.model";
import Transaction from "../../models/transaction.model";
import Village from "../../models/village.model";
import sequelize from "../../util/dbConn";
import * as ExcelJS from "exceljs";
import * as fs from "fs";
import * as path from "path";
import GinSales from "../../models/gin-sales.model";
import Spinner from "../../models/spinner.model";
import YarnCount from "../../models/yarn-count.model";
import SpinProcess from "../../models/spin-process.model";
import CottonMix from "../../models/cotton-mix.model";
import SpinSales from "../../models/spin-sales.model";
import Weaver from "../../models/weaver.model";
import Knitter from "../../models/knitter.model";
import FabricType from "../../models/fabric-type.model";
import Garment from "../../models/garment.model";
import KnitSales from "../../models/knit-sales.model";
import WeaverSales from "../../models/weaver-sales.model";
import GarmentSales from "../../models/garment-sales.model";
import Brand from "../../models/brand.model";
import Department from "../../models/department.model";
import BaleSelection from "../../models/bale-selection.model";
import Farm from "../../models/farm.model";
import FabricSelection from "../../models/fabric-selections.model";
import YarnSelection from "../../models/yarn-seletions.model";
import KnitYarnSelection from "../../models/knit-yarn-seletions.model";
import LintSelections from "../../models/lint-seletions.model";
import SpinProcessYarnSelection from "../../models/spin-process-yarn-seletions.model";
import GinnerExpectedCotton from "../../models/ginner-expected-cotton.model";
import GinnerOrder from "../../models/ginner-order.model";
import State from "../../models/state.model";
import QualityParameter from "../../models/quality-parameter.model";
import KnitProcess from "../../models/knit-process.model";
import WeaverProcess from "../../models/weaver-process.model";
import Fabric from "../../models/fabric.model";
import KnitFabricSelection from "../../models/knit-fabric-selectiion.model";
import WeaverFabricSelection from "../../models/weaver-fabric-selection.model";
import GarmentProcess from "../../models/garment-process..model";
import GarmentSelection from "../../models/garment-selection.model";
import Farmer from "../../models/farmer.model";
import FarmGroup from "../../models/farm-group.model";
import moment from "moment";
import KnitFabric from "../../models/knit_fabric.model";
import WeaverFabric from "../../models/weaver_fabric.model";
import ExportData from "../../models/export-data-check.model";
import CompactingSales from "../../models/compacting-sales.model";
import CompactingFabricSelections from "../../models/compacting-fabric-selection.model";
import PrintingSales from "../../models/printing-sales.model";
import PrintingFabricSelection from "../../models/printing-fabric-selection.model";
import WashingSales from "../../models/washing-sales.model";
import WashingFabricSelection from "../../models/washing-fabric-selection.model";
import DyingSales from "../../models/dying-sales.model";
import DyingFabricSelection from "../../models/dying-fabric-selection.model";
import Country from "../../models/country.model";

const fetchBaleProcess = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { ginnerId, seasonId, programId, brandId, countryId, startDate, endDate}: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = [];
  try {
    if (searchTerm) {
      whereCondition.push(`
        (
          g.name ILIKE '%${searchTerm}%' OR
          s.name ILIKE '%${searchTerm}%' OR
          pr.program_name ILIKE '%${searchTerm}%' OR
          gp.lot_no ILIKE '%${searchTerm}%' OR
          gp.reel_lot_no ILIKE '%${searchTerm}%' OR
          gp.press_no ILIKE '%${searchTerm}%'
        )
      `);
    }
    
    if (brandId) {
      const idArray = brandId.split(",").map((id: any) => parseInt(id, 10));
      whereCondition.push(`g.brand && ARRAY[${idArray.join(',')}]`);
    }
    
    if (seasonId) {
      const idArray = seasonId.split(",").map((id: any) => parseInt(id, 10));
      whereCondition.push(`gp.season_id IN (${idArray.join(',')})`);
    }
    
    if (ginnerId) {
      const idArray = ginnerId.split(",").map((id: any) => parseInt(id, 10));
      whereCondition.push(`gp.ginner_id IN (${idArray.join(',')})`);
    }
    
    if (countryId) {
      const idArray = countryId.split(",").map((id: any) => parseInt(id, 10));
      whereCondition.push(`g.country_id IN (${idArray.join(',')})`);
    }
    
    if (programId) {
      const idArray = programId.split(",").map((id: any) => parseInt(id, 10));
      whereCondition.push(`gp.program_id IN (${idArray.join(',')})`);
    }
    
    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereCondition.push(`"gp"."createdAt" BETWEEN '${startOfDay.toISOString()}' AND '${endOfDay.toISOString()}'`);
    }
    
    const whereClause = whereCondition.length > 0 ? `WHERE ${whereCondition.join(' AND ')}` : '';

    const countQuery = `
        SELECT
          COUNT(gp.id) AS total_count
        FROM
          gin_processes gp
        LEFT JOIN
          ginners g ON gp.ginner_id = g.id
        LEFT JOIN
          seasons s ON gp.season_id = s.id
        LEFT JOIN
          programs pr ON gp.program_id = pr.id
        ${whereClause}
    `;


  // Execute the count query
  const countResult = await sequelize.query(countQuery);
  const count = countResult ? Number(countResult[0][0]?.total_count) : 0;

    const rows = await sequelize.query(
      `WITH gin_process_data AS (
        SELECT
            gp.id AS process_id,
            gp.date,
            gp."createdAt" AS created_date,
            s.name AS season_name,
            g.name AS ginner_name,
            gp.heap_number,
            gp.heap_register,
            gp.weigh_bridge,
            gp.delivery_challan,
            gp.qr,
            gp.lot_no,
            gp.press_no,
            gp.reel_lot_no,
            gp.no_of_bales,
            gp.total_qty AS seed_consumed,
            gp.gin_out_turn AS got,
            gp.bale_process,
            pr.program_name AS program
        FROM
            gin_processes gp
        LEFT JOIN
            ginners g ON gp.ginner_id = g.id
        LEFT JOIN
            seasons s ON gp.season_id = s.id
        LEFT JOIN
            programs pr ON gp.program_id = pr.id
        ${whereClause}
          ),
        gin_bale_data AS (
              SELECT
                  gb.process_id,
                  COALESCE(SUM(CAST(gb.weight AS DOUBLE PRECISION)), 0) AS lint_quantity,
                  COALESCE(MIN(CASE WHEN gb.bale_no ~ '^[0-9]+$' THEN CAST(gb.bale_no AS BIGINT) ELSE 0 END), 0) AS pressno_from,
                  COALESCE(MAX(CASE WHEN gb.bale_no ~ '^[0-9]+$' THEN CAST(gb.bale_no AS BIGINT) ELSE 0 END), 0) AS pressno_to
              FROM
                  "gin-bales" gb
              GROUP BY
                  gb.process_id
          ),
          cotton_selection_data AS (
              SELECT
                  cs.process_id,
                  STRING_AGG(DISTINCT v.village_name, ', ') AS villages
              FROM
                  cotton_selections cs
              LEFT JOIN
                  transactions t ON cs.transaction_id = t.id
              LEFT JOIN
                  villages v ON t.village_id = v.id
              GROUP BY
                  cs.process_id
          ),
          sold_data AS (
              SELECT
                  gb.process_id,
                  COUNT(gb.id) AS sold_bales,
                  COALESCE(SUM(CAST(gb.weight AS DOUBLE PRECISION)), 0) AS lint_quantity_sold
              FROM
                  "gin-bales" gb
              WHERE
                  gb.sold_status = true
              GROUP BY
                  gb.process_id
          )
          SELECT
              gd.date AS date,
              gd.created_date AS "createdAt",
              gd.season_name AS season,
              gd.ginner_name AS ginner_name,
              gd.heap_number AS heap_number,
              gd.heap_register AS heap_register,
              gd.bale_process AS bale_process,
              gd.lot_no AS lot_no,
              gd.press_no AS press_no,
              CONCAT(gb.pressno_from, '-', gb.pressno_to) AS gin_press_no,
              gd.reel_lot_no AS reel_lot_no,
              CONCAT('001-', LPAD(gd.no_of_bales::TEXT, 3, '0')) AS reel_press_no,
              gd.no_of_bales AS no_of_bales,
              gb.lint_quantity AS lint_quantity,
              gd.seed_consumed AS total_qty,
              gd.got AS gin_out_turn,
              COALESCE(sd.lint_quantity_sold, 0) AS lint_quantity_sold,
              COALESCE(sd.sold_bales, 0) AS sold_bales,
              (COALESCE(gb.lint_quantity, 0) - COALESCE(sd.lint_quantity_sold, 0)) AS lint_stock,
              (COALESCE(gd.no_of_bales, 0) - COALESCE(sd.sold_bales, 0)) AS bale_stock,
              gd.program AS program,
              cs.villages AS village_names,
              gd.weigh_bridge,
              gd.delivery_challan,
              gd.qr
          FROM
              gin_process_data gd
          LEFT JOIN
              gin_bale_data gb ON gd.process_id = gb.process_id
          LEFT JOIN
              cotton_selection_data cs ON gd.process_id = cs.process_id
          LEFT JOIN
              sold_data sd ON gd.process_id = sd.process_id
          ORDER BY gd.process_id DESC
          LIMIT :limit OFFSET :offset
          `, {
          replacements: { limit: limit, offset },
          type: sequelize.QueryTypes.SELECT,
        });
    return res.sendPaginationSuccess(res, rows, count);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

const exportLoad = async (req: Request, res: Response) => {
  const data = await ExportData.findAll(
    // {
    // order: [['createdAt', 'DESC']] // Assuming createdAt is the timestamp of insertion
    //   }
  )
  let loadData = data[0]

  //   loadData.dataValues.failes_procurement_load||

  if ((loadData.dataValues.ginner_lint_bale_process_load && req?.body?.file_name === "gin-bale-process.xlsx") || (loadData.dataValues.ginner_summary_load && req?.body?.file_name === "ginner-summary.xlsx") || (loadData.dataValues.ginner_lint_bale_sale_load && req?.body?.file_name === "Ginner-sales-report.xlsx") || (loadData.dataValues.ginner_pending_sales_load && req?.body?.file_name === "Ginner-pending-sales-report.xlsx") || (loadData.dataValues.ginner_seed_cotton_load && req?.body?.file_name === "ginner-seed-cotton-stock-report.xlsx") || (loadData.dataValues.spinner_summary_load && req?.body?.file_name === "spinner-summary.xlsx") || (loadData.dataValues.spinner_bale_receipt_load && req?.body?.file_name === "Spinner-bale-receipt-report.xlsx") || (loadData.dataValues.spinner_yarn_process_load && req?.body?.file_name === "spinner-yarn-process.xlsx") || (loadData.dataValues.spinner_yarn_sales_load && req?.body?.file_name === "spinner-yarn-sale.xlsx") || (loadData.dataValues.spinner_yarn_bales_load && req?.body?.file_name === "Spinner-Pending-Bales-Receipt-Report.xlsx") || (loadData.dataValues.spinner_lint_cotton_stock_load && req?.body?.file_name === "spinner-lint-cotton-stock-report.xlsx") || (loadData.dataValues.knitter_yarn_receipt_load && req?.body?.file_name === "knitter-yarn-receipt.xlsx") || (loadData.dataValues.knitter_yarn_process_load && req?.body?.file_name === "knitter-yarn-process.xlsx") || (loadData.dataValues.knitter_fabric_sales_load && req?.body?.file_name === "knitter-fabric-sale-report.xlsx") || (loadData.dataValues.weaver_yarn_receipt_load && req?.body.file_name === "weaver-yarn.xlsx") || (loadData.dataValues.weaver_yarn_process_load && req?.body?.file_name === "weaver-yarn-process.xls") || (loadData.dataValues.weaver_yarn_sales_load && req?.body?.file_name === "weaver-fabric-sale-report.xlsx") || (loadData.dataValues.garment_fabric_receipt_load && req?.body?.file_name === "garment-fabric-receipt-report.xlsx") || (loadData.dataValues.garment_fabric_process_load && req?.body?.file_name === "garment-fabric-process-report.xlsx") || (loadData.dataValues.garment_fabric_sales_load && req?.body?.file_name === "garment-fabric-sale-report.xlsx") || (loadData.dataValues.qr_code_tracker_load && req?.body?.file_name === "barcode-report.xlsx") || (loadData.dataValues.consolidated_tracebality_load && req?.body?.file_name === "consolidated-traceabilty-report.xlsx") || (loadData.dataValues.spinner_backward_tracebality_load && req.body?.file_name === "spinner-backward-traceabilty-report.xlsx") || (loadData.dataValues.village_seed_cotton_load && req?.body?.file_name === "village-seed-cotton-report.xlsx") || loadData.dataValues.premium_validation_load || (loadData.dataValues.procurement_load && req?.body?.file_name === "procurement-report.xlsx") || (loadData.dataValues.procurement_tracker_load && req?.body?.file_name === "pscp-cotton-procurement.xlsx") || (loadData.dataValues.procurement_sell_live_tracker_load && req?.body?.file_name === "pscp-cotton-procurement.xlsx") || (loadData.dataValues.qr_app_procurement_load && req?.body?.file_name === "agent-transactions.xlsx") || (loadData.dataValues.failed_farmer_load && req?.body?.file_name === "failed-records.xlsx")) {
    res.status(200).send({
      success: true,
      messgage: "File under processing",
      data: null
    });
  } else {
    res.status(200).send({
      success: true,
      messgage: "File successfully Generated",
      data: process.env.BASE_URL + req?.body?.file_name,
    });
  }
}

const exportGinnerProcess = async (req: Request, res: Response) => {
  const excelFilePath = path.join("./upload", "excel-gin-bale-process.xlsx");
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { exportType, ginnerId, seasonId, programId, brandId, countryId, startDate, endDate }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = [];
  try {
    if (exportType === "all") {
      return res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "gin-bale-process.xlsx",
      });

    } else {
      if (searchTerm) {
        whereCondition.push(`
          (
            g.name ILIKE '%${searchTerm}%' OR
            s.name ILIKE '%${searchTerm}%' OR
            pr.program_name ILIKE '%${searchTerm}%' OR
            gp.lot_no ILIKE '%${searchTerm}%' OR
            gp.reel_lot_no ILIKE '%${searchTerm}%' OR
            gb.press_no ILIKE '%${searchTerm}%'
          )
        `);
      }
      
      if (brandId) {
        const idArray = brandId.split(",").map((id: any) => parseInt(id, 10));
        whereCondition.push(`g.brand && ARRAY[${idArray.join(',')}]`);
      }
      
      if (seasonId) {
        const idArray = seasonId.split(",").map((id: any) => parseInt(id, 10));
        whereCondition.push(`gp.season_id IN (${idArray.join(',')})`);
      }
      
      if (ginnerId) {
        const idArray = ginnerId.split(",").map((id: any) => parseInt(id, 10));
        whereCondition.push(`gp.ginner_id IN (${idArray.join(',')})`);
      }
      
      if (countryId) {
        const idArray = countryId.split(",").map((id: any) => parseInt(id, 10));
        whereCondition.push(`g.country_id IN (${idArray.join(',')})`);
      }
      
      if (programId) {
        const idArray = programId.split(",").map((id: any) => parseInt(id, 10));
        whereCondition.push(`gp.program_id IN (${idArray.join(',')})`);
      }
      
      if (startDate && endDate) {
        const startOfDay = new Date(startDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(endDate);
        endOfDay.setUTCHours(23, 59, 59, 999);
        whereCondition.push(`"gp"."createdAt" BETWEEN '${startOfDay.toISOString()}' AND '${endOfDay.toISOString()}'`);
      }
      
      const whereClause = whereCondition.length > 0 ? `WHERE ${whereCondition.join(' AND ')}` : '';

      // Create the excel workbook file
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet1");
      worksheet.mergeCells('A1:T1');
      const mergedCell = worksheet.getCell('A1');
      mergedCell.value = 'CottonConnect | Ginner Bale Process Report';
      mergedCell.font = { bold: true };
      mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
      // Set bold font for header row
      const headerRow = worksheet.addRow([
        "Sr No.", "Process Date", "Data Entry Date", "Season", "Ginner Name", "Heap Number", "Gin Lot No", "Gin Press No", "REEL Lot No", "REEL Process Nos", "No of Bales", "Lint Quantity(Kgs)", "Total Seed Cotton Consumed(Kgs)", "GOT", "Total lint cotton sold(Kgs)", "Total Bales Sold", "Total lint cotton in stock(Kgs)", "Total Bales in stock", "Program", "Village"
      ]);
      headerRow.font = { bold: true };

      const rows = await sequelize.query(
        `WITH gin_process_data AS (
          SELECT
              gp.id AS process_id,
              gp.date,
              gp."createdAt" AS created_date,
              s.name AS season_name,
              g.name AS ginner_name,
              gp.heap_number,
              gp.heap_register,
              gp.weigh_bridge,
              gp.delivery_challan,
              gp.qr,
              gp.lot_no,
              gp.press_no,
              gp.reel_lot_no,
              gp.no_of_bales,
              gp.total_qty AS seed_consumed,
              gp.gin_out_turn AS got,
              gp.bale_process,
              pr.program_name AS program
          FROM
              gin_processes gp
          LEFT JOIN
              ginners g ON gp.ginner_id = g.id
          LEFT JOIN
              seasons s ON gp.season_id = s.id
          LEFT JOIN
              programs pr ON gp.program_id = pr.id
          ${whereClause}
            ),
          gin_bale_data AS (
                SELECT
                    gb.process_id,
                    COALESCE(SUM(CAST(gb.weight AS DOUBLE PRECISION)), 0) AS lint_quantity,
                    COALESCE(MIN(CASE WHEN gb.bale_no ~ '^[0-9]+$' THEN CAST(gb.bale_no AS BIGINT) ELSE 0 END), 0) AS pressno_from,
                    COALESCE(MAX(CASE WHEN gb.bale_no ~ '^[0-9]+$' THEN CAST(gb.bale_no AS BIGINT) ELSE 0 END), 0) AS pressno_to
                FROM
                    "gin-bales" gb
                GROUP BY
                    gb.process_id
            ),
            cotton_selection_data AS (
                SELECT
                    cs.process_id,
                    STRING_AGG(DISTINCT v.village_name, ', ') AS villages
                FROM
                    cotton_selections cs
                LEFT JOIN
                    transactions t ON cs.transaction_id = t.id
                LEFT JOIN
                    villages v ON t.village_id = v.id
                GROUP BY
                    cs.process_id
            ),
            sold_data AS (
                SELECT
                    gb.process_id,
                    COUNT(gb.id) AS sold_bales,
                    COALESCE(SUM(CAST(gb.weight AS DOUBLE PRECISION)), 0) AS lint_quantity_sold
                FROM
                    "gin-bales" gb
                WHERE
                    gb.sold_status = true
                GROUP BY
                    gb.process_id
            )
            SELECT
                gd.date AS date,
                gd.created_date AS "createdAt",
                gd.season_name AS season,
                gd.ginner_name AS ginner_name,
                gd.heap_number AS heap_number,
                gd.heap_register AS heap_register,
                gd.bale_process AS bale_process,
                gd.lot_no AS lot_no,
                gd.press_no AS press_no,
                CONCAT(gb.pressno_from, '-', gb.pressno_to) AS gin_press_no,
                gd.reel_lot_no AS reel_lot_no,
                CONCAT('001-', LPAD(gd.no_of_bales::TEXT, 3, '0')) AS reel_press_no,
                gd.no_of_bales AS no_of_bales,
                gb.lint_quantity AS lint_quantity,
                gd.seed_consumed AS total_qty,
                gd.got AS gin_out_turn,
                COALESCE(sd.lint_quantity_sold, 0) AS lint_quantity_sold,
                COALESCE(sd.sold_bales, 0) AS sold_bales,
                (COALESCE(gb.lint_quantity, 0) - COALESCE(sd.lint_quantity_sold, 0)) AS lint_stock,
                (COALESCE(gd.no_of_bales, 0) - COALESCE(sd.sold_bales, 0)) AS bale_stock,
                gd.program AS program,
                cs.villages AS village_names,
                gd.weigh_bridge,
                gd.delivery_challan,
                gd.qr
            FROM
                gin_process_data gd
            LEFT JOIN
                gin_bale_data gb ON gd.process_id = gb.process_id
            LEFT JOIN
                cotton_selection_data cs ON gd.process_id = cs.process_id
            LEFT JOIN
                sold_data sd ON gd.process_id = sd.process_id
            ORDER BY gd.process_id DESC
            LIMIT :limit OFFSET :offset
            `, {
            replacements: { limit: limit, offset },
            type: sequelize.QueryTypes.SELECT,
          });
      // Append data to worksheet
      for await (const [index, item] of rows.entries()) {
  
        const rowValues = Object.values({
          index: index + 1,
          date: item.date ? item.date : "",
          created_date: item.createdAt ? item.createdAt : "",
          season: item.season ? item.season : "",
          ginner: item.ginner_name ? item.ginner_name : "",
          heap: item.heap_number ?  item.heap_number : '',
          lot_no: item.lot_no ? item.lot_no : "",
          press_no: item.press_no ? item.press_no : "",
          reel_lot_no: item.reel_lot_no ? item.reel_lot_no : "",
          reel_press_no: item.reel_press_no ? item.reel_press_no : "",
          noOfBales: item.no_of_bales ? Number(item.no_of_bales) : 0,
          lint_quantity: item.lint_quantity ? Number(item.lint_quantity) : 0,
          seedConsmed: item.total_qty ? Number(item.total_qty) : 0,
          got: item.gin_out_turn ? item.gin_out_turn : "",
          lint_quantity_sold: item.lint_quantity_sold ? Number(item.lint_quantity_sold) : 0,
          sold_bales: item.sold_bales ? Number(item.sold_bales) : 0,
          lint_stock: item.lint_stock && Number(item.lint_stock) > 0 ? Number(item.lint_stock) : 0,
          bale_stock: item.bale_stock && Number(item.bale_stock) > 0 ? Number(item.bale_stock) : 0,
          program: item.program ? item.program : "",
          village_names: item.village_names ? item.village_names : "",
        });
        
        worksheet.addRow(rowValues);
      }
      // Auto-adjust column widths based on content
      worksheet.columns.forEach((column: any) => {
        let maxCellLength = 0;
        column.eachCell({ includeEmpty: true }, (cell: any) => {
          const cellLength = (cell.value ? cell.value.toString() : "").length;
          maxCellLength = Math.max(maxCellLength, cellLength);
        });
        column.width = Math.min(15, maxCellLength + 2); // Limit width to 30 characters
      });
  
      // Save the workbook
      await workbook.xlsx.writeFile(excelFilePath);
      res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "excel-gin-bale-process.xlsx",
      });
    }
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);

  }
};


const fetchPendingGinnerSales = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const status = req.query.status || "To be Submitted";
  const { ginnerId, seasonId, programId, brandId, countryId, startDate, endDate }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$sales.ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.buyerdata.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.reel_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$bale.ginprocess.reel_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.press_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.invoice_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.vehicle_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.transporter_name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }

    if (ginnerId) {
      const idArray: number[] = ginnerId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.ginner_id$"] = { [Op.in]: idArray };
    }
    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.ginner.brand$"] = { [Op.overlap]: idArray };
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.ginner.country_id$"] = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.season_id$"] = { [Op.in]: idArray };
    }

    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereCondition.createdAt = { [Op.between]: [startOfDay, endOfDay] }
  }

    // if (status === "To be Submitted") {
    //   whereCondition.status = "To be Submitted";
    // } else {
    //   whereCondition.status = { [Op.ne]: "To be Submitted" };
    // }

    whereCondition["$sales.status$"] = "To be Submitted";

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.program_id$"] = { [Op.in]: idArray };
    }
    let include = [
      {
        model: Ginner,
        as: "ginner",
        attributes: ["id", "name", "country_id", "brand"],
      },
      {
        model: Season,
        as: "season",
        attributes: ["id", "name"],
      },
      {
        model: Program,
        as: "program",
        attributes: ["id", "program_name"],
      },
      {
        model: Spinner,
        as: "buyerdata",
        attributes: ["id", "name"],
      },
    ];
    //fetch data with pagination

    const { count, rows }: any = await BaleSelection.findAndCountAll({
      attributes: [
        [Sequelize.literal('"sales"."id"'), "sales_id"],
        [Sequelize.literal('"sales"."date"'), "date"],
        [Sequelize.literal('"sales"."createdAt"'), "createdAt"],
        [Sequelize.col('"sales"."season"."name"'), "season_name"],
        [Sequelize.col('"sales"."ginner"."id"'), "ginner_id"],
        [Sequelize.col('"sales"."ginner"."name"'), "ginner"],
        [Sequelize.col('"sales"."program"."program_name"'), "program"],
        [Sequelize.col('"sales"."buyerdata"."name"'), "buyerdata"],
        [Sequelize.literal('"sales"."total_qty"'), "total_qty"],
        [Sequelize.literal('"sales"."invoice_no"'), "invoice_no"],
        [Sequelize.col('"sales"."lot_no"'), "lot_no"],
        [Sequelize.fn('STRING_AGG', Sequelize.literal('DISTINCT "bale->ginprocess"."reel_lot_no"'), ', ' ) , "reel_lot_no"],
        [Sequelize.literal('"sales"."rate"'), "rate"],
        [Sequelize.literal('"sales"."candy_rate"'), "candy_rate"],
        [Sequelize.literal('"sales"."no_of_bales"'), "no_of_bales"],
        [Sequelize.literal('"sales"."press_no"'), "press_no"],
        [Sequelize.literal('"sales"."qty_stock"'), "qty_stock"],
        [Sequelize.literal('"sales"."weight_loss"'), "weight_loss"],
        [Sequelize.literal('"sales"."invoice_file"'), "invoice_file"],
        [Sequelize.literal('"sales"."status"'), "status"],
        [Sequelize.literal('"sales"."qr"'), "qr"],
      ],
      where: whereCondition,
      include: [
        {
          model: GinSales,
          as: "sales",
          include: include,
          attributes: [],
        },
        {
          model: GinBale,
          attributes: [],
          as: "bale",
          include: [
            {
              model: GinProcess,
              as: "ginprocess",
              attributes: [],
            },
          ],
        },
      ],
      group: [
        "sales.id",
        "sales.season.id",
        "sales.ginner.id",
        "sales.buyerdata.id",
        "sales.program.id",
      ],
      order: [["sales_id", "desc"]],
      offset: offset,
      limit: limit,
    });

    return res.sendPaginationSuccess(res, rows, count.length);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};


const exportPendingGinnerSales = async (req: Request, res: Response) => {

  const excelFilePath = path.join(
    "./upload",
    "excel-ginner-pending-sales-report.xlsx"
  );
  const searchTerm = req.query.search || "";
  const status = req.query.status || "To be Submitted";
  const { exportType, ginnerId, seasonId, programId, brandId, countryId, startDate, endDate }: any = req.query;
  const whereCondition: any = {};
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  try {
    if (exportType === "all") {

      return res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "ginner-pending-sales-report.xlsx",
      });

    } else {
      if (searchTerm) {
        whereCondition[Op.or] = [
          { "$ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$buyerdata.name$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
          { lot_no: { [Op.iLike]: `%${searchTerm}%` } },
          { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
          { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
          { press_no: { [Op.iLike]: `%${searchTerm}%` } },
        ];
      }
      if (ginnerId) {
        const idArray: number[] = ginnerId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$sales.ginner_id$"] = { [Op.in]: idArray };
      }
      if (brandId) {
        const idArray: number[] = brandId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$sales.ginner.brand$"] = { [Op.overlap]: idArray };
      }
  
      if (countryId) {
        const idArray: number[] = countryId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$sales.ginner.country_id$"] = { [Op.in]: idArray };
      }
  
      if (seasonId) {
        const idArray: number[] = seasonId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$sales.season_id$"] = { [Op.in]: idArray };
      }
  
      if (startDate && endDate) {
        const startOfDay = new Date(startDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(endDate);
        endOfDay.setUTCHours(23, 59, 59, 999);
        whereCondition.createdAt = { [Op.between]: [startOfDay, endOfDay] }
    }
  
      whereCondition["$sales.status$"] = "To be Submitted";
  
      if (programId) {
        const idArray: number[] = programId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$sales.program_id$"] = { [Op.in]: idArray };
      }
      // Create the excel workbook file
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet1");
      worksheet.mergeCells("A1:N1");
      const mergedCell = worksheet.getCell("A1");
      mergedCell.value = "CottonConnect | Ginner Pending Sales Report";
      mergedCell.font = { bold: true };
      mergedCell.alignment = { horizontal: "center", vertical: "middle" };
      // Set bold font for header row
      const headerRow = worksheet.addRow([
        "Sr No.",
        "Date",
        "Season",
        "Ginner Name",
        "Invoice No",
        "Sold To",
        "Bale Lot No",
        "REEL Lot No",
        "No of Bales",
        "Press/Bale No",
        "Rate/Kg",
        "Total Quantity",
        "Program",
        "status",
      ]);
      headerRow.font = { bold: true };

      let include = [
        {
          model: Ginner,
          as: "ginner",
          attributes: ["id", "name", "country_id", "brand"],
        },
        {
          model: Season,
          as: "season",
          attributes: ["id", "name"],
        },
        {
          model: Program,
          as: "program",
          attributes: ["id", "program_name"],
        },
        {
          model: Spinner,
          as: "buyerdata",
          attributes: ["id", "name"],
        },
      ];

      const { count, rows }: any = await BaleSelection.findAndCountAll({
        attributes: [
          [Sequelize.literal('"sales"."id"'), "sales_id"],
          [Sequelize.literal('"sales"."date"'), "date"],
          [Sequelize.literal('"sales"."createdAt"'), "createdAt"],
          [Sequelize.col('"sales"."season"."name"'), "season_name"],
          [Sequelize.col('"sales"."ginner"."id"'), "ginner_id"],
          [Sequelize.col('"sales"."ginner"."name"'), "ginner"],
          [Sequelize.col('"sales"."program"."program_name"'), "program"],
          [Sequelize.col('"sales"."buyerdata"."name"'), "buyerdata"],
          [Sequelize.literal('"sales"."total_qty"'), "total_qty"],
          [Sequelize.literal('"sales"."invoice_no"'), "invoice_no"],
          [Sequelize.col('"sales"."lot_no"'), "lot_no"],
          [Sequelize.fn('STRING_AGG', Sequelize.literal('DISTINCT "bale->ginprocess"."reel_lot_no"'), ', ' ) , "reel_lot_no"],
          [Sequelize.literal('"sales"."rate"'), "rate"],
          [Sequelize.literal('"sales"."candy_rate"'), "candy_rate"],
          [Sequelize.literal('"sales"."no_of_bales"'), "no_of_bales"],
          [Sequelize.literal('"sales"."press_no"'), "press_no"],
          [Sequelize.literal('"sales"."qty_stock"'), "qty_stock"],
          [Sequelize.literal('"sales"."weight_loss"'), "weight_loss"],
          [Sequelize.literal('"sales"."invoice_file"'), "invoice_file"],
          [Sequelize.literal('"sales"."status"'), "status"],
          [Sequelize.literal('"sales"."qr"'), "qr"],
        ],
        where: whereCondition,
        include: [
          {
            model: GinSales,
            as: "sales",
            include: include,
            attributes: [],
          },
          {
            model: GinBale,
            attributes: [],
            as: "bale",
            include: [
              {
                model: GinProcess,
                as: "ginprocess",
                attributes: [],
              },
            ],
          },
        ],
        group: [
          "sales.id",
          "sales.season.id",
          "sales.ginner.id",
          "sales.buyerdata.id",
          "sales.program.id",
        ],
        order: [["sales_id", "desc"]],
        offset: offset,
        limit: limit,
      });

      // Append data to worksheet
      for await (const [index, item] of rows.entries()) {
        const rowValues = Object.values({
          index: index + 1,
          date: item.dataValues.date ? item.dataValues.date : "",
          season: item.dataValues.season_name ? item.dataValues.season_name : "",
          ginner: item.dataValues.ginner ? item.dataValues.ginner : "",
          invoice: item.dataValues.invoice_no ? item.dataValues.invoice_no : "",
          buyer: item.dataValues.buyerdata ? item.dataValues.buyerdata : "",
          lot_no: item.dataValues.lot_no ? item.dataValues.lot_no : "",
          reel_lot_no: item.dataValues.reel_lot_no ? item.dataValues.reel_lot_no : "",
          no_of_bales: item.dataValues.no_of_bales ? item.dataValues.no_of_bales : "",
          press_no: item.dataValues.press_no ? item.dataValues.press_no : "",
          rate: item.dataValues.rate ? Number(item.dataValues.rate) : 0,
          total_qty: item.dataValues.total_qty ? item.dataValues.total_qty : 0,
          program: item.dataValues.program ? item.dataValues.program : "",
          status: item.dataValues.status ? item.dataValues.status : "",
        });
        worksheet.addRow(rowValues);
      }
      // Auto-adjust column widths based on content
      worksheet.columns.forEach((column: any) => {
        let maxCellLength = 0;
        column.eachCell({ includeEmpty: true }, (cell: any) => {
          const cellLength = (cell.value ? cell.value.toString() : "").length;
          maxCellLength = Math.max(maxCellLength, cellLength);
        });
        column.width = Math.min(24, maxCellLength + 2); // Limit width to 30 characters
      });

      // Save the workbook
      await workbook.xlsx.writeFile(excelFilePath);
      res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "excel-ginner-pending-sales-report.xlsx",
      });
    }
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);

  }
};


const fetchSpinnerGreyOutReport = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const { ginnerId, spinnerId, seasonId, programId, brandId, countryId }: any =
    req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$buyerdata.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
        { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { press_no: { [Op.iLike]: `%${searchTerm}%` } },
        { vehicle_no: { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    if (spinnerId) {
      const idArray: number[] = spinnerId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.buyer = { [Op.in]: idArray };
    } else {
      whereCondition.buyer = {
        [Op.ne]: null,
      };
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
      whereCondition["$buyerdata.brand$"] = { [Op.overlap]: idArray };
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$buyerdata.country_id$"] = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.season_id = { [Op.in]: idArray };
    }

    // whereCondition.total_qty = {
    //   [Op.gt]: 0,
    // };
    whereCondition.greyout_status = true;

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.program_id = { [Op.in]: idArray };
    }

    let include = [
      {
        model: Ginner,
        as: "ginner",
        attributes: ["id", "name"],
      },
      {
        model: Season,
        as: "season",
        attributes: ["id", "name"],
      },
      {
        model: Program,
        as: "program",
        attributes: ["id", "program_name"],
      },
      {
        model: Spinner,
        as: "buyerdata",
        attributes: ["id", "name"],
      },
    ];
    //fetch data with pagination

    const { count, rows } = await GinSales.findAndCountAll({
      where: whereCondition,
      include: include,
      // attributes: ['id', 'lot_no', 'invoice_no', 'reel_lot_no', 'qty_stock'],
      offset: offset,
      limit: limit,
    });
    return res.sendPaginationSuccess(res, rows, count);
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message);
  }
};

const fetchGinSalesPagination = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { ginnerId, seasonId, programId, brandId, countryId, startDate, endDate }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$sales.ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.buyerdata.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.reel_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$bale.ginprocess.reel_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.press_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.invoice_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.vehicle_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.transporter_name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    if (ginnerId) {
      const idArray: number[] = ginnerId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.ginner_id$"] = { [Op.in]: idArray };
    }
    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.ginner.brand$"] = { [Op.overlap]: idArray };
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.ginner.country_id$"] = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.season_id$"] = { [Op.in]: idArray };
    }

    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereCondition.createdAt = { [Op.between]: [startOfDay, endOfDay] }
  }

    whereCondition["$sales.status$"] = { [Op.ne]: "To be Submitted" };

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.program_id$"] = { [Op.in]: idArray };
    }

    let include = [
      {
        model: Ginner,
        as: "ginner",
        attributes: [],
      },
      {
        model: Season,
        as: "season",
        attributes: [],
      },
      {
        model: Program,
        as: "program",
        attributes: [],
      },
      {
        model: Spinner,
        as: "buyerdata",
        attributes: [],
      },
    ];
    //fetch data with pagination
    const nData: any = [];

    const { count, rows }: any = await BaleSelection.findAndCountAll({
      attributes: [
        [Sequelize.literal('"sales"."id"'), "sales_id"],
        [Sequelize.literal('"sales"."date"'), "date"],
        [Sequelize.literal('"sales"."createdAt"'), "createdAt"],
        [Sequelize.col('"sales"."season"."name"'), "season_name"],
        [Sequelize.col('"sales"."ginner"."id"'), "ginner_id"],
        [Sequelize.col('"sales"."ginner"."name"'), "ginner"],
        [Sequelize.col('"sales"."program"."program_name"'), "program"],
        [Sequelize.col('"sales"."buyerdata"."name"'), "buyerdata"],
        [Sequelize.literal('"sales"."total_qty"'), "total_qty"],
        [Sequelize.literal('"sales"."invoice_no"'), "invoice_no"],
        [Sequelize.col('"sales"."lot_no"'), "lot_no"],
        [Sequelize.fn('STRING_AGG', Sequelize.literal('DISTINCT "bale->ginprocess"."reel_lot_no"'), ', ' ) , "reel_lot_no"],
        [Sequelize.fn('ARRAY_AGG', Sequelize.literal('DISTINCT "bale->ginprocess"."id"')), "process_ids"],
        [Sequelize.literal('"sales"."rate"'), "rate"],
        [Sequelize.literal('"sales"."candy_rate"'), "candy_rate"],
        [Sequelize.literal('"sales"."total_qty"'), "lint_quantity"],
        [Sequelize.literal('"sales"."no_of_bales"'), "no_of_bales"],
        [Sequelize.literal('"sales"."sale_value"'), "sale_value"],
        [Sequelize.literal('"sales"."press_no"'), "press_no"],
        [Sequelize.literal('"sales"."qty_stock"'), "qty_stock"],
        [Sequelize.literal('"sales"."weight_loss"'), "weight_loss"],
        [Sequelize.literal('"sales"."invoice_file"'), "invoice_file"],
        [Sequelize.literal('"sales"."vehicle_no"'), "vehicle_no"],
        [Sequelize.literal('"sales"."transporter_name"'), "transporter_name"],
        [Sequelize.literal('"sales"."transaction_agent"'), "transaction_agent"],
        [Sequelize.literal('"sales"."status"'), "status"],
        [Sequelize.literal('"sales"."qr"'), "qr"],
      ],
      where: whereCondition,
      include: [
        {
          model: GinSales,
          as: "sales",
          include: include,
          attributes: [],
        },
        {
          model: GinBale,
          attributes: [],
          as: "bale",
          include: [
            {
              model: GinProcess,
              as: "ginprocess",
              attributes: [],
            },
          ],
        },
      ],
      group: [
        "sales.id",
        "sales.season.id",
        "sales.ginner.id",
        "sales.buyerdata.id",
        "sales.program.id",
      ],
      order: [["sales_id", "desc"]],
      offset: offset,
      limit: limit,
    });

    for await (let item of rows) {
      const lotNo: string[] = item?.dataValues?.lot_no
        .split(", ")
        .map((id: any) => id);
      let qualityReport = await QualityParameter.findAll({
        where: {
          process_id: { [Op.in]: item?.dataValues?.process_ids },
          ginner_id: item?.dataValues?.ginner_id,
          lot_no: { [Op.in]: lotNo },
        },
        raw: true
      });

      nData.push({
        ...item.dataValues,
        quality_report: qualityReport ? qualityReport : null,
      });
    }

    // const { count, rows } = await GinSales.findAndCountAll({
    //   where: whereCondition,
    //   include: include,
    //   offset: offset,
    //   limit: limit,
    //   order: [["id", "desc"]],
    // });

    // for await (let item of rows) {

    //   let reelLotNo = await BaleSelection.findAll({
    //     attributes: [
    //       [Sequelize.col('"bale"."ginprocess"."reel_lot_no"'), "reel_lot_no"],
    //     ],
    //     where: {
    //       sales_id: item?.dataValues?.id,
    //     },
    //     include:[
    //       {
    //               model: GinBale,
    //               attributes: [],
    //               as: "bale",
    //               include: [
    //                 {
    //                   model: GinProcess,
    //                   as: "ginprocess",
    //                   attributes: [],
    //                 },
    //               ],
    //             },
    //     ],
    //     group: [
    //           "bale.process_id",
    //           "bale.ginprocess.id",
    //           "sales_id",
    //         ],
    //     raw: true
    //   });

    //   nData.push({
    //     ...item.dataValues,
    //     reelLotNo: reelLotNo ? reelLotNo : null,
    //   });
    // }

    // Apply pagination to the combined result

    return res.sendPaginationSuccess(res, nData, count.length);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};


// const exportGinnerSales = async (req: Request, res: Response) => {
//   // export-gin-sales-report
//   const excelFilePath = path.join("./upload", "excel-Ginner-sales-report.xlsx");
//   const searchTerm = req.query.search || "";
//   const page = Number(req.query.page) || 1;
//   const limit = Number(req.query.limit) || 10;
//   const { exportType, ginnerId, seasonId, programId, brandId, countryId }: any = req.query;
//   const offset = (page - 1) * limit;
//   const whereCondition: any = {};
//   try {
//     if (exportType === "all") {

//       return res.status(200).send({
//         success: true,
//         messgage: "File successfully Generated",
//         data: process.env.BASE_URL + "Ginner-sales-report.xlsx",
//       });

//     } else {
//       if (searchTerm) {
//         whereCondition[Op.or] = [
//           { "$sales.ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
//           { "$sales.buyerdata.name$": { [Op.iLike]: `%${searchTerm}%` } },
//           { "$sales.season.name$": { [Op.iLike]: `%${searchTerm}%` } },
//           { "$sales.program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
//           { "$bale.ginprocess.lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
//           { "$bale.ginprocess.reel_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
//           { "$sales.press_no$": { [Op.iLike]: `%${searchTerm}%` } },
//           { "$sales.invoice_no$": { [Op.iLike]: `%${searchTerm}%` } },
//           { "$sales.vehicle_no$": { [Op.iLike]: `%${searchTerm}%` } },
//           { "$sales.transporter_name$": { [Op.iLike]: `%${searchTerm}%` } },
//         ];
//       }
//       if (ginnerId) {
//         const idArray: number[] = ginnerId
//           .split(",")
//           .map((id: any) => parseInt(id, 10));
//         whereCondition.ginnerId = { [Op.in]: idArray };
//       }
//       if (brandId) {
//         const idArray: number[] = brandId
//           .split(",")
//           .map((id: any) => parseInt(id, 10));
//         whereCondition.brand = { [Op.overlap]: idArray };
//       }

//       if (countryId) {
//         const idArray: number[] = countryId
//           .split(",")
//           .map((id: any) => parseInt(id, 10));
//         whereCondition.countryId = { [Op.in]: idArray };
//       }

//       if (seasonId) {
//         const idArray: number[] = seasonId
//           .split(",")
//           .map((id: any) => parseInt(id, 10));
//         whereCondition.seasonId = { [Op.in]: idArray };
//       }

//       whereCondition.status = { [Op.ne]: "To be Submitted" };

//       if (programId) {
//         const idArray: number[] = programId
//           .split(",")
//           .map((id: any) => parseInt(id, 10));
//         whereCondition.programId = { [Op.in]: idArray };
//       }

//       // Create the excel workbook file
//       const workbook = new ExcelJS.Workbook();
//       const worksheet = workbook.addWorksheet("Sheet1");
//       worksheet.mergeCells("A1:T1");
//       const mergedCell = worksheet.getCell("A1");
//       mergedCell.value = "CottonConnect | Ginner Sales Report";
//       mergedCell.font = { bold: true };
//       mergedCell.alignment = { horizontal: "center", vertical: "middle" };
//       // Set bold font for header row
//       const headerRow = worksheet.addRow([
//         "Sr No.",
//         "Process Date",
//         "Data Entry Date",
//         "Season",
//         "Ginner Name",
//         "Invoice No",
//         "Sold To",
//         "Heap Number",
//         "Bale Lot No",
//         "REEL Lot No",
//         "No of Bales",
//         "Press/Bale No",
//         "Rate/Kg",
//         "Total Lint Quantity(Kgs)",
//         "Sales Value",
//         "Vehicle No",
//         "Transporter Name",
//         "Program",
//         "Agent Detials",
//         "status",
//       ]);
//       headerRow.font = { bold: true };
//       // let include = [
//       //   {
//       //     model: Ginner,
//       //     as: "ginner",
//       //     attributes: [],
//       //   },
//       //   {
//       //     model: Season,
//       //     as: "season",
//       //     attributes: [],
//       //   },
//       //   {
//       //     model: Program,
//       //     as: "program",
//       //     attributes: [],
//       //   },
//       //   {
//       //     model: Spinner,
//       //     as: "buyerdata",
//       //     attributes: [],
//       //   },
//       // ];
//       // //fetch data with pagination

//       // const rows: any = await BaleSelection.findAll({
//       //   attributes: [
//       //     [Sequelize.literal('"sales"."id"'), "sales_id"],
//       //     [Sequelize.literal('"sales"."date"'), "date"],
//       //     [Sequelize.literal('"sales"."createdAt"'), "createdAt"],
//       //     [Sequelize.col('"sales"."season"."name"'), "season_name"],
//       //     [Sequelize.col('"sales"."ginner"."name"'), "ginner"],
//       //     [Sequelize.col('"sales"."program"."program_name"'), "program"],
//       //     [Sequelize.col('"sales"."buyerdata"."name"'), "buyerdata"],
//       //     [Sequelize.literal('"sales"."total_qty"'), "total_qty"],
//       //     [Sequelize.literal('"sales"."invoice_no"'), "invoice_no"],
//       //     [Sequelize.col('"bale"."ginprocess"."lot_no"'), "lot_no"],
//       //     [Sequelize.col('"bale"."ginprocess"."reel_lot_no"'), "reel_lot_no"],
//       //     [Sequelize.literal('"sales"."rate"'), "rate"],
//       //     [Sequelize.literal('"sales"."candy_rate"'), "candy_rate"],
//       //     [
//       //       Sequelize.fn(
//       //         "SUM",
//       //         Sequelize.literal('CAST("bale"."weight" AS DOUBLE PRECISION)')
//       //       ),
//       //       "lint_quantity",
//       //     ],
//       //     [
//       //       Sequelize.fn("COUNT", Sequelize.literal("DISTINCT bale_id")),
//       //       "no_of_bales",
//       //     ],
//       //     [Sequelize.literal('"sales"."sale_value"'), "sale_value"],
//       //     [Sequelize.literal('"sales"."press_no"'), "press_no"],
//       //     [Sequelize.literal('"sales"."qty_stock"'), "qty_stock"],
//       //     [Sequelize.literal('"sales"."weight_loss"'), "weight_loss"],
//       //     [Sequelize.literal('"sales"."invoice_file"'), "invoice_file"],
//       //     [Sequelize.literal('"sales"."vehicle_no"'), "vehicle_no"],
//       //     [Sequelize.literal('"sales"."transporter_name"'), "transporter_name"],
//       //     [Sequelize.literal('"sales"."transaction_agent"'), "transaction_agent"],
//       //     [Sequelize.literal('"sales"."status"'), "status"],
//       //   ],
//       //   where: whereCondition,
//       //   include: [
//       //     {
//       //       model: GinSales,
//       //       as: "sales",
//       //       include: include,
//       //       attributes: [],
//       //     },
//       //     {
//       //       model: GinBale,
//       //       attributes: [],
//       //       as: "bale",
//       //       include: [
//       //         {
//       //           model: GinProcess,
//       //           as: "ginprocess",
//       //           attributes: [],
//       //         },
//       //       ],
//       //     },
//       //   ],
//       //   group: [
//       //     "bale.process_id",
//       //     "bale.ginprocess.id",
//       //     "sales.id",
//       //     "sales.season.id",
//       //     "sales.ginner.id",
//       //     "sales.buyerdata.id",
//       //     "sales.program.id",
//       //   ],
//       //   order: [["sales_id", "desc"]],
//       // });

//       // let result = rows.flat();
//       // // Apply pagination to the combined result
//       // let data = rows.slice(offset, offset + limit);

//       const data = await ExportGinnerSale.findAll({
//         where: whereCondition,


//       })

//       // Append data to worksheet
//       for await (const [index, item] of data.entries()) {

//         const rowValues = Object.values({
//           index: index + 1,
//           date: item?.date ? item?.date : "",
//           created_at: item?.createdAt ? item?.createdAt : "",
//           season: item?.season,
//           ginner: item?.ginner,
//           invoice: item?.invoice,
//           buyer: item?.buyer,
//           heap: "",
//           lot_no: item?.lot_no,
//           reel_lot_no: item?.reel_lot_no,
//           no_of_bales: item?.no_of_bales,
//           press_no: item?.press_no,
//           rate: item?.rate,
//           lint_quantity: item?.lint_quantity,
//           sales_value: item?.sales_value,
//           vehicle_no: item?.vehicle_no,
//           transporter_name: item?.transporter_name,
//           program: item?.program,
//           agentDetails: item?.agentDetails,
//           status: item?.status,
//         });
//         worksheet.addRow(rowValues);
//       }
//       // Auto-adjust column widths based on content
//       worksheet.columns.forEach((column: any) => {
//         let maxCellLength = 0;
//         column.eachCell({ includeEmpty: true }, (cell: any) => {
//           const cellLength = (cell.value ? cell.value.toString() : "").length;
//           maxCellLength = Math.max(maxCellLength, cellLength);
//         });
//         column.width = Math.min(14, maxCellLength + 2); // Limit width to 30 characters
//       });

//       // Save the workbook
//       await workbook.xlsx.writeFile(excelFilePath);

//       // let dataa = await ExportData.findOne({where:{ginner_lint_bale_sale_load:false}})
//       // console.log(dataa)
//       res.status(200).send({
//         success: true,
//         messgage: "File successfully Generated",
//         data: process.env.BASE_URL + "excel-Ginner-sales-report.xlsx",
//       });
//     }
//   } catch (error: any) {
//     console.error("Error appending data:", error);
//     return res.sendError(res, error.message);
//   }
// };



const exportSpinnerGreyOutReport = async (req: Request, res: Response) => {
  // spinner_bale_receipt_load
  const excelFilePath = path.join(
   "./upload",
   "excel-spinner-grey-out-report.xlsx"
 );

 const searchTerm = req.query.search || "";
 const page = Number(req.query.page) || 1;
 const limit = Number(req.query.limit) || 10;
 const {exportType, ginnerId, spinnerId, seasonId, programId, brandId, countryId }: any =
   req.query;
 const offset = (page - 1) * limit;
 const whereCondition: any = {};
 try {

   if (exportType === "all") {
     return res.status(200).send({
       success: true,
       messgage: "File successfully Generated",
       data: process.env.BASE_URL + "spinner-grey-out-report.xlsx",
     });
   } else {

   if (searchTerm) {
     whereCondition[Op.or] = [
       { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
       { "$buyerdata.name$": { [Op.iLike]: `%${searchTerm}%` } },
       { "$ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
       { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
       { lot_no: { [Op.iLike]: `%${searchTerm}%` } },
       { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
       { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
       { press_no: { [Op.iLike]: `%${searchTerm}%` } },
       { vehicle_no: { [Op.iLike]: `%${searchTerm}%` } },
     ];
   }
   if (spinnerId) {
     const idArray: number[] = spinnerId
       .split(",")
       .map((id: any) => parseInt(id, 10));
     whereCondition["$buyer$"] = { [Op.in]: idArray };
   }

   if (ginnerId) {
     const idArray: number[] = ginnerId
       .split(",")
       .map((id: any) => parseInt(id, 10));
     whereCondition["$ginner_id$"] = { [Op.in]: idArray };
   }

   if (brandId) {
     const idArray: number[] = brandId
       .split(",")
       .map((id: any) => parseInt(id, 10));
     whereCondition["$buyerdata.brand$"] = { [Op.overlap]: idArray };
   }

   if (countryId) {
     const idArray: number[] = countryId
       .split(",")
       .map((id: any) => parseInt(id, 10));
     whereCondition["$buyerdata.country_id$"] = { [Op.in]: idArray };
   }

   if (seasonId) {
     const idArray: number[] = seasonId
       .split(",")
       .map((id: any) => parseInt(id, 10));
     whereCondition["$season_id$"] = { [Op.in]: idArray };
   }

   whereCondition.greyout_status = true;

   if (programId) {
     const idArray: number[] = programId
       .split(",")
       .map((id: any) => parseInt(id, 10));
     whereCondition["$program_id$"] = { [Op.in]: idArray };
   }

   let include = [
     {
       model: Ginner,
       as: "ginner",
       attributes: [],
     },
     {
       model: Season,
       as: "season",
       attributes: [],
     },
     {
       model: Program,
       as: "program",
       attributes: [],
     },
     {
       model: Spinner,
       as: "buyerdata",
       attributes: [],
     },
   ];

   // Create the excel workbook file
   const workbook = new ExcelJS.Workbook();
   const worksheet = workbook.addWorksheet("Sheet1");
   worksheet.mergeCells("A1:M1");
   const mergedCell = worksheet.getCell("A1");
   mergedCell.value = "CottonConnect | Spinner Grey Out Report";
   mergedCell.font = { bold: true };
   mergedCell.alignment = { horizontal: "center", vertical: "middle" };
   // Set bold font for header row
   const headerRow = worksheet.addRow([
     "Sr No.",
     "Season",
     "Ginner Name",
     "Spinner Name",
     "REEL Lot No",
     "Invoice Number",
     "Bale Lot No",
     "Quantity Stock",
   ]);
   headerRow.font = { bold: true };

   // //fetch data with pagination

   const { count, rows }: any = await GinSales.findAndCountAll({
     where: whereCondition,
     include: include,
     attributes: [
       [Sequelize.col('"season"."name"'), 'season_name'],
       [Sequelize.literal('"ginner"."name"'), "ginner_name"],
       [Sequelize.col('"buyerdata"."name"'), 'spinner'],
       [Sequelize.fn('MAX', Sequelize.col('invoice_no')), 'invoice_no'],
       [Sequelize.fn('MAX', Sequelize.col('lot_no')), 'lot_no'],
       [Sequelize.fn('MAX', Sequelize.col('reel_lot_no')), 'reel_lot_no'],
       [Sequelize.fn('MAX', Sequelize.col('qty_stock')), 'qty_stock'],
     ],
     group: ['season.id', 'ginner.id', 'buyerdata.id'], 
     offset: offset,
     limit: limit,
   });    

   // // Append data to worksheet
   for await (const [index, item] of rows.entries()) {
     const rowValues = Object.values({
       index: index + 1,
       season: item.dataValues.season_name ? item.dataValues.season_name : "",
       ginner: item.dataValues.ginner_name ? item.dataValues.ginner_name : "",
       spinner: item.dataValues.spinner ? item.dataValues.spinner : "",
       reel_lot_no: item.dataValues.reel_lot_no? item.dataValues.reel_lot_no: "",
       invoice: item.dataValues.invoice_no ? item.dataValues.invoice_no : "",
       lot_no: item.dataValues.lot_no ? item.dataValues.lot_no : "",
       lint_quantity: item.dataValues.qty_stock? item.dataValues.qty_stock: "",
     });
     worksheet.addRow(rowValues);
   }

   // Auto-adjust column widths based on content
   worksheet.columns.forEach((column: any) => {
     let maxCellLength = 0;
     column.eachCell({ includeEmpty: true }, (cell: any) => {
       const cellLength = (cell.value ? cell.value.toString() : "").length;
       maxCellLength = Math.max(maxCellLength, cellLength);
     });
     column.width = Math.min(14, maxCellLength + 2); // Limit width to 30 characters
   });

   // Save the workbook
   await workbook.xlsx.writeFile(excelFilePath);
   return res.status(200).send({
     success: true,
     messgage: "File successfully Generated",
     data: process.env.BASE_URL + "excel-spinner-grey-out-report.xlsx",
   });
 }
 } catch (error: any) {
   console.log(error);
   return res.sendError(res, error.message);
 }
};

const exportGinnerSales = async (req: Request, res: Response) => {
  const excelFilePath = path.join("./upload", "excel-Ginner-sales-report.xlsx");
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { exportType, ginnerId, seasonId, programId, brandId, countryId, startDate, endDate }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (exportType === "all") {
      return res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "Ginner-sales-report.xlsx",
      });
    } else {
      if (searchTerm) {
        whereCondition[Op.or] = [
          { "$sales.ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$sales.buyerdata.name$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$sales.season.name$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$sales.program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$sales.lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$bale.ginprocess.reel_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$sales.press_no$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$sales.invoice_no$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$sales.vehicle_no$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$sales.transporter_name$": { [Op.iLike]: `%${searchTerm}%` } },
        ];
      }
      if (ginnerId) {
        const idArray: number[] = ginnerId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$sales.ginner_id$"] = { [Op.in]: idArray };
      }
      if (brandId) {
        const idArray: number[] = brandId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$sales.ginner.brand$"] = { [Op.overlap]: idArray };
      }
  
      if (countryId) {
        const idArray: number[] = countryId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$sales.ginner.country_id$"] = { [Op.in]: idArray };
      }
  
      if (seasonId) {
        const idArray: number[] = seasonId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$sales.season_id$"] = { [Op.in]: idArray };
      }
      if (startDate && endDate) {
        const startOfDay = new Date(startDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(endDate);
        endOfDay.setUTCHours(23, 59, 59, 999);
        whereCondition.createdAt = { [Op.between]: [startOfDay, endOfDay] }
    }
      whereCondition["$sales.status$"] = { [Op.ne]: "To be Submitted" };
  
      if (programId) {
        const idArray: number[] = programId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$sales.program_id$"] = { [Op.in]: idArray };
      }

      // Create the excel workbook file
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet1");
      worksheet.mergeCells('A1:T1');
      const mergedCell = worksheet.getCell('A1');
      mergedCell.value = 'CottonConnect | Ginner Sales Report';
      mergedCell.font = { bold: true };
      mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
      // Set bold font for header row
      const headerRow = worksheet.addRow([
        "Sr No.", "Process Date", "Data Entry Date", "Season", "Ginner Name",
        "Invoice No", "Sold To", "Heap Number", "Bale Lot No", "REEL Lot No", "No of Bales", "Press/Bale No", "Rate/Kg",
        "Total Quantity", "Sales Value", "Vehicle No", "Transporter Name", "Program", "Agent Detials", "Status"
      ]);
      headerRow.font = { bold: true };
      let include = [
        {
          model: Ginner,
          as: "ginner",
          attributes: []
        },
        {
          model: Season,
          as: "season",
          attributes: []
        },
        {
          model: Program,
          as: "program",
          attributes: []
        },
        {
          model: Spinner,
          as: "buyerdata",
          attributes: []
        }
      ];
      //fetch data with pagination

      const rows: any = await BaleSelection.findAll({
        attributes: [
          [Sequelize.literal('"sales"."id"'), "sales_id"],
          [Sequelize.literal('"sales"."date"'), "date"],
          [Sequelize.literal('"sales"."createdAt"'), "createdAt"],
          [Sequelize.col('"sales"."season"."name"'), "season_name"],
          [Sequelize.col('"sales"."ginner"."id"'), "ginner_id"],
          [Sequelize.col('"sales"."ginner"."name"'), "ginner"],
          [Sequelize.col('"sales"."program"."program_name"'), "program"],
          [Sequelize.col('"sales"."buyerdata"."name"'), "buyerdata"],
          [Sequelize.literal('"sales"."total_qty"'), "total_qty"],
          [Sequelize.literal('"sales"."invoice_no"'), "invoice_no"],
          [Sequelize.col('"sales"."lot_no"'), "lot_no"],
          [Sequelize.fn('STRING_AGG', Sequelize.literal('DISTINCT "bale->ginprocess"."reel_lot_no"'), ',' ) , "reel_lot_no"],
          [Sequelize.literal('"sales"."rate"'), "rate"],
          [Sequelize.literal('"sales"."candy_rate"'), "candy_rate"],
          [Sequelize.literal('"sales"."total_qty"'), "lint_quantity"],
          [Sequelize.literal('"sales"."no_of_bales"'), "no_of_bales"],
          [Sequelize.literal('"sales"."sale_value"'), "sale_value"],
          [Sequelize.literal('"sales"."press_no"'), "press_no"],
          [Sequelize.literal('"sales"."qty_stock"'), "qty_stock"],
          [Sequelize.literal('"sales"."weight_loss"'), "weight_loss"],
          [Sequelize.literal('"sales"."invoice_file"'), "invoice_file"],
          [Sequelize.literal('"sales"."vehicle_no"'), "vehicle_no"],
          [Sequelize.literal('"sales"."transporter_name"'), "transporter_name"],
          [Sequelize.literal('"sales"."transaction_agent"'), "transaction_agent"],
          [Sequelize.literal('"sales"."status"'), "status"],
        ],
        where: whereCondition,
        include: [{
          model: GinSales,
          as: "sales",
          include: include,
          attributes: []
        }, {
          model: GinBale,
          attributes: [],
          as: "bale",
          include: [{
            model: GinProcess,
            as: "ginprocess",
            attributes: []
          }]
        }],
        group: [
          "sales.id",
          "sales.season.id",
          "sales.ginner.id",
          "sales.buyerdata.id",
          "sales.program.id",
        ],
        order: [
          ['sales_id', "desc"]
        ],
        offset: offset,
        limit: limit,
      })

      // Append data to worksheet
      for await (const [index, item] of rows.entries()) {
        const rowValues = Object.values({
          index: index + 1,
          date: item.dataValues.date ? item.dataValues.date : '',
          created_at: item.dataValues.createdAt ? item.dataValues.createdAt : '',
          season: item.dataValues.season_name ? item.dataValues.season_name : '',
          ginner: item.dataValues.ginner ? item.dataValues.ginner : '',
          invoice: item.dataValues.invoice_no ? item.dataValues.invoice_no : '',
          buyer: item.dataValues.buyerdata ? item.dataValues.buyerdata : '',
          heap: '',
          lot_no: item.dataValues.lot_no ? item.dataValues.lot_no : '',
          reel_lot_no: item.dataValues.reel_lot_no ? item.dataValues.reel_lot_no : '',
          no_of_bales: item.dataValues.no_of_bales ? Number(item.dataValues.no_of_bales) : 0,
          press_no: item.dataValues.press_no ? item.dataValues.press_no : '',
          rate: item.dataValues.rate ? Number(item.dataValues.rate) : 0,
          lint_quantity: item.dataValues.lint_quantity ? item.dataValues.lint_quantity : '',
          sales_value: item.dataValues.sale_value ? Number(item.dataValues.sale_value) : 0,
          vehicle_no: item.dataValues.vehicle_no ? item.dataValues.vehicle_no : '',
          transporter_name: item.dataValues.transporter_name ? item.dataValues.transporter_name : '',
          program: item.dataValues.program ? item.dataValues.program : '',
          agentDetails: item.dataValues.transaction_agent ? item.dataValues.transaction_agent : 'NA',
          status: item.dataValues.status === 'Sold' ? 'Sold' : `Available [Stock : ${item.dataValues.qty_stock ? item.dataValues.qty_stock : 0}]`
        });
        worksheet.addRow(rowValues);
      }
      // Auto-adjust column widths based on content
      worksheet.columns.forEach((column: any) => {
        let maxCellLength = 0;
        column.eachCell({ includeEmpty: true }, (cell: any) => {
          const cellLength = (cell.value ? cell.value.toString() : '').length;
          maxCellLength = Math.max(maxCellLength, cellLength);
        });
        column.width = Math.min(14, maxCellLength + 2); // Limit width to 30 characters
      });

      // Save the workbook
      await workbook.xlsx.writeFile(excelFilePath);
      res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "excel-Ginner-sales-report.xlsx",
      });
    }
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);

  }
};

const fetchSpinnerBalePagination = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { ginnerId, spinnerId, seasonId, programId, brandId, countryId, startDate, endDate }: any =
    req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$sales.ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.buyerdata.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$bale.ginprocess.reel_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.press_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.invoice_no$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    if (spinnerId) {
      const idArray: number[] = spinnerId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.buyer$"] = { [Op.in]: idArray };
    }

    if (ginnerId) {
      const idArray: number[] = ginnerId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.ginner_id$"] = { [Op.in]: idArray };
    }

    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.buyerdata.brand$"] = { [Op.overlap]: idArray };
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.buyerdata.country_id$"] = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.season_id$"] = { [Op.in]: idArray };
    }

    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereCondition.createdAt = { [Op.between]: [startOfDay, endOfDay] }
  }

    whereCondition["$sales.status$"] = "Sold";

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.program_id$"] = { [Op.in]: idArray };
    }

    let include = [
      {
        model: Ginner,
        as: "ginner",
        attributes: [],
      },
      {
        model: Season,
        as: "season",
        attributes: [],
      },
      {
        model: Program,
        as: "program",
        attributes: [],
      },
      {
        model: Spinner,
        as: "buyerdata",
        attributes: [],
      },
    ];
    //fetch data with pagination
    const nData: any = [];

    const { count, rows }: any = await BaleSelection.findAndCountAll({
      attributes: [
        [Sequelize.literal('"sales"."id"'), "sales_id"],
        [Sequelize.literal('"sales"."date"'), "date"],
        [Sequelize.literal('"sales"."createdAt"'), "createdAt"],
        [Sequelize.literal('"sales"."accept_date"'), "accept_date"],
        [Sequelize.col('"sales"."season"."name"'), "season_name"],
        [Sequelize.col('"sales"."ginner"."id"'), "ginner_id"],
        [Sequelize.col('"sales"."ginner"."name"'), "ginner"],
        [Sequelize.col('"sales"."program"."program_name"'), "program"],
        [Sequelize.col('"sales"."buyerdata"."id"'), "spinner_id"],
        [Sequelize.col('"sales"."buyerdata"."name"'), "spinner"],
        [Sequelize.literal('"sales"."total_qty"'), "total_qty"],
        [Sequelize.literal('"sales"."invoice_no"'), "invoice_no"],
        [Sequelize.col('"sales"."lot_no"'), "lot_no"],
        [Sequelize.fn('STRING_AGG', Sequelize.literal('DISTINCT "bale->ginprocess"."reel_lot_no"'), ',' ) , "reel_lot_no"],
        [Sequelize.fn('ARRAY_AGG', Sequelize.literal('DISTINCT "bale->ginprocess"."id"')), "process_ids"],
        [Sequelize.literal('"sales"."rate"'), "rate"],
        [Sequelize.literal('"sales"."candy_rate"'), "candy_rate"],
        [Sequelize.literal('"sales"."total_qty"'), "lint_quantity"],
        [Sequelize.literal('"sales"."no_of_bales"'), "no_of_bales"],
        [Sequelize.literal('"sales"."sale_value"'), "sale_value"],
        [Sequelize.literal('"sales"."press_no"'), "press_no"],
        [Sequelize.literal('"sales"."qty_stock"'), "qty_stock"],
        [Sequelize.literal('"sales"."weight_loss"'), "weight_loss"],
        [Sequelize.literal('"sales"."invoice_file"'), "invoice_file"],
        [Sequelize.literal('"sales"."vehicle_no"'), "vehicle_no"],
        [Sequelize.literal('"sales"."transporter_name"'), "transporter_name"],
        [Sequelize.literal('"sales"."transaction_agent"'), "transaction_agent"],
        [Sequelize.literal('"sales"."status"'), "status"],
        [Sequelize.literal('"sales"."qr"'), "qr"],
      ],
      where: whereCondition,
      include: [
        {
          model: GinSales,
          as: "sales",
          include: include,
          attributes: [],
        },
        {
          model: GinBale,
          attributes: [],
          as: "bale",
          include: [
            {
              model: GinProcess,
              as: "ginprocess",
              attributes: [],
            },
          ],
        },
      ],
      group: [
        "sales.id",
        "sales.season.id",
        "sales.ginner.id",
        "sales.buyerdata.id",
        "sales.program.id",
      ],
      order: [["sales_id", "desc"]],
      offset: offset,
      limit: limit,
    });

    for await (let item of rows) {
      const lotNo: string[] = item?.dataValues?.lot_no
        .split(", ")
        .map((id: any) => id);
      let qualityReport = await QualityParameter.findAll({
        where: {
          process_id: { [Op.in]: item?.dataValues?.process_ids },
          ginner_id: item?.dataValues?.ginner_id,
          lot_no: { [Op.in]: lotNo },
        },
        raw: true
      });

      nData.push({
        ...item.dataValues,
        quality_report: qualityReport ? qualityReport : null,
      });
    }

    return res.sendPaginationSuccess(res, nData, count?.length);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

const fetchSpinnerPendingBale = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { ginnerId, spinnerId, seasonId, programId, brandId, countryId, startDate, endDate }: any =
    req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$sales.ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.buyerdata.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$bale.ginprocess.reel_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.press_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.invoice_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.vehicle_no$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }

    if (spinnerId) {
      const idArray: number[] = spinnerId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.buyer$"] = { [Op.in]: idArray };
    } else {
      whereCondition["$sales.buyer$"] = {
        [Op.ne]: null,
      };
    }

    if (ginnerId) {
      const idArray: number[] = ginnerId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.ginner_id$"] = { [Op.in]: idArray };
    }

    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.buyerdata.brand$"] = { [Op.overlap]: idArray };
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.buyerdata.country_id$"] = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.season_id$"] = { [Op.in]: idArray };
    }

    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereCondition.createdAt = { [Op.between]: [startOfDay, endOfDay] }
  }

    whereCondition["$sales.total_qty$"] = {
      [Op.gt]: 0,
    };

    whereCondition["$sales.status$"] = { [Op.in]: ['Pending', "Pending for QR scanning"] };

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.program_id$"] = { [Op.in]: idArray };
    }

    let include = [
      {
        model: Ginner,
        as: "ginner",
        attributes: ["id", "name"],
      },
      {
        model: Season,
        as: "season",
        attributes: ["id", "name"],
      },
      {
        model: Program,
        as: "program",
        attributes: ["id", "program_name"],
      },
      {
        model: Spinner,
        as: "buyerdata",
        attributes: ["id", "name"],
      },
    ];
    //fetch data with pagination

    const { count, rows }: any = await BaleSelection.findAndCountAll({
      attributes: [
        [Sequelize.literal('"sales"."id"'), "sales_id"],
        [Sequelize.literal('"sales"."date"'), "date"],
        [Sequelize.literal('"sales"."createdAt"'), "createdAt"],
        [Sequelize.literal('"sales"."accept_date"'), "accept_date"],
        [Sequelize.col('"sales"."season"."name"'), "season_name"],
        [Sequelize.col('"sales"."ginner"."id"'), "ginner_id"],
        [Sequelize.col('"sales"."ginner"."name"'), "ginner"],
        [Sequelize.col('"sales"."program"."program_name"'), "program"],
        [Sequelize.col('"sales"."buyerdata"."id"'), "spinner_id"],
        [Sequelize.col('"sales"."buyerdata"."name"'), "spinner"],
        [Sequelize.literal('"sales"."total_qty"'), "total_qty"],
        [Sequelize.literal('"sales"."invoice_no"'), "invoice_no"],
        [Sequelize.col('"sales"."lot_no"'), "lot_no"],
        [Sequelize.fn('STRING_AGG', Sequelize.literal('DISTINCT "bale->ginprocess"."reel_lot_no"'), ', ' ) , "reel_lot_no"],
        [Sequelize.literal('"sales"."rate"'), "rate"],
        [Sequelize.literal('"sales"."candy_rate"'), "candy_rate"],
        [Sequelize.literal('"sales"."total_qty"'), "lint_quantity"],
        [Sequelize.literal('"sales"."no_of_bales"'), "no_of_bales"],
        [Sequelize.literal('"sales"."sale_value"'), "sale_value"],
        [Sequelize.literal('"sales"."press_no"'), "press_no"],
        [Sequelize.literal('"sales"."qty_stock"'), "qty_stock"],
        [Sequelize.literal('"sales"."weight_loss"'), "weight_loss"],
        [Sequelize.literal('"sales"."invoice_file"'), "invoice_file"],
        [Sequelize.literal('"sales"."vehicle_no"'), "vehicle_no"],
        [Sequelize.literal('"sales"."transporter_name"'), "transporter_name"],
        [Sequelize.literal('"sales"."transaction_agent"'), "transaction_agent"],
        [Sequelize.literal('"sales"."status"'), "status"],
        [Sequelize.literal('"sales"."qr"'), "qr"],
      ],
      where: whereCondition,
      include: [
        {
          model: GinSales,
          as: "sales",
          include: include,
          attributes: [],
        },
        {
          model: GinBale,
          attributes: [],
          as: "bale",
          include: [
            {
              model: GinProcess,
              as: "ginprocess",
              attributes: [],
            },
          ],
        },
      ],
      group: [
        "sales.id",
        "sales.season.id",
        "sales.ginner.id",
        "sales.buyerdata.id",
        "sales.program.id",
      ],
      order: [["sales_id", "desc"]],
      offset: offset,
      limit: limit,
    });
    return res.sendPaginationSuccess(res, rows, count.length);
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message);
  }
};

const exportSpinnerBale = async (req: Request, res: Response) => {
  // spinner_bale_receipt_load
  const excelFilePath = path.join(
    "./upload",
    "excel-spinner-bale-receipt-report.xlsx"
  );

  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const {exportType, ginnerId, spinnerId, seasonId, programId, brandId, countryId, startDate, endDate }: any =
    req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {

    if (exportType === "all") {
      return res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "Spinner-bale-receipt-report.xlsx",
      });
    } else {

    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$sales.ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.buyerdata.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$bale.ginprocess.reel_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.press_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.invoice_no$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    if (spinnerId) {
      const idArray: number[] = spinnerId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.buyer$"] = { [Op.in]: idArray };
    }

    if (ginnerId) {
      const idArray: number[] = ginnerId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.ginner_id$"] = { [Op.in]: idArray };
    }

    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.buyerdata.brand$"] = { [Op.overlap]: idArray };
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.buyerdata.country_id$"] = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.season_id$"] = { [Op.in]: idArray };
    }

    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereCondition.createdAt = { [Op.between]: [startOfDay, endOfDay] }
  }

    whereCondition["$sales.status$"] = "Sold";

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.program_id$"] = { [Op.in]: idArray };
    }

    let include = [
      {
        model: Ginner,
        as: "ginner",
        attributes: [],
      },
      {
        model: Season,
        as: "season",
        attributes: [],
      },
      {
        model: Program,
        as: "program",
        attributes: [],
      },
      {
        model: Spinner,
        as: "buyerdata",
        attributes: [],
      },
    ];

    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    worksheet.mergeCells("A1:M1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Spinner Bale Receipt Report";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.",
      "Date of Transaction Receipt",
      "Date of transaction",
      "Season",
      "Spinner Name",
      "Ginner Name",
      "Invoice Number",
      "Ginner Lot No",
      "REEL Lot No",
      "Press/Bale No",
      "No of Bales",
      "Total Lint Quantity(Kgs)",
      "Programme",
    ]);
    headerRow.font = { bold: true };

    // //fetch data with pagination

    const { count, rows }: any = await BaleSelection.findAndCountAll({
      attributes: [
        [Sequelize.literal('"sales"."id"'), "sales_id"],
        [Sequelize.literal('"sales"."date"'), "date"],
        [Sequelize.literal('"sales"."createdAt"'), "createdAt"],
        [Sequelize.literal('"sales"."accept_date"'), "accept_date"],
        [Sequelize.col('"sales"."season"."name"'), "season_name"],
        [Sequelize.col('"sales"."ginner"."id"'), "ginner_id"],
        [Sequelize.col('"sales"."ginner"."name"'), "ginner"],
        [Sequelize.col('"sales"."program"."program_name"'), "program"],
        [Sequelize.col('"sales"."buyerdata"."id"'), "spinner_id"],
        [Sequelize.col('"sales"."buyerdata"."name"'), "spinner"],
        [Sequelize.literal('"sales"."total_qty"'), "total_qty"],
        [Sequelize.literal('"sales"."invoice_no"'), "invoice_no"],
        [Sequelize.col('"sales"."lot_no"'), "lot_no"],
        [Sequelize.fn('STRING_AGG', Sequelize.literal('DISTINCT "bale->ginprocess"."reel_lot_no"'), ',' ) , "reel_lot_no"],
        [Sequelize.literal('"sales"."rate"'), "rate"],
        [Sequelize.literal('"sales"."candy_rate"'), "candy_rate"],
        [Sequelize.literal('"sales"."total_qty"'), "lint_quantity"],
        [Sequelize.literal('"sales"."no_of_bales"'), "no_of_bales"],
        [Sequelize.literal('"sales"."sale_value"'), "sale_value"],
        [Sequelize.literal('"sales"."press_no"'), "press_no"],
        [Sequelize.literal('"sales"."qty_stock"'), "qty_stock"],
        [Sequelize.literal('"sales"."weight_loss"'), "weight_loss"],
        [Sequelize.literal('"sales"."status"'), "status"],
      ],
      where: whereCondition,
      include: [
        {
          model: GinSales,
          as: "sales",
          include: include,
          attributes: [],
        },
        {
          model: GinBale,
          attributes: [],
          as: "bale",
          include: [
            {
              model: GinProcess,
              as: "ginprocess",
              attributes: [],
            },
          ],
        },
      ],
      group: [
        "sales.id",
        "sales.season.id",
        "sales.ginner.id",
        "sales.buyerdata.id",
        "sales.program.id",
      ],
      order: [["sales_id", "desc"]],
      offset: offset,
      limit: limit,
    });

    // // Append data to worksheet

    for await (const [index, item] of rows.entries()) {
      const rowValues = Object.values({
        index: index + 1,
        accept_date: item.dataValues.accept_date
          ? item.dataValues.accept_date
          : "",
        date: item.dataValues.date ? item.dataValues.date : "",
        season: item.dataValues.season_name ? item.dataValues.season_name : "",
        spinner: item.dataValues.spinner ? item.dataValues.spinner : "",
        ginner: item.dataValues.ginner ? item.dataValues.ginner : "",
        invoice: item.dataValues.invoice_no ? item.dataValues.invoice_no : "",
        lot_no: item.dataValues.lot_no ? item.dataValues.lot_no : "",
        reel_lot_no: item.dataValues.reel_lot_no
          ? item.dataValues.reel_lot_no
          : "",
        press_no: item.dataValues.press_no ? item.dataValues.press_no : "",
        no_of_bales: item.dataValues.no_of_bales
          ? Number(item.dataValues.no_of_bales)
          : 0,
        lint_quantity: item.dataValues.lint_quantity
          ? Number(item.dataValues.lint_quantity)
          : 0,
        program: item.dataValues.program ? item.dataValues.program : "",
      });
      worksheet.addRow(rowValues);
    }
    // Auto-adjust column widths based on content
    worksheet.columns.forEach((column: any) => {
      let maxCellLength = 0;
      column.eachCell({ includeEmpty: true }, (cell: any) => {
        const cellLength = (cell.value ? cell.value.toString() : "").length;
        maxCellLength = Math.max(maxCellLength, cellLength);
      });
      column.width = Math.min(14, maxCellLength + 2); // Limit width to 30 characters
    });

    // Save the workbook
    await workbook.xlsx.writeFile(excelFilePath);
    return res.status(200).send({
      success: true,
      messgage: "File successfully Generated",
      data: process.env.BASE_URL + "excel-spinner-bale-receipt-report.xlsx",
    });
  }
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

const exportPendingSpinnerBale = async (req: Request, res: Response) => {
  // spinner_yarn_bales_load
  const excelFilePath = path.join(
    "./upload",
    "excel-Spinner-Pending-Bales-Receipt-Report.xlsx"
  );
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const pagination = req.query.pagination;
  const { exportType, ginnerId, spinnerId, seasonId, programId, brandId, countryId, startDate, endDate }: any =
    req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {

    if (exportType === "all") {
      return res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "Spinner-Pending-Bales-Receipt-Report.xlsx",
      });
    } else {

      if (searchTerm) {
        whereCondition[Op.or] = [
          { "$sales.ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$sales.buyerdata.name$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$sales.season.name$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$sales.program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$sales.lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$bale.ginprocess.reel_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$sales.press_no$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$sales.invoice_no$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$sales.vehicle_no$": { [Op.iLike]: `%${searchTerm}%` } },
        ];
      }
  
      if (spinnerId) {
        const idArray: number[] = spinnerId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$sales.buyer$"] = { [Op.in]: idArray };
      } else {
        whereCondition["$sales.buyer$"] = {
          [Op.ne]: null,
        };
      }
  
      if (ginnerId) {
        const idArray: number[] = ginnerId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$sales.ginner_id$"] = { [Op.in]: idArray };
      }
  
      if (brandId) {
        const idArray: number[] = brandId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$sales.buyerdata.brand$"] = { [Op.overlap]: idArray };
      }
  
      if (countryId) {
        const idArray: number[] = countryId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$sales.buyerdata.country_id$"] = { [Op.in]: idArray };
      }
  
      if (seasonId) {
        const idArray: number[] = seasonId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$sales.season_id$"] = { [Op.in]: idArray };
      }
  
      if (startDate && endDate) {
        const startOfDay = new Date(startDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(endDate);
        endOfDay.setUTCHours(23, 59, 59, 999);
        whereCondition.createdAt = { [Op.between]: [startOfDay, endOfDay] }
    }
  
      whereCondition["$sales.total_qty$"] = {
        [Op.gt]: 0,
      };
  
      whereCondition["$sales.status$"] = { [Op.in]: ['Pending', "Pending for QR scanning"] };
  
      if (programId) {
        const idArray: number[] = programId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$sales.program_id$"] = { [Op.in]: idArray };
      }

    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    worksheet.mergeCells("A1:M1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Spinner Pending Bales Receipt Report";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.",
      "Date",
      "Season",
      "Ginner Name",
      "Spinner Name",
      "Invoice No",
      "No of Bales",
      "Bale Lot No",
      "REEL Lot No",
      "Quantity(KGs)",
      "Actual Qty(KGs)",
      "Program",
      "Vehicle No",
    ]);
    headerRow.font = { bold: true };
    let include = [
      {
        model: Ginner,
        as: "ginner",
      },
      {
        model: Season,
        as: "season",
      },
      {
        model: Program,
        as: "program",
      },
      {
        model: Spinner,
        as: "buyerdata",
        attributes: ["id", "name"],
      },
    ];
    const rows: any = await BaleSelection.findAll({
      attributes: [
        [Sequelize.literal('"sales"."id"'), "sales_id"],
        [Sequelize.literal('"sales"."date"'), "date"],
        [Sequelize.literal('"sales"."createdAt"'), "createdAt"],
        [Sequelize.literal('"sales"."accept_date"'), "accept_date"],
        [Sequelize.col('"sales"."season"."name"'), "season_name"],
        [Sequelize.col('"sales"."ginner"."id"'), "ginner_id"],
        [Sequelize.col('"sales"."ginner"."name"'), "ginner"],
        [Sequelize.col('"sales"."program"."program_name"'), "program"],
        [Sequelize.col('"sales"."buyerdata"."id"'), "spinner_id"],
        [Sequelize.col('"sales"."buyerdata"."name"'), "spinner"],
        [Sequelize.literal('"sales"."total_qty"'), "total_qty"],
        [Sequelize.literal('"sales"."invoice_no"'), "invoice_no"],
        [Sequelize.col('"sales"."lot_no"'), "lot_no"],
        [Sequelize.fn('STRING_AGG', Sequelize.literal('DISTINCT "bale->ginprocess"."reel_lot_no"'), ',' ) , "reel_lot_no"],
        [Sequelize.literal('"sales"."rate"'), "rate"],
        [Sequelize.literal('"sales"."candy_rate"'), "candy_rate"],
        [Sequelize.literal('"sales"."total_qty"'), "lint_quantity"],
        [Sequelize.literal('"sales"."no_of_bales"'), "no_of_bales"],
        [Sequelize.literal('"sales"."sale_value"'), "sale_value"],
        [Sequelize.literal('"sales"."press_no"'), "press_no"],
        [Sequelize.literal('"sales"."qty_stock"'), "qty_stock"],
        [Sequelize.literal('"sales"."vehicle_no"'), "vehicle_no"],
        [Sequelize.literal('"sales"."status"'), "status"],
      ],
      where: whereCondition,
      include: [
        {
          model: GinSales,
          as: "sales",
          include: include,
          attributes: [],
        },
        {
          model: GinBale,
          attributes: [],
          as: "bale",
          include: [
            {
              model: GinProcess,
              as: "ginprocess",
              attributes: [],
            },
          ],
        },
      ],
      group: [
        "sales.id",
        "sales.season.id",
        "sales.ginner.id",
        "sales.buyerdata.id",
        "sales.program.id",
      ],
      order: [["sales_id", "desc"]],
      offset: offset,
      limit: limit,
    });

    // Append data to worksheet
    for await (const [index, item] of rows.entries()) {
      const rowValues = Object.values({
        index: index + 1,
        date: item.dataValues.date ? item.dataValues.date : "",
        season: item.dataValues.season_name ? item.dataValues.season_name : "",
        ginner: item.dataValues.ginner ? item.dataValues.ginner : "",
        spinner: item.dataValues.spinner ? item.dataValues.spinner : "",
        invoice: item.dataValues.invoice_no ? item.dataValues.invoice_no : "",
        no_of_bales: item.dataValues.no_of_bales
          ? item.dataValues.no_of_bales
          : "",
        lot_no: item.dataValues.lot_no ? item.dataValues.lot_no : "",
        reel_lot_no: item.dataValues.reel_lot_no
          ? item.dataValues.reel_lot_no
          : "",
        total_qty: item.dataValues.lint_quantity
          ? item.dataValues.lint_quantity
          : "",
        actual_qty: item.dataValues.lint_quantity
          ? item.dataValues.lint_quantity
          : "",
        program: item.dataValues.program ? item.dataValues.program : "",
        village: item.dataValues.vehicle_no ? item.dataValues.vehicle_no : ""
      });
      worksheet.addRow(rowValues);
    }
    // Auto-adjust column widths based on content
    worksheet.columns.forEach((column: any) => {
      let maxCellLength = 0;
      column.eachCell({ includeEmpty: true }, (cell: any) => {
        const cellLength = (cell.value ? cell.value.toString() : "").length;
        maxCellLength = Math.max(maxCellLength, cellLength);
      });
      column.width = Math.min(20, maxCellLength + 2); // Limit width to 30 characters
    });

    // Save the workbook
    await workbook.xlsx.writeFile(excelFilePath);
    res.status(200).send({
      success: true,
      messgage: "File successfully Generated",
      data: process.env.BASE_URL + "excel-Spinner-Pending-Bales-Receipt-Report.xlsx",
    });
    }
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message);
  }
};

const fetchSpinnerYarnProcessPagination = async (
  req: Request,
  res: Response
) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { spinnerId, seasonId, programId, brandId, countryId, startDate, endDate }: any = req.query;
  const offset = (page - 1) * limit;
  const whereConditions: any = [];
  try {
    if (searchTerm) {
      whereConditions.push(`
        (
          spinner.name ILIKE '%${searchTerm}%' OR
          season.name ILIKE '%${searchTerm}%' OR
          program.program_name ILIKE '%${searchTerm}%' OR
          spin_process.yarn_type ILIKE '%${searchTerm}%' OR
          spin_process.reel_lot_no ILIKE '%${searchTerm}%' OR
          spin_process.batch_lot_no ILIKE '%${searchTerm}%' OR
          spin_process.box_id ILIKE '%${searchTerm}%'
        )
      `);
    }
    
    if (spinnerId) {
      const idArray = spinnerId.split(",").map((id: any) => parseInt(id, 10));
      whereConditions.push(`spin_process.spinner_id IN (${idArray.join(',')})`);
    }
    
    if (brandId) {
      const idArray = brandId.split(",").map((id: any) => parseInt(id, 10));
      whereConditions.push(`spinner.brand && ARRAY[${idArray.join(',')}]`);
    }
    
    if (countryId) {
      const idArray = countryId.split(",").map((id: any) => parseInt(id, 10));
      whereConditions.push(`spinner.country_id IN (${idArray.join(',')})`);
    }
    
    if (seasonId) {
      const idArray = seasonId.split(",").map((id: any) => parseInt(id, 10));
      whereConditions.push(`spin_process.season_id IN (${idArray.join(',')})`);
    }
    
    if (programId) {
      const idArray = programId.split(",").map((id: any) => parseInt(id, 10));
      whereConditions.push(`spin_process.program_id IN (${idArray.join(',')})`);
    }
    
    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereConditions.push(`spin_process."createdAt" BETWEEN '${startOfDay.toISOString()}' AND '${endOfDay.toISOString()}'`);
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count query
    const countQuery = `
    SELECT COUNT(*) AS total_count
    FROM spin_processes spin_process
    LEFT JOIN spinners spinner ON spin_process.spinner_id = spinner.id
    LEFT JOIN seasons season ON spin_process.season_id = season.id
    LEFT JOIN programs program ON spin_process.program_id = program.id
    ${whereClause}
    `;

    // Data query
    const dataQuery = `
    WITH spin_process_data AS (
      SELECT
        spin_process.id AS process_id,
        spin_process.date,
        spin_process."createdAt",
        season.name AS season_name,
        spinner.name AS spinner_name,
        spin_process.batch_lot_no,
        spin_process.reel_lot_no,
        spin_process.yarn_type,
        spin_process.yarn_count,
        spin_process.other_mix,
        spin_process.cottonmix_type,
        spin_process.cottonmix_qty,
        spin_process.no_of_boxes,
        spin_process.total_qty,
        spin_process.net_yarn_qty,
        spin_process.qty_stock,
        spin_process.comber_noil,
        spin_process.comber_noil_stock,
        spin_process.yarn_realisation,
        spin_process.yarn_qty_produced,
        spin_process.accept_date,
        spin_process.qr,
        program.program_name AS program
      FROM
        spin_processes spin_process
      LEFT JOIN
        spinners spinner ON spin_process.spinner_id = spinner.id
      LEFT JOIN
        seasons season ON spin_process.season_id = season.id
      LEFT JOIN
        programs program ON spin_process.program_id = program.id
      ${whereClause}
    ),
    cotton_consumed_data AS (
      SELECT
        process_id,
        COALESCE(SUM(qty_used), 0) AS cotton_consumed
      FROM
        lint_selections
      GROUP BY
        process_id
    ),
    yarn_sold_data AS (
      SELECT
        spin_process_id,
        COALESCE(SUM(qty_used), 0) AS yarn_sold
      FROM
        spin_process_yarn_selections
      GROUP BY
        spin_process_id
    ),
    yarn_count_data AS (
      SELECT
        spin_process.id AS process_id,
        STRING_AGG(DISTINCT "yarn_count"."yarnCount_name", ',') AS yarncount
      FROM
        spin_processes spin_process
      LEFT JOIN
        yarn_counts yarn_count ON yarn_count.id = ANY(spin_process.yarn_count)
      GROUP BY
        spin_process.id
    )
    SELECT
      spd.*,
      COALESCE(ccd.cotton_consumed, 0) AS cotton_consumed,
      COALESCE(ysd.yarn_sold, 0) AS yarn_sold,
      ycd.yarncount
    FROM
      spin_process_data spd
    LEFT JOIN
      cotton_consumed_data ccd ON spd.process_id = ccd.process_id
    LEFT JOIN
      yarn_sold_data ysd ON spd.process_id = ysd.spin_process_id
    LEFT JOIN
      yarn_count_data ycd ON spd.process_id = ycd.process_id
    ORDER BY
      spd.process_id DESC
    LIMIT :limit OFFSET :offset
    `;

    // Execute the queries
    const [countResult, rows] = await Promise.all([
    sequelize.query(countQuery, {
      type: sequelize.QueryTypes.SELECT,
    }),
    sequelize.query(dataQuery, {
      replacements: { limit, offset },
      type: sequelize.QueryTypes.SELECT,
    })
    ]);

    const totalCount = countResult && countResult.length > 0 ?  countResult[0].total_count : 0;

    return res.sendPaginationSuccess(res, rows, totalCount);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};


const exportSpinnerYarnProcess = async (req: Request, res: Response) => {
  // spinner_yarn_process_load
  const excelFilePath = path.join("./upload", "excel-spinner-yarn-process.xlsx");

  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { exportType, spinnerId, seasonId, programId, brandId, countryId, startDate, endDate }: any = req.query;
  const offset = (page - 1) * limit;
  const whereConditions: any = [];
  try {

    if (exportType === "all") {
      return res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "spinner-yarn-process.xlsx",
      });
    } else {

      if (searchTerm) {
        whereConditions.push(`
          (
            spinner.name ILIKE '%${searchTerm}%' OR
            season.name ILIKE '%${searchTerm}%' OR
            program.program_name ILIKE '%${searchTerm}%' OR
            spin_process.yarn_type ILIKE '%${searchTerm}%' OR
            spin_process.reel_lot_no ILIKE '%${searchTerm}%' OR
            spin_process.batch_lot_no ILIKE '%${searchTerm}%' OR
            spin_process.box_id ILIKE '%${searchTerm}%'
          )
        `);
      }
      
      if (spinnerId) {
        const idArray = spinnerId.split(",").map((id: any) => parseInt(id, 10));
        whereConditions.push(`spin_process.spinner_id IN (${idArray.join(',')})`);
      }
      
      if (brandId) {
        const idArray = brandId.split(",").map((id: any) => parseInt(id, 10));
        whereConditions.push(`spinner.brand && ARRAY[${idArray.join(',')}]`);
      }
      
      if (countryId) {
        const idArray = countryId.split(",").map((id: any) => parseInt(id, 10));
        whereConditions.push(`spinner.country_id IN (${idArray.join(',')})`);
      }
      
      if (seasonId) {
        const idArray = seasonId.split(",").map((id: any) => parseInt(id, 10));
        whereConditions.push(`spin_process.season_id IN (${idArray.join(',')})`);
      }
      
      if (programId) {
        const idArray = programId.split(",").map((id: any) => parseInt(id, 10));
        whereConditions.push(`spin_process.program_id IN (${idArray.join(',')})`);
      }
      
      if (startDate && endDate) {
        const startOfDay = new Date(startDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(endDate);
        endOfDay.setUTCHours(23, 59, 59, 999);
        whereConditions.push(`spin_process."createdAt" BETWEEN '${startOfDay.toISOString()}' AND '${endOfDay.toISOString()}'`);
      }
      
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    worksheet.mergeCells("A1:S1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Spinner Yarn Process Report";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.",
      "Date",
      "Season",
      "Spinner Name",
      "Spin Lot No",
      "Yarn Reel Lot No",
      "Yarn Type",
      "Yarn Count",
      "Yarn Realisation %",
      "Comber Noil (Kgs)",
      "Blend Material",
      "Blend Quantity (Kgs)",
      "Total Lint cotton consumed (Kgs)",
      "Program",
      "Total Yarn weight (Kgs)",
      "Total yarn sold (Kgs)",
      "Total Yarn in stock (Kgs)",
    ]);
    headerRow.font = { bold: true };

    let include = [
      {
        model: Spinner,
        as: "spinner",
        attributes: ["id", "name"],
      },
      {
        model: Season,
        attributes: ["id", "name"],
        as: "season",
      },
      {
        model: Program,
        as: "program",
        attributes: ["id", "program_name"],
      },
      // {
      //     model: YarnCount,
      //     as: "yarncount",
      //     attributes: ["id","yarnCount_name"]
      // }
    ];

    const dataQuery = `
    WITH spin_process_data AS (
      SELECT
        spin_process.id AS process_id,
        spin_process.date,
        spin_process."createdAt",
        season.name AS season_name,
        spinner.name AS spinner_name,
        spin_process.batch_lot_no,
        spin_process.reel_lot_no,
        spin_process.yarn_type,
        spin_process.yarn_count,
        spin_process.other_mix,
        spin_process.cottonmix_type,
        spin_process.cottonmix_qty,
        spin_process.no_of_boxes,
        spin_process.total_qty,
        spin_process.net_yarn_qty,
        spin_process.qty_stock,
        spin_process.comber_noil,
        spin_process.comber_noil_stock,
        spin_process.yarn_realisation,
        spin_process.yarn_qty_produced,
        spin_process.accept_date,
        spin_process.qr,
        program.program_name AS program
      FROM
        spin_processes spin_process
      LEFT JOIN
        spinners spinner ON spin_process.spinner_id = spinner.id
      LEFT JOIN
        seasons season ON spin_process.season_id = season.id
      LEFT JOIN
        programs program ON spin_process.program_id = program.id
      ${whereClause}
    ),
    cotton_consumed_data AS (
      SELECT
        process_id,
        COALESCE(SUM(qty_used), 0) AS cotton_consumed
      FROM
        lint_selections
      GROUP BY
        process_id
    ),
    yarn_sold_data AS (
      SELECT
        spin_process_id,
        COALESCE(SUM(qty_used), 0) AS yarn_sold
      FROM
        spin_process_yarn_selections
      GROUP BY
        spin_process_id
    ),
    yarn_count_data AS (
      SELECT
        spin_process.id AS process_id,
        STRING_AGG(DISTINCT "yarn_count"."yarnCount_name", ',') AS yarncount
      FROM
        spin_processes spin_process
      LEFT JOIN
        yarn_counts yarn_count ON yarn_count.id = ANY(spin_process.yarn_count)
      GROUP BY
        spin_process.id
    )
    SELECT
      spd.*,
      COALESCE(ccd.cotton_consumed, 0) AS cotton_consumed,
      COALESCE(ysd.yarn_sold, 0) AS yarn_sold,
      ycd.yarncount
    FROM
      spin_process_data spd
    LEFT JOIN
      cotton_consumed_data ccd ON spd.process_id = ccd.process_id
    LEFT JOIN
      yarn_sold_data ysd ON spd.process_id = ysd.spin_process_id
    LEFT JOIN
      yarn_count_data ycd ON spd.process_id = ycd.process_id
    ORDER BY
      spd.process_id DESC
    LIMIT :limit OFFSET :offset
    `;

    // Execute the queries
    const rows = await sequelize.query(dataQuery, {
      replacements: { limit, offset },
      type: sequelize.QueryTypes.SELECT,
    });
    // Append data to worksheet
    for await (const [index, item] of rows.entries()) {
      let blendValue = "";
      let blendqty = "";
      let yarnCount = "";

      if (item.cottonmix_type && item.cottonmix_type.length > 0) {
        let blend = await CottonMix.findAll({
          where: { id: { [Op.in]: item.cottonmix_type } },
        });
        for (let bl of blend) {
          blendValue += `${bl.cottonMix_name},`;
        }
        for (let obj of item.cottonmix_qty) {
          blendqty += `${obj},`;
        }
      }

      const rowValues = Object.values({
        index: index + 1,
        date: item.date ? item.date : "",
        season: item.season_name ? item.season_name : "",
        spinner: item.spinner_name ? item.spinner_name : "",
        lotNo: item.batch_lot_no ? item.batch_lot_no : "",
        reel_lot_no: item.reel_lot_no ? item.reel_lot_no : "",
        yarnType: item.yarn_type ? item.yarn_type : "",
        count: item.yarncount ? item.yarncount : "",
        resa: item.yarn_realisation ? Number(item.yarn_realisation) : 0,
        comber: item.comber_noil ? Number(item.comber_noil) : 0,
        blend: blendValue,
        blendqty: blendqty,
        cotton_consumed: item?.cotton_consumed
          ? Number(item?.cotton_consumed)
          : 0,
        program: item.program ? item.program : "",
        total: item.net_yarn_qty ? Number(item.net_yarn_qty) : 0,
        yarn_sold: item?.yarn_sold
        ? Number(item?.yarn_sold)
        : 0,
        yarn_stock: item.qty_stock ? Number(item.qty_stock) : 0,
      });
      worksheet.addRow(rowValues);
    }

    // Auto-adjust column widths based on content
    worksheet.columns.forEach((column: any) => {
      let maxCellLength = 0;
      column.eachCell({ includeEmpty: true }, (cell: any) => {
        const cellLength = (cell.value ? cell.value.toString() : "").length;
        maxCellLength = Math.max(maxCellLength, cellLength);
      });
      column.width = Math.min(14, maxCellLength + 2); // Limit width to 30 characters
    });

    // Save the workbook
    await workbook.xlsx.writeFile(excelFilePath);
    res.status(200).send({
      success: true,
      messgage: "File successfully Generated",
      data: process.env.BASE_URL + "excel-spinner-yarn-process.xlsx",
    });
  }
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

const fetchSpinSalesPagination = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { spinnerId, seasonId, programId, brandId, countryId, startDate, endDate }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$sales.spinner.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.weaver.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.knitter.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.order_ref$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.box_ids$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.invoice_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.batch_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.transporter_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.vehicle_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.transaction_agent$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$process.reel_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    if (spinnerId) {
      const idArray: number[] = spinnerId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.spinner_id$"] = { [Op.in]: idArray };
    }
    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.spinner.brand$"] = { [Op.overlap]: idArray };
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.spinner.country_id$"] = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.season_id$"] = { [Op.in]: idArray };
    }

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.program_id$"] = { [Op.in]: idArray };
    }

    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereCondition.createdAt = { [Op.between]: [startOfDay, endOfDay] }
  }

    let include = [
      {
        model: Spinner,
        as: "spinner",
        attributes: ["id", "name"],
      },
      {
        model: Season,
        as: "season",
        attributes: ["id", "name"],
      },
      {
        model: Program,
        as: "program",
        attributes: ["id", "program_name"],
      },
      {
        model: Weaver,
        as: "weaver",
        attributes: ["id", "name"],
      },
      {
        model: Knitter,
        as: "knitter",
        attributes: ["id", "name"],
      },
    ];
    //fetch data with pagination

    const { count, rows }: any = await SpinProcessYarnSelection.findAndCountAll(
      {
        attributes: [
          [Sequelize.literal('"sales"."id"'), "sales_id"],
          [Sequelize.literal('"sales"."date"'), "date"],
          [Sequelize.literal('"sales"."createdAt"'), "createdAt"],
          [Sequelize.col('"sales"."season"."name"'), "season_name"],
          [Sequelize.col('"sales"."season"."id"'), "season_id"],
          [Sequelize.col('"sales"."spinner"."id"'), "spinner_id"],
          [Sequelize.col('"sales"."spinner"."name"'), "spinner"],
          [Sequelize.col('"sales"."program"."program_name"'), "program"],
          [Sequelize.col('"sales"."order_ref"'), "order_ref"],
          [Sequelize.col('"sales"."buyer_type"'), "buyer_type"],
          [Sequelize.col('"sales"."buyer_id"'), "buyer_id"],
          [Sequelize.col('"sales"."knitter_id"'), "knitter_id"],
          [Sequelize.col('"sales"."knitter"."name"'), "knitter"],
          [Sequelize.col('"sales"."weaver"."name"'), "weaver"],
          [Sequelize.col('"sales"."processor_name"'), "processor_name"],
          [Sequelize.col('"sales"."processor_address"'), "processor_address"],
          [Sequelize.literal('"sales"."total_qty"'), "total_qty"],
          [Sequelize.literal('"sales"."invoice_no"'), "invoice_no"],
          [Sequelize.literal('"sales"."batch_lot_no"'), "batch_lot_no"],
          [Sequelize.fn('STRING_AGG', Sequelize.literal('DISTINCT "process"."reel_lot_no"'), ', ' ) , "reel_lot_no"],
          [Sequelize.literal('"sales"."no_of_boxes"'), "no_of_boxes"],
          [Sequelize.literal('"sales"."price"'), "price"],
          [
            Sequelize.fn(
              "COALESCE",
              sequelize.fn("SUM", Sequelize.col("qty_used")),
              0
            ),
            "yarn_weight",
          ],
          [Sequelize.literal('"sales"."box_ids"'), "box_ids"],
          [Sequelize.literal('"sales"."yarn_type"'), "yarn_type"],
          [Sequelize.literal('"sales"."yarn_count"'), "yarn_count"],
          [Sequelize.literal('"sales"."quality_doc"'), "quality_doc"],
          [Sequelize.literal('"sales"."tc_files"'), "tc_files"],
          [Sequelize.literal('"sales"."contract_file"'), "contract_file"],
          [Sequelize.literal('"sales"."invoice_file"'), "invoice_file"],
          [Sequelize.literal('"sales"."delivery_notes"'), "delivery_notes"],
          [Sequelize.literal('"sales"."transporter_name"'), "transporter_name"],
          [Sequelize.literal('"sales"."vehicle_no"'), "vehicle_no"],
          [Sequelize.literal('"sales"."qr"'), "qr"],
          [
            Sequelize.literal('"sales"."transaction_agent"'),
            "transaction_agent",
          ],
          [Sequelize.literal('"sales"."qty_stock"'), "qty_stock"],
          [Sequelize.literal('"sales"."status"'), "status"],
        ],
        where: whereCondition,
        include: [
          {
            model: SpinSales,
            as: "sales",
            include: include,
            attributes: [],
          },
          {
            model: SpinProcess,
            attributes: [],
            as: "process",
          },
        ],
        group: [
          "sales.id",
          "sales.season.id",
          "sales.spinner.id",
          "sales.weaver.id",
          "sales.knitter.id",
          "sales.program.id",
        ],
        order: [["sales_id", "desc"]],
        offset: offset,
        limit: limit,
      }
    );
    let data = [];

    for await (let row of rows) {
      let yarnCount : string = "";
  
      if (row.dataValues?.yarn_count && row.dataValues.yarn_count?.length > 0){
       yarnCount = await YarnCount.findAll({
        where: {
          id: {
            [Op.in]: row.dataValues?.yarn_count,
          },
        },
        attributes: ["yarnCount_name"],
      });
    }
      data.push({
        ...row.dataValues,
        yarnCount,
      });
    }

    return res.sendPaginationSuccess(res, data, count?.length);
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message);
  }
};

const exportSpinnerSale = async (req: Request, res: Response) => {

  // spinner_yarn_sales_load
  const excelFilePath = path.join("./upload", "excel-spinner-yarn-sale.xlsx");
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { exportType, spinnerId, seasonId, programId, brandId, countryId, startDate, endDate }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {

    if (exportType === "all") {
      return res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "spinner-yarn-sale.xlsx",
      });
    } else {

      if (searchTerm) {
        whereCondition[Op.or] = [
          { "$sales.spinner.name$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$sales.season.name$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$sales.program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$sales.weaver.name$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$sales.knitter.name$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$sales.order_ref$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$sales.box_ids$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$sales.invoice_no$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$sales.batch_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$sales.transporter_name$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$sales.vehicle_no$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$sales.transaction_agent$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$process.reel_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
        ];
      }
      if (spinnerId) {
        const idArray: number[] = spinnerId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$sales.spinner_id$"] = { [Op.in]: idArray };
      }
      if (brandId) {
        const idArray: number[] = brandId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$sales.spinner.brand$"] = { [Op.overlap]: idArray };
      }
  
      if (countryId) {
        const idArray: number[] = countryId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$sales.spinner.country_id$"] = { [Op.in]: idArray };
      }
  
      if (seasonId) {
        const idArray: number[] = seasonId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$sales.season_id$"] = { [Op.in]: idArray };
      }
  
      if (programId) {
        const idArray: number[] = programId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$sales.program_id$"] = { [Op.in]: idArray };
      }

    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereCondition.createdAt = { [Op.between]: [startOfDay, endOfDay] }
  }

      // Create the excel workbook file
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet1");
      worksheet.mergeCells("A1:Q1");
      const mergedCell = worksheet.getCell("A1");
      mergedCell.value = "CottonConnect | Spinner Yarn Sales Report";
      mergedCell.font = { bold: true };
      mergedCell.alignment = { horizontal: "center", vertical: "middle" };
      // Set bold font for header row
      const headerRow = worksheet.addRow([
        "Sr No.",
        "Date",
        "Season",
        "Spinner Name",
        "Knitter/Weaver Name",
        "Invoice Number",
        "Order Reference",
        "Lot/Batch Number",
        "Reel Lot No",
        "Yarn Type",
        "Yarn Count",
        "No of Boxes",
        "Box ID",
        "price",
        "Yarn Net Weight(Kgs)",
        "Transporter Name",
        "Vehicle No",
        "Agent Details",
      ]);
      headerRow.font = { bold: true };

    let include = [
      {
        model: Spinner,
        as: "spinner",
        attributes: ["id", "name"],
      },
      {
        model: Season,
        as: "season",
        attributes: ["id", "name"],
      },
      {
        model: Program,
        as: "program",
        attributes: ["id", "program_name"],
      },
      {
        model: Weaver,
        as: "weaver",
        attributes: ["id", "name"],
      },
      {
        model: Knitter,
        as: "knitter",
        attributes: ["id", "name"],
      },
    ];

    const { count, rows }: any = await SpinProcessYarnSelection.findAndCountAll(
      {
        attributes: [
          [Sequelize.literal('"sales"."id"'), "sales_id"],
          [Sequelize.literal('"sales"."date"'), "date"],
          [Sequelize.literal('"sales"."createdAt"'), "createdAt"],
          [Sequelize.col('"sales"."season"."name"'), "season_name"],
          [Sequelize.col('"sales"."season"."id"'), "season_id"],
          [Sequelize.col('"sales"."spinner"."id"'), "spinner_id"],
          [Sequelize.col('"sales"."spinner"."name"'), "spinner"],
          [Sequelize.col('"sales"."program"."program_name"'), "program"],
          [Sequelize.col('"sales"."order_ref"'), "order_ref"],
          [Sequelize.col('"sales"."buyer_type"'), "buyer_type"],
          [Sequelize.col('"sales"."buyer_id"'), "buyer_id"],
          [Sequelize.col('"sales"."knitter_id"'), "knitter_id"],
          [Sequelize.col('"sales"."knitter"."name"'), "knitter"],
          [Sequelize.col('"sales"."weaver"."name"'), "weaver"],
          [Sequelize.col('"sales"."processor_name"'), "processor_name"],
          [Sequelize.col('"sales"."processor_address"'), "processor_address"],
          [Sequelize.literal('"sales"."total_qty"'), "total_qty"],
          [Sequelize.literal('"sales"."invoice_no"'), "invoice_no"],
          [Sequelize.literal('"sales"."batch_lot_no"'), "batch_lot_no"],
          [Sequelize.fn('STRING_AGG', Sequelize.literal('DISTINCT "process"."reel_lot_no"'), ',' ) , "reel_lot_no"],
          [Sequelize.literal('"sales"."no_of_boxes"'), "no_of_boxes"],
          [Sequelize.literal('"sales"."price"'), "price"],
          [
            Sequelize.fn(
              "COALESCE",
              sequelize.fn("SUM", Sequelize.col("qty_used")),
              0
            ),
            "yarn_weight",
          ],
          [Sequelize.literal('"sales"."box_ids"'), "box_ids"],
          [Sequelize.literal('"sales"."yarn_type"'), "yarn_type"],
          [Sequelize.literal('"sales"."yarn_count"'), "yarn_count"],
          [Sequelize.literal('"sales"."quality_doc"'), "quality_doc"],
          [Sequelize.literal('"sales"."tc_files"'), "tc_files"],
          [Sequelize.literal('"sales"."contract_file"'), "contract_file"],
          [Sequelize.literal('"sales"."invoice_file"'), "invoice_file"],
          [Sequelize.literal('"sales"."delivery_notes"'), "delivery_notes"],
          [Sequelize.literal('"sales"."transporter_name"'), "transporter_name"],
          [Sequelize.literal('"sales"."vehicle_no"'), "vehicle_no"],
          [Sequelize.literal('"sales"."qr"'), "qr"],
          [
            Sequelize.literal('"sales"."transaction_agent"'),
            "transaction_agent",
          ],
          [Sequelize.literal('"sales"."qty_stock"'), "qty_stock"],
          [Sequelize.literal('"sales"."status"'), "status"],
        ],
        where: whereCondition,
        include: [
          {
            model: SpinSales,
            as: "sales",
            include: include,
            attributes: [],
          },
          {
            model: SpinProcess,
            attributes: [],
            as: "process",
          },
        ],
        group: [
          "sales.id",
          "sales.season.id",
          "sales.spinner.id",
          "sales.weaver.id",
          "sales.knitter.id",
          "sales.program.id",
        ],
        order: [["sales_id", "desc"]],
        offset: offset,
        limit: limit,
      }
    );

      for await (const [index, item] of rows.entries()) {
        let yarnCount: string = "";
        let yarnTypeData: string = "";

      if (item.dataValues.yarn_count && item.dataValues.yarn_count?.length > 0) {
        let type = await YarnCount.findAll({
          where: { id: { [Op.in]: item.dataValues.yarn_count } },
        });
        for (let i of type) {
          yarnCount += `${i.yarnCount_name},`;
        }
      }

      yarnTypeData =
      item.dataValues?.yarn_type?.length > 0 ? item.dataValues?.yarn_type.join(",") : "";
        const rowValues = Object.values({
          index: index + 1,
          date: item.dataValues.date ? item.dataValues.date : "",
          season: item.dataValues.season_name ? item.dataValues.season_name : "",
          spinner: item.dataValues.spinner ? item.dataValues.spinner : "",
          buyer_id: item.dataValues.weaver
            ? item.dataValues.weaver
            : item.dataValues.knitter
              ? item.dataValues.knitter
              : item.dataValues.processor_name,
          invoice: item.dataValues.invoice_no ? item.dataValues.invoice_no : "",
          order_ref: item.dataValues.order_ref ? item.dataValues.order_ref : "",
          lotNo: item.dataValues.batch_lot_no ? item.dataValues.batch_lot_no : "",
          reelLot: item.dataValues.reel_lot_no ? item.dataValues.reel_lot_no : "",
          yarnType: yarnTypeData ? yarnTypeData : "",
          count: yarnCount
            ? yarnCount
            : "",
          boxes: item.dataValues.no_of_boxes ? item.dataValues.no_of_boxes : "",
          boxId: item.dataValues.box_ids ? item.dataValues.box_ids : "",
          price: item.dataValues.price ? item.dataValues.price : "",
          total: item.dataValues.total_qty ? item.dataValues.total_qty : 0,
          transporter_name: item.dataValues.transporter_name
            ? item.dataValues.transporter_name
            : "",
          vehicle_no: item.dataValues.vehicle_no
            ? item.dataValues.vehicle_no
            : "",
          agent: item.dataValues.transaction_agent
            ? item.dataValues.transaction_agent
            : "",
        });

        worksheet.addRow(rowValues);
      }

    // Auto-adjust column widths based on content
    worksheet.columns.forEach((column: any) => {
      let maxCellLength = 0;
      column.eachCell({ includeEmpty: true }, (cell: any) => {
        const cellLength = (cell.value ? cell.value.toString() : "").length;
        maxCellLength = Math.max(maxCellLength, cellLength);
      });
      column.width = Math.min(14, maxCellLength + 2); // Limit width to 30 characters
    });

    // Save the workbook
    await workbook.xlsx.writeFile(excelFilePath);
    res.status(200).send({
      success: true,
      messgage: "File successfully Generated",
      data: process.env.BASE_URL + "excel-spinner-yarn-sale.xlsx",
    });
    }
  }  catch (error: any) {
      console.log(error)
      return res.sendError(res, error.message);
  }
};

//fetch Knitter Yarn with filters
const fetchKnitterYarnPagination = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { knitterId, spinnerId, seasonId, programId, brandId, countryId, startDate, endDate }: any =
    req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$sales.spinner.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.weaver.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.knitter.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.order_ref$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.box_ids$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.invoice_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.batch_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
        // { "$sales.yarn_type$": { [Op.iLike]: `%${searchTerm}%` } },
        // {
        //   "$sales.yarncount.yarnCount_name$": { [Op.iLike]: `%${searchTerm}%` },
        // },
        { "$process.reel_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    if (spinnerId) {
      const idArray: number[] = spinnerId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.spinner_id$"] = { [Op.in]: idArray };
    }
    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.knitter.brand$"] = { [Op.overlap]: idArray };
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.knitter.country_id$"] = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.season_id$"] = { [Op.in]: idArray };
    }

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.program_id$"] = { [Op.in]: idArray };
    }

    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereCondition.createdAt = { [Op.between]: [startOfDay, endOfDay] }
  }

    whereCondition["$sales.knitter_id$"] = { [Op.ne]: null };
    whereCondition["$sales.status$"] = "Sold";

    if (knitterId) {
      const idArray: number[] = knitterId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.knitter_id$"] = { [Op.in]: idArray };
    }

    let include = [
      {
        model: Spinner,
        as: "spinner",
        attributes: ["id", "name"],
      },
      {
        model: Season,
        as: "season",
        attributes: ["id", "name"],
      },
      {
        model: Program,
        as: "program",
        attributes: ["id", "program_name"],
      },
      // {
      //   model: YarnCount,
      //   as: "yarncount",
      //   attributes: ["id", "yarnCount_name"],
      // },
      {
        model: Weaver,
        as: "weaver",
        attributes: ["id", "name"],
      },
      {
        model: Knitter,
        as: "knitter",
        attributes: ["id", "name"],
      },
    ];
    //fetch data with pagination

    const { count, rows }: any = await SpinProcessYarnSelection.findAndCountAll(
      {
        attributes: [
          [Sequelize.literal('"sales"."id"'), "sales_id"],
          [Sequelize.literal('"sales"."date"'), "date"],
          [Sequelize.literal('"sales"."accept_date"'), "accept_date"],
          [Sequelize.literal('"sales"."createdAt"'), "createdAt"],
          [Sequelize.col('"sales"."season"."name"'), "season_name"],
          [Sequelize.col('"sales"."season"."id"'), "season_id"],
          [Sequelize.col('"sales"."spinner"."id"'), "spinner_id"],
          [Sequelize.col('"sales"."spinner"."name"'), "spinner"],
          [Sequelize.col('"sales"."program"."program_name"'), "program"],
          [Sequelize.col('"sales"."order_ref"'), "order_ref"],
          [Sequelize.col('"sales"."buyer_type"'), "buyer_type"],
          [Sequelize.col('"sales"."buyer_id"'), "buyer_id"],
          [Sequelize.col('"sales"."knitter_id"'), "knitter_id"],
          [Sequelize.col('"sales"."knitter"."name'), "knitter"],
          [Sequelize.col('"sales"."weaver"."name'), "weaver"],
          [Sequelize.literal('"sales"."total_qty"'), "total_qty"],
          [Sequelize.literal('"sales"."invoice_no"'), "invoice_no"],
          [Sequelize.literal('"sales"."batch_lot_no"'), "batch_lot_no"],
          // [Sequelize.literal('"process"."reel_lot_no"'), "reel_lot_no"],
          [Sequelize.fn('STRING_AGG', Sequelize.literal('DISTINCT "process"."reel_lot_no"'), ', ' ) , "reel_lot_no"],
          [Sequelize.literal('"sales"."no_of_boxes"'), "no_of_boxes"],
          // [Sequelize.literal("qty_used"), "yarn_weight"],
          [
            sequelize.fn(
              "COALESCE",
              sequelize.fn("SUM", sequelize.col("qty_used")),
              0
            ),
            "yarn_weight",
          ],
          [Sequelize.literal('"sales"."box_ids"'), "box_ids"],
          [Sequelize.literal('"sales"."yarn_type"'), "yarn_type"],
          [Sequelize.literal('"sales"."yarn_count"'), "yarn_count"],
          [Sequelize.literal('"sales"."quality_doc"'), "quality_doc"],
          [Sequelize.literal('"sales"."tc_files"'), "tc_files"],
          [Sequelize.literal('"sales"."contract_file"'), "contract_file"],
          [Sequelize.literal('"sales"."invoice_file"'), "invoice_file"],
          [Sequelize.literal('"sales"."delivery_notes"'), "delivery_notes"],
          [Sequelize.literal('"sales"."transporter_name"'), "transporter_name"],
          [Sequelize.literal('"sales"."vehicle_no"'), "vehicle_no"],
          [Sequelize.literal('"sales"."qr"'), "qr"],
          [
            Sequelize.literal('"sales"."transaction_agent"'),
            "transaction_agent",
          ],
          [Sequelize.literal('"sales"."qty_stock"'), "qty_stock"],
          [Sequelize.literal('"sales"."status"'), "status"],
        ],
        where: whereCondition,
        include: [
          {
            model: SpinSales,
            as: "sales",
            include: include,
            attributes: [],
          },
          {
            model: SpinProcess,
            attributes: [],
            as: "process",
          },
        ],
        group: [
          "sales.id",
          "sales.season.id",
          "sales.spinner.id",
          "sales.weaver.id",
          "sales.knitter.id",
          "sales.program.id",
        ],
        order: [["sales_id", "desc"]],
        offset: offset,
        limit: limit,
      }
    );

    const data = [];
    for await (let row of rows) {

      const yarnCountIds = row.dataValues.yarn_count?.map(Number);
    
      const yarncount = await YarnCount.findAll({
        where: {
          id: {
            [Op.in]: yarnCountIds,
          },
        },
        attributes: ["yarnCount_name"],
      });
    
      const yarnCountNames = yarncount?.map((yc:any) => yc.yarnCount_name);
    
      data.push({
        ...row.dataValues,
        yarnCount_names: yarnCountNames, 
      });
    }
    return res.sendPaginationSuccess(res, data, count.length);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};


const exportKnitterYarn = async (req: Request, res: Response) => {
  // knitter_yarn_receipt_load
  await ExportData.update({
    knitter_yarn_receipt_load: true
  }, { where: { knitter_yarn_receipt_load: false } })
  res.send({ status: 200, message: "export file processing" })
  const excelFilePath = path.join("./upload", "knitter-yarn-receipt.xlsx");
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { knitterId, spinnerId, seasonId, programId, brandId, countryId, startDate, endDate }: any =
    req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$sales.spinner.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.weaver.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.knitter.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.order_ref$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.box_ids$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.invoice_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.batch_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
        // { "$sales.yarn_type$": { [Op.iLike]: `%${searchTerm}%` } },
        // {
        //   "$sales.yarncount.yarnCount_name$": { [Op.iLike]: `%${searchTerm}%` },
        // },
        { "$process.reel_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    if (spinnerId) {
      const idArray: number[] = spinnerId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.spinner_id$"] = { [Op.in]: idArray };
    }
    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.knitter.brand$"] = { [Op.overlap]: idArray };
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.knitter.country_id$"] = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.season_id$"] = { [Op.in]: idArray };
    }

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.program_id$"] = { [Op.in]: idArray };
    }
    whereCondition["$sales.knitter_id$"] = { [Op.ne]: null };
    whereCondition["$sales.status$"] = "Sold";

    if (knitterId) {
      const idArray: number[] = knitterId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.knitter_id$"] = { [Op.in]: idArray };
    }

    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereCondition.createdAt = { [Op.between]: [startOfDay, endOfDay] }
  }
    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    worksheet.mergeCells("A1:L1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Knitter Yarn Receipt Report";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.",
      "Date of Transaction Receipt",
      "Date",
      "Spinner Name",
      "Knitter Unit Name",
      "Invoice Number",
      "Lot/Batch Number",
      "Yarn Reel No",
      "Yarn Count",
      "No of Boxes",
      "Box ID",
      "Net Weight(Kgs)",
    ]);
    headerRow.font = { bold: true };
    let include = [
      {
        model: Spinner,
        as: "spinner",
        attributes: ["id", "name"],
      },
      {
        model: Season,
        as: "season",
        attributes: ["id", "name"],
      },
      {
        model: Program,
        as: "program",
        attributes: ["id", "program_name"],
      },
      // {
      //   model: YarnCount,
      //   as: "yarncount",
      //   attributes: ["id", "yarnCount_name"],
      // },
      {
        model: Weaver,
        as: "weaver",
        attributes: ["id", "name"],
      },
      {
        model: Knitter,
        as: "knitter",
        attributes: ["id", "name"],
      },
    ];
    const { count, rows }: any = await SpinProcessYarnSelection.findAndCountAll(
      {
        attributes: [
          [Sequelize.literal('"sales"."id"'), "sales_id"],
          [Sequelize.literal('"sales"."date"'), "date"],
          [Sequelize.literal('"sales"."accept_date"'), "accept_date"],
          [Sequelize.col('"sales"."season"."name"'), "season_name"],
          [Sequelize.col('"sales"."season"."id"'), "season_id"],
          [Sequelize.col('"sales"."spinner"."id"'), "spinner_id"],
          [Sequelize.col('"sales"."spinner"."name"'), "spinner"],
          [Sequelize.col('"sales"."program"."program_name"'), "program"],
          [Sequelize.col('"sales"."order_ref"'), "order_ref"],
          [Sequelize.col('"sales"."buyer_type"'), "buyer_type"],
          [Sequelize.col('"sales"."buyer_id"'), "buyer_id"],
          [Sequelize.col('"sales"."knitter_id"'), "knitter_id"],
          [Sequelize.col('"sales"."knitter"."name'), "knitter"],
          [Sequelize.col('"sales"."weaver"."name'), "weaver"],
          [Sequelize.literal('"sales"."total_qty"'), "total_qty"],
          [Sequelize.literal('"sales"."invoice_no"'), "invoice_no"],
          [Sequelize.literal('"sales"."batch_lot_no"'), "batch_lot_no"],
          [Sequelize.fn('STRING_AGG', Sequelize.literal('DISTINCT "process"."reel_lot_no"'), ', ' ) , "reel_lot_no"],
          [Sequelize.literal('"sales"."no_of_boxes"'), "no_of_boxes"],
          // [Sequelize.literal('"process"."qty_used"'), 'yarn_weight'],
          [
            sequelize.fn(
              "COALESCE",
              sequelize.fn("SUM", sequelize.col("qty_used")),
              0
            ),
            "yarn_weight",
          ],
          [Sequelize.literal('"sales"."box_ids"'), "box_ids"],
          [Sequelize.literal('"sales"."yarn_type"'), "yarn_type"],
          [Sequelize.literal('"sales"."yarn_count"'), "yarn_count"],
          // [
          //   Sequelize.col('"sales"."yarncount".yarnCount_name'),
          //   "yarnCount_name",
          // ],
          [Sequelize.literal('"sales"."quality_doc"'), "quality_doc"],
          [Sequelize.literal('"sales"."tc_files"'), "tc_files"],
          [Sequelize.literal('"sales"."contract_file"'), "contract_file"],
          [Sequelize.literal('"sales"."invoice_file"'), "invoice_file"],
          [Sequelize.literal('"sales"."delivery_notes"'), "delivery_notes"],
          [Sequelize.literal('"sales"."transporter_name"'), "transporter_name"],
          [Sequelize.literal('"sales"."vehicle_no"'), "vehicle_no"],
          [Sequelize.literal('"sales"."qr"'), "qr"],
          [
            Sequelize.literal('"sales"."transaction_agent"'),
            "transaction_agent",
          ],
          [Sequelize.literal('"sales"."qty_stock"'), "qty_stock"],
          [Sequelize.literal('"sales"."status"'), "status"],
        ],
        where: whereCondition,
        include: [
          {
            model: SpinSales,
            as: "sales",
            include: include,
            attributes: [],
          },
          {
            model: SpinProcess,
            attributes: [],
            as: "process",
          },
        ],
        group: [
          "sales.id",
          "sales.season.id",
          "sales.spinner.id",
          "sales.weaver.id",
          "sales.knitter.id",
          "sales.program.id",
        ],
        order: [["sales_id", "desc"]],
        // offset: offset,
        // limit: limit,
      }
    );

    // Append data to worksheet
    for await (const [index, item] of rows.entries()) {
      const yarnCountIds = rows.flatMap((row:any) => row.dataValues.yarn_count || []);
      const yarnCounts = await YarnCount.findAll({
        where: {
          id: { [Op.in]: yarnCountIds }
        },
        attributes: ["id", "yarnCount_name"]
      });

      const yarnCountMap = yarnCounts.reduce((map:any, yarnCount:any) => {
        map[yarnCount.id] = yarnCount.yarnCount_name;
        return map;
      }, {});
      const rowValues = Object.values({
        index: index + 1,
        accept_date: item.dataValues.accept_date
          ? item.dataValues.accept_date
          : "",
        date: item.dataValues.date ? item.dataValues.date : "",
        spinner: item.dataValues.spinner ? item.dataValues.spinner : "",
        buyer_id: item.dataValues.knitter ? item.dataValues.knitter : "",
        invoice: item.dataValues.invoice_no ? item.dataValues.invoice_no : "",
        lotNo: item.dataValues.batch_lot_no ? item.dataValues.batch_lot_no : "",
        reelLot: item.dataValues.reel_lot_no ? item.dataValues.reel_lot_no : "",
        count: item.dataValues.yarn_count.map((id: number) => yarnCountMap[id] || null).join(", "),
        boxes: item.dataValues.no_of_boxes ? item.dataValues.no_of_boxes : "",
        boxId: item.dataValues.box_ids ? item.dataValues.box_ids : "",
        total: item.dataValues.yarn_weight,
      });
      worksheet.addRow(rowValues);
    }
    // Auto-adjust column widths based on content
    worksheet.columns.forEach((column: any) => {
      let maxCellLength = 0;
      column.eachCell({ includeEmpty: true }, (cell: any) => {
        const cellLength = (cell.value ? cell.value.toString() : "").length;
        maxCellLength = Math.max(maxCellLength, cellLength);
      });
      column.width = Math.min(14, maxCellLength + 2); // Limit width to 30 characters
    });

    // Save the workbook
    await workbook.xlsx.writeFile(excelFilePath);
    // res.status(200).send({
    //   success: true,
    //   messgage: "File successfully Generated",
    //   data: process.env.BASE_URL + "knitter-yarn-receipt.xlsx",
    // });
    await ExportData.update({
      knitter_yarn_receipt_load: false
    }, { where: { knitter_yarn_receipt_load: true } })
  } catch (error: any) {
    (async () => {
      await ExportData.update({
        knitter_yarn_receipt_load: false
      }, { where: { knitter_yarn_receipt_load: true } })
    })()
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

const fetchKnitterYarnProcess = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const {
    knitterId,
    seasonId,
    programId,
    brandId,
    countryId,
    fabricType,
    startDate,
    endDate
  }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { garment_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { brand_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { blend_material: { [Op.iLike]: `%${searchTerm}%` } },
        { blend_vendor: { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$knitter.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { job_details_garment: { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }

    if (knitterId) {
      const idArray: number[] = knitterId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.knitter_id = { [Op.in]: idArray };
    }

    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$knitter.brand$"] = { [Op.overlap]: idArray };
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$knitter.country_id$"] = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.season_id = { [Op.in]: idArray };
    }

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.program_id = { [Op.in]: idArray };
    }

    if (fabricType) {
      const idArray: any[] = fabricType
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.fabric_type = { [Op.overlap]: idArray };
    }

    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereCondition.createdAt = { [Op.between]: [startOfDay, endOfDay] }
  }

    let include = [
      {
        model: Knitter,
        as: "knitter",
        attributes: ["id", "name", "address"],
      },
      {
        model: Season,
        as: "season",
        attributes: ["id", "name"],
      },
      {
        model: Program,
        as: "program",
        attributes: ["id", "program_name"],
      },
    ];

    const { count, rows } = await KnitProcess.findAndCountAll({
      where: whereCondition,
      include: include,
      order: [["id", "desc"]],
    });

    let data = [];

    for await (let row of rows) {
      if (row.dataValues?.fabric_type.length > 0) {
        for await (const [index, id] of row.dataValues?.fabric_type.entries()) {
          const fabrictype = await FabricType.findOne({
            where: {
              id: id,
            },
            attributes: ["id", "fabricType_name"],
          });

          data.push({
            ...row.dataValues,
            fabricType: fabrictype
              ? fabrictype.dataValues?.fabricType_name
              : "",
            fabricWeight:
              row.dataValues.fabric_weight &&
                row.dataValues.fabric_weight[index]
                ? row.dataValues.fabric_weight[index]
                : "",
            fabricGsm:
              row.dataValues.fabric_gsm && row.dataValues.fabric_gsm[index]
                ? row.dataValues.fabric_gsm[index]
                : "",
          });
        }
      }
    }

    let result = data.slice(offset, offset + limit);

    return res.sendPaginationSuccess(res, result, data.length);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

const exportKnitterYarnProcess = async (req: Request, res: Response) => {
  // knitter_yarn_process_load
  await ExportData.update({
    knitter_yarn_process_load: true
  }, { where: { knitter_yarn_process_load: false } })
  res.send({ status: 200, message: "export file processing" })
  const excelFilePath = path.join("./upload", "knitter-yarn-process.xlsx");
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const {
    knitterId,
    seasonId,
    programId,
    brandId,
    countryId,
    fabricType,
    startDate,
    endDate
  }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { garment_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { brand_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { blend_material: { [Op.iLike]: `%${searchTerm}%` } },
        { blend_vendor: { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$knitter.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { job_details_garment: { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }

    if (knitterId) {
      const idArray: number[] = knitterId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.knitter_id = { [Op.in]: idArray };
    }

    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$knitter.brand$"] = { [Op.overlap]: idArray };
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$knitter.country_id$"] = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.season_id = { [Op.in]: idArray };
    }

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.program_id = { [Op.in]: idArray };
    }

    if (fabricType) {
      const idArray: any[] = fabricType
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.fabric_type = { [Op.overlap]: idArray };
    }
    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereCondition.createdAt = { [Op.between]: [startOfDay, endOfDay] }
  }
    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    worksheet.mergeCells("A1:O1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Knitter Yarn Process Report";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.",
      "Date of Process",
      "Date",
      "Knitter Unit Name",
      "Garment order reference no.",
      "Brand reference no",
      "No. of Rolls",
      "Finished Batch/Lot No",
      "Fabric REEL Lot No.",
      "Fabric Type",
      "Finished Fabric Net weight",
      "Finished Fabric GSM ",
      "Job details from garment",
      "Total Yarn Utilized",
      "Total Fabric Net weight",
    ]);
    headerRow.font = { bold: true };

    let include = [
      {
        model: Knitter,
        as: "knitter",
        attributes: ["id", "name", "address"],
      },
      {
        model: Season,
        as: "season",
        attributes: ["id", "name"],
      },
      {
        model: Program,
        as: "program",
        attributes: ["id", "program_name"],
      },
    ];

    const { count, rows } = await KnitProcess.findAndCountAll({
      where: whereCondition,
      include: include,
      order: [["id", "desc"]],
    });

    let data = [];

    for await (let row of rows) {
      if (row.dataValues?.fabric_type.length > 0) {
        for await (const [index, id] of row.dataValues?.fabric_type.entries()) {
          const fabrictype = await FabricType.findOne({
            where: {
              id: id,
            },
            attributes: ["id", "fabricType_name"],
          });

          data.push({
            ...row.dataValues,
            fabricType: fabrictype
              ? fabrictype.dataValues?.fabricType_name
              : "",
            fabricWeight:
              row.dataValues.fabric_weight &&
                row.dataValues.fabric_weight[index]
                ? row.dataValues.fabric_weight[index]
                : "",
            fabricGsm:
              row.dataValues.fabric_gsm && row.dataValues.fabric_gsm[index]
                ? row.dataValues.fabric_gsm[index]
                : "",
          });
        }
      }
    }

    let result = data.slice(offset, offset + limit);

    // Append data to worksheet
    for await (const [index, item] of result.entries()) {
      const rowValues = Object.values({
        index: index + 1,
        accept_date: item.createdAt ? item.createdAt : "",
        date: item.date ? item.date : "",
        knitter: item.knitter ? item.knitter.name : "",
        garmentOrderRef: item.garment_order_ref ? item.garment_order_ref : "",
        brandOrderRef: item.brand_order_ref ? item.brand_order_ref : "",
        noOfRolls: item.no_of_rolls ? item.no_of_rolls : "",
        lotNo: item.batch_lot_no ? item.batch_lot_no : "",
        reelLot: item.reel_lot_no ? item.reel_lot_no : "",
        fabricType: item.fabricType ? item.fabricType : "",
        fabricWeight: item.fabricWeight ? item.fabricWeight : "",
        fabricGsm: item.fabricGsm ? Number(item.fabricGsm) : 0,
        job_details_garment: item.job_details_garment
          ? item.job_details_garment
          : "",
        total_yarn: item.total_yarn_qty ? item.total_yarn_qty : "",
        netWeight: item.total_fabric_weight ? item.total_fabric_weight : "",
      });
      worksheet.addRow(rowValues);
    }
    // Auto-adjust column widths based on content
    worksheet.columns.forEach((column: any) => {
      let maxCellLength = 0;
      column.eachCell({ includeEmpty: true }, (cell: any) => {
        const cellLength = (cell.value ? cell.value.toString() : "").length;
        maxCellLength = Math.max(maxCellLength, cellLength);
      });
      column.width = Math.min(14, maxCellLength + 2); // Limit width to 30 characters
    });

    // Save the workbook
    await workbook.xlsx.writeFile(excelFilePath);
    // return res.status(200).send({
    //   success: true,
    //   messgage: "File successfully Generated",
    //   data: process.env.BASE_URL + "knitter-yarn-process.xlsx",
    // });
    await ExportData.update({
      knitter_yarn_process_load: false
    }, { where: { knitter_yarn_process_load: true } })
  } catch (error: any) {
    (async () => {
      await ExportData.update({
        knitter_yarn_process_load: false
      }, { where: { knitter_yarn_process_load: true } })
    })()
    console.log(error);
    return res.sendError(res, error.message);
  }
};

//fetch knitter Sales with filters
const fetchKnitterSalesPagination = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const {
    knitterId,
    seasonId,
    programId,
    brandId,
    countryId,
    fabricType,
    startDate,
    endDate
  }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$sales.knitter.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.buyer.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.dyingwashing.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.garment_order_ref$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.brand_order_ref$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.invoice_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.batch_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.transporter_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.vehicle_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.transaction_agent$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$process.reel_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$process.batch_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    if (knitterId) {
      const idArray: number[] = knitterId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.knitter_id$"] = { [Op.in]: idArray };
    }
    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.knitter.brand$"] = { [Op.overlap]: idArray };
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.knitter.country_id$"] = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.season_id$"] = { [Op.in]: idArray };
    }

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.program_id$"] = { [Op.in]: idArray };
    }

    if (fabricType) {
      const idArray: any[] = fabricType
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$process.fabric_type$"] = { [Op.overlap]: idArray };
    }
    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereCondition.createdAt = { [Op.between]: [startOfDay, endOfDay] }
  }

    let include = [
      {
        model: Knitter,
        as: "knitter",
        attributes: ["id", "name", "address"],
      },
      {
        model: Season,
        as: "season",
        attributes: ["id", "name"],
      },
      {
        model: Program,
        as: "program",
        attributes: ["id", "program_name"],
      },
      {
        model: Garment,
        as: "buyer",
        attributes: ["id", "name", "address"],
      },
      {
        model: Fabric,
        as: "dyingwashing",
        attributes: ["id", "name", "address"],
      },
    ];

    const { count, rows }: any = await KnitFabricSelection.findAndCountAll({
      attributes: [
        [Sequelize.literal('"sales"."id"'), "sales_id"],
        [Sequelize.literal('"sales"."createdAt"'), "createdAt"],
        [Sequelize.literal('"sales"."date"'), "date"],
        [Sequelize.col('"sales"."season"."name"'), "season_name"],
        [Sequelize.col('"sales"."season"."id"'), "season_id"],
        [Sequelize.col('"sales"."knitter"."id"'), "knitter_id"],
        [Sequelize.col('"sales"."knitter"."name"'), "knitter"],
        [Sequelize.col('"sales"."program"."program_name"'), "program"],
        [Sequelize.col('"sales"."garment_order_ref"'), "garment_order_ref"],
        [Sequelize.col('"sales"."brand_order_ref"'), "brand_order_ref"],
        [Sequelize.col('"sales"."buyer_type"'), "buyer_type"],
        [Sequelize.col('"sales"."buyer_id"'), "garment_id"],
        [Sequelize.col('"sales"."fabric_id"'), "fabric_id"],
        [Sequelize.col('"sales"."buyer"."name'), "garment"],
        [Sequelize.col('"sales"."dyingwashing"."name'), "fabric"],
        [Sequelize.col('"sales"."processor_name"'), "processor_name"],
        [Sequelize.literal('"sales"."total_yarn_qty"'), "total_qty"],
        [Sequelize.literal('"sales"."invoice_no"'), "invoice_no"],
        [Sequelize.literal('"process"."batch_lot_no"'), "batch_lot_no"],
        [Sequelize.literal('"process"."reel_lot_no"'), "reel_lot_no"],
        [Sequelize.literal('"process"."fabric_type"'), "fabric_type"],
        [Sequelize.literal("qty_used"), "net_weight"],
        [Sequelize.literal('"sales"."tc_file"'), "tc_files"],
        [Sequelize.literal('"sales"."contract_file"'), "contract_file"],
        [Sequelize.literal('"sales"."invoice_file"'), "invoice_file"],
        [Sequelize.literal('"sales"."delivery_notes"'), "delivery_notes"],
        [Sequelize.literal('"sales"."transporter_name"'), "transporter_name"],
        [Sequelize.literal('"sales"."vehicle_no"'), "vehicle_no"],
        [Sequelize.literal('"sales"."qr"'), "qr"],
        [Sequelize.literal('"sales"."transaction_agent"'), "transaction_agent"],
        [Sequelize.literal('"sales"."qty_stock"'), "qty_stock"],
        [Sequelize.literal('"sales"."status"'), "status"],
        [Sequelize.literal('"knitfabric"."fabric_type"'), "fabricType"],
      ],
      where: whereCondition,
      include: [
        {
          model: KnitSales,
          as: "sales",
          include: include,
          attributes: [],
        },
        {
          model: KnitProcess,
          attributes: [],
          as: "process",
        },
        {
          model: KnitFabric,
          attributes: [],
          as: "knitfabric",
        },
      ],
      order: [["sales_id", "desc"]],
      offset: offset,
      limit: limit,
    });

    // let data = [];

    for await (let row of rows) {
      // if(row.dataValues?.fabric_type?.length > 0){
      //     for await (const [index, id] of row.dataValues?.fabric_type.entries() ){
      if (row.dataValues.fabricType) {
        const fabrictype = await FabricType.findOne({
          where: {
            id: row.dataValues.fabricType,
          },
          attributes: ["id", "fabricType_name"],
        });

        if (fabrictype) {
          row.dataValues.fabricType = fabrictype
            ? fabrictype.dataValues?.fabricType_name
            : "";
        }
      }
    }

    //     }
    // }

    // let result = data.slice(offset, offset + limit);

    return res.sendPaginationSuccess(res, rows, count);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const exportKnitterSale = async (req: Request, res: Response) => {
  // knitter_fabric_sales_load
  await ExportData.update({
    knitter_fabric_sales_load: true
  }, { where: { knitter_fabric_sales_load: false } })
  res.send({ status: 200, message: "export file processing" })
  const excelFilePath = path.join(
    "./upload",
    "knitter-fabric-sale-report.xlsx"
  );

  try {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const {
      knitterId,
      seasonId,
      programId,
      brandId,
      countryId,
      fabricType,
      startDate,
      endDate
    }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$sales.knitter.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.buyer.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.dyingwashing.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.garment_order_ref$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.brand_order_ref$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.invoice_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.batch_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.transporter_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.vehicle_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.transaction_agent$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$process.reel_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$process.batch_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    if (knitterId) {
      const idArray: number[] = knitterId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.knitter_id$"] = { [Op.in]: idArray };
    }
    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.knitter.brand$"] = { [Op.overlap]: idArray };
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.knitter.country_id$"] = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.season_id$"] = { [Op.in]: idArray };
    }

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.program_id$"] = { [Op.in]: idArray };
    }

    if (fabricType) {
      const idArray: any[] = fabricType
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$process.fabric_type$"] = { [Op.overlap]: idArray };
    }

    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereCondition.createdAt = { [Op.between]: [startOfDay, endOfDay] }
  }

    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    worksheet.mergeCells("A1:K1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Knitter Fabric Sales Report";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.",
      "Date of Sale ",
      "Date",
      "Knitter Name",
      "Sold To",
      "Invoice Number",
      "Finished Batch/Lot No",
      "Fabric Type",
      "Agent Details",
      "Finished Fabric Weight",
      "Total Fabric Net Weight (Kgs)",
    ]);
    headerRow.font = { bold: true };
    let include = [
      {
        model: Knitter,
        as: "knitter",
        attributes: ["id", "name", "address"],
      },
      {
        model: Season,
        as: "season",
        attributes: ["id", "name"],
      },
      {
        model: Program,
        as: "program",
        attributes: ["id", "program_name"],
      },
      {
        model: Garment,
        as: "buyer",
        attributes: ["id", "name", "address"],
      },
      {
        model: Fabric,
        as: "dyingwashing",
        attributes: ["id", "name", "address"],
      }
    ];

    const { count, rows }: any = await KnitFabricSelection.findAndCountAll({
      attributes: [
        [Sequelize.literal('"sales"."id"'), "sales_id"],
        [Sequelize.literal('"sales"."createdAt"'), "createdAt"],
        [Sequelize.literal('"sales"."date"'), "date"],
        [Sequelize.col('"sales"."season"."name"'), "season_name"],
        [Sequelize.col('"sales"."season"."id"'), "season_id"],
        [Sequelize.col('"sales"."knitter"."id"'), "knitter_id"],
        [Sequelize.col('"sales"."knitter"."name"'), "knitter"],
        [Sequelize.col('"sales"."program"."program_name"'), "program"],
        [Sequelize.col('"sales"."garment_order_ref"'), "garment_order_ref"],
        [Sequelize.col('"sales"."brand_order_ref"'), "brand_order_ref"],
        [Sequelize.col('"sales"."buyer_type"'), "buyer_type"],
        [Sequelize.col('"sales"."buyer_id"'), "garment_id"],
        [Sequelize.col('"sales"."fabric_id"'), "fabric_id"],
        [Sequelize.col('"sales"."buyer"."name"'), "garment"],
        [Sequelize.col('"sales"."dyingwashing"."name"'), "fabric"],
        [Sequelize.col('"sales"."processor_name"'), "processor_name"],
        [Sequelize.literal('"sales"."total_yarn_qty"'), "total_qty"],
        [Sequelize.literal('"sales"."invoice_no"'), "invoice_no"],
        [Sequelize.literal('"process"."batch_lot_no"'), "batch_lot_no"],
        [Sequelize.literal('"process"."reel_lot_no"'), "reel_lot_no"],
        [Sequelize.literal('"process"."fabric_type"'), "fabric_type"],
        [Sequelize.literal("qty_used"), "net_weight"],
        [Sequelize.literal('"sales"."tc_file"'), "tc_files"],
        [Sequelize.literal('"sales"."contract_file"'), "contract_file"],
        [Sequelize.literal('"sales"."invoice_file"'), "invoice_file"],
        [Sequelize.literal('"sales"."delivery_notes"'), "delivery_notes"],
        [Sequelize.literal('"sales"."transporter_name"'), "transporter_name"],
        [Sequelize.literal('"sales"."vehicle_no"'), "vehicle_no"],
        [Sequelize.literal('"sales"."qr"'), "qr"],
        [Sequelize.literal('"sales"."transaction_agent"'), "transaction_agent"],
        [Sequelize.literal('"sales"."qty_stock"'), "qty_stock"],
        [Sequelize.literal('"sales"."status"'), "status"],
        [Sequelize.literal('"knitfabric"."fabric_type"'), "fabricType"],
      ],
      where: whereCondition,
      include: [
        {
          model: KnitSales,
          as: "sales",
          include: include,
          attributes: [],
        },
        {
          model: KnitProcess,
          attributes: [],
          as: "process",
        },
        {
          model: KnitFabric,
          attributes: [],
          as: "knitfabric",
        },
      ],
      order: [["sales_id", "desc"]],
      offset: offset,
      limit: limit,
      raw: true
    });

    for await (let row of rows) {
      // if(row.dataValues?.fabric_type?.length > 0){
      //     for await (const [index, id] of row.dataValues?.fabric_type.entries() ){
      if (row.fabricType) {
        const fabrictype = await FabricType.findOne({
          where: {
            id: row.fabricType,
          },
          attributes: ["id", "fabricType_name"],
        });

        if (fabrictype) {
          row.fabricType = fabrictype
            ? fabrictype.dataValues?.fabricType_name
            : "";
        }
      }
    }

    // Append data to worksheet
    for await (const [index, item] of rows.entries()) {
      const rowValues = Object.values({
        index: index + 1,
        createdAt: item.createdAt ? item.createdAt : "",
        date: item.date ? item.date : "",
        knitter: item.knitter ? item.knitter : "",
        buyer: item.garment
          ? item.garment
          : item.fabric
            ? item.fabric
            : item.processor_name,
        invoice: item.invoice_no ? item.invoice_no : "",
        lotNo: item.batch_lot_no ? item.batch_lot_no : "",
        fabrictype: item.fabricType ? item.fabricType : "",
        transaction_agent: item.transaction_agent
          ? item.transaction_agent
          : "NA",
        fabric_weight: item.net_weight ? item.net_weight : "",
        total_fabric_weight: item.total_qty ? item.total_qty : "",
      });
      worksheet.addRow(rowValues);
    }
    // Auto-adjust column widths based on content
    worksheet.columns.forEach((column: any) => {
      let maxCellLength = 0;
      column.eachCell({ includeEmpty: true }, (cell: any) => {
        const cellLength = (cell.value ? cell.value.toString() : "").length;
        maxCellLength = Math.max(maxCellLength, cellLength);
      });
      column.width = Math.min(14, maxCellLength + 2); // Limit width to 30 characters
    });

    // Save the workbook
    await workbook.xlsx.writeFile(excelFilePath);
    // res.status(200).send({
    //   success: true,
    //   messgage: "File successfully Generated",
    //   data: process.env.BASE_URL + "knitter-fabric-sale-report.xlsx",
    // });
    await ExportData.update({
      knitter_fabric_sales_load: false
    }, { where: { knitter_fabric_sales_load: true } })
  } catch (error: any) {
    (async () => {
      await ExportData.update({
        knitter_fabric_sales_load: false
      }, { where: { knitter_fabric_sales_load: true } })
    })()
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

//fetch Weaver Yarn with filters
const fetchWeaverYarnPagination = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { weaverId, spinnerId, seasonId, programId, brandId, countryId, startDate, endDate }: any =
    req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$sales.spinner.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.weaver.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.order_ref$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.box_ids$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.invoice_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.batch_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
        // { "$sales.yarn_type$": { [Op.iLike]: `%${searchTerm}%` } },
        {
          // "$sales.yarncount.yarnCount_name$": { [Op.iLike]: `%${searchTerm}%` },
        },
        { "$process.reel_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    if (spinnerId) {
      const idArray: number[] = spinnerId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.spinner_id$"] = { [Op.in]: idArray };
    }
    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.weaver.brand$"] = { [Op.overlap]: idArray };
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.weaver.country_id$"] = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.season_id$"] = { [Op.in]: idArray };
    }

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.program_id$"] = { [Op.in]: idArray };
    }
    whereCondition["$sales.buyer_id$"] = { [Op.ne]: null };
    whereCondition["$sales.status$"] = "Sold";

    if (weaverId) {
      const idArray: number[] = weaverId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.buyer_id$"] = { [Op.in]: idArray };
    }

    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereCondition.createdAt = { [Op.between]: [startOfDay, endOfDay] }
  }

    let include = [
      {
        model: Spinner,
        as: "spinner",
        attributes: ["id", "name"],
      },
      {
        model: Season,
        as: "season",
        attributes: ["id", "name"],
      },
      {
        model: Program,
        as: "program",
        attributes: ["id", "program_name"],
      },
      // {
      //   model: YarnCount,
      //   as: "yarncount",
      //   attributes: ["id", "yarnCount_name"],
      // },
      {
        model: Weaver,
        as: "weaver",
        attributes: ["id", "name"],
      },
      {
        model: Knitter,
        as: "knitter",
        attributes: ["id", "name"],
      },
    ];
    //fetch data with pagination

    const { count, rows }: any = await SpinProcessYarnSelection.findAndCountAll(
      {
        attributes: [
          [Sequelize.literal('"sales"."id"'), "sales_id"],
          [Sequelize.literal('"sales"."date"'), "date"],
          [Sequelize.literal('"sales"."accept_date"'), "accept_date"],
          [Sequelize.literal('"sales"."createdAt"'), "createdAt"],
          [Sequelize.col('"sales"."season"."name"'), "season_name"],
          [Sequelize.col('"sales"."season"."id"'), "season_id"],
          [Sequelize.col('"sales"."spinner"."id"'), "spinner_id"],
          [Sequelize.col('"sales"."spinner"."name"'), "spinner"],
          [Sequelize.col('"sales"."program"."program_name"'), "program"],
          [Sequelize.col('"sales"."order_ref"'), "order_ref"],
          [Sequelize.col('"sales"."buyer_type"'), "buyer_type"],
          [Sequelize.col('"sales"."buyer_id"'), "buyer_id"],
          [Sequelize.col('"sales"."knitter_id"'), "knitter_id"],
          [Sequelize.col('"sales"."knitter"."name'), "knitter"],
          [Sequelize.col('"sales"."weaver"."name'), "weaver"],
          [Sequelize.literal('"sales"."total_qty"'), "total_qty"],
          [Sequelize.literal('"sales"."invoice_no"'), "invoice_no"],
          [Sequelize.literal('"sales"."batch_lot_no"'), "batch_lot_no"],
          // [Sequelize.literal('"process"."reel_lot_no"'), "reel_lot_no"],
          [Sequelize.fn('STRING_AGG', Sequelize.literal('DISTINCT "process"."reel_lot_no"'), ', ' ) , "reel_lot_no"],
          [Sequelize.literal('"sales"."no_of_boxes"'), "no_of_boxes"],
          // [Sequelize.literal('"process"."qty_used"'), 'yarn_weight'],
          // [Sequelize.literal("qty_used"), "yarn_weight"],
          [
            sequelize.fn(
              "COALESCE",
              sequelize.fn("SUM", sequelize.col("qty_used")),
              0
            ),
            "yarn_weight",
          ],
          [Sequelize.literal('"sales"."box_ids"'), "box_ids"],
          [Sequelize.literal('"sales"."yarn_type"'), "yarn_type"],
          [Sequelize.literal('"sales"."yarn_count"'), "yarn_count"],
          // [
          //   Sequelize.col('"sales"."yarncount".yarnCount_name'),
          //   "yarnCount_name",
          // ],
          [Sequelize.literal('"sales"."quality_doc"'), "quality_doc"],
          [Sequelize.literal('"sales"."tc_files"'), "tc_files"],
          [Sequelize.literal('"sales"."contract_file"'), "contract_file"],
          [Sequelize.literal('"sales"."invoice_file"'), "invoice_file"],
          [Sequelize.literal('"sales"."delivery_notes"'), "delivery_notes"],
          [Sequelize.literal('"sales"."transporter_name"'), "transporter_name"],
          [Sequelize.literal('"sales"."vehicle_no"'), "vehicle_no"],
          [Sequelize.literal('"sales"."qr"'), "qr"],
          [
            Sequelize.literal('"sales"."transaction_agent"'),
            "transaction_agent",
          ],
          [Sequelize.literal('"sales"."qty_stock"'), "qty_stock"],
          [Sequelize.literal('"sales"."status"'), "status"],
        ],
        where: whereCondition,
        include: [
          {
            model: SpinSales,
            as: "sales",
            include: include,
            attributes: [],
          },
          {
            model: SpinProcess,
            attributes: [],
            as: "process",
          },
        ],
        group: [
          "sales.id",
          "sales.season.id",
          "sales.spinner.id",
          "sales.weaver.id",
          "sales.knitter.id",
          "sales.program.id",
        ],
        order: [["sales_id", "desc"]],
        offset: offset,
        limit: limit,
      }
    );

    const data = [];
    for await (let row of rows) {

      const yarnCountIds = row.dataValues.yarn_count?.map(Number);
    
      const yarncount = await YarnCount.findAll({
        where: {
          id: {
            [Op.in]: yarnCountIds,
          },
        },
        attributes: ["yarnCount_name"],
      });
    
      const yarnCountNames = yarncount?.map((yc:any) => yc.yarnCount_name);
    
      data.push({
        ...row.dataValues,
        yarnCount_names: yarnCountNames, 
      });
    }
    return res.sendPaginationSuccess(res, data, count?.length);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const exportWeaverYarn = async (req: Request, res: Response) => {
  // weaver_yarn_receipt_load
  await ExportData.update({
    weaver_yarn_receipt_load: true
  }, { where: { weaver_yarn_receipt_load: false } })
  res.send({ status: 200, message: "export file processing" })
  const excelFilePath = path.join("./upload", "weaver-yarn.xlsx");
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { weaverId, spinnerId, seasonId, programId, brandId, countryId, startDate, endDate }: any =
    req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$sales.spinner.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.weaver.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.order_ref$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.box_ids$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.invoice_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.batch_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
        // { "$sales.yarn_type$": { [Op.iLike]: `%${searchTerm}%` } },
        {
          // "$sales.yarncount.yarnCount_name$": { [Op.iLike]: `%${searchTerm}%` },
        },
        { "$process.reel_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    if (spinnerId) {
      const idArray: number[] = spinnerId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.spinner_id$"] = { [Op.in]: idArray };
    }
    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.weaver.brand$"] = { [Op.overlap]: idArray };
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.weaver.country_id$"] = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.season_id$"] = { [Op.in]: idArray };
    }

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.program_id$"] = { [Op.in]: idArray };
    }
    whereCondition["$sales.buyer_id$"] = { [Op.ne]: null };
    whereCondition["$sales.status$"] = "Sold";

    if (weaverId) {
      const idArray: number[] = weaverId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.buyer_id$"] = { [Op.in]: idArray };
    }

    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereCondition.createdAt = { [Op.between]: [startOfDay, endOfDay] }
  }

    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    worksheet.mergeCells("A1:L1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Weaver Yarn Receipt Report";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.",
      "Date of Transaction Receipt",
      "Date",
      "Spinner Name",
      "Weaving Unit Name",
      "Invoice Number",
      "Lot/Batch Number",
      "Yarn Reel No",
      "Yarn Count",
      "No of Boxes",
      "Box ID",
      "Net Weight(Kgs)",
    ]);
    headerRow.font = { bold: true };
    let include = [
      {
        model: Spinner,
        as: "spinner",
        attributes: ["id", "name"],
      },
      {
        model: Season,
        as: "season",
        attributes: ["id", "name"],
      },
      {
        model: Program,
        as: "program",
        attributes: ["id", "program_name"],
      },
      // {
      //   model: YarnCount,
      //   as: "yarncount",
      //   attributes: ["id", "yarnCount_name"],
      // },
      {
        model: Weaver,
        as: "weaver",
        attributes: ["id", "name"],
      },
      {
        model: Knitter,
        as: "knitter",
        attributes: ["id", "name"],
      },
    ];
    //fetch data with pagination

    const { count, rows }: any = await SpinProcessYarnSelection.findAndCountAll(
      {
        attributes: [
          [Sequelize.literal('"sales"."id"'), "sales_id"],
          [Sequelize.literal('"sales"."date"'), "date"],
          [Sequelize.literal('"sales"."accept_date"'), "accept_date"],
          [Sequelize.col('"sales"."season"."name"'), "season_name"],
          [Sequelize.col('"sales"."season"."id"'), "season_id"],
          [Sequelize.col('"sales"."spinner"."id"'), "spinner_id"],
          [Sequelize.col('"sales"."spinner"."name"'), "spinner"],
          [Sequelize.col('"sales"."program"."program_name"'), "program"],
          [Sequelize.col('"sales"."order_ref"'), "order_ref"],
          [Sequelize.col('"sales"."buyer_type"'), "buyer_type"],
          [Sequelize.col('"sales"."buyer_id"'), "buyer_id"],
          [Sequelize.col('"sales"."knitter_id"'), "knitter_id"],
          [Sequelize.col('"sales"."knitter"."name'), "knitter"],
          [Sequelize.col('"sales"."weaver"."name'), "weaver"],
          [Sequelize.literal('"sales"."total_qty"'), "total_qty"],
          [Sequelize.literal('"sales"."invoice_no"'), "invoice_no"],
          [Sequelize.literal('"sales"."batch_lot_no"'), "batch_lot_no"],
          [Sequelize.fn('STRING_AGG', Sequelize.literal('DISTINCT "process"."reel_lot_no"'), ', ' ) , "reel_lot_no"],
          [Sequelize.literal('"sales"."no_of_boxes"'), "no_of_boxes"],
          // [Sequelize.literal('"process"."qty_used"'), 'yarn_weight'],
          [
            sequelize.fn(
              "COALESCE",
              sequelize.fn("SUM", sequelize.col("qty_used")),
              0
            ),
            "yarn_weight",
          ],
          [Sequelize.literal('"sales"."box_ids"'), "box_ids"],
          [Sequelize.literal('"sales"."yarn_type"'), "yarn_type"],
          [Sequelize.literal('"sales"."yarn_count"'), "yarn_count"],
          // [
          //   Sequelize.col('"sales"."yarncount".yarnCount_name'),
          //   "yarnCount_name",
          // ],
          [Sequelize.literal('"sales"."quality_doc"'), "quality_doc"],
          [Sequelize.literal('"sales"."tc_files"'), "tc_files"],
          [Sequelize.literal('"sales"."contract_file"'), "contract_file"],
          [Sequelize.literal('"sales"."invoice_file"'), "invoice_file"],
          [Sequelize.literal('"sales"."delivery_notes"'), "delivery_notes"],
          [Sequelize.literal('"sales"."transporter_name"'), "transporter_name"],
          [Sequelize.literal('"sales"."vehicle_no"'), "vehicle_no"],
          [Sequelize.literal('"sales"."qr"'), "qr"],
          [
            Sequelize.literal('"sales"."transaction_agent"'),
            "transaction_agent",
          ],
          [Sequelize.literal('"sales"."qty_stock"'), "qty_stock"],
          [Sequelize.literal('"sales"."status"'), "status"],
        ],
        where: whereCondition,
        include: [
          {
            model: SpinSales,
            as: "sales",
            include: include,
            attributes: [],
          },
          {
            model: SpinProcess,
            attributes: [],
            as: "process",
          },
        ],
        group: [
          "sales.id",
          "sales.season.id",
          "sales.spinner.id",
          "sales.weaver.id",
          "sales.knitter.id",
          "sales.program.id",
        ], order: [["sales_id", "desc"]],
        offset: offset,
        limit: limit,
      }
    );
    // Append data to worksheet
    for await (const [index, item] of rows.entries()) {
      const yarnCountIds = rows.flatMap((row:any) => row.dataValues.yarn_count || []);
      const yarnCounts = await YarnCount.findAll({
        where: {
          id: { [Op.in]: yarnCountIds }
        },
        attributes: ["id", "yarnCount_name"]
      });

      const yarnCountMap = yarnCounts.reduce((map:any, yarnCount:any) => {
        map[yarnCount.id] = yarnCount.yarnCount_name;
        return map;
      }, {});

      const rowValues = Object.values({
        index: index + 1,
        accept_date: item.dataValues.accept_date
          ? item.dataValues.accept_date
          : "",
        date: item.dataValues.date ? item.dataValues.date : "",
        spinner: item.dataValues.spinner ? item.dataValues.spinner : "",
        buyer_id: item.dataValues.weaver ? item.dataValues.weaver : "",
        invoice: item.dataValues.invoice_no ? item.dataValues.invoice_no : "",
        lotNo: item.dataValues.batch_lot_no ? item.dataValues.batch_lot_no : "",
        reelLot: item.dataValues.reel_lot_no ? item.dataValues.reel_lot_no : "",
        count: item.dataValues.yarn_count.map((id: number) => yarnCountMap[id] || null).join(", "),
        boxes: item.dataValues.no_of_boxes ? item.dataValues.no_of_boxes : "",
        boxId: item.dataValues.box_ids ? item.dataValues.box_ids : "",
        total: item.dataValues.yarn_weight,
      });
      worksheet.addRow(rowValues);
    }
    // Auto-adjust column widths based on content
    worksheet.columns.forEach((column: any) => {
      let maxCellLength = 0;
      column.eachCell({ includeEmpty: true }, (cell: any) => {
        const cellLength = (cell.value ? cell.value.toString() : "").length;
        maxCellLength = Math.max(maxCellLength, cellLength);
      });
      column.width = Math.min(14, maxCellLength + 2); // Limit width to 30 characters
    });

    // Save the workbook
    await workbook.xlsx.writeFile(excelFilePath);
    // res.status(200).send({
    //   success: true,
    //   messgage: "File successfully Generated",
    //   data: process.env.BASE_URL + "weaver-yarn.xlsx",
    // });
    await ExportData.update({
      weaver_yarn_receipt_load: false
    }, { where: { weaver_yarn_receipt_load: true } })
  } catch (error: any) {
    (async () => {
      await ExportData.update({
        weaver_yarn_receipt_load: false
      }, { where: { weaver_yarn_receipt_load: true } })
    })()
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};


const fetchWeaverYarnProcess = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { weaverId, seasonId, programId, brandId, countryId, fabricType, startDate, endDate }: any =
    req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { garment_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { brand_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { blend_material: { [Op.iLike]: `%${searchTerm}%` } },
        { blend_vendor: { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$weaver.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { job_details_garment: { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }

    if (weaverId) {
      const idArray: number[] = weaverId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.weaver_id = { [Op.in]: idArray };
    }

    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$weaver.brand$"] = { [Op.overlap]: idArray };
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$weaver.country_id$"] = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.season_id = { [Op.in]: idArray };
    }

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.program_id = { [Op.in]: idArray };
    }

    if (fabricType) {
      const idArray: any[] = fabricType
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.fabric_type = { [Op.overlap]: idArray };
    }

    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereCondition.createdAt = { [Op.between]: [startOfDay, endOfDay] }
  }

    let include = [
      {
        model: Weaver,
        as: "weaver",
        attributes: ["id", "name", "address"],
      },
      {
        model: Season,
        as: "season",
        attributes: ["id", "name"],
      },
      {
        model: Program,
        as: "program",
        attributes: ["id", "program_name"],
      },
    ];

    const { count, rows } = await WeaverProcess.findAndCountAll({
      where: whereCondition,
      include: include,
      order: [["id", "desc"]],
    });

    let data = [];

    for await (let row of rows) {
      if (row.dataValues?.fabric_type.length > 0) {
        for await (const [index, id] of row.dataValues?.fabric_type.entries()) {
          const fabrictype = await FabricType.findOne({
            where: {
              id: id,
            },
            attributes: ["id", "fabricType_name"],
          });

          data.push({
            ...row.dataValues,
            fabricType: fabrictype
              ? fabrictype.dataValues?.fabricType_name
              : "",
            fabricLength:
              row.dataValues.fabric_length &&
                row.dataValues.fabric_length[index]
                ? row.dataValues.fabric_length[index]
                : "",
            fabricGsm:
              row.dataValues.fabric_gsm && row.dataValues.fabric_gsm[index]
                ? row.dataValues.fabric_gsm[index]
                : "",
          });
        }
      }
    }

    let result = data.slice(offset, offset + limit);

    return res.sendPaginationSuccess(res, result, data.length);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

const exportWeaverYarnProcess = async (req: Request, res: Response) => {
  // weaver_yarn_process_load
  await ExportData.update({
    weaver_yarn_process_load: true
  }, { where: { weaver_yarn_process_load: false } })
  res.send({ status: 200, message: "export file processing" })
  const excelFilePath = path.join("./upload", "weaver-yarn-process.xlsx");
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { weaverId, seasonId, programId, brandId, countryId, fabricType, startDate, endDate }: any =
    req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { garment_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { brand_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { blend_material: { [Op.iLike]: `%${searchTerm}%` } },
        { blend_vendor: { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$weaver.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { job_details_garment: { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }

    if (weaverId) {
      const idArray: number[] = weaverId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.weaver_id = { [Op.in]: idArray };
    }

    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$weaver.brand$"] = { [Op.overlap]: idArray };
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$weaver.country_id$"] = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.season_id = { [Op.in]: idArray };
    }

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.program_id = { [Op.in]: idArray };
    }

    if (fabricType) {
      const idArray: any[] = fabricType
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.fabric_type = { [Op.overlap]: idArray };
    }

    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereCondition.createdAt = { [Op.between]: [startOfDay, endOfDay] }
  }

    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    worksheet.mergeCells("A1:O1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Weaver Yarn Process Report";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.",
      "Date of Process",
      "Date",
      "Weaving Unit Name",
      "Garment order reference no.",
      "Brand reference no",
      "No. of Rolls",
      "Finished Batch/Lot No",
      "Fabric REEL Lot No.",
      "Fabric Type",
      "Finished Fabric Net Length",
      "Finished Fabric GSM ",
      "Job details from garment",
      "Total Yarn Utilized",
      "Total Fabric Net Length",
    ]);
    headerRow.font = { bold: true };

    let include = [
      {
        model: Weaver,
        as: "weaver",
        attributes: ["id", "name", "address"],
      },
      {
        model: Season,
        as: "season",
        attributes: ["id", "name"],
      },
      {
        model: Program,
        as: "program",
        attributes: ["id", "program_name"],
      },
    ];

    const { count, rows } = await WeaverProcess.findAndCountAll({
      where: whereCondition,
      include: include,
      order: [["id", "desc"]],
    });

    let data = [];

    for await (let row of rows) {
      if (row.dataValues?.fabric_type?.length > 0) {
        for await (const [index, id] of row.dataValues?.fabric_type.entries()) {
          const fabrictype = await FabricType.findOne({
            where: {
              id: id,
            },
            attributes: ["id", "fabricType_name"],
          });

          data.push({
            ...row.dataValues,
            fabricType: fabrictype
              ? fabrictype.dataValues?.fabricType_name
              : "",
            fabricLength:
              row.dataValues.fabric_length &&
                row.dataValues.fabric_length[index]
                ? row.dataValues.fabric_length[index]
                : "",
            fabricGsm:
              row.dataValues.fabric_gsm && row.dataValues.fabric_gsm[index]
                ? row.dataValues.fabric_gsm[index]
                : "",
          });
        }
      }
    }

    let result = data.slice(offset, offset + limit);

    // Append data to worksheet
    for await (const [index, item] of result.entries()) {
      const rowValues = Object.values({
        index: index + 1,
        accept_date: item.createdAt ? item.createdAt : "",
        date: item.date ? item.date : "",
        weaver: item.weaver ? item.weaver.name : "",
        garmentOrderRef: item.garment_order_ref ? item.garment_order_ref : "",
        brandOrderRef: item.brand_order_ref ? item.brand_order_ref : "",
        noOfRolls: item.no_of_rolls ? item.no_of_rolls : "",
        lotNo: item.batch_lot_no ? item.batch_lot_no : "",
        reelLot: item.reel_lot_no ? item.reel_lot_no : "",
        fabricType: item.fabricType ? item.fabricType : "",
        fabricLength: item.fabricLength ? item.fabricLength : "",
        fabricGsm: item.fabricGsm ? Number(item.fabricGsm) : 0,
        job_details_garment: item.job_details_garment
          ? item.job_details_garment
          : "",
        total_yarn: item.total_yarn_qty ? item.total_yarn_qty : "",
        netLength: item.total_fabric_length ? item.total_fabric_length : "",
      });
      worksheet.addRow(rowValues);
    }
    // Auto-adjust column widths based on content
    worksheet.columns.forEach((column: any) => {
      let maxCellLength = 0;
      column.eachCell({ includeEmpty: true }, (cell: any) => {
        const cellLength = (cell.value ? cell.value.toString() : "").length;
        maxCellLength = Math.max(maxCellLength, cellLength);
      });
      column.width = Math.min(14, maxCellLength + 2); // Limit width to 30 characters
    });

    // Save the workbook
    await workbook.xlsx.writeFile(excelFilePath);
    // return res.status(200).send({
    //   success: true,
    //   messgage: "File successfully Generated",
    //   data: process.env.BASE_URL + "weaver-yarn-process.xlsx",
    // });
    await ExportData.update({
      weaver_yarn_process_load: false
    }, { where: { weaver_yarn_process_load: true } })
  } catch (error: any) {
    console.log(error);
    (async () => {
      await ExportData.update({
        weaver_yarn_process_load: false
      }, { where: { weaver_yarn_process_load: true } })
      return res.sendError(res, error.message);
    })()

  }
};

//fetch Weaver Sales with filters
const fetchWeaverSalesPagination = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { weaverId, seasonId, programId, brandId, countryId, fabricType, startDate, endDate }: any =
    req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$sales.weaver.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.buyer.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.dyingwashing.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.garment_order_ref$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.brand_order_ref$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.invoice_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.batch_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.transporter_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.vehicle_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.transaction_agent$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$process.reel_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$process.batch_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    if (weaverId) {
      const idArray: number[] = weaverId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.weaver_id$"] = { [Op.in]: idArray };
    }
    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.weaver.brand$"] = { [Op.overlap]: idArray };
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.weaver.country_id$"] = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.season_id$"] = { [Op.in]: idArray };
    }

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.program_id$"] = { [Op.in]: idArray };
    }

    if (fabricType) {
      const idArray: any[] = fabricType
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$process.fabric_type$"] = { [Op.overlap]: idArray };
    }

    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereCondition.createdAt = { [Op.between]: [startOfDay, endOfDay] }
  }

    let include = [
      {
        model: Weaver,
        as: "weaver",
        attributes: ["id", "name", "address"],
      },
      {
        model: Season,
        as: "season",
        attributes: ["id", "name"],
      },
      {
        model: Program,
        as: "program",
        attributes: ["id", "program_name"],
      },
      {
        model: Garment,
        as: "buyer",
        attributes: ["id", "name", "address"],
      },
      {
        model: Fabric,
        as: "dyingwashing",
        attributes: ["id", "name", "address"],
      },
    ];

    //fetch data with pagination

    const { count, rows } = await WeaverFabricSelection.findAndCountAll({
      attributes: [
        [Sequelize.literal('"sales"."id"'), "sales_id"],
        [Sequelize.literal('"sales"."createdAt"'), "createdAt"],
        [Sequelize.literal('"sales"."date"'), "date"],
        [Sequelize.col('"sales"."season"."name"'), "season_name"],
        [Sequelize.col('"sales"."season"."id"'), "season_id"],
        [Sequelize.col('"sales"."weaver"."id"'), "weaver_id"],
        [Sequelize.col('"sales"."weaver"."name"'), "weaver"],
        [Sequelize.col('"sales"."program"."program_name"'), "program"],
        [Sequelize.col('"sales"."garment_order_ref"'), "garment_order_ref"],
        [Sequelize.col('"sales"."brand_order_ref"'), "brand_order_ref"],
        [Sequelize.col('"sales"."buyer_type"'), "buyer_type"],
        [Sequelize.col('"sales"."buyer_id"'), "garment_id"],
        [Sequelize.col('"sales"."fabric_id"'), "fabric_id"],
        [Sequelize.col('"sales"."buyer"."name"'), "garment"],
        [Sequelize.col('"sales"."dyingwashing"."name"'), "fabric"],
        [Sequelize.col('"sales"."processor_name"'), "processor_name"],
        [Sequelize.literal('"sales"."total_yarn_qty"'), "total_qty"],
        [Sequelize.literal('"sales"."invoice_no"'), "invoice_no"],
        [Sequelize.literal('"process"."batch_lot_no"'), "batch_lot_no"],
        [Sequelize.literal('"process"."reel_lot_no"'), "reel_lot_no"],
        [Sequelize.literal('"process"."fabric_type"'), "fabric_type"],
        [Sequelize.literal("qty_used"), "net_length"],
        [Sequelize.literal('"sales"."tc_file"'), "tc_files"],
        [Sequelize.literal('"sales"."contract_file"'), "contract_file"],
        [Sequelize.literal('"sales"."invoice_file"'), "invoice_file"],
        [Sequelize.literal('"sales"."delivery_notes"'), "delivery_notes"],
        [Sequelize.literal('"sales"."transporter_name"'), "transporter_name"],
        [Sequelize.literal('"sales"."vehicle_no"'), "vehicle_no"],
        [Sequelize.literal('"sales"."qr"'), "qr"],
        [Sequelize.literal('"sales"."transaction_agent"'), "transaction_agent"],
        [Sequelize.literal('"sales"."qty_stock"'), "qty_stock"],
        [Sequelize.literal('"sales"."status"'), "status"],
        [Sequelize.literal('"weaverfabric"."fabric_type"'), "fabricType"],
      ],
      where: whereCondition,
      include: [
        {
          model: WeaverSales,
          as: "sales",
          include: include,
          attributes: [],
        },
        {
          model: WeaverProcess,
          attributes: [],
          as: "process",
        },
        {
          model: WeaverFabric,
          attributes: [],
          as: "weaverfabric",
        },
      ],
      order: [["sales_id", "desc"]],
      offset: offset,
      limit: limit,
    });

    // let data = [];

    // for await (let row of rows) {
    //   if (row.dataValues?.fabric_type?.length > 0) {
    //     for await (const [index, id] of row.dataValues?.fabric_type.entries()) {
    //       const fabrictype = await FabricType.findOne({
    //         where: {
    //           id: id,
    //         },
    //         attributes: ["id", "fabricType_name"],
    //       });

    //       if (fabrictype) {
    //         data.push({
    //           ...row.dataValues,
    //           fabricType: fabrictype
    //             ? fabrictype.dataValues?.fabricType_name
    //             : "",
    //         });
    //       }
    //     }
    //   }
    // }
    for await (let row of rows) {
      // if(row.dataValues?.fabric_type?.length > 0){
      //     for await (const [index, id] of row.dataValues?.fabric_type.entries() ){
      if (row.dataValues.fabricType) {
        const fabrictype = await FabricType.findOne({
          where: {
            id: row.dataValues.fabricType,
          },
          attributes: ["id", "fabricType_name"],
        });

        if (fabrictype) {
          row.dataValues.fabricType = fabrictype
            ? fabrictype.dataValues?.fabricType_name
            : "";
        }
      }
    }
    // let result = data.slice(offset, offset + limit);

    return res.sendPaginationSuccess(res, rows, count);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const exportWeaverSale = async (req: Request, res: Response) => {
  // weaver_yarn_sales_load
  await ExportData.update({
    weaver_yarn_sales_load: true
  }, { where: { weaver_yarn_sales_load: false } })
  res.send({ status: 200, message: "export file processing" })
  const excelFilePath = path.join("./upload", "weaver-fabric-sale-report.xlsx");
  try {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const {
      weaverId,
      seasonId,
      programId,
      brandId,
      countryId,
      fabricType,
      startDate,
      endDate,
    }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$sales.knitter.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.buyer.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.dyingwashing.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.garment_order_ref$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.brand_order_ref$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.invoice_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.batch_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.transporter_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.vehicle_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.transaction_agent$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$process.reel_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$process.batch_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    if (weaverId) {
      const idArray: number[] = weaverId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.weaver_id$"] = { [Op.in]: idArray };
    }
    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.weaver.brand$"] = { [Op.overlap]: idArray };
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.weaver.country_id$"] = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.season_id$"] = { [Op.in]: idArray };
    }

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.program_id$"] = { [Op.in]: idArray };
    }

    if (fabricType) {
      const idArray: any[] = fabricType
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$process.fabric_type$"] = { [Op.overlap]: idArray };
    }

    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereCondition.createdAt = { [Op.between]: [startOfDay, endOfDay] }
  }
    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    worksheet.mergeCells("A1:K1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Weaver Fabric Sales Report";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.",
      "Date of Sale ",
      "Date",
      "Weaver Name",
      "Sold To",
      "Invoice Number",
      "Finished Batch/Lot No",
      "Fabric Type",
      "Agent Details",
      "Finished Fabric Length",
      "Total Fabric Net Length (Mts)",
    ]);
    headerRow.font = { bold: true };
    let include = [
      {
        model: Weaver,
        as: "weaver",
        attributes: ["id", "name", "address"],
      },
      {
        model: Season,
        as: "season",
        attributes: ["id", "name"],
      },
      {
        model: Program,
        as: "program",
        attributes: ["id", "program_name"],
      },
      {
        model: Garment,
        as: "buyer",
        attributes: ["id", "name", "address"],
      },
      {
        model: Fabric,
        as: "dyingwashing",
        attributes: ["id", "name", "address"],
      },
    ];

    //fetch data with pagination

    const { count, rows } = await WeaverFabricSelection.findAndCountAll({
      attributes: [
        [Sequelize.literal('"sales"."id"'), "sales_id"],
        [Sequelize.literal('"sales"."createdAt"'), "createdAt"],
        [Sequelize.literal('"sales"."date"'), "date"],
        [Sequelize.col('"sales"."season"."name"'), "season_name"],
        [Sequelize.col('"sales"."season"."id"'), "season_id"],
        [Sequelize.col('"sales"."weaver"."id"'), "weaver_id"],
        [Sequelize.col('"sales"."weaver"."name"'), "weaver"],
        [Sequelize.col('"sales"."program"."program_name"'), "program"],
        [Sequelize.col('"sales"."garment_order_ref"'), "garment_order_ref"],
        [Sequelize.col('"sales"."brand_order_ref"'), "brand_order_ref"],
        [Sequelize.col('"sales"."buyer_type"'), "buyer_type"],
        [Sequelize.col('"sales"."buyer_id"'), "garment_id"],
        [Sequelize.col('"sales"."fabric_id"'), "fabric_id"],
        [Sequelize.col('"sales"."buyer"."name"'), "garment"],
        [Sequelize.col('"sales"."dyingwashing"."name"'), "fabric"],
        [Sequelize.col('"sales"."processor_name"'), "processor_name"],
        [Sequelize.literal('"sales"."total_yarn_qty"'), "total_qty"],
        [Sequelize.literal('"sales"."invoice_no"'), "invoice_no"],
        [Sequelize.literal('"process"."batch_lot_no"'), "batch_lot_no"],
        [Sequelize.literal('"process"."reel_lot_no"'), "reel_lot_no"],
        [Sequelize.literal('"process"."fabric_type"'), "fabric_type"],
        [Sequelize.literal("qty_used"), "net_length"],
        [Sequelize.literal('"sales"."tc_file"'), "tc_files"],
        [Sequelize.literal('"sales"."contract_file"'), "contract_file"],
        [Sequelize.literal('"sales"."invoice_file"'), "invoice_file"],
        [Sequelize.literal('"sales"."delivery_notes"'), "delivery_notes"],
        [Sequelize.literal('"sales"."transporter_name"'), "transporter_name"],
        [Sequelize.literal('"sales"."vehicle_no"'), "vehicle_no"],
        [Sequelize.literal('"sales"."qr"'), "qr"],
        [Sequelize.literal('"sales"."transaction_agent"'), "transaction_agent"],
        [Sequelize.literal('"sales"."qty_stock"'), "qty_stock"],
        [Sequelize.literal('"sales"."status"'), "status"],
        [Sequelize.literal('"weaverfabric"."fabric_type"'), "fabricType"],
      ],
      where: whereCondition,
      include: [
        {
          model: WeaverSales,
          as: "sales",
          include: include,
          attributes: [],
        },
        {
          model: WeaverProcess,
          attributes: [],
          as: "process",
        },
        {
          model: WeaverFabric,
          attributes: [],
          as: "weaverfabric",
        },
      ],
      order: [["sales_id", "desc"]],
      offset: offset,
      limit: limit,
      raw: true
    });

    for await (let row of rows) {
      // if(row.dataValues?.fabric_type?.length > 0){
      //     for await (const [index, id] of row.dataValues?.fabric_type.entries() ){
      if (row.fabricType) {
        const fabrictype = await FabricType.findOne({
          where: {
            id: row.fabricType,
          },
          attributes: ["id", "fabricType_name"],
        });

        if (fabrictype) {
          row.fabricType = fabrictype
            ? fabrictype.dataValues?.fabricType_name
            : "";
        }
      }
    }

    // Append data to worksheet
    for await (const [index, item] of rows.entries()) {
      const rowValues = Object.values({
        index: index + 1,
        createdAt: item.createdAt ? item.createdAt : "",
        date: item.date ? item.date : "",
        weaver: item.weaver ? item.weaver : "",
        buyer: item.garment
          ? item.garment
          : item.fabric
            ? item.fabric
            : item.processor_name,
        invoice: item.invoice_no ? item.invoice_no : "",
        lotNo: item.batch_lot_no ? item.batch_lot_no : "",
        fabrictype: item.fabricType ? item.fabricType : "",
        transaction_agent: item.transaction_agent
          ? item.transaction_agent
          : "NA",
        fabric_length: item.net_length ? item.net_length : "",
        total_fabric_length: item.total_qty ? item.total_qty : "",
      });
      worksheet.addRow(rowValues);
    }
    // Auto-adjust column widths based on content
    worksheet.columns.forEach((column: any) => {
      let maxCellLength = 0;
      column.eachCell({ includeEmpty: true }, (cell: any) => {
        const cellLength = (cell.value ? cell.value.toString() : "").length;
        maxCellLength = Math.max(maxCellLength, cellLength);
      });
      column.width = Math.min(14, maxCellLength + 2); // Limit width to 30 characters
    });

    // Save the workbook
    await workbook.xlsx.writeFile(excelFilePath);
    // res.status(200).send({
    //   success: true,
    //   messgage: "File successfully Generated",
    //   data: process.env.BASE_URL + "weaver-fabric-sale-report.xlsx",
    // });
    await ExportData.update({
      weaver_yarn_sales_load: false
    }, { where: { weaver_yarn_sales_load: true } })
  } catch (error: any) {
    (async () => {
      await ExportData.update({
        weaver_yarn_sales_load: false
      }, { where: { weaver_yarn_sales_load: true } })
    })()
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

const fetchGarmentFabricReceipt = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const {
    weaverId,
    garmentId,
    knitterId,
    seasonId,
    programId,
    brandId,
    countryId,
    fabricType,
    startDate,
    endDate
  }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  const searchCondition: any = {};
  const weaverWhere: any = {};
  const knitterWhere: any = {};
  try {
    if (searchTerm) {
      searchCondition[Op.or] = [
        { "$sales.buyer.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.garment_order_ref$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.brand_order_ref$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.invoice_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.batch_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.transporter_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.vehicle_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.transaction_agent$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$process.reel_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$process.batch_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
      ];

      weaverWhere[Op.or] = [
        ...searchCondition[Op.or],
        { "$sales.weaver.name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];

      knitterWhere[Op.or] = [
        ...searchCondition[Op.or],
        { "$sales.knitter.name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    if (weaverId) {
      const idArray: number[] = weaverId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      weaverWhere["$sales.weaver_id$"] = { [Op.in]: idArray };
    }
    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      weaverWhere["$sales.weaver.brand$"] = { [Op.overlap]: idArray };
      knitterWhere["$sales.knitter.brand$"] = { [Op.overlap]: idArray };
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      weaverWhere["$sales.weaver.country_id$"] = { [Op.in]: idArray };
      knitterWhere["$sales.knitter.country_id$"] = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.season_id$"] = { [Op.in]: idArray };
    }

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.program_id$"] = { [Op.in]: idArray };
    }

    if (fabricType) {
      const idArray: any[] = fabricType
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$process.fabric_type$"] = { [Op.overlap]: idArray };
    }

    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereCondition.createdAt = { [Op.between]: [startOfDay, endOfDay] }
  }
    // Helper function to add conditions based on filter values
    const addFilterCondition = (whereObj: any, filterKey: string, arr: any) => {
      let idArray: number[] = arr
        ? arr.split(",").map((id: any) => parseInt(id, 10))
        : [0];
      if (idArray && idArray.length > 0) {
        whereObj[filterKey] = { [Op.in]: idArray };
      } else {
        // If no filter value provided, set an impossible condition to filter out all data
        whereObj[filterKey] = { [Op.in]: [0] };
      }
    };

    // Dynamically add conditions for each filter
    if (knitterId || weaverId) {
      addFilterCondition(knitterWhere, "$sales.knitter_id$", knitterId);
      addFilterCondition(weaverWhere, "$sales.weaver_id$", weaverId);
    }

    whereCondition["$sales.status$"] = "Sold";
    whereCondition["$sales.buyer_id$"] = { [Op.not]: null };

    if (garmentId) {
      const idArray: number[] = garmentId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.buyer_id$"] = { [Op.in]: idArray };
    }

    let include = [
      {
        model: Season,
        as: "season",
        attributes: ["id", "name"],
      },
      {
        model: Program,
        as: "program",
        attributes: ["id", "program_name"],
      },
      {
        model: Garment,
        as: "buyer",
        attributes: ["id", "name", "address"],
      },
    ];

    //fetch data with pagination

    let rows: any = await Promise.all([
      WeaverFabricSelection.findAll({
        attributes: [
          [Sequelize.literal('"sales"."id"'), "sales_id"],
          [Sequelize.literal('"sales"."accept_date"'), "accept_date"],
          [Sequelize.literal('"sales"."date"'), "date"],
          [Sequelize.col('"sales"."createdAt"'), "createdAt"],
          [Sequelize.col('"sales"."season"."name"'), "season_name"],
          [Sequelize.col('"sales"."season"."id"'), "season_id"],
          [Sequelize.col('"sales"."weaver"."id"'), "weaver_id"],
          [Sequelize.col('"sales"."weaver"."name"'), "weaver"],
          [Sequelize.col('"sales"."program"."program_name"'), "program"],
          [Sequelize.col('"sales"."garment_order_ref"'), "garment_order_ref"],
          [Sequelize.col('"sales"."brand_order_ref"'), "brand_order_ref"],
          [Sequelize.col('"sales"."buyer_type"'), "buyer_type"],
          [Sequelize.col('"sales"."buyer_id"'), "garment_id"],
          [Sequelize.col('"sales"."fabric_id"'), "fabric_id"],
          [Sequelize.col('"sales"."buyer"."name"'), "garment"],
          [Sequelize.literal('"sales"."total_yarn_qty"'), "total_length_qty"],
          [Sequelize.literal('"sales"."invoice_no"'), "invoice_no"],
          [Sequelize.literal('"process"."batch_lot_no"'), "batch_lot_no"],
          [Sequelize.literal('"process"."reel_lot_no"'), "reel_lot_no"],
          [Sequelize.literal('"process"."fabric_type"'), "fabric_type"],
          [Sequelize.literal("qty_used"), "net_length"],
          [Sequelize.literal('"sales"."tc_file"'), "tc_files"],
          [Sequelize.literal('"sales"."contract_file"'), "contract_file"],
          [Sequelize.literal('"sales"."invoice_file"'), "invoice_file"],
          [Sequelize.literal('"sales"."delivery_notes"'), "delivery_notes"],
          [Sequelize.literal('"sales"."transporter_name"'), "transporter_name"],
          [Sequelize.literal('"sales"."vehicle_no"'), "vehicle_no"],
          [Sequelize.literal('"sales"."qr"'), "qr"],
          [
            Sequelize.literal('"sales"."transaction_agent"'),
            "transaction_agent",
          ],
          [Sequelize.literal('"sales"."qty_stock"'), "qty_stock"],
          [Sequelize.literal('"sales"."status"'), "status"],
          [Sequelize.literal('"weaverfabric"."fabric_type"'), "fabricType"],
        ],
        where: {
          ...whereCondition,
          ...weaverWhere,
        },
        include: [
          {
            model: WeaverSales,
            as: "sales",
            include: [
              ...include,
              { model: Weaver, as: "weaver", attributes: ["id", "name"] },
            ],
            attributes: [],
          },
          {
            model: WeaverProcess,
            attributes: [],
            as: "process",
          },
          {
            model: WeaverFabric,
            attributes: [],
            as: "weaverfabric",
          },
        ],
        order: [["sales_id", "desc"]],
      }),
      KnitFabricSelection.findAll({
        attributes: [
          [Sequelize.literal('"sales"."id"'), "sales_id"],
          [Sequelize.literal('"sales"."accept_date"'), "accept_date"],
          [Sequelize.literal('"sales"."date"'), "date"],
          [Sequelize.col('"sales"."season"."name"'), "season_name"],
          [Sequelize.col('"sales"."season"."id"'), "season_id"],
          [Sequelize.col('"sales"."knitter"."id"'), "knitter_id"],
          [Sequelize.col('"sales"."knitter"."name"'), "knitter"],
          [Sequelize.col('"sales"."program"."program_name"'), "program"],
          [Sequelize.col('"sales"."garment_order_ref"'), "garment_order_ref"],
          [Sequelize.col('"sales"."brand_order_ref"'), "brand_order_ref"],
          [Sequelize.col('"sales"."buyer_type"'), "buyer_type"],
          [Sequelize.col('"sales"."buyer_id"'), "garment_id"],
          [Sequelize.col('"sales"."fabric_id"'), "fabric_id"],
          [Sequelize.col('"sales"."buyer"."name"'), "garment"],
          [Sequelize.literal('"sales"."total_yarn_qty"'), "total_weight_qty"],
          [Sequelize.literal('"sales"."invoice_no"'), "invoice_no"],
          [Sequelize.literal('"process"."batch_lot_no"'), "batch_lot_no"],
          [Sequelize.literal('"process"."reel_lot_no"'), "reel_lot_no"],
          [Sequelize.literal('"process"."fabric_type"'), "fabric_type"],
          [Sequelize.literal("qty_used"), "net_weight"],
          [Sequelize.literal('"sales"."tc_file"'), "tc_files"],
          [Sequelize.literal('"sales"."contract_file"'), "contract_file"],
          [Sequelize.literal('"sales"."invoice_file"'), "invoice_file"],
          [Sequelize.literal('"sales"."delivery_notes"'), "delivery_notes"],
          [Sequelize.literal('"sales"."transporter_name"'), "transporter_name"],
          [Sequelize.literal('"sales"."vehicle_no"'), "vehicle_no"],
          [Sequelize.literal('"sales"."qr"'), "qr"],
          [
            Sequelize.literal('"sales"."transaction_agent"'),
            "transaction_agent",
          ],
          [Sequelize.literal('"sales"."qty_stock"'), "qty_stock"],
          [Sequelize.literal('"sales"."status"'), "status"],
          [Sequelize.literal('"knitfabric"."fabric_type"'), "fabricType"]
        ],
        where: {
          ...whereCondition,
          ...knitterWhere,
        },
        include: [
          {
            model: KnitSales,
            as: "sales",
            include: [
              ...include,
              { model: Knitter, as: "knitter", attributes: ["id", "name"] },
            ],
            attributes: [],
          },
          {
            model: KnitProcess,
            attributes: [],
            as: "process",
          },
          {
            model: KnitFabric,
            attributes: [],
            as: "knitfabric",
          },
        ],
        order: [["sales_id", "desc"]],
      }),
    ]);

    let data = [];

    for await (let row of rows.flat()) {
      if (row.dataValues.fabricType) {
        const fabrictype = await FabricType.findOne({
          where: {
            id: row.dataValues.fabricType,
          },
          attributes: ["id", "fabricType_name"],
        });

        if (fabrictype) {
          row.dataValues.fabricType = fabrictype
            ? fabrictype.dataValues?.fabricType_name
            : "";
        }
      }
      data.push(row)
    }

    let result = data.slice(offset, offset + limit);

    return res.sendPaginationSuccess(res, result, data.length);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const exportGarmentFabricReceipt = async (req: Request, res: Response) => {
  // garment_fabric_receipt_load
  await ExportData.update({
    garment_fabric_receipt_load: true
  }, { where: { garment_fabric_receipt_load: false } })
  res.send({ status: 200, message: "export file processing" })
  const excelFilePath = path.join(
    "./upload",
    "garment-fabric-receipt-report.xlsx"
  );
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const {
    weaverId,
    garmentId,
    knitterId,
    seasonId,
    programId,
    brandId,
    countryId,
    fabricType,
    startDate,
    endDate
  }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  const searchCondition: any = {};
  const weaverWhere: any = {};
  const knitterWhere: any = {};
  try {
    if (searchTerm) {
      searchCondition[Op.or] = [
        { "$sales.buyer.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.garment_order_ref$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.brand_order_ref$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.invoice_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.batch_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.transporter_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.vehicle_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$sales.transaction_agent$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$process.reel_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$process.batch_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
      ];

      weaverWhere[Op.or] = [
        ...searchCondition[Op.or],
        { "$sales.weaver.name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];

      knitterWhere[Op.or] = [
        ...searchCondition[Op.or],
        { "$sales.knitter.name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    if (weaverId) {
      const idArray: number[] = weaverId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      weaverWhere["$sales.weaver_id$"] = { [Op.in]: idArray };
    }
    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      weaverWhere["$sales.weaver.brand$"] = { [Op.overlap]: idArray };
      knitterWhere["$sales.knitter.brand$"] = { [Op.overlap]: idArray };
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      weaverWhere["$sales.weaver.country_id$"] = { [Op.in]: idArray };
      knitterWhere["$sales.knitter.country_id$"] = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.season_id$"] = { [Op.in]: idArray };
    }

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.program_id$"] = { [Op.in]: idArray };
    }

    if (fabricType) {
      const idArray: any[] = fabricType
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$process.fabric_type$"] = { [Op.overlap]: idArray };
    }

    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereCondition.createdAt = { [Op.between]: [startOfDay, endOfDay] }
  }

    // Helper function to add conditions based on filter values
    const addFilterCondition = (whereObj: any, filterKey: string, arr: any) => {
      let idArray: number[] = arr
        ? arr.split(",").map((id: any) => parseInt(id, 10))
        : [0];
      if (idArray && idArray.length > 0) {
        whereObj[filterKey] = { [Op.in]: idArray };
      } else {
        // If no filter value provided, set an impossible condition to filter out all data
        whereObj[filterKey] = { [Op.in]: [0] };
      }
    };

    // Dynamically add conditions for each filter
    if (knitterId || weaverId) {
      addFilterCondition(knitterWhere, "$sales.knitter_id$", knitterId);
      addFilterCondition(weaverWhere, "$sales.weaver_id$", weaverId);
    }

    whereCondition["$sales.status$"] = "Sold";
    whereCondition["$sales.buyer_id$"] = { [Op.not]: null };

    if (garmentId) {
      const idArray: number[] = garmentId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$sales.buyer_id$"] = { [Op.in]: idArray };
    }

    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    worksheet.mergeCells("A1:L1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Garment Fabric Fabric Receipt Report";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };
    // Set bold font for header row
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.",
      "Date of accept transaction",
      "Date",
      "Weave/Knit Unit",
      "Garment Processor Unit",
      "Invoice Number",
      "Lot/Batch No",
      "Fabric Type",
      "Finished Fabric Length",
      "Total Fabric Net Length (Mts)",
      "Finished Fabric Weight",
      "Total Fabric Net Weight (Kgs)",
    ]);
    headerRow.font = { bold: true };
    let include = [
      {
        model: Season,
        as: "season",
        attributes: ["id", "name"],
      },
      {
        model: Program,
        as: "program",
        attributes: ["id", "program_name"],
      },
      {
        model: Garment,
        as: "buyer",
        attributes: ["id", "name", "address"],
      },
    ];

    //fetch data with pagination

    let rows: any = await Promise.all([
      WeaverFabricSelection.findAll({
        attributes: [
          [Sequelize.literal('"sales"."id"'), "sales_id"],
          [Sequelize.literal('"sales"."accept_date"'), "accept_date"],
          [Sequelize.literal('"sales"."date"'), "date"],
          [Sequelize.col('"sales"."season"."name"'), "season_name"],
          [Sequelize.col('"sales"."season"."id"'), "season_id"],
          [Sequelize.col('"sales"."weaver"."id"'), "weaver_id"],
          [Sequelize.col('"sales"."weaver"."name"'), "weaver"],
          [Sequelize.col('"sales"."program"."program_name"'), "program"],
          [Sequelize.col('"sales"."garment_order_ref"'), "garment_order_ref"],
          [Sequelize.col('"sales"."brand_order_ref"'), "brand_order_ref"],
          [Sequelize.col('"sales"."buyer_type"'), "buyer_type"],
          [Sequelize.col('"sales"."buyer_id"'), "garment_id"],
          [Sequelize.col('"sales"."fabric_id"'), "fabric_id"],
          [Sequelize.col('"sales"."buyer"."name"'), "garment"],
          [Sequelize.literal('"sales"."total_yarn_qty"'), "total_length_qty"],
          [Sequelize.literal('"sales"."invoice_no"'), "invoice_no"],
          [Sequelize.literal('"process"."batch_lot_no"'), "batch_lot_no"],
          [Sequelize.literal('"process"."reel_lot_no"'), "reel_lot_no"],
          [Sequelize.literal('"process"."fabric_type"'), "fabric_type"],
          [Sequelize.literal("qty_used"), "net_length"],
          [Sequelize.literal('"sales"."tc_file"'), "tc_files"],
          [Sequelize.literal('"sales"."contract_file"'), "contract_file"],
          [Sequelize.literal('"sales"."invoice_file"'), "invoice_file"],
          [Sequelize.literal('"sales"."delivery_notes"'), "delivery_notes"],
          [Sequelize.literal('"sales"."transporter_name"'), "transporter_name"],
          [Sequelize.literal('"sales"."vehicle_no"'), "vehicle_no"],
          [Sequelize.literal('"sales"."qr"'), "qr"],
          [
            Sequelize.literal('"sales"."transaction_agent"'),
            "transaction_agent",
          ],
          [Sequelize.literal('"sales"."qty_stock"'), "qty_stock"],
          [Sequelize.literal('"sales"."status"'), "status"],
          [Sequelize.literal('"weaverfabric"."fabric_type"'), "fabricType"],
        ],
        where: {
          ...whereCondition,
          ...weaverWhere,
        },
        include: [
          {
            model: WeaverSales,
            as: "sales",
            include: [
              ...include,
              { model: Weaver, as: "weaver", attributes: ["id", "name"] },
            ],
            attributes: [],
          },
          {
            model: WeaverProcess,
            attributes: [],
            as: "process",
          },
          {
            model: WeaverFabric,
            attributes: [],
            as: "weaverfabric",
          }
        ],
        order: [["sales_id", "desc"]],
        raw: true
      }),
      KnitFabricSelection.findAll({
        attributes: [
          [Sequelize.literal('"sales"."id"'), "sales_id"],
          [Sequelize.literal('"sales"."accept_date"'), "accept_date"],
          [Sequelize.literal('"sales"."date"'), "date"],
          [Sequelize.col('"sales"."season"."name"'), "season_name"],
          [Sequelize.col('"sales"."season"."id"'), "season_id"],
          [Sequelize.col('"sales"."knitter"."id"'), "knitter_id"],
          [Sequelize.col('"sales"."knitter"."name"'), "knitter"],
          [Sequelize.col('"sales"."program"."program_name"'), "program"],
          [Sequelize.col('"sales"."garment_order_ref"'), "garment_order_ref"],
          [Sequelize.col('"sales"."brand_order_ref"'), "brand_order_ref"],
          [Sequelize.col('"sales"."buyer_type"'), "buyer_type"],
          [Sequelize.col('"sales"."buyer_id"'), "garment_id"],
          [Sequelize.col('"sales"."fabric_id"'), "fabric_id"],
          [Sequelize.col('"sales"."buyer"."name"'), "garment"],
          [Sequelize.literal('"sales"."total_yarn_qty"'), "total_weight_qty"],
          [Sequelize.literal('"sales"."invoice_no"'), "invoice_no"],
          [Sequelize.literal('"process"."batch_lot_no"'), "batch_lot_no"],
          [Sequelize.literal('"process"."reel_lot_no"'), "reel_lot_no"],
          [Sequelize.literal('"process"."fabric_type"'), "fabric_type"],
          [Sequelize.literal("qty_used"), "net_weight"],
          [Sequelize.literal('"sales"."tc_file"'), "tc_files"],
          [Sequelize.literal('"sales"."contract_file"'), "contract_file"],
          [Sequelize.literal('"sales"."invoice_file"'), "invoice_file"],
          [Sequelize.literal('"sales"."delivery_notes"'), "delivery_notes"],
          [Sequelize.literal('"sales"."transporter_name"'), "transporter_name"],
          [Sequelize.literal('"sales"."vehicle_no"'), "vehicle_no"],
          [Sequelize.literal('"sales"."qr"'), "qr"],
          [
            Sequelize.literal('"sales"."transaction_agent"'),
            "transaction_agent",
          ],
          [Sequelize.literal('"sales"."qty_stock"'), "qty_stock"],
          [Sequelize.literal('"sales"."status"'), "status"],
          [Sequelize.literal('"knitfabric"."fabric_type"'), "fabricType"],
        ],
        where: {
          ...whereCondition,
          ...knitterWhere,
        },
        include: [
          {
            model: KnitSales,
            as: "sales",
            include: [
              ...include,
              { model: Knitter, as: "knitter", attributes: ["id", "name"] },
            ],
            attributes: [],
          },
          {
            model: KnitProcess,
            attributes: [],
            as: "process",
          },
          {
            model: KnitFabric,
            attributes: [],
            as: "knitfabric",
          },
        ],
        order: [["sales_id", "desc"]],
        raw: true
      }),
    ]);

    let data = [];

    for await (let row of rows.flat()) {
      if (row.fabricType) {
        const fabrictype = await FabricType.findOne({
          where: {
            id: row.fabricType,
          },
          attributes: ["id", "fabricType_name"],
        });

        if (fabrictype) {
          row.fabricType = fabrictype
            ? fabrictype.dataValues?.fabricType_name
            : "";
        }
      }
      data.push(row)
    }

    let result = data.slice(offset, offset + limit);
    // Append data to worksheet
    for await (const [index, item] of result.entries()) {
      const rowValues = Object.values({
        index: index + 1,
        accept_date: item.accept_date ? item.accept_date : "",
        date: item.date ? item.date : "",
        weaver: item.weaver ? item.weaver : item.knitter ? item.knitter : "",
        buyer: item.garment ? item.garment : "",
        invoice: item.invoice_no ? item.invoice_no : "",
        lotNo: item.batch_lot_no ? item.batch_lot_no : "",
        fabrictype: item.fabricType ? item.fabricType : "",
        fabric_length: item.net_length ? item.net_length : "",
        total_fabric_length: item.total_length_qty ? item.total_length_qty : "",
        fabric_weight: item.net_weight ? item.net_weight : "",
        total_fabric_weight: item.total_weight_qty ? item.total_weight_qty : "",
      });
      worksheet.addRow(rowValues);
    }
    // Auto-adjust column widths based on content
    worksheet.columns.forEach((column: any) => {
      let maxCellLength = 0;
      column.eachCell({ includeEmpty: true }, (cell: any) => {
        const cellLength = (cell.value ? cell.value.toString() : "").length;
        maxCellLength = Math.max(maxCellLength, cellLength);
      });
      column.width = Math.min(14, maxCellLength + 2); // Limit width to 30 characters
    });

    // Save the workbook
    await workbook.xlsx.writeFile(excelFilePath);
    // res.status(200).send({
    //   success: true,
    //   messgage: "File successfully Generated",
    //   data: process.env.BASE_URL + "garment-fabric-receipt-report.xlsx",
    // });
    await ExportData.update({
      garment_fabric_receipt_load: false
    }, { where: { garment_fabric_receipt_load: true } })
  } catch (error: any) {
    (async () => {
      await ExportData.update({
        garment_fabric_receipt_load: false
      }, { where: { garment_fabric_receipt_load: true } })
    })()
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

const fetchGarmentFabricProcess = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const {
    garmentId,
    seasonId,
    programId,
    brandId,
    countryId,
    fabricType,
    startDate,
    endDate
  }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { fabric_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { brand_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { factory_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$garment.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$department.dept_name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }

    if (garmentId) {
      const idArray: number[] = garmentId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.garment_id = { [Op.in]: idArray };
    }

    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$garment.brand$"] = { [Op.overlap]: idArray };
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$garment.country_id$"] = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.season_id = { [Op.in]: idArray };
    }

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.program_id = { [Op.in]: idArray };
    }

    if (fabricType) {
      const idArray: any[] = fabricType
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.fabric_type = { [Op.overlap]: idArray };
    }

    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereCondition.createdAt = { [Op.between]: [startOfDay, endOfDay] }
  }
    let include = [
      {
        model: Garment,
        as: "garment",
        attributes: ["id", "name", "address"],
      },
      {
        model: Season,
        as: "season",
        attributes: ["id", "name"],
      },
      {
        model: Program,
        as: "program",
        attributes: ["id", "program_name"],
      },
      {
        model: Department,
        as: "department",
      },
    ];

    const { count, rows } = await GarmentProcess.findAndCountAll({
      where: whereCondition,
      include: include,
      order: [["id", "desc"]],
    });

    let data = [];

    for await (let row of rows) {
      if (
        row.dataValues?.garment_type &&
        row.dataValues?.garment_type.length > 0
      ) {
        for await (const [
          index,
          garment,
        ] of row.dataValues?.garment_type.entries()) {
          // const fabrictype = await FabricType.findOne({
          //     where: {
          //         id:  id,
          //     },
          //     attributes: ['id', 'fabricType_name']
          // });

          data.push({
            ...row.dataValues,
            garmentType: garment,
            styleMarkNo:
              row.dataValues.style_mark_no &&
                row.dataValues.style_mark_no[index]
                ? row.dataValues.style_mark_no[index]
                : "",
            noOfPieces:
              row.dataValues.no_of_pieces && row.dataValues.no_of_pieces[index]
                ? row.dataValues.no_of_pieces[index]
                : "",
            noOfBoxes:
              row.dataValues.no_of_boxes && row.dataValues.no_of_boxes[index]
                ? row.dataValues.no_of_boxes[index]
                : "",
          });
        }
      }
    }

    let result = data.slice(offset, offset + limit);

    return res.sendPaginationSuccess(res, result, data.length);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

const exportGarmentFabricProcess = async (req: Request, res: Response) => {

  await ExportData.update({
    garment_fabric_process_load: true
  }, { where: { garment_fabric_process_load: false } })
  res.send({ status: 200, message: "export file processing" })
  const excelFilePath = path.join(
    "./upload",
    "garment-fabric-process-report.xlsx"
  );
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { garmentId, seasonId, programId, brandId, countryId, startDate, endDate }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { fabric_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { brand_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { factory_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$garment.name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }

    if (garmentId) {
      const idArray: number[] = garmentId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.garment_id = { [Op.in]: idArray };
    }

    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$garment.brand$"] = { [Op.overlap]: idArray };
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$garment.country_id$"] = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.season_id = { [Op.in]: idArray };
    }

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.program_id = { [Op.in]: idArray };
    }

    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereCondition.createdAt = { [Op.between]: [startOfDay, endOfDay] }
  }
    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    worksheet.mergeCells("A1:O1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Garment Fabric Process Report";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };
    // Set bold font for header row
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "S No.",
      "Process Date",
      "Date",
      "Season",
      "Garment Processor Unit",
      "Fabric Order Reference No.",
      "Brand Order Reference No.",
      "Factory Lot No.",
      "Garment Type",
      "Style Mark No.",
      "No. of Pieces",
      "No. of Boxes",
      "Total Fabric Weight(Kgs) - Knitted Fabric",
      "Total Fabric Length(Mts) - Woven Fabric",
    ]);
    headerRow.font = { bold: true };

    let include = [
      {
        model: Garment,
        as: "garment",
        attributes: ["id", "name", "address"],
      },
      {
        model: Season,
        as: "season",
        attributes: ["id", "name"],
      },
      {
        model: Program,
        as: "program",
        attributes: ["id", "program_name"],
      },
    ];

    const { count, rows } = await GarmentProcess.findAndCountAll({
      where: whereCondition,
      include: include,
      order: [["id", "desc"]],
    });

    let data = [];

    for await (let row of rows) {
      if (
        row.dataValues?.garment_type &&
        row.dataValues?.garment_type.length > 0
      ) {
        for await (const [
          index,
          garment,
        ] of row.dataValues?.garment_type.entries()) {
          // const fabrictype = await FabricType.findOne({
          //     where: {
          //         id:  id,
          //     },
          //     attributes: ['id', 'fabricType_name']
          // });

          data.push({
            ...row.dataValues,
            garmentType: garment,
            styleMarkNo:
              row.dataValues.style_mark_no &&
                row.dataValues.style_mark_no[index]
                ? row.dataValues.style_mark_no[index]
                : "",
            noOfPieces:
              row.dataValues.no_of_pieces && row.dataValues.no_of_pieces[index]
                ? row.dataValues.no_of_pieces[index]
                : "",
            noOfBoxes:
              row.dataValues.no_of_boxes && row.dataValues.no_of_boxes[index]
                ? row.dataValues.no_of_boxes[index]
                : "",
          });
        }
      }
    }

    let result = data.slice(offset, offset + limit);

    for await (const [index, item] of result.entries()) {
      const rowValues = Object.values({
        index: index + 1,
        createdAt: item.createdAt ? item.createdAt : "",
        date: item.date ? item.date : "",
        season: item.season ? item.season.name : "",
        garment: item.garment ? item.garment.name : "",
        fabricOrderRef: item.fabric_order_ref ? item.fabric_order_ref : "",
        brandOrderRef: item.brand_order_ref ? item.brand_order_ref : "",
        lotNo: item.factory_lot_no ? item.factory_lot_no : "",
        garmentType: item.garmentType ? item.garmentType : "",
        stylemarkNo: item.styleMarkNo ? item.styleMarkNo : "",
        noOfPieces: item.noOfPieces ? item.noOfPieces : "",
        noOfBoxes: item.noOfBoxes ? item.noOfBoxes : "",
        total_fabric_weight: item.total_fabric_weight
          ? item.total_fabric_weight
          : "",
        total_fabric_length: item.total_fabric_length
          ? item.total_fabric_length
          : "",
      });
      worksheet.addRow(rowValues);
    }
    // Auto-adjust column widths based on content
    worksheet.columns.forEach((column: any) => {
      let maxCellLength = 0;
      column.eachCell({ includeEmpty: true }, (cell: any) => {
        const cellLength = (cell.value ? cell.value.toString() : "").length;
        maxCellLength = Math.max(maxCellLength, cellLength);
      });
      column.width = Math.min(14, maxCellLength + 2); // Limit width to 30 characters
    });

    // Save the workbook
    await workbook.xlsx.writeFile(excelFilePath);
    // res.status(200).send({
    //   success: true,
    //   messgage: "File successfully Generated",
    //   data: process.env.BASE_URL + "garment-fabric-process-report.xlsx",
    // });
    await ExportData.update({
      garment_fabric_process_load: false
    }, { where: { garment_fabric_process_load: true } })
  } catch (error: any) {
    (async () => {
      await ExportData.update({
        garment_fabric_process_load: false
      }, { where: { garment_fabric_process_load: true } })
    })()
    console.log(error);
    return res.sendError(res, error.message);
  }
};

//fetch Weaver Sales with filters
const fetchGarmentSalesPagination = async (req: Request, res: Response) => {
  const searchTerm: any = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const {
    garmentId,
    seasonId,
    programId,
    brandId,
    countryId,
    departmentId,
    buyerId,
    styleMarkNo,
    garmentType,
    startDate,
    endDate
  }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { fabric_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { brand_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
        { vehicle_no: { [Op.iLike]: `%${searchTerm}%` } },
        { transaction_agent: { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$buyer.brand_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$garment.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { style_mark_no: { [Op.contains]: [`${searchTerm}`] } },
        { garment_type: { [Op.contains]: [`${searchTerm}`] } },
      ];
    }

    if (garmentId) {
      const idArray: number[] = garmentId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.garment_id = { [Op.in]: idArray };
    }

    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$garment.brand$"] = { [Op.overlap]: idArray };
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$garment.country_id$"] = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.season_id = { [Op.in]: idArray };
    }

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.program_id = { [Op.in]: idArray };
    }

    if (departmentId) {
      const idArray: number[] = departmentId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.department_id = { [Op.overlap]: idArray };
    }

    if (buyerId) {
      const idArray: number[] = buyerId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.buyer_id = { [Op.in]: idArray };
    }

    if (styleMarkNo) {
      const idArray: any[] = styleMarkNo.split(",").map((id: any) => id);
      whereCondition.style_mark_no = { [Op.overlap]: idArray };
    }
    if (garmentType) {
      const idArray: any[] = garmentType.split(",").map((id: any) => id);
      whereCondition.garment_type = { [Op.overlap]: idArray };
    }
    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereCondition.createdAt = { [Op.between]: [startOfDay, endOfDay] }
  }

    let include = [
      {
        model: Garment,
        as: "garment",
        attributes: ["id", "name", "address"],
      },
      {
        model: Season,
        as: "season",
      },
      {
        model: Program,
        as: "program",
      },
      {
        model: Brand,
        as: "buyer",
        attributes: ["id", "brand_name", "address"],
      },
    ];
    //fetch data with pagination

    const { count, rows } = await GarmentSales.findAndCountAll({
      where: whereCondition,
      include: include,
      order: [["id", "desc"]],
    });

    let data = [];

    for await (let row of rows) {
      if (
        row.dataValues?.garment_type &&
        row.dataValues?.garment_type.length > 0
      ) {
        for await (const [
          index,
          garment,
        ] of row.dataValues?.garment_type.entries()) {
          data.push({
            ...row.dataValues,
            garmentType: garment,
            styleMarkNo:
              row.dataValues.style_mark_no &&
                row.dataValues.style_mark_no[index]
                ? row.dataValues.style_mark_no[index]
                : "",
            noOfPieces:
              row.dataValues.no_of_pieces && row.dataValues.no_of_pieces[index]
                ? row.dataValues.no_of_pieces[index]
                : "",
            noOfBoxes:
              row.dataValues.no_of_boxes && row.dataValues.no_of_boxes[index]
                ? row.dataValues.no_of_boxes[index]
                : "",
          });
        }
      }
    }

    let result = data.slice(offset, offset + limit);

    return res.sendPaginationSuccess(res, result, data.length);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

const exportGarmentSales = async (req: Request, res: Response) => {
  // garment_fabric_sales_load
  await ExportData.update({
    garment_fabric_sales_load: true
  }, { where: { garment_fabric_sales_load: false } })
  res.send({ status: 200, message: "export file processing" })
  const excelFilePath = path.join(
    "./upload",
    "garment-fabric-sale-report.xlsx"
  );
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const {
    garmentId,
    seasonId,
    programId,
    brandId,
    countryId,
    departmentId,
    buyerId,
    styleMarkNo,
    garmentType,
    startDate,
    endDate
  }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { fabric_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { brand_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
        { vehicle_no: { [Op.iLike]: `%${searchTerm}%` } },
        { transaction_agent: { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$buyer.brand_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$garment.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { style_mark_no: { [Op.contains]: [`${searchTerm}`] } },
        { garment_type: { [Op.contains]: [`${searchTerm}`] } },
      ];
    }
    if (garmentId) {
      const idArray: number[] = garmentId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.garment_id = { [Op.in]: idArray };
    }

    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$garment.brand$"] = { [Op.overlap]: idArray };
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$garment.country_id$"] = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.season_id = { [Op.in]: idArray };
    }

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.program_id = { [Op.in]: idArray };
    }

    if (departmentId) {
      const idArray: number[] = departmentId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.department_id = { [Op.overlap]: idArray };
    }

    if (buyerId) {
      const idArray: number[] = buyerId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.buyer_id = { [Op.in]: idArray };
    }

    if (styleMarkNo) {
      const idArray: any[] = styleMarkNo.split(",").map((id: any) => id);
      whereCondition.style_mark_no = { [Op.overlap]: idArray };
    }
    if (garmentType) {
      const idArray: any[] = garmentType.split(",").map((id: any) => id);
      whereCondition.garment_type = { [Op.overlap]: idArray };
    }

    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereCondition.createdAt = { [Op.between]: [startOfDay, endOfDay] }
  }
    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    worksheet.mergeCells("A1:P1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Garment Fabric Sales Report";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };
    // Set bold font for header row
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "S No.",
      "Date of Sale",
      "Date",
      "Garment Unit Name",
      "Customer (R&B) Name",
      "Invoice No",
      "Fabric Order Reference",
      "Brand Order Reference",
      "Garment Type",
      "Mark/Style No",
      "Total No. of Boxes/Cartons",
      "Total No. of Pieces",
      "Agent Details",
      "QR code",
    ]);
    headerRow.font = { bold: true };

    let include = [
      {
        model: Garment,
        as: "garment",
        attributes: ["id", "name", "address"],
      },
      {
        model: Season,
        as: "season",
      },
      {
        model: Program,
        as: "program",
      },
      {
        model: Brand,
        as: "buyer",
        attributes: ["id", "brand_name", "address"],
      },
    ];

    const { count, rows } = await GarmentSales.findAndCountAll({
      where: whereCondition,
      include: include,
      order: [["id", "desc"]],
    });

    let data = [];

    for await (let row of rows) {
      if (
        row.dataValues?.garment_type &&
        row.dataValues?.garment_type.length > 0
      ) {
        for await (const [
          index,
          garment,
        ] of row.dataValues?.garment_type.entries()) {
          data.push({
            ...row.dataValues,
            garmentType: garment,
            styleMarkNo:
              row.dataValues.style_mark_no &&
                row.dataValues.style_mark_no[index]
                ? row.dataValues.style_mark_no[index]
                : "",
            noOfPieces:
              row.dataValues.no_of_pieces && row.dataValues.no_of_pieces[index]
                ? row.dataValues.no_of_pieces[index]
                : "",
            noOfBoxes:
              row.dataValues.no_of_boxes && row.dataValues.no_of_boxes[index]
                ? row.dataValues.no_of_boxes[index]
                : "",
          });
        }
      }
    }

    let result = data.slice(offset, offset + limit);

    for await (const [index, item] of result.entries()) {
      const rowValues = Object.values({
        index: index + 1,
        createdAt: item.createdAt ? item.createdAt : "",
        date: item.date ? item.date : "",
        garment_name: item.garment ? item.garment.name : "",
        buyer: item.buyer ? item.buyer.brand_name : item.processor_name,
        invoice: item.invoice_no ? item.invoice_no : "",
        fabricOrderRef: item.fabric_order_ref ? item.fabric_order_ref : "",
        brandOrderRef: item.brand_order_ref ? item.brand_order_ref : "",
        garmentType: item.garmentType ? item.garmentType : "",
        stylemarkNo: item.styleMarkNo ? item.styleMarkNo : "",
        no_of_boxes: item.total_no_of_boxes ? item.total_no_of_boxes : "",
        no_of_pieces: item.total_no_of_pieces ? item.total_no_of_pieces : "",
        transaction_agent: item.transaction_agent ? item.transaction_agent : "",
        color: item.qr ? process.env.BASE_URL + item.qr : "",
      });
      worksheet.addRow(rowValues);
    }
    // Auto-adjust column widths based on content
    worksheet.columns.forEach((column: any) => {
      let maxCellLength = 0;
      column.eachCell({ includeEmpty: true }, (cell: any) => {
        const cellLength = (cell.value ? cell.value.toString() : "").length;
        maxCellLength = Math.max(maxCellLength, cellLength);
      });
      column.width = Math.min(14, maxCellLength + 2); // Limit width to 30 characters
    });

    // Save the workbook
    await workbook.xlsx.writeFile(excelFilePath);
    // res.status(200).send({
    //   success: true,
    //   messgage: "File successfully Generated",
    //   data: process.env.BASE_URL + "garment-fabric-sale-report.xlsx",
    // });
    await ExportData.update({
      garment_fabric_sales_load: false
    }, { where: { garment_fabric_sales_load: true } })
  } catch (error: any) {
    console.error("Error appending data:", error);
    (async () => {
      await ExportData.update({
        garment_fabric_sales_load: false
      }, { where: { garment_fabric_sales_load: true } })
    })()
    return res.sendError(res, error.message);
  }
};

//filter Style Mark and garment type for Garment Fabric Sales Report
const getGarmentSalesFilter = async (req: Request, res: Response) => {
  try {
    const types = await GarmentSales.findAll({
      attributes: ["garment_type"],
      group: ["garment_type"],
    });

    let garmentTypes: any = [];

    if (types && types.length > 0) {
      for await (let row of types) {
        garmentTypes = [
          ...garmentTypes,
          ...new Set(row?.dataValues?.garment_type?.map((item: any) => item)),
        ];
      }
    }

    let style = await GarmentSales.findAll({
      attributes: ["style_mark_no"],
      group: ["style_mark_no"],
    });

    let styleMarkNo: any = [];

    if (style && style.length > 0) {
      for await (let row of style) {
        styleMarkNo = [
          ...styleMarkNo,
          ...new Set(row?.dataValues?.style_mark_no?.map((item: any) => item)),
        ];
      }
    }

    res.sendSuccess(res, { styleMarkNo, garmentTypes });
  } catch (error: any) {
    res.sendError(res, error.message);
  }
};

//fetch Qr Code Tracker with filters
const fetchQrCodeTrackPagination = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const {
    garmentId,
    seasonId,
    programId,
    brandId,
    countryId,
    departmentId,
    buyerId,
    styleMarkNo,
    garmentType,
    startDate,
    endDate
  }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$buyer.brand_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$garment.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { style_mark_no: { [Op.contains]: [`${searchTerm}`] } },
        { garment_type: { [Op.contains]: [`${searchTerm}`] } },
      ];
    }
    whereCondition.status = "Sold";

    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.buyer_id = { [Op.in]: idArray };
    }
    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.season_id = { [Op.in]: idArray };
    }

    if (styleMarkNo) {
      const idArray: any[] = styleMarkNo.split(",").map((id: any) => id);
      whereCondition.style_mark_no = { [Op.overlap]: idArray };
    }
    if (garmentType) {
      const idArray: any[] = garmentType.split(",").map((id: any) => id);
      whereCondition.garment_type = { [Op.overlap]: idArray };
    }

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.program_id = { [Op.in]: idArray };
    }
    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereCondition.createdAt = { [Op.between]: [startOfDay, endOfDay] }
  }

    let include = [
      {
        model: Brand,
        as: "buyer",
        attributes: ["id", "brand_name", "address"],
      },
      {
        model: Season,
        as: "season",
      },
      {
        model: Program,
        as: "program",
      },
      {
        model: Garment,
        as: "garment",
        attributes: ["id", "name", "address"],
      },
    ];

    //fetch data with pagination

    const { count, rows } = await GarmentSales.findAndCountAll({
      where: whereCondition,
      include: include,
      order: [["id", "desc"]],
      offset: offset,
      limit: limit,
    });
    return res.sendPaginationSuccess(res, rows, count);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const exportQrCodeTrack = async (req: Request, res: Response) => {
  // qr_code_tracker_load
  await ExportData.update({
    qr_code_tracker_load: true
  }, { where: { qr_code_tracker_load: false } })
  res.send({ status: 200, message: "export file processing" })
  const excelFilePath = path.join("./upload", "barcode-report.xlsx");
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const {
    garmentId,
    seasonId,
    programId,
    brandId,
    countryId,
    departmentId,
    buyerId,
    styleMarkNo,
    garmentType,
    startDate,
    endDate
  }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$buyer.brand_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$garment.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { style_mark_no: { [Op.contains]: [`${searchTerm}`] } },
        { garment_type: { [Op.contains]: [`${searchTerm}`] } },
      ];
    }
    whereCondition.status = "Sold";

    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.buyer_id = { [Op.in]: idArray };
    }
    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.season_id = { [Op.in]: idArray };
    }

    if (styleMarkNo) {
      const idArray: any[] = styleMarkNo.split(",").map((id: any) => id);
      whereCondition.style_mark_no = { [Op.overlap]: idArray };
    }
    if (garmentType) {
      const idArray: any[] = garmentType.split(",").map((id: any) => id);
      whereCondition.garment_type = { [Op.overlap]: idArray };
    }

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.program_id = { [Op.in]: idArray };
    }
   if (startDate && endDate) {
            const startOfDay = new Date(startDate);
            startOfDay.setUTCHours(0, 0, 0, 0);
            const endOfDay = new Date(endDate);
            endOfDay.setUTCHours(23, 59, 59, 999);
            whereCondition.createdAt = { [Op.between]: [startOfDay, endOfDay] }
        }
    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    worksheet.mergeCells("A1:I1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Barcode Report";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "S No.",
      "Qr Code",
      "Brand Name",
      "Garment unit Name",
      "Invoice No",
      "Garment Type",
      "Style/Mark No",
      "Total No. of Pieces",
      "Program",
    ]);
    headerRow.font = { bold: true };
    let include = [
      {
        model: Brand,
        as: "buyer",
        attributes: ["id", "brand_name", "address"],
      },
      {
        model: Season,
        as: "season",
      },
      {
        model: Program,
        as: "program",
      },
      {
        model: Garment,
        as: "garment",
        attributes: ["id", "name", "address"],
      },
    ];
    const { count, rows } = await GarmentSales.findAndCountAll({
      where: whereCondition,
      include: include,
      order: [["id", "desc"]],
      offset: offset,
      limit: limit,
    });
    // Append data to worksheet
    for await (const [index, item] of rows.entries()) {
      const rowValues = Object.values({
        index: index + 1,
        qrCode: item.qr ? process.env.BASE_URL + item.qr : "",
        buyer: item.buyer ? item.buyer.brand_name : item.processor_name,
        garment: item.garment ? item.garment.name : "",
        invoice: item.invoice_no ? item.invoice_no : "",
        garmentType:
          item.garment_type && item.garment_type.length > 0
            ? item.garment_type.join(", ")
            : "",
        mark:
          item.style_mark_no && item.style_mark_no.length > 0
            ? item.style_mark_no.join(", ")
            : "",
        no_of_pieces: item.total_no_of_pieces ? item.total_no_of_pieces : "",
        program: item.program ? item.program.program_name : "",
      });
      worksheet.addRow(rowValues);
    }
    // Auto-adjust column widths based on content
    worksheet.columns.forEach((column: any) => {
      let maxCellLength = 0;
      column.eachCell({ includeEmpty: true }, (cell: any) => {
        const cellLength = (cell.value ? cell.value.toString() : "").length;
        maxCellLength = Math.max(maxCellLength, cellLength);
      });
      column.width = Math.min(24, maxCellLength + 2); // Limit width to 30 characters
    });

    // Save the workbook
    await workbook.xlsx.writeFile(excelFilePath);
    // res.status(200).send({
    //   success: true,
    //   messgage: "File successfully Generated",
    //   data: process.env.BASE_URL + "barcode-report.xlsx",
    // });
    await ExportData.update({
      qr_code_tracker_load: false
    }, { where: { qr_code_tracker_load: true } })
  } catch (error: any) {
    (async () => {
      await ExportData.update({
        qr_code_tracker_load: false
      }, { where: { qr_code_tracker_load: true } })
    })()
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

//fetch Spinner sales with filters
const fetchSpinnerSummaryPagination = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const { spinnerId, seasonId, programId, brandId, countryId }: any = req.query;
  const whereCondition: any = {};
  const lintCondition: any = {};
  const ginSalesCondition: any = {};
  const spinSalesCondition: any = {};
  const spinProcessCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [{ name: { [Op.iLike]: `%${searchTerm}%` } }];
    }

    if (spinnerId) {
      const idArray: number[] = spinnerId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.id = { [Op.in]: idArray };
    }

    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.brand = { [Op.overlap]: idArray };
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
      lintCondition["$spinprocess.program_id$"] = { [Op.in]: idArray };
      ginSalesCondition.program_id = { [Op.in]: idArray };
      spinSalesCondition.program_id = { [Op.in]: idArray };
      spinProcessCondition.program_id = { [Op.in]: idArray };
    }

    let { count, rows } = await Spinner.findAndCountAll({
      where: whereCondition,
      attributes: ["id", "name", "address"],
      offset: offset,
      limit: limit,
    });
    let result: any = [];
    for await (let spinner of rows) {
      let obj: any = {};
      let wheree: any = {};
      if (seasonId) {
        const idArray: number[] = seasonId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        wheree.season_id = { [Op.in]: idArray };
        lintCondition["$spinprocess.season_id$"] = { [Op.in]: idArray };
      }

      let [
        lint_cotton_procured,
        lint_cotton_procured_pending,
        lint_consumed,
        yarnProcured,
        yarnSold,
      ] = await Promise.all([
        GinSales.findOne({
          attributes: [
            [
              sequelize.fn(
                "COALESCE",
                sequelize.fn("SUM", sequelize.col("total_qty")),
                0
              ),
              "lint_cotton_procured",
            ],
            [
              sequelize.fn(
                "COALESCE",
                sequelize.fn("SUM", sequelize.col("qty_stock")),
                0
              ),
              "lint_cotton_stock",
            ],
          ],
          where: {
            ...wheree,
            ...ginSalesCondition,
            buyer: spinner.id,
            status: "Sold",
          },
        }),
        GinSales.findOne({
          attributes: [
            [
              sequelize.fn(
                "COALESCE",
                sequelize.fn("SUM", sequelize.col("total_qty")),
                0
              ),
              "lint_cotton_procured_pending",
            ],
          ],
          where: {
            ...wheree,
            ...ginSalesCondition,
            buyer: spinner.id,
            status: "Pending for QR scanning",
          },
        }),
        LintSelections.findOne({
          attributes: [
            [
              sequelize.fn(
                "COALESCE",
                sequelize.fn("SUM", sequelize.col("qty_used")),
                0
              ),
              "lint_cotton_consumed",
            ],
          ],
          include: [
            {
              model: SpinProcess,
              as: "spinprocess",
              attributes: [],
            },
          ],
          where: {
            ...lintCondition,
            "$spinprocess.spinner_id$": spinner.id,
          },
          group: ["spinprocess.spinner_id"],
        }),
        SpinProcess.findOne({
          attributes: [
            [
              sequelize.fn(
                "COALESCE",
                sequelize.fn("SUM", sequelize.col("net_yarn_qty")),
                0
              ),
              "yarn_procured",
            ],
            [
              sequelize.fn(
                "COALESCE",
                sequelize.fn("SUM", sequelize.col("qty_stock")),
                0
              ),
              "yarn_stock",
            ],
          ],
          where: {
            ...wheree,
            ...spinProcessCondition,
            spinner_id: spinner.id,
          },
        }),
        SpinSales.findOne({
          attributes: [
            [
              sequelize.fn(
                "COALESCE",
                sequelize.fn("SUM", sequelize.col("total_qty")),
                0
              ),
              "yarn_sold",
            ],
          ],
          where: {
            ...wheree,
            ...spinSalesCondition,
            spinner_id: spinner.id,
          },
        }),
      ]);
      obj.lintCottonProcuredKG = lint_cotton_procured
        ? lint_cotton_procured?.dataValues.lint_cotton_procured ?? 0
        : 0;
      obj.lintCottonProcuredPendingKG = lint_cotton_procured_pending
        ? lint_cotton_procured_pending?.dataValues
          .lint_cotton_procured_pending ?? 0
        : 0;
      obj.lintConsumedKG = lint_consumed
        ? lint_consumed?.dataValues.lint_cotton_consumed ?? 0
        : 0;
      obj.lintStockKG = lint_cotton_procured
        ? lint_cotton_procured?.dataValues.lint_cotton_stock ?? 0
        : 0;
      obj.yarnProcuredKG = yarnProcured
        ? yarnProcured?.dataValues.yarn_procured ?? 0
        : 0;
      obj.yarnSoldKG = yarnSold ? yarnSold.dataValues.yarn_sold ?? 0 : 0;
      obj.yarnStockKG = yarnProcured
        ? yarnProcured?.dataValues.yarn_stock ?? 0
        : 0;
      obj.lintCottonProcuredMT = convert_kg_to_mt(obj.lintCottonProcuredKG);
      obj.lintCottonProcuredPendingMT = convert_kg_to_mt(
        obj.lintCottonProcuredPendingKG
      );
      obj.lintConsumedMT = convert_kg_to_mt(obj.lintConsumedKG);
      obj.lintStockMT = convert_kg_to_mt(obj.lintStockKG);
      obj.yarnSoldMT = convert_kg_to_mt(obj.yarnSoldKG);
      obj.yarnProcuredMT = convert_kg_to_mt(obj.yarnProcuredKG);
      obj.yarnStockMT = convert_kg_to_mt(obj.yarnStockKG);
      result.push({ ...obj, spinner });
    }
    //fetch data with pagination

    return res.sendPaginationSuccess(res, result, count);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const exportSpinnerSummary = async (req: Request, res: Response) => {
  // spinner_summary_load
  const excelFilePath = path.join("./upload", "excel-spinner-summary.xlsx");

  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const { exportType, spinnerId, seasonId, programId, brandId, countryId }: any = req.query;
  const whereCondition: any = {};
  const lintCondition: any = {};
  const ginSalesCondition: any = {};
  const spinSalesCondition: any = {};
  const spinProcessCondition: any = {};

  try {

    if (exportType === "all") {
      return res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "spinner-summary.xlsx",
      });

    } else {

    if (searchTerm) {
      whereCondition[Op.or] = [{ name: { [Op.iLike]: `%${searchTerm}%` } }];
    }

    if (spinnerId) {
      const idArray: number[] = spinnerId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.id = { [Op.in]: idArray };
    }

    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.brand = { [Op.overlap]: idArray };
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
      lintCondition["$spinprocess.program_id$"] = { [Op.in]: idArray };
      ginSalesCondition.program_id = { [Op.in]: idArray };
      spinSalesCondition.program_id = { [Op.in]: idArray };
      spinProcessCondition.program_id = { [Op.in]: idArray };
    }

    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    worksheet.mergeCells("A1:I1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Spinner Summary Report";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.",
      "Spinner Name",
      "Total Lint Cotton Procured MT (Accepted)",
      "Total Lint Cotton Procured MT (Pending)",
      "Lint cotton processed in MT",
      "Balance Lint cotton stock in MT",
      "Total Yarn Produced MT",
      "Yarn sold in MT",
      "Yarn stock in MT",
    ]);
    headerRow.font = { bold: true };

    let { count, rows } = await Spinner.findAndCountAll({
      where: whereCondition,
      attributes: ["id", "name", "address"],
      offset: offset,
      limit: limit,
    });

    // Append data to worksheet
    for await (const [index, item] of rows.entries()) {
      let obj: any = {};
      let wheree: any = {};

      if (seasonId) {
        const idArray: number[] = seasonId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        wheree.season_id = { [Op.in]: idArray };
        lintCondition["$spinprocess.season_id$"] = { [Op.in]: idArray };
      }

      let [
        lint_cotton_procured,
        lint_cotton_procured_pending,
        lint_consumed,
        yarnProcured,
        yarnSold,
      ] = await Promise.all([
        GinSales.findOne({
          attributes: [
            [
              sequelize.fn(
                "COALESCE",
                sequelize.fn("SUM", sequelize.col("total_qty")),
                0
              ),
              "lint_cotton_procured",
            ],
            [
              sequelize.fn(
                "COALESCE",
                sequelize.fn("SUM", sequelize.col("qty_stock")),
                0
              ),
              "lint_cotton_stock",
            ],
          ],
          where: {
            ...wheree,
            ...ginSalesCondition,
            buyer: item.id,
            status: "Sold",
          },
        }),
        GinSales.findOne({
          attributes: [
            [
              sequelize.fn(
                "COALESCE",
                sequelize.fn("SUM", sequelize.col("total_qty")),
                0
              ),
              "lint_cotton_procured_pending",
            ],
          ],
          where: {
            ...wheree,
            ...ginSalesCondition,
            buyer: item.id,
            status: "Pending for QR scanning",
          },
        }),
        LintSelections.findOne({
          attributes: [
            [
              sequelize.fn(
                "COALESCE",
                sequelize.fn("SUM", sequelize.col("qty_used")),
                0
              ),
              "lint_cotton_consumed",
            ],
          ],
          include: [
            {
              model: SpinProcess,
              as: "spinprocess",
              attributes: [],
            },
          ],
          where: {
            ...lintCondition,
            "$spinprocess.spinner_id$": item.id,
          },
          group: ["spinprocess.spinner_id"],
        }),
        SpinProcess.findOne({
          attributes: [
            [
              sequelize.fn(
                "COALESCE",
                sequelize.fn("SUM", sequelize.col("net_yarn_qty")),
                0
              ),
              "yarn_procured",
            ],
            [
              sequelize.fn(
                "COALESCE",
                sequelize.fn("SUM", sequelize.col("qty_stock")),
                0
              ),
              "yarn_stock",
            ],
          ],
          where: {
            ...wheree,
            ...spinProcessCondition,
            spinner_id: item.id,
          },
        }),
        SpinSales.findOne({
          attributes: [
            [
              sequelize.fn(
                "COALESCE",
                sequelize.fn("SUM", sequelize.col("total_qty")),
                0
              ),
              "yarn_sold",
            ],
          ],
          where: {
            ...wheree,
            ...spinSalesCondition,
            spinner_id: item.id,
          },
        }),
      ]);


      obj.lintCottonProcuredKG = lint_cotton_procured
      ? lint_cotton_procured?.dataValues.lint_cotton_procured ?? 0
      : 0;
      obj.lintCottonProcuredPendingKG = lint_cotton_procured_pending
        ? lint_cotton_procured_pending?.dataValues
            .lint_cotton_procured_pending ?? 0
        : 0;
      obj.lintConsumedKG = lint_consumed
        ? lint_consumed?.dataValues.lint_cotton_consumed ?? 0
        : 0;
      obj.lintStockKG = lint_cotton_procured
        ? lint_cotton_procured?.dataValues.lint_cotton_stock ?? 0
        : 0;
      obj.yarnProcuredKG = yarnProcured
        ? yarnProcured?.dataValues.yarn_procured ?? 0
        : 0;
      obj.yarnSoldKG = yarnSold ? yarnSold.dataValues.yarn_sold ?? 0 : 0;
      obj.yarnStockKG = yarnProcured
        ? yarnProcured?.dataValues.yarn_stock ?? 0
        : 0;
      obj.lintCottonProcuredMT = convert_kg_to_mt(obj.lintCottonProcuredKG);
      obj.lintCottonProcuredPendingMT = convert_kg_to_mt(
        obj.lintCottonProcuredPendingKG
      );
      obj.lintConsumedMT = convert_kg_to_mt(obj.lintConsumedKG);
      obj.lintStockMT = convert_kg_to_mt(obj.lintStockKG);
      obj.yarnSoldMT = convert_kg_to_mt(obj.yarnSoldKG);
      obj.yarnProcuredMT = convert_kg_to_mt(obj.yarnProcuredKG);
      obj.yarnStockMT = convert_kg_to_mt(obj.yarnStockKG);


      const rowValues = Object.values({
        index: index + 1,
        name: item.name ? item.name : "",
        lint_cotton_procured: obj.lintCottonProcuredMT ? Number(obj.lintCottonProcuredMT) : 0,
        lint_cotton_procured_pending: obj.lintCottonProcuredPendingMT ? Number(obj.lintCottonProcuredPendingMT) : 0,
        lint_consumed: obj.lintConsumedMT ? Number(obj.lintConsumedMT) : 0,
        balance_lint_cotton: obj.lintStockMT ? Number(obj.lintStockMT) : 0,
        yarn_procured: obj.yarnProcuredMT ? Number(obj.yarnProcuredMT) : 0,
        yarn_sold: obj.yarnSoldMT ? Number(obj.yarnSoldMT) : 0,
        yarn_stock: obj.yarnStockMT ? Number(obj.yarnStockMT) : 0,
      });
      worksheet.addRow(rowValues);
    }
    // Auto-adjust column widths based on content
    worksheet.columns.forEach((column: any) => {
      let maxCellLength = 0;
      column.eachCell({ includeEmpty: true }, (cell: any) => {
        const cellLength = (cell.value ? cell.value.toString() : "").length;
        maxCellLength = Math.max(maxCellLength, cellLength);
      });
      column.width = Math.min(24, maxCellLength + 2); // Limit width to 30 characters
    });

    // Save the workbook
    await workbook.xlsx.writeFile(excelFilePath);
    res.status(200).send({
      success: true,
      messgage: "File successfully Generated",
      data: process.env.BASE_URL + "excel-spinner-summary.xlsx",
    });
  }

  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

function convert_kg_to_mt(number: any) {
  return (number / 1000).toFixed(2);
}

const fetchGinnerSummaryPagination = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const { ginnerId, seasonId, programId, brandId, countryId }: any = req.query;
  const whereCondition: any = {};
  const transactionWhere: any = {};
  const ginBaleWhere: any = {};
  const baleSelectionWhere: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [{ name: { [Op.iLike]: `%${searchTerm}%` } }];
    }

    if (ginnerId) {
      const idArray: number[] = ginnerId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.id = { [Op.in]: idArray };
    }

    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.brand = { [Op.overlap]: idArray };
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
      transactionWhere.program_id = { [Op.in]: idArray };
      ginBaleWhere["$ginprocess.program_id$"] = { [Op.in]: idArray };
      baleSelectionWhere["$sales.program_id$"] = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      transactionWhere.season_id = { [Op.in]: idArray };
      ginBaleWhere["$ginprocess.season_id$"] = { [Op.in]: idArray };
      baleSelectionWhere["$sales.season_id$"] = { [Op.in]: idArray };
    }

    let { count, rows } = await Ginner.findAndCountAll({
      where: whereCondition,
      attributes: ["id", "name", "address"],
      offset: offset,
      limit: limit,
    });
    let result: any = [];
    for await (let ginner of rows) {
      let obj: any = {};

      let [cottonProcured, cottonProcessed, lintProcured, lintSold]: any =
        await Promise.all([
          Transaction.findOne({
            attributes: [
              [
                sequelize.fn(
                  "COALESCE",
                  sequelize.fn(
                    "SUM",
                    Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")
                  ),
                  0
                ),
                "qty",
              ],
            ],
            where: {
              ...transactionWhere,
              mapped_ginner: ginner.id,
            },
          }),
          Transaction.findOne({
            attributes: [
              [
                sequelize.fn(
                  "COALESCE",
                  sequelize.fn(
                    "SUM",
                    Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")
                  ),
                  0
                ),
                "qty",
              ],
            ],
            where: {
              ...transactionWhere,
              mapped_ginner: ginner.id,
              status: "Sold",
            },
          }),
          GinBale.findOne({
            attributes: [
              [
                sequelize.fn(
                  "COALESCE",
                  sequelize.fn(
                    "SUM",
                    sequelize.literal(
                      'CAST("gin-bales"."weight" AS DOUBLE PRECISION)'
                    )
                  ),
                  0
                ),
                "qty",
              ],
              [
                sequelize.fn(
                  "COUNT",
                  Sequelize.literal('DISTINCT "gin-bales"."id"')
                ),
                "bales_procured",
              ],
            ],
            include: [
              {
                model: GinProcess,
                as: "ginprocess",
                attributes: [],
              },
            ],
            where: {
              ...ginBaleWhere,
              "$ginprocess.ginner_id$": ginner.id,
            },
            group: ["ginprocess.ginner_id"],
          }),
          BaleSelection.findOne({
            attributes: [
              [
                sequelize.fn(
                  "COALESCE",
                  sequelize.fn(
                    "SUM",
                    sequelize.literal(
                      'CAST("bale"."weight" AS DOUBLE PRECISION)'
                    )
                  ),
                  0
                ),
                "qty",
              ],
              [
                sequelize.fn("COUNT", Sequelize.literal("DISTINCT bale_id")),
                "bales_sold",
              ],
            ],
            include: [
              {
                model: GinSales,
                as: "sales",
                attributes: [],
              },
              {
                model: GinBale,
                as: "bale",
                attributes: [],
              },
            ],
            where: {
              ...baleSelectionWhere,
              "$sales.ginner_id$": ginner.id,
            },
            group: ["sales.ginner_id"],
          }),
        ]);
      obj.cottonProcuredKg = cottonProcured?.dataValues?.qty ?? 0;
      obj.cottonProcessedKg = cottonProcessed?.dataValues?.qty ?? 0;
      obj.cottonStockKg = cottonProcured
        ? cottonProcured?.dataValues?.qty -
        (cottonProcessed ? cottonProcessed?.dataValues?.qty : 0)
        : 0;
      obj.cottonProcuredMt = convert_kg_to_mt(
        cottonProcured?.dataValues.qty ?? 0
      );
      obj.cottonProcessedeMt = convert_kg_to_mt(
        cottonProcessed?.dataValues.qty ?? 0
      );
      obj.cottonStockMt = convert_kg_to_mt(
        cottonProcured
          ? cottonProcured?.dataValues?.qty -
          (cottonProcessed ? cottonProcessed?.dataValues?.qty : 0)
          : 0
      );
      obj.lintProcuredKg = lintProcured?.dataValues.qty ?? 0;
      obj.lintProcuredMt = convert_kg_to_mt(lintProcured?.dataValues.qty ?? 0);
      obj.lintSoldKg = lintSold?.dataValues.qty ?? 0;
      obj.lintSoldMt = convert_kg_to_mt(lintSold?.dataValues.qty ?? 0);
      obj.lintStockKg =
        Number(obj.lintProcuredKg) > Number(obj.lintSoldKg)
          ? Number(obj.lintProcuredKg) - Number(obj.lintSoldKg)
          : 0;
      obj.lintStockMt =
        Number(obj.lintProcuredKg) > Number(obj.lintSoldKg)
          ? Number(obj.lintProcuredMt) - Number(obj.lintSoldMt)
          : 0;
      obj.balesProduced = lintProcured?.dataValues?.bales_procured
        ? Number(lintProcured?.dataValues?.bales_procured)
        : 0;
      obj.balesSold = lintSold?.dataValues?.bales_sold
        ? Number(lintSold?.dataValues?.bales_sold)
        : 0;
      obj.balesStock =
        obj.balesProduced > obj.balesSold
          ? obj.balesProduced - obj.balesSold
          : 0;
      result.push({ ...obj, ginner });
    }
    //fetch data with pagination

    return res.sendPaginationSuccess(res, result, count);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};


// const exportGinnerSummary = async (req: Request, res: Response) => {
//   const excelFilePath = path.join("./upload", "excel-ginner-summary.xlsx");

//   const searchTerm = req.query.search || "";
//   const { exportType, spinnerId, seasonId, programId, brandId, countryId }: any = req.query;
//   const whereCondition: any = {};
//   const transactionWhere: any = {};
//   const ginBaleWhere: any = {};
//   const baleSelectionWhere: any = {};

//   try {
//     if (exportType === "all") {

//       return res.status(200).send({
//         success: true,
//         messgage: "File successfully Generated",
//         data: process.env.BASE_URL + "ginner-summary.xlsx",
//       });

//     } else {
//       if (searchTerm) {
//         whereCondition[Op.or] = [{ name: { [Op.iLike]: `%${searchTerm}%` } }];
//       }

//       if (spinnerId) {
//         const idArray: number[] = spinnerId
//           .split(",")
//           .map((id: any) => parseInt(id, 10));
//         whereCondition.id = { [Op.in]: idArray };
//       }

//       if (brandId) {
//         const idArray: number[] = brandId
//           .split(",")
//           .map((id: any) => parseInt(id, 10));
//         whereCondition.brand = { [Op.overlap]: idArray };
//       }

//       if (countryId) {
//         const idArray: number[] = countryId
//           .split(",")
//           .map((id: any) => parseInt(id, 10));
//         whereCondition.countryId = { [Op.in]: idArray };
//       }
//       if (programId) {
//         const idArray: number[] = programId
//           .split(",")
//           .map((id: any) => parseInt(id, 10));
//         whereCondition.programId = { [Op.in]: idArray };
//         // ginBaleWhere["$ginprocess.program_id$"] = { [Op.in]: idArray };
//         // baleSelectionWhere["$sales.program_id$"] = { [Op.in]: idArray };
//       }

//       if (seasonId) {
//         const idArray: number[] = seasonId
//           .split(",")
//           .map((id: any) => parseInt(id, 10));
//         whereCondition.seasonId = { [Op.in]: idArray };
//         // ginBaleWhere["$ginprocess.season_id$"] = { [Op.in]: idArray };
//         // baleSelectionWhere["$sales.season_id$"] = { [Op.in]: idArray };
//       }

//       // Create the excel workbook file
//       const workbook = new ExcelJS.Workbook();
//       const worksheet = workbook.addWorksheet("Sheet1");
//       worksheet.mergeCells("A1:K1");
//       const mergedCell = worksheet.getCell("A1");
//       mergedCell.value = "CottonConnect | Ginner Summary Report";
//       mergedCell.font = { bold: true };
//       mergedCell.alignment = { horizontal: "center", vertical: "middle" };
//       // Set bold font for header row
//       const headerRow = worksheet.addRow([
//         "S. No.",
//         "Ginner Name",
//         "Total seed cotton procured (MT)",
//         "Total seed cotton processed (MT)",
//         "Total seed cotton in stock (MT)",
//         "Total lint produce (MT)",
//         "Total lint sold (MT)",
//         "Total lint in stock (MT)",
//         "Total bales produce",
//         "Total bales sold",
//         "Total bales in stock",
//       ]);
//       headerRow.font = { bold: true };
//       let rows = await ExportGinnerSummary.findAll({
//         where: whereCondition,
//         //   attributes: ["id", "name", "address"],
//       });
//       // Append data to worksheet
//       for await (const [index, item] of rows.entries()) {
//         let obj: any = {};


//         const rowValues = Object.values({
//           index: index + 1,
//           name: item.name ? item.name : "",
//           cottonProcuredMt: item.cottonProcuredMt,
//           cottonProcessedeMt: item.cottonProcessedeMt,
//           cottonStockMt: item.cottonStockMt,
//           lintProcuredMt: item.lintProcuredMt,
//           lintSoldMt: item.lintSoldMt,
//           lintStockMt: item.lintStockMt,
//           balesProduced: item.balesProduced,
//           balesSold: item.balesSold,
//           balesStock: item.balesStock,
//         });
//         worksheet.addRow(rowValues);
//       }
//       // Auto-adjust column widths based on content
//       worksheet.columns.forEach((column: any) => {
//         let maxCellLength = 0;
//         column.eachCell({ includeEmpty: true }, (cell: any) => {
//           const cellLength = (cell.value ? cell.value.toString() : "").length;
//           maxCellLength = Math.max(maxCellLength, cellLength);
//         });
//         column.width = Math.min(24, maxCellLength + 2); // Limit width to 30 characters
//       });

//       // Save the workbook
//       await workbook.xlsx.writeFile(excelFilePath);

//       res.status(200).send({
//         success: true,
//         messgage: "File successfully Generated",
//         data: process.env.BASE_URL + "excel-ginner-summary.xlsx",
//       });
//     }
//   } catch (error: any) {
//     console.error("Error appending data:", error);
//   }

// };

const exportGinnerSummary = async (req: Request, res: Response) => {
  const excelFilePath = path.join("./upload", "excel-ginner-summary.xlsx");

  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const { exportType, ginnerId, seasonId, programId, brandId, countryId }: any = req.query;
  const whereCondition: any = {};
  const transactionWhere: any = {};
  const ginBaleWhere: any = {};
  const baleSelectionWhere: any = {};

  try {
    if (exportType === "all") {
      return res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "ginner-summary.xlsx",
      });

    } else {
      if (searchTerm) {
        whereCondition[Op.or] = [{ name: { [Op.iLike]: `%${searchTerm}%` } }];
      }
  
      if (ginnerId) {
        const idArray: number[] = ginnerId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition.id = { [Op.in]: idArray };
      }
  
      if (brandId) {
        const idArray: number[] = brandId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition.brand = { [Op.overlap]: idArray };
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
        transactionWhere.program_id = { [Op.in]: idArray };
        ginBaleWhere["$ginprocess.program_id$"] = { [Op.in]: idArray };
        baleSelectionWhere["$sales.program_id$"] = { [Op.in]: idArray };
      }
  
      if (seasonId) {
        const idArray: number[] = seasonId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        transactionWhere.season_id = { [Op.in]: idArray };
        ginBaleWhere["$ginprocess.season_id$"] = { [Op.in]: idArray };
        baleSelectionWhere["$sales.season_id$"] = { [Op.in]: idArray };
      }
  

      // Create the excel workbook file
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet1");
      worksheet.mergeCells('A1:K1');
      const mergedCell = worksheet.getCell('A1');
      mergedCell.value = 'CottonConnect | Ginner Summary Report';
      mergedCell.font = { bold: true };
      mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
      // Set bold font for header row
      const headerRow = worksheet.addRow([
        "S. No.", "Ginner Name", "Total seed cotton procured (MT)", "Total seed cotton processed (MT)",
        "Total seed cotton in stock (MT)", "Total lint produce (MT)", "Total lint sold (MT)", "Total lint in stock (MT)",
        "Total bales produce", "Total bales sold", "Total bales in stock"
      ]);
      headerRow.font = { bold: true };
      let rows = await Ginner.findAll({ where: whereCondition, attributes: ["id", "name", "address"],
      offset: offset,
      limit: limit, });

      // Append data to worksheet
      for await (const [index, item] of rows.entries()) {
        let obj: any = {};


        let [cottonProcured, cottonProcessed, lintProcured, lintSold]: any = await Promise.all([
          Transaction.findOne({
            attributes: [
              [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")), 0), 'qty']
            ],
            where: {
              ...transactionWhere,
              mapped_ginner: item.id
            }
          }),
          Transaction.findOne({
            attributes: [
              [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")), 0), 'qty']
            ],
            where: {
              ...transactionWhere,
              mapped_ginner: item.id,
              status: 'Sold'
            }
          }),
          GinBale.findOne({
            attributes: [
              [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.literal('CAST("gin-bales"."weight" AS DOUBLE PRECISION)')), 0), 'qty'],
              [sequelize.fn('COUNT', Sequelize.literal('DISTINCT "gin-bales"."id"')), 'bales_procured'],
            ],
            include: [
              {
                model: GinProcess,
                as: 'ginprocess',
                attributes: []
              }
            ],
            where: {
              ...ginBaleWhere,
              '$ginprocess.ginner_id$': item.id
            },
            group: ["ginprocess.ginner_id"]
          }),
          BaleSelection.findOne({
            attributes: [
              [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.literal('CAST("bale"."weight" AS DOUBLE PRECISION)')), 0), 'qty'],
              [sequelize.fn('COUNT', Sequelize.literal('DISTINCT bale_id')), 'bales_sold'],

            ],
            include: [
              {
                model: GinSales,
                as: 'sales',
                attributes: []
              },
              {
                model: GinBale,
                as: 'bale',
                attributes: []
              }
            ],
            where: {
              ...baleSelectionWhere,
              '$sales.ginner_id$': item.id
            },
            group: ["sales.ginner_id"]
          }),
        ])
        obj.cottonProcuredKg = cottonProcured?.dataValues?.qty ?? 0;
        obj.cottonProcessedKg = cottonProcessed?.dataValues?.qty ?? 0;
        obj.cottonStockKg = cottonProcured ?
          cottonProcured?.dataValues?.qty - (cottonProcessed ? cottonProcessed?.dataValues?.qty : 0)
          : 0;
        obj.cottonProcuredMt = convert_kg_to_mt(cottonProcured?.dataValues.qty ?? 0);
        obj.cottonProcessedeMt = convert_kg_to_mt(cottonProcessed?.dataValues.qty ?? 0);
        obj.cottonStockMt = convert_kg_to_mt(cottonProcured ?
          cottonProcured?.dataValues?.qty - (cottonProcessed ? cottonProcessed?.dataValues?.qty : 0)
          : 0);
        obj.lintProcuredKg = lintProcured?.dataValues.qty ?? 0;
        obj.lintProcuredMt = convert_kg_to_mt(lintProcured?.dataValues.qty ?? 0);
        obj.lintSoldKg = lintSold?.dataValues.qty ?? 0;
        obj.lintSoldMt = convert_kg_to_mt(lintSold?.dataValues.qty ?? 0);
        obj.lintStockKg = Number(obj.lintProcuredKg) > Number(obj.lintSoldKg) ? Number(obj.lintProcuredKg) - Number(obj.lintSoldKg) : 0;
        obj.lintStockMt = Number(obj.lintProcuredKg) > Number(obj.lintSoldKg) ? Number(obj.lintProcuredMt) - Number(obj.lintSoldMt) : 0;
        obj.balesProduced = lintProcured?.dataValues?.bales_procured ? Number(lintProcured?.dataValues?.bales_procured) : 0;
        obj.balesSold = lintSold?.dataValues?.bales_sold ? Number(lintSold?.dataValues?.bales_sold) : 0;
        obj.balesStock = obj.balesProduced > obj.balesSold ? obj.balesProduced - obj.balesSold : 0;

        const rowValues = Object.values({
          index: index + 1,
          name: item.name ? item.name : '',
          cottonProcuredMt: obj.cottonProcuredMt ? Number(obj.cottonProcuredMt) : 0,
          cottonProcessedeMt: obj.cottonProcessedeMt ? Number(obj.cottonProcessedeMt) : 0,
          cottonStockMt: obj.cottonStockMt ? Number(obj.cottonStockMt) : 0,
          lintProcuredMt: obj.lintProcuredMt ? Number(obj.lintProcuredMt) : 0,
          lintSoldMt: obj.lintSoldMt ? Number(obj.lintSoldMt) : 0,
          lintStockMt: obj.lintStockMt,
          balesProduced: obj.balesProduced,
          balesSold: obj.balesSold,
          balesStock: obj.balesStock
        });
        worksheet.addRow(rowValues);
      }
      // Auto-adjust column widths based on content
      worksheet.columns.forEach((column: any) => {
        let maxCellLength = 0;
        column.eachCell({ includeEmpty: true }, (cell: any) => {
          const cellLength = (cell.value ? cell.value.toString() : '').length;
          maxCellLength = Math.max(maxCellLength, cellLength);
        });
        column.width = Math.min(24, maxCellLength + 2); // Limit width to 30 characters
      });

      // Save the workbook
      await workbook.xlsx.writeFile(excelFilePath);
      res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "excel-ginner-summary.xlsx",
      });
    }
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);

  }
};

const fetchGinnerCottonStock = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const { ginnerId, seasonId, programId, brandId, countryId }: any = req.query;
  const whereCondition: any = {};
  const transactionWhere: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
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
      whereCondition["$ginner.brand$"] = { [Op.overlap]: idArray };
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$ginner.country_id$"] = { [Op.in]: idArray };
    }

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      transactionWhere.program_id = { [Op.in]: idArray };
      whereCondition.program_id = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.season_id = { [Op.in]: idArray };
    }

    let include = [
      {
        model: Ginner,
        as: "ginner",
        attributes: [],
      },
      {
        model: Season,
        as: "season",
        attributes: [],
      },
      {
        model: Program,
        as: "program",
        attributes: [],
      },
    ];

    let { count, rows } = await GinProcess.findAndCountAll({
      attributes: [
        [Sequelize.literal('"ginner"."id"'), "ginner_id"],
        [Sequelize.literal('"ginner"."name"'), "ginner_name"],
        [Sequelize.literal('"season"."id"'), "season_id"],
        [Sequelize.col('"season"."name"'), "season_name"],
        // [Sequelize.literal('"program"."program_name"'), 'program_name'],
        [
          sequelize.fn(
            "COALESCE",
            sequelize.fn("SUM", sequelize.col("total_qty")),
            0
          ),
          "cotton_processed",
        ],
      ],
      where: whereCondition,
      include: include,
      group: ["ginner.id", "season.id"],
      order: [["ginner_id", "desc"]],
      limit: limit,
      offset: offset,
    });
    let result: any = [];
    for await (let ginner of rows) {
      let obj: any = {};
      const cottonProcured = await Transaction.findOne({
        attributes: [
          [
            sequelize.fn(
              "COALESCE",
              sequelize.fn(
                "SUM",
                Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")
              ),
              0
            ),
            "cotton_procured",
          ],
          [
            sequelize.fn(
              "COALESCE",
              sequelize.fn(
                "SUM",
                Sequelize.literal("CAST(qty_stock AS DOUBLE PRECISION)")
              ),
              0
            ),
            "cotton_stock",
          ],
        ],
        where: {
          ...transactionWhere,
          mapped_ginner: ginner.ginner_id,
          status: "Sold",
        },
      });

      obj.cotton_procured = cottonProcured?.dataValues?.cotton_procured ?? 0;
      obj.cotton_stock = cottonProcured?.dataValues?.cotton_stock ?? 0;
      result.push({ ...ginner?.dataValues, ...obj });
    }
    //fetch data with pagination

    // let data = result.slice(offset, offset + limit);

    return res.sendPaginationSuccess(res, result, count?.length);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

const exportGinnerCottonStock = async (req: Request, res: Response) => {
  const excelFilePath = path.join(
    "./upload",
    "excel-ginner-seed-cotton-stock-report.xlsx"
  );
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const { exportType, ginnerId, seasonId, programId, brandId, countryId }: any = req.query;
  const whereCondition: any = {};
  const transactionWhere: any = {};
  try {
    if (exportType === "all") {

      return res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "ginner-seed-cotton-stock-report.xlsx",
      });

    } else {
      if (searchTerm) {
        whereCondition[Op.or] = [
          { "$ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        ];
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
        whereCondition["$ginner.brand$"] = { [Op.overlap]: idArray };
      }
  
      if (countryId) {
        const idArray: number[] = countryId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$ginner.country_id$"] = { [Op.in]: idArray };
      }
  
      if (programId) {
        const idArray: number[] = programId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        transactionWhere.program_id = { [Op.in]: idArray };
        whereCondition.program_id = { [Op.in]: idArray };
      }
  
      if (seasonId) {
        const idArray: number[] = seasonId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition.season_id = { [Op.in]: idArray };
      }  

      // Create the excel workbook file
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet1");
      worksheet.mergeCells("A1:F1");
      const mergedCell = worksheet.getCell("A1");
      mergedCell.value = "CottonConnect | Ginner Seed Cotton Stock Report";
      mergedCell.font = { bold: true };
      mergedCell.alignment = { horizontal: "center", vertical: "middle" };
      // Set bold font for header row
      const headerRow = worksheet.addRow([
        "Sr No.",
        "Ginner Name",
        "Season",
        "Total Seed Cotton Procured (Kgs)",
        "Total Seed Cotton in Processed (Kgs)",
        "Total Seed Cotton in Stock (Kgs)",
      ]);
      headerRow.font = { bold: true };

      let include = [
        {
          model: Ginner,
          as: "ginner",
          attributes: [],
        },
        {
          model: Season,
          as: "season",
          attributes: [],
        },
        {
          model: Program,
          as: "program",
          attributes: [],
        },
      ];

      let { count, rows } = await GinProcess.findAndCountAll({
        attributes: [
          [Sequelize.literal('"ginner"."id"'), "ginner_id"],
          [Sequelize.literal('"ginner"."name"'), "ginner_name"],
          [Sequelize.literal('"season"."id"'), "season_id"],
          [Sequelize.col('"season"."name"'), "season_name"],
          // [Sequelize.literal('"program"."program_name"'), 'program_name'],
          [
            sequelize.fn(
              "COALESCE",
              sequelize.fn("SUM", sequelize.col("total_qty")),
              0
            ),
            "cotton_processed",
          ],
        ],
        where: whereCondition,
        include: include,
        group: ["ginner.id", "season.id"],
        order: [["ginner_id", "desc"]],
        limit: limit,
        offset: offset,
      });
      let result: any = [];
      for await (let [index, item] of rows.entries()) {
        let obj: any = {};
        const cottonProcured = await Transaction.findOne({
          attributes: [
            [
              sequelize.fn(
                "COALESCE",
                sequelize.fn(
                  "SUM",
                  Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")
                ),
                0
              ),
              "cotton_procured",
            ],
            [
              sequelize.fn(
                "COALESCE",
                sequelize.fn(
                  "SUM",
                  Sequelize.literal("CAST(qty_stock AS DOUBLE PRECISION)")
                ),
                0
              ),
              "cotton_stock",
            ],
          ],
          where: {
            ...transactionWhere,
            mapped_ginner: item.ginner_id,
            status: "Sold",
          },
        });

        obj.cotton_procured = cottonProcured?.dataValues?.cotton_procured ?? 0;
        obj.cotton_stock = cottonProcured?.dataValues?.cotton_stock ?? 0;

        const rowValues = Object.values({
          index: index + 1,
          ginner: item?.dataValues.ginner_name ? item?.dataValues.ginner_name : "",
          season: item?.dataValues.season_name ? item?.dataValues.season_name : "",
          cotton_procured: obj.cotton_procured ? obj.cotton_procured : 0,
          cotton_processed: item?.dataValues?.cotton_processed ? item?.dataValues?.cotton_processed : 0,
          cotton_stock: obj.cotton_stock ? obj.cotton_stock : 0,
        });
        worksheet.addRow(rowValues);
      }

      // Auto-adjust column widths based on content
      worksheet.columns.forEach((column: any) => {
        let maxCellLength = 0;
        column.eachCell({ includeEmpty: true }, (cell: any) => {
          const cellLength = (cell.value ? cell.value.toString() : "").length;
          maxCellLength = Math.max(maxCellLength, cellLength);
        });
        column.width = Math.min(14, maxCellLength + 2); // Limit width to 30 characters
      });

      // Save the workbook
      await workbook.xlsx.writeFile(excelFilePath);
      return res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "excel-ginner-seed-cotton-stock-report.xlsx",
      });
    }
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);

  }
};


const fetchSpinnerLintCottonStock = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const { spinnerId, seasonId, programId, brandId, countryId }: any = req.query;
  const whereCondition: any = {};
  const transactionWhere: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$spinprocess.spinner.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$spinprocess.season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        // { "$spinprocess.batch_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }

    if (spinnerId) {
      const idArray: number[] = spinnerId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$spinprocess.spinner_id$"] = { [Op.in]: idArray };
    }

    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$spinprocess.spinner.brand$"] = { [Op.overlap]: idArray };
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$spinprocess.spinner.country_id$"] = { [Op.in]: idArray };
    }

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$spinprocess.program_id$"] = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$spinprocess.season_id$"] = { [Op.in]: idArray };
    }

    let include = [
      {
        model: Spinner,
        as: "spinner",
        attributes: [],
      },
      {
        model: Season,
        as: "season",
        attributes: [],
      },
      {
        model: Program,
        as: "program",
        attributes: [],
      },
    ];

    // let rows = await SpinProcess.findAll({
    //     attributes:[
    //         'id',
    //         'batch_lot_no',
    //         [Sequelize.literal('"spinner"."id"'), 'spinner_id'],
    //         [Sequelize.literal('"spinner"."name"'), 'spinner_name'],
    //         [Sequelize.literal('"season"."id"'), 'season_id'],
    //         [Sequelize.col('"season"."name"'), 'season_name'],
    //         [Sequelize.fn('group_concat', Sequelize.literal('distinct(gls.invoice_no)')), 'invoice_no'],
    //         [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total_qty')), 0), 'cotton_processed']
    // ],
    //     where: whereCondition,
    //     include: include,
    //     group: ['spinner.id','season.id'],
    //     order: [["spinner_id","desc"]]
    // });

    let { count, rows } = await LintSelections.findAndCountAll({
      attributes: [
        [Sequelize.col('"spinprocess"."spinner"."id"'), "spinner_id"],
        [Sequelize.col('"spinprocess"."spinner"."name"'), "spinner_name"],
        [Sequelize.col('"spinprocess"."season"."id"'), "season_id"],
        [Sequelize.col('"spinprocess"."season"."name"'), "season_name"],
        [Sequelize.fn('STRING_AGG', Sequelize.literal('DISTINCT "spinprocess"."batch_lot_no"'), ', ' ) , "batch_lot_no"],
        [Sequelize.fn('STRING_AGG', Sequelize.literal('DISTINCT "ginsales"."invoice_no"'), ', ' ) , "invoice_no"],
        [Sequelize.fn('ARRAY_AGG', Sequelize.literal('DISTINCT "ginsales"."id"')), "sales_ids"],
        [
          sequelize.fn(
            "COALESCE",
            sequelize.fn("SUM", sequelize.col("qty_used")),
            0
          ),
          "cotton_consumed",
        ],
      ],
      where: whereCondition,
      include: [
        {
          model: SpinProcess,
          as: "spinprocess",
          include: include,
          attributes: [],
        },
        {
          model: GinSales,
          as: "ginsales",
          attributes: [],
        },
      ],
      group: ["spinprocess.spinner.id", "spinprocess.season.id"],
      order: [["spinner_id", "desc"]],
      offset: offset,
      limit: limit,
    });

    let ndata = [];
    for await (let spinner of rows) {
      let salesData = await BaleSelection.findAll({
        attributes: [
          [Sequelize.col('"bale->ginprocess"."reel_lot_no"'), "reel_lot_no"],
        ],
        where: {
          sales_id: {[Op.in] : spinner?.dataValues?.sales_ids}
        },
        include: [
          {
            model: GinBale,
            as: "bale",
            include: [
              {
                model: GinProcess,
                as: "ginprocess",
                attributes: [],
              },
            ],
            attributes: [],
          },
        ],
      });

      let reelLotNo = salesData && salesData.length > 0 ? [...new Set(salesData.map((item: any) => item?.dataValues?.reel_lot_no))].join(',') : "";

      let procuredCotton = await GinSales.findOne({
        attributes: [
          [
            sequelize.fn(
              "COALESCE",
              sequelize.fn("SUM", sequelize.col("total_qty")),
              0
            ),
            "cotton_procured",
          ],
        ],
        where: {
          buyer: spinner?.dataValues?.spinner_id,
          season_id: spinner?.dataValues?.season_id,
          status: "Sold",
        },
      });

      ndata.push({
        ...spinner?.dataValues,
        reel_lot_no: reelLotNo,
        cotton_procured: procuredCotton
            ? procuredCotton?.dataValues?.cotton_procured
            : 0,
        cotton_stock:
          Number(procuredCotton?.dataValues?.cotton_procured) >
            Number(spinner?.dataValues?.cotton_consumed)
            ? Number(procuredCotton?.dataValues?.cotton_procured) -
            Number(spinner?.dataValues?.cotton_consumed)
            : 0,

      })

    }

    return res.sendPaginationSuccess(res, ndata, count.length);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};


const exportSpinnerCottonStock = async (req: Request, res: Response) => {
  const excelFilePath = path.join(
    "./upload",
    "excel-spinner-lint-cotton-stock-report.xlsx"
  );
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const { exportType, spinnerId, seasonId, programId, brandId, countryId }: any = req.query;
  const whereCondition: any = {};

  try {
    if (exportType === "all") {

      return res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "spinner-lint-cotton-stock-report.xlsx",
      });

    } else {
      if (searchTerm) {
        whereCondition[Op.or] = [
          { "$spinprocess.spinner.name$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$spinprocess.season.name$": { [Op.iLike]: `%${searchTerm}%` } },
          // { "$spinprocess.batch_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
        ];
      }

      if (spinnerId) {
        const idArray: number[] = spinnerId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$spinprocess.spinner_id$"] = { [Op.in]: idArray };
      }

      if (brandId) {
        const idArray: number[] = brandId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$spinprocess.spinner.brand$"] = {
          [Op.overlap]: idArray,
        };
      }

      if (countryId) {
        const idArray: number[] = countryId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$spinprocess.spinner.country_id$"] = {
          [Op.in]: idArray,
        };
      }

      if (programId) {
        const idArray: number[] = programId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$spinprocess.program_id$"] = { [Op.in]: idArray };
      }

      if (seasonId) {
        const idArray: number[] = seasonId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$spinprocess.season_id$"] = { [Op.in]: idArray };
      }

      // Create the excel workbook file
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet1");
      worksheet.mergeCells("A1:I1");
      const mergedCell = worksheet.getCell("A1");
      mergedCell.value = "CottonConnect | Spinner Lint Cotton Stock Report";
      mergedCell.font = { bold: true };
      mergedCell.alignment = { horizontal: "center", vertical: "middle" };
      // Set bold font for header row
      const headerRow = worksheet.addRow([
        "Sr No.",
        "Spinner Name",
        "Season",
        "Spin Lot No",
        "Reel Lot No",
        "Invoice No",
        "Total Lint Cotton Received (Kgs)",
        "Total Lint Cotton Consumed (Kgs)",
        "Total Lint Cotton in Stock (Kgs)",
      ]);
      headerRow.font = { bold: true };

      let include = [
        {
          model: Spinner,
          as: "spinner",
          attributes: [],
        },
        {
          model: Season,
          as: "season",
          attributes: [],
        },
        {
          model: Program,
          as: "program",
          attributes: [],
        },
      ];


      let { count, rows } = await LintSelections.findAndCountAll({
        attributes: [
          [Sequelize.col('"spinprocess"."spinner"."id"'), "spinner_id"],
          [Sequelize.col('"spinprocess"."spinner"."name"'), "spinner_name"],
          [Sequelize.col('"spinprocess"."season"."id"'), "season_id"],
          [Sequelize.col('"spinprocess"."season"."name"'), "season_name"],
          [Sequelize.fn('STRING_AGG', Sequelize.literal('DISTINCT "spinprocess"."batch_lot_no"'), ', ' ) , "batch_lot_no"],
          [Sequelize.fn('STRING_AGG', Sequelize.literal('DISTINCT "ginsales"."invoice_no"'), ', ' ) , "invoice_no"],
          [Sequelize.fn('ARRAY_AGG', Sequelize.literal('DISTINCT "ginsales"."id"')), "sales_ids"],
          [
            sequelize.fn(
              "COALESCE",
              sequelize.fn("SUM", sequelize.col("qty_used")),
              0
            ),
            "cotton_consumed",
          ],
        ],
        where: whereCondition,
        include: [
          {
            model: SpinProcess,
            as: "spinprocess",
            include: include,
            attributes: [],
          },
          {
            model: GinSales,
            as: "ginsales",
            attributes: [],
          },
        ],
        group: ["spinprocess.spinner.id", "spinprocess.season.id"],
        order: [["spinner_id", "desc"]],
        offset: offset,
        limit: limit,
      });

      for await (const [index, spinner] of rows.entries()) {
        let salesData = await BaleSelection.findAll({
          attributes: [
            [Sequelize.col('"bale->ginprocess"."reel_lot_no"'), "reel_lot_no"],
          ],
          where: {
            sales_id: {[Op.in] : spinner?.dataValues?.sales_ids}
          },
          include: [
            {
              model: GinBale,
              as: "bale",
              include: [
                {
                  model: GinProcess,
                  as: "ginprocess",
                  attributes: [],
                },
              ],
              attributes: [],
            },
          ],
        });
  
        let reelLotNo = salesData && salesData.length > 0 ? [...new Set(salesData.map((item: any) => item?.dataValues?.reel_lot_no))].join(',') : "";
  
        let procuredCotton = await GinSales.findOne({
          attributes: [
            [
              sequelize.fn(
                "COALESCE",
                sequelize.fn("SUM", sequelize.col("total_qty")),
                0
              ),
              "cotton_procured",
            ],
          ],
          where: {
            buyer: spinner?.dataValues?.spinner_id,
            season_id: spinner?.dataValues?.season_id,
            status: "Sold",
          },
        });

        let cotton_stock = 
              Number(procuredCotton?.dataValues?.cotton_procured) >
                Number(spinner?.dataValues?.cotton_consumed)
                ? Number(procuredCotton?.dataValues?.cotton_procured) -
                Number(spinner?.dataValues?.cotton_consumed)
                : 0;

        const rowValues = Object.values({
          index: index + 1,
          spinner: spinner?.dataValues.spinner_name ? spinner?.dataValues.spinner_name : "",
          season: spinner?.dataValues.season_name ? spinner?.dataValues.season_name : "",
          batch_lot_no: spinner?.dataValues.batch_lot_no ? spinner?.dataValues.batch_lot_no : "",
          reel_lot_no: reelLotNo,
          invoice_no: spinner?.dataValues.invoice_no ? spinner?.dataValues.invoice_no : "",
          cotton_procured: procuredCotton ? procuredCotton?.dataValues?.cotton_procured: 0,
          cotton_consumed: spinner ? spinner?.dataValues?.cotton_consumed : 0,
          cotton_stock: cotton_stock,
        });
        worksheet.addRow(rowValues);
      }

      // Auto-adjust column widths based on content
      worksheet.columns.forEach((column: any) => {
        let maxCellLength = 0;
        column.eachCell({ includeEmpty: true }, (cell: any) => {
          const cellLength = (cell.value ? cell.value.toString() : "").length;
          maxCellLength = Math.max(maxCellLength, cellLength);
        });
        column.width = Math.min(14, maxCellLength + 2); // Limit width to 30 characters
      });

      // Save the workbook
      await workbook.xlsx.writeFile(excelFilePath);
      return res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data:
          process.env.BASE_URL + "excel-spinner-lint-cotton-stock-report.xlsx",
      });
    }
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

const fetchGarmentFabricPagination = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let data: any = await sequelize.query(
      `SELECT "weaver_sales"."id", "weaver_sales"."weaver_id", "weaver_sales"."season_id", "weaver_sales"."date", "weaver_sales"."program_id", "weaver_sales"."order_ref", "weaver_sales"."buyer_id",  "weaver_sales"."transaction_via_trader", "weaver_sales"."transaction_agent", "weaver_sales"."fabric_type", "weaver_sales"."fabric_length", "weaver_sales"."fabric_gsm", "weaver_sales"."fabric_weight", "weaver_sales"."batch_lot_no", "weaver_sales"."job_details_garment","weaver_sales"."invoice_no", "weaver_sales"."vehicle_no","weaver_sales"."qty_stock", "weaver_sales"."qr", "program"."id" AS "program-id", "program"."program_name" AS "program_name", "fabric"."id" AS
            "fabric_id", "fabric"."fabricType_name" AS "fabricType_name", "weaver"."id" AS "weaver-id", "weaver"."name" AS
            "weaver_name", "garment"."name" as "garment_name" FROM "weaver_sales" AS "weaver_sales" LEFT OUTER JOIN "programs" AS "program" ON "weaver_sales"."program_id" = "program"."id" LEFT OUTER JOIN "fabric_types" AS "fabric" ON "weaver_sales"."fabric_type" = "fabric"."id" LEFT OUTER JOIN "weavers" AS "weaver" ON "weaver_sales"."weaver_id" = "weaver"."id" LEFT OUTER JOIN "garments" AS "garment" ON "weaver_sales"."buyer_id" = "garment"."id"
             UNION ALL
             SELECT "knit_sales"."id", "knit_sales"."knitter_id", "knit_sales"."season_id", "knit_sales"."date", "knit_sales"."program_id", "knit_sales"."order_ref", "knit_sales"."buyer_id", "knit_sales"."transaction_via_trader", "knit_sales"."transaction_agent", "knit_sales"."fabric_type", "knit_sales"."fabric_length", "knit_sales"."fabric_gsm", "knit_sales"."fabric_weight", "knit_sales"."batch_lot_no", "knit_sales"."job_details_garment", "knit_sales"."invoice_no", "knit_sales"."vehicle_no", "knit_sales"."qty_stock", "knit_sales"."qr", "program"."id" AS "program-id", "program"."program_name" AS "program_name", "fabric"."id" AS "fabric_id", "fabric"."fabricType_name" AS "fabricType_name", "knitter"."id" AS "knitter-id", "knitter"."name" AS "knitter_name", "garment"."name" as "garment_name" FROM "knit_sales" AS "knit_sales"
             LEFT OUTER JOIN "programs" AS "program" ON "knit_sales"."program_id" = "program"."id" LEFT OUTER JOIN "fabric_types" AS "fabric" ON "knit_sales"."fabric_type" = "fabric"."id" LEFT OUTER JOIN "knitters" AS "knitter" ON "knit_sales"."knitter_id" = "knitter"."id" LEFT OUTER JOIN "garments" AS "garment" ON "knit_sales"."buyer_id" = "garment"."id"
             OFFSET ${offset}
             LIMIT ${limit}`
    );
    return res.sendPaginationSuccess(res, data[1].rows, data[1].rowCount);
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

const exportGarmentFabric = async (req: Request, res: Response) => {
  const excelFilePath = path.join("./upload", "garment-fabric-report.xlsx");
  try {
    const whereCondition: any = {};
    const searchTerm = req.query.search || "";
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$garment.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { bale_ids: { [Op.iLike]: `%${searchTerm}%` } },
        { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
        { "$fabric.fabricType_name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }

    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    worksheet.mergeCells("A1:L1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Garment Fabric Sales Report";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };
    // Set bold font for header row
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.",
      "Date",
      "Weave/Knit Uint",
      "Garment Processor Unit",
      "Invoice Number",
      "Lot/Batch No",
      "Fabirc Type",
      "No. of Bales/Rolls",
      "Bale/Roll Id",
      "Fabric in Mts",
      "Net Weight(Kgs)",
      "Qr code",
    ]);
    headerRow.font = { bold: true };
    let include = [
      {
        model: Program,
        as: "program",
      },
      {
        model: Garment,
        as: "buyer",
      },
      {
        model: FabricType,
        as: "fabric",
      },
    ];
    let result: any = await Promise.all([
      WeaverSales.findAll({
        where: whereCondition,
        include: [
          ...include,
          { model: Weaver, as: "weaver", attributes: ["id", "name"] },
        ],
      }),
      KnitSales.findAll({
        where: whereCondition,
        include: [
          ...include,
          { model: Knitter, as: "knitter", attributes: ["id", "name"] },
        ],
      }),
    ]);
    let abc = result.flat();
    // Append data to worksheet
    for await (const [index, item] of abc.entries()) {
      const rowValues = Object.values({
        index: index + 1,
        date: item.date ? item.date : "",
        buyer: item.weaver ? item.weaver.name : item.knitter.name,
        garment_name: item.buyer ? item.buyer.name : "",
        invoice: item.invoice_no ? item.invoice_no : "",
        batch_lot_no: item.batch_lot_no ? item.batch_lot_no : "",
        fabric: item.fabric ? item.fabric.fabricType_name : "",
        no_of_pieces: item.no_of_pieces ? item.no_of_pieces : "",
        bale_ids: item.bale_ids ? item.bale_ids : "",
        fabric_length: item.fabric_length ? item.fabric_length : "",
        fabric_weight: item.fabric_weight ? item.fabric_weight : "",
        color: process.env.BASE_URL + item.qr ?? "",
      });
      worksheet.addRow(rowValues);
    }
    // Auto-adjust column widths based on content
    worksheet.columns.forEach((column: any) => {
      let maxCellLength = 0;
      column.eachCell({ includeEmpty: true }, (cell: any) => {
        const cellLength = (cell.value ? cell.value.toString() : "").length;
        maxCellLength = Math.max(maxCellLength, cellLength);
      });
      column.width = Math.min(14, maxCellLength + 2); // Limit width to 30 characters
    });

    // Save the workbook
    await workbook.xlsx.writeFile(excelFilePath);
    res.status(200).send({
      success: true,
      messgage: "File successfully Generated",
      data: process.env.BASE_URL + "garment-fabric-report.xlsx",
    });
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

const fetchPscpPrecurement = async (req: Request, res: Response) => {
  try {
    let { seasonId, countryId, brandId }: any = req.query;
    const searchTerm = req.query.search || "";
    let whereCondition: any = {};
    let transtionCondition: any = {};
    let ginnerCondition: any = {};
    let ginnernewCondition: any = {};
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.season_id = { [Op.in]: idArray };
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$farmer.country_id$"] = { [Op.in]: idArray };
      transtionCondition["$country_id$"] = { [Op.in]: idArray };
      ginnerCondition["$ginner.country_id$"] = { [Op.in]: idArray };
      ginnernewCondition["$ginprocess.ginner.country_id$"] = { [Op.in]: idArray };
    }

    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$farmer.brand_id$"] = { [Op.in]: idArray };
    }

    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } }, // Search by first name
      ];
    }

    const result = await Farm.findAll({
      attributes: [
        [sequelize.col("season.id"), "season_id"],
        [sequelize.col("season.name"), "season_name"],
        [
          sequelize.fn(
            "SUM",
            sequelize.col('"farms"."total_estimated_cotton"')
          ),
          "estimated_seed_cotton",
        ],
      ],
      include: [
        {
          model: Season,
          as: "season",
          attributes: [],
        },
        {
          model: Farmer,
          as: "farmer",
          attributes: [],
        },
      ],
      where: whereCondition,
      group: ["season.id"],
    });
    let data: any = [];
    for await (const [index, item] of result.entries()) {
      let obj: any = {};
      let procurementrow = await Transaction.findOne({
        attributes: [
          [
            sequelize.fn(
              "COALESCE",
              sequelize.fn(
                "SUM",
                Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")
              ),
              0
            ),
            "procurement_seed_cotton",
          ],
          [
            sequelize.fn(
              "COALESCE",
              sequelize.fn("SUM", sequelize.col("qty_stock")),
              0
            ),
            "total_qty_lint_produced",
          ],
        ],
        where: { season_id: item.season_id,...transtionCondition },
      });

      let processgin = await GinProcess.findOne({
        attributes: [
          [
            sequelize.fn(
              "COALESCE",
              sequelize.fn("SUM", sequelize.col("no_of_bales")),
              0
            ),
            "no_of_bales",
          ],
        ],
        include: [
          {
            model: Ginner,
            as: "ginner",
            attributes: [],
          },
        ],
        where: { season_id: item.season_id,...ginnerCondition },
        group: ["season_id"],
      });
      let ginbales = await GinBale.findOne({
        attributes: [
          [
            sequelize.fn(
              "COALESCE",
              sequelize.fn(
                "SUM",
                Sequelize.literal(
                  'CAST("gin-bales"."weight" AS DOUBLE PRECISION)'
                )
              ),
              0
            ),
            "total_qty",
          ],
        ],
        include: [
          {
            model: GinProcess,
            as: "ginprocess",
            attributes: [],
            include: [
              {
                model: Ginner,
                as: "ginner",
                attributes: [],
              },
            ]
          },
        ],
        where: {
          "$ginprocess.season_id$": item.season_id,...ginnernewCondition
        },
        group: ["ginprocess.season_id"],
      });
      let processSale = await GinSales.findOne({
        attributes: [
          [
            sequelize.fn(
              "COALESCE",
              sequelize.fn("SUM", sequelize.col("no_of_bales")),
              0
            ),
            "no_of_bales",
          ],
          [
            sequelize.fn(
              "COALESCE",
              sequelize.fn("SUM", sequelize.col("total_qty")),
              0
            ),
            "total_qty",
          ],
        ],
        include: [
          {
            model: Ginner,
            as: "ginner",
            attributes: [],
          },
        ],
        where: { season_id: item.season_id,...ginnerCondition },
        group: ["season_id"],
      });

      obj.estimated_seed_cotton =
        (item?.dataValues.estimated_seed_cotton ?? 0) / 1000;
      obj.estimated_lint =
        ((item?.dataValues.estimated_seed_cotton ?? 0) * 35) / 100 / 1000;
      obj.procurement_seed_cotton =
        (procurementrow?.dataValues?.procurement_seed_cotton ?? 0) / 1000;
      obj.procurement = item?.dataValues.estimated_seed_cotton
        ? Math.round(
          (procurementrow?.dataValues["procurement_seed_cotton"] /
            item?.dataValues.estimated_seed_cotton) *
          100
        )
        : 0;
      obj.procured_lint_cotton =
        ((procurementrow?.dataValues["procurement_seed_cotton"] ?? 0) * 35) /
        100 /
        1000;
      obj.no_of_bales = processgin?.dataValues.no_of_bales ?? 0;
      obj.total_qty_lint_produced = ginbales
        ? (ginbales.dataValues.total_qty ?? 0) / 1000
        : 0;
      obj.sold_bales = processSale?.dataValues["no_of_bales"] ?? 0;
      obj.average_weight =
        (ginbales?.dataValues.total_qty ?? 0) / (obj.no_of_bales ?? 0);
      obj.total_qty_sold_lint =
        (processSale?.dataValues["total_qty"] ?? 0) / 1000;
      obj.balace_stock =
        obj.no_of_bales > obj.sold_bales ? obj.no_of_bales - obj.sold_bales : 0;
      obj.balance_lint_quantity =
        obj.total_qty_lint_produced > obj.total_qty_sold_lint
          ? obj.total_qty_lint_produced - obj.total_qty_sold_lint
          : 0;

      data.push({
        season: item.dataValues.season_name,
        season_id: item.dataValues.season_id,
        ...obj,
      });
    }
    let ndata = data.length > 0 ? data.slice(offset, offset + limit) : [];
    return res.sendPaginationSuccess(
      res,
      ndata,
      data.length > 0 ? data.length : 0
    );
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

const formatDecimal = (value: string | number): string | number => {
  const numericValue = typeof value === "string" ? parseFloat(value) : value;

  if (Number.isFinite(numericValue)) {
    const formattedValue =
      numericValue % 1 === 0
        ? numericValue.toFixed(0)
        : numericValue.toFixed(2);
    return formattedValue.toString().replace(/\.00$/, "");
  }

  return numericValue;
};

const exportPscpCottonProcurement = async (req: Request, res: Response) => {
  // procurement_tracker_load
  const excelFilePath = path.join("./upload", "excel-pscp-cotton-procurement.xlsx");

  const searchTerm = req.query.search || "";
  const { exportType, seasonId, countryId, brandId}: any = req.query;
  const whereCondition: any = {};
  let transtionCondition: any = {};
  let ginnerCondition: any = {};
  let ginnernewCondition: any = {};
  try {
    if (exportType === "all") {

      return res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "pscp-cotton-procurement.xlsx",
      });

    } else {
      if (seasonId) {
        const idArray: number[] = seasonId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition.season_id = { [Op.in]: idArray };
      }

      if (countryId) {
        const idArray: number[] = countryId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$farmer.country_id$"] = { [Op.in]: idArray };
        transtionCondition["$country_id$"] = { [Op.in]: idArray };
        ginnerCondition["$ginner.country_id$"] = { [Op.in]: idArray };
        ginnernewCondition["$ginprocess.ginner.country_id$"] = { [Op.in]: idArray };
      }

      if (brandId) {
        const idArray: number[] = brandId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$farmer.brand_id$"] = { [Op.in]: idArray };
      }

      if (searchTerm) {
        whereCondition[Op.or] = [
          { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } }, // Search by first name
        ];
      }

      // Create the excel workbook file
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet1");
      worksheet.mergeCells("A1:N1");
      const mergedCell = worksheet.getCell("A1");
      mergedCell.value = "CottonConnect | PSCP Cotton Procurement Tracker";
      mergedCell.font = { bold: true };
      mergedCell.alignment = { horizontal: "center", vertical: "middle" };
      // Set bold font for header row
      const headerRow = worksheet.addRow([
        "Sr No.",
        "Season",
        "Estimated seed cotton (in MT)",
        "Estimated Lint (in MT)",
        "Procured Seed Cotton (in MT)",
        "Procurement %",
        "Procured Lint Cotton (in MT)",
        "No of Bales",
        "Total Quantity of lint produced in (MT)",
        "Sold Bales",
        "Average Bale weight in Kgs",
        "Total Quantity of lint sold in (MT)",
        "Balance stock of bales",
        "Balance Lint Quantity stock in MT",
      ]);
      headerRow.font = { bold: true };
      const result = await Farm.findAll({
        attributes: [
          [sequelize.col("season.id"), "season_id"],
          [sequelize.col("season.name"), "season_name"],
          [
            sequelize.fn(
              "SUM",
              sequelize.col('"farms"."total_estimated_cotton"')
            ),
            "estimated_seed_cotton",
          ],
        ],
        include: [
          {
            model: Season,
            as: "season",
            attributes: [],
          },
          {
            model: Farmer,
            as: "farmer",
            attributes: [],
          },
        ],
        where: whereCondition,
        group: ["season.id"],
      });
      // Append data to worksheet
      for await (const [index, item] of result.entries()) {
        let obj: any = {};
        let procurementrow = await Transaction.findOne({
          attributes: [
            [
              sequelize.fn(
                "COALESCE",
                sequelize.fn(
                  "SUM",
                  Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")
                ),
                0
              ),
              "procurement_seed_cotton",
            ],
            [
              sequelize.fn(
                "COALESCE",
                sequelize.fn("SUM", sequelize.col("qty_stock")),
                0
              ),
              "total_qty_lint_produced",
            ],
          ],
          where: { season_id: item.season_id,...transtionCondition },
        });
  
        let processgin = await GinProcess.findOne({
          attributes: [
            [
              sequelize.fn(
                "COALESCE",
                sequelize.fn("SUM", sequelize.col("no_of_bales")),
                0
              ),
              "no_of_bales",
            ],
          ],
          include: [
            {
              model: Ginner,
              as: "ginner",
              attributes: [],
            },
          ],
          where: { season_id: item.season_id,...ginnerCondition },
          group: ["season_id"],
        });
        let ginbales = await GinBale.findOne({
          attributes: [
            [
              sequelize.fn(
                "COALESCE",
                sequelize.fn(
                  "SUM",
                  Sequelize.literal(
                    'CAST("gin-bales"."weight" AS DOUBLE PRECISION)'
                  )
                ),
                0
              ),
              "total_qty",
            ],
          ],
          include: [
            {
              model: GinProcess,
              as: "ginprocess",
              attributes: [],
              include: [
                {
                  model: Ginner,
                  as: "ginner",
                  attributes: [],
                },
              ]
            },
          ],
          where: {
            "$ginprocess.season_id$": item.season_id,...ginnernewCondition
          },
          group: ["ginprocess.season_id"],
        });
        let processSale = await GinSales.findOne({
          attributes: [
            [
              sequelize.fn(
                "COALESCE",
                sequelize.fn("SUM", sequelize.col("no_of_bales")),
                0
              ),
              "no_of_bales",
            ],
            [
              sequelize.fn(
                "COALESCE",
                sequelize.fn("SUM", sequelize.col("total_qty")),
                0
              ),
              "total_qty",
            ],
          ],
          include: [
            {
              model: Ginner,
              as: "ginner",
              attributes: [],
            },
          ],
          where: { season_id: item.season_id,...ginnerCondition },
          group: ["season_id"],
        });
  

        obj.estimated_seed_cotton =
          (item?.dataValues.estimated_seed_cotton ?? 0) / 1000;
        obj.estimated_lint =
          ((item?.dataValues.estimated_seed_cotton ?? 0) * 35) / 100 / 1000;
        obj.procurement_seed_cotton =
          (procurementrow?.dataValues?.procurement_seed_cotton ?? 0) / 1000;
        obj.procurement =
          item?.dataValues.estimated_seed_cotton > 0
            ? Math.round(
              (procurementrow?.dataValues["procurement_seed_cotton"] /
                item?.dataValues.estimated_seed_cotton) *
              100
            )
            : 0;
        obj.procured_lint_cotton =
          ((procurementrow?.dataValues["procurement_seed_cotton"] ?? 0) * 35) /
          100 /
          1000;
        obj.no_of_bales = processgin?.dataValues.no_of_bales ?? 0;
        obj.total_qty_lint_produced = ginbales
          ? (ginbales.dataValues.total_qty ?? 0) / 1000
          : 0;
        obj.sold_bales = processSale?.dataValues["no_of_bales"] ?? 0;
        obj.average_weight =
          (ginbales?.dataValues.total_qty ?? 0) / (obj.no_of_bales ?? 0);
        obj.total_qty_sold_lint =
          (processSale?.dataValues["total_qty"] ?? 0) / 1000;
        obj.balace_stock =
          obj.no_of_bales > obj.sold_bales ? obj.no_of_bales - obj.sold_bales : 0;
        obj.balance_lint_quantity =
          obj.total_qty_lint_produced > obj.total_qty_sold_lint
            ? obj.total_qty_lint_produced - obj.total_qty_sold_lint
            : 0;

        const rowValues = Object.values({
          index: index + 1,
          name: item.dataValues.season_name ? item.dataValues.season_name : "",
          estimated_seed_cotton: Number(formatDecimal(obj.estimated_seed_cotton)),
          estimated_lint: Number(formatDecimal(obj.estimated_lint)),
          procurement_seed_cotton: Number(formatDecimal(obj.procurement_seed_cotton)),
          procurement: obj.procurement,
          procured_lint_cotton: Number(formatDecimal(obj.procured_lint_cotton)),
          no_of_bales: obj.no_of_bales ? Number(obj.no_of_bales) : 0,
          total_qty_lint_produced: Number(formatDecimal(obj.total_qty_lint_produced)),
          sold_bales: obj.sold_bales ? Number(obj.sold_bales) : 0,
          average_weight: obj.average_weight
            ? Number(formatDecimal(obj.average_weight))
            : 0,
          total_qty_sold_lint: obj.total_qty_sold_lint
            ? Number(formatDecimal(obj.total_qty_sold_lint))
            : 0,
          balace_stock: obj.balace_stock ? Number(obj.balace_stock) : 0,
          balance_lint_quantity: Number(formatDecimal(obj.balance_lint_quantity)),
        });
        worksheet.addRow(rowValues);
      }
      // Auto-adjust column widths based on content
      worksheet.columns.forEach((column: any) => {
        let maxCellLength = 0;
        column.eachCell({ includeEmpty: true }, (cell: any) => {
          const cellLength = (cell.value ? cell.value.toString() : "").length;
          maxCellLength = Math.max(maxCellLength, cellLength);
        });
        column.width = Math.min(24, maxCellLength + 2); // Limit width to 30 characters
      });

      // Save the workbook
      await workbook.xlsx.writeFile(excelFilePath);
      res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "excel-pscp-cotton-procurement.xlsx",
      });
    }
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

const fetchPscpGinnerPrecurement = async (req: Request, res: Response) => {
  try {
    let { seasonId, countryId }: any = req.query;
    const searchTerm = req.query.search || "";
    let whereCondition: any = {};
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$ginner.name$": { [Op.iLike]: `%${searchTerm}%` } }, // Search by first name
      ];
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.country_id = { [Op.in]: idArray };
    }

    const result = await Transaction.findAll({
      attributes: [
        [
          sequelize.fn(
            "COALESCE",
            sequelize.fn(
              "SUM",
              Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")
            ),
            0
          ),
          "procurement_seed_cotton",
        ],
        [
          sequelize.fn(
            "COALESCE",
            sequelize.fn("SUM", sequelize.col("qty_stock")),
            0
          ),
          "total_qty_lint_produced",
        ],
      ],
      where: { season_id: seasonId, ...whereCondition },
      include: [
        {
          model: Ginner,
          as: "ginner",
          attributes: ["id", "name"],
        },
      ],
      group: ["mapped_ginner", "ginner.id"],
    });
    let data: any = [];
    for await (const [index, item] of result.entries()) {
      let obj: any = {};
      console.log(item);
      let processgin = await GinProcess.findOne({
        attributes: [
          [
            sequelize.fn(
              "COALESCE",
              sequelize.fn("SUM", sequelize.col("no_of_bales")),
              0
            ),
            "no_of_bales",
          ],
        ],
        where: { season_id: seasonId, ginner_id: item.dataValues.ginner.id },
      });
      let ginbales = await GinBale.findOne({
        attributes: [
          [
            sequelize.fn(
              "COALESCE",
              sequelize.fn(
                "SUM",
                Sequelize.literal(
                  'CAST("gin-bales"."weight" AS DOUBLE PRECISION)'
                )
              ),
              0
            ),
            "total_qty",
          ],
        ],
        include: [
          {
            model: GinProcess,
            as: "ginprocess",
            attributes: [],
          },
        ],
        where: {
          "$ginprocess.season_id$": seasonId,
          "$ginprocess.ginner_id$": item.dataValues.ginner.id,
        },
        group: ["ginprocess.season_id"],
      });
      let processSale = await GinSales.findOne({
        attributes: [
          [
            sequelize.fn(
              "COALESCE",
              sequelize.fn("SUM", sequelize.col("no_of_bales")),
              0
            ),
            "no_of_bales",
          ],
          [
            sequelize.fn(
              "COALESCE",
              sequelize.fn("SUM", sequelize.col("total_qty")),
              0
            ),
            "total_qty",
          ],
        ],
        where: { season_id: seasonId, ginner_id: item.dataValues.ginner.id },
      });

      obj.procurement_seed_cotton =
        (item?.dataValues?.procurement_seed_cotton ?? 0) / 1000;
      obj.procured_lint_cotton =
        ((item?.dataValues["procurement_seed_cotton"] ?? 0) * 35) / 100 / 1000;
      obj.no_of_bales = processgin?.dataValues.no_of_bales ?? 0;
      obj.total_qty_lint_produced = ginbales
        ? (ginbales.dataValues.total_qty ?? 0) / 1000
        : 0;
      obj.sold_bales = processSale?.dataValues["no_of_bales"] ?? 0;
      obj.average_weight =
        (ginbales?.dataValues.total_qty ?? 0) / (obj.no_of_bales ?? 0);
      obj.total_qty_sold_lint =
        (processSale?.dataValues["total_qty"] ?? 0) / 1000;
      obj.balace_stock =
        obj.no_of_bales > obj.sold_bales ? obj.no_of_bales - obj.sold_bales : 0;
      obj.balance_lint_quantity =
        obj.total_qty_lint_produced > obj.total_qty_sold_lint
          ? obj.total_qty_lint_produced - obj.total_qty_sold_lint
          : 0;
      obj.ginner = item.dataValues.ginner;
      data.push(obj);
    }
    let ndata = data.length > 0 ? data.slice(offset, offset + limit) : [];
    return res.sendPaginationSuccess(
      res,
      ndata,
      data.length > 0 ? data.length : 0
    );
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

const exportPscpGinnerCottonProcurement = async (
  req: Request,
  res: Response
) => {
  const excelFilePath = path.join(
    "./upload",
    "pscp-cotton-ginner-procurement.xlsx"
  );

  const searchTerm = req.query.search || "";
  let { seasonId, countryId }: any = req.query;
  let whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$ginner.name$": { [Op.iLike]: `%${searchTerm}%` } }, // Search by first name
      ];
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.country_id = { [Op.in]: idArray };
    }

    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    worksheet.mergeCells("A1:L1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | PSCP Cotton Ginner Procurement Tracker";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.",
      "Ginner Name",
      "Procured Seed Cotton (in MT)",
      "Procured Lint Cotton (in MT)",
      "No of Bales",
      "Total Quantity of lint produced in (MT)",
      "Sold Bales",
      "Average Bale weight in Kgs",
      "Total Quantity of lint sold in (MT)",
      "Balance stock of bales",
      "Balance Lint Quantity stock in MT",
    ]);
    headerRow.font = { bold: true };
    const result = await Transaction.findAll({
      attributes: [
        [
          sequelize.fn(
            "COALESCE",
            sequelize.fn(
              "SUM",
              Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")
            ),
            0
          ),
          "procurement_seed_cotton",
        ],
        [
          sequelize.fn(
            "COALESCE",
            sequelize.fn("SUM", sequelize.col("qty_stock")),
            0
          ),
          "total_qty_lint_produced",
        ],
      ],
      where: { season_id: seasonId, ...whereCondition },
      include: [
        {
          model: Ginner,
          as: "ginner",
          attributes: ["id", "name"],
        },
      ],
      group: ["mapped_ginner", "ginner.id"],
    });
    let data: any = [];
    for await (const [index, item] of result.entries()) {
      let obj: any = {};
      let processgin = await GinProcess.findOne({
        attributes: [
          [
            sequelize.fn(
              "COALESCE",
              sequelize.fn("SUM", sequelize.col("no_of_bales")),
              0
            ),
            "no_of_bales",
          ],
        ],
        where: { season_id: seasonId, ginner_id: item.dataValues.ginner.id },
      });
      let ginbales = await GinBale.findOne({
        attributes: [
          [
            sequelize.fn(
              "COALESCE",
              sequelize.fn(
                "SUM",
                Sequelize.literal(
                  'CAST("gin-bales"."weight" AS DOUBLE PRECISION)'
                )
              ),
              0
            ),
            "total_qty",
          ],
        ],
        include: [
          {
            model: GinProcess,
            as: "ginprocess",
            attributes: [],
          },
        ],
        where: {
          "$ginprocess.season_id$": seasonId,
          "$ginprocess.ginner_id$": item.dataValues.ginner.id,
        },
        group: ["ginprocess.season_id"],
      });
      let processSale = await GinSales.findOne({
        attributes: [
          [
            sequelize.fn(
              "COALESCE",
              sequelize.fn("SUM", sequelize.col("no_of_bales")),
              0
            ),
            "no_of_bales",
          ],
          [
            sequelize.fn(
              "COALESCE",
              sequelize.fn("SUM", sequelize.col("total_qty")),
              0
            ),
            "total_qty",
          ],
        ],
        where: { season_id: seasonId, ginner_id: item.dataValues.ginner.id },
      });

      obj.procurement_seed_cotton =
        (item?.dataValues?.procurement_seed_cotton ?? 0) / 1000;
      obj.procured_lint_cotton =
        ((item?.dataValues["procurement_seed_cotton"] ?? 0) * 35) / 100 / 1000;
      obj.no_of_bales = processgin?.dataValues.no_of_bales ?? 0;
      obj.total_qty_lint_produced = ginbales
        ? (ginbales.dataValues.total_qty ?? 0) / 1000
        : 0;
      obj.sold_bales = processSale?.dataValues["no_of_bales"] ?? 0;
      obj.average_weight =
        (ginbales?.dataValues.total_qty ?? 0) / (obj.no_of_bales ?? 0);
      obj.total_qty_sold_lint =
        (processSale?.dataValues["total_qty"] ?? 0) / 1000;
      obj.balace_stock =
        obj.no_of_bales > obj.sold_bales ? obj.no_of_bales - obj.sold_bales : 0;
      obj.balance_lint_quantity =
        obj.total_qty_lint_produced > obj.total_qty_sold_lint
          ? obj.total_qty_lint_produced - obj.total_qty_sold_lint
          : 0;
      obj.ginner = item.dataValues.ginner;
      data.push(obj);

      const rowValues = Object.values({
        index: index + 1,
        name: item.dataValues.ginner.name ? item.dataValues.ginner.name : "",
        procurement_seed_cotton: formatDecimal(obj.procurement_seed_cotton),
        procured_lint_cotton: formatDecimal(obj.procured_lint_cotton),
        no_of_bales: obj.no_of_bales,
        total_qty_lint_produced: formatDecimal(obj.total_qty_lint_produced),
        sold_bales: obj.sold_bales,
        average_weight: obj.average_weight
          ? formatDecimal(obj.average_weight)
          : 0,
        total_qty_sold_lint: obj.total_qty_sold_lint
          ? formatDecimal(obj.total_qty_sold_lint)
          : 0,
        balace_stock: obj.balace_stock,
        balance_lint_quantity: formatDecimal(obj.balance_lint_quantity),
      });
      worksheet.addRow(rowValues);
    }
    // Auto-adjust column widths based on content
    worksheet.columns.forEach((column: any) => {
      let maxCellLength = 0;
      column.eachCell({ includeEmpty: true }, (cell: any) => {
        const cellLength = (cell.value ? cell.value.toString() : "").length;
        maxCellLength = Math.max(maxCellLength, cellLength);
      });
      column.width = Math.min(24, maxCellLength + 2); // Limit width to 30 characters
    });

    // Save the workbook
    await workbook.xlsx.writeFile(excelFilePath);
    res.status(200).send({
      success: true,
      messgage: "File successfully Generated",
      data: process.env.BASE_URL + "pscp-cotton-ginner-procurement.xlsx",
    });
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

const fetchPscpProcurementLiveTracker = async (req: Request, res: Response) => {
  try {
    let { seasonId, countryId, brandId, ginnerId }: any = req.query;
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let whereCondition: any = {};
    let seasonCondition: any = {};
    let brandCondition: any = {};
    let baleCondition: any = {};

    if (searchTerm) {
      // whereCondition[Op.or] = [
      //   { '$ginner.name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by first name
      // ];
      brandCondition[Op.or] = [
        { name: { [Op.iLike]: `%${searchTerm}%` } },
        { "$state.state_name$": { [Op.iLike]: `%${searchTerm}%` } }, // Search by first name
      ];
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.country_id = { [Op.in]: idArray };
      brandCondition.country_id = { [Op.in]: idArray };
    }

    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.brand_id = { [Op.in]: idArray };
      brandCondition.brand = { [Op.overlap]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      seasonCondition.season_id = { [Op.in]: idArray };
      baleCondition["$ginprocess.season_id$"] = { [Op.in]: idArray };
    }

    if (ginnerId) {
      const idArray: number[] = ginnerId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      brandCondition.id = { [Op.in]: idArray };
    }

    let data: any = [];
    const { count, rows } = await Ginner.findAndCountAll({
      where: brandCondition,
      include: [
        {
          model: State,
          as: "state",
          attributes: ["id", "state_name"],
        },
        {
          model: Country,
          as: "country",
          attributes: ["id", "county_name"],
        },
      ],
      offset: offset,
      limit: limit,
    });
    for await (const [index, ginner] of rows.entries()) {
      let programs = ginner.dataValues.program_id;
      for await (let program of programs) {
        const result = await Transaction.findAll({
          attributes: [
            [
              sequelize.fn(
                "COALESCE",
                sequelize.fn(
                  "SUM",
                  Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")
                ),
                0
              ),
              "procurement_seed_cotton",
            ],
            [
              sequelize.fn(
                "COALESCE",
                sequelize.fn("SUM", sequelize.col("qty_stock")),
                0
              ),
              "total_qty_lint_produced",
            ],
          ],
          where: {
            program_id: program,
            mapped_ginner: ginner.dataValues.id,
            ...whereCondition,
            ...seasonCondition,
          },
          include: [
            {
              model: Ginner,
              as: "ginner",
              attributes: ["id", "name"],
            },
          ],
          group: ["mapped_ginner", "ginner.id"],
        });

        for await (const [index, item] of result.entries()) {
          let obj: any = {};
          let processgin = await GinProcess.findOne({
            attributes: [
              [
                sequelize.fn(
                  "COALESCE",
                  sequelize.fn("SUM", sequelize.col("no_of_bales")),
                  0
                ),
                "no_of_bales",
              ],
            ],
            where: {
              program_id: program,
              ginner_id: item.dataValues.ginner.id,
              ...seasonCondition,
            },
          });
          let ginbales = await GinBale.findOne({
            attributes: [
              [
                sequelize.fn(
                  "COALESCE",
                  sequelize.fn(
                    "SUM",
                    Sequelize.literal(
                      'CAST("gin-bales"."weight" AS DOUBLE PRECISION)'
                    )
                  ),
                  0
                ),
                "total_qty",
              ],
            ],
            include: [
              {
                model: GinProcess,
                as: "ginprocess",
                attributes: [],
              },
            ],
            where: {
              "$ginprocess.program_id$": program,
              "$ginprocess.ginner_id$": item.dataValues.ginner.id,
              ...baleCondition
            },
            group: ["ginprocess.season_id"],
          });

          let pendingSeedCotton = await Transaction.findOne({
            attributes: [
              [
                sequelize.fn(
                  "COALESCE",
                  sequelize.fn(
                    "SUM",
                    Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")
                  ),
                  0
                ),
                "pending_seed_cotton",
              ],
            ],
            where: {
              program_id: program,
              mapped_ginner: ginner.dataValues.id,
              status: "Pending",
              ...whereCondition,
              ...seasonCondition,
            },
          });

          let processSale = await GinSales.findOne({
            attributes: [
              [
                sequelize.fn(
                  "COALESCE",
                  sequelize.fn("SUM", sequelize.col("no_of_bales")),
                  0
                ),
                "no_of_bales",
              ],
              [
                sequelize.fn(
                  "COALESCE",
                  sequelize.fn("SUM", sequelize.col("total_qty")),
                  0
                ),
                "total_qty",
              ],
            ],
            where: {
              status: 'Sold',
              program_id: program,
              ginner_id: item.dataValues.ginner.id,
              ...seasonCondition,
            },
          });

          let expectedQty = await GinnerExpectedCotton.findOne({
            attributes: [
              [
                sequelize.fn(
                  "COALESCE",
                  sequelize.fn(
                    "SUM",
                    Sequelize.literal(
                      "CAST(expected_seed_cotton AS DOUBLE PRECISION)"
                    )
                  ),
                  0
                ),
                "expected_seed_cotton",
              ],
              [
                sequelize.fn(
                  "COALESCE",
                  sequelize.fn(
                    "SUM",
                    Sequelize.literal("CAST(expected_lint AS DOUBLE PRECISION)")
                  ),
                  0
                ),
                "expected_lint",
              ],
            ],
            where: {
              program_id: program,
              ginner_id: item.dataValues.ginner.id,
              ...seasonCondition,
            },
          });

          let ginnerOrder = await GinnerOrder.findOne({
            attributes: [
              [
                sequelize.fn(
                  "COALESCE",
                  sequelize.fn(
                    "SUM",
                    Sequelize.literal(
                      "CAST(confirmed_lint_order AS DOUBLE PRECISION)"
                    )
                  ),
                  0
                ),
                "confirmed_lint_order",
              ],
            ],
            where: {
              program_id: program,
              ginner_id: item.dataValues.ginner.id,
              ...seasonCondition,
            },
          });

          obj.country = ginner?.dataValues?.country;
          obj.state = ginner?.dataValues?.state;
          obj.program = await Program.findOne({
            attributes: ["id", "program_name"],
            where: { id: program },
          });
          obj.expected_seed_cotton =
            expectedQty?.dataValues["expected_seed_cotton"] ?? 0;
          obj.expected_lint = expectedQty?.dataValues?.expected_lint ?? 0;
          obj.procurement_seed_cotton =
            item?.dataValues?.procurement_seed_cotton ?? 0;
          obj.procured_lint_cotton_kgs = ginbales
            ? ginbales.dataValues.total_qty ?? 0
            : 0;
          obj.procured_lint_cotton_mt = ginbales
            ? (ginbales.dataValues.total_qty ?? 0) / 1000
            : 0;
          obj.pending_seed_cotton = pendingSeedCotton
            ? pendingSeedCotton?.dataValues?.pending_seed_cotton
            : 0;
          obj.procurement =
            expectedQty?.dataValues?.expected_seed_cotton !== 0 &&
              item?.dataValues["procurement_seed_cotton"] !== 0
              ? Math.round(
                ((item?.dataValues["procurement_seed_cotton"] ?? 0) /
                  (expectedQty?.dataValues?.expected_seed_cotton ?? 0)) *
                100
              )
              : 0;
          obj.no_of_bales = processgin?.dataValues.no_of_bales ?? 0;
          obj.total_qty_lint_produced = ginbales
            ? (ginbales.dataValues.total_qty ?? 0) / 1000
            : 0;
          obj.sold_bales = processSale?.dataValues["no_of_bales"] ?? 0;
          obj.average_weight =
            (ginbales?.dataValues.total_qty ?? 0) / (obj.no_of_bales ?? 0);
          obj.total_qty_sold_lint =
            (processSale?.dataValues["total_qty"] ?? 0) / 1000;
          obj.order_in_hand =
            ginnerOrder?.dataValues["confirmed_lint_order"] ?? 0;
          obj.balace_stock = obj.no_of_bales - obj.sold_bales ?? 0;
          obj.balance_lint_quantity =
            obj.total_qty_lint_produced - obj.total_qty_sold_lint;
          obj.ginner = item.dataValues.ginner;
          obj.ginner_sale_percentage = 0;
          if (obj.procured_lint_cotton_mt != 0) {
            if (obj.total_qty_sold_lint > obj.procured_lint_cotton_mt) {
              obj.ginner_sale_percentage = Math.round(
                (obj.procured_lint_cotton_mt / obj.total_qty_sold_lint) * 100
              );
            } else {
              obj.ginner_sale_percentage = Math.round(
                (obj.total_qty_sold_lint / obj.procured_lint_cotton_mt) * 100
              );
            }
          }
          data.push(obj);
        }
      }
    }

    return res.sendPaginationSuccess(
      res,
      data,
      count
    );
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};


const exportPscpProcurementLiveTracker = async (
  req: Request,
  res: Response
) => {
  try {
    // procurement_sell_live_tracker_load
    const excelFilePath = path.join(
      "./upload",
      "excel-pscp-procurement-sell-live-tracker.xlsx"
    );
    let { seasonId, countryId, brandId, ginnerId}: any = req.query;
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const exportType = req.query.exportType || "";
    const offset = (page - 1) * limit;
    let whereCondition: any = {};
    let seasonCondition: any = {};
    let brandCondition: any = {};
    let baleCondition: any = {};
    if (exportType === "all") {

      return res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "pscp-procurement-sell-live-tracker.xlsx",
      });

    } else {
      if (searchTerm) {
        brandCondition[Op.or] = [
          { name: { [Op.iLike]: `%${searchTerm}%` } },
          { "$state.state_name$": { [Op.iLike]: `%${searchTerm}%` } }, // Search by first name
        ];
      }

      if (countryId) {
        const idArray: number[] = countryId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition.country_id = { [Op.in]: idArray };
        brandCondition.country_id = { [Op.in]: idArray };
      }

      if (brandId) {
        const idArray: number[] = brandId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition.brand_id = { [Op.in]: idArray };
        brandCondition.brand = { [Op.overlap]: idArray };
      }

      if (seasonId) {
        const idArray: number[] = seasonId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        seasonCondition.season_id = { [Op.in]: idArray };
        baleCondition["$ginprocess.season_id$"] = { [Op.in]: idArray };
      }

      if (ginnerId) {
        const idArray: number[] = ginnerId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        brandCondition.id = { [Op.in]: idArray };
      }

      // Create the excel workbook file
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet1");
      worksheet.mergeCells("A1:R1");
      const mergedCell = worksheet.getCell("A1");
      mergedCell.value = "CottonConnect | PSCP Procurement and Sell Live Tracker";
      mergedCell.font = { bold: true };
      mergedCell.alignment = { horizontal: "center", vertical: "middle" };
      // Set bold font for header row
      const headerRow = worksheet.addRow([
        "Sr No.",
        "Ginning Mill",
        "Country",
        "State",
        "Program",
        "Expected Seed Cotton (KG)",
        "Expected Lint (MT)",
        "Procurement-Seed Cotton (KG)",
        "Procurement %",
        "Procurement-Seed Cotton Pending at Ginner (KG)",
        "Procurement Lint in (KG)",
        "Procurement Lint (MT)",
        "No. of Bales of produced",
        "Bales Sold for this season",
        "LINT Sold for this season (MT)",
        "Ginner Order in Hand (MT)",
        "Balance stock in  bales with Ginner",
        "Balance stock with Ginner (MT)",
        "Ginner Sale %",
      ]);
      headerRow.font = { bold: true };

      let data: any = [];
      const ginners = await Ginner.findAll({
        where: brandCondition,
        include: [
          {
            model: State,
            as: "state",
            attributes: ["id", "state_name"],
          },
          {
            model: Country,
            as: "country",
            attributes: ["id", "county_name"],
          }
        ],
      });
      for await (const [index, ginner] of ginners.entries()) {
        let programs = ginner.dataValues.program_id;
        for await (let program of programs) {
          const result = await Transaction.findAll({
            attributes: [
              [
                sequelize.fn(
                  "COALESCE",
                  sequelize.fn(
                    "SUM",
                    Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")
                  ),
                  0
                ),
                "procurement_seed_cotton",
              ],
              [
                sequelize.fn(
                  "COALESCE",
                  sequelize.fn("SUM", sequelize.col("qty_stock")),
                  0
                ),
                "total_qty_lint_produced",
              ],
            ],
            where: {
              program_id: program,
              mapped_ginner: ginner.dataValues.id,
              ...whereCondition,
              ...seasonCondition,
            },
            include: [
              {
                model: Ginner,
                as: "ginner",
                attributes: ["id", "name"],
              },
            ],
            group: ["mapped_ginner", "ginner.id"],
          });

          for await (const [index, item] of result.entries()) {
            let obj: any = {};
            let processgin = await GinProcess.findOne({
              attributes: [
                [
                  sequelize.fn(
                    "COALESCE",
                    sequelize.fn("SUM", sequelize.col("no_of_bales")),
                    0
                  ),
                  "no_of_bales",
                ],
              ],
              where: {
                program_id: program,
                ginner_id: item.dataValues.ginner.id,
                ...seasonCondition,
              },
            });
            let ginbales = await GinBale.findOne({
              attributes: [
                [
                  sequelize.fn(
                    "COALESCE",
                    sequelize.fn(
                      "SUM",
                      Sequelize.literal(
                        'CAST("gin-bales"."weight" AS DOUBLE PRECISION)'
                      )
                    ),
                    0
                  ),
                  "total_qty",
                ],
              ],
              include: [
                {
                  model: GinProcess,
                  as: "ginprocess",
                  attributes: [],
                },
              ],
              where: {
                "$ginprocess.program_id$": program,
                "$ginprocess.ginner_id$": item.dataValues.ginner.id,
                ...baleCondition
              },
              group: ["ginprocess.season_id"],
            });

            let pendingSeedCotton = await Transaction.findOne({
              attributes: [
                [
                  sequelize.fn(
                    "COALESCE",
                    sequelize.fn(
                      "SUM",
                      Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")
                    ),
                    0
                  ),
                  "pending_seed_cotton",
                ],
              ],
              where: {
                program_id: program,
                mapped_ginner: ginner.dataValues.id,
                status: "Pending",
                ...whereCondition,
                ...seasonCondition,
              },
            });

            let processSale = await GinSales.findOne({
              attributes: [
                [
                  sequelize.fn(
                    "COALESCE",
                    sequelize.fn("SUM", sequelize.col("no_of_bales")),
                    0
                  ),
                  "no_of_bales",
                ],
                [
                  sequelize.fn(
                    "COALESCE",
                    sequelize.fn("SUM", sequelize.col("total_qty")),
                    0
                  ),
                  "total_qty",
                ],
              ],
              where: {
                status: 'Sold',
                program_id: program,
                ginner_id: item.dataValues.ginner.id,
                ...seasonCondition,
              },
            });

            let expectedQty = await GinnerExpectedCotton.findOne({
              attributes: [
                [
                  sequelize.fn(
                    "COALESCE",
                    sequelize.fn(
                      "SUM",
                      Sequelize.literal(
                        "CAST(expected_seed_cotton AS DOUBLE PRECISION)"
                      )
                    ),
                    0
                  ),
                  "expected_seed_cotton",
                ],
                [
                  sequelize.fn(
                    "COALESCE",
                    sequelize.fn(
                      "SUM",
                      Sequelize.literal("CAST(expected_lint AS DOUBLE PRECISION)")
                    ),
                    0
                  ),
                  "expected_lint",
                ],
              ],
              where: {
                program_id: program,
                ginner_id: item.dataValues.ginner.id,
                ...seasonCondition,
              },
            });

            let ginnerOrder = await GinnerOrder.findOne({
              attributes: [
                [
                  sequelize.fn(
                    "COALESCE",
                    sequelize.fn(
                      "SUM",
                      Sequelize.literal(
                        "CAST(confirmed_lint_order AS DOUBLE PRECISION)"
                      )
                    ),
                    0
                  ),
                  "confirmed_lint_order",
                ],
              ],
              where: {
                program_id: program,
                ginner_id: item.dataValues.ginner.id,
                ...seasonCondition,
              },
            });

            obj.country = ginner?.dataValues?.country;
            obj.state = ginner?.dataValues?.state;
            obj.program = await Program.findOne({
              attributes: ["id", "program_name"],
              where: { id: program },
            });
            obj.expected_seed_cotton =
              expectedQty?.dataValues["expected_seed_cotton"] ?? 0;
            obj.expected_lint = expectedQty?.dataValues?.expected_lint ?? 0;
            obj.procurement_seed_cotton =
              item?.dataValues?.procurement_seed_cotton ?? 0;
            obj.procured_lint_cotton_kgs = ginbales
              ? ginbales.dataValues.total_qty ?? 0
              : 0;
            obj.procured_lint_cotton_mt = ginbales
              ? (ginbales.dataValues.total_qty ?? 0) / 1000
              : 0;
            obj.pending_seed_cotton = pendingSeedCotton
              ? pendingSeedCotton?.dataValues?.pending_seed_cotton
              : 0;
            obj.procurement =
              expectedQty?.dataValues?.expected_seed_cotton !== 0 &&
                item?.dataValues["procurement_seed_cotton"] !== 0
                ? Math.round(
                  ((item?.dataValues["procurement_seed_cotton"] ?? 0) /
                    (expectedQty?.dataValues?.expected_seed_cotton ?? 0)) *
                  100
                )
                : 0;
            obj.no_of_bales = processgin?.dataValues.no_of_bales ?? 0;
            obj.total_qty_lint_produced = ginbales
              ? (ginbales.dataValues.total_qty ?? 0) / 1000
              : 0;
            obj.sold_bales = processSale?.dataValues["no_of_bales"] ?? 0;
            obj.average_weight =
              (ginbales?.dataValues.total_qty ?? 0) / (obj.no_of_bales ?? 0);
            obj.total_qty_sold_lint =
              (processSale?.dataValues["total_qty"] ?? 0) / 1000;
            obj.order_in_hand =
              ginnerOrder?.dataValues["confirmed_lint_order"] ?? 0;
            obj.balace_stock = obj.no_of_bales - obj.sold_bales ?? 0;
            obj.balance_lint_quantity =
              obj.total_qty_lint_produced - obj.total_qty_sold_lint;
            obj.ginner = item.dataValues.ginner;
            obj.ginner_sale_percentage = 0;
            if (obj.procured_lint_cotton_mt != 0) {
              if (obj.total_qty_sold_lint > obj.procured_lint_cotton_mt) {
                obj.ginner_sale_percentage = Math.round(
                  (obj.procured_lint_cotton_mt / obj.total_qty_sold_lint) * 100
                );
              } else {
                obj.ginner_sale_percentage = Math.round(
                  (obj.total_qty_sold_lint / obj.procured_lint_cotton_mt) * 100
                );
              }
            }
            data.push(obj);
          }
        }
      }

      let ndata = data.length > 0 ? data.slice(offset, offset + limit) : [];
      let index = 0;
      for await (const obj of ndata) {
        const rowValues = Object.values({
          index: index + 1,
          name: obj?.ginner ? obj.ginner.name : "",
          country: obj.state ? obj.country?.county_name : "",
          state: obj.state ? obj.state?.state_name : "",
          program: obj.program ? obj.program?.program_name : "",
          expected_seed_cotton:  obj.expected_seed_cotton ? Number(obj.expected_seed_cotton) : 0,
          expected_lint: obj.expected_lint ? Number(obj.expected_lint) : 0,
          procurement_seed_cotton:  obj.procurement_seed_cotton ? Number(formatDecimal(obj.procurement_seed_cotton)) : 0,
          procurement: obj.procurement ? Number(obj.procurement) : 0,
          pending_seed_cotton: obj.pending_seed_cotton
            ?  Number(formatDecimal(obj.pending_seed_cotton))
            : 0,
          procured_lint_cotton_kgs: Number(formatDecimal(obj.procured_lint_cotton_kgs)),
          procured_lint_cotton_mt: Number(formatDecimal(obj.procured_lint_cotton_mt)),
          no_of_bales: obj.no_of_bales ? Number(obj.no_of_bales) : 0,
          sold_bales: obj.sold_bales ? Number(obj.sold_bales) : 0,
          total_qty_sold_lint: obj.total_qty_sold_lint
            ? Number(formatDecimal(obj.total_qty_sold_lint))
            : 0,
          order_in_hand: obj.order_in_hand ? Number(formatDecimal(obj.order_in_hand)) : 0,
          balace_stock: obj.balace_stock ? Number(obj.balace_stock) : 0,
          balance_lint_quantity: obj.balance_lint_quantity ? Number(formatDecimal(obj.balance_lint_quantity)) : 0,
          ginner_sale_percentage: Number(obj.ginner_sale_percentage),
        });
        index++;
        worksheet.addRow(rowValues);
      }

      // Auto-adjust column widths based on content
      worksheet.columns.forEach((column: any) => {
        let maxCellLength = 0;
        column.eachCell({ includeEmpty: true }, (cell: any) => {
          const cellLength = (cell.value ? cell.value.toString() : "").length;
          maxCellLength = Math.max(maxCellLength, cellLength);
        });
        column.width = Math.min(24, maxCellLength + 2); // Limit width to 30 characters
      });

      // Save the workbook
      await workbook.xlsx.writeFile(excelFilePath);
      res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "excel-pscp-procurement-sell-live-tracker.xlsx",
      });

      // let ndata = data.length > 0 ? data.slice(offset, offset + limit) : [];
      // return res.sendPaginationSuccess(res, ndata, data.length > 0 ? data.length : 0);
    }
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

const consolidatedTraceability = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  const { garmentId, brandId, styleMarkNo, garmentType, startDate, endDate, seasonId}: any = req.query;
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$buyer.brand_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$garment.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { style_mark_no: { [Op.contains]: [`${searchTerm}`] } },
        { garment_type: { [Op.contains]: [`${searchTerm}`] } },
      ];
    }
    whereCondition.status = "Sold";

    if (garmentId) {
      const idArray: number[] = garmentId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.garment_id = { [Op.in]: idArray };
    }
    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.season_id = { [Op.in]: idArray };
    }

    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.buyer_id = { [Op.in]: idArray };
    }

    if (styleMarkNo) {
      const idArray: any[] = styleMarkNo.split(",").map((id: any) => id);
      whereCondition.style_mark_no = { [Op.overlap]: idArray };
    }
    if (garmentType) {
      const idArray: any[] = garmentType.split(",").map((id: any) => id);
      whereCondition.garment_type = { [Op.overlap]: idArray };
    }

    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereCondition.createdAt = { [Op.between]: [startOfDay, endOfDay] }
  }
    let include = [
      {
        model: Brand,
        as: "buyer",
        attributes: ["id", "brand_name", "address"],
      },
      {
        model: Season,
        as: "season",
        attributes: ["id", "name"],
      },
      {
        model: Program,
        as: "program",
        attributes: ["id", "program_name"],
      },
      {
        model: Garment,
        as: "garment",
        attributes: ["id", "name", "address"],
      },
    ];

    // const {count, rows} = await GarmentSelection.findAndCountAll({
    //     attributes:[
    //         [Sequelize.literal('"garmentsales"."id"'), 'garment_sales_id'],
    //         [Sequelize.literal('"garmentprocess"."id"'), 'garment_process_id'],
    //         [Sequelize.literal('"garmentsales"."accept_date"'), 'accept_date'],
    //         [Sequelize.literal('"garmentsales"."date"'), 'dispatch_date'],
    //         [Sequelize.col('"garmentsales"."season"."name"'), 'season_name'],
    //         [Sequelize.col('"garmentsales"."season"."id"'), 'season_id'],
    //         [Sequelize.col('"garmentsales"."garment"."id"'), 'garment_id'],
    //         [Sequelize.col('"garmentsales"."garment"."name"'), 'garment_name'],
    //         [Sequelize.col('"garmentsales"."program"."program_name"'), 'program_name'],
    //         [Sequelize.col('"garmentsales"."fabric_order_ref"'), 'fabric_order_ref'],
    //         [Sequelize.col('"garmentsales"."brand_order_ref"'), 'brand_order_ref'],
    //         [Sequelize.col('"garmentsales"."buyer_type"'), 'buyer_type'],
    //         [Sequelize.col('"garmentsales"."buyer_id"'), 'brand_id'],
    //         [Sequelize.col('"garmentsales"."buyer"."brand_name"'), 'brand_name'],
    //         [Sequelize.col('"garmentsales"."invoice_no"'), 'garment_invoice_no'],
    //         [Sequelize.col('"garmentsales"."garment_type"'), 'garment_type'],
    //         [Sequelize.col('"garmentsales"."style_mark_no"'), 'style_mark_no'],
    //         [Sequelize.col('"garmentsales"."style_mark_no"'), 'style_mark_no'],
    //         [Sequelize.col('"garmentsales"."style_mark_no"'), 'style_mark_no'],

    //     ],
    //     where: whereCondition,
    //     include: [{
    //         model: GarmentSales,
    //         as: "garmentsales",
    //         include: include,
    //         attributes:[]
    //     },{
    //         model: GarmentProcess,
    //         attributes:[],
    //         as: "garmentprocess",
    //     }],
    //     offset: offset,
    //     limit: limit,
    // })

    //fetch data with pagination
    const { count, rows } = await GarmentSales.findAndCountAll({
      where: whereCondition,
      include: include,
      order: [["id", "desc"]],
      offset: offset,
      limit: limit,
    });

    let data = [];
    for await (let [index, item] of rows.entries()) {
      let process = await GarmentSelection.findAll({
        where: {
          sales_id: item.dataValues.id,
        },
        attributes: ["id", "garment_id", "sales_id"],
      });

      const processIds = process
        ? process.map((obj: any) => obj.dataValues.garment_id)
        : [];
      let fabric = await FabricSelection.findAll({
        where: {
          sales_id: processIds,
        },
        attributes: ["id", "fabric_id", "processor"],
      });

      let knit_fabric_ids = fabric
        .filter((obj: any) => obj?.dataValues?.processor === "knitter")
        .map((obj: any) => obj?.dataValues?.fabric_id);
      let weaver_fabric_ids = fabric
        .filter((obj: any) => obj?.dataValues?.processor === "weaver")
        .map((obj: any) => obj?.dataValues?.fabric_id);
      let compacting_fabric_ids = fabric
        .filter((obj: any) => obj?.dataValues?.processor === "compacting")
        .map((obj: any) => obj?.dataValues?.fabric_id);
      let printing_fabric_ids = fabric
        .filter((obj: any) => obj?.dataValues?.processor === "printing")
        .map((obj: any) => obj?.dataValues?.fabric_id);
      let washing_fabric_ids = fabric
        .filter((obj: any) => obj?.dataValues?.processor === "washing")
        .map((obj: any) => obj?.dataValues?.fabric_id);
      let dying_fabric_ids = fabric
        .filter((obj: any) => obj?.dataValues?.processor === "dying")
        .map((obj: any) => obj?.dataValues?.fabric_id);

      let compactingSales: any = [];
      if (compacting_fabric_ids.length > 0) {
        const rows = await CompactingSales.findAll({
          attributes: [
            "id",
            "date",
            "invoice_no",
            "batch_lot_no",
            "total_fabric_quantity",
            "fabric_net_weight",
            "buyer_id",
          ],
          include: [
            {
              model: Fabric,
              as: "compacting",
              attributes: ["id", "name"],
            },
          ],
          where: {
            id: {
              [Op.in]: compacting_fabric_ids,
            },
          },
          raw: true, // Return raw data
        });

        compactingSales = rows;
        let selection = await CompactingFabricSelections.findAll({
          where: {
            sales_id: rows.map((obj: any) => obj.id),
          },
          raw: true,
        });
        let printing_fabric = selection
          .filter((obj: any) => obj?.process_type === "Printing")
          .map((obj: any) => obj?.process_id);
        printing_fabric_ids = [...printing_fabric_ids, ...printing_fabric];
        let washing_fabric = selection
          .filter((obj: any) => obj?.process_type === "Washing")
          .map((obj: any) => obj?.process_id);
        washing_fabric_ids = [...washing_fabric_ids, ...washing_fabric];
        let dying_fabric = selection
          .filter((obj: any) => obj?.process_type === "Dying")
          .map((obj: any) => obj?.process_id);
        dying_fabric_ids = [...dying_fabric_ids, ...dying_fabric];
      }

      let printingSales: any = [];
      if (printing_fabric_ids.length > 0) {
        const rows = await PrintingSales.findAll({
          attributes: [
            "id",
            "date",
            "invoice_no",
            "batch_lot_no",
            "total_fabric_quantity",
            "fabric_net_weight",
            "buyer_id",
          ],
          include: [
            {
              model: Fabric,
              as: "printing",
              attributes: ["id", "name"],
            },
          ],
          where: {
            id: {
              [Op.in]: printing_fabric_ids,
            },
          },
          raw: true, // Return raw data
        });

        printingSales = rows;
        let selection = await PrintingFabricSelection.findAll({
          where: {
            sales_id: rows.map((obj: any) => obj.id),
          },
          raw: true,
        });
        let washing_fabric = selection.map((obj: any) => obj?.process_id);
        washing_fabric_ids = [...washing_fabric_ids, ...washing_fabric];
      }

      let washingSales: any = [];
      if (washing_fabric_ids.length > 0) {
        const rows = await WashingSales.findAll({
          attributes: [
            "id",
            "date",
            "invoice_no",
            "batch_lot_no",
            "total_fabric_quantity",
            "fabric_net_weight",
            "buyer_id",
          ],
          include: [
            {
              model: Fabric,
              as: "washing",
              attributes: ["id", "name"],
            },
          ],
          where: {
            id: {
              [Op.in]: washing_fabric_ids,
            },
          },
          raw: true, // Return raw data
        });

        washingSales = rows;
        let selection = await WashingFabricSelection.findAll({
          where: {
            sales_id: rows.map((obj: any) => obj.id),
          },
          raw: true,
        });
        let knitter_fabric = selection
          .filter((obj: any) => obj?.process_type === "knitter")
          .map((obj: any) => obj?.process_id);
        knit_fabric_ids = [...knit_fabric_ids, ...knitter_fabric];
        let weaver_fabric = selection
          .filter((obj: any) => obj?.process_type === "weaver")
          .map((obj: any) => obj?.process_id);
        weaver_fabric_ids = [...weaver_fabric_ids, ...weaver_fabric];
        let dying_fabric = selection
          .filter((obj: any) => obj?.process_type === "dying")
          .map((obj: any) => obj?.process_id);
        dying_fabric_ids = [...dying_fabric_ids, ...dying_fabric];
      }

      let dyingSales: any = [];
      if (dying_fabric_ids.length > 0) {
        const rows = await DyingSales.findAll({
          attributes: [
            "id",
            "date",
            "invoice_no",
            "batch_lot_no",
            "total_fabric_quantity",
            "fabric_net_weight",
            "buyer_id",
          ],
          include: [
            {
              model: Fabric,
              as: "dying_fabric",
              attributes: ["id", "name"],
            },
          ],
          where: {
            id: {
              [Op.in]: dying_fabric_ids,
            },
          },
          raw: true, // Return raw data
        });

        dyingSales = rows;
        let selection = await DyingFabricSelection.findAll({
          where: {
            sales_id: rows.map((obj: any) => obj.id),
          },
          raw: true,
        });
        let knitter_fabric = selection
          .filter((obj: any) => obj?.process_type === "knitter")
          .map((obj: any) => obj?.process_id);
        knit_fabric_ids = [...knit_fabric_ids, ...knitter_fabric];
        let weaver_fabric = selection
          .filter((obj: any) => obj?.process_type === "weaver")
          .map((obj: any) => obj?.process_id);
        weaver_fabric_ids = [...weaver_fabric_ids, ...weaver_fabric];
      }
      let knitSales: any = [];
      let knit_yarn_ids: any = [];

      if (knit_fabric_ids.length > 0) {
        const rows = await KnitSales.findAll({
          attributes: [
            "id",
            "date",
            "buyer_type",
            "buyer_id",
            "invoice_no",
            "batch_lot_no",
            "total_yarn_qty",
            "fabric_type",
            "total_fabric_weight",
            "reel_lot_no",
            "knitter_id",
          ],
          include: [
            {
              model: Knitter,
              as: "knitter",
              attributes: ["id", "name"],
            },
          ],
          where: {
            id: {
              [Op.in]: knit_fabric_ids,
            },
          },
          // raw: true // Return raw data
        });

        for await (let row of rows) {
          let fabrictypes: any = [];
          if (
            row.dataValues?.fabric_type &&
            row.dataValues?.fabric_type.length > 0
          ) {
            fabrictypes = await FabricType.findAll({
              where: {
                id: {
                  [Op.in]: row.dataValues.fabric_type,
                },
              },
              attributes: ["id", "fabricType_name"],
            });
          }
          knitSales.push({
            ...row.dataValues,
            fabrictypes,
          });
        }
        let knitProcess = await KnitFabricSelection.findAll({
          where: {
            sales_id: rows.map((obj: any) => obj.id),
          },
          attributes: ["id", "fabric_id", "sales_id"],
        });
        let knitYarn = await KnitYarnSelection.findAll({
          where: {
            sales_id: knitProcess.map((obj: any) => obj.dataValues.fabric_id),
          },
          attributes: ["id", "yarn_id"],
        });
        knit_yarn_ids = knitYarn.map((obj: any) => obj.dataValues.yarn_id);
      }

      let weaverSales: any = [];
      let weave_yarn_ids: any = [];

      if (weaver_fabric_ids.length > 0) {
        const rows = await WeaverSales.findAll({
          attributes: [
            "id",
            "date",
            "buyer_type",
            "buyer_id",
            "invoice_no",
            "batch_lot_no",
            "total_yarn_qty",
            "fabric_type",
            "total_fabric_length",
            "reel_lot_no",
            "weaver_id",
          ],
          include: [
            {
              model: Weaver,
              as: "weaver",
              attributes: ["id", "name"],
            },
          ],
          where: {
            id: {
              [Op.in]: weaver_fabric_ids,
            },
          },
          raw: true, // Return raw data
        });

        for await (let row of rows) {
          let fabrictypes: any = [];
          if (
            row.dataValues?.fabric_type &&
            row.dataValues?.fabric_type.length > 0
          ) {
            fabrictypes = await FabricType.findAll({
              where: {
                id: {
                  [Op.in]: row.dataValues.fabric_type,
                },
              },
              attributes: ["id", "fabricType_name"],
            });
          }
          weaverSales.push({
            ...row.dataValues,
            fabrictypes,
          });
        }

        let weaveProcess = await WeaverFabricSelection.findAll({
          where: {
            sales_id: rows.map((obj: any) => obj.id),
          },
          attributes: ["id", "fabric_id", "sales_id"],
        });
        let weaverYarn = await YarnSelection.findAll({
          where: {
            sales_id: weaveProcess.map((obj: any) => obj.id),
          },
          attributes: ["id", "yarn_id"],
        });
        weave_yarn_ids = weaverYarn.map((obj: any) => obj.dataValues.yarn_id);
      }
      let spinSales: any = [];
      let spnr_lint_ids: any = [];

      if (weave_yarn_ids.length > 0 || knit_yarn_ids.length > 0) {
        const rows = await SpinSales.findAll({
          attributes: [
            "id",
            "date",
            "buyer_type",
            "buyer_id",
            "knitter_id",
            "invoice_no",
            "batch_lot_no",
            "total_qty",
            "no_of_boxes",
            "box_ids",
            "yarn_type",
            "yarn_count",
            "reel_lot_no",
            "spinner_id",
          ],
          include: [
            {
              model: Spinner,
              as: "spinner",
              attributes: ["id", "name"],
            },
            // {
            //   model: YarnCount,
            //   as: "yarncount",
            //   attributes: ["yarnCount_name"],
            // },
          ],
          where: {
            id: {
              [Op.in]: [...weave_yarn_ids, ...knit_yarn_ids],
            },
          },
        });

        for await (let row of rows) {
            let yarncountList = [];
            if (row.dataValues?.yarn_count && row.dataValues?.yarn_count.length > 0) {
                yarncountList = await YarnCount.findAll({
                    where: {
                        id: {
                            [Op.in]: row.dataValues.yarn_count,
                        },
                    },
                    attributes: ["yarnCount_name"],
                });
            }
           const yarncount =  yarncountList?.map((obj: any) => obj.dataValues.yarnCount_name);
            spinSales.push({
                ...row.dataValues,
                yarncount
            });
        }

        let spinSaleProcess = await SpinProcessYarnSelection.findAll({
          where: {
            sales_id: rows?.map((obj: any) => obj.dataValues.id),
          },
          attributes: ["id", "spin_process_id"],
        });

        let spinProcess = await LintSelections.findAll({
          where: {
            process_id: spinSaleProcess.map(
              (obj: any) => obj?.dataValues?.spin_process_id
            ),
          },
          attributes: ["id", "lint_id"],
        });
        spnr_lint_ids = spinProcess.map((obj: any) => obj?.dataValues?.lint_id);
      }

      let ginSales: any = [];
      let gin_process_ids: any = [];
      let transactions_ids: any = [];

      if (spnr_lint_ids.length > 0) {
        ginSales = await GinSales.findAll({
          attributes: [
            "id",
            "date",
            "buyer",
            "invoice_no",
            "lot_no",
            "total_qty",
            "no_of_bales",
            "press_no",
            "reel_lot_no",
            "ginner_id",
          ],
          include: [
            {
              model: Ginner,
              as: "ginner",
              attributes: ["id", "name"],
            },
          ],
          where: {
            id: {
              [Op.in]: spnr_lint_ids,
            },
          },
        });

        let ginBaleId = await BaleSelection.findAll({
          where: {
            sales_id: ginSales.map((obj: any) => obj.dataValues.id),
          },
          attributes: ["id", "bale_id"],
        });

        let ginProcessIds = await GinBale.findAll({
          where: {
            id: ginBaleId.map((obj: any) => obj.dataValues.bale_id),
          },
          attributes: ["id", "process_id"],
        });
        gin_process_ids = ginProcessIds.map(
          (obj: any) => obj.dataValues.process_id
        );
      }

      if (gin_process_ids.length > 0) {
        let cottornIds = await CottonSelection.findAll({
          where: {
            process_id: gin_process_ids,
          },
          attributes: ["id", "transaction_id"],
        });
        transactions_ids = cottornIds.map(
          (obj: any) => obj.dataValues.transaction_id
        );
      }

      let transactions: any = [];
      if (transactions_ids.length > 0) {
        transactions = await Transaction.findAll({
          attributes: [
            "id",
            "date",
            "state_id",
            "village_id",
            "farmer_id",
            "farm_id",
            "program_id",
            "qty_purchased",
          ],
          where: {
            id: {
              [Op.in]: transactions_ids,
            },
          },
          include: [
            {
              model: Village,
              as: "village",
              attributes: ["id", "village_name"],
            },
            {
              model: State,
              as: "state",
              attributes: ["id", "state_name"],
            },
            {
              model: Farmer,
              as: "farmer",
              attributes: [
                "id",
                "farmGroup_id",
                "firstName",
                "lastName",
                "code",
              ],
              include: [
                {
                  model: FarmGroup,
                  as: "farmGroup",
                  attributes: ["id", "name"],
                },
              ],
            },
            {
              model: Program,
              as: "program",
              attributes: ["id", "program_name"],
            },
            {
              model: Ginner,
              as: "ginner",
              attributes: ["id", "name", "address"],
            },
          ],
        });
      }

      let obj: any = {};
      //compactingData
      let compactingProcessorName =
        compactingSales && compactingSales.length > 0
          ? compactingSales
            .map((val: any) => val['compacting.name'])
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let compactingInv =
        compactingSales && compactingSales.length > 0
          ? compactingSales
            .map((val: any) => val?.invoice_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let compactingbatchLotNo =
        compactingSales && compactingSales.length > 0
          ? compactingSales
            .map((val: any) => val?.batch_lot_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let compactingTotalQuantity =
        compactingSales && compactingSales.length > 0
          ? compactingSales
            .map((val: any) => val?.total_fabric_quantity)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let compactingFabricNetWeight =
        compactingSales && compactingSales.length > 0
          ? compactingSales
            .map((val: any) => val?.fabric_net_weight)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      obj.compacting_batch_lot_no = [...new Set(compactingbatchLotNo)];
      obj.compacting_inv = [...new Set(compactingInv)];
      obj.compacting_processor_name = [...new Set(compactingProcessorName)];
      obj.compacting_total_quantity = compactingTotalQuantity.reduce(
        (acc: any, value: any) => acc + value,
        0
      );
      obj.compacting_net_weight = compactingFabricNetWeight.reduce(
        (acc: any, value: any) => acc + value,
        0
      );
      //printing Data
      let printingProcessorName =
        printingSales && printingSales.length > 0
          ? printingSales
            .map((val: any) => val['printing.name'])
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let printingInv =
        printingSales && printingSales.length > 0
          ? printingSales
            .map((val: any) => val?.invoice_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let printingbatchLotNo =
        printingSales && printingSales.length > 0
          ? printingSales
            .map((val: any) => val?.batch_lot_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let printingTotalQuantity =
        printingSales && printingSales.length > 0
          ? printingSales
            .map((val: any) => val?.total_fabric_quantity)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let printingFabricNetWeight =
        printingSales && printingSales.length > 0
          ? printingSales
            .map((val: any) => val?.fabric_net_weight)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      obj.printing_batch_lot_no = [...new Set(printingbatchLotNo)];
      obj.printing_inv = [...new Set(printingInv)];
      obj.printing_processor_name = [...new Set(printingProcessorName)];
      obj.printing_total_quantity = printingTotalQuantity.reduce(
        (acc: any, value: any) => acc + value,
        0
      );
      obj.printing_net_weight = printingFabricNetWeight.reduce(
        (acc: any, value: any) => acc + value,
        0
      );

      //washing Data
      let washingProcessorName =
        washingSales && washingSales.length > 0
          ? washingSales
            .map((val: any) => val['washing.name'])
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let washingInv =
        washingSales && washingSales.length > 0
          ? washingSales
            .map((val: any) => val?.invoice_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let washingbatchLotNo =
        washingSales && washingSales.length > 0
          ? washingSales
            .map((val: any) => val?.batch_lot_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let washingTotalQuantity =
        washingSales && washingSales.length > 0
          ? washingSales
            .map((val: any) => val?.total_fabric_quantity)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let washingFabricNetWeight =
        washingSales && washingSales.length > 0
          ? washingSales
            .map((val: any) => val?.fabric_net_weight)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      obj.washing_batch_lot_no = [...new Set(washingbatchLotNo)];
      obj.washing_inv = [...new Set(washingInv)];
      obj.washing_processor_name = [...new Set(washingProcessorName)];
      obj.washing_total_quantity = washingTotalQuantity.reduce(
        (acc: any, value: any) => acc + value,
        0
      );
      obj.washing_net_weight = washingFabricNetWeight.reduce(
        (acc: any, value: any) => acc + value,
        0
      );
      //Dying Data
      let dyingProcessorName =
        dyingSales && dyingSales.length > 0
          ? dyingSales
            .map((val: any) => val['dying_fabric.name'])
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let dyingInv =
        dyingSales && dyingSales.length > 0
          ? dyingSales
            .map((val: any) => val?.invoice_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let dyingbatchLotNo =
        dyingSales && dyingSales.length > 0
          ? dyingSales
            .map((val: any) => val?.batch_lot_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let dyingTotalQuantity =
        dyingSales && dyingSales.length > 0
          ? dyingSales
            .map((val: any) => val?.total_fabric_quantity)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let dyingFabricNetWeight =
        dyingSales && dyingSales.length > 0
          ? dyingSales
            .map((val: any) => val?.fabric_net_weight)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      obj.dying_batch_lot_no = [...new Set(dyingbatchLotNo)];
      obj.dying_inv = [...new Set(dyingInv)];
      obj.dying_processor_name = [...new Set(dyingProcessorName)];
      obj.dying_total_quantity = dyingTotalQuantity.reduce(
        (acc: any, value: any) => acc + value,
        0
      );
      obj.dying_net_weight = dyingFabricNetWeight.reduce(
        (acc: any, value: any) => acc + value,
        0
      );
      //knitter and weaver data
      let knitdate =
        knitSales && knitSales.length > 0
          ? knitSales
            .map((val: any) => moment(val?.date).format("DD-MM-YYYY"))
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let weaverdate =
        weaverSales && weaverSales.length > 0
          ? weaverSales
            .map((val: any) => moment(val?.date).format("DD-MM-YYYY"))
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let knitName =
        knitSales && knitSales.length > 0
          ? knitSales
            .map((val: any) => val?.knitter?.name)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let weaverName =
        weaverSales && weaverSales.length > 0
          ? weaverSales
            .map((val: any) => val?.weaver?.name)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let knitInvoice =
        knitSales && knitSales.length > 0
          ? knitSales
            .map((val: any) => val?.invoice_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let weaverInvoice =
        weaverSales && weaverSales.length > 0
          ? weaverSales
            .map((val: any) => val?.invoice_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let knitLot =
        knitSales && knitSales.length > 0
          ? knitSales
            .map((val: any) => val?.batch_lot_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let weaverLot =
        weaverSales && weaverSales.length > 0
          ? weaverSales
            .map((val: any) => val?.batch_lot_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let knitReelLot =
        knitSales && knitSales.length > 0
          ? knitSales
            .map((val: any) => val?.reel_lot_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let weaverReelLot =
        weaverSales && weaverSales.length > 0
          ? weaverSales
            .map((val: any) => val?.reel_lot_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let knitFabricTypes =
        knitSales && knitSales.length > 0
          ? knitSales
            .flatMap((val: any) =>
              val?.fabrictypes
                ? val.fabrictypes.map(
                  (fabricType: any) => fabricType?.fabricType_name
                )
                : []
            )
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let weaverFabricTypes =
        weaverSales && weaverSales.length > 0
          ? weaverSales
            .flatMap((val: any) =>
              val?.fabrictypes
                ? val.fabrictypes.map(
                  (fabricType: any) => fabricType?.fabricType_name
                )
                : []
            )
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let knitTotalFabricWeight =
        knitSales && knitSales.length > 0
          ? knitSales
            .map((val: any) => val?.total_fabric_weight)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let weaverTotalFabricLength =
        weaverSales && weaverSales.length > 0
          ? weaverSales
            .map((val: any) => val?.total_fabric_length)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let knitTotalQty =
        knitSales && knitSales.length > 0
          ? knitSales
            .map((val: any) => val?.total_yarn_qty)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let weaverTotalQty =
        weaverSales && weaverSales.length > 0
          ? weaverSales
            .map((val: any) => val?.total_yarn_qty)
            .filter((item: any) => item !== null && item !== undefined)
          : [];

      obj.fbrc_sale_date = [...new Set([...knitdate, ...weaverdate])];
      obj.fbrc_name = [...new Set([...knitName, ...weaverName])];
      obj.fbrc_invoice_no = [...new Set([...knitInvoice, ...weaverInvoice])];
      obj.fbrc_lot_no = [...new Set([...knitLot, ...weaverLot])];
      obj.fbrc_reel_lot_no = [...new Set([...knitReelLot, ...weaverReelLot])];
      obj.fbrc_fabric_type = [
        ...new Set([...knitFabricTypes, ...weaverFabricTypes]),
      ];
      obj.fbrc_weave_total_length = weaverTotalFabricLength.reduce(
        (acc: any, value: any) => acc + value,
        0
      );
      obj.fbrc_knit_total_weight = knitTotalFabricWeight.reduce(
        (acc: any, value: any) => acc + value,
        0
      );
      obj.fbrc_total_qty = [...knitTotalQty, ...weaverTotalQty].reduce(
        (acc: any, value: any) => acc + value,
        0
      );

      //spinner data
      let spindate =
        spinSales && spinSales.length > 0
          ? spinSales
            .map((val: any) => moment(val?.date).format("DD-MM-YYYY"))
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let spinName =
        spinSales && spinSales.length > 0
          ? spinSales
            .map((val: any) => val?.spinner?.name)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let spinInvoice =
        spinSales && spinSales.length > 0
          ? spinSales
            .map((val: any) => val?.invoice_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let spinLot =
        spinSales && spinSales.length > 0
          ? spinSales
            .map((val: any) => val?.batch_lot_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let spinReelLot =
        spinSales && spinSales.length > 0
          ? spinSales
            .map((val: any) => val?.reel_lot_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];

      let spinYarnCount =
        spinSales && spinSales.length > 0
          ? spinSales
            .map((val: any) => val?.yarncount)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let spinYarnType =
        spinSales && spinSales.length > 0
          ? spinSales
            .map((val: any) => val?.yarn_type)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let spinBoxIds =
        spinSales && spinSales.length > 0
          ? spinSales
            .map((val: any) => val?.box_ids)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let spinNoOfBoxes =
        spinSales && spinSales.length > 0
          ? spinSales
            .map((val: any) => val?.no_of_boxes)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let spinTotalQty =
        spinSales && spinSales.length > 0
          ? spinSales
            .map((val: any) => val?.total_qty)
            .filter((item: any) => item !== null && item !== undefined)
          : [];

      obj.spnr_sale_date = [...new Set(spindate)];
      obj.spnr_name = [...new Set(spinName)];
      obj.spnr_invoice_no = [...new Set(spinInvoice)];
      obj.spnr_lot_no = [...new Set(spinLot)];
      obj.spnr_reel_lot_no = [...new Set(spinReelLot)];
      obj.spnr_yarn_type = [...new Set(spinYarnType)];
      obj.spnr_yarn_count = [...new Set(spinYarnCount)];
      obj.spnr_box_ids = [...new Set(spinBoxIds)];
      obj.spnr_no_of_boxes = spinNoOfBoxes.reduce(
        (acc: any, value: any) => acc + value,
        0
      );
      obj.spnr_total_qty = spinTotalQty.reduce(
        (acc: any, value: any) => acc + value,
        0
      );

      //ginner data
      let gindate =
        ginSales && ginSales.length > 0
          ? ginSales
            .map((val: any) => moment(val?.date).format("DD-MM-YYYY"))
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let ginName =
        ginSales && ginSales.length > 0
          ? ginSales
            .map((val: any) => val?.ginner?.name)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let ginInvoice =
        ginSales && ginSales.length > 0
          ? ginSales
            .map((val: any) => val?.invoice_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let ginLot =
        ginSales && ginSales.length > 0
          ? ginSales
            .map((val: any) => val?.lot_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let ginReelLot =
        ginSales && ginSales.length > 0
          ? ginSales
            .map((val: any) => val?.reel_lot_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let ginPressNo =
        ginSales && ginSales.length > 0
          ? ginSales
            .map((val: any) => val?.press_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let ginNoOfBales =
        ginSales && ginSales.length > 0
          ? ginSales
            .map((val: any) => val?.no_of_bales)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let ginTotalQty =
        ginSales && ginSales.length > 0
          ? ginSales
            .map((val: any) => val?.total_qty)
            .filter((item: any) => item !== null && item !== undefined)
          : [];

      obj.gnr_sale_date = [...new Set(gindate)];
      obj.gnr_name = [...new Set(ginName)];
      obj.gnr_invoice_no = [...new Set(ginInvoice)];
      obj.gnr_lot_no = [...new Set(ginLot)];
      obj.gnr_reel_lot_no = [...new Set(ginReelLot)];
      obj.gnr_press_no = [...new Set(ginPressNo)];
      obj.gnr_no_of_bales = ginNoOfBales.reduce(
        (acc: any, value: any) => acc + value,
        0
      );
      obj.gnr_total_qty = ginTotalQty.reduce(
        (acc: any, value: any) => acc + value,
        0
      );

      //transaction data
      let frmrTransactionIds =
        transactions && transactions.length > 0
          ? transactions
            .map((val: any) => val?.id)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let frmrdate =
        transactions && transactions.length > 0
          ? transactions
            .map((val: any) => moment(val?.date).format("DD-MM-YYYY"))
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let frmrFarmGroupName =
        transactions && transactions.length > 0
          ? transactions
            .map((val: any) => val?.farmer?.farmGroup?.name)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let frmrVillages =
        transactions && transactions.length > 0
          ? transactions
            .map((val: any) => val?.village?.village_name)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let frmrStates =
        transactions && transactions.length > 0
          ? transactions
            .map((val: any) => val?.state?.state_name)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let frmrPrograms =
        transactions && transactions.length > 0
          ? transactions
            .map((val: any) => val?.program?.program_name)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let frmrQtyPurchased =
        transactions && transactions.length > 0
          ? transactions
            .map((val: any) => Number(val?.qty_purchased))
            .filter((item: any) => item !== null && item !== undefined)
          : [];

      obj.frmr_transactions_id = [...new Set(frmrTransactionIds)];
      obj.frmr_sale_date = [...new Set(frmrdate)];
      obj.frmr_farm_group = [...new Set(frmrFarmGroupName)];
      obj.frmr_villages = [...new Set(frmrVillages)];
      obj.frmr_states = [...new Set(frmrStates)];
      obj.frmr_programs = [...new Set(frmrPrograms)];
      obj.frmr_total_qty_purchased = frmrQtyPurchased.reduce(
        (acc: any, value: any) => acc + value,
        0
      );
      
      data.push({
        ...item.dataValues,
        ...obj,
        knitSales,
        weaverSales,
        spinSales,
        ginSales,
        transactions_ids,
        transactions
      });
    }
  
    return res.sendPaginationSuccess(res, data, count);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

const exportConsolidatedTraceability = async (req: Request, res: Response) => {
  // consolidated_tracebality_load
  // await ExportData.update({
  //   consolidated_tracebality_load: true
  // }, { where: { consolidated_tracebality_load: false } })
  // res.send({ status: 200, message: "export file processing" })

  const excelFilePath = path.join(
    "./upload",
    "consolidated-traceabilty-report.xlsx"
  );
  
  const whereCondition: any = {};
  const { garmentId, brandId, styleMarkNo, garmentType, startDate, endDate, seasonId }: any = req.query;
  let baseurl = process.env.BASE_URL;
  try {
    whereCondition.status = "Sold";

    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.buyer_id = { [Op.in]: idArray };
    }
   
    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.season_id = { [Op.in]: idArray };
    }

    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereCondition.createdAt = { [Op.between]: [startOfDay, endOfDay] }
  }

    let include = [
      {
        model: Brand,
        as: "buyer",
        attributes: ["id", "brand_name", "address"],
      },
      {
        model: Season,
        as: "season",
        attributes: ["id", "name"],
      },
      {
        model: Program,
        as: "program",
        attributes: ["id", "program_name"],
      },
      {
        model: Garment,
        as: "garment",
        attributes: ["id", "name", "address"],
      },
    ];

    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    worksheet.mergeCells("A1:AQ1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Consolidated Traceability Report";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "S No.",
      "Brand Name",
      "QR Code",
      "Date of dispatch",
      "Garment unit Name",
      "Invoice Number",
      "Mark/Style No",
      "Item Description",
      "No. of Boxes/Cartons",
      "No. of pieces",
      "Dyeing Processor Name",
      "Invoice No",
      "Batch/Lot No",
      "Dyed Fabric Qty",
      "Finished Fabric Net weight",
      "Printing Processor Name",
      "Invoice No",
      "Batch/Lot No",
      "Printed Fabric Qty",
      "Finished Fabric Net weight",
      "Wahing Processor Name",
      "Invoice No",
      "Batch/Lot No",
      "Washed Fabric Qty",
      "Finished Fabric Net weight",
      "Compacting Processor Name",
      "Invoice No",
      "Batch/Lot No",
      "Compacted Fabric Qty",
      "Finished Fabric Net weight",
      "Date of fabric sale",
      "Fabric processor Name",
      "Invoice Number",
      "Lot No",
      "Fabric Type",
      "Total Fabric Net Length(Mts)",
      "Total Fabric Net Weight(Kgs)",
      "Date of Yarn sale",
      "Spinner Name",
      "Invoice Number",
      "Yarn REEL Lot No.",
      "Lot/batch Number",
      "Yarn Type",
      "Yarn Count",
      "No. of boxes",
      "Box Id",
      "Net Weight",
      "Date of lint sale",
      "Invoice Number",
      "Ginner Name",
      "REEL Lot No.",
      "Bale Lot No",
      "No. of Bales",
      "Press/Bale No's",
      "Total Qty.",
      "Date of Sale",
      "Farmer Group Name",
      "Transaction Id",
      "Village",
      "State",
      "Program",
    ]);
    headerRow.font = { bold: true };

    //fetch data with pagination
    const { count, rows } = await GarmentSales.findAndCountAll({
      where: whereCondition,
      include: include,
      order: [["id", "desc"]],
    });

    let data = [];
    for await (let [index, item] of rows.entries()) {
      let process = await GarmentSelection.findAll({
        where: {
          sales_id: item.dataValues.id,
        },
        attributes: ["id", "garment_id", "sales_id"],
      });

      const processIds = process
        ? process.map((obj: any) => obj.dataValues.garment_id)
        : [];
      let fabric = await FabricSelection.findAll({
        where: {
          sales_id: processIds,
        },
        attributes: ["id", "fabric_id", "processor"],
      });

      let knit_fabric_ids = fabric
        .filter((obj: any) => obj?.dataValues?.processor === "knitter")
        .map((obj: any) => obj?.dataValues?.fabric_id);
      let weaver_fabric_ids = fabric
        .filter((obj: any) => obj?.dataValues?.processor === "weaver")
        .map((obj: any) => obj?.dataValues?.fabric_id);
      let compacting_fabric_ids = fabric
        .filter((obj: any) => obj?.dataValues?.processor === "compacting")
        .map((obj: any) => obj?.dataValues?.fabric_id);
      let printing_fabric_ids = fabric
        .filter((obj: any) => obj?.dataValues?.processor === "printing")
        .map((obj: any) => obj?.dataValues?.fabric_id);
      let washing_fabric_ids = fabric
        .filter((obj: any) => obj?.dataValues?.processor === "washing")
        .map((obj: any) => obj?.dataValues?.fabric_id);
      let dying_fabric_ids = fabric
        .filter((obj: any) => obj?.dataValues?.processor === "dying")
        .map((obj: any) => obj?.dataValues?.fabric_id);

      let compactingSales: any = [];
      if (compacting_fabric_ids.length > 0) {
        const rows = await CompactingSales.findAll({
          attributes: [
            "id",
            "date",
            "invoice_no",
            "batch_lot_no",
            "total_fabric_quantity",
            "fabric_net_weight",
            "buyer_id",
          ],
          include: [
            {
              model: Fabric,
              as: "compacting",
              attributes: ["id", "name"],
            },
          ],
          where: {
            id: {
              [Op.in]: compacting_fabric_ids,
            },
          },
          raw: true, // Return raw data
        });

        compactingSales = rows;
        let selection = await CompactingFabricSelections.findAll({
          where: {
            sales_id: rows.map((obj: any) => obj.id),
          },
          raw: true,
        });
        let printing_fabric = selection
          .filter((obj: any) => obj?.process_type === "Printing")
          .map((obj: any) => obj?.process_id);
        printing_fabric_ids = [...printing_fabric_ids, ...printing_fabric];
        let washing_fabric = selection
          .filter((obj: any) => obj?.process_type === "Washing")
          .map((obj: any) => obj?.process_id);
        washing_fabric_ids = [...washing_fabric_ids, ...washing_fabric];
        let dying_fabric = selection
          .filter((obj: any) => obj?.process_type === "Dying")
          .map((obj: any) => obj?.process_id);
        dying_fabric_ids = [...dying_fabric_ids, ...dying_fabric];
      }

      let printingSales: any = [];
      if (printing_fabric_ids.length > 0) {
        const rows = await PrintingSales.findAll({
          attributes: [
            "id",
            "date",
            "invoice_no",
            "batch_lot_no",
            "total_fabric_quantity",
            "fabric_net_weight",
            "buyer_id",
          ],
          include: [
            {
              model: Fabric,
              as: "printing",
              attributes: ["id", "name"],
            },
          ],
          where: {
            id: {
              [Op.in]: printing_fabric_ids,
            },
          },
          raw: true, // Return raw data
        });

        printingSales = rows;
        let selection = await PrintingFabricSelection.findAll({
          where: {
            sales_id: rows.map((obj: any) => obj.id),
          },
          raw: true,
        });
        let washing_fabric = selection.map((obj: any) => obj?.process_id);
        washing_fabric_ids = [...washing_fabric_ids, ...washing_fabric];
      }

      let washingSales: any = [];
      if (washing_fabric_ids.length > 0) {
        const rows = await WashingSales.findAll({
          attributes: [
            "id",
            "date",
            "invoice_no",
            "batch_lot_no",
            "total_fabric_quantity",
            "fabric_net_weight",
            "buyer_id",
          ],
          include: [
            {
              model: Fabric,
              as: "washing",
              attributes: ["id", "name"],
            },
          ],
          where: {
            id: {
              [Op.in]: washing_fabric_ids,
            },
          },
          raw: true, // Return raw data
        });

        washingSales = rows;
        let selection = await WashingFabricSelection.findAll({
          where: {
            sales_id: rows.map((obj: any) => obj.id),
          },
          raw: true,
        });
        let knitter_fabric = selection
          .filter((obj: any) => obj?.process_type === "knitter")
          .map((obj: any) => obj?.process_id);
        knit_fabric_ids = [...knit_fabric_ids, ...knitter_fabric];
        let weaver_fabric = selection
          .filter((obj: any) => obj?.process_type === "weaver")
          .map((obj: any) => obj?.process_id);
        weaver_fabric_ids = [...weaver_fabric_ids, ...weaver_fabric];
        let dying_fabric = selection
          .filter((obj: any) => obj?.process_type === "dying")
          .map((obj: any) => obj?.process_id);
        dying_fabric_ids = [...dying_fabric_ids, ...dying_fabric];
      }

      let dyingSales: any = [];
      if (dying_fabric_ids.length > 0) {
        const rows = await DyingSales.findAll({
          attributes: [
            "id",
            "date",
            "invoice_no",
            "batch_lot_no",
            "total_fabric_quantity",
            "fabric_net_weight",
            "buyer_id",
          ],
          include: [
            {
              model: Fabric,
              as: "dying_fabric",
              attributes: ["id", "name"],
            },
          ],
          where: {
            id: {
              [Op.in]: dying_fabric_ids,
            },
          },
          raw: true, // Return raw data
        });

        dyingSales = rows;
        let selection = await DyingFabricSelection.findAll({
          where: {
            sales_id: rows.map((obj: any) => obj.id),
          },
          raw: true,
        });
        let knitter_fabric = selection
          .filter((obj: any) => obj?.process_type === "knitter")
          .map((obj: any) => obj?.process_id);
        knit_fabric_ids = [...knit_fabric_ids, ...knitter_fabric];
        let weaver_fabric = selection
          .filter((obj: any) => obj?.process_type === "weaver")
          .map((obj: any) => obj?.process_id);
        weaver_fabric_ids = [...weaver_fabric_ids, ...weaver_fabric];
      }

      let knitSales: any = [];
      let knit_yarn_ids: any = [];

      if (knit_fabric_ids.length > 0) {
        const rows = await KnitSales.findAll({
          attributes: [
            "id",
            "date",
            "buyer_type",
            "buyer_id",
            "invoice_no",
            "batch_lot_no",
            "total_yarn_qty",
            "fabric_type",
            "total_fabric_weight",
            "reel_lot_no",
            "knitter_id",
          ],
          include: [
            {
              model: Knitter,
              as: "knitter",
              attributes: ["id", "name"],
            },
          ],
          where: {
            id: {
              [Op.in]: knit_fabric_ids,
            },
          },
          // raw: true // Return raw data
        });

        for await (let row of rows) {
          let fabrictypes: any = [];
          if (
            row.dataValues?.fabric_type &&
            row.dataValues?.fabric_type.length > 0
          ) {
            fabrictypes = await FabricType.findAll({
              where: {
                id: {
                  [Op.in]: row.dataValues.fabric_type,
                },
              },
              attributes: ["id", "fabricType_name"],
            });
          }
          knitSales.push({
            ...row.dataValues,
            fabrictypes,
          });
        }
        let knitProcess = await KnitFabricSelection.findAll({
          where: {
            sales_id: rows.map((obj: any) => obj.id),
          },
          attributes: ["id", "fabric_id", "sales_id"],
        });
        let knitYarn = await KnitYarnSelection.findAll({
          where: {
            sales_id: knitProcess.map((obj: any) => obj.dataValues.fabric_id),
          },
          attributes: ["id", "yarn_id"],
        });
        knit_yarn_ids = knitYarn.map((obj: any) => obj.dataValues.yarn_id);
      }

      let weaverSales: any = [];
      let weave_yarn_ids: any = [];

      if (weaver_fabric_ids.length > 0) {
        const rows = await WeaverSales.findAll({
          attributes: [
            "id",
            "date",
            "buyer_type",
            "buyer_id",
            "invoice_no",
            "batch_lot_no",
            "total_yarn_qty",
            "fabric_type",
            "total_fabric_length",
            "reel_lot_no",
            "weaver_id",
          ],
          include: [
            {
              model: Weaver,
              as: "weaver",
              attributes: ["id", "name"],
            },
          ],
          where: {
            id: {
              [Op.in]: weaver_fabric_ids,
            },
          },
          raw: true, // Return raw data
        });

        for await (let row of rows) {
          let fabrictypes: any = [];
          if (
            row.dataValues?.fabric_type &&
            row.dataValues?.fabric_type.length > 0
          ) {
            fabrictypes = await FabricType.findAll({
              where: {
                id: {
                  [Op.in]: row.dataValues.fabric_type,
                },
              },
              attributes: ["id", "fabricType_name"],
            });
          }
          weaverSales.push({
            ...row.dataValues,
            fabrictypes,
          });
        }

        let weaveProcess = await WeaverFabricSelection.findAll({
          where: {
            sales_id: rows.map((obj: any) => obj.id),
          },
          attributes: ["id", "fabric_id", "sales_id"],
        });
        let weaverYarn = await YarnSelection.findAll({
          where: {
            sales_id: weaveProcess.map((obj: any) => obj.id),
          },
          attributes: ["id", "yarn_id"],
        });
        weave_yarn_ids = weaverYarn.map((obj: any) => obj.dataValues.yarn_id);
      }
      let spinSales: any = [];
      let spnr_lint_ids: any = [];

      if (weave_yarn_ids.length > 0 || knit_yarn_ids.length > 0) {
        const rows = await SpinSales.findAll({
          attributes: [
            "id",
            "date",
            "buyer_type",
            "buyer_id",
            "knitter_id",
            "invoice_no",
            "batch_lot_no",
            "total_qty",
            "no_of_boxes",
            "box_ids",
            "yarn_type",
            "yarn_count",
            "reel_lot_no",
            "spinner_id",
          ],
          include: [
            {
              model: Spinner,
              as: "spinner",
              attributes: ["id", "name"],
            },
          ],
          where: {
            id: {
              [Op.in]: [...weave_yarn_ids, ...knit_yarn_ids],
            },
          },
        });

        for await (let row of rows) {
          let yarncountList = [];
          if (row.dataValues?.yarn_count && row.dataValues?.yarn_count.length > 0) {
              yarncountList = await YarnCount.findAll({
                  where: {
                      id: {
                          [Op.in]: row.dataValues.yarn_count,
                      },
                  },
                  attributes: ["yarnCount_name"],
              });
          }
         const yarncount =  yarncountList?.map((obj: any) => obj.dataValues.yarnCount_name);
          spinSales.push({
              ...row.dataValues,
              yarncount
          });
      }


        let spinSaleProcess = await SpinProcessYarnSelection.findAll({
          where: {
            sales_id: rows.map((obj: any) => obj.dataValues.id),
          },
          attributes: ["id", "spin_process_id"],
        });
        let spinProcess = await LintSelections.findAll({
          where: {
            process_id: spinSaleProcess.map(
              (obj: any) => obj?.dataValues?.spin_process_id
            ),
          },
          attributes: ["id", "lint_id"],
        });
        spnr_lint_ids = spinProcess.map((obj: any) => obj?.dataValues?.lint_id);
      }

      let ginSales: any = [];
      let gin_process_ids: any = [];
      let transactions_ids: any = [];

      if (spnr_lint_ids.length > 0) {
        ginSales = await GinSales.findAll({
          attributes: [
            "id",
            "date",
            "buyer",
            "invoice_no",
            "lot_no",
            "total_qty",
            "no_of_bales",
            "press_no",
            "reel_lot_no",
            "ginner_id",
          ],
          include: [
            {
              model: Ginner,
              as: "ginner",
              attributes: ["id", "name"],
            },
          ],
          where: {
            id: {
              [Op.in]: spnr_lint_ids,
            },
          },
        });

        let ginBaleId = await BaleSelection.findAll({
          where: {
            sales_id: ginSales.map((obj: any) => obj.dataValues.id),
          },
          attributes: ["id", "bale_id"],
        });

        let ginProcessIds = await GinBale.findAll({
          where: {
            id: ginBaleId.map((obj: any) => obj.dataValues.bale_id),
          },
          attributes: ["id", "process_id"],
        });
        gin_process_ids = ginProcessIds.map(
          (obj: any) => obj.dataValues.process_id
        );
      }

      if (gin_process_ids.length > 0) {
        let cottornIds = await CottonSelection.findAll({
          where: {
            process_id: gin_process_ids,
          },
          attributes: ["id", "transaction_id"],
        });
        transactions_ids = cottornIds.map(
          (obj: any) => obj.dataValues.transaction_id
        );
      }

      let transactions: any = [];
      if (transactions_ids.length > 0) {
        transactions = await Transaction.findAll({
          attributes: [
            "id",
            "date",
            "state_id",
            "village_id",
            "farmer_id",
            "farm_id",
            "program_id",
            "qty_purchased",
          ],
          where: {
            id: {
              [Op.in]: transactions_ids,
            },
          },
          include: [
            {
              model: Village,
              as: "village",
              attributes: ["id", "village_name"],
            },
            {
              model: State,
              as: "state",
              attributes: ["id", "state_name"],
            },
            {
              model: Farmer,
              as: "farmer",
              attributes: [
                "id",
                "farmGroup_id",
                "firstName",
                "lastName",
                "code",
              ],
              include: [
                {
                  model: FarmGroup,
                  as: "farmGroup",
                  attributes: ["id", "name"],
                },
              ],
            },
            {
              model: Program,
              as: "program",
              attributes: ["id", "program_name"],
            },
            {
              model: Ginner,
              as: "ginner",
              attributes: ["id", "name", "address"],
            },
          ],
        });
      }

      let obj: any = {};
      //compactingData
      let compactingProcessorName =
        compactingSales && compactingSales.length > 0
          ? compactingSales
            .map((val: any) => val['compacting.name'])
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let compactingInv =
        compactingSales && compactingSales.length > 0
          ? compactingSales
            .map((val: any) => val?.invoice_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let compactingbatchLotNo =
        compactingSales && compactingSales.length > 0
          ? compactingSales
            .map((val: any) => val?.batch_lot_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let compactingTotalQuantity =
        compactingSales && compactingSales.length > 0
          ? compactingSales
            .map((val: any) => val?.total_fabric_quantity)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let compactingFabricNetWeight =
        compactingSales && compactingSales.length > 0
          ? compactingSales
            .map((val: any) => val?.fabric_net_weight)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      obj.compacting_batch_lot_no = [...new Set(compactingbatchLotNo)];
      obj.compacting_inv = [...new Set(compactingInv)];
      obj.compacting_processor_name = [...new Set(compactingProcessorName)];
      obj.compacting_total_quantity = compactingTotalQuantity.reduce(
        (acc: any, value: any) => acc + value,
        0
      );
      obj.compacting_net_weight = compactingFabricNetWeight.reduce(
        (acc: any, value: any) => acc + value,
        0
      );
      //printing Data
      let printingProcessorName =
        printingSales && printingSales.length > 0
          ? printingSales
            .map((val: any) => val['printing.name'])
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let printingInv =
        printingSales && printingSales.length > 0
          ? printingSales
            .map((val: any) => val?.invoice_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let printingbatchLotNo =
        printingSales && printingSales.length > 0
          ? printingSales
            .map((val: any) => val?.batch_lot_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let printingTotalQuantity =
        printingSales && printingSales.length > 0
          ? printingSales
            .map((val: any) => val?.total_fabric_quantity)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let printingFabricNetWeight =
        printingSales && printingSales.length > 0
          ? printingSales
            .map((val: any) => val?.fabric_net_weight)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      obj.printing_batch_lot_no = [...new Set(printingbatchLotNo)];
      obj.printing_inv = [...new Set(printingInv)];
      obj.printing_processor_name = [...new Set(printingProcessorName)];
      obj.printing_total_quantity = printingTotalQuantity.reduce(
        (acc: any, value: any) => acc + value,
        0
      );
      obj.printing_net_weight = printingFabricNetWeight.reduce(
        (acc: any, value: any) => acc + value,
        0
      );

      //washing Data
      let washingProcessorName =
        washingSales && washingSales.length > 0
          ? washingSales
            .map((val: any) => val['washing.name'])
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let washingInv =
        washingSales && washingSales.length > 0
          ? washingSales
            .map((val: any) => val?.invoice_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let washingbatchLotNo =
        washingSales && washingSales.length > 0
          ? washingSales
            .map((val: any) => val?.batch_lot_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let washingTotalQuantity =
        washingSales && washingSales.length > 0
          ? washingSales
            .map((val: any) => val?.total_fabric_quantity)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let washingFabricNetWeight =
        washingSales && washingSales.length > 0
          ? washingSales
            .map((val: any) => val?.fabric_net_weight)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      obj.washing_batch_lot_no = [...new Set(washingbatchLotNo)];
      obj.washing_inv = [...new Set(washingInv)];
      obj.washing_processor_name = [...new Set(washingProcessorName)];
      obj.washing_total_quantity = washingTotalQuantity.reduce(
        (acc: any, value: any) => acc + value,
        0
      );
      obj.washing_net_weight = washingFabricNetWeight.reduce(
        (acc: any, value: any) => acc + value,
        0
      );
      //Dying Data
      let dyingProcessorName =
        dyingSales && dyingSales.length > 0
          ? dyingSales
            .map((val: any) => val['dying_fabric.name'])
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let dyingInv =
        dyingSales && dyingSales.length > 0
          ? dyingSales
            .map((val: any) => val?.invoice_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let dyingbatchLotNo =
        dyingSales && dyingSales.length > 0
          ? dyingSales
            .map((val: any) => val?.batch_lot_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let dyingTotalQuantity =
        dyingSales && dyingSales.length > 0
          ? dyingSales
            .map((val: any) => val?.total_fabric_quantity)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let dyingFabricNetWeight =
        dyingSales && dyingSales.length > 0
          ? dyingSales
            .map((val: any) => val?.fabric_net_weight)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      obj.dying_batch_lot_no = [...new Set(dyingbatchLotNo)];
      obj.dying_inv = [...new Set(dyingInv)];
      obj.dying_processor_name = [...new Set(dyingProcessorName)];
      obj.dying_total_quantity = dyingTotalQuantity.reduce(
        (acc: any, value: any) => acc + value,
        0
      );
      obj.dying_net_weight = dyingFabricNetWeight.reduce(
        (acc: any, value: any) => acc + value,
        0
      );

      //knitter and weaver data
      let knitdate =
        knitSales && knitSales.length > 0
          ? knitSales
            .map((val: any) => moment(val?.date).format("DD-MM-YYYY"))
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let weaverdate =
        weaverSales && weaverSales.length > 0
          ? weaverSales
            .map((val: any) => moment(val?.date).format("DD-MM-YYYY"))
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let knitName =
        knitSales && knitSales.length > 0
          ? knitSales
            .map((val: any) => val?.knitter?.name)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let weaverName =
        weaverSales && weaverSales.length > 0
          ? weaverSales
            .map((val: any) => val?.weaver?.name)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let knitInvoice =
        knitSales && knitSales.length > 0
          ? knitSales
            .map((val: any) => val?.invoice_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let weaverInvoice =
        weaverSales && weaverSales.length > 0
          ? weaverSales
            .map((val: any) => val?.invoice_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let knitLot =
        knitSales && knitSales.length > 0
          ? knitSales
            .map((val: any) => val?.batch_lot_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let weaverLot =
        weaverSales && weaverSales.length > 0
          ? weaverSales
            .map((val: any) => val?.batch_lot_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let knitReelLot =
        knitSales && knitSales.length > 0
          ? knitSales
            .map((val: any) => val?.reel_lot_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let weaverReelLot =
        weaverSales && weaverSales.length > 0
          ? weaverSales
            .map((val: any) => val?.reel_lot_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let knitFabricTypes =
        knitSales && knitSales.length > 0
          ? knitSales
            .flatMap((val: any) =>
              val?.fabrictypes
                ? val.fabrictypes.map(
                  (fabricType: any) => fabricType?.fabricType_name
                )
                : []
            )
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let weaverFabricTypes =
        weaverSales && weaverSales.length > 0
          ? weaverSales
            .flatMap((val: any) =>
              val?.fabrictypes
                ? val.fabrictypes.map(
                  (fabricType: any) => fabricType?.fabricType_name
                )
                : []
            )
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let knitTotalFabricWeight =
        knitSales && knitSales.length > 0
          ? knitSales
            .map((val: any) => val?.total_fabric_weight)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let weaverTotalFabricLength =
        weaverSales && weaverSales.length > 0
          ? weaverSales
            .map((val: any) => val?.total_fabric_length)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let knitTotalQty =
        knitSales && knitSales.length > 0
          ? knitSales
            .map((val: any) => val?.total_yarn_qty)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let weaverTotalQty =
        weaverSales && weaverSales.length > 0
          ? weaverSales
            .map((val: any) => val?.total_yarn_qty)
            .filter((item: any) => item !== null && item !== undefined)
          : [];

      obj.fbrc_sale_date = [...new Set([...knitdate, ...weaverdate])];
      obj.fbrc_name = [...new Set([...knitName, ...weaverName])];
      obj.fbrc_invoice_no = [...new Set([...knitInvoice, ...weaverInvoice])];
      obj.fbrc_lot_no = [...new Set([...knitLot, ...weaverLot])];
      obj.fbrc_reel_lot_no = [...new Set([...knitReelLot, ...weaverReelLot])];
      obj.fbrc_fabric_type = [
        ...new Set([...knitFabricTypes, ...weaverFabricTypes]),
      ];
      obj.fbrc_weave_total_length = weaverTotalFabricLength.reduce(
        (acc: any, value: any) => acc + value,
        0
      );
      obj.fbrc_knit_total_weight = knitTotalFabricWeight.reduce(
        (acc: any, value: any) => acc + value,
        0
      );
      obj.fbrc_total_qty = [...knitTotalQty, ...weaverTotalQty].reduce(
        (acc: any, value: any) => acc + value,
        0
      );

      //spinner data
      let spindate =
        spinSales && spinSales.length > 0
          ? spinSales
            .map((val: any) => moment(val?.date).format("DD-MM-YYYY"))
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let spinName =
        spinSales && spinSales.length > 0
          ? spinSales
            .map((val: any) => val?.spinner?.name)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let spinInvoice =
        spinSales && spinSales.length > 0
          ? spinSales
            .map((val: any) => val?.invoice_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let spinLot =
        spinSales && spinSales.length > 0
          ? spinSales
            .map((val: any) => val?.batch_lot_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let spinReelLot =
        spinSales && spinSales.length > 0
          ? spinSales
            .map((val: any) => val?.reel_lot_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let spinYarnCount =
        spinSales && spinSales.length > 0
          ? spinSales
            .map((val: any) => val?.yarncount)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let spinYarnType =
        spinSales && spinSales.length > 0
          ? spinSales
            .map((val: any) => val?.yarn_type)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let spinBoxIds =
        spinSales && spinSales.length > 0
          ? spinSales
            .map((val: any) => val?.box_ids)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let spinNoOfBoxes =
        spinSales && spinSales.length > 0
          ? spinSales
            .map((val: any) => val?.no_of_boxes)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let spinTotalQty =
        spinSales && spinSales.length > 0
          ? spinSales
            .map((val: any) => val?.total_qty)
            .filter((item: any) => item !== null && item !== undefined)
          : [];

      obj.spnr_sale_date = [...new Set(spindate)];
      obj.spnr_name = [...new Set(spinName)];
      obj.spnr_invoice_no = [...new Set(spinInvoice)];
      obj.spnr_lot_no = [...new Set(spinLot)];
      obj.spnr_reel_lot_no = [...new Set(spinReelLot)];
      obj.spnr_yarn_type = [...new Set(spinYarnType)];
      obj.spnr_yarn_count = [...new Set(spinYarnCount)];
      obj.spnr_box_ids = [...new Set(spinBoxIds)];
      obj.spnr_no_of_boxes = spinNoOfBoxes.reduce(
        (acc: any, value: any) => acc + value,
        0
      );
      obj.spnr_total_qty = spinTotalQty.reduce(
        (acc: any, value: any) => acc + value,
        0
      );

      //ginner data
      let gindate =
        ginSales && ginSales.length > 0
          ? ginSales
            .map((val: any) => moment(val?.date).format("DD-MM-YYYY"))
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let ginName =
        ginSales && ginSales.length > 0
          ? ginSales
            .map((val: any) => val?.ginner?.name)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let ginInvoice =
        ginSales && ginSales.length > 0
          ? ginSales
            .map((val: any) => val?.invoice_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let ginLot =
        ginSales && ginSales.length > 0
          ? ginSales
            .map((val: any) => val?.lot_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let ginReelLot =
        ginSales && ginSales.length > 0
          ? ginSales
            .map((val: any) => val?.reel_lot_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let ginPressNo =
        ginSales && ginSales.length > 0
          ? ginSales
            .map((val: any) => val?.press_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let ginNoOfBales =
        ginSales && ginSales.length > 0
          ? ginSales
            .map((val: any) => val?.no_of_bales)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let ginTotalQty =
        ginSales && ginSales.length > 0
          ? ginSales
            .map((val: any) => val?.total_qty)
            .filter((item: any) => item !== null && item !== undefined)
          : [];

      obj.gnr_sale_date = [...new Set(gindate)];
      obj.gnr_name = [...new Set(ginName)];
      obj.gnr_invoice_no = [...new Set(ginInvoice)];
      obj.gnr_lot_no = [...new Set(ginLot)];
      obj.gnr_reel_lot_no = [...new Set(ginReelLot)];
      obj.gnr_press_no = [...new Set(ginPressNo)];
      obj.gnr_no_of_bales = ginNoOfBales.reduce(
        (acc: any, value: any) => acc + value,
        0
      );
      obj.gnr_total_qty = ginTotalQty.reduce(
        (acc: any, value: any) => acc + value,
        0
      );

      //transaction data
      let frmrTransactionIds =
        transactions && transactions.length > 0
          ? transactions
            .map((val: any) => val?.id)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let frmrdate =
        transactions && transactions.length > 0
          ? transactions
            .map((val: any) => moment(val?.date).format("DD-MM-YYYY"))
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let frmrFarmGroupName =
        transactions && transactions.length > 0
          ? transactions
            .map((val: any) => val?.farmer?.farmGroup?.name)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let frmrVillages =
        transactions && transactions.length > 0
          ? transactions
            .map((val: any) => val?.village?.village_name)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let frmrStates =
        transactions && transactions.length > 0
          ? transactions
            .map((val: any) => val?.state?.state_name)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let frmrPrograms =
        transactions && transactions.length > 0
          ? transactions
            .map((val: any) => val?.program?.program_name)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let frmrQtyPurchased =
        transactions && transactions.length > 0
          ? transactions
            .map((val: any) => Number(val?.qty_purchased))
            .filter((item: any) => item !== null && item !== undefined)
          : [];

      obj.frmr_transactions_id = [...new Set(frmrTransactionIds)];
      obj.frmr_sale_date = [...new Set(frmrdate)];
      obj.frmr_farm_group = [...new Set(frmrFarmGroupName)];
      obj.frmr_villages = [...new Set(frmrVillages)];
      obj.frmr_states = [...new Set(frmrStates)];
      obj.frmr_programs = [...new Set(frmrPrograms)];
      obj.frmr_total_qty_purchased = frmrQtyPurchased.reduce(
        (acc: any, value: any) => acc + value,
        0
      );

      data.push({
        ...item.dataValues,
        ...obj,
        // knitSales,
        // weaverSales,
        // spinSales,
        // ginSales,
        // transactions_ids,
        // transactions
      });

      const rowValues = Object.values({
        index: index + 1,
        buyer: item.dataValues.buyer ? item.dataValues.buyer.brand_name : "",
        // qr: item.dataValues.qr ? process.env.BASE_URL + item.dataValues.qr : '',
        qr: item.dataValues.qr ? baseurl + item.dataValues.qr : "",
        date: item.dataValues.date ? item.dataValues.date : "",
        garment_name: item.dataValues.garment
          ? item.dataValues.garment.name
          : "",
        invoice: item.dataValues.invoice_no ? item.dataValues.invoice_no : "",
        stylemarkNo:
          item.dataValues.style_mark_no &&
            item.dataValues.style_mark_no.length > 0
            ? item.dataValues.style_mark_no.join(", ")
            : "",
        garmentType:
          item.dataValues.garment_type &&
            item.dataValues.garment_type.length > 0
            ? item.dataValues.garment_type.join(", ")
            : "",
        no_of_boxes: item.dataValues.total_no_of_boxes
          ? item.dataValues.total_no_of_boxes
          : 0,
        no_of_pieces: item.dataValues.total_no_of_pieces
          ? item.dataValues.total_no_of_pieces
          : 0,
        dying_processor_name:
          obj.dying_processor_name && obj.dying_processor_name.length > 0
            ? obj.dying_processor_name.join(", ")
            : "",
        dying_inv:
          obj.dying_inv && obj.dying_inv.length > 0
            ? obj.dying_inv.join(", ")
            : "",
        dying_batch_lot_no:
          obj.dying_batch_lot_no && obj.dying_batch_lot_no.length > 0
            ? obj.dying_batch_lot_no.join(", ")
            : "",
        dying_total_quantity: obj.dying_total_quantity ?? "",
        dying_net_weight: obj.dying_net_weight ?? "",

        washing_processor_name:
          obj.washing_processor_name && obj.washing_processor_name.length > 0
            ? obj.washing_processor_name.join(", ")
            : "",
        washing_inv:
          obj.washing_inv && obj.washing_inv.length > 0
            ? obj.washing_inv.join(", ")
            : "",
        washing_batch_lot_no:
          obj.washing_batch_lot_no && obj.washing_batch_lot_no.length > 0
            ? obj.washing_batch_lot_no.join(", ")
            : "",
        washing_total_quantity: obj.washing_total_quantity ?? "",
        washing_net_weight: obj.washing_net_weight ?? "",

        printing_processor_name:
          obj.printing_processor_name && obj.printing_processor_name.length > 0
            ? obj.printing_processor_name.join(", ")
            : "",
        printing_inv:
          obj.printing_inv && obj.printing_inv.length > 0
            ? obj.printing_inv.join(", ")
            : "",
        printing_batch_lot_no:
          obj.printing_batch_lot_no && obj.printing_batch_lot_no.length > 0
            ? obj.printing_batch_lot_no.join(", ")
            : "",
        printing_total_quantity: obj.printing_total_quantity ?? "",
        printing_net_weight: obj.printing_net_weight ?? "",
        compacting_processor_name:
          obj.compacting_processor_name &&
            obj.compacting_processor_name.length > 0
            ? obj.compacting_processor_name.join(", ")
            : "",
        compacting_inv:
          obj.compacting_inv && obj.compacting_inv.length > 0
            ? obj.compacting_inv.join(", ")
            : "",
        compacting_batch_lot_no:
          obj.compacting_batch_lot_no && obj.compacting_batch_lot_no.length > 0
            ? obj.compacting_batch_lot_no.join(", ")
            : "",
        compacting_total_quantity: obj.compacting_total_quantity ?? "",
        compacting_net_weight: obj.compacting_net_weight ?? "",
        // fbrc_date: obj.fbrc_sale_date && obj.fbrc_sale_date.length > 0 ? obj.fbrc_sale_date.join(', ') : '',
        fbrc_date:
          obj.fbrc_sale_date && obj.fbrc_sale_date.length > 0
            ? obj.fbrc_sale_date.join(", ")
            : "",
        fbrc_name:
          obj.fbrc_name && obj.fbrc_name.length > 0
            ? obj.fbrc_name.join(", ")
            : "",
        fbrc_invoice:
          obj.fbrc_invoice_no && obj.fbrc_invoice_no.length > 0
            ? obj.fbrc_invoice_no.join(", ")
            : "",
        fbrc_lot:
          obj.fbrc_lot_no && obj.fbrc_lot_no.length > 0
            ? obj.fbrc_lot_no.join(", ")
            : "",
        fbrc_type:
          obj.fbrc_fabric_type && obj.fbrc_fabric_type.length > 0
            ? obj.fbrc_fabric_type.join(", ")
            : "",
        // total_fabric_length: item.dataValues.total_fabric_length
        //   ? item.dataValues.total_fabric_length
        //   : 0,
        // total_fabric_weight: item.dataValues.total_fabric_weight
        //   ? item.dataValues.total_fabric_weight
        // : 0,
        fbrc_net_length: obj.fbrc_weave_total_length
          ? obj.fbrc_weave_total_length
          : 0,
        fbrc_net_weight: obj.fbrc_knit_total_weight
          ? obj.fbrc_knit_total_weight
          : 0,
        spnr_date:
          obj.spnr_sale_date && obj.spnr_sale_date.length > 0
            ? obj.spnr_sale_date.join(", ")
            : "",
        spnr_name:
          obj.spnr_name && obj.spnr_name.length > 0
            ? obj.spnr_name.join(", ")
            : "",
        spnr_invoice_no:
          obj.spnr_invoice_no && obj.spnr_invoice_no.length > 0
            ? obj.spnr_invoice_no.join(", ")
            : "",
        spnr_reel_lot_no:
          obj.spnr_reel_lot_no && obj.spnr_reel_lot_no.length > 0
            ? obj.spnr_reel_lot_no.join(", ")
            : "",
        spnr_lot_no:
          obj.spnr_lot_no && obj.spnr_lot_no.length > 0
            ? obj.spnr_lot_no.join(", ")
            : "",
        spnr_yarn_type:
          obj.spnr_yarn_type && obj.spnr_yarn_type.length > 0
            ? obj.spnr_yarn_type.join(", ")
            : "",
        spnr_yarn_count:
          obj.spnr_yarn_count && obj.spnr_yarn_count.length > 0
            ? obj.spnr_yarn_count.join(", ")
            : "",
        spnr_no_of_boxes: obj.spnr_no_of_boxes ? obj.spnr_no_of_boxes : 0,
        spnr_box_ids:
          obj.spnr_box_ids && obj.spnr_box_ids.length > 0
            ? obj.spnr_box_ids.join(", ")
            : "",
        fbrc_total_qty: obj.fbrc_total_qty ? obj.fbrc_total_qty : 0,
        gnr_sale_date:
          obj.gnr_sale_date && obj.gnr_sale_date.length > 0
            ? obj.gnr_sale_date.join(", ")
            : "",
        gnr_invoice_no:
          obj.gnr_invoice_no && obj.gnr_invoice_no.length > 0
            ? obj.gnr_invoice_no.join(", ")
            : "",
        gnr_name:
          obj.gnr_name && obj.gnr_name.length > 0
            ? obj.gnr_name.join(", ")
            : "",
        gnr_reel_lot_no:
          obj.gnr_reel_lot_no && obj.gnr_reel_lot_no.length > 0
            ? obj.gnr_reel_lot_no.join(", ")
            : "",
        gnr_lot_no:
          obj.gnr_lot_no && obj.gnr_lot_no.length > 0
            ? obj.gnr_lot_no.join(", ")
            : "",
        gnr_no_of_bales: obj.gnr_no_of_bales ? obj.gnr_no_of_bales : 0,
        gnr_press_no:
          obj.gnr_press_no && obj.gnr_press_no.length > 0
            ? obj.gnr_press_no.join(", ")
            : "",
        gnr_total_qty: obj.gnr_total_qty ? obj.gnr_total_qty : 0,
        frmr_sale_date:
          obj.frmr_sale_date && obj.frmr_sale_date.length > 0
            ? obj.frmr_sale_date.join(", ")
            : "",
        frmr_farm_group:
          obj.frmr_farm_group && obj.frmr_farm_group.length > 0
            ? obj.frmr_farm_group.join(", ")
            : "",
        frmr_transactions_id:
          obj.frmr_transactions_id && obj.frmr_transactions_id.length > 0
            ? obj.frmr_transactions_id.join(", ")
            : "",
        frmr_villages:
          obj.frmr_villages && obj.frmr_villages.length > 0
            ? obj.frmr_villages.join(", ")
            : "",
        frmr_states:
          obj.frmr_states && obj.frmr_states.length > 0
            ? obj.frmr_states.join(", ")
            : "",
        frmr_programs:
          obj.frmr_programs && obj.frmr_programs.length > 0
            ? obj.frmr_programs.join(", ")
            : "",
          });
      worksheet.addRow(rowValues);
    }
    // Set the width for the S No. column
    worksheet.getColumn(1).width = 8; // Adjust the width as needed

    // Auto-adjust other column widths based on content
    worksheet.columns.slice(1).forEach((column: any) => {
      let maxCellLength = 0;
      column.eachCell({ includeEmpty: true }, (cell: any) => {
        const cellLength = (cell.value ? cell.value.toString() : "").length;
        maxCellLength = Math.max(maxCellLength, cellLength);
      });
      column.width = Math.min(30, maxCellLength + 2); // Limit width to 30 characters
    });
    
    // Save the workbook
    await workbook.xlsx.writeFile(excelFilePath);
    res.status(200).send({
      success: true,
      messgage: "File successfully Generated",
      data: process.env.BASE_URL + "consolidated-traceabilty-report.xlsx",
    });
    // await ExportData.update({
    //   consolidated_tracebality_load: false
    // }, { where: { consolidated_tracebality_load: true } })
  } catch (error: any) {
    // (async () => {
    //   await ExportData.update({
    //     consolidated_tracebality_load: false
    //   }, { where: { consolidated_tracebality_load: true } })
    // })()
    console.log(error);
    return res.sendError(res, error.message);
  }
};

const spinnerBackwardTraceabiltyReport = async (
  req: Request,
  res: Response
) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  const {
    spinnerId,
    knitterId,
    weaverId,
    seasonId,
    brandId,
    programId,
    type,
  }: any = req.query;
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
        { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { "$weaver.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$knitter.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$spinner.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
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

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.season_id = { [Op.in]: idArray };
    }

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.program_id = { [Op.in]: idArray };
    }

    if (type) {
      if (type === "knitter") {
        whereCondition.knitter_id = { [Op.not]: null };
      }
      if (type === "weaver") {
        whereCondition.buyer_id = { [Op.not]: null };
      }
    }

    if (knitterId) {
      const idArray: number[] = knitterId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.knitter_id = { [Op.in]: idArray };
    }
    if (weaverId) {
      const idArray: number[] = weaverId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.buyer_id = { [Op.in]: idArray };
    }

    whereCondition.status = "Sold";

    let include = [
      {
        model: Spinner,
        as: "spinner",
        attributes: ["id", "name"],
      },
      {
        model: Weaver,
        as: "weaver",
        attributes: ["id", "name"],
      },
      {
        model: Knitter,
        as: "knitter",
        attributes: ["id", "name"],
      },
      {
        model: Season,
        as: "season",
        attributes: ["id", "name"],
      },
      {
        model: Program,
        as: "program",
        attributes: ["id", "program_name"],
      },
    ];

    //fetch data with pagination
    const { count, rows } = await SpinSales.findAndCountAll({
      attributes: ['id', 'reel_lot_no', 'invoice_no', 'qr'],
      where: whereCondition,
      include: include,
      order: [["id", "desc"]],
      offset: offset,
      limit: limit,
    });

    let data = [];

    for await (let [index, item] of rows.entries()) {
      let spnr_lint_ids: any = [];
      let spinSaleProcess = await SpinProcessYarnSelection.findAll({
        where: {
          sales_id: item.dataValues.id,
        },
        attributes: ["id", "spin_process_id"],
      });
      let spinProcess = await LintSelections.findAll({
        where: {
          process_id: spinSaleProcess.map(
            (obj: any) => obj?.dataValues?.spin_process_id
          ),
        },
        attributes: ["id", "lint_id"],
      });
      spnr_lint_ids = spinProcess.map((obj: any) => obj?.dataValues?.lint_id);

      let ginSales: any = [];
      let gin_process_ids: any = [];
      let transactions_ids: any = [];

      if (spnr_lint_ids.length > 0) {
        ginSales = await GinSales.findAll({
          attributes: [
            "id",
            // "date",
            // "buyer",
            "invoice_no",
            // "lot_no",
            // "total_qty",
            // "no_of_bales",
            // "press_no",
            "reel_lot_no",
            // "ginner_id",
          ],
          include: [
            {
              model: Ginner,
              as: "ginner",
              attributes: ["id", "name"],
            },
          ],
          where: {
            id: {
              [Op.in]: spnr_lint_ids,
            },
          },
        });

        let ginBaleId = await BaleSelection.findAll({
          where: {
            sales_id: ginSales.map((obj: any) => obj.dataValues.id),
          },
          attributes: ["id", "bale_id"],
        });

        let ginProcessIds = await GinBale.findAll({
          where: {
            id: ginBaleId.map((obj: any) => obj.dataValues.bale_id),
          },
          attributes: ["id", "process_id"],
        });
        gin_process_ids = ginProcessIds.map(
          (obj: any) => obj.dataValues.process_id
        );
      }

      if (gin_process_ids.length > 0) {
        let cottornIds = await CottonSelection.findAll({
          where: {
            process_id: gin_process_ids,
          },
          attributes: ["id", "transaction_id"],
        });
        transactions_ids = cottornIds.map(
          (obj: any) => obj.dataValues.transaction_id
        );
      }

      let transactions: any = [];
      if (transactions_ids.length > 0) {
        transactions = await Transaction.findAll({
          attributes: [
            "id",
            // "date",
            // "state_id",
            // "village_id",
            // "farmer_id",
            // "farm_id",
            // "program_id",
            // "qty_purchased",
          ],
          where: {
            id: {
              [Op.in]: transactions_ids,
            },
          },
          include: [
            {
              model: Village,
              as: "village",
              attributes: ["id", "village_name"],
            },
            {
              model: Farmer,
              as: "farmer",
              attributes: [
                "id",
                "farmGroup_id",
                "firstName",
                "lastName",
                "code",
              ],
              include: [
                {
                  model: FarmGroup,
                  as: "farmGroup",
                  attributes: ["id", "name"],
                },
              ],
            }
          ],
        });
      }

      let obj: any = {};

      //ginner data
      // let gindate =
      //   ginSales && ginSales.length > 0
      //     ? ginSales
      //         .map((val: any) => moment(val?.date).format("DD-MM-YYYY"))
      //         .filter((item: any) => item !== null && item !== undefined)
      //     : [];
      let ginName =
        ginSales && ginSales.length > 0
          ? ginSales
            .map((val: any) => val?.ginner?.name)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let ginInvoice =
        ginSales && ginSales.length > 0
          ? ginSales
            .map((val: any) => val?.invoice_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      // let ginLot =
      //   ginSales && ginSales.length > 0
      //     ? ginSales
      //         .map((val: any) => val?.lot_no)
      //         .filter((item: any) => item !== null && item !== undefined)
      //     : [];
      let ginReelLot =
        ginSales && ginSales.length > 0
          ? ginSales
            .map((val: any) => val?.reel_lot_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      // let ginPressNo =
      //   ginSales && ginSales.length > 0
      //     ? ginSales
      //         .map((val: any) => val?.press_no)
      //         .filter((item: any) => item !== null && item !== undefined)
      //     : [];
      // let ginNoOfBales =
      //   ginSales && ginSales.length > 0
      //     ? ginSales
      //         .map((val: any) => val?.no_of_bales)
      //         .filter((item: any) => item !== null && item !== undefined)
      //     : [];
      // let ginTotalQty =
      //   ginSales && ginSales.length > 0
      //     ? ginSales
      //         .map((val: any) => val?.total_qty)
      //         .filter((item: any) => item !== null && item !== undefined)
      //     : [];

      // obj.gnr_sale_date = [...new Set(gindate)];
      obj.gnr_name = [...new Set(ginName)];
      obj.gnr_invoice_no = [...new Set(ginInvoice)];
      // obj.gnr_lot_no = [...new Set(ginLot)];
      obj.gnr_reel_lot_no = [...new Set(ginReelLot)];
      // obj.gnr_press_no = [...new Set(ginPressNo)];
      // obj.gnr_no_of_bales = ginNoOfBales.reduce(
      //   (acc: any, value: any) => acc + value,
      //   0
      // );
      // obj.gnr_total_qty = ginTotalQty.reduce(
      //   (acc: any, value: any) => acc + value,
      //   0
      // );

      //transaction data
      // let frmrTransactionIds =
      //   transactions && transactions.length > 0
      //     ? transactions
      //         .map((val: any) => val?.id)
      //         .filter((item: any) => item !== null && item !== undefined)
      //     : [];
      // let frmrdate =
      //   transactions && transactions.length > 0
      //     ? transactions
      //         .map((val: any) => moment(val?.date).format("DD-MM-YYYY"))
      //         .filter((item: any) => item !== null && item !== undefined)
      //     : [];
      let frmrFarmGroupName =
        transactions && transactions.length > 0
          ? transactions
            .map((val: any) => val?.farmer?.farmGroup?.name)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let frmrVillages =
        transactions && transactions.length > 0
          ? transactions
            .map((val: any) => val?.village?.village_name)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      // let frmrStates =
      //   transactions && transactions.length > 0
      //     ? transactions
      //         .map((val: any) => val?.state?.state_name)
      //         .filter((item: any) => item !== null && item !== undefined)
      //     : [];
      // let frmrPrograms =
      //   transactions && transactions.length > 0
      //     ? transactions
      //         .map((val: any) => val?.program?.program_name)
      //         .filter((item: any) => item !== null && item !== undefined)
      //     : [];
      // let frmrQtyPurchased =
      //   transactions && transactions.length > 0
      //     ? transactions
      //         .map((val: any) => Number(val?.qty_purchased))
      //         .filter((item: any) => item !== null && item !== undefined)
      //     : [];

      // obj.frmr_transactions_id = [...new Set(frmrTransactionIds)];
      // obj.frmr_sale_date = [...new Set(frmrdate)];
      obj.frmr_farm_group = [...new Set(frmrFarmGroupName)];
      obj.frmr_villages = [...new Set(frmrVillages)];
      // obj.frmr_states = [...new Set(frmrStates)];
      // obj.frmr_programs = [...new Set(frmrPrograms)];
      // obj.frmr_total_qty_purchased = frmrQtyPurchased.reduce(
      //   (acc: any, value: any) => acc + value,
      //   0
      // );

      data.push({
        ...item.dataValues,
        ...obj,
      });
    }

    return res.sendPaginationSuccess(res, data, count);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

const exportSpinnerBackwardTraceability = async (
  req: Request,
  res: Response
) => {
  // spinner_backward_tracebality_load
  await ExportData.update({
    spinner_backward_tracebality_load: true
  }, { where: { spinner_backward_tracebality_load: false } })
  res.send({ status: 200, message: "export file processing" })
  const excelFilePath = path.join(
    "./upload",
    "spinner-backward-traceabilty-report.xlsx"
  );
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  const {
    spinnerId,
    knitterId,
    weaverId,
    seasonId,
    brandId,
    programId,
    type,
  }: any = req.query;
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
        { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { "$weaver.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$knitter.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$spinner.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
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

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.season_id = { [Op.in]: idArray };
    }

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.program_id = { [Op.in]: idArray };
    }

    if (type) {
      if (type === "knitter") {
        whereCondition.knitter_id = { [Op.not]: null };
      }
      if (type === "weaver") {
        whereCondition.buyer_id = { [Op.not]: null };
      }
    }

    if (knitterId) {
      const idArray: number[] = knitterId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.knitter_id = { [Op.in]: idArray };
    }
    if (weaverId) {
      const idArray: number[] = weaverId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.buyer_id = { [Op.in]: idArray };
    }

    whereCondition.status = "Sold";

    let include = [
      {
        model: Spinner,
        as: "spinner",
        attributes: ["id", "name"],
      },
      {
        model: Season,
        as: "season",
        attributes: ["id", "name"],
      },
      {
        model: Program,
        as: "program",
        attributes: ["id", "program_name"],
      },
      // {
      //   model: YarnCount,
      //   as: "yarncount",
      //   attributes: ["id", "yarnCount_name"],
      // },
      {
        model: Weaver,
        as: "weaver",
        attributes: ["id", "name"],
      },
      {
        model: Knitter,
        as: "knitter",
        attributes: ["id", "name"],
      },
    ];

    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    worksheet.mergeCells("A1:J1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Spinner Backward Traceability Report";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "S No.",
      "Fabric Mill name",
      "Spinner- Fabric Invoice No",
      "Spinner Name",
      "Yarn REEL Lot Sold",
      "Ginner to Spinner Invoice",
      "Ginner name",
      "Bale REEL lot lint consumed",
      "Villages",
      "Farm Group",
    ]);
    headerRow.font = { bold: true };

    //fetch data with pagination
    const { count, rows } = await SpinSales.findAndCountAll({
      where: whereCondition,
      include: include,
      order: [["id", "desc"]],
      offset: offset,
      limit: limit,
    });

    let data = [];

    for await (let [index, item] of rows.entries()) {
      let spnr_lint_ids: any = [];
      let spinSaleProcess = await SpinProcessYarnSelection.findAll({
        where: {
          sales_id: item.dataValues.id,
        },
        attributes: ["id", "spin_process_id"],
      });
      let spinProcess = await LintSelections.findAll({
        where: {
          process_id: spinSaleProcess.map(
            (obj: any) => obj?.dataValues?.spin_process_id
          ),
        },
        attributes: ["id", "lint_id"],
      });
      spnr_lint_ids = spinProcess.map((obj: any) => obj?.dataValues?.lint_id);

      let ginSales: any = [];
      let gin_process_ids: any = [];
      let transactions_ids: any = [];

      if (spnr_lint_ids.length > 0) {
        ginSales = await GinSales.findAll({
          attributes: [
            "id",
            "date",
            "buyer",
            "invoice_no",
            "lot_no",
            "total_qty",
            "no_of_bales",
            "press_no",
            "reel_lot_no",
            "ginner_id",
          ],
          include: [
            {
              model: Ginner,
              as: "ginner",
              attributes: ["id", "name"],
            },
          ],
          where: {
            id: {
              [Op.in]: spnr_lint_ids,
            },
          },
        });

        let ginBaleId = await BaleSelection.findAll({
          where: {
            sales_id: ginSales.map((obj: any) => obj.dataValues.id),
          },
          attributes: ["id", "bale_id"],
        });

        let ginProcessIds = await GinBale.findAll({
          where: {
            id: ginBaleId.map((obj: any) => obj.dataValues.bale_id),
          },
          attributes: ["id", "process_id"],
        });
        gin_process_ids = ginProcessIds.map(
          (obj: any) => obj.dataValues.process_id
        );
      }

      if (gin_process_ids.length > 0) {
        let cottornIds = await CottonSelection.findAll({
          where: {
            process_id: gin_process_ids,
          },
          attributes: ["id", "transaction_id"],
        });
        transactions_ids = cottornIds.map(
          (obj: any) => obj.dataValues.transaction_id
        );
      }

      let transactions: any = [];
      if (transactions_ids.length > 0) {
        transactions = await Transaction.findAll({
          attributes: [
            "id",
            "date",
            "state_id",
            "village_id",
            "farmer_id",
            "farm_id",
            "program_id",
            "qty_purchased",
          ],
          where: {
            id: {
              [Op.in]: transactions_ids,
            },
          },
          include: [
            {
              model: Village,
              as: "village",
              attributes: ["id", "village_name"],
            },
            {
              model: State,
              as: "state",
              attributes: ["id", "state_name"],
            },
            {
              model: Farmer,
              as: "farmer",
              attributes: [
                "id",
                "farmGroup_id",
                "firstName",
                "lastName",
                "code",
              ],
              include: [
                {
                  model: FarmGroup,
                  as: "farmGroup",
                  attributes: ["id", "name"],
                },
              ],
            },
            {
              model: Program,
              as: "program",
              attributes: ["id", "program_name"],
            },
            {
              model: Ginner,
              as: "ginner",
              attributes: ["id", "name", "address"],
            },
          ],
        });
      }

      let obj: any = {};

      //ginner data
      let gindate =
        ginSales && ginSales.length > 0
          ? ginSales
            .map((val: any) => moment(val?.date).format("DD-MM-YYYY"))
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let ginName =
        ginSales && ginSales.length > 0
          ? ginSales
            .map((val: any) => val?.ginner?.name)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let ginInvoice =
        ginSales && ginSales.length > 0
          ? ginSales
            .map((val: any) => val?.invoice_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let ginLot =
        ginSales && ginSales.length > 0
          ? ginSales
            .map((val: any) => val?.lot_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let ginReelLot =
        ginSales && ginSales.length > 0
          ? ginSales
            .map((val: any) => val?.reel_lot_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let ginPressNo =
        ginSales && ginSales.length > 0
          ? ginSales
            .map((val: any) => val?.press_no)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let ginNoOfBales =
        ginSales && ginSales.length > 0
          ? ginSales
            .map((val: any) => val?.no_of_bales)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let ginTotalQty =
        ginSales && ginSales.length > 0
          ? ginSales
            .map((val: any) => val?.total_qty)
            .filter((item: any) => item !== null && item !== undefined)
          : [];

      obj.gnr_sale_date = [...new Set(gindate)];
      obj.gnr_name = [...new Set(ginName)];
      obj.gnr_invoice_no = [...new Set(ginInvoice)];
      obj.gnr_lot_no = [...new Set(ginLot)];
      obj.gnr_reel_lot_no = [...new Set(ginReelLot)];
      obj.gnr_press_no = [...new Set(ginPressNo)];
      obj.gnr_no_of_bales = ginNoOfBales.reduce(
        (acc: any, value: any) => acc + value,
        0
      );
      obj.gnr_total_qty = ginTotalQty.reduce(
        (acc: any, value: any) => acc + value,
        0
      );

      //transaction data
      let frmrTransactionIds =
        transactions && transactions.length > 0
          ? transactions
            .map((val: any) => val?.id)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let frmrdate =
        transactions && transactions.length > 0
          ? transactions
            .map((val: any) => moment(val?.date).format("DD-MM-YYYY"))
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let frmrFarmGroupName =
        transactions && transactions.length > 0
          ? transactions
            .map((val: any) => val?.farmer?.farmGroup?.name)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let frmrVillages =
        transactions && transactions.length > 0
          ? transactions
            .map((val: any) => val?.village?.village_name)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let frmrStates =
        transactions && transactions.length > 0
          ? transactions
            .map((val: any) => val?.state?.state_name)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let frmrPrograms =
        transactions && transactions.length > 0
          ? transactions
            .map((val: any) => val?.program?.program_name)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let frmrQtyPurchased =
        transactions && transactions.length > 0
          ? transactions
            .map((val: any) => Number(val?.qty_purchased))
            .filter((item: any) => item !== null && item !== undefined)
          : [];

      obj.frmr_transactions_id = [...new Set(frmrTransactionIds)];
      obj.frmr_sale_date = [...new Set(frmrdate)];
      obj.frmr_farm_group = [...new Set(frmrFarmGroupName)];
      obj.frmr_villages = [...new Set(frmrVillages)];
      obj.frmr_states = [...new Set(frmrStates)];
      obj.frmr_programs = [...new Set(frmrPrograms)];
      obj.frmr_total_qty_purchased = frmrQtyPurchased.reduce(
        (acc: any, value: any) => acc + value,
        0
      );

      data.push({
        ...item.dataValues,
        ...obj,
      });

      const rowValues = Object.values({
        index: index + 1,
        buyer: item.dataValues.knitter
          ? item.dataValues.knitter.name
          : item.dataValues.weaver.name,
        invoice: item.dataValues.invoice_no ? item.dataValues.invoice_no : "",
        spinner_name: item.dataValues.spinner
          ? item.dataValues.spinner.name
          : "",
        reelLot: item.dataValues.reel_lot_no ? item.dataValues.reel_lot_no : "",
        gnr_invoice_no:
          obj.gnr_invoice_no && obj.gnr_invoice_no.length > 0
            ? obj.gnr_invoice_no.join(", ")
            : "",
        gnr_name:
          obj.gnr_name && obj.gnr_name.length > 0
            ? obj.gnr_name.join(", ")
            : "",
        gnr_reel_lot_no:
          obj.gnr_reel_lot_no && obj.gnr_reel_lot_no.length > 0
            ? obj.gnr_reel_lot_no.join(", ")
            : "",
        frmr_villages:
          obj.frmr_villages && obj.frmr_villages.length > 0
            ? obj.frmr_villages.join(", ")
            : "",
        frmr_farm_group:
          obj.frmr_farm_group && obj.frmr_farm_group.length > 0
            ? obj.frmr_farm_group.join(", ")
            : "",
      });
      worksheet.addRow(rowValues);
    }

    // Set the width for the S No. column
    worksheet.getColumn(1).width = 8; // Adjust the width as needed

    // Auto-adjust other column widths based on content
    worksheet.columns.slice(1).forEach((column: any) => {
      let maxCellLength = 0;
      column.eachCell({ includeEmpty: true }, (cell: any) => {
        const cellLength = (cell.value ? cell.value.toString() : "").length;
        maxCellLength = Math.max(maxCellLength, cellLength);
      });
      column.width = Math.min(30, maxCellLength + 2); // Limit width to 30 characters
    });

    // Save the workbook
    await workbook.xlsx.writeFile(excelFilePath);
    // res.status(200).send({
    //   success: true,
    //   messgage: "File successfully Generated",
    //   data: process.env.BASE_URL + "spinner-backward-traceabilty-report.xlsx",
    // });
    await ExportData.update({
      spinner_backward_tracebality_load: false
    }, { where: { spinner_backward_tracebality_load: true } })

  } catch (error: any) {
    (async () => {
      await ExportData.update({
        spinner_backward_tracebality_load: false
      }, { where: { spinner_backward_tracebality_load: true } })
    })()
    console.log(error);
    return res.sendError(res, error.message);
  }
};

const villageSeedCottonReport = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  const { brandId, stateId, countryId, seasonId }: any = req.query;

  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$farmer.village.village_name$": { [Op.iLike]: `%${searchTerm}%` } }, // Search by first name
      ];
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$farmer.country_id$"] = { [Op.in]: idArray };
    }
    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$farmer.brand_id$"] = { [Op.in]: idArray };
    }

    if (stateId) {
      const idArray: number[] = stateId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$farmer.state_id$"] = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.season_id = { [Op.in]: idArray };
    }

    const { count, rows } = await Farm.findAndCountAll({
      attributes: [
        [sequelize.col('"farmer"."village_id"'), "village_id"],
        [sequelize.col('"farmer"."village"."village_name"'), "village_name"],
        [sequelize.col('"season"."id"'), "season_id"],
        [sequelize.col('"season"."name"'), "season_name"],
        [
          sequelize.fn(
            "COALESCE",
            sequelize.fn(
              "SUM",
              Sequelize.literal(
                'CAST("farms"."total_estimated_cotton"AS DOUBLE PRECISION)'
              )
            ),
            0
          ),
          "estimated_seed_cotton",
        ],
        [
          sequelize.fn(
            "COALESCE",
            sequelize.fn(
              "SUM",
              Sequelize.literal(
                'CAST("farms"."cotton_transacted" AS DOUBLE PRECISION)'
              )
            ),
            0
          ),
          "procured_seed_cotton",
        ],
        [
          sequelize.literal(
            '(COALESCE(SUM(CAST("farms"."total_estimated_cotton" AS DOUBLE PRECISION)), 0) - COALESCE(SUM(CAST("farms"."cotton_transacted" AS DOUBLE PRECISION)), 0))'
          ),
          "avaiable_seed_cotton",
        ],
      ],
      include: [
        {
          model: Farmer,
          as: "farmer",
          attributes: [],
          include: [
            {
              model: Village,
              as: "village",
              attributes: [],
            },
          ],
        },{
          model: Season,
          as: 'season',
          attributes: [],
        }
      ],
      where: whereCondition,
      group: ["farmer.village_id", "farmer.village.id", "season_id", "season.id"],
      order: [["village_id", "desc"]],
      offset: offset,
      limit: limit,
    });
    let data: any = [];

    if (rows.length > 0) {
      for await (let row of rows) {
        let percentage =
          Number(row.dataValues.estimated_seed_cotton) >
            Number(row.dataValues.procured_seed_cotton)
            ? (Number(row.dataValues.procured_seed_cotton) /
              Number(row.dataValues.estimated_seed_cotton)) *
            100
            : 0;

        data.push({
          ...row.dataValues,
          prct_procured_cotton: formatDecimal(percentage),
        });
      }
    }

    return res.sendPaginationSuccess(res, data, count.length);
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.message);
  }
};

const exportVillageSeedCotton = async (req: Request, res: Response) => {
  // village_seed_cotton_load
  await ExportData.update({
    village_seed_cotton_load: true
  }, { where: { village_seed_cotton_load: false } })
  res.send({ status: 200, message: "export file processing" })
  const excelFilePath = path.join(
    "./upload",
    "village-seed-cotton-report.xlsx"
  );
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  const { stateId, brandId, countryId, seasonId }: any = req.query;
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$farmer.village.village_name$": { [Op.iLike]: `%${searchTerm}%` } }, // Search by first name
      ];
    }

    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$farmer.brand_id$"] = { [Op.in]: idArray };
    }

    if (stateId) {
      const idArray: number[] = stateId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$farmer.state_id$"] = { [Op.in]: idArray };
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$farmer.country_id$"] = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.season_id = { [Op.in]: idArray };
    }
    

    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    worksheet.mergeCells("A1:F1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Village Seed Cotton Report";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.",
      "Village Name ",
      "Season ",
      "Total Estimated Seed cotton of village (Kgs)",
      "Total Seed Cotton Procured from village (Kgs)",
      "Total Seed Cotton in Stock at village (Kgs)",
      "% Seed Cotton Procured",
    ]);
    headerRow.font = { bold: true };

    const { count, rows } = await Farm.findAndCountAll({
      attributes: [
        [sequelize.col('"farmer"."village_id"'), "village_id"],
        [sequelize.col('"farmer"."village"."village_name"'), "village_name"],
        [sequelize.col('"season"."id"'), "season_id"],
        [sequelize.col('"season"."name"'), "season_name"],
        [
          sequelize.fn(
            "COALESCE",
            sequelize.fn(
              "SUM",
              Sequelize.literal(
                'CAST("farms"."total_estimated_cotton"AS DOUBLE PRECISION)'
              )
            ),
            0
          ),
          "estimated_seed_cotton",
        ],
        [
          sequelize.fn(
            "COALESCE",
            sequelize.fn(
              "SUM",
              Sequelize.literal(
                'CAST("farms"."cotton_transacted" AS DOUBLE PRECISION)'
              )
            ),
            0
          ),
          "procured_seed_cotton",
        ],
        [
          sequelize.literal(
            '(COALESCE(SUM(CAST("farms"."total_estimated_cotton" AS DOUBLE PRECISION)), 0) - COALESCE(SUM(CAST("farms"."cotton_transacted" AS DOUBLE PRECISION)), 0))'
          ),
          "avaiable_seed_cotton",
        ],
      ],
      include: [
        {
          model: Farmer,
          as: "farmer",
          attributes: [],
          include: [
            {
              model: Village,
              as: "village",
              attributes: [],
            },
          ],
        },{
          model: Season,
          as: 'season',
          attributes: [],
        }
      ],
      where: whereCondition,
      group: ["farmer.village_id", "farmer.village.id", "season_id", "season.id"],
      order: [["village_id", "desc"]],
      offset: offset,
      limit: limit,
    });

    // Append data to worksheet
    for await (const [index, item] of rows.entries()) {
      let percentage =
        Number(item?.dataValues?.estimated_seed_cotton) >
          Number(item?.dataValues.procured_seed_cotton)
          ? (Number(item?.dataValues.procured_seed_cotton) /
            Number(item?.dataValues.estimated_seed_cotton)) *
          100
          : 0;

      const rowValues = Object.values({
        index: index + 1,
        village_name: item?.dataValues?.village_name
          ? item?.dataValues?.village_name
          : "",
        season_name: item?.dataValues?.season_name
          ? item?.dataValues?.season_name
          : "",
        estimated_seed_cotton: item?.dataValues?.estimated_seed_cotton
          ? Number(item.dataValues?.estimated_seed_cotton)
          : 0,
        procured_seed_cotton: item?.dataValues?.procured_seed_cotton
          ? Number(item.dataValues?.procured_seed_cotton)
          : 0,
        avaiable_seed_cotton:
          item?.dataValues?.avaiable_seed_cotton &&
            item?.dataValues?.avaiable_seed_cotton > 0
            ? Number(item.dataValues?.avaiable_seed_cotton)
            : 0,
        prct_procured_cotton: percentage
          ? Number(formatDecimal(percentage))
          : 0,
      });
      worksheet.addRow(rowValues);
    }

    // Set the width for the S No. column
    worksheet.getColumn(1).width = 10; // Adjust the width as needed

    // Auto-adjust other column widths based on content
    worksheet.columns.slice(1).forEach((column: any) => {
      let maxCellLength = 0;
      column.eachCell({ includeEmpty: true }, (cell: any) => {
        const cellLength = (cell.value ? cell.value.toString() : "").length;
        maxCellLength = Math.max(maxCellLength, cellLength);
      });
      column.width = Math.min(25, maxCellLength + 2); // Limit width to 30 characters
    });

    // Save the workbook
    await workbook.xlsx.writeFile(excelFilePath);
    // res.status(200).send({
    //   success: true,
    //   messgage: "File successfully Generated",
    //   data: process.env.BASE_URL + "village-seed-cotton-report.xlsx",
    // });
    await ExportData.update({
      village_seed_cotton_load: false
    }, { where: { village_seed_cotton_load: true } })
  } catch (error: any) {
    (async () => {
      await ExportData.update({
        village_seed_cotton_load: false
      }, { where: { village_seed_cotton_load: true } })
    })
    console.error(error);
    return res.sendError(res, error.message);
  }
};

const spinnerProcessBackwardTraceabiltyReport = async (
  req: Request,
  res: Response
) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const whereConditions: any = [];
  const {
    spinnerId,
    seasonId,
    brandId,
    programId,
    type,
  }: any = req.query;
  try {
    if (searchTerm) {
      whereConditions.push(`(
        "spinprocess"."reel_lot_no" ILIKE '%${searchTerm}%' OR 
        "spinner"."name" ILIKE '%${searchTerm}%'
      )`);
    }
    
    if (spinnerId) {
      whereConditions.push(`"spinprocess"."spinner_id" IN (${spinnerId})`);
    }
    
    if (brandId) {
      whereConditions.push(`"spinner"."brand" && ARRAY[${brandId}]`);
    }
    
    if (seasonId) {
      whereConditions.push(`"spinprocess"."season_id" IN (${seasonId})`);
    }
    
    if (programId) {
      whereConditions.push(`"spinprocess"."program_id" IN (${programId})`);
    }
    
    // Ensure that the process id is not null
    whereConditions.push(`"spinprocess"."id" IS NOT NULL`);

    // Join the conditions with 'AND'
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : '';
    

    //fetch data with pagination

    const rows: any = await sequelize.query(
      `WITH lintcomsumption AS (
        SELECT 
            "spinprocess"."id" AS "spinprocess_id",
            "spinprocess"."date" AS "date",
            "spinprocess"."createdAt" AS "createdAt",
            "spinprocess"."reel_lot_no" AS "reel_lot_no",
            "spinprocess"."net_yarn_qty" AS "net_yarn_qty",
            "spinner"."id" AS "spinner_id",
            "spinner"."name" AS "spinner_name",
            "spinprocess"."qr" AS "qr",
            ARRAY_AGG(DISTINCT lint_id) AS "spnr_lint_ids",
            STRING_AGG(DISTINCT "ginsales"."invoice_no", ',') AS "gnr_invoice_no",
            STRING_AGG(DISTINCT "ginsales"."lot_no", ',') AS "gnr_lot_no",
            STRING_AGG(DISTINCT "ginsales"."reel_lot_no", ',') AS "gnr_reel_lot_no",
            STRING_AGG(DISTINCT "ginsales->ginner"."name", ',') AS "gnr_name",
            COALESCE(SUM("qty_used"), 0) AS "lint_consumed"
        FROM "lint_selections"
        INNER JOIN "spin_processes" AS "spinprocess" ON "lint_selections"."process_id" = "spinprocess"."id"
        LEFT JOIN "gin_sales" AS "ginsales" ON "lint_selections"."lint_id" = "ginsales"."id"
        LEFT JOIN "ginners" AS "ginsales->ginner" ON "ginsales"."ginner_id" = "ginsales->ginner"."id"
        LEFT JOIN "spinners" AS "spinner" ON "spinprocess"."spinner_id" = "spinner"."id"
        ${whereClause}
        GROUP BY 
            "spinprocess"."id",
            "spinner"."id"
        ORDER BY "spinprocess_id" DESC
        OFFSET ${offset} LIMIT ${limit}
        ),
        yarn_consumption AS (
            SELECT 
                s.spin_process_id,
                SUM(s.qty_used) AS spnr_yarn_sold, 
                array_agg(ss.invoice_no) AS invoice_no, 
                string_agg(ss.invoice_no, ', ') AS spnr_invoice_no,
                array_agg(k.name) AS knitter, 
                string_agg(k.name, ', ') AS knitters,
                array_agg(w.name) AS weaver,
                string_agg(w.name, ', ') AS weavers
            FROM 
                spin_process_yarn_selections s
            JOIN 
                spin_sales ss ON s.sales_id = ss.id
            LEFT JOIN 
                weavers w ON ss.buyer_id = w.id
            LEFT JOIN 
                knitters k ON ss.knitter_id = k.id
            GROUP BY 
                s.spin_process_id
        ),
        gin_bales AS (
          SELECT 
          bs.sales_id AS gin_sales_id,
          array_agg(DISTINCT bs.bale_id) AS bales_ids,
          array_agg(DISTINCT bale.process_id) AS gin_process_id
          FROM 
            bale_selections bs
          JOIN 
                    "gin-bales" bale ON bs.bale_id = bale.id
          WHERE bs.sales_id IN (
                        SELECT 
                            UNNEST(lc.spnr_lint_ids)
                        FROM 
                            lintcomsumption lc
                    )
          GROUP BY 
                bs.sales_id
        ),
        village_info AS (
          SELECT 
          cs.process_id AS ginprocess_id,
          array_agg(DISTINCT v.village_name) AS villageid,
          string_agg(DISTINCT v.village_name, ', ') AS village_names
          FROM 
            cotton_selections cs
          JOIN 
            transactions t ON cs.transaction_id = t.id
          JOIN 
            villages v ON t.village_id = v.id
          WHERE 
            cs.process_id IN (
              SELECT 
                UNNEST(gb.gin_process_id)
              FROM 
                gin_bales gb
            )
          GROUP BY 
            cs.process_id
        )
        SELECT 
          lc.spinprocess_id,
          lc.spinner_name,
          lc.reel_lot_no,
          lc.gnr_lot_no,
          lc.gnr_reel_lot_no,
          lc.gnr_invoice_no,
          lc.gnr_name,
          lc.net_yarn_qty,
          lc.lint_consumed,
          yc.spnr_invoice_no,
          yc.spnr_yarn_sold,
          yc.knitter,
          yc.weaver,
          vi.village_names,
          lc.qr
        FROM 
            lintcomsumption lc
        LEFT JOIN 
            yarn_consumption yc ON lc.spinprocess_id = yc.spin_process_id
        LEFT JOIN 
            gin_bales gb ON gb.gin_sales_id = ANY(lc.spnr_lint_ids) -- Assuming spnr_lint_ids is an array of text
        LEFT JOIN 
            village_info vi ON vi.ginprocess_id = ANY(gb.gin_process_id);`
    );

    const groupedData = Object.values(rows[0]?.reduce((acc: any, curr: any) => {
      const { spinprocess_id, spinner_name,reel_lot_no, net_yarn_qty, gnr_lot_no, gnr_reel_lot_no, gnr_invoice_no, gnr_name, lint_consumed, spnr_invoice_no, spnr_yarn_sold, knitter, weaver, qr, village_names } = curr;
      if (!acc[spinprocess_id]) {
          acc[spinprocess_id] = { spinprocess_id, spinner_name,reel_lot_no, net_yarn_qty, gnr_lot_no, gnr_reel_lot_no, gnr_invoice_no, gnr_name, lint_consumed, spnr_invoice_no, spnr_yarn_sold, knitter, weaver, qr, village_names: new Set(village_names?.split(', ').map((name: any) => name)) };
      } else {
          village_names?.split(', ').forEach((name: any) => acc[spinprocess_id].village_names?.add(name));
      }
      return acc;
    }, {})).map((item: any) => ({ ...item, village_names: Array.from(item.village_names).join(', ') }));

    let data = [];

    for await (let [index, item] of groupedData?.entries()) {
      let knitterName =
        item.knitter && item.knitter.length > 0
        ? item.knitter
          .map((val: any) => val)
          .filter((item: any) => item !== null && item !== undefined)
        : [];
      
      let weaverName =
        item.weaver && item.weaver.length > 0
          ? item.weaver
            .map((val: any) => val)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
 
      let fbrc_name = [...new Set([...knitterName, ...weaverName])];

      data.push({
        ...item,
        fbrc_name,
      });
    }

    const countQuery = `
      SELECT COUNT(DISTINCT "spinprocess"."id") AS total_records
      FROM "lint_selections"
      INNER JOIN "spin_processes" AS "spinprocess" ON "lint_selections"."process_id" = "spinprocess"."id"
      LEFT JOIN "gin_sales" AS "ginsales" ON "lint_selections"."lint_id" = "ginsales"."id"
      LEFT JOIN "ginners" AS "ginsales->ginner" ON "ginsales"."ginner_id" = "ginsales->ginner"."id"
      LEFT JOIN "spinners" AS "spinner" ON "spinprocess"."spinner_id" = "spinner"."id"
      ${whereClause}
    `;

    // Execute the count query
    const countResult = await sequelize.query(countQuery);
    const count = countResult ? Number(countResult[0][0]?.total_records) : 0;

    return res.sendPaginationSuccess(res, data, count);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

const exportSpinProcessBackwardfTraceabilty = async (req: Request, res: Response) => {
  // spinner_yarn_process_load
  const excelFilePath = path.join("./upload", "excel-spin-process-backward-traceability.xlsx");

  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { exportType, spinnerId, seasonId, programId, brandId}: any = req.query;
  const offset = (page - 1) * limit;
  const whereConditions: any = [];
  try {

    if (exportType === "all") {
      return res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "spin-process-backward-traceability.xlsx",
      });
    } else {

      if (searchTerm) {
        whereConditions.push(`(
          "spinprocess"."reel_lot_no" ILIKE '%${searchTerm}%' OR 
          "spinner"."name" ILIKE '%${searchTerm}%'
        )`);
      }
      
      if (spinnerId) {
        whereConditions.push(`"spinprocess"."spinner_id" IN (${spinnerId})`);
      }
      
      if (brandId) {
        whereConditions.push(`"spinner"."brand" && ARRAY[${brandId}]`);
      }
      
      if (seasonId) {
        whereConditions.push(`"spinprocess"."season_id" IN (${seasonId})`);
      }
      
      if (programId) {
        whereConditions.push(`"spinprocess"."program_id" IN (${programId})`);
      }
      
      // Ensure that the process id is not null
      whereConditions.push(`"spinprocess"."id" IS NOT NULL`);
      
      // Join the conditions with 'AND'
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : '';

    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    worksheet.mergeCells("A1:M1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Spinner Process Backward Traceability Report";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "S. No.",
      "Spinner Name",
      "Fabric Name",
      "Yarn REEL Lot No",
      "Invoice Number",
      "Yarn Quantity Processed (Kgs)",
      "Yarn Quantity Sold (Kgs)",
      "Bale REEL Lot lint consumed",
      "Bale Lot No",
      "Ginner to Spinner Invoice",
      "Lint Consumed (Kgs)",
      "Villages",
      "Ginner Name"
    ]);
    headerRow.font = { bold: true };

    const rows: any = await sequelize.query(
      `WITH lintcomsumption AS (
        SELECT 
            "spinprocess"."id" AS "spinprocess_id",
            "spinprocess"."date" AS "date",
            "spinprocess"."createdAt" AS "createdAt",
            "spinprocess"."reel_lot_no" AS "reel_lot_no",
            "spinprocess"."net_yarn_qty" AS "net_yarn_qty",
            "spinner"."id" AS "spinner_id",
            "spinner"."name" AS "spinner_name",
            "spinprocess"."qr" AS "qr",
            ARRAY_AGG(DISTINCT lint_id) AS "spnr_lint_ids",
            STRING_AGG(DISTINCT "ginsales"."invoice_no", ',') AS "gnr_invoice_no",
            STRING_AGG(DISTINCT "ginsales"."lot_no", ',') AS "gnr_lot_no",
            STRING_AGG(DISTINCT "ginsales"."reel_lot_no", ',') AS "gnr_reel_lot_no",
            STRING_AGG(DISTINCT "ginsales->ginner"."name", ',') AS "gnr_name",
            COALESCE(SUM("qty_used"), 0) AS "lint_consumed"
        FROM "lint_selections"
        INNER JOIN "spin_processes" AS "spinprocess" ON "lint_selections"."process_id" = "spinprocess"."id"
        LEFT JOIN "gin_sales" AS "ginsales" ON "lint_selections"."lint_id" = "ginsales"."id"
        LEFT JOIN "ginners" AS "ginsales->ginner" ON "ginsales"."ginner_id" = "ginsales->ginner"."id"
        LEFT JOIN "spinners" AS "spinner" ON "spinprocess"."spinner_id" = "spinner"."id"
        ${whereClause}
        GROUP BY 
            "spinprocess"."id",
            "spinner"."id"
        ORDER BY "spinprocess_id" DESC
        OFFSET ${offset} LIMIT ${limit}
        ),
        yarn_consumption AS (
            SELECT 
                s.spin_process_id,
                SUM(s.qty_used) AS spnr_yarn_sold, 
                array_agg(ss.invoice_no) AS invoice_no, 
                string_agg(ss.invoice_no, ', ') AS spnr_invoice_no,
                array_agg(k.name) AS knitter, 
                string_agg(k.name, ', ') AS knitters,
                array_agg(w.name) AS weaver,
                string_agg(w.name, ', ') AS weavers
            FROM 
                spin_process_yarn_selections s
            JOIN 
                spin_sales ss ON s.sales_id = ss.id
            LEFT JOIN 
                weavers w ON ss.buyer_id = w.id
            LEFT JOIN 
                knitters k ON ss.knitter_id = k.id
            GROUP BY 
                s.spin_process_id
        ),
        gin_bales AS (
          SELECT 
          bs.sales_id AS gin_sales_id,
          array_agg(DISTINCT bs.bale_id) AS bales_ids,
          array_agg(DISTINCT bale.process_id) AS gin_process_id
          FROM 
            bale_selections bs
          JOIN 
                    "gin-bales" bale ON bs.bale_id = bale.id
          WHERE bs.sales_id IN (
                        SELECT 
                            UNNEST(lc.spnr_lint_ids)
                        FROM 
                            lintcomsumption lc
                    )
          GROUP BY 
                bs.sales_id
        ),
        village_info AS (
          SELECT 
          cs.process_id AS ginprocess_id,
          array_agg(DISTINCT v.village_name) AS villageid,
          string_agg(DISTINCT v.village_name, ', ') AS village_names
          FROM 
            cotton_selections cs
          JOIN 
            transactions t ON cs.transaction_id = t.id
          JOIN 
            villages v ON t.village_id = v.id
          WHERE 
            cs.process_id IN (
              SELECT 
                UNNEST(gb.gin_process_id)
              FROM 
                gin_bales gb
            )
          GROUP BY 
            cs.process_id
        )
        SELECT 
          lc.spinprocess_id,
          lc.spinner_name,
          lc.reel_lot_no,
          lc.gnr_lot_no,
          lc.gnr_reel_lot_no,
          lc.gnr_invoice_no,
          lc.gnr_name,
          lc.net_yarn_qty,
          lc.lint_consumed,
          yc.spnr_invoice_no,
          yc.spnr_yarn_sold,
          yc.knitter,
          yc.weaver,
          vi.village_names
        FROM 
            lintcomsumption lc
        LEFT JOIN 
            yarn_consumption yc ON lc.spinprocess_id = yc.spin_process_id
        LEFT JOIN 
            gin_bales gb ON gb.gin_sales_id = ANY(lc.spnr_lint_ids) -- Assuming spnr_lint_ids is an array of text
        LEFT JOIN 
            village_info vi ON vi.ginprocess_id = ANY(gb.gin_process_id);`
    );

    const groupedData = Object.values(rows[0]?.reduce((acc: any, curr: any) => {
      const { spinprocess_id, spinner_name,reel_lot_no, net_yarn_qty, gnr_lot_no, gnr_reel_lot_no, gnr_invoice_no, gnr_name, lint_consumed, spnr_invoice_no, spnr_yarn_sold, knitter, weaver, village_names } = curr;
      if (!acc[spinprocess_id]) {
          acc[spinprocess_id] = { spinprocess_id, spinner_name,reel_lot_no, net_yarn_qty, gnr_lot_no, gnr_reel_lot_no, gnr_invoice_no, gnr_name, lint_consumed, spnr_invoice_no, spnr_yarn_sold, knitter, weaver, village_names: new Set(village_names?.split(', ').map((name: any) => name)) };
      } else {
          village_names?.split(', ').forEach((name: any) => acc[spinprocess_id].village_names?.add(name));
      }
      return acc;
    }, {})).map((item: any) => ({ ...item, village_names: Array.from(item.village_names).join(', ') }));


    for await (let [index, item] of groupedData?.entries()) {
      let knitterName =
        item.knitter && item.knitter.length > 0
        ? item.knitter
          .map((val: any) => val)
          .filter((item: any) => item !== null && item !== undefined)
        : [];
      
      let weaverName =
        item.weaver && item.weaver.length > 0
          ? item.weaver
            .map((val: any) => val)
            .filter((item: any) => item !== null && item !== undefined)
          : [];

      
      let fbrc_name = [...new Set([...knitterName, ...weaverName])];


        const rowValues = Object.values({
        index: index + 1,
        spinner: item?.spinner_name ? item.spinner_name : "",
        fabric:  fbrc_name && fbrc_name.length > 0
        ? fbrc_name.join(", ")
        : "",
        reel_lot_no: item?.reel_lot_no ? item?.reel_lot_no : "",
        spnr_invoice: item.spnr_invoice_no
        ? item.spnr_invoice_no
        : "",
        total: item?.net_yarn_qty ? Number(item?.net_yarn_qty) : 0,
        yarnSold: item.spnr_yarn_sold ? Number(item.spnr_yarn_sold) : 0,
        ginReel: item?.gnr_reel_lot_no
        ? item?.gnr_reel_lot_no
        : "",
        ginLot: item?.gnr_lot_no
        ? item?.gnr_lot_no
        : "",
        invoice: item?.gnr_invoice_no
        ? item?.gnr_invoice_no
        : "",
        lintConsumed: item?.lint_consumed ? Number(item?.lint_consumed) : 0,
        frmrVillages: item.village_names
        ? item.village_names
        : "",
        ginner: item?.gnr_name
        ? item?.gnr_name
        : "",
      });
      worksheet.addRow(rowValues);
    }

    // Auto-adjust column widths based on content
    worksheet.columns.forEach((column: any) => {
      let maxCellLength = 0;
      column.eachCell({ includeEmpty: true }, (cell: any) => {
        const cellLength = (cell.value ? cell.value.toString() : "").length;
        maxCellLength = Math.max(maxCellLength, cellLength);
      });
      column.width = Math.min(14, maxCellLength + 2); // Limit width to 30 characters
    });

    // Save the workbook
    await workbook.xlsx.writeFile(excelFilePath);
    res.status(200).send({
      success: true,
      messgage: "File successfully Generated",
      data: process.env.BASE_URL + "excel-spin-process-backward-traceability.xlsx",
    });
  }
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

const brandWiseDataReport = async (req: Request, res: Response) =>{
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  const seasonWhere: any = {};
  const ginBaleWhere: any = {};
  const baleSelectionWhere: any = {};
  const {
    seasonId,
    brandId,
    programId,
    countryId,
    type,
  }: any = req.query;

  try {

    if (searchTerm) {
      whereCondition[Op.or] = [
        { brand_name: { [Op.iLike]: `%${searchTerm}%` } },
        // { "$spinner.name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }

    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.id = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
        seasonWhere.season_id = { [Op.in]: idArray };
        ginBaleWhere["$ginprocess.season_id$"] = { [Op.in]: idArray };
        baleSelectionWhere["$sales.season_id$"] = { [Op.in]: idArray };
    }

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.programs_id = { [Op.overlap]: idArray };
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.countries_id = { [Op.overlap]: idArray };
    }

    const {count, rows} = await Brand.findAndCountAll({
      where: whereCondition,
      order: [["id", "desc"]],
      offset: offset,
      limit: limit,
    })

    let data= [];
    for await (let [index, item] of rows.entries()) {

      let [result, trans, lintProcured, lintSold, yarnProcessed, yarnSold]: any =
        await Promise.all([
          Farm.findOne({
            where: {
              ...seasonWhere,
              "$farmer.brand_id$": item.dataValues.id},
            attributes: [
              [Sequelize.fn('COUNT', Sequelize.literal('DISTINCT farmer_id')), 'total_farmers'],
              [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('farms.total_estimated_cotton')), 0), 'total_estimated_cotton']
            ],
            include: [{
              model: Farmer,
              as: 'farmer',
              attributes: []
            }],
            group:["farmer.brand_id"]
          }),
          Transaction.findOne({
            attributes: [
              [Sequelize.fn('COALESCE', Sequelize.fn('sum', Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")), 0), 'total_cotton_procured']
            ],
            where: {
              ...seasonWhere,
              brand_id: item?.dataValues?.id,
            }
          }),
          GinBale.findOne({
            attributes: [
              [
                sequelize.fn(
                  "COALESCE",
                  sequelize.fn(
                    "SUM",
                    sequelize.literal(
                      'CAST("gin-bales"."weight" AS DOUBLE PRECISION)'
                    )
                  ),
                  0
                ),
                "lint_processed",
              ],
              [
                sequelize.fn(
                  "COUNT",
                  Sequelize.literal('DISTINCT "gin-bales"."id"')
                ),
                "bales_processed",
              ],
            ],
            include: [
              {
                model: GinProcess,
                as: "ginprocess",
                attributes: [],
                include: [
                  {
                    model: Ginner,
                    as: "ginner",
                    attributes: [],
                  },
                ],
              },
            ],
            where: {
              ...ginBaleWhere,
              "$ginprocess.ginner.brand$": { [Op.overlap]: [item?.dataValues?.id] },
            },
            group: ['ginprocess.ginner.brand'],
          }),
          BaleSelection.findOne({
            attributes: [
              [
                sequelize.fn(
                  "COALESCE",
                  sequelize.fn(
                    "SUM",
                    sequelize.literal(
                      'CAST("bale"."weight" AS DOUBLE PRECISION)'
                    )
                  ),
                  0
                ),
                "lint_sold",
              ],
              [
                sequelize.fn("COUNT", Sequelize.literal("DISTINCT bale_id")),
                "bales_sold",
              ],
            ],
            include: [
              {
                model: GinSales,
                as: "sales",
                attributes: [],
                include: [
                  {
                    model: Ginner,
                    as: "ginner",
                    attributes: [],
                  },
                ],
              },
              {
                model: GinBale,
                as: "bale",
                attributes: [],
              },
            ],
            where: {
              ...baleSelectionWhere,
              "$sales.ginner.brand$": { [Op.overlap]: [item?.dataValues?.id] },
            },
            group: ["sales.ginner.brand"],
          }),
          SpinProcess.findOne({
            attributes: [
              [
                sequelize.fn(
                  "COALESCE",
                  sequelize.fn("SUM", sequelize.col("net_yarn_qty")),
                  0
                ),
                "yarn_processed",
              ],
            ],
            include: [
              {
                model: Spinner,
                as: "spinner",
                attributes: [],
              },
            ],
            where: {
              ...seasonWhere,
              "$spinner.brand$": { [Op.overlap]: [item?.dataValues?.id] },
            },
            group: ["spinner.brand"],
          }),
          SpinSales.findOne({
            attributes: [
              [
                sequelize.fn(
                  "COALESCE",
                  sequelize.fn("SUM", sequelize.col("total_qty")),
                  0
                ),
                "yarn_sold",
              ],
            ],
            include: [
              {
                model: Spinner,
                as: "spinner",
                attributes: [],
              },
            ],
            where: {
              ...seasonWhere,
              "$spinner.brand$": { [Op.overlap]: [item?.dataValues?.id] },
            },
            group: ["spinner.brand"],
          }),
        ]);
  
      let obj: any = {};

      obj.id = item?.dataValues?.id;
      obj.brand_name = item?.dataValues?.brand_name;
      obj.farmer_count = result ? formatDecimal(result?.dataValues?.total_farmers) : 0;
      obj.estimated_cotton = result ? formatDecimal(convert_kg_to_mt(result?.dataValues?.total_estimated_cotton ?? 0)) : 0;
      obj.cotton_procured = trans ? formatDecimal(convert_kg_to_mt(trans?.dataValues?.total_cotton_procured ?? 0)) : 0;
      obj.bales_processed = lintProcured ? lintProcured?.dataValues?.bales_processed : 0;
      obj.lint_processed = lintProcured ? formatDecimal(convert_kg_to_mt(lintProcured?.dataValues?.lint_processed ?? 0)) : 0;
      obj.lint_sold = lintSold ? formatDecimal(convert_kg_to_mt(lintSold?.dataValues?.lint_sold ?? 0)) : 0;
      obj.bales_sold = lintSold ? lintSold?.dataValues?.bales_sold : 0;
      obj.yarn_processed = yarnProcessed ? formatDecimal(convert_kg_to_mt(yarnProcessed?.dataValues?.yarn_processed ?? 0)) : 0;
      obj.yarn_sold = yarnSold ? formatDecimal(convert_kg_to_mt(yarnSold?.dataValues?.yarn_sold ?? 0)) : 0;

      data.push(obj)
    }
    
    return res.sendPaginationSuccess(res, data, count);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
}


const exportBrandWiseDataReport = async (req: Request, res: Response) =>{
  const excelFilePath = path.join(
    "./upload",
    "excel-brand-wise-data-report.xlsx"
  );

  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  const seasonWhere: any = {};
  const ginBaleWhere: any = {};
  const baleSelectionWhere: any = {};
  const {
    seasonId,
    brandId,
    programId,
    countryId,
    exportType,
  }: any = req.query;

  try {
    if (exportType === "all") {

      return res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "brand-wise-data-report.xlsx",
      });

    } else {

    if (searchTerm) {
      whereCondition[Op.or] = [
        { brand_name: { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }

    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.id = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
        seasonWhere.season_id = { [Op.in]: idArray };
        ginBaleWhere["$ginprocess.season_id$"] = { [Op.in]: idArray };
        baleSelectionWhere["$sales.season_id$"] = { [Op.in]: idArray };
    }

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.programs_id = { [Op.overlap]: idArray };
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.countries_id = { [Op.overlap]: idArray };
    }

          // Create the excel workbook file
          const workbook = new ExcelJS.Workbook();
          const worksheet = workbook.addWorksheet("Sheet1");
          worksheet.mergeCells("A1:J1");
          const mergedCell = worksheet.getCell("A1");
          mergedCell.value = "CottonConnect | Brand Wise Data Report";
          mergedCell.font = { bold: true };
          mergedCell.alignment = { horizontal: "center", vertical: "middle" };
          // Set bold font for header row
          const headerRow = worksheet.addRow([
            "Sr No.",
            "Brand",
            "Total Numbers of Farmers Registered",
            "Total Estimated Seed Cotton (MT)",
            "Total Seed Cotton Procured (MT)",
            "Total Number of Bales Processed",
            "Total Lint Processed (MT)",
            "Total Lint Sold (MT)",
            "Total Yarn Processed (MT)",
            "Total Yarn Sold (MT)",
          ]);
          headerRow.font = { bold: true };

    const rows = await Brand.findAll({
      where: whereCondition,
      order: [["id", "desc"]],
      offset: offset,
      limit: limit,
    })

    for await (let [index, item] of rows.entries()) {

      let [result, trans, lintProcured, lintSold, yarnProcessed, yarnSold]: any =
        await Promise.all([
          Farm.findOne({
            where: {
              ...seasonWhere,
              "$farmer.brand_id$": item.dataValues.id},
            attributes: [
              [Sequelize.fn('COUNT', Sequelize.literal('DISTINCT farmer_id')), 'total_farmers'],
              [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('farms.total_estimated_cotton')), 0), 'total_estimated_cotton']
            ],
            include: [{
              model: Farmer,
              as: 'farmer',
              attributes: []
            }],
            group:["farmer.brand_id"]
          }),
          Transaction.findOne({
            attributes: [
              [Sequelize.fn('COALESCE', Sequelize.fn('sum', Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")), 0), 'total_cotton_procured']
            ],
            where: {
              ...seasonWhere,
              brand_id: item?.dataValues?.id,
            }
          }),
          GinBale.findOne({
            attributes: [
              [
                sequelize.fn(
                  "COALESCE",
                  sequelize.fn(
                    "SUM",
                    sequelize.literal(
                      'CAST("gin-bales"."weight" AS DOUBLE PRECISION)'
                    )
                  ),
                  0
                ),
                "lint_processed",
              ],
              [
                sequelize.fn(
                  "COUNT",
                  Sequelize.literal('DISTINCT "gin-bales"."id"')
                ),
                "bales_processed",
              ],
            ],
            include: [
              {
                model: GinProcess,
                as: "ginprocess",
                attributes: [],
                include: [
                  {
                    model: Ginner,
                    as: "ginner",
                    attributes: [],
                  },
                ],
              },
            ],
            where: {
              ...ginBaleWhere,
              "$ginprocess.ginner.brand$": { [Op.overlap]: [item?.dataValues?.id] },
            },
            group: ['ginprocess.ginner.brand'],
          }),
          BaleSelection.findOne({
            attributes: [
              [
                sequelize.fn(
                  "COALESCE",
                  sequelize.fn(
                    "SUM",
                    sequelize.literal(
                      'CAST("bale"."weight" AS DOUBLE PRECISION)'
                    )
                  ),
                  0
                ),
                "lint_sold",
              ],
              [
                sequelize.fn("COUNT", Sequelize.literal("DISTINCT bale_id")),
                "bales_sold",
              ],
            ],
            include: [
              {
                model: GinSales,
                as: "sales",
                attributes: [],
                include: [
                  {
                    model: Ginner,
                    as: "ginner",
                    attributes: [],
                  },
                ],
              },
              {
                model: GinBale,
                as: "bale",
                attributes: [],
              },
            ],
            where: {
              ...baleSelectionWhere,
              "$sales.ginner.brand$": { [Op.overlap]: [item?.dataValues?.id] },
            },
            group: ["sales.ginner.brand"],
          }),
          SpinProcess.findOne({
            attributes: [
              [
                sequelize.fn(
                  "COALESCE",
                  sequelize.fn("SUM", sequelize.col("net_yarn_qty")),
                  0
                ),
                "yarn_processed",
              ],
            ],
            include: [
              {
                model: Spinner,
                as: "spinner",
                attributes: [],
              },
            ],
            where: {
              ...seasonWhere,
              "$spinner.brand$": { [Op.overlap]: [item?.dataValues?.id] },
            },
            group: ["spinner.brand"],
          }),
          SpinSales.findOne({
            attributes: [
              [
                sequelize.fn(
                  "COALESCE",
                  sequelize.fn("SUM", sequelize.col("total_qty")),
                  0
                ),
                "yarn_sold",
              ],
            ],
            include: [
              {
                model: Spinner,
                as: "spinner",
                attributes: [],
              },
            ],
            where: {
              ...seasonWhere,
              "$spinner.brand$": { [Op.overlap]: [item?.dataValues?.id] },
            },
            group: ["spinner.brand"],
          }),
        ]);


      const rowValues = Object.values({
        index: index + 1,
        spinner: item?.dataValues.brand_name ? item?.dataValues?.brand_name : "",
        farmer_count: result ? Number(formatDecimal(result?.dataValues?.total_farmers)) : 0,
        estimated_cotton: result ? Number(formatDecimal(convert_kg_to_mt(result?.dataValues?.total_estimated_cotton ?? 0))) : 0,
        cotton_procured: trans ? Number(formatDecimal(convert_kg_to_mt(trans?.dataValues?.total_cotton_procured ?? 0))) : 0,
        bales_processed: lintProcured ? Number(lintProcured?.dataValues?.bales_processed) : 0,
        lint_processed: lintProcured ? Number(formatDecimal(convert_kg_to_mt(lintProcured?.dataValues?.lint_processed ?? 0))) : 0,
        lint_sold: lintSold ? Number(formatDecimal(convert_kg_to_mt(lintSold?.dataValues?.lint_sold ?? 0))) : 0,
        yarn_processed: yarnProcessed ? Number(formatDecimal(convert_kg_to_mt(yarnProcessed?.dataValues?.yarn_processed ?? 0))) : 0,
        yarn_sold: yarnSold ? Number(formatDecimal(convert_kg_to_mt(yarnSold?.dataValues?.yarn_sold ?? 0))) : 0,
      });
      worksheet.addRow(rowValues);
    }

    // Auto-adjust column widths based on content
    worksheet.columns.forEach((column: any) => {
      let maxCellLength = 0;
      column.eachCell({ includeEmpty: true }, (cell: any) => {
        const cellLength = (cell.value ? cell.value.toString() : "").length;
        maxCellLength = Math.max(maxCellLength, cellLength);
      });
      column.width = Math.min(20, maxCellLength + 2); // Limit width to 30 characters
    });

    // Save the workbook
    await workbook.xlsx.writeFile(excelFilePath);

    return res.status(200).send({
      success: true,
      messgage: "File successfully Generated",
      data:
        process.env.BASE_URL + "excel-brand-wise-data-report.xlsx",
    });
    }
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
}


export {
  fetchBaleProcess,
  exportPendingGinnerSales,
  exportGinnerProcess,
  exportLoad,
  fetchPendingGinnerSales,
  fetchGinSalesPagination,
  exportGinnerSales,
  fetchSpinnerBalePagination,
  fetchSpinnerPendingBale,
  exportSpinnerBale,
  exportPendingSpinnerBale,
  fetchSpinnerYarnProcessPagination,
  exportSpinnerYarnProcess,
  fetchSpinSalesPagination,
  exportSpinnerSale,
  fetchKnitterYarnPagination,
  exportKnitterYarn,
  fetchKnitterSalesPagination,
  fetchKnitterYarnProcess,
  exportKnitterYarnProcess,
  exportKnitterSale,
  fetchWeaverYarnPagination,
  exportWeaverYarn,
  fetchWeaverYarnProcess,
  exportWeaverYarnProcess,
  fetchWeaverSalesPagination,
  exportWeaverSale,
  fetchQrCodeTrackPagination,
  exportQrCodeTrack,
  fetchSpinnerSummaryPagination,
  exportSpinnerSummary,
  fetchGinnerSummaryPagination,
  exportGinnerSummary,
  fetchGinnerCottonStock,
  exportGinnerCottonStock,
  fetchSpinnerLintCottonStock,
  exportSpinnerCottonStock,
  fetchGarmentFabricReceipt,
  exportGarmentFabricReceipt,
  fetchGarmentSalesPagination,
  exportGarmentSales,
  getGarmentSalesFilter,
  fetchGarmentFabricProcess,
  exportGarmentFabricProcess,
  fetchPscpPrecurement,
  exportPscpCottonProcurement,
  consolidatedTraceability,
  exportConsolidatedTraceability,
  fetchPscpGinnerPrecurement,
  exportPscpGinnerCottonProcurement,
  fetchPscpProcurementLiveTracker,
  exportPscpProcurementLiveTracker,
  spinnerBackwardTraceabiltyReport,
  exportSpinnerBackwardTraceability,
  villageSeedCottonReport,
  exportVillageSeedCotton,
  spinnerProcessBackwardTraceabiltyReport,
  exportSpinProcessBackwardfTraceabilty,
  brandWiseDataReport,
  exportBrandWiseDataReport,
  fetchSpinnerGreyOutReport,
  exportSpinnerGreyOutReport,
};

