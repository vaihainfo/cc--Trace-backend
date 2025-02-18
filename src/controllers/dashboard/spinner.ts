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
import Country from "../../models/country.model";
import sequelize from "../../util/dbConn";
import LintSelections from "../../models/lint-seletions.model";
import GinBale from "../../models/gin-bale.model";
import BaleSelection from "../../models/bale-selection.model";
import SpinYarn from "../../models/spin-yarn.model";

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

const getBaleSelWhereQuery = (
  reqData: any
) => {
  const where: any = {
    
  };

  if (reqData?.program)
    where['$sales.program_id$'] = reqData.program;

  if (reqData?.brand)
    where['$sales.buyerdata.brand$'] = {
      [Op.contains]: Sequelize.literal(`ARRAY [${reqData.brand}]`)
    };

  if (reqData?.season)
    where['$sales.season_id$'] = reqData.season;

  if (reqData?.country)
    where['$sales.buyerdata.country_id$'] = reqData.country;

  if (reqData?.state)
    where['$sales.buyerdata.state_id$'] = reqData.state;

  if (reqData?.district)
    where['$sales.buyerdata.district_id$'] = reqData.district;

  if (reqData?.spinner)
    where['$sales.buyerdata.id$'] = reqData.spinner;

  if (reqData?.fromDate)
    where['$sales.date$'] = { [Op.gte]: reqData.fromDate };

  if (reqData?.toDate)
    where['$sales.date$'] = { [Op.lt]: reqData.toDate };

  if (reqData?.fromDate && reqData?.toDate)
    where['$sales.date$'] = { [Op.between]: [reqData.fromDate, reqData.toDate] };


  return where;
};



