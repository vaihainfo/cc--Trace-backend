import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import UserCategory from "../../../models/user-category.model";

const createUserCategory = async (req: Request, res: Response) => {
    try {
        const data = {
            category_name: req.body.categoryName,
        };
        const category = await UserCategory.create(data);
        res.sendSuccess(res, category);
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const getUserCategories = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
  const sortOrder = req.query.sort || ''; 

  let whereCondition:any;
    try {    
        if(sortOrder !== ''){
            whereCondition = {
                order: [
                    ['category_name', sortOrder], // Sort the results based on the 'username' field and the specified order
                  ],
            }
        }
          const categories = await UserCategory.findAll(
            whereCondition
        );
          return res.sendSuccess(res,  categories );
      } catch (error) {
        console.log(error)
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
      }
}


export { createUserCategory, getUserCategories}