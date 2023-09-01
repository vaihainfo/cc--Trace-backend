import { Request, Response } from "express";
import { Sequelize, Op, where } from "sequelize";
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import Brand from "../../models/brand.model";
import FarmGroup from "../../models/farm-group.model";
import Farmer from "../../models/farmer.model";
import FarmerAgriArea from "../../models/farmer-agri-area.model";
import FarmerCottonArea from "../../models/farmer-cotton-area.model";
import Farm from "../../models/farm.model";
import Program from "../../models/program.model";
import Season from "../../models/season.model";
import Country from "../../models/country.model";
import Village from "../../models/village.model";
import State from "../../models/state.model";
import District from "../../models/district.model";
import Block from "../../models/block.model";
import ICS from "../../models/ics.model";


//fetch farmer details with filters
const fetchFarmerReportPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'asc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const {
        brandId,
        icsId,
        farmGroupId,
        countryId,
        stateId,
        districtId,
        blockId,
        villageId,
        type
    } = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {}
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { name: { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type 
            ];
        }
        if (type === 'Organic') {
            whereCondition[Op.or] = [
                { '$program.program_name$': { [Op.iLike]: `%Organic%` } }, // Search by crop Type 
            ];
        } else {
            whereCondition[Op.or] = [
                { '$program.program_name$': { [Op.notILike]: `%Organic%` } }, // Search by crop Type 
            ];
        }

        if (brandId) {
            whereCondition.brand_id = brandId;
        }
        if (icsId) {
            whereCondition.ics_id = icsId;
        }
        if (farmGroupId) {
            whereCondition.farmGroup_id = farmGroupId;
        }
        if (countryId) {
            whereCondition.country_id = countryId;
        }
        if (stateId) {
            whereCondition.state_id = stateId;
        }
        if (districtId) {
            whereCondition.district_id = districtId;
        }
        if (blockId) {
            whereCondition.block_id = blockId;
        }
        if (villageId) {
            whereCondition.village_id = villageId;
        }

        let include = [
            {
                model: Program, as: 'program'
            },
            {
                model: Brand, as: 'brand'
            },
            {
                model: FarmGroup, as: 'farmGroup'
            },
            {
                model: Country, as: 'country'
            },
            {
                model: Village, as: 'village'
            },
            {
                model: State, as: 'state'
            },
            {
                model: District, as: 'district'
            },
            {
                model: Block, as: 'block'
            }
        ]

        //fetch data with pagination
        const { count, rows } = await Farmer.findAndCountAll({
            where: whereCondition,
            include: include,
            offset: offset,
            limit: limit
        });
        let data = []
        for await (const row of rows) {
            const result = await Farm.findOne({
                where: { farmer_id: row.id }, include: [
                    {
                        model: Season, as: 'season'
                    },
                    {
                        model: FarmerAgriArea, as: 'farmerAgriArea'
                    },
                    {
                        model: FarmerCottonArea, as: 'farmerCottonArea'
                    }
                ]
            });
            data.push({ row, farm: result })
        }
        return res.sendPaginationSuccess(res, data, count);

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

//Export the Farmer details through excel file
const exportNonOrganicFarmerReport = async (req: Request, res: Response) => {

    const excelFilePath = path.join('./upload', 'farmer-non-organic-report.xlsx');

    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const whereCondition: any = {};
        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet1');
        //mergin the cells for first row
        worksheet.mergeCells('A1:M1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'Cotton Connect | Farmer Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };

        // Set bold font for header row
        const headerRow = worksheet.addRow([
            'S.No', 'Farmer Name', 'Farmer Code', 'Village',
            'Block', 'District', 'State', 'Country', 'Brand Name', 'Program Name', 'Total Area',
            'Cotton Area', 'Total Estimated Production',
        ]);
        headerRow.font = { bold: true };

        whereCondition[Op.or] = [
            { '$program.program_name$': { [Op.notILike]: `%Organic%` } } //Organic Based  program
        ];
        let farmer: any
        let include = [
            {
                model: Program, as: 'program'
            },
            {
                model: Brand, as: 'brand'
            },
            {
                model: FarmGroup, as: 'farmGroup'
            },
            {
                model: Country, as: 'country'
            },
            {
                model: Village, as: 'village'
            },
            {
                model: State, as: 'state'
            },
            {
                model: District, as: 'district'
            },
            {
                model: Block, as: 'block'
            }
        ]
        if (req.query.pagination === "true") {
            const { count, rows } = await Farmer.findAndCountAll({
                where: whereCondition,
                include: include,
                offset: offset,
                limit: limit
            });
            farmer = rows;
        } else {
            farmer = await Farmer.findAll({
                where: whereCondition,
                include: include
            });
        }
        // Append data to worksheet
        for await (const [index, item] of farmer.entries()) {
            const result = await Farm.findOne({
                where: { farmer_id: item.id }, include: [
                    {
                        model: Season, as: 'season'
                    },
                    {
                        model: FarmerAgriArea, as: 'farmerAgriArea'
                    },
                    {
                        model: FarmerCottonArea, as: 'farmerCottonArea'
                    }
                ]
            });

            const rowValues = Object.values({
                index: (index + 1),
                farmerName: item.firstName + " " + item.lastName,
                Code: item.code,
                village: item.village.village_name,
                block: item.block.block_name,
                district: item.district.district_name,
                state: item.state.state_name,
                country: item.country.county_name,
                brand: item.brand.brand_name,
                program: item.program.program_name,
                totalArea: result ? result.agri_total_area : '',
                cottonArea: result ? result.farmerCottonArea.cotton_total_area : '',
                totalEstimatedCotton: result ? result.farmerCottonArea.total_estimated_cotton : '',
            });
            worksheet.addRow(rowValues);
        }
        // // Auto-adjust column widths based on content
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
            messgage: 'File successfully Generated',
            data: process.env.BASE_URL + 'farmer-non-organic-report.xlsx'
        })
    } catch (error) {
        console.error('Error appending data:', error);
    }
}

