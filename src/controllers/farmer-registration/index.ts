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
import Transaction from "../../models/transaction.model";
import sequelize from "../../util/dbConn";
import moment from "moment";

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
    let name = farmer.lastName ? farmer.firstName + " " + farmer.lastName : farmer.firstName
    let uniqueFilename = `qrcode_${name.replace(/\//g, '-')}_${farmer.code.replace(/\//g, '-')}.png`;
    let aa = await generateQrCode(`${farmer.id}`,
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
      total_estimated_cotton: req.body.totalEstimatedCotton,
      available_cotton: Number(req.body.totalEstimatedCotton) + (0.15 * Number(req.body.totalEstimatedCotton))
    };
    const farm = await Farm.create(farmData);
    res.sendSuccess(res, { farmer, farm });
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message);
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
  const { icsId, farmGroupId, countryId, stateId, villageId, cert, seasonId }: any = req.query;
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

    if (seasonId) {
      const idArray: string[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.season_id = { [Op.in]: idArray };
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
        const idArray: number[] = programId
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
        order: [['id', 'desc']],
        offset: offset,
        limit: limit,
      });
      return res.sendPaginationSuccess(res, { rows, farmCount: farmCount ? farmCount : [] }, count);
    } else {
      const farmGroup = await Farm.findAll({
        where: whereCondition,
        order: [['id', 'desc']],
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
    console.log(error)
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
      ics_id: req.body.icsId ? req.body.icsId : null,
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
    if (farmer && (farmer[0] === 1)) {
      let village = await Village.findOne({ where: { id: Number(req.body.villageId) } })
      let name = req.body.lastName ? req.body.firstName  + " " + req.body.lastName : req.body.firstName 
      let uniqueFilename = `qrcode_${name.replace(/\//g, '-')}_${req.body.code.replace(/\//g, '-')}.png`;
      const farmerId = req.body.id?.toString()
      let aa = await generateQrCode(farmerId,
        name, uniqueFilename, req.body.code, village ? village.village_name : '');
      const farmerPLace = await Farmer.update({ qrUrl: uniqueFilename }, {
        where: {
          id: req.body.id
        }
      });
    }
    if (req.body.farmId) {
      let farmer = await Farm.update({
        program_id: Number(req.body.programId),
        agri_total_area: req.body.agriTotalArea,
        agri_estimated_yeld: req.body.agriEstimatedYield,
        agri_estimated_prod: req.body.agriEstimatedProd,
        cotton_total_area: req.body.cottonTotalArea,
        total_estimated_cotton: req.body.totalEstimatedCotton,
        available_cotton: Number(req.body.totalEstimatedCotton) + (0.15 * Number(req.body.totalEstimatedCotton))
      }, { where: { id: req.body.farmId } })
    }

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
    let result = await Farm.findOne({ where: { season_id: req.body.seasonId, farmer_id: { [Op.eq]: req.body.farmerId } } })
    if (result) {
      return res.sendError(res, 'Farm is already exist with same season');
    }
    const data = {
      farmer_id: req.body.farmerId,
      program_id: req.body.programId,
      season_id: req.body.seasonId,
      agri_total_area: req.body.agriTotalArea,
      agri_estimated_yeld: req.body.agriEstimatedYield,
      agri_estimated_prod: req.body.agriEstimatedProd,
      cotton_total_area: req.body.cottonTotalArea,
      total_estimated_cotton: req.body.totalEstimatedCotton,
      available_cotton: Number(req.body.totalEstimatedCotton) + (0.15 * Number(req.body.totalEstimatedCotton))
    };
    const farm = await Farm.create(data);
    res.sendSuccess(res, { farm });
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message);
  }
};

