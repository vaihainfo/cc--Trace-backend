import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import { encrypt, generateOnlyQrCode } from "../../provider/qrcode";
import * as ExcelJS from "exceljs";
import * as path from "path";
import Season from "../../models/season.model";
import Program from "../../models/program.model";
import Spinner from "../../models/spinner.model";
import sequelize from "../../util/dbConn";
import Dyeing from "../../models/dyeing.model";
import SpinSales from "../../models/spin-sales.model";
import WeaverSales from "../../models/weaver-sales.model";
import FabricType from "../../models/fabric-type.model";
import Garment from "../../models/garment.model";
import Weaver from "../../models/weaver.model";
import YarnSelection from "../../models/yarn-seletions.model";
import YarnCount from "../../models/yarn-count.model";
import Fabric from "../../models/fabric.model";
import WeaverProcess from "../../models/weaver-process.model";
import WeaverFabricSelection from "../../models/weaver-fabric-selection.model";
import SpinProcess from "../../models/spin-process.model";
import SpinProcessYarnSelection from "../../models/spin-process-yarn-seletions.model";
import { send_weaver_mail } from "../send-emails";
import WeaverFabric from "../../models/weaver_fabric.model";
import { _getSpinnerProcessTracingChartData } from "../spinner/index";
import { formatDataFromWeaver } from "../../util/tracing-chart-data-formatter";
import Country from "../../models/country.model";
import PhysicalTraceabilityDataWeaver from "../../models/physical-traceability-data-weaver.model";
import Brand from "../../models/brand.model";
import PhysicalTraceabilityDataWeaverSample from "../../models/physical-traceability-data-weaver-sample.model";

const createWeaverProcess = async (req: Request, res: Response) => {
  try {
    let dyeing;
    if (req.body.dyeingRequired) {
      dyeing = await Dyeing.create({
        processor_name: req.body.processorName,
        dyeing_address: req.body.dyeingAddress,
        process_name: req.body.processName,
        yarn_delivered: req.body.yarnDelivered,
        process_loss: req.body.processLoss,
        net_yarn: req.body.processNetYarnQty,
      });
    }

    const data = {
      weaver_id: req.body.weaverId,
      program_id: req.body.programId,
      season_id: req.body.seasonId,
      date: req.body.date,
      from_date: req.body.from_date,
      to_date: req.body.to_date,
      garment_order_ref: req.body.garmentOrderRef,
      brand_order_ref: req.body.brandOrderRef,
      other_mix: req.body.blendChoosen,
      cottonmix_type: req.body.cottonmixType ? req.body.cottonmixType : null,
      cottonmix_qty: req.body.cottonmixQty ? req.body.cottonmixQty : null,
      blend_material: req.body.blendMaterial,
      blend_vendor: req.body.blendVendor,
      yarn_qty: req.body.yarnQty,
      additional_yarn_qty: req.body.additionalYarnQty,
      total_yarn_qty: req.body.totalYarnQty,
      fabric_type: req.body.fabricType,
      fabric_gsm: req.body.fabricGsm,
      fabric_length: req.body.fabricLength,
      batch_lot_no: req.body.batchLotNo,
      reel_lot_no: req.body.reelLotNo ? req.body.reelLotNo : null,
      job_details_garment: req.body.jobDetailsGarment,
      no_of_rolls: req.body.noOfRolls,
      dyeing_required: req.body.dyeingRequired,
      dyeing_id: dyeing ? dyeing.id : null,
      qty_stock: req.body.totalFabricLength,
      physical_traceablity: req.body.physicalTraceablity,
      total_fabric_length: req.body.totalFabricLength,
      blend_invoice: req.body.blendInvoice,
      blend_document: req.body.blendDocuments,
      status: 'Pending'
    };

    const weaver = await WeaverProcess.create(data);
    let uniqueFilename = `weaver_procees_qrcode_${Date.now()}.png`;
    let da = encrypt(`Weaver,Process,${weaver.id}`);
    let aa = await generateOnlyQrCode(da, uniqueFilename);
    const gin = await WeaverProcess.update({ qr: uniqueFilename }, {
      where: {
        id: weaver.id
      }
    });

    for await (let fabric of req.body.fabrics) {
      let data = {
        process_id: weaver.id,
        fabric_type: fabric.fabricType,
        fabric_gsm: fabric.fabricGsm,
        fabric_length: fabric.fabricLength,
        fabric_length_stock: fabric.fabricLength,
        sold_status: false,
      };
      const fab = await WeaverFabric.create(data);
    }

    if (req.body.chooseYarn && req.body.chooseYarn.length > 0) {
      for await (let obj of req.body.chooseYarn) {
        let val = await SpinSales.findOne({ where: { id: obj.id } });
        if (val) {
          let update = await SpinSales.update({ qty_stock: val.dataValues.qty_stock - obj.qtyUsed }, { where: { id: obj.id } });
          await YarnSelection.create({ yarn_id: obj.id, type: obj.type, sales_id: weaver.id, qty_used: obj.qtyUsed })
        }
      }
    }

    if (req.body.enterPhysicalTraceability) {
      const physicalTraceabilityData = {
        date_sample_collection: req.body.dateSampleCollection,
        data_of_sample_dispatch: req.body.dataOfSampleDispatch,
        operator_name: req.body.operatorName,
        expected_date_of_fabric_sale: req.body.expectedDateOfFabricSale,
        physical_traceability_partner_id: req.body.physicalTraceabilityPartnerId,
        weav_process_id: weaver.id,
        weaver_id: req.body.weaverId
      };
      const physicalTraceabilityDataWeaver = await PhysicalTraceabilityDataWeaver.create(physicalTraceabilityData);

      for await (const weightAndRoll of req.body.weightAndRoll) {
        let brand = await Brand.findOne({
          where: { id: req.body.brandId }
        });

        const updatedCount = brand.dataValues.count + 1;
        let physicalTraceabilityDataWeaverSampleData = {
          physical_traceability_data_weaver_id: physicalTraceabilityDataWeaver.id,
          weight: weightAndRoll.weight,
          roll: weightAndRoll.roll,
          original_sample_status: weightAndRoll.originalSampleStatus,
          code: `DNA${req.body.weaverShortname}-${req.body.batchLotNo || ''}-${updatedCount}`,
          sample_result: 0
        };
        await PhysicalTraceabilityDataWeaverSample.create(physicalTraceabilityDataWeaverSampleData);

        await Brand.update(
          { count: updatedCount },
          { where: { id: brand.id } }
        );
      }
    }

    res.sendSuccess(res, { weaver });
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message, error);
  }
}

