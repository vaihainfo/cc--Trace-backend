import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import GarmentSales from "../../models/garment-sales.model";
import * as ExcelJS from "exceljs";
import * as fs from "fs";
import * as path from "path";
import Brand from "../../models/brand.model";

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




export {
    fetchBrandQrGarmentSalesPagination,
    exportBrandQrGarmentSales
}