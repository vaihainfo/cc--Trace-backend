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
import PhysicalPartner from "../../../models/physical-partner.model";

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

        if (req.query.spinnerId) {
            role = await UserRole.findOne({
                where: { user_role: 'Spinner' },
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

        if (req.query.knitterId) {
            role = await UserRole.findOne({
                where: { user_role: 'Knitter' },
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
        if (req.query.weaverId) {
            role = await UserRole.findOne({
                where: { user_role: 'Weaver' },
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

        if (req.query.garmentId) {
            role = await UserRole.findOne({
                where: { user_role: 'Garment' },
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

        if (req.query.fabricId) {
            role = await UserRole.findOne({
                where: { user_role: 'Fabric' },
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

        if (req.query.physicalPartnerId) {
            role = await UserRole.findOne({
                where: { user_role: 'Physical_Partner' },
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
                order: [
                    ["id", 'asc'], // Sort the results based on the 'name' field and the specified order
                ],
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

        let [spinner, ginner, weaver, knitter, garment, trader, fabric, brand, physicalPartner] = await Promise.all([
            Spinner.findOne({ where: { spinnerUser_id: { [Op.contains]: [user.dataValues.id] } } }),
            Ginner.findOne({ where: { ginnerUser_id: { [Op.contains]: [user.dataValues.id] } } }),
            Weaver.findOne({ where: { weaverUser_id: { [Op.contains]: [user.dataValues.id] } } }),
            Knitter.findOne({ where: { knitterUser_id: { [Op.contains]: [user.dataValues.id] } } }),
            Garment.findOne({ where: { garmentUser_id: { [Op.contains]: [user.dataValues.id] } } }),
            Trader.findOne({ where: { traderUser_id: { [Op.contains]: [user.dataValues.id] } } }),
            Fabric.findOne({ where: { fabricUser_id: { [Op.contains]: [user.dataValues.id] } } }),
            Brand.findOne({ where: { 
                [Op.or] : [{
                brandUser_id: { [Op.contains]: [user.dataValues.id] } },
                {id: { [Op.in]: [user.dataValues.brand_mapped ? user.dataValues.brand_mapped : 0] } }
         ] }}),
            PhysicalPartner.findOne({ where: { physicalPartnerUser_id: { [Op.contains]: [user.dataValues.id] } } })
        ]);

        let processor = [];
        spinner ? processor.push('Spinner') : "";
        ginner ? processor.push('Ginner') : "";
        weaver ? processor.push('Weaver') : "";
        knitter ? processor.push('Knitter') : "";
        garment ? processor.push('Garment') : "";
        trader ? processor.push('Trader') : "";
        fabric ? processor.push('Fabric') : "";
        brand ? processor.push('Brand') : "";
        physicalPartner ? processor.push('Physical_Partner') : "";

        if (req.query.ginnerId) {
            ginner = await Ginner.findOne({ where: { id: req.query.ginnerId } })
        }
        if (req.query.spinnerId) {
            spinner = await Spinner.findOne({ where: { id: req.query.spinnerId } })
        }
        if (req.query.weaverId) {
            weaver = await Weaver.findOne({ where: { id: req.query.weaverId } })
        }
        if (req.query.knitterId) {
            knitter = await Knitter.findOne({ where: { id: req.query.knitterId } })
        }
        if (req.query.garmentId) {
            garment = await Garment.findOne({ where: { id: req.query.garmentId } })
        }
        if (req.query.fabricId) {
            fabric = await Fabric.findOne({ where: { id: req.query.fabricId } })
        }
        if (req.query.physicalPartnerId) {
            physicalPartner = await PhysicalPartner.findOne({ where: { id: req.query.physicalPartnerId } })
        }

        return res.sendSuccess(res, { user, role, menuList, privileges, spinner, ginner, weaver, knitter, garment, trader, fabric, brand, physicalPartner, processor });
    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.message);
    }
}

const processorLoginAdmin = async (req: Request, res: Response) => {
    try {
        let userId: any;
        let name = "Ginner"
        if (req.query.type === 'ginner') {
            name = "Ginner"
            let ginner = await Ginner.findOne({ where: { id: req.query.ginnerId } });
            userId = ginner.dataValues.ginnerUser_id
        }
        if (req.query.type === 'spinner') {
            name = "Spinner"
            let spinner = await Spinner.findOne({ where: { id: req.query.spinnerId } });
            userId = spinner.dataValues.spinnerUser_id;
        }
        if (req.query.type === 'knitter') {
            name = "Knitter"
            let knitter = await Knitter.findOne({ where: { id: req.query.knitterId } });
            userId = knitter.dataValues.knitterUser_id;
        }
        if (req.query.type === 'weaver') {
            name = "Weaver"
            let weaver = await Weaver.findOne({ where: { id: req.query.weaverId } });
            userId = weaver.dataValues.weaverUser_id;
        }
        if (req.query.type === 'garment') {
            name = "Garment"
            let garment = await Garment.findOne({ where: { id: req.query.garmentId } });
            userId = garment.dataValues.garmentUser_id;
        }
        if (req.query.type === 'fabric') {
            name = "Fabric"
            let fabric = await Fabric.findOne({ where: { id: req.query.fabricId } });
            userId = fabric.dataValues.fabricUser_id;
        }
        if (req.query.type === 'physical-partner') {
            name = "Physical_Partner";
            let physicalPartner = await PhysicalPartner.findOne({ where: { id: req.query.physicalPartnerId } });
            userId = physicalPartner.dataValues.physicalPartnerUser_id;
        }
        if (req.query.type === 'brand') {
            let brand = await Brand.findOne({ where: { id: req.query.brandId } });
            userId = brand.dataValues.brandUser_id;
        }
        if (req.query.type !== 'brand') {
            let role = await UserRole.findOne({ where: { user_role: { [Op.iLike]: name } } });
            if (role) {
                const userupdate = await User.update({ role: role.dataValues.id }, { where: { id: userId } });
            }
        }

        const user = await User.findOne({ where: { id: userId } });
        if (!user) {
            return res.sendError(res, "user not found");
        }
        if (user) {
            console.log(user.dataValues)
            var { accessToken } = await generateTokens(user.dataValues.id, user.dataValues.role);

            return res.sendSuccess(res, { accessToken: accessToken, user: user.dataValues });
        }
    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.message);
    }
}

export { getUserInfo, processorLoginAdmin }