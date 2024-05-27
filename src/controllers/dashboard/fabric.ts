import { Request, Response } from "express";
import DyingSales from "../../models/dying-sales.model";
import KnitSales from "../../models/knit-sales.model";
import PrintingSales from "../../models/printing-sales.model";
import Program from "../../models/program.model";
import WashingSales from "../../models/washing-sales.model";
import WeaverSales from "../../models/weaver-sales.model";
import { Op, Sequelize } from "sequelize";
import * as yup from 'yup';
import Garments from "../../models/garment.model";
import CompactingSales from "../../models/compacting-sales.model";
import Weaver from "../../models/weaver.model";
import Knitter from "../../models/knitter.model";
import Fabric from "../../models/fabric.model";
import Season from "../../models/season.model";

const getQueryParams = async (
  req: Request, res: Response,
  isBuyer = false,
) => {
  try {
    let {
      type,
      program,
      brand,
      season,
      country,
      state,
      district,
      block,
      village,
      fabric,
      fromDate,
      toDate
    } = req.query;

    const validator = yup.string()
      .notRequired()
      .nullable();

    const typeValidator = yup.string()
      .required()
      .oneOf([
        'dyeing',
        'printing',
        'washing',
        'compacting'
      ]);

    await validator.validate(program);
    await validator.validate(season);
    await typeValidator.validate(type);
    await validator.validate(brand);
    await validator.validate(country);
    await validator.validate(state);
    await validator.validate(district);
    await validator.validate(block);
    await validator.validate(village);

    await validator.validate(fromDate);
    await validator.validate(toDate);


    return {
      type,
      program,
      brand,
      season,
      country,
      state,
      district,
      block,
      village,
      fabric,
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


const getKnitterWhereQuery = (
  reqData: any,
  buyerType: string,
) => {
  const where: any = {
  };
  where.buyer_type = buyerType;
  where.status = 'Sold';

  if (reqData?.program)
    where.program_id = reqData.program;

  if (reqData?.country)
    where['$dyingwashing.country_id$'] = reqData.country;

  if (reqData?.season)
    where.season_id = reqData.season;

  if (reqData?.fabric)
    where.fabric_id = reqData.fabric;

  if (reqData?.fromDate)
    where.date = { [Op.gte]: reqData.fromDate };

  if (reqData?.toDate)
    where.date = { [Op.lt]: reqData.toDate };

  if (reqData?.fromDate && reqData?.toDate)
    where.date = { [Op.between]: [reqData.fromDate, reqData.toDate] };

  if (reqData?.state)
    where['$dyingwashing.state_id$'] = reqData.state;

  if (reqData?.district)
    where['$dyingwashing.district_id$'] = reqData.district;

  return where;


};


const getDFabricSaleWhereQuery = (
  reqData: any,
  buyerType: string,
) => {
  const where: any = {
  };
  where.buyer_type = buyerType;
  where.status = 'Sold';

  if (reqData?.program)
    where.program_id = reqData.program;

  if (reqData?.country)
    where['$abuyer.country_id$'] = reqData.country;

  if (reqData?.season)
    where.season_id = reqData.season;

  if (reqData?.fabric)
    where.fabric_id = reqData.fabric;

  if (reqData?.fromDate)
    where.date = { [Op.gte]: reqData.fromDate };

  if (reqData?.toDate)
    where.date = { [Op.lt]: reqData.toDate };

  if (reqData?.fromDate && reqData?.toDate)
    where.date = { [Op.between]: [reqData.fromDate, reqData.toDate] };

  if (reqData?.state)
    where['$abuyer.state_id$'] = reqData.state;

  if (reqData?.district)
    where['$abuyer.district_id$'] = reqData.district;

  return where;


};

const getDyingWhereQuery = (
  reqData: any
) => {
  const where: any = {

  };
  where.status = 'Sold';

  if (reqData?.program)
    where.program_id = reqData.program;

  if (reqData?.country)
    where['$dying_fabric.country_id$'] = reqData.country;

  if (reqData?.season)
    where.season_id = reqData.season;

  if (reqData?.fabric)
    where.dying_id = reqData.fabric;

  if (reqData?.fromDate)
    where.date = { [Op.gte]: reqData.fromDate };

  if (reqData?.toDate)
    where.date = { [Op.lt]: reqData.toDate };

  if (reqData?.fromDate && reqData?.toDate)
    where.date = { [Op.between]: [reqData.fromDate, reqData.toDate] };

  if (reqData?.state)
    where['$dying_fabric.state_id$'] = reqData.state;

  if (reqData?.district)
    where['$dying_fabric.district_id$'] = reqData.district;

  return where;


};


const getPrintingWhereQuery = (
  reqData: any
) => {
  const where: any = {

  };
  where.status = 'Sold';

  if (reqData?.program)
    where.program_id = reqData.program;

  if (reqData?.country)
    where['$printing.country_id$'] = reqData.country;

  if (reqData?.season)
    where.season_id = reqData.season;

  if (reqData?.fabric)
    where.printing_id = reqData.fabric;

  if (reqData?.fromDate)
    where.date = { [Op.gte]: reqData.fromDate };

  if (reqData?.toDate)
    where.date = { [Op.lt]: reqData.toDate };

  if (reqData?.fromDate && reqData?.toDate)
    where.date = { [Op.between]: [reqData.fromDate, reqData.toDate] };

  if (reqData?.state)
    where['$printing.state_id$'] = reqData.state;

  if (reqData?.district)
    where['$printing.district_id$'] = reqData.district;

  return where;


};



const getWashingWhereQuery = (
  reqData: any,
) => {
  const where: any = {

  };
  where.status = 'Sold';

  if (reqData?.program)
    where.program_id = reqData.program;

  if (reqData?.country)
    where['$washing.country_id$'] = reqData.country;

  if (reqData?.season)
    where.season_id = reqData.season;

  if (reqData?.fabric)
    where.washing_id = reqData.fabric;

  if (reqData?.fromDate)
    where.date = { [Op.gte]: reqData.fromDate };

  if (reqData?.toDate)
    where.date = { [Op.lt]: reqData.toDate };

  if (reqData?.fromDate && reqData?.toDate)
    where.date = { [Op.between]: [reqData.fromDate, reqData.toDate] };

  if (reqData?.state)
    where['$washing.state_id$'] = reqData.state;

  if (reqData?.district)
    where['$washing.district_id$'] = reqData.district;

  return where;


};


const getCompactingWhereQuery = (
  reqData: any
) => {
  const where: any = {

  };
  where.status = 'Sold';

  if (reqData?.program)
    where.program_id = reqData.program;

  if (reqData?.country)
    where['$compacting.country_id$'] = reqData.country;

  if (reqData?.season)
    where.season_id = reqData.season;

  if (reqData?.fabric)
    where.compacting_id = reqData.fabric;

  if (reqData?.fromDate)
    where.date = { [Op.gte]: reqData.fromDate };

  if (reqData?.toDate)
    where.date = { [Op.lt]: reqData.toDate };

  if (reqData?.fromDate && reqData?.toDate)
    where.date = { [Op.between]: [reqData.fromDate, reqData.toDate] };

  if (reqData?.state)
    where['$compacting.state_id$'] = reqData.state;

  if (reqData?.district)
    where['$compacting.district_id$'] = reqData.district;

  return where;


};


const getTopSold = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res, true);
    const data = await getTopBuyers(reqData);
    const buyerChartData = getBuyerChartDataRes(data);
    return res.sendSuccess(res, buyerChartData);
  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};

const getTopBuyers = async (
  req: any,
) => {
  if (req.type == 'dyeing') {
    const where = getDyingWhereQuery(req);
    const dyingSales = await DyingSales.findAll({
      attributes: [
        [
          Sequelize.literal(`CASE 
            WHEN buyer.id IS NOT NULL 
              THEN buyer.name 
            WHEN abuyer.id IS NOT NULL 
            THEN abuyer.name 
            ELSE processor_name END`),
          'buyerName'
        ],
        [Sequelize.fn('SUM', Sequelize.col('total_fabric_quantity')), 'qty']
      ],
      include: [
        {
          model: Garments,
          as: 'buyer',
          attributes: []
        },
        {
          model: Fabric,
          as: 'abuyer',
          attributes: []
        }, {
          model: Fabric,
          as: 'dying_fabric',
          attributes: []
        }
      ],
      group: ['buyerName'],
      where,
      order: [['qty', 'DESC']],
      limit: 10
    });

    return dyingSales;
  };

  if (req.type == 'printing') {
    const where = getPrintingWhereQuery(req);
    const printingSales = await PrintingSales.findAll({
      attributes: [
        [
          Sequelize.literal(`CASE 
            WHEN buyer.id IS NOT NULL 
              THEN buyer.name 
            WHEN abuyer.id IS NOT NULL 
            THEN abuyer.name 
            ELSE processor_name END`),
          'buyerName'
        ],
        [Sequelize.fn('SUM', Sequelize.col('total_fabric_quantity')), 'qty']
      ],
      include: [
        {
          model: Garments,
          as: 'buyer',
          attributes: []
        },
        {
          model: Fabric,
          as: 'abuyer',
          attributes: []
        }, {
          model: Fabric,
          as: 'printing',
          attributes: []
        }
      ],
      group: ['buyerName'],
      where,
      order: [['qty', 'DESC']],
      limit: 10
    });

    return printingSales;
  };

  if (req.type == 'washing') {
    const where = getWashingWhereQuery(req);
    const washingSales = await WashingSales.findAll({
      attributes: [
        [
          Sequelize.literal(`CASE 
            WHEN buyer.id IS NOT NULL 
              THEN buyer.name 
            WHEN abuyer.id IS NOT NULL 
            THEN abuyer.name 
            ELSE processor_name END`),
          'buyerName'
        ],
        [Sequelize.fn('SUM', Sequelize.col('total_fabric_quantity')), 'qty']
      ],
      include: [
        {
          model: Garments,
          as: 'buyer',
          attributes: []
        },
        {
          model: Fabric,
          as: 'abuyer',
          attributes: []
        }, {
          model: Fabric,
          as: 'washing',
          attributes: []
        }
      ],
      group: ['buyerName'],
      where: where,
      order: [['qty', 'DESC']],
      limit: 10
    });

    return washingSales;
  };

  if (req.type == 'compacting') {
    const where = getCompactingWhereQuery(req);
    const compactingSales = await CompactingSales.findAll({
      attributes: [
        [
          Sequelize.literal(`CASE WHEN buyer.id IS NOT NULL THEN buyer.name ELSE processor_name END`),
          'buyerName'
        ],
        [Sequelize.fn('SUM', Sequelize.col('total_fabric_quantity')), 'qty']
      ],
      include: [
        {
          model: Garments,
          as: 'buyer',
          attributes: []
        },
        {
          model: Fabric,
          as: 'compacting',
          attributes: []
        }
      ],
      group: ['buyerName'],
      where: where,
      order: [['qty', 'DESC']],
      limit: 10
    });

    return compactingSales;
  };

};
const getBuyerChartDataRes = (
  buyerList: any
) => {
  let name: any[] = [];
  let qty: any[] = [];
  buyerList.forEach((buyer: any) => {
    if (buyer.dataValues.buyerName && buyer.dataValues.buyerName.length) {
      name.push(buyer.dataValues.buyerName);
      qty.push(formatNumber(buyer.dataValues.qty));
    }
  });
  return {
    name,
    qty
  };
};

const getTopProcured = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res, true);
    const data = await getTopProcuredData(reqData);
    const buyerChartData = getBuyerChartDataRes(data);
    return res.sendSuccess(res, buyerChartData);
  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};

