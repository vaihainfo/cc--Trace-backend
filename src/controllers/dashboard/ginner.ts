import { Request, Response } from "express";
import moment from 'moment';
import { Op, QueryTypes, Sequelize } from "sequelize";
import * as yup from 'yup';
import sequelize from "../../util/dbConn";
import GinSales from "../../models/gin-sales.model";
import Spinner from "../../models/spinner.model";
import Season from "../../models/season.model";
import Transaction from "../../models/transaction.model";
import GinProcess from "../../models/gin-process.model";
import Ginner from "../../models/ginner.model";
import Village from "../../models/village.model";

const getTopVillages = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const where = getTransactionDataQuery(reqData);
    const villagesData = await getTopVillagesData(where);
    const data = getTopVillagesRes(villagesData);
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};


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


const getTransactionDataQuery = (
  reqData: any
) => {
  const where: any = {

  };
  where.status = "Sold";

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

  if (reqData?.block)
    where.block_id = reqData.block;

  if (reqData?.village)
    where.village_id = reqData.village;

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


const getTopVillagesData = async (
  where: any
) => {

  const result = await Transaction.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.literal('CAST(qty_purchased  as numeric)')), 'total'],
      [Sequelize.col('village.village_name'), 'villageName'],
      [Sequelize.col('village.id'), 'villageId']
    ],
    include: [{
      model: Ginner,
      as: 'ginner',
      attributes: []
    }, {
      model: Village,
      as: 'village',
      attributes: []
    }],
    where,
    order: [['total', 'desc']],
    limit: 10,
    group: ['village.id']
  });

  return result;

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

const formatNumber = (data: string): number => {
  return Number(Number(data ?? 0).toFixed(2));
};

const getTopVillagesRes = (
  list: any[]
) => {
  const village: string[] = [];
  const count: number[] = [];
  for (const row of list) {
    if (row) {
      village.push(row.dataValues.villageName);
      count.push(formatNumber(row.dataValues.total));
    }
  }

  return {
    village,
    count
  };
};

const getTopSpinners = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const where = getOverAllDataQuery(reqData);
    const spinnersData = await getTopSpinnersData(where);
    const data = getTopSpinnersRes(spinnersData);
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};

const getTopSpinnersData = async (
  where: any
) => {

  const result = await GinSales.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('gin_sales.total_qty')), 'total'],
      [Sequelize.col('season.name'), 'seasonName'],
      [Sequelize.col('buyerdata.name'), 'spinnerName']
    ],
    include: [{
      model: Spinner,
      as: 'buyerdata',
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
    order: [['total', 'desc']],
    limit: 10,
    group: ['season.id', 'buyerdata.id']
  });

  return result;

};

const getTopSpinnersRes = (
  list: any[]
) => {
  const spinners: string[] = [];
  const count: number[] = [];
  for (const row of list) {
    if (row.dataValues) {
      spinners.push(row.dataValues.spinnerName);
      count.push(formatNumber(row.dataValues.total));
    }
  }

  return {
    spinners,
    count
  };
};


