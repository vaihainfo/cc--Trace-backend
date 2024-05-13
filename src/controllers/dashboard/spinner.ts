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
import YarnCount from "../../models/yarn-count.model";

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
      spinner,
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
    await validator.validate(spinner);
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
      spinner,
      fromDate,
      toDate
    };

  } catch (error: any) {
    throw {
      errCode: "REQ_ERROR"
    };
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
      [Op.contains]: Sequelize.literal(`ARRAY [${reqData.brand}]`)
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

  if (reqData?.fromDate)
    where.date = { [Op.gte]: reqData.fromDate };

  if (reqData?.toDate)
    where.date = { [Op.lt]: reqData.toDate };

  if (reqData?.fromDate && reqData?.toDate)
    where.date = { [Op.between]: [reqData.fromDate, reqData.toDate] };


  return where;
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
      [Op.contains]: Sequelize.literal(`ARRAY [${reqData.brand}]`)
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

  if (reqData?.fromDate)
    where.date = { [Op.gte]: reqData.fromDate };

  if (reqData?.toDate)
    where.date = { [Op.lt]: reqData.toDate };

  if (reqData?.fromDate && reqData?.toDate)
    where.date = { [Op.between]: [reqData.fromDate, reqData.toDate] };

  return where;
};


const getSpinnerSalesWhereQuery = (
  reqData: any
) => {
  const where: any = {
    status: "Sold"
  };

  if (reqData?.program)
    where.program_id = reqData.program;

  if (reqData?.brand)
    where['$spinner.brand$'] = {
      [Op.contains]: Sequelize.literal(`ARRAY [${reqData.brand}]`)
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

  if (reqData?.fromDate)
    where.date = { [Op.gte]: reqData.fromDate };

  if (reqData?.toDate)
    where.date = { [Op.lt]: reqData.toDate };

  if (reqData?.fromDate && reqData?.toDate)
    where.date = { [Op.between]: [reqData.fromDate, reqData.toDate] };


  return where;
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
    if (row.dataValues && row.dataValues.name && name.length < 10) {
      name.push(row.dataValues.name);
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
    limit: 15,
    group: ['knitter.id', 'weaver.id', 'processor_name',]
  });

  return result;

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
    }, {
      model: Spinner,
      as: 'buyerdata',
      attributes: []
    }],
    where,
    order: [['total', 'desc']],
    limit: 10,
    group: ['ginner.id']
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
    const procuredData = await getYarnProcuredData(where);
    const soldData = await getYarnSoldData(where);
    const data = getYarnProcuredSoldRes(
      procuredData,
      soldData
    );
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};


const getYarnProcuredSoldRes = (
  procuredData: any[],
  soldData: any[]
) => {
  let seasonIds: number[] = [];

  procuredData.forEach((procured: any) => {
    if (procured.dataValues.seasonId)
      seasonIds.push(procured.dataValues.seasonId);
  });

  soldData.forEach((sold: any) => {
    if (!seasonIds.includes(sold.dataValues.seasonId))
      seasonIds.push(sold.dataValues.seasonId);
  });

  seasonIds = seasonIds.sort((a, b) => a - b).slice(-3);

  let season: any = [];
  let yarnProcured: any = [];
  let yarnSold: any = [];

  for (const sessionId of seasonIds) {
    const fProcured = procuredData.find((procured: any) =>
      procured.dataValues.seasonId == sessionId
    );
    const fSold = soldData.find((sold: any) =>
      sold.dataValues.seasonId == sessionId
    );
    let data = {
      seasonName: '',
      yarnProcured: 0,
      yarnSold: 0
    };
    if (fProcured) {
      data.seasonName = fProcured.dataValues.seasonName;
      data.yarnProcured = formatNumber(fProcured.dataValues.yarnProcured);
    }

    if (fSold) {
      data.seasonName = fSold.dataValues.seasonName;
      data.yarnSold = formatNumber(fSold.dataValues.yarnSold);
    }

    season.push(data.seasonName);
    yarnProcured.push(data.yarnProcured);
    yarnSold.push(data.yarnSold);
  }

  return {
    season,
    yarnProcured,
    yarnSold
  };
};



const getYarnSoldData = async (
  where: any
) => {

  const result = await SpinSales.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('total_qty')), 'yarnSold'],
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

const getYarnProcuredData = async (
  where: any
) => {

  const result = await SpinProcess.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('net_yarn_qty')), 'yarnProcured'],
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


const getYarnSoldDataByMonth = async (
  where: any
) => {

  const result = await SpinSales.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('total_qty')), 'yarnSold'],
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

