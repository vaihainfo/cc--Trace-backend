import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import GinProcess from "../../models/gin-process.model";
import GinBale from "../../models/gin-bale.model";
import Season from "../../models/season.model";
import Program from "../../models/program.model";
import Ginner from "../../models/ginner.model";
import CottonSelection from "../../models/cotton-selection.model";
import heapSelection from "../../models/heap-selection.model";
import Transaction from "../../models/transaction.model";
import Village from "../../models/village.model";
import sequelize from "../../util/dbConn";
import * as ExcelJS from "exceljs";
import * as fs from "fs";
import * as path from "path";
import Country from "../../models/country.model";
import District from "../../models/district.model";
import Block from "../../models/block.model";
import ICS from "../../models/ics.model";
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
import UserApp from "../../models/users-app.model";
import CropGrade from "../../models/crop-grade.model";
import FailedRecords from "../../models/failed-records.model";
import { NUMBER } from "sequelize";
import GinHeap from "../../models/gin-heap.model";


const exportReportsTameTaking = async () => {
  // //call all export reports one by one on every cron
  await generateOrganicFarmerReport();
  await generateNonOrganicFarmerReport();
  await generateProcurementReport(); // taking time
  await generateAgentTransactions(); // taking time
  
  console.log('TameTaking Cron Job Completed to execute all reports.');
}

const exportReportsOnebyOne = async () => {
  //call all export reports one by one on every cron
  await generateFaildReport("Farmer");
  await generateFaildReport("Procurement");
  // await generateExportFarmer();

  // Procurement Reports 
  await generatePscpCottonProcurement();
  await generatePscpProcurementLiveTracker();

  // //brand wise report
  await generateBrandWiseData();

  // // Ginner Reports 
  await generateGinnerSummary();
  await generateGinnerSales();
  await generatePendingGinnerSales();
  await generateGinnerCottonStock();
  await generateGinnerProcess(); 
  //spinner Reports
  await generateSpinnerSummary();
  await generateSpinnerBale();
  await generateSpinnerYarnProcess();
  await generateSpinnerSale();
  await generatePendingSpinnerBale();
  await generateSpinnerLintCottonStock();
  await generateSpinProcessBackwardfTraceabilty();
  await exportSpinnerGreyOutReport();
  await exportGinHeapReport();
  await exportGinnerProcessGreyOutReport();
  await exportSpinnerProcessGreyOutReport();


  console.log('Cron Job Completed to execute all reports.');
}

//----------------------------------------- Spinner Reports ------------------------//

const exportSpinnerGreyOutReport = async () => {
  // spinner_bale_receipt_load
  const excelFilePath = path.join(
   "./upload",
   "spinner-grey-out-report.xlsx"
 );

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
   worksheet.mergeCells("A1:G1");
   const mergedCell = worksheet.getCell("A1");
   mergedCell.value = "CottonConnect | Spinner Lint Process Greyout Report";
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
     "Total Lint Greyout Quantity (KGs)",
   ]);
   headerRow.font = { bold: true };

   // //fetch data with pagination

   const { count, rows }: any = await GinSales.findAndCountAll({
     where: {greyout_status : true},
     include: include,
     attributes: [
       [Sequelize.col('"season"."name"'), 'season_name'],
       [Sequelize.literal('"ginner"."name"'), "ginner_name"],
       [Sequelize.col('"buyerdata"."name"'), 'spinner'],
       [Sequelize.col('invoice_no'), 'invoice_no'],
       [Sequelize.col('lot_no'), 'lot_no'],
       [Sequelize.col('reel_lot_no'), 'reel_lot_no'],
       [Sequelize.col('qty_stock'), 'qty_stock'],
     ],
    //  group: ['season.id', 'ginner.id', 'buyerdata.id'], 
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
       lint_quantity: item.dataValues.qty_stock? Number(item.dataValues.qty_stock): 0,
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
};


const exportGinHeapReport = async () => {
  const excelFilePath = path.join(
    "./upload",
    "heap-report.xlsx"
  );

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
      ];

      // Create the excel workbook file
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet1");
      worksheet.mergeCells("A1:M1");
      const mergedCell = worksheet.getCell("A1");
      mergedCell.value = "CottonConnect | Heap Report";
      mergedCell.font = { bold: true };
      mergedCell.alignment = { horizontal: "center", vertical: "middle" };
      // Set bold font for header row
      const headerRow = worksheet.addRow([
        "Sr No.",
        "Created Date",
        "Season",
        "Gin heap no.",
        "REEL heap no.",
        "Heap Weight",
        "Heap Stating Date",
        "Heap Ending Date",
        "Vehicle Registration Number",
      ]);
      headerRow.font = { bold: true };

      const { count, rows }: any = await GinHeap.findAndCountAll({
        include: include,
        order: [["id", "desc"]],
      });
      // // Append data to worksheet
      for await (const [index, item] of rows.entries()) {
        const rowValues = Object.values({
          index: index + 1,
          created_date: item.dataValues.createdAt
            ? item.dataValues.createdAt
            : "",
          season: item.dataValues.season.name ? item.dataValues.season.name : "", 
          ginner_heap_no: item.dataValues.ginner_heap_no ? item.dataValues.ginner_heap_no : "",
          reel_heap_no: item.dataValues.reel_heap_no
            ? item.dataValues.reel_heap_no
            : "",
          heap_weight: item.dataValues.estimated_heap
            ? Number(item.dataValues.estimated_heap)
            : 0,
          heap_starting_date: item.dataValues.heap_starting_date ? item.dataValues.heap_starting_date : "",
          heap_ending_date: item.dataValues.heap_ending_date ? item.dataValues.heap_ending_date : "",
          weighbridge_vehicle_no: item.weighbridge_vehicle_no
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
        column.width = Math.min(14, maxCellLength + 2); 
      });

        // Save the workbook
      await workbook.xlsx.writeFile(excelFilePath);
    }

const exportGinnerProcessGreyOutReport = async () => {
  // spinner_bale_receipt_load
  const excelFilePath = path.join(
   "./upload",
   "ginner-process-grey-out-report.xlsx"
 );

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
     }
   ];

   // Create the excel workbook file
   const workbook = new ExcelJS.Workbook();
   const worksheet = workbook.addWorksheet("Sheet1");
   worksheet.mergeCells("A1:G1");
   const mergedCell = worksheet.getCell("A1");
   mergedCell.value = "CottonConnect | Ginner Process Grey Out Report";
   mergedCell.font = { bold: true };
   mergedCell.alignment = { horizontal: "center", vertical: "middle" };
   // Set bold font for header row
   const headerRow = worksheet.addRow([
    "Sr No.",
    "Season",
    "Ginner Name",
    "REEL Lot No",
    "Press Number",
    "Bale Lot No",
    "Total Lint Greyout Quantity (Kgs)",
   ]);
   headerRow.font = { bold: true };

   // //fetch data with pagination

   const { count, rows }: any = await GinProcess.findAndCountAll({
     where: {greyout_status : true},
     include: include,
     attributes: [
      "id",
      [Sequelize.col('"season"."name"'), 'season_name'],
      [Sequelize.literal('"ginner"."name"'), "ginner_name"],
      [Sequelize.col('press_no'), 'press_no'],
      [Sequelize.col('lot_no'), 'lot_no'],
      [Sequelize.col('reel_lot_no'), 'reel_lot_no'],
      [Sequelize.col('total_qty'), 'total_qty'],
     ],
    //  group: ['season.id', 'ginner.id'], 
   });    

   // // Append data to worksheet
   for await (const [index, item] of rows.entries()) {
    let bale = await GinBale.findOne({
      attributes: [
        [
          Sequelize.fn(
            "SUM",
            Sequelize.literal(`
              CASE
                WHEN old_weight IS NOT NULL THEN CAST(old_weight AS DOUBLE PRECISION)
                ELSE CAST(weight AS DOUBLE PRECISION)
              END
            `)
          ),
          "lint_quantity",
        ],
        
        [sequelize.fn("min", sequelize.col("bale_no")), "pressno_from"],
        [sequelize.fn("max", Sequelize.literal("LPAD(bale_no, 10, ' ')")), "pressno_to"],
      ],
      where: { process_id: item.dataValues.id, sold_status: false, is_all_rejected: null },
    });
     const rowValues = Object.values({
       index: index + 1,
       season: item.dataValues.season_name ? item.dataValues.season_name : "",
       ginner: item.dataValues.ginner_name ? item.dataValues.ginner_name : "",
       reel_lot_no: item.dataValues.reel_lot_no ? item.dataValues.reel_lot_no : "",
       press: item.dataValues.press_no ? item.dataValues.press_no : "",
       lot_no: item.dataValues.lot_no ? item.dataValues.lot_no : "",
       lint_quantity: bale.dataValues.lint_quantity ? bale.dataValues.lint_quantity : 0,
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
};

const exportSpinnerProcessGreyOutReport = async () => {
  // spinner_bale_receipt_load
  const excelFilePath = path.join(
   "./upload",
   "spinner-process-grey-out-report.xlsx"
 );

   let include = [
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
       as: "spinner",
       attributes: [],
     },
   ];

   // Create the excel workbook file
   const workbook = new ExcelJS.Workbook();
   const worksheet = workbook.addWorksheet("Sheet1");
   worksheet.mergeCells("A1:G1");
   const mergedCell = worksheet.getCell("A1");
   mergedCell.value = "CottonConnect | Spinner Yarn Greyout Report";
   mergedCell.font = { bold: true };
   mergedCell.alignment = { horizontal: "center", vertical: "middle" };
   // Set bold font for header row
   const headerRow = worksheet.addRow([
    "Sr No.",
    "Season",
    "Spinner Name",
    "REEL Lot No",
    "Spin Lot No",
    "Total Yarn Greyout Quantity (KGs)",
   ]);
   headerRow.font = { bold: true };

   // //fetch data with pagination

   const { count, rows }: any = await SpinProcess.findAndCountAll({
     where: {greyout_status : true},
     include: include,
     attributes: [
       [Sequelize.col('"season"."name"'), 'season_name'],
       [Sequelize.col('"season"."name"'), 'season_name'],
       [Sequelize.col('"spinner"."name"'), 'spinner_name'],
       [Sequelize.col('batch_lot_no'), 'batch_lot_no'],
       [Sequelize.col('reel_lot_no'), 'reel_lot_no'],
       [Sequelize.col('qty_stock'), 'qty_stock'],
     ],
   });    

   // // Append data to worksheet
   for await (const [index, item] of rows.entries()) {
     const rowValues = Object.values({
       index: index + 1,
       season: item.dataValues.season_name ? item.dataValues.season_name : "",
       spinner: item.dataValues.spinner_name ? item.dataValues.spinner_name : "",
       reel_lot_no: item.dataValues.reel_lot_no ? item.dataValues.reel_lot_no : "",
       batch_lot_no: item.dataValues.batch_lot_no ? item.dataValues.batch_lot_no : "",
       lint_quantity: item.dataValues.qty_stock ? item.dataValues.qty_stock : 0,
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
};

const generateSpinnerLintCottonStock = async () => {
  const maxRowsPerWorksheet = 500000; // Maximum number of rows per worksheet in Excel

  try {
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: fs.createWriteStream("./upload/spinner-lint-cotton-stock-report-test.xlsx")
    });
    let worksheetIndex = 0;
    const batchSize = 5000;
    let offset = 0;
    const whereCondition: any = [];


  whereCondition.push(`gs.status IN ('Sold', 'Partially Accepted', 'Partially Rejected')`)
  // sqlCondition.push(`gs.greyout_status IS NOT TRUE`)
  whereCondition.push(`gs.qty_stock > 0`);

  const whereClause = whereCondition.length > 0 ? `WHERE ${whereCondition.join(' AND ')}` : '';

  let hasNextBatch = true;
  while (hasNextBatch) {
    let dataQuery = `
        WITH bale_details AS (
            SELECT 
                bs.sales_id,
                COUNT(DISTINCT gb.id) AS no_of_bales,
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
                gs.status IN ('Sold', 'Partially Accepted', 'Partially Rejected')
                AND (bs.spinner_status = true OR gs.status = 'Sold')
            GROUP BY 
                bs.sales_id
        )
        SELECT 
            gs.*, 
            g.id AS ginner_id, 
            g.name AS ginner_name, 
            s.id AS season_id, 
            s.name AS season_name, 
            p.id AS program_id, 
            p.program_name, 
            sp.id AS spinner_id, 
            sp.name AS spinner_name, 
            sp.address AS spinner_address, 
            bd.no_of_bales AS accepted_no_of_bales, 
            bd.total_qty AS accepted_total_qty
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
            gs."id" ASC
        LIMIT :limit OFFSET :offset
      `;

    const [rows] = await Promise.all([
          sequelize.query(dataQuery, {
              replacements: { limit: batchSize, offset },
              type: sequelize.QueryTypes.SELECT,
          })
      ]);
    

    if (rows.length === 0) {
      hasNextBatch = false;
      break;
    }

    if (offset % maxRowsPerWorksheet === 0) {
      worksheetIndex++;
    }


    for await (const [index, spinner] of rows.entries()) {
      let cotton_consumed = Number(spinner?.accepted_total_qty) > Number(spinner?.qty_stock) ? Number(formatDecimal(spinner?.accepted_total_qty)) - Number(formatDecimal(spinner?.qty_stock))  : 0;

      const rowValues = [
        offset + index + 1,
        spinner?.date ? moment(spinner.date).format('DD-MM-YYYY') : "",
        spinner?.season_name ? spinner?.season_name : "",
        spinner?.ginner_name ? spinner?.ginner_name : "",
        spinner?.spinner_name ? spinner?.spinner_name : "",
        spinner?.reel_lot_no ? spinner?.reel_lot_no : "",
        spinner?.invoice_no ? spinner?.invoice_no : "",
        spinner?.lot_no ? spinner?.lot_no : "",
        spinner?.accepted_total_qty ? Number(formatDecimal(spinner?.accepted_total_qty)) : 0,
        spinner?.qty_stock ? Number(formatDecimal(spinner?.qty_stock)) : 0,
        cotton_consumed,
      ];

      let currentWorksheet = workbook.getWorksheet(`Lint Cotton Stock Report ${worksheetIndex}`);
      if (!currentWorksheet) {
        currentWorksheet = workbook.addWorksheet(`Lint Cotton Stock Report ${worksheetIndex}`);
        if (worksheetIndex == 1) {
          currentWorksheet.mergeCells("A1:K1");
          const mergedCell = currentWorksheet.getCell("A1");
          mergedCell.value = "CottonConnect | Spinner Lint Cotton Stock Report";
          mergedCell.font = { bold: true };
          mergedCell.alignment = { horizontal: "center", vertical: "middle" };
          }
          // Set bold font for header row
          const headerRow = currentWorksheet.addRow([
            "Sr No.",
            "Created Date",
            "Season",
            "Ginner Name",
            "Spinner Name",
            "Reel Lot No",
            "Invoice No",
            "Bale Lot No",
            "Total Lint Cotton Received (Kgs)",
            "Total Lint Cotton in Stock (Kgs)",
            "Total Lint Cotton Consumed (Kgs)",
          ]);
          headerRow.font = { bold: true };
        }
        currentWorksheet.addRow(rowValues).commit();
      }
      offset += batchSize;
    }


  await workbook.commit()
  .then(() => {
    // Rename the temporary file to the final filename
    fs.renameSync("./upload/spinner-lint-cotton-stock-report-test.xlsx", './upload/spinner-lint-cotton-stock-report.xlsx');
    console.log('spinner-lint-cotton-stock report generation completed.');
  })
  .catch(error => {
    console.log('Failed generation?.');
    throw error;
  });
} catch (error) {
  console.error('Error appending data:', error);
}
};
//----------------------------------------- Farmer Reports ------------------------//


const generateExportFarmer = async () => {
  try {
    const maxRowsPerWorksheet = 500000;
    const batchSize = 100000;
    let offset = 0;
    let currentRow = 0;
    let worksheetIndex = 0;

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: fs.createWriteStream("./upload/farmer-data-test.xlsx")
    });

    while (true) {
      const farmers = await Farm.findAll({
        attributes: [
          [Sequelize.fn("concat", Sequelize.col("firstName"), Sequelize.col("lastName")), "farmerName"],
          [Sequelize.col('"farmer"."code"'), 'fatherCode'],
          [Sequelize.col('"farmer"."country"."county_name"'), 'country'],
          [Sequelize.col('"farmer"."state"."state_name"'), 'state'],
          [Sequelize.col('"farmer"."district"."district_name"'), 'district'],
          [Sequelize.col('"farmer"."block"."block_name"'), 'block'],
          [Sequelize.col('"farmer"."village"."village_name"'), 'village'],
          [Sequelize.col('"season"."name"'), 'seasons'],
          [Sequelize.col('"farmer"."farmGroup"."name"'), 'farmGroup'],
          [Sequelize.col('"farmer"."brand"."brand_name"'), 'brand'],
          [Sequelize.col('"farmer"."program"."program_name"'), 'program'],
          [Sequelize.col('"farms"."agri_total_area"'), 'agriTotalArea'],
          [Sequelize.col('"farms"."agri_estimated_yeld"'), 'agriEstimatedYield'],
          [Sequelize.col('"farms"."agri_estimated_prod"'), 'agriEstimatedProd'],
          [Sequelize.col('"farms"."total_estimated_cotton"'), 'totalEstimatedCotton'],
          [Sequelize.col('"farms"."cotton_total_area"'), 'cottonTotalArea'],
          [Sequelize.col('"farmer"."tracenet_id"'), 'tracenetId'],
          [Sequelize.col('"farmer"."ics"."ics_name"'), 'iscName'],
          [Sequelize.col('"farmer"."cert_status"'), 'cert'],
        ],
        include: [
          {
            model: Farmer,
            as: "farmer",
            attributes: [],
            include: [
              {
                model: Program,
                as: "program",
                attributes: [],
              },
              {
                model: Brand,
                as: "brand",
                attributes: [],
              },
              {
                model: FarmGroup,
                as: "farmGroup",
                attributes: [],
              },
              {
                model: Country,
                as: "country",
                attributes: [],
              },
              {
                model: Village,
                as: "village",
                attributes: [],
              },
              {
                model: State,
                as: "state",
                attributes: [],
              },
              {
                model: District,
                as: "district",
                attributes: [],
              },
              {
                model: Block,
                as: "block",
                attributes: [],
              },
              {
                model: Block,
                as: "block",
                attributes: [],
              },
              {
                model: ICS,
                as: "ics",
                attributes: [],
              },
            ]
          },
          {
            model: Season,
            as: "season",
            attributes: [],
          }
        ],
        raw: true,
        offset,
        limit: batchSize,
      });

      if (farmers.length === 0) {
        break;
      }
      
      if (currentRow === maxRowsPerWorksheet) {
        worksheetIndex++;
        currentRow = 0;
      }

      for (const [index,item] of farmers.entries()) {

        let currentWorksheet = workbook.getWorksheet(`Farmer Report ${worksheetIndex}`);
        if (!currentWorksheet) {
          currentWorksheet = workbook.addWorksheet(`Farmer Report ${worksheetIndex}`);
          if (worksheetIndex == 1) {
            currentWorksheet.mergeCells('A1:O1');
            const mergedCell = currentWorksheet.getCell('A1');
            mergedCell.value = 'Cotton Connect | Farmer Report';
            mergedCell.font = { bold: true };
            mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
          }
         
          // Set bold font for header row
          const headerRow = currentWorksheet.addRow([
            'S.No', 'Farmer Name', 'Farmer Code','Country', 'State', 'District', 'Block', 'Village',
            'Seasons', 'Farm Group', 'Brand Name', 'Programme Name', 'Total Agriculture Area', 'Estimated Yield (Kg/Ac)',
            'Total estimated Production','Cotton Total Area', 'Total Estimated Cotton', 'Tracenet Id', 'ICS Name', 'Certification Status'
          ]);
          headerRow.font = { bold: true };
        }
        const rowValues = Object.values({
          index: (offset + index + 1),
          farmerName: item.farmerName ? item.farmerName : "",
          code: item.fatherCode ? item.fatherCode : '',
          country: item.country,
          state: item.state,
          district: item.district,
          block: item.block,
          village: item.village,
          seasons: item.seasons,
          farmGroup: item.farmGroup,
          brand: item.brand,
          program:item.program,
          agriTotalArea: item.agriTotalArea,
          agriEstimatedYield: item.agriEstimatedYield,
          agriEstimatedProd: item.agriEstimatedProd,
          totalEstimatedCotton: item.totalEstimatedCotton,
          cottonTotalArea: item.cottonTotalArea,
          tracenetId: item.tracenetId,
          iscName: item.icsName ? item.icsName : '',
          cert: item.cert ? item.cert : '',
        });

        currentWorksheet.addRow(rowValues).commit();
        currentRow++;
      }

      offset += batchSize;
    }

    // Save the workbook
    await workbook.commit()
      .then(() => {
        // Rename the temporary file to the final filename
        fs.renameSync("./upload/farmer-data-test.xlsx", './upload/farmer-data.xlsx');
        console.log('farmer-report report generation completed.');
      })
      .catch(error => {
        console.log('Failed generation.');
        throw error;
      });
  } catch (error: any) {
    console.error("Error exporting farmer data:", error);
  }
};

