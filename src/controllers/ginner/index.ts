import { Request, Response } from "express";
import GinProcess from "../../models/gin-process.model";
import GinHeap from "../../models/gin-heap.model";
import { Sequelize, Op } from "sequelize";
import { encrypt, generateOnlyQrCode } from "../../provider/qrcode";
import GinBale from "../../models/gin-bale.model";
import Ginner from "../../models/ginner.model";
import GinSales from "../../models/gin-sales.model";
import * as ExcelJS from "exceljs";
import * as path from "path";
import Season from "../../models/season.model";
import Program from "../../models/program.model";
import BaleSelection from "../../models/bale-selection.model";
import Transaction from "../../models/transaction.model";
import Village from "../../models/village.model";
import State from "../../models/state.model";
import Country from "../../models/country.model";
import Spinner from "../../models/spinner.model";
import CottonSelection from "../../models/cotton-selection.model";
import heapSelection from "../../models/heap-selection.model";
import sequelize from "../../util/dbConn";
import Farmer from "../../models/farmer.model";
import { send_gin_mail } from "../send-emails";
import FarmGroup from "../../models/farm-group.model";
import { formatDataForGinnerProcess } from "../../util/tracing-chart-data-formatter";
import QualityParameter from "../../models/quality-parameter.model";
import Brand from "../../models/brand.model";
import PhysicalTraceabilityDataGinner from "../../models/physical-traceability-data-ginner.model";
import PhysicalTraceabilityDataGinnerSample from "../../models/physical-traceability-data-ginner-sample.model";
import GinnerAllocatedVillage from "../../models/ginner-allocated-vilage.model";
import moment from "moment";
import GinToGinSale from "../../models/gin-to-gin-sale.model";

//create Ginner Process
const createGinnerProcess = async (req: Request, res: Response) => {
  try {
    if (req.body.lotNo) {
      let lot = await GinProcess.findOne({ where: { lot_no: req.body.lotNo } });
      if (lot) {
        return res.sendError(res, "Lot No already Exists");
      }
    }

    if (!req.body.ginnerId) {
      return res.sendError(res, "need ginner id");
    }

    // if(!req.body.programId){
    //   return res.sendError(res, "need program id");
    // }

    const data = {
      ginner_id: req.body.ginnerId,
      program_id: req.body.programId,
      season_id: req.body.seasonId,
      date: req.body.date,
      total_qty: req.body.totalQty,
      no_of_bales: req.body.noOfBales,
      gin_out_turn: req.body.got,
      lot_no: req.body.lotNo,
      reel_lot_no: req.body.reelLotNno,
      press_no: req.body.pressNo,
      heap_number: req.body.heapNumber,
      heap_register: req.body.heapRegister,
      weigh_bridge: req.body.weighBridge,
      delivery_challan: req.body.deliveryChallan,
      bale_process: req.body.baleProcess,
      from_date: req.body.from_date,
      to_date: req.body.to_date,
    };
    const ginprocess = await GinProcess.create(data);

    let uniqueFilename = `gin_procees_qrcode_${Date.now()}.png`;
    let da = encrypt(`Ginner,Process,${ginprocess.id}`);
    let aa = await generateOnlyQrCode(da, uniqueFilename);
    const gin = await GinProcess.update(
      { qr: uniqueFilename },
      {
        where: {
          id: ginprocess.id,
        },
      }
    );

    for await (const bale of req.body.bales) {
      let baleData = {
        process_id: ginprocess.id,
        bale_no: String(bale.baleNo),
        weight: bale.weight,
        staple: bale.staple,
        mic: bale.mic,
        strength: bale.strength,
        trash: bale.trash,
        color_grade: bale.colorGrade
      };
      const bales = await GinBale.create(baleData);

      let uniqueFilename = `gin_bale_qrcode_${Date.now()}.png`;
      let da = encrypt(`Ginner,Bale, ${bales.id}`);
      let aa = await generateOnlyQrCode(da, uniqueFilename);
      const gin = await GinBale.update(
        { qr: uniqueFilename },
        {
          where: {
            id: bales.id,
          }
        }
      );
    }

    for await (const heap of req.body.chooseHeap) {
      let val = await GinHeap.findOne({ where: { id: heap.id } });
      if (val) {
        if (Number(val.dataValues.qty_stock) >= Number(heap.qtyUsed)) {
          let update = await GinHeap.update({ qty_stock: isNaN(val.dataValues.qty_stock - heap.qtyUsed) ? 0 : val.dataValues.qty_stock - heap.qtyUsed }, { where: { id: heap.id } });
        } else {
          let update = await GinHeap.update({ qty_stock: 0 }, { where: { id: heap.id } });
        }
      }

      let transaction = await CottonSelection.findAll({
        where: {
          heap_id: heap.id
        }
      })

      let village = await Transaction.findAll({
        where: {
          id: { [Op.in]: transaction?.map((obj: any) => obj.transaction_id) }
        }
      })

      let cot = await heapSelection.create({
        process_id: ginprocess.id,
        heap_id: heap.id,
        transaction_id: transaction?.map((obj: any) => obj.transaction_id),
        village_id: village?.map((obj: any) => obj.village_id),
        qty_used: heap.qty_used,
      });

      let updateFabric = {}
      if (val.dataValues.qty_stock - heap.qty_used <= 0) {
        updateFabric = {
          status: false,
          qty_stock: val.dataValues.qty_stock - heap.qty_used
        }
      } else {
        updateFabric = {
          qty_stock: val.dataValues.qty_stock - heap.qty_used
        }
      }

      let update = await GinHeap.update(updateFabric, { where: { id: heap.id } });
    }

    if (req.body.enterPhysicalTraceability) {
      const physicalTraceabilityData = {
        end_date_of_DNA_marker_application: req.body.endDateOfDNAMarkerApplication,
        date_sample_collection: req.body.dateSampleCollection,
        data_of_sample_dispatch: req.body.dataOfSampleDispatch,
        operator_name: req.body.operatorName,
        cotton_connect_executive_name: req.body.cottonConnectExecutiveName,
        expected_date_of_lint_sale: req.body.expectedDateOfLintSale,
        physical_traceability_partner_id: req.body.physicalTraceabilityPartnerId,
        gin_process_id: ginprocess.id,
        ginner_id: req.body.ginnerId
      };
      const physicalTraceabilityDataGinner = await PhysicalTraceabilityDataGinner.create(physicalTraceabilityData);

      for await (const weightAndBaleNumber of req.body.weightAndBaleNumber) {
        let brand = await Brand.findOne({
          where: { id: req.body.brandId }
        });

        const updatedCount = brand.dataValues.count + 1;
        let physicalTraceabilityDataGinnerSampleData = {
          physical_traceability_data_ginner_id: physicalTraceabilityDataGinner.id,
          weight: weightAndBaleNumber.weight,
          bale_no: weightAndBaleNumber.baleNumber,
          original_sample_status: weightAndBaleNumber.originalSampleStatus,
          code: `DNA${req.body.ginnerShortname}-${req.body.reelLotNno || ''}-${updatedCount}`,
          sample_result: 0
        };
        await PhysicalTraceabilityDataGinnerSample.create(physicalTraceabilityDataGinnerSampleData);

        await Brand.update(
          { count: updatedCount },
          { where: { id: brand.id } }
        );
      }
    }

    res.sendSuccess(res, { ginprocess });
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.meessage);
  }
};

const updateGinnerProcess = async (req: Request, res: Response) => {
  if (!req.body.id) {
    return res.sendError(res, "Need Process Id");
  }
  if (req.body.lotNo) {
    let lot = await GinProcess.findOne({
      where: { lot_no: req.body.lotNo, id: { [Op.ne]: req.body.id } },
    });
    if (lot) {
      return res.sendError(res, "Lot No already Exists");
    }
  }
  const data = {
    date: req.body.date,
    lot_no: req.body.lotNo,
  };
  const ginprocess = await GinProcess.update(data, {
    where: { id: req.body.id },
  });
  res.sendSuccess(res, { ginprocess });
};

//fetch Ginner Process with filters
const fetchGinProcessPagination = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { ginnerId, seasonId, programId }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { press_no: { [Op.iLike]: `%${searchTerm}%` } },
        { heap_number: { [Op.iLike]: `%${searchTerm}%` } },
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
    //fetch data with pagination
    if (req.query.pagination === "true") {
      const { count, rows } = await GinProcess.findAndCountAll({
        where: whereCondition,
        include: include,
        offset: offset,
        limit: limit,
        order: [["id", "desc"]],
      });
     
      let sendData: any = [];
      for await (let row of rows) {
        let cotton = await CottonSelection.findAll({
          attributes: ["transaction_id"],
          where: { process_id: row.dataValues.id },
        });

        let heap = await heapSelection.findAll({
          attributes: ["transaction_id"],
          where: { process_id: row.dataValues.id },
        });

        let transactionIds = heap.flatMap((item: any) => item?.dataValues?.transaction_id || []).filter((id: any) => id !== undefined);

        let cottonHeap = [...cotton.map((item: any) => item?.dataValues?.transaction_id).filter((id: any) => id !== undefined), ...transactionIds];

        let village = [];
        if (cottonHeap.length > 0) {
          village = await Transaction.findAll({
            attributes: ["village_id"],
            where: {
              id: cottonHeap,
            },
            include: [
              {
                model: Village,
                as: "village",
                attributes: ["id", "village_name"],
              },
            ],
            group: ["village_id", "village.id"],
          });
        }

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
          where: { process_id: row.dataValues.id },
        });
        sendData.push({
          ...row.dataValues,
          village: village,
          gin_press_no:
            (bale.dataValues.pressno_from || "") +
            "-" +
            (bale.dataValues.pressno_to || "").trim(),
          lint_quantity: bale.dataValues.lint_quantity,
          reel_press_no:
            row.dataValues.no_of_bales === 0
              ? ""
              : `001-${row.dataValues.no_of_bales < 9
                ? `00${row.dataValues.no_of_bales}`
                : row.dataValues.no_of_bales < 99
                  ? `0${row.dataValues.no_of_bales}`
                  : row.dataValues.no_of_bales
              }`,
        });
      }
      return res.sendPaginationSuccess(res, sendData, count);
    } else {
      const gin = await GinProcess.findAll({
        where: whereCondition,
        include: include,
        order: [["id", "desc"]],
      });
      return res.sendSuccess(res, gin);
    }
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.meessage);
  }
};

const fetchGinHeapPagination = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { ginnerId, seasonId, programId }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
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
    //fetch data with pagination
    if (req.query.pagination === "true") {
      const { count, rows } = await GinHeap.findAndCountAll({
        where: whereCondition,
        include: include,
        offset: offset,
        limit: limit,
        order: [["id", "desc"]],
      });

      return res.sendPaginationSuccess(res, rows, count);
    } else {
      const gin = await GinProcess.findAll({
        where: whereCondition,
        include: include,
        order: [["id", "desc"]],
      });
      return res.sendSuccess(res, gin);
    }
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.meessage);
  }
};


