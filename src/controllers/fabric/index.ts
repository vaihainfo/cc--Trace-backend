import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import sequelize from "../../util/dbConn";
import * as ExcelJS from "exceljs";
import * as fs from "fs";
import * as path from "path";
import WeaverSales from "../../models/weaver-sales.model";
import KnitSales from "../../models/knit-sales.model";
import Program from "../../models/program.model";
import FabricType from "../../models/fabric-type.model";
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

/** 
 * Dying Dashboard for fabric
*/

// Get Sold Transaction for Dying Dashboard
const fetchDyingTransactions = async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        let fabricId = req.query.fabricId || ''

        if (!fabricId) {
            return res.sendError(res, 'Need Fabric Id');
        }

        let data: any = await sequelize.query(
            `SELECT "weaver_sales"."id", "weaver_sales"."weaver_id", "weaver_sales"."season_id", "weaver_sales"."date", "weaver_sales"."program_id", "weaver_sales"."order_ref", "weaver_sales"."buyer_id",  "weaver_sales"."transaction_via_trader", "weaver_sales"."transaction_agent", "weaver_sales"."fabric_type", "weaver_sales"."fabric_length", "weaver_sales"."fabric_gsm", "weaver_sales"."fabric_weight", "weaver_sales"."batch_lot_no", "weaver_sales"."job_details_garment","weaver_sales"."invoice_no", "weaver_sales"."vehicle_no","weaver_sales"."qty_stock", "weaver_sales"."qr", "program"."id" AS "program-id", "program"."program_name" AS "program_name", "fabric"."id" AS 
            "fabric_id", "fabric"."fabricType_name" AS "fabricType_name", "weaver"."id" AS "weaver-id", "weaver"."name" AS 
            "weaver_name" FROM "weaver_sales" AS "weaver_sales" LEFT OUTER JOIN "programs" AS "program" ON "weaver_sales"."program_id" = "program"."id" LEFT OUTER JOIN "fabric_types" AS "fabric" ON "weaver_sales"."fabric_type" = "fabric"."id" LEFT OUTER JOIN "weavers" AS "weaver" ON "weaver_sales"."weaver_id" = "weaver"."id" WHERE "weaver_sales"."buyer_type" = 'Dying' AND "weaver_sales"."status" = 'Sold' AND "weaver_sales"."fabric_id" = '${fabricId}'
             UNION ALL 
             SELECT "knit_sales"."id", "knit_sales"."knitter_id", "knit_sales"."season_id", "knit_sales"."date", "knit_sales"."program_id", "knit_sales"."order_ref", "knit_sales"."buyer_id", "knit_sales"."transaction_via_trader", "knit_sales"."transaction_agent", "knit_sales"."fabric_type", "knit_sales"."fabric_length", "knit_sales"."fabric_gsm", "knit_sales"."fabric_weight", "knit_sales"."batch_lot_no", "knit_sales"."job_details_garment", "knit_sales"."invoice_no", "knit_sales"."vehicle_no", "knit_sales"."qty_stock", "knit_sales"."qr", "program"."id" AS "program-id", "program"."program_name" AS "program_name", "fabric"."id" AS "fabric_id", "fabric"."fabricType_name" AS "fabricType_name", "knitter"."id" AS "knitter-id", "knitter"."name" AS "knitter_name" FROM "knit_sales" AS "knit_sales" 
             LEFT OUTER JOIN "programs" AS "program" ON "knit_sales"."program_id" = "program"."id" LEFT OUTER JOIN "fabric_types" AS "fabric" ON "knit_sales"."fabric_type" = "fabric"."id" LEFT OUTER JOIN "knitters" AS "knitter" ON "knit_sales"."knitter_id" = "knitter"."id" WHERE  "knit_sales"."buyer_type" = 'Dying' AND "knit_sales"."status" = 'Sold' AND "knit_sales"."fabric_id" = '${fabricId}'
             OFFSET ${offset} 
             LIMIT ${limit}`,
        )
        return res.sendPaginationSuccess(res, data[1].rows, data[1].rowCount);
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }
}