const generateOrganicFarmerReport = async () => {
  const maxRowsPerWorksheet = 500000; // Maximum number of rows per worksheet in Excel
  const batchSize = 100000;
  let offset = 0;
  let currentRow = 0;
  let worksheetIndex = 0;

  try {
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: fs.createWriteStream("./upload/farmer-organic-report-test.xlsx")
    });

    while (true) {
      const farmer = await sequelize.query(`
        SELECT
          "fr"."id",
          "fr"."firstName" AS "Farmer Name",
          "fr"."lastName" AS "Farmer Last Name",
          fr.tracenet_id AS "Tracenet ID",
          fr.agri_total_area AS "Total Agricultural Area",
          fr.agri_estimated_prod,
          fr.cotton_total_area AS "Total Cotton Area",
          fr.total_estimated_cotton AS "Total Estimated Cotton",
          br.brand_name AS "Brand Name",
          fg.name AS "Farm Group Name",
          cr.county_name AS "Country Name",
          st.state_name AS "State Name",
          dt.district_name AS "District Name",
          bt.block_name AS "Block Name",
          vt.village_name AS "Village Name",
          ic.ics_name AS "ICS Name",
          fr.cert_status AS cert_status
          FROM
              farmers fr
          LEFT JOIN
              programs pr ON fr.program_id = pr.id
          LEFT JOIN
              brands br ON fr.brand_id = br.id
          LEFT JOIN
              countries cr ON fr.country_id = cr.id
          LEFT JOIN
              states st ON fr.state_id = st.id
          LEFT JOIN
              districts dt ON fr.district_id = dt.id
          LEFT JOIN
              blocks bt ON fr.block_id = bt.id
          LEFT JOIN
              villages vt ON fr.village_id = vt.id
          LEFT JOIN  
              ics ic ON fr.ics_id = ic.id
          LEFT JOIN
              farm_groups fg ON "fr"."farmGroup_id" = fg.id
          WHERE "pr"."program_name" ILIKE '%Organic%'
          ORDER BY "fr"."id" ASC
          LIMIT :limit OFFSET :offset`, {
            replacements: { limit: batchSize, offset },
            type: sequelize.QueryTypes.SELECT,
      });

      if (farmer.length === 0) {
        break; // No more records to fetch, exit the loop
      }

      for (const [index,item] of farmer.entries()) {
        if (currentRow % maxRowsPerWorksheet === 0) {
          worksheetIndex++;
          currentRow = 0;
        }

        let currentWorksheet = workbook.getWorksheet(`Procurement Report ${worksheetIndex}`);
        if (!currentWorksheet) {
          currentWorksheet = workbook.addWorksheet(`Procurement Report ${worksheetIndex}`);
          if (worksheetIndex == 1) {
            currentWorksheet.mergeCells('A1:O1');
            const mergedCell = currentWorksheet.getCell('A1');
            mergedCell.value = 'Cotton Connect | Farmer Report';
            mergedCell.font = { bold: true };
            mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
          }
          // Set bold font for header row
          const headerRow = currentWorksheet.addRow([
            'S.No', 'Farmer Name', 'Farm Group', 'Tracenet Id', 'Village',
            'Block', 'District', 'State', 'Country', 'Brand Name', 'Total Area',
            'Cotton Area', 'Total Estimated Cotton', 'Total Estimated Production', 'ICS Name', 'ICS Status'
          ]);
          headerRow.font = { bold: true };
        }

        const rowValues = Object.values({
          index: (offset + index + 1),
          farmerName: item["Farmer Name"] + " " + (item["Farmer Last Name"] ? item["Farmer Last Name"] : ""),
          farmGroup: item["Farm Group Name"],
          tranid: item["Tracenet ID"],
          village: item["Village Name"],
          block: item["Block Name"],
          district: item["District Name"],
          state: item["State Name"],
          country: item["Country Name"],
          brand: item["Brand Name"],
          totalArea: item ? +item["Total Agricultural Area"] : 0,
          cottonArea: item ? +item["Total Cotton Area"] : 0,
          totalEstimatedCotton: item ? +item["Total Estimated Cotton"] : 0,
          totalEstimatedProduction: item ? +item.agri_estimated_prod : 0,
          icsName: item["ICS Name"] ? item["ICS Name"] : '',
          icsStatus: item.cert_status ? item.cert_status : '',
        });

        currentWorksheet.addRow(rowValues).commit();
        currentRow++;
      }

      offset += batchSize;
    }

    await workbook.commit()
      .then(() => {
        // Rename the temporary file to the final filename
        fs.renameSync("./upload/farmer-organic-report-test.xlsx", './upload/farmer-organic-report.xlsx');
        console.log('farmer-organic-report report generation completed.');
      })
      .catch(error => {
        console.log('Failed generation.');
        throw error;
      });
  } catch (error) {
    console.error('Error appending data:', error);
  }
}


const generateNonOrganicFarmerReport = async () => {
  // const excelFilePath = path.join('./upload', 'farmer-non-organic-report.xlsx');
  const maxRowsPerWorksheet = 500000; // Maximum number of rows per worksheet in Excel
  const batchSize = 100000;
  let offset = 0;
  let currentRow = 0;
  let worksheetIndex = 0;

  try {
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: fs.createWriteStream("./upload/farmer-non-organic-report-test.xlsx")
    });

    while (true) {
      const farmer = await sequelize.query(`
        SELECT
          "fr"."id",
          "fr"."firstName" AS "Farmer Name",
          "fr"."lastName" AS "Farmer Last Name",
          fr.agri_total_area AS "Total Agricultural Area",
          fr.cotton_total_area AS "Total Cotton Area",
          fr.agri_estimated_prod,
          fr.total_estimated_cotton AS "Total Estimated Cotton",
          pr.program_name AS "Program Name",
          br.brand_name AS "Brand Name",
          cr.county_name AS "Country Name",
          st.state_name AS "State Name",
          dt.district_name AS "District Name",
          bt.block_name AS "Block Name",
          vt.village_name AS "Village Name",
          fr.code AS code
          FROM
              farmers fr
          LEFT JOIN
              programs pr ON fr.program_id = pr.id
          LEFT JOIN
              brands br ON fr.brand_id = br.id
          LEFT JOIN
              countries cr ON fr.country_id = cr.id
          LEFT JOIN
              states st ON fr.state_id = st.id
          LEFT JOIN
              districts dt ON fr.district_id = dt.id
          LEFT JOIN
              blocks bt ON fr.block_id = bt.id
          LEFT JOIN
              villages vt ON fr.village_id = vt.id
          WHERE
              pr.program_name NOT LIKE '%Organic%'
          ORDER BY "fr"."id" ASC
          LIMIT :limit OFFSET :offset`, {
            replacements: { limit: batchSize, offset },
            type: sequelize.QueryTypes.SELECT,
      });

      if (farmer.length === 0) {
        break; // No more records to fetch, exit the loop
      }

      for (const item of farmer) {
        if (currentRow % maxRowsPerWorksheet === 0) {
          worksheetIndex++;
          currentRow = 0;
        }

        let currentWorksheet = workbook.getWorksheet(`Procurement Report ${worksheetIndex}`);
        if (!currentWorksheet) {
          currentWorksheet = workbook.addWorksheet(`Procurement Report ${worksheetIndex}`);
          if (worksheetIndex == 1) {
            currentWorksheet.mergeCells('A1:O1');
            const mergedCell = currentWorksheet.getCell('A1');
            mergedCell.value = 'Cotton Connect | Farmer Report';
            mergedCell.font = { bold: true };
            mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
          }
          // Set bold font for header row
          const headerRow = currentWorksheet.addRow([
            'S.No', 'Farmer Name', 'Farmer Code', 'Village',
            'Block', 'District', 'State', 'Country', 'Brand Name', 'Programme Name', 'Total Area',
            'Cotton Area', 'Total Estimated Cotton', 'Total Estimated Production'
          ]);
          headerRow.font = { bold: true };
        }

        const rowValues = Object.values({
          index: (offset + currentRow + 1),
          farmerName: item["Farmer Name"] + " " + (item["Farmer Last Name"] ? item["Farmer Last Name"] : ""),
          code: item.code ? item.code : '',
          village: item["Village Name"],
          block: item["Block Name"],
          district: item["District Name"],
          state: item["State Name"],
          country: item["Country Name"],
          brand: item["Brand Name"],
          program:item["Program Name"],
          totalArea: item ? +item["Total Agricultural Area"] : 0,
          cottonArea: item ? +item["Total Cotton Area"] : 0,
          totalEstimatedProduction: item ? +item.agri_estimated_prod : 0,
          totalEstimatedCotton: item ? +item["Total Estimated Cotton"] : 0,
        });

        currentWorksheet.addRow(rowValues).commit();
        currentRow++;
      }

      offset += batchSize;
    }
    
    await workbook.commit()
      .then(() => {
        // Rename the temporary file to the final filename
        fs.renameSync("./upload/farmer-non-organic-report-test.xlsx", './upload/farmer-non-organic-report.xlsx');
        console.log('farmer-non-organic report generation completed.');
      })
      .catch(error => {
        console.log('Failed generation?.');
        throw error;
      });
  } catch (error) {
    console.error('Error appending data:', error);
  }
};

const generateFaildReport = async (type: string) => {

  try {
    const maxRowsPerWorksheet = 500000; // Maximum number of rows per worksheet in Excel

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: fs.createWriteStream(`./upload/${type}-failed-records-test.xlsx`)
    });

    let worksheetIndex = 0;
    const batchSize = 5000;
    let offset = 0;

    const whereCondition = {
      type: type
    };

    let hasNextBatch = true;
    while (hasNextBatch) {
      const farmers = await FailedRecords.findAll({
        where: whereCondition,
        attributes: ['createdAt', 'type', 'farmer_code', 'farmer_name', 'reason'],
        include: [{
          model: Season,
          as: "season",
          attributes: ["id", "name"]
        }],
        // order: [
        //   ['id', "desc"]
        // ],
        offset: offset,
        limit: batchSize,
      });

      if (farmers.length === 0) {
        hasNextBatch = false;
        break;
      }

      if (offset % maxRowsPerWorksheet === 0) {
        worksheetIndex++;
      }

      let currentWorksheet = workbook.getWorksheet(`Sheet${worksheetIndex}`);
      if (!currentWorksheet) {
        currentWorksheet = workbook.addWorksheet(`Sheet${worksheetIndex}`);
        if (worksheetIndex == 1) {
          currentWorksheet.mergeCells('A1:G1');
          const mergedCell = currentWorksheet.getCell('A1');
          mergedCell.value = 'CottonConnect | Failed Records';
          mergedCell.font = { bold: true };
          mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        // Set bold font for header row
        const headerRow = currentWorksheet.addRow([
          "Sr No.", "Upload Date", "Upload Type", "Season", "Farmer Code", "Farmer Name", "Reason"
        ]);
        headerRow.font = { bold: true };
      }

      for await (const [index, rows] of farmers.entries()) {
        const rowValues = [
          offset + index + 1,
          rows.createdAt ? rows.createdAt.toISOString() : '',
          rows.type ? rows.type : '',
          rows.season ? rows.season.name : '',
          rows.farmer_code ? rows.farmer_code : '',
          rows.farmer_name ? rows.farmer_name : '',
          rows.reason ? rows.reason : '',
        ];

        currentWorksheet.addRow(rowValues).commit();
      }

      offset += batchSize;
    }

    // Save the workbook
    await workbook.commit()
      .then(() => {
        // Rename the temporary file to the final filename
        fs.renameSync(`./upload/${type}-failed-records-test.xlsx`, `./upload/${type}-failed-records.xlsx`);
        console.log(`${type} report generation completed.`);
      })
      .catch(error => {
        console.log('Failed generation?.');
        throw error;
      });
  } catch (error: any) {
    console.log(error);
  }
}

