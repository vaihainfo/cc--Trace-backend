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
import * as ExcelJS from "exceljs";
import * as path from "path";
import FarmGroup from "../../models/farm-group.model";
import Farm from "../../models/farm.model";
import FarmerAgriArea from "../../models/farmer-agri-area.model";
import FarmerCottonArea from "../../models/farmer-cotton-area.model";
import sequelize from "../../util/dbConn";
import UserApp from "../../models/users-app.model";
import { saveFailedRecord } from "../failed-records";
import GinnerAllocatedVillage from "../../models/ginner-allocated-vilage.model";


const createTransaction = async (req: Request, res: Response) => {
  try {
    if (Number(req.body.qtyPurchased) < 0) {
      return res.sendError(res, 'QtyPurchased should be greater than 0')
    }
    if (Number(req.body.rate) < 0) {
      return res.sendError(res, 'Rate should be greater than 0')
    }
    const data: any = {
      date: req.body.date,
      district_id: req.body.districtId,
      block_id: req.body.blockId,
      village_id: req.body.villageId,
      farmer_id: req.body.farmerId,
      farm_id: req.body.farmId,
      farmer_name: req.body.farmerName,
      brand_id: req.body.brandId,
      farmer_code: req.body.farmerCode,
      season_id: req.body.season,
      qty_purchased: req.body.qtyPurchased,
      qty_stock: req.body.qtyPurchased,
      rate: req.body.rate,
      grade_id: req.body.grade,
      program_id: req.body.program,
      total_amount: req.body.totalAmount,
      mapped_ginner: req.body.ginner,
      vehicle: req.body.vehicle,
      payment_method: req.body.paymentMethod,
      proof: req.body.proof,
      status: "Pending",
      state_id: req.body.stateId,
      country_id: req.body.countryId
    };
    let farm;
    if (req.body.farmId) {
      farm = await Farm.findByPk(req.body.farmId);
      if (!farm) {
        return res.sendError(res, "Farm is not present");
      }
      data.estimated_cotton = Number(farm.total_estimated_cotton);
      data.available_cotton = Number(farm.available_cotton) - Number(farm.cotton_transacted || 0);
    }
 
    const transaction = await Transaction.create(data);
    const s = await Farm.update({
      cotton_transacted: Number(farm.cotton_transacted || 0) + Number(req.body.qtyPurchased),
      // available_cotton: Number(farm.available_cotton || 0) - Number(req.body.qtyPurchased)
    }, { where: { id: req.body.farmId } });
    res.sendSuccess(res, transaction);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

const fetchTransactions = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const sortOrder = req.query.sort || "desc";
  //   const sortField = req.query.sortBy || '';
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const status: string = req.query.status as string;
  const countryId: string = req.query.countryId as string;
  const brandId: string = req.query.brandId as string;
  const farmGroupId: string = req.query.farmGroupId as string;
  const seasonId: string = req.query.seasonId as string;
  const programId: string = req.query.programId as string;
  const ginnerId: string = req.query.ginnerId as string;
  const farmerId: string = req.query.farmerId as string;
  const villageId: string = req.query.villageId as string;
  const stateId: any = req.query.stateId;
  const { endDate, startDate, transactionVia }: any = req.query;
  const whereCondition: any = {};

  try {
    // apply filters
    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id) => parseInt(id, 10));
      whereCondition.country_id = { [Op.in]: idArray };
    }

    if (villageId) {
      const idArray: number[] = villageId
        .split(",")
        .map((id) => parseInt(id, 10));
      whereCondition.village_id = { [Op.in]: idArray };
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

    if (farmerId) {
      const idArray: number[] = farmerId
        .split(",")
        .map((id) => parseInt(id, 10));
      whereCondition.farmer_id = { [Op.in]: idArray };
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
    if (transactionVia) {
      if (transactionVia === 'web') {
        whereCondition.agent_id = null
      }
      if (transactionVia === 'app') {
        whereCondition.agent_id = { [Op.not]: null }
      }
    }

    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereCondition.date = { [Op.between]: [startOfDay, endOfDay] }
    }

    if (status) {
      whereCondition.status = status;
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
        { "$block.block_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$country.county_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$state.state_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$village.village_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$district.district_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$farmer.firstName$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }

    let queryOptions: any = {
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
    };

    if (sortOrder === "asc" || sortOrder === "desc") {
      queryOptions.order = [["id", sortOrder]];
    }

    // apply pagination
    if (req.query.pagination === "true") {
      queryOptions.offset = offset;
      queryOptions.limit = limit;

      const { count, rows } = await Transaction.findAndCountAll(queryOptions);

      // Fetch ginner data for each mapped_ginner ID
      //   const transactionsWithGinner = await Promise.all(
      //     rows.map(async (transaction: any) => {
      //       if (transaction.mapped_ginner) {
      //         const ginner = await Ginner.findByPk(transaction.mapped_ginner);
      //         console.log(ginner)
      //         return { ...transaction.toJSON(), ginner };
      //       }
      //       return transaction.toJSON();
      //     })
      //   );

      return res.sendPaginationSuccess(res, rows, count);
    } else {
      // fetch without filters
      const transaction = await Transaction.findAll(queryOptions);
      return res.sendSuccess(res, transaction);
    }
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

const fetchTransactionById = async (req: Request, res: Response) => {
  try {

    let queryOptions: any = {
      where: { id: req.params.id },
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
      ],
    };

    const data = await Transaction.findOne(queryOptions);
    // const farm = await Farm.findOne({
    //   where: { farmer_id: data.farmer_id },
    //   include: [
    //     {
    //       model: Season,
    //       as: "season",
    //     },
    //     {
    //       model: FarmerAgriArea,
    //       as: "farmerAgriArea",
    //     },
    //     {
    //       model: FarmerCottonArea,
    //       as: "farmerCottonArea",
    //     },
    //   ],
    // });

    // const transaction: any = {
    //   ...data.dataValues,
    //   farm
    // }
    return res.sendSuccess(res, data);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

const fetchTransactionsBySeasonAndFarmer = async (req: Request, res: Response) => {
  try {
    // Create the excel workbook file
    const { seasonId, farmerId } = req.query;
    if (!seasonId) {
      return res.sendError(res, 'NEED_SEASON_ID');
    }
    if (!farmerId) {
      return res.sendError(res, 'NEED_FARMER_ID');
    }
    let include = [
      {
        model: Farmer,
        as: "farmer",
        attributes: []
      },
      {
        model: Season,
        as: "season",
        attributes: []
      },
      {
        model: Farm,
        as: "farm",
        attributes: [],
        include: [{
          model: Season,
          as: "season",
          attributes: []
        }]
      },
    ];

    const data = await Transaction.findAll({
      attributes: [
        'id', 'farmer_code',
        [Sequelize.col('"farmer"."firstName"'), 'firstName'],
        [Sequelize.col('"farmer"."lastName"'), 'lastName'],
        [Sequelize.col('"farm"."season"."name'), 'season_name'],
        [Sequelize.col('"farm"."total_estimated_cotton"'), 'total_estimated_cotton'],
        'available_cotton',
        'qty_purchased',
        [Sequelize.literal('("farm"."available_cotton" - CAST("qty_purchased" AS DOUBLE PRECISION))'), 'qty_stock']
      ],
      where: {
        farmer_id: farmerId,
        '$farm.season_id$': seasonId
      },
      include: include,
      order: [["id", 'asc']]
    });
    return res.sendSuccess(res, data);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

const updateTransaction = async (req: Request, res: Response) => {
  try {
    if (Number(req.body.qtyPurchased) < 0) {
      return res.sendError(res, 'QtyPurchased should be greater than 0')
    }
    if (Number(req.body.rate) < 0) {
      return res.sendError(res, 'Rate should be greater than 0')
    }
    const data: any = {
      date: req.body.date,
      district_id: req.body.districtId,
      block_id: req.body.blockId,
      village_id: req.body.villageId,
      farmer_id: req.body.farmerId,
      farm_id: req.body.farmId,
      farmer_name: req.body.farmerName,
      brand_id: req.body.brandId,
      farmer_code: req.body.farmerCode,
      season_id: req.body.season,
      qty_purchased: req.body.qtyPurchased,
      qty_stock: req.body.qtyPurchased,
      rate: req.body.rate,
      grade_id: req.body.grade,
      program_id: req.body.program,
      total_amount: req.body.totalAmount,
      mapped_ginner: req.body.ginner,
      vehicle: req.body.vehicle,
      payment_method: req.body.paymentMethod,
      proof: req.body.proof,
      status: req.body.status,
      state_id: req.body.stateId,
      country_id: req.body.countryId
    };
    let farm;
    if (req.body.farmId) {
      farm = await Farm.findByPk(req.body.farmId);
      if (!farm) {
        return res.sendError(res, "Farm is not present");
      }
      data.estimated_cotton = farm.total_estimated_cotton;
      data.available_cotton = farm.total_estimated_cotton - (farm.cotton_transacted || 0);
    }
    const transaction = await Transaction.update(data, {
      where: {
        id: req.body.id,
      },
    });
    let s = await Farm.update({
      cotton_transacted: (farm.cotton_transacted || 0) + Number(req.body.qtyPurchased)
    }, { where: { id: req.body.farmId } });
    res.sendSuccess(res, transaction);
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message);
  }
};

const allVillageCottonData = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  const { villageId, brandId, countryId }: any = req.query;
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { '$farmer.village.village_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by first name
      ];
    }

    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition['$farmer.brand_id$'] = { [Op.in]: idArray };
    }

    const { count, rows } = await Farm.findAndCountAll({
      attributes: [
        [sequelize.col('"farmer"."village_id"'), 'village_id'],
        [sequelize.col('"farmer"."village"."village_name"'), 'village_name'],
        [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal('CAST("farms"."total_estimated_cotton"AS DOUBLE PRECISION)')), 0), 'estimated_qty'],
        [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal('CAST("farms"."cotton_transacted" AS DOUBLE PRECISION)')), 0), 'sold_qty'],
        [sequelize.literal('(COALESCE(SUM(CAST("farms"."total_estimated_cotton" AS DOUBLE PRECISION)), 0) - COALESCE(SUM(CAST("farms"."cotton_transacted" AS DOUBLE PRECISION)), 0))'), 'available_qty'],
      ],
      include: [
        {
          model: Farmer,
          as: 'farmer',
          attributes: [],
          include: [
            {
              model: Village,
              as: 'village',
              attributes: []
            },
          ]
        }
      ],
      where: whereCondition,
      group: ['farmer.village_id', 'farmer.village.id'],
      order: [
        [
          'village_id', 'desc'
        ]
      ],
      offset: offset,
      limit: limit,
    });

    return res.sendPaginationSuccess(res, rows, count.length);

  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.meessage);
  }

}

