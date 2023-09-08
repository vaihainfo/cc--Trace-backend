import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import Trader from "../../../models/trader.model";
import User from "../../../models/user.model";
import hash from "../../../util/hash";
import Country from "../../../models/country.model";
import State from "../../../models/state.model";

const createTrader = async (req: Request, res: Response) => {
    try {
        let userIds = [];
        for await (let user of req.body.userData) {
            const userData = {
                firstname: user.firstname,
                lastname: user.lastname ? user.lastname : ' ',
                position: user.position,
                email: user.email,
                mobile: user.mobile,
                password: await hash.generate(user.password),
                status: user.status,
                username: user.username,
                role: user.role
            };
            const result = await User.create(userData);
            userIds.push(result.id);
        }
        const data = {
            name: req.body.name,
            address: req.body.address,
            country_id: req.body.countryId,
            state_id: req.body.stateId,
            program_id: req.body.programIds,
            latitude: req.body.latitude,
            longitude: req.body.latitude,
            website: req.body.website,
            contact_person: req.body.contactPerson,
            unit_cert: req.body.unitCert,
            company_info: req.body.companyInfo,
            org_logo: req.body.logo,
            org_photo: req.body.photo,
            certs: req.body.certs,
            brand: req.body.brand,
            material_trading: req.body.materialTrading,
            mobile: req.body.mobile,
            landline: req.body.landline,
            email: req.body.email,
            traderUser_id: userIds
        }
        const trader = await Trader.create(data);
        res.sendSuccess(res, trader);
    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}
const fetchTrader = async (req: Request, res: Response) => {
    try {
        const result = await Trader.findOne({
            where: {
                id: req.query.id
            },
            include: [
                {
                    model: Country, as: 'country'
                },
                {
                    model: State, as: 'state'
                },
            ]
        });
        let userData = [];
        if (result) {
            for await (let user of result.traderUser_id) {
                let us = await User.findOne({ where: { id: user } });
                userData.push(us)
            }
        }
        return res.sendSuccess(res, result ? { ...result.dataValues, userData } : null);

    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const fetchTraderPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'asc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const countryId: any = req.query.countryId;
    const brandId: any = req.query.brandId;
    const stateId: any = req.query.stateId;
    const offset = (page - 1) * limit;
    const whereCondition: any = {}
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { name: { [Op.iLike]: `%${searchTerm}%` } }, // Search by name 
                { address: { [Op.iLike]: `%${searchTerm}%` } }, // Search by address
                { website: { [Op.iLike]: `%${searchTerm}%` } }, // Search by address
                { email: { [Op.iLike]: `%${searchTerm}%` } }, // Search by email
                { mobile: { [Op.iLike]: `%${searchTerm}%` } },// Search by mobile
                { landline: { [Op.iLike]: `%${searchTerm}%` } }// Search by landline
            ];
        }
        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.country_id = { [Op.in]: idArray };
        }
        if (stateId) {
            const idArray: number[] = stateId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.state_id = { [Op.in]: idArray };
        }
        if (brandId) {
            whereCondition.brand = { [Op.contains]: [brandId] }
        }
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await Trader.findAndCountAll({
                where: whereCondition,
                order: [
                    ['name', sortOrder], // Sort the results based on the 'name' field and the specified order
                ],
                include: [
                    {
                        model: Country, as: 'country'
                    },
                    {
                        model: State, as: 'state'
                    },
                ],
                offset: offset,
                limit: limit
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const result = await Trader.findAll({
                where: whereCondition,
                include: [
                    {
                        model: Country, as: 'country'
                    },
                    {
                        model: State, as: 'state'
                    },
                ],
                order: [
                    ['name', sortOrder], // Sort the results based on the 'name' field and the specified order
                ]
            });
            return res.sendSuccess(res, result);
        }
    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const updateTrader = async (req: Request, res: Response) => {
    try {
        let userIds = [];
        for await (let user of req.body.userData) {
            const userData = {
                firstname: user.firstname,
                lastname: user.lastname,
                position: user.position,
                mobile: user.mobile,
                password: user.password ? await hash.generate(user.password) : undefined,
                status: user.status,
                role: user.role,
                id: user.id
            };
            if (user.id) {
                const result = await User.update(userData, { where: { id: user.id } });
                userIds.push(user.id);
            } else {
                const result = await User.create({ ...userData, username: user.username, email: user.email });
                userIds.push(result.id);
            }
        }
        const data = {
            name: req.body.name,
            address: req.body.address,
            country_id: req.body.countryId,
            state_id: req.body.stateId,
            program_id: req.body.programIds,
            latitude: req.body.latitude,
            longitude: req.body.latitude,
            website: req.body.website,
            contact_person: req.body.contactPerson,
            unit_cert: req.body.unitCert,
            company_info: req.body.companyInfo,
            org_logo: req.body.logo,
            org_photo: req.body.photo,
            certs: req.body.certs,
            brand: req.body.brand,
            material_trading: req.body.materialTrading,
            mobile: req.body.mobile,
            landline: req.body.landline,
            email: req.body.email,
            traderUser_id: userIds
        }
        const trader = await Trader.update(data, { where: { id: req.body.id } });
        res.sendSuccess(res, trader);
    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const deleteTrader = async (req: Request, res: Response) => {
    try {
        const trader = await Trader.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { trader });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}


export {
    createTrader,
    fetchTraderPagination,
    fetchTrader,
    updateTrader,
    deleteTrader
};  