import { Request, Response } from "express";
import Farmer from "../../models/farmer.model";
import { Op, Sequelize } from "sequelize";
import * as yup from 'yup';
import State from "../../models/state.model";
import District from "../../models/district.model";
import Country from "../../models/country.model";
import Farm from "../../models/farm.model";
import Season from "../../models/season.model";
import { getProcuredByCountryData, getProcuredData, getTransactionWhereQuery } from "./procurement";

const getOverallArea = async (
  req: Request, res: Response
) => {
  try {

    const reqData = await getQueryParams(req, res);
    const where = getFarmerQuery(reqData);
    const overAllData = await getOverAllData(where);
    const data = getAreaPercentage(overAllData);
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};


const getOverAllData = async (
  where: any
) => {
  const moreThanTwo = await Farmer.count({
    where: {
      ...where,
      agri_total_area: {
        [Op.gt]: 2.5
      }
    }
  });
  const lessThanOne = await Farmer.count({
    where: {
      ...where,
      agri_total_area: {
        [Op.lt]: 1
      }
    }
  });

  const moreThanOne = await Farmer.count({
    where: {
      ...where,
      agri_total_area: {
        [Op.gte]: 1,
        [Op.lte]: 2.5
      }
    }
  });

  return {
    moreThanOne,
    lessThanOne,
    moreThanTwo
  };

};

const getOverAllDataQuery = (
  reqData: any
) => {
  const where: any = {

  };

  if (reqData?.program)
    where['$farmer.program_id$'] = reqData.program;

  if (reqData?.brand)
    where['$farmer.brand_id$'] = reqData.brand;

  if (reqData?.season)
    where.season_id = reqData.season;

  if (reqData?.country)
    where['$farmer.country_id$'] = reqData.country;

  if (reqData?.state)
    where['$farmer.state_id$'] = reqData.state;

  if (reqData?.district)
    where['$farmer.district_id$'] = reqData.district;

  if (reqData?.block)
    where['$farmer.block_id$'] = reqData.block;

  if (reqData?.village)
    where['$farmer.village_id$'] = reqData.village;

  return where;
};



const getFarmerQuery = (
  reqData: any
) => {
  const where: any = {

  };

  if (reqData?.program)
    where.program_id = reqData.program;

  if (reqData?.brand)
    where.brand_id = reqData.brand;

  if (reqData?.country)
    where.country_id = reqData.country;

  if (reqData?.state)
    where.state_id = reqData.state;

  if (reqData?.district)
    where.district_id = reqData.district;

  if (reqData?.block)
    where.block_id = reqData.block;

  if (reqData?.village)
    where.village_id = reqData.village;

  return where;
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
    await validator.validate(fromDate);
    await validator.validate(toDate);
    // if (!season) {
    //   const seasonOne = await Season.findOne({
    //     order: [
    //       ['id', 'DESC']
    //     ]
    //   });
    //   season = seasonOne.id;
    // }

    return {
      program,
      brand,
      season,
      country,
      state,
      district,
      block,
      village,
      fromDate,
      toDate
    };

  } catch (error: any) {
    throw {
      errCode: "REQ_ERROR"
    };
  }
};


const getAreaPercentage = (
  area: any
) => {

  const lessThanOne = area.lessThanOne;
  const moreThanOne = area.moreThanOne;
  const moreThanTwo = area.moreThanTwo;
  const overallPercentage = divide(area.lessThanOne + area.moreThanOne + area.moreThanTwo, 100);


  const pLessThanOne = (divide(lessThanOne, overallPercentage).toFixed(2));
  const pMoreThanOne = (divide(moreThanOne, overallPercentage).toFixed(2));
  const pMoreThanTwo = (divide(moreThanTwo, overallPercentage).toFixed(2));

  return {
    lessThanOne,
    pLessThanOne,
    moreThanTwo,
    pMoreThanTwo,
    moreThanOne,
    pMoreThanOne
  };
};

