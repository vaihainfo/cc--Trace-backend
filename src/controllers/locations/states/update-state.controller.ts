import { Request, Response } from "express";

import State from "../../../models/state.model";

const updateState = async (req: Request, res: Response) =>{   
    try {
        const {countryId,stateName,latitude,longitude} = req.body;
        console.log(req.body)
          const state = await State.update({country_id: countryId, state_name: stateName, state_latitude:latitude,state_longitude: longitude},{
            where: {
              id: req.body.id
            }
          });
          return res.sendSuccess(res, { state });
      } catch (error) {
        console.log(error)
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
      }
}

export default updateState;