const updateFarmerFarm = async (req: Request, res: Response) => {
  try {
    let result = await Farm.findOne({ where: { season_id: req.body.seasonId, farmer_id: { [Op.eq]: req.body.farmerId }, id: { [Op.ne]: Number(req.body.id) } } })
    if (result) {
      return res.sendError(res, 'Farm is already exist with same season');
    }
    const data = {
      farmer_id: req.body.farmerId,
      program_id: req.body.programId,
      season_id: req.body.seasonId,
      agri_total_area: req.body.agriTotalArea,
      agri_estimated_yeld: req.body.agriEstimatedYield,
      agri_estimated_prod: req.body.agriEstimatedProd,
      cotton_total_area: req.body.cottonTotalArea,
      total_estimated_cotton: req.body.totalEstimatedCotton,
      available_cotton: Number(req.body.totalEstimatedCotton) + (0.15 * Number(req.body.totalEstimatedCotton))
    };
    const farm = await Farm.update(data, {
      where: {
        id: req.body.id,
      },
    });

    res.sendSuccess(res, { farm });
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message);
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
        order: [
          ['season_id', "desc"]
        ],
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
        ]
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
  const searchTerm = req.query.search || "";
  const programId: string = req.query.programId as string;
  const brandId: string = req.query.brandId as string;
  const { icsId, farmGroupId, countryId, stateId, villageId, cert, seasonId }: any = req.query;
  const maxRowsPerWorksheet = 100000;
  const batchSize = 5000;
  let offset = 0;
  let worksheetIndex = 0;
  let hasNextBatch = true;

  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { '$farmer.firstName$': { [Op.iLike]: `%${searchTerm}%` } }, 
        { '$farmer.code$': { [Op.iLike]: `%${searchTerm}%` } }, 
        { '$farmer.program.program_name$': { [Op.iLike]: `%${searchTerm}%` } }, 
        { '$farmer.country.county_name$': { [Op.iLike]: `%${searchTerm}%` } }, 
        { '$farmer.village.village_name$': { [Op.iLike]: `%${searchTerm}%` } }, 
        { '$farmer.brand.brand_name$': { [Op.iLike]: `%${searchTerm}%` } }, 
        { '$farmer.cert_status$': { [Op.iLike]: `%${searchTerm}%` } }, 
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

    if (seasonId) {
      const idArray: string[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.season_id = { [Op.in]: idArray };
    }

    const workbook = new ExcelJS.Workbook();

      while (hasNextBatch) {
      const farmers = await Farm.findAll({
        where: whereCondition,
        attributes: [
          [Sequelize.fn("concat", Sequelize.col("firstName"), Sequelize.col("lastName")), "farmerName"],
          [Sequelize.col('"farmer"."code"'), 'fatherCode'],
          [Sequelize.col('"farmer"."country"."county_name"'), 'country'],
          [Sequelize.col('"farmer"."state"."state_name"'), 'state'],
          [Sequelize.col('"farmer"."district"."district_name"'), 'district'],
          [Sequelize.col('"farmer"."block"."block_name"'), 'block'],
          [Sequelize.col('"farmer"."village"."village_name"'), 'village'],
          [Sequelize.col('"season"."name"'), 'seasons'],
          [Sequelize.col('"farmer"."farmGroup"."name"'), 'farmGroup'],
          [Sequelize.col('"farmer"."brand"."brand_name"'), 'brand'],
          [Sequelize.col('"farmer"."program"."program_name"'), 'program'],
          [Sequelize.col('"farms"."agri_total_area"'), 'agriTotalArea'],
          [Sequelize.col('"farms"."agri_estimated_yeld"'), 'agriEstimatedYield'],
          [Sequelize.col('"farms"."agri_estimated_prod"'), 'agriEstimatedProd'],
          [Sequelize.col('"farms"."total_estimated_cotton"'), 'totalEstimatedCotton'],
          [Sequelize.col('"farms"."cotton_total_area"'), 'cottonTotalArea'],
          [Sequelize.col('"farmer"."tracenet_id"'), 'tracenetId'],
          [Sequelize.col('"farmer"."ics"."ics_name"'), 'iscName'],
          [Sequelize.col('"farmer"."cert_status"'), 'cert'],
        ],
        include: [
          {
            model: Farmer,
            as: "farmer",
            attributes: [],
            include: [
              {
                model: Program,
                as: "program",
                attributes: [],
              },
              {
                model: Brand,
                as: "brand",
                attributes: [],
              },
              {
                model: FarmGroup,
                as: "farmGroup",
                attributes: [],
              },
              {
                model: Country,
                as: "country",
                attributes: [],
              },
              {
                model: Village,
                as: "village",
                attributes: [],
              },
              {
                model: State,
                as: "state",
                attributes: [],
              },
              {
                model: District,
                as: "district",
                attributes: [],
              },
              {
                model: Block,
                as: "block",
                attributes: [],
              },
              {
                model: Block,
                as: "block",
                attributes: [],
              },
              {
                model: ICS,
                as: "ics",
                attributes: [],
              },
            ]
          },
          {
            model: Season,
            as: "season",
            attributes: [],
          }
        ],
        raw: true,
        offset,
        limit: batchSize,
      });

      if (farmers.length === 0) {
        hasNextBatch = false;
        break;
      }

      if (offset % maxRowsPerWorksheet === 0) {
        worksheetIndex++;
      }

      for await (const [index,item] of farmers.entries()) {
        let currentWorksheet = workbook.getWorksheet(`Farmer Report ${worksheetIndex}`);
        if (!currentWorksheet) {
          currentWorksheet = workbook.addWorksheet(`Farmer Report ${worksheetIndex}`);
          // Set bold font for header row
          const headerRow = currentWorksheet.addRow([
            'S.No', 'Farmer Name', 'Farmer Code','Country', 'State', 'District', 'Block', 'Village',
            'Seasons', 'Farm Group', 'Brand Name', 'Programme Name', 'Total Agriculture Area', 'Estimated Yield (Kg/Ac)',
            'Total estimated Production','Cotton Total Area', 'Total Estimated Cotton', 'Tracenet Id', 'ICS Name', 'Certification Status'
          ]);
          headerRow.font = { bold: true };
        }
        const rowValues = Object.values({
          index: (offset + index + 1),
          farmerName: item.farmerName ? item.farmerName : "",
          code: item.fatherCode ? item.fatherCode : '',
          country: item.country,
          state: item.state,
          district: item.district,
          block: item.block,
          village: item.village,
          seasons: item.seasons,
          farmGroup: item.farmGroup,
          brand: item.brand,
          program:item.program,
          agriTotalArea: item.agriTotalArea ? Number(item.agriTotalArea)?.toFixed(2) : 0,
          agriEstimatedYield: item.agriEstimatedYield ? Number(item.agriEstimatedYield)?.toFixed(2) : 0,
          agriEstimatedProd: item.agriEstimatedProd ? Number(item.agriEstimatedProd)?.toFixed(2) : 0,
          cottonTotalArea: item.cottonTotalArea ? Number(item.cottonTotalArea)?.toFixed(2) : 0,
          totalEstimatedCotton: item.totalEstimatedCotton ? Number(item.totalEstimatedCotton)?.toFixed(2) : 0,
          tracenetId: item.tracenetId,
          iscName: item.icsName ? item.icsName : '',
          cert: item.cert ? item.cert : '',
        });

        currentWorksheet.addRow(rowValues).commit();
      }
      
      offset += batchSize;
    }

    // Save the workbook
    await workbook.xlsx.writeFile(excelFilePath);
    console.log("File saved to:", excelFilePath);
    res.status(200).send({
      success: true,
      message: "File successfully Generated",
      data: process.env.BASE_URL + "farmer.xlsx",
    });
  } catch (error: any) {
    console.error("Error exporting farmer data:", error);
    res.status(500).send({ success: false, message: "Failed to generate file" });
  }
};

