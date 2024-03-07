import { Request, Response } from "express";
import { Sequelize, Op, where  } from "sequelize";

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

const checkCountry =  async (req: Request, res: Response) =>{
  try {
    let whereCondition :any = {}
    if(req.body.id){
      whereCondition = { county_name: { [Op.iLike]: req.body.countryName }, id: { [Op.ne]: req.body.id } }
    } else {
      whereCondition = { county_name: { [Op.iLike]: req.body.countryName } } 
    }
    let result = await Country.findOne({ where: whereCondition })
    if (result) {
      return res.sendError(res, "ALREADY_EXITS");
    }
  } catch (error :any) {
    console.log(error)
    return res.sendError(res, error.message);
  }
 
}

export { fetchCountry, checkCountry};