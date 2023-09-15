import { Request, Response } from "express";

import District from "../../../models/district.model";
import { Op } from "sequelize";

const setDistrict = async (req: Request, res: Response) => {
  try {
    // const districtData = {
    //     state_id: req.body.stateId,
    //     district_name: req.body.districtName,
    //     district_status: true,
    // };
    let pass = [];
    let fail = [];
    for await (const obj of req.body.districtName) {
      let result = await District.findOne({ where: { state_id: req.body.stateId, district_name: { [Op.iLike]: obj } } })
      if (result) {
        fail.push({ data: result });
      } else {
        const result = await District.create({ state_id: req.body.stateId, district_name: obj, district_status: true });
        pass.push({ data: result });
      }
    }
    res.sendSuccess(res, { pass, fail });
  } catch (error) {
    return res.sendError(res, "ERR_NOT_ABLE_TO_UPDATE_DISTRICTS");
  }
}

export default setDistrict;