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

const fetchBaleProcess = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { ginnerId, seasonId, programId, brandId, countryId, startDate, endDate }: any = req.query;
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
            gp.from_date,
            gp.to_date,
            gp."createdAt" AS created_date,
            s.name AS season_name,
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
        ${whereClause}
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
              (
                (
                  gp.scd_verified_status = true AND gb.scd_verified_status IS NOT TRUE
                )
                OR
                (
                  gp.scd_verified_status = false AND gb.scd_verified_status IS FALSE
                )
              )
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
                  gb.process_id
          ),
          gin_to_gin_sales_data AS (
                SELECT
                    gb.process_id,
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
                    gb.process_id
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
              (COALESCE(gb.lint_quantity, 0) - (COALESCE(sd.lint_quantity_sold, 0) + COALESCE(gbg.total_qty, 0) + COALESCE(gtg.lint_qty, 0))) AS lint_stock,
              (COALESCE(gd.no_of_bales, 0) - (COALESCE(sd.sold_bales, 0) + COALESCE(gbg.no_of_bales, 0) + COALESCE(gtg.no_of_bales, 0))) AS bale_stock,
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
              sold_data sd ON gd.process_id = sd.process_id
          LEFT JOIN 
              gin_bale_greyout_data gbg ON gd.process_id = gbg.process_id
          LEFT JOIN 
              gin_to_gin_sales_data gtg ON gd.process_id = gtg.process_id
          LEFT JOIN
              countries c ON gd.country_id = c.id 
          LEFT JOIN
              states s ON gd.state_id = s.id  
          ORDER BY gd.process_id DESC
          LIMIT :limit OFFSET :offset
          `, {
      replacements: { limit: limit, offset },
      type: sequelize.QueryTypes.SELECT,
    });
    return res.sendPaginationSuccess(res, rows, count);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message, error);
  }
};

const fetchGinHeapReport = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { ginnerId, seasonId, programId, brandId, startDate, endDate }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { ginner_heap_no: { [Op.iLike]: `%${searchTerm}%` } },
        { reel_heap_no: { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    if (ginnerId) {
      whereCondition.ginner_id = ginnerId;
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

    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$ginner.brand$"] = { [Op.overlap]: idArray };
    }

    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      whereCondition[Op.and] = [
        { heap_starting_date: { [Op.lte]: endOfDay } },
        { heap_ending_date: { [Op.gte]: startOfDay } }
      ];
    }

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
      }
    ];
    //fetch data with pagination
    if (req.query.pagination === "true") {
      const { count, rows } = await GinHeap.findAndCountAll({
        where: whereCondition,
        include: include,
        offset: offset,
        limit: limit,
        order: [["id", "desc"]],
      });
      let data = [];

      for await (let row of rows) {
        if (row.dataValues?.weighbridge_village) {
          const villageIds = row.dataValues.weighbridge_village
            .split(",")
            .map((id: string) => id.trim()) 
            .filter((id: string) => id !== ""); 


          const villages = await Village.findAll({
            where: { id: { [Op.in]: villageIds } },
            attributes: ["id", "village_name"],
          });

          const uniqueVillageNames = [...new Set(villages.map((v:any) => v.village_name))];
          row.dataValues.village_names = uniqueVillageNames.join(", ");
        }
        data.push(row);
      }
      return res.sendPaginationSuccess(res, data, count);
    } else {
      const gin = await GinHeap.findAll({
        where: whereCondition,
        include: include,
        order: [["id", "desc"]],
      });

      let data = [];

      for await (let row of gin) {
        if (row.dataValues?.weighbridge_village) {
          const villageIds = row.dataValues.weighbridge_village
            .split(",")
            .map((id: string) => id.trim()) 
            .filter((id: string) => id !== ""); 


          const villages = await Village.findAll({
            where: { id: { [Op.in]: villageIds } },
            attributes: ["id", "village_name"],
          });

          const uniqueVillageNames = [...new Set(villages.map((v:any) => v.village_name))];
          row.dataValues.village_names = uniqueVillageNames.join(", ");
        }
        data.push(row);
      }
      return res.sendSuccess(res, data);
    }
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.message, error);
  }
};

       

const exportGinHeapReport = async (req: Request, res: Response) => {
  const excelFilePath = path.join(
    "./upload",
    "excel-heap-report.xlsx"
  );

  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { exportType, ginnerId, seasonId, programId, brandId, startDate, endDate }: any =
    req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {

    if (exportType === "all") {
      return res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "heap-report.xlsx",
      });
    } else {

      if (searchTerm) {
        whereCondition[Op.or] = [
          { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
          { ginner_heap_no: { [Op.iLike]: `%${searchTerm}%` } },
          { reel_heap_no: { [Op.iLike]: `%${searchTerm}%` } },
        ];
      }

      if (ginnerId) {
        const idArray: number[] = ginnerId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$sales.ginner_id$"] = { [Op.in]: idArray };
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

      if (brandId) {
        const idArray: number[] = brandId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$ginner.brand$"] = { [Op.overlap]: idArray };
      }

      if (startDate && endDate) {
        const startOfDay = new Date(startDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        whereCondition[Op.and] = [
          { heap_starting_date: { [Op.lte]: endOfDay } },
          { heap_ending_date: { [Op.gte]: startOfDay } }
        ];
      }

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
        where: whereCondition,
        include: include,
        order: [["id", "desc"]],
        offset: offset,
        limit: limit,
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
          weighbridge_vehicle_no: item.dataValues.weighbridge_vehicle_no
        });
        worksheet.addRow(rowValues);
      }

      const rowValues = Object.values({
        index: "Totals:", country: "", state: "", created_date:"", season: "", ginner_heap_no:"",
        reel_heap_no:"", ginner_name:"", village_name: "", 
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
      return res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "excel-heap-report.xlsx",
      });
    }


    
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message, error);
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
  const isOrganic = req.query.isOrganic || false;
  const isBrand = req.query.isBrand || false;
  const isAdmin = req.query.isAdmin || false;

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

      // Create the excel workbook file
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet1");
     
      /*
      if (isOrganic === 'true') {
        worksheet.mergeCells('A1:N1');
      }else if (isBrand === 'true') {
        worksheet.mergeCells('A1:Q1');
      }
      else if(isAdmin === 'true') {
        worksheet.mergeCells('A1:AA1');
      }
      else {
        worksheet.mergeCells('A1:AB1');
      }
      const mergedCell = worksheet.getCell('A1');
      mergedCell.value = 'CottonConnect | Ginner Bale Process Report';
      mergedCell.font = { bold: true };
      mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
      */
      // Set bold font for header row
      let headerRow;
     if (isOrganic === 'true') {
        headerRow = worksheet.addRow([
        "Sr No.","Country","State", "Process Date", "Data Entry Date and Time", "No. of Days", "Lint Production Start Date", "Lint Production End Date", "Lint process Season choosen", "Ginner Name", "Heap Number", "Gin Lot No", "Gin Press No",  "No of Bales", "Lint Quantity(Kgs)", "Programme", "Grey Out Status"
        ]);
      }
      else if (isBrand === 'true') {
        headerRow = worksheet.addRow([
          "Sr No.","Country","State", "Process Date", "Data Entry Date and Time", "No. of Days", "Lint Production Start Date", "Lint Production End Date", "Lint process Season choosen", "Ginner Name", "Heap Number", "Gin Lot No", "Gin Press No", "REEL Lot No", "REEL Press Nos", "No of Bales", "Lint Quantity(Kgs)", "Programme", "Grey Out Status"
        ]);
      } 
      else if(isAdmin === 'true') {
        headerRow = worksheet.addRow([
          "Sr No.","Country","State", "Process Date", "Data Entry Date and Time", "No. of Days", "Lint Production Start Date", "Lint Production End Date", "Seed Cotton Consumed Season", "Lint process Season choosen", "Ginner Name", "Heap Number", "Gin Lot No", "Gin Press No", "REEL Lot No", "REEL Press Nos", "No of Bales", "Lint Quantity(Kgs)", "Total Seed Cotton Consumed(Kgs)", "GOT", "Total lint cotton sold(Kgs)", "Total Bales Sold", "Total lint cotton rejected(Kgs)", "Total Bales Rejected", "Total lint cotton transfered(Kgs)", "Total Bales Transfered", "Total lint cotton in stock(Kgs)", "Total Bales in stock", "Programme","Grey Out Status"
        ]);
      }else {
        headerRow = worksheet.addRow([
          "Sr No.","Country","State", "Process Date", "Data Entry Date and Time", "No. of Days", "Lint Production Start Date", "Lint Production End Date", "Seed Cotton Consumed Season", "Lint process Season choosen", "Ginner Name", "Heap Number", "Gin Lot No", "Gin Press No", "REEL Lot No", "REEL Press Nos", "No of Bales", "Lint Quantity(Kgs)", "Total Seed Cotton Consumed(Kgs)", "GOT", "Total lint cotton sold(Kgs)", "Total Bales Sold", "Total lint cotton rejected(Kgs)", "Total Bales Rejected", "Total lint cotton transfered(Kgs)", "Total Bales Transfered", "Total lint cotton in stock(Kgs)", "Total Bales in stock", "Programme", "Village", "Grey Out Status"
        ]);
      }
      headerRow.font = { bold: true };

      const rows = await sequelize.query(
        `WITH gin_process_data AS (
          SELECT
              gp.id AS process_id,
              gp.date,
              gp.from_date,
              gp.to_date,
              gp."createdAt" AS created_date,
              s.name AS season_name,
              g.name AS ginner_name,
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
    
          ${whereClause}
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
              (
                (
                  gp.scd_verified_status = true AND gb.scd_verified_status IS NOT TRUE
                )
                OR
                (
                  gp.scd_verified_status = false AND gb.scd_verified_status IS FALSE
                )
              )
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
                  gb.process_id
          ),
          gin_to_gin_sales_data AS (
              SELECT
                  gb.process_id,
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
                  gb.process_id
            )
          SELECT
              gd.process_id,
              gd.date AS date,
              gd.from_date AS from_date,
              gd.to_date AS to_date,
              gd.created_date AS "createdAt",
              EXTRACT(DAY FROM ( gd.created_date - gd.date)) AS no_of_days,
              gd.season_name AS season,
              gd.ginner_name AS ginner_name,
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
              (COALESCE(gb.lint_quantity, 0) - (COALESCE(sd.lint_quantity_sold, 0) + COALESCE(gbg.total_qty, 0) + COALESCE(gtg.lint_qty, 0))) AS lint_stock,
              (COALESCE(gd.no_of_bales, 0) - (COALESCE(sd.sold_bales, 0) + COALESCE(gbg.no_of_bales, 0) + COALESCE(gtg.no_of_bales, 0))) AS bale_stock,
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
              sold_data sd ON gd.process_id = sd.process_id
          LEFT JOIN 
              gin_bale_greyout_data gbg ON gd.process_id = gbg.process_id
          LEFT JOIN 
              gin_to_gin_sales_data gtg ON gd.process_id = gtg.process_id
          LEFT JOIN
              countries c ON gd.country_id = c.id 
          LEFT JOIN
              states s ON gd.state_id = s.id  
          ORDER BY gd.process_id DESC
          LIMIT :limit OFFSET :offset
            `, {
        replacements: { limit: limit, offset },
        type: sequelize.QueryTypes.SELECT,
      });

      let totals = {
        total_no_of_bales: 0,
        total_lint_quantity: 0,
        total_seedConsmed: 0,
        total_sold_bales: 0,
        total_lint_quantity_sold: 0,
        total_lint_qty_transfered: 0, 
        total_bales_transfered:0,
        total_lint_stock:0,
        total_bale_stock:0,
      };



      // Append data to worksheet
      for await (const [index, item] of rows.entries()) {
        let rowValues;
       if (isOrganic === 'true') {
          rowValues = {
            index: index + 1,
            country: item.country_name ? item.country_name : "",
            state: item.state_name ? item.state_name : "",
            date: item.date ? item.date : "",
            created_date: item.createdAt ? item.createdAt : "",
            no_of_days: item.no_of_days ? Number(item.no_of_days) : "",
            from_date: item.from_date ? item.from_date : "",
            to_date: item.to_date ? item.to_date : "",
            season: item.season ? item.season : "",
            ginner: item.ginner_name ? item.ginner_name : "",
            heap: item.heap_number ? item.heap_number : '',
            lot_no: item.lot_no ? item.lot_no : "",
            press_no: item.press_no !== "NaN-NaN" ? item.press_no : item?.gin_press_no,
            reel_press_no: item.reel_press_no ? item.reel_press_no : "",
            noOfBales: item.no_of_bales ? Number(item.no_of_bales) : 0,
            lint_quantity: item.lint_quantity ? Number(item.lint_quantity) : 0,
            program: item.program ? item.program : "",
            greyout_status: item.greyout_status ? "Yes" : "No",
          };

         
        }
        else if (isBrand === 'true') {
          rowValues = {
            index: index + 1,
            country: item.country_name ? item.country_name : "",
            state: item.state_name ? item.state_name : "",
            date: item.date ? item.date : "",
            created_date: item.createdAt ? item.createdAt : "",
            no_of_days: item.no_of_days ? Number(item.no_of_days) : "",
            from_date: item.from_date ? item.from_date : "",
            to_date: item.to_date ? item.to_date : "",
            season: item.season ? item.season : "",
            ginner: item.ginner_name ? item.ginner_name : "",
            heap: item.heap_number ? item.heap_number : '',
            lot_no: item.lot_no ? item.lot_no : "",
            press_no: item.press_no !== "NaN-NaN" ? item.press_no : item?.gin_press_no,
            reel_lot_no: item.reel_lot_no ? item.reel_lot_no : "",
            reel_press_no: item.reel_press_no ? item.reel_press_no : "",
            noOfBales: item.no_of_bales ? Number(item.no_of_bales) : 0,
            lint_quantity: item.lint_quantity ? Number(item.lint_quantity) : 0,
            program: item.program ? item.program : "",
            greyout_status: item.greyout_status ? "Yes" : "No",
          };
        
        }
        else if(isAdmin === 'true'){
          rowValues = {
            index: index + 1,
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
            lint_stock: item.lint_stock && Number(item.lint_stock) > 0 ? Number(item.lint_stock) : 0,
            bale_stock: item.bale_stock && Number(item.bale_stock) > 0 ? Number(item.bale_stock) : 0,
            program: item.program ? item.program : "",
            greyout_status: item.greyout_status ? "Yes" : "No",
          };         
        }
        else {
            rowValues = {
              index: index + 1,
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
              lint_stock: item.lint_stock && Number(item.lint_stock) > 0 ? Number(item.lint_stock) : 0,
              bale_stock: item.bale_stock && Number(item.bale_stock) > 0 ? Number(item.bale_stock) : 0,
              program: item.program ? item.program : "",
              village_names: item.village_names && item.village_names.length > 0 ? item.village_names.join(", ") : "",
              greyout_status: item.greyout_status ? "Yes" : "No",
            };
          }
        totals.total_no_of_bales += item.no_of_bales? Number(item.no_of_bales): 0;
        totals.total_lint_quantity += item.lint_quantity? Number(item.lint_quantity): 0;
        totals.total_seedConsmed +=  item.total_qty ? Number(item.total_qty) : 0;
        totals.total_lint_quantity_sold +=  item.lint_quantity_sold? Number(item.lint_quantity_sold):0;
        totals.total_lint_qty_transfered += item.lint_qty_transfered? Number(item.lint_qty_transfered):0;
        totals.total_sold_bales += item.sold_bales?Number(item.sold_bales):0;
        totals.total_bales_transfered += item.bales_transfered?Number(item.bales_transfered):0;
        totals.total_lint_stock += item.lint_stock?Number(item.lint_stock):0;
        totals.total_bale_stock += item.bale_stock?Number(item.bale_stock):0;
        
        worksheet.addRow(Object.values(rowValues));
      }

      let rowValues;

      if (isOrganic === 'true') {
        rowValues = Object.values({
          index: "Total: ",
          country: "",
          state: "",
          date: "",
          created_date: "",
          no_of_days: "",
          from_date: "",
          to_date:  "",
          season: "",
          ginner: "",
          heap: '',
          lot_no: "",
          press_no: "",
          reel_press_no_no : "",
          noOfBales: Number(formatDecimal(totals.total_no_of_bales)),
          lint_quantity: Number(formatDecimal(totals.total_lint_quantity)),
          program:"",
          greyout_status: "",
        });

       
      }
      else if (isBrand === 'true') {
        rowValues = Object.values({
          index: "Total: ",
          country: "",
          state: "",
          date: "",
          created_date: "",
          no_of_days: "",
          from_date: "",
          to_date:  "",
          season: "",
          ginner: "",
          heap: '',
          lot_no: "",
          press_no: "",
          reel_lot_no: "",
          reel_press_no: "",
          noOfBales: Number(formatDecimal(totals.total_no_of_bales)),
          lint_quantity: Number(formatDecimal(totals.total_lint_quantity)),
          program: "",
          greyout_status: "",
        });
      
      }
      else if(isAdmin === 'true'){
        rowValues = Object.values({
          index: "Total: ",
          country: "",
          state: "",
          date: "",
          created_date: "",
          no_of_days: "",
          from_date: "",
          to_date:  "",
          seed_consumed_seasons: "",
          season: "",
          ginner: "",
          heap: '',
          lot_no: "",
          press_no: "",
          reel_lot_no: "",
          reel_press_no: "",
          noOfBales: Number(formatDecimal(totals.total_no_of_bales)),
          lint_quantity: Number(formatDecimal(totals.total_lint_quantity)),
          seedConsmed: Number(formatDecimal(totals.total_seedConsmed)),
          got: "",
          lint_quantity_sold: Number(formatDecimal(totals.total_lint_quantity_sold)),
          sold_bales: Number(formatDecimal(totals.total_sold_bales)),
          lint_qty_greyout: "",
          greyout_bales: "",
          lint_qty_transfered: Number(formatDecimal(totals.total_lint_qty_transfered)),
          bales_transfered:  Number(formatDecimal(totals.total_bales_transfered)),
          lint_stock: Number(formatDecimal(totals.total_lint_stock)),
          bale_stock:  Number(formatDecimal(totals.total_bale_stock)),
          program: "",
          greyout_status: "",
        });         
      }
      else {
          rowValues = Object.values({
            index: "Total: ",
            country: "",
            state: "",
            date: "",
            created_date: "",
            no_of_days: "",
            from_date: "",
            to_date:  "",
            seed_consumed_seasons:"",
            season: "",
            ginner: "",
            heap: '',
            lot_no: "",
            press_no: "",
            reel_lot_no: "",
            reel_press_no: "",
            noOfBales: Number(formatDecimal(totals.total_no_of_bales)),
            lint_quantity: Number(formatDecimal(totals.total_lint_quantity)),
            seedConsmed: Number(formatDecimal(totals.total_seedConsmed)),
            got: "",
            lint_quantity_sold: Number(formatDecimal(totals.total_lint_quantity_sold)),
            sold_bales: Number(formatDecimal(totals.total_sold_bales)),
            lint_qty_greyout: "",
            greyout_bales: "",
            lint_qty_transfered: Number(formatDecimal(totals.total_lint_qty_transfered)),
            bales_transfered: Number(formatDecimal(totals.total_bales_transfered)),
            lint_stock: Number(formatDecimal(totals.total_lint_stock)),
            bale_stock: Number(formatDecimal(totals.total_bale_stock)),
            program: "",
            village_names: "",
            greyout_status: "",
          });
        }

        worksheet.addRow(rowValues).eachCell((cell, colNumber) => { cell.font={bold:true}});;
      // Define a border style
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
    return res.sendError(res, error.message, error);

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
      },
    ];
    //fetch data with pagination

    const { count, rows }: any = await BaleSelection.findAndCountAll({
      attributes: [
        [Sequelize.literal('"sales"."id"'), "sales_id"],
        [Sequelize.literal('"sales"."date"'), "date"],
        [Sequelize.literal('"sales"."createdAt"'), "createdAt"],
        [Sequelize.literal('EXTRACT(DAY FROM ("sales"."createdAt" - "sales"."date"))'), "no_of_days"],  
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
        "sales.buyerdata_ginner.id",
        "sales.ginner.country.id",
        "sales.ginner.state.id",
      ],
      order: [["sales_id", "desc"]],
      offset: offset,
      limit: limit,
    });

    return res.sendPaginationSuccess(res, rows, count.length);
  } catch (error: any) {
    return res.sendError(res, error.message, error);
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
  const isOrganic = req.query.isOrganic || false;

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
      /*
      if (isOrganic === 'true') {
        worksheet.mergeCells('A1:N1');
      } else {
        worksheet.mergeCells("A1:O1");
      }
      const mergedCell = worksheet.getCell("A1");
      mergedCell.value = "CottonConnect | Ginner Pending Sales Report";
      mergedCell.font = { bold: true };
      mergedCell.alignment = { horizontal: "center", vertical: "middle" };

      */
      // Set bold font for header row
      let headerRow;
      if (isOrganic === 'true') {
        headerRow = worksheet.addRow([
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
          "No of Bales",
          "Press/Bale No",
          "Rate/Kg",
          "Total Quantity",
          "Programme",
          "Status",
        ]);
      }
      else{
       headerRow = worksheet.addRow([
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
        "Status",
      ]);
    }
      headerRow.font = { bold: true };

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
          "sales.buyerdata_ginner.id",
          "sales.ginner.country.id",
          "sales.ginner.state.id",
        ],
        order: [["sales_id", "desc"]],
        offset: offset,
        limit: limit,
      });

      let totals = {  
        total_no_of_bales: 0,
        total_lint_quantity: 0,
        total_rate:0,
      }

      // Append data to worksheet
      for await (const [index, item] of rows.entries()) {
        let rowValues;
        if(isOrganic === 'true'){
          rowValues = Object.values({
            index: index + 1,
            country: item.dataValues.country_name?item.dataValues.country_name:"",
            state: item.dataValues.state_name?item.dataValues.state_name:"",
            date: item.dataValues.date ? item.dataValues.date : "",
            season: item.dataValues.season_name ? item.dataValues.season_name : "",
            ginner: item.dataValues.ginner ? item.dataValues.ginner : "",
            invoice: item.dataValues.invoice_no ? item.dataValues.invoice_no : "",
            buyer_type: item.dataValues.buyer_type === 'Ginner' ? 'Ginner' : 'Spinner',
            buyer: item.dataValues.buyerdata ? item.dataValues.buyerdata : item.dataValues.buyer_ginner ? item.dataValues.buyer_ginner : '',
            lot_no: item.dataValues.lot_no ? item.dataValues.lot_no : "",
            no_of_bales: item.dataValues.no_of_bales ? item.dataValues.no_of_bales : "",
            press_no: item.dataValues.press_no ? item.dataValues.press_no : "",
            rate: item.dataValues.rate ? Number(item.dataValues.rate) : 0,
            total_qty: item.dataValues.total_qty ? item.dataValues.total_qty : 0,
            program: item.dataValues.program ? item.dataValues.program : "",
            status: item.dataValues.status ? item.dataValues.status : "",
          });
        }
        else{
        rowValues = Object.values({
          index: index + 1,
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
          no_of_bales: item.dataValues.no_of_bales ? item.dataValues.no_of_bales : "",
          press_no: item.dataValues.press_no ? item.dataValues.press_no : "",
          rate: item.dataValues.rate ? Number(item.dataValues.rate) : 0,
          total_qty: item.dataValues.total_qty ? item.dataValues.total_qty : 0,
          program: item.dataValues.program ? item.dataValues.program : "",
          status: item.dataValues.status ? item.dataValues.status : "",
        });
      }

       totals.total_no_of_bales += Number(item.dataValues.no_of_bales);
       totals.total_lint_quantity += Number(item.dataValues.total_qty);
       totals.total_rate += Number(item.dataValues.rate);

        worksheet.addRow(rowValues);
      }

      let rowValues;
      if(isOrganic === 'true'){
        rowValues = Object.values({
          index: "Total: ",
          country: "",
          state: "",
          date:  "",
          season:  "",
          ginner:  "",
          invoice:  "",
          buyer_type: "",
          buyer:  '',
          lot_no: "",
          no_of_bales: Number(formatDecimal(totals.total_no_of_bales)),
          press_no: "",
          rate: Number(formatDecimal(totals.total_rate)),
          total_qty: Number(formatDecimal(totals.total_lint_quantity)),
          program:  "",
          status:"",
        });
      }
      else{
      rowValues = Object.values({
        index: "Total: ",
        country: "",
        state: "",
        date:  "",
        season:  "",
        ginner:  "",
        invoice:  "",
        buyer_type: "",
        buyer:  '',
        lot_no:  "",
        reel_lot_no: "",
        no_of_bales: Number(formatDecimal(totals.total_no_of_bales)),
        press_no:  "",
        rate: Number(formatDecimal(totals.total_rate)),
        total_qty: Number(formatDecimal(totals.total_lint_quantity)),
        program: "",
        status: "",
      });
    }

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
    return res.sendError(res, error.message, error);

  }
};


const fetchGinnerProcessGreyOutReport = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const { ginnerId, seasonId, programId, brandId, countryId }: any =
    req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = [];
  try {
    if (searchTerm) {
      whereCondition.push(`
        (
          g.name ILIKE '%${searchTerm}%' OR
          s.name ILIKE '%${searchTerm}%' OR
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


    const whereClause = whereCondition.length > 0 ? `AND ${whereCondition.join(' AND ')}` : '';

    const countQuery = `
      SELECT COUNT(*) AS total_count
      FROM gin_processes gp
      LEFT JOIN "gin-bales" gb ON gb.process_id = gp.id AND gb.sold_status = false
      LEFT JOIN seasons s ON gp.season_id = s.id
      LEFT JOIN ginners g ON gp.ginner_id = g.id
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
        ${whereClause}
      GROUP BY gp.id, gp.ginner_id, gp.season_id, gp.lot_no, gp.reel_lot_no, gp.press_no, s.name, g.name, gp.no_of_bales,gp.greyout_status, gp.scd_verified_status,gp.verification_status`;

    const dataQuery = `
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
          ${whereClause}
        GROUP BY gp.id, gp.ginner_id, gp.season_id, gp.lot_no, gp.reel_lot_no, gp.press_no, s.name, g.name, gp.no_of_bales,gp.greyout_status, gp.scd_verified_status,gp.verification_status
        ORDER BY gp.id DESC
        LIMIT ${limit} OFFSET ${offset}
  ;`

  const [countResult, rows] = await Promise.all([
    sequelize.query(countQuery, {
      type: sequelize.QueryTypes.SELECT,
    }),
    sequelize.query(dataQuery, {
      type: sequelize.QueryTypes.SELECT,
    })
  ]);

  const totalCount = countResult && countResult.length > 0 ? Number(countResult.length) : 0;

    return res.sendPaginationSuccess(res, rows, totalCount);
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message, error);
  }
};

