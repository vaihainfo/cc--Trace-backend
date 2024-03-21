import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import MenuList from "../../../models/menu-list.model";

const createMenuItem = async (req: Request, res: Response) => {
    try {
        const data = {
            menu_name: req.body.menuName,
            categories_allowed: req.body.categoriesId
        };
        const menuList = await MenuList.create(data);
        res.sendSuccess(res, menuList);
    } catch (error: any) {
      console.log(error)
      return res.sendError(res, error.message);
  }
}

const getMenuList = async (req: Request, res: Response) => {
    try {    
          const menuList = await MenuList.findAll(
            {where: {
                categories_allowed: {
                  [Op.contains]: [req.query.categoryId],
                },
              },
              order: [
                ["id", 'asc'], // Sort the results based on the 'name' field and the specified order
            ]}
        );
          return res.sendSuccess(res, menuList);
      }catch (error: any) {
        console.log(error)
        return res.sendError(res, error.message);
    }
}

const updateMenuItem = async (req: Request, res: Response) => {
  try {
      const data = {
          menu_name: req.body.menuName,
          categories_allowed: req.body.categoriesId
      };
      const menuList = await MenuList.update(data, {
        where: {
            id: req.body.id
        }});
      res.sendSuccess(res, menuList);
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message);
}
}

const deleteMenuItem = async (req: Request, res: Response) => {
  try {
      const menuList = await MenuList.destroy({
        where: {
            id: req.body.id
        }});
      res.sendSuccess(res, menuList);
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message);
}
}

export { createMenuItem, getMenuList, updateMenuItem, deleteMenuItem}