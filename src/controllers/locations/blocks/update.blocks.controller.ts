import { Request, Response } from "express";

import Block from "../../../models/block.model";
import { Op } from "sequelize";

const updateBlock = async (req: Request, res: Response) => {
  try {
    const { districtId, blockName } = req.body;
    let bloc = await Block.findOne({ where: { district_id: districtId, block_name: { [Op.iLike]: blockName }, id: { [Op.ne]: req.body.id } } })
    if (bloc) {
      return res.sendError(res, "ALREADY_EXITS");
    }

    const block = await Block.update({ district_id: districtId, block_name: blockName }, {
      where: {
        id: req.body.id
      }
    });
    return res.sendSuccess(res, { block });
  } catch (error) {
    console.log(error)
    return res.sendError(res, "ERR_NOT_ABLE_TO_UPDATE_BLOCK");
  }
}

export default updateBlock;