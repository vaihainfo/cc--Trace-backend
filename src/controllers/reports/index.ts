import { Op, Sequelize } from "sequelize";
import { Request, Response } from "express";
import GinProcess from "../../models/gin-process.model";
import GinBale from "../../models/gin-bale.model";
import Season from "../../models/season.model";
import Program from "../../models/program.model";
import Ginner from "../../models/ginner.model";
import CottonSelection from "../../models/cotton-selection.model";
import Transaction from "../../models/transaction.model";
import Village from "../../models/village.model";
import sequelize from "../../util/dbConn";
import * as ExcelJS from "exceljs";
import * as fs from "fs";
import * as path from "path";
import GinSales from "../../models/gin-sales.model";
import Spinner from "../../models/spinner.model";
import YarnCount from "../../models/yarn-count.model";
import SpinProcess from "../../models/spin-process.model";
import CottonMix from "../../models/cotton-mix.model";
import SpinSales from "../../models/spin-sales.model";
import Weaver from "../../models/weaver.model";
import Knitter from "../../models/knitter.model";
import FabricType from "../../models/fabric-type.model";
import Garment from "../../models/garment.model";
import KnitSales from "../../models/knit-sales.model";
import WeaverSales from "../../models/weaver-sales.model";
import GarmentSales from "../../models/garment-sales.model";
import Brand from "../../models/brand.model";
import Department from "../../models/department.model";
import BaleSelection from "../../models/bale-selection.model";
import Farm from "../../models/farm.model";
import FabricSelection from "../../models/fabric-selections.model";
import YarnSelection from "../../models/yarn-seletions.model";
import KnitYarnSelection from "../../models/knit-yarn-seletions.model";
import LintSelections from "../../models/lint-seletions.model";
import SpinProcessYarnSelection from "../../models/spin-process-yarn-seletions.model";
import GinnerExpectedCotton from "../../models/ginner-expected-cotton.model";
import GinnerOrder from "../../models/ginner-order.model";
import State from "../../models/state.model";
import QualityParameter from "../../models/quality-parameter.model";

const fetchBaleProcess = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { ginnerId, seasonId, programId, brandId, countryId }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { "$ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
                { lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { press_no: { [Op.iLike]: `%${searchTerm}%` } },
            ];

        }

        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));

            whereCondition['$ginner.brand$'] = { [Op.overlap]: idArray };
        }

        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.season_id = { [Op.in]: idArray };
        }

        if (ginnerId) {
            const idArray: number[] = ginnerId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.ginner_id = { [Op.in]: idArray };
        }
        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$ginner.country_id$'] = { [Op.in]: idArray };
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
        const { count, rows } = await GinProcess.findAndCountAll({
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
        let sendData: any = [];
        for await (let row of rows) {
            let cotton = await CottonSelection.findAll({ attributes: ['transaction_id'], where: { process_id: row.dataValues.id } });
            let village = [];
            if (cotton.length > 0) {
                village = await Transaction.findAll({
                    attributes: ['village_id'],
                    where: {
                        id: cotton.map((obj: any) => obj.dataValues.transaction_id)
                    },
                    include: [
                        {
                            model: Village,
                            as: 'village',
                            attributes: ['id', 'village_name']
                        }
                    ],
                    group: ['village_id', "village.id"]
                })


            }
            let bale = await GinBale.findOne({
                attributes: [
                    [Sequelize.fn("SUM", Sequelize.literal("CAST(weight AS INTEGER)")),
                        "lint_quantity",],
                    [sequelize.fn('min', sequelize.col('bale_no')), 'pressno_from'],
                    [sequelize.fn('max', sequelize.col('bale_no')), 'pressno_to'],
                ],
                where: { process_id: row.dataValues.id }
            });

            let soldBales = await GinBale.count({
                where: { process_id: row.dataValues.id, sold_status: true }
            });

            let soldLint = await GinBale.findOne({
                attributes: [
                    [Sequelize.fn("SUM", Sequelize.literal("CAST(weight AS INTEGER)")),
                        "lint_quantity_sold",],
                ],
                where: { process_id: row.dataValues.id, sold_status: true }
            });

            let lintStock = Number(bale.dataValues.lint_quantity) - Number(soldLint?.dataValues?.lint_quantity_sold);
            let balesStock = Number(row.dataValues?.no_of_bales) - Number(soldBales);

            sendData.push({
                ...row.dataValues, village: village,
                gin_press_no: (bale.dataValues.pressno_from || '') + "-" + (bale.dataValues.pressno_to || ''),
                lint_quantity: bale.dataValues.lint_quantity,
                reel_press_no: row.dataValues.no_of_bales === 0 ? "" : `001-${(row.dataValues.no_of_bales < 9) ? `00${row.dataValues.no_of_bales}` : (row.dataValues.no_of_bales < 99) ? `0${row.dataValues.no_of_bales}` : row.dataValues.no_of_bales}`,
                lint_quantity_sold: soldLint?.dataValues?.lint_quantity_sold,
                sold_bales: soldBales,
                lint_stock: lintStock && lintStock > 0 ? lintStock : 0,
                bale_stock: balesStock && balesStock > 0 ? balesStock : 0,
            })
        }
        return res.sendPaginationSuccess(res, sendData, count);

    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
}

const exportGinnerProcess = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "gin-bale-process.xlsx");
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { ginnerId, seasonId, programId, brandId, countryId }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { "$ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
                { lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { press_no: { [Op.iLike]: `%${searchTerm}%` } },
            ];

        }

        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$ginner.brand$'] = { [Op.overlap]: idArray };
        }

        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.season_id = { [Op.in]: idArray };
        }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$ginner.country_id$'] = { [Op.in]: idArray };
        }

        if (ginnerId) {
            const idArray: number[] = ginnerId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.ginner_id = { [Op.in]: idArray };
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
        worksheet.mergeCells('A1:T1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Ginner Bale Process Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Process Date", "Data Entry Date", "Season", "Ginner Name", "Heap Number", "Gin Lot No", "Gin Press No", "REEL Lot No", "REEL Process Nos", "No of Bales", "Lint Quantity(Kgs)", "Total Seed Cotton Consumed(Kgs)", "GOT", "Total lint cotton sold(Kgs)", "Total Bales Sold","Total lint cotton in stock(Kgs)", "Total Bales in stock", "Program", "Village"
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
        const { count, rows } = await GinProcess.findAndCountAll({
            where: whereCondition,
            include: include,
            offset: offset,
            limit: limit,
        });
        // Append data to worksheet
        for await (const [index, item] of rows.entries()) {
            let cotton = await CottonSelection.findAll({ attributes: ['transaction_id'], where: { process_id: item.id } });
            let village = [];
            if (cotton.length > 0) {
                village = await Transaction.findAll({
                    attributes: ['village_id'],
                    where: {
                        id: cotton.map((obj: any) => obj.dataValues.transaction_id)
                    },
                    include: [
                        {
                            model: Village,
                            as: 'village',
                            attributes: ['id', 'village_name']
                        }
                    ],
                    group: ['village_id', "village.id"]
                })


            }
            let bale = await GinBale.findOne({
                attributes: [
                    [Sequelize.fn("SUM", Sequelize.literal("CAST(weight AS INTEGER)")),
                        "lint_quantity",],
                    [sequelize.fn('min', sequelize.col('bale_no')), 'pressno_from'],
                    [sequelize.fn('max', sequelize.col('bale_no')), 'pressno_to']
                ],
                where: { process_id: item.id }
            });

            let soldBales = await GinBale.count({
                where: { process_id: item.id, sold_status: true }
            });

            let soldLint = await GinBale.findOne({
                attributes: [
                    [Sequelize.fn("SUM", Sequelize.literal("CAST(weight AS INTEGER)")),
                        "lint_quantity_sold",],
                ],
                where: { process_id: item.id, sold_status: true }
            });

            let lintStock = Number(bale.dataValues.lint_quantity) - Number(soldLint?.dataValues?.lint_quantity_sold);
            let balesStock = Number(item?.no_of_bales) - Number(soldBales);

            let reel_press_no = item.no_of_bales === 0 ? "" : `001-${(item.no_of_bales < 9) ? `00${item.no_of_bales}` : (item.no_of_bales < 99) ? `0${item.no_of_bales}` : item.no_of_bales}`

            const rowValues = Object.values({
                index: index + 1,
                date: item.date ? item.date : '',
                created_date: item.createdAt ? item.createdAt : '',
                season: item.season ? item.season.name : '',
                ginner: item.ginner ? item.ginner.name : '',
                heap: "",
                lot_no: item.lot_no ? item.lot_no : '',
                press_no: item.press_no ? item.press_no : '',
                reel_lot_no: item.reel_lot_no ? item.reel_lot_no : '',
                process_no: reel_press_no ? reel_press_no : "-",
                noOfBales: item.no_of_bales ? item.no_of_bales : 0,
                lint_qty: bale.dataValues.lint_quantity ? bale.dataValues.lint_quantity : 0,
                seedConsmed: item.total_qty ? item.total_qty : '',
                got: item.gin_out_turn ? item.gin_out_turn : '',
                lint_quantity_sold: soldLint.dataValues?.lint_quantity_sold ? soldLint.dataValues?.lint_quantity_sold : 0,
                sold_bales: soldBales,
                lint_stock: lintStock && lintStock > 0 ? lintStock : 0,
                bale_stock: balesStock && balesStock > 0 ? balesStock : 0,
                program: item.program ? item.program.program_name : '',
                village: village.length > 0 ? village.map((obj: any) => obj.village.village_name).join(',') : '',
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
            column.width = Math.min(15, maxCellLength + 2); // Limit width to 30 characters
        });

        // Save the workbook
        await workbook.xlsx.writeFile(excelFilePath);
        res.status(200).send({
            success: true,
            messgage: "File successfully Generated",
            data: process.env.BASE_URL + "gin-bale-process.xlsx",
        });
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);

    }
};

const fetchPendingGinnerSales = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status || 'To be Submitted';
    const { ginnerId, seasonId, programId, brandId, countryId }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { "$ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
                { lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { press_no: { [Op.iLike]: `%${searchTerm}%` } },
            ];

        }
        if (ginnerId) {
            const idArray: number[] = ginnerId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.ginner_id = { [Op.in]: idArray };
        }
        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$ginner.brand$'] = { [Op.overlap]: idArray };
        }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$ginner.country_id$'] = { [Op.in]: idArray };
        }

        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.season_id = { [Op.in]: idArray };
        }
        if (status === 'To be Submitted') {
            whereCondition.status = 'To be Submitted';
        } else {
            whereCondition.status = { [Op.ne]: 'To be Submitted' };
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
                attributes: ['id', 'name', 'country_id', 'brand']
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
                model: Spinner,
                as: "buyerdata",
                attributes: ['id', 'name']
            }
        ];
        //fetch data with pagination

        const { count, rows } = await GinSales.findAndCountAll({
            where: whereCondition,
            include: include,
            offset: offset,
            limit: limit,
        });
        return res.sendPaginationSuccess(res, rows, count);

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const exportPendingGinnerSales = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "Ginner-pending-sales-report.xlsx");
    const searchTerm = req.query.search || "";
    const status = req.query.status || 'To be Submitted';
    const { ginnerId, seasonId, programId, brandId, countryId }: any = req.query;
    const whereCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { "$ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$buyerdata.name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
                { lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
                { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { press_no: { [Op.iLike]: `%${searchTerm}%` } },
            ];

        }
        if (ginnerId) {
            const idArray: number[] = ginnerId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.ginner_id = { [Op.in]: idArray };
        }
        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$ginner.brand$'] = { [Op.overlap]: idArray };
        }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$ginner.country_id$'] = { [Op.in]: idArray };
        }

        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.season_id = { [Op.in]: idArray };
        }
        whereCondition.status = 'To be Submitted';

        if (programId) {
            const idArray: number[] = programId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.program_id = { [Op.in]: idArray };
        }

        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:M1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Ginner Pending Sales Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Season", "Ginner Name",
            "Invoice No", "Sold To", "Bale Lot No", "REEL Lot No", "No of Bales", "Press/Bale No", "Rate/Kg",
            "Total Quantity", "Program", "status"
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
            },
            {
                model: Spinner,
                as: "buyerdata",
                attributes: ['id', 'name']
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
                buyer: item.buyerdata ? item.buyerdata.name : '',
                lot_no: item.lot_no ? item.lot_no : '',
                reel_lot_no: item.reel_lot_no ? item.reel_lot_no : '',
                no_of_bales: item.no_of_bales ? item.no_of_bales : '',
                press_no: item.press_no ? item.press_no : '',
                rate: item.rate ? item.rate : '',
                total_qty: item.total_qty ? item.total_qty : '',
                program: item.program ? item.program.program_name : '',
                status: item.status ? item.status : ''
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
            data: process.env.BASE_URL + "Ginner-pending-sales-report.xlsx",
        });
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);

    }
};

const fetchGinSalesPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { ginnerId, seasonId, programId, brandId, countryId }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { "$sales.ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$sales.buyerdata.name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$sales.season.name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$sales.program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$bale.ginprocess.lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$bale.ginprocess.reel_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$sales.press_no$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$sales.invoice_no$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$sales.vehicle_no$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$sales.transporter_name$": { [Op.iLike]: `%${searchTerm}%` } },
            ];

        }
        if (ginnerId) {
            const idArray: number[] = ginnerId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$sales.ginner_id$'] = { [Op.in]: idArray };
        }
        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$sales.ginner.brand$'] = { [Op.overlap]: idArray };
        }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$sales.ginner.country_id$'] = { [Op.in]: idArray };
        }

        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$sales.season_id$'] = { [Op.in]: idArray };
        }

            whereCondition['$sales.status$'] = { [Op.ne]: 'To be Submitted' };


        if (programId) {
            const idArray: number[] = programId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$sales.program_id$'] = { [Op.in]: idArray };
        }

        let include = [
            {
                model: Ginner,
                as: "ginner",
                attributes: []
            },
            {
                model: Season,
                as: "season",
                attributes: []
            },
            {
                model: Program,
                as: "program",
                attributes: []
            },
            {
                model: Spinner,
                as: "buyerdata",
                attributes: []
            }
        ];
        //fetch data with pagination
        const nData: any = [];

        const rows: any = await BaleSelection.findAll({
            attributes:[
                [Sequelize.literal('"sales"."id"'), 'sales_id'],
                [Sequelize.literal('"sales"."date"'), 'date'],
                [Sequelize.literal('"sales"."createdAt"'), 'createdAt'],
                [Sequelize.col('"sales"."season"."name"'), 'season_name'],
                [Sequelize.col('"sales"."ginner"."id"'), 'ginner_id'],
                [Sequelize.col('"sales"."ginner"."name"'), 'ginner'],
                [Sequelize.col('"sales"."program"."program_name"'), 'program'],
                [Sequelize.col('"sales"."buyerdata"."name"'), 'buyerdata'],
                [Sequelize.literal('"sales"."total_qty"'), 'total_qty'],
                [Sequelize.literal('"sales"."invoice_no"'), 'invoice_no'],
                [Sequelize.col('"bale"."ginprocess"."id"'), 'process_id'],
                [Sequelize.col('"bale"."ginprocess"."lot_no"'), 'lot_no'],
                [Sequelize.col('"bale"."ginprocess"."reel_lot_no"'), 'reel_lot_no'],
                [Sequelize.literal('"sales"."rate"'), 'rate'],
                [Sequelize.literal('"sales"."candy_rate"'), 'candy_rate'],
                [Sequelize.fn("SUM", Sequelize.literal('CAST("bale"."weight" AS INTEGER)')),
                "lint_quantity"],
                [Sequelize.fn('COUNT', Sequelize.literal('DISTINCT bale_id')), 'no_of_bales'],
                [Sequelize.literal('"sales"."sale_value"'), 'sale_value'],
                [Sequelize.literal('"sales"."press_no"'), 'press_no'],
                [Sequelize.literal('"sales"."qty_stock"'), 'qty_stock'],
                [Sequelize.literal('"sales"."weight_loss"'), 'weight_loss'],
                [Sequelize.literal('"sales"."invoice_file"'), 'invoice_file'],
                [Sequelize.literal('"sales"."vehicle_no"'), 'vehicle_no'],
                [Sequelize.literal('"sales"."transporter_name"'), 'transporter_name'],
                [Sequelize.literal('"sales"."transaction_agent"'), 'transaction_agent'],
                [Sequelize.literal('"sales"."status"'), 'status'],
        ],
            where: whereCondition,
            include: [{
                model: GinSales,
                as: "sales",
                include: include,
                attributes:[]
            },{
                model: GinBale,
                attributes:[],
                as: "bale",
                include: [{
                    model: GinProcess,
                    as: "ginprocess",
                    attributes:[]
                }] 
            }],
            group:['bale.process_id','bale.ginprocess.id','sales.id',"sales.season.id","sales.ginner.id","sales.buyerdata.id","sales.program.id"],
            order :[
                ['sales_id',"desc"]
            ],
        })

        for await (let item of rows){
            let qualityReport = await QualityParameter.findOne({
                where:{
                    process_id: item?.dataValues?.process_id,
                    ginner_id: item?.dataValues?.ginner_id,
                    lot_no: item?.dataValues?.lot_no,
                }
            });

            nData.push({
                ...item.dataValues,
                quality_report: qualityReport ? qualityReport : null
            })
        }

        let result = nData.flat();
            // Apply pagination to the combined result
        let data = result.slice(offset, offset + limit);

        return res.sendPaginationSuccess(res, data, rows.length);

    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
};