const exportGinHeapReport = async (req: Request, res: Response) => {
  const excelFilePath = path.join(
    "./upload",
    "heap-report.xlsx"
  );

  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { ginnerId, seasonId, programId, brandId, startDate, endDate }: any =
    req.query;
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
      "From Date",
      "To Date",
      "Heap Stating Date",
      "Heap Ending Date",
      "Ginner heap no.",
      "REEL heap no.",
      "Quantity",
      "Vehicle no.",
    ]);
    headerRow.font = { bold: true };

    const { count, rows }: any = await GinHeap.findAndCountAll({
      where: whereCondition,
      include: include,
      order: [["id", "desc"]],
      offset: offset,
      limit: limit,
    });
    // // Append data to worksheet
    for await (const [index, item] of rows.entries()) {
      const rowValues = Object.values({
        index: index + 1,
        from_date: item.dataValues.from_date
          ? item.dataValues.from_date
          : "",
        to_date: item.dataValues.to_date
          ? item.dataValues.to_date
          : "",
        heap_starting_date: item.dataValues.heap_starting_date ? item.dataValues.heap_starting_date : "",
        heap_ending_date: item.dataValues.heap_ending_date ? item.dataValues.heap_ending_date : "",
        ginner_heap_no: item.dataValues.ginner_heap_no ? item.dataValues.ginner_heap_no : "",
        reel_heap_no: item.dataValues.reel_heap_no
          ? item.dataValues.reel_heap_no
          : "",
        heap_weight: item.dataValues.estimated_heap
          ? Number(item.dataValues.estimated_heap)
          : 0,
        weighbridge_vehicle_no: item.dataValues.weighbridge_vehicle_no
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
    return res.status(200).send({
      success: true,
      messgage: "File successfully Generated",
      data: process.env.BASE_URL + "heap-report.xlsx",
    });
  }
  catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

//Export the Ginner Sales details through excel file
const exportGinnerProcess = async (req: Request, res: Response) => {
  const excelFilePath = path.join("./upload", "ginner-process.xlsx");
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { ginnerId, seasonId, programId }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { press_no: { [Op.iLike]: `%${searchTerm}%` } },
        { heap_number: { [Op.iLike]: `%${searchTerm}%` } },
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
    worksheet.mergeCells("A1:R1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Ginner Process";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.",
      "Created Date",
      "Date",
      "Lint Production Start Date",
      "Lint Production End Date",
      "Season",
      "Gin Lot No",
      "Gin Press No",
      "REEL Lot No",
      "Heap Number",
      "Reel Press No",
      "No of Bales",
      "Lint Quantity(kgs)",
      "Programme",
      "Got",
      "Total Seed Cotton Consumed(kgs)",
      "Grey Out Status"
    ]);
    headerRow.font = { bold: true };
    const gin = await GinProcess.findAll({
      where: whereCondition,
      include: include,
      order: [["id", "desc"]],
      // offset: offset,
      // limit: limit,
    });
    // Fetch associated data in bulk for better performance
    const processIds = gin.map((process: any) => process.id);
    // Fetch GinBale data for all gin processes in one query
    const ginBales = await GinBale.findAll({
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
        "process_id",
      ],
      raw: true,
      where: { process_id: { [Op.in]: processIds } },
      group: ["process_id"],
    });

    for await (const [index, item] of gin.entries()) {
      let a = await CottonSelection.findAll({
        attributes: ["transaction_id"],
        where: { process_id: item.dataValues.id },
      });

      let b = await heapSelection.findAll({
        attributes: ["transaction_id"],
        where: { process_id: item.dataValues.id },
      });

      let cotton = [
        ...a.map((item: any) => item?.dataValues?.transaction_id).flat(),
        ...b.map((item: any) => item?.dataValues?.transaction_id).flat()
      ];

      let village = [];
      if (cotton.length > 0) {
        village = await Transaction.findAll({
          attributes: ["village_id"],
          where: {
            id: cotton,
          },
          include: [
            {
              model: Village,
              as: "village",
              attributes: ["village_name"],
            },
          ],
          group: ["village_id", "village.id"],
        });
      }

      let bale = ginBales.find((obj: any) => obj.process_id == item.id);
      let gin_press_no =
        (bale?.pressno_from || "") + "-" + (bale?.pressno_to || "").trim();
      let lint_quantity = bale?.lint_quantity ?? 0;
      let reel_press_no =
        item.dataValues.no_of_bales === 0
          ? ""
          : `001-${item.dataValues.no_of_bales < 9
            ? `00${item.dataValues.no_of_bales}`
            : item.dataValues.no_of_bales < 99
              ? `0${item.dataValues.no_of_bales}`
              : item.dataValues.no_of_bales
          }`;
      const rowValues = Object.values({
        index: index + 1,
        createdDate: item.createdAt ? item.createdAt : "",
        date: item.date ? item.date : "",
        from: item.from_date ? item.from_date : "",
        to: item.to_date ? item.to_date : "",
        season: item.season ? item.season.name : "",
        lot: item.lot_no ? item.lot_no : "",
        gin_press_no: gin_press_no ? gin_press_no : "",
        reel_lot_no: item.reel_lot_no ? item.reel_lot_no : "",
        heap_number: item.heap_number ? item.heap_number : "",
        press_no: reel_press_no ? reel_press_no : "",
        no_of_bales: item.no_of_bales ? item.no_of_bales : "",
        lint_quantity: lint_quantity ? lint_quantity : "",
        program: item.program ? item.program.program_name : "",
        gin_out_turn: item.gin_out_turn ? item.gin_out_turn : "",
        total_qty: item.total_qty ? item.total_qty : "",
        // a: village.map((obj: any) => obj?.dataValues?.village?.village_name)?.toString() ?? '',
        greyout_status: item.greyout_status ? "Yes" : "No",
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
      column.width = Math.min(25, maxCellLength + 2); // Limit width to 30 characters
    });

    // Save the workbook
    await workbook.xlsx.writeFile(excelFilePath);
    res.status(200).send({
      success: true,
      messgage: "File successfully Generated",
      data: process.env.BASE_URL + "ginner-process.xlsx",
    });
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

// const chooseBale = async (req: Request, res: Response) => {
//   const searchTerm = req.query.search || "";
//   const { ginnerId, seasonId, programId }: any = req.query;
//   const whereCondition: any = {};
//   try {
//     if (searchTerm) {
//       whereCondition[Op.or] = [
//         { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
//         { lot_no: { [Op.iLike]: `%${searchTerm}%` } },
//         { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
//         { press_no: { [Op.iLike]: `%${searchTerm}%` } },
//       ];
//     }
//     if (!ginnerId) {
//       return res.sendError(res, "Ginner Id is required");
//     }
//     if (!programId) {
//       return res.sendError(res, "Programme Id is required");
//     }
//     if (ginnerId) {
//       whereCondition.ginner_id = ginnerId;
//     }
//     if (programId) {
//       const idArray: number[] = programId
//         .split(",")
//         .map((id: any) => parseInt(id, 10));
//       whereCondition.program_id = { [Op.in]: idArray };
//     }

//     let include = [
//       {
//         model: Ginner,
//         as: "ginner",
//       },
//       {
//         model: Season,
//         as: "season",
//       },
//       {
//         model: Program,
//         as: "program",
//       },
//     ];
//     //fetch data with pagination

//     // let result = await GinProcess.findAll({
//     //   where: whereCondition,
//     //   include: include,
//     //   order: [["id", "DESC"]],
//     // });
//     // const id_array = result.map((item: any) => item.id);
//     // const bales_list = [];
//     // for await (const id of id_array) {
//     //   const lot_details = await GinBale.findAll({
//     //     attributes: [
//     //       [
//     //         sequelize.fn(
//     //           "SUM",
//     //           Sequelize.literal(
//     //             'CAST("gin-bales"."weight" AS DOUBLE PRECISION)'
//     //           )
//     //         ),
//     //         "weight",
//     //       ],
//     //       // Add other attributes here...
//     //     ],
//     //     where: {
//     //       sold_status: false,
//     //     },
//     //     include: [
//     //       {
//     //         model: GinProcess,
//     //         as: "ginprocess",
//     //         attributes: ["id", "lot_no", "date", "press_no", "reel_lot_no"],
//     //         where: { id: id },
//     //       },
//     //     ],
//     //     group: ["ginprocess.id", "ginprocess.lot_no"],
//     //   });
//     //   if (lot_details.length > 0) {
//     //     const bales = await GinBale.findAll({
//     //       where: {
//     //         process_id: id,
//     //         sold_status: false,
//     //       },
//     //     });

//     //     if (bales.length > 0) {
//     //       lot_details[0].dataValues.bales = bales;
//     //       bales_list.push(lot_details[0]);
//     //     }
//     //   }
//     // }

//     const [results, metadata] = await sequelize.query(
//       `SELECT 
//           jsonb_build_object(
//               'ginprocess', jsonb_build_object(
//                   'id', gp.id,
//                   'lot_no', gp.lot_no,
//                   'date', gp.date,
//                   'press_no', gp.press_no,
//                   'reel_lot_no', gp.reel_lot_no,
//                   'greyout_status', gp.greyout_status
//               ),
//               'weight', SUM(CAST(gb.weight AS DOUBLE PRECISION)),
//               'bales', jsonb_agg(jsonb_build_object(
//                   'id', gb.id,
//                   'bale_no', gb.bale_no,
//                   'weight', gb.weight,
//                   'is_all_rejected', gb.is_all_rejected,
//                   'greyout_status', gp.greyout_status
//               ) ORDER BY gb.id ASC)
//           ) AS result
//       FROM 
//           gin_processes gp
//       JOIN 
//           "gin-bales" gb ON gp.id = gb.process_id
//       JOIN 
//           ginners g ON gp.ginner_id = g.id
//       JOIN 
//           seasons s ON gp.season_id = s.id
//       JOIN 
//           programs p ON gp.program_id = p.id
//       WHERE 
//           gp.ginner_id = ${ginnerId}
//           AND gp.program_id IN (${programId})
//           AND gb.sold_status = false
//       GROUP BY 
//           gp.id, gp.lot_no, gp.date, gp.press_no, gp.reel_lot_no
//       ORDER BY 
//           gp.id DESC;
// `
//     )

//     const simplifiedResults = results.map((item: any) => item.result);
//     return res.sendSuccess(res, simplifiedResults); //bales_list
//   } catch (error: any) {
//     console.error(error);
//     return res.sendError(res, error.meessage);
//   }
// };

const chooseBale = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const { ginnerId, seasonId, programId }: any = req.query;
  const whereCondition: any = {};
  try {

    if (!ginnerId) {
      return res.sendError(res, "Ginner Id is required");
    }
    if (!programId) {
      return res.sendError(res, "Programme Id is required");
    }

    const [results, metadata] = await sequelize.query(
      `SELECT 
          jsonb_build_object(
              'ginprocess', jsonb_build_object(
                  'id', combined_data.process_id,
                  'lot_no', combined_data.lot_no,
                  'date', combined_data.date,
                  'press_no', combined_data.press_no,
                  'reel_lot_no', combined_data.reel_lot_no,
                  'greyout_status', combined_data.greyout_status,
                  'verification_status', combined_data.verification_status,
                  'te_process_verified_status', combined_data.te_process_verified_status,
                  'te_verified_total_qty', combined_data.te_verified_total_qty,
                  'te_verified_bales', combined_data.te_verified_bales,
                  'gin_process_verified_status', combined_data.gin_process_verified_status,
                  'gin_verified_total_qty', combined_data.gin_verified_total_qty,
                  'gin_verified_bales', combined_data.gin_verified_bales,
                  'scm_process_verified_status', combined_data.scm_process_verified_status,
                  'scm_verified_total_qty', combined_data.scm_verified_total_qty,
                  'scm_verified_bales', combined_data.scm_verified_bales,
                  'scd_process_verified_status', combined_data.scd_process_verified_status,
                  'scd_verified_total_qty', combined_data.scd_verified_total_qty,
                  'scd_verified_bales', combined_data.scd_verified_bales
              ),
             'weight', SUM(CAST(combined_data.weight AS DOUBLE PRECISION)),
            'bales', jsonb_agg(jsonb_build_object(
                'id', combined_data.bale_id,
                'process_id', combined_data.process_id,
                'bale_no', combined_data.bale_no,
                'weight', combined_data.weight,
                'is_all_rejected', combined_data.is_all_rejected,
                'sold_status', combined_data.sold_status,
                'greyout_status', combined_data.greyout_status,
                'sales_id', combined_data.sales_id,
                'is_gin_to_gin', combined_data.is_gin_to_gin,
                'te_verified_status', combined_data.te_verified_status,
                'te_verified_weight', combined_data.te_verified_weight,
                'gin_verified_status', combined_data.gin_verified_status,
                'gin_verified_weight', combined_data.gin_verified_weight,
                'scm_verified_status', combined_data.scm_verified_status,
                'scm_verified_weight', combined_data.scm_verified_weight,
                'scd_verified_status', combined_data.scd_verified_status,
                'scd_verified_weight', combined_data.scd_verified_weight
            ) ORDER BY combined_data.bale_id ASC)
          ) AS result
      FROM (
          -- First Query: Direct gin-bales
          SELECT 
              gp.id AS process_id,
              gp.lot_no,
              gp.date,
              gp.press_no,
              gp.reel_lot_no,
              gp.greyout_status,
              gp.verification_status,
              gp.te_verified_status AS te_process_verified_status,
              gp.te_verified_total_qty,
              gp.te_verified_bales,
              gp."gin_verified_status" AS gin_process_verified_status,
              gp."gin_verified_total_qty",
              gp."gin_verified_bales",
              gp."scm_verified_status" AS scm_process_verified_status,
              gp."scm_verified_total_qty",
              gp."scm_verified_bales",
              gp."scd_verified_status" AS scd_process_verified_status,
              gp."scd_verified_total_qty",
              gp."scd_verified_bales",
              gb.id AS bale_id,
              gb.bale_no,
              gb.weight,
              gb.sold_status,
              gb.te_verified_status,
              gb.te_verified_weight,
              gb."gin_verified_status",
              gb."gin_verified_weight",
              gb."scm_verified_status",
              gb."scm_verified_weight",
              gb."scd_verified_status",
              gb."scd_verified_weight",
              gb."gin_level_verify",
              gb.is_all_rejected,
              g.id AS ginner_id,
              gp.program_id,
              gp.season_id,
              null AS sales_id,
              false AS is_gin_to_gin -- Add a flag to identify the source
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
              gp.ginner_id = ${ginnerId}
              AND gp.program_id IN (${programId})
              AND gb.sold_status = false
          
          UNION ALL

          -- Second Query: Gin-to-Gin sales
          SELECT 
              gp.id AS process_id,
              gp.lot_no,
              gp.date,
              gp.press_no,
              gp.reel_lot_no,
              gp.greyout_status,
              gp.verification_status,
              gp.te_verified_status AS te_process_verified_status,
              gp.te_verified_total_qty,
              gp.te_verified_bales,
              gp."gin_verified_status" AS gin_process_verified_status,
              gp."gin_verified_total_qty",
              gp."gin_verified_bales",
              gp."scm_verified_status" AS scm_process_verified_status,
              gp."scm_verified_total_qty",
              gp."scm_verified_bales",
              gp."scd_verified_status" AS scd_process_verified_status,
              gp."scd_verified_total_qty",
              gp."scd_verified_bales",
              gb.id AS bale_id,
              gb.bale_no,
              gb.weight,
              gb.sold_status,
              gb.te_verified_status,
              gb.te_verified_weight,
              gb."gin_verified_status",
              gb."gin_verified_weight",
              gb."scm_verified_status",
              gb."scm_verified_weight",
              gb."scd_verified_status",
              gb."scd_verified_weight",
              gb."gin_level_verify",
              gb.is_all_rejected,
              g.id AS ginner_id,
              gp.program_id,
              gp.season_id,
              gs.id AS sales_id,
              true AS is_gin_to_gin -- Add a flag to identify the source
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
              gtg.new_ginner_id = ${ginnerId}
              AND gp.program_id IN (${programId})
              AND gb.sold_status = true
              AND gtg.gin_accepted_status = true
              AND gtg.gin_sold_status IS NULL
          ) OR (
              gtg.old_ginner_id = ${ginnerId}
              AND gp.program_id IN (${programId})
              AND gb.sold_status = true
              AND gtg.gin_accepted_status = false
              AND gtg.gin_sold_status IS NULL
           )
      ) combined_data
      GROUP BY 
          combined_data.process_id, combined_data.lot_no, combined_data.date, combined_data.press_no, combined_data.reel_lot_no, combined_data.greyout_status,
          combined_data.te_process_verified_status, combined_data.te_verified_total_qty, combined_data.te_verified_bales, combined_data.gin_process_verified_status, combined_data.gin_verified_total_qty, combined_data.gin_verified_bales, 
          combined_data.scm_process_verified_status, combined_data.scm_verified_total_qty, combined_data.scm_verified_bales, combined_data.scd_process_verified_status, combined_data.scd_verified_total_qty, combined_data.scd_verified_bales, combined_data.verification_status
      ORDER BY 
          combined_data.process_id DESC;
    `
    )

    const simplifiedResults = results.map((item: any) => item.result);
    return res.sendSuccess(res, simplifiedResults); //bales_list
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.meessage);
  }
};