const cottonData = async (req: Request, res: Response) => {
  try {
    if (req.query.villageId) {
      const whereClause = { village_id: req.query.villageId };
      const estimatedQty = await Farm.findOne({
        attributes: [
          [Sequelize.fn('SUM', Sequelize.col('farms.total_estimated_cotton')), 'estimated_qty']
        ],
        where: { '$farmer.village_id$': req.query.villageId },
        include: [{
          model: Farmer,
          as: 'farmer',
          attributes: []
        }],
        group: ['farmer.village_id']
      });
      const soldQty = await Transaction.findOne({
        attributes: [
          [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")), 0), 'qty']
        ],
        where: {
          village_id: req.query.villageId,
          program_id: { [Op.or]: [req.query.programId, 0] }
        }
      })
      const availableQty = (estimatedQty?.dataValues?.estimated_qty ?? 0) - (soldQty?.dataValues?.qty ?? 0);

      const villageName = await Village.findOne({ attributes: ['village_name'], where: { id: req.query.villageId } });
      let abc = {
        village_name: villageName.village_name,
        estimated_qty: estimatedQty?.dataValues.estimated_qty || 0,
        sold_qty: soldQty.dataValues.qty || 0,
        available_qty: availableQty || 0
      }
      res.sendSuccess(res, abc)
    }
    if (req.query.ginnerId) {
      let whereCondition: any = {
        mapped_ginner: req.query.ginnerId
      }
      if (req.query.programId) {
        whereCondition = {
          mapped_ginner: req.query.ginnerId,
          program_id: req.query.programId
        }
      }
      const soldQty = await Transaction.findOne({
        attributes: [
          [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")), 0), 'qty']
        ],
        where: whereCondition
      })
      let qty = soldQty?.dataValues?.qty ?? 0
      res.sendSuccess(res, { qty: qty })
    }


  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.meessage);
  }

}

const deleteTransaction = async (req: Request, res: Response) => {
  try {
    let trans = await Transaction.findOne({
      where: {
        id: req.body.id
      }
    })
    if (!trans) {
      return res.sendError(res, 'No transaction found')
    }
    if (trans.dataValues.status !== 'Pending') {
      return res.sendError(res, 'Transaction is not in pending state')
    }

    if (trans.dataValues.farm_id) {
      let farm = await Farm.findOne({ where: { id: trans.dataValues.farm_id } })
      let s = await Farm.update({
        cotton_transacted: (Number(farm.cotton_transacted) || 0) - (Number(trans.dataValues.qty_purchased) || 0)
      }, { where: { id: trans.dataValues.farm_id } });
    }

    const transaction = await Transaction.destroy({
      where: {
        id: req.body.id,
      },
    });

    res.sendSuccess(res, { transaction });
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message);
  }
};

