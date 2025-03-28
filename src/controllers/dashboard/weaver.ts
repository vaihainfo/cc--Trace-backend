import { Request, Response } from "express";
import { Sequelize } from "sequelize";
import * as yup from 'yup';
import Program from "../../models/program.model";
import Season from "../../models/season.model";
import FabricType from "../../models/fabric-type.model";
import Garment from "../../models/garment.model";
import Fabric from "../../models/fabric.model";
import SpinSales from "../../models/spin-sales.model";
import WeaverSales from "../../models/weaver-sales.model";
import Weaver from "../../models/weaver.model";
import WeaverProcess from "../../models/weaver-process.model";
import Spinner from "../../models/spinner.model";
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
      weaver,
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
    await validator.validate(weaver);
    await validator.validate(fromDate);
    await validator.validate(toDate);

    return {
      program,
      brand,
      season,
      country,
      state,
      district,
      weaver,
      fromDate,
      toDate,
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

const mtConversion = (value: number) => {
  return value > 0 ? Number((value / 1000).toFixed(2)) : 0
}


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



const getSpinnerSalesWhereQuery = (
  reqData: any
) => {
  const where: any = {
    status: "Sold"
  };

  if (reqData?.program)
    where.program_id = reqData.program;

  if (reqData?.brand)
    where['$weaver.brand$'] = {
      [Op.contains]: Sequelize.literal(`ARRAY [${reqData.brand}]`)
    };

  if (reqData?.season)
    where.season_id = reqData.season;

  if (reqData?.country)
    where['$weaver.country_id$'] = reqData.country;

  if (reqData?.state)
    where['$weaver.state_id$'] = reqData.state;

  if (reqData?.district)
    where['$weaver.district_id$'] = reqData.district;

  where['$weaver.id$'] = { [Op.not]: null };

  if (reqData?.weaver)
    where['$weaver.id$'] = reqData.weaver;

  if (reqData?.fromDate)
    where.date = { [Op.gte]: reqData.fromDate };

  if (reqData?.toDate)
    where.date = { [Op.lt]: reqData.toDate };

  if (reqData?.fromDate && reqData?.toDate)
    where.date = { [Op.between]: [reqData.fromDate, reqData.toDate] };

  return where;
};


const getWeaverSalesWhereQuery = (
  reqData: any
) => {
  const where: any = {
    status: "Sold"
  };

  if (reqData?.program)
    where.program_id = reqData.program;

  if (reqData?.season)
    where.season_id = reqData.season;

  if (reqData?.brand)
    where['$weaver.brand$'] = {
      [Op.contains]: Sequelize.literal(`ARRAY [${reqData.brand}]`)
    };

  if (reqData?.country)
    where['$weaver.country_id$'] = reqData.country;

  if (reqData?.state)
    where['$weaver.state_id$'] = reqData.state;

  if (reqData?.district)
    where['$weaver.district_id$'] = reqData.district;

  where['$weaver.id$'] = { [Op.not]: null };

  if (reqData?.weaver)
    where['$weaver.id$'] = reqData.weaver;

  if (reqData?.fromDate)
    where.date = { [Op.gte]: reqData.fromDate };

  if (reqData?.toDate)
    where.date = { [Op.lt]: reqData.toDate };

  if (reqData?.fromDate && reqData?.toDate)
    where.date = { [Op.between]: [reqData.fromDate, reqData.toDate] };


  return where;


};


const getYarnCompareCount = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const salesWhere = getSpinnerSalesWhereQuery(reqData);
    const knitterWhere = getWeaverSalesWhereQuery(reqData);
    const procuredList = await getYarnProcuredData(salesWhere);
    const processedList = await getYarnProcessedData(knitterWhere);
    const data = await getYarnCompareCountRes(
      procuredList,
      processedList,
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


const getYarnCompareCountRes = async (
  yarnProcuredList: any[],
  yarnProcessedList: any[],
  reqSeason: any
) => {
  let seasonIds: number[] = [];

  yarnProcuredList.forEach((procured: any) => {
    if (procured.dataValues.seasonId)
      seasonIds.push(procured.dataValues.seasonId);
  });

  yarnProcessedList.forEach((processed: any) => {
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
  let yarnProcured: any = [];
  let yarnProcessed: any = [];
  let yarnStock: any = [];

  for (const sessionId of seasonIds) {
    const fProcured = yarnProcuredList.find((production: any) =>
      production.dataValues.seasonId == sessionId
    );
    const fProcessed = yarnProcessedList.find((estimate: any) =>
      estimate.dataValues.seasonId == sessionId
    );
    let data = {
      seasonName: '',
      yarnProcured: 0,
      yarnProcessed: 0
    };
    if (fProcured) {
      data.seasonName = fProcured.dataValues.seasonName;
      data.yarnProcured = mtConversion(fProcured.dataValues.procured);
    }

    if (fProcessed) {
      data.seasonName = fProcessed.dataValues.seasonName;
      data.yarnProcessed = mtConversion(fProcessed.dataValues.processed);
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
    yarnProcessed.push(data.yarnProcessed);
    yarnStock.push(data.yarnProcured > data.yarnProcessed ? Number((data.yarnProcured - data.yarnProcessed).toFixed(2)) : 0);

  }

  return {
    season,
    yarnProcured,
    yarnProcessed,
    yarnStock
  };
};



const getYarnProcessedData = async (
  where: any
) => {
  const result = await WeaverProcess.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('total_yarn_qty')), 'processed'],
      [Sequelize.col('season.name'), 'seasonName'],
      [Sequelize.col('season.id'), 'seasonId']
    ],
    include: [{
      model: Season,
      as: 'season',
      attributes: []
    }, {
      model: Weaver,
      as: 'weaver',
      attributes: [],
    }],
    where,
    order: [['seasonId', 'desc']],
    limit: 3,
    group: ['season.id']
  });

  return result;
};