const deleteGinnerProcess = async (req: Request, res: Response) => {
  try {
    let ids = await BaleSelection.count({
      where: { "$bale.process_id$": req.body.id },
      include: [{ model: GinBale, as: "bale" }],
    });

    if (ids > 0) {
      return res.sendError(res, "Unable to delete this process since some bales of this process was sold");
    } else {
      // let cotton = await CottonSelection.findAll({
      //   where: { process_id: req.body.id },
      // });
      // for await (let cs of cotton) {
      //   await Transaction.update(
      //     {
      //       qty_stock: Sequelize.literal(
      //         `qty_stock + ${cs.dataValues.qty_used}`
      //       ),
      //     },
      //     {
      //       where: {
      //         id: cs.dataValues.transaction_id,
      //       },
      //     }
      //   );
      // }
      // await CottonSelection.destroy({
      //   where: {
      //     process_id: req.body.id,
      //   },
      // });

      let selectedHeap = await heapSelection.findAll({ where: { process_id: req.body.id } });

      for await (let heap of selectedHeap) {
        await GinHeap.increment(
          { qty_stock: heap.dataValues.qty_used ?? 0 },
          {
            where: {
              id: heap.dataValues.heap_id,
            },
          }
        );
        await GinHeap.update(
          { status: true },
          {
            where: {
              id: heap.dataValues.heap_id,
            },
          }
        );
      }
      await heapSelection.destroy({
        where: {
          process_id: req.body.id,
        },
      });

      const physicalTraceabilityDataGinner = await PhysicalTraceabilityDataGinner.findOne({ where: { gin_process_id: req.body.id } });
      if (physicalTraceabilityDataGinner) {
        await PhysicalTraceabilityDataGinnerSample.destroy({
          where: { physical_traceability_data_ginner_id: physicalTraceabilityDataGinner.id }
        });
        await PhysicalTraceabilityDataGinner.destroy({
          where: { gin_process_id: req.body.id }
        });
      }

      await GinProcess.destroy({
        where: {
          id: req.body.id,
        },
      });

      return res.sendSuccess(res, {
        message: "Successfully deleted this process",
      });
    }
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

const fetchGinProcess = async (req: Request, res: Response) => {
  const whereCondition: any = { id: req.query.id };
  try {
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
    //fetch data with pagination

    const gin = await GinProcess.findOne({
      where: whereCondition,
      include: include,
    });
    return res.sendSuccess(res, gin);
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.meessage);
  }
};
//fetch Ginner Bale
const fetchGinBale = async (req: Request, res: Response) => {
  try {
    //fetch data with process id
    const gin = await GinBale.findAll({
      where: {
        process_id: req.query.processId,
      },
      include: [
        {
          model: GinProcess,
          as: "ginprocess",
        },
      ],
    });
    return res.sendSuccess(res, gin);
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.meessage);
  }
};

