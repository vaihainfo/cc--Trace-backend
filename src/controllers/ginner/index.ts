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
        let update = await GinHeap.update({ qty_stock: isNaN(val.dataValues.qty_stock - heap.qtyUsed) ? 0 : val.dataValues.qty_stock - heap.qtyUsed }, { where: { id: heap.id } });
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
        
        let transactionIds = heap.flatMap((item: any)=> item?.dataValues?.transaction_id || []).filter((id:any)=> id !== undefined);
        
        let cottonHeap = [...cotton.map((item: any) => item?.dataValues?.transaction_id).filter((id:any) => id !== undefined), ...transactionIds];

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
    worksheet.mergeCells("A1:O1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Ginner Process";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.",
      "Created Date",
      "Date",
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
      "Village",
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
        ...a.map((item:any) => item?.dataValues?.transaction_id).flat(),
        ...b.map((item:any) => item?.dataValues?.transaction_id).flat()
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
        a: village.map((obj: any) => obj?.dataValues?.village?.village_name)?.toString() ?? '',
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

const chooseBale = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const { ginnerId, seasonId, programId }: any = req.query;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { press_no: { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    if (!ginnerId) {
      return res.sendError(res, "Ginner Id is required");
    }
    if (!programId) {
      return res.sendError(res, "Programme Id is required");
    }
    if (ginnerId) {
      whereCondition.ginner_id = ginnerId;
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

    // let result = await GinProcess.findAll({
    //   where: whereCondition,
    //   include: include,
    //   order: [["id", "DESC"]],
    // });
    // const id_array = result.map((item: any) => item.id);
    // const bales_list = [];
    // for await (const id of id_array) {
    //   const lot_details = await GinBale.findAll({
    //     attributes: [
    //       [
    //         sequelize.fn(
    //           "SUM",
    //           Sequelize.literal(
    //             'CAST("gin-bales"."weight" AS DOUBLE PRECISION)'
    //           )
    //         ),
    //         "weight",
    //       ],
    //       // Add other attributes here...
    //     ],
    //     where: {
    //       sold_status: false,
    //     },
    //     include: [
    //       {
    //         model: GinProcess,
    //         as: "ginprocess",
    //         attributes: ["id", "lot_no", "date", "press_no", "reel_lot_no"],
    //         where: { id: id },
    //       },
    //     ],
    //     group: ["ginprocess.id", "ginprocess.lot_no"],
    //   });
    //   if (lot_details.length > 0) {
    //     const bales = await GinBale.findAll({
    //       where: {
    //         process_id: id,
    //         sold_status: false,
    //       },
    //     });

    //     if (bales.length > 0) {
    //       lot_details[0].dataValues.bales = bales;
    //       bales_list.push(lot_details[0]);
    //     }
    //   }
    // }

    const [results, metadata] = await sequelize.query(
      `SELECT 
          jsonb_build_object(
              'ginprocess', jsonb_build_object(
                  'id', gp.id,
                  'lot_no', gp.lot_no,
                  'date', gp.date,
                  'press_no', gp.press_no,
                  'reel_lot_no', gp.reel_lot_no,
                  'greyout_status', gp.greyout_status
              ),
              'weight', SUM(CAST(gb.weight AS DOUBLE PRECISION)),
              'bales', jsonb_agg(jsonb_build_object(
                  'id', gb.id,
                  'bale_no', gb.bale_no,
                  'weight', gb.weight,
                  'is_all_rejected', gb.is_all_rejected,
                  'greyout_status', gp.greyout_status
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
          gp.ginner_id = ${ginnerId}
          AND gp.program_id IN (${programId})
          AND gb.sold_status = false
      GROUP BY 
          gp.id, gp.lot_no, gp.date, gp.press_no, gp.reel_lot_no
      ORDER BY 
          gp.id DESC;
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
    let whereCondition: any = {
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
      where: whereCondition,
      // group: ["transactions.village_id, transactions.id"],
      order: [
        ["id", "DESC"],
        [Sequelize.col("accept_date"), "DESC"],
      ],
    });
    const summedData: any = {};

    results.forEach((result: any) => {
      const villageId = result.dataValues.village_id;
      // if (summedData[villageId]) {
      //   summedData[villageId].qty_stock += result.dataValues.qty_stock;
      //   summedData[villageId].qty_used += result.dataValues.qty_used;
      //   summedData[villageId].estimated_qty += result.dataValues.estimated_qty;
      // } else {
      //   summedData[villageId] = {
      //     qty_stock: result.dataValues.qty_stock,
      //     qty_used: result.dataValues.qty_used,
      //     estimated_qty: result.dataValues.estimated_qty,
      //     vlg_id: villageId,
      //     village: result.village,
      //     program: result.program,
      //     season: result.season,
      //   };
      // }
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
      let baleData = {
        sales_id: ginSales.id,
        bale_id: bale,
      };
      const bales = await BaleSelection.create(baleData);
      const ginbaleSatus = await GinBale.update(
        { sold_status: true },
        { where: { id: bale } }
      );
    }
    res.sendSuccess(res, { ginSales });
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.meessage);
  }
};

//update Ginner Sale
// const updateGinnerSales = async (req: Request, res: Response) => {
//   try {
//     const data: any = {
//       status: "Pending for QR scanning",
//       weight_loss: req.body.weightLoss,
//       sale_value: req.body.saleValue,
//       invoice_no: req.body.invoiceNo,
//       tc_file: req.body.tcFile,
//       contract_file: req.body.contractFile,
//       invoice_file: req.body.invoiceFile,
//       delivery_notes: req.body.deliveryNotes,
//       transporter_name: req.body.transporterName,
//       vehicle_no: req.body.vehicleNo,
//       lrbl_no: req.body.lrblNo,
//       letter_of_credit: req.body.letterOfCredit,
//       logistics_documents: req.body.logisticsDocuments,
//     };

//     if (req.body.weightLoss) {
//       for await (let obj of req.body.lossData) {
//         let bale = await GinBale.findOne({
//           where: {
//             "$ginprocess.reel_lot_no$": String(obj.reelLotNo),
//             bale_no: String(obj.baleNo),
//           },
//           include: [{ model: GinProcess, as: "ginprocess" }],
//         });
//         if (bale) {
//           await GinBale.update(
//             {
//               old_weight: Sequelize.literal('weight'),
//               weight: obj.newWeight
//             },
//             { where: { id: bale.dataValues.id } }
//           );
//         }
//       }

//       let [newSum] = await sequelize.query(`
//         SELECT COALESCE(
//             SUM(CAST(gb.weight AS DOUBLE PRECISION)), 0) AS lint_quantity 
// 			  FROM "gin-bales" gb
//         LEFT JOIN bale_selections bs ON gb.id = bs.bale_id
//         LEFT JOIN gin_sales gs ON bs.sales_id = gs.id
//         WHERE bs.sales_id = ${req.body.id}`);

//         if(newSum && newSum[0]){
//           let newQuantity = newSum[0]?.lint_quantity;
//           data.total_qty = newQuantity;
//         }
//     }

//         const ginSales = await GinSales.update(data, {
//       where: { id: req.body.id },
//     });

//     if (ginSales && ginSales[0] === 1) {
//       await send_gin_mail(req.body.id);
//     }
//     res.sendSuccess(res, { ginSales });
//   } catch (error: any) {
//     console.error(error);
//     return res.sendError(res, error.meessage);
//   }
// };

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
  try {
    const res1 = await GinBale.update(
      { sold_status: false },
      {
        where: {
          id: {
            [Op.in]: sequelize.literal(
              `(SELECT bale_id FROM bale_selections WHERE sales_id = ${req.body.id})`
            ),
          },
        },
      }
    );

    const res2 = await BaleSelection.destroy({
      where: {
        sales_id: req.body.id,
      },
    });

    const res3 = await GinSales.destroy({
      where: {
        id: req.body.id,
      },
    });
    return res.sendSuccess(res, {
      message: "Successfully deleted this process",
    });
  } catch (error: any) {
    console.error(error);
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
          as: "bale" ,
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
              attributes: ["date","lot_no", "reel_lot_no"],
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
              attributes: ["date","lot_no", "reel_lot_no"],
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
  _getGinnerProcessTracingChartData
};
