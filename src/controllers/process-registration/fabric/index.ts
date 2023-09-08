import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import Fabric from "../../../models/fabric.model";
import User from "../../../models/user.model";
import hash from "../../../util/hash";
import Country from "../../../models/country.model";
import State from "../../../models/state.model";

const createFabric = async (req: Request, res: Response) => {
    try {
        let userIds = [];
        for await (let user of req.body.userData) {
            const userData = {
                firstname: user.name,
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
            no_of_machines: req.body.noOfMachines,
            fabric_processor_type: req.body.fabricType,
            prod_capt: req.body.prodCap,
            loss_from: req.body.lossFrom,
            loss_to: req.body.lossTo,
            unit_cert: req.body.unitCert,
            company_info: req.body.companyInfo,
            org_logo: req.body.logo,
            org_photo: req.body.photo,
            certs: req.body.certs,
            brand: req.body.brand,
            mobile: req.body.mobile,
            landline: req.body.landline,
            email: req.body.email,
            fabricUser_id: userIds
        }
        const fabric = await Fabric.create(data);
        res.sendSuccess(res, fabric);
    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const fetchFabricPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'asc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const countryId: any = req.query.countryId;
    const stateId: any = req.query.stateId;
    const offset = (page - 1) * limit;
    const whereCondition: any = {}
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { name: { [Op.iLike]: `%${searchTerm}%` } }, // Search by name 
                { address: { [Op.iLike]: `%${searchTerm}%` } }, // Search by address
                { email: { [Op.iLike]: `%${searchTerm}%` } }, // Search by email
                { website: { [Op.iLike]: `%${searchTerm}%` } }, // Search by website
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
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await Fabric.findAndCountAll({
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
            const result = await Fabric.findAll({
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

const fetchFabric = async (req: Request, res: Response) => {
    try {
        const result = await Fabric.findOne({
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
        return res.sendSuccess(res, result);

    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}



const updateFabric = async (req: Request, res: Response) => {
    try {
        let userIds = [];
        for await (let user of req.body.userData) {
            const userData = {
                firstname: user.name,
                username: user.username,
                email: user.email,
                position: user.position,
                mobile: user.mobile,
                password: user.password ? await hash.generate(user.password) : undefined,
                status: user.status,
                role: user.role,
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
            no_of_machines: req.body.noOfMachines,
            fabric_processor_type: req.body.fabricType,
            prod_capt: req.body.prodCap,
            loss_from: req.body.lossFrom,
            loss_to: req.body.lossTo,
            unit_cert: req.body.unitCert,
            company_info: req.body.companyInfo,
            org_logo: req.body.logo,
            org_photo: req.body.photo,
            certs: req.body.certs,
            brand: req.body.brand,
            mobile: req.body.mobile,
            landline: req.body.landline,
            email: req.body.email,
            fabricUser_id: userIds
        }
        const fabric = await Fabric.update(data, { where: { id: req.body.id } });
        res.sendSuccess(res, fabric);
    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}


const deleteFabric = async (req: Request, res: Response) => {
    try {
        const fabric = await Fabric.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { fabric });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}


export {
    createFabric,
    fetchFabricPagination,
    fetchFabric,
    updateFabric,
    deleteFabric
};  