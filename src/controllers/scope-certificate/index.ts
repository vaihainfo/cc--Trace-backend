import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";

import ScopeCert from "../../models/scopecert.model";
import Country from "../../models/country.model";
import State from "../../models/state.model";
import FarmGroup from "../../models/farm-group.model";
import ICS from "../../models/ics.model";
import Brand from "../../models/brand.model";


const createScopeCert = async (req: Request, res: Response) => {
    try {
        const data = {
            country_id: req.body.countryId,
            state_id: req.body.stateId,
            brand_id: req.body.brandId,
            farmGroup_id: req.body.farmGroupId,
            ics_id: req.body.icsId,
            validity_end: req.body.validityEnd,
            standard: req.body.standard,
            document: req.body.document
        };
        const scopeCert = await ScopeCert.create(data);
        res.sendSuccess(res, scopeCert);
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const fetchScopeCertPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { brandId, farmGroupId, countryId, stateId, icsId }: any = req.query
    const offset = (page - 1) * limit;
    const whereCondition: any = {}
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { '$country.county_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by country Name
                { '$state.state_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by State Name 
                { '$brand.brand_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by Brand name
                { '$farmGroup.name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by Farm group name
                { '$ics.ics_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by Ics name
            ];
        }
        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.brand_id = { [Op.in]: idArray };
        }

        if (farmGroupId) {
            const idArray: number[] = farmGroupId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.farmGroup_id = { [Op.in]: idArray };
        }
        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.country_id = { [Op.in]: idArray };
        }
        if (stateId) {
            const idArray: number[] = stateId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.state_id = { [Op.in]: idArray };
        }
        if (icsId) {
            const idArray: string[] = icsId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.ics_id = { [Op.in]: idArray };
        }
        let include = [
            {
                model: Country, as: 'country'
            },
            {
                model: State, as: 'state'
            },
            {
                model: FarmGroup, as: 'farmGroup'
            },
            {
                model: ICS, as: 'ics'
            },
            {
                model: Brand, as: 'brand'
            }
        ]
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await ScopeCert.findAndCountAll({
                where: whereCondition,
                include: include,
                offset: offset,
                limit: limit
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const data = await ScopeCert.findAll({
                where: whereCondition,
                include: include
            });
            return res.sendSuccess(res, data);
        }
    } catch (error) {
        res.status(500).send({
            message: `Could not upload the file:. ${error}`,
        });
    }
}

const fetchScopeCert = async (req: Request, res: Response) => {
    const whereCondition: any = { id: req.params.id }
    try {

        let include = [
            {
                model: Country, as: 'country'
            },
            {
                model: State, as: 'state'
            },
            {
                model: FarmGroup, as: 'farmGroup'
            },
            {
                model: ICS, as: 'ics'
            },
            {
                model: Brand, as: 'brand'
            }
        ]

        const rows = await ScopeCert.findOne({
            where: whereCondition,
            include: include
        });
        return res.sendSuccess(res, rows);

    } catch (error) {
        res.status(500).send({
            message: `Could not upload the file:. ${error}`,
        });
    }
}

const updateScopeCert = async (req: Request, res: Response) => {
    try {
        const data = {
            country_id: req.body.countryId,
            state_id: req.body.stateId,
            brand_id: req.body.brandId,
            farmGroup_id: req.body.farmGroupId,
            ics_id: req.body.icsId,
            validity_end: req.body.validityEnd,
            standard: req.body.standard,
            document: req.body.document
        };
        const scopeCert = await ScopeCert.update(data, {
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, scopeCert);
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const deleteScopeCert = async (req: Request, res: Response) => {
    try {
        const scopeCert = await ScopeCert.destroy({
            where: {
                id: req.body.id
            }
        });
        res.sendSuccess(res, { scopeCert });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}


export {
    createScopeCert,
    fetchScopeCertPagination,
    fetchScopeCert,
    updateScopeCert,
    deleteScopeCert
};