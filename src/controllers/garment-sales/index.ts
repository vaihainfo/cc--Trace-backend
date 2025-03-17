import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import GarmentSales from "../../models/garment-sales.model";
import * as ExcelJS from "exceljs";
import * as path from "path";
import Brand from "../../models/brand.model";
import WeaverSales from "../../models/weaver-sales.model";
import KnitSales from "../../models/knit-sales.model";
import Program from "../../models/program.model";
import Weaver from "../../models/weaver.model";
import Knitter from "../../models/knitter.model";
import Garment from "../../models/garment.model";
import { generateOnlyQrCode } from "../../provider/qrcode";
import heapSelection from "../../models/heap-selection.model";
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
import SpinProcess from "../../models/spin-process.model";
import CottonMix from "../../models/cotton-mix.model";
import { _getFabricProcessTracingChartData } from '../fabric/index';
import { formatDataForGarment } from '../../util/tracing-chart-data-formatter';
import PhysicalTraceabilityDataGarment from "../../models/physical-traceability-data-garment.model";
import PhysicalTraceabilityDataGarmentSample from "../../models/physical-traceability-data-garment-sample.model";
import FabricType from "../../models/fabric-type.model";
import { _getWeaverProcessTracingChartData } from "../weaver";
import { _getKnitterProcessTracingChartData } from "../knitter";
import sequelize from "../../util/dbConn";
import CompactingFabricSelections from "../../models/compacting-fabric-selection.model";
import PrintingFabricSelection from "../../models/printing-fabric-selection.model";
import WashingFabricSelection from "../../models/washing-fabric-selection.model";
import DyingFabricSelection from "../../models/dying-fabric-selection.model";

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
    return res.sendError(res, error.message, error);
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
      "Programme",
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
    return res.sendError(res, error.message, error);
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
        order: [
          [
            'id', 'desc'
          ]
        ]
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
        order: [
          [
            'id', 'desc'
          ]
        ]
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
        order: [
          [
            'id', 'desc'
          ]
        ]
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
        order: [
          [
            'id', 'desc'
          ]
        ]
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
        order: [
          [
            'id', 'desc'
          ]
        ]
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
        order: [
          [
            'id', 'desc'
          ]
        ]
      }),
    ]);

    let abc = result.flat();

    // Apply pagination to the combined result
    let data = abc.slice(offset, offset + limit);
    return res.sendPaginationSuccess(res, data, abc?.length);
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message, error);
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
        order: [
          [
            'id', 'desc'
          ]
        ]
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
        order: [
          [
            'id', 'desc'
          ]
        ]
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
        order: [
          [
            'id', 'desc'
          ]
        ]
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
        order: [
          [
            'id', 'desc'
          ]
        ]
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
        order: [
          [
            'id', 'desc'
          ]
        ]
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
        order: [
          [
            'id', 'desc'
          ]
        ]
      }),
    ]);
    let abc = result.flat();
    return res.sendSuccess(res, abc);
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message, error);
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
    return res.sendError(res, error.message, error);
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
    return res.sendError(res, error.message, error);
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
      from_date: req.body.from_date,
      to_date: req.body.to_date,
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
        no_of_pieces_stock: fabric.noOfPieces,
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

    if (req.body.enterPhysicalTraceability) {
      const physicalTraceabilityData = {
        date_sample_collection: req.body.dateSampleCollection,
        data_of_sample_dispatch: req.body.dataOfSampleDispatch,
        operator_name: req.body.operatorName,
        expected_date_of_garment_sale: req.body.expectedDateOfGarmentSale,
        physical_traceability_partner_id: req.body.physicalTraceabilityPartnerId,
        garm_process_id: garmentProcess.id,
        garment_id: req.body.garmentId
      };
      const physicalTraceabilityDataGarment = await PhysicalTraceabilityDataGarment.create(physicalTraceabilityData);

      for await (const weightAndCone of req.body.weightAndCone) {
        let brand = await Brand.findOne({
          where: { id: req.body.brandId }
        });

        const updatedCount = brand.dataValues.count + 1;
        let physicalTraceabilityDataGarmentSampleData = {
          physical_traceability_data_garment_id: physicalTraceabilityDataGarment.id,
          weight: weightAndCone.weight,
          cone: weightAndCone.cone,
          original_sample_status: weightAndCone.originalSampleStatus,
          code: `DNA${req.body.garmentShortname}${req.body?.reelLotNo ? '-' + req.body.reelLotNo : ''}-${updatedCount}`,
          sample_result: 0
        };
        await PhysicalTraceabilityDataGarmentSample.create(physicalTraceabilityDataGarmentSampleData);

        await Brand.update(
          { count: updatedCount },
          { where: { id: brand.id } }
        );
      }
    }

    res.sendSuccess(res, garmentProcess);
  } catch (error: any) {
    console.log(error.message);
    return res.sendError(res, error.message, error);
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
    return res.sendError(res, error.message, error);
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
    return res.sendError(res, error.message, error);
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
    return res.sendError(res, error.message, error);
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
    worksheet.mergeCells("A1:Q1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Process";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.",
      "Date",
      "Garment Production Start Date",
      "Garment Production End Date",
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
        from_date: item.from_date ? item.from_date : "",
        to_date: item.to_date ? item.to_date : "",
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
    return res.sendError(res, error.message, error);
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
    return res.sendError(res, error.message, error);
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
              qty_stock: val.dataValues.qty_stock - obj.qtyUsed,
              status: 'Sold'
            },
            { where: { id: obj.process_id } }
          );

          const GarmentFabric = await GarmentFabricType.findOne({ where: { id: obj.id } });

          let updateFabric = {}
          if (GarmentFabric.no_of_pieces_stock - obj.qtyUsed <= 0) {
            updateFabric = {
              sold_status: true,
              no_of_pieces_stock: 0
            }
          } else {
            updateFabric = {
              no_of_pieces_stock: GarmentFabric.no_of_pieces_stock - obj.qtyUsed
            }
          }

          const GarmentYarnStatus = await GarmentFabricType.update(updateFabric, { where: { id: obj.id } });
          // let updatee = await GarmentFabricType.update(
          //   { sold_status: true },
          //   { where: { id: obj.id } }
          // );
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
    return res.sendError(res, error.message, error);
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
    return res.sendError(res, error.message, error);
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
              [Op.in]: row.dataValues.department_id ?? undefined,
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
    return res.sendError(res, error.message, error);
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
    return res.sendError(res, error.message, error);
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
      order: [["id", "desc"]],
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
                Sequelize.fn("SUM", Sequelize.col("no_of_pieces_stock")),
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
                Sequelize.fn("SUM", Sequelize.col("no_of_pieces_stock")),
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
          order: [["id", "desc"]],
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
    return res.sendError(res, error.message, error);
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
    return res.sendError(res, error.message, error);
  }
};

