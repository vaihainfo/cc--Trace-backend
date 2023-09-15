import { Request, Response } from "express";
import { Sequelize, Op, where } from "sequelize";
import * as ExcelJS from "exceljs";
import * as fs from "fs";
import * as path from "path";
import Brand from "../../models/brand.model";
import FarmGroup from "../../models/farm-group.model";
import Farmer from "../../models/farmer.model";
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
    let result = await Farmer.findOne({ where: { code: req.body.code } })
    if (result) {
      return res.sendError(res, "FARMER_CODE_ALREADY_EXIST");
    }
    const data = {
      program_id: Number(req.body.programId),
      brand_id: Number(req.body.brandId),
      farmGroup_id: Number(req.body.farmGroupId),
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      code: req.body.code,
      country_id: Number(req.body.countryId),
      state_id: Number(req.body.stateId),
      district_id: Number(req.body.districtId),
      block_id: Number(req.body.blockId),
      village_id: Number(req.body.villageId),
      joining_date: req.body.joiningDate,
      ics_id: Number(req.body.icsId),
      tracenet_id: req.body.tracenetId,
      cert_status: req.body.certStatus,
      agri_total_area: req.body.agriTotalArea,
      agri_estimated_yeld: req.body.agriEstimatedYield,
      agri_estimated_prod: req.body.agriEstimatedProd,
      cotton_total_area: req.body.cottonTotalArea,
      total_estimated_cotton: req.body.totalEstimatedCotton
    };
    const farmer = await Farmer.create(data);
    let village = await Village.findOne({ where: { id: Number(req.body.villageId) } })
    let uniqueFilename = `qrcode_${Date.now()}.png`;
    let name = farmer.firstName + " " + farmer.lastName
    let aa = await generateQrCode(`Farmer Code : ${farmer.code}  Farmer Id: ${farmer.id}`,
      name, uniqueFilename, farmer.code, village ? village.village_name : '');
    const farmerPLace = await Farmer.update({ qrUrl: uniqueFilename }, {
      where: {
        id: farmer.id
      }
    });
    const farmData = {
      farmer_id: farmer.id,
      program_id: Number(req.body.programId),
      season_id: Number(req.body.seasonId),
      agri_total_area: req.body.agriTotalArea,
      agri_estimated_yeld: req.body.agriEstimatedYield,
      agri_estimated_prod: req.body.agriEstimatedProd,
      cotton_total_area: req.body.cottonTotalArea,
      total_estimated_cotton: req.body.totalEstimatedCotton
    };
    const farm = await Farm.create(farmData);
    res.sendSuccess(res, { farmer, farm });
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
  const programId: string = req.query.programId as string;
  const brandId: string = req.query.brandId as string;
  const { icsId, farmGroupId, countryId, stateId, villageId, cert }: any = req.query;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { '$farmer.firstName$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by first name
        { '$farmer.code$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by code
        { '$farmer.program.program_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by program
        { '$farmer.country.county_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by country
        { '$farmer.village.village_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by village
        { '$farmer.brand.brand_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by brand
        { '$farmer.cert_status$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by cert status
      ];
    }

    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
        whereCondition["$farmer.brand_id$"] = { [Op.in]: idArray };
      }
      if (programId) {
        const idArray: number[] = programId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$farmer.program_id$"] = { [Op.in]: idArray };
    }
    if (farmGroupId) {
      const idArray: number[] = farmGroupId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$farmer.farmGroup_id$"] = { [Op.in]: idArray };
    }
    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$farmer.country_id$"] = { [Op.in]: idArray };
    }
    if (stateId) {
      const idArray: number[] = stateId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$farmer.state_id$"] = { [Op.in]: idArray };
    }
    if (villageId) {
      const idArray: number[] = villageId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$farmer.village_id$"] = { [Op.in]: idArray };
    }

    if (cert) {
      const idArray: string[] = cert
        .split(",")
        .map((id: any) => id);
      whereCondition["$farmer.cert_status$"] = { [Op.in]: idArray };
    }

    if (icsId) {
      const idArray: string[] = icsId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition["$farmer.ics_id$"] = { [Op.in]: idArray };
    }

    let include = [
      {
        model: Farmer,
        as: "farmer",
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
          }
        ]
      },
      {
        model: Season,
        as: "season"
      }

    ];
    let farmCount: any
    if (brandId || countryId || programId) {
      let whereCondition: any = {};
      let group: any
      if (brandId) {
        const idArray: number[] = brandId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$farmer.brand_id$"] = { [Op.in]: idArray };
        group = ["farmer.brand_id"]
      }
      if (countryId) {
        const idArray: number[] = countryId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$farmer.country_id$"] = { [Op.in]: idArray };
        group = ["farmer.country_id"]
      }
      if (programId) {
        const idArray: number[] = countryId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition["$farmer.program_id$"] = { [Op.in]: idArray };
        group = ["farmer.program_id"]
      }
      farmCount = await Farm.findAll({
        where: whereCondition,
        attributes: [
          [
            Sequelize.fn("SUM", Sequelize.col("farmer.agri_total_area")),
            "totalArea",
          ],
          [
            Sequelize.fn("COUNT", Sequelize.col("farmer.id")),
            "totalFarmer",
          ],
          [
            Sequelize.fn(
              "SUM",
              Sequelize.col("farmer.cotton_total_area")
            ),
            "totalCotton",
          ],
        ],
        include: [
          {
            model: Farmer,
            as: "farmer",
            attributes: []
          }
        ],
        group: group
      });
    }

    //fetch data with pagination
    if (req.query.pagination === "true") {
      const { count, rows } = await Farm.findAndCountAll({
        where: whereCondition,
        include: include,
        offset: offset,
        limit: limit,
      });
      return res.sendPaginationSuccess(res, { rows, farmCount: farmCount ? farmCount : [] }, count);
    } else {
      const farmGroup = await Farm.findAll({
        where: whereCondition,
        include: include
      });
      return res.sendSuccess(res, farmGroup);
    }
  } catch (error: any) {
    console.log(error)
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
      include: include
    });
    const farm = await Farm.findOne({
      farmer_id: req.query.id,
      order: [
        ["id", 'asc'], // Sort the results based on the 'name' field and the specified order
      ]
    })
    return res.sendSuccess(res, { ...farmer.dataValues, season_id: farm.season_id });
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const updateFarmer = async (req: Request, res: Response) => {
  try {
    let result = await Farmer.findOne({ where: { id: { [Op.ne]: req.body.id }, code: req.body.code } })
    if (result) {
      return res.sendError(res, "FARMER_CODE_ALREADY_EXIST");
    }
    const data = {
      program_id: Number(req.body.programId),
      brand_id: Number(req.body.brandId),
      farmGroup_id: Number(req.body.farmGroupId),
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      code: req.body.code,
      country_id: Number(req.body.countryId),
      state_id: Number(req.body.stateId),
      district_id: Number(req.body.districtId),
      block_id: Number(req.body.blockId),
      village_id: Number(req.body.villageId),
      joining_date: req.body.joiningDate,
      ics_id: req.body.icsId,
      tracenet_id: req.body.tracenetId,
      cert_status: req.body.certStatus,
      agri_total_area: req.body.agriTotalArea,
      agri_estimated_yeld: req.body.agriEstimatedYield,
      agri_estimated_prod: req.body.agriEstimatedProd,
      cotton_total_area: req.body.cottonTotalArea,
      total_estimated_cotton: req.body.totalEstimatedCotton
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
    const farmer = await Farm.destroy({
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
    const data = {
      farmer_id: req.body.farmerId,
      program_id: req.body.programId,
      season_id: req.body.seasonId,
      agri_total_area: req.body.agriTotalArea,
      agri_estimated_yeld: req.body.agriEstimatedYield,
      agri_estimated_prod: req.body.agriEstimatedProd,
      cotton_total_area: req.body.cottonTotalArea,
      total_estimated_cotton: req.body.totalEstimatedCotton
    };
    const farm = await Farm.create(data);
    res.sendSuccess(res, { farm });
  } catch (error) {
    console.log(error)
    return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
  }
};

const updateFarmerFarm = async (req: Request, res: Response) => {
  try {

    const data = {
      farmer_id: req.body.farmerId,
      program_id: req.body.programId,
      season_id: req.body.seasonId,
      agri_total_area: req.body.agriTotalArea,
      agri_estimated_yeld: req.body.agriEstimatedYield,
      agri_estimated_prod: req.body.agriEstimatedProd,
      cotton_total_area: req.body.cottonTotalArea,
      total_estimated_cotton: req.body.totalEstimatedCotton
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
      }
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
      }
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
          Sequelize.fn("SUM", Sequelize.col("farmer.agri_total_area")),
          "totalArea",
        ],
        [
          Sequelize.fn("COUNT", Sequelize.col("farmer.id")),
          "totalFarmer",
        ],
        [
          Sequelize.fn(
            "SUM",
            Sequelize.col("farmer.cotton_total_area")
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
          model: Farmer,
          as: "farmer",
          attributes: [],
        }
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
      "Season", "FarmGroup", "Brand", "Program", "Total Agriculture Area", "Estimated Yield (Kg/Ac)", "Total estimated Production", "Cotton Total Area",
      "Total EstimatedCotton", "Tracenet Id", "ICS Name", "Certification Status"
    ]);
    headerRow.font = { bold: true };
    const farmer = await Farm.findAll({
      where: {},
      include: [
        {
          model: Farmer,
          as: "farmer",
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
            }
          ]
        },
        {
          model: Season,
          as: "season"
        }
      ],
    });

    // Append data to worksheet
    for await (const [index, item] of farmer.entries()) {
      let ics: any
      if (item.farmer.ics_id) {
        ics = await ICS.findOne({ where: { id: item.farmer.ics_id } });
      }
      const rowValues = Object.values({
        index: index + 1,
        farmerName: item.farmer.firstName + item.farmer.lastName,
        fatherCode: item.farmer.code,
        country: item.farmer.country.county_name,
        state: item.farmer.state.state_name,
        district: item.farmer.district.district_name,
        block: item.farmer.block.block_name,
        village: item.farmer.village.village_name,
        season: item.season ? item.season.name : '',
        farmGroup: item.farmer.farmGroup.name,
        brand: item.farmer.brand.brand_name,
        program: item.farmer.program.program_name,
        agriTotalArea: item ? item.agri_total_area : '',
        agriEstimatedYield: item ? item.agri_estimated_yeld : '',
        agriEstimatedProd: item ? item.agri_estimated_prod : '',
        cottonTotalArea: item ? item.cotton_total_area : '',
        totalEstimatedCotton: item ? item.total_estimated_cotton : '',
        tracenetId: item.farmer.tracenet_id,
        iscName: ics ? ics.ics_name : '',
        cert: item.farmer.certStatus ? item.farmer.certStatus : ''
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
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
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
