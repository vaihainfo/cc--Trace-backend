import { Request, Response } from "express";
import UserRegistrations from "../../models/user-registrations.model";
import UserApp from "../../models/users-app.model";
import { Sequelize, Op } from "sequelize";
import Village from "../../models/village.model";
import Block from "../../models/block.model";
import District from "../../models/district.model";
import State from "../../models/state.model";
import Country from "../../models/country.model";
import Farmer from "../../models/farmer.model";
import Program from "../../models/program.model";
import Brand from "../../models/brand.model";
import Ginner from "../../models/ginner.model";
import CropGrade from "../../models/crop-grade.model";
import Farm from "../../models/farm.model";
import Season from "../../models/season.model";
import Transaction from "../../models/transaction.model";
import { generateTokens } from "../../util/auth";
import hash from "../../util/hash";
import sequelize from "../../util/dbConn";
import { decrypt, encrypt } from "../../provider/qrcode";

const getRegisteredDevices = async (req: Request, res: Response) => {
    try {
        const searchTerm = req.query.search || "";
        const sortOrder = req.query.sort || "desc";
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const whereCondition: any = {}
        if (searchTerm) {
            whereCondition[Op.or] = [
                { username: { [Op.iLike]: `%${searchTerm}%` } },
                { firstName: { [Op.iLike]: `%${searchTerm}%` } },
                { lastName: { [Op.iLike]: `%${searchTerm}%` } },
                { mobile_no: { [Op.iLike]: `%${searchTerm}%` } },
                { email: { [Op.iLike]: `%${searchTerm}%` } },
                { access_level: { [Op.iLike]: `%${searchTerm}%` } },
                { "$registrations.device_id$": { [Op.iLike]: `%${searchTerm}%` } }
            ];
        }
        if (req.query.pagination === "true") {
            const { count, rows } = await UserApp.findAndCountAll({
                attributes: [
                    'id', 'username', 'firstName',
                    'lastName', 'mobile_no', 'email', 'access_level', 'status',
                    [Sequelize.col('registrations.device_id'), 'device_id']
                ],
                where: whereCondition,
                include: [{
                    model: UserRegistrations,
                    as: 'registrations',
                    attributes: []
                }],
                order: [
                    ['id', 'desc']
                ],
                limit: limit,
                offset: offset
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const data = await UserApp.findAll({
                attributes: [
                    'id', 'username', 'firstName',
                    'lastName', 'mobile_no', 'email', 'access_level', 'status',
                    [Sequelize.col('registrations.device_id'), 'device_id']
                ],
                where: whereCondition,
                order: [
                    ['id', 'desc']
                ],
                include: [{
                    model: UserRegistrations,
                    as: 'registrations',
                    attributes: []
                }]
            });
            res.sendSuccess(res, data)
        }

    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.meessage);
    }
}

const getRegisteredOne = async (req: Request, res: Response) => {
    try {
        const data = await UserApp.findOne({
            include: [{
                model: UserRegistrations,
                as: 'registrations'
            }],
            where: { id: req.query.id }
        });
        res.sendSuccess(res, data)
    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.meessage);
    }
}

const getUnRegisteredDevices = async (req: Request, res: Response) => {
    try {
        const data = await UserRegistrations.findAll({
            where: {
                status: false
            }
        });
        res.sendSuccess(res, data)
    }  catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }
}

const getUnRegisteredOne = async (req: Request, res: Response) => {
    try {
        const data = await UserRegistrations.findOne({
            where: { id: req.query.id }
        });
        res.sendSuccess(res, data)
    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.meessage);
    }
}

const agentLogin = async (req: Request, res: Response) => {
    try {
        if (!req.body.username) {
            return res.sendError(res, 'Please enter a user name')
        } else if (!req.body.password) {
            return res.sendError(res, 'Please enter a password')
        } else if (!req.body.deviceId) {
            return res.sendError(res, 'Please enter a device Id')
        }
        const user = await UserApp.findOne({
            include: [{
                model: UserRegistrations,
                as: 'registrations',
                attributes: [],
                where: {
                    status: true,
                    device_id: req.body.username !== 'admin' ? req.body.deviceId : null
                }
            }],
            where: {
                username: req.body.username,
            }
        });
        if (!user) {
            return res.sendError(res, "Invalid username or deviceId");
        }
        let verifyPassword = await hash.compare(req.body.password, user.dataValues.password)
        if (!verifyPassword) { return res.sendError(res, "Invalid Password"); };
        var { accessToken } = await generateTokens(user.dataValues.id, user.dataValues.access_level);
        return res.sendSuccess(res, { accessToken, user })
    }  catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }

}

