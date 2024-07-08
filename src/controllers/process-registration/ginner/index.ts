import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import Ginner from "../../../models/ginner.model";
import User from "../../../models/user.model";
import hash from "../../../util/hash";
import Country from "../../../models/country.model";
import State from "../../../models/state.model";
import Program from "../../../models/program.model";
import UnitCertification from "../../../models/unit-certification.model";
import Brand from "../../../models/brand.model";
import UserRole from "../../../models/user-role.model";
import District from "../../../models/district.model";
import * as ExcelJS from "exceljs";
import * as path from "path";

const createGinner = async (req: Request, res: Response) => {
    try {
        let userIds = [];
        for await (let user of req.body.userData) {
            const userData = {
                firstname: user.firstname,
                lastname: user.lastname ? user.lastname : ' ',
                position: user.position,
                email: user.email,
                password: await hash.generate(user.password),
                status: user.status,
                username: user.username,
                process_role: user.process_role ? user.process_role : [],
                mobile: user.mobile
            };
            const result = await User.create(userData);
            userIds.push(result.id);
        }

        const data = {
            name: req.body.name,
            short_name: req.body.shortName,
            address: req.body.address,
            country_id: req.body.countryId,
            state_id: req.body.stateId,
            district_id: req.body.districtId,
            program_id: req.body.programIds,
            latitude: req.body.latitude,
            longitude: req.body.latitude,
            website: req.body.website,
            contact_person: req.body.contactPerson,
            outturn_range_from: req.body.outturnRangeFrom,
            outturn_range_to: req.body.outturnRangeTo,
            bale_weight_from: req.body.baleWeightFrom,
            bale_weight_to: req.body.baleWeightTo,
            unit_cert: req.body.unitCert,
            company_info: req.body.companyInfo,
            org_logo: req.body.logo,
            org_photo: req.body.photo,
            certs: req.body.certs,
            brand: req.body.brand,
            mobile: req.body.mobile,
            landline: req.body.landline,
            email: req.body.email,
            gin_type: req.body.ginType,
            registration_document: req.body.registrationDocument,
            ginnerUser_id: userIds
        }
        const result = await Ginner.create(data);
        res.sendSuccess(res, result);
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
}

const fetchGinnerPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const status = req.query.status || '';
    const sortOrder = req.query.sort || 'asc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const countryId: any = req.query.countryId as string;
    const brandId: any = req.query.brandId;
    const stateId: any = req.query.stateId as string;
    const districtId: any = req.query.districtId as string;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};

    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { name: { [Op.iLike]: `%${searchTerm}%` } }, // Search by name 
                { address: { [Op.iLike]: `%${searchTerm}%` } }, // Search by address
                { '$country.county_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by country name
                { '$state.state_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by state name
                { '$district.district_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by district name 
                { website: { [Op.iLike]: `%${searchTerm}%` } }, // Search by address
                { contact_person: { [Op.iLike]: `%${searchTerm}%` } }, // Search by address
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
        if (districtId) {
            const idArray: number[] = districtId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.district_id = { [Op.in]: idArray };
        }
        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.brand = { [Op.overlap]: idArray }
        }

        if (status == 'true') {
            whereCondition.status = true;
        }

        //fetch data with pagination
        if (req.query.pagination === "true") {
            let data: any = [];
            const { count, rows } = await Ginner.findAndCountAll({
                where: whereCondition,
                order: [
                    ['id', 'desc'], // Sort the results based on the 'name' field and the specified order
                ],
                include: [
                    {
                        model: Country, as: 'country'
                    },
                    {
                        model: State, as: 'state'
                    },
                    {
                        model: District, as: 'district'
                    },
                ],
                offset: offset,
                limit: limit
            });
            for await (let item of rows) {
                let users = await User.findAll({
                    where: {
                        id: item?.dataValues?.ginnerUser_id
                    }
                });

                let newStatus = users.some((user: any) => user.status === true);

                data.push({
                    ...item?.dataValues,
                    status: newStatus ? 'Active' : 'Inactive'
                });
            }
            return res.sendPaginationSuccess(res, data, count);
        } else {
            let users: any = [];
            const result = await Ginner.findAll({
                where: whereCondition,
                include: [
                    {
                        model: Country, as: 'country'
                    },
                    {
                        model: State, as: 'state'

                    },
                    {
                        model: District, as: 'district'
                    },
                ],
                order: [
                    ['id', 'desc'], // Sort the results based on the 'name' field and the specified order
                ]
            });
            return res.sendSuccess(res, result);
        }
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
}

const fetchGinner = async (req: Request, res: Response) => {
    try {
        const result = await Ginner.findOne({
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
                {
                    model: District, as: 'district'
                },
            ]
        });
        let userData = [];
        let programs;
        let unitCerts;
        let brands;
        if (result) {
            for await (let user of result.ginnerUser_id) {
                let us = await User.findOne({
                    where: { id: user }, attributes: {
                        exclude: ["password", "createdAt", "updatedAt"]
                    },
                    include: [
                        {
                            model: UserRole,
                            as: "user_role",
                        }
                    ]
                });
                userData.push(us)
            }

            programs = await Program.findAll({
                where: { id: result.program_id },
            });

            unitCerts = await UnitCertification.findAll({
                where: { id: result.unit_cert },
            });

            brands = await Brand.findAll({
                where: { id: result.brand },
            });
        }
        return res.sendSuccess(res, result ? { ...result.dataValues, userData, programs, unitCerts, brands } : null);

    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
}


const updateGinner = async (req: Request, res: Response) => {
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
                role: user.role
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
            short_name: req.body.shortName,
            address: req.body.address,
            country_id: req.body.countryId,
            state_id: req.body.stateId,
            program_id: req.body.programIds,
            latitude: req.body.latitude,
            longitude: req.body.latitude,
            website: req.body.website,
            contact_person: req.body.contactPerson,
            outturn_range_from: req.body.outturnRangeFrom,
            outturn_range_to: req.body.outturnRangeTo,
            bale_weight_from: req.body.baleWeightFrom,
            bale_weight_to: req.body.baleWeightTo,
            unit_cert: req.body.unitCert,
            company_info: req.body.companyInfo,
            org_logo: req.body.logo,
            org_photo: req.body.photo,
            certs: req.body.certs,
            brand: req.body.brand,
            mobile: req.body.mobile,
            landline: req.body.landline,
            email: req.body.email,
            gin_type: req.body.ginType,
            ginnerUser_id: userIds
        }
        const result = await Ginner.update(data, { where: { id: req.body.id } });
        res.sendSuccess(res, result);
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
}


