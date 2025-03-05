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
import moment from "moment";
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
import Transaction from "../../models/transaction.model";
import FarmGroup from "../../models/farm-group.model";
import OrganicIntegrity from "../../models/organic-integrity.model";
import Trader from "../../models/trader.model";
import TicketTracker from "../../models/ticket-tracker.model";
import CropGrade from "../../models/crop-grade.model";
import Farm from "../../models/farm.model";
import UserApp from "../../models/users-app.model";


export const sendGinnerBaleProcess = async (jobId?: number) => {
    try {
        let template = await EmailTemplate.findOne({ where: { template_name: { [Op.iLike]: 'Ginner Bale Process Report' } } })
        if (template) {
            let adminEmail = await User.findAll({ where: { role: 1 }, attributes: ['email'] });
            const emailJob = await EmailManagement.findOne({ where: { id: jobId } });
            const currentDate = moment();
            if (emailJob) {
                let emails = await User.findAll({ where: { id: { [Op.in]: emailJob.dataValues.user_ids } }, attributes: ['email'] });
                emails = emails.map((obj: any) => obj.email);
                adminEmail = adminEmail.map((obj: any) => obj.email)
                let { path, count }: any = await bale_process_report(emailJob.brand_ids, emailJob.mail_type, emailJob.program_ids, emailJob.country_ids, currentDate);
                let body_title = 'Ginner Bale';
                let subject = 'Ginner Bale Process Report ' + new Date().toLocaleDateString('en-GB');
                let body = get_process_report_body(body_title, emailJob.mail_type === 'Daily' ? 'Day' : 'Week', emails, adminEmail);
                if (count > 0) {
                    return sendEmail(body, emails, subject, adminEmail, [{ path: path, filename: 'gin-bale-process.xlsx' }])
                }else{
                    return false;
                }
            }
        }
    }  catch (error) {
        console.log(error);
        return false;
    }
};

export const sendGinnerPendingSales = async (jobId?: number) => {
    try {
        let template = await EmailTemplate.findOne({ where: { template_name: { [Op.iLike]: 'Ginner Pending Sales Report' } } })
        if (template) {
            let adminEmail = await User.findAll({ where: { role: 1 }, attributes: ['email'] });
            const emailJob = await EmailManagement.findOne({ where: { id: jobId } });
            const currentDate = moment();
            if (emailJob) {
                let emails = await User.findAll({ where: { id: { [Op.in]: emailJob.dataValues.user_ids } }, attributes: ['email'] });
                emails = emails.map((obj: any) => obj.email);
                adminEmail = adminEmail.map((obj: any) => obj.email)
                let { path, count }: any = await pendingGinnerSales(emailJob.brand_ids, emailJob.mail_type, emailJob.program_ids, emailJob.country_ids, currentDate);
                let body_title = 'Ginner Pending Sales';
                let subject = 'Ginner Pending Sales Report ' + new Date().toLocaleDateString('en-GB');
                let body = get_process_report_body(body_title, emailJob.mail_type === 'Daily' ? 'Day' : 'Week', emails, adminEmail);
                if (count > 0) {
                    return sendEmail(body, emails, subject, adminEmail, [{ path: path, filename: 'Ginner-pending-sales-report.xlsx' }])
                }else{
                    return false;
                }
            }
        }
    }  catch (error) {
        console.log(error);
        return false;
    }
};

export const sendGinnerSales = async (jobId?: number) => {
    try {
        let template = await EmailTemplate.findOne({ where: { template_name: { [Op.iLike]: 'Ginner Sales Report' } } })
        if (template) {
            let adminEmail = await User.findAll({ where: { role: 1 }, attributes: ['email'] });
            const emailJob = await EmailManagement.findOne({ where: { id: jobId } });
            const currentDate = moment();
            if (emailJob) {
                let emails = await User.findAll({ where: { id: { [Op.in]: emailJob.dataValues.user_ids } }, attributes: ['email'] });
                emails = emails.map((obj: any) => obj.email);
                adminEmail = adminEmail.map((obj: any) => obj.email)
                let { path, count }: any = await ginnerSales(emailJob.brand_ids, emailJob.mail_type, emailJob.program_ids, emailJob.country_ids, currentDate);
                let body_title = 'Ginner Sales ';
                let subject = 'Ginner Sales Report ' + new Date().toLocaleDateString('en-GB');
                let body = get_process_report_body(body_title, emailJob.mail_type === 'Daily' ? 'Day' : 'Week', emails, adminEmail);
                if (count > 0) {
                    return  sendEmail(body, emails, subject, adminEmail, [{ path: path, filename: 'Ginner-sales-report.xlsx' }])
                }else{
                    return false;
                }
            }
        }
    }  catch (error) {
        console.log(error);
        return false;
    }
};

export const sendSpinnerBale = async (jobId?: number) => {
    try {
        let template = await EmailTemplate.findOne({ where: { template_name: { [Op.iLike]: 'Spinner Bale Receipt Report' } } })
        if (template) {
            let adminEmail = await User.findAll({ where: { role: 1 }, attributes: ['email'] });
            const emailJob = await EmailManagement.findOne({ where: { id: jobId } });
            const currentDate = moment();
            if (emailJob) {
                let emails = await User.findAll({ where: { id: { [Op.in]: emailJob.dataValues.user_ids } }, attributes: ['email'] });
                emails = emails.map((obj: any) => obj.email);
                adminEmail = adminEmail.map((obj: any) => obj.email)
                let { path, count }: any = await spinnerBale(emailJob.brand_ids, emailJob.mail_type, emailJob.program_ids, emailJob.country_ids, currentDate);
                let body_title = 'Spinner Bale ';
                let subject = 'Spinner Bale Receipt Report ' + new Date().toLocaleDateString('en-GB');
                let body = get_process_report_body(body_title, emailJob.mail_type === 'Daily' ? 'Day' : 'Week', emails, adminEmail);
                if (count > 0) {
                    return sendEmail(body, emails, subject, adminEmail, [{ path: path, filename: 'Spinner-bale-report.xlsx' }])
                }else{
                    return false;
                }
            }
        }
    }  catch (error) {
        console.log(error);
        return false;
    }
};

export const sendSpinnerYarnSale = async (jobId?: number) => {
    try {
        let template = await EmailTemplate.findOne({ where: { template_name: { [Op.iLike]: 'Spinner Yarn Sales Report' } } })
        if (template) {
            let adminEmail = await User.findAll({ where: { role: 1 }, attributes: ['email'] });
            const emailJob = await EmailManagement.findOne({ where: { id: jobId } });
            const currentDate = moment();
            if (emailJob) {
                let emails = await User.findAll({ where: { id: { [Op.in]: emailJob.dataValues.user_ids } }, attributes: ['email'] });
                emails = emails.map((obj: any) => obj.email);
                adminEmail = adminEmail.map((obj: any) => obj.email)
                let { path, count }: any = await spinnerYarnSale(emailJob.brand_ids, emailJob.mail_type, emailJob.program_ids, emailJob.country_ids, currentDate);
                let body_title = 'Spinner Yarn Sales ';
                let subject = 'Spinner Yarn Sales Report ' + new Date().toLocaleDateString('en-GB');
                let body = get_process_report_body(body_title, emailJob.mail_type === 'Daily' ? 'Day' : 'Week', emails, adminEmail);
                if (count > 0) {
                    return  sendEmail(body, emails, subject, adminEmail, [{ path: path, filename: 'Spinner-yarn-sale.xlsx' }])
                }else{
                    return false;
                }
            }
        }
    }  catch (error) {
        console.log(error);
        return false;
    }
};

