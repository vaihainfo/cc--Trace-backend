import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import UserRole from "../../../models/user-role.model";
import UserPrivilege from "../../../models/userprivilege.model";
import UserCategory from "../../../models/user-category.model";
import MenuList from "../../../models/menu-list.model";
import User from "../../../models/user.model";

const getUserInfo = async (req: Request, res: Response) => {
    try {
        const authenticatedReq = req as any;
        
            const user = await User.findByPk(authenticatedReq.user._id,
                {attributes: { exclude: ['password', 'createdAt', 'updatedAt'] }}
                );


            const role = await UserRole.findByPk(authenticatedReq.user.role, {
              include: [
                  {
                      model: UserCategory,
                      as: 'userCategory',
                      attributes: ['id','category_name'], // Include only the name attribute of the category
                  },
              ],
          });
  
          const menuList = await MenuList.findAll(
              {where: {
                  categories_allowed: {
                    [Op.contains]: [role.userCategory.id],
                  },
                },
                attributes: ['id', 'menu_name'],
              }
          );
  
          const privileges = await UserPrivilege.findAll({
              where: {
                  userRole_id: role.id,
              },
              include: [
                  {
                      model: MenuList,
                      as: 'menu',
                      attributes: ['menu_name'], // Include only the name attribute of the category
                  },
              ],
          });
            return res.sendSuccess(res, {user, role, menuList,privileges});
      }catch (error) {
          console.log(error)
          return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
        }
  }

  export { getUserInfo}