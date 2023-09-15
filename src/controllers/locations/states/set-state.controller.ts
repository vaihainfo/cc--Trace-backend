import { Request, Response } from "express";

import State from "../../../models/state.model";
import { Op } from "sequelize";

const SetState = async (req: Request, res: Response) => {
  try {
    // const stateData = {
    //     country_id: req.body.countryId,
    //     state_name: req.body.stateName,
    //     state_status: true,
    //     state_latitude: req.body.latitude,
    //     state_longitude: req.body.longitude
    // };

    let pass = [];
    let fail = [];
    for await (const obj of req.body.stateName) {
      let result = await State.findOne({ where: { country_id: req.body.countryId, state_name: { [Op.iLike]: obj.stateName }, } })
      if (result) {
        fail.push({ data: result });
      } else {
        const result = await State.create({
          country_id: req.body.countryId,
          state_name: obj.stateName,
          state_latitude: obj.latitude,
          state_longitude: obj.longitude,
          state_status: true,
        });
        pass.push({ data: result });
      }
    }
    res.sendSuccess(res, { pass, fail });
  } catch (error) {
    console.log(error);
    return res.sendError(res, "ERR_NOT_ABLE_TO_CREATE_STATES");
  }
};

export default SetState;
