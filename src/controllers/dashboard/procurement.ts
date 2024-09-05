import { Request, Response } from "express";
import { Sequelize } from "sequelize";
import * as yup from 'yup';
import Farmer from "../../models/farmer.model";
import Country from "../../models/country.model";
import State from "../../models/state.model";
import District from "../../models/district.model";
import Block from "../../models/block.model";
import Village from "../../models/village.model";
import Farm from "../../models/farm.model";
import Transaction from "../../models/transaction.model";
import Season from "../../models/season.model";
import GinProcess from "../../models/gin-process.model";
import Ginner from "../../models/ginner.model";
import { Op } from "sequelize";
import moment from "moment";



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


const getFarmWhereQuery = (
  reqData: any
) => {
  const where: any = {

  };

  if (reqData?.program)
    where.program_id = reqData.program;

  if (reqData?.brand)
    where['$farmer.brand_id$'] = reqData.brand;

  if (reqData?.season)
    where.season_id = reqData.season;

  if (reqData?.country)
    where['$farmer.country_id$'] = reqData.country;

  if (reqData?.state)
    where['$farmer.state_id$'] = reqData.state;

  if (reqData?.district)
    where['$farmer.district_id$'] = reqData.district;

  if (reqData?.block)
    where['$farmer.block_id$'] = reqData.block;

  if (reqData?.village)
    where['$farmer.village_id$'] = reqData.village;


  return where;
};


const getTransactionWhereQuery = (
  reqData: any
) => {
  const where: any = {
    status: "Sold"
  };

  if (reqData?.program)
    where.program_id = reqData.program;

  if (reqData?.brand)
    where.brand_id = reqData.brand;

  if (reqData?.season)
    where.season_id = reqData.season;

  if (reqData?.country)
    where.country_id = reqData.country;

  if (reqData?.state)
    where.state_id = reqData.state;

  if (reqData?.district)
    where.district_id = reqData.district;

  if (reqData?.block)
    where.block_id = reqData.block;

  if (reqData?.village)
    where.village_id = reqData.village;

  if (reqData?.ginner)
    where.mapped_ginner = reqData.ginner;

  if (reqData?.fromDate)
    where.date = { [Op.gte]: reqData.fromDate };

  if (reqData?.toDate)
    where.date = { [Op.lt]: reqData.toDate };

  if (reqData?.fromDate && reqData?.toDate)
    where.date = { [Op.between]: [reqData.fromDate, reqData.toDate] };

  return where;
};


const getGinnerProcessWhereQuery = (
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

  // if (reqData?.block)
  //   where.block_id = reqData.block;

  // if (reqData?.village)
  //   where.village_id = reqData.village;

  if (reqData?.fromDate)
    where.date = { [Op.gte]: reqData.fromDate };

  if (reqData?.toDate)
    where.date = { [Op.lt]: reqData.toDate };

  if (reqData?.fromDate && reqData?.toDate)
    where.date = { [Op.between]: [reqData.fromDate, reqData.toDate] };


  return where;
};


const getCountryEstimateAndProduction = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const where = getFarmWhereQuery(reqData);
    const transactionWhere = getTransactionWhereQuery(reqData);
    const estimateList = await getEstimateProductionByCountry(
      where,
      reqData
    );
    const procuredList = await getProcuredByCountry(
      transactionWhere,
      reqData
    );
    const data = getCountryEstimateProductionRes(
      estimateList,
      procuredList
    );
    return res.sendSuccess(res, data);
  }
  catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }

};


const getCountryEstimateProductionRes = (
  estimateList: any,
  procuredList: any
) => {
  let name: any = [];
  let estimate: any = [];
  let production: any = [];

  const ids: number[] = [];

  estimateList.forEach((estimate: any) => {
    if (!ids.includes(estimate.dataValues.id))
      ids.push(estimate.dataValues.id);
  });
  procuredList.forEach((procured: any) => {
    if (!ids.includes(procured.dataValues.id))
      ids.push(procured.dataValues.id);
  });


  for (const id of ids) {
    const data = {
      name: '',
      estimate: 0,
      production: 0
    };
    const fEstimate = estimateList.find((estimate: any) =>
      estimate.dataValues.id == id
    );
    const fProcured = procuredList.find((procured: any) =>
      procured.dataValues.id == id
    );
    if (fEstimate) {
      data.name = fEstimate.dataValues.name;
      data.estimate = fEstimate.dataValues.estimate;
    }
    if (fProcured) {
      data.name = fProcured.dataValues.name;
      data.production = fProcured.dataValues.procured;
    }
    if (data.name) {
      name.push(data.name);
      estimate.push(mtConversion(data.estimate));
      production.push(mtConversion(data.production));
    }

  }

  return {
    name,
    estimate,
    production
  };
};