const chooseCotton = async (req: Request, res: Response) => {
  try {
    let ginnerid = req.query.ginnerId;
    let programId = req.query.programId;
    if (!ginnerid) {
      return res.sendError(res, "Need Ginner Id");
    }
    if (!programId) {
      return res.sendError(res, "Need Programme Id");
    }
    let villageId: any = req.query.villageId;
    let seasonId: any = req.query.seasonId;
    let whereCondition: any = {};

    let transactionCondition: any = {
      status: "Sold",
      heap_status: {
        [Op.or]: [null, "Pending"],
      },
      qty_stock: {
        [Op.gt]: 0,
      },
      mapped_ginner: ginnerid,
      program_id: programId,
      greyout_status: false
    };

    if (villageId) {
      const idArray: number[] = villageId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.village_id = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.season_id = { [Op.in]: idArray };
    }
    else {
      // If no seasonId is provided, filter by season name "2024-25" or greater
      whereCondition["$season.name$"] = { [Op.gte]: "2024-25" };
    }

    const allocated = await GinnerAllocatedVillage.findAll({
      where: {
        ginner_id: ginnerid,
        program_id: programId,
        ...whereCondition
      },
      include: [
        { model: Village, as: "village" },
        { model: Program, as: "program" },
        { model: Season, as: "season" },
      ]
    })
    const summedData: any = {};

    for await (let row of allocated) {

      const results = await Transaction.findAll({
        // attributes: [
        // [Sequelize.fn("SUM", Sequelize.col("qty_stock")), "qty_stock"],
        // [Sequelize.fn("SUM", Sequelize.col("qty_stock")), "qty_used"],
        // [
        //   sequelize.fn(
        //     "COALESCE",
        //     sequelize.fn(
        //       "SUM",
        //       Sequelize.literal('CAST("qty_purchased" AS DOUBLE PRECISION)')
        //     ),
        //     0
        //   ),
        //   "estimated_qty",
        // ],
        // ],
        attributes: ["id", "qty_stock", "qty_purchased", "village_id", "vehicle", "date"],
        include: [
          { model: Village, as: "village" },
          { model: Program, as: "program" },
          { model: Season, as: "season" },
        ],
        where: {
          ...transactionCondition,
          village_id: row?.dataValues?.village_id,
          season_id: row?.dataValues?.season_id,
        },
        // group: ["transactions.village_id, transactions.id"],
        order: [
          ["id", "DESC"],
          [Sequelize.col("accept_date"), "DESC"],
        ],
      });


      results.forEach((result: any) => {
        const villageId = result.dataValues.village_id;
        if (summedData[villageId]) {
          summedData[villageId].qty_stock += result.dataValues.qty_stock;
          summedData[villageId].vehicle = [
            ...summedData[villageId].vehicle,
            {
              tran_id: result.dataValues.id,
              village_id: villageId,
              qty_stock: result.dataValues.qty_stock,
              qty_used: result.dataValues.qty_stock,
              estimated_qty: result.dataValues.qty_purchased,
              date_of_procurement: result.dataValues.date,
              vehicle_no: result.dataValues.vehicle
            }
          ]
        }
        else {
          summedData[villageId] = {
            ...result.village.dataValues,
            qty_stock: result.dataValues.qty_stock,
            vehicle: [{
              tran_id: result.dataValues.id,
              village_id: villageId,
              qty_stock: result.dataValues.qty_stock,
              qty_used: result.dataValues.qty_stock,
              estimated_qty: result.dataValues.qty_purchased,
              date_of_procurement: result.dataValues.date,
              vehicle_no: result.dataValues.vehicle
            }],
            vlg_id: villageId,
            program: result.program,
            season: result.season,
          };
        }
      });
    }

    const finalResult = Object.values(summedData);
    res.sendSuccess(res, finalResult);
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

const createHeap = async (req: Request, res: Response) => {
  try {
    const data: any = {
      ginner_id: req.body.ginnerId,
      season_id: req.body.seasonId,
      program_id: req.body.programId,
      heap_starting_date: req.body.heapStartingDate,
      from_date: req.body.fromDate,
      to_date: req.body.toDate,
      heap_ending_date: req.body.heapEndingDate,
      reel_heap_no: req.body.REELHeapNo,
      ginner_heap_no: req.body.ginnerHeapNo,
      upload_heap_register: req.body.uploadHeapRegister,
      weighbridge_village: req.body.weighbridgeVillage,
      weighbridge_vehicle_no: req.body.weighbridgeVehicleNo,
      weighbridge_upload_recipt: req.body.weighbridgeUploadRecipt,
      weighbridge_vehicle_photo: req.body.weighbridgeVehiclePhoto,
      status: true,
      estimated_heap: req.body.total_qty_used,
      qty_stock: req.body.total_qty_used
    };

    const ginheap = await GinHeap.create(data);
    // const ginheap:any={};

    for await (const cotton of req.body.chooseCotton) {

      // let trans = await Transaction.findAll({
      //   where: {
      //     mapped_ginner: req.body.ginnerId,
      //     status: "Sold",
      //     heap_status: {
      //       [Op.or]:[ null, "Pending"],
      //     }, 
      //     village_id: cotton.village_id,
      //     program_id: req.body.programId,
      //     qty_stock: { [Op.gt]: 0 },
      //   },
      // });

      // for await (const tran of trans) {
      //   let realQty = 0;
      //   if (cotton.qty_used > 0) {
      //     let qty_stock = tran.dataValues.qty_stock || 0;
      //     if (qty_stock < cotton.qty_used) {
      //       realQty = qty_stock;
      //       cotton.qty_used = Number(cotton.qty_used) - Number(realQty);
      //     } else {
      //       realQty = cotton.qty_used;
      //       cotton.qty_used = 0;
      //     }
      //     let update = await Transaction.update(
      //       { qty_stock: qty_stock - Number(realQty),heap_status:"Sold" },
      //       { where: { id: tran.id } }
      //     );

      let trans = await Transaction.findOne({
        where: {
          id: cotton.tran_id,
          qty_stock: { [Op.gt]: 0 },
        },
      });

      let update = await Transaction.update(
        { qty_stock: trans.dataValues.qty_stock - Number(cotton.qty_used), heap_status: "Sold" },
        { where: { id: cotton.tran_id } }
      );
      let cot = await CottonSelection.create({
        process_id: 0,
        heap_id: ginheap.id,
        transaction_id: cotton.tran_id,
        qty_used: cotton.qty_used,
      });
      // }
      // }
    }

    res.sendSuccess(res, { ginheap });
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.meessage);
  }
};

const chooseHeap = async (req: Request, res: Response) => {
  try {
    let ginnerid = req.query.ginnerId;
    let programId = req.query.programId;
    if (!ginnerid) {
      return res.sendError(res, "Need Ginner Id");
    }
    if (!programId) {
      return res.sendError(res, "Need Program Id");
    }

    let seasonId: any = req.query.seasonId;
    let whereCondition: any = {
      status: true,
      qty_stock: {
        [Op.gt]: 0,
      },
      ginner_id: ginnerid,
      program_id: programId,
    };

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.season_id = { [Op.in]: idArray };
    }

    const results = await GinHeap.findAll({
      include: [
        { model: Program, as: "program" },
        { model: Season, as: "season" },
      ],
      where: whereCondition,
      order: [
        ["id", "DESC"],
        [Sequelize.col("createdAt"), "DESC"],
      ],
    });

    const finalResult = Object.values(results);
    res.sendSuccess(res, finalResult);
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

const updateTransactionStatus = async (req: Request, res: Response) => {
  try {
    let trans: any = [];
    for await (let obj of req.body.items) {
      const data: any = {
        status: obj.status,
        heap_status: "Pending",
        accept_date: obj.status === "Sold" ? new Date().toISOString() : null,
      };

      const transaction = await Transaction.update(data, {
        where: {
          id: obj.id,
        },
      });
      trans.push(transaction);
    }

    res.sendSuccess(res, trans);
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

//Export the Ginner Sales details through excel file
const exportGinnerSales = async (req: Request, res: Response) => {
  const excelFilePath = path.join("./upload", "lint-sale.xlsx");
  const searchTerm = req.query.search || "";
  const { ginnerId, seasonId, programId }: any = req.query;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type
        { lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
        { press_no: { [Op.iLike]: `%${searchTerm}%` } },
        { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { "$buyerdata.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { rate: { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
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
    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    worksheet.mergeCells("A1:J1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Lint Sale";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.",
      "Date",
      "Season",
      "Invoice No",
      "Sold To",
      "No of Bales",
      "Bale Lot",
      "Bale/press No",
      "REEL Lot No",
      "Programme",
      "Grey Out Status"
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
      },
      {
        model: Ginner,
        as: "buyerdata_ginner",
      },
    ];
    const gin = await GinSales.findAll({
      where: whereCondition,
      include: include,
    });
    // Append data to worksheet
    for await (const [index, item] of gin.entries()) {
      const rowValues = Object.values({
        index: index + 1,
        date: item.date ? item.date : "",
        season: item.season ? item.season.name : "",
        invoice: item.invoice_no ? item.invoice_no : "",
        buyer: item.buyerdata ? item.buyerdata.name : "",
        no_of_bales: item.no_of_bales ? item.no_of_bales : "",
        lot_no: item.lot_no ? item.lot_no : "",
        press_no: item.press_no ? item.press_no : "",
        reel_lot_no: item.reel_lot_no ? item.reel_lot_no : "",
        program: item.program ? item.program.program_name : "",
        grey_out_status: item.greyout_status ? "Yes" : "No",
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
      column.width = Math.min(25, maxCellLength + 2); // Limit width to 30 characters
    });

    // Save the workbook
    await workbook.xlsx.writeFile(excelFilePath);
    res.status(200).send({
      success: true,
      messgage: "File successfully Generated",
      data: process.env.BASE_URL + "lint-sale.xlsx",
    });
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

//create Ginner Sale
const createGinnerSales = async (req: Request, res: Response) => {
  try {
    const data = {
      ginner_id: req.body.ginnerId,
      program_id: req.body.programId,
      season_id: req.body.seasonId,
      date: req.body.date,
      total_qty: req.body.totalQty,
      no_of_bales: req.body.noOfBales,
      choosen_bale: req.body.choosenBale,
      lot_no: req.body.lotNo,
      buyer: req.body.buyer,
      shipping_address: req.body.shippingAddress,
      transaction_via_trader: req.body.transactionViaTrader,
      transaction_agent: req.body.transactionAgent,
      candy_rate: req.body.candyRate,
      rate: req.body.rate,
      reel_lot_no: req.body.reelLotNno ? req.body.reelLotNno : null,
      despatch_from: req.body.despatchFrom,
      press_no: req.body.pressNo,
      status: "To be Submitted",
      qty_stock: 0,
      buyer_type: req.body.buyerType?.toLowerCase() === 'ginner' ? 'Ginner' : 'Spinner',
      buyer_ginner: req.body.buyerGinner,
    };
    const ginSales = await GinSales.create(data);
    let uniqueFilename = `gin_sales_qrcode_${Date.now()}.png`;
    let da = encrypt("Ginner,Sale," + ginSales.id);
    let aa = await generateOnlyQrCode(da, uniqueFilename);
    const gin = await GinSales.update(
      { qr: uniqueFilename },
      {
        where: {
          id: ginSales.id,
        },
      }
    );
    for await (const bale of req.body.bales) {

      if(req.body.buyerType?.toLowerCase() === 'ginner'){

        let gintogin = {
          sales_id: ginSales.id,
          bale_id: bale.id,
          process_id: bale.process_id,
          bale_weight: bale.weight,
          old_ginner_id: req.body.ginnerId,
          new_ginner_id: req.body.buyerGinner,
          old_gin_sales_id: bale.sales_id ? bale.sales_id : null 
        }

        const bales = await GinToGinSale.create(gintogin);
      }

      if(bale.sales_id && bale.is_gin_to_gin && bale.process_id){
        const gin = await GinToGinSale.update(
          { gin_sold_status: true },
          {
            where: {
              sales_id: bale.sales_id,
              bale_id: bale.id,
              process_id: bale.process_id,
            },
          }
        );

        const ginsaledata = await GinSales.findOne({ where: { id: bale.sales_id } });
        if(ginsaledata){
          if (Number(ginsaledata?.qty_stock) - Number(bale.weight) <= 0) {
            await GinSales.update({ qty_stock: 0}, { where: { id: bale.sales_id } });
          }else{
            let update = await GinSales.update({ qty_stock: Number(ginsaledata?.qty_stock) - Number(bale.weight) }, { where: { id: bale.sales_id } });
          }
        }

      }

      let baleData = {
        sales_id: ginSales.id,
        bale_id: bale.id,
        gin_to_gin_sale: req.body.buyerType?.toLowerCase() === 'ginner' ? true : false
      };
      const bales = await BaleSelection.create(baleData);
      const ginbaleSatus = await GinBale.update(
        { sold_status: true, 
          is_gin_to_gin_sale: req.body.buyerType?.toLowerCase() === 'ginner' ? true : bale.is_gin_to_gin ? true : null, 
          gin_to_gin_sold_status:  bale.is_gin_to_gin ? true : null , 
          sold_by_sales_id: ginSales.id
        },
        { where: { id: bale.id } }
      );
    }
    res.sendSuccess(res, { ginSales });
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.meessage);
  }
};

const getCOCDocumentData = async (
  req: Request, res: Response
) => {
  try {
    const id = req.query.id;
    if (!id)
      return res.sendError(res, "Need Ginner Sales Id");

    const cocRes = {
      ginnerName: '',
      address: '',
      brandName: '',
      brandLogo: '',
      reelAuthorizationCode: '',
      garmentItemDescription: '',
      frmrFarmGroup: '',
      gnrName: '',
      reelLotno: '',
      gnrTotalQty: '',
      date: '',
    };

    let [result] = await sequelize.query(`
      select  gs.id                                                   as id,
              gs.reel_lot_no                                          as reel_lotno,
              gs.date                                                 as gnr_sales_date,
              gnr.name                                                as ginner_name,
              gnr.id                                                  as ginner_id,
              gnr.address                                             as address,
              gs.total_qty                                            as gnr_total_qty,
              array_to_string(array_agg(distinct gb.process_id), ',') as process_ids,
              ''                                                      as reel_authorization_code,
              case
                  when br.brand_name is not null
                      then br.brand_name
                  else gnr.name
                  end                                        as brand_name,
              case
                  when br.logo is not null
                      then br.logo
                  end                                        as brand_logo
              from gin_sales gs
              left join ginners gnr on gnr.id = gs.ginner_id
              left join brands br on  br.id =ANY(gnr.brand)
              left join spinners prg on prg.id = gs.buyer
              left join bale_selections bs on bs.sales_id = gs.id
              left join "gin-bales" gb on gb.id = bs.bale_id
      where gs.id in (:ids)
      group by bs.sales_id, gs.id, gnr.id, br.id;
    `, {
      replacements: {ids : id },
      type: sequelize.QueryTypes.SELECT,
      raw: true
    });
    if (result) {
      cocRes.gnrName = result.ginner_name;
      cocRes.address = result.address;
      cocRes.brandName = result.brand_name;
      cocRes.brandLogo = result.brand_logo;
      
      cocRes.gnrTotalQty = result.gnr_total_qty;
      cocRes.reelLotno = result.reel_lotno;
      
    }
    
    if (result.ginner_id) {
      const ginsaleTotal = await sequelize.query(`
      select  (count(coc_doc)+1) as sequence_no
      from gin_sales 
      where ginner_id in (:ids);      
      `, {
        replacements: {ids: result.ginner_id},
        type: sequelize.QueryTypes.SELECT
      });
      console.log('ginsaleTotal',ginsaleTotal);
      cocRes.reelAuthorizationCode = 'REELRegenerative'+ result.brand_name + ginsaleTotal[0].sequence_no;
    }
    

    if (result.process_ids) {
      const ginProcess = await sequelize.query(`
      select  gp.id,
              array_to_string(array_agg(distinct cs.transaction_id), ',') as transaction_ids
      from gin_processes gp
              left join "gin-bales" gb on gp.id = gb.process_id
              left join "heap_selections" hs on hs.process_id = gp.id
              left join cotton_selections cs on hs.heap_id = cs.heap_id
      where gp.id in (:ids)
      group by gp.id;
      `, {
        replacements: {
          ids: result.process_ids
        },
        type: sequelize.QueryTypes.SELECT
      });

      const transaction_ids: any[] = [];
      ginProcess?.forEach((process: any) => {
        transaction_ids.push(...process.transaction_ids.split(','));
      })

      const transIds = transaction_ids.flatMap((id: any) => id.split(',').map((str: string) => str.trim()))
      .filter(id => id !== '')
      .map(Number)
      .filter(id => !isNaN(id));

      if (transIds.length) {
      const transactions = await sequelize.query(`
      select  tr.qty_purchased as frmr_qty,
              tr.id            as frmr_transaction_id,
              fg.name          as frmr_farm_group
      from transactions tr
              left join farmers fr on tr.farmer_id = fr.id
              left join farm_groups fg on fg.id = fr."farmGroup_id"
      where tr.id in (:ids)
      group by tr.id,fg.name;
      `, {
        replacements: {
          ids: transIds
        },
        type: sequelize.QueryTypes.SELECT
      });
    

      const farmGroupNames: any = [];
      for (const transaction of transactions) {
        if (transaction.frmr_farm_group && !farmGroupNames.includes(transaction.frmr_farm_group))
          farmGroupNames.push(transaction.frmr_farm_group);
      }
      cocRes.frmrFarmGroup = farmGroupNames.length ? farmGroupNames.join(', ') : '';
    }
    }
    cocRes.date = moment(new Date()).format('DD-MM-YYYY');

    return res.sendSuccess(res, cocRes);
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }

}


const updateCOCDoc = async (
  req: Request, res: Response
) => {

  try {

    const { id, cocDoc } = req.body;
    if (!id) {
      return res.sendError(res, "need sales id");
    }
    if (!cocDoc) {
      return res.sendError(res, "need COC Document id");
    }
    const ginSale = await GinSales.update(
      {
        coc_doc: cocDoc
      },
      {
        where: {
          id
        },
      }
    );


    return res.sendSuccess(res, ginSale);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.meessage);
  }
}
const getBrands = async (req: Request, res: Response) => {
  let ginnerId = req.query.ginnerId;
  if (!ginnerId) {
    return res.sendError(res, "Need Garment Id ");
  }
  let ginner = await Ginner.findOne({ where: { id: ginnerId } });
  if (!ginner) {
    return res.sendError(res, "No Ginner Found ");
  }
  let brand = await Brand.findAll({
    where: { id: { [Op.in]: ginner.dataValues.brand } },
  });
  res.sendSuccess(res, brand);
};

//update Ginner Sale
const updateGinnerSales = async (req: Request, res: Response) => {
  try {
    const data: any = {
      status: "Pending for QR scanning",
      weight_loss: req.body.weightLoss,
      sale_value: req.body.saleValue,
      invoice_no: req.body.invoiceNo,
      tc_file: req.body.tcFile,
      contract_file: req.body.contractFile,
      invoice_file: req.body.invoiceFile,
      delivery_notes: req.body.deliveryNotes,
      transporter_name: req.body.transporterName,
      vehicle_no: req.body.vehicleNo,
      lrbl_no: req.body.lrblNo
    };

    if (req.body.weightLoss) {
      for await (let obj of req.body.lossData) {
        let bale = await GinBale.findOne({
          where: {
            [Op.and]: [
              Sequelize.where(
                Sequelize.fn('TRIM', Sequelize.col('ginprocess.reel_lot_no')),
                String(obj.reelLotNo)
              ),
              Sequelize.where(
                Sequelize.fn('TRIM', Sequelize.col('bale_no')),
                String(obj.baleNo)
              )
            ]
          },
          include: [{ model: GinProcess, as: "ginprocess" }],
        });
        if (bale) {
          await GinBale.update(
            {
              old_weight: Sequelize.literal('weight'),
              weight: obj.newWeight
            },
            { where: { id: bale.dataValues.id } }
          );
        }
      }

      let [newSum] = await sequelize.query(`
        SELECT COALESCE(
            SUM(CAST(gb.weight AS DOUBLE PRECISION)), 0) AS lint_quantity 
			  FROM "gin-bales" gb
        LEFT JOIN bale_selections bs ON gb.id = bs.bale_id
        LEFT JOIN gin_sales gs ON bs.sales_id = gs.id
        WHERE bs.sales_id = ${req.body.id}`);

      if (newSum && newSum[0]) {
        let newQuantity = newSum[0]?.lint_quantity;
        data.total_qty = newQuantity;
      }
    }

    const ginSales = await GinSales.update(data, {
      where: { id: req.body.id },
    });

    if (ginSales && ginSales[0] === 1) {
      await send_gin_mail(req.body.id);
    }
    res.sendSuccess(res, { ginSales });
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.meessage);
  }
};

const updateGinnerSalesField = async (req: Request, res: Response) => {
  try {
    if (!req.body.id) {
      return res.sendError(res, "Need Sale Id");
    }
    const data = {
      invoice_no: req.body.invoiceNo,
      date: req.body.date,
      vehicle_no: req.body.vehicleNo,
    };
    const ginSales = await GinSales.update(data, {
      where: { id: req.body.id },
    });

    res.sendSuccess(res, { ginSales });
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.meessage);
  }
};

//fetch Ginner Process with filters
const fetchGinSalesPagination = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { ginnerId, seasonId, programId }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type
        { lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
        { press_no: { [Op.iLike]: `%${searchTerm}%` } },
        { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { "$buyerdata.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { rate: { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
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
      },
      {
        model: Ginner,
        as: "buyerdata_ginner",
      },
    ];
    //fetch data with pagination
    if (req.query.pagination === "true") {
      const { count, rows } = await GinSales.findAndCountAll({
        where: whereCondition,
        include: include,
        offset: offset,
        limit: limit,
        order: [["id", "desc"]],
      });
      return res.sendPaginationSuccess(res, rows, count);
    } else {
      const gin = await GinSales.findAll({
        where: whereCondition,
        include: include,
        order: [["id", "desc"]],
      });
      return res.sendSuccess(res, gin);
    }
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.meessage);
  }
};

const deleteGinSales = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    if(!req.body.id){
      return res.sendError(res, "Id is missing");
    }

    const sale = await GinSales.findOne({
      where: {
        id: req.body.id,
      },
    })

    if(sale.dataValues.status === 'Sold' || sale.dataValues.status === 'Partially Accepted' || sale.dataValues.status === 'Partially Rejected'){
      return res.sendError(res, "Unable to delete this sales since some lint of this sales is already in use");
    }

    if(sale){
      if(sale.dataValues.buyer_type === 'Ginner' && sale.dataValues.buyer_ginner){
        const gintogin = await GinToGinSale.findAll({
          where: {sales_id: req.body.id}, transaction
        })

        if(gintogin && gintogin.length > 0){
          let alreadyGinSalesIds = [];
          let alreadyGinBalesIds = [];
          let alreadyGiProcessIds = [];
          for (let item of gintogin){
            if(item?.old_gin_sales_id){
              alreadyGinSalesIds.push(item?.old_gin_sales_id);
              alreadyGinBalesIds.push(item?.bale_id);
              alreadyGiProcessIds.push(item?.process_id);
              let gin = await GinSales.findOne({
                where:{ id: item?.old_gin_sales_id}, transaction
              });
              if(gin){
                await GinSales.update({qty_stock: Number(gin.dataValues.qty_stock) + Number(item.bale_weight)},{
                  where:{ id: item?.old_gin_sales_id}, transaction
                })
              }
            }
          }
          alreadyGinSalesIds = [...new Set(alreadyGinSalesIds)];
          alreadyGinBalesIds = [...new Set(alreadyGinBalesIds)];
          alreadyGiProcessIds = [...new Set(alreadyGiProcessIds)];
          if(alreadyGinSalesIds && alreadyGinSalesIds.length > 0){
            await GinToGinSale.update(
              { gin_sold_status: null },
              {
                where: {
                  sales_id: alreadyGinSalesIds,
                  bale_id: alreadyGinBalesIds,
                  process_id: alreadyGiProcessIds,
                },
                transaction
              }
            );
          }
        }
        await GinToGinSale.destroy({ where: {sales_id: req.body.id }, transaction });

      }else{
        const bales = await GinBale.findAll(
            {
              attributes: ['id','process_id','weight','sold_status','is_gin_to_gin_sale','gin_to_gin_status','gin_to_gin_sold_status','sold_by_sales_id'],
              where: {
                id: {
                  [Op.in]: sequelize.literal(
                    `(SELECT bale_id FROM bale_selections WHERE sales_id = ${req.body.id})`
                  ),
                },
              },
              transaction
            }
          );

          if(bales && bales.length > 0){
            let baleIds = [];
            for await(let bale of bales){
              if(bale.is_gin_to_gin_sale){
                let gin = await GinToGinSale.findOne({
                  where:{bale_id: bale.id, process_id: bale.process_id},
                  order: [['id','desc']], transaction
                });
                await GinToGinSale.update(
                  { gin_sold_status: null },
                  {
                    where: {
                      sales_id: gin.sales_id,
                      bale_id: bale.id, 
                      process_id: bale.process_id
                    }, 
                    transaction
                  }
                );

                if(!gin.old_gin_sales_id){
                  await GinBale.update(
                    { 
                      is_gin_to_gin_sale:  null, 
                      gin_to_gin_sold_status: null , 
                      sold_by_sales_id: null
                    },
                    { where: { id: bale.id }, transaction }
                  ); 
                }else{
                  await GinBale.update(
                    { 
                      gin_to_gin_sold_status: null , 
                      sold_by_sales_id: null
                    },
                    { where: { id: bale.id }, transaction }
                  ); 
                }
              }else{
                baleIds.push(bale.id)
              }
            }
            const res1 = await GinBale.update(
                { 
                  sold_status: false,
                  is_gin_to_gin_sale: null,
                  gin_to_gin_sold_status: null,
                  sold_by_sales_id: null, 
                },
                {
                  where: {
                    id: {
                      [Op.in]: baleIds,
                    },
                  }, transaction
                }
              );
          }
        
      }    
    }
    const res2 = await BaleSelection.destroy({
      where: {
        sales_id: req.body.id,
      },
      transaction
    });

    const res3 = await GinSales.destroy({
      where: {
        id: req.body.id,
      },
      transaction
    });
    
    await transaction.commit();
    return res.sendSuccess(res, {
      message: "Successfully deleted this process",
    });
  } catch (error: any) {
    console.error(error);
    await transaction.rollback();
    return res.sendError(res, error.meessage);
  }
};

