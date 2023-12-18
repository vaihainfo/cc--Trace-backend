import { Request, Response } from "express";

import Block from "../../../models/block.model";
import Village from "../../../models/village.model";

const deleteBlock = async (req: Request, res: Response) =>{   
    try {
      let count = await Village.count({ where: { block_id: req.body.id } });
      if (count > 0) {
          return res.sendError(res, 'Can not delete because Block is associated to Village');
      }
          const block = await Block.destroy({
            where: {
              id: req.body.id
            }
          });
          console.log('block deleted', block);
          res.sendSuccess(res, { block });
      } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.message);
      }
}

export default deleteBlock;