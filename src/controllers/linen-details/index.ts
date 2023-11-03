import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import LinenDetails from "../../models/linen-details.model";
import Season from "../../models/season.model";
import Linen from "../../models/linen.model";
import Cooperative from "../../models/cooperative.model";
import * as ExcelJS from "exceljs";
import * as path from "path";

const createLinenDetails = async (req: Request, res: Response) => {
  try {
    //create bulk linen from bulk upload
    let fail = [];
    let pass = [];
    for await (const data of req.body.linen) {
      if (!data.season) {
        fail.push({
          success: false,
          data: {
            farmerName: data.farmerName ? data.farmerName : "",
            farmerNo: data.farmerNo ? data.farmerNo : "",
          },
          message: "Harvest cannot be empty",
        });
      } else if (!data.country) {
        fail.push({
          success: false,
          data: {
            farmerName: data.farmerName ? data.farmerName : "",
            farmerNo: data.farmerNo ? data.farmerNo : "",
          },
          message: "Country cannot be empty",
        });
      } else if (!data.town) {
        fail.push({
          success: false,
          data: {
            farmerName: data.farmerName ? data.farmerName : "",
            farmerNo: data.farmerNo ? data.farmerNo : "",
          },
          message: "Town cannot be empty",
        });
      } else if (!data.farmerName) {
        fail.push({
          success: false,
          data: {
            farmerName: data.farmerName ? data.farmerName : "",
            farmerNo: data.farmerNo ? data.farmerNo : "",
          },
          message: "Farmer Name cannot be empty",
        });
      } else if (!data.farmerNo) {
        fail.push({
          success: false,
          data: {
            farmerName: data.farmerName ? data.farmerName : "",
            farmerNo: data.farmerNo ? data.farmerNo : "",
          },
          message: "Farmer No cannot be empty",
        });
      } else if (!data.farmerDepartment) {
        fail.push({
          success: false,
          data: {
            farmerName: data.farmerName ? data.farmerName : "",
            farmerNo: data.farmerNo ? data.farmerNo : "",
          },
          message: "Farmer Department cannot be empty",
        });
      } else if (!data.area) {
        fail.push({
          success: false,
          data: {
            farmerName: data.farmerName ? data.farmerName : "",
            farmerNo: data.farmerNo ? data.farmerNo : "",
          },
          message: "Area cannot be empty",
        });
      } else if (!data.linenVariety) {
        fail.push({
          success: false,
          data: {
            farmerName: data.farmerName ? data.farmerName : "",
            farmerNo: data.farmerNo ? data.farmerNo : "",
          },
          message: "Linen Variety cannot be empty",
        });
      } else if (!data.cooperativeName) {
        fail.push({
          success: false,
          data: {
            farmerName: data.farmerName ? data.farmerName : "",
            farmerNo: data.farmerNo ? data.farmerNo : "",
          },
          message: "Cooperative cannot be empty",
        });
      }
      else if (!data.noOfBales) {
        fail.push({
          success: false,
          data: {
            farmerName: data.farmerName ? data.farmerName : "",
            farmerNo: data.farmerNo ? data.farmerNo : "",
          },
          message: "No of Bales cannot be empty",
        });
      } else if (!data.farmLotNo) {
        fail.push({
          success: false,
          data: {
            farmerName: data.farmerName ? data.farmerName : "",
            farmerNo: data.farmerNo ? data.farmerNo : "",
          },
          message: "Farm Lot No cannot be empty",
        });
      } else if (!data.totalWeight) {
        fail.push({
          success: false,
          data: {
            farmerName: data.farmerName ? data.farmerName : "",
            farmerNo: data.farmerNo ? data.farmerNo : "",
          },
          message: "Total Weight cannot be empty",
        });
      } else if (!data.scutchDate) {
        fail.push({
          success: false,
          data: {
            farmerName: data.farmerName ? data.farmerName : "",
            farmerNo: data.farmerNo ? data.farmerNo : "",
          },
          message: "Date of scutching cannot be empty",
        });
      } else if (!data.scutchingLotNo) {
        fail.push({
          success: false,
          data: {
            farmerName: data.farmerName ? data.farmerName : "",
            farmerNo: data.farmerNo ? data.farmerNo : "",
          },
          message: "Scutching Lot No cannot be empty",
        });
      } else if (!data.balesAfterScutching) {
        fail.push({
          success: false,
          data: {
            farmerName: data.farmerName ? data.farmerName : "",
            farmerNo: data.farmerNo ? data.farmerNo : "",
          },
          message: "Bales After Scutching cannot be empty",
        });
      } else if (!data.weightAfterScutching) {
        fail.push({
          success: false,
          data: {
            farmerName: data.farmerName ? data.farmerName : "",
            farmerNo: data.farmerNo ? data.farmerNo : "",
          },
          message: "Weight After Scutching cannot be empty",
        });
      } else if (!data.shipmentDate) {
        fail.push({
          success: false,
          data: {
            farmerName: data.farmerName ? data.farmerName : "",
            farmerNo: data.farmerNo ? data.farmerNo : "",
          },
          message: "Shipment Date cannot be empty",
        });
      } else if (!data.shipmentDetails) {
        fail.push({
          success: false,
          data: {
            farmerName: data.farmerName ? data.farmerName : "",
            farmerNo: data.farmerNo ? data.farmerNo : "",
          },
          message: "Shipment Details cannot be empty",
        });
      } else if (!data.shipedTo) {
        fail.push({
          success: false,
          data: {
            farmerName: data.farmerName ? data.farmerName : "",
            farmerNo: data.farmerNo ? data.farmerNo : "",
          },
          message: "Shiped To cannot be empty",
        });
      } else {
        let season;
        let linenVariety;
        let cooperative;

        if (data.season) {
          season = await Season.findOne({
            where: {
              name: { [Op.iLike]: data.season },
            },
          });
          if (!season) {
            fail.push({
              success: false,
              data: {
                farmerName: data.farmerName ? data.farmerName : "",
                farmerCode: data.farmerCode ? data.farmerCode : "",
              },
              message: "Season not found",
            });
          } else {
            if (data.linenVariety) {
              linenVariety = await Linen.findOne({
                where: {
                  name: { [Op.iLike]: data.linenVariety },
                },
              });
              if (!linenVariety) {
                fail.push({
                  success: false,
                  data: {
                    farmerName: data.farmerName ? data.farmerName : "",
                    farmerCode: data.farmerCode ? data.farmerCode : "",
                  },
                  message: "Linen Variety not found",
                });
              } else {
                if (data.cooperativeName) {
                  cooperative = await Cooperative.findOne({
                    where: {
                      name: { [Op.iLike]: data.cooperativeName },
                    },
                  });
                  if (!cooperative) {
                    fail.push({
                      success: false,
                      data: {
                        farmerName: data.farmerName ? data.farmerName : "",
                        farmerCode: data.farmerCode ? data.farmerCode : "",
                      },
                      message: "Cooperative Name not found",
                    });
                  }
                }
              }
            }
          }
        }

        if (season && linenVariety && cooperative) {
          const bulkData = {
            harvest: data?.season,
            season_id: season?.id,
            farmer_no: data?.farmerNo,
            farmer_name: data?.farmerName,
            country: data?.country,
            town: data?.town,
            department: data?.farmerDepartment,
            area: data?.area,
            linen_variety: data?.linenVariety,
            cooperative_name: data?.cooperativeName,
            no_of_bales: data?.noOfBales,
            farm_lot_no: data?.farmLotNo,
            total_weight: data?.totalWeight,
            scutch_date: data?.scutchDate ? new Date(data?.scutchDate).toISOString() : new Date().toISOString(),
            scutching_lot_no: data?.scutchingLotNo,
            bales_after_scutching: data?.balesAfterScutching,
            weight_after_scutching: data?.weightAfterScutching,
            shipment_date: data?.shipmentDate ? new Date(data?.shipmentDate).toISOString() : new Date().toISOString(),
            shipment_details: data?.shipmentDetails,
            shiped_to: data?.shipedTo,
            qty_stock: data?.totalWeight,
            program_id: data?.program || null,
            status: true,
          };

          const linen = await LinenDetails.create(bulkData);
          pass.push({
            success: true,
            data: linen,
            message: "Linen created",
          });
        }
      }
    }
    res.sendSuccess(res, { pass, fail });
  } catch (error) {
    console.log(error);
    return res.sendError(res, "ERR_LINEN_CREATE");
  }
};

