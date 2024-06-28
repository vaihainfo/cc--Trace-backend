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
import Country from "../../models/country.model";
import GinSales from "../../models/gin-sales.model";

//create Quality Parameter 
const createQualityParameter = async (req: Request, res: Response) => {
    try {
        let result: any = []
        console.log(req.body.testReport)
        for await (const quality of req.body.testReport) {
            const data = {
                ginner_id: quality.ginnerId ? quality.ginnerId : undefined,
                process_id: quality.processId,
                spinner_id: quality.spinnerId ? quality.spinnerId : undefined,
                sold_to: quality.soldId ? quality.soldId : undefined,
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
                document: quality.document,
                sales_id: quality.salesId ? quality.salesId : null,
                lot_no: quality.ginLotNo,
                reel_lot_no: quality.reelLotNo
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
    const searchTerm: any = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { spinnerId, ginnerId, brandId, countryId, stateId, date, type }: any = req.query
    const offset = (page - 1) * limit;
    const whereCondition: any = {};

    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
            ]
        }

        if (type) {
            if (type === 'ginner') {
                whereCondition.ginner_id = { [Op.not]: null }
            }
            if (type === 'spinner') {
                whereCondition.spinner_id = { [Op.not]: null }
            }
        }

        if (spinnerId) {
            const idArray: number[] = spinnerId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.spinner_id = { [Op.in]: idArray };
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
            whereCondition[Op.or] = [{ ["$ginner.brand$"]: { [Op.overlap]: idArray } },
            { ["$spinner.brand$"]: { [Op.overlap]: idArray } }];
        }

        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition[Op.or] = [{ ["$ginner.country_id$"]: { [Op.in]: idArray } },
            { ["$spinner.country_id$"]: { [Op.in]: idArray } }];
        }
        if (stateId) {
            const idArray: number[] = stateId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition[Op.or] = [{ ["$ginner.state_id$"]: { [Op.in]: idArray } },
            { ["$spinner.state_id$"]: { [Op.in]: idArray } }];
        }
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setUTCHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setUTCHours(23, 59, 59, 999);
            whereCondition.test_report = { [Op.between]: [startOfDay, endOfDay] }
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
            },
            {
                model: Spinner, as: 'sold'
            },
            {
                model: GinSales, as: 'sales'
            }
        ]
        const { count, rows } = await QualityParameter.findAndCountAll({
            where: whereCondition,
            include: include,
            order: [
                [
                    'id', 'desc'
                ]
            ]
        });
        let data: any = [];

        if (searchTerm) {
            data = rows?.filter((row: any) => {
                return (row.sold && row.sold.name && row.sold?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (row.sales && row.sales.name && row.sales?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (row.spinner && row.spinner.name && row.spinner?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (row.ginner && row.ginner.name && row.ginner?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (row.process && row.process.name && row.process?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (row.lot_no && row.lot_no?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (row.reel_lot_no && row.reel_lot_no?.toLowerCase().includes(searchTerm.toLowerCase()))
            });
        }

        //fetch data with pagination
        if (req.query.pagination === 'true') {
            if (searchTerm) {
                let ndata = data.length > 0 ? data.slice(offset, offset + limit) : [];
                return res.sendPaginationSuccess(res, ndata, data.length > 0 ? data.length : 0);
            }

            let ndata = rows.length > 0 ? rows.slice(offset, offset + limit) : [];

            return res.sendPaginationSuccess(res, ndata, count);
        } else {
            if (searchTerm) {
                return res.sendSuccess(res, data);
            }
            return res.sendSuccess(res, rows);
        }

    } catch (error: any) {
        console.log(error)
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
                model: GinSales, as: 'sales'
            },
            {
                model: Ginner, as: 'ginner'
            },
            {
                model: Spinner, as: 'spinner'
            },
            {
                model: Spinner, as: 'sold'
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
        const searchTerm = req.query.search || "";
        // Create the excel workbook file
        const { spinnerId, ginnerId, brandId, countryId, date, type }: any = req.query
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
        if (searchTerm) {
            whereCondition[Op.or] = [
                { lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { '$process.lot_no$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$process.reel_lot_no$': { [Op.iLike]: `%${searchTerm}%` } }
            ];
        }
        if (type) {
            if (type == 'ginner')
                whereCondition.ginner_id = {
                    [Op.not]: null
                }
            else
                whereCondition.spinner_id = {
                    [Op.not]: null
                }
        }
        if (spinnerId) {
            whereCondition.spinner_id = spinnerId
        }
        if (ginnerId) {
            whereCondition.ginner_id = ginnerId
        }
        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition[Op.or] = [{ ["$ginner.brand$"]: { [Op.overlap]: idArray } },
            { ["$spinner.brand$"]: { [Op.overlap]: idArray } }];
        }
        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition[Op.or] = [{ ["$ginner.country_id$"]: { [Op.in]: idArray } },
            { ["$spinner.country_id$"]: { [Op.in]: idArray } }];
        }
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setUTCHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setUTCHours(23, 59, 59, 999);
            whereCondition.test_report = { [Op.between]: [startOfDay, endOfDay] }
        }
        let include = [
            {
                model: GinProcess, as: 'process', include: [{
                    model: Season, as: 'season'
                }]
            },
            {
                model: GinSales, as: 'sales', include: [{
                    model: Season, as: 'season'
                }]
            },
            {
                model: Ginner, as: 'ginner'
            },
            {
                model: Spinner, as: 'spinner'
            },
            {
                model: Spinner, as: 'sold'
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
                season: item.process ? item.process?.season.name : item.sales?.season.name,
                no_of_bales: item.process ? item.process?.no_of_bales : item.sales?.no_of_bales ? item.sales?.no_of_bales : '',
                processDate: item.process ? item.process?.date : item.sales?.date,
                date: item.test_report ? item.test_report : '',
                lot_no: item.process ? item.process.lot_no : item.lot_no ? item.lot_no : '',
                reel_lot_no: item.process ? item.process.reel_lot_no : item.reel_lot_no ? item.reel_lot_no : '',
                buyer: item.sold ? item.sold.name : '',
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
            lot_no: item.process ? item.process.lot_no : item.lot_no ? item.lot_no : '',
            reel_lot_no: item.process ? item.process.reel_lot_no : item.reel_lot_no ? item.reel_lot_no : '',
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

const reportParameter = async (req: Request, res: Response) => {
    try {
        let currentDate: any = new Date();
        const { seasonId, countryId, stateId, processId, brandId }: any = req.query
        if (!seasonId) {
            return res.sendError(res, "Please select season");
        }
        // Get the current date

        // Create an array to store the results for each month
        const monthlyResults: any = [];
        let parameter = req.query.filter || 'ginner';
        let value = parameter === 'ginner' ?
            { ginner_id: { [Op.not]: null } } : { spinner_id: { [Op.not]: null } };
        let ids = []
        let whereCondition: any = {};
        if (countryId) {
            parameter === 'ginner' ? whereCondition['$ginner.country_id$'] = countryId
                : whereCondition['$spinner.country_id$'] = countryId
        }
        if (stateId) {
            parameter === 'ginner' ? whereCondition['$ginner.state_id$'] = stateId
                : whereCondition['$spinner.state_id$'] = stateId
        }

        if (brandId) {
            const idArray = brandId.split(",").map((id: any) => parseInt(id, 10));
            parameter === 'ginner' ? whereCondition['$ginner.brand$'] = { [Op.overlap]: idArray } : whereCondition['$spinner.brand$'] = { [Op.overlap]: idArray }
        }

        if (processId) {
            parameter === 'ginner' ? whereCondition.ginner_id = processId
                : whereCondition.spinner_id = processId
        }
        if (seasonId) {
            parameter === 'ginner' ? whereCondition['$process.season_id$'] = seasonId
                : whereCondition['$sales.season_id$'] = seasonId
        }
        let selectedSeason = await Season.findOne({ where: { id: seasonId } });
        currentDate = new Date(selectedSeason?.dataValues?.from);


        let seasons = await QualityParameter.findAll({
            where: { ...value, ...whereCondition }, include: [
                {
                    model: GinProcess, as: 'process'
                },
                {
                    model: GinSales, as: 'sales'
                },
                {
                    model: Ginner, as: 'ginner'
                },
                {
                    model: Spinner, as: 'spinner'
                }
            ]
        });
        ids = seasons.map((season: any) => season.id);

        // Loop through the last 12 months
        for (let i = 0; i < 12; i++) {
            // Calculate the start and end dates for the current month
            const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
            const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + (i + 1), 0, 23, 59, 59);
            // Perform the query for the current month
            let result = await QualityParameter.findOne({
                attributes: [
                    [Sequelize.fn('AVG', Sequelize.col('sci')), 'total_sci'],
                    [Sequelize.fn('AVG', Sequelize.col('moisture')), 'total_moisture'],
                    [Sequelize.fn('AVG', Sequelize.col('mic')), 'total_mic'],
                    [Sequelize.fn('AVG', Sequelize.col('mat')), 'total_mat'],
                    [Sequelize.fn('AVG', Sequelize.col('uhml')), 'total_uhml'],
                    [Sequelize.fn('AVG', Sequelize.col('ui')), 'total_ui'],
                    [Sequelize.fn('AVG', Sequelize.col('sf')), 'total_sf'],
                    [Sequelize.fn('AVG', Sequelize.col('str')), 'total_str'],
                    [Sequelize.fn('AVG', Sequelize.col('elg')), 'total_elg'],
                    [Sequelize.fn('AVG', Sequelize.col('rd')), 'total_rd'],
                    [Sequelize.fn('AVG', Sequelize.literal("CAST(plusb AS DOUBLE PRECISION)")), 'total_plusb']
                ],
                where: {
                    test_report: {
                        [Op.between]: [startDate, endDate],
                    },
                    id: ids
                }
            })
            const totalSCI = result ? result.getDataValue('total_sci') : 0;
            const totalMic = result ? result.getDataValue('total_mic') : 0;
            const totalMoisture = result ? result.getDataValue('total_moisture') : 0;
            const totalMat = result ? result.getDataValue('total_mat') : 0;
            const totaluhml = result ? result.getDataValue('total_uhml') : 0;
            const totalUi = result ? result.getDataValue('total_ui') : 0;
            const totalSf = result ? result.getDataValue('total_sf') : 0;
            const totalElg = result ? result.getDataValue('total_elg') : 0;
            const totalStr = result ? result.getDataValue('total_str') : 0;
            const totalRd = result ? result.getDataValue('total_rd') : 0;
            const totalPlusb = result ? result.getDataValue('total_plusb') : 0;

            // Store the results for the current month
            monthlyResults.push({
                month: startDate.toLocaleString('default', { month: 'short' }),
                totalSci: totalSCI ? totalSCI : 0,
                totalMic: totalMic ? totalMic : 0,
                totalMoisture: totalMoisture ? totalMoisture : 0,
                totalMat: totalMat ? totalMat : 0,
                totaluhml: totaluhml ? totaluhml : 0,
                totalUi: totalUi ? totalUi : 0,
                totalElg: totalElg ? totalElg : 0,
                totalSf: totalSf ? totalSf : 0,
                totalStr: totalStr ? totalStr : 0,
                totalRd: totalRd ? totalRd : 0,
                totalPlusb: totalPlusb ? totalPlusb : 0,
            });
        }
        let data = await QualityParameter.findAll({
            attributes: [
                [Sequelize.fn('SUM', Sequelize.col('"quality-parameters"."sci"')), 'total_sci'],
                [Sequelize.fn('SUM', Sequelize.col('"quality-parameters"."moisture"')), 'total_moisture'],
                [Sequelize.fn('SUM', Sequelize.col('"quality-parameters"."mic"')), 'total_mic'],
                [Sequelize.fn('SUM', Sequelize.col('"quality-parameters"."mat"')), 'total_mat'],
                [Sequelize.fn('SUM', Sequelize.col('"quality-parameters"."uhml"')), 'total_uhml'],
                [Sequelize.fn('SUM', Sequelize.col('"quality-parameters"."ui"')), 'total_ui'],
                [Sequelize.fn('SUM', Sequelize.col('"quality-parameters"."sf"')), 'total_sf'],
                [Sequelize.fn('SUM', Sequelize.col('"quality-parameters"."str"')), 'total_str'],
                [Sequelize.fn('SUM', Sequelize.col('"quality-parameters"."elg"')), 'total_elg'],
                [Sequelize.fn('SUM', Sequelize.col('"quality-parameters"."rd"')), 'total_rd'],
                [Sequelize.fn('SUM', Sequelize.literal('CAST("quality-parameters"."plusb" AS DOUBLE PRECISION)')), 'total_plusb'],
                [Sequelize.literal('ginner.name'), 'processor']
            ],
            include: [
                {
                    model: Ginner,
                    as: 'ginner',
                    attributes: ["id", 'name']
                },
                {
                    model: GinProcess,
                    as: 'process',
                    attributes: []
                },
                {
                    model: GinSales,
                    as: 'sales',
                    attributes: []
                },
                {
                    model: Spinner,
                    as: 'spinner',
                    attributes: []
                }

            ],
            where: {
                ginner_id: {
                    [Op.ne]: null
                },
                ...whereCondition
            },
            group: ['ginner.id'],
            limit: 5
        })

        let data1 = await QualityParameter.findAll({
            attributes: [
                [Sequelize.fn('SUM', Sequelize.col('"quality-parameters"."sci"')), 'total_sci'],
                [Sequelize.fn('SUM', Sequelize.col('"quality-parameters"."moisture"')), 'total_moisture'],
                [Sequelize.fn('SUM', Sequelize.col('"quality-parameters"."mic"')), 'total_mic'],
                [Sequelize.fn('SUM', Sequelize.col('"quality-parameters"."mat"')), 'total_mat'],
                [Sequelize.fn('SUM', Sequelize.col('"quality-parameters"."uhml"')), 'total_uhml'],
                [Sequelize.fn('SUM', Sequelize.col('"quality-parameters"."ui"')), 'total_ui'],
                [Sequelize.fn('SUM', Sequelize.col('"quality-parameters"."sf"')), 'total_sf'],
                [Sequelize.fn('SUM', Sequelize.col('"quality-parameters"."str"')), 'total_str'],
                [Sequelize.fn('SUM', Sequelize.col('"quality-parameters"."elg"')), 'total_elg'],
                [Sequelize.fn('SUM', Sequelize.col('"quality-parameters"."rd"')), 'total_rd'],
                [Sequelize.fn('SUM', Sequelize.literal('CAST("quality-parameters"."plusb" AS DOUBLE PRECISION)')), 'total_plusb'],
                // [Sequelize.literal('ginner.name'), 'processor'],
                [Sequelize.literal('spinner.name'), 'processor']
            ],
            include: [
                {
                    model: Ginner,
                    as: 'ginner',
                    attributes: []
                    // attributes: ["id", 'name']
                },
                {
                    model: GinProcess,
                    as: 'process',
                    attributes: []
                },
                {
                    model: GinSales,
                    as: 'sales',
                    attributes: []
                },
                {
                    model: Spinner,
                    as: 'spinner',
                    attributes: ["id", 'name']
                }

            ],
            where: {
                spinner_id: {
                    [Op.ne]: null
                },
                ...whereCondition,
            },
            group: ['spinner.id'],
            limit: 5
        })
        let main = parameter === "ginner" ? data : data1
        res.sendSuccess(res, { monthlyResults, data: main });
    }
    catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }
}

const reportCountryParameter = async (req: Request, res: Response) => {
    try {

        const { seasonId, countryId, stateId, ginnerId, spinnerId, brandId }: any = req.query;

        // Get the current date
        let currentDate: any = new Date();

        if (!seasonId) {
            return res.sendError(res, "Please select season");
        }

        // Create an array to store the results for each month
        let monthlyResults: any = [];
        let result = [];
        let parameter = req.query.filter || 'ginner';
        let countryWhere: any = {};

        if (countryId) {
            countryWhere.id = countryId
        }

        let season = await Season.findOne({ where: { id: seasonId } });
        currentDate = new Date(season?.dataValues?.from);

        let countries = await Country.findAll({ where: countryWhere });

        for await (const country of countries) {
            let value: any = parameter === 'ginner' ?
                { ginner_id: { [Op.not]: null }, '$ginner.country_id$': country.id } :
                { spinner_id: { [Op.not]: null }, '$spinner.country_id$': country.id };

            if (stateId) {
                parameter === 'ginner' ? value['$ginner.state_id$'] = stateId : value['$spinner.state_id$'] = stateId
            }

            if (brandId) {
                const idArray = brandId.split(",").map((id: any) => parseInt(id, 10));
                parameter === 'ginner' ? value['$ginner.brand$'] = { [Op.overlap]: idArray } : value['$spinner.brand$'] = { [Op.overlap]: idArray }
            }

            if (ginnerId && parameter === 'ginner') {
                value['ginner_id'] = ginnerId
            }

            if (spinnerId && parameter === 'spinner') {
                value['spinner_id'] = spinnerId
            }

            let group = parameter === 'ginner' ? [Sequelize.literal('ginner.country_id')] : [Sequelize.literal('spinner.country_id')]
            // Loop through the last 12 months
            for (let i = 0; i < 12; i++) {
                // Calculate the start and end dates for the current month
                const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
                const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + (i + 1), 0, 23, 59, 59);
                // Perform the query for the current month
                let result = await QualityParameter.findOne({
                    attributes: [
                        [Sequelize.fn('AVG', Sequelize.col('sci')), 'total_sci'],
                        [Sequelize.fn('AVG', Sequelize.col('moisture')), 'total_moisture'],
                        [Sequelize.fn('AVG', Sequelize.col('mic')), 'total_mic'],
                        [Sequelize.fn('AVG', Sequelize.col('mat')), 'total_mat'],
                        [Sequelize.fn('AVG', Sequelize.col('uhml')), 'total_uhml'],
                        [Sequelize.fn('AVG', Sequelize.col('ui')), 'total_ui'],
                        [Sequelize.fn('AVG', Sequelize.col('sf')), 'total_sf'],
                        [Sequelize.fn('AVG', Sequelize.col('str')), 'total_str'],
                        [Sequelize.fn('AVG', Sequelize.col('elg')), 'total_elg'],
                        [Sequelize.fn('AVG', Sequelize.col('rd')), 'total_rd'],
                        [Sequelize.fn('AVG', Sequelize.literal("CAST(plusb AS DOUBLE PRECISION)")), 'total_plusb']
                    ],
                    include: [
                        {
                            model: Ginner, as: 'ginner', attributes: []
                        },
                        {
                            model: Spinner, as: 'spinner', attributes: []
                        }
                    ],
                    where: {
                        test_report: {
                            [Op.between]: [startDate, endDate],
                        },
                        ...value
                    },
                    group: group
                })
                const totalSCI = result ? result.getDataValue('total_sci') : 0;
                const totalMic = result ? result.getDataValue('total_mic') : 0;
                const totalMoisture = result ? result.getDataValue('total_moisture') : 0;
                const totalMat = result ? result.getDataValue('total_mat') : 0;
                const totaluhml = result ? result.getDataValue('total_uhml') : 0;
                const totalUi = result ? result.getDataValue('total_ui') : 0;
                const totalSf = result ? result.getDataValue('total_sf') : 0;
                const totalElg = result ? result.getDataValue('total_elg') : 0;
                const totalStr = result ? result.getDataValue('total_str') : 0;
                const totalRd = result ? result.getDataValue('total_rd') : 0;
                const totalPlusb = result ? result.getDataValue('total_plusb') : 0;

                // Store the results for the current month
                monthlyResults.push({
                    month: startDate.toLocaleString('default', { month: 'short' }),
                    totalSci: totalSCI ? totalSCI : 0,
                    totalMic: totalMic ? totalMic : 0,
                    totalMoisture: totalMoisture ? totalMoisture : 0,
                    totalMat: totalMat ? totalMat : 0,
                    totaluhml: totaluhml ? totaluhml : 0,
                    totalUi: totalUi ? totalUi : 0,
                    totalElg: totalElg ? totalElg : 0,
                    totalSf: totalSf ? totalSf : 0,
                    totalStr: totalStr ? totalStr : 0,
                    totalRd: totalRd ? totalRd : 0,
                    totalPlusb: totalPlusb ? totalPlusb : 0,
                });
            }

            result.push({ country: country, data: monthlyResults });
            monthlyResults = [];
        }

        res.sendSuccess(res, result);

    }
    catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }
}

const reportDashBoardParameter = async (req: Request, res: Response) => {
    try {
        const { seasonId, countryId, brandId }: any = req.query;
        if (!seasonId) {
            return res.sendError(res, "Please select season");
        }
        let ids = []
        if (seasonId) {
            let whereCondition: any = {};
            if (countryId) {
                whereCondition['$spinner.country_id$'] = countryId
            }

            if (brandId) {
                const idArray = brandId.split(",").map((id: any) => parseInt(id, 10));
                whereCondition['$spinner.brand$'] = { [Op.overlap]: idArray }
            }

            let seasons = await QualityParameter.findAll({
                where: { '$sales.season_id$': seasonId, spinner_id: { [Op.not]: null }, ...whereCondition }, include: [
                    {
                        model: GinSales, as: 'sales'
                    },
                    {
                        model: Ginner, as: 'ginner'
                    },
                    {
                        model: Spinner, as: 'spinner'
                    }
                ]
            });
            ids = seasons.map((season: any) => season.id);
        }

        let spinner = await QualityParameter.findAll({
            attributes: [
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('sci')), 0), 'total_sci'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('moisture')), 0), 'total_moisture'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('mic')), 0), 'total_mic'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('mat')), 0), 'total_mat'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('uhml')), 0), 'total_uhml'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('ui')), 0), 'total_ui'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('sf')), 0), 'total_sf'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('str')), 0), 'total_str'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('elg')), 0), 'total_elg'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('rd')), 0), 'total_rd'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.literal("CAST(plusb AS DOUBLE PRECISION)")), 0), 'total_plusb'],
            ],
            where: {
                id: ids,
                spinner_id: { [Op.not]: null }
            }
        })
        let id = []
        if (seasonId) {
            let whereCondition: any = {};
            if (countryId) {
                whereCondition['$ginner.country_id$'] = countryId
            }

            if (brandId) {
                const idArray = brandId.split(",").map((id: any) => parseInt(id, 10));
                whereCondition['$ginner.brand$'] = { [Op.overlap]: idArray }
            }


            let seasons = await QualityParameter.findAll({
                where: { '$process.season_id$': seasonId, ginner_id: { [Op.not]: null }, ...whereCondition }, include: [
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
            });
            id = seasons.map((season: any) => season.id);
        }
        let ginner = await QualityParameter.findAll({
            attributes: [
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('sci')), 0), 'total_sci'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('moisture')), 0), 'total_moisture'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('mic')), 0), 'total_mic'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('mat')), 0), 'total_mat'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('uhml')), 0), 'total_uhml'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('ui')), 0), 'total_ui'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('sf')), 0), 'total_sf'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('str')), 0), 'total_str'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('elg')), 0), 'total_elg'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('rd')), 0), 'total_rd'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.literal("CAST(plusb AS DOUBLE PRECISION)")), 0), 'total_plusb'],
            ],
            where: {
                id: id,
                ginner_id: { [Op.not]: null }
            }
        });
        let countCondition: any = {};
        let countCondition1: any = {}
        if (countryId) {
            countCondition['$ginner.country_id$'] = countryId;
            countCondition1['$spinner.country_id$'] = countryId;
        }

        if (brandId) {
            const idArray = brandId.split(",").map((id: any) => parseInt(id, 10));
            countCondition['$ginner.brand$'] = { [Op.overlap]: idArray }
            countCondition1['$spinner.brand$'] = { [Op.overlap]: idArray }
        }

        let count = await QualityParameter.count({
            where: { '$process.season_id$': seasonId, ...countCondition },
            include: [
                {
                    model: GinProcess, as: 'process'
                },
                {
                    model: Ginner, as: 'ginner'
                }
            ]
        })
        let count2 = await QualityParameter.count({
            where: { '$sales.season_id$': seasonId, ...countCondition1 },
            include: [
                {
                    model: GinSales, as: 'sales'
                },
                {
                    model: Spinner, as: 'spinner'
                }
            ]
        })
        let mainCount = (count || 0) + (count2 || 0)

        let abc = await QualityParameter.findAll({
            attributes: [
                [Sequelize.literal('ginner.country_id'), 'country_id'],
                [Sequelize.fn('Count', Sequelize.col('quality-parameters.id')), 'number_of_test'],
                [Sequelize.fn('Sum', Sequelize.col('process.no_of_bales')), 'number_of_bales']
            ],
            include: [
                {
                    model: GinProcess,
                    as: 'process',
                    attributes: []
                },
                {
                    model: Ginner,
                    as: 'ginner',
                    attributes: []
                }
            ],
            group: ['ginner.country_id'],
            where: {
                id: id
            }
        })
        let another = await QualityParameter.findAll({
            attributes: [
                [Sequelize.literal('spinner.country_id'), 'country_id'],
                [Sequelize.fn('Count', Sequelize.col('quality-parameters.id')), 'number_of_test'],
                [Sequelize.fn('Sum', Sequelize.col('sales.no_of_bales')), 'number_of_bales']
            ],
            include: [
                {
                    model: GinSales,
                    as: 'sales',
                    attributes: []
                },
                {
                    model: Spinner,
                    as: 'spinner',
                    attributes: []
                }
            ],
            group: ['spinner.country_id'],
            where: {
                id: ids
            }
        });
        let volume = [...abc, ...another];
        let sums: any = [];
        volume.forEach((entry: any) => {
            entry = entry.dataValues
            const country_id = entry.country_id;
            const num_tests = parseInt(entry.number_of_test);
            const num_bales = parseInt(entry.number_of_bales);

            const existingEntry = sums.find((item: any) => item.country_id === country_id);

            if (existingEntry) {
                existingEntry.number_of_test += num_tests;
                existingEntry.number_of_bales += num_bales;
            } else {
                sums.push({ country_id, number_of_test: num_tests, number_of_bales: num_bales });
            }
        });
        res.sendSuccess(res, { noOfTesting: mainCount, avgGinner: ginner, avgSpinner: spinner, volume: sums });
    }
    catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }

}

