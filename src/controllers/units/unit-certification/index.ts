import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";

import UnitCertification from "../../../models/unit-certification.model";


const createUnitCertification = async (req: Request, res: Response) => {
    try {
        const data = {
            certification_name: req.body.certificationName,
            certification_logo: req.body.certificationLogo,
            certification_status: true
        };
        const unitCertification = await UnitCertification.create(data);
        res.sendSuccess(res, unitCertification);
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const createUnitCertifications = async (req: Request, res: Response) => {
    try {
        // create multiple crops at the time
        const data = req.body.certification.map((obj: any) => {
            return {
                certification_name: obj.certificationName,
                certification_logo: obj.certificationLogo,
                certification_status: true
            }
        });
        const unitCertification = await UnitCertification.bulkCreate(data);
        res.sendSuccess(res, unitCertification);
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const fetchUnitCertificationPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'asc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    try {
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await UnitCertification.findAndCountAll({
                where: {
                    certification_name: { [Op.iLike]: `%${searchTerm}%` },
                },
                order: [
                    ['certification_name', sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
                offset: offset,
                limit: limit
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const unitCertification = await UnitCertification.findAll({
                where: {
                    certification_name: { [Op.iLike]: `%${searchTerm}%` },
                },
                order: [
                    ['certification_name', sortOrder], // Sort the results based on the 'username' field and the specified order
                ],
            });
            return res.sendSuccess(res, unitCertification);
        }

    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const updateUnitCertification = async (req: Request, res: Response) => {
    try {
        const unitCertification = await UnitCertification.update({
            certification_name: req.body.certificationName,
            certification_logo: req.body.certificationLogo
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, unitCertification);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const updateUnitCertificationStatus = async (req: Request, res: Response) => {
    try {
        const unitCertification = await UnitCertification.update({
            certification_status: req.body.status
        }, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, unitCertification);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const deleteUnitCertification = async (req: Request, res: Response) => {
    try {
        const unitCertification = await UnitCertification.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { unitCertification });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}


export {
    createUnitCertification,
    createUnitCertifications,
    fetchUnitCertificationPagination,
    updateUnitCertification,
    updateUnitCertificationStatus,
    deleteUnitCertification
};