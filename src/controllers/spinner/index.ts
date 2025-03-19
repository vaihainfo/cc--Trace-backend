import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import {
  encrypt,
  generateGinSalesHtml,
  generateOnlyQrCode,
} from "../../provider/qrcode";
import * as ExcelJS from "exceljs";
import * as path from "path";
import Season from "../../models/season.model";
import Program from "../../models/program.model";
import Spinner from "../../models/spinner.model";
import State from "../../models/state.model";
import sequelize from "../../util/dbConn";
import Dyeing from "../../models/dyeing.model";
import SpinProcess from "../../models/spin-process.model";
import YarnCount from "../../models/yarn-count.model";
import CottonMix from "../../models/cotton-mix.model";
import SpinSales from "../../models/spin-sales.model";
import Ginner from "../../models/ginner.model";
import GinSales from "../../models/gin-sales.model";
import Knitter from "../../models/knitter.model";
import Weaver from "../../models/weaver.model";
import LintSelections from "../../models/lint-seletions.model";
import SpinProcessYarnSelection from "../../models/spin-process-yarn-seletions.model";
import ComberSelection from "../../models/comber-selection.model";
import { send_spin_mail } from "../send-emails";
import SpinYarn from "../../models/spin-yarn.model";
import FarmGroup from "../../models/farm-group.model";
import Village from "../../models/village.model";
import Transaction from "../../models/transaction.model";
import Farmer from "../../models/farmer.model";
import { formatDataForSpinnerProcess } from "../../util/tracing-chart-data-formatter";
import PhysicalTraceabilityDataSpinner from "../../models/physical-traceability-data-spinner.model";
import Brand from "../../models/brand.model";
import PhysicalTraceabilityDataSpinnerSample from "../../models/physical-traceability-data-spinner-sample.model";
import BaleSelection from "../../models/bale-selection.model";
import GinBale from "../../models/gin-bale.model";
import { _getGinnerProcessTracingChartData } from "../ginner";
import CombernoilGeneration from "../../models/combernoil_generation.model";
import SpinCombernoilSale from "../../models/spin_combernoil_sale.model";
import GinToGinSale from "../../models/gin-to-gin-sale.model";
// import SpinSelectedBlend from "../../models/spin_selected_blend";

//create Spinner Process
const createSpinnerProcess = async (req: Request, res: Response) => {
    const transaction = await sequelize.transaction();
  try {
    let program = await Program.findOne({
      where: { program_name: { [Op.iLike]: "Reel" } }, transaction,
    });
    let abc;
    if (program.dataValues.id === req.body.programId) {
      abc = await yarnId(req.body.spinnerId, req.body.date);
        }

        if (req.body.spinnerId && req.body.seasonId && req.body.programId && req.body.totalQty && req.body.batchLotNo) {
            let ProcessExist = await SpinProcess.findOne(
              { where: { 
                spinner_id: req.body.spinnerId,
                program_id: req.body.programId,
                season_id: req.body.seasonId,
                total_qty: Number(req.body.totalQty),
                net_yarn_qty: req.body.netYarnQty,
                batch_lot_no: req.body.batchLotNo,
                yarn_type: req.body.yarnType,
                yarn_realisation: req.body.yarnRealisation,
              }, transaction },
            );
            if (ProcessExist) {
              await transaction.rollback();
              return res.sendError(res, "Process already exist with same Lot Number, Yarn Type, Yarn Realisation, Net Yarn Quantity (Kgs) and Total Quantity(Kg/MT) for this Season.");
            }
      }

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
      spinner_id: req.body.spinnerId,
      program_id: req.body.programId,
      season_id: req.body.seasonId,
      date: req.body.date,
      other_mix: req.body.otherMix,
      cottonmix_type: req.body.cottonmixType ? req.body.cottonmixType : null,
      cottonmix_qty: req.body.cottonmixQty ? req.body.cottonmixQty : null,
      total_qty: req.body.totalQty,
      yarn_type: req.body.yarnType,
      yarn_count: req.body.yarnCount,
      yarn_qty_produced: req.body.yarnQtyProduced,
      yarn_realisation: req.body.yarnRealisation,
      net_yarn_qty: req.body.netYarnQty,
      comber_noil: req.body.comber_noil,
      comber_noil_stock: req.body.comber_noil,
      no_of_boxes: req.body.noOfBox,
      batch_lot_no: req.body.batchLotNo,
      reel_lot_no: abc ? abc : null,
      box_id: req.body.boxId,
      process_complete: req.body.processComplete,
      dyeing_required: req.body.dyeingRequired,
      qty_stock: req.body.netYarnQty,
      dyeing_id: dyeing ? dyeing.id : null,
      tot_box_user: req.body.noOfBox,
      status: "Pending",
      from_date: req.body.from_date,
      to_date: req.body.to_date,
      // yarn_blend_id: req.body.yarnBlendId,
    };
    const spin = await SpinProcess.create(data, { transaction });

    if (req.body.comber_noil && req.body.comber_noil > 0) {

    await CombernoilGeneration.create({
      spinner_id: req.body.spinnerId,
      process_id: spin.id,
      total_qty: req.body.comber_noil,
      qty_stock: req.body.comber_noil,
    }, { transaction });
    
    }

    let uniqueFilename = `spin_procees_qrcode_${Date.now()}.png`;
    let da = encrypt(`Spinner,Process,${spin.id}`);
    let aa = await generateOnlyQrCode(da, uniqueFilename);
    const gin = await SpinProcess.update(
      { qr: uniqueFilename },
      {
        where: {
          id: spin.id,
        },
        transaction
      },
    );

    for await (let yarn of req.body.yarns) {
      let yarnData = {
        process_id: spin.id,
        yarn_count: yarn.yarnCount,
        yarn_produced: yarn.yarnProduced,
        yarn_qty_stock: yarn.yarnProduced,
      };

      const yarns = await SpinYarn.create(yarnData, { transaction });
      let uniqueFilename = `spin_yarn_qrcode_${Date.now()}.png`;
      let da = encrypt(`Spinner,Yarn, ${yarns.id}`);
      let aa = await generateOnlyQrCode(da, uniqueFilename);
      const gin = await SpinYarn.update(
        { qr: uniqueFilename },
        {
          where: {
            id: yarns.id,
          },
                transaction,
        }
      );
    }

    // for await (let data of req.body.cotton_mixes) {
    //   let newData = {
    //     process_id: spin.id,
    //     brand_ids: req.body.brandIds,
    //     yarn_blend_id: data.yarn_blend_id,
    //     cotton_mix_id: data.cotton_mix_id,
    //     cotton_mix_qty: data.cotton_mix_qty,
    //   };
    //   // await SpinSelectedBlend.create(newData);
    // }

    for await (let obj of req.body.chooseLint) {
      let update = await GinSales.update(
        { qty_stock: obj.totalQty - obj.qtyUsed },
        { where: { id: obj.id }, transaction }
      );
      let create = await LintSelections.create({
        qty_used: obj.qtyUsed,
        process_id: spin.id,
        lint_id: obj.id,
      }, { transaction });
    }
    if (req.body.chooseComberNoil && req.body.chooseComberNoil.length > 0) {
      for await (let obj of req.body.chooseComberNoil) {
        let update = await SpinProcess.update(
          { comber_noil_stock: obj.totalQty - obj.qtyUsed },
          { where: { id: obj.id }, transaction }
        );
        let create = await ComberSelection.create({
          qty_used: obj.qtyUsed,
          process_id: spin.id,
          yarn_id: obj.id,
        }, { transaction });
        await CombernoilGeneration.update(
          { qty_stock: obj.totalQty - obj.qtyUsed },
          { where: { id: obj.id }, transaction }
        );
      }
    }

        if (req.body.enterPhysicalTraceability) {
            const physicalTraceabilityData = {
                date_sample_collection: req.body.dateSampleCollection,
                data_of_sample_dispatch: req.body.dataOfSampleDispatch,
                operator_name: req.body.operatorName,
                expected_date_of_yarn_sale: req.body.expectedDateOfYarnSale,
                physical_traceability_partner_id: req.body.physicalTraceabilityPartnerId,
                spin_process_id: spin.id,
                spinner_id: req.body.spinnerId
            };
            const physicalTraceabilityDataSpinner = await PhysicalTraceabilityDataSpinner.create(physicalTraceabilityData, { transaction });

            for await (const weightAndCone of req.body.weightAndCone) {
                let brand = await Brand.findOne({
                    where: { id: req.body.brandId },
                    transaction
                });

                const updatedCount = brand.dataValues.count + 1;
                let physicalTraceabilityDataSpinnerSampleData = {
                    physical_traceability_data_spinner_id: physicalTraceabilityDataSpinner.id,
                    weight: weightAndCone.weight,
                    cone: weightAndCone.cone,
                    original_sample_status: weightAndCone.originalSampleStatus,
                    code: `DNA${req.body.spinnerShortname}${abc ? '-' + abc : ''}-${updatedCount}`,
                    sample_result: 0
                };
                await PhysicalTraceabilityDataSpinnerSample.create(physicalTraceabilityDataSpinnerSampleData, { transaction });

                await Brand.update(
                    { count: updatedCount },
                    { where: { id: brand.id }, transaction }
                );
            }
        }

        await transaction.commit();
    res.sendSuccess(res, { spin });
  } catch (error: any) {
    console.log(error);
        await transaction.rollback();
    return res.sendError(res, error.message, error);
  }
};

const updateSpinProcess = async (req: Request, res: Response) => {
  try {
    if (!req.body.id) {
      return res.sendError(res, "Need Process Id");
    }
    const data = {
      date: req.body.date,
      yarn_type: req.body.yarnType,
      yarn_count: req.body.yarnCount,
      yarn_qty_produced: req.body.yarnQtyProduced,
      yarn_realisation: req.body.yarnRealisation,
      net_yarn_qty: req.body.netYarnQty,
      qty_stock: req.body.netYarnQty,
      comber_noil: req.body.comber_noil,
      process_complete: req.body.processComplete,
    };
    const spin = await SpinProcess.update(data, {
      where: { id: req.body.id },
    });
    let yarn = SpinYarn.destroy({ where: { process_id: req.body.id } });
    for await (let yarn of req.body.yarns) {
      let yarnData = {
        process_id: req.body.id,
        yarn_count: yarn.yarnCount,
        yarn_produced: yarn.yarnProduced,
        yarn_qty_stock: yarn.yarnProduced,
      };
      const yarns = await SpinYarn.create(yarnData);
      let uniqueFilename = `spin_yarn_qrcode_${Date.now()}.png`;
      let da = encrypt(`Spinner,Yarn, ${yarns.id}`);
      let aa = await generateOnlyQrCode(da, uniqueFilename);
      const gin = await SpinYarn.update(
        { qr: uniqueFilename },
        {
          where: {
            id: yarns.id,
          },
        }
      );
    }

        res.sendSuccess(res, { spin });
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message, error);
    }
}