const divide = (
  firNo: number,
  secNo: number,
) => {
  if (secNo)
    return firNo / secNo;
  return 0;
};

const getOverallFarmer = async (
  req: Request, res: Response
) => {
  try {

    const reqData = await getQueryParams(req, res);
    const where = getFarmerQuery(reqData);
    const farmerList = await getAllFarmer(where);
    const data = getFarmerList(farmerList);
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};

const getAllFarmer = async (
  where: any
) => {

  try {
    if (!where.country_id)
      where.country_id = 29;

    const stateCount = Farmer.findAll({
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.literal('state.id')), 'farmerCount'],
        [Sequelize.col('state.id'), 'state_id'],
        [Sequelize.col('state.state_name'), 'state_name'],
        [Sequelize.col('district.id'), 'district_id'],
        [Sequelize.col('district.district_name'), 'district_name'],
        [Sequelize.col('country.id'), 'country_id'],
        [Sequelize.col('country.county_name'), 'country_name']
      ],
      include: [
        {
          model: State,
          as: 'state',
          attributes: [],
        },
        {
          model: District,
          as: 'district',
          attributes: [],
        },
        {
          model: Country,
          as: 'country',
          attributes: []
        }
      ],
      where,
      group: ['state.id', 'district.id', 'country.id']
    });

    return stateCount;

  } catch (error) {
    console.log(error);
  }
};


const getFarmerList = (farmersList: any) => {
  let country: any = [];
  let state: any = [];
  let district: any = [];

  farmersList.forEach((farmer: any) => {
    const findCountryId = country.findIndex((country: any) =>
      country.id == farmer.dataValues.country_id
    );

    const findStateId = state.findIndex((state: any) =>
      state.id == farmer.dataValues.state_id
    );
    const findDistrictId = district.findIndex((district: any) =>
      district.id == farmer.dataValues.district_id
    );

    if (findCountryId == -1)
      country.push({
        id: farmer.dataValues.country_id,
        name: farmer.dataValues.country_name,
        count: Number(farmer.dataValues.farmerCount),
      });
    else
      if (country.length)
        country.forEach((country: any) => {
          if (country.id == farmer.dataValues.country_id)
            country.count = Number(country.count) + Number(farmer.dataValues.farmerCount);
        });

    if (findStateId == -1)
      state.push({
        id: farmer.dataValues.state_id,
        name: farmer.dataValues.state_name,
        count: Number(farmer.dataValues.farmerCount),
      });
    else
      if (state.length)
        state.forEach((state: any) => {
          if (state.id == farmer.dataValues.state_id)
            state.count = Number(state.count) + Number(farmer.dataValues.farmerCount);
        });

    if (findDistrictId == -1)
      district.push({
        id: farmer.dataValues.district_id,
        name: farmer.dataValues.district_name,
        count: Number(farmer.dataValues.farmerCount),
      });
  });

  return {
    country,
    state,
    district
  };
};


