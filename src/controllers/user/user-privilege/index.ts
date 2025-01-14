import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import UserRole from "../../../models/user-role.model";
import UserPrivilege from "../../../models/userprivilege.model";
import UserCategory from "../../../models/user-category.model";
import MenuList from "../../../models/menu-list.model";
import Brand from "../../../models/brand.model";

const getBrandPrivileges = async (req: Request, res: Response) => {
    const { brandId}: any = req.query;
    try {

        if (!brandId) {
            return res.sendError(res, 'Brand Id is required')
        }

        let role;
        let menuList;
        let privileges;
        role = await UserRole.findOne({
            where:{brand_id: brandId},
            include: [
                {
                    model: UserCategory,
                    as: 'userCategory',
                    attributes: ['id', 'category_name'], // Include only the name attribute of the category
                },
                {
                    model: Brand,
                    as: 'brand',
                    attributes: ['id', 'brand_name'], // Include only the name attribute of the category
                },
            ],
        });

        if(role){
        menuList = await MenuList.findAll(
            {
                where: {
                    categories_allowed: {
                        [Op.contains]: [role.userCategory.id],
                    },
                },
                order: [
                    ["id", 'asc'], // Sort the results based on the 'name' field and the specified order
                ],
                attributes: ['id', 'menu_name'],
            }
        );

        privileges = await UserPrivilege.findAll({
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

        }

        return res.sendSuccess(res, { ...role.dataValues, menuList, privileges});
    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.message);
    }
}

export { getBrandPrivileges }