const fetchSpinnerProcessGreyOutReport = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const { spinnerId, seasonId, programId, brandId, countryId }: any =
    req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$spinner.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    if (spinnerId) {
      const idArray: number[] = spinnerId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.spinner_id = { [Op.in]: idArray };
    } else {
      whereCondition.spinner_id = {
        [Op.ne]: null,
      };
    }

    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$spinner.brand$"] = { [Op.overlap]: idArray };
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$spinner.country_id$"] = { [Op.in]: idArray };
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
        as: "spinner",
        attributes: ["id", "name"],
      },
    ];

    const { count, rows } = await SpinProcess.findAndCountAll({
      where: whereCondition,
      include: include,
      offset: offset,
      limit: limit,
      order: [['id', 'desc']]
    });
    return res.sendPaginationSuccess(res, rows, count);
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message, error);
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
  const searchCondition: any = {};
  try {
    if (searchTerm) {
      searchCondition[Op.or] = [
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$buyerdata.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { press_no: { [Op.iLike]: `%${searchTerm}%` } },
        { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
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

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.program_id = { [Op.in]: idArray };
    }

    whereCondition[Op.or] = [
      { greyout_status: true, ...searchCondition },
      {
        greyout_status: false,
        greyed_out_qty: { [Op.gt]: 0 },
        ...searchCondition
      },
    ];

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

     // Add the conditional attribute using Sequelize.literal
     const attributes = [
      "id",
      "date",
      'season_id',
      'ginner_id',
      'buyer',
      "lot_no",
      "invoice_no",
      "reel_lot_no",
      "press_no",
      "accepted_bales_weight",
      "no_of_bales",
      "total_qty",
      "qty_stock",
      "greyed_out_qty",
      "ps_verified_status",
      "ps_verified_total_qty",
      "qty_stock_before_verification",
      "verification_status",
      "greyout_status",
      "status",
      [
        Sequelize.literal(`
          CASE 
            WHEN greyout_status = true THEN qty_stock
            ELSE greyed_out_qty
          END
        `),
        "lint_greyout_qty",
      ],
    ];

    const { count, rows } = await GinSales.findAndCountAll({
      where: whereCondition,
      include: include,
      attributes: attributes,
      offset: offset,
      limit: limit,
      order: [['id', 'desc']]
    });
    return res.sendPaginationSuccess(res, rows, count);
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message, error);
  }
};

// const fetchGinSalesPagination = async (req: Request, res: Response) => {
//   const searchTerm = req.query.search || "";
//   const page = Number(req.query.page) || 1;
//   const limit = Number(req.query.limit) || 10;
//   const { ginnerId, seasonId, programId, brandId, countryId, startDate, endDate }: any = req.query;
//   const offset = (page - 1) * limit;
//   const whereCondition: any = [];
//   try {
//     if (searchTerm) {
//       whereCondition.push(`
//         (
//           ginner.name ILIKE '%${searchTerm}%' OR
//           spinner.name ILIKE '%${searchTerm}%' OR
//           season.name ILIKE '%${searchTerm}%' OR
//           program.program_name ILIKE '%${searchTerm}%' OR
//           gs.lot_no ILIKE '%${searchTerm}%' OR
//           gs.reel_lot_no ILIKE '%${searchTerm}%' OR
//           gs.press_no ILIKE '%${searchTerm}%' OR
//           gs.invoice_no ILIKE '%${searchTerm}%' OR
//           gs.vehicle_no ILIKE '%${searchTerm}%' OR
//           gs.status ILIKE '%${searchTerm}%'
//         )
//       `);
//     }

//     if (brandId) {
//       const idArray: number[] = brandId
//         .split(",")
//         .map((id: any) => parseInt(id, 10));
//       whereCondition.push(`ginner.brand && ARRAY[${idArray.join(',')}]`);
//     }

//     if (countryId) {
//       const idArray: number[] = countryId
//         .split(",")
//         .map((id: any) => parseInt(id, 10));
//       whereCondition.push(`ginner.country_id IN (${idArray.join(',')})`);
//     }

//     if (seasonId) {
//       const idArray = seasonId.split(",").map((id: any) => parseInt(id, 10));
//       whereCondition.push(`gs.season_id IN (${idArray.join(',')})`);
//     }

//     if (ginnerId) {
//       const idArray = ginnerId.split(",").map((id: any) => parseInt(id, 10));
//       whereCondition.push(`gs.ginner_id IN (${idArray.join(',')})`);
//     }


//     if (programId) {
//       const idArray = programId.split(",").map((id: any) => parseInt(id, 10));
//       whereCondition.push(`gs.program_id IN (${idArray.join(',')})`);
//     }

//     if (startDate && endDate) {
//       const startOfDay = new Date(startDate);
//       startOfDay.setUTCHours(0, 0, 0, 0);
//       const endOfDay = new Date(endDate);
//       endOfDay.setUTCHours(23, 59, 59, 999);
//       whereCondition.push(`gs."date" BETWEEN '${startOfDay.toISOString()}' AND '${endOfDay.toISOString()}'`);
//     }

//     whereCondition.push(`gs.status <> 'To be Submitted'`);
//     whereCondition.push(`gs.id IS NOT NULL`);

//     const whereClause = whereCondition.length > 0 ? `WHERE ${whereCondition.join(' AND ')}` : '';

//     const countQuery = `
//             SELECT COUNT(*) AS total_count
//             FROM bale_selections bs
//             INNER JOIN gin_sales gs ON bs.sales_id = gs.id
//             LEFT JOIN seasons season ON gs.season_id = season.id
//             LEFT JOIN ginners ginner ON gs.ginner_id = ginner.id
//             LEFT JOIN spinners spinner ON gs.buyer = spinner.id
//             LEFT JOIN programs program ON gs.program_id = program.id
//             ${whereClause}
//             GROUP BY 
//               gs.id, spinner.id, season.id, ginner.id, program.id`;



//     //without seed cotton consumed
//     const dataQuery = `
//       SELECT 
//           gs.id AS ginsale_id,
//           gs.date AS date,
//           gs."createdAt" AS "createdAt",
//           season.name AS season_name,
//           program.program_name AS program,
//           ginner.id AS ginner_id,
//           ginner.name AS ginner,
//           gs.total_qty AS total_qty,
//           spinner.id AS spinner_id,
//           spinner.name AS buyerdata,
//           gs.buyer_type AS buyer_type,
//           buyerginner.id AS buyer_ginner_id,
//           buyerginner.name AS buyer_ginner,
//           gs.qr AS qr,
//           gs.invoice_no AS invoice_no,
//           gs.lot_no AS lot_no,
//           gs.rate AS rate,
//           gs.candy_rate AS candy_rate,
//           gs.total_qty AS lint_quantity,
//           gs.no_of_bales AS no_of_bales,
//           gs.sale_value AS sale_value,
//           gs.press_no AS press_no,
//           gs.qty_stock AS qty_stock,
//           gs.weight_loss AS weight_loss,
//           gs.invoice_file AS invoice_file,
//           gs.vehicle_no AS vehicle_no,
//           gs.transporter_name AS transporter_name,
//           gs.transaction_agent AS transaction_agent,
//           gs.status AS status,
//           ARRAY_AGG(DISTINCT gp.id) AS process_ids,
//           STRING_AGG(DISTINCT ss.name, ',') AS lint_process_seasons,
//           STRING_AGG(DISTINCT gp.reel_lot_no, ',') AS reel_lot_no,
//           COALESCE(
//               SUM(
//                 CASE
//                   WHEN gb.old_weight IS NOT NULL THEN CAST(gb.old_weight AS DOUBLE PRECISION)
//                   ELSE CAST(gb.weight AS DOUBLE PRECISION)
//                 END
//               ), 0
//           ) AS total_old_weight
//       FROM bale_selections bs
//       INNER JOIN gin_sales gs ON bs.sales_id = gs.id
//       LEFT JOIN seasons season ON gs.season_id = season.id
//       LEFT JOIN "gin-bales" gb ON bs.bale_id = gb.id
//       LEFT JOIN gin_processes gp ON gb.process_id = gp.id
//       LEFT JOIN seasons ss ON gp.season_id = ss.id
//       LEFT JOIN ginners ginner ON gs.ginner_id = ginner.id
//       LEFT JOIN ginners buyerginner ON gs.buyer_ginner = buyerginner.id
//       LEFT JOIN spinners spinner ON gs.buyer = spinner.id
//       LEFT JOIN programs program ON gs.program_id = program.id
//       ${whereClause}
//       GROUP BY 
//           gs.id, spinner.id, season.id, ginner.id, program.id, buyerginner.id
//       ORDER BY gs.id DESC
//       LIMIT ${limit} OFFSET ${offset}
//    ;`


//     const [countResult, rows] = await Promise.all([
//       sequelize.query(countQuery, {
//         type: sequelize.QueryTypes.SELECT,
//       }),
//       sequelize.query(dataQuery, {
//         type: sequelize.QueryTypes.SELECT,
//       })
//     ]);

//     const nData = [];

//     const totalCount = countResult && countResult.length > 0 ? Number(countResult.length) : 0;

//     // for await (let item of rows) {
//     //   const lotNo: string[] = item?.lot_no
//     //     .split(", ")
//     //     .map((id: any) => id);
//     //   let qualityReport = null;

//     //   if(item.process_ids && item.ginner_id && lotNo){
//     //     qualityReport = await QualityParameter.findAll({
//     //       where: {
//     //         process_id: { [Op.in]: item?.process_ids },
//     //         ginner_id: item?.ginner_id,
//     //         lot_no: { [Op.in]: lotNo },
//     //       },
//     //       raw: true
//     //     });
//     //   }

//     //   nData.push({
//     //     ...item,
//     //     quality_report: qualityReport ? qualityReport : null,
//     //   });
//     // }

//     // Apply pagination to the combined result

//     return res.sendPaginationSuccess(res, rows, totalCount);
//   } catch (error: any) {
//     console.log(error);
//     return res.sendError(res, error.message);
//   }
// };

const fetchGinSalesPagination = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { ginnerId, seasonId, programId, brandId, countryId, startDate, endDate }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = [];
  try {
    if (searchTerm) {
      whereCondition.push(`
        (
          ginner.name ILIKE '%${searchTerm}%' OR
          spinner.name ILIKE '%${searchTerm}%' OR
          season.name ILIKE '%${searchTerm}%' OR
          program.program_name ILIKE '%${searchTerm}%' OR
          gs.lot_no ILIKE '%${searchTerm}%' OR
          gs.reel_lot_no ILIKE '%${searchTerm}%' OR
          gs.press_no ILIKE '%${searchTerm}%' OR
          gs.invoice_no ILIKE '%${searchTerm}%' OR
          gs.vehicle_no ILIKE '%${searchTerm}%' OR
          gs.status ILIKE '%${searchTerm}%'
        )
      `);
    }

    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.push(`ginner.brand && ARRAY[${idArray.join(',')}]`);
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.push(`ginner.country_id IN (${idArray.join(',')})`);
    }

    if (seasonId) {
      const idArray = seasonId.split(",").map((id: any) => parseInt(id, 10));
      whereCondition.push(`gs.season_id IN (${idArray.join(',')})`);
    }

    if (ginnerId) {
      const idArray = ginnerId.split(",").map((id: any) => parseInt(id, 10));
      whereCondition.push(`gs.ginner_id IN (${idArray.join(',')})`);
    }


    if (programId) {
      const idArray = programId.split(",").map((id: any) => parseInt(id, 10));
      whereCondition.push(`gs.program_id IN (${idArray.join(',')})`);
    }

    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereCondition.push(`gs."date" BETWEEN '${startOfDay.toISOString()}' AND '${endOfDay.toISOString()}'`);
    }

    whereCondition.push(`gs.status <> 'To be Submitted'`);
    whereCondition.push(`gs.id IS NOT NULL`);

    const whereClause = whereCondition.length > 0 ? `WHERE ${whereCondition.join(' AND ')}` : '';

    const countQuery = `
            SELECT COUNT(*) AS total_count
            FROM bale_selections bs
            INNER JOIN gin_sales gs ON bs.sales_id = gs.id
            LEFT JOIN seasons season ON gs.season_id = season.id
            LEFT JOIN ginners ginner ON gs.ginner_id = ginner.id
            LEFT JOIN spinners spinner ON gs.buyer = spinner.id
            LEFT JOIN programs program ON gs.program_id = program.id
            ${whereClause}
            GROUP BY 
              gs.id, spinner.id, season.id, ginner.id, program.id`;

    //without seed cotton consumed
    const dataQuery = `
    SELECT 
        gs.id AS ginsale_id,
        gs.date AS date,
        gs."createdAt" AS "createdAt",
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
    LIMIT ${limit} OFFSET ${offset}
  ;`


    const [countResult, rows] = await Promise.all([
      sequelize.query(countQuery, {
        type: sequelize.QueryTypes.SELECT,
      }),
      sequelize.query(dataQuery, {
        type: sequelize.QueryTypes.SELECT,
      })
    ]);

    const nData = [];

    const totalCount = countResult && countResult.length > 0 ? Number(countResult.length) : 0;

    // for await (let item of rows) {
    //   const lotNo: string[] = item?.lot_no
    //     .split(", ")
    //     .map((id: any) => id);
    //   let qualityReport = null;

    //   if(item.process_ids && item.ginner_id && lotNo){
    //     qualityReport = await QualityParameter.findAll({
    //       where: {
    //         process_id: { [Op.in]: item?.process_ids },
    //         ginner_id: item?.ginner_id,
    //         lot_no: { [Op.in]: lotNo },
    //       },
    //       raw: true
    //     });
    //   }

    //   nData.push({
    //     ...item,
    //     quality_report: qualityReport ? qualityReport : null,
    //   });
    // }

    // Apply pagination to the combined result

    return res.sendPaginationSuccess(res, rows, totalCount);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message, error);
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
//     return res.sendError(res, error.message, error);
//   }
// };

