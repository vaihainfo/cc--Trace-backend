import { Request, Response } from "express";
import sequelize from "../../util/dbConn";

const fetchPriceComparisonSeedCotton = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    let {
      countryId,
      stateId,
      districtId,
      brandId,
      seasonId,
      monthId,
      from,
      to
    }: any = req.query;
    const offset = (page - 1) * limit;

    let whereConditions: string[] = [];
    let avgQueryConditions: string[] = [];
    let replacements: any = { limit, offset };
    let brandIdArray = brandId ? brandId.split(",").map((id: any) => parseInt(id, 10)) : [];

    const addCondition = (field: string, values: string, alias: string | null = null) => {
      const idArray = values.split(",").map((id: any) => parseInt(id, 10));
      replacements[field] = idArray;
      const condition = alias ? `"${alias}"."${field}" IN (:${field})` : `"${field}" IN (:${field})`;
      whereConditions.push(condition);
      avgQueryConditions.push(condition.replace(`"${alias}".`, ""));
    };

    if (brandId) {
      const idArray = brandId.split(",").map((id: any) => parseInt(id, 10));
      replacements.brandId = idArray;
      whereConditions.push('"scp"."brand_id" IN (:brandId)');
    }

    if (seasonId) {
      addCondition("season_id", seasonId, "scp");
    }

    if (countryId) {
      addCondition("country_id", countryId, "scp");
    }

    if (stateId) {
      addCondition("state_id", stateId, "scp");
    }

    if (districtId) {
      addCondition("district_id", districtId, "scp");
    }

    if (monthId) {
      monthId = Number(monthId) + 1;
    }

    let fromDate;
    let toDate;
    if (from && to) {
      fromDate = new Date(`2024-${monthId}-${from}`);
      fromDate.setHours(0, 0, 0, 0);
      replacements.from = fromDate;
      toDate = new Date(`2024-${monthId}-${to}`);
      toDate.setHours(23, 59, 59, 999);
      replacements.to = toDate;
      replacements.fromDate = fromDate;
      whereConditions.push('"scp"."startDate" BETWEEN :fromDate AND :toDate');
      replacements.toDate = toDate;
      whereConditions.push('"scp"."endDate" BETWEEN :fromDate AND :toDate');
    }

    let query;
    if (monthId) {
      query = `
      SELECT 
        scp.*, 
        b."brand_name", 
        c."county_name",
        d."district_name", 
        p."program_name",
        s."name" AS "season_name",
        st."state_name" 
        FROM "seed-cotton-pricings" AS scp
        LEFT JOIN "brands" AS b ON scp."brand_id" = b."id"
        LEFT JOIN "countries" AS c ON scp."country_id" = c."id"
        LEFT JOIN "districts" AS d ON scp."district_id" = d."id"
        LEFT JOIN "programs" AS p ON scp."program_id" = p."id"
        LEFT JOIN "seasons" AS s ON scp."season_id" = s."id"
        LEFT JOIN "states" AS st ON scp."state_id" = st."id"
        WHERE EXTRACT(MONTH FROM scp."startDate") = ${monthId}
        AND EXTRACT(MONTH FROM scp."endDate") = ${monthId}
        ${whereConditions.length > 0 ? 'AND ' + whereConditions.join(' AND ') : ''}
      ORDER BY scp."startDate" DESC
      LIMIT :limit OFFSET :offset;
        `
    } else {
      query = `
      SELECT 
        scp.*, 
        b."brand_name", 
        c."county_name",
        d."district_name", 
        p."program_name",
        s."name" AS "season_name",
        st."state_name"
      FROM "seed-cotton-pricings" AS scp
      LEFT JOIN "brands" AS b ON scp."brand_id" = b."id"
      LEFT JOIN "countries" AS c ON scp."country_id" = c."id"
      LEFT JOIN "districts" AS d ON scp."district_id" = d."id"
      LEFT JOIN "programs" AS p ON scp."program_id" = p."id"
      LEFT JOIN "seasons" AS s ON scp."season_id" = s."id"
      LEFT JOIN "states" AS st ON scp."state_id" = st."id"
      ${whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''}
      ORDER BY scp."startDate" DESC
      LIMIT :limit OFFSET :offset;
    `;
    }

    const rows = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    const count = rows.length;

    await Promise.all(rows.map(async (row: any) => {
      let { startDate, endDate, country_id, district_id, state_id } = row;

      startDate = new Date(startDate);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(endDate);
      endDate.setHours(23, 59, 59, 999);

      const avgQuery = `
        SELECT 
          AVG(CASE WHEN t."program_id" = 4 THEN CAST(t."rate" AS FLOAT) END) AS "organic_average_price",
          AVG(CASE WHEN t."program_id" = 5 THEN CAST(t."rate" AS FLOAT) END) AS "reel_average_price"
        FROM "transactions" AS t
        WHERE t."date" >= :startDate AND t."date" <= :endDate
        AND t."country_id"= :country_id AND t."state_id"= :state_id AND t."district_id"= :district_id
        ${brandIdArray.length > 0 ? 'AND "brand_id" IN (:brandId)' : ''}
        ${avgQueryConditions.length > 0 ? 'AND ' + avgQueryConditions.join(' AND ') : ''};
      `;

      const [avgResult] = await sequelize.query(avgQuery, {
        replacements: { startDate, endDate, country_id, state_id, district_id, brandId: brandIdArray || [], ...replacements },
        type: sequelize.QueryTypes.SELECT,
      });

      row.organic_average_price = avgResult.organic_average_price || 0;
      row.reel_average_price = avgResult.reel_average_price || 0;
    }));

    return res.sendPaginationSuccess(res, rows, count);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const fetchPriceComparisonLint = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const {
      seasonId,
      countryId,
      stateId,
      districtId,
      brandId,
    }: any = req.query;
    const offset = (page - 1) * limit;

    let brandIdArray = brandId ? brandId.split(",").map((id: any) => parseInt(id, 10)) : [];
    let whereConditions: string[] = [];
    let avgQueryConditions: string[] = [];
    let replacements: any = { limit, offset };

    const addCondition = (field: string, values: string, alias: string | null = null) => {
      const idArray = values.split(",").map((id: any) => parseInt(id, 10));
      replacements[field] = idArray;
      const condition = alias ? `"${alias}"."${field}" IN (:${field})` : `"${field}" IN (:${field})`;
      whereConditions.push(condition);
      avgQueryConditions.push(condition.replace(`"${alias}".`, ""));
    };

    if (brandId) {
      const idArray = brandId.split(",").map((id: any) => parseInt(id, 10));
      replacements.brandId = idArray;
      whereConditions.push('"lp"."brand_id" IN (:brandId)');
    }

    if (seasonId) {
      addCondition("season_id", seasonId, "lp");
    }

    if (countryId) {
      addCondition("country_id", countryId, "lp");
    }

    if (stateId) {
      addCondition("state_id", stateId, "lp");
    }

    if (districtId) {
      addCondition("district_id", districtId, "lp");
    }

    let query = `
      SELECT 
        lp.*, 
        b."brand_name", 
        c."county_name",
        d."district_name", 
        p."program_name",
        s."name" AS "season_name",
        st."state_name"
      FROM "lint-pricings" AS lp
      LEFT JOIN "brands" AS b ON lp."brand_id" = b."id"
      LEFT JOIN "countries" AS c ON lp."country_id" = c."id"
      LEFT JOIN "districts" AS d ON lp."district_id" = d."id"
      LEFT JOIN "programs" AS p ON lp."program_id" = p."id"
      LEFT JOIN "seasons" AS s ON lp."season_id" = s."id"
      LEFT JOIN "states" AS st ON lp."state_id" = st."id"
      ${whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''}
      ORDER BY lp."startDate" DESC
      LIMIT :limit OFFSET :offset;
    `;

    const rows = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    whereConditions = whereConditions.filter(condition => !condition.includes('brand_id'));
    delete replacements.brandId;
    const count = rows.length;

    await Promise.all(rows.map(async (row: any) => {
      let { startDate, endDate, country_id, district_id, state_id } = row;

      startDate = new Date(startDate);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(endDate);
      endDate.setHours(23, 59, 59, 999);


      const avgQuery = `
        SELECT 
          AVG(CASE WHEN ss."program_id" = 4 THEN CAST(ss."rate" AS FLOAT) END) AS "organic_average_price",
          AVG(CASE WHEN ss."program_id" = 5 THEN CAST(ss."rate" AS FLOAT) END) AS "reel_average_price"
        FROM "gin_sales" ss
        INNER JOIN "ginners" s ON ss."ginner_id" = s."id"
        WHERE ss."date" >= :startDate AND ss."date" <= :endDate
        ${avgQueryConditions.length > 0 ? 'AND ' + avgQueryConditions.join(' AND ') : ''};
      `;

      const [avgResult] = await sequelize.query(avgQuery, {
        replacements: {
          startDate,
          endDate,
          country_id, state_id, district_id,
          brandIdArray: brandIdArray || [],
          ...replacements
        },
        type: sequelize.QueryTypes.SELECT,
      });

      row.organic_average_price = avgResult.organic_average_price || 0;
      row.reel_average_price = avgResult.reel_average_price || 0;
    }));

    return res.sendPaginationSuccess(res, rows, count);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