export const sendKnitterYarnReceipt = async (jobId?: number) => {
    try {
        let template = await EmailTemplate.findOne({ where: { template_name: { [Op.iLike]: 'Knitter Yarn Receipt Report' } } })
        if (template) {
            let adminEmail = await User.findAll({ where: { role: 1 }, attributes: ['email'] });
            const emailJob = await EmailManagement.findOne({ where: { id: jobId } });
            const currentDate = moment();
            if (emailJob) {
                let emails = await User.findAll({ where: { id: { [Op.in]: emailJob.dataValues.user_ids } }, attributes: ['email'] });
                emails = emails.map((obj: any) => obj.email);
                adminEmail = adminEmail.map((obj: any) => obj.email)
                let { path, count }: any = await knitterYarnReceipt(emailJob.brand_ids, emailJob.mail_type, emailJob.program_ids, emailJob.country_ids, currentDate);
                let body_title = 'Knitter Yarn Receipt ';
                let subject = 'Knitter Yarn Receipt Report ' + new Date().toLocaleDateString('en-GB');
                let body = get_process_report_body(body_title, emailJob.mail_type === 'Daily' ? 'Day' : 'Week', emails, adminEmail);
                if (count > 0) {
                    return sendEmail(body, emails, subject, adminEmail, [{ path: path, filename: 'knitter-yarn-receipt.xlsx' }])
                }else{
                    return false;
                }
            }
        }
    }  catch (error) {
        console.log(error);
        return false;
    }
};

export const sendKnitterFabricSale = async (jobId?: number) => {
    try {
        let template = await EmailTemplate.findOne({ where: { template_name: { [Op.iLike]: 'Knitter Fabric Sales Report' } } })
        if (template) {
            let adminEmail = await User.findAll({ where: { role: 1 }, attributes: ['email'] });
            const emailJob = await EmailManagement.findOne({ where: { id: jobId } });
            const currentDate = moment();
            if (emailJob) {
                let emails = await User.findAll({ where: { id: { [Op.in]: emailJob.dataValues.user_ids } }, attributes: ['email'] });
                emails = emails.map((obj: any) => obj.email);
                adminEmail = adminEmail.map((obj: any) => obj.email)
                let { path, count }: any = await knitterFabricSale(emailJob.brand_ids, emailJob.mail_type, emailJob.program_ids, emailJob.country_ids, currentDate);
                let body_title = 'Knitter Fabric Sales ';
                let subject = 'Knitter Fabric Sales Report ' + new Date().toLocaleDateString('en-GB');
                let body = get_process_report_body(body_title, emailJob.mail_type === 'Daily' ? 'Day' : 'Week', emails, adminEmail);
                if (count > 0) {
                    return  sendEmail(body, emails, subject, adminEmail, [{ path: path, filename: 'knitter-sale.xlsx' }])
                }else{
                    return false;
                }
            }
        }
    }  catch (error) {
        console.log(error);
        return false;
    }
};

export const sendWeaverYarnReceipt = async (jobId?: number) => {
    try {
        let template = await EmailTemplate.findOne({ where: { template_name: { [Op.iLike]: 'Weaver Yarn Receipt Report' } } })
        if (template) {
            let adminEmail = await User.findAll({ where: { role: 1 }, attributes: ['email'] });
            const emailJob = await EmailManagement.findOne({ where: { id: jobId } });
            const currentDate = moment();
            if (emailJob) {
                let emails = await User.findAll({ where: { id: { [Op.in]: emailJob.dataValues.user_ids } }, attributes: ['email'] });
                emails = emails.map((obj: any) => obj.email);
                adminEmail = adminEmail.map((obj: any) => obj.email)
                let { path, count }: any = await weaverYarnReceipt(emailJob.brand_ids, emailJob.mail_type, emailJob.program_ids, emailJob.country_ids, currentDate);
                let body_title = 'Weaver Yarn ';
                let subject = 'Weaver Yarn Receipt Report ' + new Date().toLocaleDateString('en-GB');
                let body = get_process_report_body(body_title, emailJob.mail_type === 'Daily' ? 'Day' : 'Week', emails, adminEmail);
                if (count > 0) {
                    return  sendEmail(body, emails, subject, adminEmail, [{ path: path, filename: 'Weaver-yarn.xlsx' }])
                }else{
                    return false;
                }
            }
        }
    }  catch (error) {
        console.log(error);
        return false;
    }
};

export const sendWeaverFabricSale = async (jobId?: number) => {
    try {
        let template = await EmailTemplate.findOne({ where: { template_name: { [Op.iLike]: 'Weaver Fabric Sales Report' } } })
        if (template) {
            let adminEmail = await User.findAll({ where: { role: 1 }, attributes: ['email'] });
            const emailJob = await EmailManagement.findOne({ where: { id: jobId } });
            const currentDate = moment();
            if (emailJob) {
                let emails = await User.findAll({ where: { id: { [Op.in]: emailJob.dataValues.user_ids } }, attributes: ['email'] });
                emails = emails.map((obj: any) => obj.email);
                adminEmail = adminEmail.map((obj: any) => obj.email)
                let { path, count }: any = await weaverSale(emailJob.brand_ids, emailJob.mail_type, emailJob.program_ids, emailJob.country_ids, currentDate);
                let body_title = 'Weaver Fabric Sales ';
                let subject = 'Weaver Fabric Sales Report ' + new Date().toLocaleDateString('en-GB');
                let body = get_process_report_body(body_title, emailJob.mail_type === 'Daily' ? 'Day' : 'Week', emails, adminEmail);
                if (count > 0) {
                    return sendEmail(body, emails, subject, adminEmail, [{ path: path, filename: 'Weaver-sale-report.xlsx' }])
                }else{
                    return false;
                }
            }
        }
    }  catch (error) {
        console.log(error);
        return false;
    }
};

export const sendGarmentFabric = async (jobId?: number) => {
    try {
        let template = await EmailTemplate.findOne({ where: { template_name: { [Op.iLike]: 'Garment Fabric Receipt Report' } } })
        if (template) {
            let adminEmail = await User.findAll({ where: { role: 1 }, attributes: ['email'] });
            const emailJob = await EmailManagement.findOne({ where: { id: jobId } });
            const currentDate = moment();
            if (emailJob) {
                let emails = await User.findAll({ where: { id: { [Op.in]: emailJob.dataValues.user_ids } }, attributes: ['email'] });
                emails = emails.map((obj: any) => obj.email);
                adminEmail = adminEmail.map((obj: any) => obj.email)
                let { path, count }: any = await garmentFabricReceipt(emailJob.brand_ids, emailJob.mail_type, emailJob.program_ids, emailJob.country_ids, currentDate);
                let body_title = 'Garment Fabric Receipt ';
                let subject = 'Garment Fabric Receipt Report ' + new Date().toLocaleDateString('en-GB');
                let body = get_process_report_body(body_title, emailJob.mail_type === 'Daily' ? 'Day' : 'Week', emails, adminEmail);
                if (count > 0) {
                    return  sendEmail(body, emails, subject, adminEmail, [{ path: path, filename: 'Garment-fabric-report.xlsx' }])
                }else{
                    return false;
                }
            }
        }
    }  catch (error) {
        console.log(error);
        return false;
    }
};

export const sendGarmentFabricSale = async (jobId?: number) => {
    try {
        let template = await EmailTemplate.findOne({ where: { template_name: { [Op.iLike]: 'Garment Fabric Sales Report' } } })
        if (template) {
            let adminEmail = await User.findAll({ where: { role: 1 }, attributes: ['email'] });
            const emailJob = await EmailManagement.findOne({ where: { id: jobId } });
            const currentDate = moment();
            if (emailJob) {
                let emails = await User.findAll({ where: { id: { [Op.in]: emailJob.dataValues.user_ids } }, attributes: ['email'] });
                emails = emails.map((obj: any) => obj.email);
                adminEmail = adminEmail.map((obj: any) => obj.email)
                let { path, count }: any = await exportGarmentSales(emailJob.brand_ids, emailJob.mail_type, emailJob.program_ids, emailJob.country_ids, currentDate);
                let body_title = 'Garment Fabric Sales ';
                let subject = 'Garment Fabric Sales Report ' + new Date().toLocaleDateString('en-GB');
                let body = get_process_report_body(body_title, emailJob.mail_type === 'Daily' ? 'Day' : 'Week', emails, adminEmail);
                if (count > 0) {
                    return sendEmail(body, emails, subject, adminEmail, [{ path: path, filename: 'Garment-sale-report.xlsx' }])
                }else{
                    return false;
                }
            }
        }
    }  catch (error) {
        console.log(error);
        return false;
    }
};