const exportGinnerProcessGreyOutReport = async (req: Request, res: Response) => {
  // spinner_bale_receipt_load
  const excelFilePath = path.join(
    "./upload",
    "excel-ginner-process-grey-out-report.xlsx"
  );

  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { exportType, ginnerId, seasonId, programId, brandId, countryId }: any =
    req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = [];
  try {

    if (exportType === "all") {
      return res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "ginner-process-grey-out-report.xlsx",
      });
    } else {
      if (searchTerm) {
        whereCondition.push(`
          (
            g.name ILIKE '%${searchTerm}%' OR
            s.name ILIKE '%${searchTerm}%' OR
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
  
  
      const whereClause = whereCondition.length > 0 ? `AND ${whereCondition.join(' AND ')}` : '';

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

      const dataQuery = `
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
          ${whereClause}
        GROUP BY gp.id, gp.ginner_id, gp.season_id, gp.lot_no, gp.reel_lot_no, gp.press_no, s.name, g.name, gp.no_of_bales,gp.greyout_status, gp.scd_verified_status,gp.verification_status
        ORDER BY gp.id DESC
        LIMIT ${limit} OFFSET ${offset}
    ;`

    const [rows] = await Promise.all([
      sequelize.query(dataQuery, {
        type: sequelize.QueryTypes.SELECT,
      })
    ]);

      // Append data to worksheet
      for await (const [index, item] of rows.entries()) {
        const rowValues = Object.values({
          index: index + 1,
          season: item.season_name ? item.season_name : "",
          ginner: item.ginner_name ? item.ginner_name : "",
          reel_lot_no: item.reel_lot_no ? item.reel_lot_no : "",
          press: item.press_no ? item.press_no : "",
          // lot_no: item.lot_no ? item.lot_no : "",
          lot_no: item.press_no?.toLowerCase().trim() !== "nan-nan"  ? item.press_no : item?.pressno_from && item?.pressno_to ? item?.pressno_from+ ' - '+item?.pressno_to: '',
          lint_quantity: item.lint_quantity ? item.lint_quantity : 0,
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
        data: process.env.BASE_URL + "excel-ginner-process-grey-out-report.xlsx",
      });
    }
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message, error);
  }
};

const exportSpinnerProcessGreyOutReport = async (req: Request, res: Response) => {
  // spinner_bale_receipt_load
  const excelFilePath = path.join(
    "./upload",
    "excel-spinner-process-grey-out-report.xlsx"
  );

  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { exportType, spinnerId, seasonId, programId, brandId, countryId }: any =
    req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {

    if (exportType === "all") {
      return res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "spinner-process-grey-out-report.xlsx",
      });
    } else {

      if (searchTerm) {
        whereCondition[Op.or] = [
          { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$spinner.name$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
          { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
          { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        ];
      }
      if (spinnerId) {
        const idArray: number[] = spinnerId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$spinner_id$"] = { [Op.in]: idArray };
      }

      if (brandId) {
        const idArray: number[] = brandId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$spinner.brand$"] = { [Op.overlap]: idArray };
      }

      if (countryId) {
        const idArray: number[] = countryId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$spinner.country_id$"] = { [Op.in]: idArray };
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
        where: whereCondition,
        include: include,
        attributes: [
          [Sequelize.col('"season"."name"'), 'season_name'],
          [Sequelize.col('"spinner"."name"'), 'spinner_name'],
          [Sequelize.col('batch_lot_no'), 'batch_lot_no'],
          [Sequelize.col('reel_lot_no'), 'reel_lot_no'],
          [Sequelize.col('qty_stock'), 'qty_stock'],
        ],
        // group: ['season.id', 'spinner.id'],
        offset: offset,
        limit: limit,
        order: [['id', 'desc']]
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
      return res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "excel-spinner-process-grey-out-report.xlsx",
      });
    }
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message, error);
  }
};


const exportSpinnerGreyOutReport = async (req: Request, res: Response) => {
  // spinner_bale_receipt_load
  const excelFilePath = path.join(
    "./upload",
    "excel-spinner-grey-out-report.xlsx"
  );

  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { exportType, ginnerId, spinnerId, seasonId, programId, brandId, countryId }: any =
    req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  const searchCondition: any = {};

  try {

    if (exportType === "all") {
      return res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "spinner-grey-out-report.xlsx",
      });
    } else {

      if (searchTerm) {
        searchCondition[Op.or] = [
          { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$buyerdata.name$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
          { lot_no: { [Op.iLike]: `%${searchTerm}%` } },
          { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
          { press_no: { [Op.iLike]: `%${searchTerm}%` } },
          { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
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

      if (programId) {
        const idArray: number[] = programId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$program_id$"] = { [Op.in]: idArray };
      }

      whereCondition[Op.or] = [
        { greyout_status: true, ...searchCondition },
        {
          greyout_status: false,
          greyed_out_qty: { [Op.gt]: 0 },
          ...searchCondition
        },
      ];

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
      worksheet.mergeCells("A1:H1");
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
        where: whereCondition,
        include: include,
        attributes: [
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
        // group: ['season.id', 'ginner.id', 'buyerdata.id'],
        offset: offset,
        limit: limit,
        order: [['id', 'desc']]
      });

      // // Append data to worksheet
      for await (const [index, item] of rows.entries()) {
        const rowValues = Object.values({
          index: index + 1,
          season: item.dataValues.season_name ? item.dataValues.season_name : "",
          ginner: item.dataValues.ginner_name ? item.dataValues.ginner_name : "",
          spinner: item.dataValues.spinner ? item.dataValues.spinner : "",
          reel_lot_no: item.dataValues.reel_lot_no ? item.dataValues.reel_lot_no : "",
          invoice: item.dataValues.invoice_no ? item.dataValues.invoice_no : "",
          lot_no: item.dataValues.lot_no ? item.dataValues.lot_no : "",
          lint_quantity: item.dataValues.lint_greyout_qty ? item.dataValues.lint_greyout_qty : 0,
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
    return res.sendError(res, error.message, error);
  }
};

const exportGinnerSales = async (req: Request, res: Response) => {
  const excelFilePath = path.join("./upload", "excel-Ginner-sales-report.xlsx");
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const isOrganic = req.query.isOrganic || false;

  const isBrand = req.query.isBrand || false;
  const { exportType, ginnerId, seasonId, programId, brandId, countryId, startDate, endDate }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = [];
  try {
    if (exportType === "all") {
      return res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "Ginner-sales-report.xlsx",
      });
    } else {
     
      if (searchTerm) {
        whereCondition.push(`
        (
          ginner.name ILIKE '%${searchTerm}%' OR
          spinner.name ILIKE '%${searchTerm}%' OR
          season.name ILIKE '%${searchTerm}%' OR
          program.program_name ILIKE '%${searchTerm}%' OR
          gs.lot_no ILIKE '%${searchTerm}%' OR
          gs.reel_lot_no ILIKE '%${searchTerm}%' OR
          gs.press_no ILIKE '%${searchTerm}%' OR
          gs.invoice_no ILIKE '%${searchTerm}%' OR
          gs.vehicle_no ILIKE '%${searchTerm}%' OR
          gs.status ILIKE '%${searchTerm}%'
        )
      `);
      }

      if (brandId) {
        const idArray: number[] = brandId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition.push(`ginner.brand && ARRAY[${idArray.join(',')}]`);
      }

      if (countryId) {
        const idArray: number[] = countryId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition.push(`ginner.country_id IN (${idArray.join(',')})`);
      }

      if (seasonId) {
        const idArray = seasonId.split(",").map((id: any) => parseInt(id, 10));
        whereCondition.push(`gs.season_id IN (${idArray.join(',')})`);
      }

      if (ginnerId) {
        const idArray = ginnerId.split(",").map((id: any) => parseInt(id, 10));
        whereCondition.push(`gs.ginner_id IN (${idArray.join(',')})`);
      }


      if (programId) {
        const idArray = programId.split(",").map((id: any) => parseInt(id, 10));
        whereCondition.push(`gs.program_id IN (${idArray.join(',')})`);
      }

      if (startDate && endDate) {
        const startOfDay = new Date(startDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(endDate);
        endOfDay.setUTCHours(23, 59, 59, 999);
        whereCondition.push(`gs."date" BETWEEN '${startOfDay.toISOString()}' AND '${endOfDay.toISOString()}'`);
      }

      whereCondition.push(`gs.status <> 'To be Submitted'`);
      whereCondition.push(`gs.id IS NOT NULL`);

      const whereClause = whereCondition.length > 0 ? `WHERE ${whereCondition.join(' AND ')}` : '';

      // Create the excel workbook file
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet1");
      /*
        if (isOrganic === 'true') {
          worksheet.mergeCells('A1:P1');
        } else if (isBrand === 'true') {
          worksheet.mergeCells('A1:Q1');
        } else {
          worksheet.mergeCells('A1:U1');
        }
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Ginner Sales Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
      */
      // Set bold font for header row
      let headerRow;
      if (isOrganic === 'true') {
        headerRow = worksheet.addRow([
          "Sr No.","Country","State", "Process Date", "Data Entry Date", "No of Days", "Lint sale chosen season", "Ginner Name",
          "Invoice No", "Buyer Type", "Sold To", "Bale Lot No", "No of Bales", "Press/Bale No", "Rate/Kg",
          "Total Quantity", "Vehicle No", "Transporter Name", "Programme", "Agent Detials"
        ]);
      }
      else if (isBrand === 'true') {
        headerRow = worksheet.addRow([
          "Sr No.","Country","State", "Process Date", "Data Entry Date", "No of Days", "Lint sale chosen season", "Ginner Name",
          "Invoice No","Buyer Type", "Sold To", "Bale Lot No", "REEL Lot No", "No of Bales", "Press/Bale No", "Rate/Kg",
          "Total Quantity", "Vehicle No", "Transporter Name", "Programme", "Agent Detials"
        ]);
      } else {
        // headerRow = worksheet.addRow([
        //   "Sr No.", "Process Date", "Data Entry Date", "Seed Cotton Consumed Season", "Lint Process Season", "Lint sale chosen season", "Ginner Name",
        //   "Invoice No", "Sold To", "Bale Lot No", "REEL Lot No", "No of Bales", "Press/Bale No", "Rate/Kg",
        //   "Total Quantity", "Sales Value", "Vehicle No", "Transporter Name", "Programme", "Agent Detials", "Status"
        // ]);

        headerRow = worksheet.addRow([
          "Sr No.","Country","State", "Process Date", "Data Entry Date", "No of Days", "Lint Process Season", "Lint sale chosen season", "Ginner Name",
          "Invoice No","Buyer Type", "Sold To", "Bale Lot No", "REEL Lot No", "No of Bales", "Press/Bale No", "Rate/Kg",
          "Total Quantity", "Other Season Quantity (Kgs)", "Other Season Bales", "Sales Value", "Vehicle No", "Transporter Name", "Programme", "Agent Detials", "Status"
        ]);
      }
      headerRow.font = { bold: true };

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
      //     LIMIT ${limit} OFFSET ${offset}
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
          gs."createdAt" AS "createdAt",
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
      LIMIT ${limit} OFFSET ${offset}
   ;`

      const rows: any = await sequelize.query(dataQuery, {
        type: sequelize.QueryTypes.SELECT,
      })

      let totals = {
        total_no_of_bales: 0,
        total_lint_quantity: 0,
        total_Sales_value: 0,
        total_rate: 0,
      };

      // Append data to worksheet
      for await (const [index, item] of rows.entries()) {
        let rowValues;
        if (isOrganic === 'true') {
          rowValues = Object.values({
            index: index + 1,
            country: item.country_name ? item.country_name : '',
            state: item.state_name ? item.state_name : '',
            date: item.date ? item.date : '',
            created_at: item.createdAt ? item.createdAt : '',
            no_of_days: item.no_of_days ? Number(item.no_of_days) : '',            
            season: item.season_name ? item.season_name : '',
            ginner: item.ginner ? item.ginner : '',
            invoice: item.invoice_no ? item.invoice_no : '',
            buyer_type: item.buyer_type === 'Ginner' ? 'Ginner' : 'Spinner',
            buyer: item.buyerdata ? item.buyerdata : item.buyer_ginner ? item.buyer_ginner : '',
            lot_no: item.lot_no ? item.lot_no : '',
            no_of_bales: item.no_of_bales ? Number(item.no_of_bales) : 0,
            press_no: item.press_no ? item.press_no : '',
            rate: item.rate ? Number(item.rate) : 0,
            lint_quantity: item.lint_quantity ? item.lint_quantity : '',
            vehicle_no: item.vehicle_no ? item.vehicle_no : '',
            transporter_name: item.transporter_name ? item.transporter_name : '',
            program: item.program ? item.program : '',
            agentDetails: item.transaction_agent ? item.transaction_agent : 'NA'
          });
        }
        else if (isBrand === 'true') {
          rowValues = Object.values({
            index: index + 1,
            country: item.country_name ? item.country_name : '',
            state: item.state_name ? item.state_name : '',            
            date: item.date ? item.date : '',
            created_at: item.createdAt ? item.createdAt : '',
            no_of_days: item.no_of_days ? Number(item.no_of_days) : '',
            season: item.season_name ? item.season_name : '',
            ginner: item.ginner ? item.ginner : '',
            invoice: item.invoice_no ? item.invoice_no : '',
            buyer_type: item.buyer_type === 'Ginner' ? 'Ginner' : 'Spinner',
            buyer: item.buyerdata ? item.buyerdata : item.buyer_ginner ? item.buyer_ginner : '',
            lot_no: item.lot_no ? item.lot_no : '',
            reel_lot_no: item.reel_lot_no ? item.reel_lot_no : '',
            no_of_bales: item.no_of_bales ? Number(item.no_of_bales) : 0,
            press_no: item.press_no ? item.press_no : '',
            rate: item.rate ? Number(item.rate) : 0,
            lint_quantity: item.lint_quantity ? item.lint_quantity : '',
            vehicle_no: item.vehicle_no ? item.vehicle_no : '',
            transporter_name: item.transporter_name ? item.transporter_name : '',
            program: item.program ? item.program : '',
            agentDetails: item.transaction_agent ? item.transaction_agent : 'NA'
          });
        } else {

          rowValues = Object.values({
            index: index + 1,
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
            rate: item.rate ? Number(item.rate) : 0,
            lint_quantity: item.lint_quantity ? item.lint_quantity : '',
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
        }

        totals.total_no_of_bales += item.no_of_bales ? Number(item.no_of_bales) : 0;
        totals.total_lint_quantity += item.lint_quantity ? Number(item.lint_quantity) : 0;
        totals.total_Sales_value += item.sale_value ? Number(item.sale_value) : 0;
        totals.total_rate += item.rate ? Number(item.rate ): 0;

        worksheet.addRow(rowValues);
      }

      let rowValues;
      if (isOrganic === 'true') {
        rowValues = Object.values({
          index:"Total: ",
          country:"",
          state:"",
          date:"",
          created_at:"",
          no_of_days:"",            
          season:"",
          ginner:"",
          invoice:"",
          buyer_type:"",
          buyer:"",
          lot_no:"",
          no_of_bales: totals.total_no_of_bales,
          press_no:"",
          rate: Number(formatDecimal(totals.total_rate)),
          lint_quantity: Number(formatDecimal(totals.total_lint_quantity)),
          vehicle_no:"",
          transporter_name:"",
          program:"",
          agentDetails:"",
        });
      }
      else if (isBrand === 'true') {
        rowValues = Object.values({
          index:"Total: ",
          country:"",
          state:"",            
          date:"",
          created_at:"",
          no_of_days:"",
          season:"",
          ginner:"",
          invoice:"",
          buyer_type:"",
          buyer:"",
          lot_no:"",
          reel_lot_no:"",
          no_of_bales: totals.total_no_of_bales,
          press_no:"",
          rate: Number(formatDecimal(totals.total_rate)),
          lint_quantity: Number(formatDecimal(totals.total_lint_quantity)),
          vehicle_no:"",
          transporter_name:"",
          program:"",
          agentDetails:"",
        });
      } else {

        rowValues = Object.values({
          index:"Total: ",
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
          reel_lot_no:"",
          no_of_bales: totals.total_no_of_bales,
          press_no:"",
          rate: Number(formatDecimal(totals.total_rate)),
          lint_quantity: Number(formatDecimal(totals.total_lint_quantity)),
          other_season_quantity:"",      
          other_season_bales:"",
          sales_value: Number(formatDecimal(totals.total_Sales_value)),
          vehicle_no:"",
          transporter_name:"",
          program:"",
          agentDetails:"",
          status:"",
        });
      }
     
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
          const cellLength = (cell.value ? cell.value.toString() : '').length;
          maxCellLength = Math.max(maxCellLength, cellLength);
          cell.border = borderStyle;
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
    return res.sendError(res, error.message, error);

  }
};

const fetchSpinnerBalePagination = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { ginnerId, spinnerId, seasonId, programId, brandId, countryId, startDate, endDate }: any =
    req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = [];
  try {

    if (searchTerm) {
      whereCondition.push(`
        (
          g.name ILIKE '%${searchTerm}%' OR
          sp.name ILIKE '%${searchTerm}%' OR
          s.name ILIKE '%${searchTerm}%' OR
          p.program_name ILIKE '%${searchTerm}%' OR
          gs.lot_no ILIKE '%${searchTerm}%' OR
          gs.reel_lot_no ILIKE '%${searchTerm}%' OR
          gs.press_no ILIKE '%${searchTerm}%' OR
          gs.invoice_no ILIKE '%${searchTerm}%'
        )
      `);
    }

    if (spinnerId) {
      const idArray: number[] = spinnerId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.push(`gs.buyer IN (${idArray.join(',')})`);
    }

    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.push(`sp.brand && ARRAY[${idArray.join(',')}]`);
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.push(`sp.country_id IN (${idArray.join(',')})`);
    }

    if (seasonId) {
      const idArray = seasonId.split(",").map((id: any) => parseInt(id, 10));
      whereCondition.push(`gs.season_id IN (${idArray.join(',')})`);
    }

    if (ginnerId) {
      const idArray = ginnerId.split(",").map((id: any) => parseInt(id, 10));
      whereCondition.push(`gs.ginner_id IN (${idArray.join(',')})`);
    }


    if (programId) {
      const idArray = programId.split(",").map((id: any) => parseInt(id, 10));
      whereCondition.push(`gs.program_id IN (${idArray.join(',')})`);
    }

    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereCondition.push(`gs."createdAt" BETWEEN '${startOfDay.toISOString()}' AND '${endOfDay.toISOString()}'`);
    }
 

    // const whereClause = whereCondition.length > 0 ? `WHERE ${whereCondition.join(' AND ')}` : '';
    whereCondition.push(`gs.status IN ('Sold', 'Partially Accepted', 'Partially Rejected')`);

    const whereClause = whereCondition.length > 0 ? `WHERE ${whereCondition.join(' AND ')} AND bd.total_qty > 0` : 'WHERE bd.total_qty > 0';

    //fetch data with pagination
    const nData: any = [];

    // const countQuery = `
    //         SELECT COUNT(*) AS total_count
    //         FROM 
    //                 gin_sales gs
    //             LEFT JOIN 
    //                 ginners g ON gs.ginner_id = g.id
    //             LEFT JOIN 
    //                 seasons s ON gs.season_id = s.id
    //             LEFT JOIN 
    //                 programs p ON gs.program_id = p.id
    //             LEFT JOIN 
    //                 spinners sp ON gs.buyer = sp.id
    //         ${whereClause}`;

    const countQuery = `
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
            gs.status IN ('Sold', 'Partially Accepted', 'Partially Rejected')
            AND (bs.spinner_status = true OR gs.status = 'Sold')
        GROUP BY 
            bs.sales_id
    )
    SELECT COUNT(*) AS total_count
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
    ${whereClause};
`;

    let dataQuery = `
                WITH bale_details AS (
                    SELECT 
                        bs.sales_id,
                        COUNT(DISTINCT gb.id) AS no_of_bales,
                        ARRAY_AGG(DISTINCT gp.id) AS "process_ids",
                        gp.season_id AS "bale_season_id",
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
                        bs.sales_id, gp.season_id
                )
                SELECT 
                    gs.*, 
                    EXTRACT(DAY FROM ( gs."accept_date"- gs."createdAt" )) AS no_of_days,
                    g.id AS ginner_id, 
                    g.name AS ginner, 
                    sp.country_id AS country_id,
                    sp.state_id AS state_id,
                    s.id AS season_id, 
                    s.name AS season_name, 
                    p.id AS program_id, 
                    p.program_name AS program, 
                    sp.id AS spinner_id, 
                    sp.name AS spinner, 
                    sp.address AS spinner_address, 
                    bd.bale_season_id AS bale_season_id,
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

    for await (let item of rows) {
      const lotNo: string[] = item?.lot_no
        .split(", ")
        .map((id: any) => id);
      let qualityReport = null;

      if (item.process_ids && item.ginner_id && lotNo) {
        qualityReport = await QualityParameter.findAll({
          where: {
            process_id: { [Op.in]: item?.process_ids },
            ginner_id: item?.ginner_id,
            lot_no: { [Op.in]: lotNo },
          },
          raw: true
        });
      }

     const country = await Country.findOne({
      where: {
        id: item.country_id
      }        
     })

     const state = await State.findOne({
      where: {
        id: item.state_id
      }
     })

      nData.push({
        ...item,
        country: country ? country.dataValues.county_name : '',
        state: state ? state.dataValues.state_name : '',
        quality_report: qualityReport ? qualityReport : null,
      });
    }


    return res.sendPaginationSuccess(res, nData, totalCount);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message, error);
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
    ];
    //fetch data with pagination

    const { count, rows }: any = await BaleSelection.findAndCountAll({
      attributes: [
        [Sequelize.literal('"sales"."id"'), "sales_id"],
        [Sequelize.literal('"sales"."date"'), "date"],
        [Sequelize.literal('"sales"."createdAt"'), "createdAt"],
        [Sequelize.literal('Extract(DAY FROM ("sales"."createdAt"- "sales"."date"))'), "no_of_days"],
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
        [Sequelize.fn('STRING_AGG', Sequelize.literal('DISTINCT "bale->ginprocess"."reel_lot_no"'), ', '), "reel_lot_no"],
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
        "sales.buyerdata.country.id",
        "sales.buyerdata.state.id",
      ],
      order: [["spinner", "asc"]],
      offset: offset,
      limit: limit,
    });
    return res.sendPaginationSuccess(res, rows, count.length);
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message, error);
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
  const isOrganic = req.query.isOrganic || false;

  const { exportType, ginnerId, spinnerId, seasonId, programId, brandId, countryId, startDate, endDate }: any =
    req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = [];
  try {

    if (exportType === "all") {
      return res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "Spinner-bale-receipt-report.xlsx",
      });
    } else {

      if (searchTerm) {
        whereCondition.push(`
          (
            g.name ILIKE '%${searchTerm}%' OR
            sp.name ILIKE '%${searchTerm}%' OR
            s.name ILIKE '%${searchTerm}%' OR
            p.program_name ILIKE '%${searchTerm}%' OR
            gs.lot_no ILIKE '%${searchTerm}%' OR
            gs.reel_lot_no ILIKE '%${searchTerm}%' OR
            gs.press_no ILIKE '%${searchTerm}%' OR
            gs.invoice_no ILIKE '%${searchTerm}%'
          )
        `);
      }

      if (spinnerId) {
        const idArray: number[] = spinnerId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition.push(`gs.buyer IN (${idArray.join(',')})`);
      }

      if (brandId) {
        const idArray: number[] = brandId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition.push(`sp.brand && ARRAY[${idArray.join(',')}]`);
      }

      if (countryId) {
        const idArray: number[] = countryId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition.push(`sp.country_id IN (${idArray.join(',')})`);
      }

      if (seasonId) {
        const idArray = seasonId.split(",").map((id: any) => parseInt(id, 10));
        whereCondition.push(`gs.season_id IN (${idArray.join(',')})`);
      }

      if (ginnerId) {
        const idArray = ginnerId.split(",").map((id: any) => parseInt(id, 10));
        whereCondition.push(`gs.ginner_id IN (${idArray.join(',')})`);
      }


      if (programId) {
        const idArray = programId.split(",").map((id: any) => parseInt(id, 10));
        whereCondition.push(`gs.program_id IN (${idArray.join(',')})`);
      }

      if (startDate && endDate) {
        const startOfDay = new Date(startDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(endDate);
        endOfDay.setUTCHours(23, 59, 59, 999);
        whereCondition.push(`gs."createdAt" BETWEEN '${startOfDay.toISOString()}' AND '${endOfDay.toISOString()}'`);
      }

      whereCondition.push(`gs.status IN ('Sold', 'Partially Accepted', 'Partially Rejected')`);
      const whereClause = whereCondition.length > 0 ? `WHERE ${whereCondition.join(' AND ')} AND bd.total_qty > 0` : 'WHERE bd.total_qty > 0';

      // const whereClause = whereCondition.length > 0 ? `WHERE ${whereCondition.join(' AND ')}` : '';

      // Create the excel workbook file
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet1");
      // if (isOrganic === 'true') {
      //   worksheet.mergeCells('A1:N1');
      // } else{
      //   worksheet.mergeCells("A1:O1");
      // }
      // const mergedCell = worksheet.getCell("A1");
      // mergedCell.value = "CottonConnect | Spinner Bale Receipt Report";
      // mergedCell.font = { bold: true };
      // mergedCell.alignment = { horizontal: "center", vertical: "middle" };
      // Set bold font for header row
      let headerRow;
      if(isOrganic === 'true') {
        headerRow = worksheet.addRow([
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
          "Press/Bale No",
          "No of Bales(Accepted)",
          "Total Lint Accepted Quantity(Kgs)",
          "Lint Greyout Quantity After Verification(Kgs)",
          "Programme",
          "Grey Out Status",
        ]);
      }else{
       headerRow = worksheet.addRow([
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
        "Lint Greyout Quantity After Verification(Kgs)",
        "Programme",
        "Grey Out Status",
      ]);
    }
      headerRow.font = { bold: true };

      // //fetch data with pagination

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
                    EXTRACT(DAY FROM (  gs."accept_date" - gs."createdAt")) AS no_of_days,
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
          replacements: { limit, offset },
          type: sequelize.QueryTypes.SELECT,
        })
      ]);

      let totals = {
        total_no_of_bales:0,
        total_lint_quantity: 0,

      }

      // // Append data to worksheet

      for await (const [index, item] of rows.entries()) {

        const country = await Country.findOne({
          where: { id: item.country_id },
        });
        const state = await State.findOne({
          where: { id: item.state_id },
        });

        let rowValues;
        if (isOrganic === 'true') {
       rowValues = Object.values({
          index: index + 1,
          country: country.dataValues.county_name,
          state: state.dataValues.state_name,
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
          press_no: item.press_no ? item.press_no : "",
          no_of_bales: item.accepted_no_of_bales
            ? Number(item.accepted_no_of_bales)
            : 0,
          lint_quantity: item.accepted_total_qty
            ? Number(item.accepted_total_qty)
            : 0,
          greyed_out_qty: item.greyed_out_qty
            ? Number(item.greyed_out_qty)
            : 0,
          program: item.program ? item.program : "",
          greyout_status: item.greyout_status ? "Yes" : "No",
        });
      }
      else{
        rowValues = Object.values({
          index: index + 1,
          country: country.dataValues.county_name,
          state: state.dataValues.state_name,
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
          lint_quantity: item.accepted_total_qty
            ? Number(item.accepted_total_qty)
            : 0,
          greyed_out_qty: item.greyed_out_qty
            ? Number(item.greyed_out_qty)
            : 0,
          program: item.program ? item.program : "",
          greyout_status: item.greyout_status ? "Yes" : "No",
        });
      }

        totals.total_no_of_bales += Number(item.accepted_no_of_bales);
        totals.total_lint_quantity += Number(item.accepted_total_qty);


        worksheet.addRow(rowValues);
      }


      let rowValues;
      if (isOrganic === 'true') {
     rowValues = Object.values({
        index:"Totals: ",
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
        press_no:"",
        no_of_bales: Number(formatDecimal(totals.total_no_of_bales)),
        lint_quantity: Number(formatDecimal(totals.total_lint_quantity)),
        greyed_out_qty:"",
        program:"",
        greyout_status:"",
      });
    }
    else{
      rowValues = Object.values({
        index:"Totals: ",
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
        press_no:"",
        no_of_bales: Number(formatDecimal(totals.total_no_of_bales)),
        lint_quantity: Number(formatDecimal(totals.total_lint_quantity)),
        greyed_out_qty:"",
        program:"",
        greyout_status:"",
      });
    }
    worksheet.addRow(rowValues).eachCell((cell, colNumber) => { cell.font={bold:true}});


      const  borderStyle = {
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
      return res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "excel-spinner-bale-receipt-report.xlsx",
      });
    }
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message, error);
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
  const isOrganic = req.query.isOrganic || false;

  const isBrand = req.query.isBrand || false;
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
      //  if (isOrganic === 'true') {
      //   worksheet.mergeCells('A1:L1');
      // } else if (isBrand === 'true') {
      //   worksheet.mergeCells('A1:M1');
      // } else {
      //   worksheet.mergeCells("A1:N1");
      // }
      // const mergedCell = worksheet.getCell("A1");
      // mergedCell.value = "CottonConnect | Spinner Pending Bales Receipt Report";
      // mergedCell.font = { bold: true };
      // mergedCell.alignment = { horizontal: "center", vertical: "middle" };
      // Set bold font for header row
      let headerRow;
      if (isOrganic === 'true') {
        headerRow = worksheet.addRow([
          "Sr No.",
          "Country",
          "State",          
          "Date and Time",
          "Date",
          "No. of Days",
          "Season",
          "Ginner Name",
          "Spinner Name",
          "Invoice No",
          "No of Bales",
          "Bale Lot No",
          "Quantity(KGs)",
          "Programme",
          "Vehicle No",
        ]);
      }
      else if (isBrand === 'true') {
        headerRow = worksheet.addRow([
          "Sr No.",
          "Country",
          "State",          
          "Date and Time",
          "Date",
          "No. of Days",
          "Season",
          "Ginner Name",
          "Spinner Name",
          "Invoice No",
          "No of Bales",
          "Bale Lot No",
          "REEL Lot No",
          "Quantity(KGs)",
          "Programme",
          "Vehicle No",
        ]);
      } else {
        headerRow = worksheet.addRow([
          "Sr No.",
          "Country",
          "State",          
          "Date and Time",
          "Date",
          "No. of Days",
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
      }

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
          "sales.buyerdata.country.id",
          "sales.buyerdata.state.id",
        ],
        order: [["spinner", "asc"]],
        offset: offset,
        limit: limit,
      });

      let totals = {
        no_of_bales:0,
        total_qty:0,
        actual_qty:0,
      };

      // Append data to worksheet
      for await (const [index, item] of rows.entries()) {
        let rowValues;
        if (isOrganic === 'true') {
          rowValues = {
            index: index + 1,
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
              ? item.dataValues.no_of_bales
              : "",
            lot_no: item.dataValues.lot_no ? item.dataValues.lot_no : "",
            total_qty: item.dataValues.lint_quantity
              ? item.dataValues.lint_quantity
              : "",
            program: item.dataValues.program ? item.dataValues.program : "",
            village: item.dataValues.vehicle_no ? item.dataValues.vehicle_no : ""
          };
        }
        else if (isBrand === 'true') {
          rowValues = {
            index: index + 1,
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
              ? item.dataValues.no_of_bales
              : "",
            lot_no: item.dataValues.lot_no ? item.dataValues.lot_no : "",
            reel_lot_no: item.dataValues.reel_lot_no
              ? item.dataValues.reel_lot_no
              : "",
            total_qty: item.dataValues.lint_quantity
              ? item.dataValues.lint_quantity
              : "",
            program: item.dataValues.program ? item.dataValues.program : "",
            village: item.dataValues.vehicle_no ? item.dataValues.vehicle_no : ""
          };
        } else {
          rowValues = {
            index: index + 1,
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
          };
          totals.actual_qty += rowValues.actual_qty;
        }

          totals.no_of_bales += rowValues.no_of_bales;
          totals.total_qty += rowValues.total_qty;
          
      
        worksheet.addRow(Object.values(rowValues));
      }

     

      let rowValues;
      if (isOrganic === 'true') {
        rowValues = {
          index:"Totals: ",
          country:"",
          state:"",
          createdAt:"",
          date:"",
          no_of_days:"",
          season:"",
          ginner:"",
          spinner:"",
          invoice:"",
          no_of_bales: Number(formatDecimal(totals.no_of_bales)),
          lot_no:"",
          total_qty: Number(formatDecimal(totals.total_qty)),
          program:"",
          village:"",
        };
      }
      else if (isBrand === 'true') {
        rowValues = {
          index:"Totals: ",
          country:"",
          state:"",
          createdAt:"",
          date:"",
          no_of_days:"",
          season:"",
          ginner:"",
          spinner:"",
          invoice:"",
          no_of_bales: Number(formatDecimal(totals.no_of_bales)),
          lot_no:"",
          reel_lot_no:"",
          total_qty: Number(formatDecimal(totals.total_qty)),
          program:"",
          village:"",
        };
      } else {
        rowValues = {
          index:"Totals: ",
          country:"",
          state:"",
          createdAt:"",
          date:"",
          no_of_days:"",
          season:"",
          ginner:"",
          spinner:"",
          invoice:"",
          no_of_bales: Number(formatDecimal(totals.no_of_bales)),
          lot_no:"",
          reel_lot_no:"",
          total_qty: Number(formatDecimal(totals.total_qty)),
          actual_qty: Number(formatDecimal(totals.actual_qty)),
          program:"",
          village:"",
        };
      }
      worksheet.addRow(Object.values(rowValues)).eachCell(cell=> cell.font={bold:true});

      let borderStyle = {
        top: {style: "thin"},
        left: {style: "thin"},
        bottom: {style: "thin"},
        right: {style: "thin"}
      }
      // Auto-adjust column widths based on content
      worksheet.columns.forEach((column: any) => {
        let maxCellLength = 0;
        column.eachCell({ includeEmpty: true }, (cell: any) => {
          const cellLength = (cell.value ? cell.value.toString() : "").length;
          maxCellLength = Math.max(maxCellLength, cellLength);
          cell.border = borderStyle
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
    return res.sendError(res, error.message, error);
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
      whereConditions.push(`spin_process."date" BETWEEN '${startOfDay.toISOString()}' AND '${endOfDay.toISOString()}'`);
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
        spin_process.from_date,
        spin_process.to_date,
        spin_process."createdAt",
        EXTRACT(DAY FROM (spin_process."createdAt" - spin_process.date)) AS no_of_days,
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
      ${whereClause}
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
        combernoil_generations cg ON cs.yarn_id = cg.id
      LEFT JOIN
        spin_processes sp ON cg.process_id = sp.id
      LEFT JOIN
        seasons s ON sp.season_id = s.id
      GROUP BY
        cs.process_id
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
      c.county_name AS country_name,
      s.state_name AS state_name,
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
    LEFT JOIN
      countries c on spd.country_id = c.id
    LEFT JOIN
      states s on spd.state_id = s.id
    ORDER BY
      spd.spinner_name ASC
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

    const totalCount = countResult && countResult.length > 0 ? countResult[0].total_count : 0;

    return res.sendPaginationSuccess(res, rows, totalCount);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message, error);
  }
};


const exportSpinnerYarnProcess = async (req: Request, res: Response) => {
  // spinner_yarn_process_load
  const excelFilePath = path.join("./upload", "excel-spinner-yarn-process.xlsx");

  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const isOrganic = req.query.isOrganic || false;

  const isBrand = req.query.isBrand || false;
  const isAdmin = req.query.isAdmin || false;
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
        whereConditions.push(`spin_process."date" BETWEEN '${startOfDay.toISOString()}' AND '${endOfDay.toISOString()}'`);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      // Create the excel workbook file
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet1");
      // if (isOrganic === 'true') {
      //   worksheet.mergeCells('A1:S1');
      // } else if (isBrand === 'true' &&  (isOrganic === false ||  isOrganic === 'false')) {
      //   worksheet.mergeCells('A1:T1');
      // } 
      // else if (isAdmin === 'true'){
      //   worksheet.mergeCells('A1:U1');
      // }
      // else {
      //   worksheet.mergeCells('A1:V1');
      // }
      // const mergedCell = worksheet.getCell("A1");
      // mergedCell.value = "CottonConnect | Spinner Yarn Process Report";
      // mergedCell.font = { bold: true };
      // mergedCell.alignment = { horizontal: "center", vertical: "middle" };
      // Set bold font for header row
      let headerRow;

   if (isOrganic === 'true') {
        headerRow = worksheet.addRow([
          "Sr No.",
          "Country",
          "State",
          "Date and Time",  
          "Yarn Production Start Date",
          "Yarn Production End Date",
          "Yarn Process Season",
          "Spinner Name",
          "Spin Lot No",
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
      }
      else if (isBrand === 'true' && (isOrganic === false ||  isOrganic === 'false')) {
        headerRow = worksheet.addRow([
          "Sr No.",
          "Country",
          "State",
          "Date and Time",
          "Yarn Production Start Date",
          "Yarn Production End Date",
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
      } 
      else if (isAdmin === 'true'){
        headerRow = worksheet.addRow([
          "Sr No.",
          "Country",
          "State",
          "Date and Time",
          "Process Date",
          "No of Days",
          "Yarn Production Start Date",
          "Yarn Production End Date",
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
          "Grey Out Status"
        ]);
      }
      else {
        headerRow = worksheet.addRow([
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
          "Total Lint cotton consumed (Kgs)",
          "Total Comber Noil Consumed(kgs)",
          "Total lint+Blend material + Comber Noil consumed",
          "Programme",
          "Total Yarn weight (Kgs)",
          "Total yarn sold (Kgs)",
          "Total Yarn in stock (Kgs)",
          "Grey Out Status",
        ]);
      }
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
        spin_process.from_date,
        spin_process.to_date,
        spin_process."createdAt",
        EXTRACT(DAY FROM (spin_process."createdAt" - spin_process.date)) AS no_of_days,
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
      ${whereClause}
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
        combernoil_generations cg ON cs.yarn_id = cg.id
      LEFT JOIN
        spin_processes sp ON cg.process_id = sp.id
      LEFT JOIN
        seasons s ON sp.season_id = s.id
      GROUP BY
        cs.process_id
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
      c.county_name AS country,
      s.state_name AS state,
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
        replacements: { limit, offset },
        type: sequelize.QueryTypes.SELECT,
      });


      let totals = {
        total_comber:0,

        total_cotton_consumed:0,
        total_comber_consumed:0,
        total_total_lint_blend_consumed:0,
        total_total:0,
        total_yarn_sold:0,
        total_yarn_stock:0,
      };


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

        let rowValues;
       if (isOrganic === 'true') {

          rowValues = {
            index: index + 1,
            country: item.country? item.country:"",
            state: item.state? item.state: "",
            createdAt: item.createdAt ? item.createdAt : "",
            from_date: item.from_date ? item.from_date : "",
            to_date: item.to_date ? item.to_date : "",
            season: item.season_name ? item.season_name : "",
            spinner: item.spinner_name ? item.spinner_name : "",
            lotNo: item.batch_lot_no ? item.batch_lot_no : "",
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
          };
        }
        else if (isBrand === 'true' && (isOrganic === false ||  isOrganic === 'false')) {
          rowValues ={
            index: index + 1,
            country: item.country? item.country:"",
            state: item.state? item.state: "",
            createdAt: item.createdAt ? item.createdAt : "",
            from_date: item.from_date ? item.from_date : "",
            to_date: item.to_date ? item.to_date : "",
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
          }
        }
        else if(isAdmin === 'true'){
          rowValues = {
            index: index + 1,
            country: item.country? item.country:"",
            state: item.state? item.state: "",
            createdAt: item.createdAt ? item.createdAt : "",
            date: item.date ? item.date : "",
            no_of_days: item.no_of_days ? Number(item.no_of_days) : "",
            from_date: item.from_date ? item.from_date : "",
            to_date: item.to_date ? item.to_date : "",
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
          }
        }
        else {
          rowValues = {
            index: index + 1,
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
          }
          
        }
        worksheet.addRow(Object.values(rowValues));
      
        totals.total_comber+=Number(rowValues.comber);

        totals.total_cotton_consumed+=Number(rowValues.cotton_consumed);
        totals.total_comber_consumed+=Number(rowValues.comber_consumed);
        totals.total_total_lint_blend_consumed+=Number(rowValues.total_lint_blend_consumed);
        totals.total_total+=Number(rowValues.total);
        totals.total_yarn_sold+=Number(rowValues.yarn_sold);
        totals.total_yarn_stock+=Number(rowValues.yarn_stock);
      }


      let rowValues;
      if (isOrganic === 'true') {

         rowValues = {
           index:"Totals: ",
           country:"",
           state:"",
           createdAt:"",
           from_date:"",
           to_date:"",
           season:"",
           spinner:"",
           lotNo:"",
           yarnType:"",
           count:"",
           resa:"",
           comber: Number(formatDecimal(totals.total_comber)),
           blend: "",
           blendqty: "",
           cotton_consumed: Number(formatDecimal(totals.total_cotton_consumed)),
           comber_consumed: Number(formatDecimal(totals.total_comber_consumed)),
           total_lint_blend_consumed: Number(formatDecimal(totals.total_total_lint_blend_consumed)),
           program:"",
           total: Number(formatDecimal(totals.total_total)),
           yarn_sold: Number(formatDecimal(totals.total_yarn_sold)),
           yarn_stock: Number(formatDecimal(totals.total_yarn_stock)),
           greyout_status:"",
         };
       }
       else if (isBrand === 'true' && (isOrganic === false ||  isOrganic === 'false')) {
         rowValues ={
           index:"Totals: ",
           country:"",
           state:"",
           createdAt:"",
           from_date:"",
           to_date:"",
           season:"",
           spinner:"",
           lotNo:"",
           reel_lot_no:"",
           yarnType:"",
           count:"",
           resa:"",
           comber: Number(formatDecimal(totals.total_comber)),
           blend: "",
           blendqty: "",
           cotton_consumed: Number(formatDecimal(totals.total_cotton_consumed)),
           comber_consumed: Number(formatDecimal(totals.total_comber_consumed)),
           total_lint_blend_consumed: Number(formatDecimal(totals.total_total_lint_blend_consumed)),
           program:"",
           total: Number(formatDecimal(totals.total_total)),
           yarn_sold: Number(formatDecimal(totals.total_yarn_sold)),
           yarn_stock: Number(formatDecimal(totals.total_yarn_stock)),
           greyout_status:"",
         }
       }
       else if(isAdmin === 'true'){
         rowValues = {
           index:"Totals: ",
           country:"",
           state:"",
           createdAt:"",
           date:"",
           no_of_days:"",
           from_date:"",
           to_date:"",
           season:"",
           spinner:"",
           lotNo:"",
           reel_lot_no:"",
           yarnType:"",
           count:"",
           resa:"",
           comber: Number(formatDecimal(totals.total_comber)),
           blend: "",
           blendqty: "",
           cotton_consumed: Number(formatDecimal(totals.total_cotton_consumed)),
           comber_consumed: Number(formatDecimal(totals.total_comber_consumed)),
           total_lint_blend_consumed: Number(formatDecimal(totals.total_total_lint_blend_consumed)),
           program:"",
           total: Number(formatDecimal(totals.total_total)),
           yarn_sold: Number(formatDecimal(totals.total_yarn_sold)),
           yarn_stock: Number(formatDecimal(totals.total_yarn_stock)),
           greyout_status:"",
         }
       }
       else {
         rowValues = {
           index:"Totals: ",
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
           resa:"",
           comber: Number(formatDecimal(totals.total_comber)),
           blend: "",
           blendqty: "",
           cotton_consumed: Number(formatDecimal(totals.total_cotton_consumed)),
           comber_consumed: Number(formatDecimal(totals.total_comber_consumed)),
           total_lint_blend_consumed: Number(formatDecimal(totals.total_total_lint_blend_consumed)),
           program:"",
           total: Number(formatDecimal(totals.total_total)),
           yarn_sold: Number(formatDecimal(totals.total_yarn_sold)),
           yarn_stock: Number(formatDecimal(totals.total_yarn_stock)),
           greyout_status:"",
         }
         
       }
       worksheet.addRow(Object.values(rowValues)).eachCell(cell=> cell.font={bold:true});


      const borderStyle = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },      
      }

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
      res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "excel-spinner-yarn-process.xlsx",
      });
    }
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message, error);
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
      whereCondition["$sales.date$"] = { [Op.between]: [startOfDay, endOfDay] }
    }

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
        ]

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
          [Sequelize.literal('EXTRACT(DAY FROM ("sales"."createdAt" - "sales"."date"))'), "no_of_days"],  
          [Sequelize.col('"sales"."season"."name"'), "season_name"],
          [Sequelize.col('"sales"."season"."id"'), "season_id"],
          [Sequelize.col('"sales"."spinner"."id"'), "spinner_id"],
          [Sequelize.col('"sales"."spinner"."name"'), "spinner"],
          [sequelize.col('"sales"."spinner"."country"."county_name"'), "country"],
          [sequelize.col('"sales"."spinner"."state"."state_name"'), "state"],
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
          [Sequelize.fn('STRING_AGG', Sequelize.literal('DISTINCT "process"."reel_lot_no"'), ', '), "reel_lot_no"],
          [Sequelize.fn('ARRAY_AGG', Sequelize.literal('DISTINCT "process"."id"')), "process_ids"],
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
          "sales.spinner.country.id",
          "sales.spinner.state.id",
        ],
        order: [["spinner", "ASC"]],
        offset: offset,
        limit: limit,
      }
    );
    let data = [];

    for await (let row of rows) {

      let processIds = row?.dataValues?.process_ids && Array.isArray(row?.dataValues?.process_ids)
        ? row.dataValues.process_ids?.filter((id: any) => id !== null && id !== undefined)
        : [];

      let seedSeason = [];

      if (processIds?.length > 0) {
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
              ls.process_id IN (${processIds?.join(',')})
      `);
      }


      let yarnCount: string = "";

      if (row.dataValues?.yarn_count && row.dataValues.yarn_count?.length > 0) {
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
        lint_consumed_seasons: seedSeason ? seedSeason[0]?.seasons : "",
        yarnCount,
      });
    }

    return res.sendPaginationSuccess(res, data, count?.length);
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message, error);
  }
};