const exportGinnerSales = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "Ginner-sales-report.xlsx");
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { ginnerId, seasonId, programId, brandId, countryId }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { "$sales.ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$sales.buyerdata.name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$sales.season.name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$sales.program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$bale.ginprocess.lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$bale.ginprocess.reel_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$sales.press_no$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$sales.invoice_no$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$sales.vehicle_no$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$sales.transporter_name$": { [Op.iLike]: `%${searchTerm}%` } },
            ];

        }
        if (ginnerId) {
            const idArray: number[] = ginnerId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$sales.ginner_id$'] = { [Op.in]: idArray };
        }
        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$sales.ginner.brand$'] = { [Op.overlap]: idArray };
        }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$sales.ginner.country_id$'] = { [Op.in]: idArray };
        }

        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$sales.season_id$'] = { [Op.in]: idArray };
        }

            whereCondition['$sales.status$'] = { [Op.ne]: 'To be Submitted' };


        if (programId) {
            const idArray: number[] = programId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$sales.program_id$'] = { [Op.in]: idArray };
        }

        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:T1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Ginner Sales Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Process Date", "Data Entry Date", "Season", "Ginner Name",
            "Invoice No", "Sold To", "Heap Number", "Bale Lot No", "REEL Lot No", "No of Bales", "Press/Bale No", "Rate/Kg",
            "Total Lint Quantity(Kgs)","Sales Value","Vehicle No", "Transporter Name", "Program", "Agent Detials", "status"
        ]);
        headerRow.font = { bold: true };
        let include = [
            {
                model: Ginner,
                as: "ginner",
                attributes: []
            },
            {
                model: Season,
                as: "season",
                attributes: []
            },
            {
                model: Program,
                as: "program",
                attributes: []
            },
            {
                model: Spinner,
                as: "buyerdata",
                attributes: []
            }
        ];
        //fetch data with pagination

        const rows: any = await BaleSelection.findAll({
            attributes:[
                [Sequelize.literal('"sales"."id"'), 'sales_id'],
                [Sequelize.literal('"sales"."date"'), 'date'],
                [Sequelize.literal('"sales"."createdAt"'), 'createdAt'],
                [Sequelize.col('"sales"."season"."name"'), 'season_name'],
                [Sequelize.col('"sales"."ginner"."name"'), 'ginner'],
                [Sequelize.col('"sales"."program"."program_name"'), 'program'],
                [Sequelize.col('"sales"."buyerdata"."name"'), 'buyerdata'],
                [Sequelize.literal('"sales"."total_qty"'), 'total_qty'],
                [Sequelize.literal('"sales"."invoice_no"'), 'invoice_no'],
                [Sequelize.col('"bale"."ginprocess"."lot_no"'), 'lot_no'],
                [Sequelize.col('"bale"."ginprocess"."reel_lot_no"'), 'reel_lot_no'],
                [Sequelize.literal('"sales"."rate"'), 'rate'],
                [Sequelize.literal('"sales"."candy_rate"'), 'candy_rate'],
                [Sequelize.fn("SUM", Sequelize.literal('CAST("bale"."weight" AS INTEGER)')),
                "lint_quantity"],
                [Sequelize.fn('COUNT', Sequelize.literal('DISTINCT bale_id')), 'no_of_bales'],
                [Sequelize.literal('"sales"."sale_value"'), 'sale_value'],
                [Sequelize.literal('"sales"."press_no"'), 'press_no'],
                [Sequelize.literal('"sales"."qty_stock"'), 'qty_stock'],
                [Sequelize.literal('"sales"."weight_loss"'), 'weight_loss'],
                [Sequelize.literal('"sales"."invoice_file"'), 'invoice_file'],
                [Sequelize.literal('"sales"."vehicle_no"'), 'vehicle_no'],
                [Sequelize.literal('"sales"."transporter_name"'), 'transporter_name'],
                [Sequelize.literal('"sales"."transaction_agent"'), 'transaction_agent'],
                [Sequelize.literal('"sales"."status"'), 'status'],
        ],
            where: whereCondition,
            include: [{
                model: GinSales,
                as: "sales",
                include: include,
                attributes:[]
            },{
                model: GinBale,
                attributes:[],
                as: "bale",
                include: [{
                    model: GinProcess,
                    as: "ginprocess",
                    attributes:[]
                }] 
            }],
            group:['bale.process_id','bale.ginprocess.id','sales.id',"sales.season.id","sales.ginner.id","sales.buyerdata.id","sales.program.id"],
            order :[
                ['sales_id',"desc"]
            ],
        })

        let result = rows.flat();
            // Apply pagination to the combined result
        let data = rows.slice(offset, offset + limit);

        // Append data to worksheet
        for await (const [index, item] of data.entries()) {
            const rowValues = Object.values({
                index: index + 1,
                date: item.dataValues.date ? item.dataValues.date : '',
                created_at: item.dataValues.createdAt ? item.dataValues.createdAt : '',
                season: item.dataValues.season_name ? item.dataValues.season_name : '',
                ginner: item.dataValues.ginner ? item.dataValues.ginner : '',
                invoice: item.dataValues.invoice_no ? item.dataValues.invoice_no : '',
                buyer: item.dataValues.buyerdata ? item.dataValues.buyerdata : '',
                heap:'',
                lot_no: item.dataValues.lot_no ? item.dataValues.lot_no : '',
                reel_lot_no: item.dataValues.reel_lot_no ? item.dataValues.reel_lot_no : '',
                no_of_bales: item.dataValues.no_of_bales ? item.dataValues.no_of_bales : '',
                press_no: item.dataValues.press_no ? item.dataValues.press_no : '',
                rate: item.dataValues.rate ? item.dataValues.rate : '',
                lint_quantity: item.dataValues.lint_quantity ? item.dataValues.lint_quantity : '',
                sales_value: item.dataValues.sale_value ? item.dataValues.sale_value : '',
                vehicle_no: item.dataValues.vehicle_no ? item.dataValues.vehicle_no : '',
                transporter_name: item.dataValues.transporter_name ? item.dataValues.transporter_name : '',
                program: item.dataValues.program ? item.dataValues.program : '',
                agentDetails: item.dataValues.transaction_agent ? item.dataValues.transaction_agent : 'NA',
                status: item.dataValues.status==='Sold'? 'Sold' :`Available [Stock : ${item.dataValues.qty_stock ? item.dataValues.qty_stock : 0}]`
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
            data: process.env.BASE_URL + "Ginner-sales-report.xlsx",
        });
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);

    }
};

const fetchSpinnerBalePagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { ginnerId,spinnerId, seasonId, programId, brandId, countryId }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { "$sales.ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$sales.buyerdata.name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$sales.season.name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$sales.program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$bale.ginprocess.lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$bale.ginprocess.reel_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$sales.press_no$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$sales.invoice_no$": { [Op.iLike]: `%${searchTerm}%` } },
            ];

        }
        if (spinnerId) {
            const idArray: number[] = spinnerId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$sales.buyer$'] = { [Op.in]: idArray };
        }

        if (ginnerId) {
            const idArray: number[] = ginnerId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$sales.ginner_id$'] = { [Op.in]: idArray };
        }

        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$sales.buyerdata.brand$'] = { [Op.overlap]: idArray };
        }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$sales.buyerdata.country_id$'] = { [Op.in]: idArray };
        }

        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$sales.season_id$'] = { [Op.in]: idArray };
        }

            whereCondition['$sales.status$'] = 'Sold';


        if (programId) {
            const idArray: number[] = programId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$sales.program_id$'] = { [Op.in]: idArray };
        }

        let include = [
            {
                model: Ginner,
                as: "ginner",
                attributes: []
            },
            {
                model: Season,
                as: "season",
                attributes: []
            },
            {
                model: Program,
                as: "program",
                attributes: []
            },
            {
                model: Spinner,
                as: "buyerdata",
                attributes: []
            }
        ];
        //fetch data with pagination
        const nData: any = [];

        const rows: any = await BaleSelection.findAll({
            attributes:[
                [Sequelize.literal('"sales"."id"'), 'sales_id'],
                [Sequelize.literal('"sales"."date"'), 'date'],
                [Sequelize.literal('"sales"."accept_date"'), 'accept_date'],
                [Sequelize.col('"sales"."season"."name"'), 'season_name'],
                [Sequelize.col('"sales"."ginner"."id"'), 'ginner_id'],
                [Sequelize.col('"sales"."ginner"."name"'), 'ginner'],
                [Sequelize.col('"sales"."program"."program_name"'), 'program'],
                [Sequelize.col('"sales"."buyerdata"."id"'), 'spinner_id'],
                [Sequelize.col('"sales"."buyerdata"."name"'), 'spinner'],
                [Sequelize.literal('"sales"."total_qty"'), 'total_qty'],
                [Sequelize.literal('"sales"."invoice_no"'), 'invoice_no'],
                [Sequelize.col('"bale"."ginprocess"."id"'), 'process_id'],
                [Sequelize.col('"bale"."ginprocess"."lot_no"'), 'lot_no'],
                [Sequelize.col('"bale"."ginprocess"."reel_lot_no"'), 'reel_lot_no'],
                [Sequelize.literal('"sales"."rate"'), 'rate'],
                [Sequelize.literal('"sales"."candy_rate"'), 'candy_rate'],
                [Sequelize.fn("SUM", Sequelize.literal('CAST("bale"."weight" AS INTEGER)')),
                "lint_quantity"],
                [Sequelize.fn('COUNT', Sequelize.literal('DISTINCT bale_id')), 'no_of_bales'],
                [Sequelize.literal('"sales"."sale_value"'), 'sale_value'],
                [Sequelize.literal('"sales"."press_no"'), 'press_no'],
                [Sequelize.literal('"sales"."qty_stock"'), 'qty_stock'],
                [Sequelize.literal('"sales"."weight_loss"'), 'weight_loss'],
                [Sequelize.literal('"sales"."invoice_file"'), 'invoice_file'],
                [Sequelize.literal('"sales"."vehicle_no"'), 'vehicle_no'],
                [Sequelize.literal('"sales"."transporter_name"'), 'transporter_name'],
                [Sequelize.literal('"sales"."transaction_agent"'), 'transaction_agent'],
                [Sequelize.literal('"sales"."status"'), 'status'],
        ],
            where: whereCondition,
            include: [{
                model: GinSales,
                as: "sales",
                include: include,
                attributes:[]
            },{
                model: GinBale,
                attributes:[],
                as: "bale",
                include: [{
                    model: GinProcess,
                    as: "ginprocess",
                    attributes:[]
                }] 
            }],
            group:['bale.process_id','bale.ginprocess.id','sales.id',"sales.season.id","sales.ginner.id","sales.buyerdata.id","sales.program.id"],
            order :[
                ['sales_id',"desc"]
            ],
        })

        for await (let item of rows){
            let qualityReport = await QualityParameter.findOne({
                where:{
                    process_id: item?.dataValues?.process_id,
                    ginner_id: item?.dataValues?.ginner_id,
                    lot_no: item?.dataValues?.lot_no,
                }
            });

            nData.push({
                ...item.dataValues,
                quality_report: qualityReport ? qualityReport : null
            })
        }

        let result = nData.flat();
            // Apply pagination to the combined result
        let data = result.slice(offset, offset + limit);

        return res.sendPaginationSuccess(res, data, rows.length);

    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
};

const fetchSpinnerPendingBale = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status || 'To be Submitted';
    const { ginnerId, spinnerId, seasonId, programId, brandId, countryId }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$buyerdata.name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
                { lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
                { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { press_no: { [Op.iLike]: `%${searchTerm}%` } },
                { vehicle_no: { [Op.iLike]: `%${searchTerm}%` } },
            ];

        }
        if (spinnerId) {
            const idArray: number[] = spinnerId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.buyer = { [Op.in]: idArray };
        } else {
            whereCondition.buyer = {
                [Op.ne]: null
            }
        }

        if (ginnerId) {
            const idArray: number[] = ginnerId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.ginner_id = { [Op.in]: idArray };
        }

        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$buyerdata.brand$'] = { [Op.overlap]: idArray };
        }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$buyerdata.country_id$'] = { [Op.in]: idArray };
        }

        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.season_id = { [Op.in]: idArray };
        }

            whereCondition.total_qty = {
                [Op.gt]: 0
            }
            whereCondition.status = 'Pending for QR scanning';


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
                model: Spinner,
                as: "buyerdata",
                attributes: ['id', 'name']
            }
        ];
        //fetch data with pagination

        const { count, rows } = await GinSales.findAndCountAll({
            where: whereCondition,
            include: include,
            offset: offset,
            limit: limit,
        });
        return res.sendPaginationSuccess(res, rows, count);

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const exportSpinnerBale = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "Spinner-bale-receipt-report.xlsx");
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { ginnerId, spinnerId, seasonId, programId, brandId, countryId }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { "$sales.ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$sales.buyerdata.name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$sales.season.name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$sales.program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$bale.ginprocess.lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$bale.ginprocess.reel_lot_no$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$sales.press_no$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$sales.invoice_no$": { [Op.iLike]: `%${searchTerm}%` } },
            ];

        }
        if (spinnerId) {
            const idArray: number[] = spinnerId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$sales.buyer$'] = { [Op.in]: idArray };
        }

        if (ginnerId) {
            const idArray: number[] = ginnerId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$sales.ginner_id$'] = { [Op.in]: idArray };
        }

        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$sales.buyerdata.brand$'] = { [Op.overlap]: idArray };
        }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$sales.buyerdata.country_id$'] = { [Op.in]: idArray };
        }

        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$sales.season_id$'] = { [Op.in]: idArray };
        }

            whereCondition['$sales.status$'] = 'Sold';


        if (programId) {
            const idArray: number[] = programId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$sales.program_id$'] = { [Op.in]: idArray };
        }

        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:T1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Ginner Bale Receipt Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date of Transaction Receipt", "Date of transaction", "Season", "Spinner Name","Ginner Name",
            "Invoice Number", "Ginner Lot No", "REEL Lot No", "Press/Bale No", "No of Bales",
            "Total Lint Quantity(Kgs)","Programme"
        ]);
        headerRow.font = { bold: true };
        let include = [
            {
                model: Ginner,
                as: "ginner",
                attributes: []
            },
            {
                model: Season,
                as: "season",
                attributes: []
            },
            {
                model: Program,
                as: "program",
                attributes: []
            },
            {
                model: Spinner,
                as: "buyerdata",
                attributes: []
            }
        ];
        //fetch data with pagination

        const rows: any = await BaleSelection.findAll({
            attributes:[
                [Sequelize.literal('"sales"."id"'), 'sales_id'],
                [Sequelize.literal('"sales"."date"'), 'date'],
                [Sequelize.literal('"sales"."accept_date"'), 'accept_date'],
                [Sequelize.col('"sales"."season"."name"'), 'season_name'],
                [Sequelize.col('"sales"."ginner"."name"'), 'ginner'],
                [Sequelize.col('"sales"."program"."program_name"'), 'program'],
                [Sequelize.col('"sales"."buyerdata"."name"'), 'spinner'],
                [Sequelize.literal('"sales"."total_qty"'), 'total_qty'],
                [Sequelize.literal('"sales"."invoice_no"'), 'invoice_no'],
                [Sequelize.col('"bale"."ginprocess"."lot_no"'), 'lot_no'],
                [Sequelize.col('"bale"."ginprocess"."reel_lot_no"'), 'reel_lot_no'],
                [Sequelize.literal('"sales"."rate"'), 'rate'],
                [Sequelize.literal('"sales"."candy_rate"'), 'candy_rate'],
                [Sequelize.fn("SUM", Sequelize.literal('CAST("bale"."weight" AS INTEGER)')),
                "lint_quantity"],
                [Sequelize.fn('COUNT', Sequelize.literal('DISTINCT bale_id')), 'no_of_bales'],
                [Sequelize.literal('"sales"."sale_value"'), 'sale_value'],
                [Sequelize.literal('"sales"."press_no"'), 'press_no'],
                [Sequelize.literal('"sales"."qty_stock"'), 'qty_stock'],
                [Sequelize.literal('"sales"."weight_loss"'), 'weight_loss'],
                [Sequelize.literal('"sales"."invoice_file"'), 'invoice_file'],
                [Sequelize.literal('"sales"."vehicle_no"'), 'vehicle_no'],
                [Sequelize.literal('"sales"."transporter_name"'), 'transporter_name'],
                [Sequelize.literal('"sales"."transaction_agent"'), 'transaction_agent'],
                [Sequelize.literal('"sales"."status"'), 'status'],
        ],
            where: whereCondition,
            include: [{
                model: GinSales,
                as: "sales",
                include: include,
                attributes:[]
            },{
                model: GinBale,
                attributes:[],
                as: "bale",
                include: [{
                    model: GinProcess,
                    as: "ginprocess",
                    attributes:[]
                }] 
            }],
            group:['bale.process_id','bale.ginprocess.id','sales.id',"sales.season.id","sales.ginner.id","sales.buyerdata.id","sales.program.id"],
            order :[
                ['sales_id',"desc"]
            ],
        })

        let result = rows.flat();
            // Apply pagination to the combined result
        let data = rows.slice(offset, offset + limit);

        // Append data to worksheet
        for await (const [index, item] of data.entries()) {
            const rowValues = Object.values({
                index: index + 1,
                accept_date: item.dataValues.accept_date ? item.dataValues.accept_date : '',
                date: item.dataValues.date ? item.dataValues.date : '',
                season: item.dataValues.season_name ? item.dataValues.season_name : '',
                spinner: item.dataValues.spinner ? item.dataValues.spinner : '',
                ginner: item.dataValues.ginner ? item.dataValues.ginner : '',
                invoice: item.dataValues.invoice_no ? item.dataValues.invoice_no : '',
                lot_no: item.dataValues.lot_no ? item.dataValues.lot_no : '',
                reel_lot_no: item.dataValues.reel_lot_no ? item.dataValues.reel_lot_no : '',
                press_no: item.dataValues.press_no ? item.dataValues.press_no : '',
                no_of_bales: item.dataValues.no_of_bales ? item.dataValues.no_of_bales : '',
                lint_quantity: item.dataValues.lint_quantity ? item.dataValues.lint_quantity : '',
                program: item.dataValues.program ? item.dataValues.program : '',
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
            data: process.env.BASE_URL + "Spinner-bale-receipt-report.xlsx",
        });
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);

    }
};

const exportPendingSpinnerBale = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "Spinner-Pending-Bales-Receipt-Report.xlsx");
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const pagination = req.query.pagination;
    const { ginnerId, spinnerId, seasonId, programId, brandId, countryId }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$buyerdata.name$": { [Op.iLike]: `%${searchTerm}%` } },
                { lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
                { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { press_no: { [Op.iLike]: `%${searchTerm}%` } },
                { vehicle_no: { [Op.iLike]: `%${searchTerm}%` } },
            ];

        }
        if (spinnerId) {
            const idArray: number[] = spinnerId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.buyer = { [Op.in]: idArray };
        }

        if (ginnerId) {
            const idArray: number[] = ginnerId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.ginner_id = { [Op.in]: idArray };
        }

        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$buyerdata.brand$'] = { [Op.overlap]: idArray };
        }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$buyerdata.country_id$'] = { [Op.in]: idArray };
        }

        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.season_id = { [Op.in]: idArray };
        }
        whereCondition.total_qty = {
            [Op.gt]: 0
        }
        whereCondition.status = 'Pending for QR scanning';
        whereCondition.buyer = {
            [Op.ne]: null
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
        worksheet.mergeCells('A1:M1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Spinner Pending Bales Receipt Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Season", "Spinner Name", "Ginner Name",
            "Invoice No", "No of Bales", "Bale Lot No", "REEL Lot No",
            "Quantity(KGs)", "Actual Qty(KGs)", "Program", "Vehicle No"
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
            },
            {
                model: Spinner,
                as: "buyerdata",
                attributes: ['id', 'name']
            }
        ];
        let rows;
        if (pagination === "true") {
            rows = await GinSales.findAll({
                where: whereCondition,
                include: include,
                offset: offset,
                limit: limit
            });
            // rows = rows;
        } else {
            rows = await GinSales.findAll({
                where: whereCondition,
                include: include
            })
        }

        // Append data to worksheet
        for await (const [index, item] of rows.entries()) {
            const rowValues = Object.values({
                index: index + 1,
                date: item.date ? item.date : '',
                season: item.season ? item.season.name : '',
                buyer: item.buyerdata ? item.buyerdata.name : '',
                ginner: item.ginner ? item.ginner.name : '',
                invoice: item.invoice_no ? item.invoice_no : '',
                no_of_bales: item.no_of_bales ? item.no_of_bales : '',
                lot_no: item.lot_no ? item.lot_no : '',
                reel_lot_no: item.reel_lot_no ? item.reel_lot_no : '',
                total_qty: item.total_qty ? item.total_qty : '',
                actual_qty: item.total_qty ? item.total_qty : '',
                program: item.program ? item.program.program_name : '',
                village: item.vehicle_no ? item.vehicle_no : '',
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
            data: process.env.BASE_URL + "Spinner-Pending-Bales-Receipt-Report.xlsx",
        });
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);

    }
};


const fetchSpinnerYarnProcessPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { spinnerId, seasonId, programId, brandId, countryId }: any = req.query;
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
            const idArray: number[] = spinnerId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.spinner_id = { [Op.in]: idArray };
        }

        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$spinner.brand$'] = { [Op.overlap]: idArray };
        }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$spinner.country_id$'] = { [Op.in]: idArray };
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
                attributes: ["id","name"]
            },
            {
                model: Season,
                attributes: ["id","name"],
                as: "season",
            },
            {
                model: Program,
                as: "program",
                attributes: ["id","program_name"]
            },
            {
                model: YarnCount,
                as: "yarncount",
                attributes: ["id","yarnCount_name"]
            }
        ];
        //fetch data with pagination
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

        let sendData: any = [];
        for await (let row of rows) {
            let cottonConsumed = await LintSelections.findOne({
                attributes: [
                    [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('qty_used')), 0), 'cotton_consumed']
                ],
                where: { process_id: row.dataValues.id },
                group: ["process_id"]
            });

            let yarnSold = await SpinProcessYarnSelection.findOne({
                attributes: [
                    [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('qty_used')), 0), 'yarn_sold']
                ],
                where: { spin_process_id: row.dataValues.id },
            });

            sendData.push({
                ...row.dataValues,
                cotton_consumed: cottonConsumed ? cottonConsumed?.dataValues?.cotton_consumed : 0,
                yarn_sold: yarnSold ? yarnSold?.dataValues?.yarn_sold : 0,
                // yarn_stock: row.dataValues.net_yarn_qty ? Number(row.dataValues.net_yarn_qty) -  Number(yarnSold  ? yarnSold?.dataValues?.yarn_sold : 0) : 0,
            })


        }

        return res.sendPaginationSuccess(res, sendData, count);

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const exportSpinnerYarnProcess = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "spinner-yarn-process.xlsx");

    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { spinnerId, seasonId, programId, brandId, countryId }: any = req.query;
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
            const idArray: number[] = spinnerId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.spinner_id = { [Op.in]: idArray };
        }
        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$spinner.brand$'] = { [Op.overlap]: idArray };
        }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$spinner.country_id$'] = { [Op.in]: idArray };
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
        worksheet.mergeCells('A1:S1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Spinner Yarn Process Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Season", "Spinner Name",
            "Spin Lot No", "Yarn Reel Lot No", "Yarn Type", "Yarn Count", "Yarn Realisation %", "No of Boxes",
            "Box ID", "Comber Noil(Kgs)", "Blend Material", "Blend Quantity (Kgs)", "Total Seed cotton consumed (Kgs)","Program", "Total Yarn weight (Kgs)", "Total yarn sold (Kgs)", "Total Yarn in stock (Kgs)"
        ]);
        headerRow.font = { bold: true };
        let include = [
            {
                model: Spinner,
                as: "spinner",
                attributes: ["id","name"]
            },
            {
                model: Season,
                attributes: ["id","name"],
                as: "season",
            },
            {
                model: Program,
                as: "program",
                attributes: ["id","program_name"]
            },
            {
                model: YarnCount,
                as: "yarncount",
                attributes: ["id","yarnCount_name"]
            }
        ];

        const { count, rows } = await SpinProcess.findAndCountAll({
            where: whereCondition,
            include: include,
            order: [
                [
                    'id', 'desc'
                ]
            ],
            offset: offset,
            limit: limit
        });
        // Append data to worksheet
        for await (const [index, item] of rows.entries()) {
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

            let cottonConsumed = await LintSelections.findOne({
                attributes: [
                    [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('qty_used')), 0), 'cotton_consumed']
                ],
                where: { process_id: item.dataValues.id },
                group: ["process_id"]
            });

            let yarnSold = await SpinProcessYarnSelection.findOne({
                attributes: [
                    [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('qty_used')), 0), 'yarn_sold']
                ],
                where: { spin_process_id: item.dataValues.id },
            });

            const rowValues = Object.values({
                index: index + 1,
                date: item.date ? item.date : '',
                season: item.season ? item.season.name : '',
                spinner: item.spinner ? item.spinner.name : '',
                lotNo: item.batch_lot_no ? item.batch_lot_no : '',
                reel_lot_no: item.reel_lot_no ? item.reel_lot_no : '',
                yarnType: item.yarn_type ? item.yarn_type : '',
                count: item.yarncount ? item.yarncount.yarnCount_name : '',
                resa: item.yarn_realisation ? item.yarn_realisation : '',
                boxes: item.no_of_boxes ? item.no_of_boxes : '',
                boxId: item.box_id ? item.box_id : '',
                comber: item.comber_noil ? item.comber_noil : '',
                blend: blendValue,
                blendqty: blendqty,
                cotton_consumed: cottonConsumed ? cottonConsumed?.dataValues?.cotton_consumed : 0,
                program: item.program ? item.program.program_name : '',
                total: item.net_yarn_qty,
                yarn_sold: yarnSold ? yarnSold?.dataValues?.yarn_sold : 0,
                yarn_stock: item.qty_stock ? item.qty_stock : 0,
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
            data: process.env.BASE_URL + "spinner-yarn-process.xlsx",
        });
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);

    }
};

//fetch Spinner Sales with filters
const fetchSpinSalesPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { spinnerId, seasonId, programId, brandId, countryId }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { '$sales.spinner.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$sales.season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$sales.program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$sales.weaver.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$sales.knitter.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$sales.order_ref$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$sales.box_ids$': { [Op.iLike]: `%${searchTerm}%` } },
                {'$sales.invoice_no$' : { [Op.iLike]: `%${searchTerm}%` } },
                {'$sales.batch_lot_no$' : { [Op.iLike]: `%${searchTerm}%` } },
                {'$sales.yarn_type$' : { [Op.iLike]: `%${searchTerm}%` } },
                {'$sales.yarncount.yarnCount_name$' : { [Op.iLike]: `%${searchTerm}%` } },
                {'$sales.transporter_name$' : { [Op.iLike]: `%${searchTerm}%` } },
                {'$sales.vehicle_no$' : { [Op.iLike]: `%${searchTerm}%` } },
                {'$sales.transaction_agent$' : { [Op.iLike]: `%${searchTerm}%` } },
                {'$process.reel_lot_no$' : { [Op.iLike]: `%${searchTerm}%` } },
            ];
        }
        if (spinnerId) {
            const idArray: number[] = spinnerId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$sales.spinner_id$'] = { [Op.in]: idArray };
        }
        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$sales.spinner.brand$'] = { [Op.overlap]: idArray };
        }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$sales.spinner.country_id$'] = { [Op.in]: idArray };
        }

        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$sales.season_id$'] = { [Op.in]: idArray };
        }

        if (programId) {
            const idArray: number[] = programId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$sales.program_id$'] = { [Op.in]: idArray };
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
                as: "yarncount",
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

        const { count, rows }: any = await SpinProcessYarnSelection.findAndCountAll({
            attributes:[
                [Sequelize.literal('"sales"."id"'), 'sales_id'],
                [Sequelize.literal('"sales"."date"'), 'date'],
                [Sequelize.col('"sales"."season"."name"'), 'season_name'],
                [Sequelize.col('"sales"."season"."id"'), 'season_id'],
                [Sequelize.col('"sales"."spinner"."id"'), 'spinner_id'],
                [Sequelize.col('"sales"."spinner"."name"'), 'spinner'],
                [Sequelize.col('"sales"."program"."program_name"'), 'program'],
                [Sequelize.col('"sales"."order_ref"'), 'order_ref'],
                [Sequelize.col('"sales"."buyer_type"'), 'buyer_type'],
                [Sequelize.col('"sales"."buyer_id"'), 'buyer_id'],
                [Sequelize.col('"sales"."knitter_id"'), 'knitter_id'],
                [Sequelize.col('"sales"."knitter"."name'), 'knitter'],
                [Sequelize.col('"sales"."weaver"."name'), 'weaver'],
                [Sequelize.literal('"sales"."total_qty"'), 'total_qty'],
                [Sequelize.literal('"sales"."invoice_no"'), 'invoice_no'],
                [Sequelize.literal('"sales"."batch_lot_no"'), 'batch_lot_no'],
                [Sequelize.literal('"process"."reel_lot_no"'), 'reel_lot_no'],
                [Sequelize.literal('"no_of_box"'), 'no_of_boxes'],
                // [Sequelize.literal('"process"."qty_used"'), 'yarn_weight'],
                [Sequelize.literal("qty_used"), 'yarn_weight'],
                [Sequelize.literal('"sales"."box_ids"'), 'box_ids'],
                [Sequelize.literal('"sales"."yarn_type"'), 'yarn_type'],
                [Sequelize.literal('"sales"."yarn_count"'), 'yarn_count'],
                [Sequelize.col('"sales"."yarncount".yarnCount_name'), 'yarnCount_name'],
                [Sequelize.literal('"sales"."quality_doc"'), 'quality_doc'],
                [Sequelize.literal('"sales"."tc_files"'), 'tc_files'],
                [Sequelize.literal('"sales"."contract_file"'), 'contract_file'],
                [Sequelize.literal('"sales"."invoice_file"'), 'invoice_file'],
                [Sequelize.literal('"sales"."delivery_notes"'), 'delivery_notes'],
                [Sequelize.literal('"sales"."transporter_name"'), 'transporter_name'],
                [Sequelize.literal('"sales"."vehicle_no"'), 'vehicle_no'],
                [Sequelize.literal('"sales"."qr"'), 'qr'],
                [Sequelize.literal('"sales"."transaction_agent"'), 'transaction_agent'],
                [Sequelize.literal('"sales"."qty_stock"'), 'qty_stock'],
                [Sequelize.literal('"sales"."status"'), 'status'],
            ],
            where: whereCondition,
            include: [{
                model: SpinSales,
                as: "sales",
                include: include,
                attributes:[]
            },{
                model: SpinProcess,
                attributes:[],
                as: "process",
            }],
            order: [
                        [
                            'sales_id', 'desc'
                        ]
                    ],
            offset: offset,
            limit: limit,
        })
        return res.sendPaginationSuccess(res, rows, count);

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const exportSpinnerSale = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "spinner-yarn-sale.xlsx");
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { spinnerId, seasonId, programId, brandId, countryId }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { '$sales.spinner.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$sales.season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$sales.program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$sales.weaver.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$sales.knitter.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$sales.order_ref$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$sales.box_ids$': { [Op.iLike]: `%${searchTerm}%` } },
                {'$sales.invoice_no$' : { [Op.iLike]: `%${searchTerm}%` } },
                {'$sales.batch_lot_no$' : { [Op.iLike]: `%${searchTerm}%` } },
                {'$sales.yarn_type$' : { [Op.iLike]: `%${searchTerm}%` } },
                {'$sales.yarncount.yarnCount_name$' : { [Op.iLike]: `%${searchTerm}%` } },
                {'$sales.transporter_name$' : { [Op.iLike]: `%${searchTerm}%` } },
                {'$sales.vehicle_no$' : { [Op.iLike]: `%${searchTerm}%` } },
                {'$sales.transaction_agent$' : { [Op.iLike]: `%${searchTerm}%` } },
                {'$process.reel_lot_no$' : { [Op.iLike]: `%${searchTerm}%` } },
            ];
        }

        if (spinnerId) {
            const idArray: number[] = spinnerId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$sales.spinner_id$'] = { [Op.in]: idArray };
        }
        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$sales.spinner.brand$'] = { [Op.overlap]: idArray };
        }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$sales.spinner.country_id$'] = { [Op.in]: idArray };
        }

        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$sales.season_id$'] = { [Op.in]: idArray };
        }

        if (programId) {
            const idArray: number[] = programId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$sales.program_id$'] = { [Op.in]: idArray };
        }

        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:Q1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Spinner Yarn Sales Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Season", "Spinner Name", "Knitter/Weaver Name",
            "Invoice Number","Order Reference", "Lot/Batch Number", "Reel Lot No", "Yarn Type", "Yarn Count", "No of Boxes",
            "Box ID", "Yarn Net Weight(Kgs)", "Transporter Name", "Vehicle No", "Agent Details"
        ]);
        headerRow.font = { bold: true };

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
                as: "yarncount",
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

        const { count, rows }: any = await SpinProcessYarnSelection.findAndCountAll({
            attributes:[
                [Sequelize.literal('"sales"."id"'), 'sales_id'],
                [Sequelize.literal('"sales"."date"'), 'date'],
                [Sequelize.col('"sales"."season"."name"'), 'season_name'],
                [Sequelize.col('"sales"."season"."id"'), 'season_id'],
                [Sequelize.col('"sales"."spinner"."id"'), 'spinner_id'],
                [Sequelize.col('"sales"."spinner"."name"'), 'spinner'],
                [Sequelize.col('"sales"."program"."program_name"'), 'program'],
                [Sequelize.col('"sales"."order_ref"'), 'order_ref'],
                [Sequelize.col('"sales"."buyer_type"'), 'buyer_type'],
                [Sequelize.col('"sales"."buyer_id"'), 'buyer_id'],
                [Sequelize.col('"sales"."knitter_id"'), 'knitter_id'],
                [Sequelize.col('"sales"."knitter"."name'), 'knitter'],
                [Sequelize.col('"sales"."weaver"."name'), 'weaver'],
                [Sequelize.literal('"sales"."total_qty"'), 'total_qty'],
                [Sequelize.literal('"sales"."invoice_no"'), 'invoice_no'],
                [Sequelize.literal('"sales"."batch_lot_no"'), 'batch_lot_no'],
                [Sequelize.literal('"process"."reel_lot_no"'), 'reel_lot_no'],
                [Sequelize.literal('"no_of_box"'), 'no_of_boxes'],
                // [Sequelize.literal('"process"."qty_used"'), 'yarn_weight'],
                [Sequelize.literal("qty_used"), 'yarn_weight'],
                [Sequelize.literal('"sales"."box_ids"'), 'box_ids'],
                [Sequelize.literal('"sales"."yarn_type"'), 'yarn_type'],
                [Sequelize.literal('"sales"."yarn_count"'), 'yarn_count'],
                [Sequelize.col('"sales"."yarncount".yarnCount_name'), 'yarnCount_name'],
                [Sequelize.literal('"sales"."quality_doc"'), 'quality_doc'],
                [Sequelize.literal('"sales"."tc_files"'), 'tc_files'],
                [Sequelize.literal('"sales"."contract_file"'), 'contract_file'],
                [Sequelize.literal('"sales"."invoice_file"'), 'invoice_file'],
                [Sequelize.literal('"sales"."delivery_notes"'), 'delivery_notes'],
                [Sequelize.literal('"sales"."transporter_name"'), 'transporter_name'],
                [Sequelize.literal('"sales"."vehicle_no"'), 'vehicle_no'],
                [Sequelize.literal('"sales"."qr"'), 'qr'],
                [Sequelize.literal('"sales"."transaction_agent"'), 'transaction_agent'],
                [Sequelize.literal('"sales"."qty_stock"'), 'qty_stock'],
                [Sequelize.literal('"sales"."status"'), 'status'],
            ],
            where: whereCondition,
            include: [{
                model: SpinSales,
                as: "sales",
                include: include,
                attributes:[]
            },{
                model: SpinProcess,
                attributes:[],
                as: "process",
            }],
            order: [
                        [
                            'sales_id', 'desc'
                        ]
                    ],
            offset: offset,
            limit: limit,
        });

        // Append data to worksheet
        for await (const [index, item] of rows.entries()) {
            const rowValues = Object.values({
                index: index + 1,
                date: item.dataValues.date ? item.dataValues.date : '',
                season: item.dataValues.season_name ? item.dataValues.season_name : '',
                spinner: item.dataValues.spinner ? item.dataValues.spinner : '',
                buyer_id: item.dataValues.weaver ? item.dataValues.weaver : item.dataValues.knitter ? item.dataValues.knitter : '',
                invoice: item.dataValues.invoice_no ? item.dataValues.invoice_no : '',
                order_ref: item.dataValues.order_ref ? item.dataValues.order_ref : '',
                lotNo: item.dataValues.batch_lot_no ? item.dataValues.batch_lot_no : '',
                reelLot: item.dataValues.reel_lot_no ? item.dataValues.reel_lot_no : '',
                yarnType: item.dataValues.yarn_type ? item.dataValues.yarn_type : '',
                count: item.dataValues.yarnCount_name ? item.dataValues.yarnCount_name : '',
                boxes: item.dataValues.no_of_boxes ? item.dataValues.no_of_boxes : '',
                boxId: item.dataValues.box_ids ? item.dataValues.box_ids : '',
                total: item.dataValues.yarn_weight ? item.dataValues.yarn_weight : 0,
                transporter_name: item.dataValues.transporter_name ? item.dataValues.transporter_name : '',
                vehicle_no: item.dataValues.vehicle_no ? item.dataValues.vehicle_no : '',
                agent: item.dataValues.transaction_agent ? item.dataValues.transaction_agent : ''
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
            data: process.env.BASE_URL + "spinner-yarn-sale.xlsx",
        });
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);

    }
};

//fetch Knitter Yarn with filters
const fetchKnitterYarnPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { knitterId, seasonId, programId, brandId, countryId }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { '$spinner.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$knitter.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { order_ref: { [Op.iLike]: `%${searchTerm}%` } },
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
                { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { yarn_type: { [Op.iLike]: `%${searchTerm}%` } },
            ];
        }
        if (knitterId) {
            const idArray: number[] = knitterId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.knitter_id = { [Op.in]: idArray };
        }
        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            let knitter = await Knitter.findAll({ where: { brand: { [Op.overlap]: idArray } } });
            const arry: number[] = knitter
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.knitter_id = { [Op.in]: arry };
        }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            let knitter = await Knitter.findAll({ where: { country_id: { [Op.in]: idArray } } });
            const arry: number[] = knitter
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.knitter_id = { [Op.in]: arry };
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
        whereCondition.knitter_id = { [Op.ne]: null };
        whereCondition.status = 'Sold';
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

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const exportKnitterYarn = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "knitter-yarn.xlsx");
    const searchTerm = req.query.search || "";
    const { knitterId, seasonId, programId, brandId, countryId }: any = req.query;
    const whereCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { '$spinner.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$knitter.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { order_ref: { [Op.iLike]: `%${searchTerm}%` } },
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
                { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { yarn_type: { [Op.iLike]: `%${searchTerm}%` } },
            ];
        }
        if (knitterId) {
            const idArray: number[] = knitterId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.knitter_id = { [Op.in]: idArray };
        }
        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            let knitter = await Knitter.findAll({ where: { brand: { [Op.overlap]: idArray } } });
            const arry: number[] = knitter
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.knitter_id = { [Op.in]: arry };
        }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            let knitter = await Knitter.findAll({ where: { country_id: { [Op.in]: idArray } } });
            const arry: number[] = knitter
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.knitter_id = { [Op.in]: arry };
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
        whereCondition.knitter_id = { [Op.ne]: null };
        whereCondition.status = 'Sold';
        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:K1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Knitter Yarn Receipt Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Spinner Name", "Knitter Unit Name",
            "Invoice No", "Lot/Batch Number", "Yarn Reel No", "Yarn Count", "No of Boxes",
            "Box ID", "Net Weight(Kgs)",
        ]);
        headerRow.font = { bold: true };
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
        const rows = await SpinSales.findAll({
            where: whereCondition,
            include: include,
        });
        // Append data to worksheet
        for await (const [index, item] of rows.entries()) {
            const rowValues = Object.values({
                index: index + 1,
                date: item.date ? item.date : '',
                spinner: item.spinner ? item.spinner.name : '',
                buyer_id: item.knitter ? item.knitter.name : '',
                invoice: item.invoice_no ? item.invoice_no : '',
                lotNo: item.batch_lot_no ? item.batch_lot_no : '',
                reelLot: item.reel_lot_no ? item.reel_lot_no : '',
                count: item.yarn_count ? item.yarn_count : '',
                boxes: item.no_of_boxes ? item.no_of_boxes : '',
                boxId: item.box_ids ? item.box_ids : '',
                total: item.total_qty
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
            data: process.env.BASE_URL + "knitter-yarn.xlsx",
        });
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);

    }
};