const yarnId = async (id: any, date: any) => {
  let a = await sequelize.query(
    `SELECT CONCAT('YN-REE', UPPER(LEFT("country"."county_name", 2)), UPPER(LEFT("state"."state_name", 2)), UPPER("processor"."short_name")) as idprefix
         FROM "spinners" AS "processor"
         INNER JOIN "states" AS "state" ON "processor"."state_id" = "state"."id"
         INNER JOIN "countries" AS "country" ON "state"."country_id" = "country"."id"
         WHERE "processor"."id" = :prscr_id`,
    {
      replacements: { prscr_id: id }, // Assuming prscr_id is a variable with the desired id
      type: sequelize.QueryTypes.SELECT,
      raw: true,
    }
  );
  // let spin = await SpinProcess.count({
  //     include: [
  //         {
  //             model: Program,
  //             as: 'program',
  //             where: { program_name: { [Op.iLike]: 'Reel' } }
  //         }
  //     ],
  //     where: {
  //         spinner_id: id
  //     }
  // })

  let spinLatest = await SpinProcess.findOne({
    include: [
      {
        model: Program,
        as: "program",
        where: { program_name: { [Op.iLike]: "Reel" } },
      },
    ],
    where: {
      spinner_id: id,
    },
    order: [["id", "desc"]],
  });

  let count = 0;

  if (spinLatest) {
    let reelLot = spinLatest?.dataValues?.reel_lot_no;
    let split = reelLot ? reelLot.split("/") : [];
    count = split && split.length > 0 ? Number(split[1]) : 0;
  }

  let currentDate = date ? new Date(date) : new Date();
  let day = String(currentDate.getDate()).padStart(2, "0");
  let month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Local month, zero-indexed, so add 1
  let year = String(currentDate.getFullYear());

  let prcs_date = day + month + year;

  return a[0].idprefix + prcs_date + "/" + ((count ?? 1) + 1);
};

//fetch Spinner Process with filters
const fetchSpinnerProcessPagination = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { spinnerId, seasonId, programId }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$spinner.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { yarn_type: { [Op.iLike]: `%${searchTerm}%` } },
        { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { box_id: { [Op.iLike]: `%${searchTerm}%` } },
        // { '$yarncount.yarnCount_name$': { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    if (spinnerId) {
      whereCondition.spinner_id = spinnerId;
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
        model: Dyeing,
        as: "dyeing",
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
    //fetch data with pagination
    if (req.query.pagination === "true") {
      const { count, rows } = await SpinProcess.findAndCountAll({
        where: whereCondition,
        include: include,
        order: [["id", "desc"]],
        offset: offset,
        limit: limit,
      });

      let data = [];

      for await (let row of rows) {
        let yarncount = [];

        if (row.dataValues?.yarn_count.length > 0) {
          yarncount = await YarnCount.findAll({
            attributes: ["id", "yarnCount_name"],
            where: { id: { [Op.in]: row.dataValues?.yarn_count } },
          });
        }

        data.push({
          ...row.dataValues,
          yarncount,
        });
      }

      return res.sendPaginationSuccess(res, data, count);
    } else {
      const gin = await SpinProcess.findAll({
        where: whereCondition,
        include: include,
        order: [["id", "desc"]],
      });

      let data = [];

      for await (let row of gin) {
        let yarncount = [];

        if (row.dataValues?.yarn_count.length > 0) {
          yarncount = await YarnCount.findAll({
            attributes: ["id", "yarnCount_name"],
            where: { id: { [Op.in]: row.dataValues?.yarn_count } },
          });
        }

        data.push({
          ...row.dataValues,
          yarncount,
        });
      }

      return res.sendSuccess(res, data);
    }
  } catch (error: any) {
    return res.sendError(res, error.message, error);
  }
};

const fetchSpinnerProcess = async (req: Request, res: Response) => {
  const whereCondition: any = {};
  try {
    whereCondition.id = req.query.id;
    let include = [
      {
        model: Spinner,
        as: "spinner",
        attributes: ["id", "name"],
      },
      {
        model: Season,
        as: "season",
      },
      {
        model: Dyeing,
        as: "dyeing",
      },
      {
        model: Program,
        as: "program",
      },
      // {
      //     model: YarnCount,
      //     as: "yarncount",
      // }
    ];
    //fetch data with pagination

    const gin = await SpinProcess.findOne({
      where: whereCondition,
      include: include,
      order: [["id", "desc"]],
    });

    let yarncount = [];

    if (gin.dataValues?.yarn_count.length > 0) {
      yarncount = await YarnCount.findAll({
        attributes: ["id", "yarnCount_name"],
        where: { id: { [Op.in]: gin.dataValues?.yarn_count } },
      });
    }
    gin.yarncount = yarncount;

    return res.sendSuccess(res, gin);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const deleteSpinnerProcess = async (req: Request, res: Response) => {
  try {
    let count = await SpinProcessYarnSelection.count({
      where: { spin_process_id: req.body.id },
    });

    if (count > 0) {
      res.sendError(
        res,
        "Unable to delete this process since some lint of this process was sold"
      );
    } else {
      // Retrieve data
      const lintSelections = await LintSelections.findAll({
        attributes: ["id", "process_id", "lint_id", "qty_used"],
        where: {
          process_id: req.body.id,
        },
      });

      // Loop through lintSelections
      for await (const lint of lintSelections) {
        await GinSales.update(
          { qty_stock: Sequelize.literal(`qty_stock + ${lint.qty_used}`) },
          {
            where: {
              id: lint.lint_id,
            },
          }
        );
      }

      // Delete rows
      const res1 = await LintSelections.destroy({
        where: {
          process_id: req.body.id,
        },
      });

      const physicalTraceabilityDataSpinner =
        await PhysicalTraceabilityDataSpinner.findOne({
          where: { spin_process_id: req.body.id },
        });
      if (physicalTraceabilityDataSpinner) {
        await PhysicalTraceabilityDataSpinnerSample.destroy({
          where: {
            physical_traceability_data_spinner_id:
              physicalTraceabilityDataSpinner.id,
          },
        });
        await PhysicalTraceabilityDataSpinner.destroy({
          where: { spin_process_id: req.body.id },
        });
      }

      const res3 = await SpinProcess.destroy({
        where: {
          id: req.body.id,
        },
      });
      return res.sendSuccess(res, {
        message: "Successfully deleted this process",
      });
    }
  } catch (error: any) {
    return res.sendError(res, error.message, error);
  }
};

const getSpinners = async (req: Request, res: Response) => {
  let spinnerId = req.query.spinnerId;
  let whereCondition: any = {};

  if (!spinnerId) {
    return res.sendError(res, "Need Spinner Id ");
  }
  if (req.query.status == "true") {
    whereCondition.status = true;
  }

  let spinner = await Spinner.findOne({ where: { id: spinnerId } });
  if (!spinner) {
    return res.sendError(res, "No Spinner Found ");
  }
  let result = await Spinner.findAll({
    attributes: ["id", "name"],
    where: {
      ...whereCondition,
      brand: { [Op.overlap]: spinner.dataValues.brand },
      id: { [Op.ne]: spinnerId },
    },
  });
  res.sendSuccess(res, result);
};

const fetchComberNoilPagination = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { spinnerId, programId, from }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  const combernoilGenerationWhereCondition: any = {};

  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    if (spinnerId) {
      combernoilGenerationWhereCondition.spinner_id = spinnerId;
    }

    if (from && from == "sales") {
      combernoilGenerationWhereCondition.sales_id = {
        [Op.is]: null, // This will fetch only records where sales_id is NULL
      };
    } else {
      combernoilGenerationWhereCondition[Op.or] = [
        { sales_id: null },
        {
          sales_id: {
            [Op.not]: null,
          },
          "$spinCombernoilSale.status$": "Accepted",
        },
      ];
    }

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.program_id = { [Op.in]: idArray };
    }
    combernoilGenerationWhereCondition.qty_stock = { [Op.gt]: 0 };


    //fetch data with pagination
    if (req.query.pagination === "true") {
      const { count, rows } = await CombernoilGeneration.findAndCountAll({
        include: [
          {
            model: SpinProcess,
            as: "spinProcess",
            where: whereCondition,
            required: false,
            attributes: ["id", "batch_lot_no", "program_id"],
            include: [
              {
                model : Program,
                as : "program",
                attributes: ["program_name"],
              }
            ]
          },
          {
            model: Spinner,
            as: "spinner",
            attributes: ["id", "name"]
          },
          {
            model: SpinCombernoilSale,
            as: "spinCombernoilSale",
            attributes: ["id", "status"],
            required: false,
          },
        ],
        order: [["qty_stock", "desc"]],
        attributes: [
          "id",
          "process_id",
          "sales_id",
          "old_combernoil_id",
          ["total_qty", "comber_noil"],
          ["qty_stock", "comber_noil_stock"],
        ],
        where: combernoilGenerationWhereCondition,
        offset: offset,
        limit: limit,
      });

      // Get all old_combernoil_ids
      const oldCombernoilIds = rows
        .map((row: any) => row.old_combernoil_id)
        .filter((id: any) => id !== null);

      // Fetch original CombernoilGeneration records
      const originalCombernoils = await CombernoilGeneration.findAll({
        where: {
          id: {
            [Op.in]: oldCombernoilIds,
          },
        },
        attributes: ["id", "process_id"],
      });

      // Get all process_ids
      const processIds = originalCombernoils
        .map((cg: any) => cg.process_id)
        .filter((id: any) => id !== null);

      // Fetch SpinProcess records
      const spinProcesses = await SpinProcess.findAll({
        where: {
          id: {
            [Op.in]: processIds,
          },
        },
        attributes: ["id", "batch_lot_no"],
      });

      // Transform the rows with additional data
      const transformedRows = rows.map((row: any) => {
        const rowJson = row.toJSON();
        const originalCombernoil = originalCombernoils.find(
          (cg: any) => cg.id === row.old_combernoil_id
        );
        const spinProcess = originalCombernoil
          ? spinProcesses.find(
              (sp: any) => sp.id === originalCombernoil.process_id
            )
          : null;

        return {
          ...rowJson,
          batch_lot_no:
            spinProcess?.batch_lot_no || row.spinProcess?.batch_lot_no || null,
          program_id: row.spinProcess?.program_id || null,
        };
      });

      return res.sendPaginationSuccess(res, transformedRows, count);
    } else {
      const comberData = await CombernoilGeneration.findAll({
        include: [
          {
            model: SpinProcess,
            as: "spinProcess",
            where: whereCondition,
            attributes: ["id", "batch_lot_no", "program_id"],
            required: false,
          },
          {
            model: Spinner,
            as: "spinner",
            attributes: ["id", "name"],
          },
          {
            model: SpinCombernoilSale,
            as: "spinCombernoilSale",
            attributes: ["id", "status"],
            required: false,
          },
        ],
        order: [["qty_stock", "desc"]],
        where: combernoilGenerationWhereCondition,
        attributes: [
          "id",
          "process_id",
          "sales_id",
          "old_combernoil_id",
          ["total_qty", "comber_noil"],
          ["qty_stock", "comber_noil_stock"],
        ],
      });

      // Get all old_combernoil_ids
      const oldCombernoilIds = comberData
        .map((item: any) => item.old_combernoil_id)
        .filter((id: any) => id !== null);

      // Fetch original CombernoilGeneration records
      const originalCombernoils = await CombernoilGeneration.findAll({
        where: {
          id: {
            [Op.in]: oldCombernoilIds,
          },
        },
        attributes: ["id", "process_id"],
      });

      // Get all process_ids
      const processIds = originalCombernoils
        .map((cg: any) => cg.process_id)
        .filter((id: any) => id !== null);

      // Fetch SpinProcess records
      const spinProcesses = await SpinProcess.findAll({
        where: {
          id: {
            [Op.in]: processIds,
          },
        },
        attributes: ["id", "batch_lot_no"],
      });

      // Transform the data with additional information
      const transformedData = comberData.map((item: any) => {
        const itemJson = item.toJSON();
        const originalCombernoil = originalCombernoils.find(
          (cg: any) => cg.id === item.old_combernoil_id
        );
        const spinProcess = originalCombernoil
          ? spinProcesses.find(
              (sp: any) => sp.id === originalCombernoil.process_id
            )
          : null;

        return {
          ...itemJson,
          batch_lot_no:
            spinProcess?.batch_lot_no || item.spinProcess?.batch_lot_no || null,
          program_id: item.spinProcess?.program_id || null,
        };
      });

      return res.sendSuccess(res, transformedData);
    }
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message, error);
  }
};