const updateWeaverProcess = async (req: Request, res: Response) => {
  try {
    const data = {
      date: req.body.date,
      garment_order_ref: req.body.garmentOrderRef,
      brand_order_ref: req.body.brandOrderRef,
      fabric_gsm: req.body.fabricGsm,
      batch_lot_no: req.body.batchLotNo,
    };
    const weaver = await WeaverProcess.update(data, {
      where: { id: req.body.id },
    });
    for await (let fabric of req.body.fabrics) {
      let data = {
        fabric_gsm: fabric.fabricGsm,
      };
      const fab = await WeaverFabric.update(data, { where: { id: fabric.id } });
    }
    res.sendSuccess(res, { weaver });
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message, error);
  }
};
//fetch Weaver process by id
const fetchWeaverProcessPagination = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const {
    weaverId,
    seasonId,
    programId,
    filter,
    lotNo,
    reelLotNo,
    noOfRolls,
    fabricType,
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
        // { "$yarncount.yarnCount_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$weaver.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$dyeing.processor_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$dyeing.process_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { job_details_garment: { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    if (weaverId) {
      whereCondition.weaver_id = weaverId;
    }
    if (seasonId) {
      whereCondition.season_id = seasonId;
    }
    if (programId) {
      whereCondition.program_id = programId;
    }

    if (filter === "Quantity") {
      whereCondition.qty_stock = { [Op.gt]: 0 };
    }

    if (lotNo) {
      const idArray: any[] = lotNo.split(",").map((id: any) => id);
      whereCondition.batch_lot_no = { [Op.in]: idArray };
    }
    if (reelLotNo) {
      const idArray: any[] = reelLotNo.split(",").map((id: any) => id);
      whereCondition.reel_lot_no = { [Op.in]: idArray };
    }
    if (noOfRolls) {
      const idArray: any[] = noOfRolls.split(",").map((id: any) => id);
      whereCondition.no_of_rolls = { [Op.in]: idArray };
    }
    if (fabricType) {
      const idArray: any[] = fabricType
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.fabric_type = { [Op.overlap]: idArray };
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
        model: Dyeing,
        as: "dyeing",
      },
      // {
      //   model: YarnCount,
      //   as: "yarncount",
      //   attributes: ["id", "yarnCount_name"],
      // },
    ];
    //fetch data with pagination
    if (req.query.pagination === "true") {
      const { count, rows } = await WeaverProcess.findAndCountAll({
        where: whereCondition,
        include: include,
        order: [["id", "desc"]],
        offset: offset,
        limit: limit,
      });

      let data = [];

      for await (let row of rows) {
        const fabrictypes = await FabricType.findAll({
          where: {
            id: {
              [Op.in]: row.dataValues.fabric_type,
            },
          },
          attributes: ["id", "fabricType_name"],
        });
        data.push({
          ...row.dataValues,
          fabrictypes,
        });
      }
      return res.sendPaginationSuccess(res, data, count);
    } else {
      const gin = await WeaverProcess.findAll({
        where: whereCondition,
        include: include,
        order: [["id", "desc"]],
      });

      let data = [];

      for await (let row of gin) {
        const fabrictypes = await FabricType.findAll({
          where: {
            id: {
              [Op.in]: row.dataValues.fabric_type,
            },
          },
          attributes: ["id", "fabricType_name"],
        });
        data.push({
          ...row.dataValues,
          fabrictypes,
        });
      }

      return res.sendSuccess(res, data);
    }
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

