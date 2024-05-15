import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
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


const exportReportsTameTaking = async () => {
  //call all export reports one by one on every cron
  await generateOrganicFarmerReport();
  await generateNonOrganicFarmerReport();
  await generateProcurementReport(); // taking time
  await generateAgentTransactions();
  await generateGinnerProcess(); // taking time
  await generateSpinnerLintCottonStock();
  await generateSpinProcessBackwardfTraceabilty();

  console.log('TameTaking Cron Job Completed to execute all reports.');
}

const exportReportsOnebyOne = async () => {
  //call all export reports one by one on every cron
  await generateFaildReport("Farmer");
  await generateFaildReport("Procurement");

  // Procurement Reports 
  await generatePscpCottonProcurement();
  await generatePscpProcurementLiveTracker();

  //brand wise report
  await generateBrandWiseData();

  // Ginner Reports 
  await generateGinnerSummary();
  await generateGinnerSales();
  await generatePendingGinnerSales();
  await generateGinnerCottonStock();

  //spinner Reports
  await generateSpinnerSummary();
  await generateSpinnerBale();
  await generateSpinnerYarnProcess();
  await generateSpinnerSale();
  await generatePendingSpinnerBale();
  await exportSpinnerGreyOutReport();

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
     where: {greyout_status : true},
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
};

const generateSpinnerLintCottonStock = async () => {
  const excelFilePath = path.join(
    "./upload",
    "spinner-lint-cotton-stock-report.xlsx"
  );

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

  let rows = await LintSelections.findAll({
    attributes: [
      [Sequelize.col('"spinprocess"."spinner"."id"'), "spinner_id"],
      [Sequelize.col('"spinprocess"."spinner"."name"'), "spinner_name"],
      [Sequelize.col('"spinprocess"."season"."id"'), "season_id"],
      [Sequelize.col('"spinprocess"."season"."name"'), "season_name"],
      [
        Sequelize.literal('MIN(DISTINCT "spinprocess"."batch_lot_no")'),
        "batch_lot_no",
      ],
      //this for comma separator batchlotno
      // [
      //     Sequelize.literal('ARRAY_TO_STRING(ARRAY_AGG(DISTINCT "spinprocess"."batch_lot_no"), \', \')'),
      //     'batch_lot_no'
      // ],
      [
        sequelize.fn(
          "COALESCE",
          sequelize.fn("SUM", sequelize.col("qty_used")),
          0
        ),
        "cotton_consumed",
      ],
    ],
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
  });

  let ndata = [];
  for await (let spinner of rows) {
    let salesData = await BaleSelection.findAll({
      attributes: [
        [Sequelize.col('"sales"."invoice_no"'), "invoice_no"],
        [Sequelize.col('"bale"."ginprocess"."reel_lot_no"'), "reel_lot_no"],
      ],
      where: {
        "$sales.buyer$": spinner?.dataValues?.spinner_id,
        "$sales.season_id$": spinner?.dataValues?.season_id,
        "$sales.status$": "Sold",
      },
      include: [
        {
          model: GinSales,
          as: "sales",
          attributes: [],
        },
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
      group: ["sales.invoice_no", "bale.ginprocess.reel_lot_no"],
    });

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
    for await (let [index, item] of salesData.entries()) {
      let cotton_procured = procuredCotton
        ? procuredCotton?.dataValues?.cotton_procured
        : 0;
      let cotton_consumed = spinner ? spinner?.dataValues?.cotton_consumed : 0;
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
        reel_lot_no: item?.dataValues.reel_lot_no ? item?.dataValues.reel_lot_no : "",
        invoice_no: item?.dataValues.invoice_no ? item?.dataValues.invoice_no : "",
        cotton_procured: cotton_procured ? cotton_procured : 0,
        cotton_consumed: cotton_consumed ? cotton_consumed : 0,
        cotton_stock: cotton_stock ? cotton_stock : 0,
      });
      worksheet.addRow(rowValues);
    }
  }

  // Save the workbook
  await workbook.xlsx.writeFile(excelFilePath);
};
//----------------------------------------- Farmer Reports ------------------------//

const generateOrganicFarmerReport = async () => {
  const maxRowsPerWorksheet = 500000; // Maximum number of rows per worksheet in Excel

  try {
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: fs.createWriteStream("./upload/farmer-organic-report-test.xlsx")
    });
    let worksheetIndex = 1;
    let Count = 0;
    const whereCondition: any = {};

    whereCondition['$program.program_name$'] = { [Op.iLike]: `%Organic%` };


    let include = [
      {
        model: Program, as: 'program',
        attributes: ['id', 'program_name']
      },
      {
        model: Brand, as: 'brand',
        attributes: ['brand_name', 'id']
      },
      {
        model: FarmGroup, as: 'farmGroup',
        attributes: ['name', 'id']
      },
      {
        model: Country, as: 'country',
        attributes: ['county_name', 'id']
      },
      {
        model: Village, as: 'village',
        attributes: ['village_name', 'id']
      },
      {
        model: State, as: 'state',
        attributes: ['state_name', 'id']
      },
      {
        model: District, as: 'district',
        attributes: ['district_name', 'id']
      },
      {
        model: Block, as: 'block',
        attributes: ['block_name', 'id']
      },
      {
        model: ICS, as: 'ics',
        attributes: ['ics_name', 'id']

      }
    ]

    let farmerCount = await Farmer.count({
      where: whereCondition,
      include: include
    })

    let loopCount = Math.ceil(farmerCount / 5000);
    for (let i = 1; i <= loopCount; i++) {
      const offset = (i - 1) * 5000;
      let farmer = await Farmer.findAll({
        attributes: ['firstName', 'lastName', 'tracenet_id', 'cert_status', 'id',
          'agri_total_area', 'cotton_total_area', 'total_estimated_cotton'],
        where: whereCondition,
        include: include,
        offset: offset,
        limit: 5000
      });

      if (farmer.length === 0) {
        // No more records to fetch, exit the loop
        break;
      }

      if (Count === maxRowsPerWorksheet) {
        worksheetIndex++;
        Count = 0;
      }

      // Append data to worksheet
      for await (const [index, item] of farmer.entries()) {
        const rowValues = Object.values({
          index: (offset + index + 1),
          farmerName: item.firstName + " " + `${item.lastName ? item.lastName : ""}`,
          farmGroup: item.farmGroup.name,
          tranid: item.tracenet_id,
          village: item.village.village_name,
          block: item.block.block_name,
          district: item.district.district_name,
          state: item.state.state_name,
          country: item.country.county_name,
          brand: item.brand.brand_name,
          totalArea: item ? item.agri_total_area : '',
          cottonArea: item ? item.cotton_total_area : '',
          totalEstimatedCotton: item ? item.total_estimated_cotton : '',
          icsName: item.ics ? item.ics.ics_name : '',
          icsStatus: item.cert_status ? item.cert_status : '',
        });

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
            'Cotton Area', 'Total Estimated Production', 'ICS Name', 'ICS Status'
          ]);
          headerRow.font = { bold: true };
        }
        currentWorksheet.addRow(rowValues).commit();
        Count++;
      }
    }

    await workbook.commit()
      .then(() => {
        // Rename the temporary file to the final filename
        fs.renameSync("./upload/farmer-organic-report-test.xlsx", './upload/farmer-organic-report.xlsx');
        console.log('farmer-organic-report report generation completed.');
      })
      .catch(error => {
        console.log('Failed generation?.');
        throw error;
      });
  } catch (error) {
    console.error('Error appending data:', error);
  }
}