const fetchlinenDetails = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const sortOrder = req.query.sort || 'desc';
  //   const sortField = req.query.sortBy || '';
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};
  const { seasonId, cooperatives, country, linenVariety }: any = req.query;

  try {
    // apply filters
    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.season_id = { [Op.in]: idArray };
    }
    if (country) {
      const idArray: string[] = country
        .split(",")
        .map((id: any) => id.toString());
      whereCondition.country = { [Op.in]: idArray };
    }
    if (cooperatives) {
      const idArray: string[] = cooperatives
        .split(",")
        .map((id: any) => id.toString());
      whereCondition.cooperative_name = { [Op.in]: idArray };
    }
    if (linenVariety) {
      const idArray: string[] = linenVariety
        .split(",")
        .map((id: any) => id.toString());
      whereCondition.linen_variety = { [Op.in]: idArray };;
    }

    // apply search
    if (searchTerm) {
      whereCondition[Op.or] = [
        { department: { [Op.iLike]: `%${searchTerm}%` } },
        { cooperative_name: { [Op.iLike]: `%${searchTerm}%` } },
        { harvest: { [Op.iLike]: `%${searchTerm}%` } },
        { town: { [Op.iLike]: `%${searchTerm}%` } },
        { country: { [Op.iLike]: `%${searchTerm}%` } },
        { linen_variety: { [Op.iLike]: `%${searchTerm}%` } },
        { farmer_name: { [Op.iLike]: `%${searchTerm}%` } },
        { farmer_no: { [Op.iLike]: `%${searchTerm}%` } },
        { farm_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { shipment_details: { [Op.iLike]: `%${searchTerm}%` } },
        // { weight_after_scutching: { [Op.iLike]: `%${searchTerm}%` } },
        { scutching_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { shiped_to: { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }

    let queryOptions: any = {
      where: whereCondition,
    };

    if (sortOrder === 'asc' || sortOrder === 'desc') {
      queryOptions.order = [['id', 'DESC']];
    }

    // apply pagination
    if (req.query.pagination === "true") {
      queryOptions.offset = offset;
      queryOptions.limit = limit;

      const { count, rows } = await LinenDetails.findAndCountAll(queryOptions);
      return res.sendPaginationSuccess(res, rows, count);
    } else {
      // fetch without filters
      const linen = await LinenDetails.findAll(queryOptions);
      return res.sendSuccess(res, linen);
    }
  } catch (error) {
    return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
  }
};

//get total linen weight merged
const fetchSumOfWeightBylinen = async (req: Request, res: Response) => {
  try {
    const sumOfWeight = await LinenDetails.findAll({
      attributes: [
        [Sequelize.fn("sum", Sequelize.cast(Sequelize.col("total_weight"), "decimal")), "total_weight"],
      ],
    });

    return res.sendSuccess(res, sumOfWeight);
  } catch (error) {
    console.log(error);
    return res.sendError(res, "NOT_ABLE_TO_FETCH_SUM_BY_PROGRAM");
  }
};

const exportLinenTransactions = async (req: Request, res: Response) => {
  const excelFilePath = path.join("./upload", "procurement.xlsx");
  const whereCondition: any = {};
  const { seasonId, cooperatives, country, linenVariety }: any = req.query;
  const searchTerm = req.query.search || "";
  try {
    if (seasonId) {
      const idArray: number[] = seasonId
        .split(",")
        .map((id: any) => parseInt(id, 10));
      whereCondition.season_id = { [Op.in]: idArray };
    }
    if (country) {
      const idArray: string[] = country
        .split(",")
        .map((id: any) => id.toString());
      whereCondition.country = { [Op.in]: idArray };
    }
    if (cooperatives) {
      const idArray: string[] = cooperatives
        .split(",")
        .map((id: any) => id.toString());
      whereCondition.cooperative_name = { [Op.in]: idArray };
    }
    if (linenVariety) {
      const idArray: string[] = linenVariety
        .split(",")
        .map((id: any) => id.toString());
      whereCondition.linen_variety = { [Op.in]: idArray };;
    }

    // apply search
    if (searchTerm) {
      whereCondition[Op.or] = [
        { department: { [Op.iLike]: `%${searchTerm}%` } },
        { cooperative_name: { [Op.iLike]: `%${searchTerm}%` } },
        { harvest: { [Op.iLike]: `%${searchTerm}%` } },
        { town: { [Op.iLike]: `%${searchTerm}%` } },
        { country: { [Op.iLike]: `%${searchTerm}%` } },
        { linen_variety: { [Op.iLike]: `%${searchTerm}%` } },
        { farmer_name: { [Op.iLike]: `%${searchTerm}%` } },
        { farmer_no: { [Op.iLike]: `%${searchTerm}%` } },
        { farm_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { shipment_details: { [Op.iLike]: `%${searchTerm}%` } },
        // { weight_after_scutching: { [Op.iLike]: `%${searchTerm}%` } },
        { scutching_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
        { shiped_to: { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }
    // Create the excel workbook file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");

    // Set bold font for header row
    const headerRow = worksheet.addRow([
      "Sr No.",
      "Harvest",
      "Farmer No",
      "Farmer Name",
      "Country",
      "Town",
      "Farmer Department",
      "Area",
      "Linen Variety",
      "Name of Cooperative",
      "Number of raw bale",
      "Farm Lot Number",
      "Total weight (raw)",
      "Date of scutching",
      "Scutching Lot No",
      "No of bales (After scutching)",
      "Total Weight(After Scutching)",
      "Date of Shipment",
      "Shipment Details",
      "Shiped To",
      "Status",
    ]);
    headerRow.font = { bold: true };
    const linen = await LinenDetails.findAll({
      where: whereCondition
    });

    // Append data to worksheet
    for await (const [index, item] of linen.entries()) {
      const rowValues = Object.values({
        index: index + 1,
        harvest: item.harvest,
        farmerNo: item.farmer_no,
        farmerName: item.farmer_name,
        country: item.country,
        town: item.town,
        department: item.department,
        area: item.area,
        linenVariety: item.linen_variety,
        cooperativeName: item.cooperative_name,
        noOfBales: item.no_of_bales,
        farmLotNo: item.farm_lot_no,
        totalWeight: item.total_weight,
        scutchDate: item.scutch_date.toISOString().substring(0, 10),
        scutchingLotNo: item.scutching_lot_no,
        balesAfterScutching: item?.bales_after_scutching,
        weightAfterScutching: item.weight_after_scutching,
        shipmentDate: item.shipment_date.toISOString().substring(0, 10),
        shipmentDetails: item.shipment_details,
        shipedTo: item.shiped_to,
        status: item.status
      });
      worksheet.addRow(rowValues);
    }
    //Auto-adjust column widths based on content
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
      data: process.env.BASE_URL + "procurement.xlsx",
    });
  } catch (error) {
    console.error("Error appending data:", error);
  }
};

export {
  createLinenDetails,
  fetchlinenDetails,
  fetchSumOfWeightBylinen,
  exportLinenTransactions
  // updateLinen,
  // updateLinenStatus,
  // deleteLinen
};
