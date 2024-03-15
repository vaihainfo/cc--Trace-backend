import { Request, Response } from "express";
import { Sequelize } from "sequelize";
import * as yup from 'yup';
import GinSales from "../../models/gin-sales.model";
import Season from "../../models/season.model";
import SpinProcess from "../../models/spin-process.model";
import Ginner from "../../models/ginner.model";
import Spinner from "../../models/spinner.model";
import { Op } from "sequelize";

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
    if (!season) {
      const seasonOne = await Season.findOne({
        order: [
          ['id', 'DESC']
        ]
      });
      season = seasonOne.id;
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
    };

  } catch (error: any) {
    throw {
      errCode: "REQ_ERROR"
    };
  }
};

const formatNumber = (data: string): number => {
  return Number(Number(data ?? 0).toFixed(2));
};

const getTopGinners = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const where = getGinnerSalesWhereQuery(reqData);
    const ginnersData = await getTopGinnersData(where);
    const data = getTopGinnersRes(ginnersData);
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};

const getGinnerSalesWhereQuery = (
  reqData: any
) => {
  const where: any = {
    status: "Sold"
  };

  if (reqData?.program)
    where.program_id = reqData.program;

  if (reqData?.brand)
    where['$buyerdata.brand$'] = {
      [Op.contains]: Sequelize.literal(`ARRAY [${ reqData.brand }]`)
    };

  if (reqData?.season)
    where.season_id = reqData.season;

  if (reqData?.country)
    where['$buyerdata.country_id$'] = reqData.country;

  if (reqData?.state)
    where['$buyerdata.state_id$'] = reqData.state;

  if (reqData?.district)
    where['$buyerdata.district_id$'] = reqData.district;

  // if (reqData?.block)
  //   where.block_id = reqData.block;

  // if (reqData?.village)
  //   where.village_id = reqData.village;


  return where;
};

const getTopGinnersData = async (
  where: any
) => {

  const result = await GinSales.findAll({
    attributes: [
      [Sequelize.fn('COUNT', Sequelize.col('gin_sales.id')), 'total'],
      [Sequelize.col('season.name'), 'seasonName'],
      [Sequelize.col('ginner.name'), 'ginnerName']
    ],
    include: [{
      model: Ginner,
      as: 'ginner',
      attributes: []
    }, {
      model: Season,
      as: 'season',
      attributes: []
    }, {
      model: Spinner,
      as: 'buyerdata',
      attributes: []
    }],
    where,
    group: ['season.id', 'ginner.id']
  });

  return result;

};

const getTopGinnersRes = (
  list: any[]
) => {
  const ginners: string[] = [];
  const count: number[] = [];
  for (const row of list) {
    if (row.dataValues) {
      ginners.push(row.dataValues.ginnerName);
      count.push(formatNumber(row.dataValues.total));
    }
  }

  return {
    ginners,
    count
  };
};


const getLintProcuredProcessed = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const ginSaleWhere = getGinnerSalesWhereQuery(reqData);
    const spinProcessWhere = getSpinnerProcessWhereQuery(reqData);
    const lintProcuredData = await getLintProcuredData(ginSaleWhere);
    const lintProcessedData = await getLintProcessedData(spinProcessWhere);
    const data = getLintProcuredProcessedRes(
      lintProcuredData,
      lintProcessedData
    );
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};


const getSpinnerProcessWhereQuery = (
  reqData: any
) => {
  const where: any = {
    status: "Sold"
  };

  if (reqData?.program)
    where.program_id = reqData.program;

  if (reqData?.brand)
    where['$spinner.brand$'] = {
      [Op.contains]: Sequelize.literal(`ARRAY [${ reqData.brand }]`)
    };

  if (reqData?.season)
    where.season_id = reqData.season;

  if (reqData?.country)
    where['$spinner.country_id$'] = reqData.country;

  if (reqData?.state)
    where['$spinner.state_id$'] = reqData.state;

  if (reqData?.district)
    where['$spinner.district_id$'] = reqData.district;

  // if (reqData?.block)
  //   where.block_id = reqData.block;

  // if (reqData?.village)
  //   where.village_id = reqData.village;


  return where;
};

