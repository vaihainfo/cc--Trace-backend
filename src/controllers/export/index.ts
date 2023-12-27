import { Request, Response } from "express";
import { Sequelize, Op, where } from "sequelize";
import * as ExcelJS from "exceljs";
import * as path from "path";
import Country from "../../models/country.model";

const exportCountry = async (req: Request, res: Response) => {
  const excelFilePath = path.join("./upload", "country.xlsx");
  const whereCondition: any = {};
  try {

    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");

    // Set bold font for header row
    worksheet.columns = [
      { header: 'Country Name', key: 'county_name', width: 25 },
      { header: 'Status', key: 'country_status', width: 25 }
    ];
    let row: any = worksheet.findRow(1);
    row.font = { bold: true };
    const countries = await Country.findAll({
      //where: whereCondition,
      attributes: [
        [Sequelize.col('"countries"."county_name"'), 'Country Name'],   
        [Sequelize.col('"countries"."country_status"'), 'Status'],
      ],     
      raw: true
    });
    worksheet.addRows(countries);
    // Save the workbook
    await workbook.xlsx.writeFile(excelFilePath);
    res.status(200).send({
      success: true,
      messgage: "File successfully Generated",
      data: process.env.BASE_URL + "country.xlsx",
    });
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

export {
  exportCountry
};
