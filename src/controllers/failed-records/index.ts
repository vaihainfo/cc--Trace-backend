import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import * as ExcelJS from "exceljs";
import * as fs from "fs";
import * as path from "path";
import FailedRecords from "../../models/failed-records.model";
import Season from "../../models/season.model";
import ExportData from "../../models/export-data-check.model";

const saveFailedRecord = async (data: any) => {
    try {
        let body = data.body ? data.body : null;
        const ndata = {
            season_id: data.season ? data.season.dataValues.id : null,
            type: data.type,
            farmer_code: data.farmerCode ? data.farmerCode : null,
            farmer_name: data.farmerName ? data.farmerName : null,
            reason: data.reason ? data.reason : null,
            body: body
        };
        const failedRecords = await FailedRecords.create(ndata);
        return failedRecords;
    } catch (error) {
        console.log(error)
    }
}

const fetchFailedRecords = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { type, seasonId, startDate, endDate }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};

    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { farmer_code: { [Op.iLike]: `%${searchTerm}%` } },
                { farmer_name: { [Op.iLike]: `%${searchTerm}%` } },
                { reason: { [Op.iLike]: `%${searchTerm}%` } },
                { type: { [Op.iLike]: `%${searchTerm}%` } },
            ];
        }

        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.season_id = { [Op.in]: idArray };
        }

        if (type) {
            const idArray: string[] = type
                .split(",")
                .map((id: any) => id);
            whereCondition.type = { [Op.in]: idArray };
        }

        if (startDate && endDate) {
            const startOfDay = new Date(startDate);
            startOfDay.setUTCHours(0, 0, 0, 0);
            const endOfDay = new Date(endDate);
            endOfDay.setUTCHours(23, 59, 59, 999);
            whereCondition.date = { [Op.between]: [startOfDay, endOfDay] }
        }

        const { count, rows } = await FailedRecords.findAndCountAll({
            where: whereCondition,
            include: [{
                model: Season,
                as: "season",
                attributes: ["id", "name"]
            }],
            order: [
                ['id', "desc"]
            ],
            offset: offset,
            limit: limit,
        });
        return res.sendPaginationSuccess(res, rows, count);
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
}

const exportFailedRecords = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "excel-failed-records.xlsx");
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { exportType, type, seasonId, startDate, endDate }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};

    try {
        if (exportType === "all") {

            return res.status(200).send({
                success: true,
                messgage: "File successfully Generated",
                data: process.env.BASE_URL + `${type}-failed-records.xlsx`,
            });

        } else {
            if (searchTerm) {
                whereCondition[Op.or] = [
                    { farmer_code: { [Op.iLike]: `%${searchTerm}%` } },
                    { farmer_name: { [Op.iLike]: `%${searchTerm}%` } },
                    { reason: { [Op.iLike]: `%${searchTerm}%` } },
                    { type: { [Op.iLike]: `%${searchTerm}%` } },
                ];
            }

            if (seasonId) {
                const idArray: number[] = seasonId
                    .split(",")
                    .map((id: any) => parseInt(id, 10));
                whereCondition.season_id = { [Op.in]: idArray };
            }

            if (type) {
                const idArray: string[] = type
                    .split(",")
                    .map((id: any) => id);
                whereCondition.type = { [Op.in]: idArray };
            }

            if (startDate && endDate) {
                const startOfDay = new Date(startDate);
                startOfDay.setUTCHours(0, 0, 0, 0);
                const endOfDay = new Date(endDate);
                endOfDay.setUTCHours(23, 59, 59, 999);
                whereCondition.date = { [Op.between]: [startOfDay, endOfDay] }
            }

            // Create the excel workbook file
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Sheet1");
            worksheet.mergeCells('A1:G1');
            const mergedCell = worksheet.getCell('A1');
            mergedCell.value = 'CottonConnect | Failed Records';
            mergedCell.font = { bold: true };
            mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
            // Set bold font for header row
            const headerRow = worksheet.addRow([
                "Sr No.", "Upload Date", "Upload Type", "Season", "Farmer Code", "Farmer Name", "Reason"
            ]);
            headerRow.font = { bold: true };

            const { count, rows } = await FailedRecords.findAndCountAll({
                where: whereCondition,
                attributes: ['createdAt', 'type', 'farmer_code', 'farmer_name', 'reason'],
                include: [{
                    model: Season,
                    as: "season",
                    attributes: ["id", "name"]
                }],
                order: [
                    ['id', "desc"]
                ],
                offset: offset,
                limit: limit,
            });

            // Append data to worksheet
            for (let i = 0; i < count; i++) {
                const row = rows[i];
                if (row && row.createdAt) {
                    const rowValues = Object.values({
                        index: i + 1,
                        date: row.createdAt,
                        type: row.type || '',
                        season: row.season ? row.season.name : '',
                        code: row.farmer_code || '',
                        name: row.farmer_name || '',
                        reason: row.reason || '',
                    });
                    worksheet.addRow(rowValues);
                }
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
                data: process.env.BASE_URL + "excel-failed-records.xlsx",
            });
        }

    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
}

export {
    saveFailedRecord,
    fetchFailedRecords,
    exportFailedRecords
};