//----------------------------------------- Procurement Reports ------------------------//


const generateProcurementReport = async () => {
  try {
    const batchSize = 100000; // Number of transactions to fetch per batch
    const maxRowsPerWorksheet = 500000; // Maximum number of rows per worksheet in Excel

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: fs.createWriteStream("./upload/procurement-report-test.xlsx")
    });

    let worksheetIndex = 0;
    let offset = 0;
    // Function to write a batch of transactions to the worksheet
    const writeBatchToWorksheet = (transactions: any, worksheet: any) => {
      for (const [index, transaction] of transactions.entries()) {
        worksheet.addRow([
          index + offset + 1,
          transaction.date ? moment(transaction.date).format('DD/MM/YYYY') : '',
          transaction.firstName ? transaction.firstName + ' ' + `${transaction.lastName ? transaction.lastName : ""}` : transaction.firstName,
          transaction.farmer_code ? transaction.farmer_code : '',
          transaction.season_name ? transaction.season_name : '',
          transaction.brand_name ? transaction.brand_name : '',
          transaction.county_name ? transaction.county_name : '',
          transaction.state_name ? transaction.state_name : '',
          transaction.district_name ? transaction.district_name : '',
          transaction.block_name ? transaction.block_name : '',
          transaction.village_name ? transaction.village_name : '',
          transaction.id ? transaction.id : '',
          transaction.qty_purchased ? Number(transaction.qty_purchased) : 0,
          transaction.qty_stock ? Number(transaction.qty_stock) : 0,
          transaction.total_estimated_cotton ? (Number(transaction.total_estimated_cotton) > Number(transaction.cotton_transacted) ? Number(transaction.total_estimated_cotton) - Number(transaction.cotton_transacted) : 0) : 0,
          transaction.rate ? Number(transaction.rate) : 0,
          transaction.program_name ? transaction.program_name : '',
          transaction.vehicle ? transaction.vehicle : '',
          transaction.payment_method ? transaction.payment_method : '',
          transaction.ginner_name ? transaction.ginner_name : '',
          transaction.agent_name ? transaction.agent_name : "",
        ]).commit();
      }
      offset += batchSize
    };

    while (true) {
      // Fetch a batch of transactions
      const transactions = await sequelize.query(`
      SELECT
          tr.date,
          tr.farmer_code,
          tr.qty_purchased,
          tr.qty_stock,
          tr.rate,
          tr.id,
          tr.vehicle,
          tr.payment_method,
          vt.village_name,
          bt.block_name,
          dt.district_name,
          st.state_name,
          cr.county_name,
          "fr"."firstName",
          "fr"."lastName",
          pr.program_name,
          br.brand_name,
          gr.name AS ginner_name,
          "cg"."cropGrade" AS grade_name,
          s.name AS season_name,
          fm.total_estimated_cotton,
          fm.cotton_transacted,
          "ag"."firstName" AS agent_name
      FROM
          transactions tr
      LEFT JOIN programs pr ON tr.program_id = pr.id
      LEFT JOIN brands br ON tr.brand_id = br.id
      LEFT JOIN countries cr ON tr.country_id = cr.id
      LEFT JOIN states st ON tr.state_id = st.id
      LEFT JOIN districts dt ON tr.district_id = dt.id
      LEFT JOIN blocks bt ON tr.block_id = bt.id
      LEFT JOIN villages vt ON tr.village_id = vt.id
      LEFT JOIN farmers fr ON tr.farmer_id = fr.id
      LEFT JOIN ginners gr ON tr.mapped_ginner = gr.id
      LEFT JOIN crop_grades cg ON tr.grade_id = cg.id
      LEFT JOIN seasons s ON tr.season_id = s.id
      LEFT JOIN farms fm ON tr.farm_id = fm.id 
      LEFT JOIN users_apps ag ON tr.agent_id = ag.id
      WHERE
          tr.status = 'Sold'
      ORDER BY tr.id ASC
      LIMIT :limit OFFSET :offset`, {
      replacements: { limit: batchSize, offset },
      type: sequelize.QueryTypes.SELECT,
    });

      if (transactions.length === 0) {
        // No more transactions to fetch, exit the loop
        break;
      }

      if (offset % maxRowsPerWorksheet === 0) {
        worksheetIndex++;
      }

      // Get the current worksheet or create a new one if necessary
      let currentWorksheet = workbook.getWorksheet(`Procurement Report ${worksheetIndex}`);
      if (!currentWorksheet) {
        currentWorksheet = workbook.addWorksheet(`Procurement Report ${worksheetIndex}`);

        if (worksheetIndex == 1) {
          currentWorksheet.mergeCells('A1:T1');
          const mergedCell = currentWorksheet.getCell('A1');
          mergedCell.value = 'Cotton Connect | Procurement Report';
          mergedCell.font = { bold: true };
          mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        // Set bold font for header row

        currentWorksheet.addRow([
          "Sr No.",
          "Date",
          "Farmer Name",
          "Farmer Code",
          "Season",
          "Brand",
          "Country",
          "State",
          "District",
          "Block",
          "Village",
          "Transaction Id",
          "Quantity Purchased (Kgs)",
          "Available Cotton(Kgs)",
          "Quantity in stock(Kgs)",
          "Price/Kg (Local Currency)",
          "Programme",
          "Transport Vehicle No",
          "Payment Method",
          "Ginner Name",
          "Agent",
        ]);
      }

      // Write transactions to the current worksheet
      writeBatchToWorksheet(transactions, currentWorksheet);
    }

    await workbook.commit()
      .then(() => {
        // Rename the temporary file to the final filename
        fs.renameSync("./upload/procurement-report-test.xlsx", './upload/procurement-report.xlsx');
        console.log('Procurement report generation completed.');
      })
      .catch(error => {
        console.log('Failed generation?.');
        throw error;
      });

  } catch (error) {
    console.error("Error generating procurement report:", error);
  }
};


const generatePscpCottonProcurement = async () => {
  const batchSize = 5000; // Number of records to fetch per batch
  const maxRowsPerWorksheet = 500000; // Maximum number of rows per worksheet in Excel

  try {
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: fs.createWriteStream("./upload/pscp-cotton-procurement-test.xlsx")
    });
    let worksheetIndex = 0;
    let Count = 0;

    let offset = 0;

    while (true) {
      // Fetch a batch of records
      const farms = await Farm.findAll({
        attributes: [
          [sequelize.col("season.id"), "season_id"],
          [sequelize.col("season.name"), "season_name"],
          [
            sequelize.fn(
              "SUM",
              sequelize.col("total_estimated_cotton")
            ),
            "estimated_seed_cotton",
          ],
        ],
        include: [
          {
            model: Season,
            as: "season",
            attributes: [],
          }
        ],
        group: ["season.id"],
        offset: offset,
        limit: batchSize
      });

      if (farms.length === 0) {
        // No more records to fetch, exit the loop
        break;
      }

      if (Count === maxRowsPerWorksheet) {
        worksheetIndex++;
        Count = 0;
      }

      for (const farm of farms) {
        let obj: any = {};

        // Retrieve data for each farm/season
        const procurementRow = await Transaction.findOne({
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
          where: { season_id: farm.season_id },
        });

        const processGin = await GinProcess.findOne({
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
          where: { season_id: farm.season_id },
        });

        const ginBales = await GinBale.findOne({
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
            "$ginprocess.season_id$": farm.season_id,
          },
          group: ["ginprocess.season_id"],
        });

        const processSale = await GinSales.findOne({
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
          where: { season_id: farm.season_id },
        });

        // Populate obj with calculated values based on retrieved data
        obj.estimated_seed_cotton = (farm.dataValues.estimated_seed_cotton ?? 0) / 1000;
        obj.estimated_lint = ((farm.dataValues.estimated_seed_cotton ?? 0) * 35) / 100 / 1000;
        obj.procurement_seed_cotton = (procurementRow?.dataValues?.procurement_seed_cotton ?? 0) / 1000;
        obj.procurement = (farm.dataValues.estimated_seed_cotton > 0) ? Math.round((procurementRow?.dataValues?.procurement_seed_cotton / farm.dataValues.estimated_seed_cotton) * 100) : 0;
        obj.procured_lint_cotton = ((procurementRow?.dataValues?.procurement_seed_cotton ?? 0) * 35) / 100 / 1000;
        obj.no_of_bales = processGin?.dataValues?.no_of_bales ?? 0;
        obj.total_qty_lint_produced = (ginBales ? ginBales?.dataValues?.total_qty / 1000 : 0);
        obj.sold_bales = processSale?.dataValues?.no_of_bales ?? 0;
        obj.average_weight = (ginBales?.dataValues?.total_qty ?? 0) / (obj.no_of_bales ?? 0);
        obj.total_qty_sold_lint = (processSale?.dataValues?.total_qty ?? 0) / 1000;
        obj.balace_stock = (obj.no_of_bales > obj.sold_bales ? obj.no_of_bales - obj.sold_bales : 0);
        obj.balance_lint_quantity = (obj.total_qty_lint_produced > obj.total_qty_sold_lint ? obj.total_qty_lint_produced - obj.total_qty_sold_lint : 0);

        // Add the row to the worksheet
        const rowValues = [
          Count + 1,
          farm.dataValues.season_name || "",
          Number(formatDecimal(obj.estimated_seed_cotton)),
          Number(formatDecimal(obj.estimated_lint)),
          Number(formatDecimal(obj.procurement_seed_cotton)),
          Number(obj.procurement),
          Number(formatDecimal(obj.procured_lint_cotton)),
          Number(obj.no_of_bales),
          Number(formatDecimal(obj.total_qty_lint_produced)),
          Number(obj.sold_bales),
          Number(formatDecimal(obj.average_weight)),
          Number(formatDecimal(obj.total_qty_sold_lint)),
          Number(obj.balace_stock),
          Number(formatDecimal(obj.balance_lint_quantity))
        ];

        let currentWorksheet = workbook.getWorksheet(`Procurement Report ${worksheetIndex}`);
        if (!currentWorksheet) {
          currentWorksheet = workbook.addWorksheet(`Procurement Report ${worksheetIndex}`);
          if (worksheetIndex == 1) {
            currentWorksheet.mergeCells('A1:O1');
            const mergedCell = currentWorksheet.getCell('A1');
            mergedCell.value = 'Cotton Connect | PSCP Cotton Procurement Report';
            mergedCell.font = { bold: true };
            mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
          }
          const newHeaderRow = currentWorksheet.addRow([
            "Sr No.",
            "Season",
            "Estimated Seed Cotton (in MT)",
            "Estimated Lint (in MT)",
            "Procured Seed Cotton (in MT)",
            "Procurement %",
            "Procured Lint Cotton (in MT)",
            "No of Bales",
            "Total Quantity of Lint Produced (in MT)",
            "Sold Bales",
            "Average Bale Weight in Kgs",
            "Total Quantity of Lint Sold (in MT)",
            "Balance Stock of Bales",
            "Balance Lint Quantity Stock (in MT)",
          ]);
          newHeaderRow.font = { bold: true };
        }
        currentWorksheet.addRow(rowValues).commit();
        Count++;
      }

      offset += batchSize;
    }
    await workbook.commit()
      .then(() => {
        // Rename the temporary file to the final filename
        fs.renameSync("./upload/pscp-cotton-procurement-test.xlsx", './upload/pscp-cotton-procurement.xlsx');
        console.log('Procurement report generation completed.');
      })
      .catch(error => {
        console.log('Failed generation?.');
        throw error;
      });

  } catch (error) {
    console.error("Error generating PSCP cotton procurement report:", error);
  }
};

