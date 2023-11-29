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
import Season from "../../models/season.model";
import Department from "../../models/department.model";
import FabricSelection from "../../models/fabric-selections.model";

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
        let { garmentId, programId, orderRef, invoiceNo, weaverId, knitterId } = req.query;
        let extra = ``;
        let extrawave = ``;
        if (!garmentId) {
            return res.sendError(res, 'Need Garment Id');
        }
        // if (fabricId) {
        //     extra += `AND "knit_sales"."fabric_type" = '${fabricId}' `;
        //     extrawave += `AND "weaver_sales"."fabric_type" = '${fabricId}' `
        // }
        if (programId) {
            extra += `AND "knit_sales"."program_id" = '${programId}' `;
            extrawave += `AND "weaver_sales"."program_id" = '${programId}' `
        }
        // if (orderRef) {
        //     extra += `AND "knit_sales"."order_ref" = '${orderRef}' `;
        //     extrawave += `AND "weaver_sales"."order_ref" = '${orderRef}' `
        // }

        if (invoiceNo) {
            extra += `AND "knit_sales"."invoice_no" = '${invoiceNo}' `;
            extrawave += `AND "weaver_sales"."invoice_no" = '${invoiceNo}' `
        }
        if (weaverId) {
            extrawave += `AND "weaver_sales"."weaver_id" = '${weaverId}' `
        }
        if (knitterId) {
            extra += `AND "knit_sales"."knitter_id" = '${knitterId}' `;
        }

        // let data: any = await sequelize.query(
        //     `SELECT "weaver_sales"."id", "weaver_sales"."weaver_id", "weaver_sales"."season_id", "weaver_sales"."date", "weaver_sales"."program_id", "weaver_sales"."order_ref", "weaver_sales"."buyer_id",  "weaver_sales"."transaction_via_trader", "weaver_sales"."transaction_agent", "weaver_sales"."fabric_type", "weaver_sales"."fabric_length", "weaver_sales"."fabric_gsm", "weaver_sales"."fabric_weight", "weaver_sales"."batch_lot_no", "weaver_sales"."job_details_garment","weaver_sales"."invoice_no", "weaver_sales"."vehicle_no","weaver_sales"."qty_stock", "weaver_sales"."qr", "program"."id" AS "program-id", "program"."program_name" AS "program_name", "fabric"."id" AS 
        //     "fabric_id", "fabric"."fabricType_name" AS "fabricType_name", "weaver"."id" AS "weaver-id", "weaver"."name" AS 
        //     "weaver_name" FROM "weaver_sales" AS "weaver_sales" LEFT OUTER JOIN "programs" AS "program" ON "weaver_sales"."program_id" = "program"."id" LEFT OUTER JOIN "fabric_types" AS "fabric" ON "weaver_sales"."fabric_type" = "fabric"."id" LEFT OUTER JOIN "weavers" AS "weaver" ON "weaver_sales"."weaver_id" = "weaver"."id" WHERE "weaver_sales"."status" = 'Sold' AND "weaver_sales"."buyer_id" = '${garmentId}' ${extrawave}
        //      UNION ALL 
        //      SELECT "knit_sales"."id", "knit_sales"."knitter_id", "knit_sales"."season_id", "knit_sales"."date", "knit_sales"."program_id", "knit_sales"."order_ref", "knit_sales"."buyer_id", "knit_sales"."transaction_via_trader", "knit_sales"."transaction_agent", "knit_sales"."fabric_type", "knit_sales"."fabric_length", "knit_sales"."fabric_gsm", "knit_sales"."fabric_weight", "knit_sales"."batch_lot_no", "knit_sales"."job_details_garment", "knit_sales"."invoice_no", "knit_sales"."vehicle_no", "knit_sales"."qty_stock", "knit_sales"."qr", "program"."id" AS "program-id", "program"."program_name" AS "program_name", "fabric"."id" AS "fabric_id", "fabric"."fabricType_name" AS "fabricType_name", "knitter"."id" AS "knitter-id", "knitter"."name" AS "knitter_name" FROM "knit_sales" AS "knit_sales" 
        //      LEFT OUTER JOIN "programs" AS "program" ON "knit_sales"."program_id" = "program"."id" LEFT OUTER JOIN "fabric_types" AS "fabric" ON "knit_sales"."fabric_type" = "fabric"."id" LEFT OUTER JOIN "knitters" AS "knitter" ON "knit_sales"."knitter_id" = "knitter"."id" WHERE "knit_sales"."status" = 'Sold' AND "knit_sales"."buyer_id" = '${garmentId}' ${extra}
        //      OFFSET ${offset} 
        //      LIMIT ${limit}`,
        // )

        const data = await sequelize.query(
            `SELECT 
                "weaver_sales"."id", 
                "weaver_sales"."weaver_id", 
                "weaver_sales"."season_id", 
                "weaver_sales"."date", 
                "weaver_sales"."program_id", 
                "weaver_sales"."garment_order_ref", 
                "weaver_sales"."brand_order_ref", 
                "weaver_sales"."buyer_id",  
                "weaver_sales"."transaction_via_trader", 
                "weaver_sales"."transaction_agent", 
                "weaver_sales"."yarn_qty", 
                "weaver_sales"."total_yarn_qty", 
                "weaver_sales"."bill_of_ladding", 
                "weaver_sales"."transporter_name", 
                "weaver_sales"."batch_lot_no", 
                "weaver_sales"."invoice_no", 
                "weaver_sales"."vehicle_no",
                "weaver_sales"."qty_stock", 
                "weaver_sales"."qr", 
                "program"."id" AS "program-id", 
                "program"."program_name" AS "program_name", 
                "weaver"."id" AS "weaver-id", 
                "weaver"."name" AS "weaver_name" 
            FROM "weaver_sales" AS "weaver_sales" 
            LEFT OUTER JOIN "programs" AS "program" ON "weaver_sales"."program_id" = "program"."id" 
            LEFT OUTER JOIN "weavers" AS "weaver" ON "weaver_sales"."weaver_id" = "weaver"."id" 
            WHERE "weaver_sales"."status" = 'Sold' AND "weaver_sales"."buyer_id" = '${garmentId}' ${extrawave}
            
            UNION ALL 
            
            SELECT 
                "knit_sales"."id", 
                "knit_sales"."knitter_id", 
                "knit_sales"."season_id", 
                "knit_sales"."date", 
                "knit_sales"."program_id", 
                "knit_sales"."garment_order_ref", 
                "knit_sales"."brand_order_ref", 
                "knit_sales"."buyer_id", 
                "knit_sales"."transaction_via_trader", 
                "knit_sales"."transaction_agent", 
                "knit_sales"."batch_lot_no", 
                "knit_sales"."yarn_qty", 
                "knit_sales"."total_yarn_qty", 
                "knit_sales"."invoice_no", 
                "knit_sales"."bill_of_ladding", 
                "knit_sales"."transporter_name", 
                "knit_sales"."vehicle_no", 
                "knit_sales"."qty_stock", 
                "knit_sales"."qr", 
                "program"."id" AS "program-id", 
                "program"."program_name" AS "program_name", 
                "knitter"."id" AS "knitter-id", 
                "knitter"."name" AS "knitter_name" 
            FROM "knit_sales" AS "knit_sales" 
            LEFT OUTER JOIN "programs" AS "program" ON "knit_sales"."program_id" = "program"."id" 
            LEFT OUTER JOIN "knitters" AS "knitter" ON "knit_sales"."knitter_id" = "knitter"."id" 
            WHERE "knit_sales"."status" = 'Sold' AND "knit_sales"."buyer_id" = '${garmentId}' ${extra}
            OFFSET ${offset} 
            LIMIT ${limit}`,
        );
        return res.sendPaginationSuccess(res, data[1].rows, data[1].rowCount);
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }
}