const getProcuredByCountry = async (
  where: any,
  reqData: any
) => {
  let tableName = 'country';
  let colName = 'county_name';
  let model = Country;

  if (reqData.block) {
    tableName = 'village';
    colName = 'village_name';
    model = Village;
  }
  else if (reqData.district) {
    tableName = 'block';
    colName = 'block_name';
    model = Block;
  }
  else if (reqData.state) {
    tableName = 'district';
    colName = 'district_name';
    model = District;
  }
  else if (reqData.country) {
    tableName = 'state';
    colName = 'state_name';
    model = State;
  }

  const result = await Transaction.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.literal('CAST(qty_purchased  as numeric)')), 'procured'],
      [Sequelize.col(`${tableName}.${colName}`), 'name'],
      [Sequelize.col(`${tableName}.id`), 'id']
    ],
    include: [{
      model: model,
      as: tableName,
      attributes: []
    }],
    where,
    group: [`${tableName}.id`]
  });

  return result;

};


const getEstimateProductionByCountry = async (
  where: any,
  reqData: any
) => {
  let tableName = 'country';
  let colName = 'county_name';
  let model = Country;

  if (reqData.block) {
    tableName = 'village';
    colName = 'village_name';
    model = Village;
  }
  else if (reqData.district) {
    tableName = 'block';
    colName = 'block_name';
    model = Block;
  }
  else if (reqData.state) {
    tableName = 'district';
    colName = 'district_name';
    model = District;
  }
  else if (reqData.country) {
    tableName = 'state';
    colName = 'state_name';
    model = State;
  }

  const estimateAndProduction = await Farm.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('farmer.total_estimated_cotton')), 'estimate'],
      [Sequelize.fn('SUM', Sequelize.col('farmer.agri_estimated_prod')), 'production'],
      [Sequelize.col(`farmer.${tableName}.${colName}`), 'name'],
      [Sequelize.col(`farmer.${tableName}.id`), 'id']
    ],
    include: [
      {
        model: Farmer,
        as: 'farmer',
        attributes: [],
        include: [{
          model: model,
          as: tableName
        }],
      },
    ],
    where,
    group: [`farmer.${tableName}.id`]
  });

  return estimateAndProduction;

};

const getEstimateAndProcured = async (
  req: Request, res: Response
) => {
  try {

    const reqData = await getQueryParams(req, res);
    // const farmWhere = getFarmWhereQuery(reqData);
    // const estimateList = await getEstimateData(farmWhere);
    // const data = getEstimateAndProcuredRes(estimateList);
    const transactionWhere = getTransactionWhereQuery(reqData);
    const farmWhere = getFarmWhereQuery(reqData);
    const procuredList = await getProcuredData(transactionWhere);
    const estimateList = await getEstimateData(farmWhere);
    const data = getEstimateAndProcuredRes(estimateList, procuredList);
    return res.sendSuccess(res, data);
  }

  catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }

};

const mtConversion = (value: number) => {
  return value > 0 ? Number((value / 1000).toFixed(2)) : 0;
};


