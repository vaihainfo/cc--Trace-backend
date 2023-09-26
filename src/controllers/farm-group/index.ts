import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import Brand from "../../models/brand.model";
import FarmGroup from "../../models/farm-group.model";

const createFarmGroup = async (req: Request, res: Response) => {
  try {
    const data = {
      brand_id: req.body.brandId,
      name: req.body.name,
      status: true,
    };
    const farmGroup = await FarmGroup.create(data);
    res.sendSuccess(res, farmGroup);
  } catch (error) {
    return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
  }
};

const createFarmGroups = async (req: Request, res: Response) => {
  try {
    // create multiple Farm Group at the time
    let pass = [];
    let fail = [];
    for await (const obj of req.body.name) {
      let result = await FarmGroup.findOne({ where: { name: { [Op.iLike]: obj }, brand_id: req.body.brandId } })
      if (result) {
        fail.push({ data: result });
      } else {
        const result = await FarmGroup.create({ name: obj, brand_id: req.body.brandId, status: true });
        pass.push({ data: result });
      }
    }
    res.sendSuccess(res, { pass, fail });
  } catch (error) {
    return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
  }
};

const fetchFarmGroupPagination = async (req: Request, res: Response) => {
  const searchTerm = req.query.search || "";
  const sortOrder = req.query.sort || "asc";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const brandId = req.query.brandId as string;
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
    if (brandId) {
      const idArray: number[] = brandId
        .split(",")
        .map((id) => parseInt(id, 10));
      whereCondition.brand_id = { [Op.in]: idArray };
    }
    //fetch data with pagination
    if (req.query.pagination === "true") {
      const { count, rows } = await FarmGroup.findAndCountAll({
        where: whereCondition,
        order: [
          ["name", sortOrder], // Sort the results based on the 'name' field and the specified order
        ],
        include: [
          {
            model: Brand,
            as: "brand",
            attributes: ["id", "brand_name", "address"],
          },
        ],
        offset: offset,
        limit: limit,
      });
      return res.sendPaginationSuccess(res, rows, count);
    } else {
      const farmGroup = await FarmGroup.findAll({
        where: whereCondition,
        include: [
          {
            model: Brand,
            as: "brand",
            attributes: ["id", "brand_name", "address"],
          },
        ],
        order: [
          ["name", sortOrder], // Sort the results based on the 'name' field and the specified order
        ],
      });
      return res.sendSuccess(res, farmGroup);
    }
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

const updateFarmGroup = async (req: Request, res: Response) => {
  try {
    let result = await FarmGroup.findOne({ where: { brand_id: req.body.brandId, name: { [Op.iLike]: req.body.name }, id: { [Op.ne]: req.body.id } } })
    if (result) {
      return res.sendError(res, "ALREADY_EXITS");
    }
    const farmGroup = await FarmGroup.update(
      {
        brand_id: req.body.brandId,
        name: req.body.name,
      },
      {
        where: {
          id: req.body.id,
        },
      }
    );
    res.sendSuccess(res, farmGroup);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const updateFarmGroupStatus = async (req: Request, res: Response) => {
  try {
    const farmGroup = await FarmGroup.update(
      {
        status: req.body.status,
      },
      {
        where: {
          id: req.body.id,
        },
      }
    );
    res.sendSuccess(res, farmGroup);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const deleteFarmGroup = async (req: Request, res: Response) => {
  try {
    const farmGroup = await FarmGroup.destroy({
      where: {
        id: req.body.id,
      },
    });
    res.sendSuccess(res, farmGroup);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

export {
  createFarmGroup,
  createFarmGroups,
  fetchFarmGroupPagination,
  updateFarmGroup,
  updateFarmGroupStatus,
  deleteFarmGroup,
};
