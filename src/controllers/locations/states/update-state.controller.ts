import { Request, Response } from "express";

import State from "../../../models/state.model";
import { Op } from "sequelize";

const updateState = async (req: Request, res: Response) => {
  try {
    const { countryId, stateName, latitude, longitude } = req.body;
    let result = await State.findOne({ where: { country_id: countryId, state_name: { [Op.iLike]: stateName }, id: { [Op.ne]: req.body.id } } })
    if (result) {
      return res.sendError(res, "ALREADY_EXITS");
    }
    console.log(req.body)
    const state = await State.update({ country_id: countryId, state_name: stateName, state_latitude: latitude, state_longitude: longitude }, {
      where: {
        id: req.body.id
      }
    });
    return res.sendSuccess(res, { state });
  } catch (error) {
    console.log(error)
    return res.sendError(res, "ERR_NOT_ABLE_TO_UPDATE_STATE");
  }
}

export default updateState;