const getYarnProcuredDataByMonth = async (
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
    const seasonOne = await Season.findOne({
      where: {
        id: reqData.season ? reqData.season : '9'
      }
    });
    reqData.season = seasonOne.id;
    const ginSaleWhere = getGinnerSalesWhereQuery(reqData);
    const spinProcessWhere = getSpinnerProcessWhereQuery(reqData);
    const lintProcuredData = await getLintProcuredDataByMonth(ginSaleWhere);
    const lintSoldData = await getLintProcessedDataByMonth(spinProcessWhere);
    const yarnProcuredSoldData = await getYarnProcuredDataByMonth(spinProcessWhere);
    const yarnSoldData = await getYarnSoldDataByMonth(spinProcessWhere);
    const data = getDataAllRes(
      lintProcuredData,
      lintSoldData,
      yarnProcuredSoldData,
      yarnSoldData,
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
  yarnSoldData: any[],
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
    const fYarnProcured = yarnProcuredSoldData.find((procured: any) =>
      (procured.dataValues.month - 1) == month.month &&
      procured.dataValues.year == month.year
    );

    const fYarnSold = yarnSoldData.find((sold: any) =>
      (sold.dataValues.month - 1) == month.month &&
      sold.dataValues.year == month.year
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
    if (fYarnProcured) {
      data.yarnProcured = formatNumber(fYarnProcured.dataValues.yarnProcured);
    }

    if (fYarnSold) {
      data.yarnSold = formatNumber(fYarnSold.dataValues.yarnSold);
    }

    res.month.push(getMonthName(month.month));
    res.lintProcured.push(data.lintProcured);
    res.lintProcessed.push(data.lintProcessed);
    res.yarnProcured.push(data.yarnProcured);
    res.yarnSold.push(data.yarnSold);

  }

  return res;

};



const getTopYarnCount = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const where = getSpinnerSalesWhereQuery(reqData);
    const spinnersData = await getTopYarnCountData(where);
    const data = getTopYarnCountRes(spinnersData);
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};

const getTopYarnCountRes = (
  list: any[]
) => {
  const name: string[] = [];
  const count: number[] = [];
  for (const row of list) {
    if (row.dataValues && row.dataValues.buyerName) {
      name.push(row.dataValues.buyerName);
      count.push(formatNumber(row.dataValues.qty));
    }
  }

  return {
    name,
    count
  };
};

const getTopYarnCountData = async (
  where: any
) => {

  const result = await SpinSales.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('total_qty')), 'qty'],
      [Sequelize.col('yarncount.yarnCount_name'), 'buyerName']
    ],
    include: [{
      model: YarnCount,
      as: 'yarncount',
      attributes: [],
      on: Sequelize.where(
        Sequelize.literal('Array[yarncount.id]'),
        {
          [Op.contained]: Sequelize.col('spin_sales.yarn_count'),
        }
      ),
    }, {
      model: Spinner,
      as: 'spinner',
      attributes: []
    }],
    where,
    order: [['qty', 'desc']],
    limit: 10,
    group: ['buyerName']
  });

  return result;

};


const getYarnType = async (
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
    const saleWhere = getSpinnerSalesWhereQuery(reqData);
    const spinnersData = await getYarnTypeData(saleWhere);
    const data = getYarnTypeRes(spinnersData, seasonOne);
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};


const getYarnTypeRes = (
  spinnersSalesData: any[],
  season: any
) => {
  const monthList = getMonthDate(season.from, season.to);
  const yarnTypes: string[] = [];
  spinnersSalesData.forEach(salesData => {
    if (!yarnTypes.includes(salesData.dataValues.yarnType))
      yarnTypes.push(salesData.dataValues.yarnType);
  });
  const res: any = {
    month: [],
    dataList: yarnTypes.map(yarnType => {
      return {
        type: 'column',
        showInLegend: true,
        name: yarnType,
        data: [],
      };
    }),
  };

  for (const month of monthList) {
    const fSalesData = spinnersSalesData.filter((salesData: any) =>
      (salesData.dataValues.month - 1) == month.month &&
      salesData.dataValues.year == month.year
    );
    if (fSalesData.length) {
      for (const yarnData of res.dataList) {
        let qty = 0;
        const fYarnType = fSalesData.find(((salesData: any) =>
          salesData.dataValues.yarnType == yarnData.name
        ));

        if (fYarnType)
          qty = formatNumber(fYarnType.dataValues.qty);
        yarnData.data.push(qty);
      }
      res.month.push(getMonthName(month.month));

    }
  }

  return res;

};


const getYarnTypeData = async (
  where: any
) => {

  const result = await SpinSales.findAll({
    attributes: [
      [Sequelize.literal('unnest(spin_sales.yarn_type)'), 'yarnType'],
      [Sequelize.fn('SUM', Sequelize.col('total_qty')), 'qty'],
      [Sequelize.literal("date_part('Month', date)"), 'month'],
      [Sequelize.literal("date_part('Year', date)"), 'year'],
    ],
    include: [{
      model: Spinner,
      as: 'spinner',
      attributes: []
    }],
    where,
    order: [['qty', 'desc']],
    limit: 10,
    group: [
      Sequelize.literal('unnest(spin_sales.yarn_type)'),
      'month',
      'year'
    ]
  });

  return result;

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
  getTopFabric,
  getTopYarnCount,
  getYarnType
};