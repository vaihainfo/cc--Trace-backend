import { Request, Response } from "express";

import Block from "../../../models/block.model";

const setBlock = async (req: Request, res: Response) => {
  try {
    // const blockData = {
    //     district_id: req.body.districtId,
    //     block_name: req.body.blockName,
    //     block_status: true,
    // };


    //Save Block Names
    const blockData = req.body.blockName.map((obj: any) => {
      if (obj !== "") {
        return {
          district_id: req.body.districtId,
          block_name: obj,
          block_status: true,
        };
      }
    });
    const block = await Block.bulkCreate(blockData);
    console.log("block created", block);
    res.sendSuccess(res, { block });
  } catch (error) {
    return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
  }
};

export default setBlock;