const getYarnProcuredData = async (
  where: any
) => {
  const result = await SpinSales.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('total_qty')), 'procured'],
      [Sequelize.col('season.name'), 'seasonName'],
      [Sequelize.col('season.id'), 'seasonId']
    ],
    include: [{
      model: Season,
      as: 'season',
      attributes: []
    }, {
      model: Weaver,
      as: 'weaver',
      attributes: [],
    }],
    where,
    order: [['seasonId', 'desc']],
    limit: 3,
    group: ['season.id']
  });

  return result;
};


const getFabricCompareCount = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const where = getWeaverSalesWhereQuery(reqData);
    const processedList = await getFabricProcessedData(where);
    const soldList = await getFabricSoldData(where);
    const data = await getFabricCompareCountRes(
      processedList,
      soldList,
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


const getFabricCompareCountRes = async (
  fabricProcessedList: any[],
  fabricSoldList: any[],
  reqSeason: any
) => {
  let seasonIds: number[] = [];

  fabricProcessedList.forEach((processed: any) => {
    if (processed.dataValues.seasonId)
      seasonIds.push(processed.dataValues.seasonId);
  });

  fabricSoldList.forEach((sold: any) => {
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
  let fabricProcessed: any = [];
  let fabricSold: any = [];

  for (const sessionId of seasonIds) {
    const fProcessed = fabricProcessedList.find((processed: any) =>
      processed.dataValues.seasonId == sessionId
    );
    const fSold = fabricSoldList.find((sold: any) =>
      sold.dataValues.seasonId == sessionId
    );
    let data = {
      seasonName: '',
      fabricProcessed: 0,
      fabricSold: 0
    };
    if (fProcessed) {
      data.seasonName = fProcessed.dataValues.seasonName;
      data.fabricProcessed = mtConversion(fProcessed.dataValues.processed);
    }

    if (fSold) {
      data.seasonName = fSold.dataValues.seasonName;
      data.fabricSold = mtConversion(fSold.dataValues.sold);
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
    fabricProcessed.push(data.fabricProcessed);
    fabricSold.push(data.fabricSold);
  }

  return {
    season,
    fabricProcessed,
    fabricSold
  };
};


const getFabricProcessedData = async (
  where: any
) => {
  const result = await WeaverProcess.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('total_fabric_length')), 'processed'],
      [Sequelize.col('season.name'), 'seasonName'],
      [Sequelize.col('season.id'), 'seasonId']
    ],
    include: [{
      model: Season,
      as: 'season',
      attributes: []
    }, {
      model: Weaver,
      as: 'weaver',
      attributes: [],
    }],
    where,
    order: [['seasonId', 'desc']],
    limit: 3,
    group: ['season.id']
  });

  return result;
};