const getSpinnerProcessWhereQuery = (
  reqData: any
) => {
  const where: any = {
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


const getSpinnerLintQuery = (
  reqData: any
) => {
  const where: any = {
  };

  if (reqData?.program)
    where['$spinprocess.program_id$'] = reqData.program;

  if (reqData?.brand)
    where['$spinprocess.spinner.brand$'] = {
      [Op.contains]: Sequelize.literal(`ARRAY [${reqData.brand}]`)
    };

  if (reqData?.season)
    where['$ginsales.season_id$'] = reqData.season;

  if (reqData?.country)
    where['$spinprocess.spinner.country_id$'] = reqData.country;

  if (reqData?.state)
    where['$spinprocess.spinner.state_id$'] = reqData.state;

  if (reqData?.district)
    where['$spinprocess.spinner.district_id$'] = reqData.district;

  if (reqData?.spinner)
    where['$spinprocess.spinner.id$'] = reqData.spinner;

  if (reqData?.fromDate)
    where['$spinprocess.date$'] = { [Op.gte]: reqData.fromDate };

  if (reqData?.toDate)
    where['$spinprocess.date$'] = { [Op.lt]: reqData.toDate };

  if (reqData?.fromDate && reqData?.toDate)
    where['$spinprocess.date$'] = { [Op.between]: [reqData.fromDate, reqData.toDate] };

  return where;
};

const getSpinnerYarnQuery = (
  reqData: any
) => {
  const where: any = {
  };

  if (reqData?.program)
    where['$spinprocess.program_id$'] = reqData.program;

  if (reqData?.brand)
    where['$spinprocess.spinner.brand$'] = {
      [Op.contains]: Sequelize.literal(`ARRAY [${reqData.brand}]`)
    };

  if (reqData?.season)
    where['$spinprocess.season_id$'] = reqData.season;

  if (reqData?.country)
    where['$spinprocess.spinner.country_id$'] = reqData.country;

  if (reqData?.state)
    where['$spinprocess.spinner.state_id$'] = reqData.state;

  if (reqData?.district)
    where['$spinprocess.spinner.district_id$'] = reqData.district;

  if (reqData?.spinner)
    where['$spinprocess.spinner.id$'] = reqData.spinner;

  if (reqData?.fromDate)
    where['$spinprocess.date$'] = { [Op.gte]: reqData.fromDate };

  if (reqData?.toDate)
    where['$spinprocess.date$'] = { [Op.lt]: reqData.toDate };

  if (reqData?.fromDate && reqData?.toDate)
    where['$spinprocess.date$'] = { [Op.between]: [reqData.fromDate, reqData.toDate] };

  return where;
};


const getSpinnerSalesWhereQuery = (
  reqData: any
) => {
  const where: any = {
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
    const where = getBaleSelWhereQuery(reqData);
    const ginnersData = await getTopGinnersData(where);
    const data = await getTopGinnersRes(ginnersData);
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
    delete where.status;
    const spinnersData = await getTopFabricData(where);
    const data = await getTopFabricRes(spinnersData);
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
    if (row.dataValues && row.dataValues.sale_name && name.length < 10) {
      name.push(row.dataValues.sale_name);
      count.push(mtConversion(row.dataValues.total));
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
        else processor_name end`), 'sale_name']
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
    where: {
      id: {
        [Op.in]: Sequelize.literal(`(
          SELECT DISTINCT sales_id
          FROM spin_process_yarn_selections
        )`)
      },
      ...where
    },
    order: [['total', 'desc']],
    limit: 15,
    group: ['sale_name']
  });

  return result;

};



const getTopGinnersData = async (
  where: any
) => {

  const result = await BaleSelection.findAll({
    attributes: [
      [Sequelize.col('sales.ginner.id'), 'ginnerId'],   // season_id from Season
      [Sequelize.col('sales.ginner.name'), 'ginnerName'], 
        [
          sequelize.fn(
            "COALESCE",
            sequelize.fn(
              "SUM",
              Sequelize.literal(`
                CASE
                  WHEN "bale"."accepted_weight" IS NOT NULL THEN "bale"."accepted_weight"
                  ELSE CAST("bale"."weight" AS DOUBLE PRECISION)
                END
              `)
            ),
            0
          ),
          "total",
        ]
    ],
    where: {
        ...where,
      "$sales.status$": { [Op.in]: ['Sold', 'Partially Accepted', 'Partially Rejected'] },
      [Op.or]: [
        { spinner_status: true },
        {"$sales.status$": 'Sold'}
      ]
    },
    include: [
        {
            model: GinBale,
            as: "bale",
            attributes: []
        },
        {
          model: GinSales,
          as: "sales",
          attributes: [],
          include: [
            {
              model: Ginner,
              as: 'ginner',
              attributes: []
            },
            {
                model: Season,
                as: "season",
                attributes: []
            },
            {
                model: Spinner,
                as: 'buyerdata',
                attributes: []
            }
        ],
          
      },
    ],
    group: ["sales.ginner_id", 'sales.ginner.id'],
    order: [['total', 'desc']],
    limit: 10,
   })

  return result;

};

const mtConversion = (value: number) => {
  return value > 0 ? Number((value / 1000).toFixed(2)) : 0
}

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


const getLintProcuredProcessed = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const ginSaleWhere = getBaleSelWhereQuery(reqData);
    const spinProcessWhere = getSpinnerLintQuery(reqData);
    const lintProcuredData = await getLintProcuredData(ginSaleWhere);
    const lintProcessedData = await getLintProcessedData(spinProcessWhere);
    const data = await getLintProcuredProcessedRes(
      lintProcuredData,
      lintProcessedData,
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


const getLintProcuredProcessedRes = async (
  lintProcuredList: any[],
  lintProcessedList: any[],
  reqSeason: any
) => {
  let seasonIds: number[] = [];

  lintProcuredList.forEach((procured: any) => {
    if (procured?.seasonId)
      seasonIds.push(procured?.seasonId);
  });

  lintProcessedList.forEach((processed: any) => {
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
  let lintProcured: any = [];
  let lintProcessed: any = [];

  for (const sessionId of seasonIds) {
    const fProcured = lintProcuredList.find((production: any) =>
      production?.seasonId == sessionId
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
      data.seasonName = fProcured?.seasonName;
      data.lintProcured = mtConversion(fProcured?.lintProcured);
    }

    if (fProcessed) {
      data.seasonName = fProcessed.dataValues.seasonName;
      data.lintProcessed = mtConversion(fProcessed.dataValues.lintProcessed);
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
  
  const result = await BaleSelection.findAll({
    attributes: [
      [Sequelize.col('sales.season.id'), 'seasonId'],   // season_id from Season
      [Sequelize.col('sales.season.name'), 'seasonName'], 
        [
          sequelize.fn(
            "COALESCE",
            sequelize.fn(
              "SUM",
              Sequelize.literal(`
                CASE
                  WHEN "bale"."accepted_weight" IS NOT NULL THEN "bale"."accepted_weight"
                  ELSE CAST("bale"."weight" AS DOUBLE PRECISION)
                END
              `)
            ),
            0
          ),
          "lintProcured",
        ]
    ],
    where: {
        ...where,
      "$sales.status$": { [Op.in]: ['Sold', 'Partially Accepted', 'Partially Rejected'] },
      [Op.or]: [
        { spinner_status: true },
        {"$sales.status$": 'Sold'}
      ]
    },
    include: [
        {
            model: GinBale,
            as: "bale",
            attributes: []
        },
        {
          model: GinSales,
          as: "sales",
          attributes: [],
          include: [
            {
                model: Season,
                as: "season",
                attributes: []
            },
            {
                model: Spinner,
                as: 'buyerdata',
                attributes: []
            }
        ],
          
      },
    ],
    group: ["sales.season_id", 'sales.season.id'],
    order: [['seasonId', 'desc']],
    limit: 3,
    raw: true
   })


  return result;

};

const getLintProcessedData = async (
  where: any
) => {

  const result = await LintSelections.findAll({
    attributes: [
      [
        sequelize.fn(
          "COALESCE",
          sequelize.fn("SUM", sequelize.col("qty_used")),
          0
        ),
        "lintProcessed",
      ],
      [Sequelize.col('ginsales.season.name'), 'seasonName'],
      [Sequelize.col('ginsales.season.id'), 'seasonId']
    ],
    include: [
      {
        model: SpinProcess,
        as: "spinprocess",
        attributes: [],
        include: [ {
          model: Spinner,
          as: 'spinner',
          attributes: []
        }],
      },
      {
        model: GinSales,
        as: "ginsales",
        attributes: [],
        include: [{
          model: Season,
          as: 'season',
          attributes: []
        }],
      },
    ],
    order: [['seasonId', 'desc']],
    where:{
     '$ginsales.season_id$': { [Op.ne]: null },
     ...where
    },
    group: ['ginsales.season.id']
  });
  console.log(result)
  return result;

};


const getYarnProcuredSold = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const where = getSpinnerProcessWhereQuery(reqData);
    delete where.status
    const procuredData = await getYarnProcuredData(where);
    const soldData = await getYarnSoldData(where);
    const data = await getYarnProcuredSoldRes(
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


const getYarnProcuredSoldRes = async (
  procuredData: any[],
  soldData: any[],
  reqSeason: any
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
      data.yarnProcured = mtConversion(fProcured.dataValues.yarnProcured);
    }

    if (fSold) {
      data.seasonName = fSold.dataValues.seasonName;
      data.yarnSold = mtConversion(fSold.dataValues.yarnSold);
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
    // limit: 3,
    where: {
          id: {
            [Op.in]: Sequelize.literal(`(
              SELECT DISTINCT sales_id
              FROM spin_process_yarn_selections
            )`)
          },
          ...where
        },
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
    // limit: 3,
    where,
    group: ['season.id']
  });

  return result;

};


const getLintProcuredDataByMonth = async (
  where: any
) => {

  const result = await BaleSelection.findAll({
    attributes: [
      [Sequelize.literal("date_part('Month', sales.date)"), 'month'],
      [Sequelize.literal("date_part('Year', sales.date)"), 'year'],
        [
          sequelize.fn(
            "COALESCE",
            sequelize.fn(
              "SUM",
              Sequelize.literal(`
                CASE
                  WHEN "bale"."accepted_weight" IS NOT NULL THEN "bale"."accepted_weight"
                  ELSE CAST("bale"."weight" AS DOUBLE PRECISION)
                END
              `)
            ),
            0
          ),
          "lintProcured",
        ]
    ],
    where: {
        ...where,
      "$sales.status$": { [Op.in]: ['Sold', 'Partially Accepted', 'Partially Rejected'] },
      [Op.or]: [
        { spinner_status: true },
        {"$sales.status$": 'Sold'}
      ]
    },
    include: [
        {
            model: GinBale,
            as: "bale",
            attributes: []
        },
        {
          model: GinSales,
          as: "sales",
          attributes: [],
          include: [
            {
                model: Season,
                as: "season",
                attributes: []
            },
            {
                model: Spinner,
                as: 'buyerdata',
                attributes: []
            }
        ],
          
      },
    ],
    group: ['month', 'year'],
   })

  return result;

};


const getLintProcessedDataByMonth = async (
  where: any
) => {

  const result = await LintSelections.findAll({
    attributes: [
      [
        sequelize.fn(
          "COALESCE",
          sequelize.fn("SUM", sequelize.col("qty_used")),
          0
        ),
        "lintProcessed",
      ],
      [Sequelize.literal("date_part('Month', spinprocess.date)"), 'month'],
      [Sequelize.literal("date_part('Year', spinprocess.date)"), 'year'],
    ],
    include: [
      {
        model: SpinProcess,
        as: "spinprocess",
        attributes: [],
        include: [ {
          model: Spinner,
          as: 'spinner',
          attributes: []
        }],
      },
      {
        model: GinSales,
        as: "ginsales",
        attributes: [],
        include: [{
          model: Season,
          as: 'season',
          attributes: []
        }],
      },
    ],
    where:{
     ...where
    },
    group: ['month', 'year']
  });

  // const result = await SpinProcess.findAll({
  //   attributes: [
  //     [Sequelize.fn('SUM', Sequelize.col('net_yarn_qty')), 'lintProcessed'],
  //     [Sequelize.literal("date_part('Month', date)"), 'month'],
  //     [Sequelize.literal("date_part('Year', date)"), 'year'],
  //   ],
  //   include: [{
  //     model: Spinner,
  //     as: 'spinner',
  //     attributes: []
  //   }],
  //   where,
  //   group: ['month', 'year']
  // });

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
    where: {
      id: {
        [Op.in]: Sequelize.literal(`(
          SELECT DISTINCT sales_id
          FROM spin_process_yarn_selections
        )`)
      },
      ...where
    },
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
      [Sequelize.literal('sum(total_qty) - sum(qty_stock)'), 'yarnSold'],
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
    reqData.season = seasonOne.id;
    const ginSaleWhere = getBaleSelWhereQuery(reqData);
    const lintWhere = getSpinnerLintQuery(reqData);
    const spinProcessWhere = getSpinnerProcessWhereQuery(reqData);
    const lintProcuredData = await getLintProcuredDataByMonth(ginSaleWhere);
    const lintSoldData = await getLintProcessedDataByMonth(lintWhere);
    const yarnProcuredSoldData = await getYarnProcuredDataByMonth(spinProcessWhere);
    const yarnSoldData = await getYarnSoldDataByMonth(spinProcessWhere);
    const data = await getDataAllRes(
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
      data.lintProcured = mtConversion(fProcured.dataValues.lintProcured);
    }

    if (fSold) {
      data.lintProcessed = mtConversion(fSold.dataValues.lintProcessed);
    }
    if (fYarnProcured) {
      data.yarnProcured = mtConversion(fYarnProcured.dataValues.yarnProcured);
    }

    if (fYarnSold) {
      data.yarnSold = mtConversion(fYarnSold.dataValues.yarnSold);
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
    // const where = getSpinnerSalesWhereQuery(reqData);
    const where = getSpinnerYarnQuery(reqData);
    const spinnersData = await getTopYarnCountData(where);
    const data = await getTopYarnCountRes(spinnersData);
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
      count.push(mtConversion(row.dataValues.qty));
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

  // const result = await SpinSales.findAll({
  //   attributes: [
  //     [Sequelize.fn('SUM', Sequelize.col('total_qty')), 'qty'],
  //     [Sequelize.col('yarncount.yarnCount_name'), 'buyerName']
  //   ],
  //   include: [{
  //     model: YarnCount,
  //     as: 'yarncount',
  //     attributes: [],
  //     on: Sequelize.where(
  //       Sequelize.literal('Array[yarncount.id]'),
  //       {
  //         [Op.contained]: Sequelize.col('spin_sales.yarn_count'),
  //       }
  //     ),
  //   }, {
  //     model: Spinner,
  //     as: 'spinner',
  //     attributes: []
  //   }],
  //   where: {
  //     id: {
  //       [Op.in]: Sequelize.literal(`(
  //         SELECT DISTINCT sales_id
  //         FROM spin_process_yarn_selections
  //       )`)
  //     },
  //     ...where
  //   },
  //   order: [['qty', 'desc']],
  //   limit: 10,
  //   group: ['buyerName']
  // });

  const result = await SpinYarn.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('yarn_produced')), 'qty'],
      [Sequelize.col('yarncount.yarnCount_name'), 'buyerName']
    ],
    include: [{
      model: YarnCount,
      as: 'yarncount',
      attributes: []
    },
    {
      model: SpinProcess,
      as: 'spinprocess',
      attributes: [],
      include:[
        {
          model: Spinner,
          as: 'spinner',
          attributes: []
        }
      ]
    }],
    where: {
      ...where
    },
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
    // reqData.season = seasonOne.id;
    // const saleWhere = getSpinnerSalesWhereQuery(reqData);
    const saleWhere = getSpinnerProcessWhereQuery(reqData);
    const spinnersData = await getYarnTypeData(saleWhere);
    const data = await getYarnTypeRes(spinnersData, seasonOne);
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
          qty = mtConversion(fYarnType.dataValues.qty);
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

  // const result = await SpinSales.findAll({
  //   attributes: [
  //     [Sequelize.literal('unnest(spin_sales.yarn_type)'), 'yarnType'],
  //     [Sequelize.fn('SUM', Sequelize.col('total_qty')), 'qty'],
  //     [Sequelize.literal("date_part('Month', date)"), 'month'],
  //     [Sequelize.literal("date_part('Year', date)"), 'year'],
  //   ],
  //   include: [{
  //     model: Spinner,
  //     as: 'spinner',
  //     attributes: []
  //   }],
  //   where: {
  //     id: {
  //       [Op.in]: Sequelize.literal(`(
  //         SELECT DISTINCT sales_id
  //         FROM spin_process_yarn_selections
  //       )`)
  //     },
  //     ...where
  //   },
  //   order: [['qty', 'desc']],
  //   limit: 10,
  //   group: [
  //     Sequelize.literal('unnest(spin_sales.yarn_type)'),
  //     'month',
  //     'year'
  //   ]
  // });
try {
  
  const result = await SpinProcess.findAll({
    attributes: [
      [Sequelize.col('spin_processes.yarn_type'), 'yarnType'],
      [Sequelize.fn('SUM', Sequelize.col('net_yarn_qty')), 'qty'],
      [Sequelize.literal("date_part('Month', date)"), 'month'],
      [Sequelize.literal("date_part('Year', date)"), 'year'],
    ],
    include: [{
      model: Spinner,
      as: 'spinner',
      attributes: []
    }],
    where: {
      ...where
    },
    order: [['qty', 'desc']],
    group: [
      'yarnType',
      'month',
      'year'
    ]
  });

  return result;
} catch (error) {
  console.log(error)
}
};

const getYarnProcessedStock = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const where = getSpinnerProcessWhereQuery(reqData);
    const processedData = await getYarnProcuredData(where);
    const soldData = await getYarnSoldData(where);
    const data = await getYarnProcuredStockRes(
      processedData,
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

const getYarnProcuredStockRes = async (
  procuredData: any[],
  soldData: any[],
  reqSeason: any
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
  let yarnProcessed: any = [];
  let yarnStock: any = [];

  for (const sessionId of seasonIds) {
    const fProcured = procuredData.find((procured: any) =>
      procured.dataValues.seasonId == sessionId
    );
    const fSold = soldData.find((sold: any) =>
      sold.dataValues.seasonId == sessionId
    );
    let data = {
      seasonName: '',
      yarnProcessed: 0,
      yarnStock: 0
    };
    if (fProcured) {
      data.seasonName = fProcured.dataValues.seasonName;
      data.yarnProcessed = mtConversion(fProcured.dataValues.yarnProcured);
    }

    if (fSold) {
      fSold.dataValues.yarnSold = mtConversion(fSold.dataValues.yarnSold)
      data.seasonName = fSold.dataValues.seasonName;
      data.yarnStock = data.yarnProcessed > fSold.dataValues.yarnSold
        ? Number((data.yarnProcessed - fSold.dataValues.yarnSold).toFixed(2))
        : 0;
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
    yarnProcessed.push(data.yarnProcessed);
    yarnStock.push(data.yarnStock);
  }

  return {
    season,
    yarnProcessed,
    yarnStock
  };
};

const getTopYarnProcessed = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const where = getSpinnerProcessWhereQuery(reqData);
    delete where.status
    const spinnersData = await getTopYarnProcessedData(where);
    const data = await getTopYarnProcessedRes(spinnersData);
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};

const getTopYarnProcessedRes = (
  list: any[]
) => {
  const spinners: string[] = [];
  const processed: number[] = [];
  for (const row of list) {
    if (row.dataValues && row.dataValues.spinnerName) {
      spinners.push(row.dataValues.spinnerName);
      processed.push(mtConversion(row.dataValues.processed));
    }
  }

  return {
    spinners,
    processed
  };
};

const getTopYarnProcessedData = async (
  where: any
) => {

  where['$spinner.name$'] = {
    [Op.not]: null
  };

  const result = await SpinProcess.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('net_yarn_qty')), 'processed'],
      [Sequelize.col('spinner.name'), 'spinnerName']
    ],
    include: [{
      model: Spinner,
      as: 'spinner',
      attributes: []
    }],
    where,
    order: [['processed', 'desc']],
    limit: 10,
    group: ['spinner.id']
  });

  return result;

};

