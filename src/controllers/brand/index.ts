import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import Brand from "../../models/brand.model";
import User from "../../models/user.model";
import hash from "../../util/hash";
import Program from "../../models/program.model";
import Country from "../../models/country.model";
import UserRole from "../../models/user-role.model";
import Farm from "../../models/farm.model";
import Farmer from "../../models/farmer.model";
import sequelize from "../../util/dbConn";
import Transaction from "../../models/transaction.model";
import Season from "../../models/season.model";
import GinSales from "../../models/gin-sales.model";
import Spinner from "../../models/spinner.model";
import Ginner from "../../models/ginner.model";
import SpinSales from "../../models/spin-sales.model";
import KnitSales from "../../models/knit-sales.model";
import Knitter from "../../models/knitter.model";
import WeaverSales from "../../models/weaver-sales.model";
import Weaver from "../../models/weaver.model";
import GarmentSales from "../../models/garment-sales.model";
import GarmentSelection from "../../models/garment-selection.model";
import GarmentFabricType from "../../models/garment_fabric_type.model";
import Garment from "../../models/garment.model";
import FabricSelection from "../../models/fabric-selections.model";
import GinProcess from "../../models/gin-process.model";
import SpinProcess from "../../models/spin-process.model";
import BaleSelection from "../../models/bale-selection.model";
import GinBale from "../../models/gin-bale.model";

const createBrand = async (req: Request, res: Response) => {
    try {
        let userIds = [];
        for await (let user of req.body.userData) {
            const userData = {
                firstname: user.firstname,
                lastname: user.lastname ? user.lastname : "",
                position: user.position,
                email: user.email,
                mobile: user.mobile,
                password: await hash.generate(user.password),
                status: user.status,
                username: user.username,
                role: user.role,
                ticketApproveAccess: user.ticketApproveAccess,
                ticketCountryAccess: user.ticketCountryAccess,
                ticketAccessOnly: user.ticketAccessOnly,
            };
            const result = await User.create(userData);
            userIds.push(result.id);
        }
        const brandData = {
            brand_name: req.body.name,
            email: req.body.email,
            address: req.body.address,
            programs_id: req.body.programsIds,
            website: req.body.website,
            countries_id: req.body.countriesIds,
            contact_person: req.body.contactPerson,
            company_info: req.body.companyInfo,
            mobile: req.body.mobile,
            landline: req.body.landline,
            logo: req.body.logo,
            photo: req.body.photo,
            brandUser_id: userIds,
        };
        const brand = await Brand.create(brandData);
        res.sendSuccess(res, brand);
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message, error);
    }
};

const findUser = async (req: Request, res: Response) => {
    try {
        let user
        if (req.body.username) {
            if (req.body.id) {
                user = await User.findOne({ where: { username: { [Op.iLike]: req.body.username }, id: { [Op.ne]: req.body.id } } })
            } else {
                user = await User.findOne({ where: { username: { [Op.iLike]: req.body.username } } })
            }

        } else {
            if (req.body.id) {
                user = await User.findOne({ where: { email: req.body.email, id: { [Op.ne]: req.body.id } } })
            } else {
                user = await User.findOne({ where: { email: req.body.email } })
            }
        }
        return res.sendSuccess(res, { user: user ? true : false });
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
}

const fetchBrandPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const sortOrder = req.query.sort || "asc";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const programId: any = req.query.programId;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (programId) {
            const idArray: number[] = programId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.programs_id = { [Op.overlap]: idArray };
        }
        if (searchTerm) {
            whereCondition[Op.or] = [
                { brand_name: { [Op.iLike]: `%${searchTerm}%` } }, // Search by name
                { address: { [Op.iLike]: `%${searchTerm}%` } }, // Search by address
                { email: { [Op.iLike]: `%${searchTerm}%` } }, // Search by contry
                { contact_person: { [Op.iLike]: `%${searchTerm}%` } }, // Search by contact person
                { website: { [Op.iLike]: `%${searchTerm}%` } }, // Search by mobile
                { mobile: { [Op.iLike]: `%${searchTerm}%` } }, // Search by email
                { landline: { [Op.iLike]: `%${searchTerm}%` } }, // Search by email
            ];
        }
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows: brands } = await Brand.findAndCountAll({
                where: whereCondition,
                order: [
                    ["brand_name", sortOrder], // Sort the results based on the 'name' field and the specified order
                ],
                offset: offset,
                limit: limit,
            });
             // Get all unique program IDs from all brands
                const allProgramIds = [...new Set(brands.flatMap((brand: any) => brand.programs_id || []))];
                
                // Fetch all required programs in one query
                const programs = await Program.findAll({
                    where: {
                        id: { [Op.in]: allProgramIds }
                    },
                    attributes: ['id', 'program_name']
                });

                // Create programs lookup map
                const programsMap = new Map(programs.map((p: any) => [p.id, p]));

                // Map programs to brands
                const brandsWithPrograms = brands.map((brand: any) => ({
                    ...brand.toJSON(),
                    programs: (brand.programs_id || []).map((id: any) => programsMap.get(id))
                }));
            return res.sendPaginationSuccess(res, brandsWithPrograms, count);
        } else {
            const brands = await Brand.findAll({
                where: whereCondition,
                order: [
                    ["brand_name", sortOrder], // Sort the results based on the 'name' field and the specified order
                ],
            });
            // Get all unique program IDs from all brands
            const allProgramIds = [...new Set(brands.flatMap((brand: any) => brand.programs_id || []))];
            
            // Fetch all required programs in one query
            const programs = await Program.findAll({
                where: {
                    id: { [Op.in]: allProgramIds }
                },
                attributes: ['id', 'program_name']
            });

            // Create programs lookup map
            const programsMap = new Map(programs.map((p: any) => [p.id, p]));

            // Map programs to brands
            const brandsWithPrograms = brands.map((brand: any) => ({
                ...brand.toJSON(),
                programs: (brand.programs_id || []).map((id: any) => programsMap.get(id))
            }));
            return res.sendSuccess(res, brandsWithPrograms);
        }
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message, error);
    }
};

