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
  const where = [];

  if (reqData?.program)
    where.push(`gv.program_id IN (${reqData.program})`)

  if (reqData?.brand)
      where.push(`g.brand && ARRAY[${reqData.brand}]`)

  if (reqData?.season) {
    if (Array.isArray(reqData.season)) {
      where.push(`gv.season_id IN (${reqData.season.join(',')})`)
    } else {
      where.push(`gv.season_id IN (${reqData.season})`)
    }
  } else {
    where.push(`gv.season_id IS NOT NULL`)
  }
  
  if (reqData?.country)
    where.push(`g.country_id IN (${reqData.country})`)

  if (reqData?.state)
    where.push(`g.state_id IN (${reqData.state})`);

  if (reqData?.district)
    where.push(`g.district_id IN (${reqData.district})`);

  if (reqData?.ginner)
    where.push(`gv.ginner_id IN (${reqData?.ginner})`);

  if (reqData?.fromDate)
    where.push(`"gv"."createdAt" >= ${reqData.fromDate}`);

  if (reqData?.toDate)
    where.push(`"gv"."createdAt" < ${reqData.toDate}`);

  if (reqData?.fromDate && reqData?.toDate)
    where.push(`"gv"."createdAt" BETWEEN '${reqData.fromDate}' AND '${reqData.toDate}'`);

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
    where.brand_id = reqData.brand;

  // if (reqData?.brand)
  //   where.brand_id = reqData.brand;


  if (reqData?.season) {
    if (Array.isArray(reqData.season)) {
      where.season_id = {
        [Op.in]: reqData.season
      };
    } else {
      where.season_id = reqData.season;
    }
  }

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

  if (reqData?.season) {
    if (Array.isArray(reqData.season)) {
      where['$ginprocess.season_id$'] = {
        [Op.in]: reqData.season
      };
    } else {
      where['$ginprocess.season_id$'] = reqData.season;
    }
  } else {
    where['$ginprocess.season_id$'] = {
      [Op.not]: null,
    };
  }

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

const getBaleProducedQuery = (
  reqData: any
) => {
  const where: any = {

  };

  //where['$ginprocess.status$'] = "Sold";
  if (reqData?.program)
    where.program_id = reqData.program;

  if (reqData?.brand)
    where['$ginner.brand$'] = {
      [Op.contains]: Sequelize.literal(`ARRAY [${reqData.brand}]`)
    };

  if (reqData?.season) {
    if (Array.isArray(reqData.season)) {
      where['$season_id$'] = {
        [Op.in]: reqData.season
      };
    } else {
      where['$season_id$'] = reqData.season;
    }
  } else {
    where['$season_id$'] = {
      [Op.not]: null,
    };
  }

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

const getGinnerSalesWhereQuery = (
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
  else
    where.season_id = {
      [Op.not]: null,
    };

  if (reqData?.country)
    where['$ginner.country_id$'] = reqData.country;

  if (reqData?.state)
    where['$ginner.state_id$'] = reqData.state;

  if (reqData?.district)
    where['$ginner.district_id$'] = reqData.district;

  if (reqData?.spinner)
    where['$ginner.id$'] = reqData.spinner;

  if (reqData?.fromDate)
    where.date = { [Op.gte]: reqData.fromDate };

  if (reqData?.toDate)
    where.date = { [Op.lt]: reqData.toDate };

  if (reqData?.fromDate && reqData?.toDate)
    where.date = { [Op.between]: [reqData.fromDate, reqData.toDate] };


  return where;
};


const getBaleSelectionQuery = (
  reqData: any
) => {
  const where: any = {

  };
  where['$sales.status$'] = { [Op.in]: ['Pending', 'Pending for QR scanning', 'Partially Accepted', 'Partially Rejected','Sold'] };
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

const getBaleSelLintSoldQuery = (
  reqData: any
) => {
  const where = [];

  if (reqData?.program)
    where.push(`gp.program_id IN (${reqData.program})`)

  if (reqData?.brand)
      where.push(`g.brand && ARRAY[${reqData.brand}]`)

  if (reqData?.season) {
    if (Array.isArray(reqData.season)) {
      where.push(`gp.season_id IN (${reqData.season.join(',')})`)
    } else {
      where.push(`gp.season_id IN (${reqData.season})`)
    }
  } else {
    where.push(`gp.season_id IS NOT NULL`)
  }
  
  if (reqData?.country)
    where.push(`g.country_id IN (${reqData.country})`)

  if (reqData?.state)
    where.push(`g.state_id IN (${reqData.state})`);

  if (reqData?.district)
    where.push(`g.district_id IN (${reqData.district})`);

  if (reqData?.ginner)
    where.push(`gp.ginner_id IN (${reqData?.ginner})`);

  if (reqData?.fromDate)
    where.push(`"gp"."date" >= ${reqData.fromDate}`);

  if (reqData?.toDate)
    where.push(`"gp"."date" < ${reqData.toDate}`);

  if (reqData?.fromDate && reqData?.toDate)
    where.push(`"gp"."date" BETWEEN '${reqData.fromDate}' AND '${reqData.toDate}'`);

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
      toDate,
      seasonLimit
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
      toDate,
      seasonLimit
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
    const data = await getTopSpinnersRes(spinnersData);
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
  where['$buyerdata.name$'] = {
    [Op.not]: null
  };
  where.status = { [Op.in]: ['Pending', 'Pending for QR scanning', 'Partially Accepted', 'Partially Rejected','Sold'] }
  // where.status = 'Sold';
  
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
      processedData
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
    // limit: 3,
    order: [
      ["id", "DESC"],
    ],
  });
  if (seasonIds.length != 3) {
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
    // limit: 3,
    group: ['season.id']
  });

  return result;

};


const getProcuredProcessedData = async (
  where: any
) => {
  // where.status = 'Sold';
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
    // limit: 3,
    group: ['season.id']
  });

  return result;

};