const reportNationalQualityParameter = async (req: Request, res: Response) => {
    try {
        const { seasonId, countryId, stateId, brandId }: any = req.query;
        if (!seasonId) {
            return res.sendError(res, "Please select season");
        }
        let nationalSpin: any = {};
        if (countryId) {
            nationalSpin['$spinner.country_id$'] = countryId
        }

        if (brandId) {
            const idArray = brandId.split(",").map((id: any) => parseInt(id, 10));
            nationalSpin['$spinner.brand$'] = { [Op.overlap]: idArray }
        }

        let spinner = await QualityParameter.findAll({
            attributes: [
                [Sequelize.literal('spinner.country_id'), 'country_id'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('sci')), 0), 'total_sci'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('moisture')), 0), 'total_moisture'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('mic')), 0), 'total_mic'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('mat')), 0), 'total_mat'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('uhml')), 0), 'total_uhml'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('ui')), 0), 'total_ui'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('sf')), 0), 'total_sf'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('str')), 0), 'total_str'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('elg')), 0), 'total_elg'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('rd')), 0), 'total_rd'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.literal("CAST(plusb AS DOUBLE PRECISION)")), 0), 'total_plusb']
            ],
            include: [
                {
                    model: GinSales, as: 'sales', attributes: []
                },
                {
                    model: Spinner, as: 'spinner', attributes: []
                }
            ],
            where: {
                '$sales.season_id$': seasonId,
                spinner_id: { [Op.not]: null },
                ...nationalSpin
            },
            group: ['spinner.country_id']
        })
        let nationalGin: any = {};
        if (countryId) {
            nationalGin['$ginner.country_id$'] = countryId
        }

        if (brandId) {
            const idArray = brandId.split(",").map((id: any) => parseInt(id, 10));
            nationalGin['$ginner.brand$'] = { [Op.overlap]: idArray }
        }

        let ginner = await QualityParameter.findAll({
            attributes: [
                [Sequelize.literal('ginner.country_id'), 'country_id'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('"quality-parameters"."sci"')), 0), 'total_sci'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('"quality-parameters"."moisture"')), 0), 'total_moisture'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('"quality-parameters"."mic"')), 0), 'total_mic'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('"quality-parameters"."mat"')), 0), 'total_mat'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('"quality-parameters"."uhml"')), 0), 'total_uhml'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('"quality-parameters"."ui"')), 0), 'total_ui'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('"quality-parameters"."sf"')), 0), 'total_sf'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('"quality-parameters"."str"')), 0), 'total_str'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('"quality-parameters"."elg"')), 0), 'total_elg'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('"quality-parameters"."rd"')), 0), 'total_rd'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.literal('CAST("quality-parameters"."plusb" AS DOUBLE PRECISION)')), 0), 'total_plusb']
            ],
            include: [
                {
                    model: GinProcess, as: 'process', attributes: []
                },
                {
                    model: Ginner, as: 'ginner', attributes: []
                }
            ],
            where: {
                '$process.season_id$': seasonId,
                ginner_id: { [Op.not]: null },
                ...nationalGin
            },
            group: ['ginner.country_id']
        })
        let stateAverageSpinner: any = [];
        let stateAverageGinner: any = [];
        if (stateId) {
            stateAverageGinner = await QualityParameter.findAll({
                attributes: [
                    [Sequelize.literal('ginner.state_id'), 'state_id'],
                    [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('"quality-parameters"."sci"')), 0), 'total_sci'],
                    [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('"quality-parameters"."moisture"')), 0), 'total_moisture'],
                    [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('"quality-parameters"."mic"')), 0), 'total_mic'],
                    [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('"quality-parameters"."mat"')), 0), 'total_mat'],
                    [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('"quality-parameters"."uhml"')), 0), 'total_uhml'],
                    [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('"quality-parameters"."ui"')), 0), 'total_ui'],
                    [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('"quality-parameters"."sf"')), 0), 'total_sf'],
                    [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('"quality-parameters"."str"')), 0), 'total_str'],
                    [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('"quality-parameters"."elg"')), 0), 'total_elg'],
                    [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('"quality-parameters"."rd"')), 0), 'total_rd'],
                    [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.literal('CAST("quality-parameters"."plusb" AS DOUBLE PRECISION)')), 0), 'total_plusb']
                ],
                include: [
                    {
                        model: GinProcess, as: 'process', attributes: []
                    },
                    {
                        model: Ginner, as: 'ginner', attributes: []
                    }
                ],
                where: {
                    '$process.season_id$': seasonId,
                    ginner_id: { [Op.not]: null },
                    '$ginner.state_id$': stateId
                },
                group: ['ginner.state_id']
            })
            stateAverageSpinner = await QualityParameter.findAll({
                attributes: [
                    [Sequelize.literal('spinner.state_id'), 'state_id'],
                    [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('sci')), 0), 'total_sci'],
                    [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('moisture')), 0), 'total_moisture'],
                    [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('mic')), 0), 'total_mic'],
                    [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('mat')), 0), 'total_mat'],
                    [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('uhml')), 0), 'total_uhml'],
                    [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('ui')), 0), 'total_ui'],
                    [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('sf')), 0), 'total_sf'],
                    [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('str')), 0), 'total_str'],
                    [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('elg')), 0), 'total_elg'],
                    [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('rd')), 0), 'total_rd'],
                    [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.literal("CAST(plusb AS DOUBLE PRECISION)")), 0), 'total_plusb']
                ],
                include: [
                    {
                        model: GinSales, as: 'sales', attributes: []
                    },
                    {
                        model: Spinner, as: 'spinner', attributes: []
                    }
                ],
                where: {
                    '$sales.season_id$': seasonId,
                    spinner_id: { [Op.not]: null },
                    '$spinner.state_id$': stateId
                },
                group: ['spinner.state_id']
            })
        }
        res.sendSuccess(res, { nationalAvgSpinner: spinner, nationalAvgGinner: ginner, stateAverageGinner, stateAverageSpinner });
    }
    catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }

}

