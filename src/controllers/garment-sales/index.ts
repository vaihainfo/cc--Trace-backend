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

const fetchBrandQrGarmentSalesPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { brandId } = req.query
    const offset = (page - 1) * limit;
    const whereCondition: any = {}
    try {
        if (!brandId) {
            return res.sendError(res, 'Please send a brand Id')
        }
        if (searchTerm) {
            whereCondition[Op.or] = [
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } }, // Search by device id 
                { garment_type: { [Op.iLike]: `%${searchTerm}%` } }, // Search by staff name
                { style_mark_no: { [Op.iLike]: `%${searchTerm}%` } },  // Search by user name 
                { no_of_pieces: { [Op.iLike]: `%${searchTerm}%` } },  // Search by user name 
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },  // Search by user name            
            ];
        }
        whereCondition.buyer_type = 'Mapped';
        whereCondition.buyer_id = brandId;

        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await GarmentSales.findAndCountAll({
                where: whereCondition,
                offset: offset,
                limit: limit
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const data = await GarmentSales.findAll({
                where: whereCondition
            });
            return res.sendSuccess(res, data);
        }
    } catch (error) {
        console.error(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const exportBrandQrGarmentSales = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "barcode-report.xlsx");

    try {
        const { brandId } = req.query;
        if (!brandId) {
            return res.sendError(res, 'Please send a brand ID')
        }
        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:H1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Barcode Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };

        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "QR Code", "Brand Name",
            "Invoice No", "Garment Type", "Style/Mark No", "Total No. of pieces", "Program"
        ]);
        headerRow.font = { bold: true };


        //fetch data with pagination
        const data = await GarmentSales.findAll({
            where: {
                buyer_type: 'Mapped',
                buyer_id: brandId
            }
        });
        // Append data to worksheet
        for await (const [index, item] of data.entries()) {
            let brand = await Brand.findOne({ where: { id: brandId } })
            const rowValues = Object.values({
                index: index + 1,
                qrCode: item.qrUrl ? process.env.BASE_URL + item.qrUrl : '',
                brandName: brand ? brand.brand_name : '',
                invoiceNo: item.invoice_no ? item.invoice_no : '',
                grarmentType: item.garment_type ? item.garment_type : '',
                style_mark_no: item.style_mark_no ? item.style_mark_no : '',
                totalPiece: item.no_of_pieces ? item.no_of_pieces : '',
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
}

const fetchTransactions = async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        let fabricId = req.query.fabricId || ''
        let { garmentId, programId, orderRef, invoiceNo } = req.query;
        let extra = ``;
        let extrawave = ``;
        if (!garmentId) {
            return res.sendError(res, 'Need Garment Id');
        }
        if (fabricId) {
            extra += `AND "knit_sales"."fabric_type" = '${fabricId}' `;
            extrawave += `AND "weaver_sales"."fabric_type" = '${fabricId}' `
        }
        if (programId) {
            extra += `AND "knit_sales"."program_id" = '${programId}' `;
            extrawave += `AND "weaver_sales"."program_id" = '${programId}' `
        }
        if (orderRef) {
            extra += `AND "knit_sales"."order_ref" = '${orderRef}' `;
            extrawave += `AND "weaver_sales"."order_ref" = '${orderRef}' `
        }

        if (invoiceNo) {
            extra += `AND "knit_sales"."invoice_no" = '${invoiceNo}' `;
            extrawave += `AND "weaver_sales"."invoice_no" = '${invoiceNo}' `
        }

        let data: any = await sequelize.query(
            `SELECT "weaver_sales"."id", "weaver_sales"."weaver_id", "weaver_sales"."season_id", "weaver_sales"."date", "weaver_sales"."program_id", "weaver_sales"."order_ref", "weaver_sales"."buyer_id",  "weaver_sales"."transaction_via_trader", "weaver_sales"."transaction_agent", "weaver_sales"."fabric_type", "weaver_sales"."fabric_length", "weaver_sales"."fabric_gsm", "weaver_sales"."fabric_weight", "weaver_sales"."batch_lot_no", "weaver_sales"."job_details_garment","weaver_sales"."invoice_no", "weaver_sales"."vehicle_no","weaver_sales"."qty_stock", "weaver_sales"."qr", "program"."id" AS "program-id", "program"."program_name" AS "program_name", "fabric"."id" AS 
            "fabric_id", "fabric"."fabricType_name" AS "fabricType_name", "weaver"."id" AS "weaver-id", "weaver"."name" AS 
            "weaver_name" FROM "weaver_sales" AS "weaver_sales" LEFT OUTER JOIN "programs" AS "program" ON "weaver_sales"."program_id" = "program"."id" LEFT OUTER JOIN "fabric_types" AS "fabric" ON "weaver_sales"."fabric_type" = "fabric"."id" LEFT OUTER JOIN "weavers" AS "weaver" ON "weaver_sales"."weaver_id" = "weaver"."id" WHERE "weaver_sales"."status" = 'Sold' AND "weaver_sales"."buyer_id" = '${garmentId}' ${extrawave}
             UNION ALL 
             SELECT "knit_sales"."id", "knit_sales"."knitter_id", "knit_sales"."season_id", "knit_sales"."date", "knit_sales"."program_id", "knit_sales"."order_ref", "knit_sales"."buyer_id", "knit_sales"."transaction_via_trader", "knit_sales"."transaction_agent", "knit_sales"."fabric_type", "knit_sales"."fabric_length", "knit_sales"."fabric_gsm", "knit_sales"."fabric_weight", "knit_sales"."batch_lot_no", "knit_sales"."job_details_garment", "knit_sales"."invoice_no", "knit_sales"."vehicle_no", "knit_sales"."qty_stock", "knit_sales"."qr", "program"."id" AS "program-id", "program"."program_name" AS "program_name", "fabric"."id" AS "fabric_id", "fabric"."fabricType_name" AS "fabricType_name", "knitter"."id" AS "knitter-id", "knitter"."name" AS "knitter_name" FROM "knit_sales" AS "knit_sales" 
             LEFT OUTER JOIN "programs" AS "program" ON "knit_sales"."program_id" = "program"."id" LEFT OUTER JOIN "fabric_types" AS "fabric" ON "knit_sales"."fabric_type" = "fabric"."id" LEFT OUTER JOIN "knitters" AS "knitter" ON "knit_sales"."knitter_id" = "knitter"."id" WHERE "knit_sales"."status" = 'Sold' AND "knit_sales"."buyer_id" = '${garmentId}' ${extra}
             OFFSET ${offset} 
             LIMIT ${limit}`,
        )
        return res.sendPaginationSuccess(res, data[1].rows, data[1].rowCount);
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }
}

