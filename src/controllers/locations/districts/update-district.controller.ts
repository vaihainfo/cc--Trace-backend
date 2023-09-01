import { Request, Response } from "express";

import District from "../../../models/district.model";

const updateDistrict = async (req: Request, res: Response) =>{   
    try {
        const {stateId, districtName} = req.body;
        console.log(req.body)
          const district = await District.update({state_id: stateId, district_name: districtName},{
            where: {
              id: req.body.id
            }
          });
          return res.sendSuccess(res, { district });
      } catch (error) {
        console.log(error)
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
      }
}

export default updateDistrict;