const exportSpinnerSale = async (req: Request, res: Response) => {

  // spinner_yarn_sales_load
  const excelFilePath = path.join("./upload", "excel-spinner-yarn-sale.xlsx");
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const isOrganic = req.query.isOrganic || false;
  const isAdmin = req.query.isAdmin || false;

  const isBrand = req.query.isBrand || false;
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
        whereCondition["$sales.date$"] = { [Op.between]: [startOfDay, endOfDay] }
      }

      // Create the excel workbook file
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet1");
      // if(isOrganic === 'true') {
      //   worksheet.mergeCells('A1:Q1');
      // } else if (isBrand === 'true' &&  (isOrganic === false ||  isOrganic === 'false')) {
      //   worksheet.mergeCells('A1:R1');
      // }
      // else if(isAdmin === 'true'){
      //   worksheet.mergeCells("A1:T1");
      // }
      // else {
      //   worksheet.mergeCells("A1:U1");
      // }
      // const mergedCell = worksheet.getCell("A1");
      // mergedCell.value = "CottonConnect | Spinner Yarn Sales Report";
      // mergedCell.font = { bold: true };
      // mergedCell.alignment = { horizontal: "center", vertical: "middle" };
      // Set bold font for header row
      let headerRow;
      if (isOrganic === 'true') {
        headerRow = worksheet.addRow([
          "Sr No.",
          "Country",
          "State",
          "Created Date and Time",
          "Date of transaction",
          "No. of Days",
          "Season",
          "Spinner Name",
          "Knitter/Weaver Name",
          "Invoice Number",
          "Order Reference",
          "Lot/Batch Number",
          "Programme",
          "Yarn Type",
          "Yarn Count",
          "No of Boxes",
          "Box ID",
          "Price",
          "Yarn Net Weight(Kgs)",
          "Agent Details",
        ]);
      }
      else if (isBrand === 'true' &&  (isOrganic === false ||  isOrganic === 'false')) {
        headerRow = worksheet.addRow([
          "Sr No.",
          "Country",
          "State",
          "Created Date and Time",
          "Date of transaction",
          "No. of Days",
          "Season",
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
          "Price",
          "Yarn Net Weight(Kgs)",
          "Agent Details",
        ]);
      }
      else if(isAdmin === 'true' ){
        headerRow = worksheet.addRow([
          "Sr No.",
          "Country",
          "State",
          "Created Date and Time",
          "Date of transaction",
          "No. of Days",
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
          "Price",
          "Yarn Net Weight(Kgs)",
          "Transporter Name",
          "Vehicle No",
          "Agent Details",
        ]);
      }
      else {
        headerRow = worksheet.addRow([
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
          "Price",
          "Yarn Net Weight(Kgs)",
          "Transporter Name",
          "Vehicle No",
          "Agent Details",
        ]);
      }
      headerRow.font = { bold: true };

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

    


      const { count, rows }: any = await SpinProcessYarnSelection.findAndCountAll(
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
            "sales.spinner.country.id",
            "sales.spinner.state.id",
          ],
          order: [["spinner", "asc"]],
          offset: offset,
          limit: limit,
        }
      );


      let totals = {
        total_price:0,
       total_net_weight:0,
     };

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

        // const [seedSeason] = await sequelize.query(`
        //     SELECT 
        //          STRING_AGG(DISTINCT s.name, ', ') AS seasons
        //       FROM
        //         lint_selections ls
        //       LEFT JOIN
        //         gin_sales gs ON ls.lint_id = gs.id
        //       LEFT JOIN
        //         seasons s ON gs.season_id = s.id
        //     WHERE 
        //         ls.process_id IN (${item?.dataValues?.process_ids.join(',')}) 
        //     `)


        let processIds = item?.dataValues?.process_ids && Array.isArray(item?.dataValues?.process_ids)
          ? item.dataValues.process_ids?.filter((id: any) => id !== null && id !== undefined)
          : [];
        const formatDate = (dateString: any) => {
          if (!dateString) return "";
          const date = new Date(dateString);

          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();

          return `${day}-${month}-${year}`;
        };

        let seedSeason = [];

        if (processIds?.length > 0) {
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
              ls.process_id IN (${processIds?.join(',')})
      `);
        }

   

        let rowValues;
        if (isOrganic === 'true') {
          rowValues = {
            index: index + 1,
            country: item.dataValues.country?item.dataValues.country:"",
            state: item.dataValues.state?item.dataValues.state:"",
            createdAt: item.dataValues.createdAt ? item.dataValues.createdAt : "",
            date: item.dataValues.date ? formatDate(item.dataValues.date) : "",
            no_of_days: item.dataValues.no_of_days,
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
            program: item.dataValues.program ? item.dataValues.program : "",
            yarnType: yarnTypeData ? yarnTypeData : "",
            count: yarnCount
              ? yarnCount
              : "",
            boxes: item.dataValues.no_of_boxes ? item.dataValues.no_of_boxes : "",
            boxId: item.dataValues.box_ids ? item.dataValues.box_ids : "",
            price: item.dataValues.price ? item.dataValues.price : "",
            total: item.dataValues.total_qty ? item.dataValues.total_qty : 0,
            agent: item.dataValues.transaction_agent
              ? item.dataValues.transaction_agent
              : "",
          };
        } 
        else if (isBrand === 'true' &&  (isOrganic === false ||  isOrganic === 'false')) {
          rowValues = {
            index: index + 1,
            country: item.dataValues.country?item.dataValues.country:"",
            state: item.dataValues.state?item.dataValues.state:"",
            createdAt: item.dataValues.createdAt ? item.dataValues.createdAt : "",
            date: item.dataValues.date ? formatDate(item.dataValues.date) : "",
            no_of_days: item.dataValues.no_of_days,
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
              : "",
            boxes: item.dataValues.no_of_boxes ? item.dataValues.no_of_boxes : "",
            boxId: item.dataValues.box_ids ? item.dataValues.box_ids : "",
            price: item.dataValues.price ? item.dataValues.price : "",
            total: item.dataValues.total_qty ? item.dataValues.total_qty : 0,
            agent: item.dataValues.transaction_agent
              ? item.dataValues.transaction_agent
              : "",
          };
        }
        else if (isAdmin === 'true') {
          rowValues = {
            index: index + 1,
            country: item.dataValues.country?item.dataValues.country:"",
            state: item.dataValues.state?item.dataValues.state:"",
            createdAt: item.dataValues.createdAt ? item.dataValues.createdAt : "",
            date: item.dataValues.date ? formatDate(item.dataValues.date) : "",
            no_of_days: item.dataValues.no_of_days,
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
          };
        }    
        else {
          rowValues = {
            index: index + 1,
            country: item.dataValues.country?item.dataValues.country:"",
            state: item.dataValues.state?item.dataValues.state:"",
            createdAt: item.dataValues.createdAt ? item.dataValues.createdAt : "",
            date: item.dataValues.date ? formatDate(item.dataValues.date) : "",
            no_of_days: item.dataValues.no_of_days,
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
          };
        }

        totals.total_price += Number(rowValues.price);
        totals.total_net_weight += Number(rowValues.total);

        worksheet.addRow(Object.values(rowValues));
      }

 

      

      let rowValues;
      if (isOrganic === 'true') {
        rowValues = {
          index:"Totals: ",
          country:"",
          state:"",
          createdAt:"",
          date:"",
          no_of_days:"",
          season:"",
          spinner:"",
          buyer_id:"",
          invoice:"",
          order_ref:"",
          lotNo:"",
          program:"",
          yarnType:"",
          count:"",
          boxes:"",
          boxId:"",
          price: Number(formatDecimal(totals.total_price)),
          total: Number(formatDecimal(totals.total_net_weight)),
          agent:"",
          reelLot:"",

        };
      } 
      else if (isBrand === 'true' &&  (isOrganic === false ||  isOrganic === 'false')) {
        rowValues = {
          index:"Totals: ",
          country:"",
          state:"",
          createdAt:"",
          date:"",
          no_of_days:"",
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
          boxId:"",
          price: Number(formatDecimal(totals.total_price)),
          total: Number(formatDecimal(totals.total_net_weight)),
          agent:"",
        };
      }
      else if (isAdmin === 'true') {
        rowValues = {
          index:"Totals: ",
          country:"",
          state:"",
          createdAt:"",
          date:"",
          no_of_days:"",
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
          boxId:"",
          price: Number(formatDecimal(totals.total_price)),
          total: Number(formatDecimal(totals.total_net_weight)),
          transporter_name:"",
          vehicle_no:"",
          agent:"",
        };
      }    
      else {
        rowValues = {
          index:"Totals: ",
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
          boxId:"",
          price: Number(formatDecimal(totals.total_price)),
          total: Number(formatDecimal(totals.total_net_weight)),
          transporter_name:"",
          vehicle_no:"",
          agent:"",
        };
      }
      
      worksheet.addRow(Object.values(rowValues)).eachCell(cell=> cell.font = {bold: true});

      let borderStyle = {
        top: {style: "thin"},
        left: {style: "thin"},
        bottom: {style: "thin"},
        right: {style: "thin"}
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
      res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "excel-spinner-yarn-sale.xlsx",
      });
    }
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message, error);
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
          [Sequelize.fn('STRING_AGG', Sequelize.literal('DISTINCT "process"."reel_lot_no"'), ', '), "reel_lot_no"],
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

      const yarnCountNames = yarncount?.map((yc: any) => yc.yarnCount_name);

      data.push({
        ...row.dataValues,
        yarnCount_names: yarnCountNames,
      });
    }
    return res.sendPaginationSuccess(res, data, count.length);
  } catch (error: any) {
    return res.sendError(res, error.message, error);
  }
};


const exportKnitterYarn = async (req: Request, res: Response) => {
  // knitter_yarn_receipt_load
  // await ExportData.update({
  //   knitter_yarn_receipt_load: true
  // }, { where: { knitter_yarn_receipt_load: false } })
  // res.send({ status: 200, message: "export file processing" })
  const excelFilePath = path.join("./upload", "Knitter_yarn_receipt.xlsx");
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
          [Sequelize.fn('STRING_AGG', Sequelize.literal('DISTINCT "process"."reel_lot_no"'), ', '), "reel_lot_no"],
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
        offset: offset,
        limit: limit,
      }
    );

    const yarnCountIds = rows.flatMap((row: any) => row.dataValues.yarn_count || []);
    const yarnCounts = await YarnCount.findAll({
      where: {
        id: { [Op.in]: yarnCountIds }
      },
      attributes: ["id", "yarnCount_name"]
    });

    const yarnCountMap = yarnCounts.reduce((map: any, yarnCount: any) => {
      map[yarnCount.id] = yarnCount.yarnCount_name;
      return map;
    }, {});

    // Append data to worksheet
    for await (const [index, item] of rows.entries()) {
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
    res.status(200).send({
      success: true,
      messgage: "File successfully Generated",
      data: process.env.BASE_URL + "Knitter_yarn_receipt.xlsx",
    });
    // await ExportData.update({
    //   knitter_yarn_receipt_load: false
    // }, { where: { knitter_yarn_receipt_load: true } })
  } catch (error: any) {
    // (async () => {
    //   await ExportData.update({
    //     knitter_yarn_receipt_load: false
    //   }, { where: { knitter_yarn_receipt_load: true } })
    // })()
    console.error("Error appending data:", error);
    return res.sendError(res, error.message, error);
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
    return res.sendError(res, error.message, error);
  }
};

const exportKnitterYarnProcess = async (req: Request, res: Response) => {
  // knitter_yarn_process_load
  // await ExportData.update({
  //   knitter_yarn_process_load: true
  // }, { where: { knitter_yarn_process_load: false } })
  // res.send({ status: 200, message: "export file processing" })
  const excelFilePath = path.join("./upload", "Knitter_yarn_process.xlsx");
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
    worksheet.mergeCells("A1:Q1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Knitter Yarn Process Report";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.",
      "Date of Process",
      "Date",
      "Fabric Production Start Date",
      "Fabric Production End Date",
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
        from_date: item.from_date ? item.from_date : "",
        to_date: item.to_date ? item.to_date : "",
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
    res.status(200).send({
      success: true,
      messgage: "File successfully Generated",
      data: process.env.BASE_URL + "Knitter_yarn_process.xlsx",
    });
    // await ExportData.update({
    //   knitter_yarn_process_load: false
    // }, { where: { knitter_yarn_process_load: true } })
  } catch (error: any) {
    // (async () => {
    //   await ExportData.update({
    //     knitter_yarn_process_load: false
    //   }, { where: { knitter_yarn_process_load: true } })
    // })()
    console.log(error);
    return res.sendError(res, error.message, error);
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
    return res.sendError(res, error.message, error);
  }
};

const exportKnitterSale = async (req: Request, res: Response) => {
  // knitter_fabric_sales_load
  // await ExportData.update({
  //   knitter_fabric_sales_load: true
  // }, { where: { knitter_fabric_sales_load: false } })
  // res.send({ status: 200, message: "export file processing" })
  const excelFilePath = path.join(
    "./upload",
    "Knitter_fabric_sale_report.xlsx"
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
    res.status(200).send({
      success: true,
      messgage: "File successfully Generated",
      data: process.env.BASE_URL + "Knitter_fabric_sale_report.xlsx",
    });
    // await ExportData.update({
    //   knitter_fabric_sales_load: false
    // }, { where: { knitter_fabric_sales_load: true } })
  } catch (error: any) {
    // (async () => {
    //   await ExportData.update({
    //     knitter_fabric_sales_load: false
    //   }, { where: { knitter_fabric_sales_load: true } })
    // })()
    console.error("Error appending data:", error);
    return res.sendError(res, error.message, error);
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
          [Sequelize.fn('STRING_AGG', Sequelize.literal('DISTINCT "process"."reel_lot_no"'), ', '), "reel_lot_no"],
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

      const yarnCountNames = yarncount?.map((yc: any) => yc.yarnCount_name);

      data.push({
        ...row.dataValues,
        yarnCount_names: yarnCountNames,
      });
    }
    return res.sendPaginationSuccess(res, data, count?.length);
  } catch (error: any) {
    return res.sendError(res, error.message, error);
  }
};

const exportWeaverYarn = async (req: Request, res: Response) => {
  // weaver_yarn_receipt_load
  // await ExportData.update({
  //   weaver_yarn_receipt_load: true
  // }, { where: { weaver_yarn_receipt_load: false } })
  // res.send({ status: 200, message: "export file processing" })
  const excelFilePath = path.join("./upload", "Weaver_yarn.xlsx");
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
      "Yarn Reel No",
      "Lot/Batch Number",
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
          [Sequelize.fn('STRING_AGG', Sequelize.literal('DISTINCT "process"."reel_lot_no"'), ', '), "reel_lot_no"],
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

    const yarnCountIds = rows.flatMap((row: any) => row.dataValues.yarn_count || []);
    const yarnCounts = await YarnCount.findAll({
      where: {
        id: { [Op.in]: yarnCountIds }
      },
      attributes: ["id", "yarnCount_name"]
    });

    const yarnCountMap = yarnCounts.reduce((map: any, yarnCount: any) => {
      map[yarnCount.id] = yarnCount.yarnCount_name;
      return map;
    }, {});

    // Append data to worksheet
    for await (const [index, item] of rows.entries()) {

      const rowValues = Object.values({
        index: index + 1,
        accept_date: item.dataValues.accept_date
          ? item.dataValues.accept_date
          : "",
        date: item.dataValues.date ? item.dataValues.date : "",
        spinner: item.dataValues.spinner ? item.dataValues.spinner : "",
        buyer_id: item.dataValues.weaver ? item.dataValues.weaver : "",
        invoice: item.dataValues.invoice_no ? item.dataValues.invoice_no : "",
        reelLot: item.dataValues.reel_lot_no ? item.dataValues.reel_lot_no : "",
        lotNo: item.dataValues.batch_lot_no ? item.dataValues.batch_lot_no : "",
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
    res.status(200).send({
      success: true,
      messgage: "File successfully Generated",
      data: process.env.BASE_URL + "Weaver_yarn.xlsx",
    });
    // await ExportData.update({
    //   weaver_yarn_receipt_load: false
    // }, { where: { weaver_yarn_receipt_load: true } })
  } catch (error: any) {
    // (async () => {
    //   await ExportData.update({
    //     weaver_yarn_receipt_load: false
    //   }, { where: { weaver_yarn_receipt_load: true } })
    // })()
    console.error("Error appending data:", error);
    return res.sendError(res, error.message, error);
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
    return res.sendError(res, error.message, error);
  }
};

const exportWeaverYarnProcess = async (req: Request, res: Response) => {
  // weaver_yarn_process_load
  // await ExportData.update({
  //   weaver_yarn_process_load: true
  // }, { where: { weaver_yarn_process_load: false } })
  // res.send({ status: 200, message: "export file processing" })
  const excelFilePath = path.join("./upload", "Weaver_yarn_process.xlsx");
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
    worksheet.mergeCells("A1:Q1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Weaver Yarn Process Report";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.",
      "Date of Process",
      "Date",
      "Fabric Production Start Date",
      "Fabric Production End Date",
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
        from_date: item.from_date ? item.from_date : "",
        to_date: item.to_date ? item.to_date : "",
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
    res.status(200).send({
      success: true,
      messgage: "File successfully Generated",
      data: process.env.BASE_URL + "Weaver_yarn_process.xlsx",
    });
    // await ExportData.update({
    //   weaver_yarn_process_load: false
    // }, { where: { weaver_yarn_process_load: true } })
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message, error);
    // (async () => {
    // await ExportData.update({
    //   weaver_yarn_process_load: false
    // }, { where: { weaver_yarn_process_load: true } })
    // })()

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
    return res.sendError(res, error.message, error);
  }
};

const exportWeaverSale = async (req: Request, res: Response) => {
  // weaver_yarn_sales_load
  // await ExportData.update({
  //   weaver_yarn_sales_load: true
  // }, { where: { weaver_yarn_sales_load: false } })
  // res.send({ status: 200, message: "export file processing" })
  const excelFilePath = path.join("./upload", "Weaver_fabric_sale_report.xlsx");
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
    res.status(200).send({
      success: true,
      messgage: "File successfully Generated",
      data: process.env.BASE_URL + "Weaver_fabric_sale_report.xlsx",
    });
    // await ExportData.update({
    //   weaver_yarn_sales_load: false
    // }, { where: { weaver_yarn_sales_load: true } })
  } catch (error: any) {
    // (async () => {
    //   await ExportData.update({
    //     weaver_yarn_sales_load: false
    //   }, { where: { weaver_yarn_sales_load: true } })
    // })()
    console.error("Error appending data:", error);
    return res.sendError(res, error.message, error);
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
    return res.sendError(res, error.message, error);
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
    return res.sendError(res, error.message, error);
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
    return res.sendError(res, error.message, error);
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
    worksheet.mergeCells("A1:Q1");
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
      "Garment Production Start Date",
      "Garment Production End Date",
      "Season",
      "Garment Processor Unit",
      "Fabric Order Reference No.",
      "Brand Order Reference No.",
      "Factory Lot No.",
      "REEL Lot No.",
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
        from_date: item.from_date ? item.from_date : "",
        to_date: item.to_date ? item.to_date : "",
        season: item.season ? item.season.name : "",
        garment: item.garment ? item.garment.name : "",
        fabricOrderRef: item.fabric_order_ref ? item.fabric_order_ref : "",
        brandOrderRef: item.brand_order_ref ? item.brand_order_ref : "",
        lotNo: item.factory_lot_no ? item.factory_lot_no : "",
        reelLotNo: item.reel_lot_no ? item.reel_lot_no : "",
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
    return res.sendError(res, error.message, error);
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
    return res.sendError(res, error.message, error);
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
    return res.sendError(res, error.message, error);
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
    return res.sendError(res, error.message, error);
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
      "Programme",
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
    return res.sendError(res, error.message, error);
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
      order: [["name", "asc"]],
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
              { greyout_status: false,  greyed_out_qty: { [Op.gt]: 0 }, },
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
  const baleCondition: any = {};
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
        baleCondition["$sales.program_id$"] = { [Op.in]: idArray };
        ginSalesCondition.program_id = { [Op.in]: idArray };
        spinSalesCondition.program_id = { [Op.in]: idArray };
        spinProcessCondition.program_id = { [Op.in]: idArray };
      }

      // Create the excel workbook file
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet1");
      // worksheet.mergeCells("A1:M1");
      // const mergedCell = worksheet.getCell("A1");
      // mergedCell.value = "CottonConnect | Spinner Summary Report";
      // mergedCell.font = { bold: true };
      // mergedCell.alignment = { horizontal: "center", vertical: "middle" };
      // Set bold font for header row
      const headerRow = worksheet.addRow([
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

      let { count, rows } = await Spinner.findAndCountAll({
        where: whereCondition,
        attributes: ["id", "name", "address", "country_id", "state_id"],
        offset: offset,
        limit: limit,
        include:[
          {
            model: Country,
            as: "country",
            attributes: ["county_name"],
          },
          {
            model: State,
            as: "state",
            attributes: ["state_name"],
          },
        ],
        order: [["name", "asc"]],
      });


      let totals = {
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
        obj.lintConsumedMT = convert_kg_to_mt(obj.lintConsumedKG);
        obj.lintStockMT = convert_kg_to_mt(obj.lintStockKG);
        obj.lintGreyoutMT = convert_kg_to_mt(obj.lintGreyoutKg);
        obj.lintActualStockMT = convert_kg_to_mt(obj.lintActualStockKg);
        obj.yarnSoldMT = convert_kg_to_mt(obj.yarnSoldKG);
        obj.yarnProcuredMT = convert_kg_to_mt(obj.yarnProcuredKG);
        obj.yarnStockMT = convert_kg_to_mt(obj.yarnStockKG);
        obj.yarnGreyoutMT = convert_kg_to_mt(obj.yarnGreyoutKg);
        obj.yarnActualStockMT = convert_kg_to_mt(obj.yarnActualStockKg);

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


        const rowValues = Object.values(rowVal);
        worksheet.addRow(rowValues);

        totals.total_lint_cotton_procured+=Number(rowVal.lint_cotton_procured);
        totals.total_lint_cotton_procured_pending+=Number(rowVal.lint_cotton_procured_pending);
        totals.total_lint_consumed+=Number(rowVal.lint_consumed);
        totals.total_lintGreyoutMT+=Number(rowVal.lintGreyoutMT);
        totals.total_lintActualStockMT+=Number(rowVal.lintActualStockMT);
        totals.total_balance_lint_cotton+=Number(rowVal.balance_lint_cotton);
        totals.total_yarn_procured+=Number(rowVal.yarn_procured);
        totals.total_yarn_sold+=Number(rowVal.yarn_sold);
        totals.total_yarnGreyoutMT+=Number(rowVal.lintGreyoutMT);
        totals.total_yarnActualStockMT+=Number(rowVal.yarnActualStockMT);
        totals.total_yarn_stock+=Number(rowVal.yarn_stock);
      }


      const rowVal ={
        index:"Totals",
        country:"",
        state:"",
        name:"",
        lint_cotton_procured:Number(formatDecimal(totals.total_lint_cotton_procured)),
        lint_cotton_procured_pending:Number(formatDecimal(totals.total_lint_cotton_procured_pending)),
        lint_consumed:Number(formatDecimal(totals.total_lint_consumed)),
        lintGreyoutMT:Number(formatDecimal(totals.total_lintGreyoutMT)),
        lintActualStockMT:Number(formatDecimal(totals.total_lintActualStockMT)),
        balance_lint_cotton:Number(formatDecimal(totals.total_balance_lint_cotton)),
        yarn_procured:Number(formatDecimal(totals.total_yarn_procured)),
        yarn_sold:Number(formatDecimal(totals.total_yarn_sold)),
        yarnGreyoutMT:Number(formatDecimal(totals.total_lintGreyoutMT)),
        yarnActualStockMT:Number(formatDecimal(totals.total_yarnActualStockMT)),
        yarn_stock:Number(formatDecimal(totals.total_yarn_stock)),
      }; 

      const rowValues = Object.values(rowVal);
      worksheet.addRow(rowValues).eachCell((cell, colNumber) => { cell.font={bold:true}});

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
    return res.sendError(res, error.message, error);
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
  const cottenSectionWhere: any = {};
  const ginToGinWhere: any = {};
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
      cottenSectionWhere["$ginprocess.program_id$"] = { [Op.in]: idArray };
      ginToGinWhere["$ginsales.program_id$"] = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      transactionWhere.season_id = { [Op.in]: idArray };
      ginBaleWhere["$ginprocess.season_id$"] = { [Op.in]: idArray };
      baleSelectionWhere["$sales.season_id$"] = { [Op.in]: idArray };
      cottenSectionWhere["$ginprocess.season_id$"] = { [Op.in]: idArray };
      ginToGinWhere["$ginsales.season_id$"] = { [Op.in]: idArray };
    }

    let { count, rows } = await Ginner.findAndCountAll({
      where: whereCondition,
      attributes: ["id", "name", "address", "state_id", "country_id"],
      offset: offset,
      limit: limit,
      order: [["name", "ASC"]],
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
    }
    );
    let result: any = [];
    for await (let ginner of rows) {
      let obj: any = {};

      let [cottonProcured, cottonProcessed, cottonProcessedByHeap, lintProcured, greyoutLint, lintSold, ginToGinSale, ginToGinReceive, old_weight]: any =
        await Promise.all([
          // Transaction.findOne({
          //   attributes: [
          //     [
          //       sequelize.fn(
          //         "COALESCE",
          //         sequelize.fn(
          //           "SUM",
          //           Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")
          //         ),
          //         0
          //       ),
          //       "qty",
          //     ],
          //   ],
          //   where: {
          //     ...transactionWhere,
          //     mapped_ginner: ginner.id,
          //   },
          // }),
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
          CottonSelection.findOne({
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
              ...cottenSectionWhere,
              '$ginprocess.ginner_id$': ginner.id
            },
            group: ["ginprocess.ginner_id"]
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
              ...cottenSectionWhere,
              '$ginprocess.ginner_id$': ginner.id
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
              ...ginBaleWhere,
              "$ginprocess.ginner_id$": ginner.id,
              [Op.or]: [
                {
                  [Op.and]: [
                    { "$ginprocess.greyout_status$": true },
                    { sold_status: false },
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
              },
            ],
            where: {
              ...baleSelectionWhere,
              "$sales.ginner_id$": ginner.id,
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
              "$sales.ginner_id$": ginner.id,
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
              ...ginToGinWhere,
              "$ginsales.buyer_ginner$": ginner.id,
              "$ginsales.status$": { [Op.in]: ['Partially Accepted', 'Partially Rejected', 'Sold'] },
              gin_accepted_status: { [Op.is]: true },
              "$ginsales.buyer_type$": 'Ginner'
            },
            group: ["ginsales.buyer_ginner"]
          }),
          GinBale.findOne({
            attributes: [
              [
                sequelize.fn(
                  "COALESCE",
                  sequelize.fn(
                    "SUM",
                    sequelize.literal('CAST("gin-bales"."old_weight" AS DOUBLE PRECISION)')
                  ),
                  0
                ),
                "total_old_weight", // Use a meaningful alias
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
            raw: true // Get raw data for easier access
          }),
        
        ]);
      const cottonProcessedQty = isNaN(cottonProcessed?.dataValues?.qty) ? 0 : cottonProcessed?.dataValues?.qty;
      const cottonProcessedByHeapQty = isNaN(cottonProcessedByHeap?.dataValues?.qty) ? 0 : cottonProcessedByHeap?.dataValues?.qty;
      const totalCottonProcessedQty = cottonProcessedQty + cottonProcessedByHeapQty;
      obj.old_weight = old_weight?.total_old_weight ? parseFloat(Number(old_weight.total_old_weight).toFixed(2)) : 0;
      obj.cottonProcuredKg = cottonProcured?.dataValues?.qty ?? 0;
      obj.cottonProcessedKg = totalCottonProcessedQty ?? 0;
      obj.cottonStockKg = cottonProcured ? cottonProcured?.dataValues?.qty - (cottonProcessed ? totalCottonProcessedQty : 0) : 0;
      obj.cottonProcuredMt = convert_kg_to_mt(cottonProcured?.dataValues.qty ?? 0);
      obj.cottonProcessedeMt = convert_kg_to_mt(totalCottonProcessedQty);
      obj.cottonStockMt = convert_kg_to_mt(cottonProcured ? cottonProcured?.dataValues?.qty - totalCottonProcessedQty : 0);
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
      obj.lintActualStockMT = (ginner.id === 502 && seasonId && Number(seasonId) === 9) 
        ? 0 
        :  (Number(obj.lintProcuredMt) + Number(obj.total_qty_lint_received)) > (Number(obj.lintSoldMt) + Number(obj.lintGreyoutMT) + Number(obj.total_qty_lint_transfered))
          ? (Number(obj.lintProcuredMt) + Number(obj.total_qty_lint_received)) - (Number(obj.lintSoldMt) + Number(obj.lintGreyoutMT) + Number(obj.total_qty_lint_transfered))
          : 0;
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
      obj.balesGreyout = greyoutLint?.dataValues?.bales_procured
        ? Number(greyoutLint?.dataValues?.bales_procured)
        : 0;
      obj.balesSold = lintSold?.dataValues?.bales_sold
        ? Number(lintSold?.dataValues?.bales_sold)
        : 0;
      obj.balesActualStock =
        (obj.balesProduced + obj.total_bales_received) > (obj.balesSold + obj.total_bales_transfered + obj.balesGreyout)
          ? (obj.balesProduced + obj.total_bales_received) - (obj.balesSold + obj.total_bales_transfered + obj.balesGreyout)
          : 0;
      obj.balesStock =
        obj.balesProduced > obj.balesSold
          ? obj.balesProduced - obj.balesSold
          : 0;
      obj.country = ginner.country.county_name;
      obj.state = ginner.state.state_name;
      result.push({ ...obj, ginner });
    }
    //fetch data with pagination

    return res.sendPaginationSuccess(res, result, count);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message, error);
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
  const cottenSectionWhere: any = {};
  const ginToGinWhere: any = {};
  try {
    
      if (exportType === "all") {
        return res.status(200).send({
          success: true,
          messgage: "File successfully Generated",
          data: process.env.BASE_URL + "ginner-summary.xlsx",
        });
  
      } else 
  
    {
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
        cottenSectionWhere["$ginprocess.program_id$"] = { [Op.in]: idArray };
        ginToGinWhere["$ginsales.program_id$"] = { [Op.in]: idArray };
      }

      if (seasonId) {
        const idArray: number[] = seasonId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        transactionWhere.season_id = { [Op.in]: idArray };
        ginBaleWhere["$ginprocess.season_id$"] = { [Op.in]: idArray };
        baleSelectionWhere["$sales.season_id$"] = { [Op.in]: idArray };
        cottenSectionWhere["$ginprocess.season_id$"] = { [Op.in]: idArray };
        ginToGinWhere["$ginsales.season_id$"] = { [Op.in]: idArray };
      }


      // Create the excel workbook file
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet1");
      // worksheet.mergeCells('A1:S1');
      // const mergedCell = worksheet.getCell('A1');
      // mergedCell.value = 'CottonConnect | Ginner Summary Report';
      // mergedCell.font = { bold: true };
      // mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
      // Set bold font for header row
      const headerRow = worksheet.addRow([
        "S. No.", "Ginner Name", "Country", "State", "Total seed cotton procured (MT)", "Total seed cotton processed (MT)",
        "Total seed cotton in stock (MT)", "Total lint produce (MT)", "Total lint sold (MT)", "Grey-Out Lint Quantity (MT)", "Total Lint Received (MT)", "Total Lint Transfered (MT)", "Actual lint in stock (MT)", "Total lint in stock (MT)",
        "Total bales produced", "Total Bales sold", "Total Bales Greyout", "Total Bales Received", "Total Bales Transfered", "Actual Bales in stock", "Total bales in stock"
      ]);
      headerRow.font = { bold: true };
      let options = /*(exportType === "all") ? {
        attributes: ["id", "name", "address", "state_id", "country_id"],
        order: [["name", "ASC"]]
      } : */
      {
        where: whereCondition,
        attributes: ["id", "name", "address", "state_id", "country_id"],
        offset: offset,
        limit: limit,

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
        order: [["name", "ASC"]]
      };


      let totals = {
        cottonProcuredMt:0,
          cottonProcessedeMt:0,
          cottonStockMt:0,
          lintProcuredMt:0,
          lintSoldMt:0,
          lintGreyoutMT:0,
          total_qty_lint_received:0,
          total_qty_lint_transfered:0,
          lintActualStockMT:0,
          lintStockMt:0,
          balesProduced:0,
          balesSold:0,
          balesGreyout:0,
          total_bales_received:0,
          total_bales_transfered:0,
          balesActualStock:0,
          balesStock:0,
      };


      let rows = await Ginner.findAll(options);

      // Append data to worksheet
      for await (const [index, item] of rows.entries()) {
        let obj: any = {};


        let [cottonProcured, cottonProcessed, cottonProcessedByHeap, lintProcured, greyoutLint, lintSold, ginToGinSale, ginToGinReceive]: any = await Promise.all([
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
              ...cottenSectionWhere,
              '$ginprocess.ginner_id$': item.id
            },
            group: ["ginprocess.ginner_id"]
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
              ...cottenSectionWhere,
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
              [Op.or]: [
                {
                  [Op.and]: [
                    { "$ginprocess.greyout_status$": true },
                    { sold_status: false },
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
              "$sales.ginner_id$": item.id,
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
              ...ginToGinWhere,
              "$ginsales.buyer_ginner$": item.id,
              "$ginsales.status$": { [Op.in]: ['Partially Accepted', 'Partially Rejected', 'Sold'] },
              gin_accepted_status: { [Op.is]: true },
              "$ginsales.buyer_type$": 'Ginner'
            },
            group: ["ginsales.buyer_ginner"]
          }),      
        ]);
        const cottonProcessedQty = isNaN(cottonProcessed?.dataValues?.qty) ? 0 : cottonProcessed?.dataValues?.qty;
        const cottonProcessedByHeapQty = isNaN(cottonProcessedByHeap?.dataValues?.qty) ? 0 : cottonProcessedByHeap?.dataValues?.qty;
        const totalCottonProcessedQty = cottonProcessedQty + cottonProcessedByHeapQty;

        obj.cottonProcuredKg = cottonProcured?.dataValues?.qty ?? 0;
        obj.cottonProcessedKg = totalCottonProcessedQty ?? 0;
        obj.cottonStockKg = cottonProcured ?
          cottonProcured?.dataValues?.qty - (cottonProcessed ? totalCottonProcessedQty : 0)
          : 0;
        obj.cottonProcuredMt = convert_kg_to_mt(cottonProcured?.dataValues.qty ?? 0);
        obj.cottonProcessedeMt = convert_kg_to_mt(totalCottonProcessedQty ?? 0);
        obj.cottonStockMt = convert_kg_to_mt(cottonProcured ? cottonProcured?.dataValues?.qty - totalCottonProcessedQty : 0);
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
        obj.lintActualStockMT = (item.id === 502 && seasonId && Number(seasonId) === 9) 
        ? 0  
        : (Number(obj.lintProcuredMt) + Number(obj.total_qty_lint_received)) > (Number(obj.lintSoldMt) + Number(obj.lintGreyoutMT) + Number(obj.total_qty_lint_transfered))
          ? (Number(obj.lintProcuredMt) + Number(obj.total_qty_lint_received)) - (Number(obj.lintSoldMt) + Number(obj.lintGreyoutMT) + Number(obj.total_qty_lint_transfered))
          : 0;
        obj.lintStockKg = Number(obj.lintProcuredKg) > Number(obj.lintSoldKg) ? Number(obj.lintProcuredKg) - Number(obj.lintSoldKg) : 0;
        obj.lintStockMt = Number(obj.lintProcuredKg) > Number(obj.lintSoldKg) ? Number(obj.lintProcuredMt) - Number(obj.lintSoldMt) : 0;
        obj.balesProduced = lintProcured?.dataValues?.bales_procured ? Number(lintProcured?.dataValues?.bales_procured) : 0;
        obj.balesGreyout = greyoutLint?.dataValues?.bales_procured
        ? Number(greyoutLint?.dataValues?.bales_procured)
        : 0;
        obj.balesSold = lintSold?.dataValues?.bales_sold ? Number(lintSold?.dataValues?.bales_sold) : 0;
        obj.balesActualStock =
        (obj.balesProduced + obj.total_bales_received) > (obj.balesSold + obj.total_bales_transfered + obj.balesGreyout)
          ? (obj.balesProduced + obj.total_bales_received) - (obj.balesSold + obj.total_bales_transfered + obj.balesGreyout)
          : 0;
        obj.balesStock = obj.balesProduced > obj.balesSold ? obj.balesProduced - obj.balesSold : 0;

        obj.country = item.country.county_name;
        obj.state = item.state.state_name;

        const rowValues = {
          index: index + 1,
          name: item.name ? item.name : '',
          country: obj.country,
          state: obj.state,
          cottonProcuredMt: obj.cottonProcuredMt ? Number(obj.cottonProcuredMt) : 0,
          cottonProcessedeMt: obj.cottonProcessedeMt ? Number(obj.cottonProcessedeMt) : 0,
          cottonStockMt: obj.cottonStockMt ? Number(obj.cottonStockMt) : 0,
          lintProcuredMt: obj.lintProcuredMt ? Number(obj.lintProcuredMt) : 0,
          lintSoldMt: obj.lintSoldMt ? Number(obj.lintSoldMt) : 0,
          lintGreyoutMT: obj.lintGreyoutMT ? Number(obj.lintGreyoutMT) : 0,
          total_qty_lint_received: obj.total_qty_lint_received ? Number(obj.total_qty_lint_received) : 0,
          total_qty_lint_transfered: obj.total_qty_lint_transfered ? Number(obj.total_qty_lint_transfered) : 0,
          lintActualStockMT: obj.lintActualStockMT ? Number(obj.lintActualStockMT) : 0,
          lintStockMt: obj.lintStockMt,
          balesProduced: obj.balesProduced,
          balesSold: obj.balesSold,
          balesGreyout: obj.balesGreyout,
          total_bales_received: obj.total_bales_received,
          total_bales_transfered: obj.total_bales_transfered,
          balesActualStock: obj.balesActualStock,
          balesStock: obj.balesStock
        };


        totals.cottonProcessedeMt+= Number(rowValues.cottonProcessedeMt ); 
        totals.cottonProcuredMt+= Number(rowValues.cottonProcuredMt );                
        totals.cottonStockMt+= Number(rowValues.cottonStockMt );
        totals.lintProcuredMt+= Number(rowValues.lintProcuredMt );
        totals.lintSoldMt+= Number(rowValues.lintSoldMt );
        totals.lintGreyoutMT+= Number(rowValues.lintGreyoutMT );
        totals.total_qty_lint_received+= Number(rowValues.total_qty_lint_received );
        totals.total_qty_lint_transfered+= Number(rowValues.total_qty_lint_transfered );
        totals.lintActualStockMT+= Number(rowValues.lintActualStockMT );
        totals.lintStockMt+= Number(rowValues.lintStockMt );
        totals.balesProduced+= Number(rowValues.balesProduced );
        totals.balesSold+= Number(rowValues.balesSold );
        totals.balesGreyout+= Number(rowValues.balesGreyout );
        totals.total_bales_received+= Number(rowValues.total_bales_received );
        totals.total_bales_transfered+= Number(rowValues.total_bales_transfered );
        totals.balesActualStock+= Number(rowValues.balesActualStock );
        totals.balesStock+= Number(rowValues.balesStock );

        worksheet.addRow(Object.values(rowValues));
      }


      
      const rowValues = {
        index:"Totals:",
        name:"",
        country:"",
        state:"",
        cottonProcuredMt: totals.cottonProcuredMt,
        cottonProcessedeMt: totals.cottonProcessedeMt,
        cottonStockMt: totals.cottonStockMt,
        lintProcuredMt: totals.lintProcuredMt,
        lintSoldMt: totals.lintSoldMt,
        lintGreyoutMT: totals.lintGreyoutMT,
        total_qty_lint_received: totals.total_qty_lint_received, 
        total_qty_lint_transfered: totals.total_qty_lint_transfered,
        lintActualStockMT: totals.lintActualStockMT,
        lintStockMt: totals.lintStockMt,
        balesProduced: totals.balesProduced,
        balesSold: totals.balesSold,
        balesGreyout: totals.balesGreyout,
        total_bales_received: totals.total_bales_received,
        total_bales_transfered: totals.total_bales_transfered,
        balesActualStock: totals.balesActualStock,
        balesStock: totals.balesStock,
      };
     
      worksheet.addRow(Object.values(rowValues)).eachCell(cell=> cell.font = {bold: true});

      // Define a border style
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
          const cellLength = (cell.value ? cell.value.toString() : '').length;
          maxCellLength = Math.max(maxCellLength, cellLength);
          cell.border = borderStyle;
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
    return res.sendError(res, error.message, error);

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
  const cottenSectionWhere:any = {};
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
      cottenSectionWhere["$ginprocess.program_id$"] = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.season_id = { [Op.in]: idArray };
      cottenSectionWhere["$ginprocess.season_id$"] = { [Op.in]: idArray };
    }

    let include = [
      {
        model: Ginner,
        as: "ginner",
        // include: [
        //   {
        //     model: Country,
        //     as  : "country",
        //   },
        //   {
        //     model: State,
        //     as  : "state",
        //   }
        // ]
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

    let { count, rows } = await GinProcess.findAndCountAll({
      attributes: [
        [Sequelize.literal('"ginner"."id"'), "ginner_id"],
        [Sequelize.literal('"ginner"."name"'), "ginner_name"],
        [Sequelize.literal('"season"."id"'), "season_id"],
        [Sequelize.col('"season"."name"'), "season_name"],
        [Sequelize.literal('"ginner"."country_id"'), "country_id"],
        [Sequelize.literal('"ginner"."state_id"'), "state_id"],
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
      where: whereCondition,
      include: include,
      group: ["ginner.id", "season.id", "program.id"],
      order: [["ginner_name", "ASC"]],
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
          season_id: ginner.season_id,
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
          ...cottenSectionWhere,
          '$ginprocess.ginner_id$': ginner.ginner_id,
          '$ginprocess.season_id$': ginner.season_id,
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
          ...cottenSectionWhere,
          '$ginprocess.ginner_id$': ginner.ginner_id,
          '$ginprocess.season_id$': ginner.season_id,
        },
        group: ["ginprocess.ginner_id"]
      });

      const country_name = await Country.findOne({
        attributes: ["county_name"],
        where: {
          id: ginner.ginner.country_id,
        },
      });

      const state_name = await State.findOne({
        attributes: ["state_name"],
        where: {
          id: ginner.ginner.state_id,
        },
      });
      const cottonProcessedQty = isNaN(cottonProcessed?.dataValues?.qty) ? 0 : cottonProcessed?.dataValues?.qty;
      const cottonProcessedByHeapQty = isNaN(cottonProcessedByHeap?.dataValues?.qty) ? 0 : cottonProcessedByHeap?.dataValues?.qty;
      const totalCottonProcessedQty = cottonProcessedQty + cottonProcessedByHeapQty;

      obj.cotton_procured = cottonProcured?.dataValues?.cotton_procured ?? 0;
      obj.cotton_stock = cottonProcured?.dataValues?.cotton_stock ?? 0;
      obj.cotton_processed = totalCottonProcessedQty ?? 0;
      obj.country = country_name?.dataValues.county_name;
      obj.state = state_name?.dataValues.state_name;
      result.push({ ...ginner?.dataValues, ...obj});
    }
    //fetch data with pagination

    // let data = result.slice(offset, offset + limit);

    return res.sendPaginationSuccess(res, result, count?.length);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message, error);
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
  const cottenSectionWhere:any = {};
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
        cottenSectionWhere["$ginprocess.program_id$"] = { [Op.in]: idArray };
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
      /*
      worksheet.mergeCells("A1:F1");
      const mergedCell = worksheet.getCell("A1");
      mergedCell.value = "CottonConnect | Ginner Seed Cotton Stock Report";
      mergedCell.font = { bold: true };
      mergedCell.alignment = { horizontal: "center", vertical: "middle" };
      */
      // Set bold font for header row
      const headerRow = worksheet.addRow([
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
        where: whereCondition,
        include: include,
        group: ["ginner.id", "season.id", "ginner.country.id", "ginner->state.id", "program.id"],
        order: [["ginner_name", "ASC"]],
        limit: limit,
        offset: offset,
      });

      let totals = {
        total_cotton_procured:0,
        total_cotton_processed:0,
        total_cotton_stock:0,
      }

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
            ...cottenSectionWhere,
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
            ...cottenSectionWhere,
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
          index: index + 1,
          ginner: item?.dataValues.ginner_name ? item?.dataValues.ginner_name : "",
          season: item?.dataValues.season_name ? item?.dataValues.season_name : "",
          country: item?.dataValues.ginner.country.county_name,
          state: item?.dataValues.ginner.state.state_name,
          cotton_procured: obj.cotton_procured ? obj.cotton_procured : 0,
          cotton_processed: obj.cotton_processed ? obj.cotton_processed : 0,
          cotton_stock: obj.cotton_stock ? obj.cotton_stock : 0,
        });

        totals.total_cotton_processed += obj.cotton_processed?Number(obj.cotton_processed):0;
        totals.total_cotton_procured += obj.cotton_procured?Number(obj.cotton_procured):0;
        totals.total_cotton_stock += obj.cotton_stock?Number(obj.cotton_stock):0;

        worksheet.addRow(rowValues);
      }

      const rowValues = Object.values({
        index: "Total: ",
        ginner:  "",
        season:  "",
        country: "",
        state: "",
        cotton_procured: Number(formatDecimal(totals.total_cotton_procured)),
        cotton_processed: Number(formatDecimal(totals.total_cotton_processed)),
        cotton_stock: Number(formatDecimal(totals.total_cotton_stock)),
      });
      worksheet.addRow(rowValues).eachCell((cell, colNumber) => { cell.font={bold:true}});
     

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
      return res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "excel-ginner-seed-cotton-stock-report.xlsx",
      });
    }
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message, error);

  }
};


const fetchSpinnerLintCottonStock = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const { spinnerId, seasonId, programId, brandId, countryId, stateId }: any = req.query;
  const whereCondition: any = {};
  const transactionWhere: any = {};
  const sqlCondition: any = [];
  try {
    if (searchTerm) {
      sqlCondition.push(`
        (
          sp.name ILIKE '%${searchTerm}%' OR
          g.name ILIKE '%${searchTerm}%' OR
          s.name ILIKE '%${searchTerm}%' OR
          gs.invoice_no ILIKE '%${searchTerm}%' OR
          gs.lot_no ILIKE '%${searchTerm}%' OR
          gs.reel_lot_no ILIKE '%${searchTerm}%'
        )
      `);
    }

    if (brandId) {
      const idArray = brandId.split(",").map((id: any) => parseInt(id, 10));
      sqlCondition.push(`sp.brand && ARRAY[${idArray.join(',')}]`);
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      sqlCondition.push(`sp.country_id IN (${idArray.join(',')})`);
    }

    if (stateId) {
      const idArray: number[] = stateId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      sqlCondition.push(`sp.state_id IN (${idArray.join(',')})`);
    }

    if (spinnerId) {
      const idArray: number[] = spinnerId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      sqlCondition.push(`gs.buyer IN (${idArray.join(',')})`)
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      sqlCondition.push(`gs.season_id IN (${idArray.join(',')})`);
    }

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      sqlCondition.push(`gs.program_id IN (${idArray.join(',')})`);
    }

    // if (ginnerId) {
    //     const idArray: number[] = ginnerId
    //         .split(",")
    //         .map((id: any) => parseInt(id, 10));
    //     sqlCondition.push(`gs.ginner_id IN (${idArray.join(',')})`);
    // }


    sqlCondition.push(`gs.status IN ('Sold', 'Partially Accepted', 'Partially Rejected')`)
    sqlCondition.push(`gs.greyout_status IS NOT TRUE`)
    sqlCondition.push(`gs.qty_stock >= 1`)


    const whereClause = sqlCondition.length > 0 ? `WHERE ${sqlCondition.join(' AND ')}` : '';

    const countQuery = `
        SELECT COUNT(*) AS total_count
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
        ${whereClause}`;

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
        gin_sale_date as (
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
    console.log(error);
    return res.sendError(res, error.message, error);
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
  const { exportType, spinnerId, seasonId, programId, brandId, countryId, stateId }: any = req.query;
  const sqlCondition: any = [];

  try {
    if (exportType === "all") {

      return res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "spinner-lint-cotton-stock-report.xlsx",
      });

    } else {
      if (searchTerm) {
        sqlCondition.push(`
          (
            sp.name ILIKE '%${searchTerm}%' OR
            g.name ILIKE '%${searchTerm}%' OR
            s.name ILIKE '%${searchTerm}%' OR
            gs.invoice_no ILIKE '%${searchTerm}%' OR
            gs.lot_no ILIKE '%${searchTerm}%' OR
            gs.reel_lot_no ILIKE '%${searchTerm}%'
          )
        `);
      }

      if (brandId) {
        const idArray = brandId.split(",").map((id: any) => parseInt(id, 10));
        sqlCondition.push(`sp.brand && ARRAY[${idArray.join(',')}]`);
      }

      if (countryId) {
        const idArray: number[] = countryId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        sqlCondition.push(`sp.country_id IN (${idArray.join(',')})`);
      }

      if (stateId) {
        const idArray: number[] = stateId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        sqlCondition.push(`sp.state_id IN (${idArray.join(',')})`);
      }

      if (spinnerId) {
        const idArray: number[] = spinnerId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        sqlCondition.push(`gs.buyer IN (${idArray.join(',')})`)
      }

      if (seasonId) {
        const idArray: number[] = seasonId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        sqlCondition.push(`gs.season_id IN (${idArray.join(',')})`);
      }

      if (programId) {
        const idArray: number[] = programId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        sqlCondition.push(`gs.program_id IN (${idArray.join(',')})`);
      }

      // if (ginnerId) {
      //     const idArray: number[] = ginnerId
      //         .split(",")
      //         .map((id: any) => parseInt(id, 10));
      //     sqlCondition.push(`gs.ginner_id IN (${idArray.join(',')})`);
      // }


      sqlCondition.push(`gs.status IN ('Sold', 'Partially Accepted', 'Partially Rejected')`)
      sqlCondition.push(`gs.greyout_status IS NOT TRUE`)
      sqlCondition.push(`gs.qty_stock >= 1`);

      const whereClause = sqlCondition.length > 0 ? `WHERE ${sqlCondition.join(' AND ')}` : '';

      // Create the excel workbook file
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet1");
      // worksheet.mergeCells("A1:L1");
      // const mergedCell = worksheet.getCell("A1");
      // mergedCell.value = "CottonConnect | Spinner Lint Cotton Stock Report";
      // mergedCell.font = { bold: true };
      // mergedCell.alignment = { horizontal: "center", vertical: "middle" };
      // Set bold font for header row
      const headerRow = worksheet.addRow([
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


      const countQuery = `
        SELECT COUNT(*) AS total_count
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
        ${whereClause}`;

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
            c.county_name as country,
            st.state_name as state,
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
            countries c ON sp.country_id = c.id
        LEFT JOIN 
            states st ON sp.state_id = st.id
        LEFT JOIN 
            bale_details bd ON gs.id = bd.sales_id
        ${whereClause}
        ORDER BY 
            spinner_name ASC
        LIMIT :limit OFFSET :offset`;

      const [countResult, rows] = await Promise.all([
        sequelize.query(countQuery, {
          type: sequelize.QueryTypes.SELECT,
        }),
        sequelize.query(dataQuery, {
          replacements: { limit, offset },
          type: sequelize.QueryTypes.SELECT,
        })
      ]);

      let totals = {
        cotton_procured: 0,
        cotton_stock: 0,
        greyed_out_qty: 0,
        cotton_consumed: 0,
      };


      for await (const [index, spinner] of rows.entries()) {
        const rowValues = {
          index: index + 1,
          country: spinner?.country ? spinner?.country : "",
          state: spinner?.state ? spinner?.state : "",
          date: spinner?.date ? moment(spinner.date).format('DD-MM-YYYY') : "",
          season: spinner?.season_name ? spinner?.season_name : "",
          ginner_names: spinner?.ginner_name ? spinner?.ginner_name
            : "",
          spinner: spinner?.spinner_name ? spinner?.spinner_name : "",
          reel_lot_no: spinner?.reel_lot_no ? spinner?.reel_lot_no : "",
          invoice_no: spinner?.invoice_no ? spinner?.invoice_no : "",
          batch_lot_no: spinner?.lot_no ? spinner?.lot_no : "",
          cotton_procured: spinner?.accepted_total_qty ? Number(formatDecimal(spinner?.accepted_total_qty)) : 0,
          cotton_stock: spinner?.qty_stock ? Number(formatDecimal(spinner?.qty_stock)) : 0,
          greyed_out_qty: spinner?.greyed_out_qty ? Number(formatDecimal(spinner?.greyed_out_qty)) : 0,
          cotton_consumed: Number(spinner?.accepted_total_qty) > (Number(spinner?.qty_stock) + Number(spinner?.greyed_out_qty)) ? Number(formatDecimal(spinner?.accepted_total_qty)) - (Number(formatDecimal(spinner?.qty_stock)) + Number(formatDecimal(spinner?.greyed_out_qty))) : 0,
        };

        totals.cotton_procured += Number(rowValues.cotton_procured);
        totals.cotton_stock += Number(rowValues.cotton_stock);
        totals.greyed_out_qty += Number(rowValues.greyed_out_qty);
        totals.cotton_consumed += Number(rowValues.cotton_consumed);

        worksheet.addRow(Object.values(rowValues));
      }

    
      const rowValues = {
        index:"Totals: ",
        country:"",
        state:"",
        date:"",
        season:"",
        ginner_names:"",
        spinner:"",
        reel_lot_no:"",
        invoice_no:"",
        batch_lot_no:"",
        cotton_procured: Number(formatDecimal(totals.cotton_procured)),
        cotton_stock: Number(formatDecimal(totals.cotton_stock)),
        greyed_out_qty: Number(formatDecimal(totals.greyed_out_qty)),
        cotton_consumed: Number(formatDecimal(totals.cotton_consumed)),
      };
      worksheet.addRow(Object.values(rowValues)).eachCell(cell=>cell.font={bold : true});

      let borderStyle = {
        top: {style:"thin"},
        left: {style:"thin"},
        bottom: {style:"thin"},
        right: {style:"thin"}
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
      return res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data:
          process.env.BASE_URL + "excel-spinner-lint-cotton-stock-report.xlsx",
      });
    }
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message, error);
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
    return res.sendError(res, error.message, error);
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
        color: process.env.BASE_URL + item.qr,
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
    return res.sendError(res, error.message, error);
  }
};