const getLintProcuredProcessedRes = (
  lintProcuredList: any[],
  lintProcessedList: any[]
) => {
  let seasonIds: number[] = [];

  lintProcuredList.forEach((procured: any) => {
    if (procured.dataValues.seasonId)
      seasonIds.push(procured.dataValues.seasonId);
  });

  lintProcessedList.forEach((processed: any) => {
    if (!seasonIds.includes(processed.dataValues.seasonId))
      seasonIds.push(processed.dataValues.seasonId);
  });

  seasonIds = seasonIds.sort((a, b) => a - b);

  let season: any = [];
  let lintProcured: any = [];
  let lintProcessed: any = [];

  for (const sessionId of seasonIds) {
    const fProcured = lintProcuredList.find((production: any) =>
      production.dataValues.seasonId == sessionId
    );
    const fProcessed = lintProcessedList.find((estimate: any) =>
      estimate.dataValues.seasonId == sessionId
    );
    let data = {
      seasonName: '',
      lintProcured: 0,
      lintProcessed: 0
    };
    if (fProcured) {
      data.seasonName = fProcured.dataValues.seasonName;
      data.lintProcured = formatNumber(fProcured.dataValues.lintProcured);
    }

    if (fProcessed) {
      data.seasonName = fProcessed.dataValues.seasonName;
      data.lintProcessed = formatNumber(fProcessed.dataValues.lintProcessed);
    }

    season.push(data.seasonName);
    lintProcured.push(data.lintProcured);
    lintProcessed.push(data.lintProcessed);

  }

  return {
    season,
    lintProcured,
    lintProcessed
  };
};


const getLintProcuredData = async (
  where: any
) => {

  const result = await GinSales.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('total_qty')), 'lintProcured'],
      [Sequelize.col('season.name'), 'seasonName'],
      [Sequelize.col('season.id'), 'seasonId']
    ],
    include: [{
      model: Season,
      as: 'season',
      attributes: []
    }, {
      model: Spinner,
      as: 'buyerdata',
      attributes: []
    }],
    where,
    group: ['season.id']
  });

  return result;

};

const getLintProcessedData = async (
  where: any
) => {

  const result = await SpinProcess.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('total_qty')), 'lintProcessed'],
      [Sequelize.col('season.name'), 'seasonName'],
      [Sequelize.col('season.id'), 'seasonId']
    ],
    include: [{
      model: Season,
      as: 'season',
      attributes: []
    }, {
      model: Spinner,
      as: 'spinner',
      attributes: []
    }],
    where,
    group: ['season.id']
  });

  return result;

};


const getYarnProcuredSold = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const where = getSpinnerProcessWhereQuery(reqData);
    const procuredSoldData = await getYarnProcuredSoldData(where);
    const data = getYarnProcuredSoldRes(procuredSoldData);
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};

const getYarnProcuredSoldRes = (
  procuredSoldData: any[]
) => {

  let season: any = [];
  let yarnProcured: any = [];
  let yarnSold: any = [];

  for (const procuredSold of procuredSoldData) {

    season.push(procuredSold.dataValues.seasonName);
    yarnProcured.push(formatNumber(procuredSold.dataValues.yarnProcured));
    yarnSold.push(formatNumber(procuredSold.dataValues.yarnSold));
  }

  return {
    season,
    yarnProcured,
    yarnSold
  };

};

const getYarnProcuredSoldData = async (
  where: any
) => {

  const result = await SpinProcess.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('net_yarn_qty')), 'yarnProcured'],
      [Sequelize.literal('sum(net_yarn_qty) - sum(qty_stock)'), 'yarnSold'],
      [Sequelize.col('season.name'), 'seasonName'],
      [Sequelize.col('season.id'), 'seasonId']
    ],
    include: [{
      model: Season,
      as: 'season',
      attributes: []
    }, {
      model: Spinner,
      as: 'spinner',
      attributes: []
    }],
    where,
    group: ['season.id']
  });

  return result;

};


