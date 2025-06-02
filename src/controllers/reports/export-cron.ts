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
import ValidationProject from "../../models/validation-project.model";
import GinToGinSale from "../../models/gin-to-gin-sale.model";
import SpinnerYarnOrder from "../../models/spinner-yarn-order.model";
import YarnOrderProcess from "../../models/yarn-order-process.model";
import SpinnerYarnOrderSales from "../../models/spinner-yarn-order-sales.model";


const exportReportsTameTaking = async () => {
  // //call all export reports one by one on every cron
  await generateOrganicFarmerReport();
  await generateNonOrganicFarmerReport();
  await generateProcurementReport(); // taking time
  await generateAgentTransactions(); // taking time
  await generateGinnerSales();
  await generateSpinProcessBackwardfTraceabilty();

  console.log('TameTaking Cron Job Completed to execute all reports.');
}

const exportReportsOnebyOne = async () => {
  //call all export reports one by one on every cron
  await generatePremiumValidationData();

  await generateFaildReport("Farmer");
  await generateFaildReport("Procurement");
  // await generateExportFarmer();

  // Procurement Reports 
  await generatePscpCottonProcurement();
  await generatePscpProcurementLiveTracker();

  await exportVillageSeedCottonAllocation();

  // //brand wise report
  await generateBrandWiseData();

  // // Ginner Reports 
  await generateGinnerSummary();
  await generatePendingGinnerSales();
  await generateGinnerCottonStock();
  await generateGinnerProcess();
  await generateGinnerLintCottonStock()
  //spinner Reports
  await generateSpinnerSummary();
  await generateSpinnerBale();
  await generateSpinnerYarnProcess();
  await generateSpinnerSale();
  await generatePendingSpinnerBale();
  await generateSpinnerLintCottonStock();
  await exportSpinnerGreyOutReport();
  await exportGinHeapReport();
  await exportGinnerProcessGreyOutReport();
  await exportSpinnerProcessGreyOutReport();
  await generateSpinnerYarnOrder();
  await generateConsolidatedDetailsFarmerGinner();
  await generateGinnerDetails();
  
  console.log('Cron Job Completed to execute all reports.');
}
//----------------------------------------- Spinner Reports ------------------------//

