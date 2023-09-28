import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import GarmentSales from "../../models/garment-sales.model";
import * as ExcelJS from "exceljs";
import * as fs from "fs";
import * as path from "path";
import Brand from "../../models/brand.model";
import Program from "../../models/program.model";
import Garment from "../../models/garment.model";
import Embroidering from "../../models/embroidering.model";
import Season from "../../models/season.model";
import Department from "../../models/department.model";
import Trader from "../../models/trader.model";
import TraderSales from "../../models/trader-sales.model";
import { generateOnlyQrCode } from "../../provider/qrcode";


//fetch Garment Sales with filters
const fetchTraderTransactions = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { traderId, seasonId, programId, status }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (!traderId) {
            return res.sendError(res, 'Need Trader Id')
        }
        if (!status) {
            return res.sendError(res, 'Need Status')
        }
        if (searchTerm) {
            whereCondition[Op.or] = [
                { order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
                { style_mark_no: { [Op.iLike]: `%${searchTerm}%` } },
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$buyer.brand_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { transaction_agent: { [Op.iLike]: `%${searchTerm}%` } },
                { garment_type: { [Op.iLike]: `%${searchTerm}%` } },
                { garment_size: { [Op.iLike]: `%${searchTerm}%` } },
                { color: { [Op.iLike]: `%${searchTerm}%` } },
            ];
        }
        if (traderId) {
            whereCondition.trader_id = traderId;
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

        if (status === 'Pending' || status === 'Sold') {
            whereCondition.status = status;
        }

        let include = [
            {
                model: Garment,
                as: "garment",
                attributes: ['id', 'name', 'address']
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
                model: Embroidering,
                as: "embroidering",
            },
            {
                model: Department,
                as: "department",
            },
            {
                model: Brand,
                as: "buyer",
                attributes: ['id', 'brand_name', 'address']
            }
        ];
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await GarmentSales.findAndCountAll({
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
            const gin = await GarmentSales.findAll({
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

const updateTransactionStatus = async (req: Request, res: Response) => {
    try {

        let trans: any = []
        for await (let obj of req.body.items) {
            const data: any = {
                status: obj.status,
                accept_date: obj.status === 'Sold' ? new Date().toISOString() : null
            };

            const transaction = await GarmentSales.update(data, {
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

const getProgram = async (req: Request, res: Response) => {
    try {
        if (!req.query.traderId) {
            return res.sendError(res, 'Need trader Id');
        }

        let traderId = req.query.traderId;
        let result = await Trader.findOne({ where: { id: traderId } });
        if (!result) {
            return res.sendError(res, 'Trader not found');
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

//create Trader Sale
const createTraderSales = async (req: Request, res: Response) => {
    try {
        let embroidering
        // if (req.body.embroideringRequired) {
        //     embroidering = await Embroidering.create({
        //         processor_name: req.body.processorName,
        //         address: req.body.address,
        //         process_name: req.body.processName,
        //         no_of_pieces: req.body.embNoOfPieces,
        //         process_loss: req.body.processLoss,
        //         final_no_of_pieces: req.body.finalNoOfPieces,
        //     });
        // }
        // let uniqueFilename = `trader_sales_qrcode_${Date.now()}.png`;
        // let aa = await generateOnlyQrCode(`Test`, uniqueFilename);
        const data = {
            trader_id: req.body.traderId,
            program_id: req.body.programId,
            season_id: req.body.seasonId,
            date: req.body.date,
            order_ref: req.body.orderRef,
            department_id: req.body.departmentId,
            buyer_type: req.body.buyerType,
            buyer_id: req.body.buyerId,
            processor_id: req.body.processorId,
            processor_name: req.body.processorName,
            processor_address: req.body.processorAddress,
            fabric_length: req.body.fabricLength,
            additional_fabric_length: req.body.additionalFabricLength,
            total_fabric_length: req.body.totalFabricLength,
            batch_lot_no: req.body.batchLotNo,
            no_of_pieces: req.body.noOfPieces,
            no_of_boxes: req.body.noOfBoxes,
            total_qty: req.body.totalQty,
            box_ids: req.body.boxIds,
            invoice_no: req.body.invoiceNo,
            bill_of_ladding: req.body.billOfLadding,
            transport_info: req.body.transportInfo,
            contract_no: req.body.contractNo,
            tc_files: req.body.tcFiles,
            contract_file: req.body.contractFile,
            invoice_file: req.body.invoiceFile,
            delivery_notes: req.body.deliveryNotes,
            qty_stock: req.body.totalQty,
            // embroidering_required: req.body.embroideringRequired,
            // embroidering_id: embroidering ? embroidering.id : null,
            status: 'Pending'
        };
        const garmentSales = await TraderSales.create(data);
        res.sendSuccess(res, garmentSales);
    } catch (error: any) {
        console.log(error.message);
        return res.sendError(res, error.meessage);
    }
}

//fetch Trader Sales with filters
const fetchTraderSalesPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { traderId, seasonId, programId } = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {

        if (traderId) {
            whereCondition.trader_id = traderId;
        }
        let include = [
            {
                model: Trader,
                as: "trader",
                attributes: ['id', 'name', 'address']
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
                model: Department,
                as: "department",
            },
            {
                model: Brand,
                as: "buyer",
                attributes: ['id', 'brand_name', 'address']
            }
        ];
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await TraderSales.findAndCountAll({
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
            const gin = await TraderSales.findAll({
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

// const exportGarmentSale = async (req: Request, res: Response) => {
//     const excelFilePath = path.join("./upload", "garment-sale.xlsx");

//     try {
//         const whereCondition: any = {};
//         const searchTerm = req.query.search || "";
//         if (searchTerm) {
//             whereCondition[Op.or] = [
//                 { order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
//                 { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
//                 { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
//                 { style_mark_no: { [Op.iLike]: `%${searchTerm}%` } },
//                 { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
//                 { '$buyer.brand_name$': { [Op.iLike]: `%${searchTerm}%` } },
//                 { transaction_agent: { [Op.iLike]: `%${searchTerm}%` } },
//                 { garment_type: { [Op.iLike]: `%${searchTerm}%` } },
//                 { garment_size: { [Op.iLike]: `%${searchTerm}%` } },
//                 { color: { [Op.iLike]: `%${searchTerm}%` } },
//             ];
//         }
//         whereCondition.garment_id = req.query.garmentId
//         // Create the excel workbook file
//         const workbook = new ExcelJS.Workbook();
//         const worksheet = workbook.addWorksheet("Sheet1");
//         worksheet.mergeCells('A1:L1');
//         const mergedCell = worksheet.getCell('A1');
//         mergedCell.value = 'CottonConnect | Process/Sale';
//         mergedCell.font = { bold: true };
//         mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
//         // Set bold font for header row
//         const headerRow = worksheet.addRow([
//             "Sr No.", "Date", "Season", "Brand/Retailer Name", "Order Reference",
//             "Invoice No", "Style/Mark No",
//             "Garment/ Product Type", "Garment/ Product Size", "Color", "No of pieces", "No of Boxes"
//         ]);
//         headerRow.font = { bold: true };
//         let include = [
//             {
//                 model: Garment,
//                 as: "garment",
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
//                 model: Embroidering,
//                 as: "embroidering",
//             },
//             {
//                 model: Department,
//                 as: "department",
//             },
//             {
//                 model: Brand,
//                 as: "buyer",
//                 attributes: ['id', 'brand_name', 'address']
//             }
//         ];
//         const garment = await GarmentSales.findAll({
//             where: whereCondition,
//             include: include
//         });
//         // Append data to worksheet
//         for await (const [index, item] of garment.entries()) {

//             const rowValues = Object.values({
//                 index: index + 1,
//                 date: item.date ? item.date : '',
//                 season: item.season ? item.season.name : '',
//                 buyer: item.buyer ? item.buyer.brand_name : item.processor_name,
//                 order: item.order_ref ? item.order_ref : '',
//                 invoice: item.invoice_no ? item.invoice_no : '',
//                 mark: item.style_mark_no ? item.style_mark_no : '',
//                 garment: item.garment_type ? item.garment_type : '',
//                 garment_size: item.garment_size ? item.garment_size : '',
//                 color: item.color ? item.color : '',
//                 no_of_pieces: item.no_of_pieces ? item.no_of_pieces : '',
//                 no_of_boxes: item.no_of_boxes ? item.no_of_boxes : '',
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
//             column.width = Math.min(24, maxCellLength + 2); // Limit width to 30 characters
//         });

//         // Save the workbook
//         await workbook.xlsx.writeFile(excelFilePath);
//         res.status(200).send({
//             success: true,
//             messgage: "File successfully Generated",
//             data: process.env.BASE_URL + "garment-sale.xlsx",
//         });
//     } catch (error: any) {
//         console.error("Error appending data:", error);
//         return res.sendError(res, error.message);

//     }
// };


export {
    fetchTraderTransactions,
    updateTransactionStatus,
    getProgram,
    createTraderSales,
    fetchTraderSalesPagination
}