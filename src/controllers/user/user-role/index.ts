import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import UserRole from "../../../models/user-role.model";
import UserPrivilege from "../../../models/userprivilege.model";
import UserCategory from "../../../models/user-category.model";
import MenuList from "../../../models/menu-list.model";
import Brand from "../../../models/brand.model";
import User from "../../../models/user.model";

//create user role
const createUserRole = async (req: Request, res: Response) => {
    try {
        if (req.body.brandId) {
            let brand = await UserRole.findOne({ where: { brand_id: req.body.brandId } });
            if (brand) {
                return res.sendError(res, "This Brand already have role assigned");
            }
        }
        const data = {
            userCategory_id: req.body.categoryId,
            brand_id: req.body.brandId,
            user_role: req.body.userRole,
            status: true
        };
        const role = await UserRole.create(data);
        if (role) {

            const menuData = req.body.privileges?.map((obj: any) => {
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
            let privileges
            if (menuData.length > 0) {
                privileges = await UserPrivilege.bulkCreate(menuData);
            }

            if (req.body.brandId) {
                let brand = await Brand.findByPk(req.body.brandId);
                for await (let user of brand.dataValues.brandUser_id) {
                    let update = await User.update({ role: role.id }, { where: { id: user } })
                }
            }

            res.sendSuccess(res, { role, privileges });
        }
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

const checkRoleExists = async (req: Request, res: Response) => {
    try {
        let whereCondition = {}
        if (req.body.roleId) {
            whereCondition = { user_role: { [Op.iLike]: req.body.userRole }, id: { [Op.ne]: req.body.roleId } }
        } else {
            whereCondition = { user_role: { [Op.iLike]: req.body.userRole } }
        }

        let role = await UserRole.findOne({ where: whereCondition })

        return res.sendSuccess(res, role ? { exist: true } : { exist: false })

    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

//get user roles
const getUserRoles = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'desc';
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
                }, {
                    model: Brand,
                    as: 'brand',
                    attributes: ['id', 'brand_name'],
                }
            ]
        };

        if (sortOrder === 'asc' || sortOrder === 'desc') {
            queryOptions.order = [['id', sortOrder]];
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
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

const getUserRole = async (req: Request, res: Response) => {
    try {
        const role = await UserRole.findByPk(req.query.id, {
            include: [
                {
                    model: UserCategory,
                    as: 'userCategory',
                    attributes: ['id', 'category_name'], // Include only the name attribute of the category
                },
            ],
        });

        const menuList = await MenuList.findAll(
            {
                where: {
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
        return res.sendSuccess(res, { role, menuList, privileges });
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

const updateUserRole = async (req: Request, res: Response) => {
    try {
        if (req.body.brandId) {
            let brand = await UserRole.findOne({ where: { brand_id: req.body.brandId, id: { [Op.ne]: req.body.id } } });
            if (brand) {
                return res.sendError(res, "This Brand has role assigned");
            }
        }
        const roleId = req.body.id;
        const updatedData = {
            brand_id: req.body.brandId ? req.body.brandId : undefined,
            user_role: req.body.userRole
        };



        for await (const privilege of req.body.privileges) {
            const existingPrivilege = await UserPrivilege.findOne({
                where: {
                    userRole_id: roleId,
                    menu_id: privilege.menuId,
                },
            });

            if (existingPrivilege) {
                if(!privilege.create && !privilege.view && !privilege.edit && !privilege.delete){
                    let update = await UserPrivilege.destroy({ where: { id: existingPrivilege.id } })
                }else{
                    let update = await UserPrivilege.update({
                        userRole_id: roleId,
                        menu_id: privilege.menuId,
                        create_privilege: privilege.create,
                        view_privilege: privilege.view,
                        edit_privilege: privilege.edit,
                        delete_privilege: privilege.delete,
                        status: existingPrivilege.status
                    }, { where: { id: existingPrivilege.id } })
                }
            } else {
                let create = await UserPrivilege.create({
                    userRole_id: roleId,
                    menu_id: privilege.menuId,
                    create_privilege: privilege.create,
                    view_privilege: privilege.view,
                    edit_privilege: privilege.edit,
                    delete_privilege: privilege.delete,
                    status: true
                })
            }
        }
        const rowsUpdated = await
            UserRole.update(updatedData, {
                where: { id: roleId },
                returning: true,
            })
        if (req.body.brandId) {
            let brand = await Brand.findByPk(req.body.brandId);
            for await (let user of brand.dataValues.brandUser_id) {
                let update = await User.update({ role: roleId }, { where: { id: user } })
            }
        }
        if (rowsUpdated === 0) {
            return res.sendError(res, "ERR_ROLE_NOT_FOUND");
        }

        return res.sendSuccess(res, rowsUpdated);
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}


const deleteUserRole = async (req: Request, res: Response) => {
    try {
        let count = await User.count({ where: { role: req.body.id } })
        if (count > 0) {
            return res.sendError(res, 'Not possible to delete this role since some users are associated to this role.')
        }
        let isBrand = await UserRole.findAll({
            where: {
                id: req.body.id,
                user_role: 'Brand'
            }
        });

        if(isBrand && isBrand.length > 0){
            return res.sendError(res, 'Not possible to delete this role since brand role and category is needed.')
        }

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


export { createUserRole, getUserRoles, getUserRole, updateUserRole, deleteUserRole, checkRoleExists }