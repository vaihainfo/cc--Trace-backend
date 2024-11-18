import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import ValidationProject from "../../models/validation-project.model";
import Brand from "../../models/brand.model";
import FarmGroup from "../../models/farm-group.model";
import Season from "../../models/season.model";
import * as ExcelJS from "exceljs";
import * as fs from "fs";
import * as path from "path";

const fetchValidationProjectReport = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};

  const farmGroupId: string = req.query.farmGroupId as string;
  const seasonId: string = req.query.seasonId as string;
  const brandId: string = req.query.brandId as string;

  const { endDate, startDate }: any = req.query;

  try {
    if (farmGroupId) {
      const idArray: number[] = farmGroupId
        .split(",")
        .map((id) => parseInt(id, 10));

      whereCondition.farmGroup_id = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id) => parseInt(id, 10));

      whereCondition.season_id = { [Op.in]: idArray };
    }
    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id) => parseInt(id, 10));

      whereCondition.brand_id = { [Op.in]: idArray };
    }

    
    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereCondition.createdAt = { [Op.between]: [startOfDay, endOfDay] }
  }

    let include = [
      {
        model: FarmGroup,
        as: "farmGroup",
        attributes: ["id", "name", "status"],
      },
      {
        model: Brand,
        as: "brand",
        attributes: ["id", "brand_name", "address"],
      },
      {
        model: Season,
        as: "season",
        attributes: ["id", "name"],
      },
    ];

    //fetch data with pagination
    if (req.query.pagination === "true") {
      const { count, rows } = await ValidationProject.findAndCountAll({
        where: whereCondition,
        include: include,
        offset: offset,
        limit: limit,
      });


      const response = await rows.map((row: any) => ({
        ...row.dataValues,
        premium_transfered_cost: row.dataValues.premium_transfered_cost && row.dataValues.premium_transfered_cost.length > 0 ? row.dataValues.premium_transfered_cost.reduce((acc: any, val: any) => acc + parseFloat(val), 0) : 0,
      }))

      return res.sendPaginationSuccess(res, response, count);
    } else {
      const result = await ValidationProject.findAll({
        where: whereCondition,
        include: include,
      });
      return res.sendSuccess(res, result);
    }
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message);
  }
};

const fetchValidationProjectReportTemplate = async (req: Request, res: Response) => {
  try {
    let include = [
      {
        model: FarmGroup,
        as: "farmGroup",
        attributes: ["id", "name", "status"],
      },
      {
        model: Brand,
        as: "brand",
        attributes: ["id", "brand_name", "address"],
      },
      {
        model: Season,
        as: "season",
        attributes: ["id", "name"],
      },
    ];

      const rows  = await ValidationProject.findOne({
        where: { id: req.query.id },
        include: include
    });

      const response = {
        ...rows.dataValues,
        premium_transfered_total_cost: rows.dataValues.premium_transfered_cost && rows.dataValues.premium_transfered_cost.length > 0 ? rows.dataValues.premium_transfered_cost.reduce((acc: any, val: any) => acc + parseFloat(val), 0) : 0,
      }

      return res.sendSuccess(res, response);
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message);
  }
};

