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
    } catch (error) {
        return res.sendError(res, "ERR_MENU_NOT_CREATED");
    }
}

const getMenuList = async (req: Request, res: Response) => {
    try {    
          const menuList = await MenuList.findAll(
            {where: {
                categories_allowed: {
                  [Op.contains]: [req.query.categoryId],
                },
              },}
        );
          return res.sendSuccess(res, menuList);
      } catch (error) {
        console.log(error)
        return res.sendError(res, "ERR_MENU_NOT_FETCHED");
      }
}

export { createMenuItem, getMenuList}