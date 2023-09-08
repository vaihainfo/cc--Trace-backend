import { Request, Response } from "express";

import Country from "../../../models/country.model";

const updateCountry = async (req: Request, res: Response) =>{   
    try {
          const country = await Country.update({county_name: req.body.countryName},{
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