//fetch knitter Sales with filters
const fetchKnitterSalesPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { knitterId, seasonId, programId, brandId, countryId }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
                { '$fabric.fabricType_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { fabric_gsm: { [Op.iLike]: `%${searchTerm}%` } },
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { vehicle_no: { [Op.iLike]: `%${searchTerm}%` } },
                { transaction_agent: { [Op.iLike]: `%${searchTerm}%` } },
                { fabric_length: { [Op.eq]: searchTerm } },
            ];
        }
        if (knitterId) {
            const idArray: number[] = knitterId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.knitter_id = { [Op.in]: idArray };
        }
        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            let knitter = await Knitter.findAll({ where: { brand: { [Op.overlap]: idArray } } });
            const arry: number[] = knitter
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.knitter_id = { [Op.in]: arry };
        }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            let knitter = await Knitter.findAll({ where: { country_id: { [Op.in]: idArray } } });
            const arry: number[] = knitter
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.knitter_id = { [Op.in]: arry };
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
                model: FabricType,
                as: "fabric",
            },
            {
                model: Garment,
                as: "buyer",
                attributes: ['id', 'name', 'address']
            }
        ];

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

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const exportKnitterSale = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "knitter-sale.xlsx");

    try {
        const { knitterId, seasonId, programId, brandId, countryId }: any = req.query;
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

        if (knitterId) {
            const idArray: number[] = knitterId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.knitter_id = { [Op.in]: idArray };
        }
        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            let knitter = await Knitter.findAll({ where: { brand: { [Op.overlap]: idArray } } });
            const arry: number[] = knitter
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.knitter_id = { [Op.in]: arry };
        }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            let knitter = await Knitter.findAll({ where: { country_id: { [Op.in]: idArray } } });
            const arry: number[] = knitter
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.knitter_id = { [Op.in]: arry };
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
        worksheet.mergeCells('A1:M1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Knitter Fabric Sales Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Knitter Name", "Sold To",
            "Invoice No", "Lot No", "Fabirc Type", "No. of Bales", "Bale Id", "Fabirc Length",
            "Agent Details", "Net Weight (Kgs)",
        ]);
        headerRow.font = { bold: true };
        let include = [
            {
                model: FabricType,
                as: "fabric",
            },
            {
                model: Garment,
                as: "buyer",
                attributes: ['id', 'name', 'address']
            },
            {
                model: Knitter,
                as: "knitter",
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
                knitter: item.knitter ? item.knitter.name : '',
                buyer: item.buyer ? item.buyer.name : item.processor_name,
                invoice: item.invoice_no ? item.invoice_no : '',
                lotNo: item.batch_lot_no ? item.batch_lot_no : '',
                fabrictype: item.fabric ? item.fabric.fabricType_name : '',
                no_of_bales: item.no_of_bales ? item.no_of_bales : '',
                bale_ids: item.bale_ids ? item.bale_ids : '',
                length: item.fabric_length ? item.fabric_length : '',
                transaction_agent: item.transaction_agent ? item.transaction_agent : '',
                fabric_weight: item.fabric_weight ? item.fabric_weight : '',
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


//fetch Weaver Yarn with filters
const fetchWeaverYarnPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { weaverId, seasonId, programId, brandId, countryId }: any = req.query;
    const whereCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { '$spinner.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$weaver.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { order_ref: { [Op.iLike]: `%${searchTerm}%` } },
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
                { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { yarn_type: { [Op.iLike]: `%${searchTerm}%` } },
            ];
        }
        if (weaverId) {
            const idArray: number[] = weaverId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.buyer_id = { [Op.in]: idArray };
        }
        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            let weaver = await Weaver.findAll({ where: { brand: { [Op.overlap]: idArray } } });
            const arry: number[] = weaver
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.buyer_id = { [Op.in]: arry };
        }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            let weaver = await Weaver.findAll({ where: { country_id: { [Op.in]: idArray } } });
            const arry: number[] = weaver
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.buyer_id = { [Op.in]: arry };
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
        whereCondition.buyer_id = { [Op.ne]: null };
        whereCondition.status = 'Sold';
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
                model: Weaver,
                as: "weaver",
                attributes: ['id', 'name']
            }
        ];
        //fetch data with pagination

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

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const exportWeaverYarn = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "weaver-yarn.xlsx");
    const searchTerm = req.query.search || "";
    const { weaverId, seasonId, programId, brandId, countryId }: any = req.query;
    const whereCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { '$spinner.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$weaver.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { order_ref: { [Op.iLike]: `%${searchTerm}%` } },
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
                { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { yarn_type: { [Op.iLike]: `%${searchTerm}%` } },
            ];
        }
        if (weaverId) {
            const idArray: number[] = weaverId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.buyer_id = { [Op.in]: idArray };
        }
        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            let weaver = await Weaver.findAll({ where: { brand: { [Op.overlap]: idArray } } });
            const arry: number[] = weaver
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.buyer_id = { [Op.in]: arry };
        }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            let weaver = await Weaver.findAll({ where: { country_id: { [Op.in]: idArray } } });
            const arry: number[] = weaver
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.buyer_id = { [Op.in]: arry };
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
        whereCondition.buyer_id = { [Op.ne]: null };
        whereCondition.status = 'Sold';
        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:J1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Weaver Yarn Receipt Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Spinner Name", "Weaver Unit Name",
            "Invoice No", "Lot/Batch Number", "Yarn Count", "No of Boxes",
            "Box ID", "Net Weight(Kgs)",
        ]);
        headerRow.font = { bold: true };
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
                model: Weaver,
                as: "weaver",
                attributes: ['id', 'name']
            }
        ];
        const rows = await SpinSales.findAll({
            where: whereCondition,
            include: include,
        });
        // Append data to worksheet
        for await (const [index, item] of rows.entries()) {
            const rowValues = Object.values({
                index: index + 1,
                date: item.date ? item.date : '',
                spinner: item.spinner ? item.spinner.name : '',
                buyer_id: item.weaver ? item.weaver.name : '',
                invoice: item.invoice_no ? item.invoice_no : '',
                lotNo: item.batch_lot_no ? item.batch_lot_no : '',
                count: item.yarn_count ? item.yarn_count : '',
                boxes: item.no_of_boxes ? item.no_of_boxes : '',
                boxId: item.box_ids ? item.box_ids : '',
                total: item.total_qty
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
            data: process.env.BASE_URL + "weaver-yarn.xlsx",
        });
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);

    }
};

//fetch Weaver Sales with filters
const fetchWeaverSalesPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { weaverId, seasonId, programId, brandId, countryId }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$weaver.name$': { [Op.iLike]: `%${searchTerm}%` } },
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
            const idArray: number[] = weaverId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.weaver_id = { [Op.in]: idArray };
        }
        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            let weaver = await Weaver.findAll({ where: { brand: { [Op.overlap]: idArray } } });
            const arry: number[] = weaver
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.weaver_id = { [Op.in]: arry };
        }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            let weaver = await Weaver.findAll({ where: { country_id: { [Op.in]: idArray } } });
            const arry: number[] = weaver
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.weaver_id = { [Op.in]: arry };
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

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const exportWeaverSale = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "weaver-sale-report.xlsx");
    const { weaverId, seasonId, programId, brandId, countryId }: any = req.query;
    try {
        const whereCondition: any = {};
        const searchTerm = req.query.search || "";
        if (searchTerm) {
            whereCondition[Op.or] = [
                { order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$weaver.name$': { [Op.iLike]: `%${searchTerm}%` } },
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
            const idArray: number[] = weaverId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.weaver_id = { [Op.in]: idArray };
        }
        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            let weaver = await Weaver.findAll({ where: { brand: { [Op.overlap]: idArray } } });
            const arry: number[] = weaver
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.weaver_id = { [Op.in]: arry };
        }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            let weaver = await Weaver.findAll({ where: { country_id: { [Op.in]: idArray } } });
            const arry: number[] = weaver
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.weaver_id = { [Op.in]: arry };
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
        mergedCell.value = 'CottonConnect | Weaver Fabric Sales Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Weaver Name", "Sold To",
            "Invoice No", "Lot No",
            "Fabric Type", "No. of Bales", "Bale Id", "Fabric Length", "Agent Details", "Net Weight"
        ]);
        headerRow.font = { bold: true };
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
                model: FabricType,
                as: "fabric",
            },
            {
                model: Garment,
                as: "buyer",
                attributes: ['id', 'name', 'address']
            }
        ];;
        const weaver = await WeaverSales.findAll({
            where: whereCondition,
            include: include
        });
        // Append data to worksheet
        for await (const [index, item] of weaver.entries()) {

            const rowValues = Object.values({
                index: index + 1,
                date: item.date ? item.date : '',
                weaver: item.weaver ? item.weaver.name : '',
                buyer: item.buyer ? item.buyer.name : item.processor_name,
                invoice: item.invoice_no ? item.invoice_no : '',
                lotNo: item.batch_lot_no ? item.batch_lot_no : '',
                fabrictype: item.fabric ? item.fabric.fabricType_name : '',
                no_of_bales: item.no_of_bales ? item.no_of_bales : '',
                boxId: item.bale_ids ? item.bale_ids : '',
                length: item.fabric_length ? item.fabric_length : '',
                transaction_agent: item.transaction_agent ? item.transaction_agent : '',
                fabric_weight: item.fabric_weight ? item.fabric_weight : ''
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
            data: process.env.BASE_URL + "weaver-sale-report.xlsx",
        });
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);

    }
};


//fetch Weaver Sales with filters
const fetchGarmentSalesPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { garmentId, seasonId, programId, brandId, countryId }: any = req.query;
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
        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            let weaver = await Garment.findAll({ where: { brand: { [Op.overlap]: idArray } } });
            const arry: number[] = weaver
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.garment_id = { [Op.in]: arry };
        }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            let weaver = await Garment.findAll({ where: { country_id: { [Op.in]: idArray } } });
            const arry: number[] = weaver
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.garment_id = { [Op.in]: arry };
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

        const { count, rows } = await GarmentSales.findAndCountAll({
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

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const exportGarmentSales = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "garment-sale-report.xlsx");
    const { garmentId, seasonId, programId, brandId, countryId }: any = req.query;
    try {
        const whereCondition: any = {};
        const searchTerm = req.query.search || "";
        if (searchTerm) {
            whereCondition[Op.or] = [
                { order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$garment.name$': { [Op.iLike]: `%${searchTerm}%` } },
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
        if (garmentId) {
            const idArray: number[] = garmentId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.garment_id = { [Op.in]: idArray };
        }
        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            let weaver = await Garment.findAll({ where: { brand: { [Op.overlap]: idArray } } });
            const arry: number[] = weaver
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.garment_id = { [Op.in]: arry };
        }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            let weaver = await Garment.findAll({ where: { country_id: { [Op.in]: idArray } } });
            const arry: number[] = weaver
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.garment_id = { [Op.in]: arry };
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
        mergedCell.value = 'CottonConnect | Garment Fabric Sales Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Season", "Garment Unit Name", "Customer (R&B) Name",
            "Invoice No", "Mark/Style No",
            "Item", "No of Boxes", "No of pieces", "Agent Details", "Net weight", "QR code",
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
                garment_name: item.garment ? item.garment.name : '',
                buyer: item.buyer ? item.buyer.brand_name : item.processor_name,
                invoice: item.invoice_no ? item.invoice_no : '',
                mark: item.style_mark_no ? item.style_mark_no : '',
                garment: item.garment_type ? item.garment_type : '',
                no_of_boxes: item.no_of_boxes ? item.no_of_boxes : '',
                no_of_pieces: item.no_of_pieces ? item.no_of_pieces : '',
                transaction_agent: item.transaction_agent ? item.transaction_agent : '',
                garment_size: item.garment_size ? item.garment_size : '',
                color: process.env.BASE_URL + item.qr ?? '',
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
            data: process.env.BASE_URL + "garment-sale-report.xlsx",
        });
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);

    }
};


//fetch Qr Code Tracker with filters
const fetchQrCodeTrackPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { garmentId, seasonId, programId, brandId, countryId }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$buyer.brand_name$': { [Op.iLike]: `%${searchTerm}%` } },
            ];
        }
        whereCondition.status = 'Sold';
        if (garmentId) {
            const idArray: number[] = garmentId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.garment_id = { [Op.in]: idArray };
        }
        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.buyer_id = { [Op.in]: idArray };
        }

        // if (countryId) {
        //     const idArray: number[] = countryId
        //         .split(",")
        //         .map((id: any) => parseInt(id, 10));
        //     let weaver = await Weaver.findAll({ where: { country_id: { [Op.in]: idArray } } });
        //     const arry: number[] = weaver
        //         .map((gin: any) => parseInt(gin.id, 10));
        //     whereCondition.weaver_id = { [Op.in]: arry };
        // }

        // if (seasonId) {
        //     const idArray: number[] = seasonId
        //         .split(",")
        //         .map((id: any) => parseInt(id, 10));
        //     whereCondition.season_id = { [Op.in]: idArray };
        // }

        // if (programId) {
        //     const idArray: number[] = programId
        //         .split(",")
        //         .map((id: any) => parseInt(id, 10));
        //     whereCondition.program_id = { [Op.in]: idArray };
        // }

        let include = [
            {
                model: Brand,
                as: "buyer",
                attributes: ['id', 'brand_name', 'address']
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
                model: Garment,
                as: "garment",
                attributes: ['id', 'name', 'address']
            }
        ];

        //fetch data with pagination

        const { count, rows } = await GarmentSales.findAndCountAll({
            where: whereCondition,
            include: include,
            order: [
                [
                    'accept_date', 'desc'
                ]
            ],
            offset: offset,
            limit: limit,
        });
        return res.sendPaginationSuccess(res, rows, count);

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const exportQrCodeTrack = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "barcode-report.xlsx");
    const { garmentId, seasonId, programId, brandId, countryId }: any = req.query;
    try {
        const whereCondition: any = {};
        const searchTerm = req.query.search || "";
        if (searchTerm) {
            whereCondition[Op.or] = [
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$buyer.brand_name$': { [Op.iLike]: `%${searchTerm}%` } },
            ];
        }
        if (garmentId) {
            const idArray: number[] = garmentId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.garment_id = { [Op.in]: idArray };
        }
        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.buyer_id = { [Op.in]: idArray };
        }
        whereCondition.status = "Sold";
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
            "Sr No.", "Qr Code", "Brand Name",
            "Invoice No", "Garment Type", "Style/Mark No",
            "Total No of pieces", "Program"
        ]);
        headerRow.font = { bold: true };
        let include = [
            {
                model: Garment,
                as: "garment",
                attributes: ['id', 'name', 'address']
            },
            {
                model: Program,
                as: "program",
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
                qrCode: item.qr ? process.env.BASE_URL + item.qr : '',
                buyer: item.buyer ? item.buyer.brand_name : item.processor_name,
                invoice: item.invoice_no ? item.invoice_no : '',
                garment: item.garment_type ? item.garment_type : '',
                mark: item.style_mark_no ? item.style_mark_no : '',
                garment_size: item.garment_size ? item.garment_size : '',
                no_of_pieces: item.no_of_pieces ? item.no_of_pieces : '',
                program: item.program ? item.program.name : '',
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
            data: process.env.BASE_URL + "barcode-report.xlsx",
        });
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);

    }
};