const getProcuredProcessed = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const transactionWhere = getTransactionDataQuery(reqData);
    const ginnerWhere = getOverAllDataQuery(reqData);
    const procuredData = await getProcuredProcessedData(transactionWhere);
    const processedData = await getLintProcessedData(ginnerWhere);
    const data = await getProcuredProcessedRes(
      procuredData,
      processedData,
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


const getProcuredProcessedRes = async (
  procuredData: any[],
  processedData: any[],
  reqSeason: any
) => {
  let seasonIds: number[] = [];

  procuredData.forEach((procured: any) => {
    if (procured.dataValues.seasonId)
      seasonIds.push(procured.dataValues.seasonId);
  });

  processedData.forEach((processed: any) => {
    if (!seasonIds.includes(processed.dataValues.seasonId))
      seasonIds.push(processed.dataValues.seasonId);
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

  let season: any = [];
  let procured: any = [];
  let stock: any = [];

  for (const sessionId of seasonIds) {
    const fProcured = procuredData.find((production: any) =>
      production.dataValues.seasonId == sessionId
    );
    const fProcessed = processedData.find((processed: any) =>
      processed.dataValues.seasonId == sessionId
    );
    let data = {
      seasonName: '',
      procured: 0,
      processed: 0
    };
    if (fProcured) {
      data.seasonName = fProcured.dataValues.seasonName;
      data.procured = formatNumber(fProcured.dataValues.procured);
    }

    if (fProcessed) {
      data.seasonName = fProcessed.dataValues.seasonName;
      data.processed = formatNumber(fProcessed.dataValues.processed);
    }

    if (!data.seasonName) {
      const fSeason = seasons.find((season: any) =>
        season.id == sessionId
      );
      if (fSeason) {
        data.seasonName = fSeason.name;
      }
    }

    season.push(data.seasonName);
    procured.push(data.procured);
    stock.push(data.processed);

  }

  return {
    season,
    procured,
    stock
  };
};



const getLintProcessedData = async (
  where: any
) => {

  const result = await GinProcess.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('total_qty')), 'processed'],
      [Sequelize.col('season.name'), 'seasonName'],
      [Sequelize.col('season.id'), 'seasonId']
    ],
    include: [{
      model: Season,
      as: 'season',
      attributes: []
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


const getProcuredProcessedData = async (
  where: any
) => {

  const result = await Transaction.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.literal('CAST(qty_purchased  as numeric)')), 'procured'],
      [Sequelize.col('season.name'), 'seasonName'],
      [Sequelize.col('season.id'), 'seasonId']
    ],
    include: [{
      model: Season,
      as: 'season',
      attributes: []
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


const getLintProcuredSold = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const where = getOverAllDataQuery(reqData);
    const procuredData = await getLintProcuredData(where);
    const soldData = await getLintSoldData(where);
    const data = await getLintProcuredSoldRes(
      procuredData,
      soldData,
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

const getLintProcuredSoldRes = async (
  procuredList: any[],
  soldList: any[],
  reqSeason: any
) => {
  let seasonIds: number[] = [];

  procuredList.forEach((procured: any) => {
    if (procured.dataValues.seasonId)
      seasonIds.push(procured.dataValues.seasonId);
  });

  soldList.forEach((sold: any) => {
    if (!seasonIds.includes(sold.dataValues.seasonId))
      seasonIds.push(sold.dataValues.seasonId);
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

  let season: any = [];
  let procured: any = [];
  let sold: any = [];

  for (const sessionId of seasonIds) {
    const fProcured = procuredList.find((production: any) =>
      production.dataValues.seasonId == sessionId
    );
    const fSold = soldList.find((estimate: any) =>
      estimate.dataValues.seasonId == sessionId
    );
    let data = {
      seasonName: '',
      procured: 0,
      sold: 0
    };
    if (fProcured) {
      data.seasonName = fProcured.dataValues.seasonName;
      data.procured = formatNumber(fProcured.dataValues.procured);
    }

    if (fSold) {
      data.seasonName = fSold.dataValues.seasonName;
      data.sold = formatNumber(fSold.dataValues.sold);
    }

    if (!data.seasonName) {
      const fSeason = seasons.find((season: any) =>
        season.id == sessionId
      );
      if (fSeason) {
        data.seasonName = fSeason.name;
      }
    }

    season.push(data.seasonName);
    procured.push(data.procured);
    sold.push(data.sold);

  }

  return {
    season,
    procured,
    sold
  };

};

const getLintSoldData = async (
  where: any
) => {
  where.status = "Sold";
  const result = await GinSales.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('no_of_bales')), 'sold'],
      [Sequelize.col('season.name'), 'seasonName'],
      [Sequelize.col('season.id'), 'seasonId']
    ],
    include: [{
      model: Season,
      as: 'season',
      attributes: []
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

const getLintProcuredData = async (
  where: any
) => {

  const result = await GinProcess.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('no_of_bales')), 'procured'],
      [Sequelize.col('season.name'), 'seasonName'],
      [Sequelize.col('season.id'), 'seasonId']
    ],
    include: [{
      model: Season,
      as: 'season',
      attributes: []
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


const getLintProcuredDataByMonth = async (
  where: any
) => {

  const result = await GinProcess.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('no_of_bales')), 'procured'],
      [Sequelize.literal("date_part('Month', date)"), 'month'],
      [Sequelize.literal("date_part('Year', date)"), 'year']
    ],
    include: [{
      model: Ginner,
      as: 'ginner',
      attributes: []
    }],
    where: where,
    group: ['month', 'year']
  });

  return result;

};


const getLintSoldDataByMonth = async (
  where: any
) => {
  where.status = "Sold";
  const result = await GinSales.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('no_of_bales')), 'procured'],
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

const getProcuredProcessedDataByMonth = async (
  where: any
) => {

  const result = await Transaction.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('qty_stock')), 'stock'],
      [Sequelize.fn('SUM', Sequelize.literal('CAST(qty_purchased  as numeric)')), 'procured'],
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
    const query = getOverAllDataQuery(reqData);
    const transactionWhere = getTransactionDataQuery(reqData);
    const procuredData = await getLintProcuredDataByMonth(query);
    const soldData = await getLintSoldDataByMonth(query);
    const procuredProcessedData = await getProcuredProcessedDataByMonth(transactionWhere);
    const data = getDataAllRes(
      procuredData,
      soldData,
      procuredProcessedData,
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
  procuredList: any[],
  soldList: any[],
  cottonList: any[],
  season: any
) => {
  const monthList = getMonthDate(season.from, season.to);


  const res: {
    [key: string]: Array<string | number>;
  } = {
    month: [],
    procured: [],
    sold: [],
    cottonProcured: [],
    cottonStock: []
  };

  for (const month of monthList) {
    const fProcured = procuredList.find((production: any) =>
      (production.dataValues.month - 1) == month.month &&
      production.dataValues.year == month.year
    );
    const fSold = soldList.find((estimate: any) =>
      (estimate.dataValues.month - 1) == month.month &&
      estimate.dataValues.year == month.year
    );
    const fCotton = cottonList.find((cotton: any) =>
      (cotton.dataValues.month - 1) == month.month &&
      cotton.dataValues.year == month.year
    );

    let data = {
      procured: 0,
      sold: 0,
      cottonProcured: 0,
      cottonStock: 0
    };
    if (fProcured) {
      data.procured = formatNumber(fProcured.dataValues.procured);
    }

    if (fSold) {
      data.sold = formatNumber(fSold.dataValues.procured);
    }
    if (fCotton) {
      data.cottonStock = (formatNumber(fCotton.dataValues.stock));
      data.cottonProcured = (formatNumber(fCotton.dataValues.procured));
    }

    res.month.push(getMonthName(month.month));
    res.procured.push(data.procured);
    res.sold.push(data.sold);
    res.cottonStock.push(data.cottonStock);
    res.cottonProcured.push(data.cottonProcured);

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
  getTopVillages,
  getTopSpinners,
  getProcuredProcessed,
  getLintProcuredSold,
  getDataAll
};