const getTopProcuredData = async (
  req: any
) => {

  // Capitalize the first letter
  const buyerType = req.type.charAt(0).toUpperCase() + req.type.slice(1);

  let topResults: any;

  // Query for knitter
  const knitterWhere = getKnitterWhereQuery(
    req,
    buyerType
  );
  const fabricQuery = getDFabricSaleWhereQuery(
    req,
    buyerType
  );

  const knitterQuery = KnitSales.findAll({
    include: [{
      model: Knitter,
      as: 'knitter',
      attributes: []
    }, {
      model: Fabric,
      as: 'dyingwashing',
      attributes: []
    }],
    attributes: [
      [Sequelize.col('knitter.name'), 'buyerName'],
      [Sequelize.fn('SUM', Sequelize.col('total_fabric_weight')), 'qty'],
    ],
    where: knitterWhere,
    group: ['buyerName'],
    order: [['qty', 'DESC']],
    limit: 10
  });


  // Query for weavers

  const weaverQuery = WeaverSales.findAll({
    include: [{
      model: Weaver,
      as: 'weaver',
      attributes: []
    }, {
      model: Fabric,
      as: 'dyingwashing',
      attributes: []
    }],
    attributes: [
      [Sequelize.col('weaver.name'), 'buyerName'],
      [Sequelize.fn('SUM', Sequelize.col('total_fabric_length')), 'qty']
    ],
    where: knitterWhere,
    group: ['buyerName'],
    order: [[Sequelize.literal('qty'), 'DESC']],
    limit: 10
  });

  // Query for washingQuery


  const washingQuery = (['Printing', 'Compacting'].includes(buyerType)) ? WashingSales.findAll({
    include: [{
      model: Fabric,
      as: 'washing',
      attributes: []
    }],
    attributes: [
      [Sequelize.col('washing.name'), 'buyerName'],
      [Sequelize.fn('SUM', Sequelize.col('total_fabric_quantity')), 'qty']
    ],
    where: fabricQuery,
    group: ['buyerName'],
    order: [[Sequelize.literal('qty'), 'DESC']],
    limit: 10
  }) : [];


  // Query for printingQuery

  const printingQuery = (['Compacting'].includes(buyerType)) ? PrintingSales.findAll({
    include: [{
      model: Fabric,
      as: 'printing',
      attributes: []
    }],
    attributes: [
      [Sequelize.col('printing.name'), 'buyerName'],
      [Sequelize.fn('SUM', Sequelize.col('total_fabric_quantity')), 'qty']
    ],
    where: fabricQuery,
    group: ['buyerName'],
    order: [[Sequelize.literal('qty'), 'DESC']],
    limit: 10
  }) : [];

  // Query for dyeingQuery

  const dyeingQuery = (['Washing', 'Compacting', 'Printing'].includes(buyerType)) ? DyingSales.findAll({
    include: [{
      model: Fabric,
      as: 'dying_fabric',
      attributes: []
    }],
    attributes: [
      [Sequelize.col('dying_fabric.name'), 'buyerName'],
      [Sequelize.fn('SUM', Sequelize.col('total_fabric_quantity')), 'qty']
    ],
    where: fabricQuery,
    group: ['buyerName'],
    order: [[Sequelize.literal('qty'), 'DESC']],
    limit: 10
  }) : [];



  const [
    knitterResults,
    weaverResults,
    washingResult,
    printingResult,
    dyeingResult
  ] = await Promise.all([
    knitterQuery,
    weaverQuery,
    washingQuery,
    printingQuery,
    dyeingQuery
  ]);

  const combinedResults = [
    ...knitterResults,
    ...weaverResults,
    ...washingResult,
    ...printingResult,
    ...dyeingResult
  ];
  combinedResults.sort((a, b) => b.dataValues.qty - a.dataValues.qty);

  topResults = combinedResults.slice(0, 10);
  return topResults;
};


