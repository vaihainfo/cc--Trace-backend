import { Request, Response } from "express";
import { Sequelize, Op, where } from "sequelize";
import * as ExcelJS from "exceljs";
import * as fs from "fs";
import * as path from "path";
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
import { generateQrCode } from "../../provider/qrcode";
import archiver from 'archiver';
import ICS from "../../models/ics.model";
//create farmer
const createFarmer = async (req: Request, res: Response) => {
  try {
    const data = {
      program_id: req.body.programId,
      brand_id: req.body.brandId,
      farmGroup_id: req.body.farmGroupId,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      code: req.body.code,
      country_id: req.body.countryId,
      state_id: req.body.stateId,
      district_id: req.body.districtId,
      block_id: req.body.blockId,
      village_id: req.body.villageId,
      joining_date: req.body.joiningDate,
      ics_id: req.body.icsId,
      tracenet_id: req.body.tracenetId,
      cert_status: req.body.certStatus
    };
    const farmer = await Farmer.create(data);
    let village = await Village.findOne({ where: { id: req.body.villageId } })
    let uniqueFilename = `qrcode_${Date.now()}.png`;
    let name = farmer.firstName + " " + farmer.lastName
    let aa = await generateQrCode(`Farmer Code : ${farmer.code}  Farmer Id: ${farmer.id}`,
      name, uniqueFilename, farmer.code, village ? village.village_name : '');
    const farmerPLace = await Farmer.update({ qrUrl: uniqueFilename }, {
      where: {
        id: farmer.id
      }
    });
    res.sendSuccess(res, { farmer });
  } catch (error) {
    return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
  }
}