const generatePscpProcurementLiveTracker = async () => {
  // procurement_sell_live_tracker_load
  const maxRowsPerWorksheet = 500000; // Maximum number of rows per worksheet in Excel

  try {

    const currentDate = new Date();
      const previousYearDate = new Date(currentDate);
      previousYearDate.setFullYear(currentDate.getFullYear() - 1);
      const allSeasons = await Season.findAll({});

      let previousSeasonIndex = allSeasons.findIndex((season: any) => {
          const fromDate = new Date(season.from);
          const toDate = new Date(season.to);
          return previousYearDate >= fromDate && previousYearDate <= toDate;
      });
      if (previousSeasonIndex === -1) {
        previousSeasonIndex = allSeasons.length - 1; // Fallback to the last season
    }
    
    // Retrieve the current season
    const prevSeason = allSeasons[previousSeasonIndex];
    const prevSeasonId = prevSeason?.id;

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: fs.createWriteStream("./upload/pscp-procurement-sell-live-tracker-test.xlsx")
    });
    let worksheetIndex = 1;
    let Count = 0;

    let GinnerCount = await Ginner.count({
      include: [
        {
          model: State,
          as: "state",
          attributes: ["id", "state_name"],
        },
      ],
    })

    let loopCount = Math.ceil(GinnerCount / 5000);

    for (let i = 1; i <= loopCount; i++) {
      const offset = (i - 1) * 5000;

      const data = await sequelize.query(
        `
        WITH
          filtered_ginners AS (
            SELECT
              g.id,
              g.name,
              g.program_id,
              s.state_name,
              c.county_name,
              p.program_name
            FROM
              ginners g
              JOIN states s ON g.state_id = s.id
              JOIN countries c ON g.country_id = c.id
              JOIN programs p ON p.id = ANY(g.program_id)
          ),
          procurement_data AS (
            SELECT
              t.mapped_ginner,
              SUM(CAST(t.qty_purchased AS DOUBLE PRECISION)) AS procurement_seed_cotton,
              SUM(t.qty_stock) AS total_qty_lint_produced
            FROM
              transactions t
            JOIN filtered_ginners ON t.mapped_ginner = filtered_ginners.id
            WHERE
              t.program_id = ANY (filtered_ginners.program_id)
              AND t.mapped_ginner IS NOT NULL
            GROUP BY
              t.mapped_ginner
          ),
          gin_process_data AS (
            SELECT
              gp.ginner_id,
              SUM(gp.no_of_bales) AS no_of_bales
            FROM
              gin_processes gp
            JOIN filtered_ginners ON gp.ginner_id = filtered_ginners.id
            WHERE
              gp.program_id = ANY (filtered_ginners.program_id)
            GROUP BY
              gp.ginner_id
          ),
          gin_bale_data AS (
            SELECT
              gp.ginner_id,
              COALESCE(
                  SUM(
                    CASE
                      WHEN gb.old_weight IS NOT NULL THEN CAST(gb.old_weight AS DOUBLE PRECISION)
                      ELSE CAST(gb.weight AS DOUBLE PRECISION)
                    END
                  ), 0
              ) AS total_qty
            FROM
              "gin-bales" gb
            JOIN gin_processes gp ON gb.process_id = gp.id
            JOIN filtered_ginners ON gp.ginner_id = filtered_ginners.id
            WHERE
              gp.program_id = ANY (filtered_ginners.program_id)
            GROUP BY
              gp.ginner_id
          ),
          pending_seed_cotton_data AS (
            SELECT
              t.mapped_ginner,
              SUM(CAST(t.qty_purchased AS DOUBLE PRECISION)) AS pending_seed_cotton
            FROM
              transactions t
            JOIN filtered_ginners ON t.mapped_ginner = filtered_ginners.id
            WHERE
              t.program_id = ANY (filtered_ginners.program_id)
              AND t.status = 'Pending'
            GROUP BY
              t.mapped_ginner
          ),
        gin_sales_data AS (
                SELECT
                    gs.ginner_id,
                    COUNT(gb.id) AS no_of_bales,
                    COALESCE(
                      SUM(
                        CASE
                          WHEN gb.old_weight IS NOT NULL THEN CAST(gb.old_weight AS DOUBLE PRECISION)
                          ELSE CAST(gb.weight AS DOUBLE PRECISION)
                        END
                      ), 0
                    ) AS total_qty
                FROM
                    "gin-bales" gb
                LEFT JOIN 
                  bale_selections bs ON gb.id = bs.bale_id
                LEFT JOIN 
                    gin_sales gs ON gs.id = bs.sales_id
                JOIN filtered_ginners ON gs.ginner_id = filtered_ginners.id
                WHERE
                    gs.program_id = ANY (filtered_ginners.program_id)
                    AND gs.status in ('Pending', 'Pending for QR scanning', 'Partially Accepted', 'Partially Rejected','Sold')
                GROUP BY
                    gs.ginner_id
            ),
          gin_sales_pre_data AS (
            SELECT
              gs.ginner_id,
              SUM(gs.no_of_bales) AS no_of_pre_bales,
              SUM(gs.total_qty) AS pre_total_qty
            FROM
              gin_sales gs
            JOIN filtered_ginners ON gs.ginner_id = filtered_ginners.id
            WHERE
              gs.program_id = ANY (filtered_ginners.program_id)
              AND gs.season_id = ${prevSeasonId}
              AND gs.status = 'Sold'
            GROUP BY
              gs.ginner_id
          ),
          gin_sales_pending_data AS (
            SELECT
              gsp.ginner_id,
              SUM(gsp.no_of_bales) AS no_of_pending_bales,
              SUM(gsp.total_qty) AS pending_total_qty
            FROM
              gin_sales gsp
            JOIN filtered_ginners ON gsp.ginner_id = filtered_ginners.id
            WHERE
              gsp.program_id = ANY (filtered_ginners.program_id)
              AND (
                  gsp.status = 'Sold'
                  OR gsp.status = 'Partially Rejected'
                  OR gsp.status = 'Rejected'
              )
            GROUP BY
              gsp.ginner_id
          ),
          expected_cotton_data AS (
            SELECT
              gec.ginner_id,
              SUM(CAST(gec.expected_seed_cotton AS DOUBLE PRECISION)) AS expected_seed_cotton,
              SUM(CAST(gec.expected_lint AS DOUBLE PRECISION)) AS expected_lint
            FROM
              ginner_expected_cottons gec
            LEFT JOIN filtered_ginners ON gec.ginner_id = filtered_ginners.id
            WHERE
              gec.program_id = ANY (filtered_ginners.program_id)
            GROUP BY
              gec.ginner_id
          ),
          ginner_order_data AS (
            SELECT
              go.ginner_id,
              SUM(CAST(go.confirmed_lint_order AS DOUBLE PRECISION)) AS confirmed_lint_order
            FROM
              ginner_orders go
            JOIN filtered_ginners ON go.ginner_id = filtered_ginners.id
            WHERE
              go.program_id = ANY (filtered_ginners.program_id)
            GROUP BY
              go.ginner_id
          )
        SELECT
          fg.name AS ginner_name,
          fg.state_name,
          fg.county_name,
          fg.program_name,
          COALESCE(ec.expected_seed_cotton, 0) / 1000 AS expected_seed_cotton,
          COALESCE(ec.expected_lint, 0) AS expected_lint,
          COALESCE(pd.procurement_seed_cotton, 0) / 1000 AS procurement_seed_cotton,
          COALESCE(gb.total_qty, 0) AS procured_lint_cotton_kgs,
          COALESCE(gb.total_qty, 0) / 1000 AS procured_lint_cotton_mt,
          COALESCE(psc.pending_seed_cotton, 0) / 1000 AS pending_seed_cotton,
          CASE
            WHEN COALESCE(ec.expected_seed_cotton, 0) != 0
            AND COALESCE(pd.procurement_seed_cotton, 0) != 0 THEN ROUND(
              (
                COALESCE(pd.procurement_seed_cotton, 0) / COALESCE(ec.expected_seed_cotton, 0)
              ) * 100
            )
            ELSE 0
          END AS procurement,
          COALESCE(gp.no_of_bales, 0) AS no_of_bales,
          COALESCE(gsp.no_of_pending_bales, 0) AS no_of_pending_bales,
          COALESCE(gsp.pending_total_qty, 0) AS pending_total_qty,
          COALESCE(gspp.no_of_pre_bales, 0) AS no_of_pre_bales,
          COALESCE(gspp.pre_total_qty, 0) AS pre_total_qty,
          COALESCE(gb.total_qty, 0) / 1000 AS total_qty_lint_produced,
          COALESCE(gs.no_of_bales, 0) AS sold_bales,
          CASE
            WHEN COALESCE(gp.no_of_bales, 0) != 0 THEN COALESCE(gb.total_qty, 0) / COALESCE(gp.no_of_bales, 0)
            ELSE 0
          END AS average_weight,
          COALESCE(gs.total_qty, 0) / 1000 AS total_qty_sold_lint,
          COALESCE(go.confirmed_lint_order, 0) AS order_in_hand,
          CAST(COALESCE(gp.no_of_bales, 0) - COALESCE(gs.no_of_bales, 0) AS INTEGER) AS balace_stock,
          COALESCE(gb.total_qty, 0) / 1000 - COALESCE(gs.total_qty, 0) / 1000 AS balance_lint_quantity,
          CASE
            WHEN COALESCE(gb.total_qty, 0) != 0 THEN
              CASE
                WHEN COALESCE(gs.total_qty, 0) > COALESCE(gb.total_qty, 0) THEN 0
                ELSE ROUND(
                  (
                    (
                      COALESCE(gs.total_qty, 0)
                    ) / COALESCE(gb.total_qty, 0)
                  ) * 100
                )
              END
            ELSE 0
          END AS ginner_sale_percentage
        FROM
          filtered_ginners fg
          LEFT JOIN procurement_data pd ON fg.id = pd.mapped_ginner
          LEFT JOIN gin_process_data gp ON fg.id = gp.ginner_id
          LEFT JOIN gin_bale_data gb ON fg.id = gb.ginner_id
          LEFT JOIN pending_seed_cotton_data psc ON fg.id = psc.mapped_ginner
          LEFT JOIN gin_sales_data gs ON fg.id = gs.ginner_id
          LEFT JOIN gin_sales_pending_data gsp ON fg.id = gsp.ginner_id
          LEFT JOIN gin_sales_pre_data gspp ON fg.id = gspp.ginner_id
          LEFT JOIN expected_cotton_data ec ON fg.id = ec.ginner_id
          LEFT JOIN ginner_order_data go ON fg.id = go.ginner_id
        ORDER BY
          fg.id ASC
        LIMIT :limit OFFSET :offset
        `,
        {
          replacements: {
            limit: 5000,
            offset: Number(offset)
          },
          type: sequelize.QueryTypes.SELECT
        }
      );

      if (data.length === 0) {
        // No more records to fetch, exit the loop
        break;
      }

      if (Count === maxRowsPerWorksheet) {
        worksheetIndex++;
        Count = 0;
      }

      let index = 0;
      for await (const obj of data) {
        const rowValues = Object.values({
          index: index + 1,
          name: obj.ginner_name ? obj?.ginner_name : "",
          country: obj.county_name ? obj?.county_name : "",
          state: obj.state_name ? obj?.state_name : "",
          program: obj.program_name ? obj?.program_name : "",
          expected_seed_cotton: Number(obj.expected_seed_cotton) ?? 0,
          expected_lint: Number(obj.expected_lint) ?? 0,
          procurement_seed_cotton: Number(formatDecimal(obj.procurement_seed_cotton)) ?? 0,
          procurement: obj.procurement < 0 ? 0 : Number(obj.procurement),
          pending_seed_cotton: obj.pending_seed_cotton
            ? Number(formatDecimal(obj.pending_seed_cotton))
            : 0,
          procured_lint_cotton_mt: Number(formatDecimal(obj.procured_lint_cotton_mt)),
          no_of_bales: Number(obj.no_of_bales),
          sold_bales: obj.sold_bales ? Number(obj.sold_bales) : 0,
          total_qty_sold_lint: obj.total_qty_sold_lint
            ? Number(formatDecimal(obj.total_qty_sold_lint))
            : 0,
          order_in_hand: obj.order_in_hand ? Number(formatDecimal(obj.order_in_hand)) : 0,
          balace_stock: Number(obj.balace_stock) ?? 0,
          balance_lint_quantity: Number(formatDecimal(obj.balance_lint_quantity)) ?? 0,
          ginner_sale_percentage: Number(obj.ginner_sale_percentage) ?? 0,
          no_of_pending_bales: obj.no_of_pending_bales ? Number(obj.no_of_pending_bales) : 0,
          pending_total_qty: obj.pending_total_qty ? Number(obj.pending_total_qty) : 0,
          no_of_pre_bales: obj.no_of_pre_bales ? Number(obj.no_of_pre_bales) : 0,
          pre_total_qty: obj.pre_total_qty ? Number(obj.pre_total_qty) : 0,
        });
        index++;

        let currentWorksheet = workbook.getWorksheet(`Sheet${worksheetIndex}`);
        if (!currentWorksheet) {
          currentWorksheet = workbook.addWorksheet(`Sheet${worksheetIndex}`);
          if (worksheetIndex == 1) {
            currentWorksheet.mergeCells("A1:S1");
            const mergedCell = currentWorksheet.getCell("A1");
            mergedCell.value = "CottonConnect | PSCP Procurement and Sell Live Tracker";
            mergedCell.font = { bold: true };
            mergedCell.alignment = { horizontal: "center", vertical: "middle" };
          }
          // Set bold font for header row
          const headerRow = currentWorksheet.addRow([
            "Sr No.",
           "Ginning Mill",
           "Country",
           "State",
           "Programme",
          "Allocated Seed Cotton (MT)",
          "Allocated Lint Cotton (MT)",
          "Procured Seed Cotton (MT)",
          "Seed cotton Procurement %",
          "Seed Cotton Pending to accept at Ginner (MT)",
          "Produced Lint Cotton (MT)",
          "No. of Bales produced",
          "No. of Bales Sold",
          "Lint Sold (MT)",
          "Ginner Order in Hand (MT)",
          "Balance stock at Ginner (Bales )",
          "Balance lint cotton stock at Ginner (MT)",
          "Ginner Sale %",
            "Ginner Pending Sales (Bales)",
            "Ginner Pending Sales (Weight)",
            "No. of Bales Sold(Previous season)",
            "Lint Sold (Previous season)",
          ]);
          headerRow.font = { bold: true };
        }
        currentWorksheet.addRow(rowValues).commit();
      }
    }

    await workbook.commit()
      .then(() => {
        // Rename the temporary file to the final filename
        fs.renameSync("./upload/pscp-procurement-sell-live-tracker-test.xlsx", './upload/pscp-procurement-sell-live-tracker.xlsx');
        console.log('Procurement report generation completed.');
      })
      .catch(error => {
        console.log('Failed generation?.');
        throw error;
      });

  } catch (error: any) {
    console.error("Error appending data:", error);
  }
};

const generateAgentTransactions = async () => {
  const maxRowsPerWorksheet = 500000; // Maximum number of rows per worksheet in Excel
  const batchSize = 100000; // Number of records to fetch per batch

  try {
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: fs.createWriteStream("./upload/agent-transactions-test.xlsx")
    });
    let worksheetIndex = 0;
    let offset = 0;

    do {
      const transactions = await sequelize.query(`
        SELECT
            tr.date,
            tr.farmer_code,
            tr.qty_purchased,
            tr.rate,
            tr.id,
            tr.vehicle,
            tr.payment_method,
            vt.village_name,
            bt.block_name,
            dt.district_name,
            st.state_name,
            cr.county_name,
            "fr"."firstName",
            "fr"."lastName",
            pr.program_name,
            br.brand_name,
            gr.name AS ginner_name,
            "cg"."cropGrade" AS grade_name,
            s.name AS season_name,
            fm.total_estimated_cotton,
            fm.cotton_transacted,
            "ag"."firstName" AS agent_name
        FROM
            transactions tr
        LEFT JOIN programs pr ON tr.program_id = pr.id
        LEFT JOIN brands br ON tr.brand_id = br.id
        LEFT JOIN countries cr ON tr.country_id = cr.id
        LEFT JOIN states st ON tr.state_id = st.id
        LEFT JOIN districts dt ON tr.district_id = dt.id
        LEFT JOIN blocks bt ON tr.block_id = bt.id
        LEFT JOIN villages vt ON tr.village_id = vt.id
        LEFT JOIN farmers fr ON tr.farmer_id = fr.id
        LEFT JOIN ginners gr ON tr.mapped_ginner = gr.id
        LEFT JOIN crop_grades cg ON tr.grade_id = cg.id
        LEFT JOIN seasons s ON tr.season_id = s.id
        LEFT JOIN farms fm ON tr.farm_id = fm.id 
        LEFT JOIN users_apps ag ON tr.agent_id = ag.id
        WHERE
          tr.agent_id IS NOT NULL
          AND tr.agent_id <> 0
        ORDER BY tr.id ASC
        LIMIT :limit OFFSET :offset`, {
        replacements: { limit: batchSize, offset },
        type: sequelize.QueryTypes.SELECT,
      });

      if (transactions.length === 0) {
        // No more records to fetch, exit the loop
        break;
      }

      if (offset % maxRowsPerWorksheet === 0) {
        worksheetIndex++;
      }

      let currentWorksheet = workbook.getWorksheet(`Sheet${worksheetIndex}`);
      if (!currentWorksheet) {
        currentWorksheet = workbook.addWorksheet(`Sheet${worksheetIndex}`);
        if (worksheetIndex == 1) {
          currentWorksheet.mergeCells('A1:S1');
          const mergedCell = currentWorksheet.getCell('A1');
          mergedCell.value = 'CottonConnect | QR App Procurement Report';
          mergedCell.font = { bold: true };
          mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        // Set bold font for header row
        const headerRow = currentWorksheet.addRow([
          "Sr No.", 'Date', 'Farmer Code', 'Farmer Name', 'Season', 'Country',
          'State', 'District', 'Block', 'Village', 'Transaction Id', 'Quantity Purchased (Kgs)',
          'Available Cotton (Kgs)', 'Price/KG(Local Currency)', 'Programme', 'Transport Vehicle No', 'Payment Method', 'Ginner Name', 'Agent'
        ]);
        headerRow.font = { bold: true };
      }

      // Append data to worksheet
      for await (const [index, item] of transactions.entries()){
        const rowValues = Object.values({
          index: index + offset + 1,
          date: moment(item.date).format('DD/MM/YYYY'),
          farmerCode: item.farmer_code ? item.farmer_code : "",
          farmerName: item.firstName ? item.firstName + ' ' + `${item.lastName ? item.lastName : ""}` : item.firstName,
          season: item.season_name ? item.season_name : "",
          country: item.county_name ? item.county_name : "",
          state: item.state_name ? item.state_name : "",
          district: item.district_name ? item.district_name : "",
          block: item.block_name ? item.block_name : "",
          village: item.village_name ? item.village_name : "",
          transactionId: item.id,
          qty_purchased: Number(item.qty_purchased) ?? 0,
          available_cotton: item.total_estimated_cotton ? (Number(item.total_estimated_cotton) > Number(item.cotton_transacted) ? Number(item.total_estimated_cotton) - Number(item.cotton_transacted) : 0) : 0,
          rate: Number(item.rate) ?? 0,
          program: item.program_name ? item.program_name : "",
          vehicle: item.vehicle ? item.vehicle : "",
          payment_method: item.payment_method ? item.payment_method : "",
          ginner: item.ginner_name ? item.ginner_name : "",
          agent: item.agent_name ? item.agent_name : "",
        });
        currentWorksheet.addRow(rowValues).commit();
      }
      offset += batchSize;
    } while (true);
    // Save the workbook
    await workbook.commit()
      .then(() => {
        // Rename the temporary file to the final filename
        fs.renameSync("./upload/agent-transactions-test.xlsx", './upload/agent-transactions.xlsx');
        console.log('Procurement report generation completed.');
      })
      .catch(error => {
        console.log('Failed generation?.');
        throw error;
      });
    console.log('report generation completed.');

  } catch (error: any) {
    console.error("Error appending data:", error);
  }
};

//----------------------------------------- Ginner Processing Reports ------------------------//

