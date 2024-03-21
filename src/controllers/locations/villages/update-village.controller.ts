import { Request, Response } from "express";

import Village from "../../../models/village.model";
import { Op } from "sequelize";

const updateVillage = async (req: Request, res: Response) => {
  try {
    const { blockId, villageName, latitude, longitude } = req.body;
    let result = await Village.findOne({ where: { block_id: blockId, village_name: { [Op.iLike]: villageName }, id: { [Op.ne]: req.body.id } } })
    if (result) {
      return res.sendError(res, "ALREADY_EXITS");
    }
    const village = await Village.update({ block_id: blockId, village_name: villageName, village_latitude: latitude, village_longitude: longitude }, {
      where: {
        id: req.body.id
      }
    });
    return res.sendSuccess(res, { village });
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message);
  }
}

export default updateVillage;