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
      } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.message);
      }
}

export default deleteVillage;