const generateGinnerSummary = async () => {
  // const excelFilePath = path.join("./upload", "ginner-summary.xlsx");

  const maxRowsPerWorksheet = 500000; // Maximum number of rows per worksheet in Excel
  const transactionWhere: any = {};
  const ginBaleWhere: any = {};
  const baleSelectionWhere: any = {};

  try {
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: fs.createWriteStream("./upload/ginner-summary-test.xlsx")
    });

    const batchSize = 5000;
    let worksheetIndex = 0;
    let offset = 0;
    let hasNextBatch = true;

    while (hasNextBatch) {
      let rows = await Ginner.findAll({
        attributes: ["id", "name", "address"],
        offset: offset,
        limit: batchSize,
      });

      if (rows.length === 0) {
        hasNextBatch = false;
        break;
      }

      if (offset % maxRowsPerWorksheet === 0) {
        worksheetIndex++;
      }

      let currentWorksheet = workbook.getWorksheet(`Sheet${worksheetIndex}`);
      if (!currentWorksheet) {
        currentWorksheet = workbook.addWorksheet(`Sheet${worksheetIndex}`);
        if (worksheetIndex == 1) {
          currentWorksheet.mergeCells('A1:M1');
          const mergedCell = currentWorksheet.getCell('A1');
          mergedCell.value = 'CottonConnect | Ginner Summary Report';
          mergedCell.font = { bold: true };
          mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
          // Set bold font for header row

        }
        // Set bold font for header row
        const headerRow = currentWorksheet.addRow([
          "S. No.", "Ginner Name", "Total seed cotton procured (MT)", "Total seed cotton processed (MT)",
          "Total seed cotton in stock (MT)", "Total lint produce (MT)", "Total lint sold (MT)", "Grey-Out Lint Quantity (MT)", "Actual lint in stock (MT)", "Total lint in stock (MT)",
          "Total bales produce", "Total bales sold", "Total bales in stock"
        ]);
        headerRow.font = { bold: true };
      }

      // Append data to worksheet
      for await (const [index, item] of rows.entries()) {
        let obj: any = {};


        let [cottonProcured, cottonProcessed,cottonProcessedByHeap,lintProcured, greyoutLint, lintSold]: any = await Promise.all([
          // Transaction.findOne({
          //   attributes: [
          //     [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")), 0), 'qty']
          //   ],
          //   where: {
          //     ...transactionWhere,
          //     mapped_ginner: item.id
          //   }
          // }),
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
          heapSelection.findOne({
            attributes: [
              [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal("CAST(qty_used AS DOUBLE PRECISION)")), 0), 'qty']
            ],
            include: [
              {
                model: GinProcess,
                as: 'ginprocess',
                attributes: [],
              }
            ],
            where: {
              '$ginprocess.ginner_id$': item.id
            },
            group: ["ginprocess.ginner_id"]
          }),
          CottonSelection.findOne({
            attributes: [
              [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal("CAST(qty_used AS DOUBLE PRECISION)")), 0), 'qty']
            ],
            include: [
              {
                model: GinProcess,
                as: 'ginprocess',
                attributes: []
              }
            ],
            where: {
              '$ginprocess.ginner_id$': item.id
            },
            group: ["ginprocess.ginner_id"]
          }),
          GinBale.findOne({
            attributes: [
              [
                sequelize.fn(
                  "COALESCE",
                  sequelize.fn(
                    "SUM",
                    sequelize.literal(`
                      CASE
                        WHEN "gin-bales"."old_weight" IS NOT NULL THEN CAST("gin-bales"."old_weight" AS DOUBLE PRECISION)
                        ELSE CAST("gin-bales"."weight" AS DOUBLE PRECISION)
                      END
                    `)
                  ),
                  0
                ),
                "qty",
              ],
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
          GinBale.findOne({
            attributes: [
              [
                sequelize.fn(
                  "COALESCE",
                  sequelize.fn(
                    "SUM",
                    sequelize.literal(`
                      CASE
                        WHEN "gin-bales"."old_weight" IS NOT NULL THEN CAST("gin-bales"."old_weight" AS DOUBLE PRECISION)
                        ELSE CAST("gin-bales"."weight" AS DOUBLE PRECISION)
                      END
                    `)
                  ),
                  0
                ),
                "qty",
              ],
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
              '$ginprocess.ginner_id$': item.id,
              '$ginprocess.greyout_status$': true,
              sold_status: false, 
              is_all_rejected: null, 
            },
            group: ["ginprocess.ginner_id"]
          }),
          BaleSelection.findOne({
            attributes: [
              [
                sequelize.fn(
                  "COALESCE",
                  sequelize.fn(
                    "SUM",
                    sequelize.literal(`
                      CASE
                        WHEN "bale"."old_weight" IS NOT NULL THEN CAST("bale"."old_weight" AS DOUBLE PRECISION)
                        ELSE CAST("bale"."weight" AS DOUBLE PRECISION)
                      END
                    `)
                  ),
                  0
                ),
                "qty",
              ],
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
              '$sales.ginner_id$': item.id,
              "$sales.status$" : { [Op.in]: ['Pending', 'Pending for QR scanning', 'Partially Accepted', 'Partially Rejected','Sold'] }
            },
            group: ["sales.ginner_id"]
          }),
        ])

        const cottonProcessedQty = isNaN(cottonProcessed?.dataValues?.qty) ? 0 : cottonProcessed?.dataValues?.qty;
        const cottonProcessedByHeapQty = isNaN(cottonProcessedByHeap?.dataValues?.qty) ? 0 : cottonProcessedByHeap?.dataValues?.qty;
        const totalCottonProcessedQty = cottonProcessedQty + cottonProcessedByHeapQty;

        obj.cottonProcuredKg = cottonProcured?.dataValues?.qty ?? 0;
        obj.cottonProcessedKg = totalCottonProcessedQty ?? 0;
        obj.cottonStockKg = cottonProcured ? cottonProcured?.dataValues?.qty - (cottonProcessed ? totalCottonProcessedQty : 0) : 0;
        obj.cottonProcuredMt = convert_kg_to_mt(cottonProcured?.dataValues.qty ?? 0);
        obj.cottonProcessedeMt = convert_kg_to_mt(totalCottonProcessedQty);
        obj.cottonStockMt = convert_kg_to_mt( cottonProcured ? cottonProcured?.dataValues?.qty - totalCottonProcessedQty : 0 );
        obj.lintProcuredKg = lintProcured?.dataValues.qty ?? 0;
        obj.lintProcuredMt = convert_kg_to_mt(lintProcured?.dataValues.qty ?? 0);
        obj.lintSoldKg = lintSold?.dataValues.qty ?? 0;
        obj.lintSoldMt = convert_kg_to_mt(lintSold?.dataValues.qty ?? 0);
        obj.lintGreyoutKg =  greyoutLint?.dataValues.qty ?? 0;
        obj.lintGreyoutMT = convert_kg_to_mt(greyoutLint?.dataValues.qty ?? 0);
        obj.lintActualStockMT = Number(obj.lintProcuredKg) >  (Number(obj.lintSoldKg) + Number(obj.lintGreyoutKg))
        ? Number(obj.lintProcuredKg) - (Number(obj.lintSoldKg) + Number(obj.lintGreyoutKg))
        : 0;
        obj.lintActualStockMT = Number(obj.lintProcuredKg) >  (Number(obj.lintSoldKg) + Number(obj.lintGreyoutKg))
        ? Number(obj.lintProcuredMt) - (Number(obj.lintSoldMt) + Number(obj.lintGreyoutMT))
        : 0;
        obj.lintStockKg = Number(obj.lintProcuredKg) > Number(obj.lintSoldKg) ? Number(obj.lintProcuredKg) - Number(obj.lintSoldKg) : 0;
        obj.lintStockMt = Number(obj.lintProcuredKg) > Number(obj.lintSoldKg) ? Number(obj.lintProcuredMt) - Number(obj.lintSoldMt) : 0;
        obj.balesProduced = lintProcured?.dataValues?.bales_procured ? Number(lintProcured?.dataValues?.bales_procured) : 0;
        obj.balesSold = lintSold?.dataValues?.bales_sold ? Number(lintSold?.dataValues?.bales_sold) : 0;
        obj.balesStock = obj.balesProduced > obj.balesSold ? obj.balesProduced - obj.balesSold : 0;

        const rowValues = Object.values({
          index: index + offset + 1,
          name: item.name ? item.name : '',
          cottonProcuredMt: Number(obj.cottonProcuredMt) ?? 0 ,
          cottonProcessedeMt: Number(obj.cottonProcessedeMt) ?? 0,
          cottonStockMt: Number(obj.cottonStockMt) ?? 0,
          lintProcuredMt: Number(obj.lintProcuredMt) ?? 0,
          lintSoldMt: Number(obj.lintSoldMt) ?? 0,
          lintGreyoutMT: obj.lintGreyoutMT ? Number(obj.lintGreyoutMT) : 0,
          lintActualStockMT: obj.lintActualStockMT ? Number(obj.lintActualStockMT) : 0,
          lintStockMt:  Number(obj.lintStockMt) ?? 0,
          balesProduced:  Number(obj.balesProduced) ?? 0,
          balesSold:  Number(obj.balesSold) ?? 0,
          balesStock: Number(obj.balesStock) ?? 0
        });
        currentWorksheet.addRow(rowValues).commit();
      }
      // Auto-adjust column widths based on content
      offset += batchSize;

    }
    // Save the workbook
    await workbook.commit()
      .then(() => {
        // Rename the temporary file to the final filename
        fs.renameSync("./upload/ginner-summary-test.xlsx", './upload/ginner-summary.xlsx');
        console.log('ginner-summary report generation completed.');
      })
      .catch(error => {
        console.log('Failed generation?.');
        throw error;
      });

  } catch (error: any) {
    console.error("Error appending data:", error);
  }

};

const generateGinnerProcess = async () => {
  // const excelFilePath = path.join("./upload", "gin-bale-process.xlsx");
  const maxRowsPerWorksheet = 500000; // Maximum number of rows per worksheet in Excel

  try {
    // Create the excel workbook file
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: fs.createWriteStream("./upload/gin-bale-process-test.xlsx")
    });

    const batchSize = 5000;
    let worksheetIndex = 0;
    let offset = 0;
    let hasNextBatch = true;  

    while (hasNextBatch) {
      const ginProcess = await sequelize.query(
        `WITH gin_process_data AS (
          SELECT
              gp.id AS process_id,
              gp.date,
              gp."createdAt" AS created_date,
              s.name AS season_name,
              g.name AS ginner_name,
              gp.heap_number,
              gp.lot_no,
              gp.press_no,
              gp.reel_lot_no,
              gp.no_of_bales,
              gp.total_qty AS seed_consumed,
              gp.gin_out_turn AS got,
              gp.bale_process,
              gp.greyout_status,
              pr.program_name AS program
          FROM
              gin_processes gp
          LEFT JOIN
              ginners g ON gp.ginner_id = g.id
          LEFT JOIN
              seasons s ON gp.season_id = s.id
          LEFT JOIN
              programs pr ON gp.program_id = pr.id
            ),
          gin_bale_data AS (
                SELECT
                    gb.process_id,
                    COALESCE(
                  SUM(
                    CASE
                      WHEN gb.old_weight IS NOT NULL THEN CAST(gb.old_weight AS DOUBLE PRECISION)
                      ELSE CAST(gb.weight AS DOUBLE PRECISION)
                    END
                  ), 0
              ) AS lint_quantity,
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
                ARRAY_AGG(DISTINCT t.village_id) AS villages
            FROM
                cotton_selections cs
            LEFT JOIN
                transactions t ON cs.transaction_id = t.id
            GROUP BY
                cs.process_id
          ),
          heap_selection_data AS (
            SELECT
                hs.process_id,
                ARRAY_AGG(DISTINCT hs.village_id) AS villages
            FROM
                heap_selections hs
            GROUP BY
                hs.process_id
          ),
          combined_village_data AS (
            SELECT
                process_id,
                ARRAY_AGG(DISTINCT village_id) AS village_ids
            FROM (
                SELECT
                    cs.process_id,
                    UNNEST(cs.villages) AS village_id
                FROM cotton_selection_data cs
                UNION ALL
                SELECT
                    hs.process_id,
                    UNNEST(hs.villages) AS village_id
                FROM heap_selection_data hs
            ) combined
            GROUP BY
                process_id
          ),
          village_names_data AS (
            SELECT
                cv.process_id,
                ARRAY_AGG(DISTINCT v.village_name) AS village_names
            FROM
                combined_village_data cv
            LEFT JOIN
                villages v ON v.id = ANY(cv.village_ids)
            GROUP BY
                cv.process_id
          ),
            sold_data AS (
                SELECT
                    gb.process_id,
                    COUNT(gb.id) AS sold_bales,
                    COALESCE(
                  SUM(
                    CASE
                      WHEN gb.old_weight IS NOT NULL THEN CAST(gb.old_weight AS DOUBLE PRECISION)
                      ELSE CAST(gb.weight AS DOUBLE PRECISION)
                    END
                  ), 0
              ) AS lint_quantity_sold
                FROM
                    "gin-bales" gb
                LEFT JOIN 
                  bale_selections bs ON gb.id = bs.bale_id
                LEFT JOIN 
                    gin_sales gs ON gs.id = bs.sales_id
                WHERE
                    gs.status in ('Pending', 'Pending for QR scanning', 'Partially Accepted', 'Partially Rejected','Sold')
                GROUP BY
                    gb.process_id
            )
            SELECT
                gd.date AS date,
                gd.created_date AS "createdAt",
                gd.season_name AS season,
                gd.ginner_name AS ginner_name,
                gd.heap_number AS heap_number,
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
                gd.greyout_status,
               vnd.village_names AS village_names
                gd.season_name AS seed_consumed_seasons
            FROM
                gin_process_data gd
            LEFT JOIN
                gin_bale_data gb ON gd.process_id = gb.process_id
            LEFT JOIN
              village_names_data vnd ON gd.process_id = vnd.process_id 
            LEFT JOIN
              sold_data sd ON gd.process_id = sd.process_id
            LIMIT :limit OFFSET :offset
            `, {
            replacements: { limit: batchSize, offset },
            type: sequelize.QueryTypes.SELECT,
          });

      if (ginProcess.length === 0) {
        hasNextBatch = false;
        break;
      }

      if (offset % maxRowsPerWorksheet === 0) {
        worksheetIndex++;
      }

      let currentWorksheet = workbook.getWorksheet(`Sheet${worksheetIndex}`);
      if (!currentWorksheet) {
        currentWorksheet = workbook.addWorksheet(`Sheet${worksheetIndex}`);
        if (worksheetIndex == 1) {
          currentWorksheet.mergeCells('A1:V1');
          const mergedCell = currentWorksheet.getCell('A1');
          mergedCell.value = 'CottonConnect | Ginner Bale Process Report';
          mergedCell.font = { bold: true };
          mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };

        }
        // Set bold font for header row
        // Set bold font for header row
        const headerRow = currentWorksheet.addRow([
          "Sr No.", "Process Date", "Data Entry Date", "Seed Cotton Consumed Season" ,"Lint process Season choosen", "Ginner Name", "Heap Number", "Gin Lot No", "Gin Press No", "REEL Lot No", "REEL Process Nos", "No of Bales", "Lint Quantity(Kgs)", "Total Seed Cotton Consumed(Kgs)", "GOT", "Total lint cotton sold(Kgs)", "Total Bales Sold", "Total lint cotton in stock(Kgs)", "Total Bales in stock", "Programme", "Village", "Grey Out Status"
        ]);
        headerRow.font = { bold: true };
      }

      // Append data to worksheet
      for await (const [index, item] of ginProcess.entries()) {
        const rowValues = Object.values({
          index: index + offset + 1,
          date: item.date ? item.date : "",
          created_date: item.createdAt ? item.createdAt : "",
          seed_consumed_seasons: item.seed_consumed_seasons ? item.seed_consumed_seasons : "",
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
          greyout_status: item.greyout_status ? "Yes" : "No",
        });

        currentWorksheet.addRow(rowValues).commit();
      }
      offset += batchSize;
    }
    // Save the workbook
    await workbook.commit()
      .then(() => {
        // Rename the temporary file to the final filename
        fs.renameSync("./upload/gin-bale-process-test.xlsx", './upload/gin-bale-process.xlsx');
        console.log('gin-bale-process report generation completed.');
      })
      .catch(error => {
        console.log('Failed generation?.');
        throw error;
      });

  } catch (error: any) {
    console.error("Error appending data:", error);
  }
};