const fetchBrandById = async (req: Request, res: Response) => {
    try {
        //fetch data for single brand
        const brand = await Brand.findOne({
            where: { id: req.params.id },
        });
        if (!brand) {
            return res.sendError(res, "ERR_BRAND_NOT_EXISTS");
        }
        const userData = await User.findAll({
            where: { id: brand.brandUser_id },
            attributes: {
                exclude: ["password", "createdAt", "updatedAt"],
            },
            include: [
                {
                    model: UserRole,
                    as: "user_role",
                    include: [
                        {
                            model: Brand,
                            as: 'brand',
                            attributes: ['id', 'brand_name'],
                        }
                    ]
                },
            ],
        });

        const programs = await Program.findAll({
            where: { id: brand.programs_id },
        });

        const countries = await Country.findAll({
            where: { id: brand.countries_id },
        });

        const brandInfo = {
            ...brand.dataValues,
            userData,
            programs,
            countries,
        };
        return res.sendSuccess(res, brandInfo);
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message, error);
    }
};

const updateBrand = async (req: Request, res: Response) => {
    try {
        let userIds = [];
        for await (let user of req.body.userData) {
            const userData = {
                firstname: user.firstname,
                lastname: user.lastname ? user.lastname : "",
                position: user.position,
                email: user.email,
                mobile: user.mobile,
                password: user.password
                    ? await hash.generate(user.password)
                    : undefined,
                status: user.status,
                username: user.username,
                role: user.role,
                ticketApproveAccess: user.ticketApproveAccess,
                ticketCountryAccess: user.ticketCountryAccess,
                ticketAccessOnly: user.ticketAccessOnly,
            };
            if (user.id) {
                const result = await User.update(userData, { where: { id: user.id } });
                userIds.push(user.id);
            } else {
                const result = await User.create({
                    ...userData,
                    username: user.username,
                    email: user.email,
                });
                userIds.push(result.id);
            }
        }
        const data = {
            brand_name: req.body.name,
            email: req.body.email,
            address: req.body.address,
            programs_id: req.body.programsIds,
            website: req.body.website,
            countries_id: req.body.countriesIds,
            contact_person: req.body.contactPerson,
            company_info: req.body.companyInfo,
            mobile: req.body.mobile,
            landline: req.body.landline,
            logo: req.body.logo,
            photo: req.body.photo,
            brandUser_id: userIds,
        };
        const result = await Brand.update(data, { where: { id: req.body.id } });
        res.sendSuccess(res, result);
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message, error);
    }
};

