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


const getOverAllDataQuery = (
  reqData: any
) => {
  const where: any = {

  };
  if (reqData?.program)
    where.program_id = reqData.program;

  if (reqData?.brand)
    where['$ginner.brand$'] = {
      [Op.contains]: Sequelize.literal(`ARRAY [${reqData.brand}]`)
    };

  if (reqData?.season)
    where.season_id = reqData.season;

  if (reqData?.country)
    where['$ginner.country_id$'] = reqData.country;

  if (reqData?.state)
    where['$ginner.state_id$'] = reqData.state;

  if (reqData?.district)
    where['$ginner.district_id$'] = reqData.district;

  if (reqData?.ginner)
    where['$ginner.id$'] = reqData.ginner;

  if (reqData?.fromDate)
    where.date = { [Op.gte]: reqData.fromDate };

  if (reqData?.toDate)
    where.date = { [Op.lt]: reqData.toDate };

  if (reqData?.fromDate && reqData?.toDate)
    where.date = { [Op.between]: [reqData.fromDate, reqData.toDate] };

  return where;
};


const getQueryParams = async (
  req: Request, res: Response
) => {
  try {
    let {
      program,
      brand,
      season,
      country,
      state,
      district,
      block,
      village,
      ginner,
      fromDate,
      toDate
    } = req.query;
    const validator = yup.string()
      .notRequired()
      .nullable();

    await validator.validate(program);
    await validator.validate(brand);
    await validator.validate(season);
    await validator.validate(country);
    await validator.validate(state);
    await validator.validate(district);
    await validator.validate(block);
    await validator.validate(village);
    await validator.validate(ginner);
    await validator.validate(fromDate);
    await validator.validate(toDate);

    return {
      program,
      brand,
      season,
      country,
      state,
      district,
      block,
      village,
      ginner,
      fromDate,
      toDate
    };

  } catch (error: any) {
    throw {
      errCode: "REQ_ERROR"
    };
  }
};


const mtConversion = (value: number) => {
  return value > 0 ? Number((value / 1000).toFixed(2)) : 0;
};

const getPricyByCountry = async (
  req: Request, res: Response
) => {
  try {

    const reqData = await getQueryParams(req, res);
    const where = getOverAllDataQuery(reqData);
    const procuredData = await getProcuredByCountryData(where);
    const data = await getProcuredDataRes(procuredData, reqData.season);
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};


const getProcuredByCountryData = async (where: any) => {
  where.status = 'Sold';
  const result = await Transaction.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.literal('CAST(qty_purchased  as numeric)')), 'procured'],
      [Sequelize.col('country.id'), 'countryId'],
      [Sequelize.col('country.county_name'), 'countryName'],
      [Sequelize.col('season.id'), 'seasonId'],
      [Sequelize.col('season.name'), 'seasonName']
    ],
    include: [{
      model: Country,
      as: 'country',
      attributes: []
    }, {
      model: Season,
      as: 'season',
      attributes: []
    }, {
      model: Ginner,
      as: 'ginner',
      attributes: []
    }],
    where,
    group: ['country.id', 'season.id']
  });

  return result;
};


const getProcuredDataRes = async (
  procuredCountList: any = [],
  reqSeason: any
) => {
  let seasonIds: number[] = [];
  let countries: number[] = [];

  procuredCountList.forEach((list: any) => {
    if (!countries.includes(list.dataValues.countryName))
      countries.push(list.dataValues.countryName);

    if (!seasonIds.includes(list.dataValues.seasonId))
      seasonIds.push(list.dataValues.seasonId);
  });

  const seasons = await Season.findAll({
    // limit: 3,
    order: [
      ["id", "DESC"],
    ],
  });
  if (seasonIds.length != 3 && !reqSeason) {
    for (const season of seasons) {
      let currentDate = moment(); // Current date using moment
      let checkDate = moment('2024-10-01'); // October 1st, 2024
      
      if (currentDate.isSameOrAfter(checkDate) && season.name === '2024-25' && !seasonIds.includes(season.id)) {
        seasonIds.push(season.id);
      } else if(currentDate.isBefore(checkDate) && season.name === '2024-25' && seasonIds.includes(season.id)){
        seasonIds = seasonIds.filter((id: number) => id != season.id)
      }
    }
  }

  seasonIds = seasonIds.sort((a, b) => a - b).slice(-3);

  let seasonList: any[] = [];
  let procuredList: any[] = [];




  for (const countryName of countries) {
    const data: any = {
      name: countryName,
      data: [],
    };
    const farmerList = procuredCountList.filter((list: any) =>
      list.dataValues.countryName == countryName
    );

    for (const seasonId of seasonIds) {

      let farmerCount = 0;
      const fFarmerValue = farmerList.find((list: any) =>
        list.dataValues.seasonId == seasonId
      );

      if (fFarmerValue) {
        farmerCount = mtConversion(fFarmerValue.dataValues.procured);
        if (!seasonList.includes(fFarmerValue.dataValues.seasonName))
          seasonList.push(fFarmerValue.dataValues.seasonName);
      } else {
        seasons.forEach((season: any) => {
          if (season.id == seasonId && !seasonList.includes(season.seasonName)) {
            seasonList.push(season.name);
          }
        });
      }
      data.data.push(farmerCount);
    }

    procuredList.push(data);
  }

  return {
    procuredList,
    seasonList,
  };
};