const getFabricCompareData = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res, true);
    const processData = await getFabricData(reqData, true);
    const saleData = await getFabricData(reqData, false);
    const procuredData = await getFabricProcuredData(reqData);
    const data = getOverallChartDataRes(
      processData,
      saleData,
      procuredData
    );
    return res.sendSuccess(res, data);
  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};


const getFabricProcuredData = async (
  req: any
) => {

  // Capitalize the first letter
  const buyerType = req.type.charAt(0).toUpperCase() + req.type.slice(1);

  let topResults: any;

  // Query for knitter
  const knitterWhere = getKnitterWhereQuery(
    req,
    buyerType
  );
  const fabricQuery = getDFabricSaleWhereQuery(
    req,
    buyerType
  );

  const knitterQuery = KnitSales.findAll({
    include: [{
      model: Season,
      as: 'season',
      attributes: []
    }, {
      model: Fabric,
      as: 'dyingwashing',
      attributes: []
    }],
    attributes: [
      [Sequelize.col('season.name'), 'seasonName'],
      [Sequelize.col('season.id'), 'seasonId'],
      [Sequelize.fn('SUM', Sequelize.col('total_fabric_weight')), 'qty'],
    ],
    where: knitterWhere,
    order: [
      ['seasonId', 'desc']
    ],
    limit: 3,
    group: ['season.id']
  });


  // Query for weavers

  const weaverQuery = WeaverSales.findAll({
    include: [{
      model: Season,
      as: 'season',
      attributes: []
    }, {
      model: Fabric,
      as: 'dyingwashing',
      attributes: []
    }],
    attributes: [
      [Sequelize.col('season.name'), 'seasonName'],
      [Sequelize.col('season.id'), 'seasonId'],
      [Sequelize.fn('SUM', Sequelize.col('total_fabric_length')), 'qty'],
    ],
    where: knitterWhere,
    order: [
      ['seasonId', 'desc']
    ],
    limit: 3,
    group: ['season.id']
  });

  // Query for washingQuery


  const washingQuery = (['Printing', 'Compacting'].includes(buyerType)) ? WashingSales.findAll({
    include: [{
      model: Fabric,
      as: 'abuyer',
      attributes: []
    }, {
      model: Season,
      as: 'season',
      attributes: []
    }],
    attributes: [
      [Sequelize.col('season.name'), 'seasonName'],
      [Sequelize.col('season.id'), 'seasonId'],
      [Sequelize.fn('SUM', Sequelize.col('total_fabric_quantity')), 'qty'],
    ],
    where: fabricQuery,
    order: [
      ['seasonId', 'desc']
    ],
    limit: 3,
    group: ['season.id']
  }) : [];


  // Query for printingQuery

  const printingQuery = (['Compacting'].includes(buyerType)) ? PrintingSales.findAll({
    include: [{
      model: Fabric,
      as: 'abuyer',
      attributes: []
    }, {
      model: Season,
      as: 'season',
      attributes: []
    }],
    attributes: [
      [Sequelize.col('season.name'), 'seasonName'],
      [Sequelize.col('season.id'), 'seasonId'],
      [Sequelize.fn('SUM', Sequelize.col('total_fabric_quantity')), 'qty'],
    ],
    where: fabricQuery,
    order: [
      ['seasonId', 'desc']
    ],
    limit: 3,
    group: ['season.id']
  }) : [];

  // Query for dyeingQuery

  const dyeingQuery = (['Washing', 'Compacting', 'Printing'].includes(buyerType)) ? DyingSales.findAll({
    include: [{
      model: Fabric,
      as: 'abuyer',
      attributes: []
    }, {
      model: Season,
      as: 'season',
      attributes: []
    }],
    attributes: [
      [Sequelize.col('season.name'), 'seasonName'],
      [Sequelize.col('season.id'), 'seasonId'],
      [Sequelize.fn('SUM', Sequelize.col('total_fabric_quantity')), 'qty'],
    ],
    where: fabricQuery,
    order: [
      ['seasonId', 'desc']
    ],
    limit: 3,
    group: ['season.id']
  }) : [];



  const [
    knitterResults,
    weaverResults,
    washingResult,
    printingResult,
    dyeingResult
  ] = await Promise.all([
    knitterQuery,
    weaverQuery,
    washingQuery,
    printingQuery,
    dyeingQuery
  ]);

  const combinedResults = [
    ...knitterResults,
    ...weaverResults,
    ...washingResult,
    ...printingResult,
    ...dyeingResult
  ];
  return combinedResults;
};


