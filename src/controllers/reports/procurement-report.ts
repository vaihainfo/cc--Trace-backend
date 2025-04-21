import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import Transaction from "../../models/transaction.model";
import District from "../../models/district.model";
import State from "../../models/state.model";
import Country from "../../models/country.model";
import Block from "../../models/block.model";
import Village from "../../models/village.model";
import Brand from "../../models/brand.model";
import Farmer from "../../models/farmer.model";
import Program from "../../models/program.model";
import Ginner from "../../models/ginner.model";
import Season from "../../models/season.model";
import CropGrade from "../../models/crop-grade.model";
import Farm from "../../models/farm.model";
import * as ExcelJS from "exceljs";
import * as path from "path";
import UserApp from "../../models/users-app.model";
import sequelize from "../../util/dbConn";
import moment from "moment";
import fs from 'fs';


const fetchTransactionsReport = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const sortOrder = req.query.sort || "desc";
  //   const sortField = req.query.sortBy || '';
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const countryId: string = req.query.countryId as string;
  const stateId: string = req.query.stateId as string;
  const brandId: string = req.query.brandId as string;
  const farmGroupId: string = req.query.farmGroupId as string;
  const seasonId: string = req.query.seasonId as string;
  const programId: string = req.query.programId as string;
  const ginnerId: string = req.query.ginnerId as string;
  
  const { endDate, startDate }: any = req.query;

  const whereCondition: any = {};

  try {
    // apply filters
    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id) => parseInt(id, 10));
      whereCondition.country_id = { [Op.in]: idArray };
    }

    if (stateId) {
      const idArray: number[] = stateId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.state_id = { [Op.in]: idArray };
    }

    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id) => parseInt(id, 10));
      whereCondition.brand_id = { [Op.in]: idArray };
    }
    if (farmGroupId) {
      const idArray: number[] = farmGroupId
        .split(",")
        .map((id) => parseInt(id, 10));
      whereCondition["$farmer.farmGroup_id$"] = { [Op.in]: idArray };
    }
    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id) => parseInt(id, 10));
      whereCondition.season_id = { [Op.in]: idArray };
    }

    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id) => parseInt(id, 10));
      whereCondition.program_id = { [Op.in]: idArray };
    }

    if (ginnerId) {
      const idArray: number[] = ginnerId
        .split(",")
        .map((id) => parseInt(id, 10));
      whereCondition.mapped_ginner = { [Op.in]: idArray };
    }

    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereCondition.date = { [Op.between]: [startOfDay, endOfDay] }
    }
    // apply search
    if (searchTerm) {
      whereCondition[Op.or] = [
          sequelize.where(sequelize.cast(sequelize.col('"transactions"."id"'), 'text'), {
            [Op.like]: `%${searchTerm}%`
        }),
        { farmer_code: { [Op.iLike]: `%${searchTerm}%` } },
        { farmer_name: { [Op.iLike]: `%${searchTerm}%` } },
        { rate: { [Op.iLike]: `%${searchTerm}%` } },
        { qty_purchased: { [Op.iLike]: `%${searchTerm}%` } },
        { vehicle: { [Op.iLike]: `%${searchTerm}%` } },
        { payment_method: { [Op.iLike]: `%${searchTerm}%` } },
        { "$block.block_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$country.county_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$state.state_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$village.village_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$district.district_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$farmer.firstName$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$agent.firstName$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    whereCondition.status = 'Sold';
    let queryOptions: any = {
      where: whereCondition,
      include: [
        {
          model: Village,
          as: "village",
          attributes: [
            "id",
            "village_name"
          ],
        },
        {
          model: Block,
          as: "block",
          attributes: [
            "id",
            "block_name"
          ],
        },
        {
          model: District,
          as: "district",
          attributes: [
            "id",
            "district_name"
          ],
        },
        {
          model: State,
          as: "state",
          attributes: [
            "id",
            "state_name"
          ],
        },
        {
          model: Country,
          as: "country",
          attributes: [
            "id",
            "county_name"
          ],
        },
        {
          model: Farmer,
          as: "farmer",
        },
        {
          model: Program,
          as: "program",
          attributes: [
            "id",
            "program_name"
          ],
        },
        {
          model: Season,
          as: "season",
          attributes: [
            "id",
            "name"
          ],
        },
        {
          model: Brand,
          as: "brand",
        },
        {
          model: Ginner,
          as: "ginner",
        },
        {
          model: CropGrade,
          as: "grade",
          attributes: [
            "id",
            "cropGrade"
          ],
        },
        {
          model: Farm,
          as: "farm",
        },
        {
          model: UserApp,
          as: "agent"
        },
      ],
    };

    if (sortOrder === "asc" || sortOrder === "desc") {
      queryOptions.order = [["id", sortOrder]];
    }


    // apply pagination
    if (req.query.pagination === "true") {
      queryOptions.offset = offset;
      queryOptions.limit = limit;

      const { count, rows } = await Transaction.findAndCountAll(queryOptions);

      return res.sendPaginationSuccess(res, rows, count);
    } else {
      // fetch without filters
      const transaction = await Transaction.findAll(queryOptions);
      return res.sendSuccess(res, transaction);
    }
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message, error);
  }
};