const fetchPriceComparisonYarn = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const {
      seasonId,
      countryId,
      stateId,
      districtId,
      brandId,
    }: any = req.query;
    const offset = (page - 1) * limit;

    let brandIdArray = brandId ? brandId.split(",").map((id: any) => parseInt(id, 10)) : [];
    let whereConditions: string[] = [];
    let avgQueryConditions: string[] = [];
    let replacements: any = { limit, offset };

    const addCondition = (field: string, values: string, alias: string | null = null) => {
      const idArray = values.split(",").map((id: any) => parseInt(id, 10));
      replacements[field] = idArray;
      const condition = alias ? `"${alias}"."${field}" IN (:${field})` : `"${field}" IN (:${field})`;
      whereConditions.push(condition);
      avgQueryConditions.push(condition.replace(`"${alias}".`, ""));
    };

    if (brandId) {
      const idArray = brandId.split(",").map((id: any) => parseInt(id, 10));
      replacements.brandId = idArray;
      whereConditions.push('"yp"."brand_id" IN (:brandId)');
    }

    if (seasonId) {
      addCondition("season_id", seasonId, "yp");
    }

    if (countryId) {
      addCondition("country_id", countryId, "yp");
    }

    if (stateId) {
      addCondition("state_id", stateId, "yp");
    }

    if (districtId) {
      addCondition("district_id", districtId, "yp");
    }

    let query = `
      SELECT 
        yp.*, 
        b."brand_name", 
        c."county_name",
        d."district_name", 
        p."program_name",
        s."name" AS "season_name",
        st."state_name"
      FROM "yarn-pricings" AS yp
      LEFT JOIN "brands" AS b ON yp."brand_id" = b."id"
      LEFT JOIN "countries" AS c ON yp."country_id" = c."id"
      LEFT JOIN "districts" AS d ON yp."district_id" = d."id"
      LEFT JOIN "programs" AS p ON yp."program_id" = p."id"
      LEFT JOIN "seasons" AS s ON yp."season_id" = s."id"
      LEFT JOIN "states" AS st ON yp."state_id" = st."id"
      ${whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''}
      ORDER BY yp."startDate" DESC
      LIMIT :limit OFFSET :offset;
    `;


    const rows = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    whereConditions = whereConditions.filter(condition => !condition.includes('brand_id'));
    delete replacements.brandId;
    const count = rows.length;

    await Promise.all(rows.map(async (row: any) => {
      let { startDate, endDate, country_id, district_id, state_id } = row;

      startDate = new Date(startDate);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(endDate);
      endDate.setHours(23, 59, 59, 999);


      const avgQuery = `
        SELECT 
          AVG(CASE WHEN ss."program_id" = 4 THEN CAST(ss."price" AS FLOAT) END) AS "organic_average_price",
          AVG(CASE WHEN ss."program_id" = 5 THEN CAST(ss."price" AS FLOAT) END) AS "reel_average_price"
        FROM "spin_sales" ss
        INNER JOIN "spinners" s ON ss."spinner_id" = s."id"
        WHERE ss."date" >= :startDate AND ss."date" <= :endDate
        ${avgQueryConditions.length > 0 ? 'AND ' + avgQueryConditions.join(' AND ') : ''};
      `;

      const [avgResult] = await sequelize.query(avgQuery, {
        replacements: {
          startDate,
          endDate, country_id, state_id, district_id,
          brandIdArray: brandIdArray || [],
          ...replacements
        },
        type: sequelize.QueryTypes.SELECT,
      });

      row.organic_average_price = avgResult.organic_average_price || 0;
      row.reel_average_price = avgResult.reel_average_price || 0;
    }));

    return res.sendPaginationSuccess(res, rows, count);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

export { fetchPriceComparisonSeedCotton, fetchPriceComparisonLint, fetchPriceComparisonYarn };