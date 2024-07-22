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
import GinBale from "../../models/gin-bale.model";
import BaleSelection from "../../models/bale-selection.model";
import Country from "../../models/country.model";
import GinnerExpectedCotton from "../../models/ginner-expected-cotton.model";

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


const getGinnerAllocationQuery = (
  reqData: any
) => {
  const where: any = {

  };
  if (reqData?.program)
    where.program_id = reqData.program;

  if (reqData?.brand)
    where['$ginner_expected_cotton.brand$'] = {
      [Op.contains]: Sequelize.literal(`ARRAY [${reqData.brand}]`)
    };

  if (reqData?.season)
    where.season_id = reqData.season;

  if (reqData?.country)
    where['$ginner_expected_cotton.country_id$'] = reqData.country;

  if (reqData?.state)
    where['$ginner_expected_cotton.state_id$'] = reqData.state;

  if (reqData?.district)
    where['$ginner_expected_cotton.district_id$'] = reqData.district;

  if (reqData?.ginner)
    where['$ginner_expected_cotton.id$'] = reqData.ginner;

  if (reqData?.fromDate)
    where.upload_date = { [Op.gte]: reqData.fromDate };

  if (reqData?.toDate)
    where.upload_date = { [Op.lt]: reqData.toDate };

  if (reqData?.fromDate && reqData?.toDate)
    where.upload_date = { [Op.between]: [reqData.fromDate, reqData.toDate] };

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



const getGinBaleQuery = (
  reqData: any
) => {
  const where: any = {

  };

  //where['$ginprocess.status$'] = "Sold";
  if (reqData?.program)
    where['$ginprocess.program_id$'] = reqData.program;

  if (reqData?.brand)
    where['$ginprocess.ginner.brand$'] = {
      [Op.contains]: Sequelize.literal(`ARRAY [${reqData.brand}]`)
    };

  if (reqData?.season)
    where['$ginprocess.season_id$'] = reqData.season;
  else
    where['$ginprocess.season_id$'] = {
      [Op.not]: null,
    };

  if (reqData?.country)
    where['$ginprocess.ginner.country_id$'] = reqData.country;

  if (reqData?.state)
    where['$ginprocess.ginner.state_id$'] = reqData.state;

  if (reqData?.district)
    where['$ginprocess.ginner.district_id$'] = reqData.district;

  if (reqData?.ginner)
    where['$ginprocess.ginner.id$'] = reqData.ginner;

  if (reqData?.fromDate)
    where['$ginprocess.date$'] = { [Op.gte]: reqData.fromDate };

  if (reqData?.toDate)
    where['$ginprocess.date$'] = { [Op.lt]: reqData.toDate };

  if (reqData?.fromDate && reqData?.toDate)
    where['$ginprocess.date$'] = { [Op.between]: [reqData.fromDate, reqData.toDate] };

  return where;
};


const getBaleSelectionQuery = (
  reqData: any
) => {
  const where: any = {

  };
  where['$sales.status$'] = "Sold";
  if (reqData?.program)
    where['$sales.program_id$'] = reqData.program;

  if (reqData?.brand)
    where['$sales.ginner.brand$'] = {
      [Op.contains]: Sequelize.literal(`ARRAY [${reqData.brand}]`)
    };

  if (reqData?.season)
    where['$sales.season_id$'] = reqData.season;
  else
    where['$sales.season_id$'] = {
      [Op.not]: null,
    };
  if (reqData?.country)
    where['$sales.ginner.country_id$'] = reqData.country;

  if (reqData?.state)
    where['$sales.ginner.state_id$'] = reqData.state;

  if (reqData?.district)
    where['$sales.ginner.district_id$'] = reqData.district;

  if (reqData?.ginner)
    where['$sales.ginner.id$'] = reqData.ginner;

  if (reqData?.fromDate)
    where['$sales.date$'] = { [Op.gte]: reqData.fromDate };

  if (reqData?.toDate)
    where['$sales.date$'] = { [Op.lt]: reqData.toDate };

  if (reqData?.fromDate && reqData?.toDate)
    where['$sales.date$'] = { [Op.between]: [reqData.fromDate, reqData.toDate] };

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
      count.push(mtConversion(row.dataValues.total));
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
      // [Sequelize.col('season.name'), 'seasonName'],
      [Sequelize.col('buyerdata.name'), 'spinnerName']
    ],
    include: [{
      model: Spinner,
      as: 'buyerdata',
      attributes: []
    }, {
      model: Ginner,
      as: 'ginner',
      attributes: []
    }
      // {
      //   model: Season,
      //   as: 'season',
      //   attributes: []
      // },
    ],
    where,
    order: [['total', 'desc']],
    limit: 10,
    //group: ['season.id', 'buyerdata.id']
    group: ['buyerdata.id']
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
      count.push(mtConversion(row.dataValues.total));
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
      data.procured = mtConversion(fProcured.dataValues.procured);
    }

    if (fProcessed) {
      data.seasonName = fProcessed.dataValues.seasonName;
      data.processed = mtConversion(fProcessed.dataValues.processed);
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
  where.status = 'Sold';
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
    const procuredWhere = await getGinBaleQuery(reqData);
    const baleSel = getBaleSelectionQuery(reqData);
    const procuredData = await getBaleProcuredData(procuredWhere);
    const soldData = await getBaleSoldData(baleSel);
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
  let stock: any = [];

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
      sold: 0,
      stock: 0,
    };
    if (fProcured) {
      data.seasonName = fProcured.dataValues.seasonName;
      data.procured = mtConversion(fProcured.dataValues.lintProcured);
    }

    if (fSold) {
      data.seasonName = fSold.dataValues.seasonName;
      data.sold = mtConversion(fSold.dataValues.lintSold);
    }

    data.stock = data.procured > data.sold ? Number((data.procured - data.sold).toFixed(2)) : 0;

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
    stock.push(data.stock);
  }

  return {
    season,
    procured,
    sold,
    stock
  };

};


