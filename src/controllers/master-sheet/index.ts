import { Op, Sequelize, where } from "sequelize";
import { Request, Response, raw } from "express";
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
import GinHeap from "../../models/gin-heap.model";
import GinToGinSale from "../../models/gin-to-gin-sale.model";
import District from "../../models/district.model";
import SpinSaleYarnSelected from "../../models/spin-sale-yarn-selected.model";
import SpinYarn from "../../models/spin-yarn.model";
import GinnerAllocatedVillage from "../../models/ginner-allocated-vilage.model";
import CombernoilGeneration from "../../models/combernoil_generation.model";
import SpinCombernoilSale from "../../models/spin_combernoil_sale.model";

function convert_kg_to_mt(number: any) {
  return (number / 1000).toFixed(2);
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

const exportLoad = async (req: Request, res: Response) => {
  const data = await ExportData.findAll(
    // {
    // order: [['createdAt', 'DESC']] // Assuming createdAt is the timestamp of insertion
    //   }
  )
  let loadData = data[0]

  //   loadData.dataValues.failes_procurement_load||

  if ((loadData.dataValues.consolidated_ginner_spinner_load && req?.body?.file_name === "consolidated-ginner-spinner-report.xlsx") || (loadData.dataValues.spinner_details_load && req?.body?.file_name === "master-sheet-spinner-details.xlsx")) {
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

const fetchConsolidatedDetailsGinnerSpinnerPagination = async (req: Request, res: Response) => {
  
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const { seasonId, programId, brandId, countryId, stateId }: any = req.query;
  const whereCondition: any = {};
  const lintCondition: any = {};
  const baleCondition: any = {};
  const ginSalesCondition: any = {};
  const spinSalesCondition: any = {};
  const spinProcessCondition: any = {};
 
  try {

    // Filters
    if (searchTerm) {
      whereCondition[Op.or] = [
        { '$state.state_name$': { [Op.iLike]: `%${searchTerm}%` } }
      ];
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

    if (stateId) {
      const idArray: number[] = stateId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.state_id = { [Op.in]: idArray };
    }
    whereCondition.status = true;
    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      lintCondition["$spinprocess.program_id$"] = { [Op.in]: idArray };
      baleCondition["$sales.program_id$"] = { [Op.in]: idArray };
      ginSalesCondition.program_id = { [Op.in]: idArray };
      spinSalesCondition.program_id = { [Op.in]: idArray };
      spinProcessCondition.program_id = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray = seasonId.split(",").map((id: string) => parseInt(id));
      baleCondition["$sales.season_id$"] = { [Op.in]: idArray };
    }

    const spinners = await Spinner.findAll({
      where: whereCondition,
      attributes: [
        [Sequelize.col("state.id"), "state_id"],
        [Sequelize.col("state.state_name"), "state_name"],
        [Sequelize.fn("ARRAY_AGG", Sequelize.col("spinners.id")), "spinner_ids"],
      ],
      offset: offset,
      limit: limit,
      include: [
        {
          model: State,
          as: "state",
          attributes: [],
        },
      ],
      group: ["state.id", "state.state_name"],
      order: [["state_name", "ASC"]],
      raw: true,
      subQuery: false,
    });

    const countResult = await Spinner.findAll({
      where: whereCondition,
      include: [
        {
          model: State,
          as: "state",
          attributes: [],
        },
      ],
      attributes: [[Sequelize.fn("COUNT", Sequelize.fn("DISTINCT", Sequelize.col("state.id"))), "total"]],
      raw: true,
    });

    const count = parseInt(countResult[0]?.total || "0");

    const result = [];

    for (const group of spinners) {
      const state = {
        id: group.state_id,
        state_name: group.state_name,
      };

      const spinnerIds = group.spinner_ids;
      
      let wheree: any = {};if (seasonId) {
          const idArray: number[] = seasonId
            .split(",")
            .map((id: any) => parseInt(id, 10));
          wheree.season_id = { [Op.in]: idArray };
          lintCondition["$ginsales.season_id$"] = { [Op.in]: idArray };
          baleCondition["$sales.season_id$"] = { [Op.in]: idArray };
        }

      const lintCottonProcuredRows = await BaleSelection.findAll({
        attributes: [
          [
            Sequelize.fn(
              "COALESCE",
              Sequelize.fn(
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
          ],
        ],
        include: [
          {
            model: GinBale,
            as: "bale",
            attributes: [],
          },
          {
            model: GinSales,
            as: "sales",
            attributes: [],
          },
        ],
        where: {          
          ...baleCondition,
          "$sales.buyer$": { [Op.in]: spinnerIds },
          "$sales.status$": { [Op.in]: ['Sold', 'Partially Accepted', 'Partially Rejected'] },
          [Op.or]: [
            { spinner_status: true },
            { "$sales.status$": 'Sold' }
          ]
        },
        raw: true,
      });

      const lintCottonProcuredPendingRows = await BaleSelection.findAll({
            attributes: [
              [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.literal(
                'CAST("bale"."weight" AS DOUBLE PRECISION)'
              )), 0), 'lint_cotton_procured_pending']
            ],
            where: {
              ...baleCondition,
              "$sales.buyer$":  { [Op.in]: spinnerIds },
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
            //group: ["sales.buyer"],
            raw: true,
          });

      const lintCottonRejectedRows = await BaleSelection.findAll({
            attributes: [
              [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.literal(
                'CAST("bale"."weight" AS DOUBLE PRECISION)'
              )), 0), 'lint_cotton_rejected']
            ],
            where: {
              ...baleCondition,
              "$sales.buyer$": { [Op.in]: spinnerIds },
              "$sales.status$": { [Op.in]: ['Rejected', 'Partially Rejected'] },
              //spinner_status: null,
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
            //group: ["sales.buyer"],
            raw: true,
          });

      
      const lintCottonConsumedRows = await LintSelections.findAll({
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
              ...lintCondition,
              "$spinprocess.spinner_id$": { [Op.in]: spinnerIds },
            },
            //group: ["spinprocess.spinner_id"],
            raw: true,
          });

      const lintGreyoutRows = await GinSales.findAll({
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
              ...ginSalesCondition,
              buyer: { [Op.in]: spinnerIds },
              status: { [Op.in]: ['Sold', 'Partially Accepted', 'Partially Rejected'] },
              [Op.or]: [
                { greyout_status: true },
                { greyout_status: false, greyed_out_qty: { [Op.gt]: 0 }, },
              ],
            },
            raw: true,
          });    
      const lintCottonStockRows = await GinSales.findAll({
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
              ...ginSalesCondition,
              buyer: { [Op.in]: spinnerIds },
              status: { [Op.in]: ['Sold', 'Partially Accepted', 'Partially Rejected'] }
            },
            raw: true,
          });

      const yarnProcessRows = await SpinProcess.findAll({
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
              spinner_id: { [Op.in]: spinnerIds },
            },
            raw: true,
          });

      const yarnGreyOutRows = await SpinProcess.findAll({
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
              ...spinProcessCondition,
              spinner_id: { [Op.in]: spinnerIds },
              greyout_status: true,
            },
            raw: true,
          });

      const yarnSoldRows = await SpinSales.findAll({
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
              spinner_id: { [Op.in]: spinnerIds },
            },
            raw: true,
        });

      const totallintcottonprocuredAcceptedKG = parseFloat(lintCottonProcuredRows[0]?.lint_cotton_procured || "0");
      const totallintcottonprocuredAcceptedMT = convert_kg_to_mt(totallintcottonprocuredAcceptedKG);

      const totallintcottonprocuredPendingKG = parseFloat(lintCottonProcuredPendingRows[0]?.lint_cotton_procured_pending || "0");
      const totallintcottonprocuredPendingMT = convert_kg_to_mt(totallintcottonprocuredPendingKG);

      const totallintcottonprocuredAcceptedPendingMT = Number(totallintcottonprocuredAcceptedMT || 0) + Number(totallintcottonprocuredPendingMT || 0);

      const lintCottonRejectedKG = parseFloat(lintCottonRejectedRows[0]?.lint_cotton_rejected || "0");
      const lintCottonRejectedMT = convert_kg_to_mt(lintCottonRejectedKG);

      const lintCottonConsumedKG = parseFloat(lintCottonConsumedRows[0]?.lint_cotton_consumed || "0");
      const lintCottonConsumedMT = convert_kg_to_mt(lintCottonConsumedKG);

      const lintGreyoutKG = parseFloat(lintGreyoutRows[0]?.lint_greyout || "0");
      const lintGreyoutMT = convert_kg_to_mt(lintGreyoutKG);

      const lintCottonStockKG = parseFloat(lintCottonStockRows[0]?.lint_cotton_stock || "0");
      const lintCottonStockMT = convert_kg_to_mt(lintCottonStockKG);

      const lintActualStockKG = Number(lintCottonStockKG) > Number(lintGreyoutKG)
          ? Number(lintCottonStockKG) - (Number(lintGreyoutKG))
          : 0;
      const lintActualStockMT = convert_kg_to_mt(lintActualStockKG);

      const yarnProcuredKG = parseFloat(yarnProcessRows[0]?.yarn_procured || "0");
      const yarnProcuredMT = convert_kg_to_mt(yarnProcuredKG);

      const yarnStockKG = parseFloat(yarnProcessRows[0]?.yarn_stock || "0");
      const yarnStockMT = convert_kg_to_mt(yarnStockKG);

      const yarnGreyOutKG = parseFloat(yarnGreyOutRows[0]?.yarn_greyout || "0");
      const yarnGreyOutMT = convert_kg_to_mt(yarnGreyOutKG);

      const yarnSoldKG = parseFloat(yarnSoldRows[0]?.yarn_sold || "0");
      const yarnSoldMT = convert_kg_to_mt(yarnSoldKG);

      result.push({
        state,
        totallintcottonprocuredAcceptedPendingMT: totallintcottonprocuredAcceptedPendingMT,
        lintCottonConsumedMT: lintCottonConsumedMT,
        lintCottonRejectedMT: lintCottonRejectedMT,
        lintGreyoutMT: lintGreyoutMT,
        lintCottonStockMT: lintCottonStockMT,
        lintActualStockMT: lintActualStockMT,
        yarnProcuredMT: yarnProcuredMT,
        yarnStockMT: yarnStockMT,
        yarnGreyoutMT: yarnGreyOutMT,
        yarnSoldMT: yarnSoldMT,
      });
    }   

    return res.sendPaginationSuccess(res, result, count);

  } catch (error: any) {
    return res.sendError(res, error.message, error);
  }
};


