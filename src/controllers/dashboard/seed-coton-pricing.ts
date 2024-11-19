import { Request, Response } from "express";
import moment from 'moment';
import { Op, QueryTypes, Sequelize } from "sequelize";
import * as yup from 'yup';
import sequelize from "../../util/dbConn";
import Season from "../../models/season.model";
import Transaction from "../../models/transaction.model";
import GinProcess from "../../models/gin-process.model";
import Ginner from "../../models/ginner.model";
import GinBale from "../../models/gin-bale.model";
import Country from "../../models/country.model";
import SeedCottonPricing from "../../models/seed-cotton-pricings.model";
import Program from "../../models/program.model";

// const getWeekDateRange = (weekRange: string, seasonStartDate: Date) => {
//   const startDate = new Date(seasonStartDate);

//   const [weekStart, weekEnd] = weekRange.split("-").map((item) => parseInt(item));

//   if (isNaN(weekStart) || isNaN(weekEnd) || weekStart > weekEnd) {
//     throw new Error("Invalid week range format.");
//   }

//   const startDayOfWeek = weekStart - 1;
//   const endDayOfWeek = weekEnd - 1;

//   const weekStartDate = new Date(startDate.getTime() + startDayOfWeek * 24 * 60 * 60 * 1000);
//   const weekEndDate = new Date(startDate.getTime() + (endDayOfWeek + 1) * 24 * 60 * 60 * 1000);

//   return { startDate: weekStartDate, endDate: weekEndDate };
// };

const getPricyByCountry = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { countryId, stateId, districtId, brandId, from, to }: any = req.query;
    const offset = (page - 1) * limit;

    let whereConditions: string[] = [];
    let replacements: any = { limit, offset };

    if (brandId) {
      const idArray = brandId.split(",").map((id: any) => parseInt(id, 10));
      whereConditions.push('"brand_id" IN (:brandId)');
      replacements.brandId = idArray;
    }

    if (countryId) {
      const idArray = countryId.split(",").map((id: any) => parseInt(id, 10));
      whereConditions.push('"country_id" IN (:countryId)');
      replacements.countryId = idArray;
    }

    if (stateId) {
      const idArray = stateId.split(",").map((id: any) => parseInt(id, 10));
      whereConditions.push('"state_id" IN (:stateId)');
      replacements.stateId = idArray;
    }

    if (districtId) {
      const idArray = districtId.split(",").map((id: any) => parseInt(id, 10));
      whereConditions.push('"district_id" IN (:districtId)');
      replacements.districtId = idArray;
    }

    replacements.from = from;
    replacements.to = to;

    let query = `
      SELECT * FROM "seed-cotton-pricings"
      ${whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') + ' AND ' : 'WHERE '} 
      "startDate" >= :from AND "endDate" <= :to
      ORDER BY "id" DESC
      LIMIT :limit OFFSET :offset;
    `;

    console.log('Query:', query);
    const rows = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    console.log('Fetched rows:', rows);
    const count = rows.length;

    if (count === 0) {
      return res.sendPaginationSuccess(res, { country: [], reel: [], organic: [], conventional: [] }, count);
    }

    const responseData: any = {
      country: [],
      reel: [],
      organic: [],
      conventional: []
    };

    await Promise.all(rows.map(async (row: any) => {
      const { startDate, endDate, country_id, market_price } = row;

      const avgQuery = `
        SELECT 
          AVG(CASE WHEN "program_id" = 4 THEN CAST("rate" AS FLOAT) END) AS "organic_average_price",
          AVG(CASE WHEN "program_id" = 5 THEN CAST("rate" AS FLOAT) END) AS "reel_average_price"
        FROM "transactions"
        WHERE "date" >= :startDate AND "date" <= :endDate
        AND "brand_id" IN (:brandId);
      `;

      const [avgResult] = await sequelize.query(avgQuery, {
        replacements: { startDate, endDate, ...replacements },
        type: sequelize.QueryTypes.SELECT,
      });

      const countryName = await getCountryNameById(country_id);

      if (countryName) {
        responseData.country.push(countryName);
        responseData.reel.push(avgResult.reel_average_price || 0);
        responseData.organic.push(avgResult.organic_average_price || 0);
        responseData.conventional.push(Number(market_price) || 0);
      }
    }));

    return res.sendPaginationSuccess(res, responseData, count);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

