import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import EmailTemplate from "../../models/email-template.model";
import EmailManagement from "../../models/email-management.model";
import UserRole from "../../models/user-role.model";
import Brand from "../../models/brand.model";
import Program from "../../models/program.model";
import Country from "../../models/country.model";
import User from "../../models/user.model";
import GinProcess from "../../models/gin-process.model";
import * as ExcelJS from "exceljs";
import * as fs from "fs";
import * as path from "path";
import Ginner from "../../models/ginner.model";
import Season from "../../models/season.model";
import { sendEmail } from "../../provider/send-mail";
import Spinner from "../../models/spinner.model";
import GinSales from "../../models/gin-sales.model";
import Weaver from "../../models/weaver.model";
import Knitter from "../../models/knitter.model";
import SpinSales from "../../models/spin-sales.model";
import KnitSales from "../../models/knit-sales.model";
import FabricType from "../../models/fabric-type.model";
import Garment from "../../models/garment.model";
import WeaverSales from "../../models/weaver-sales.model";
import GarmentSales from "../../models/garment-sales.model";
import Village from "../../models/village.model";
import State from "../../models/state.model";
import District from "../../models/district.model";
import Block from "../../models/block.model";
import Farmer from "../../models/farmer.model";
import ICS from "../../models/ics.model";


const sendGinnerBaleProcess = async () => {
    try {
        let template = await EmailTemplate.findOne({ where: { template_name: { [Op.iLike]: 'Ginner Bale Process Report' } } })
        if (template) {
            let adminEmail = await User.findAll({ where: { role: 1 }, attributes: ['email'] });
            const emailJob = await EmailManagement.findOne({ where: { template_id: template.dataValues.id } });
            if (emailJob) {
                let emails = await User.findAll({ where: { id: { [Op.in]: emailJob.dataValues.user_ids } }, attributes: ['email'] });
                emails = emails.map((obj: any) => obj.email);
                adminEmail = adminEmail.map((obj: any) => obj.email)
                let { path, count }: any = await bale_process_report(emailJob.brand_ids, emailJob.mail_type, emailJob.program_ids, emailJob.country_ids, new Date());
                let body_title = 'Ginner Bale';
                let subject = 'Ginner Bale Process Report ' + new Date().toLocaleDateString('en-GB');
                let body = get_process_report_body(body_title, emailJob.mail_type === 'Daily' ? 'Day' : 'Week', emails, adminEmail);
                sendEmail(body, emails, subject, adminEmail, [{ path: path, filename: 'gin-bale-process.xlsx' }])
            }
        }
    } catch (error) {
        console.log(error);
    }
};

