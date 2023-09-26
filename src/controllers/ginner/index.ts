import { Request, Response } from "express";
import GinProcess from "../../models/gin-process.model";
import { Sequelize, Op, where } from "sequelize";
import { generateOnlyQrCode } from "../../provider/qrcode";
import GinBale from "../../models/gin-bale.model";
import Ginner from "../../models/ginner.model";
import GinSales from "../../models/gin-sales.model";
import * as ExcelJS from "exceljs";
import * as fs from "fs";
import * as path from "path";
import Season from "../../models/season.model";
import Program from "../../models/program.model";
import BaleSelection from "../../models/bale-selection.model";
import Transaction from "../../models/transaction.model";
import Village from "../../models/village.model";
import Farmer from "../../models/farmer.model";
import State from "../../models/state.model";
import Country from "../../models/country.model";

//create Ginner Process
const createGinnerProcess = async (req: Request, res: Response) => {
    try {

        const data = {
            ginner_id: req.body.ginnerId,
            program_id: req.body.programId,
            season_id: req.body.seasonId,
            date: req.body.date,
            total_qty: req.body.totalQty,
            no_of_bales: req.body.noOfBales,
            gin_out_turn: req.body.got,
            lot_no: req.body.lotNo,
            reel_lot_no: req.body.reelLotNno,
            press_no: req.body.pressNo,
        };
        const ginprocess = await GinProcess.create(data);
        let uniqueFilename = `gin_procees_qrcode_${Date.now()}.png`;
        let aa = await generateOnlyQrCode(`Test`, uniqueFilename);
        const gin = await GinProcess.update({ qr: uniqueFilename }, {
            where: {
                id: ginprocess.id
            }
        });
        for await (const bale of req.body.bales) {
            let uniqueFilename = `gin_bale_qrcode_${Date.now()}.png`;
            let aa = await generateOnlyQrCode(`Test`, uniqueFilename);
            let baleData = {
                process_id: ginprocess.id,
                bale_no: bale.baleNo,
                weight: bale.weight,
                staple: bale.staple,
                mic: bale.mic,
                strength: bale.strength,
                trash: bale.trash,
                color_grade: bale.colorGrade,
                qr: uniqueFilename
            }
            const bales = await GinBale.create(baleData);
        }
        res.sendSuccess(res, { ginprocess });
    } catch (error: any) {
        return res.sendError(res, error.meessage);
    }
}