const getTopYarnSold = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const where = getSpinnerProcessWhereQuery(reqData);
    delete where.status
    const spinnersData = await getTopYarnSoldData(where);
    const data = getTopYarnSoldRes(spinnersData);
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};

const getTopYarnSoldRes = (
  list: any[]
) => {
  const spinners: string[] = [];
  const sold: number[] = [];
  for (const row of list) {
    if (row.dataValues && row.dataValues.spinnerName) {
      spinners.push(row.dataValues.spinnerName);
      sold.push(mtConversion(row.dataValues.sold));
    }
  }

  return {
    spinners,
    sold
  };
};

const getTopYarnSoldData = async (
  where: any
) => {

  where['$spinner.name$'] = {
    [Op.not]: null
  };

  const result = await SpinSales.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('total_qty')), 'sold'],
      [Sequelize.col('spinner.name'), 'spinnerName']
    ],
    include: [{
      model: Spinner,
      as: 'spinner',
      attributes: []
    }],
    where: {
      id: {
        [Op.in]: Sequelize.literal(`(
          SELECT DISTINCT sales_id
          FROM spin_process_yarn_selections
        )`)
      },
      ...where
    },
    order: [['sold', 'desc']],
    limit: 10,
    group: ['spinner.id']
  });

  return result;

};

