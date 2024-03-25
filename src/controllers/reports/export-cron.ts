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
    order: [["spinner_id", "desc"]],
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
    for await (let item of salesData) {
        let stockData = {
          spinner_id: spinner?.dataValues?.spinner_id,
          spinner_name: spinner?.dataValues?.spinner_name,
          season_id: spinner?.dataValues?.season_id,
          season_name: spinner?.dataValues?.season_name,
          batch_lot_no: spinner?.dataValues?.batch_lot_no,
          reel_lot_no: item?.dataValues?.reel_lot_no,
          invoice_no: item?.dataValues?.invoice_no,
          cotton_procured: procuredCotton
            ? procuredCotton?.dataValues?.cotton_procured
            : 0,
          cotton_consumed: spinner ? spinner?.dataValues?.cotton_consumed : 0,
          cotton_stock:
            Number(procuredCotton?.dataValues?.cotton_procured) >
            Number(spinner?.dataValues?.cotton_consumed)
              ? Number(procuredCotton?.dataValues?.cotton_procured) -
                Number(spinner?.dataValues?.cotton_consumed)
              : 0,
        };
        ndata.push(stockData);
      }
    }

  for await (const [index, item] of ndata.entries()) {
    const rowValues = Object.values({
      index: index + 1,
      spinner: item.spinner_name ? item.spinner_name : "",
      season: item.season_name ? item.season_name : "",
      batch_lot_no: item.batch_lot_no ? item.batch_lot_no : "",
      reel_lot_no: item.reel_lot_no ? item.reel_lot_no : "",
      invoice_no: item.invoice_no ? item.invoice_no : "",
      cotton_procured: item.cotton_procured ? item.cotton_procured : 0,
      cotton_consumed: item.cotton_consumed ? item.cotton_consumed : 0,
      cotton_stock: item.cotton_stock ? item.cotton_stock : 0,
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

export { generateSpinnerLintCottonStock };
