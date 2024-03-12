import { Request, Response } from "express";
import { Op, QueryTypes, Sequelize } from "sequelize";
import * as yup from 'yup';
import sequelize from "../../util/dbConn";
import GinSales from "../../models/gin-sales.model";
import Spinner from "../../models/spinner.model";
import Season from "../../models/season.model";
import Transaction from "../../models/transaction.model";
import GinProcess from "../../models/gin-process.model";
import Ginner from "../../models/ginner.model";
import GinBale from "../../models/gin-bale.model";

const getTopVillages = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const villagesData = await getTopVillagesData(reqData);
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
  // where.status = "Sold";

  if (reqData?.program)
    where.program_id = reqData.program;

  if (reqData?.season)
    where.season_id = reqData.season;

  if (reqData?.country)
    where['$ginner.country_id$'] = reqData.country;

  if (reqData?.state)
    where['$ginner.state_id$'] = reqData.state;

  if (reqData?.district)
    where['$ginner.district_id$'] = reqData.district;

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

  if (reqData?.season)
    where.season_id = reqData.season;

  if (reqData?.country)
    where.country_id = reqData.country;

  if (reqData?.state)
    where.state_id = reqData.state;

  if (reqData?.district)
    where.district_id = reqData.district;

  return where;
};


const getTopVillagesData = async (
  reqData: any
) => {

  const whereList: string[] = [];

  if (reqData?.program)
    whereList.push('gp.program_id = ' + reqData.program);

  if (reqData?.season)
    whereList.push('gp.season_id = ' + reqData.season);

  if (reqData?.country)
    whereList.push('gi.country_id = ' + reqData.country);

  if (reqData?.state)
    whereList.push('gi.state_id = ' + reqData.state);

  if (reqData?.district)
    whereList.push('gi.district_id = ' + reqData.district);

  let where: string | null = null;

  if (whereList.length)
    where = whereList.join(' AND ');

  const result = await sequelize.query(`
    select vl.id           as "villageId",
           vl.village_name as "villageName",
           count(gp.id)    as "total",
           se.id           as "seasonId",
           se.name         as "seasonName"
    from gin_processes gp
          left join seasons se on se.id = gp.season_id
          left join "gin-bales" gb on gb.process_id = gp.id
          left join cotton_selections cs on cs.process_id = gp.id
          left join transactions tr on tr.id = cs.transaction_id
          left join villages vl on tr.village_id = vl.id
          left join ginners gi on gp.ginner_id = gi.id
    ${ where ? Sequelize.literal('where ' + where) : '' }
    group by vl.id, se.id
    limit 10
    `, { type: QueryTypes.SELECT });


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

const getTopVillagesRes = (
  list: any[]
) => {
  const village: string[] = [];
  const count: number[] = [];
  for (const row of list) {
    if (row) {
      village.push(row.villageName);
      count.push(formatNumber(row.total));
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
      [Sequelize.fn('COUNT', Sequelize.col('gin_sales.id')), 'total'],
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
    const procuredProcessedData = await getProcuredProcessedData(transactionWhere);
    const data = getProcuredProcessedRes(procuredProcessedData);
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};


const getProcuredProcessedRes = (
  list: any[]
) => {
  const season: string[] = [];
  const stock: number[] = [];
  const procured: number[] = [];
  for (const row of list) {
    if (row.dataValues) {
      season.push(row.dataValues.seasonName);
      stock.push(formatNumber(row.dataValues.stock));
      procured.push(formatNumber(row.dataValues.procured));
    }
  }

  return {
    season,
    procured,
    stock
  };
};


const getProcuredProcessedData = async (
  where: any
) => {

  const result = await Transaction.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('qty_stock')), 'stock'],
      [Sequelize.fn('SUM', Sequelize.literal('CAST(qty_purchased  as numeric)')), 'procured'],
      [Sequelize.col('season.name'), 'seasonName'],
      [Sequelize.col('season.id'), 'seasonId']
    ],
    include: [{
      model: Season,
      as: 'season',
      attributes: []
    }],
    where,
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
    const data = getLintProcuredSoldRes(
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

const getLintProcuredSoldRes = (
  procuredList: any[],
  soldList: any[]
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

  seasonIds = seasonIds.sort((a, b) => a - b);

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
      [Sequelize.literal("date_part('Month', date)"), 'month']
    ],
    include: [{
      model: Ginner,
      as: 'ginner',
      attributes: []
    }],
    where: where,
    group: ['month']
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
      [Sequelize.literal("date_part('Month', date)"), 'month']
    ],
    include: [{
      model: Ginner,
      as: 'ginner',
      attributes: []
    }],
    where,
    group: ['month']
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
    ],
    include: [],
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
    const where = getOverAllDataQuery(reqData);
    const transactionWhere = getTransactionDataQuery(reqData);
    const procuredData = await getLintProcuredDataByMonth(where);
    const soldData = await getLintSoldDataByMonth(where);
    const procuredProcessedData = await getProcuredProcessedDataByMonth(transactionWhere);
    const data = getDataAllRes(
      procuredData,
      soldData,
      procuredProcessedData
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
) => {
  let monthList: number[] = [];

  procuredList.forEach((procured: any) => {
    if (procured.dataValues.month)
      monthList.push(procured.dataValues.month);
  });

  soldList.forEach((sold: any) => {
    if (!monthList.includes(sold.dataValues.month))
      monthList.push(sold.dataValues.month);
  });

  cottonList.forEach((cotton: any) => {
    if (!monthList.includes(cotton.dataValues.month))
      monthList.push(cotton.dataValues.month);
  });

  monthList = monthList.sort((a, b) => a - b);

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
      production.dataValues.month == month
    );
    const fSold = soldList.find((estimate: any) =>
      estimate.dataValues.month == month
    );
    const fCotton = cottonList.find((cotton: any) =>
      cotton.dataValues.month == month
    );

    let data = {
      month: '',
      procured: 0,
      sold: 0,
      cottonProcured: 0,
      cottonStock: 0
    };
    if (fProcured) {
      data.month = getMonthName(fProcured.dataValues.month);
      data.procured = formatNumber(fProcured.dataValues.procured);
    }

    if (fSold) {
      data.month = getMonthName(fSold.dataValues.month);
      data.sold = formatNumber(fSold.dataValues.procured);
    }
    if (fCotton) {
      data.month = getMonthName(fCotton.dataValues.month);
      data.cottonStock = (formatNumber(fCotton.dataValues.stock));
      data.cottonProcured = (formatNumber(fCotton.dataValues.procured));
    }

    res.month.push(data.month);
    res.procured.push(data.procured);
    res.sold.push(data.sold);
    res.cottonStock.push(data.cottonStock);
    res.cottonProcured.push(data.cottonProcured);

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
  getTopVillages,
  getTopSpinners,
  getProcuredProcessed,
  getLintProcuredSold,
  getDataAll
};