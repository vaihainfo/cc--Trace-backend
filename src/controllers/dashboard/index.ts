import { Request, Response } from "express";
import Farmer from "../../models/farmer.model";
import { Op } from "sequelize";
import * as yup from 'yup';

const getOverallArea = async (
  req: Request, res: Response
) => {
  try {

    const reqData = await getQueryParams(req, res);
    const where = getOverAllDataQuery(reqData);
    const data = await getOverAllData(where);
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





export {
  getOverallArea
};