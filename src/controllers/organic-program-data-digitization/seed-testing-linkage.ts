import { Request, Response } from "express";
import { Op } from "sequelize";
import SeedTestingLinkage from "../../models/seed-testing-linkage.model";
import Season from "../../models/season.model";
import SeedCompany from "../../models/seed-company.model";
import LabMaster from "../../models/lab-master.model";
import SeedTestingLinkageReport from "../../models/seed-testing-linkage-report.model";

const createSeedTestingLinkage = async (req: Request, res: Response) => {
    try {
        const data = {
            season_id: req.body.season_id,
            seed_company_id: req.body.seed_company_id,
            lotno: req.body.lotno,
            variety: req.body.variety,
            packets: req.body.packets,
            district: req.body.district,
            state: req.body.state,
            testing_code: req.body.testing_code,
            seal_no: req.body.seal_no,
            date_sending_sample: req.body.date_sending_sample,
            date_of_report: req.body.date_of_report,
            report_no: req.body.report_no,
            nos: req.body.nos,
            thirtyfives: req.body.thirtyfives,
            result_of_lab: req.body.result_of_lab,
            lab_master_id: req.body.lab_master_id
        };
        const seedTestingLinkage = await SeedTestingLinkage.create(data);
        res.sendSuccess(res, seedTestingLinkage);
    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const fetchSeedTestingLinkagePagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    const sortOrder = req.query.sort || 'desc';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const seed_company_id = Number(req.query.seed_company_id);

    try {
        const whereCondition: any = {};
        const includeRelations = [
            {
                model: Season,
                as: "season",
            },
            {
                model: SeedCompany,
                as: "seed_company"
            },
            {
                model: LabMaster,
                as: "lab_master"
            }
        ];

        if (searchTerm) {
            whereCondition[Op.or] = [
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$seed_company.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { lotno: { [Op.iLike]: `%${searchTerm}%` } },
                { variety: { [Op.iLike]: `%${searchTerm}%` } },
                { packets: { [Op.iLike]: `%${searchTerm}%` } },
                { district: { [Op.iLike]: `%${searchTerm}%` } },
                { state: { [Op.iLike]: `%${searchTerm}%` } },
                { testing_code: { [Op.iLike]: `%${searchTerm}%` } },
                { seal_no: { [Op.iLike]: `%${searchTerm}%` } },
                { report_no: { [Op.iLike]: `%${searchTerm}%` } },
                { nos: { [Op.iLike]: `%${searchTerm}%` } },
                { thirtyfives: { [Op.iLike]: `%${searchTerm}%` } },
                { result_of_lab: { [Op.iLike]: `%${searchTerm}%` } },
                { '$lab_master.name$': { [Op.iLike]: `%${searchTerm}%` } }
            ];
        }

        if (seed_company_id) {
            whereCondition[Op.or] = {
                seed_company_id: { [Op.eq]: seed_company_id }
            };
        }

        if (req.query.pagination === "true") {
            let { count, rows } = await SeedTestingLinkage.findAndCountAll({
                where: whereCondition,
                include: includeRelations,
                order: [
                    ['id', sortOrder]
                ],
                offset: offset,
                limit: limit
            });

            let rowsPromises = rows.map(async (data: any) => {
                try {
                    data = data.toJSON();
                    const seedTestingLinkageReports = await SeedTestingLinkageReport.findAll({
                        where: { seed_testing_linkage_id: data.id }
                    });
                    return { ...data, seed_testing_linkage_reports: seedTestingLinkageReports };
                } catch (error) {
                    return { ...data, seed_testing_linkage_reports: [] };
                }
            });
            rows = await Promise.all(rowsPromises);

            return res.sendPaginationSuccess(res, rows, count);
        } else {
            let seedTestingLinkage = await SeedTestingLinkage.findAll({
                where: whereCondition,
                include: includeRelations,
                order: [
                    ['id', sortOrder]
                ],
            });

            let seedTestingLinkagePromises = seedTestingLinkage.map(async (data: any) => {
                try {
                    data = data.toJSON();
                    const seedTestingLinkageReports = await SeedTestingLinkageReport.findAll({
                        where: { seed_testing_linkage_id: data.id }
                    });
                    return { ...data, seed_testing_linkage_reports: seedTestingLinkageReports };
                } catch (error) {
                    return { ...data, seed_testing_linkage_reports: [] };
                }
            });
            seedTestingLinkage = await Promise.all(seedTestingLinkagePromises);

            return res.sendSuccess(res, seedTestingLinkage);
        }
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

const fetchSeedTestingLinkage = async (req: Request, res: Response) => {
    try {
        const includeRelations = [
            {
                model: Season,
                as: "season",
            },
            {
                model: SeedCompany,
                as: "seed_company"
            },
            {
                model: LabMaster,
                as: "lab_master"
            }
        ];

        let seedTestingLinkage = (await SeedTestingLinkage.findOne({
            where: { id: req.params.id },
            include: includeRelations
        })).toJSON();

        const seedTestingLinkageReports = await SeedTestingLinkageReport.findAll({
            where: { seed_testing_linkage_id: seedTestingLinkage.id }
        });
        seedTestingLinkage = { ...seedTestingLinkage, seed_testing_linkage_reports: seedTestingLinkageReports };

        return res.sendSuccess(res, seedTestingLinkage);
    } catch (error) {
        console.error(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const updateSeedTestingLinkage = async (req: Request, res: Response) => {
    try {
        const seedTestingLinkage = await SeedTestingLinkage.update({
            season_id: req.body.season_id,
            seed_company_id: req.body.seed_company_id,
            lotno: req.body.lotno,
            variety: req.body.variety,
            packets: req.body.packets,
            district: req.body.district,
            state: req.body.state,
            testing_code: req.body.testing_code,
            seal_no: req.body.seal_no,
            date_sending_sample: req.body.date_sending_sample,
            date_of_report: req.body.date_of_report,
            report_no: req.body.report_no,
            nos: req.body.nos,
            thirtyfives: req.body.thirtyfives,
            result_of_lab: req.body.result_of_lab,
            lab_master_id: req.body.lab_master_id
        }, {
            where: { id: req.body.id }
        });

        res.sendSuccess(res, { seedTestingLinkage });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const deleteSeedTestingLinkage = async (req: Request, res: Response) => {
    try {
        const seedTestingLinkage = await SeedTestingLinkage.destroy({
            where: { id: req.body.id }
        });
        res.sendSuccess(res, { seedTestingLinkage });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const deleteSeedTestingLinkageReport = async (req: Request, res: Response) => {
    try {
        const seedTestingLinkageReport = await SeedTestingLinkageReport.destroy({
            where: { id: req.body.id }
        });
        res.sendSuccess(res, { seedTestingLinkageReport });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

export {
    createSeedTestingLinkage,
    fetchSeedTestingLinkagePagination,
    fetchSeedTestingLinkage,
    updateSeedTestingLinkage,
    deleteSeedTestingLinkage,
    deleteSeedTestingLinkageReport
}