//fetch Spinner sales with filters
const fetchSpinnerSummaryPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { spinnerId, seasonId, programId, brandId, countryId }: any = req.query;
    const whereCondition: any = {};
    const lintCondition: any = {};
    const ginSalesCondition: any = {};
    const spinSalesCondition: any = {};
    const spinProcessCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { name: { [Op.iLike]: `%${searchTerm}%` } }
            ];
        }

        if (spinnerId) {
            const idArray: number[] = spinnerId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.id = { [Op.in]: idArray };
        }

        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.brand = { [Op.overlap]: idArray };
        }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.country_id = { [Op.in]: idArray };
        }



        if (programId) {
            const idArray: number[] = programId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            lintCondition['$spinprocess.program_id$'] = { [Op.in]: idArray };
            ginSalesCondition.program_id = { [Op.in]: idArray };
            spinSalesCondition.program_id = { [Op.in]: idArray };
            spinProcessCondition.program_id = { [Op.in]: idArray };
        }

        let { count, rows } = await Spinner.findAndCountAll({ where: whereCondition, attributes: ["id", "name", "address"], offset: offset, limit: limit });
        let result: any = [];
        for await (let spinner of rows) {
            let obj: any = {};
            let wheree: any = {}
            if (seasonId) {
                const idArray: number[] = seasonId
                    .split(",")
                    .map((id: any) => parseInt(id, 10));
                wheree.season_id = { [Op.in]: idArray };
                lintCondition['$spinprocess.season_id$'] = { [Op.in]: idArray };
            }

            let [lint_cotton_procured, lint_cotton_procured_pending, lint_consumed, yarnProcured, yarnSold] = await Promise.all([
                GinSales.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total_qty')), 0), 'lint_cotton_procured'],
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('qty_stock')), 0), 'lint_cotton_stock']
                    ],
                    where: {
                        ...wheree,
                        ...ginSalesCondition,
                        buyer: spinner.id,
                        status: 'Sold'
                    }
                }),
                GinSales.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total_qty')), 0), 'lint_cotton_procured_pending']
                    ],
                    where: {
                        ...wheree,
                        ...ginSalesCondition,
                        buyer: spinner.id,
                        status: 'Pending for QR scanning'
                    }
                }),
                LintSelections.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('qty_used')), 0), 'lint_cotton_consumed']
                    ],
                    include: [
                        {
                            model: SpinProcess,
                            as: 'spinprocess',
                            attributes: []
                        }
                    ],
                    where: {
                        ...lintCondition,
                        '$spinprocess.spinner_id$': spinner.id
                    },
                    group: ["spinprocess.spinner_id"]
                }),
                SpinProcess.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('net_yarn_qty')), 0), 'yarn_procured'],
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('qty_stock')), 0), 'yarn_stock']
                    ],
                    where: {
                        ...wheree,
                        ...spinProcessCondition,
                        spinner_id: spinner.id
                    }
                }),
                SpinSales.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total_qty')), 0), 'yarn_sold']
                    ],
                    where: {
                        ...wheree,
                        ...spinSalesCondition,
                        spinner_id: spinner.id
                    }
                })
            ])
            obj.lintCottonProcuredKG = lint_cotton_procured ? (lint_cotton_procured?.dataValues.lint_cotton_procured ?? 0) : 0;
            obj.lintCottonProcuredPendingKG = lint_cotton_procured_pending ? (lint_cotton_procured_pending?.dataValues.lint_cotton_procured_pending ?? 0) : 0;
            obj.lintConsumedKG = lint_consumed ? (lint_consumed?.dataValues.lint_cotton_consumed ?? 0) : 0;
            obj.lintStockKG = lint_cotton_procured ? (lint_cotton_procured?.dataValues.lint_cotton_stock ?? 0) : 0;
            obj.yarnProcuredKG = yarnProcured ? (yarnProcured?.dataValues.yarn_procured ?? 0) : 0;
            obj.yarnSoldKG =  yarnSold ? (yarnSold.dataValues.yarn_sold ?? 0) : 0;
            obj.yarnStockKG = yarnProcured ? (yarnProcured?.dataValues.yarn_stock ?? 0) : 0;
            obj.lintCottonProcuredMT = convert_kg_to_mt(obj.lintCottonProcuredKG);
            obj.lintCottonProcuredPendingMT = convert_kg_to_mt(obj.lintCottonProcuredPendingKG);
            obj.lintConsumedMT = convert_kg_to_mt(obj.lintConsumedKG);
            obj.lintStockMT = convert_kg_to_mt(obj.lintStockKG);
            obj.yarnSoldMT = convert_kg_to_mt(obj.yarnSoldKG);
            obj.yarnProcuredMT = convert_kg_to_mt(obj.yarnProcuredKG);
            obj.yarnStockMT = convert_kg_to_mt(obj.yarnStockKG);
            result.push({ ...obj, spinner });
        }
        //fetch data with pagination

        return res.sendPaginationSuccess(res, result, count);

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const exportSpinnerSummary = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "spinner-summary.xlsx");

    const searchTerm = req.query.search || "";
    const { spinnerId, seasonId, programId, brandId, countryId }: any = req.query;
    const whereCondition: any = {};
    const lintCondition: any = {};
    const ginSalesCondition: any = {};
    const spinSalesCondition: any = {};
    const spinProcessCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { name: { [Op.iLike]: `%${searchTerm}%` } }
            ];
        }

        if (spinnerId) {
            const idArray: number[] = spinnerId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.id = { [Op.in]: idArray };
        }

        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.brand = { [Op.overlap]: idArray };
        }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.country_id = { [Op.in]: idArray };
        }

        if (programId) {
            const idArray: number[] = programId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            lintCondition['$spinprocess.program_id$'] = { [Op.in]: idArray };
            ginSalesCondition.program_id = { [Op.in]: idArray };
            spinSalesCondition.program_id = { [Op.in]: idArray };
            spinProcessCondition.program_id = { [Op.in]: idArray };
        }

        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:I1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Spinner Summary Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Spinner Name", "Total Lint Cotton Procured MT (Accepted)", "Total Lint Cotton Procured MT (Pending)",
            "Lint cotton processed in MT", "Balance Lint cotton stock in MT", "Total Yarn Produced MT", "Yarn sold in MT",
            "Yarn stock in MT"
        ]);
        headerRow.font = { bold: true };
        let rows = await Spinner.findAll({ where: whereCondition, attributes: ["id", "name", "address"] });
        // Append data to worksheet
        for await (const [index, item] of rows.entries()) {
            let obj: any = {};
            let wheree: any = {}
            if (seasonId) {
                const idArray: number[] = seasonId
                    .split(",")
                    .map((id: any) => parseInt(id, 10));
                wheree.season_id = { [Op.in]: idArray };
                lintCondition['$spinprocess.season_id$'] = { [Op.in]: idArray };
            }

            let [lint_cotton_procured, lint_cotton_procured_pending, lint_consumed, yarnProcured, yarnSold] = await Promise.all([
                GinSales.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total_qty')), 0), 'lint_cotton_procured'],
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('qty_stock')), 0), 'lint_cotton_stock']
                    ],
                    where: {
                        ...wheree,
                        ...ginSalesCondition,
                        buyer: item.id,
                        status: 'Sold'
                    }
                }),
                GinSales.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total_qty')), 0), 'lint_cotton_procured_pending']
                    ],
                    where: {
                        ...wheree,
                        ...ginSalesCondition,
                        buyer: item.id,
                        status: 'Pending for QR scanning'
                    }
                }),
                LintSelections.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('qty_used')), 0), 'lint_cotton_consumed']
                    ],
                    include: [
                        {
                            model: SpinProcess,
                            as: 'spinprocess',
                            attributes: []
                        }
                    ],
                    where: {
                        ...lintCondition,
                        '$spinprocess.spinner_id$': item.id
                    },
                    group: ["spinprocess.spinner_id"]
                }),
                SpinProcess.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('net_yarn_qty')), 0), 'yarn_procured'],
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('qty_stock')), 0), 'yarn_stock']
                    ],
                    where: {
                        ...wheree,
                        ...spinProcessCondition,
                        spinner_id: item.id
                    }
                }),
                SpinSales.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total_qty')), 0), 'yarn_sold']
                    ],
                    where: {
                        ...wheree,
                        ...spinSalesCondition,
                        spinner_id: item.id
                    }
                })
            ])

            obj.lintCottonProcuredKG = lint_cotton_procured ? (lint_cotton_procured?.dataValues.lint_cotton_procured ?? 0) : 0;
            obj.lintCottonProcuredPendingKG = lint_cotton_procured_pending ? (lint_cotton_procured_pending?.dataValues.lint_cotton_procured_pending ?? 0) : 0;
            obj.lintConsumedKG = lint_consumed ? (lint_consumed?.dataValues.lint_cotton_consumed ?? 0) : 0;
            obj.lintStockKG = lint_cotton_procured ? (lint_cotton_procured?.dataValues.lint_cotton_stock ?? 0) : 0;
            obj.yarnProcuredKG = yarnProcured ? (yarnProcured?.dataValues.yarn_procured ?? 0) : 0;
            obj.yarnSoldKG =  yarnSold ? (yarnSold.dataValues.yarn_sold ?? 0) : 0;
            obj.yarnStockKG = yarnProcured ? (yarnProcured?.dataValues.yarn_stock ?? 0) : 0;
            obj.lintCottonProcuredMT = convert_kg_to_mt(obj.lintCottonProcuredKG);
            obj.lintCottonProcuredPendingMT = convert_kg_to_mt(obj.lintCottonProcuredPendingKG);
            obj.lintConsumedMT = convert_kg_to_mt(obj.lintConsumedKG);
            obj.lintStockMT = convert_kg_to_mt(obj.lintStockKG);
            obj.yarnSoldMT = convert_kg_to_mt(obj.yarnSoldKG);
            obj.yarnProcuredMT = convert_kg_to_mt(obj.yarnProcuredKG);
            obj.yarnStockMT = convert_kg_to_mt(obj.yarnStockKG);

            const rowValues = Object.values({
                index: index + 1,
                name: item.name ? item.name : '',
                lint_cotton_procured: obj.lintCottonProcuredMT,
                lint_cotton_procured_pending: obj.lintCottonProcuredPendingMT,
                lint_consumed: obj.lintConsumedMT,
                balance_lint_cotton: obj.lintStockMT,
                yarn_procured: obj.yarnProcuredMT,
                yarn_sold: obj.yarnSoldMT,
                yarn_stock: obj.yarnStockMT,
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
            data: process.env.BASE_URL + "spinner-summary.xlsx",
        });
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);

    }
};


function convert_kg_to_mt(number: any) {
    return (number / 1000).toFixed(2);
}

const fetchGinnerSummaryPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { ginnerId, seasonId, programId, brandId, countryId }: any = req.query;
    const whereCondition: any = {};
    const transactionWhere: any = {};
    const ginBaleWhere: any = {};
    const baleSelectionWhere: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { name: { [Op.iLike]: `%${searchTerm}%` } }
            ];
        }

        if (ginnerId) {
            const idArray: number[] = ginnerId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.id = { [Op.in]: idArray };
        }

        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.brand = { [Op.overlap]: idArray };
        }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.country_id = { [Op.in]: idArray };
        }

        if (programId) {
            const idArray: number[] = programId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            transactionWhere.program_id = { [Op.in]: idArray };
            ginBaleWhere['$ginprocess.program_id$'] = { [Op.in]: idArray };
            baleSelectionWhere['$sales.program_id$'] = { [Op.in]: idArray };
        }

        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            transactionWhere.season_id = { [Op.in]: idArray };
            ginBaleWhere['$ginprocess.season_id$'] = { [Op.in]: idArray };
            baleSelectionWhere['$sales.season_id$'] = { [Op.in]: idArray };
        }

        let { count, rows } = await Ginner.findAndCountAll({ where: whereCondition, attributes: ["id", "name", "address"], offset: offset, limit: limit });
        let result: any = [];
        for await (let ginner of rows) {
            let obj: any = {};


            let [cottonProcured, cottonProcessed, lintProcured, lintSold]: any = await Promise.all([
                Transaction.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")), 0), 'qty']
                    ],
                    where: {
                        ...transactionWhere,
                        mapped_ginner: ginner.id
                    }
                }),
                Transaction.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")), 0), 'qty']
                    ],
                    where: {
                        ...transactionWhere,
                        mapped_ginner: ginner.id,
                        status: 'Sold'
                    }
                }),
                GinBale.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.literal('CAST("gin-bales"."weight" AS INTEGER)')), 0), 'qty'],
                        [sequelize.fn('COUNT', Sequelize.literal('DISTINCT "gin-bales"."id"')), 'bales_procured'],
                    ],
                    include: [
                        {
                            model: GinProcess,
                            as: 'ginprocess',
                            attributes: []
                        }
                    ],
                    where: {
                        ...ginBaleWhere,
                        '$ginprocess.ginner_id$': ginner.id
                    },
                    group: ["ginprocess.ginner_id"]
                }),
                BaleSelection.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.literal('CAST("bale"."weight" AS INTEGER)')), 0), 'qty'],
                        [sequelize.fn('COUNT', Sequelize.literal('DISTINCT bale_id')), 'bales_sold'],

                    ],
                    include: [
                        {
                            model: GinSales,
                            as: 'sales',
                            attributes: []
                        },
                        {
                            model: GinBale,
                            as: 'bale',
                            attributes: []
                        }
                    ],
                    where: {
                        ...baleSelectionWhere,
                        '$sales.ginner_id$': ginner.id
                    },
                    group: ["sales.ginner_id"]
                }),
            ])
            obj.cottonProcuredKg = cottonProcured?.dataValues?.qty ?? 0;
            obj.cottonProcessedKg = cottonProcessed?.dataValues?.qty ?? 0;
            obj.cottonStockKg = cottonProcured ? 
                                        cottonProcured?.dataValues?.qty - (cottonProcessed ? cottonProcessed?.dataValues?.qty : 0)
                                        : 0;
            obj.cottonProcuredMt = convert_kg_to_mt(cottonProcured?.dataValues.qty ?? 0);
            obj.cottonProcessedeMt = convert_kg_to_mt(cottonProcessed?.dataValues.qty ?? 0);
            obj.cottonStockMt = convert_kg_to_mt(cottonProcured ? 
                                        cottonProcured?.dataValues?.qty - (cottonProcessed ? cottonProcessed?.dataValues?.qty : 0)
                                        : 0);
            obj.lintProcuredKg = lintProcured?.dataValues.qty ?? 0;
            obj.lintProcuredMt = convert_kg_to_mt(lintProcured?.dataValues.qty ?? 0);
            obj.lintSoldKg = lintSold?.dataValues.qty ?? 0;
            obj.lintSoldMt = convert_kg_to_mt(lintSold?.dataValues.qty ?? 0);
            obj.lintStockKg = Number(obj.lintProcuredKg) > Number(obj.lintSoldKg) ? Number(obj.lintProcuredKg) - Number(obj.lintSoldKg) : 0;
            obj.lintStockMt = Number(obj.lintProcuredKg) > Number(obj.lintSoldKg) ? Number(obj.lintProcuredMt) - Number(obj.lintSoldMt) : 0;
            obj.balesProduced = lintProcured?.dataValues?.bales_procured ? Number(lintProcured?.dataValues?.bales_procured) : 0;
            obj.balesSold = lintSold?.dataValues?.bales_sold ? Number(lintSold?.dataValues?.bales_sold) : 0;
            obj.balesStock =  obj.balesProduced > obj.balesSold ? obj.balesProduced - obj.balesSold : 0;
            result.push({ ...obj, ginner });
        }
        //fetch data with pagination

        return res.sendPaginationSuccess(res, result, count);

    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
}

const exportGinnerSummary = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "ginner-summary.xlsx");

    const searchTerm = req.query.search || "";
    const { spinnerId, seasonId, programId, brandId, countryId }: any = req.query;
    const whereCondition: any = {};
    const transactionWhere: any = {};
    const ginBaleWhere: any = {};
    const baleSelectionWhere: any = {};
    
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { name: { [Op.iLike]: `%${searchTerm}%` } }
            ];
        }

        if (spinnerId) {
            const idArray: number[] = spinnerId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.id = { [Op.in]: idArray };
        }

        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.brand = { [Op.overlap]: idArray };
        }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.country_id = { [Op.in]: idArray };
        }
        if (programId) {
            const idArray: number[] = programId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            transactionWhere.program_id = { [Op.in]: idArray };
            ginBaleWhere['$ginprocess.program_id$'] = { [Op.in]: idArray };
            baleSelectionWhere['$sales.program_id$'] = { [Op.in]: idArray };
        }

        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            transactionWhere.season_id = { [Op.in]: idArray };
            ginBaleWhere['$ginprocess.season_id$'] = { [Op.in]: idArray };
            baleSelectionWhere['$sales.season_id$'] = { [Op.in]: idArray };
        }

        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:K1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Ginner Summary Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "S. No.", "Ginner Name", "Total seed cotton procured (MT)", "Total seed cotton processed (MT)",
            "Total seed cotton in stock (MT)", "Total lint produce (MT)", "Total lint sold (MT)", "Total lint in stock (MT)",
            "Total bales produce", "Total bales sold", "Total bales in stock"
        ]);
        headerRow.font = { bold: true };
        let rows = await Ginner.findAll({ where: whereCondition, attributes: ["id", "name", "address"] });
        // Append data to worksheet
        for await (const [index, item] of rows.entries()) {
            let obj: any = {};


            let [cottonProcured, cottonProcessed, lintProcured, lintSold]: any = await Promise.all([
                Transaction.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")), 0), 'qty']
                    ],
                    where: {
                        ...transactionWhere,
                        mapped_ginner: item.id
                    }
                }),
                Transaction.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")), 0), 'qty']
                    ],
                    where: {
                        ...transactionWhere,
                        mapped_ginner: item.id,
                        status: 'Sold'
                    }
                }),
                GinBale.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.literal('CAST("gin-bales"."weight" AS INTEGER)')), 0), 'qty'],
                        [sequelize.fn('COUNT', Sequelize.literal('DISTINCT "gin-bales"."id"')), 'bales_procured'],
                    ],
                    include: [
                        {
                            model: GinProcess,
                            as: 'ginprocess',
                            attributes: []
                        }
                    ],
                    where: {
                        ...ginBaleWhere,
                        '$ginprocess.ginner_id$': item.id
                    },
                    group: ["ginprocess.ginner_id"]
                }),
                BaleSelection.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.literal('CAST("bale"."weight" AS INTEGER)')), 0), 'qty'],
                        [sequelize.fn('COUNT', Sequelize.literal('DISTINCT bale_id')), 'bales_sold'],

                    ],
                    include: [
                        {
                            model: GinSales,
                            as: 'sales',
                            attributes: []
                        },
                        {
                            model: GinBale,
                            as: 'bale',
                            attributes: []
                        }
                    ],
                    where: {
                        ...baleSelectionWhere,
                        '$sales.ginner_id$': item.id
                    },
                    group: ["sales.ginner_id"]
                }),
            ])
            obj.cottonProcuredKg = cottonProcured?.dataValues?.qty ?? 0;
            obj.cottonProcessedKg = cottonProcessed?.dataValues?.qty ?? 0;
            obj.cottonStockKg = cottonProcured ? 
                                        cottonProcured?.dataValues?.qty - (cottonProcessed ? cottonProcessed?.dataValues?.qty : 0)
                                        : 0;
            obj.cottonProcuredMt = convert_kg_to_mt(cottonProcured?.dataValues.qty ?? 0);
            obj.cottonProcessedeMt = convert_kg_to_mt(cottonProcessed?.dataValues.qty ?? 0);
            obj.cottonStockMt = convert_kg_to_mt(cottonProcured ? 
                                        cottonProcured?.dataValues?.qty - (cottonProcessed ? cottonProcessed?.dataValues?.qty : 0)
                                        : 0);
            obj.lintProcuredKg = lintProcured?.dataValues.qty ?? 0;
            obj.lintProcuredMt = convert_kg_to_mt(lintProcured?.dataValues.qty ?? 0);
            obj.lintSoldKg = lintSold?.dataValues.qty ?? 0;
            obj.lintSoldMt = convert_kg_to_mt(lintSold?.dataValues.qty ?? 0);
            obj.lintStockKg = Number(obj.lintProcuredKg) > Number(obj.lintSoldKg) ? Number(obj.lintProcuredKg) - Number(obj.lintSoldKg) : 0;
            obj.lintStockMt = Number(obj.lintProcuredKg) > Number(obj.lintSoldKg) ? Number(obj.lintProcuredMt) - Number(obj.lintSoldMt) : 0;
            obj.balesProduced = lintProcured?.dataValues?.bales_procured ? Number(lintProcured?.dataValues?.bales_procured) : 0;
            obj.balesSold = lintSold?.dataValues?.bales_sold ? Number(lintSold?.dataValues?.bales_sold) : 0;
            obj.balesStock =  obj.balesProduced > obj.balesSold ? obj.balesProduced - obj.balesSold : 0;

            const rowValues = Object.values({
                index: index + 1,
                name: item.name ? item.name : '',
                cottonProcuredMt: obj.cottonProcuredMt,
                cottonProcessedeMt: obj.cottonProcessedeMt,
                cottonStockMt: obj.cottonStockMt,
                lintProcuredMt: obj.lintProcuredMt,
                lintSoldMt: obj.lintSoldMt,
                lintStockMt: obj.lintStockMt,
                balesProduced: obj.balesProduced,
                balesSold: obj.balesSold,
                balesStock: obj.balesStock
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
            data: process.env.BASE_URL + "ginner-summary.xlsx",
        });
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);

    }
};

