import { Request, Response } from "express";
import { Sequelize, Op, where } from "sequelize";
import { generateOnlyQrCode } from "../../provider/qrcode";
import * as ExcelJS from "exceljs";
import * as fs from "fs";
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

//create Weaver Sale
const createWeaverSales = async (req: Request, res: Response) => {
    try {
        let dyeing
        if (req.body.dyeingRequired) {
            dyeing = await Dyeing.create({
                processor_name: req.body.dyeingProcessorName,
                dyeing_address: req.body.dyeingAddress,
                process_name: req.body.processName,
                yarn_delivered: req.body.yarnDelivered,
                process_loss: req.body.processLoss,
                net_yarn: req.body.processNetYarnQty,
            });
        }
        let uniqueFilename = `weaver_sales_qrcode_${Date.now()}.png`;
        let aa = await generateOnlyQrCode(`Test`, uniqueFilename);
        const data = {
            weaver_id: req.body.weaverId,
            program_id: req.body.programId,
            season_id: req.body.seasonId,
            date: req.body.date,
            order_ref: req.body.orderRef,
            buyer_type: req.body.buyerType,
            buyer_id: req.body.buyerId,
            processor_name: req.body.processorName,
            processor_address: req.body.processorAddress,
            warn_yarn_qty: req.body.warnYarnQty,
            weft_choosen: req.body.weftChoosen,
            weft_cottonmix_type: req.body.weftCottonmixType,
            weft_cottonmix_qty: req.body.weftCottonmixQty,
            weft_yarn_qty: req.body.weftYarnQty,
            total_yarn_qty: req.body.totalYarnQty,
            transaction_via_trader: req.body.transactionViaTrader,
            transaction_agent: req.body.transactionAgent,
            fabric_type: req.body.fabricType,
            fabric_contruction: req.body.fabricContruction,
            fabric_length: req.body.fabricLength,
            fabric_gsm: req.body.fabricGsm,
            fabric_weight: req.body.fabricWeight,
            batch_lot_no: req.body.batchLotNo,
            bale_ids: req.body.baleIds,
            invoice_no: req.body.invoiceNo,
            bill_of_ladding: req.body.billOfLadding,
            no_of_bales: req.body.noOfBales,
            transporter_name: req.body.transporterName,
            vehicle_no: req.body.vehicleNo,
            tc_files: req.body.tcFiles,
            contract_file: req.body.contractFile,
            invoice_file: req.body.invoiceFile,
            delivery_notes: req.body.deliveryNotes,
            qty_stock: req.body.totalYarnQty,
            dyeing_required: req.body.dyeingRequired,
            dyeing_id: dyeing ? dyeing.id : null,
            status: 'Pending for QR scanning',
            qr: uniqueFilename
        };
        const weaverSales = await WeaverSales.create(data);
        if (req.body.chooseYarn && req.body.chooseYarn.length > 0) {
            for await (let obj of req.body.chooseYarn) {
                let update = await SpinSales.update({ qty_stock: obj.totalQty - obj.qtyUsed }, { where: { id: obj.id } });
                await YarnSelection.create({ yarn_id: obj.id, sales_id: weaverSales.id, qty_used: obj.qtyUsed })
            }
        }
        res.sendSuccess(res, { weaverSales });
    } catch (error: any) {
        console.error(error)
        return res.sendError(res, error.meessage);
    }
}

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
                { order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { bale_ids: { [Op.iLike]: `%${searchTerm}%` } },
                { fabric_length: { [Op.eq]: searchTerm } },
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
                { '$fabric.fabricType_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { fabric_contruction: { [Op.iLike]: `%${searchTerm}%` } },
                { fabric_gsm: { [Op.iLike]: `%${searchTerm}%` } },
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { vehicle_no: { [Op.iLike]: `%${searchTerm}%` } },
                { transaction_agent: { [Op.iLike]: `%${searchTerm}%` } },
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
                model: Dyeing,
                as: "dyeing",
            },
            {
                model: FabricType,
                as: "fabric",
            },
            {
                model: Garment,
                as: "buyer",
                attributes: ['id', 'name', 'address']
            }
        ];
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await WeaverSales.findAndCountAll({
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
            const gin = await WeaverSales.findAll({
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
                { order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { bale_ids: { [Op.iLike]: `%${searchTerm}%` } },
                { fabric_length: { [Op.eq]: searchTerm } },
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
                { '$fabric.fabricType_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { fabric_contruction: { [Op.iLike]: `%${searchTerm}%` } },
                { fabric_gsm: { [Op.iLike]: `%${searchTerm}%` } },
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { vehicle_no: { [Op.iLike]: `%${searchTerm}%` } },
                { transaction_agent: { [Op.iLike]: `%${searchTerm}%` } },
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
        mergedCell.value = 'CottonConnect | Process/Sale';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Season", "Sold To", "Order Reference",
            "Invoice No", "Batch Lot No",
            "Bale Id's", "Fabric Type", "Fabric Construction", "Length in Mts", "GSM", "Kgs",
            "Transcation via trader"
        ]);
        headerRow.font = { bold: true };
        let include = [

            {
                model: Season,
                as: "season",
                attributes: []
            },
            {
                model: FabricType,
                as: "fabric",
                attributes: []
            },
            {
                model: Garment,
                as: "buyer",
                attributes: []
            }
        ];;
        const weaver = await WeaverSales.findAll({
            attributes: [
                [Sequelize.col('date'), 'date'],
                [Sequelize.col('"season"."name"'), 'seasons'],
                [Sequelize.col('"buyer"."name"'), 'buyers'],
                [Sequelize.col('order_ref'), 'order_ref'],
                [Sequelize.col('invoice_no'), 'invoice_no'],
                [Sequelize.col('batch_lot_no'), 'batch_lot_no'],
                [Sequelize.col('bale_ids'), 'bale_ids'],
                [Sequelize.col('"fabric"."fabricType_name"'), 'fabrics'],
                [Sequelize.col('fabric_contruction'), 'fabric_contruction'],
                [Sequelize.col('fabric_length'), 'length'],
                [Sequelize.col('fabric_gsm'), 'fabric_gsm'],
                [Sequelize.col('fabric_weight'), 'fabric_weight'],
                [Sequelize.col('fabric_weight'), 'fabric_weight'],
                [Sequelize.col('transaction_via_trader'), 'transaction_via_trader'],
            ],
            where: whereCondition,
            include: include
        });
        // Append data to worksheet
        for await (const [index, item] of weaver.entries()) {

            const rowValues = Object.values({
                index: index + 1,
                ...item.dataValues,
                transaction_via_trader: item.transaction_via_trader ? 'Yes' : 'No'
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

const deleteWeaverSales = async (req: Request, res: Response) => {
    try {
        if (!req.body.id) {
            return res.sendError(res, 'Need Sales Id');
        }
        let yarn_selections = await YarnSelection.findAll({
            where: {
                sales_id: req.body.id
            }
        })
        yarn_selections.forEach((yarn: any) => {
            SpinSales.update(
                {
                    qty_stock: sequelize.literal(`qty_stock + ${yarn.qty_used}`)
                },
                {
                    where: {
                        id: yarn.yarn_id
                    }
                }
            );
        });

        WeaverSales.destroy({
            where: {
                id: req.body.id
            }
        });

        YarnSelection.destroy({
            where: {
                sales_id: req.body.id
            }
        });
        return res.sendSuccess(res, { message: 'Successfully deleted this process' });

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const getWeaverDyeing = async (req: Request, res: Response) => {
    try {
        if (!req.query.id) {
            return res.sendError(res, 'Need Id');
        }

        let id = req.query.id;
        let weaver = await Dyeing.findOne({ where: { id: id } });


        res.sendSuccess(res, weaver);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

//fetch Weaver transaction with filters
const fetchWeaverDashBoard = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { weaverId, status, filter, programId, spinnerId, invoice, lotNo, yarnCount, yarnType }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (!weaverId) {
            return res.sendError(res, 'Need Weaver Id ');
        }
        if (!status) {
            return res.sendError(res, 'Need  status');
        }
        if (searchTerm) {
            whereCondition[Op.or] = [
                { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } }, // Search by batch lot number
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } }, // Search by invoice number
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by program
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search season name  
                { '$spinner.name$': { [Op.iLike]: `%${searchTerm}%` } },// Search season spinner name  
            ];
        }
        if (status === 'Pending' || status === 'Sold') {
            whereCondition.buyer_id = weaverId
            whereCondition.status = status === 'Pending' ? 'Pending for QR scanning' : 'Sold';
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
        if (yarnCount) {
            const idArray: number[] = yarnCount
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.yarn_count = { [Op.in]: idArray };
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

//update Weaver transactions to accept and reject
const updateStatusWeaverSale = async (req: Request, res: Response) => {
    try {
        let update = []
        for (const obj of req.body.items) {
            const data = {
                status: obj.status
            };
            let result = await SpinSales.update(data, { where: { id: obj.id } });
            update.push(result);
        }

        res.sendSuccess(res, { update });
    } catch (error: any) {
        return res.sendError(res, error.meessage);
    }
}


const countCottonBaleWithProgram = async (req: Request, res: Response) => {
    try {
        if (!req.query.weaverId) {
            return res.sendError(res, 'Need Weaver Id');
        }
        if (!req.query.programId) {
            return res.sendError(res, 'Program Id');
        }
        let whereCondition: any = {}
        whereCondition.buyer_id = req.query.weaverId;
        whereCondition.status = 'Sold';
        const weaver = await SpinSales.findAll({
            where: whereCondition,
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

        let data = await WeaverSales.findAll({
            where: {
                weaver_id: req.query.weaverId,
                program_id: req.query.programId
            },
            attributes: [
                [
                    Sequelize.fn("SUM", Sequelize.col("fabric_length")),
                    "total"
                ]
            ],
            include: [
                {
                    model: FabricType,
                    as: "fabric",
                    attributes: ["id", "fabricType_name"],
                }
            ],
            group: ["fabric.id"],
        });
        res.sendSuccess(res, { weaver, data });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const getWeaverProgram = async (req: Request, res: Response) => {
    try {
        if (!req.query.weaverId) {
            return res.sendError(res, 'Need Weaver Id');
        }

        let weaverId = req.query.weaverId;
        let weaver = await Weaver.findOne({ where: { id: weaverId } });

        let data = await Program.findAll({
            where: {
                id: { [Op.in]: weaver.program_id }
            }
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

        if (status === 'Pending' || status === 'Sold') {
            whereCondition.buyer_id = weaverId
            whereCondition.status = status === 'Pending' ? 'Pending for QR scanning' : 'Sold';
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
            return res.sendError(res, 'Need Knitter Id ');
        }
        if (!status) {
            return res.sendError(res, 'Need  status');
        }

        if (status === 'Pending' || status === 'Sold') {
            whereCondition.buyer_id = weaverId
            whereCondition.status = status === 'Pending' ? 'Pending for QR scanning' : 'Sold';
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
        const yarncount = await SpinSales.findAll({
            attributes: ['yarn_count'],
            where: whereCondition,
            include: [
                {
                    model: YarnCount,
                    as: 'yarncount',
                    attributes: ['id', 'yarnCount_name']
                }
            ],
            group: ['yarn_count', 'yarncount.id']
        });
        const yarn_type = await SpinSales.findAll({
            attributes: ['yarn_type'],
            where: whereCondition,
            group: ['yarn_type']
        });
        res.sendSuccess(res, { invoice, yarn_type, yarncount });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const getGarments = async (req: Request, res: Response) => {
    let weaverId = req.query.weaverId;
    if (!weaverId) {
        return res.sendError(res, 'Need Weaver Id ');
    }
    let weaver = await Weaver.findOne({ where: { id: weaverId } });
    if (!weaver) {
        return res.sendError(res, 'No Weaver Found ');
    }
    let garment = await Garment.findAll({
        attributes: ['id', 'name'],
        where: { brand: { [Op.overlap]: weaver.dataValues.brand } }
    })
    res.sendSuccess(res, garment);
}

export {
    createWeaverSales,
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
    getGarments
}