export const sendFarmerReport = async (jobId?: number) => {
    try {
        let template = await EmailTemplate.findOne({ where: { template_name: { [Op.iLike]: 'Farmer Report' } } });
        if (template) {
            let adminEmail = await User.findAll({ where: { role: 1 }, attributes: ['email'] });
            const emailJob = await EmailManagement.findOne({ where: { id: jobId } });

            if (emailJob) {
                let emails = await User.findAll({ where: { id: { [Op.in]: emailJob.dataValues.user_ids } }, attributes: ['email'] });
                emails = emails.map((obj: any) => obj.email);
                adminEmail = adminEmail.map((obj: any) => obj.email)
                let { path, count }: any = await nonOrganicFarmerReport(emailJob.brand_ids, emailJob.mail_type, emailJob.program_ids, emailJob.country_ids, new Date());
                let body_title = 'Farmer Report ';
                let subject = 'Farmer Report ' + new Date().toLocaleDateString('en-GB');
                let body = get_process_report_body(body_title, emailJob.mail_type === 'Daily' ? 'Day' : 'Week', emails, adminEmail);
                if (count > 0) {
                    return  sendEmail(body, emails, subject, adminEmail, [{ path: path, filename: 'Farmer-report.xlsx' }])
                }else{
                    return false;
                }
            }
        }
    }  catch (error) {
        console.log(error);
        return false;
    }
};

export const sendOrganicFarmerReport = async (jobId?: number) => {
    try {
        let template = await EmailTemplate.findOne({ where: { template_name: { [Op.iLike]: 'Organic Farmer Report' } } });
        if (template) {
            let adminEmail = await User.findAll({ where: { role: 1 }, attributes: ['email'] });
            const emailJob = await EmailManagement.findOne({ where: { id: jobId } });

            if (emailJob) {
                let emails = await User.findAll({ where: { id: { [Op.in]: emailJob.dataValues.user_ids } }, attributes: ['email'] });
                emails = emails.map((obj: any) => obj.email);
                adminEmail = adminEmail.map((obj: any) => obj.email)
                let { path, count }: any = await organicFarmerReport(emailJob.brand_ids, emailJob.mail_type, emailJob.program_ids, emailJob.country_ids, new Date());
                let body_title = 'Organic Farmer ';
                let subject = 'Organic Farmer Report ' + new Date().toLocaleDateString('en-GB');
                let body = get_process_report_body(body_title, emailJob.mail_type === 'Daily' ? 'Day' : 'Week', emails, adminEmail);
                if (count > 0) {
                    return sendEmail(body, emails, subject, adminEmail, [{ path: path, filename: 'Farmer-report.xlsx' }])
                }else{
                    return false;
                }
            }
        }
    }  catch (error) {
        console.log(error);
        return false;
    }
};

export const sendProcurementReport = async (jobId?: number) => {
    try {
        let template = await EmailTemplate.findOne({ where: { template_name: { [Op.iLike]: 'Procurement Report' } } });
        if (template) {
            let adminEmail = await User.findAll({ where: { role: 1 }, attributes: ['email'] });
            const emailJob = await EmailManagement.findOne({ where: { id: jobId } });
            const currentDate = moment();

            if (emailJob) {
                let emails = await User.findAll({ where: { id: { [Op.in]: emailJob.dataValues.user_ids } }, attributes: ['email'] });
                emails = emails.map((obj: any) => obj.email);
                adminEmail = adminEmail.map((obj: any) => obj.email)
                let { path, count }: any = await procurementReport(emailJob.brand_ids, emailJob.mail_type, emailJob.program_ids, emailJob.country_ids, currentDate);
                let body_title = 'Procurement ';
                let subject = 'Procurement Report ' + new Date().toLocaleDateString('en-GB');
                let body = get_process_report_body(body_title, emailJob.mail_type === 'Daily' ? 'Day' : 'Week', emails, adminEmail);
                if (count > 0) {
                    return sendEmail(body, emails, subject, adminEmail, [{ path: path, filename: 'Procurement.xlsx' }])
                }else{
                    return false;
                }
            }
        }
    }  catch (error) {
        console.log(error);
        return false;
    }
};

export const sendQrProcurementReport = async (jobId?: number) => {
    try {
        let template = await EmailTemplate.findOne({ where: { template_name: { [Op.iLike]: 'Qr Procurement Report' } } });
        if (template) {
            let adminEmail = await User.findAll({ where: { role: 1 }, attributes: ['email'] });
            const emailJob = await EmailManagement.findOne({ where: { id: jobId } });
            const currentDate = moment();
            
            if (emailJob) {
                let emails = await User.findAll({ where: { id: { [Op.in]: emailJob.dataValues.user_ids } }, attributes: ['email'] });
                emails = emails.map((obj: any) => obj.email);
                adminEmail = adminEmail.map((obj: any) => obj.email)
               
                let { path, count }: any = await qrProcurementReport(emailJob.brand_ids, emailJob.mail_type, emailJob.program_ids, emailJob.country_ids, currentDate);
                let body_title = 'Qr Procurement Report ';
                let subject = 'Qr Procurement Report ' + new Date().toLocaleDateString('en-GB');
                let body = get_procurement_report_body(body_title, emailJob.mail_type === 'Daily' ? 'Day' : 'Week', emails, adminEmail);
                
                if (count > 0) {
                    return sendEmail(body, emails, subject, adminEmail, [{ path: path, filename: 'qrAppProcurementDetails.xlsx' }])
                }else{
                    return false;
                }
                
            }
        }
    }  catch (error) {
        console.log(error);
        return false;
    }
};

export const sendIntegrityReport = async (jobId?: number) => {
    try {
        let template = await EmailTemplate.findOne({ where: { template_name: { [Op.iLike]: 'Organic Integrity Report' } } });
        if (template) {
            let adminEmail = await User.findAll({ where: { role: 1 }, attributes: ['email'] });
            const emailJob = await EmailManagement.findOne({ where: { id: jobId } });
            const currentDate = moment();
            if (emailJob) {
                let emails = await User.findAll({ where: { id: { [Op.in]: emailJob.dataValues.user_ids } }, attributes: ['email'] });
                emails = emails.map((obj: any) => obj.email);
                adminEmail = adminEmail.map((obj: any) => obj.email);
                let { path, count }: any = await integrityReport(emailJob.brand_ids, emailJob.mail_type, emailJob.program_ids, emailJob.country_ids, currentDate);
                let body_title = 'Organic Integrity ';
                let subject = 'Organic Integrity Report ' + new Date().toLocaleDateString('en-GB');
                let body = get_process_report_body(body_title, emailJob.mail_type === 'Daily' ? 'Day' : 'Week', emails, adminEmail);
                if (count > 0) {
                    return  sendEmail(body, emails, subject, adminEmail, [{ path: path, filename: 'Integrity-report.xlsx' }])
                }else{
                    return false;
                }
            }
        }
    } catch (error) {
        console.log(error);
        return false;
    }
};