const getEmbroidering = async (req: Request, res: Response) => {
  try {
    let data = await Embroidering.findOne({ where: { id: req.query.id } });
    return res.sendSuccess(res, data);
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message, error);
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
    return res.sendError(res, error.message, error);
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
        model: Country,
        as: 'country',
        attributes: ['id', 'county_name']
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
    const random_number = +performance.now().toString().replace('.', '7').substring(0, 4)
    let prcs_name = rows ? rows?.name.substring(0, 3).toUpperCase() : "";
    let country = rows ? rows?.country?.county_name.substring(0, 2).toUpperCase() : "";
    let reelLotNo = "REEL-GAR-" + prcs_name + "-" + country + "-" + prcs_date + random_number;

    return res.sendSuccess(res, { reelLotNo });
  } catch (error: any) {
    return res.sendError(res, error.message, error);
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
    return res.sendError(res, error.message, error);
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
    return res.sendError(res, error.message, error);
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
    return res.sendError(res, error.message, error);
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
    return res.sendError(res, error.message, error);
  }
};

const getGarmentProcessTracingChartData = async (req: Request, res: Response) => {
  try {
    const query = req.query;

    if (!query?.reel_lot_no) {
      return res.sendError(res, "Need Reel Lot No");
    }

    let garments = await GarmentProcess.findAll({ where: query });

    garments = await Promise.all(garments?.map(async (el: any) => {
      el = el?.toJSON();
      let fabricChart: any;

      const garmentSelection = await FabricSelection.findAll({ where: { sales_id: el.id } });

      const fabricChartPromises = garmentSelection?.map(async (process: any) => {
        const { processor, fabric_id } = process?.dataValues;

        if (['dying', 'printing', 'washing', 'compacting'].includes(processor)) {
          if (fabric_id) {
            return await _getFabricProcessTracingChartData(processor, fabric_id);
          }
        }
        else if (processor === 'knitter' && fabric_id) {
          const knitterChart = await KnitFabricSelection.findAll({
            where: { sales_id: fabric_id },
            include: [{
              model: KnitProcess, as: 'process', attributes: ['reel_lot_no']
            }]
          });
          const knitterChartData = await Promise.all(
            knitterChart?.map(async (knitSeleItem: any) => {
              if (knitSeleItem?.dataValues?.process?.reel_lot_no) {
                return await _getKnitterProcessTracingChartData({ reel_lot_no: knitSeleItem.dataValues.process.reel_lot_no });
              }
            })
          );
          return knitterChartData[0];
        } else {
          const weaverChart = await WeaverFabricSelection.findAll({
            where: { sales_id: fabric_id },
            include: [{
              model: WeaverProcess, as: 'process', attributes: ['reel_lot_no']
            }]
          });
          const weaverChartData = await Promise.all(
            weaverChart?.map(async (weavSeleItem: any) => {
              if (weavSeleItem?.dataValues?.process?.reel_lot_no) {
                return await _getWeaverProcessTracingChartData({ reel_lot_no: weavSeleItem.dataValues.process.reel_lot_no });
              }
            })
          );
          return weaverChartData[0];
        }
      });

      // Resolve all fabric chart promises and assign the first non-null result to fabricChart
      const fabricChartResults = await Promise.all(fabricChartPromises);
      fabricChart = fabricChartResults?.find(result => result !== null);

      el.fabricChart = fabricChart;
      return el;
    }));

    const key = Object.keys(req.query)[0];
    res.send(formatDataForGarment(req.query[key], garments));
  } catch (error) {
    console.error("Error processing garment data: ", error);
    res.status(500).send({ error: "An error occurred while processing garment data." });
  }
};