const fetchTransactionsAll = async (req: Request, res: Response) => {
    try {
        let { garmentId, programId, orderRef, invoiceNo, fabricId } = req.query;
        if (!garmentId) {
            return res.sendError(res, 'Need Garment Id');
        }

        let whereCondition: any = {}
        if (fabricId) {
            whereCondition.fabric_type = fabricId
        }
        if (programId) {
            whereCondition.program_id = programId
        }
        if (orderRef) {
            whereCondition.order_ref = orderRef
        }

        if (invoiceNo) {
            whereCondition.invoice_no = invoiceNo
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
                where: { status: 'Pending for QR scanning', buyer_id: garmentId },
                include: [...include, { model: Weaver, as: 'weaver', attributes: ['id', 'name'] }]
            }),
            KnitSales.findAll({ where: { status: 'Pending for QR scanning', buyer_id: garmentId }, include: [...include, { model: Knitter, as: 'knitter', attributes: ['id', 'name'] }] })
        ])
        let abc = result.flat()
        return res.sendSuccess(res, abc);
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }
}

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
        if (!req.query.garmentId) {
            return res.sendError(res, 'Need Knitter Id');
        }

        let garmentId = req.query.garmentId;
        let result = await Garment.findOne({ where: { id: garmentId } });

        let data = await Program.findAll({
            where: {
                id: { [Op.in]: result.program_id }
            }
        });
        res.sendSuccess(res, data);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};