const fetchGinnerCottonStock = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { ginnerId, seasonId, programId, brandId, countryId }: any = req.query;
    const whereCondition: any = {};
    const transactionWhere: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { '$ginner.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
            ];
        }

        if (ginnerId) {
            const idArray: number[] = ginnerId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.ginner_id = { [Op.in]: idArray };
        }

        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$ginner.brand$'] = { [Op.overlap]: idArray };
        }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$ginner.country_id$'] = { [Op.in]: idArray };
        }

        if (programId) {
            const idArray: number[] = programId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            transactionWhere.program_id = { [Op.in]: idArray };
            whereCondition.program_id = { [Op.in]: idArray };
        }

        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.season_id = { [Op.in]: idArray };
        }

        let include = [
            {
                model: Ginner,
                as: "ginner",
                attributes: []
            },
            {
                model: Season,
                as: "season",
                attributes: []
            },
            {
                model: Program,
                as: "program",
                attributes: []
            },
        ];

        let rows = await GinProcess.findAll({ 
            attributes:[
                [Sequelize.literal('"ginner"."id"'), 'ginner_id'],
                [Sequelize.literal('"ginner"."name"'), 'ginner_name'],
                [Sequelize.literal('"season"."id"'), 'season_id'],
                [Sequelize.col('"season"."name"'), 'season_name'],
                // [Sequelize.literal('"program"."program_name"'), 'program_name'],
                [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total_qty')), 0), 'cotton_processed']
        ],
            where: whereCondition,
            include: include,
            group: ['ginner.id','season.id'],
            order: [["ginner_id","desc"]]
        });
        let result: any = [];
        for await (let ginner of rows) {
            let obj: any = {};
            const cottonProcured = await Transaction.findOne({
                            attributes: [
                                [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")), 0), 'cotton_procured'],
                                [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal("CAST(qty_stock AS DOUBLE PRECISION)")), 0), 'cotton_stock']
                            ],
                            where: {
                                ...transactionWhere,
                                mapped_ginner: ginner.ginner_id,
                                status: 'Sold'
                            }
                        })

            obj.cotton_procured = cottonProcured?.dataValues?.cotton_procured ?? 0;
            obj.cotton_stock = cottonProcured?.dataValues?.cotton_stock ?? 0;
            result.push({ ...ginner?.dataValues, ...obj });
        }
        //fetch data with pagination

        let data = result.slice(offset, offset + limit);

        return res.sendPaginationSuccess(res, data, rows.length);

    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
}


const exportGinnerCottonStock = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "ginner-seed-cotton-stock-report.xlsx");
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { ginnerId, seasonId, programId, brandId, countryId }: any = req.query;
    const whereCondition: any = {};
    const transactionWhere: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { '$ginner.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
            ];
        }

        if (ginnerId) {
            const idArray: number[] = ginnerId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.ginner_id = { [Op.in]: idArray };
        }

        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$ginner.brand$'] = { [Op.overlap]: idArray };
        }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$ginner.country_id$'] = { [Op.in]: idArray };
        }

        if (programId) {
            const idArray: number[] = programId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            transactionWhere.program_id = { [Op.in]: idArray };
            whereCondition.program_id = { [Op.in]: idArray };
        }

        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.season_id = { [Op.in]: idArray };
        }

        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:F1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Ginner Seed Cotton Stock Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Ginner Name", "Season", "Total Seed Cotton Procured (Kgs)", "Total Seed Cotton in Processed (Kgs)",
            "Total Seed Cotton in Stock (Kgs)"]);
        headerRow.font = { bold: true };

        let include = [
            {
                model: Ginner,
                as: "ginner",
                attributes: []
            },
            {
                model: Season,
                as: "season",
                attributes: []
            },
            {
                model: Program,
                as: "program",
                attributes: []
            },
        ];

        let rows = await GinProcess.findAll({ 
            attributes:[
                [Sequelize.literal('"ginner"."id"'), 'ginner_id'],
                [Sequelize.literal('"ginner"."name"'), 'ginner_name'],
                [Sequelize.literal('"season"."id"'), 'season_id'],
                [Sequelize.col('"season"."name"'), 'season_name'],
                // [Sequelize.literal('"program"."program_name"'), 'program_name'],
                [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total_qty')), 0), 'cotton_processed']
        ],
            where: whereCondition,
            include: include,
            group: ['ginner.id','season.id'],
            order: [["ginner_id","desc"]]
        });
        let result: any = [];
        for await (let ginner of rows) {
            let obj: any = {};
            const cottonProcured = await Transaction.findOne({
                            attributes: [
                                [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")), 0), 'cotton_procured'],
                                [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal("CAST(qty_stock AS DOUBLE PRECISION)")), 0), 'cotton_stock']
                            ],
                            where: {
                                ...transactionWhere,
                                mapped_ginner: ginner.ginner_id,
                                status: 'Sold'
                            }
                        })

            obj.cotton_procured = cottonProcured?.dataValues?.cotton_procured ?? 0;
            obj.cotton_stock = cottonProcured?.dataValues?.cotton_stock ?? 0;
            result.push({ ...ginner?.dataValues, ...obj });
        }
        //fetch data with pagination

        let data = result.slice(offset, offset + limit);

        // Append data to worksheet
        for await (const [index, item] of data.entries()) {
            const rowValues = Object.values({
                index: index + 1,
                ginner: item.ginner_name ? item.ginner_name : '',
                season: item.season_name ? item.season_name : '',
                cotton_procured: item.cotton_procured ? item.cotton_procured : '',
                cotton_processed: item.cotton_processed ? item.cotton_processed : '',
                cotton_stock: item.cotton_stock ? item.cotton_stock : '',
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
            data: process.env.BASE_URL + "ginner-seed-cotton-stock-report.xlsx",
        });

    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
}

const fetchSpinnerLintCottonStock = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { spinnerId, seasonId, programId, brandId, countryId }: any = req.query;
    const whereCondition: any = {};
    const transactionWhere: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { '$spinprocess.spinner.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$spinprocess.season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$spinprocess.batch_lot_no$': { [Op.iLike]: `%${searchTerm}%` } },
            ];
        }

        if (spinnerId) {
            const idArray: number[] = spinnerId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$spinprocess.spinner_id$'] = { [Op.in]: idArray };
        }

        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$spinprocess.spinner.brand$'] = { [Op.overlap]: idArray };
        }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$spinprocess.spinner.country_id$'] = { [Op.in]: idArray };
        }

        if (programId) {
            const idArray: number[] = programId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$spinprocess.program_id$'] = { [Op.in]: idArray };
        }

        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$spinprocess.season_id$'] = { [Op.in]: idArray };
        }

        let include = [
            {
                model: Spinner,
                as: "spinner",
                attributes: []
            },
            {
                model: Season,
                as: "season",
                attributes: []
            },
            {
                model: Program,
                as: "program",
                attributes: []
            },
        ];

        // let rows = await SpinProcess.findAll({ 
        //     attributes:[
        //         'id',
        //         'batch_lot_no',
        //         [Sequelize.literal('"spinner"."id"'), 'spinner_id'],
        //         [Sequelize.literal('"spinner"."name"'), 'spinner_name'],
        //         [Sequelize.literal('"season"."id"'), 'season_id'],
        //         [Sequelize.col('"season"."name"'), 'season_name'],
        //         [Sequelize.fn('group_concat', Sequelize.literal('distinct(gls.invoice_no)')), 'invoice_no'],
        //         [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total_qty')), 0), 'cotton_processed']
        // ],
        //     where: whereCondition,
        //     include: include,
        //     group: ['spinner.id','season.id'],
        //     order: [["spinner_id","desc"]]
        // });

        let rows = await LintSelections.findAll({
            attributes:[
                [Sequelize.col('"spinprocess"."spinner"."id"'), 'spinner_id'],
                [Sequelize.col('"spinprocess"."spinner"."name"'), 'spinner_name'],
                [Sequelize.col('"spinprocess"."season"."id"'), 'season_id'],
                [Sequelize.col('"spinprocess"."season"."name"'), 'season_name'],
                [
                    Sequelize.literal('MIN(DISTINCT "spinprocess"."batch_lot_no")'),
                    'batch_lot_no'
                ],
                //this for comma separator batchlotno
                // [
                //     Sequelize.literal('ARRAY_TO_STRING(ARRAY_AGG(DISTINCT "spinprocess"."batch_lot_no"), \', \')'),
                //     'batch_lot_no'
                // ],
                [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('qty_used')), 0), 'cotton_consumed']
        ],
            where: whereCondition,
            include: [{
                model: SpinProcess,
                as: "spinprocess",
                include: include,
                attributes: []
            },{
                model: GinSales,
                as: "ginsales",
                attributes: [],
            },
            ],
            group: ['spinprocess.spinner.id','spinprocess.season.id'],
            order: [["spinner_id","desc"]]
        });

        let ndata =  [];
        for await (let spinner of rows){
            let salesData = await BaleSelection.findAll({
                attributes:[
                    [Sequelize.col('"sales"."invoice_no"'), 'invoice_no'],
                    [Sequelize.col('"bale"."ginprocess"."reel_lot_no"'), 'reel_lot_no'],
            ],
                where: {
                    '$sales.buyer$': spinner?.dataValues?.spinner_id,
                    '$sales.season_id$': spinner?.dataValues?.season_id,
                    '$sales.status$': 'Sold',
                },
                include: [{
                    model: GinSales,
                    as: "sales",
                    attributes: []
                },{
                    model: GinBale,
                    as: "bale",
                    include: [{
                        model: GinProcess,
                        as: "ginprocess",
                        attributes: [],
                    }],
                    attributes: [],
                },
                ], 
                group: ['sales.invoice_no','bale.ginprocess.reel_lot_no'],
            });

            let procuredCotton = await GinSales.findOne({
                attributes:[
                    [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col("total_qty")), 0), 'cotton_procured']
            ],
                where: {
                    buyer: spinner?.dataValues?.spinner_id,
                    season_id: spinner?.dataValues?.season_id,
                    status: 'Sold',
                },
            })

            for await (let item of salesData){
                let stockData = {
                    spinner_id: spinner?.dataValues?.spinner_id,
                    spinner_name: spinner?.dataValues?.spinner_name,
                    season_id: spinner?.dataValues?.season_id,
                    season_name: spinner?.dataValues?.season_name,
                    batch_lot_no: spinner?.dataValues?.batch_lot_no,
                    reel_lot_no: item?.dataValues?.reel_lot_no,
                    invoice_no: item?.dataValues?.invoice_no,
                    cotton_procured: procuredCotton ? procuredCotton?.dataValues?.cotton_procured : 0,
                    cotton_consumed: spinner ? spinner?.dataValues?.cotton_consumed : 0,
                    cotton_stock: Number(procuredCotton?.dataValues?.cotton_procured) >  Number(spinner?.dataValues?.cotton_consumed) ? Number(procuredCotton?.dataValues?.cotton_procured) -  Number(spinner?.dataValues?.cotton_consumed) : 0,
                }
                ndata.push(stockData)
            }

        }

        let data = ndata.slice(offset, offset + limit);

        return res.sendPaginationSuccess(res, data, ndata.length);

    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
}

const exportSpinnerCottonStock = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "spinner-lint-cotton-stock-report.xlsx");
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { spinnerId, seasonId, programId, brandId, countryId }: any = req.query;
    const whereCondition: any = {};
    
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { '$spinprocess.spinner.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$spinprocess.season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$spinprocess.batch_lot_no$': { [Op.iLike]: `%${searchTerm}%` } },
            ];
        }

        if (spinnerId) {
            const idArray: number[] = spinnerId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$spinprocess.spinner_id$'] = { [Op.in]: idArray };
        }

        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$spinprocess.spinner.brand$'] = { [Op.overlap]: idArray };
        }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$spinprocess.spinner.country_id$'] = { [Op.in]: idArray };
        }

        if (programId) {
            const idArray: number[] = programId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$spinprocess.program_id$'] = { [Op.in]: idArray };
        }

        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition['$spinprocess.season_id$'] = { [Op.in]: idArray };
        }

        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:I1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Spinner Lint Cotton Stock Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Spinner Name", "Season", "Spin Lot No", "Reel Lot No", "Invoice No","Total Lint Cotton Received (Kgs)", "Total Lint Cotton Consumed (Kgs)",
            "Total Lint Cotton in Stock (Kgs)"]);
        headerRow.font = { bold: true };

        let include = [
            {
                model: Spinner,
                as: "spinner",
                attributes: []
            },
            {
                model: Season,
                as: "season",
                attributes: []
            },
            {
                model: Program,
                as: "program",
                attributes: []
            },
        ];

        let rows = await LintSelections.findAll({
            attributes:[
                [Sequelize.col('"spinprocess"."spinner"."id"'), 'spinner_id'],
                [Sequelize.col('"spinprocess"."spinner"."name"'), 'spinner_name'],
                [Sequelize.col('"spinprocess"."season"."id"'), 'season_id'],
                [Sequelize.col('"spinprocess"."season"."name"'), 'season_name'],
                [
                    Sequelize.literal('MIN(DISTINCT "spinprocess"."batch_lot_no")'),
                    'batch_lot_no'
                ],
                //this for comma separator batchlotno
                // [
                //     Sequelize.literal('ARRAY_TO_STRING(ARRAY_AGG(DISTINCT "spinprocess"."batch_lot_no"), \', \')'),
                //     'batch_lot_no'
                // ],
                [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('qty_used')), 0), 'cotton_consumed']
        ],
            where: whereCondition,
            include: [{
                model: SpinProcess,
                as: "spinprocess",
                include: include,
                attributes: []
            },{
                model: GinSales,
                as: "ginsales",
                attributes: [],
            },
            ],
            group: ['spinprocess.spinner.id','spinprocess.season.id'],
            order: [["spinner_id","desc"]]
        });

        let ndata =  [];
        for await (let spinner of rows){
            let salesData = await BaleSelection.findAll({
                attributes:[
                    [Sequelize.col('"sales"."invoice_no"'), 'invoice_no'],
                    [Sequelize.col('"bale"."ginprocess"."reel_lot_no"'), 'reel_lot_no'],
            ],
                where: {
                    '$sales.buyer$': spinner?.dataValues?.spinner_id,
                    '$sales.season_id$': spinner?.dataValues?.season_id,
                    '$sales.status$': 'Sold',
                },
                include: [{
                    model: GinSales,
                    as: "sales",
                    attributes: []
                },{
                    model: GinBale,
                    as: "bale",
                    include: [{
                        model: GinProcess,
                        as: "ginprocess",
                        attributes: [],
                    }],
                    attributes: [],
                },
                ], 
                group: ['sales.invoice_no','bale.ginprocess.reel_lot_no'],
            });

            let procuredCotton = await GinSales.findOne({
                attributes:[
                    [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col("total_qty")), 0), 'cotton_procured']
            ],
                where: {
                    buyer: spinner?.dataValues?.spinner_id,
                    season_id: spinner?.dataValues?.season_id,
                    status: 'Sold',
                },
            })

            for await (let item of salesData){
                let stockData = {
                    spinner_id: spinner?.dataValues?.spinner_id,
                    spinner_name: spinner?.dataValues?.spinner_name,
                    season_id: spinner?.dataValues?.season_id,
                    season_name: spinner?.dataValues?.season_name,
                    batch_lot_no: spinner?.dataValues?.batch_lot_no,
                    reel_lot_no: item?.dataValues?.reel_lot_no,
                    invoice_no: item?.dataValues?.invoice_no,
                    cotton_procured: procuredCotton ? procuredCotton?.dataValues?.cotton_procured : 0,
                    cotton_consumed: spinner ? spinner?.dataValues?.cotton_consumed : 0,
                    cotton_stock: Number(procuredCotton?.dataValues?.cotton_procured) >  Number(spinner?.dataValues?.cotton_consumed) ? Number(procuredCotton?.dataValues?.cotton_procured) -  Number(spinner?.dataValues?.cotton_consumed) : 0,
                }
                ndata.push(stockData)
            }

        }
        let data = ndata.slice(offset, offset + limit);

        // Append data to worksheet
        for await (const [index, item] of data.entries()) {
            const rowValues = Object.values({
                index: index + 1,
                spinner: item.spinner_name ? item.spinner_name : '',
                season: item.season_name ? item.season_name : '',
                batch_lot_no: item.batch_lot_no ? item.batch_lot_no : '',
                reel_lot_no: item.reel_lot_no ? item.reel_lot_no : '',
                invoice_no: item.invoice_no ? item.invoice_no : '',
                cotton_procured: item.cotton_procured ? item.cotton_procured : '',
                cotton_consumed: item.cotton_consumed ? item.cotton_consumed : '',
                cotton_stock: item.cotton_stock ? item.cotton_stock : '',
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
            data: process.env.BASE_URL + "spinner-lint-cotton-stock-report.xlsx",
        });

    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
}

const fetchGarmentFabricPagination = async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        let data: any = await sequelize.query(
            `SELECT "weaver_sales"."id", "weaver_sales"."weaver_id", "weaver_sales"."season_id", "weaver_sales"."date", "weaver_sales"."program_id", "weaver_sales"."order_ref", "weaver_sales"."buyer_id",  "weaver_sales"."transaction_via_trader", "weaver_sales"."transaction_agent", "weaver_sales"."fabric_type", "weaver_sales"."fabric_length", "weaver_sales"."fabric_gsm", "weaver_sales"."fabric_weight", "weaver_sales"."batch_lot_no", "weaver_sales"."job_details_garment","weaver_sales"."invoice_no", "weaver_sales"."vehicle_no","weaver_sales"."qty_stock", "weaver_sales"."qr", "program"."id" AS "program-id", "program"."program_name" AS "program_name", "fabric"."id" AS 
            "fabric_id", "fabric"."fabricType_name" AS "fabricType_name", "weaver"."id" AS "weaver-id", "weaver"."name" AS 
            "weaver_name", "garment"."name" as "garment_name" FROM "weaver_sales" AS "weaver_sales" LEFT OUTER JOIN "programs" AS "program" ON "weaver_sales"."program_id" = "program"."id" LEFT OUTER JOIN "fabric_types" AS "fabric" ON "weaver_sales"."fabric_type" = "fabric"."id" LEFT OUTER JOIN "weavers" AS "weaver" ON "weaver_sales"."weaver_id" = "weaver"."id" LEFT OUTER JOIN "garments" AS "garment" ON "weaver_sales"."buyer_id" = "garment"."id"
             UNION ALL 
             SELECT "knit_sales"."id", "knit_sales"."knitter_id", "knit_sales"."season_id", "knit_sales"."date", "knit_sales"."program_id", "knit_sales"."order_ref", "knit_sales"."buyer_id", "knit_sales"."transaction_via_trader", "knit_sales"."transaction_agent", "knit_sales"."fabric_type", "knit_sales"."fabric_length", "knit_sales"."fabric_gsm", "knit_sales"."fabric_weight", "knit_sales"."batch_lot_no", "knit_sales"."job_details_garment", "knit_sales"."invoice_no", "knit_sales"."vehicle_no", "knit_sales"."qty_stock", "knit_sales"."qr", "program"."id" AS "program-id", "program"."program_name" AS "program_name", "fabric"."id" AS "fabric_id", "fabric"."fabricType_name" AS "fabricType_name", "knitter"."id" AS "knitter-id", "knitter"."name" AS "knitter_name", "garment"."name" as "garment_name" FROM "knit_sales" AS "knit_sales" 
             LEFT OUTER JOIN "programs" AS "program" ON "knit_sales"."program_id" = "program"."id" LEFT OUTER JOIN "fabric_types" AS "fabric" ON "knit_sales"."fabric_type" = "fabric"."id" LEFT OUTER JOIN "knitters" AS "knitter" ON "knit_sales"."knitter_id" = "knitter"."id" LEFT OUTER JOIN "garments" AS "garment" ON "knit_sales"."buyer_id" = "garment"."id"
             OFFSET ${offset} 
             LIMIT ${limit}`,
        )
        return res.sendPaginationSuccess(res, data[1].rows, data[1].rowCount);
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }
};

