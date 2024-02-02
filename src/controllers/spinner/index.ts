import { Request, Response } from "express";

import { Sequelize, Op, where } from "sequelize";
import { encrypt, generateGinSalesHtml, generateOnlyQrCode } from "../../provider/qrcode";
import * as ExcelJS from "exceljs";
import * as fs from "fs";
import * as path from "path";
import Season from "../../models/season.model";
import Program from "../../models/program.model";
import Spinner from "../../models/spinner.model";
import State from "../../models/state.model";
import Country from "../../models/country.model";
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
import BaleSelection from "../../models/bale-selection.model";
import GinBale from "../../models/gin-bale.model";
import ComberSelection from "../../models/comber-selection.model";
import { send_spin_mail } from "../send-emails";

//create Spinner Process
const createSpinnerProcess = async (req: Request, res: Response) => {
    try {
        let program = await Program.findOne({ where: { program_name: { [Op.iLike]: 'Reel' } } });
        let abc
        if (program.dataValues.id == req.body.programId) {
            abc = await yarnId(req.body.spinnerId, req.body.date);
        }
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
            status: 'Pending'
        };
        const spin = await SpinProcess.create(data);
        let uniqueFilename = `spin_procees_qrcode_${Date.now()}.png`;
        let da = encrypt(`Spinner,Process,${spin.id}`);
        let aa = await generateOnlyQrCode(da, uniqueFilename);
        const gin = await SpinProcess.update({ qr: uniqueFilename }, {
            where: {
                id: spin.id
            }
        });
        for await (let obj of req.body.chooseLint) {
            let update = await GinSales.update({ qty_stock: obj.totalQty - obj.qtyUsed }, { where: { id: obj.id } });
            let create = await LintSelections.create({ qty_used: obj.qtyUsed, process_id: spin.id, lint_id: obj.id })
        }
        if (req.body.chooseComberNoil && req.body.chooseComberNoil.length > 0) {
            for await (let obj of req.body.chooseComberNoil) {
                let update = await SpinProcess.update({ comber_noil_stock: obj.totalQty - obj.qtyUsed }, { where: { id: obj.id } })
                let create = await ComberSelection.create({ qty_used: obj.qtyUsed, process_id: spin.id, yarn_id: obj.id })
            }
        }
        res.sendSuccess(res, { spin });
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.meessage);
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
            raw: true
        }
    )
    let spin = await SpinProcess.count({
        include: [
            {
                model: Program,
                as: 'program',
                where: { program_name: { [Op.iLike]: 'Reel' } }
            }
        ],
        where: {
            spinner_id: id
        }
    })

    let prcs_date = new Date(date).toLocaleDateString().replace(/\//g, '');
    return a[0].idprefix + prcs_date + '/' + (((spin) ?? 1) + 1)
}

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
                { '$spinner.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { yarn_type: { [Op.iLike]: `%${searchTerm}%` } },
                { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { box_id: { [Op.iLike]: `%${searchTerm}%` } },
                { '$yarncount.yarnCount_name$': { [Op.iLike]: `%${searchTerm}%` } },
            ]
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
                attributes: ['id', 'name']
            },
            {
                model: Season,
                as: "season",
                attributes: ['id', 'name']
            },
            {
                model: Dyeing,
                as: "dyeing",
            },
            {
                model: Program,
                as: "program",
                attributes: ['id', 'program_name']
            },
            {
                model: YarnCount,
                as: "yarncount",
                attributes: ['id', 'yarnCount_name']
            }
        ];
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await SpinProcess.findAndCountAll({
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
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const gin = await SpinProcess.findAll({
                where: whereCondition,
                include: include,
                order: [
                    [
                        'id', 'desc'
                    ]
                ]
            });
            return res.sendSuccess(res, gin);
        }
    } catch (error: any) {
        return res.sendError(res, error.message);
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
                attributes: ['id', 'name']
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
            {
                model: YarnCount,
                as: "yarncount",
            }
        ];
        //fetch data with pagination

        const gin = await SpinProcess.findOne({
            where: whereCondition,
            include: include,
            order: [
                [
                    'id', 'desc'
                ]
            ]
        });
        return res.sendSuccess(res, gin);

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const deleteSpinnerProcess = async (req: Request, res: Response) => {
    try {
        let count = await SpinProcessYarnSelection.count({ where: { spin_process_id: req.body.id } })
        if (count > 0) {
            res.sendError(res, 'Unable to delete this process since some lint of this process was sold')
        } else {
            // Retrieve data
            const lintSelections = await LintSelections.findAll({
                attributes: ['id', 'process_id', 'lint_id', 'qty_used'],
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
                    process_id: req.body.id
                },
            });

            const res3 = await SpinProcess.destroy({
                where: {
                    id: req.body.id,
                },

            });
            return res.sendSuccess(res, { message: 'Successfully deleted this process' });
        }
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const fetchComberNoilPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { spinnerId, programId }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } }
            ]
        }
        if (spinnerId) {
            whereCondition.spinner_id = spinnerId;
        }

        if (programId) {
            const idArray: number[] = programId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.program_id = { [Op.in]: idArray };
        }
        whereCondition.comber_noil_stock = { [Op.gt]: 0 }
        let include = [
            {
                model: Program,
                as: "program",
            }
        ];
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await SpinProcess.findAndCountAll({
                attributes: ['id', 'batch_lot_no', 'comber_noil_stock', 'comber_noil', 'program_id'],
                where: whereCondition,
                include: include,
                order: [
                    [
                        'comber_noil_stock', 'desc'
                    ]
                ],
                offset: offset,
                limit: limit,
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const gin = await SpinProcess.findAll({
                attributes: ['id', 'batch_lot_no', 'comber_noil_stock', 'comber_noil', 'program_id'],
                where: whereCondition,
                include: include,
                order: [
                    [
                        'comber_noil_stock', 'desc'
                    ]
                ]
            });
            return res.sendSuccess(res, gin);
        }
    } catch (error: any) {
        return res.sendError(res, error.message);
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
        return res.sendError(res, error.meessage);
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
                { '$spinner.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { yarn_type: { [Op.iLike]: `%${searchTerm}%` } },
                { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { box_id: { [Op.iLike]: `%${searchTerm}%` } },
                { '$yarncount.yarnCount_name$': { [Op.iLike]: `%${searchTerm}%` } },
            ]
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
        worksheet.mergeCells('A1:L1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Process';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Season",
            "Spin Lot No", "Yarn Type", "Yarn Count", "Yarn Realisation %", "No of Boxes",
            "Box ID", "Blend", "Blend Qty", "Total Yarn weight (Kgs)"
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
            {
                model: YarnCount,
                as: "yarncount",
            }
        ];
        const gin = await SpinProcess.findAll({
            where: whereCondition,
            include: include
        });
        // Append data to worksheet
        for await (const [index, item] of gin.entries()) {
            let blendValue = '';
            let blendqty = ''
            if (item.cottonmix_type && item.cottonmix_type.length > 0) {
                let blend = await CottonMix.findAll({ where: { id: { [Op.in]: item.cottonmix_type } } });
                for (let bl of blend) {
                    blendValue += `${bl.cottonMix_name},`
                }
                for (let obj of item.cottonmix_qty) {
                    blendqty += `${obj},`
                }
            }

            const rowValues = Object.values({
                index: index + 1,
                date: item.date ? item.date : '',
                season: item.season ? item.season.name : '',
                lotNo: item.batch_lot_no ? item.batch_lot_no : '',
                yarnType: item.yarn_type ? item.yarn_type : '',
                count: item.yarncount ? item.yarncount.yarnCount_name : '',
                resa: item.yarn_realisation ? item.yarn_realisation : '',
                boxes: item.no_of_boxes ? item.no_of_boxes : '',
                boxId: item.box_id ? item.box_id : '',
                blend: blendValue,
                blendqty: blendqty,
                total: item.net_yarn_qty
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
            data: process.env.BASE_URL + "spinner-process.xlsx",
        });
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);

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
                attributes: ["id", "name"]
            },
            {
                model: Program,
                as: "program",
                attributes: ["id", "program_name"]
            },
            {
                model: YarnCount,
                as: "yarncount",
                attributes: ['id', 'yarnCount_name']
            }
        ];
        whereCondition.qty_stock = { [Op.gt]: 0 }
        //fetch data with pagination

        const gin = await SpinProcess.findAll({
            where: whereCondition,
            include: include,
            attributes: ['id', 'yarn_type', 'no_of_boxes', 'reel_lot_no', 'batch_lot_no', 'qty_stock', 'tot_box_user'],
            order: [
                [
                    'id', 'desc'
                ]
            ]
        });
        return res.sendSuccess(res, gin);

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