//cron job for farmer export


// const exportFarmer = async (req: Request, res: Response) => {
//   try {
//   return res.status(200).send({
//     success: true,
//     messgage: "File successfully Generated",
//     data: process.env.BASE_URL + "farmer-data.xlsx",
//   });
// } catch (error: any) {
//   console.log(error);
//   return res.sendError(res, error.message);
// }
// };


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
        let name = farmer?.lastName ? farmer?.firstName + " " + farmer?.lastName : farmer?.firstName
        let uniqueFilename = `qrcode_${name?.replace(/\//g, '-')}_${farmer?.code?.replace(/\//g, '-')}.png`;
        let data = await generateQrCode(`${farmer.id}`,
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
    console.log(error)
    return res.sendError(res, error.message);
  }

}

//Export Qr code for villages  extracting the zip file
// const exportQrCode = async (req: Request, res: Response) => {
//   try {
//     if (!req.query.villageId) {
//       return res.sendError(res, "Need Village id");
//     }

//     const currentDate = moment().format('YYYY-MM-DD'); // get current date in YYYY-MM-DD format

//     const season = await Season.findOne({
//       where: {
//         from: {
//           [Op.lte]: currentDate // from_date should be less than or equal to current date
//         },
//         to: {
//           [Op.gte]: currentDate // to_date should be greater than or equal to current date
//         }
//       }
//     });

//     const villageId = Number(req.query.villageId);
//     const currentSeason = season ? season?.dataValues?.id : 10;

