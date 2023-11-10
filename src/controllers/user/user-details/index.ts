import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import UserRole from "../../../models/user-role.model";
import UserPrivilege from "../../../models/userprivilege.model";
import UserCategory from "../../../models/user-category.model";
import MenuList from "../../../models/menu-list.model";
import User from "../../../models/user.model";
import Spinner from "../../../models/spinner.model";
import Ginner from "../../../models/ginner.model";
import Weaver from "../../../models/weaver.model";
import Knitter from "../../../models/knitter.model";
import Garment from "../../../models/garment.model";
import Trader from "../../../models/trader.model";
import Fabric from "../../../models/fabric.model";

const getUserInfo = async (req: Request, res: Response) => {
    try {
        const authenticatedReq = req as any;

        const user = await User.findByPk(authenticatedReq.user._id,
            { attributes: { exclude: ['password', 'createdAt', 'updatedAt'] } }
        );


        const role = await UserRole.findByPk(authenticatedReq.user.role, {
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
        let [spinner, ginner, weaver, knitter, garment, trader, fabric] = await Promise.all([
            Spinner.findOne({ where: { spinnerUser_id: { [Op.contains]: [user.dataValues.id] } } }),
            Ginner.findOne({ where: { ginnerUser_id: { [Op.contains]: [user.dataValues.id] } } }),
            Weaver.findOne({ where: { weaverUser_id: { [Op.contains]: [user.dataValues.id] } } }),
            Knitter.findOne({ where: { knitterUser_id: { [Op.contains]: [user.dataValues.id] } } }),
            Garment.findOne({ where: { garmentUser_id: { [Op.contains]: [user.dataValues.id] } } }),
            Trader.findOne({ where: { traderUser_id: { [Op.contains]: [user.dataValues.id] } } }),
            Fabric.findOne({ where: { fabricUser_id: { [Op.contains]: [user.dataValues.id] } } }),
        ])
        let processor = [];
        spinner ? processor.push('Spinner') : "";
        ginner ? processor.push('Ginner') : "";
        weaver ? processor.push('Weaver') : "";
        knitter ? processor.push('Knitter') : "";
        garment ? processor.push('Garment') : "";
        trader ? processor.push('Trader') : "";
        fabric ? processor.push('Fabric') : "";
        return res.sendSuccess(res, { user, role, menuList, privileges, spinner, ginner, weaver, knitter, garment, trader, fabric, processor });
    } catch (error) {
        console.log(error)
        return res.sendError(res, "ERR_NOT_ABLE_TO_GET_USER_DETAILS");
    }
}

export { getUserInfo }