const profile = async (req: Request, res: Response) => {
    try {
        if (!req.query.id) {
            return res.sendError(res, 'Please send user id')
        }
        const data = await UserApp.findOne({
            include: [{
                model: UserRegistrations,
                as: 'registrations'
            }],
            where: { id: req.query.id }
        });
        res.sendSuccess(res, data)
    }  catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }
}

const fetchAgentTransactions = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const sortOrder = req.query.sort || "desc";
    //   const sortField = req.query.sortBy || '';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status: string = req.query.status as string;
    const countryId: string = req.query.countryId as string;
    const brandId: string = req.query.brandId as string;
    const farmGroupId: string = req.query.farmGroupId as string;
    const seasonId: string = req.query.seasonId as string;
    const programId: string = req.query.programId as string;
    const ginnerId: string = req.query.ginnerId as string;
    const farmerId: string = req.query.farmerId as string;
    const villageId: string = req.query.villageId as string;
    const { endDate, startDate, transactionVia }: any = req.query;
    const whereCondition: any = {};

    try {
        // apply filters
        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id) => parseInt(id, 10));
            whereCondition.country_id = { [Op.in]: idArray };
        }

        if (villageId) {
            const idArray: number[] = villageId
                .split(",")
                .map((id) => parseInt(id, 10));
            whereCondition.village_id = { [Op.in]: idArray };
        }

        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id) => parseInt(id, 10));
            whereCondition.brand_id = { [Op.in]: idArray };
        }
        if (farmGroupId) {
            const idArray: number[] = farmGroupId
                .split(",")
                .map((id) => parseInt(id, 10));
            whereCondition["$farmer.farmGroup_id$"] = { [Op.in]: idArray };
        }
        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id) => parseInt(id, 10));
            whereCondition.season_id = { [Op.in]: idArray };
        }

        if (farmerId) {
            const idArray: number[] = farmerId
                .split(",")
                .map((id) => parseInt(id, 10));
            whereCondition.farmer_id = { [Op.in]: idArray };
        }

        if (programId) {
            const idArray: number[] = programId
                .split(",")
                .map((id) => parseInt(id, 10));
            whereCondition.program_id = { [Op.in]: idArray };
        }

        if (ginnerId) {
            const idArray: number[] = ginnerId
                .split(",")
                .map((id) => parseInt(id, 10));
            whereCondition.mapped_ginner = { [Op.in]: idArray };
        }
        whereCondition.agent_id = { [Op.not]: null }
        if (startDate && endDate) {
            const startOfDay = new Date(startDate);
            startOfDay.setUTCHours(0, 0, 0, 0);
            const endOfDay = new Date(endDate);
            endOfDay.setUTCHours(23, 59, 59, 999);
            whereCondition.date = { [Op.between]: [startOfDay, endOfDay] }
        }

        if (status) {
            whereCondition.status = status;
        }

        // apply search
        if (searchTerm) {
            whereCondition[Op.or] = [
                { farmer_code: { [Op.iLike]: `%${searchTerm}%` } },
                { total_amount: { [Op.iLike]: `%${searchTerm}%` } },
                { "$block.block_name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$country.county_name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$state.state_name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$village.village_name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$district.district_name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$brand.brand_name$": { [Op.iLike]: `%${searchTerm}%` } },
                { farmer_name: { [Op.iLike]: `%${searchTerm}%` } },
                { "$program.program_name$": { [Op.iLike]: `%${searchTerm}%` } },
                { "$ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
            ];
        }

        let queryOptions: any = {
            where: whereCondition,
            include: [
                {
                    model: Village,
                    as: "village",
                    attributes: ['id', 'village_name']
                },
                {
                    model: Block,
                    as: "block",
                    attributes: ['id', 'block_name']
                },
                {
                    model: District,
                    as: "district",
                    attributes: ['id', 'district_name']
                },
                {
                    model: State,
                    as: "state",
                    attributes: ['id', 'state_name']
                },
                {
                    model: Country,
                    as: "country",
                    attributes: ['id', 'county_name']
                },
                {
                    model: Farmer,
                    as: "farmer",
                },
                {
                    model: Program,
                    as: "program",
                    attributes: ['id', 'program_name']
                },
                {
                    model: Brand,
                    as: "brand",
                    attributes: ['id', 'brand_name']
                },
                {
                    model: Ginner,
                    as: "ginner",
                    attributes: ['id', 'name', 'address']
                },
                {
                    model: CropGrade,
                    as: "grade",
                    attributes: ['id', 'cropGrade']
                },
                {
                    model: Season,
                    as: "season",
                    attributes: ['id', 'name']
                },
                {
                    model: Farm,
                    as: "farm"
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

            const { count, rows } = await Transaction.findAndCountAll(queryOptions);

            // Fetch ginner data for each mapped_ginner ID
            //   const transactionsWithGinner = await Promise.all(
            //     rows.map(async (transaction: any) => {
            //       if (transaction.mapped_ginner) {
            //         const ginner = await Ginner.findByPk(transaction.mapped_ginner);
            //         console.log(ginner)
            //         return { ...transaction.toJSON(), ginner };
            //       }
            //       return transaction.toJSON();
            //     })
            //   );

            return res.sendPaginationSuccess(res, rows, count);
        } else {
            // fetch without filters
            const transaction = await Transaction.findAll(queryOptions);
            return res.sendSuccess(res, transaction);
        }
    }  catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }
};

