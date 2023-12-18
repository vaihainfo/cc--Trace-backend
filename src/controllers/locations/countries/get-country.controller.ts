import { Request, Response } from "express";
import { Sequelize, Op  } from "sequelize";

import Country from "../../../models/country.model";

const fetchCountry = async (req: Request, res: Response) =>{   
//   const searchTerm = req.query.search || '';
//   const sortOrder = req.query.sort || 'asc'; 

    try {    
        const country = await Country.findByPk(req.body.id);

          return res.sendSuccess(res,  country );
      } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.message);
      }
}

export default fetchCountry;