const fetchPscpPrecurement = async (req: Request, res: Response) => {
  try {
    let { seasonId, countryId, brandId }: any = req.query;
    const searchTerm = req.query.search || "";
    let whereCondition: any = {};
    let transtionCondition: any = {};
    let ginnerCondition: any = {};
    let baleSelectionWhere: any = {};
    let ginnernewCondition: any = {};
    let ginToGinWhere: any = {};
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
      baleSelectionWhere["$sales.ginner.country_id$"] = { [Op.in]: idArray };
      ginToGinWhere["$ginsales.buyerdata_ginner.country_id$"] = { [Op.in]: idArray };
    }

    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$farmer.brand_id$"] = { [Op.in]: idArray };
      transtionCondition["$brand_id$"] = { [Op.in]: idArray };
      ginnerCondition["$ginner.brand$"] = { [Op.overlap]: idArray };
      ginnernewCondition["$ginprocess.ginner.brand$"] = { [Op.overlap]: idArray };
      baleSelectionWhere["$sales.ginner.brand$"] = { [Op.overlap]: idArray };
      ginToGinWhere["$ginsales.buyerdata_ginner.brand$"] = { [Op.overlap]: idArray };
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
        where: { season_id: item.season_id, ...transtionCondition },
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
        where: { season_id: item.season_id, ...ginnerCondition },
        group: ["season_id"],
      });
      let ginbales = await GinBale.findOne({
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
          "$ginprocess.season_id$": item.season_id, ...ginnernewCondition
        },
        group: ["ginprocess.season_id"],
      });
      let processSale = await BaleSelection.findOne({
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
          "$bale.ginprocess.season_id$": item.season_id,
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
          ...baleSelectionWhere,
          "$bale.ginprocess.season_id$": item.season_id,
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
          "$ginprocess.season_id$": item.season_id, 
          ...ginnernewCondition,
          [Op.or]: [
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
              {
                model: Ginner,
                as: "buyerdata_ginner",
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
          ...ginToGinWhere,
          "$ginsales.season_id$": item.season_id,
          "$ginsales.status$": { [Op.in]: ['Partially Accepted', 'Partially Rejected', 'Sold'] },
          gin_accepted_status: { [Op.is]: true },
          "$ginsales.buyer_type$": 'Ginner'
        },
        group: ["ginsales.season_id"]
      })

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
      obj.no_of_bales = processgin?.dataValues.no_of_bales ? Number(processgin?.dataValues.no_of_bales) : 0;
      obj.total_qty_lint_produced = ginbales
        ? (ginbales.dataValues.total_qty ?? 0) / 1000
        : 0;
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
      obj.sold_bales = processSale?.dataValues["no_of_bales"] ? Number(processSale?.dataValues["no_of_bales"]) : 0;
      obj.average_weight =
        (ginbales?.dataValues.total_qty ?? 0) / (obj.no_of_bales ?? 0);
      obj.total_qty_sold_lint =
        (processSale?.dataValues["total_qty"] ?? 0) / 1000;
      obj.balace_stock =
        (obj.no_of_bales + obj.total_bales_received) > (obj.sold_bales + obj.total_bales_transfered + obj.greyout_bales) ? Number((obj.no_of_bales + obj.total_bales_received) - (obj.sold_bales + obj.total_bales_transfered + obj.greyout_bales)) : 0;
      obj.balance_lint_quantity =
        (obj.total_qty_lint_produced + obj.total_qty_lint_received) > (obj.total_qty_sold_lint + obj.total_qty_lint_transfered + obj.greyout_qty) 
          ? (obj.total_qty_lint_produced + obj.total_qty_lint_received) - (obj.total_qty_sold_lint + obj.total_qty_lint_transfered + obj.greyout_qty)
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
    return res.sendError(res, error.message, error);
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
  const { exportType, seasonId, countryId, brandId }: any = req.query;
  const whereCondition: any = {};
  let transtionCondition: any = {};
  let ginnerCondition: any = {};
  let ginnernewCondition: any = {};
  let baleSelectionWhere: any = {};
  let ginToGinWhere: any = {};
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
        baleSelectionWhere["$sales.ginner.country_id$"] = { [Op.in]: idArray };
        ginToGinWhere["$ginsales.buyerdata_ginner.country_id$"] = { [Op.in]: idArray };
      }

      if (brandId) {
        const idArray: number[] = brandId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$farmer.brand_id$"] = { [Op.in]: idArray };
        transtionCondition["$brand_id$"] = { [Op.in]: idArray };
        ginnerCondition["$ginner.brand$"] = { [Op.overlap]: idArray };
        ginnernewCondition["$ginprocess.ginner.brand$"] = { [Op.overlap]: idArray };
        baleSelectionWhere["$sales.ginner.brand$"] = { [Op.overlap]: idArray };
        ginToGinWhere["$ginsales.buyerdata_ginner.brand$"] = { [Op.overlap]: idArray };
      }

      if (searchTerm) {
        whereCondition[Op.or] = [
          { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } }, // Search by first name
        ];
      }

      // Create the excel workbook file
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet1");
      worksheet.mergeCells("A1:T1");
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
        "No. of Bales Greyed Out",
        "Total Quantity of Lint Greyed Out (MT)",
        "No. of Bales Received",
        "Total Quantity of Lint Received (MT)",
        "No. of Bales Transfered",
        "Total Quantity of Lint Transfered (MT)",
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
          where: { season_id: item.season_id, ...transtionCondition },
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
          where: { season_id: item.season_id, ...ginnerCondition },
          group: ["season_id"],
        });
        let ginbales = await GinBale.findOne({
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
            "$ginprocess.season_id$": item.season_id, ...ginnernewCondition
          },
          group: ["ginprocess.season_id"],
        });
        let processSale = await BaleSelection.findOne({
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
            "$bale.ginprocess.season_id$": item.season_id,
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
            ...baleSelectionWhere,
            "$bale.ginprocess.season_id$": item.season_id,
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
            "$ginprocess.season_id$": item.season_id, 
            ...ginnernewCondition,
            [Op.or]: [
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
                {
                  model: Ginner,
                  as: "buyerdata_ginner",
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
            ...ginToGinWhere,
            "$ginsales.season_id$": item.season_id,
            "$ginsales.status$": { [Op.in]: ['Partially Accepted', 'Partially Rejected', 'Sold'] },
            gin_accepted_status: { [Op.is]: true },
            "$ginsales.buyer_type$": 'Ginner'
          },
          group: ["ginsales.season_id"]
        })
  

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
        obj.no_of_bales = processgin?.dataValues.no_of_bales ? Number(processgin?.dataValues.no_of_bales) : 0;
        obj.total_qty_lint_produced = ginbales
          ? (ginbales.dataValues.total_qty ?? 0) / 1000
          : 0;
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
        obj.sold_bales = processSale?.dataValues["no_of_bales"] ? Number(processSale?.dataValues["no_of_bales"]) : 0;
        obj.average_weight =
          (ginbales?.dataValues.total_qty ?? 0) / (obj.no_of_bales ?? 0);
        obj.total_qty_sold_lint =
          (processSale?.dataValues["total_qty"] ?? 0) / 1000;
        obj.balace_stock =
          (obj.no_of_bales + obj.total_bales_received) > (obj.sold_bales + obj.total_bales_transfered + obj.greyout_bales) ? Number((obj.no_of_bales + obj.total_bales_received) - (obj.sold_bales + obj.total_bales_transfered + obj.greyout_bales)) : 0;
        obj.balance_lint_quantity =
          (obj.total_qty_lint_produced + obj.total_qty_lint_received) > (obj.total_qty_sold_lint + obj.total_qty_lint_transfered + obj.greyout_qty) 
            ? (obj.total_qty_lint_produced + obj.total_qty_lint_received) - (obj.total_qty_sold_lint + obj.total_qty_lint_transfered + obj.greyout_qty)
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
          greyout_bales: obj.greyout_bales ? Number(obj.greyout_bales) : 0,
          greyout_qty: obj.greyout_qty ? Number(formatDecimal(obj.greyout_qty)) : 0,
          total_bales_received: obj.total_bales_received ? Number(obj.total_bales_received) : 0,
          total_qty_lint_received: obj.total_qty_lint_received ? Number(formatDecimal(obj.total_qty_lint_received)) : 0,
          total_bales_transfered: obj.total_bales_transfered ? Number(obj.total_bales_transfered) : 0,
          total_qty_lint_transfered: obj.total_qty_lint_transfered ? Number(formatDecimal(obj.total_qty_lint_transfered)) : 0,
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
    return res.sendError(res, error.message, error);
  }
};