const getLintProcuredSold = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const seasonLimit = reqData.seasonLimit ? parseInt(reqData.seasonLimit.toString()) : 3;
    const seasons: any = reqData.seasonLimit ? await getLastSeasons(seasonLimit) : {};
    const procuredWhere = await getGinBaleQuery({...reqData, season: seasons!.ids});
    const baleSel = getBaleSelLintSoldQuery({...reqData, season: seasons!.ids});
    const procuredData = await getBaleProcuredData(procuredWhere);
    const soldData = await getBaleSoldData(baleSel);
    let data = await getLintProcuredSoldRes(
      procuredData,
      soldData,
      reqData.season
    );
    if(reqData.seasonLimit && seasons!.names) {
      seasons!.names.forEach((season: any) => { 
        if(data.season.indexOf(season.name) == -1) {
          data.season.push(season.name);
          data.procured.push(0);
          data.sold.push(0);
          data.stock.push(0);
        }
      });
      const indices = data.season.map((_: any, index: any) => index);
      indices.sort((a: any, b: any) => {
        const seasonA = parseInt(data.season[a].split('-')[0]);
        const seasonB = parseInt(data.season[b].split('-')[0]);
        return seasonA - seasonB;
      });
      data.season = indices.map((i: any) => data.season[i]);
      data.procured = indices.map((i: any) => data.procured[i]);
      data.sold = indices.map((i: any) => data.sold[i]);
      data.stock = indices.map((i: any) => data.stock[i]);
    }
    return res.sendSuccess(res, data);

  } catch (error: any) {
    console.log(error);
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
    if (!seasonIds.includes(sold.seasonId))
      seasonIds.push(sold.seasonId);
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

  let season: any = [];
  let procured: any = [];
  let sold: any = [];
  let stock: any = [];

  for (const sessionId of seasonIds) {
    const fProcured = procuredList.find((production: any) =>
      production.dataValues.seasonId == sessionId
    );
    const fSold = soldList.find((estimate: any) =>
      estimate.seasonId == sessionId
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
      data.seasonName = fSold.seasonName;
      data.sold = mtConversion(fSold.lintSold);
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
        Sequelize.fn(
          "SUM",
          Sequelize.literal(`
            CASE
              WHEN "gin-bales"."old_weight" IS NOT NULL THEN CAST("gin-bales"."old_weight" AS DOUBLE PRECISION)
              ELSE CAST("gin-bales"."weight" AS DOUBLE PRECISION)
            END
          `)
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

  // const result = await BaleSelection.findAll({
  //   attributes: [
  //     [
  //       sequelize.fn(
  //         "COALESCE",
  //         sequelize.fn(
  //           "SUM",
  //           Sequelize.literal(`
  //             CASE
  //               WHEN "bale"."old_weight" IS NOT NULL THEN CAST("bale"."old_weight" AS DOUBLE PRECISION)
  //               ELSE CAST("bale"."weight" AS DOUBLE PRECISION)
  //             END
  //           `)
  //         ),
  //         0
  //       ),
  //       "lintSold",
  //     ],
  //     [
  //       sequelize.fn("COUNT", Sequelize.literal("DISTINCT bale_id")),
  //       "sold",
  //     ],
  //     [Sequelize.literal("date_part('Month', sales.date)"), 'month'],
  //     [Sequelize.literal("date_part('Year', sales.date)"), 'year']
  //   ],
  //   include: [
  //     {
  //       model: GinSales,
  //       as: "sales",
  //       attributes: [],
  //       include: [{
  //         model: Season,
  //         as: 'season',
  //         attributes: []
  //       }, {
  //         model: Ginner,
  //         as: 'ginner',
  //         attributes: []
  //       }
  //       ],
  //     },
  //     {
  //       model: GinBale,
  //       as: "bale",
  //       attributes: [],
  //     },
  //   ],
  //   where,
  //   group: ['month', 'year']
  // });

  where.push(`gs.status in ('Pending', 'Pending for QR scanning', 'Partially Accepted', 'Partially Rejected','Sold')`)
  where.push(`gs.buyer_ginner IS NULL`)

  const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

  const [result] = await sequelize.query(`
    SELECT
        date_part('Month', gp.date) AS "month",
        date_part('Year', gp.date) AS "year",
        COUNT(gb.id) AS sold,
        COALESCE(
          SUM(
            CASE
              WHEN gb.old_weight IS NOT NULL THEN CAST(gb.old_weight AS DOUBLE PRECISION)
              ELSE CAST(gb.weight AS DOUBLE PRECISION)
            END
          ), 0
      ) AS "lintSold"
    FROM
        "gin-bales" gb
    LEFT JOIN 
        bale_selections bs ON gb.id = bs.bale_id
    LEFT JOIN 
        gin_sales gs ON gs.id = bs.sales_id
    LEFT JOIN 
        gin_processes gp ON gb.process_id = gp.id
    LEFT JOIN
        ginners g ON gp.ginner_id = g.id
    LEFT JOIN
        seasons s ON gp.season_id = s.id
    LEFT JOIN
        programs pr ON gp.program_id = pr.id
    ${whereClause}
    GROUP BY "month", "year"`)

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
    let seasonOne;
    if (reqData.season) {
      seasonOne = await Season.findOne({
        where: { id: reqData.season }
      });
    } else {
      seasonOne = await Season.findOne({
        order: [['id', 'DESC']],  // This will get the latest season (e.g., '2024-25' instead of '2023-24')
        limit: 1
      });
    }
    // reqData.season = seasonOne.id;
    const procuredWhere = await getGinBaleQuery(reqData); //yes
    const baleSel = getBaleSelectionQuery(reqData);
    const lintSel = getBaleSelLintSoldQuery(reqData);
    const transactionWhere = getTransactionDataQuery(reqData);
    const processedWhere = getOverAllDataQuery(reqData); //yes
    const procuredData = await getLintProcuredDataByMonth(procuredWhere); //yes
    const processedData = await getProcessedDataByMonth(processedWhere); //yes
    const soldData = await getLintSoldDataByMonth(lintSel);
    const procuredProcessedData = await getProcuredDataByMonth(transactionWhere); 

    const data = await getDataAllRes(
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
      (estimate.month - 1) == month.month &&
      estimate.year == month.year
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
      data.sold = mtConversion(fSold.lintSold);
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
    const seasonLimit = reqData.seasonLimit ? parseInt(reqData.seasonLimit.toString()) : 3;
    const seasons: any = reqData.seasonLimit ? await getLastSeasons(seasonLimit) : {};
    const ginBale = getGinBaleQuery(reqData);
    const ginBaleProduce = await getBaleProducedQuery({...reqData, season: seasons!.ids});
    const baleSel = getBaleSelLintSoldQuery({...reqData, season: seasons!.ids});
    const procuredData = await getBaleNewProducedData(ginBaleProduce);
    const soldData = await getBaleSoldData(baleSel);
    let data = await getBaleComparisonRes(
      procuredData,
      soldData,
      reqData.season
    );

    if(reqData.seasonLimit && seasons!.names) {
      seasons!.names.forEach((season: any) => { 
        if(data.season.indexOf(season.name) == -1) {
          data.season.push(season.name);
          data.procured.push(0);
          data.sold.push(0);
          data.stock.push(0);
        }
      });
      const indices = data.season.map((_: any, index: any) => index);
      indices.sort((a: any, b: any) => {
        const seasonA = parseInt(data.season[a].split('-')[0]);
        const seasonB = parseInt(data.season[b].split('-')[0]);
        return seasonA - seasonB;
      });
      data.season = indices.map((i: any) => data.season[i]);
      data.procured = indices.map((i: any) => data.procured[i]);
      data.sold = indices.map((i: any) => data.sold[i]);
      if (data.stock) data.stock = indices.map((i: any) => data.stock[i]);
    }
    return res.sendSuccess(res, data);

  } catch (error: any) {
    console.log(error)
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};

const getBaleNewProducedData = async( where: any) =>{

  const result = await GinProcess.findAll({
    attributes: [
      [
        Sequelize.fn(
          "SUM",
          Sequelize.literal(`
            no_of_bales
          `)
        ),
        "procured",
      ],
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
    // limit: 3,
    order: [['seasonId', 'desc']],
    group: ["season.id"],
  });

  return result;
}


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
        Sequelize.fn(
          "SUM",
          Sequelize.literal(`
            CASE
              WHEN "gin-bales"."old_weight" IS NOT NULL THEN CAST("gin-bales"."old_weight" AS DOUBLE PRECISION)
              ELSE CAST("gin-bales"."weight" AS DOUBLE PRECISION)
            END
          `)
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
    // limit: 3,
    order: [['seasonId', 'desc']],
    group: ["ginprocess.season.id"],
  });
  return result;

};



// const getBaleSoldData = async (
//   where: any
// ) => {
//   // where.sold_status = true
//   where.status = 'Sold';

//     const result = await GinSales.findAll({
//     attributes: [
//       [Sequelize.col('season.id'), 'seasonId'],   // season_id from Season
//       [Sequelize.col('season.name'), 'seasonName'], 
//       [Sequelize.fn('SUM', Sequelize.col('no_of_bales')), 'sold'],
//       [Sequelize.fn('SUM', Sequelize.col('total_qty')), 'lintSold'],
//     ],
//     include: [
//       {
//         model: Season,
//         as: 'season',
//         attributes: [] 
//       },
//       {
//         model: Ginner,
//         as: "ginner",
//         attributes: []
//       }
//     ],
//     where: {
//       id: {
//         [Op.in]: Sequelize.literal(`(
//           SELECT DISTINCT sales_id
//           FROM bale_selections
//         )`)
//       },
//       ...where
//     },
//     order: [['seasonId', 'desc']],
//     // limit: 3,
//     group: ['season.id'],
//     // raw: true
//   });

//   return result;

// };

const getBaleSoldData = async (
  where: any
) => {
  // where.sold_status = true
  // where.status = 'Sold';
  where.push(`gs.status in ('Pending', 'Pending for QR scanning', 'Partially Accepted', 'Partially Rejected','Sold')`)
  where.push(`gs.buyer_ginner IS NULL`)

  const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const [result] = await sequelize.query(`
      SELECT
          s.name AS "seasonName",
          s.id AS "seasonId",
          COUNT(gb.id) AS sold,
          COALESCE(
            SUM(
              CASE
                WHEN gb.old_weight IS NOT NULL THEN CAST(gb.old_weight AS DOUBLE PRECISION)
                ELSE CAST(gb.weight AS DOUBLE PRECISION)
              END
            ), 0
        ) AS "lintSold"
      FROM
          "gin-bales" gb
      LEFT JOIN 
          bale_selections bs ON gb.id = bs.bale_id
      LEFT JOIN 
          gin_sales gs ON gs.id = bs.sales_id
      LEFT JOIN 
          gin_processes gp ON gb.process_id = gp.id
      LEFT JOIN
          ginners g ON gp.ginner_id = g.id
      LEFT JOIN
          seasons s ON gp.season_id = s.id
      LEFT JOIN
          programs pr ON gp.program_id = pr.id
      ${whereClause}
      GROUP BY
          s.id
      ORDER BY "seasonId" DESC`)

  return result
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
    if (!seasonIds.includes(processed.seasonId))
      seasonIds.push(processed.seasonId);
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

  let season: any = [];
  let procured: any = [];
  let sold: any = [];
  let stock: any = [];

  for (const sessionId of seasonIds) {
    const fProcured = procuredData.find((production: any) =>
      production.dataValues.seasonId == sessionId
    );
    const fSold = soldData.find((processed: any) =>
      processed.seasonId == sessionId
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
      data.seasonName = fSold.seasonName;
      data.sold = formatNumber(fSold.sold);
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
    const data = await getTopGinnersRes(ginnersData);
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

  if (reqData?.brand){
    where['$ginprocess.ginner.brand$'] = {
      [Op.contains]: Sequelize.literal(`ARRAY [${reqData.brand}]`)
    };
  }


  if (reqData?.season)
    where['$ginprocess.season_id$'] = reqData.season;

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


  where['$ginprocess.ginner.name$'] = {
    [Op.not]: null
  };



  const result = await GinBale.findAll({
    attributes: [
      [
        sequelize.fn(
              "COALESCE",
        Sequelize.fn(
          "SUM",
          Sequelize.literal(`
            CASE
              WHEN "gin-bales"."old_weight" IS NOT NULL THEN CAST("gin-bales"."old_weight" AS DOUBLE PRECISION)
              ELSE CAST("gin-bales"."weight" AS DOUBLE PRECISION)
            END
          `)
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

const getTopGinnersSoldRes = (
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

const getLintSoldTopGinners = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const baleSel = getBaleSelLintSoldQuery(reqData);
    const ginnersData = await getLintSoldTopGinnersData(baleSel);
    const data = await getTopGinnersSoldRes(ginnersData);
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};

const getLintSoldTopGinnersData = async (
  where: any
) => {

  where.push(`gs.status in ('Pending', 'Pending for QR scanning', 'Partially Accepted', 'Partially Rejected','Sold')`)
  where.push(`gs.buyer_ginner IS NULL`)

  const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
  try {
    const [result] = await sequelize.query(`
      SELECT
          g.name AS "ginnerName",
          g.id AS "ginnerId",
          COUNT(gb.id) AS sold,
          COALESCE(
            SUM(
              CASE
                WHEN gb.old_weight IS NOT NULL THEN CAST(gb.old_weight AS DOUBLE PRECISION)
                ELSE CAST(gb.weight AS DOUBLE PRECISION)
              END
            ), 0
        ) AS "total"
      FROM
          "gin-bales" gb
      LEFT JOIN 
          bale_selections bs ON gb.id = bs.bale_id
      LEFT JOIN 
          gin_sales gs ON gs.id = bs.sales_id
      LEFT JOIN 
          gin_processes gp ON gb.process_id = gp.id
      LEFT JOIN
          ginners g ON gp.ginner_id = g.id
      LEFT JOIN
          seasons s ON gp.season_id = s.id
      LEFT JOIN
          programs pr ON gp.program_id = pr.id
      ${whereClause}
      GROUP BY
          g.id
      ORDER BY "total" DESC
      LIMIT 10
      `)

  return result;
  } catch (error) {
    console.log(error)
  }
};

const getLintStockTopGinners = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const ginnersData = await getLintStockTopGinnersData(reqData);
    const data = await getLintStockTopGinnersRes(ginnersData);
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

  const where: any = {};
  const soldWhere: any = [];

  if (reqData?.program){
    where['$ginprocess.program_id$'] = reqData.program;
    soldWhere.push(`gp.program_id IN (${reqData.program})`);
  }

  if (reqData?.country){
    where['$ginprocess.ginner.country_id$'] = reqData.country;
    soldWhere.push(`g.country_id IN (${reqData.country})`);
  }

  if (reqData?.brand){
    where['$ginprocess.ginner.brand$'] = {
      [Op.contains]: Sequelize.literal(`ARRAY [${reqData.brand}]`)
    };
    soldWhere.push(`g.brand && ARRAY[${reqData.brand}]`)
  }


  if (reqData?.season){
    where['$ginprocess.season_id$'] = reqData.season;
    soldWhere.push(`gp.season_id IN (${reqData.season})`);
  }

  if (reqData?.state){
    where['$ginprocess.ginner.state_id$'] = reqData.state;
    soldWhere.push(`g.state_id IN (${reqData.state})`);
  }

  if (reqData?.district){
    where['$ginprocess.ginner.district_id$'] = reqData.district;
    soldWhere.push(`g.district_id IN (${reqData.district})`);
  }

  if (reqData?.ginner){
    where['$ginprocess.ginner.id$'] = reqData.ginner;
    soldWhere.push(`gp.ginner_id IN (${reqData?.ginner})`);
  }

  if (reqData?.fromDate){
    where['$ginprocess.date$'] = { [Op.gte]: reqData.fromDate };
    soldWhere.push(`"gp"."date" >= ${reqData.fromDate}`);
  }

  if (reqData?.toDate){
    where['$ginprocess.date$'] = { [Op.lt]: reqData.toDate };
    soldWhere.push(`"gp"."date" < ${reqData.toDate}`);
  }

  if (reqData?.fromDate && reqData?.toDate){
    where['$ginprocess.date$'] = { [Op.between]: [reqData.fromDate, reqData.toDate] };
    soldWhere.push(`"gp"."date" BETWEEN '${reqData.fromDate}' AND '${reqData.toDate}'`);
  }



  where['$ginprocess.ginner.name$'] = {
    [Op.not]: null
  };

  soldWhere.push(`g.name IS NOT NULL`)
  soldWhere.push(`gs.status in ('Pending', 'Pending for QR scanning', 'Partially Accepted', 'Partially Rejected','Sold')`)
  soldWhere.push(`gs.buyer_ginner IS NULL`)

  const whereClause = soldWhere.length > 0 ? `WHERE ${soldWhere.join(' AND ')}` : '';

  const processedList = await GinBale.findAll({
    attributes: [
      [
        sequelize.fn(
              "COALESCE",
        Sequelize.fn(
          "SUM",
          Sequelize.literal(`
            CASE
              WHEN "gin-bales"."old_weight" IS NOT NULL THEN CAST("gin-bales"."old_weight" AS DOUBLE PRECISION)
              ELSE CAST("gin-bales"."weight" AS DOUBLE PRECISION)
            END
          `)
        ),
        0
        ),
        "processed",
      ],
      [Sequelize.col('ginprocess.ginner.name'), 'ginnerName'],
      [Sequelize.col('ginprocess.ginner.id'), 'id']
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
    group: ["ginprocess.ginner.id"],
    raw: true
  });

  const [soldList] = await sequelize.query(`
    SELECT
        g.name AS "ginnerName",
        g.id AS "id",
        COALESCE(
          SUM(
            CASE
              WHEN gb.old_weight IS NOT NULL THEN CAST(gb.old_weight AS DOUBLE PRECISION)
              ELSE CAST(gb.weight AS DOUBLE PRECISION)
            END
          ), 0
      ) AS "sold"
    FROM
        "gin-bales" gb
    LEFT JOIN 
        bale_selections bs ON gb.id = bs.bale_id
    LEFT JOIN 
        gin_sales gs ON gs.id = bs.sales_id
    LEFT JOIN 
        gin_processes gp ON gb.process_id = gp.id
    LEFT JOIN
        ginners g ON gp.ginner_id = g.id
    LEFT JOIN
        seasons s ON gp.season_id = s.id
    ${whereClause}
    GROUP BY
        g.id
    `)

  let ginnerIds = soldList.map((row: any) => row.id)
  ginnerIds = [...ginnerIds, ...processedList.map((row: any) => row.id)];

  ginnerIds = [...new Set(ginnerIds)];
  const data = []
  for(const ginnerId of ginnerIds) {
    const fProcessed = processedList.find((processed: any) => processed.id === ginnerId);
    const fSold = soldList.find((sold: any) => sold.id === ginnerId);
    data.push({
      ginnerName: fProcessed ? fProcessed.ginnerName: fSold ? fSold.ginnerName : '',
      total: (fProcessed?.processed ?? 0 ) - (fSold?.sold ?? 0)
    })
  }

  
  return data.sort((a,b) => b.total - a.total).splice(0,10);

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
    const ginBale = getBaleSelLintSoldQuery(reqData);
    const soldList = await getBaleSoldByCountryData(ginBale);
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
    if (!countries.includes(list.countryName))
      countries.push(list.countryName);

    if (!seasonIds.includes(list.seasonId))
      seasonIds.push(list.seasonId);
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
  let areaList: any[] = [];


  for (const countryName of countries) {
    const data: any = {
      name: countryName,
      data: [],
    };
    const lSoldList = soldList.filter((list: any) =>
      list.countryName == countryName
    );

    for (const seasonId of seasonIds) {

      let totalArea = 0;
      const gSoldValue = lSoldList.find((list: any) =>
        list.seasonId == seasonId
      );

      if (gSoldValue) {
        totalArea = mtConversion(gSoldValue.lintSold);
        if (!seasonList.includes(gSoldValue.seasonName))
          seasonList.push(gSoldValue.seasonName);
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

const getLastSeasons = async (limit: number = 3) => {
  const currentDate = new Date();
  
  const seasons = await Season.findAll({
    where: {
      status: true, // Only get active seasons
      from: {
        [Op.lte]: currentDate.toISOString() // Get seasons that have started
      }
    },
    order: [['from', 'DESC']], // Order by from date descending
    limit: parseInt(limit.toString())
  });
  
  return {ids: seasons.map((season: any) => season.id), names: seasons.map((season: any) => ({name: season.name, id: season.id}))};
};



const getProcuredAllocated = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const seasonLimit = reqData.seasonLimit ? parseInt(reqData.seasonLimit.toString()) : 3;
    const seasons: any = reqData.seasonLimit ? await getLastSeasons(seasonLimit) : {};
    const where = getTransactionDataQuery(reqData);
    const allocationWhere = getGinnerAllocationQuery({...reqData, season: seasons?.ids});
    const transactionWhere = getTransactionDataQuery({...reqData, season: seasons!.ids});
    const procuredData = await getProcuredProcessedData(transactionWhere);
    const allocatedData = await getAllocatedData(allocationWhere);
    let data = await getProcuredAllocatedRes(
      procuredData,
      allocatedData,
      reqData.season
    );
    if(reqData.seasonLimit && seasons!.names) {
      seasons!.names.forEach((season: any) => { 
        if(data.season.indexOf(season.name) == -1) {
          data.season.push(season.name);
          data.allocated.push(0);
          data.procured.push(0);
        }
      });
      const indices = data.season.map((_: any, index: any) => index);
      indices.sort((a: any, b: any) => {
        const seasonA = parseInt(data.season[a].split('-')[0]);
        const seasonB = parseInt(data.season[b].split('-')[0]);
        return seasonA - seasonB;
      });
      data.season = indices.map((i: any) => data.season[i]);
      data.procured = indices.map((i: any) => data.procured[i]);
      data.allocated = indices.map((i: any) => data.allocated[i]);
    }
    return res.sendSuccess(res, data);

  } catch (error: any) {
    console.log(error);
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};

const getAllocatedData = async (
  where: any
) => {

  const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

  const [result] = await sequelize.query(`
    SELECT
        season.name AS "seasonName",
        season.id AS "seasonId",
        COALESCE(SUM(CAST("farms"."total_estimated_cotton"AS DOUBLE PRECISION)), 0) AS allocated
      FROM "ginner_allocated_villages" as gv
      LEFT JOIN 
            "villages" AS "farmer->village" ON "gv"."village_id" = "farmer->village"."id" 
      LEFT JOIN 
            "farmers" AS "farmer" ON "farmer->village"."id" = "farmer"."village_id" and "farmer"."brand_id" ="gv"."brand_id"
      LEFT JOIN 
            "farms" as "farms" on farms.farmer_id = "farmer".id and farms.season_id = gv.season_id
      LEFT JOIN 
            "seasons" AS "season" ON "gv"."season_id" = "season"."id"
      LEFT JOIN 
            ginners g ON gv.ginner_id = g.id
    ${whereClause}
    GROUP BY
        season.id
    ORDER BY "seasonId" DESC`)


  // const result = await GinnerExpectedCotton.findAll({
  //   attributes: [
  //     [Sequelize.fn('SUM', Sequelize.literal('CAST(expected_seed_cotton  as numeric)')), 'allocated'],
  //     [Sequelize.col('season.name'), 'seasonName'],
  //     [Sequelize.col('season.id'), 'seasonId']
  //   ],
  //   include: [{
  //     model: Season,
  //     as: 'season',
  //     attributes: []
  //   }, {
  //     model: Ginner,
  //     as: 'ginner_expected_cotton',
  //     attributes: []
  //   }],
  //   where,
  //   order: [['seasonId', 'desc']],
  //   // limit: 3,
  //   group: ['season.id']
  // });

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
    if (!seasonIds.includes(processed.seasonId))
      seasonIds.push(processed.seasonId);
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

  let season: any = [];
  let procured: any = [];
  let allocated: any = [];

  for (const sessionId of seasonIds) {
    const gProcured = procuredData.find((production: any) =>
      production.dataValues.seasonId == sessionId
    );
    const gAllocated = allocatedData.find((processed: any) =>
      processed.seasonId == sessionId
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
      data.seasonName = gAllocated.seasonName;
      data.allocated = mtConversion(gAllocated.allocated);
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
  return value > 0 ? Number((value / 1000).toFixed(2)) : 0;
};

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



const getBalesProcuredByCountry = async (
  req: Request, res: Response
) => {
  try {

    const reqData = await getQueryParams(req, res);
    const where = getBaleProducedQuery(reqData);
    const processedData = await getBaleNewProducedByCountryData(where);
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
         farmerCount = Math.round(Number(fFarmerValue.dataValues.procured));
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

const getBaleNewProducedByCountryData = async( where: any) =>{

  const result = await GinProcess.findAll({
    attributes: [
      [
        Sequelize.fn(
          "SUM",
          Sequelize.literal(`
            no_of_bales
          `)
        ),
        "procured",
      ],
      [Sequelize.col('season.name'), 'seasonName'],
      [Sequelize.col('season.id'), 'seasonId'],
      [Sequelize.col('ginner.country.id'), 'countryId'],
      [Sequelize.col('ginner.country.county_name'), 'countryName']
    ],
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
    where,
    // limit: 3,
    order: [['seasonId', 'desc']],
    group: ["season.id", "ginner.country.id"],
  });

  return result;
}


const getBaleProcuredByCountryData = async (where: any) => {
  const result = await GinBale.findAll({
    attributes: [
      [
        sequelize.fn(
              "COALESCE",
        Sequelize.fn(
          "SUM",
          Sequelize.literal(`
            CASE
              WHEN "gin-bales"."old_weight" IS NOT NULL THEN CAST("gin-bales"."old_weight" AS DOUBLE PRECISION)
              ELSE CAST("gin-bales"."weight" AS DOUBLE PRECISION)
            END
          `)
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
    // const where = getBaleSelectionQuery(reqData);
    const where = getBaleSelLintSoldQuery(reqData);
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
    if (!countries.includes(list.countryName))
      countries.push(list.countryName);

    if (!seasonIds.includes(list.seasonId))
      seasonIds.push(list.seasonId);
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
      list.countryName == countryName
    );

    for (const seasonId of seasonIds) {

      let farmerCount = 0;
      const fFarmerValue = farmerList.find((list: any) =>
        list.seasonId == seasonId
      );

      if (fFarmerValue) {
         farmerCount = Math.round(Number(fFarmerValue.sold));
        if (!seasonList.includes(fFarmerValue.seasonName))
          seasonList.push(fFarmerValue.seasonName);
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
  // where.sold_status = true

  where.push(`gs.status in ('Pending', 'Pending for QR scanning', 'Partially Accepted', 'Partially Rejected','Sold')`)
  where.push(`gs.buyer_ginner IS NULL`)

  const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const [result] = await sequelize.query(`
      SELECT
          s.name AS "seasonName",
          s.id AS "seasonId",
          c.county_name AS "countryName",
          c.id AS "countryId",
          COUNT(gb.id) AS sold,
          COALESCE(
            SUM(
              CASE
                WHEN gb.old_weight IS NOT NULL THEN CAST(gb.old_weight AS DOUBLE PRECISION)
                ELSE CAST(gb.weight AS DOUBLE PRECISION)
              END
            ), 0
        ) AS "lintSold"
      FROM
          "gin-bales" gb
      LEFT JOIN 
          bale_selections bs ON gb.id = bs.bale_id
      LEFT JOIN 
          gin_sales gs ON gs.id = bs.sales_id
      LEFT JOIN 
          gin_processes gp ON gb.process_id = gp.id
      LEFT JOIN
          ginners g ON gp.ginner_id = g.id
      LEFT JOIN
          seasons s ON gp.season_id = s.id
      LEFT JOIN
          countries c ON g.country_id = c.id
      ${whereClause}
      GROUP BY
          s.id, c.id
      ORDER BY "seasonId" DESC`)

  return result;

};

// const getBaleSoldByCountryData = async (
//   where: any
// ) => {
//   const result = await BaleSelection.findAll({
//     attributes: [
//       [
//         sequelize.fn(
//           "COALESCE",
//           sequelize.fn(
//             "SUM",
//             sequelize.literal(
//               'CAST("bale"."weight" AS DOUBLE PRECISION)'
//             )
//           ),
//           0
//         ),
//         "lintSold",
//       ],
//       [sequelize.fn("COUNT", Sequelize.literal("DISTINCT bale_id")), "sold"],
//       [Sequelize.col('sales.season.name'), 'seasonName'],
//       [Sequelize.col('sales.season.id'), 'seasonId'],
//       [Sequelize.col('sales.ginner.country.id'), 'countryId'],
//       [Sequelize.col('sales.ginner.country.county_name'), 'countryName']
//     ],
//     include: [
//       {
//         model: GinSales,
//         as: "sales",
//         attributes: [],
//         include: [{
//           model: Season,
//           as: 'season',
//           attributes: []
//         }, {
//           model: Ginner,
//           as: 'ginner',
//           attributes: [],
//           include: [{
//             model: Country,
//             as: 'country',
//             attributes: []
//           }]
//         }
//         ],
//       },
//       {
//         model: GinBale,
//         as: "bale",
//         attributes: [],
//       },
//     ],
//     where,
//     order: [['seasonId', 'desc']],
//     group: ["sales.season.id", "sales.ginner.country.id"],
//   });

//   return result;

// };

const getBalesStockByCountry = async (
  req: Request, res: Response
) => {
  try {

    const reqData = await getQueryParams(req, res);
    // const processWhere = getGinBaleQuery(reqData);
    // const processedData = await getBaleProcuredByCountryData(processWhere);
    const where = getBaleProducedQuery(reqData);
    const processedData = await getBaleNewProducedByCountryData(where);
    const soldWhere = getBaleSelLintSoldQuery(reqData);
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
    if (!countries.includes(list.countryName))
      countries.push(list.countryName);

    if (!seasonIds.includes(list.seasonId))
      seasonIds.push(list.seasonId);
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
      list.countryName == countryName
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
        list.seasonId == seasonId
      );
      if (fProcuredValue) {
        farmerCount.procured = Math.round(Number(fProcuredValue.dataValues.procured));
        if (!seasonList.includes(fProcuredValue.dataValues.seasonName))
          seasonList.push(fProcuredValue.dataValues.seasonName);
      }

      if (fSoldValue) {
        farmerCount.sold = Math.round(Number(fSoldValue.sold));
        if (!seasonList.includes(fSoldValue.seasonName))
          seasonList.push(fSoldValue.seasonName);
      }
      if (!fSoldValue && !fProcuredValue) {
        seasons.forEach((season: any) => {
          if (season.id == seasonId && !seasonList.includes(season.seasonName)) {
            seasonList.push(season.name);
          }
        });
      }

      data.data.push(farmerCount.procured > farmerCount.sold ? Math.round(Number((farmerCount.procured - farmerCount.sold))) : 0);
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

const getGinGreyoutQtyStock = async ( req: Request, res: Response) =>{
  try {
    const reqData = await getQueryParams(req, res);
    // const ginnerWhere = await getOverAllDataQuery(reqData);
    const baleWhere = await getGinBaleQuery(reqData);
    // const processedData = await getLintProcessedData(ginnerWhere);
    // const soldData = await getLintBaleSoldData(baleWhere);

    // const baleSel = await getGinnerSalesWhereQuery(reqData);
    const baleSel =  getBaleSelLintSoldQuery(reqData);
    const processedData = await getBaleProcuredData(baleWhere);
    const soldData = await getBaleSoldData(baleSel);
    
    const greyoutData = await getLintBaleGreyoutData(baleWhere);


    const data = await getLntQtyComparisonRes(
      processedData,
      soldData,
      greyoutData,
      reqData.season
    );
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.message
      ? error.message
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
}

const getLntQtyComparisonRes = async (
  processedData: any[],
  soldData: any[],
  greyoutData: any[],
  reqSeason: any
) => {
  let seasonIds: number[] = [];

  processedData.forEach((procured: any) => {
    if (procured.dataValues.seasonId)
      seasonIds.push(procured.dataValues.seasonId);
  });

  soldData.forEach((processed: any) => {
    if (!seasonIds.includes(processed.seasonId))
      seasonIds.push(processed.seasonId);
  });

  greyoutData.forEach((processed: any) => {
    if (!seasonIds.includes(processed.dataValues.seasonId))
      seasonIds.push(processed.dataValues.seasonId);
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

  let season: any = [];
  let processed: any = [];
  let sold: any = [];
  let total_stock: any = [];
  let greyout_qty: any = [];
  let actual_stock: any = [];

  for (const sessionId of seasonIds) {
    const fProcured = processedData.find((production: any) =>
      production.dataValues.seasonId == sessionId
    );
    const fSold = soldData.find((processed: any) =>
      processed.seasonId == sessionId
    );

    const fGreyout = greyoutData.find((processed: any) =>
      processed.dataValues.seasonId == sessionId
    );

    let data = {
      seasonName: '',
      processed: 0,
      sold: 0,
      total_stock: 0,
      greyout_qty: 0,
      actual_stock: 0,
    };
    if (fProcured) {
      data.seasonName = fProcured.dataValues.seasonName;
      data.processed = mtConversion(fProcured.dataValues.lintProcured);
    }

    if (fSold) {
      data.seasonName = fSold.seasonName;
      data.sold = mtConversion(fSold.lintSold);
    }

    if (fGreyout) {
      data.seasonName = fGreyout.dataValues.seasonName;
      data.greyout_qty = mtConversion(fGreyout.dataValues.lint_qty);
    }

    data.total_stock =
      data.processed > data.sold
        ? Number((data.processed - data.sold).toFixed(2))
        : 0;

    data.actual_stock =
      data.total_stock > data.greyout_qty
        ? Number((data.total_stock - data.greyout_qty).toFixed(2))
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
    processed.push(data.processed);
    greyout_qty.push(data.greyout_qty);
    total_stock.push(data.total_stock);
    actual_stock.push(data.actual_stock);
    sold.push(data.sold);

  }

  return {
    season,
    processed,
    sold,
    total_stock,
    greyout_qty,
    actual_stock
  };
};



const getLintBaleSoldData = async (
  where: any
) => {
  where.sold_status = true
  // where.status = 'Sold';

  const result = await GinBale.findAll({
    attributes: [
      [
        sequelize.fn(
          "COUNT",
          Sequelize.literal('DISTINCT "gin-bales"."id"')
        ),
        "baleSold",
      ],
      [
        sequelize.fn(
              "COALESCE",
        Sequelize.fn(
          "SUM",
          Sequelize.literal(`
            CASE
              WHEN "gin-bales"."old_weight" IS NOT NULL THEN CAST("gin-bales"."old_weight" AS DOUBLE PRECISION)
              ELSE CAST("gin-bales"."weight" AS DOUBLE PRECISION)
            END
          `)
        ),
        0
        ),
        "lintSold",
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
    // limit: 3,
    order: [['seasonId', 'desc']],
    group: ["ginprocess.season.id"],
  });

  return result;
};

const getLintBaleGreyoutData = async (
  where: any
) => {
  // where["$ginprocess.greyout_status$"] = true;
  // where.sold_status = false
  // where.is_all_rejected = null
  // where.status = 'Sold';

  const result = await GinBale.findAll({
    attributes: [
      [
        sequelize.fn(
          "COUNT",
          Sequelize.literal('DISTINCT "gin-bales"."id"')
        ),
        "no_of_bales",
      ],
      [
        sequelize.fn(
              "COALESCE",
        Sequelize.fn(
          "SUM",
          Sequelize.literal(`
            CASE
              WHEN "gin-bales"."old_weight" IS NOT NULL THEN CAST("gin-bales"."old_weight" AS DOUBLE PRECISION)
              ELSE CAST("gin-bales"."weight" AS DOUBLE PRECISION)
            END
          `)
        ),
        0
        ),
        "lint_qty",
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
    where:{
      ...where,
       sold_status: false ,
      [Op.or]: [
        {
          [Op.and]: [
            { "$ginprocess.greyout_status$": true },
            { is_all_rejected: null }
          ]
        },
        {
          [Op.and]: [
            { "$ginprocess.scd_verified_status$": true },
            { "$gin-bales.scd_verified_status$": { [Op.not]: true } }
          ]
        },
        {
          [Op.and]: [
            { "$ginprocess.scd_verified_status$": false },
            { "$gin-bales.scd_verified_status$": { [Op.is]: false } }
          ]
        }
      ]
    },
    // limit: 3,
    order: [['seasonId', 'desc']],
    group: ["ginprocess.season.id"],
  });

  return result;
};

const getGinGreyoutBaleStock = async ( req: Request, res: Response) =>{
  try {
    const reqData = await getQueryParams(req, res);
    // const ginnerWhere = await getOverAllDataQuery(reqData);
    const baleWhere = await getGinBaleQuery(reqData);
    const ginBaleProduce = await getBaleProducedQuery(reqData);
    
    const baleSel = getBaleSelLintSoldQuery(reqData);
    const processedData = await getBaleNewProducedData(ginBaleProduce);
    // const processedData = await getBaleProcuredData(baleWhere);
    const soldData = await getBaleSoldData(baleSel);
    
    const greyoutData = await getLintBaleGreyoutData(baleWhere);


    const data = await getLintBaleComparisonRes(
      processedData,
      soldData,
      greyoutData,
      reqData.season
    );
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.message
      ? error.message
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
}

const getLintBaleComparisonRes = async (
  processedData: any[],
  soldData: any[],
  greyoutData: any[],
  reqSeason: any
) => {
  let seasonIds: number[] = [];

  processedData.forEach((procured: any) => {
    if (procured.dataValues.seasonId)
      seasonIds.push(procured.dataValues.seasonId);
  });

  soldData.forEach((processed: any) => {
    if (!seasonIds.includes(processed.seasonId))
      seasonIds.push(processed.seasonId);
  });

  greyoutData.forEach((processed: any) => {
    if (!seasonIds.includes(processed.dataValues.seasonId))
      seasonIds.push(processed.dataValues.seasonId);
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

  let season: any = [];
  let processed: any = [];
  let sold: any = [];
  let total_stock: any = [];
  let greyout_qty: any = [];
  let actual_stock: any = [];

  for (const sessionId of seasonIds) {
    const fProcured = processedData.find((production: any) =>
      production.dataValues.seasonId == sessionId
    );
    const fSold = soldData.find((processed: any) =>
      processed.seasonId == sessionId
    );

    const fGreyout = greyoutData.find((processed: any) =>
      processed.dataValues.seasonId == sessionId
    );

    let data = {
      seasonName: '',
      processed: 0,
      sold: 0,
      total_stock: 0,
      greyout_qty: 0,
      actual_stock: 0,
    };
    if (fProcured) {
      data.seasonName = fProcured.dataValues.seasonName;
      data.processed = formatNumber(fProcured.dataValues.procured);
    }

    if (fSold) {
      data.seasonName = fSold.seasonName;
      data.sold = formatNumber(fSold.sold);
    }

    if (fGreyout) {
      data.seasonName = fGreyout.dataValues.seasonName;
      data.greyout_qty = formatNumber(fGreyout.dataValues.no_of_bales);
    }

    data.total_stock =
      data.processed > data.sold
        ? Number((data.processed - data.sold).toFixed(2))
        : 0;

    data.actual_stock =
      data.total_stock > data.greyout_qty
        ? Number((data.total_stock - data.greyout_qty).toFixed(2))
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
    processed.push(data.processed);
    greyout_qty.push(data.greyout_qty);
    total_stock.push(data.total_stock);
    actual_stock.push(data.actual_stock);
    sold.push(data.sold);

  }

  return {
    season,
    processed,
    sold,
    total_stock,
    greyout_qty,
    actual_stock
  };
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
  getBalesStockByCountry,
  getGinGreyoutQtyStock,
  getGinGreyoutBaleStock
};