const getLintProcuredDataByMonth = async (
  where: any
) => {

  const result = await GinBale.findAll({
    attributes: [
      [
        sequelize.fn(
          "COUNT",
          Sequelize.literal('DISTINCT "gin-bales"."id"')
        ),
        "procured",
      ],
      [
        sequelize.fn(
          "COALESCE",
          sequelize.fn(
            "SUM",
            sequelize.literal(
              'CAST("gin-bales"."weight" AS DOUBLE PRECISION)'
            )
          ),
          0
        ),
        "lintProcured",
      ],
      [Sequelize.literal("date_part('Month', ginprocess.date)"), 'month'],
      [Sequelize.literal("date_part('Year', ginprocess.date)"), 'year']
    ],
    include: [
      {
        model: GinProcess,
        as: "ginprocess",
        attributes: [],
        include: [{
          model: Season,
          as: 'season',
          attributes: []
        }, {
          model: Ginner,
          as: 'ginner',
          attributes: []
        }],
      },
    ],
    where,
    group: ['month', 'year']
  });
  return result;

};


const getLintSoldDataByMonth = async (
  where: any
) => {
  const result = await BaleSelection.findAll({
    attributes: [
      [
        sequelize.fn(
          "COALESCE",
          sequelize.fn(
            "SUM",
            sequelize.literal(
              'CAST("bale"."weight" AS DOUBLE PRECISION)'
            )
          ),
          0
        ),
        "lintSold",
      ],
      [
        sequelize.fn("COUNT", Sequelize.literal("DISTINCT bale_id")),
        "sold",
      ],
      [Sequelize.literal("date_part('Month', sales.date)"), 'month'],
      [Sequelize.literal("date_part('Year', sales.date)"), 'year']
    ],
    include: [
      {
        model: GinSales,
        as: "sales",
        attributes: [],
        include: [{
          model: Season,
          as: 'season',
          attributes: []
        }, {
          model: Ginner,
          as: 'ginner',
          attributes: []
        }
        ],
      },
      {
        model: GinBale,
        as: "bale",
        attributes: [],
      },
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
      [Sequelize.fn('SUM', Sequelize.col('total_qty')), 'processed'],
      [Sequelize.literal("date_part('Month', date)"), 'month'],
      [Sequelize.literal("date_part('Year', date)"), 'year']
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
    group: ['month', 'year']
  });

  return result;

};

const getProcuredDataByMonth = async (
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
    const procuredWhere = await getGinBaleQuery(reqData); //yes
    const baleSel = getBaleSelectionQuery(reqData);
    const transactionWhere = getTransactionDataQuery(reqData);
    const processedWhere = getOverAllDataQuery(reqData); //yes
    const procuredData = await getLintProcuredDataByMonth(procuredWhere); //yes
    const processedData = await getProcessedDataByMonth(processedWhere); //yes
    const soldData = await getLintSoldDataByMonth(baleSel);
    const procuredProcessedData = await getProcuredDataByMonth(transactionWhere); 

    const data = getDataAllRes(
      procuredData, //yes
      soldData,
      procuredProcessedData,
      processedData,//yes
      seasonOne//yes
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
  processedList: any[],
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

    const fProcessed = processedList.find((cotton: any) =>
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
      data.procured = mtConversion(fProcured.dataValues.lintProcured);
    }
    if (fProcessed) {
      data.cottonStock = mtConversion(fProcessed.dataValues.processed);
    }

    if (fSold) {
      data.sold = mtConversion(fSold.dataValues.lintSold);
    }
    if (fCotton) {
      data.cottonProcured = (mtConversion(fCotton.dataValues.procured));
    }

    res.month.push(getMonthName(month.month));
    res.procured.push(data.procured);
    res.sold.push(data.sold);
    res.cottonStock.push(data.cottonStock);
    res.cottonProcured.push(data.cottonProcured);

  }

  return res;

};

const getBaleComparison = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const ginBale = getGinBaleQuery(reqData);
    const baleSel = getBaleSelectionQuery(reqData);
    const procuredData = await getBaleProcuredData(ginBale);
    const soldData = await getBaleSoldData(baleSel);
    const data = await getBaleComparisonRes(
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


const getBaleProcuredData = async (
  where: any
) => {

  const result = await GinBale.findAll({
    attributes: [
      [
        sequelize.fn(
          "COUNT",
          Sequelize.literal('DISTINCT "gin-bales"."id"')
        ),
        "procured",
      ],
      [
        sequelize.fn(
          "COALESCE",
          sequelize.fn(
            "SUM",
            sequelize.literal(
              'CAST("gin-bales"."weight" AS DOUBLE PRECISION)'
            )
          ),
          0
        ),
        "lintProcured",
      ],
      [Sequelize.col('ginprocess.season.name'), 'seasonName'],
      [Sequelize.col('ginprocess.season.id'), 'seasonId']
    ],
    include: [
      {
        model: GinProcess,
        as: "ginprocess",
        attributes: [],
        include: [{
          model: Season,
          as: 'season',
          attributes: []
        }, {
          model: Ginner,
          as: 'ginner',
          attributes: []
        }],
      },
    ],
    where,
    limit: 3,
    order: [['seasonId', 'desc']],
    group: ["ginprocess.season.id"],
  });
  return result;

};



const getBaleSoldData = async (
  where: any
) => {
  const result = await BaleSelection.findAll({
    attributes: [
      [
        sequelize.fn(
          "COALESCE",
          sequelize.fn(
            "SUM",
            sequelize.literal(
              'CAST("bale"."weight" AS DOUBLE PRECISION)'
            )
          ),
          0
        ),
        "lintSold",
      ],
      [
        sequelize.fn("COUNT", Sequelize.literal("DISTINCT bale_id")),
        "sold",
      ],
      [Sequelize.col('sales.season.name'), 'seasonName'],
      [Sequelize.col('sales.season.id'), 'seasonId']
    ],
    include: [
      {
        model: GinSales,
        as: "sales",
        attributes: [],
        include: [{
          model: Season,
          as: 'season',
          attributes: []
        }, {
          model: Ginner,
          as: 'ginner',
          attributes: []
        }
        ],
      },
      {
        model: GinBale,
        as: "bale",
        attributes: [],
      },
    ],
    where,
    limit: 3,
    order: [['seasonId', 'desc']],
    group: ["sales.season.id"],
  });

  return result;

};


const getBaleComparisonRes = async (
  procuredData: any[],
  soldData: any[],
  reqSeason: any
) => {
  let seasonIds: number[] = [];

  procuredData.forEach((procured: any) => {
    if (procured.dataValues.seasonId)
      seasonIds.push(procured.dataValues.seasonId);
  });

  soldData.forEach((processed: any) => {
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
  let sold: any = [];
  let stock: any = [];

  for (const sessionId of seasonIds) {
    const fProcured = procuredData.find((production: any) =>
      production.dataValues.seasonId == sessionId
    );
    const fSold = soldData.find((processed: any) =>
      processed.dataValues.seasonId == sessionId
    );
    let data = {
      seasonName: '',
      procured: 0,
      sold: 0,
      stock: 0
    };
    if (fProcured) {
      data.seasonName = fProcured.dataValues.seasonName;
      data.procured = formatNumber(fProcured.dataValues.procured);
    }

    if (fSold) {
      data.seasonName = fSold.dataValues.seasonName;
      data.sold = formatNumber(fSold.dataValues.sold);
    }

    data.stock =
      data.procured > data.sold
        ? Number((data.procured - data.sold).toFixed(2))
        : 0;
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
    stock.push(data.stock);
    sold.push(data.sold);

  }

  return {
    season,
    procured,
    stock,
    sold
  };
};


const getLintProcessedTopGinners = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const ginnersData = await getLintProcessedTopGinnersData(reqData);
    const data = getTopGinnersRes(ginnersData);
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};

const getLintProcessedTopGinnersData = async (
  reqData: any
) => {
  const where: any = {

  };

  if (reqData?.country)
    where['$ginprocess.ginner.country_id$'] = reqData.country;

  where['$ginprocess.ginner.name$'] = {
    [Op.not]: null
  };

  const result = await GinBale.findAll({
    attributes: [
      [
        sequelize.fn(
          "COALESCE",
          sequelize.fn(
            "SUM",
            sequelize.literal(
              'CAST("gin-bales"."weight" AS DOUBLE PRECISION)'
            )
          ),
          0
        ),
        "total",
      ],
      [Sequelize.col('ginprocess.ginner.name'), 'ginnerName']
    ],
    include: [
      {
        model: GinProcess,
        as: "ginprocess",
        attributes: [],
        include: [{
          model: Ginner,
          as: 'ginner',
          attributes: []
        }],
      },
    ],
    where,
    limit: 10,
    order: [['total', 'desc']],
    group: ["ginprocess.ginner.id"],
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
      count.push(mtConversion(row.dataValues.total));
    }
  }

  return {
    ginners,
    count
  };
};

const getLintSoldTopGinners = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const ginnersData = await getLintSoldTopGinnersData(reqData);
    const data = getTopGinnersRes(ginnersData);
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};

const getLintSoldTopGinnersData = async (
  reqData: any
) => {
  const where: any = {
  };

  if (reqData?.country)
    where['$sales.ginner.country_id$'] = reqData.country;

  where['$sales.ginner.name$'] = {
    [Op.not]: null
  };

  const result = await BaleSelection.findAll({
    attributes: [
      [
        sequelize.fn(
          "COALESCE",
          sequelize.fn(
            "SUM",
            sequelize.literal(
              'CAST("bale"."weight" AS DOUBLE PRECISION)'
            )
          ),
          0
        ),
        "total",
      ],
      [Sequelize.col('sales.ginner.name'), 'ginnerName']
    ],
    include: [
      {
        model: GinSales,
        as: "sales",
        attributes: [],
        include: [{
          model: Ginner,
          as: 'ginner',
          attributes: [],
        }
        ],
      },
      {
        model: GinBale,
        as: "bale",
        attributes: [],
      },
    ],
    where,
    order: [['total', 'desc']],
    limit: 10,
    group: ["sales.ginner.id"],
  });

  return result;

};

const getLintStockTopGinners = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const ginnersData = await getLintStockTopGinnersData(reqData);
    const data = getLintStockTopGinnersRes(ginnersData);
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};

const getLintStockTopGinnersData = async (
  reqData: any
) => {


  const [result] = await sequelize.query(`
      select  g.name                                  as "ginnerName",
              sum(gp.total_qty) - sum(gs.no_of_bales) as total
      from public.ginners g
        left join public.gin_processes gp on g.id = gp.ginner_id
        left join public.gin_sales gs on g.id = gs.ginner_id
      where g.name is not null ${reqData?.country ? " and g.country_id = reqData?.country" : ""}
      group by g.id
      order by total DESC nulls last
      limit 10;
    `);

  return result;

};

const getLintStockTopGinnersRes = (
  list: any[]
) => {
  const ginners: string[] = [];
  const count: number[] = [];
  for (const row of list) {
    if (row) {
      ginners.push(row.ginnerName);
      count.push(mtConversion(row.total));
    }
  }
  return {
    ginners,
    count
  };
};

const getLintProcessedByCountry = async (
  req: Request, res: Response
) => {
  try {

    const reqData = await getQueryParams(req, res);
    const where = getGinBaleQuery(reqData);
    const processedList = await getBaleProcuredByCountryData(where);
    const data = await getLintProcessedRes(processedList, reqData.season);
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};

const getLintProcessedRes = async (
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
    const lProcessedList = processedList.filter((list: any) =>
      list.dataValues.countryName == countryName
    );

    for (const seasonId of seasonIds) {

      let totalArea = 0;
      const gProcessedValue = lProcessedList.find((list: any) =>
        list.dataValues.seasonId == seasonId
      );

      if (gProcessedValue) {
        totalArea = mtConversion(gProcessedValue.dataValues.lintProcured);
        if (!seasonList.includes(gProcessedValue.dataValues.seasonName))
          seasonList.push(gProcessedValue.dataValues.seasonName);
      } else {
        seasons.forEach((season: any) => {
          if (season.id == seasonId && !seasonList.includes(season.seasonName)) {
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


const getLintSoldByCountry = async (
  req: Request, res: Response
) => {
  try {

    const reqData = await getQueryParams(req, res);
    const where = getBaleSelectionQuery(reqData);
    const soldList = await getBaleSoldByCountryData(where);
    const data = await getLintSoldRes(soldList, reqData.season);
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};

const getLintSoldRes = async (
  soldList: any = [],
  reqSeason: any
) => {
  let seasonIds: number[] = [];
  let countries: number[] = [];

  soldList.forEach((list: any) => {
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
    const lSoldList = soldList.filter((list: any) =>
      list.dataValues.countryName == countryName
    );

    for (const seasonId of seasonIds) {

      let totalArea = 0;
      const gSoldValue = lSoldList.find((list: any) =>
        list.dataValues.seasonId == seasonId
      );

      if (gSoldValue) {
        totalArea = mtConversion(gSoldValue.dataValues.lintSold);
        if (!seasonList.includes(gSoldValue.dataValues.seasonName))
          seasonList.push(gSoldValue.dataValues.seasonName);
      } else {
        seasons.forEach((season: any) => {
          if (season.id == seasonId && !seasonList.includes(season.seasonName)) {
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


const getProcuredAllocated = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const where = getOverAllDataQuery(reqData);
    const allocationWhere = getGinnerAllocationQuery(reqData);
    const procuredData = await getProcuredProcessedData(where);
    const allocatedData = await getAllocatedData(allocationWhere);
    const data = await getProcuredAllocatedRes(
      procuredData,
      allocatedData,
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

const getAllocatedData = async (
  where: any
) => {

  const result = await GinnerExpectedCotton.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.literal('CAST(expected_seed_cotton  as numeric)')), 'allocated'],
      [Sequelize.col('season.name'), 'seasonName'],
      [Sequelize.col('season.id'), 'seasonId']
    ],
    include: [{
      model: Season,
      as: 'season',
      attributes: []
    }, {
      model: Ginner,
      as: 'ginner_expected_cotton',
      attributes: []
    }],
    where,
    order: [['seasonId', 'desc']],
    limit: 3,
    group: ['season.id']
  });

  return result;

};

const getProcuredAllocatedRes = async (
  procuredData: any[],
  allocatedData: any[],
  reqSeason: any
) => {
  let seasonIds: number[] = [];

  procuredData.forEach((procured: any) => {
    if (procured.dataValues.seasonId)
      seasonIds.push(procured.dataValues.seasonId);
  });

  allocatedData.forEach((processed: any) => {
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
  let allocated: any = [];

  for (const sessionId of seasonIds) {
    const gProcured = procuredData.find((production: any) =>
      production.dataValues.seasonId == sessionId
    );
    const gAllocated = allocatedData.find((processed: any) =>
      processed.dataValues.seasonId == sessionId
    );
    let data = {
      seasonName: '',
      procured: 0,
      allocated: 0
    };
    if (gProcured) {
      data.seasonName = gProcured.dataValues.seasonName;
      data.procured = mtConversion(gProcured.dataValues.procured);
    }

    if (gAllocated) {
      data.seasonName = gAllocated.dataValues.seasonName;
      data.allocated = mtConversion(gAllocated.dataValues.allocated);
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
    allocated.push(data.allocated);

  }

  return {
    season,
    procured,
    allocated
  };
};

const getCountryGinnerArea = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const query = getOverAllDataQuery(reqData);
    const ginnersData = await getGinnerCountryData(query);
    const data = await getOutturnCountryRes(ginnersData, reqData.season);
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};

const getGinnerCountryData = async (where: any) => {
  const result = await GinProcess.findAll({
    attributes: [
      [sequelize.fn('AVG', sequelize.col('gin_out_turn')), 'outTurn'],
      [sequelize.col('ginner.country.county_name'), 'countryName'],
      [sequelize.col('ginner.country.id'), 'countryId'],
      [sequelize.col('season.id'), 'seasonId'],
      [sequelize.col('season.name'), 'seasonName']
    ],
    include: [
      {
        model: Ginner,
        as: "ginner",
        include: [
          {
            model: Country,
            attributes: [],
            as: "country"
          }
        ],
        attributes: []
      },
      {
        model: Season,
        attributes: [],
        as: "season"
      }
    ],
    where,
    group: ['ginner.country.id', 'season.id'],
    order: [[sequelize.col('season.id'), 'DESC']]
  });

  return result;
};


const getOutturnCountryRes = async (
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
  let countList: any[] = [];


  for (const countryName of countries) {
    const data: any = {
      name: countryName,
      data: [],
    };
    const lProcessedList = processedList.filter((list: any) =>
      list.dataValues.countryName == countryName
    );

    for (const seasonId of seasonIds) {

      let totalArea = 0;
      const gProcessedValue = lProcessedList.find((list: any) =>
        list.dataValues.seasonId == seasonId
      );

      if (gProcessedValue) {
        totalArea = formatNumber(gProcessedValue.dataValues.outTurn);
        if (!seasonList.includes(gProcessedValue.dataValues.seasonName))
          seasonList.push(gProcessedValue.dataValues.seasonName);
      } else {
        seasons.forEach((season: any) => {
          if (season.id == seasonId) {
            seasonList.push(season.name);
          }
        });
      }
      data.data.push(totalArea);
    }

    countList.push(data);
  }

  return {
    countList,
    seasonList,
  };
};

const mtConversion = (value: number) => {
  return value > 0 ? Number((value / 1000).toFixed(2)) : 0
}

const getProcuredByCountry = async (
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

const getProcessedByCountry = async (
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



const getBalesProcuredByCountry = async (
  req: Request, res: Response
) => {
  try {

    const reqData = await getQueryParams(req, res);
    const where = getGinBaleQuery(reqData);
    const processedData = await getBaleProcuredByCountryData(where);
    const data = await getBalesProcuredByCountryDataRes(processedData, reqData.season);
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};


const getBalesProcuredByCountryDataRes = async (
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

    processedList.push(data);
  }

  return {
    processedList,
    seasonList,
  };
};

const getBaleProcuredByCountryData = async (where: any) => {
  const result = await GinBale.findAll({
    attributes: [
      [
        sequelize.fn(
          "COALESCE",
          sequelize.fn(
            "SUM",
            sequelize.literal(
              'CAST("gin-bales"."weight" AS DOUBLE PRECISION)'
            )
          ),
          0
        ),
        "lintProcured",
      ],
      [sequelize.fn("COUNT", Sequelize.literal('DISTINCT "gin-bales"."id"')), "procured"],
      [Sequelize.col('ginprocess.season.name'), 'seasonName'],
      [Sequelize.col('ginprocess.season.id'), 'seasonId'],
      [Sequelize.col('ginprocess.ginner.country.id'), 'countryId'],
      [Sequelize.col('ginprocess.ginner.country.county_name'), 'countryName']
    ],
    include: [
      {
        model: GinProcess,
        as: "ginprocess",
        attributes: [],
        include: [{
          model: Season,
          as: 'season',
          attributes: []
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
      },
    ],
    where,
    order: [['seasonId', 'desc']],
    group: ["ginprocess.season.id", "ginprocess.ginner.country.id"],
  });
  return result;
};


const getBalesSoldByCountry = async (
  req: Request, res: Response
) => {
  try {

    const reqData = await getQueryParams(req, res);
    const where = getBaleSelectionQuery(reqData);
    const processedData = await getBaleSoldByCountryData(where);
    const data = await getBaleSoldByCountryRes(processedData, reqData.season);
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};


const getBaleSoldByCountryRes = async (
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
        farmerCount = mtConversion(fFarmerValue.dataValues.sold);
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

const getBaleSoldByCountryData = async (
  where: any
) => {
  const result = await BaleSelection.findAll({
    attributes: [
      [
        sequelize.fn(
          "COALESCE",
          sequelize.fn(
            "SUM",
            sequelize.literal(
              'CAST("bale"."weight" AS DOUBLE PRECISION)'
            )
          ),
          0
        ),
        "lintSold",
      ],
      [sequelize.fn("COUNT", Sequelize.literal("DISTINCT bale_id")), "sold"],
      [Sequelize.col('sales.season.name'), 'seasonName'],
      [Sequelize.col('sales.season.id'), 'seasonId'],
      [Sequelize.col('sales.ginner.country.id'), 'countryId'],
      [Sequelize.col('sales.ginner.country.county_name'), 'countryName']
    ],
    include: [
      {
        model: GinSales,
        as: "sales",
        attributes: [],
        include: [{
          model: Season,
          as: 'season',
          attributes: []
        }, {
          model: Ginner,
          as: 'ginner',
          attributes: [],
          include: [{
            model: Country,
            as: 'country',
            attributes: []
          }]
        }
        ],
      },
      {
        model: GinBale,
        as: "bale",
        attributes: [],
      },
    ],
    where,
    order: [['seasonId', 'desc']],
    group: ["sales.season.id", "sales.ginner.country.id"],
  });

  return result;

};

const getBalesStockByCountry = async (
  req: Request, res: Response
) => {
  try {

    const reqData = await getQueryParams(req, res);
    const processWhere = getGinBaleQuery(reqData);
    const processedData = await getBaleProcuredByCountryData(processWhere);
    const soldWhere = getBaleSelectionQuery(reqData);
    const soldData = await getBaleSoldByCountryData(soldWhere);
    const data = await getBaleStockDataRes(
      processedData,
      soldData,
      reqData.season,
    );
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};

const getBaleStockDataRes = async (
  processedCountList: any[],
  soldCountList: any[],
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

  soldCountList.forEach((list: any) => {
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
  let soldList: any[] = [];




  for (const countryName of countries) {
    const data: any = {
      name: countryName,
      data: [],
    };
    const fProcuredList = processedCountList.filter((list: any) =>
      list.dataValues.countryName == countryName
    );
    const fSoldList = soldCountList.filter((list: any) =>
      list.dataValues.countryName == countryName
    );


    for (const seasonId of seasonIds) {

      let farmerCount = {
        procured: 0,
        sold: 0,
      };
      const fProcuredValue = fProcuredList.find((list: any) =>
        list.dataValues.seasonId == seasonId
      );
      const fSoldValue = fSoldList.find((list: any) =>
        list.dataValues.seasonId == seasonId
      );
      if (fProcuredValue) {
        farmerCount.procured = mtConversion(fProcuredValue.dataValues.procured);
        if (!seasonList.includes(fProcuredValue.dataValues.seasonName))
          seasonList.push(fProcuredValue.dataValues.seasonName);
      }

      if (fSoldValue) {
        farmerCount.sold = mtConversion(fSoldValue.dataValues.sold);
        if (!seasonList.includes(fSoldValue.dataValues.seasonName))
          seasonList.push(fSoldValue.dataValues.seasonName);
      }
      if (!fSoldValue && !fProcuredValue) {
        seasons.forEach((season: any) => {
          if (season.id == seasonId && !seasonList.includes(season.seasonName)) {
            seasonList.push(season.name);
          }
        });
      }

      data.data.push(farmerCount.procured > farmerCount.sold ? Number((farmerCount.procured - farmerCount.sold).toFixed(2)) : 0);
    }

    soldList.push(data);
  }

  return {
    processedList: soldList,
    seasonList,
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
  getDataAll,
  getBaleComparison,
  getLintProcessedTopGinners,
  getLintSoldTopGinners,
  getLintStockTopGinners,
  getProcuredAllocated,
  getLintProcessedByCountry,
  getLintSoldByCountry,
  getCountryGinnerArea,
  getProcuredByCountry,
  getProcessedByCountry,
  getBalesProcuredByCountry,
  getBalesSoldByCountry,
  getBalesStockByCountry
};