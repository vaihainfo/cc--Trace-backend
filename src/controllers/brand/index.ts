import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import Brand from "../../models/brand.model";
import User from "../../models/user.model";
import hash from "../../util/hash";
import Program from "../../models/program.model";
import Country from "../../models/country.model";
import UserRole from "../../models/user-role.model";

const createBrand = async (req: Request, res: Response) => {
    try {
        let userIds = [];
        console.log(req.body)
        for await (let user of req.body.userData) {
            const userData = {
                firstname: user.firstname,
                lastname: user.lastname ? user.lastname : '',
                position: user.position,
                email: user.email,
                mobile: user.mobile,
                password: await hash.generate(user.password),
                status: user.status,
                username: user.username,
                role: user.role,
                ticketApproveAccess: user.ticketApproveAccess,
                ticketCountryAccess: user.ticketCountryAccess,
                ticketAccessOnly: user.ticketAccessOnly
            };
            const result = await User.create(userData);
            userIds.push(result.id);
        }
        const brandData = {
            brand_name: req.body.name,
            email: req.body.email,
            address: req.body.address,
            programs_id: req.body.programsIds,
            website: req.body.website,
            countries_id: req.body.countriesIds,
            contact_person: req.body.contactPerson,
            company_info: req.body.companyInfo,
            mobile: req.body.mobile,
            landline: req.body.landline,
            logo: req.body.logo,
            photo: req.body.photo,
            brandUser_id: userIds
        }
        const brand = await Brand.create(brandData);
        res.sendSuccess(res, brand);
    } catch (error) {
        console.log(error);
        return res.sendError(res, "NOT_ABLE_TO_CREATE_BRAND");
    }
}

const fetchBrandPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'asc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const whereCondition: any = {}
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { brand_name: { [Op.iLike]: `%${searchTerm}%` } }, // Search by name 
                { address: { [Op.iLike]: `%${searchTerm}%` } }, // Search by address
                { email: { [Op.iLike]: `%${searchTerm}%` } }, // Search by contry
                { contact_person: { [Op.iLike]: `%${searchTerm}%` } },// Search by contact person
                { website: { [Op.iLike]: `%${searchTerm}%` } },// Search by mobile
                { mobile: { [Op.iLike]: `%${searchTerm}%` } },// Search by email
                { landline: { [Op.iLike]: `%${searchTerm}%` } }// Search by email
            ];
        }
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await Brand.findAndCountAll({
                where: whereCondition,
                order: [
                    ['brand_name', sortOrder], // Sort the results based on the 'name' field and the specified order
                ],
                offset: offset,
                limit: limit
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const cooperative = await Brand.findAll({
                where: whereCondition,
                order: [
                    ['brand_name', sortOrder], // Sort the results based on the 'name' field and the specified order
                ],
            });
            return res.sendSuccess(res, cooperative);
        }
    } catch (error) {
        console.log(error);
        return res.sendError(res, "NOT_ABLE_TO_FETCH_BRAND");
    }
}

const fetchBrandById= async (req: Request, res: Response) => {
    try {
        //fetch data for single brand
            const brand = await Brand.findOne({
                where: {id: req.params.id},
            });

            const userData = await User.findAll({
                  where: { id: brand.brandUser_id },
                  attributes: {
                    exclude: ["password", "createdAt", "updatedAt"]},
                include:[
                    {
                        model: UserRole,
          as: "user_role",
                    }
                ]
                });
        
            const programs = await Program.findAll({
                  where: { id: brand.programs_id },
                });
        
            const countries = await Country.findAll({
                  where: { id: brand.countries_id },
                });
        
            const brandInfo = {
                ...brand.dataValues,
                userData,
                programs,
                countries,
              };
            return res.sendSuccess(res, brandInfo);
    } catch (error) {
        console.log(error);
        return res.sendError(res, "NOT_ABLE_TO_FETCH_BRAND");
    }
}


const updateBrand = async (req: Request, res: Response) => {
    try {
        let userIds = [];
        for await (let user of req.body.userData) {
            const userData = {
                firstname: user.firstname,
                lastname: user.lastname ? user.lastname : '',
                position: user.position,
                email: user.email,
                mobile: user.mobile,
                password: user.password ? await hash.generate(user.password) : undefined,
                status: user.status,
                username: user.username,
                role: user.role,
                ticketApproveAccess: user.ticketApproveAccess,
                ticketCountryAccess: user.ticketCountryAccess,
                ticketAccessOnly: user.ticketAccessOnly
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
            brand_name: req.body.name,
            email: req.body.email,
            address: req.body.address,
            programs_id: req.body.programsIds,
            website: req.body.website,
            countries_id: req.body.countriesIds,
            contact_person: req.body.contactPerson,
            company_info: req.body.companyInfo,
            mobile: req.body.mobile,
            landline: req.body.landline,
            logo: req.body.logo,
            photo: req.body.photo,
            brandUser_id: userIds
        }
        const result = await Brand.update(data, { where: { id: req.body.id } });
        res.sendSuccess(res, result);
    } catch (error) {
        console.log(error);
        return res.sendError(res, "NOT_ABLE_TO_UPDATE_BRAND");
    }
}


const deleteBrand = async (req: Request, res: Response) => {
    try {
        const brand = await Brand.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { brand });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}


export {
    createBrand,
    fetchBrandPagination,
    deleteBrand,
    fetchBrandById,
    updateBrand
};