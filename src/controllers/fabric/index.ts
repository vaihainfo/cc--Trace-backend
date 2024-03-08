import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import sequelize from "../../util/dbConn";
import * as ExcelJS from "exceljs";
import * as fs from "fs";
import * as path from "path";
import WeaverSales from "../../models/weaver-sales.model";
import KnitSales from "../../models/knit-sales.model";
import Program from "../../models/program.model";
import Weaver from "../../models/weaver.model";
import Knitter from "../../models/knitter.model";
import Fabric from "../../models/fabric.model";
import DyingSales from "../../models/dying-sales.model";
import DyingFabricSelection from "../../models/dying-fabric-selection.model";
import Season from "../../models/season.model";
import Garment from "../../models/garment.model";
import WashingSales from "../../models/washing-sales.model";
import PrintingSales from "../../models/printing-sales.model";
import PrintingFabricSelection from "../../models/printing-fabric-selection.model";
import CompactingSales from "../../models/compacting-sales.model";
import CompactingFabricSelections from "../../models/compacting-fabric-selection.model";
import WashingFabricSelection from "../../models/washing-fabric-selection.model";
import KnitFabricSelection from "../../models/knit-fabric-selectiion.model";
import KnitProcess from "../../models/knit-process.model";
import WeaverFabricSelection from "../../models/weaver-fabric-selection.model";
import WeaverProcess from "../../models/weaver-process.model";
import { encrypt, generateOnlyQrCode } from "../../provider/qrcode";

/**
 * Dying Dashboard for fabric
 */

// Get Sold Transaction for Dying Dashboard
const fetchDyingTransactions = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let fabricId = req.query.fabricId || "";
    const searchTerm = req.query.search || "";

    if (!fabricId) {
      return res.sendError(res, "Need Fabric Id");
    }

    let baseQuery: any = `SELECT
        'weaver' AS "type",
        "weaver_sales"."id", 
        "weaver_sales"."weaver_id", 
        "weaver_sales"."season_id", 
        "weaver_sales"."date",
        "weaver_sales"."program_id", 
        "weaver_sales"."brand_order_ref",
        "weaver_sales"."garment_order_ref", 
        "weaver_sales"."buyer_id",  
        "weaver_sales"."transaction_via_trader", 
        "weaver_sales"."transaction_agent", 
        "weaver_sales"."batch_lot_no", 
        "weaver_sales"."total_yarn_qty",
        "weaver_sales"."total_fabric_length", 
        "weaver_sales"."invoice_no", 
        "weaver_sales"."invoice_file", 
        "weaver_sales"."vehicle_no",
        "weaver_sales"."qty_stock", 
        "weaver_sales"."qr", 
        "program"."id" AS "program-id", 
        "program"."program_name" AS "program_name",
        "weaver"."id" AS "processor-id", 
        "weaver"."name" AS "processor_name"
    FROM 
        "weaver_sales" AS "weaver_sales" 
    LEFT OUTER JOIN 
        "programs" AS "program" ON "weaver_sales"."program_id" = "program"."id"
    LEFT OUTER JOIN 
        "weavers" AS "weaver" ON "weaver_sales"."weaver_id" = "weaver"."id" 
    WHERE 
        "weaver_sales"."buyer_type" = 'Dyeing' 
        AND "weaver_sales"."status" = 'Sold' 
        AND "weaver_sales"."fabric_id" = '${fabricId}'
        AND (
            "weaver_sales"."invoice_no" ILIKE '%${searchTerm}%'
            OR "weaver_sales"."vehicle_no" ILIKE '%${searchTerm}%'
            OR "weaver_sales"."batch_lot_no" ILIKE '%${searchTerm}%'
            OR "weaver_sales"."transaction_agent" ILIKE '%${searchTerm}%'
            OR "weaver_sales"."brand_order_ref" ILIKE '%${searchTerm}%'
            OR "weaver_sales"."garment_order_ref" ILIKE '%${searchTerm}%'
            OR "weaver"."name" ILIKE '%${searchTerm}%'
            OR "program"."program_name" ILIKE '%${searchTerm}%'
        )
    UNION ALL 
    SELECT
        'knitter' AS "type",
        "knit_sales"."id", 
        "knit_sales"."knitter_id", 
        "knit_sales"."season_id", 
        "knit_sales"."date", 
        "knit_sales"."program_id", 
        "knit_sales"."brand_order_ref",
        "knit_sales"."garment_order_ref", 
        "knit_sales"."buyer_id", 
        "knit_sales"."transaction_via_trader", 
        "knit_sales"."transaction_agent", 
        "knit_sales"."batch_lot_no", 
        "knit_sales"."total_yarn_qty", 
        "knit_sales"."total_fabric_weight", 
        "knit_sales"."invoice_no", 
        "knit_sales"."invoice_file", 
        "knit_sales"."vehicle_no", 
        "knit_sales"."qty_stock", 
        "knit_sales"."qr", 
        "program"."id" AS "program-id", 
        "program"."program_name" AS "program_name",
        "knitter"."id" AS "processor-id", 
        "knitter"."name" AS "processor_name"
    FROM 
        "knit_sales" AS "knit_sales" 
    LEFT OUTER JOIN 
        "programs" AS "program" ON "knit_sales"."program_id" = "program"."id" 
    LEFT OUTER JOIN 
        "knitters" AS "knitter" ON "knit_sales"."knitter_id" = "knitter"."id" 
    WHERE  
        "knit_sales"."buyer_type" = 'Dyeing' 
        AND "knit_sales"."status" = 'Sold' 
        AND "knit_sales"."fabric_id" = '${fabricId}'
        AND (
            -- Add conditions for search here
            "knit_sales"."invoice_no" ILIKE '%${searchTerm}%'
            OR "knit_sales"."vehicle_no" ILIKE '%${searchTerm}%'
            OR "knit_sales"."transaction_agent" ILIKE '%${searchTerm}%'
            OR "knit_sales"."brand_order_ref" ILIKE '%${searchTerm}%'
            OR "knit_sales"."garment_order_ref" ILIKE '%${searchTerm}%'
            OR "knit_sales"."batch_lot_no" ILIKE '%${searchTerm}%'
            OR "knitter"."name" ILIKE '%${searchTerm}%'
            OR "program"."program_name" ILIKE '%${searchTerm}%'
            -- Add more fields as needed
        )`;

    // Get total count
    const countQuery: any = await sequelize.query(
      `SELECT COUNT(*) AS count FROM (${baseQuery}) AS subquery`
    );
    const totalCount = Number(countQuery[0][0]?.count);

    let data: any = await sequelize.query(`${baseQuery}
        OFFSET ${offset}   
        LIMIT ${limit}`);

    // return res.sendPaginationSuccess(res, data[1].rows, data[1].rowCount);
    return res.sendPaginationSuccess(res, data[1]?.rows, totalCount);
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

