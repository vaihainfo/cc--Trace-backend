import { Request, Response } from "express";
import { Sequelize, Op, where } from "sequelize";
import { generateOnlyQrCode } from "../../provider/qrcode";
import Spinner from "../../models/spinner.model";
import Ginner from "../../models/ginner.model";
import QualityParameter from "../../models/quality-parameter.model";
import * as ExcelJS from "exceljs";
import * as fs from "fs";
import * as path from "path";
import GinProcess from "../../models/gin-process.model";
import Season from "../../models/season.model";

//create Quality Parameter 
const createQualityParameter = async (req: Request, res: Response) => {
    try {
        let result: any = []
        for await (const quality of req.body.testReport) {
            const data = {
                ginner_id: quality.ginnerId ? quality.ginnerId : undefined,
                process_id: quality.processId,
                spinner_id: quality.spinnerId ? quality.spinnerId : undefined,
                sold_to: quality.soldId,
                test_report: quality.testReport,
                lab_name: quality.labName ? quality.labName : undefined,
                sci: quality.sci,
                moisture: quality.moisture,
                mic: quality.mic,
                mat: quality.mat,
                uhml: quality.uhml,
                ui: quality.ui,
                sf: quality.sf,
                str: quality.str,
                elg: quality.elg,
                rd: quality.rd,
                plusb: quality.plusb,
                document: quality.document
            };
            const quali = await QualityParameter.create(data);
            result.push(quali);
        }

        res.sendSuccess(res, { result });
    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.meessage);
    }
}


const fetchQualityParameterPagination = async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { spinnerId, ginnerId } = req.query
    const offset = (page - 1) * limit;
    const whereCondition: any = {}
    try {
        if (spinnerId) {
            whereCondition.spinner_id = spinnerId
        }
        if (ginnerId) {
            whereCondition.ginner_id = ginnerId
        }


        let include = [
            {
                model: GinProcess, as: 'process'
            },
            {
                model: Ginner, as: 'ginner'
            },
            {
                model: Spinner, as: 'spinner'
            }
        ]

        //fetch data with pagination
        if (req.query.pagination === 'true') {
            const { count, rows } = await QualityParameter.findAndCountAll({
                where: whereCondition,
                include: include,
                offset: offset,
                limit: limit
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const result = await QualityParameter.findAll({
                where: whereCondition,
                include: include

            });
            return res.sendSuccess(res, result);
        }

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const fetchQualityParameter = async (req: Request, res: Response) => {
    try {
        let include = [
            {
                model: GinProcess, as: 'process'
            },
            {
                model: Ginner, as: 'ginner'
            },
            {
                model: Spinner, as: 'spinner'
            }
        ]

        const result = await QualityParameter.findOne({
            where: { id: req.query.id },
            include: include

        });
        return res.sendSuccess(res, result);

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

//Export the Quality Parameter details through excel file
const exportQualityParameter = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "quality-parameter.xlsx");

    try {
        // Create the excel workbook file
        const { spinnerId, ginnerId } = req.query
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:U1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Cotton Quality Parameter';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", 'Ginner/Spinner Name', 'Season', 'No of Bales', 'Date of Process', 'Date of Report',
            'Gin/Bale Lot Number', 'REEL Lot Number', 'Sold To', 'Lab Name', 'SCI', 'Moisture (%)',
            'Mic', 'Mat', 'UHML (mm)', 'UI (%)', 'SF (%)', 'Str (g/tex)', 'Elg (%)', 'Rd', '+b'

        ]);
        headerRow.font = { bold: true };
        const whereCondition: any = {}
        if (spinnerId) {
            whereCondition.spinner_id = spinnerId
        }
        if (ginnerId) {
            whereCondition.ginner_id = ginnerId
        }
        let include = [
            {
                model: GinProcess, as: 'process', include: [{
                    model: Season, as: 'season'
                }]
            },
            {
                model: Ginner, as: 'ginner'
            },
            {
                model: Spinner, as: 'spinner'
            }
        ]
        const gin = await QualityParameter.findAll({
            where: whereCondition,
            include: include,
        });
        // Append data to worksheet
        for await (const [index, item] of gin.entries()) {
            const rowValues = Object.values({
                index: index + 1,
                name: item.ginner ? item.ginner.name : item.spinner.name,
                season: item.process ? item.process.season.name : '',
                no_of_bales: item.process ? item.process.no_of_bales : '',
                processDate: item.process ? item.process.date : '',
                date: item.test_report ? item.test_report : '',
                lot_no: item.process ? item.process.lot_no : '',
                reel_lot_no: item.process ? item.process.reel_lot_no : '',
                buyer: item.sold_to ? item.sold_to : '',
                lab_name: item.lab_name ? item.lab_name : '',
                sci: item.sci ? item.sci : ' ',
                moisture: item.moisture ? item.moisture : ' ',
                mic: item.mic ? item.mic : ' ',
                mat: item.mat ? item.mat : ' ',
                uhml: item.uhml ? item.uhml : ' ',
                ui: item.ui ? item.ui : ' ',
                sf: item.sf ? item.sf : ' ',
                str: item.str ? item.str : ' ',
                elg: item.elg ? item.elg : ' ',
                rd: item.rd ? item.rd : ' ',
                plusb: item.plusb ? item.plusb : ' ',
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
            data: process.env.BASE_URL + "quality-parameter.xlsx",
        });
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);

    }
};

//Export the Quality Parameter Single detail through excel file
const exportSingleQualityParameter = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "quality-parameter.xlsx");

    try {
        // Create the excel workbook file
        const { qualityId } = req.query;
        if (!qualityId) {
            return res.sendError(res, 'NEED_PARAMETER_ID');
        }
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:P1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Cotton Quality Parameter';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", 'Gin Lot Number', 'REEL Lot Number', 'Lab Name', 'Date of Report', 'SCI', 'Moisture (%)',
            'Mic', 'Mat', 'UHML (mm)', 'UI (%)', 'SF (%)', 'Str (g/tex)', 'Elg (%)', 'Rd', '+b'

        ]);
        headerRow.font = { bold: true };
        const whereCondition: any = {};
        whereCondition.id = qualityId
        let include = [
            {
                model: GinProcess, as: 'process',
            }
        ]
        const item = await QualityParameter.findOne({
            where: whereCondition,
            include: include,
        });
        // Append data to worksheet
        const rowValues = Object.values({
            index: 1,
            lot_no: item.process ? item.process.lot_no : '',
            reel_lot_no: item.process ? item.process.reel_lot_no : '',
            lab_name: item.lab_name ? item.lab_name : '',
            date: item.test_report ? item.test_report : '',
            sci: item.sci ? item.sci : ' ',
            moisture: item.moisture ? item.moisture : ' ',
            mic: item.mic ? item.mic : ' ',
            mat: item.mat ? item.mat : ' ',
            uhml: item.uhml ? item.uhml : ' ',
            ui: item.ui ? item.ui : ' ',
            sf: item.sf ? item.sf : ' ',
            str: item.str ? item.str : ' ',
            elg: item.elg ? item.elg : ' ',
            rd: item.rd ? item.rd : ' ',
            plusb: item.plusb ? item.plusb : ' ',
        });
        worksheet.addRow(rowValues);

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
            data: process.env.BASE_URL + "quality-parameter.xlsx",
        });
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);

    }
};

export {
    createQualityParameter,
    fetchQualityParameterPagination,
    fetchQualityParameter,
    exportQualityParameter,
    exportSingleQualityParameter
}