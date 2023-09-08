import { Request, Response } from "express";

import Village from "../../../models/village.model";

const setVillage = async (req: Request, res: Response) => {
  try {
    // const villageData = {
    //     block_id: req.body.blockId,
    //     village_name: req.body.villageName,
    //     village_status: true,
    //     village_latitude: req.body.latitude,
    //     village_longitude: req.body.longitude
    // };
    const villageData = req.body.village.map((obj: any) => {
      if (obj !== "") {
        return {
          block_id: req.body.blockId,
          village_name: obj.villageName,
          village_latitude: obj.latitude,
          village_longitude: obj.longitude,
          village_status: true,
        };
      }
    });

    const village = await Village.bulkCreate(villageData);
    console.log("village created", village);
    return res.sendSuccess(res, { village });
  } catch (error) {
    console.log(error);
    return res.sendError(res, "ERR_NOT_ABLE_TO_CREATE_VILLAGES");
  }
};

export default setVillage;