//fetch farmer details with filters
const fetchFarmerPagination = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const sortOrder = req.query.sort || "asc";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { brandId, programId, icsId, farmGroupId, countryId, stateId, villageId, cert }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { firstName: { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type
        { code: { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type
        { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type
        { '$country.county_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type
        { '$village.village_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type
        { '$brand.brand_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type
        { cert_status: { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type
      ];
    }

    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.brand_id = { [Op.in]: idArray };
    }
    if (programId) {
      const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.program_id = { [Op.in]: idArray };
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
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.state_id = { [Op.in]: idArray };
    }
    if (villageId) {
      const idArray: number[] = villageId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.village_id = { [Op.in]: idArray };
    }

    if (cert) {
      const idArray: string[] = cert
        .split(",")
        .map((id: any) => id);
      whereCondition.cert_status = { [Op.in]: idArray };
    }

    if (icsId) {
      const idArray: string[] = icsId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.ics_id = { [Op.in]: idArray };
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
    if (req.query.pagination === "true") {
      const { count, rows } = await Farmer.findAndCountAll({
        where: whereCondition,
        include: include,
        offset: offset,
        limit: limit,
      });
      let data = [];
      for await (const row of rows) {
        const result = await Farm.findOne({
          where: { farmer_id: row.id },
          include: [
            {
              model: Season,
              as: "season",
            },
            {
              model: FarmerAgriArea,
              as: "farmerAgriArea",
            },
            {
              model: FarmerCottonArea,
              as: "farmerCottonArea",
            },
          ],
        });
        data.push({ row, farm: result });
      }
      return res.sendPaginationSuccess(res, data, count);
    } else {
      const farmGroup = await Farmer.findAll({
        where: whereCondition,
        include: include,
      });
      return res.sendSuccess(res, farmGroup);
    }
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const fetchFarmer = async (req: Request, res: Response) => {
  try {
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

    // const farmer= await Farmer.findByPk(req.query.id);
    const farmer = await Farmer.findOne({
      where: { id: req.query.id },
      include: include,
    });

    return res.sendSuccess(res, { farmer });
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const updateFarmer = async (req: Request, res: Response) => {
  try {
    const data = {
      program_id: req.body.programId,
      brand_id: req.body.brandId,
      farmGroup_id: req.body.farmGroupId,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      code: req.body.code,
      country_id: req.body.countryId,
      state_id: req.body.stateId,
      district_id: req.body.districtId,
      block_id: req.body.blockId,
      village_id: req.body.villageId,
      joining_date: req.body.joiningDate,
      ics_id: req.body.icsId,
      tracenet_id: req.body.tracenetId,
      cert_status: req.body.certStatus,
    };
    const farmer = await Farmer.update(data, {
      where: {
        id: req.body.id,
      },
    });

    res.sendSuccess(res, { farmer });
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

const deleteFarmer = async (req: Request, res: Response) => {
  try {
    const farmer = await Farmer.destroy({
      where: {
        id: req.body.id,
      },
    });
    res.sendSuccess(res, farmer);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const createFarmerFarm = async (req: Request, res: Response) => {
  try {
    const farmerAgriArea = await FarmerAgriArea.create({
      farmer_id: req.body.farmerId,
      agri_total_area: req.body.agriTotalArea,
      agri_estimated_yeld: req.body.agriEstimatedYield,
      agri_estimated_prod: req.body.agriEstimatedProd,
    });
    const farmerCottonArea = await FarmerCottonArea.create({
      farmer_id: req.body.farmerId,
      cotton_total_area: req.body.cottonTotalArea,
      total_estimated_cotton: req.body.totalEstimatedCotton
    });

    const data = {
      farmer_id: req.body.farmerId,
      program_id: req.body.programId,
      season_id: req.body.seasonId,
      cotton_id: farmerCottonArea.id,
      agri_id: farmerAgriArea.id,
      agri_total_area: String(req.body.agriTotalArea),
      cotton_total_area: String(req.body.cottonTotalArea),
    };
    const farm = await Farm.create(data);
    res.sendSuccess(res, { farm });
  } catch (error) {
    return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
  }
};

const updateFarmerFarm = async (req: Request, res: Response) => {
  try {
    const farmerAgriArea = await FarmerAgriArea.update(
      {
        agri_total_area: req.body.agriTotalArea,
        agri_estimated_yeld: req.body.agriEstimatedYield,
        agri_estimated_prod: req.body.agriEstimatedProd
      },
      {
        where: {
          farmer_id: req.body.farmerId,
        },
      }
    );
    const farmerCottonArea = await FarmerCottonArea.update(
      {
        cotton_total_area: req.body.cottonTotalArea,
        total_estimated_cotton: req.body.totalEstimatedCotton,
      },
      {
        where: {
          farmer_id: req.body.farmerId,
        },
      }
    );

    const data = {
      farmer_id: req.body.farmerId,
      program_id: req.body.programId,
      season_id: req.body.seasonId,
      cotton_id: farmerCottonArea.id,
      agri_id: farmerAgriArea.id,
      agri_total_area: req.body.agriTotalArea,
      cotton_total_area: req.body.cottonTotalArea,
    };
    const farm = await Farm.update(data, {
      where: {
        id: req.body.id,
      },
    });
    res.sendSuccess(res, { farm });
  } catch (error) {
    return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
  }
};

//fetching the farm details from farmer
const fetchFarmPagination = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const farmerId = req.query.farmerId;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$season.name$": { [Op.iLike]: `%${searchTerm}%` } }, // Search by Season Name
        { agri_total_area: { [Op.like]: `%${searchTerm}%` } }, // Search by Agri total Area
        { cotton_total_area: { [Op.like]: `%${searchTerm}%` } }, // Search by cotton total area
      ];
    }
    if (farmerId) {
      whereCondition.farmer_id = farmerId;
    }
    let include = [
      {
        model: Farmer,
        as: "farmer",
      },
      {
        model: Program,
        as: "program",
      },
      {
        model: Season,
        as: "season",
      },
      {
        model: FarmerAgriArea,
        as: "farmerAgriArea",
      },
      {
        model: FarmerCottonArea,
        as: "farmerCottonArea",
      },
    ];
    //fetch data with pagination
    if (req.query.pagination === "true") {
      const { count, rows } = await Farm.findAndCountAll({
        where: whereCondition,
        include: include,
        offset: offset,
        limit: limit,
      });
      return res.sendPaginationSuccess(res, rows, count);
    } else {
      const result = await Farm.findAll({
        where: whereCondition,
        include: include,
      });
      return res.sendSuccess(res, result);
    }
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

//fetching the farm details from farmer
const fetchFarm = async (req: Request, res: Response) => {
  try {

    let include = [
      {
        model: Farmer,
        as: "farmer",
      },
      {
        model: Program,
        as: "program",
      },
      {
        model: Season,
        as: "season",
      },
      {
        model: FarmerAgriArea,
        as: "farmerAgriArea",
      },
      {
        model: FarmerCottonArea,
        as: "farmerCottonArea",
      },
    ];
    //fetch data with pagination
    const farm = await Farm.findOne({
      where: { id: req.query.id },
      include: include
    });
    return res.sendSuccess(res, farm);

  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

//count the number of Area and yield With Program
const countFarmWithProgram = async (req: Request, res: Response) => {
  try {
    let whereCondition = {}
    if (req.query.brandId) {
      whereCondition = { "$farmer.brand_id$": req.query.brandId }
    }
    const farmer = await Farm.findAll({
      where: whereCondition,
      attributes: [
        [
          Sequelize.fn("SUM", Sequelize.col("farmerAgriArea.agri_total_area")),
          "totalArea",
        ],
        [
          Sequelize.fn("COUNT", Sequelize.col("farmerAgriArea.id")),
          "totalFarmer",
        ],
        [
          Sequelize.fn(
            "SUM",
            Sequelize.col("farmerCottonArea.cotton_total_area")
          ),
          "totalCotton",
        ],
      ],
      include: [
        {
          model: Program,
          as: "program",
          attributes: ["id", "program_name", "program_status"],
        },
        {
          model: FarmerAgriArea,
          as: "farmerAgriArea",
          attributes: [],
        },
        {
          model: Farmer,
          as: "farmer",
          attributes: [],
        },
        {
          model: FarmerCottonArea,
          as: "farmerCottonArea",
          attributes: [],
        },
      ],
      group: ["program.id"],
    });
    res.sendSuccess(res, farmer);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const exportFarmer = async (req: Request, res: Response) => {
  const excelFilePath = path.join("./upload", "farmer.xlsx");

  try {
    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");

    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.", "Farmer Name", "Farmer Code",
      "Country", "State", "District", "Block", "Village",
      "Season", "FarmGroup", "Brand", "Program", "Total Agriculture Area", "Estimated Yield (Kg/Ac)", "Total estimated Production",
      "Total EstimatedCotton", "Tracenet Id", "ICS Name", "Certification Status"
    ]);
    headerRow.font = { bold: true };
    const farmer = await Farmer.findAll({
      where: {},
      include: [
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
      ],
    });

    // Append data to worksheet
    for await (const [index, item] of farmer.entries()) {
      const result = await Farm.findOne({
        where: { farmer_id: item.id },
        include: [
          {
            model: Season,
            as: "season",
          },
          {
            model: FarmerAgriArea,
            as: "farmerAgriArea",
          },
          {
            model: FarmerCottonArea,
            as: "farmerCottonArea",
          },
        ],
      });
      let ics: any
      if (item.ics_id) {
        ics = await ICS.findOne({ where: { id: item.ics_id } });
      }
      const rowValues = Object.values({
        index: index + 1,
        farmerName: item.firstName + item.lastName,
        fatherCode: item.code,
        country: item.country.county_name,
        state: item.state.state_name,
        district: item.district.district_name,
        block: item.block.block_name,
        village: item.village.village_name,
        season: result ? result.season.name : '',
        farmGroup: item.farmGroup.name,
        brand: item.brand.brand_name,
        program: item.program.program_name,
        agriTotalArea: result ? result.farmerAgriArea.agri_total_area : '',
        agriEstimatedYield: result ? result.farmerAgriArea.agri_estimated_yeld : '',
        agriEstimatedProd: result ? result.farmerAgriArea.agri_estimated_prod : '',
        cottonTotalArea: result ? result.farmerCottonArea.cotton_total_area : '',
        totalEstimatedCotton: result ? result.farmerCottonArea.total_estimated_cotton : '',
        tracenetId: item.tracenet_id,
        iscName: ics ? ics.ics_name : '',
        cert: item.certStatus ? item.certStatus : ''
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
      data: process.env.BASE_URL + "farmer.xlsx",
    });
  } catch (error: any) {
    return res.sendError(res, error.message);
    console.error("Error appending data:", error);
  }
};

//generate Qr for villages 
const generateQrCodeVillage = async (req: Request, res: Response) => {
  try {
    if (!req.query.villageId) {
      return res.sendError(res, "Need Village id");
    }
    const farmers = await Farmer.findAll({
      where: { village_id: Number(req.query.villageId) },
      include: [{
        model: Village,
        as: "village",
      }]
    });
    if (farmers.length === 0) {
      return res.sendError(res, "NO_FAMRER_FOUND");
    }
    let count = 0;
    for await (const farmer of farmers) {
      if (!farmer.qrUrl) {
        count = count + 1;
        let uniqueFilename = `qrcode_${Date.now()}.png`;
        let name = farmer.firstName + " " + farmer.lastName
        let data = await generateQrCode(`Farmer Code : ${farmer.code}  Farmer Id: ${farmer.id}`,
          name, uniqueFilename, farmer.code, farmer.village.village_name);
        const farmerPLace = await Farmer.update({ qrUrl: uniqueFilename }, {
          where: {
            id: farmer.id
          },
        });
      }
    }
    res.sendSuccess(res, { data: `${count} farmer has been update` });

  } catch (error: any) {
    return res.sendError(res, error.message);
  }

}

//Export Qr code for villages  extracting the zip file
const exportQrCode = async (req: Request, res: Response) => {
  try {
    if (!req.query.villageId) {
      return res.sendError(res, "Need Village id");
    }
    const farmers = await Farmer.findAll({
      where: { village_id: Number(req.query.villageId) },
      include: [{
        model: Village,
        as: "village",
      }]
    });
    if (farmers.length === 0) {
      return res.sendError(res, "NO_FAMRER_FOUND");
    }
    let destinationFolder = path.join('./qrCode');
    let sourceFolder = path.join('./upload');
    if (!fs.existsSync(destinationFolder)) {
      fs.mkdirSync(destinationFolder);
    }
    for await (const farmer of farmers) {
      if (farmer.qrUrl) {
        const sourcePath = `${sourceFolder}/${farmer.qrUrl}`;
        const destinationPath = `${destinationFolder}/${farmer.qrUrl}`;
        fs.copyFileSync(sourcePath, destinationPath);
      } else {
        let uniqueFilename = `qrcode_${Date.now()}.png`;
        let name = farmer.firstName + " " + farmer.lastName
        let data = await generateQrCode(`Farmer Code : ${farmer.code}  Farmer Id: ${farmer.id}`,
          name, uniqueFilename, farmer.code, farmer.village.village_name);
        console.log(data);
        const farmerPLace = await Farmer.update({ qrUrl: uniqueFilename }, {
          where: {
            id: farmer.id
          },
        });
        const sourcePath = `${sourceFolder}/${uniqueFilename}`;
        const destinationPath = `${destinationFolder}/${uniqueFilename}`;
        fs.copyFileSync(sourcePath, destinationPath);
      }
    }
    const zipFileName = path.join('./upload', 'qrCode.zip');
    const output = fs.createWriteStream(zipFileName);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Compression level (0 to 9)
    });

    output.on('close', () => {
      console.log(`${zipFileName} created: ${archive.pointer()} total bytes`);
    });

    archive.on('warning', (err: any) => {
      if (err.code === 'ENOENT') {
        console.warn(err);
      } else {
        throw err;
      }
    });

    archive.on('error', (err: any) => {
      throw err;
    });

    archive.pipe(output);
    archive.directory(destinationFolder, false);
    archive.finalize();
    res.sendSuccess(res, {
      link: process.env.BASE_URL + 'qrCode.zip'
    });
    setTimeout(() => {
      fs.rmdir(destinationFolder, { recursive: true }, (err) => {
        console.log(err);
      })
    }, 2000);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
}

export {
  createFarmer,
  fetchFarmerPagination,
  updateFarmer,
  deleteFarmer,
  fetchFarmPagination,
  fetchFarm,
  updateFarmerFarm,
  createFarmerFarm,
  countFarmWithProgram,
  exportFarmer,
  fetchFarmer,
  generateQrCodeVillage,
  exportQrCode
};
