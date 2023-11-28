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
      data.estimated_cotton = farm.total_estimated_cotton;
      data.available_cotton = farm.total_estimated_cotton - (farm.cotton_transacted || 0);
    }

    const transaction = await Transaction.create(data);
    let s = await Farm.update({
      cotton_transacted: (farm.cotton_transacted || 0) + Number(req.body.qtyPurchased)
    }, { where: { id: req.body.farmId } });
    res.sendSuccess(res, transaction);
  } catch (error) {
    console.log(error);
    return res.sendError(res, "NOT_ABLE_TO_CREATE");
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
        { farmer_code: { [Op.iLike]: `%${searchTerm}%` } },
        { total_amount: { [Op.iLike]: `%${searchTerm}%` } },
        { "$block.block_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$country.county_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$state.state_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$village.village_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$district.district_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { "$brand.brand_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { farmer_name: { [Op.iLike]: `%${searchTerm}%` } },
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
  } catch (error) {
    console.log(error);
    return res.sendError(res, "NOT_ABLE_TO_FETCH");
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
        },
        {
          model: Block,
          as: "block",
        },
        {
          model: District,
          as: "district",
        },
        {
          model: State,
          as: "state",
        },
        {
          model: Country,
          as: "country",
        },
        {
          model: Farmer,
          as: "farmer",
          include: [
            {
              model: FarmGroup,
              as: "farmGroup",
            }
          ]
        },
        {
          model: Program,
          as: "program",
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
        },
        {
          model: Season,
          as: "season",
        },
        {
          model: Farm,
          as: "farm",
        },
      ],
    };

    const data = await Transaction.findOne(queryOptions);
    const farm = await Farm.findOne({
      where: { farmer_id: data.farmer_id },
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

    const transaction: any = {
      ...data.dataValues,
      farm
    }
    return res.sendSuccess(res, transaction);
  } catch (error) {
    console.log(error);
    return res.sendError(res, "NOT_ABLE_TO_FETCH");
  }
};