const getTopYarnStock = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const spinnersData = await getTopYarnStockData(reqData);
    const data = getTopYarnStockRes(spinnersData);
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};

const getTopYarnStockRes = (
  list: any[]
) => {
  const spinners: string[] = [];
  const stock: number[] = [];
  for (const row of list) {
    if (row && row.spinnerName) {
      spinners.push(row.spinnerName);
      stock.push(mtConversion(row.stock));
    }
  }

  return {
    spinners,
    stock
  };
};

const getTopYarnStockData = async (
  reqData: any
) => {

  const [result] = await sequelize.query(`
    select sn.name                                                                            as "spinnerName",
       ((select sum(sp.net_yarn_qty) from public.spin_processes sp where sp.spinner_id = sn.id) -
        (select sum(sp.total_qty) from public.spin_sales sp where sp.spinner_id = sn.id)) as stock
    from public.spinners sn
    where sn.name is not null ${reqData?.country ? "and sn.country_id = reqData?.country" : ""} ${reqData?.spinner ? "and sn.id = " + reqData?.spinner : ""} ${reqData?.brand ? "and sn.brand @> ARRAY[" + reqData.brand + "]" : ""}
    group by sn.id
    order by stock desc nulls last
    limit 10
  `);

  return result;

};

const getLintProcessedByCountry = async (
  req: Request, res: Response
) => {
  try {

    const reqData = await getQueryParams(req, res);
    const where = getSpinnerLintQuery(reqData);
    const processedData = await getLintProcessedByCountryData(where);
    const data = await getLintProcessedByCountryDataRes(processedData, reqData.season);
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};


const getLintProcessedByCountryData = async (where: any) => {

  const result = await LintSelections.findAll({
    attributes: [
      [
        sequelize.fn(
          "COALESCE",
          sequelize.fn("SUM", sequelize.col("qty_used")),
          0
        ),
        "processed",
      ],
      [Sequelize.col('spinprocess.spinner.country.id'), 'countryId'],
      [Sequelize.col('spinprocess.spinner.country.county_name'), 'countryName'],
      [Sequelize.col('ginsales.season.name'), 'seasonName'],
      [Sequelize.col('ginsales.season.id'), 'seasonId']
    ],
    include: [
      {
        model: SpinProcess,
        as: "spinprocess",
        attributes: [],
        include: [{
          model: Spinner,
          as: 'spinner',
          attributes: [],
          include: [{
            model: Country,
            as: 'country',
            attributes: []
          }]
        }],
      },
      {
        model: GinSales,
        as: "ginsales",
        attributes: [],
        include: [{
          model: Season,
          as: 'season',
          attributes: []
        }],
      },
    ],
    order: [['seasonId', 'desc']],
    // limit: 3,
    where:{
     '$ginsales.season_id$': { [Op.ne]: null },
     ...where
    },
    group: ['spinprocess.spinner.country.id', 'ginsales.season.id']
  });

  return result;
};


const getLintProcessedByCountryDataRes = async (
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

      let processedCount = 0;
      const fFarmerValue = farmerList.find((list: any) =>
        list.dataValues.seasonId == seasonId
      );

      if (fFarmerValue) {
        processedCount = mtConversion(fFarmerValue.dataValues.processed);
        if (!seasonList.includes(fFarmerValue.dataValues.seasonName))
          seasonList.push(fFarmerValue.dataValues.seasonName);
      } else {
        const season = seasons.find((season: any) => season.dataValues.id == seasonId);
        if (!seasonList.includes(season.dataValues.name))
          seasonList.push(season.dataValues.name);
      }
      data.data.push(processedCount);
    }

    processedList.push(data);
  }

  return {
    processedList,
    seasonList,
  };
};

