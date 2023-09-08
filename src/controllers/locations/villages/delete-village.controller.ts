import { Request, Response } from "express";

import Village from "../../../models/village.model";

const deleteVillage = async (req: Request, res: Response) =>{   
    try {
          const village = await Village.destroy({
            where: {
              id: req.body.id
            }
          });
          res.sendSuccess(res, { village });
      } catch (error) {
        return res.sendError(res, "ERR_NOT_ABLE_TO_DELETE_VILLAGE");
      }
}

export default deleteVillage;