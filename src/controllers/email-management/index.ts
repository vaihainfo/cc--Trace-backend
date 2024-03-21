import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import moment from "moment";

import EmailTemplate from "../../models/email-template.model";
import EmailManagement from "../../models/email-management.model";
import UserRole from "../../models/user-role.model";
import Brand from "../../models/brand.model";
import Program from "../../models/program.model";
import Country from "../../models/country.model";
import ScheduledEmailJobs from "../../models/scheduled-email-jobs.model";

const createEmailTemplate = async (req: Request, res: Response) => {
  try {
    const data = {
      template_name: req.body.templateName,
      mail_type: req.body.mailType
    };

    const emailTemplate = await EmailTemplate.create(data);
    res.sendSuccess(res, emailTemplate);
  }  catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

const createEmailTemplates = async (req: Request, res: Response) => {
  try {
    let pass = [];
    let fail = [];
    for await (const obj of req.body.data) {
      let result = await EmailTemplate.findOne({ where: { template_name: { [Op.iLike]: obj.templateName } } })
      if (result) {
        fail.push({ data: result });
      } else {
        const result = await EmailTemplate.create({ template_name: obj.templateName, mail_type: obj.mailType });
        pass.push({ data: result });
      }
    }
    return res.sendSuccess(res, { pass, fail });
  }  catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

//scheduled templates array exculding "Whenever any sales happens" templates
let scheduledTemplates = ["Farmer Report", "Ginner Bale Process Report", "Ginner Pending Sales Report", "Ginner Sales Report", "Spinner Bale Receipt Report", "Spinner Yarn Sales Report", "Knitter Yarn Receipt Report", "Knitter Fabric Sales Report", "Weaver Yarn Receipt Report", "Weaver Fabric Sales Report", "Garment Fabric Receipt Report", "Garment Fabric Sales Report", "When Gin Sales are still pending - 5 days reminder", "When Gin Sales are still pending - 7 days and Before", "Organic Integrity Report", "Procurement Report", "Organic Farmer Report","Spinner Transaction Pending Notification","Pscp Procurement and Sell Live Tracker", "Ticket Approval reminder Admin/brand - 5 days", "Ticket Approval reminder Technical team - 7 days", "Ticket Approval reminder Technical team - 15 days"]

const createEmailJob = async (req: Request, res: Response) => {
  try {
    const data = {
      template_id: req.body.templateId,
      mail_type: req.body.mailType,
      user_categories: req.body.userGroup,
      brand_ids: req.body.brandIds,
      program_ids: req.body.programIds,
      country_ids: req.body.countryIds,
      user_ids: req.body.userIds,
    };

    const emailJob = await EmailManagement.create(data);

    if(emailJob){
      let currentDate = moment().utc();
      let scheduledDate = moment().utc();
      let selectedTemplate = await EmailTemplate.findOne({where: {
        id: req.body.templateId
      }});

      if(selectedTemplate && scheduledTemplates.includes(selectedTemplate?.dataValues?.template_name)){
        const daysToAdd = req.body.mailType === 'Weekly' ? 7 : 1;
        scheduledDate.add(daysToAdd, 'days');

        const emailData = {
          email_job_id: emailJob?.dataValues?.id,
          created_date: currentDate,
          scheduled_date: scheduledDate,
          no_of_attempts: 0,
          email_status: false,
          email_message: null,
        };

        const emailSchedule = await ScheduledEmailJobs.create(emailData);
      } 
    }
    return res.sendSuccess(res, emailJob);
  }  catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

const getEmailJobs = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const sortOrder = req.query.sort || "desc";
  //   const sortField = req.query.sortBy || '';
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const whereCondition: any = {};

  try {
    // apply search
    if (searchTerm) {
      whereCondition[Op.or] = [
        { "$template.template_name$": { [Op.iLike]: `%${searchTerm}%` } },
        { mail_type: { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }

    let queryOptions: any = {
      where: whereCondition,
      include: [
        {
          model: EmailTemplate,
          as: "template",
        },
      ],
    };

    if (sortOrder === "asc" || sortOrder === "desc") {
      queryOptions.order = [["id", sortOrder]];
    }

    // apply pagination
    if (req.query.pagination === "true") {
      queryOptions.offset = offset;
      queryOptions.limit = limit;

      const { count, rows } = await EmailManagement.findAndCountAll(
        queryOptions
      );

      const emailJobPromises = rows.map(async (row: any) => {
        const userCategories = await UserRole.findAll({
          where: { id: row.user_categories },
        });

        const brands = await Brand.findAll({
          where: { id: row.brand_ids },
        });

        const programs = await Program.findAll({
          where: { id: row.program_ids },
        });

        const countries = await Country.findAll({
          where: { id: row.country_ids },
        });

        return {
          ...row.dataValues,
          userCategories,
          brands,
          programs,
          countries,
        };
      });

      const emailJobs = await Promise.all(emailJobPromises);

      return res.sendPaginationSuccess(res, emailJobs, count);
    } else {
      // fetch without filters
      const linen = await EmailManagement.findAll({});
      return res.sendSuccess(res, linen);
    }
  }  catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
}
};

const updateEmailJob = async (req: Request, res: Response) => {
  try {
    const data = {
      template_id: req.body.templateId,
      mail_type: req.body.mailType,
      user_categories: req.body.userGroup,
      brand_ids: req.body.brandIds,
      program_ids: req.body.programIds,
      country_ids: req.body.countryIds,
      user_ids: req.body.userIds,
    };

    const scheduledEmailJob = await ScheduledEmailJobs.findOne({
      where:{
        email_job_id: req.body.id,
        email_status: false
      }
    });

    if(scheduledEmailJob){
      let currentDate = moment().utc();
      let scheduledDate = moment().utc();
      let selectedTemplate = await EmailTemplate.findOne({where: {
        id: req.body.templateId
      }});

      if(selectedTemplate && scheduledTemplates.includes(selectedTemplate?.dataValues?.template_name)){
        const daysToAdd = req.body.mailType === 'Weekly' ? 7 : 1;
        scheduledDate.add(daysToAdd, 'days');

        const emailData = {
          created_date: currentDate,
          scheduled_date: scheduledDate,
          no_of_attempts: 0,
          email_status: false,
          email_message: null,
        };

        const emailSchedule = await ScheduledEmailJobs.update(emailData, {
          where: {id: scheduledEmailJob?.dataValues?.id}
        });
       }else{
      const emailSchedule = await ScheduledEmailJobs.destroy({
        where: {id: scheduledEmailJob?.dataValues?.id}
      });
      }
    }else{
      let currentDate = moment().utc();
      let scheduledDate = moment().utc();
      let selectedTemplate = await EmailTemplate.findOne({where: {
        id: req.body.templateId
      }});

      if(selectedTemplate && scheduledTemplates.includes(selectedTemplate?.dataValues?.template_name)){
        const daysToAdd = req.body.mailType === 'Weekly' ? 7 : 1;
        scheduledDate.add(daysToAdd, 'days');

        const emailData = {
          email_job_id: req.body.id,
          created_date: currentDate,
          scheduled_date: scheduledDate,
          no_of_attempts: 0,
          email_status: false,
          email_message: null,
        };

        const emailSchedule = await ScheduledEmailJobs.create(emailData);
      } 
    }

    const emailJob = await EmailManagement.update(data, {
      where: {
        id: req.body.id
      }
    });
    res.sendSuccess(res, emailJob);
  }  catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
}
};

const deleteEmailJob = async (req: Request, res: Response) => {
  try {

    const scheduledEmailJob = await ScheduledEmailJobs.findOne({
      where:{
        email_job_id: req.body.id,
        email_status: false
      }
    });

    if(scheduledEmailJob){
      const emailSchedule = await ScheduledEmailJobs.destroy({
        where: {id: scheduledEmailJob?.dataValues?.id}
      });
    }

    const emailJob = await EmailManagement.destroy({
      where: {
        id: req.body.id
      }
    });
    res.sendSuccess(res, emailJob);
  }  catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
}
};


const getEmailJobById = async (req: Request, res: Response) => {
  try {
    let queryOptions: any = {
      where: { id: req.query.id },
      include: [
        {
          model: EmailTemplate,
          as: "template",
        },
      ],
    };

    const emaildata = await EmailManagement.findOne(queryOptions);

    const userCategories = await UserRole.findAll({
      where: { id: emaildata.user_categories },
    });

    const brands = await Brand.findAll({
      where: { id: emaildata.brand_ids },
    });

    const programs = await Program.findAll({
      where: { id: emaildata.program_ids },
    });

    const countries = await Country.findAll({
      where: { id: emaildata.country_ids },
    });

    const emailJob = {
      ...emaildata.dataValues,
      userCategories,
      brands,
      programs,
      countries,
    };

    return res.sendSuccess(res, emailJob);
  } catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
}
};

const getEmailTemplates = async (req: Request, res: Response) => {
  try {
    const emailTemplate = await EmailTemplate.findAll({order: [["id", "asc"]]});
    res.sendSuccess(res, emailTemplate);
  } catch (error) {
    return res.sendError(res, "EMAIL_TEMPLATES_NOT_FIND");
  }
};

const getEmailTemplateByID = async (req: Request, res: Response) => {
  try {
    const emailTemplate = await EmailTemplate.findOne({
      where: { id: req.query.id },
    });
    res.sendSuccess(res, emailTemplate);
  }  catch (error: any) {
    console.error("Error appending data:", error);
    return res.sendError(res, error.message);
  }
};

export {
  getEmailJobById,
  getEmailJobs,
  getEmailTemplates,
  getEmailTemplateByID,
  createEmailJob,
  createEmailTemplate,
  createEmailTemplates,
  updateEmailJob,
  deleteEmailJob
};