const getLintSoldByCountry = async (
  req: Request, res: Response
) => {
  try {

    const reqData = await getQueryParams(req, res);
    const where = getBaleSelWhereQuery(reqData);
    const soldList = await getLintSoldByCountryData(where);
    const data = await getLintSoldByCountryRes(soldList, reqData.season);
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};


const getLintSoldByCountryData = async (where: any) => {
try {
  const result = await BaleSelection.findAll({
    attributes: [
      [Sequelize.col('sales.season.id'), 'seasonId'],   // season_id from Season
      [Sequelize.col('sales.season.name'), 'seasonName'], 
      [Sequelize.col('sales.buyerdata.country.id'), 'countryId'],   // season_id from Season
      [Sequelize.col('sales.buyerdata.country.county_name'), 'countryName'], 
        [
          sequelize.fn(
            "COALESCE",
            sequelize.fn(
              "SUM",
              Sequelize.literal(`
                CASE
                  WHEN "bale"."accepted_weight" IS NOT NULL THEN "bale"."accepted_weight"
                  ELSE CAST("bale"."weight" AS DOUBLE PRECISION)
                END
              `)
            ),
            0
          ),
          "sold",
        ]
    ],
    where: {
        ...where,
      "$sales.status$": { [Op.in]: ['Sold', 'Partially Accepted', 'Partially Rejected'] },
      [Op.or]: [
        { spinner_status: true },
        {"$sales.status$": 'Sold'}
      ]
    },
    include: [
        {
            model: GinBale,
            as: "bale",
            attributes: []
        },
        {
          model: GinSales,
          as: "sales",
          attributes: [],
          include: [
            {
              model: Ginner,
              as: 'ginner',
              attributes: []
            },
            {
                model: Season,
                as: "season",
                attributes: []
            },
            {
                model: Spinner,
                as: 'buyerdata',
                attributes: [],
                include: [{
                  model: Country,
                  as: 'country',
                  attributes: []
                }]
            }
        ],
          
      },
    ],
    group: ["sales.buyerdata.country.id", 'sales.season.id'],
   })
   return result;
} catch (error) {
  console.log(error)
} 
};


const getLintSoldByCountryRes = async (
  soldCountList: any = [],
  reqSeason: any
) => {
  let seasonIds: number[] = [];
  let countries: number[] = [];

  soldCountList.forEach((list: any) => {
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
  let soldList: any[] = [];


  for (const countryName of countries) {
    const data: any = {
      name: countryName,
      data: [],
    };
    const lSoldList = soldCountList.filter((list: any) =>
      list.dataValues.countryName == countryName
    );

    for (const seasonId of seasonIds) {

      let totalSold = 0;
      const gSoldValue = lSoldList.find((list: any) =>
        list.dataValues.seasonId == seasonId
      );

      if (gSoldValue) {
        totalSold = mtConversion(gSoldValue.dataValues.sold);
        if (!seasonList.includes(gSoldValue.dataValues.seasonName))
          seasonList.push(gSoldValue.dataValues.seasonName);
      }
      else {
        const season = seasons.find((season: any) => season.dataValues.id == seasonId);
        if (!seasonList.includes(season.dataValues.name))
          seasonList.push(season.dataValues.name);
      }
      data.data.push(totalSold);
    }

    soldList.push(data);
  }

  return {
    soldList,
    seasonList,
  };
};

const getYarnProcessedByCountry = async (
  req: Request, res: Response
) => {
  try {

    const reqData = await getQueryParams(req, res);
    const where = getSpinnerProcessWhereQuery(reqData);
    const processedList = await getYarnProcessedByCountryData(where);
    const data = await getYarnProcessedByCountryRes(processedList, reqData.season);
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};


const getYarnProcessedByCountryData = async (where: any) => {

  where['$spinner.country_id$'] = {
    [Op.notIn]: [34]
  };

  const result = await SpinProcess.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('net_yarn_qty')), 'processed'],
      [Sequelize.col('spinner.country.id'), 'countryId'],
      [Sequelize.col('spinner.country.county_name'), 'countryName'],
      [Sequelize.col('season.id'), 'seasonId'],
      [Sequelize.col('season.name'), 'seasonName']
    ],
    include: [{
      model: Spinner,
      as: 'spinner',
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
    group: ['spinner.country.id', 'season.id']
  });

  return result;
};


const getYarnProcessedByCountryRes = async (
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
    const fProcessedList = processedCountList.filter((list: any) =>
      list.dataValues.countryName == countryName
    );

    for (const seasonId of seasonIds) {

      let totalProcessed = 0;
      const gSoldValue = fProcessedList.find((list: any) =>
        list.dataValues.seasonId == seasonId
      );

      if (gSoldValue) {
        totalProcessed = mtConversion(gSoldValue.dataValues.processed);
        if (!seasonList.includes(gSoldValue.dataValues.seasonName))
          seasonList.push(gSoldValue.dataValues.seasonName);
      }
      else {
        const season = seasons.find((season: any) => season.dataValues.id == seasonId);
        if (!seasonList.includes(season.dataValues.name))
          seasonList.push(season.dataValues.name);
      }
      data.data.push(totalProcessed);
    }

    processedList.push(data);
  }

  return {
    processedList,
    seasonList,
  };
};

