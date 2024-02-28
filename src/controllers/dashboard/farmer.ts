import { Request, Response } from "express";
import Farmer from "../../models/farmer.model";
import { Op, Sequelize } from "sequelize";
import * as yup from 'yup';
import State from "../../models/state.model";
import District from "../../models/district.model";
import Country from "../../models/country.model";
import Farm from "../../models/farm.model";
import Season from "../../models/season.model";
import Transaction from "../../models/transaction.model";

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
  try {
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
          [Op.gt]: 1,
          [Op.lt]: 2.5
        }
      }
    });

    return {
      moreThanOne,
      lessThanOne,
      moreThanTwo
    };
  }
  catch (error) {
    console.log(error);
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
    where.brand_id = reqData.brand;

  // if (reqData?.season)
  //   where[Op.and] = reqData.season;

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
    const {
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
    if (where?.country_id)
      where.country_id = where.country_id;
    else
      where.country_id = 29;
    const stateCount = Farmer.findAll({
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.literal('"farmers"."state_id"')), 'farmerCount'],
      ],
      include: [
        {
          model: State,
          as: 'state',
          attributes: ['id', 'state_name'],
        },
        {
          model: District,
          as: 'district',
          attributes: ['id', 'district_name'],
        },
        {
          model: Country,
          as: 'country',
          attributes: ['id', 'county_name']
        }
      ],
      where: where,
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
      country.id == farmer.dataValues.country.dataValues.id
    );

    const findStateId = state.findIndex((state: any) =>
      state.id == farmer.dataValues.state.dataValues.id
    );
    const findDistrictId = district.findIndex((district: any) =>
      district.id == farmer.dataValues.district.dataValues.id
    );

    if (findCountryId == -1)
      country.push({
        id: farmer.dataValues.country.dataValues.id,
        name: farmer.dataValues.country.dataValues.county_name,
        count: Number(farmer.dataValues.farmerCount),
      });
    else
      if (country.length)
        country.forEach((country: any) => {
          if (country.id == farmer.dataValues.country.dataValues.id)
            country.count = Number(country.count) + Number(farmer.dataValues.farmerCount);
        });

    if (findStateId == -1)
      state.push({
        id: farmer.dataValues.state.dataValues.id,
        name: farmer.dataValues.state.dataValues.state_name,
        count: Number(farmer.dataValues.farmerCount),
      });
    else
      if (state.length)
        state.forEach((state: any) => {
          if (state.id == farmer.dataValues.state.dataValues.id)
            state.count = Number(state.count) + Number(farmer.dataValues.farmerCount);
        });

    if (findDistrictId == -1)
      district.push({
        id: farmer.dataValues.district.dataValues.id,
        name: farmer.dataValues.district.dataValues.district_name,
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
        where: where
      },
      {
        model: Season,
        as: 'season',
        attributes: []
      }
    ],
    where: where,
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
        where: where
      },
      {
        model: Season,
        as: 'season',
        attributes: []
      }
    ],
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

const getEstimateProductionBySeason = async (estimateProductionList: any) => {

  const estimateAndProduction = await Farm.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('farmer.total_estimated_cotton')), 'estimate'],
      [Sequelize.fn('SUM', Sequelize.col('farmer.agri_estimated_prod')), 'production']
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
    const where = getOverAllDataQuery(reqData);
    const acresList = await getAcreBySession(where);
    const farmerCountList = await getFarmerBySeasons(where);
    const data = getFarmerCountAndAreaRes(acresList, farmerCountList);
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};

const getFarmerCountAndAreaRes = (
  acreList: any[],
  farmerCountList: any[]
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
      data.count = formatNumber(fAcre.dataValues.acreCount);
    }

    if (fCount) {
      data.seasonName = fCount.dataValues.seasonName;
      data.acre = formatNumber(fCount.dataValues.farmerCount);
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
    const where = getOverAllDataQuery(reqData);
    const acresList = await getAcreBySession(where);
    const farmerCountList = await getFarmerBySeasons(where);
    const estimateProductionList = await getEstimateProductionBySeason(where);
    const data = getFarmerAllDataRes(
      acresList,
      farmerCountList,
      estimateProductionList
    );
    return res.sendSuccess(res, data);

  } catch (error: any) {
    const code = error.errCode
      ? error.errCode
      : "ERR_INTERNAL_SERVER_ERROR";
    return res.sendError(res, code);
  }
};

const getFarmerAllDataRes = (
  acreList: any[],
  farmerCountList: any[],
  estimateProductionList: any
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
    if (estimateProduction.dataValues.season.id)
      seasonIds.push(estimateProduction.dataValues.season.id);
  });

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

export {
  getOverallArea,
  getOverallFarmer,
  getFarmerCount,
  getTotalAcres,
  getEstimateAndProduction,
  farmerCountAndArea,
  farmerAllData
};