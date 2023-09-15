import { Request, Response } from "express";

import Country from "../../../models/country.model";
import { Op } from "sequelize";

const SetCountry = async (req: Request, res: Response) => {
  try {
    // const countryData = {
    //     county_name: req.body.countryName,
    //     country_status: true,
    // };
    //   const country = await Country.create(countryData);
    let pass = [];
    let fail = [];
    for await (const obj of req.body.countryName) {
      let result = await Country.findOne({ where: { county_name: { [Op.iLike]: obj } } })
      if (result) {
        fail.push({ data: result });
      } else {
        const result = await Country.create({ county_name: obj, country_status: true });
        pass.push({ data: result });
      }
    }
    res.sendSuccess(res, { pass, fail });
  } catch (error) {
    return res.sendError(res, "ERR_NOT_ABLE_TO_CREATE_COUNTRY");
  }
};

export default SetCountry;