const getFabricSoldData = async (
  where: any
) => {
  const result = await WeaverSales.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('total_fabric_length')), 'sold'],
      [Sequelize.col('season.name'), 'seasonName'],
      [Sequelize.col('season.id'), 'seasonId']
    ],
    include: [{
      model: Season,
      as: 'season',
      attributes: []
    }, {
      model: Weaver,
      as: 'weaver',
      attributes: [],
    }],
    where,
    order: [['seasonId', 'desc']],
    limit: 3,
    group: ['season.id']
  });

  return result;
};


const getFabricYarnMonthlyData = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const seasonOne = await Season.findOne({
      where: {
        id: reqData.season ? reqData.season : '10'
      }
    });
    reqData.season = seasonOne.id;
    const salesWhere = getSpinnerSalesWhereQuery(reqData);
    const knitterWhere = getWeaverSalesWhereQuery(reqData);
    const yarnProcuredList = await getYarnProcuredMonthlyData(salesWhere);
    const yarnProcessedList = await getYarnProcessedMonthlyData(knitterWhere);
    const fabricProcessedList = await getFabricProcessedMonthlyData(knitterWhere);
    const fabricSoldList = await getFabricSoldMonthlyData(knitterWhere);
    const data = getFabricYarnMonthlyDataRes(
      yarnProcuredList,
      yarnProcessedList,
      fabricProcessedList,
      fabricSoldList,
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


const getFabricYarnMonthlyDataRes = (
  yarnProcuredList: any[],
  yarnProcessedList: any[],
  fabricProcessedList: any[],
  fabricSoldList: any[],
  season: any
) => {
  const monthList = getMonthDate(season.from, season.to);

  const res: {
    [key: string]: Array<string | number>;
  } = {
    month: [],
    yarnProcured: [],
    yarnProcessed: [],
    fabricProcessed: [],
    fabricSold: []
  };

  for (const month of monthList) {
    const fYarnProcured = yarnProcuredList.find((procured: any) =>
      (procured.dataValues.month - 1) == month.month &&
      procured.dataValues.year == month.year
    );
    const fYarnProcessed = yarnProcessedList.find((processed: any) =>
      (processed.dataValues.month - 1) == month.month &&
      processed.dataValues.year == month.year
    );
    const fFabricProcessed = fabricProcessedList.find((processed: any) =>
      (processed.dataValues.month - 1) == month.month &&
      processed.dataValues.year == month.year
    );
    const fFabricSold = fabricSoldList.find((sold: any) =>
      (sold.dataValues.month - 1) == month.month &&
      sold.dataValues.year == month.year
    );

    let data = {
      yarnProcured: 0,
      yarnProcessed: 0,
      fabricProcessed: 0,
      fabricSold: 0
    };

    if (fYarnProcured)
      data.yarnProcured = mtConversion(fYarnProcured.dataValues.procured);

    if (fYarnProcessed)
      data.yarnProcessed = mtConversion(fYarnProcessed.dataValues.processed);

    if (fFabricProcessed)
      data.fabricProcessed = mtConversion(fFabricProcessed.dataValues.processed);

    if (fFabricSold)
      data.fabricSold = mtConversion(fFabricSold.dataValues.sold);

    res.month.push(getMonthName(month.month));
    res.yarnProcured.push(data.yarnProcured);
    res.yarnProcessed.push(data.yarnProcessed);
    res.fabricProcessed.push(data.fabricProcessed);
    res.fabricSold.push(data.fabricSold);

  }

  return res;

};



const getFabricSoldMonthlyData = async (
  where: any
) => {
  const result = await WeaverSales.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('total_fabric_length')), 'sold'],
      [Sequelize.literal("date_part('Month', date)"), 'month'],
      [Sequelize.literal("date_part('Year', date)"), 'year'],
    ],
    include: [{
      model: Weaver,
      as: 'weaver',
      attributes: [],
    }],
    where,
    group: ['month', 'year']
  });

  return result;
};


