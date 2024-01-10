import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";

import Department from "../../models/department.model";


const createDepartment = async (req: Request, res: Response) => {
    try {
        const data = {
            dept_name: req.body.deptName,
            dept_status: true
        };
        const department = await Department.create(data);
        res.sendSuccess(res, department);
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

const createDepartments = async (req: Request, res: Response) => {
    try {
        // create multiple Department at the time
        let pass = [];
        let fail = [];
        for await (const obj of req.body.deptName) {
            let result = await Department.findOne({ where: { dept_name: { [Op.iLike]: obj } } })
            if (result) {
                fail.push({ data: result });
            } else {
                const result = await Department.create({ dept_name: obj, dept_status: true });
                pass.push({ data: result });
            }
        }
        res.sendSuccess(res, { pass, fail });
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

const fetchDepartmentPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'desc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status || '';
    const whereCondition: any = {};
    try {

        if (status === 'true') {
            whereCondition.dept_status = true;
        }
        if (searchTerm) {
            whereCondition.dept_name = { [Op.iLike]: `%${searchTerm}%` }
        }
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await Department.findAndCountAll({
                where: whereCondition,
                order: [
                    ['id', sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
                offset: offset,
                limit: limit
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const department = await Department.findAll({
                where: whereCondition,
                order: [
                    ['id', sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
            });
            return res.sendSuccess(res, department);
        }

    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}


const updateDepartment = async (req: Request, res: Response) => {
    try {
        let result = await Department.findOne({ where: { dept_name: { [Op.iLike]: req.body.deptName }, id: { [Op.ne]: req.body.id } } })
        if (result) {
            return res.sendError(res, "ALREADY_EXITS");
        }
        const department = await Department.update({
            dept_name: req.body.deptName
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { department });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const updateDepartmentStatus = async (req: Request, res: Response) => {
    try {

        const department = await Department.update({ dept_status: req.body.status }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { department });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const deleteDepartment = async (req: Request, res: Response) => {
    try {
        const department = await Department.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { department });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}


export {
    createDepartment,
    createDepartments,
    fetchDepartmentPagination,
    updateDepartment,
    updateDepartmentStatus,
    deleteDepartment
};