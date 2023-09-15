import { Request, Response } from "express";

import Block from "../../../models/block.model";
import { Op } from "sequelize";

const setBlock = async (req: Request, res: Response) => {
  try {
    // const blockData = {
    //     district_id: req.body.districtId,
    //     block_name: req.body.blockName,
    //     block_status: true,
    // };


    //Save Block Names
    let pass = [];
    let fail = [];
    for await (const obj of req.body.blockName) {
      let result = await Block.findOne({ where: { district_id: req.body.districtId, block_name: { [Op.iLike]: obj }, } })
      if (result) {
        fail.push({ data: result });
      } else {
        const result = await Block.create({
          district_id: req.body.districtId,
          block_name: obj,
          block_status: true,
        });
        pass.push({ data: result });
      }
    }
    res.sendSuccess(res, { pass, fail });
  } catch (error) {
    return res.sendError(res, "ERR_NOT_ABLE_TO_CREATE_BLOCKS");
  }
};

export default setBlock;
