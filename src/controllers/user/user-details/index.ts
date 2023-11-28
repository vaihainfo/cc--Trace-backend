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
import { generateTokens } from "../../../util/auth";
import Brand from "../../../models/brand.model";

const getUserInfo = async (req: Request, res: Response) => {
    try {
        const authenticatedReq = req as any;

        const user = await User.findByPk(authenticatedReq.user._id,
            { attributes: { exclude: ['password', 'createdAt', 'updatedAt'] } }
        );


        let role;
        role = await UserRole.findByPk(authenticatedReq.user.role, {
            include: [
                {
                    model: UserCategory,
                    as: 'userCategory',
                    attributes: ['id', 'category_name'], // Include only the name attribute of the category
                },
            ],
        });
        if (req.query.ginnerId) {
            role = await UserRole.findOne({
                where: { user_role: 'Ginner' },
                include: [
                    {
                        model: UserCategory,
                        as: 'userCategory',
                        attributes: ['id', 'category_name'], // Include only the name attribute of the category
                    },
                ],
            });
            role = role.dataValues;
        }
        let menuList = await MenuList.findAll(
            {
                where: {
                    categories_allowed: {
                        [Op.contains]: [role.userCategory.id],
                    },
                },
                attributes: ['id', 'menu_name'],
            }
        );

        let privileges = await UserPrivilege.findAll({
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
        let [spinner, ginner, weaver, knitter, garment, trader, fabric, brand] = await Promise.all([
            Spinner.findOne({ where: { spinnerUser_id: { [Op.contains]: [user.dataValues.id] } } }),
            Ginner.findOne({ where: { ginnerUser_id: { [Op.contains]: [user.dataValues.id] } } }),
            Weaver.findOne({ where: { weaverUser_id: { [Op.contains]: [user.dataValues.id] } } }),
            Knitter.findOne({ where: { knitterUser_id: { [Op.contains]: [user.dataValues.id] } } }),
            Garment.findOne({ where: { garmentUser_id: { [Op.contains]: [user.dataValues.id] } } }),
            Trader.findOne({ where: { traderUser_id: { [Op.contains]: [user.dataValues.id] } } }),
            Fabric.findOne({ where: { fabricUser_id: { [Op.contains]: [user.dataValues.id] } } }),
            Brand.findOne({ where: { brandUser_id: { [Op.contains]: [user.dataValues.id] } } })
        ])
        let processor = [];
        spinner ? processor.push('Spinner') : "";
        ginner ? processor.push('Ginner') : "";
        weaver ? processor.push('Weaver') : "";
        knitter ? processor.push('Knitter') : "";
        garment ? processor.push('Garment') : "";
        trader ? processor.push('Trader') : "";
        fabric ? processor.push('Fabric') : "";
        brand ? processor.push('Brand') : "";
        if (req.query.ginnerId) {
            ginner = await Ginner.findOne({ where: { id: req.query.ginnerId } })
        }
        return res.sendSuccess(res, { user, role, menuList, privileges, spinner, ginner, weaver, knitter, garment, trader, fabric, brand, processor });
    } catch (error) {
        console.log(error)
        return res.sendError(res, "ERR_NOT_ABLE_TO_GET_USER_DETAILS");
    }
}

const processorLoginAdmin = async (req: Request, res: Response) => {
    try {
        let userId: any
        if (req.query.type === 'ginner') {
            let ginner = await Ginner.findOne({ where: { id: req.query.ginnerId } });
            userId = ginner.dataValues.ginnerUser_id
        }
        const user = await User.findOne({ where: { id: userId } });
        if (!user) {
            return res.sendError(res, "user not found");
        }
        if (user) {
            var { accessToken } = await generateTokens(user.dataValues.id, user.dataValues.role);

            return res.sendSuccess(res, { accessToken: accessToken, user: user.dataValues })
        }
    } catch (error) {
        return res.sendError(res, "ERR_NOT_ABLE_TO_GET");
    }
}

export { getUserInfo, processorLoginAdmin }