const exportGarmentFabric = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "garment-fabric-report.xlsx");
    try {
        const whereCondition: any = {};
        const searchTerm = req.query.search || "";
        if (searchTerm) {
            whereCondition[Op.or] = [
                { '$garment.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { bale_ids: { [Op.iLike]: `%${searchTerm}%` } },
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
                { '$fabric.fabricType_name$': { [Op.iLike]: `%${searchTerm}%` } }
            ];
        }


        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:L1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Garment Fabric Sales Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Weave/Knit Uint", "Garment Processor Unit",
            "Invoice Number", "Lot/Batch No",
            "Fabirc Type", "No. of Bales/Rolls", "Bale/Roll Id", "Fabric in Mts", "Net Weight(Kgs)", "Qr code"
        ]);
        headerRow.font = { bold: true };
        let include = [
            {
                model: Program,
                as: 'program',
            },
            {
                model: Garment,
                as: 'buyer',
            },
            {
                model: FabricType,
                as: 'fabric',
            }
        ]
        let result: any = await Promise.all([
            WeaverSales.findAll({
                where: whereCondition,
                include: [...include, { model: Weaver, as: 'weaver', attributes: ['id', 'name'] }]
            }),
            KnitSales.findAll({
                where: whereCondition,
                include: [...include, { model: Knitter, as: 'knitter', attributes: ['id', 'name'] }]
            })
        ])
        let abc = result.flat()
        // Append data to worksheet
        for await (const [index, item] of abc.entries()) {

            const rowValues = Object.values({
                index: index + 1,
                date: item.date ? item.date : '',
                buyer: item.weaver ? item.weaver.name : item.knitter.name,
                garment_name: item.buyer ? item.buyer.name : '',
                invoice: item.invoice_no ? item.invoice_no : '',
                batch_lot_no: item.batch_lot_no ? item.batch_lot_no : '',
                fabric: item.fabric ? item.fabric.fabricType_name : '',
                no_of_pieces: item.no_of_pieces ? item.no_of_pieces : '',
                bale_ids: item.bale_ids ? item.bale_ids : '',
                fabric_length: item.fabric_length ? item.fabric_length : '',
                fabric_weight: item.fabric_weight ? item.fabric_weight : '',
                color: process.env.BASE_URL + item.qr ?? '',
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
            data: process.env.BASE_URL + "garment-fabric-report.xlsx",
        });
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);

    }
};


const fetchPscpPrecurement = async (req: Request, res: Response) => {
    try {
        let { seasonId }: any = req.query;
        const searchTerm = req.query.search || "";
        let whereCondition: any = {}
        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.season_id = { [Op.in]: idArray };
        }

        if (searchTerm) {
            whereCondition[Op.or] = [
              { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by first name
            ];
          }

        const result = await Farm.findAll({
            attributes: [
                [sequelize.col('season.id'), 'season_id'],
                [sequelize.col('season.name'), 'season_name'],
                [sequelize.fn('SUM', sequelize.col('total_estimated_cotton')), 'estimated_seed_cotton']
            ],
            include: [
                {
                    model: Season,
                    as: 'season',
                    attributes: []
                }
            ],
            where: whereCondition,
            group: ['season.id']
        });
        let data: any = [];
        for await (const [index, item] of result.entries()) {

            let obj: any = {}
            let procurementrow = await Transaction.findOne({
                attributes: [
                    [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")), 0), 'procurement_seed_cotton'],
                    [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('qty_stock')), 0), 'total_qty_lint_produced']
                ],
                where: { season_id: item.season_id }
            });
            let processgin = await GinProcess.findOne({
                attributes: [
                    [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('no_of_bales')), 0), 'no_of_bales']
                ],
                where: { season_id: item.season_id }
            })
            let ginbales = await GinBale.findOne({
                attributes: [
                    [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal('CAST("gin-bales"."weight" AS INTEGER)')), 0), 'total_qty']
                ],
                include: [
                    {
                        model: GinProcess,
                        as: 'ginprocess',
                        attributes: []
                    }
                ],
                where: {
                    '$ginprocess.season_id$': item.season_id
                },
                group: ["ginprocess.season_id"]
            });
            let processSale = await GinSales.findOne({
                attributes: [
                    [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('no_of_bales')), 0), 'no_of_bales'],
                    [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total_qty')), 0), 'total_qty']
                ],
                where: { season_id: item.season_id }
            })

            obj.estimated_seed_cotton = ((item?.dataValues.estimated_seed_cotton ?? 0) / 1000);
            obj.estimated_lint = (((item?.dataValues.estimated_seed_cotton ?? 0) * 35 / 100) / 1000);
            obj.procurement_seed_cotton = ((procurementrow?.dataValues?.procurement_seed_cotton ?? 0) / 1000);
            obj.procurement = Math.round(((procurementrow?.dataValues['procurement_seed_cotton'] / (item?.dataValues.estimated_seed_cotton ?? 0)) * 100));
            obj.procured_lint_cotton = (((procurementrow?.dataValues['procurement_seed_cotton'] ?? 0) * 35 / 100) / 1000);
            obj.no_of_bales = processgin?.dataValues.no_of_bales ?? 0;
            obj.total_qty_lint_produced = ginbales ? ((ginbales.dataValues.total_qty ?? 0) / 1000) : 0;
            obj.sold_bales = processSale?.dataValues['no_of_bales'] ?? 0;
            obj.average_weight = ((ginbales?.dataValues.total_qty ?? 0) / (obj.no_of_bales ?? 0));
            obj.total_qty_sold_lint = ((processSale?.dataValues['total_qty'] ?? 0) / 1000);
            obj.balace_stock = (obj.no_of_bales - obj.sold_bales) ?? 0;
            obj.balance_lint_quantity = (obj.total_qty_lint_produced - obj.total_qty_sold_lint);

            data.push({ season: item.dataValues.season_name, season_id: item.dataValues.season_id, ...obj });
        }
        return res.sendPaginationSuccess(res, data);
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }
}

const exportPscpCottonProcurement = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "pscp-cotton-procurement.xlsx");

    const searchTerm = req.query.search || "";
    const { seasonId }: any = req.query;
    const whereCondition: any = {};
    try {

        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.season_id = { [Op.in]: idArray };
        }

        if (searchTerm) {
            whereCondition[Op.or] = [
              { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by first name
            ];
          }
          
        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:N1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | PSCP Cotton Procurement Tracker';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Season", "Estimated seed cotton (in MT)", "Estimated Lint (in MT)",
            "Procured Seed Cotton (in MT)", "Procurement %", "Procured Lint Cotton (in MT)", "No of Bales",
            "Total Quantity of lint produced in (MT)", "Sold Bales", "Average Bale weight in Kgs", "Total Quantity of lint sold in (MT)", "Balance stock of bales",
            "Balance Lint Quantity stock in MT"
        ]);
        headerRow.font = { bold: true };
        const result = await Farm.findAll({
            attributes: [
                [sequelize.col('season.id'), 'season_id'],
                [sequelize.col('season.name'), 'season_name'],
                [sequelize.fn('SUM', sequelize.col('total_estimated_cotton')), 'estimated_seed_cotton']
            ],
            include: [
                {
                    model: Season,
                    as: 'season',
                    attributes: []
                }
            ],
            where: whereCondition,
            group: ['season.id']
        });
        // Append data to worksheet
        for await (const [index, item] of result.entries()) {
            let obj: any = {};
            let procurementrow = await Transaction.findOne({
                attributes: [
                    [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")), 0), 'procurement_seed_cotton'],
                    [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('qty_stock')), 0), 'total_qty_lint_produced']
                ],
                where: { season_id: item.season_id }
            });
            let processgin = await GinProcess.findOne({
                attributes: [
                    [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('no_of_bales')), 0), 'no_of_bales']
                ],
                where: { season_id: item.season_id }
            })
            let ginbales = await GinBale.findOne({
                attributes: [
                    [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal('CAST("gin-bales"."weight" AS INTEGER)')), 0), 'total_qty']
                ],
                include: [
                    {
                        model: GinProcess,
                        as: 'ginprocess',
                        attributes: []
                    }
                ],
                where: {
                    '$ginprocess.season_id$': item.season_id
                },
                group: ["ginprocess.season_id"]
            });
            let processSale = await GinSales.findOne({
                attributes: [
                    [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('no_of_bales')), 0), 'no_of_bales'],
                    [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total_qty')), 0), 'total_qty']
                ],
                where: { season_id: item.season_id }
            })

            obj.estimated_seed_cotton = ((item?.dataValues.estimated_seed_cotton ?? 0) / 1000);
            obj.estimated_lint = (((item?.dataValues.estimated_seed_cotton ?? 0) * 35 / 100) / 1000);
            obj.procurement_seed_cotton = ((procurementrow?.dataValues?.procurement_seed_cotton ?? 0) / 1000);
            obj.procurement = Math.round(((procurementrow?.dataValues['procurement_seed_cotton'] / (item?.dataValues.estimated_seed_cotton ?? 0)) * 100));
            obj.procured_lint_cotton = (((procurementrow?.dataValues['procurement_seed_cotton'] ?? 0) * 35 / 100) / 1000);
            obj.no_of_bales = processgin?.dataValues.no_of_bales ?? 0;
            obj.total_qty_lint_produced = ginbales ? ((ginbales.dataValues.total_qty ?? 0) / 1000) : 0;
            obj.sold_bales = processSale?.dataValues['no_of_bales'] ?? 0;
            obj.average_weight = ((ginbales?.dataValues.total_qty ?? 0) / (obj.no_of_bales ?? 0));
            obj.total_qty_sold_lint = ((processSale?.dataValues['total_qty'] ?? 0) / 1000);
            obj.balace_stock = (obj.no_of_bales - obj.sold_bales) ?? 0;
            obj.balance_lint_quantity = (obj.total_qty_lint_produced - obj.total_qty_sold_lint);

            const rowValues = Object.values({
                index: index + 1,
                name: item.dataValues.season_name ? item.dataValues.season_name : '',
                estimated_seed_cotton: obj.estimated_seed_cotton,
                estimated_lint: obj.estimated_lint,
                procurement_seed_cotton: obj.procurement_seed_cotton,
                procurement: obj.procurement,
                procured_lint_cotton: obj.procured_lint_cotton,
                no_of_bales: obj.no_of_bales,
                total_qty_lint_produced: obj.total_qty_lint_produced,
                sold_bales: obj.sold_bales,
                average_weight: obj.average_weight ? obj.average_weight : 0,
                total_qty_sold_lint: obj.total_qty_sold_lint ? obj.total_qty_sold_lint : 0,
                balace_stock: obj.balace_stock,
                balance_lint_quantity: obj.balance_lint_quantity
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
            data: process.env.BASE_URL + "pscp-cotton-procurement.xlsx",
        });
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);

    }
};

const fetchPscpGinnerPrecurement = async (req: Request, res: Response) => {
    try {
        let { seasonId, countryId }: any = req.query;
        const searchTerm = req.query.search || "";
        let whereCondition: any = {}

        if (searchTerm) {
            whereCondition[Op.or] = [
              { '$ginner.name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by first name
            ];
          }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.country_id = { [Op.in]: idArray };
        }

        const result = await Transaction.findAll({
            attributes: [
                [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")), 0), 'procurement_seed_cotton'],
                [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('qty_stock')), 0), 'total_qty_lint_produced']
            ],
            where: { season_id: seasonId, ...whereCondition },
            include: [
                {
                    model: Ginner,
                    as: 'ginner',
                    attributes: ['id', 'name']
                }
            ],
            group: ['mapped_ginner', 'ginner.id']
        });
        let data: any = [];
        for await (const [index, item] of result.entries()) {

            let obj: any = {}
            console.log(item)
            let processgin = await GinProcess.findOne({
                attributes: [
                    [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('no_of_bales')), 0), 'no_of_bales']
                ],
                where: { season_id: seasonId, ginner_id: item.dataValues.ginner.id },
            })
            let ginbales = await GinBale.findOne({
                attributes: [
                    [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal('CAST("gin-bales"."weight" AS INTEGER)')), 0), 'total_qty']
                ],
                include: [
                    {
                        model: GinProcess,
                        as: 'ginprocess',
                        attributes: []
                    }
                ],
                where: {
                    '$ginprocess.season_id$': seasonId,
                    '$ginprocess.ginner_id$': item.dataValues.ginner.id
                },
                group: ["ginprocess.season_id"]
            });
            let processSale = await GinSales.findOne({
                attributes: [
                    [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('no_of_bales')), 0), 'no_of_bales'],
                    [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total_qty')), 0), 'total_qty']
                ],
                where: { season_id: seasonId, ginner_id: item.dataValues.ginner.id }
            })


            obj.procurement_seed_cotton = ((item?.dataValues?.procurement_seed_cotton ?? 0) / 1000);
            obj.procured_lint_cotton = (((item?.dataValues['procurement_seed_cotton'] ?? 0) * 35 / 100) / 1000);
            obj.no_of_bales = processgin?.dataValues.no_of_bales ?? 0;
            obj.total_qty_lint_produced = ginbales ? ((ginbales.dataValues.total_qty ?? 0) / 1000) : 0;
            obj.sold_bales = processSale?.dataValues['no_of_bales'] ?? 0;
            obj.average_weight = ((ginbales?.dataValues.total_qty ?? 0) / (obj.no_of_bales ?? 0));
            obj.total_qty_sold_lint = ((processSale?.dataValues['total_qty'] ?? 0) / 1000);
            obj.balace_stock = (obj.no_of_bales - obj.sold_bales) ?? 0;
            obj.balance_lint_quantity = (obj.total_qty_lint_produced - obj.total_qty_sold_lint);
            obj.ginner = item.dataValues.ginner
            data.push(obj);
        }
        return res.sendPaginationSuccess(res, data);
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }
}

const exportPscpGinnerCottonProcurement = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "pscp-cotton-ginner-procurement.xlsx");

    const searchTerm = req.query.search || "";
    let { seasonId, countryId }: any = req.query;
    let whereCondition: any = {}
    try {

        if (searchTerm) {
            whereCondition[Op.or] = [
              { '$ginner.name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by first name
            ];
          }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.country_id = { [Op.in]: idArray };
        }

        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:L1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | PSCP Cotton Ginner Procurement Tracker';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Ginner Name",
            "Procured Seed Cotton (in MT)", "Procured Lint Cotton (in MT)", "No of Bales",
            "Total Quantity of lint produced in (MT)", "Sold Bales", "Average Bale weight in Kgs", "Total Quantity of lint sold in (MT)", "Balance stock of bales",
            "Balance Lint Quantity stock in MT"
        ]);
        headerRow.font = { bold: true };
        const result = await Transaction.findAll({
            attributes: [
                [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")), 0), 'procurement_seed_cotton'],
                [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('qty_stock')), 0), 'total_qty_lint_produced']
            ],
            where: { season_id: seasonId, ...whereCondition },
            include: [
                {
                    model: Ginner,
                    as: 'ginner',
                    attributes: ['id', 'name']
                }
            ],
            group: ['mapped_ginner', 'ginner.id']
        });
        let data: any = [];
        for await (const [index, item] of result.entries()) {

            let obj: any = {}
            let processgin = await GinProcess.findOne({
                attributes: [
                    [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('no_of_bales')), 0), 'no_of_bales']
                ],
                where: { season_id: seasonId, ginner_id: item.dataValues.ginner.id },
            })
            let ginbales = await GinBale.findOne({
                attributes: [
                    [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal('CAST("gin-bales"."weight" AS INTEGER)')), 0), 'total_qty']
                ],
                include: [
                    {
                        model: GinProcess,
                        as: 'ginprocess',
                        attributes: []
                    }
                ],
                where: {
                    '$ginprocess.season_id$': seasonId,
                    '$ginprocess.ginner_id$': item.dataValues.ginner.id
                },
                group: ["ginprocess.season_id"]
            });
            let processSale = await GinSales.findOne({
                attributes: [
                    [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('no_of_bales')), 0), 'no_of_bales'],
                    [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total_qty')), 0), 'total_qty']
                ],
                where: { season_id: seasonId, ginner_id: item.dataValues.ginner.id }
            })


            obj.procurement_seed_cotton = ((item?.dataValues?.procurement_seed_cotton ?? 0) / 1000);
            obj.procured_lint_cotton = (((item?.dataValues['procurement_seed_cotton'] ?? 0) * 35 / 100) / 1000);
            obj.no_of_bales = processgin?.dataValues.no_of_bales ?? 0;
            obj.total_qty_lint_produced = ginbales ? ((ginbales.dataValues.total_qty ?? 0) / 1000) : 0;
            obj.sold_bales = processSale?.dataValues['no_of_bales'] ?? 0;
            obj.average_weight = ((ginbales?.dataValues.total_qty ?? 0) / (obj.no_of_bales ?? 0));
            obj.total_qty_sold_lint = ((processSale?.dataValues['total_qty'] ?? 0) / 1000);
            obj.balace_stock = (obj.no_of_bales - obj.sold_bales) ?? 0;
            obj.balance_lint_quantity = (obj.total_qty_lint_produced - obj.total_qty_sold_lint);
            obj.ginner = item.dataValues.ginner
            data.push(obj);


            const rowValues = Object.values({
                index: index + 1,
                name: item.dataValues.ginner.name ? item.dataValues.ginner.name : '',
                procurement_seed_cotton: obj.procurement_seed_cotton,
                procured_lint_cotton: obj.procured_lint_cotton,
                no_of_bales: obj.no_of_bales,
                total_qty_lint_produced: obj.total_qty_lint_produced,
                sold_bales: obj.sold_bales,
                average_weight: obj.average_weight ? obj.average_weight : 0,
                total_qty_sold_lint: obj.total_qty_sold_lint ? obj.total_qty_sold_lint : 0,
                balace_stock: obj.balace_stock,
                balance_lint_quantity: obj.balance_lint_quantity
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
            data: process.env.BASE_URL + "pscp-cotton-ginner-procurement.xlsx",
        });
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);

    }
};

