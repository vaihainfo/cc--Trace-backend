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
            let ginner = await Ginner.findAll({ brand: { [Op.contains]: idArray } });
            const arry: number[] = ginner
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.ginner_id = { [Op.in]: arry };
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
            let ginner = await Ginner.findAll({ country_id: { [Op.in]: idArray } });
            const arry: number[] = ginner
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.ginner_id = { [Op.in]: arry };
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
                    [sequelize.fn('max', sequelize.col('bale_no')), 'pressno_to']
                ],
                where: { process_id: row.dataValues.id }
            });
            sendData.push({
                ...row.dataValues, village: village,
                gin_press_no: (bale.dataValues.pressno_from || '') + "-" + (bale.dataValues.pressno_to || ''),
                lint_quantity: bale.dataValues.lint_quantity,
                reel_press_no: row.dataValues.no_of_bales === 0 ? "" : `001-${(row.dataValues.no_of_bales < 9) ? `00${row.dataValues.no_of_bales}` : (row.dataValues.no_of_bales < 99) ? `0${row.dataValues.no_of_bales}` : row.dataValues.no_of_bales}`
            })
        }
        return res.sendPaginationSuccess(res, sendData, count);

    } catch (error: any) {
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
            let ginner = await Ginner.findAll({ where: { brand: { [Op.contains]: idArray } } });
            const arry: number[] = ginner
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.ginner_id = { [Op.in]: arry };
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
            let ginner = await Ginner.findAll({ country_id: { [Op.in]: idArray } });
            const arry: number[] = ginner
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.ginner_id = { [Op.in]: arry };
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
            "Sr No.", "Date", "Season", "Ginner Name", "Gin Lot No", "Gin Press No", "REEL Lot No", "REEL Process Nos", "No of Bales"
            , "Staple Length(mm)", "Strength (g/tex)", "Mic", "Uniformity", "RD Value", "Quantity(Kgs)", "Program", "Village", "GOT", "Total Seed Cotton Consumed(Kgs)",
            "Status"
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

            let reel_press_no = item.no_of_bales === 0 ? "" : `001-${(item.no_of_bales < 9) ? `00${item.no_of_bales}` : (item.no_of_bales < 99) ? `0${item.no_of_bales}` : item.no_of_bales}`

            const rowValues = Object.values({
                index: index + 1,
                date: item.date ? item.date : '',
                season: item.season ? item.season.name : '',
                ginner: item.ginner ? item.ginner.name : '',
                lot_no: item.lot_no ? item.lot_no : '',
                press_no: item.press_no ? item.press_no : '',
                reel_lot_no: item.reel_lot_no ? item.reel_lot_no : '',
                process_no: reel_press_no ? reel_press_no : "-",
                noOfBales: item.no_of_bales ? item.no_of_bales : 0,
                staple: item.staple ? item.staple : '',
                strength: item.strength ? item.strength : '',
                mic: item.mic ? item.mic : '',
                trash: item.trash ? item.trash : "",
                rdValue: "",
                total_qty: item.total_qty ? item.total_qty : '',
                program: item.program ? item.program.program_name : '',
                village: village.map((obj: any) => obj.village.village_name),
                got: item.gin_out_turn ? item.gin_out_turn : '',
                seedConsmed: bale.dataValues.lint_quantity ? bale.dataValues.lint_quantity : '',
                status: `Available [Stocks : 0]`
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

const fetchGinSalesPagination = async (req: Request, res: Response) => {
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
            let ginner = await Ginner.findAll({ where: { brand: { [Op.contains]: idArray } } });
            const arry: number[] = ginner
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.ginner_id = { [Op.in]: arry };
        }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            let ginner = await Ginner.findAll({ where: { country_id: { [Op.in]: idArray } } });
            const arry: number[] = ginner
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.ginner_id = { [Op.in]: arry };
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

const exportPendingGinnerSales = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "Ginner-pending-sales-report.xlsx");
    const searchTerm = req.query.search || "";
    const status = req.query.status || 'To be Submitted';
    const { ginnerId, seasonId, programId, brandId, countryId }: any = req.query;
    const whereCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
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
            let ginner = await Ginner.findAll({ where: { brand: { [Op.contains]: idArray } } });
            const arry: number[] = ginner
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.ginner_id = { [Op.in]: arry };
        }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            let ginner = await Ginner.findAll({ where: { country_id: { [Op.in]: idArray } } });
            const arry: number[] = ginner
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.ginner_id = { [Op.in]: arry };
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
            let ginner = await Ginner.findAll({ where: { brand: { [Op.contains]: idArray } } });
            const arry: number[] = ginner
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.ginner_id = { [Op.in]: arry };
        }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            let ginner = await Ginner.findAll({ where: { country_id: { [Op.in]: idArray } } });
            const arry: number[] = ginner
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.ginner_id = { [Op.in]: arry };
        }

        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.season_id = { [Op.in]: idArray };
        }
        whereCondition.status = { [Op.ne]: 'To be Submitted' };

        if (programId) {
            const idArray: number[] = programId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.program_id = { [Op.in]: idArray };
        }

        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:U1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Ginner Sales Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Season", "Ginner Name",
            "Invoice No", "Sold To", "Bale Lot No", "REEL Lot No", "No of Bales", "Press/Bale No", "Rate/Kg",
            "Total Quantity", "Program", "Village", "Agent Detials", "status"
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
        const { count, rows } = await GinSales.findAndCountAll({
            where: whereCondition,
            include: include,
            offset: offset,
            limit: limit
        });
        // Append data to worksheet
        for await (const [index, item] of rows.entries()) {
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
                village: '',
                agentDetails: item.transaction_agent ? item.transaction_agent : 'NA',
                status: `Available [Stock : ${item.qty_stock ? item.qty_stock : 0}]`
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
    const status = req.query.status || 'To be Submitted';
    const { spinnerId, seasonId, programId, brandId, countryId }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
                { lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { press_no: { [Op.iLike]: `%${searchTerm}%` } },
            ];

        }
        if (spinnerId) {
            const idArray: number[] = spinnerId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.buyer = { [Op.in]: idArray };
        }
        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            let ginner = await Spinner.findAll({ where: { brand: { [Op.contains]: idArray } } });
            const arry: number[] = ginner
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.buyer = { [Op.in]: arry };
        }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            let ginner = await Spinner.findAll({ where: { country_id: { [Op.in]: idArray } } });
            const arry: number[] = ginner
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.buyer = { [Op.in]: arry };
        }

        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.season_id = { [Op.in]: idArray };
        }
        if (status === 'Sold') {
            whereCondition.status = 'Sold';
        } else {
            whereCondition.total_qty = {
                [Op.gt]: 0
            }
            whereCondition.status = 'Pending for QR scanning';
        }
        whereCondition.buyer = {
            [Op.ne]: null
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

// const exportSpinnerBaleSales = async (req: Request, res: Response) => {
//     const excelFilePath = path.join("./upload", "Ginner-sales-report.xlsx");
//     const searchTerm = req.query.search || "";
//     const page = Number(req.query.page) || 1;
//     const limit = Number(req.query.limit) || 10;
//     const { ginnerId, seasonId, programId, brandId, countryId }: any = req.query;
//     const offset = (page - 1) * limit;
//     const whereCondition: any = {};
//     try {
//         if (searchTerm) {
//             whereCondition[Op.or] = [
//                 { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
//                 { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
//                 { lot_no: { [Op.iLike]: `%${searchTerm}%` } },
//                 { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
//                 { press_no: { [Op.iLike]: `%${searchTerm}%` } },
//             ];

//         }
//         if (ginnerId) {
//             const idArray: number[] = ginnerId
//                 .split(",")
//                 .map((id: any) => parseInt(id, 10));
//             whereCondition.ginner_id = { [Op.in]: idArray };
//         }
//         if (brandId) {
//             const idArray: number[] = brandId
//                 .split(",")
//                 .map((id: any) => parseInt(id, 10));
//             let ginner = await Ginner.findAll({ where: { brand: { [Op.contains]: idArray } } });
//             const arry: number[] = ginner
//                 .map((gin: any) => parseInt(gin.id, 10));
//             whereCondition.ginner_id = { [Op.in]: arry };
//         }

//         if (countryId) {
//             const idArray: number[] = countryId
//                 .split(",")
//                 .map((id: any) => parseInt(id, 10));
//             let ginner = await Ginner.findAll({ where: { country_id: { [Op.in]: idArray } } });
//             const arry: number[] = ginner
//                 .map((gin: any) => parseInt(gin.id, 10));
//             whereCondition.ginner_id = { [Op.in]: arry };
//         }

//         if (seasonId) {
//             const idArray: number[] = seasonId
//                 .split(",")
//                 .map((id: any) => parseInt(id, 10));
//             whereCondition.season_id = { [Op.in]: idArray };
//         }
//         whereCondition.status = { [Op.ne]: 'To be Submitted' };

//         if (programId) {
//             const idArray: number[] = programId
//                 .split(",")
//                 .map((id: any) => parseInt(id, 10));
//             whereCondition.program_id = { [Op.in]: idArray };
//         }

//         // Create the excel workbook file
//         const workbook = new ExcelJS.Workbook();
//         const worksheet = workbook.addWorksheet("Sheet1");
//         worksheet.mergeCells('A1:U1');
//         const mergedCell = worksheet.getCell('A1');
//         mergedCell.value = 'CottonConnect | Ginner Sales Report';
//         mergedCell.font = { bold: true };
//         mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
//         // Set bold font for header row
//         const headerRow = worksheet.addRow([
//             "Sr No.", "Date", "Season", "Ginner Name",
//             "Invoice No", "Sold To", "Bale Lot No", "REEL Lot No", "No of Bales", "Press/Bale No", "Rate/Kg",
//             "Total Quantity", "Program", "Village", "Agent Detials", "status"
//         ]); 
//         headerRow.font = { bold: true };
//         let include = [
//             {
//                 model: Ginner,
//                 as: "ginner",
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
//                 model: Spinner,
//                 as: "buyerdata",
//                 attributes: ['id', 'name']
//             }
//         ];
//         const { count, rows } = await GinSales.findAndCountAll({
//             where: whereCondition,
//             include: include,
//             offset: offset,
//             limit: limit
//         });
//         // Append data to worksheet
//         for await (const [index, item] of rows.entries()) {
//             const rowValues = Object.values({
//                 index: index + 1,
//                 date: item.date ? item.date : '',
//                 season: item.season ? item.season.name : '',
//                 ginner: item.ginner ? item.ginner.name : '',
//                 invoice: item.invoice_no ? item.invoice_no : '',
//                 buyer: item.buyerdata ? item.buyerdata.name : '',
//                 lot_no: item.lot_no ? item.lot_no : '',
//                 reel_lot_no: item.reel_lot_no ? item.reel_lot_no : '',
//                 no_of_bales: item.no_of_bales ? item.no_of_bales : '',
//                 press_no: item.press_no ? item.press_no : '',
//                 rate: item.rate ? item.rate : '',
//                 total_qty: item.total_qty ? item.total_qty : '',
//                 program: item.program ? item.program.program_name : '',
//                 village: '',
//                 agentDetails: item.transaction_agent ? item.transaction_agent : 'NA',
//                 status: `Available [Stock : ${item.qty_stock ? item.qty_stock : 0}]`
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
//             data: process.env.BASE_URL + "Ginner-sales-report.xlsx",
//         });
//     } catch (error: any) {
//         console.error("Error appending data:", error);
//         return res.sendError(res, error.message);

//     }
// };


export {
    fetchBaleProcess,
    exportPendingGinnerSales,
    exportGinnerProcess,
    fetchGinSalesPagination,
    exportGinnerSales,
    fetchSpinnerBalePagination
}