const exportConsolidatedDetailsGinnerSpinner = async (req: Request, res: Response) => { 
  
  await ExportData.update({
    consolidated_ginner_spinner_load: true
  }, { where: { consolidated_ginner_spinner_load: false } })
  res.send({ status: 200, message: "export file processing" })
  const excelFilePath = path.join(
    "./upload",
    "consolidated-ginner-spinner-report.xlsx"
  );
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const { seasonId, programId, brandId, countryId, stateId }: any = req.query;
  const whereCondition: any = {};
  const lintCondition: any = {};
  const baleCondition: any = {};
  const ginSalesCondition: any = {};
  const spinSalesCondition: any = {};
  const spinProcessCondition: any = {};

  try {

    // Filters
    if (searchTerm) {
      whereCondition[Op.or] = [
        { '$state.state_name$': { [Op.iLike]: `%${searchTerm}%` } }
      ];
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

    if (stateId) {
      const idArray: number[] = stateId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.state_id = { [Op.in]: idArray };
    }
    whereCondition.status = true;
    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      lintCondition["$spinprocess.program_id$"] = { [Op.in]: idArray };
      baleCondition["$sales.program_id$"] = { [Op.in]: idArray };
      ginSalesCondition.program_id = { [Op.in]: idArray };
      spinSalesCondition.program_id = { [Op.in]: idArray };
      spinProcessCondition.program_id = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray = seasonId.split(",").map((id: string) => parseInt(id));
      baleCondition["$sales.season_id$"] = { [Op.in]: idArray };
    }
    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    /*worksheet.mergeCells("A1:Q1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Consolidated Details Ginner Spinner Report";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };*/
    // Set bold font for header row
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "S No.",
      "State",
      "Total lint cotton procured Accepted + Pending (MT)",
      "Total lint cotton processed (MT)",
      "Total yarn produced (MT)",
      "Total yarn sold (MT)",
      "Total lint cotton stock (MT)",
      "Total yarn stock  (MT)",
      "Total lint cotton quantity rejected by spinner (MT)",
      "Total lint cotton greyed out (MT)",
      "Total yarn greyed out (MT)",
    ]);
    headerRow.font = { bold: true };

    // Define a border style
    const borderStyle = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };

    const spinners = await Spinner.findAll({
      where: whereCondition,
      attributes: [
        [Sequelize.col("state.id"), "state_id"],
        [Sequelize.col("state.state_name"), "state_name"],
        [Sequelize.fn("ARRAY_AGG", Sequelize.col("spinners.id")), "spinner_ids"],
      ],
      offset: offset,
      limit: limit,
      include: [
        {
          model: State,
          as: "state",
          attributes: [],
        },
      ],
      group: ["state.id", "state.state_name"],
      order: [["state_name", "ASC"]],
      raw: true,
      subQuery: false,
    });

    const rows = [];

    for (const group of spinners) {
      const stateName = group.state_name;
      const spinnerIds = group.spinner_ids;

      let wheree: any = {};
      if (seasonId) {
        const idArray: number[] = seasonId
            .split(",")
            .map((id: any) => parseInt(id, 10));
          wheree.season_id = { [Op.in]: idArray };
          lintCondition["$ginsales.season_id$"] = { [Op.in]: idArray };
          baleCondition["$sales.season_id$"] = { [Op.in]: idArray };
        }

      const lintCottonProcuredRows = await BaleSelection.findAll({
        attributes: [
          [
            Sequelize.fn(
              "COALESCE",
              Sequelize.fn(
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
          ],
        ],
        include: [
          {
            model: GinBale,
            as: "bale",
            attributes: [],
          },
          {
            model: GinSales,
            as: "sales",
            attributes: [],
          },
        ],
        where: {
          ...baleCondition,
          "$sales.buyer$": { [Op.in]: spinnerIds },
          "$sales.status$": { [Op.in]: ['Sold', 'Partially Accepted', 'Partially Rejected'] },
          [Op.or]: [
            { spinner_status: true },
            { "$sales.status$": 'Sold' }
          ]
        },
        raw: true,
      });

      const lintCottonProcuredPendingRows = await BaleSelection.findAll({
            attributes: [
              [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.literal(
                'CAST("bale"."weight" AS DOUBLE PRECISION)'
              )), 0), 'lint_cotton_procured_pending']
            ],
            where: {
              ...baleCondition,
              "$sales.buyer$":  { [Op.in]: spinnerIds },
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
            //group: ["sales.buyer"],
            raw: true,
          });

      const lintCottonRejectedRows = await BaleSelection.findAll({
            attributes: [
              [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.literal(
                'CAST("bale"."weight" AS DOUBLE PRECISION)'
              )), 0), 'lint_cotton_rejected']
            ],
            where: {
              ...baleCondition,
              "$sales.buyer$": { [Op.in]: spinnerIds },
              "$sales.status$": { [Op.in]: ['Rejected', 'Partially Rejected'] },
              //spinner_status: null,
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
            //group: ["sales.buyer"],
            raw: true,
          });

      
      const lintCottonConsumedRows = await LintSelections.findAll({
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
              ...lintCondition,
              "$spinprocess.spinner_id$": { [Op.in]: spinnerIds },
            },
            //group: ["spinprocess.spinner_id"],
            raw: true,
          });

      const lintGreyoutRows = await GinSales.findAll({
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
              ...ginSalesCondition,
              buyer: { [Op.in]: spinnerIds },
              status: { [Op.in]: ['Sold', 'Partially Accepted', 'Partially Rejected'] },
              [Op.or]: [
                { greyout_status: true },
                { greyout_status: false, greyed_out_qty: { [Op.gt]: 0 }, },
              ],
            },
            raw: true,
          });    
      const lintCottonStockRows = await GinSales.findAll({
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
              ...ginSalesCondition,
              buyer: { [Op.in]: spinnerIds },
              status: { [Op.in]: ['Sold', 'Partially Accepted', 'Partially Rejected'] }
            },
            raw: true,
          });

      const yarnProcessRows = await SpinProcess.findAll({
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
              spinner_id: { [Op.in]: spinnerIds },
            },
            raw: true,
          });

      const yarnGreyOutRows = await SpinProcess.findAll({
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
              ...spinProcessCondition,
              spinner_id: { [Op.in]: spinnerIds },
              greyout_status: true,
            },
            raw: true,
          });

      const yarnSoldRows = await SpinSales.findAll({
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
              spinner_id: { [Op.in]: spinnerIds },
            },
            raw: true,
        });

      const totallintcottonprocuredAcceptedKG = parseFloat(lintCottonProcuredRows[0]?.lint_cotton_procured || "0");
      const totallintcottonprocuredAcceptedMT = convert_kg_to_mt(totallintcottonprocuredAcceptedKG);

      const totallintcottonprocuredPendingKG = parseFloat(lintCottonProcuredPendingRows[0]?.lint_cotton_procured_pending || "0");
      const totallintcottonprocuredPendingMT = convert_kg_to_mt(totallintcottonprocuredPendingKG);

      const totallintcottonprocuredAcceptedPendingMT = Number(totallintcottonprocuredAcceptedMT) + Number(totallintcottonprocuredPendingMT);

      const lintCottonRejectedKG = parseFloat(lintCottonRejectedRows[0]?.lint_cotton_rejected || "0");
      const lintCottonRejectedMT = convert_kg_to_mt(Number(lintCottonRejectedKG));

      const lintCottonConsumedKG = parseFloat(lintCottonConsumedRows[0]?.lint_cotton_consumed || "0");
      const lintCottonConsumedMT = convert_kg_to_mt(lintCottonConsumedKG);

      const lintGreyoutKG = parseFloat(lintGreyoutRows[0]?.lint_greyout || "0");
      const lintGreyoutMT = convert_kg_to_mt(Number(lintGreyoutKG));

      const lintCottonStockKG = parseFloat(lintCottonStockRows[0]?.lint_cotton_stock || "0");
      const lintCottonStockMT = convert_kg_to_mt(Number(lintCottonStockKG));

      const lintActualStockKG = Number(lintCottonStockKG) > Number(lintGreyoutKG)
          ? Number(lintCottonStockKG) - (Number(lintGreyoutKG))
          : 0;
      const lintActualStockMT = convert_kg_to_mt(Number(lintActualStockKG));

      const yarnProcuredKG = parseFloat(yarnProcessRows[0]?.yarn_procured || "0");
      const yarnProcuredMT = convert_kg_to_mt(Number(yarnProcuredKG));

      const yarnStockKG = parseFloat(yarnProcessRows[0]?.yarn_stock || "0");
      const yarnStockMT = convert_kg_to_mt(Number(yarnStockKG));

      const yarnGreyOutKG = parseFloat(yarnGreyOutRows[0]?.yarn_greyout || "0");
      const yarnGreyOutMT = convert_kg_to_mt(Number(yarnGreyOutKG));

      const yarnSoldKG = parseFloat(yarnSoldRows[0]?.yarn_sold || "0");
      const yarnSoldMT = convert_kg_to_mt(Number(yarnSoldKG));

      rows.push({
        State: stateName,
        totallintcottonprocuredAcceptedPendingMT: totallintcottonprocuredAcceptedPendingMT,
        lintCottonConsumedMT: lintCottonConsumedMT,
        yarnProcuredMT: yarnProcuredMT,
        yarnSoldMT: yarnSoldMT,
        lintActualStockMT: lintActualStockMT,
        yarnStockMT: yarnStockMT,
        lintCottonRejectedMT: lintCottonRejectedMT,
        lintGreyoutMT: lintGreyoutMT,
        yarnGreyOutMT: yarnGreyOutMT
      });
    }
    let totals = {
      totallintcottonprocuredAcceptedPendingMT: 0,
      lintCottonConsumedMT: 0,
      yarnProcuredMT: 0,
      yarnSoldMT: 0,
      lintActualStockMT: 0,
      yarnStockMT: 0,
      lintCottonRejectedMT: 0,
      lintGreyoutMT: 0,
      yarnGreyOutMT: 0,
    };
    
    for await (const [index, item] of rows.entries()) {
      let rowValues;
      rowValues = {
            index: index + 1,
            state: item.State,
            totallintcottonprocuredAcceptedPendingMT: item.totallintcottonprocuredAcceptedPendingMT,
            lintCottonConsumedMT: Number(item.lintCottonConsumedMT),
            yarnProcuredMT: Number(item.yarnProcuredMT),
            yarnSoldMT: Number(item.yarnSoldMT),
            lintActualStockMT: Number(item.lintActualStockMT),
            yarnStockMT: Number(item.yarnStockMT),
            lintCottonRejectedMT: Number(item.lintCottonRejectedMT),
            lintGreyoutMT: Number(item.lintGreyoutMT),
            yarnGreyOutMT: Number(item.yarnGreyOutMT),
      };
      totals.totallintcottonprocuredAcceptedPendingMT += Number(rowValues.totallintcottonprocuredAcceptedPendingMT);
      totals.lintCottonConsumedMT += Number(rowValues.lintCottonConsumedMT);
      totals.yarnProcuredMT += Number(rowValues.yarnProcuredMT);
      totals.yarnSoldMT += Number(rowValues.yarnSoldMT);
      totals.lintActualStockMT += Number(rowValues.lintActualStockMT);
      totals.yarnStockMT += Number(rowValues.yarnStockMT);
      totals.lintCottonRejectedMT += Number(rowValues.lintCottonRejectedMT);
      totals.lintGreyoutMT += Number(rowValues.lintGreyoutMT);
      totals.yarnGreyOutMT += Number(rowValues.yarnGreyOutMT);
     worksheet.addRow(Object.values(rowValues));
    }
    
    const rowValues = {
      index: "",
      state: "Total",
      totallintcottonprocuredAcceptedPendingMT: totals.totallintcottonprocuredAcceptedPendingMT,
      lintCottonConsumedMT: totals.lintCottonConsumedMT,
      yarnProcuredMT: totals.yarnProcuredMT,
      yarnSoldMT: totals.yarnSoldMT,
      lintActualStockMT: totals.lintActualStockMT,
      yarnStockMT: totals.yarnStockMT,
      lintCottonRejectedMT: totals.lintCottonRejectedMT,
      lintGreyoutMT: totals.lintGreyoutMT,
      yarnGreyOutMT: totals.yarnGreyOutMT
    };

    worksheet.addRow(Object.values(rowValues)).eachCell(cell => cell.font = { bold: true });

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
    
    await ExportData.update({
      consolidated_ginner_spinner_load: false
    }, { where: { consolidated_ginner_spinner_load: true } })
  } catch (error: any) {
    (async () => {
      await ExportData.update({
        consolidated_ginner_spinner_load: false
      }, { where: { consolidated_ginner_spinner_load: true } })
    })()
    console.log(error);
    return res.sendError(res, error.message, error);
  }

};
const fetchSpinnerDetailsPagination = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const { spinnerId, seasonId, programId, brandId, countryId, stateId }: any = req.query;
  const whereCondition: any = {};
  const lintCondition: any = {};
  const baleCondition: any = {};
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

    if (stateId) {
      const idArray: number[] = stateId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.state_id = { [Op.in]: idArray };
    }
    whereCondition.status = true;
    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      lintCondition["$spinprocess.program_id$"] = { [Op.in]: idArray };
      baleCondition["$sales.program_id$"] = { [Op.in]: idArray };
      ginSalesCondition.program_id = { [Op.in]: idArray };
      spinSalesCondition.program_id = { [Op.in]: idArray };
      spinProcessCondition.program_id = { [Op.in]: idArray };
    }

    let { count, rows } = await Spinner.findAndCountAll({
      where: whereCondition,
      attributes: ["id", "name", "address", "country_id", "state_id"],
      offset: offset,
      limit: limit,
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
      order: [[Sequelize.literal('TRIM("name")'), "ASC"]],
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
        lintCondition["$ginsales.season_id$"] = { [Op.in]: idArray };
        baleCondition["$sales.season_id$"] = { [Op.in]: idArray };
      }

      let [
        lint_cotton_procured,
        lint_cotton_procured_pending,
        lint_cotton_rejected,
        moisture_loss_shortage_qty,
        moisture_weight_gain,
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
            ...baleCondition,
            "$sales.buyer$": spinner.id,
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
            ...baleCondition,
            "$sales.buyer$": spinner.id,
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
        BaleSelection.findOne({
          attributes: [
            [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.literal(
              'CAST("bale"."weight" AS DOUBLE PRECISION)'
            )), 0), 'lint_cotton_rejected']
          ],
          where: {
            ...baleCondition,
            "$sales.buyer$": spinner.id,
            "$sales.status$": { [Op.in]: ['Rejected', 'Partially Rejected'] },
            //spinner_status: null,
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
          group: ["sales.buyer"]
        }),
        BaleSelection.findOne({
          attributes: [
            [
            Sequelize.fn('COALESCE',
              Sequelize.fn('SUM', Sequelize.literal(`
                CASE 
                  WHEN "bale"."accepted_weight" < CAST("bale"."weight" AS DOUBLE PRECISION) 
                  THEN CAST("bale"."weight" AS DOUBLE PRECISION) - "bale"."accepted_weight"
                  ELSE 0 
                END
              `)),
              0
            ),
            'moisture_loss_shortage_qty'
          ]
          ],
          where: {
            ...baleCondition,
            "$sales.buyer$": spinner.id,
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
            [
            Sequelize.fn('COALESCE',
              Sequelize.fn('SUM', Sequelize.literal(`
                CASE 
                  WHEN "bale"."accepted_weight" > CAST("bale"."weight" AS DOUBLE PRECISION) 
                  THEN "bale"."accepted_weight" - CAST("bale"."weight" AS DOUBLE PRECISION)
                  ELSE 0 
                END
              `)),
              0
            ),
            'moisture_weight_gain'
          ]
          ],
          where: {
            ...baleCondition,
            "$sales.buyer$": spinner.id,
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
            ...lintCondition,
            "$spinprocess.spinner_id$": spinner.id,
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
            ...ginSalesCondition,
            buyer: spinner.id,
            status: { [Op.in]: ['Sold', 'Partially Accepted', 'Partially Rejected'] },
            [Op.or]: [
              { greyout_status: true },
              { greyout_status: false, greyed_out_qty: { [Op.gt]: 0 }, },
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
            ...ginSalesCondition,
            buyer: spinner.id,
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
            ...spinProcessCondition,
            spinner_id: spinner.id,
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
            ...spinProcessCondition,
            spinner_id: spinner.id,
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
      obj.lintCottonRejectedKG = lint_cotton_rejected
        ? lint_cotton_rejected?.dataValues
          .lint_cotton_rejected ?? 0
        : 0;
      obj.moistureLosseKG = moisture_loss_shortage_qty
        ? moisture_loss_shortage_qty?.dataValues
          .moisture_loss_shortage_qty ?? 0
        : 0;
      obj.lintConsumedKG = lint_consumed
        ? lint_consumed?.dataValues.lint_cotton_consumed ?? 0
        : 0;

      obj.lintStockKG = lint_cotton_stock
        ? lint_cotton_stock?.dataValues.lint_cotton_stock ?? 0
        : 0;

      obj.lintGreyoutKg = lint_greyout?.dataValues.lint_greyout ?? 0;

      obj.lintActualStockKg = Number(obj.lintStockKG) > Number(obj.lintGreyoutKg)
        ? Number(obj.lintStockKG) - (Number(obj.lintGreyoutKg))
        : 0;


      obj.yarnProcuredKG = yarnProcured
        ? yarnProcured?.dataValues.yarn_procured ?? 0
        : 0;
      obj.yarnSoldKG = yarnSold ? yarnSold.dataValues.yarn_sold ?? 0 : 0;
      obj.yarnStockKG = yarnProcured
        ? yarnProcured?.dataValues.yarn_stock ?? 0
        : 0;

      obj.yarnGreyoutKg = yarnGreyout?.dataValues.yarn_greyout ?? 0;

      obj.yarnActualStockKg = Number(obj.yarnStockKG) > Number(obj.yarnGreyoutKg)
        ? Number(obj.yarnStockKG) - (Number(obj.yarnGreyoutKg))
        : 0;
      obj.lintCottonProcuredMT = convert_kg_to_mt(obj.lintCottonProcuredKG);
      obj.lintCottonProcuredPendingMT = convert_kg_to_mt(
        obj.lintCottonProcuredPendingKG
      );
      obj.lintCottonProcuredAcceptedandPendingMT = Number(obj.lintCottonProcuredMT || 0) + Number(obj.lintCottonProcuredPendingMT || 0);
      obj.lintCottonRejectedMT = convert_kg_to_mt(obj.lintCottonRejectedKG);
      obj.moistureLosseMT = convert_kg_to_mt(obj.moistureLosseKG);
      obj.lintConsumedMT = convert_kg_to_mt(obj.lintConsumedKG);
      obj.lintStockMT = convert_kg_to_mt(obj.lintStockKG);
      obj.lintGreyoutMT = convert_kg_to_mt(obj.lintGreyoutKg);
      obj.lintActualStockMT = convert_kg_to_mt(obj.lintActualStockKg);
      obj.yarnSoldMT = convert_kg_to_mt(obj.yarnSoldKG);
      obj.yarnProcuredMT = convert_kg_to_mt(obj.yarnProcuredKG);
      obj.yarnStockMT = convert_kg_to_mt(obj.yarnStockKG);
      obj.yarnGreyoutMT = convert_kg_to_mt(obj.yarnGreyoutKg);
      obj.yarnActualStockMT = convert_kg_to_mt(obj.yarnActualStockKg);
      result.push({ ...obj, spinner });
    }
    //fetch data with pagination

    return res.sendPaginationSuccess(res, result, count);
  } catch (error: any) {
    return res.sendError(res, error.message, error);
  }
};
const exportSpinnerDetails = async (req: Request, res: Response) => {
  
  await ExportData.update({
    spinner_details_load: true
  }, { where: { spinner_details_load: false } })
  res.send({ status: 200, message: "export file processing" })
  const excelFilePath = path.join(
    "./upload",
    "master-sheet-spinner-details.xlsx"
  );
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const { spinnerId, seasonId, programId, brandId, countryId, stateId }: any = req.query;
  const whereCondition: any = {};
  const lintCondition: any = {};
  const baleCondition: any = {};
  const ginSalesCondition: any = {};
  const spinSalesCondition: any = {};
  const spinProcessCondition: any = {};

  try {

    // Filters
    if (searchTerm) {
      whereCondition[Op.or] = [
        { '$state.state_name$': { [Op.iLike]: `%${searchTerm}%` } }
      ];
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

    if (stateId) {
      const idArray: number[] = stateId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.state_id = { [Op.in]: idArray };
    }
    whereCondition.status = true;
    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      lintCondition["$spinprocess.program_id$"] = { [Op.in]: idArray };
      baleCondition["$sales.program_id$"] = { [Op.in]: idArray };
      ginSalesCondition.program_id = { [Op.in]: idArray };
      spinSalesCondition.program_id = { [Op.in]: idArray };
      spinProcessCondition.program_id = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray = seasonId.split(",").map((id: string) => parseInt(id));
      baleCondition["$sales.season_id$"] = { [Op.in]: idArray };
    }
    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    /*worksheet.mergeCells("A1:Q1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Consolidated Details Ginner Spinner Report";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };*/
    // Set bold font for header row
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "S No.",
      "Spinner Name",
      "State",
      "Total lint cotton procured Accepted (MT)",
      "Total lint cotton procured Pending (MT)",
      "Total lint cotton procured Accepted + Pending (MT)",
      "Total lint cotton processed (MT)",
      "Total yarn produced (MT)",
      "Total yarn sold (MT)",
      "Total lint cotton stock (MT)",
      "Total yarn stock qty (MT)",
      "Total lint cotton quantity rejected by spinner (MT)",
      "Mositure loss/weight shortage quantity of lint cotton during the acceptance of TB (Spinner Bale Receipt) (MT)",
      "Total lint cotton greyed out (MT)",
      "Total yarn greyed out (MT)",
    ]);
    headerRow.font = { bold: true };

    // Define a border style
    const borderStyle = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };

    let totals = {
      lint_cotton_procured: 0,
      lint_cotton_procured_pending: 0,
      lint_cotton_procured_accepted_Pending: 0,
      lint_consumed: 0,
      yarn_procured: 0,
      yarn_sold: 0,
      lint_actual_Stock: 0,
      yarn_actual_stock: 0,
      lint_cotton_rejected: 0,
      moisture_loss: 0,
      lintGreyoutMT: 0,
      yarnGreyoutMT: 0,
    };

    let { count, rows } = await Spinner.findAndCountAll({
      where: whereCondition,
      attributes: ["id", "name", "address", "country_id", "state_id"],
      offset: offset,
      limit: limit,
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
      order: [[Sequelize.literal('TRIM("name")'), "ASC"]],
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
          lintCondition["$ginsales.season_id$"] = { [Op.in]: idArray };
          baleCondition["$sales.season_id$"] = { [Op.in]: idArray };
        }

      let [
        lint_cotton_procured,
        lint_cotton_procured_pending,
        lint_cotton_rejected,
        moisture_loss_shortage_qty,
        moisture_weight_gain,
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
            ...baleCondition,
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
            ...baleCondition,
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
        BaleSelection.findOne({
          attributes: [
            [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.literal(
              'CAST("bale"."weight" AS DOUBLE PRECISION)'
            )), 0), 'lint_cotton_rejected']
          ],
          where: {
            ...baleCondition,
            "$sales.buyer$": item.id,
            "$sales.status$": { [Op.in]: ['Rejected', 'Partially Rejected'] },
            //spinner_status: null,
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
            [
            Sequelize.fn('COALESCE',
              Sequelize.fn('SUM', Sequelize.literal(`
                CASE 
                  WHEN "bale"."accepted_weight" < CAST("bale"."weight" AS DOUBLE PRECISION) 
                  THEN CAST("bale"."weight" AS DOUBLE PRECISION) - "bale"."accepted_weight"
                  ELSE 0 
                END
              `)),
              0
            ),
            'moisture_loss_shortage_qty'
          ]
          ],
          where: {
            ...baleCondition,
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
            [
            Sequelize.fn('COALESCE',
              Sequelize.fn('SUM', Sequelize.literal(`
                CASE 
                  WHEN "bale"."accepted_weight" > CAST("bale"."weight" AS DOUBLE PRECISION) 
                  THEN "bale"."accepted_weight" - CAST("bale"."weight" AS DOUBLE PRECISION)
                  ELSE 0 
                END
              `)),
              0
            ),
            'moisture_weight_gain'
          ]
          ],
          where: {
            ...baleCondition,
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
            ...lintCondition,
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
            ...ginSalesCondition,
            buyer: item.id,
            status: { [Op.in]: ['Sold', 'Partially Accepted', 'Partially Rejected'] },
            [Op.or]: [
              { greyout_status: true },
              { greyout_status: false, greyed_out_qty: { [Op.gt]: 0 }, },
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
            ...ginSalesCondition,
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
            ...spinProcessCondition,
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
            ...spinProcessCondition,
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
      obj.lintCottonRejectedKG = lint_cotton_rejected
        ? lint_cotton_rejected?.dataValues
          .lint_cotton_rejected ?? 0
        : 0;
      obj.moistureLosseKG = moisture_loss_shortage_qty
        ? moisture_loss_shortage_qty?.dataValues
          .moisture_loss_shortage_qty ?? 0
        : 0;
      obj.lintConsumedKG = lint_consumed
        ? lint_consumed?.dataValues.lint_cotton_consumed ?? 0
        : 0;

      obj.lintStockKG = lint_cotton_stock
        ? lint_cotton_stock?.dataValues.lint_cotton_stock ?? 0
        : 0;

      obj.lintGreyoutKg = lint_greyout?.dataValues.lint_greyout ?? 0;

      obj.lintActualStockKg = Number(obj.lintStockKG) > Number(obj.lintGreyoutKg)
        ? Number(obj.lintStockKG) - (Number(obj.lintGreyoutKg))
        : 0;


      obj.yarnProcuredKG = yarnProcured
        ? yarnProcured?.dataValues.yarn_procured ?? 0
        : 0;
      obj.yarnSoldKG = yarnSold ? yarnSold.dataValues.yarn_sold ?? 0 : 0;
      obj.yarnStockKG = yarnProcured
        ? yarnProcured?.dataValues.yarn_stock ?? 0
        : 0;

      obj.yarnGreyoutKg = yarnGreyout?.dataValues.yarn_greyout ?? 0;

      obj.yarnActualStockKg = Number(obj.yarnStockKG) > Number(obj.yarnGreyoutKg)
        ? Number(obj.yarnStockKG) - (Number(obj.yarnGreyoutKg))
        : 0;
      obj.lintCottonProcuredMT = convert_kg_to_mt(obj.lintCottonProcuredKG);
      obj.lintCottonProcuredPendingMT = convert_kg_to_mt(
        obj.lintCottonProcuredPendingKG
      );
      obj.lintCottonProcuredAcceptedandPendingMT = Number(obj.lintCottonProcuredMT || 0) + Number(obj.lintCottonProcuredPendingMT || 0);
      obj.lintCottonRejectedMT = convert_kg_to_mt(obj.lintCottonRejectedKG);
      obj.moistureLosseMT = convert_kg_to_mt(obj.moistureLosseKG);
      obj.lintConsumedMT = convert_kg_to_mt(obj.lintConsumedKG);
      obj.lintStockMT = convert_kg_to_mt(obj.lintStockKG);
      obj.lintGreyoutMT = convert_kg_to_mt(obj.lintGreyoutKg);
      obj.lintActualStockMT = convert_kg_to_mt(obj.lintActualStockKg);
      obj.yarnSoldMT = convert_kg_to_mt(obj.yarnSoldKG);
      obj.yarnProcuredMT = convert_kg_to_mt(obj.yarnProcuredKG);
      obj.yarnStockMT = convert_kg_to_mt(obj.yarnStockKG);
      obj.yarnGreyoutMT = convert_kg_to_mt(obj.yarnGreyoutKg);
      obj.yarnActualStockMT = convert_kg_to_mt(obj.yarnActualStockKg);

      const rowVal = {
          index: index + 1,
          spinner_name: item.name ? item.name : "",
          state: item.state.state_name,
          lint_cotton_procured: obj.lintCottonProcuredMT ? Number(obj.lintCottonProcuredMT) : 0,
          lint_cotton_procured_pending: obj.lintCottonProcuredPendingMT ? Number(obj.lintCottonProcuredPendingMT) : 0,
          lint_cotton_procured_accepted_Pending: obj.lintCottonProcuredAcceptedandPendingMT ? Number(obj.lintCottonProcuredAcceptedandPendingMT) : 0,
          lint_consumed: obj.lintConsumedMT ? Number(obj.lintConsumedMT) : 0,
          yarn_procured: obj.yarnProcuredMT ? Number(obj.yarnProcuredMT) : 0,
          yarn_sold: obj.yarnSoldMT ? Number(obj.yarnSoldMT) : 0,
          lint_actual_Stock: obj.lintActualStockMT ? Number(obj.lintActualStockMT) : 0,
          yarn_actual_stock: obj.yarnActualStockMT ? Number(obj.yarnActualStockMT) : 0,
          lint_cotton_rejected: obj.lintCottonRejectedMT ? Number(obj.lintCottonRejectedMT) : 0,
          moisture_loss: obj.moistureLosseMT ? Number(obj.moistureLosseMT) : 0,
          lintGreyoutMT: obj.lintGreyoutMT ? Number(obj.lintGreyoutMT) : 0,
          yarnGreyoutMT: obj.yarnGreyoutMT ? Number(obj.yarnGreyoutMT) : 0,
        };

        totals.lint_cotton_procured += Number(rowVal.lint_cotton_procured);
        totals.lint_cotton_procured_pending += Number(rowVal.lint_cotton_procured_pending);
        totals.lint_cotton_procured_accepted_Pending += Number(rowVal.lint_cotton_procured_accepted_Pending);
        totals.lint_consumed += Number(rowVal.lint_consumed);
        totals.yarn_procured += Number(rowVal.yarn_procured);
        totals.yarn_sold += Number(rowVal.yarn_sold);
        totals.lint_actual_Stock += Number(rowVal.lint_actual_Stock);
        totals.yarn_actual_stock += Number(rowVal.yarn_actual_stock);
        totals.lint_cotton_rejected += Number(rowVal.lint_cotton_rejected);
        totals.moisture_loss += Number(rowVal.moisture_loss);
        totals.lintGreyoutMT += Number(rowVal.lintGreyoutMT);
        totals.yarnGreyoutMT += Number(rowVal.yarnGreyoutMT);

        const rowValues = Object.values(rowVal);
        worksheet.addRow(rowValues);
        
    }

    const rowValues = {
      index: "",
      spinner: "",
      state: "Total",
      lint_cotton_procured: totals.lint_cotton_procured,
      lint_cotton_procured_pending: totals.lint_cotton_procured_pending,
      lint_cotton_procured_accepted_Pending: totals.lint_cotton_procured_accepted_Pending,
      lint_consumed: totals.lint_consumed,
      yarn_procured: totals.yarn_procured,
      yarn_sold: totals.yarn_sold,
      lint_actual_Stock: totals.lint_actual_Stock,
      yarn_actual_stock: totals.yarn_actual_stock,
      lint_cotton_rejected: totals.lint_cotton_rejected,
      moisture_loss: totals.moisture_loss,
      lintGreyoutMT: totals.lintGreyoutMT,
      yarnGreyoutMT: totals.yarnGreyoutMT
    };

    worksheet.addRow(Object.values(rowValues)).eachCell(cell => cell.font = { bold: true });

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
    
    await ExportData.update({
      spinner_details_load: false
    }, { where: { spinner_details_load: true } })
  } catch (error: any) {
    (async () => {
      await ExportData.update({
        spinner_details_load: false
      }, { where: { spinner_details_load: true } })
    })()
    console.log(error);
    return res.sendError(res, error.message, error);
  }

};

const fetchConsolidatedDetailsFarmerGinnerPagination = async (req: Request, res: Response) => {
  
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const { seasonId, programId, brandId, countryId, stateId }: any = req.query;
    let whereCondition: string[] = [];
    let seasonCondition: string[] = [];
    let brandCondition: string[] = [];
    let baleCondition: string[] = [];
    let baleSaleCondition: string[] = [];
    let seedAllocationCondition: string[] = [];
    let ginToGinSaleCondition: string[] = [];
 
  try {

    // Filters

    if (searchTerm) {
      brandCondition.push(`(s.state_name ILIKE '%${searchTerm}%')`);
    }

    if (countryId) {
      const idArray = countryId.split(",").map((id: string) => parseInt(id, 10));
      whereCondition.push(`t.country_id IN (${countryId})`);
      brandCondition.push(`g.country_id IN (${countryId})`);
    }

    if (brandId) {
      const idArray = brandId.split(",").map((id: string) => parseInt(id, 10));
      whereCondition.push(`t.brand_id IN (${brandId})`);
      // brandCondition.push(`g.brand && ARRAY[${brandId}]`);

      baleCondition.push(`g.brand && ARRAY[${brandId}]`);
      baleSaleCondition.push(`g.brand && ARRAY[${brandId}]`);
      seedAllocationCondition.push(`gv.brand_id IN (${brandId})`);
      ginToGinSaleCondition.push(`g.brand && ARRAY[${brandId}]`);
    }


    if (programId) {
      const idArray = brandId.split(",").map((id: string) => parseInt(id, 10));
      whereCondition.push(`t.program_id IN (${programId})`);
      // brandCondition.push(`g.program_id && ARRAY[${programId}]`);

      baleCondition.push(`gp.program_id IN (${programId})`);
      baleSaleCondition.push(`gp.program_id IN (${programId})`);
      seedAllocationCondition.push(`gv.program_id IN (${programId})`);
      ginToGinSaleCondition.push(`gs.program_id IN (${programId})`);
    }

    if (seasonId) {
      const idArray = seasonId.split(",").map((id: string) => parseInt(id, 10));
      seasonCondition.push(`season_id IN (${seasonId})`);
      baleCondition.push(`gp.season_id IN (${seasonId})`);
      baleSaleCondition.push(`gp.season_id IN (${seasonId})`);
      seedAllocationCondition.push(`gv.season_id IN (${seasonId})`);
      ginToGinSaleCondition.push(`gs.season_id IN (${seasonId})`);
    }

    if (stateId) {
      const idArray = stateId.split(",").map((id: string) => parseInt(id, 10));
      brandCondition.push(`g.state_id IN (${stateId})`);
    }

    const whereConditionSql = whereCondition.length ? `${whereCondition.join(' AND ')}` : '1=1';
    const seasonConditionSql = seasonCondition.length ? `${seasonCondition.join(' AND ')}` : '1=1';
    const brandConditionSql = brandCondition.length ? `${brandCondition.join(' AND ')}` : '1=1';
    const baleConditionSql = baleCondition.length ? `${baleCondition.join(' AND ')}` : '1=1';
    const baleSaleConditionSql = baleSaleCondition.length ? `${baleSaleCondition.join(' AND ')}` : '1=1';
    const seedAllocationConditionSql = seedAllocationCondition.length ? `${seedAllocationCondition.join(' AND ')}` : '1=1';
    const ginToGinSaleConditionSql = ginToGinSaleCondition.length ? `${ginToGinSaleCondition.join(' AND ')}` : '1=1';


// Count query
    const countQuery = `
    SELECT COUNT(*) AS total_count
    FROM ginners g
    JOIN states s ON g.state_id = s.id
    JOIN countries c ON g.country_id = c.id
    WHERE ${brandConditionSql}
    GROUP BY s.id, g.state_id, g.country_id, c.id
    `;

    // Data query
    const dataQuery = `
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
          WHERE ${brandConditionSql}
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
          WHERE
            t.mapped_ginner IS NOT NULL
            AND t.status = 'Sold'
            AND ${seasonConditionSql}
            AND ${whereConditionSql}
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
            AND ${seasonConditionSql}
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
              AND ${baleConditionSql}
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
            AND ${baleConditionSql}
          GROUP BY
            g.state_id
        ),
        pending_seed_cotton_data AS (
          SELECT
            t.state_id,
            SUM(CAST(t.qty_purchased AS DOUBLE PRECISION)) AS pending_seed_cotton
          FROM
            transactions t
          JOIN ginners ON t.mapped_ginner = ginners.id
          JOIN states_data s ON t.state_id = s.id
          WHERE
            t.program_id = ANY (ginners.program_id)
            AND t.status = 'Pending'
            AND ${seasonConditionSql}
            AND ${whereConditionSql}
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
            AND ${baleSaleConditionSql}
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
                    AND ${baleSaleConditionSql}
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
                  AND ${ginToGinSaleConditionSql}
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
                    AND ${baleSaleConditionSql}
              GROUP BY
                  g.state_id
            ),
            expected_cotton_data AS (
                SELECT
                  gv.state_id,
                  COALESCE(SUM(CAST("farms"."total_estimated_cotton"AS DOUBLE PRECISION)), 0) AS allocated_seed_cotton
                  FROM "ginner_allocated_villages" as gv
                LEFT JOIN 
                    states_data s ON "gv"."state_id" = s.id
                LEFT JOIN 
                    "farmers" AS "farmer" ON gv.village_id = "farmer"."village_id" and "farmer"."brand_id" ="gv"."brand_id"
                LEFT JOIN 
                    "farms" as "farms" on farms.farmer_id = "farmer".id and farms.season_id = gv.season_id
                LEFT JOIN 
                    "seasons" AS "season" ON "gv"."season_id" = "season"."id"
                WHERE
                    ${seedAllocationConditionSql} 
                GROUP BY
                  gv.state_id
            )
      SELECT
        fg.id AS state_id,
        fg.state_name,
        fg.country_name,
        COALESCE(ec.allocated_seed_cotton, 0) / 1000 AS allocated_seed_cotton_mt,
        COALESCE(pd.procurement_seed_cotton, 0) / 1000 AS procurement_seed_cotton_mt,
        COALESCE(psc.pending_seed_cotton, 0) / 1000 AS pending_seed_cotton_mt,
        COALESCE(pd.seed_cotton_stock, 0) / 1000 AS procured_seed_cotton_stock_mt,
        (
          COALESCE(ec.allocated_seed_cotton, 0) *
          CASE LOWER(fg.country_name)
          WHEN 'india' THEN 35
          WHEN 'pakistan' THEN 36
          WHEN 'bangladesh' THEN 40
          WHEN 'turkey' THEN 45
          WHEN 'egypt' THEN 49
          WHEN 'china' THEN 40
          ELSE 35
          END / 100.0
        ) / 1000 AS allocated_lint_cotton_mt,  
--         CAST(ROUND(
--              CAST((((COALESCE(ec.allocated_seed_cotton, 0) * 35/100) / 1000) - ((COALESCE(pd.procurement_seed_cotton, 0) * 35/100) / 1000)) AS NUMERIC),
--              2
--          ) AS DOUBLE PRECISION) AS available_lint_cotton_farmer_mt,
        CAST(ROUND(
          CAST((
          (
            COALESCE(ec.allocated_seed_cotton, 0) *
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
        ) AS DOUBLE PRECISION) AS actual_lint_stock_mt
      FROM
        states_data fg
        LEFT JOIN procurement_data pd ON fg.id = pd.state_id
        LEFT JOIN gin_process_data gp ON fg.id = gp.state_id
        LEFT JOIN gin_bale_data gb ON fg.id = gb.state_id
        LEFT JOIN pending_seed_cotton_data psc ON fg.id = psc.state_id
        LEFT JOIN gin_sales_data gs ON fg.id = gs.state_id
        LEFT JOIN expected_cotton_data ec ON fg.id = ec.state_id
        LEFT JOIN gin_bale_greyout_data gbg ON fg.id = gbg.state_id
        LEFT JOIN gin_to_gin_sales_data gtg ON fg.id = gtg.state_id
        LEFT JOIN gin_to_gin_recieved_data gtgr ON fg.id = gtgr.state_id
        LEFT JOIN gin_to_be_submitted_data gtsg ON fg.id = gtsg.state_id
      ORDER BY
        fg.state_name asc
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

    const totalCount = countResult && countResult.length > 0 ? countResult.length : 0;

    return res.sendPaginationSuccess(res, rows, totalCount);

  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message, error);
  }
};

  const exportConsolidatedDetailsFarmerGinner = async (req: Request, res: Response) => {
      const excelFilePath = path.join(
      "./upload",
      "excel-consolidated-farmer-ginner-report.xlsx"
    );

    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const {  seasonId, programId, brandId, countryId, stateId }: any =
      req.query;
    const offset = (page - 1) * limit;
    let whereCondition: string[] = [];
    let seasonCondition: string[] = [];
    let brandCondition: string[] = [];
    let baleCondition: string[] = [];
    let baleSaleCondition: string[] = [];
    let seedAllocationCondition: string[] = [];
    let ginToGinSaleCondition: string[] = [];
    try {
      
      if (searchTerm) {
        brandCondition.push(`(s.state_name ILIKE '%${searchTerm}%')`);
      }

      if (countryId) {
        const idArray = countryId.split(",").map((id: string) => parseInt(id, 10));
        whereCondition.push(`t.country_id IN (${countryId})`);
        brandCondition.push(`g.country_id IN (${countryId})`);
      }

      if (brandId) {
        const idArray = brandId.split(",").map((id: string) => parseInt(id, 10));
        whereCondition.push(`t.brand_id IN (${brandId})`);
        brandCondition.push(`g.brand && ARRAY[${brandId}]`);
      }


      if (programId) {
        const idArray = brandId.split(",").map((id: string) => parseInt(id, 10));
        whereCondition.push(`t.program_id IN (${programId})`);
        brandCondition.push(`g.program_id && ARRAY[${programId}]`);
      }

      if (seasonId) {
        const idArray = seasonId.split(",").map((id: string) => parseInt(id, 10));
        seasonCondition.push(`season_id IN (${seasonId})`);
        baleCondition.push(`gp.season_id IN (${seasonId})`);
        baleSaleCondition.push(`gp.season_id IN (${seasonId})`);
        seedAllocationCondition.push(`gv.season_id IN (${seasonId})`);
        ginToGinSaleCondition.push(`gs.season_id IN (${seasonId})`);
      }

      if (stateId) {
        const idArray = stateId.split(",").map((id: string) => parseInt(id, 10));
        brandCondition.push(`g.state_id IN (${stateId})`);
      }

      const whereConditionSql = whereCondition.length ? `${whereCondition.join(' AND ')}` : '1=1';
      const seasonConditionSql = seasonCondition.length ? `${seasonCondition.join(' AND ')}` : '1=1';
      const brandConditionSql = brandCondition.length ? `${brandCondition.join(' AND ')}` : '1=1';
      const baleConditionSql = baleCondition.length ? `${baleCondition.join(' AND ')}` : '1=1';
      const baleSaleConditionSql = baleSaleCondition.length ? `${baleSaleCondition.join(' AND ')}` : '1=1';
      const seedAllocationConditionSql = seedAllocationCondition.length ? `${seedAllocationCondition.join(' AND ')}` : '1=1';
      const ginToGinSaleConditionSql = ginToGinSaleCondition.length ? `${ginToGinSaleCondition.join(' AND ')}` : '1=1';

      
  // Count query
      const countQuery = `
      SELECT COUNT(*) AS total_count
      FROM ginners g
      JOIN states s ON g.state_id = s.id
      JOIN countries c ON g.country_id = c.id
      WHERE ${brandConditionSql}
      GROUP BY s.id, g.state_id, g.country_id, c.id
      `;

      // Data query
      const dataQuery = `
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
          WHERE ${brandConditionSql}
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
          WHERE
            t.mapped_ginner IS NOT NULL
            AND t.status = 'Sold'
            AND ${seasonConditionSql}
            AND ${whereConditionSql}
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
            AND ${seasonConditionSql}
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
              AND ${baleConditionSql}
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
            AND ${baleConditionSql}
          GROUP BY
            g.state_id
        ),
        pending_seed_cotton_data AS (
          SELECT
            t.state_id,
            SUM(CAST(t.qty_purchased AS DOUBLE PRECISION)) AS pending_seed_cotton
          FROM
            transactions t
          JOIN ginners ON t.mapped_ginner = ginners.id
          JOIN states_data s ON t.state_id = s.id
          WHERE
            t.program_id = ANY (ginners.program_id)
            AND t.status = 'Pending'
            AND ${seasonConditionSql}
            AND ${whereConditionSql}
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
            AND ${baleSaleConditionSql}
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
                    AND ${baleSaleConditionSql}
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
                  AND ${ginToGinSaleConditionSql}
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
                    AND ${baleSaleConditionSql}
              GROUP BY
                  g.state_id
            ),
            expected_cotton_data AS (
                SELECT
                  gv.state_id,
                  COALESCE(SUM(CAST("farms"."total_estimated_cotton"AS DOUBLE PRECISION)), 0) AS allocated_seed_cotton
                  FROM "ginner_allocated_villages" as gv
                LEFT JOIN 
                    states_data s ON "gv"."state_id" = s.id
                LEFT JOIN 
                    "farmers" AS "farmer" ON gv.village_id = "farmer"."village_id" and "farmer"."brand_id" ="gv"."brand_id"
                LEFT JOIN 
                    "farms" as "farms" on farms.farmer_id = "farmer".id and farms.season_id = gv.season_id
                LEFT JOIN 
                    "seasons" AS "season" ON "gv"."season_id" = "season"."id"
                WHERE
                    ${seedAllocationConditionSql} 
                GROUP BY
                  gv.state_id
            )
      SELECT
        fg.id AS state_id,
        fg.state_name,
        fg.country_name,
        COALESCE(ec.allocated_seed_cotton, 0) / 1000 AS allocated_seed_cotton_mt,
        COALESCE(pd.procurement_seed_cotton, 0) / 1000 AS procurement_seed_cotton_mt,
        COALESCE(psc.pending_seed_cotton, 0) / 1000 AS pending_seed_cotton_mt,
        COALESCE(pd.seed_cotton_stock, 0) / 1000 AS procured_seed_cotton_stock_mt,
        (
          COALESCE(ec.allocated_seed_cotton, 0) *
          CASE LOWER(fg.country_name)
          WHEN 'india' THEN 35
          WHEN 'pakistan' THEN 36
          WHEN 'bangladesh' THEN 40
          WHEN 'turkey' THEN 45
          WHEN 'egypt' THEN 49
          WHEN 'china' THEN 40
          ELSE 35
          END / 100.0
        ) / 1000 AS allocated_lint_cotton_mt,  
--         CAST(ROUND(
--              CAST((((COALESCE(ec.allocated_seed_cotton, 0) * 35/100) / 1000) - ((COALESCE(pd.procurement_seed_cotton, 0) * 35/100) / 1000)) AS NUMERIC),
--              2
--          ) AS DOUBLE PRECISION) AS available_lint_cotton_farmer_mt,
        CAST(ROUND(
          CAST((
          (
            COALESCE(ec.allocated_seed_cotton, 0) *
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
        ) AS DOUBLE PRECISION) AS actual_lint_stock_mt
      FROM
        states_data fg
        LEFT JOIN procurement_data pd ON fg.id = pd.state_id
        LEFT JOIN gin_process_data gp ON fg.id = gp.state_id
        LEFT JOIN gin_bale_data gb ON fg.id = gb.state_id
        LEFT JOIN pending_seed_cotton_data psc ON fg.id = psc.state_id
        LEFT JOIN gin_sales_data gs ON fg.id = gs.state_id
        LEFT JOIN expected_cotton_data ec ON fg.id = ec.state_id
        LEFT JOIN gin_bale_greyout_data gbg ON fg.id = gbg.state_id
        LEFT JOIN gin_to_gin_sales_data gtg ON fg.id = gtg.state_id
        LEFT JOIN gin_to_gin_recieved_data gtgr ON fg.id = gtgr.state_id
        LEFT JOIN gin_to_be_submitted_data gtsg ON fg.id = gtsg.state_id
      ORDER BY
        fg.state_name asc
      LIMIT :limit OFFSET :offset
    `;


        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        // worksheet.mergeCells("A1:M1");
        // const mergedCell = worksheet.getCell("A1");
        // mergedCell.value = "CottonConnect | Consolidated Farmer ginner Report";
        // mergedCell.font = { bold: true };
        // mergedCell.alignment = { horizontal: "center", vertical: "middle" };
        // Set bold font for header row
        let headerRow;
        
          headerRow = worksheet.addRow([
              "Sr No.",
              "State",
              "Allocated Seed Cotton(MT)",
              "Procured seed cotton accepted by ginner(MT)",
              "Seed cotton pending at ginner(MT)",
              "Seed cotton stock at ginners (MT)",
              "Total lint cotton allocated to ginners (MT)",
              "Total lint cotton available at farmers (MT)",
              "Total lint cotton procured by ginners (MT)",
              "Total lint cotton produced (MT)",
              "Total lint cotton unprocessed (MT)",
              "Total lint cotton sold (MT)",
              "Actual lint cotton stock at ginners (MT)",
              "Lint cotton procured from other ginners (MT)"
            ]);
          
        headerRow.font = { bold: true };

        const [countResult, rows] = await Promise.all([
        sequelize.query(countQuery, {
          type: sequelize.QueryTypes.SELECT,
        }),
        sequelize.query(dataQuery, {
          replacements: { limit, offset },
          type: sequelize.QueryTypes.SELECT,
        })
      ]);

  const totalCount = countResult && countResult.length > 0 ? countResult.length : 0;       
        let totals = {
        allocated_seed_cotton: 0,
        procurement_seed_cotton_mt: 0,
        pending_seed_cotton_mt: 0,
        procured_seed_cotton_stock_mt: 0,
        allocated_lint_cotton_mt: 0,
        available_lint_cotton_farmer_mt: 0,
        procured_lint_cotton_mt: 0,
        produced_lint_cotton_mt: 0,
        unprocessed_lint_cotton_mt: 0,
        total_lint_cotton_sold_mt: 0,
        actual_lint_stock_mt: 0,
        total_qty_lint_received_mt: 0,
      };
        // // Append data to worksheet
        for await (const [index, item] of rows.entries()) {

          let rowValues;
            rowValues = {
              index: index + 1,
              state: item.state_name,
              allocated_seed_cotton: Number(formatDecimal(item.allocated_seed_cotton_mt)),
              procurement_seed_cotton_mt: Number(formatDecimal(item.procurement_seed_cotton_mt)),
              pending_seed_cotton_mt: Number(formatDecimal(item.pending_seed_cotton_mt)),
              procured_seed_cotton_stock_mt: Number(formatDecimal(item.procured_seed_cotton_stock_mt)),
              allocated_lint_cotton_mt: Number(formatDecimal(item.allocated_lint_cotton_mt)),
              available_lint_cotton_farmer_mt: Number(formatDecimal(item.available_lint_cotton_farmer_mt)),
              procured_lint_cotton_mt: Number(formatDecimal(item.procured_lint_cotton_mt)),
              produced_lint_cotton_mt: Number(formatDecimal(item.produced_lint_cotton_mt)),
              unprocessed_lint_cotton_mt: Number(formatDecimal(item.unprocessed_lint_cotton_mt)),
              total_lint_cotton_sold_mt: Number(formatDecimal(item.total_lint_cotton_sold_mt)),
              actual_lint_stock_mt: Number(formatDecimal(item.actual_lint_stock_mt)),
              total_qty_lint_received_mt: Number(formatDecimal(item.total_qty_lint_received_mt)),
            };

          totals.allocated_seed_cotton += item.allocated_seed_cotton_mt ? Number(item.allocated_seed_cotton_mt) : 0;
          totals.procurement_seed_cotton_mt += item.procurement_seed_cotton_mt ? Number(item.procurement_seed_cotton_mt) : 0;
          totals.pending_seed_cotton_mt += item.pending_seed_cotton_mt ? Number(item.pending_seed_cotton_mt) : 0;
          totals.procured_seed_cotton_stock_mt += item.procured_seed_cotton_stock_mt ? Number(item.procured_seed_cotton_stock_mt) : 0;
          totals.allocated_lint_cotton_mt += item.allocated_lint_cotton_mt ? Number(item.allocated_lint_cotton_mt) : 0;
          totals.available_lint_cotton_farmer_mt += item.available_lint_cotton_farmer_mt ? Number(item.available_lint_cotton_farmer_mt) : 0;
          totals.procured_lint_cotton_mt += item.procured_lint_cotton_mt ? Number(item.procured_lint_cotton_mt) : 0;
          totals.produced_lint_cotton_mt += item.produced_lint_cotton_mt ? Number(item.produced_lint_cotton_mt) : 0;
          totals.unprocessed_lint_cotton_mt += item.unprocessed_lint_cotton_mt ? Number(item.unprocessed_lint_cotton_mt) : 0;
          totals.total_lint_cotton_sold_mt += item.total_lint_cotton_sold_mt ? Number(item.total_lint_cotton_sold_mt) : 0;
          totals.actual_lint_stock_mt += item.actual_lint_stock_mt ? Number(item.actual_lint_stock_mt) : 0;
          totals.total_qty_lint_received_mt += item.total_qty_lint_received_mt ? Number(item.total_qty_lint_received_mt) : 0;        
          
          worksheet.addRow(Object.values(rowValues));
        }

        let rowValues = Object.values({
          index: "",
          state: "Total",
          allocated_seed_cotton: Number(formatDecimal(totals.allocated_seed_cotton)),
          procurement_seed_cotton_mt: Number(formatDecimal(totals.procurement_seed_cotton_mt)),
          pending_seed_cotton_mt: Number(formatDecimal(totals.pending_seed_cotton_mt)),
          procured_seed_cotton_stock_mt: Number(formatDecimal(totals.procured_seed_cotton_stock_mt)),
          allocated_lint_cotton_mt: Number(formatDecimal(totals.allocated_lint_cotton_mt)),
          available_lint_cotton_farmer_mt: Number(formatDecimal(totals.available_lint_cotton_farmer_mt)),
          procured_lint_cotton_mt: Number(formatDecimal(totals.procured_lint_cotton_mt)),
          produced_lint_cotton_mt: Number(formatDecimal(totals.produced_lint_cotton_mt)),
          unprocessed_lint_cotton_mt: Number(formatDecimal(totals.unprocessed_lint_cotton_mt)),
          total_lint_cotton_sold_mt: Number(formatDecimal(totals.total_lint_cotton_sold_mt)),
          actual_lint_stock_mt: Number(formatDecimal(totals.actual_lint_stock_mt)),
          total_qty_lint_received_mt: Number(formatDecimal(totals.total_qty_lint_received_mt)),
        });

        worksheet.addRow(rowValues).eachCell((cell, colNumber) => { cell.font = { bold: true } });

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
        return res.status(200).send({
          success: true,
          messgage: "File successfully Generated",
          data: process.env.BASE_URL + "excel-consolidated-farmer-ginner-report.xlsx",
        });
      

    } catch (error: any) {
      console.log(error);
      return res.sendError(res, error.message, error);
    }
  }
const fetchGinnerDetailsPagination = async (req: Request, res: Response) => {
  
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const { seasonId, programId, brandId, countryId, stateId, ginnerId }: any = req.query;
    let whereCondition: string[] = [];
    let seasonCondition: string[] = [];
    let brandCondition: string[] = [];
    let baleCondition: string[] = [];
    let baleSaleCondition: string[] = [];
    let seedAllocationCondition: string[] = [];
    let ginToGinSaleCondition: string[] = [];
 
  try {

    // Filters

    if (searchTerm) {
      brandCondition.push(`(g.name ILIKE '%${searchTerm}%')`);
    }

    if (countryId) {
      const idArray = countryId.split(",").map((id: string) => parseInt(id, 10));
      whereCondition.push(`t.country_id IN (${countryId})`);
      brandCondition.push(`g.country_id IN (${countryId})`);
    }

    if (brandId) {
      const idArray = brandId.split(",").map((id: string) => parseInt(id, 10));
      whereCondition.push(`t.brand_id IN (${brandId})`);
      brandCondition.push(`g.brand && ARRAY[${brandId}]`);
    }


    if (programId) {
      const idArray = brandId.split(",").map((id: string) => parseInt(id, 10));
      whereCondition.push(`t.program_id IN (${programId})`);
      brandCondition.push(`g.program_id && ARRAY[${programId}]`);
    }

    if (seasonId) {
      const idArray = seasonId.split(",").map((id: string) => parseInt(id, 10));
      seasonCondition.push(`season_id IN (${seasonId})`);
      baleCondition.push(`gp.season_id IN (${seasonId})`);
      baleSaleCondition.push(`gp.season_id IN (${seasonId})`);
      seedAllocationCondition.push(`gv.season_id IN (${seasonId})`);
      ginToGinSaleCondition.push(`gs.season_id IN (${seasonId})`);
    }

    if (stateId) {
      const idArray = stateId.split(",").map((id: string) => parseInt(id, 10));
      brandCondition.push(`g.state_id IN (${stateId})`);
    }

    if (ginnerId) {
      const idArray = ginnerId.split(",").map((id: string) => parseInt(id, 10));
      brandCondition.push(`g.id IN (${ginnerId})`);
    }

    const whereConditionSql = whereCondition.length ? `${whereCondition.join(' AND ')}` : '1=1';
    const seasonConditionSql = seasonCondition.length ? `${seasonCondition.join(' AND ')}` : '1=1';
    const brandConditionSql = brandCondition.length ? `${brandCondition.join(' AND ')}` : '1=1';
    const baleConditionSql = baleCondition.length ? `${baleCondition.join(' AND ')}` : '1=1';
    const baleSaleConditionSql = baleSaleCondition.length ? `${baleSaleCondition.join(' AND ')}` : '1=1';
    const seedAllocationConditionSql = seedAllocationCondition.length ? `${seedAllocationCondition.join(' AND ')}` : '1=1';
    const ginToGinSaleConditionSql = ginToGinSaleCondition.length ? `${ginToGinSaleCondition.join(' AND ')}` : '1=1';


// Count query
    const countQuery = `
    SELECT COUNT(*) AS total_count
    FROM ginners g
    JOIN states s ON g.state_id = s.id
    JOIN countries c ON g.country_id = c.id
    WHERE ${brandConditionSql}
    `;

    // Data query
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
          WHERE ${brandConditionSql}
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
            AND ${seasonConditionSql}
            AND ${whereConditionSql}
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
            AND ${seasonConditionSql}
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
              AND ${baleConditionSql}
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
            AND ${baleConditionSql}
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
            AND ${seasonConditionSql}
            AND ${whereConditionSql}
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
            AND ${baleSaleConditionSql}
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
                    AND ${baleSaleConditionSql}
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
                  AND ${ginToGinSaleConditionSql}
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
                    AND ${baleSaleConditionSql}
              GROUP BY
                  gs.ginner_id
            ),
            expected_cotton_data AS (
                SELECT
                  gv.ginner_id,
                  COALESCE(SUM(CAST("farms"."total_estimated_cotton"AS DOUBLE PRECISION)), 0) AS allocated_seed_cotton
                  FROM "ginner_allocated_villages" as gv
                LEFT JOIN
                    ginner_data g ON "gv"."ginner_id" = g.id
                LEFT JOIN
                    "farmers" AS "farmer" ON gv.village_id = "farmer"."village_id" and "farmer"."brand_id" ="gv"."brand_id"
                LEFT JOIN
                    "farms" as "farms" on farms.farmer_id = "farmer".id and farms.season_id = gv.season_id
                LEFT JOIN
                    "seasons" AS "season" ON "gv"."season_id" = "season"."id"
                WHERE
                    ${seedAllocationConditionSql} 
                GROUP BY
                  gv.ginner_id
            )
      SELECT
        fg.*,
        COALESCE(ec.allocated_seed_cotton, 0) / 1000 AS allocated_seed_cotton_mt,
        COALESCE(pd.procurement_seed_cotton, 0) / 1000 AS procurement_seed_cotton_mt,
        COALESCE(psc.pending_seed_cotton, 0) / 1000 AS pending_seed_cotton_mt,
        COALESCE(pd.seed_cotton_stock, 0) / 1000 AS procured_seed_cotton_stock_mt,
--        (COALESCE(ec.allocated_seed_cotton, 0) * 35/100) / 1000 AS allocated_lint_cotton_mt,
        (
          COALESCE(ec.allocated_seed_cotton, 0) *
          CASE LOWER(fg.country_name)
          WHEN 'india' THEN 35
          WHEN 'pakistan' THEN 36
          WHEN 'bangladesh' THEN 40
          WHEN 'turkey' THEN 45
          WHEN 'egypt' THEN 49
          WHEN 'china' THEN 40
          ELSE 35
          END / 100.0
        ) / 1000 AS allocated_lint_cotton_mt, 
--         CAST(ROUND(
--              CAST((((COALESCE(ec.allocated_seed_cotton, 0) * 35/100) / 1000) - ((COALESCE(pd.procurement_seed_cotton, 0) * 35/100) / 1000)) AS NUMERIC),
--              2
--          ) AS DOUBLE PRECISION) AS available_lint_cotton_farmer_mt,
        CAST(ROUND(
          CAST((
          (
            COALESCE(ec.allocated_seed_cotton, 0) *
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
        ) AS DOUBLE PRECISION) AS actual_lint_stock_mt
      FROM
        ginner_data fg
        LEFT JOIN procurement_data pd ON fg.id = pd.ginner_id
        LEFT JOIN gin_process_data gp ON fg.id = gp.ginner_id
        LEFT JOIN gin_bale_data gb ON fg.id = gb.ginner_id
        LEFT JOIN pending_seed_cotton_data psc ON fg.id = psc.ginner_id
        LEFT JOIN gin_sales_data gs ON fg.id = gs.ginner_id
        LEFT JOIN expected_cotton_data ec ON fg.id = ec.ginner_id
        LEFT JOIN gin_bale_greyout_data gbg ON fg.id = gbg.ginner_id
        LEFT JOIN gin_to_gin_sales_data gtg ON fg.id = gtg.ginner_id
        LEFT JOIN gin_to_gin_recieved_data gtgr ON fg.id = gtgr.ginner_id
        LEFT JOIN gin_to_be_submitted_data gtsg ON fg.id = gtsg.ginner_id
      ORDER BY
        fg.name asc
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

    const totalCount = countResult && countResult.length > 0 ? Number(countResult[0].total_count) : 0;

    return res.sendPaginationSuccess(res, rows, totalCount);

  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message, error);
  }
};

const exportGinnerDetails = async (req: Request, res: Response) => {
      const excelFilePath = path.join(
      "./upload",
      "excel-ginner-details-sheet.xlsx"
    );

    const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const { seasonId, programId, brandId, countryId, stateId, ginnerId }: any = req.query;
    let whereCondition: string[] = [];
    let seasonCondition: string[] = [];
    let brandCondition: string[] = [];
    let baleCondition: string[] = [];
    let baleSaleCondition: string[] = [];
    let seedAllocationCondition: string[] = [];
    let ginToGinSaleCondition: string[] = [];
    try {
      
      // Filters

    if (searchTerm) {
      brandCondition.push(`(g.name ILIKE '%${searchTerm}%')`);
    }

    if (countryId) {
      const idArray = countryId.split(",").map((id: string) => parseInt(id, 10));
      whereCondition.push(`t.country_id IN (${countryId})`);
      brandCondition.push(`g.country_id IN (${countryId})`);
    }

    if (brandId) {
      const idArray = brandId.split(",").map((id: string) => parseInt(id, 10));
      whereCondition.push(`t.brand_id IN (${brandId})`);
      brandCondition.push(`g.brand && ARRAY[${brandId}]`);
    }


    if (programId) {
      const idArray = brandId.split(",").map((id: string) => parseInt(id, 10));
      whereCondition.push(`t.program_id IN (${programId})`);
      brandCondition.push(`g.program_id && ARRAY[${programId}]`);
    }

    if (seasonId) {
      const idArray = seasonId.split(",").map((id: string) => parseInt(id, 10));
      seasonCondition.push(`season_id IN (${seasonId})`);
      baleCondition.push(`gp.season_id IN (${seasonId})`);
      baleSaleCondition.push(`gp.season_id IN (${seasonId})`);
      seedAllocationCondition.push(`gv.season_id IN (${seasonId})`);
      ginToGinSaleCondition.push(`gs.season_id IN (${seasonId})`);
    }

    if (stateId) {
      const idArray = stateId.split(",").map((id: string) => parseInt(id, 10));
      brandCondition.push(`g.state_id IN (${stateId})`);
    }

    if (ginnerId) {
      const idArray = ginnerId.split(",").map((id: string) => parseInt(id, 10));
      brandCondition.push(`g.id IN (${ginnerId})`);
    }

    const whereConditionSql = whereCondition.length ? `${whereCondition.join(' AND ')}` : '1=1';
    const seasonConditionSql = seasonCondition.length ? `${seasonCondition.join(' AND ')}` : '1=1';
    const brandConditionSql = brandCondition.length ? `${brandCondition.join(' AND ')}` : '1=1';
    const baleConditionSql = baleCondition.length ? `${baleCondition.join(' AND ')}` : '1=1';
    const baleSaleConditionSql = baleSaleCondition.length ? `${baleSaleCondition.join(' AND ')}` : '1=1';
    const seedAllocationConditionSql = seedAllocationCondition.length ? `${seedAllocationCondition.join(' AND ')}` : '1=1';
    const ginToGinSaleConditionSql = ginToGinSaleCondition.length ? `${ginToGinSaleCondition.join(' AND ')}` : '1=1';

      
  // Count query
    const countQuery = `
    SELECT COUNT(*) AS total_count
    FROM ginners g
    JOIN states s ON g.state_id = s.id
    JOIN countries c ON g.country_id = c.id
    WHERE ${brandConditionSql}
    `;

    // Data query
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
          WHERE ${brandConditionSql}
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
            AND ${seasonConditionSql}
            AND ${whereConditionSql}
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
            AND ${seasonConditionSql}
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
              AND ${baleConditionSql}
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
            AND ${baleConditionSql}
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
            AND ${seasonConditionSql}
            AND ${whereConditionSql}
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
            AND ${baleSaleConditionSql}
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
                    AND ${baleSaleConditionSql}
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
                  AND ${ginToGinSaleConditionSql}
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
                    AND ${baleSaleConditionSql}
              GROUP BY
                  gs.ginner_id
            ),
            expected_cotton_data AS (
                SELECT
                  gv.ginner_id,
                  COALESCE(SUM(CAST("farms"."total_estimated_cotton"AS DOUBLE PRECISION)), 0) AS allocated_seed_cotton
                  FROM "ginner_allocated_villages" as gv
                LEFT JOIN
                    ginner_data g ON "gv"."ginner_id" = g.id
                LEFT JOIN
                    "farmers" AS "farmer" ON gv.village_id = "farmer"."village_id" and "farmer"."brand_id" ="gv"."brand_id"
                LEFT JOIN
                    "farms" as "farms" on farms.farmer_id = "farmer".id and farms.season_id = gv.season_id
                LEFT JOIN
                    "seasons" AS "season" ON "gv"."season_id" = "season"."id"
                WHERE
                    ${seedAllocationConditionSql} 
                GROUP BY
                  gv.ginner_id
            )
      SELECT
        fg.*,
        COALESCE(ec.allocated_seed_cotton, 0) / 1000 AS allocated_seed_cotton_mt,
        COALESCE(pd.procurement_seed_cotton, 0) / 1000 AS procurement_seed_cotton_mt,
        COALESCE(psc.pending_seed_cotton, 0) / 1000 AS pending_seed_cotton_mt,
        COALESCE(pd.seed_cotton_stock, 0) / 1000 AS procured_seed_cotton_stock_mt,
--        (COALESCE(ec.allocated_seed_cotton, 0) * 35/100) / 1000 AS allocated_lint_cotton_mt,
        (
          COALESCE(ec.allocated_seed_cotton, 0) *
          CASE LOWER(fg.country_name)
          WHEN 'india' THEN 35
          WHEN 'pakistan' THEN 36
          WHEN 'bangladesh' THEN 40
          WHEN 'turkey' THEN 45
          WHEN 'egypt' THEN 49
          WHEN 'china' THEN 40
          ELSE 35
          END / 100.0
        ) / 1000 AS allocated_lint_cotton_mt, 
--         CAST(ROUND(
--              CAST((((COALESCE(ec.allocated_seed_cotton, 0) * 35/100) / 1000) - ((COALESCE(pd.procurement_seed_cotton, 0) * 35/100) / 1000)) AS NUMERIC),
--              2
--          ) AS DOUBLE PRECISION) AS available_lint_cotton_farmer_mt,
        CAST(ROUND(
          CAST((
          (
            COALESCE(ec.allocated_seed_cotton, 0) *
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
        ) AS DOUBLE PRECISION) AS actual_lint_stock_mt
      FROM
        ginner_data fg
        LEFT JOIN procurement_data pd ON fg.id = pd.ginner_id
        LEFT JOIN gin_process_data gp ON fg.id = gp.ginner_id
        LEFT JOIN gin_bale_data gb ON fg.id = gb.ginner_id
        LEFT JOIN pending_seed_cotton_data psc ON fg.id = psc.ginner_id
        LEFT JOIN gin_sales_data gs ON fg.id = gs.ginner_id
        LEFT JOIN expected_cotton_data ec ON fg.id = ec.ginner_id
        LEFT JOIN gin_bale_greyout_data gbg ON fg.id = gbg.ginner_id
        LEFT JOIN gin_to_gin_sales_data gtg ON fg.id = gtg.ginner_id
        LEFT JOIN gin_to_gin_recieved_data gtgr ON fg.id = gtgr.ginner_id
        LEFT JOIN gin_to_be_submitted_data gtsg ON fg.id = gtsg.ginner_id
      ORDER BY
        fg.name asc
      LIMIT :limit OFFSET :offset
    `;


        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        // worksheet.mergeCells("A1:M1");
        // const mergedCell = worksheet.getCell("A1");
        // mergedCell.value = "CottonConnect | Ginner Details";
        // mergedCell.font = { bold: true };
        // mergedCell.alignment = { horizontal: "center", vertical: "middle" };
        // Set bold font for header row
        let headerRow;
        
          headerRow = worksheet.addRow([
              "Sr No.",
              "Ginner Name",
              "State",
              "Allocated Lint cotton (MT)",
              "Procured seed cotton (MT)",
              "Procured lint cotton (MT)",
              "Lint cotton produced (MT)",
              "Lint cotton unprocessed (MT)",
              "Lint cotton sold (MT)",
              "Actual Lint cotton in stock (MT)",
              "Lint cotton procured from other ginners (MT)",
              "Lint cotton greyed out quantity (MT)"
            ]);
          
        headerRow.font = { bold: true };

        const [countResult, rows] = await Promise.all([
          sequelize.query(countQuery, {
            type: sequelize.QueryTypes.SELECT,
          }),
          sequelize.query(dataQuery, {
            replacements: { limit, offset },
            type: sequelize.QueryTypes.SELECT,
          })
        ]);


  const totalCount = countResult && countResult.length > 0 ? countResult.length : 0;    

        let totals = {
        allocated_lint_cotton_mt: 0,
        procurement_seed_cotton_mt: 0,
        procured_lint_cotton_mt: 0,
        produced_lint_cotton_mt: 0,
        unprocessed_lint_cotton_mt: 0,
        total_lint_cotton_sold_mt: 0,
        actual_lint_stock_mt: 0,
        total_qty_lint_received_mt: 0,
        greyout_qty: 0
      };
        // // Append data to worksheet
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
              actual_lint_stock_mt: Number(formatDecimal(item.actual_lint_stock_mt)),
              total_qty_lint_received_mt: Number(formatDecimal(item.total_qty_lint_received_mt)),
              greyout_qty: Number(formatDecimal(item.greyout_qty))
            };

          totals.allocated_lint_cotton_mt += item.allocated_lint_cotton_mt ? Number(item.allocated_lint_cotton_mt) : 0;
          totals.procurement_seed_cotton_mt += item.procurement_seed_cotton_mt ? Number(item.procurement_seed_cotton_mt) : 0;
          totals.procured_lint_cotton_mt += item.procured_lint_cotton_mt ? Number(item.procured_lint_cotton_mt) : 0;
          totals.produced_lint_cotton_mt += item.produced_lint_cotton_mt ? Number(item.produced_lint_cotton_mt) : 0;
          totals.unprocessed_lint_cotton_mt += item.unprocessed_lint_cotton_mt ? Number(item.unprocessed_lint_cotton_mt) : 0;
          totals.total_lint_cotton_sold_mt += item.total_lint_cotton_sold_mt ? Number(item.total_lint_cotton_sold_mt) : 0;
          totals.actual_lint_stock_mt += item.actual_lint_stock_mt ? Number(item.actual_lint_stock_mt) : 0;
          totals.total_qty_lint_received_mt += item.total_qty_lint_received_mt ? Number(item.total_qty_lint_received_mt) : 0; 
          totals.greyout_qty += item.greyout_qty ? Number(item.greyout_qty) : 0;        
          
          worksheet.addRow(Object.values(rowValues));
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
          actual_lint_stock_mt: Number(formatDecimal(totals.actual_lint_stock_mt)),
          total_qty_lint_received_mt: Number(formatDecimal(totals.total_qty_lint_received_mt)),
          greyout_qty: Number(formatDecimal(totals.greyout_qty)),
        });

        worksheet.addRow(rowValues).eachCell((cell, colNumber) => { cell.font = { bold: true } });

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
        return res.status(200).send({
          success: true,
          messgage: "File successfully Generated",
          data: process.env.BASE_URL + "excel-ginner-details-sheet.xlsx",
        });
      

    } catch (error: any) {
      console.log(error);
      return res.sendError(res, error.message, error);
    }
  }

export {
  exportLoad,
  fetchConsolidatedDetailsGinnerSpinnerPagination,
  exportConsolidatedDetailsGinnerSpinner,
  fetchSpinnerDetailsPagination,
  exportSpinnerDetails,
  fetchConsolidatedDetailsFarmerGinnerPagination,
  exportConsolidatedDetailsFarmerGinner,
  fetchGinnerDetailsPagination,
  exportGinnerDetails
};