const deleteBrand = async (req: Request, res: Response) => {
    try {
        const brand = await Brand.destroy({
            where: {
                id: req.body.id,
            },
        });
        res.sendSuccess(res, { brand });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const checkBrand = async (req: Request, res: Response) => {
    try {
        let whereCondition = {};
        if (req.body.id) {
            whereCondition = {
                brand_name: { [Op.iLike]: req.body.name },
                id: { [Op.ne]: req.body.id }
            }
        } else {
            whereCondition = {
                brand_name: { [Op.iLike]: req.body.name },
            }
        }

        const brand = await Brand.findOne({
            where: whereCondition
        });
        res.sendSuccess(res, brand ? { exist: true } : { exist: false });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const organicCottonOverview = async (req: Request, res: Response) => {
    try {
        let brandId = req.query.brandId;
        let seasonId = req.query.seasonId;
        if (!brandId) {
            return res.sendError(res, 'NEED_BRAND_ID')
        }
        let whereCondition: any = {};
        if (req.query.seasonId) {
            whereCondition.season_id = req.query.seasonId
        }
        const result = await Farm.findOne({
            where: { ...whereCondition, '$farmer.brand_id$': brandId },
            attributes: [
                [Sequelize.fn('COUNT', Sequelize.literal('DISTINCT farmer_id')), 'total_farmers'],
                [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('farms.cotton_total_area')), 0), 'total_area'],
                [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('farms.total_estimated_cotton')), 0), 'total_expected_yield']
            ],
            include: [
                {
                    model: Farmer,
                    as: 'farmer',
                    attributes: []
                }
            ],
            group: ['farmer.brand_id']
        });
        // const trans = await Transaction.findOne({
        //     attributes: [
        //         [sequelize.fn('sum', Sequelize.literal("CAST(qty_purchased AS DOUBLE PRECISION)")), 'total_procured']
        //     ],
        //     where: {
        //         ...whereCondition,
        //         brand_id: brandId,
        //         status: 'Sold'
        //     }
        // })

        const graph = await Farm.findAll({
            where: { '$farmer.brand_id$': brandId },
            attributes: [
                [Sequelize.fn('COUNT', Sequelize.literal('DISTINCT farmer_id')), 'total_farmers'],
                [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('farms.cotton_total_area')), 0), 'total_area'],
                [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('farms.total_estimated_cotton')), 0), 'total_expected_yield']
            ],
            include: [
                {
                    model: Season,
                    as: 'season',
                    attributes: ['id', 'name']
                },
                {
                    model: Farmer,
                    as: 'farmer',
                    attributes: []
                }
            ],
            group: ['season.id', 'farmer.brand_id']
        });
        let total_lint = await sumbrandginnerSales(brandId, seasonId);
        let total_yarn = await sumbrandspinnerYarnSales(brandId, seasonId);
        let total_knit = await sumbrandknitterFabricSales(brandId, seasonId);
        let total_weave = await sumbrandWeaverFabricSales(brandId, seasonId);
        let total_garment = await sumbrandgarmentFabricSales(brandId, seasonId);
        res.sendSuccess(res, {
            total_farmers: result?.dataValues.total_farmers ? result?.dataValues.total_farmers : 0,
            total_procured: result?.dataValues.total_expected_yield ? result?.dataValues.total_expected_yield : 0,
            total_knit: total_knit ? total_knit : 0,
            total_weave: total_weave ? total_weave : 0,
            total_lint: total_lint ? total_lint : 0,
            total_yarn: total_yarn ? total_yarn : 0,
            total_garment: total_garment ? total_garment : 0,
            graph: graph
        });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const organicCottonSpecialUsersOverview = async (req: Request, res: Response) => {
    try {
        let brandId = req.query.brandId;
        let seasonId = req.query.seasonId;
        if (!brandId) {
            return res.sendError(res, 'NEED_BRAND_ID')
        }
        let whereCondition: any = {};
        if (req.query.seasonId) {
            whereCondition.season_id = req.query.seasonId
        }

        let total_lint_procured = await sumbrandginnerProcured(brandId, seasonId);
        let total_lint_sold = await sumbrandginnerSales(brandId, seasonId);
        // let total_lint_stock = await sumbrandginnerStock(brandId, seasonId);
        let total_lint_stock = Number(total_lint_procured) > Number(total_lint_sold) ?Number(total_lint_procured) - Number(total_lint_sold) : 0;
        
        let total_yarn_procured = await sumbrandspinnerYarnProcured(brandId, seasonId);
        let total_yarn_sold = await sumbrandspinnerYarnSales(brandId, seasonId);
        // let total_yarn_stock = await sumbrandspinnerYarnStock(brandId, seasonId);
        let total_yarn_stock = Number(total_yarn_procured) > Number(total_yarn_sold) ? Number(total_yarn_procured) - Number(total_yarn_sold) : 0;

        res.sendSuccess(res, {
            total_lint_procured: total_lint_procured ? total_lint_procured : 0,
            total_lint_sold: total_lint_sold ? total_lint_sold : 0,
            total_lint_stock: total_lint_stock ? total_lint_stock : 0,
            total_yarn_procured: total_yarn_procured ? total_yarn_procured : 0,
            total_yarn_sold: total_yarn_sold ? total_yarn_sold : 0,
            total_yarn_stock: total_yarn_stock ? total_yarn_stock : 0,
        });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const sumbrandginnerProcured = async (brandId: any, seasonId: any) => {
    try {
        let cottonQty = 0;

        const [result] = await sequelize.query(
           `SELECT 
                COUNT(DISTINCT "gin-bales"."id") AS "procured",
                COALESCE(
                    SUM(
                    CASE
                        WHEN "gin-bales"."old_weight" IS NOT NULL THEN CAST("gin-bales"."old_weight" AS DOUBLE PRECISION)
                        ELSE CAST("gin-bales"."weight" AS DOUBLE PRECISION)
                    END
                    ),
                    0
                ) AS "lintProcured"
                FROM "gin-bales" AS "gin-bales"
                LEFT OUTER JOIN "gin_processes" AS "ginprocess" 
                ON "gin-bales"."process_id" = "ginprocess"."id"
                LEFT OUTER JOIN "seasons" AS "ginprocess->season" 
                ON "ginprocess"."season_id" = "ginprocess->season"."id"
                LEFT OUTER JOIN "ginners" AS "ginprocess->ginner" 
                ON "ginprocess"."ginner_id" = "ginprocess->ginner"."id"
                WHERE "ginprocess->ginner"."brand" && ARRAY[${Number(brandId)}]
                    ${seasonId ? `AND "ginprocess"."season_id" IN (${seasonId})` : `AND "ginprocess"."season_id" NOT IN (2,3)`}
                ;
        `)

          cottonQty = result && result.length > 0 ? result[0].lintProcured : 0
 
        return cottonQty / 1000;
    } catch (error) {
        console.log(error);
    }
}


const sumbrandginnerSales = async (brandId: any, seasonId: any) => {
    try {
        const whereCondition: any = [];

        if (brandId) {
            const idArray: number[] = brandId
              .split(",")
              .map((id: any) => parseInt(id, 10));
            whereCondition.push(`g.brand && ARRAY[${idArray.join(',')}]`);
          }

          if (seasonId) {
            const idArray = seasonId.split(",").map((id: any) => parseInt(id, 10));
            whereCondition.push(`gs.season_id IN (${idArray.join(',')})`);
          }
          else {
            whereCondition.push(`gs.season_id NOT IN (2,3)`);
          }

          whereCondition.push(`gs.status <> 'To be Submitted'`);
          whereCondition.push(`gs.id IS NOT NULL`);
    
          const whereClause = whereCondition.length > 0 ? `WHERE ${whereCondition.join(' AND ')}` : '';

        const [result] = await sequelize.query(`
            SELECT 
                SUM(gs.total_qty) AS total_qty
            FROM gin_sales gs
            LEFT JOIN ginners g ON gs.ginner_id = g.id
            LEFT JOIN (
                SELECT DISTINCT sales_id FROM bale_selections
            ) bs ON gs.id = bs.sales_id
            ${whereClause}`)

        let cottonQty = result && result.length > 0 ? result[0].total_qty : 0
 
        return cottonQty / 1000;
    } catch (error) {
        console.log(error);
    }
}

function convert_kg_to_mt(number: any) {
    return (number / 1000).toFixed(2);
  }
  const sumBrandginnerStock = async (brandId: any, seasonId: any) => {
    try {
        let whereCondition: any = {};
        const ginBaleWhere: any = {};
        const baleSelectionWhere: any = {};
        if (seasonId) {
            const idArray: number[] = seasonId
              .split(",")
              .map((id: any) => parseInt(id, 10));
            ginBaleWhere["$ginprocess.season_id$"] = { [Op.in]: idArray };
            baleSelectionWhere["$sales.season_id$"] = { [Op.in]: idArray };
          }

        const { count, rows } = await Ginner.findAndCountAll({
            where: {
                ...whereCondition,
                brand: { [Op.contains]: [Number(brandId)] }
            },
        });

        let result: any[] = [];

        for await (const ginner of rows) {
            const [lintProcured, lintSold]: any = await Promise.all([
                GinBale.findOne({
                    attributes: [
                        [
                            sequelize.fn(
                                "COALESCE",
                                sequelize.fn(
                                    "SUM",
                                    sequelize.literal(
                                        'CAST("gin-bales"."weight" AS DOUBLE PRECISION)'
                                    )
                                ),
                                0
                            ),
                            "qty",
                        ],
                        [
                            sequelize.fn(
                                "COUNT",
                                Sequelize.literal('DISTINCT "gin-bales"."id"')
                            ),
                            "bales_procured",
                        ],
                    ],
                    include: [
                        {
                            model: GinProcess,
                            as: "ginprocess",
                            attributes: [],
                        },
                    ],
                    where: {
                        ...ginBaleWhere,
                        "$ginprocess.ginner_id$": ginner.id,
                    },
                    group: ["ginprocess.ginner_id"],
                }),
                BaleSelection.findOne({
                    attributes: [
                        [
                            sequelize.fn(
                                "COALESCE",
                                sequelize.fn(
                                    "SUM",
                                    sequelize.literal(
                                        'CAST("bale"."weight" AS DOUBLE PRECISION)'
                                    )
                                ),
                                0
                            ),
                            "qty",
                        ],
                        [
                            sequelize.fn("COUNT", Sequelize.literal("DISTINCT bale_id")),
                            "bales_sold",
                        ],
                    ],
                    include: [
                        {
                            model: GinSales,
                            as: "sales",
                            attributes: [],
                        },
                        {
                            model: GinBale,
                            as: "bale",
                            attributes: [],
                        },
                    ],
                    where: {
                        ...baleSelectionWhere,
                        "$sales.ginner_id$": ginner.id,
                    },
                    group: ["sales.ginner_id"],
                }),
            ]);

            const obj: any = {
                lintProcuredMt: convert_kg_to_mt(lintProcured?.dataValues.qty ?? 0),
                lintSoldMt: convert_kg_to_mt(lintSold?.dataValues.qty ?? 0),
            };

            obj.lintStockMt =
                Number(obj.lintProcuredMt) > Number(obj.lintSoldMt)
                    ? Number(obj.lintProcuredMt) - Number(obj.lintSoldMt)
                    : 0;

            result.push({ ...obj, ginner });
        }

        let cottonQty = 0;

        result.forEach((value: any) => {
            cottonQty += value.lintStockMt;
        });

        return cottonQty;
    } catch (error:any) {
        throw new Error('Error in sumbrandginnerStock function: ' + error.message);
    }
};

const sumbrandginnerStock = async (brandId: any, seasonId: any | null) => {
    try {
      const query = `
        WITH
          filtered_ginners AS (
            SELECT
              g.id AS ginner_id
            FROM
              ginners g
            WHERE
              g.brand @> ARRAY[:brandId]::int[]
          ),
          gin_bale_data AS (
            SELECT
              gp.ginner_id,
              SUM(CAST(gb.weight AS DOUBLE PRECISION)) AS total_qty_procured
            FROM
              "gin-bales" gb
              JOIN gin_processes gp ON gb.process_id = gp.id
              JOIN filtered_ginners fg ON gp.ginner_id = fg.ginner_id
            WHERE
              (:seasonId IS NULL OR gp.season_id = ANY(string_to_array(:seasonId, ',')::int[]))
            GROUP BY
              gp.ginner_id
          ),
          bale_selection_data AS (
            SELECT
              gs.ginner_id,
              SUM(CAST(gb.weight AS DOUBLE PRECISION)) AS total_qty_sold
            FROM
              bale_selections bs
              JOIN gin_sales gs ON bs.sales_id = gs.id
              JOIN "gin-bales" gb ON bs.bale_id = gb.id
              JOIN filtered_ginners fg ON gs.ginner_id = fg.ginner_id
            WHERE
              (:seasonId IS NULL OR gs.season_id = ANY(string_to_array(:seasonId, ',')::int[]))
            GROUP BY
              gs.ginner_id
          )
        SELECT
          fg.ginner_id,
          COALESCE(gb.total_qty_procured, 0) / 1000 AS lint_procured_mt,
          COALESCE(bs.total_qty_sold, 0) / 1000 AS lint_sold_mt,
          CASE
            WHEN COALESCE(gb.total_qty_procured, 0) > COALESCE(bs.total_qty_sold, 0)
            THEN COALESCE(gb.total_qty_procured, 0) / 1000 - COALESCE(bs.total_qty_sold, 0) / 1000
            ELSE 0
          END AS lint_stock_mt
        FROM
          filtered_ginners fg
          LEFT JOIN gin_bale_data gb ON fg.ginner_id = gb.ginner_id
          LEFT JOIN bale_selection_data bs ON fg.ginner_id = bs.ginner_id;
      `;
  
      const data = await sequelize.query(query, {
        replacements: {
          brandId: Number(brandId),
          seasonId: seasonId || null
        },
        type: sequelize.QueryTypes.SELECT
      });
  
      // Sum the lint stock from all ginners
      let cottonQty = 0;
      data.forEach((row: any) => {
        cottonQty += Number(row.lint_stock_mt);
      });
  
      return cottonQty;
    } catch (error:any) {
      throw new Error('Error in sumBrandGinnerStock function: ' + error.message);
    }
  };
const sumbrandspinnerYarnProcured = async (brandId: any, seasonId: any) => {
    try {
        let whereCondition:any = {};
        
        
        if(seasonId){
            whereCondition.season_id = seasonId
        }
        else
        {
           whereCondition.season_id = { [Op.notIn]: [2,3] };

        }
        const data = await SpinProcess.findOne({
            attributes: [
              [Sequelize.literal('COALESCE(SUM(net_yarn_qty), 0)'), 'total_yarn_procured_mt']
            ],
            include: [
              {
                model: Spinner,
                as: 'spinner',
                attributes: [],
              },
            ],
            where: {
              '$spinner.brand$': { [Op.contains]: [Number(brandId)] }, // Check if brandId is in ginner.brand array
              ...whereCondition,
            },
            raw: true, // Ensures only the raw result is returned
          });

        let cottonQty = 0;
            cottonQty = data ? data.total_yarn_procured_mt : 0;

        return cottonQty / 1000
    } catch (error) {
        console.log(error);
    }
}

const sumbrandspinnerYarnSales = async (brandId: any, seasonId: any) => {
    try {
        let whereCondition: any = {}
        if(seasonId){
            whereCondition.season_id = seasonId
        }
        else
        {
           whereCondition.season_id = { [Op.notIn]: [2,3] };

        }
        let data = await SpinSales.findOne({
            attributes: [
                [Sequelize.literal('COALESCE(SUM(total_qty), 0)'), 'total_yarn_mt']
            ],
            include: [
                { model: Spinner, as: 'spinner', attributes: [] },
            ],
            where: {
                id: {
                    [Op.in]: Sequelize.literal(`(
                      SELECT DISTINCT sales_id
                      FROM spin_process_yarn_selections
                    )`)
                  },
                ...whereCondition,
                '$spinner.brand$': { [Op.contains]: [Number(brandId)] }
            },
            raw: true, // Ensures only the raw result is returned
        })

        let cottonQty = 0;
            cottonQty = data ? data.total_yarn_mt : 0;

        return cottonQty / 1000
    } catch (error) {
        console.log(error);
    }
}

const sumbrandspinnerYarnStock = async (brandId: any, seasonId: any) => {
    try {
        let whereCondition: any = {}
        if (seasonId) {
            whereCondition.season_id = seasonId
        }

        let data = await SpinProcess.findAll({
            attributes: [
                [Sequelize.literal('COALESCE(SUM(qty_stock), 0)'), 'qty_stock_yarn_mt']
            ],
            include: [
                { model: Spinner, as: 'spinner', attributes: [] },
            ],
            where: {
                ...whereCondition,
                '$spinner.brand$': { [Op.contains]: [Number(brandId)] }
            },
            group: ['spinner.brand']
        })
        let cottonQty = 0;
        data.forEach((value: any) => {
            cottonQty = value.dataValues.qty_stock_yarn_mt;
        });

        return cottonQty / 1000
    } catch (error) {
        console.log(error);
    }
}

const sumbrandknitterFabricSales = async (brandId: any, seasonId: any) => {
    try {

        let data = await KnitSales.findAll({
            attributes: [
                [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal("CAST(total_yarn_qty AS INTEGER)")), 0), 'total_fabric_mt']
            ],
            include: [
                { model: Knitter, as: 'knitter', attributes: [] },
            ],
            where: {
                '$knitter.brand$': { [Op.contains]: [Number(brandId)] }
            },
            group: ['knitter_id']
        })
        let cottonQty = 0;
        data.forEach((value: any) => {
            cottonQty = value.dataValues.total_fabric_mt;
        });

        return cottonQty / 1000
    } catch (error) {
        console.log(error);
    }
}
const sumbrandWeaverFabricSales = async (brandId: any, seasonId: any) => {
    try {

        let data = await WeaverSales.findAll({
            attributes: [
                [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal("CAST(total_yarn_qty AS INTEGER)")), 0), 'total_fabric_mt']
            ],
            include: [
                { model: Weaver, as: 'weaver', attributes: [] },
            ],
            where: {
                '$weaver.brand$': { [Op.contains]: [Number(brandId)] }
            },
            group: ['weaver_id', 'weaver.id']
        })

        let cottonQty = 0;
        data.forEach((value: any) => {
            cottonQty = value.dataValues.total_fabric_mt;
        });

        return cottonQty / 1000
    } catch (error) {
        console.log(error);
    }
}
const sumbrandgarmentFabricSales = async (brandId: any, seasonId: any) => {
    try {

        let data = await GarmentSales.findAll({
            attributes: [
                [Sequelize.literal('COALESCE(SUM(total_no_of_pieces), 0)'), 'total_garment_pcs']
            ],
            include: [
                { model: Garment, as: 'garment', attributes: [] },
            ],
            where: {
                '$garment.brand$': { [Op.contains]: [Number(brandId)] }
            },
            group: ['garment_id', 'garment.id']
        })
        let cottonQty = 0;
        data.forEach((value: any) => {
            cottonQty = value.dataValues.total_garment_pcs;
        });
        return cottonQty
    } catch (error) {
        console.log(error);
    }
}