// Get Pending Transaction for Dying Dashboard
const fetchDyingTransactionsAll = async (req: Request, res: Response) => {
  try {
    let { fabricId }: any = req.query;
    if (!fabricId) {
      return res.sendError(res, "Need Fabric Id");
    }

    let include = [
      {
        model: Program,
        as: "program",
      },
    ];
    let result: any = await Promise.all([
      WeaverSales.findAll({
        where: {
          status: "Pending for QR scanning",
          buyer_type: "Dyeing",
          fabric_id: fabricId,
        },
        include: [
          ...include,
          { model: Weaver, as: "weaver", attributes: ["id", "name"] },
        ],
      }),
      KnitSales.findAll({
        where: {
          status: "Pending for QR scanning",
          buyer_type: "Dyeing",
          fabric_id: fabricId,
        },
        include: [
          ...include,
          { model: Knitter, as: "knitter", attributes: ["id", "name"] },
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

//Updating the status of the transaction
const updateTransactionStatus = async (req: Request, res: Response) => {
  try {
    let trans: any = [];
    for await (let obj of req.body.items) {
      const data: any = {
        status: obj.status,
        accept_date: obj.status === "Sold" ? new Date().toISOString() : null,
      };
      if (obj.knitter_id) {
        const transaction = await KnitSales.update(data, {
          where: {
            id: obj.id,
          },
        });
        trans.push(transaction);
      } else {
        const transaction = await WeaverSales.update(data, {
          where: {
            id: obj.id,
          },
        });
        trans.push(transaction);
      }
    }

    res.sendSuccess(res, trans);
  } catch (error) {
    console.log(error);
    return res.sendError(res, "NOT_ABLE_TO_UPDATE");
  }
};

const getProgram = async (req: Request, res: Response) => {
  try {
    let fabricId = req.query.fabricId;
    if (!fabricId) {
      return res.sendError(res, "Need Fabric Id");
    }

    let result = await Fabric.findOne({ where: { id: fabricId } });
    if (!result) {
      return res.sendError(res, "Program not found");
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

//creating a Dying process/sale
const createDyingProcess = async (req: Request, res: Response) => {
  try {
    // let uniqueFilename = `dying_sales_qrcode_${Date.now()}.png`;
    // let aa = await generateOnlyQrCode(`Test`, uniqueFilename);
    const data = {
      dying_id: req.body.fabricId,
      program_id: req.body.programId,
      season_id: req.body.seasonId,
      date: req.body.date,
      brand_order_ref: req.body.brandOrderRef,
      garment_order_ref: req.body.garmentOrderRef,
      buyer_type: req.body.buyerType,
      buyer_id: req.body.buyerId,
      fabric_id: req.body.buyerFabricId,
      processor_name: req.body.processorName,
      processor_address: req.body.processorAddress,
      fabric_quantity: req.body.fabricQuantity,
      old_fabric_quantity: req.body.oldFabricQuantity,
      add_fabric_quantity: req.body.addFabricQuantity,
      total_fabric_quantity: req.body.totalFabricQuantity,
      fabric_type: req.body.fabricType,
      fabric_length: req.body.fabricLength,
      gsm: req.body.fabricGsm,
      fabric_net_weight: req.body.fabricNetWeight,
      batch_lot_no: req.body.batchLotNo,
      job_details: req.body.jobDetails,
      dying_details: req.body.dyingDetails,
      dying_color: req.body.dyingColor,
      invoice_no: req.body.invoiceNo,
      weight_gain: req.body.weightGain,
      weight_loss: req.body.weightLoss,
      bill_of_lading: req.body.billOfLadding,
      transport_info: req.body.transportInfo,
      qty_stock: req.body.totalFabricQuantity,
      order_details: req.body.orderDetails,
      dye_invoice: req.body.dyeInvoice,
      invoice_files: req.body.invoiceFiles,
      other_docs: req.body.otherDocs,
      sales_type :  req.body.salesType,
      status: "Pending",
    };
    const sales = await DyingSales.create(data);
    let uniqueFilename = `dying_qrcode_${Date.now()}.png`;
    let da = encrypt(`dying,${sales.id}`);
    let aa = await generateOnlyQrCode(da, uniqueFilename);
    const dying = await DyingSales.update({ qr: uniqueFilename }, {
        where: {
            id: sales.id
        }
    });
    if (req.body.chooseFabric && req.body.chooseFabric.length > 0) {
      for await (let obj of req.body.chooseFabric) {
        if (obj.processor === "Knitter") {
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
        await DyingFabricSelection.create({
          process_id: obj.id,
          process_type: obj.processor,
          sales_id: sales.id,
          qty_used: obj.qtyUsed,
        });
      }
    }
    res.sendSuccess(res, sales);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

//fetch Dying Sales with filters
const fetchDyingSalesPagination = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { fabricId }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { brand_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { garment_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
        { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { dying_details: { [Op.iLike]: `%${searchTerm}%` } },
        { order_details: { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$buyer.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$abuyer.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { status: { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    whereCondition.dying_id = fabricId;
    let include: any = [
      {
        model: Program,
        as: "program",
        attributes: ["id", "program_name"],
      },
      {
        model: Season,
        as: "season",
        attributes: ["id", "name"],
      },
      {
        model: Fabric,
        as: "dying_fabric",
        attributes: ["id", "name"],
      },
      {
        model: Fabric,
        as: "abuyer",
        attributes: ["id", "name"],
      },
      {
        model: Garment,
        as: "buyer",
        attributes: ["id", "name"],
      },
    ];
    //fetch data with pagination
    if (req.query.pagination === "true") {
      const { count, rows } = await DyingSales.findAndCountAll({
        where: whereCondition,
        include: include,
        order: [["id", "desc"]],
        offset: offset,
        limit: limit,
      });
      return res.sendPaginationSuccess(res, rows, count);
    } else {
      const gin = await DyingSales.findAll({
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

//export Dying process data
const exportDyingProcess = async (req: Request, res: Response) => {
  const excelFilePath = path.join("./upload", "export-dying-process.xlsx");

  try {
    const whereCondition: any = {};
    const searchTerm = req.query.search || "";
    if (searchTerm) {
      whereCondition[Op.or] = [
        { brand_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { garment_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
        { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$buyer.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$abuyer.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { status: { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    whereCondition.dying_id = req.query.fabricId;
    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    worksheet.mergeCells("A1:K1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Process/Sale";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.",
      "Date",
      "Fabric Processor Type",
      "Sold To",
      "Invoice No",
      "	Batch/Lot No",
      "Dyed Fabric Quantity",
      "Length in Mts",
      "GSM",
      "Fabric Net Weight (Kgs)",
      "Program",
    ]);
    headerRow.font = { bold: true };
    let include: any = [
      {
        model: Program,
        as: "program",
        attributes: ["id", "program_name"],
      },
      {
        model: Season,
        as: "season",
        attributes: ["id", "name"],
      },
      {
        model: Fabric,
        as: "dying_fabric",
        attributes: ["id", "name"],
      },
      {
        model: Fabric,
        as: "abuyer",
        attributes: ["id", "name"],
      },
      {
        model: Garment,
        as: "buyer",
        attributes: ["id", "name"],
      },
    ];
    const sales = await DyingSales.findAll({
      where: whereCondition,
      include: include,
    });
    // Append data to worksheet
    for await (const [index, item] of sales.entries()) {
      const rowValues = Object.values({
        index: index + 1,
        date: item.date ? item.date : "",
        buyer_type: item.buyer_type ?? "",
        buyer: item.buyer
          ? item.buyer.name
          : item.abuyer
          ? item.abuyer.name
          : item.processor_name,
        invoice: item.invoice_no ? item.invoice_no : "",
        order: item.batch_lot_no ? item.batch_lot_no : "",
        qty: item.total_fabric_quantity ? item.total_fabric_quantity : "",
        length: item.fabric_length ? item.fabric_length : "",
        gsm: item.gsm ? item.gsm : "",
        fabric_net_weight: item.fabric_net_weight ? item.fabric_net_weight : "",
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
    res.status(200).send({
      success: true,
      messgage: "File successfully Generated",
      data: process.env.BASE_URL + "export-dying-process.xlsx",
    });
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

//choosing the Dying fabric data
const chooseDyingFabric = async (req: Request, res: Response) => {
  try {
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
    }: any = req.query;
    const knitterWhere: any = {};
    const weaverWhere: any = {};
    let whereCondition: any = {};

    let { fabricId }: any = req.query;
    if (!fabricId) {
      return res.sendError(res, "Need Fabric Id");
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

    if(weaverId && knitterId){
      const idArrayKnit: number[] = knitterId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      knitterWhere.knitter_id = { [Op.in]: idArrayKnit };
  
      const idArrayWeav: number[] = weaverId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      weaverWhere.weaver_id = { [Op.in]: idArrayWeav };
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
    // if (lotNo) {
    //   const idArray: any[] = lotNo.split(",").map((id: any) => id);
    //   whereCondition.batch_lot_no = { [Op.in]: idArray };
    // }

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
          buyer_type: "Dyeing",
          fabric_id: fabricId,
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
          buyer_type: "Dyeing",
          fabric_id: fabricId,
          qty_stock: { [Op.gt]: 0 },
          ...whereCondition,
          ...knitterWhere,
        },
        include: [
          ...include,
          { model: Knitter, as: "knitter", attributes: ["id", "name"] },
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

//deleting the Dying fabric data
const deleteDyingProcess = async (req: Request, res: Response) => {
  try {
    const deletedDying = await DyingSales.destroy({
      where: {
        id: req.body.id,
        status: "Pending",
      },
    });

    return res.sendSuccess(res, deletedDying);
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

/**
 * Washing Dashboard for fabric
 */

// Get SOld Transaction for Washing Dashboard
const fetchWashingTransactions = async (req: Request, res: Response) => {
  try {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    let whereCondition: any = {};
    let weaverWhere: any = {};
    let knitterWhere: any = {};
    let dyingWhere: any = {};

    let { fabricId }: any = req.query;
    if (!fabricId) {
      return res.sendError(res, "Need Fabric Id");
    }

    if (searchTerm) {
      whereCondition = [
        // Search by order ref
        { garment_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { brand_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { processor_name: { [Op.iLike]: `%${searchTerm}%` } },
        { processor_address: { [Op.iLike]: `%${searchTerm}%` } },
      ];

      weaverWhere[Op.or] = [
        ...whereCondition,
        { "$weaver.name$": { [Op.iLike]: `%${searchTerm}%` } }
      ];

      knitterWhere[Op.or] = [
        ...whereCondition,
        { "$knitter.name$": { [Op.iLike]: `%${searchTerm}%` } }
      ];

      dyingWhere[Op.or] = [
        ...whereCondition,
        { "$abuyer.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$dying_fabric.name$": { [Op.iLike]: `%${searchTerm}%` } }
      ];
    }

    let include = [
      {
        model: Program,
        as: "program",
      },
      {
        model: Season,
        as: "season",
      },
    ];

    let result: any = await Promise.all([
      WeaverSales.findAll({
        where: {
          status: "Sold",
          buyer_type: "Washing",
          fabric_id: fabricId,
          ...weaverWhere,
        //   [Op.or]: [{ "$weaver.name$": { [Op.iLike]: `%${searchTerm}%` } }],
        },
        include: [
          ...include,
          { model: Weaver, as: "weaver", attributes: ["id", "name"] },
        ],
      }),
      KnitSales.findAll({
        where: {
          status: "Sold",
          buyer_type: "Washing",
          fabric_id: fabricId,
          ...knitterWhere,
        //   [Op.or]: [{ "$knitter.name$": { [Op.iLike]: `%${searchTerm}%` } }],
        },
        include: [
          ...include,
          { model: Knitter, as: "knitter", attributes: ["id", "name"] },
        ],
      }),
      DyingSales.findAll({
        where: {
          status: "Sold",
          buyer_type: "Washing",
          fabric_id: fabricId,
          ...dyingWhere,
        //   [Op.or]: [
        //     { "$dying_fabric.name$": { [Op.iLike]: `%${searchTerm}%` } },
        //   ],
        },
        include: [
          ...include,
          { model: Fabric, as: "abuyer", attributes: ["id", "name"] },
          { model: Fabric, as: "dying_fabric", attributes: ["id", "name"] },
        ],
      }),
    ]);
    let abc: any = result.flat();

    // Apply pagination to the combined result
    let data = abc.slice(offset, offset + limit);
    return res.sendPaginationSuccess(res, data, abc?.length);

    return res.sendSuccess(res, abc);
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

// Get Pending Transaction for Washing Dashboard
const fetchWashingTransactionsAll = async (req: Request, res: Response) => {
  try {
    let { fabricId }: any = req.query;
    if (!fabricId) {
      return res.sendError(res, "Need Fabric Id");
    }

    let include = [
      {
        model: Program,
        as: "program",
      },
    ];

    let result: any = await Promise.all([
      WeaverSales.findAll({
        where: {
          status: "Pending for QR scanning",
          buyer_type: "Washing",
          fabric_id: fabricId,
        },
        include: [
          ...include,
          { model: Weaver, as: "weaver", attributes: ["id", "name"] },
        ],
      }),
      KnitSales.findAll({
        where: {
          status: "Pending for QR scanning",
          buyer_type: "Washing",
          fabric_id: fabricId,
        },
        include: [
          ...include,
          { model: Knitter, as: "knitter", attributes: ["id", "name"] },
        ],
      }),
      DyingSales.findAll({
        where: {
          status: "Pending",
          buyer_type: "Washing",
          fabric_id: fabricId,
        },
        include: [
          ...include,
          { model: Fabric, as: "abuyer", attributes: ["id", "name"] },
          { model: Fabric, as: "dying_fabric", attributes: ["id", "name"] },
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

//Updating the status of the transaction
const updateWashingTransactionStatus = async (req: Request, res: Response) => {
  try {
    let trans: any = [];
    for await (let obj of req.body.items) {
      const data: any = {
        status: obj.status,
        accept_date: obj.status === "Sold" ? new Date().toISOString() : null,
      };
      if (obj.knitter_id) {
        const transaction = await KnitSales.update(data, {
          where: {
            id: obj.id,
          },
        });
        trans.push(transaction);
      } else if (obj.weaver_id) {
        const transaction = await WeaverSales.update(data, {
          where: {
            id: obj.id,
          },
        });
        trans.push(transaction);
      } else if (obj.dying_id) {
        const transaction = await DyingSales.update(data, {
          where: {
            id: obj.id,
          },
        });
        trans.push(transaction);
      }
    }

    res.sendSuccess(res, trans);
  } catch (error) {
    console.log(error);
    return res.sendError(res, "NOT_ABLE_TO_UPDATE");
  }
};

//creating a Washing process/sale
const createWashingProcess = async (req: Request, res: Response) => {
  try {
    // let uniqueFilename = `dying_sales_qrcode_${Date.now()}.png`;
    // let aa = await generateOnlyQrCode(`Test`, uniqueFilename);
    if (!req.body.washingId) {
      return res.sendError(res, "Need Washing Id");
    }

    const data = {
      washing_id: req.body.washingId,
      program_id: req.body.programId,
      season_id: req.body.seasonId,
      date: req.body.date,
      brand_order_ref: req.body.brandOrderRef,
      garment_order_ref: req.body.garmentOrderRef,
      buyer_type: req.body.buyerType,
      buyer_id: req.body.buyerId,
      fabric_id: req.body.buyerFabricId,
      processor_name: req.body.processorName,
      processor_address: req.body.processorAddress,
      fabric_quantity: req.body.fabricQuantity,
      old_fabric_quantity: req.body.oldFabricQuantity,
      add_fabric_quantity: req.body.addFabricQuantity,
      total_fabric_quantity: req.body.totalFabricQuantity,
      fabric_type: req.body.fabricType,
      fabric_length: req.body.fabricLength,
      gsm: req.body.fabricGsm,
      fabric_net_weight: req.body.fabricNetWeight,
      batch_lot_no: req.body.batchLotNo,
      job_details: req.body.jobDetails,
      order_details: req.body.orderDetails,
      wash_type: req.body.wash_type,
      weight_gain: req.body.weightGain,
      weight_loss: req.body.weightLoss,
      washing_details: req.body.washingDetails,
      invoice_no: req.body.invoiceNo,
      bill_of_lading: req.body.billOfLadding,
      transport_info: req.body.transportInfo,
      qty_stock: req.body.totalFabricQuantity,
      invoice_files: req.body.invoiceFiles,
      other_docs: req.body.otherDocs,
      sales_type :  req.body.salesType,
      status: "Pending",
    };
    const sales = await WashingSales.create(data);
    let uniqueFilename = `washing_qrcode_${Date.now()}.png`;
    let da = encrypt(`washing,${sales.id}`);
    let aa = await generateOnlyQrCode(da, uniqueFilename);
    const washing = await WashingSales.update({ qr: uniqueFilename }, {
        where: {
            id: sales.id
        }
    });
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
        } else {
          let update = await DyingSales.update(
            { qty_stock: obj.totalQty - obj.qtyUsed },
            { where: { id: obj.id } }
          );
        }
        await WashingFabricSelection.create({
          process_id: obj.id,
          process_type: obj.processor,
          sales_id: sales.id,
          qty_used: obj.qtyUsed,
        });
      }
    }
    res.sendSuccess(res, sales);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};
//fetch the Washing process/sale data
const fetchWashingSalesPagination = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { fabricId }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { brand_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { garment_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
        { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$washing.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$buyer.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$abuyer.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { status: { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    whereCondition.washing_id = fabricId;
    let include: any = [
      {
        model: Program,
        as: "program",
        attributes: ["id", "program_name"],
      },
      {
        model: Season,
        as: "season",
        attributes: ["id", "name"],
      },
      {
        model: Fabric,
        as: "washing",
        attributes: ["id", "name"],
      },
      {
        model: Fabric,
        as: "abuyer",
        attributes: ["id", "name"],
      },
      {
        model: Garment,
        as: "buyer",
        attributes: ["id", "name"],
      },
    ];
    //fetch data with pagination
    if (req.query.pagination === "true") {
      const { count, rows } = await WashingSales.findAndCountAll({
        where: whereCondition,
        include: include,
        order: [["id", "desc"]],
        offset: offset,
        limit: limit,
      });
      return res.sendPaginationSuccess(res, rows, count);
    } else {
      const gin = await WashingSales.findAll({
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

//choosing the washing fabric data
const chooseWashingFabric = async (req: Request, res: Response) => {
  try {
    let {
      programId,
      garmentOrderRef,
      brandOrderRef,
      lotNo,
      weaverId,
      knitterId,
      dyingId,
    }: any = req.query;
    const knitterWhere: any = {};
    const weaverWhere: any = {};
    const dyingWhere: any = {};
    let whereCondition: any = {};
    let { fabricId }: any = req.query;
    if (!fabricId) {
      return res.sendError(res, "Need Fabric Id");
    }
    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.program_id = { [Op.in]: idArray };
    }


        // Helper function to add conditions based on filter values
        const addFilterCondition = (whereObj: any, filterKey: string, arr: any ) => {
          let idArray:number[] = arr ? arr.split(",").map((id: any) => parseInt(id, 10)) : [0];
          if (idArray && idArray.length > 0) {
              whereObj[filterKey] = { [Op.in]: idArray };
          } else {
              // If no filter value provided, set an impossible condition to filter out all data
              whereObj[filterKey] = { [Op.in]: [0] };
          }
      };
    
      // Dynamically add conditions for each filter
      if(knitterId || weaverId || dyingId){
          addFilterCondition(knitterWhere, 'knitter_id', knitterId);
          addFilterCondition(weaverWhere, 'weaver_id', weaverId);
          addFilterCondition(dyingWhere, 'dying_id', dyingId);
      }

    if (garmentOrderRef) {
      const idArray: any[] = garmentOrderRef.split(",").map((id: any) => id);
      whereCondition.garment_order_ref = { [Op.in]: idArray };
    }
    if (brandOrderRef) {
      const idArray: any[] = brandOrderRef.split(",").map((id: any) => id);
      whereCondition.brand_order_ref = { [Op.in]: idArray };
    }
    // if (lotNo) {
    //   const idArray: any[] = lotNo.split(",").map((id: any) => id);
    //   whereCondition.batch_lot_no = { [Op.in]: idArray };
    // }

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
    ];

    let result: any = await Promise.all([
      WeaverSales.findAll({
        where: {
          ...whereCondition,
          ...weaverWhere,
          status: "Sold",
          buyer_type: "Washing",
          fabric_id: fabricId,
          qty_stock: { [Op.gt]: 0 },
        },
        include: [
          ...include,
          { model: Weaver, as: "weaver", attributes: ["id", "name"] },
        ],
      }),
      KnitSales.findAll({
        where: {
          ...whereCondition,
          ...knitterWhere,
          status: "Sold",
          buyer_type: "Washing",
          fabric_id: fabricId,
          qty_stock: { [Op.gt]: 0 },
        },
        include: [
          ...include,
          { model: Knitter, as: "knitter", attributes: ["id", "name"] },
        ],
      }),
      DyingSales.findAll({
        where: {
          ...whereCondition,
          ...dyingWhere,
          status: "Sold",
          buyer_type: "Washing",
          fabric_id: fabricId,
          qty_stock: { [Op.gt]: 0 },
        },
        include: [
          ...include,
          { model: Fabric, as: "abuyer", attributes: ["id", "name"] },
          { model: Fabric, as: "dying_fabric", attributes: ["id", "name"] },
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

//Export the washing sales data
const exportWashingProcess = async (req: Request, res: Response) => {
  const excelFilePath = path.join("./upload", "export-washing-process.xlsx");

  try {
    const whereCondition: any = {};
    const searchTerm = req.query.search || "";
    if (searchTerm) {
      whereCondition[Op.or] = [
        { brand_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { garment_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
        { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$washing.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$buyer.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$abuyer.name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    whereCondition.washing_id = req.query.fabricId;
    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    worksheet.mergeCells("A1:K1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Process/Sale";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.",
      "Date",
      "Fabric Processor Type",
      "Sold To",
      "Invoice No",
      "	Batch/Lot No",
      "Washed Fabric Quantity",
      "Length in Mts",
      "GSM",
      "Fabric Net Weight (Kgs)",
      "Program",
    ]);
    headerRow.font = { bold: true };
    let include: any = [
      {
        model: Program,
        as: "program",
      },
      {
        model: Season,
        as: "season",
      },
      {
        model: Fabric,
        as: "washing",
      },
      {
        model: Fabric,
        as: "abuyer",
      },
      {
        model: Garment,
        as: "buyer",
      },
    ];
    const sales = await WashingSales.findAll({
      where: whereCondition,
      include: include,
    });
    // Append data to worksheet
    for await (const [index, item] of sales.entries()) {
      const rowValues = Object.values({
        index: index + 1,
        date: item.date ? item.date : "",
        buyer_type: item.buyer_type ?? "",
        buyer: item.buyer
          ? item.buyer.name
          : item.abuyer
          ? item.abuyer.name
          : item.processor_name,
        invoice: item.invoice_no ? item.invoice_no : "",
        order: item.batch_lot_no ? item.batch_lot_no : "",
        qty: item.total_fabric_quantity ? item.total_fabric_quantity : "",
        length: item.fabric_length ? item.fabric_length : "",
        gsm: item.gsm ? item.gsm : "",
        fabric_net_weight: item.fabric_net_weight ? item.fabric_net_weight : "",
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
    res.status(200).send({
      success: true,
      messgage: "File successfully Generated",
      data: process.env.BASE_URL + "export-washing-process.xlsx",
    });
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

//deleting the Washing fabric data
const deleteWashingProcess = async (req: Request, res: Response) => {
  try {
    const deletedWashing = await WashingSales.destroy({
      where: {
        id: req.body.id,
        status: "Pending",
      },
    });

    return res.sendSuccess(res, deletedWashing);
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

/**
 * Printing Dashboard for fabric
 */

// Get Pending Transaction for Printing Transaction
const fetchPrintingTransactions = async (req: Request, res: Response) => {
  try {
    let fabricId = req.query.fabricId || "";
    if (!fabricId) {
      return res.sendError(res, "Need Fabric Id");
    }

    let include = [
      {
        model: Program,
        as: "program",
      },
    ];
    let data = await WashingSales.findAll({
      where: { status: "Pending", buyer_type: "Printing", fabric_id: fabricId },
      include: [
        ...include,
        { model: Fabric, as: "washing", attributes: ["id", "name"] },
      ],
    });

    res.sendSuccess(res, data);
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

// Get Sold Transaction for Printing Transaction
const fetchPrintingTransactionSold = async (req: Request, res: Response) => {
  try {
    let fabricId = req.query.fabricId || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const searchTerm = req.query.search || "";
    let whereCondition: any = {};

    if (!fabricId) {
      return res.sendError(res, "Need Fabric Id");
    }
    if (searchTerm) {
      whereCondition[Op.or] = [
        // Search by order ref
        { "$washing.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { garment_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { brand_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { processor_name: { [Op.iLike]: `%${searchTerm}%` } },
        { processor_address: { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }

    let include = [
      {
        model: Program,
        as: "program",
      },
    ];
    let { rows, count } = await WashingSales.findAndCountAll({
      where: {
        status: "Sold",
        buyer_type: "Printing",
        fabric_id: fabricId,
        ...whereCondition,
      },
      include: [
        ...include,
        { model: Fabric, as: "washing", attributes: ["id", "name"] },
      ],
      offset: offset,
      limit: limit,
    });

    res.sendPaginationSuccess(res, rows, count);
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

// Update the status of the transaction for printing dashboard
const updatePrintingTransactionStatus = async (req: Request, res: Response) => {
  try {
    let trans: any = [];
    for await (let obj of req.body.items) {
      const data: any = {
        status: obj.status,
        accept_date: obj.status === "Sold" ? new Date().toISOString() : null,
      };

      const transaction = await WashingSales.update(data, {
        where: {
          id: obj.id,
        },
      });
      trans.push(transaction);
    }

    res.sendSuccess(res, trans);
  } catch (error) {
    console.log(error);
    return res.sendError(res, "NOT_ABLE_TO_UPDATE");
  }
};

//creating a printing process
const createPrintingProcess = async (req: Request, res: Response) => {
  try {
    // let uniqueFilename = `dying_sales_qrcode_${Date.now()}.png`;
    // let aa = await generateOnlyQrCode(`Test`, uniqueFilename);
    if (!req.body.printingFabricId) {
      return res.sendError(res, "Need Printing Id");
    }

    const data = {
      printing_id: req.body.printingFabricId,
      program_id: req.body.programId,
      season_id: req.body.seasonId,
      date: req.body.date,
      brand_order_ref: req.body.brandOrderRef,
      garment_order_ref: req.body.garmentOrderRef,
      buyer_type: req.body.buyerType,
      buyer_id: req.body.buyerId,
      fabric_id: req.body.fabricId,
      processor_name: req.body.processorName,
      processor_address: req.body.processorAddress,
      fabric_quantity: req.body.fabricQuantity,
      old_fabric_quantity: req.body.oldFabricQuantity,
      add_fabric_quantity: req.body.addFabricQuantity,
      total_fabric_quantity: req.body.totalFabricQuantity,
      fabric_type: req.body.fabricType,
      fabric_length: req.body.fabricLength,
      gsm: req.body.fabricGsm,
      fabric_net_weight: req.body.fabricNetWeight,
      batch_lot_no: req.body.batchLotNo,
      job_details: req.body.jobDetails,
      order_details: req.body.orderDetails,
      printing_details: req.body.printingDetails,
      printing_pattern: req.body.printingPattern,
      print_type: req.body.printType,
      upload_patter_from_garment: req.body.uploadPatterFromGarment,
      weight_gain: req.body.weightGain,
      weight_loss: req.body.weightLoss,
      washing_details: req.body.washingDetails,
      invoice_no: req.body.invoiceNo,
      bill_of_lading: req.body.billOfLadding,
      transport_info: req.body.transportInfo,
      qty_stock: req.body.totalFabricQuantity,
      invoice_files: req.body.invoiceFiles,
      other_docs: req.body.otherDocs,
      sales_type :  req.body.salesType,
      status: "Pending",
    };
    const sales = await PrintingSales.create(data);
    let uniqueFilename = `printing_qrcode_${Date.now()}.png`;
    let da = encrypt(`printing,${sales.id}`);
    let aa = await generateOnlyQrCode(da, uniqueFilename);
    const printing = await PrintingSales.update({ qr: uniqueFilename }, {
        where: {
            id: sales.id
        }
    });
    if (req.body.chooseFabric && req.body.chooseFabric.length > 0) {
      for await (let obj of req.body.chooseFabric) {
        let update = await WashingSales.update(
          { qty_stock: obj.totalQty - obj.qtyUsed },
          { where: { id: obj.id } }
        );
        await PrintingFabricSelection.create({
          process_id: obj.id,
          process_type: "washing_sales",
          sales_id: sales.id,
          qty_used: obj.qtyUsed,
        });
      }
    }
    res.sendSuccess(res, sales);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

//fetch the printing process/sale data
const fetchPrintingSalesPagination = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { fabricId }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { brand_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { garment_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
        { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$buyer.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$abuyer.name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    whereCondition.printing_id = fabricId;
    let include: any = [
      {
        model: Program,
        as: "program",
      },
      {
        model: Season,
        as: "season",
      },
      {
        model: Fabric,
        as: "printing",
      },
      {
        model: Fabric,
        as: "abuyer",
      },
      {
        model: Garment,
        as: "buyer",
      },
    ];
    //fetch data with pagination
    if (req.query.pagination === "true") {
      const { count, rows } = await PrintingSales.findAndCountAll({
        where: whereCondition,
        include: include,
        order: [["id", "desc"]],
        offset: offset,
        limit: limit,
      });
      return res.sendPaginationSuccess(res, rows, count);
    } else {
      const gin = await PrintingSales.findAll({
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

//choosing the printing fabric data
const choosePrintingFabric = async (req: Request, res: Response) => {
  try {
    let {
      fabricId,
      programId,
      washingId,
      garmentOrderRef,
      brandOrderRef,
      lotNo,
    }: any = req.query;
    let whereCondition: any = {
      status: "Sold",
      buyer_type: "Printing",
      program_id: programId,
      fabric_id: fabricId,
      qty_stock: { [Op.gt]: 0 },
    };

    if (!fabricId) {
      return res.sendError(res, "Need Fabric Id");
    }
    if (!programId) {
      return res.sendError(res, "Need Program Id");
    }

    if (washingId) {
      const idArray: string[] = washingId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.washing_id = { [Op.in]: idArray };
    }

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.program_id = { [Op.in]: idArray };
    }

    if (garmentOrderRef) {
      const idArray: any[] = garmentOrderRef.split(",").map((id: any) => id);
      whereCondition.garment_order_ref = { [Op.in]: idArray };
    }
    if (brandOrderRef) {
      const idArray: any[] = brandOrderRef.split(",").map((id: any) => id);
      whereCondition.brand_order_ref = { [Op.in]: idArray };
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
    ];

    let result = await WashingSales.findAll({
      where: whereCondition,
      include: [
        ...include,
        { model: Fabric, as: "washing", attributes: ["id", "name"] },
      ],
    });
    return res.sendSuccess(res, result);
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};
//export Printing process data
const exportPrintingProcess = async (req: Request, res: Response) => {
  const excelFilePath = path.join("./upload", "export-printing-process.xlsx");

  try {
    const whereCondition: any = {};
    const searchTerm = req.query.search || "";
    if (searchTerm) {
      whereCondition[Op.or] = [
        { brand_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { garment_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
        { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$buyer.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$abuyer.name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    whereCondition.printing_id = req.query.fabricId;
    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    worksheet.mergeCells("A1:K1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Process/Sale";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.",
      "Date",
      "Fabric Processor Type",
      "Sold To",
      "Invoice No",
      "	Batch/Lot No",
      "Printed Fabric Quantity",
      "Length in Mts",
      "GSM",
      "Fabric Net Weight (Kgs)",
      "Program",
    ]);
    headerRow.font = { bold: true };
    let include: any = [
      {
        model: Program,
        as: "program",
      },
      {
        model: Season,
        as: "season",
      },
      {
        model: Fabric,
        as: "printing",
      },
      {
        model: Fabric,
        as: "abuyer",
      },
      {
        model: Garment,
        as: "buyer",
      },
    ];
    const sales = await PrintingSales.findAll({
      where: whereCondition,
      include: include,
    });
    // Append data to worksheet
    for await (const [index, item] of sales.entries()) {
      const rowValues = Object.values({
        index: index + 1,
        date: item.date ? item.date : "",
        buyer_type: item.buyer_type ?? "",
        buyer: item.buyer
          ? item.buyer.name
          : item.abuyer
          ? item.abuyer.name
          : item.processor_name,
        invoice: item.invoice_no ? item.invoice_no : "",
        order: item.batch_lot_no ? item.batch_lot_no : "",
        qty: item.total_fabric_quantity ? item.total_fabric_quantity : "",
        length: item.fabric_length ? item.fabric_length : "",
        gsm: item.gsm ? item.gsm : "",
        fabric_net_weight: item.fabric_net_weight ? item.fabric_net_weight : "",
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
    res.status(200).send({
      success: true,
      messgage: "File successfully Generated",
      data: process.env.BASE_URL + "export-printing-process.xlsx",
    });
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

//deleting the Washing fabric data
const deletePrintingProcess = async (req: Request, res: Response) => {
  try {
    const deletedPrinting = await PrintingSales.destroy({
      where: {
        id: req.body.id,
        status: "Pending",
      },
    });

    return res.sendSuccess(res, deletedPrinting);
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

/**
 * Compacting Dashboard for fabric
 */

// Get Pending Transaction for Compacting Transaction
const fetchCompactingTransactions = async (req: Request, res: Response) => {
  try {
    let fabricId = req.query.fabricId || "";

    if (!fabricId) {
      return res.sendError(res, "Need Fabric Id");
    }
    let include = [
      {
        model: Program,
        as: "program",
      },
    ];

    let data: any = await Promise.all([
      WashingSales.findAll({
        where: {
          status: "Pending",
          buyer_type: "Compacting",
          fabric_id: fabricId,
        },
        include: [
          ...include,
          { model: Fabric, as: "washing", attributes: ["id", "name"] },
        ],
      }),
      PrintingSales.findAll({
        where: {
          status: "Pending",
          buyer_type: "Compacting",
          fabric_id: fabricId,
        },
        include: [
          ...include,
          { model: Fabric, as: "printing", attributes: ["id", "name"] },
        ],
      }),
      DyingSales.findAll({
        where: {
          status: "Pending",
          buyer_type: "Compacting",
          fabric_id: fabricId,
        },
        include: [
          ...include,
          { model: Fabric, as: "dying_fabric", attributes: ["id", "name"] },
        ],
      }),
    ]);
    res.sendSuccess(res, data.flat());
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

// Get Sold Transaction for Compacting Transaction
const fetchCompactingTransactionSold = async (req: Request, res: Response) => {
  try {
    let fabricId = req.query.fabricId || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const searchTerm = req.query.search || "";

    // let whereCondition: any = {};
    let washingWhere: any = {};
    let printingWhere: any = {};
    let dyingWhere: any = {};
    let whereCondition: any = [
        // Search by order ref
        { garment_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { brand_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { processor_name: { [Op.iLike]: `%${searchTerm}%` } },
        { processor_address: { [Op.iLike]: `%${searchTerm}%` } },
      ];

    if (!fabricId) {
      return res.sendError(res, "Need Fabric Id");
    }

    if (searchTerm) {
        washingWhere[Op.or] = [
        ...whereCondition,
        { "$washing.name$": { [Op.iLike]: `%${searchTerm}%` } }
      ];
      printingWhere[Op.or] = [
        ...whereCondition,
        { "$printing.name$": { [Op.iLike]: `%${searchTerm}%` } }
      ];
      dyingWhere[Op.or] = [
        ...whereCondition,
        { "$dying_fabric.name$": { [Op.iLike]: `%${searchTerm}%` } }
      ];
    }


    let include = [
      {
        model: Program,
        as: "program",
      },
    ];
    let result: any = await Promise.all([
      WashingSales.findAll({
        where: {
          ...washingWhere,
          status: "Sold",
          buyer_type: "Compacting",
          fabric_id: fabricId,
        //   [Op.or]: [{ "$washing.name$": { [Op.iLike]: `%${searchTerm}%` } }],
        },
        include: [
          ...include,
          { model: Fabric, as: "washing", attributes: ["id", "name"] },
        ],
      }),
      PrintingSales.findAll({
        where: {
          ...printingWhere,
          status: "Sold",
          buyer_type: "Compacting",
          fabric_id: fabricId,
        //   [Op.or]: [{ "$printing.name$": { [Op.iLike]: `%${searchTerm}%` } }],
        },
        include: [
          ...include,
          { model: Fabric, as: "printing", attributes: ["id", "name"] },
        ],
      }),
      DyingSales.findAll({
        where: {
          ...dyingWhere,
          status: "Sold",
          buyer_type: "Compacting",
          fabric_id: fabricId,
        //   [Op.or]: [
            // { "$dying_fabric.name$": { [Op.iLike]: `%${searchTerm}%` } },
        //   ],
        },
        include: [
          ...include,
          { model: Fabric, as: "dying_fabric", attributes: ["id", "name"] },
        ],
      }),
    ]);

    let abc: any = result.flat();

    // Apply pagination to the combined result
    let data = abc.slice(offset, offset + limit);
    return res.sendPaginationSuccess(res, data, abc?.length);
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

// // Update the status of the transaction for printing dashboard
const updateCompactingTransactionStatus = async (
  req: Request,
  res: Response
) => {
  try {
    let trans: any = [];
    for await (let obj of req.body.items) {
      const data: any = {
        status: obj.status,
        accept_date: obj.status === "Sold" ? new Date().toISOString() : null,
      };
      if (obj.type === "Printing") {
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
      } else if (obj.type === "Dying") {
        const transaction = await DyingSales.update(data, {
          where: {
            id: obj.id,
          },
        });
        trans.push(transaction);
      }
    }

    res.sendSuccess(res, trans);
  } catch (error) {
    console.log(error);
    return res.sendError(res, "NOT_ABLE_TO_UPDATE");
  }
};

// //creating a compacting process
const createCompactingProcess = async (req: Request, res: Response) => {
  try {
    // let uniqueFilename = `dying_sales_qrcode_${Date.now()}.png`;
    // let aa = await generateOnlyQrCode(`Test`, uniqueFilename);
    if (!req.body.compactingFabricId) {
      return res.sendError(res, "Need Compacting Id");
    }

    const data = {
      compacting_id: req.body.compactingFabricId,
      program_id: req.body.programId,
      season_id: req.body.seasonId,
      date: req.body.date,
      brand_order_ref: req.body.brandOrderRef,
      garment_order_ref: req.body.garmentOrderRef,
      buyer_type: req.body.buyerType,
      buyer_id: req.body.buyerId,
      processor_name: req.body.processorName,
      processor_address: req.body.processorAddress,
      fabric_quantity: req.body.fabricQuantity,
      old_fabric_quantity: req.body.oldFabricQuantity,
      add_fabric_quantity: req.body.addFabricQuantity,
      total_fabric_quantity: req.body.totalFabricQuantity,
      fabric_type: req.body.fabricType,
      fabric_length: req.body.fabricLength,
      gsm: req.body.fabricGsm,
      fabric_net_weight: req.body.fabricNetWeight,
      batch_lot_no: req.body.batchLotNo,
      job_details: req.body.jobDetails,
      order_details: req.body.orderDetails,
      weight_gain: req.body.weightGain,
      weight_loss: req.body.weightLoss,
      washing_details: req.body.washingDetails,
      invoice_no: req.body.invoiceNo,
      bill_of_lading: req.body.billOfLadding,
      transport_info: req.body.transportInfo,
      compacting_details: req.body.compactingDetails,
      type_of_compact: req.body.typeOfCompact,
      qty_stock: req.body.totalFabricQuantity,
      invoice_files: req.body.invoiceFiles,
      other_docs: req.body.otherDocs,
      wash_type: req.body.wash_type,
      sales_type :  req.body.salesType,
      status: "Pending",
    };
    const sales = await CompactingSales.create(data);
    let uniqueFilename = `compacting_qrcode_${Date.now()}.png`;
    let da = encrypt(`compacting,${sales.id}`);
    let aa = await generateOnlyQrCode(da, uniqueFilename);
    const compacting = await CompactingSales.update({ qr: uniqueFilename }, {
        where: {
            id: sales.id
        }
    });
    if (req.body.chooseFabric && req.body.chooseFabric.length > 0) {
      for await (let obj of req.body.chooseFabric) {
        let dataa = { qty_stock: obj.totalQty - obj.qtyUsed };
        if (obj.type === "Printing") {
          const transaction = await PrintingSales.update(dataa, {
            where: {
              id: obj.id,
            },
          });
        } else if (obj.type === "Washing") {
          const transaction = await WashingSales.update(dataa, {
            where: {
              id: obj.id,
            },
          });
        } else if (obj.type === "Dying") {
          const transaction = await DyingSales.update(dataa, {
            where: {
              id: obj.id,
            },
          });
        }
        await CompactingFabricSelections.create({
          process_id: obj.id,
          process_type: "compacting_sales",
          sales_id: sales.id,
          qty_used: obj.qtyUsed,
        });
      }
    }
    res.sendSuccess(res, sales);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

//fetch the compacting process/sale data
const fetchCompactingSalesPagination = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { fabricId }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { brand_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { garment_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
        { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$buyer.name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    whereCondition.compacting_id = fabricId;
    let include: any = [
      {
        model: Program,
        as: "program",
      },
      {
        model: Season,
        as: "season",
      },
      {
        model: Fabric,
        as: "compacting",
      },
      {
        model: Garment,
        as: "buyer",
      },
    ];
    //fetch data with pagination
    if (req.query.pagination === "true") {
      const { count, rows } = await CompactingSales.findAndCountAll({
        where: whereCondition,
        include: include,
        order: [["id", "desc"]],
        offset: offset,
        limit: limit,
      });
      return res.sendPaginationSuccess(res, rows, count);
    } else {
      const gin = await CompactingSales.findAll({
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

//choosing the compacting fabric data
const chooseCompactingFabric = async (req: Request, res: Response) => {
  try {
    let {
      programId,
      garmentOrderRef,
      brandOrderRef,
      lotNo,
      washingId,
      printingId,
      dyingId,
    }: any = req.query;
    const washingWhere: any = {};
    const printingWhere: any = {};
    const dyingWhere: any = {};
    let whereCondition: any = {};

    let { fabricId }: any = req.query;
    if (!fabricId) {
      return res.sendError(res, "Need Fabric Id");
    }

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.program_id = { [Op.in]: idArray };
    }

     // Helper function to add conditions based on filter values
     const addFilterCondition = (whereObj: any, filterKey: string, arr: any ) => {
      let idArray:number[] = arr ? arr.split(",").map((id: any) => parseInt(id, 10)) : [0];
      if (idArray && idArray.length > 0) {
          whereObj[filterKey] = { [Op.in]: idArray };
      } else {
          // If no filter value provided, set an impossible condition to filter out all data
          whereObj[filterKey] = { [Op.in]: [0] };
      }
  };

  // Dynamically add conditions for each filter
  if(washingId || printingId || dyingId){
      addFilterCondition(washingWhere, 'washing_id', washingId);
      addFilterCondition(printingWhere, 'printing_id', printingId);
      addFilterCondition(dyingWhere, 'dying_id', dyingId);
  }

    // if (washingId) {
    //   const idArray: number[] = washingId
    //     .split(",")
    //     .map((id: any) => parseInt(id, 10));
    //   washingWhere.washing_id = { [Op.in]: idArray };
    //   printingWhere.printing_id = { [Op.in]: [0] };
    //   dyingWhere.dying_id = { [Op.in]: [0] };
    // }
    // if (printingId) {
    //   const idArray: number[] = printingId
    //     .split(",")
    //     .map((id: any) => parseInt(id, 10));
    //   washingWhere.washing_id = { [Op.in]: [0] };
    //   printingWhere.printing_id = { [Op.in]: idArray };
    //   dyingWhere.dying_id = { [Op.in]: [0] };
    // }
    // if (dyingId) {
    //   const idArray: number[] = dyingId
    //     .split(",")
    //     .map((id: any) => parseInt(id, 10));
    //   washingWhere.washing_id = { [Op.in]: [0] };
    //   printingWhere.printing_id = { [Op.in]: [0] };
    //   dyingWhere.dying_id = { [Op.in]: idArray };
    // }

    if (garmentOrderRef) {
      const idArray: any[] = garmentOrderRef.split(",").map((id: any) => id);
      whereCondition.garment_order_ref = { [Op.in]: idArray };
    }
    if (brandOrderRef) {
      const idArray: any[] = brandOrderRef.split(",").map((id: any) => id);
      whereCondition.brand_order_ref = { [Op.in]: idArray };
    }
    if (lotNo) {
      const idArray: any[] = lotNo.split(",").map((id: any) => id);
      whereCondition.batch_lot_no = { [Op.in]: idArray };
    }

    whereCondition.qty_stock = { [Op.gt]: 0 };

    let include = [
      {
        model: Program,
        as: "program",
      },
    ];

    let data: any = await Promise.all([
      WashingSales.findAll({
        where: {
          ...whereCondition,
          ...washingWhere,
          status: "Sold",
          buyer_type: "Compacting",
          fabric_id: fabricId,
        },
        include: [
          ...include,
          { model: Fabric, as: "washing", attributes: ["id", "name"] },
        ],
      }),
      PrintingSales.findAll({
        where: {
          ...whereCondition,
          ...printingWhere,
          status: "Sold",
          buyer_type: "Compacting",
          fabric_id: fabricId,
        },
        include: [
          ...include,
          { model: Fabric, as: "printing", attributes: ["id", "name"] },
        ],
      }),
      DyingSales.findAll({
        where: {
          ...whereCondition,
          ...dyingWhere,
          status: "Sold",
          buyer_type: "Compacting",
          fabric_id: fabricId,
        },
        include: [
          ...include,
          { model: Fabric, as: "dying_fabric", attributes: ["id", "name"] },
        ],
      }),
    ]);
    return res.sendSuccess(res, data.flat());
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};
//export Compacting process data
const exportCompactingProcess = async (req: Request, res: Response) => {
  const excelFilePath = path.join("./upload", "export-compacting-process.xlsx");

  try {
    const whereCondition: any = {};
    const searchTerm = req.query.search || "";
    if (searchTerm) {
      whereCondition[Op.or] = [
        { brand_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { garment_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
        { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$buyer.name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    whereCondition.compacting_id = req.query.fabricId;
    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    worksheet.mergeCells("A1:K1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Process/Sale";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.",
      "Date",
      "Fabric Processor Type",
      "Sold To",
      "Invoice No",
      "	Batch/Lot No",
      "Compacted Fabric Quantity",
      "Length in Mts",
      "GSM",
      "Fabric Net Weight (Kgs)",
      "Program",
    ]);
    headerRow.font = { bold: true };
    let include: any = [
      {
        model: Program,
        as: "program",
      },
      {
        model: Season,
        as: "season",
      },
      {
        model: Fabric,
        as: "compacting",
      },
      {
        model: Garment,
        as: "buyer",
      },
    ];
    const sales = await CompactingSales.findAll({
      where: whereCondition,
      include: include,
    });
    // Append data to worksheet
    for await (const [index, item] of sales.entries()) {
      const rowValues = Object.values({
        index: index + 1,
        date: item.date ? item.date : "",
        buyer_type: item.buyer_type ?? "",
        buyer: item.buyer ? item.buyer.name : item.processor_name,
        invoice: item.invoice_no ? item.invoice_no : "",
        order: item.batch_lot_no ? item.batch_lot_no : "",
        qty: item.total_fabric_quantity ? item.total_fabric_quantity : "",
        length: item.fabric_length ? item.fabric_length : "",
        gsm: item.gsm ? item.gsm : "",
        fabric_net_weight: item.fabric_net_weight ? item.fabric_net_weight : "",
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
    res.status(200).send({
      success: true,
      messgage: "File successfully Generated",
      data: process.env.BASE_URL + "export-compacting-process.xlsx",
    });
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

//deleting the Washing fabric data
const deleteCompactingProcess = async (req: Request, res: Response) => {
  try {
    const deletedCompacting = await CompactingSales.destroy({
      where: {
        id: req.body.id,
        status: "Pending",
      },
    });

    return res.sendSuccess(res, deletedCompacting);
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

const getGarments = async (req: Request, res: Response) => {
  let fabricId = req.query.fabricId;
  if (!fabricId) {
    return res.sendError(res, "Need Weaver Id ");
  }
  let result = await Fabric.findOne({ where: { id: fabricId } });
  if (!result) {
    return res.sendError(res, "No Weaver Found ");
  }
  let garment = await Garment.findAll({
    attributes: ["id", "name"],
    where: { brand: { [Op.overlap]: result.dataValues.brand } },
  });
  res.sendSuccess(res, garment);
};

const getFabrics = async (req: Request, res: Response) => {
  let fabricId = req.query.fabricId;
  if (!fabricId) {
    return res.sendError(res, "Need Fabric Id ");
  }
  let result = await Fabric.findOne({ where: { id: fabricId } });
  if (!result) {
    return res.sendError(res, "No Fabric Found ");
  }
  let garment = await Fabric.findAll({
    attributes: ["id", "name"],
    where: {
      brand: { [Op.overlap]: result.dataValues.brand },
      fabric_processor_type: { [Op.overlap]: [req.query.type] },
    },
  });
  res.sendSuccess(res, garment);
};

//filters API
const getProcessName = async (req: Request, res: Response) => {
  const { fabricId, buyerType }: any = req.query;
  const whereCondition: any = {};
  try {
    if (!fabricId) {
      return res.sendError(res, "Need Fabric Id ");
    }

    let response: any;
    if (buyerType === "Dyeing") {
      response = await Promise.all([
        WeaverSales.findAll({
          attributes: ["weaver_id", "weaver.name"],
          where: { status: "Sold", buyer_type: "Dyeing", fabric_id: fabricId },
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
          where: { status: "Sold", buyer_type: "Dyeing", fabric_id: fabricId },
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
    } else if (buyerType === "Printing") {
      response = await WashingSales.findAll({
        attributes: ["washing_id", "washing.name"],
        where: { status: "Sold", buyer_type: "Printing", fabric_id: fabricId },
        include: [
          {
            model: Fabric,
            as: "washing",
            attributes: ["id", "name"],
          },
        ],
        group: ["washing_id", "washing.id"],
      });
    } else if (buyerType === "Washing") {
      response = await Promise.all([
        WeaverSales.findAll({
          attributes: ["weaver_id", "weaver.name"],
          where: { status: "Sold", buyer_type: "Washing", fabric_id: fabricId },
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
          where: { status: "Sold", buyer_type: "Washing", fabric_id: fabricId },
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
          where: { status: "Sold", buyer_type: "Washing", fabric_id: fabricId },
          include: [
            { model: Fabric, as: "dying_fabric", attributes: ["id", "name"] },
          ],
          group: ["dying_id", "dying_fabric.id"],
        }),
      ]);
    } else if (buyerType === "Compacting") {
      response = await Promise.all([
        WashingSales.findAll({
          attributes: ["washing_id", "washing.name"],
          where: {
            status: "Sold",
            buyer_type: "Compacting",
            fabric_id: fabricId,
          },
          include: [
            {
              model: Fabric,
              as: "washing",
              attributes: ["id", "name"],
            },
          ],
          group: ["washing_id", "washing.id"],
        }),
        PrintingSales.findAll({
          attributes: ["printing_id", "printing.name"],
          where: {
            status: "Sold",
            buyer_type: "Compacting",
            fabric_id: fabricId,
          },
          include: [
            { model: Fabric, as: "printing", attributes: ["id", "name"] },
          ],
          group: ["printing_id", "printing.id"],
        }),
        DyingSales.findAll({
          attributes: ["dying_id", "dying_fabric.name"],
          where: { status: "Sold", buyer_type: "Washing", fabric_id: fabricId },
          include: [
            { model: Fabric, as: "dying_fabric", attributes: ["id", "name"] },
          ],
          group: ["dying_id", "dying_fabric.id"],
        }),
      ]);
    }

    res.sendSuccess(res, response.flat());
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const getBatchLot = async (req: Request, res: Response) => {
  const { buyerType, fabricId }: any = req.query;
  const whereCondition: any = {};
  try {
    if (!fabricId) {
      return res.sendError(res, "Need fabric Id ");
    }

    let response: any;

    if (buyerType === "Dyeing") {
      let knitIds = await KnitSales.findAll({
        attributes: ["id"],
        where: {
          status: "Sold",
          buyer_type: buyerType ? buyerType : "",
          fabric_id: fabricId,
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
          status: "Sold",
          buyer_type: buyerType ? buyerType : "",
          fabric_id: fabricId,
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

      let result: any = await Promise.all([
        WeaverSales.findAll({
          attributes: ["brand_order_ref", "garment_order_ref"],
          where: {
            status: "Sold",
            buyer_type: buyerType ? buyerType : "",
            fabric_id: fabricId,
          },
          group: ["brand_order_ref", "garment_order_ref"],
        }),
        KnitSales.findAll({
          attributes: ["brand_order_ref", "garment_order_ref"],
          where: {
            status: "Sold",
            buyer_type: buyerType ? buyerType : "",
            fabric_id: fabricId,
          },
          group: ["brand_order_ref", "garment_order_ref"],
        }),
      ]);

      response = {
        batchLot,
        order_ref: result.flat(),
      };

      return res.sendSuccess(res, response);
    } else if (buyerType === "Printing") {
      response = await WashingSales.findAll({
        attributes: ["batch_lot_no", "brand_order_ref", "garment_order_ref"],
        where: { status: "Sold", buyer_type: "Printing", fabric_id: fabricId },
        group: ["batch_lot_no", "brand_order_ref", "garment_order_ref"],
      });
    } else if (buyerType === "Washing") {
      let knitIds = await KnitSales.findAll({
        attributes: ["id"],
        where: {
          status: "Sold",
          buyer_type: "Washing",
          fabric_id: fabricId,
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
          status: "Sold",
          buyer_type: "Washing",
          fabric_id: fabricId,
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
      let dyingBatchLot = await DyingSales.findAll({
        attributes: ["batch_lot_no"],
        where: { status: "Sold", buyer_type: "Washing", fabric_id: fabricId },
        group: ["batch_lot_no"],
      });

      let batchLot = [...weaveBatchLot, ...knitBatchLot, ...dyingBatchLot];

      let result: any = await Promise.all([
        WeaverSales.findAll({
          attributes: ["brand_order_ref", "garment_order_ref"],
          where: {
            status: "Sold",
            buyer_type: buyerType ? buyerType : "",
            fabric_id: fabricId,
          },
          group: ["brand_order_ref", "garment_order_ref"],
        }),
        KnitSales.findAll({
          attributes: ["brand_order_ref", "garment_order_ref"],
          where: {
            status: "Sold",
            buyer_type: buyerType ? buyerType : "",
            fabric_id: fabricId,
          },
          group: ["brand_order_ref", "garment_order_ref"],
        }),
        DyingSales.findAll({
          attributes: ["brand_order_ref", "garment_order_ref"],
          where: { status: "Sold", buyer_type: "Washing", fabric_id: fabricId },
          group: ["brand_order_ref", "garment_order_ref"],
        }),
      ]);

      response = {
        batchLot,
        order_ref: result.flat(),
      };

      return res.sendSuccess(res, response);
    } else if (buyerType === "Compacting") {
      response = await Promise.all([
        WashingSales.findAll({
          attributes: ["batch_lot_no", "brand_order_ref", "garment_order_ref"],
          where: {
            status: "Sold",
            buyer_type: "Compacting",
            fabric_id: fabricId,
          },
          group: ["batch_lot_no", "brand_order_ref", "garment_order_ref"],
        }),
        PrintingSales.findAll({
          attributes: ["batch_lot_no", "brand_order_ref", "garment_order_ref"],
          where: {
            status: "Sold",
            buyer_type: "Compacting",
            fabric_id: fabricId,
          },
          group: ["batch_lot_no", "brand_order_ref", "garment_order_ref"],
        }),
        DyingSales.findAll({
          attributes: ["batch_lot_no", "brand_order_ref", "garment_order_ref"],
          where: { status: "Sold", buyer_type: "Washing", fabric_id: fabricId },
          group: ["batch_lot_no", "brand_order_ref", "garment_order_ref"],
        }),
      ]);
    }

    res.sendSuccess(res, response.flat());
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

export {
  fetchDyingTransactions,
  getProgram,
  fetchDyingTransactionsAll,
  fetchWashingTransactionsAll,
  updateTransactionStatus,
  createDyingProcess,
  fetchDyingSalesPagination,
  exportDyingProcess,
  chooseDyingFabric,
  createWashingProcess,
  fetchWashingSalesPagination,
  chooseWashingFabric,
  updateWashingTransactionStatus,
  exportWashingProcess,
  fetchPrintingTransactions,
  fetchPrintingTransactionSold,
  updatePrintingTransactionStatus,
  createPrintingProcess,
  fetchPrintingSalesPagination,
  choosePrintingFabric,
  exportPrintingProcess,
  getGarments,
  getFabrics,
  fetchCompactingTransactions,
  fetchCompactingTransactionSold,
  updateCompactingTransactionStatus,
  createCompactingProcess,
  chooseCompactingFabric,
  fetchCompactingSalesPagination,
  exportCompactingProcess,
  fetchWashingTransactions,
  deleteCompactingProcess,
  deleteDyingProcess,
  deleteWashingProcess,
  deletePrintingProcess,
  getProcessName,
  getBatchLot,
};