const updateSpinnerProcess = async (req: Request, res: Response) => {
    try {
        const spin = await SpinProcess.update({
            process_complete: req.body.processComplete
        },
            {
                where: { id: req.body.id }
            }
        );
        res.sendSuccess(res, { spin });
    } catch (error: any) {
        return res.sendError(res, error.message, error);
    }
}



const exportSpinnerProcess = async (req: Request, res: Response) => {
  const excelFilePath = path.join("./upload", "spinner-process.xlsx");

  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { spinnerId, seasonId, programId }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$spinner.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { yarn_type: { [Op.iLike]: `%${searchTerm}%` } },
        { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { box_id: { [Op.iLike]: `%${searchTerm}%` } },
        // { '$yarncount.yarnCount_name$': { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    if (spinnerId) {
      whereCondition.spinner_id = spinnerId;
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
    worksheet.mergeCells("A1:O1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Process";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.",
      "Date",
      "Yarn Production Start Date",
      "Yarn Production End Date",
      "Season",
      "Spin Lot No",
      "Yarn Type",
      "Yarn Count",
      "Yarn Realisation %",
      "No of Boxes",
      "Box ID",
      "Blend",
      "Blend Qty",
      "Total Yarn weight (Kgs)",
      "Grey Out Status",
    ]);
    headerRow.font = { bold: true };
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
        model: Dyeing,
        as: "dyeing",
      },
      {
        model: Program,
        as: "program",
      },
      // {
      //     model: YarnCount,
      //     as: "yarncount",
      // }
    ];
    const gin = await SpinProcess.findAll({
      where: whereCondition,
      include: include,
    });
    // Append data to worksheet
    for await (const [index, item] of gin.entries()) {
      let blendValue = "";
      let blendqty = "";
      let yarncount = "";

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

      if (item.yarn_count && item.yarn_count.length > 0) {
        let yarn = await YarnCount.findAll({
          attributes: ["id", "yarnCount_name"],
          where: { id: { [Op.in]: item.yarn_count } },
        });
        yarncount = yarn
          .map((yrn: any) => yrn.dataValues.yarnCount_name)
          .join(",");
      }

      const rowValues = Object.values({
        index: index + 1,
        date: item.date ? item.date : "",
        from: item.from_date ? item.from_date : "",
        to: item.to_date ? item.to_date : "",
        season: item.season ? item.season.name : "",
        lotNo: item.batch_lot_no ? item.batch_lot_no : "",
        yarnType: item.yarn_type ? item.yarn_type : "",
        count: yarncount ? yarncount : "",
        resa: item.yarn_realisation ? item.yarn_realisation : "",
        boxes: item.no_of_boxes ? item.no_of_boxes : "",
        boxId: item.box_id ? item.box_id : "",
        blend: blendValue,
        blendqty: blendqty,
        total: item.net_yarn_qty,
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
      column.width = Math.min(14, maxCellLength + 2); // Limit width to 30 characters
    });

    // Save the workbook
    await workbook.xlsx.writeFile(excelFilePath);
    res.status(200).send({
      success: true,
      messgage: "File successfully Generated",
      data: process.env.BASE_URL + "spinner-process.xlsx",
    });
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message, error);
  }
};

