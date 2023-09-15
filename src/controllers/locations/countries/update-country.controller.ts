import { Request, Response } from "express";

import Country from "../../../models/country.model";
import { Op } from "sequelize";

const updateCountry = async (req: Request, res: Response) => {
  try {
    let result = await Country.findOne({ where: { county_name: { [Op.iLike]: req.body.countryName }, id: { [Op.ne]: req.body.id } } })
    if (result) {
      return res.sendError(res, "ALREADY_EXITS");
    }
    const country = await Country.update({ county_name: req.body.countryName }, {
      where: {
        id: req.body.id
      }
    });
    console.log('country updated', country);
    res.sendSuccess(res, { country });
  } catch (error) {
    return res.sendError(res, "ERR_NOT_ABLE_TO_UPDATE_COUNTRY");
  }
}

export default updateCountry;