async function getCountryNameById(country_id: number): Promise<string> {
  const query = `
    SELECT "county_name" FROM "countries" WHERE "id" = :country_id;
  `;
  const [country] = await sequelize.query(query, {
    replacements: { country_id },
    type: sequelize.QueryTypes.SELECT,
  });
  return country ? country.county_name : '';  // Use 'county_name' instead of 'name'
}

const getStatesByCountryAndStateId = async (stateIds: number[], countryIds: number[]) => {
  try {
    // Query to fetch state names based on state_id and country_id
    const query = `
      SELECT "state_id", "state_name"
      FROM "states"
      WHERE "state_id" IN (:stateIds) AND "country_id" IN (:countryIds)
    `;

    const result = await sequelize.query(query, {
      replacements: { stateIds, countryIds },
      type: sequelize.QueryTypes.SELECT
    });

    // Create a map of state_id to state_name for quick lookup
    const stateMap = new Map();
    result.forEach((state: any) => {
      stateMap.set(state.state_id, state.state_name);
    });

    return stateMap;
  } catch (error: any) {
    console.error('Error fetching states:', error);
    throw new Error('Error fetching states');
  }
};

const getPricyByStates = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { countryId, stateId, districtId, brandId, from, to }: any = req.query;
    const offset = (page - 1) * limit;

    let whereConditions: string[] = [];
    let replacements: any = { limit, offset };

    if (brandId) {
      const idArray = brandId.split(",").map((id: any) => parseInt(id, 10));
      whereConditions.push('"brand_id" IN (:brandId)');
      replacements.brandId = idArray;
    }

    if (countryId) {
      const idArray = countryId.split(",").map((id: any) => parseInt(id, 10));
      whereConditions.push('"country_id" IN (:countryId)');
      replacements.countryId = idArray;
    }

    if (stateId) {
      const idArray = stateId.split(",").map((id: any) => parseInt(id, 10));
      whereConditions.push('"state_id" IN (:stateId)');
      replacements.stateId = idArray;
    }

    if (districtId) {
      const idArray = districtId.split(",").map((id: any) => parseInt(id, 10));
      whereConditions.push('"district_id" IN (:districtId)');
      replacements.districtId = idArray;
    }

    replacements.from = from;
    replacements.to = to;

    let query = `
      SELECT * FROM "seed-cotton-pricings"
      ${whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') + ' AND ' : 'WHERE '} 
      "startDate" >= :from AND "endDate" <= :to
      ORDER BY "id" DESC
      LIMIT :limit OFFSET :offset;
    `;

    console.log('Query:', query); // Log the query
    const rows = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    const count = rows.length;

    // Fetch the state names
    const countryIds = rows.map((row: any) => row.country_id);
    const stateIds = rows.map((row: any) => row.state_id);

    const stateMap = await getStatesByCountryAndStateId(stateIds, countryIds);

    rows.forEach((row: any) => {
      const stateName = stateMap.get(row.state_id);
      row.state_name = stateName || 'Unknown';
    });

    return res.sendPaginationSuccess(res, rows, count);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};



// const getWeekDateRange = (weekRange: string, seasonStartDate: Date) => {
//   const startDate = new Date(seasonStartDate);

//   const [weekStart, weekEnd] = weekRange.split("-").map((item) => parseInt(item));

//   if (isNaN(weekStart) || isNaN(weekEnd) || weekStart > weekEnd) {
//     throw new Error("Invalid week range format.");
//   }

//   const startDayOfWeek = weekStart - 1; 
//   const endDayOfWeek = weekEnd - 1; 


//   const weekStartDate = new Date(startDate.getTime() + startDayOfWeek * 24 * 60 * 60 * 1000); 
//   const weekEndDate = new Date(startDate.getTime() + (endDayOfWeek + 1) * 24 * 60 * 60 * 1000); 

//   return { startDate: weekStartDate, endDate: weekEndDate };
// };