const getPricyByState = async (
  req: Request, res: Response
) => {
  try {

    const reqData = await getQueryParams(req, res);
    const where = getOverAllDataQuery(reqData);
    const processedData = await getProcessedByCountryData(where);
    const data = await getProcessedDataRes(processedData, reqData.season);
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};


const getProcessedByCountryData = async (where: any) => {
  const result = await GinProcess.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('total_qty')), 'processed'],
      [Sequelize.col('ginner.country.id'), 'countryId'],
      [Sequelize.col('ginner.country.county_name'), 'countryName'],
      [Sequelize.col('season.id'), 'seasonId'],
      [Sequelize.col('season.name'), 'seasonName']
    ],
    include: [{
      model: Ginner,
      as: 'ginner',
      attributes: [],
      include: [{
        model: Country,
        as: 'country',
        attributes: []
      }]
    }, {
      model: Season,
      as: 'season',
      attributes: []
    }],
    where,
    group: ['ginner.country.id', 'season.id']
  });

  return result;
};


const getProcessedDataRes = async (
  processedCountList: any = [],
  reqSeason: any
) => {
  let seasonIds: number[] = [];
  let countries: number[] = [];

  processedCountList.forEach((list: any) => {
    if (!countries.includes(list.dataValues.countryName))
      countries.push(list.dataValues.countryName);

    if (!seasonIds.includes(list.dataValues.seasonId))
      seasonIds.push(list.dataValues.seasonId);
  });

  const seasons = await Season.findAll({
    // limit: 3,
    order: [
      ["id", "DESC"],
    ],
  });
  if (seasonIds.length != 3 && !reqSeason) {
    for (const season of seasons) {
      let currentDate = moment(); // Current date using moment
      let checkDate = moment('2024-10-01'); // October 1st, 2024
      
      if (currentDate.isSameOrAfter(checkDate) && season.name === '2024-25' && !seasonIds.includes(season.id)) {
        seasonIds.push(season.id);
      } else if(currentDate.isBefore(checkDate) && season.name === '2024-25' && seasonIds.includes(season.id)){
        seasonIds = seasonIds.filter((id: number) => id != season.id)
      }
    }
  }


  seasonIds = seasonIds.sort((a, b) => a - b).slice(-3);

  let seasonList: any[] = [];
  let processedList: any[] = [];




  for (const countryName of countries) {
    const data: any = {
      name: countryName,
      data: [],
    };
    const farmerList = processedCountList.filter((list: any) =>
      list.dataValues.countryName == countryName
    );

    for (const seasonId of seasonIds) {

      let farmerCount = 0;
      const fFarmerValue = farmerList.find((list: any) =>
        list.dataValues.seasonId == seasonId
      );

      if (fFarmerValue) {
        farmerCount = mtConversion(fFarmerValue.dataValues.processed);
        if (!seasonList.includes(fFarmerValue.dataValues.seasonName))
          seasonList.push(fFarmerValue.dataValues.seasonName);
      } else {
        seasons.forEach((season: any) => {
          if (season.id == seasonId && !seasonList.includes(season.seasonName)) {
            seasonList.push(season.name);
          }
        });
      }
      data.data.push(farmerCount);
    }

    processedList.push(data);
  }

  return {
    processedList,
    seasonList,
  };
};

export {
  getPricyByCountry,
  getPricyByState,
};