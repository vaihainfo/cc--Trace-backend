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
import KnitSales from "../../models/knit-sales.model";
import FabricType from "../../models/fabric-type.model";
import Garment from "../../models/garment.model";
import Knitter from "../../models/knitter.model";
import YarnCount from "../../models/yarn-count.model";
import KnitYarnSelection from "../../models/knit-yarn-seletions.model";
import Fabric from "../../models/fabric.model";
import KnitProcess from "../../models/knit-process.model";
import KnitFabricSelection from "../../models/knit-fabric-selectiion.model";
import SpinProcessYarnSelection from "../../models/spin-process-yarn-seletions.model";
import SpinProcess from "../../models/spin-process.model";
import { send_knitter_mail } from "../send-emails";
import KnitFabric from "../../models/knit_fabric.model";
import { _getSpinnerProcessTracingChartData } from "../spinner/index";
import { formatDataFromKnitter } from "../../util/tracing-chart-data-formatter";
import Country from "../../models/country.model";
import PhysicalTraceabilityDataKnitter from "../../models/physical-traceability-data-knitter.model";
import Brand from "../../models/brand.model";
import PhysicalTraceabilityDataKnitterSample from "../../models/physical-traceability-data-knitter-sample.model";

const createKnitterProcess = async (req: Request, res: Response) => {
  try {
    let dyeing
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
      knitter_id: req.body.knitterId,
      program_id: req.body.programId,
      season_id: req.body.seasonId,
      date: req.body.date,
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
      fabric_weight: req.body.fabricWeight,
      batch_lot_no: req.body.batchLotNo,
      reel_lot_no: req.body.reelLotNo ? req.body.reelLotNo : null,
      job_details_garment: req.body.jobDetailsGarment,
      no_of_rolls: req.body.noOfRolls,
      dyeing_required: req.body.dyeingRequired,
      dyeing_id: dyeing ? dyeing.id : null,
      qty_stock: req.body.totalFabricWeight,
      physical_traceablity: req.body.physicalTraceablity,
      total_fabric_weight: req.body.totalFabricWeight,
      blend_invoice: req.body.blendInvoice,
      blend_document: req.body.blendDocuments,
      status: 'Pending'
    };

    const knit = await KnitProcess.create(data);
    let uniqueFilename = `knit_procees_qrcode_${Date.now()}.png`;
    let da = encrypt(`Knitter,Process,${knit.id}`);
    let aa = await generateOnlyQrCode(da, uniqueFilename);
    const gin = await KnitProcess.update(
      { qr: uniqueFilename },
      {
        where: {
          id: knit.id,
        },
      }
    );

    for await (let fabric of req.body.fabrics) {
      let data = {
        process_id: knit.id,
        fabric_type: fabric.fabricType,
        fabric_gsm: fabric.fabricGsm,
        fabric_weight: fabric.fabricWeight,
        fabric_weight_stock: fabric.fabricWeight,
        sold_status: false,
      };
      const yarns = await KnitFabric.create(data);
    }

    if (req.body.chooseYarn && req.body.chooseYarn.length > 0) {
      for await (let obj of req.body.chooseYarn) {
        let val = await SpinSales.findOne({ where: { id: obj.id } });
        if (val) {
          let update = await SpinSales.update(
            { qty_stock: val.dataValues.qty_stock - obj.qtyUsed },
            { where: { id: obj.id } }
          );
          await KnitYarnSelection.create({
            yarn_id: obj.id,
            sales_id: knit.id,
            qty_used: obj.qtyUsed,
          });
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
        knit_process_id: knit.id,
        knitter_id: req.body.knitterId
      };
      const physicalTraceabilityDataKnitter = await PhysicalTraceabilityDataKnitter.create(physicalTraceabilityData);

      for await (const weightAndRoll of req.body.weightAndRoll) {
        let brand = await Brand.findOne({
          where: { id: req.body.brandId }
        });

        const updatedCount = brand.dataValues.count + 1;
        let physicalTraceabilityDataKnitterSampleData = {
          physical_traceability_data_knitter_id: physicalTraceabilityDataKnitter.id,
          weight: weightAndRoll.weight,
          roll: weightAndRoll.roll,
          original_sample_status: weightAndRoll.originalSampleStatus,
          code: `DNA${req.body.knitterShortname}-${req.body.batchLotNo || ''}-${updatedCount}`,
          sample_result: 0
        };
        await PhysicalTraceabilityDataKnitterSample.create(physicalTraceabilityDataKnitterSampleData);

        await Brand.update(
          { count: updatedCount },
          { where: { id: brand.id } }
        );
      }
    }

    res.sendSuccess(res, { knit });
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.meessage);
  }
};