const generateGinnerSales = async () => {
  const maxRowsPerWorksheet = 100000; // Maximum number of rows per worksheet in Excel

  const whereCondition: any = {};
  try {

    whereCondition['$sales.status$'] = { [Op.ne]: 'To be Submitted' };
    // Create the excel workbook file
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: fs.createWriteStream("./upload/Ginner-sales-report-test.xlsx")
    });

    const batchSize = 5000;
    let worksheetIndex = 0;
    let offset = 0;
    let hasNextBatch = true;

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

    while (hasNextBatch) {
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
          [Sequelize.literal('"sales"."invoice_no"'), "invoice_no"],
          [Sequelize.col('"sales"."lot_no"'), "lot_no"],
          [Sequelize.fn('STRING_AGG', Sequelize.literal('DISTINCT "bale->ginprocess"."reel_lot_no"'), ',' ) , "reel_lot_no"],
          [Sequelize.fn('STRING_AGG', Sequelize.literal('DISTINCT "bale->ginprocess->season"."name"'), ', '), "lint_process_seasons"],
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
            include: [{
              model: Season,
              as: "season",
              attributes: [],
            }],
            attributes: []
          }]
        }],
        group: ['sales.id', "sales.season.id", "sales.ginner.id", "sales.buyerdata.id", "sales.program.id"],
        order: [
          ['sales_id', "desc"]
        ],
        offset: offset,
        limit: batchSize,
      })

      if (rows.length === 0) {
        hasNextBatch = false;
        break;
      }

      if (offset % maxRowsPerWorksheet === 0) {
        worksheetIndex++;
      }

      let currentWorksheet = workbook.getWorksheet(`Sheet${worksheetIndex}`);
      if (!currentWorksheet) {
        currentWorksheet = workbook.addWorksheet(`Sheet${worksheetIndex}`);
        if (worksheetIndex == 1) {
          currentWorksheet.mergeCells('A1:V1');
          const mergedCell = currentWorksheet.getCell('A1');
          mergedCell.value = 'CottonConnect | Ginner Sales Report';
          mergedCell.font = { bold: true };
          mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
          // Set bold font for header row
        }
        // Set bold font for header row
        const headerRow = currentWorksheet.addRow([
          "Sr No.", "Process Date", "Data Entry Date", "Seed Cotton Consumed Season", "Lint Process Season", "Lint sale chosen season", "Ginner Name",
          "Invoice No", "Sold To", "Heap Number", "Bale Lot No", "REEL Lot No", "No of Bales", "Press/Bale No", "Rate/Kg",
          "Total Quantity", "Sales Value", "Vehicle No", "Transporter Name", "Programme", "Agent Detials", "Status"
        ]);
        headerRow.font = { bold: true };
      }

      // Append data to worksheet
      for await (const [index, item] of rows.entries()) {
        const [seedSeason] =  await sequelize.query(`
          SELECT 
              STRING_AGG(DISTINCT s.name, ', ') AS seasons
          FROM
              cotton_selections cs
          LEFT JOIN
              transactions t ON cs.transaction_id = t.id
          LEFT JOIN
              villages v ON t.village_id = v.id
          LEFT JOIN
              seasons s ON t.season_id = s.id
          WHERE 
              cs.process_id IN (${item?.dataValues?.process_ids.join(',')}) 
          `)

        const rowValues = Object.values({
          index: index + offset + 1,
          date: item.dataValues.date ? item.dataValues.date : '',
          created_at: item.dataValues.createdAt ? item.dataValues.createdAt : '',
          seed_consumed_seasons: seedSeason ? seedSeason[0]?.seasons : "",
          lint_process_seasons: item.dataValues.lint_process_seasons ? item.dataValues.lint_process_seasons : '',
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
          lint_quantity: item.dataValues.lint_quantity ? Number(item.dataValues.lint_quantity) : 0,
          sales_value: item.dataValues.sale_value ? Number(item.dataValues.sale_value) : 0,
          vehicle_no: item.dataValues.vehicle_no ? item.dataValues.vehicle_no : '',
          transporter_name: item.dataValues.transporter_name ? item.dataValues.transporter_name : '',
          program: item.dataValues.program ? item.dataValues.program : '',
          agentDetails: item.dataValues.transaction_agent ? item.dataValues.transaction_agent : 'NA',
          status: item.dataValues.status === 'Sold' ? 'Sold' : `Available [Stock : ${item.dataValues.qty_stock ? item.dataValues.qty_stock : 0}]`
        });
        currentWorksheet.addRow(rowValues).commit();
      }
      offset += batchSize;
    }
    // Save the workbook
    await workbook.commit()
      .then(() => {
        // Rename the temporary file to the final filename
        fs.renameSync("./upload/Ginner-sales-report-test.xlsx", './upload/Ginner-sales-report.xlsx');
        console.log('Ginner sales report report generation completed.');
      })
      .catch(error => {
        console.log('Failed generation?.');
        throw error;
      });

  } catch (error: any) {
    console.error("Error appending data:", error);
  }
};

const generatePendingGinnerSales = async () => {
  const maxRowsPerWorksheet = 500000; // Maximum number of rows per worksheet in Excel

  try {
    const whereCondition: any = {};

    // Create the excel workbook file
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: fs.createWriteStream("./upload/ginner-pending-sales-report-test.xlsx")
    });

    const batchSize = 5000;
    let offset = 0;
    let worksheetIndex = 0;
    let hasNextBatch = true;

    whereCondition['$sales.status$'] = "To be Submitted";

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


    while (hasNextBatch) {
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
        group: ['sales.id', "sales.season.id", "sales.ginner.id", "sales.buyerdata.id", "sales.program.id"],
        offset: offset,
        limit: batchSize,
      })

      if (rows.length === 0) {
        hasNextBatch = false;
        break;
      }

      if (offset % maxRowsPerWorksheet === 0) {
        worksheetIndex++;
      }

      let currentWorksheet = workbook.getWorksheet(`Sheet${worksheetIndex}`);
      if (!currentWorksheet) {
        currentWorksheet = workbook.addWorksheet(`Sheet${worksheetIndex}`);
        if (worksheetIndex == 1) {
          currentWorksheet.mergeCells("A1:N1");
          const mergedCell = currentWorksheet.getCell("A1");
          mergedCell.value = "CottonConnect | Ginner Pending Sales Report";
          mergedCell.font = { bold: true };
          mergedCell.alignment = { horizontal: "center", vertical: "middle" };
          // Set bold font for header row
        }
        // Set bold font for header row
        const headerRow = currentWorksheet.addRow([
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
          "Programme",
          "status",
        ]);
        headerRow.font = { bold: true };
      }

      // Append data to worksheet
      for await (const [index, item] of rows.entries()) {
        const rowValues = Object.values({
          index: index + offset + 1,
          date: item.dataValues.date ? item.dataValues.date : "",
          season: item.dataValues.season_name ? item.dataValues.season_name : "",
          ginner: item.dataValues.ginner ? item.dataValues.ginner : "",
          invoice: item.dataValues.invoice_no ? item.dataValues.invoice_no : "",
          buyer: item.dataValues.buyerdata ? item.dataValues.buyerdata : "",
          lot_no: item.dataValues.lot_no ? item.dataValues.lot_no : "",
          reel_lot_no: item.dataValues.reel_lot_no ? item.dataValues.reel_lot_no : "",
          no_of_bales: item.dataValues.no_of_bales ? Number(item.dataValues.no_of_bales) : 0,
          press_no: item.dataValues.press_no ? item.dataValues.press_no : "",
          rate: item.dataValues.rate ? Number(item.dataValues.rate) : 0,
          total_qty: item.dataValues.total_qty ? Number(item.dataValues.total_qty) : 0,
          program: item.dataValues.program ? item.dataValues.program : "",
          status: item.dataValues.status ? item.dataValues.status : "",
        });
        currentWorksheet.addRow(rowValues).commit();
      }
      offset += batchSize;
    }

    // Save the workbook
    await workbook.commit()
      .then(() => {
        // Rename the temporary file to the final filename
        fs.renameSync("./upload/ginner-pending-sales-report-test.xlsx", './upload/ginner-pending-sales-report.xlsx');
        console.log('ginner-pending-sales report report generation completed.');
      })
      .catch(error => {
        console.log('Failed generation?.');
        throw error;
      });
  } catch (error: any) {
    console.error("Error appending data:", error);
  }
};

const generateGinnerCottonStock = async () => {
  const maxRowsPerWorksheet = 500000; // Maximum number of rows per worksheet in Excel

  try {
    // Create the excel workbook file
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: fs.createWriteStream("./upload/ginner-seed-cotton-stock-report-test.xlsx")
    });

    const batchSize = 5000;
    let offset = 0;
    let worksheetIndex = 0;
    let hasNextBatch = true;

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

    while (hasNextBatch) {
      let { count, rows } = await GinProcess.findAndCountAll({
        attributes: [
          [Sequelize.literal('"ginner"."id"'), "ginner_id"],
          [Sequelize.literal('"ginner"."name"'), "ginner_name"],
          [Sequelize.literal('"season"."id"'), "season_id"],
          [Sequelize.col('"season"."name"'), "season_name"],
          // [Sequelize.literal('"program"."program_name"'), 'program_name'],
          // [
          //   sequelize.fn(
          //     "COALESCE",
          //     sequelize.fn("SUM", sequelize.col("total_qty")),
          //     0
          //   ),
          //   "cotton_processed",
          // ],
        ],
        include: include,
        group: ["ginner.id", "season.id"],
        order: [["ginner_id", "desc"]],
        offset: offset,
        limit: batchSize,
      });

      if (rows.length === 0) {
        hasNextBatch = false;
        break;
      }

      if (offset % maxRowsPerWorksheet === 0) {
        worksheetIndex++;
      }

      let currentWorksheet = workbook.getWorksheet(`Sheet${worksheetIndex}`);
      if (!currentWorksheet) {
        currentWorksheet = workbook.addWorksheet(`Sheet${worksheetIndex}`);
        if (worksheetIndex == 1) {
          currentWorksheet.mergeCells("A1:F1");
          const mergedCell = currentWorksheet.getCell("A1");
          mergedCell.value = "CottonConnect | Ginner Seed Cotton Stock Report";
          mergedCell.font = { bold: true };
          mergedCell.alignment = { horizontal: "center", vertical: "middle" };
          // Set bold font for header row
        }
        // Set bold font for header row
        const headerRow = currentWorksheet.addRow([
          "Sr No.",
          "Ginner Name",
          "Season",
          "Total Seed Cotton Procured (Kgs)",
          "Total Seed Cotton in Processed (Kgs)",
          "Total Seed Cotton in Stock (Kgs)",
        ]);
        headerRow.font = { bold: true };
      }

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
            mapped_ginner: item.ginner_id,
            season_id: item.season_id,
            status: "Sold",
          },
        });

        obj.cotton_procured = cottonProcured?.dataValues?.cotton_procured ?? 0;
        obj.cotton_stock = cottonProcured?.dataValues?.cotton_stock ?? 0;
        obj.cotton_processed =  obj.cotton_procured  - obj.cotton_stock;

        const rowValues = Object.values({
          index: index + offset + 1,
          ginner: item?.dataValues.ginner_name ? item?.dataValues.ginner_name : "",
          season: item?.dataValues.season_name ? item?.dataValues.season_name : "",
          cotton_procured: obj.cotton_procured ? Number(obj.cotton_procured) : 0,
          cotton_processed: obj.cotton_processed ? Number(obj.cotton_processed) : 0,
          cotton_stock: obj.cotton_stock ? Number(obj.cotton_stock) : 0,
        });
        currentWorksheet.addRow(rowValues).commit();
      }

      offset += batchSize;
    }

    // Save the workbook
    await workbook.commit()
      .then(() => {
        // Rename the temporary file to the final filename
        fs.renameSync("./upload/ginner-seed-cotton-stock-report-test.xlsx", './upload/ginner-seed-cotton-stock-report.xlsx');
        console.log('ginner-seed-cotton-stock report report generation completed.');
      })
      .catch(error => {
        console.log('Failed generation?.');
        throw error;
      });

  } catch (error: any) {
    console.log(error);
  }
};

// -------------------------------------- Spinner Data Section ------------------------------- //

const generateSpinnerSummary = async () => {
  // spinner_summary_load
  // const excelFilePath = path.join("./upload", "spinner-summary.xlsx");
  const whereCondition: any = {};

  const maxRowsPerWorksheet = 500000;

  try {

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: fs.createWriteStream("./upload/spinner-summary-test.xlsx")
    });
    let worksheetIndex = 0;

    const batchSize = 5000;
    let offset = 0;
    let hasNextBatch = true;

    while (hasNextBatch) {
      let { count, rows } = await Spinner.findAndCountAll({
        where: whereCondition,
        attributes: ["id", "name", "address"],
        offset: offset,
        limit: batchSize,
      });

      if (rows.length === 0) {
        hasNextBatch = false;
        break;
      }

      if (offset % maxRowsPerWorksheet === 0) {
        worksheetIndex++;
      }

      // Append data to worksheet
      for await (const [index, item] of rows.entries()) {
        let obj: any = {};
        let wheree: any = {};

        let [
          lint_cotton_procured,
          lint_cotton_procured_pending,
          lint_consumed,
          lint_greyout,
          lint_cotton_stock,
          yarnProcured,
          yarnGreyout,
          yarnSold,
        ] = await Promise.all([
          BaleSelection.findOne({
            attributes: [
                [
                  sequelize.fn(
                    "COALESCE",
                    sequelize.fn(
                      "SUM",
                      Sequelize.literal(`
                        CASE
                          WHEN "bale"."accepted_weight" IS NOT NULL THEN "bale"."accepted_weight"
                          ELSE CAST("bale"."weight" AS DOUBLE PRECISION)
                        END
                      `)
                    ),
                    0
                  ),
                  "lint_cotton_procured",
                ]
            ],
            where: {
              "$sales.buyer$": item.id,
              "$sales.status$": { [Op.in]: ['Sold', 'Partially Accepted', 'Partially Rejected'] },
              [Op.or]: [
                { spinner_status: true },
                {"$sales.status$": 'Sold'}
              ]
            },
            include: [
                {
                    model: GinBale,
                    as: "bale",
                    attributes: []
                },
                {
                  model: GinSales,
                  as: "sales",
                  attributes: []
              },
            ],
            group: ["sales.buyer"],
           }),
          BaleSelection.findOne({
            attributes: [
                [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.literal(
                    'CAST("bale"."weight" AS DOUBLE PRECISION)'
                )), 0), 'lint_cotton_procured_pending']
            ],
            where: {
              "$sales.buyer$": item.id,
              "$sales.status$": { [Op.in]: ['Pending', 'Pending for QR scanning', 'Partially Accepted', 'Partially Rejected'] },
              spinner_status: null,
            },
            include: [
                {
                    model: GinBale,
                    as: "bale",
                    attributes: []
                },
                {
                  model: GinSales,
                  as: "sales",
                  attributes: []
              },
            ],
            group: ["sales.buyer"],
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
              {
                model: GinSales,
                as: "ginsales",
                attributes: [],
              },
            ],
            where: {
              "$ginsales.buyer$": item.id,
            },
            group: ["ginsales.buyer"],
          }),
          GinSales.findOne({
            attributes: [
              [
                sequelize.fn(
                  "COALESCE",
                  sequelize.fn("SUM", sequelize.col("qty_stock")),
                  0
                ),
                "lint_greyout",
              ],
            ],
            where: {
              ...wheree,
              buyer: item.id,
              status: { [Op.in]: ['Sold', 'Partially Accepted', 'Partially Rejected'] },
              greyout_status: true, 
            },
          }),
          GinSales.findOne({
            attributes: [
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
              buyer: item.id,
              status: { [Op.in]: ['Sold', 'Partially Accepted', 'Partially Rejected'] }
            },
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
              spinner_id: item.id,
            },
          }),
          SpinProcess.findOne({
            attributes: [
             [
                sequelize.fn(
                  "COALESCE",
                  sequelize.fn("SUM", sequelize.col("qty_stock")),
                  0
                ),
                "yarn_greyout",
              ],
            ],
            where: {
              ...wheree,
              spinner_id: item.id,
              greyout_status: true,
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
              spinner_id: item.id,
            },
          }),
        ]);

        obj.lintCottonProcuredKG = lint_cotton_procured
          ? Number(lint_cotton_procured?.dataValues.lint_cotton_procured ?? 0)
          : 0;
        obj.lintCottonProcuredPendingKG = lint_cotton_procured_pending
          ? Number(lint_cotton_procured_pending?.dataValues.lint_cotton_procured_pending?? 0)
          : 0;
        obj.lintConsumedKG = lint_consumed
          ? Number(lint_consumed?.dataValues.lint_cotton_consumed?? 0)
          : 0;
        obj.lintStockKG = lint_cotton_stock
          ? Number(lint_cotton_stock?.dataValues.lint_cotton_stock?? 0)
          : 0;

        obj.lintGreyoutKg =  lint_greyout?.dataValues.lint_greyout ?? 0;

        obj.lintActualStockKg = Number(obj.lintStockKG) >  Number(obj.lintGreyoutKg)
        ? Number(obj.lintStockKG) - (Number(obj.lintGreyoutKg))
        : 0;

        obj.yarnProcuredKG = yarnProcured
          ? Number(yarnProcured?.dataValues.yarn_procured?? 0)
          : 0;
        obj.yarnSoldKG = yarnSold ? Number(yarnSold.dataValues.yarn_sold?? 0) : 0;
        obj.yarnStockKG = yarnProcured
          ? Number(yarnProcured?.dataValues.yarn_stock ?? 0)
          : 0;

        obj.yarnGreyoutKg =  yarnGreyout?.dataValues.yarn_greyout ?? 0;

        obj.yarnActualStockKg = Number(obj.yarnStockKG) >  Number(obj.yarnGreyoutKg)
        ? Number(obj.yarnStockKG) - (Number(obj.yarnGreyoutKg))
        : 0;
        obj.lintCottonProcuredMT = Number(convert_kg_to_mt(obj.lintCottonProcuredKG)) ?? 0;
        obj.lintCottonProcuredPendingMT = Number(convert_kg_to_mt(obj.lintCottonProcuredPendingKG)) ?? 0;
        obj.lintConsumedMT = Number(convert_kg_to_mt(obj.lintConsumedKG));
        obj.lintStockMT = Number(convert_kg_to_mt(obj.lintStockKG));
        obj.lintGreyoutMT  = convert_kg_to_mt(obj.lintGreyoutKg);
        obj.lintActualStockMT = convert_kg_to_mt(obj.lintActualStockKg);
        obj.yarnSoldMT = Number(convert_kg_to_mt(obj.yarnSoldKG));
        obj.yarnProcuredMT = Number(convert_kg_to_mt(obj.yarnProcuredKG));
        obj.yarnGreyoutMT  = convert_kg_to_mt(obj.yarnGreyoutKg);
        obj.yarnActualStockMT = convert_kg_to_mt(obj.yarnActualStockKg);
        obj.yarnStockMT = Number(convert_kg_to_mt(obj.yarnStockKG));

        const rowValues = Object.values({
          index: index + offset + 1,
          name: item.name ? item.name : "",
          lint_cotton_procured: obj.lintCottonProcuredMT,
          lint_cotton_procured_pending: obj.lintCottonProcuredPendingMT,
          lint_consumed: obj.lintConsumedMT,
          lintGreyoutMT: obj.lintGreyoutMT ? Number(obj.lintGreyoutMT) : 0,
          lintActualStockMT: obj.lintActualStockMT ? Number(obj.lintActualStockMT) : 0,
          balance_lint_cotton: obj.lintStockMT,
          yarn_procured: obj.yarnProcuredMT,
          yarn_sold: obj.yarnSoldMT,
          yarnGreyoutMT: obj.yarnGreyoutMT ? Number(obj.yarnGreyoutMT) : 0,
          yarnActualStockMT: obj.yarnActualStockMT ? Number(obj.yarnActualStockMT) : 0,
          yarn_stock: obj.yarnStockMT,
        });

        let currentWorksheet = workbook.getWorksheet(`Spinner Summary ${worksheetIndex}`);
        if (!currentWorksheet) {
          currentWorksheet = workbook.addWorksheet(`Spinner Summary ${worksheetIndex}`);
          if (worksheetIndex == 1) {
            currentWorksheet.mergeCells("A1:M1");
            const mergedCell = currentWorksheet.getCell("A1");
            mergedCell.value = "CottonConnect | Spinner Summary Report";
            mergedCell.font = { bold: true };
            mergedCell.alignment = { horizontal: "center", vertical: "middle" };
          }

          const headerRow = currentWorksheet.addRow([
            "Sr No.",
            "Spinner Name",
            "Total Lint Cotton Procured MT (Accepted)",
            "Total Lint Cotton Procured MT (Pending)",
            "Lint cotton processed in MT",
            "Grey-Out Lint Quantity MT",
            "Actual lint in stock MT",
            "Balance Lint cotton stock in MT",
            "Total Yarn Produced MT",
            "Yarn sold in MT",
            "Grey-Out Yarn Quantity MT",
            "Actual Yarn stock in MT",
            "Yarn stock in MT",
          ]);
          headerRow.font = { bold: true };
        }

        currentWorksheet.addRow(rowValues).commit();
      }
      offset += batchSize;
    }

    // Save the workbook
    await workbook.commit()
      .then(() => {
        // Rename the temporary file to the final filename
        fs.renameSync("./upload/spinner-summary-test.xlsx", './upload/spinner-summary.xlsx');
        console.log('====== Spinner Summary Report Generated. =======');
      })
      .catch(error => {
        console.log('Failed to generate Spinner Summary Report.');
        throw error;
      });

  } catch (error: any) {
    console.log(error);
  }
};

