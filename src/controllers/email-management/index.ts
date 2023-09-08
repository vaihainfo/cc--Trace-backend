import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";

import EmailTemplate from "../../models/email-template.model";
import EmailManagement from "../../models/email-management.model";
import UserRole from "../../models/user-role.model";
import Brand from "../../models/brand.model";
import Program from "../../models/program.model";
import Country from "../../models/country.model";

const createEmailTemplate = async (req: Request, res: Response) => {
  try {
    const data = {
      template_name: req.body.templateName,
      file_name: req.body.fileName,
      mail_type: req.body.mailType
    };

    const emailTemplate = await EmailTemplate.create(data);
    res.sendSuccess(res, emailTemplate);
  } catch (error) {
    return res.sendError(res, "EMAIL_TEMPLATE_NOT_CREATED");
  }
};

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
    res.sendSuccess(res, emailJob);
  } catch (error) {
    console.log(error);
    return res.sendError(res, "EMAIL_TEMPLATE_NOT_CREATED");
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
  } catch (error) {
    console.log(error);
    return res.sendError(res, "EMAIL_TEMPLATE_NOT_CREATED");
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

    const emailJob = await EmailManagement.update(data, {
      where: {
        id: req.body.id
      }
    });
    res.sendSuccess(res, emailJob);
  } catch (error) {
    console.log(error);
    return res.sendError(res, "EMAIL_TEMPLATE_NOT_CREATED");
  }
};

const deleteEmailJob = async (req: Request, res: Response) => {
  try {
    const emailJob = await EmailManagement.destroy({
      where: {
        id: req.body.id
      }
    });
    res.sendSuccess(res, emailJob);
  } catch (error) {
    console.log(error);
    return res.sendError(res, "EMAIL_TEMPLATE_NOT_CREATED");
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
  } catch (error) {
    console.log(error);
    return res.sendError(res, "EMAIL_TEMPLATE_NOT_FIND");
  }
};

const getEmailTemplates = async (req: Request, res: Response) => {
  try {
    const emailTemplate = await EmailTemplate.findAll();
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
  } catch (error) {
    return res.sendError(res, "EMAIL_TEMPLATE_NOT_FIND");
  }
};

export {
  getEmailJobById,
  getEmailJobs,
  getEmailTemplates,
  getEmailTemplateByID,
  createEmailJob,
  createEmailTemplate,
  updateEmailJob,
  deleteEmailJob
};