const garmentTraceabilityMap = async (req: Request, res: Response) => {
  const { salesId }: any = req.query;
  try {
    if (!salesId) {
      return res.sendError(res, "Need Sales Id ");
    }
    let include = [
      {
        model: Brand,
        as: 'buyer',
        attributes: ['id', 'brand_name']
      },
      {
        model: Garment,
        as: "garment",
        attributes: ["id", "name", "address", 'longitude', 'latitude', 'org_logo', 'org_photo'],
        include: [{
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
      attributes: ['id', 'date', 'fabric_order_ref', 'brand_order_ref', 'invoice_no', 'garment_size', 'style_mark_no', 'garment_type', 'color', 'total_no_of_boxes', 'total_no_of_pieces'],
      where: { id: salesId },
      include: include
    });
    let data: any = {};
    let obj: any = {};
    if (!item) {
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
      .filter((obj: any) => obj?.dataValues?.processor.toLowerCase() === "knitter")
      .map((obj: any) => obj?.dataValues?.fabric_id);
    let weaver_fabric_ids = fabric
      .filter((obj: any) => obj?.dataValues?.processor.toLowerCase() === "weaver")
      .map((obj: any) => obj?.dataValues?.fabric_id);
    let compacting_fabric_ids = fabric
      .filter((obj: any) => obj?.dataValues?.processor.toLowerCase() === "compacting")
      .map((obj: any) => obj?.dataValues?.fabric_id);
    let printing_fabric_ids = fabric
      .filter((obj: any) => obj?.dataValues?.processor.toLowerCase() === "printing")
      .map((obj: any) => obj?.dataValues?.fabric_id);
    let washing_fabric_ids = fabric
      .filter((obj: any) => obj?.dataValues?.processor.toLowerCase() === "washing")
      .map((obj: any) => obj?.dataValues?.fabric_id);
    let dying_fabric_ids = fabric
      .filter((obj: any) => obj?.dataValues?.processor.toLowerCase() === "dying")
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
        .filter((obj: any) => obj?.process_type.toLowerCase() === "knitter")
        .map((obj: any) => obj?.process_id);
      knit_fabric_ids = [...knit_fabric_ids, ...knitter_fabric];
      let weaver_fabric = selection
        .filter((obj: any) => obj?.process_type.toLowerCase() === "weaver")
        .map((obj: any) => obj?.process_id);
      weaver_fabric_ids = [...weaver_fabric_ids, ...weaver_fabric];
    }


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
            attributes: ["id", "name", "address", 'longitude', 'latitude', 'org_logo', 'org_photo'],
            include: [{
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
        include: [{
          model: KnitProcess,
          as: "process",
        }]
      });
      knit_jobDetails = knitProcess.map((obj: any) => obj?.dataValues?.process?.job_details_garment);
      knit_fabric_gsm = knitProcess.map((obj: any) => obj?.dataValues?.process?.fabric_gsm);
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
            attributes: ["id", "name", "address", 'longitude', 'latitude', 'org_logo', 'org_photo'],
            include: [{
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
        // raw: true, // Return raw data
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
          sales_id: rows.map((obj: any) => obj.dataValues.id),
        },
        attributes: ["id", "fabric_id", "sales_id"],
        include: [{
          model: WeaverProcess,
          as: 'process'
        }]
      });
      jobDetails = weaveProcess.map((obj: any) => obj?.dataValues?.process?.job_details_garment);
      fabric_gsm = weaveProcess.map((obj: any) => obj?.dataValues?.process?.fabric_gsm);
      let weaverYarn = await YarnSelection.findAll({
        where: {
          sales_id: weaveProcess.map((obj: any) => obj?.dataValues?.process?.id),
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
            attributes: ["id", "name", "address", 'longitude', 'latitude', 'org_logo', 'org_photo'],
            include: [{
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
        include: [{
          as: 'spinprocess',
          model: SpinProcess
        }],
        attributes: ["id", "lint_id"],
      });
      blendqty = spinProcess.map((obj: any) => obj?.dataValues?.spinprocess?.dataValues?.cottonmix_qty);
      let blend = spinProcess.map((obj: any) => obj?.dataValues?.spinprocess?.dataValues?.cottonmix_type);
      if (blend.length > 0) {
        blendtype = await CottonMix.findAll({
          attributes: ['id', 'cottonMix_name'],
          where: {
            id: blend.flat()
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
            attributes: ["id", "name", "address", 'longitude', 'latitude', 'org_logo', 'org_photo'],
            include: [{
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
      weaverSales && weaverSales.length > 0
        ? weaverSales
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
    obj.fbrc_job_details = [...new Set([...jobDetails.flat(), ...knit_jobDetails.flat()])];
    obj.fbrc_fabric_gsm = [...new Set([...fabric_gsm.flat(), ...knit_fabric_gsm.flat()])];
    obj.fbrc_name = [...new Set([...knitName, ...weaverName])];
    obj.fbrc_invoice_no = [...new Set([...knitInvoice, ...weaverInvoice])];
    obj.fbrc_lot_no = [...new Set([...knitLot, ...weaverLot])];
    obj.fbrc_reel_lot_no = [...new Set([...knitReelLot, ...weaverReelLot])];
    obj.fbrc_garment_order_ref = [...new Set([...knitGarmentRefNumber, ...weaverGarmentRefNumber])];
    obj.fbrc_brand_order_ref = [...new Set([...knitbrandtRefNumber, ...weaverbrandtRefNumber])];
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
    obj.blendqty = blendqty.flat();
    obj.blendtype = blendtype.flat()
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
          .map((val: any) => { return { ...val?.farmer?.farmGroup.dataValues, district: val?.district.dataValues, state: val?.state.dataValues } })
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
    return res.sendError(res, error.message, error);
  }
};

const exportGarmentTransactionList = async (req: Request, res: Response) => {
  const excelFilePath = path.join("./upload", "Garment_transaction_list.xlsx");

  try {
    const searchTerm = req.query.search || "";
    // Create the excel workbook file
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

    if (!garmentId) {
      return res.sendError(res, "Need Garment Id");
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    worksheet.mergeCells('A1:U1');
    const mergedCell = worksheet.getCell('A1');
    mergedCell.value = 'CottonConnect | Cotton Transaction List';
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.", 'Date', 'Processor Name', 'Garment Order Reference No', 'Brand Order Reference No', 'Invoice Number',
      'Finished Batch/Lot No', 'Total Weight', 'Programme', 'Vehicle No', 'Transaction Via Trader', 'Agent Details'
    ]);
    headerRow.font = { bold: true };
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

    let garment: any = await Promise.all([
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
        order: [
          [
            'id', 'desc'
          ]
        ]
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
        order: [
          [
            'id', 'desc'
          ]
        ]
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
        order: [
          [
            'id', 'desc'
          ]
        ]
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
        order: [
          [
            'id', 'desc'
          ]
        ]
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
        order: [
          [
            'id', 'desc'
          ]
        ]
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
        order: [
          [
            'id', 'desc'
          ]
        ]
      }),
    ]);

    garment = garment.flat();

    // Append data to worksheet
    for await (const [index, item] of garment) {

      const rowValues = Object.values({
        index: index + 1,
        date: item.date ? item.date : '',
        processor_name: item.knitter?.name
          ? item.knitter.name
          : (item.weaver?.name
            ? item.weaver.name
            : (item.dying_fabric?.name
              ? item.dying_fabric.name
              : (item.printing?.name
                ? item.printing.name
                : (item.washing?.name
                  ? item.washing?.name
                  : (item.compacting?.name
                    ? item.compacting?.name
                    : ""))))),
        garment_order_ref: item.garment_order_ref ? item.garment_order_ref : '',
        brand_order_ref: item.brand_order_ref ? item.brand_order_ref : '',
        invoice_no: item.invoice_no ? item.invoice_no : 'N/A',
        batch_lot_no: item.batch_lot_no ? item.batch_lot_no : '',
        total_yarn_qty: item.total_yarn_qty ? item.total_yarn_qty : item.total_fabric_quantity,
        program: item.program?.program_name,
        vehicle_no: item.vehicle_no ? item.vehicle_no : '',
        transaction_via_trader: item.transaction_via_trader === true ? "Yes" : "No",
        agent_details: item.agent_details ? item.agent_details : 'N/A',
      });
      worksheet.addRow(rowValues);
    }
    // Auto-adjust column widths based on content
    worksheet.columns.forEach((column: any) => {
      let maxCellLength = 0;
      column.eachCell({ includeEmpty: true }, (cell: any) => {
        const cellLength = (cell.value ? cell.value.toString() : '').length;
        maxCellLength = Math.max(maxCellLength, cellLength);
      });
      column.width = Math.min(14, maxCellLength + 2); // Limit width to 30 characters
    });

    // Save the workbook
    await workbook.xlsx.writeFile(excelFilePath);
    res.status(200).send({
      success: true,
      messgage: "File successfully Generated",
      data: process.env.BASE_URL + "Garment_transaction_list.xlsx",
    });
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message, error);

  }
};

const getCOCDocumentData = async (
  req: Request, res: Response
) => {
  try {
    const id = req.query.id;
    if (!id)
      return res.sendError(res, "Need Garment Sales Id");

    const cocRes = {
      season: '',
      garmentName: '',
      address: '',
      brandName: '',
      brandLogo: '',
      reelAuthorizationCode: '',
      garmentItemDescription: '',
      frmrFarmGroup: '',
      fbrcProcessor: '',
      fbrcLotNo: '',
      fbrcFabricType: '',
      fbrcNetWeight: '',
      spnrName: '',
      spinnerReelLotNo: '',
      spnrNetWeight: '',
      gnrName: '',
      reelLotno: '',
      gnrTotalQty: '',
      date: '',
      seedCottonQty: 0,
    };

    let [result] = await sequelize.query(`
      SELECT  gts.id                                         as id,
              grm.name                                       as garment_name,
              ss.name                                       as season_name,
              grm.address                                    as address,
              ''                                             as reel_authorization_code,
              br.garment_auth_code_count                     as auth_code_count,
              br.id                                          as brand_id,
              case
                  when br.brand_name is not null
                      then br.brand_name
                  else processor_name
                  end                                        as brand_name,
              case
                  when br.logo is not null
                      then br.logo
                  end                                        as brand_logo,
              array_to_string(gts.style_mark_no, ',')        as garment_style_mark_no,
              array_to_string(gts.garment_type, ',')         as garment_item_description,
              gts.no_of_pieces                               as garment_no_of_pcs,
              array_to_string(array_agg(gs.garment_id), ',') as process_ids
      FROM garment_sales gts
              LEFT JOIN seasons ss on gts.season_id = ss.id
              LEFT JOIN garments grm on gts.garment_id = grm.id
              LEFT JOIN garment_selections gs on gts.id = gs.sales_id
              LEFT JOIN brands br on gts.buyer_id = br.id
      where gts.id = :id
      group by gts.id, grm.id, br.id, ss.id;
    `, {
      replacements: { id },
      type: sequelize.QueryTypes.SELECT,
      raw: true
    });
    if (result) {
      cocRes.season = result.season_name;
      cocRes.garmentName = result.garment_name;
      cocRes.address = result.address;
      cocRes.brandName = result.brand_name;
      cocRes.brandLogo = result.brand_logo;
      cocRes.garmentItemDescription = result.garment_item_description;

      if(result.auth_code_count !== null && result.auth_code_count !== undefined){
        let count = result.auth_code_count || 0;

        cocRes.reelAuthorizationCode = 'REEL'+ result.brand_name + "-00" + (count + 1);
        await Brand.update(
          { garment_auth_code_count: count + 1 },
          { where: { id: result.brand_id } }
        );
      }
    }
    let knitOrWeaData: any;
    if (result.process_ids) {
      [knitOrWeaData] = await sequelize.query(`
      SELECT array_to_string(array_agg(distinct case
                                              when fs.processor = 'knitter' and fs.fabric_id is not null
                                                  then fs.fabric_id
                end), ',')        as knit_sale_ids,
              array_to_string(array_agg(distinct case
                                                      when fs.processor = 'weaver' and fs.fabric_id is not null
                                                          then fs.fabric_id
                  end), ',') as weaver_sale_ids
      FROM garment_processes gp
              LEFT JOIN fabric_selections fs on gp.id = fs.sales_id
      where gp.id IN (:ids);
    `, {
        replacements: { ids: result.process_ids.split(',') },
        type: sequelize.QueryTypes.SELECT,
        raw: true
      });
    }

    const spinSalesIds: any[] = [];
    const salesRes: any = [];
    if (knitOrWeaData.weaver_sale_ids) {
      const weaverSales = await sequelize.query(`
      select  ws.id                                                          as id,
              array_to_string(array_agg(distinct ft."fabricType_name"), ',') as fbrc_fabric_type,
              wr.name                                                        as fbrc_processor,
              array_to_string(array_agg(DISTINCT ws.batch_lot_no), ',')      as fbrc_lot_no,
              ws.total_fabric_length                                         as fbrc_net_weight,
              ws.date                                                        as fbrc_sales_date,
              array_to_string(array_agg(distinct fs.fabric_id), ',')         as wea_process_ids,
              (SUM(ws.total_yarn_qty) / 2)                                   as fbrc_total_yarn_weight
      from weaver_sales ws
              left join weavers wr on wr.id = ws.weaver_id
              left join garments prs on prs.id = ws.buyer_id
              left join weaver_fabric_selections fs on fs.sales_id = ws.id
              left join fabric_types ft on ft.id = any (ws.fabric_type)
      where ws.id in (:ids)
      group by ws.id, wr.id;
      `, {
        replacements: { ids: knitOrWeaData.weaver_sale_ids.split(',') },
        type: sequelize.QueryTypes.SELECT
      });

      salesRes.push(...weaverSales);
    }

    if (knitOrWeaData.knit_sale_ids) {
      const knitSales = await sequelize.query(`
      select  ks.id                                                          as id,
              array_to_string(array_agg(distinct ft."fabricType_name"), ',') as fbrc_fabric_type,
              kr.name                                                        as fbrc_processor,
              array_to_string(array_agg(DISTINCT ks.batch_lot_no), ',')      as fbrc_lot_no,
              ks.total_fabric_weight                                         as fbrc_net_weight,
              ks.date                                                        as fbrc_sales_date,
              array_to_string(array_agg(DISTINCT fs.fabric_id), ',')         as knit_process_ids,
              ks.fabric_type                                                 as fabric_type,
              (SUM(ks.total_yarn_qty) / 2)                                   as fbrc_total_yarn_weight
      from knit_sales ks
              left join knitters kr on kr.id = ks.knitter_id
              left join fabric_types ft on ft.id = any (ks.fabric_type)
              left join knit_fabric_selections fs on fs.sales_id = ks.id
      where ks.id in (:ids)
      group by ks.id, kr.id;
      `, {
        replacements: { ids: knitOrWeaData.knit_sale_ids.split(',') },
        type: sequelize.QueryTypes.SELECT
      });

      salesRes.push(...knitSales);
    }

    const wProcessIds: any[] = [];
    const kProcessIds: any[] = [];
    if (salesRes.length) {
      const fbrcNetWeight: any[] = [];
      for (const sale of salesRes) {

        if (sale.wea_process_ids && !wProcessIds.includes(sale.wea_process_ids))
          wProcessIds.push(sale.wea_process_ids);

        if (sale.knit_process_ids && !kProcessIds.includes(sale.knit_process_ids))
          kProcessIds.push(sale.knit_process_ids);

        if (sale.fbrc_lot_no)
          cocRes.fbrcLotNo = sale.fbrc_lot_no;

        if (sale.fbrc_processor)
          cocRes.fbrcProcessor = sale.fbrc_processor;
        if (sale.fbrc_fabric_type)
          cocRes.fbrcFabricType = sale.fbrc_fabric_type;

        if (sale.fbrc_net_weight)
          fbrcNetWeight.push(sale.fbrc_net_weight);
      }

      cocRes.fbrcNetWeight = fbrcNetWeight.length ? fbrcNetWeight?.join(', ') : '';
    }

    const weaverProcessId = wProcessIds.flatMap((id: any) => id.split(',').map((str: string) => str.trim()))
      .filter(id => id !== '')
      .map(Number)
      .filter(id => !isNaN(id));

    if (weaverProcessId.length) {
      const WeaverProcess = await sequelize.query(`
        select wp.id, array_to_string(array_agg(distinct ys.yarn_id), ',') as spin_sale_ids
        from weaver_processes wp
                left join yarn_selections ys on ys.sales_id = wp.id
        where wp.id in (:ids)
        group by wp.id;
      `, {
        replacements: { ids: weaverProcessId },
        type: sequelize.QueryTypes.SELECT
      });

      WeaverProcess?.forEach((sale: any) => {
        if (!spinSalesIds.includes(sale.spin_sale_ids))
          spinSalesIds.push(sale.spin_sale_ids);
      });
    }

    const knitterProcessId = kProcessIds.flatMap((id: any) => id.split(',').map((str: string) => str.trim()))
      .filter(id => id !== '')
      .map(Number)
      .filter(id => !isNaN(id));

    if (knitterProcessId.length) {
      const KnitProcess = await sequelize.query(`
      select  kp.id, 
              array_to_string(array_agg(distinct kys.yarn_id), ',') as spin_sale_ids
      from knit_processes kp
              left join knit_yarn_selections kys on kys.sales_id = kp.id
      where kp.id in (:ids)
      group by kp.id;
    `, {
        replacements: { ids: knitterProcessId },
        type: sequelize.QueryTypes.SELECT
      });

      KnitProcess?.forEach((sale: any) => {
        if (!spinSalesIds.includes(sale.spin_sale_ids))
          spinSalesIds.push(sale.spin_sale_ids);
      });
    }

    const spinnerSalesId = spinSalesIds.flatMap((id: any) => id.split(',').map((str: string) => str.trim()))
      .filter(id => id !== '')
      .map(Number)
      .filter(id => !isNaN(id));

    let spinSales: any[] = [];
    if (spinnerSalesId.length) {
      spinSales = await sequelize.query(`
      select  ss.id                                                 as id,
              sr.name                                               as spnr_name,
              ss.date                                               as spnr_sale_date,
              ss.total_qty                                          as spnr_net_weight,
              ss.batch_lot_no                                       as spnr_lot_no,
              array_to_string(array_agg(spys.spin_process_id), ',') as process_ids
      from spin_sales ss
              left join yarn_counts yc on yc.id = any (ss.yarn_count)
              left join spinners sr on sr.id = ss.spinner_id
              left join spin_process_yarn_selections spys on spys.sales_id = ss.id
      where ss.id in (:ids)
      group by ss.id, sr.name;
      `, {
        replacements: {
          ids: spinnerSalesId
        },
        type: sequelize.QueryTypes.SELECT
      });
    }

    const lintIds: any[] = [];
    if (spinSales.length) {

      const processIds: any[] = [];
      const spiName: any[] = [];
      const spinLotNo: any[] = [];
      const spinNetWeight: any[] = []
      for (const spinner of spinSales) {
        if (!spiName.includes(spinner.spnr_name))
          spiName.push(spinner.spnr_name);

        if (spinner.spnr_net_weight)
          spinNetWeight.push(spinner.spnr_net_weight);
        spinner?.process_ids?.split(',').forEach((process: any) => {
          if (!processIds.includes(process))
            processIds.push(process);
        });
      }

      const spinnerProcessId = processIds.flatMap((id: any) => id.split(',').map((str: string) => str.trim()))
        .filter(id => id !== '')
        .map(Number)
        .filter(id => !isNaN(id));

      if (spinnerProcessId.length) {
        const spinProcess: any[] = await sequelize.query(`
        select  sp.id,
                sp.reel_lot_no,
                array_to_string(array_agg(distinct ls.lint_id), ',') as lint_ids
        from spin_processes sp
                left join lint_selections ls on sp.id = ls.process_id
        where sp.id in (:ids)
        group by sp.id;
      `, {
          replacements: { ids: spinnerProcessId },
          type: sequelize.QueryTypes.SELECT
        });

        spinProcess?.forEach((sProcess: any) => {
          if (!lintIds.includes(sProcess.lint_ids))
            lintIds.push(sProcess.lint_ids);

          if (!spinLotNo.includes(sProcess.reel_lot_no))
            spinLotNo.push(sProcess.reel_lot_no);

        });
      }
      cocRes.spnrNetWeight = spinNetWeight.length ? spinNetWeight.join(', ') : '';
      cocRes.spinnerReelLotNo = spinLotNo.length ? spinLotNo.join(', ') : '';
      cocRes.spnrName = spiName.length ? spiName.join(', ') : '';
    }

    let ginners: any[] = [];
    const ginnerLintIds = lintIds.flatMap((id: any) => id.split(',').map((str: string) => str.trim()))
    .filter(id => id !== '')
    .map(Number)
    .filter(id => !isNaN(id));

    if (ginnerLintIds.length) {
      ginners = await sequelize.query(`
      select  gs.id                                                   as id,
              gs.reel_lot_no                                          as reel_lotno,
              gs.date                                                 as gnr_sales_date,
              gnr.name                                                as gnr_name,
              gs.total_qty                                            as gnr_total_qty,
              array_to_string(array_agg(distinct gb.process_id), ',') as process_ids
      from gin_sales gs
              left join ginners gnr on gnr.id = gs.ginner_id
              left join spinners prg on prg.id = gs.buyer
              left join bale_selections bs on bs.sales_id = gs.id
              left join "gin-bales" gb on gb.id = bs.bale_id
      where gs.id in (:ids)
      group by bs.sales_id, gs.id, gnr.id;
      `, {
        replacements: {
          ids: ginnerLintIds
        },
        type: sequelize.QueryTypes.SELECT
      });
    }

    const processIds: any[] = [];
    if (ginners.length) {
      const ginLotNo: any[] = [];
      const ginName: any[] = [];
      const gnrTotalQty: any[] = [];
      for (const ginner of ginners) {
        if (ginner.process_ids)
          processIds.push(...ginner.process_ids.split(','));
        if (!ginName.includes(ginner.gnr_name))
          ginName.push(ginner.gnr_name);
        if (ginner.gnr_total_qty)
          gnrTotalQty.push(ginner.gnr_total_qty);

        if (ginner.reel_lotno) {
          const ReelLotNos = ginner.reel_lotno.split(',');
          ReelLotNos.forEach((lotNo: any) => {
            if (!ginLotNo.includes(lotNo))
              ginLotNo.push(lotNo);
          });
        }
      }
      cocRes.gnrTotalQty = gnrTotalQty.length ? gnrTotalQty.join(', ') : '';
      cocRes.reelLotno = ginLotNo.length ? ginLotNo.join(', ') : '';
      cocRes.gnrName = ginName.length ? ginName.join(', ') : '';
    }
    const ginnerProcessIds = processIds.flatMap((id: any) => id.split(',').map((str: string) => str.trim()))
    .filter(id => id !== '')
    .map(Number)
    .filter(id => !isNaN(id));

    if (ginnerProcessIds.length) {
      const ginProcess = await sequelize.query(`
      select  gp.id,
       gp.total_qty as seed_cotton_qty,
              array_to_string(array_agg(distinct cs.transaction_id), ',') as transaction_ids
      from gin_processes gp
              left join "gin-bales" gb on gp.id = gb.process_id
              left join cotton_selections cs on gp.id = cs.process_id
      where gp.id in (:ids)
      group by gp.id;
      `, {
        replacements: {
          ids: ginnerProcessIds
        },
        type: sequelize.QueryTypes.SELECT
      });

      let totalSeedCottonQty = 0;

        for (const process of ginProcess) {
          totalSeedCottonQty += process.seed_cotton_qty || 0;
        }
      cocRes.seedCottonQty = totalSeedCottonQty;

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
    return res.sendError(res, error.message, error);
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
    const garmentSale = await GarmentSales.update(
      {
        coc_doc: cocDoc
      },
      {
        where: {
          id
        },
      }
    );

    return res.sendSuccess(res, garmentSale);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message, error);
  }
}

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
  garmentTraceabilityMap,
  exportGarmentTransactionList,
  getCOCDocumentData,
  updateCOCDoc,
};