const updateKnitterProcess = async (req: Request, res: Response) => {
  try {
    if (!req.body.id) {
      return res.sendError(res, "need process id");
    }
    const data = {
      date: req.body.date,
      garment_order_ref: req.body.garmentOrderRef,
      brand_order_ref: req.body.brandOrderRef,
      fabric_gsm: req.body.fabricGsm,
      batch_lot_no: req.body.batchLotNo,
    };

    const knit = await KnitProcess.update(data, { where: { id: req.body.id } });

    for await (let fabric of req.body.fabrics) {
      let data = {
        fabric_gsm: fabric.fabric_gsm,
      };
      const yarns = await KnitFabric.update(data, { where: { id: fabric.id } });
    }
    res.sendSuccess(res, { knit });
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.meessage);
  }
};

//fetch knitter Process by id
const fetchKnitterProcess = async (req: Request, res: Response) => {
  const { id } = req.query;
  const whereCondition: any = {};
  try {
    if (!id) {
      return res.sendError(res, "need process id");
    }
    whereCondition.id = id;

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
    let rows = await KnitProcess.findOne({
      where: whereCondition,
      include: include,
    });
    let fabrics = await KnitFabric.findAll({ where: { process_id: id } });
    let data = { ...rows.dataValues, fabrics };
    return res.sendSuccess(res, data);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

//fetch knitter process by id
const fetchKnitterProcessPagination = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const {
    knitterId,
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
        { "$knitter.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$dyeing.processor_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$dyeing.process_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { job_details_garment: { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    if (knitterId) {
      whereCondition.knitter_id = knitterId;
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
      const { count, rows } = await KnitProcess.findAndCountAll({
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
      const gin = await KnitProcess.findAll({
        where: whereCondition,
        include: include,
        order: [["id", "asc"]],
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

//create knitter Sale
const createKnitterrSales = async (req: Request, res: Response) => {
  try {
    const data = {
      knitter_id: req.body.knitterId,
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
      total_yarn_qty: req.body.totalFabricWeight,
      total_fabric_weight: req.body.totalFabricWeight,
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
      qty_stock: req.body.totalFabricWeight,
      fabric_type: req.body.fabricType,
      no_of_rolls: req.body.noOfRolls,
      status: "Pending for QR scanning",
    };
    const kniSale = await KnitSales.create(data);
    let uniqueFilename = `knitter_sales_qrcode_${Date.now()}.png`;
    let da = encrypt(`Knitter,Sale,${kniSale.id}`);
    let aa = await generateOnlyQrCode(da, uniqueFilename);
    const gin = await KnitSales.update(
      { qr: uniqueFilename },
      {
        where: {
          id: kniSale.id,
        },
      }
    );
    if (req.body.chooseFabric && req.body.chooseFabric.length > 0) {
      for await (let obj of req.body.chooseFabric) {
        let val = await KnitProcess.findOne({ where: { id: obj.process_id } });
        if (val) {
          let update = await KnitProcess.update(
            { qty_stock: val.dataValues.qty_stock - obj.qtyUsed, status: 'Sold' },
            { where: { id: obj.process_id } }
          );
          const knitFabData = await KnitFabric.findOne({ where: { id: obj.id } });
          let updateFabrics = {}
          if (knitFabData.fabric_weight_stock - obj.qtyUsed <= 0) {
            updateFabrics = {
              sold_status: true,
              fabric_weight_stock: 0
            }
          } else {
            updateFabrics = {
              fabric_weight_stock: knitFabData.fabric_weight_stock - obj.qtyUsed
            }
          }
          const KnitFabricStatus = await KnitFabric.update(updateFabrics, { where: { id: obj.id } });

          // let updatee = await KnitFabric.update(
          //   { sold_status: true },
          //   { where: { id: obj.id } }
          // );
          await KnitFabricSelection.create({
            knit_fabric: obj.id,
            fabric_id: obj.process_id,
            sales_id: kniSale.id,
            qty_used: obj.qtyUsed,
          });
        }
      }
    }

    if (kniSale) {
      await send_knitter_mail(kniSale.id);
    }

    return res.sendSuccess(res, kniSale);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.meessage);
  }
};

//update knitter Sale
const updateKnitterrSales = async (req: Request, res: Response) => {
  try {
    if (!req.body.id) {
      return res.sendError(res, "need sales id");
    }
    const data = {
      date: req.body.date ? req.body.date : undefined,
      invoice_no: req.body.invoiceNo,
      vehicle_no: req.body.vehicleNo,
    };
    const kniSale = await KnitSales.update(data, {
      where: {
        id: req.body.id,
      },
    });

    return res.sendSuccess(res, kniSale);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.meessage);
  }
};

const deleteKnitterSales = async (req: Request, res: Response) => {
  try {
    if (!req.body.id) {
      return res.sendError(res, "Need Sales Id");
    }

    let yarn_selections = await KnitFabricSelection.findAll({
      where: {
        sales_id: req.body.id,
      },
      row: true,
    });


    for await (let yarn of yarn_selections) {
      KnitProcess.update(
        {
          qty_stock: sequelize.literal(`qty_stock + ${yarn.qty_used}`),
        },
        {
          where: {
            id: yarn.fabric_id,
          },
        }
      );
      const knitFabData = await KnitFabric.findOne({ where: { id: yarn.knit_fabric } });

      if (knitFabData) {
        let updatee = KnitFabric.update(
          { sold_status: false, fabric_weight_stock: Number(knitFabData.fabric_weight_stock) + Number(yarn.qty_used) },
          { where: { id: yarn.knit_fabric } }
        );
      }
      // let updatee =  KnitFabric.update(
      //   { sold_status: false },
      //   { where: { id: yarn.knit_fabric } }
      // );
    }

    KnitSales.destroy({
      where: {
        id: req.body.id,
      },
    });

    KnitFabricSelection.destroy({
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

//fetch knitter Sales with filters
const fetchKnitterSalesPagination = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { knitterId, seasonId, programId } = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        // Search by order ref
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$knitter.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { garment_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { brand_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
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
    if (knitterId) {
      whereCondition.knitter_id = knitterId;
    }
    if (seasonId) {
      whereCondition.season_id = seasonId;
    }
    if (programId) {
      whereCondition.program_id = programId;
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
    //fetch data with pagination
    if (req.query.pagination === "true") {
      const { count, rows } = await KnitSales.findAndCountAll({
        where: whereCondition,
        include: include,
        order: [["id", "desc"]],
        offset: offset,
        limit: limit,
      });
      return res.sendPaginationSuccess(res, rows, count);
    } else {
      const gin = await KnitSales.findAll({
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
const fetchKnitterSale = async (req: Request, res: Response) => {
  const { salesId } = req.query;
  const whereCondition: any = {};
  try {
    if (!salesId) {
      return res.sendError(res, "need sales id");
    }
    whereCondition.id = salesId;

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
    //fetch data with pagination
    const rows = await KnitSales.findOne({
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
    let data = { ...rows.dataValues, fabricType };
    return res.sendSuccess(res, data);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

//fetch fabric reel lot no
const fetchFabricReelLotNo = async (req: Request, res: Response) => {
  const { knitterId } = req.query;
  const whereCondition: any = {};
  try {
    if (!knitterId) {
      return res.sendError(res, "need knitterId id");
    }
    whereCondition.id = knitterId;

    const rows = await Knitter.findOne({
      where: whereCondition,
      attributes: ["id", "name", "short_name"],
      include: [{
        model: Country,
        as: 'country',
        attributes: ['id', 'county_name']
      }]
    });

    let count = await KnitProcess.count({
      include: [
        {
          model: Program,
          as: "program",
          where: { program_name: { [Op.iLike]: "Reel" } },
        },
      ],
      where: {
        knitter_id: knitterId,
      },
    });
    let currentDate = new Date();
    let day = String(currentDate.getUTCDate()).padStart(2, "0");
    let month = String(currentDate.getUTCMonth() + 1).padStart(2, "0"); // UTC months are zero-indexed, so we add 1
    let year = String(currentDate.getUTCFullYear());

    let prcs_date = day + month + year;

    let number = count + 1;
    let prcs_name = rows ? rows?.name.substring(0, 3).toUpperCase() : "";
    let country = rows ? rows?.country?.county_name.substring(0, 2).toUpperCase() : "";
    let reelLotNo = "REEL-KNI-" + prcs_name + "-" + country + "-" + prcs_date + "/" + number;

    return res.sendSuccess(res, { reelLotNo });
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const exportKnitterSale = async (req: Request, res: Response) => {
  const excelFilePath = path.join("./upload", "knitter-sale.xlsx");

  try {
    const whereCondition: any = {};
    const searchTerm = req.query.search || "";
    if (searchTerm) {
      whereCondition[Op.or] = [
        { garment_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { brand_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$knitter.name$": { [Op.iLike]: `%${searchTerm}%` } },
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
    whereCondition.knitter_id = req.query.knitterId;
    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    worksheet.mergeCells("A1:M1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Sale";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };
    // Set bold font for header row
    // const headerRow = worksheet.addRow([
    //     "Sr No.", "Date", "Season", "Sold To", "Order Reference",
    //     "Invoice No", "Finished Batch/Lot No",
    //     "Job details from garment", "Knit Fabric Type", "Finished Fabric Length in Mts", "Finished Fabric GSM", "Finished Fabric Net Weight (Kgs)",
    //     "Transcation via trader"
    // ]);
    const headerRow = worksheet.addRow([
      "Sr No.",
      "Date",
      "Season",
      "Sold To",
      "Program",
      "Garment Order Reference",
      "Brand Order Reference",
      "Invoice No",
      "Batch Lot No",
      "Quanitity in Kgs",
      "Vehicle No",
      "Transcation via trader",
      "Agent Details",
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
      },
    ];
    const weaver = await KnitSales.findAll({
      where: whereCondition,
      include: include,
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
        vichle: item.vehicle_no ? item.vehicle_no : "",
        transaction_via_trader: item.transaction_via_trader ? "Yes" : "No",
        agent: item.transaction_agent ? item.transaction_agent : "",
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
      data: process.env.BASE_URL + "knitter-sale.xlsx",
    });
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

const exportKnitterProcess = async (req: Request, res: Response) => {
  const excelFilePath = path.join("./upload", "knitter-process.xlsx");
  const { knitterId, seasonId, programId }: any = req.query;
  try {
    if (!knitterId) {
      return res.sendError(res, "Need knitter Id");
    }
    const whereCondition: any = {};
    const searchTerm = req.query.search || "";
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
        { "$knitter.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$dyeing.processor_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$dyeing.process_name$": { [Op.iLike]: `%${searchTerm}%` } },
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
    whereCondition.knitter_id = req.query.knitterId;
    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    worksheet.mergeCells("A1:N1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Process";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.",
      "Date",
      "Season",
      "Finished Batch Lot No",
      "Fabric Reel Lot No",
      "Garment Order Reference",
      "Brand Order Reference",
      "Program",
      "Job Details from garment",
      "Knit Fabric Type",
      "Fabric Net Weight in Kgs",
      "Fabric GSM",
      "Total Finished Fabric Net Weight in Kgs",
      "Total Yarn Utilized",
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
        model: Dyeing,
        as: "dyeing",
      },
      // {
      //   model: YarnCount,
      //   as: "yarncount",
      //   attributes: ["id", "yarnCount_name"],
      // },
    ];

    const weaver = await KnitProcess.findAll({
      where: whereCondition,
      include: include,
      order: [["id", "desc"]],
    });

    // Append data to worksheet
    for await (const [index, item] of weaver.entries()) {
      let fabricType: string = "";
      let fabricGSM: string = "";
      let fabricWeight: string = "";

      if (item.fabric_type && item.fabric_type.length > 0) {
        let type = await FabricType.findAll({
          where: { id: { [Op.in]: item.fabric_type } },
        });
        for (let i of type) {
          fabricType += `${i.fabricType_name},`;
        }
      }

      fabricGSM =
        item?.fabric_gsm?.length > 0 ? item?.fabric_gsm.join(",") : "";
      fabricWeight =
        item?.fabric_weight?.length > 0 ? item?.fabric_weight.join(",") : "";

      const rowValues = Object.values({
        index: index + 1,
        date: item.date ? item.date : "",
        season: item.season ? item.season.name : "",
        lotNo: item.batch_lot_no ? item.batch_lot_no : "",
        reelLotNo: item.reel_lot_no ? item.reel_lot_no : "",
        garment_order_ref: item.garment_order_ref ? item.garment_order_ref : "",
        brand_order_ref: item.brand_order_ref ? item.brand_order_ref : "",
        program: item.program ? item.program.program_name : "",
        jobDetails: item.job_details_garment ? item.job_details_garment : "",
        fabricType: fabricType,
        fabricWeight: fabricWeight,
        fabricGSM: fabricGSM,
        totalLength: item.total_fabric_weight,
        totalYarn: item.total_yarn_qty,
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
      data: process.env.BASE_URL + "knitter-process.xlsx",
    });
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

//fetch knitter transaction with filters
const fetchKnitterDashBoard = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const {
    seasonId,
    knitterId,
    status,
    filter,
    programId,
    spinnerId,
    invoice,
    lotNo,
    yarnCount,
    yarnType,
    reelLotNo,
  }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  const yarnTypeArray = yarnType?.split(',')?.map((item:any) => item.trim()); 
  try {
    if (!knitterId) {
      return res.sendError(res, "Need Knitter Id ");
    }
    if (!status) {
      return res.sendError(res, "Need  status");
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
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } }, // Search by program
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } }, // Search season name
        { "$spinner.name$": { [Op.iLike]: `%${searchTerm}%` } }, // Search season spinner name
        // { "$yarncount.yarnCount_name$": { [Op.iLike]: `%${searchTerm}%` } }, // Search season spinner name
      ];
    }
    if (status === "Pending") {
      whereCondition.knitter_id = knitterId;
      whereCondition.status = {
        [Op.in]: ["Pending", "Pending for QR scanning"],
      };
    }
    if (status === "Sold") {
      whereCondition.knitter_id = knitterId;
      whereCondition.status = "Sold";
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
    if (filter === "Quantity") {
      whereCondition.qty_stock = { [Op.gt]: 0 };
    }
    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.program_id = { [Op.in]: idArray };
    }

    if (invoice) {
      const idArray: any[] = invoice.split(",").map((id: any) => id);
      whereCondition.invoice_no = { [Op.in]: idArray };
    }
    if (lotNo) {
      const idArray: any[] = lotNo.split(",").map((id: any) => id);
      whereCondition.batch_lot_no = { [Op.in]: idArray };
    }
    if (reelLotNo) {
      const filterValues: any[] = reelLotNo
        .split(",")
        .map((value: any) => value.trim());

      whereCondition[Op.or] = filterValues.map((value) => ({
        reel_lot_no: { [Op.iLike]: `%${value}%` },
      }));
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
      //   as: "yarncount",
      // },
    ];
    //fetch data with pagination
    if (req.query.pagination === "true") {
      const { count, rows } = await SpinSales.findAndCountAll({
        where: whereCondition,
        include: include,
        order: [["id", "asc"]],
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
        order: [["id", "asc"]],
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
    return res.sendError(res, error.message);
  }
};

//update knitter transactions to accept and reject
const updateStatusKnitterSale = async (req: Request, res: Response) => {
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
    return res.sendError(res, error.meessage);
  }
};

//count the number of bales and total quantity stock With Program
const countCottonBaleWithProgram = async (req: Request, res: Response) => {
  try {
    if (!req.query.knitterId) {
      return res.sendError(res, "Need knitter Id");
    }
    let whereCondition: any = {};
    whereCondition.knitter_id = req.query.knitterId;
    whereCondition.status = "Sold";
    const weaver = await SpinSales.findAll({
      where: whereCondition,
      attributes: [
        [Sequelize.fn("SUM", Sequelize.col("total_qty")), "totalQuantity"],
        [Sequelize.fn("SUM", Sequelize.col("qty_stock")), "totalQuantityStock"],
      ],
      include: [
        {
          model: Program,
          as: "program",
          attributes: ["id", "program_name", "program_status"],
        },
      ],
      group: ["program.id"],
    });

    let data = await KnitSales.findAll({
      where: {
        knitter_id: req.query.knitterId,
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
          attributes: ["id", "program_name"],
        },
      ],
      group: ["fabric.id", "program.id"],
    });
    res.sendSuccess(res, { weaver, data });
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const getProgram = async (req: Request, res: Response) => {
  try {
    if (!req.query.knitterId) {
      return res.sendError(res, "Need Knitter Id");
    }

    let knitterId = req.query.knitterId;
    let result = await Knitter.findOne({ where: { id: knitterId } });

    let data = await Program.findAll({
      where: {
        id: { [Op.in]: result.program_id },
      },
    });
    res.sendSuccess(res, data);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const getSpinnerAndProgram = async (req: Request, res: Response) => {
  const { knitterId, status, filter, programId, spinnerId }: any = req.query;
  const whereCondition: any = {};
  try {
    if (!knitterId) {
      return res.sendError(res, "Need Knitter Id ");
    }
    if (!status) {
      return res.sendError(res, "Need  status");
    }

    if (status === "Pending") {
      whereCondition.knitter_id = knitterId;
      whereCondition.status = {
        [Op.in]: ["Pending", "Pending for QR scanning"],
      };
    }
    if (status === "Sold") {
      whereCondition.knitter_id = knitterId;
      whereCondition.status = "Sold";
    }

    const spinner = await SpinSales.findAll({
      attributes: ["spinner_id", "spinner.name"],
      where: whereCondition,
      include: [
        {
          model: Spinner,
          as: "spinner",
          attributes: ["id", "name"],
        },
      ],
      group: ["spinner_id", "spinner.id"],
    });
    const program = await SpinSales.findAll({
      attributes: ["program_id", "program.program_name"],
      where: whereCondition,
      include: [
        {
          model: Program,
          as: "program",
          attributes: ["id", "program_name"],
        },
      ],
      group: ["program_id", "program.id"],
    });
    const season = await SpinSales.findAll({
      attributes: ["season_id", "season.name"],
      where: whereCondition,
      include: [
        {
          model: Season,
          as: "season",
          attributes: ["id", "name"],
        },
      ],
      group: ["season_id", "season.id"],
    });
    res.sendSuccess(res, { spinner, program, season });
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const getInvoiceAndyarnType = async (req: Request, res: Response) => {
  const { knitterId, status, spinnerId }: any = req.query;
  const whereCondition: any = {};
  try {
    if (!knitterId) {
      return res.sendError(res, "Need Knitter Id ");
    }
    if (!status) {
      return res.sendError(res, "Need  status");
    }
    if (status === "Pending") {
      whereCondition.knitter_id = knitterId;
      whereCondition.status = {
        [Op.in]: ["Pending", "Pending for QR scanning"],
      };
    }
    if (status === "Sold") {
      whereCondition.knitter_id = knitterId;
      whereCondition.status = "Sold";
    }

    if (spinnerId) {
      const idArray: number[] = spinnerId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.spinner_id = { [Op.in]: idArray };
    }

    const invoice = await SpinSales.findAll({
      attributes: ["invoice_no", "batch_lot_no"],
      where: whereCondition,
      group: ["invoice_no", "batch_lot_no"],
    });
    const ids = await SpinSales.findAll({
      attributes: ["id"],
      where: { ...whereCondition, reel_lot_no: { [Op.not]: null } },
    });

    let salesId = ids.map((item: any) => item.dataValues.id);

    let reelLot = await SpinProcessYarnSelection.findAll({
      attributes: [[Sequelize.col("process.reel_lot_no"), "reel_lot_no"]],
      where: { sales_id: { [Op.in]: salesId } },
      include: [
        {
          model: SpinProcess,
          as: "process",
          where: { reel_lot_no: { [Op.not]: null } },
          attributes: [],
        },
      ],
      group: ["process.reel_lot_no"],
    });

    const yarncountData = await SpinSales.findAll({
      attributes: ['yarn_count'],
      where: whereCondition,
      group: ['yarn_count'],
    });

    const checkyarnData = yarncountData.map((item:any)=> item.yarn_count).flat();
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
    const yarn_type = yarn_type_fetch.map((item:any, i:any)=> {
      return {yarn_type:  [...new Set(item.yarn_type)] }
    })

    res.sendSuccess(res, { invoice, yarncount: yarnCounts, yarn_type, reelLot });
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const getChooseFabricFilters = async (req: Request, res: Response) => {
  const { knitterId, programId }: any = req.query;
  const whereCondition: any = {};
  try {
    if (!knitterId) {
      return res.sendError(res, "Need Knitter Id ");
    }

    if (knitterId) {
      whereCondition.knitter_id = knitterId;
    }
    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.program_id = { [Op.in]: idArray };
    }
    whereCondition.qty_stock = { [Op.gt]: 0 };

    const batchLotNo = await KnitProcess.findAll({
      attributes: ["batch_lot_no"],
      where: whereCondition,
      group: ["batch_lot_no"],
    });
    const reelLot = await KnitProcess.findAll({
      attributes: ["reel_lot_no"],
      where: { ...whereCondition, reel_lot_no: { [Op.not]: null } },
      group: ["reel_lot_no"],
    });
    const noOfRolls = await KnitProcess.findAll({
      attributes: ["no_of_rolls"],
      where: whereCondition,
      group: ["no_of_rolls"],
    });

    res.sendSuccess(res, { batchLotNo, reelLot, noOfRolls });
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const getGarments = async (req: Request, res: Response) => {
  let knitterId = req.query.knitterId;
  if (!knitterId) {
    return res.sendError(res, "Need Knitter Id ");
  }
  let ress = await Knitter.findOne({ where: { id: knitterId } });
  if (!ress) {
    return res.sendError(res, "No Knitter Found ");
  }
  let garment = await Garment.findAll({
    attributes: ["id", "name"],
    where: { brand: { [Op.overlap]: ress.dataValues.brand } },
  });
  res.sendSuccess(res, garment);
};

const getFabrics = async (req: Request, res: Response) => {
  let knitterId = req.query.knitterId;
  if (!knitterId) {
    return res.sendError(res, "Need Knitter Id ");
  }
  let ress = await Knitter.findOne({ where: { id: knitterId } });
  if (!ress) {
    return res.sendError(res, "No Knitter Found ");
  }

  let fabric = await Fabric.findAll({
    attributes: ["id", "name"],
    where: {
      brand: { [Op.overlap]: ress.dataValues.brand },
      fabric_processor_type: { [Op.overlap]: [req.query.type] },
    },
  });
  res.sendSuccess(res, fabric);
};

const chooseFabricProcess = async (req: Request, res: Response) => {
  const { knitterId, programId, lotNo, reelLotNo, noOfRolls, fabricType }: any =
    req.query;

  const whereCondition: any = {};
  try {
    if (knitterId) {
      whereCondition.knitter_id = knitterId;
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

    let include = [
      {
        model: Knitter,
        as: "knitter",
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

    const knitProcess = await KnitProcess.findAll({
      where: whereCondition,
      include: include,
      order: [["id", "desc"]],
    });

    let data = [];

    for await (let row of knitProcess) {
      let list = [];

      if (row) {
        list = await KnitFabric.findAll({
          where: { process_id: row.dataValues?.id, sold_status: false },
          include: [
            {
              model: FabricType,
              as: "fabric",
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

const getKnitterProcessTracingChartData = async (
  req: Request,
  res: Response
) => {
  let query = req.query;
  let include = [
    {
      model: Knitter,
      as: "knitter",
    },
  ];
  let knitters = await KnitProcess.findAll({
    where: query,
    include,
  });

  knitters = await Promise.all(
    knitters.map(async (el: any) => {
      el = el.toJSON();
      el.spin = await SpinSales.findAll({
        where: {
          knitter_id: el.knitter.id,
        },
      });
      el.spinsCount = el.spin.length;
      el.spinskIds = el.spin.map((el: any) => el.knitter_id);
      console.log("spins received ", el.spin.length);
      el.spin = await Promise.all(
        el.spin.map(async (el: any) => {
          console.log("getting data for ", el.reel_lot_no);
          return _getSpinnerProcessTracingChartData(el.reel_lot_no);
        })
      );
      return el;
    })
  );
  let key = Object.keys(req.query)[0];
  res.sendSuccess(res, formatDataFromKnitter(req.query[key], knitters));
};

export {
  createKnitterProcess,
  updateKnitterProcess,
  fetchKnitterProcessPagination,
  fetchKnitterProcess,
  createKnitterrSales,
  updateKnitterrSales,
  fetchKnitterSalesPagination,
  fetchKnitterDashBoard,
  countCottonBaleWithProgram,
  updateStatusKnitterSale,
  exportKnitterSale,
  exportKnitterProcess,
  getProgram,
  getSpinnerAndProgram,
  getInvoiceAndyarnType,
  deleteKnitterSales,
  getGarments,
  fetchKnitterSale,
  getFabrics,
  fetchFabricReelLotNo,
  getChooseFabricFilters,
  chooseFabricProcess,
  getKnitterProcessTracingChartData,
};