const chooseYarnProcess = async (req: Request, res: Response) => {
  const { spinnerId, programId }: any = req.query;

  const whereCondition: any = {};
  try {
    if (spinnerId) {
      whereCondition.spinner_id = spinnerId;
    }

    if (programId) {
      whereCondition.program_id = programId;
    }

    let include = [
      {
        model: Spinner,
        as: "spinner",
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

    const gin = await SpinProcess.findAll({
      where: whereCondition,
      include: include,
      attributes: [
        "id",
        "yarn_type",
        "yarn_count",
        "no_of_boxes",
        "reel_lot_no",
        "batch_lot_no",
        "qty_stock",
        "tot_box_user",
      ],
      order: [["id", "desc"]],
    });

    let data = [];

    for await (let row of gin) {
      let yarncount = [];

      if (row.dataValues?.yarn_count.length > 0) {
        yarncount = await YarnCount.findAll({
          attributes: ["id", "yarnCount_name"],
          where: { id: { [Op.in]: row.dataValues?.yarn_count } },
        });
      }

      data.push({
        ...row.dataValues,
        yarncount,
      });
    }

        return res.sendSuccess(res, data);

    } catch (error: any) {
        return res.sendError(res, error.message, error);
    }
};

//create Spinner Sale
const createSpinnerSales = async (req: Request, res: Response) => {
    const transaction = await sequelize.transaction();
    try {

        if (req.body.spinnerId && req.body.seasonId && req.body.programId && req.body.totalQty && req.body.batchLotNo) {
            let SalesExist = await SpinSales.findOne(
              { where: { 
                spinner_id: req.body.spinnerId,
                program_id: req.body.programId,
                season_id: req.body.seasonId,
                order_ref: req.body.orderRef,
                buyer_type: req.body.buyerType,
                buyer_id: req.body.buyerId,
                knitter_id: req.body.knitterId,
                total_qty: Number(req.body.totalQty),
                invoice_no: req.body.invoiceNo,
                batch_lot_no: req.body.batchLotNo,
                reel_lot_no: req.body.reelLotNno ? req.body.reelLotNno : null,
                vehicle_no: req.body.vehicleNo,      
              }, transaction },
            );
            if (SalesExist) {
              await transaction.rollback();
              return res.sendError(res, "Sales already exist with same Batch Lot Number, Invoice No., Vehicle No., Order Reference and Total Quantity(Kg/MT) for this Season.");
            }
          }

        const data: any = {
            spinner_id: req.body.spinnerId,
            program_id: req.body.programId,
            season_id: req.body.seasonId,
            date: req.body.date,
            order_ref: req.body.orderRef,
            buyer_type: req.body.buyerType,
            buyer_id: req.body.buyerId,
            knitter_id: req.body.knitterId,
            processor_name: req.body.processorName,
            processor_address: req.body.processorAddress,
            total_qty: req.body.totalQty,
            transaction_via_trader: req.body.transactionViaTrader,
            transaction_agent: req.body.transactionAgent,
            no_of_boxes: req.body.noOfBoxes,
            batch_lot_no: req.body.batchLotNo,
            reel_lot_no: req.body.reelLotNno ? req.body.reelLotNno : null,
            box_ids: req.body.boxIds,
            yarn_type: req.body.yarnType,
            yarn_count: req.body.yarnCount,
            invoice_no: req.body.invoiceNo,
            bill_of_ladding: req.body.billOfLadding,
            transporter_name: req.body.transporterName,
            vehicle_no: req.body.vehicleNo,
            quality_doc: req.body.qualityDoc,
            tc_files: req.body.tcFiles,
            contract_file: req.body.contractFile,
            invoice_file: req.body.invoiceFile,
            delivery_notes: req.body.deliveryNotes,
            qty_stock: req.body.totalQty,
            price: req.body.price,
            letter_of_credit: req.body.letterOfCredit,
            logistics_documents: req.body.logisticsDocuments,
            yarn_quality_test_reports: req.body.yarnQualityTestReports,
            status: 'Pending for QR scanning'
        };

        if (req.body.buyerType === "Spinner") {
          data.status = "Pending";
          data.total_qty = req.body.chooseComberNoil.totalQuantityUsed;
          data.qty_stock = req.body.chooseComberNoil.totalQuantityUsed;
          data.sale_type = "Spinner";
          data.buyer_id = req.body.buyer;
          data.comber_ids = req.body.chooseComberNoil.chooseComberNoil.map(
            (comber: any) => comber.id
          );
          const spinCombernoilSales = await SpinCombernoilSale.create(data, { transaction });
          // Update existing CombernoilGeneration records
          for (const comber of req.body.chooseComberNoil.chooseComberNoil) {
            const existingComber = await CombernoilGeneration.findByPk(comber.id);
            if (existingComber) {
              // Update existing record's qty_stock
              await existingComber.update({
                qty_stock: existingComber.qty_stock - comber.qtyUsed,
              }, { transaction });
    
              // Create new CombernoilGeneration record for buyer
              await CombernoilGeneration.create({
                spinner_id: req.body.buyer, // buyer's spinner id
                sales_id: spinCombernoilSales.id,
                total_qty: comber.qtyUsed,
                qty_stock: comber.qtyUsed,
                old_combernoil_id: comber.id,
              }, { transaction });
            }
          }
    
          let uniqueFilename = `spin_sales_qrcode_${Date.now()}.png`;
          let da = encrypt(`Spinner,Sale,${spinCombernoilSales.id}`);
          let aa = await generateOnlyQrCode(da, uniqueFilename);
          await SpinCombernoilSale.update(
            { qr: uniqueFilename },
            {
              where: {
                id: spinCombernoilSales.id,
              },
              transaction
            }
          );
          // Commit transaction
          await transaction.commit();
          res.sendSuccess(res, { data });
        } 
        else 
        {

        if (req.body.chooseYarn && req.body.chooseYarn.length > 0) {
            for await (let obj of req.body.chooseYarn) {
                const spinYarnData = await SpinYarn.findOne({ where: { id: obj.id }, transaction, raw: true });
                console.log(spinYarnData)
                if (obj.qtyUsed > spinYarnData.yarn_qty_stock) {
                    return res.sendError(res, 'Requested quantity exceeds available stock')
                }
            }
        }

      const spinSales = await SpinSales.create(data, { transaction });
      let uniqueFilename = `spin_sales_qrcode_${Date.now()}.png`;
      let da = encrypt(`Spinner,Sale,${spinSales.id}`);
      let aa = await generateOnlyQrCode(da, uniqueFilename);
      const gin = await SpinSales.update(
        { qr: uniqueFilename },
        {
          where: {
            id: spinSales.id,
          },
          transaction
        },
      );

      if (req.body.chooseYarn && req.body.chooseYarn.length > 0) {
        for await (let obj of req.body.chooseYarn) {
          const spinProcessData = await SpinProcess.findOne({
            where: { id: obj.process_id }, transaction,
          });
          let update = await SpinProcess.update(
            {
              qty_stock: spinProcessData.qty_stock - obj.qtyUsed,
              status: "Sold",
            },
            { where: { id: obj.process_id }, transaction }
          );
          const spinYarnData = await SpinYarn.findOne({
            where: { id: obj.id }, transaction,
          });

          let updateyarns = {};
          if (spinYarnData.yarn_qty_stock - obj.qtyUsed <= 0) {
            updateyarns = {
              sold_status: true,
              yarn_qty_stock: 0,
            };
          } else {
            updateyarns = {
              yarn_qty_stock: spinYarnData.yarn_qty_stock - obj.qtyUsed,
            };
          }
          const spinYarnStatus = await SpinYarn.update(updateyarns, {
            where: { id: obj.id }, transaction,
          });
          await SpinProcessYarnSelection.create({
            spin_process_id: obj.process_id,
            yarn_id: obj.id,
            sales_id: spinSales.id,
            qty_used: obj.qtyUsed,
          }, { transaction });
        }
      }

      if (spinSales) {
        await send_spin_mail(spinSales.id);
      }

         // Commit transaction
        await transaction.commit();
      res.sendSuccess(res, { spinSales });
    }
  } catch (error: any) {
        await transaction.rollback();
    console.error(error);
    return res.sendError(res, error.message, error);
  }
};

//update Spinner Sale
const updateSpinnerSales = async (req: Request, res: Response) => {
  try {
    if (!req.body.id) {
      return res.sendError(res, "Need Sales Id");
    }
    const data = {
      date: req.body.date,
      invoice_no: req.body.invoiceNo,
      vehicle_no: req.body.vehicleNo,
      invoice_file: req.body.invoiceFile,
    };

    const spinSales = await SpinSales.update(data, {
      where: { id: req.body.id },
    });
    res.sendSuccess(res, { spinSales });
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.message, error);
  }
};

const fetchSpinnerSale = async (req: Request, res: Response) => {
  const whereCondition: any = {};
  try {
    whereCondition.id = req.query.id;
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
      //     model: YarnCount,
      //     as: 'yarncount',
      //     attributes: ['id', 'yarnCount_name']
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

    const gin = await SpinSales.findOne({
      where: whereCondition,
      include: include,
      order: [["id", "desc"]],
    });

    let yarnType = [];

    if (gin.dataValues?.yarn_count.length > 0) {
      yarnType = await YarnCount.findAll({
        attributes: ["id", "yarnCount_name"],
        where: { id: { [Op.in]: gin.dataValues?.yarn_count } },
      });
    }
    let data = { ...gin.dataValues, yarnType };

    return res.sendSuccess(res, data);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

//fetch Spinner Sales with filters
const fetchSpinSalesPagination = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const {
    spinnerId,
    seasonId,
    programId,
    knitterId,
    weaverId,
    yarnType,
    type,
  }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  const yarnTypeArray = yarnType?.split(",")?.map((item: any) => item.trim());
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { order_ref: { [Op.iLike]: `%${searchTerm}%` } },
        { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
        { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        // { yarn_type: { [Op.iLike]: `%${searchTerm}%` } },
        { vehicle_no: { [Op.iLike]: `%${searchTerm}%` } },
        { "$weaver.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$knitter.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        // { '$yarncount.yarnCount_name$': { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    if (spinnerId) {
      whereCondition.spinner_id = spinnerId;
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

    if (yarnType) {
      whereCondition.yarn_type = { [Op.contains]: yarnTypeArray };
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
      //     model: YarnCount,
      //     as: 'yarncount',
      //     attributes: ['id', 'yarnCount_name']
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
    if (req.query.pagination === "true") {
      const { count, rows } = await SpinSales.findAndCountAll({
        where: whereCondition,
        include: include,
        order: [["id", "desc"]],
        offset: offset,
        limit: limit,
      });

      let data = [];

      for await (let row of rows) {
        const yarncount = await YarnCount.findAll({
          where: {
            id: {
              [Op.in]: row.dataValues.yarn_count,
            },
          },
          attributes: ["id", "yarnCount_name"],
        });
        data.push({
          ...row.dataValues,
          yarncount,
        });
      }
      return res.sendPaginationSuccess(res, data, count);
    } else {
      const gin = await SpinSales.findAll({
        where: whereCondition,
        include: include,
        order: [["id", "desc"]],
      });
      let data = [];

      for await (let row of gin) {
        const yarncount = await YarnCount.findAll({
          where: {
            id: {
              [Op.in]: row.dataValues.yarn_count,
            },
          },
          attributes: ["id", "yarnCount_name"],
        });
        data.push({
          ...row.dataValues,
          yarncount,
        });
      }
      return res.sendSuccess(res, data);
    }
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.message);
  }
};

const exportSpinnerSale = async (req: Request, res: Response) => {
  const excelFilePath = path.join("./upload", "spinner-sale.xlsx");

  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const {
    spinnerId,
    seasonId,
    programId,
    knitterId,
    weaverId,
    yarnType,
    type,
  }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  const yarnTypeArray = yarnType?.split(",")?.map((item: any) => item.trim());
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { order_ref: { [Op.iLike]: `%${searchTerm}%` } },
        { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
        { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        // { yarn_type: { [Op.iLike]: `%${searchTerm}%` } },
        { "$weaver.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$knitter.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        {
          yarn_type: {
            [Op.contains]: yarnTypeArray, // Check if yarn_type array contains any search term
            [Op.or]: yarnTypeArray.map((term: any) => ({
              [Op.iLike]: `%${term}%`, // Apply iLike condition individually for each search term
            })),
          },
        },
      ];
    }
    if (spinnerId) {
      whereCondition.spinner_id = spinnerId;
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
    if (yarnType) {
      whereCondition.yarn_type = { [Op.contains]: yarnTypeArray };
    }

    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    worksheet.mergeCells("A1:R1");
    const mergedCell = worksheet.getCell("A1");
    mergedCell.value = "CottonConnect | Sale";
    mergedCell.font = { bold: true };
    mergedCell.alignment = { horizontal: "center", vertical: "middle" };
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.",
      "Date",
      "Season",
      "Invoice No",
      "Spin Lot No",
      "Reel Lot No",
      "Yarn Type",
      "Yarn Count",
      "No of Boxes",
      "Buyer Name",
      "Box ID",
      "Blend",
      "Blend Qty",
      "Total weight (Kgs)",
      "Price/Kg",
      "Programme",
      "Vehicle No",
      "Transcation via trader",
      "Agent Details",
    ]);
    headerRow.font = { bold: true };
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
      {
        model: Weaver,
        as: "weaver",
      },
      {
        model: Knitter,
        as: "knitter",
      },
      // {
      //     model: YarnCount,
      //     as: "yarncount"
      // }
    ];
    const gin = await SpinSales.findAll({
      where: whereCondition,
      include: include,
      order: [["id", "desc"]],
    });
    // Append data to worksheet
    for await (const [index, item] of gin.entries()) {
      let yarnCount: string = "";
      let yarnTypeData: string = "";

      if (item.yarn_count && item.yarn_count.length > 0) {
        let type = await YarnCount.findAll({
          where: { id: { [Op.in]: item.yarn_count } },
        });
        for (let i of type) {
          yarnCount += `${i.yarnCount_name},`;
        }
      }

      yarnTypeData =
        item?.yarn_type?.length > 0 ? item?.yarn_type.join(",") : "";

      const rowValues = Object.values({
        index: index + 1,
        date: item.date ? item.date : "",
        season: item.season ? item.season.name : "",
        invoice: item.invoice_no ? item.invoice_no : "",
        lotNo: item.batch_lot_no ? item.batch_lot_no : "",
        reelLot: item.reel_lot_no ? item.reel_lot_no : "",
        yarnType: yarnTypeData ? yarnTypeData : "",
        count: yarnCount ? yarnCount : "",
        boxes: item.no_of_boxes ? item.no_of_boxes : "",
        buyer_id: item.knitter
          ? item.knitter.name
          : item.weaver
          ? item.weaver.name
          : item.processor_name,
        boxId: item.box_ids ? item.box_ids : "",
        blend: "",
        blendqty: "",
        total: item.total_qty,
        price: item.price ? item.price : "",
        program: item.program ? item.program.program_name : "",
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
      data: process.env.BASE_URL + "spinner-sale.xlsx",
    });
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

const deleteSpinnerSales = async (req: Request, res: Response) => {
  try {
    if (!req.body.id) {
      return res.sendError(res, "Need Sales Id");
    }
    let yarn_selections = await SpinProcessYarnSelection.findAll({
      attributes: [
        "id",
        "yarn_id",
        "spin_process_id",
        "sales_id",
        "no_of_box",
        "qty_used",
      ],
      where: {
        sales_id: req.body.id,
      },
    });
    yarn_selections.forEach(async (yarn: any) => {
      SpinProcess.update(
        {
          qty_stock: sequelize.literal(`qty_stock + ${yarn.qty_used}`),
          tot_box_user: sequelize.literal(`tot_box_user - ${yarn.no_of_box}`),
        },
        {
          where: {
            id: yarn.spin_process_id,
          },
        }
      );
      const spinYarnData = await SpinYarn.findOne({
        where: { id: yarn.yarn_id },
      });
      if (spinYarnData) {
        await SpinYarn.update(
          {
            sold_status: false,
            yarn_qty_stock: +spinYarnData.yarn_qty_stock + +yarn.qty_used,
          },
          { where: { id: yarn.yarn_id } }
        );
      }
      // await SpinYarn.update({ sold_status: false }, { where: { id: yarn.yarn_id } });
    });

    SpinSales.destroy({
      where: {
        id: req.body.id,
      },
    });

    SpinProcessYarnSelection.destroy({
      where: {
        sales_id: req.body.id,
      },
    });
    return res.sendSuccess(res, {
      message: "Successfully deleted this process",
    });
  } catch (error: any) {
    return res.sendError(res, error.message, error);
  }
};

const fetchComberNoilTransactionList = async (req: Request, res: Response) => {
  try {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { ginnerId, status, filter, programId, spinnerId, seasonId }: any =
      req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};

    whereCondition.buyer_id = spinnerId;
    whereCondition.buyer_type = "Spinner";
    whereCondition.status = {
      [Op.in]: ["Accepted"],
    };

    // Add season filter if seasonId is provided
    if (seasonId) {
      const seasonIds = seasonId.split(",").map(Number);
      whereCondition.season_id = {
        [Op.in]: seasonIds,
      };
    }

    // Add program filter if programId is provided
    if (programId) {
      const programIds = programId.toString().split(",").map(Number);
      whereCondition.program_id = {
        [Op.in]: programIds,
      };
    }

    const includes = [
      {
        model: CombernoilGeneration,
        as: "combernoilGeneration",
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
        as: "spinner",
        attributes: ["id", "name"],
        where: searchTerm
          ? {
              name: {
                [Op.iLike]: `%${searchTerm}%`,
              },
            }
          : undefined,
      },
    ];
    const spinnerComberNoil = await SpinCombernoilSale.findAndCountAll({
      where: whereCondition,
      include: includes,
      offset: offset,
      limit: limit,
      order: [["createdAt", "desc"]],
    });
    return res.sendPaginationSuccess(
      res,
      spinnerComberNoil.rows,
      spinnerComberNoil.count
    );
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message, error);
  }
};

const updateStatusComberNoil = async (req: Request, res: Response) => {
  try {
    const items = req.body.items;
    for (const item of items) {
      // Update SpinCombernoilSale status
      await SpinCombernoilSale.update(
        { status: item.status },
        { where: { id: item.id } }
      );

      if (item.status === "Rejected") {
        const originalComber = await CombernoilGeneration.findAll({
          where: {
            sales_id: item.id,
          },
        });
        // Restore original combernoil qty_stock
        // and delete current combernoil generations
        for (const comber of originalComber) {
          if (comber.old_combernoil_id) {
            const originalComber = await CombernoilGeneration.findOne({
              where: {
                id: comber.old_combernoil_id,
              },
            });
            if (originalComber) {
              // Increase qty_stock of original combernoil
              await CombernoilGeneration.update(
                { qty_stock: originalComber.qty_stock + comber.qty_stock },
                { where: { id: originalComber.id } }
              );
            }
          }
          // Delete current combernoil generation
          await CombernoilGeneration.destroy({
            where: {
              id: comber.id,
            },
          });
        }
      }
    }
    res.sendSuccess(res, { items });
  } catch (error: any) {
    return res.sendError(res, error.message, error);
  }
};

const fetchTransactionAlertForComberNoil = async (
  req: Request,
  res: Response
) => {
  try {
    const { spinnerId, status, programId, seasonId }: any = req.query;
    const whereCondition: any = {};
    const include: any = [];
    if (status === "Pending") {
      whereCondition.buyer_id = spinnerId;
      whereCondition.buyer_type = "Spinner";
      whereCondition.status = {
        [Op.in]: ["Pending"],
      };
    }

    // Add season filter if seasonId is provided
    if (seasonId) {
      const seasonIds = seasonId.split(",").map(Number);
      whereCondition.season_id = {
        [Op.in]: seasonIds,
      };
    }

    // Add program filter if programId is provided
    if (programId) {
      const programIds = programId.toString().split(",").map(Number);
      whereCondition.program_id = {
        [Op.in]: programIds,
      };
    }

    const includes = [
      {
        model: CombernoilGeneration,
        as: "combernoilGeneration",
        required: false,
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
        as: "spinner",
        attributes: ["id", "name"],
      },
    ];
    const spinnerComberNoil = await SpinCombernoilSale.findAll({
      where: whereCondition,
      include: includes,
      order: [["createdAt", "desc"]],
    });
    // Process each sale record
    const processedData = await Promise.all(
      spinnerComberNoil.map(async (sale: any) => {
        const saleData = sale.toJSON();

        // Get all old_combernoil_ids from combernoilGeneration array
        const oldCombernoilIds =
          saleData.combernoilGeneration?.map(
            (cg: any) => cg.old_combernoil_id
          ) || [];

        if (oldCombernoilIds.length > 0) {
          // Fetch all original CombernoilGeneration records
          const originalCombernoils = await CombernoilGeneration.findAll({
            where: {
              id: {
                [Op.in]: oldCombernoilIds,
              },
            },
          });

          // Get all process_ids
          const processIds = originalCombernoils
            .map((cg: any) => cg.process_id)
            .filter((id: any) => id != null);

          if (processIds.length > 0) {
            // Fetch all SpinProcesses to get reel_lot_nos
            const spinProcesses = await SpinProcess.findAll({
              where: {
                id: {
                  [Op.in]: processIds,
                },
              },
            });

            // Map reel_lot_nos to combernoilGeneration records
            const updatedCombernoilGen = saleData.combernoilGeneration.map(
              (cg: any) => {
                const originalCombernoil = originalCombernoils.find(
                  (oc: any) => oc.id === cg.old_combernoil_id
                );
                const spinProcess = spinProcesses.find(
                  (sp: any) => sp.id === originalCombernoil?.process_id
                );
                return {
                  ...cg,
                  reel_lot_no: spinProcess?.reel_lot_no || null,
                };
              }
            );

            return {
              ...saleData,
              combernoilGeneration: updatedCombernoilGen,
            };
          }
        }

        return saleData;
      })
    );
    return res.sendSuccess(res, processedData);
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message, error);
  }
};

//fetch Spinner transaction with filters
const fetchTransactionAlert = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { ginnerId, status, filter, programId, spinnerId, seasonId }: any =
    req.query;
  const offset = (page - 1) * limit;
  const afterDate = new Date("2019-11-01");
  const whereCondition: any = {
    date: { [Op.gte]: afterDate },
  };

  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { lot_no: { [Op.iLike]: `%${searchTerm}%` } }, // Search by
        { invoice_no: { [Op.iLike]: `%${searchTerm}%` } }, // Search by
        { "$ginner.name$": { [Op.iLike]: `%${searchTerm}%` } }, // Search by
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } }, // Search by program
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type
      ];
    }

    if (status === "Pending") {
      whereCondition.buyer = spinnerId;
      whereCondition.status = {
        [Op.in]: [
          "Pending",
          "Pending for QR scanning",
          "Partially Accepted",
          "Partially Rejected",
        ],
      };
    }
    if (status === "Sold") {
      whereCondition.buyer = spinnerId;
      whereCondition.status = "Sold";
    }

    if (ginnerId) {
      const idArray: number[] = ginnerId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.ginner_id = { [Op.in]: idArray };
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

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.season_id = { [Op.in]: idArray };
    }

    whereCondition.visible_flag = true;

    let include = [
      {
        model: Ginner,
        as: "ginner",
        attributes: ["id", "name"],
        include: [
          {
            model: State,
            as: "state",
            attributes: ["id", "state_name"],
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
        attributes: ["id", "name", "address"],
      },
    ];
    //fetch data with pagination
    const rows = await GinSales.findAll({
      where: whereCondition,
      include: include,
      order: [["id", "desc"]],
    });

    let data = [];

    for await (const row of rows) {
      const bale_details = await BaleSelection.findOne({
        attributes: [
          [
            Sequelize.fn("COUNT", Sequelize.literal('DISTINCT "bale"."id"')),
            "no_of_bales",
          ],
          [
            Sequelize.fn(
              "COALESCE",
              Sequelize.fn(
                "SUM",
                Sequelize.literal('CAST("bale"."weight" AS DOUBLE PRECISION)')
              ),
              0
            ),
            "total_qty",
          ],
          // Add other attributes here...
        ],
        where: {
          sales_id: row?.dataValues?.id,
          spinner_status: null,
        },
        include: [
          {
            model: GinBale,
            as: "bale",
            attributes: [],
          },
        ],
        group: ["sales_id"],
      });

      const bales = await BaleSelection.findAll({
        attributes: [
          "bale_id",
          // Add other attributes here...
        ],
        where: {
          sales_id: row?.dataValues?.id,
          spinner_status: null,
        },
        include: [
          {
            model: GinBale,
            as: "bale",
          },
        ],
      });

      if (bales && bales.length > 0) {
        data.push({
          ...row?.dataValues,
          bale_details,
          bales: bales.map((item: any) => item.bale),
        });
      }
    }

    return res.sendSuccess(res, data);
  } catch (error: any) {
    return res.sendError(res, error.message, error);
  }
};