//create Garment Sale
const createGarmentSales = async (req: Request, res: Response) => {
    try {
        let embroidering
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
        let uniqueFilename = `garment_sales_qrcode_${Date.now()}.png`;
        let aa = await generateOnlyQrCode(`Test`, uniqueFilename);
        const data = {
            garment_id: req.body.garmentId,
            program_id: req.body.programId,
            season_id: req.body.seasonId,
            date: req.body.date,
            order_ref: req.body.orderRef,
            department_id: req.body.departmentId,
            buyer_type: req.body.buyerType,
            buyer_id: req.body.buyerId,
            trader_id: req.body.traderId,
            processor_name: req.body.processorName,
            processor_address: req.body.processorAddress,
            fabric_length: req.body.fabricLength,
            additional_fabric_length: req.body.additionalFabricLength,
            total_fabric_length: req.body.totalFabricLength,
            transaction_via_trader: req.body.transactionViaTrader,
            transaction_agent: req.body.transactionAgent,
            garment_type: req.body.garmentType,
            style_mark_no: req.body.styleMarkNo,
            garment_size: req.body.garmentSize,
            color: req.body.color,
            no_of_pieces: req.body.noOfPieces,
            no_of_boxes: req.body.noOfBoxes,
            box_ids: req.body.boxIds,
            invoice_no: req.body.invoiceNo,
            bill_of_ladding: req.body.billOfLadding,
            transport_info: req.body.transportInfo,
            contract_no: req.body.contractNo,
            tc_files: req.body.tcFiles,
            contract_file: req.body.contractFile,
            invoice_file: req.body.invoiceFile,
            delivery_notes: req.body.deliveryNotes,
            qty_stock: req.body.totalFabricLength,
            embroidering_required: req.body.embroideringRequired,
            embroidering_id: embroidering ? embroidering.id : null,
            status: 'Pending for QR scanning',
            qr: uniqueFilename
        };
        const garmentSales = await GarmentSales.create(data);
        res.sendSuccess(res, garmentSales);
    } catch (error: any) {
        return res.sendError(res, error.meessage);
    }
}

//fetch Garment Sales with filters
// const fetchGarmentSalesPagination = async (req: Request, res: Response) => {
//     const searchTerm = req.query.search || "";
//     const page = Number(req.query.page) || 1;
//     const limit = Number(req.query.limit) || 10;
//     const { knitterId, seasonId, programId } = req.query;
//     const offset = (page - 1) * limit;
//     const whereCondition: any = {};
//     try {
//         if (searchTerm) {
//             whereCondition[Op.or] = [
//                 { order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
//                 { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
//                 { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
//                 { fabric_length: { [Op.eq]: searchTerm } },
//                 { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
//                 { '$fabric.fabricType_name$': { [Op.iLike]: `%${searchTerm}%` } },
//                 { fabric_gsm: { [Op.iLike]: `%${searchTerm}%` } },
//                 { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
//                 { vehicle_no: { [Op.iLike]: `%${searchTerm}%` } },
//                 { transaction_agent: { [Op.iLike]: `%${searchTerm}%` } },
//             ];
//         }
//         if (knitterId) {
//             whereCondition.knitter_id = knitterId;
//         }
//         if (seasonId) {
//             whereCondition.season_id = seasonId;
//         }
//         if (programId) {
//             whereCondition.program_id = programId;
//         }

//         let include = [
//             {
//                 model: Knitter,
//                 as: "knitter",
//                 attributes: ['id', 'name', 'address']
//             },
//             {
//                 model: Season,
//                 as: "season",
//             },
//             {
//                 model: Program,
//                 as: "program",
//             },
//             {
//                 model: Dyeing,
//                 as: "dyeing",
//             },
//             {
//                 model: FabricType,
//                 as: "fabric",
//             },
//             {
//                 model: Garment,
//                 as: "buyer",
//                 attributes: ['id', 'name', 'address']
//             }
//         ];
//         //fetch data with pagination
//         if (req.query.pagination === "true") {
//             const { count, rows } = await KnitSales.findAndCountAll({
//                 where: whereCondition,
//                 include: include,
//                 order: [
//                     [
//                         'id', 'asc'
//                     ]
//                 ],
//                 offset: offset,
//                 limit: limit,
//             });
//             return res.sendPaginationSuccess(res, rows, count);
//         } else {
//             const gin = await KnitSales.findAll({
//                 where: whereCondition,
//                 include: include,
//                 order: [
//                     [
//                         'id', 'asc'
//                     ]
//                 ]
//             });
//             return res.sendSuccess(res, gin);
//         }
//     } catch (error: any) {
//         return res.sendError(res, error.message);
//     }
// };

