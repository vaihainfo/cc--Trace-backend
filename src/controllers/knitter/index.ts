import { Request, Response } from "express";
import { Sequelize, Op, where } from "sequelize";
import { encrypt, generateOnlyQrCode } from "../../provider/qrcode";
import * as ExcelJS from "exceljs";
import * as fs from "fs";
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

//create knitter Sale
const createKnitterrSales = async (req: Request, res: Response) => {
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

        const data = {
            knitter_id: req.body.knitterId,
            program_id: req.body.programId,
            season_id: req.body.seasonId,
            date: req.body.date,
            order_ref: req.body.orderRef,
            buyer_type: req.body.buyerType,
            buyer_id: req.body.buyerId,
            processor_name: req.body.processorName,
            processor_address: req.body.processorAddress,
            yarnQty: req.body.yarnQty,
            additional_yarn_qty: req.body.additionalYarnQty,
            blend_choose: req.body.blendChoosen,
            cottonmix_type: req.body.cottonmixType,
            cottonmix_qty: req.body.cottonmixQty,
            total_yarn_qty: req.body.totalYarnQty,
            transaction_via_trader: req.body.transactionViaTrader,
            transaction_agent: req.body.transactionAgent,
            fabric_type: req.body.fabricType,
            fabric_length: req.body.fabricLength,
            fabric_gsm: req.body.fabricGsm,
            fabric_weight: req.body.fabricWeight,
            batch_lot_no: req.body.batchLotNo,
            job_details_garment: req.body.jobDetailsGarment,
            invoice_no: req.body.invoiceNo,
            bill_of_ladding: req.body.billOfLadding,
            transporter_name: req.body.transporterName,
            vehicle_no: req.body.vehicleNo,
            tc_file: req.body.tcFiles,
            contract_file: req.body.contractFile,
            invoice_file: req.body.invoiceFile,
            delivery_notes: req.body.deliveryNotes,
            qty_stock: req.body.fabricWeight,
            dyeing_required: req.body.dyeingRequired,
            dyeing_id: dyeing ? dyeing.id : null,
            status: 'Pending for QR scanning'
        };
        const kniSale = await KnitSales.create(data);
        let uniqueFilename = `knitter_sales_qrcode_${Date.now()}.png`;
        let da = encrypt(`Knitter,Sale,${kniSale.id}`);
        let aa = await generateOnlyQrCode(da, uniqueFilename);
        const gin = await KnitSales.update({ qr: uniqueFilename }, {
            where: {
                id: kniSale.id
            }
        });
        if (req.body.chooseYarn && req.body.chooseYarn.length > 0) {
            for await (let obj of req.body.chooseYarn) {
                let update = await SpinSales.update({ qty_stock: obj.totalQty - obj.qtyUsed }, { where: { id: obj.id } });
                await KnitYarnSelection.create({ yarn_id: obj.id, sales_id: kniSale.id, qty_used: obj.qtyUsed })
            }
        }
        res.sendSuccess(res, { kniSale });
    } catch (error: any) {
        return res.sendError(res, error.meessage);
    }
}