const exportOrganicFarmerReport = async (req: Request, res: Response) => {

    const excelFilePath = path.join('./upload', 'farmer-organic-report.xlsx');

    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const whereCondition: any = {};
        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet1');
        //mergin the cells for first row
        worksheet.mergeCells('A1:O1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'Cotton Connect | Farmer Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };

        // Set bold font for header row
        const headerRow = worksheet.addRow([
            'S.No', 'Farmer Name', 'Farm Group', 'Tracenet Id', 'Village',
            'Block', 'District', 'State', 'Country', 'Brand Name', 'Total Area',
            'Cotton Area', 'Total Estimated Production', 'ICS Name', 'ICS Status'

        ]);
        headerRow.font = { bold: true };

        whereCondition[Op.or] = [
            { '$program.program_name$': { [Op.iLike]: `%Organic%` } }
        ];

        let farmer: any
        let include = [
            {
                model: Program, as: 'program'
            },
            {
                model: Brand, as: 'brand'
            },
            {
                model: FarmGroup, as: 'farmGroup'
            },
            {
                model: Country, as: 'country'
            },
            {
                model: Village, as: 'village'
            },
            {
                model: State, as: 'state'
            },
            {
                model: District, as: 'district'
            },
            {
                model: Block, as: 'block'
            }
        ]
        if (req.query.pagination === "true") {
            const { count, rows } = await Farmer.findAndCountAll({
                where: whereCondition,
                include: include,
                offset: offset,
                limit: limit
            });
            farmer = rows;
        } else {
            farmer = await Farmer.findAll({
                where: whereCondition,
                include: include
            });
        }
        // Append data to worksheet
        for await (const [index, item] of farmer.entries()) {
            const ics = await ICS.findOne({ where: { id: item.ics_id } });
            const result = await Farm.findOne({
                where: { farmer_id: item.id }, include: [
                    {
                        model: Season, as: 'season'
                    },
                    {
                        model: FarmerAgriArea, as: 'farmerAgriArea'
                    },
                    {
                        model: FarmerCottonArea, as: 'farmerCottonArea'
                    }
                ]
            });

            const rowValues = Object.values({
                index: (index + 1),
                farmerName: item.firstName + item.middleName + item.lastName,
                farmGroup: item.farmGroup.name,
                tranid: item.tracenet_id,
                village: item.village.village_name,
                block: item.block.block_name,
                district: item.district.district_name,
                state: item.state.state_name,
                country: item.country.county_name,
                brand: item.brand.brand_name,
                totalArea: result ? result.agri_total_area : '',
                cottonArea: result ? result.farmerCottonArea.cotton_total_area : '',
                totalEstimatedCotton: result ? result.farmerCottonArea.total_estimated_cotton : '',
                icsName: ics ? ics.ics_name : '',
                icsStatus: item.cert_status ? item.cert_status : '',
            });
            worksheet.addRow(rowValues);
        }
        // // Auto-adjust column widths based on content
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
            messgage: 'File successfully Generated',
            data: process.env.BASE_URL + 'farmer-organic-report.xlsx'
        })
    } catch (error) {
        console.error('Error appending data:', error);
    }
}

export { fetchFarmerReportPagination, exportNonOrganicFarmerReport, exportOrganicFarmerReport }