import { Request, Response } from "express";
import sequelize from "../../util/dbConn";


const getPricyByCountry = async (req: Request, res: Response) => {
  try {
    const { countryId, stateId, districtId, brandId, from, to }: any = req.query;

    let whereConditions: string[] = [];
    let replacements: any = {};
    let brandIdArray = brandId ? brandId.split(",").map((id: any) => parseInt(id, 10)) : [];

    if (brandId) {
      const idArray = brandId.split(",").map((id: any) => parseInt(id, 10));
      whereConditions.push('"brand_id" IN (:brandId)');
      replacements.brandId = idArray;
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

    replacements.from = from;
    replacements.to = to;

    let query = `
      SELECT * FROM "yarn-pricings"
      ${whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') + ' AND ' : 'WHERE '} 
      "startDate" >= :from AND "endDate" <= :to
      ORDER BY "id" DESC;
    `;

    const rows = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    const count = rows.length;

    if (count === 0) {
      return res.sendSuccess(res, { country: [], reel: [], organic: [], conventional: [] });
    }

    const responseData: any = {
      country: [],
      reel: [],
      organic: [],
      conventional: []
    };

    await Promise.all(rows.map(async (row: any) => {
      const { startDate, endDate, country_id, market_price } = row;

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
        replacements: { startDate, endDate, brandId: brandIdArray || [], ...replacements },
        type: sequelize.QueryTypes.SELECT,
      });

      const countryName = await getCountryNameById(country_id);

      if (countryName) {
        responseData.country.push(countryName);
        responseData.reel.push(avgResult.reel_average_price || 0);
        responseData.organic.push(avgResult.organic_average_price || 0);
        responseData.conventional.push(Number(market_price) || 0);
      }
    }));

    return res.sendSuccess(res, responseData);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

async function getCountryNameById(country_id: number): Promise<string> {
  const query = `
    SELECT "county_name" FROM "countries" WHERE "id" = :country_id;
  `;
  const [country] = await sequelize.query(query, {
    replacements: { country_id },
    type: sequelize.QueryTypes.SELECT,
  });
  return country ? country.county_name : '';
}

const getStatesByCountryAndStateId = async (stateIds: number[], countryIds: number[]) => {
  try {
    const query = `
      SELECT id, "state_name"
      FROM "states"
      WHERE "id" IN (:stateIds) AND "country_id" IN (:countryIds)
    `;

    const result = await sequelize.query(query, {
      replacements: { stateIds, countryIds },
      type: sequelize.QueryTypes.SELECT
    });


    const stateMap = new Map();
    result.forEach((state: any) => {
      stateMap.set(state.id, state.state_name);
    });

    return stateMap;
  } catch (error: any) {
    console.error('Error fetching states:', error);
    throw new Error('Error fetching states');
  }
};

const getPricyByState = async (req: Request, res: Response) => {
  try {
    const { countryId, stateId, districtId, brandId, from, to }: any = req.query;

    let whereConditions: string[] = [];
    let replacements: any = {};
    let brandIdArray = brandId ? brandId.split(",").map((id: any) => parseInt(id, 10)) : [];

    if (brandId) {
      const idArray = brandId.split(",").map((id: any) => parseInt(id, 10));
      whereConditions.push('"brand_id" IN (:brandId)');
      replacements.brandId = idArray;
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

    replacements.from = from;
    replacements.to = to;

    let query = `
      SELECT * FROM "yarn-pricings"
      ${whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') + ' AND ' : 'WHERE '} 
      "startDate" >= :from AND "endDate" <= :to
      ORDER BY "id" DESC;
    `;

    const rows = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    const count = rows.length;

    if (count === 0) {
      return res.sendSuccess(res, { state: [], reel: [], organic: [], conventional: [] });
    }

    const responseData: any = {
      state: [],
      reel: [],
      organic: [],
      conventional: []
    };

    const stateIds = rows.map((row: any) => row.state_id);
    const countryIds = rows.map((row: any) => row.country_id);

    const stateMap = await getStatesByCountryAndStateId(stateIds, countryIds);

    await Promise.all(rows.map(async (row: any) => {
      const { startDate, endDate, state_id, market_price } = row;

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
        replacements: { startDate, endDate, brandId: brandIdArray || [], ...replacements },
        type: sequelize.QueryTypes.SELECT,
      });

      const stateName = stateMap.get(state_id);

      if (stateName) {
        responseData.state.push(stateName);
        responseData.reel.push(avgResult.reel_average_price || 0);
        responseData.organic.push(avgResult.organic_average_price || 0);
        responseData.conventional.push(Number(market_price) || 0);
      }
    }));

    return res.sendSuccess(res, responseData);
  } catch (error: any) {
    return res.sendError(res, error.message);
  }
};

export {
  getPricyByCountry,
  getPricyByState
};