export const sendGinnerPendingReminder = async (jobId?: number) => {
    try {
        const emailJob = await EmailManagement.findOne({ where: { id: jobId }, include: [{
            model: EmailTemplate,
            as: "template",
        }] });
        let type = emailJob?.dataValues?.template?.template_name;

        const currentDate = moment().utc().startOf('day'); // Get the current UTC date at the start of the day
        let daysToSub;
        let success: boolean = true; // Initialize success flag
        if (type) {
                if(type === "When Gin Sales are still pending - 5 days reminder"){
                    daysToSub = 5
                }else if (type === "When Gin Sales are still pending - 7 days and Before"){
                    daysToSub = 7
                }

            const startDate = moment(currentDate).subtract(daysToSub, 'days').startOf('day'); // Get the current UTC date at the start of the day
            const endDate = moment(startDate).add(1, 'days'); // Get the date for the next day

            let sales = await GinSales.findAll({
                where: { date: {
                    [Op.gte]: startDate.toDate(),
                    [Op.lt]: endDate.toDate(),
                  },
                  status: 'To be Submitted' }, include: [
                    {
                        model: Ginner,
                        as: "ginner",
                    },
                    {
                        model: Spinner,
                        as: "buyerdata",
                    }
                ]
            });
            if (sales && sales.length > 0) {
                for await (let row of sales){
                    let adminEmail = await User.findAll({ where: { role: 1 }, attributes: ['email'] });
                    if (emailJob) {
                        let emails = await User.findAll({ where: { id: { [Op.in]: emailJob.dataValues.user_ids } }, attributes: ['email'] });
                        emails = emails.length > 0 ? emails.map((obj: any) => obj.email) : [];
                        adminEmail = adminEmail.length > 0 ? adminEmail.map((obj: any) => obj.email) : [];
                        let toEmail = (row.dataValues.ginner && row.dataValues.ginner.email) ? [row.dataValues.ginner.email] : adminEmail;
                        let ccEmails = [...adminEmail,...emails]
                        let body = get_reminder_email_subject(row.dataValues.ginner.name, new Date(row.dataValues.date).toLocaleDateString('en-GB'), row.dataValues.buyerdata.name, toEmail, ccEmails)
                        let subject = 'Please complete sales process'
                        const emailSent: any = await sendEmail(body, row.dataValues.ginner.email ? [row.dataValues.ginner.email] : adminEmail, subject, ccEmails)
                            // Update success flag based on the result of email sending
                        success = success && emailSent;
                    }
                }
            }else{
                success = false;
            }
        }
        return success;
    } catch (error) {
        console.log(error);
        return false;
    }
};

export const send_gin_mail = async (salesId: number) => {
    try {
        let template = await EmailTemplate.findOne({ where: { template_name: { [Op.iLike]: 'Whenever gin sales happen' } } });
        if (template) {
            let sales = await GinSales.findOne({
                where: { id: salesId, status: 'Pending for QR scanning' }, include: [
                    {
                        model: Ginner,
                        as: "ginner",
                    },
                    {
                        model: Spinner,
                        as: "buyerdata",
                    },
                    {
                        model: Ginner,
                        as: "buyerdata_ginner",
                    }
                ]
            });

            let buyertype = sales?.dataValues?.buyer_type;
          
            let buyer = buyertype === 'Ginner' ? sales?.dataValues?.buyerdata_ginner : sales?.dataValues?.buyerdata;
            
            let adminEmail = await User.findAll({ where: { role: 1 }, attributes: ['email'] });
            const emailJob = await is_email_job_available(template.dataValues.id, buyer?.brand, [buyer?.country_id], buyer?.program_id);
            if (emailJob) {
                let emails = await User.findAll({ where: { id: { [Op.in]: emailJob.dataValues?.user_ids } }, attributes: ['email'] });
                emails = emails.map((obj: any) => obj.email);
                adminEmail = adminEmail.map((obj: any) => obj.email);
                let to = buyer.email ? [buyer.email] : adminEmail
                let ccEmails = [...adminEmail,...emails];
                let body = get_init_email_subject(buyer?.name, sales?.dataValues?.ginner?.name, sales?.dataValues?.total_qty, 'lint', sales?.dataValues?.invoice_no, to, ccEmails)
                let subject = 'Acknowledge incoming transaction'
                return sendEmail(body, to, subject, ccEmails);
            }
        }
    } catch (error) {
        console.log(error);
        return false;
    }
};

export const send_spin_mail = async (salesId: number) => {
    try {
        let template = await EmailTemplate.findOne({ where: { template_name: { [Op.iLike]: 'Whenever spin sales happen' } } });
        if (template) {
            let sales = await SpinSales.findOne({
                where: { id: salesId, status: 'Pending for QR scanning' }, include: [
                    {
                        model: Spinner,
                        as: "spinner",
                    },
                    {
                        model: Knitter,
                        as: "knitter",
                    },
                    {
                        model: Weaver,
                        as: "weaver",
                    },
                    {
                        model: Trader,
                        as: "trader",
                    }
                ]
            });
            let buyer = sales.dataValues.knitter ? sales.dataValues.knitter : sales.dataValues.weaver ? sales.dataValues.weaver : sales.dataValues.trader
            let adminEmail = await User.findAll({ where: { role: 1 }, attributes: ['email'] });
            const emailJob = await is_email_job_available(template.dataValues.id, buyer.brand, [buyer.country_id], buyer.program_id);
            if (emailJob) {
                let emails = await User.findAll({ where: { id: { [Op.in]: emailJob.dataValues?.user_ids } }, attributes: ['email'] });
                emails = emails.map((obj: any) => obj.email);
                adminEmail = adminEmail.map((obj: any) => obj.email);
                let to = buyer.email ? [buyer.email] : adminEmail;
                let ccEmails = [...adminEmail,...emails];
                let body = get_init_email_subject(buyer?.name, sales?.dataValues?.spinner.name, sales?.dataValues?.total_qty, 'yarn', sales?.dataValues?.invoice_no, to, ccEmails)
                let subject = 'Acknowledge incoming transaction'
                return sendEmail(body, to, subject, ccEmails)
            }
        }
    } catch (error) {
        console.log(error);
        return false;
    }
};

export const send_weaver_mail = async (salesId: number) => {
    try {
        let template = await EmailTemplate.findOne({ where: { template_name: { [Op.iLike]: 'Whenever weaver sales happen' } } });
        if (template) {
            let sales = await WeaverSales.findOne({
                where: { id: salesId, status: 'Pending for QR scanning' }, include: [
                    {
                        model: Weaver,
                        as: "weaver"
                    },
                    {
                        model: Garment,
                        as: "buyer",
                    }
                ]
            });

            let buyer = sales.dataValues?.buyer;
            console.log(buyer);
            let adminEmail = await User.findAll({ where: { role: 1 }, attributes: ['email'] });
            const emailJob = await is_email_job_available(template.dataValues.id, buyer?.brand, [buyer?.country_id], buyer?.program_id);
            if (emailJob) {
                let emails = await User.findAll({ where: { id: { [Op.in]: emailJob.dataValues?.user_ids } }, attributes: ['email'] });
                emails = emails.map((obj: any) => obj.email);
                adminEmail = adminEmail.map((obj: any) => obj.email);
                let to = buyer.email ? [buyer.email] : adminEmail;
                let ccEmails = [...adminEmail,...emails];
                let body = get_init_email_subject(buyer?.name, sales?.dataValues?.weaver?.name, sales?.dataValues?.total_yarn_qty, 'fabric', sales?.dataValues?.invoice_no, to, ccEmails)
                let subject = 'Acknowledge incoming transaction'
                return sendEmail(body, to, subject, ccEmails)
            }
        }
    } catch (error) {
        console.log(error);
        return false;
    }
};