const generateSpinnerBale = async () => {
  // spinner_bale_receipt_load

  const whereCondition: any = [];
  const maxRowsPerWorksheet = 500000;

  try {

    whereCondition.push(`gs.status IN ('Sold', 'Partially Accepted', 'Partially Rejected')`);
  
    const whereClause = whereCondition.length > 0 ? `WHERE ${whereCondition.join(' AND ')}` : '';

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: fs.createWriteStream("./upload/Spinner-bale-receipt-report-test.xlsx")
    });
    let worksheetIndex = 0;


    const batchSize = 5000;
    let offset = 0;
    let hasNextBatch = true;

    // //fetch data with pagination
    while (hasNextBatch) {
      let dataQuery = `
                WITH bale_details AS (
                    SELECT 
                        bs.sales_id,
                        COUNT(DISTINCT gb.id) AS no_of_bales,
                        ARRAY_AGG(DISTINCT gp.id) AS "process_ids",
                        COALESCE(SUM(CAST(gb.weight AS DOUBLE PRECISION)), 0) AS received_qty,
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
                    LEFT JOIN 
                        gin_processes gp ON gb.process_id = gp.id
                    WHERE 
                        gs.status IN ('Sold', 'Partially Accepted', 'Partially Rejected')
                        AND (bs.spinner_status = true OR gs.status = 'Sold')
                    GROUP BY 
                        bs.sales_id
                )
                SELECT 
                    gs.*, 
                    g.id AS ginner_id, 
                    g.name AS ginner, 
                    s.id AS season_id, 
                    s.name AS season_name, 
                    p.id AS program_id, 
                    p.program_name AS program, 
                    sp.id AS spinner_id, 
                    sp.name AS spinner, 
                    sp.address AS spinner_address, 
                    bd.no_of_bales AS accepted_no_of_bales, 
                    bd.process_ids AS process_ids, 
                    bd.total_qty AS accepted_total_qty,
                    bd.received_qty AS received_total_qty
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
                    gs."id" ASC
                LIMIT 
                    :limit OFFSET :offset;`
                    

        const [rows] = await Promise.all([
            sequelize.query(dataQuery, {
                replacements: { limit: batchSize, offset },
                type: sequelize.QueryTypes.SELECT,
            })
        ]);
      // // Append data to worksheet

      if (rows.length === 0) {
        hasNextBatch = false;
        break;
      }

      if (offset % maxRowsPerWorksheet === 0) {
        worksheetIndex++;
      }

      for await (const [index, item] of rows.entries()) {
        const rowValues = Object.values({
          index: index + offset + 1,
          accept_date: item.accept_date
            ? item.accept_date
            : "",
          date: item.date ? item.date : "",
          season: item.season_name ? item.season_name : "",
          spinner: item.spinner ? item.spinner : "",
          ginner: item.ginner ? item.ginner : "",
          invoice: item.invoice_no ? item.invoice_no : "",
          lot_no: item.lot_no ? item.lot_no : "",
          reel_lot_no: item.reel_lot_no
            ? item.reel_lot_no
            : "",
          press_no: item.press_no ? item.press_no : "",
          no_of_bales: item.accepted_no_of_bales
            ? Number(item.accepted_no_of_bales)
            : 0,
          lint_quantity: Number(item.accepted_total_qty) ?? 0
            ? Number(item.accepted_total_qty)
            : 0,
          program: item.program ? item.program : "",
          greyout_status: item.greyout_status ? "Yes" : "No",
        });

        let currentWorksheet = workbook.getWorksheet(`Spinner Bale Receipt ${worksheetIndex}`);
        if (!currentWorksheet) {
          currentWorksheet = workbook.addWorksheet(`Spinner Bale Receipt ${worksheetIndex}`);
          if (worksheetIndex == 1) {
            currentWorksheet.mergeCells("A1:N1");
            const mergedCell = currentWorksheet.getCell("A1");
            mergedCell.value = "CottonConnect | Spinner Bale Receipt Report";
            mergedCell.alignment = { horizontal: "center", vertical: "middle" };
            mergedCell.font = { bold: true };
          }

          const headerRow = currentWorksheet.addRow([
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
            "No of Bales(Accepted)",
            "Total Lint Accepted Quantity(Kgs)",
            "Programme",
            "Grey Out Status",
          ]);
          headerRow.font = { bold: true };
        }

        currentWorksheet.addRow(rowValues).commit();
      }
      offset += batchSize;
    }

    // Save the workbook
    // Save the workbook
    await workbook.commit()
      .then(() => {
        // Rename the temporary file to the final filename
        fs.renameSync("./upload/Spinner-bale-receipt-report-test.xlsx", './upload/Spinner-bale-receipt-report.xlsx');
        console.log('====== Spinner Bale Receipt Report Generated. =======');
      })
      .catch(error => {
        console.log('Failed to generate Spinner Bale Receipt Report.');
        throw error;
      });
  } catch (error: any) {
    console.error("Error appending data:", error);

  }
};