const fetchTransactionsAll = async (req: Request, res: Response) => {
    try {
        let { garmentId, weaverId, programId, lotNo, garmentOrderRef,brandOrderRef, invoiceNo, fabricId, knitterId }: any = req.query;
        if (!garmentId) {
            return res.sendError(res, 'Need Garment Id');
        }
        const knitterWhere: any = {}
        const weaverWhere: any = {}
        let whereCondition: any = {}
        if (fabricId) {
            const idArray: number[] = fabricId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.fabric_type = { [Op.in]: idArray };
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
        if (garmentOrderRef) {
            const idArray: any[] = garmentOrderRef
                .split(",")
                .map((id: any) => id);
            whereCondition.garment_order_ref = { [Op.in]: idArray };
        }
        if (brandOrderRef) {
            const idArray: any[] = brandOrderRef
                .split(",")
                .map((id: any) => id);
            whereCondition.brand_order_ref = { [Op.in]: idArray };
        }
        if (invoiceNo) {
            const idArray: any[] = invoiceNo
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
        let include = [
            {
                model: Program,
                as: 'program',
            },
            {
                model: Season,
                as: "season",
                attributes: ['id', 'name']
            },
            // {
            //     model: FabricType,
            //     as: 'fabric',
            // }
        ]
        let result = await Promise.all([
            WeaverSales.findAll({
                where: { status: 'Pending for QR scanning', buyer_id: garmentId, ...whereCondition, ...weaverWhere },
                include: [...include, { model: Weaver, as: 'weaver', attributes: ['id', 'name'] }]
            }),
            KnitSales.findAll({ where: { status: 'Pending for QR scanning', buyer_id: garmentId, ...whereCondition, ...knitterWhere }, include: [...include, { model: Knitter, as: 'knitter', attributes: ['id', 'name'] }] })
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
            return res.sendError(res, 'Need Garment Id');
        }

        let garmentId = req.query.garmentId;
        let result = await Garment.findOne({ where: { id: garmentId } });
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
            status: req.body.buyerId ? 'Sold' : 'Pending'
        };
        const garmentSales = await GarmentSales.create(data);
        let uniqueFilename = `garment_sales_qrcode_${Date.now()}.png`;
        let aa = await generateOnlyQrCode(`${process.env.ADMIN_URL}/qrdetails/garmentsales/${garmentSales.id}`, uniqueFilename);
        const gin = await GarmentSales.update({ qr: uniqueFilename }, {
            where: {
                id: garmentSales.id
            }
        });
        if (req.body.chooseFabric && req.body.chooseFabric.length > 0) {
            for await (let obj of req.body.chooseFabric) {
                if (obj.processor === 'knitter') {
                    let update = await KnitSales.update({ qty_stock: obj.totalQty - obj.qtyUsed }, { where: { id: obj.id } });
                } else {
                    let update = await WeaverSales.update({ qty_stock: obj.totalQty - obj.qtyUsed }, { where: { id: obj.id } });
                }
                await FabricSelection.create({
                    fabric_id: obj.id, processor: obj.processor, sales_id: garmentSales.id, qty_used: obj.qtyUsed
                })
            }
        }

        res.sendSuccess(res, garmentSales);
    } catch (error: any) {
        console.log(error.message);
        return res.sendError(res, error.meessage);
    }
}

//fetch Garment Sales with filters
const fetchGarmentSalesPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { garmentId, seasonId, programId, brandId }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
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

        if (garmentId) {
            const idArray: number[] = garmentId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.garment_id = { [Op.in]: idArray };
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
        if (brandId) {
            whereCondition.buyer_id = brandId;
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

const fetchGarmentSale = async (req: Request, res: Response) => {

    const whereCondition: any = {};
    try {
        if (!req.query.id) {
            return res.sendError(res, 'Need id')
        }
        whereCondition.id = req.query.id;
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

        const gin = await GarmentSales.findOne({
            where: whereCondition,
            include: include
        });
        return res.sendSuccess(res, gin);

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};
const exportGarmentSale = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "garment-sale.xlsx");

    try {
        const whereCondition: any = {};
        const searchTerm = req.query.search || "";
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
        const { garmentId, seasonId, programId, brandId }: any = req.query;
        if (garmentId) {
            const idArray: number[] = garmentId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.garment_id = { [Op.in]: idArray };
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
        whereCondition.garment_id = req.query.garmentId
        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:L1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Process/Sale';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Season", "Brand/Retailer Name", "Order Reference",
            "Invoice No", "Style/Mark No",
            "Garment/ Product Type", "Garment/ Product Size", "Color", "No of pieces", "No of Boxes"
        ]);
        headerRow.font = { bold: true };
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
        const garment = await GarmentSales.findAll({
            where: whereCondition,
            include: include
        });
        // Append data to worksheet
        for await (const [index, item] of garment.entries()) {

            const rowValues = Object.values({
                index: index + 1,
                date: item.date ? item.date : '',
                season: item.season ? item.season.name : '',
                buyer: item.buyer ? item.buyer.brand_name : item.processor_name,
                order: item.order_ref ? item.order_ref : '',
                invoice: item.invoice_no ? item.invoice_no : '',
                mark: item.style_mark_no ? item.style_mark_no : '',
                garment: item.garment_type ? item.garment_type : '',
                garment_size: item.garment_size ? item.garment_size : '',
                color: item.color ? item.color : '',
                no_of_pieces: item.no_of_pieces ? item.no_of_pieces : '',
                no_of_boxes: item.no_of_boxes ? item.no_of_boxes : '',
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
            data: process.env.BASE_URL + "garment-sale.xlsx",
        });
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);

    }
};


const getEmbroidering = async (req: Request, res: Response) => {
    try {
        let data = await Embroidering.findOne({ where: { id: req.query.id } });
        return res.sendSuccess(res, data);
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);

    }
};

const dashboardGraph = async (req: Request, res: Response) => {
    try {
        if (!req.query.garmentId) {
            return res.sendError(res, 'Need Garment Id');
        }
        let result = await Garment.findOne({ where: { id: req.query.garmentId } });
        let program = await Program.findAll({
            where: {
                id: result.program_id
            },
            attributes: ['id', 'program_name']
        });
        let resulting: any = [];
        for await (let obj of program) {
            let data = await GarmentSales.findAll({
                where: {
                    program_id: obj.id,
                    garment_id: req.query.garmentId
                },
                attributes: [
                    ["garment_type", "garmentType"],
                    [
                        Sequelize.fn("SUM", Sequelize.col("total_fabric_length")),
                        "total"
                    ]
                ],
                group: ["garment_type"]
            });
            let knit = await KnitSales.findOne({
                attributes: [
                    [
                        Sequelize.fn("SUM", Sequelize.col("fabric_weight")),
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
                where: { buyer_id: req.query.garmentId, program_id: obj.id, status: 'Sold' },
                group: ["program_id"],
                raw: true
            })
            let weaver = await WeaverSales.findOne({
                attributes: [
                    [
                        Sequelize.fn("SUM", Sequelize.col("fabric_weight")),
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
                where: { buyer_id: req.query.garmentId, program_id: obj.id, status: 'Sold' },
                group: ["program_id"],
                raw: true
            })
            let totalQuantity = (knit.totalQuantity ?? 0) + (weaver.totalQuantity ?? 0);
            let totalQuantityStock = (knit.totalQuantityStock ?? 0) + (weaver.totalQuantityStock);
            resulting.push({ program: obj, graphData: data, fabric: { totalQuantity, totalQuantityStock } })
        }

        return res.sendSuccess(res, resulting);
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }
};

const getprocessName = async (req: Request, res: Response) => {
    const { garmentId, status, filter, programId, spinnerId }: any = req.query;
    const whereCondition: any = {};
    try {
        if (!garmentId) {
            return res.sendError(res, 'Need garment Id ');
        }
        if (!status) {
            return res.sendError(res, 'Need  status');
        }

        if (status === 'Pending' || status === 'Sold') {
            whereCondition.buyer_id = garmentId
            whereCondition.status = status === 'Pending' ? 'Pending for QR scanning' : 'Sold';
        }

        const response = await Promise.all([
            WeaverSales.findAll({
                attributes: ['weaver_id', 'weaver.name'],
                where: whereCondition,
                include: [
                    {
                        model: Weaver,
                        as: 'weaver',
                        attributes: ['id', 'name']
                    }
                ],
                group: ['weaver_id', "weaver.id"]
            }),
            KnitSales.findAll({
                attributes: ['knitter_id', 'knitter.name'],
                where: whereCondition,
                include: [
                    {
                        model: Knitter,
                        as: 'knitter',
                        attributes: ['id', 'name']
                    }
                ],
                group: ['knitter_id', "knitter.id"]
            })
        ])

        res.sendSuccess(res, response.flat());
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const getInvoice = async (req: Request, res: Response) => {
    const { weaverId, garmentId, status, KnitterId }: any = req.query;
    const whereCondition: any = {};
    const knitterWhere: any = {}
    const weaverWhere: any = {}
    try {
        if (!garmentId) {
            return res.sendError(res, 'Need Garment Id ');
        }
        if (!status) {
            return res.sendError(res, 'Need  status');
        }


        if (status === 'Pending' || status === 'Sold') {
            whereCondition.buyer_id = garmentId
            whereCondition.status = status === 'Pending' ? 'Pending for QR scanning' : 'Sold';
        }
        if (KnitterId) {
            const idArray: number[] = KnitterId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            knitterWhere.knitter_id = { [Op.in]: idArray };
        }
        if (weaverId) {
            const idArray: number[] = weaverId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            weaverWhere.weaver_id = { [Op.in]: idArray };
        }
        const response = await Promise.all([
            WeaverSales.findAll({
                attributes: ['invoice_no', 'batch_lot_no', 'order_ref'],
                where: { ...whereCondition, ...weaverWhere },
                group: ['invoice_no', 'batch_lot_no', 'order_ref']
            }),
            KnitSales.findAll({
                attributes: ['invoice_no', 'batch_lot_no', 'order_ref'],
                where: { ...whereCondition, ...knitterWhere },
                group: ['invoice_no', 'batch_lot_no', 'order_ref']
            })
        ])


        res.sendSuccess(res, response.flat());
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const getBrands = async (req: Request, res: Response) => {
    let garmentId = req.query.garmentId;
    if (!garmentId) {
        return res.sendError(res, 'Need Garment Id ');
    }
    let garment = await Garment.findOne({ where: { id: garmentId } });
    if (!garment) {
        return res.sendError(res, 'No Weaver Found ');
    }
    let brand = await Brand.findAll({
        attributes: ['id', 'brand_name', 'address'],
        where: { id: { [Op.in]: garment.dataValues.brand } }
    })
    res.sendSuccess(res, brand);
}

export {
    fetchBrandQrGarmentSalesPagination,
    exportBrandQrGarmentSales,
    fetchTransactions,
    fetchTransactionsAll,
    updateTransactionStatus,
    getProgram,
    createGarmentSales,
    fetchGarmentSalesPagination,
    exportGarmentSale,
    getEmbroidering,
    dashboardGraph,
    getprocessName,
    getInvoice,
    fetchGarmentSale,
    getBrands
}