//     const farmers = await sequelize.query(
//       `SELECT f.id,
//               f.code,
//               "f"."firstName",
//               "f"."lastName",
//               fr.season_id,
//               "f"."qrUrl",
//               v.id as village_id,
//               v.village_name as village_name
//         FROM farmers f
//         JOIN farms fr ON f.id = fr.farmer_id
//         JOIN villages v ON f.village_id = v.id
//         WHERE 
//           fr.season_id = ${currentSeason}
//           AND f.village_id = :villageId
//       `,
//       {
//         replacements: { villageId }, // using parameter binding
//         type: sequelize.QueryTypes.SELECT // ensure you're fetching data (not just metadata)
//       }
//     )

//     if (farmers.length === 0) {
//       return res.sendError(res, "NO_FARMER_FOUND");
//     }
    
//     let destinationFolder = path.join('./qrCode');
//     let sourceFolder = path.join('./upload');
//     if (!fs.existsSync(destinationFolder)) {
//       fs.mkdirSync(destinationFolder);
//     }
//     for await (const farmer of farmers) {
//       if (farmer.qrUrl) {
//         const sourcePath = `${sourceFolder}/${farmer.qrUrl}`;
//         const destinationPath = `${destinationFolder}/${farmer.qrUrl}`;
//         fs.copyFileSync(sourcePath, destinationPath);
//       }  else {       
//         let name = farmer.lastName ? farmer.firstName + " " + farmer.lastName : farmer.firstName
//         let uniqueFilename = `qrcode_${name}_${farmer.code.replace(/\//g, '-')}.png`; 
//         let data = await generateQrCode(`${farmer.id}`,
//           name, uniqueFilename, farmer.code, farmer.village_name);
//         console.log(data);
//         const farmerPLace = await Farmer.update({ qrUrl: uniqueFilename }, {
//           where: {
//             id: farmer.id
//           },
//         });
//         const sourcePath = `${sourceFolder}/${uniqueFilename}`;
//         const destinationPath = `${destinationFolder}/${uniqueFilename}`;
//         fs.copyFileSync(sourcePath, destinationPath);
//       }
//     }
//     const zipFileName = path.join('./upload', 'qrCode.zip');
//     const output = fs.createWriteStream(zipFileName);
//     const archive = archiver('zip', {
//       zlib: { level: 9 } // Compression level (0 to 9)
//     });

//     output.on('close', () => {
//       console.log(`${zipFileName} created: ${archive.pointer()} total bytes`);
//     });

//     archive.on('warning', (err: any) => {
//       if (err.code === 'ENOENT') {
//         console.warn(err);
//       } else {
//         throw err;
//       }
//     });

//     archive.on('error', (err: any) => {
//       throw err;
//     });

//     archive.pipe(output);
//     archive.directory(destinationFolder, false);
//     archive.finalize();
//     res.sendSuccess(res, {
//       link: process.env.BASE_URL + 'qrCode.zip'
//     });
//     setTimeout(() => {
//       fs.rmdir(destinationFolder, { recursive: true }, (err) => {
//         console.log(err);
//       })
//     }, 2000);
//   } catch (error: any) {
//     console.log(error)
//     return res.sendError(res, error.message);
//   }
// }

