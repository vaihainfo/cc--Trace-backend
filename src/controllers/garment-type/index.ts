import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import GarmentType from "../../models/garment-type.model";

const createGarmentType = async (req: Request, res: Response) => {
  try {
    const data = {
      name: req.body.name,
      status: true,
    };
    const garmentType = await GarmentType.create(data);
    res.sendSuccess(res, garmentType);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

const createGarmentTypes = async (req: Request, res: Response) => {
  try {
    // create multiple Garment Type at the time
    let pass = [];
    let fail = [];
    for await (const obj of req.body.garmentTypes) {
      let result = await GarmentType.findOne({ where: { name: { [Op.iLike]: obj } } })
      if (result) {
        fail.push({ data: result });
      } else {
        const result = await GarmentType.create({ name: obj, status: true });
        pass.push({ data: result });
      }
    }
    res.sendSuccess(res, { pass, fail });
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

const fetchGarmentTypePagination = async (req: Request, res: Response) => {
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
        { name: { [Op.iLike]: `%${searchTerm}%` } }, // Search by crop Type
      ];
    }
    if (status === 'true') {
      whereCondition.status = true;
    }

    //fetch data with pagination
    if (req.query.pagination === "true") {
      const { count, rows } = await GarmentType.findAndCountAll({
        where: whereCondition,
        order: [
          ["id", 'desc'], // Sort the results based on the 'name' field and the specified order
        ],
        offset: offset,
        limit: limit,
      });
      return res.sendPaginationSuccess(res, rows, count);
    } else {
      const garmentType = await GarmentType.findAll({
        where: whereCondition,
        order: [
          ["id", 'desc'], // Sort the results based on the 'name' field and the specified order
        ],
      });
      return res.sendSuccess(res, garmentType);
    }
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

const updateGarmentType = async (req: Request, res: Response) => {
  try {
    let result = await GarmentType.findOne({ where: { name: { [Op.iLike]: req.body.name }, id: { [Op.ne]: req.body.id } } })
    if (result) {
      return res.sendError(res, "ALREADY_EXITS");
    }
    const garmentType = await GarmentType.update(
      {
        name: req.body.name,
      },
      {
        where: {
          id: req.body.id,
        },
      }
    );
    res.sendSuccess(res, garmentType);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

const updateGarmentTypeStatus = async (req: Request, res: Response) => {
  try {
    const garmentType = await GarmentType.update(
      {
        status: req.body.status,
      },
      {
        where: {
          id: req.body.id,
        },
      }
    );
    res.sendSuccess(res, garmentType);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

const deleteGarmentType = async (req: Request, res: Response) => {
  try {
    const garmentType = await GarmentType.destroy({
      where: {
        id: req.body.id,
      },
    });
    res.sendSuccess(res, garmentType);
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

const checkGarmentTypes = async (req: Request, res: Response) => {
  try {
    let whereCondition: any = {}
    if (req.body.id) {
      whereCondition = { name: { [Op.iLike]: req.body.name }, id: { [Op.ne]: req.body.id } }
    } else {
      whereCondition = { name: { [Op.iLike]: req.body.name } }
    }
    let result = await GarmentType.findOne({ where: whereCondition })

    res.sendSuccess(res, result ? { exist: true } : { exist: false });
  } catch (error: any) {
    console.log(error)
    return res.sendError(res, error.message);
  }
}

export {
  createGarmentType,
  checkGarmentTypes,
  createGarmentTypes,
  fetchGarmentTypePagination,
  updateGarmentType,
  updateGarmentTypeStatus,
  deleteGarmentType,
};
