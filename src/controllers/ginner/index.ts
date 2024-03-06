import { Request, Response } from "express";
import GinProcess from "../../models/gin-process.model";
import { Sequelize, Op, where } from "sequelize";
import { encrypt, generateOnlyQrCode } from "../../provider/qrcode";
import GinBale from "../../models/gin-bale.model";
import Ginner from "../../models/ginner.model";
import GinSales from "../../models/gin-sales.model";
import * as ExcelJS from "exceljs";
import * as fs from "fs";
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
import sequelize from "../../util/dbConn";
import Farmer from "../../models/farmer.model";
import { send_gin_mail } from "../send-emails";
import FarmGroup from "../../models/farm-group.model";
import { formatDataForGinnerProcess } from "../../util/tracing-chart-data-formatter";
import Farm from "../../models/farm.model";

//create Ginner Process
const createGinnerProcess = async (req: Request, res: Response) => {
  try {
    if (req.body.lotNo) {
      let lot = await GinProcess.findOne({ where: { lot_no: req.body.lotNo } });
      if (lot) {
        return res.sendError(res, "Lot No already Exists");
      }
    }
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
    let da = encrypt(`${ginprocess.id}`);
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
        bale_no: bale.baleNo,
        weight: bale.weight,
        staple: bale.staple,
        mic: bale.mic,
        strength: bale.strength,
        trash: bale.trash,
        color_grade: bale.colorGrade,
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
          },
        }
      );
    }
    for await (const cotton of req.body.chooseCotton) {
      let trans = await Transaction.findAll({
        where: {
          mapped_ginner: req.body.ginnerId,
          status: "Sold",
          village_id: cotton.vlg_id,
          program_id: req.body.programId,
          qty_stock: { [Op.gt]: 0 },
        },
      });
      for await (const tran of trans) {
        let realQty = 0;
        if (cotton.qty_used > 0) {
          let qty_stock = tran.dataValues.qty_stock || 0;
          if (qty_stock < cotton.qty_used) {
            realQty = qty_stock;
            cotton.qty_used = Number(cotton.qty_used) - Number(realQty);
          } else {
            realQty = cotton.qty_used;
            cotton.qty_used = 0;
          }
          let update = await Transaction.update(
            { qty_stock: qty_stock - Number(realQty) },
            { where: { id: tran.id } }
          );
          let cot = await CottonSelection.create({
            process_id: ginprocess.id,
            transaction_id: tran.id,
            qty_used: realQty,
          });
        }
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
        let village = [];
        if (cotton.length > 0) {
          village = await Transaction.findAll({
            attributes: ["village_id"],
            where: {
              id: cotton.map((obj: any) => obj.dataValues.transaction_id),
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
                Sequelize.literal("CAST(weight AS DOUBLE PRECISION)")
              ),
              "lint_quantity",
            ],
            [sequelize.fn("min", sequelize.col("bale_no")), "pressno_from"],
            [sequelize.fn("max", sequelize.col("bale_no")), "pressno_to"],
           
          ],
          where: { process_id: row.dataValues.id },
        });
        sendData.push({
          ...row.dataValues,
          village: village,
          gin_press_no:
            (bale.dataValues.pressno_from || "") +
            "-" +
            (bale.dataValues.pressno_to || ""),
          lint_quantity: bale.dataValues.lint_quantity,
          reel_press_no:
            row.dataValues.no_of_bales === 0
              ? ""
              : `001-${
                  row.dataValues.no_of_bales < 9
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
      return res.sendError(res, "Program Id is required");
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

    let result = await GinProcess.findAll({
      where: whereCondition,
      include: include,
      order: [["id", "DESC"]],
    });
    const id_array = result.map((item: any) => item.id);
    const bales_list = [];
    for await (const id of id_array) {
      const lot_details = await GinBale.findAll({
        attributes: [
          [
            sequelize.fn(
              "SUM",
              Sequelize.literal(
                'CAST("gin-bales"."weight" AS DOUBLE PRECISION)'
              )
            ),
            "weight",
          ],
          // Add other attributes here...
        ],
        where: {
          sold_status: false,
        },
        include: [
          {
            model: GinProcess,
            as: "ginprocess",
            attributes: ["id", "lot_no", "date", "press_no", "reel_lot_no"],
            where: { id: id },
          },
        ],
        group: ["ginprocess.id", "ginprocess.lot_no"],
      });
      if (lot_details.length > 0) {
        const bales = await GinBale.findAll({
          where: {
            process_id: id,
            sold_status: false,
          },
        });

        if (bales.length > 0) {
          lot_details[0].dataValues.bales = bales;
          bales_list.push(lot_details[0]);
        }
      }
    }
    return res.sendSuccess(res, bales_list);
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
      return res.sendError(
        res,
        "Unable to delete this process since some bales of this process was sold"
      );
    } else {
      let cotton = await CottonSelection.findAll({
        where: { process_id: req.body.id },
      });
      for await (let cs of cotton) {
        await Transaction.update(
          {
            qty_stock: Sequelize.literal(
              `qty_stock + ${cs.dataValues.qty_used}`
            ),
          },
          {
            where: {
              id: cs.dataValues.transaction_id,
            },
          }
        );
      }
      await CottonSelection.destroy({
        where: {
          process_id: req.body.id,
        },
      });
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
      return res.sendError(res, "Need Program Id");
    }
    let villageId: any = req.query.villageId;
    let whereCondition: any = {
      status: "Sold",
      qty_stock: {
        [Op.gt]: 0,
      },
      mapped_ginner: ginnerid,
      program_id: programId,
    };

    if (villageId) {
      const idArray: number[] = villageId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.village_id = { [Op.in]: idArray };
    }

    const results = await Transaction.findAll({
      attributes: [
        [Sequelize.fn("SUM", Sequelize.col("qty_stock")), "qty_stock"],
        [Sequelize.fn("SUM", Sequelize.col("qty_stock")), "qty_used"],
        [
          sequelize.fn(
            "COALESCE",
            sequelize.fn(
              "SUM",
              Sequelize.literal('CAST("qty_purchased" AS DOUBLE PRECISION)')
            ),
            0
          ),
          "estimated_qty",
        ],
        [Sequelize.col("village.id"), "vlg_id"],
      ],
      include: [
        { model: Village, as: "village" },
        { model: Program, as: "program" },
      ],
      where: whereCondition,
      group: ["vlg_id", "program.id", "transactions.id"],
      order: [
        ["id", "DESC"],
        [Sequelize.col("accept_date"), "DESC"],
      ],
    });
    const summedData: any = {};

    results.forEach((result: any) => {
      const villageId = result.dataValues.vlg_id;
      if (summedData[villageId]) {
        summedData[villageId].qty_stock += result.dataValues.qty_stock;
        summedData[villageId].qty_used += result.dataValues.qty_used;
        summedData[villageId].estimated_qty += result.dataValues.estimated_qty;
      } else {
        summedData[villageId] = {
          qty_stock: result.dataValues.qty_stock,
          qty_used: result.dataValues.qty_used,
          estimated_qty: result.dataValues.estimated_qty,
          vlg_id: villageId,
          village: result.village,
          program: result.program,
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

const updateTransactionStatus = async (req: Request, res: Response) => {
  try {
    let trans: any = [];
    for await (let obj of req.body.items) {
      const data: any = {
        status: obj.status,
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
      "Program",
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
      qty_stock: req.body.totalQty,
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
const updateGinnerSales = async (req: Request, res: Response) => {
  try {
    const data = {
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
      lrbl_no: req.body.lrblNo,
    };
    const ginSales = await GinSales.update(data, {
      where: { id: req.body.id },
    });
    if (req.body.weightLoss) {
      for await (let obj of req.body.lossData) {
        let bale = await GinBale.findOne({
          where: {
            "$ginprocess.reel_lot_no$": String(obj.reelLotNo),
            bale_no: String(obj.baleNo),
          },
          include: [{ model: GinProcess, as: "ginprocess" }],
        });
        if (bale) {
          await GinBale.update(
            { weight: obj.newWeight },
            { where: { id: bale.dataValues.id } }
          );
        }
      }
    }

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
    return res.sendSuccess(res, gin);
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
        },
        {
          model: GinSales,
          as: "sales",
          include: [
            {
              model: Ginner,
              as: "ginner",
              attributes: ["id", "name", "address"],
            },
          ],
        },
      ],
      order: [["id", "DESC"]],
      offset: offset,
      limit: limit,
    });
    return res.sendPaginationSuccess(res, rows, count);
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
    var prcs_date = new Date().toLocaleDateString().replace(/\//g, "");
    var bale_no = baleCount ? Number(baleCount ?? 0) + 1 : 1;
    var reelbale_id = baleid_prefix + prcs_date + "/" + String(bale_no);
    res.sendSuccess(res, { id: reelbale_id });
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
  if (!ginnerId) {
    return res.sendError(res, "Need Ginner Id ");
  }
  let ginner = await Ginner.findOne({ where: { id: ginnerId } });
  if (!ginner) {
    return res.sendError(res, "No Ginner Found ");
  }
  let result = await Spinner.findAll({
    attributes: ["id", "name"],
    where: { brand: { [Op.overlap]: ginner.dataValues.brand } },
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

const getGinnerProcessTracingChartData = async (
  req: Request,
  res: Response
) => {
  const { reelLotNo } = req.query;
  let include = [
    {
      model: Ginner,
      as: "ginner",
    },
  ];

  let transactionInclude = [
    {
      model: Village,
      as: "village",
    },
    {
      model: Farmer,
      as: "farmer",
      include: [
        {
          model: Village,
          as: "village",
        },
        {
          model: FarmGroup,
          as: "farmGroup",
        },
      ],
    },
  ];

  let whereCondition = {
    reel_lot_no: reelLotNo,
  };

  let gin = await GinProcess.findAll({
    where: whereCondition,
    include: include,
    order: [["id", "desc"]],
  });

  gin = await Promise.all(
    gin.map(async (el: any) => {
      el = el.toJSON();
      el.transaction = await Transaction.findAll({
        where: {
          mapped_ginner: el.ginner_id,
        },
        include: transactionInclude,
      });
      return el;
    })
  );

  let formattedData: any = {};

  gin.forEach((el: any) => {
    el.transaction.forEach((el: any) => {
      if (!formattedData[el.farmer.farmGroup_id]) {
        formattedData[el.farmer.farmGroup_id] = {
          farm_name: el.farmer.farmGroup.name,
          villages: [],
        };
      }

      const village_name = el.farmer.village.village_name;
      if (
        !formattedData[el.farmer.farmGroup_id].villages.includes(village_name)
      ) {
        formattedData[el.farmer.farmGroup_id].villages.push(village_name);
      }
    });
  });

  formattedData = Object.keys(formattedData).map((el: any) => {
    return formattedData[el];
  });
  res.sendSuccess(res, formatDataForGinnerProcess(reelLotNo, formattedData));
};

export {
  createGinnerProcess,
  fetchGinProcessPagination,
  fetchGinBale,
  createGinnerSales,
  fetchGinSalesPagination,
  fetchGinSale,
  exportGinnerSales,
  updateGinnerSales,
  fetchGinSaleBale,
  chooseCotton,
  updateTransactionStatus,
  dashboardGraphWithProgram,
  getReelBaleId,
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
};