const getFarmerCount = async (
  req: Request, res: Response
) => {
  try {

    const reqData = await getQueryParams(req, res);
    const where = getOverAllDataQuery(reqData);
    const farmerCountList = await getFarmerBySeasons(where);
    const data = getSeasonsList(farmerCountList);
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};

const getFarmerBySeasons = async (where: any) => {
  const farmerCount = await Farm.findAll({
    attributes: [
      [Sequelize.fn('COUNT', Sequelize.col('farmer.id')), 'farmerCount'],
      [Sequelize.col('season.name'), 'seasonName'],
      [Sequelize.col('season.id'), 'seasonId']
    ],
    include: [
      {
        model: Farmer,
        as: 'farmer',
        attributes: [],
      },
      {
        model: Season,
        as: 'season',
        attributes: []
      }
    ],
    where,
    order: [['seasonId', 'desc']],
    limit: 3,
    group: ['season.id']
  });

  return farmerCount;
};

const getSeasonsList = (countList: any) => {
  let season: any = [];
  let farmerCount: any = [];
  countList = countList.sort((a: any, b: any) =>
    a.dataValues.seasonId - b.dataValues.seasonId).slice(-3);
  countList.forEach((seasonCount: any) => {
    season.push(seasonCount.dataValues.seasonName);
    farmerCount.push(Number(seasonCount.dataValues.farmerCount ? seasonCount.dataValues.farmerCount : 0));
  });

  return {
    season: season,
    farmerCount: farmerCount
  };
};

const getTotalAcres = async (
  req: Request, res: Response
) => {

  try {
    const reqData = await getQueryParams(req, res);
    const where = getOverAllDataQuery(reqData);
    const acresList = await getAcreBySession(where);
    const data = getAcreList(acresList);
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};

const getAcreBySession = async (where: any) => {
  const result = await Farm.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('farms.cotton_total_area')), 'acreCount'],
      [Sequelize.col('season.name'), 'seasonName'],
      [Sequelize.col('season.id'), 'seasonId']
    ],
    include: [
      {
        model: Farmer,
        as: 'farmer',
        attributes: [],
      },
      {
        model: Season,
        as: 'season',
        attributes: []
      }
    ],
    order: [['seasonId', 'desc']],
    limit: 3,
    where,
    group: ['season.id']
  });

  return result;
};

const getAcreList = (acreList: any) => {
  let season: any = [];
  let acreCount: any = [];
  acreList = acreList.sort((a: any, b: any) =>
    a.dataValues.seasonId - b.dataValues.seasonId).slice(-3);
  acreList.forEach((acre: any) => {
    season.push(acre.dataValues.seasonName);
    acreCount.push(acre.dataValues.acreCount ? Number(acre.dataValues.acreCount) : 0);
  });

  return {
    season: season,
    acreCount: acreCount
  };
};

const getEstimateAndProduction = async (
  req: Request, res: Response
) => {
  try {

    const reqData = await getQueryParams(req, res);
    if (req.query.type == "2")
      reqData.season = undefined;
    const where = getOverAllDataQuery(reqData);
    const transactionWhere = getTransactionWhereQuery(reqData);
    const estimateProductionList = await getEstimateProductionBySeason(where);
    const procuredList = await getProcuredData(transactionWhere);
    const data = getEstimateProductionList(estimateProductionList, procuredList);
    return res.sendSuccess(res, data);
  }

  catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }

};

const getEstimateProductionBySeason = async (where: any) => {

  const estimateAndProduction = await Farm.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('farmer.total_estimated_cotton')), 'estimate'],
      [Sequelize.fn('SUM', Sequelize.col('farmer.agri_estimated_prod')), 'production'],
      [Sequelize.col('season.id'), 'seasonId']
    ],
    include: [
      {
        model: Farmer,
        as: 'farmer',
        attributes: [],
      },
      {
        model: Season,
        as: 'season',
        attributes: ['id', 'name']
      }
    ],
    order: [['seasonId', 'desc']],
    limit: 3,
    where,
    group: ['season.id']
  });

  return estimateAndProduction;

};