const fetchGinSale = async (req: Request, res: Response) => {
  const whereCondition: any = { id: req.query.id };
  try {
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
      },
      {
        model: Ginner,
        as: "buyerdata_ginner",
      },
    ];
    //fetch data with pagination

    const gin = await GinSales.findOne({
      where: whereCondition,
      include: include,
    });

    const baleData = await BaleSelection.findAll({
      where: {
        sales_id: gin.id,
      },
      include: [
        {
          model: GinBale,
          as: "bale",
          include: [
            {
              model: GinProcess,
              as: "ginprocess",
              attributes: ['reel_lot_no'],
            },
          ],
        }
      ],
    });

    const response = {
      gin,
      bale: baleData?.map((item: any) => item.bale),
    };
    return res.sendSuccess(res, response);
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.meessage);
  }
};

//fetch Ginner Bale
const fetchGinSaleBale = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$bale.bale_no$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$bale.weight$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$bale.staple$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$bale.mic$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$bale.strength$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$bale.trash$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$bale.color_grade$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    whereCondition.sales_id = req.query.saleId;
    //fetch data with process id
    const { count, rows } = await BaleSelection.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: GinBale,
          as: "bale",
          include: [
            {
              model: GinProcess,
              as: "ginprocess",
              attributes: ["date", "lot_no", "reel_lot_no"],
            },
          ],
        },
        {
          model: GinSales,
          as: "sales",
          include: [
            {
              model: Ginner,
              as: "ginner",
              attributes: ["id", "name", "address", "brand"],
            },
          ],
        },
      ],
      order: [["id", "DESC"]],
      offset: offset,
      limit: limit,
    });
    let data = [];
    for await (let obj of rows) {
      if (obj.dataValues.sales.ginner) {
        let brands = await Brand.findAll({
          where: { id: obj.dataValues.sales.ginner.brand },
        });
        data.push({ ...obj.dataValues, brands });
      }
    }
    return res.sendPaginationSuccess(res, data, count);
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.meessage);
  }
};



