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

const exportSpinnerBale = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "Ginner-sales-report.xlsx");
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
        whereCondition.status = 'Sold';
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
        mergedCell.value = 'CottonConnect | Spinner Bale Receipt Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Season", "Spinner Name", "Ginner Name",
            "Invoice No", "No of Bales", "Lot No", "REEL Lot No", "Press/Bale No",
            "Total Quantity", "Program", "Village"
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
                buyer: item.buyerdata ? item.buyerdata.name : '',
                ginner: item.ginner ? item.ginner.name : '',
                invoice: item.invoice_no ? item.invoice_no : '',
                no_of_bales: item.no_of_bales ? item.no_of_bales : '',
                lot_no: item.lot_no ? item.lot_no : '',
                reel_lot_no: item.reel_lot_no ? item.reel_lot_no : '',
                press_no: item.press_no ? item.press_no : '',
                total_qty: item.total_qty ? item.total_qty : '',
                program: item.program ? item.program.program_name : '',
                village: ''
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

const exportPendingSpinnerBale = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "Spinner-Pending-Bales-Receipt-Report.xlsx");
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const pagination = req.query.pagination;
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
            "Invoice No", "No of Bales", "Lot No", "REEL Lot No", "Press/Bale No",
            "Total Quantity", "Program", "Vehicle No"
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
            let { count, rows } = await GinSales.findAndCountAll({
                where: whereCondition,
                include: include,
                offset: offset,
                limit: limit
            });
            rows = rows;
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
                press_no: item.press_no ? item.press_no : '',
                total_qty: item.total_qty ? item.total_qty : '',
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
            let ginner = await Spinner.findAll({ where: { brand: { [Op.contains]: idArray } } });
            const arry: number[] = ginner
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.spinner_id = { [Op.in]: arry };
        }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            let ginner = await Spinner.findAll({ where: { country_id: { [Op.in]: idArray } } });
            const arry: number[] = ginner
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.spinner_id = { [Op.in]: arry };
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
                as: "yarncount",
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
        return res.sendPaginationSuccess(res, rows, count);

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
            let ginner = await Spinner.findAll({ where: { brand: { [Op.contains]: idArray } } });
            const arry: number[] = ginner
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.spinner_id = { [Op.in]: arry };
        }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            let ginner = await Spinner.findAll({ where: { country_id: { [Op.in]: idArray } } });
            const arry: number[] = ginner
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.spinner_id = { [Op.in]: arry };
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
        worksheet.mergeCells('A1:Q1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Spinner Yarn Process Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Season", "Spinner Name",
            "Spin Lot No", "Yarn Reel Lot No", "Bale Reel Lot No", "Yarn Type", "Yarn Count", "Yarn Realisation %", "No of Boxes",
            "Box ID", "Blend", "Blend Qty", "Total Yarn weight (Kgs)", "Program", "Total Lint Consumed"
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
            },
            {
                model: YarnCount,
                as: "yarncount",
            }
        ];
        const { count, rows } = await SpinProcess.findAndCountAll({
            where: whereCondition,
            include: include,
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

            const rowValues = Object.values({
                index: index + 1,
                date: item.date ? item.date : '',
                season: item.season ? item.season.name : '',
                spinner: item.spinner ? item.spinner.name : '',
                lotNo: item.batch_lot_no ? item.batch_lot_no : '',
                reel_lot_no: item.reel_lot_no ? item.reel_lot_no : '',
                bale_lot_no: item.bale_lot_no ? item.bale_lot_no : '',
                yarnType: item.yarn_type ? item.yarn_type : '',
                count: item.yarncount ? item.yarncount.yarnCount_name : '',
                resa: item.yarn_realisation ? item.yarn_realisation : '',
                boxes: item.no_of_boxes ? item.no_of_boxes : '',
                boxId: item.box_id ? item.box_id : '',
                blend: blendValue,
                blendqty: blendqty,
                total: item.net_yarn_qty,
                program: item.program ? item.program.program_name : '',
                lint: item.net_yarn_qty,
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
                { '$spinner.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$weaver.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$knitter.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { order_ref: { [Op.iLike]: `%${searchTerm}%` } },
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
                { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { yarn_type: { [Op.iLike]: `%${searchTerm}%` } },
            ];
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
            let ginner = await Spinner.findAll({ where: { brand: { [Op.contains]: idArray } } });
            const arry: number[] = ginner
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.spinner_id = { [Op.in]: arry };
        }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            let ginner = await Spinner.findAll({ where: { country_id: { [Op.in]: idArray } } });
            const arry: number[] = ginner
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.spinner_id = { [Op.in]: arry };
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
                { '$spinner.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$weaver.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$knitter.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { order_ref: { [Op.iLike]: `%${searchTerm}%` } },
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
                { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { yarn_type: { [Op.iLike]: `%${searchTerm}%` } },
            ];
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
            let ginner = await Spinner.findAll({ where: { brand: { [Op.contains]: idArray } } });
            const arry: number[] = ginner
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.spinner_id = { [Op.in]: arry };
        }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            let ginner = await Spinner.findAll({ where: { country_id: { [Op.in]: idArray } } });
            const arry: number[] = ginner
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.spinner_id = { [Op.in]: arry };
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
        worksheet.mergeCells('A1:Q1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Spinner Yarn Sales Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Season", "Spinner Name", "Knitter/Weaver Name",
            "Invoice No", "Lot/Batch Number", "Reel Lot No", "Village", "Cotton Mix Types", "Cotton Mix Qty (kgs)", "Yarn Type", "Yarn Count", "No of Boxes",
            "Box ID", "Net Weight(Kgs)", "Agent Details"
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
        const { count, rows } = await SpinSales.findAndCountAll({
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
                spinner: item.spinner ? item.spinner.name : '',
                buyer_id: item.weaver ? item.weaver.name : item.knitter ? item.knitter.name : '',
                invoice: item.invoice_no ? item.invoice_no : '',
                lotNo: item.batch_lot_no ? item.batch_lot_no : '',
                reelLot: item.reel_lot_no ? item.reel_lot_no : '',
                village: '',
                blend: "",
                blendqty: '',
                yarnType: item.yarn_type ? item.yarn_type : '',
                count: item.yarn_count ? item.yarn_count : '',
                boxes: item.no_of_boxes ? item.no_of_boxes : '',
                boxId: item.box_ids ? item.box_ids : '',
                total: item.total_qty,
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
            let knitter = await Knitter.findAll({ where: { brand: { [Op.contains]: idArray } } });
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
            let knitter = await Knitter.findAll({ where: { brand: { [Op.contains]: idArray } } });
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
        const rows = await SpinSales.findAndCount({
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
            let knitter = await Knitter.findAll({ where: { brand: { [Op.contains]: idArray } } });
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
            let knitter = await Knitter.findAll({ where: { brand: { [Op.contains]: idArray } } });
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
            let weaver = await Weaver.findAll({ where: { brand: { [Op.contains]: idArray } } });
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
            let weaver = await Weaver.findAll({ where: { brand: { [Op.contains]: idArray } } });
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
            let weaver = await Weaver.findAll({ where: { brand: { [Op.contains]: idArray } } });
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
            let weaver = await Weaver.findAll({ where: { brand: { [Op.contains]: idArray } } });
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
            let weaver = await Garment.findAll({ where: { brand: { [Op.contains]: idArray } } });
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
    const { weaverId, seasonId, programId, brandId, countryId }: any = req.query;
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
            let weaver = await Weaver.findAll({ where: { brand: { [Op.contains]: idArray } } });
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
                { style_mark_no: { [Op.iLike]: `%${searchTerm}%` } },
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$buyer.brand_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { garment_type: { [Op.iLike]: `%${searchTerm}%` } },
            ];
        }
        whereCondition.status = 'Sold';
        if (garmentId) {
            const idArray: number[] = garmentId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.garment_id = { [Op.in]: idArray };
        }
        // if (brandId) {
        //     const idArray: number[] = brandId
        //         .split(",")
        //         .map((id: any) => parseInt(id, 10));
        //     let weaver = await Weaver.findAll({ where: { brand: { [Op.contains]: idArray } } });
        //     const arry: number[] = weaver
        //         .map((gin: any) => parseInt(gin.id, 10));
        //     whereCondition.weaver_id = { [Op.in]: arry };
        // }

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
        return res.sendPaginationSuccess(res, rows, count);

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const exportQrCodeTrack = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "barcode-report.xlsx");

    try {
        const whereCondition: any = {};
        const searchTerm = req.query.search || "";
        if (searchTerm) {
            whereCondition[Op.or] = [
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
                { style_mark_no: { [Op.iLike]: `%${searchTerm}%` } },
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$buyer.brand_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { garment_type: { [Op.iLike]: `%${searchTerm}%` } },
            ];
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

//fetch Qr Code Tracker with filters
const fetchSpinnerSummaryPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { spinnerId, seasonId, programId, brandId, countryId }: any = req.query;
    const whereCondition: any = {};
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
            whereCondition.brand = { [Op.contains]: idArray };
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
            whereCondition.program_id = { [Op.contains]: idArray };
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
            }

            let [lint_cotton_procured, lint_cotton_procured_pending, lint_consumed, yarnSold] = await Promise.all([
                GinSales.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total_qty')), 0), 'lint_cotton_procured']
                    ],
                    where: {
                        ...wheree,
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
                        buyer: spinner.id,
                        status: 'Pending for QR scanning'
                    }
                }),
                SpinProcess.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('net_yarn_qty')), 0), 'yarn_procured'],
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total_qty')), 0), 'lint_consumed_total'],
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('qty_stock')), 0), 'lint_consumed_stock']
                    ],
                    where: {
                        ...wheree,
                        spinner_id: spinner.id
                    }
                }),
                SpinSales.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total_qty')), 0), 'yarn_sold']
                    ],
                    where: {
                        ...wheree,
                        spinner_id: spinner.id
                    }
                })
            ])
            obj.lint_cotton_procured = lint_cotton_procured.dataValues.lint_cotton_procured ?? 0;
            obj.lint_cotton_procured_pending = lint_cotton_procured_pending.dataValues.lint_cotton_procured_pending ?? 0;
            obj.lint_consumed = (lint_consumed.dataValues.lint_consumed_total - lint_consumed.dataValues.lint_consumed_stock) ?? 0;
            obj.yarn_procured = lint_consumed.dataValues.yarn_procured ?? 0;
            obj.yarn_sold = yarnSold.dataValues.yarn_sold ?? 0;
            obj.balance_lint_cotton = (obj.lint_cotton_procured - obj.lint_consumed) ?? 0;
            obj.yarn_stock = (obj.yarn_procured - obj.yarn_sold) ?? 0;
            obj.lint_cotton_procured = convert_kg_to_mt(obj.lint_cotton_procured);
            obj.lint_cotton_procured_pending = convert_kg_to_mt(obj.lint_cotton_procured_pending);
            obj.lint_consumed = convert_kg_to_mt(obj.lint_consumed);
            obj.yarn_sold = convert_kg_to_mt(obj.yarn_sold);
            obj.yarn_procured = convert_kg_to_mt(obj.yarn_procured);
            obj.balance_lint_cotton = convert_kg_to_mt(obj.balance_lint_cotton);
            obj.yarn_stock = convert_kg_to_mt(obj.yarn_stock);
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
            whereCondition.brand = { [Op.contains]: idArray };
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
            whereCondition.program_id = { [Op.contains]: idArray };
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
            "Sr No.", "Spinner Name", "Total Lint Cotton Procured MT", "Total Lint Cotton Procured MT Pending",
            "Total Lint Consumed", "Total Yarn Produced MT", "Yarn sold in MT", "Balance Lint cotton stock in MT",
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
            }

            let [lint_cotton_procured, lint_cotton_procured_pending, lint_consumed, yarnSold] = await Promise.all([
                GinSales.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total_qty')), 0), 'lint_cotton_procured']
                    ],
                    where: {
                        ...wheree,
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
                        buyer: item.id,
                        status: 'Pending for QR scanning'
                    }
                }),
                SpinProcess.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('net_yarn_qty')), 0), 'yarn_procured'],
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total_qty')), 0), 'lint_consumed_total'],
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('qty_stock')), 0), 'lint_consumed_stock']
                    ],
                    where: {
                        ...wheree,
                        spinner_id: item.id
                    }
                }),
                SpinSales.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total_qty')), 0), 'yarn_sold']
                    ],
                    where: {
                        ...wheree,
                        spinner_id: item.id
                    }
                })
            ])
            obj.lint_cotton_procured = lint_cotton_procured.dataValues.lint_cotton_procured ?? 0;
            obj.lint_cotton_procured_pending = lint_cotton_procured_pending.dataValues.lint_cotton_procured_pending ?? 0;
            obj.lint_consumed = (lint_consumed.dataValues.lint_consumed_total - lint_consumed.dataValues.lint_consumed_stock) ?? 0;
            obj.yarn_procured = lint_consumed.dataValues.yarn_procured ?? 0;
            obj.yarn_sold = yarnSold.dataValues.yarn_sold ?? 0;
            obj.balance_lint_cotton = (obj.lint_cotton_procured - obj.lint_consumed) ?? 0;
            obj.yarn_stock = (obj.yarn_procured - obj.yarn_sold) ?? 0;
            obj.lint_cotton_procured = convert_kg_to_mt(obj.lint_cotton_procured);
            obj.lint_cotton_procured_pending = convert_kg_to_mt(obj.lint_cotton_procured_pending);
            obj.lint_consumed = convert_kg_to_mt(obj.lint_consumed);
            obj.yarn_sold = convert_kg_to_mt(obj.yarn_sold);
            obj.yarn_procured = convert_kg_to_mt(obj.yarn_procured);
            obj.balance_lint_cotton = convert_kg_to_mt(obj.balance_lint_cotton);
            obj.yarn_stock = convert_kg_to_mt(obj.yarn_stock);

            const rowValues = Object.values({
                index: index + 1,
                name: item.name ? item.name : '',
                lint_cotton_procured: obj.lint_cotton_procured,
                lint_cotton_procured_pending: obj.lint_cotton_procured_pending,
                lint_consumed: obj.lint_consumed,
                yarn_sold: obj.yarn_sold,
                yarn_procured: obj.yarn_procured,
                balance_lint_cotton: obj.balance_lint_cotton,
                yarn_stock: obj.yarn_stock,
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
            whereCondition.brand = { [Op.contains]: idArray };
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
            whereCondition.program_id = { [Op.contains]: idArray };
        }

        let { count, rows } = await Ginner.findAndCountAll({ where: whereCondition, attributes: ["id", "name", "address"], offset: offset, limit: limit });
        let result: any = [];
        for await (let ginner of rows) {
            let obj: any = {};


            let [cottonProcuredCur, qtyPrev, weightcurrent, weightPrev, linSoldCurr, linSoldPrev]: any = await Promise.all([
                Transaction.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal("CAST(qty_purchased AS INTEGER)")), 0), 'qty']
                    ],
                    where: {
                        season_id: 13,
                        mapped_ginner: ginner.id
                    }
                }),
                Transaction.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal("CAST(qty_purchased AS INTEGER)")), 0), 'qty']
                    ],
                    where: {
                        season_id: 14,
                        mapped_ginner: ginner.id
                    }
                }),
                GinBale.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.literal('CAST("gin-bales"."weight" AS INTEGER)')), 0), 'qty'],
                    ],
                    include: [
                        {
                            model: GinProcess,
                            as: 'ginprocess',
                            attributes: []
                        }
                    ],
                    where: {
                        '$ginprocess.season_id$': 13,
                        '$ginprocess.ginner_id$': ginner.id
                    },
                    group: ["ginprocess.ginner_id"]
                }),
                GinBale.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.literal('CAST("gin-bales"."weight" AS INTEGER)')), 0), 'qty'],
                    ],
                    include: [
                        {
                            model: GinProcess,
                            as: 'ginprocess',
                            attributes: []
                        }
                    ],
                    where: {
                        '$ginprocess.season_id$': 14,
                        '$ginprocess.ginner_id$': ginner.id
                    },
                    group: ["ginprocess.ginner_id"]
                }),
                BaleSelection.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.literal('CAST("bale"."weight" AS INTEGER)')), 0), 'qty'],
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
                        '$sales.season_id$': 13,
                        '$sales.ginner_id$': ginner.id
                    },
                    group: ["sales.ginner_id"]
                }),
                BaleSelection.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.literal('CAST("bale"."weight" AS INTEGER)')), 0), 'qty'],
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
                        '$sales.season_id$': 14,
                        '$sales.ginner_id$': ginner.id
                    },
                    group: ["sales.ginner_id"]
                })
            ])
            obj.cottonProcuredCurKg = cottonProcuredCur.dataValues.qty ?? 0;
            obj.cottonProcuredPreKg = qtyPrev.dataValues.qty ?? 0;
            obj.cottonProcuredCurMt = convert_kg_to_mt(cottonProcuredCur?.dataValues.qty ?? 0);
            obj.cottonProcuredPreMt = convert_kg_to_mt(qtyPrev?.dataValues.qty ?? 0);
            obj.lintProcuredCurMt = convert_kg_to_mt(weightcurrent?.dataValues.qty ?? 0);
            obj.lintProcuredPreMt = convert_kg_to_mt(weightPrev?.dataValues.qty ?? 0);
            obj.lintSoldCurKg = weightcurrent?.dataValues.qty ?? 0;
            obj.lintSoldPreKg = weightPrev?.dataValues.qty ?? 0;
            obj.lintSoldCur = convert_kg_to_mt(linSoldCurr?.dataValues.qty ?? 0);
            obj.lintSoldPre = convert_kg_to_mt(linSoldPrev?.dataValues.qty ?? 0);
            obj.lintStockPreMt = (obj.lintProcuredPreMt - obj.lintSoldPre);
            obj.lintStockCurMt = (obj.lintProcuredCurMt - obj.lintSoldCur);
            obj.lintSoldPrePercentage = (obj.lintSoldPreKg / (linSoldPrev?.dataValues.qty ?? 0)) * 100;
            obj.lintSoldCurPercentage = (obj.lintSoldCurKg / (linSoldCurr?.dataValues.qty ?? 0)) * 100;
            result.push({ ...obj, ginner });
        }
        //fetch data with pagination

        return res.sendPaginationSuccess(res, result, count);

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const exportGinnerSummary = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "ginner-summary.xlsx");

    const searchTerm = req.query.search || "";
    const { spinnerId, seasonId, programId, brandId, countryId }: any = req.query;
    const whereCondition: any = {};
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
            whereCondition.brand = { [Op.contains]: idArray };
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
            whereCondition.program_id = { [Op.contains]: idArray };
        }

        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:L1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Ginner Summary Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Ginner Name", "Total seed cotton procured in previous seasons [Kgs]", "Total seed cotton procured in previous seasons [MT]",
            "Total seed cotton procured current season [Kgs]", "Total seed cotton procured current season [MT]", "Total lint produce in previous seasons [MT]", "Total lint produce in current season [MT]",
            "Total lint stock from previous seasons [MT]", "Total lint stock from current seasons [MT]", "% lint sold from previous season", "% lint sold from current season"
        ]);
        headerRow.font = { bold: true };
        let rows = await Ginner.findAll({ where: whereCondition, attributes: ["id", "name", "address"] });
        // Append data to worksheet
        for await (const [index, item] of rows.entries()) {
            let obj: any = {};


            let [cottonProcuredCur, qtyPrev, weightcurrent, weightPrev, linSoldCurr, linSoldPrev]: any = await Promise.all([
                Transaction.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal("CAST(qty_purchased AS INTEGER)")), 0), 'qty']
                    ],
                    where: {
                        season_id: 13,
                        mapped_ginner: item.id
                    }
                }),
                Transaction.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal("CAST(qty_purchased AS INTEGER)")), 0), 'qty']
                    ],
                    where: {
                        season_id: 14,
                        mapped_ginner: item.id
                    }
                }),
                GinBale.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.literal('CAST("gin-bales"."weight" AS INTEGER)')), 0), 'qty'],
                    ],
                    include: [
                        {
                            model: GinProcess,
                            as: 'ginprocess',
                            attributes: []
                        }
                    ],
                    where: {
                        '$ginprocess.season_id$': 13,
                        '$ginprocess.ginner_id$': item.id
                    },
                    group: ["ginprocess.ginner_id"]
                }),
                GinBale.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.literal('CAST("gin-bales"."weight" AS INTEGER)')), 0), 'qty'],
                    ],
                    include: [
                        {
                            model: GinProcess,
                            as: 'ginprocess',
                            attributes: []
                        }
                    ],
                    where: {
                        '$ginprocess.season_id$': 14,
                        '$ginprocess.ginner_id$': item.id
                    },
                    group: ["ginprocess.ginner_id"]
                }),
                BaleSelection.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.literal('CAST("bale"."weight" AS INTEGER)')), 0), 'qty'],
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
                        '$sales.season_id$': 13,
                        '$sales.ginner_id$': item.id
                    },
                    group: ["sales.ginner_id"]
                }),
                BaleSelection.findOne({
                    attributes: [
                        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.literal('CAST("bale"."weight" AS INTEGER)')), 0), 'qty'],
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
                        '$sales.season_id$': 14,
                        '$sales.ginner_id$': item.id
                    },
                    group: ["sales.ginner_id"]
                })
            ])
            obj.cottonProcuredCurKg = cottonProcuredCur.dataValues.qty ?? 0;
            obj.cottonProcuredPreKg = qtyPrev.dataValues.qty ?? 0;
            obj.cottonProcuredCurMt = convert_kg_to_mt(cottonProcuredCur?.dataValues.qty ?? 0);
            obj.cottonProcuredPreMt = convert_kg_to_mt(qtyPrev?.dataValues.qty ?? 0);
            obj.lintProcuredCurMt = convert_kg_to_mt(weightcurrent?.dataValues.qty ?? 0);
            obj.lintProcuredPreMt = convert_kg_to_mt(weightPrev?.dataValues.qty ?? 0);
            obj.lintSoldCurKg = weightcurrent?.dataValues.qty ?? 0;
            obj.lintSoldPreKg = weightPrev?.dataValues.qty ?? 0;
            obj.lintSoldCur = convert_kg_to_mt(linSoldCurr?.dataValues.qty ?? 0);
            obj.lintSoldPre = convert_kg_to_mt(linSoldPrev?.dataValues.qty ?? 0);
            obj.lintStockPreMt = (obj.lintProcuredPreMt - obj.lintSoldPre);
            obj.lintStockCurMt = (obj.lintProcuredCurMt - obj.lintSoldCur);
            obj.lintSoldPrePercentage = (obj.lintSoldPreKg / (linSoldPrev?.dataValues.qty ?? 0)) * 100;
            obj.lintSoldCurPercentage = (obj.lintSoldCurKg / (linSoldCurr?.dataValues.qty ?? 0)) * 100;

            const rowValues = Object.values({
                index: index + 1,
                name: item.name ? item.name : '',
                cottonProcuredPreKg: obj.cottonProcuredPreKg,
                cottonProcuredPreMt: obj.cottonProcuredPreMt,
                cottonProcuredCurKg: obj.cottonProcuredCurKg,
                cottonProcuredCurMt: obj.cottonProcuredCurMt,
                lintProcuredPreMt: obj.lintProcuredPreMt,
                lintProcuredCurMt: obj.lintProcuredCurMt,
                lintStockPreMt: obj.lintStockPreMt,
                lintStockCurMt: obj.lintStockCurMt,
                lintSoldPrePercentage: obj.lintSoldPrePercentag ? obj.lintSoldPrePercentage : 0,
                lintSoldCurPercentage: obj.lintSoldCurPercentage ? obj.lintSoldCurPercentage : 0
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
}
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
        let result = await Promise.all([
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
        let whereCondition: any = {}
        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.season_id = { [Op.in]: idArray };
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
                    [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal("CAST(qty_purchased AS INTEGER)")), 0), 'procurement_seed_cotton'],
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
                    [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal("CAST(qty_purchased AS INTEGER)")), 0), 'procurement_seed_cotton'],
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



export {
    fetchBaleProcess,
    exportPendingGinnerSales,
    exportGinnerProcess,
    fetchGinSalesPagination,
    exportGinnerSales,
    fetchSpinnerBalePagination,
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
    fetchGarmentSalesPagination,
    exportGarmentSales,
    fetchGarmentFabricPagination,
    exportGarmentFabric,
    fetchPscpPrecurement,
    exportPscpCottonProcurement
}