const getEstimateProductionList = (estimateProductionList: any, procuredList: any) => {
  // let season: any = [];
  // let estimate: any = [];
  // let production: any = [];
  // estimateProductionList = estimateProductionList.sort((a: any, b: any) =>
  //   a.dataValues.seasonId - b.dataValues.seasonId).slice(-3);
  // for (const estimateProduction of estimateProductionList) {
  //   season.push(estimateProduction.dataValues.season.name);
  //   estimate.push(mtConversion(estimateProduction.dataValues.estimate));
  //   production.push(mtConversion(estimateProduction.dataValues.production));
  // }

  let seasonIds: number[] = [];

  estimateProductionList.forEach((estimate: any) => {
    if (estimate.dataValues.season.id)
      seasonIds.push(estimate.dataValues.season.id);
  });

  procuredList.forEach((procured: any) => {
    if (!seasonIds.includes(procured.dataValues.season.id))
      seasonIds.push(procured.dataValues.season.id);
  });

  seasonIds = seasonIds.sort((a, b) => a - b);

  let season: string[] = [];
  let estimate: number[] = [];
  let production: number[] = [];

  for (const sessionId of seasonIds) {
    const fEstimate = estimateProductionList.find((estimate: any) =>
          estimate.dataValues.season.id == sessionId
        );
    const fProcured = procuredList.find((procured: any) =>
      procured.dataValues.season.id == sessionId
    );
    let data = {
      seasonName: '',
      estimate: 0,
      procured: 0
    };

    if (fEstimate) {
          data.seasonName = fEstimate.dataValues.season.name;
          data.estimate += mtConversion(fEstimate.dataValues.estimate);
        }

    if (fProcured) {
      data.seasonName = fProcured.dataValues.season.name;
      data.procured += mtConversion(fProcured.dataValues.procured);
    }


    season.push(data.seasonName);
    estimate.push(data.estimate);
    production.push(data.procured);

  }


  return {
    season,
    estimate,
    production
  };
};

const mtConversion = (value: number) => {
  return value > 0 ? Number((value / 1000).toFixed(2)) : 0;
};

const formatNumber = (data: string): number => {
  return Number(Number(data).toFixed(2));
};