//fetch brand transactions with filters
const fetchBrandTransactionsPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { product, styleMarkNo, invoiceNo, brandId, status }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (!brandId) {
            return res.sendError(res, 'Please send brandId')
        }
        if (searchTerm) {
            whereCondition[Op.or] = [
                { fabric_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
                { brand_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$garment.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { transaction_agent: { [Op.iLike]: `%${searchTerm}%` } },
            ];
        }
        if (brandId) {
            whereCondition.buyer_id = brandId;
        }

        if (invoiceNo) {
            const idArray: any[] = invoiceNo
                .split(",")
                .map((id: any) => id);
            whereCondition.invoice_no = { [Op.in]: idArray };
        }
        if (styleMarkNo) {
            const idArray: any[] = styleMarkNo
                .split(",")
                .map((id: any) => id);
            whereCondition.style_mark_no = { [Op.overlap]: idArray };
        }
        if (product) {
            const idArray: any[] = product
                .split(",")
                .map((id: any) => id);
            whereCondition.garment_type = { [Op.overlap]: idArray };
        }

        if (status === "Pending" || status === "Sold") {
            whereCondition.status =
              status === "Pending" ? "Pending" : "Sold";
          }

        let include = [
            {
                model: Garment,
                as: "garment",
                attributes: ['id', 'name', 'address']
            },
            {
                model: Program,
                as: 'program'
            },
            {
                model: Season,
                as: 'season'
            }
        ];
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await GarmentSales.findAndCountAll({
                where: whereCondition,
                include: include,
                order: [
                    [
                        'id', 'desc'
                    ]
                ],
                offset: offset,
                limit: limit,
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const gin = await GarmentSales.findAll({
                where: whereCondition,
                include: include,
                order: [
                    [
                        'id', 'desc'
                    ]
                ]
            });
            return res.sendSuccess(res, gin);
        }
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message);
    }
};