const generateSpinnerYarnProcess = async () => {
  // spinner_yarn_process_load
  const excelFilePath = path.join("./upload", "spinner-yarn-process.xlsx");
  const whereCondition: any = {};
  const maxRowsPerWorksheet = 500000;
  try {

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: fs.createWriteStream("./upload/spinner-yarn-process-test.xlsx")
    });
    let worksheetIndex = 0;

    const batchSize = 5000;
    let offset = 0;

    let hasNextBatch = true;

    while (hasNextBatch) {
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
            spin_process.greyout_status,
            program.program_name AS program
          FROM
            spin_processes spin_process
          LEFT JOIN
            spinners spinner ON spin_process.spinner_id = spinner.id
          LEFT JOIN
            seasons season ON spin_process.season_id = season.id
          LEFT JOIN
            programs program ON spin_process.program_id = program.id
        ),
        cotton_consumed_data AS (
          SELECT
            ls.process_id,
            COALESCE(SUM(ls.qty_used), 0) AS cotton_consumed,
            STRING_AGG(DISTINCT s.name, ', ') AS seasons
          FROM
            lint_selections ls
          LEFT JOIN
            gin_sales gs ON ls.lint_id = gs.id
          LEFT JOIN
            seasons s ON gs.season_id = s.id
          GROUP BY
            process_id
        ),
        comber_consumed_data AS (
      SELECT
        cs.process_id,
        COALESCE(SUM(cs.qty_used), 0) AS comber_consumed,
        STRING_AGG(DISTINCT s.name, ', ') AS seasons
      FROM
        comber_selections cs
      LEFT JOIN
        gin_sales gs ON cs.yarn_id = gs.id
      LEFT JOIN
        seasons s ON gs.season_id = s.id
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
          COALESCE(csd.comber_consumed, 0) AS comber_consumed,
          ccd.seasons AS lint_consumed_seasons,
          COALESCE(ysd.yarn_sold, 0) AS yarn_sold,
          ycd.yarncount
        FROM
          spin_process_data spd
        LEFT JOIN
          cotton_consumed_data ccd ON spd.process_id = ccd.process_id
        LEFT JOIN
          comber_consumed_data csd ON spd.process_id = csd.process_id
        LEFT JOIN
          yarn_sold_data ysd ON spd.process_id = ysd.spin_process_id
        LEFT JOIN
          yarn_count_data ycd ON spd.process_id = ycd.process_id
        LIMIT :limit OFFSET :offset
        `;

      // Execute the queries
      const rows = await sequelize.query(dataQuery, {
        replacements: { limit : batchSize, offset },
        type: sequelize.QueryTypes.SELECT,
      });

      if (rows.length === 0) {
        hasNextBatch = false;
        break;
      }

      if (offset % maxRowsPerWorksheet === 0) {
        worksheetIndex++;
      }

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
          index: index + offset + 1,
          createdAt: item.createdAt ? item.createdAt : "",
          date: item.date ? item.date : "",
          lint_consumed_seasons: item.lint_consumed_seasons ? item.lint_consumed_seasons : "",
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
        comber_consumed: item?.comber_consumed
          ? Number(item?.comber_consumed)
          : 0,
        total_lint_blend_consumed: item?.total_qty
        ? Number(item?.total_qty)
        : 0,
          program: item.program ? item.program : "",
          total: item.net_yarn_qty ? Number(item.net_yarn_qty) : 0,
          yarn_sold: item?.yarn_sold
          ? Number(item?.yarn_sold)
          : 0,
          yarn_stock: item.qty_stock ? Number(item.qty_stock) : 0,
          greyout_status: item.greyout_status ? "Yes" : "No",
        });

        let currentWorksheet = workbook.getWorksheet(`Spinner Yarn Process ${worksheetIndex}`);
        if (!currentWorksheet) {
          currentWorksheet = workbook.addWorksheet(`Spinner Yarn Process ${worksheetIndex}`);
          if (worksheetIndex == 1) {
            currentWorksheet.mergeCells("A1:V1");
            const mergedCell = currentWorksheet.getCell("A1");
            mergedCell.value = "CottonConnect | Spinner Yarn Process Report";
            mergedCell.font = { bold: true };
            mergedCell.alignment = { horizontal: "center", vertical: "middle" };
          }

          const headerRow = currentWorksheet.addRow([
            "Sr No.",
            "Date and Time",
            "Process Date",
            "Lint Cotton Consumed Season",
            "Yarn Process Season",
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
            "Total Comber Noil Consumed(kgs)",
            "Total lint+Blend material + Comber Noil consumed",
            "Programme",
            "Total Yarn weight (Kgs)",
            "Total yarn sold (Kgs)",
            "Total Yarn in stock (Kgs)",
            "Grey Out Status",
          ]);
          headerRow.font = { bold: true };
        }

        currentWorksheet.addRow(rowValues).commit();
      }

      offset += batchSize;
    }

    // Save the workbook
    await workbook.commit()
      .then(() => {
        // Rename the temporary file to the final filename
        fs.renameSync("./upload/spinner-yarn-process-test.xlsx", './upload/spinner-yarn-process.xlsx');
        console.log('====== Spinner Yarn Process Report Generated. =======');
      })
      .catch(error => {
        console.log('Failed to generate Spinner Yarn Process Report.');
        throw error;
      });
  } catch (error: any) {
    console.error("Error appending data:", error);
  }
};

const generateSpinnerSale = async () => {

  const whereCondition: any = {};
  const maxRowsPerWorksheet = 500000;

  try {

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: fs.createWriteStream("./upload/spinner-yarn-sale-test.xlsx")
    });
    let worksheetIndex = 0;


    const batchSize = 5000;
    let offset = 0;
    let hasNextBatch = true;

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

    while (hasNextBatch) {

      const rows : any = await SpinProcessYarnSelection.findAll(
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
            [Sequelize.fn('ARRAY_AGG', Sequelize.literal('DISTINCT "process"."id"')), "process_ids"],
            [Sequelize.literal('"sales"."no_of_boxes"'), "no_of_boxes"],
            [Sequelize.literal('"sales"."price"'), "price"],
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
          offset: offset,
          limit: batchSize,
        }
      );

      
      if (rows.length === 0) {
        hasNextBatch = false;
        break;
      }

      if (offset % maxRowsPerWorksheet === 0) {
        worksheetIndex++;
      }

      for await (const [index, item] of rows.entries()) {

        let processIds = item?.dataValues?.process_ids && Array.isArray(item?.dataValues?.process_ids)
        ? item.dataValues.process_ids.filter((id: any) => id !== null && id !== undefined)
        : [];

      let seedSeason = [];

      if (processIds.length > 0) {
        [seedSeason] = await sequelize.query(`
          SELECT 
              STRING_AGG(DISTINCT s.name, ', ') AS seasons
          FROM
              lint_selections ls
          LEFT JOIN
              gin_sales gs ON ls.lint_id = gs.id
          LEFT JOIN
              seasons s ON gs.season_id = s.id
          WHERE 
              ls.process_id IN (${processIds.join(',')})
      `);
      }

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
          index: index + offset + 1,
          createdAt: item.dataValues.createdAt ? item.dataValues.createdAt : "",
          date: item.dataValues.date ? item.dataValues.date : "",
          lint_consumed_seasons: seedSeason ? seedSeason[0]?.seasons : "",
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
          program: item.dataValues.program ? item.dataValues.program : "",
          yarnType: yarnTypeData ? yarnTypeData : "",
          count: yarnCount
            ? yarnCount
            : 0,
          boxes: item.dataValues.no_of_boxes ? Number(item.dataValues.no_of_boxes) : 0,
          boxId: item.dataValues.box_ids ? item.dataValues.box_ids : "",
          price: item.dataValues.price ? Number(item.dataValues.price) : 0,
          total: item.dataValues.total_qty ? Number(item.dataValues.total_qty) : 0,
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

        let currentWorksheet = workbook.getWorksheet(`Spinner Yarn Sales ${worksheetIndex}`);
        if (!currentWorksheet) {
          currentWorksheet = workbook.addWorksheet(`Spinner Yarn Sales ${worksheetIndex}`);
          if (worksheetIndex == 1) {
            currentWorksheet.mergeCells("A1:U1");
            const mergedCell = currentWorksheet.getCell("A1");
            mergedCell.value = "CottonConnect | Spinner Yarn Sales Report";
            mergedCell.font = { bold: true };
            mergedCell.alignment = { horizontal: "center", vertical: "middle" };
          }

          const headerRow = currentWorksheet.addRow([
            "Sr No.",
            "Created Date and Time",
            "Date",
            "Lint Cotton Consumed Season",
            "Yarn sale season chosen",
            "Spinner Name",
            "Knitter/Weaver Name",
            "Invoice Number",
            "Order Reference",
            "Lot/Batch Number",
            "Reel Lot No",
            "Programme",
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
        }

        currentWorksheet.addRow(rowValues).commit();
      }

      offset += batchSize;
    }

    // Save the workbook
    await workbook.commit()
      .then(() => {
        // Rename the temporary file to the final filename
        fs.renameSync("./upload/spinner-yarn-sale-test.xlsx", './upload/spinner-yarn-sale.xlsx');
        console.log('====== Spinner Yarn Sales Report Generated. =======');
      })
      .catch(error => {
        console.log('Failed to generate Spinner Yarn Sales Report.');
        throw error;
      });
  } catch (error: any) {
    console.log(error)
  }
};

const generateSpinProcessBackwardfTraceabilty = async () => {
  const maxRowsPerWorksheet = 500000;
  const whereCondition:any = {};
  try {
        // Create the excel workbook file
        const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
          stream: fs.createWriteStream("./upload/spin-process-backward-traceability-test.xlsx")
        });
    
    const batchSize = 5000;
    let worksheetIndex = 0;
    let offset = 0;
    let hasNextBatch = true;

    while (hasNextBatch) {
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
    WHERE "spinprocess"."id" IS NOT NULL
    GROUP BY 
        "spinprocess"."id",
        "spinner"."id"
    ORDER BY "spinprocess_id" ASC
    OFFSET ${offset} LIMIT ${batchSize}
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
    combined_village_data AS (
        SELECT
            process_id,
            ARRAY_AGG(DISTINCT village_id) AS village_ids
        FROM (
            SELECT
                cs.process_id,
                UNNEST(cs.villages) AS village_id
            FROM (
                SELECT
                    cs.process_id,
                    ARRAY_AGG(DISTINCT t.village_id) AS villages
                FROM
                    cotton_selections cs
                LEFT JOIN
                    transactions t ON cs.transaction_id = t.id
                GROUP BY
                    cs.process_id
            ) cs
            UNION ALL
            SELECT
                hs.process_id,
                UNNEST(hs.villages) AS village_id
            FROM (
                SELECT
                    hs.process_id,
                    ARRAY_AGG(DISTINCT hs.village_id) AS villages
                FROM
                    heap_selections hs
                GROUP BY
                    hs.process_id
            ) hs
        ) combined
        GROUP BY
            process_id
    ),
    village_names_data AS (
        SELECT
            cv.process_id AS ginprocess_id,
            ARRAY_AGG(DISTINCT v.village_name) AS village_names
        FROM
            combined_village_data cv
        LEFT JOIN
            villages v ON v.id = ANY(cv.village_ids)
        GROUP BY
            cv.process_id
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
      vnd.village_names,
      lc.qr
    FROM 
        lintcomsumption lc
    LEFT JOIN 
        yarn_consumption yc ON lc.spinprocess_id = yc.spin_process_id
    LEFT JOIN 
        gin_bales gb ON gb.gin_sales_id = ANY(lc.spnr_lint_ids) -- Assuming spnr_lint_ids is an array of text
    LEFT JOIN 
        village_names_data vnd ON vnd.ginprocess_id = ANY(gb.gin_process_id);`
      );
  
  
      // const groupedData = Object.values(rows[0]?.reduce((acc: any, curr: any) => {
      //   const { spinprocess_id, spinner_name,reel_lot_no, net_yarn_qty, gnr_lot_no, gnr_reel_lot_no, gnr_invoice_no, gnr_name, lint_consumed, spnr_invoice_no, spnr_yarn_sold, knitter, weaver, village_names } = curr;
      //   if (!acc[spinprocess_id]) {
      //       acc[spinprocess_id] = { spinprocess_id, spinner_name,reel_lot_no, net_yarn_qty, gnr_lot_no, gnr_reel_lot_no, gnr_invoice_no, gnr_name, lint_consumed, spnr_invoice_no, spnr_yarn_sold, knitter, weaver, village_names: new Set(village_names?.split(', ').map((name: any) => name)) };
      //   } else {
      //       village_names?.split(', ').forEach((name: any) => acc[spinprocess_id].village_names?.add(name));
      //   }
      //   return acc;
      // }, {})).map((item: any) => ({ ...item, village_names: Array.from(item.village_names).join(', ') }));

      if (rows && rows[0]?.length === 0) {
        hasNextBatch = false;
        break;
      }

      if (offset % maxRowsPerWorksheet === 0) {
        worksheetIndex++;
      }

      let currentWorksheet = workbook.getWorksheet(`Sheet${worksheetIndex}`);
      if (!currentWorksheet) {
        currentWorksheet = workbook.addWorksheet(`Sheet${worksheetIndex}`);
        if (worksheetIndex == 1) {
          currentWorksheet.mergeCells("A1:M1");
          const mergedCell = currentWorksheet.getCell("A1");
          mergedCell.value = "CottonConnect | Spinner Process Backward Traceability Report";
          mergedCell.font = { bold: true };
          mergedCell.alignment = { horizontal: "center", vertical: "middle" };
        }
        // Set bold font for header row
        // Set bold font for header row
        const headerRow = currentWorksheet.addRow([
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
      }

      for await (let [index, item] of rows[0]?.entries()) {
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

        const rowValues = [
          index + offset + 1,
          item?.spinner_name ? item.spinner_name : "",
          fbrc_name && fbrc_name.length > 0 ? fbrc_name.join(", ") : "",
          item?.reel_lot_no ? item?.reel_lot_no : "",
          item.spnr_invoice_no ? item.spnr_invoice_no : "",
          item?.net_yarn_qty ? Number(item?.net_yarn_qty) : 0,
          item.spnr_yarn_sold ? Number(item.spnr_yarn_sold) : 0,
          item?.gnr_reel_lot_no ? item?.gnr_reel_lot_no : "",
          item?.gnr_lot_no ? item?.gnr_lot_no : "",
          item?.gnr_invoice_no ? item?.gnr_invoice_no : "",
          item?.lint_consumed ? Number(item?.lint_consumed) : 0,
          item.village_names ? item.village_names.join(", ") : "",
          item?.gnr_name ? item?.gnr_name: "",
        ];
        currentWorksheet.addRow(rowValues).commit();
      }
      offset += batchSize;
    }

    await workbook.commit();
    fs.renameSync("./upload/spin-process-backward-traceability-test.xlsx", './upload/spin-process-backward-traceability.xlsx');
    console.log('spin-process-backward-traceability report generation completed.');
  } catch (error) {
    console.log('Failed generation Report:', error);
  }
};


const generatePendingSpinnerBale = async () => {
  // spinner_yarn_bales_load
  const excelFilePath = path.join(
    "./upload",
    "Spinner-Pending-Bales-Receipt-Report.xlsx"
  );
  const whereCondition: any = {};
  const maxRowsPerWorksheet = 500000;

  try {

    whereCondition["$sales.total_qty$"] = {
      [Op.gt]: 0,
    };

    whereCondition["$sales.status$"] = { [Op.in]: ['Pending', "Pending for QR scanning"] };
    whereCondition["$sales.buyer$"] = {
      [Op.ne]: null,
    };

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: fs.createWriteStream("./upload/Spinner-Pending-Bales-Receipt-Report-test.xlsx")
    });
    let worksheetIndex = 0;

    const batchSize = 5000;
    let offset = 0;
    let hasNextBatch = true;


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

    while (hasNextBatch) {
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
        limit: batchSize,
      });

      if (rows.length === 0) {
        hasNextBatch = false;
        break;
      }

      if (offset % maxRowsPerWorksheet === 0) {
        worksheetIndex++;
      }

      // Append data to worksheet
      for await (const [index, item] of rows.entries()) {
        const rowValues = Object.values({
          index: index + offset + 1,
          createdAt: item.dataValues.createdAt ? item.dataValues.createdAt : "",
          date: item.dataValues.date ? item.dataValues.date : "",
          season: item.dataValues.season_name ? item.dataValues.season_name : "",
          ginner: item.dataValues.ginner ? item.dataValues.ginner : "",
          spinner: item.dataValues.spinner ? item.dataValues.spinner : "",
          invoice: item.dataValues.invoice_no ? item.dataValues.invoice_no : "",
          no_of_bales: item.dataValues.no_of_bales
            ? Number(item.dataValues.no_of_bales)
            : 0,
          lot_no: item.dataValues.lot_no ? item.dataValues.lot_no : "",
          reel_lot_no: item.dataValues.reel_lot_no
            ? item.dataValues.reel_lot_no
            : "",
          total_qty: item.dataValues.lint_quantity
            ? Number(item.dataValues.lint_quantity)
            : 0,
          actual_qty: item.dataValues.lint_quantity
            ? Number(item.dataValues.lint_quantity)
            : 0,
          program: item.dataValues.program ? item.dataValues.program : "",
          village: item.dataValues.vehicle_no ? item.dataValues.vehicle_no : ""
        });

        let currentWorksheet = workbook.getWorksheet(`Spinner Pending Bales ${worksheetIndex}`);
        if (!currentWorksheet) {
          currentWorksheet = workbook.addWorksheet(`Spinner Pending Bales ${worksheetIndex}`);
          if (worksheetIndex == 1) {
            currentWorksheet.mergeCells("A1:N1");
            const mergedCell = currentWorksheet.getCell("A1");
            mergedCell.value = "CottonConnect | Spinner Pending Bales Receipt Report";
            mergedCell.font = { bold: true };
            mergedCell.alignment = { horizontal: "center", vertical: "middle" };
          }

          const headerRow = currentWorksheet.addRow([
            "Sr No.",
            "Date and Time",
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
            "Programme",
            "Vehicle No",
          ]);
          headerRow.font = { bold: true };
        }

        currentWorksheet.addRow(rowValues).commit();
      }

      offset += batchSize;
    }

    // Save the workbook
    await workbook.commit()
      .then(() => {
        // Rename the temporary file to the final filename
        fs.renameSync("./upload/Spinner-Pending-Bales-Receipt-Report-test.xlsx", './upload/Spinner-Pending-Bales-Receipt-Report.xlsx');
        console.log('====== Spinner Pending Bales Receipt Report Generated. =======');
      })
      .catch(error => {
        console.log('Failed to generate Spinner Pending Bales Receipt Report.');
        throw error;
      });
  } catch (error: any) {
    console.log(error)
  }
};

const generateBrandWiseData = async () =>{
  const maxRowsPerWorksheet = 500000; // Maximum number of rows per worksheet in Excel

  try {
        // Create the excel workbook file
        const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
          stream: fs.createWriteStream("./upload/brand-wise-data-report-test.xlsx")
        });
    
        const batchSize = 5000;
        let worksheetIndex = 0;
        let offset = 0;
        let hasNextBatch = true;

      while (hasNextBatch) {

      const rows = await Brand.findAll({
        offset: offset,
        limit: batchSize,
      })

      if (rows.length === 0) {
        hasNextBatch = false;
        break;
      }

      if (offset % maxRowsPerWorksheet === 0) {
        worksheetIndex++;
      }

      let currentWorksheet = workbook.getWorksheet(`Sheet${worksheetIndex}`);
        if (!currentWorksheet) {
          currentWorksheet = workbook.addWorksheet(`Sheet${worksheetIndex}`);
          if (worksheetIndex == 1) {
            currentWorksheet.mergeCells("A1:J1");
            const mergedCell = currentWorksheet.getCell("A1");
            mergedCell.value = "CottonConnect | Brand Wise Data Report";
            mergedCell.font = { bold: true };
            mergedCell.alignment = { horizontal: "center", vertical: "middle" };
          }
          // Set bold font for header row
          const headerRow = currentWorksheet.addRow([
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
        }

      for await (let [index, item] of rows.entries()) {
        let [result, trans, lintProcured, lintSold, yarnProcessed, yarnSold]: any =
          await Promise.all([
            Farm.findOne({
              where: {
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
                      sequelize.literal(`
                        CASE
                          WHEN "gin-bales"."old_weight" IS NOT NULL THEN CAST("gin-bales"."old_weight" AS DOUBLE PRECISION)
                          ELSE CAST("gin-bales"."weight" AS DOUBLE PRECISION)
                        END
                      `)
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
                      sequelize.literal(`
                        CASE
                          WHEN "bale"."old_weight" IS NOT NULL THEN CAST("bale"."old_weight" AS DOUBLE PRECISION)
                          ELSE CAST("bale"."weight" AS DOUBLE PRECISION)
                        END
                      `)
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
                "$sales.ginner.brand$": { [Op.overlap]: [item?.dataValues?.id] },
                "$sales.status$" : { [Op.in]: ['Pending', 'Pending for QR scanning', 'Partially Accepted', 'Partially Rejected','Sold'] }
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
                "$spinner.brand$": { [Op.overlap]: [item?.dataValues?.id] },
              },
              group: ["spinner.brand"],
            }),
          ]);

        const rowValues = [
          index + offset + 1,
          item?.dataValues.brand_name ? item?.dataValues?.brand_name : "",
          result ? Number(formatDecimal(result?.dataValues?.total_farmers)) : 0,
          result ? Number(formatDecimal(convert_kg_to_mt(result?.dataValues?.total_estimated_cotton ?? 0))) : 0,
          trans ? Number(formatDecimal(convert_kg_to_mt(trans?.dataValues?.total_cotton_procured ?? 0))) : 0,
          lintProcured ? Number(lintProcured?.dataValues?.bales_processed) : 0,
          lintProcured ? Number(formatDecimal(convert_kg_to_mt(lintProcured?.dataValues?.lint_processed ?? 0))) : 0,
          lintSold ? Number(formatDecimal(convert_kg_to_mt(lintSold?.dataValues?.lint_sold ?? 0))) : 0,
          yarnProcessed ? Number(formatDecimal(convert_kg_to_mt(yarnProcessed?.dataValues?.yarn_processed ?? 0))) : 0,
          yarnSold ? Number(formatDecimal(convert_kg_to_mt(yarnSold?.dataValues?.yarn_sold ?? 0))) : 0,
        ];
        currentWorksheet.addRow(rowValues).commit();
        }
        offset += batchSize;
      }

    // Save the workbook
    await workbook.commit()
    .then(() => {
      // Rename the temporary file to the final filename
      fs.renameSync("./upload/brand-wise-data-report-test.xlsx", './upload/brand-wise-data-report.xlsx');
      console.log('brand-wise-data report generation completed.');
    })
    .catch(error => {
      console.log('Failed generation Report.');
      throw error;
    });

  } catch (error: any) {
    console.log(error);
  }
}

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

function convert_kg_to_mt(number: any) {
  return (number / 1000).toFixed(2);
}

export { exportReportsTameTaking, exportReportsOnebyOne };