// total procured quantity with respective programs
const fetchSumOfQtyPurchasedByProgram = async (req: Request, res: Response) => {
  try {
    const sumByProgram = await Transaction.findAll({
      where: { status: 'Sold' },
      attributes: [
        "program_id",
        [Sequelize.col("program.program_name"), "program_name"],
        [Sequelize.fn("sum", Sequelize.cast(Sequelize.col("qty_purchased"), "decimal")), "total_qty_purchased"],
      ],
      include: [
        {
          model: Program,
          as: 'program',
          attributes: [],
        },
      ],
      group: ["program_id", Sequelize.col("program.program_name")],
    });

    return res.sendSuccess(res, sumByProgram);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message, error);
  }
};

//Export the export details through excel file
const exportProcurementReport = async (req: Request, res: Response) => {
    // procurement_load
  const excelFilePath = path.join("./upload", "excel-procurement-report.xlsx");

  try {
    const searchTerm = req.query.search || "";
    const isBrand = req.query.isBrand || false;
    let whereCondition: any = {};
    const { exportType, status, countryId, stateId, brandId, farmGroupId, seasonId, programId, ginnerId, startDate, endDate }: any = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    if (exportType === "all") {
      return res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "procurement-report.xlsx",
      });

    } else {

    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.country_id = { [Op.in]: idArray };
    }
    if (stateId) {
      const idArray: number[] = stateId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.state_id = { [Op.in]: idArray };
    }
    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.brand_id = { [Op.in]: idArray };
    }
    if (farmGroupId) {
      const idArray: number[] = farmGroupId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$farmer.farmGroup_id$"] = { [Op.in]: idArray };
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

    if (ginnerId) {
      const idArray: number[] = ginnerId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.mapped_ginner = { [Op.in]: idArray };
    }
    whereCondition.status = 'Sold';

    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereCondition.date = { [Op.between]: [startOfDay, endOfDay] }
    }

    // apply search
    if (searchTerm) {
      whereCondition[Op.or] = [
          sequelize.where(sequelize.cast(sequelize.col('"transactions"."id"'), 'text'), {
            [Op.like]: `%${searchTerm}%`
        }),
        { farmer_code: { [Op.iLike]: `%${searchTerm}%` } },
        { farmer_name: { [Op.iLike]: `%${searchTerm}%` } },
        { rate: { [Op.iLike]: `%${searchTerm}%` } },
        { qty_purchased: { [Op.iLike]: `%${searchTerm}%` } },
        { vehicle: { [Op.iLike]: `%${searchTerm}%` } },
        { payment_method: { [Op.iLike]: `%${searchTerm}%` } },
        { "$block.block_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$country.county_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$state.state_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$village.village_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$district.district_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$farmer.firstName$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$agent.firstName$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }

    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    /*if(isBrand === 'true'){
      worksheet.mergeCells('A1:T1');
    }else{
      worksheet.mergeCells('A1:U1');
    }*/
    
    //const mergedCell = worksheet.getCell('A1');
    //mergedCell.value = 'CottonConnect | Procurement Report';
    //mergedCell.font = { bold: true };
    //mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Set bold font for header row
    let headerRow;
      if(isBrand === 'true'){
        headerRow = worksheet.addRow([
          "Sr No.",
          "Date",
          "Farmer Code",
          "Season",
          "Brand",
          "Country",
          "State",
          "District",
          "Block",
          "Village",
          "Transaction Id",
          "Quantity Purchased (Kgs)",
          "Quantity Stock (Kgs)",
          "Available Cotton(Kgs)",
          "Price/Kg (Local Currency)",
          "Programme",
          "Transport Vehicle No",
          "Payment Method",
          "Ginner Name",
          "Transaction User Details",
        ]);
      }else{
        headerRow = worksheet.addRow([
          "Sr No.",
          "Date",
          "Farmer Name",
          "Farmer Code",
          "Season",
          "Brand",
          "Country",
          "State",
          "District",
          "Block",
          "Village",
          "Transaction Id",
          "Quantity Purchased (Kgs)",
          "Quantity Stock (Kgs)",
          "Available Cotton(Kgs)",
          "Price/Kg (Local Currency)",
          "Programme",
          "Transport Vehicle No",
          "Payment Method",
          "Ginner Name",
          "Transaction User Details",
        ]);
    }
    headerRow.font = { bold: true };
    const transaction = await Transaction.findAll({
      where: whereCondition,
      include: [
        {
          model: Village,
          as: "village",
          attributes: ['id', 'village_name']
        },
        {
          model: Block,
          as: "block",
          attributes: ['id', 'block_name']
        },
        {
          model: District,
          as: "district",
          attributes: ['id', 'district_name']
        },
        {
          model: State,
          as: "state",
          attributes: ['id', 'state_name']
        },
        {
          model: Country,
          as: "country",
          attributes: ['id', 'county_name']
        },
        {
          model: Farmer,
          as: "farmer",
        },
        {
          model: Program,
          as: "program",
          attributes: ['id', 'program_name']
        },
        {
          model: Brand,
          as: "brand",
          attributes: ['id', 'brand_name']
        },
        {
          model: Ginner,
          as: "ginner",
          attributes: ['id', 'name', 'address']
        },
        {
          model: CropGrade,
          as: "grade",
          attributes: ['id', 'cropGrade']
        },
        {
          model: Season,
          as: "season",
          attributes: ['id', 'name']
        },
        {
          model: Farm,
          as: "farm"
        },
        {
          model: UserApp,
          as: "agent"
        },
      ],
      order: [
        [
          'id', 'desc'
        ]
      ],
      offset: offset,
      limit: limit,
    }); 

    let totals = {
      qty_purchased:0,
      qty_stock:0,
      available_cotton:0,
      rate:0
    };

    // Append data to worksheet
    for await (const [index, item] of transaction.entries()) {
      let rowValues;
        if(isBrand === 'true'){
          rowValues = {
            index: index + 1,
            date: item.dataValues.date ? item.dataValues.date : '',
            farmer_code: item.dataValues.farmer_code ? item.dataValues.farmer_code : '',
            season: item.dataValues.season ? item.dataValues.season.name : ' ',
            brand: item.dataValues.brand ? item.dataValues.brand.brand_name : '',
            country: item.dataValues.country ? item.dataValues.country.county_name : '',
            state: item.dataValues.state ? item.dataValues.state.state_name : '',
            district: item.dataValues.district ? item.dataValues.district.district_name : '',
            block: item.dataValues.block ? item.dataValues.block.block_name : '',
            village: item.dataValues.village ? item.dataValues.village.village_name : '',
            id: item.dataValues.id ? item.dataValues.id : '',
            qty_purchased: item.dataValues.qty_purchased ? Number(item.dataValues.qty_purchased) : 0,
            qty_stock: item.dataValues.qty_stock ? Number(item.dataValues.qty_stock) : 0,
            // available_cotton: item.dataValues.farm ? (Number(item.dataValues.farm.total_estimated_cotton) > Number(item.dataValues.farm.cotton_transacted) ? Number(item.dataValues.farm.total_estimated_cotton) - Number(item.dataValues.farm.cotton_transacted) : 0) : 0,
            available_cotton: item.dataValues.available_cotton ? Number(item.dataValues.available_cotton) : 0,
            rate: item.dataValues.rate ? Number(item.dataValues.rate) : 0,
            program: item.dataValues.program ? item.dataValues.program.program_name : '',
            vehicle: item.dataValues.vehicle ? item.dataValues.vehicle : '',
            payment_method: item.dataValues.payment_method ? item.dataValues.payment_method : '',
            ginner: item.dataValues.ginner ? item.dataValues.ginner.name : '',
            agent: item?.dataValues?.agent && ( item?.dataValues?.agent?.lastName ? item?.dataValues?.agent?.firstName + " " + item?.dataValues?.agent?.lastName+ "-" + item?.dataValues?.agent?.access_level : item?.dataValues?.agent?.firstName+ "-" + item?.dataValues?.agent?.access_level),
          };
        }else{
        rowValues = {
          index: index + 1,
          date: item.dataValues.date ? item.dataValues.date : '',
          farmer_name: item.dataValues.farmer ? item.dataValues.farmer.firstName + ' ' + `${item.dataValues.farmer.lastName ? item.dataValues.farmer.lastName : ""}` : item.dataValues.farmer_name,
          farmer_code: item.dataValues.farmer_code ? item.dataValues.farmer_code : '',
          season: item.dataValues.season ? item.dataValues.season.name : ' ',
          brand: item.dataValues.brand ? item.dataValues.brand.brand_name : '',
          country: item.dataValues.country ? item.dataValues.country.county_name : '',
          state: item.dataValues.state ? item.dataValues.state.state_name : '',
          district: item.dataValues.district ? item.dataValues.district.district_name : '',
          block: item.dataValues.block ? item.dataValues.block.block_name : '',
          village: item.dataValues.village ? item.dataValues.village.village_name : '',
          id: item.dataValues.id ? item.dataValues.id : '',
          qty_purchased: item.dataValues.qty_purchased ? Number(item.dataValues.qty_purchased) : 0,
          qty_stock: item.dataValues.qty_stock ? Number(item.dataValues.qty_stock) : 0,
          // available_cotton: item.dataValues.farm ? (Number(item.dataValues.farm.total_estimated_cotton) > Number(item.dataValues.farm.cotton_transacted) ? Number(item.dataValues.farm.total_estimated_cotton) - Number(item.dataValues.farm.cotton_transacted) : 0) : 0,
          available_cotton: item.dataValues.available_cotton ? Number(item.dataValues.available_cotton) : 0,
          rate: item.dataValues.rate ? Number(item.dataValues.rate) : 0,
          program: item.dataValues.program ? item.dataValues.program.program_name : '',
          vehicle: item.dataValues.vehicle ? item.dataValues.vehicle : '',
          payment_method: item.dataValues.payment_method ? item.dataValues.payment_method : '',
          ginner: item.dataValues.ginner ? item.dataValues.ginner.name : '',
          agent: item?.dataValues?.agent && ( item?.dataValues?.agent?.lastName ? item?.dataValues?.agent?.firstName + " " + item?.dataValues?.agent?.lastName+ "-" + item?.dataValues?.agent?.access_level : item?.dataValues?.agent?.firstName+ "-" + item?.dataValues?.agent?.access_level),
        };
      }
      

      totals.qty_purchased+= Number(rowValues.qty_purchased); 
      totals.qty_stock+= Number(rowValues.qty_stock); 
      totals.available_cotton+= Number(rowValues.available_cotton);
      totals.rate+= Number(rowValues.rate);
      worksheet.addRow(Object.values(rowValues));
    }

    const rowValues = {
      index:"",
      date:"",
      farmer_name:"",
      farmer_code:"",
      season:"",
      brand:"",
      country:"",
      state:"",
      district:"",
      block:"",
      village:"",
      id: "Total",
      qty_purchased: totals.qty_purchased,
      qty_stock: totals.qty_stock,
      available_cotton: totals.available_cotton,
      rate: totals.rate,
      program: "",
      vehicle: "",
      payment_method: "",
      ginner: "",
      agent: "",
    };

    worksheet.addRow(Object.values(rowValues)).eachCell(cell=> cell.font = {bold: true});

    // Define a border style
    const borderStyle = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };

    // Auto-adjust column widths based on content
    worksheet.columns.forEach((column: any) => {
      let maxCellLength = 0;
      column.eachCell({ includeEmpty: true }, (cell: any) => {
        const cellLength = (cell.value ? cell.value.toString() : '').length;
        maxCellLength = Math.max(maxCellLength, cellLength);
        cell.border = borderStyle;
      });
      column.width = Math.min(20, maxCellLength + 2); // Limit width to 30 characters
    });

    // Save the workbook
    await workbook.xlsx.writeFile(excelFilePath);
    res.status(200).send({
      success: true,
      messgage: "File successfully Generated",
      data: process.env.BASE_URL + "excel-procurement-report.xlsx",
    });
  }
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message, error);
  }
};

export {
  fetchTransactionsReport,
  fetchSumOfQtyPurchasedByProgram,
  exportProcurementReport
};