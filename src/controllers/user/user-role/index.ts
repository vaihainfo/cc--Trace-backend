import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import UserRole from "../../../models/user-role.model";
import UserPrivilege from "../../../models/userprivilege.model";
import UserCategory from "../../../models/user-category.model";
import MenuList from "../../../models/menu-list.model";

const createUserRole = async (req: Request, res: Response) => {
    try {
        const data = {
            userCategory_id: req.body.categoryId,
            user_role: req.body.userRole,
            status:true
        };
        const role = await UserRole.create(data);
        if(role){
            const menuData = req.body.privileges.map((obj: any) => {
                return {
                  userRole_id: role.id,
                  menu_id: obj.menuId,
                  create_privilege: obj.create,
                  view_privilege: obj.view,
                  edit_privilege: obj.edit,
                  delete_privilege: obj.delete,
                  status: true,
                };
            })
            const privileges = await UserPrivilege.bulkCreate(menuData);
            res.sendSuccess(res, {role,privileges});
        }
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const getUserRoles = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
  const sortOrder = req.query.sort || ''; 
//   const sortField = req.query.sortBy || ''; 
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const whereCondition: any = {}
  try {
      if (searchTerm) {
          whereCondition[Op.or] = [
              { user_role: { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type 
              { '$userCategory.category_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop name
          ];
      }

      const queryOptions: any = {
        where: whereCondition,
        include: [
            {
                model: UserCategory,
                as: 'userCategory'
            }
        ]
    };

    if (sortOrder === 'asc' || sortOrder === 'desc') {
        queryOptions.order = [['user_role', sortOrder]];
    }
      //fetch data with pagination
      if (req.query.pagination === "true") {
        queryOptions.offset = offset;
        queryOptions.limit = limit;
  
        const { count, rows } = await UserRole.findAndCountAll(queryOptions);
        return res.sendPaginationSuccess(res, rows, count);
      } else {
          const userrole = await UserRole.findAll(queryOptions);
          return res.sendSuccess(res, userrole, 200);
      }
    }catch (error) {
        console.log(error)
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
      }
}

const getUserRole = async (req: Request, res: Response) => {
  try {
          const role = await UserRole.findByPk(req.query.id, {
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
                userRole_id: req.query.id,
            },
            include: [
                {
                    model: MenuList,
                    as: 'menu',
                    attributes: ['menu_name'], // Include only the name attribute of the category
                },
            ],
        });
          return res.sendSuccess(res, {role,menuList,privileges});
    }catch (error) {
        console.log(error)
        return res.sendError(res, "ERR_NOT_ABLE_TO_GET_ROLE");
      }
}

const updateUserRole = async (req: Request, res: Response) => {
    try {
        const roleId = req.body.id;
        const updatedData = {
            user_role: req.body.userRole,
        };

        const privilegesToUpdate = [];
        const privilegesToInsert = [];

        for (const privilege of req.body.privileges) {
            const existingPrivilege = await UserPrivilege.findOne({
                where: {
                    userRole_id: roleId,
                    menu_id: privilege.menuId,
                },
            });

            console.log(existingPrivilege)

            if (existingPrivilege) {
                privilegesToUpdate.push({
                    id: existingPrivilege.id,
                    userRole_id: roleId,
                    menu_id: privilege.menuId,
                    create_privilege: privilege.create,
                    view_privilege: privilege.view,
                    edit_privilege: privilege.edit,
                    delete_privilege: privilege.delete,
                    status: existingPrivilege.status
                });
            } else {
                privilegesToInsert.push({
                    userRole_id: roleId,
                    menu_id: privilege.menuId,
                    create_privilege: privilege.create,
                    view_privilege: privilege.view,
                    edit_privilege: privilege.edit,
                    delete_privilege: privilege.delete,
                    status: true
                });
            }
        }

        const [rowsUpdated, [updatedRole]] = await Promise.all([
            UserRole.update(updatedData, {
                where: { id: roleId },
                returning: true,
            }),
            UserPrivilege.bulkCreate(privilegesToUpdate, {
                updateOnDuplicate: ['create_privilege', 'view_privilege', 'edit_privilege', 'delete_privilege'],
            }),
            UserPrivilege.bulkCreate(privilegesToInsert),
        ]);

        console.log(rowsUpdated)

        if (rowsUpdated === 0) {
            return res.sendError(res, "ERR_ROLE_NOT_FOUND");
        }

            return res.sendSuccess(res, updatedRole);
      }catch (error) {
          console.log(error)
          return res.sendError(res, "ERR_ROLE_NOT_UPDATED");
        }
  }


const deleteUserRole = async (req: Request, res: Response) => {
    try {
        const userRole = await UserRole.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, userRole);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}


export { createUserRole, getUserRoles, getUserRole, updateUserRole, deleteUserRole}