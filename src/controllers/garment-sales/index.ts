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
    whereCondition.buyer_type = "Mapped";
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
        buyer_type: "Mapped",
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
      fabricId
    }: any = req.query;

    let extra = ``;
    let extrawave = ``;
    const knitterWhere: any = {};
    const weaverWhere: any = {};
    const fabricWhere: any = {};
    let whereCondition: any = {};

    if (searchTerm) {
        whereCondition[Op.or] = [
// Search by order ref
            { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
            { garment_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
            { brand_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
            { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
            { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
            { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
            { vehicle_no: { [Op.iLike]: `%${searchTerm}%` } },
            { transaction_agent: { [Op.iLike]: `%${searchTerm}%` } },
            { transporter_name: { [Op.iLike]: `%${searchTerm}%` } },
            { bill_of_ladding: { [Op.iLike]: `%${searchTerm}%` } },
            { processor_name: { [Op.iLike]: `%${searchTerm}%` } },
            { processor_address: { [Op.iLike]: `%${searchTerm}%` } },
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
    if (weaverId) {
      const idArray: number[] = weaverId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      knitterWhere.knitter_id = { [Op.in]: [0] };
      weaverWhere.weaver_id = { [Op.in]: idArray };
      // fabricWhere.fabric_id = { [Op.in]: [0] };
    }
    if (knitterId) {
      const idArray: number[] = knitterId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      weaverWhere.weaver_id = { [Op.in]: [0] };
      knitterWhere.knitter_id = { [Op.in]: idArray };
      // fabricWhere.fabric_id = { [Op.in]: [0] };
    }

    // if (fabricId) {
    //   const idArray: number[] = fabricId
    //     .split(",")
    //     .map((id: any) => parseInt(id, 10));
    //   weaverWhere.weaver_id = { [Op.in]: [0] };
    //   knitterWhere.knitter_id = { [Op.in]: [0] };
    //   fabricWhere.fabric_id = { [Op.in]: idArray };
    // }
    
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
          [Op.or]:[{'$weaver.name$': { [Op.iLike]: `%${searchTerm}%` }}]
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
          [Op.or]:[{'$knitter.name$': { [Op.iLike]: `%${searchTerm}%` }}]
        },
        include: [
          ...include,
          { model: Knitter, as: "knitter", attributes: ["id", "name"] },
        ],
      }),
      // DyingSales.findAll({
      //   where: {
      //     status: "Sold",
      //     buyer_id: garmentId,
      //     ...whereCondition,
      //     ...fabricWhere,
      //     [Op.or]:[{'$dying_fabric.name$': { [Op.iLike]: `%${searchTerm}%` }}]
      //   },
      //   include: [
      //     ...include,
      //     { model: Fabric, as: "dying_fabric", attributes: ["id", "name"] },
      //   ],
      // }),
      // WashingSales.findAll({
      //   where: {
      //     status: "Sold",
      //     buyer_id: garmentId,
      //     ...whereCondition,
      //     ...fabricWhere,
      //   },
      //   include: [
      //     ...include,
      //     { model: Fabric, as: "washing", attributes: ["id", "name"] },
      //   ],
      // }),
      // PrintingSales.findAll({
      //   where: {
      //     status: "Sold",
      //     buyer_id: garmentId,
      //     ...whereCondition,
      //     ...fabricWhere,
      //   },
      //   include: [
      //     ...include,
      //     { model: Fabric, as: "printing", attributes: ["id", "name"] },
      //   ],
      // }),
      // CompactingSales.findAll({
      //   where: {
      //     status: "Sold",
      //     buyer_id: garmentId,
      //     ...whereCondition,
      //     ...fabricWhere,
      //   },
      //   include: [
      //     ...include,
      //     { model: Fabric, as: "compacting", attributes: ["id", "name"] },
      //   ],
      // }),
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
    }: any = req.query;
    if (!garmentId) {
      return res.sendError(res, "Need Garment Id");
    }
    const knitterWhere: any = {};
    const weaverWhere: any = {};
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
    if (weaverId) {
      const idArray: number[] = weaverId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      knitterWhere.knitter_id = { [Op.in]: [0] };
      weaverWhere.weaver_id = { [Op.in]: idArray };
    }
    if (knitterId) {
      const idArray: number[] = knitterId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      weaverWhere.weaver_id = { [Op.in]: [0] };
      knitterWhere.knitter_id = { [Op.in]: idArray };
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
    let result = await Promise.all([
      WeaverSales.findAll({
        where: {
          status: "Pending for QR scanning",
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
          status: "Pending for QR scanning",
          buyer_id: garmentId,
          ...whereCondition,
          ...knitterWhere,
        },
        include: [
          ...include,
          { model: Knitter, as: "knitter", attributes: ["id", "name"] },
        ],
      }),
      // DyingSales.findAll({
      //   where: {
      //     status: "Pending",
      //     buyer_id: garmentId,
      //     ...whereCondition,
      //   },
      //   include: [
      //     ...include,
      //     { model: Fabric, as: "dying_fabric", attributes: ["id", "name"] },
      //   ],
      // }),
      // WashingSales.findAll({
      //   where: {
      //     status: "Pending",
      //     buyer_id: garmentId,
      //     ...whereCondition,
      //   },
      //   include: [
      //     ...include,
      //     { model: Fabric, as: "washing", attributes: ["id", "name"] },
      //   ],
      // }),
      // PrintingSales.findAll({
      //   where: {
      //     status: "Pending",
      //     buyer_id: garmentId,
      //     ...whereCondition,
      //   },
      //   include: [
      //     ...include,
      //     { model: Fabric, as: "printing", attributes: ["id", "name"] },
      //   ],
      // }),
      // CompactingSales.findAll({
      //   where: {
      //     status: "Pending",
      //     buyer_id: garmentId,
      //     ...whereCondition,
      //   },
      //   include: [
      //     ...include,
      //     { model: Fabric, as: "compacting", attributes: ["id", "name"] },
      //   ],
      // }),
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
      if (obj.type === 'Knitter') {
        const transaction = await KnitSales.update(data, {
          where: {
            id: obj.id,
          },
        });
        trans.push(transaction);
      } else if (obj.type === 'Weaver') {
        const transaction = await WeaverSales.update(data, {
          where: {
            id: obj.id,
          },
        });
        trans.push(transaction);
      } else if (obj.type === 'Dying') {
        const transaction = await DyingSales.update(data, {
          where: {
            id: obj.id,
          },
        });
        trans.push(transaction);
      }else if (obj.type === 'Printing'){
        const transaction = await PrintingSales.update(data, {
          where: {
            id: obj.id,
          },
        });
        trans.push(transaction);
      }else if (obj.type === 'Washing'){
        const transaction = await WashingSales.update(data, {
          where: {
            id: obj.id,
          },
        });
        trans.push(transaction);
      }else if (obj.type === 'Compacting'){
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
      total_waste_perct:req.body.wastePercentage,
      waste_weight:req.body.wasteWeight,
      waste_length:req.body.wasteLength,
      waste_fabric_sold_to:req.body.wasteFabricSoldTo,
      waste_fabric_invoice:req.body.wasteFabricInvoice,
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
      `${process.env.ADMIN_URL}/qrdetails/garmentprocess/${garmentProcess.id}`,
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
    if (req.body.chooseFabric && req.body.chooseFabric.length > 0) {
      for await (let obj of req.body.chooseFabric) {
        if (obj.processor === "knitter") {
          let update = await KnitSales.update(
            { qty_stock: obj.totalQty - obj.qtyUsed },
            { where: { id: obj.id } }
          );
        } else {
          let update = await WeaverSales.update(
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
        mark: item.style_mark_no && item.style_mark_no?.length > 0 ? item.style_mark_no?.join(',') : "",
        garment: item.garment_type && item.garment_type?.length > 0? item.garment_type?.join(',') : "",
        color: item.color && item.color?.length > 0 ? item.color?.join(',') : "",
        garmentSize: item.garment_size && item.garment_size?.length > 0 ? item.garment_size?.join(',') : "",
        no_of_pieces: item.no_of_pieces && item.no_of_pieces?.length > 0 ? item.no_of_pieces?.join(',') : "",
        no_of_boxes: item.no_of_boxes && item.no_of_boxes?.length > 0 ? item.no_of_boxes?.join(',') : "",
        totalFabricLength: item.total_fabric_length ? item.total_fabric_length : "",
        totalFabricWeight: item.total_fabric_weight ? item.total_fabric_weight : "",
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

const chooseFabricProcess = async (req: Request, res: Response) =>{
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
    fabricId
  }: any = req.query;
  const knitterWhere: any = {};
  const weaverWhere: any = {};
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
  if (weaverId) {
    const idArray: number[] = weaverId
      .split(",")
      .map((id: any) => parseInt(id, 10));
    knitterWhere.knitter_id = { [Op.in]: [0] };
    weaverWhere.weaver_id = { [Op.in]: idArray };
    // fabricWhere.fabric_id = { [Op.in]: [0] };
  }
  if (knitterId) {
    const idArray: number[] = knitterId
      .split(",")
      .map((id: any) => parseInt(id, 10));
    weaverWhere.weaver_id = { [Op.in]: [0] };
    knitterWhere.knitter_id = { [Op.in]: idArray };
    // fabricWhere.fabric_id = { [Op.in]: [0] };
  }

  // if (fabricId) {
  //   const idArray: number[] = fabricId
  //     .split(",")
  //     .map((id: any) => parseInt(id, 10));
  //   weaverWhere.weaver_id = { [Op.in]: [0] };
  //   knitterWhere.knitter_id = { [Op.in]: [0] };
  //   fabricWhere.fabric_id = { [Op.in]: idArray };
  // }
  
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

    whereCondition[Op.or]= filterValues.map((value) => ({
        batch_lot_no: {[Op.iLike]: `%${value}%`}}))
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
        buyer_type: "Mapped",
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
        buyer_type: "Mapped",
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
    // DyingSales.findAll({
    //   where: {
    //     status: "Sold",
    //     buyer_id: garmentId,
    //     ...whereCondition,
    //     ...fabricWhere,
    //   },
    //   include: [
    //     ...include,
    //     { model: Fabric, as: "dying_fabric", attributes: ["id", "name"] },
    //   ],
    // }),
    // WashingSales.findAll({
    //   where: {
    //     status: "Sold",
    //     buyer_id: garmentId,
    //     ...whereCondition,
    //     ...fabricWhere,
    //   },
    //   include: [
    //     ...include,
    //     { model: Fabric, as: "washing", attributes: ["id", "name"] },
    //   ],
    // }),
    // PrintingSales.findAll({
    //   where: {
    //     status: "Sold",
    //     buyer_id: garmentId,
    //     ...whereCondition,
    //     ...fabricWhere,
    //   },
    //   include: [
    //     ...include,
    //     { model: Fabric, as: "printing", attributes: ["id", "name"] },
    //   ],
    // }),
    // CompactingSales.findAll({
    //   where: {
    //     status: "Sold",
    //     buyer_id: garmentId,
    //     ...whereCondition,
    //     ...fabricWhere,
    //   },
    //   include: [
    //     ...include,
    //     { model: Fabric, as: "compacting", attributes: ["id", "name"] },
    //   ],
    // }),
  ]);

  let abc = result.flat();
  return res.sendSuccess(res, abc);
} catch (error: any) {
  console.error("Error appending data:", error);
  return res.sendError(res, error.message);
}
}

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
      status: req.body.buyerId ? "Sold" : "Pending",
    };
    const garmentSales = await GarmentSales.create(data);
    let uniqueFilename = `garment_sales_qrcode_${Date.now()}.png`;
    let aa = await generateOnlyQrCode(
      `${process.env.ADMIN_URL}/qrdetails/garmentsales/${garmentSales.id}`,
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
        let val = await GarmentProcess.findOne({ where: { id: obj.id } });
                if (val) {
                    let update = await GarmentProcess.update(
                      {
                        // qty_stock: val.dataValues.qty_stock - obj.qtyUsed,
                        qty_stock_weight: val.dataValues.qty_stock_weight - obj.qtyUsedWeight,
                        qty_stock_length: val.dataValues.qty_stock_length - obj.qtyUsedLength,
                      },
                      { where: { id: obj.id } }
                    );
                    await GarmentSelection.create({
                      garment_id: obj.id,
                      processor: obj.processor,
                      sales_id: garmentSales.id,
                      // qty_used: obj.qtyUsed,
                      qty_used_length: obj.qtyUsedLength,
                      qty_used_weight: obj.qtyUsedWeight,
                    });
                }
      }
    }

    res.sendSuccess(res, garmentSales);
  } catch (error: any) {
    console.log(error.message);
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
                            [Op.in]: row.dataValues.department,
                        },
                    },
                    attributes: ['id', 'dept_name']
                });
                data.push({
                    ...row.dataValues,
                    department
                })
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
                      [Op.in]: row.dataValues.department,
                  },
              },
              attributes: ['id', 'dept_name']
          });
          data.push({
              ...row.dataValues,
              department
          })
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
  const { garmentId, fabricOrderRef, programId, brandOrderRef, reelLotNo, factoryLotNo, garmentType }: any = req.query;
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

  const gin = await GarmentProcess.findAll({
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
  return res.sendSuccess(res, gin);
} catch (error: any) {
  return res.sendError(res, error.message);
}
}

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
        mark: item.style_mark_no ? item.style_mark_no?.join(',') : "",
        garment: item.garment_type ? item.garment_type?.join(',') : "",
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
          attributes: ['id', 'name', 'short_name']
      });

      let count = await GarmentProcess.count({
          include: [
              {
                  model: Program,
                  as: 'program',
                  where: { program_name: { [Op.iLike]: 'Reel' } }
              }
          ],
          where: {
              garment_id: garmentId
          }
      })

      let prcs_date = new Date().toLocaleDateString().replace(/\//g, '');
      let number = count + 1;
      let prcs_name = rows ? rows?.name.substring(0,3).toUpperCase() : '';

      let reelLotNo = "REEL-GAR-" + prcs_name + "-" + prcs_date + number;

      return res.sendSuccess(res, {reelLotNo})

  } catch (error: any) {
      return res.sendError(res, error.message);
  }
};