const deleteKnitterSales = async (req: Request, res: Response) => {
    try {
        if (!req.body.id) {
            return res.sendError(res, 'Need Sales Id');
        }
        let yarn_selections = await KnitYarnSelection.findAll({
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

        KnitSales.destroy({
            where: {
                id: req.body.id
            }
        });

        KnitYarnSelection.destroy({
            where: {
                sales_id: req.body.id
            }
        });
        return res.sendSuccess(res, { message: 'Successfully deleted this process' });

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

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
                { order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { fabric_length: { [Op.eq]: searchTerm } },
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
                { '$fabric.fabricType_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { fabric_gsm: { [Op.iLike]: `%${searchTerm}%` } },
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { vehicle_no: { [Op.iLike]: `%${searchTerm}%` } },
                { transaction_agent: { [Op.iLike]: `%${searchTerm}%` } },
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
            const { count, rows } = await KnitSales.findAndCountAll({
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
            const gin = await KnitSales.findAll({
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
        const rows = await KnitSales.findOne({
            where: whereCondition,
            include: include
        });
        return res.sendSuccess(res, rows);

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
                { order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { fabric_length: { [Op.eq]: searchTerm } },
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
                { '$fabric.fabricType_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { fabric_gsm: { [Op.iLike]: `%${searchTerm}%` } },
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { vehicle_no: { [Op.iLike]: `%${searchTerm}%` } },
                { transaction_agent: { [Op.iLike]: `%${searchTerm}%` } },
            ];
        }
        whereCondition.knitter_id = req.query.knitterId
        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:M1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Process/Sale';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Season", "Sold To", "Order Reference",
            "Invoice No", "Finished Batch/Lot No",
            "Job details from garment", "Knit Fabric Type", "Finished Fabric Length in Mts", "Finished Fabric GSM", "Finished Fabric Net Weight (Kgs)",
            "Transcation via trader"
        ]);
        headerRow.font = { bold: true };
        let include = [

            {
                model: Season,
                as: "season",
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
        ];;
        const weaver = await KnitSales.findAll({
            where: whereCondition,
            include: include
        });
        // Append data to worksheet
        for await (const [index, item] of weaver.entries()) {

            const rowValues = Object.values({
                index: index + 1,
                date: item.date ? item.date : '',
                season: item.season ? item.season.name : '',
                buyer: item.buyer ? item.buyer.name : item.processor_name,
                order: item.order_ref ? item.order_ref : '',
                invoice: item.invoice_no ? item.invoice_no : '',
                lotNo: item.batch_lot_no ? item.batch_lot_no : '',
                garment: item.job_details_garment ? item.job_details_garment : '',
                fabrictype: item.fabric ? item.fabric.fabricType_name : '',
                length: item.fabric_length ? item.fabric_length : '',
                fabric_gsm: item.fabric_gsm ? item.fabric_gsm : '',
                fabric_weight: item.fabric_weight ? item.fabric_weight : '',
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
            data: process.env.BASE_URL + "knitter-sale.xlsx",
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
    const { knitterId, status, filter, programId, spinnerId, invoice, lotNo, yarnCount, yarnType }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (!knitterId) {
            return res.sendError(res, 'Need Knitter Id ');
        }
        if (!status) {
            return res.sendError(res, 'Need  status');
        }
        if (searchTerm) {
            whereCondition[Op.or] = [
                { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } }, // Search by 
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } }, // Search by
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by program
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$spinner.name$': { [Op.iLike]: `%${searchTerm}%` } }// Search by crop Type
            ];
        }
        if (status === 'Pending' || status === 'Sold') {
            whereCondition.knitter_id = knitterId
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
            },
            {
                model: YarnCount,
                as: "yarncount"
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

//update knitter transactions to accept and reject
const updateStatusKnitterSale = async (req: Request, res: Response) => {
    try {
        let update = [];
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

//count the number of bales and total quantity stock With Program
const countCottonBaleWithProgram = async (req: Request, res: Response) => {
    try {
        if (!req.query.knitterId) {
            return res.sendError(res, 'Need knitter Id');
        }
        let whereCondition: any = {}
        whereCondition.knitter_id = req.query.knitterId;
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

        let data = await KnitSales.findAll({
            where: {
                knitter_id: req.query.knitterId
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
                },
                {
                    model: Program,
                    as: "program",
                    attributes: ["id", "program_name"],
                }
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
            return res.sendError(res, 'Need Knitter Id');
        }

        let knitterId = req.query.knitterId;
        let result = await Knitter.findOne({ where: { id: knitterId } });

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

const getSpinnerAndProgram = async (req: Request, res: Response) => {
    const { knitterId, status, filter, programId, spinnerId }: any = req.query;
    const whereCondition: any = {};
    try {
        if (!knitterId) {
            return res.sendError(res, 'Need Knitter Id ');
        }
        if (!status) {
            return res.sendError(res, 'Need  status');
        }

        if (status === 'Pending' || status === 'Sold') {
            whereCondition.knitter_id = knitterId
            whereCondition.status = status === 'Pending' ? 'Pending for QR scanning' : 'Sold';
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
        const program = await SpinSales.findAll({
            attributes: ['program_id', 'program.program_name'],
            where: whereCondition,
            include: [
                {
                    model: Program,
                    as: 'program',
                    attributes: ['id', 'program_name']
                }
            ],
            group: ['program_id', "program.id"]
        });
        res.sendSuccess(res, { spinner, program });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const getInvoiceAndyarnType = async (req: Request, res: Response) => {
    const { knitterId, status, spinnerId }: any = req.query;
    const whereCondition: any = {};
    try {
        if (!knitterId) {
            return res.sendError(res, 'Need Knitter Id ');
        }
        if (!status) {
            return res.sendError(res, 'Need  status');
        }

        if (status === 'Pending' || status === 'Sold') {
            whereCondition.knitter_id = knitterId
            whereCondition.status = status === 'Pending' ? 'Pending for QR scanning' : 'Sold';
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
    let knitterId = req.query.knitterId;
    if (!knitterId) {
        return res.sendError(res, 'Need Knitter Id ');
    }
    let ress = await Knitter.findOne({ where: { id: knitterId } });
    if (!ress) {
        return res.sendError(res, 'No Knitter Found ');
    }
    let garment = await Garment.findAll({
        attributes: ['id', 'name'],
        where: { brand: { [Op.overlap]: ress.dataValues.brand } }
    })
    res.sendSuccess(res, garment);
}

export {
    createKnitterrSales,
    fetchKnitterSalesPagination,
    fetchKnitterDashBoard,
    countCottonBaleWithProgram,
    updateStatusKnitterSale,
    exportKnitterSale,
    getProgram,
    getSpinnerAndProgram,
    getInvoiceAndyarnType,
    deleteKnitterSales,
    getGarments,
    fetchKnitterSale
}