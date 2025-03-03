import { Request, Response } from "express";
import { Sequelize, Op, where } from "sequelize";
import * as ExcelJS from "exceljs";
import * as path from "path";
import Brand from "../../models/brand.model";
import FarmGroup from "../../models/farm-group.model";
import Farmer from "../../models/farmer.model";
import Program from "../../models/program.model";
import Country from "../../models/country.model";
import Village from "../../models/village.model";
import State from "../../models/state.model";
import District from "../../models/district.model";
import Block from "../../models/block.model";
import ICS from "../../models/ics.model";

//fetch farmer details with filters
const fetchFarmerReportPagination = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const sortOrder = req.query.sort || "asc";
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
    type,
    startDate,
    endDate,
    seasonId
  }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (type === "Organic") {
      whereCondition["$program.program_name$"] = { [Op.iLike]: `%Organic%` };
      whereCondition["old_data"] = { [Op.is]: null };
      

    } else {
      whereCondition["$program.program_name$"] = { [Op.notILike]: `%Organic%` };
    }
    if (searchTerm) {
      whereCondition[Op.or] = [
        { firstName: { [Op.iLike]: `%${searchTerm}%` } },
        { lastName: { [Op.iLike]: `%${searchTerm}%` } },
        { code: { [Op.iLike]: `%${searchTerm}%` } },
        { tracenet_id: { [Op.iLike]: `%${searchTerm}%` } },
        { "$country.county_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$block.block_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$farmGroup.name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$district.district_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$state.state_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$village.village_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { cert_status: { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));

      whereCondition.brand_id = { [Op.in]: idArray };
    }
    if (icsId) {
      const idArray: number[] = icsId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.ics_id = { [Op.in]: idArray };
    }
    if (farmGroupId) {
      const idArray: number[] = farmGroupId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.farmGroup_id = { [Op.in]: idArray };
    }
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
    if (districtId) {
      const idArray: number[] = districtId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.district_id = { [Op.in]: idArray };
    }
    if (blockId) {
      const idArray: number[] = blockId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.block_id = { [Op.in]: idArray };
    }
    if (villageId) {
      const idArray: number[] = villageId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.village_id = { [Op.in]: idArray };
    }

    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereCondition.joining_date = { [Op.between]: [startOfDay, endOfDay] }
    }
    if (seasonId) {
      whereCondition.id = {
        [Op.in]: Sequelize.literal(
          '( SELECT farmer_id FROM farms WHERE season_id = ' + seasonId + ')')
      }
    }

    let include = [
      {
        model: Program,
        as: "program",
      },
      {
        model: Brand,
        as: "brand",
      },
      {
        model: FarmGroup,
        as: "farmGroup",
      },
      {
        model: Country,
        as: "country",
      },
      {
        model: Village,
        as: "village",
      },
      {
        model: State,
        as: "state",
      },
      {
        model: District,
        as: "district",
      },
      {
        model: Block,
        as: "block",
      },
    ];
    //fetch data with pagination
    const { count, rows } = await Farmer.findAndCountAll({
      where: whereCondition,
      order: [["id", "desc"]],
      include: include,
      offset: offset,
      limit: limit,
    });
    return res.sendPaginationSuccess(res, rows, count);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

//Export the Farmer details through excel file
const exportNonOrganicFarmerReport = async (req: Request, res: Response) => {
  const excelFilePath = path.join("./upload", "excel-farmer-non-organic-report.xlsx");

  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    const searchTerm = req.query.search || "";
    const {
      brandId,
      icsId,
      farmGroupId,
      countryId,
      stateId,
      districtId,
      blockId,
      villageId,
      exportType,
      startDate,
      endDate,
      seasonId
    }: any = req.query;

    if (exportType === "all") {

      return res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "farmer-non-organic-report.xlsx",
      });

    } else {

      // Create the excel workbook file
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet1");
      //mergin the cells for first row
      worksheet.mergeCells("A1:M1");
      const mergedCell = worksheet.getCell("A1");
      mergedCell.value = "Cotton Connect | Farmer Report";
      mergedCell.font = { bold: true };
      mergedCell.alignment = { horizontal: "center", vertical: "middle" };

      // Set bold font for header row
      const headerRow = worksheet.addRow([
        "S.No",
        "Farmer Name",
        "Farmer Code",
        "Village",
        "Block",
        "District",
        "State",
        "Country",
        "Brand Name",
        "Programme Name",
        "Total Area",
        "Cotton Area",
        "Total Estimated Production",
      ]);
      headerRow.font = { bold: true };

      whereCondition["$program.program_name$"] = { [Op.notILike]: `%Organic%` };

      if (searchTerm) {
        whereCondition[Op.or] = [
          { firstName: { [Op.iLike]: `%${searchTerm}%` } },
          { lastName: { [Op.iLike]: `%${searchTerm}%` } },
          { code: { [Op.iLike]: `%${searchTerm}%` } },
          { "$country.county_name$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$block.block_name$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$farmGroup.name$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$district.district_name$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$state.state_name$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$village.village_name$": { [Op.iLike]: `%${searchTerm}%` } },
          { cert_status: { [Op.iLike]: `%${searchTerm}%` } },
        ];
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
        whereCondition.farmGroup_id = { [Op.in]: idArray };
      }
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
      if (districtId) {
        const idArray: number[] = districtId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition.district_id = { [Op.in]: idArray };
      }
      if (blockId) {
        const idArray: number[] = blockId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition.block_id = { [Op.in]: idArray };
      }
      if (villageId) {
        const idArray: number[] = villageId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition.village_id = { [Op.in]: idArray };
      }
      if (icsId) {
        const idArray: number[] = icsId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition.ics_id = { [Op.in]: idArray };
      }
      if (startDate && endDate) {
        const startOfDay = new Date(startDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(endDate);
        endOfDay.setUTCHours(23, 59, 59, 999);
        whereCondition.joining_date = { [Op.between]: [startOfDay, endOfDay] }
      }
      if (seasonId) {
        whereCondition.id = {
          [Op.in]: Sequelize.literal(
            '( SELECT farmer_id FROM farms WHERE season_id = ' + seasonId + ')')
        }
      }

      let farmer: any;
      let include = [
        {
          model: Program,
          as: "program",
          attributes: ["id", "program_name"],
        },
        {
          model: Brand,
          as: "brand",
          attributes: ["brand_name", "id"],
        },
        {
          model: Country,
          as: "country",
          attributes: ["county_name", "id"],
        },
        {
          model: Village,
          as: "village",
          attributes: ["village_name", "id"],
        },
        {
          model: State,
          as: "state",
          attributes: ["state_name", "id"],
        },
        {
          model: District,
          as: "district",
          attributes: ["district_name", "id"],
        },
        {
          model: Block,
          as: "block",
          attributes: ["block_name", "id"],
        },
      ];
      if (req.query.pagination === "true") {
        const { count, rows } = await Farmer.findAndCountAll({
          where: whereCondition,
          order: [["id", "desc"]],
          include: include,
          offset: offset,
          limit: limit,
        });
        farmer = rows;
      } else {
        farmer = await Farmer.findAll({
          where: whereCondition,
          include: include,
          attributes: [
            "firstName",
            "lastName",
            "code",
            "id",
            "agri_total_area",
            "cotton_total_area",
            "total_estimated_cotton",
          ],
        });
      }
      // Append data to worksheet
      for await (const [index, item] of farmer.entries()) {
        const rowValues = Object.values({
          index: index + 1,
          farmerName: item.firstName + " " + `${item.lastName ? item.lastName : ""}`,
          Code: item.code,
          village: item.village.village_name,
          block: item.block.block_name,
          district: item.district.district_name,
          state: item.state.state_name,
          country: item.country.county_name,
          brand: item.brand.brand_name,
          program: item.program.program_name,
          totalArea: item ? Number(item.agri_total_area) : 0,
          cottonArea: item ? Number(item.cotton_total_area) : 0,
          totalEstimatedCotton: item ? Number(item.total_estimated_cotton) : 0,
        });
        worksheet.addRow(rowValues);
      }
      // // Auto-adjust column widths based on content
      worksheet.columns.forEach((column: any) => {
        let maxCellLength = 0;
        column.eachCell({ includeEmpty: true }, (cell: any) => {
          const cellLength = (cell.value ? cell.value.toString() : "").length;
          maxCellLength = Math.max(maxCellLength, cellLength);
        });
        column.width = Math.min(15, maxCellLength + 2); // Limit width to 30 characters
      });

      // Save the workbook
      await workbook.xlsx.writeFile(excelFilePath);
      res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "excel-farmer-non-organic-report.xlsx",
      });
    }
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