const deleteBulkTransactions = async (req: Request, res: Response) => {
  try {
    const { fromId, toId } = req.body;
    let fail: any = [];
    let pass: any = [];
    for (let i = fromId; i <= toId; i++) {
      let trans = await Transaction.findOne({
        where: {
          id: i
        }
      })
      if (!trans) {
        fail.push({ id: i, message: 'No transaction found' })
      } else {
        if (trans.dataValues.status !== 'Pending') {
          fail.push({ id: i, message: 'Transaction is not in pending state' })
        } else {
          if (trans.dataValues.farm_id) {
            let farm = await Farm.findOne({ where: { id: trans.dataValues.farm_id } })
            if (farm) {
              let s = await Farm.update({
                cotton_transacted: (Number(farm.cotton_transacted) || 0) + (Number(trans.dataValues.qty_purchased) || 0)
              }, { where: { id: trans.dataValues.farm_id } });
            }
          }
          const transaction = await Transaction.destroy({
            where: {
              id: i,
            }
          });
          pass.push({ id: i, message: 'Deleted successfully' })
        }
      }
    }
    res.sendSuccess(res, { pass, fail })
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message);
  }
}

const uploadTransactionBulk = async (req: Request, res: Response) => {
  try {
    let fail = [];
    let pass = [];
    for await (const data of req.body.transaction) {

      if (!data.season) {
        fail.push({
          success: false,
          data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
          message: "Season cannot be empty",
        });
        let failedRecord = {
          type: 'Procurement',
          season: '',
          farmerCode: data.farmerCode ? data.farmerCode : '',
          farmerName: data.farmerName ? data.farmerName : '',
          body: { ...data },
          reason: "Season cannot be empty"
        }
        saveFailedRecord(failedRecord)
      } else if (!data.date) {
        fail.push({
          success: false,
          data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
          message: "Date cannot be empty",
        });
        let failedRecord = {
          type: 'Procurement',
          season: '',
          farmerCode: data.farmerCode ? data.farmerCode : '',
          farmerName: data.farmerName ? data.farmerName : '',
          body: { ...data },
          reason: "Date cannot be empty"
        }
        saveFailedRecord(failedRecord)
      } else if (!data.country) {
        fail.push({
          success: false,
          data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
          message: "Country cannot be empty",
        });
        let failedRecord = {
          type: 'Procurement',
          season: '',
          farmerCode: data.farmerCode ? data.farmerCode : '',
          farmerName: data.farmerName ? data.farmerName : '',
          body: { ...data },
          reason: "Country cannot be empty"
        }
        saveFailedRecord(failedRecord)
      } else if (!data.state) {
        fail.push({
          success: false,
          data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
          message: "State cannot be empty",
        });
        let failedRecord = {
          type: 'Procurement',
          season: '',
          farmerCode: data.farmerCode ? data.farmerCode : '',
          farmerName: data.farmerName ? data.farmerName : '',
          body: { ...data },
          reason: "State cannot be empty"
        }
        saveFailedRecord(failedRecord)
      }
      else if (!data.district) {
        fail.push({
          success: false,
          data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
          message: "District cannot be empty",
        });
        let failedRecord = {
          type: 'Procurement',
          season: '',
          farmerCode: data.farmerCode ? data.farmerCode : '',
          farmerName: data.farmerName ? data.farmerName : '',
          body: { ...data },
          reason: "District cannot be empty"
        }
        saveFailedRecord(failedRecord)
      }
      else if (!data.block) {
        fail.push({
          success: false,
          data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
          message: "Block cannot be empty",
        });
        let failedRecord = {
          type: 'Procurement',
          season: '',
          farmerCode: data.farmerCode ? data.farmerCode : '',
          farmerName: data.farmerName ? data.farmerName : '',
          body: { ...data },
          reason: "Block cannot be empty"
        }
        saveFailedRecord(failedRecord)
      } else if (!data.village) {
        fail.push({
          success: false,
          data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
          message: "Village cannot be empty",
        });
        let failedRecord = {
          type: 'Procurement',
          season: '',
          farmerCode: data.farmerCode ? data.farmerCode : '',
          farmerName: data.farmerName ? data.farmerName : '',
          body: { ...data },
          reason: "Village cannot be empty"
        }
        saveFailedRecord(failedRecord)
      } else if (!data.farmerName) {
        fail.push({
          success: false,
          data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
          message: "Farmer Name cannot be empty",
        });
        let failedRecord = {
          type: 'Procurement',
          season: '',
          farmerCode: data.farmerCode ? data.farmerCode : '',
          farmerName: data.farmerName ? data.farmerName : '',
          body: { ...data },
          reason: "Farmer Name cannot be empty"
        }
        saveFailedRecord(failedRecord)
      } else if (!data.rate) {
        fail.push({
          success: false,
          data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
          message: "Rate cannot be empty",
        });
        let failedRecord = {
          type: 'Procurement',
          season: '',
          farmerCode: data.farmerCode ? data.farmerCode : '',
          farmerName: data.farmerName ? data.farmerName : '',
          body: { ...data },
          reason: "Rate cannot be empty"
        }
        saveFailedRecord(failedRecord)
      } else if (!data.qtyPurchased) {
        fail.push({
          success: false,
          data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
          message: "Qty Purchased cannot be empty",
        });
        let failedRecord = {
          type: 'Procurement',
          season: '',
          farmerCode: data.farmerCode ? data.farmerCode : '',
          farmerName: data.farmerName ? data.farmerName : '',
          body: { ...data },
          reason: "Qty. Purchased cannot be empty"
        }
        saveFailedRecord(failedRecord)
      } else if (!data.grade) {
        fail.push({
          success: false,
          data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
          message: "Grade cannot be empty",
        });
        let failedRecord = {
          type: 'Procurement',
          season: '',
          farmerCode: data.farmerCode ? data.farmerCode : '',
          farmerName: data.farmerName ? data.farmerName : '',
          body: { ...data },
          reason: "Grade cannot be empty"
        }
        saveFailedRecord(failedRecord)
      } else if (!data.ginner) {
        fail.push({
          success: false,
          data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
          message: "Ginner cannot be empty",
        });
        let failedRecord = {
          type: 'Procurement',
          season: '',
          farmerCode: data.farmerCode ? data.farmerCode : '',
          farmerName: data.farmerName ? data.farmerName : '',
          body: { ...data },
          reason: "Ginner cannot be empty"
        }
        saveFailedRecord(failedRecord)
      } else {
        let season;
        let country;
        let ginner;
        let brand;
        let grade;
        let state;
        let block;
        let district: any;
        let farmer;
        let village;
        let farm: any
        if (data.season) {
          season = await Season.findOne({
            where: {
              name: data.season,
            },
          });
          if (!season) {
            fail.push({
              success: false,
              data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
              message: "Season not found",
            });
            let failedRecord = {
              type: 'Procurement',
              season: '',
              farmerCode: data.farmerCode ? data.farmerCode : '',
              farmerName: data.farmerName ? data.farmerName : '',
              body: { ...data },
              reason: "Season not found"
            }
            saveFailedRecord(failedRecord)
          }  else if (data.country) {
              country = await Country.findOne({
                where: {
                  county_name: { [Op.iLike]: data.country },
                },
              });

              if (!country) {
                fail.push({
                  success: false,
                  data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
                  message: "Country not found",
                });
                let failedRecord = {
                  type: 'Procurement',
                  season: season,
                  farmerCode: data.farmerCode ? data.farmerCode : '',
                  farmerName: data.farmerName ? data.farmerName : '',
                  body: { ...data },
                  reason: "Country not found"
                }
                saveFailedRecord(failedRecord)
              } else {
                if (data.state) {
                  state = await State.findOne({
                    where: {
                      country_id: country.id,
                      state_name: { [Op.iLike]: data.state },
                    },
                  });
                  if (!state) {
                    fail.push({
                      success: false,
                      data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
                      message: "State is not associated with the entered Country",
                    });
                    let failedRecord = {
                      type: 'Procurement',
                      season: season,
                      farmerCode: data.farmerCode ? data.farmerCode : '',
                      farmerName: data.farmerName ? data.farmerName : '',
                      body: { ...data },
                      reason: "State is not associated with the entered Country"
                    }
                    saveFailedRecord(failedRecord)
                  } else {
                    if (data.district) {
                      district = await District.findOne({
                        where: {
                          state_id: state.id,
                          district_name: { [Op.iLike]: data.district },
                        },
                      });

                      if (!district) {
                        fail.push({
                          success: false,
                          data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
                          message: "District is not associated with entered State",
                        });
                        let failedRecord = {
                          type: 'Procurement',
                          season: season,
                          farmerCode: data.farmerCode ? data.farmerCode : '',
                          farmerName: data.farmerName ? data.farmerName : '',
                          body: { ...data },
                          reason: "District is not associated with entered State"
                        }
                        saveFailedRecord(failedRecord)
                      } else {
                        if (data.block) {
                          block = await Block.findOne({
                            where: {
                              district_id: district.id,
                              block_name: { [Op.iLike]: data.block },
                            },
                          });

                          if (!block) {
                            fail.push({
                              success: false,
                              data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
                              message: "Block is not associated with entered District",
                            });
                            let failedRecord = {
                              type: 'Procurement',
                              season: season,
                              farmerCode: data.farmerCode ? data.farmerCode : '',
                              farmerName: data.farmerName ? data.farmerName : '',
                              body: { ...data },
                              reason: "Block is not associated with entered District"
                            }
                            saveFailedRecord(failedRecord)
                          } else {
                            if (data.village) {
                              village = await Village.findOne({
                                where: {
                                  block_id: block.id,
                                  village_name: { [Op.iLike]: data.village },
                                },
                              });

                              if (!village) {
                                fail.push({
                                  success: false,
                                  data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
                                  message: "Village is not associated with entered Taluk/Block",
                                });
                                let failedRecord = {
                                  type: 'Procurement',
                                  season: season,
                                  farmerCode: data.farmerCode ? data.farmerCode : '',
                                  farmerName: data.farmerName ? data.farmerName : '',
                                  body: { ...data },
                                  reason: "Village is not associated with entered Taluk/Block"
                                }
                                saveFailedRecord(failedRecord)
                              } else if (data.ginner) {                
                                
                                let gin = await await GinnerAllocatedVillage.findOne({
                                  attributes: ['ginner_id'],
                                  where:{
                                    village_id: village.id,
                                    season_id: season.id,
                                    '$ginner.name$': data.ginner,
                                    '$ginner.status$': true
                                  },
                                  include: [
                                    { model: Ginner, as: "ginner", attributes: ['id','name'] },
                                  ]
                                })
                                ginner = gin ? gin?.ginner : null;
                                if (!ginner) {
                                  fail.push({
                                    success: false,
                                    data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
                                    message: "No seed cotton village has been allocated to Entered Ginner for entered Season",
                                  });
                                  let failedRecord = {
                                    type: 'Procurement',
                                    season: season,
                                    farmerCode: data.farmerCode ? data.farmerCode : '',
                                    farmerName: data.farmerName ? data.farmerName : '',
                                    body: { ...data },
                                    reason: "No seed cotton village has been allocated to Entered Ginner for entered Season"
                                  }
                                  saveFailedRecord(failedRecord)
                                } else if (data.farmerCode) {
                                farmer = await Farmer.findOne({
                                  where: {
                                    village_id: village.id,
                                    code: data.farmerCode,
                                  },
                                });

                                if (!farmer) {
                                  fail.push({
                                    success: false,
                                    data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
                                    message: "Farmer not found",
                                  });
                                  let failedRecord = {
                                    type: 'Procurement',
                                    season: season,
                                    farmerCode: data.farmerCode ? data.farmerCode : '',
                                    farmerName: data.farmerName ? data.farmerName : '',
                                    body: { ...data },
                                    reason: "Farmer not found"
                                  }
                                  saveFailedRecord(failedRecord)
                                } else if (data.grade) {
                                  grade = await CropGrade.findOne({
                                    where: {
                                      cropGrade: { [Op.iLike]: data.grade },
                                    },
                                  });
                                  if (!grade) {
                                    fail.push({
                                      success: false,
                                      data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
                                      message: "Grade not found",
                                    });
                                    let failedRecord = {
                                      type: 'Procurement',
                                      season: season,
                                      farmerCode: data.farmerCode ? data.farmerCode : '',
                                      farmerName: data.farmerName ? data.farmerName : '',
                                      body: { ...data },
                                      reason: "Grade not found"
                                    }
                                    saveFailedRecord(failedRecord)
                                  } else {
                                    farm = await Farm.findOne({ where: { farmer_id: farmer.id, season_id: season.id } });
                                    if (!farm) {
                                      fail.push({
                                        success: false,
                                        data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
                                        message: "Farm data does not exist",
                                      });
                                      let failedRecord = {
                                        type: 'Procurement',
                                        season: season,
                                        farmerCode: data.farmerCode ? data.farmerCode : '',
                                        farmerName: data.farmerName ? data.farmerName : '',
                                        body: { ...data },
                                        reason: "Farm data does not exist"
                                      }
                                      saveFailedRecord(failedRecord)
                                    } else {
                                      let available_cotton = (Number(farm.total_estimated_cotton) || 0) - (Number(farm.cotton_transacted) || 0);
                                      if (available_cotton < 1) {
                                        fail.push({
                                          success: false,
                                          data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
                                          message: "This season used all the cotton",
                                        });
                                        let failedRecord = {
                                          type: 'Procurement',
                                          season: season,
                                          farmerCode: data.farmerCode ? data.farmerCode : '',
                                          farmerName: data.farmerName ? data.farmerName : '',
                                          body: { ...data },
                                          reason: "This season used all the cotton"
                                        }
                                        saveFailedRecord(failedRecord)
                                        farm = undefined;
                                      } else {
                                        if (Number(data.qtyPurchased) < 0) {
                                          fail.push({
                                            success: false,
                                            data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
                                            message: "QtyPurchased should be greater than 0",
                                          });
                                          let failedRecord = {
                                            type: 'Procurement',
                                            season: season,
                                            farmerCode: data.farmerCode ? data.farmerCode : '',
                                            farmerName: data.farmerName ? data.farmerName : '',
                                            body: { ...data },
                                            reason: "QtyPurchased should be greater than 0"
                                          }
                                          saveFailedRecord(failedRecord)
                                          farm = undefined;
                                        } else {
                                          if (Number(data.rate) < 0) {
                                            fail.push({
                                              success: false,
                                              data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
                                              message: "Rate should be greater than 0",
                                            });
                                            let failedRecord = {
                                              type: 'Procurement',
                                              season: season,
                                              farmerCode: data.farmerCode ? data.farmerCode : '',
                                              farmerName: data.farmerName ? data.farmerName : '',
                                              body: { ...data },
                                              reason: "Rate should be greater than 0"
                                            }
                                            saveFailedRecord(failedRecord);
                                            farm = undefined;
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }

        if (
          block &&
          state &&
          village &&
          farmer &&
          grade &&
          country &&
          district &&
          ginner &&
          season &&
          farm
        ) {
          const transactionExist = await Transaction.findOne({
            where: {
              date: new Date(data.date).toISOString(),
              farmer_id: farmer.id,
              qty_purchased: data.qtyPurchased,
              rate: data.rate,
              vehicle: data.vehicle ? data.vehicle : "",
            }
          });
          if (transactionExist) {
            fail.push({
              success: false,
              data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
              message: "Transaction with same Date, Farmer, Qty. Purchased, Rate and Vehicle is already exist",
            });
            let failedRecord = {
              type: 'Procurement',
              season: season,
              farmerCode: data.farmerCode ? data.farmerCode : '',
              farmerName: data.farmerName ? data.farmerName : '',
              body: { ...data },
              reason: "Transaction with same Date, Farmer, Qty. Purchased, Rate and Vehicle is already exist"
            }
            saveFailedRecord(failedRecord);
          } else {
            let transactionData: any = {
              date: new Date(data.date).toISOString(),
              country_id: country.id,
              state_id: state.id,
              district_id: district.id,
              block_id: block.id,
              village_id: village.id,
              farmer_id: farmer.id,
              farm_id: farm.id,
              farmer_name: farmer.firstName,
              brand_id: farmer.brand_id ? farmer.brand_id : null,
              farmer_code: data.farmerCode,
              season_id: season.id,
              qty_purchased: data.qtyPurchased,
              qty_stock: data.qtyPurchased,
              rate: data.rate,
              grade_id: grade.id,
              program_id: farmer?.program_id,
              total_amount: data.totalAmount,
              mapped_ginner: ginner.id,
              vehicle: data.vehicle ? data.vehicle : "",
              payment_method: data.paymentMethod ? data.paymentMethod : "",
              proof: data.proof ? data.proof : "",
              status: 'Pending',
            };
            let available_cotton = Number(farm.available_cotton) - Number(farm.cotton_transacted);
            transactionData.estimated_cotton = Number(farm.total_estimated_cotton);
            transactionData.available_cotton = available_cotton;
            if (farm.cotton_transacted==0 && farm.available_cotton <= farm.total_estimated_cotton) {
                  transactionData.available_cotton += (0.15 * Number(farm.total_estimated_cotton));
                  // transactionData.qty_stock += 0.15 * Number(transactionData.estimated_cotton);
                }
            if (available_cotton && data.qtyPurchased > available_cotton) {
              transactionData.qty_purchased = available_cotton;
              transactionData.qty_stock = available_cotton;
              transactionData.total_amount = available_cotton * data.rate;
            }
        
            const result = await Transaction.create(transactionData);
            let s = await Farm.update({
              cotton_transacted: (Number(farm.cotton_transacted) || 0) + (Number(transactionData.qty_purchased) || 0)
            }, { where: { id: farm.id } });
            pass.push({
              success: true,
              data: result,
              message: "Transaction created",
            });
          }
        }
      }
    }
    res.sendSuccess(res, { pass, fail });
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message);
  }
};

//Export the export details through excel file
const exportProcurement = async (req: Request, res: Response) => {
  const excelFilePath = path.join("./upload", "procurement.xlsx");

  try {
    const searchTerm = req.query.search || "";
    let whereCondition: any = {};
    const { status, countryId, stateId, brandId, farmGroupId, seasonId, programId, ginnerId, startDate, endDate }: any = req.query;
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
    if (status) {
      whereCondition.status = status;
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
        { total_amount: { [Op.iLike]: `%${searchTerm}%` } },
        { "$block.block_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$country.county_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$state.state_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$village.village_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$district.district_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { farmer_name: { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");

    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.",
      "Date",
      "Season",
      "Farmer Name",
      "Farmer Code",
      "Transaction Id",
      "Quantity Purchased",
      "Price/Kg",
      "Total Amount",
      "Programme",
      "Country",
      "Village",
      "Ginner Name",
    ]);
    headerRow.font = { bold: true };
    const transaction = await Transaction.findAll({
      attributes: [
        [Sequelize.col('date'), 'date'],
        [Sequelize.col('"season"."name"'), 'seasons'],
        [Sequelize.fn("concat", Sequelize.col('"farmer"."firstName"'), Sequelize.col('"farmer"."lastName"')), "farmerName"],
        [Sequelize.col('"farmer"."code"'), 'farmerCode'],
        [Sequelize.col('"transactions"."id"'), 'transactionId'],
        [Sequelize.col('qty_purchased'), 'qtyPurchased'],
        [Sequelize.col('rate'), 'rate'],
        [Sequelize.col('total_amount'), 'totalAmount'],
        [Sequelize.col('"program"."program_name"'), 'programs'],
        [Sequelize.col('"country"."county_name"'), 'villages'],
        [Sequelize.col('"village"."village_name"'), 'countries'],
        [Sequelize.col('"ginner"."name"'), 'ginners'],
      ],
      where: whereCondition,
      include: [
        {
          model: Village,
          as: "village",
          attributes: []
        },
        {
          model: Season,
          as: "season",
          attributes: []
        },
        {
          model: Country,
          as: "country",
          attributes: []
        },
        {
          model: Farmer,
          as: "farmer",
          attributes: []
        },
        {
          model: Program,
          as: "program",
          attributes: []
        },

        {
          model: Ginner,
          as: "ginner",
          attributes: []
        },
      ],
      order: [
        [
          'id', 'desc'
        ]
      ]
    });

    // Append data to worksheet
    for await (const [index, item] of transaction.entries()) {
      const rowValues = Object.values({
        index: index + 1,
        ...item.dataValues
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
      column.width = Math.min(20, maxCellLength + 2); // Limit width to 30 characters
    });

    // Save the workbook
    await workbook.xlsx.writeFile(excelFilePath);
    res.status(200).send({
      success: true,
      messgage: "File successfully Generated",
      data: process.env.BASE_URL + "procurement.xlsx",
    });
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message);
  }
};

//Export the export details through excel file
const exportGinnerProcurement = async (req: Request, res: Response) => {
  const excelFilePath = path.join("./upload", "Ginner_transactions.xlsx");
  const { farmerId, programId, ginnerId, villageId, seasonId }: any = req.query;
  const whereCondition: any = {};
  const searchTerm = req.query.search || "";
  try {
    if (!ginnerId) {
      return res.sendError(res, 'PLEASE_SEND_GINNER_ID')
    }
    if (farmerId) {
      const idArray: number[] = farmerId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.farmer_id = { [Op.in]: idArray };
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
    if (villageId) {
      const idArray: number[] = villageId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.village_id = { [Op.in]: idArray };
    }
    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.season_id = { [Op.in]: idArray };
    }
    if (searchTerm) {
      whereCondition[Op.or] = [
        { farmer_code: { [Op.iLike]: `%${searchTerm}%` } },
        { total_amount: { [Op.iLike]: `%${searchTerm}%` } },
        { "$village.village_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { farmer_name: { [Op.iLike]: `%${searchTerm}%` } },
        { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }

    whereCondition.status = 'Sold';
    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");

    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.",
      "Date",
      "Farmer Code",
      "Farmer Name",
      "Village",
      "Quantity",
      "Programme",
      "Vehicle Information",
    ]);
    headerRow.font = { bold: true };
    const transaction = await Transaction.findAll({
      attributes: [
        [Sequelize.col('date'), 'date'],
        [Sequelize.col('"farmer"."code"'), 'farmerCode'],
        [Sequelize.fn("concat", Sequelize.col('"farmer"."firstName"'), Sequelize.col('"farmer"."lastName"')), "farmerName"],
        [Sequelize.col('"village"."village_name"'), 'villages'],
        [Sequelize.col('qty_purchased'), 'qty_purchased'],
        [Sequelize.col('"program"."program_name"'), 'programs'],
        [Sequelize.col('vehicle'), 'vehicle'],
      ],
      where: whereCondition,
      include: [
        {
          model: Village,
          as: "village",
          attributes: [],
        },
        {
          model: Farmer,
          as: "farmer",
          attributes: [],
        },
        {
          model: Program,
          as: "program",
          attributes: [],
        },
        {
          model: Ginner,
          as: "ginner",
          attributes: [],
        },
        {
          model: Season,
          as: "season",
          attributes: []
        },
      ],
    });

    // Append data to worksheet
    for await (const [index, item] of transaction.entries()) {
      const rowValues = Object.values({
        index: index + 1,
        ...item.dataValues
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
      data: process.env.BASE_URL + "Ginner_transactions.xlsx",
    });
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message);
  }
};

const fetchGinnerByVillage = async (req: Request, res: Response) => {
  let villageId: any = req.query.villageId;
  let seasonId: any = req.query.seasonId;
  let brandId: any = req.query.brandId;
  try {

    if (!villageId) {
      return res.sendError(res, "Need Village Id");
    }
    if (!seasonId) {
      return res.sendError(res, "Need Season Id");
    }

    if (!brandId) {
      return res.sendError(res, "Need Brand Id");
    }

    //fetch ginners
    const allocatedGinner = await GinnerAllocatedVillage.findAll({
      attributes: ['ginner_id'],
      where:{
        village_id: villageId,
        season_id: seasonId,
        brand_id: brandId,
        '$ginner.status$': true
      },
      include: [
        { model: Ginner, as: "ginner", attributes: ['id','name'] },
      ]
    })
    return res.sendSuccess(res, allocatedGinner);
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.meessage);
  }
};

export {
  createTransaction,
  fetchTransactions,
  updateTransaction,
  uploadTransactionBulk,
  deleteTransaction,
  deleteBulkTransactions,
  exportProcurement,
  fetchTransactionById,
  fetchTransactionsBySeasonAndFarmer,
  exportGinnerProcurement,
  allVillageCottonData,
  cottonData,
  fetchGinnerByVillage
};