const exportSpinnerGreyOutReport = async () => {
  const maxRowsPerWorksheet = 500000; // Maximum number of rows per worksheet in Excel

  try {
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: fs.createWriteStream("./upload/spinner-grey-out-report-test.xlsx"),
      useStyles: true,
    });
    let worksheetIndex = 0;
    const batchSize = 5000;
    let offset = 0;
    const whereCondition: any = {};

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
        include: [
          {
            model: Country,
            as: "country",
          },
          {
            model: State,
            as: "state",
          },
        ],
      },
    ];

    whereCondition[Op.or] = [
      { greyout_status: true},
      {
        greyout_status: false,
        greyed_out_qty: { [Op.gt]: 0 }
      },
    ];
  

    interface Totals{
      total_lint_quantity: 0,
    };

    
    let totals: Totals = {
      total_lint_quantity: 0,
    };


    const AddTotalRow = (currentWorksheet: ExcelJS.Worksheet | undefined, totals : Totals) =>{

      if(currentWorksheet != undefined){
        const rowValues = [
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "Total",
          totals.total_lint_quantity,
        ];
        currentWorksheet?.addRow(rowValues).eachCell(cell=>cell.font={bold : true});
        let borderStyle = {
          top: {style:"thin"},
          left: {style:"thin"},
          bottom: {style:"thin"},
          right: {style:"thin"}
        };
  
        // Auto-adjust column widths based on content
        currentWorksheet?.columns.forEach((column: any) => {
          let maxCellLength = 0;
          column.eachCell({ includeEmpty: true }, (cell: any) => {
            const cellLength = (cell.value ? cell.value.toString() : "").length;
            maxCellLength = Math.max(maxCellLength, cellLength);
            cell.border = borderStyle;
          });
          column.width = Math.min(14, maxCellLength + 2); // Limit width to 30 characters
        });
       }
    };

  let currentWorksheet: ExcelJS.Worksheet| undefined = undefined;

  let hasNextBatch = true;
  while (hasNextBatch) {
    const rows  = await GinSales.findAll({
      where: whereCondition,
      include: include,
      attributes: [
        [Sequelize.col('"buyerdata"."country"."county_name"'), 'country_name'],
        [Sequelize.col('"buyerdata"."state"."state_name"'), 'state_name'],
        [Sequelize.col('"season"."name"'), 'season_name'],
        [Sequelize.literal('"ginner"."name"'), "ginner_name"],
        [Sequelize.col('"buyerdata"."name"'), 'spinner'],
        [Sequelize.col('invoice_no'), 'invoice_no'],
        [Sequelize.col('lot_no'), 'lot_no'],
        [Sequelize.col('reel_lot_no'), 'reel_lot_no'],
        [Sequelize.col('qty_stock'), 'qty_stock'],
        [Sequelize.col('greyed_out_qty'), 'greyed_out_qty'],
        [Sequelize.col('greyout_status'), 'greyout_status'],
        'status',
        [
          Sequelize.literal(`
            CASE 
              WHEN greyout_status = true THEN qty_stock
              ELSE greyed_out_qty
            END
          `),
          "lint_greyout_qty",
        ],
      ],
      raw: true,
      offset: offset,
      limit: batchSize,
      order: [['id', 'asc']]
    });


    if (rows.length === 0) {
      hasNextBatch = false;
      break;
    }
   
    if (offset % maxRowsPerWorksheet === 0) {
      
      if(currentWorksheet){
        AddTotalRow(currentWorksheet, totals);
      }
      totals = { total_lint_quantity: 0 };

      worksheetIndex++;
    }
   
    
    for await (const [index, item] of rows.entries()) {
      
      const rowValues = [
        offset + index + 1,
        item?.country_name ? item?.country_name : "",
        item?.state_name ? item?.state_name : "",
        item?.season_name ? item?.season_name : "",
        item?.ginner_name ? item?.ginner_name : "",
        item.spinner ? item.spinner : "",
        item.reel_lot_no ? item.reel_lot_no : "",
        item.invoice_no ? item.invoice_no : "",
        item?.lot_no ? item?.lot_no : "",
        item.lint_greyout_qty ? Number(formatDecimal( item.lint_greyout_qty)) : 0
      ];
      
      totals.total_lint_quantity += Number(formatDecimal( item.lint_greyout_qty));
      let currentWorksheet = workbook.getWorksheet(`Spinner Lint Process Greyout Report ${worksheetIndex}`);
      if (!currentWorksheet) {
        currentWorksheet = workbook.addWorksheet(`Spinner Lint Process Greyout Report ${worksheetIndex}`);
       /* if (worksheetIndex == 1) {
          currentWorksheet.mergeCells("A1:H1");
          const mergedCell = currentWorksheet.getCell("A1");
          mergedCell.value = "CottonConnect | Spinner Lint Process Greyout Report";
          mergedCell.font = { bold: true };
          mergedCell.alignment = { horizontal: "center", vertical: "middle" };
        } */
        // Set bold font for header row
        const headerRow = currentWorksheet.addRow([
          "Sr No.",
          "Country",
          "State",
          "Season",
          "Ginner Name",
          "Spinner Name",
          "REEL Lot No",
          "Invoice Number",
          "Bale Lot No",
          "Total Lint Greyout Quantity (KGs)",
        ]);
        headerRow.font = { bold: true };
      }
      currentWorksheet.addRow(rowValues);
    }
    offset += batchSize;
  }

  let currentsheet = workbook.getWorksheet(`Spinner Lint Process Greyout Report ${worksheetIndex}`);
  if(currentsheet){
    AddTotalRow(currentsheet, totals);
  }

  await workbook.commit()
  .then(() => {
    // Rename the temporary file to the final filename
    fs.renameSync("./upload/spinner-grey-out-report-test.xlsx", './upload/spinner-grey-out-report.xlsx');
    console.log('spinner-grey-out report generation completed.');
  })
  .catch(error => {
    console.log('Failed generation?.');
    throw error;
  });
  } catch (error) {
    console.error('Error appending data:', error);
  }
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
      include: [
        {
          model: Country,
          as: "country",
        },
        {
          model: State,
          as: "state",
        }
      ]
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
  // worksheet.mergeCells("A1:M1");
  // const mergedCell = worksheet.getCell("A1");
  // mergedCell.value = "CottonConnect | Heap Report";
  // mergedCell.font = { bold: true };
  // mergedCell.alignment = { horizontal: "center", vertical: "middle" };
  // Set bold font for header row
  const headerRow = worksheet.addRow([
    "Sr No.",
    "Country",
    "State",
    "Created Date",
    "Season",
    "Gin heap no.",
    "REEL heap no.",
    "Ginner Name",
    "Village Name",
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

  let weightSum = 0;

  // // Append data to worksheet
  for await (const [index, item] of rows.entries()) {
    if (item.dataValues?.weighbridge_village) {
      const villageIds = item.dataValues.weighbridge_village && item.dataValues.weighbridge_village
        .split(",")
        .map((id: string) => id.trim()) 
        .filter((id: string) => id !== ""); 

        if(villageIds.length > 0) {
              const villages = await Village.findAll({
                where: { id: { [Op.in]: villageIds } },
                attributes: ["id", "village_name"],
              });

      const uniqueVillageNames = [...new Set(villages.map((v:any) => v.village_name))];
      item.dataValues.village_names = uniqueVillageNames.join(", ");
    }
    }

    weightSum += item.dataValues.estimated_heap ? Number(item.dataValues.estimated_heap) : 0;

    const rowValues = Object.values({
      index: index + 1,
      country: item.dataValues.ginner.country.county_name,
      state: item.dataValues.ginner.state.state_name,
      created_date: item.dataValues.createdAt
        ? item.dataValues.createdAt
        : "",
      season: item.dataValues.season.name ? item.dataValues.season.name : "",
      ginner_heap_no: item.dataValues.ginner_heap_no ? item.dataValues.ginner_heap_no : "",
      reel_heap_no: item.dataValues.reel_heap_no
        ? item.dataValues.reel_heap_no
        : "",
       ginner_name: item.dataValues.ginner.name,
      village_name: item.dataValues.village_names,
      heap_weight: item.dataValues.estimated_heap
        ? Number(item.dataValues.estimated_heap)
        : 0,
      heap_starting_date: item.dataValues.heap_starting_date ? item.dataValues.heap_starting_date : "",
      heap_ending_date: item.dataValues.heap_ending_date ? item.dataValues.heap_ending_date : "",
      weighbridge_vehicle_no: item.weighbridge_vehicle_no
    });
    worksheet.addRow(rowValues);
  }

  const rowValues = Object.values({
    index: "", country: "", state: "", created_date:"", season: "", ginner_heap_no:"",
    reel_heap_no:"", ginner_name:"", village_name: "Total", 
    heap_weight:Number(formatDecimal(weightSum)),
    heap_starting_date: "", heap_ending_date: "", weighbridge_vehicle_no:""
  });
  worksheet.addRow(rowValues).eachCell((cell, colNumber) => { cell.font={bold:true}});;

  const borderStyle = {
    top: { style: "thin" },
    bottom: { style: "thin" },
    left: { style: "thin" },
    right: { style: "thin" },
  };

  // Auto-adjust column widths based on content
  worksheet.columns.forEach((column: any) => {
    let maxCellLength = 0;
    column.eachCell({ includeEmpty: true }, (cell: any) => {
      const cellLength = (cell.value ? cell.value.toString() : "").length;
      maxCellLength = Math.max(maxCellLength, cellLength);
      cell.border = borderStyle;

    });
    column.width = Math.min(14, maxCellLength + 2);
  });

  // Save the workbook
  await workbook.xlsx.writeFile(excelFilePath);
}

const exportGinnerProcessGreyOutReport = async () => {
  const maxRowsPerWorksheet = 500000; // Maximum number of rows per worksheet in Excel

  try {
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: fs.createWriteStream("./upload/ginner-process-grey-out-report-test.xlsx"),
      useStyles: true,
    });
    let worksheetIndex = 0;
    const batchSize = 5000;
    let offset = 0;

    interface Totals{
      total_lint_quantity: 0,
    };
   
    let totals: Totals = {
      total_lint_quantity: 0,
    };


    const AddTotalRow = (currentWorksheet: ExcelJS.Worksheet | undefined, totals : Totals) =>{

      if(currentWorksheet != undefined){
        const rowValues = [
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "Total", 
          totals.total_lint_quantity,
        ];
        currentWorksheet?.addRow(rowValues).eachCell(cell=>cell.font={bold : true});
        let borderStyle = {
          top: {style:"thin"},
          left: {style:"thin"},
          bottom: {style:"thin"},
          right: {style:"thin"}
        };
  
        // Auto-adjust column widths based on content
        currentWorksheet?.columns.forEach((column: any) => {
          let maxCellLength = 0;
          column.eachCell({ includeEmpty: true }, (cell: any) => {
            const cellLength = (cell.value ? cell.value.toString() : "").length;
            maxCellLength = Math.max(maxCellLength, cellLength);
            cell.border = borderStyle;
          });
          column.width = Math.min(14, maxCellLength + 2); // Limit width to 30 characters
        });
 
      }
      
    };

  let currentWorksheet: ExcelJS.Worksheet| undefined = undefined;

  let hasNextBatch = true;
  while (hasNextBatch) {
    let dataQuery = `
        SELECT 
          gp.id, 
          gp.ginner_id, 
          gp.season_id, 
          s.name AS season_name, 
          g.name AS ginner_name, 
          gp.lot_no, 
          gp.reel_lot_no, 
          gp.press_no, 
          gp.no_of_bales,
          gp.greyout_status, 
          gp.scd_verified_status,
          gp.verification_status,
          c.county_name AS country_name,
          st.state_name AS state_name,
          COALESCE(
            SUM(
              CASE
                WHEN gb.old_weight IS NOT NULL THEN CAST(gb.old_weight AS DOUBLE PRECISION)
                ELSE CAST(gb.weight AS DOUBLE PRECISION)
              END
              ), 0
            ) AS lint_quantity,
          COALESCE(
              SUM(
                CAST(gb.old_weight AS DOUBLE PRECISION)
              ), 0
            ) AS old_weight_total,
          MIN(gb.bale_no) AS pressno_from,
          MAX(LPAD(gb.bale_no, 10, ' ')) AS pressno_to
        FROM gin_processes gp
        LEFT JOIN "gin-bales" gb ON gb.process_id = gp.id AND gb.sold_status = false
        LEFT JOIN seasons s ON gp.season_id = s.id
        LEFT JOIN ginners g ON gp.ginner_id = g.id
        LEFT JOIN countries c ON c.id = g.country_id
        LEFT JOIN states st ON st.id = g.state_id
        WHERE 
          (
            gp.greyout_status = true
            OR
            (
              gp.scd_verified_status = true AND gb.scd_verified_status IS NOT TRUE
            )
            OR
            (
              gp.scd_verified_status = false AND gb.scd_verified_status IS FALSE
            )
          )
        GROUP BY gp.id, gp.ginner_id, gp.season_id, gp.lot_no, gp.reel_lot_no, gp.press_no, s.name, g.name, gp.no_of_bales,gp.greyout_status, gp.scd_verified_status,gp.verification_status,c.county_name,st.state_name
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
      if(currentWorksheet){
        AddTotalRow(currentWorksheet, totals);
      
      }
      totals = {total_lint_quantity: 0};
      
      worksheetIndex++;
    }


    for await (const [index, item] of rows.entries()) {
      const rowValues = [
        offset + index + 1,
        item?.country_name ? item?.country_name : "",
        item?.state_name ? item?.state_name : "",
        item?.season_name ? item?.season_name : "",
        item?.ginner_name ? item?.ginner_name : "",
        item.reel_lot_no ? item.reel_lot_no : "",
        item.press_no?.toLowerCase().trim() !== "nan-nan"  ? item.press_no : item?.pressno_from && item?.pressno_to ? item?.pressno_from+ ' - '+item?.pressno_to: '',
        item?.lot_no ? item?.lot_no : "",
        item.lint_quantity ? Number(formatDecimal( item.lint_quantity)) : 0
      ];
      
      totals.total_lint_quantity+= Number(formatDecimal( item.lint_quantity));

      let currentWorksheet = workbook.getWorksheet(`Ginner Process Grey Out Report ${worksheetIndex}`);
      if (!currentWorksheet) {
        currentWorksheet = workbook.addWorksheet(`Ginner Process Grey Out Report ${worksheetIndex}`);
        /*if (worksheetIndex == 1) {
          currentWorksheet.mergeCells("A1:G1");
          const mergedCell = currentWorksheet.getCell("A1");
          mergedCell.value = "CottonConnect | Ginner Process Grey Out Report";
          mergedCell.font = { bold: true };
          mergedCell.alignment = { horizontal: "center", vertical: "middle" };
        } */
        // Set bold font for header row
        const headerRow = currentWorksheet.addRow([
          "Sr No.",
          "Country",
          "State",
          "Season",
          "Ginner Name",
          "REEL Lot No",
          "Press Number",
          "Bale Lot No",
          "Total Lint Greyout Quantity (Kgs)",
        ]);
        headerRow.font = { bold: true };
      }
      currentWorksheet.addRow(rowValues);
    }
    offset += batchSize;
  }

  let currentsheet = workbook.getWorksheet(`Ginner Process Grey Out Report ${worksheetIndex}`);
  if(currentsheet){
    AddTotalRow(currentsheet, totals);
  }
  await workbook.commit()
  .then(() => {
    // Rename the temporary file to the final filename
    fs.renameSync("./upload/ginner-process-grey-out-report-test.xlsx", './upload/ginner-process-grey-out-report.xlsx');
    console.log('ginner-process-grey-out report generation completed.');
  })
  .catch(error => {
    console.log('Failed generation?.');
    throw error;
  });
  } catch (error) {
    console.error('Error appending data:', error);
  }
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
      include: [
        {
          model: Country,
          as: "country",
        },
        {
          model: State,
          as: "state",
        },
    ],
    },
  ];

  // Create the excel workbook file
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sheet1");
  /*worksheet.mergeCells("A1:G1");
  const mergedCell = worksheet.getCell("A1");
  mergedCell.value = "CottonConnect | Spinner Yarn Greyout Report";
  mergedCell.font = { bold: true };
  mergedCell.alignment = { horizontal: "center", vertical: "middle" }; */
  // Set bold font for header row
  const headerRow = worksheet.addRow([
    "Sr No.",
    "Country",
    "State",
    "Season",
    "Spinner Name",
    "REEL Lot No",
    "Spin Lot No",
    "Total Yarn Greyout Quantity (KGs)",
  ]);
  headerRow.font = { bold: true };

  // //fetch data with pagination

  const { count, rows }: any = await SpinProcess.findAndCountAll({
    where: { greyout_status: true },
    include: include,
    attributes: [
      [Sequelize.col('"spinner"."country"."county_name"'), 'country_name'],
      [Sequelize.col('"spinner"."state"."state_name"'), 'state_name'],
      [Sequelize.col('"season"."name"'), 'season_name'],
      [Sequelize.col('"season"."name"'), 'season_name'],
      [Sequelize.col('"spinner"."name"'), 'spinner_name'],
      [Sequelize.col('batch_lot_no'), 'batch_lot_no'],
      [Sequelize.col('reel_lot_no'), 'reel_lot_no'],
      [Sequelize.col('qty_stock'), 'qty_stock'],
    ],
  });

  // // Append data to worksheet
  let total_lint_quantity = 0 ;
  for await (const [index, item] of rows.entries()) {
    total_lint_quantity += item.dataValues.qty_stock ? Number(item.dataValues.qty_stock) : 0;
    const rowValues = Object.values({
      index: index + 1,
      country:item.dataValues.country_name ? item.dataValues.country_name : "",
      state:item.dataValues.state_name ? item.dataValues.state_name : "",
      season: item.dataValues.season_name ? item.dataValues.season_name : "",
      spinner: item.dataValues.spinner_name ? item.dataValues.spinner_name : "",
      reel_lot_no: item.dataValues.reel_lot_no ? item.dataValues.reel_lot_no : "",
      batch_lot_no: item.dataValues.batch_lot_no ? item.dataValues.batch_lot_no : "",
      lint_quantity: item.dataValues.qty_stock ? item.dataValues.qty_stock : 0,
    });
    worksheet.addRow(rowValues);
  }
  const rowValues = Object.values({
    index: "", country: "", state: "", season:"",spinner:"",
    reel_lot_no:"", batch_lot_no: "Total", 
    lint_quantity:Number(formatDecimal(total_lint_quantity)),
   
  });

  worksheet.addRow(rowValues).eachCell(cell  => { cell.font={bold:true}});

  const borderStyle = {
    top: { style: "thin" },
    bottom: { style: "thin" },
    left: { style: "thin" },
    right: { style: "thin" },
  };
  // Auto-adjust column widths based on content
  worksheet.columns.forEach((column: any) => {
    let maxCellLength = 0;
    column.eachCell({ includeEmpty: true }, (cell: any) => {
      const cellLength = (cell.value ? cell.value.toString() : "").length;
      maxCellLength = Math.max(maxCellLength, cellLength);
      cell.border = borderStyle;
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
      stream: fs.createWriteStream("./upload/spinner-lint-cotton-stock-report-test.xlsx"),
      useStyles: true,

    });
    let worksheetIndex = 0;
    const batchSize = 5000;
    let offset = 0;
    const whereCondition: any = [];


    whereCondition.push(`gs.status IN ('Sold', 'Partially Accepted', 'Partially Rejected')`)
    whereCondition.push(`gs.greyout_status IS NOT TRUE`)
    whereCondition.push(`gs.qty_stock > 0`);

    const whereClause = whereCondition.length > 0 ? `WHERE ${whereCondition.join(' AND ')}` : '';


    interface Totals{
      cotton_procured: 0,
      cotton_stock: 0,
      greyed_out_qty: 0,
      cotton_consumed: 0,
    };

    
    let totals: Totals = {
      cotton_procured: 0,
      cotton_stock: 0,
      greyed_out_qty: 0,
      cotton_consumed: 0,
    };


    const AddTotalRow = (currentWorksheet: ExcelJS.Worksheet | undefined, totals : Totals) =>{

      if(currentWorksheet != undefined){
        const rowValues = [
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "Total",
          totals.cotton_procured,
          totals.cotton_stock,
          totals.greyed_out_qty,
          totals.cotton_consumed,
        ];
        currentWorksheet?.addRow(rowValues).eachCell(cell=>cell.font={bold : true});
        let borderStyle = {
          top: {style:"thin"},
          left: {style:"thin"},
          bottom: {style:"thin"},
          right: {style:"thin"}
        };
  
        // Auto-adjust column widths based on content
        currentWorksheet?.columns.forEach((column: any) => {
          let maxCellLength = 0;
          column.eachCell({ includeEmpty: true }, (cell: any) => {
            const cellLength = (cell.value ? cell.value.toString() : "").length;
            maxCellLength = Math.max(maxCellLength, cellLength);
            cell.border = borderStyle;
          });
          column.width = Math.min(14, maxCellLength + 2); // Limit width to 30 characters
        });
 
      }
      
    };

    let currentWorksheet: ExcelJS.Worksheet| undefined = undefined;


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
        ),
        gin_sale_date as(
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
            sp.country_id as country_id,
            sp.state_id as state_id,             
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
            "spinner_name" ASC
        LIMIT :limit OFFSET :offset
        )
        Select 
          gsd.*,
          c.county_name as country,
          s.state_name as state
        from 
          gin_sale_date gsd
        left join
          countries c on gsd.country_id = c.id
        left join
          states s on gsd.state_id = s.id
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
        if(currentWorksheet){
          AddTotalRow(currentWorksheet, totals);
        
        }
        totals = {cotton_procured: 0, cotton_stock: 0, greyed_out_qty: 0, cotton_consumed: 0};
        
        worksheetIndex++;
      }



      for await (const [index, spinner] of rows.entries()) {
        let cotton_consumed = Number(spinner?.accepted_total_qty) > (Number(spinner?.qty_stock) + Number(spinner?.greyed_out_qty)) ? Number(formatDecimal(spinner?.accepted_total_qty)) - (Number(formatDecimal(spinner?.qty_stock)) + Number(formatDecimal(spinner?.greyed_out_qty))) : 0;

        const rowValues = [
          offset + index + 1,
          spinner?.country ? spinner?.country : "",
          spinner?.state ? spinner?.state : "",
          spinner?.date ? moment(spinner.date).format('DD-MM-YYYY') : "",
          spinner?.season_name ? spinner?.season_name : "",
          spinner?.ginner_name ? spinner?.ginner_name : "",
          spinner?.spinner_name ? spinner?.spinner_name : "",
          spinner?.reel_lot_no ? spinner?.reel_lot_no : "",
          spinner?.invoice_no ? spinner?.invoice_no : "",
          spinner?.lot_no ? spinner?.lot_no : "",
          spinner?.accepted_total_qty ? Number(formatDecimal(spinner?.accepted_total_qty)) : 0,
          spinner?.qty_stock ? Number(formatDecimal(spinner?.qty_stock)) : 0,
          spinner?.greyed_out_qty ? Number(formatDecimal(spinner?.greyed_out_qty)) : 0,
          cotton_consumed,
        ];

        
        totals.cotton_procured +=  Number(formatDecimal(spinner?.accepted_total_qty)) ;
        totals.cotton_stock += Number(formatDecimal(spinner?.qty_stock));
        totals.greyed_out_qty +=  Number(formatDecimal(spinner?.greyed_out_qty));
        totals.cotton_consumed += Number(formatDecimal(cotton_consumed));


        let currentWorksheet = workbook.getWorksheet(`Lint Cotton Stock Report ${worksheetIndex}`);
        if (!currentWorksheet) {
          currentWorksheet = workbook.addWorksheet(`Lint Cotton Stock Report ${worksheetIndex}`);
          // if (worksheetIndex == 1) {
          //   currentWorksheet.mergeCells("A1:L1");
          //   const mergedCell = currentWorksheet.getCell("A1");
          //   mergedCell.value = "CottonConnect | Spinner Lint Cotton Stock Report";
          //   mergedCell.font = { bold: true };
          //   mergedCell.alignment = { horizontal: "center", vertical: "middle" };
          // }
          // Set bold font for header row
          const headerRow = currentWorksheet.addRow([
            "Sr No.",
            "Country",
            "State",
            "Created Date",
            "Season",
            "Ginner Name",
            "Spinner Name",
            "Reel Lot No",
            "Invoice No",
            "Bale Lot No",
            "Total Lint Cotton Received (Kgs)",
            "Total Lint Cotton in Stock (Kgs)",
            "Lint Cotton Greyed Out after Verification (Kgs)",
            "Total Lint Cotton Consumed (Kgs)",
          ]);
          headerRow.font = { bold: true };
        }
        currentWorksheet.addRow(rowValues);
      }

   

      offset += batchSize;
    }

    let currentsheet = workbook.getWorksheet(`Lint Cotton Stock Report ${worksheetIndex}`);
    if(currentsheet){
      AddTotalRow(currentsheet, totals);
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

      for (const [index, item] of farmers.entries()) {

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
            'S.No', 'Farmer Name', 'Farmer Code', 'Country', 'State', 'District', 'Block', 'Village',
            'Seasons', 'Farm Group', 'Brand Name', 'Programme Name', 'Total Agriculture Area', 'Estimated Yield (Kg/Ac)',
            'Total estimated Production', 'Cotton Total Area', 'Total Estimated Cotton', 'Tracenet Id', 'ICS Name', 'Certification Status'
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
          program: item.program,
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

      for (const [index, item] of farmer.entries()) {
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
          program: item["Program Name"],
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
          // transaction.total_estimated_cotton ? (Number(transaction.total_estimated_cotton) > Number(transaction.cotton_transacted) ? Number(transaction.total_estimated_cotton) - Number(transaction.cotton_transacted) : 0) : 0,
          transaction.available_cotton ? Number(transaction.available_cotton) : 0,
          transaction.rate ? Number(transaction.rate) : 0,
          transaction.program_name ? transaction.program_name : '',
          transaction.vehicle ? transaction.vehicle : '',
          transaction.payment_method ? transaction.payment_method : '',
          transaction.ginner_name ? transaction.ginner_name : '',
          transaction?.agent_first_name && ( transaction?.agent_last_name ? transaction?.agent_first_name + " " + transaction?.agent_last_name+ "-" + transaction?.agent_access_level : transaction?.agent_first_name+ "-" + transaction?.agent_access_level),
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
          tr.available_cotton,
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
          "ag"."firstName" AS agent_first_name,
          "ag"."lastName" AS agent_last_name,
          "ag"."access_level" AS agent_access_level
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
          "Transaction User Details",
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
                  sequelize.literal(`
                    CASE
                      WHEN "gin-bales"."old_weight" IS NOT NULL THEN CAST("gin-bales"."old_weight" AS DOUBLE PRECISION)
                      ELSE CAST("gin-bales"."weight" AS DOUBLE PRECISION)
                    END
                  `)
                ),
                0
              ),
              "total_qty",
            ]
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

        const processSale = await BaleSelection.findOne({
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
              "total_qty",
            ],
            [
              sequelize.fn("COUNT", Sequelize.literal("DISTINCT bale_id")),
              "no_of_bales",
            ],
          ],
          include: [
            {
              model: GinSales,
              as: "sales",
              attributes: [],
              include: [{
                model: Ginner,
                as: "ginner",
                attributes: [],
              }]
            },
            {
              model: GinBale,
              as: "bale",
              attributes: [],
              include: [{
                model: GinProcess,
                as: "ginprocess",
                attributes: [],
              }]
            },
          ],
          where: {
            "$bale.ginprocess.season_id$": farm.season_id,
            "$sales.status$": { [Op.in]: ['Pending', 'Pending for QR scanning', 'Partially Accepted', 'Partially Rejected', 'Sold'] },
            "$sales.buyer_ginner$": { [Op.is]: null }
          },
          group: ["bale.ginprocess.season_id"]
        })

        let ginToGinSale = await BaleSelection.findOne({
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
              "total_qty",
            ],
            [
              sequelize.fn("COUNT", Sequelize.literal("DISTINCT bale_id")),
              "no_of_bales",
            ],
          ],
          include: [
            {
              model: GinSales,
              as: "sales",
              attributes: [],
              include: [{
                model: Ginner,
                as: "ginner",
                attributes: [],
              }]
            },
            {
              model: GinBale,
              as: "bale",
              attributes: [],
              include: [{
                model: GinProcess,
                as: "ginprocess",
                attributes: [],
              }]
            },
          ],
          where: {
            "$bale.ginprocess.season_id$": farm.season_id,
            "$sales.status$": { [Op.in]: ['Pending', 'Pending for QR scanning', 'Partially Accepted', 'Partially Rejected', 'Sold'] },
            "$sales.buyer_ginner$": { [Op.not]: null },
            "$sales.buyer_type$": 'Ginner'
          },
          group: ["bale.ginprocess.season_id"]
        })

        let ginbaleGreyout= await GinBale.findOne({
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
              "total_qty",
            ],
            [
              sequelize.fn("COUNT", Sequelize.literal('DISTINCT "gin-bales"."id"')),
              "no_of_bales",
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
            "$ginprocess.season_id$": farm.season_id, 
             sold_status: false ,
            [Op.or]: [
               {
                  [Op.and]: [
                    { "$ginprocess.greyout_status$": true },
                    { is_all_rejected: null }
                  ]
                },
              {
                [Op.and]: [
                  { "$ginprocess.scd_verified_status$": true },
                  { "$gin-bales.scd_verified_status$": { [Op.not]: true } }
                ]
              },
              {
                [Op.and]: [
                  { "$ginprocess.scd_verified_status$": false },
                  { "$gin-bales.scd_verified_status$": { [Op.is]: false } }
                ]
              }
            ]
          },
          group: ["ginprocess.season_id"],
        });
  
        const ginToGinReceive = await GinToGinSale.findOne({
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
              "total_qty",
            ],
            [
              sequelize.fn("COUNT", Sequelize.literal('DISTINCT "bale"."id"')),
              "no_of_bales",
            ],
          ],
          include: [
            {
              model: GinSales,
              as: "ginsales",
              attributes: [],
              include: [
                {
                  model: Ginner,
                  as: "ginner",
                  attributes: [],
                },
              ]
            },
            {
              model: GinBale,
              as: "bale",
              attributes: [],
            },
          ],
          where: {
            "$ginsales.season_id$": farm.season_id,
            "$ginsales.status$": { [Op.in]: ['Partially Accepted', 'Partially Rejected', 'Sold'] },
            gin_accepted_status: { [Op.is]: true },
            "$ginsales.buyer_type$": 'Ginner'
          },
          group: ["ginsales.season_id"]
        })

        // Populate obj with calculated values based on retrieved data
        obj.estimated_seed_cotton = (farm.dataValues.estimated_seed_cotton ?? 0) / 1000;
        obj.estimated_lint = ((farm.dataValues.estimated_seed_cotton ?? 0) * 35) / 100 / 1000;
        obj.procurement_seed_cotton = (procurementRow?.dataValues?.procurement_seed_cotton ?? 0) / 1000;
        obj.procurement = (farm.dataValues.estimated_seed_cotton > 0) ? Math.round((procurementRow?.dataValues?.procurement_seed_cotton / farm.dataValues.estimated_seed_cotton) * 100) : 0;
        obj.procured_lint_cotton = ((procurementRow?.dataValues?.procurement_seed_cotton ?? 0) * 35) / 100 / 1000;
        obj.no_of_bales = processGin?.dataValues?.no_of_bales ? Number(processGin?.dataValues?.no_of_bales) : 0;
        obj.total_qty_lint_produced = (ginBales ? ginBales?.dataValues?.total_qty / 1000 : 0);
        obj.greyout_bales = ginbaleGreyout?.dataValues.no_of_bales ? Number(ginbaleGreyout?.dataValues.no_of_bales) : 0;
        obj.greyout_qty = ginbaleGreyout
          ? (ginbaleGreyout.dataValues.total_qty ?? 0) / 1000
          : 0;
        obj.total_bales_transfered = ginToGinSale?.dataValues.no_of_bales ? Number(ginToGinSale?.dataValues.no_of_bales) : 0;
        obj.total_qty_lint_transfered = ginToGinSale
          ? (ginToGinSale.dataValues.total_qty ?? 0) / 1000
          : 0;
        obj.total_bales_received = ginToGinReceive?.dataValues.no_of_bales ? Number(ginToGinReceive?.dataValues.no_of_bales) : 0;
        obj.total_qty_lint_received = ginToGinReceive
          ? (ginToGinReceive.dataValues.total_qty ?? 0) / 1000
          : 0;
        obj.sold_bales = processSale?.dataValues?.no_of_bales ? Number(processSale?.dataValues?.no_of_bales) : 0;
        obj.average_weight = (ginBales?.dataValues?.total_qty ?? 0) / (obj.no_of_bales ?? 0);
        obj.total_qty_sold_lint = (processSale?.dataValues?.total_qty ?? 0) / 1000;
        obj.balace_stock =
          (obj.no_of_bales + obj.total_bales_received) > (obj.sold_bales + obj.total_bales_transfered + obj.greyout_bales) ? Number((obj.no_of_bales + obj.total_bales_received) - (obj.sold_bales + obj.total_bales_transfered + obj.greyout_bales)) : 0;
        obj.balance_lint_quantity =
          (obj.total_qty_lint_produced + obj.total_qty_lint_received) > (obj.total_qty_sold_lint + obj.total_qty_lint_transfered + obj.greyout_qty) 
            ? (obj.total_qty_lint_produced + obj.total_qty_lint_received) - (obj.total_qty_sold_lint + obj.total_qty_lint_transfered + obj.greyout_qty)
            : 0;

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
          Number(formatDecimal(obj.balance_lint_quantity)),
          Number(obj.greyout_bales),
          Number(formatDecimal(obj.greyout_qty)),
          Number(obj.total_bales_received),
          Number(formatDecimal(obj.total_qty_lint_received)),
          Number(obj.total_bales_transfered),
          Number(formatDecimal(obj.total_qty_lint_transfered))
        ];

        let currentWorksheet = workbook.getWorksheet(`Procurement Report ${worksheetIndex}`);
        if (!currentWorksheet) {
          currentWorksheet = workbook.addWorksheet(`Procurement Report ${worksheetIndex}`);
          if (worksheetIndex == 1) {
            currentWorksheet.mergeCells('A1:T1');
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
            "No. of Bales Greyed Out",
            "Total Quantity of Lint Greyed Out (MT)",
            "No. of Bales Received",
            "Total Quantity of Lint Received (MT)",
            "No. of Bales Transfered",
            "Total Quantity of Lint Transfered (MT)",
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
      stream: fs.createWriteStream("./upload/pscp-procurement-sell-live-tracker-test.xlsx"),
      useStyles: true,
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
            (
              SELECT STRING_AGG(p.program_name, ', ')
              FROM programs p
              WHERE p.id = ANY(g.program_id)
            ) AS program_name
          FROM
            ginners g
            JOIN states s ON g.state_id = s.id
            JOIN countries c ON g.country_id = c.id
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
              AND t.status = 'Sold'
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
          gin_bale_greyout_data AS (
            SELECT
              gp.ginner_id,
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
            JOIN gin_processes gp ON gb.process_id = gp.id
            JOIN filtered_ginners ON gp.ginner_id = filtered_ginners.id
            WHERE
              gp.program_id = ANY (filtered_ginners.program_id)
              AND
            gb.sold_status = FALSE AND (
              (
                gp.greyout_status = TRUE AND  
                gb.is_all_rejected IS NULL
              )
              OR (
                gp.scd_verified_status = TRUE AND
                gb.scd_verified_status IS NOT TRUE
              )
              OR (
                gp.scd_verified_status = FALSE AND
                gb.scd_verified_status IS FALSE
              )
              )
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
                    AND buyer_ginner IS NULL
                GROUP BY
                    gs.ginner_id
            ),
          gin_to_gin_sales_data AS (
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
                      ) AS lint_qty
                  FROM
                      "gin-bales" gb
                  LEFT JOIN 
                    bale_selections bs ON gb.id = bs.bale_id
                  LEFT JOIN 
                      gin_sales gs ON gs.id = bs.sales_id
                  JOIN filtered_ginners ON gs.ginner_id = filtered_ginners.id
                  LEFT JOIN gin_processes gp ON gb.process_id = gp.id
                  WHERE
                      gs.program_id = ANY (filtered_ginners.program_id)
                      AND gs.status in ('Pending', 'Pending for QR scanning', 'Partially Accepted', 'Partially Rejected','Sold')
                      AND gs.buyer_ginner IS NOT NULL
                      AND gs.buyer_type = 'Ginner'
                  GROUP BY
                      gs.ginner_id
              ),
          gin_to_gin_recieved_data AS (
                  SELECT 
                    filtered_ginners.id AS ginner_id,
                    COUNT(gb.id) AS no_of_bales,
                    COALESCE(
                      SUM(
                        CAST(gb.weight AS DOUBLE PRECISION)
                      ), 0
                    ) AS lint_qty
                  FROM 
                    gin_to_gin_sales gtg
                  JOIN
                    gin_sales gs ON gtg.sales_id = gs.id
                  JOIN 
                    "gin-bales" gb ON gtg.bale_id = gb.id
                  JOIN 
                    filtered_ginners ON gs.buyer_ginner = filtered_ginners.id
                  WHERE
                    gs.program_id = ANY (filtered_ginners.program_id)
                    AND gs.status IN ('Sold', 'Partially Accepted', 'Partially Rejected')
                    AND gtg.gin_accepted_status = true
                    AND gs.buyer_type ='Ginner'
                  GROUP BY 
                    gs.id, filtered_ginners.id
              ),
          gin_to_be_submitted_data AS (
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
                LEFT JOIN gin_processes gp ON gb.process_id = gp.id
                WHERE
                    gs.program_id = ANY (filtered_ginners.program_id)
                    AND gs.status in ('To be Submitted')
                GROUP BY
                    gs.ginner_id
            ),
          expected_cotton_data AS (
            SELECT
              gv.ginner_id,
              COALESCE(SUM(CAST("farms"."total_estimated_cotton"AS DOUBLE PRECISION)), 0) AS expected_seed_cotton
              FROM "ginner_allocated_villages" as gv
                      LEFT JOIN 
                            "villages" AS "farmer->village" ON "gv"."village_id" = "farmer->village"."id" 
                      LEFT JOIN 
                            "farmers" AS "farmer" ON "farmer->village"."id" = "farmer"."village_id" and "farmer"."brand_id" ="gv"."brand_id"
                      LEFT JOIN 
                            "farms" as "farms" on farms.farmer_id = "farmer".id and farms.season_id = gv.season_id
                      LEFT JOIN 
                            "seasons" AS "season" ON "gv"."season_id" = "season"."id"
            LEFT JOIN filtered_ginners ON gv.ginner_id = filtered_ginners.id
            WHERE
              "farmer".program_id = ANY (filtered_ginners.program_id)
            GROUP BY
              gv.ginner_id
          ),
          expected_lint_cotton_data AS (
            SELECT
              gec.ginner_id,
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
          COALESCE(elc.expected_lint, 0) AS expected_lint,
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
          COALESCE(gb.total_qty, 0) / 1000 AS total_qty_lint_produced,
          COALESCE(gs.no_of_bales, 0) AS sold_bales,
          COALESCE(gbg.no_of_bales, 0) AS greyout_bales,
          COALESCE(gbg.total_qty, 0) / 1000 AS greyout_qty,
          COALESCE(gtg.no_of_bales, 0) AS total_bales_transfered,
          COALESCE(gtg.lint_qty, 0) / 1000 AS total_qty_lint_transfered,
          COALESCE(gtgr.no_of_bales, 0) AS total_bales_received,
          COALESCE(gtgr.lint_qty, 0) / 1000 AS total_qty_lint_received,
          CASE
            WHEN COALESCE(gp.no_of_bales, 0) != 0 THEN COALESCE(gb.total_qty, 0) / COALESCE(gp.no_of_bales, 0)
            ELSE 0
          END AS average_weight,
          COALESCE(gs.total_qty, 0) / 1000 AS total_qty_sold_lint,
          COALESCE(gtsg.no_of_bales, 0) AS bales_to_be_submitted,
          COALESCE(gtsg.total_qty, 0) / 1000 AS lint_qty_to_be_submitted,
          COALESCE(go.confirmed_lint_order, 0) AS order_in_hand,
          CAST((COALESCE(gp.no_of_bales, 0) + COALESCE(gtgr.no_of_bales, 0)) - (COALESCE(gs.no_of_bales, 0) + COALESCE(gbg.no_of_bales, 0) + COALESCE(gtg.no_of_bales, 0) + COALESCE(gtsg.no_of_bales, 0)) AS INTEGER) AS balace_stock,
          CAST(ROUND(
              CAST((COALESCE(gb.total_qty, 0) / 1000 + COALESCE(gtgr.lint_qty, 0) / 1000) - (COALESCE(gs.total_qty, 0) / 1000 + COALESCE(gbg.total_qty, 0) / 1000 + COALESCE(gtg.lint_qty, 0) / 1000 + COALESCE(gtsg.total_qty, 0) / 1000) AS NUMERIC), 
              2
          ) AS DOUBLE PRECISION) AS balance_lint_quantity,
             CASE
              WHEN COALESCE(gb.total_qty, 0) != 0 THEN
                CASE
                  -- Ignore minor floating-point precision differences
                  WHEN ABS(COALESCE(gs.total_qty, 0) - COALESCE(gb.total_qty, 0)) > 0.0001 
                  AND COALESCE(gs.total_qty, 0) > COALESCE(gb.total_qty, 0) THEN 
                    ROUND(
                      (
                        COALESCE(gs.total_qty::NUMERIC, 0) / COALESCE(gb.total_qty::NUMERIC, 0)
                      ) * 100, 2
                    )
                  ELSE ROUND(
                    (
                      COALESCE(gs.total_qty::NUMERIC, 0) / COALESCE(gb.total_qty::NUMERIC, 0)
                    ) * 100, 2
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
          LEFT JOIN expected_cotton_data ec ON fg.id = ec.ginner_id
          LEFT JOIN expected_lint_cotton_data elc ON fg.id = elc.ginner_id          
          LEFT JOIN ginner_order_data go ON fg.id = go.ginner_id
          LEFT JOIN gin_bale_greyout_data gbg ON fg.id = gbg.ginner_id
          LEFT JOIN gin_to_gin_sales_data gtg ON fg.id = gtg.ginner_id
          LEFT JOIN gin_to_gin_recieved_data gtgr ON fg.id = gtgr.ginner_id
          LEFT JOIN gin_to_be_submitted_data gtsg ON fg.id = gtsg.ginner_id
        ORDER BY
          fg.name ASC
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

      let totals = {
        expected_seed_cotton:0,
        expected_lint:0,
        procurement_seed_cotton:0,
        procurement:0,
        pending_seed_cotton:0,
        procured_lint_cotton_mt:0,
        no_of_bales:0,
        sold_bales:0,
        total_qty_sold_lint: 0,
        balace_stock:0,
        balance_lint_quantity:0,
        greyout_bales:0,
        greyout_qty:0,
        total_bales_received:0,
        total_qty_lint_received:0,
        total_bales_transfered:0,
        total_qty_lint_transfered:0,
        total_bales_to_be_submitted: 0,
        total_qty_lint_to_be_submitted: 0,
        ginner_sale_percentage:0,
        order_in_hand:0,
    };

      let index = 0;
      for await (const obj of data) {
        const rowValues = {
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
          greyout_bales: obj.greyout_bales ? Number(obj.greyout_bales) : 0,
          greyout_qty: obj.greyout_qty ? Number(formatDecimal(obj.greyout_qty)) : 0,
          total_bales_received: obj.total_bales_received ? Number(obj.total_bales_received) : 0,
          total_qty_lint_received: obj.total_qty_lint_received ? Number(formatDecimal(obj.total_qty_lint_received)) : 0,
          total_bales_transfered: obj.total_bales_transfered ? Number(obj.total_bales_transfered) : 0,
          total_qty_lint_transfered: obj.total_qty_lint_transfered ? Number(formatDecimal(obj.total_qty_lint_transfered)) : 0,
          bales_to_be_submitted: obj.bales_to_be_submitted ? Number(obj.bales_to_be_submitted) : 0,
          lint_qty_to_be_submitted: obj.lint_qty_to_be_submitted ? Number(formatDecimal(obj.lint_qty_to_be_submitted)) : 0,
          ginner_sale_percentage: Number(obj.ginner_sale_percentage) ?? 0,
        };
        index++;

        let currentWorksheet = workbook.getWorksheet(`Sheet${worksheetIndex}`);
        if (!currentWorksheet) {
          currentWorksheet = workbook.addWorksheet(`Sheet${worksheetIndex}`);
          // if (worksheetIndex == 1) {
          //   currentWorksheet.mergeCells("A1:X1");
          //   const mergedCell = currentWorksheet.getCell("A1");
          //   mergedCell.value = "CottonConnect | PSCP Procurement and Sell Live Tracker";
          //   mergedCell.font = { bold: true };
          //   mergedCell.alignment = { horizontal: "center", vertical: "middle" };
          // }
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
            "No. of Bales Greyed Out",
            "Lint Greyed Out (MT)",
            "No. of Bales Received",
            "Lint Received (MT)",
            "No. of Bales Transfered",
            "Lint Transfered (MT)",
            "No. of Bales in To be Submitted Status",
            "Lint Quantity in To be Submitted Status (MT)",
            "Ginner Sale %",
          ]);
          headerRow.font = { bold: true };
        }
        currentWorksheet.addRow(Object.values(rowValues));

        totals.expected_seed_cotton+= rowValues.expected_seed_cotton;
        totals.expected_lint+= rowValues.expected_lint;
        totals.procurement_seed_cotton+= rowValues.procurement_seed_cotton;
        totals.procurement+= rowValues.procurement;
        totals.pending_seed_cotton+= rowValues.pending_seed_cotton;
        totals.procured_lint_cotton_mt+= rowValues.procured_lint_cotton_mt;
        totals.no_of_bales+= rowValues.no_of_bales;
        totals.sold_bales+= rowValues.sold_bales;
        totals.total_qty_sold_lint += rowValues.total_qty_sold_lint;
        totals.balace_stock+= rowValues.balace_stock;
        totals.balance_lint_quantity+= rowValues.balance_lint_quantity;
        totals.greyout_bales+= rowValues.greyout_bales;
        totals.greyout_qty+= rowValues.greyout_qty;
        totals.total_bales_received+= rowValues.total_bales_received;
        totals.total_qty_lint_received+= rowValues.total_qty_lint_received;
        totals.total_bales_transfered+= rowValues.total_bales_transfered;
        totals.total_qty_lint_transfered+= rowValues.total_qty_lint_transfered;
        totals.total_bales_to_be_submitted += rowValues.bales_to_be_submitted;
        totals.total_qty_lint_to_be_submitted += rowValues.lint_qty_to_be_submitted;
        totals.ginner_sale_percentage+= rowValues.ginner_sale_percentage;
        totals.order_in_hand+= rowValues.order_in_hand?rowValues.order_in_hand : 0;

      }
      let currentWorksheet = workbook.getWorksheet(`Sheet${worksheetIndex}`);

      const rowValues = {
        index:"",
        name:"",
        country:"",
        state:"",
        program:"Total",
        expected_seed_cotton: totals.expected_seed_cotton,
        expected_lint: totals.expected_lint,
        procurement_seed_cotton: totals.procurement_seed_cotton,
        procurement: totals.procurement,
        pending_seed_cotton: totals.pending_seed_cotton,
        procured_lint_cotton_mt: totals.procured_lint_cotton_mt,
        no_of_bales: totals.no_of_bales,
        sold_bales: totals.sold_bales,
        total_qty_sold_lint: totals.total_qty_sold_lint,
        order_in_hand: totals.order_in_hand,
        balace_stock: totals.balace_stock,
        balance_lint_quantity: totals.balance_lint_quantity,
        greyout_bales: totals.greyout_bales,
        greyout_qty: totals.greyout_qty,
        total_bales_received: totals.total_bales_received,
        total_qty_lint_received: totals.total_qty_lint_received,
        total_bales_transfered: totals.total_bales_transfered,
        total_qty_lint_transfered: totals.total_qty_lint_transfered,
        total_bales_to_be_submitted: totals.total_bales_to_be_submitted,
          total_qty_lint_to_be_submitted: totals.total_qty_lint_to_be_submitted,
        ginner_sale_percentage: totals.ginner_sale_percentage,
      };

      currentWorksheet?.addRow(Object.values(rowValues)).eachCell(cell=>cell.font={bold:true});

      let borderStyle = {
        top: {style: "thin"},
        left: {style: "thin"},
        bottom: {style: "thin"},
        right: {style: "thin"}
      };

      // Auto-adjust column widths based on content
      currentWorksheet?.columns.forEach((column: any) => {
        let maxCellLength = 0;
        column.eachCell({ includeEmpty: true }, (cell: any) => {
          const cellLength = (cell.value ? cell.value.toString() : "").length;
          maxCellLength = Math.max(maxCellLength, cellLength);
          cell.border = borderStyle;
        });
        column.width = Math.min(24, maxCellLength + 2); // Limit width to 30 characters
      });

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

const exportVillageSeedCottonAllocation = async () => {
  const maxRowsPerWorksheet = 500000;
 
  try {

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: fs.createWriteStream("./upload/village-seed-cotton-allocation-test.xlsx")
    });
    let worksheetIndex = 1;
    let Count = 0;

    const data = await sequelize.query(
            `SELECT 
            "gv"."village_id" AS "village_id", 
            "farmer->village"."village_name" AS "village_name", 
            "season"."id" AS "season_id", 
            "season"."name" AS "season_name", 
            "gn"."name" as "ginner_name",
            "bk"."block_name" as "block_name",
            "ds"."district_name" as "district_name",
            COALESCE(SUM(CAST("farms"."total_estimated_cotton"AS DOUBLE PRECISION)), 0) AS "estimated_seed_cotton", 
            COALESCE(SUM(CAST("farms"."cotton_transacted" AS DOUBLE PRECISION)), 0) AS "procured_seed_cotton", 
            (COALESCE(SUM(CAST("farms"."total_estimated_cotton" AS DOUBLE PRECISION)), 0) - COALESCE(SUM(CAST("farms"."cotton_transacted" AS DOUBLE PRECISION)), 0)) AS "avaiable_seed_cotton" 
            FROM "ginner_allocated_villages" as gv
            LEFT JOIN 
                "villages" AS "farmer->village" ON "gv"."village_id" = "farmer->village"."id" 
            LEFT JOIN 
                "farmers" AS "farmer" ON "farmer->village"."id" = "farmer"."village_id"  and "farmer"."brand_id" ="gv"."brand_id"
            LEFT JOIN 
                "farms" as "farms" on farms.farmer_id = "farmer".id and farms.season_id = gv.season_id
            LEFT JOIN 
                "seasons" AS "season" ON "gv"."season_id" = "season"."id"
            LEFT JOIN 
                "ginners" AS gn ON "gn"."id" = "gv"."ginner_id" 
            LEFT JOIN 
                "blocks" AS bk ON "bk"."id" = "farmer->village"."block_id"
            LEFT JOIN 
                "districts" AS ds ON "ds"."id" = "bk"."district_id"
            GROUP BY 
                "gv"."village_id", "farmer->village"."id", "season"."id","gn".id,"bk".id,"ds".id
            ORDER BY "gv"."village_id" DESC 
        `,
        {
         type: sequelize.QueryTypes.SELECT
        }
      );

      if (Count === maxRowsPerWorksheet) {
        worksheetIndex++;
        Count = 0;
      }

      let index = 0;
      for await (const obj of data) {
        const rowValues = Object.values({
          index: index + 1,
          village_name: obj.village_name ? obj?.village_name : "",
          ginner_name: obj.ginner_name ? obj?.ginner_name : "",
          block_name: obj.block_name ? obj?.block_name : "",
          district_name: obj.district_name ? obj?.district_name : "",
          season_name: obj.season_name ? obj?.season_name : "",
          estimated_seed_cotton: obj.estimated_seed_cotton ? obj?.estimated_seed_cotton : "",
          procured_seed_cotton: obj.procured_seed_cotton ? obj?.procured_seed_cotton : "",
          avaiable_seed_cotton: obj?.avaiable_seed_cotton && obj?.avaiable_seed_cotton > 0 ? Number(obj?.avaiable_seed_cotton): 0,
          prct_procured_cotton: Number(obj?.estimated_seed_cotton) > Number(obj?.procured_seed_cotton) ? Number(formatDecimal((Number(obj?.procured_seed_cotton) / Number(obj?.estimated_seed_cotton)) * 100) ): 0,
        });
        index++;

        let currentWorksheet = workbook.getWorksheet(`Sheet${worksheetIndex}`);
        if (!currentWorksheet) {
          currentWorksheet = workbook.addWorksheet(`Sheet${worksheetIndex}`);
          if (worksheetIndex == 1) {
            currentWorksheet.mergeCells("A1:J1");
            const mergedCell = currentWorksheet.getCell("A1");
            mergedCell.value = "CottonConnect | Village Seed Cotton Allocation Report";
            mergedCell.font = { bold: true };
            mergedCell.alignment = { horizontal: "center", vertical: "middle" };
          }
          // Set bold font for header row
          const headerRow = currentWorksheet.addRow([
            "Sr No.",
            "Village Name ",
            "Ginner Name ",
            "Block Name ",
            "District Name ",
            "Season ",
            "Total Estimated Seed cotton of village (Kgs)",
            "Total Seed Cotton Procured from village (Kgs)",
            "Total Seed Cotton in Stock at village (Kgs)",
            "% Seed Cotton Procured",
          ]);
          headerRow.font = { bold: true };
        }
        currentWorksheet.addRow(rowValues).commit();
      }
    

    await workbook.commit()
      .then(() => {
        // Rename the temporary file to the final filename
        fs.renameSync("./upload/village-seed-cotton-allocation-test.xlsx", './upload/village-seed-cotton-allocation.xlsx');
        console.log('Village Seed Cotton Allocation Report completed.');
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
            tr.createdAt,
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
            "ag"."firstName" AS agent_first_name,
            "ag"."lastName" AS agent_last_name,
            "ag"."access_level" AS agent_access_level
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
          'Available Cotton (Kgs)', 'Price/KG(Local Currency)', 'Programme', 'Transport Vehicle No', 'Payment Method', 'Ginner Name', 'Transaction User Details'
        ]);
        headerRow.font = { bold: true };
      }

      // Append data to worksheet
      for await (const [index, item] of transactions.entries()) {
        const rowValues = Object.values({
          index: index + offset + 1,
          date: moment(item.createdAt).format('DD-MM-YYYY hh:mm:ss A'),
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
          // available_cotton: item.total_estimated_cotton ? (Number(item.total_estimated_cotton) > Number(item.cotton_transacted) ? Number(item.total_estimated_cotton) - Number(item.cotton_transacted) : 0) : 0,
          available_cotton: item.dataValues.available_cotton ? Number(item.dataValues.available_cotton) : 0,
          rate: Number(item.rate) ?? 0,
          program: item.program_name ? item.program_name : "",
          vehicle: item.vehicle ? item.vehicle : "",
          payment_method: item.payment_method ? item.payment_method : "",
          ginner: item.ginner_name ? item.ginner_name : "",
          agent: item?.agent_first_name && ( item?.agent_last_name ? item?.agent_first_name + " " + item?.agent_last_name+ "-" + item?.agent_access_level : item?.agent_first_name+ "-" + item?.agent_access_level),
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
      stream: fs.createWriteStream("./upload/ginner-summary-test.xlsx"),
      useStyles: true,

    });

    const batchSize = 5000;
    let worksheetIndex = 0;
    let offset = 0;
    let hasNextBatch = true;

    while (hasNextBatch) {
      let rows = await Ginner.findAll({
        attributes: ["id", "name", "address", "state_id", "country_id"],
        offset: offset,
        limit: batchSize,
        include: [
                  {
                    model: Country,
                    attributes:["id","county_name"],
                    as: "country",
                  },
                  {
                    model: State,
                    attributes:["id","state_name"],
                    as: "state"
                  }
                ],
        order:[["name", "ASC"]],
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
        // if (worksheetIndex == 1) {
        //   currentWorksheet.mergeCells('A1:S1');
        //   const mergedCell = currentWorksheet.getCell('A1');
        //   mergedCell.value = 'CottonConnect | Ginner Summary Report';
        //   mergedCell.font = { bold: true };
        //   mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        //   // Set bold font for header row

        // }
        // Set bold font for header row
        const headerRow = currentWorksheet.addRow([
          "S. No.", "Ginner Name", "Country", "State", "Total seed cotton procured (MT)", "Total seed cotton processed (MT)", "Total Heap stock (MT)",
          "Total seed cotton in stock (MT)", "Total lint produce (MT)", "Total lint sold (MT)", "Grey-Out Lint Quantity (MT)", "Total Lint Received (MT)", "Total Lint Transfered (MT)", "Total Lint Quantity in To be Submitted Status (MT)", "Actual lint in stock (MT)", "Total lint in stock (MT)",
          "Total bales produce", "Total bales sold", "Total Bales Greyout", "Total Bales Received", "Total Bales Transfered", "Total Bales in To be Submitted Status", "Actual Bales in stock", "Total bales in stock"
        ]);
        headerRow.font = { bold: true };
      }

      let totals = {
        cottonProcuredMt:0,
          cottonProcessedeMt:0,
          //cottonStockMt:0,
          heapStockMt:0,
          cottonStockinProcMt:0,          
          lintProcuredMt:0,
          lintSoldMt:0,
          lintGreyoutMT:0,
          total_qty_lint_received:0,
          total_qty_lint_transfered:0,
          total_qty_lint_to_be_submitted:0,
          lintActualStockMT:0,
          lintStockMt:0,
          balesProduced:0,
          balesSold:0,
          balesGreyout:0,
          total_bales_received:0,
          total_bales_transfered:0,
          total_bales_to_be_submitted:0,
          balesActualStock:0,
          balesStock:0,
      };

      // Append data to worksheet
      for await (const [index, item] of rows.entries()) {
        let obj: any = {};


        let [cottonProcured, cottonProcessed, cottonProcessedByHeap, heapStock, lintProcured, greyoutLint, lintSold, ginToGinSale, ginToGinReceive,ginToBeSubmitted]: any = await Promise.all([
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
              [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")), 0), 'qty'],              
              [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal("CAST(qty_stock AS DOUBLE PRECISION)")), 0), 'cotton_stock']
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
          GinHeap.findOne({
            attributes: [
              [
                sequelize.fn(
                  "COALESCE",
                  sequelize.fn(
                    "SUM",
                    Sequelize.literal("CAST(qty_stock AS DOUBLE PRECISION)")
                  ),
                  0
                ),
                "heap_stock",
              ],
            ],
            where: {
              ...transactionWhere,
              ginner_id: item.id,
              status: true,
            },
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
              sold_status: false ,
              [Op.or]: [
                {
                  [Op.and]: [
                    { "$ginprocess.greyout_status$": true },
                    { is_all_rejected: null }
                  ]
                },
                {
                  [Op.and]: [
                    { "$ginprocess.scd_verified_status$": true },
                    { "$gin-bales.scd_verified_status$": { [Op.not]: true } }
                  ]
                },
                {
                  [Op.and]: [
                    { "$ginprocess.scd_verified_status$": false },
                    { "$gin-bales.scd_verified_status$": { [Op.is]: false } }
                  ]
                }
              ]
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
              "$sales.status$": { [Op.in]: ['Pending', 'Pending for QR scanning', 'Partially Accepted', 'Partially Rejected', 'Sold'] },
              "$sales.buyer_ginner$": { [Op.is]: null }
            },
            group: ["sales.ginner_id"]
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
                "total_qty",
              ],
              [
                sequelize.fn("COUNT", Sequelize.literal("DISTINCT bale_id")),
                "no_of_bales",
              ],
            ],
            include: [
              {
                model: GinSales,
                as: "sales",
                attributes: [],
                include: [{
                  model: Ginner,
                  as: "ginner",
                  attributes: [],
                }]
              },
              {
                model: GinBale,
                as: "bale",
                attributes: [],
                include: [{
                  model: GinProcess,
                  as: "ginprocess",
                  attributes: [],
                }]
              },
            ],
            where: {
              ...baleSelectionWhere,
              "$sales.ginner_id$": item.id,
              "$sales.status$": { [Op.in]: ['Pending', 'Pending for QR scanning', 'Partially Accepted', 'Partially Rejected', 'Sold'] },
              "$sales.buyer_ginner$": { [Op.not]: null },
              "$sales.buyer_type$": 'Ginner'
            },
            group: ["sales.ginner_id"]
          }),
          GinToGinSale.findOne({
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
                "total_qty",
              ],
              [
                sequelize.fn("COUNT", Sequelize.literal('DISTINCT "bale"."id"')),
                "no_of_bales",
              ],
            ],
            include: [
              {
                model: GinSales,
                as: "ginsales",
                attributes: [],
                include: [
                  {
                    model: Ginner,
                    as: "ginner",
                    attributes: [],
                  },
                ]
              },
              {
                model: GinBale,
                as: "bale",
                attributes: [],
              },
            ],
            where: {
              "$ginsales.buyer_ginner$": item.id,
              "$ginsales.status$": { [Op.in]: ['Partially Accepted', 'Partially Rejected', 'Sold'] },
              gin_accepted_status: { [Op.is]: true },
              "$ginsales.buyer_type$": 'Ginner'
            },
            group: ["ginsales.buyer_ginner"]
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
                "total_qty",
              ],
              [
                sequelize.fn("COUNT", Sequelize.literal("DISTINCT bale_id")),
                "no_of_bales",
              ],
            ],
            include: [
              {
                model: GinSales,
                as: "sales",
                attributes: [],
                include: [{
                  model: Ginner,
                  as: "ginner",
                  attributes: [],
                }]
              },
              {
                model: GinBale,
                as: "bale",
                attributes: [],
                include: [{
                  model: GinProcess,
                  as: "ginprocess",
                  attributes: [],
                }]
              },
            ],
            where: {
              "$sales.ginner_id$": item.id,
              "$sales.status$": { [Op.in]: ['To be Submitted'] }
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
        //obj.cottonStockMt = convert_kg_to_mt(cottonProcured ? cottonProcured?.dataValues?.qty - totalCottonProcessedQty : 0);
        obj.heapStockMt = convert_kg_to_mt(heapStock?.dataValues.heap_stock ?? 0);
        obj.cottonStockinProcMt = convert_kg_to_mt(cottonProcured?.dataValues.cotton_stock ?? 0);
        obj.lintProcuredKg = lintProcured?.dataValues.qty ?? 0;
        obj.lintProcuredMt = convert_kg_to_mt(lintProcured?.dataValues.qty ?? 0);
        obj.lintSoldKg = lintSold?.dataValues.qty ?? 0;
        obj.lintSoldMt = convert_kg_to_mt(lintSold?.dataValues.qty ?? 0);
        obj.lintGreyoutKg = greyoutLint?.dataValues.qty ?? 0;
        obj.lintGreyoutMT = convert_kg_to_mt(greyoutLint?.dataValues.qty ?? 0);
        obj.total_bales_transfered = ginToGinSale?.dataValues.no_of_bales ? Number(ginToGinSale?.dataValues.no_of_bales) : 0;
        obj.total_qty_lint_transfered = ginToGinSale
          ? convert_kg_to_mt(ginToGinSale.dataValues.total_qty ?? 0)
          : 0;
        obj.total_bales_received = ginToGinReceive?.dataValues.no_of_bales ? Number(ginToGinReceive?.dataValues.no_of_bales) : 0;
        obj.total_qty_lint_received = ginToGinReceive
          ? convert_kg_to_mt(ginToGinReceive.dataValues.total_qty ?? 0)
          : 0;
        obj.total_bales_to_be_submitted = ginToBeSubmitted?.dataValues.no_of_bales ? Number (ginToBeSubmitted?.   dataValues.no_of_bales) : 0;
        obj.total_qty_lint_to_be_submitted = ginToBeSubmitted
                ? convert_kg_to_mt(ginToBeSubmitted.dataValues.total_qty ?? 0)
                : 0;
        obj.lintActualStockMT = (Number(obj.lintProcuredMt) + Number(obj.total_qty_lint_received)) > (Number(obj.lintSoldMt) + Number(obj.lintGreyoutMT) + Number(obj.total_qty_lint_transfered) + Number(obj.total_qty_lint_to_be_submitted))
          ? (Number(obj.lintProcuredMt) + Number(obj.total_qty_lint_received)) - (Number(obj.lintSoldMt) + Number(obj.lintGreyoutMT) + Number(obj.total_qty_lint_transfered) + Number(obj.total_qty_lint_to_be_submitted))
          : 0;
        obj.lintStockKg = Number(obj.lintProcuredKg) > Number(obj.lintSoldKg) ? Number(obj.lintProcuredKg) - Number(obj.lintSoldKg) : 0;
        // obj.lintStockMt = Number(obj.lintProcuredKg) > Number(obj.lintSoldKg) ? Number(obj.lintProcuredMt) - Number(obj.lintSoldMt) : 0;
        obj.lintStockMt =
          (Number(obj.lintActualStockMT) > 0 ? Number(obj.lintActualStockMT) : 0) +
          (Number(obj.total_qty_lint_to_be_submitted) > 0 ? Number(obj.total_qty_lint_to_be_submitted) : 0);
        obj.balesProduced = lintProcured?.dataValues?.bales_procured ? Number(lintProcured?.dataValues?.bales_procured) : 0;
        obj.balesGreyout = greyoutLint?.dataValues?.bales_procured
        ? Number(greyoutLint?.dataValues?.bales_procured)
        : 0;
        obj.balesSold = lintSold?.dataValues?.bales_sold ? Number(lintSold?.dataValues?.bales_sold) : 0;
        obj.balesActualStock =
        (obj.balesProduced + obj.total_bales_received) > (obj.balesSold + obj.total_bales_transfered + obj.balesGreyout + obj.total_bales_to_be_submitted)
          ? (obj.balesProduced + obj.total_bales_received) - (obj.balesSold + obj.total_bales_transfered + obj.balesGreyout + obj.total_bales_to_be_submitted)
          : 0;
        obj.balesStock = obj.balesProduced > obj.balesSold ? obj.balesProduced - obj.balesSold : 0;
        
        obj.country = item.country.county_name;
        obj.state = item.state.state_name;

        const rowValues = {
          index: index + offset + 1,
          name: item.name ? item.name : '',
          country: obj.country,
          state: obj.state,
          cottonProcuredMt: Number(obj.cottonProcuredMt) ?? 0,
          cottonProcessedeMt: Number(obj.cottonProcessedeMt) ?? 0,
          //cottonStockMt: Number(obj.cottonStockMt) ?? 0,
          heapStockMt: obj.heapStockMt ? Number(obj.heapStockMt) : 0,
          cottonStockinProcMt: obj.cottonStockinProcMt ? Number(obj.cottonStockinProcMt) : 0,
          lintProcuredMt: Number(obj.lintProcuredMt) ?? 0,
          lintSoldMt: Number(obj.lintSoldMt) ?? 0,
          lintGreyoutMT: obj.lintGreyoutMT ? Number(obj.lintGreyoutMT) : 0,
          total_qty_lint_received: obj.total_qty_lint_received ? Number(obj.total_qty_lint_received) : 0,
          total_qty_lint_transfered: obj.total_qty_lint_transfered ? Number(obj.total_qty_lint_transfered) : 0,
          total_qty_lint_to_be_submitted: obj.total_qty_lint_to_be_submitted ? Number(obj.total_qty_lint_to_be_submitted) : 0,
          lintActualStockMT: obj.lintActualStockMT ? Number(obj.lintActualStockMT) : 0,
          lintStockMt: Number(obj.lintStockMt) ?? 0,
          balesProduced: Number(obj.balesProduced) ?? 0,
          balesSold: Number(obj.balesSold) ?? 0,
          balesGreyout: Number(obj.balesGreyout),
          total_bales_received: Number(obj.total_bales_received),
          total_bales_transfered: Number(obj.total_bales_transfered),
          total_bales_to_be_submitted: obj.total_bales_to_be_submitted,
          balesActualStock: Number(obj.balesActualStock),
          balesStock: Number(obj.balesStock) ?? 0
        };
        currentWorksheet.addRow(Object.values(rowValues));

        totals.cottonProcessedeMt+= Number(rowValues.cottonProcessedeMt ); 
        totals.cottonProcuredMt+= Number(rowValues.cottonProcuredMt );                
        //totals.cottonStockMt+= Number(rowValues.cottonStockMt );             
        totals.heapStockMt+= Number(rowValues.heapStockMt );              
        totals.cottonStockinProcMt+= Number(rowValues.cottonStockinProcMt );
        totals.lintProcuredMt+= Number(rowValues.lintProcuredMt );
        totals.lintSoldMt+= Number(rowValues.lintSoldMt );
        totals.lintGreyoutMT+= Number(rowValues.lintGreyoutMT );
        totals.total_qty_lint_received+= Number(rowValues.total_qty_lint_received );
        totals.total_qty_lint_transfered+= Number(rowValues.total_qty_lint_transfered );
        totals.total_qty_lint_to_be_submitted+= Number(rowValues.total_qty_lint_to_be_submitted );
        totals.lintActualStockMT+= Number(rowValues.lintActualStockMT );
        totals.lintStockMt+= Number(rowValues.lintStockMt );
        totals.balesProduced+= Number(rowValues.balesProduced );
        totals.balesSold+= Number(rowValues.balesSold );
        totals.balesGreyout+= Number(rowValues.balesGreyout );
        totals.total_bales_received+= Number(rowValues.total_bales_received );
        totals.total_bales_transfered+= Number(rowValues.total_bales_transfered );
        totals.total_bales_to_be_submitted+= Number(rowValues.total_bales_to_be_submitted );
        totals.balesActualStock+= Number(rowValues.balesActualStock );
        totals.balesStock+= Number(rowValues.balesStock );
      }

      const rowValues = {
        index:"",
        name:"",
        country:"",
        state:"Total",
        cottonProcuredMt: totals.cottonProcuredMt,
        cottonProcessedeMt: totals.cottonProcessedeMt,
        //cottonStockMt: totals.cottonStockMt,
        heapStockMt: totals.heapStockMt,
        cottonStockinProcMt: totals.cottonStockinProcMt,
        lintProcuredMt: totals.lintProcuredMt,
        lintSoldMt: totals.lintSoldMt,
        lintGreyoutMT: totals.lintGreyoutMT,
        total_qty_lint_received: totals.total_qty_lint_received, 
        total_qty_lint_transfered: totals.total_qty_lint_transfered,
        total_qty_lint_to_be_submitted: totals.total_qty_lint_to_be_submitted,
        lintActualStockMT: totals.lintActualStockMT,
        lintStockMt: totals.lintStockMt,
        balesProduced: totals.balesProduced,
        balesSold: totals.balesSold,
        balesGreyout: totals.balesGreyout,
        total_bales_received: totals.total_bales_received,
        total_bales_transfered: totals.total_bales_transfered,
        total_bales_to_be_submitted: totals.total_bales_to_be_submitted,
        balesActualStock: totals.balesActualStock,
        balesStock: totals.balesStock,
      };
     
      currentWorksheet.addRow(Object.values(rowValues)).eachCell(cell=> cell.font = {bold: true});

      // Auto-adjust column widths based on content
      offset += batchSize;
      const borderStyle = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
      currentWorksheet.columns.forEach((column: any) => {
        let maxCellLength = 0;
        column.eachCell({ includeEmpty: true }, (cell: any) => {
          const cellLength = (cell.value ? cell.value.toString() : '').length;
          maxCellLength = Math.max(maxCellLength, cellLength);
          cell.border = borderStyle;
        });
        column.width = Math.min(24, maxCellLength + 2); // Limit width to 30 characters
      });

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

const generateGinnerLintCottonStock = async () => {
  // const excelFilePath = path.join("./upload", "ginner-summary.xlsx");

  const maxRowsPerWorksheet = 500000; // Maximum number of rows per worksheet in Excel
  const transactionWhere: any = {};
  const ginBaleWhere: any = {};
  const baleSelectionWhere: any = {};

  try {
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: fs.createWriteStream("./upload/ginner-lint-stock-test.xlsx"),
      useStyles: true,

    });

    const batchSize = 5000;
    let worksheetIndex = 0;
    let offset = 0;
    let hasNextBatch = true;

    let include = [
      {
        model: Ginner,
        as: "ginner",
        include: [
          {
            model: Country,
            as  : "country",
          },
          {
            model: State,
            as  : "state",
          },
          {
            model: District,
            as  : "district",
          }
        ]
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


    while (hasNextBatch) {
      let rows= await GinProcess.findAll({
        attributes: [
          [Sequelize.literal('"ginner"."id"'), "ginner_id"],
          [Sequelize.literal('"ginner"."name"'), "ginner_name"],
          [Sequelize.literal('"season"."id"'), "season_id"],
          [Sequelize.col('"season"."name"'), "season_name"],
          [Sequelize.literal('"ginner"."country_id"'), "country_id"],
          [Sequelize.literal('"ginner"."state_id"'), "state_id"],
          [Sequelize.literal('"ginner"."district_id"'), "district_id"],
          [Sequelize.literal('"program"."program_name"'), 'program_name'],
        ],
        include: include,
        group: ["ginner.id", "season.id","ginner->country.id","ginner->state.id","ginner->district.id","program.id"],
        order: [["ginner_name", "ASC"],["season_name", "DESC"]],
        limit: batchSize,
        offset: offset, 
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
        // if (worksheetIndex == 1) {
        //   currentWorksheet.mergeCells('A1:S1');
        //   const mergedCell = currentWorksheet.getCell('A1');
        //   mergedCell.value = 'CottonConnect | Ginner Summary Report';
        //   mergedCell.font = { bold: true };
        //   mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        //   // Set bold font for header row

        // }
        // Set bold font for header row
        const headerRow = currentWorksheet.addRow([
          "S. No.", "Season", "Ginner Name", "Country", "State", "District", "Total Procured Seed Cotton (Kgs)", "Total Processed Lint (Kgs)",
          "Total Sold Lint (Kgs)", "Total Lint in To be Submitted Status (Kgs)", "Actual Lint in Stock (Kgs)"
        ]);
        headerRow.font = { bold: true };
      }

      // Append data to worksheet
      for await (const [index, ginner] of rows.entries()) {
        let obj: any = {};


        let [cottonProcured, lintProcured, lintSold, lintToBeSubmitted, [lintStock]]: any =
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
                season_id: ginner.season_id,
                mapped_ginner: ginner.ginner_id,
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
                "$ginprocess.season_id$": ginner.season_id,
                "$ginprocess.ginner_id$": ginner.ginner_id,
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
                  include: [
                    {
                      model: GinProcess,
                      as: "ginprocess",
                      attributes: [],
                    },
                  ],
                },
              ],
              where: {
                "$bale.ginprocess.season_id$": ginner.season_id,
                "$sales.ginner_id$": ginner.ginner_id,
                "$sales.status$": { [Op.in]: ['Pending', 'Pending for QR scanning', 'Partially Accepted', 'Partially Rejected', 'Sold'] },
                "$sales.buyer_ginner$": { [Op.is]: null }
              },
              group: ["sales.ginner_id"],
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
                  include: [
                    {
                      model: GinProcess,
                      as: "ginprocess",
                      attributes: [],
                    },
                  ],
                },
              ],
              where: {
                "$bale.ginprocess.season_id$": ginner.season_id,
                "$sales.ginner_id$": ginner.ginner_id,
                "$sales.status$": { [Op.in]: ['To be Submitted'] },
              },
              group: ["sales.ginner_id"],
            }),
            sequelize.query(`
              SELECT 
                SUM(CAST(combined_data.weight AS DOUBLE PRECISION)) AS lint_stock,
                COUNT(combined_data.bale_id) AS bales_stock
              FROM (
                  -- First Query: Direct gin-bales
                  SELECT 
                      gp.id AS process_id,
                gp.ginner_id AS ginner_id,
                      gb.id AS bale_id,
                      gb.weight
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
                      gp.ginner_id = ${ginner.ginner_id}
                      AND gp.season_id = ${ginner.season_id}
                      AND gp.season_id >= 10
                      AND gb.sold_status = false
                      AND gp.greyout_status = false
                      AND (
                        gp.verification_status = 'Pending'
                        OR gp.verification_status IS NULL
                        OR (
                          gp.verification_status = 'Completed' AND (
                            (gp.scd_verified_status = TRUE AND gb.scd_verified_status IS TRUE)
                            OR
                            (gp.scd_verified_status = FALSE AND gb.scd_verified_status IS NOT FALSE)
                          )
                        )
                      )
                  UNION ALL
                  -- Second Query: Gin-to-Gin sales
                  SELECT 
                      gp.id AS process_id,
                      gp.ginner_id AS ginner_id,
                      gb.id AS bale_id,
                      gb.weight
                  FROM 
                      gin_to_gin_sales gtg
                  JOIN 
                      gin_processes gp ON gtg.process_id = gp.id
                  JOIN 
                      "gin-bales" gb ON gtg.bale_id = gb.id
                  JOIN 
                      gin_sales gs ON gtg.sales_id = gs.id
                  JOIN 
                      ginners g ON gtg.new_ginner_id = g.id
                  JOIN 
                      seasons s ON gp.season_id = s.id
                  JOIN 
                      programs p ON gp.program_id = p.id
                  WHERE 
                    (
                      gtg.new_ginner_id = ${ginner.ginner_id}
                      AND gp.season_id = ${ginner.season_id}
                      AND gp.greyout_status = false
                      AND gb.sold_status = true
                      AND gtg.gin_accepted_status = true
                      AND gtg.gin_sold_status IS NULL
                    ) OR (
                      gtg.old_ginner_id = ${ginner.ginner_id}
                      AND gp.season_id = ${ginner.season_id}
                      AND gp.greyout_status = false
                      AND gb.sold_status = true
                      AND gtg.gin_accepted_status = false
                      AND gtg.gin_sold_status IS NULL
                    )
              ) combined_data
              GROUP BY 
                combined_data.ginner_id
            `)
          ]);

          obj.ginner_id = ginner?.ginner_id;
          obj.ginner_name = ginner?.ginner?.name ?? "";
          obj.season_id = ginner?.season_id;
          obj.season = ginner?.season?.name ?? "";
          obj.program = ginner?.program?.program_name ?? "";
          obj.country_id = ginner?.dataValues?.country_id;
          obj.country = ginner?.ginner?.country?.county_name ?? "";
          obj.state_id = ginner?.dataValues?.state_id;
          obj.state = ginner?.ginner?.state?.state_name ?? "";
          obj.district_id = ginner?.dataValues?.district_id;
          obj.district = ginner?.ginner?.district?.district_name ?? "";
          obj.cottonProcuredKg = cottonProcured?.dataValues?.qty ?? 0;
          obj.cottonProcuredMt = convert_kg_to_mt(cottonProcured?.dataValues.qty ?? 0);
          obj.lintProcuredKg = lintProcured?.dataValues.qty ?? 0;
          obj.lintProcuredMt = convert_kg_to_mt(lintProcured?.dataValues.qty ?? 0);
          obj.lintSoldKg = lintSold?.dataValues.qty ?? 0;
          obj.lintSoldMt = convert_kg_to_mt(lintSold?.dataValues.qty ?? 0);
          obj.lintToBeSubmittedKg = lintToBeSubmitted?.dataValues.qty ?? 0;
          obj.lintToBeSubmittedMt = convert_kg_to_mt(lintToBeSubmitted?.dataValues.qty ?? 0);
          obj.lintStockKg = lintStock && lintStock[0] ? lintStock[0]?.lint_stock : 0;
          obj.lintStockMT = convert_kg_to_mt(lintStock && lintStock[0] ? lintStock[0]?.lint_stock : 0);
    
          obj.balesProduced = lintProcured?.dataValues?.bales_procured
            ? Number(lintProcured?.dataValues?.bales_procured)
            : 0;
          obj.balesSold = lintSold?.dataValues?.bales_sold
            ? Number(lintSold?.dataValues?.bales_sold)
            : 0;
          obj.balesToBeSubmitted = lintToBeSubmitted?.dataValues?.bales_sold
            ? Number(lintToBeSubmitted?.dataValues?.bales_sold)
            : 0;
          obj.balesStock = lintStock && lintStock[0]?.bales_stock
          ? Number(lintStock[0]?.bales_stock)
          : 0;
  
          const rowValues = {
            index: index + 1,
            season: obj.season,
            name: obj.ginner_name ? obj.ginner_name : '',
            country: obj.country,
            state: obj.state,
            district: obj.district,
            cottonProcuredKg: obj.cottonProcuredKg ? Number(obj.cottonProcuredKg) : 0,
            lintProcuredKg: obj.lintProcuredKg ? Number(obj.lintProcuredKg) : 0,
            lintSoldKg: obj.lintSoldKg ? Number(obj.lintSoldKg) : 0,
            lintToBeSubmittedKg: obj.lintToBeSubmittedKg ? Number(obj.lintToBeSubmittedKg) : 0,
            lintStockKg: obj.lintStockKg ? Number(obj.lintStockKg) : 0
          };

        currentWorksheet.addRow(Object.values(rowValues));
      }

      // Auto-adjust column widths based on content
      offset += batchSize;
      const borderStyle = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
      currentWorksheet.columns.forEach((column: any) => {
        let maxCellLength = 0;
        column.eachCell({ includeEmpty: true }, (cell: any) => {
          const cellLength = (cell.value ? cell.value.toString() : '').length;
          maxCellLength = Math.max(maxCellLength, cellLength);
          cell.border = borderStyle;
        });
        column.width = Math.min(24, maxCellLength + 2); // Limit width to 30 characters
      });

    }
   
    // Save the workbook
    await workbook.commit()
      .then(() => {
        // Rename the temporary file to the final filename
        fs.renameSync("./upload/ginner-lint-stock-test.xlsx", './upload/ginner-lint-stock.xlsx');
        console.log('ginner-lint-stock report generation completed.');
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
      stream: fs.createWriteStream("./upload/gin-bale-process-test.xlsx"),
      useStyles: true,
    });

    const batchSize = 5000;
    let worksheetIndex = 0;
    let offset = 0;
    let hasNextBatch = true;


    interface Totals {
      total_no_of_bales: number;
      total_lint_quantity: number;
      total_seedConsmed: number;
      total_sold_bales: number;
      total_lint_quantity_sold: number;
      total_lint_qty_transfered: number;
      total_bales_transfered: number;
      total_lint_qty_to_be_submitted: number,
      total_bales_to_be_submitted: number,
      total_lint_stock: number;
      total_bale_stock: number;
    }

    let totals: Totals = {
      total_no_of_bales: 0,
      total_lint_quantity: 0,
      total_seedConsmed: 0,
      total_sold_bales: 0,
      total_lint_quantity_sold: 0,
      total_lint_qty_transfered: 0, 
      total_bales_transfered:0,
      total_lint_qty_to_be_submitted: 0,
      total_bales_to_be_submitted: 0,
      total_lint_stock:0,
      total_bale_stock:0,

    };

    const AddTotalRow = (currentWorksheet: ExcelJS.Worksheet | undefined, totals : Totals) =>{

      if(currentWorksheet != undefined){
        const rowValues = Object.values({
          Index:"",
          country:"",
          state:"",
          date:"",
          created_date:"",
          no_of_days:"",
          from_date:"",
          to_date:"",
          seed_consumed_seasons:"",
          season:"",
          ginner:"",
          heap:"",
          lot_no:"",
          press_no:"",
          reel_lot_no:"",
          reel_press_no:"Total",
          noOfBales: Number(formatDecimal(totals.total_no_of_bales)),
          lint_quantity: Number(formatDecimal(totals.total_lint_quantity)),
          seedConsmed: Number(formatDecimal(totals.total_seedConsmed)),
          got:"",
          lint_quantity_sold: Number(formatDecimal(totals.total_lint_quantity_sold)),
          sold_bales: Number(formatDecimal(totals.total_sold_bales)),
          lint_qty_greyout:"",
          greyout_bales:"",
          lint_qty_transfered: Number(formatDecimal(totals.total_lint_qty_transfered)),
          bales_transfered: Number(formatDecimal(totals.total_bales_transfered)),
          lint_qty_to_be_submitted: Number(formatDecimal(totals.total_lint_qty_to_be_submitted)),
          bales_to_be_submitted: Number(formatDecimal(totals.total_bales_to_be_submitted)),
          lint_stock: Number(formatDecimal(totals.total_lint_stock)),
          bale_stock: Number(formatDecimal(totals.total_bale_stock)),
          program:"",
          village_names:"",
          greyout_status:"",
        });
        currentWorksheet.addRow(rowValues).eachCell((cell, colNumber) => { cell.font={bold:true}});
        const borderStyle = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
    
        // Auto-adjust column widths based on content
        currentWorksheet.columns.forEach((column: any) => {
          let maxCellLength = 0;
          column.eachCell({ includeEmpty: true }, (cell: any) => {
            const cellLength = (cell.value ? cell.value.toString() : "").length;
            maxCellLength = Math.max(maxCellLength, cellLength);
            cell.border = borderStyle;
          });
          column.width = Math.min(15, maxCellLength + 2); // Limit width to 30 characters
        });
 
      }
      
    };


    let currentWorksheet: ExcelJS.Worksheet| undefined = undefined;

    while (hasNextBatch) {
      const ginProcess = await sequelize.query(
        `WITH gin_process_data AS (
          SELECT
              gp.id AS process_id,
              gp.date,
              gp.from_date,
              gp.to_date,
              gp."createdAt" AS created_date,
              s.name AS season_name,
              g.id AS ginner_id,
              g.name AS ginner_name,
              g.outturn_range_from AS got_from,
              g.outturn_range_to AS got_to,
              g.country_id as country_id,
              g.state_id as state_id,
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
                  COALESCE(
                    SUM(
                      CAST(gb.old_weight AS DOUBLE PRECISION)
                    ), 0
                  ) AS old_weight_total,
               MIN(gb.bale_no) AS pressno_from,
             MAX(LPAD(gb.bale_no, 10, ' ')) AS pressno_to
              FROM
                  "gin-bales" gb
              GROUP BY
                  gb.process_id
          ),
          gin_bale_greyout_data AS (
            SELECT
              gb.process_id,
			  gp.ginner_id,
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
            JOIN gin_processes gp ON gb.process_id = gp.id
            WHERE
             gb.sold_status = FALSE AND (
              (
                gp.greyout_status = TRUE AND  
                gb.is_all_rejected IS NULL
              )
              OR (
                gp.scd_verified_status = TRUE AND
                gb.scd_verified_status IS NOT TRUE
              )
              OR (
                gp.scd_verified_status = FALSE AND
                gb.scd_verified_status IS FALSE
              )
              )
            GROUP BY
              gb.process_id, gp.ginner_id
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
              unnest_data.process_id,
              ARRAY_AGG(DISTINCT unnest_village_id) AS villages
            FROM (
              SELECT 
                hs.process_id,
                UNNEST(hs.village_id) AS unnest_village_id  -- Unnest the array of village_id
              FROM
                heap_selections hs
            ) unnest_data
            GROUP BY
              unnest_data.process_id
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
                  gs.ginner_id,
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
                  AND gs.buyer_ginner IS NULL
              GROUP BY
                  gb.process_id, gs.ginner_id
          ),
          gin_to_gin_sales_data AS (
                SELECT
                    gb.process_id,
					          gs.ginner_id,
                    COUNT(gb.id) AS no_of_bales,
                    COALESCE(
                      SUM(
                        CASE
                          WHEN gb.old_weight IS NOT NULL THEN CAST(gb.old_weight AS DOUBLE PRECISION)
                          ELSE CAST(gb.weight AS DOUBLE PRECISION)
                        END
                      ), 0
                    ) AS lint_qty
                FROM
                    "gin-bales" gb
                LEFT JOIN 
                  bale_selections bs ON gb.id = bs.bale_id
                LEFT JOIN 
                    gin_sales gs ON gs.id = bs.sales_id
                WHERE
                    gs.status in ('Pending', 'Pending for QR scanning', 'Partially Accepted', 'Partially Rejected','Sold')
                    AND gs.buyer_ginner IS NOT NULL
                    AND gs.buyer_type = 'Ginner'
                GROUP BY
                    gb.process_id, gs.ginner_id
            ),
            gin_to_be_submitted_data AS (
                SELECT
                    gb.process_id,
					          gs.ginner_id,
                    COUNT(gb.id) AS no_of_bales,
                    COALESCE(
                      SUM(
                        CASE
                          WHEN gb.old_weight IS NOT NULL THEN CAST(gb.old_weight AS DOUBLE PRECISION)
                          ELSE CAST(gb.weight AS DOUBLE PRECISION)
                        END
                      ), 0
                    ) AS lint_qty
                FROM
                    "gin-bales" gb
                LEFT JOIN 
                  bale_selections bs ON gb.id = bs.bale_id
                LEFT JOIN 
                    gin_sales gs ON gs.id = bs.sales_id
                WHERE
                    gs.status in ('To be Submitted')
                GROUP BY
                    gb.process_id, gs.ginner_id
            )
          SELECT
              gd.process_id,
              gd.date AS date,
              gd.from_date AS from_date,
              gd.to_date AS to_date,
              gd.created_date AS "createdAt",
              EXTRACT(DAY FROM (gd.created_date - gd.date)) AS no_of_days,
              gd.season_name AS season,
              gd.ginner_name AS ginner_name,

              gd.got_from AS got_from,
              gd.got_to AS got_to,
              c.county_name AS country_name,
              s.state_name AS state_name,

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
              gb.old_weight_total AS old_weight_total,
              COALESCE(sd.sold_bales, 0) AS sold_bales,
              COALESCE(gbg.no_of_bales, 0) AS greyout_bales,
              COALESCE(gbg.total_qty, 0) AS lint_qty_greyout,
              COALESCE(gtg.no_of_bales, 0) AS bales_transfered,
              COALESCE(gtg.lint_qty, 0) AS lint_qty_transfered,
              COALESCE(gtsg.no_of_bales, 0) AS bales_to_be_submitted,
              COALESCE(gtsg.lint_qty, 0) AS lint_qty_to_be_submitted,
              (COALESCE(gb.lint_quantity, 0) - (COALESCE(sd.lint_quantity_sold, 0) + COALESCE(gbg.total_qty, 0) + COALESCE(gtg.lint_qty, 0) + COALESCE(gtsg.lint_qty, 0))) AS lint_stock,
              (COALESCE(gd.no_of_bales, 0) - (COALESCE(sd.sold_bales, 0) + COALESCE(gbg.no_of_bales, 0) + COALESCE(gtg.no_of_bales, 0) + COALESCE(gtsg.no_of_bales, 0))) AS bale_stock,
              gd.program AS program,
              vnd.village_names AS village_names,
              gd.season_name AS seed_consumed_seasons,
              gd.weigh_bridge,
              gd.delivery_challan,
              gd.qr,
              gd.greyout_status
          FROM
              gin_process_data gd
          LEFT JOIN
              gin_bale_data gb ON gd.process_id = gb.process_id
          LEFT JOIN
              village_names_data vnd ON gd.process_id = vnd.process_id 
          LEFT JOIN
              sold_data sd ON gd.process_id = sd.process_id AND sd.ginner_id = gd.ginner_id
          LEFT JOIN 
              gin_bale_greyout_data gbg ON gd.process_id = gbg.process_id AND gbg.ginner_id = gd.ginner_id
          LEFT JOIN 
              gin_to_gin_sales_data gtg ON gd.process_id = gtg.process_id AND gtg.ginner_id = gd.ginner_id
          LEFT JOIN 
              gin_to_be_submitted_data gtsg ON gd.process_id = gtsg.process_id AND gtsg.ginner_id = gd.ginner_id
          LEFT JOIN
              countries c ON gd.country_id = c.id 
          LEFT JOIN
              states s ON gd.state_id = s.id  
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
       
        if(currentWorksheet){
          AddTotalRow(currentWorksheet, totals);
        }
        totals = {
          total_no_of_bales: 0,
          total_lint_quantity: 0,
          total_seedConsmed: 0,
          total_sold_bales: 0,
          total_lint_quantity_sold: 0,
          total_lint_qty_transfered: 0, 
          total_bales_transfered:0,
          total_lint_qty_to_be_submitted: 0,
          total_bales_to_be_submitted: 0,
          total_lint_stock:0,
          total_bale_stock:0,
    
        };   

        worksheetIndex++;

      }

  
      currentWorksheet = workbook.getWorksheet(`Sheet${worksheetIndex}`);
      if (!currentWorksheet) {
        currentWorksheet = workbook.addWorksheet(`Sheet${worksheetIndex}`);
        // if (worksheetIndex == 1) {
        //   currentWorksheet.mergeCells('A1:AB1');
        //   const mergedCell = currentWorksheet.getCell('A1');
        //   mergedCell.value = 'CottonConnect | Ginner Bale Process Report';
        //   mergedCell.font = { bold: true };
        //   mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };

        // }
        // Set bold font for header row
        // Set bold font for header row
        const headerRow = currentWorksheet.addRow([
          "Sr No.","Country","State", "Process Date", "Data Entry Date",  "No. of Days", "Lint Production Start Date", "Lint Production End Date", "Seed Cotton Consumed Season", "Lint process Season choosen", "Ginner Name", "Heap Number", "Gin Lot No", "Gin Press No", "REEL Lot No", "REEL Press No", "No of Bales", "Lint Quantity(Kgs)", "Total Seed Cotton Consumed(Kgs)", "GOT", "Total lint cotton sold(Kgs)", "Total Bales Sold", "Total lint cotton rejected(Kgs)", "Total Bales Rejected", "Total lint cotton transfered(Kgs)", "Total Bales Transfered", "Total Lint Cotton in To be Submitted Status(Kgs)", "Total Bales in To be Submitted Status(Kgs)", "Total lint cotton in stock(Kgs)", "Total Bales in stock", "Programme", "Village", "Grey Out Status"
        ]);
        headerRow.font = { bold: true };
      }



     

      // Append data to worksheet
      for await (const [index, item] of ginProcess.entries()) {
        const rowValues = {
          index: index + offset + 1,
          country: item.country_name ? item.country_name : "",
          state: item.state_name ? item.state_name : "",
          date: item.date ? item.date : "",
          created_date: item.createdAt ? item.createdAt : "",
          no_of_days: item.no_of_days ? Number(item.no_of_days) : "",
          from_date: item.from_date ? item.from_date : "",
          to_date: item.to_date ? item.to_date : "",
          seed_consumed_seasons: item.seed_consumed_seasons ? item.seed_consumed_seasons : "",
          season: item.season ? item.season : "",
          ginner: item.ginner_name ? item.ginner_name : "",
          heap: item.heap_number ? item.heap_number : '',
          lot_no: item.lot_no ? item.lot_no : "",
          press_no: item.press_no !== "NaN-NaN" ? item.press_no : item?.gin_press_no,
          reel_lot_no: item.reel_lot_no ? item.reel_lot_no : "",
          reel_press_no: item.reel_press_no ? item.reel_press_no : "",
          noOfBales: item.no_of_bales ? Number(item.no_of_bales) : 0,
          lint_quantity: item.lint_quantity ? Number(item.lint_quantity) : 0,
          seedConsmed: item.total_qty ? Number(item.total_qty) : 0,
          got: item.gin_out_turn ? item.gin_out_turn : "",
          lint_quantity_sold: item.lint_quantity_sold ? Number(item.lint_quantity_sold) : 0,
          sold_bales: item.sold_bales ? Number(item.sold_bales) : 0,
          lint_qty_greyout: item.lint_qty_greyout ? Number(formatDecimal(item.lint_qty_greyout)) : 0,
          greyout_bales: item.greyout_bales ? Number(item.greyout_bales) : 0,
          lint_qty_transfered: item.lint_qty_transfered ? Number(formatDecimal(item.lint_qty_transfered)) : 0,
          bales_transfered: item.bales_transfered ? Number(item.bales_transfered) : 0,
          lint_qty_to_be_submitted: item.lint_qty_to_be_submitted ? Number(formatDecimal(item.lint_qty_to_be_submitted)) : 0,
          bales_to_be_submitted: item.bales_to_be_submitted ? Number(item.bales_to_be_submitted) : 0,
          lint_stock: item.lint_stock && Number(item.lint_stock) > 1 ? Number(item.lint_stock) : 0,
          bale_stock: item.bale_stock && Number(item.bale_stock) > 0 ? Number(item.bale_stock) : 0,
          program: item.program ? item.program : "",
          village_names: item.village_names && item.village_names.length > 0 ? item.village_names.join(", ") : "",
          greyout_status: item.greyout_status ? "Yes" : "No",
        };

        currentWorksheet.addRow(Object.values(rowValues));


        totals.total_no_of_bales += rowValues.noOfBales;
        totals.total_lint_quantity += rowValues.lint_quantity;
        totals.total_seedConsmed += rowValues.seedConsmed;
        totals.total_lint_quantity_sold +=  rowValues.lint_quantity_sold;
        totals.total_lint_qty_transfered += rowValues.lint_qty_transfered;
        totals.total_sold_bales += rowValues.sold_bales;
        totals.total_bales_transfered += rowValues.bales_transfered;
        totals.total_lint_qty_to_be_submitted += rowValues.lint_qty_to_be_submitted;
        totals.total_bales_to_be_submitted += rowValues.bales_to_be_submitted;
        totals.total_lint_stock += rowValues.lint_stock;
        totals.total_bale_stock += rowValues.bale_stock;

      }
      offset += batchSize;  

    }


    let currentsheet = workbook.getWorksheet(`Sheet${worksheetIndex}`);
    if(currentsheet){
      AddTotalRow(currentsheet, totals);
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

  const whereCondition: any = [];
  try {

    whereCondition.push(`gs.status <> 'To be Submitted'`);
    whereCondition.push(`gs.id IS NOT NULL`);

    const whereClause = whereCondition.length > 0 ? `WHERE ${whereCondition.join(' AND ')}` : '';
    // Create the excel workbook file
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: fs.createWriteStream("./upload/Ginner-sales-report-test.xlsx"),
      useStyles: true,
    });

    
    
    
    interface Totals{
      total_no_of_bales: 0,
      total_lint_quantity: 0,
      total_Sales_value: 0,
      total_rate: 0,
    }

    
    let totals : Totals= {
      total_no_of_bales: 0,
      total_lint_quantity: 0,
      total_Sales_value: 0,
      total_rate: 0,

    };
    
    const AddTotalRow = (currentWorksheet: ExcelJS.Worksheet | undefined, totals : Totals) =>{

      if(currentWorksheet != undefined){
        const rowValues = Object.values({
          Index:"",
          country:"",
          state:"",
          date:"",
          created_at:"",
          no_of_days:"",
  
          // seed_consumed_seasons:"",
          lint_process_seasons:"",
          season:"",
          ginner:"",
          invoice:"",
          buyer_type:"",
          buyer:"",
          // heap:"",
          lot_no:"",
          reel_lot_no:"Total",
          no_of_bales: Number(formatDecimal(totals.total_no_of_bales)),
          press_no:"",
          rate: Number(formatDecimal(totals.total_rate)),
          lint_quantity: Number(formatDecimal(totals.total_lint_quantity)),
          old_weight: "",
          other_season_quantity:"",
          other_season_bales:"",
          sales_value: Number(formatDecimal(totals.total_Sales_value)),
          vehicle_no:"",
          transporter_name:"",
          program:"",
          agentDetails:"",
          status:"",
        });
        currentWorksheet.addRow(rowValues).eachCell((cell, colNumber) => { cell.font={bold:true}});;
  
        const borderStyle = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
        // Auto-adjust column widths based on content
        currentWorksheet.columns.forEach((column: any) => {
          let maxCellLength = 0;
          column.eachCell({ includeEmpty: true }, (cell: any) => {
            const cellLength = (cell.value ? cell.value.toString() : '').length;
            maxCellLength = Math.max(maxCellLength, cellLength);
            cell.border = borderStyle;
          });
          column.width = Math.min(14, maxCellLength + 2); // Limit width to 30 characters
        });
 
      }
      
    };
    
    
    const batchSize = 5000;
    let worksheetIndex = 0;
    let offset = 0;
    let hasNextBatch = true;


    let currentWorksheet: ExcelJS.Worksheet| undefined = undefined;


    while (hasNextBatch) {
      // const dataQuery = `
      // WITH ginsale AS (
      //     SELECT 
      //         gs.id AS ginsale_id,
      //         gs.date AS date,
      //         gs."createdAt" AS "createdAt",
      //         season.name AS season_name,
      //         program.program_name AS program,
      //         ginner.id AS ginner_id,
      //         ginner.name AS ginner,
      //         gs.total_qty AS total_qty,
      //         spinner.id AS spinner_id,
      //         spinner.name AS buyerdata,
      //         gs.qr AS qr,
      //         gs.invoice_no AS invoice_no,
      //         gs.lot_no AS lot_no,
      //         gs.rate AS rate,
      //         gs.candy_rate AS candy_rate,
      //         gs.total_qty AS lint_quantity,
      //         gs.no_of_bales AS no_of_bales,
      //         gs.sale_value AS sale_value,
      //         gs.press_no AS press_no,
      //         gs.qty_stock AS qty_stock,
      //         gs.weight_loss AS weight_loss,
      //         gs.invoice_file AS invoice_file,
      //         gs.vehicle_no AS vehicle_no,
      //         gs.transporter_name AS transporter_name,
      //         gs.transaction_agent AS transaction_agent,
      //         gs.status AS status,
      //         ARRAY_AGG(DISTINCT gp.id) AS process_ids,
      //         STRING_AGG(DISTINCT ss.name, ',') AS lint_process_seasons,
      //         STRING_AGG(DISTINCT gp.reel_lot_no, ',') AS reel_lot_no,
      //         COALESCE(
      //             SUM(
      //               CASE
      //                 WHEN gb.old_weight IS NOT NULL THEN CAST(gb.old_weight AS DOUBLE PRECISION)
      //                 ELSE CAST(gb.weight AS DOUBLE PRECISION)
      //               END
      //             ), 0
      //         ) AS total_old_weight
      //     FROM bale_selections bs
      //     INNER JOIN gin_sales gs ON bs.sales_id = gs.id
      //     LEFT JOIN seasons season ON gs.season_id = season.id
      //     LEFT JOIN "gin-bales" gb ON bs.bale_id = gb.id
      //     LEFT JOIN gin_processes gp ON gb.process_id = gp.id
      //     LEFT JOIN seasons ss ON gp.season_id = ss.id
      //     LEFT JOIN ginners ginner ON gs.ginner_id = ginner.id
      //     LEFT JOIN spinners spinner ON gs.buyer = spinner.id
      //     LEFT JOIN programs program ON gs.program_id = program.id
      //     ${whereClause}
      //     GROUP BY 
      //         gs.id, spinner.id, season.id, ginner.id, program.id
      //     ORDER BY gs.id DESC
      //     LIMIT ${batchSize} OFFSET ${offset}
      //   ),
      //   seed_seasons AS (
      //     SELECT cs.process_id, s.name
      //     FROM cotton_selections cs
      //     LEFT JOIN transactions t ON cs.transaction_id = t.id
      //     LEFT JOIN seasons s ON t.season_id = s.id
      //     WHERE cs.process_id IN (
      //         SELECT 
      //             UNNEST(COALESCE(ARRAY_REMOVE(gs.process_ids, NULL), '{}'))  -- Handle NULL and empty arrays
      //         FROM ginsale gs
      //     )

      //     UNION ALL

      //     SELECT hs.process_id, s.name
      //     FROM heap_selections hs
      //     LEFT JOIN transactions t ON t.id = ANY(hs.transaction_id)
      //     LEFT JOIN seasons s ON t.season_id = s.id
      //     WHERE hs.process_id IN (
      //         SELECT 
      //             UNNEST(COALESCE(ARRAY_REMOVE(gs.process_ids, NULL), '{}'))  -- Handle NULL and empty arrays
      //         FROM ginsale gs
      //     )
      //   )
      //   SELECT 
      //     gs.*,
      //     COALESCE(STRING_AGG(DISTINCT ss.name, ', '), '') AS seed_consumed_seasons
      //   FROM ginsale gs
      //   LEFT JOIN seed_seasons ss ON ss.process_id = ANY(COALESCE(ARRAY_REMOVE(gs.process_ids, NULL), '{}'))  -- Handle NULL and empty arrays
      //   GROUP BY gs.ginsale_id,
      //           gs.date,
      //           gs."createdAt",
      //           gs.season_name,
      //           gs.program,
      //           gs.ginner_id,
      //           gs.ginner,
      //           gs.total_qty,
      //           gs.spinner_id,
      //           gs.buyerdata,
      //           gs.qr,
      //           gs.process_ids,
      //           gs.lint_process_seasons,
      //           gs.reel_lot_no,
      //           gs.total_old_weight,
      //           gs.invoice_no,
      //           gs.lot_no,
      //           gs.lint_quantity,
      //           gs.rate, gs.candy_rate, gs.no_of_bales, gs.sale_value,
      //           gs.press_no, gs.qty_stock, gs.weight_loss, gs.invoice_file,
      //           gs.vehicle_no, gs.transporter_name, gs.transaction_agent, gs.status;`

      //fetch data with pagination

      const dataQuery = `
          SELECT 
              gs.id AS ginsale_id,
              gs.date AS date,
              gs."createdAt" AS createdAt,
              EXTRACT(DAY FROM (gs."createdAt" - gs.date)) AS no_of_days,
              season.name AS season_name,
              program.program_name AS program,
              ginner.id AS ginner_id,
              ginner.name AS ginner,
              c.county_name AS country_name,
              s.state_name AS state_name,              
              gs.total_qty AS total_qty,
              spinner.id AS spinner_id,
              spinner.name AS buyerdata,
              gs.buyer_type AS buyer_type,
              buyerginner.id AS buyer_ginner_id,
              buyerginner.name AS buyer_ginner,
              gs.qr AS qr,
              gs.invoice_no AS invoice_no,
              gs.lot_no AS lot_no,
              gs.rate AS rate,
              gs.candy_rate AS candy_rate,
              gs.total_qty AS lint_quantity,
              gs.no_of_bales AS no_of_bales,
              gs.sale_value AS sale_value,
              gs.press_no AS press_no,
              gs.qty_stock AS qty_stock,
              gs.weight_loss AS weight_loss,
              gs.invoice_file AS invoice_file,
              gs.vehicle_no AS vehicle_no,
              gs.transporter_name AS transporter_name,
              gs.transaction_agent AS transaction_agent,
              gs.status AS status,
              ARRAY_AGG(DISTINCT gp.id) AS process_ids,
              STRING_AGG(DISTINCT ss.name, ',') AS lint_process_seasons,
              STRING_AGG(DISTINCT gp.reel_lot_no, ',') AS reel_lot_no,
               CASE 
            WHEN COUNT(DISTINCT gp.season_id) > 1 THEN 
                NULLIF(COUNT(CASE WHEN gp.season_id <> gs.season_id THEN gb.id END), 0)
            ELSE NULL  
        END AS other_season_bales,

        CASE 
            WHEN COUNT(DISTINCT gp.season_id) > 1 THEN 
                NULLIF(SUM(CASE WHEN gp.season_id <> gs.season_id THEN COALESCE(CAST(gb.weight AS DOUBLE PRECISION), 0) ELSE 0 END), 0) 
            ELSE NULL  
        END AS other_season_quantity,

        -- Only Previous Season Data
        NULLIF(COUNT(CASE WHEN gp.season_id < gs.season_id THEN gb.id END), 0) AS previous_season_bales,
        NULLIF(SUM(CASE WHEN gp.season_id < gs.season_id THEN COALESCE(CAST(gb.weight AS DOUBLE PRECISION), 0) ELSE 0 END), 0) AS previous_season_quantity,

        -- Only Future Season Data
        NULLIF(COUNT(CASE WHEN gp.season_id > gs.season_id THEN gb.id END), 0) AS future_season_bales,
        NULLIF(SUM(CASE WHEN gp.season_id > gs.season_id THEN COALESCE(CAST(gb.weight AS DOUBLE PRECISION), 0) ELSE 0 END), 0) AS future_season_quantity,

        -- Bales current season
        NULLIF(COUNT(CASE WHEN gp.season_id = gs.season_id THEN gb.id END), 0) AS current_season_bales,

        -- Current season
        NULLIF(SUM(CASE WHEN gp.season_id = gs.season_id THEN COALESCE(CAST(gb.weight AS DOUBLE PRECISION), 0) ELSE 0 END), 0) AS current_season_quantity,
      
              COALESCE(
                  SUM(
                    CASE
                      WHEN gb.old_weight IS NOT NULL THEN CAST(gb.old_weight AS DOUBLE PRECISION)
                      ELSE CAST(gb.weight AS DOUBLE PRECISION)
                    END
                  ), 0
              ) AS total_old_weight
          FROM bale_selections bs
          INNER JOIN gin_sales gs ON bs.sales_id = gs.id
          LEFT JOIN seasons season ON gs.season_id = season.id
          LEFT JOIN "gin-bales" gb ON bs.bale_id = gb.id
          LEFT JOIN gin_processes gp ON gb.process_id = gp.id
          LEFT JOIN seasons ss ON gp.season_id = ss.id
          LEFT JOIN ginners ginner ON gs.ginner_id = ginner.id
          LEFT JOIN ginners buyerginner ON gs.buyer_ginner = buyerginner.id
          LEFT JOIN spinners spinner ON gs.buyer = spinner.id
          LEFT JOIN programs program ON gs.program_id = program.id
          LEFT JOIN countries c ON ginner.country_id = c.id
          LEFT JOIN states s ON ginner.state_id = s.id          
          ${whereClause}
          GROUP BY 
              gs.id, spinner.id, season.id, ginner.id, program.id, buyerginner.id, c.id, s.id
          ORDER BY ginner.name ASC
          LIMIT ${batchSize} OFFSET ${offset};`


      const rows: any = await sequelize.query(dataQuery, {
        type: sequelize.QueryTypes.SELECT,
      })

      if (rows.length === 0) {
        hasNextBatch = false;
        break;
      }

      if (offset % maxRowsPerWorksheet === 0) {

        if(currentWorksheet){
          AddTotalRow(currentWorksheet, totals);
        }

        totals = {
          total_no_of_bales: 0,
          total_lint_quantity: 0,
          total_Sales_value: 0,
          total_rate: 0,
    
        };
        worksheetIndex++;
      }

       currentWorksheet = workbook.getWorksheet(`Sheet${worksheetIndex}`);
      if (!currentWorksheet) {
        currentWorksheet = workbook.addWorksheet(`Sheet${worksheetIndex}`);
        // if (worksheetIndex == 1) {
        //   currentWorksheet.mergeCells('A1:U1');
        //   const mergedCell = currentWorksheet.getCell('A1');
        //   mergedCell.value = 'CottonConnect | Ginner Sales Report';
        //   mergedCell.font = { bold: true };
        //   mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        //   // Set bold font for header row
        // }
        // Set bold font for header row
        // const headerRow = currentWorksheet.addRow([
        //   "Sr No.", "Process Date", "Data Entry Date", "Seed Cotton Consumed Season", "Lint Process Season", "Lint sale chosen season", "Ginner Name",
        //   "Invoice No", "Sold To", "Bale Lot No", "REEL Lot No", "No of Bales", "Press/Bale No", "Rate/Kg",
        //   "Total Quantity", "Sales Value", "Vehicle No", "Transporter Name", "Programme", "Agent Detials", "Status"
        // ]);

        const headerRow = currentWorksheet.addRow([
          "Sr No.", "Country","State", "Process Date", "Data Entry Date", "No of Days", "Lint Process Season", "Lint sale chosen season", "Ginner Name",
          "Invoice No", "Buyer Type", "Sold To", "Bale Lot No", "REEL Lot No", "No of Bales", "Press/Bale No", "Rate/Kg",
          "Total Quantity", "Total old weight", "Other Season Quantity (Kgs)", "Other Season Bales", "Sales Value", "Vehicle No", "Transporter Name", "Programme", "Agent Details", "Status"
        ]);
        headerRow.font = { bold: true };
      }

   

      // Append data to worksheet
      for await (const [index, item] of rows.entries()) {

        const rowValues = Object.values({
          index: index + offset + 1,
          country: item.country_name ? item.country_name : '',
          state: item.state_name ? item.state_name : '',          
          date: item.date ? item.date : '',
          created_at: item.createdAt ? item.createdAt : '',
          no_of_days: item.no_of_days ? Number(item.no_of_days) : '',            

          // seed_consumed_seasons: item.seed_consumed_seasons ? item.seed_consumed_seasons : "",
          lint_process_seasons: item.lint_process_seasons ? item.lint_process_seasons : '',
          season: item.season_name ? item.season_name : '',
          ginner: item.ginner ? item.ginner : '',
          invoice: item.invoice_no ? item.invoice_no : '',
          buyer_type: item.buyer_type === 'Ginner' ? 'Ginner' : 'Spinner',
          buyer: item.buyerdata ? item.buyerdata : item.buyer_ginner ? item.buyer_ginner : '',
          // heap: '',
          lot_no: item.lot_no ? item.lot_no : '',
          reel_lot_no: item.reel_lot_no ? item.reel_lot_no : '',
          no_of_bales: item.no_of_bales ? Number(item.no_of_bales) : 0,
          press_no: item.press_no ? item.press_no : '',
          rate: item.rate ? item.rate : 0,
          lint_quantity: item.lint_quantity ? Number(item.lint_quantity) : '',
          old_weight: item.total_old_weight ? Number(item.total_old_weight) : 0,
          other_season_quantity: item.lint_process_seasons?.split(',').length > 1
          ? Number(item.other_season_quantity || item.previous_season_quantity || item.future_season_quantity || null)
          : item.previous_season_quantity
          ? Number(item.previous_season_quantity)
          : item.future_season_quantity
          ? Number(item.future_season_quantity)
          : '',
      
        other_season_bales: item.lint_process_seasons?.split(',').length > 1
          ? Number(item.other_season_bales || item.previous_season_bales || item.future_season_bales || null)
          : item.previous_season_bales
          ? Number(item.previous_season_bales)
          : item.future_season_bales
          ? Number(item.future_season_bales)
          : '',
          sales_value: item.sale_value ? Number(item.sale_value) : 0,
          vehicle_no: item.vehicle_no ? item.vehicle_no : '',
          transporter_name: item.transporter_name ? item.transporter_name : '',
          program: item.program ? item.program : '',
          agentDetails: item.transaction_agent ? item.transaction_agent : 'NA',
          status: item.status === 'Sold' ? 'Sold' : `Available [Stock : ${item.qty_stock ? item.qty_stock : 0}]`
        });
        currentWorksheet.addRow(rowValues);
        totals.total_no_of_bales += item.no_of_bales ? Number(item.no_of_bales) : 0;
        totals.total_lint_quantity += item.lint_quantity ? Number(item.lint_quantity) : 0;
        totals.total_Sales_value += item.sale_value ? Number(item.sale_value) : 0;
        totals.total_rate += item.rate ? Number(item.rate ): 0;

      }
      offset += batchSize;   

    }

    if(currentWorksheet){
      AddTotalRow(currentWorksheet, totals);
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
      stream: fs.createWriteStream("./upload/ginner-pending-sales-report-test.xlsx"),
      useStyles: true,      
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
          attributes: ["id", "name", "country_id", "brand", "state_id"],
          include: [
            {
              model: Country,
              as: "country",
              attributes:["county_name"]
            },
            {
              model: State,
              as: "state",
              attributes:["state_name"]
            },
          ],
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
      {
        model: Ginner,
        as: "buyerdata_ginner",
        attributes: ["id", "name"],
      }
    ];


    interface Totals{  
      total_no_of_bales: 0,
      total_lint_quantity: 0,
      total_rate:0,
    };

    let totals: Totals = {  
      total_no_of_bales: 0,
      total_lint_quantity: 0,
      total_rate:0,
    };

    const AddTotalRow = (currentWorksheet: ExcelJS.Worksheet | undefined, totals : Totals) =>{

      if(currentWorksheet != undefined){
        const rowValues = Object.values({
          Index:"",
          country:"",
          state:"",
          date:"",
          season:"",
          ginner:"",
          invoice:"",
          buyer_type:"",
          buyer:"",
          lot_no:"",
          reel_lot_no:"Total",
          no_of_bales: Number(formatDecimal(totals.total_no_of_bales)),
          press_no:"",
          rate: Number(formatDecimal(totals.total_rate)),
          total_qty: Number(formatDecimal(totals.total_lint_quantity)),
          program:"",
          status:"",
        });
  
        currentWorksheet.addRow(rowValues).eachCell((cell, colNumber) => { cell.font={bold:true}});;
  
  
        const borderStyle = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
        
        // Auto-adjust column widths based on content
        currentWorksheet.columns.forEach((column: any) => {
          let maxCellLength = 0;
          column.eachCell({ includeEmpty: true }, (cell: any) => {
            const cellLength = (cell.value ? cell.value.toString() : "").length;
            maxCellLength = Math.max(maxCellLength, cellLength);
            cell.border = borderStyle;
          });
          column.width = Math.min(24, maxCellLength + 2); // Limit width to 30 characters
        });
      }
    };

    let currentWorksheet: ExcelJS.Worksheet| undefined = undefined;


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
          [Sequelize.col('"sales"."buyer_type"'), "buyer_type"],
          [Sequelize.col('"sales"."buyerdata_ginner"."name"'), "buyer_ginner"],
          [Sequelize.literal('"sales"."total_qty"'), "total_qty"],
          [Sequelize.literal('"sales"."invoice_no"'), "invoice_no"],
          [Sequelize.col('"sales"."lot_no"'), "lot_no"],
          [Sequelize.fn('STRING_AGG', Sequelize.literal('DISTINCT "bale->ginprocess"."reel_lot_no"'), ', '), "reel_lot_no"],
          [Sequelize.literal('"sales"."rate"'), "rate"],
          [Sequelize.literal('"sales"."candy_rate"'), "candy_rate"],
          [Sequelize.literal('"sales"."no_of_bales"'), "no_of_bales"],
          [Sequelize.literal('"sales"."press_no"'), "press_no"],
          [Sequelize.literal('"sales"."qty_stock"'), "qty_stock"],
          [Sequelize.literal('"sales"."weight_loss"'), "weight_loss"],
          [Sequelize.literal('"sales"."invoice_file"'), "invoice_file"],
          [Sequelize.literal('"sales"."status"'), "status"],
          [Sequelize.literal('"sales"."qr"'), "qr"],
          [sequelize.col('"sales"."ginner"."country"."county_name"'), "country_name"],
          [sequelize.col('"sales"."ginner"."state"."state_name"'), "state_name"],
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
        group: ['sales.id', "sales.season.id", "sales.ginner.id", "sales.buyerdata.id", "sales.program.id", "sales.buyerdata_ginner.id",
          "sales.ginner.country.id",
          "sales.ginner.state.id",
        ],
        offset: offset,
        limit: batchSize,
      })

      if (rows.length === 0) {
        hasNextBatch = false;
        break;
      }

      if (offset % maxRowsPerWorksheet === 0) {

        if(currentWorksheet){
          AddTotalRow(currentWorksheet, totals);
        }

        totals = {  
          total_no_of_bales: 0,
          total_lint_quantity: 0,
          total_rate:0,
        };

        worksheetIndex++;
      }

      currentWorksheet = workbook.getWorksheet(`Sheet${worksheetIndex}`);
      if (!currentWorksheet) {
        currentWorksheet = workbook.addWorksheet(`Sheet${worksheetIndex}`);
        // if (worksheetIndex == 1) {
        //   currentWorksheet.mergeCells("A1:O1");
        //   const mergedCell = currentWorksheet.getCell("A1");
        //   mergedCell.value = "CottonConnect | Ginner Pending Sales Report";
        //   mergedCell.font = { bold: true };
        //   mergedCell.alignment = { horizontal: "center", vertical: "middle" };
        //   // Set bold font for header row
        // }
        // Set bold font for header row
        const headerRow = currentWorksheet.addRow([
          "Sr No.",
          "Country",
          "State",
          "Date",
          "Season",
          "Ginner Name",
          "Invoice No",
          "Buyer Type",
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
          country: item.dataValues.country_name?item.dataValues.country_name:"",
          state: item.dataValues.state_name?item.dataValues.state_name:"",
          date: item.dataValues.date ? item.dataValues.date : "",
          season: item.dataValues.season_name ? item.dataValues.season_name : "",
          ginner: item.dataValues.ginner ? item.dataValues.ginner : "",
          invoice: item.dataValues.invoice_no ? item.dataValues.invoice_no : "",
          buyer_type: item.dataValues.buyer_type === 'Ginner' ? 'Ginner' : 'Spinner',
          buyer: item.dataValues.buyerdata ? item.dataValues.buyerdata : item.dataValues.buyer_ginner ? item.dataValues.buyer_ginner : '',
          lot_no: item.dataValues.lot_no ? item.dataValues.lot_no : "",
          reel_lot_no: item.dataValues.reel_lot_no ? item.dataValues.reel_lot_no : "",
          no_of_bales: item.dataValues.no_of_bales ? Number(item.dataValues.no_of_bales) : 0,
          press_no: item.dataValues.press_no ? item.dataValues.press_no : "",
          rate: item.dataValues.rate ? Number(item.dataValues.rate) : 0,
          total_qty: item.dataValues.total_qty ? Number(item.dataValues.total_qty) : 0,
          program: item.dataValues.program ? item.dataValues.program : "",
          status: item.dataValues.status ? item.dataValues.status : "",
        });
        currentWorksheet.addRow(rowValues);
        totals.total_no_of_bales += Number(item.dataValues.no_of_bales);
        totals.total_lint_quantity += Number(item.dataValues.total_qty);
        totals.total_rate += Number(item.dataValues.rate);

      }

      offset += batchSize;
    }

    if(currentWorksheet){
      AddTotalRow(currentWorksheet, totals);
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
      stream: fs.createWriteStream("./upload/ginner-seed-cotton-stock-report-test.xlsx"),
      useStyles: true,
    });

    const batchSize = 5000;
    let offset = 0;
    let worksheetIndex = 0;
    let hasNextBatch = true;

    let include = [
      {
        model: Ginner,
        as: "ginner",
        include: [
          {
            model: Country,
            as: "country",
          },
          {
            model: State,
            as: "state",
          }

        ],
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



    interface Totals{
      total_cotton_procured:0,
      total_cotton_processed:0,
      total_cotton_stock:0,
    };
    
    let totals : Totals= {
      total_cotton_procured:0,
      total_cotton_processed:0,
      total_cotton_stock:0,
    };



    const AddTotalRow = (currentWorksheet: ExcelJS.Worksheet | undefined, totals : Totals) =>{

      if(currentWorksheet != undefined){
        const rowValues = Object.values({
          index: "",
          ginner:  "",
          season:  "",
          country: "",
          state: "Total",
          cotton_procured: Number(formatDecimal( totals.total_cotton_procured)),
          cotton_processed: Number(formatDecimal(totals.total_cotton_processed)),
          cotton_stock: Number(formatDecimal(totals.total_cotton_stock)),
        });
        currentWorksheet.addRow(rowValues).eachCell((cell, colNumber) => { cell.font={bold:true}});;
  
        const borderStyle = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
  
  
        // Auto-adjust column widths based on content
        currentWorksheet.columns.forEach((column: any) => {
          let maxCellLength = 0;
          column.eachCell({ includeEmpty: true }, (cell: any) => {
            const cellLength = (cell.value ? cell.value.toString() : "").length;
            maxCellLength = Math.max(maxCellLength, cellLength);
            cell.border = borderStyle;
          });
          column.width = Math.min(14, maxCellLength + 2); // Limit width to 30 characters
        });
      }
    };

    let currentWorksheet: ExcelJS.Worksheet| undefined = undefined;
    



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
        group: ["ginner.id", "season.id", "ginner.country.id", "ginner->state.id"],
        order: [["ginner_name", "ASC"]],
        offset: offset,
        limit: batchSize,
      });

      if (rows.length === 0) {
        hasNextBatch = false;
        break;
      }

      if (offset % maxRowsPerWorksheet === 0) {

        if(currentWorksheet){
          AddTotalRow(currentWorksheet, totals);
        
        }
        totals = {
          total_cotton_procured:0,
          total_cotton_processed:0,
          total_cotton_stock:0,
        };
        worksheetIndex++;
      }

      currentWorksheet = workbook.getWorksheet(`Sheet${worksheetIndex}`);
      if (!currentWorksheet) {
        currentWorksheet = workbook.addWorksheet(`Sheet${worksheetIndex}`);
        // if (worksheetIndex == 1) {
        //   currentWorksheet.mergeCells("A1:F1");
        //   const mergedCell = currentWorksheet.getCell("A1");
        //   mergedCell.value = "CottonConnect | Ginner Seed Cotton Stock Report";
        //   mergedCell.font = { bold: true };
        //   mergedCell.alignment = { horizontal: "center", vertical: "middle" };
        //   // Set bold font for header row
        // }
        // Set bold font for header row
        const headerRow = currentWorksheet.addRow([
          "Sr No.",
          "Ginner Name",
          "Season",
          "Country",
          "State",
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

        const cottonProcessed = await CottonSelection.findOne({
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
            '$ginprocess.ginner_id$': item.ginner_id,
            '$ginprocess.season_id$': item.season_id,
          },
          group: ["ginprocess.ginner_id"]
        });
  
        const cottonProcessedByHeap = await heapSelection.findOne({
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
            '$ginprocess.ginner_id$': item.ginner_id,
            '$ginprocess.season_id$': item.season_id,
          },
          group: ["ginprocess.ginner_id"]
        });
        const cottonProcessedQty = isNaN(cottonProcessed?.dataValues?.qty) ? 0 : cottonProcessed?.dataValues?.qty;
        const cottonProcessedByHeapQty = isNaN(cottonProcessedByHeap?.dataValues?.qty) ? 0 : cottonProcessedByHeap?.dataValues?.qty;
        const totalCottonProcessedQty = cottonProcessedQty + cottonProcessedByHeapQty;
  

        obj.cotton_procured = cottonProcured?.dataValues?.cotton_procured ?? 0;
        obj.cotton_stock = cottonProcured?.dataValues?.cotton_stock ?? 0;
        obj.cotton_processed = totalCottonProcessedQty ?? 0;

        const rowValues = Object.values({
          index: index + offset + 1,
          ginner: item?.dataValues.ginner_name ? item?.dataValues.ginner_name : "",
          season: item?.dataValues.season_name ? item?.dataValues.season_name : "",
          country: item?.dataValues.ginner.country.county_name,
          state: item?.dataValues.ginner.state.state_name,
          cotton_procured: obj.cotton_procured ? Number(obj.cotton_procured) : 0,
          cotton_processed: obj.cotton_processed ? Number(obj.cotton_processed) : 0,
          cotton_stock: obj.cotton_stock ? Number(obj.cotton_stock) : 0,
        });

        totals.total_cotton_processed += obj.cotton_processed?Number(obj.cotton_processed):0;
        totals.total_cotton_procured += obj.cotton_procured?Number(obj.cotton_procured):0;
        totals.total_cotton_stock += obj.cotton_stock?Number(obj.cotton_stock):0;

        currentWorksheet.addRow(rowValues);
      }

    

      offset += batchSize;
    }

    if(currentWorksheet){
      AddTotalRow(currentWorksheet, totals);
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
      stream: fs.createWriteStream("./upload/spinner-summary-test.xlsx"),
      useStyles: true,
    });
    let worksheetIndex = 0;

    const batchSize = 5000;
    let offset = 0;
    let hasNextBatch = true;

    interface Totals{
      total_lint_cotton_procured:0,
      total_lint_cotton_procured_pending:0,
      total_lint_consumed:0,
      total_lintGreyoutMT:0,
      total_lintActualStockMT:0,
      total_balance_lint_cotton:0,
      total_yarn_procured:0,
      total_yarn_sold:0,
      total_yarnGreyoutMT:0,
      total_yarnActualStockMT:0,
      total_yarn_stock:0,
    }


    let totals : Totals = {
      total_lint_cotton_procured:0,
      total_lint_cotton_procured_pending:0,
      total_lint_consumed:0,
      total_lintGreyoutMT:0,
      total_lintActualStockMT:0,
      total_balance_lint_cotton:0,
      total_yarn_procured:0,
      total_yarn_sold:0,
      total_yarnGreyoutMT:0,
      total_yarnActualStockMT:0,
      total_yarn_stock:0,
    };



    const AddTotalRow = (currentWorksheet: ExcelJS.Worksheet | undefined, totals : Totals) =>{

      if(currentWorksheet != undefined){
        const rowVal ={
          index:"",
          country:"",
          state:"",
          name:"Total",
          lint_cotton_procured:Number(formatDecimal(totals.total_lint_cotton_procured)),
          lint_cotton_procured_pending:Number(formatDecimal(totals.total_lint_cotton_procured_pending)),
          lint_consumed:Number(formatDecimal(totals.total_lint_consumed)),
          lintGreyoutMT:Number(formatDecimal(totals.total_lintGreyoutMT)),
          lintActualStockMT:Number(formatDecimal(totals.total_lintActualStockMT)),
          balance_lint_cotton:Number(formatDecimal(totals.total_balance_lint_cotton)),
          yarn_procured:Number(formatDecimal(totals.total_yarn_procured)),
          yarn_sold:Number(formatDecimal(totals.total_yarn_sold)),
          yarnGreyoutMT:Number(formatDecimal(totals.total_yarnGreyoutMT)),
          yarnActualStockMT:Number(formatDecimal(totals.total_yarnActualStockMT)),
          yarn_stock:Number(formatDecimal(totals.total_yarn_stock)),
        }; 
        const rowValues = Object.values(rowVal);
        currentWorksheet?.addRow(rowValues).eachCell((cell) => { cell.font={bold:true}});
  
  
        const borderStyle = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },      
        }
    
        // Auto-adjust column widths based on content
        currentWorksheet?.columns.forEach((column: any) => {
          let maxCellLength = 0;
          column.eachCell({ includeEmpty: true }, (cell: any) => {
            const cellLength = (cell.value ? cell.value.toString() : "").length;
            maxCellLength = Math.max(maxCellLength, cellLength);
            cell.border = borderStyle;
          });
          column.width = Math.min(14, maxCellLength + 2); // Limit width to 30 characters
        });
      }
    };

    let currentWorksheet: ExcelJS.Worksheet| undefined = undefined;



    while (hasNextBatch) {
      let { count, rows } = await Spinner.findAndCountAll({
        where: whereCondition,
        attributes: ["id", "name", "address", "country_id", "state_id"],
        offset: offset,
        limit: batchSize,
        include: [
          {
            model: Country,
            as: "country",
            attributes: ["id", "county_name"],
          },
          {
            model: State,
            as: "state",
            attributes: ["id", "state_name"],
          }
        ],
        order: [["name", "asc"]],
      });

      if (rows.length === 0) {
        hasNextBatch = false;
        break;
      }

      if (offset % maxRowsPerWorksheet === 0) {

        if(currentWorksheet){
          AddTotalRow(currentWorksheet, totals);        
        }

        totals = {
          total_lint_cotton_procured:0,
          total_lint_cotton_procured_pending:0,
          total_lint_consumed:0,
          total_lintGreyoutMT:0,
          total_lintActualStockMT:0,
          total_balance_lint_cotton:0,
          total_yarn_procured:0,
          total_yarn_sold:0,
          total_yarnGreyoutMT:0,
          total_yarnActualStockMT:0,
          total_yarn_stock:0,
        };
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
                { "$sales.status$": 'Sold' }
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
              "$spinprocess.spinner_id$": item.id,
            },
            group: ["spinprocess.spinner_id"],
          }),
          GinSales.findOne({
            attributes: [
              [
                sequelize.fn(
                  "COALESCE",
                  sequelize.fn(
                    "SUM",
                    sequelize.literal(`
                      CASE 
                        WHEN greyout_status = true THEN qty_stock 
                        WHEN greyout_status = false AND greyed_out_qty IS NOT NULL THEN greyed_out_qty 
                        ELSE 0 
                      END
                    `)
                  ),
                  0
                ),
                "lint_greyout",
              ],
            ],
            where: {
              ...wheree,
              buyer: item.id,
              status: { [Op.in]: ['Sold', 'Partially Accepted', 'Partially Rejected'] },
              [Op.or]: [
                { greyout_status: true },
                { greyout_status: false,  greyed_out_qty: { [Op.gt]: 0 } },
              ],
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
          ? Number(lint_cotton_procured_pending?.dataValues.lint_cotton_procured_pending ?? 0)
          : 0;
        obj.lintConsumedKG = lint_consumed
          ? Number(lint_consumed?.dataValues.lint_cotton_consumed ?? 0)
          : 0;
        obj.lintStockKG = lint_cotton_stock
          ? Number(lint_cotton_stock?.dataValues.lint_cotton_stock ?? 0)
          : 0;

        obj.lintGreyoutKg = lint_greyout?.dataValues.lint_greyout ?? 0;

        obj.lintActualStockKg = Number(obj.lintStockKG) > Number(obj.lintGreyoutKg)
          ? Number(obj.lintStockKG) - (Number(obj.lintGreyoutKg))
          : 0;

        obj.yarnProcuredKG = yarnProcured
          ? Number(yarnProcured?.dataValues.yarn_procured ?? 0)
          : 0;
        obj.yarnSoldKG = yarnSold ? Number(yarnSold.dataValues.yarn_sold ?? 0) : 0;
        obj.yarnStockKG = yarnProcured
          ? Number(yarnProcured?.dataValues.yarn_stock ?? 0)
          : 0;

        obj.yarnGreyoutKg = yarnGreyout?.dataValues.yarn_greyout ?? 0;

        obj.yarnActualStockKg = Number(obj.yarnStockKG) > Number(obj.yarnGreyoutKg)
          ? Number(obj.yarnStockKG) - (Number(obj.yarnGreyoutKg))
          : 0;
        obj.lintCottonProcuredMT = Number(convert_kg_to_mt(obj.lintCottonProcuredKG)) ?? 0;
        obj.lintCottonProcuredPendingMT = Number(convert_kg_to_mt(obj.lintCottonProcuredPendingKG)) ?? 0;
        obj.lintConsumedMT = Number(convert_kg_to_mt(obj.lintConsumedKG));
        obj.lintStockMT = Number(convert_kg_to_mt(obj.lintStockKG));
        obj.lintGreyoutMT = convert_kg_to_mt(obj.lintGreyoutKg);
        obj.lintActualStockMT = convert_kg_to_mt(obj.lintActualStockKg);
        obj.yarnSoldMT = Number(convert_kg_to_mt(obj.yarnSoldKG));
        obj.yarnProcuredMT = Number(convert_kg_to_mt(obj.yarnProcuredKG));
        obj.yarnGreyoutMT = convert_kg_to_mt(obj.yarnGreyoutKg);
        obj.yarnActualStockMT = convert_kg_to_mt(obj.yarnActualStockKg);
        obj.yarnStockMT = Number(convert_kg_to_mt(obj.yarnStockKG));


        const rowVal ={
          index: index + 1,
          country: item.country.county_name,
          state: item.state.state_name,
          name: item.name ? item.name : "",
          lint_cotton_procured: obj.lintCottonProcuredMT ? Number(obj.lintCottonProcuredMT) : 0,
          lint_cotton_procured_pending: obj.lintCottonProcuredPendingMT ? Number(obj.lintCottonProcuredPendingMT) : 0,
          lint_consumed: obj.lintConsumedMT ? Number(obj.lintConsumedMT) : 0,
          lintGreyoutMT: obj.lintGreyoutMT ? Number(obj.lintGreyoutMT) : 0,
          lintActualStockMT: obj.lintActualStockMT ? Number(obj.lintActualStockMT) : 0,
          balance_lint_cotton: obj.lintStockMT ? Number(obj.lintStockMT) : 0,
          yarn_procured: obj.yarnProcuredMT ? Number(obj.yarnProcuredMT) : 0,
          yarn_sold: obj.yarnSoldMT ? Number(obj.yarnSoldMT) : 0,
          yarnGreyoutMT: obj.yarnGreyoutMT ? Number(obj.yarnGreyoutMT) : 0,
          yarnActualStockMT: obj.yarnActualStockMT ? Number(obj.yarnActualStockMT) : 0,
          yarn_stock: obj.yarnStockMT ? Number(obj.yarnStockMT) : 0,
        }; 

        totals.total_lint_cotton_procured+=Number(rowVal.lint_cotton_procured);
        totals.total_lint_cotton_procured_pending+=Number(rowVal.lint_cotton_procured_pending);
        totals.total_lint_consumed+=Number(rowVal.lint_consumed);
        totals.total_lintGreyoutMT+=Number(rowVal.lintGreyoutMT);
        totals.total_lintActualStockMT+=Number(rowVal.lintActualStockMT);
        totals.total_balance_lint_cotton+=Number(rowVal.balance_lint_cotton);
        totals.total_yarn_procured+=Number(rowVal.yarn_procured);
        totals.total_yarn_sold+=Number(rowVal.yarn_sold);
        totals.total_yarnGreyoutMT+=Number(rowVal.yarnGreyoutMT);
        totals.total_yarnActualStockMT+=Number(rowVal.yarnActualStockMT);
        totals.total_yarn_stock+=Number(rowVal.yarn_stock);

        const rowValues = Object.values(rowVal);

        currentWorksheet = workbook.getWorksheet(`Spinner Summary ${worksheetIndex}`);
        if (!currentWorksheet) {
          currentWorksheet = workbook.addWorksheet(`Spinner Summary ${worksheetIndex}`);
          // if (worksheetIndex == 1) {
          //   currentWorksheet.mergeCells("A1:M1");
          //   const mergedCell = currentWorksheet.getCell("A1");
          //   mergedCell.value = "CottonConnect | Spinner Summary Report";
          //   mergedCell.font = { bold: true };
          //   mergedCell.alignment = { horizontal: "center", vertical: "middle" };
          // }

          const headerRow = currentWorksheet.addRow([
            "Sr No.",
            "Country",
            "State",
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

        currentWorksheet.addRow(rowValues);
      }
      offset += batchSize;

    
    }

    if(currentWorksheet){
      AddTotalRow(currentWorksheet, totals);
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

    // const whereClause = whereCondition.length > 0 ? `WHERE ${whereCondition.join(' AND ')}` : '';
    const whereClause = whereCondition.length > 0 ? `WHERE ${whereCondition.join(' AND ')} AND bd.total_qty > 0` : 'WHERE bd.total_qty > 0';

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: fs.createWriteStream("./upload/Spinner-bale-receipt-report-test.xlsx"),
      useStyles: true,
      
    });
    let worksheetIndex = 0;


    const batchSize = 5000;
    let offset = 0;
    let hasNextBatch = true;


    interface Totals{
      total_no_of_bales:0,
      total_lint_quantity: 0,

    };

    let totals: Totals = {
      total_no_of_bales:0,
      total_lint_quantity: 0,

    };

    const AddTotalRow = (currentWorksheet: ExcelJS.Worksheet | undefined, totals : Totals) =>{

      if(currentWorksheet != undefined){
        const rowValues = Object.values({
          index:"",
          country:"",
          state:"",
          accept_date:"",
          date:"",
          no_of_days:"",
          season:"",
          spinner:"",
          ginner:"",
          invoice:"",
          lot_no:"",
          reel_lot_no:"",
          press_no:"Total",
          no_of_bales: Number(formatDecimal(totals.total_no_of_bales)),
          lint_quantity: Number(formatDecimal(totals.total_lint_quantity)),
          program:"",
          greyout_status:"",
        });
  
        let currentWorksheet = workbook.getWorksheet(`Spinner Bale Receipt ${worksheetIndex}`);
        currentWorksheet?.addRow(rowValues).eachCell(cell=>{ cell.font={bold:true}});
  
        const borderStyle = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },      
        }
  
     
        // Auto-adjust column widths based on content
        currentWorksheet?.columns.forEach((column: any) => {
          let maxCellLength = 0;
          column.eachCell({ includeEmpty: true }, (cell: any) => {
            const cellLength = (cell.value ? cell.value.toString() : "").length;
            maxCellLength = Math.max(maxCellLength, cellLength);
            cell.border = borderStyle;
          });
          column.width = Math.min(14, maxCellLength + 2); // Limit width to 30 characters
        });
      }
    };

    let currentWorksheet: ExcelJS.Worksheet| undefined = undefined;
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
                    EXTRACT(DAY FROM ( gs."accept_date" - gs."createdAt")) AS no_of_days,
                    g.id AS ginner_id, 
                    g.name AS ginner, 
                    sp.country_id as country_id,
                    sp.state_id as state_id,
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
                    "spinner" asc
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

        if(currentWorksheet){
          AddTotalRow(currentWorksheet, totals);
        }

        totals = {
          total_no_of_bales:0,
          total_lint_quantity: 0,
        };
        worksheetIndex++;
      }



      for await (const [index, item] of rows.entries()) {


        const country = await Country.findOne({
          where: { id: item.country_id },
        });
        const state = await State.findOne({
          where: { id: item.state_id },
        });

        const rowValues = Object.values({
          index: index + offset + 1,
          country: country ? country.dataValues.county_name : '',
          state: state ? state.dataValues.state_name : '',
          accept_date: item.accept_date
            ? item.accept_date
            : "",
          date: item.date ? item.date : "",
          no_of_days: item.no_of_days? Number(item.no_of_days):"",
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
          greyed_out_qty: item.greyed_out_qty
            ? Number(item.greyed_out_qty)
            : 0,
          program: item.program ? item.program : "",
          greyout_status: item.greyout_status ? "Yes" : "No",
        });

        currentWorksheet = workbook.getWorksheet(`Spinner Bale Receipt ${worksheetIndex}`);
        if (!currentWorksheet) {
          currentWorksheet = workbook.addWorksheet(`Spinner Bale Receipt ${worksheetIndex}`);
          // if (worksheetIndex == 1) {
          //   currentWorksheet.mergeCells("A1:O1");
          //   const mergedCell = currentWorksheet.getCell("A1");
          //   mergedCell.value = "CottonConnect | Spinner Bale Receipt Report";
          //   mergedCell.alignment = { horizontal: "center", vertical: "middle" };
          //   mergedCell.font = { bold: true };
          // }

          const headerRow = currentWorksheet.addRow([
            "Sr No.",
            "Country",
            "State",
            "Date of transaction accepted",
            "Date of transaction received",
            "No. of Days",
            "Season",
            "Spinner Name",
            "Ginner Name",
            "Invoice Number",
            "Ginner Lot No",
            "REEL Lot No",
            "Press/Bale No",
            "No of Bales(Accepted)",
            "Total Lint Accepted Quantity(Kgs)",
            "Lint Greyed Out After Verification(Kgs)",
            "Programme",
            "Grey Out Status",
          ]);
          headerRow.font = { bold: true };
        }

        totals.total_no_of_bales += Number(item.accepted_no_of_bales);
        totals.total_lint_quantity += Number(item.accepted_total_qty);

        currentWorksheet.addRow(rowValues);
      }

    
      offset += batchSize;
    }

    if(currentWorksheet){
      AddTotalRow(currentWorksheet, totals);
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
      stream: fs.createWriteStream("./upload/spinner-yarn-process-test.xlsx"),
      useStyles: true,

    });
    let worksheetIndex = 0;

    const batchSize = 5000;
    let offset = 0;

    let hasNextBatch = true;


    interface Totals{
      total_comber:0,
      total_cotton_consumed:0,
      total_comber_consumed:0,
      total_total_lint_blend_consumed:0,
      total_total:0,
      total_yarn_sold:0,
      total_yarn_stock:0,
      total_blend_qty:0
    };

    let totals: Totals = {
      total_comber:0,
      total_cotton_consumed:0,
      total_comber_consumed:0,
      total_total_lint_blend_consumed:0,
      total_total:0,
      total_yarn_sold:0,
      total_yarn_stock:0,
      total_blend_qty:0
    };


    const AddTotalRow = (currentWorksheet: ExcelJS.Worksheet | undefined, totals : Totals) =>{

      if(currentWorksheet != undefined){
        let rowValues;
        rowValues = {
             index:"",
             country:"",
             state:"",
             createdAt:"",
             date:"",
             no_of_days:"",
             from_date:"",
             to_date:"",
             lint_consumed_seasons:"",
             season:"",
             spinner:"",
             lotNo:"",
             reel_lot_no:"",
             yarnType:"",
             count:"",
             resa:"Total",
             comber: Number(formatDecimal(totals.total_comber)),
             blend: "",
             blendqty: "",
             total_blend_qty:Number(formatDecimal(totals.total_blend_qty)),
             cotton_consumed: Number(formatDecimal(totals.total_cotton_consumed)),
             cotton_consumed_current_season: "",
             cotton_consumed_other_seasons: "",
             comber_consumed: Number(formatDecimal(totals.total_comber_consumed)),
             comber_consumed_current_season: "",
             comber_consumed_other_seasons: "",
             total_lint_blend_consumed: Number(formatDecimal(totals.total_total_lint_blend_consumed)),
             program:"",
             total: Number(formatDecimal(totals.total_total)),
             yarn_sold: Number(formatDecimal(totals.total_yarn_sold)),
             yarn_stock: Number(formatDecimal(totals.total_yarn_stock)),
             greyout_status:"",
           }
           let currentWorksheet = workbook.getWorksheet(`Spinner Yarn Process ${worksheetIndex}`);
           currentWorksheet?.addRow(Object.values(rowValues)).eachCell(cell=> cell.font={bold:true});
           const borderStyle = {
             top: { style: "thin" },
             left: { style: "thin" },
             bottom: { style: "thin" },
             right: { style: "thin" },      
           }
       
           // Auto-adjust column widths based on content
           currentWorksheet?.columns.forEach((column: any) => {
             let maxCellLength = 0;
             column.eachCell({ includeEmpty: true }, (cell: any) => {
               const cellLength = (cell.value ? cell.value.toString() : "").length;
               maxCellLength = Math.max(maxCellLength, cellLength);
               cell.border = borderStyle;
             });
             column.width = Math.min(14, maxCellLength + 2); // Limit width to 30 characters
           });
 
      }
      
    };

    let currentWorksheet: ExcelJS.Worksheet| undefined = undefined;

    while (hasNextBatch) {
      const dataQuery = `
        WITH spin_process_data AS (
          SELECT
            spin_process.id AS process_id,
            spin_process.date,
            spin_process.from_date,
            spin_process.to_date,
            spin_process."createdAt",
            EXTRACT(DAY FROM (spin_process."createdAt" - spin_process.date)) AS no_of_days,
            season.id AS season_id,
            season.name AS season_name,
            spinner.name AS spinner_name,
            spinner.country_id AS country_id,
            spinner.state_id AS state_id,
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
            spd.process_id,
            COALESCE(SUM(ls.qty_used), 0) AS cotton_consumed,
            COALESCE(SUM(CASE WHEN gs.season_id = spd.season_id THEN ls.qty_used ELSE 0 END), 0) AS cotton_consumed_current_season,
            COALESCE(SUM(CASE WHEN gs.season_id != spd.season_id THEN ls.qty_used ELSE 0 END), 0) AS cotton_consumed_other_seasons,
            STRING_AGG(DISTINCT s.name, ', ') AS seasons
          FROM spin_process_data spd
          LEFT JOIN lint_selections ls ON spd.process_id = ls.process_id
          LEFT JOIN gin_sales gs ON ls.lint_id = gs.id
          LEFT JOIN seasons s ON gs.season_id = s.id
          GROUP BY spd.process_id
        ),
        comber_consumed_data AS (
          SELECT
            spd.process_id,
            COALESCE(SUM(cs.qty_used), 0) AS comber_consumed,
            COALESCE(SUM(CASE WHEN spd.season_id = spd_season.season_id THEN cs.qty_used ELSE 0 END), 0) AS comber_consumed_current_season,
            COALESCE(SUM(CASE WHEN spd.season_id != spd_season.season_id THEN cs.qty_used ELSE 0 END), 0) AS comber_consumed_other_seasons,
            STRING_AGG(DISTINCT s.name, ', ') AS seasons
          FROM spin_process_data spd
          LEFT JOIN comber_selections cs ON spd.process_id = cs.process_id
          LEFT JOIN combernoil_generations cg ON cs.yarn_id = cg.id
          LEFT JOIN spin_processes spd_season ON cg.process_id = spd_season.id
          LEFT JOIN seasons s ON spd_season.season_id = s.id
          GROUP BY spd.process_id
        ),
        yarn_sold_data AS (
          SELECT
            spd.process_id,
            COALESCE(SUM(spys.qty_used), 0) AS yarn_sold
          FROM spin_process_data spd
          LEFT JOIN spin_process_yarn_selections spys ON spd.process_id = spys.spin_process_id
          GROUP BY spd.process_id
        ),
        yarn_count_data AS (
          SELECT
            spd.process_id,
            STRING_AGG(DISTINCT yc."yarnCount_name", ',') AS yarncount
          FROM spin_process_data spd
          LEFT JOIN yarn_counts yc ON yc.id = ANY(spd.yarn_count)
          GROUP BY spd.process_id
        ),
        total_blend_data AS (
          SELECT 
            spd.process_id,
            SUM(uq.val) AS total_blend_qty,
            STRING_AGG(DISTINCT cm."cottonMix_name", ', ') AS cotton_mix_name
          FROM spin_process_data spd
          LEFT JOIN LATERAL unnest(spd.cottonmix_qty) WITH ORDINALITY AS uq(val, idx) ON true
          LEFT JOIN LATERAL unnest(spd.cottonmix_type) WITH ORDINALITY AS ut(type_id, idx) ON uq.idx = ut.idx
          LEFT JOIN cotton_mixes cm ON cm.id = ut.type_id
          GROUP BY spd.process_id
        )
        SELECT
          spd.*,
          c.county_name AS country,
          s.state_name AS state,
          COALESCE(ccd.cotton_consumed, 0) AS cotton_consumed,
          COALESCE(csd.comber_consumed, 0) AS comber_consumed,
          ccd.seasons AS lint_consumed_seasons,
          COALESCE(ysd.yarn_sold, 0) AS yarn_sold,
          COALESCE(tbd.total_blend_qty, 0) AS total_blend_qty,
          tbd.cotton_mix_name AS cotton_mix_name,
          csd.seasons AS comber_consumed_seasons,
          COALESCE(ccd.cotton_consumed_current_season, 0) AS cotton_consumed_current_season,
          COALESCE(ccd.cotton_consumed_other_seasons, 0) AS cotton_consumed_other_seasons,
          COALESCE(csd.comber_consumed_current_season, 0) AS comber_consumed_current_season,
          COALESCE(csd.comber_consumed_other_seasons, 0) AS comber_consumed_other_seasons,
          ycd.yarncount
        FROM
          spin_process_data spd
        LEFT JOIN
          cotton_consumed_data ccd ON spd.process_id = ccd.process_id
        LEFT JOIN
          comber_consumed_data csd ON spd.process_id = csd.process_id
        LEFT JOIN
          yarn_sold_data ysd ON spd.process_id = ysd.process_id
        LEFT JOIN
          yarn_count_data ycd ON spd.process_id = ycd.process_id
        LEFT JOIN
          total_blend_data tbd ON spd.process_id = tbd.process_id
        LEFT JOIN
            countries c ON spd.country_id = c.id
        LEFT JOIN
            states s ON spd.state_id = s.id
        ORDER BY
          spd.spinner_name ASC
        LIMIT :limit OFFSET :offset
        `;

      // Execute the queries
      const rows = await sequelize.query(dataQuery, {
        replacements: { limit: batchSize, offset },
        type: sequelize.QueryTypes.SELECT,
      });

      if (rows.length === 0) {
        hasNextBatch = false;
        break;
      }

      if (offset % maxRowsPerWorksheet === 0) {
        if(currentWorksheet){
          AddTotalRow(currentWorksheet, totals);
         
        
        }

        totals = {
          total_comber:0,
          total_cotton_consumed:0,
          total_comber_consumed:0,
          total_total_lint_blend_consumed:0,
          total_total:0,
          total_yarn_sold:0,
          total_yarn_stock:0,
          total_blend_qty:0,
        };
        worksheetIndex++;
      }

      


      // Append data to worksheet
      for await (const [index, item] of rows.entries()) {
        let blendValue = "";
        let blendqty = "";
        let yarnCount = "";

        if (item.cottonmix_qty && item.cottonmix_qty.length > 0) {
          for (let obj of item.cottonmix_qty) {
            blendqty += `${obj},`;
          }
        }

        const rowValues = {
          index: index + offset + 1,
          country: item.country? item.country:"",
          state: item.state? item.state: "",
          createdAt: item.createdAt ? item.createdAt : "",
          date: item.date ? item.date : "",
          no_of_days: item.no_of_days ? Number(item.no_of_days) : "",
          from_date: item.from_date ? item.from_date : "",
          to_date: item.to_date ? item.to_date : "",
          lint_consumed_seasons: item.lint_consumed_seasons ? item.lint_consumed_seasons : "",
          season: item.season_name ? item.season_name : "",
          spinner: item.spinner_name ? item.spinner_name : "",
          lotNo: item.batch_lot_no ? item.batch_lot_no : "",
          reel_lot_no: item.reel_lot_no ? item.reel_lot_no : "",
          yarnType: item.yarn_type ? item.yarn_type : "",
          count: item.yarncount ? item.yarncount : "",
          resa: item.yarn_realisation ? Number(item.yarn_realisation) : 0,
          comber: item.comber_noil ? Number(item.comber_noil) : 0,
          blend: item.cotton_mix_name ? item.cotton_mix_name : "",
          blendqty: blendqty,
          total_blend_qty:item?.total_blend_qty
          ? Number(item?.total_blend_qty)
          : 0,
          cotton_consumed: item?.cotton_consumed
            ? Number(item?.cotton_consumed)
            : 0,
          cotton_consumed_current_season: item?.cotton_consumed_current_season
            ? Number(item?.cotton_consumed_current_season)
            : 0,
          cotton_consumed_other_seasons: item?.cotton_consumed_other_seasons
            ? Number(item?.cotton_consumed_other_seasons)
            : 0,
          comber_consumed: item?.comber_consumed
            ? Number(item?.comber_consumed)
            : 0,
          comber_consumed_current_season: item?.comber_consumed_current_season
            ? Number(item?.comber_consumed_current_season)
            : 0,
          comber_consumed_other_seasons: item?.comber_consumed_other_seasons
            ? Number(item?.comber_consumed_other_seasons)
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
        };

         currentWorksheet = workbook.getWorksheet(`Spinner Yarn Process ${worksheetIndex}`);
        if (!currentWorksheet) {
          currentWorksheet = workbook.addWorksheet(`Spinner Yarn Process ${worksheetIndex}`);
          // if (worksheetIndex == 1) {
          //   currentWorksheet.mergeCells("A1:X1");
          //   const mergedCell = currentWorksheet.getCell("A1");
          //   mergedCell.value = "CottonConnect | Spinner Yarn Process Report";
          //   mergedCell.font = { bold: true };
          //   mergedCell.alignment = { horizontal: "center", vertical: "middle" };
          // }

          const headerRow = currentWorksheet.addRow([
            "Sr No.",
            "Country",
            "State",
            "Date and Time",
            "Process Date",
            "No of Days",
            "Yarn Production Start Date",
            "Yarn Production End Date",
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
            "Total Blend Quantity(Kgs)",
            "Total Lint cotton consumed (Kgs)",
            "Total Lint cotton consumed Current Season (Kgs)",
            "Total Lint cotton consumed Other Seasons (Kgs)",
            "Total Comber Noil Consumed(kgs)",
            "Total Comber Noil Consumed Current Season (Kgs)",
            "Total Comber Noil Consumed Other Seasons (Kgs)",
            "Total lint + Blend material + Comber Noil consumed",
            "Programme",
            "Total Yarn weight (Kgs)",
            "Total yarn sold (Kgs)",
            "Total Yarn in stock (Kgs)",
            "Grey Out Status",
          ]);
          headerRow.font = { bold: true };
        }

        totals.total_comber+=Number(rowValues.comber);

        totals.total_cotton_consumed+=Number(rowValues.cotton_consumed);
        totals.total_comber_consumed+=Number(rowValues.comber_consumed);
        totals.total_total_lint_blend_consumed+=Number(rowValues.total_lint_blend_consumed);
        totals.total_total+=Number(rowValues.total);
        totals.total_yarn_sold+=Number(rowValues.yarn_sold);
        totals.total_yarn_stock+=Number(rowValues.yarn_stock);
        totals.total_blend_qty += Number(rowValues.total_blend_qty);

        currentWorksheet.addRow(Object.values(rowValues));
      }

      offset += batchSize;
     
    }

    if(currentWorksheet){
      AddTotalRow(currentWorksheet, totals);
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
      stream: fs.createWriteStream("./upload/spinner-yarn-sale-test.xlsx"),
      useStyles: true,

    });
    let worksheetIndex = 0;


    const batchSize = 5000;
    let offset = 0;
    let hasNextBatch = true;

    let include = [
      {
        model: Spinner,
        as: "spinner",
        attributes: ["id", "name", "country_id", "state_id"],
          include:[
            {
              model: Country,
              as: "country",
            },
            {
              model: State,
              as: "state",
            }
          ],
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


    interface Totals{
      total_price:0,
      total_net_weight:0,
    };

    let totals : Totals= {
      total_price:0,
     total_net_weight:0,
   };





   const AddTotalRow = (currentWorksheet: ExcelJS.Worksheet | undefined, totals : Totals) =>{

    if(currentWorksheet != undefined){
      const rowValues ={
        index:"",
        country:"",
        state:"",
        createdAt:"",
        date:"",
        no_of_days:"",
        lint_consumed_seasons:"",
        season:"",
        spinner:"",
        buyer_id:"",
        invoice:"",
        order_ref:"",
        lotNo:"",
        reelLot:"",
        program:"",
        yarnType:"",
        count:"",
        boxes:"",
        boxId:"Total",
        price: Number(formatDecimal(totals.total_price)),
        total: Number(formatDecimal(totals.total_net_weight)),
        transporter_name:"",
        vehicle_no:"",
        agent:"",


        
      };
      let currentWorksheet = workbook.getWorksheet(`Spinner Yarn Sales ${worksheetIndex}`);
      currentWorksheet?.addRow( Object.values(rowValues)).eachCell(cell=> cell.font={bold:true});
      let borderStyle = {
        top: {style: "thin"},
        left: {style: "thin"},
        bottom: {style: "thin"},
        right: {style: "thin"}
      };
      // Auto-adjust column widths based on content
      currentWorksheet?.columns.forEach((column: any) => {
        let maxCellLength = 0;
        column.eachCell({ includeEmpty: true }, (cell: any) => {
          const cellLength = (cell.value ? cell.value.toString() : "").length;
          maxCellLength = Math.max(maxCellLength, cellLength);
          cell.border = borderStyle;
        });
        column.width = Math.min(14, maxCellLength + 2); // Limit width to 30 characters
      });
    }
    
  };

  let currentWorksheet: ExcelJS.Worksheet| undefined = undefined;


    while (hasNextBatch) {

      const rows: any = await SpinProcessYarnSelection.findAll(
        {
          attributes: [
            [Sequelize.literal('"sales"."id"'), "sales_id"],
            [Sequelize.literal('"sales"."date"'), "date"],
            [Sequelize.literal('"sales"."createdAt"'), "createdAt"],
            [Sequelize.literal('EXTRACT(DAY FROM ("sales"."createdAt" - "sales"."date"))'), "no_of_days"],
            [Sequelize.col('"sales"."season"."name"'), "season_name"],
            [Sequelize.col('"sales"."season"."id"'), "season_id"],
            [Sequelize.col('"sales"."spinner"."id"'), "spinner_id"],
            [Sequelize.col('"sales"."spinner"."name"'), "spinner"],
            [sequelize.col('"sales"."spinner"."country"."county_name"'),"country"],
            [sequelize.col('"sales"."spinner"."state"."state_name"'),"state"],
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
            [Sequelize.fn('STRING_AGG', Sequelize.literal('DISTINCT "process"."reel_lot_no"'), ','), "reel_lot_no"],
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
            "sales.spinner.country.id",
            "sales.spinner.state.id",
          ],
          order: [["spinner", "asc"]],
          offset: offset,
          limit: batchSize,
        }
      );


      if (rows.length === 0) {
        hasNextBatch = false;
        break;
      }

      if (offset % maxRowsPerWorksheet === 0) {

        if(currentWorksheet){
          AddTotalRow(currentWorksheet, totals);
        }
        totals = {
          total_price:0,
         total_net_weight:0,
       };

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

        const formatDate = (dateString: any) => {
          if (!dateString) return "";
          const date = new Date(dateString);

          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();

          return `${day}-${month}-${year}`;
        };

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
        const rowValues ={
          index: index + offset + 1,
          country: item.dataValues.country?item.dataValues.country:"",
          state: item.dataValues.state?item.dataValues.state:"",
          createdAt: item.dataValues.createdAt ? item.dataValues.createdAt : "",
          date: item.dataValues.date ? formatDate(item.dataValues.date) : "",
          no_of_days: item.dataValues.no_of_days? Number(item.dataValues.no_of_days):"",
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
        };

        currentWorksheet = workbook.getWorksheet(`Spinner Yarn Sales ${worksheetIndex}`);
        if (!currentWorksheet) {
          currentWorksheet = workbook.addWorksheet(`Spinner Yarn Sales ${worksheetIndex}`);
          // if (worksheetIndex == 1) {
          //   currentWorksheet.mergeCells("A1:U1");
          //   const mergedCell = currentWorksheet.getCell("A1");
          //   mergedCell.value = "CottonConnect | Spinner Yarn Sales Report";
          //   mergedCell.font = { bold: true };
          //   mergedCell.alignment = { horizontal: "center", vertical: "middle" };
          // }

          const headerRow = currentWorksheet.addRow([
            "Sr No.",
            "Country",
            "State",
            "Created Date and Time",
            "Date of transaction",
            "No. of Days",
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

        currentWorksheet.addRow( Object.values(rowValues));

        totals.total_price += Number(rowValues.price);
        totals.total_net_weight += Number(rowValues.total);

      }

   

      offset += batchSize;
    }

    if(currentWorksheet){
      AddTotalRow(currentWorksheet, totals);
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
  const whereCondition: any = {};
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
                array_agg(DISTINCT ss.invoice_no) AS invoice_no, 
                string_agg(DISTINCT ss.invoice_no, ', ') AS spnr_invoice_no,
                array_agg(DISTINCT k.name) AS knitter, 
                string_agg(DISTINCT k.name, ', ') AS knitters,
                array_agg(DISTINCT w.name) AS weaver,
                string_agg(DISTINCT w.name, ', ') AS weavers,
                array_agg(DISTINCT ss.processor_name) AS processor_name,
                string_agg(DISTINCT ss.processor_name, ', ') AS processor_names
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
                      unnest_data.process_id,
                      ARRAY_AGG(DISTINCT unnest_village_id) AS villages
                    FROM (
                      SELECT 
                        hs.process_id,
                        UNNEST(hs.village_id) AS unnest_village_id  -- Unnest the array of village_id
                      FROM
                        heap_selections hs
                    ) unnest_data
                    GROUP BY
                      unnest_data.process_id
                ) hs
            ) combined
            GROUP BY
                process_id
        ),
        village_names_data AS (
			      SELECT
                v.process_id AS ginprocess_id,
                UNNEST(v.village_names) AS village_names
            FROM(
                SELECT
                  cv.process_id,
                  ARRAY_AGG(DISTINCT v.village_name) AS village_names
                FROM
                  combined_village_data cv
                LEFT JOIN
                  villages v ON v.id = ANY(cv.village_ids)
                GROUP BY
                  cv.process_id
            ) v
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
          yc.processor_name,
		      ARRAY_AGG(DISTINCT vnd.village_names) AS village_names,
          lc.qr
        FROM 
          lintcomsumption lc
        LEFT JOIN 
          yarn_consumption yc ON lc.spinprocess_id = yc.spin_process_id
        LEFT JOIN 
              gin_bales gb ON gb.gin_sales_id = ANY(lc.spnr_lint_ids)
        LEFT JOIN 
          village_names_data vnd ON vnd.ginprocess_id = ANY(gb.gin_process_id)
        GROUP BY 
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
          yc.processor_name,
          lc.qr;`
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
              .filter((item: any) => item !== null && item !== undefined && item !== '')
            : [];

        let weaverName =
          item.weaver && item.weaver.length > 0
            ? item.weaver
              .map((val: any) => val)
              .filter((item: any) => item !== null && item !== undefined && item !== '')
            : [];

        let processorName =
          item.processor_name && item.processor_name.length > 0
            ? item.processor_name
              .map((val: any) => val)
              .filter((item: any) => item !== null && item !== undefined && item !== '')
            : [];

        let fbrc_name = [...new Set([...knitterName, ...weaverName, ...processorName])];

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
          item.village_names && item.village_names.length > 0 ? item.village_names.join(", ") : "",
          item?.gnr_name ? item?.gnr_name : "",
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


const generateSpinnerYarnOrder = async () => {

 
  const maxRowsPerWorksheet = 500000;

  try {

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: fs.createWriteStream("./upload/spinner-yarn-order-test.xlsx"),
      useStyles: true,

    });
    let worksheetIndex = 0;
    const batchSize = 5000;
    let offset = 0;
    let hasNextBatch = true;

     interface Totals{
      total_quantity: 0,
    };

    let totals : Totals= {
      total_quantity:0,
    };

    const AddTotalRow = (currentWorksheet: ExcelJS.Worksheet | undefined, totals : Totals) =>{

    if(currentWorksheet != undefined){
      const rowValues = {
              index:"",
              season:"",
              spinner:"",
              Weaver:"",
              orderReceivedDate:"",
              date:"",
              expectedYarnDispatchDate:"",
              brandOrderRefNumber:"",
              fabricMillOrderRefNumber:"",
              dateFabricMillPlacedOrder:"",
              spinnerInternalOrderNumber:"",
              CottonMix:"",
              yarnTypeSelect:"",
              YarnCount:"Totals",
              totalOrderQuantity:Number(formatDecimal(totals.total_quantity)),
              tentativeOrderCompletionDate:"",
              agent_details:"",
              reel_yarn_order_number:"",
              orderPercentange:"",
            };
      let currentWorksheet = workbook.getWorksheet(`Spinner Yarn Order ${worksheetIndex}`);
      currentWorksheet?.addRow( Object.values(rowValues)).eachCell(cell=> cell.font={bold:true});
      let borderStyle = {
        top: {style: "thin"},
        left: {style: "thin"},
        bottom: {style: "thin"},
        right: {style: "thin"}
      };
      // Auto-adjust column widths based on content
      currentWorksheet?.columns.forEach((column: any) => {
        let maxCellLength = 0;
        column.eachCell({ includeEmpty: true }, (cell: any) => {
          const cellLength = (cell.value ? cell.value.toString() : "").length;
          maxCellLength = Math.max(maxCellLength, cellLength);
          cell.border = borderStyle;
        });
        column.width = Math.min(14, maxCellLength + 2); // Limit width to 30 characters
      });
    }
    
    };

  let currentWorksheet: ExcelJS.Worksheet| undefined = undefined;


    while (hasNextBatch) {

      const rows : any = await SpinnerYarnOrder.findAll({
          distinct: true,
          order: [["createdAt", "DESC"]],
          offset: offset,
          limit: batchSize,
          include: [
            {
              model: SpinnerYarnOrderSales,
              as: 'YarnOrderSales',
              attributes: ['quantity_used']
            },
            {
              model: YarnOrderProcess,
              as: 'YarnOrderProcess',
              attributes: ['id', 'name', 'address']
            },
            {
              model: Spinner,
              as : 'spinner',
              required: true
                        
            },
            {
              model: Season,
              as : 'season',
              attributes: ['id', 'name'],
              required: true
            },
          ],
         
        });
        
        if (rows.length === 0) {
          hasNextBatch = false;
          break;
        }

        if (offset % maxRowsPerWorksheet === 0) {

          if(currentWorksheet){
            AddTotalRow(currentWorksheet, totals);
          }
          totals = {
          total_quantity:0
        };

          worksheetIndex++;
        }
       // Get all buyer and process IDs
        const mappedBuyers = rows
          .filter((order: any) => order.buyerType === "Mapped" && order.buyerOption)
          .map((order: any) => ({
            id: order.buyerOption,
            type: order.buyer_option_type
          }));

        const knitterIds = mappedBuyers
          .filter((buyer: any) => buyer.type === "kniter")
          .map((buyer: any) => buyer.id);

        const weaverIds = mappedBuyers
          .filter((buyer: any) => buyer.type === "weaver")
          .map((buyer: any) => buyer.id);
          console.log('weaverIds',weaverIds);
        const yarnBlendIds = rows
          .filter((order: any) => order.yarnBlend)
          .map((order: any) => order.yarnBlend);

        const processIds = rows
          .filter((order: any) => order.processId)
          .map((order: any) => order.processId);
        const yarnCountIds = rows
          .filter((order: any) => order.yarnCount)
          .map((order: any) => order.yarnCount);
        // Get buyers and processes data
        let weavers: any = [];
        let processes: any = [];
        let yarnBlends: any = [];
        let yarnCounts: any = [];

        // Fetch buyers based on their type
        if (knitterIds.length > 0) {
          const knitters = await Knitter.findAll({
            where: { id: knitterIds },
            attributes: ["id", "name"],
          });
          weavers.push(...knitters.map((a: any) => ({ id: a.id, name: a.name, type: 'knitter' })));
        }

        if (weaverIds.length > 0) {
          const weaversList = await Weaver.findAll({
            where: { id: weaverIds },
            attributes: ["id", "name"],
          });
          weavers.push(...weaversList.map((a: any) => ({ id: a.id, name: a.name, type: 'weaver' })));
        }

        if(yarnBlendIds.length > 0){  
          yarnBlends = await CottonMix.findAll({
            where: { id: yarnBlendIds },
            attributes: ["id", "cottonMix_name"],
          });
        }

        if (processIds.length > 0) {
          processes = await YarnOrderProcess.findAll({
            where: { id: processIds },
            attributes: ["id", "name"],
          });
        }

        if (yarnCountIds.length > 0) {
          yarnCounts = await YarnCount.findAll({
            where: { id: yarnCountIds },
            attributes: ["id", "yarnCount_name"],
          });
        }

        // Create lookup maps
        const weaverMap = new Map(weavers.map((w: any) => [w.id, w]));
        const processMap = new Map(processes.map((p: any) => [p.id, p]));
        const yarnBlendMap = new Map(yarnBlends.map((p: any) => [p.id, p]));
        const yarnCountMap = new Map(yarnCounts.map((y: any) => [y.id, y]));
        
        const formatDate = (dateString: any) => {
          if (!dateString) return "";
          const date = new Date(dateString);

          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();

          return `${day}-${month}-${year}`;
        };

       for await (const [index, item] of rows.entries()) {

        let rowValues;
        const totalSales = item.YarnOrderSales?.reduce(
            (sum: number, sale: any) => sum + (sale.quantity_used || 0),
            0
          ) || 0;
          
        const buyerName :any = item.buyerType === "Mapped" && item.buyerOption ? weaverMap.get(item.buyerOption) : item.processId
          ? processMap.get(item.processId) : 'N/A';

        const CottonMix :any = item.yarnBlend ? yarnBlendMap.get(item.yarnBlend) : 'N/A';

        const YarnCount :any = item.yarnCount ? yarnCountMap.get(item.yarnCount) : 'N/A';

        rowValues = {
            index: index + 1,
            season: item.season ? item.season?.name : "",
            spinner: item.spinner ? item.spinner?.name : "",
            Weaver: buyerName?.name,
            orderReceivedDate: item.orderReceivedDate ? formatDate(item.orderReceivedDate) : "",
            date: item.date ? formatDate(item.date) : "",
            expectedYarnDispatchDate: item.expectedYarnDispatchDate ? formatDate(item.expectedYarnDispatchDate) : "",
            brandOrderRefNumber: item.brandOrderRefNumber ? item.brandOrderRefNumber : "",
            fabricMillOrderRefNumber: item.fabricMillOrderRefNumber ? item.fabricMillOrderRefNumber : "",
            dateFabricMillPlacedOrder: item.dateFabricMillPlacedOrder ? formatDate(item.dateFabricMillPlacedOrder) : "",
            spinnerInternalOrderNumber: item.spinnerInternalOrderNumber ? item.spinnerInternalOrderNumber : "",
            CottonMix: CottonMix?.cottonMix_name,
            yarnTypeSelect: item.yarnTypeSelect === "Other" ? item.yarnTypeOther : item.yarnTypeSelect,
            YarnCount:  YarnCount?.yarnCount_name,
            totalOrderQuantity: Number(item.totalOrderQuantity),
            tentativeOrderCompletionDate: item.tentativeOrderCompletionDate,
            agent_details:item?.agent_details,
            reel_yarn_order_number: item.reel_yarn_order_number ? item.reel_yarn_order_number : "",
            orderPercentange: totalSales > 0 
            ? ((totalSales / item.totalOrderQuantity) * 100).toFixed(2)  + ' %' : 0 + ' %',
          };
          
        totals.total_quantity += Number(rowValues.totalOrderQuantity);
      
      currentWorksheet = workbook.getWorksheet(`Spinner Yarn Order ${worksheetIndex}`);
        if (!currentWorksheet) {
          currentWorksheet = workbook.addWorksheet(`Spinner Yarn Order ${worksheetIndex}`);
          // if (worksheetIndex == 1) {
          //   currentWorksheet.mergeCells("A1:U1");
          //   const mergedCell = currentWorksheet.getCell("A1");
          //   mergedCell.value = "CottonConnect | Spinner Yarn Sales Report";
          //   mergedCell.font = { bold: true };
          //   mergedCell.alignment = { horizontal: "center", vertical: "middle" };
          // }

          const headerRow = currentWorksheet.addRow([
             "Sr No.",
          "Season",
          "Spinner Name",
          "Name of Fabric Mill",
          "Date of Order Received",
          "Date of Creation",
          "Expected Date of Yarn Dispatch",
          "Brand Order Reference Number",
          "Fabric Mill Order Reference Number",
          "Date Fabric Mill Placed Yarn Order",
          "Spinner Internal Order Reference Number",
          "Yarn Blend",
          "Yarn Type",
          "Yarn Count",
          "Total Order Quantity (kgs)",
          "Tentative Date of Order Completion",
          "Agent Details",
          "TraceBale REEL Yarn Order Number",
          "Order Completion %",
          ]);
          headerRow.font = { bold: true };
        }
        currentWorksheet.addRow( Object.values(rowValues));
       }

     let currentsheet = workbook.getWorksheet(`Spinner Yarn Order ${worksheetIndex}`);
      if(currentsheet){
        AddTotalRow(currentsheet, totals);
      }
       let borderStyle = {
        top: {style: "thin"},
        left: {style: "thin"},
        bottom: {style: "thin"},
        right: {style: "thin"}
      };
      // Auto-adjust column widths based on content
      currentsheet?.columns.forEach((column: any) => {
        let maxCellLength = 0;
        column.eachCell({ includeEmpty: true }, (cell: any) => {
          const cellLength = (cell.value ? cell.value.toString() : "").length;
          maxCellLength = Math.max(maxCellLength, cellLength);
          cell.border = borderStyle;
        });
        column.width = Math.min(14, maxCellLength + 2); // Limit width to 30 characters
      });

      offset += batchSize;
    }

   

    // Save the workbook
    await workbook.commit()
      .then(() => {
        // Rename the temporary file to the final filename
        fs.renameSync("./upload/spinner-yarn-order-test.xlsx", './upload/spinner-yarn-order.xlsx');
        console.log('====== Spinner Yarn Order Report Generated. =======');
      })
      .catch(error => {
        console.log('Failed to generate Spinner Yarn Order Report.');
        throw error;
      });
  } catch (error: any) {
    console.log(error)
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
      stream: fs.createWriteStream("./upload/Spinner-Pending-Bales-Receipt-Report-test.xlsx"),
      useStyles: true,

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
        attributes: ["id", "name", "country_id", "state_id"],
        include: [
          {
            model: Country,
            as: "country",
          },
          {
            model: State,
            as: "state",
          }
        ],
      },
    ];

    interface Totals {
      no_of_bales:0,
      total_qty:0,
      actual_qty:0,
    };


    let totals : Totals = {
      no_of_bales:0,
      total_qty:0,
      actual_qty:0,
    };


    const AddTotalRow = (currentWorksheet: ExcelJS.Worksheet | undefined, totals : Totals) =>{

      if(currentWorksheet != undefined){
        let rowValues = {
          index:"",
          country:"",
          state:"",
          createdAt:"",
          date:"",
          no_of_days:"",
          season:"",
          ginner:"",
          spinner:"",
          invoice:"Total",
          no_of_bales: Number(formatDecimal(totals.no_of_bales)),
          lot_no:"",
          reel_lot_no:"",
          total_qty: Number(formatDecimal(totals.total_qty)),
          actual_qty: Number(formatDecimal(totals.actual_qty)),
          program:"",
          village:"",
        };
        let currentWorksheet = workbook.getWorksheet(`Spinner Pending Bales ${worksheetIndex}`);
        currentWorksheet?.addRow(Object.values(rowValues)).eachCell(cell=> cell.font={bold:true});
        let borderStyle = {
          top: {style: "thin"},
          left: {style: "thin"},
          bottom: {style: "thin"},
          right: {style: "thin"}
        }
        // Auto-adjust column widths based on content
        currentWorksheet?.columns.forEach((column: any) => {
          let maxCellLength = 0;
          column.eachCell({ includeEmpty: true }, (cell: any) => {
            const cellLength = (cell.value ? cell.value.toString() : "").length;
            maxCellLength = Math.max(maxCellLength, cellLength);
            cell.border = borderStyle
          });
          column.width = Math.min(20, maxCellLength + 2); // Limit width to 30 characters
        });
 
      }
      
    };

    let currentWorksheet: ExcelJS.Worksheet| undefined = undefined;


    while (hasNextBatch) {


      const rows: any = await BaleSelection.findAll({
        attributes: [
          [Sequelize.literal('"sales"."id"'), "sales_id"],
          [Sequelize.literal('"sales"."date"'), "date"],
          [Sequelize.literal('"sales"."createdAt"'), "createdAt"],
          [Sequelize.literal('EXTRACT(DAY FROM ("sales"."createdAt" - "sales"."date"))'), "no_of_days"],
          [Sequelize.literal('"sales"."accept_date"'), "accept_date"],
          [Sequelize.col('"sales"."season"."name"'), "season_name"],
          [Sequelize.col('"sales"."ginner"."id"'), "ginner_id"],
          [Sequelize.col('"sales"."ginner"."name"'), "ginner"],
          [Sequelize.col('"sales"."program"."program_name"'), "program"],
          [Sequelize.col('"sales"."buyerdata"."id"'), "spinner_id"],
          [Sequelize.col('"sales"."buyerdata"."name"'), "spinner"],
          [Sequelize.col('"sales"."buyerdata"."country"."county_name"'), "country"],
          [Sequelize.col('"sales"."buyerdata"."state"."state_name"'), "state"],          
          [Sequelize.literal('"sales"."total_qty"'), "total_qty"],
          [Sequelize.literal('"sales"."invoice_no"'), "invoice_no"],
          [Sequelize.col('"sales"."lot_no"'), "lot_no"],
          [Sequelize.fn('STRING_AGG', Sequelize.literal('DISTINCT "bale->ginprocess"."reel_lot_no"'), ','), "reel_lot_no"],
          [Sequelize.literal('"sales"."rate"'), "rate"],
          [Sequelize.literal('"sales"."candy_rate"'), "candy_rate"],
          [Sequelize.fn("SUM", Sequelize.literal('CAST("bale"."weight" AS DOUBLE PRECISION)')), "lint_quantity"],
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
          "sales.buyerdata.country.id",
          "sales.buyerdata.state.id",          
        ],
        order: [["spinner", "asc"]],
        offset: offset,
        limit: batchSize,
      });

      if (rows.length === 0) {
        hasNextBatch = false;
        break;
      }

      if (offset % maxRowsPerWorksheet === 0) {

        if(currentWorksheet){
          AddTotalRow(currentWorksheet, totals)
        }

        totals  = {
          no_of_bales:0,
          total_qty:0,
          actual_qty:0,
        };

        worksheetIndex++;
      }

 

      // Append data to worksheet
      for await (const [index, item] of rows.entries()) {
        const rowValues = {
          index: index + offset + 1,
          country: item.dataValues.country,
          state: item.dataValues.state,          
          createdAt: item.dataValues.createdAt ? item.dataValues.createdAt : "",
          date: item.dataValues.date ? item.dataValues.date : "",
          no_of_days: item.dataValues.no_of_days,
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
        };

         currentWorksheet = workbook.getWorksheet(`Spinner Pending Bales ${worksheetIndex}`);
        if (!currentWorksheet) {
          currentWorksheet = workbook.addWorksheet(`Spinner Pending Bales ${worksheetIndex}`);
          // if (worksheetIndex == 1) {
          //   currentWorksheet.mergeCells("A1:N1");
          //   const mergedCell = currentWorksheet.getCell("A1");
          //   mergedCell.value = "CottonConnect | Spinner Pending Bales Receipt Report";
          //   mergedCell.font = { bold: true };
          //   mergedCell.alignment = { horizontal: "center", vertical: "middle" };
          // }

          const headerRow = currentWorksheet.addRow([
            "Sr No.",
            "Country",
            "State",                    
            "Date and Time",
            "Date",
            "No of Days",
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
        totals.no_of_bales += rowValues.no_of_bales;
        totals.total_qty += rowValues.total_qty;
        totals.actual_qty += rowValues.actual_qty;


        currentWorksheet.addRow(Object.values(rowValues));
      }

    
      offset += batchSize;
    }

    if(currentWorksheet){
      AddTotalRow(currentWorksheet, totals)
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

const generateBrandWiseData = async () => {
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
                "$farmer.brand_id$": item.dataValues.id
              },
              attributes: [
                [Sequelize.fn('COUNT', Sequelize.literal('DISTINCT farmer_id')), 'total_farmers'],
                [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('farms.total_estimated_cotton')), 0), 'total_estimated_cotton']
              ],
              include: [{
                model: Farmer,
                as: 'farmer',
                attributes: []
              }],
              group: ["farmer.brand_id"]
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
                "$sales.status$": { [Op.in]: ['Pending', 'Pending for QR scanning', 'Partially Accepted', 'Partially Rejected', 'Sold'] }
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


const generatePremiumValidationData = async () => {
  const maxRowsPerWorksheet = 500000; // Maximum number of rows per worksheet in Excel

  try {
    // Create the excel workbook file
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: fs.createWriteStream("./upload/premium-validation-report-test.xlsx")
    });

    const batchSize = 5000;
    let worksheetIndex = 0;
    let offset = 0;
    let hasNextBatch = true;

    let include = [
      {
        model: FarmGroup,
        as: "farmGroup",
        attributes: ["id", "name", "status"],
      },
      {
        model: Brand,
        as: "brand",
        attributes: ["id", "brand_name", "address"],
      },
      {
        model: Season,
        as: "season",
        attributes: ["id", "name"],
      },
    ];

    while (hasNextBatch) {

      const rows = await ValidationProject.findAll({
        include: include,
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
          currentWorksheet.mergeCells("A1:L1");
          const mergedCell = currentWorksheet.getCell("A1");
          mergedCell.value = "CottonConnect | Premium Validation Report";
          mergedCell.font = { bold: true };
          mergedCell.alignment = { horizontal: "center", vertical: "middle" };
        }
        // Set bold font for header row
        const headerRow = currentWorksheet.addRow([
          "S.No",
          "Date and Time",
          "Season",
          "Farm Group",
          "Total Number of Farmers",
          "Total Seed Cotton Purchased (MT)",
          "Lint Cotton Sold to Spinner (MT)",
          "Lint Cost Recieved from Spinner (INR)",
          "Premium Transferred to Farmers (INR)",
          "Average Seed Cotton Purchase Price (INR/Kg)",
          "Average Conventional Cotton Price (INR/Kg)",
          "% Premium Transferred per KG of Seed Cotton Procured",
        ]);
        headerRow.font = { bold: true };
      }

      for await (let [index, item] of rows.entries()) {

        const rowValues = [
          index + offset + 1,
          item.dataValues.createdAt ? item.dataValues.createdAt : "",
          item.dataValues.season.name ? item.dataValues.season.name : "",
          item.dataValues.farmGroup?.name ? item.dataValues.farmGroup?.name : "",
          item.dataValues.no_of_farmers ? Number(item.dataValues.no_of_farmers) : 0,
          item.dataValues.cotton_purchased ? Number(item.dataValues.cotton_purchased) : 0,
          item.dataValues.qty_of_lint_sold ? Number(item.dataValues.qty_of_lint_sold) : 0,
          item.dataValues.premium_recieved ? Number(item.dataValues.premium_recieved) : 0,
          item.dataValues.premium_transfered_cost && item.dataValues.premium_transfered_cost.length > 0 ? item.dataValues.premium_transfered_cost.reduce((acc: any, val: any) => acc + parseFloat(val), 0) : 0,
          item.dataValues.avg_purchase_price ? Number(item.dataValues.avg_purchase_price) : 0,
          item.dataValues.avg_market_price ? Number(item.dataValues.avg_market_price) : 0,
          item.dataValues.price_variance ? Number(item.dataValues.price_variance) : 0,
        ];
        currentWorksheet.addRow(rowValues).commit();
      }
      offset += batchSize;
    }

    // Save the workbook
    await workbook.commit()
      .then(() => {
        // Rename the temporary file to the final filename
        fs.renameSync("./upload/premium-validation-report-test.xlsx", './upload/premium-validation-report.xlsx');
        console.log('premium-validation report generation completed.');
      })
      .catch(error => {
        console.log('Failed generation Report.');
        throw error;
      });

  } catch (error: any) {
    console.log(error);
  }
}

const generateConsolidatedDetailsFarmerGinner = async () => {
  const maxRowsPerWorksheet = 500000; 
  
    try {
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: fs.createWriteStream("./upload/consolidated-farmer-ginner-report-test.xlsx"),
      useStyles: true,

    });

    const batchSize = 5000;
    let worksheetIndex = 0;
    let offset = 0;

    let hasNextBatch = true;

    while (hasNextBatch) {
       let dataQuery =
        `
    WITH
        states_data AS (
          SELECT
            s.id,
            s.state_name,
			      c.id AS country_id,
            c.county_name AS country_name
          FROM
            ginners g
          JOIN states s ON g.state_id = s.id
          JOIN countries c ON g.country_id = c.id
          GROUP BY s.id, g.state_id, g.country_id, c.id
        ),
        procurement_data AS (
          SELECT
            t.state_id,
            SUM(CAST(t.qty_purchased AS DOUBLE PRECISION)) AS procurement_seed_cotton,
            SUM(t.qty_stock) AS seed_cotton_stock
          FROM
            transactions t
          JOIN states_data s ON t."state_id" = s.id
          JOIN ginners g ON t.mapped_ginner = g.id
          WHERE
            t.mapped_ginner IS NOT NULL
            AND t.status = 'Sold'
          GROUP BY
            t.state_id, s.id
        ),
        gin_process_data AS (
          SELECT
            g.state_id,
            SUM(gp.no_of_bales) AS no_of_bales
          FROM
            gin_processes gp
          JOIN ginners g ON gp.ginner_id = g.id
		      LEFT JOIN states_data s ON "g"."state_id" = s.id
          WHERE
            gp.program_id = ANY (g.program_id)
          GROUP BY
            g.state_id
        ),
        gin_bale_data AS (
          SELECT
            g.state_id,
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
            JOIN ginners g ON gp.ginner_id = g.id
            JOIN states_data s ON g.state_id = s.id
            WHERE
              gp.program_id = ANY (g.program_id)
            GROUP BY
              g.state_id
        ),
        gin_bale_greyout_data AS (
          SELECT
            g.state_id,
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
          JOIN gin_processes gp ON gb.process_id = gp.id
		      JOIN ginners g ON gp.ginner_id = g.id
          JOIN states_data s ON g.state_id = s.id
          WHERE
            gp.program_id = ANY (g.program_id) AND
            gb.sold_status = FALSE AND (
              (
                gp.greyout_status = TRUE AND  
                gb.is_all_rejected IS NULL
              )
              OR (
                gp.scd_verified_status = TRUE AND
                gb.scd_verified_status IS NOT TRUE
              )
              OR (
                gp.scd_verified_status = FALSE AND
                gb.scd_verified_status IS FALSE
              )
              )
          GROUP BY
            g.state_id
        ),
        pending_seed_cotton_data AS (
          SELECT
            t.state_id,
            SUM(CAST(t.qty_purchased AS DOUBLE PRECISION)) AS pending_seed_cotton
          FROM
            transactions t
            JOIN ginners g ON t.mapped_ginner = g.id
            JOIN states_data s ON t.state_id = s.id
            WHERE
              t.program_id = ANY (g.program_id)
            AND t.status = 'Pending'
          GROUP BY
            t.state_id
        ),
        gin_sales_data AS (
          SELECT
            g.state_id,
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
          JOIN ginners g ON gs.ginner_id = g.id
          LEFT JOIN gin_processes gp ON gb.process_id = gp.id
          LEFT JOIN states_data s ON "g"."state_id" = s.id
          WHERE
            gs.program_id = ANY (g.program_id)
            AND gs.status in ('Pending', 'Pending for QR scanning', 'Partially Accepted', 'Partially Rejected','Sold')
            AND gs.buyer_ginner IS NULL
          GROUP BY
            g.state_id
            ),
        gin_to_gin_sales_data AS (
                SELECT
                    g.state_id,
                    COUNT(gb.id) AS no_of_bales,
                    COALESCE(
                      SUM(
                        CASE
                          WHEN gb.old_weight IS NOT NULL THEN CAST(gb.old_weight AS DOUBLE PRECISION)
                          ELSE CAST(gb.weight AS DOUBLE PRECISION)
                        END
                      ), 0
                    ) AS lint_qty
                FROM
                    "gin-bales" gb
                LEFT JOIN 
                  bale_selections bs ON gb.id = bs.bale_id
                LEFT JOIN 
                    gin_sales gs ON gs.id = bs.sales_id
                JOIN ginners g ON gs.ginner_id = g.id
                LEFT JOIN gin_processes gp ON gb.process_id = gp.id
				        LEFT JOIN states_data s ON "g"."state_id" = s.id
                WHERE
                    gs.program_id = ANY (g.program_id)
                    AND gs.status in ('Pending', 'Pending for QR scanning', 'Partially Accepted', 'Partially Rejected','Sold')
                    AND gs.buyer_ginner IS NOT NULL
                    AND gs.buyer_type = 'Ginner'
                GROUP BY
                    g.state_id
            ),
        gin_to_gin_recieved_data AS (
                SELECT 
                  g.state_id AS state_id,
                  COUNT(gb.id) AS no_of_bales,
                  COALESCE(
                    SUM(
                      CAST(gb.weight AS DOUBLE PRECISION)
                    ), 0
                  ) AS lint_qty
                FROM 
                  gin_to_gin_sales gtg
                JOIN
                  gin_sales gs ON gtg.sales_id = gs.id
                JOIN 
                  "gin-bales" gb ON gtg.bale_id = gb.id
                JOIN 
                  ginners g ON gs.buyer_ginner = g.id
                LEFT JOIN states_data s ON "g"."state_id" = s.id
                WHERE
                  gs.program_id = ANY (g.program_id)
                  AND gs.status IN ('Sold', 'Partially Accepted', 'Partially Rejected')
                  AND gtg.gin_accepted_status = true
                  AND gs.buyer_type ='Ginner'
                GROUP BY 
                  g.state_id
            ),
            gin_to_be_submitted_data AS (
              SELECT
                g.state_id,
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
              JOIN ginners g ON gs.ginner_id = g.id
              LEFT JOIN gin_processes gp ON gb.process_id = gp.id
              LEFT JOIN states_data s ON "g"."state_id" = s.id
              WHERE
                    gs.program_id = ANY (g.program_id)
                    AND gs.status in ('To be Submitted')
              GROUP BY
                  g.state_id
            ),
            allocated_cotton_data AS (
                SELECT
                  g.state_id,
                  COALESCE(SUM(CAST("gas"."allocated_seed_cotton" AS DOUBLE PRECISION)), 0) AS allocated_seed_cotton
                  FROM "gin_allocated_seed_cottons" as gas
			          LEFT JOIN 
                    ginners g ON "gas"."ginner_id" = g.id
                LEFT JOIN 
                    states_data s ON "g"."state_id" = s.id
                LEFT JOIN 
                    "seasons" AS "season" ON "gas"."season_id" = "season"."id"
                GROUP BY
                  g.state_id
            )
            -- expected_cotton_data AS (
--                 SELECT
--                   gv.state_id,
--                   COALESCE(SUM(CAST("farms"."total_estimated_cotton"AS DOUBLE PRECISION)), 0) AS allocated_seed_cotton
--                   FROM "ginner_allocated_villages" as gv
--                 LEFT JOIN 
--                     states_data s ON "gv"."state_id" = s.id
--                 LEFT JOIN 
--                     "farmers" AS "farmer" ON gv.village_id = "farmer"."village_id" and "farmer"."brand_id" ="gv"."brand_id"
--                 LEFT JOIN 
--                     "farms" as "farms" on farms.farmer_id = "farmer".id and farms.season_id = gv.season_id
--                 LEFT JOIN 
--                     "seasons" AS "season" ON "gv"."season_id" = "season"."id"
--                 GROUP BY
--                   gv.state_id
--             )
      SELECT
        fg.id AS state_id,
        fg.state_name,
        fg.country_name,
        COALESCE(ec.allocated_seed_cotton, 0) AS allocated_lint_cotton_mt,
        COALESCE(pd.procurement_seed_cotton, 0) / 1000 AS procurement_seed_cotton_mt,
        COALESCE(psc.pending_seed_cotton, 0) / 1000 AS pending_seed_cotton_mt,
        COALESCE(pd.seed_cotton_stock, 0) / 1000 AS procured_seed_cotton_stock_mt,
--         CAST(ROUND(
--              CAST((((COALESCE(ec.allocated_seed_cotton, 0) * 35/100) / 1000) - ((COALESCE(pd.procurement_seed_cotton, 0) * 35/100) / 1000)) AS NUMERIC),
--              2
--          ) AS DOUBLE PRECISION) AS available_lint_cotton_farmer_mt,
        CAST(ROUND(
          CAST((
            COALESCE(ec.allocated_seed_cotton, 0)
          - 
          (
            COALESCE(pd.procurement_seed_cotton, 0) *
            CASE LOWER(fg.country_name)
            WHEN 'india' THEN 35
            WHEN 'pakistan' THEN 36
            WHEN 'bangladesh' THEN 40
            WHEN 'turkey' THEN 45
            WHEN 'egypt' THEN 49
            WHEN 'china' THEN 40
            ELSE 35
            END / 100.0
          ) / 1000
          ) AS NUMERIC),
          2
        ) AS DOUBLE PRECISION) AS available_lint_cotton_farmer_mt,
--         (COALESCE(pd.procurement_seed_cotton, 0) * 35/100) / 1000 AS procured_lint_cotton_mt,  
        (
          COALESCE(pd.procurement_seed_cotton, 0) *
          CASE LOWER(fg.country_name)
          WHEN 'india' THEN 35
          WHEN 'pakistan' THEN 36
          WHEN 'bangladesh' THEN 40
          WHEN 'turkey' THEN 45
          WHEN 'egypt' THEN 49
          WHEN 'china' THEN 40
          ELSE 35
          END / 100.0
        ) / 1000 AS procured_lint_cotton_mt,
            COALESCE(gb.total_qty, 0) AS produced_lint_cotton_kgs,
            COALESCE(gb.total_qty, 0) / 1000 AS produced_lint_cotton_mt,
--         CAST(ROUND(
--             CAST(((COALESCE(pd.procurement_seed_cotton, 0) * 35/100) / 1000) - (COALESCE(gb.total_qty, 0) / 1000) AS NUMERIC),
--             2
--             ) AS DOUBLE PRECISION) AS unprocessed_lint_cotton_mt,
        CAST(ROUND(
          CAST((
          (
            COALESCE(pd.procurement_seed_cotton, 0) *
            CASE LOWER(fg.country_name)
            WHEN 'india' THEN 35
            WHEN 'pakistan' THEN 36
            WHEN 'bangladesh' THEN 40
            WHEN 'turkey' THEN 45
            WHEN 'egypt' THEN 49
            WHEN 'china' THEN 40
            ELSE 35
            END / 100.0
          ) / 1000
          -
          (COALESCE(gb.total_qty, 0) / 1000)
          ) AS NUMERIC),
          2
        ) AS DOUBLE PRECISION) AS unprocessed_lint_cotton_mt,
        COALESCE(gs.total_qty, 0) / 1000 AS total_lint_cotton_sold_mt,
        COALESCE(gbg.total_qty, 0) / 1000 AS greyout_qty,
        COALESCE(gtg.lint_qty, 0) / 1000 AS total_qty_lint_transfered,
        COALESCE(gtgr.lint_qty, 0) / 1000 AS total_qty_lint_received_mt,
        COALESCE(gtsg.total_qty, 0) / 1000 AS lint_qty_to_be_submitted,
        CAST(ROUND(
            CAST((COALESCE(gb.total_qty, 0) / 1000 + COALESCE(gtgr.lint_qty, 0) / 1000) - (COALESCE(gs.total_qty, 0) / 1000 + COALESCE(gbg.total_qty, 0) / 1000 + COALESCE(gtg.lint_qty, 0) / 1000 + COALESCE(gtsg.total_qty, 0) / 1000) AS NUMERIC), 
            2
        ) AS DOUBLE PRECISION) AS actual_lint_stock_mt,
        CAST(ROUND(
            CAST((COALESCE(gb.total_qty, 0) / 1000 + COALESCE(gtgr.lint_qty, 0) / 1000) - (COALESCE(gs.total_qty, 0) / 1000 + COALESCE(gbg.total_qty, 0) / 1000 + COALESCE(gtg.lint_qty, 0) / 1000) AS NUMERIC), 
            2
        ) AS DOUBLE PRECISION) AS total_lint_stock_mt
      FROM
        states_data fg
        LEFT JOIN procurement_data pd ON fg.id = pd.state_id
        LEFT JOIN gin_process_data gp ON fg.id = gp.state_id
        LEFT JOIN gin_bale_data gb ON fg.id = gb.state_id
        LEFT JOIN pending_seed_cotton_data psc ON fg.id = psc.state_id
        LEFT JOIN gin_sales_data gs ON fg.id = gs.state_id
        LEFT JOIN allocated_cotton_data ec ON fg.id = ec.state_id
        LEFT JOIN gin_bale_greyout_data gbg ON fg.id = gbg.state_id
        LEFT JOIN gin_to_gin_sales_data gtg ON fg.id = gtg.state_id
        LEFT JOIN gin_to_gin_recieved_data gtgr ON fg.id = gtgr.state_id
        LEFT JOIN gin_to_be_submitted_data gtsg ON fg.id = gtsg.state_id
      ORDER BY
        fg.state_name asc
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

      let currentWorksheet = workbook.getWorksheet(`Sheet${worksheetIndex}`);
      if (!currentWorksheet) {
        currentWorksheet = workbook.addWorksheet(`Sheet${worksheetIndex}`);
       
        const headerRow = currentWorksheet.addRow([
              "Sr No.",
              "State/Region",
              // "Allocated Seed Cotton(MT)",
              // "Procured seed cotton accepted by ginner(MT)",
              // "Seed cotton pending at ginner(MT)",
              // "Seed cotton stock at ginners (MT)",
              "Total lint cotton allocated to ginners by CC (MT)",
              "Total lint cotton available at farmers to date (MT)",
              "Total lint cotton procured by ginners to date (MT)",
              "Total lint cotton processed/produced to date (MT)",
              "Total lint cotton unprocessed/not produced to date (MT)",
              "Total lint cotton sold to date (MT)",
              "Total lint cotton stock at ginners (MT)",
              "Lint cotton procured from other ginners (Ginner to Ginner transactions) to date (MT)",
              "Total lint cotton leakage at farmers to date(MT)",
              "Total lint cotton leakage at ginners to date(MT)",
              "Remarks"
        ]);
        headerRow.font = { bold: true };
      }

       let totals = {
        // allocated_seed_cotton: 0,
        // procurement_seed_cotton_mt: 0,
        // pending_seed_cotton_mt: 0,
        // procured_seed_cotton_stock_mt: 0,
        allocated_lint_cotton_mt: 0,
        available_lint_cotton_farmer_mt: 0,
        procured_lint_cotton_mt: 0,
        produced_lint_cotton_mt: 0,
        unprocessed_lint_cotton_mt: 0,
        total_lint_cotton_sold_mt: 0,
        total_lint_stock_mt: 0,
        total_qty_lint_received_mt: 0,
        total_lint_leakage_at_farmers_mt: 0,
        total_lint_leakage_at_ginners_mt: 0
      };

      // Append data to worksheet
      for await (const [index, item] of rows.entries()) {

          let rowValues;
            rowValues = {
              index: index + 1,
              state: item.state_name,
              // allocated_seed_cotton: Number(formatDecimal(item.allocated_seed_cotton_mt)),
              // procurement_seed_cotton_mt: Number(formatDecimal(item.procurement_seed_cotton_mt)),
              // pending_seed_cotton_mt: Number(formatDecimal(item.pending_seed_cotton_mt)),
              // procured_seed_cotton_stock_mt: Number(formatDecimal(item.procured_seed_cotton_stock_mt)),
              allocated_lint_cotton_mt: Number(formatDecimal(item.allocated_lint_cotton_mt)),
              available_lint_cotton_farmer_mt: Number(formatDecimal(item.available_lint_cotton_farmer_mt)),
              procured_lint_cotton_mt: Number(formatDecimal(item.procured_lint_cotton_mt)),
              produced_lint_cotton_mt: Number(formatDecimal(item.produced_lint_cotton_mt)),
              unprocessed_lint_cotton_mt: Number(formatDecimal(item.unprocessed_lint_cotton_mt)),
              total_lint_cotton_sold_mt: Number(formatDecimal(item.total_lint_cotton_sold_mt)),
              total_lint_stock_mt: Number(formatDecimal(item.total_lint_stock_mt)),
              total_qty_lint_received_mt: Number(formatDecimal(item.total_qty_lint_received_mt)),
              total_lint_leakage_at_farmers_mt: 0,
              total_lint_leakage_at_ginners_mt: 0,
            };

          // totals.allocated_seed_cotton += item.allocated_seed_cotton_mt ? Number(item.allocated_seed_cotton_mt) : 0;
          // totals.procurement_seed_cotton_mt += item.procurement_seed_cotton_mt ? Number(item.procurement_seed_cotton_mt) : 0;
          // totals.pending_seed_cotton_mt += item.pending_seed_cotton_mt ? Number(item.pending_seed_cotton_mt) : 0;
          // totals.procured_seed_cotton_stock_mt += item.procured_seed_cotton_stock_mt ? Number(item.procured_seed_cotton_stock_mt) : 0;
          totals.allocated_lint_cotton_mt += item.allocated_lint_cotton_mt ? Number(item.allocated_lint_cotton_mt) : 0;
          totals.available_lint_cotton_farmer_mt += item.available_lint_cotton_farmer_mt ? Number(item.available_lint_cotton_farmer_mt) : 0;
          totals.procured_lint_cotton_mt += item.procured_lint_cotton_mt ? Number(item.procured_lint_cotton_mt) : 0;
          totals.produced_lint_cotton_mt += item.produced_lint_cotton_mt ? Number(item.produced_lint_cotton_mt) : 0;
          totals.unprocessed_lint_cotton_mt += item.unprocessed_lint_cotton_mt ? Number(item.unprocessed_lint_cotton_mt) : 0;
          totals.total_lint_cotton_sold_mt += item.total_lint_cotton_sold_mt ? Number(item.total_lint_cotton_sold_mt) : 0;
          totals.total_lint_stock_mt += item.total_lint_stock_mt ? Number(item.total_lint_stock_mt) : 0;
          totals.total_qty_lint_received_mt += item.total_qty_lint_received_mt ? Number(item.total_qty_lint_received_mt) : 0;
          totals.total_lint_leakage_at_farmers_mt += item.total_lint_leakage_at_farmers_mt ? Number(item.total_lint_leakage_at_farmers_mt) : 0;
          totals.total_lint_leakage_at_ginners_mt += item.total_lint_leakage_at_ginners_mt ? Number(item.total_lint_leakage_at_ginners_mt) : 0;        
          
          currentWorksheet.addRow(Object.values(rowValues));
        }

        let rowValues = Object.values({
          index: "",
          state: "Total",
          // allocated_seed_cotton: Number(formatDecimal(totals.allocated_seed_cotton)),
          // procurement_seed_cotton_mt: Number(formatDecimal(totals.procurement_seed_cotton_mt)),
          // pending_seed_cotton_mt: Number(formatDecimal(totals.pending_seed_cotton_mt)),
          // procured_seed_cotton_stock_mt: Number(formatDecimal(totals.procured_seed_cotton_stock_mt)),
          allocated_lint_cotton_mt: Number(formatDecimal(totals.allocated_lint_cotton_mt)),
          available_lint_cotton_farmer_mt: Number(formatDecimal(totals.available_lint_cotton_farmer_mt)),
          procured_lint_cotton_mt: Number(formatDecimal(totals.procured_lint_cotton_mt)),
          produced_lint_cotton_mt: Number(formatDecimal(totals.produced_lint_cotton_mt)),
          unprocessed_lint_cotton_mt: Number(formatDecimal(totals.unprocessed_lint_cotton_mt)),
          total_lint_cotton_sold_mt: Number(formatDecimal(totals.total_lint_cotton_sold_mt)),
          total_lint_stock_mt: Number(formatDecimal(totals.total_lint_stock_mt)),
          total_qty_lint_received_mt: Number(formatDecimal(totals.total_qty_lint_received_mt)),
          total_lint_leakage_at_farmers_mt: Number(formatDecimal(totals.total_lint_leakage_at_farmers_mt)),
          total_lint_leakage_at_ginners_mt: Number(formatDecimal(totals.total_lint_leakage_at_ginners_mt)),
        });
     
       currentWorksheet.addRow(rowValues).eachCell((cell, colNumber) => { cell.font = { bold: true } });

      offset += batchSize;
      const borderStyle = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
      currentWorksheet.columns.forEach((column: any) => {
        let maxCellLength = 0;
        column.eachCell({ includeEmpty: true }, (cell: any) => {
          const cellLength = (cell.value ? cell.value.toString() : '').length;
          maxCellLength = Math.max(maxCellLength, cellLength);
          cell.border = borderStyle;
        });
        column.width = Math.min(24, maxCellLength + 2);
      });

    }
   
    await workbook.commit()
      .then(() => {
        fs.renameSync("./upload/consolidated-farmer-ginner-report-test.xlsx", './upload/consolidated-farmer-ginner-report.xlsx');
        console.log('consolidated farmer ginner report generation completed.');
      })
      .catch(error => {
        console.log('Failed generation?.');
        throw error;
      });

  } catch (error: any) {
    console.error("Error appending data:", error);
  }


}

const generateGinnerDetails = async () => {
  const maxRowsPerWorksheet = 500000; 
  
    try {
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: fs.createWriteStream("./upload/ginner-details-sheet-test.xlsx"),
      useStyles: true,

    });

    const batchSize = 5000;
    let worksheetIndex = 0;
    let offset = 0;

    let hasNextBatch = true;

    while (hasNextBatch) {
      const dataQuery = `
    WITH
        ginner_data AS (
          SELECT
            g.id,
            g.state_id,
            g.program_id,
            g.name,
            s.state_name AS state_name,
            c.id AS country_id,
            c.county_name AS country_name
          FROM
            ginners g
          JOIN states s ON g.state_id = s.id
          JOIN countries c ON g.country_id = c.id
        ),
        procurement_data AS (
          SELECT
            t.mapped_ginner AS ginner_id,
            SUM(CAST(t.qty_purchased AS DOUBLE PRECISION)) AS procurement_seed_cotton,
            SUM(t.qty_stock) AS seed_cotton_stock
          FROM
            transactions t
          JOIN ginner_data g ON t."mapped_ginner" = g.id
          WHERE
            t.mapped_ginner IS NOT NULL
            AND t.status = 'Sold'
          GROUP BY
            t.mapped_ginner
        ),
        gin_process_data AS (
          SELECT
            gp.ginner_id,
            SUM(gp.no_of_bales) AS no_of_bales
          FROM
            gin_processes gp
          LEFT JOIN ginner_data g ON "g"."id" = gp.ginner_id
          WHERE
            gp.program_id = ANY (g.program_id)
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
            JOIN ginner_data g ON gp.ginner_id = g.id
            WHERE
              gp.program_id = ANY (g.program_id)
            GROUP BY
              gp.ginner_id
        ),
        gin_bale_greyout_data AS (
          SELECT
            gp.ginner_id,
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
          JOIN gin_processes gp ON gb.process_id = gp.id
          JOIN ginner_data g ON gp.ginner_id = g.id
          WHERE
            gp.program_id = ANY (g.program_id) AND
            gb.sold_status = FALSE AND (
              (
                gp.greyout_status = TRUE AND  
                gb.is_all_rejected IS NULL
              )
              OR (
                gp.scd_verified_status = TRUE AND
                gb.scd_verified_status IS NOT TRUE
              )
              OR (
                gp.scd_verified_status = FALSE AND
                gb.scd_verified_status IS FALSE
              )
              )
          GROUP BY
            gp.ginner_id
        ),
        pending_seed_cotton_data AS (
          SELECT
            t.mapped_ginner AS ginner_id,
            SUM(CAST(t.qty_purchased AS DOUBLE PRECISION)) AS pending_seed_cotton
          FROM
            transactions t
          JOIN ginner_data g ON t.mapped_ginner = g.id
          WHERE
            t.program_id = ANY (g.program_id)
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
          JOIN ginner_data g ON gs.ginner_id = g.id
          LEFT JOIN gin_processes gp ON gb.process_id = gp.id
          WHERE
            gs.program_id = ANY (g.program_id)
            AND gs.status in ('Pending', 'Pending for QR scanning', 'Partially Accepted', 'Partially Rejected','Sold')
            AND gs.buyer_ginner IS NULL
          GROUP BY
            gs.ginner_id
            ),
        gin_to_gin_sales_data AS (
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
                    ) AS lint_qty
                FROM
                    "gin-bales" gb
                LEFT JOIN
                  bale_selections bs ON gb.id = bs.bale_id
                LEFT JOIN
                    gin_sales gs ON gs.id = bs.sales_id
                JOIN ginner_data g ON gs.ginner_id = g.id
                LEFT JOIN gin_processes gp ON gb.process_id = gp.id
                WHERE
                    gs.program_id = ANY (g.program_id)
                    AND gs.status in ('Pending', 'Pending for QR scanning', 'Partially Accepted', 'Partially Rejected','Sold')
                    AND gs.buyer_ginner IS NOT NULL
                    AND gs.buyer_type = 'Ginner'
                GROUP BY
                    gs.ginner_id
            ),
        gin_to_gin_recieved_data AS (
                SELECT
                  gs.buyer_ginner AS ginner_id,
                  COUNT(gb.id) AS no_of_bales,
                  COALESCE(
                    SUM(
                      CAST(gb.weight AS DOUBLE PRECISION)
                    ), 0
                  ) AS lint_qty
                FROM
                  gin_to_gin_sales gtg
                JOIN
                  gin_sales gs ON gtg.sales_id = gs.id
                JOIN
                  "gin-bales" gb ON gtg.bale_id = gb.id
                JOIN
                  ginner_data g ON gs.buyer_ginner = g.id
                WHERE
                  gs.program_id = ANY (g.program_id)
                  AND gs.status IN ('Sold', 'Partially Accepted', 'Partially Rejected')
                  AND gtg.gin_accepted_status = true
                  AND gs.buyer_type ='Ginner'
                GROUP BY 
                  gs.buyer_ginner
            ),
            gin_to_be_submitted_data AS (
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
              JOIN ginner_data g ON gs.ginner_id = g.id
              LEFT JOIN gin_processes gp ON gb.process_id = gp.id
              WHERE
                    gs.program_id = ANY (g.program_id)
                    AND gs.status in ('To be Submitted')
              GROUP BY
                  gs.ginner_id
            ),
            allocated_cotton_data AS (
                SELECT
                  gas.ginner_id,
                  COALESCE(SUM(CAST("gas"."allocated_seed_cotton" AS DOUBLE PRECISION)), 0) AS allocated_seed_cotton
                  FROM "gin_allocated_seed_cottons" as gas
				        LEFT JOIN
                    ginner_data g ON "gas"."ginner_id" = g.id
                LEFT JOIN 
                    states s ON "g"."state_id" = s.id
                LEFT JOIN 
                    "seasons" AS "season" ON "gas"."season_id" = "season"."id"
                GROUP BY
                  gas.ginner_id
            )
--             expected_cotton_data AS (
--                 SELECT
--                   gv.ginner_id,
--                   COALESCE(SUM(CAST("farms"."total_estimated_cotton"AS DOUBLE PRECISION)), 0) AS allocated_seed_cotton
--                   FROM "ginner_allocated_villages" as gv
--                 LEFT JOIN
--                     ginner_data g ON "gv"."ginner_id" = g.id
--                 LEFT JOIN
--                     "farmers" AS "farmer" ON gv.village_id = "farmer"."village_id" and "farmer"."brand_id" ="gv"."brand_id"
--                 LEFT JOIN
--                     "farms" as "farms" on farms.farmer_id = "farmer".id and farms.season_id = gv.season_id
--                 LEFT JOIN
--                     "seasons" AS "season" ON "gv"."season_id" = "season"."id"
--                 GROUP BY
--                   gv.ginner_id
--             )
      SELECT
        fg.*,
        COALESCE(ec.allocated_seed_cotton, 0) AS allocated_lint_cotton_mt,
        COALESCE(pd.procurement_seed_cotton, 0) / 1000 AS procurement_seed_cotton_mt,
        COALESCE(psc.pending_seed_cotton, 0) / 1000 AS pending_seed_cotton_mt,
        COALESCE(pd.seed_cotton_stock, 0) / 1000 AS procured_seed_cotton_stock_mt,
--         CAST(ROUND(
--              CAST((((COALESCE(ec.allocated_seed_cotton, 0) * 35/100) / 1000) - ((COALESCE(pd.procurement_seed_cotton, 0) * 35/100) / 1000)) AS NUMERIC),
--              2
--          ) AS DOUBLE PRECISION) AS available_lint_cotton_farmer_mt,
        CAST(ROUND(
          CAST((
            COALESCE(ec.allocated_seed_cotton, 0)
          - 
          (
            COALESCE(pd.procurement_seed_cotton, 0) *
            CASE LOWER(fg.country_name)
            WHEN 'india' THEN 35
            WHEN 'pakistan' THEN 36
            WHEN 'bangladesh' THEN 40
            WHEN 'turkey' THEN 45
            WHEN 'egypt' THEN 49
            WHEN 'china' THEN 40
            ELSE 35
            END / 100.0
          ) / 1000
          ) AS NUMERIC),
          2
        ) AS DOUBLE PRECISION) AS available_lint_cotton_farmer_mt,
--         (COALESCE(pd.procurement_seed_cotton, 0) * 35/100) / 1000 AS procured_lint_cotton_mt,  
        (
          COALESCE(pd.procurement_seed_cotton, 0) *
          CASE LOWER(fg.country_name)
          WHEN 'india' THEN 35
          WHEN 'pakistan' THEN 36
          WHEN 'bangladesh' THEN 40
          WHEN 'turkey' THEN 45
          WHEN 'egypt' THEN 49
          WHEN 'china' THEN 40
          ELSE 35
          END / 100.0
        ) / 1000 AS procured_lint_cotton_mt,
        COALESCE(gb.total_qty, 0) AS produced_lint_cotton_kgs,
        COALESCE(gb.total_qty, 0) / 1000 AS produced_lint_cotton_mt,
--         CAST(ROUND(
--             CAST(((COALESCE(pd.procurement_seed_cotton, 0) * 35/100) / 1000) - (COALESCE(gb.total_qty, 0) / 1000) AS NUMERIC),
--             2
--             ) AS DOUBLE PRECISION) AS unprocessed_lint_cotton_mt,
        CAST(ROUND(
          CAST((
          (
            COALESCE(pd.procurement_seed_cotton, 0) *
            CASE LOWER(fg.country_name)
            WHEN 'india' THEN 35
            WHEN 'pakistan' THEN 36
            WHEN 'bangladesh' THEN 40
            WHEN 'turkey' THEN 45
            WHEN 'egypt' THEN 49
            WHEN 'china' THEN 40
            ELSE 35
            END / 100.0
          ) / 1000
          -
          (COALESCE(gb.total_qty, 0) / 1000)
          ) AS NUMERIC),
          2
        ) AS DOUBLE PRECISION) AS unprocessed_lint_cotton_mt,
        COALESCE(gs.total_qty, 0) / 1000 AS total_lint_cotton_sold_mt,
        COALESCE(gbg.total_qty, 0) / 1000 AS greyout_qty,
        COALESCE(gtg.lint_qty, 0) / 1000 AS total_qty_lint_transfered,
        COALESCE(gtgr.lint_qty, 0) / 1000 AS total_qty_lint_received_mt,
        COALESCE(gtsg.total_qty, 0) / 1000 AS lint_qty_to_be_submitted,
        CAST(ROUND(
            CAST((COALESCE(gb.total_qty, 0) / 1000 + COALESCE(gtgr.lint_qty, 0) / 1000) - (COALESCE(gs.total_qty, 0) / 1000 + COALESCE(gbg.total_qty, 0) / 1000 + COALESCE(gtg.lint_qty, 0) / 1000 + COALESCE(gtsg.total_qty, 0) / 1000) AS NUMERIC),
            2
        ) AS DOUBLE PRECISION) AS actual_lint_stock_mt,
        CAST(ROUND(
            CAST((COALESCE(gb.total_qty, 0) / 1000 + COALESCE(gtgr.lint_qty, 0) / 1000) - (COALESCE(gs.total_qty, 0) / 1000 + COALESCE(gbg.total_qty, 0) / 1000 + COALESCE(gtg.lint_qty, 0) / 1000) AS NUMERIC),
            2
        ) AS DOUBLE PRECISION) AS total_lint_stock_mt
      FROM
        ginner_data fg
        LEFT JOIN procurement_data pd ON fg.id = pd.ginner_id
        LEFT JOIN gin_process_data gp ON fg.id = gp.ginner_id
        LEFT JOIN gin_bale_data gb ON fg.id = gb.ginner_id
        LEFT JOIN pending_seed_cotton_data psc ON fg.id = psc.ginner_id
        LEFT JOIN gin_sales_data gs ON fg.id = gs.ginner_id
        LEFT JOIN allocated_cotton_data ec ON fg.id = ec.ginner_id
        LEFT JOIN gin_bale_greyout_data gbg ON fg.id = gbg.ginner_id
        LEFT JOIN gin_to_gin_sales_data gtg ON fg.id = gtg.ginner_id
        LEFT JOIN gin_to_gin_recieved_data gtgr ON fg.id = gtgr.ginner_id
        LEFT JOIN gin_to_be_submitted_data gtsg ON fg.id = gtsg.ginner_id
      ORDER BY
        fg.name asc
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

      let currentWorksheet = workbook.getWorksheet(`Sheet${worksheetIndex}`);
      if (!currentWorksheet) {
        currentWorksheet = workbook.addWorksheet(`Sheet${worksheetIndex}`);
       
        const headerRow = currentWorksheet.addRow([
              "Sr No.",
              "Ginner Name",
              "State",
              "Allocated lint quantity as per produced amount",
              "Seed cotton procured quantity (MT) to date",
              "Lint cotton procured quantity (MT) to date",
              "Lint cotton processed/produced quantity to date (MT)",
              "Lint cotton unprocessed/not produced quantity to date (MT)",
              "Lint cotton sold to date (MT)",
              "Lint cotton stock to date (MT)",
              "Lint cotton procured from other ginners (Ginner to Ginner transactions) to date (MT)",
              "Ginner rejected lint cotton quantity (MT)",
              "Carry forward stock  lint cotton from last season (MT)",
              "Lint cotton greyed out quantity on TB to date (MT)",
              "Remarks"
        ]);
        headerRow.font = { bold: true };
      }

      let totals = {
        allocated_lint_cotton_mt: 0,
        procurement_seed_cotton_mt: 0,
        procured_lint_cotton_mt: 0,
        produced_lint_cotton_mt: 0,
        unprocessed_lint_cotton_mt: 0,
        total_lint_cotton_sold_mt: 0,
        total_lint_stock_mt: 0,
        total_qty_lint_received_mt: 0,
        total_qty_lint_rejected_mt: 0,
        carry_forward_stock_lint_cotton_mt: 0,
        greyout_qty: 0
      };

      // Append data to worksheet
      for await (const [index, item] of rows.entries()) {
        let rowValues;
            rowValues = {
              index: index + 1,
              ginner_name: item.name,
              state: item.state_name,
              allocated_lint_cotton_mt: Number(formatDecimal(item.allocated_lint_cotton_mt)),
              procurement_seed_cotton_mt: Number(formatDecimal(item.procurement_seed_cotton_mt)),
              procured_lint_cotton_mt: Number(formatDecimal(item.procured_lint_cotton_mt)),
              produced_lint_cotton_mt: Number(formatDecimal(item.produced_lint_cotton_mt)),
              unprocessed_lint_cotton_mt: Number(formatDecimal(item.unprocessed_lint_cotton_mt)),
              total_lint_cotton_sold_mt: Number(formatDecimal(item.total_lint_cotton_sold_mt)),
              total_lint_stock_mt: Number(formatDecimal(item.total_lint_stock_mt)),
              total_qty_lint_received_mt: Number(formatDecimal(item.total_qty_lint_received_mt)),
              total_qty_lint_rejected_mt: 0,
              carry_forward_stock_lint_cotton_mt: 0,
              greyout_qty: Number(formatDecimal(item.greyout_qty)),
              remarks: ""
            };

          totals.allocated_lint_cotton_mt += item.allocated_lint_cotton_mt ? Number(item.allocated_lint_cotton_mt) : 0;
          totals.procurement_seed_cotton_mt += item.procurement_seed_cotton_mt ? Number(item.procurement_seed_cotton_mt) : 0;
          totals.procured_lint_cotton_mt += item.procured_lint_cotton_mt ? Number(item.procured_lint_cotton_mt) : 0;
          totals.produced_lint_cotton_mt += item.produced_lint_cotton_mt ? Number(item.produced_lint_cotton_mt) : 0;
          totals.unprocessed_lint_cotton_mt += item.unprocessed_lint_cotton_mt ? Number(item.unprocessed_lint_cotton_mt) : 0;
          totals.total_lint_cotton_sold_mt += item.total_lint_cotton_sold_mt ? Number(item.total_lint_cotton_sold_mt) : 0;
          totals.total_lint_stock_mt += item.total_lint_stock_mt ? Number(item.total_lint_stock_mt) : 0;
          totals.total_qty_lint_received_mt += item.total_qty_lint_received_mt ? Number(item.total_qty_lint_received_mt) : 0;
          totals.total_qty_lint_rejected_mt = 0,
          totals.carry_forward_stock_lint_cotton_mt = 0, 
          totals.greyout_qty += item.greyout_qty ? Number(item.greyout_qty) : 0;        
           
          currentWorksheet.addRow(Object.values(rowValues));
        }

         let rowValues = Object.values({
          index: "",
          ginner_name: "",
          state: "Total",
          allocated_lint_cotton_mt: Number(formatDecimal(totals.allocated_lint_cotton_mt)),
          procurement_seed_cotton_mt: Number(formatDecimal(totals.procurement_seed_cotton_mt)),
          procured_lint_cotton_mt: Number(formatDecimal(totals.procured_lint_cotton_mt)),
          produced_lint_cotton_mt: Number(formatDecimal(totals.produced_lint_cotton_mt)),
          unprocessed_lint_cotton_mt: Number(formatDecimal(totals.unprocessed_lint_cotton_mt)),
          total_lint_cotton_sold_mt: Number(formatDecimal(totals.total_lint_cotton_sold_mt)),
          total_lint_stock_mt: Number(formatDecimal(totals.total_lint_stock_mt)),
          total_qty_lint_received_mt: Number(formatDecimal(totals.total_qty_lint_received_mt)),
          total_qty_lint_rejected_mt: 0,
          carry_forward_stock_lint_cotton_mt: 0,
          greyout_qty: Number(formatDecimal(totals.greyout_qty)),
        });
     
       currentWorksheet.addRow(rowValues).eachCell((cell, colNumber) => { cell.font = { bold: true } });

      offset += batchSize;
      const borderStyle = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
      currentWorksheet.columns.forEach((column: any) => {
        let maxCellLength = 0;
        column.eachCell({ includeEmpty: true }, (cell: any) => {
          const cellLength = (cell.value ? cell.value.toString() : '').length;
          maxCellLength = Math.max(maxCellLength, cellLength);
          cell.border = borderStyle;
        });
        column.width = Math.min(24, maxCellLength + 2);
      });

    }
   
    await workbook.commit()
      .then(() => {
        fs.renameSync("./upload/ginner-details-sheet-test.xlsx", './upload/ginner-details-sheet.xlsx');
        console.log('Ginner details sheet report generation completed.');
      })
      .catch(error => {
        console.log('Failed generation?.');
        throw error;
      });

  } catch (error: any) {
    console.error("Error appending data:", error);
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