const exportOrganicFarmerReport = async (req: Request, res: Response) => {
  const excelFilePath = path.join(
    "./upload",
    "excel-farmer-organic-report.xlsx"
  );
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  const searchTerm = req.query.search || "";
  const {
    brandId,
    icsId,
    farmGroupId,
    countryId,
    stateId,
    districtId,
    blockId,
    villageId,
    exportType,
    startDate,
    endDate,
    seasonId
  }: any = req.query;

  try {
    if (exportType === "all") {
      return res.status(200).send({
        success: true,
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "farmer-organic-report.xlsx",
      });
    } else {
      // Create the excel workbook file
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet1");
      //mergin the cells for first row
      worksheet.mergeCells("A1:O1");
      const mergedCell = worksheet.getCell("A1");
      mergedCell.value = "Cotton Connect | Farmer Report";
      mergedCell.font = { bold: true };
      mergedCell.alignment = { horizontal: "center", vertical: "middle" };

      // Set bold font for header row
      const headerRow = worksheet.addRow([
        "S.No",
        "Farmer Name",
        "Farm Group",
        "Tracenet Id",
        "Village",
        "Block",
        "District",
        "State",
        "Country",
        "Brand Name",
        "Total Area",
        "Cotton Area",
        "Total Estimated Production",
        "ICS Name",
        "ICS Status",
      ]);
      headerRow.font = { bold: true };

      whereCondition["$program.program_name$"] = { [Op.iLike]: `%Organic%` };
      whereCondition["old_data"] = { [Op.is]: null };
      

      if (searchTerm) {
        whereCondition[Op.or] = [
          { firstName: { [Op.iLike]: `%${searchTerm}%` } },
          { lastName: { [Op.iLike]: `%${searchTerm}%` } },
          { code: { [Op.iLike]: `%${searchTerm}%` } },
          { "$country.county_name$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$block.block_name$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$farmGroup.name$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$district.district_name$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$state.state_name$": { [Op.iLike]: `%${searchTerm}%` } },
          { "$village.village_name$": { [Op.iLike]: `%${searchTerm}%` } },
          { cert_status: { [Op.iLike]: `%${searchTerm}%` } },
        ];
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
        whereCondition.farmGroup_id = { [Op.in]: idArray };
      }
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
      if (districtId) {
        const idArray: number[] = districtId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition.district_id = { [Op.in]: idArray };
      }
      if (blockId) {
        const idArray: number[] = blockId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition.block_id = { [Op.in]: idArray };
      }
      if (villageId) {
        const idArray: number[] = villageId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition.village_id = { [Op.in]: idArray };
      }
      if (icsId) {
        const idArray: number[] = icsId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition.ics_id = { [Op.in]: idArray };
      }
      if (startDate && endDate) {
        const startOfDay = new Date(startDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(endDate);
        endOfDay.setUTCHours(23, 59, 59, 999);
        whereCondition.joining_date = { [Op.between]: [startOfDay, endOfDay] }
      }

      if (seasonId) {
        whereCondition.id = {
          [Op.in]: Sequelize.literal(
            '( SELECT farmer_id FROM farms WHERE season_id = ' + seasonId + ')')
        }
      }


      let farmer: any;
      let include = [
        {
          model: Program,
          as: "program",
          attributes: ["id", "program_name"],
        },
        {
          model: Brand,
          as: "brand",
          attributes: ["brand_name", "id"],
        },
        {
          model: FarmGroup,
          as: "farmGroup",
          attributes: ["name", "id"],
        },
        {
          model: Country,
          as: "country",
          attributes: ["county_name", "id"],
        },
        {
          model: Village,
          as: "village",
          attributes: ["village_name", "id"],
        },
        {
          model: State,
          as: "state",
          attributes: ["state_name", "id"],
        },
        {
          model: District,
          as: "district",
          attributes: ["district_name", "id"],
        },
        {
          model: Block,
          as: "block",
          attributes: ["block_name", "id"],
        },
        {
          model: ICS,
          as: "ics",
          attributes: ["ics_name", "id"],
        },
      ];
      if (req.query.pagination === "true") {
        const { count, rows } = await Farmer.findAndCountAll({
          where: whereCondition,
          order: [["id", "desc"]],
          include: include,
          offset: offset,
          limit: limit,
        });
        farmer = rows;
      } else {
        farmer = await Farmer.findAll({
          attributes: [
            "firstName",
            "lastName",
            "tracenet_id",
            "cert_status",
            "id",
            "agri_total_area",
            "cotton_total_area",
            "total_estimated_cotton",
          ],
          where: whereCondition,
          include: include,
        });
      }

      // Append data to worksheet
      for await (const [index, item] of farmer.entries()) {
        const rowValues = Object.values({
          index: index + 1,
          farmerName: item.firstName + " " + `${item.lastName ? item.lastName : ""}`,
          farmGroup: item.farmGroup.name,
          tranid: item.tracenet_id,
          village: item.village.village_name,
          block: item.block.block_name,
          district: item.district.district_name,
          state: item.state.state_name,
          country: item.country.county_name,
          brand: item.brand.brand_name,
          totalArea: item ? Number(item.agri_total_area) : 0,
          cottonArea: item ? Number(item.cotton_total_area) : 0,
          totalEstimatedCotton: item ? Number(item.total_estimated_cotton) : 0,
          icsName: item.ics ? item.ics.ics_name : "",
          icsStatus: item.cert_status ? item.cert_status : "",
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
        messgage: "File successfully Generated",
        data: process.env.BASE_URL + "excel-farmer-organic-report.xlsx",
      });
    }
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

export {
  fetchFarmerReportPagination,
  exportNonOrganicFarmerReport,
  exportOrganicFarmerReport,
};