const getEstimateAndProcuredRes = (
  estimateList: any,
  procuredList: any
) => {
  let seasonIds: number[] = [];

  estimateList.forEach((estimate: any) => {
    if (estimate.dataValues.season.id)
      seasonIds.push(estimate.dataValues.season.id);
  });


  // seasonIds = seasonIds.sort((a, b) => a - b);

  // let season: string[] = [];
  // let estimate: number[] = [];
  // let procured: number[] = [];

  // for (const sessionId of seasonIds) {
  //   const fEstimate = estimateList.find((estimate: any) =>
  //     estimate.dataValues.season.id == sessionId
  //   );
  //   let data = {
  //     seasonName: '',
  //     estimate: 0,
  //     procured: 0
  //   };

  //   if (fEstimate) {
  //     data.seasonName = fEstimate.dataValues.season.name;
  //     data.estimate += mtConversion(fEstimate.dataValues.estimate);
  //     data.procured += mtConversion(fEstimate.dataValues.production);
  //   }


  //   season.push(data.seasonName);
  //   estimate.push(data.estimate);
  //   procured.push(data.procured);

  // }



  procuredList.forEach((procured: any) => {
    if (!seasonIds.includes(procured.dataValues.season.id))
      seasonIds.push(procured.dataValues.season.id);
  });

  seasonIds = seasonIds.sort((a, b) => a - b);

  let season: string[] = [];
  let estimate: number[] = [];
  let procured: number[] = [];

  for (const sessionId of seasonIds) {
    const fEstimate = estimateList.find((estimate: any) =>
          estimate.dataValues.season.id == sessionId
        );
    const fProcured = procuredList.find((procured: any) =>
      procured.dataValues.season.id == sessionId
    );
    let data = {
      seasonName: '',
      estimate: 0,
      procured: 0
    };

    if (fEstimate) {
          data.seasonName = fEstimate.dataValues.season.name;
          data.estimate += mtConversion(fEstimate.dataValues.estimate);
        }

    if (fProcured) {
      data.seasonName = fProcured.dataValues.season.name;
      data.procured += mtConversion(fProcured.dataValues.procured);
    }


    season.push(data.seasonName);
    estimate.push(data.estimate);
    procured.push(data.procured);

  }

  return {
    season,
    estimate,
    procured
  };
};



const getEstimateData = async (
  where: any
) => {

  const estimateAndProduction = await Farm.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('farmer.total_estimated_cotton')), 'estimate'],
      [Sequelize.fn('SUM', Sequelize.col('farmer.agri_estimated_prod')), 'production'],
      [Sequelize.col('season.id'), 'seasonId']
    ],
    include: [
      {
        model: Farmer,
        as: 'farmer',
        attributes: [],
      },
      {
        model: Season,
        as: 'season',
        attributes: ['id', 'name']
      }
    ],
    order: [['seasonId', 'desc']],
    limit: 3,
    where,
    group: ['season.id']
  });

  return estimateAndProduction;

};




const getProcuredData = async (
  where: any
) => {

  const result = await Transaction.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.literal('CAST(qty_purchased  as numeric)')), 'procured'],
      [Sequelize.col('season.id'), 'seasonId']

    ],
    include: [{
      model: Season,
      as: 'season',
      attributes: ['id', 'name']
    }],
    where,
    order: [['seasonId', 'desc']],
    limit: 3,
    group: ['season.id']
  });

  return result;

};


const getProcuredProcessed = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const transactionQuery = getTransactionWhereQuery(reqData);
    const ginnerProcessQuery = getGinnerProcessWhereQuery(reqData);
    const procuredList = await getProcuredData(transactionQuery);
    const processedList = await getProcessedData(ginnerProcessQuery);
    const data = getProcuredProcessedRes(
      processedList,
      procuredList,
    );
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};




const getProcuredProcessedRes = (
  processedList: any,
  procuredList: any
) => {
  let seasonIds: number[] = [];

  processedList.forEach((processed: any) => {
    if (processed.dataValues.season.id)
      seasonIds.push(processed.dataValues.season.id);
  });

  procuredList.forEach((procured: any) => {
    if (!seasonIds.includes(procured.dataValues.season.id))
      seasonIds.push(procured.dataValues.season.id);
  });

  seasonIds = seasonIds.sort((a, b) => a - b);

  let season: string[] = [];
  let processed: number[] = [];
  let procured: number[] = [];

  for (const sessionId of seasonIds) {
    const fProcessed = processedList.find((processed: any) =>
      processed.dataValues.season.id == sessionId
    );
    const fProcured = procuredList.find((procured: any) =>
      procured.dataValues.season.id == sessionId
    );
    let data = {
      seasonName: '',
      processed: 0,
      procured: 0
    };

    if (fProcessed) {
      data.seasonName = fProcessed.dataValues.season.name;
      data.processed += mtConversion(fProcessed.dataValues.processed);
    }

    if (fProcured) {
      data.seasonName = fProcured.dataValues.season.name;
      data.procured += mtConversion(fProcured.dataValues.procured);
    }


    season.push(data.seasonName);
    processed.push(data.processed);
    procured.push(data.procured);

  }

  return {
    season,
    processed,
    procured
  };
};



