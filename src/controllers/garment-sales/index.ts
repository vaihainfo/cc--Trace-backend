import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import GarmentSales from "../../models/garment-sales.model";
import * as ExcelJS from "exceljs";
import * as fs from "fs";
import * as path from "path";
import Brand from "../../models/brand.model";
import sequelize from "../../util/dbConn";
import WeaverSales from "../../models/weaver-sales.model";
import KnitSales from "../../models/knit-sales.model";
import Program from "../../models/program.model";
import FabricType from "../../models/fabric-type.model";
import Weaver from "../../models/weaver.model";
import Knitter from "../../models/knitter.model";
import Garment from "../../models/garment.model";
import { generateOnlyQrCode } from "../../provider/qrcode";
import Embroidering from "../../models/embroidering.model";
import Season from "../../models/season.model";
import Department from "../../models/department.model";
import FabricSelection from "../../models/fabric-selections.model";
import DyingSales from "../../models/dying-sales.model";
import Fabric from "../../models/fabric.model";
import WashingSales from "../../models/washing-sales.model";
import PrintingSales from "../../models/printing-sales.model";
import CompactingSales from "../../models/compacting-sales.model";
import GarmentProcess from "../../models/garment-process..model";
import GarmentSelection from "../../models/garment-selection.model";
import WeaverProcess from "../../models/weaver-process.model";
import WeaverFabricSelection from "../../models/weaver-fabric-selection.model";
import KnitProcess from "../../models/knit-process.model";
import KnitFabricSelection from "../../models/knit-fabric-selectiion.model";
import ProcessorList from "../../models/processor-list.model";
import { send_garment_mail } from "../send-emails";
import GarmentFabricType from "../../models/garment_fabric_type.model";
import moment from "moment";
import Transaction from "../../models/transaction.model";
import LintSelections from "../../models/lint-seletions.model";
import SpinProcessYarnSelection from "../../models/spin-process-yarn-seletions.model";
import YarnCount from "../../models/yarn-count.model";
import Spinner from "../../models/spinner.model";
import SpinSales from "../../models/spin-sales.model";
import YarnSelection from "../../models/yarn-seletions.model";
import KnitYarnSelection from "../../models/knit-yarn-seletions.model";
import Village from "../../models/village.model";
import State from "../../models/state.model";
import Farmer from "../../models/farmer.model";
import FarmGroup from "../../models/farm-group.model";
import Ginner from "../../models/ginner.model";
import GinSales from "../../models/gin-sales.model";
import BaleSelection from "../../models/bale-selection.model";
import GinBale from "../../models/gin-bale.model";
import CottonSelection from "../../models/cotton-selection.model";
import Country from "../../models/country.model";
import District from "../../models/district.model";
import WeaverFabric from "../../models/weaver_fabric.model";
import KnitFabric from "../../models/knit_fabric.model";
import SpinProcess from "../../models/spin-process.model";
import CottonMix from "../../models/cotton-mix.model";
import { _getFabricProcessTracingChartData } from '../fabric/index';
import { formatDataForGarment } from '../../util/tracing-chart-data-formatter';

const fetchBrandQrGarmentSalesPagination = async (
  req: Request,
  res: Response
) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { brandId } = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (!brandId) {
      return res.sendError(res, "Please send a brand Id");
    }
    if (searchTerm) {
      whereCondition[Op.or] = [
        { invoice_no: { [Op.iLike]: `%${searchTerm}%` } }, // Search by device id
        { garment_type: { [Op.iLike]: `%${searchTerm}%` } }, // Search by staff name
        { style_mark_no: { [Op.iLike]: `%${searchTerm}%` } }, // Search by user name
        { no_of_pieces: { [Op.iLike]: `%${searchTerm}%` } }, // Search by user name
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } }, // Search by user name
      ];
    }
    whereCondition.buyer_type = "Garment";
    whereCondition.buyer_id = brandId;

    //fetch data with pagination
    if (req.query.pagination === "true") {
      const { count, rows } = await GarmentSales.findAndCountAll({
        where: whereCondition,
        offset: offset,
        limit: limit,
      });
      return res.sendPaginationSuccess(res, rows, count);
    } else {
      const data = await GarmentSales.findAll({
        where: whereCondition,
      });
      return res.sendSuccess(res, data);
    }
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

