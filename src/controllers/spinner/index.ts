import { Request, Response } from "express";

import { Sequelize, Op, where } from "sequelize";
import { generateOnlyQrCode } from "../../provider/qrcode";
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

//create Spinner Process
const createSpinnerProcess = async (req: Request, res: Response) => {
    try {
        let abc = await yarnId(req.body.spinnerId, req.body.date);
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
            no_of_boxes: req.body.noOfBox,
            batch_lot_no: req.body.batchLotNo,
            reel_lot_no: abc,
            box_id: req.body.boxId,
            process_complete: req.body.processComplete,
            dyeing_required: req.body.dyeingRequired,
            qty_stock: req.body.netYarnQty,
            dyeing_id: dyeing ? dyeing.id : null,
            status: 'Pending'
        };
        const spin = await SpinProcess.create(data);
        let uniqueFilename = `spin_procees_qrcode_${Date.now()}.png`;
        let aa = await generateOnlyQrCode(`Test`, uniqueFilename);
        const gin = await SpinProcess.update({ qr: uniqueFilename }, {
            where: {
                id: spin.id
            }
        });
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

    let prcs_date = new Date(date).toLocaleDateString().replace(/\//g, '');
    return a[0].idprefix + prcs_date + '/' + '21'
}

//fetch Spinner Process with filters
const fetchSpinnerProcessPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { spinnerId, seasonId, programId } = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { name: { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type
            ];
        }
        if (spinnerId) {
            whereCondition.spinner_id = spinnerId;
        }
        if (seasonId) {
            whereCondition.season_id = seasonId;
        }
        if (programId) {
            whereCondition.program_id = programId;
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
        if (req.query.pagination === "true") {
            const { count, rows } = await SpinProcess.findAndCountAll({
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
            const gin = await SpinProcess.findAll({
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

    try {
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
            where: { spinner_id: req.query.spinnerId },
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

//create Spinner Sale
const createSpinnerSales = async (req: Request, res: Response) => {
    try {
        let uniqueFilename = `spin_sales_qrcode_${Date.now()}.png`;
        let aa = await generateOnlyQrCode(`Test`, uniqueFilename);
        const data = {
            spinner_id: req.body.spinnerId,
            program_id: req.body.programId,
            season_id: req.body.seasonId,
            date: req.body.date,
            order_ref: req.body.orderRef,
            buyer_type: req.body.buyerType,
            buyer_id: req.body.buyerId,
            processor_name: req.body.processorName,
            processor_address: req.body.processorAddress,
            total_qty: req.body.totalQty,
            transaction_via_trader: req.body.transactionViaTrader,
            transaction_agent: req.body.transactionAgent,
            no_of_boxes: req.body.noOfBoxes,
            batch_lot_no: req.body.batchLotNo,
            reel_lot_no: req.body.reelLotNno,
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
            status: 'To be Submitted',
            qr: uniqueFilename
        };
        const spinSales = await SpinSales.create(data);
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
    const { spinnerId, seasonId, programId } = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type
            ];
        }
        if (spinnerId) {
            whereCondition.spinner_id = spinnerId;
        }
        if (seasonId) {
            whereCondition.season_id = seasonId;
        }
        if (programId) {
            whereCondition.program_id = programId;
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
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await SpinSales.findAndCountAll({
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
            const gin = await SpinSales.findAll({
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

const exportSpinnerSale = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "spinner-sale.xlsx");

    try {
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
            }
        ];
        const gin = await SpinSales.findAll({
            where: { spinner_id: req.query.spinnerId },
            include: include
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
                count: item.yarn_count ? item.yarn_count : '',
                buyer_id: item.buyer_id ? item.buyer_id : '',
                boxes: item.no_of_boxes ? item.no_of_boxes : '',
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


//fetch Spinner transaction with filters
const fetchSpinSalesDashBoard = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { ginnerId, status, programId, spinnerId }: any = req.query;
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
        if (status === 'Pending' || status === 'Sold') {
            whereCondition.buyer = spinnerId
            whereCondition.status = status === 'Pending' ? 'Pending for QR scanning' : 'Sold';
        }
        if (ginnerId) {
            const idArray: number[] = ginnerId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.ginner_id = { [Op.contains]: idArray };
        }
        if (programId) {
            const idArray: number[] = programId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.program_id = { [Op.contains]: idArray };
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
        const data = {
            status: req.body.status,
            qty_stock: req.body.qtyStock
        };
        const ginSales = await GinSales.update(data, { where: { id: req.body.id } });

        res.sendSuccess(res, { ginSales });
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
        res.sendSuccess(res, gin);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const exportSpinnerTransaction = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "Spinner_transaction_list.xlsx");

    try {
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
            where: { buyer: req.query.spinnerId, status: 'Sold' },
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
    exportSpinnerTransaction
}