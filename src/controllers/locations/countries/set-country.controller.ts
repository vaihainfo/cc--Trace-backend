import { Request, Response } from "express";

import Country from "../../../models/country.model";

const SetCountry = async (req: Request, res: Response) => {
  try {
    // const countryData = {
    //     county_name: req.body.countryName,
    //     country_status: true,
    // };
    //   const country = await Country.create(countryData);
    const countryData = req.body.countryName.map((obj: string) => {
      if (obj !== "") {
        return { county_name: obj, country_status: true };
      }
    });
    const country = await Country.bulkCreate(countryData);
    console.log("country created", country);
    res.sendSuccess(res, country);
  } catch (error) {
    return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
  }
};

export default SetCountry;