const getLintProcuredDataByMonth = async (
  where: any
) => {

  const result = await GinSales.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('total_qty')), 'lintProcured'],
      [Sequelize.literal("date_part('Month', date)"), 'month']
    ],
    include: [{
      model: Spinner,
      as: 'buyerdata',
      attributes: []
    }],
    where,
    group: ['month']
  });

  return result;

};


const getLintProcessedDataByMonth = async (
  where: any
) => {

  const result = await SpinProcess.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('total_qty')), 'lintProcessed'],
      [Sequelize.literal("date_part('Month', date)"), 'month']
    ],
    include: [{
      model: Spinner,
      as: 'spinner',
      attributes: []
    }],
    where,
    group: ['month']
  });

  return result;

};

const getYarnProcuredSoldDataByMonth = async (
  where: any
) => {

  const result = await SpinProcess.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('net_yarn_qty')), 'yarnProcured'],
      [Sequelize.literal('sum(net_yarn_qty) - sum(qty_stock)'), 'yarnSold'],
      [Sequelize.literal("date_part('Month', date)"), 'month'],
    ],
    include: [{
      model: Spinner,
      as: 'spinner',
      attributes: []
    }],
    where,
    group: ['month']
  });

  return result;

};

const getDataAll = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const ginSaleWhere = getGinnerSalesWhereQuery(reqData);
    const spinProcessWhere = getSpinnerProcessWhereQuery(reqData);
    const lintProcuredData = await getLintProcuredDataByMonth(ginSaleWhere);
    const lintSoldData = await getLintProcessedDataByMonth(spinProcessWhere);
    const yarnProcuredSoldData = await getYarnProcuredSoldDataByMonth(spinProcessWhere);
    const data = getDataAllRes(
      lintProcuredData,
      lintSoldData,
      yarnProcuredSoldData
    );
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};


const getDataAllRes = (
  lintProcuredData: any[],
  lintSoldData: any[],
  yarnProcuredSoldData: any[],
) => {
  let monthList: number[] = [];

  lintProcuredData.forEach((procured: any) => {
    if (procured.dataValues.month)
      monthList.push(procured.dataValues.month);
  });

  lintSoldData.forEach((sold: any) => {
    if (!monthList.includes(sold.dataValues.month))
      monthList.push(sold.dataValues.month);
  });

  yarnProcuredSoldData.forEach((procuredSold: any) => {
    if (!monthList.includes(procuredSold.dataValues.month))
      monthList.push(procuredSold.dataValues.month);
  });

  monthList = monthList.sort((a, b) => a - b);

  const res: {
    [key: string]: Array<string | number>;
  } = {
    month: [],
    lintProcured: [],
    lintProcessed: [],
    yarnProcured: [],
    yarnSold: []
  };

  for (const month of monthList) {
    const fProcured = lintProcuredData.find((production: any) =>
      production.dataValues.month == month
    );
    const fSold = lintSoldData.find((estimate: any) =>
      estimate.dataValues.month == month
    );
    const fProcuredSold = yarnProcuredSoldData.find((procuredSold: any) =>
      procuredSold.dataValues.month == month
    );

    let data = {
      month: '',
      lintProcured: 0,
      lintProcessed: 0,
      yarnProcured: 0,
      yarnSold: 0
    };
    if (fProcured) {
      data.month = getMonthName(fProcured.dataValues.month);
      data.lintProcured = formatNumber(fProcured.dataValues.lintProcured);
    }

    if (fSold) {
      data.month = getMonthName(fSold.dataValues.month);
      data.lintProcessed = formatNumber(fSold.dataValues.lintProcessed);
    }
    if (fProcuredSold) {
      data.month = getMonthName(fProcuredSold.dataValues.month);
      data.yarnSold = formatNumber(fProcuredSold.dataValues.yarnSold);
      data.yarnProcured = formatNumber(fProcuredSold.dataValues.yarnProcured);
    }

    res.month.push(data.month);
    res.lintProcured.push(data.lintProcured);
    res.lintProcessed.push(data.lintProcessed);
    res.yarnProcured.push(data.yarnSold);
    res.yarnSold.push(data.yarnProcured);

  }

  return res;

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
  getTopGinners,
  getLintProcuredProcessed,
  getYarnProcuredSold,
  getDataAll
};