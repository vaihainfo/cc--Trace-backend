import { Request, Response } from "express";
import sequelize from "../../util/dbConn";

const fetchPriceComparisonSeedCotton = async (req: Request, res: Response) => {
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

    let whereConditions: string[] = [];
    let replacements: any = { limit, offset };

    if (brandId) {
      const idArray = brandId.split(",").map((id: any) => parseInt(id, 10));
      whereConditions.push('"brand_id" IN (:brandId)');
      replacements.brandId = idArray;
    }

    if (seasonId) {
      const idArray = seasonId.split(",").map((id: any) => parseInt(id, 10));
      whereConditions.push('"season_id" IN (:seasonId)');
      replacements.seasonId = idArray;
    }

    if (countryId) {
      const idArray = countryId.split(",").map((id: any) => parseInt(id, 10));
      whereConditions.push('"country_id" IN (:countryId)');
      replacements.countryId = idArray;
    }

    if (stateId) {
      const idArray = stateId.split(",").map((id: any) => parseInt(id, 10));
      whereConditions.push('"state_id" IN (:stateId)');
      replacements.stateId = idArray;
    }

    if (districtId) {
      const idArray = districtId.split(",").map((id: any) => parseInt(id, 10));
      whereConditions.push('"district_id" IN (:districtId)');
      replacements.districtId = idArray;
    }

    let query = `
      SELECT * FROM "seed-cotton-pricings"
      ${whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''}
      ORDER BY "id" DESC
      LIMIT :limit OFFSET :offset;
    `;

    const rows = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    const count = rows.length;
    await Promise.all(rows.map(async (row: any) => {
      const { startDate, endDate } = row;

      const avgQuery = `
        SELECT 
          AVG(CASE WHEN "program_id" = 4 THEN CAST("rate" AS FLOAT) END) AS "organic_average_price",
          AVG(CASE WHEN "program_id" = 5 THEN CAST("rate" AS FLOAT) END) AS "reel_average_price"
        FROM "transactions"
        WHERE "date" >= :startDate AND "date" <= :endDate
        ${whereConditions.length > 0 ? 'AND ' + whereConditions.join(' AND ') : ''};
      `;

      const [avgResult] = await sequelize.query(avgQuery, {
        replacements: { startDate, endDate, ...replacements },
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

    let whereConditions: string[] = [];
    let replacements: any = { limit, offset };

    let brandIdArray = brandId ? brandId.split(",").map((id: any) => parseInt(id, 10)) : [];

    if (brandId) {
      whereConditions.push('"brand_id" IN (:brandId)');
      replacements.brandId = brandIdArray;
    }

    if (seasonId) {
      const idArray = seasonId.split(",").map((id: any) => parseInt(id, 10));
      whereConditions.push('"season_id" IN (:seasonId)');
      replacements.seasonId = idArray;
    }

    if (countryId) {
      const idArray = countryId.split(",").map((id: any) => parseInt(id, 10));
      whereConditions.push('"country_id" IN (:countryId)');
      replacements.countryId = idArray;
    }

    if (stateId) {
      const idArray = stateId.split(",").map((id: any) => parseInt(id, 10));
      whereConditions.push('"state_id" IN (:stateId)');
      replacements.stateId = idArray;
    }

    if (districtId) {
      const idArray = districtId.split(",").map((id: any) => parseInt(id, 10));
      whereConditions.push('"district_id" IN (:districtId)');
      replacements.districtId = idArray;
    }

    let query = `
      SELECT * FROM "lint-pricings"
      ${whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''}
      ORDER BY "id" DESC
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
      const { startDate, endDate } = row;

      const avgQuery = `
        SELECT 
          AVG(CASE WHEN ss."program_id" = 4 THEN CAST(ss."rate" AS FLOAT) END) AS "organic_average_price",
          AVG(CASE WHEN ss."program_id" = 5 THEN CAST(ss."rate" AS FLOAT) END) AS "reel_average_price"
        FROM "gin_sales" ss
        INNER JOIN "ginners" s ON ss."ginner_id" = s."id"
        WHERE ss."date" >= :startDate AND ss."date" <= :endDate
        ${whereConditions.length > 0 ? 'AND ' + whereConditions.join(' AND ') : ''};
      `;

      const [avgResult] = await sequelize.query(avgQuery, {
        replacements: {
          startDate,
          endDate,
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

    let whereConditions: string[] = [];
    let replacements: any = { limit, offset };

    let brandIdArray = brandId ? brandId.split(",").map((id: any) => parseInt(id, 10)) : [];

    if (brandId) {
      whereConditions.push('"brand_id" IN (:brandId)');
      replacements.brandId = brandIdArray;
    }

    if (seasonId) {
      const idArray = seasonId.split(",").map((id: any) => parseInt(id, 10));
      whereConditions.push('"season_id" IN (:seasonId)');
      replacements.seasonId = idArray;
    }

    if (countryId) {
      const idArray = countryId.split(",").map((id: any) => parseInt(id, 10));
      whereConditions.push('"country_id" IN (:countryId)');
      replacements.countryId = idArray;
    }

    if (stateId) {
      const idArray = stateId.split(",").map((id: any) => parseInt(id, 10));
      whereConditions.push('"state_id" IN (:stateId)');
      replacements.stateId = idArray;
    }

    if (districtId) {
      const idArray = districtId.split(",").map((id: any) => parseInt(id, 10));
      whereConditions.push('"district_id" IN (:districtId)');
      replacements.districtId = idArray;
    }

    let query = `
      SELECT * FROM "yarn-pricings"
      ${whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''}
      ORDER BY "id" DESC
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
      const { startDate, endDate } = row;

      const avgQuery = `
        SELECT 
          AVG(CASE WHEN ss."program_id" = 4 THEN CAST(ss."price" AS FLOAT) END) AS "organic_average_price",
          AVG(CASE WHEN ss."program_id" = 5 THEN CAST(ss."price" AS FLOAT) END) AS "reel_average_price"
        FROM "spin_sales" ss
        INNER JOIN "spinners" s ON ss."spinner_id" = s."id"
        WHERE ss."date" >= :startDate AND ss."date" <= :endDate
        ${whereConditions.length > 0 ? 'AND ' + whereConditions.join(' AND ') : ''};
      `;

      const [avgResult] = await sequelize.query(avgQuery, {
        replacements: {
          startDate,
          endDate,
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