//update spinner transactions to accept and reject
// const updateStatusSales = async (req: Request, res: Response) => {
//     try {
//         let update = []
//         await GinSales.update({visible_flag: false}, { where: { id: req.body.items?.map((obj: any) => obj.id) } });
//         for (const obj of req.body.items) {
//             let result;
//             let soldCount = 0;
//             let rejectedCount = 0;
//             let nullCount = 0;

//             let data: any = {
//                 accept_date: obj.status === 'Sold' ? new Date().toISOString() : null
//             };

//             let rejectedBalesId = [];

//             for await (const bale of obj.bales) {
//                 const isNotUpdated = await BaleSelection.findOne({ where: { bale_id: bale.id, sales_id: obj.id, spinner_status: null } });
//                 if(isNotUpdated){
//                     if (obj.status !== 'Sold') {
//                         rejectedBalesId.push(bale.id);
//                         // await GinBale.update({ sold_status: false }, { where: { id: bale.id } });
//                     }

//                     if (obj.status === 'Sold') {
//                         await GinBale.update({ accepted_weight: bale.qtyUsed ? Number(bale.qtyUsed).toFixed(2) : 0 }, { where: { id: bale.id } });
//                     }
//                     await BaleSelection.update({ spinner_status: obj.status === 'Sold' ? true : false }, { where: { bale_id: bale.id, sales_id: obj.id } });
//                 }
//             }

//             let bales = await BaleSelection.findAll({ where: { sales_id: obj.id } });

//             for (const bale of bales) {
//                 if (bale.spinner_status === true) {
//                     soldCount++;
//                 } else if (bale.spinner_status === false) {
//                     rejectedCount++;
//                 }
//             }

//             // Update status based on counts
//             let status;
//             if (soldCount === bales.length) {
//                 status = 'Sold';
//             } else if (rejectedCount === bales.length) {
//                 status = 'Rejected';
//             } else if (soldCount > rejectedCount) {
//                 status = 'Partially Accepted';
//             } else {
//                 status = 'Partially Rejected';
//             }

//             if(obj.status !== 'Sold' && rejectedBalesId && rejectedBalesId.length > 0){
//                 console.log("Rejected Bales", rejectedBalesId)
//                 if(status === 'Rejected'){
//                     console.log("==== Completely Rejected ====")
//                     await GinBale.update({ sold_status: false, is_all_rejected: true }, { where: { id: rejectedBalesId } });
//                 }else if(status === 'Partially Accepted' || status === 'Partially Rejected'){
//                     console.log("===== Not Completely Rejected =====")
//                     await GinBale.update({ sold_status: false, is_all_rejected: false }, { where: { id: rejectedBalesId } });
//                 }
//             }

//             data = { ...data, status: status }