const fetchGinSaleAllBales = async (req: Request, res: Response) => {
  const whereCondition: any = {};
  try {
    whereCondition.sales_id = req.query.saleId;
    //fetch data with process id
    const { count, rows } = await BaleSelection.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: GinBale,
          as: "bale",
          include: [
            {
              model: GinProcess,
              as: "ginprocess",
              attributes: ["date", "lot_no", "reel_lot_no"],
            },
          ],
        },
        {
          model: GinSales,
          as: "sales",
          include: [
            {
              model: Ginner,
              as: "ginner",
              attributes: ["id", "name", "address", "brand"],
            },
          ],
        },
      ],
      order: [["id", "DESC"]],
    });
    let data = [];
    for await (let obj of rows) {
      if (obj.dataValues.sales.ginner) {
        let brands = await Brand.findAll({
          where: { id: obj.dataValues.sales.ginner.brand },
        });
        data.push({ ...obj.dataValues, brands });
      }
    }
    return res.sendPaginationSuccess(res, data, count);
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.meessage);
  }
};


const updateGinSaleBale = async (req: Request, res: Response) => {
  try {
    //fetch data with process id
    let gins: any = [];
    for await (let obj of req.body.printData) {
      const gin = await BaleSelection.update(
        {
          print: obj.print,
        },
        {
          where: {
            id: obj.id,
          },
        }
      );
      gins.push(gin);
    }

    return res.sendSuccess(res, gins);
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.meessage);
  }
};

const dashboardGraphWithProgram = async (req: Request, res: Response) => {
  try {
    let whereCondition: any = {};

    let result = await Ginner.findOne({ where: { id: req.query.ginnerId } });
    if (!result) {
      res.sendError(res, "No ginner found");
    }
    let data = await Program.findAll({
      where: {
        id: { [Op.in]: result.program_id },
      },
      attributes: ["id", "program_name"],
    });
    let transaction: any = [];
    let ginner: any = [];

    for await (let obj of data) {
      whereCondition.ginner_id = req.query.ginnerId;
      whereCondition.status = "Sold";
      whereCondition.program_id = obj.id;
      const trans = await Transaction.findOne({
        where: {
          mapped_ginner: req.query.ginnerId,
          status: "Sold",
          program_id: obj.id,
        },
        attributes: [
          [
            Sequelize.fn(
              "SUM",
              Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")
            ),
            "totalPurchased",
          ],
          [Sequelize.fn("SUM", Sequelize.col("qty_stock")), "totalQuantity"],
        ],
        include: [
          {
            model: Program,
            as: "program",
            attributes: [],
          },
        ],
        group: ["program.id"],
      });
      transaction.push({ data: trans, program: obj });
      const gin = await GinSales.findOne({
        where: whereCondition,
        attributes: [
          [Sequelize.fn("SUM", Sequelize.col("no_of_bales")), "totalBales"],
          [Sequelize.fn("SUM", Sequelize.col("qty_stock")), "totalQuantity"],
        ],
        include: [
          {
            model: Program,
            as: "program",
            attributes: [],
          },
        ],
        group: ["program.id"],
      });
      ginner.push({ data: gin, program: obj });
    }

    res.sendSuccess(res, { transaction, ginner });
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.meessage);
  }
};

const getReelBaleId = async (req: Request, res: Response) => {
  try {
    let whereCondition: any = {};
    let ginnerId = req.query.ginnerId;
    whereCondition.status = "Sold";
    const baleCount = await GinBale.count({
      distinct: true,
      col: "process_id",
      include: [
        {
          model: GinProcess,
          as: "ginprocess",
          where: {
            ginner_id: req.query.ginnerId,
            program_id: req.query.programId,
          },
        },
      ],
      where: {
        sold_status: false,
      },
    });
    const result = await Ginner.findOne({
      attributes: [
        [
          Sequelize.fn(
            "concat",
            "BL-REE",
            Sequelize.fn(
              "upper",
              Sequelize.fn("left", Sequelize.col("country.county_name"), 2)
            ),
            Sequelize.fn(
              "upper",
              Sequelize.fn("left", Sequelize.col("state.state_name"), 2)
            ),
            Sequelize.fn("upper", Sequelize.col("short_name"))
          ),
          "idprefix",
        ],
      ],
      include: [
        {
          model: State,
          as: "state",
        },
        {
          model: Country,
          as: "country",
        },
      ],
      where: { id: ginnerId }, // Assuming prscr_id is a variable with the desired ID
    });
    var baleid_prefix = result.dataValues.idprefix
      ? result.dataValues.idprefix
      : "";
    let currentDate = new Date();
    let day = String(currentDate.getUTCDate()).padStart(2, "0");
    let month = String(currentDate.getUTCMonth() + 1).padStart(2, "0"); // UTC months are zero-indexed, so we add 1
    let year = String(currentDate.getUTCFullYear());

    let prcs_date = day + month + year;
    var bale_no = baleCount ? Number(baleCount ?? 0) + 1 : 1;
    const random_number = +performance.now().toString().replace('.', '7').substring(0, 4)
    var reelbale_id = baleid_prefix + prcs_date + "/" + String(random_number);
    res.sendSuccess(res, { id: reelbale_id });
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.meessage);
  }
};

const getReelHeapId = async (req: Request, res: Response) => {
  try {
    let whereCondition: any = {};
    let ginnerId = req.query.ginnerId;
    whereCondition.status = "Sold";
    const heapCount = await GinHeap.count({
      distinct: true,
      col: "id",
      where: {
        status: false,
      },
    });
    const result = await Ginner.findOne({
      attributes: [
        [
          Sequelize.fn(
            "concat",
            "HP-REE",
            Sequelize.fn(
              "upper",
              Sequelize.fn("left", Sequelize.col("country.county_name"), 2)
            ),
            Sequelize.fn(
              "upper",
              Sequelize.fn("left", Sequelize.col("state.state_name"), 2)
            ),
            Sequelize.fn("upper", Sequelize.col("short_name"))
          ),
          "idprefix",
        ],
      ],
      include: [
        {
          model: State,
          as: "state",
        },
        {
          model: Country,
          as: "country",
        },
      ],
      where: { id: ginnerId }, // Assuming prscr_id is a variable with the desired ID
    });

    var heapid_prefix = result.dataValues.idprefix
      ? result.dataValues.idprefix
      : "";
    let currentDate = new Date();
    let day = String(currentDate.getUTCDate()).padStart(2, "0");
    let month = String(currentDate.getUTCMonth() + 1).padStart(2, "0"); // UTC months are zero-indexed, so we add 1
    let year = String(currentDate.getUTCFullYear());

    let prcs_date = day + month + year;
    var heap_no = heapCount ? Number(heapCount ?? 0) + 1 : 1;
    const random_number = +performance.now().toString().replace('.', '7').substring(0, 4)
    var reelheap_id = heapid_prefix + prcs_date + "/" + String(random_number);
    res.sendSuccess(res, { id: reelheap_id });
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.meessage);
  }
};

const getProgram = async (req: Request, res: Response) => {
  try {
    if (!req.query.ginnerId) {
      return res.sendError(res, "Need Ginner Id");
    }

    let ginnerId = req.query.ginnerId;
    let result = await Ginner.findOne({ where: { id: ginnerId } });
    if (!result) {
      res.sendError(res, "No ginner found");
    }
    let data = await Program.findAll({
      where: {
        id: { [Op.in]: result.program_id },
      },
    });
    res.sendSuccess(res, data);
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.meessage);
  }
};