const updateTransaction = async (req: Request, res: Response) => {
  try {
    const data: any = {
      date: req.body.date,
      district_id: req.body.districtId,
      block_id: req.body.blockId,
      village_id: req.body.villageId,
      farmer_id: req.body.farmerId,
      farmer_name: req.body.farmerName,
      brand_id: req.body.brandId,
      farmer_code: req.body.farmerCode,
      season_id: req.body.season,
      qty_purchased: req.body.qtyPurchased,
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

    const transaction = await Transaction.update(data, {
      where: {
        id: req.body.id,
      },
    });
    res.sendSuccess(res, transaction);
  } catch (error) {
    console.log(error);
    return res.sendError(res, "NOT_ABLE_TO_UPDATE");
  }
};

const allVillageCottonData = async (req: Request, res: Response) => {
  try {
    let userCondition = ''; // Define your user condition here
    if (req.query.brandId) {
      userCondition += `farmer.brand_id='${req.query.brandId}' AND `;
    }

    if (req.query.search) {
      userCondition += `vg.village_name ILIKE '%${req.query.search}%' AND `;
    }

    // Remove the trailing 'AND' if it exists
    if (userCondition.endsWith(' AND ')) {
      userCondition = userCondition.slice(0, -5);
    }
    const result = await sequelize.query(`
    SELECT 
      farmer.village_id, 
        vg.village_name, 
        ROUND(SUM(fr.total_estimated_cotton)) AS estimated_qty, 
        ROUND(SUM(fr.cotton_transacted)) AS sold_qty, 
        (ROUND(SUM(fr.total_estimated_cotton)) - ROUND(SUM(fr.cotton_transacted))) AS available_qty 
    FROM ${Farm.getTableName()} fr 
    JOIN ${Farmer.getTableName()} farmer ON fr.farmer_id = farmer.id 
    JOIN ${Village.getTableName()} vg ON farmer.village_id = vg.id
    ${userCondition ? `WHERE ${userCondition}` : ''} 
    GROUP BY farmer.village_id, vg.village_name
`, {
      type: sequelize.QueryTypes.SELECT
    });

    res.sendSuccess(res, result)

  } catch (error: any) {
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
        cotton_transacted: (Number(farm.cotton_transacted) || 0) + (Number(trans.dataValues.qty_purchased) || 0)
      }, { where: { id: trans.dataValues.farm_id } });
    }

    const transaction = await Transaction.destroy({
      where: {
        id: req.body.id,
      },
    });

    res.sendSuccess(res, { transaction });
  } catch (error) {
    return res.sendError(res, "NOT_ABLE_TO_DELETE");
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
            let s = await Farm.update({
              cotton_transacted: (Number(farm.cotton_transacted) || 0) + (Number(trans.dataValues.qty_purchased) || 0)
            }, { where: { id: trans.dataValues.farm_id } });
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
  } catch (error) {
    return res.sendError(res, "NOT_ABLE_TO_DELETE");
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
      } else if (!data.date) {
        fail.push({
          success: false,
          data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
          message: "Date cannot be empty",
        });
      } else if (!data.country) {
        fail.push({
          success: false,
          data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
          message: "Country cannot be empty",
        });
      } else if (!data.state) {
        fail.push({
          success: false,
          data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
          message: "state cannot be empty",
        });
      }
      else if (!data.district) {
        fail.push({
          success: false,
          data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
          message: "district cannot be empty",
        });
      }
      else if (!data.block) {
        fail.push({
          success: false,
          data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
          message: "block cannot be empty",
        });
      } else if (!data.village) {
        fail.push({
          success: false,
          data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
          message: "village cannot be empty",
        });
      } else if (!data.farmerName) {
        fail.push({
          success: false,
          data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
          message: "Farmer Name cannot be empty",
        });
      } else if (!data.rate) {
        fail.push({
          success: false,
          data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
          message: "rate cannot be empty",
        });
      } else if (!data.qtyPurchased) {
        fail.push({
          success: false,
          data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
          message: "Qty Purchased cannot be empty",
        });
      } else if (!data.grade) {
        fail.push({
          success: false,
          data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
          message: "grade cannot be empty",
        });
      } else if (!data.ginner) {
        fail.push({
          success: false,
          data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
          message: "Ginner cannot be empty",
        });
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
          } else if (data.ginner) {
            ginner = await Ginner.findOne({
              where: {
                name: data.ginner,
              },
            });
            if (!ginner) {
              fail.push({
                success: false,
                data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
                message: "Ginner not found",
              });
            } else if (data.country) {
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
                      message: "State not found",
                    });
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
                          message: "District not found",
                        });
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
                              message: "Block not found",
                            });
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
                                  message: "Village not found",
                                });
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
                                    message: "farmer not found",
                                  });
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
                                      message: "grade not found",
                                    });
                                  } else {
                                    farm = await Farm.findOne({ where: { farmer_id: farmer.id, season_id: season.id } });
                                    if (!farm) {
                                      fail.push({
                                        success: false,
                                        data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
                                        message: "Farm data does not exist",
                                      });
                                    } else {
                                      let available_cotton = (Number(farm.total_estimated_cotton) || 0) - (Number(farm.cotton_transacted) || 0);
                                      if (available_cotton < 1) {
                                        fail.push({
                                          success: false,
                                          data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
                                          message: "This season used all the cotton",
                                        });
                                        farm = undefined;
                                      } else {
                                        if (Number(data.qtyPurchased) < 0) {
                                          fail.push({
                                            success: false,
                                            data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
                                            message: "QtyPurchased should be greater than 0",
                                          });
                                          farm = undefined;
                                        } else {
                                          if (Number(data.rate) < 0) {
                                            fail.push({
                                              success: false,
                                              data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : '' },
                                              message: "Rate should be greater than 0",
                                            });
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
          let available_cotton = Number(farm.total_estimated_cotton) - Number(farm.cotton_transacted);
          transactionData.estimated_cotton = Number(farm.total_estimated_cotton);
          transactionData.available_cotton = available_cotton;
          if (data.qtyPurchased > available_cotton) {
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
    res.sendSuccess(res, { pass, fail });
  } catch (error) {
    return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
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
      "Program",
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
  } catch (error) {
    console.error("Error appending data:", error);
  }
};

//Export the export details through excel file
const exportGinnerProcurement = async (req: Request, res: Response) => {
  const excelFilePath = path.join("./upload", "Ginner_transactions.xlsx");
  const { farmerId, programId, ginnerId, villageId }: any = req.query;
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
      "Program",
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
        }
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
  } catch (error) {
    console.error("Error appending data:", error);
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
  exportGinnerProcurement,
  allVillageCottonData,
  cottonData
};
