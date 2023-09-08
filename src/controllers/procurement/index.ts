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

const createTransaction = async (req: Request, res: Response) => {
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
      status: "Pending",
    };

    if (req.body.districtId) {
      const district = await District.findByPk(req.body.districtId, {
        include: [
          {
            model: State,
            as: "state",
            include: [{ model: Country, as: "country" }],
          },
        ],
      });

      data.state_id = district.state_id;
      data.country_id = district.state.country_id;
    }

    const transaction = await Transaction.create(data);
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

  const countryId: string = req.query.countryId as string;
  const brandId: string = req.query.brandId as string;
  const farmGroupId: string = req.query.farmGroupId as string;
  const seasonId: string = req.query.seasonId as string;
  const programId: string = req.query.programId as string;
  const ginnerId: string = req.query.ginnerId as string;

  const whereCondition: any = {};

  try {
    // apply filters
    if (countryId) {
      const idArray: number[] = countryId
        .split(",")
        .map((id) => parseInt(id, 10));
      whereCondition.country_id = { [Op.in]: idArray };
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
        // { "$farmer.firstName$": { [Op.iLike]: `%${searchTerm}%` } },
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
      where: {id: req.params.id},
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
    };

    if (req.body.districtId) {
      const district = await District.findByPk(req.body.districtId, {
        include: [
          {
            model: State,
            as: "state",
            include: [{ model: Country, as: "country" }],
          },
        ],
      });

      data.state_id = district.state_id;
      data.country_id = district.state.country_id;
    }

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

const deleteTransaction = async (req: Request, res: Response) => {
  try {
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

    const transaction = await Transaction.destroy({
      where: {
        id: {
          [Op.between]: [fromId, toId],
        },
      },
    });
    res.sendSuccess(res,  transaction );
  } catch (error) {
    return res.sendError(res, "NOT_ABLE_TO_DELETE");
  }
}

const fetchAvailableCotton = async (req: Request, res: Response) => {
  try {

  } catch (error) {
    console.log(error);
    return res.sendError(res, "NOT_ABLE_TO_FETCH");
  }
};

const uploadTransactionBulk = async (req: Request, res: Response) => {
  try {
    let fail = [];
    let pass = [];
    for await (const data of req.body.transaction) {
      
      if (!data.season) {
        fail.push({
          success: false,
          data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : ''},
          message: "Season cannot be empty",
        });
      } else if (!data.date) {
        fail.push({
          success: false,
          data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : ''},
          message: "Date cannot be empty",
        });
      } else if (!data.country) {
        fail.push({
          success: false,
          data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : ''},
          message: "Country cannot be empty",
        });
      } else if (!data.state) {
        fail.push({
          success: false,
          data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : ''},
          message: "state cannot be empty",
        });
      }
      else if (!data.district) {
        fail.push({
          success: false,
          data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : ''},
          message: "district cannot be empty",
        });
      }
      else if (!data.block) {
        fail.push({
          success: false,
          data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : ''},
          message: "block cannot be empty",
        });
      }else if (!data.village) {
        fail.push({
          success: false,
          data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : ''},
          message: "village cannot be empty",
        });
      }  else if (!data.farmerName) {
        fail.push({
          success: false,
          data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : ''},
          message: "Farmer Name cannot be empty",
        });
      }  else if (!data.rate) {
        fail.push({
          success: false,
          data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : ''},
          message: "rate cannot be empty",
        });
      } else if (!data.qtyPurchased) {
        fail.push({
          success: false,
          data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : ''},
          message: "Qty Purchased cannot be empty",
        });
      } else if (!data.grade) {
        fail.push({
          success: false,
          data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : ''},
          message: "grade cannot be empty",
        });
      } else if (!data.ginner) {
        fail.push({
          success: false,
          data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : ''},
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
        let district;
        let farmer;
        let village;

        if (data.season) {
          season = await Season.findOne({
            where: {
              name: data.season,
            },
          });
          if (!season) {
            fail.push({
              success: false,
              data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : ''},
              message: "Season not found",
            });
          }
        }
        if (data.ginner) {
          ginner = await Ginner.findOne({
            where: {
              name: data.ginner,
            },
          });
          if (!ginner) {
            fail.push({
              success: false,
              data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : ''},
              message: "Ginner not found",
            });
          }
        }
        if (data.country) {
          country = await Country.findOne({
            where: {
              county_name: data.country,
            },
          });

          if (!country) {
            fail.push({
              success: false,
              data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : ''},
              message: "Country not found",
            });
          }
        }
        if (data.state) {
          state = await State.findOne({
            where: {
              state_name: data.state,
            },
          });

          if (!state) {
            fail.push({
              success: false,
              data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : ''},
              message: "State not found",
            });
          }
        }
        if (data.district) {
          district = await District.findOne({
            where: {
              district_name: data.district,
            },
          });

          if (!district) {
            fail.push({
              success: false,
              data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : ''},
              message: "District not found",
            });
          }
        }

        if (data.block) {
          block = await Block.findOne({
            where: {
              block_name: data.block,
            },
          });

          if (!block) {
            fail.push({
              success: false,
              data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : ''},
              message: "Block not found",
            });
          }
        }

        if (data.village) {
          village = await Village.findOne({
            where: {
              village_name: data.village,
            },
          });

          if (!village) {
            fail.push({
              success: false,
              data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : ''},
              message: "Village not found",
            });
          }
        }

        if (data.farmerName) {
          farmer = await Farmer.findOne({
            where: {
              firstName: data.farmerName,
            },
          });

          if (!farmer) {
            fail.push({
              success: false,
              data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : ''},
              message: "farmer not found",
            });
          }
        }

        if (data.grade) {
          grade = await CropGrade.findOne({
            where: {
              cropGrade: data.grade,
            },
          });

          if (!grade) {
            fail.push({
              success: false,
              data: { farmerName: data.farmerName ? data.farmerName : '', farmerCode: data.farmerCode ? data.farmerCode : ''},
              message: "grade not found",
            });
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
          season
        ) {
          const transactionData = {
            date: new Date(data.date).toISOString(),
            country_id: country.id,
            state_id: state.id,
            district_id: district.id,
            block_id: block.id,
            village_id: village.id,
            farmer_id: farmer.id,
            farmer_name: farmer.firstName,
            brand_id: farmer.brand_id ? farmer.brand_id : null,
            farmer_code: data.farmerCode,
            season_id: season.id,
            qty_purchased: data.qtyPurchased,
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
          const result = await Transaction.create(transactionData);
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
    console.log(error);
    return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
  }
};

//Export the Farmer details through excel file
const exportProcurement = async (req: Request, res: Response) => {
  const excelFilePath = path.join("./upload", "procurement.xlsx");

  try {
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
      where: {},
      include: [
        {
          model: Village,
          as: "village",
        },
        {
          model: Season,
          as: "season",
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
      ],
    });

    // Append data to worksheet
    for await (const [index, item] of transaction.entries()) {
      const rowValues = Object.values({
        index: index + 1,
        date: item.date.toISOString().substring(0, 10),
        season: item.season.name,
        farmerName: item.farmer_name,
        farmerCode: item.farmer_code,
        transactionId: item.id,
        qtyPurchased: item.qty_purchased,
        rate: item.rate,
        totalAmount: item.total_amount,
        program: item.program.program_name,
        country: item.country.county_name,
        village: item.village.village_name,
        ginner: item?.ginner?.name
      });
      worksheet.addRow(rowValues);
    }
    // Auto-adjust column widths based on content
    // worksheet.columns.forEach((column: any) => {
    //     let maxCellLength = 0;
    //     column.eachCell({ includeEmpty: true }, (cell: any) => {
    //         const cellLength = (cell.value ? cell.value.toString() : '').length;
    //         maxCellLength = Math.max(maxCellLength, cellLength);
    //     });
    //     column.width = Math.min(30, maxCellLength + 2); // Limit width to 30 characters
    // });

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

export {
  createTransaction,
  fetchTransactions,
  updateTransaction,
  uploadTransactionBulk,
  deleteTransaction,
  deleteBulkTransactions,
  exportProcurement,
  fetchTransactionById
};
