import { Request, Response } from "express";

import Village from "../../../models/village.model";
import { Op } from "sequelize";

const setVillage = async (req: Request, res: Response) => {
  try {
    // const villageData = {
    //     block_id: req.body.blockId,
    //     village_name: req.body.villageName,
    //     village_status: true,
    //     village_latitude: req.body.latitude,
    //     village_longitude: req.body.longitude
    // };
    let pass = [];
    let fail = [];
    for await (const obj of req.body.village) {
      let result = await Village.findOne({ where: { block_id: req.body.blockId, village_name: { [Op.iLike]: obj.villageName } } })
      if (result) {
        fail.push({ data: result });
      } else {
        const result = await Village.create({
          block_id: req.body.blockId,
          village_name: obj.villageName,
          village_latitude: obj.latitude,
          village_longitude: obj.longitude,
          village_status: true,
        });
        pass.push({ data: result });
      }
    }
    res.sendSuccess(res, { pass, fail });
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message);
  }
};

export default setVillage;