const deleteGinner = async (req: Request, res: Response) => {
    try {
        const ginn = await Ginner.findOne({
            where: {
                id: req.body.id
            },
        });

        const user = await User.findOne({
            where: {
                id: ginn.ginnerUser_id
            },
        });

        const userRole = await UserRole.findOne({
            where: Sequelize.where(
                Sequelize.fn('LOWER', Sequelize.col('user_role')),
                'ginner'
            )
        });


        const updatedProcessRole = user.process_role.filter((roleId: any) => roleId !== userRole.id);

        if (updatedProcessRole.length > 0) {
            const updatedUser = await await user.update({
                process_role: updatedProcessRole,
                role: updatedProcessRole[0]
            });
        } else {
            await user.destroy();
        }
        const ginner = await Ginner.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { ginner });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}


const checkGinner = async (req: Request, res: Response) => {
    try {
        let whereCondition = {};
        if (req.body.id) {
            whereCondition = {
                name: { [Op.iLike]: req.body.name },
                id: { [Op.ne]: req.body.id }
            }
        } else {
            whereCondition = {
                name: { [Op.iLike]: req.body.name },
            }
        }
        const result = await Ginner.findOne({
            where: whereCondition
        });
        res.sendSuccess(res, result ? { exist: true } : { exist: false });
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
}


const exportGinnerRegistrationList = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "Ginner_registration_list.xlsx");

    try {
        // Create the excel workbook file
        const {
            countryId,
            stateId,
            brandId,
            status,
        }: any = req.query;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:U1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Ginner Registration List';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", 'Registration Date', 'Ginner Name', 'Address', 'Website',
            'Contact Person Name', 'Mobile No', 'Land Line No', 'Email', 'Status'
        ]);
        headerRow.font = { bold: true };
        const whereCondition: any = {}
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
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.brand = { [Op.overlap]: idArray }
        }

        if (status == 'true') {
            whereCondition.status = true;
        }

        let include = [
            {
                model: Country, as: 'country'
            },
            {
                model: State, as: 'state'
            },
            {
                model: District, as: 'district'
            },
        ]

        let ginner: any = [];
        const rows = await Ginner.findAll({
            where: whereCondition,
            order: [
                ['id', 'desc'], // Sort the results based on the 'name' field and the specified order
            ],
            ...include
        });
        for await (let item of rows) {
            let users = await User.findAll({
                where: {
                    id: item?.dataValues?.ginnerUser_id
                }
            });

            let newStatus = users.some((user: any) => user.status === true);

            ginner.push({
                ...item?.dataValues,
                status: newStatus ? 'Active' : 'Inactive'
            });
        }
        // Append data to worksheet
        ginner.forEach((item: any, index: number) => {
            const rowValues = Object.values({
                index: index + 1,
                date: item.createdAt,
                ginner_name: item.name,
                address: item.address,
                website: item.website,
                contact_person_name: item.contact_person,
                mobile_no: item.mobile,
                lang_line_no: item.landline,
                email: item.email,
                status: item.status,
            });
            worksheet.addRow(rowValues);
        });
        // Auto-adjust column widths based on content
        worksheet.columns.forEach((column: any) => {
            let maxCellLength = 0;
            column.eachCell({ includeEmpty: true }, (cell: any) => {
                const cellLength = (cell.value ? cell.value.toString() : '').length;
                maxCellLength = Math.max(maxCellLength, cellLength);
            });
            column.width = Math.min(14, maxCellLength + 2); // Limit width to 30 characters
        });

        // Save the workbook
        await workbook.xlsx.writeFile(excelFilePath);
        res.status(200).send({
            success: true,
            messgage: "File successfully Generated",
            data: process.env.BASE_URL + "Ginner_registration_list.xlsx",
        });
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);

    }
};


export {
    createGinner,
    fetchGinnerPagination,
    fetchGinner,
    updateGinner,
    deleteGinner,
    checkGinner,
    exportGinnerRegistrationList
};