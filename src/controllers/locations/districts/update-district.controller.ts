import { Request, Response } from "express";

import District from "../../../models/district.model";
import { Op } from "sequelize";

const updateDistrict = async (req: Request, res: Response) => {
  try {
    const { stateId, districtName } = req.body;
    let result = await District.findOne({ where: { state_id: stateId, district_name: { [Op.iLike]: districtName }, id: { [Op.ne]: req.body.id } } })
    if (result) {
      return res.sendError(res, "ALREADY_EXITS");
    }
    console.log(req.body)
    const district = await District.update({ state_id: stateId, district_name: districtName }, {
      where: {
        id: req.body.id
      }
    });
    return res.sendSuccess(res, { district });
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message);
  }
}

export default updateDistrict;