//             const ginSale = await GinSales.findOne({ where: { id: obj.id } });
//             const lintSale = await LintSelections.findAll({ where: { lint_id: obj.id } });
//             const [total] = await sequelize.query(`SELECT
//                         COALESCE(
//                             SUM(
//                                 CASE
//                                 WHEN gb.accepted_weight IS NOT NULL THEN gb.accepted_weight
//                                 ELSE CAST(gb.weight AS DOUBLE PRECISION)
//                                 END
//                             ), 0
//                         ) AS total_qty
//                     FROM
//                         bale_selections bs
//                     LEFT JOIN
//                         "gin-bales" gb ON bs.bale_id = gb.id
//                     WHERE
//                         bs.sales_id = ${obj.id}
//                         AND bs.spinner_status = true`, {
//                             type: sequelize.QueryTypes.SELECT,
//                         })

//                         console.log("max qty stock to be in gin sales=============",total, Math.ceil(Number(total.total_qty)), ginSale.qty_stock + Number(obj.qtyStock))

//             if (ginSale) {
//                 // Increment qty_stock by obj.qtyStock
//                 if (obj.status === 'Sold' && (ginSale.qty_stock + Number(obj.qtyStock) <= Math.ceil(Number(total.total_qty)))) {
//                     data.qty_stock = Number(ginSale.qty_stock) + Number(obj.qtyStock);
//                     if(lintSale && lintSale?.length > 0){
//                         let sum = lintSale?.reduce((acc: any, value:any) => Number(value?.qty_used) + acc,0);

//                         data.accepted_bales_weight = Number(ginSale.qty_stock) + Number(obj.qtyStock) + sum;
//                     }else{
//                         data.accepted_bales_weight = Number(ginSale.qty_stock) + Number(obj.qtyStock);
//                     }
//                 }
//                 result = await GinSales.update({...data, visible_flag: true}, { where: { id: obj.id } });
//             }

//             update.push(result);
//         }
//         res.sendSuccess(res, { update });
//     } catch (error: any) {
//         await GinSales.update({visible_flag: true}, { where: { id: req.body.items?.map((obj: any) => obj.id) } });
//         console.log(error)
//         return res.sendError(res, error.message, error);
//     }
// }

const updateStatusSales = async (req: Request, res: Response) => {
  try {
    let update: any = [];

    // Begin transaction to manage multiple operations as a single unit
    await sequelize.transaction(async (t: any) => {
      // Update visibility flag for all items in bulk
      await GinSales.update(
        { visible_flag: false },
        {
          where: { id: req.body.items?.map((obj: any) => obj.id) },
          transaction: t,
        }
      );

      // Loop through items in request body to process each one
      for (const obj of req.body.items) {
        let soldCount = 0;
        let rejectedCount = 0;
        let rejectedBalesId = [];

        let data: any = {
          accept_date: obj.status === "Sold" ? new Date().toISOString() : null,
        };

        // Batch update for bales
        const balesToUpdate = obj.bales.map((bale: any) => bale.id);
        if (balesToUpdate.length > 0) {
          await BaleSelection.update(
            { spinner_status: obj.status === "Sold" ? true : false },
            {
              where: {
                bale_id: balesToUpdate,
                sales_id: obj.id,
                spinner_status: null,
              },
              transaction: t,
            }
          );

          if (obj.status === "Sold") {
            for (const bale of obj.bales) {
              const acceptedWeight = bale.qtyUsed
                ? Number(bale.qtyUsed).toFixed(2)
                : 0;

              await GinBale.update(
                { accepted_weight: acceptedWeight },
                { where: { id: bale.id }, transaction: t }
              );
            }
          } else {
            rejectedBalesId = balesToUpdate;
            let notGintoGinBalesId = obj.bales
              .filter((bale: any) => !bale.is_gin_to_gin_sale)
              ?.map((bale: any) => bale.id);
            let GintoGinBalesId = obj.bales
              .filter((bale: any) => bale.is_gin_to_gin_sale)
              ?.map((bale: any) => bale.id);
            if (GintoGinBalesId && GintoGinBalesId.length > 0) {
              for await (let id of GintoGinBalesId) {
                // let oldSale = await GinToGinSale.findOne({
                //   where: { bale_id: id },
                //   order: [["sales_id", "desc"]],
                //   transaction: t,
                // });
                // if (oldSale) {
                //   await GinToGinSale.update(
                //     { gin_sold_status: null },
                //     {
                //       where: {
                //         bale_id: id,
                //         sales_id: oldSale?.dataValues?.sales_id,
                //       },
                //       transaction: t,
                //     }
                //   );
                //   await GinBale.update(
                //     { is_all_rejected: false },
                //     { where: { id }, transaction: t }
                //   );
                // }
              }
            } else if (notGintoGinBalesId && notGintoGinBalesId.length > 0) {
              await GinBale.update(
                { sold_status: false, is_all_rejected: false },
                { where: { id: notGintoGinBalesId }, transaction: t }
              );
            }
          }
        }

        // Retrieve bale data for status calculation
        const bales = await BaleSelection.findAll({
          where: { sales_id: obj.id },
          attributes: ["spinner_status"],
          transaction: t,
        });

        // Count status types in bales
        soldCount = bales.filter(
          (bale: any) => bale.spinner_status === true
        ).length;
        rejectedCount = bales.filter(
          (bale: any) => bale.spinner_status === false
        ).length;

        // Determine the status
        let status = "Partially Rejected";
        if (soldCount === bales.length) status = "Sold";
        else if (rejectedCount === bales.length) status = "Rejected";
        else if (soldCount > rejectedCount) status = "Partially Accepted";

        if (status === "Rejected") {
          console.log("==== Completely Rejected ====");
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

          console.log("==== GinBale Updated for Rejected Sales ====");
        }

        data.status = status;

        // Calculate total quantity
        const [total] = await sequelize.query(
          `
                    SELECT COALESCE(SUM(CASE WHEN gb.accepted_weight IS NOT NULL 
                        THEN gb.accepted_weight ELSE CAST(gb.weight AS DOUBLE PRECISION) END), 0) AS total_qty
                    FROM bale_selections bs
                    LEFT JOIN "gin-bales" gb ON bs.bale_id = gb.id
                    WHERE bs.sales_id = :sales_id AND bs.spinner_status = true`,
          {
            replacements: { sales_id: obj.id },
            type: sequelize.QueryTypes.SELECT,
            transaction: t,
          }
        );

        const ginSale = await GinSales.findOne({
          where: { id: obj.id },
          transaction: t,
        });
        const lintSale = await LintSelections.findAll({
          where: { lint_id: obj.id },
          transaction: t,
        });

        console.log(
          "max qty stock to be in gin sales=============",
          total,
          Math.ceil(Number(total.total_qty)),
          ginSale.qty_stock + Number(obj.qtyStock)
        );

        if (
          ginSale &&
          obj.status === "Sold" &&
          ginSale.qty_stock + Number(obj.qtyStock) <=
            Math.ceil(Number(total.total_qty))
        ) {
          data.qty_stock = Number(ginSale.qty_stock) + Number(obj.qtyStock);
          if (lintSale && lintSale?.length > 0) {
            let sum = lintSale?.reduce(
              (acc: any, value: any) => Number(value?.qty_used) + acc,
              0
            );

            data.accepted_bales_weight =
              Number(ginSale.qty_stock) + Number(obj.qtyStock) + sum;
          } else {
            data.accepted_bales_weight =
              Number(ginSale.qty_stock) + Number(obj.qtyStock);
          }
        }

        // Update GinSales with calculated data
        const result = await GinSales.update(
          { ...data, visible_flag: true },
          {
            where: { id: obj.id },
            transaction: t,
          }
        );

        // Store result data
        update.push({
          id: obj.id,
          status: data.status,
          qty_stock: data.qty_stock,
          visible_flag: true,
        });
      }
    });

        // Send combined response with all updates
        res.sendSuccess(res, { update });
    } catch (error: any) {
        console.log(error);
        await GinSales.update({ visible_flag: true }, { where: { id: req.body.items?.map((obj: any) => obj.id) } });
        return res.sendError(res, error.message, error);
    }
};