// Get Pending Transaction for Dying Dashboard
const fetchDyingTransactionsAll = async (req: Request, res: Response) => {
    try {
        let { fabricId }: any = req.query;
        if (!fabricId) {
            return res.sendError(res, 'Need Fabric Id');
        }

        let include = [
            {
                model: Program,
                as: 'program',
            },
            {
                model: FabricType,
                as: 'fabric',
            }
        ]
        let result = await Promise.all([
            WeaverSales.findAll({
                where: { status: 'Pending for QR scanning', buyer_type: 'Dying', fabric_id: fabricId },
                include: [...include, { model: Weaver, as: 'weaver', attributes: ['id', 'name'] }]
            }),
            KnitSales.findAll({
                where: { status: 'Pending for QR scanning', buyer_type: 'Dying', fabric_id: fabricId },
                include: [...include, { model: Knitter, as: 'knitter', attributes: ['id', 'name'] }]
            })
        ])
        let abc = result.flat()
        return res.sendSuccess(res, abc);
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }
}

//Updating the status of the transaction
const updateTransactionStatus = async (req: Request, res: Response) => {
    try {

        let trans: any = []
        for await (let obj of req.body.items) {
            const data: any = {
                status: obj.status,
                accept_date: obj.status === 'Sold' ? new Date().toISOString() : null
            };
            if (obj.knitter_id) {
                const transaction = await KnitSales.update(data, {
                    where: {
                        id: obj.id,
                    },
                });
                trans.push(transaction)
            } else {
                const transaction = await WeaverSales.update(data, {
                    where: {
                        id: obj.id,
                    },
                });
                trans.push(transaction)
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
            return res.sendError(res, 'Need Fabric Id');
        }


        let result = await Fabric.findOne({ where: { id: fabricId } });
        if (!result) {
            return res.sendError(res, 'Garment not found');
        }
        let data = await Program.findAll({
            where: {
                id: result.program_id
            }
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
            order_refernce: req.body.orderRef,
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
            dying_details: req.body.dyingDetails,
            dying_color: req.body.dyingColor,
            invoice_no: req.body.invoiceNo,
            bill_of_lading: req.body.billOfLadding,
            transport_info: req.body.transportInfo,
            qty_stock: req.body.totalYarnQty,
            status: 'Pending'
        };
        const sales = await DyingSales.create(data);
        if (req.body.chooseFabric && req.body.chooseFabric.length > 0) {
            for await (let obj of req.body.chooseFabric) {
                if (obj.processor === 'knitter') {
                    let update = await KnitSales.update({ qty_stock: obj.totalQty - obj.qtyUsed }, { where: { id: obj.id } });
                } else {
                    let update = await WeaverSales.update({ qty_stock: obj.totalQty - obj.qtyUsed }, { where: { id: obj.id } });
                }
                await DyingFabricSelection.create({
                    process_id: obj.id, process_type: obj.processor, sales_id: sales.id, qty_used: obj.qtyUsed
                })
            }
        }
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

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
                { order_refernce: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$buyer.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$abuyer.name$': { [Op.iLike]: `%${searchTerm}%` } }
            ];
        }
        whereCondition.dying_id = fabricId
        let include: any = [
            {
                model: Program,
                as: 'program',
            },
            {
                model: Season,
                as: 'season',
            },
            {
                model: Fabric,
                as: 'dying_fabric',
            },
            {
                model: Fabric,
                as: 'abuyer',
            },
            {
                model: Garment,
                as: 'buyer',
            }
        ];
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await DyingSales.findAndCountAll({
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
            const gin = await DyingSales.findAll({
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

//export Dying process data
const exportDyingProcess = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "export-dying-process.xlsx");

    try {
        const whereCondition: any = {};
        const searchTerm = req.query.search || "";
        if (searchTerm) {
            whereCondition[Op.or] = [
                { order_refernce: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$buyer.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$abuyer.name$': { [Op.iLike]: `%${searchTerm}%` } }
            ];
        }
        whereCondition.dying_id = req.query.fabricId
        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:K1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Process/Sale';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Fabric Processor Type", "Sold To",
            "Invoice No", "	Batch/Lot No",
            "Dyed Fabric Quantity", "Length in Mts", "GSM", "Fabric Net Weight (Kgs)", "Program"
        ]);
        headerRow.font = { bold: true };
        let include: any = [
            {
                model: Program,
                as: 'program',
            },
            {
                model: Season,
                as: 'season',
            },
            {
                model: Fabric,
                as: 'dying_fabric',
            },
            {
                model: Fabric,
                as: 'abuyer',
            },
            {
                model: Garment,
                as: 'buyer',
            }
        ];
        const sales = await DyingSales.findAll({
            where: whereCondition,
            include: include
        });
        // Append data to worksheet
        for await (const [index, item] of sales.entries()) {

            const rowValues = Object.values({
                index: index + 1,
                date: item.date ? item.date : '',
                buyer_type: item.buyer_type ?? '',
                buyer: item.buyer ? item.buyer.name : item.abuyer ? item.abuyer.name : item.processor_name,
                invoice: item.invoice_no ? item.invoice_no : '',
                order: item.batch_lot_no ? item.batch_lot_no : '',
                qty: item.total_fabric_quantity ? item.total_fabric_quantity : '',
                length: item.fabric_length ? item.fabric_length : '',
                gsm: item.gsm ? item.gsm : '',
                fabric_net_weight: item.fabric_net_weight ? item.fabric_net_weight : '',
                program: item.program ? item.program.program_name : ''
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
        let { fabricId }: any = req.query;
        if (!fabricId) {
            return res.sendError(res, 'Need Fabric Id');
        }

        let include = [
            {
                model: Program,
                as: 'program',
            },
            {
                model: FabricType,
                as: 'fabric',
            }
        ]
        let result = await Promise.all([
            WeaverSales.findAll({
                where: { status: 'Sold', buyer_type: 'Dying', fabric_id: fabricId, qty_stock: { [Op.gt]: 0 } },
                include: [...include, { model: Weaver, as: 'weaver', attributes: ['id', 'name'] }]
            }),
            KnitSales.findAll({
                where: { status: 'Sold', buyer_type: 'Dying', fabric_id: fabricId, qty_stock: { [Op.gt]: 0 } },
                include: [...include, { model: Knitter, as: 'knitter', attributes: ['id', 'name'] }]
            })
        ])
        let abc = result.flat()
        return res.sendSuccess(res, abc);
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }
}
/** 
 * Washing Dashboard for fabric
*/

// Get Sold Transaction for Washing Dashboard
const fetchWashingTransactions = async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        let fabricId = req.query.fabricId || ''

        if (!fabricId) {
            return res.sendError(res, 'Need Fabric Id');
        }

        let data: any = await sequelize.query(
            `SELECT "weaver_sales"."id", "weaver_sales"."weaver_id", "weaver_sales"."season_id", "weaver_sales"."date", "weaver_sales"."program_id", "weaver_sales"."order_ref", "weaver_sales"."buyer_id",  "weaver_sales"."transaction_via_trader", "weaver_sales"."transaction_agent", "weaver_sales"."fabric_type", "weaver_sales"."fabric_length", "weaver_sales"."fabric_gsm", "weaver_sales"."fabric_weight", "weaver_sales"."batch_lot_no", "weaver_sales"."job_details_garment","weaver_sales"."invoice_no", "weaver_sales"."vehicle_no","weaver_sales"."qty_stock", "weaver_sales"."qr", "program"."id" AS "program-id", "program"."program_name" AS "program_name", "fabric"."id" AS 
            "fabric_id", "fabric"."fabricType_name" AS "fabricType_name", "weaver"."id" AS "weaver-id", "weaver"."name" AS 
            "weaver_name" FROM "weaver_sales" AS "weaver_sales" LEFT OUTER JOIN "programs" AS "program" ON "weaver_sales"."program_id" = "program"."id" LEFT OUTER JOIN "fabric_types" AS "fabric" ON "weaver_sales"."fabric_type" = "fabric"."id" LEFT OUTER JOIN "weavers" AS "weaver" ON "weaver_sales"."weaver_id" = "weaver"."id" WHERE "weaver_sales"."buyer_type" = 'Washing' AND "weaver_sales"."status" = 'Sold' AND "weaver_sales"."fabric_id" = '${fabricId}'
             UNION ALL 
             SELECT "knit_sales"."id", "knit_sales"."knitter_id", "knit_sales"."season_id", "knit_sales"."date", "knit_sales"."program_id", "knit_sales"."order_ref", "knit_sales"."buyer_id", "knit_sales"."transaction_via_trader", "knit_sales"."transaction_agent", "knit_sales"."fabric_type", "knit_sales"."fabric_length", "knit_sales"."fabric_gsm", "knit_sales"."fabric_weight", "knit_sales"."batch_lot_no", "knit_sales"."job_details_garment", "knit_sales"."invoice_no", "knit_sales"."vehicle_no", "knit_sales"."qty_stock", "knit_sales"."qr", "program"."id" AS "program-id", "program"."program_name" AS "program_name", "fabric"."id" AS "fabric_id", "fabric"."fabricType_name" AS "fabricType_name", "knitter"."id" AS "knitter-id", "knitter"."name" AS "knitter_name" FROM "knit_sales" AS "knit_sales" 
             LEFT OUTER JOIN "programs" AS "program" ON "knit_sales"."program_id" = "program"."id" LEFT OUTER JOIN "fabric_types" AS "fabric" ON "knit_sales"."fabric_type" = "fabric"."id" LEFT OUTER JOIN "knitters" AS "knitter" ON "knit_sales"."knitter_id" = "knitter"."id" WHERE  "knit_sales"."buyer_type" = 'Washing' AND "knit_sales"."status" = 'Sold' AND "knit_sales"."fabric_id" = '${fabricId}'
             OFFSET ${offset} 
             LIMIT ${limit}`,
        )
        return res.sendPaginationSuccess(res, data[1].rows, data[1].rowCount);
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }
}

// Get Pending Transaction for Washing Dashboard
const fetchWashingTransactionsAll = async (req: Request, res: Response) => {
    try {
        let { fabricId }: any = req.query;
        if (!fabricId) {
            return res.sendError(res, 'Need Fabric Id');
        }

        let include = [
            {
                model: Program,
                as: 'program'
            },

        ]
        let result = await Promise.all([
            WeaverSales.findAll({
                where: { status: 'Pending for QR scanning', buyer_type: 'Washing', fabric_id: fabricId },
                include: [...include, { model: Weaver, as: 'weaver', attributes: ['id', 'name'] }, { model: FabricType, as: 'fabric' }]
            }),
            KnitSales.findAll({
                where: { status: 'Pending for QR scanning', buyer_type: 'Washing', fabric_id: fabricId },
                include: [...include, { model: Knitter, as: 'knitter', attributes: ['id', 'name'] }, { model: FabricType, as: 'fabric' }]
            }),
            DyingSales.findAll({
                where: { status: 'Pending', buyer_type: 'Washing', fabric_id: fabricId },
                include: [...include, { model: Fabric, as: 'abuyer', attributes: ['id', 'name'] },
                { model: Fabric, as: 'dying_fabric', attributes: ['id', 'name'] },]
            })
        ])
        let abc = result.flat()
        return res.sendSuccess(res, abc);
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }
}

//Updating the status of the transaction
const updateWashingTransactionStatus = async (req: Request, res: Response) => {
    try {

        let trans: any = []
        for await (let obj of req.body.items) {
            const data: any = {
                status: obj.status,
                accept_date: obj.status === 'Sold' ? new Date().toISOString() : null
            };
            if (obj.knitter_id) {
                const transaction = await KnitSales.update(data, {
                    where: {
                        id: obj.id,
                    },
                });
                trans.push(transaction)
            } else if (obj.weaver_id) {
                const transaction = await WeaverSales.update(data, {
                    where: {
                        id: obj.id,
                    },
                });
                trans.push(transaction)
            } else {
                const transaction = await DyingSales.update(data, {
                    where: {
                        id: obj.id,
                    },
                });
                trans.push(transaction)
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
        const data = {
            washing_id: req.body.washingFabricId,
            program_id: req.body.programId,
            season_id: req.body.seasonId,
            date: req.body.date,
            order_refernce: req.body.orderRef,
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
            wash_type: req.body.wash_type,
            weight_gain: req.body.weightGain,
            weight_loss: req.body.weightLoss,
            washing_details: req.body.washingDetails,
            invoice_no: req.body.invoiceNo,
            bill_of_lading: req.body.billOfLadding,
            transport_info: req.body.transportInfo,
            qty_stock: req.body.totalFabricQuantity,
            status: 'Pending'
        };
        const sales = await WashingSales.create(data);
        // if (req.body.chooseFabric && req.body.chooseFabric.length > 0) {
        //     for await (let obj of req.body.chooseFabric) {
        //         if (obj.processor === 'knitter') {
        //             let update = await KnitSales.update({ qty_stock: obj.totalQty - obj.qtyUsed }, { where: { id: obj.id } });
        //         } else {
        //             let update = await WeaverSales.update({ qty_stock: obj.totalQty - obj.qtyUsed }, { where: { id: obj.id } });
        //         }
        //         await DyingFabricSelection.create({
        //             process_id: obj.id, process_type: obj.processor, sales_id: sales.id, qty_used: obj.qtyUsed
        //         })
        //     }
        // }
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}
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
                { order_refernce: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$buyer.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$abuyer.name$': { [Op.iLike]: `%${searchTerm}%` } }
            ];
        }
        whereCondition.washing_id = fabricId
        let include: any = [
            {
                model: Program,
                as: 'program',
            },
            {
                model: Season,
                as: 'season',
            },
            {
                model: Fabric,
                as: 'washing',
            },
            {
                model: Fabric,
                as: 'abuyer',
            },
            {
                model: Garment,
                as: 'buyer',
            }
        ];
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await WashingSales.findAndCountAll({
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
            const gin = await WashingSales.findAll({
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

//choosing the washing fabric data
const chooseWashingFabric = async (req: Request, res: Response) => {
    try {
        let { fabricId }: any = req.query;
        if (!fabricId) {
            return res.sendError(res, 'Need Fabric Id');
        }

        let include = [
            {
                model: Program,
                as: 'program',
            },

        ]
        let whereCondition: any = { status: 'Sold', buyer_type: 'Washing', fabric_id: fabricId, qty_stock: { [Op.gt]: 0 } }
        let result = await Promise.all([
            WeaverSales.findAll({
                where: whereCondition,
                include: [...include, { model: Weaver, as: 'weaver', attributes: ['id', 'name'] }, { model: FabricType, as: 'fabric' }]
            }),
            KnitSales.findAll({
                where: whereCondition,
                include: [...include, { model: Knitter, as: 'knitter', attributes: ['id', 'name'] }, { model: FabricType, as: 'fabric' }]
            }),
            DyingSales.findAll({
                where: whereCondition,
                include: [...include, { model: Fabric, as: 'abuyer', attributes: ['id', 'name'] },
                { model: Fabric, as: 'dying_fabric', attributes: ['id', 'name'] },]
            })
        ])
        let abc = result.flat()
        return res.sendSuccess(res, abc);
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }
}

//Export the washing sales data
const exportWashingProcess = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "export-washing-process.xlsx");

    try {
        const whereCondition: any = {};
        const searchTerm = req.query.search || "";
        if (searchTerm) {
            whereCondition[Op.or] = [
                { order_refernce: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$buyer.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$abuyer.name$': { [Op.iLike]: `%${searchTerm}%` } }
            ];
        }
        whereCondition.washing_id = req.query.fabricId
        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:K1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Process/Sale';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Fabric Processor Type", "Sold To",
            "Invoice No", "	Batch/Lot No",
            "Washed Fabric Quantity", "Length in Mts", "GSM", "Fabric Net Weight (Kgs)", "Program"
        ]);
        headerRow.font = { bold: true };
        let include: any = [
            {
                model: Program,
                as: 'program',
            },
            {
                model: Season,
                as: 'season',
            },
            {
                model: Fabric,
                as: 'washing',
            },
            {
                model: Fabric,
                as: 'abuyer',
            },
            {
                model: Garment,
                as: 'buyer',
            }
        ];
        const sales = await WashingSales.findAll({
            where: whereCondition,
            include: include
        });
        // Append data to worksheet
        for await (const [index, item] of sales.entries()) {

            const rowValues = Object.values({
                index: index + 1,
                date: item.date ? item.date : '',
                buyer_type: item.buyer_type ?? '',
                buyer: item.buyer ? item.buyer.name : item.abuyer ? item.abuyer.name : item.processor_name,
                invoice: item.invoice_no ? item.invoice_no : '',
                order: item.batch_lot_no ? item.batch_lot_no : '',
                qty: item.total_fabric_quantity ? item.total_fabric_quantity : '',
                length: item.fabric_length ? item.fabric_length : '',
                gsm: item.gsm ? item.gsm : '',
                fabric_net_weight: item.fabric_net_weight ? item.fabric_net_weight : '',
                program: item.program ? item.program.program_name : ''
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

/** 
 * Printing Dashboard for fabric
*/

// Get Pending Transaction for Printing Transaction
const fetchPrintingTransactions = async (req: Request, res: Response) => {
    try {
        let fabricId = req.query.fabricId || ''

        if (!fabricId) {
            return res.sendError(res, 'Need Fabric Id');
        }
        let include = [
            {
                model: Program,
                as: 'program'
            },

        ]
        let data = await WashingSales.findAll({
            where: { status: 'Pending', buyer_type: 'Printing', fabric_id: fabricId },
            include: [...include, { model: Fabric, as: 'washing', attributes: ['id', 'name'] }]
        })

        res.sendSuccess(res, data)
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }
}

// Get Sold Transaction for Printing Transaction
const fetchPrintingTransactionSold = async (req: Request, res: Response) => {
    try {
        let fabricId = req.query.fabricId || ''
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        if (!fabricId) {
            return res.sendError(res, 'Need Fabric Id');
        }
        let include = [
            {
                model: Program,
                as: 'program'
            },

        ]
        let data = await WashingSales.findAndCountAll({
            where: { status: 'Sold', buyer_type: 'Printing', fabric_id: fabricId },
            include: [...include, { model: Fabric, as: 'washing', attributes: ['id', 'name'] }],
            offset: offset,
            limit: limit
        })

        res.sendSuccess(res, data)
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }
}

// Update the status of the transaction for printing dashboard
const updatePrintingTransactionStatus = async (req: Request, res: Response) => {
    try {

        let trans: any = []
        for await (let obj of req.body.items) {
            const data: any = {
                status: obj.status,
                accept_date: obj.status === 'Sold' ? new Date().toISOString() : null
            };

            const transaction = await WashingSales.update(data, {
                where: {
                    id: obj.id,
                },
            });
            trans.push(transaction)
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
        const data = {
            printing_id: req.body.printingFabricId,
            program_id: req.body.programId,
            season_id: req.body.seasonId,
            date: req.body.date,
            order_refernce: req.body.orderRef,
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
            status: 'Pending'
        };
        const sales = await PrintingSales.create(data);
        if (req.body.chooseFabric && req.body.chooseFabric.length > 0) {
            for await (let obj of req.body.chooseFabric) {
                let update = await WashingSales.update({ qty_stock: obj.totalQty - obj.qtyUsed }, { where: { id: obj.id } });
                await PrintingFabricSelection.create({
                    process_id: obj.id, process_type: 'washing_sales', sales_id: sales.id, qty_used: obj.qtyUsed
                })
            }
        }
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

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
                { order_refernce: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$buyer.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$abuyer.name$': { [Op.iLike]: `%${searchTerm}%` } }
            ];
        }
        whereCondition.printing_id = fabricId
        let include: any = [
            {
                model: Program,
                as: 'program',
            },
            {
                model: Season,
                as: 'season',
            },
            {
                model: Fabric,
                as: 'printing',
            },
            {
                model: Fabric,
                as: 'abuyer',
            },
            {
                model: Garment,
                as: 'buyer',
            }
        ];
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await PrintingSales.findAndCountAll({
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
            const gin = await PrintingSales.findAll({
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

//choosing the printing fabric data
const choosePrintingFabric = async (req: Request, res: Response) => {
    try {
        let { fabricId }: any = req.query;
        if (!fabricId) {
            return res.sendError(res, 'Need Fabric Id');
        }

        let include = [
            {
                model: Program,
                as: 'program',
            },

        ]
        let whereCondition: any = { status: 'Sold', buyer_type: 'Washing', fabric_id: fabricId, qty_stock: { [Op.gt]: 0 } }
        let result = await WashingSales.findAndCountAll({
            where: { status: 'Sold', buyer_type: 'Printing', fabric_id: fabricId },
            include: [...include, { model: Fabric, as: 'washing', attributes: ['id', 'name'] }],
        })
        return res.sendSuccess(res, result);
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }
}
//export Printing process data
const exportPrintingProcess = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "export-printing-process.xlsx");

    try {
        const whereCondition: any = {};
        const searchTerm = req.query.search || "";
        if (searchTerm) {
            whereCondition[Op.or] = [
                { order_refernce: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$buyer.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$abuyer.name$': { [Op.iLike]: `%${searchTerm}%` } }
            ];
        }
        whereCondition.washing_id = req.query.fabricId
        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:K1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Process/Sale';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Fabric Processor Type", "Sold To",
            "Invoice No", "	Batch/Lot No",
            "Printed Fabric Quantity", "Length in Mts", "GSM", "Fabric Net Weight (Kgs)", "Program"
        ]);
        headerRow.font = { bold: true };
        let include: any = [
            {
                model: Program,
                as: 'program',
            },
            {
                model: Season,
                as: 'season',
            },
            {
                model: Fabric,
                as: 'washing',
            },
            {
                model: Fabric,
                as: 'abuyer',
            },
            {
                model: Garment,
                as: 'buyer',
            }
        ];
        const sales = await WashingSales.findAll({
            where: whereCondition,
            include: include
        });
        // Append data to worksheet
        for await (const [index, item] of sales.entries()) {

            const rowValues = Object.values({
                index: index + 1,
                date: item.date ? item.date : '',
                buyer_type: item.buyer_type ?? '',
                buyer: item.buyer ? item.buyer.name : item.abuyer ? item.abuyer.name : item.processor_name,
                invoice: item.invoice_no ? item.invoice_no : '',
                order: item.batch_lot_no ? item.batch_lot_no : '',
                qty: item.total_fabric_quantity ? item.total_fabric_quantity : '',
                length: item.fabric_length ? item.fabric_length : '',
                gsm: item.gsm ? item.gsm : '',
                fabric_net_weight: item.fabric_net_weight ? item.fabric_net_weight : '',
                program: item.program ? item.program.program_name : ''
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



/** 
 * Compacting Dashboard for fabric
*/

// Get Pending Transaction for Compacting Transaction
const fetchCompactingTransactions = async (req: Request, res: Response) => {
    try {
        let fabricId = req.query.fabricId || ''

        if (!fabricId) {
            return res.sendError(res, 'Need Fabric Id');
        }
        let include = [
            {
                model: Program,
                as: 'program'
            },

        ]

        let data = await Promise.all([
            WashingSales.findAll({
                where: { status: 'Pending', buyer_type: 'Compacting', fabric_id: fabricId },
                include: [...include, { model: Fabric, as: 'washing', attributes: ['id', 'name'] }]
            }),
            PrintingSales.findAll({
                where: { status: 'Pending', buyer_type: 'Compacting', fabric_id: fabricId },
                include: [...include, { model: Fabric, as: 'printing', attributes: ['id', 'name'] }]
            }),
            DyingSales.findAll({
                where: { status: 'Pending', buyer_type: 'Compacting', fabric_id: fabricId },
                include: [...include, { model: Fabric, as: 'dying_fabric', attributes: ['id', 'name'] }]
            })
        ])
        res.sendSuccess(res, data.flat())
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }
}

// Get Sold Transaction for Compacting Transaction
const fetchCompactingTransactionSold = async (req: Request, res: Response) => {
    try {
        let fabricId = req.query.fabricId || ''
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        if (!fabricId) {
            return res.sendError(res, 'Need Fabric Id');
        }
        let include = [
            {
                model: Program,
                as: 'program'
            },

        ]
        let data = await Promise.all([
            WashingSales.findAll({
                where: { status: 'Sold', buyer_type: 'Compacting', fabric_id: fabricId },
                include: [...include, { model: Fabric, as: 'washing', attributes: ['id', 'name'] }]
            }),
            PrintingSales.findAll({
                where: { status: 'Sold', buyer_type: 'Compacting', fabric_id: fabricId },
                include: [...include, { model: Fabric, as: 'printing', attributes: ['id', 'name'] }]
            }),
            DyingSales.findAll({
                where: { status: 'Sold', buyer_type: 'Compacting', fabric_id: fabricId },
                include: [...include, { model: Fabric, as: 'dying_fabric', attributes: ['id', 'name'] }]
            })
        ])

        res.sendSuccess(res, data.flat())
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }
}

// // Update the status of the transaction for printing dashboard
const updateCompactingTransactionStatus = async (req: Request, res: Response) => {
    try {

        let trans: any = []
        for await (let obj of req.body.items) {
            const data: any = {
                status: obj.status,
                accept_date: obj.status === 'Sold' ? new Date().toISOString() : null
            };
            if (obj.type === "Printing") {
                const transaction = await PrintingSales.update(data, {
                    where: {
                        id: obj.id,
                    },
                });
                trans.push(transaction)
            } else if (obj.type === 'Washing') {
                const transaction = await WashingSales.update(data, {
                    where: {
                        id: obj.id,
                    },
                });
                trans.push(transaction)
            } else if (obj.type === 'Dying') {
                const transaction = await DyingSales.update(data, {
                    where: {
                        id: obj.id,
                    },
                });
                trans.push(transaction)
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
        const data = {
            compacting_id: req.body.printingFabricId,
            program_id: req.body.programId,
            season_id: req.body.seasonId,
            date: req.body.date,
            order_refernce: req.body.orderRef,
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
            status: 'Pending'
        };
        const sales = await CompactingSales.create(data);
        if (req.body.chooseFabric && req.body.chooseFabric.length > 0) {
            for await (let obj of req.body.chooseFabric) {
                let dataa = { qty_stock: obj.totalQty - obj.qtyUsed }
                if (obj.type === "Printing") {
                    const transaction = await PrintingSales.update(dataa, {
                        where: {
                            id: obj.id,
                        },
                    });
                } else if (obj.type === 'Washing') {
                    const transaction = await WashingSales.update(dataa, {
                        where: {
                            id: obj.id,
                        },
                    });

                } else if (obj.type === 'Dying') {
                    const transaction = await DyingSales.update(dataa, {
                        where: {
                            id: obj.id,
                        },
                    });

                }
                await CompactingFabricSelections.create({
                    process_id: obj.id, process_type: 'compacting_sales', sales_id: sales.id, qty_used: obj.qtyUsed
                })
            }
        }
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

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
                { order_refernce: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$buyer.name$': { [Op.iLike]: `%${searchTerm}%` } },
            ];
        }
        whereCondition.compacting_id = fabricId
        let include: any = [
            {
                model: Program,
                as: 'program',
            },
            {
                model: Season,
                as: 'season',
            },
            {
                model: Fabric,
                as: 'compacting',
            },
            {
                model: Garment,
                as: 'buyer',
            }
        ];
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await CompactingSales.findAndCountAll({
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
            const gin = await CompactingSales.findAll({
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

//choosing the compacting fabric data
const chooseCompactingFabric = async (req: Request, res: Response) => {
    try {
        let { fabricId }: any = req.query;
        if (!fabricId) {
            return res.sendError(res, 'Need Fabric Id');
        }

        let include = [
            {
                model: Program,
                as: 'program',
            },
        ]

        let data = await Promise.all([
            WashingSales.findAll({
                where: { status: 'Sold', buyer_type: 'Compacting', fabric_id: fabricId },
                include: [...include, { model: Fabric, as: 'washing', attributes: ['id', 'name'] }]
            }),
            PrintingSales.findAll({
                where: { status: 'Sold', buyer_type: 'Compacting', fabric_id: fabricId },
                include: [...include, { model: Fabric, as: 'printing', attributes: ['id', 'name'] }]
            }),
            DyingSales.findAll({
                where: { status: 'Sold', buyer_type: 'Compacting', fabric_id: fabricId },
                include: [...include, { model: Fabric, as: 'dying_fabric', attributes: ['id', 'name'] }]
            })
        ])
        return res.sendSuccess(res, data.flat());
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }
}
//export Compacting process data
const exportCompactingProcess = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "export-compacting-process.xlsx");

    try {
        const whereCondition: any = {};
        const searchTerm = req.query.search || "";
        if (searchTerm) {
            whereCondition[Op.or] = [
                { order_refernce: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$buyer.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$abuyer.name$': { [Op.iLike]: `%${searchTerm}%` } }
            ];
        }
        whereCondition.compacting_id = req.query.fabricId
        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:K1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Process/Sale';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Fabric Processor Type", "Sold To",
            "Invoice No", "	Batch/Lot No",
            "Compacted Fabric Quantity", "Length in Mts", "GSM", "Fabric Net Weight (Kgs)", "Program"
        ]);
        headerRow.font = { bold: true };
        let include: any = [
            {
                model: Program,
                as: 'program',
            },
            {
                model: Season,
                as: 'season',
            },
            {
                model: Fabric,
                as: 'compacting',
            },
            {
                model: Garment,
                as: 'buyer',
            }
        ];
        const sales = await CompactingSales.findAll({
            where: whereCondition,
            include: include
        });
        // Append data to worksheet
        for await (const [index, item] of sales.entries()) {

            const rowValues = Object.values({
                index: index + 1,
                date: item.date ? item.date : '',
                buyer_type: item.buyer_type ?? '',
                buyer: item.buyer ? item.buyer.name : item.processor_name,
                invoice: item.invoice_no ? item.invoice_no : '',
                order: item.batch_lot_no ? item.batch_lot_no : '',
                qty: item.total_fabric_quantity ? item.total_fabric_quantity : '',
                length: item.fabric_length ? item.fabric_length : '',
                gsm: item.gsm ? item.gsm : '',
                fabric_net_weight: item.fabric_net_weight ? item.fabric_net_weight : '',
                program: item.program ? item.program.program_name : ''
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


const getGarments = async (req: Request, res: Response) => {
    let fabricId = req.query.fabricId;
    if (!fabricId) {
        return res.sendError(res, 'Need Weaver Id ');
    }
    let result = await Fabric.findOne({ where: { id: fabricId } });
    if (!result) {
        return res.sendError(res, 'No Weaver Found ');
    }
    let garment = await Garment.findAll({
        attributes: ['id', 'name'],
        where: { brand: { [Op.overlap]: result.dataValues.brand } }
    })
    res.sendSuccess(res, garment);
}

const getFabrics = async (req: Request, res: Response) => {
    let fabricId = req.query.fabricId;
    if (!fabricId) {
        return res.sendError(res, 'Need Weaver Id ');
    }
    let result = await Fabric.findOne({ where: { id: fabricId } });
    if (!result) {
        return res.sendError(res, 'No Weaver Found ');
    }
    let garment = await Fabric.findAll({
        attributes: ['id', 'name'],
        where: { brand: { [Op.overlap]: result.dataValues.brand } }
    })
    res.sendSuccess(res, garment);
}

export {
    fetchDyingTransactions,
    getProgram,
    fetchDyingTransactionsAll,
    fetchWashingTransactions,
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
    exportCompactingProcess
}