const farmerCountAndArea = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    reqData.season = undefined;
    const where = getOverAllDataQuery(reqData);
    const acresList = await getAcreBySession(where);
    const farmerCountList = await getFarmerBySeasons(where);
    const data = await getFarmerCountAndAreaRes(
      acresList,
      farmerCountList,
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

const getFarmerCountAndAreaRes = async (
  acreList: any[],
  farmerCountList: any[],
  reqSeason: any
) => {

  let seasonIds: number[] = [];

  acreList.forEach((acre: any) => {
    if (acre.dataValues.seasonId)
      seasonIds.push(acre.dataValues.seasonId);
  });

  farmerCountList.forEach((farmerCount: any) => {
    if (!seasonIds.includes(farmerCount.dataValues.seasonId))
      seasonIds.push(farmerCount.dataValues.seasonId);
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
  let count: any = [];
  let acre: any = [];

  for (const sessionId of seasonIds) {
    const fAcre = acreList.find((production: any) =>
      production.dataValues.seasonId == sessionId
    );
    const fCount = farmerCountList.find((estimate: any) =>
      estimate.dataValues.seasonId == sessionId
    );
    let data = {
      seasonName: '',
      count: 0,
      acre: 0
    };
    if (fAcre) {
      data.seasonName = fAcre.dataValues.seasonName;
      data.acre = formatNumber(fAcre.dataValues.acreCount);
    }

    if (fCount) {
      data.seasonName = fCount.dataValues.seasonName;
      data.count = formatNumber(fCount.dataValues.farmerCount);
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
    count.push(data.count);
    acre.push(data.acre);

  }



  return {
    season,
    count,
    acre
  };

};


const farmerAllData = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    reqData.season = undefined;
    const where = getOverAllDataQuery(reqData);
    const acresList = await getAcreBySession(where);
    const farmerCountList = await getFarmerBySeasons(where);
    const estimateProductionList = await getEstimateProductionBySeason(where);
    const data = await getFarmerAllDataRes(
      acresList,
      farmerCountList,
      estimateProductionList,
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

const getFarmerAllDataRes = async (
  acreList: any[],
  farmerCountList: any[],
  estimateProductionList: any,
  reqSeason: any
) => {

  let seasonIds: number[] = [];

  acreList.forEach((acre: any) => {
    if (acre.dataValues.seasonId)
      seasonIds.push(acre.dataValues.seasonId);
  });

  farmerCountList.forEach((farmerCount: any) => {
    if (!seasonIds.includes(farmerCount.dataValues.seasonId))
      seasonIds.push(farmerCount.dataValues.seasonId);
  });

  estimateProductionList.forEach((estimateProduction: any) => {
    if (!seasonIds.includes(estimateProduction.dataValues.season.id))
      seasonIds.push(estimateProduction.dataValues.season.id);
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
  let count: any = [];
  let acre: any = [];
  let production: any = [];
  let estimate: any = [];

  for (const sessionId of seasonIds) {
    const fAcre = acreList.find((production: any) =>
      production.dataValues.seasonId == sessionId
    );
    const fCount = farmerCountList.find((estimate: any) =>
      estimate.dataValues.seasonId == sessionId
    );
    const fEstimateProduction = estimateProductionList.find((estimateProduction: any) =>
      estimateProduction.dataValues.season.id == sessionId
    );

    let data = {
      seasonName: '',
      count: 0,
      acre: 0,
      production: 0,
      estimate: 0
    };
    if (fAcre) {
      data.seasonName = fAcre.dataValues.seasonName;
      data.count = formatNumber(fAcre.dataValues.acreCount);
    }

    if (fCount) {
      data.seasonName = fCount.dataValues.seasonName;
      data.acre = formatNumber(fCount.dataValues.farmerCount);
    }

    if (fEstimateProduction) {
      data.seasonName = fEstimateProduction.dataValues.season.name;
      data.production = formatNumber(fEstimateProduction.dataValues.production);
      data.estimate = formatNumber(fEstimateProduction.dataValues.estimate);
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
    count.push(data.count);
    acre.push(data.acre);
    production.push(data.production);
    estimate.push(data.estimate);
  }



  return {
    season,
    count,
    acre,
    production,
    estimate
  };

};


const getFarmersByCountry = async (
  req: Request, res: Response
) => {
  try {
    const reqData = await getQueryParams(req, res);
    const where = getFarmerQuery(reqData);
    const data = await getFarmersByCountryData(where);
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};


const getFarmersByCountryData = async (
  where: any
) => {
  where["$country.latitude$"] = {
    [Op.not]: null
  };
  where["$country.longitude$"] = {
    [Op.not]: null
  };

  const result = await Farmer.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('agri_total_area')), 'area'],
      [Sequelize.fn('count', Sequelize.col('farmers.id')), 'farmers'],
      [Sequelize.col('country.county_name'), 'countryName'],
      [Sequelize.col('country.latitude'), 'latitude'],
      [Sequelize.col('country.longitude'), 'longitude']
    ],
    include: [{
      model: Country,
      as: 'country',
      attributes: []
    }],
    where,
    group: ['country.id']
  });

  return result;
};

const getCountryFarmerCount = async (
  req: Request, res: Response
) => {
  try {

    const reqData = await getQueryParams(req, res);
    const where = getOverAllDataQuery(reqData);
    const farmerCountList = await getFarmerCountByCountry(where);
    const data = await getCountryCountRes(farmerCountList, reqData.season);
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};


const getCountryCountRes = async (
  farmerCountList: any = [],
  reqSeason: any
) => {
  let seasonIds: number[] = [];
  let countries: number[] = [];

  farmerCountList.forEach((list: any) => {
    if (!countries.includes(list.dataValues.countryName))
      countries.push(list.dataValues.countryName);

    if (!seasonIds.includes(list.dataValues.seasonId))
      seasonIds.push(list.dataValues.seasonId);
  });

  const seasons = await Season.findAll({
    limit: 3,
    offset: 1,
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
    const farmerList = farmerCountList.filter((list: any) =>
      list.dataValues.countryName == countryName
    );

    for (const seasonId of seasonIds) {

      let farmerCount = {
        count: 0,
        name: ''
      };
      const fFarmerValue = farmerList.find((list: any) =>
        list.dataValues.seasonId == seasonId
      );

      if (fFarmerValue) {
        farmerCount.count = formatNumber(fFarmerValue.dataValues.farmerCount);
        farmerCount.name = fFarmerValue.dataValues.seasonName;
      }
      if (!farmerCount.name) {
        const fSeason = seasons.find((season: any) =>
          season.id == seasonId
        );
        if (fSeason) {
          farmerCount.name = fSeason.name;
        }
      }
      data.data.push(farmerCount.count);
      if (!seasonList.includes(farmerCount.name))
        seasonList.push(farmerCount.name);
    }

    countList.push(data);
  }

  return {
    countList,
    seasonList,
  };
};


const getFarmerCountByCountry = async (where: any) => {
  const farmerCount = await Farm.findAll({
    attributes: [
      [Sequelize.fn('count', Sequelize.col('farmer.id')), 'farmerCount'],
      [Sequelize.col('farmer.country.id'), 'countryId'],
      [Sequelize.col('farmer.country.county_name'), 'countryName'],
      [Sequelize.col('season.id'), 'seasonId'],
      [Sequelize.col('season.name'), 'seasonName']
    ],
    include: [{
      model: Farmer,
      as: 'farmer',
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
    group: ['farmer.country.id', 'season.id']
  });

  return farmerCount;
};

const getCountryFarmerArea = async (
  req: Request, res: Response
) => {
  try {

    const reqData = await getQueryParams(req, res);
    const where = getOverAllDataQuery(reqData);
    const acresList = await getAreaByCountry(where);
    const data = await getCountryAreaRes(acresList, reqData.season);
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};


const getCountryAreaRes = async (
  acresList: any = [],
  reqSeason: any
) => {
  let seasonIds: number[] = [];
  let countries: number[] = [];

  acresList.forEach((list: any) => {
    if (!countries.includes(list.dataValues.countryName))
      countries.push(list.dataValues.countryName);

    if (!seasonIds.includes(list.dataValues.seasonId))
      seasonIds.push(list.dataValues.seasonId);
  });

  const seasons = await Season.findAll({
    limit: 3,
    offset:1,
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
    const farmerList = acresList.filter((list: any) =>
      list.dataValues.countryName == countryName
    );

    for (const seasonId of seasonIds) {

      let totalArea = {
        area: 0,
        name: ''
      };
      const fFarmerValue = farmerList.find((list: any) =>
        list.dataValues.seasonId == seasonId
      );

      if (fFarmerValue) {
        totalArea.area = formatNumber(fFarmerValue.dataValues.area);
        totalArea.name = fFarmerValue.dataValues.seasonName;
      }
      if (!totalArea.name) {
        const fSeason = seasons.find((season: any) =>
          season.id == seasonId
        );
        if (fSeason) {
          totalArea.name = fSeason.name;
        }
      }
      data.data.push(totalArea.area);
      if (!seasonList.includes(totalArea.name))
        seasonList.push(totalArea.name);
    }

    areaList.push(data);
  }

  return {
    areaList,
    seasonList,
  };
};


const getAreaByCountry = async (where: any) => {
  const result = await Farm.findAll({
    attributes: [
      [Sequelize.fn('sum', Sequelize.col('farms.agri_total_area')), 'area'],
      [Sequelize.col('farmer.country.id'), 'countryId'],
      [Sequelize.col('farmer.country.county_name'), 'countryName'],
      [Sequelize.col('season.id'), 'seasonId'],
      [Sequelize.col('season.name'), 'seasonName']
    ],
    include: [{
      model: Farmer,
      as: 'farmer',
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
    group: ['farmer.country.id', 'season.id']
  });

  return result;
};



const getEstimateCottonByCountry = async (
  req: Request, res: Response
) => {
  try {

    const reqData = await getQueryParams(req, res);
    const where = getOverAllDataQuery(reqData);
    const estimatedList = await getEstimateAndProcuredByCountryData(where);
    const data = await getEstimateCottonRes(estimatedList, reqData.season);
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};


const getEstimateCottonRes = async (
  estimatedList: any = [],
  reqSeason: any
) => {
  let seasonIds: number[] = [];
  let countries: number[] = [];

  estimatedList.forEach((list: any) => {
    if (!countries.includes(list.dataValues.countryName))
      countries.push(list.dataValues.countryName);

    if (!seasonIds.includes(list.dataValues.seasonId))
      seasonIds.push(list.dataValues.seasonId);
  });

  const seasons = await Season.findAll({
    limit: 3,
    offset:1,
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
    const farmerList = estimatedList.filter((list: any) =>
      list.dataValues.countryName == countryName
    );

    for (const seasonId of seasonIds) {

      let totalArea = {
        area: 0,
        name: ''
      };
      const fFarmerValue = farmerList.find((list: any) =>
        list.dataValues.seasonId == seasonId
      );

      if (fFarmerValue) {
        totalArea.area = mtConversion(fFarmerValue.dataValues.estimate);
        totalArea.name = fFarmerValue.dataValues.seasonName;
      }
      if (!totalArea.name) {
        const fSeason = seasons.find((season: any) =>
          season.id == seasonId
        );
        if (fSeason) {
          totalArea.name = fSeason.name;
        }
      }
      data.data.push(totalArea.area);
      if (!seasonList.includes(totalArea.name))
        seasonList.push(totalArea.name);
    }

    areaList.push(data);
  }

  return {
    areaList,
    seasonList,
  };
};


const getEstimateAndProcuredByCountryData = async (where: any) => {
  const result = await Farm.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('farmer.total_estimated_cotton')), 'estimate'],
      [Sequelize.fn('SUM', Sequelize.col('farmer.agri_estimated_prod')), 'production'],
      [Sequelize.col('farmer.country.id'), 'countryId'],
      [Sequelize.col('farmer.country.county_name'), 'countryName'],
      [Sequelize.col('season.id'), 'seasonId'],
      [Sequelize.col('season.name'), 'seasonName']
    ],
    include: [{
      model: Farmer,
      as: 'farmer',
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
    group: ['farmer.country.id', 'season.id']
  });

  return result;
};


const getProductionCottonByCountry = async (
  req: Request, res: Response
) => {
  try {

    const reqData = await getQueryParams(req, res);
    const transactionWhere = getTransactionWhereQuery(reqData);
    const procuredList = await getProcuredByCountryData(transactionWhere);
    const data = await getProductionCottonRes(procuredList, reqData.season);
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};


const getProductionCottonRes = async (
  estimatedList: any = [],
  reqSeason: any
) => {
  let seasonIds: number[] = [];
  let countries: number[] = [];

  estimatedList.forEach((list: any) => {
    if (!countries.includes(list.dataValues.countryName))
      countries.push(list.dataValues.countryName);

    if (!seasonIds.includes(list.dataValues.seasonId))
      seasonIds.push(list.dataValues.seasonId);
  });

  const seasons = await Season.findAll({
    limit: 3,
    offset:1,
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
    const farmerList = estimatedList.filter((list: any) =>
      list.dataValues.countryName == countryName
    );

    for (const seasonId of seasonIds) {

      let totalArea = 0;
      const fFarmerValue = farmerList.find((list: any) =>
        list.dataValues.seasonId == seasonId
      );

      if (fFarmerValue) {
        totalArea = mtConversion(fFarmerValue.dataValues.procured);
        if (!seasonList.includes(fFarmerValue.dataValues.seasonName))
          seasonList.push(fFarmerValue.dataValues.seasonName);
      }
      else {
        seasons.forEach((season: any) => {
          if (season.id == seasonId && !seasonList.includes(season.dataValues.name)) {
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

export {
  getOverallArea,
  getOverallFarmer,
  getFarmerCount,
  getTotalAcres,
  getEstimateAndProduction,
  farmerCountAndArea,
  farmerAllData,
  getFarmersByCountry,
  getCountryFarmerCount,
  getCountryFarmerArea,
  getEstimateCottonByCountry,
  getProductionCottonByCountry
};