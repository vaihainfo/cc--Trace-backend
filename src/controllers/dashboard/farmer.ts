import { Request, Response } from "express";
import Farmer from "../../models/farmer.model";
import { Op, Sequelize } from "sequelize";
import * as yup from 'yup';
import State from "../../models/state.model";
import District from "../../models/district.model";
import Country from "../../models/country.model";
import Farm from "../../models/farm.model";
import Season from "../../models/season.model";

const getOverallArea = async (
  req: Request, res: Response
) => {
  try {

    const reqData = await getQueryParams(req, res);
    const where = getOverAllDataQuery(reqData);
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
  const moreThanTwo = await Farm.count({
    include: [
      {
        model: Farmer,
        attributes: [],
        as: "farmer",
        agri_total_area: {
          [Op.gt]: 2.5
        }
      },
    ],
    where
  });
  const lessThanOne = await Farm.count({
    include: [
      {
        model: Farmer,
        attributes: [],
        as: "farmer",
        where: {
          agri_total_area: {
            [Op.lt]: 1
          }
        },
      },
    ],
    where,

  });

  const moreThanOne = await Farm.count({
    include: [
      {
        model: Farmer,
        attributes: [],
        as: "farmer",
        where: {
          agri_total_area: {
            [Op.gt]: 1,
            [Op.lt]: 2.5
          }
        },
      },
    ],
    where,

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
    const where = getOverAllDataQuery(reqData);
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
    if (!where['$farmer.country_id$'])
      where['$farmer.country_id$'] = 29;

    const stateCount = Farm.findAll({
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.literal('"farmer"."state_id"')), 'farmerCount'],
        [Sequelize.col('farmer.state.id'), 'state_id'],
        [Sequelize.col('farmer.state.state_name'), 'state_name'],
        [Sequelize.col('farmer.district.id'), 'district_id'],
        [Sequelize.col('farmer.district.district_name'), 'district_name'],
        [Sequelize.col('farmer.country.id'), 'country_id'],
        [Sequelize.col('farmer.country.county_name'), 'country_name']
      ],
      include:
      {
        model: Farmer,
        as: 'farmer',
        attributes: [],

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
      },
      where,
      group: ['farmer.state.id', 'farmer.district.id', 'farmer.country.id']
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
      [Sequelize.fn('SUM', Sequelize.col('farms.agri_total_area')), 'acreCount'],
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
    const estimateProductionList = await getEstimateProductionBySeason(where);
    const data = getEstimateProductionList(estimateProductionList);
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

const getEstimateProductionList = (estimateProductionList: any) => {
  let season: any = [];
  let estimate: any = [];
  let production: any = [];

  for (const estimateProduction of estimateProductionList) {
    season.push(estimateProduction.dataValues.season.name);
    estimate.push(formatNumber(estimateProduction.dataValues.estimate));
    production.push(formatNumber(estimateProduction.dataValues.production));
  }

  return {
    season,
    estimate,
    production
  };
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
    const where = getOverAllDataQuery(reqData);
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
  where["$farmer.country.latitude$"] = {
    [Op.not]: null
  };
  where["$farmer.country.longitude$"] = {
    [Op.not]: null
  };

  const result = await Farm.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('farmer.agri_total_area')), 'area'],
      [Sequelize.fn('count', Sequelize.col('farmer.id')), 'farmers'],
      [Sequelize.col('farmer.country.county_name'), 'countryName'],
      [Sequelize.col('farmer.country.latitude'), 'latitude'],
      [Sequelize.col('farmer.country.longitude'), 'longitude']
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
    }],
    where,
    group: ['farmer.country.id']
  });

  return result;
};


export {
  getOverallArea,
  getOverallFarmer,
  getFarmerCount,
  getTotalAcres,
  getEstimateAndProduction,
  farmerCountAndArea,
  farmerAllData,
  getFarmersByCountry
};