const exportValidationProjectReport = async (req: Request, res: Response) => {
  const excelFilePath = path.join("./upload", "excel-premium-validaition-report.xlsx");

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};

  const farmGroupId: string = req.query.farmGroupId as string;
  const seasonId: string = req.query.seasonId as string;
  const brandId: string = req.query.brandId as string;
  const exportType: string = req.query.exportType as string;

  const { endDate, startDate }: any = req.query;

  try {
    if (exportType === "all") {
      return res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "premium-validation-report.xlsx",
      });

    } else {

    if (farmGroupId) {
      const idArray: number[] = farmGroupId
        .split(",")
        .map((id) => parseInt(id, 10));

      whereCondition.farmGroup_id = { [Op.in]: idArray };
    }

    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id) => parseInt(id, 10));

      whereCondition.season_id = { [Op.in]: idArray };
    }
    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id) => parseInt(id, 10));

      whereCondition.brand_id = { [Op.in]: idArray };
    }

    
    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereCondition.createdAt = { [Op.between]: [startOfDay, endOfDay] }
  }

  // Create the excel workbook file
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sheet1");

  worksheet.mergeCells("A1:L1");

  const mergedCell = worksheet.getCell("A1");
  mergedCell.value = "CottonConnect | Premium  Validation Report";
  mergedCell.font = { bold: true };
  mergedCell.alignment = { horizontal: "center", vertical: "middle" };

  // Set bold font for header row
  const headerRow = worksheet.addRow([
    "S.No",
    "Date and Time",
    "Season",
    "Farm Group",
    "Total Number of Farmers",
    "Total Seed Cotton Purchased (MT)",
    "Lint Cotton Sold to Spinner (MT)",
    "Lint Cost Recieved from Spinner (INR)",
    "Premium Transferred to Farmers (INR)",
    "Average Seed Cotton Purchase Price (INR/Kg)",
    "Average Conventional Cotton Price (INR/Kg)",
    "% Premium Transferred per KG of Seed Cotton Procured",
  ]);

  headerRow.font = { bold: true };


    let include = [
      {
        model: FarmGroup,
        as: "farmGroup",
        attributes: ["id", "name", "status"],
      },
      {
        model: Brand,
        as: "brand",
        attributes: ["id", "brand_name", "address"],
      },
      {
        model: Season,
        as: "season",
        attributes: ["id", "name"],
      },
    ];
    let results = [];

    //fetch data with pagination
    if (req.query.pagination === "true") {
      const { count, rows } = await ValidationProject.findAndCountAll({
        where: whereCondition,
        include: include,
        offset: offset,
        limit: limit,
      });
      results = rows;
    } else {
      results = await ValidationProject.findAll({
        where: whereCondition,
        include: include,
      });
    }

    for await (const [index, item] of results.entries()){

      const rowValues = Object.values({
        index: index + 1,
        date: item.dataValues.createdAt ? item.dataValues.createdAt : "",
        season: item.dataValues.season.name ? item.dataValues.season.name : "",
        farm: item.dataValues.farmGroup?.name ? item.dataValues.farmGroup?.name : "",
        no_of_farmers: item.dataValues.no_of_farmers ? Number(item.dataValues.no_of_farmers) : 0,
        cotton_purchased: item.dataValues.cotton_purchased ? Number(item.dataValues.cotton_purchased) : 0,
        qty_of_lint_sold: item.dataValues.qty_of_lint_sold ? Number(item.dataValues.qty_of_lint_sold) : 0,
        premium_recieved: item.dataValues.premium_recieved ? Number(item.dataValues.premium_recieved) : 0,
        premium_transfered_cost: item.dataValues.premium_transfered_cost && item.dataValues.premium_transfered_cost.length > 0 ? item.dataValues.premium_transfered_cost.reduce((acc: any, val: any) => acc + parseFloat(val), 0) : 0,
        avg_purchase_price: item.dataValues.avg_purchase_price ? Number(item.dataValues.avg_purchase_price) : 0,
        avg_market_price: item.dataValues.avg_market_price ? Number(item.dataValues.avg_market_price) : 0,
        price_variance: item.dataValues.price_variance ? Number(item.dataValues.price_variance) : 0,
      })
      worksheet.addRow(rowValues);

    }


    worksheet.columns.forEach((column: any) => {
      let maxCellLength = 0;
      column.eachCell({ includeEmpty: true }, (cell: any) => {
        const cellLength = (cell.value ? cell.value.toString() : "").length;
        maxCellLength = Math.max(maxCellLength, cellLength);
      });
      column.width = Math.min(30, maxCellLength + 2); // Limit width to 30 characters
    });

    // Save the workbook
    await workbook.xlsx.writeFile(excelFilePath);
    res.status(200).send({
      success: true,
      messgage: "File successfully Generated",
      data: process.env.BASE_URL + "excel-premium-validaition-report.xlsx",
    });
  }
    
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message);
  }
};

export { fetchValidationProjectReport, fetchValidationProjectReportTemplate, exportValidationProjectReport };
