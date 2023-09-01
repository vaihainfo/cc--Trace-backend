import { Request, Response } from "express";

import Block from "../../../models/block.model";

const updateBlock = async (req: Request, res: Response) =>{   
    try {
        const {districtId, blockName} = req.body;
          const block = await Block.update({district_id: districtId, block_name: blockName},{
            where: {
              id: req.body.id
            }
          });
          return res.sendSuccess(res, { block });
      } catch (error) {
        console.log(error)
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
      }
}

export default updateBlock;