//create Spinner Sale
const createSpinnerSales = async (req: Request, res: Response) => {
    try {

        const data = {
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
            status: 'Pending for QR scanning'
        };

        const spinSales = await SpinSales.create(data);
        let uniqueFilename = `spin_sales_qrcode_${Date.now()}.png`;
        let da = encrypt(`Spinner,Sale,${spinSales.id}`);
        let aa = await generateOnlyQrCode(da, uniqueFilename);
        const gin = await SpinSales.update({ qr: uniqueFilename }, {
            where: {
                id: spinSales.id
            }
        });

        if (req.body.chooseYarn && req.body.chooseYarn.length > 0) {
            for await (let obj of req.body.chooseYarn) {
                let update = await SpinProcess.update({ qty_stock: obj.totalQty - obj.qtyUsed, tot_box_user: obj.totalBoxes - obj.totalBoxesUsed }, { where: { id: obj.id } });
                await SpinProcessYarnSelection.create({ spin_process_id: obj.id, sales_id: spinSales.id, no_of_box: obj.totalBoxesUsed, qty_used: obj.qtyUsed })
            }
        }

        if(spinSales){
            await send_spin_mail(spinSales.id);
        }

        res.sendSuccess(res, { spinSales });
    } catch (error: any) {
        console.error(error)
        return res.sendError(res, error.meessage);
    }
}