//fetch Ginner Process with filters
const fetchGinProcessPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { ginnerId, seasonId, programId } = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { name: { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type
            ];
        }
        if (ginnerId) {
            whereCondition.ginner_id = ginnerId;
        }
        if (seasonId) {
            whereCondition.season_id = seasonId;
        }
        if (programId) {
            whereCondition.program_id = programId;
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
            const { count, rows } = await GinProcess.findAndCountAll({
                where: whereCondition,
                include: include,
                offset: offset,
                limit: limit,
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const gin = await GinProcess.findAll({
                where: whereCondition,
                include: include,
            });
            return res.sendSuccess(res, gin);
        }
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};


//fetch Ginner Bale 
const fetchGinBale = async (req: Request, res: Response) => {
    try {
        //fetch data with process id
        const gin = await GinBale.findAll({
            where: {
                process_id: req.query.processId
            },
            include: [
                {
                    model: GinProcess,
                    as: "ginprocess"
                }
            ],
        });
        return res.sendSuccess(res, gin);

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};


const chooseCotton = async (req: Request, res: Response) => {
    try {
        let ginnerid = req.query.ginnerId;
        let programId = req.query.programId;
        if (!ginnerid) {
            return res.sendError(res, 'Need Ginner Id')
        }
        if (!programId) {
            return res.sendError(res, 'Need Program Id')
        }
        let villageId: any = req.query.villageId
        let whereCondition: any = {
            status: 'Sold',
            qty_stock: {
                [Op.gt]: 0
            },
            mapped_ginner: ginnerid,
            program_id: programId
        };

        if (villageId) {
            const idArray: number[] = villageId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.village_id = { [Op.in]: idArray };
        }

        const result = await Transaction.findAll({
            attributes: [
                [
                    Sequelize.fn("SUM", Sequelize.col("qty_stock")),
                    "qty_stock",
                ],
                [
                    Sequelize.fn("SUM", Sequelize.col("qty_stock")),
                    "qty_used",
                ],
                [Sequelize.col('village.id'), 'vlg_id'],
            ],
            include: [
                { model: Village, as: 'village' },
                { model: Program, as: 'program' },
            ],
            where: whereCondition,
            group: ['village.id', 'program.id', 'transactions.id'],
            order: [
                ['id', 'DESC'],
                [Sequelize.col('accept_date'), 'DESC']
            ]
        });
        res.sendSuccess(res, result);
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

            const transaction = await Transaction.update(data, {
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

//Export the Ginner Sales details through excel file
const exportGinnerSales = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "lint-sale.xlsx");

    try {
        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:J1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Lint Sale';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Season",
            "Invoice No", "Sold To", "No of Bales", "Bale Lot", "Bale/press No",
            "REEL Lot No", "Program"
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
            where: { ginner_id: req.query.ginnerId },
            include: include,
        });
        // Append data to worksheet
        for await (const [index, item] of gin.entries()) {

            const rowValues = Object.values({
                index: index + 1,
                date: item.date ? item.date : '',
                season: item.season ? item.season.name : '',
                invoice: item.invoice_no ? item.invoice_no : '',
                buyer: item.buyer ? item.buyer : '',
                no_of_bales: item.no_of_bales ? item.no_of_bales : '',
                lot_no: item.lot_no ? item.lot_no : '',
                press_no: item.press_no ? item.press_no : '',
                reel_lot_no: item.reel_lot_no ? item.reel_lot_no : '',
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
            column.width = Math.min(40, maxCellLength + 2); // Limit width to 30 characters
        });

        // Save the workbook
        await workbook.xlsx.writeFile(excelFilePath);
        res.status(200).send({
            success: true,
            messgage: "File successfully Generated",
            data: process.env.BASE_URL + "lint-sale.xlsx",
        });
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);

    }
};


//create Ginner Sale
const createGinnerSales = async (req: Request, res: Response) => {
    try {
        let uniqueFilename = `gin_sales_qrcode_${Date.now()}.png`;
        let aa = await generateOnlyQrCode(`Test`, uniqueFilename);
        const data = {
            ginner_id: req.body.ginnerId,
            program_id: req.body.programId,
            season_id: req.body.seasonId,
            date: req.body.date,
            total_qty: req.body.totalQty,
            no_of_bales: req.body.noOfBales,
            choosen_bale: req.body.choosenBale,
            lot_no: req.body.lotNo,
            buyer: req.body.buyer,
            shipping_address: req.body.shippingAddress,
            transaction_via_trader: req.body.transactionViaTrader,
            transaction_agent: req.body.transactionAgent,
            candy_rate: req.body.candyRate,
            rate: req.body.rate,
            reel_lot_no: req.body.reelLotNno,
            despatch_from: req.body.despatchFrom,
            press_no: req.body.pressNo,
            status: 'To be Submitted',
            qty_stock: req.body.totalQty,
            qr: uniqueFilename
        };
        const ginSales = await GinSales.create(data);
        for await (const bale of req.body.bales) {
            let baleData = {
                sales_id: ginSales.id,
                bale_id: bale
            }
            const bales = await BaleSelection.create(baleData);
        }
        res.sendSuccess(res, { ginSales });
    } catch (error: any) {
        console.error(error)
        return res.sendError(res, error.meessage);
    }
}


//update Ginner Sale
const updateGinnerSales = async (req: Request, res: Response) => {
    try {
        const data = {
            status: 'Pending for QR scanning',
            weight_loss: req.body.weightLoss,
            sale_value: req.body.saleValue,
            invoice_no: req.body.invoiceNo,
            tc_file: req.body.tcFile,
            contract_file: req.body.contractFile,
            invoice_file: req.body.invoiceFile,
            delivery_notes: req.body.deliveryNotes,
            transporter_name: req.body.transporterName,
            vehicle_no: req.body.vehicleNo,
            lrbl_no: req.body.lrblNo
        };
        const ginSales = await GinSales.update(data, { where: { id: req.body.id } });

        res.sendSuccess(res, { ginSales });
    } catch (error: any) {
        return res.sendError(res, error.meessage);
    }
}


//fetch Ginner Process with filters
const fetchGinSalesPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { ginnerId, seasonId, programId } = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { name: { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type
            ];
        }
        if (ginnerId) {
            whereCondition.ginner_id = ginnerId;
        }
        if (seasonId) {
            whereCondition.season_id = seasonId;
        }
        if (programId) {
            whereCondition.program_id = programId;
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
                offset: offset,
                limit: limit,
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const gin = await GinSales.findAll({
                where: whereCondition,
                include: include,
            });
            return res.sendSuccess(res, gin);
        }
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

//fetch Ginner Bale 
const fetchGinSaleBale = async (req: Request, res: Response) => {
    try {
        //fetch data with process id
        const gin = await BaleSelection.findAll({
            where: {
                sales_id: req.query.saleId
            },
            include: [
                {
                    model: GinBale,
                    as: "bale"
                },
                {
                    model: GinSales,
                    as: "sales"
                }
            ],
        });
        return res.sendSuccess(res, gin);

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const dashboardGraphWithProgram = async (req: Request, res: Response) => {
    try {
        let whereCondition: any = {}
        whereCondition.ginner_id = req.query.ginnerId;
        whereCondition.status = 'Sold';

        const trans = await Transaction.findAll({
            where: {
                mapped_ginner: req.query.ginnerId,
                status: 'Sold'
            },
            attributes: [
                [
                    Sequelize.fn("SUM", Sequelize.literal("CAST(qty_purchased AS INTEGER)")),
                    "totalPurchased",
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
        res.sendSuccess(res, { trans, gin });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const getReelBaleId = async (req: Request, res: Response) => {
    try {
        let whereCondition: any = {}
        let ginnerId = req.query.ginnerId;
        whereCondition.status = 'Sold';
        let count = await GinProcess.findOne({
            attributes: [
                [Sequelize.fn('COUNT', Sequelize.col('gin_process.id')), 'balecount']
            ],
            include: [
                {
                    model: Program,
                    attributes: [],
                    as: 'program',
                    where: { program_name: { [Op.iLike]: 'Reel' } },
                }
            ],
            where: {
                ginner_id: req.query.ginnerId,
            },
            group: ['gin_process.id']
        })

        const result = await Ginner.findOne({
            attributes: [
                [
                    Sequelize.fn(
                        'concat',
                        'BL-REE',
                        Sequelize.fn('upper', Sequelize.fn('left', Sequelize.col('country.county_name'), 2)),
                        Sequelize.fn('upper', Sequelize.fn('left', Sequelize.col('state.state_name'), 2)),
                        Sequelize.fn('upper', Sequelize.col('short_name'))
                    ),
                    'idprefix'
                ]
            ],
            include: [
                {
                    model: State,
                    as: 'state'
                },
                {
                    model: Country,
                    as: 'country'
                }
            ],
            where: { id: ginnerId } // Assuming prscr_id is a variable with the desired ID
        });
        var baleid_prefix = result.dataValues.idprefix ? result.dataValues.idprefix : '';
        var prcs_date = new Date().toLocaleDateString().replace(/\//g, '');
        var bale_no = count ? (Number(count.dataValues.balecount) + 1) : 1;
        var reelbale_id = baleid_prefix + prcs_date + '/' + String(bale_no);
        res.sendSuccess(res, { id: reelbale_id });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const getProgram = async (req: Request, res: Response) => {
    try {
        if (!req.query.ginnerId) {
            return res.sendError(res, 'Need Knitter Id');
        }

        let ginnerId = req.query.ginnerId;
        let result = await Ginner.findOne({ where: { id: ginnerId } });

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

export {
    createGinnerProcess,
    fetchGinProcessPagination,
    fetchGinBale,
    createGinnerSales,
    fetchGinSalesPagination,
    exportGinnerSales,
    updateGinnerSales,
    fetchGinSaleBale,
    chooseCotton,
    updateTransactionStatus,
    dashboardGraphWithProgram,
    getReelBaleId,
    getProgram
}