const fetchTransactionList = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { ginnerId, status, filter, programId, spinnerId, seasonId }: any =
    req.query;
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

    if (seasonId) {
      const idArray = seasonId.split(",").map((id: any) => parseInt(id, 10));
      whereCondition.push(`gs.season_id IN (${idArray.join(",")})`);
    }

    if (ginnerId) {
      const idArray = ginnerId.split(",").map((id: any) => parseInt(id, 10));
      whereCondition.push(`gs.ginner_id IN (${idArray.join(",")})`);
    }

    if (programId) {
      const idArray = programId.split(",").map((id: any) => parseInt(id, 10));
      whereCondition.push(`gs.program_id IN (${idArray.join(",")})`);
    }
    whereCondition.push(`gs.buyer = ${spinnerId}`);
    whereCondition.push(
      `gs.status IN ('Sold', 'Partially Accepted', 'Partially Rejected')`
    );

    // const whereClause = whereCondition.length > 0 ? `WHERE ${whereCondition.join(' AND ')}` : '';
    const whereClause =
      whereCondition.length > 0
        ? `WHERE ${whereCondition.join(" AND ")} AND bd.total_qty > 0`
        : "WHERE bd.total_qty > 0";

    // Count query
    // const countQuery = `
    //     SELECT COUNT(*) AS total_count
    //     FROM
    //             gin_sales gs
    //         LEFT JOIN
    //             ginners g ON gs.ginner_id = g.id
    //         LEFT JOIN
    //             seasons s ON gs.season_id = s.id
    //         LEFT JOIN
    //             programs p ON gs.program_id = p.id
    //         LEFT JOIN
    //             spinners sp ON gs.buyer = sp.id
    //     ${whereClause}`;

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
                    sp.id AS buyerdata_id, 
                    sp.name AS buyerdata_name, 
                    sp.address AS buyerdata_address, 
                    bd.no_of_bales AS accepted_no_of_bales, 
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
                    gs."updatedAt" DESC
                LIMIT 
                    :limit OFFSET :offset;`;

    const [countResult, rows] = await Promise.all([
      sequelize.query(countQuery, {
        type: sequelize.QueryTypes.SELECT,
      }),
      sequelize.query(dataQuery, {
        replacements: { limit, offset },
        type: sequelize.QueryTypes.SELECT,
      }),
    ]);

    const totalCount =
      countResult && countResult.length > 0
        ? Number(countResult[0].total_count)
        : 0;

    // let result = data.slice(offset, offset + limit);

        // return res.sendPaginationSuccess(res, result, data.length);
        return res.sendPaginationSuccess(res, rows, totalCount);
    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.message, error);
    }
};

//count the number of bales and total quantity stock With Program
const countCottonBaleWithProgram = async (req: Request, res: Response) => {
  try {
    let whereCondition: any = {};
    whereCondition.buyer = req.query.spinnerId;
    whereCondition.status = "Sold";
    const gin = await GinSales.findAll({
      where: whereCondition,
      attributes: [
        [Sequelize.fn("SUM", Sequelize.col("no_of_bales")), "totalBales"],
        [Sequelize.fn("SUM", Sequelize.col("qty_stock")), "totalQuantity"],
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
    const spinSale = await SpinSales.findAll({
      where: {
        spinner_id: req.query.spinnerId,
      },
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
    res.sendSuccess(res, { gin, spinSale });
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const exportSpinnerTransaction = async (req: Request, res: Response) => {
  const excelFilePath = path.join("./upload", "Spinner_transaction_list.xlsx");
  const searchTerm = req.query.search || "";
  const { ginnerId, filter, seasonId, programId, spinnerId }: any = req.query;
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

    if (seasonId) {
      const idArray = seasonId.split(",").map((id: any) => parseInt(id, 10));
      whereCondition.push(`gs.season_id IN (${idArray.join(",")})`);
    }

    if (ginnerId) {
      const idArray = ginnerId.split(",").map((id: any) => parseInt(id, 10));
      whereCondition.push(`gs.ginner_id IN (${idArray.join(",")})`);
    }

    if (programId) {
      const idArray = programId.split(",").map((id: any) => parseInt(id, 10));
      whereCondition.push(`gs.program_id IN (${idArray.join(",")})`);
    }
    whereCondition.push(`gs.buyer = ${spinnerId}`);
    whereCondition.push(
      `gs.status IN ('Sold', 'Partially Accepted', 'Partially Rejected')`
    );

    const whereClause =
      whereCondition.length > 0 ? `WHERE ${whereCondition.join(" AND ")}` : "";
    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.",
      "Date",
      "Season",
      "Ginner Name",
      "Invoice No",
      "Bale Lot",
      "No of Bales",
      "REEL Lot No",
      "Received Lint Quantity (Kgs)",
      "Accepted Lint Quantity (Kgs)",
      "Programme",
      "Vehicle No",
    ]);
    headerRow.font = { bold: true };

    let dataQuery = `
                WITH bale_details AS (
                    SELECT 
                        bs.sales_id,
                        COUNT(DISTINCT gb.id) AS no_of_bales,
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
                    sp.id AS buyerdata_id, 
                    sp.name AS buyerdata_name, 
                    sp.address AS buyerdata_address, 
                    bd.no_of_bales AS accepted_no_of_bales, 
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
                    gs."updatedAt" DESC
                `;
    const rows = await sequelize.query(dataQuery, {
      type: sequelize.QueryTypes.SELECT,
    });

    // Append data to worksheet
    for await (const [index, item] of rows.entries()) {
      const rowValues = Object.values({
        index: index + 1,
        date: item.date ? item.date : "",
        season: item.season_name ? item.season_name : "",
        ginner: item.ginner_name ? item.ginner_name : "",
        invoice: item.invoice_no ? item.invoice_no : "",
        lot_no: item.lot_no ? item.lot_no : "",
        no_of_bales: item.accepted_no_of_bales
          ? item?.accepted_no_of_bales
          : "",
        reel_lot_no: item.reel_lot_no ? item.reel_lot_no : "",
        receive_quantity: item?.received_total_qty
          ? item?.received_total_qty
          : "",
        quantity: item?.accepted_total_qty ? item?.accepted_total_qty : "",
        program: item.program_name ? item.program_name : "",
        vehicle: item.vehicle_no ? item.vehicle_no : "",
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
      data: process.env.BASE_URL + "Spinner_transaction_list.xlsx",
    });
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

const getProgram = async (req: Request, res: Response) => {
  try {
    if (!req.query.spinnerId) {
      return res.sendError(res, "Need Spinner Id");
    }

    let spinnerId = req.query.spinnerId;
    let spinner = await Spinner.findOne({ where: { id: spinnerId } });
    if (!spinner?.program_id) {
      return res.sendSuccess(res, []);
    }
    let data = await Program.findAll({
      where: {
        id: { [Op.in]: spinner.program_id },
      },
    });
    res.sendSuccess(res, data);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const getSalesInvoice = async (req: Request, res: Response) => {
  try {
    if (!req.query.salesId) {
      return res.sendError(res, "Need Sales Id");
    }

    let salesId = req.query.salesId;
    let sales = await GinSales.findOne({
      where: { id: salesId },
      include: [
        {
          model: Ginner,
          as: "ginner",
          include: [
            {
              model: State,
              as: "state",
            },
          ],
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
          attributes: ["id", "name", "address"],
        },
      ],
    });
    let data = await generateGinSalesHtml(sales.dataValues);
    return res.sendSuccess(res, {
      file: process.env.BASE_URL + "sales_invoice.pdf",
    });
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const getYarnCount = async (req: Request, res: Response) => {
  try {
    if (!req.query.spinnerId) {
      return res.sendError(res, "Need Spinner Id");
    }

    let spinnerId = req.query.spinnerId;
    let spinner = await Spinner.findOne({ where: { id: spinnerId } });
    if (!spinner?.yarn_count_range) {
      return res.sendSuccess(res, []);
    }
    let idArray: number[] = spinner.yarn_count_range
      .split(",")
      .map((id: any) => parseInt(id, 10));

    if (idArray.length > 0) {
      let data = await YarnCount.findAll({
        where: {
          id: { [Op.in]: idArray },
        },
      });
      res.sendSuccess(res, data);
    } else {
      res.sendSuccess(res, []);
    }
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const getKnitterWeaver = async (req: Request, res: Response) => {
  let spinnerId = req.query.spinnerId;

  let whereCondition: any = {};

  if (req.query.status == "true") {
    whereCondition.status = true;
  }

  if (!spinnerId) {
    return res.sendError(res, "Need spinner Id ");
  }
  let ress = await Spinner.findOne({ where: { id: spinnerId } });
  if (!ress) {
    return res.sendError(res, "No Spinner Found ");
  }
  let result: any = await Promise.all([
    Knitter.findAll({
      attributes: ["id", "name", [sequelize.literal("'kniter'"), "type"]],
      where: {
        ...whereCondition,
        brand: { [Op.overlap]: ress.dataValues.brand },
      },
    }),
    Weaver.findAll({
      attributes: ["id", "name", [sequelize.literal("'weaver'"), "type"]],
      where: {
        ...whereCondition,
        brand: { [Op.overlap]: ress.dataValues.brand },
      },
    }),
  ]);
  res.sendSuccess(res, result.flat());
};

const getGinnerDashboard = async (req: Request, res: Response) => {
  let spinnerId = req.query.spinnerId;
  if (!spinnerId) {
    return res.sendError(res, "Need Spinner Id ");
  }
  let whereCondition = {
    status: "Sold",
    buyer: spinnerId,
  };
  const ginner = await GinSales.findAll({
    include: [
      {
        model: Ginner,
        as: "ginner",
        attributes: [],
      },
    ],
    attributes: [
      [Sequelize.literal("ginner.id"), "id"],
      [Sequelize.literal('"ginner"."name"'), "name"],
    ],
    where: whereCondition,
    group: ["ginner_id", "ginner.id"],
  });
  res.sendSuccess(res, ginner);
};

const chooseLint = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const {
    spinnerId,
    ginnerId,
    programId,
    reelLotNo,
    invoiceNo,
    seasonId,
  }: any = req.query;
  const whereCondition: any = {};
  const sqlCondition: any = [];
  try {
    if (!spinnerId) {
      return res.sendError(res, "Spinner Id is required");
    }
    if (!programId) {
      return res.sendError(res, "Programme Id is required");
    }
    if (spinnerId) {
      whereCondition.buyer = spinnerId;
      sqlCondition.push(`gs.buyer = ${spinnerId}`);
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.season_id = { [Op.in]: idArray };
      sqlCondition.push(`gs.season_id IN (${idArray.join(",")})`);
    }

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.program_id = { [Op.in]: idArray };
      sqlCondition.push(`gs.program_id IN (${idArray.join(",")})`);
    }

    if (ginnerId) {
      const idArray: number[] = ginnerId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.ginner_id = { [Op.in]: idArray };
      sqlCondition.push(`gs.ginner_id IN (${idArray.join(",")})`);
    }

    if (reelLotNo) {
      const idArray: any[] = reelLotNo.split(",").map((id: any) => id);
      whereCondition.reel_lot_no = { [Op.in]: idArray };
      const quotedIdArray = idArray.map((id) => `'${id}'`).join(",");
      sqlCondition.push(`gs.reel_lot_no IN (${quotedIdArray})`);
    }

    if (invoiceNo) {
      const idArray: any[] = invoiceNo.split(",").map((id: any) => id);
      whereCondition.invoice_no = { [Op.in]: idArray };

      const quotedIdArray = idArray.map((id) => `'${id}'`).join(",");
      sqlCondition.push(`gs.invoice_no IN (${quotedIdArray})`);
    }

    whereCondition.status = {
      [Op.in]: ["Sold", "Partially Accepted", "Partially Rejected"],
    };
    // whereCondition.greyout_status = { [Op.not]: true };
    whereCondition.qty_stock = { [Op.gt]: 0 };

    sqlCondition.push(
      `gs.status IN ('Sold', 'Partially Accepted', 'Partially Rejected')`
    );
    // sqlCondition.push(`gs.greyout_status IS NOT TRUE`)
    sqlCondition.push(`gs.qty_stock > 0`);

    const whereClause =
      sqlCondition.length > 0 ? `WHERE ${sqlCondition.join(" AND ")}` : "";

    let include = [
      {
        model: Season,
        as: "season",
        attributes: ["id", "name"],
      },
    ];

    //fetch data with pagination
    let result = await GinSales.findAll({
      where: whereCondition,
      include: include,
      attributes: [
        [Sequelize.fn("SUM", Sequelize.col("qty_stock")), "available_lint"],
      ],
      group: ["season.id", "season_id"],
    });
    // console.log(result);
    let list = [];
    for await (let item of result) {
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
                    sp.id AS buyerdata_id, 
                    sp.name AS buyerdata_name, 
                    sp.address AS buyerdata_address, 
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
                ${whereClause} AND
                    season_id = ${item.dataValues.season.id}
                ORDER BY 
                    gs.id DESC;`;

            const items = await sequelize.query(dataQuery, {
                type: sequelize.QueryTypes.SELECT,
            })
            list.push({ ...item.dataValues, data: items });
        }
        return res.sendSuccess(res, list);

    } catch (error: any) {
        return res.sendError(res, error.message, error);
    }
};