export const send_knitter_mail = async (salesId: number) => {
    try {
        let template = await EmailTemplate.findOne({ where: { template_name: { [Op.iLike]: 'Whenever knitter sales happen' } } });
        if (template) {
            let sales = await KnitSales.findOne({
                where: { id: salesId, status: 'Pending for QR scanning' }, include: [
                    {
                        model: Knitter,
                        as: "knitter",
                    },
                    {
                        model: Garment,
                        as: "buyer",
                    }
                ]
            });

            let buyer = sales.dataValues?.buyer;
            let adminEmail = await User.findAll({ where: { role: 1 }, attributes: ['email'] });
            const emailJob = await is_email_job_available(template.dataValues.id, buyer.brand, [buyer.country_id], buyer.program_id);
            if (emailJob) {
                let emails = await User.findAll({ where: { id: { [Op.in]: emailJob.dataValues.user_ids } }, attributes: ['email'] });
                emails = emails.map((obj: any) => obj.email);
                adminEmail = adminEmail.map((obj: any) => obj.email);
                let to = buyer.email ? [buyer.email] : adminEmail;
                let ccEmails = [...adminEmail,...emails];
                let body = get_init_email_subject(buyer.name, sales.dataValues.knitter.name, sales.dataValues.total_yarn_qty, 'fabric', sales.dataValues.invoice_no, to, ccEmails)
                let subject = 'Acknowledge incoming transaction'
                return sendEmail(body, to, subject, ccEmails)
            }
        }
    } catch (error) {
        console.log(error);
        return false;
    }
};

export const send_garment_mail = async (salesId: number) => {
    try {
        let template = await EmailTemplate.findOne({ where: { template_name: { [Op.iLike]: 'Whenever garment sales happen' } } });
        if (template) {
            let sales = await GarmentSales.findOne({
                where: { id: salesId, status: 'Pending'}, include: [
                    {
                        model: Garment,
                        as: "garment",
                    },
                    {
                        model: Brand,
                        as: "buyer"
                    }
                ]
            });

            let buyer = sales.dataValues?.buyer;
            let adminEmail = await User.findAll({ where: { role: 1 }, attributes: ['email'] });
            const emailJob = await is_email_job_available(template.dataValues.id, [buyer.id], buyer.countries_id, buyer.programs_id);
            if (emailJob) {
                let emails = await User.findAll({ where: { id: { [Op.in]: emailJob.dataValues.user_ids } }, attributes: ['email'] });
                emails = emails.map((obj: any) => obj.email);
                adminEmail = adminEmail.map((obj: any) => obj.email);
                let to = buyer.email ? [buyer.email] : adminEmail;
                let ccEmails = [...adminEmail,...emails];
                let body = get_init_email_subject(buyer.brand_name, sales.dataValues.garment.name, sales.dataValues.total_no_of_pieces, 'finished product', sales.dataValues.invoice_no, to, ccEmails)
                let subject = 'Acknowledge incoming transaction'
                return sendEmail(body, to, subject, ccEmails)
            }
        }
    } catch (error) {
        console.log(error);
        return false;
    }
};

export const processAndSentTicketReminder = async (jobId?: number) => {
    try{
    const emailJob = await EmailManagement.findOne({ where: { id: jobId }, include: [{
            model: EmailTemplate,
            as: "template",
    }] });
    let type = emailJob?.dataValues?.template?.template_name;
    const currentDate = moment().utc().startOf('day'); // Get the current UTC date at the start of the day
    let daysToSub;
    let success: boolean = true; // Initialize success flag

    if (type) {
        if(type === "Ticket Approval reminder Technical team - 7 days"){
            daysToSub = 7
        }else if (type === "Ticket Approval reminder Admin/brand - 5 days"){
            daysToSub = 5
        }else if(type === "Ticket Approval reminder Technical team - 15 days"){
            daysToSub = 15
        }
        const startDate = moment(currentDate).subtract(daysToSub, 'days').startOf('day'); // Get the current UTC date at the start of the day
        const endDate = moment(startDate).add(1, 'days'); // Get the date for the next day
        let ticketEscalation = await TicketTracker.findAll({where: {
            date: {
              [Op.gte]: startDate.toDate(),
              [Op.lt]: endDate.toDate(),
            }}}); 

        if (ticketEscalation && ticketEscalation.length > 0) {
            for await (let row of ticketEscalation){
                let pending = await getPendingTicket(type, row);
                if (pending) {
                    if (emailJob) {
                        let users = await getUsers(type, emailJob);
                        if(!users){
                            success = false;
                            return;
                        }
                        console.log(users)
                        for (let user of users?.userDetails) {
                            let body = generateEmailTemplate(user.name, row.dataValues.ticket_no, users?.day, [...users?.ccEmails, user.email]);
                            const emailSent: any = await sendEmail(body, [...users?.ccEmails, user.email], 'Ticketing Reminder');

                            // Update success flag based on the result of email sending
                            success = success && emailSent;
                        }
                    }
                }
            }
        }else{
            success = false;
        }
    }
    return success;
    }
    catch (error) {
        console.log(error);
        return false;
    }
}


const get_reminder_email_subject = (ginner: any, date: any, spinner: any, to: any, cc: any) => {
    let body = `<html> <body> Hi ${ginner}, <br/><br/>${add_mail_id_to_email(to, cc)}
			You have not completed the sale process saved on ${date} for  ${spinner}.<br/><br/> Kindly declare the sale at the earliest. <br/><br/> If you have any query, please contact noreply@cottonconnect.org ${add_admin_text(to)}
			<br/><br/>
		Thank you <br/>
		TraceBale team <br/>
		 </body> </html>`;
    return body;
}

function add_admin_text(to: any) {
    if (to.includes('selvin.lloyd@cottonconnect.org')) {
        return ' <br/><br/> <p><span style="background-color:#f1c40f">Warning: The processor email id is missing in the system</span></p>';
    } else
        return '';
}

function get_init_email_subject(buyer: any, seller: any, qty: any, product: any, invoice: any, to: any, cc: any) {
    let body = ` <html> <body> Hi ${buyer}, <br/><br/>  ${add_mail_id_to_email(to, cc)}
		${seller} has sold ${qty} (Kgs/mts/no's) of ${product} vide Invoice no : ${invoice}. <br/><br/> Please accept through transaction Alert. <br/><br/> If you have any query, please contact noreply@cottonconnect.org ${add_admin_text(to)} </body> </html>`;
    return body;
}

function get_process_report_body(processor_type: any, time: any, to: any, cc: any) {
    let body = `<html> <body> Hi, <br/><br/> ${add_mail_id_to_email(to, cc)}
		Please find the process report of ${processor_type} for the current  time ${time}. <br/><br/>
		Thank you <br/>
		TraceBale team <br/>									
		 </body> </html>`;
    return body;
}