const getFabricData = async (
  req: any,
  isProcess: boolean
) => {
  if (req.type == 'dyeing') {
    const where = getDyingWhereQuery(req);
    if (isProcess)
      delete where.status;
    const dyingSales = await DyingSales.findAll({
      attributes: [
        [Sequelize.col('season.name'), 'seasonName'],
        [Sequelize.col('season.id'), 'seasonId'],
        [Sequelize.fn('SUM', Sequelize.col('total_fabric_quantity')), 'qty'],
      ],
      include: [
        {
          model: Season,
          as: 'season',
          attributes: []
        }, {
          model: Fabric,
          as: 'dying_fabric',
          attributes: []
        }
      ],
      order: [
        ['seasonId', 'desc']
      ],
      limit: 3,
      where,
      group: ['season.id']
    });

    return dyingSales;
  };

  if (req.type == 'printing') {
    const where = getPrintingWhereQuery(req);
    if (isProcess)
      delete where.status;
    const printingSales = await PrintingSales.findAll({
      attributes: [
        [Sequelize.col('season.name'), 'seasonName'],
        [Sequelize.col('season.id'), 'seasonId'],
        [Sequelize.fn('SUM', Sequelize.col('total_fabric_quantity')), 'qty'],
      ],
      include: [
        {
          model: Season,
          as: 'season',
          attributes: []
        }, {
          model: Fabric,
          as: 'printing',
          attributes: []
        }
      ],
      order: [
        ['seasonId', 'desc']
      ],
      limit: 3,
      where,
      group: ['season.id']
    });

    return printingSales;
  };

  if (req.type == 'washing') {
    const where = getWashingWhereQuery(req);
    if (isProcess)
      delete where.status;
    const washingSales = await WashingSales.findAll({
      attributes: [
        [Sequelize.col('season.name'), 'seasonName'],
        [Sequelize.col('season.id'), 'seasonId'],
        [Sequelize.fn('SUM', Sequelize.col('total_fabric_quantity')), 'qty'],
      ],
      include: [
        {
          model: Season,
          as: 'season',
          attributes: []
        }, {
          model: Fabric,
          as: 'washing',
          attributes: []
        }
      ],
      order: [
        ['seasonId', 'desc']
      ],
      limit: 3,
      where,
      group: ['season.id']
    });

    return washingSales;
  };

  if (req.type == 'compacting') {
    const where = getCompactingWhereQuery(req);
    if (isProcess)
      delete where.status;
    const compactingSales = await CompactingSales.findAll({
      attributes: [
        [Sequelize.col('season.name'), 'seasonName'],
        [Sequelize.col('season.id'), 'seasonId'],
        [Sequelize.fn('SUM', Sequelize.col('total_fabric_quantity')), 'qty'],
      ],
      include: [
        {
          model: Season,
          as: 'season',
          attributes: []
        },
        {
          model: Fabric,
          as: 'compacting',
          attributes: []
        }
      ],
      order: [
        ['seasonId', 'desc']
      ],
      limit: 3,
      where,
      group: ['season.id']
    });

    return compactingSales;
  };

};


