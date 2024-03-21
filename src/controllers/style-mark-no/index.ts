import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import StyleMark from "../../models/style-mark.model";

const createStyleMark = async (req: Request, res: Response) => {
  try {
    const data = {
      style_mark_no: req.body.name,
      status: true,
    };
    const styleMark = await StyleMark.create(data);
    res.sendSuccess(res, styleMark);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

const createStyleMarkNumbers = async (req: Request, res: Response) => {
  try {
    // create multiple Garment Type at the time
    let pass = [];
    let fail = [];
    for await (const obj of req.body.styleMarkNos) {
      let result = await StyleMark.findOne({ where: { style_mark_no: { [Op.iLike]: obj } } })
      if (result) {
        fail.push({ data: result });
      } else {
        const result = await StyleMark.create({ style_mark_no: obj, status: true });
        pass.push({ data: result });
      }
    }
    res.sendSuccess(res, { pass, fail });
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

const fetchStyleMarkPagination = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const sortOrder = req.query.sort || "asc";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const status = req.query.status || '';
  const whereCondition: any = {};
  try {
    if (searchTerm) {
      whereCondition[Op.or] = [
        { style_mark_no: { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type
      ];
    }
    if (status === 'true') {
      whereCondition.status = true;
    }

    //fetch data with pagination
    if (req.query.pagination === "true") {
      const { count, rows } = await StyleMark.findAndCountAll({
        where: whereCondition,
        order: [
          ["id", 'desc'], // Sort the results based on the 'name' field and the specified order
        ],
        offset: offset,
        limit: limit,
      });
      return res.sendPaginationSuccess(res, rows, count);
    } else {
      const styleMark = await StyleMark.findAll({
        where: whereCondition,
        order: [
          ["id", 'desc'], // Sort the results based on the 'name' field and the specified order
        ],
      });
      return res.sendSuccess(res, styleMark);
    }
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

const updateStyleMark = async (req: Request, res: Response) => {
  try {
    let result = await StyleMark.findOne({ where: { style_mark_no: { [Op.iLike]: req.body.name }, id: { [Op.ne]: req.body.id } } })
    if (result) {
      return res.sendError(res, "ALREADY_EXITS");
    }
    const styleMark = await StyleMark.update(
      {
        style_mark_no: req.body.name,
      },
      {
        where: {
          id: req.body.id,
        },
      }
    );
    res.sendSuccess(res, styleMark);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

const updateStyleMarkStatus = async (req: Request, res: Response) => {
  try {
    const styleMark = await StyleMark.update(
      {
        status: req.body.status,
      },
      {
        where: {
          id: req.body.id,
        },
      }
    );
    res.sendSuccess(res, styleMark);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

const deleteStyleMark = async (req: Request, res: Response) => {
  try {
    const styleMark = await StyleMark.destroy({
      where: {
        id: req.body.id,
      },
    });
    res.sendSuccess(res, styleMark);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

const checkStyleMarkNumbers = async (req: Request, res: Response) => {
  try {
    let whereCondition: any = {}
    if (req.body.id) {
      whereCondition = { style_mark_no: { [Op.iLike]: req.body.name }, id: { [Op.ne]: req.body.id } }
    } else {
      whereCondition = { style_mark_no: { [Op.iLike]: req.body.name } }
    }
    let result = await StyleMark.findOne({ where: whereCondition })

    res.sendSuccess(res, result ? { exist: true } : { exist: false });
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message);
  }
}

export {
  createStyleMark,
  checkStyleMarkNumbers,
  createStyleMarkNumbers,
  fetchStyleMarkPagination,
  updateStyleMark,
  updateStyleMarkStatus,
  deleteStyleMark,
};