//update Brand transactions to accept and reject
const updateStatusBrandSale = async (req: Request, res: Response) => {
    try {
        let update = [];
        for (const obj of req.body.items) {
            const data = {
                status: obj.status,
                accept_date: obj.status === 'Sold' ? new Date().toISOString() : null
            };
            let result = await GarmentSales.update(data, { where: { id: obj.id } });
            update.push(result);
            
            // If the status is Rejected, we need to restore the stock count
            if (obj.status === 'Rejected') {
                // Find the garment selections associated with this sale
                const garmentSelections = await GarmentSelection.findAll({
                    where: { sales_id: obj.id }
                });
                
                // For each selection, restore the stock count in GarmentFabricType
                for (const selection of garmentSelections) {
                    const fabricType = await GarmentFabricType.findOne({
                        where: { id: selection.garment_type_id }
                    });
                    
                    if (fabricType) {
                        // Restore the stock count
                        await GarmentFabricType.update({
                            no_of_pieces_stock: fabricType.no_of_pieces_stock + selection.qty_used,
                            sold_status: false // Reset sold status if it was previously set to true
                        }, { 
                            where: { id: selection.garment_type_id } 
                        });
                    }
                }
            }
        }

        res.sendSuccess(res, { update });
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message, error);
    }
}

const productionUpdate = async (req: Request, res: Response) => {
    try {
        let { seasonId, brandId, ginnerId, countryId, spinnerId, knitterId, weaverId, garmentId }: any = req.query;
        const searchTerm: any = req.query.search || "";
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        let whereCondition: any = {};
        let ginnerWhere: any = {};
        let knitterWhere: any = {};
        let spinnerWhere: any = {};
        let weaverWhere: any = {};
        let garmentWhere: any = {};
           
        if (!brandId) {
            return res.sendError(res, 'NEED_BRAND_ID')
        }

        // apply search
    if (searchTerm) {
        ginnerWhere[Op.or] = [
          { "$ginner.name$": { [Op.iLike]: `%${searchTerm}%` } },
        ];
        spinnerWhere[Op.or] = [
            { "$spinner.name$": { [Op.iLike]: `%${searchTerm}%` } },
          ];
        knitterWhere[Op.or] = [
            { "$knitter.name$": { [Op.iLike]: `%${searchTerm}%` } },
          ];
        weaverWhere[Op.or] = [
            { "$weaver.name$": { [Op.iLike]: `%${searchTerm}%` } },
          ];
        garmentWhere[Op.or] = [
            { "$garment.name$": { [Op.iLike]: `%${searchTerm}%` } },
          ];
      }

        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.season_id = { [Op.in]: idArray };
        }

        // Helper function to add conditions based on filter values
        const addFilterCondition = (whereObj: any, filterKey: string, arr: any ) => {
            let idArray:number[] = arr ? arr.split(",").map((id: any) => parseInt(id, 10)) : [0];
            if (idArray && idArray.length > 0) {
                whereObj[filterKey] = { [Op.in]: idArray };
            } else {
                // If no filter value provided, set an impossible condition to filter out all data
                whereObj[filterKey] = { [Op.in]: [0] };
            }
        };

        // Dynamically add conditions for each filter
        if(ginnerId || spinnerId || knitterId || weaverId || garmentId){
            addFilterCondition(ginnerWhere, 'ginner_id', ginnerId);
            addFilterCondition(spinnerWhere, 'spinner_id', spinnerId);
            addFilterCondition(knitterWhere, 'knitter_id', knitterId);
            addFilterCondition(weaverWhere, 'weaver_id', weaverId);
            addFilterCondition(garmentWhere, 'garment_id', garmentId);
        }
            
        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            ginnerWhere['$ginner.country_id$'] = { [Op.in]: idArray };
        }
        const ginnerList = await GinSales.findAll({
            where: {
                ...whereCondition,
                ...ginnerWhere,
                status: 'Sold',
                '$ginner.brand$': { [Op.contains]: [Number(brandId)] }
            },
            attributes: [
                [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('total_qty')), 0), 'cotton_qty'],
                [Sequelize.literal('"ginner"."name"'), 'name'],
                [sequelize.literal("'Ginner'"), 'type']
            ],
            include: [
                {
                    model: Ginner,
                    as: 'ginner',
                    attributes: ['id', 'name'],
                },
                {
                    model: Season,
                    as: 'season',
                    attributes: ['id', 'name'],
                },
                {
                    model: Program,
                    as: 'program',
                    attributes: [],
                }
            ],
            group: ["ginner.id", 'season.id']
        });
        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            spinnerWhere['$spinner.country_id$'] = { [Op.in]: idArray };
        }
        const spinnerList = await SpinSales.findAll({
            where: {
                ...whereCondition,
                ...spinnerWhere,
                status: 'Sold',
                '$spinner.brand$': { [Op.contains]: [Number(brandId)] }
            },
            attributes: [

                [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('total_qty')), 0), 'spin_qty'],
                [Sequelize.literal('"spinner"."name"'), 'name'],
                [sequelize.literal("'Spinner'"), 'type']
            ],
            include: [
                {
                    model: Spinner,
                    as: 'spinner',
                    attributes: ['id', 'name'],
                },
                {
                    model: Season,
                    as: 'season',
                    attributes: ['id', 'name'],
                },
                {
                    model: Program,
                    as: 'program',
                    attributes: [],
                },
            ],
            group: ["spinner.id", 'season.id']
        });
        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            knitterWhere['$knitter.country_id$'] = { [Op.in]: idArray };
        }
        const knitterList = await KnitSales.findAll({
            attributes: [
                [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal("CAST(total_yarn_qty AS INTEGER)")), 0), 'knitter_qty'],
                [Sequelize.literal('"knitter"."name"'), 'name'],
                [sequelize.literal("'Knitter'"), 'type']
            ],
            include: [
                {
                    model: Knitter,
                    as: 'knitter',
                    attributes: ["id", 'name']
                },
                {
                    model: Season,
                    as: 'season',
                    attributes: ['id', 'name'],
                },
                {
                    model: Program,
                    as: 'program',
                    attributes: [],
                }
            ],
            where: {
                '$knitter.brand$': { [Op.contains]: [Number(brandId)] },
                status: 'Sold',
                ...whereCondition,
                ...knitterWhere
            },
            group: ['knitter.id', 'season.id']
        })
        
        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            weaverWhere['$weaver.country_id$'] = { [Op.in]: idArray };
        }
        const weaverList = await WeaverSales.findAll({
            attributes: [
                [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal("CAST(total_yarn_qty AS INTEGER)")), 0), 'weaver_qty'],
                [Sequelize.literal('"weaver"."name"'), 'name'],
                [sequelize.literal("'Weaver'"), 'type']
            ],
            include: [
                {
                    model: Weaver,
                    as: 'weaver',
                    attributes: ["id", 'name']
                },
                {
                    model: Season,
                    as: 'season',
                    attributes: ['id', 'name'],
                },
                {
                    model: Program,
                    as: 'program',
                    attributes: [],
                }
            ],
            where: {
                '$weaver.brand$': { [Op.contains]: [Number(brandId)] },
                status: 'Sold',
                ...whereCondition,
                ...weaverWhere
            },
            group: ['weaver.id', 'season.id']
        })
       
        if (countryId) {
            const idArray: number[] = countryId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            garmentWhere['$garment.country_id$'] = { [Op.in]: idArray };
        }
        const garmentList = await GarmentSales.findAll({
            attributes: [

                [sequelize.fn('COALESCE', sequelize.fn('SUM', Sequelize.literal("total_no_of_pieces")), 0), 'garment_qty'],
                [Sequelize.literal('"garment"."name"'), 'name'],
                [sequelize.literal("'Garment'"), 'type']
            ],
            include: [
                {
                    model: Garment,
                    as: 'garment',
                    attributes: ["id", 'name']
                },
                {
                    model: Season,
                    as: 'season',
                    attributes: ['id', 'name'],
                },
                {
                    model: Program,
                    as: 'program',
                    attributes: []
                }
            ],
            where: {
                '$garment.brand$': { [Op.contains]: [Number(brandId)] },
                status: 'Sold',
                ...whereCondition,
                ...garmentWhere
            },
            group: ['garment.id', 'season.id']
        })

        let data = [...ginnerList, ...spinnerList, ...knitterList, ...weaverList, ...garmentList];
        let ndata = data.length > 0 ? data.slice(offset, offset + limit) : [];
        return res.sendPaginationSuccess(res, ndata, data.length > 0 ? data.length : 0);
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message, error);
    }
}