//fetch Weaver Process by id
const fetchWeaverProcess = async (req: Request, res: Response) => {
  const { id } = req.query;
  const whereCondition: any = {};
  try {
    if (!id) {
      return res.sendError(res, "need process id");
    }
    whereCondition.id = id;

    let include = [
      {
        model: Weaver,
        as: "weaver",
        attributes: ['id', 'name', 'address']
      },
      {
        model: Season,
        as: "season",
        attributes: ['id', 'name']
      },
      {
        model: Program,
        as: "program",
        attributes: ['id', 'program_name']
      },
      {
        model: Dyeing,
        as: "dyeing",
      },
      // {
      //   model: YarnCount,
      //   as: "yarncount",
      //   attributes: ['id', 'yarnCount_name']
      // }
    ];
    //fetch data with pagination
    let rows = await WeaverProcess.findOne({
      where: whereCondition,
      include: include
    });
    let fabrics = await WeaverFabric.findAll({ where: { process_id: id } })

    let data = { ...rows.dataValues, fabrics };
    return res.sendSuccess(res, data);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

//create Weaver Sale
const createWeaverSales = async (req: Request, res: Response) => {
  try {
    const data = {
      weaver_id: req.body.weaverId,
      program_id: req.body.programId,
      season_id: req.body.seasonId,
      date: req.body.date,
      garment_order_ref: req.body.garmentOrderRef,
      brand_order_ref: req.body.brandOrderRef,
      buyer_type: req.body.buyerType,
      buyer_id: req.body.buyerId ? req.body.buyerId : null,
      fabric_id: req.body.fabricId ? req.body.fabricId : null,
      processor_name: req.body.processorName,
      processor_address: req.body.processorAddress,
      yarn_qty: req.body.totalYarnQty,
      total_yarn_qty: req.body.totalFabricLength,
      total_fabric_length: req.body.totalFabricLength,
      transaction_via_trader: req.body.transactionViaTrader,
      transaction_agent: req.body.transactionAgent,
      batch_lot_no: req.body.batchLotNo,
      invoice_no: req.body.invoiceNo,
      bill_of_ladding: req.body.billOfLadding,
      transporter_name: req.body.transporterName,
      vehicle_no: req.body.vehicleNo,
      tc_file: req.body.tcFiles,
      contract_file: req.body.contractFile,
      invoice_file: req.body.invoiceFile,
      delivery_notes: req.body.deliveryNotes,
      qty_stock: req.body.totalFabricLength,
      fabric_type: req.body.fabricType,
      no_of_rolls: req.body.noOfRolls,
      status: 'Pending for QR scanning'
    };
    const weaverSales = await WeaverSales.create(data);
    let uniqueFilename = `weaver_sales_qrcode_${Date.now()}.png`;
    let da = encrypt(`Weaver,Sale,${weaverSales.id}`);
    let aa = await generateOnlyQrCode(da, uniqueFilename);
    const gin = await WeaverSales.update({ qr: uniqueFilename }, {
      where: {
        id: weaverSales.id
      }
    });
    if (req.body.chooseFabric && req.body.chooseFabric.length > 0) {
      for await (let obj of req.body.chooseFabric) {
        let val = await WeaverProcess.findOne({ where: { id: obj.process_id } });
        if (val) {
          let update = await WeaverProcess.update(
            {
              qty_stock: val.dataValues.qty_stock - obj.qtyUsed,
              status: "Sold",
            },
            { where: { id: obj.process_id } }
          );
          const Fabrics = await WeaverFabric.findOne({ where: { id: obj.id } });

          let updateyarns = {}
          if (Fabrics.fabric_length_stock - obj.qtyUsed <= 0) {
            updateyarns = {
              sold_status: true,
              fabric_length_stock: 0
            }
          } else {
            updateyarns = {
              fabric_length_stock: Fabrics.fabric_length_stock - obj.qtyUsed
            }
          }
          const spinYarnStatus = await WeaverFabric.update(updateyarns, { where: { id: obj.id } });
          await WeaverFabricSelection.create({
            weaver_fabric: obj.id,
            fabric_id: obj.process_id,
            type: obj.type,
            sales_id: weaverSales.id,
            qty_used: obj.qtyUsed
          })
        }
      }
    }

    if (weaverSales) {
      await send_weaver_mail(weaverSales.id);
    }
    return res.sendSuccess(res, { weaverSales });
  } catch (error: any) {
    console.error(error)
    return res.sendError(res, error.message, error);
  }
}

//update knitter Sale
const updateWeaverSales = async (req: Request, res: Response) => {
  try {
    if (!req.body.id) {
      return res.sendError(res, "need sales id");
    }
    const data = {
      date: req.body.date ? req.body.date : undefined,
      invoice_no: req.body.invoiceNo,
      vehicle_no: req.body.vehicleNo
    };
    const weaverSale = await WeaverSales.update(
      data,
      {
        where: {
          id: req.body.id,
        },
      }
    );


    return res.sendSuccess(res, weaverSale);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message, error);
  }
};

//fetch Weaver Sales with filters
const fetchWeaverSalesPagination = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { weaverId, seasonId, programId }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { garment_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { brand_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$weaver.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
        { "$dyingwashing.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$buyer.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { vehicle_no: { [Op.iLike]: `%${searchTerm}%` } },
        { transaction_agent: { [Op.iLike]: `%${searchTerm}%` } },
        { transporter_name: { [Op.iLike]: `%${searchTerm}%` } },
        { bill_of_ladding: { [Op.iLike]: `%${searchTerm}%` } },
        { processor_name: { [Op.iLike]: `%${searchTerm}%` } },
        { processor_address: { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    if (weaverId) {
      whereCondition.weaver_id = weaverId;
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
    if (req.query.pagination === "true") {
      const { count, rows } = await WeaverSales.findAndCountAll({
        where: whereCondition,
        include: include,
        order: [["id", "desc"]],
        offset: offset,
        limit: limit,
      });
      return res.sendPaginationSuccess(res, rows, count);
    } else {
      const gin = await WeaverSales.findAll({
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

//fetch knitter Sale by id
const fetchFabricReelLotNo = async (req: Request, res: Response) => {
  const { weaverId } = req.query;
  const whereCondition: any = {};
  try {
    if (!weaverId) {
      return res.sendError(res, "need weaverId id");
    }
    whereCondition.id = weaverId;

    const rows = await Weaver.findOne({
      where: whereCondition,
      attributes: ['id', 'name', 'short_name']
    });

    let count = await WeaverProcess.count({
      include: [
        {
          model: Program,
          as: 'program',
          where: { program_name: { [Op.iLike]: 'Reel' } }
        }
      ],
      where: {
        weaver_id: weaverId
      }
    })

    let prcs_date = new Date().toLocaleDateString().replace(/\//g, '');
    let number = count + 1;
    const random_number = +performance.now().toString().replace('.', '7').substring(0, 4)
    let prcs_name = rows ? rows?.name.substring(0, 3).toUpperCase() : '';

    let reelLotNo = "REEL-WEA-" + prcs_name + "-" + prcs_date + random_number;

    return res.sendSuccess(res, { reelLotNo })

  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const exportWeaverSale = async (req: Request, res: Response) => {
  const excelFilePath = path.join("./upload", "weaver-sale.xlsx");
  const { weaverId, seasonId, programId }: any = req.query;
  try {
    if (!weaverId) {
      return res.sendError(res, "Need weaver Id")
    }
    const whereCondition: any = {};
    const searchTerm = req.query.search || "";
    if (searchTerm) {
      whereCondition[Op.or] = [
        { garment_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { brand_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
        { '$weaver.name$': { [Op.iLike]: `%${searchTerm}%` } },
        { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
        { '$dyingwashing.name$': { [Op.iLike]: `%${searchTerm}%` } },
        { '$buyer.name$': { [Op.iLike]: `%${searchTerm}%` } },
        { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
        { vehicle_no: { [Op.iLike]: `%${searchTerm}%` } },
        { transaction_agent: { [Op.iLike]: `%${searchTerm}%` } },
        { transporter_name: { [Op.iLike]: `%${searchTerm}%` } },
        { bill_of_ladding: { [Op.iLike]: `%${searchTerm}%` } },
        { processor_name: { [Op.iLike]: `%${searchTerm}%` } },
        { processor_address: { [Op.iLike]: `%${searchTerm}%` } },
      ];
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
    whereCondition.weaver_id = req.query.weaverId
    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    worksheet.mergeCells('A1:N1');
    const mergedCell = worksheet.getCell('A1');
    mergedCell.value = 'CottonConnect | Sale';
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.", "Date", "Season", "Sold To", "Programme", "Garment Order Reference", "Brand Order Reference",
      "Invoice No", "Batch Lot No", "Quanitity in Mts",
      "Vehicle No", "Transcation via trader", "Agent Details"
    ]);
    headerRow.font = { bold: true };
    let include = [
      {
        model: Weaver,
        as: "weaver",
        attributes: ['id', 'name', 'address']
      },
      {
        model: Season,
        as: "season",
        attributes: ['id', 'name']
      },
      {
        model: Program,
        as: "program",
        attributes: ['id', 'program_name']
      },
      {
        model: Garment,
        as: "buyer",
        attributes: ['id', 'name', 'address']
      },
      {
        model: Fabric,
        as: "dyingwashing",
        attributes: ['id', 'name', 'address']
      }
    ];;
    // const weaver = await WeaverSales.findAll({
    //     attributes: [
    //         [Sequelize.col('date'), 'date'],
    //         [Sequelize.col('"season"."name"'), 'seasons'],
    //         [Sequelize.col('"buyer"."name"'), 'buyers'],
    //         [Sequelize.col('garment_order_ref'), 'garment_order_ref'],
    //         [Sequelize.col('brand_order_ref'), 'brand_order_ref'],
    //         [Sequelize.col('invoice_no'), 'invoice_no'],
    //         [Sequelize.col('batch_lot_no'), 'batch_lot_no'],
    //         [Sequelize.col('bale_ids'), 'bale_ids'],
    //         [Sequelize.col('"fabric"."fabricType_name"'), 'fabrics'],
    //         [Sequelize.col('fabric_contruction'), 'fabric_contruction'],
    //         [Sequelize.col('fabric_length'), 'length'],
    //         [Sequelize.col('fabric_gsm'), 'fabric_gsm'],
    //         [Sequelize.col('fabric_weight'), 'fabric_weight'],
    //         [Sequelize.col('fabric_weight'), 'fabric_weight'],
    //         [Sequelize.col('transaction_via_trader'), 'transaction_via_trader'],
    //     ],
    //     where: whereCondition,
    //     include: include
    // });


    const weaver = await WeaverSales.findAll({
      where: whereCondition,
      include: include,
      order: [
        [
          'id', 'desc'
        ]
      ]
    });

    // Append data to worksheet
    for await (const [index, item] of weaver.entries()) {

      const rowValues = Object.values({
        index: index + 1,
        date: item.date ? item.date : "",
        season: item.season ? item.season.name : "",
        buyer_id: item.buyer
          ? item.buyer.name
          : item.dyingwashing
            ? item.dyingwashing.name
            : item.processor_name,
        program: item.program ? item.program.program_name : "",
        garment_order_ref: item.garment_order_ref ? item.garment_order_ref : "",
        brand_order_ref: item.brand_order_ref ? item.brand_order_ref : "",
        invoice: item.invoice_no ? item.invoice_no : "",
        lotNo: item.batch_lot_no ? item.batch_lot_no : "",
        total: item.total_yarn_qty,
        vichle: item.vehicle_no ? item.vehicle_no : '',
        transaction_via_trader: item.transaction_via_trader ? 'Yes' : 'No',
        agent: item.transaction_agent ? item.transaction_agent : ''
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
      data: process.env.BASE_URL + "weaver-sale.xlsx",
    });
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);

  }
};

const exportWeaverProcess = async (req: Request, res: Response) => {
  const excelFilePath = path.join("./upload", "weaver-process.xlsx");
  const { weaverId, seasonId, programId }: any = req.query;
  try {
    if (!weaverId) {
      return res.sendError(res, "Need weaver Id")
    }
    const whereCondition: any = {};
    const searchTerm = req.query.search || "";
    if (searchTerm) {
      whereCondition[Op.or] = [
        { garment_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { brand_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
        { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { blend_material: { [Op.iLike]: `%${searchTerm}%` } },
        { blend_vendor: { [Op.iLike]: `%${searchTerm}%` } },
        { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
        // { '$yarncount.yarnCount_name$': { [Op.iLike]: `%${searchTerm}%` } },
        { '$weaver.name$': { [Op.iLike]: `%${searchTerm}%` } },
        { '$dyeing.processor_name$': { [Op.iLike]: `%${searchTerm}%` } },
        { '$dyeing.process_name$': { [Op.iLike]: `%${searchTerm}%` } },
        { job_details_garment: { [Op.iLike]: `%${searchTerm}%` } },
      ];
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
    whereCondition.weaver_id = req.query.weaverId
    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    worksheet.mergeCells('A1:P1');
    const mergedCell = worksheet.getCell('A1');
    mergedCell.value = 'CottonConnect | Process';
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.", "Date", "Fabric Production Start Date", "Fabric Production End Date", "Season", "Finished Batch Lot No", "Fabric Reel Lot No", "Garment Order Reference", "Brand Order Reference", "Programme",
      "Job Details from garment", "Knit Fabric Type", "Fabric Length in Mts", "Fabric GSM", "Total Finished Fabric Length in Mts", "Total Yarn Utilized"
    ]);
    headerRow.font = { bold: true };
    let include = [
      {
        model: Weaver,
        as: "weaver",
        attributes: ['id', 'name', 'address']
      },
      {
        model: Season,
        as: "season",
        attributes: ['id', 'name']
      },
      {
        model: Program,
        as: "program",
        attributes: ['id', 'program_name']
      },
      {
        model: Dyeing,
        as: "dyeing",
      },
      // {
      //   model: YarnCount,
      //   as: "yarncount",
      //   attributes: ['id', 'yarnCount_name']
      // }
    ];;


    const weaver = await WeaverProcess.findAll({
      where: whereCondition,
      include: include,
      order: [
        [
          'id', 'desc'
        ]
      ]
    });

    // Append data to worksheet
    for await (const [index, item] of weaver.entries()) {
      let fabricType: string = "";
      let fabricGSM: string = "";
      let fabricLength: string = "";

      if (item.fabric_type && item.fabric_type.length > 0) {
        let type = await FabricType.findAll({ where: { id: { [Op.in]: item.fabric_type } } });
        for (let i of type) {
          fabricType += `${i.fabricType_name},`
        }
      }

      fabricGSM = item?.fabric_gsm?.length > 0 ? item?.fabric_gsm.join(",") : "";
      fabricLength = item?.fabric_length?.length > 0 ? item?.fabric_length.join(",") : "";

      const rowValues = Object.values({
        index: index + 1,
        date: item.date ? item.date : '',
        from_date: item.from_date ? item.from_date : '',
        to_date: item.to_date ? item.to_date : '',
        season: item.season ? item.season.name : '',
        lotNo: item.batch_lot_no ? item.batch_lot_no : '',
        reelLotNo: item.reel_lot_no ? item.reel_lot_no : '',
        garment_order_ref: item.garment_order_ref ? item.garment_order_ref : '',
        brand_order_ref: item.brand_order_ref ? item.brand_order_ref : '',
        program: item.program ? item.program.program_name : '',
        jobDetails: item.job_details_garment ? item.job_details_garment : '',
        fabricType: fabricType,
        fabricLength: fabricLength,
        fabricGSM: fabricGSM,
        totalLength: item.total_fabric_length,
        totalYarn: item.total_yarn_qty,
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
      data: process.env.BASE_URL + "weaver-process.xlsx",
    });
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);

  }
};

const deleteWeaverSales = async (req: Request, res: Response) => {
  try {
    if (!req.body.id) {
      return res.sendError(res, "Need Sales Id");
    }
    let yarn_selections = await WeaverFabricSelection.findAll({
      where: {
        sales_id: req.body.id,
      },
    });
    for await (let yarn of yarn_selections) {
      WeaverProcess.update(
        {
          qty_stock: sequelize.literal(`qty_stock + ${yarn.qty_used}`),
        },
        {
          where: {
            id: yarn.fabric_id,
          },
        }
      );
      const fabrics = await WeaverFabric.findOne({ where: { id: yarn.weaver_fabric } });
      if (fabrics) {
       WeaverFabric.update(
          { sold_status: false, fabric_length_stock: Number(fabrics.fabric_length_stock) + Number(yarn.qty_used)},
          { where: { id: yarn.weaver_fabric } }
        );
      }
      // let updatee = WeaverFabric.update(
      //   { sold_status: false },
      //   { where: { id: yarn.weaver_fabric } }
      // );
    };

    WeaverSales.destroy({
      where: {
        id: req.body.id,
      },
    });

    WeaverFabricSelection.destroy({
      where: {
        sales_id: req.body.id,
      },
    });
    return res.sendSuccess(res, {
      message: "Successfully deleted this process",
    });
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const getWeaverDyeing = async (req: Request, res: Response) => {
  try {
    let whereCondition: any = {};
    if (!req.query.id) {
      return res.sendError(res, "Need Id");
    }

    if (req.query.status == 'true') {
      whereCondition.status = true
    }

    let id = req.query.id;
    let weaver = await Dyeing.findOne({ where: { id: id, ...whereCondition, } });

    res.sendSuccess(res, weaver);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

//fetch knitter Sale by id
const fetchWeaverSale = async (req: Request, res: Response) => {
  const { salesId } = req.query;
  const whereCondition: any = {};
  try {
    if (!salesId) {
      return res.sendError(res, "need sales id");
    }
    whereCondition.id = salesId;

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
    const rows = await WeaverSales.findOne({
      where: whereCondition,
      include: include,
    });
    let fabricType = [];

    if (rows.dataValues?.fabric_type.length > 0) {
      fabricType = await FabricType.findAll({
        attributes: ["id", "fabricType_name"],
        where: { id: { [Op.in]: rows.dataValues?.fabric_type } },
      });
    }
    let data = { ...rows.dataValues, fabricType }
    return res.sendSuccess(res, data);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

//fetch Weaver transaction with filters
const fetchWeaverDashBoard = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { seasonId, weaverId, status, filter, programId, spinnerId, invoice, lotNo, yarnCount, yarnType, reelLotNo }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  const yarnTypeArray = yarnType?.split(',')?.map((item: any) => item.trim());
  try {
    if (!weaverId) {
      return res.sendError(res, 'Need Weaver Id ');
    }
    if (!status) {
      return res.sendError(res, 'Need  status');
    }
    if (searchTerm) {
      whereCondition[Op.or] = [
        { order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by batch lot number
        { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } }, // Search by batch lot number
        { box_ids: { [Op.iLike]: `%${searchTerm}%` } }, // Search by batch lot number
        { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } }, // Search by batch lot number
        { invoice_no: { [Op.iLike]: `%${searchTerm}%` } }, // Search by invoice number
        // { yarn_type: { [Op.iLike]: `%${searchTerm}%` } }, 
        { vehicle_no: { [Op.iLike]: `%${searchTerm}%` } }, // Search by invoice number
        { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by program
        { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search season name
        { '$spinner.name$': { [Op.iLike]: `%${searchTerm}%` } },// Search season spinner name
        // { '$yarncount.yarnCount_name$': { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    if (status === 'Pending') {
      whereCondition.buyer_id = weaverId
      whereCondition.status = { [Op.in]: ['Pending', 'Pending for QR scanning'] }
    }
    if (status === 'Sold') {
      whereCondition.buyer_id = weaverId
      whereCondition.status = 'Sold';
    }
    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.season_id = { [Op.in]: idArray };
    }
    if (spinnerId) {
      const idArray: number[] = spinnerId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.spinner_id = { [Op.in]: idArray };
    }
    if (filter === 'Quantity') {
      whereCondition.qty_stock = { [Op.gt]: 0 }
    }
    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.program_id = { [Op.in]: idArray };
    }

    if (invoice) {
      const idArray: any[] = invoice
        .split(",")
        .map((id: any) => id);
      whereCondition.invoice_no = { [Op.in]: idArray };
    }
    if (lotNo) {
      const idArray: any[] = lotNo
        .split(",")
        .map((id: any) => id);
      whereCondition.batch_lot_no = { [Op.in]: idArray };
    }
    if (reelLotNo) {
      const filterValues: any[] = reelLotNo
        .split(",")
        .map((value: any) => value.trim());

      whereCondition[Op.or] = filterValues.map((value) => ({
        reel_lot_no: { [Op.iLike]: `%${value}%` }
      }))
    }
    if (yarnCount) {
      const idArray: number[] = yarnCount
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.yarn_count = { [Op.contains]: idArray };
    }
    if (yarnType) {
      whereCondition.yarn_type = { [Op.contains]: yarnTypeArray };
    }


    let include = [
      {
        model: Spinner,
        as: "spinner",
      },
      {
        model: Season,
        as: "season",
      },
      {
        model: Program,
        as: "program",
      },
      // {
      //   model: YarnCount,
      //   as: 'yarncount',
      //   attributes: ['id', 'yarnCount_name']
      // },
    ];
    //fetch data with pagination
    if (req.query.pagination === "true") {
      const { count, rows } = await SpinSales.findAndCountAll({
        where: whereCondition,
        include: include,
        order: [
          [
            'id', 'desc'
          ]
        ],
        offset: offset,
        limit: limit,
      });
      let data = [];

      for await (let row of rows) {
        let yarncount = [];

        if (row.dataValues?.yarn_count.length > 0) {
          yarncount = await YarnCount.findAll({
            attributes: ["id", "yarnCount_name"],
            where: { id: { [Op.in]: row.dataValues?.yarn_count } }
          });
        }

        data.push({
          ...row.dataValues,
          yarncount
        })
      }
      return res.sendPaginationSuccess(res, data, count);
    } else {
      const gin = await SpinSales.findAll({
        where: whereCondition,
        include: include,
        order: [
          [
            'id', 'desc'
          ]
        ]
      });
      let data = [];

      for await (let row of gin) {
        let yarncount = [];

        if (row.dataValues?.yarn_count.length > 0) {
          yarncount = await YarnCount.findAll({
            attributes: ["id", "yarnCount_name"],
            where: { id: { [Op.in]: row.dataValues?.yarn_count } }
          });
        }

        data.push({
          ...row.dataValues,
          yarncount
        })
      }
      return res.sendSuccess(res, data);
    }
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message);
  }
};

//update Weaver transactions to accept and reject
const updateStatusWeaverSale = async (req: Request, res: Response) => {
  try {
    let update = [];
    for (const obj of req.body.items) {
      const data = {
        status: obj.status,
        accept_date: obj.status === "Sold" ? new Date().toISOString() : null,
      };
      let result = await SpinSales.update(data, { where: { id: obj.id } });
      update.push(result);
    }

    res.sendSuccess(res, { update });
  } catch (error: any) {
    return res.sendError(res, error.message, error);
  }
};

const countCottonBaleWithProgram = async (req: Request, res: Response) => {
  try {
    if (!req.query.weaverId) {
      return res.sendError(res, "Need Weaver Id");
    }
    let result = await Weaver.findOne({ where: { id: req.query.weaverId } });
    let program = await Program.findAll({
      where: {
        id: result.program_id,
      },
      attributes: ["id", "program_name"],
    });
    let resulting: any = [];
    for await (let obj of program) {
      let whereCondition: any = {};
      whereCondition.buyer_id = req.query.weaverId;
      whereCondition.status = "Sold";
      const weaver = await SpinSales.findOne({
        where: { ...whereCondition, program_id: obj.id },
        attributes: [
          [Sequelize.fn("SUM", Sequelize.col("total_qty")), "totalQuantity"],
          [
            Sequelize.fn("SUM", Sequelize.col("qty_stock")),
            "totalQuantityStock",
          ],
        ],
        group: ["program_id"],
      });

      let data = await WeaverSales.findAll({
        where: {
          weaver_id: req.query.weaverId,
          program_id: obj.id,
        },
        attributes: [
          [Sequelize.fn("SUM", Sequelize.col("fabric_length")), "total"],
        ],
        include: [
          {
            model: FabricType,
            as: "fabric",
            attributes: ["id", "fabricType_name"],
          },
          {
            model: Program,
            as: "program",
            attributes: [],
          },
        ],
        group: ["fabric.id", "program_id"],
      });
      resulting.push({ program: obj, fabric: data, quantity: weaver });
    }
    res.sendSuccess(res, resulting);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const getWeaverProgram = async (req: Request, res: Response) => {
  try {
    if (!req.query.weaverId) {
      return res.sendError(res, "Need Weaver Id");
    }

    let weaverId = req.query.weaverId;
    let weaver = await Weaver.findOne({ where: { id: weaverId } });

    let data = await Program.findAll({
      where: {
        id: { [Op.in]: weaver.program_id },
      },
    });
    res.sendSuccess(res, data);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const getSpinnerTransaction = async (req: Request, res: Response) => {
  const { weaverId, status, filter, programId, spinnerId }: any = req.query;
  const whereCondition: any = {};
  try {
    if (!weaverId) {
      return res.sendError(res, 'Need Knitter Id ');
    }
    if (!status) {
      return res.sendError(res, 'Need  status');
    }

    if (status === 'Pending') {
      whereCondition.buyer_id = weaverId
      whereCondition.status = { [Op.in]: ['Pending', 'Pending for QR scanning'] }
    }
    if (status === 'Sold') {
      whereCondition.buyer_id = weaverId
      whereCondition.status = 'Sold';
    }

    if (filter === 'Quantity') {
      whereCondition.qty_stock = { [Op.gt]: 0 }
    }
    const spinner = await SpinSales.findAll({
      attributes: ['spinner_id', 'spinner.name'],
      where: whereCondition,
      include: [
        {
          model: Spinner,
          as: 'spinner',
          attributes: ['id', 'name']
        }
      ],
      group: ['spinner_id', "spinner.id"]
    });

    res.sendSuccess(res, spinner);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const getInvoiceAndyarnType = async (req: Request, res: Response) => {
  const { weaverId, status, spinnerId, filter }: any = req.query;
  const whereCondition: any = {};
  try {
    if (!weaverId) {
      return res.sendError(res, 'Need Weaver Id ');
    }
    if (!status) {
      return res.sendError(res, 'Need  status');
    }

    if (status === 'Pending') {
      whereCondition.buyer_id = weaverId
      whereCondition.status = { [Op.in]: ['Pending', 'Pending for QR scanning'] }
    }

    if (status === 'Sold') {
      whereCondition.buyer_id = weaverId
      whereCondition.status = 'Sold';
    }

    if (filter === 'Quantity') {
      whereCondition.qty_stock = { [Op.gt]: 0 }
    }
    if (spinnerId) {
      const idArray: number[] = spinnerId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.spinner_id = { [Op.in]: idArray };
    }

    const invoice = await SpinSales.findAll({
      attributes: ['invoice_no', 'batch_lot_no'],
      where: whereCondition,
      group: ['invoice_no', 'batch_lot_no']
    });
    // const reelLot = await SpinSales.findAll({
    //     attributes: ['reel_lot_no'],
    //     where: { ...whereCondition, reel_lot_no: { [Op.not]: null } },
    //     group: ['reel_lot_no']
    // });
    const ids = await SpinSales.findAll({
      attributes: ['id'],
      where: { ...whereCondition, reel_lot_no: { [Op.not]: null } },
    });

    let salesId = ids.map((item: any) => item.dataValues.id)

    let reelLot = await SpinProcessYarnSelection.findAll({
      attributes: [[Sequelize.col('process.reel_lot_no'), 'reel_lot_no']],
      where: { sales_id: { [Op.in]: salesId } },
      include: [
        {
          model: SpinProcess,
          as: 'process',
          where: { reel_lot_no: { [Op.not]: null } },
          attributes: []
        }
      ],
      group: ['process.reel_lot_no']
    });

    const yarncountData = await SpinSales.findAll({
      attributes: ['yarn_count'],
      where: whereCondition,
      group: ['yarn_count'],
    });

    const checkyarnData = yarncountData.map((item: any) => item.yarn_count).flat();
    const yarnCounts = await YarnCount.findAll({
      attributes: ["id", "yarnCount_name"],
      where: {
        id: {
          [Op.in]: checkyarnData
        }
      },
    });

    const yarn_type_fetch = await SpinSales.findAll({
      attributes: ["yarn_type"],
      where: whereCondition,
      group: ["yarn_type"],
    });
    const yarn_type = yarn_type_fetch.map((item: any, i: any) => {
      return { yarn_type: [...new Set(item.yarn_type)] }
    })

    res.sendSuccess(res, { invoice, reelLot, yarn_type, yarncount: yarnCounts });
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const getChooseFabricFilters = async (req: Request, res: Response) => {
  const { weaverId, programId }: any = req.query;
  const whereCondition: any = {};
  try {
    if (!weaverId) {
      return res.sendError(res, 'Need Weaver Id ');
    }

    if (weaverId) {
      whereCondition.weaver_id = weaverId;
    }
    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.program_id = { [Op.in]: idArray };
    }
    whereCondition.qty_stock = { [Op.gt]: 0 }

    const batchLotNo = await WeaverProcess.findAll({
      attributes: ['batch_lot_no'],
      where: whereCondition,
      group: ['batch_lot_no']
    });
    const reelLot = await WeaverProcess.findAll({
      attributes: ['reel_lot_no'],
      where: { ...whereCondition, reel_lot_no: { [Op.not]: null } },
      group: ['reel_lot_no']
    });
    const noOfRolls = await WeaverProcess.findAll({
      attributes: ['no_of_rolls'],
      where: whereCondition,
      group: ['no_of_rolls']
    });

    res.sendSuccess(res, { batchLotNo, reelLot, noOfRolls });
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const getGarments = async (req: Request, res: Response) => {
  let weaverId = req.query.weaverId;
  let whereCondition: any = {};

  if (!weaverId) {
    return res.sendError(res, "Need Weaver Id ");
  }

  if (req.query.status == 'true') {
    whereCondition.status = true
  }
  let weaver = await Weaver.findOne({ where: { id: weaverId } });
  if (!weaver) {
    return res.sendError(res, "No Weaver Found ");
  }
  let garment = await Garment.findAll({
    attributes: ["id", "name"],
    where: { ...whereCondition, brand: { [Op.overlap]: weaver.dataValues.brand } },
  });
  res.sendSuccess(res, garment);
};

const getFabrics = async (req: Request, res: Response) => {
  let weaverId = req.query.weaverId;
  let whereCondition: any = {};

  if (req.query.status == 'true') {
    whereCondition.status = true
  }

  if (!weaverId) {
    return res.sendError(res, "Need Weaver Id ");
  }
  let weaver = await Weaver.findOne({ where: { id: weaverId } });
  if (!weaver) {
    return res.sendError(res, "No Weaver Found ");
  }

  let fabric = await Fabric.findAll({
    attributes: ["id", "name"],
    where: {
      ...whereCondition,
      brand: { [Op.overlap]: weaver.dataValues.brand },
      fabric_processor_type: { [Op.overlap]: [req.query.type] },
    },
  });
  res.sendSuccess(res, fabric);
};

const chooseWeaverFabric = async (req: Request, res: Response) => {
  const { weaverId, programId, lotNo, reelLotNo, noOfRolls, fabricType, seasonId }: any =
    req.query;

  const whereCondition: any = {};
  try {
    if (weaverId) {
      whereCondition.weaver_id = weaverId;
    }

    if (programId) {
      whereCondition.program_id = programId;
    }
    if (lotNo) {
      const idArray: any[] = lotNo.split(",").map((id: any) => id);
      whereCondition.batch_lot_no = { [Op.in]: idArray };
    }
    if (reelLotNo) {
      const idArray: any[] = reelLotNo.split(",").map((id: any) => id);
      whereCondition.reel_lot_no = { [Op.in]: idArray };
    }
    if (noOfRolls) {
      const idArray: any[] = noOfRolls.split(",").map((id: any) => id);
      whereCondition.no_of_rolls = { [Op.in]: idArray };
    }
    if (fabricType) {
      const idArray: any[] = fabricType
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.fabric_type = { [Op.overlap]: idArray };
    }

    if (seasonId) {
      const idArray: any[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.season_id = { [Op.in]: idArray };
    }

    let include = [
      {
        model: Weaver,
        as: "weaver",
        attributes: ["id", "name"],
      },
      {
        model: Program,
        as: "program",
        attributes: ["id", "program_name"],
      },
      // {
      //     model: YarnCount,
      //     as: "yarncount",
      //     attributes: ['id', 'yarnCount_name']
      // }
    ];
    whereCondition.qty_stock = { [Op.gt]: 0 };
    //fetch data with pagination

    const process = await WeaverProcess.findAll({
      where: whereCondition,
      include: include,
      order: [["id", "desc"]],
    });

    let data = [];

    for await (let row of process) {
      let list = [];

      if (row) {
        list = await WeaverFabric.findAll({
          where: { process_id: row.dataValues?.id, sold_status: false },
          include: [
            {
              model: FabricType,
              as: "fabric"
            },
          ],
          order: [["id", "desc"]],
        });
      }

      data.push({
        ...row.dataValues,
        fabrics: list,
      });
    }

    return res.sendSuccess(res, data);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const _getWeaverProcessTracingChartData = async (
  query: any
) => {
  let include = [
    {
      model: Weaver,
      as: "weaver",
    },
  ];

  let weavers = await WeaverProcess.findAll({
    where: query,
    include,
  });

  weavers = await Promise.all(
    weavers.map(async (el: any) => {
      el = el.toJSON();

      el.WeavSele = await YarnSelection.findAll({
        where: {
          sales_id: el.id,
        }
      });

      el.spin = await Promise.all(
        el.WeavSele.map(async (weavSeleItem: any) => {
          let spinSales = await SpinSales.findAll({
            where: {
              id: weavSeleItem.yarn_id, // Use yarn_id from KnitYarnSelection
            },
          });
          return {
            yarn_id: weavSeleItem.yarn_id,
            spinSales: spinSales,
          };
        }));

      el.spinsCount = el.spin.reduce((total: number, item: any) => total + item.spinSales.length, 0);
      el.spinskIds = el.spin.map((el: any) => el.buyer_id);

      el.spin = await Promise.all(
        el.spin.map(async (spinItem: any) => {
          // if(el.reel_lot_no) return _getSpinnerProcessTracingChartData(el.reel_lot_no);
          return await Promise.all(
            spinItem.spinSales.map(async (sale: any) => {
              if (sale.dataValues.reel_lot_no) {
                return _getSpinnerProcessTracingChartData(sale.dataValues.reel_lot_no);
              }
              // Handle cases where reel_lot_no might be undefined/null
              return null;
            })
          );
        })
      );
      return el;
    })
  );
  let key = Object.keys(query)[0];
  return formatDataFromWeaver(query[key], weavers);
};

const getWeaverProcessTracingChartData = async (
  req: Request,
  res: Response
) => {
  let query = req.query;
  let weavers = await _getWeaverProcessTracingChartData(query);
  res.sendSuccess(res, weavers);
};

const exportWeaverTransactionList = async (req: Request, res: Response) => {
  const excelFilePath = path.join("./upload", "Weaver_transaction_list.xlsx");

  try {
    const searchTerm = req.query.search || "";
    // Create the excel workbook file
    const { seasonId, weaverId, status, filter, programId, spinnerId, invoice, lotNo, yarnCount, yarnType, reelLotNo }: any = req.query;
    const yarnTypeArray = yarnType?.split(',')?.map((item: any) => item.trim());

    if (!weaverId) {
      return res.sendError(res, 'Need Weaver Id ');
    }
    if (!status) {
      return res.sendError(res, 'Need  status');
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
      "Sr No.", 'Date', 'Season', 'Spinner Name', 'Order Reference', 'Invoice Number',
      'Spin Lot No', 'Yarn REEL Lot No', 'Yarn Type', 'Yarn Count', 'No of Boxes', 'Box Id',
      'Total Weight (Kgs)', 'Program', 'Vehicle No', 'Transaction Via Trader', 'Agent Details'
    ]);
    headerRow.font = { bold: true };
    const whereCondition: any = {}
    if (status === 'Pending') {
      whereCondition.buyer_id = weaverId
      whereCondition.status = { [Op.in]: ['Pending', 'Pending for QR scanning'] }
    }
    if (status === 'Sold') {
      whereCondition.buyer_id = weaverId
      whereCondition.status = 'Sold';
    }
    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.season_id = { [Op.in]: idArray };
    }
    if (spinnerId) {
      const idArray: number[] = spinnerId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.spinner_id = { [Op.in]: idArray };
    }
    if (filter === 'Quantity') {
      whereCondition.qty_stock = { [Op.gt]: 0 }
    }
    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.program_id = { [Op.in]: idArray };
    }

    if (invoice) {
      const idArray: any[] = invoice
        .split(",")
        .map((id: any) => id);
      whereCondition.invoice_no = { [Op.in]: idArray };
    }
    if (lotNo) {
      const idArray: any[] = lotNo
        .split(",")
        .map((id: any) => id);
      whereCondition.batch_lot_no = { [Op.in]: idArray };
    }
    if (reelLotNo) {
      const filterValues: any[] = reelLotNo
        .split(",")
        .map((value: any) => value.trim());

      whereCondition[Op.or] = filterValues.map((value) => ({
        reel_lot_no: { [Op.iLike]: `%${value}%` }
      }))
    }
    if (yarnCount) {
      const idArray: number[] = yarnCount
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.yarn_count = { [Op.contains]: idArray };
    }
    if (yarnType) {
      whereCondition.yarn_type = { [Op.contains]: yarnTypeArray };
    }


    let include = [
      {
        model: Spinner,
        as: "spinner",
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

    const eaver = await SpinSales.findAll({
      where: whereCondition,
      order: [["id", "desc"]],
      include: include,
    });
    // Append data to worksheet
    for await (const [index, item] of eaver.entries()) {
      const rowValues = Object.values({
        index: index + 1,
        date: item.date ? item.date : '',
        season: item.season ? item.season.name : item.season.name,
        spinner_name: item.spinner ? item.spinner.name : item.spinner.name,
        order_ref: item.order_ref ? item.order_ref : '',
        invoice_no: item.invoice_no ? item.invoice_no : '',
        batch_lot_no: item.batch_lot_no ? item.batch_lot_no : '',
        reel_lot_no: item.reel_lot_no ? item.reel_lot_no : 'N/A',
        yarn_type: item.yarn_type ? item.yarn_type.map((item: any) => item)?.join(',') : '',
        yarn_count: item.yarn_count ? item.yarn_count.map((item: any) => item.yarnCount_name)?.join(',') : '',
        no_of_boxes: item.no_of_boxes,
        box_ids: item.box_ids,
        total_qty: item.total_qty,
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
      data: process.env.BASE_URL + "Weaver_transaction_list.xlsx",
    });
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);

  }
};

export {
  createWeaverProcess,
  updateWeaverProcess,
  fetchWeaverProcessPagination,
  fetchWeaverProcess,
  exportWeaverProcess,
  createWeaverSales,
  updateWeaverSales,
  fetchWeaverSalesPagination,
  fetchWeaverDashBoard,
  updateStatusWeaverSale,
  countCottonBaleWithProgram,
  exportWeaverSale,
  getWeaverProgram,
  getSpinnerTransaction,
  getInvoiceAndyarnType,
  deleteWeaverSales,
  getWeaverDyeing,
  getGarments,
  getFabrics,
  fetchFabricReelLotNo,
  getChooseFabricFilters,
  fetchWeaverSale,
  chooseWeaverFabric,
  getWeaverProcessTracingChartData,
  exportWeaverTransactionList,
  _getWeaverProcessTracingChartData
};
