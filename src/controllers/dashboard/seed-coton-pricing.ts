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

// const getPricyByCountry = async (req: Request, res: Response) => {
//   try {
//     const { country, season, week, month } = req.query;

//     const seasonData = await Season.findOne({
//       attributes: ['id', 'from', 'to', 'name'],
//       where: { id: season },
//     });

//     if (!seasonData) {
//       return res.status(400).json({ success: false, message: "Season not found." });
//     }

//     const { from: seasonStartDate, to: seasonEndDate } = seasonData;

//     const { startDate, endDate } = getWeekDateRange(week as string, new Date(seasonStartDate));

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
//       const monthStartDate = new Date(seasonStartDate);
//       monthStartDate.setMonth(parseInt(month as string) - 1); 

//       const monthEndDate = new Date(monthStartDate);
//       monthEndDate.setMonth(monthStartDate.getMonth() + 1); 
//       monthEndDate.setDate(0);

//       whereSeedCotton.startDate = { [Op.gte]: monthStartDate };
//       whereSeedCotton.endDate = { [Op.lte]: monthEndDate };

//       whereTransactions.date = { [Op.gte]: monthStartDate, [Op.lte]: monthEndDate };
//     }

//     // Fetch data from SeedCottonPricing
//     const seedCottonData = await SeedCottonPricing.findAll({
//       attributes: [
//         "country_id",
//         [Sequelize.fn("DATE", Sequelize.col("startDate")), "weekStart"],
//         [Sequelize.fn("DATE", Sequelize.col("endDate")), "weekEnd"],
//         [Sequelize.fn("AVG", Sequelize.col("market_price")), "averageMarketPrice"],
//       ],
//       where: whereSeedCotton,
//       include: [
//         {
//           model: Country,
//           as: "country",
//           attributes: ["id", "county_name"],
//         },
//       ],
//       group: ["country_id", "weekStart", "weekEnd", "country.id"],
//     });

//     // Fetch data from Transactions table
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
//           attributes: ["id","county_name"],
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


const getWeekDateRange = (weekRange: string, seasonStartDate: Date) => {
  const startDate = new Date(seasonStartDate);

  const [weekStart, weekEnd] = weekRange.split("-").map((item) => parseInt(item));

  if (isNaN(weekStart) || isNaN(weekEnd) || weekStart > weekEnd) {
    throw new Error("Invalid week range format.");
  }

  const startDayOfWeek = weekStart - 1; 
  const endDayOfWeek = weekEnd - 1; 

  
  const weekStartDate = new Date(startDate.getTime() + startDayOfWeek * 24 * 60 * 60 * 1000); 
  const weekEndDate = new Date(startDate.getTime() + (endDayOfWeek + 1) * 24 * 60 * 60 * 1000); 

  return { startDate: weekStartDate, endDate: weekEndDate };
};

const getPricyByCountry = async (req: Request, res: Response) => {
  try {
    const { country, seasonStartDate, seasonEndDate, week, month } = req.query;

    if (!seasonStartDate || !seasonEndDate) {
      return res.status(400).json({ success: false, message: "Season start and end date are required." });
    }

    const seasonStart = new Date(seasonStartDate as string);
    const seasonEnd = new Date(seasonEndDate as string);

    const { startDate, endDate } = getWeekDateRange(week as string, seasonStart);

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: "Invalid week range." });
    }

    const whereSeedCotton: any = {
      country_id: country,
      startDate: { [Op.gte]: startDate },
      endDate: { [Op.lte]: endDate },
    };

    const whereTransactions: any = {
      country_id: country,
      date: { [Op.gte]: startDate, [Op.lte]: endDate },
      program_id: { [Op.in]: [4, 5] }, 
    };

    if (month) {
      const monthStartDate = new Date(seasonStart);
      monthStartDate.setMonth(parseInt(month as string) - 1); 

      const monthEndDate = new Date(monthStartDate);
      monthEndDate.setMonth(monthStartDate.getMonth() + 1); 
      monthEndDate.setDate(0); 

      whereSeedCotton.startDate = { [Op.gte]: monthStartDate };
      whereSeedCotton.endDate = { [Op.lte]: monthEndDate };

      whereTransactions.date = { [Op.gte]: monthStartDate, [Op.lte]: monthEndDate };
    }

    const seedCottonData = await SeedCottonPricing.findAll({
      attributes: [
        "country_id",
        [Sequelize.fn("DATE", Sequelize.col("startDate")), "weekStart"],
        [Sequelize.fn("DATE", Sequelize.col("endDate")), "weekEnd"],
        [Sequelize.fn("AVG", Sequelize.col("market_price")), "averageMarketPrice"],
      ],
      where: whereSeedCotton,
      group: ["country_id", "weekStart", "weekEnd", "country.id"],
      include: [
        {
          model: Country,
          as: "country",
          attributes: ["county_name"],
        },
      ],
    });

    const transactionsData = await Transaction.findAll({
      attributes: [
        "country_id",
        "program_id",
        [
          Sequelize.fn("AVG", Sequelize.cast(Sequelize.col("rate"), "FLOAT")),
          "averageRate",
        ],
      ],
      where: whereTransactions,
      group: ["country_id", "program_id", "program.id", "country.id"],
      include: [
        {
          model: Program,
          as: "program",
          attributes: ["program_name"],
        },
        {
          model: Country,
          as: "country",
          attributes: ["county_name"],
        },
      ],
    });

    const pricingMap: any = {};

    seedCottonData.forEach((row: any) => {
      const country = row.country.id;
      const week = `${row.weekStart} - ${row.weekEnd}`;
      if (!pricingMap[country]) pricingMap[country] = {};
      if (!pricingMap[country][week]) {
        pricingMap[country][week] = {
          conventional: parseFloat(row.averageMarketPrice),
          reel: 0,
          organic: 0,
        };
      }
    });

    transactionsData.forEach((row: any) => {
      const country = row.country.id;
      const programName = row.program.program_name.toLowerCase(); 

      Object.keys(pricingMap[country] || {}).forEach((week) => {
        pricingMap[country][week][programName] = parseFloat(row.averageRate);
      });
    });


    const finalData = Object.keys(pricingMap).map((country) => ({
      country,
      weeks: Object.keys(pricingMap[country]).map((week) => ({
        week,
        conventional: pricingMap[country][week].conventional || 0,
        reel: pricingMap[country][week].reel || 0,
        organic: pricingMap[country][week].organic || 0,
      })),
    }));

    return res.status(200).json({ success: true, data: finalData });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export {
  getPricyByCountry
};