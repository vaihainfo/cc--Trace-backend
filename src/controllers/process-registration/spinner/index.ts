import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import Spinner from "../../../models/spinner.model";
import User from "../../../models/user.model";
import hash from "../../../util/hash";
import Country from "../../../models/country.model";
import State from "../../../models/state.model";
import Program from "../../../models/program.model";
import UnitCertification from "../../../models/unit-certification.model";
import Brand from "../../../models/brand.model";
import YarnCount from "../../../models/yarn-count.model";
import UserRole from "../../../models/user-role.model";
import District from "../../../models/district.model";
import * as ExcelJS from "exceljs";
import * as path from "path";
import db from "../../../util/dbConn";

const createSpinner = async (req: Request, res: Response) => {
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
        const brandData = {
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
            unit_cert: req.body.unitCert,
            company_info: req.body.companyInfo,
            org_logo: req.body.logo,
            org_photo: req.body.photo,
            certs: req.body.certs,
            brand: req.body.brand,
            mobile: req.body.mobile,
            landline: req.body.landline,
            email: req.body.email,
            registration_document: req.body.registrationDocument,
            yarn_count_range: req.body.yarnCountRange,
            realisation_range_from: req.body.rangeFrom,
            realisation_range_to: req.body.rangeTo,
            yarn_type: req.body.yarnType,
            spinnerUser_id: userIds,
        }
        const spinner = await Spinner.create(brandData);
        res.sendSuccess(res, spinner);
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
}

const fetchSpinnerPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'asc';
    const status = req.query.status || '';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const countryId: any = req.query.countryId;
    const stateId: any = req.query.stateId;
    const brandId: any = req.query.brandId;
    const offset = (page - 1) * limit;
    const all = req.query.all || '';
    const whereCondition: any = {}

    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { name: { [Op.iLike]: `%${searchTerm}%` } }, // Search by name 
                { address: { [Op.iLike]: `%${searchTerm}%` } }, // Search by address
                { '$country.county_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by country name
                { '$state.state_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by state name
                { '$district.district_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by district name 
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
            const { count, rows } = await Spinner.findAndCountAll({
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
                        id: item?.dataValues?.spinnerUser_id
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
            let dataAll: any = [];
            const spinner = await Spinner.findAll({
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
            for await (let item of spinner) {
                let users = await User.findAll({
                    where: {
                        id: item?.dataValues?.spinnerUser_id
                    }
                });

                let newStatus = users.some((user: any) => user.status === true);

                dataAll.push({
                    ...item?.dataValues,
                    status: newStatus ? 'Active' : 'Inactive'
                });
            }
            const activeUsers = dataAll.filter((item: any) => item.status === 'Active');
            return res.sendSuccess(res, all === 'true' ? activeUsers : dataAll);
        }
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
}

const fetchSpinnerForPartnerId = async (req: Request, res: Response) => {
    try {
        const result = await db.query(`select s.id, s.name from spinners s 
            join physical_partners pp on pp.brand  = s.brand 
            where pp.id = :ppid`, {
            replacements: { ppid: req.query.ppid },
            type: db.QueryTypes.SELECT
        })
        return res.sendSuccess(res, result);

    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
}


const fetchSpinner = async (req: Request, res: Response) => {
    try {
        const result = await Spinner.findOne({
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
        let yarnCount;
        if (result) {
            for await (let user of result.spinnerUser_id) {
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
            if (result.yarn_count_range) {
                const idArray: number[] = result?.yarn_count_range != 'NULL' && result.yarn_count_range
                    .split(",")
                    .map((id: any) => parseInt(id, 10));

                if (idArray) {
                    yarnCount = await YarnCount.findAll({
                        where: { id: { [Op.in]: idArray } },
                    });
                }
            }
        }
        return res.sendSuccess(res, result ? { ...result.dataValues, userData, programs, unitCerts, brands, yarnCount } : null);

    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
}


const updateSpinner = async (req: Request, res: Response) => {
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
        const brandData = {
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
            yarn_count_range: req.body.yarnCountRange,
            realisation_range_from: req.body.rangeFrom,
            realisation_range_to: req.body.rangeTo,
            unit_cert: req.body.unitCert,
            company_info: req.body.companyInfo,
            org_logo: req.body.logo,
            org_photo: req.body.photo,
            certs: req.body.certs,
            brand: req.body.brand,
            mobile: req.body.mobile,
            landline: req.body.landline,
            email: req.body.email,
            yarn_type: req.body.yarnType,
            spinnerUser_id: userIds
        }
        const spinner = await Spinner.update(brandData, { where: { id: req.body.id } });
        res.sendSuccess(res, spinner);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const deleteSpinner = async (req: Request, res: Response) => {
    try {
        const sinn = await Spinner.findOne({
            where: {
                id: req.body.id
            },
        });

        const users = await User.findAll({
            where: {
                id: sinn.spinnerUser_id
            },
        });

        const userRole = await UserRole.findOne({
            where: Sequelize.where(
                Sequelize.fn('LOWER', Sequelize.col('user_role')),
                'spinner'
            )
        });

        for await (let user of users) {
            const updatedProcessRole = user.process_role.filter((roleId: any) => roleId !== userRole.id);

            if (updatedProcessRole && updatedProcessRole.length > 0) {
                const updatedUser = await User.update({
                    process_role: updatedProcessRole,
                    role: updatedProcessRole[0]
                }, { where: { id: user.id } });
            } else {
                await User.destroy({ where: { id: user.id } });
            }
        }

        const spinner = await Spinner.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { spinner });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const checkSpinner = async (req: Request, res: Response) => {
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
        const result = await Spinner.findOne({
            where: whereCondition
        });
        res.sendSuccess(res, result ? { exist: true } : { exist: false });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const exportSpinnerRegistrationList = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "Spinner_registration_list.xlsx");

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
        mergedCell.value = 'CottonConnect | Spinner Registration List';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", 'Registration Date', 'Spinner Name', 'Address', 'Website',
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
        const rows = await Spinner.findAll({
            where: whereCondition,
            order: [
                ['id', 'desc'], // Sort the results based on the 'name' field and the specified order
            ],
            ...include
        });
        for await (let item of rows) {
            let users = await User.findAll({
                where: {
                    id: item?.dataValues?.spinnerUser_id
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
            data: process.env.BASE_URL + "Spinner_registration_list.xlsx",
        });
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);

    }
};


export {
    createSpinner,
    fetchSpinnerPagination,
    fetchSpinner,
    updateSpinner,
    deleteSpinner,
    checkSpinner,
    exportSpinnerRegistrationList,
    fetchSpinnerForPartnerId
};