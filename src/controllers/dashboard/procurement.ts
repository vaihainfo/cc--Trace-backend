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
    const user = (req as any).user;
    if (user?.role == 3 && user?._id) {
      brand = user._id;
    }
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
    const estimateProductionList = await getEstimateProductionByCountry(
      where,
      reqData
    );
    const data = getCountryEstimateProductionRes(estimateProductionList);
    return res.sendSuccess(res, data);
  }
  catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }

};


const getCountryEstimateProductionRes = (estimateProductionList: any) => {
  let name: any = [];
  let estimate: any = [];
  let production: any = [];

  for (const estimateProduction of estimateProductionList) {
    name.push(estimateProduction.dataValues.name);
    estimate.push(formatNumber(estimateProduction.dataValues.estimate));
    production.push(formatNumber(estimateProduction.dataValues.production));
  }

  return {
    name,
    estimate,
    production
  };
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
      [Sequelize.col(`farmer.${tableName}.${colName}`), 'name']
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
    const farmWhere = getFarmWhereQuery(reqData);
    const transactionWhere = getTransactionWhereQuery(reqData);
    const estimateList = await getEstimateData(farmWhere);
    const procuredList = await getProcuredData(transactionWhere);
    const data = getEstimateAndProcuredRes(
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


const getEstimateAndProcuredRes = (
  estimateList: any,
  procuredList: any
) => {
  let seasonIds: number[] = [];

  estimateList.forEach((estimate: any) => {
    if (estimate.dataValues.season.id)
      seasonIds.push(estimate.dataValues.season.id);
  });

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
      data.estimate += formatNumber(fEstimate.dataValues.estimate);
    }

    if (fProcured) {
      data.seasonName = fProcured.dataValues.season.name;
      data.procured += formatNumber(fProcured.dataValues.procured);
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
      data.processed += formatNumber(fProcessed.dataValues.processed);
    }

    if (fProcured) {
      data.seasonName = fProcured.dataValues.season.name;
      data.procured += formatNumber(fProcured.dataValues.procured);
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
      data.processed += formatNumber(fProcessed.dataValues.processed);
    }

    if (fProcured) {
      data.procured += formatNumber(fProcured.dataValues.procured);
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
      data.processed += formatNumber(fProcessed.dataValues.processed);
    }

    if (fProcured) {
      data.seasonName = fProcured.dataValues.season.name;
      data.procured += formatNumber(fProcured.dataValues.procured);
    }

    if (fEstimate) {
      data.seasonName = fEstimate.dataValues.season.name;
      data.estimate += formatNumber(fEstimate.dataValues.estimate);
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
  getEstimateProcuredAndProduction as getEstimateProcuredAndProcessed
};