const fetchQrDashboard = async (req: Request, res: Response) => {
    const { villageId, programId, seasonId, brandId, countryId, stateId, blockId, districtId }: any = req.query;
    const whereCondition: any = {};

    try {
        // apply filters
        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.country_id = { [Op.in]: idArray };
        }

        if (villageId) {
            const idArray: number[] = villageId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.village_id = { [Op.in]: idArray };
        }

        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.brand_id = { [Op.in]: idArray };
        }

        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.season_id = { [Op.in]: idArray };
        }

        if (programId) {
            const idArray: number[] = programId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.program_id = { [Op.in]: idArray };
        }
        let [data, qty_purchased, first, second, third, fourth, fifth]: any = await Promise.all([sequelize.query(
            `SELECT sum(estimated_cotton) as estimatedCotton
            FROM transactions 
            INNER JOIN farmers ON transactions.farmer_id=farmers.id
            INNER JOIN farms ON transactions.farm_id=farms.id`,
        ),
        sequelize.query(
            `SELECT sum(CAST(qty_purchased AS DOUBLE PRECISION)) as seedCotton
            FROM transactions 
            INNER JOIN farmers ON transactions.farmer_id=farmers.id
            INNER JOIN farms ON transactions.farm_id=farms.id
            where transactions.agent_id IS NOT NULL`,
        ),
        sequelize.query(`SELECT count(*) as totalfarmer
        FROM farmers
        LEFT JOIN transactions  ON transactions.farmer_id=farmers.id
        LEFT JOIN farms ON transactions.farm_id=farms.id`),
        sequelize.query(`SELECT count(*) as second
        FROM farmers
        LEFT JOIN transactions ON transactions.farmer_id=farmers.id
        LEFT JOIN farms ON transactions.farm_id=farms.id
        where transactions.agent_id IS NOT NULL`),
        sequelize.query(`SELECT COUNT(*) as third FROM (
            SELECT transactions.district_id, transactions.block_id, transactions.village_id, transactions.program_id, transactions.farmer_id, COUNT(transactions.farmer_id), farmers.brand_id, farms.season_id 
            FROM transactions
            LEFT JOIN farmers ON transactions.farmer_id=farmers.id
            LEFT JOIN farms ON transactions.farm_id=farms.id
            where transactions.agent_id IS NOT NULL
            group by transactions.district_id, transactions.block_id, transactions.village_id, transactions.program_id, transactions.farmer_id, farmers.brand_id, farms.season_id having COUNT(transactions.farmer_id)=1 ) AS DerivedTableAlias`),
        sequelize.query(`SELECT COUNT(*) as fourth FROM (
                SELECT transactions.district_id, transactions.block_id, transactions.village_id, transactions.program_id, transactions.farmer_id, COUNT(transactions.farmer_id), farmers.brand_id, farms.season_id 
                FROM transactions
                LEFT JOIN farmers ON transactions.farmer_id=farmers.id
                LEFT JOIN farms ON transactions.farm_id=farms.id
                where transactions.agent_id IS NOT NULL
                group by transactions.district_id, transactions.block_id, transactions.village_id, transactions.program_id, transactions.farmer_id, farmers.brand_id, farms.season_id having COUNT(transactions.farmer_id)=2 ) AS DerivedTableAlias`),
        sequelize.query(`SELECT COUNT(*) as fifth FROM (
                    SELECT transactions.district_id, transactions.block_id, transactions.village_id, transactions.program_id, transactions.farmer_id, COUNT(transactions.farmer_id), farmers.brand_id, farms.season_id 
                    FROM transactions
                    LEFT JOIN farmers ON transactions.farmer_id=farmers.id
                    LEFT JOIN farms ON transactions.farm_id=farms.id
                    where transactions.agent_id IS NOT NULL
                    group by transactions.district_id, transactions.block_id, transactions.village_id, transactions.program_id, transactions.farmer_id, farmers.brand_id, farms.season_id having COUNT(transactions.farmer_id)=3 ) AS DerivedTableAlias`)
        ])

        res.sendSuccess(res, {
            ...data[0][0], ...qty_purchased[0][0],
            ...first[0][0], ...second[0][0],
            ...third[0][0], ...fourth[0][0],
            ...fifth[0][0]
        })

    }  catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }
};

