import { Request, Response } from "express";

import District from "../../../models/district.model";
import Block from "../../../models/block.model";

const deleteDistrict = async (req: Request, res: Response) => {
  try {
    let count = await Block.count({ where: { district_id: req.body.id } });
    if (count > 0) {
      return res.sendError(
        res,
        "Can not delete because District is associated to Block Table"
      );
    }
    const district = await District.destroy({
      where: {
        id: req.body.id,
      },
    });
    console.log("District deleted", district);
    res.sendSuccess(res, { district });
  } catch (error) {
    return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
  }
};

export default deleteDistrict;
