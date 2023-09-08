import { Request, Response } from "express";

import State from "../../../models/state.model";

const SetState = async (req: Request, res: Response) => {
  try {
    // const stateData = {
    //     country_id: req.body.countryId,
    //     state_name: req.body.stateName,
    //     state_status: true,
    //     state_latitude: req.body.latitude,
    //     state_longitude: req.body.longitude
    // };
    const stateData = req.body.stateName.map((obj: any) => {
      if (obj !== "") {
        return {
          country_id: req.body.countryId,
          state_name: obj.stateName,
          state_latitude: obj.latitude,
          state_longitude: obj.longitude,
          state_status: true,
        };
      }
    });
    const state = await State.bulkCreate(stateData);
    console.log("state crerated", state);
    return res.sendSuccess(res, { state });
  } catch (error) {
    console.log(error);
    return res.sendError(res, "ERR_NOT_ABLE_TO_CREATE_STATES");
  }
};

export default SetState;
