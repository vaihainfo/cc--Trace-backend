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
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const createDepartments = async (req: Request, res: Response) => {
    try {
        // create multiple crops at the time
        const data = req.body.deptName.map((obj: string) => {
            return { dept_name: obj, dept_status: true }
        })
        const department = await Department.bulkCreate(data);
        res.sendSuccess(res, department);
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const fetchDepartmentPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'asc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    try {
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await Department.findAndCountAll({
                where: {
                    dept_name: { [Op.iLike]: `%${searchTerm}%` },
                },
                order: [
                    ['dept_name', sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
                offset: offset,
                limit: limit
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const department = await Department.findAll({
                where: {
                    dept_name: { [Op.iLike]: `%${searchTerm}%` },
                },
                order: [
                    ['dept_name', sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
            });
            return res.sendSuccess(res, department);
        }

    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}


const updateDepartment = async (req: Request, res: Response) => {
    try {
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