const getFabricProcessedMonthlyData = async (
  where: any
) => {
  const result = await WeaverProcess.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('total_fabric_length')), 'processed'],
      [Sequelize.literal("date_part('Month', date)"), 'month'],
      [Sequelize.literal("date_part('Year', date)"), 'year'],
    ],
    include: [{
      model: Weaver,
      as: 'weaver',
      attributes: [],
    }],
    where,
    group: ['month', 'year']
  });

  return result;
};


const getYarnProcessedMonthlyData = async (
  where: any
) => {
  const result = await WeaverProcess.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('total_yarn_qty')), 'processed'],
      [Sequelize.literal("date_part('Month', date)"), 'month'],
      [Sequelize.literal("date_part('Year', date)"), 'year'],
    ],
    include: [{
      model: Weaver,
      as: 'weaver',
      attributes: [],
    }],
    where,
    group: ['month', 'year']
  });

  return result;
};

const getYarnProcuredMonthlyData = async (
  where: any
) => {
  const result = await SpinSales.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('total_qty')), 'procured'],
      [Sequelize.literal("date_part('Month', date)"), 'month'],
      [Sequelize.literal("date_part('Year', date)"), 'year'],
    ],
    include: [{
      model: Weaver,
      as: 'weaver',
      attributes: [],
    }],
    where,
    group: ['month', 'year']
  });

  return result;
};


const getTopYarnProcured = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const where = getSpinnerSalesWhereQuery(reqData);
    const fabricList = await getTopYarnProcuredData(where);
    const data = getTopYarnProcuredRes(fabricList);
    return res.sendSuccess(res, data);
  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};



const getTopYarnProcuredRes = (yarnList: any) => {
  const name: string[] = [];
  const count: number[] = [];
  for (const row of yarnList) {
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


const getTopYarnProcuredData = async (
  where: any
) => {
  const result = await SpinSales.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('total_qty')), 'qty'],
      [Sequelize.col(`weaver.name`), 'buyerName'],
    ],
    include: [{
      model: Weaver,
      as: 'weaver',
      attributes: [],
    }, {
      model: Spinner,
      as: 'spinner',
      attributes: [],
    }],
    where,
    limit: 10,
    order: [['qty', 'desc']],
    group: ['buyerName']
  });

  return result;
};


const getTopFabricSold = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const where = getWeaverSalesWhereQuery(reqData);
    const fabricList = await getTopFabricSoldData(where);
    const data = getTopFabricSoldRes(fabricList);
    return res.sendSuccess(res, data);
  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};


const getTopFabricSoldRes = (yarnList: any) => {
  const name: string[] = [];
  const count: number[] = [];
  for (const row of yarnList) {
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

const getTopFabricSoldData = async (
  where: any
) => {
  const result = await WeaverSales.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('total_fabric_length')), 'qty'],
      [Sequelize.literal(`case
                when buyer.id is not null
                    then buyer.name
                when dyingwashing.id is not null
                    then dyingwashing.name
                else processor_name
              end`), 'buyerName'],
    ],
    include: [{
      model: Garment,
      as: 'buyer',
      attributes: [],
    }, {
      model: Fabric,
      as: 'dyingwashing',
      attributes: [],
    }, {
      model: Weaver,
      as: 'weaver',
      attributes: [],
    }],
    where,
    order: [['qty', 'desc']],
    group: ['buyerName']
  });

  return result;
};

