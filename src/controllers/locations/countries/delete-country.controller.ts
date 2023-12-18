import { Request, Response } from "express";

import Country from "../../../models/country.model";
import State from "../../../models/state.model";

const deleteCountry = async (req: Request, res: Response) =>{   
    try {
          let count = await State.count({ where: { country_id: req.body.id } });
          if (count > 0) {
              return res.sendError(res, 'Can not delete because Country is associated to State Table');
          }

          const country = await Country.destroy({
            where: {
              id: req.body.id
            }
          });
          console.log('country deleted', country);
          res.sendSuccess(res, { country });
      } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.message);
      }
}

export default deleteCountry;