const exportBrandQrGarmentSales = async (req: Request, res: Response) => {
  const excelFilePath = path.join("./upload", "barcode-report.xlsx");

  try {
    const { brandId } = req.query;
    if (!brandId) {
      return res.sendError(res, "Please send a brand ID");
    }
    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    worksheet.mergeCells("A1:H1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Barcode Report";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };

    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.",
      "QR Code",
      "Brand Name",
      "Invoice No",
      "Garment Type",
      "Style/Mark No",
      "Total No. of pieces",
      "Program",
    ]);
    headerRow.font = { bold: true };

    //fetch data with pagination
    const data = await GarmentSales.findAll({
      where: {
        buyer_type: "Garment",
        buyer_id: brandId,
      },
    });
    // Append data to worksheet
    for await (const [index, item] of data.entries()) {
      let brand = await Brand.findOne({ where: { id: brandId } });
      const rowValues = Object.values({
        index: index + 1,
        qrCode: item.qrUrl ? process.env.BASE_URL + item.qrUrl : "",
        brandName: brand ? brand.brand_name : "",
        invoiceNo: item.invoice_no ? item.invoice_no : "",
        grarmentType: item.garment_type ? item.garment_type : "",
        style_mark_no: item.style_mark_no ? item.style_mark_no : "",
        totalPiece: item.no_of_pieces ? item.no_of_pieces : "",
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
      column.width = Math.min(14, maxCellLength + 2); // Limit width to 14 characters
    });

    // Save the workbook
    await workbook.xlsx.writeFile(excelFilePath);
    res.status(200).send({
      success: true,
      messgage: "File successfully Generated",
      data: process.env.BASE_URL + "barcode-report.xlsx",
    });
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

const fetchTransactions = async (req: Request, res: Response) => {
  try {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let {
      garmentId,
      fabricType,
      programId,
      garmentOrderRef,
      brandOrderRef,
      invoiceNo,
      lotNo,
      weaverId,
      knitterId,
      fabricId,
    }: any = req.query;

    const knitterWhere: any = {};
    const weaverWhere: any = {};
    const searchCondition: any = {};
    const fabricWhere: any = {};
    const dyingWhere: any = {};
    const printWhere: any = {};
    const washWhere: any = {};
    const compactWhere: any = {};
    let whereCondition: any = {};

    if (searchTerm) {
      searchCondition[Op.or] = [
        // Search by order ref
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { garment_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { brand_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { vehicle_no: { [Op.iLike]: `%${searchTerm}%` } },
        { transaction_agent: { [Op.iLike]: `%${searchTerm}%` } },
        { transporter_name: { [Op.iLike]: `%${searchTerm}%` } },
        { bill_of_ladding: { [Op.iLike]: `%${searchTerm}%` } },
        { processor_name: { [Op.iLike]: `%${searchTerm}%` } },
        { processor_address: { [Op.iLike]: `%${searchTerm}%` } },
      ];

      weaverWhere[Op.or] = [
        ...searchCondition[Op.or],
        { "$weaver.name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];

      knitterWhere[Op.or] = [
        ...searchCondition[Op.or],
        { "$knitter.name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];

      dyingWhere[Op.or] = [
        ...searchCondition[Op.or],
        { "$dying_fabric.name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];

      printWhere[Op.or] = [
        ...searchCondition[Op.or],
        { "$printing.name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];

      washWhere[Op.or] = [
        ...searchCondition[Op.or],
        { "$washing.name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];

      compactWhere[Op.or] = [
        ...searchCondition[Op.or],
        { "$compacting.name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }

    if (!garmentId) {
      return res.sendError(res, "Need Garment Id");
    }

    if (fabricType) {
      const idArray: number[] = fabricType
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.fabric_type = { [Op.overlap]: idArray };
    }
    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.program_id = { [Op.in]: idArray };
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
    if (knitterId || weaverId || fabricId) {
      addFilterCondition(knitterWhere, "knitter_id", knitterId);
      addFilterCondition(weaverWhere, "weaver_id", weaverId);
      addFilterCondition(washWhere, "washing_id", fabricId);
      addFilterCondition(compactWhere, "compacting_id", fabricId);
      addFilterCondition(printWhere, "printing_id", fabricId);
      addFilterCondition(dyingWhere, "dying_id", fabricId);
    }

    if (garmentOrderRef) {
      const idArray: any[] = garmentOrderRef.split(",").map((id: any) => id);
      whereCondition.garment_order_ref = { [Op.in]: idArray };
    }
    if (brandOrderRef) {
      const idArray: any[] = brandOrderRef.split(",").map((id: any) => id);
      whereCondition.brand_order_ref = { [Op.in]: idArray };
    }
    if (invoiceNo) {
      const idArray: any[] = invoiceNo.split(",").map((id: any) => id);
      whereCondition.invoice_no = { [Op.in]: idArray };
    }
    if (lotNo) {
      const idArray: any[] = lotNo.split(",").map((id: any) => id);
      whereCondition.batch_lot_no = { [Op.in]: idArray };
    }
    let include = [
      {
        model: Program,
        as: "program",
      },
      {
        model: Season,
        as: "season",
        attributes: ["id", "name"],
      },
    ];

    let result: any = await Promise.all([
      WeaverSales.findAll({
        where: {
          status: "Sold",
          buyer_id: garmentId,
          ...whereCondition,
          ...weaverWhere,
        },
        include: [
          ...include,
          { model: Weaver, as: "weaver", attributes: ["id", "name"] },
        ],
      }),
      KnitSales.findAll({
        where: {
          status: "Sold",
          buyer_id: garmentId,
          ...whereCondition,
          ...knitterWhere,
        },
        include: [
          ...include,
          { model: Knitter, as: "knitter", attributes: ["id", "name"] },
        ],
      }),
      DyingSales.findAll({
        where: {
          status: "Sold",
          buyer_id: garmentId,
          ...whereCondition,
          ...dyingWhere,
        },
        include: [
          ...include,
          { model: Fabric, as: "dying_fabric", attributes: ["id", "name"] },
        ],
      }),
      WashingSales.findAll({
        where: {
          status: "Sold",
          buyer_id: garmentId,
          ...whereCondition,
          ...washWhere,
        },
        include: [
          ...include,
          { model: Fabric, as: "washing", attributes: ["id", "name"] },
        ],
      }),
      PrintingSales.findAll({
        where: {
          status: "Sold",
          buyer_id: garmentId,
          ...whereCondition,
          ...printWhere,
        },
        include: [
          ...include,
          { model: Fabric, as: "printing", attributes: ["id", "name"] },
        ],
      }),
      CompactingSales.findAll({
        where: {
          status: "Sold",
          buyer_id: garmentId,
          ...whereCondition,
          ...compactWhere,
        },
        include: [
          ...include,
          { model: Fabric, as: "compacting", attributes: ["id", "name"] },
        ],
      }),
    ]);

    let abc = result.flat();

    // Apply pagination to the combined result
    let data = abc.slice(offset, offset + limit);
    return res.sendPaginationSuccess(res, data, abc?.length);
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

const fetchTransactionsAll = async (req: Request, res: Response) => {
  try {
    let {
      garmentId,
      weaverId,
      programId,
      lotNo,
      garmentOrderRef,
      brandOrderRef,
      invoiceNo,
      fabricType,
      knitterId,
      fabricId,
    }: any = req.query;
    if (!garmentId) {
      return res.sendError(res, "Need Garment Id");
    }
    const knitterWhere: any = {};
    const weaverWhere: any = {};
    const dyingWhere: any = {};
    const printWhere: any = {};
    const washWhere: any = {};
    const compactWhere: any = {};
    let whereCondition: any = {};

    if (fabricType) {
      const idArray: number[] = fabricType
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.fabric_type = { [Op.overlap]: idArray };
    }
    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.program_id = { [Op.in]: idArray };
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
    if (knitterId || weaverId || fabricId) {
      addFilterCondition(knitterWhere, "knitter_id", knitterId);
      addFilterCondition(weaverWhere, "weaver_id", weaverId);
      addFilterCondition(washWhere, "washing_id", fabricId);
      addFilterCondition(compactWhere, "compacting_id", fabricId);
      addFilterCondition(printWhere, "printing_id", fabricId);
      addFilterCondition(dyingWhere, "dying_id", fabricId);
    }

    if (garmentOrderRef) {
      const idArray: any[] = garmentOrderRef.split(",").map((id: any) => id);
      whereCondition.garment_order_ref = { [Op.in]: idArray };
    }
    if (brandOrderRef) {
      const idArray: any[] = brandOrderRef.split(",").map((id: any) => id);
      whereCondition.brand_order_ref = { [Op.in]: idArray };
    }
    if (invoiceNo) {
      const idArray: any[] = invoiceNo.split(",").map((id: any) => id);
      whereCondition.invoice_no = { [Op.in]: idArray };
    }
    if (lotNo) {
      const idArray: any[] = lotNo.split(",").map((id: any) => id);
      whereCondition.batch_lot_no = { [Op.in]: idArray };
    }
    let include = [
      {
        model: Program,
        as: "program",
      },
      {
        model: Season,
        as: "season",
        attributes: ["id", "name"],
      },
    ];
    let result: any = await Promise.all([
      WeaverSales.findAll({
        where: {
          status: { [Op.in]: ['Pending', "Pending for QR scanning"] },
          buyer_id: garmentId,
          ...whereCondition,
          ...weaverWhere,
        },
        include: [
          ...include,
          { model: Weaver, as: "weaver", attributes: ["id", "name"] },
        ],
      }),
      KnitSales.findAll({
        where: {
          status: { [Op.in]: ['Pending', "Pending for QR scanning"] },
          buyer_id: garmentId,
          ...whereCondition,
          ...knitterWhere,
        },
        include: [
          ...include,
          { model: Knitter, as: "knitter", attributes: ["id", "name"] },
        ],
      }),
      DyingSales.findAll({
        where: {
          status: "Pending",
          buyer_id: garmentId,
          ...whereCondition,
          ...dyingWhere,
        },
        include: [
          ...include,
          { model: Fabric, as: "dying_fabric", attributes: ["id", "name"] },
        ],
      }),
      WashingSales.findAll({
        where: {
          status: "Pending",
          buyer_id: garmentId,
          ...whereCondition,
          ...washWhere,
        },
        include: [
          ...include,
          { model: Fabric, as: "washing", attributes: ["id", "name"] },
        ],
      }),
      PrintingSales.findAll({
        where: {
          status: "Pending",
          buyer_id: garmentId,
          ...whereCondition,
          ...printWhere,
        },
        include: [
          ...include,
          { model: Fabric, as: "printing", attributes: ["id", "name"] },
        ],
      }),
      CompactingSales.findAll({
        where: {
          status: "Pending",
          buyer_id: garmentId,
          ...whereCondition,
          ...compactWhere,
        },
        include: [
          ...include,
          { model: Fabric, as: "compacting", attributes: ["id", "name"] },
        ],
      }),
    ]);
    let abc = result.flat();
    return res.sendSuccess(res, abc);
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
        accept_date: obj.status === "Sold" ? new Date().toISOString() : null,
      };
      if (obj.type === "Knitter") {
        const transaction = await KnitSales.update(data, {
          where: {
            id: obj.id,
          },
        });
        trans.push(transaction);
      } else if (obj.type === "Weaver") {
        const transaction = await WeaverSales.update(data, {
          where: {
            id: obj.id,
          },
        });
        trans.push(transaction);
      } else if (obj.type === "Dying") {
        const transaction = await DyingSales.update(data, {
          where: {
            id: obj.id,
          },
        });
        trans.push(transaction);
      } else if (obj.type === "Printing") {
        const transaction = await PrintingSales.update(data, {
          where: {
            id: obj.id,
          },
        });
        trans.push(transaction);
      } else if (obj.type === "Washing") {
        const transaction = await WashingSales.update(data, {
          where: {
            id: obj.id,
          },
        });
        trans.push(transaction);
      } else if (obj.type === "Compacting") {
        const transaction = await CompactingSales.update(data, {
          where: {
            id: obj.id,
          },
        });
        trans.push(transaction);
      }
    }

    res.sendSuccess(res, trans);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

const getProgram = async (req: Request, res: Response) => {
  try {
    if (!req.query.garmentId) {
      return res.sendError(res, "Need Garment Id");
    }

    let garmentId = req.query.garmentId;
    let result = await Garment.findOne({ where: { id: garmentId } });
    if (!result) {
      return res.sendError(res, "Garment not found");
    }
    let data = await Program.findAll({
      where: {
        id: result.program_id,
      },
    });
    res.sendSuccess(res, data);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

//create Garment Process
const createGarmentProcess = async (req: Request, res: Response) => {
  try {
    let embroidering;
    if (req.body.embroideringRequired) {
      embroidering = await Embroidering.create({
        processor_name: req.body.processorName,
        address: req.body.address,
        process_name: req.body.processName,
        no_of_pieces: req.body.embNoOfPieces,
        process_loss: req.body.processLoss,
        final_no_of_pieces: req.body.finalNoOfPieces,
      });
    }

    const data = {
      garment_id: req.body.garmentId,
      program_id: req.body.programId,
      season_id: req.body.seasonId,
      date: req.body.date,
      fabric_order_ref: req.body.fabricOrderRef,
      brand_order_ref: req.body.brandOrderRef,
      department_id: req.body.departmentId,
      fabric_weight: req.body.fabricWeight,
      additional_fabric_weight: req.body.additionalFabricWeight,
      total_fabric_weight: req.body.totalFabricWeight,
      fabric_length: req.body.fabricLength,
      additional_fabric_length: req.body.additionalFabricLength,
      total_fabric_length: req.body.totalFabricLength,
      factory_lot_no: req.body.factoryLotNo,
      reel_lot_no: req.body.reelLotNo,
      total_waste_perct: req.body.wastePercentage,
      waste_weight: req.body.wasteWeight,
      waste_length: req.body.wasteLength,
      waste_fabric_sold_to: req.body.wasteFabricSoldTo,
      waste_fabric_invoice: req.body.wasteFabricInvoice,
      garment_type: req.body.garmentType,
      style_mark_no: req.body.styleMarkNo,
      garment_size: req.body.garmentSize,
      color: req.body.color,
      no_of_pieces: req.body.noOfPieces,
      no_of_boxes: req.body.noOfBoxes,
      finished_garment_image: req.body.finishedGarmentImage,
      // qty_stock: req.body.totalFabricLength,
      // total_qty: req.body.totalFabricLength,
      qty_stock_weight: req.body.totalFabricWeight,
      qty_stock_length: req.body.totalFabricLength,
      embroidering_required: req.body.embroideringRequired,
      embroidering_id: embroidering ? embroidering.id : null,
      physical_traceablity: req.body.physicalTraceabilty,
      status: "Pending",
    };
    const garmentProcess = await GarmentProcess.create(data);
    let uniqueFilename = `garment_process_qrcode_${Date.now()}.png`;
    let aa = await generateOnlyQrCode(
      `${process.env.ADMIN_URL}/brand/qr-details/garmentprocess/${garmentProcess.id}`,
      uniqueFilename
    );
    const gin = await GarmentProcess.update(
      { qr: uniqueFilename },
      {
        where: {
          id: garmentProcess.id,
        },
      }
    );
    for await (let fabric of req.body.garmentfabrics) {
      let data = {
        process_id: garmentProcess.id,
        garment_type: fabric.garmentType,
        style_mark_no: fabric.styleMarkNo,
        garment_size: fabric.garmentSize,
        color: fabric.color,
        no_of_pieces: fabric.noOfPieces,
        no_of_boxes: fabric.noOfBoxes,
        finished_garment_image: fabric.finishedGarmentImage,
        sold_status: false,
      };
      const garmentFabric = await GarmentFabricType.create(data);
    }
    if (req.body.chooseFabric && req.body.chooseFabric.length > 0) {
      for await (let obj of req.body.chooseFabric) {
        if (obj.processor === "knitter") {
          let update = await KnitSales.update(
            { qty_stock: obj.totalQty - obj.qtyUsed },
            { where: { id: obj.id } }
          );
        } else if (obj.processor === "weaver") {
          let update = await WeaverSales.update(
            { qty_stock: obj.totalQty - obj.qtyUsed },
            { where: { id: obj.id } }
          );
        } else if (obj.processor === "dying") {
          let update = await DyingSales.update(
            { qty_stock: obj.totalQty - obj.qtyUsed },
            { where: { id: obj.id } }
          );
        } else if (obj.processor === "washing") {
          let update = await WashingSales.update(
            { qty_stock: obj.totalQty - obj.qtyUsed },
            { where: { id: obj.id } }
          );
        } else if (obj.processor === "printing") {
          let update = await PrintingSales.update(
            { qty_stock: obj.totalQty - obj.qtyUsed },
            { where: { id: obj.id } }
          );
        } else {
          let update = await CompactingSales.update(
            { qty_stock: obj.totalQty - obj.qtyUsed },
            { where: { id: obj.id } }
          );
        }
        await FabricSelection.create({
          fabric_id: obj.id,
          processor: obj.processor,
          sales_id: garmentProcess.id,
          qty_used: obj.qtyUsed,
        });
      }
    }

    res.sendSuccess(res, garmentProcess);
  } catch (error: any) {
    console.log(error.message);
    return res.sendError(res, error.meessage);
  }
};

//create Garment Process
const updateGarmentProcess = async (req: Request, res: Response) => {
  try {
    if (!req.body.id) {
      return res.sendError(res, "need process id");
    }
    const data = {
      date: req.body.date,
      fabric_order_ref: req.body.fabricOrderRef,
      brand_order_ref: req.body.brandOrderRef,
      garment_type: req.body.garmentType,
      style_mark_no: req.body.styleMarkNo,
      garment_size: req.body.garmentSize,
      color: req.body.color,
      no_of_pieces: req.body.noOfPieces,
      no_of_boxes: req.body.noOfBoxes,
      finished_garment_image: req.body.finishedGarmentImage,
    };
    const garmentProcess = await GarmentProcess.update(data, { where: { id: req.body.id } });
    const destroy = await GarmentFabricType.destroy({ where: { process_id: req.body.id } });
    for await (let fabric of req.body.garmentfabrics) {
      let data = {
        process_id: req.body.id,
        garment_type: fabric.garmentType,
        style_mark_no: fabric.styleMarkNo,
        garment_size: fabric.garmentSize,
        color: fabric.color,
        no_of_pieces: fabric.noOfPieces,
        no_of_boxes: fabric.noOfBoxes,
        finished_garment_image: fabric.finishedGarmentImage,
        sold_status: false
      };
      const garmentFabric = await GarmentFabricType.create(data);
    }

    res.sendSuccess(res, garmentProcess);
  } catch (error: any) {
    console.log(error.message);
    return res.sendError(res, error.meessage);
  }
};

//fetch Garment Sales with filters
const fetchGarmentProcessPagination = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { garmentId, seasonId, programId, brandId }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { fabric_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { brand_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { factory_lot_no: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$department.dept_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        // { style_mark_no: {
        //   [Op.contains]: [{ [Op.iLike]: `%${searchTerm}%` }],
        // }, },
        // { garment_type:  {
        //   [Op.overlap]: [sequelize.literal(`ARRAY['${searchTerm}'i]::citext[]`)],
        // } },
        //   { garment_size:  {
        //     [Op.contains]: [{ [Op.iLike]: `%${searchTerm}%` }],
        //   } },
        //   { color: {
        //     [Op.contains]: [{ [Op.iLike]: `%${searchTerm}%` }],
        //   } },
      ];
    }

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
    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.program_id = { [Op.in]: idArray };
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
        model: Embroidering,
        as: "embroidering",
      },
      {
        model: Department,
        as: "department",
      },
      {
        model: Program,
        as: "program",
      },
    ];
    //fetch data with pagination
    if (req.query.pagination === "true") {
      const { count, rows } = await GarmentProcess.findAndCountAll({
        where: whereCondition,
        include: include,
        order: [["id", "desc"]],
        offset: offset,
        limit: limit,
      });
      return res.sendPaginationSuccess(res, rows, count);
    } else {
      const gin = await GarmentProcess.findAll({
        where: whereCondition,
        include: include,
        order: [["id", "desc"]],
      });
      return res.sendSuccess(res, gin);
    }
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

//fetch knitter Process by id
const fetchGarmentProcess = async (req: Request, res: Response) => {
  const { id } = req.query;
  const whereCondition: any = {};
  try {
    if (!id) {
      return res.sendError(res, "need process id");
    }
    whereCondition.id = id;

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
        model: Embroidering,
        as: "embroidering",
      },
      {
        model: Department,
        as: "department",
      },
      {
        model: Program,
        as: "program",
      },
    ];
    //fetch data with id
    let rows = await GarmentProcess.findOne({
      where: whereCondition,
      include: include
    });

    return res.sendSuccess(res, rows);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};


const exportGarmentProcess = async (req: Request, res: Response) => {
  const excelFilePath = path.join("./upload", "garment-process.xlsx");

  try {
    const whereCondition: any = {};
    const searchTerm = req.query.search || "";
    if (searchTerm) {
      whereCondition[Op.or] = [
        { fabric_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { brand_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { factory_lot_no: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$department.dept_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    const { garmentId, seasonId, programId, brandId }: any = req.query;
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
    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.program_id = { [Op.in]: idArray };
    }
    whereCondition.garment_id = req.query.garmentId;
    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    worksheet.mergeCells("A1:L1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Process";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.",
      "Date",
      "Season",
      "Brand Order Reference",
      "Fabric Order Reference",
      "Factory Lot No",
      "Reel Lot No",
      "Style/Mark No",
      "Garment/Product Type",
      "Color",
      "Garment/Product Size",
      "No of Pieces",
      "No of Boxes",
      "Total Fabric Length Utilized(Mts)",
      "Total Fabric Weight Utilized(Kgs)",
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
        model: Embroidering,
        as: "embroidering",
      },
      {
        model: Department,
        as: "department",
      },
      {
        model: Program,
        as: "program",
      },
    ];
    const garment = await GarmentProcess.findAll({
      where: whereCondition,
      include: include,
    });
    // Append data to worksheet
    for await (const [index, item] of garment.entries()) {
      const rowValues = Object.values({
        index: index + 1,
        date: item.date ? item.date : "",
        season: item.season ? item.season.name : "",
        brandOrder: item.brand_order_ref ? item.brand_order_ref : "",
        fabricOrder: item.fabric_order_ref ? item.fabric_order_ref : "",
        factoryLotNo: item.factory_lot_no ? item.factory_lot_no : "",
        reelLotNo: item.reel_lot_no ? item.reel_lot_no : "",
        mark:
          item.style_mark_no && item.style_mark_no?.length > 0
            ? item.style_mark_no?.join(",")
            : "",
        garment:
          item.garment_type && item.garment_type?.length > 0
            ? item.garment_type?.join(",")
            : "",
        color:
          item.color && item.color?.length > 0 ? item.color?.join(",") : "",
        garmentSize:
          item.garment_size && item.garment_size?.length > 0
            ? item.garment_size?.join(",")
            : "",
        no_of_pieces:
          item.no_of_pieces && item.no_of_pieces?.length > 0
            ? item.no_of_pieces?.join(",")
            : "",
        no_of_boxes:
          item.no_of_boxes && item.no_of_boxes?.length > 0
            ? item.no_of_boxes?.join(",")
            : "",
        totalFabricLength: item.total_fabric_length
          ? item.total_fabric_length
          : "",
        totalFabricWeight: item.total_fabric_weight
          ? item.total_fabric_weight
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
      column.width = Math.min(24, maxCellLength + 2); // Limit width to 30 characters
    });

    // Save the workbook
    await workbook.xlsx.writeFile(excelFilePath);
    res.status(200).send({
      success: true,
      messgage: "File successfully Generated",
      data: process.env.BASE_URL + "garment-process.xlsx",
    });
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

const chooseFabricProcess = async (req: Request, res: Response) => {
  let {
    garmentId,
    fabricType,
    programId,
    seasonId,
    garmentOrderRef,
    brandOrderRef,
    invoiceNo,
    lotNo,
    weaverId,
    knitterId,
    washingId,
    dyingId,
    printingId,
    compactingId
  }: any = req.query;
  const knitterWhere: any = {};
  const weaverWhere: any = {};
  const dyingWhere: any = {};
  const printWhere: any = {};
  const washWhere: any = {};
  const compactWhere: any = {};
  let whereCondition: any = {};

  try {
    if (!garmentId) {
      return res.sendError(res, "Need Garment Id");
    }

    if (fabricType) {
      const idArray: number[] = fabricType
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.fabric_type = { [Op.overlap]: idArray };
    }
    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.program_id = { [Op.in]: idArray };
    }
    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.season_id = { [Op.in]: idArray };
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
    if (knitterId || weaverId || washingId || dyingId || printingId || compactingId) {
      addFilterCondition(knitterWhere, "knitter_id", knitterId);
      addFilterCondition(weaverWhere, "weaver_id", weaverId);
      addFilterCondition(washWhere, "washing_id", washingId);
      addFilterCondition(compactWhere, "compacting_id", compactingId);
      addFilterCondition(printWhere, "printing_id", printingId);
      addFilterCondition(dyingWhere, "dying_id", dyingId);
    }

    if (garmentOrderRef) {
      const idArray: any[] = garmentOrderRef.split(",").map((id: any) => id);
      whereCondition.garment_order_ref = { [Op.in]: idArray };
    }
    if (brandOrderRef) {
      const idArray: any[] = brandOrderRef.split(",").map((id: any) => id);
      whereCondition.brand_order_ref = { [Op.in]: idArray };
    }
    if (invoiceNo) {
      const idArray: any[] = invoiceNo.split(",").map((id: any) => id);
      whereCondition.invoice_no = { [Op.in]: idArray };
    }

    if (lotNo) {
      const filterValues: any[] = lotNo
        .split(",")
        .map((value: any) => value.trim());

      whereCondition[Op.or] = filterValues.map((value) => ({
        batch_lot_no: { [Op.iLike]: `%${value}%` },
      }));
    }

    let include = [
      {
        model: Program,
        as: "program",
      },
      {
        model: Season,
        as: "season",
        attributes: ["id", "name"],
      },
    ];

    let result: any = await Promise.all([
      WeaverSales.findAll({
        where: {
          status: "Sold",
          buyer_type: "Garment",
          buyer_id: garmentId,
          qty_stock: { [Op.gt]: 0 },
          ...whereCondition,
          ...weaverWhere,
        },
        include: [
          ...include,
          { model: Weaver, as: "weaver", attributes: ["id", "name"] },
        ],
      }),
      KnitSales.findAll({
        where: {
          status: "Sold",
          buyer_type: "Garment",
          buyer_id: garmentId,
          qty_stock: { [Op.gt]: 0 },
          ...whereCondition,
          ...knitterWhere,
        },
        include: [
          ...include,
          { model: Knitter, as: "knitter", attributes: ["id", "name"] },
        ],
      }),
      DyingSales.findAll({
        where: {
          status: "Sold",
          qty_stock: { [Op.gt]: 0 },
          buyer_id: garmentId,
          ...whereCondition,
          ...dyingWhere,
        },
        include: [
          ...include,
          { model: Fabric, as: "dying_fabric", attributes: ["id", "name"] },
        ],
      }),
      WashingSales.findAll({
        where: {
          status: "Sold",
          qty_stock: { [Op.gt]: 0 },
          buyer_id: garmentId,
          ...whereCondition,
          ...washWhere,
        },
        include: [
          ...include,
          { model: Fabric, as: "washing", attributes: ["id", "name"] },
        ],
      }),
      PrintingSales.findAll({
        where: {
          status: "Sold",
          qty_stock: { [Op.gt]: 0 },
          buyer_id: garmentId,
          ...whereCondition,
          ...printWhere,
        },
        include: [
          ...include,
          { model: Fabric, as: "printing", attributes: ["id", "name"] },
        ],
      }),
      CompactingSales.findAll({
        where: {
          status: "Sold",
          qty_stock: { [Op.gt]: 0 },
          buyer_id: garmentId,
          ...whereCondition,
          ...compactWhere,
        },
        include: [
          ...include,
          { model: Fabric, as: "compacting", attributes: ["id", "name"] },
        ],
      }),
    ]);

    let abc = result.flat();
    return res.sendSuccess(res, abc);
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

//create Garment Sale
const createGarmentSales = async (req: Request, res: Response) => {
  try {
    const data = {
      garment_id: req.body.garmentId,
      program_id: req.body.programId,
      season_id: req.body.seasonId,
      date: req.body.date,
      fabric_order_ref: req.body.fabricOrderRef,
      brand_order_ref: req.body.brandOrderRef,
      department_id: req.body.departmentId,
      buyer_type: req.body.buyerType,
      buyer_id: req.body.buyerId ? req.body.buyerId : null,
      trader_id: req.body.traderId ? req.body.traderId : null,
      processor_name: req.body.processorName,
      processor_address: req.body.processorAddress,
      fabric_length: req.body.totalFabricLength,
      total_fabric_length: req.body.totalFabricLength,
      fabric_weight: req.body.totalFabricWeight,
      total_fabric_weight: req.body.totalFabricWeight,
      total_no_of_pieces: req.body.totalNoOfPieces,
      total_no_of_boxes: req.body.totalNoOfBoxes,
      transaction_via_trader: req.body.transactionViaTrader,
      transaction_agent: req.body.transactionAgent,
      garment_type: req.body.garmentType,
      style_mark_no: req.body.styleMarkNo,
      shipment_address: req.body.shipmentAddress,
      invoice_no: req.body.invoiceNo,
      bill_of_ladding: req.body.billOfLadding,
      transportor_name: req.body.transportorName,
      contract_no: req.body.contractNo,
      vehicle_no: req.body.vehicleNo,
      tc_file: req.body.tcFiles,
      contract_file: req.body.contractFile,
      invoice_files: req.body.invoiceFiles,
      delivery_notes: req.body.deliveryNotes,
      // qty_stock: req.body.totalFabricLength,
      qty_stock_pieces: req.body.totalNoOfPieces,
      qty_stock_boxes: req.body.totalNoOfBoxes,
      qty_stock_length: req.body.totalFabricLength,
      qty_stock_weight: req.body.totalFabricWeight,
      color: req.body.color,
      garment_size: req.body.garmentSize,
      no_of_pieces: req.body.noOfPieces,
      no_of_boxes: req.body.noOfBoxes,
      status: "Pending",
    };
    const garmentSales = await GarmentSales.create(data);
    let uniqueFilename = `garment_sales_qrcode_${Date.now()}.png`;
    let aa = await generateOnlyQrCode(
      `${process.env.ADMIN_URL}/brand/qr-details/garment-sales?id=${garmentSales.id}`,
      uniqueFilename
    );
    const gin = await GarmentSales.update(
      { qr: uniqueFilename },
      {
        where: {
          id: garmentSales.id,
        },
      }
    );
    if (req.body.chooseGarment && req.body.chooseGarment.length > 0) {
      for await (let obj of req.body.chooseGarment) {
        let val = await GarmentProcess.findOne({
          where: { id: obj.process_id },
        });
        if (val) {
          let update = await GarmentProcess.update(
            {
              // qty_stock: val.dataValues.qty_stock - obj.qtyUsed,
              status: 'Sold'
            },
            { where: { id: obj.process_id } }
          );
          let updatee = await GarmentFabricType.update(
            { sold_status: true },
            { where: { id: obj.id } }
          );
          await GarmentSelection.create({
            garment_id: obj.process_id,
            processor: obj.processor,
            sales_id: garmentSales.id,
            garment_type_id: obj.id,
            qty_used: obj.qtyUsed,
          });
        }
      }
    }

    if (garmentSales) {
      await send_garment_mail(garmentSales.id);
    }

    res.sendSuccess(res, garmentSales);
  } catch (error: any) {
    console.log(error.message);
    return res.sendError(res, error.meessage);
  }
};


//update Garment Sale
const updateGarmentSales = async (req: Request, res: Response) => {
  try {
    if (!req.body.id) {
      return res.sendError(res, "need sales id");
    }
    const data = {
      date: req.body.date ? req.body.date : undefined,
      invoice_no: req.body.invoiceNo,
      vehicle_no: req.body.vehicleNo
    };
    const kniSale = await GarmentSales.update(
      data,
      {
        where: {
          id: req.body.id,
        },
      }
    );


    return res.sendSuccess(res, kniSale);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.meessage);
  }
};

//fetch Garment Sales with filters
const fetchGarmentSalesPagination = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { garmentId, seasonId, programId, brandId }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { fabric_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { brand_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
        // { style_mark_no: { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$buyer.brand_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { transaction_agent: { [Op.iLike]: `%${searchTerm}%` } },
        // { garment_type: { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }

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
    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.program_id = { [Op.in]: idArray };
    }
    if (brandId) {
      whereCondition.buyer_id = brandId;
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
    if (req.query.pagination === "true") {
      const { count, rows } = await GarmentSales.findAndCountAll({
        where: whereCondition,
        include: include,
        order: [["id", "desc"]],
        offset: offset,
        limit: limit,
      });

      let data = [];

      for await (let row of rows) {
        const department = await Department.findAll({
          where: {
            id: {
              [Op.in]: row.dataValues.department_id,
            },
          },
          attributes: ["id", "dept_name"],
        });
        data.push({
          ...row.dataValues,
          department,
        });
      }

      return res.sendPaginationSuccess(res, data, count);
    } else {
      const gin = await GarmentSales.findAll({
        where: whereCondition,
        include: include,
        order: [["id", "desc"]],
      });
      let data = [];

      for await (let row of gin) {
        const department = await Department.findAll({
          where: {
            id: {
              [Op.in]: row.dataValues.department_id,
            },
          },
          attributes: ["id", "dept_name"],
        });
        data.push({
          ...row.dataValues,
          department,
        });
      }

      return res.sendSuccess(res, data);
    }
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const fetchGarmentSale = async (req: Request, res: Response) => {
  const whereCondition: any = {};
  try {
    if (!req.query.id) {
      return res.sendError(res, "Need id");
    }
    whereCondition.id = req.query.id;
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

    const gin = await GarmentSales.findOne({
      where: whereCondition,
      include: include,
    });
    return res.sendSuccess(res, gin);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const chooseGarmentSales = async (req: Request, res: Response) => {
  const {
    garmentId,
    fabricOrderRef,
    programId,
    brandOrderRef,
    reelLotNo,
    factoryLotNo,
    garmentType,
  }: any = req.query;
  const whereCondition: any = {};

  try {
    if (garmentId) {
      const idArray: number[] = garmentId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.garment_id = { [Op.in]: idArray };
    }

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.program_id = { [Op.in]: idArray };
    }
    if (fabricOrderRef) {
      const idArray: any[] = fabricOrderRef.split(",").map((id: any) => id);
      whereCondition.fabric_order_ref = { [Op.in]: idArray };
    }
    if (brandOrderRef) {
      const idArray: any[] = brandOrderRef.split(",").map((id: any) => id);
      whereCondition.brand_order_ref = { [Op.in]: idArray };
    }
    if (factoryLotNo) {
      const idArray: any[] = factoryLotNo.split(",").map((id: any) => id);
      whereCondition.factory_lot_no = { [Op.in]: idArray };
    }
    if (reelLotNo) {
      const idArray: any[] = reelLotNo.split(",").map((id: any) => id);
      whereCondition.reel_lot_no = { [Op.in]: idArray };
    }
    if (garmentType) {
      const idArray: any[] = garmentType.split(",").map((id: any) => id);
      whereCondition.garment_type = { [Op.overlap]: idArray };
    }

    let include = [
      {
        model: Garment,
        as: "garment",
        attributes: ["id", "name", "address"],
      },
      {
        model: Department,
        as: "department",
      },
      {
        model: Program,
        as: "program",
        attributes: ["id", "program_name"],
      },
    ];

    const garmentProcess = await GarmentProcess.findAll({
      where: {
        ...whereCondition,
        [Op.or]: [
          { qty_stock_length: { [Op.gt]: 0 } },
          { qty_stock_weight: { [Op.gt]: 0 } },
          { qty_stock: { [Op.gt]: 0 } },
        ],
      },
      include: include,
    });

    let data = [];
    let qty: any;
    let da: any;
    for await (let row of garmentProcess) {
      let list = [];

      if (row) {
        qty = await GarmentFabricType.findOne({
          attributes: [
            [
              Sequelize.fn(
                "COALESCE",
                Sequelize.fn("SUM", Sequelize.col("no_of_pieces")),
                0
              ),
              "no_of_pieces",
            ],
            [
              Sequelize.fn(
                "COALESCE",
                Sequelize.fn("SUM", Sequelize.col("no_of_boxes")),
                0
              ),
              "no_of_boxes",
            ],
          ],
          where: { process_id: row.dataValues?.id },
          group: ["process_id"],
        });
        da = await GarmentFabricType.findOne({
          attributes: [
            [
              Sequelize.fn(
                "COALESCE",
                Sequelize.fn("SUM", Sequelize.col("no_of_pieces")),
                0
              ),
              "no_of_pieces",
            ],
          ],
          where: { process_id: row.dataValues?.id, sold_status: false },
          group: ["process_id"],
        });
        list = await GarmentFabricType.findAll({
          where: { process_id: row.dataValues?.id, sold_status: false },
        });
      }
      if (list.length > 0) {
        data.push({
          ...row.dataValues,
          garmentFabric: list,
          total_no_of_boxes: qty.dataValues?.no_of_boxes,
          total_no_of_pieces: qty.dataValues?.no_of_pieces,
          total_no_of_pieces_stock: da.dataValues?.no_of_pieces,
        });
      }
    }

    return res.sendSuccess(res, data);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const exportGarmentSale = async (req: Request, res: Response) => {
  const excelFilePath = path.join("./upload", "garment-sale.xlsx");

  try {
    const whereCondition: any = {};
    const searchTerm = req.query.search || "";
    if (searchTerm) {
      whereCondition[Op.or] = [
        { fabric_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { brand_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$buyer.brand_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { transaction_agent: { [Op.iLike]: `%${searchTerm}%` } },
        { shipment_address: { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    const { garmentId, seasonId, programId, brandId }: any = req.query;
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
    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.program_id = { [Op.in]: idArray };
    }
    whereCondition.garment_id = req.query.garmentId;
    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    worksheet.mergeCells("A1:L1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Process/Sale";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.",
      "Date",
      "Season",
      "Brand/Retailer Name",
      "Brand Order Reference",
      "Fabric Order Reference",
      "Invoice No",
      "Style/Mark No",
      "Garment/ Product Type",
      "Total No of pieces",
      "Total No of Boxes",
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
    const garment = await GarmentSales.findAll({
      where: whereCondition,
      include: include,
    });
    // Append data to worksheet
    for await (const [index, item] of garment.entries()) {
      const rowValues = Object.values({
        index: index + 1,
        date: item.date ? item.date : "",
        season: item.season ? item.season.name : "",
        buyer: item.buyer ? item.buyer.brand_name : item.processor_name,
        brandOrder: item.brand_order_ref ? item.brand_order_ref : "",
        fabricOrder: item.fabric_order_ref ? item.fabric_order_ref : "",
        invoice: item.invoice_no ? item.invoice_no : "",
        mark: item.style_mark_no ? item.style_mark_no?.join(",") : "",
        garment: item.garment_type ? item.garment_type?.join(",") : "",
        no_of_pieces: item.total_no_of_pieces ? item.total_no_of_pieces : "",
        no_of_boxes: item.total_no_of_boxes ? item.total_no_of_boxes : "",
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
      data: process.env.BASE_URL + "garment-sale.xlsx",
    });
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

const getEmbroidering = async (req: Request, res: Response) => {
  try {
    let data = await Embroidering.findOne({ where: { id: req.query.id } });
    return res.sendSuccess(res, data);
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

const dashboardGraph = async (req: Request, res: Response) => {
  try {
    if (!req.query.garmentId) {
      return res.sendError(res, "Need Garment Id");
    }
    let result = await Garment.findOne({ where: { id: req.query.garmentId } });
    let program = await Program.findAll({
      where: {
        id: result.program_id,
      },
      attributes: ["id", "program_name"],
    });
    let resulting: any = [];
    for await (let obj of program) {
      let data = await GarmentSales.findAll({
        where: {
          program_id: obj.id,
          garment_id: req.query.garmentId,
        },
        attributes: [
          ["garment_type", "garmentType"],
          [Sequelize.fn("SUM", Sequelize.col("total_fabric_length")), "total"],
        ],
        group: ["garment_type"],
      });
      let knit = await KnitSales.findOne({
        attributes: [
          [
            Sequelize.fn("SUM", Sequelize.col("fabric_weight")),
            "totalQuantity",
          ],
          [
            Sequelize.fn("SUM", Sequelize.col("qty_stock")),
            "totalQuantityStock",
          ],
        ],
        where: {
          buyer_id: req.query.garmentId,
          program_id: obj.id,
          status: "Sold",
        },
        group: ["program_id"],
        raw: true,
      });
      let weaver = await WeaverSales.findOne({
        attributes: [
          [
            Sequelize.fn("SUM", Sequelize.col("fabric_weight")),
            "totalQuantity",
          ],
          [
            Sequelize.fn("SUM", Sequelize.col("qty_stock")),
            "totalQuantityStock",
          ],
        ],
        where: {
          buyer_id: req.query.garmentId,
          program_id: obj.id,
          status: "Sold",
        },
        group: ["program_id"],
        raw: true,
      });
      let totalQuantity =
        (knit.totalQuantity ?? 0) + (weaver.totalQuantity ?? 0);
      let totalQuantityStock =
        (knit.totalQuantityStock ?? 0) + weaver.totalQuantityStock;
      resulting.push({
        program: obj,
        graphData: data,
        fabric: { totalQuantity, totalQuantityStock },
      });
    }

    return res.sendSuccess(res, resulting);
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

const getGarmentReelLotNo = async (req: Request, res: Response) => {
  const { garmentId } = req.query;
  const whereCondition: any = {};
  try {
    if (!garmentId) {
      return res.sendError(res, "need Garment id");
    }
    whereCondition.id = garmentId;

    const rows = await Garment.findOne({
      where: whereCondition,
      attributes: ["id", "name", "short_name"],
      include: [{
        model :Country,
        as : 'country',
        attributes :['id','county_name']
      }]
    });

    let count = await GarmentProcess.count({
      include: [
        {
          model: Program,
          as: "program",
          where: { program_name: { [Op.iLike]: "Reel" } },
        },
      ],
      where: {
        garment_id: garmentId,
      },
    });

    let prcs_date = new Date().toLocaleDateString().replace(/\//g, "");
    let number = count + 1;
    let prcs_name = rows ? rows?.name.substring(0, 3).toUpperCase() : "";
    let country = rows ? rows?.country?.county_name.substring(0, 2).toUpperCase() : "";
    let reelLotNo = "REEL-GAR-" + prcs_name  + "-" + country + "-" + prcs_date + number;

    return res.sendSuccess(res, { reelLotNo });
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const getprocessName = async (req: Request, res: Response) => {
  const { garmentId, status, filter, programId, spinnerId }: any = req.query;
  const whereCondition: any = {};
  const fabricWhere: any = {};
  try {
    if (!garmentId) {
      return res.sendError(res, "Need garment Id ");
    }
    if (!status) {
      return res.sendError(res, "Need  status");
    }

    if (status === "Pending") {
      whereCondition.buyer_id = garmentId;
      whereCondition.status = {
        [Op.in]: ["Pending", "Pending for QR scanning"],
      };
      fabricWhere.buyer_id = garmentId;
      fabricWhere.status = "Pending";
    }
    if (status === "Sold") {
      whereCondition.buyer_id = garmentId;
      whereCondition.status = "Sold";
      fabricWhere.buyer_id = garmentId;
      fabricWhere.status = "Sold";
    }

    const response: any = await Promise.all([
      WeaverSales.findAll({
        attributes: ["weaver_id", "weaver.name"],
        where: whereCondition,
        include: [
          {
            model: Weaver,
            as: "weaver",
            attributes: ["id", "name"],
          },
        ],
        group: ["weaver_id", "weaver.id"],
      }),
      KnitSales.findAll({
        attributes: ["knitter_id", "knitter.name"],
        where: whereCondition,
        include: [
          {
            model: Knitter,
            as: "knitter",
            attributes: ["id", "name"],
          },
        ],
        group: ["knitter_id", "knitter.id"],
      }),
      DyingSales.findAll({
        attributes: ["dying_id", "dying_fabric.name"],
        where: fabricWhere,
        include: [
          { model: Fabric, as: "dying_fabric", attributes: ["id", "name"] },
        ],
        group: ["dying_id", "dying_fabric.id"],
      }),
      WashingSales.findAll({
        attributes: ["washing_id", "washing.name"],
        where: fabricWhere,
        include: [{ model: Fabric, as: "washing", attributes: ["id", "name"] }],
        group: ["washing_id", "washing.id"],
      }),
      PrintingSales.findAll({
        attributes: ["printing_id", "printing.name"],
        where: fabricWhere,
        include: [
          { model: Fabric, as: "printing", attributes: ["id", "name"] },
        ],
        group: ["printing_id", "printing.id"],
      }),
      CompactingSales.findAll({
        attributes: ["compacting_id", "compacting.name"],
        where: fabricWhere,
        include: [
          { model: Fabric, as: "compacting", attributes: ["id", "name"] },
        ],
        group: ["compacting_id", "compacting.id"],
      }),
    ]);

    res.sendSuccess(res, response.flat());
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const getChooseFabricFilters = async (req: Request, res: Response) => {
  const { weaverId, garmentId,
    status, knitterId,
    dyingId, washingId, printingId, compactingId }: any = req.query;
  const whereCondition: any = {};
  const knitterWhere: any = {};
  const dyingWhere: any = {};
  const weaverWhere: any = {};
  const printingWhere: any = {};
  const washingWhere: any = {};
  const compactingWhere: any = {};
  try {
    if (!garmentId) {
      return res.sendError(res, "Need Garment Id ");
    }
    if (!status) {
      return res.sendError(res, "Need  status");
    }

    if (status === "Pending") {
      whereCondition.buyer_id = garmentId;
      whereCondition.status = {
        [Op.in]: ["Pending", "Pending for QR scanning"],
      };
    }
    if (status === "Sold") {
      whereCondition.buyer_id = garmentId;
      whereCondition.status = "Sold";
    }

    if (knitterId) {
      const idArray: number[] = knitterId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      knitterWhere.knitter_id = { [Op.in]: idArray };
    }
    if (weaverId) {
      const idArray: number[] = weaverId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      weaverWhere.weaver_id = { [Op.in]: idArray };
    }

    if (dyingId) {
      const idArray: number[] = dyingId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      dyingWhere.dying_id = { [Op.in]: idArray };
    }

    if (washingId) {
      const idArray: number[] = washingId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      washingWhere.washingId = { [Op.in]: idArray };
    }
    if (printingId) {
      const idArray: number[] = printingId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      printingWhere.dying_id = { [Op.in]: idArray };
    }
    if (compactingId) {
      const idArray: number[] = compactingId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      compactingWhere.compacting_id = { [Op.in]: idArray };
    }

    let knitIds = await KnitSales.findAll({
      attributes: ["id"],
      where: {
        ...whereCondition,
        ...knitterWhere,
        batch_lot_no: { [Op.not]: null },
      },
    });

    let knitSalesId = knitIds.map((item: any) => item.dataValues.id);
    let knitBatchLot = await KnitFabricSelection.findAll({
      attributes: [[Sequelize.col("process.batch_lot_no"), "batch_lot_no"]],
      where: { sales_id: { [Op.in]: knitSalesId } },
      include: [
        {
          model: KnitProcess,
          as: "process",
          where: { batch_lot_no: { [Op.not]: null } },
          attributes: [],
        },
      ],
      group: ["process.batch_lot_no"],
    });

    let weaveIds = await WeaverSales.findAll({
      attributes: ["id"],
      where: {
        ...whereCondition,
        ...weaverWhere,
        batch_lot_no: { [Op.not]: null },
      },
    });

    let weaveSalesId = weaveIds.map((item: any) => item.dataValues.id);
    let weaveBatchLot = await WeaverFabricSelection.findAll({
      attributes: [[Sequelize.col("process.batch_lot_no"), "batch_lot_no"]],
      where: { sales_id: { [Op.in]: weaveSalesId } },
      include: [
        {
          model: WeaverProcess,
          as: "process",
          where: { batch_lot_no: { [Op.not]: null } },
          attributes: [],
        },
      ],
      group: ["process.batch_lot_no"],
    });
    let dying = await DyingSales.findAll({
      attributes: ["batch_lot_no"],
      where: { ...whereCondition, ...dyingWhere },
      group: ["batch_lot_no"],
    })
    let washingLot = await WashingSales.findAll({
      attributes: ["batch_lot_no"],
      where: { ...whereCondition, ...washingWhere },
      group: ["batch_lot_no"]
    })
    let printing = await PrintingSales.findAll({
      attributes: ["batch_lot_no"],
      where: { ...whereCondition, ...printingWhere },
      group: ["batch_lot_no"],
    })
    let compactingLot = await CompactingSales.findAll({
      attributes: ["batch_lot_no"],
      where: { ...whereCondition, ...compactingWhere },
      group: ["batch_lot_no"],
    })
    let batchLot = [...weaveBatchLot, ...knitBatchLot, ...dying, ...washingLot, ...printing, ...compactingLot];
    const uniqueBatchSet: any = new Set<any>(
      batchLot?.map((order: any) => JSON.stringify(order))
    );

    const uniqueBatchLot: any = Array.from(
      uniqueBatchSet,
      (item: any) => JSON.parse(item) as any
    );

    const response: any = await Promise.all([
      WeaverSales.findAll({
        attributes: ["brand_order_ref", "garment_order_ref"],
        where: { ...whereCondition, ...weaverWhere },
        group: ["brand_order_ref", "garment_order_ref"],
      }),
      KnitSales.findAll({
        attributes: ["brand_order_ref", "garment_order_ref"],
        where: { ...whereCondition, ...knitterWhere },
        group: ["brand_order_ref", "garment_order_ref"],
      }),
      DyingSales.findAll({
        attributes: ["brand_order_ref", "garment_order_ref"],
        where: { ...whereCondition, ...dyingWhere },
        group: ["brand_order_ref", "garment_order_ref"],
      }),
      WashingSales.findAll({
        attributes: ["brand_order_ref", "garment_order_ref"],
        where: { ...whereCondition, ...washingWhere },
        group: ["brand_order_ref", "garment_order_ref"],
      }),
      PrintingSales.findAll({
        attributes: ["brand_order_ref", "garment_order_ref"],
        where: { ...whereCondition, ...printingWhere },
        group: ["brand_order_ref", "garment_order_ref"],
      }),
      CompactingSales.findAll({
        attributes: ["brand_order_ref", "garment_order_ref"],
        where: { ...whereCondition, ...compactingWhere },
        group: ["brand_order_ref", "garment_order_ref"],
      })
    ]);
    const uniqueOrdersSet: any = new Set<any>(
      response.flat()?.map((order: any) => JSON.stringify(order))
    );

    const uniqueOrderRef: any = Array.from(
      uniqueOrdersSet,
      (item: any) => JSON.parse(item) as any
    );

    let result: any = {
      batchLot: uniqueBatchLot,
      order_ref: uniqueOrderRef,
    };

    res.sendSuccess(res, result);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const getChooseGarmentFilters = async (req: Request, res: Response) => {
  const { garmentId, status }: any = req.query;
  const whereCondition: any = {};
  try {
    if (!garmentId) {
      return res.sendError(res, "Need Garment Id ");
    }
    whereCondition.garment_id = garmentId;

    const types = await GarmentProcess.findAll({
      attributes: ["garment_type"],
      where: { ...whereCondition },
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

    let brandOrderRef: any = await GarmentProcess.findAll({
      attributes: ["brand_order_ref"],
      where: { ...whereCondition, brand_order_ref: { [Op.not]: null } },
      group: ["brand_order_ref"],
    });

    let fabricOrderRef: any = await GarmentProcess.findAll({
      attributes: ["fabric_order_ref"],
      where: { ...whereCondition, fabric_order_ref: { [Op.not]: null } },
    });

    let factoryLotNo: any = await GarmentProcess.findAll({
      attributes: ["factory_lot_no"],
      where: { ...whereCondition, factory_lot_no: { [Op.not]: null } },
    });

    let reelLotNo: any = await GarmentProcess.findAll({
      attributes: ["reel_lot_no"],
      where: { ...whereCondition, reel_lot_no: { [Op.not]: null } },
    });

    let result: any = {
      garmentTypes,
      brandOrderRef: brandOrderRef,
      fabricOrderRef,
      factoryLotNo,
      reelLotNo,
    };

    res.sendSuccess(res, result);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const getBrands = async (req: Request, res: Response) => {
  let garmentId = req.query.garmentId;
  if (!garmentId) {
    return res.sendError(res, "Need Garment Id ");
  }
  let garment = await Garment.findOne({ where: { id: garmentId } });
  if (!garment) {
    return res.sendError(res, "No Garment Found ");
  }
  let brand = await Brand.findAll({
    where: { id: { [Op.in]: garment.dataValues.brand } },
  });
  res.sendSuccess(res, brand);
};

const getBuyerProcessors = async (req: Request, res: Response) => {
  try {
    let list = await ProcessorList.findAll({
      attributes: ["id", "name"],
    });
    res.sendSuccess(res, list);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

const getGarmentProcessTracingChartData = async (req: Request, res: Response) => {
  const query = req.query;
  let garments = await GarmentProcess.findAll({
    where: query
  });

  garments = await Promise.all(garments.map(async (el: any) => {
    el = el.toJSON();
    let fabricChart: any;
    let process: any = ['dying', 'printing', 'washing', 'compacting'];
    for (var i = 0; i < process.length; i++) {
      fabricChart = await _getFabricProcessTracingChartData('dying', {
        buyer_id: el.garment_id
      });
      if (fabricChart) break;
    };
    el.fabricChart = fabricChart;
    return el;
  }));
  let key = Object.keys(req.query)[0];
  res.send(formatDataForGarment(req.query[key], garments));
}


const garmentTraceabilityMap = async (req: Request, res: Response) => {
  const { salesId}: any = req.query;
  try {
    if(!salesId) {
      return res.sendError(res, "Need Sales Id ");
    }
    let include = [ 
      {
        model:Brand,
        as:'buyer',
        attributes: ['id','brand_name']
      },
      {
        model: Garment,
        as: "garment",
        attributes: ["id", "name", "address",'longitude','latitude','org_logo','org_photo'],
        include :[ {
          model: Country,
          as: "country",
        },
        {
          model: State,
          as: "state",
        },
        {
          model: District,
          as: "district",
        }]
      },
    ];

    //fetch data with pagination
    let item = await GarmentSales.findOne({
      attributes:['id','date','fabric_order_ref','brand_order_ref','invoice_no','garment_size','style_mark_no','garment_type','color','total_no_of_boxes','total_no_of_pieces'],
      where: {id : salesId},
      include: include
    });
    let data :any= {};
    let obj: any = {};
    if(!item){
      return res.sendSuccess(res, data);
    }

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

      let knitSales: any = [];
      let knit_yarn_ids: any = [];
      let knit_jobDetails = [];
      let knit_fabric_gsm = []
      if (knit_fabric_ids.length > 0) {
        const rows = await KnitSales.findAll({
          attributes: [
            "id",
            "date",
            "garment_order_ref",
            "brand_order_ref",
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
              attributes: ["id", "name", "address",'longitude','latitude','org_logo','org_photo'],
              include :[ {
                model: Country,
                as: "country",
              },
              {
                model: State,
                as: "state",
              },
              {
                model: District,
                as: "district",
              }]
            }
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
          include :[ {
            model: KnitProcess,
            as: "process",
          }]
        });
        knit_jobDetails = knitProcess.map((obj:any) => obj?.dataValues?.process?.job_details_garment);
        knit_fabric_gsm = knitProcess.map((obj:any) => obj?.dataValues?.process?.fabric_gsm);
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
      let jobDetails = [];
      let fabric_gsm = []
      if (weaver_fabric_ids.length > 0) {
        const rows = await WeaverSales.findAll({
          attributes: [
            "id",
            "date",
            "garment_order_ref",
            "brand_order_ref",
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
              attributes: ["id", "name", "address",'longitude','latitude','org_logo','org_photo'],
              include :[ {
                model: Country,
                as: "country",
              },
              {
                model: State,
                as: "state",
              },
              {
                model: District,
                as: "district",
              }]
            }
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
          include : [{
            model :WeaverProcess,
            as : 'process'
          }]
        });
        jobDetails = weaveProcess.map((obj:any) => obj?.dataValues?.process?.job_details_garment);
        fabric_gsm = weaveProcess.map((obj:any) => obj?.dataValues?.process?.fabric_gsm);
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
      let blendqty = [];
      let blendtype = []
      if (weave_yarn_ids.length > 0 || knit_yarn_ids.length > 0) {
        spinSales = await SpinSales.findAll({
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
              attributes: ["id", "name", "address",'longitude','latitude','org_logo','org_photo'],
              include :[ {
                model: Country,
                as: "country",
              },
              {
                model: State,
                as: "state",
              },
              {
                model: District,
                as: "district",
              }]
            },
            {
              model: YarnCount,
              as: "yarncount",
              attributes: ["yarnCount_name"],
            },
          ],
          where: {
            id: {
              [Op.in]: [...weave_yarn_ids, ...knit_yarn_ids],
            },
          },
        });
        let spinSaleProcess = await SpinProcessYarnSelection.findAll({
          where: {
            sales_id: spinSales.map((obj: any) => obj.dataValues.id),
          },
          attributes: ["id", "spin_process_id"],
        });
        let spinProcess = await LintSelections.findAll({
          where: {
            process_id: spinSaleProcess.map(
              (obj: any) => obj?.dataValues?.spin_process_id
            ),
          },
          include:[{
            as :'spinprocess',
            model: SpinProcess
          }],
          attributes: ["id", "lint_id"],
        });
        blendqty = spinProcess.map((obj: any) => obj?.dataValues?.spinprocess?.dataValues?.cottonmix_qty);
        let blend = spinProcess.map((obj: any) => obj?.dataValues?.spinprocess?.dataValues?.cottonmix_type);
        if(blend.length > 0) {
          blendtype = await CottonMix.findAll({
            attributes: ['id','cottonMix_name'],
            where: {
              id : blend.flat()
            }
           })
        }
     
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
            "rate"
          ],
          include: [
            {
              model: Ginner,
              as: "ginner",
              attributes: ["id", "name", "address",'longitude','latitude','org_logo','org_photo'],
              include :[ {
                model: Country,
                as: "country",
              },
              {
                model: State,
                as: "state",
              },
              {
                model: District,
                as: "district",
              }]
            }
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
              model: District,
              as: "district",
              attributes: ["id", "district_name"],
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
                  as: "farmGroup"
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
              .map((val: any) => val?.knitter)
              .filter((item: any) => item !== null && item !== undefined)
          : [];
      let weaverName =
        weaverSales && weaverSales.length > 0
          ? weaverSales
              .map((val: any) => val?.weaver)
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
      let knitGarmentRefNumber =
          knitSales && knitSales.length > 0
            ? knitSales
                .map((val: any) => val?.garment_order_ref)
                .filter((item: any) => item !== null && item !== undefined)
            : [];
      let knitbrandtRefNumber =
            knitSales && knitSales.length > 0
              ? knitSales
                  .map((val: any) => val?.brand_order_ref)
                  .filter((item: any) => item !== null && item !== undefined)
              : [];
      let weaverReelLot =
        weaverSales && weaverSales.length > 0
          ? weaverSales
              .map((val: any) => val?.reel_lot_no)
              .filter((item: any) => item !== null && item !== undefined)
          : [];
      let weaverGarmentRefNumber =
          weaverSales && weaverSales.length > 0
            ? weaverSales
                .map((val: any) => val?.garment_order_ref)
                .filter((item: any) => item !== null && item !== undefined)
            : [];
      let weaverbrandtRefNumber =
            knitSales && knitSales.length > 0
              ? knitSales
                  .map((val: any) => val?.brand_order_ref)
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
      obj.fbrc_job_details = [...new Set([...jobDetails.flat(),...knit_jobDetails.flat()])];
      obj.fbrc_fabric_gsm = [...new Set([...fabric_gsm.flat(),...knit_fabric_gsm.flat()])];
      obj.fbrc_name = [...new Set([...knitName, ...weaverName])];
      obj.fbrc_invoice_no = [...new Set([...knitInvoice, ...weaverInvoice])];
      obj.fbrc_lot_no = [...new Set([...knitLot, ...weaverLot])];
      obj.fbrc_reel_lot_no = [...new Set([...knitReelLot, ...weaverReelLot])];
      obj.fbrc_garment_order_ref =  [...new Set([...knitGarmentRefNumber, ...weaverGarmentRefNumber])];
      obj.fbrc_brand_order_ref =  [...new Set([...knitbrandtRefNumber, ...weaverbrandtRefNumber])];
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
              .map((val: any) => val?.spinner)
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
              .map((val: any) => val?.yarncount?.yarnCount_name)
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
      obj.blendqty =  blendqty.flat();
      obj.blendtype =  blendtype.flat()
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
      let ginrate =
          ginSales && ginSales.length > 0
            ? ginSales
                .map((val: any) => val?.rate)
                .filter((item: any) => item !== null && item !== undefined)
            : [];
      let ginName =
        ginSales && ginSales.length > 0
          ? ginSales
              .map((val: any) => val?.ginner)
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
      obj.gnr_rate = [...new Set(ginrate)];
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
              .map((val: any) => { return {...val?.farmer?.farmGroup.dataValues ,district: val?.district.dataValues,state: val?.state.dataValues}})
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

     
    
    
    data = {
      ...item.dataValues,
      ...obj,
      // knitSales,
      // weaverSales,
      // spinSales,
      // ginSales,
      // transactions_ids,
      // transactions
    };

    return res.sendSuccess(res, data);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

export {
  fetchBrandQrGarmentSalesPagination,
  exportBrandQrGarmentSales,
  fetchTransactions,
  fetchTransactionsAll,
  updateTransactionStatus,
  getProgram,
  createGarmentProcess,
  updateGarmentProcess,
  fetchGarmentProcess,
  createGarmentSales,
  updateGarmentSales,
  fetchGarmentProcessPagination,
  fetchGarmentSalesPagination,
  chooseFabricProcess,
  chooseGarmentSales,
  exportGarmentSale,
  getEmbroidering,
  dashboardGraph,
  getprocessName,
  getChooseFabricFilters,
  getGarmentReelLotNo,
  fetchGarmentSale,
  getBrands,
  getChooseGarmentFilters,
  exportGarmentProcess,
  getBuyerProcessors,
  getGarmentProcessTracingChartData,
  garmentTraceabilityMap
};