const getSpinner = async (req: Request, res: Response) => {
  let ginnerId = req.query.ginnerId;
  let whereCondition: any = {};

  if (!ginnerId) {
    return res.sendError(res, "Need Ginner Id ");
  }
  if (req.query.status == 'true') {
    whereCondition.status = true
  }

  let ginner = await Ginner.findOne({ where: { id: ginnerId } });
  if (!ginner) {
    return res.sendError(res, "No Ginner Found ");
  }
  let result = await Spinner.findAll({
    attributes: ["id", "name"],
    where: { ...whereCondition, brand: { [Op.overlap]: ginner.dataValues.brand } },
  });
  res.sendSuccess(res, result);
};
const getVillageAndFarmer = async (req: Request, res: Response) => {
  let ginnerId = req.query.ginnerId;
  if (!ginnerId) {
    return res.sendError(res, "Need Ginner Id ");
  }
  let whereCondition = {
    status: "Sold",
    mapped_ginner: ginnerId,
  };
  const farmers = await Transaction.findAll({
    include: [
      {
        model: Farmer,
        as: "farmer",
        attributes: [],
      },
    ],
    attributes: [
      [Sequelize.literal("farmer.id"), "id"],
      [Sequelize.literal('"farmer"."firstName"'), "firstName"],
      [Sequelize.literal('"farmer"."lastName"'), "lastName"],
      [Sequelize.literal('"farmer"."code"'), "code"],
    ],
    where: whereCondition,
    group: ["farmer_id", "farmer.id"],
  });
  const village = await Transaction.findAll({
    include: [
      {
        model: Village,
        as: "village",
        attributes: [],
      },
    ],
    attributes: [
      [Sequelize.literal("village.id"), "id"],
      [Sequelize.literal('"village"."village_name"'), "village_name"],
    ],
    where: whereCondition,
    group: ["village_id", "village.id"],
  });
  res.sendSuccess(res, { farmers, village });
};

const _getGinnerProcessTracingChartData = async (
  reelLotNo: any
) => {
  try {
    //  await createIndexes();

    let include = [
      {
        model: Ginner,
        as: "ginner",
        attributes: ['id', 'name'], // Only fetch necessary fields
      },
    ];

    let transactionInclude = [
      {
        model: Village,
        as: "village",
        attributes: ['id', 'village_name'], // Only fetch necessary fields
      },
      {
        model: Farmer,
        as: "farmer",
        attributes: ['id', 'firstName', "lastName", 'farmGroup_id', 'village_id'],
        include: [
          {
            model: Village,
            as: "village",
            attributes: ['id', 'village_name'], // Only fetch necessary fields
          },
          {
            model: FarmGroup,
            as: "farmGroup",
            attributes: ['id', 'name'], // Only fetch necessary fields
          },
        ],
      },
    ];

    let whereCondition: any = {};

    if (reelLotNo) {
      const idArray: number[] = reelLotNo
        .split(",")
      whereCondition.reel_lot_no = { [Op.in]: idArray };
    }


    const batchSize = 100;
    let offset = 0;
    let allGinData: any[] = [];

    while (true) {
      let ginBatch = await GinProcess.findAll({
        where: whereCondition,
        include: include,
        order: [["id", "desc"]],
        limit: batchSize,
        offset: offset,
        attributes: ['id', 'reel_lot_no'] // Only fetch necessary fields
      });

      if (ginBatch.length === 0) break;

      offset += batchSize;

      let ginWithTransactions = await Promise.all(
        ginBatch.map(async (el: any) => {
          el = el.toJSON();
          let cottonTransactions = await CottonSelection.findAll({
            where: {
              process_id: el.id
            },
            attributes: ['id', 'process_id', 'transaction_id'] // Only fetch necessary fields
          });

          let heapTransactions = await heapSelection.findAll({
            where: {
              process_id: el.id
            },
            attributes: ['id', 'process_id', 'transaction_id'] // Only fetch necessary fields
          });
          let transactionIds: any = [...cottonTransactions, ...heapTransactions].map((pt: any) => pt.transaction_id)

          el.transaction = await Transaction.findAll({
            where: {
              id: {
                [Op.in]: transactionIds.flat()
              }
            },
            include: transactionInclude,
            attributes: ['id', 'farmer_id', 'village_id'] // Only fetch necessary fields
          });

          return el;
        })
      );

      allGinData = allGinData.concat(ginWithTransactions);
    }

    let formattedData: any = {};

    allGinData.forEach((el: any) => {
      el.transaction.forEach((tx: any) => {
        if (!formattedData[tx.farmer.farmGroup_id]) {
          formattedData[tx.farmer.farmGroup_id] = {
            farm_name: tx.farmer.farmGroup.name,
            villages: [],
          };
        }

        const village_name = tx.farmer.village.village_name;
        if (!formattedData[tx.farmer.farmGroup_id].villages.includes(village_name)) {
          formattedData[tx.farmer.farmGroup_id].villages.push(village_name);
        }
      });
    });

    formattedData = Object.keys(formattedData).map((key: any) => {
      return formattedData[key];
    });

    return formatDataForGinnerProcess(reelLotNo, formattedData);
  } catch (error) {
    console.error(error);
  }
};

const getGinnerProcessTracingChartData = async (
  req: Request,
  res: Response
) => {
  const { reelLotNo }: any = req.query;
  if (!reelLotNo) {
    return res.status(400).send({ error: "reelLotNo is required" });
  }
  const data = await _getGinnerProcessTracingChartData(reelLotNo);
  res.sendSuccess(res, data);
};


const checkReport = async (req: Request, res: Response) => {
  try {
    if (!req.query.ginnerId) {
      return res.sendError(res, "Need Ginner Id");
    }

    let ginnerId = req.query.ginnerId;
    let report = await QualityParameter.findOne({
      where: { ginner_id: ginnerId },
      order: [["id", "desc"]],
    });
    if (!report) {
      let data = await GinProcess.findAll({
        where: {
          ginner_id: ginnerId,
        },
      });
      if (data.length >= 3) {
        return res.sendSuccess(res, { show: true });
      } else {
        return res.sendSuccess(res, { show: false });
      }
    }
    let data = await GinProcess.findAll({
      where: {
        createdAt: { [Op.gt]: report.dataValues.createdAt },
        ginner_id: ginnerId,
      },
    });
    if (data.length >= 3) {
      res.sendSuccess(res, { show: true });
    } else {
      res.sendSuccess(res, { show: false });
    }
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.meessage);
  }
};


//gin to gin sales changes
const fetchGinLintAlert = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { ginnerId, status, filter, programId, sellerGinnerId, seasonId }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = [];

  try {
        if (searchTerm) {
          whereCondition.push(`
            (
              g.name ILIKE '%${searchTerm}%' OR
              s.name ILIKE '%${searchTerm}%' OR
              p.program_name ILIKE '%${searchTerm}%' OR
              gs.lot_no ILIKE '%${searchTerm}%' OR
              gs.reel_lot_no ILIKE '%${searchTerm}%' OR
              gs.invoice_no ILIKE '%${searchTerm}%'
            )
          `);
      }

      if (!ginnerId) {
        return res.sendError(res, "Ginner Id is required");
      }

      if (seasonId) {
          const idArray = seasonId.split(",").map((id: any) => parseInt(id, 10));
          whereCondition.push(`gs.season_id IN (${idArray.join(',')})`);
      }

      if (ginnerId) {
          const idArray = ginnerId.split(",").map((id: any) => parseInt(id, 10));
          whereCondition.push(`gs.buyer_ginner IN (${idArray.join(',')})`);
      }

      if (sellerGinnerId) {
        const idArray: number[] = sellerGinnerId
            .split(",")
            .map((id: any) => parseInt(id, 10));
        whereCondition.push(`gs.ginner_id IN (${idArray.join(',')})`);
      }


      if (programId) {
          const idArray = programId.split(",").map((id: any) => parseInt(id, 10));
          whereCondition.push(`gs.program_id IN (${idArray.join(',')})`);
      }
      whereCondition.push(`gs.buyer IS NULL`);
      whereCondition.push(`gs.buyer_type ='Ginner'`);
      whereCondition.push(`gtg.gin_accepted_status IS NULL`);
      whereCondition.push(`gs.visible_flag = true`);
      whereCondition.push(`gs.status IN ('Pending', 'Pending for QR scanning', 'Partially Accepted', 'Partially Rejected')`);

      const whereClause = whereCondition.length > 0 ? `WHERE ${whereCondition.join(' AND ')}` : '';

      const [results, metadata] = await sequelize.query(
        `SELECT 
          jsonb_build_object(
				  'id', gs.id,
                  'season_id', s.id,
                  'season_name', s.name,
                  'lot_no', gs.lot_no,
                  'date', gs.date,
                  'press_no', gs.press_no,
                  'reel_lot_no', gs.reel_lot_no,
                  'invoice_no', gs.invoice_no,
                  'vehicle_no', gs.vehicle_no,
                  'total_qty', gs.total_qty,
                  'no_of_bales', gs.no_of_bales,
                  'buyer_type', gs.buyer_type,
                  'ginner_id', g.id,
                  'ginner_name', g.name,
                  'buyer_ginner_id', buyer.id,
                  'buyer_ginner_name', buyer.name,
                  'status', gs.status,
                  'greyout_status', gs.greyout_status,
              'weight', SUM(CAST(gb.weight AS DOUBLE PRECISION)),
              'bales', jsonb_agg(jsonb_build_object(
                  'id', gb.id,
                  'bale_no', gb.bale_no,
                  'weight', gb.weight,
                  'process_id', gp.id,
                  'is_all_rejected', gb.is_all_rejected,
                  'is_gin_to_gin_sale', gb.is_gin_to_gin_sale,
                  'gin_to_gin_status', gb.gin_to_gin_status,
                  'gin_to_gin_sold_status', gb.gin_to_gin_sold_status,
                  'old_gin_sales_id', gtg.old_gin_sales_id,
                  'greyout_status', gp.greyout_status,
				  'ginprocess', jsonb_build_object(
                  'id', gp.id,
                  'lot_no', gp.lot_no,
                  'date', gp.date,
                  'press_no', gp.press_no,
                  'reel_lot_no', gp.reel_lot_no,
                  'greyout_status', gp.greyout_status
              	)
              ) ORDER BY gb.id ASC)
          ) AS result
      FROM 
          gin_to_gin_sales gtg
	    JOIN
		      gin_sales gs ON gtg.sales_id = gs.id
      JOIN 
          "gin-bales" gb ON gtg.bale_id = gb.id
	    JOIN
          gin_processes gp ON gb.process_id = gp.id
      JOIN 
          ginners g ON gs.ginner_id = g.id
	    JOIN 
          ginners buyer ON gs.buyer_ginner = buyer.id
      JOIN 
          seasons s ON gs.season_id = s.id
      JOIN 
          programs p ON gs.program_id = p.id
      ${whereClause}
      GROUP BY 
          gs.id, s.id, g.id, buyer.id
      ORDER BY 
          gs.id DESC;
  `
      )
  
      const simplifiedResults = results.map((item: any) => item.result);
      return res.sendSuccess(res, simplifiedResults); //bales_list
  } catch (error: any) {
      return res.sendError(res, error.message);
  }
};


