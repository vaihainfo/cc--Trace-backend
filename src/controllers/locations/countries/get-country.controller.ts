import { Request, Response } from "express";
import { Sequelize, Op  } from "sequelize";

import Country from "../../../models/country.model";

const fetchCountry = async (req: Request, res: Response) =>{   
//   const searchTerm = req.query.search || '';
//   const sortOrder = req.query.sort || 'asc'; 

    try {    
        const country = await Country.findByPk(req.body.id);

          return res.sendSuccess(res,  country );
      } catch (error) {
        console.log(error)
        return res.sendError(res, "ERR_NOT_ABLE_TO_GET_COUNTRY");
      }
}

export default fetchCountry;