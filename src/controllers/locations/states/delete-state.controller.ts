import { Request, Response } from "express";

import State from "../../../models/state.model";
import District from "../../../models/district.model";

const deleteState = async (req: Request, res: Response) =>{   
    try {
      let count = await District.count({ where: { state_id: req.body.id } });
        if (count > 0) {
            return res.sendError(res, 'Can not delete because State is associated to District table');
        }
          const state = await State.destroy({
            where: {
              id: req.body.id
            }
          });
          res.sendSuccess(res, { state });
      } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.message);
      }
}

export default deleteState;