const fetchPscpGinnerPrecurement = async (req: Request, res: Response) => {
  try {
    let { seasonId, countryId, brandId }: any = req.query;
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

    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.brand_id = { [Op.in]: idArray };
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
          "$ginprocess.season_id$": seasonId,
          "$ginprocess.ginner_id$": item.dataValues.ginner.id,
        },
        group: ["ginprocess.season_id"],
      });
      let processSale = await BaleSelection.findOne({
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
          "$bale.ginprocess.season_id$": seasonId,
          "$sales.ginner_id$": item.dataValues.ginner.id,
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
          "$bale.ginprocess.season_id$": seasonId,
          "$sales.ginner_id$": item.dataValues.ginner.id,
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
          "$ginprocess.season_id$": seasonId,
          "$ginprocess.ginner_id$": item.dataValues.ginner.id,
          [Op.or]: [
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
          "$ginsales.season_id$": seasonId,
          "$ginsales.buyer_ginner$": item.dataValues.ginner.id,
          "$ginsales.status$": { [Op.in]: ['Partially Accepted', 'Partially Rejected', 'Sold'] },
          gin_accepted_status: { [Op.is]: true },
          "$ginsales.buyer_type$": 'Ginner'
        },
        group: ["ginsales.season_id"]
      })

      obj.procurement_seed_cotton =
        (item?.dataValues?.procurement_seed_cotton ?? 0) / 1000;
      obj.procured_lint_cotton =
        ((item?.dataValues["procurement_seed_cotton"] ?? 0) * 35) / 100 / 1000;
      obj.no_of_bales = processgin?.dataValues.no_of_bales ? Number(processgin?.dataValues.no_of_bales) : 0;
      obj.total_qty_lint_produced = ginbales
        ? (ginbales.dataValues.total_qty ?? 0) / 1000
        : 0;
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
      obj.sold_bales = processSale?.dataValues["no_of_bales"] ? Number(processSale?.dataValues["no_of_bales"]) : 0;
      obj.average_weight =
        (ginbales?.dataValues.total_qty ?? 0) / (obj.no_of_bales ?? 0);
      obj.total_qty_sold_lint =
        (processSale?.dataValues["total_qty"] ?? 0) / 1000;
      obj.balace_stock =
        (obj.no_of_bales + obj.total_bales_received) > (obj.sold_bales + obj.total_bales_transfered + obj.greyout_bales) ? Number((obj.no_of_bales + obj.total_bales_received) - (obj.sold_bales + obj.total_bales_transfered + obj.greyout_bales)) : 0;
      obj.balance_lint_quantity =
        (obj.total_qty_lint_produced + obj.total_qty_lint_received) > (obj.total_qty_sold_lint + obj.total_qty_lint_transfered + obj.greyout_qty) 
          ? (obj.total_qty_lint_produced + obj.total_qty_lint_received) - (obj.total_qty_sold_lint + obj.total_qty_lint_transfered + obj.greyout_qty)
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
    return res.sendError(res, error.message, error);
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
    worksheet.mergeCells("A1:Q1");
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
      "No. of Bales Greyed Out",
      "Total Quantity of Lint Greyed Out (MT)",
      "No. of Bales Received",
      "Total Quantity of Lint Received (MT)",
      "No. of Bales Transfered",
      "Total Quantity of Lint Transfered (MT)",
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
          "$ginprocess.season_id$": seasonId,
          "$ginprocess.ginner_id$": item.dataValues.ginner.id,
        },
        group: ["ginprocess.season_id"],
      });
      let processSale = await BaleSelection.findOne({
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
          "$bale.ginprocess.season_id$": seasonId,
          "$sales.ginner_id$": item.dataValues.ginner.id,
          "$sales.status$": { [Op.in]: ['Pending', 'Pending for QR scanning', 'Partially Accepted', 'Partially Rejected', 'Sold'] },
          "$sales.buyer_ginner$": { [Op.is]: null }
        },
        group: ["bale.ginprocess.season_id"]
      });

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
          "$bale.ginprocess.season_id$": seasonId,
          "$sales.ginner_id$": item.dataValues.ginner.id,
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
          "$ginprocess.season_id$": seasonId,
          "$ginprocess.ginner_id$": item.dataValues.ginner.id,
          [Op.or]: [
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
          "$ginsales.season_id$": seasonId,
          "$ginsales.buyer_ginner$": item.dataValues.ginner.id,
          "$ginsales.status$": { [Op.in]: ['Partially Accepted', 'Partially Rejected', 'Sold'] },
          gin_accepted_status: { [Op.is]: true },
          "$ginsales.buyer_type$": 'Ginner'
        },
        group: ["ginsales.season_id"]
      })

      obj.procurement_seed_cotton =
        (item?.dataValues?.procurement_seed_cotton ?? 0) / 1000;
      obj.procured_lint_cotton =
        ((item?.dataValues["procurement_seed_cotton"] ?? 0) * 35) / 100 / 1000;
      obj.no_of_bales = processgin?.dataValues.no_of_bales ? Number(processgin?.dataValues.no_of_bales) : 0;
      obj.total_qty_lint_produced = ginbales
        ? (ginbales.dataValues.total_qty ?? 0) / 1000
        : 0;
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
      obj.sold_bales = processSale?.dataValues["no_of_bales"] ? Number(processSale?.dataValues["no_of_bales"]) : 0;
      obj.average_weight =
        (ginbales?.dataValues.total_qty ?? 0) / (obj.no_of_bales ?? 0);
      obj.total_qty_sold_lint =
        (processSale?.dataValues["total_qty"] ?? 0) / 1000;
      obj.balace_stock =
        (obj.no_of_bales + obj.total_bales_received) > (obj.sold_bales + obj.total_bales_transfered + obj.greyout_bales) ? Number((obj.no_of_bales + obj.total_bales_received) - (obj.sold_bales + obj.total_bales_transfered + obj.greyout_bales)) : 0;
      obj.balance_lint_quantity =
        (obj.total_qty_lint_produced + obj.total_qty_lint_received) > (obj.total_qty_sold_lint + obj.total_qty_lint_transfered + obj.greyout_qty) 
          ? (obj.total_qty_lint_produced + obj.total_qty_lint_received) - (obj.total_qty_sold_lint + obj.total_qty_lint_transfered + obj.greyout_qty)
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
        greyout_bales: obj.greyout_bales ? Number(obj.greyout_bales) : 0,
        greyout_qty: obj.greyout_qty ? Number(formatDecimal(obj.greyout_qty)) : 0,
        total_bales_received: obj.total_bales_received ? Number(obj.total_bales_received) : 0,
        total_qty_lint_received: obj.total_qty_lint_received ? Number(formatDecimal(obj.total_qty_lint_received)) : 0,
        total_bales_transfered: obj.total_bales_transfered ? Number(obj.total_bales_transfered) : 0,
        total_qty_lint_transfered: obj.total_qty_lint_transfered ? Number(formatDecimal(obj.total_qty_lint_transfered)) : 0,
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
    return res.sendError(res, error.message, error);
  }
};