const getProcessedData = async (
  where: any
) => {

  const result = await GinProcess.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.literal('total_qty')), 'processed'],
      [Sequelize.col('season.id'), 'seasonId']
    ],
    include: [{
      model: Season,
      as: 'season',
      attributes: ['id', 'name']
    }, {
      model: Ginner,
      as: 'ginner',
      attributes: []
    }],
    where,
    order: [['seasonId', 'desc']],
    limit: 3,
    group: ['season.id']
  });

  return result;

};


const getProcuredProcessedMonthly = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const seasonOne = await Season.findOne({
      where: {
        id: reqData.season ? reqData.season : '9'
      }
    });
    reqData.season = seasonOne.id;
    const transactionWhere = getTransactionWhereQuery(reqData);
    const ginnerProcessWhere = getGinnerProcessWhereQuery(reqData);
    const procuredList = await getProcuredDataByMonth(transactionWhere);
    const processedList = await getProcessedDataByMonth(ginnerProcessWhere);
    const data = getProcuredProcessedMonthlyRes(
      processedList,
      procuredList,
      seasonOne
    );
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};

const getProcuredDataByMonth = async (
  where: any
) => {

  const result = await Transaction.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.literal('CAST(qty_purchased  as numeric)')), 'procured'],
      [Sequelize.literal("date_part('Month', date)"), 'month'],
      [Sequelize.literal("date_part('Year', date)"), 'year']
    ],
    where,
    group: ['month', 'year']
  });

  return result;

};


const getProcessedDataByMonth = async (
  where: any
) => {

  const result = await GinProcess.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.literal('total_qty')), 'processed'],
      [Sequelize.literal("date_part('Month', date)"), 'month'],
      [Sequelize.literal("date_part('Year', date)"), 'year']
    ],
    include: [{
      model: Ginner,
      as: 'ginner',
      attributes: []
    }],
    where,
    group: ['month', 'year']
  });

  return result;

};



const getProcuredProcessedMonthlyRes = (
  processedList: any,
  procuredList: any,
  season: any
) => {
  const monthList = getMonthDate(season.from, season.to);


  let month: string[] = [];
  let processed: number[] = [];
  let procured: number[] = [];

  for (const mon of monthList) {
    const fProcessed = processedList.find((processed: any) =>
      (processed.dataValues.month - 1) == mon.month &&
      processed.dataValues.year == mon.year
    );
    const fProcured = procuredList.find((procured: any) =>
      (procured.dataValues.month - 1) == mon.month &&
      procured.dataValues.year == mon.year
    );
    let data = {
      processed: 0,
      procured: 0
    };

    if (fProcessed) {
      data.processed += mtConversion(fProcessed.dataValues.processed);
    }

    if (fProcured) {
      data.procured += mtConversion(fProcured.dataValues.procured);
    }

    month.push(getMonthName(mon.month));
    processed.push(data.processed);
    procured.push(data.procured);

  }

  return {
    month,
    processed,
    procured
  };
};


const getMonthDate = (
  from: string,
  to: string
) => {
  let start = moment(from).utc();
  const end = moment(to).utc();
  const monthList: {
    month: number,
    year: number;
  }[] = [];
  while (end.diff(start, 'days') > 0) {
    monthList.push({
      month: start.month(),
      year: start.year()
    });
    start = start.add(1, 'month');
  }
  return monthList;
};



const getEstimateProcuredAndProduction = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const transactionWhere = getTransactionWhereQuery(reqData);
    const ginnerProcessWhere = getGinnerProcessWhereQuery(reqData);
    const farmWhere = getFarmWhereQuery(reqData);
    const procuredList = await getProcuredData(transactionWhere);
    const processedList = await getProcessedData(ginnerProcessWhere);
    const estimateList = await getEstimateData(farmWhere);
    const data = getEstimateProcuredAndProductionRes(
      processedList,
      procuredList,
      estimateList
    );
    return res.sendSuccess(res, data);
  }
  catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }

};