const farmerByQrCode = async (req: Request, res: Response) => {
    try {
        if (!req.query.text) {
            return res.sendError(res, "Need query text");
        }
        let data: any = decrypt(req.query.text);
        let farmer = await Farmer.findOne({
            where: { id: data },
            include: [
                {
                    model: Program,
                    as: "program",
                    attributes: ["id", "program_name"],
                },
                {
                    model: Brand,
                    as: "brand",
                    attributes: ["id", "brand_name", "address"],
                },
                {
                    model: Country,
                    as: "country",
                    attributes: ["id", "county_name"],
                },
                {
                    model: Village,
                    as: "village",
                    attributes: ["id", "village_name"],
                },
                {
                    model: State,
                    as: "state",
                    attributes: ["id", "state_name"],
                },
                {
                    model: District,
                    as: "district",
                    attributes: ["id", "district_name"],
                },
                {
                    model: Block,
                    as: "block",
                    attributes: ["id", "block_name"]
                }
            ]
        });
        if (!farmer) {
            return res.sendError(res, "NO_FARMER_FOUND");
        }
        let farm = await Farm.findAll({ where: { farmer_id: farmer.dataValues.id } })
        return res.sendSuccess(res, { ...farmer.dataValues, farm });
    }  catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }
}

const createUserApp = async (req: Request, res: Response) => {
    try {
        const data = {
            username:req.body.username,
            password: await hash.generate(req.body.password),
            firstname: req.body.firstName || "",
            lastname: req.body.lastName || "",
            mobile: req.body.mobile,
            access_level: req.body.accessLevel,
            user_reg_id: req.body.userRegId,
            email: req.body.email,
            program: req.body.programId,
            agent_id: req.body.agentId,
            ginner_id: req.body.ginnerId,
            spinner_id: req.body.spinnerId,
            weaver_id: req.body.weaverId,
            knitter_id: req.body.knitterId,
            garment_id: req.body.garmentId,
            acs_country_id: req.body.country,
            acs_state_id: req.body.state,
            acs_district: req.body.districtsId,
            acs_block: req.body.blocksId,
            acs_village: req.body.villagesId,
            acs_ginner: req.body.acsGinner,
            acs_brand: req.body.brandId,
            platform: req.body.platform,
            status: req.body.status,
        }

        const userApp = await UserApp.create(data);
        return res.sendSuccess(res, userApp)
    }  catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);
    }
}

export {
    getRegisteredDevices,
    getUnRegisteredDevices,
    getRegisteredOne,
    getUnRegisteredOne,
    fetchAgentTransactions,
    agentLogin,
    profile,
    fetchQrDashboard,
    farmerByQrCode,
}