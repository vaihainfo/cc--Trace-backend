import { Request, Response } from "express";

import District from "../../../models/district.model";

const setDistrict = async (req: Request, res: Response) =>{   
    try {
        // const districtData = {
        //     state_id: req.body.stateId,
        //     district_name: req.body.districtName,
        //     district_status: true,
        // };
        const districtData = req.body.districtName.map((obj: string) => {
          if(obj !== ''){return { state_id: req.body.stateId, district_name: obj, district_status: true }}
      })
          const district = await District.bulkCreate(districtData);
          console.log('district created', district);
          res.sendSuccess(res, { district });
      } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
      }
}

export default setDistrict;