const getEstimateProcuredAndProductionRes = (
  processedList: any,
  procuredList: any,
  estimateList: any
) => {
  let seasonIds: number[] = [];

  processedList.forEach((processed: any) => {
    if (processed.dataValues.season.id)
      seasonIds.push(processed.dataValues.season.id);
  });

  procuredList.forEach((procured: any) => {
    if (!seasonIds.includes(procured.dataValues.season.id))
      seasonIds.push(procured.dataValues.season.id);
  });

  estimateList.forEach((estimate: any) => {
    if (!seasonIds.includes(estimate.dataValues.season.id))
      seasonIds.push(estimate.dataValues.season.id);
  });

  seasonIds = seasonIds.sort((a, b) => a - b);

  let season: string[] = [];
  let processed: number[] = [];
  let procured: number[] = [];
  let estimated: number[] = [];

  for (const sessionId of seasonIds) {
    const fProcessed = processedList.find((processed: any) =>
      processed.dataValues.season.id == sessionId
    );
    const fProcured = procuredList.find((procured: any) =>
      procured.dataValues.season.id == sessionId
    );
    const fEstimate = estimateList.find((estimate: any) =>
      estimate.dataValues.season.id == sessionId
    );

    let data = {
      seasonName: '',
      processed: 0,
      procured: 0,
      estimate: 0
    };

    if (fProcessed) {
      data.seasonName = fProcessed.dataValues.season.name;
      data.processed += mtConversion(fProcessed.dataValues.processed);
    }

    if (fProcured) {
      data.seasonName = fProcured.dataValues.season.name;
      data.procured += mtConversion(fProcured.dataValues.procured);
    }

    if (fEstimate) {
      data.seasonName = fEstimate.dataValues.season.name;
      data.estimate += mtConversion(fEstimate.dataValues.estimate);
    }

    season.push(data.seasonName);
    processed.push(data.processed);
    procured.push(data.procured);
    estimated.push(data.estimate);
  }

  return {
    season,
    processed,
    procured,
    estimated
  };
};



const getProcuredCottonByCountry = async (
  req: Request, res: Response
) => {
  try {

    const reqData = await getQueryParams(req, res);
    const where = getTransactionWhereQuery(reqData);
    const estimatedList = await getProcuredByCountryData(where);
    const data = await getEstimateCottonRes(estimatedList, reqData.season);
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};


const getEstimateCottonRes = async (
  estimatedList: any = [],
  reqSeason: any
) => {
  let seasonIds: number[] = [];
  let countries: number[] = [];

  estimatedList.forEach((list: any) => {
    if (!countries.includes(list.dataValues.countryName))
      countries.push(list.dataValues.countryName);

    if (!seasonIds.includes(list.dataValues.seasonId))
      seasonIds.push(list.dataValues.seasonId);
  });

  const seasons = await Season.findAll({
    limit: 3,
    order: [
      ["id", "DESC"],
    ],
  });
  if (seasonIds.length != 3 && !reqSeason) {
    for (const season of seasons) {
      if (!seasonIds.includes(season.id))
        seasonIds.push(season.id);
    }
  }

  seasonIds = seasonIds.sort((a, b) => a - b).slice(-3);

  let seasonList: any[] = [];
  let areaList: any[] = [];


  for (const countryName of countries) {
    const data: any = {
      name: countryName,
      data: [],
    };
    const farmerList = estimatedList.filter((list: any) =>
      list.dataValues.countryName == countryName
    );

    for (const seasonId of seasonIds) {

      let totalArea = 0;
      const fFarmerValue = farmerList.find((list: any) =>
        list.dataValues.seasonId == seasonId
      );

      if (fFarmerValue) {
        totalArea = mtConversion(fFarmerValue.dataValues.procured);
        if (!seasonList.includes(fFarmerValue.dataValues.seasonName))
          seasonList.push(fFarmerValue.dataValues.seasonName);
      }
      else {
        seasons.forEach((season: any) => {
          if (season.id == seasonId && !seasonList.includes(season.dataValues.name)) {
            seasonList.push(season.name);
          }
        });
      }
      data.data.push(totalArea);
    }

    areaList.push(data);
  }

  return {
    areaList,
    seasonList,
  };
};


const getProcuredByCountryData = async (where: any) => {
  const result = await Transaction.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.literal('CAST(qty_purchased  as numeric)')), 'procured'],
      [Sequelize.col('country.id'), 'countryId'],
      [Sequelize.col('country.county_name'), 'countryName'],
      [Sequelize.col('season.id'), 'seasonId'],
      [Sequelize.col('season.name'), 'seasonName']
    ],
    include: [{
      model: Season,
      as: 'season',
      attributes: ['id', 'name']
    }, {
      model: Country,
      as: 'country',
      attributes: []
    }],
    where,
    order: [['seasonId', 'desc']],
    group: ["country.id", 'season.id']
  });


  return result;
};