const getOverallTopProcured = async (
  where: any,
  type: any
) => {
  // Capitalize the first letter
  where.buyer_type = type.charAt(0).toUpperCase() + type.slice(1);

  let topResults: any;

  // Query for knitter

  const knitterQuery = KnitSales.findAll({
    include: [{
      model: Knitter,
      as: 'knitter',
      attributes: []
    },
    {
      model: Season,
      as: 'season',
      attributes: []
    }],
    attributes: [
      [Sequelize.col('season.name'), 'seasonName'],
      [Sequelize.col('season.id'), 'seasonId'],
      [Sequelize.fn('SUM', Sequelize.col('total_fabric_weight')), 'procured'],
    ],
    order: [
      ['seasonId', 'desc']
    ],
    limit: 3,
    where,
    group: ['season.id'],
  });

  // Query for weavers

  const weaverQuery = WeaverSales.findAll({
    include: [{
      model: Weaver,
      as: 'weaver',
      attributes: []
    }, {
      model: Season,
      as: 'season',
      attributes: []
    }],
    attributes: [
      [Sequelize.col('season.name'), 'seasonName'],
      [Sequelize.col('season.id'), 'seasonId'],
      [Sequelize.fn('SUM', Sequelize.col('total_fabric_length')), 'procured'],
    ],
    order: [
      ['seasonId', 'desc']
    ],
    limit: 3,
    where,
    group: ['season.id'],
  });

  // Query for washingQuery

  const washingQuery = (['Printing', 'Compacting'].includes(where.buyer_type)) ? WashingSales.findAll({
    include: [{
      model: Fabric,
      as: 'washing',
      attributes: []
    }, {
      model: Season,
      as: 'season',
      attributes: []
    }],
    attributes: [
      [Sequelize.col('season.name'), 'seasonName'],
      [Sequelize.col('season.id'), 'seasonId'],
      [Sequelize.fn('SUM', Sequelize.col('total_fabric_quantity')), 'procured'],
    ],
    order: [
      ['seasonId', 'desc']
    ],
    limit: 3,
    where,
    group: ['season.id']
  }) : [];


  // Query for printingQuery

  const printingQuery = (['Compacting'].includes(where.buyer_type)) ? PrintingSales.findAll({
    include: [{
      model: Fabric,
      as: 'printing',
      attributes: []
    }, {
      model: Season,
      as: 'season',
      attributes: []
    }],
    attributes: [
      [Sequelize.col('season.name'), 'seasonName'],
      [Sequelize.col('season.id'), 'seasonId'],
      [Sequelize.fn('SUM', Sequelize.col('total_fabric_quantity')), 'procured'],
    ],
    order: [
      ['seasonId', 'desc']
    ],
    limit: 3,
    where,
    group: ['season.id'],
  }) : [];

  // Query for dyeingQuery

  const dyeingQuery = (['Washing', 'Compacting', 'Printing'].includes(where.buyer_type)) ? DyingSales.findAll({
    include: [{
      model: Fabric,
      as: 'dying_fabric',
      attributes: []
    }, {
      model: Season,
      as: 'season',
      attributes: []
    }],
    attributes: [
      [Sequelize.col('season.name'), 'seasonName'],
      [Sequelize.col('season.id'), 'seasonId'],
      [Sequelize.fn('SUM', Sequelize.col('total_fabric_quantity')), 'procured'],
    ],
    order: [
      ['seasonId', 'desc']
    ],
    limit: 3,
    where,
    group: ['season.id'],
  }) : [];



  const [
    knitterResult,
    weaverResults,
    washingResult,
    printingResult,
    garmentResult
  ] = await Promise.all([
    knitterQuery,
    weaverQuery,
    washingQuery,
    printingQuery,
    dyeingQuery
  ]);

  const combinedResults = [
    ...knitterResult,
    ...weaverResults,
    ...washingResult,
    ...printingResult,
    ...garmentResult
  ];
  combinedResults.sort((a, b) => b.dataValues.qty - a.dataValues.qty);

  topResults = combinedResults.slice(0, 10);
  return topResults;
};

