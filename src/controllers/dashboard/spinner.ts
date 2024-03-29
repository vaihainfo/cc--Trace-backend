import { Request, Response } from "express";
import { Sequelize } from "sequelize";
import * as yup from 'yup';
import GinSales from "../../models/gin-sales.model";
import Season from "../../models/season.model";
import SpinProcess from "../../models/spin-process.model";
import Ginner from "../../models/ginner.model";
import Spinner from "../../models/spinner.model";
import SpinSales from "../../models/spin-sales.model";
import Knitter from "../../models/knitter.model";
import Weaver from "../../models/weaver.model";
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
      spinner
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
    await validator.validate(spinner);
    const user = (req as any).user
    if(user?.role == 3 && user?._id){
      brand = user._id
    }
    return {
      program,
      brand,
      season,
      country,
      state,
      district,
      spinner
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



const getTopFabric = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const where = getSpinnerProcessWhereQuery(reqData);
    const spinnersData = await getTopFabricData(where);
    const data = getTopFabricRes(spinnersData);
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};


const getTopFabricRes = (
  list: any[]
) => {
  const name: string[] = [];
  const count: number[] = [];
  for (const row of list) {
    if (row.dataValues) {
      name.push(row.dataValues.name ?? '-');
      count.push(formatNumber(row.dataValues.total));
    }
  }

  return {
    name,
    count
  };
};

const getTopFabricData = async (
  where: any
) => {

  const result = await SpinSales.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('total_qty')), 'total'],
      [Sequelize.literal(`case 
        when knitter.id is not null 
          then knitter.name 
        when weaver.id is not null 
          then weaver.name 
        else processor_name end`), 'name']
    ],
    include: [{
      model: Spinner,
      as: 'spinner',
      attributes: []
    }, {
      model: Knitter,
      as: 'knitter',
      attributes: []
    }, {
      model: Weaver,
      as: 'weaver',
      attributes: []
    }],
    where,
    order: [['total', 'desc']],
    limit: 10,
    group: ['knitter.id', 'weaver.id', 'processor_name',]
  });

  return result;

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

  if (reqData?.spinner)
    where['$buyerdata.id$'] = reqData.spinner;


  return where;
};

const getTopGinnersData = async (
  where: any
) => {

  const result = await GinSales.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('gin_sales.total_qty')), 'total'],
      [Sequelize.col('ginner.name'), 'ginnerName']
    ],
    include: [{
      model: Ginner,
      as: 'ginner',
      attributes: []
    },  {
      model: Spinner,
      as: 'buyerdata',
      attributes: []
    }],
    where,
    order: [['total', 'desc']],
    limit: 10,
    group: [ 'ginner.id']
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

  if (reqData?.spinner)
    where['$spinner.id$'] = reqData.spinner;

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

  seasonIds = seasonIds.sort((a, b) => a - b).slice(-3);

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
    order: [['seasonId', 'desc']],
    limit: 3,
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
    order: [['seasonId', 'desc']],
    limit: 3,
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

  for (const procuredSold of procuredSoldData.reverse()) {

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
    order: [['seasonId', 'desc']],
    limit: 3,
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
      [Sequelize.literal("date_part('Month', date)"), 'month'],
      [Sequelize.literal("date_part('Year', date)"), 'year'],
    ],
    include: [{
      model: Spinner,
      as: 'buyerdata',
      attributes: []
    }],
    where,
    group: ['month', 'year']
  });

  return result;

};


const getLintProcessedDataByMonth = async (
  where: any
) => {

  const result = await SpinProcess.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('total_qty')), 'lintProcessed'],
      [Sequelize.literal("date_part('Month', date)"), 'month'],
      [Sequelize.literal("date_part('Year', date)"), 'year'],
    ],
    include: [{
      model: Spinner,
      as: 'spinner',
      attributes: []
    }],
    where,
    group: ['month', 'year']
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
      [Sequelize.literal("date_part('Year', date)"), 'year'],
    ],
    include: [{
      model: Spinner,
      as: 'spinner',
      attributes: []
    }],
    where,
    group: ['month', 'year']
  });

  return result;

};

const getDataAll = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const where: any = {};
    if (reqData.season)
      where['id'] = reqData.season;

    const seasonOne = await Season.findOne({
      order: [
        ['id', 'DESC']
      ],
      where
    });
    reqData.season = seasonOne.id;
    const ginSaleWhere = getGinnerSalesWhereQuery(reqData);
    const spinProcessWhere = getSpinnerProcessWhereQuery(reqData);
    const lintProcuredData = await getLintProcuredDataByMonth(ginSaleWhere);
    const lintSoldData = await getLintProcessedDataByMonth(spinProcessWhere);
    const yarnProcuredSoldData = await getYarnProcuredSoldDataByMonth(spinProcessWhere);
    const data = getDataAllRes(
      lintProcuredData,
      lintSoldData,
      yarnProcuredSoldData,
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


const getDataAllRes = (
  lintProcuredData: any[],
  lintSoldData: any[],
  yarnProcuredSoldData: any[],
  season: any
) => {
  const monthList = getMonthDate(season.from, season.to);

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
      (production.dataValues.month - 1) == month.month &&
      production.dataValues.year == month.year
    );
    const fSold = lintSoldData.find((estimate: any) =>
      (estimate.dataValues.month - 1) == month.month &&
      estimate.dataValues.year == month.year
    );
    const fProcuredSold = yarnProcuredSoldData.find((procuredSold: any) =>
      (procuredSold.dataValues.month - 1) == month.month &&
      procuredSold.dataValues.year == month.year
    );

    let data = {
      lintProcured: 0,
      lintProcessed: 0,
      yarnProcured: 0,
      yarnSold: 0
    };
    if (fProcured) {
      data.lintProcured = formatNumber(fProcured.dataValues.lintProcured);
    }

    if (fSold) {
      data.lintProcessed = formatNumber(fSold.dataValues.lintProcessed);
    }
    if (fProcuredSold) {
      data.yarnSold = formatNumber(fProcuredSold.dataValues.yarnSold);
      data.yarnProcured = formatNumber(fProcuredSold.dataValues.yarnProcured);
    }

    res.month.push(getMonthName(month.month));
    res.lintProcured.push(data.lintProcured);
    res.lintProcessed.push(data.lintProcessed);
    res.yarnProcured.push(data.yarnSold);
    res.yarnSold.push(data.yarnProcured);

  }

  return res;

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
  while (end.diff(start, 'days') > 0  ) {
    monthList.push({
      month: start.month(),
      year: start.year()
    });
    start = start.add(1, 'month');
  }
  return monthList;
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
  getTopGinners,
  getLintProcuredProcessed,
  getYarnProcuredSold,
  getDataAll,
  getTopFabric
};