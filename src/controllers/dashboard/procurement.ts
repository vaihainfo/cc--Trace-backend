import { Request, Response } from "express";
import { Sequelize } from "sequelize";
import * as yup from 'yup';
import Farmer from "../../models/farmer.model";
import Country from "../../models/country.model";
import Farm from "../../models/farm.model";
import Transaction from "../../models/transaction.model";
import Season from "../../models/season.model";
import GinProcess from "../../models/gin-process.model";


const getQueryParams = async (
  req: Request, res: Response
) => {
  try {
    const {
      program,
      brand,
      season,
      country,
      state,
      district,
      block,
      village,
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

    return {
      program,
      brand,
      season,
      country,
      state,
      district,
      block,
      village,
    };

  } catch (error: any) {
    throw {
      errCode: "REQ_ERROR"
    };
  }
};


const getCountryEstimateAndProduction = async (
  req: Request, res: Response
) => {
  try {

    const reqData = await getQueryParams(req, res);
    const estimateProductionList = await getEstimateProductionByCountry();
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
  let country: any = [];
  let estimate: any = [];
  let production: any = [];

  for (const estimateProduction of estimateProductionList) {
    country.push(estimateProduction.dataValues.countyName);
    estimate.push(formatNumber(estimateProduction.dataValues.estimate));
    production.push(formatNumber(estimateProduction.dataValues.production));
  }

  return {
    country,
    estimate,
    production
  };
};


const getEstimateProductionByCountry = async () => {

  const estimateAndProduction = await Farm.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('farmer.total_estimated_cotton')), 'estimate'],
      [Sequelize.fn('SUM', Sequelize.col('farmer.agri_estimated_prod')), 'production'],
      [Sequelize.col('farmer.country.county_name'), 'countyName']
    ],
    include: [
      {
        model: Farmer,
        as: 'farmer',
        attributes: [],
        include: [{
          model: Country,
          as: 'country'
        }],
      },
    ],
    group: ['farmer.country.id']
  });

  return estimateAndProduction;

};

const getEstimateAndProcured = async (
  req: Request, res: Response
) => {
  try {

    const reqData = await getQueryParams(req, res);
    const estimateList = await getEstimateData();
    const procuredList = await getProcuredData();
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

) => {

  const estimateAndProduction = await Farm.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('farmer.total_estimated_cotton')), 'estimate'],
      [Sequelize.fn('SUM', Sequelize.col('farmer.agri_estimated_prod')), 'production']
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
    group: ['season.id']
  });

  return estimateAndProduction;

};

const getProcuredData = async (

) => {

  const result = await Transaction.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.literal('CAST(qty_purchased  as numeric)')), 'procured']
    ],
    include: [{
      model: Season,
      as: 'season',
      attributes: ['id', 'name']
    }],
    group: ['season.id']
  });

  return result;

};


const getProcuredProcessed = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const procuredList = await getProcuredData();
    const processedList = await getProcessedData();
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

) => {

  const result = await GinProcess.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.literal('total_qty')), 'processed']
    ],
    include: [{
      model: Season,
      as: 'season',
      attributes: ['id', 'name']
    }],
    group: ['season.id']
  });

  return result;

};


const getProcuredProcessedMonthly = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const procuredList = await getProcuredDataByMonth();
    const processedList = await getProcessedDataByMonth();
    const data = getProcuredProcessedMonthlyRes(
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

const getProcuredDataByMonth = async (

) => {

  const result = await Transaction.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.literal('CAST(qty_purchased  as numeric)')), 'procured'],
      [Sequelize.literal("date_part('Month', date)"), 'month']
    ],
    group: ['month']
  });

  return result;

};


const getProcessedDataByMonth = async (

) => {

  const result = await GinProcess.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.literal('total_qty')), 'processed'],
      [Sequelize.literal("date_part('Month', date)"), 'month']
    ],
    group: ['month']
  });

  return result;

};



const getProcuredProcessedMonthlyRes = (
  processedList: any,
  procuredList: any
) => {
  let monthList: number[] = [];

  processedList.forEach((processed: any) => {
    if (processed.dataValues.month)
      monthList.push(processed.dataValues.month);
  });

  procuredList.forEach((procured: any) => {
    if (!monthList.includes(procured.dataValues.month))
      monthList.push(procured.dataValues.month);
  });

  monthList = monthList.sort((a, b) => a - b);

  let month: string[] = [];
  let processed: number[] = [];
  let procured: number[] = [];

  for (const sessionId of monthList) {
    const fProcessed = processedList.find((processed: any) =>
      processed.dataValues.month == sessionId
    );
    const fProcured = procuredList.find((procured: any) =>
      procured.dataValues.month == sessionId
    );
    let data = {
      getMonthName: '',
      processed: 0,
      procured: 0
    };

    if (fProcessed) {
      data.getMonthName = getMonthName(fProcessed.dataValues.month);
      data.processed += formatNumber(fProcessed.dataValues.processed);
    }

    if (fProcured) {
      data.getMonthName = getMonthName(fProcured.dataValues.month);
      data.procured += formatNumber(fProcured.dataValues.procured);
    }

    month.push(data.getMonthName);
    processed.push(data.processed);
    procured.push(data.procured);

  }

  return {
    month,
    processed,
    procured
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
  return monthNames[month - 1];
};

export {
  getCountryEstimateAndProduction,
  getEstimateAndProcured,
  getProcuredProcessed,
  getProcuredProcessedMonthly
};