const fetchPscpProcurementLiveTracker = async (req: Request, res: Response) => {
    try {
        let { seasonId, countryId, brandId, ginnerId }: any = req.query;
        const searchTerm = req.query.search || "";
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        let whereCondition: any = {}
        let seasonCondition: any = {}
        let brandCondition: any = {}

        if (searchTerm) {
            // whereCondition[Op.or] = [
            //   { '$ginner.name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by first name
            // ];
            brandCondition[Op.or] = [
                { name: { [Op.iLike]: `%${searchTerm}%` } },
                { '$state.state_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by first name
              ];
          }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.country_id = { [Op.in]: idArray };
            brandCondition.country_id = { [Op.in]: idArray };
        }

        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.brand_id = { [Op.in]: idArray };
            brandCondition.brand = { [Op.overlap]: idArray };
        }

        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            seasonCondition.season_id = { [Op.in]: idArray };
        }

        if (ginnerId) {
            const idArray: number[] = ginnerId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            brandCondition.id = { [Op.in]: idArray };
        }

        let data: any = [];
        const ginners = await Ginner.findAll({where: brandCondition,
            include: [
                {
                    model: State,
                    as: 'state',
                    attributes: ['id', 'state_name']
                }
            ],});
        for await ( const [index, ginner] of ginners.entries()){
            let programs = ginner.dataValues.program_id;
            for await (let program of programs){

            const result = await Transaction.findAll({
                attributes: [
                    [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")), 0), 'procurement_seed_cotton'],
                    [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('qty_stock')), 0), 'total_qty_lint_produced']
                ],
                where: { program_id: program, mapped_ginner: ginner.dataValues.id , ...whereCondition, ...seasonCondition },
                include: [
                    {
                        model: Ginner,
                        as: 'ginner',
                        attributes: ['id', 'name']
                    }
                ],
                group: ['mapped_ginner', 'ginner.id']
            });
            
            for await (const [index, item] of result.entries()) {

                let obj: any = {}
                let processgin = await GinProcess.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('no_of_bales')), 0), 'no_of_bales']
                    ],
                    where: { program_id: program, ginner_id: item.dataValues.ginner.id,  ...seasonCondition },
                })
                let ginbales = await GinBale.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal('CAST("gin-bales"."weight" AS INTEGER)')), 0), 'total_qty']
                    ],
                    include: [
                        {
                            model: GinProcess,
                            as: 'ginprocess',
                            attributes: []
                        }
                    ],
                    where: {
                        '$ginprocess.program_id$': program,
                        '$ginprocess.ginner_id$': item.dataValues.ginner.id
                    },
                    group: ["ginprocess.season_id"]
                });

                let pendingSeedCotton = await Transaction.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")), 0), 'pending_seed_cotton'],
                    ],
                    where: { program_id: program, mapped_ginner: ginner.dataValues.id, status: "Pending", ...whereCondition, ...seasonCondition },
                });
                
                let processSale = await GinSales.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('no_of_bales')), 0), 'no_of_bales'],
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total_qty')), 0), 'total_qty']
                    ],
                    where: { program_id: program, ginner_id: item.dataValues.ginner.id,  ...seasonCondition }
                });

                let expectedQty = await GinnerExpectedCotton.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal('CAST(expected_seed_cotton AS DOUBLE PRECISION)')), 0), 'expected_seed_cotton'],
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal('CAST(expected_lint AS DOUBLE PRECISION)')), 0), 'expected_lint']
                    ],
                    where: { program_id: program, ginner_id: item.dataValues.ginner.id,  ...seasonCondition }
                })

                let ginnerOrder = await GinnerOrder.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal('CAST(confirmed_lint_order AS DOUBLE PRECISION)')), 0), 'confirmed_lint_order']
                    ],
                    where: { program_id: program, ginner_id: item.dataValues.ginner.id, ...seasonCondition }
                })

                obj.state = ginner?.dataValues?.state
                obj.program = await Program.findOne({attributes: ['id', 'program_name'], where:{id: program}});
                obj.expected_seed_cotton = ((expectedQty?.dataValues['expected_seed_cotton'] ?? 0));
                obj.expected_lint = ((expectedQty?.dataValues?.expected_lint ?? 0));
                obj.procurement_seed_cotton = ((item?.dataValues?.procurement_seed_cotton ?? 0));
                obj.procured_lint_cotton_kgs = ginbales ? (ginbales.dataValues.total_qty ?? 0) : 0;
                obj.procured_lint_cotton_mt = ginbales ? ((ginbales.dataValues.total_qty ?? 0) / 1000) : 0;
                obj.pending_seed_cotton = pendingSeedCotton ? pendingSeedCotton?.dataValues?.pending_seed_cotton : 0;
                obj.procurement = (expectedQty?.dataValues?.expected_seed_cotton !== 0 && item?.dataValues['procurement_seed_cotton'] !== 0) ? Math.round((((item?.dataValues['procurement_seed_cotton'] ?? 0) / (expectedQty?.dataValues?.expected_seed_cotton ?? 0)) * 100)) : 0;
                obj.no_of_bales = processgin?.dataValues.no_of_bales ?? 0;
                obj.total_qty_lint_produced = ginbales ? ((ginbales.dataValues.total_qty ?? 0) / 1000) : 0;
                obj.sold_bales = processSale?.dataValues['no_of_bales'] ?? 0;
                obj.average_weight = ((ginbales?.dataValues.total_qty ?? 0) / (obj.no_of_bales ?? 0));
                obj.total_qty_sold_lint = ((processSale?.dataValues['total_qty'] ?? 0) / 1000);
                obj.order_in_hand = (ginnerOrder?.dataValues['confirmed_lint_order'] ?? 0);
                obj.balace_stock = (obj.no_of_bales - obj.sold_bales) ?? 0;
                obj.balance_lint_quantity = (obj.total_qty_lint_produced - obj.total_qty_sold_lint);
                obj.ginner = item.dataValues.ginner
                obj.ginner_sale_percentage = 0;
                            if (obj.procured_lint_cotton_mt != 0) {
                                if (obj.total_qty_sold_lint > obj.procured_lint_cotton_mt) {
                                    obj.ginner_sale_percentage = Math.round((obj.procured_lint_cotton_mt / obj.total_qty_sold_lint
                                        ) * 100);
                                } else {
                                    obj.ginner_sale_percentage = Math.round((obj.total_qty_sold_lint / obj.procured_lint_cotton_mt
                                        ) * 100);
                                }
                            }
                data.push(obj);
            }
            }
        }
        let ndata = data.length > 0 ? data.slice(offset, offset + limit) : [];
        return res.sendPaginationSuccess(res, ndata, data.length > 0 ? data.length : 0);
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }
}

const exportPscpProcurementLiveTracker = async (req: Request, res: Response) => {
    try {
        const excelFilePath = path.join("./upload", "pscp-procurement-sell-live-tracker.xlsx");
        let { seasonId, countryId, brandId, ginnerId }: any = req.query;
        const searchTerm = req.query.search || "";
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        let whereCondition: any = {}
        let seasonCondition: any = {}
        let brandCondition: any = {}

        if (searchTerm) {
            brandCondition[Op.or] = [
                { name: { [Op.iLike]: `%${searchTerm}%` } },
                { '$state.state_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by first name
              ];
          }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.country_id = { [Op.in]: idArray };
            brandCondition.country_id = { [Op.in]: idArray };
        }

        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.brand_id = { [Op.in]: idArray };
            brandCondition.brand = { [Op.overlap]: idArray };
        }

        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            seasonCondition.season_id = { [Op.in]: idArray };
        }

        if (ginnerId) {
            const idArray: number[] = ginnerId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            brandCondition.id = { [Op.in]: idArray };
        }

        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:R1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | PSCP Procurement and Sell Live Tracker';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Ginning Mill", "State", "Program", "Expected Seed Cotton (KG)", "Expected Lint (MT)",
            "Procurement-Seed Cotton (KG)", "Procurement %", "Procurement-Seed Cotton Pending at Ginner (KG)","Procurement Lint in (KG)", "Procurement Lint (MT)", "No. of Bales of produced", "Bales Sold for this season", "LINT Sold for this season (MT)",
            "Ginner Order in Hand (MT)", "Balance stock in  bales with Ginner",
            "Balance stock with Ginner (MT)", "Ginner Sale %"
        ]);
        headerRow.font = { bold: true };

        let data: any = [];
        const ginners = await Ginner.findAll({where: brandCondition,
            include: [
                {
                    model: State,
                    as: 'state',
                    attributes: ['id', 'state_name']
                }
            ],});
        for await ( const [index, ginner] of ginners.entries()){
            let programs = ginner.dataValues.program_id;
            for await (let program of programs){

            const result = await Transaction.findAll({
                attributes: [
                    [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")), 0), 'procurement_seed_cotton'],
                    [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('qty_stock')), 0), 'total_qty_lint_produced']
                ],
                where: { program_id: program, mapped_ginner: ginner.dataValues.id , ...whereCondition, ...seasonCondition },
                include: [
                    {
                        model: Ginner,
                        as: 'ginner',
                        attributes: ['id', 'name']
                    }
                ],
                group: ['mapped_ginner', 'ginner.id']
            });
            
            for await (const [index, item] of result.entries()) {

                let obj: any = {}
                let processgin = await GinProcess.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('no_of_bales')), 0), 'no_of_bales']
                    ],
                    where: { program_id: program, ginner_id: item.dataValues.ginner.id,  ...seasonCondition },
                })
                let ginbales = await GinBale.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal('CAST("gin-bales"."weight" AS INTEGER)')), 0), 'total_qty']
                    ],
                    include: [
                        {
                            model: GinProcess,
                            as: 'ginprocess',
                            attributes: []
                        }
                    ],
                    where: {
                        '$ginprocess.program_id$': program,
                        '$ginprocess.ginner_id$': item.dataValues.ginner.id
                    },
                    group: ["ginprocess.season_id"]
                });

                let pendingSeedCotton = await Transaction.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")), 0), 'pending_seed_cotton'],
                    ],
                    where: { program_id: program, mapped_ginner: ginner.dataValues.id, status: "Pending", ...whereCondition, ...seasonCondition },
                });
                
                let processSale = await GinSales.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('no_of_bales')), 0), 'no_of_bales'],
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total_qty')), 0), 'total_qty']
                    ],
                    where: { program_id: program, ginner_id: item.dataValues.ginner.id,  ...seasonCondition }
                });

                let expectedQty = await GinnerExpectedCotton.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal('CAST(expected_seed_cotton AS DOUBLE PRECISION)')), 0), 'expected_seed_cotton'],
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal('CAST(expected_lint AS DOUBLE PRECISION)')), 0), 'expected_lint']
                    ],
                    where: { program_id: program, ginner_id: item.dataValues.ginner.id,  ...seasonCondition }
                })

                let ginnerOrder = await GinnerOrder.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal('CAST(confirmed_lint_order AS DOUBLE PRECISION)')), 0), 'confirmed_lint_order']
                    ],
                    where: { program_id: program, ginner_id: item.dataValues.ginner.id, ...seasonCondition }
                })

                obj.state = ginner?.dataValues?.state
                obj.program = await Program.findOne({attributes: ['id', 'program_name'], where:{id: program}});
                obj.expected_seed_cotton = ((expectedQty?.dataValues['expected_seed_cotton'] ?? 0));
                obj.expected_lint = ((expectedQty?.dataValues?.expected_lint ?? 0));
                obj.procurement_seed_cotton = ((item?.dataValues?.procurement_seed_cotton ?? 0));
                obj.procured_lint_cotton_kgs = ginbales ? (ginbales.dataValues.total_qty ?? 0) : 0;
                obj.procured_lint_cotton_mt = ginbales ? ((ginbales.dataValues.total_qty ?? 0) / 1000) : 0;
                obj.pending_seed_cotton = pendingSeedCotton ? pendingSeedCotton?.dataValues?.pending_seed_cotton : 0;
                obj.procurement = (expectedQty?.dataValues?.expected_seed_cotton !== 0 && item?.dataValues['procurement_seed_cotton'] !== 0) ? Math.round((((item?.dataValues['procurement_seed_cotton'] ?? 0) / (expectedQty?.dataValues?.expected_seed_cotton ?? 0)) * 100)) : 0;
                obj.no_of_bales = processgin?.dataValues.no_of_bales ?? 0;
                obj.total_qty_lint_produced = ginbales ? ((ginbales.dataValues.total_qty ?? 0) / 1000) : 0;
                obj.sold_bales = processSale?.dataValues['no_of_bales'] ?? 0;
                obj.average_weight = ((ginbales?.dataValues.total_qty ?? 0) / (obj.no_of_bales ?? 0));
                obj.total_qty_sold_lint = ((processSale?.dataValues['total_qty'] ?? 0) / 1000);
                obj.order_in_hand = (ginnerOrder?.dataValues['confirmed_lint_order'] ?? 0);
                obj.balace_stock = (obj.no_of_bales - obj.sold_bales) ?? 0;
                obj.balance_lint_quantity = (obj.total_qty_lint_produced - obj.total_qty_sold_lint);
                obj.ginner = item.dataValues.ginner
                obj.ginner_sale_percentage = 0;
                            if (obj.procured_lint_cotton_mt != 0) {
                                if (obj.total_qty_sold_lint > obj.procured_lint_cotton_mt) {
                                    obj.ginner_sale_percentage = Math.round((obj.procured_lint_cotton_mt / obj.total_qty_sold_lint
                                        ) * 100);
                                } else {
                                    obj.ginner_sale_percentage = Math.round((obj.total_qty_sold_lint / obj.procured_lint_cotton_mt
                                        ) * 100);
                                }
                            }
                data.push(obj);
            }
            }
        }

        let ndata = data.length > 0 ? data.slice(offset, offset + limit) : [];
        let index = 0;
        for await (const obj of ndata ){
            const rowValues = Object.values({
                index: index + 1,
                name: obj?.ginner ? obj.ginner.name : '',
                state: obj.state ? obj.state?.state_name : '',
                program: obj.program ? obj.program?.program_name : '',
                expected_seed_cotton: obj.expected_seed_cotton,
                expected_lint: obj.expected_lint,
                procurement_seed_cotton: obj.procurement_seed_cotton,
                procurement: obj.procurement,
                pending_seed_cotton: obj.pending_seed_cotton ? obj.pending_seed_cotton : '',
                procured_lint_cotton_kgs: obj.procured_lint_cotton_kgs,
                procured_lint_cotton_mt: obj.procured_lint_cotton_mt,
                no_of_bales: obj.no_of_bales,
                sold_bales: obj.sold_bales ? obj.sold_bales : '',
                total_qty_sold_lint: obj.total_qty_sold_lint? obj.total_qty_sold_lint : 0,
                order_in_hand: obj.order_in_hand ? obj.order_in_hand : '',
                balace_stock: obj.balace_stock,
                balance_lint_quantity: obj.balance_lint_quantity,
                ginner_sale_percentage: obj.ginner_sale_percentage
            });
            index++;
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
            data: process.env.BASE_URL + "pscp-procurement-sell-live-tracker.xlsx",
        });
        // let ndata = data.length > 0 ? data.slice(offset, offset + limit) : [];
        // return res.sendPaginationSuccess(res, ndata, data.length > 0 ? data.length : 0);
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }
}

const consolidatedTraceability = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
                { style_mark_no: { [Op.iLike]: `%${searchTerm}%` } },
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$buyer.brand_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { garment_type: { [Op.iLike]: `%${searchTerm}%` } },
            ];
        }
        whereCondition.status = 'Sold';

        let include = [
            {
                model: Brand,
                as: "buyer",
                attributes: ['id', 'brand_name', 'address']
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
                model: Garment,
                as: "garment",
                attributes: ['id', 'name', 'address']
            }
        ];

        //fetch data with pagination
        const { count, rows } = await GarmentSales.findAndCountAll({
            where: whereCondition,
            include: include,
            order: [
                [
                    'accept_date', 'asc'
                ]
            ],
            offset: offset,
            limit: limit,
        });
        for await (let [index, item] of rows.entries()) {
            let fabric = await FabricSelection.findAll({
                where: {
                    sales_id: item.dataValues.id
                },
                attributes: ['id', 'fabric_id', 'processor']
            })

            let knit_fabric_ids = fabric.filter((obj: any) => obj.dataValues.processor === 'knitter').map((obj: any) => obj.dataValues.fabric_id);
            let weaver_fabric_ids = fabric.filter((obj: any) => obj.dataValues.processor === 'weaver').map((obj: any) => obj.dataValues.fabric_id);
            let knitSales: any = [];
            let knit_yarn_ids: any
            if (knit_fabric_ids.length > 0) {
                knitSales = await KnitSales.findAll({
                    include: [
                        {
                            model: Knitter,
                            as: 'knitter',
                            attributes: ['id', 'name'],
                        },
                        {
                            model: FabricType,
                            as: 'fabric',
                            attributes: ['fabricType_name'],
                        }
                    ],
                    where: {
                        id: {
                            [Op.in]: knit_fabric_ids
                        }
                    },
                    raw: true // Return raw data
                })
                let knitYarn = KnitYarnSelection.findAll({
                    where: {
                        sales_id: knitSales.map((obj: any) => obj.id)
                    },
                    attributes: ['id', 'yarn_id']
                })
                knit_yarn_ids = knitYarn.map((obj: any) => obj.dataValues.yarn_id);

            }
            let weaverSales: any = [];
            let weave_yarn_ids: any
            if (weaver_fabric_ids.length > 0) {
                weaverSales = await WeaverSales.findAll({
                    include: [
                        {
                            model: Weaver,
                            as: 'weaver',
                            attributes: ['id', 'name'],
                        },
                        {
                            model: FabricType,
                            as: 'fabric',
                            attributes: ['fabricType_name'],
                        }
                    ],
                    where: {
                        id: {
                            [Op.in]: weaver_fabric_ids
                        }
                    },
                    raw: true // Return raw data
                })
                let weaverYarn = await YarnSelection.findAll({
                    where: {
                        sales_id: weaverSales.map((obj: any) => obj.id)
                    },
                    attributes: ['id', 'yarn_id']
                })
                weave_yarn_ids = weaverYarn.map((obj: any) => obj.dataValues.yarn_id);
            }
            let spinSales;
            let spnr_lint_ids: any
            if (weave_yarn_ids.length > 0 || knit_yarn_ids.length > 0) {
                spinSales = await SpinSales.findAll({
                    include: [
                        {
                            model: Spinner,
                            as: 'spinner',
                            attributes: ['id', 'name'],
                        },
                        {
                            model: YarnCount,
                            as: 'yarncount',
                            attributes: ['yarnCount_name'],
                        }
                    ],
                    where: {
                        id: {
                            [Op.in]: [...weave_yarn_ids, knit_yarn_ids]
                        }
                    }
                })
                let spinSaleProcess = await SpinProcessYarnSelection.findAll({
                    where: {
                        sales_id: spinSales.map((obj: any) => obj.dataValues.id)
                    },
                    attributes: ['id', 'spin_process_id']
                })
                let spinProcess = await LintSelections.findAll({
                    where: {
                        process_id: spinSaleProcess.map((obj: any) => obj.dataValues.spin_process_id)
                    },
                    attributes: ['id', 'lint_id']
                })
                spnr_lint_ids = spinProcess.map((obj: any) => obj.dataValues.lint_id);
            }
            let ginSales
            if (spnr_lint_ids.length > 0) {
                ginSales = await GinSales.findAll({
                    include: [
                        {
                            model: Ginner,
                            as: 'ginner',
                            attributes: ['id', 'name'],
                        }
                    ],
                    where: {
                        id: {
                            [Op.in]: spnr_lint_ids
                        }
                    }
                })
            }

        }

        return res.sendPaginationSuccess(res, rows, count);

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}


export {
    fetchBaleProcess,
    exportPendingGinnerSales,
    exportGinnerProcess,
    fetchPendingGinnerSales,
    fetchGinSalesPagination,
    exportGinnerSales,
    fetchSpinnerBalePagination,
    fetchSpinnerPendingBale,
    exportSpinnerBale,
    exportPendingSpinnerBale,
    fetchSpinnerYarnProcessPagination,
    exportSpinnerYarnProcess,
    fetchSpinSalesPagination,
    exportSpinnerSale,
    fetchKnitterYarnPagination,
    exportKnitterYarn,
    fetchKnitterSalesPagination,
    exportKnitterSale,
    fetchWeaverYarnPagination,
    exportWeaverYarn,
    fetchWeaverSalesPagination,
    exportWeaverSale,
    fetchQrCodeTrackPagination,
    exportQrCodeTrack,
    fetchSpinnerSummaryPagination,
    exportSpinnerSummary,
    fetchGinnerSummaryPagination,
    exportGinnerSummary,
    fetchGinnerCottonStock,
    exportGinnerCottonStock,
    fetchSpinnerLintCottonStock,
    exportSpinnerCottonStock,
    fetchGarmentSalesPagination,
    exportGarmentSales,
    fetchGarmentFabricPagination,
    exportGarmentFabric,
    fetchPscpPrecurement,
    exportPscpCottonProcurement,
    consolidatedTraceability,
    fetchPscpGinnerPrecurement,
    exportPscpGinnerCottonProcurement,
    fetchPscpProcurementLiveTracker,
    exportPscpProcurementLiveTracker
}