const getYarnSoldByCountry = async (
  req: Request, res: Response
) => {
  try {

    const reqData = await getQueryParams(req, res);
    const where = getSpinnerProcessWhereQuery(reqData);
    delete where.status
    const processedList = await getYarnSoldByCountryData(where);
    const data = await getYarnSoldByCountryRes(processedList, reqData.season);
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};


const getYarnSoldByCountryData = async (where: any) => {

  where['$spinner.country_id$'] = {
    [Op.notIn]: [34]
  };
  const result = await SpinSales.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('total_qty')), 'sold'],
      [Sequelize.col('spinner.country.id'), 'countryId'],
      [Sequelize.col('spinner.country.county_name'), 'countryName'],
      [Sequelize.col('season.id'), 'seasonId'],
      [Sequelize.col('season.name'), 'seasonName']
    ],
    include: [{
      model: Spinner,
      as: 'spinner',
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
    where: {
      id: {
        [Op.in]: Sequelize.literal(`(
          SELECT DISTINCT sales_id
          FROM spin_process_yarn_selections
        )`)
      },
      ...where
    },
    group: ['spinner.country.id', 'season.id']
  });

  return result;
};


const getYarnSoldByCountryRes = async (
  soldCountList: any = [],
  reqSeason: any
) => {
  let seasonIds: number[] = [];
  let countries: number[] = [];

  soldCountList.forEach((list: any) => {
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
  let soldList: any[] = [];


  for (const countryName of countries) {
    const data: any = {
      name: countryName,
      data: [],
    };
    const fSoldList = soldCountList.filter((list: any) =>
      list.dataValues.countryName == countryName
    );

    for (const seasonId of seasonIds) {

      let totalSold = 0;
      const gSoldValue = fSoldList.find((list: any) =>
        list.dataValues.seasonId == seasonId
      );

      if (gSoldValue) {
        totalSold = mtConversion(gSoldValue.dataValues.sold);
        if (!seasonList.includes(gSoldValue.dataValues.seasonName))
          seasonList.push(gSoldValue.dataValues.seasonName);
      }
      else {
        const season = seasons.find((season: any) => season.dataValues.id == seasonId);
        if (!seasonList.includes(season.dataValues.name))
          seasonList.push(season.dataValues.name);
      }
      data.data.push(totalSold);
    }

    soldList.push(data);
  }

  return {
    soldList,
    seasonList,
  };
};

const getYarnProducedByCountry = async (
  req: Request, res: Response
) => {
  try {

    const reqData = await getQueryParams(req, res);
    const where = getSpinnerProcessWhereQuery(reqData);
    const producedList = await getYarnProducedByCountryData(where);
    const data = await getYarnProducedByCountryRes(producedList, reqData.season);
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};


const getYarnProducedByCountryData = async (where: any) => {

  where['$spinner.country_id$'] = {
    [Op.notIn]: [34]
  };

  const result = await SpinProcess.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('net_yarn_qty')), 'processed'],
      [Sequelize.col('spinner.country.id'), 'countryId'],
      [Sequelize.col('spinner.country.county_name'), 'countryName'],
      [Sequelize.col('season.id'), 'seasonId'],
      [Sequelize.col('season.name'), 'seasonName']
    ],
    include: [{
      model: Spinner,
      as: 'spinner',
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
    group: ['spinner.country.id', 'season.id']
  });

  return result;
};