// const getPricyByCountry = async (req: Request, res: Response) => {
//   try {
//     const { country, seasonStartDate, seasonEndDate, week, month } = req.query;

//     if (!seasonStartDate || !seasonEndDate) {
//       return res.status(400).json({ success: false, message: "Season start and end date are required." });
//     }

//     const seasonStart = new Date(seasonStartDate as string);
//     const seasonEnd = new Date(seasonEndDate as string);

//     const { startDate, endDate } = getWeekDateRange(week as string, seasonStart);

//     if (!startDate || !endDate) {
//       return res.status(400).json({ success: false, message: "Invalid week range." });
//     }

//     const whereSeedCotton: any = {
//       country_id: country,
//       startDate: { [Op.gte]: startDate },
//       endDate: { [Op.lte]: endDate },
//     };

//     const whereTransactions: any = {
//       country_id: country,
//       date: { [Op.gte]: startDate, [Op.lte]: endDate },
//       program_id: { [Op.in]: [4, 5] }, 
//     };

//     if (month) {
//       const monthStartDate = new Date(seasonStart);
//       monthStartDate.setMonth(parseInt(month as string) - 1); 

//       const monthEndDate = new Date(monthStartDate);
//       monthEndDate.setMonth(monthStartDate.getMonth() + 1); 
//       monthEndDate.setDate(0); 

//       whereSeedCotton.startDate = { [Op.gte]: monthStartDate };
//       whereSeedCotton.endDate = { [Op.lte]: monthEndDate };

//       whereTransactions.date = { [Op.gte]: monthStartDate, [Op.lte]: monthEndDate };
//     }

//     const seedCottonData = await SeedCottonPricing.findAll({
//       attributes: [
//         "country_id",
//         [Sequelize.fn("DATE", Sequelize.col("startDate")), "weekStart"],
//         [Sequelize.fn("DATE", Sequelize.col("endDate")), "weekEnd"],
//         [Sequelize.fn("AVG", Sequelize.col("market_price")), "averageMarketPrice"],
//       ],
//       where: whereSeedCotton,
//       group: ["country_id", "weekStart", "weekEnd", "country.id"],
//       include: [
//         {
//           model: Country,
//           as: "country",
//           attributes: ["county_name"],
//         },
//       ],
//     });

//     const transactionsData = await Transaction.findAll({
//       attributes: [
//         "country_id",
//         "program_id",
//         [
//           Sequelize.fn("AVG", Sequelize.cast(Sequelize.col("rate"), "FLOAT")),
//           "averageRate",
//         ],
//       ],
//       where: whereTransactions,
//       group: ["country_id", "program_id", "program.id", "country.id"],
//       include: [
//         {
//           model: Program,
//           as: "program",
//           attributes: ["program_name"],
//         },
//         {
//           model: Country,
//           as: "country",
//           attributes: ["county_name"],
//         },
//       ],
//     });

//     const pricingMap: any = {};

//     seedCottonData.forEach((row: any) => {
//       const country = row.country.id;
//       const week = `${row.weekStart} - ${row.weekEnd}`;
//       if (!pricingMap[country]) pricingMap[country] = {};
//       if (!pricingMap[country][week]) {
//         pricingMap[country][week] = {
//           conventional: parseFloat(row.averageMarketPrice),
//           reel: 0,
//           organic: 0,
//         };
//       }
//     });

//     transactionsData.forEach((row: any) => {
//       const country = row.country.id;
//       const programName = row.program.program_name.toLowerCase(); 

//       Object.keys(pricingMap[country] || {}).forEach((week) => {
//         pricingMap[country][week][programName] = parseFloat(row.averageRate);
//       });
//     });


//     const finalData = Object.keys(pricingMap).map((country) => ({
//       country,
//       weeks: Object.keys(pricingMap[country]).map((week) => ({
//         week,
//         conventional: pricingMap[country][week].conventional || 0,
//         reel: pricingMap[country][week].reel || 0,
//         organic: pricingMap[country][week].organic || 0,
//       })),
//     }));

//     return res.status(200).json({ success: true, data: finalData });
//   } catch (error: any) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Internal Server Error",
//     });
//   }
// };

export {
  getPricyByCountry,
  getPricyByStates
};