const productTracebility = async (req: Request, res: Response) => {
    try {
        let { seasonId, brandId, styleMarkNo }: any = req.query;
        let whereCondition: any = {};
        if (!styleMarkNo) {
            return res.sendError(res, 'NEED_MARK_NO')
        }
        if (!brandId) {
            return res.sendError(res, 'NEED_BRAND_ID')
        }
        const garment_query = {
            include: [
                {
                    model: Garment,
                    as: 'garment',
                    attributes: ['id', 'name', 'latitude', 'longitude']
                }
            ],
            where: { style_mark_no: styleMarkNo, buyer_id: brandId },
        };

        let garments = await GarmentSales.findOne(garment_query);
        // let fabric = FabricSelection.findAll({ where: { sales_id: data.dataValues.id } });
        // let knitFabricIds = [];
        // if(){

        // }

        res.sendSuccess(res, garments)
    } catch (error: any) {
        console.log(error);
        return res.sendError(res, error.message, error);
    }
}

const styleMarkNo = async (req: Request, res: Response) => {
    try {
        const brandId: any = req.query.brandId;
        if (!brandId) {
            return res.sendError(res, 'NEED_BRAND_ID')
        }

        const types = await GarmentSales.findAll({
            attributes: ['garment_type'],
            where: { buyer_id: brandId },
            group: ['garment_type']
          });

          let garmentTypes: any = [];


          if(types && types.length > 0){
            for await (let row of types){
              garmentTypes = [...garmentTypes, ...new Set(row?.dataValues?.garment_type?.map((item: any) => item))]
            }
          }

        let style = await GarmentSales.findAll({
            attributes: ['style_mark_no'],
            where: { buyer_id: brandId },
            group: ['style_mark_no'],
        });

        let styleMarkNo: any = [];

          if(style && style.length > 0){
            for await (let row of style){
                styleMarkNo = [...styleMarkNo, ...new Set(row?.dataValues?.style_mark_no?.map((item: any) => item))]
            }
          }
        
        let invoices = await GarmentSales.findAll({
            attributes: ['invoice_no'],
            where: { buyer_id: brandId },
            group: ['invoice_no']
        });

        res.sendSuccess(res, { styleMarkNo, invoices, garmentTypes })
    } catch (error: any) {
        res.sendError(res, error.message)
    }
}