const getYarnProducedByCountryRes = async (
  producedCountList: any = [],
  reqSeason: any
) => {
  let seasonIds: number[] = [];
  let countries: number[] = [];

  producedCountList.forEach((list: any) => {
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
  let producedList: any[] = [];


  for (const countryName of countries) {
    const data: any = {
      name: countryName,
      data: [],
    };
    const fProcessedList = producedCountList.filter((list: any) =>
      list.dataValues.countryName == countryName
    );

    for (const seasonId of seasonIds) {

      let totalProcessed = 0;
      const gSoldValue = fProcessedList.find((list: any) =>
        list.dataValues.seasonId == seasonId
      );

      if (gSoldValue) {
        totalProcessed = mtConversion(gSoldValue.dataValues.processed);
        if (!seasonList.includes(gSoldValue.dataValues.seasonName))
          seasonList.push(gSoldValue.dataValues.seasonName);
      }
      else {
        const season = seasons.find((season: any) => season.dataValues.id == seasonId);
        if (!seasonList.includes(season.dataValues.name))
          seasonList.push(season.dataValues.name);
      }
      data.data.push(totalProcessed);
    }

    producedList.push(data);
  }

  return {
    producedList,
    seasonList,
  };
};


const getYarnStockByCountry = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const where = getSpinnerProcessWhereQuery(reqData);
    const processedData = await getYarnProcessedByCountryData(where);
    const soldData = await getYarnSoldByCountryData(where);
    const data = await getYarnStockByCountryRes(
      processedData,
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


const getYarnStockByCountryRes = async (
  processedCountData: any[],
  soldCountData: any[],
  reqSeason: any
) => {
  let seasonIds: number[] = [];
  let countries: number[] = [];

  processedCountData.forEach((list: any) => {
    if (!countries.includes(list.dataValues.countryName))
      countries.push(list.dataValues.countryName);

    if (!seasonIds.includes(list.dataValues.seasonId))
      seasonIds.push(list.dataValues.seasonId);
  });

  soldCountData.forEach((list: any) => {
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
  let stockList: any[] = [];


  for (const countryName of countries) {
    const data: any = {
      name: countryName,
      data: [],
    };
    const fProcessedList = processedCountData.filter((list: any) =>
      list.dataValues.countryName == countryName
    );

    const fSoldList = soldCountData.filter((list: any) =>
      list.dataValues.countryName == countryName
    );

    for (const seasonId of seasonIds) {

      let totalStock = {
        processed: 0,
        sold: 0,
      };

      const gProducedValue = fProcessedList.find((list: any) =>
        list.dataValues.seasonId == seasonId
      );

      const gSoldValue = fSoldList.find((list: any) =>
        list.dataValues.seasonId == seasonId
      );

      if (gProducedValue) {
        totalStock.processed = mtConversion(gProducedValue.dataValues.processed);
        if (!seasonList.includes(gProducedValue.dataValues.seasonName))
          seasonList.push(gProducedValue.dataValues.seasonName);
      }
      else {
        const season = seasons.find((season: any) => season.dataValues.id == seasonId);
        if (!seasonList.includes(season.dataValues.name))
          seasonList.push(season.dataValues.name);
      }

      if (gSoldValue) {
        totalStock.sold = mtConversion(gSoldValue.dataValues.sold);
        if (!seasonList.includes(gSoldValue.dataValues.seasonName))
          seasonList.push(gSoldValue.dataValues.seasonName);
      }
      else {
        const season = seasons.find((season: any) => season.dataValues.id == seasonId);
        if (!seasonList.includes(season.dataValues.name))
          seasonList.push(season.dataValues.name);
      }

      data.data.push(totalStock.processed > totalStock.sold ? Number((totalStock.processed - totalStock.sold).toFixed(2)) : 0);
    }

    stockList.push(data);
  }

  return {
    stockList,
    seasonList,
  };
};

const getYarnAverageRealisationByCountry = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const query = getSpinnerProcessWhereQuery(reqData);
    const ginnersData = await getSpinnerYarnRealisationByCountryData(query);
    const data = await getSpinnerYarnRealisationByCountryRes(ginnersData, reqData.season);
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};


const getSpinnerYarnRealisationByCountryData = async (where: any) => {
  const result = await SpinProcess.findAll({
    attributes: [
      [sequelize.fn('AVG', sequelize.col('yarn_realisation')), 'realisation'],
      [sequelize.col('spinner.country.county_name'), 'countryName'],
      [sequelize.col('spinner.country.id'), 'countryId'],
      [sequelize.col('season.id'), 'seasonId'],
      [sequelize.col('season.name'), 'seasonName']
    ],
    include: [
      {
        model: Spinner,
        as: "spinner",
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
    group: ['spinner.country.id', 'season.id'],
    order: [[sequelize.col('season.id'), 'DESC']]
  });

  return result;
};

const getSpinnerYarnRealisationByCountryRes = async (
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
        totalArea = formatNumber(gProcessedValue.dataValues.realisation);
        if (!seasonList.includes(gProcessedValue.dataValues.seasonName))
          seasonList.push(gProcessedValue.dataValues.seasonName);
      } else {
        seasons.forEach((season: any) => {
          if (season.id == seasonId && !seasonList.includes(season.name)) {
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

const getSpinLintGreyoutStock = async ( req: Request, res: Response) =>{
  try {
    const reqData = await getQueryParams(req, res);
    const ginSaleWhere = getGinnerSalesWhereQuery(reqData);
    const spinProcessWhere = getSpinnerLintQuery(reqData);
    const lintProcuredData = await getSpinLintProcuredData(ginSaleWhere);
    const lintProcessedData = await getLintProcessedData(spinProcessWhere);
    const greyoutData = await getSpinLintGreyoutData(ginSaleWhere);


    const data = await getLintGreyoutQtyComparisonRes(
      lintProcuredData,
      lintProcessedData,
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

const getLintGreyoutQtyComparisonRes = async (
  procuredData: any[],
  processedData: any[],
  greyoutData: any[],
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
  let procured: any = [];
  let total_stock: any = [];
  let greyout_qty: any = [];
  let actual_stock: any = [];

  for (const sessionId of seasonIds) {
    const fProcured = procuredData.find((production: any) =>
      production.dataValues.seasonId == sessionId
    );
    const fProcessed = processedData.find((processed: any) =>
      processed.dataValues.seasonId == sessionId
    );

    const fGreyout = greyoutData.find((processed: any) =>
      processed.dataValues.seasonId == sessionId
    );

    let data = {
      seasonName: '',
      procured: 0,
      processed: 0,
      total_stock: 0,
      greyout_qty: 0,
      actual_stock: 0,
    };
    if (fProcured) {
      data.seasonName = fProcured.dataValues.seasonName;
      data.procured = mtConversion(fProcured.dataValues.lintProcured);
    }

    if (fProcessed) {
      data.seasonName = fProcessed.dataValues.seasonName;
      data.processed = mtConversion(fProcessed.dataValues.lintProcessed);
    }

    if (fGreyout) {
      data.seasonName = fGreyout.dataValues.seasonName;
      data.greyout_qty = mtConversion(fGreyout.dataValues.lintGreyout);
    }

    data.total_stock =
      data.procured > data.processed
        ? Number((data.procured - data.processed).toFixed(2))
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
    procured.push(data.procured);

  }

  return {
    season,
    procured,
    processed,
    total_stock,
    greyout_qty,
    actual_stock
  };
};

const getSpinLintProcuredData = async (
  where: any
) => {

  where['$gin_sales.status$'] = 'Sold';

  const result = await GinSales.findAll({
    attributes: [
      [Sequelize.col('season.id'), 'seasonId'],   // season_id from Season
      [Sequelize.col('season.name'), 'seasonName'], 
      [Sequelize.fn('SUM', Sequelize.col('total_qty')), 'lintProcured']
    ],
    include: [
      {
        model: Season,
        as: 'season',
        attributes: [] 
      },
      {
        model: Spinner,
        as: 'buyerdata',
        attributes: []
      }
    ],
    where: {
      id: {
        [Op.in]: Sequelize.literal(`(
          SELECT DISTINCT sales_id
          FROM bale_selections
        )`)
      },
      ...where
    },
    order: [['seasonId', 'desc']],
    limit: 3,
    group: ['season_id', 'season.id'],
    // raw: true
  });


  return result;

};

const getSpinLintGreyoutData = async (
  where: any
) => {

  where['$gin_sales.status$'] = 'Sold';
  where['$gin_sales.greyout_status$'] = true;

  const result = await GinSales.findAll({
    attributes: [
      [Sequelize.col('season.id'), 'seasonId'],   // season_id from Season
      [Sequelize.col('season.name'), 'seasonName'], 
      [Sequelize.fn('SUM', Sequelize.col('qty_stock')), 'lintGreyout']
    ],
    include: [
      {
        model: Season,
        as: 'season',
        attributes: [] 
      },
      {
        model: Spinner,
        as: 'buyerdata',
        attributes: []
      }
    ],
    where: {
      id: {
        [Op.in]: Sequelize.literal(`(
          SELECT DISTINCT sales_id
          FROM bale_selections
        )`)
      },
      ...where
    },
    order: [['seasonId', 'desc']],
    limit: 3,
    group: ['season_id', 'season.id'],
    // raw: true
  });


  return result;
};


const getSpinYarnGreyoutStock = async ( req: Request, res: Response) =>{
  try {
    const reqData = await getQueryParams(req, res);
    const where = getSpinnerProcessWhereQuery(reqData);
    const processedData = await getYarnProcuredData(where);
    const soldData = await getYarnSoldData(where);
    const greyoutData = await getYarnGreyoutData(where);

    const data = await getYarnGreyoutComparisonRes(
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

const getYarnGreyoutComparisonRes = async (
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
    if (!seasonIds.includes(processed.dataValues.seasonId))
      seasonIds.push(processed.dataValues.seasonId);
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
      processed.dataValues.seasonId == sessionId
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
      data.processed = mtConversion(fProcured.dataValues.yarnProcured);
    }

    if (fSold) {
      data.seasonName = fSold.dataValues.seasonName;
      data.sold = mtConversion(fSold.dataValues.yarnSold);
    }

    if (fGreyout) {
      data.seasonName = fGreyout.dataValues.seasonName;
      data.greyout_qty = mtConversion(fGreyout.dataValues.yarnGreyout);
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

const getYarnGreyoutData = async (
  where: any
) => {
  where.greyout_status = true;

  const result = await SpinProcess.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('qty_stock')), 'yarnGreyout'],
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
    // limit: 3,
    where,
    group: ['season.id']
  });

  return result;

};




export {
  getTopGinners,
  getLintProcuredProcessed,
  getYarnProcuredSold,
  getDataAll,
  getTopFabric,
  getTopYarnCount,
  getYarnType,
  getYarnProcessedStock,
  getTopYarnProcessed,
  getTopYarnSold,
  getTopYarnStock,
  getLintProcessedByCountry,
  getLintSoldByCountry,
  getYarnProcessedByCountry,
  getYarnSoldByCountry,
  getYarnProducedByCountry,
  getYarnStockByCountry,
  getYarnAverageRealisationByCountry,
  getSpinLintGreyoutStock,
  getSpinYarnGreyoutStock
};