const getProcessedCottonByCountry = async (
  req: Request, res: Response
) => {
  try {

    const reqData = await getQueryParams(req, res);
    const where = getGinnerProcessWhereQuery(reqData);
    const processedList = await getProcessedByCountryData(where);
    const data = await getProcessedCottonRes(processedList, reqData.season);
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};


const getProcessedCottonRes = async (
  processedList: any = [],
  reqSeason: any
) => {
  let seasonIds: number[] = [];
  let countries: number[] = [];

  processedList.forEach((list: any) => {
    if (!countries.includes(list.dataValues.countryName))
      countries.push(list.dataValues.countryName);

    if (!seasonIds.includes(list.dataValues.seasonId))
      seasonIds.push(list.dataValues.seasonId);
  });

  const seasons = await Season.findAll({
    limit: 3,
    order: [
      ["id", "DESC"],
    ],
  });
  if (seasonIds.length != 3 && !reqSeason) {
    for (const season of seasons) {
      if (!seasonIds.includes(season.id))
        seasonIds.push(season.id);
    }
  }

  seasonIds = seasonIds.sort((a, b) => a - b).slice(-3);

  let seasonList: any[] = [];
  let areaList: any[] = [];

  for (const countryName of countries) {
    const data: any = {
      name: countryName,
      data: [],
    };
    const farmerList = processedList.filter((list: any) =>
      list.dataValues.countryName == countryName
    );

    for (const seasonId of seasonIds) {

      let totalArea = 0;
      const fFarmerValue = farmerList.find((list: any) =>
        list.dataValues.seasonId == seasonId
      );

      if (fFarmerValue) {
        totalArea = mtConversion(fFarmerValue.dataValues.processed);
        if (!seasonList.includes(fFarmerValue.dataValues.seasonName))
          seasonList.push(fFarmerValue.dataValues.seasonName);
      } else {
        seasons.forEach((season: any) => {
          if (season.id == seasonId && !seasonList.includes(season.dataValues.name)) {
            seasonList.push(season.name);
          }
        });
      }
      data.data.push(totalArea);
    }

    areaList.push(data);
  }

  return {
    areaList,
    seasonList,
  };
};



const getProcessedEstimatedProcessedCottonByCountry = async (
  req: Request, res: Response
) => {
  try {

    const reqData = await getQueryParams(req, res);
    const transactionWhere = getTransactionWhereQuery(reqData);
    const ginnerProcessWhere = getGinnerProcessWhereQuery(reqData);
    const farmWhere = getFarmWhereQuery(reqData);
    const procuredList = await getProcuredByCountryData(transactionWhere);
    const processedList = await getProcessedByCountryData(ginnerProcessWhere);
    const estimateList = await getEstimateDataByCountry(farmWhere);
    const data = await getProcessedEstimatedProcessedCottonRes(
      processedList,
      procuredList,
      estimateList,
      reqData.season
    );
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};



const getEstimateDataByCountry = async (
  where: any
) => {

  const result = await Farm.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('farms.total_estimated_cotton')), 'estimate'],
      [Sequelize.fn('SUM', Sequelize.col('farms.agri_estimated_prod')), 'production'],
      [Sequelize.col('farmer.country.id'), 'countryId'],
      [Sequelize.col('farmer.country.county_name'), 'countryName'],
      [Sequelize.col('season.id'), 'seasonId'],
      [Sequelize.col('season.name'), 'seasonName']
    ],
    include: [{
      model: Farmer,
      as: 'farmer',
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
    group: ['farmer.country.id', 'season.id']
  });
  return result;

};