function get_procurement_report_body(processor_type: any, time: any, to: any, cc: any) {
    let body = `<html> <body> Hi, <br/><br/> ${add_mail_id_to_email(to, cc)}
		Please find the ${processor_type} for the current  time ${time}. <br/><br/>
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

const is_email_job_available = async (id: String, brand: any, country: any, program: any) => {
    try {
        let emailJob = await EmailManagement.findOne({
            where:
            {
                template_id: id,
                brand_ids: { [Op.overlap]: brand },
                program_ids: { [Op.overlap]: program },
                country_ids: { [Op.overlap]: country }
            }
        })

        return emailJob
    } catch (error) {
        console.log(error);
    }

}

const bale_process_report = async (brandId: any, type: any, programIds: any, countryIds: any, date: any) => {
    const excelFilePath = path.join("./upload", "gin-bale-process.xlsx");

    const whereCondition: any = {};
    try {
        if (brandId) {
            whereCondition['$ginner.brand$']= { [Op.overlap]: brandId  };
        }


        if (countryIds) {
            whereCondition['$ginner.country_id$'] = { [Op.in]: countryIds };
        }

        if (programIds) {
            whereCondition.program_id = { [Op.in]: programIds };
        }

        if(type && date){
            let daysToSub = type === 'Weekly' ? 7 : 1;
            const startDate = moment(date).subtract(daysToSub, 'days');
            const endDate = moment(date);
            whereCondition.date = { 
                [Op.gte]: startDate.toDate(),
                [Op.lt]: endDate.toDate(), 
            }
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
            , "Staple Length(mm)", "Strength (g/tex)", "Mic", "Uniformity", "RD Value", "Quantity(Kgs)", "Programme",
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
            whereCondition['$ginner.brand$']= { [Op.overlap]: brandId  };
        }


        if (countryIds) {
            whereCondition['$ginner.country_id$'] = { [Op.in]: countryIds };
        }

        whereCondition.status = 'To be Submitted';

        if (programIds) {
            whereCondition.program_id = { [Op.in]: programIds };
        }

        if(type && date){
            let daysToSub = type === 'Weekly' ? 7 : 1;
            const startDate = moment(date).subtract(daysToSub, 'days');
            const endDate = moment(date);
            whereCondition.date = { 
                [Op.gte]: startDate.toDate(),
                [Op.lt]: endDate.toDate(), 
            }
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
            "Total Quantity", "Programme", "status"
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
            whereCondition['$ginner.brand$']= { [Op.overlap]: brandId  };
        }


        if (countryId) {
            whereCondition['$ginner.country_id$'] = { [Op.in]: countryId };
        }

        whereCondition.status = { [Op.ne]: 'To be Submitted' };

        if (programId) {
            whereCondition.program_id = { [Op.in]: programId };
        }

        if(type && date){
            let daysToSub = type === 'Weekly' ? 7 : 1;
            const startDate = moment(date).subtract(daysToSub, 'days');
            const endDate = moment(date);
            whereCondition.date = { 
                [Op.gte]: startDate.toDate(),
                [Op.lt]: endDate.toDate(), 
            }
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
            "Total Quantity", "Programme", "status"
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
            whereCondition['$buyerdata.brand$']= { [Op.overlap]: brandId  };
        }

        if (countryId) {
            whereCondition['$buyerdata.country_id$'] = { [Op.in]: countryId };
        }

        whereCondition.status = 'Sold';
        whereCondition.buyer = {
            [Op.ne]: null
        }

        if (programId) {
            whereCondition.program_id = { [Op.in]: programId };
        }

        if(type && date){
            let daysToSub = type === 'Weekly' ? 7 : 1;
            const startDate = moment(date).subtract(daysToSub, 'days');
            const endDate = moment(date);
            whereCondition.date = { 
                [Op.gte]: startDate.toDate(),
                [Op.lt]: endDate.toDate(), 
            }
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
            "Total Quantity", "Programme"
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
            whereCondition['$spinner.brand$']= { [Op.overlap]: brandId  };
        }

        if (countryId) {
            whereCondition['$spinner.country_id$'] = { [Op.in]: countryId };
        }

        if (programId) {
            whereCondition.program_id = { [Op.in]: programId };
        }

        if(type && date){
            let daysToSub = type === 'Weekly' ? 7 : 1;
            const startDate = moment(date).subtract(daysToSub, 'days');
            const endDate = moment(date);
            whereCondition.date = { 
                [Op.gte]: startDate.toDate(),
                [Op.lt]: endDate.toDate(), 
            }
        }

        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:O1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Spinner Yarn Sales Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Season", "Spinner Name", "Knitter/Weaver Name",
            "Invoice No", "Lot/Batch Number", "Reel Lot No", "Yarn Type", "Yarn Count", "No of Boxes",
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
            whereCondition['$knitter.brand$']= { [Op.overlap]: brandId  };
        }

        if (countryId) {
            whereCondition['$knitter.country_id$'] = { [Op.in]: countryId };
        }

        if (programId) {
            whereCondition.program_id = { [Op.in]: programId };
        }

        if(type && date){
            let daysToSub = type === 'Weekly' ? 7 : 1;
            const startDate = moment(date).subtract(daysToSub, 'days');
            const endDate = moment(date);
            whereCondition.date = { 
                [Op.gte]: startDate.toDate(),
                [Op.lt]: endDate.toDate(), 
            }
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
            whereCondition['$knitter.brand$']= { [Op.overlap]: brandId  };
        }

        if (countryId) {
            whereCondition['$knitter.country_id$'] = { [Op.in]: countryId };
        }

        if (programId) {
            whereCondition.program_id = { [Op.in]: programId };
        }

        if(type && date){
            let daysToSub = type === 'Weekly' ? 7 : 1;
            const startDate = moment(date).subtract(daysToSub, 'days');
            const endDate = moment(date);
            whereCondition.date = { 
                [Op.gte]: startDate.toDate(),
                [Op.lt]: endDate.toDate(), 
            }
        }

        whereCondition.status = 'Sold';

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
            "Invoice No", "Lot No", "Garment Order Reference", "Brand Order Reference",
            "Total Fabric Quantity (Kgs)",
        ]);
        headerRow.font = { bold: true };
        let include = [
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
                garment: item.garment_order_ref ? item.garment_order_ref : '',
                brand: item.brand_order_ref ? item.brand_order_ref : '',
                fabric_weight: item.total_yarn_qty ? item.total_yarn_qty : '',
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
            whereCondition['$weaver.brand$']= { [Op.overlap]: brandId  };
        }

        if (countryId) {
            whereCondition['$weaver.country_id$'] = { [Op.in]: countryId };
        }

        if (programId) {
            whereCondition.program_id = { [Op.in]: programId };
        }

        if(type && date){
            let daysToSub = type === 'Weekly' ? 7 : 1;
            const startDate = moment(date).subtract(daysToSub, 'days');
            const endDate = moment(date);
            whereCondition.date = { 
                [Op.gte]: startDate.toDate(),
                [Op.lt]: endDate.toDate(), 
            }
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
            whereCondition['$weaver.brand$']= { [Op.overlap]: brandId  };
        }

        if (countryId) {
            whereCondition['$weaver.country_id$'] = { [Op.in]: countryId };
        }

        if (programId) {
            whereCondition.program_id = { [Op.in]: programId };
        }

        if(type && date){
            let daysToSub = type === 'Weekly' ? 7 : 1;
            const startDate = moment(date).subtract(daysToSub, 'days');
            const endDate = moment(date);
            whereCondition.date = { 
                [Op.gte]: startDate.toDate(),
                [Op.lt]: endDate.toDate(), 
            }
        }

        whereCondition.status = 'Sold';

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
            "Garment Order Reference", "Brand Order Reference",
            "Total Fabric Quantity (mts)"
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
                garment: item.garment_order_ref ? item.garment_order_ref : '',
                brand: item.brand_order_ref ? item.brand_order_ref : '',
                fabric_length: item.total_yarn_qty ? item.total_yarn_qty : '',
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
            whereCondition['$weaver.brand$']= { [Op.overlap]: brandId  };
            whereCondition2['$knitter.brand$']= { [Op.overlap]: brandId  };
        }

        if (countryId) {
            whereCondition['$weaver.country_id$'] = { [Op.in]: countryId };
            whereCondition2['$knitter.country_id$'] = { [Op.in]: countryId };
        }


        if (programId) {
            whereCondition.program_id = { [Op.in]: programId };
        }

        if(type && date){
            let daysToSub = type === 'Weekly' ? 7 : 1;
            const startDate = moment(date).subtract(daysToSub, 'days');
            const endDate = moment(date);
            whereCondition.date = { 
                [Op.gte]: startDate.toDate(),
                [Op.lt]: endDate.toDate(), 
            }
        }

        whereCondition.status = 'Sold';

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
            "Sr No.", "Date", "Weave/Knit Unit", "Garment Processor Unit",
            "Invoice Number", "Lot/Batch No",
            "Garment Order Reference", "Brand Order Reference", "Total Fabric Length(Mts)", "Total Fabric Weight(Kgs)", "Qr code"
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
            }
        ]
        let result: any = await Promise.all([
            WeaverSales.findAll({
                where: whereCondition,
                include: [...include, { model: Weaver, as: 'weaver', attributes: ['id', 'name'] }]
            }),
            KnitSales.findAll({
                where: whereCondition2,
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
                garment: item.garment_order_ref ? item.garment_order_ref : '',
                brand: item.brand_order_ref ? item.brand_order_ref : '',
                fabric_length: item.weaver ? item.total_yarn_qty : '',
                fabric_weight: item.weaver ? '' : item.total_yarn_qty,
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
            whereCondition['$garment.brand$']= { [Op.overlap]: brandId  };
        }

        if (countryId) {
            whereCondition['$garment.country_id$'] = { [Op.in]: countryId };
        }

        if (programId) {
            whereCondition.program_id = { [Op.in]: programId };
        }

        if(type && date){
            let daysToSub = type === 'Weekly' ? 7 : 1;
            const startDate = moment(date).subtract(daysToSub, 'days');
            const endDate = moment(date);
            whereCondition.date = { 
                [Op.gte]: startDate.toDate(),
                [Op.lt]: endDate.toDate(), 
            }
        }

        whereCondition.status = 'Sold';

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
            "Item", "Total No of Boxes", "Total No of pieces", "Garment Size",
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
                mark: item.style_mark_no && item.style_mark_no.length > 0 ? item.style_mark_no.join(',') : '',
                garment: item.garment_type && item.garment_type.length > 0 ? item.garment_type.join(',') : '',
                no_of_boxes: item.total_no_of_boxes ? item.total_no_of_boxes : '',
                no_of_pieces: item.total_no_of_pieces ? item.total_no_of_pieces : '',
                garment_size: item.garment_size && item.garment_type.length > 0  ? item.garment_size.join(',') : '',
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
            'Block', 'District', 'State', 'Country', 'Brand Name', 'Programme Name', 'Total Area',
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

const procurementReport = async (brandId: any, type: any, programId: any, countryId: any, date: any) => {
    const excelFilePath = path.join("./upload", "Procurement.xlsx");

    try {
        let whereCondition: any = {};
        if (countryId) {
            whereCondition.country_id = { [Op.in]: countryId };
        }
        if (brandId) {
            whereCondition.brand_id = { [Op.in]: brandId };
        }

        if (programId) {
            whereCondition.program_id = { [Op.in]: programId };
        }
        if(type && date){
            let daysToSub = type === 'Weekly' ? 7 : 1;
            const startDate = moment(date).subtract(daysToSub, 'days');
            const endDate = moment(date);
            whereCondition.date = { 
                [Op.gte]: startDate.toDate(),
                [Op.lt]: endDate.toDate(), 
            }
        }
        //   if (startDate && endDate) {
        //     const startOfDay = new Date(startDate);
        //     startOfDay.setUTCHours(0, 0, 0, 0);
        //     const endOfDay = new Date(endDate);
        //     endOfDay.setUTCHours(23, 59, 59, 999);
        //     whereCondition.date = { [Op.between]: [startOfDay, endOfDay] }
        //   }

        // apply search
        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");

        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.",
            "Date",
            "Season",
            "Farmer Name",
            "Farmer Code",
            "Transaction Id",
            "Quantity Purchased",
            "Price/Kg",
            "Total Amount",
            "Programme",
            "Country",
            "Village",
            "Ginner Name",
        ]);
        headerRow.font = { bold: true };
        const transaction = await Transaction.findAll({
            where: whereCondition,
            include: [
                {
                    model: Village,
                    as: "village",
                },
                {
                    model: Season,
                    as: "season",
                },
                {
                    model: Block,
                    as: "block",
                },
                {
                    model: District,
                    as: "district",
                },
                {
                    model: State,
                    as: "state",
                },
                {
                    model: Country,
                    as: "country",
                },
                {
                    model: Farmer,
                    as: "farmer",
                },
                {
                    model: Program,
                    as: "program",
                },
                {
                    model: Ginner,
                    as: "ginner",
                }
            ],
        });

        // Append data to worksheet
        for await (const [index, item] of transaction.entries()) {
            const rowValues = Object.values({
                index: index + 1,
                date: item.date.toISOString().substring(0, 10),
                season: item.season.name,
                farmerName: item.farmer_name,
                farmerCode: item.farmer_code,
                transactionId: item.id,
                qtyPurchased: item.qty_purchased,
                rate: item.rate,
                totalAmount: item.total_amount,
                program: item.program.program_name,
                country: item.country.county_name,
                village: item.village.village_name,
                ginner: item?.ginner?.name
            });
            worksheet.addRow(rowValues);
        }
        // Auto-adjust column widths based on content
        // worksheet.columns.forEach((column: any) => {
        //     let maxCellLength = 0;
        //     column.eachCell({ includeEmpty: true }, (cell: any) => {
        //         const cellLength = (cell.value ? cell.value.toString() : '').length;
        //         maxCellLength = Math.max(maxCellLength, cellLength);
        //     });
        //     column.width = Math.min(30, maxCellLength + 2); // Limit width to 30 characters
        // });

        // Save the workbook
        await workbook.xlsx.writeFile(excelFilePath);
        return { path: excelFilePath, count: transaction.length }
    } catch (error) {
        console.error("Error appending data:", error);
    }
};

const qrProcurementReport = async (brandId: any, type: any, programId: any, countryId: any, date: any) => {
    const excelFilePath = path.join("./upload", "qrAppProcurementDetails.xlsx");

    try {
        let whereCondition: any = {};
        if (countryId) {
            whereCondition.country_id = { [Op.in]: countryId };
        }
        if (brandId) {
            whereCondition.brand_id = 
            { [Op.in]: brandId ,[Op.notIn]: [52,696,695] };//ignore test brand, vaiha brand data
        }

        if (programId) {
            whereCondition.program_id = { [Op.in]: programId };
        }

        whereCondition.agent_id = { [Op.not]: null, [Op.ne]: 0 };
        
        whereCondition.status = { [Op.notIn] :['Rejected'] };

        const normalizeDate = (date: Date) => {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate());
        };
        const currentDate = normalizeDate(new Date());
        const allSeasons = await Season.findAll({
            where: {
                from: {  [Op.lt]: currentDate},
                to:{ [Op.gte]: currentDate }
            }
        });
        
        const validSeasons = allSeasons.slice(0, 1);
        const seasonData: any = validSeasons.map((item: any) => item.dataValues.id);
        
        whereCondition.season_id = { [Op.in] : seasonData }; 

        if(type && date){
            let daysToSub = type === 'Weekly' ? 7 : 1;
            const startDate = moment(date).subtract(daysToSub, 'days');
            const endDate = moment(date);
            /*whereCondition.date = { 
                [Op.gte]: startDate.toDate(),
                [Op.lt]: endDate.toDate(),  
           
            } */
        }
        //   if (startDate && endDate) {
        //     const startOfDay = new Date(startDate);
        //     startOfDay.setUTCHours(0, 0, 0, 0);
        //     const endOfDay = new Date(endDate);
        //     endOfDay.setUTCHours(23, 59, 59, 999);
        //     whereCondition.date = { [Op.between]: [startOfDay, endOfDay] }
        //   }

        // apply search
        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");

        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", 'Date', 'Farmer Code', 'Farmer Name', 'Season', 'Country',
            'State', 'District', 'Block', 'Village', 'Transaction Id', 'Quantity Purchased (Kgs)',
            'Available Cotton (Kgs)', 'Price/KG(Local Currency)', 'Programme', 'Transport Vehicle No', 'Payment Method', 'Ginner Name', 'Transaction User Details'
        ]);
        headerRow.font = { bold: true };
        const transaction = await Transaction.findAll({
            where: whereCondition,
            include: [
                {
                    model: Village,
                    as: "village",
                },
                {
                    model: Season,
                    as: "season",
                },
                {
                    model: Block,
                    as: "block",
                },
                {
                    model: District,
                    as: "district",
                },
                {
                    model: State,
                    as: "state",
                },
                {
                    model: Country,
                    as: "country",
                },
                {
                    model: Farmer,
                    as: "farmer",
                },
                {
                    model: Program,
                    as: "program",
                },
                {
                    model: Ginner,
                    as: "ginner",
                },
                {
                    model: CropGrade,
                    as: "grade",
                    attributes: ['id', 'cropGrade']
                },
                {
                    model: Season,
                    as: "season",
                    attributes: ['id', 'name']
                },
                {
                    model: Farm,
                    as: "farm"
                },
                {
                    model: UserApp,
                    as: "agent"
                },
            ],
            order: [["date", "desc"]],
        });

        // Append data to worksheet
        for await (const [index, item] of transaction.entries()) {
            const rowValues = Object.values({
                index: index + 1,
                date: item.date.toISOString().substring(0, 10),
                farmerCode: item.farmer ? item.farmer?.code : "",
                farmerName: item.farmer ? item.farmer?.firstName + ' ' + item.farmer?.lastName : "",
                season: item.season ? item.season.name : "",
                country: item.country ? item.country.county_name : "",
                state: item.state ? item.state.state_name : "",
                district: item.district ? item.district.district_name : "",
                block: item.block ? item.block.block_name : "",
                village: item.village ? item.village.village_name : "",
                transactionId: item.id,
                qty_purchased: item.qty_purchased ? Number(item.qty_purchased) : 0,
                available_cotton: item.farm ? (Number(item.farm.total_estimated_cotton) > Number(item.farm.cotton_transacted) ? Number(item.farm.total_estimated_cotton) - Number(item.farm.cotton_transacted) : 0) : 0,
                rate: item.rate ? Number(item.rate) : 0,
                program: item.program ? item.program.program_name : "",
                vehicle: item.vehicle ? item.vehicle : "",
                payment_method: item.payment_method ? item.payment_method : "",
                ginner: item.ginner ? item.ginner.name : "",
                agent: item?.agent && ( item?.agent?.lastName ? item?.agent?.firstName + " " + item?.agent?.lastName+ "-" + item?.agent?.access_level : item?.agent?.firstName+ "-" + item?.agent?.access_level),
               
            });
            worksheet.addRow(rowValues);
            
        }
        // Auto-adjust column widths based on content
        // worksheet.columns.forEach((column: any) => {
        //     let maxCellLength = 0;
        //     column.eachCell({ includeEmpty: true }, (cell: any) => {
        //         const cellLength = (cell.value ? cell.value.toString() : '').length;
        //         maxCellLength = Math.max(maxCellLength, cellLength);
        //     });
        //     column.width = Math.min(30, maxCellLength + 2); // Limit width to 30 characters
        // });

        // Save the workbook
        await workbook.xlsx.writeFile(excelFilePath);
        return { path: excelFilePath, count: transaction.length }
    } catch (error) {
        console.error("Error appending data:", error);
    }
};

const integrityReport = async (brandId: any, type: any, programId: any, countryId: any, date: any) => {
    const excelFilePath = path.join('./upload', 'Integrity-report.xlsx');
    try {
        const whereCondition: any = {};
        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet1');
        //mergin the cells for first row
        worksheet.mergeCells('A1:F1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'Cotton Connect | Integrity Report';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };

        // Set bold font for header row
        if (brandId) {
            whereCondition.brand_id = { [Op.in]: brandId };
        }

        if(type && date){
            let daysToSub = type === 'Weekly' ? 7 : 1;
            const startDate = moment(date).subtract(daysToSub, 'days');
            const endDate = moment(date);
            whereCondition.date = { 
                [Op.gte]: startDate.toDate(),
                [Op.lt]: endDate.toDate(), 
            }
        }

        let include = [
            {
                model: FarmGroup, as: 'farmGroup'
            },
            {
                model: Ginner, as: 'ginner'
            },

        ]
        const headerRow = worksheet.addRow([
            'S.No', 'Farm Group/Ginner', 'Test Stage', 'Positive', 'Negative', 'Integrity Percentage'
        ]);
        headerRow.font = { bold: true };
        //fetch data with pagination
        const rows = await OrganicIntegrity.findAll({
            where: whereCondition,
            include: include
        });
        // Append data to worksheet
        for await (const [index, item] of rows.entries()) {
            const rowValues = Object.values({
                index: (index + 1),
                farmerName: item.farmGroup ? item.farmGroup.name : item.ginner.name,
                tranid: item.test_stage ? item.test_stage : '',
                village: item.integrity_score ? 'Yes' : '',
                villagea: item.integrity_score ? '' : 'Yes',
                district: item.district?.district_name
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
        return { path: excelFilePath, count: rows.length }
    } catch (error) {
        console.error('Error appending data:', error);
    }
}


const getPendingTicket = async (templateType: any, ticketEscalation: any) => {
    let pending = false;
    if (templateType === 'Ticket Approval reminder Admin/brand - 5 days' && ticketEscalation.dataValues.status === 'Pending') {
        pending = true;
    } else if (templateType === 'Ticket Approval reminder Technical team - 7 days' && ticketEscalation.dataValues.status === 'Approved') {
        pending = true;
    } else if (templateType === 'Ticket Approval reminder Technical team - 15 days' && ticketEscalation.dataValues.status === 'Approved') {
        pending = true;
    }
    return pending
}


const getUsers = async (templateType: any, emailJob: any) => {
    let userDetails: any = [];
    let roleIds = null;
    let countryIds = null;
    let brandIds = null;
    let day = null;
    let ccEmails: any = [];

    if (templateType === 'Ticket Approval reminder Admin/brand - 5 days') {
        day = 5;
        roleIds = [1, 2];
        countryIds = emailJob.country_ids;
    } else if (templateType == 'Ticket Approval reminder Technical team - 7 days') {
        roleIds = [19];
        countryIds = emailJob.country_ids;
        brandIds = emailJob.brand_ids;
        day = 7
    } else if (templateType == 'Ticket Approval reminder Technical team - 15 days') {
        roleIds = [18];
        countryIds = emailJob.country_ids;
        brandIds = emailJob.brand_ids;
        day = 15;
    }

    const users = await User.findAll({
        attributes: ['firstname', 'lastname', 'email'],
        where: {
            role: {
                [Op.in]: roleIds,
            },
        },
    });

    users.forEach((user: any) => {
        if (user.email) {
            userDetails.push({
                name: `${user.firstname} ${user.lastname}`,
                email: user.email,
            });
        }
    });

    if (emailJob.dataValues.user_ids) {
        const defaultUsers = await User.findAll({
            attributes: ['email'],
            where: {
                id: {
                    [Op.in]: emailJob.dataValues.user_ids,
                },
            },
        });

        defaultUsers.forEach((user: any) => {
            if (user.email) {
                ccEmails.push(user.email);
            }
        });
    }

    if (!day) {
        return null;
    }

    return {
        userDetails,
        day,
        ccEmails,
    };
};


function generateEmailTemplate(name: any, ticketingId: any, day: any, emails: any) {
    const body = `<!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>cotton_connect</title>
                <style>
                    * {
                        font-family: "Source Sans Pro", Tahoma, Verdana, Segoe, sans-serif;
                    }
                    table {
                        width: 100%;
                    }
                    table tr td {
                        text-align: center;
                    }
                    table tr td p {
                        text-align: justify;
                        font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
                        font-size: 16px;
                    }
                    table tr td a {
                        font-family: "Source Sans Pro", Tahoma, Verdana, Segoe, sans-serif;
                        text-align: center;
                    }
                    table tr td h3 {
                        color: #000000;
                        font-size: 24px;
                        font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <table style="width: 600px;margin: 0 auto;">
                    <tbody>
                        <tr>
                            <td>
                                <img src="https://d15k2d11r6t6rl.cloudfront.net/public/users/Integrators/BeeProAgency/868741_852879/editor_images/cc-logo.png" alt="">
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p>Hi ${name},</p>
                                <p style="text-indent: 50px;">You have not reviewed the ticketing <b> (${ticketingId}) </b> since ${day} days.<br /><br /> Kindly review at the earliest. <br /><br /> If you have any query, please contact noreply@cottonconnect.org <br /><br /> <p>${emails}</p> </p>
                                <p>Thank You</p>
                                <p>Team Tracebale</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </body>
        </html>`;

    return body;
}