//fetch Spinner Sales with filters
const fetchSpinSalesPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { spinnerId, seasonId, programId, knitterId, weaverId, yarnType }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { order_ref: { [Op.iLike]: `%${searchTerm}%` } },
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
                { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { yarn_type: { [Op.iLike]: `%${searchTerm}%` } },
                { vehicle_no: { [Op.iLike]: `%${searchTerm}%` } },
                { '$weaver.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$knitter.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$yarncount.yarnCount_name$': { [Op.iLike]: `%${searchTerm}%` } },// Search season spinner name  
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
            const idArray: any[] = yarnType
                .split(",")
                .map((id: any) => id);
            whereCondition.yarn_type = { [Op.in]: idArray };
        }

        let include = [
            {
                model: Spinner,
                as: "spinner",
                attributes: ['id', 'name']
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
                model: YarnCount,
                as: 'yarncount',
                attributes: ['id', 'yarnCount_name']
            },
            {
                model: Weaver,
                as: "weaver",
                attributes: ['id', 'name']
            },
            {
                model: Knitter,
                as: "knitter",
                attributes: ['id', 'name']
            }
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
            return res.sendPaginationSuccess(res, rows, count);
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
            return res.sendSuccess(res, gin);
        }
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const exportSpinnerSale = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "spinner-sale.xlsx");

    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { spinnerId, seasonId, programId, knitterId, weaverId, yarnType }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { order_ref: { [Op.iLike]: `%${searchTerm}%` } },
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
                { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { yarn_type: { [Op.iLike]: `%${searchTerm}%` } },
                { '$weaver.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$knitter.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
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
            const idArray: any[] = yarnType
                .split(",")
                .map((id: any) => id);
            whereCondition.yarn_type = { [Op.in]: idArray };
        }
        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:R1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Sale';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Season",
            "Invoice No", "Spin Lot No", "Reel Lot No", "Yarn Type", "Yarn Count", "No of Boxes", "Buyer Name",
            "Box ID", "Blend", "Blend Qty", "Total weight (Kgs)", "Program", "Vehicle No",
            "Transcation via trader", "Agent Details"
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
            {
                model: YarnCount,
                as: "yarncount"
            }
        ];
        const gin = await SpinSales.findAll({
            where: whereCondition,
            include: include,
            order: [
                [
                    'id', 'desc'
                ]
            ]
        });
        // Append data to worksheet
        for await (const [index, item] of gin.entries()) {

            const rowValues = Object.values({
                index: index + 1,
                date: item.date ? item.date : '',
                season: item.season ? item.season.name : '',
                invoice: item.invoice_no ? item.invoice_no : '',
                lotNo: item.batch_lot_no ? item.batch_lot_no : '',
                reelLot: item.reel_lot_no ? item.reel_lot_no : '',
                yarnType: item.yarn_type ? item.yarn_type : '',
                count: item.yarncount ? item.yarncount.yarnCount_name : '',
                boxes: item.no_of_boxes ? item.no_of_boxes : '',
                buyer_id: item.kniter ? item.kniter.name : item.weaver ? item.weaver.name : item.processor_name,
                boxId: item.box_ids ? item.box_ids : '',
                blend: "",
                blendqty: '',
                total: item.total_qty,
                program: item.program ? item.program.program_name : '',
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
            return res.sendError(res, 'Need Sales Id');
        }
        let yarn_selections = await SpinProcessYarnSelection.findAll({
            attributes: ['id', 'spin_process_id', 'sales_id', 'no_of_box', 'qty_used'],
            where: {
                sales_id: req.body.id
            }
        })
        yarn_selections.forEach((yarn: any) => {
            SpinProcess.update(
                {
                    qty_stock: sequelize.literal(`qty_stock + ${yarn.qty_used}`),
                    tot_box_user: sequelize.literal(`tot_box_user - ${yarn.no_of_box}`)
                },
                {
                    where: {
                        id: yarn.spin_process_id
                    }
                }
            );
        });

        SpinSales.destroy({
            where: {
                id: req.body.id
            }
        });

        SpinProcessYarnSelection.destroy({
            where: {
                sales_id: req.body.id
            }
        });
        return res.sendSuccess(res, { message: 'Successfully deleted this process' });

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

//fetch Spinner transaction with filters
const fetchSpinSalesDashBoard = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { ginnerId, status, filter, programId, spinnerId }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { lot_no: { [Op.iLike]: `%${searchTerm}%` } }, // Search by 
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } }, // Search by
                { "$ginner.name$": { [Op.iLike]: `%${searchTerm}%` } }, // Search by
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by program
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type
            ];
        }
        if (status === 'Pending' || status === 'Sold') {
            whereCondition.buyer = spinnerId
            whereCondition.status = status === 'Pending' ? 'Pending for QR scanning' : 'Sold';
        }
        if (ginnerId) {
            const idArray: number[] = ginnerId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.ginner_id = { [Op.in]: idArray };
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

        let include = [
            {
                model: Ginner,
                as: "ginner",
                attributes: ['id', 'name'],
                include: [{
                    model: State,
                    as: "state"
                }]
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
                attributes: ['id', 'name', 'address'],
            }
        ];
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await GinSales.findAndCountAll({
                where: whereCondition,
                include: include,
                order: [
                    [
                        'id', 'asc'
                    ]
                ],
                offset: offset,
                limit: limit,
            });

            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const gin = await GinSales.findAll({
                where: whereCondition,
                include: include,
                order: [
                    [
                        'id', 'asc'
                    ]
                ]
            });
            return res.sendSuccess(res, gin);
        }
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