const getprocessName = async (req: Request, res: Response) => {
  const { garmentId, status, filter, programId, spinnerId }: any = req.query;
  const whereCondition: any = {};
  try {
    if (!garmentId) {
      return res.sendError(res, "Need garment Id ");
    }
    if (!status) {
      return res.sendError(res, "Need  status");
    }

    if (status === "Pending" || status === "Sold") {
      whereCondition.buyer_id = garmentId;
      whereCondition.status =
        status === "Pending" ? "Pending for QR scanning" : "Sold";
    }

    const response = await Promise.all([
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
    ]);

    res.sendSuccess(res, response.flat());
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const getChooseFabricFilters = async (req: Request, res: Response) => {
  const { weaverId, garmentId, status, knitterId }: any = req.query;
  const whereCondition: any = {};
  const knitterWhere: any = {};
  const weaverWhere: any = {};
  try {
    if (!garmentId) {
      return res.sendError(res, "Need Garment Id ");
    }
    if (!status) {
      return res.sendError(res, "Need  status");
    }

    if (status === "Pending" || status === "Sold") {
      whereCondition.buyer_id = garmentId;
      whereCondition.status =
        status === "Pending" ? "Pending for QR scanning" : "Sold";
    }
    if (knitterId) {
      const idArray: number[] = knitterId.split(",").map((id: any) =>
        parseInt(id, 10)
      );
      knitterWhere.knitter_id = { [Op.in]: idArray };
    }
    if (weaverId) {
      const idArray: number[] = weaverId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      weaverWhere.weaver_id = { [Op.in]: idArray };
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
    let batchLot = [...weaveBatchLot, ...knitBatchLot];

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
    ]);

   let result: any = {
      batchLot,
      order_ref: response.flat(),
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
    attributes: ['garment_type'],
    where: { ...whereCondition }
  });

  let garmentTypes: any = [];

  if(types && types.length > 0){
    for await (let row of types){
      garmentTypes = [...new Set(row?.dataValues?.garment_type?.map((item: any) => item))]
    }
  }

  let brandOrderRef: any = await GarmentProcess.findAll({
    attributes: ["brand_order_ref"],
    where: { ...whereCondition, brand_order_ref: { [Op.not]: null } },
    group: ["brand_order_ref"],
  });

  let fabricOrderRef:any = await GarmentProcess.findAll({
    attributes: ["fabric_order_ref"],
    where: { ...whereCondition, fabric_order_ref: { [Op.not]: null } }
  });

  let factoryLotNo:any = await GarmentProcess.findAll({
    attributes: ["factory_lot_no"],
    where: { ...whereCondition, factory_lot_no: { [Op.not]: null } }
  });

  let reelLotNo:any = await GarmentProcess.findAll({
    attributes: ["reel_lot_no"],
    where: { ...whereCondition, reel_lot_no: { [Op.not]: null } }
  });

   let result: any = {
    garmentTypes,
    brandOrderRef: brandOrderRef,
    fabricOrderRef,
    factoryLotNo,
    reelLotNo
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
    return res.sendError(res, "No Weaver Found ");
  }
  let brand = await Brand.findAll({
    attributes: ["id", "brand_name", "address"],
    where: { id: { [Op.in]: garment.dataValues.brand } },
  });
  res.sendSuccess(res, brand);
};

const getBuyerProcessors = async (req: Request, res: Response) => {
  try {
    let list = await ProcessorList.findAll({
      attributes: ["id", "name"],
    })
    res.sendSuccess(res, list);
  } catch (error: any) {
    console.log(error)
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
  createGarmentSales,
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
  getBuyerProcessors
};