const getOverallChartDataRes = (
  processList: any[],
  saleList: any[],
  procuredList: any[],
) => {
  let seasonIds: number[] = [];

  processList.forEach((processed: any) => {
    if (processed.dataValues.seasonId)
      seasonIds.push(processed.dataValues.seasonId);
  });

  saleList.forEach((sold: any) => {
    if (!seasonIds.includes(sold.dataValues.seasonId))
      seasonIds.push(sold.dataValues.seasonId);
  });

  procuredList.forEach((procured: any) => {
    if (!seasonIds.includes(procured.dataValues.seasonId))
      seasonIds.push(procured.dataValues.seasonId);
  });

  seasonIds = seasonIds.sort((a, b) => a - b).slice(-3);

  let season: any = [];
  let processed: any = [];
  let sold: any = [];
  let procured: any = [];

  for (const sessionId of seasonIds) {
    const fProcessed = processList.find((processed: any) =>
      processed.dataValues.seasonId == sessionId
    );
    const fSold = saleList.find((sold: any) =>
      sold.dataValues.seasonId == sessionId
    );
    const fProcured = procuredList.filter((procured: any) =>
      procured.dataValues.seasonId == sessionId
    );

    let data = {
      seasonName: '',
      procured: 0,
      processed: 0,
      sold: 0
    };

    if (fProcured.length) {
      fProcured.forEach(procured => {
        data.seasonName = procured.dataValues.seasonName;
        data.procured += formatNumber(procured.dataValues.qty);
      });
    }

    if (fProcessed) {
      data.seasonName = fProcessed.dataValues.seasonName;
      data.processed = formatNumber(fProcessed.dataValues.qty);
    }

    if (fSold) {
      data.seasonName = fSold.dataValues.seasonName;
      data.sold = formatNumber(fSold.dataValues.qty);
    }

    season.push(data.seasonName);
    processed.push(data.processed);
    sold.push(data.sold);
    procured.push(data.procured);
  }

  return {
    season,
    processed,
    sold,
    procured
  };
};


export {
  getTopSold,
  getTopProcured,
  getFabricCompareData
};