const reporProcessorWiseParameter = async (req: Request, res: Response) => {
    try {
        const { seasonId, countryId, stateId, ginnerId, spinnerId, brandId }: any = req.query;
        if (!seasonId) {
            return res.sendError(res, "Please select season");
        }
        let nationalSpin: any = {};
        if (countryId) {
            nationalSpin['$spinner.country_id$'] = countryId
        }
        if (stateId) {
            nationalSpin['$spinner.state_id$'] = stateId
        }

        if (brandId) {
            const idArray = brandId.split(",").map((id: any) => parseInt(id, 10));
            nationalSpin['$spinner.brand$'] = { [Op.overlap]: idArray }
        }

        if (spinnerId) {
            nationalSpin.spinner_id = spinnerId
        }
        let spinner = await QualityParameter.findAll({
            attributes: [
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('sci')), 0), 'total_sci'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('moisture')), 0), 'total_moisture'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('mic')), 0), 'total_mic'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('mat')), 0), 'total_mat'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('uhml')), 0), 'total_uhml'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('ui')), 0), 'total_ui'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('sf')), 0), 'total_sf'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('str')), 0), 'total_str'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('elg')), 0), 'total_elg'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('rd')), 0), 'total_rd'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.literal("CAST(plusb AS DOUBLE PRECISION)")), 0), 'total_plusb'],
            ],
            include: [
                {
                    model: GinSales, as: 'sales', attributes: []
                },
                {
                    model: Spinner, as: 'spinner', attributes: []
                }
            ],
            where: {
                '$sales.season_id$': seasonId,
                spinner_id: { [Op.not]: null },
                ...nationalSpin
            },
            group: ['sales.season_id']
        })
        let spinnerMonth = await QualityParameter.findAll({
            attributes: [
                [Sequelize.fn('to_char', Sequelize.col('test_report'), 'Mon'), 'month'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('sci')), 0), 'total_sci'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('moisture')), 0), 'total_moisture'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('mic')), 0), 'total_mic'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('mat')), 0), 'total_mat'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('uhml')), 0), 'total_uhml'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('ui')), 0), 'total_ui'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('sf')), 0), 'total_sf'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('str')), 0), 'total_str'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('elg')), 0), 'total_elg'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('rd')), 0), 'total_rd'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.literal("CAST(plusb AS DOUBLE PRECISION)")), 0), 'total_plusb']
            ],
            include: [
                {
                    model: GinSales, as: 'sales', attributes: []
                },
                {
                    model: Spinner, as: 'spinner', attributes: []
                }
            ],
            where: {
                '$sales.season_id$': seasonId,
                spinner_id: { [Op.not]: null },
                ...nationalSpin
            },
            group: [Sequelize.fn('to_char', Sequelize.col('test_report'), 'Mon'), 'sales.season_id'],
        })
        let spinnerCountMonth = await QualityParameter.findAll({
            attributes: [
                [Sequelize.fn('to_char', Sequelize.col('test_report'), 'Mon'), 'month'],
                [Sequelize.fn('COALESCE', Sequelize.fn('COUNT', Sequelize.col('"quality-parameters"."id"')), 0), 'total_count'],
            ],
            include: [
                {
                    model: GinSales, as: 'sales', attributes: []
                },
                {
                    model: Spinner, as: 'spinner', attributes: []
                }
            ],
            where: {
                '$sales.season_id$': seasonId,
                spinner_id: { [Op.not]: null },
                ...nationalSpin
            },
            group: [Sequelize.fn('to_char', Sequelize.col('test_report'), 'Mon'), 'sales.season_id'],
        })
        let nationalGin: any = {};
        if (countryId) {
            nationalGin['$ginner.country_id$'] = countryId
        }
        if (stateId) {
            nationalGin['$ginner.state_id$'] = stateId
        }
        if (brandId) {
            const idArray = brandId.split(",").map((id: any) => parseInt(id, 10));
            nationalGin['$ginner.brand$'] = { [Op.overlap]: idArray }
        }
        if (ginnerId) {
            nationalGin.ginner_id = ginnerId
        }
        let ginner = await QualityParameter.findAll({
            attributes: [
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('"quality-parameters"."sci"')), 0), 'total_sci'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('"quality-parameters"."moisture"')), 0), 'total_moisture'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('"quality-parameters"."mic"')), 0), 'total_mic'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('"quality-parameters"."mat"')), 0), 'total_mat'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('"quality-parameters"."uhml"')), 0), 'total_uhml'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('"quality-parameters"."ui"')), 0), 'total_ui'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('"quality-parameters"."sf"')), 0), 'total_sf'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('"quality-parameters"."str"')), 0), 'total_str'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('"quality-parameters"."elg"')), 0), 'total_elg'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('"quality-parameters"."rd"')), 0), 'total_rd'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.literal('CAST("quality-parameters"."plusb" AS DOUBLE PRECISION)')), 0), 'total_plusb']
            ],
            include: [
                {
                    model: GinProcess, as: 'process', attributes: []
                },
                {
                    model: Ginner, as: 'ginner', attributes: []
                }
            ],
            where: {
                '$process.season_id$': seasonId,
                ginner_id: { [Op.not]: null },
                ...nationalGin
            },
            group: ['process.season_id']
        })

        let ginnerMonth = await QualityParameter.findAll({
            attributes: [
                [Sequelize.fn('to_char', Sequelize.col('"quality-parameters"."test_report"'), 'Mon'), 'month'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('"quality-parameters"."sci"')), 0), 'total_sci'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('"quality-parameters"."moisture"')), 0), 'total_moisture'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('"quality-parameters"."mic"')), 0), 'total_mic'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('"quality-parameters"."mat"')), 0), 'total_mat'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('"quality-parameters"."uhml"')), 0), 'total_uhml'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('"quality-parameters"."ui"')), 0), 'total_ui'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('"quality-parameters"."sf"')), 0), 'total_sf'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('"quality-parameters"."str"')), 0), 'total_str'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('"quality-parameters"."elg"')), 0), 'total_elg'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('"quality-parameters"."rd"')), 0), 'total_rd'],
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.literal('CAST("quality-parameters"."plusb" AS DOUBLE PRECISION)')), 0), 'total_plusb']
            ],
            include: [
                {
                    model: GinProcess, as: 'process', attributes: []
                },
                {
                    model: Ginner, as: 'ginner', attributes: []
                }
            ],
            where: {
                '$process.season_id$': seasonId,
                ginner_id: { [Op.not]: null },
                ...nationalGin
            },
            group: [Sequelize.fn('to_char', Sequelize.col('"quality-parameters"."test_report"'), 'Mon'), 'process.season_id']
        })
        let ginnerCountMonth = await QualityParameter.findAll({
            attributes: [
                [Sequelize.fn('to_char', Sequelize.col('test_report'), 'Mon'), 'month'],
                [Sequelize.fn('COALESCE', Sequelize.fn('COUNT', Sequelize.col('"quality-parameters"."id"')), 0), 'total_count'],
            ],
            include: [
                {
                    model: GinProcess, as: 'process', attributes: []
                },
                {
                    model: Ginner, as: 'ginner', attributes: []
                }
            ],
            where: {
                '$process.season_id$': seasonId,
                ginner_id: { [Op.not]: null },
                ...nationalGin
            },
            group: [Sequelize.fn('to_char', Sequelize.col('"quality-parameters"."test_report"'), 'Mon'), 'process.season_id']
        })
        res.sendSuccess(res, { nationalAvgSpinner: spinner, nationalAvgGinner: ginner, ginnerMonth, spinnerMonth, spinnerCountMonth, ginnerCountMonth });
    }
    catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }

}

export {
    createQualityParameter,
    fetchQualityParameterPagination,
    fetchQualityParameter,
    exportQualityParameter,
    exportSingleQualityParameter,
    reportCountryParameter,
    reportParameter,
    reportDashBoardParameter,
    reportNationalQualityParameter,
    reporProcessorWiseParameter
}