const sendGinnerPendingSales = async () => {
    try {
        let template = await EmailTemplate.findOne({ where: { template_name: { [Op.iLike]: 'Ginner Pending Sales Report' } } })
        if (template) {
            let adminEmail = await User.findAll({ where: { role: 1 }, attributes: ['email'] });
            const emailJob = await EmailManagement.findOne({ where: { template_id: template.dataValues.id } });
            if (emailJob) {
                let emails = await User.findAll({ where: { id: { [Op.in]: emailJob.dataValues.user_ids } }, attributes: ['email'] });
                emails = emails.map((obj: any) => obj.email);
                adminEmail = adminEmail.map((obj: any) => obj.email)
                let { path, count }: any = await pendingGinnerSales(emailJob.brand_ids, emailJob.mail_type, emailJob.program_ids, emailJob.country_ids, new Date());
                let body_title = 'Ginner Pending Sales';
                let subject = 'Ginner Pending Sales Report ' + new Date().toLocaleDateString('en-GB');
                let body = get_process_report_body(body_title, emailJob.mail_type === 'Daily' ? 'Day' : 'Week', emails, adminEmail);
                if (count > 0) {
                    sendEmail(body, emails, subject, adminEmail, [{ path: path, filename: 'Ginner-pending-sales-report.xlsx' }])
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
};

const sendGinnerSales = async () => {
    try {
        let template = await EmailTemplate.findOne({ where: { template_name: { [Op.iLike]: 'Ginner Sales Report' } } })
        if (template) {
            let adminEmail = await User.findAll({ where: { role: 1 }, attributes: ['email'] });
            const emailJob = await EmailManagement.findOne({ where: { template_id: template.dataValues.id } });
            if (emailJob) {
                let emails = await User.findAll({ where: { id: { [Op.in]: emailJob.dataValues.user_ids } }, attributes: ['email'] });
                emails = emails.map((obj: any) => obj.email);
                adminEmail = adminEmail.map((obj: any) => obj.email)
                let { path, count }: any = await ginnerSales(emailJob.brand_ids, emailJob.mail_type, emailJob.program_ids, emailJob.country_ids, new Date());
                let body_title = 'Ginner Sales ';
                let subject = 'Ginner Sales Report ' + new Date().toLocaleDateString('en-GB');
                let body = get_process_report_body(body_title, emailJob.mail_type === 'Daily' ? 'Day' : 'Week', emails, adminEmail);
                if (count > 0) {
                    sendEmail(body, emails, subject, adminEmail, [{ path: path, filename: 'Ginner-sales-report.xlsx' }])
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
};

const sendSpinnerBale = async () => {
    try {
        let template = await EmailTemplate.findOne({ where: { template_name: { [Op.iLike]: 'Spinner Bale Receipt Report' } } })
        if (template) {
            let adminEmail = await User.findAll({ where: { role: 1 }, attributes: ['email'] });
            const emailJob = await EmailManagement.findOne({ where: { template_id: template.dataValues.id } });
            if (emailJob) {
                let emails = await User.findAll({ where: { id: { [Op.in]: emailJob.dataValues.user_ids } }, attributes: ['email'] });
                emails = emails.map((obj: any) => obj.email);
                adminEmail = adminEmail.map((obj: any) => obj.email)
                let { path, count }: any = await spinnerBale(emailJob.brand_ids, emailJob.mail_type, emailJob.program_ids, emailJob.country_ids, new Date());
                let body_title = 'Spinner Bale ';
                let subject = 'Spinner Bale Receipt Report ' + new Date().toLocaleDateString('en-GB');
                let body = get_process_report_body(body_title, emailJob.mail_type === 'Daily' ? 'Day' : 'Week', emails, adminEmail);
                if (count > 0) {
                    sendEmail(body, emails, subject, adminEmail, [{ path: path, filename: 'Spinner-bale-report.xlsx' }])
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
};

const sendSpinnerYarnSale = async () => {
    try {
        let template = await EmailTemplate.findOne({ where: { template_name: { [Op.iLike]: 'Spinner Yarn Sales Report' } } })
        if (template) {
            let adminEmail = await User.findAll({ where: { role: 1 }, attributes: ['email'] });
            const emailJob = await EmailManagement.findOne({ where: { template_id: template.dataValues.id } });
            if (emailJob) {
                let emails = await User.findAll({ where: { id: { [Op.in]: emailJob.dataValues.user_ids } }, attributes: ['email'] });
                emails = emails.map((obj: any) => obj.email);
                adminEmail = adminEmail.map((obj: any) => obj.email)
                let { path, count }: any = await spinnerYarnSale(emailJob.brand_ids, emailJob.mail_type, emailJob.program_ids, emailJob.country_ids, new Date());
                let body_title = 'Spinner Yarn Sales ';
                let subject = 'Spinner Yarn Sales Report ' + new Date().toLocaleDateString('en-GB');
                let body = get_process_report_body(body_title, emailJob.mail_type === 'Daily' ? 'Day' : 'Week', emails, adminEmail);
                if (count > 0) {
                    sendEmail(body, emails, subject, adminEmail, [{ path: path, filename: 'Spinner-yarn-sale.xlsx' }])
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
};

const sendKnitterYarnReceipt = async () => {
    try {
        let template = await EmailTemplate.findOne({ where: { template_name: { [Op.iLike]: 'Knitter Yarn Receipt Report' } } })
        if (template) {
            let adminEmail = await User.findAll({ where: { role: 1 }, attributes: ['email'] });
            const emailJob = await EmailManagement.findOne({ where: { template_id: template.dataValues.id } });
            if (emailJob) {
                let emails = await User.findAll({ where: { id: { [Op.in]: emailJob.dataValues.user_ids } }, attributes: ['email'] });
                emails = emails.map((obj: any) => obj.email);
                adminEmail = adminEmail.map((obj: any) => obj.email)
                let { path, count }: any = await knitterYarnReceipt(emailJob.brand_ids, emailJob.mail_type, emailJob.program_ids, emailJob.country_ids, new Date());
                let body_title = 'Knitter Yarn Receipt ';
                let subject = 'Knitter Yarn Receipt Report ' + new Date().toLocaleDateString('en-GB');
                let body = get_process_report_body(body_title, emailJob.mail_type === 'Daily' ? 'Day' : 'Week', emails, adminEmail);
                if (count > 0) {
                    sendEmail(body, emails, subject, adminEmail, [{ path: path, filename: 'knitter-yarn-receipt.xlsx' }])
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
};

const sendKnitterFabricSale = async () => {
    try {
        let template = await EmailTemplate.findOne({ where: { template_name: { [Op.iLike]: 'Knitter Fabric Sales Report' } } })
        if (template) {
            let adminEmail = await User.findAll({ where: { role: 1 }, attributes: ['email'] });
            const emailJob = await EmailManagement.findOne({ where: { template_id: template.dataValues.id } });
            if (emailJob) {
                let emails = await User.findAll({ where: { id: { [Op.in]: emailJob.dataValues.user_ids } }, attributes: ['email'] });
                emails = emails.map((obj: any) => obj.email);
                adminEmail = adminEmail.map((obj: any) => obj.email)
                let { path, count }: any = await knitterFabricSale(emailJob.brand_ids, emailJob.mail_type, emailJob.program_ids, emailJob.country_ids, new Date());
                let body_title = 'Knitter Fabric Sales ';
                let subject = 'Knitter Fabric Sales Report ' + new Date().toLocaleDateString('en-GB');
                let body = get_process_report_body(body_title, emailJob.mail_type === 'Daily' ? 'Day' : 'Week', emails, adminEmail);
                if (count > 0) {
                    sendEmail(body, emails, subject, adminEmail, [{ path: path, filename: 'knitter-sale.xlsx' }])
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
};

const sendWeaverYarnReceipt = async () => {
    try {
        let template = await EmailTemplate.findOne({ where: { template_name: { [Op.iLike]: 'Weaver Yarn Receipt Report' } } })
        if (template) {
            let adminEmail = await User.findAll({ where: { role: 1 }, attributes: ['email'] });
            const emailJob = await EmailManagement.findOne({ where: { template_id: template.dataValues.id } });
            if (emailJob) {
                let emails = await User.findAll({ where: { id: { [Op.in]: emailJob.dataValues.user_ids } }, attributes: ['email'] });
                emails = emails.map((obj: any) => obj.email);
                adminEmail = adminEmail.map((obj: any) => obj.email)
                let { path, count }: any = await weaverYarnReceipt(emailJob.brand_ids, emailJob.mail_type, emailJob.program_ids, emailJob.country_ids, new Date());
                let body_title = 'Weaver Yarn ';
                let subject = 'Weaver Yarn Receipt Report ' + new Date().toLocaleDateString('en-GB');
                let body = get_process_report_body(body_title, emailJob.mail_type === 'Daily' ? 'Day' : 'Week', emails, adminEmail);
                if (count > 0) {
                    sendEmail(body, emails, subject, adminEmail, [{ path: path, filename: 'Weaver-yarn.xlsx' }])
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
};

const sendWeaverFabricSale = async () => {
    try {
        let template = await EmailTemplate.findOne({ where: { template_name: { [Op.iLike]: 'Weaver Fabric Sales Report' } } })
        if (template) {
            let adminEmail = await User.findAll({ where: { role: 1 }, attributes: ['email'] });
            const emailJob = await EmailManagement.findOne({ where: { template_id: template.dataValues.id } });
            if (emailJob) {
                let emails = await User.findAll({ where: { id: { [Op.in]: emailJob.dataValues.user_ids } }, attributes: ['email'] });
                emails = emails.map((obj: any) => obj.email);
                adminEmail = adminEmail.map((obj: any) => obj.email)
                let { path, count }: any = await weaverSale(emailJob.brand_ids, emailJob.mail_type, emailJob.program_ids, emailJob.country_ids, new Date());
                let body_title = 'Weaver Fabric Sales ';
                let subject = 'Weaver Fabric Sales Report ' + new Date().toLocaleDateString('en-GB');
                let body = get_process_report_body(body_title, emailJob.mail_type === 'Daily' ? 'Day' : 'Week', emails, adminEmail);
                if (count > 0) {
                    sendEmail(body, emails, subject, adminEmail, [{ path: path, filename: 'Weaver-sale-report.xlsx' }])
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
};

const sendGarmentFabric = async () => {
    try {
        let template = await EmailTemplate.findOne({ where: { template_name: { [Op.iLike]: 'Garment Fabric Receipt Report' } } })
        if (template) {
            let adminEmail = await User.findAll({ where: { role: 1 }, attributes: ['email'] });
            const emailJob = await EmailManagement.findOne({ where: { template_id: template.dataValues.id } });
            if (emailJob) {
                let emails = await User.findAll({ where: { id: { [Op.in]: emailJob.dataValues.user_ids } }, attributes: ['email'] });
                emails = emails.map((obj: any) => obj.email);
                adminEmail = adminEmail.map((obj: any) => obj.email)
                let { path, count }: any = await garmentFabricReceipt(emailJob.brand_ids, emailJob.mail_type, emailJob.program_ids, emailJob.country_ids, new Date());
                let body_title = 'Garment Fabric Receipt ';
                let subject = 'Garment Fabric Receipt Report ' + new Date().toLocaleDateString('en-GB');
                let body = get_process_report_body(body_title, emailJob.mail_type === 'Daily' ? 'Day' : 'Week', emails, adminEmail);
                if (count > 0) {
                    sendEmail(body, emails, subject, adminEmail, [{ path: path, filename: 'Garment-fabric-report.xlsx' }])
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
};

const sendGarmentFabricSale = async () => {
    try {
        let template = await EmailTemplate.findOne({ where: { template_name: { [Op.iLike]: 'Garment Fabric Sales Report' } } })
        if (template) {
            let adminEmail = await User.findAll({ where: { role: 1 }, attributes: ['email'] });
            const emailJob = await EmailManagement.findOne({ where: { template_id: template.dataValues.id } });
            if (emailJob) {
                let emails = await User.findAll({ where: { id: { [Op.in]: emailJob.dataValues.user_ids } }, attributes: ['email'] });
                emails = emails.map((obj: any) => obj.email);
                adminEmail = adminEmail.map((obj: any) => obj.email)
                let { path, count }: any = await exportGarmentSales(emailJob.brand_ids, emailJob.mail_type, emailJob.program_ids, emailJob.country_ids, new Date());
                let body_title = 'Garment Fabric Sales ';
                let subject = 'Garment Fabric Sales Report ' + new Date().toLocaleDateString('en-GB');
                let body = get_process_report_body(body_title, emailJob.mail_type === 'Daily' ? 'Day' : 'Week', emails, adminEmail);
                if (count > 0) {
                    sendEmail(body, emails, subject, adminEmail, [{ path: path, filename: 'Garment-sale-report.xlsx' }])
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
};

const sendFarmerReport = async () => {
    try {
        let template = await EmailTemplate.findOne({ where: { template_name: { [Op.iLike]: 'Farmer Report' } } });
        console.log(template);
        if (template) {
            let adminEmail = await User.findAll({ where: { role: 1 }, attributes: ['email'] });
            const emailJob = await EmailManagement.findOne({ where: { template_id: template.dataValues.id } });

            if (emailJob) {
                let emails = await User.findAll({ where: { id: { [Op.in]: emailJob.dataValues.user_ids } }, attributes: ['email'] });
                emails = emails.map((obj: any) => obj.email);
                adminEmail = adminEmail.map((obj: any) => obj.email)
                let { path, count }: any = await nonOrganicFarmerReport(emailJob.brand_ids, emailJob.mail_type, emailJob.program_ids, emailJob.country_ids, new Date());
                let body_title = 'Farmer Report ';
                let subject = 'Farmer Report ' + new Date().toLocaleDateString('en-GB');
                let body = get_process_report_body(body_title, emailJob.mail_type === 'Daily' ? 'Day' : 'Week', emails, adminEmail);
                if (count > 0) {
                    sendEmail(body, emails, subject, adminEmail, [{ path: path, filename: 'Farmer-report.xlsx' }])
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
};

const sendOrganicFarmerReport = async () => {
    try {
        let template = await EmailTemplate.findOne({ where: { template_name: { [Op.iLike]: 'Organic Farmer Report' } } });
        if (template) {
            let adminEmail = await User.findAll({ where: { role: 1 }, attributes: ['email'] });
            const emailJob = await EmailManagement.findOne({ where: { template_id: template.dataValues.id } });

            if (emailJob) {
                let emails = await User.findAll({ where: { id: { [Op.in]: emailJob.dataValues.user_ids } }, attributes: ['email'] });
                emails = emails.map((obj: any) => obj.email);
                adminEmail = adminEmail.map((obj: any) => obj.email)
                let { path, count }: any = await organicFarmerReport(emailJob.brand_ids, emailJob.mail_type, emailJob.program_ids, emailJob.country_ids, new Date());
                let body_title = 'Organic Farmer ';
                let subject = 'Organic Farmer Report ' + new Date().toLocaleDateString('en-GB');
                let body = get_process_report_body(body_title, emailJob.mail_type === 'Daily' ? 'Day' : 'Week', emails, adminEmail);
                if (count > 0) {
                    sendEmail(body, emails, subject, adminEmail, [{ path: path, filename: 'Farmer-report.xlsx' }])
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
};

function get_process_report_body(processor_type: any, time: any, to: any, cc: any) {
    let body = `<html> <body> Hi, <br/><br/> ${add_mail_id_to_email(to, cc)}
		Please find the process report of ${processor_type} for the current  time ${time}. <br/><br/>
		Thank you <br/>
		TraceBale team <br/>									
		 </body> </html>`;
    return body;
}

const add_mail_id_to_email = (to: any, cc: any) => {
    return `<p><strong><span style="background-color:#bdc3c7">To:&nbsp;</span></strong><span style="background-color:#bdc3c7">${to.join(', ')}</span></p>
    <p><strong><span style="background-color:#bdc3c7">cc:&nbsp;</span></strong><span style="background-color:#bdc3c7">${cc.join(', ')}</span></p>
    <br/><br/>`;
}

const bale_process_report = async (brandId: any, type: any, programIds: any, countryIds: any, date: any) => {
    const excelFilePath = path.join("./upload", "gin-bale-process.xlsx");

    const whereCondition: any = {};
    try {
        if (brandId) {
            let ginner = await Ginner.findAll({ where: { brand: { [Op.overlap]: brandId } } });
            const arry: number[] = ginner
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.ginner_id = { [Op.in]: arry };
        }


        if (countryIds) {
            let ginner = await Ginner.findAll({ country_id: { [Op.in]: countryIds } });
            const arry: number[] = ginner
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.ginner_id = { [Op.in]: arry };
        }

        if (programIds) {
            whereCondition.program_id = { [Op.in]: programIds };
        }

        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:Q1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Ginner Bale Process Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Season", "Ginner Name", "Gin Lot No", "Gin Press No", "REEL Lot No", "REEL Process Nos", "No of Bales"
            , "Staple Length(mm)", "Strength (g/tex)", "Mic", "Uniformity", "RD Value", "Quantity(Kgs)", "Program",
            "Status"
        ]);
        headerRow.font = { bold: true };
        let include = [
            {
                model: Ginner,
                as: "ginner",
            },
            {
                model: Season,
                as: "season",
            },
            {
                model: Program,
                as: "program",
            }
        ];
        const rows = await GinProcess.findAll({
            where: whereCondition,
            include: include
        });
        // Append data to worksheet
        for await (const [index, item] of rows.entries()) {

            let reel_press_no = item.no_of_bales === 0 ? "" : `001-${(item.no_of_bales < 9) ? `00${item.no_of_bales}` : (item.no_of_bales < 99) ? `0${item.no_of_bales}` : item.no_of_bales}`

            const rowValues = Object.values({
                index: index + 1,
                date: item.date ? item.date : '',
                season: item.season ? item.season.name : '',
                ginner: item.ginner ? item.ginner.name : '',
                lot_no: item.lot_no ? item.lot_no : '',
                press_no: item.press_no ? item.press_no : '',
                reel_lot_no: item.reel_lot_no ? item.reel_lot_no : '',
                process_no: reel_press_no ? reel_press_no : "-",
                noOfBales: item.no_of_bales ? item.no_of_bales : 0,
                staple: item.staple ? item.staple : '',
                strength: item.strength ? item.strength : '',
                mic: item.mic ? item.mic : '',
                trash: item.trash ? item.trash : "",
                rdValue: "",
                total_qty: item.total_qty ? item.total_qty : '',
                program: item.program ? item.program.program_name : '',
                status: `Available [Stocks : 0]`
            });
            worksheet.addRow(rowValues);
        }
        // Auto-adjust column widths based on content
        worksheet.columns.forEach((column: any) => {
            let maxCellLength = 0;
            column.eachCell({ includeEmpty: true }, (cell: any) => {
                const cellLength = (cell.value ? cell.value.toString() : '').length;
                maxCellLength = Math.max(maxCellLength, cellLength);
            });
            column.width = Math.min(15, maxCellLength + 2); // Limit width to 30 characters
        });

        // Save the workbook
        await workbook.xlsx.writeFile(excelFilePath);
        return { path: excelFilePath, count: rows.length }
    } catch (error: any) {
        console.error("Error appending data:", error)

    }
};

const pendingGinnerSales = async (brandId: any, type: any, programIds: any, countryIds: any, date: any) => {
    const excelFilePath = path.join("./upload", "Ginner-pending-sales-report.xlsx");

    const whereCondition: any = {};
    try {

        if (brandId) {
            let ginner = await Ginner.findAll({ where: { brand: { [Op.overlap]: brandId } } });
            const arry: number[] = ginner
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.ginner_id = { [Op.in]: arry };
        }

        if (countryIds) {
            let ginner = await Ginner.findAll({ where: { country_id: { [Op.in]: countryIds } } });
            const arry: number[] = ginner
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.ginner_id = { [Op.in]: arry };
        }
        whereCondition.status = 'To be Submitted';

        if (programIds) {
            whereCondition.program_id = { [Op.in]: programIds };
        }

        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:N1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Ginner Pending Sales Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Season", "Ginner Name",
            "Invoice No", "Sold To", "Bale Lot No", "REEL Lot No", "No of Bales", "Press/Bale No", "Rate/Kg",
            "Total Quantity", "Program", "status"
        ]);
        headerRow.font = { bold: true };
        let include = [
            {
                model: Ginner,
                as: "ginner",
            },
            {
                model: Season,
                as: "season",
            },
            {
                model: Program,
                as: "program",
            },
            {
                model: Spinner,
                as: "buyerdata",
                attributes: ['id', 'name']
            }
        ];
        const gin = await GinSales.findAll({
            where: whereCondition,
            include: include,
        });
        // Append data to worksheet
        for await (const [index, item] of gin.entries()) {
            const rowValues = Object.values({
                index: index + 1,
                date: item.date ? item.date : '',
                season: item.season ? item.season.name : '',
                ginner: item.ginner ? item.ginner.name : '',
                invoice: item.invoice_no ? item.invoice_no : '',
                buyer: item.buyerdata ? item.buyerdata.name : '',
                lot_no: item.lot_no ? item.lot_no : '',
                reel_lot_no: item.reel_lot_no ? item.reel_lot_no : '',
                no_of_bales: item.no_of_bales ? item.no_of_bales : '',
                press_no: item.press_no ? item.press_no : '',
                rate: item.rate ? item.rate : '',
                total_qty: item.total_qty ? item.total_qty : '',
                program: item.program ? item.program.program_name : '',
                status: item.status ? item.status : ''
            });
            worksheet.addRow(rowValues);
        }
        // Auto-adjust column widths based on content
        worksheet.columns.forEach((column: any) => {
            let maxCellLength = 0;
            column.eachCell({ includeEmpty: true }, (cell: any) => {
                const cellLength = (cell.value ? cell.value.toString() : '').length;
                maxCellLength = Math.max(maxCellLength, cellLength);
            });
            column.width = Math.min(40, maxCellLength + 2); // Limit width to 30 characters
        });

        // Save the workbook
        await workbook.xlsx.writeFile(excelFilePath);
        return { path: excelFilePath, count: gin.length }
    } catch (error: any) {
        console.error("Error appending data:", error);

    }
};

const ginnerSales = async (brandId: any, type: any, programId: any, countryId: any, date: any) => {
    const excelFilePath = path.join("./upload", "Ginner-sales-report.xlsx");
    const whereCondition: any = {};
    try {

        if (brandId) {
            let ginner = await Ginner.findAll({ where: { brand: { [Op.overlap]: brandId } } });
            const arry: number[] = ginner
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.ginner_id = { [Op.in]: arry };
        }

        if (countryId) {
            let ginner = await Ginner.findAll({ where: { country_id: { [Op.in]: countryId } } });
            const arry: number[] = ginner
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.ginner_id = { [Op.in]: arry };
        }

        whereCondition.status = { [Op.ne]: 'To be Submitted' };

        if (programId) {
            whereCondition.program_id = { [Op.in]: programId };
        }

        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:N1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Ginner Sales Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Season", "Ginner Name",
            "Invoice No", "Sold To", "Bale Lot No", "REEL Lot No", "No of Bales", "Press/Bale No", "Rate/Kg",
            "Total Quantity", "Program", "status"
        ]);
        headerRow.font = { bold: true };
        let include = [
            {
                model: Ginner,
                as: "ginner",
            },
            {
                model: Season,
                as: "season",
            },
            {
                model: Program,
                as: "program",
            },
            {
                model: Spinner,
                as: "buyerdata",
                attributes: ['id', 'name']
            }
        ];
        const rows = await GinSales.findAll({
            where: whereCondition,
            include: include
        });
        // Append data to worksheet
        for await (const [index, item] of rows.entries()) {
            const rowValues = Object.values({
                index: index + 1,
                date: item.date ? item.date : '',
                season: item.season ? item.season.name : '',
                ginner: item.ginner ? item.ginner.name : '',
                invoice: item.invoice_no ? item.invoice_no : '',
                buyer: item.buyerdata ? item.buyerdata.name : '',
                lot_no: item.lot_no ? item.lot_no : '',
                reel_lot_no: item.reel_lot_no ? item.reel_lot_no : '',
                no_of_bales: item.no_of_bales ? item.no_of_bales : '',
                press_no: item.press_no ? item.press_no : '',
                rate: item.rate ? item.rate : '',
                total_qty: item.total_qty ? item.total_qty : '',
                program: item.program ? item.program.program_name : '',
                status: `Available [Stock : ${item.qty_stock ? item.qty_stock : 0}]`
            });
            worksheet.addRow(rowValues);
        }
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
        return { path: excelFilePath, count: rows.length }
    } catch (error: any) {
        console.error("Error appending data:", error);

    }
};

const spinnerBale = async (brandId: any, type: any, programId: any, countryId: any, date: any) => {
    const excelFilePath = path.join("./upload", "Spinner-bale-report.xlsx");
    const whereCondition: any = {};
    try {

        if (brandId) {
            let ginner = await Spinner.findAll({ where: { brand: { [Op.overlap]: brandId } } });
            const arry: number[] = ginner
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.buyer = { [Op.in]: arry };
        }

        if (countryId) {
            let ginner = await Spinner.findAll({ where: { country_id: { [Op.in]: countryId } } });
            const arry: number[] = ginner
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.buyer = { [Op.in]: arry };
        }

        whereCondition.status = 'Sold';
        whereCondition.buyer = {
            [Op.ne]: null
        }

        if (programId) {
            whereCondition.program_id = { [Op.in]: programId };
        }

        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:M1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Spinner Bale Receipt Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Season", "Spinner Name", "Ginner Name",
            "Invoice No", "No of Bales", "Lot No", "REEL Lot No", "Press/Bale No",
            "Total Quantity", "Program"
        ]);
        headerRow.font = { bold: true };
        let include = [
            {
                model: Ginner,
                as: "ginner",
            },
            {
                model: Season,
                as: "season",
            },
            {
                model: Program,
                as: "program",
            },
            {
                model: Spinner,
                as: "buyerdata",
                attributes: ['id', 'name']
            }
        ];
        const rows = await GinSales.findAll({
            where: whereCondition,
            include: include
        });
        // Append data to worksheet
        for await (const [index, item] of rows.entries()) {
            const rowValues = Object.values({
                index: index + 1,
                date: item.date ? item.date : '',
                season: item.season ? item.season.name : '',
                buyer: item.buyerdata ? item.buyerdata.name : '',
                ginner: item.ginner ? item.ginner.name : '',
                invoice: item.invoice_no ? item.invoice_no : '',
                no_of_bales: item.no_of_bales ? item.no_of_bales : '',
                lot_no: item.lot_no ? item.lot_no : '',
                reel_lot_no: item.reel_lot_no ? item.reel_lot_no : '',
                press_no: item.press_no ? item.press_no : '',
                total_qty: item.total_qty ? item.total_qty : '',
                program: item.program ? item.program.program_name : '',
            });
            worksheet.addRow(rowValues);
        }
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
        return { path: excelFilePath, count: rows.length }
    } catch (error: any) {
        console.error("Error appending data:", error);
    }
};

const spinnerYarnSale = async (brandId: any, type: any, programId: any, countryId: any, date: any) => {
    const excelFilePath = path.join("./upload", "spinner-yarn-sale.xlsx");
    const whereCondition: any = {};
    try {
        if (brandId) {
            let ginner = await Spinner.findAll({ where: { brand: { [Op.overlap]: brandId } } });
            const arry: number[] = ginner
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.spinner_id = { [Op.in]: arry };
        }

        if (countryId) {
            let ginner = await Spinner.findAll({ where: { country_id: { [Op.in]: countryId } } });
            const arry: number[] = ginner
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.spinner_id = { [Op.in]: arry };
        }

        if (programId) {
            whereCondition.program_id = { [Op.in]: programId };
        }

        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:Q1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Spinner Yarn Sales Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Season", "Spinner Name", "Knitter/Weaver Name",
            "Invoice No", "Lot/Batch Number", "Reel Lot No", "Cotton Mix Types", "Cotton Mix Qty (kgs)", "Yarn Type", "Yarn Count", "No of Boxes",
            "Box ID", "Net Weight(Kgs)"
        ]);
        headerRow.font = { bold: true };
        let include = [
            {
                model: Spinner,
                as: "spinner",
                attributes: ['id', 'name']
            },
            {
                model: Season,
                as: "season",
                attributes: ['id', 'name']
            },
            {
                model: Program,
                as: "program",
                attributes: ['id', 'program_name']
            },
            {
                model: Weaver,
                as: "weaver",
                attributes: ['id', 'name']
            },
            {
                model: Knitter,
                as: "knitter",
                attributes: ['id', 'name']
            }
        ];
        const rows = await SpinSales.findAll({
            where: whereCondition,
            include: include
        });
        // Append data to worksheet
        for await (const [index, item] of rows.entries()) {
            const rowValues = Object.values({
                index: index + 1,
                date: item.date ? item.date : '',
                season: item.season ? item.season.name : '',
                spinner: item.spinner ? item.spinner.name : '',
                buyer_id: item.weaver ? item.weaver.name : item.knitter ? item.knitter.name : '',
                invoice: item.invoice_no ? item.invoice_no : '',
                lotNo: item.batch_lot_no ? item.batch_lot_no : '',
                reelLot: item.reel_lot_no ? item.reel_lot_no : '',
                blend: "",
                blendqty: '',
                yarnType: item.yarn_type ? item.yarn_type : '',
                count: item.yarn_count ? item.yarn_count : '',
                boxes: item.no_of_boxes ? item.no_of_boxes : '',
                boxId: item.box_ids ? item.box_ids : '',
                total: item.total_qty
            });
            worksheet.addRow(rowValues);
        }
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
        return { path: excelFilePath, count: rows.length }
    } catch (error: any) {
        console.error("Error appending data:", error);
    }
};

const knitterYarnReceipt = async (brandId: any, type: any, programId: any, countryId: any, date: any) => {
    const excelFilePath = path.join("./upload", "knitter-yarn-receipt.xlsx");
    const whereCondition: any = {};
    try {

        if (brandId) {

            let knitter = await Knitter.findAll({ where: { brand: { [Op.overlap]: brandId } } });
            const arry: number[] = knitter
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.knitter_id = { [Op.in]: arry };
        }

        if (countryId) {
            let knitter = await Knitter.findAll({ where: { country_id: { [Op.in]: countryId } } });
            const arry: number[] = knitter
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.knitter_id = { [Op.in]: arry };
        }

        if (programId) {
            whereCondition.program_id = { [Op.in]: programId };
        }
        whereCondition.knitter_id = { [Op.ne]: null };
        whereCondition.status = 'Sold';
        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:K1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Knitter Yarn Receipt Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Spinner Name", "Knitter Unit Name",
            "Invoice No", "Lot/Batch Number", "Yarn Count", "No of Boxes",
            "Box ID", "Net Weight(Kgs)",
        ]);
        headerRow.font = { bold: true };
        let include = [
            {
                model: Spinner,
                as: "spinner",
                attributes: ['id', 'name']
            },
            {
                model: Season,
                as: "season",
                attributes: ['id', 'name']
            },
            {
                model: Program,
                as: "program",
                attributes: ['id', 'program_name']
            },
            {
                model: Weaver,
                as: "weaver",
                attributes: ['id', 'name']
            },
            {
                model: Knitter,
                as: "knitter",
                attributes: ['id', 'name']
            }
        ];
        const rows = await SpinSales.findAll({
            where: whereCondition,
            include: include,
        });
        // Append data to worksheet
        for await (const [index, item] of rows.entries()) {
            const rowValues = Object.values({
                index: index + 1,
                date: item.date ? item.date : '',
                spinner: item.spinner ? item.spinner.name : '',
                buyer_id: item.knitter ? item.knitter.name : '',
                invoice: item.invoice_no ? item.invoice_no : '',
                lotNo: item.batch_lot_no ? item.batch_lot_no : '',
                count: item.yarn_count ? item.yarn_count : '',
                boxes: item.no_of_boxes ? item.no_of_boxes : '',
                boxId: item.box_ids ? item.box_ids : '',
                total: item.total_qty
            });
            worksheet.addRow(rowValues);
        }
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
        return { path: excelFilePath, count: rows.length }

    } catch (error: any) {
        console.error("Error appending data:", error);
    }
};

const knitterFabricSale = async (brandId: any, type: any, programId: any, countryId: any, date: any) => {
    const excelFilePath = path.join("./upload", "knitter-sale.xlsx");

    try {
        const whereCondition: any = {};

        if (brandId) {
            let knitter = await Knitter.findAll({ where: { brand: { [Op.overlap]: brandId } } });
            const arry: number[] = knitter
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.knitter_id = { [Op.in]: arry };
        }
        if (countryId) {
            let knitter = await Knitter.findAll({ where: { country_id: { [Op.in]: countryId } } });
            const arry: number[] = knitter
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.knitter_id = { [Op.in]: arry };
        }
        if (programId) {
            whereCondition.program_id = { [Op.in]: programId };
        }

        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:K1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Knitter Fabric Sales Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Knitter Name", "Sold To",
            "Invoice No", "Lot No", "Fabirc Type", "No. of Bales", "Bale Id", "Fabirc Length",
            "Net Weight (Kgs)",
        ]);
        headerRow.font = { bold: true };
        let include = [
            {
                model: FabricType,
                as: "fabric",
            },
            {
                model: Garment,
                as: "buyer",
                attributes: ['id', 'name', 'address']
            },
            {
                model: Knitter,
                as: "knitter",
                attributes: ['id', 'name', 'address']
            }
        ];;
        const rows = await KnitSales.findAll({
            where: whereCondition,
            include: include
        });
        // Append data to worksheet
        for await (const [index, item] of rows.entries()) {
            const rowValues = Object.values({
                index: index + 1,
                date: item.date ? item.date : '',
                knitter: item.knitter ? item.knitter.name : '',
                buyer: item.buyer ? item.buyer.name : item.processor_name,
                invoice: item.invoice_no ? item.invoice_no : '',
                lotNo: item.batch_lot_no ? item.batch_lot_no : '',
                fabrictype: item.fabric ? item.fabric.fabricType_name : '',
                no_of_bales: item.no_of_bales ? item.no_of_bales : '',
                bale_ids: item.bale_ids ? item.bale_ids : '',
                length: item.fabric_length ? item.fabric_length : '',
                fabric_weight: item.fabric_weight ? item.fabric_weight : '',
            });
            worksheet.addRow(rowValues);
        }
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
        return { path: excelFilePath, count: rows.length }
    } catch (error: any) {
        console.error("Error appending data:", error);
    }
};

const weaverYarnReceipt = async (brandId: any, type: any, programId: any, countryId: any, date: any) => {
    const excelFilePath = path.join("./upload", "weaver-yarn.xlsx");
    const whereCondition: any = {};
    try {

        if (brandId) {
            let weaver = await Weaver.findAll({ where: { brand: { [Op.overlap]: brandId } } });
            const arry: number[] = weaver
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.buyer_id = { [Op.in]: arry };
        }

        if (countryId) {
            let weaver = await Weaver.findAll({ where: { country_id: { [Op.in]: countryId } } });
            const arry: number[] = weaver
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.buyer_id = { [Op.in]: arry };
        }
        if (programId) {
            whereCondition.program_id = { [Op.in]: programId };
        }
        whereCondition.buyer_id = { [Op.ne]: null };
        whereCondition.status = 'Sold';
        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:J1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Weaver Yarn Receipt Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Spinner Name", "Weaver Unit Name",
            "Invoice No", "Lot/Batch Number", "Yarn Count", "No of Boxes",
            "Box ID", "Net Weight(Kgs)",
        ]);
        headerRow.font = { bold: true };
        let include = [
            {
                model: Spinner,
                as: "spinner",
                attributes: ['id', 'name']
            },
            {
                model: Season,
                as: "season",
                attributes: ['id', 'name']
            },
            {
                model: Program,
                as: "program",
                attributes: ['id', 'program_name']
            },
            {
                model: Weaver,
                as: "weaver",
                attributes: ['id', 'name']
            }
        ];
        const rows = await SpinSales.findAll({
            where: whereCondition,
            include: include,
        });
        // Append data to worksheet
        for await (const [index, item] of rows.entries()) {
            const rowValues = Object.values({
                index: index + 1,
                date: item.date ? item.date : '',
                spinner: item.spinner ? item.spinner.name : '',
                buyer_id: item.weaver ? item.weaver.name : '',
                invoice: item.invoice_no ? item.invoice_no : '',
                lotNo: item.batch_lot_no ? item.batch_lot_no : '',
                count: item.yarn_count ? item.yarn_count : '',
                boxes: item.no_of_boxes ? item.no_of_boxes : '',
                boxId: item.box_ids ? item.box_ids : '',
                total: item.total_qty
            });
            worksheet.addRow(rowValues);
        }
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
        return { path: excelFilePath, count: rows.length }
    } catch (error: any) {
        console.error("Error appending data:", error);
    }
};

const weaverSale = async (brandId: any, type: any, programId: any, countryId: any, date: any) => {
    const excelFilePath = path.join("./upload", "weaver-sale-report.xlsx");
    try {
        const whereCondition: any = {};
        if (brandId) {
            let weaver = await Weaver.findAll({ where: { brand: { [Op.overlap]: brandId } } });
            const arry: number[] = weaver
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.weaver_id = { [Op.in]: arry };
        }

        if (countryId) {
            let weaver = await Weaver.findAll({ where: { country_id: { [Op.in]: countryId } } });
            const arry: number[] = weaver
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.weaver_id = { [Op.in]: arry };
        }

        if (programId) {
            whereCondition.program_id = { [Op.in]: programId };
        }

        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:K1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Weaver Fabric Sales Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Weaver Name", "Sold To",
            "Invoice No", "Lot No",
            "Fabric Type", "No. of Bales", "Bale Id", "Fabric Length", "Net Weight"
        ]);
        headerRow.font = { bold: true };
        let include = [
            {
                model: Weaver,
                as: "weaver",
                attributes: ['id', 'name', 'address']
            },
            {
                model: Season,
                as: "season",
            },
            {
                model: FabricType,
                as: "fabric",
            },
            {
                model: Garment,
                as: "buyer",
                attributes: ['id', 'name', 'address']
            }
        ];;
        const rows = await WeaverSales.findAll({
            where: whereCondition,
            include: include
        });
        // Append data to worksheet
        for await (const [index, item] of rows.entries()) {
            const rowValues = Object.values({
                index: index + 1,
                date: item.date ? item.date : '',
                weaver: item.weaver ? item.weaver.name : '',
                buyer: item.buyer ? item.buyer.name : item.processor_name,
                invoice: item.invoice_no ? item.invoice_no : '',
                lotNo: item.batch_lot_no ? item.batch_lot_no : '',
                fabrictype: item.fabric ? item.fabric.fabricType_name : '',
                no_of_bales: item.no_of_bales ? item.no_of_bales : '',
                boxId: item.bale_ids ? item.bale_ids : '',
                length: item.fabric_length ? item.fabric_length : '',
                fabric_weight: item.fabric_weight ? item.fabric_weight : ''
            });
            worksheet.addRow(rowValues);
        }
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
        return { path: excelFilePath, count: rows.length }
    } catch (error: any) {
        console.error("Error appending data:", error);
    }
};

const garmentFabricReceipt = async (brandId: any, type: any, programId: any, countryId: any, date: any) => {
    const excelFilePath = path.join("./upload", "Garment-fabric-report.xlsx");
    try {
        const whereCondition: any = {};
        const whereCondition2: any = {}
        if (brandId) {
            let garment = await Garment.findAll({ where: { brand: { [Op.overlap]: brandId } } });
            const arry: number[] = garment
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.buyer_id = { [Op.in]: arry };
        }

        if (countryId) {
            let garment = await Garment.findAll({ where: { country_id: { [Op.in]: countryId } } });
            const arry: number[] = garment
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.buyer_id = { [Op.in]: arry };
        }

        if (programId) {
            whereCondition.program_id = { [Op.in]: programId };
        }
        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:L1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Garment Fabric Sales Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Weave/Knit Uint", "Garment Processor Unit",
            "Invoice Number", "Lot/Batch No",
            "Fabirc Type", "No. of Bales/Rolls", "Bale/Roll Id", "Fabric in Mts", "Net Weight(Kgs)", "Qr code"
        ]);
        headerRow.font = { bold: true };
        let include = [
            {
                model: Program,
                as: 'program',
            },
            {
                model: Garment,
                as: 'buyer',
            },
            {
                model: FabricType,
                as: 'fabric',
            }
        ]
        let result = await Promise.all([
            WeaverSales.findAll({
                where: whereCondition,
                include: [...include, { model: Weaver, as: 'weaver', attributes: ['id', 'name'] }]
            }),
            KnitSales.findAll({
                where: whereCondition,
                include: [...include, { model: Knitter, as: 'knitter', attributes: ['id', 'name'] }]
            })
        ])
        let abc = result.flat()
        // Append data to worksheet
        for await (const [index, item] of abc.entries()) {

            const rowValues = Object.values({
                index: index + 1,
                date: item.date ? item.date : '',
                buyer: item.weaver ? item.weaver.name : item.knitter.name,
                garment_name: item.buyer ? item.buyer.name : '',
                invoice: item.invoice_no ? item.invoice_no : '',
                batch_lot_no: item.batch_lot_no ? item.batch_lot_no : '',
                fabric: item.fabric ? item.fabric.fabricType_name : '',
                no_of_pieces: item.no_of_pieces ? item.no_of_pieces : '',
                bale_ids: item.bale_ids ? item.bale_ids : '',
                fabric_length: item.fabric_length ? item.fabric_length : '',
                fabric_weight: item.fabric_weight ? item.fabric_weight : '',
                color: process.env.BASE_URL + item.qr ?? '',
            });
            worksheet.addRow(rowValues);
        }
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
        return { path: excelFilePath, count: abc.length }
    } catch (error: any) {
        console.error("Error appending data:", error);
    }
};

const exportGarmentSales = async (brandId: any, type: any, programId: any, countryId: any, date: any) => {
    const excelFilePath = path.join("./upload", "garment-sale-report.xlsx");
    try {
        const whereCondition: any = {};

        if (brandId) {
            let weaver = await Garment.findAll({ where: { brand: { [Op.overlap]: brandId } } });
            const arry: number[] = weaver
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.garment_id = { [Op.in]: arry };
        }

        if (countryId) {
            let weaver = await Garment.findAll({ where: { country_id: { [Op.in]: countryId } } });
            const arry: number[] = weaver
                .map((gin: any) => parseInt(gin.id, 10));
            whereCondition.garment_id = { [Op.in]: arry };
        }

        if (programId) {
            whereCondition.program_id = { [Op.in]: programId };
        }
        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:K1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Garment Fabric Sales Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Season", "Garment Unit Name", "Customer (R&B) Name",
            "Invoice No", "Mark/Style No",
            "Item", "No of Boxes", "No of pieces", "Net weight",
        ]);
        headerRow.font = { bold: true };
        let include = [
            {
                model: Garment,
                as: "garment",
                attributes: ['id', 'name', 'address']
            },
            {
                model: Season,
                as: "season",
            },
            {
                model: Brand,
                as: "buyer",
                attributes: ['id', 'brand_name', 'address']
            }
        ];
        const garment = await GarmentSales.findAll({
            where: whereCondition,
            include: include
        });
        // Append data to worksheet
        for await (const [index, item] of garment.entries()) {
            const rowValues = Object.values({
                index: index + 1,
                date: item.date ? item.date : '',
                season: item.season ? item.season.name : '',
                garment_name: item.garment ? item.garment.name : '',
                buyer: item.buyer ? item.buyer.brand_name : item.processor_name,
                invoice: item.invoice_no ? item.invoice_no : '',
                mark: item.style_mark_no ? item.style_mark_no : '',
                garment: item.garment_type ? item.garment_type : '',
                no_of_boxes: item.no_of_boxes ? item.no_of_boxes : '',
                no_of_pieces: item.no_of_pieces ? item.no_of_pieces : '',
                garment_size: item.garment_size ? item.garment_size : '',
            });
            worksheet.addRow(rowValues);
        }
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
        return { path: excelFilePath, count: garment.length }
    } catch (error: any) {
        console.error("Error appending data:", error);
    }
};

//Export the Farmer details through excel file
const nonOrganicFarmerReport = async (brandId: any, type: any, programId: any, countryId: any, date: any) => {
    const excelFilePath = path.join('./upload', 'Farmer-report.xlsx');
    try {
        const whereCondition: any = {};
        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet1');
        //mergin the cells for first row
        worksheet.mergeCells('A1:M1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'Cotton Connect | Farmer Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };

        // Set bold font for header row
        const headerRow = worksheet.addRow([
            'S.No', 'Farmer Name', 'Farmer Code', 'Village',
            'Block', 'District', 'State', 'Country', 'Brand Name', 'Program Name', 'Total Area',
            'Cotton Area', 'Total Estimated Production',
        ]);
        headerRow.font = { bold: true };
        whereCondition['$program.program_name$'] = { [Op.notILike]: `%Organic%` };

        if (brandId) {
            whereCondition.brand_id = { [Op.in]: brandId };
        }
        if (countryId) {

            whereCondition.country_id = { [Op.in]: countryId };
        }

        if (programId) {
            whereCondition.program_id = { [Op.in]: programId };
        }

        let include = [
            {
                model: Program, as: 'program'
            },
            {
                model: Brand, as: 'brand'
            },
            {
                model: Country, as: 'country'
            },
            {
                model: Village, as: 'village'
            },
            {
                model: State, as: 'state'
            },
            {
                model: District, as: 'district'
            },
            {
                model: Block, as: 'block'
            }
        ]

        const farmer = await Farmer.findAll({
            where: whereCondition,
            include: include
        });

        // Append data to worksheet
        for await (const [index, item] of farmer.entries()) {
            const rowValues = Object.values({
                index: (index + 1),
                farmerName: item.firstName + " " + item.lastName,
                Code: item.code,
                village: item.village.village_name,
                block: item.block.block_name,
                district: item.district.district_name,
                state: item.state.state_name,
                country: item.country.county_name,
                brand: item.brand.brand_name,
                program: item.program.program_name,
                totalArea: item ? item.agri_total_area : '',
                cottonArea: item ? item.cotton_total_area : '',
                totalEstimatedCotton: item ? item.total_estimated_cotton : '',
            });
            worksheet.addRow(rowValues);
        }
        // // Auto-adjust column widths based on content
        worksheet.columns.forEach((column: any) => {
            let maxCellLength = 0;
            column.eachCell({ includeEmpty: true }, (cell: any) => {
                const cellLength = (cell.value ? cell.value.toString() : '').length;
                maxCellLength = Math.max(maxCellLength, cellLength);
            });
            column.width = Math.min(15, maxCellLength + 2); // Limit width to 30 characters
        });

        // Save the workbook
        await workbook.xlsx.writeFile(excelFilePath);
        return { path: excelFilePath, count: farmer.length }
    } catch (error) {
        console.error('Error appending data:', error);
    }
}

const organicFarmerReport = async (brandId: any, type: any, programId: any, countryId: any, date: any) => {
    const excelFilePath = path.join('./upload', 'Farmer-organic-report.xlsx');
    try {

        const whereCondition: any = {};
        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet1');
        //mergin the cells for first row
        worksheet.mergeCells('A1:O1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'Cotton Connect | Farmer Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };

        // Set bold font for header row
        const headerRow = worksheet.addRow([
            'S.No', 'Farmer Name', 'Tracenet Id', 'Village',
            'Block', 'District', 'State', 'Country', 'Brand Name', 'Total Area',
            'Cotton Area', 'Total Estimated Production', 'ICS Name', 'ICS Status'

        ]);
        headerRow.font = { bold: true };
        whereCondition['$program.program_name$'] = { [Op.iLike]: `%Organic%` };

        if (brandId) {
            whereCondition.brand_id = { [Op.in]: brandId };
        }

        if (countryId) {
            whereCondition.country_id = { [Op.in]: countryId };
        }

        let include = [
            {
                model: Program, as: 'program'
            },
            {
                model: Brand, as: 'brand'
            },
            {
                model: Country, as: 'country'
            },
            {
                model: Village, as: 'village'
            },
            {
                model: State, as: 'state'
            },
            {
                model: District, as: 'district'
            },
            {
                model: Block, as: 'block'
            }
        ]

        const farmer = await Farmer.findAll({
            where: whereCondition,
            include: include
        });

        console.log(farmer)
        // Append data to worksheet
        for await (const [index, item] of farmer.entries()) {
            const ics = await ICS.findOne({ where: { id: item.ics_id } });
            const rowValues = Object.values({
                index: (index + 1),
                farmerName: item.firstName + " " + item.lastName,
                tranid: item.tracenet_id,
                village: item.village.village_name,
                block: item.block.block_name,
                district: item.district.district_name,
                state: item.state.state_name,
                country: item.country.county_name,
                brand: item.brand.brand_name,
                totalArea: item ? item.agri_total_area : '',
                cottonArea: item ? item.cotton_total_area : '',
                totalEstimatedCotton: item ? item.total_estimated_cotton : '',
                icsName: ics ? ics.ics_name : '',
                icsStatus: item.cert_status ? item.cert_status : '',
            });
            worksheet.addRow(rowValues);
        }
        // // Auto-adjust column widths based on content
        worksheet.columns.forEach((column: any) => {
            let maxCellLength = 0;
            column.eachCell({ includeEmpty: true }, (cell: any) => {
                const cellLength = (cell.value ? cell.value.toString() : '').length;
                maxCellLength = Math.max(maxCellLength, cellLength);
            });
            column.width = Math.min(15, maxCellLength + 2); // Limit width to 30 characters
        });

        // Save the workbook
        await workbook.xlsx.writeFile(excelFilePath);
        return { path: excelFilePath, count: farmer.length }
    } catch (error) {
        console.error('Error appending data:', error);
    }
}

export {
    sendOrganicFarmerReport
}