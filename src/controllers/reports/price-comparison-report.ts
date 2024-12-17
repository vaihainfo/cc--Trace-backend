import { Request, Response } from "express";
import sequelize from "../../util/dbConn";

const fetchPriceComparisonSeedCotton = async (req: Request, res: Response) => {
  try {
    // Extract and validate query parameters
    const {
      page = 1,
      limit = 10,
      countryId,
      stateId,
      districtId,
      brandId,
      seasonId,
      monthId,
      from,
      to,
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const filterConditions: string[] = [];
    const filterReplacements: Record<string, any> = {
      limit: Number(limit),
      offset,
    };

    // Helper function to add ID filters
    const addIdFilter = (
      paramValue: string | undefined,
      fieldName: string,
      replacementKey: string
    ) => {
      if (paramValue) {
        const ids = paramValue.split(",").map(id => parseInt(id, 10));
        filterConditions.push(`wr."${fieldName}" IN (:${replacementKey})`);
        filterReplacements[replacementKey] = ids;
      }
    };

    // Add filters for different IDs
    addIdFilter(brandId as string, "brand_id", "brandIds");
    addIdFilter(countryId as string, "country_id", "countryIds");
    addIdFilter(stateId as string, "state_id", "stateIds");
    addIdFilter(districtId as string, "district_id", "districtIds");
    addIdFilter(seasonId as string, "season_id", "seasonIds");

    // Handle season filter
    if (!seasonId) {
      const currentDate = new Date();
      const oneYearAgo = new Date(
        currentDate.getFullYear() - 1,
        currentDate.getMonth(),
        currentDate.getDate()
      );
      filterConditions.push(
        "wr.week_start_date BETWEEN :oneYearAgo AND :currentDate"
      );
      filterReplacements.oneYearAgo = oneYearAgo;
      filterReplacements.currentDate = currentDate;
    }

    // Handle date range filter
    if (from && to) {
      const adjustedMonthId = Number(monthId) + 1;
      let yearToUse =  new Date().getFullYear();

      if (seasonId) {
        // Fetch season dates when seasonId is present
        const [seasonDates] = await sequelize.query(`
          SELECT 
            "from",
            "to"
          FROM "seasons"
          WHERE id = :seasonId
        `, {
          replacements: { seasonId: seasonId  },
          type: sequelize.QueryTypes.SELECT
        });
    
        if (seasonDates) {
          const startDate = new Date((seasonDates as any).from);
          const endDate = new Date((seasonDates as any).to);
      
          // If month is between October(10) to December(12), use start year
         // If month is between January(1) to September(9), use end year
          if (adjustedMonthId >= 10 && adjustedMonthId <= 12) {
            yearToUse = startDate.getFullYear();
          } else if (adjustedMonthId >= 1 && adjustedMonthId <= 9) {
            yearToUse = endDate.getFullYear();
          }
        }
      }
      
      
      const fromDate = new Date(`${yearToUse}-${adjustedMonthId}-${from}`);
      fromDate.setHours(0, 0, 0, 0);
      
      const toDate = new Date(`${yearToUse}-${adjustedMonthId}-${to}`);
      toDate.setHours(23, 59, 59, 999);

      filterConditions.push("wr.week_start_date BETWEEN :fromDate AND :toDate");
      filterReplacements.fromDate = fromDate;
      filterReplacements.toDate = toDate;
    }


    const filterClause = filterConditions.length 
      ? `WHERE ${filterConditions.join(" AND ")}` 
      : "";

    // Common CTE for both queries
    const weekRangesCTE = `
      WITH week_ranges AS (
        SELECT 
          DATE_TRUNC('month', t."date") + 
          INTERVAL '1 day' * (CASE 
            WHEN EXTRACT(DAY FROM t."date") <= 7 THEN 1
            WHEN EXTRACT(DAY FROM t."date") <= 14 THEN 8
            WHEN EXTRACT(DAY FROM t."date") <= 21 THEN 15
            WHEN EXTRACT(DAY FROM t."date") <= 28 THEN 22
            ELSE 29
          END - 1) AS week_start_date,
          DATE_TRUNC('month', t."date") + 
          INTERVAL '1 day' * (CASE 
            WHEN EXTRACT(DAY FROM t."date") <= 7 THEN 7
            WHEN EXTRACT(DAY FROM t."date") <= 14 THEN 14
            WHEN EXTRACT(DAY FROM t."date") <= 21 THEN 21
            WHEN EXTRACT(DAY FROM t."date") <= 28 THEN 28
            ELSE (DATE_TRUNC('month', t."date" + INTERVAL '1 month') - INTERVAL '1 day')::date - (DATE_TRUNC('month', t."date"))::date + 1
          END - 1) AS week_end_date,
          t."date",
          t."rate"::numeric as "rate",
          t."program_id",
          t."brand_id",
          t."country_id",
          t."district_id",
          t."state_id",
          t."season_id"
        FROM "transactions" t
        WHERE t."status" = 'Sold'
      )
    `;

    // Execute count query and data query in parallel
    const [countResult, rows] = await Promise.all([
      sequelize.query(`
        ${weekRangesCTE}
        SELECT COUNT(DISTINCT (
          wr.week_start_date, 
          wr."brand_id",
          wr."country_id",
          wr."district_id",
          wr."program_id",
          wr."season_id",
          wr."state_id"
        )) as total
        FROM week_ranges wr
        ${filterClause}
      `, {
        replacements: filterReplacements,
        type: sequelize.QueryTypes.SELECT,
      }),

      sequelize.query(`
        ${weekRangesCTE}
        SELECT 
          TO_CHAR(wr.week_start_date, 'DD-MM-YYYY') AS "startDate",
          TO_CHAR(wr.week_end_date, 'DD-MM-YYYY') AS "endDate",
          AVG(CASE WHEN wr.program_id = 4 THEN wr.rate END) AS "organic_average_price",
          AVG(CASE WHEN wr.program_id = 5 THEN wr.rate END) AS "reel_average_price",
          AVG(CAST(scp."market_price" AS FLOAT)) AS "market_price",
          AVG(CAST(scp."programme_price" AS FLOAT)) AS "programme_price",
          wr."brand_id",
          b."brand_name",
          wr."country_id",
          c."county_name",
          wr."district_id",
          d."district_name",
          wr."program_id",
          p."program_name",
          wr."season_id",
          s."name" AS "season_name",
          wr."state_id",
          st."state_name"
        FROM week_ranges wr
        LEFT JOIN "brands" AS b ON wr."brand_id" = b."id"
        LEFT JOIN "countries" AS c ON wr."country_id" = c."id"
        LEFT JOIN "districts" AS d ON wr."district_id" = d."id"
        LEFT JOIN "programs" AS p ON wr."program_id" = p."id"
        LEFT JOIN "seasons" AS s ON wr."season_id" = s."id"
        LEFT JOIN "states" AS st ON wr."state_id" = st."id"
        LEFT JOIN "seed-cotton-pricings" AS scp ON 
          DATE(wr.week_start_date) >= DATE(scp."startDate"::timestamp) 
          AND DATE(wr.week_end_date) <= DATE(scp."endDate"::timestamp)
          AND wr."brand_id" = scp."brand_id"
          AND wr."country_id" = scp."country_id"
          AND wr."district_id" = scp."district_id"
          AND wr."state_id" = scp."state_id"
        ${filterClause}
        GROUP BY 
          wr.week_start_date, 
          wr.week_end_date,
          wr."brand_id",
          wr."country_id",
          wr."district_id",
          wr."program_id",
          wr."season_id",
          wr."state_id",
          b."brand_name",
          c."county_name",
          d."district_name",
          p."program_name",
          s."name",
          st."state_name"
        ORDER BY wr.week_start_date DESC
        LIMIT :limit OFFSET :offset
      `, {
        replacements: filterReplacements,
        type: sequelize.QueryTypes.SELECT,
      })
    ]);

    return res.sendPaginationSuccess(res, rows, (countResult[0] as any).total);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const fetchPriceComparisonLint = async (req: Request, res: Response) => {
  try {
    // Extract and validate query parameters
    const {
      page = 1,
      limit = 10,
      seasonId,
      countryId,
      stateId,
      districtId,
      brandId,
      monthId,
      from,
      to,
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const filterConditions: string[] = [];
    const filterReplacements: Record<string, any> = {
      limit: Number(limit),
      offset,
    };

    // Helper function to add ID filters
    const addIdFilter = (
      paramValue: string | undefined,
      fieldName: string,
      replacementKey: string
    ) => {
      if (paramValue) {
        const ids = paramValue.split(",").map(id => parseInt(id, 10));
        filterConditions.push(`wr."${fieldName}" IN (:${replacementKey})`);
        filterReplacements[replacementKey] = ids;
      }
    };

    // Add filters for different IDs
    addIdFilter(brandId as string, "brand_id", "brandIds");
    addIdFilter(countryId as string, "country_id", "countryIds");
    addIdFilter(stateId as string, "state_id", "stateIds");
    addIdFilter(districtId as string, "district_id", "districtIds");
    addIdFilter(seasonId as string, "season_id", "seasonIds");

    // Handle season filter
    if (!seasonId) {
      const currentDate = new Date();
      const oneYearAgo = new Date(
        currentDate.getFullYear() - 1,
        currentDate.getMonth(),
        currentDate.getDate()
      );
      filterConditions.push(
        "wr.week_start_date BETWEEN :oneYearAgo AND :currentDate"
      );
      filterReplacements.oneYearAgo = oneYearAgo;
      filterReplacements.currentDate = currentDate;
    }

    // Handle date range filter
    if (from && to) {
      const adjustedMonthId = Number(monthId) + 1;
      let yearToUse =  new Date().getFullYear();

      if (seasonId) {
        // Fetch season dates when seasonId is present
        const [seasonDates] = await sequelize.query(`
          SELECT 
            "from",
            "to"
          FROM "seasons"
          WHERE id = :seasonId
        `, {
          replacements: { seasonId: seasonId  },
          type: sequelize.QueryTypes.SELECT
        });
    
        if (seasonDates) {
          const startDate = new Date((seasonDates as any).from);
          const endDate = new Date((seasonDates as any).to);
      
          // If month is between October(10) to December(12), use start year
         // If month is between January(1) to September(9), use end year
          if (adjustedMonthId >= 10 && adjustedMonthId <= 12) {
            yearToUse = startDate.getFullYear();
          } else if (adjustedMonthId >= 1 && adjustedMonthId <= 9) {
            yearToUse = endDate.getFullYear();
          }
        }
      }
      
      
      const fromDate = new Date(`${yearToUse}-${adjustedMonthId}-${from}`);
      fromDate.setHours(0, 0, 0, 0);
      
      const toDate = new Date(`${yearToUse}-${adjustedMonthId}-${to}`);
      toDate.setHours(23, 59, 59, 999);

      filterConditions.push("wr.week_start_date BETWEEN :fromDate AND :toDate");
      filterReplacements.fromDate = fromDate;
      filterReplacements.toDate = toDate;
    }


    const filterClause = filterConditions.length 
      ? `WHERE ${filterConditions.join(" AND ")}` 
      : "";

    // Common CTE for both queries
    const weekRangesCTE = `
      WITH week_ranges AS (
        SELECT 
          DATE_TRUNC('month', gs."date") + 
          INTERVAL '1 day' * (CASE 
            WHEN EXTRACT(DAY FROM gs."date") <= 7 THEN 1
            WHEN EXTRACT(DAY FROM gs."date") <= 14 THEN 8
            WHEN EXTRACT(DAY FROM gs."date") <= 21 THEN 15
            WHEN EXTRACT(DAY FROM gs."date") <= 28 THEN 22
            ELSE 29
          END - 1) AS week_start_date,
          DATE_TRUNC('month', gs."date") + 
          INTERVAL '1 day' * (CASE 
            WHEN EXTRACT(DAY FROM gs."date") <= 7 THEN 7
            WHEN EXTRACT(DAY FROM gs."date") <= 14 THEN 14
            WHEN EXTRACT(DAY FROM gs."date") <= 21 THEN 21
            WHEN EXTRACT(DAY FROM gs."date") <= 28 THEN 28
            ELSE (DATE_TRUNC('month', gs."date" + INTERVAL '1 month') - INTERVAL '1 day')::date - (DATE_TRUNC('month', gs."date"))::date + 1
          END - 1) AS week_end_date,
          gs."date",
          gs."rate"::numeric as "rate",
          p.program_id,
          b.brand_id,
          g."country_id",
          g."district_id",
          g."state_id",
          gs."season_id",
          gs."ginner_id"
        FROM "gin_sales" gs
        INNER JOIN "ginners" g ON gs."ginner_id" = g."id"
        CROSS JOIN LATERAL unnest(g."program_id") as p(program_id)
        CROSS JOIN LATERAL unnest(g."brand") as b(brand_id)
      )
    `;

    // Execute count query and data query in parallel
    const [countResult, rows] = await Promise.all([
      sequelize.query(`
        ${weekRangesCTE}
        SELECT COUNT(DISTINCT (
          wr.week_start_date, 
          wr."brand_id",
          wr."country_id",
          wr."district_id",
          wr."program_id",
          wr."season_id",
          wr."state_id"
        )) as total
        FROM week_ranges wr
        ${filterClause}
      `, {
        replacements: filterReplacements,
        type: sequelize.QueryTypes.SELECT,
      }),

      sequelize.query(`
        ${weekRangesCTE}
        SELECT 
          TO_CHAR(wr.week_start_date, 'DD-MM-YYYY') AS "startDate",
          TO_CHAR(wr.week_end_date, 'DD-MM-YYYY') AS "endDate",
          AVG(CASE WHEN wr.program_id = 4 THEN wr.rate END) AS "organic_average_price",
          AVG(CASE WHEN wr.program_id = 5 THEN wr.rate END) AS "reel_average_price",
          AVG(CAST(lp."market_price" AS FLOAT)) AS "market_price",
          AVG(CAST(lp."programme_price" AS FLOAT)) AS "programme_price",
          wr."brand_id",
          b."brand_name",
          wr."country_id",
          c."county_name",
          wr."district_id",
          d."district_name",
          wr."program_id",
          p."program_name",
          wr."season_id",
          s."name" AS "season_name",
          wr."state_id",
          st."state_name"
        FROM week_ranges wr
        LEFT JOIN "brands" AS b ON wr."brand_id" = b."id"
        LEFT JOIN "countries" AS c ON wr."country_id" = c."id"
        LEFT JOIN "districts" AS d ON wr."district_id" = d."id"
        LEFT JOIN "programs" AS p ON wr."program_id" = p."id"
        LEFT JOIN "seasons" AS s ON wr."season_id" = s."id"
        LEFT JOIN "states" AS st ON wr."state_id" = st."id"
        LEFT JOIN "lint-pricings" AS lp ON 
          DATE(wr.week_start_date) >= DATE(lp."startDate"::timestamp) 
          AND DATE(wr.week_end_date) <= DATE(lp."endDate"::timestamp)
          AND wr."brand_id" = lp."brand_id"
          AND wr."country_id" = lp."country_id"
          AND wr."district_id" = lp."district_id"
          AND wr."state_id" = lp."state_id"
        ${filterClause}
        GROUP BY 
          wr.week_start_date, 
          wr.week_end_date,
          wr."brand_id",
          wr."country_id",
          wr."district_id",
          wr."program_id",
          wr."season_id",
          wr."state_id",
          b."brand_name",
          c."county_name",
          d."district_name",
          p."program_name",
          s."name",
          st."state_name"
        ORDER BY wr.week_start_date DESC
        LIMIT :limit OFFSET :offset
      `, {
        replacements: filterReplacements,
        type: sequelize.QueryTypes.SELECT,
      })
    ]);

    return res.sendPaginationSuccess(res, rows, (countResult[0] as any).total);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};
const fetchPriceComparisonYarn = async (req: Request, res: Response) => {
  try {
    // Extract and validate query parameters
    const {
      page = 1,
      limit = 10,
      seasonId,
      countryId,
      stateId,
      districtId,
      brandId,
      monthId,
      from,
      to,
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const filterConditions: string[] = [];
    const filterReplacements: Record<string, any> = {
      limit: Number(limit),
      offset,
    };

    // Helper function to add ID filters
    const addIdFilter = (
      paramValue: string | undefined,
      fieldName: string,
      replacementKey: string
    ) => {
      if (paramValue) {
        const ids = paramValue.split(",").map(id => parseInt(id, 10));
        filterConditions.push(`wr."${fieldName}" IN (:${replacementKey})`);
        filterReplacements[replacementKey] = ids;
      }
    };

    // Add filters for different IDs
    addIdFilter(brandId as string, "brand_id", "brandIds");
    addIdFilter(countryId as string, "country_id", "countryIds");
    addIdFilter(stateId as string, "state_id", "stateIds");
    addIdFilter(districtId as string, "district_id", "districtIds");
    addIdFilter(seasonId as string, "season_id", "seasonIds");

    // Handle season filter
    if (!seasonId) {
      const currentDate = new Date();
      const oneYearAgo = new Date(
        currentDate.getFullYear() - 1,
        currentDate.getMonth(),
        currentDate.getDate()
      );
      filterConditions.push(
        "wr.week_start_date BETWEEN :oneYearAgo AND :currentDate"
      );
      filterReplacements.oneYearAgo = oneYearAgo;
      filterReplacements.currentDate = currentDate;
    }

    // Handle date range filter
    if (from && to) {
      const adjustedMonthId = Number(monthId) + 1;
      let yearToUse =  new Date().getFullYear();

      if (seasonId) {
        // Fetch season dates when seasonId is present
        const [seasonDates] = await sequelize.query(`
          SELECT 
            "from",
            "to"
          FROM "seasons"
          WHERE id = :seasonId
        `, {
          replacements: { seasonId: seasonId  },
          type: sequelize.QueryTypes.SELECT
        });
    
        if (seasonDates) {
          const startDate = new Date((seasonDates as any).from);
          const endDate = new Date((seasonDates as any).to);
      
          // If month is between October(10) to December(12), use start year
         // If month is between January(1) to September(9), use end year
          if (adjustedMonthId >= 10 && adjustedMonthId <= 12) {
            yearToUse = startDate.getFullYear();
          } else if (adjustedMonthId >= 1 && adjustedMonthId <= 9) {
            yearToUse = endDate.getFullYear();
          }
        }
      }
      
      
      const fromDate = new Date(`${yearToUse}-${adjustedMonthId}-${from}`);
      fromDate.setHours(0, 0, 0, 0);
      
      const toDate = new Date(`${yearToUse}-${adjustedMonthId}-${to}`);
      toDate.setHours(23, 59, 59, 999);

      filterConditions.push("wr.week_start_date BETWEEN :fromDate AND :toDate");
      filterReplacements.fromDate = fromDate;
      filterReplacements.toDate = toDate;
    }


    const filterClause = filterConditions.length 
      ? `WHERE ${filterConditions.join(" AND ")}` 
      : "";

    // Common CTE for both queries
    const weekRangesCTE = `
      WITH week_ranges AS (
        SELECT 
          DATE_TRUNC('month', ss."date") + 
          INTERVAL '1 day' * (CASE 
            WHEN EXTRACT(DAY FROM ss."date") <= 7 THEN 1
            WHEN EXTRACT(DAY FROM ss."date") <= 14 THEN 8
            WHEN EXTRACT(DAY FROM ss."date") <= 21 THEN 15
            WHEN EXTRACT(DAY FROM ss."date") <= 28 THEN 22
            ELSE 29
          END - 1) AS week_start_date,
          DATE_TRUNC('month', ss."date") + 
          INTERVAL '1 day' * (CASE 
            WHEN EXTRACT(DAY FROM ss."date") <= 7 THEN 7
            WHEN EXTRACT(DAY FROM ss."date") <= 14 THEN 14
            WHEN EXTRACT(DAY FROM ss."date") <= 21 THEN 21
            WHEN EXTRACT(DAY FROM ss."date") <= 28 THEN 28
            ELSE (DATE_TRUNC('month', ss."date" + INTERVAL '1 month') - INTERVAL '1 day')::date - (DATE_TRUNC('month', ss."date"))::date + 1
          END - 1) AS week_end_date,
          ss."date",
          ss."price"::numeric as "price",
          p.program_id,
          b.brand_id,
          s."country_id",
          s."district_id",
          s."state_id",
          ss."season_id",
          ss."spinner_id"
        FROM "spin_sales" ss
        INNER JOIN "spinners" s ON ss."spinner_id" = s."id"
        CROSS JOIN LATERAL unnest(s."program_id") as p(program_id)
        CROSS JOIN LATERAL unnest(s."brand") as b(brand_id)
      )
    `;

    // Execute count query and data query in parallel
    const [countResult, rows] = await Promise.all([
      sequelize.query(`
        ${weekRangesCTE}
        SELECT COUNT(DISTINCT (
          wr.week_start_date, 
          wr."brand_id",
          wr."country_id",
          wr."district_id",
          wr."program_id",
          wr."season_id",
          wr."state_id"
        )) as total
        FROM week_ranges wr
        ${filterClause}
      `, {
        replacements: filterReplacements,
        type: sequelize.QueryTypes.SELECT,
      }),

      sequelize.query(`
        ${weekRangesCTE}
        SELECT 
          TO_CHAR(wr.week_start_date, 'DD-MM-YYYY') AS "startDate",
          TO_CHAR(wr.week_end_date, 'DD-MM-YYYY') AS "endDate",
          AVG(CASE WHEN wr.program_id = 4 THEN wr.price END) AS "organic_average_price",
          AVG(CASE WHEN wr.program_id = 5 THEN wr.price END) AS "reel_average_price",
          AVG(CAST(yp."market_price" AS FLOAT)) AS "market_price",
          AVG(CAST(yp."programme_price" AS FLOAT)) AS "programme_price",
          wr."brand_id",
          b."brand_name",
          wr."country_id",
          c."county_name",
          wr."district_id",
          d."district_name",
          wr."program_id",
          p."program_name",
          wr."season_id",
          s."name" AS "season_name",
          wr."state_id",
          st."state_name"
        FROM week_ranges wr
        LEFT JOIN "brands" AS b ON wr."brand_id" = b."id"
        LEFT JOIN "countries" AS c ON wr."country_id" = c."id"
        LEFT JOIN "districts" AS d ON wr."district_id" = d."id"
        LEFT JOIN "programs" AS p ON wr."program_id" = p."id"
        LEFT JOIN "seasons" AS s ON wr."season_id" = s."id"
        LEFT JOIN "states" AS st ON wr."state_id" = st."id"
        LEFT JOIN "yarn-pricings" AS yp ON 
          DATE(wr.week_start_date) >= DATE(yp."startDate"::timestamp) 
          AND DATE(wr.week_end_date) <= DATE(yp."endDate"::timestamp)
          AND wr."brand_id" = yp."brand_id"
          AND wr."country_id" = yp."country_id"
          AND wr."district_id" = yp."district_id"
          AND wr."state_id" = yp."state_id"
        ${filterClause}
        GROUP BY 
          wr.week_start_date, 
          wr.week_end_date,
          wr."brand_id",
          wr."country_id",
          wr."district_id",
          wr."program_id",
          wr."season_id",
          wr."state_id",
          b."brand_name",
          c."county_name",
          d."district_name",
          p."program_name",
          s."name",
          st."state_name"
        ORDER BY wr.week_start_date DESC
        LIMIT :limit OFFSET :offset
      `, {
        replacements: filterReplacements,
        type: sequelize.QueryTypes.SELECT,
      })
    ]);

    return res.sendPaginationSuccess(res, rows, (countResult[0] as any).total);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};
export {
  fetchPriceComparisonSeedCotton,
  fetchPriceComparisonLint,
  fetchPriceComparisonYarn,
};