const getProgram = async (req: Request, res: Response) => {
    const brandId: any = req.query.brandId;
    const whereCondition: any = {};
    try {
        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.id = { [Op.in]: idArray };
            let brand = await Brand.findAll({ where: whereCondition });
            let programIds: any = []
            brand.map((programId: any) => {
                programIds = [...programIds, ...programId.dataValues.programs_id];
            });
            let program = await Program.findAll({ where: { id: programIds } })
            res.sendSuccess(res, program)
        } else {
            res.sendSuccess(res, [])
        }
    } catch (error: any) {
        res.sendError(res, error.message)
    }
}

const getCountries = async (req: Request, res: Response) => {
    const brandId: any = req.query.brandId;
    const whereCondition: any = {};
    try {
        if (brandId) {
            const idArray: number[] = brandId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.id = { [Op.in]: idArray };
            let brand = await Brand.findAll({ where: whereCondition });
            let countryIds: any = []
            brand.map((countryId: any) => {
                countryIds = [...countryIds, ...countryId.dataValues.countries_id];
            });
            let country = await Country.findAll({ where: { id: countryIds } })
            res.sendSuccess(res, country)
        } else {
            res.sendSuccess(res, [])
        }
    } catch (error: any) {
        res.sendError(res, error.message)
    }
}

export {
    findUser,
    createBrand,
    fetchBrandPagination,
    deleteBrand,
    fetchBrandById,
    updateBrand,
    checkBrand,
    organicCottonOverview,
    organicCottonSpecialUsersOverview,
    fetchBrandTransactionsPagination,
    updateStatusBrandSale,
    productionUpdate,
    productTracebility,
    getProgram,
    styleMarkNo,
    getCountries
};