const chooseYarn = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const { spinnerId, programId, reelLotNo, seasonId }: any = req.query;
  const whereCondition: any = {};
  try {
    if (!spinnerId) {
      return res.sendError(res, "Spinner Id is required");
    }
    if (!programId) {
      return res.sendError(res, "Programme Id is required");
    }
    if (spinnerId) {
      whereCondition.spinner_id = spinnerId;
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

    if (reelLotNo) {
      const idArray: any[] = reelLotNo.split(",").map((id: any) => id);
      whereCondition.reel_lot_no = { [Op.in]: idArray };
    }
    whereCondition.qty_stock = { [Op.gt]: 0 };
    // whereCondition.greyout_status = { [Op.not]: true };
    let include = [
      {
        model: Season,
        as: "season",
        attributes: [],
      },
    ];

    let result = await SpinYarn.findAll({
      attributes: [
        [Sequelize.col('"spinprocess"."season"."id"'), "season_id"],
        [Sequelize.col('"spinprocess"."season"."name"'), "season_name"],
        // [Sequelize.fn('SUM', Sequelize.col('yarn_produced')), 'available_yarn']
        [
          Sequelize.fn("SUM", Sequelize.col("yarn_qty_stock")),
          "available_yarn",
        ],
        // spinprocess.qty_stock
      ],
      include: [
        {
          model: SpinProcess,
          attributes: [],
          as: "spinprocess",
          where: whereCondition,
          include: include,
        },
      ],
      where: { sold_status: false },
      group: ["spinprocess.season.id", "spinprocess.season_id"],
    });

    //fetch data with pagination
    // let result = await SpinProcess.findAll({
    //     where: whereCondition,
    //     include: include,
    //     attributes: [
    //         [Sequelize.fn('SUM', Sequelize.col('qty_stock')), 'available_yarn']
    //     ],
    //     group: ["season.id", "season_id"]
    // });

    let list = [];
    for await (let item of result) {
      let items = await SpinProcess.findAll({
        where: { ...whereCondition, season_id: item.dataValues.season_id },
        attributes: [
          "id",
          "yarn_type",
          "yarn_count",
          "net_yarn_qty",
          "reel_lot_no",
          "batch_lot_no",
          "qty_stock",
          "greyout_status",
        ],
        include: [
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
        ],
        order: [["id", "DESC"]],
      });

      let data = [];

      for await (let row of items) {
        const lot_details = await SpinYarn.findAll({
          attributes: [
            [
              sequelize.fn(
                "SUM",
                Sequelize.col('"spinprocess"."net_yarn_qty"')
              ),
              "total_yarn",
            ],
            [
              sequelize.fn(
                "SUM",
                Sequelize.col('"spin_yarns"."yarn_produced"')
              ),
              "yarn_produced",
            ],
            [
              sequelize.fn(
                "SUM",
                Sequelize.col('"spin_yarns"."yarn_qty_stock"')
              ),
              "qty_stock",
            ],
            // Add other attributes here...
          ],
          where: {
            sold_status: false,
          },
          include: [
            {
              model: SpinProcess,
              as: "spinprocess",
              attributes: [
                "id",
                "batch_lot_no",
                "date",
                "yarn_type",
                "net_yarn_qty",
                "qty_stock",
                "reel_lot_no",
                "greyout_status",
              ],
              where: { id: row?.dataValues?.id },
            },
          ],
          group: [
            "spinprocess.id",
            "spinprocess.batch_lot_no",
            "spinprocess.reel_lot_no",
          ],
        });

        if (lot_details.length > 0) {
          const yarns = await SpinYarn.findAll({
            include: [
              {
                model: YarnCount,
                as: "yarncount",
                attributes: ["id", "yarnCount_name"],
              },
              {
                model: SpinProcess,
                as: "spinprocess",
                attributes: ["greyout_status"],
              },
            ],
            order: [["id", "desc"]],
            where: {
              process_id: row?.dataValues?.id,
              sold_status: false,
            },
          });

          if (yarns.length > 0) {
            lot_details[0].dataValues.yarns = yarns;
            data.push(lot_details[0]);
          }
        }
      }

      list.push({ ...item.dataValues, data: data });
    }

        return res.sendSuccess(res, list);

    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.message, error);
    }
};

const getInvoiceAndReelLotNo = async (req: Request, res: Response) => {
  const { programId, status, spinnerId }: any = req.query;
  const whereCondition: any = {};
  try {
    if (!spinnerId) {
      return res.sendError(res, "Spinner Id is required");
    }
    if (!programId) {
      return res.sendError(res, "Programme Id is required");
    }
    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.program_id = { [Op.in]: idArray };
    }
    if (spinnerId) {
      whereCondition.buyer = spinnerId;
    }
    whereCondition.status = "Sold";
    whereCondition.qty_stock = { [Op.gt]: 0 };
    const invoice = await GinSales.findAll({
      attributes: ["invoice_no"],
      where: whereCondition,
      group: ["invoice_no"],
    });
    const reelLot = await GinSales.findAll({
      attributes: ["reel_lot_no"],
      where: { ...whereCondition, reel_lot_no: { [Op.not]: null } },
      group: ["reel_lot_no"],
    });

    res.sendSuccess(res, { invoice, reelLot });
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const getYarnReelLotNo = async (req: Request, res: Response) => {
  const { programId, status, spinnerId }: any = req.query;
  const whereCondition: any = {};
  try {
    if (!spinnerId) {
      return res.sendError(res, "Spinner Id is required");
    }
    if (!programId) {
      return res.sendError(res, "Program Id is required");
    }
    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.program_id = { [Op.in]: idArray };
    }
    if (spinnerId) {
      whereCondition.spinner_id = spinnerId;
    }
    whereCondition.reel_lot_no = { [Op.not]: null };
    whereCondition.qty_stock = { [Op.gt]: 0 };
    const reelLot = await SpinProcess.findAll({
      attributes: ["reel_lot_no"],
      where: whereCondition,
      group: ["reel_lot_no"],
    });

    res.sendSuccess(res, reelLot);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const _getSpinnerProcessTracingChartData = async (reelLotNo: any) => {
  let offset = 0;
  let allSpinData: any = [];

  let include = [{ model: Spinner, as: "spinner", attributes: ["id", "name"] }];
  let whereCondition: any = {};

  if (reelLotNo !== null) {
    const idArray = reelLotNo.split(",");
    whereCondition.reel_lot_no = { [Op.in]: idArray };
  }

  // const BATCH_SIZE = 10;
  // while (true) {
  let batchSpinData = await queryWithRetry(() =>
    SpinProcess.findAll({
      where: whereCondition,
      include: include,
      order: [["id", "desc"]],
      //   limit: BATCH_SIZE,
      //   offset: offset,
      attributes: ["id", "reel_lot_no"],
    })
  );

  //   if (batchSpinData.length === 0) break;

  //   offset += BATCH_SIZE;

  let spinWithGinSales = await Promise.all(
    batchSpinData.map(async (spin: any) => {
      spin = spin.toJSON();

      // Fetch lintSele for spin
      spin.lintSele = await LintSelections.findAll({
        where: {
          process_id: spin.id,
        },
      });

      // Fetch ginSales for spin
      spin.ginSales = await Promise.all(
        spin.lintSele.map(async (lintSeleItem: any) => {
          let ginSales = await GinSales.findAll({
            where: { id: lintSeleItem.lint_id },
            include: [
              { model: Ginner, as: "ginner", attributes: ["id", "name"] },
            ],
            attributes: ["id", "ginner_id", "reel_lot_no"],
          });
          return ginSales;
        })
      );

      // Process ginSales and transactions
      spin.ginSales = await Promise.all(
        spin.ginSales.map(async (sales: any) => {
          return await Promise.all(
            sales.map(async (sale: any) => {
              // Assuming _getGinnerProcessTracingChartData returns data or handles async operations correctly
              return await _getGinnerProcessTracingChartData(sale.reel_lot_no);
            })
          );
        })
      );

      return spin;
    })
  );

  allSpinData = allSpinData.concat(spinWithGinSales);
  // }

  return formatDataForSpinnerProcess(reelLotNo, allSpinData);
};

async function queryWithRetry(queryFunction: any, retries = 0) {
  try {
    return await queryFunction();
  } catch (error) {
    if (
      error instanceof sequelize.ConnectionAcquireTimeoutError &&
      retries < 3
    ) {
      console.error(
        `Connection timeout, retrying... (attempt ${retries + 1}/3)`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Retry after 1 second
      return await queryWithRetry(queryFunction, retries + 1);
    }
    throw error; // Propagate other errors
  }
}

const getSpinnerProcessTracingChartData = async (
  req: Request,
  res: Response
) => {
  const { reelLotNo } = req.query;

  // await createIndexes();

  const data = await _getSpinnerProcessTracingChartData(reelLotNo);

  // await createIndexes();
  res.sendSuccess(res, data);
};
const createIndexIfNotExists = async (
  tableName: any,
  indexName: any,
  fields: any
) => {
  try {
    const indexExistsQuery = `
            SELECT indexname
            FROM pg_indexes
            WHERE tablename = '${tableName}'
            AND indexname = '${indexName}';
        `;
    const [existingIndex] = await sequelize.query(indexExistsQuery, {
      type: sequelize.QueryTypes.SELECT,
    });

    if (!existingIndex || existingIndex.length === 0) {
      const createIndexQuery = `
                CREATE INDEX CONCURRENTLY ${indexName} ON "${tableName}" (${fields
        .map((field: any) => `"${field}"`)
        .join(", ")});
            `;
      await sequelize.query(createIndexQuery);
      console.log(
        `Index ${indexName} created successfully on ${tableName} table.`
      );
    } else {
      console.log(
        `Index ${indexName} already exists on ${tableName} table. Skipped creation.`
      );
    }
  } catch (error) {
    console.error(
      `Error creating index ${indexName} on ${tableName} table:`,
      error
    );
  }
};

const createIndexes = async () => {
  try {
    // Example 1: Creating unique index on farm_groups
    await createIndexIfNotExists("farm_groups", "idx_farmGroup_name", "name");

    // Example 2: Creating index on spin_processes
    await createIndexIfNotExists(
      "spin_processes",
      "idx_spinProcess_reel_lot_no",
      "reel_lot_no"
    );

    // Example 3: Creating index on gin_sales
    await createIndexIfNotExists("gin_sales", "idx_ginSales_buyer_ginner_id", [
      "buyer",
      "ginner_id",
    ]);

    // Example 4: Creating index on transactions
    await createIndexIfNotExists(
      "transactions",
      "idx_transaction_mapped_ginner_farmer_id_village_id",
      ["mapped_ginner_farmer_id", "village_id"]
    );

    console.log("Index creation completed.");
  } catch (error) {
    console.error("Error creating indexes:", error);
  }
};

export {
  createSpinnerProcess,
  fetchSpinnerProcessPagination,
  exportSpinnerProcess,
  // updateSpinnerProcess,
  createSpinnerSales,
  updateSpinnerSales,
  fetchSpinnerSale,
  fetchSpinSalesPagination,
  exportSpinnerSale,
  fetchTransactionAlert,
  fetchTransactionList,
  updateStatusSales,
  countCottonBaleWithProgram,
  exportSpinnerTransaction,
  getProgram,
  fetchComberNoilPagination,
  chooseYarnProcess,
  getYarnCount,
  deleteSpinnerProcess,
  deleteSpinnerSales,
  getKnitterWeaver,
  fetchSpinnerProcess,
  updateSpinProcess,
  getGinnerDashboard,
  chooseLint,
  getSalesInvoice,
  chooseYarn,
  getSpinners,
  getInvoiceAndReelLotNo,
  getYarnReelLotNo,
  getSpinnerProcessTracingChartData,
  fetchTransactionAlertForComberNoil,
  updateStatusComberNoil,
  fetchComberNoilTransactionList,
  _getSpinnerProcessTracingChartData,
};