const getProcessedEstimatedProcessedCottonRes = async (
  processedList: any[],
  procuredList: any[],
  estimateList: any[],
  reqSeason: any
) => {
  let seasonIds: number[] = [];
  let countries: number[] = [];

  processedList.forEach((list: any) => {
    if (!countries.includes(list.dataValues.countryName))
      countries.push(list.dataValues.countryName);

    if (!seasonIds.includes(list.dataValues.seasonId))
      seasonIds.push(list.dataValues.seasonId);
  });

  procuredList.forEach((list: any) => {
    if (!countries.includes(list.dataValues.countryName))
      countries.push(list.dataValues.countryName);

    if (!seasonIds.includes(list.dataValues.seasonId))
      seasonIds.push(list.dataValues.seasonId);
  });

  estimateList.forEach((list: any) => {
    if (!countries.includes(list.dataValues.countryName))
      countries.push(list.dataValues.countryName);

    if (!seasonIds.includes(list.dataValues.seasonId))
      seasonIds.push(list.dataValues.seasonId);
  });


  const seasons = await Season.findAll({
    limit: 3,
    order: [
      ["id", "DESC"],
    ],
  });
  if (seasonIds.length != 3 && !reqSeason) {
    for (const season of seasons) {
      if (!seasonIds.includes(season.id))
        seasonIds.push(season.id);
    }
  }

  seasonIds = seasonIds.sort((a, b) => a - b).slice(-3);

  let seasonList: any[] = [];
  let overAllData: any[] = [];


  for (const countryName of countries) {
    const data: any = {
      name: countryName,
      data: [],
    };
    const farmerProcessedList = processedList.filter((list: any) =>
      list.dataValues.countryName == countryName
    );
    const farmerProcuredList = procuredList.filter((list: any) =>
      list.dataValues.countryName == countryName
    );
    const farmerEstimateList = estimateList.filter((list: any) =>
      list.dataValues.countryName == countryName
    );

    for (const seasonId of seasonIds) {

      let countryCount = {
        estimated: 0,
        procured: 0,
        processed: 0,
      };

      const fProcessed = farmerProcessedList.find((list: any) =>
        list.dataValues.seasonId == seasonId
      );
      const fProcured = farmerProcuredList.find((list: any) =>
        list.dataValues.seasonId == seasonId
      );
      const fEstimate = farmerEstimateList.find((list: any) =>
        list.dataValues.seasonId == seasonId
      );

      if (fProcessed) {
        countryCount.processed = mtConversion(fProcessed.dataValues.processed);
        if (!seasonList.includes(fProcessed.dataValues.seasonName))
          seasonList.push(fProcessed.dataValues.seasonName);
      }
      if (fProcured) {
        countryCount.procured = mtConversion(fProcured.dataValues.procured);
        if (!seasonList.includes(fProcured.dataValues.seasonName))
          seasonList.push(fProcured.dataValues.seasonName);
      }
      if (fEstimate) {
        countryCount.estimated = mtConversion(fEstimate.dataValues.estimate);
        if (!seasonList.includes(fEstimate.dataValues.seasonName))
          seasonList.push(fEstimate.dataValues.seasonName);
      }
      if (!fProcessed && !fProcured && !fEstimate) {
        seasons.forEach((season: any) => {
          if (season.id == seasonId && !seasonList.includes(season.dataValues.name)) {
            seasonList.push(season.name);
          }
        });
      }
      data.data.push(countryCount.estimated);
      data.data.push(countryCount.procured);
      data.data.push(countryCount.processed);
    }

    overAllData.push(data);
  }

  return {
    overAllData,
    seasonList,
  };
};


const getProcessedByCountryData = async (where: any) => {

  const result = await GinProcess.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.literal('total_qty')), 'processed'],
      [Sequelize.col('ginner.country.id'), 'countryId'],
      [Sequelize.col('ginner.country.county_name'), 'countryName'],
      [Sequelize.col('season.id'), 'seasonId'],
      [Sequelize.col('season.name'), 'seasonName']
    ],
    include: [{
      model: Season,
      as: 'season',
      attributes: ['id', 'name']
    }, {
      model: Ginner,
      as: 'ginner',
      attributes: [],
      include: [{
        model: Country,
        as: 'country',
        attributes: []
      }]
    }],
    where,
    order: [['seasonId', 'desc']],
    group: ["ginner.country.id", 'season.id']
  });

  return result;
};



const formatNumber = (data: string): number => {
  return Number(Number(data).toFixed(2));
};

const getMonthName = (
  month: number
): string => {
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return monthNames[month];
};

export {
  getCountryEstimateAndProduction,
  getEstimateAndProcured,
  getProcuredProcessed,
  getProcuredProcessedMonthly,
  getEstimateProcuredAndProduction,
  getProcuredCottonByCountry,
  getProcessedCottonByCountry,
  getProcessedEstimatedProcessedCottonByCountry,
  getTransactionWhereQuery,
  getProcuredData
};