const fetchGinLintList = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { ginnerId, status, filter, programId, sellerGinnerId, seasonId }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = [];

  try {
        if (searchTerm) {
          whereCondition.push(`
            (
              g.name ILIKE '%${searchTerm}%' OR
              s.name ILIKE '%${searchTerm}%' OR
              p.program_name ILIKE '%${searchTerm}%' OR
              gs.lot_no ILIKE '%${searchTerm}%' OR
              gs.reel_lot_no ILIKE '%${searchTerm}%' OR
              gs.invoice_no ILIKE '%${searchTerm}%'
            )
          `);
      }

      if (!ginnerId) {
        return res.sendError(res, "Ginner Id is required");
      }

      if (seasonId) {
          const idArray = seasonId.split(",").map((id: any) => parseInt(id, 10));
          whereCondition.push(`gs.season_id IN (${idArray.join(',')})`);
      }

      if (ginnerId) {
          const idArray = ginnerId.split(",").map((id: any) => parseInt(id, 10));
          whereCondition.push(`gs.buyer_ginner IN (${idArray.join(',')})`);
      }

      if (sellerGinnerId) {
        const idArray: number[] = sellerGinnerId
            .split(",")
            .map((id: any) => parseInt(id, 10));
        whereCondition.push(`gs.ginner_id IN (${idArray.join(',')})`);
      }


      if (programId) {
          const idArray = programId.split(",").map((id: any) => parseInt(id, 10));
          whereCondition.push(`gs.program_id IN (${idArray.join(',')})`);
      }
      whereCondition.push(`gs.buyer IS NULL`);
      whereCondition.push(`gs.buyer_type ='Ginner'`);
      whereCondition.push(`gtg.gin_accepted_status = true`);
      whereCondition.push(`gs.visible_flag = true`);
      whereCondition.push(`gs.status IN ('Sold', 'Partially Accepted', 'Partially Rejected')`);

      const whereClause = whereCondition.length > 0 ? `WHERE ${whereCondition.join(' AND ')}` : '';

      const countQuery = `
          SELECT COUNT(*)
          FROM (
            SELECT 
              gs.id
            FROM 
              gin_to_gin_sales gtg
            JOIN
                gin_sales gs ON gtg.sales_id = gs.id
            JOIN 
                "gin-bales" gb ON gtg.bale_id = gb.id
            JOIN
                gin_processes gp ON gb.process_id = gp.id
            JOIN 
                ginners g ON gs.ginner_id = g.id
            JOIN 
                ginners buyer ON gs.buyer_ginner = buyer.id
            JOIN 
                seasons s ON gs.season_id = s.id
            JOIN 
                programs p ON gs.program_id = p.id
            ${whereClause}
            GROUP BY 
                gs.id, s.id, g.id, buyer.id
            HAVING 
              SUM(CAST(gb.weight AS DOUBLE PRECISION)) > 0
          ) AS subquery;
       `;

       let dataQuery =
        `SELECT 
          jsonb_build_object(
				          'id', gs.id,
                  'season_id', s.id,
                  'season_name', s.name,
                  'lot_no', gs.lot_no,
                  'date', gs.date,
                  'press_no', gs.press_no,
                  'reel_lot_no', gs.reel_lot_no,
                  'invoice_no', gs.invoice_no,
                  'vehicle_no', gs.vehicle_no,
                  'received_total_qty', gs.total_qty,
                  'received_no_of_bales', gs.no_of_bales,
                  'buyer_type', gs.buyer_type,
                  'ginner_id', g.id,
                  'ginner_name', g.name,
                  'buyer_ginner_id', buyer.id,
                  'buyer_ginner_name', buyer.name,
                  'status', gs.status,
                  'greyout_status', gs.greyout_status,
                  'accepted_total_qty', SUM(CAST(gb.weight AS DOUBLE PRECISION)),
                  'accepted_no_of_bales', COUNT(DISTINCT gb.id),
                  'bales', jsonb_agg(jsonb_build_object(
                    'id', gb.id,
                    'bale_no', gb.bale_no,
                    'weight', gb.weight,
                    'is_all_rejected', gb.is_all_rejected,
                    'greyout_status', gp.greyout_status,
                    'ginprocess', jsonb_build_object(
                      'id', gp.id,
                      'lot_no', gp.lot_no,
                      'date', gp.date,
                      'press_no', gp.press_no,
                      'reel_lot_no', gp.reel_lot_no,
                      'greyout_status', gp.greyout_status
                    )
                  ) ORDER BY gb.id ASC)
            ) AS result
          FROM 
              gin_to_gin_sales gtg
          JOIN
              gin_sales gs ON gtg.sales_id = gs.id
          JOIN 
              "gin-bales" gb ON gtg.bale_id = gb.id
          JOIN
              gin_processes gp ON gb.process_id = gp.id
          JOIN 
              ginners g ON gs.ginner_id = g.id
          JOIN 
              ginners buyer ON gs.buyer_ginner = buyer.id
          JOIN 
              seasons s ON gs.season_id = s.id
          JOIN 
              programs p ON gs.program_id = p.id
          ${whereClause}
          GROUP BY 
              gs.id, s.id, g.id, buyer.id
          HAVING 
            SUM(CAST(gb.weight AS DOUBLE PRECISION)) > 0
          ORDER BY 
              gs.id DESC
          LIMIT 
              :limit 
          OFFSET 
              :offset;
      `;

      const [countResult, results] = await Promise.all([
        sequelize.query(countQuery, {
            type: sequelize.QueryTypes.SELECT,
        }),
        sequelize.query(dataQuery, {
            replacements: { limit, offset },
            type: sequelize.QueryTypes.SELECT,
        })
      ]);
      
      const totalCount = countResult && countResult.length > 0 ? Number(countResult[0]?.count) : 0;
      const simplifiedResults = results.map((item: any) => item.result);
      return res.sendPaginationSuccess(res, simplifiedResults, totalCount); //bales_list
  } catch (error: any) {
      return res.sendError(res, error.message);
  }
};


const updateStatusLintSales = async (req: Request, res: Response) => {
  try {
      let update: any = [];

      // Begin transaction to manage multiple operations as a single unit
      await sequelize.transaction(async (t: any) => {
          // Update visibility flag for all items in bulk
          await GinSales.update({ visible_flag: false }, {
              where: { id: req.body.items?.map((obj: any) => obj.id) },
              transaction: t
          });

          // Loop through items in request body to process each one
          for (const obj of req.body.items) {
              let soldCount = 0;
              let rejectedCount = 0;
              let rejectedBalesId = [];

              let data: any = {
                  accept_date: obj.status === 'Sold' ? new Date().toISOString() : null,
              };

              // Batch update for bales
              const balesToUpdate = obj.bales.map((bale: any) => bale.id);
              if (balesToUpdate.length > 0) {
                  await BaleSelection.update(
                      { ginner_status: obj.status === 'Sold' ? true : false },
                      { where: { bale_id: balesToUpdate, sales_id: obj.id, ginner_status: null, gin_to_gin_sale: true }, transaction: t }
                  );

                  await GinToGinSale.update(
                    { gin_accepted_status: obj.status === 'Sold' ? true : false },
                    { where: { bale_id: balesToUpdate, sales_id: obj.id}, transaction: t }
                );

                  if (obj.status === 'Sold') {
                      await GinBale.update({ gin_to_gin_status: true }, { where: { id: balesToUpdate }, transaction: t });
                  } else {
                      rejectedBalesId = balesToUpdate;
                      await GinBale.update({ is_all_rejected: false }, { where: { id: rejectedBalesId }, transaction: t });
                  }
              }

              // Retrieve bale data for status calculation
              const bales = await BaleSelection.findAll({
                  where: { sales_id: obj.id, gin_to_gin_sale: true },
                  attributes: ['ginner_status'],
                  transaction: t
              });

              // Count status types in bales
              soldCount = bales.filter((bale: any) => bale.ginner_status === true).length;
              rejectedCount = bales.filter((bale: any) => bale.ginner_status === false).length;

              // Determine the status
              let status = 'Partially Rejected';
              if (soldCount === bales.length) status = 'Sold';
              else if (rejectedCount === bales.length) status = 'Rejected';
              else if (soldCount > rejectedCount) status = 'Partially Accepted';

              if(status === 'Rejected'){
                console.log("==== Completely Rejected Gin To Gin Sales ====")
                // await GinBale.update({ is_all_rejected: true }, { where: { id: rejectedBalesId } });
                await sequelize.query(
                    `
                    UPDATE 
                        "gin-bales" gb
                    SET 
                        is_all_rejected = true
                    FROM 
                        bale_selections bs
                    WHERE 
                        gb.id = bs.bale_id
                        AND bs.sales_id = :rejectedId
                    `,
                    {
                      replacements: { rejectedId: obj.id },
                      transaction: t,
                      type: sequelize.QueryTypes.UPDATE,
                    }
                  );
                
                  console.log("==== GinBale Updated for Rejected Gin To Gin Sales ====");
            }

              data.status = status;

              // Calculate total quantity
              const [total] = await sequelize.query(`
                  SELECT COALESCE(SUM(CASE WHEN gb.accepted_weight IS NOT NULL 
                      THEN gb.accepted_weight ELSE CAST(gb.weight AS DOUBLE PRECISION) END), 0) AS total_qty
                  FROM bale_selections bs
                  LEFT JOIN "gin-bales" gb ON bs.bale_id = gb.id
                  WHERE bs.sales_id = :sales_id AND bs.ginner_status = true`, 
                  { replacements: { sales_id: obj.id }, type: sequelize.QueryTypes.SELECT, transaction: t });

              const ginSale = await GinSales.findOne({ where: { id: obj.id }, transaction: t });
              // const lintSale = await LintSelections.findAll({ where: { lint_id: obj.id }, transaction: t });

              console.log("max qty stock to be in Gin To Gin Sales=============",total, Math.ceil(Number(total.total_qty)), ginSale.qty_stock + Number(obj.qtyStock))

              if (ginSale && obj.status === 'Sold' && (ginSale.qty_stock + Number(obj.qtyStock)) <= Math.ceil(Number(total.total_qty))) {
                  data.qty_stock = Number(ginSale.qty_stock) + Number(obj.qtyStock);
                  // if(lintSale && lintSale?.length > 0){
                  //     let sum = lintSale?.reduce((acc: any, value:any) => Number(value?.qty_used) + acc,0);

                  //     data.accepted_bales_weight = Number(ginSale.qty_stock) + Number(obj.qtyStock) + sum;  
                  // }else{
                      data.accepted_bales_weight = Number(ginSale.qty_stock) + Number(obj.qtyStock);
                  // }
              }

              // Update GinSales with calculated data
              const result = await GinSales.update({ ...data, visible_flag: true }, {
                  where: { id: obj.id },
                  transaction: t
              });

              // Store result data
              update.push({ id: obj.id, status: data.status, qty_stock: data.qty_stock, visible_flag: true });
          }
      });

      // Send combined response with all updates
      res.sendSuccess(res, { update });
  } catch (error: any) {
      console.log(error);
      await GinSales.update({ visible_flag: true }, { where: { id: req.body.items?.map((obj: any) => obj.id) } });
      return res.sendError(res, error.message);
  }
};



export {
  createGinnerProcess,
  fetchGinProcessPagination,
  fetchGinBale,
  fetchGinHeapPagination,
  createGinnerSales,
  fetchGinSalesPagination,
  fetchGinSale,
  exportGinnerSales,
  updateGinnerSales,
  fetchGinSaleBale,
  fetchGinSaleAllBales,
  createHeap,
  exportGinHeapReport,
  chooseCotton,
  chooseHeap,
  updateTransactionStatus,
  dashboardGraphWithProgram,
  getReelBaleId,
  getReelHeapId,
  getProgram,
  updateGinSaleBale,
  chooseBale,
  deleteGinnerProcess,
  deleteGinSales,
  getSpinner,
  getVillageAndFarmer,
  getGinnerProcessTracingChartData,
  updateGinnerProcess,
  updateGinnerSalesField,
  fetchGinProcess,
  exportGinnerProcess,
  checkReport,
  _getGinnerProcessTracingChartData,
  getCOCDocumentData,
  updateCOCDoc,
  getBrands,
  fetchGinLintAlert,
  fetchGinLintList,
  updateStatusLintSales
};
