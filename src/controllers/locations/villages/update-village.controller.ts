import { Request, Response } from "express";

import Village from "../../../models/village.model";

const updateVillage = async (req: Request, res: Response) =>{   
    try {
        const {blockId,villageName,latitude,longitude} = req.body;
          const village = await Village.update({block_id: blockId, village_name: villageName, village_latitude:latitude,village_longitude: longitude},{
            where: {
              id: req.body.id
            }
          });
          return res.sendSuccess(res, { village });
      } catch (error) {
        console.log(error)
        return res.sendError(res, "ERR_NOT_ABLE_TO_UPDATE_STATE");
      }
}

export default updateVillage;