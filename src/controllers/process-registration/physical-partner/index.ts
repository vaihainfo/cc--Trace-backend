import { Request, Response } from "express";
import { Op, Sequelize } from "sequelize";
import PhysicalPartner from "../../../models/physical-partner.model";
import Country from "../../../models/country.model";
import District from "../../../models/district.model";
import State from "../../../models/state.model";
import User from "../../../models/user.model";
import UserRole from "../../../models/user-role.model";
import Program from "../../../models/program.model";
import UnitCertification from "../../../models/unit-certification.model";
import Brand from "../../../models/brand.model";
import sequelize from "sequelize";
import * as ExcelJS from "exceljs";
import * as path from "path";


const fetchPhysicalPartnerPagination = async (req: Request, res: Response) => {
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
            whereCondition.brand = { [Op.overlap]: idArray };
        }

        if (status == 'true') {
            whereCondition.status = true;
        }

        if (req.query.pagination === "true") {
            let data: any = [];
            const { count, rows } = await PhysicalPartner.findAndCountAll({
                where: whereCondition,
                order: [
                    ['id', 'desc']
                ],
                include: [
                    { model: Country, as: 'country' },
                    { model: State, as: 'state' },
                    { model: District, as: 'district' }
                ],
                offset: offset,
                limit: limit
            });
            for await (let item of rows) {
                let users = await User.findAll({
                    where: {
                        id: item?.dataValues?.physicalPartnerUser_id
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
            const result = await PhysicalPartner.findAll({
                where: whereCondition,
                include: [
                    { model: Country, as: 'country' },
                    { model: State, as: 'state' },
                    { model: District, as: 'district' }
                ],
                order: [
                    ['id', 'desc']
                ]
            });
            return res.sendSuccess(res, result);
        }
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
};

const fetchPhysicalPartner = async (req: Request, res: Response) => {
    try {
        const result = await PhysicalPartner.findOne({
            where: {
                id: req.query.id
            },
            include: [
                { model: Country, as: 'country' },
                { model: State, as: 'state' },
                { model: District, as: 'district' }
            ]
        });

        let userData = [];
        let programs;
        let unitCerts;
        let brands;

        if (result) {
            for await (let user of result.physicalPartnerUser_id) {
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
                userData.push(us);
            }

            programs = await Program.findAll({
                where: { id: result.program_id }
            });

            unitCerts = await UnitCertification.findAll({
                where: { id: result.unit_cert }
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
};

const deletePhysicalPartner = async (req: Request, res: Response) => {
    try {
        const partner = await PhysicalPartner.findOne({
            where: {
                id: req.body.id
            },
        });

        const user = await User.findOne({
            where: {
                id: partner.physicalPartnerUser_id
            },
        });

        const userRole = await UserRole.findOne({
            where: Sequelize.where(
                Sequelize.fn('LOWER', Sequelize.col('user_role')),
                'physical_partner'
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
        const physicalPartner = await PhysicalPartner.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { physicalPartner });
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
};

const checkPhysicalPartner = async (req: Request, res: Response) => {
    try {
        let whereCondition = {};
        if (req.body.id) {
            whereCondition = {
                name: { [Op.iLike]: req.body.name },
                id: { [Op.ne]: req.body.id }
            };
        } else {
            whereCondition = {
                name: { [Op.iLike]: req.body.name },
            };
        }
        const result = await PhysicalPartner.findOne({
            where: whereCondition
        });
        res.sendSuccess(res, result ? { exist: true } : { exist: false });
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
};

const getPhysicalPartnerBrand = async (
    req: Request, res: Response
) => {
    try {
        const data = await getPhysicalPartnerById(req);
        return res.sendSuccess(res, data);

    } catch (error: any) {
        const code = error.errCode
            ? error.errCode
            : "ERR_INTERNAL_SERVER_ERROR";
        return res.sendError(res, code);
    }
};
const getPhysicalPartnerById = async (
    reqData: any
) => {
    let where: any;
    let brand: any = [];
    let result: any = [];

    if ((!Array.isArray(reqData.query.brandId)) && reqData.query.brandId != undefined)
        brand.push(reqData.query.brandId);

    else if (reqData.query.brandId != undefined)
        brand = reqData.query.brandId;

    if (brand.length) {
        where = sequelize.where(
            sequelize.literal(`EXISTS (
              SELECT 1
              FROM UNNEST("physical_partner"."brand") AS b(brand_id)
              WHERE b.brand_id IN (${brand})
            )`),
            true
        );

        result = await PhysicalPartner.findAll({
            attributes: ["id", "name"],
            where
        });
    }
    return result;
};

const exportPhysicalPartnerRegistrationList = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "Physical_partner_registration_list.xlsx");

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
        mergedCell.value = 'CottonConnect | Physical Partner Registration List';
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
        const rows = await PhysicalPartner.findAll({
            where: whereCondition,
            order: [
                ['id', 'desc'], // Sort the results based on the 'name' field and the specified order
            ],
            ...include
        });
        for await (let item of rows) {
            let users = await User.findAll({
                where: {
                    id: item?.dataValues?.physicalPartnerUser_id
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
            data: process.env.BASE_URL + "Physical_partner_registration_list.xlsx",
        });
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);

    }
};

export {
    fetchPhysicalPartnerPagination,
    fetchPhysicalPartner,
    deletePhysicalPartner,
    checkPhysicalPartner,
    getPhysicalPartnerBrand,
    exportPhysicalPartnerRegistrationList
};