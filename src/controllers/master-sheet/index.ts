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
          "$sales.buyer$": { [Op.in]: spinnerIds },
          ...baleCondition,
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
            group: ["sales.buyer"],
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
            group: ["spinprocess.spinner_id"],
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
};

export {
  fetchConsolidatedDetailsGinnerSpinnerPagination,
  exportConsolidatedDetailsGinnerSpinner,
  fetchSpinnerDetailsPagination,
  exportSpinnerDetails
};