const getFabricType = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const seasonOne = await Season.findOne({
      where: {
        id: reqData.season ? reqData.season : '10'
      }
    });
    reqData.season = seasonOne.id;
    const salesWhere = getWeaverSalesWhereQuery(reqData);
    const fabricList = await getFabricTypeData(salesWhere);
    const data = getFabricTypeRes(
      fabricList,
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


const getFabricTypeRes = (
  spinnersSalesData: any[],
  season: any
) => {
  const monthList = getMonthDate(season.from, season.to);
  const yarnTypes: string[] = [];
  spinnersSalesData.forEach(salesData => {
    if (!yarnTypes.includes(salesData.dataValues.fabricType))
      yarnTypes.push(salesData.dataValues.fabricType);
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
          salesData.dataValues.fabricType == yarnData.name
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


const getFabricTypeData = async (
  where: any
) => {
  const result = await WeaverSales.findAll({
    attributes: [
      [Sequelize.col('fabric.fabricType_name'), 'fabricType'],
      [Sequelize.fn('SUM', Sequelize.col('total_fabric_length')), 'qty'],
      [Sequelize.literal("date_part('Month', date)"), 'month'],
      [Sequelize.literal("date_part('Year', date)"), 'year'],
    ],
    include: [{
      model: FabricType,
      as: 'fabric',
      attributes: [],
      on: Sequelize.where(
        Sequelize.literal('Array[fabric.id]'),
        {
          [Op.contained]: Sequelize.col('fabric_type'),
        }
      ),
    }, {
      model: Weaver,
      as: 'weaver',
      attributes: [],
    }],
    where,
    order: [['qty', 'desc']],
    limit: 10,
    group: [
      'fabricType',
      'month',
      'year'
    ]
  });

  return result;
};


const getFabricInventory = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const where = getWeaverSalesWhereQuery(reqData);
    const fabricList = await getFabricData(where);
    const data = getKnitterFabricRes(fabricList);
    return res.sendSuccess(res, data);
  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};


const getKnitterFabricRes = (yarnList: any) => {
  let programs: string[] = [];
  for (const yarn of yarnList) {
    if (!programs.includes(yarn.dataValues.programName))
      programs.push(yarn.dataValues.programName);
  }

  let fabricList: {
    name: string,
    data: number[];
  }[] = [];

  for (const yarn of yarnList) {
    const fabricWeight = mtConversion(yarn.dataValues.fabricWeight);
    const fabricName = yarn.dataValues.fabricName ?? "";

    const fFabric = fabricList.find(fabric =>
      fabric.name === fabricName
    );
    if (fFabric) {
      const pIndex = programs.findIndex(program =>
        program == yarn.dataValues.programName
      );
      fFabric.data[pIndex] = fabricWeight;

    } else {
      const data: number[] = [];
      for (const program of programs) {
        data.push(yarn.dataValues.programName == program
          ? fabricWeight
          : 0
        );
      }

      fabricList.push({
        name: fabricName,
        data
      });
    }
  }

  return {
    program: programs,
    fabricList
  };
};


const getFabricData = async (
  where: any
) => {
  const estimateAndProduction = await WeaverSales.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('total_fabric_length')), 'fabricWeight'],
      [Sequelize.col('program.program_name'), 'programName'],
      [Sequelize.literal(`unnest(array(select FY."fabricType_name"
                           from fabric_types FY
                           where weaver_sales.fabric_type @> ARRAY [FY.id]
                           ))`), 'fabricName'],
    ],
    include: [{
      model: Program,
      as: 'program',
      attributes: [],
    }, {
      model: Weaver,
      as: 'weaver',
      attributes: [],
    }],
    where,
    group: ['program.id', 'fabricName']
  });

  return estimateAndProduction;
};



export {
  getYarnCompareCount,
  getFabricCompareCount,
  getFabricYarnMonthlyData,
  getTopYarnProcured,
  getTopFabricSold,
  getFabricType,
  getFabricInventory
};