const fetchPscpProcurementLiveTracker = async (req: Request, res: Response) => {
  try {

    const { seasonId, countryId, brandId, ginnerId, search, page = 1, limit = 10 }: any = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereCondition: string[] = [];
    let seasonCondition: string[] = [];
    let brandCondition: string[] = [];
    let baleCondition: string[] = [];
    let baleSaleCondition: string[] = [];
    let seedAllocationCondition: string[] = [];
    let ginToGinSaleCondition: string[] = [];

    if (search) {
      brandCondition.push(`(name ILIKE :searchTerm OR state_name ILIKE :searchTerm OR county_name ILIKE :searchTerm OR program_name ILIKE :searchTerm)`);
    }

    if (countryId) {
      const idArray = countryId.split(",").map((id: string) => parseInt(id, 10));
      whereCondition.push(`country_id IN (:countryIds)`);
      brandCondition.push(`g.country_id IN (:countryIds)`);
    }

    if (brandId) {
      const idArray = brandId.split(",").map((id: string) => parseInt(id, 10));
      whereCondition.push(`brand_id IN (:brandIds)`);
      brandCondition.push(`brand && ARRAY[:brandIds]`);
    }

    if (seasonId) {
      const idArray = seasonId.split(",").map((id: string) => parseInt(id, 10));
      seasonCondition.push(`season_id IN (:seasonIds)`);
      baleCondition.push(`gp.season_id IN (:seasonIds)`);
      baleSaleCondition.push(`gp.season_id IN (:seasonIds)`);
      seedAllocationCondition.push(`gv.season_id IN (:seasonIds)`);
      ginToGinSaleCondition.push(`gs.season_id IN (:seasonIds)`);
    }

    if (ginnerId) {
      const idArray = ginnerId.split(",").map((id: string) => parseInt(id, 10));
      brandCondition.push(`g.id IN (:ginnerIds)`);
    }

    const whereConditionSql = whereCondition.length ? `${whereCondition.join(' AND ')}` : '1=1';
    const seasonConditionSql = seasonCondition.length ? `${seasonCondition.join(' AND ')}` : '1=1';
    const brandConditionSql = brandCondition.length ? `${brandCondition.join(' AND ')}` : '1=1';
    const baleConditionSql = baleCondition.length ? `${baleCondition.join(' AND ')}` : '1=1';
    const baleSaleConditionSql = baleSaleCondition.length ? `${baleSaleCondition.join(' AND ')}` : '1=1';
    const seedAllocationConditionSql = seedAllocationCondition.length ? `${seedAllocationCondition.join(' AND ')}` : '1=1';
    const ginToGinSaleConditionSql = ginToGinSaleCondition.length ? `${ginToGinSaleCondition.join(' AND ')}` : '1=1';


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

    let countQuery = `
            SELECT 
                COUNT(*)
            FROM
                ginners g
            JOIN states s ON g.state_id = s.id
            JOIN countries c ON g.country_id = c.id
            JOIN programs p ON p.id = ANY(g.program_id)
            WHERE ${brandConditionSql}
          `;

    // if (brandId) {
    //   countQuery += ` WHERE ${brandId} = ANY(g.brand)`;
    // }

    const [countResult] = await sequelize.query(countQuery,
      {
        replacements: {
          searchTerm: `%${search}%`,
          countryIds: countryId ? countryId.split(",").map((id: string) => parseInt(id, 10)) : [],
          brandIds: brandId ? brandId.split(",").map((id: string) => parseInt(id, 10)) : [],
          seasonIds: seasonId ? seasonId.split(",").map((id: string) => parseInt(id, 10)) : [],
          ginnerIds: ginnerId ? ginnerId.split(",").map((id: string) => parseInt(id, 10)) : []
        },
        type: sequelize.QueryTypes.SELECT
      });

    const count = countResult ? Number(countResult.count) : 0;

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
          WHERE ${brandConditionSql}
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
            AND ${seasonConditionSql}
            AND ${whereConditionSql}
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
          JOIN filtered_ginners ON gp.ginner_id = filtered_ginners.id
          WHERE
            gp.program_id = ANY (filtered_ginners.program_id)
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
          JOIN filtered_ginners ON gp.ginner_id = filtered_ginners.id
          WHERE
            gp.program_id = ANY (filtered_ginners.program_id)
            AND
            (
              (
              gp.scd_verified_status = true AND gb.scd_verified_status IS NOT TRUE
              )
              OR
              (
              gp.scd_verified_status = false AND gb.scd_verified_status IS FALSE
              )
            )
            AND ${baleConditionSql}
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
            AND ${seasonConditionSql}
            AND ${whereConditionSql}
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
                LEFT JOIN gin_processes gp ON gb.process_id = gp.id
                WHERE
                    gs.program_id = ANY (filtered_ginners.program_id)
                    AND ${baleSaleConditionSql}
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
                JOIN filtered_ginners ON gs.ginner_id = filtered_ginners.id
                LEFT JOIN gin_processes gp ON gb.process_id = gp.id
                WHERE
                    gs.program_id = ANY (filtered_ginners.program_id)
                    AND ${baleSaleConditionSql}
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
                  AND ${ginToGinSaleConditionSql}
                  AND gs.status IN ('Sold', 'Partially Accepted', 'Partially Rejected')
                  AND gtg.gin_accepted_status = true
                  AND gs.buyer_type ='Ginner'
                GROUP BY 
                  filtered_ginners.id
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
           ${seedAllocationConditionSql} 
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
            AND ${seasonConditionSql}
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
            AND ${seasonConditionSql}
          GROUP BY
            go.ginner_id
        ), 
      season_data AS (
        SELECT DISTINCT
          t.mapped_ginner,
          string_agg(DISTINCT s.name, ', ') as season_names
        FROM
          transactions t
          JOIN seasons s ON t.season_id = s.id
          JOIN filtered_ginners ON t.mapped_ginner = filtered_ginners.id
        WHERE
          t.program_id = ANY (filtered_ginners.program_id)
          AND ${seasonConditionSql}
        GROUP BY
          t.mapped_ginner
      )
      SELECT
        fg.id AS ginner_id,
        fg.name AS ginner_name,
        fg.state_name,
        fg.county_name,
        fg.program_name,
        COALESCE(sd.season_names, '') AS season_name,
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
        COALESCE(go.confirmed_lint_order, 0) AS order_in_hand,
        CAST((COALESCE(gp.no_of_bales, 0) + COALESCE(gtgr.no_of_bales, 0)) - (COALESCE(gs.no_of_bales, 0) + COALESCE(gbg.no_of_bales, 0) + COALESCE(gtg.no_of_bales, 0)) AS INTEGER) AS balace_stock,
        CAST(ROUND(
            CAST((COALESCE(gb.total_qty, 0) / 1000 + COALESCE(gtgr.lint_qty, 0) / 1000) - (COALESCE(gs.total_qty, 0) / 1000 + COALESCE(gbg.total_qty, 0) / 1000 + COALESCE(gtg.lint_qty, 0) / 1000) AS NUMERIC), 
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
        LEFT JOIN season_data sd ON fg.id = sd.mapped_ginner
        LEFT JOIN gin_bale_greyout_data gbg ON fg.id = gbg.ginner_id
        LEFT JOIN gin_to_gin_sales_data gtg ON fg.id = gtg.ginner_id
        LEFT JOIN gin_to_gin_recieved_data gtgr ON fg.id = gtgr.ginner_id
      ORDER BY
        fg.name asc
      LIMIT :limit OFFSET :offset
      `,
      {
        replacements: {
          searchTerm: `%${search}%`,
          countryIds: countryId ? countryId.split(",").map((id: string) => parseInt(id, 10)) : [],
          brandIds: brandId ? brandId.split(",").map((id: string) => parseInt(id, 10)) : [],
          seasonIds: seasonId ? seasonId.split(",").map((id: string) => parseInt(id, 10)) : [],
          ginnerIds: ginnerId ? ginnerId.split(",").map((id: string) => parseInt(id, 10)) : [],
          limit: Number(limit),
          offset: Number(offset)
        },
        type: sequelize.QueryTypes.SELECT
      }
    );

    return res.sendPaginationSuccess(
      res,
      data,
      count
    );
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message, error);
  }
};


// const fetchPscpProcurementLiveTracker = async (req: Request, res: Response) => {
//   try {
//     let { seasonId, countryId, brandId, ginnerId }: any = req.query;
//     const searchTerm = req.query.search || "";
//     const page = Number(req.query.page) || 1;
//     const limit = Number(req.query.limit) || 10;
//     const offset = (page - 1) * limit;

//     let whereConditions: string[] = [];
//     let queryParams: any[] = [];

//     // Handle search term
//     if (searchTerm) {
//       whereConditions.push(`(b.name ILIKE ? OR s.state_name ILIKE ?)`);
//       queryParams.push(`%${searchTerm}%`, `%${searchTerm}%`);
//     }

//     // Handle countryId
//     if (countryId) {
//       const idArray: number[] = countryId.split(",").map((id: any) => parseInt(id, 10));
//       whereConditions.push(`g.country_id IN (${idArray.map(() => '?').join(', ')})`);
//       queryParams.push(...idArray);
//     }

//     // Handle brandId
//     if (brandId) {
//       const idArray: number[] = brandId.split(",").map((id: any) => parseInt(id, 10));
//       whereConditions.push(`b.brand_id IN (${idArray.map(() => '?').join(', ')})`);
//       queryParams.push(...idArray);
//     }

//     // Handle seasonId
//     if (seasonId) {
//       const idArray: number[] = seasonId.split(",").map((id: any) => parseInt(id, 10));
//       whereConditions.push(`gp.season_id IN (${idArray.map(() => '?').join(', ')})`);
//       queryParams.push(...idArray);
//     }

//     // Handle ginnerId
//     if (ginnerId) {
//       const idArray: number[] = ginnerId.split(",").map((id: any) => parseInt(id, 10));
//       whereConditions.push(`g.id IN (${idArray.map(() => '?').join(', ')})`);
//       queryParams.push(...idArray);
//     }

//     const whereConditionSql = whereConditions.length ? `WHERE ${whereConditions.join(' AND ')}` : '';

//     const data = await sequelize.query(`
//       WITH
//         filtered_ginners AS (
//           SELECT
//             g.id,
//             g.name,
//             g.program_id,
//             s.state_name,
//             c.county_name,
//             p.program_name
//           FROM
//             ginners g
//             JOIN states s ON g.state_id = s.id
//             JOIN countries c ON g.country_id = c.id
//             JOIN programs p ON p.id = ANY(g.program_id)
//           ${whereConditionSql}
//         ),
//         procurement_data AS (
//           SELECT
//             t.mapped_ginner,
//             SUM(CAST(t.qty_purchased AS DOUBLE PRECISION)) AS procurement_seed_cotton,
//             SUM(t.qty_stock) AS total_qty_lint_produced
//           FROM
//             transactions t
//           JOIN filtered_ginners ON t.mapped_ginner = filtered_ginners.id
//           WHERE
//             t.program_id = ANY (filtered_ginners.program_id)
//             GROUP BY
//               t.mapped_ginner
//         ),
//         gin_process_data AS (
//           SELECT
//             gp.ginner_id,
//             SUM(gp.no_of_bales) AS no_of_bales
//           FROM
//             gin_processes gp
//           JOIN filtered_ginners ON gp.ginner_id = filtered_ginners.id
//           WHERE
//             gp.program_id = ANY (filtered_ginners.program_id)
//           GROUP BY
//             gp.ginner_id
//         ),
//         gin_bale_data AS (
//           SELECT
//             gp.ginner_id,
//             SUM(CAST(gb.weight AS DOUBLE PRECISION)) AS total_qty
//           FROM
//             "gin-bales" gb
//           JOIN gin_processes gp ON gb.process_id = gp.id
//           JOIN filtered_ginners ON gp.ginner_id = filtered_ginners.id
//           WHERE
//             gp.program_id = ANY (filtered_ginners.program_id)
//           GROUP BY
//             gp.ginner_id
//         ),
//         pending_seed_cotton_data AS (
//           SELECT
//             t.mapped_ginner,
//             SUM(CAST(t.qty_purchased AS DOUBLE PRECISION)) AS pending_seed_cotton
//           FROM
//             transactions t
//           JOIN filtered_ginners ON t.mapped_ginner = filtered_ginners.id
//           WHERE
//             t.program_id = ANY (filtered_ginners.program_id)
//             AND t.status = 'Pending'
//           GROUP BY
//             t.mapped_ginner
//         ),
//         gin_sales_data AS (
//           SELECT
//             gs.ginner_id,
//             SUM(gs.no_of_bales) AS no_of_bales,
//             SUM(gs.total_qty) AS total_qty
//           FROM
//             gin_sales gs
//           JOIN filtered_ginners ON gs.ginner_id = filtered_ginners.id
//           WHERE
//             gs.program_id = ANY (filtered_ginners.program_id)
//             AND gs.status = 'Sold'
//           GROUP BY
//             gs.ginner_id
//         ),
//         expected_cotton_data AS (
//           SELECT
//             gec.ginner_id,
//             SUM(CAST(gec.expected_seed_cotton AS DOUBLE PRECISION)) AS expected_seed_cotton,
//             SUM(CAST(gec.expected_lint AS DOUBLE PRECISION)) AS expected_lint
//           FROM
//             ginner_expected_cottons gec
//           LEFT JOIN filtered_ginners ON gec.ginner_id = filtered_ginners.id
//           WHERE
//             gec.program_id = ANY (filtered_ginners.program_id)
//           GROUP BY
//             gec.ginner_id
//         ),
//         ginner_order_data AS (
//           SELECT
//             go.ginner_id,
//             SUM(CAST(go.confirmed_lint_order AS DOUBLE PRECISION)) AS confirmed_lint_order
//           FROM
//             ginner_orders go
//           JOIN filtered_ginners ON go.ginner_id = filtered_ginners.id    
//           WHERE
//             go.program_id = ANY (filtered_ginners.program_id)
//           GROUP BY
//             go.ginner_id
//         )
//       SELECT
//         fg.name AS ginner_name,
//         fg.state_name,
//         fg.county_name,
//         fg.program_name,
//         COALESCE(ec.expected_seed_cotton, 0) / 1000 AS expected_seed_cotton,
//         COALESCE(ec.expected_lint, 0) AS expected_lint,
//         COALESCE(pd.procurement_seed_cotton, 0) / 1000 AS procurement_seed_cotton,
//         COALESCE(gb.total_qty, 0) AS procured_lint_cotton_kgs,
//         COALESCE(gb.total_qty, 0) / 1000 AS procured_lint_cotton_mt,
//         COALESCE(psc.pending_seed_cotton, 0) / 1000 AS pending_seed_cotton,
//         CASE
//           WHEN COALESCE(ec.expected_seed_cotton, 0) != 0
//           AND COALESCE(pd.procurement_seed_cotton, 0) != 0 THEN ROUND(
//             (
//               COALESCE(pd.procurement_seed_cotton, 0) / COALESCE(ec.expected_seed_cotton, 0)
//             ) * 100
//           )
//           ELSE 0
//         END AS procurement,
//         COALESCE(gp.no_of_bales, 0) AS no_of_bales,
//         COALESCE(gb.total_qty, 0) / 1000 AS total_qty_lint_produced,
//         COALESCE(gs.no_of_bales, 0) AS sold_bales,
//         CASE
//           WHEN COALESCE(gp.no_of_bales, 0) != 0 THEN COALESCE(gb.total_qty, 0) / COALESCE(gp.no_of_bales, 0)
//           ELSE 0
//         END AS average_weight,
//         COALESCE(gs.total_qty, 0) / 1000 AS total_qty_sold_lint,
//         COALESCE(go.confirmed_lint_order, 0) AS confirmed_lint_order,
//         COALESCE(gp.no_of_bales, 0) - COALESCE(gs.no_of_bales, 0) AS balance_stock,
//         COALESCE(gb.total_qty, 0) / 1000 - COALESCE(gs.total_qty, 0) / 1000 AS balance_lint_quantity,
//         CASE
//           WHEN COALESCE(gb.total_qty, 0) != 0 THEN
//             CASE
//               WHEN COALESCE(gs.total_qty, 0) > COALESCE(gb.total_qty, 0) THEN ROUND(
//                 (
//                   COALESCE(gb.total_qty, 0) / COALESCE(gs.total_qty, 0)
//                 ) * 100
//               )
//               ELSE ROUND(
//                 (
//                   COALESCE(gs.total_qty, 0) / COALESCE(gb.total_qty, 0)
//                 ) * 100
//               )
//             END
//           ELSE 0
//         END AS ginner_sale_percentage
//       FROM
//         filtered_ginners fg
//         LEFT JOIN procurement_data pd ON fg.id = pd.mapped_ginner
//         LEFT JOIN gin_process_data gp ON fg.id = gp.ginner_id
//         LEFT JOIN gin_bale_data gb ON fg.id = gb.ginner_id
//         LEFT JOIN pending_seed_cotton_data psc ON fg.id = psc.mapped_ginner
//         LEFT JOIN gin_sales_data gs ON fg.id = gs.ginner_id
//         LEFT JOIN expected_cotton_data ec ON fg.id = ec.ginner_id
//         LEFT JOIN ginner_order_data go ON fg.id = go.ginner_id
//       ORDER BY
//         fg.id
//       OFFSET
//         ${offset}
//       LIMIT
//         ${limit}
//     `, { type: sequelize.QueryTypes.SELECT, bind: queryParams });

//     return res.sendPaginationSuccess(
//       res,
//       data,
//       100, // count
//     );
//   } catch (error: any) {
//     console.error("Error appending data:", error);
//     return res.sendError(res, error.message, error);
//   }
// };




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
    let { seasonId, countryId, brandId, ginnerId, search }: any = req.query;
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const exportType = req.query.exportType || "";
    const isBrand = req.query.isBrand || false;
    const offset = (page - 1) * limit;

    let whereCondition: string[] = [];
    let seasonCondition: string[] = [];
    let brandCondition: string[] = [];
    let baleCondition: string[] = [];
    let baleSaleCondition: string[] = [];
    let seedAllocationCondition: string[] = [];
    let ginToGinSaleCondition: string[] = [];

    if (exportType === "all") {

      return res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "pscp-procurement-sell-live-tracker.xlsx",
      });

    } else {

      if (search) {
        brandCondition.push(`(name ILIKE :searchTerm OR "s.state_name" ILIKE :searchTerm)`);
      }

      if (countryId) {
        const idArray = countryId.split(",").map((id: string) => parseInt(id, 10));
        whereCondition.push(`country_id IN (:countryIds)`);
        brandCondition.push(`g.country_id IN (:countryIds)`);
      }

      if (brandId) {
        const idArray = brandId.split(",").map((id: string) => parseInt(id, 10));
        whereCondition.push(`brand_id IN (:brandIds)`);
        brandCondition.push(`brand && ARRAY[:brandIds]`);
      }

      if (seasonId) {
        const idArray = seasonId.split(",").map((id: string) => parseInt(id, 10));
        seasonCondition.push(`season_id IN (:seasonIds)`);
        baleCondition.push(`gp.season_id IN (:seasonIds)`);
        baleSaleCondition.push(`gp.season_id IN (:seasonIds)`);
        seedAllocationCondition.push(`gv.season_id IN (:seasonIds)`);
        ginToGinSaleCondition.push(`gs.season_id IN (:seasonIds)`);
      }

      if (ginnerId) {
        const idArray = ginnerId.split(",").map((id: string) => parseInt(id, 10));
        brandCondition.push(`g.id IN (:ginnerIds)`);
      }

      const whereConditionSql = whereCondition.length ? `${whereCondition.join(' AND ')}` : '1=1';
      const seasonConditionSql = seasonCondition.length ? `${seasonCondition.join(' AND ')}` : '1=1';
      const brandConditionSql = brandCondition.length ? `${brandCondition.join(' AND ')}` : '1=1';
      const baleConditionSql = baleCondition.length ? `${baleCondition.join(' AND ')}` : '1=1';
      const baleSaleConditionSql = baleSaleCondition.length ? `${baleSaleCondition.join(' AND ')}` : '1=1';
      const seedAllocationConditionSql = seedAllocationCondition.length ? `${seedAllocationCondition.join(' AND ')}` : '1=1';
      const ginToGinSaleConditionSql = ginToGinSaleCondition.length ? `${ginToGinSaleCondition.join(' AND ')}` : '1=1';


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
      // Create the excel workbook file
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet1");

      // if (isBrand === 'true') {
      //   worksheet.mergeCells('A1:W1');
      // } else {
      //   worksheet.mergeCells("A1:X1");
      // }
      // const mergedCell = worksheet.getCell("A1");
      // mergedCell.value = "CottonConnect | PSCP Procurement and Sell Live Tracker";
      // mergedCell.font = { bold: true };
      // mergedCell.alignment = { horizontal: "center", vertical: "middle" };
      // Set bold font for header row
      let headerRow;
      if (isBrand === 'true') {
        headerRow = worksheet.addRow([
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
          "Balance stock at Ginner (Bales )",
          "Balance lint cotton stock at Ginner (MT)",
          "No. of Bales Greyed Out",
          "Lint Greyed Out (MT)",
          "No. of Bales Received",
          "Lint Received (MT)",
          "No. of Bales Transfered",
          "Lint Transfered (MT)",
          "Ginner Sale %",
        ]);
      } else {
        headerRow = worksheet.addRow([
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
          "Ginner Sale %",
        ]);
      }
      headerRow.font = { bold: true };


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
            WHERE ${brandConditionSql}
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
              AND ${seasonConditionSql}
              AND ${whereConditionSql}
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
            JOIN filtered_ginners ON gp.ginner_id = filtered_ginners.id
            WHERE
              gp.program_id = ANY (filtered_ginners.program_id)
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
            JOIN filtered_ginners ON gp.ginner_id = filtered_ginners.id
            WHERE
              gp.program_id = ANY (filtered_ginners.program_id)
              AND
              (
                (
                gp.scd_verified_status = true AND gb.scd_verified_status IS NOT TRUE
                )
                OR
                (
                gp.scd_verified_status = false AND gb.scd_verified_status IS FALSE
                )
              )
              AND ${baleConditionSql}
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
              AND ${seasonConditionSql}
              AND ${whereConditionSql}
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
                  LEFT JOIN gin_processes gp ON gb.process_id = gp.id
                  WHERE
                      gs.program_id = ANY (filtered_ginners.program_id)
                      AND ${baleSaleConditionSql}
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
                  JOIN filtered_ginners ON gs.ginner_id = filtered_ginners.id
                  LEFT JOIN gin_processes gp ON gb.process_id = gp.id
                  WHERE
                      gs.program_id = ANY (filtered_ginners.program_id)
                      AND ${baleSaleConditionSql}
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
                    AND ${ginToGinSaleConditionSql}
                    AND gs.status IN ('Sold', 'Partially Accepted', 'Partially Rejected')
                    AND gtg.gin_accepted_status = true
                    AND gs.buyer_type ='Ginner'
                  GROUP BY 
                    filtered_ginners.id
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
            WHERE ${seedAllocationConditionSql} 
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
              AND ${seasonConditionSql}
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
              AND ${seasonConditionSql}
            GROUP BY
              go.ginner_id
          )
        SELECT
          fg.id AS ginner_id,
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
          COALESCE(go.confirmed_lint_order, 0) AS order_in_hand,
          CAST((COALESCE(gp.no_of_bales, 0) + COALESCE(gtgr.no_of_bales, 0)) - (COALESCE(gs.no_of_bales, 0) + COALESCE(gbg.no_of_bales, 0) + COALESCE(gtg.no_of_bales, 0)) AS INTEGER) AS balace_stock,
          CAST(ROUND(
              CAST((COALESCE(gb.total_qty, 0) / 1000 + COALESCE(gtgr.lint_qty, 0) / 1000) - (COALESCE(gs.total_qty, 0) / 1000 + COALESCE(gbg.total_qty, 0) / 1000 + COALESCE(gtg.lint_qty, 0) / 1000) AS NUMERIC), 
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
        ORDER BY
          fg.name asc
        LIMIT :limit OFFSET :offset
        `,
        {
          replacements: {
            searchTerm: `%${search}%`,
            countryIds: countryId ? countryId.split(",").map((id: string) => parseInt(id, 10)) : [],
            brandIds: brandId ? brandId.split(",").map((id: string) => parseInt(id, 10)) : [],
            seasonIds: seasonId ? seasonId.split(",").map((id: string) => parseInt(id, 10)) : [],
            ginnerIds: ginnerId ? ginnerId.split(",").map((id: string) => parseInt(id, 10)) : [],
            limit: Number(limit),
            offset: Number(offset)
          },
          type: sequelize.QueryTypes.SELECT
        }
      );

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
          ginner_sale_percentage:0,
          order_in_hand:0,
      };

      let index = 0;
      for await (const obj of data) {
        let rowValues;
        if (isBrand === 'true') {
          rowValues = {
            index: index + 1,
            name: obj.ginner_name ? obj?.ginner_name : "",
            country: obj.county_name ? obj?.county_name : "",
            state: obj.state_name ? obj?.state_name : "",
            program: obj.program_name ? obj?.program_name : "",
            expected_seed_cotton: obj.expected_seed_cotton ? Number(obj.expected_seed_cotton) : 0,
            expected_lint: obj.expected_lint ? Number(obj.expected_lint) : 0,
            procurement_seed_cotton: obj.procurement_seed_cotton ? Number(formatDecimal(obj.procurement_seed_cotton)) : 0,
            procurement: obj.procurement ? Number(obj.procurement) : 0,
            pending_seed_cotton: obj.pending_seed_cotton
              ? Number(formatDecimal(obj.pending_seed_cotton))
              : 0,
            procured_lint_cotton_mt: Number(formatDecimal(obj.procured_lint_cotton_mt)),
            no_of_bales: obj.no_of_bales ? Number(obj.no_of_bales) : 0,
            sold_bales: obj.sold_bales ? Number(obj.sold_bales) : 0,
            total_qty_sold_lint: obj.total_qty_sold_lint
              ? Number(formatDecimal(obj.total_qty_sold_lint))
              : 0,
            balace_stock: obj.balace_stock ? Number(obj.balace_stock) : 0,
            balance_lint_quantity: obj.balance_lint_quantity ? Number(formatDecimal(obj.balance_lint_quantity)) : 0,
            greyout_bales: obj.greyout_bales ? Number(obj.greyout_bales) : 0,
            greyout_qty: obj.greyout_qty ? Number(formatDecimal(obj.greyout_qty)) : 0,
            total_bales_received: obj.total_bales_received ? Number(obj.total_bales_received) : 0,
            total_qty_lint_received: obj.total_qty_lint_received ? Number(formatDecimal(obj.total_qty_lint_received)) : 0,
            total_bales_transfered: obj.total_bales_transfered ? Number(obj.total_bales_transfered) : 0,
            total_qty_lint_transfered: obj.total_qty_lint_transfered ? Number(formatDecimal(obj.total_qty_lint_transfered)) : 0,
            ginner_sale_percentage: Number(obj.ginner_sale_percentage),
          };
        } else {
          rowValues = {
            index: index + 1,
            name: obj.ginner_name ? obj?.ginner_name : "",
            country: obj.county_name ? obj?.county_name : "",
            state: obj.state_name ? obj?.state_name : "",
            program: obj.program_name ? obj?.program_name : "",
            expected_seed_cotton: obj.expected_seed_cotton ? Number(obj.expected_seed_cotton) : 0,
            expected_lint: obj.expected_lint ? Number(obj.expected_lint) : 0,
            procurement_seed_cotton: obj.procurement_seed_cotton ? Number(formatDecimal(obj.procurement_seed_cotton)) : 0,
            procurement: obj.procurement ? Number(obj.procurement) : 0,
            pending_seed_cotton: obj.pending_seed_cotton
              ? Number(formatDecimal(obj.pending_seed_cotton))
              : 0,
            procured_lint_cotton_mt: Number(formatDecimal(obj.procured_lint_cotton_mt)),
            no_of_bales: obj.no_of_bales ? Number(obj.no_of_bales) : 0,
            sold_bales: obj.sold_bales ? Number(obj.sold_bales) : 0,
            total_qty_sold_lint: obj.total_qty_sold_lint
              ? Number(formatDecimal(obj.total_qty_sold_lint))
              : 0,
            order_in_hand: obj.order_in_hand ? Number(formatDecimal(obj.order_in_hand)) : 0,
            balace_stock: obj.balace_stock ? Number(obj.balace_stock) : 0,
            balance_lint_quantity: obj.balance_lint_quantity ? Number(formatDecimal(obj.balance_lint_quantity)) : 0,
            greyout_bales: obj.greyout_bales ? Number(obj.greyout_bales) : 0,
            greyout_qty: obj.greyout_qty ? Number(formatDecimal(obj.greyout_qty)) : 0,
            total_bales_received: obj.total_bales_received ? Number(obj.total_bales_received) : 0,
            total_qty_lint_received: obj.total_qty_lint_received ? Number(formatDecimal(obj.total_qty_lint_received)) : 0,
            total_bales_transfered: obj.total_bales_transfered ? Number(obj.total_bales_transfered) : 0,
            total_qty_lint_transfered: obj.total_qty_lint_transfered ? Number(formatDecimal(obj.total_qty_lint_transfered)) : 0,
            ginner_sale_percentage: Number(obj.ginner_sale_percentage),
          };
        }
        index++;
        worksheet.addRow(Object.values(rowValues));

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
        totals.ginner_sale_percentage+= rowValues.ginner_sale_percentage;
        totals.order_in_hand+= rowValues.order_in_hand?rowValues.order_in_hand : 0;

      }


      let rowValues;
      if (isBrand === 'true') {
        rowValues = {
          index:"Totals:",
          name:"",
          country:"",
          state:"",
          program:"",
          expected_seed_cotton:totals.expected_seed_cotton,
          expected_lint:totals.expected_lint,
          procurement_seed_cotton:totals.procurement_seed_cotton,
          procurement:totals.procurement,
          pending_seed_cotton:totals.pending_seed_cotton,
          procured_lint_cotton_mt:totals.procured_lint_cotton_mt,
          no_of_bales:totals.no_of_bales,
          sold_bales:totals.sold_bales,
          total_qty_sold_lint:totals.total_qty_sold_lint,
          balace_stock:totals.balace_stock,
          balance_lint_quantity:totals.balance_lint_quantity,
          greyout_bales:totals.greyout_bales,
          greyout_qty:totals.greyout_qty,
          total_bales_received:totals.total_bales_received,
          total_qty_lint_received:totals.total_qty_lint_received,
          total_bales_transfered:totals.total_bales_transfered,
          total_qty_lint_transfered:totals.total_qty_lint_transfered,
          ginner_sale_percentage:totals.ginner_sale_percentage,
        };
      } else {
        rowValues = {
          index:"Totals:",
          name:"",
          country:"",
          state:"",
          program:"",
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
          ginner_sale_percentage: totals.ginner_sale_percentage,
        };
      }
      worksheet.addRow(Object.values(rowValues)).eachCell(cell=> cell.font={bold:true});

      let borderStyle = {
        top: {style: "thin"},
        left: {style: "thin"},
        bottom: {style: "thin"},
        right: {style: "thin"}
      };

      // Auto-adjust column widths based on content
      worksheet.columns.forEach((column: any) => {
        let maxCellLength = 0;
        column.eachCell({ includeEmpty: true }, (cell: any) => {
          const cellLength = (cell.value ? cell.value.toString() : "").length;
          maxCellLength = Math.max(maxCellLength, cellLength);
          cell.border = borderStyle;
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
    return res.sendError(res, error.message, error);
  }
};

const consolidatedTraceability = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  const { garmentId, brandId, styleMarkNo, garmentType, startDate, endDate, seasonId }: any = req.query;
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
          .filter((obj: any) => obj?.process_type === "knitter" || obj?.process_type === "Knitter")
          .map((obj: any) => obj?.process_id);
        knit_fabric_ids = [...knit_fabric_ids, ...knitter_fabric];
        let weaver_fabric = selection
          .filter((obj: any) => obj?.process_type === "weaver" || obj?.process_type === "Weaver")
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
            row?.fabric_type &&
            row?.fabric_type.length > 0
          ) {
            fabrictypes = await FabricType.findAll({
              where: {
                id: {
                  [Op.in]: row.fabric_type,
                },
              },
              attributes: ["id", "fabricType_name"],
            });
          }
          weaverSales.push({
            ...row,
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
            sales_id: weaveProcess.map((obj: any) => obj.fabric_id),
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
          const yarncount = yarncountList?.map((obj: any) => obj.dataValues.yarnCount_name);
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

        let heapIds = await heapSelection.findAll({
          where: {
            process_id: gin_process_ids,
          },
          attributes: ["id", "transaction_id"],
        })

        let a = cottornIds.map(
          (obj: any) => obj.dataValues.transaction_id
        );

        let b = heapIds.map(
          (obj: any) => obj.dataValues.transaction_id
        ).flat();

        transactions_ids = [...a, ...b]
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
            .map((val: any) => val?.knitter?.dataValues.name)
            .filter((item: any) => item !== null && item !== undefined)
          : [];
      let weaverName =
        weaverSales && weaverSales.length > 0
          ? weaverSales
            .map((val: any) => val['weaver.name'])
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
    return res.sendError(res, error.message, error);
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
      "Programme",
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
          const yarncount = yarncountList?.map((obj: any) => obj.dataValues.yarnCount_name);
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

        let heapIds = await heapSelection.findAll({
          where: {
            process_id: gin_process_ids,
          },
          attributes: ["id", "transaction_id"],
        })

        let a = cottornIds.map(
          (obj: any) => obj.dataValues.transaction_id
        );

        let b = heapIds.map(
          (obj: any) => obj.dataValues.transaction_id
        ).flat();

        transactions_ids = [...a, ...b]
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
    return res.sendError(res, error.message, error);
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
    countryId,
    stateId,
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

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$spinner.country_id$"] = { [Op.in]: idArray };
    }

    if (stateId) {
      const idArray: number[] = stateId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$spinner.state_id$"] = { [Op.in]: idArray };
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

        let heapIds = await heapSelection.findAll({
          where: {
            process_id: gin_process_ids,
          },
          attributes: ["id", "transaction_id"],
        })

        let a = cottornIds.map(
          (obj: any) => obj.dataValues.transaction_id
        );

        let b = heapIds.map(
          (obj: any) => obj.dataValues.transaction_id
        ).flat();

        transactions_ids = [...a, ...b]
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
    return res.sendError(res, error.message, error);
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
    countryId,
    stateId,
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

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$spinner.country_id$"] = { [Op.in]: idArray };
    }

    if (stateId) {
      const idArray: number[] = stateId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$spinner.state_id$"] = { [Op.in]: idArray };
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

        let heapIds = await heapSelection.findAll({
          where: {
            process_id: gin_process_ids,
          },
          attributes: ["id", "transaction_id"],
        })

        let a = cottornIds.map(
          (obj: any) => obj.dataValues.transaction_id
        );

        let b = heapIds.map(
          (obj: any) => obj.dataValues.transaction_id
        ).flat();

        transactions_ids = [...a, ...b]
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
    return res.sendError(res, error.message, error);
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
        }, {
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
    return res.sendError(res, error.message, error);
  }
};

const villageSeedCottonAllocationReport = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const whereCondition: any = [];
  const { brandId, stateId, countryId, seasonId , ginnerId}: any = req.query;


  try {
    if (searchTerm) {

      whereCondition.push(`
        (
          village_name ILIKE '%${searchTerm}%'
        )
      `);
      
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
        whereCondition.push(`farmer.country_id IN (${idArray.join(',')})`);
     
    }
    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
     
      whereCondition.push(`farmer.brand_id IN (${idArray.join(',')})`);
    }

    if (stateId) {
      const idArray: number[] = stateId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      
      whereCondition.push(`farmer.state_id IN (${idArray.join(',')})`);
    }

    if (ginnerId) {
      const idArray: number[] = ginnerId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      
      whereCondition.push(`gv.ginner_id IN (${idArray.join(',')})`);
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      
      whereCondition.push(`gv.season_id IN (${idArray.join(',')})`);
    }

    const whereClause = whereCondition.length > 0 ? `WHERE ${whereCondition.join(' AND ')}` : '';

    let data: any = [];

    const countQuery = ` SELECT COUNT(DISTINCT "gv"."id") AS total_records
                     FROM "ginner_allocated_villages" as gv
                     LEFT JOIN 
                          "villages" AS "farmer->village" ON "gv"."village_id" = "farmer->village"."id" 
                     LEFT JOIN 
                          "farmers" AS "farmer" ON "farmer->village"."id" = "farmer"."village_id" and "farmer"."brand_id" ="gv"."brand_id"
                     LEFT JOIN 
                          "farms" as "farms" on farms.farmer_id = "farmer".id and farms.season_id = gv.season_id
                     LEFT JOIN 
                          "seasons" AS "season" ON "gv"."season_id" = "season"."id"
                    ${whereClause} `;

    const dataQuery = `SELECT 
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
                          "farmers" AS "farmer" ON "farmer->village"."id" = "farmer"."village_id" and "farmer"."brand_id" ="gv"."brand_id"
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

                     ${whereClause}
                    GROUP BY 
                          "gv"."village_id", "farmer->village"."id", "season"."id" ,"gn".id,"bk".id,"ds".id
                    ORDER BY "gv"."village_id" DESC 
                    OFFSET ${offset} LIMIT ${limit}
                      `;
  
                      
                      const [countResult, rows] = await Promise.all([
                        sequelize.query(countQuery, {
                          type: sequelize.QueryTypes.SELECT,
                        }),
                        sequelize.query(dataQuery, {
                          type: sequelize.QueryTypes.SELECT,
                        })
                      ]);

                      // Extract and parse total_records
                     
                      const totalCount = countResult ? Number(countResult[0]?.total_records) : 0;

   

    for await (let row of rows) {
      let percentage =
        Number(row.estimated_seed_cotton) >
          Number(row.procured_seed_cotton)
          ? (Number(row.procured_seed_cotton) /
            Number(row.estimated_seed_cotton)) *
          100
          : 0;

      data.push({
        ...row,
        prct_procured_cotton: formatDecimal(percentage),
      });
    }
    
    return res.sendPaginationSuccess(res, data, totalCount);
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.message, error);
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
        }, {
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
    return res.sendError(res, error.message, error);
  }
};

const exportVillageSeedCottonAllocation = async (req: Request, res: Response) => {
   
  const excelFilePath = path.join("./upload", "excel-village-seed-cotton-allocation.xlsx");
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const whereCondition: any = [];
  const { exportType,stateId, brandId, countryId, seasonId, ginnerId }: any = req.query;
  try {
    if (exportType === "all") {
      return res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "village-seed-cotton-allocation.xlsx",
      });
    } 
    else {
    if (searchTerm) {

      whereCondition.push(`
        (
          village_name ILIKE '%${searchTerm}%'
        )
      `);
      
    }

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
        whereCondition.push(`farmer.country_id IN (${idArray.join(',')})`);
     
    }
    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
     
      whereCondition.push(`farmer.brand_id IN (${idArray.join(',')})`);
    }

    if (stateId) {
      const idArray: number[] = stateId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      
      whereCondition.push(`farmer.state_id IN (${idArray.join(',')})`);
    }

    if (ginnerId) {
      const idArray: number[] = ginnerId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      
      whereCondition.push(`gv.ginner_id IN (${idArray.join(',')})`);
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      
      whereCondition.push(`gv.season_id IN (${idArray.join(',')})`);
    }

    const whereClause = whereCondition.length > 0 ? `WHERE ${whereCondition.join(' AND ')}` : '';

    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    worksheet.mergeCells("A1:J1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Village Seed Cotton Allocation Report";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.",
      "Village Name ",
      "Ginner Name",
      "block Name",
      "District Name",
      "Season ",
      "Total Estimated Seed cotton of village (Kgs)",
      "Total Seed Cotton Procured from village (Kgs)",
      "Total Seed Cotton in Stock at village (Kgs)",
      "% Seed Cotton Procured",
    ]);
    headerRow.font = { bold: true };

    const dataQuery = `SELECT 
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
                          "farmers" AS "farmer" ON "farmer->village"."id" = "farmer"."village_id" and "farmer"."brand_id" ="gv"."brand_id"
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
                     ${whereClause}
                    GROUP BY 
                          "gv"."village_id", "farmer->village"."id", "season"."id" ,"gn".id,"bk".id,"ds".id
                    ORDER BY "gv"."village_id" DESC 
                    OFFSET ${offset} LIMIT ${limit}
                      `;
  
                      
      const rows = await sequelize.query(dataQuery, {type: sequelize.QueryTypes.SELECT,})
                  

    // Append data to worksheet
    for await (const [index, item] of rows.entries()) {
      let percentage =
        Number(item?.estimated_seed_cotton) >
          Number(item?.procured_seed_cotton)
          ? (Number(item?.procured_seed_cotton) /
            Number(item?.estimated_seed_cotton)) *
          100
          : 0;

      const rowValues = Object.values({
        index: index + 1,
        village_name: item?.village_name
          ? item?.village_name
          : "",
          ginner_name: item?.ginner_name
          ? item?.ginner_name
          : "",
          block_name: item?.block_name
          ? item?.block_name
          : "",
          district_name: item?.district_name
          ? item?.district_name
          : "",
        season_name: item?.season_name
          ? item?.season_name
          : "",
        estimated_seed_cotton: item?.estimated_seed_cotton
          ? Number(item?.estimated_seed_cotton)
          : 0,
        procured_seed_cotton: item?.procured_seed_cotton
          ? Number(item?.procured_seed_cotton)
          : 0,
        avaiable_seed_cotton:
          item?.avaiable_seed_cotton &&
            item?.avaiable_seed_cotton > 0
            ? Number(item?.avaiable_seed_cotton)
            : 0,
        prct_procured_cotton: percentage
          ? Number(formatDecimal(percentage))
          : 0,
      });
      worksheet.addRow(rowValues);
      
    }

    // Set the width for the S No. column
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
      data: process.env.BASE_URL + "excel-village-seed-cotton-allocation.xlsx",
    });
  }
  } catch (error: any) {
    
    console.error(error);
    return res.sendError(res, error.message, error);
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
    countryId,
    stateId,
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
    if (countryId) {
      whereConditions.push(`"spinner"."country_id" IN (${countryId})`);
    }
    if (stateId) {
      whereConditions.push(`"spinner"."state_id" IN (${stateId})`);
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
      `
        WITH lintcomsumption AS (
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

    let data = [];

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
    return res.sendError(res, error.message, error);
  }
};

const exportSpinProcessBackwardfTraceabilty = async (req: Request, res: Response) => {
  // spinner_yarn_process_load
  const excelFilePath = path.join("./upload", "excel-spin-process-backward-traceability.xlsx");

  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { exportType, spinnerId, seasonId, programId, brandId, countryId, stateId }: any = req.query;
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

      if (countryId) {
        whereConditions.push(`"spinner"."country_id" IN (${countryId})`);
      }
      if (stateId) {
        whereConditions.push(`"spinner"."state_id" IN (${stateId})`);
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


        const rowValues = Object.values({
          index: index + 1,
          spinner: item?.spinner_name ? item.spinner_name : "",
          fabric: fbrc_name && fbrc_name.length > 0
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
          frmrVillages: item.village_names && item.village_names.length > 0
            ? item.village_names.join(", ")
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
    return res.sendError(res, error.message, error);
  }
};

const brandWiseDataReport = async (req: Request, res: Response) => {
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

    const { count, rows } = await Brand.findAndCountAll({
      where: whereCondition,
      order: [["id", "desc"]],
      offset: offset,
      limit: limit,
    })

    let data = [];
    for await (let [index, item] of rows.entries()) {

      let [result, trans, lintProcured, lintSold, yarnProcessed, yarnSold]: any =
        await Promise.all([
          Farm.findOne({
            where: {
              ...seasonWhere,
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
              ...baleSelectionWhere,
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
    return res.sendError(res, error.message, error);
  }
}


const exportBrandWiseDataReport = async (req: Request, res: Response) => {
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
                ...baleSelectionWhere,
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
    return res.sendError(res, error.message, error);
  }
}

const fetchDataEntryMonitorDashboardPagination = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { seasonId, countryId, type, processor, sort }: any = req.query;
  const duration = String(req.query.duration).trim();
  const offset = (page - 1) * limit;
  const whereCondition: any = [];
  try {
    if (processor == 'Ginner') {
      if (seasonId) {
        const idArray: number[] = seasonId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition.push(`PR.season_id in (${idArray})`)
      }

      if (countryId) {
        const idArray: number[] = countryId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition.push(`GN.country_id in (${idArray})`)
      }

      const date: {
        startDate: string | null
        endDate: string | null
      } = {
        startDate: null,
        endDate: null
      };
      if (duration) {
        const now = new Date();
        switch (duration) {
          case '7': {
            date.startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            date.endDate = null;
            break;
          }
          case '14': {
            date.startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            date.endDate = null;
            break;
          }
          case '30': {
            date.startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            date.endDate = null;
            break;
          }
          case '45': {
            date.startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            date.endDate = null;
            break;
          }
          case '90': {
            date.startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            date.endDate = null;
            break;
          }
          default: {
            date.startDate = null;
            date.endDate = moment(now).subtract(91, 'days').format('YYYY-MM-DD 00:00:00');
            break
          }
        }
      }

      const whereClause = whereCondition.length > 0 ? `WHERE ${whereCondition.join(' AND ')} ` : '';

      //fetch process data with pagination
      if (type == 'Process') {
        const [raws] = await sequelize.query(`
              select GN.id                                            as "ginner_id",
                  GN.name                                             as "ginner_name",
                  max(PR.date)                                        as "date",
                  CO.id                                               as "country_id",
                  CO.county_name                                      as "country_name",
                  array_to_string(array_agg(distinct SE.id), ',')     as "season_id",
                  array_to_string(array_agg(distinct SE.name), ',')   as "season_name"
              from ginners GN
                      left join gin_processes GP
                                on GN.id = GP.ginner_id and date >= '${date.startDate ?? date.endDate}'
                      left join gin_processes PR on GN.id = PR.ginner_id
                      left join countries CO on CO.id = GN.country_id
                      left join seasons SE on SE.id = PR.season_id
              ${whereClause}
              group by GN.id, CO.id
              having count(GP.id) = 0
              order by date ${sort} nulls last
              limit ${limit}
              offset ${offset}
      `);

        const [raw, result] = await sequelize.query(`
      select
      GN.id
          from ginners GN
                  left join gin_processes GP
                            on GN.id = GP.ginner_id and date >= '${date.startDate ?? date.endDate}'
                  left join gin_processes PR on GN.id = PR.ginner_id
                  left join countries CO on CO.id = GN.country_id
                  left join seasons SE on SE.id = PR.season_id
          ${whereClause}
          group by GN.id, CO.id
          having count(GP.id) = 0
        `);

        return res.sendPaginationSuccess(res, raws, result.rowCount);
      } else {
        const [raws] = await sequelize.query(`
            select GN.id as "ginner_id",
        GN.name as "ginner_name",
        max(PR.date) as "date",
        CO.id as "country_id",
        CO.county_name as "country_name",
        array_to_string(array_agg(distinct SE.id), ',') as "season_id",
        array_to_string(array_agg(distinct SE.name), ',') as "season_name"
            from ginners GN
                    left join gin_sales GS
                              on GN.id = GS.ginner_id and date >= '${date.startDate ?? date.endDate}'
                    left join gin_sales PR on GN.id = PR.ginner_id
                    left join countries CO on CO.id = GN.country_id
                    left join seasons SE on SE.id = PR.season_id
            ${whereClause}
            group by GN.id, CO.id
            having count(GS.id) = 0
            order by date ${sort} nulls last
            limit ${limit}
            offset ${offset}
      `);

        const [raw, result] = await sequelize.query(`
      select
      GN.id
        from ginners GN
                left join gin_sales GP
                          on GN.id = GP.ginner_id and date >= '${date.startDate ?? date.endDate}'
                    left join gin_sales PR on GN.id = PR.ginner_id
                    left join countries CO on CO.id = GN.country_id
                    left join seasons SE on SE.id = PR.season_id
        ${whereClause}
        group by GN.id
        having count(GP.id) = 0
        `);

        return res.sendPaginationSuccess(res, raws, result.rowCount);
      }
    }
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.message, error);
  }
};


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
  villageSeedCottonAllocationReport,
  exportVillageSeedCotton,
  exportVillageSeedCottonAllocation,
  spinnerProcessBackwardTraceabiltyReport,
  exportSpinProcessBackwardfTraceabilty,
  brandWiseDataReport,
  exportBrandWiseDataReport,
  fetchSpinnerGreyOutReport,
  exportSpinnerGreyOutReport,
  fetchDataEntryMonitorDashboardPagination,
  fetchGinHeapReport,
  exportGinHeapReport,
  fetchGinnerProcessGreyOutReport,
  fetchSpinnerProcessGreyOutReport,
  exportGinnerProcessGreyOutReport,
  exportSpinnerProcessGreyOutReport
};