const generateNonOrganicFarmerReport = async () => {
  // const excelFilePath = path.join('./upload', 'farmer-non-organic-report.xlsx');
  const maxRowsPerWorksheet = 500000; // Maximum number of rows per worksheet in Excel

  try {
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: fs.createWriteStream("./upload/farmer-non-organic-report-test.xlsx")
    });
    let worksheetIndex = 0;
    const whereCondition = {
      '$program.program_name$': { [Op.notILike]: `%Organic%` }
    };

    const include = [
      { model: Program, as: 'program', attributes: ['program_name'] },
      { model: Brand, as: 'brand', attributes: ['brand_name'] },
      { model: Country, as: 'country', attributes: ['county_name'] },
      { model: Village, as: 'village', attributes: ['village_name'] },
      { model: State, as: 'state', attributes: ['state_name'] },
      { model: District, as: 'district', attributes: ['district_name'] },
      { model: Block, as: 'block', attributes: ['block_name'] }
    ];

    const batchSize = 5000;
    let offset = 0;

    let hasNextBatch = true;
    while (hasNextBatch) {
      const farmers = await Farmer.findAll({
        attributes: ['firstName', 'lastName', 'code', 'agri_total_area', 'cotton_total_area', 'total_estimated_cotton'],
        where: whereCondition,
        include: include,
        offset: offset,
        limit: batchSize
      });

      if (farmers.length === 0) {
        hasNextBatch = false;
        break;
      }

      if (offset % maxRowsPerWorksheet === 0) {
        worksheetIndex++;
      }


      for await (const [index, item] of farmers.entries()) {
        const rowValues = [
          offset + index + 1,
          `${item.firstName} ${item.lastName ? item.lastName : ""}`,
          item.code,
          item.village?.village_name || '',
          item.block?.block_name || '',
          item.district?.district_name || '',
          item.state?.state_name || '',
          item.country?.county_name || '',
          item.brand.brand_name || '',
          item.program.program_name || '',
          item.agri_total_area || '',
          item.cotton_total_area || '',
          item.total_estimated_cotton || ''
        ];

        let currentWorksheet = workbook.getWorksheet(`Procurement Report ${worksheetIndex}`);
        if (!currentWorksheet) {
          currentWorksheet = workbook.addWorksheet(`Procurement Report ${worksheetIndex}`);
          if (worksheetIndex == 1) {
            currentWorksheet.mergeCells('A1:M1');
            const mergedCell = currentWorksheet.getCell('A1');
            mergedCell.value = 'Cotton Connect | Farmer Report';
            mergedCell.font = { bold: true };
            mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
          }
          // Set bold font for header row
          const headerRow = currentWorksheet.addRow([
            'S.No', 'Farmer Name', 'Farmer Code', 'Village',
            'Block', 'District', 'State', 'Country', 'Brand Name', 'Program Name', 'Total Area',
            'Cotton Area', 'Total Estimated Production'
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
    const batchSize = 5000; // Number of transactions to fetch per batch
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
          transaction.dataValues.date ? transaction.dataValues.date.toString() : '',
          transaction.dataValues.farmer_code ? transaction.dataValues.farmer_code : '',
          transaction.dataValues.farmer ? transaction.dataValues.farmer.firstName + ' ' + `${transaction.dataValues.farmer.lastName ? transaction.dataValues.farmer.lastName : ""}` : transaction.dataValues.farmer_name,
          transaction.dataValues.season ? transaction.dataValues.season.name : '',
          transaction.dataValues.country ? transaction.dataValues.country.county_name : '',
          transaction.dataValues.state ? transaction.dataValues.state.state_name : '',
          transaction.dataValues.district ? transaction.dataValues.district.district_name : '',
          transaction.dataValues.block ? transaction.dataValues.block.block_name : '',
          transaction.dataValues.village ? transaction.dataValues.village.village_name : '',
          transaction.dataValues.id ? transaction.dataValues.id : '',
          transaction.dataValues.qty_purchased ? transaction.dataValues.qty_purchased : '',
          transaction.dataValues.farm ? (Number(transaction.dataValues.farm.total_estimated_cotton) > Number(transaction.dataValues.farm.cotton_transacted) ? Number(transaction.dataValues.farm.total_estimated_cotton) - Number(transaction.dataValues.farm.cotton_transacted) : 0) : 0,
          transaction.dataValues.rate ? transaction.dataValues.rate : '',
          transaction.dataValues.program ? transaction.dataValues.program.program_name : '',
          transaction.dataValues.vehicle ? transaction.dataValues.vehicle : '',
          transaction.dataValues.payment_method ? transaction.dataValues.payment_method : '',
          transaction.dataValues.ginner ? transaction.dataValues.ginner.name : '',
          transaction.dataValues.agent ? transaction.dataValues.agent.firstName : "",
        ]).commit();
      }
      offset += batchSize
    };

    while (true) {
      // Fetch a batch of transactions
      const transactions = await Transaction.findAll({
        attributes: ['date', 'farmer_code', 'qty_purchased', 'rate', 'id', 'vehicle', 'payment_method'],
        where: { status: 'Sold' },
        include: [
          {
            model: Village,
            as: "village",
            attributes: ['id', 'village_name']
          },
          {
            model: Block,
            as: "block",
            attributes: ['id', 'block_name']
          },
          {
            model: District,
            as: "district",
            attributes: ['id', 'district_name']
          },
          {
            model: State,
            as: "state",
            attributes: ['id', 'state_name']
          },
          {
            model: Country,
            as: "country",
            attributes: ['id', 'county_name']
          },
          {
            model: Farmer,
            as: "farmer",
          },
          {
            model: Program,
            as: "program",
            attributes: ['id', 'program_name']
          },
          {
            model: Brand,
            as: "brand",
            attributes: ['id', 'brand_name']
          },
          {
            model: Ginner,
            as: "ginner",
            attributes: ['id', 'name', 'address']
          },
          {
            model: CropGrade,
            as: "grade",
            attributes: ['id', 'cropGrade']
          },
          {
            model: Season,
            as: "season",
            attributes: ['id', 'name']
          },
          {
            model: Farm,
            as: "farm"
          },
          {
            model: UserApp,
            as: "agent"
          },
        ],
        offset: offset,
        limit: batchSize
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
          currentWorksheet.mergeCells('A1:O1');
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
          "Country",
          "State",
          "District",
          "Block",
          "Village",
          "Transaction Id",
          "Quantity Purchased (Kgs)",
          "Available Cotton(Kgs)",
          "Price/Kg (Local Currency)",
          "Program",
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
          formatDecimal(obj.estimated_seed_cotton),
          formatDecimal(obj.estimated_lint),
          formatDecimal(obj.procurement_seed_cotton),
          obj.procurement,
          formatDecimal(obj.procured_lint_cotton),
          obj.no_of_bales,
          formatDecimal(obj.total_qty_lint_produced),
          obj.sold_bales,
          formatDecimal(obj.average_weight),
          formatDecimal(obj.total_qty_sold_lint),
          obj.balace_stock,
          formatDecimal(obj.balance_lint_quantity)
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

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: fs.createWriteStream("./upload/pscp-procurement-sell-live-tracker-test.xlsx")
    });
    let worksheetIndex = 1;
    let Count = 0;

    let data: any = [];

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

      const ginners = await Ginner.findAll({
        include: [
          {
            model: State,
            as: "state",
            attributes: ["id", "state_name"],
          },
        ],
        offset: offset,
        limit: 5000
      });

      if (ginners.length === 0) {
        // No more records to fetch, exit the loop
        break;
      }

      if (Count === maxRowsPerWorksheet) {
        worksheetIndex++;
        Count = 0;
      }
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
                program_id: program,
                ginner_id: item.dataValues.ginner.id,
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
              },
            });

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
            obj.balace_stock = Math.max(obj.no_of_bales - obj.sold_bales) ?? 0;
            obj.balance_lint_quantity = Math.max(obj.total_qty_lint_produced - obj.total_qty_sold_lint) ?? 0;
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

      let index = 0;
      for await (const obj of data) {
        const rowValues = Object.values({
          index: index + 1,
          name: obj?.ginner ? obj.ginner.name : "",
          state: obj.state ? obj.state?.state_name : "",
          program: obj.program ? obj.program?.program_name : "",
          expected_seed_cotton: obj.expected_seed_cotton,
          expected_lint: obj.expected_lint,
          procurement_seed_cotton: formatDecimal(obj.procurement_seed_cotton),
          procurement: obj.procurement < 0 ? 0 : obj.procurement,
          pending_seed_cotton: obj.pending_seed_cotton
            ? formatDecimal(obj.pending_seed_cotton)
            : 0,
          procured_lint_cotton_kgs: formatDecimal(obj.procured_lint_cotton_kgs),
          procured_lint_cotton_mt: formatDecimal(obj.procured_lint_cotton_mt),
          no_of_bales: obj.no_of_bales,
          sold_bales: obj.sold_bales ? obj.sold_bales : "",
          total_qty_sold_lint: obj.total_qty_sold_lint
            ? formatDecimal(obj.total_qty_sold_lint)
            : 0,
          order_in_hand: obj.order_in_hand ? formatDecimal(obj.order_in_hand) : 0,
          balace_stock: obj.balace_stock,
          balance_lint_quantity: formatDecimal(obj.balance_lint_quantity),
          ginner_sale_percentage: obj.ginner_sale_percentage,
        });
        index++;

        let currentWorksheet = workbook.getWorksheet(`Sheet${worksheetIndex}`);
        if (!currentWorksheet) {
          currentWorksheet = workbook.addWorksheet(`Sheet${worksheetIndex}`);
          if (worksheetIndex == 1) {
            currentWorksheet.mergeCells("A1:R1");
            const mergedCell = currentWorksheet.getCell("A1");
            mergedCell.value = "CottonConnect | PSCP Procurement and Sell Live Tracker";
            mergedCell.font = { bold: true };
            mergedCell.alignment = { horizontal: "center", vertical: "middle" };
          }
          // Set bold font for header row
          const headerRow = currentWorksheet.addRow([
            "Sr No.",
            "Ginning Mill",
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
  const batchSize = 5000; // Number of records to fetch per batch

  try {
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: fs.createWriteStream("./upload/agent-transactions-test.xlsx")
    });
    let worksheetIndex = 0;
    let offset = 0;
    let queryOptions: any = {
      where: {
        agent_id: { [Op.not]: null }
      },
      include: [
        {
          model: Village,
          as: "village",
          attributes: ['id', 'village_name']
        },
        {
          model: Block,
          as: "block",
          attributes: ['id', 'block_name']
        },
        {
          model: District,
          as: "district",
          attributes: ['id', 'district_name']
        },
        {
          model: State,
          as: "state",
          attributes: ['id', 'state_name']
        },
        {
          model: Country,
          as: "country",
          attributes: ['id', 'county_name']
        },
        {
          model: Farmer,
          as: "farmer",
        },
        {
          model: Program,
          as: "program",
          attributes: ['id', 'program_name']
        },
        {
          model: Brand,
          as: "brand",
          attributes: ['id', 'brand_name']
        },
        {
          model: Ginner,
          as: "ginner",
          attributes: ['id', 'name', 'address']
        },
        {
          model: CropGrade,
          as: "grade",
          attributes: ['id', 'cropGrade']
        },
        {
          model: Season,
          as: "season",
          attributes: ['id', 'name']
        },
        {
          model: Farm,
          as: "farm"
        },
        {
          model: UserApp,
          as: "agent"
        },
      ],
    };

    do {
      const transactions = await Transaction.findAll({
        ...queryOptions,
        limit: batchSize,
        offset: offset
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
          'Available Cotton (Kgs)', 'Price/KG(Local Currency)', 'Program', 'Transport Vehicle No', 'Payment Method', 'Ginner Name', 'Agent'
        ]);
        headerRow.font = { bold: true };
      }

      // Append data to worksheet
      for await (const [index, item] of transactions.entries()) {
        const rowValues = Object.values({
          index: index + offset + 1,
          date: moment(item.date).format('DD/MM/YYYY'),
          farmerCode: item.farmer ? item.farmer?.code : "",
          farmerName: item.farmer ? item.farmer?.firstName + ' ' + `${item.farmer?.lastName ? item.farmer?.lastName : ""}` : "",
          season: item.season ? item.season.name : "",
          country: item.country ? item.country.county_name : "",
          state: item.state ? item.state.state_name : "",
          district: item.district ? item.district.district_name : "",
          block: item.block ? item.block.block_name : "",
          village: item.village ? item.village.village_name : "",
          transactionId: item.id,
          qty_purchased: item.qty_purchased,
          available_cotton: item.farm ? (Number(item.farm.total_estimated_cotton) > Number(item.farm.cotton_transacted) ? Number(item.farm.total_estimated_cotton) - Number(item.farm.cotton_transacted) : 0) : 0,
          rate: item.rate,
          program: item.program ? item.program.program_name : "",
          vehicle: item.vehicle ? item.vehicle : "",
          payment_method: item.payment_method ? item.payment_method : "",
          ginner: item.ginner ? item.ginner.name : "",
          agent: item.agent ? item.agent.firstName : "",
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
          currentWorksheet.mergeCells('A1:K1');
          const mergedCell = currentWorksheet.getCell('A1');
          mergedCell.value = 'CottonConnect | Ginner Summary Report';
          mergedCell.font = { bold: true };
          mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
          // Set bold font for header row

        }
        // Set bold font for header row
        const headerRow = currentWorksheet.addRow([
          "S. No.", "Ginner Name", "Total seed cotton procured (MT)", "Total seed cotton processed (MT)",
          "Total seed cotton in stock (MT)", "Total lint produce (MT)", "Total lint sold (MT)", "Total lint in stock (MT)",
          "Total bales produce", "Total bales sold", "Total bales in stock"
        ]);
        headerRow.font = { bold: true };
      }

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
          index: index + offset + 1,
          name: item.name ? item.name : '',
          cottonProcuredMt: obj.cottonProcuredMt,
          cottonProcessedeMt: obj.cottonProcessedeMt,
          cottonStockMt: obj.cottonStockMt,
          lintProcuredMt: obj.lintProcuredMt,
          lintSoldMt: obj.lintSoldMt,
          lintStockMt: obj.lintStockMt,
          balesProduced: obj.balesProduced,
          balesSold: obj.balesSold,
          balesStock: obj.balesStock
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

    while (hasNextBatch) {
      const { count, rows } = await GinProcess.findAndCountAll({
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
          currentWorksheet.mergeCells('A1:T1');
          const mergedCell = currentWorksheet.getCell('A1');
          mergedCell.value = 'CottonConnect | Ginner Bale Process Report';
          mergedCell.font = { bold: true };
          mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };

        }
        // Set bold font for header row
        // Set bold font for header row
        const headerRow = currentWorksheet.addRow([
          "Sr No.", "Process Date", "Data Entry Date", "Season", "Ginner Name", "Heap Number", "Gin Lot No", "Gin Press No", "REEL Lot No", "REEL Process Nos", "No of Bales", "Lint Quantity(Kgs)", "Total Seed Cotton Consumed(Kgs)", "GOT", "Total lint cotton sold(Kgs)", "Total Bales Sold", "Total lint cotton in stock(Kgs)", "Total Bales in stock", "Program", "Village"
        ]);
        headerRow.font = { bold: true };
      }


      // Append data to worksheet
      const processIds = rows.map((process: any) => process.id);
      const ginBales = await GinBale.findAll({
        attributes: [
          [
            Sequelize.fn(
              "SUM",
              Sequelize.literal("CAST(weight AS DOUBLE PRECISION)")
            ),
            "lint_quantity",
          ],
          [sequelize.fn("min", sequelize.col("bale_no")), "pressno_from"],
          [sequelize.fn("max", sequelize.col("bale_no")), "pressno_to"],
          "process_id",
        ],
        raw: true,
        where: { process_id: { [Op.in]: processIds } },
        group: ["process_id"],
      });

      const cottonSelections = await CottonSelection.findAll({
        include: [
          {
            model: Transaction,
            include: [
              {
                model: Village,
                attributes: [],
                as: "village",
              },
            ],
            attributes: [],
            as: "transaction",
          },
        ],
        attributes: [
          "process_id",
          [sequelize.col("transaction.village.village_name"), "name"],
        ],
        where: { process_id: { [Op.in]: processIds } },
      });
      let soldData = await GinBale.findAll({
        attributes: [
          [Sequelize.fn("COUNT", Sequelize.col("id")), "soldBales"],
          [
            Sequelize.fn(
              "SUM",
              Sequelize.literal("CAST(weight AS DOUBLE PRECISION)")
            ),
            "lint_quantity_sold",
          ],
          "process_id",
        ],
        group: ["process_id"],
        where: { process_id: { [Op.in]: processIds }, sold_status: true },
      });
      // Append data to worksheet
      for await (const [index, item] of rows.entries()) {
        const cottonSelectionsForProcess = cottonSelections.filter((cotton: any) => cotton.dataValues.process_id === item.id);

        let bale = ginBales.find((obj: any) => obj.process_id == item.id);

        let gin_press_no =
          (bale?.pressno_from || "") +
          "-" +
          (bale?.pressno_to || "");
        let lint_quantity = bale?.lint_quantity ?? 0;
        let reel_press_no =
          (item?.no_of_bales ?? 0) === 0
            ? ""
            : `001-${item.no_of_bales < 9
              ? `00${item.no_of_bales}`
              : item.no_of_bales < 99
                ? `0${item.no_of_bales}`
                : item.no_of_bales
            }`;
        let soldLint = soldData.find((obj: any) => obj.process_id == item.id);
        let soldBales = soldLint?.dataValues?.soldBales ?? '0';
        let soldlint = soldLint?.dataValues?.lint_quantity_sold ?? '0'
        let lintStock =
          Number(lint_quantity) -
          Number(soldlint);
        let balesStock = Number(item?.no_of_bales ?? '0') - Number(soldBales);


        const rowValues = Object.values({
          index: index + offset + 1,
          date: item.date ? item.date : "",
          created_date: item.createdAt ? item.createdAt : "",
          season: item.season ? item.season.name : "",
          ginner: item.ginner ? item.ginner.name : "",
          heap: item.heap_number ? item.heap_number : '',
          lot_no: item.lot_no ? item.lot_no : "",
          press_no: gin_press_no,
          reel_lot_no: item.reel_lot_no ? item.reel_lot_no : "",
          process_no: reel_press_no ? reel_press_no : "-",
          noOfBales: item.no_of_bales ? item.no_of_bales : '0',
          lint_qty: lint_quantity,
          seedConsmed: item.total_qty ? item.total_qty : "",
          got: item.gin_out_turn ? item.gin_out_turn : "",
          lint_quantity_sold: soldlint,
          sold_bales: soldBales,
          lint_stock: lintStock && lintStock > 0 ? lintStock : '0',
          bale_stock: balesStock && balesStock > 0 ? balesStock : '0',
          program: item.program ? item.program.program_name : "",
          village:
            [...new Set(cottonSelectionsForProcess.map((obj: any) => obj.dataValues.name))].join(", "),
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
  const maxRowsPerWorksheet = 500000; // Maximum number of rows per worksheet in Excel

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
          [Sequelize.literal('"sales"."id"'), 'sales_id'],
          [Sequelize.literal('"sales"."date"'), 'date'],
          [Sequelize.literal('"sales"."createdAt"'), 'createdAt'],
          [Sequelize.col('"sales"."season"."name"'), 'season_name'],
          [Sequelize.col('"sales"."ginner"."name"'), 'ginner'],
          [Sequelize.col('"sales"."program"."program_name"'), 'program'],
          [Sequelize.col('"sales"."buyerdata"."name"'), 'buyerdata'],
          [Sequelize.literal('"sales"."total_qty"'), 'total_qty'],
          [Sequelize.literal('"sales"."invoice_no"'), 'invoice_no'],
          [Sequelize.col('"bale"."ginprocess"."lot_no"'), 'lot_no'],
          [Sequelize.col('"bale"."ginprocess"."reel_lot_no"'), 'reel_lot_no'],
          [Sequelize.literal('"sales"."rate"'), 'rate'],
          [Sequelize.literal('"sales"."candy_rate"'), 'candy_rate'],
          [Sequelize.fn("SUM", Sequelize.literal('CAST("bale"."weight" AS DOUBLE PRECISION)')),
            "lint_quantity"],
          [Sequelize.fn('COUNT', Sequelize.literal('DISTINCT bale_id')), 'no_of_bales'],
          [Sequelize.literal('"sales"."sale_value"'), 'sale_value'],
          [Sequelize.literal('"sales"."press_no"'), 'press_no'],
          [Sequelize.literal('"sales"."qty_stock"'), 'qty_stock'],
          [Sequelize.literal('"sales"."weight_loss"'), 'weight_loss'],
          [Sequelize.literal('"sales"."invoice_file"'), 'invoice_file'],
          [Sequelize.literal('"sales"."vehicle_no"'), 'vehicle_no'],
          [Sequelize.literal('"sales"."transporter_name"'), 'transporter_name'],
          [Sequelize.literal('"sales"."transaction_agent"'), 'transaction_agent'],
          [Sequelize.literal('"sales"."status"'), 'status'],
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
        group: ['bale.process_id', 'bale.ginprocess.id', 'sales.id', "sales.season.id", "sales.ginner.id", "sales.buyerdata.id", "sales.program.id"],
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
          currentWorksheet.mergeCells('A1:T1');
          const mergedCell = currentWorksheet.getCell('A1');
          mergedCell.value = 'CottonConnect | Ginner Sales Report';
          mergedCell.font = { bold: true };
          mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
          // Set bold font for header row
        }
        // Set bold font for header row
        const headerRow = currentWorksheet.addRow([
          "Sr No.", "Process Date", "Data Entry Date", "Season", "Ginner Name",
          "Invoice No", "Sold To", "Heap Number", "Bale Lot No", "REEL Lot No", "No of Bales", "Press/Bale No", "Rate/Kg",
          "Total Quantity", "Sales Value", "Vehicle No", "Transporter Name", "Program", "Agent Detials", "status"
        ]);
        headerRow.font = { bold: true };
      }

      // Append data to worksheet
      for await (const [index, item] of rows.entries()) {
        const rowValues = Object.values({
          index: index + offset + 1,
          date: item.dataValues.date ? item.dataValues.date : '',
          created_at: item.dataValues.createdAt ? item.dataValues.createdAt : '',
          season: item.dataValues.season_name ? item.dataValues.season_name : '',
          ginner: item.dataValues.ginner ? item.dataValues.ginner : '',
          invoice: item.dataValues.invoice_no ? item.dataValues.invoice_no : '',
          buyer: item.dataValues.buyerdata ? item.dataValues.buyerdata : '',
          heap: '',
          lot_no: item.dataValues.lot_no ? item.dataValues.lot_no : '',
          reel_lot_no: item.dataValues.reel_lot_no ? item.dataValues.reel_lot_no : '',
          no_of_bales: item.dataValues.no_of_bales ? item.dataValues.no_of_bales : '',
          press_no: item.dataValues.press_no ? item.dataValues.press_no : '',
          rate: item.dataValues.rate ? item.dataValues.rate : '',
          lint_quantity: item.dataValues.lint_quantity ? item.dataValues.lint_quantity : '',
          sales_value: item.dataValues.sale_value ? item.dataValues.sale_value : '',
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

    whereCondition.status = "To be Submitted";

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
      const { count, rows } = await GinSales.findAndCountAll({
        where: whereCondition,
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
          currentWorksheet.mergeCells("A1:M1");
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
          "Program",
          "status",
        ]);
        headerRow.font = { bold: true };
      }

      // Append data to worksheet
      for await (const [index, item] of rows.entries()) {
        const rowValues = Object.values({
          index: index + offset + 1,
          date: item.date ? item.date : "",
          season: item.season ? item.season.name : "",
          ginner: item.ginner ? item.ginner.name : "",
          invoice: item.invoice_no ? item.invoice_no : "",
          buyer: item.buyerdata ? item.buyerdata.name : "",
          lot_no: item.lot_no ? item.lot_no : "",
          reel_lot_no: item.reel_lot_no ? item.reel_lot_no : "",
          no_of_bales: item.no_of_bales ? item.no_of_bales : "",
          press_no: item.press_no ? item.press_no : "",
          rate: item.rate ? item.rate : "",
          total_qty: item.total_qty ? item.total_qty : "",
          program: item.program ? item.program.program_name : "",
          status: item.status ? item.status : "",
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
          [
            sequelize.fn(
              "COALESCE",
              sequelize.fn("SUM", sequelize.col("total_qty")),
              0
            ),
            "cotton_processed",
          ],
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
            status: "Sold",
          },
        });

        obj.cotton_procured = cottonProcured?.dataValues?.cotton_procured ?? 0;
        obj.cotton_stock = cottonProcured?.dataValues?.cotton_stock ?? 0;

        const rowValues = Object.values({
          index: index + offset + 1,
          ginner: item?.dataValues.ginner_name ? item?.dataValues.ginner_name : "",
          season: item?.dataValues.season_name ? item?.dataValues.season_name : "",
          cotton_procured: obj.cotton_procured ? obj.cotton_procured : 0,
          cotton_processed: item?.dataValues?.cotton_processed ? item?.dataValues?.cotton_processed : 0,
          cotton_stock: obj.cotton_stock ? obj.cotton_stock : 0,
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
          index: index + offset + 1,
          name: item.name ? item.name : "",
          lint_cotton_procured: obj.lintCottonProcuredMT,
          lint_cotton_procured_pending: obj.lintCottonProcuredPendingMT,
          lint_consumed: obj.lintConsumedMT,
          balance_lint_cotton: obj.lintStockMT,
          yarn_procured: obj.yarnProcuredMT,
          yarn_sold: obj.yarnSoldMT,
          yarn_stock: obj.yarnStockMT,
        });

        let currentWorksheet = workbook.getWorksheet(`Spinner Summary ${worksheetIndex}`);
        if (!currentWorksheet) {
          currentWorksheet = workbook.addWorksheet(`Spinner Summary ${worksheetIndex}`);
          if (worksheetIndex == 1) {
            currentWorksheet.mergeCells("A1:I1");
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
            "Balance Lint cotton stock in MT",
            "Total Yarn Produced MT",
            "Yarn sold in MT",
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

  const whereCondition: any = {};
  const maxRowsPerWorksheet = 500000;

  try {

    whereCondition["$sales.status$"] = "Sold";
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: fs.createWriteStream("./upload/Spinner-bale-receipt-report-test.xlsx")
    });
    let worksheetIndex = 0;


    const batchSize = 5000;
    let offset = 0;
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
      {
        model: Spinner,
        as: "buyerdata",
        attributes: [],
      },
    ];
    // //fetch data with pagination
    while (hasNextBatch) {
      const rows: any = await BaleSelection.findAll({
        attributes: [
          [Sequelize.literal('"sales"."id"'), "sales_id"],
          [Sequelize.literal('"sales"."date"'), "date"],
          [Sequelize.literal('"sales"."accept_date"'), "accept_date"],
          [Sequelize.col('"sales"."season"."name"'), "season_name"],
          [Sequelize.col('"sales"."ginner"."name"'), "ginner"],
          [Sequelize.col('"sales"."program"."program_name"'), "program"],
          [Sequelize.col('"sales"."buyerdata"."name"'), "spinner"],
          [Sequelize.literal('"sales"."total_qty"'), "total_qty"],
          [Sequelize.literal('"sales"."invoice_no"'), "invoice_no"],
          [Sequelize.col('"bale"."ginprocess"."lot_no"'), "lot_no"],
          [Sequelize.col('"bale"."ginprocess"."reel_lot_no"'), "reel_lot_no"],
          [Sequelize.literal('"sales"."rate"'), "rate"],
          [Sequelize.literal('"sales"."candy_rate"'), "candy_rate"],
          [
            Sequelize.fn(
              "SUM",
              Sequelize.literal('CAST("bale"."weight" AS DOUBLE PRECISION)')
            ),
            "lint_quantity",
          ],
          [
            Sequelize.fn("COUNT", Sequelize.literal("DISTINCT bale_id")),
            "no_of_bales",
          ],
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
          "bale.process_id",
          "bale.ginprocess.id",
          "sales.id",
          "sales.season.id",
          "sales.ginner.id",
          "sales.buyerdata.id",
          "sales.program.id",
        ],
        offset: offset,
        limit: batchSize,
      });
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
            ? item.dataValues.no_of_bales
            : "",
          lint_quantity: item.dataValues.lint_quantity
            ? item.dataValues.lint_quantity
            : "",
          program: item.dataValues.program ? item.dataValues.program : "",
        });

        let currentWorksheet = workbook.getWorksheet(`Spinner Bale Receipt ${worksheetIndex}`);
        if (!currentWorksheet) {
          currentWorksheet = workbook.addWorksheet(`Spinner Bale Receipt ${worksheetIndex}`);
          if (worksheetIndex == 1) {
            currentWorksheet.mergeCells("A1:M1");
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
            "No of Bales",
            "Total Lint Quantity(Kgs)",
            "Programme",
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

    while (hasNextBatch) {

      const { count, rows } = await SpinProcess.findAndCountAll({
        where: whereCondition,
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

      // Append data to worksheet
      for await (const [index, item] of rows.entries()) {
        let blendValue = "";
        let blendqty = "";
        let yarncount = "";

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

        if (item.yarn_count && item.yarn_count.length > 0) {
          let yarn = await YarnCount.findAll({
            attributes: ["id", "yarnCount_name"],
            where: { id: { [Op.in]: item.yarn_count } },
          });
          yarncount = yarn
            .map((yrn: any) => yrn.dataValues.yarnCount_name)
            .join(",");
        }

        let cottonConsumed = await LintSelections.findOne({
          attributes: [
            [
              sequelize.fn(
                "COALESCE",
                sequelize.fn("SUM", sequelize.col("qty_used")),
                0
              ),
              "cotton_consumed",
            ],
          ],
          where: { process_id: item.dataValues.id },
          group: ["process_id"],
        });

        let yarnSold = await SpinProcessYarnSelection.findOne({
          attributes: [
            [
              sequelize.fn(
                "COALESCE",
                sequelize.fn("SUM", sequelize.col("qty_used")),
                0
              ),
              "yarn_sold",
            ],
          ],
          where: { spin_process_id: item.dataValues.id },
        });

        const rowValues = Object.values({
          index: index + offset + 1,
          date: item.date ? item.date : "",
          season: item.season ? item.season.name : "",
          spinner: item.spinner ? item.spinner.name : "",
          lotNo: item.batch_lot_no ? item.batch_lot_no : "",
          reel_lot_no: item.reel_lot_no ? item.reel_lot_no : "",
          yarnType: item.yarn_type ? item.yarn_type : "",
          count: yarncount ? yarncount : "",
          resa: item.yarn_realisation ? item.yarn_realisation : "",
          comber: item.comber_noil ? item.comber_noil : "",          
          blend: blendValue,
          blendqty: blendqty,
          cotton_consumed: cottonConsumed
            ? cottonConsumed?.dataValues?.cotton_consumed
            : 0,
          program: item.program ? item.program.program_name : "",
          total: item.net_yarn_qty,
          yarn_sold: yarnSold ? yarnSold?.dataValues?.yarn_sold : 0,
          yarn_stock: item.qty_stock ? item.qty_stock : 0,
        });

        let currentWorksheet = workbook.getWorksheet(`Spinner Yarn Process ${worksheetIndex}`);
        if (!currentWorksheet) {
          currentWorksheet = workbook.addWorksheet(`Spinner Yarn Process ${worksheetIndex}`);
          if (worksheetIndex == 1) {
            currentWorksheet.mergeCells("A1:S1");
            const mergedCell = currentWorksheet.getCell("A1");
            mergedCell.value = "CottonConnect | Spinner Yarn Process Report";
            mergedCell.font = { bold: true };
            mergedCell.alignment = { horizontal: "center", vertical: "middle" };
          }

          const headerRow = currentWorksheet.addRow([
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

  // spinner_yarn_sales_load
  const excelFilePath = path.join("./upload", "spinner-yarn-sale.xlsx");
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

    while (hasNextBatch) {

      const { count, rows }: any = await SpinProcessYarnSelection.findAndCountAll(
        {
          attributes: [
            [Sequelize.literal('"sales"."id"'), "sales_id"],
            [Sequelize.literal('"sales"."date"'), "date"],
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
            [Sequelize.literal('"process"."reel_lot_no"'), "reel_lot_no"],
            [Sequelize.literal('"sales"."no_of_boxes"'), "no_of_boxes"],
            [Sequelize.literal('"sales"."price"'), "price"],
            // [Sequelize.literal('"process"."qty_used"'), 'yarn_weight'],
            [Sequelize.literal("qty_used"), "yarn_weight"],
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
          order: [["sales_id", "desc"]],
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
          date: item.dataValues.date ? item.dataValues.date : "",
          season: item.dataValues.season_name ? item.dataValues.season_name : "",
          spinner: item.dataValues.spinner ? item.dataValues.spinner : "",
          buyer_id: item.dataValues.weaver
            ? item.dataValues.weaver
            : item.dataValues.knitter
              ? item.dataValues.knitter
              : "",
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
          total: item.dataValues.yarn_weight ? item.dataValues.yarn_weight : 0,
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
            currentWorksheet.mergeCells("A1:Q1");
            const mergedCell = currentWorksheet.getCell("A1");
            mergedCell.value = "CottonConnect | Spinner Yarn Sales Report";
            mergedCell.font = { bold: true };
            mergedCell.alignment = { horizontal: "center", vertical: "middle" };
          }

          const headerRow = currentWorksheet.addRow([
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
  const maxRowsPerWorksheet = 500000; // Maximum number of rows per worksheet in Excel
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

    let include = [
      {
        model: Spinner,
        as: "spinner",
        attributes: ["id", "name"],
      }
    ];

    while (hasNextBatch) {

    const { count, rows } = await SpinProcess.findAndCountAll({
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

    for await (let [index, item] of rows.entries()) {
      let spnr_lint_ids: any = [];
      let spinProcess = await LintSelections.findAll({
        where: {
          process_id: item.dataValues.id,
        },
        attributes: ["id", "lint_id"],
      });
      spnr_lint_ids = spinProcess.map((obj: any) => obj?.dataValues?.lint_id);

      let lintConsumed = await LintSelections.findOne({
        attributes: [
          [
            sequelize.fn(
              "COALESCE",
              sequelize.fn("SUM", sequelize.col("qty_used")),
              0
            ),
            "lint_consumed",
          ],
        ],
        where: { process_id: item.dataValues.id },
        group: ["process_id"],
      });

      let yarnConsumed= await SpinProcessYarnSelection.findAll({
        attributes: [
          'sales_id',
          "qty_used",
          [Sequelize.col('"sales"."buyer_type"'), "buyer_type"],
          [Sequelize.col('"sales"."buyer_id"'), "buyer_id"],
          [Sequelize.col('"sales"."knitter_id"'), "knitter_id"],
          [Sequelize.col('"sales"."knitter"."name'), "knitter"],
          [Sequelize.col('"sales"."weaver"."name'), "weaver"],
          [Sequelize.literal('"sales"."invoice_no"'), "invoice_no"],
        ],
        include:[{
          model: SpinSales,
          as: "sales",
          attributes: [],
          include:[
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
        ]
        }],
        where: { spin_process_id: item.dataValues.id },
      });

      let ginSales: any = [];
      let gin_process_ids: any = [];
      let transactions_ids: any = [];

      if (spnr_lint_ids.length > 0) {
        ginSales = await GinSales.findAll({
          attributes: [
            "id",
            "invoice_no",
            "lot_no",
            "reel_lot_no",
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
          ],
        });
      }

      let yarnSold = 0;
      yarnConsumed && yarnConsumed.length > 0 && yarnConsumed.map((item: any)=> yarnSold += Number(item?.dataValues?.qty_used));

      let obj: any = {};
      obj.lint_consumed = lintConsumed ? formatDecimal(lintConsumed?.dataValues?.lint_consumed) : 0;

      let knitterName =
        yarnConsumed && yarnConsumed.length > 0
        ? yarnConsumed
          .map((val: any) => val?.dataValues?.knitter)
          .filter((item: any) => item !== null && item !== undefined)
        : [];
      
      let weaverName =
        yarnConsumed && yarnConsumed.length > 0
          ? yarnConsumed
            .map((val: any) => val?.dataValues?.weaver)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      
      let salesInvoice =
        yarnConsumed && yarnConsumed.length > 0
          ? yarnConsumed
            .map((val: any) => val?.dataValues?.invoice_no)
            .filter((item: any) => item !== null && item !== undefined)
           : [];

      
      obj.fbrc_name = [...new Set([...knitterName, ...weaverName])];
      obj.spnr_invoice_no = [...new Set(salesInvoice)];
      obj.spnr_yarn_sold = yarnSold;

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

      obj.gnr_name = [...new Set(ginName)];
      obj.gnr_invoice_no = [...new Set(ginInvoice)];
      obj.gnr_lot_no = [...new Set(ginLot)];
      obj.gnr_reel_lot_no = [...new Set(ginReelLot)];

      let frmrVillages =
        transactions && transactions.length > 0
          ? transactions
            .map((val: any) => val?.village?.village_name)
            .filter((item: any) => item !== null && item !== undefined)
          : [];

      obj.frmr_villages = [...new Set(frmrVillages)];

      const rowValues = [
        index + offset + 1,
        item.dataValues?.spinner ? item.dataValues?.spinner?.name : "",
        obj.fbrc_name && obj.fbrc_name.length > 0
        ? obj.fbrc_name.join(", ")
        : "",
        item.dataValues?.reel_lot_no ? item.dataValues?.reel_lot_no : "",
        obj.spnr_invoice_no && obj.spnr_invoice_no.length > 0
        ? obj.spnr_invoice_no.join(", ")
        : "",
        item.dataValues?.net_yarn_qty ? item.dataValues?.net_yarn_qty : 0,
        obj.spnr_yarn_sold ? obj.spnr_yarn_sold : 0,
        obj.gnr_reel_lot_no && obj.gnr_reel_lot_no.length > 0
        ? obj.gnr_reel_lot_no.join(", ")
        : "",
        obj.gnr_lot_no && obj.gnr_lot_no.length > 0
        ? obj.gnr_lot_no.join(", ")
        : "",
        obj.gnr_invoice_no && obj.gnr_invoice_no.length > 0
        ? obj.gnr_invoice_no.join(", ")
        : "",
        obj.lint_consumed,
        obj.frmr_villages && obj.frmr_villages.length > 0
        ? obj.frmr_villages.join(", ")
        : "",
        obj.gnr_name && obj.gnr_name.length > 0
        ? obj.gnr_name.join(", ")
        : "",
      ];
      currentWorksheet.addRow(rowValues).commit();
      }
      offset += batchSize;
  }

    // Save the workbook
    await workbook.commit()
      .then(() => {
        // Rename the temporary file to the final filename
        fs.renameSync("./upload/spin-process-backward-traceability-test.xlsx", './upload/spin-process-backward-traceability.xlsx');
        console.log('spin-process-backward-traceability report generation completed.');
      })
      .catch(error => {
        console.log('Failed generation Report.');
        throw error;
      });
  } catch (error: any) {
    console.log(error);
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

    whereCondition.total_qty = {
      [Op.gt]: 0,
    };
    whereCondition.status = { [Op.in]: ['Pending', "Pending for QR scanning"] }
    whereCondition.buyer = {
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
      let rows = await GinSales.findAll({
        where: whereCondition,
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

      // Append data to worksheet
      for await (const [index, item] of rows.entries()) {
        const rowValues = Object.values({
          index: index + offset + 1,
          date: item.date ? item.date : "",
          season: item.season ? item.season.name : "",
          buyer: item.buyerdata ? item.buyerdata.name : "",
          ginner: item.ginner ? item.ginner.name : "",
          invoice: item.invoice_no ? item.invoice_no : "",
          no_of_bales: item.no_of_bales ? item.no_of_bales : "",
          lot_no: item.lot_no ? item.lot_no : "",
          reel_lot_no: item.reel_lot_no ? item.reel_lot_no : "",
          total_qty: item.total_qty ? item.total_qty : "",
          actual_qty: item.total_qty ? item.total_qty : "",
          program: item.program ? item.program.program_name : "",
          village: item.vehicle_no ? item.vehicle_no : "",
        });

        let currentWorksheet = workbook.getWorksheet(`Spinner Pending Bales ${worksheetIndex}`);
        if (!currentWorksheet) {
          currentWorksheet = workbook.addWorksheet(`Spinner Pending Bales ${worksheetIndex}`);
          if (worksheetIndex == 1) {
            currentWorksheet.mergeCells("A1:M1");
            const mergedCell = currentWorksheet.getCell("A1");
            mergedCell.value = "CottonConnect | Spinner Pending Bales Receipt Report";
            mergedCell.font = { bold: true };
            mergedCell.alignment = { horizontal: "center", vertical: "middle" };
          }

          const headerRow = currentWorksheet.addRow([
            "Sr No.",
            "Date",
            "Season",
            "Spinner Name",
            "Ginner Name",
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
          result ? formatDecimal(result?.dataValues?.total_farmers) : 0,
          result ? formatDecimal(convert_kg_to_mt(result?.dataValues?.total_estimated_cotton ?? 0)) : 0,
          trans ? formatDecimal(convert_kg_to_mt(trans?.dataValues?.total_cotton_procured ?? 0)) : 0,
          lintProcured ? lintProcured?.dataValues?.bales_processed : 0,
          lintProcured ? formatDecimal(convert_kg_to_mt(lintProcured?.dataValues?.lint_processed ?? 0)) : 0,
          lintSold ? formatDecimal(convert_kg_to_mt(lintSold?.dataValues?.lint_sold ?? 0)) : 0,
          yarnProcessed ? formatDecimal(convert_kg_to_mt(yarnProcessed?.dataValues?.yarn_processed ?? 0)) : 0,
          yarnSold ? formatDecimal(convert_kg_to_mt(yarnSold?.dataValues?.yarn_sold ?? 0)) : 0,
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
