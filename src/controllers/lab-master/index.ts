import { Request, Response } from "express";
import { Op } from "sequelize";
import LabMaster from "../../models/lab-master.model";

const createLabMaster = async (req: Request, res: Response) => {
    try {
        let result = await LabMaster.findOne({ where: { name: { [Op.iLike]: req.body.labName } } });
        if (result) {
            return res.sendError(res, "Lab name already exist, please try different name.");
        }

        const data = {
            name: req.body.labName,
            status: true
        };
        const labMaster = await LabMaster.create(data);
        res.sendSuccess(res, labMaster);
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

const createLabMasters = async (req: Request, res: Response) => {
    try {
        let pass = [];
        let fail = [];
        for await (const labName of req.body.labNames) {
            let result = await LabMaster.findOne({ where: { name: { [Op.iLike]: labName } } })
            if (result) {
                fail.push({ data: result });
            } else {
                const result = await LabMaster.create({ name: labName, status: true });
                pass.push({ data: result });
            }
        }
        res.sendSuccess(res, { pass, fail });
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

const fetchLabMasterPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'desc';
    const status = req.query.status || '';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const whereCondition: any = {};
        if (status === 'true') {
            whereCondition.status = true;
        }
        if (searchTerm) {
            whereCondition.name = { [Op.iLike]: `%${searchTerm}%` }
        }

        if (req.query.pagination === "true") {
            const { count, rows } = await LabMaster.findAndCountAll({
                where: whereCondition,
                order: [
                    ['id', sortOrder]
                ],
                offset: offset,
                limit: limit
            });

            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const labMaster = await LabMaster.findAll({
                where: whereCondition,
                order: [
                    ['id', sortOrder]
                ],
            });

            return res.sendSuccess(res, labMaster);
        }
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

const updateLabMaster = async (req: Request, res: Response) => {
    try {
        let result = await LabMaster.findOne({ where: { name: { [Op.iLike]: req.body.labName }, id: { [Op.ne]: req.body.id } } });
        if (result) {
            return res.sendError(res, "ALREADY_EXITS");
        }
        const labMaster = await LabMaster.update({
            name: req.body.labName
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { labMaster });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const updateLabMasterStatus = async (req: Request, res: Response) => {
    try {
        const labMaster = await LabMaster.update({ status: req.body.status }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { labMaster });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const deleteLabMaster = async (req: Request, res: Response) => {
    try {
        const labMaster = await LabMaster.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { labMaster });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

export {
    createLabMaster,
    createLabMasters,
    fetchLabMasterPagination,
    updateLabMaster,
    updateLabMasterStatus,
    deleteLabMaster
};