const exportQrCode = async (req: Request, res: Response) => {
  try {
    if (!req.query.villageId) {
      return res.sendError(res, "Need Village id");
    }

    const currentDate = moment().format('YYYY-MM-DD');
    const season = await Season.findOne({
      where: {
        from: { [Op.lte]: currentDate },
        to: { [Op.gte]: currentDate }
      }
    });

    const villageId = Number(req.query.villageId);
    const currentSeason = season ? season.dataValues.id : 10;

    const farmers = await sequelize.query(
      `SELECT f.id,
              f.code,
              "f"."firstName",
              "f"."lastName",
              fr.season_id,
              "f"."qrUrl",
              v.id as village_id,
              v.village_name as village_name
        FROM farmers f
        JOIN farms fr ON f.id = fr.farmer_id
        JOIN villages v ON f.village_id = v.id
        WHERE 
          fr.season_id = ${currentSeason}
          AND f.village_id = :villageId
      `,
      {
        replacements: { villageId },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (farmers.length === 0) {
      return res.sendError(res, "NO_FARMER_FOUND");
    }

    // Create a unique folder for this request based on villageId and timestamp
    const uniqueFolderName = `qrCode_${villageId}_${Date.now()}`;
    let destinationFolder = path.join('./qrCode', uniqueFolderName);
    let sourceFolder = path.join('./upload');

    if (!fs.existsSync(destinationFolder)) {
      fs.mkdirSync(destinationFolder, { recursive: true });
    }

    for await (const farmer of farmers) {
      if (farmer.qrUrl) {
        const sourcePath = `${sourceFolder}/${farmer.qrUrl}`;
        const destinationPath = `${destinationFolder}/${farmer.qrUrl}`;
        fs.copyFileSync(sourcePath, destinationPath);
      } else {
        let name = farmer.lastName ? farmer.firstName + " " + farmer.lastName : farmer.firstName;
        let uniqueFilename = `qrcode_${name.replace(/\//g, '-')}_${farmer.code.replace(/\//g, '-')}.png`;
        let data = await generateQrCode(`${farmer.id}`, name, uniqueFilename, farmer.code, farmer.village_name);
        await Farmer.update({ qrUrl: uniqueFilename }, { where: { id: farmer.id } });
        const sourcePath = `${sourceFolder}/${uniqueFilename}`;
        const destinationPath = `${destinationFolder}/${uniqueFilename}`;
        fs.copyFileSync(sourcePath, destinationPath);
      }
    }

    // Zip the contents of the unique folder
    const zipFileName = path.join('./upload', `${uniqueFolderName}.zip`);
    const output = fs.createWriteStream(zipFileName);
    const archive = archiver('zip', { zlib: { level: 9 } });

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
      link: `${process.env.BASE_URL}${uniqueFolderName}.zip`
    });

    setTimeout(() => {
      fs.rmdir(destinationFolder, { recursive: true }, (err) => {
        if (err) console.error(err);
      });
    }, 2000);
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.message);
  }
};


const dashboardGraph = async (req: Request, res: Response) => {
  try {
    let whereCondition: any = {};
    if (req.query.seasonId) {
      whereCondition.season_id = req.query.seasonId
    }

    const result = await Farm.findOne({
      where: whereCondition,
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.literal('DISTINCT farmer_id')), 'total_farmers'],
        [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('farms.cotton_total_area')), 0), 'total_area'],
        [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('farms.total_estimated_cotton')), 0), 'total_expected_yield']
      ]
    });
    const trans = await Transaction.findOne({
      attributes: [
        [sequelize.fn('sum', Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")), 'total_procured']
      ],
      where: {
        ...whereCondition,
        status: 'Sold'
      }
    })

    const graph = await Farm.findAll({
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.literal('DISTINCT farmer_id')), 'total_farmers'],
        [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('farms.cotton_total_area')), 0), 'total_area'],
        [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('farms.total_estimated_cotton')), 0), 'total_expected_yield']
      ],
      include: [{
        model: Season,
        as: 'season',
        attributes: ['id', 'name']
      }],
      group: ['season.id']
    });
    res.sendSuccess(res, { ...result.dataValues, ...trans.dataValues, graph: graph });
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message);
  }
}

const fetchFarmerPecurement = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const { icsId, farmGroupId, countryId, stateId, villageId, brandId, cert, seasonId }: any = req.query;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { firstName: { [Op.iLike]: `%${searchTerm}%` } }, // Search by first name
        { lastName: { [Op.iLike]: `%${searchTerm}%` } }, // Search by last name
        { code: { [Op.iLike]: `%${searchTerm}%` } }, // Search by code
      ];
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
    if (villageId) {
      const idArray: number[] = villageId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.village_id = { [Op.in]: idArray };
    }
    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.brand_id = { [Op.in]: idArray };
    }

    if (req.query.pagination === "true") {
      const { count, rows } = await Farmer.findAndCountAll({
        where: whereCondition,
        order: [['id', 'desc']],
        include: [{
          model: Brand,
          as: 'brand',
          attributes: ['id', 'brand_name']
        }],
        attributes: ['id', 'firstName', 'lastName', 'code', 'program_id', 'brand_id'],
        offset: offset,
        limit: limit
      });
      return res.sendPaginationSuccess(res, rows, count);
    } else {
      const farmGroup = await Farmer.findAll({
        where: whereCondition,
        order: [['id', 'desc']],
        include: [{
          model: Brand,
          as: 'brand',
          attributes: ['id', 'brand_name']
        }],
        attributes: ['id', 'firstName', 'lastName', 'code', 'program_id', 'brand_id']
      });
      return res.sendSuccess(res, farmGroup);
    }


  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message);
  }
};

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
  exportQrCode,
  dashboardGraph,
  fetchFarmerPecurement
};