// const exportGarmentSale = async (req: Request, res: Response) => {
//     const excelFilePath = path.join("./upload", "knitter-sale.xlsx");

//     try {
//         const whereCondition: any = {};
//         const searchTerm = req.query.search || "";
//         if (searchTerm) {
//             whereCondition[Op.or] = [
//                 { order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
//                 { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
//                 { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
//                 { fabric_length: { [Op.eq]: searchTerm } },
//                 { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
//                 { '$fabric.fabricType_name$': { [Op.iLike]: `%${searchTerm}%` } },
//                 { fabric_gsm: { [Op.iLike]: `%${searchTerm}%` } },
//                 { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
//                 { vehicle_no: { [Op.iLike]: `%${searchTerm}%` } },
//                 { transaction_agent: { [Op.iLike]: `%${searchTerm}%` } },
//             ];
//         }
//         whereCondition.knitter_id = req.query.knitterId
//         // Create the excel workbook file
//         const workbook = new ExcelJS.Workbook();
//         const worksheet = workbook.addWorksheet("Sheet1");
//         worksheet.mergeCells('A1:M1');
//         const mergedCell = worksheet.getCell('A1');
//         mergedCell.value = 'CottonConnect | Process/Sale';
//         mergedCell.font = { bold: true };
//         mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
//         // Set bold font for header row
//         const headerRow = worksheet.addRow([
//             "Sr No.", "Date", "Season", "Sold To", "Order Reference",
//             "Invoice No", "Finished Batch/Lot No",
//             "Job details from garment", "Knit Fabric Type", "Finished Fabric Length in Mts", "Finished Fabric GSM", "Finished Fabric Net Weight (Kgs)",
//             "Transcation via trader"
//         ]);
//         headerRow.font = { bold: true };
//         let include = [

//             {
//                 model: Season,
//                 as: "season",
//             },
//             {
//                 model: FabricType,
//                 as: "fabric",
//             },
//             {
//                 model: Garment,
//                 as: "buyer",
//                 attributes: ['id', 'name', 'address']
//             }
//         ];;
//         const weaver = await KnitSales.findAll({
//             where: whereCondition,
//             include: include
//         });
//         // Append data to worksheet
//         for await (const [index, item] of weaver.entries()) {

//             const rowValues = Object.values({
//                 index: index + 1,
//                 date: item.date ? item.date : '',
//                 season: item.season ? item.season.name : '',
//                 buyer: item.buyer ? item.buyer.name : item.processor_name,
//                 order: item.order_ref ? item.order_ref : '',
//                 invoice: item.invoice_no ? item.invoice_no : '',
//                 lotNo: item.batch_lot_no ? item.batch_lot_no : '',
//                 garment: item.job_details_garment ? item.job_details_garment : '',
//                 fabrictype: item.fabric ? item.fabric.fabricType_name : '',
//                 length: item.fabric_length ? item.fabric_length : '',
//                 fabric_gsm: item.fabric_gsm ? item.fabric_gsm : '',
//                 fabric_weight: item.fabric_weight ? item.fabric_weight : '',
//                 transaction_via_trader: item.transaction_via_trader ? 'Yes' : 'No'
//             });
//             worksheet.addRow(rowValues);
//         }
//         // Auto-adjust column widths based on content
//         worksheet.columns.forEach((column: any) => {
//             let maxCellLength = 0;
//             column.eachCell({ includeEmpty: true }, (cell: any) => {
//                 const cellLength = (cell.value ? cell.value.toString() : '').length;
//                 maxCellLength = Math.max(maxCellLength, cellLength);
//             });
//             column.width = Math.min(14, maxCellLength + 2); // Limit width to 30 characters
//         });

//         // Save the workbook
//         await workbook.xlsx.writeFile(excelFilePath);
//         res.status(200).send({
//             success: true,
//             messgage: "File successfully Generated",
//             data: process.env.BASE_URL + "knitter-sale.xlsx",
//         });
//     } catch (error: any) {
//         console.error("Error appending data:", error);
//         return res.sendError(res, error.message);

//     }
// };




export {
    fetchBrandQrGarmentSalesPagination,
    exportBrandQrGarmentSales,
    fetchTransactions,
    fetchTransactionsAll,
    updateTransactionStatus,
    getProgram,
    createGarmentSales,
    // fetchGarmentSalesPagination
}