//update spinner transactions to accept and reject
const updateStatusSales = async (req: Request, res: Response) => {
    try {
        let update = []
        for (const obj of req.body.items) {
            const data = {
                status: obj.status,
                qty_stock: obj.qtyStock,
                accept_date: obj.status === 'Sold' ? new Date().toISOString() : null
            };
            let result = await GinSales.update(data, { where: { id: obj.id } });
            update.push(result);
        }
        res.sendSuccess(res, { update });
    } catch (error: any) {
        return res.sendError(res, error.meessage);
    }
}

//count the number of bales and total quantity stock With Program
const countCottonBaleWithProgram = async (req: Request, res: Response) => {
    try {
        let whereCondition: any = {}
        whereCondition.buyer = req.query.spinnerId;
        whereCondition.status = 'Sold';
        const gin = await GinSales.findAll({
            where: whereCondition,
            attributes: [
                [
                    Sequelize.fn("SUM", Sequelize.col("no_of_bales")),
                    "totalBales",
                ],
                [
                    Sequelize.fn(
                        "SUM",
                        Sequelize.col("qty_stock")
                    ),
                    "totalQuantity",
                ],
            ],
            include: [
                {
                    model: Program,
                    as: "program",
                    attributes: ["id", "program_name", "program_status"],
                }
            ],
            group: ["program.id"],
        });
        const spinSale = await SpinSales.findAll({
            where: {
                spinner_id: req.query.spinnerId,
            },
            attributes: [
                [
                    Sequelize.fn("SUM", Sequelize.col("total_qty")),
                    "totalQuantity",
                ],
                [
                    Sequelize.fn(
                        "SUM",
                        Sequelize.col("qty_stock")
                    ),
                    "totalQuantityStock",
                ],
            ],
            include: [
                {
                    model: Program,
                    as: "program",
                    attributes: ["id", "program_name", "program_status"],
                }
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
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { ginnerId, filter, programId, spinnerId }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { lot_no: { [Op.iLike]: `%${searchTerm}%` } }, // Search by 
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } }, // Search by
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by program
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type
            ];
        }
        whereCondition.buyer = spinnerId
        whereCondition.status = 'Sold';
        if (ginnerId) {
            const idArray: number[] = ginnerId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.ginner_id = { [Op.in]: idArray };
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
        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Season", "Ginner Name",
            "Invoice No", "Bale Lot", "No of Bales",
            "REEL Lot No", "Quantity", "Program",
            "Vehicle No"
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
            }
        ];
        const gin = await GinSales.findAll({
            where: whereCondition,
            include: include,
        });
        // Append data to worksheet
        for await (const [index, item] of gin.entries()) {
            const rowValues = Object.values({
                index: index + 1,
                date: item.date ? item.date : '',
                season: item.season ? item.season.name : '',
                ginner: item.ginner ? item.ginner.name : '',
                invoice: item.invoice_no ? item.invoice_no : '',
                lot_no: item.lot_no ? item.lot_no : '',
                no_of_bales: item.no_of_bales ? item.no_of_bales : '',
                reel_lot_no: item.reel_lot_no ? item.reel_lot_no : '',
                quantity: item.qty_stock ? item.qty_stock : '',
                program: item.program ? item.program.program_name : '',
                vehicle: item.vehicle_no ? item.vehicle_no : ''
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
            return res.sendError(res, 'Need Spinner Id');
        }

        let spinnerId = req.query.spinnerId;
        let spinner = await Spinner.findOne({ where: { id: spinnerId } });
        if (!spinner?.program_id) {
            return res.sendSuccess(res, []);
        }
        let data = await Program.findAll({
            where: {
                id: { [Op.in]: spinner.program_id }
            }
        });
        res.sendSuccess(res, data);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const getSalesInvoice = async (req: Request, res: Response) => {
    try {
        if (!req.query.salesId) {
            return res.sendError(res, 'Need Sales Id');
        }

        let salesId = req.query.salesId;
        let sales = await GinSales.findOne({
            where: { id: salesId }, include: [{
                model: Ginner,
                as: "ginner",
                include: [{
                    model: State,
                    as: "state"
                }]
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
                attributes: ['id', 'name', 'address'],
            }]
        });
        let data = await generateGinSalesHtml(sales.dataValues)
        return res.sendSuccess(res, { file: process.env.BASE_URL + 'sales_invoice.pdf' });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const getYarnCount = async (req: Request, res: Response) => {
    try {
        if (!req.query.spinnerId) {
            return res.sendError(res, 'Need Spinner Id');
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
                    id: { [Op.in]: idArray }
                }
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
    if (!spinnerId) {
        return res.sendError(res, 'Need spinner Id ');
    }
    let ress = await Spinner.findOne({ where: { id: spinnerId } });
    if (!ress) {
        return res.sendError(res, 'No Spinner Found ');
    }
    let result: any = await Promise.all([
        Knitter.findAll({
            attributes: ['id', 'name', [sequelize.literal("'kniter'"), 'type']],
            where: { brand: { [Op.overlap]: ress.dataValues.brand } }
        }),
        Weaver.findAll({
            attributes: ['id', 'name', [sequelize.literal("'weaver'"), 'type']],
            where: { brand: { [Op.overlap]: ress.dataValues.brand } }
        })
    ])
    res.sendSuccess(res, result.flat());
}

const getGinnerDashboard = async (req: Request, res: Response) => {
    let spinnerId = req.query.spinnerId;
    if (!spinnerId) {
        return res.sendError(res, 'Need Spinner Id ');
    }
    let whereCondition = {
        status: 'Sold',
        buyer: spinnerId
    }
    const ginner = await GinSales.findAll({
        include: [{
            model: Ginner,
            as: "ginner",
            attributes: []
        }],
        attributes: [
            [Sequelize.literal("ginner.id"), "id"],
            [Sequelize.literal('"ginner"."name"'), "name"],
        ],
        where: whereCondition,
        group: ['ginner_id', 'ginner.id']
    })
    res.sendSuccess(res, ginner);
}

const chooseLint = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const { spinnerId, ginnerId, programId, reelLotNo, invoiceNo, seasonId }: any = req.query;
    const whereCondition: any = {};
    try {
        if (!spinnerId) {
            return res.sendError(res, 'Spinner Id is required')
        }
        if (!programId) {
            return res.sendError(res, 'Program Id is required')
        }
        if (spinnerId) {
            whereCondition.buyer = spinnerId;
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

        if (ginnerId) {
            const idArray: number[] = ginnerId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.ginner_id = { [Op.in]: idArray };
        }

        if (reelLotNo) {
            const idArray: any[] = reelLotNo
                .split(",")
                .map((id: any) => id);
            whereCondition.reel_lot_no = { [Op.in]: idArray };
        }

        if (invoiceNo) {
            const idArray: any[] = invoiceNo
                .split(",")
                .map((id: any) => id);
            whereCondition.invoice_no = { [Op.in]: idArray };
        }

        whereCondition.status = 'Sold';
        whereCondition.qty_stock = { [Op.gt]: 0 }
        let include = [
            {
                model: Season,
                as: "season",
                attributes: ['id', 'name']
            }
        ];

        //fetch data with pagination
        let result = await GinSales.findAll({
            where: whereCondition,
            include: include,
            attributes: [
                [Sequelize.fn('SUM', Sequelize.col('qty_stock')), 'available_lint']
            ],
            group: ["season.id", "season_id"]
        });
        // console.log(result);
        let list = [];
        for await (let item of result) {
            let items = await GinSales.findAll({
                where: { ...whereCondition, season_id: item.dataValues.season.id },
                include: [
                    {
                        model: Ginner,
                        as: "ginner",
                        attributes: ['id', 'name']
                    },
                    {
                        model: Program,
                        as: "program",
                        attributes: ['id', 'program_name']
                    }
                ],
                attributes: ['id', 'date', 'total_qty', 'no_of_bales', 'choosen_bale', 'lot_no', 'press_no', 'reel_lot_no', 'qty_stock', 'invoice_no'],
                order: [['id', 'DESC']]
            });
            list.push({ ...item.dataValues, data: items });
        }
        return res.sendSuccess(res, list);

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const chooseYarn = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const { spinnerId, programId, reelLotNo, seasonId }: any = req.query;
    const whereCondition: any = {};
    try {
        if (!spinnerId) {
            return res.sendError(res, 'Spinner Id is required')
        }
        if (!programId) {
            return res.sendError(res, 'Program Id is required')
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
            const idArray: any[] = reelLotNo
                .split(",")
                .map((id: any) => id);
            whereCondition.reel_lot_no = { [Op.in]: idArray };
        }
        whereCondition.qty_stock = { [Op.gt]: 0 }
        let include = [
            {
                model: Season,
                as: "season",
                attributes: ['id', 'name']
            }
        ];

        //fetch data with pagination
        let result = await SpinProcess.findAll({
            where: whereCondition,
            include: include,
            attributes: [
                [Sequelize.fn('SUM', Sequelize.col('qty_stock')), 'available_yarn']
            ],
            group: ["season.id", "season_id"]
        });
        // console.log(result);
        let list = [];
        for await (let item of result) {
            let items = await SpinProcess.findAll({
                where: { ...whereCondition, season_id: item.dataValues.season.id },
                attributes: ['id', 'yarn_type', 'no_of_boxes', 'reel_lot_no', 'batch_lot_no', 'qty_stock', 'tot_box_user'],
                include: [
                    {
                        model: Program,
                        as: "program",
                        attributes: ['id', 'program_name']
                    },
                    {
                        model: YarnCount,
                        as: "yarncount",
                        attributes: ['id', 'yarnCount_name']
                    },
                    {
                        model: Spinner,
                        as: "spinner",
                        attributes: ['id', 'name']
                    }
                ],
                order: [['id', 'DESC']]
            });
            list.push({ ...item.dataValues, data: items });
        }
        return res.sendSuccess(res, list);

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const getInvoiceAndReelLotNo = async (req: Request, res: Response) => {
    const { programId, status, spinnerId }: any = req.query;
    const whereCondition: any = {};
    try {
        if (!spinnerId) {
            return res.sendError(res, 'Spinner Id is required')
        }
        if (!programId) {
            return res.sendError(res, 'Program Id is required')
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
        whereCondition.status = 'Sold';
        whereCondition.qty_stock = { [Op.gt]: 0 }
        const invoice = await GinSales.findAll({
            attributes: ['invoice_no'],
            where: whereCondition,
            group: ['invoice_no']
        });
        const reelLot = await GinSales.findAll({
            attributes: ['reel_lot_no'],
            where: { ...whereCondition, reel_lot_no: { [Op.not]: null } },
            group: ['reel_lot_no']
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
            return res.sendError(res, 'Spinner Id is required')
        }
        if (!programId) {
            return res.sendError(res, 'Program Id is required')
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
        whereCondition.reel_lot_no = { [Op.not]: null }
        whereCondition.qty_stock = { [Op.gt]: 0 }
        const reelLot = await SpinProcess.findAll({
            attributes: ['reel_lot_no'],
            where: whereCondition,
            group: ['reel_lot_no']
        });

        res.sendSuccess(res, reelLot);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

export {
    createSpinnerProcess,
    fetchSpinnerProcessPagination,
    exportSpinnerProcess,
    updateSpinnerProcess,
    createSpinnerSales,
    fetchSpinSalesPagination,
    exportSpinnerSale,
    fetchSpinSalesDashBoard,
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
    getGinnerDashboard,
    chooseLint,
    getSalesInvoice,
    chooseYarn,
    getInvoiceAndReelLotNo,
    getYarnReelLotNo
}