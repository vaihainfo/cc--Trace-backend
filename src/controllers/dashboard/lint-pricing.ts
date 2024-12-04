import { Request, Response } from "express";
import moment from 'moment';
import { Op, QueryTypes, Sequelize } from "sequelize";
import * as yup from 'yup';
import sequelize from "../../util/dbConn";


const getPricyByCountry = async (req: Request, res: Response) => {
  // try {
  //   const { countryId, stateId, districtId, brandId, from, to }: any = req.query;

  //   let whereConditions: string[] = [];
  //   let replacements: any = {};
  //   let brandIdArray = brandId ? brandId.split(",").map((id: any) => parseInt(id, 10)) : [];

  //   if (brandId) {
  //     const idArray = brandId.split(",").map((id: any) => parseInt(id, 10));
  //     whereConditions.push('"brand_id" IN (:brandId)');
  //     replacements.brandId = idArray;
  //   }

  //   if (countryId) {
  //     const idArray = countryId.split(",").map((id: any) => parseInt(id, 10));
  //     whereConditions.push('"country_id" IN (:countryId)');
  //     replacements.countryId = idArray;
  //   }

  //   if (stateId) {
  //     const idArray = stateId.split(",").map((id: any) => parseInt(id, 10));
  //     whereConditions.push('"state_id" IN (:stateId)');
  //     replacements.stateId = idArray;
  //   }

  //   if (districtId) {
  //     const idArray = districtId.split(",").map((id: any) => parseInt(id, 10));
  //     whereConditions.push('"district_id" IN (:districtId)');
  //     replacements.districtId = idArray;
  //   }

  //   replacements.from = from;
  //   replacements.to = to;

  //   let query = `
  //     SELECT * FROM "lint-pricings"
  //     ${whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') + ' AND ' : 'WHERE '} 
  //     "startDate" >= :from AND "endDate" <= :to
  //     ORDER BY "id" DESC;
  //   `;

  //   const rows = await sequelize.query(query, {
  //     replacements,
  //     type: sequelize.QueryTypes.SELECT,
  //   });

  //   const count = rows.length;

  //   if (count === 0) {
  //     return res.sendSuccess(res, { country: [], reel: [], organic: [], conventional: [] });
  //   }

  //   const responseData: any = {
  //     country: [],
  //     reel: [],
  //     organic: [],
  //     conventional: []
  //   };

  //   await Promise.all(rows.map(async (row: any) => {
  //     const { startDate, endDate, country_id, market_price } = row;

  //     const avgQuery = `
  //       SELECT 
  //         AVG(CASE WHEN ss."program_id" = 4 THEN CAST(ss."rate" AS FLOAT) END) AS "organic_average_price",
  //         AVG(CASE WHEN ss."program_id" = 5 THEN CAST(ss."rate" AS FLOAT) END) AS "reel_average_price"
  //       FROM "gin_sales" ss
  //       INNER JOIN "ginners" s ON ss."ginner_id" = s."id"
  //       WHERE ss."date" >= :startDate AND ss."date" <= :endDate
  //       ${whereConditions.length > 0 ? 'AND ' + whereConditions.join(' AND ') : ''};
  //     `;

  //     const [avgResult] = await sequelize.query(avgQuery, {
  //       replacements: { startDate, endDate, brandId: brandIdArray || [], ...replacements },
  //       type: sequelize.QueryTypes.SELECT,
  //     });

  //     const countryName = await getCountryNameById(country_id);

  //     if (countryName) {
  //       responseData.country.push(countryName);
  //       responseData.reel.push(avgResult.reel_average_price || 0);
  //       responseData.organic.push(avgResult.organic_average_price || 0);
  //       responseData.conventional.push(Number(market_price) || 0);
  //     }
  //   }));

  //   return res.sendSuccess(res, responseData);
  // }
  try {
    const { countryId, districtId, brandId, seasonId, from, to }: any =
      req.query;

    let whereConditions: string[] = [];
    let replacements: any = {};
    let brandIdArray = brandId ? brandId.split(",").map((id: any) => parseInt(id, 10)) : [];
    let avgQueryConditions: string[] = [];

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

    if (districtId) {
      addCondition("district_id", districtId, "lp");
    }

    let fromDate = new Date(from);
    fromDate.setHours(0, 0, 0, 0);
    replacements.from = fromDate;
    let toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    replacements.to = toDate;

    let allcountryIds: any = new Set();

    let queryNew = `
            SELECT 
    s."country_id",
      AVG(CASE WHEN ss."program_id" = 4 THEN CAST(ss."rate" AS FLOAT) END) AS "organic_average_price",
      AVG(CASE WHEN ss."program_id" = 5 THEN CAST(ss."rate" AS FLOAT) END) AS "reel_average_price"
    FROM "gin_sales" ss
    INNER JOIN "ginners" s ON ss."ginner_id" = s."id"
    WHERE ss."date" >= :from AND ss."date" <= :to
    ${avgQueryConditions.length > 0 ? 'AND ' + avgQueryConditions.join(' AND ') : ''}
    GROUP BY s."country_id"
    ORDER BY s."country_id" DESC;
        `;

    const rows = await sequelize.query(queryNew, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    rows.forEach((row: any) => {
      allcountryIds.add(row.country_id);
    })

    const avgQueryNew = `SELECT "country_id", AVG("market_price") AS "avg_market_price" FROM "lint-pricings" AS "lp"
      ${whereConditions.length > 0
        ? "WHERE " + whereConditions.join(" AND ") + " AND "
        : "WHERE "
      } 
      "lp"."startDate" >= :from AND "lp"."endDate" <= :to
      GROUP BY "lp"."country_id"
      ORDER BY "lp"."country_id" DESC
       `;

    const rows2 = await sequelize.query(avgQueryNew, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    rows2.forEach((row: any) => {
      allcountryIds.add(row.country_id);
    })

    const responseData: {
      country: string[],
      reel: string[],
      organic: number[],
      conventional: number[],
    } = {
      country: [],
      reel: [],
      organic: [],
      conventional: [],
    };

    await Promise.all(
      Array.from(allcountryIds).map(async (country_id: any, index: number) => {
        const countryName: string = await getCountryNameById(country_id);

        responseData.country.push(countryName);

        const data1Item = rows.find((item: any) => item.country_id === country_id);

        if (data1Item) {
          responseData.reel.push(data1Item.reel_average_price || 0);
          responseData.organic.push(data1Item.organic_average_price || 0);
        } else {
          responseData.reel.push("0");
          responseData.organic.push(0);
        }

        const data2Item = rows2.find((item: any) => item.country_id === country_id);

        if (data2Item) {

          responseData.conventional.push(Number(data2Item.avg_market_price) || 0);
        } else {
          responseData.conventional.push(0);
        }
      })
    );

    return res.sendSuccess(res, responseData);
  }
  catch (error: any) {
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

const getStatesByCountryAndStateId = async (
  stateId: string
) => {
  try {
    const query = `
      SELECT id, "state_name"
      FROM "states"
      WHERE "id" = :stateId;
    `;

    const result = await sequelize.query(query, {
      replacements: { stateId },
      type: sequelize.QueryTypes.SELECT,
    });

    return result[0].state_name;
  } catch (error: any) {
    console.error("Error fetching states:", error);
    throw new Error("Error fetching states");
  }
};

const getPricyByState = async (req: Request, res: Response) => {
  // try {
  //   const { countryId, stateId, districtId, brandId, from, to }: any = req.query;

  //   let whereConditions: string[] = [];
  //   let replacements: any = {};
  //   let brandIdArray = brandId ? brandId.split(",").map((id: any) => parseInt(id, 10)) : [];

  //   if (brandId) {
  //     const idArray = brandId.split(",").map((id: any) => parseInt(id, 10));
  //     whereConditions.push('"brand_id" IN (:brandId)');
  //     replacements.brandId = idArray;
  //   }

  //   if (countryId) {
  //     const idArray = countryId.split(",").map((id: any) => parseInt(id, 10));
  //     whereConditions.push('"country_id" IN (:countryId)');
  //     replacements.countryId = idArray;
  //   }

  //   if (stateId) {
  //     const idArray = stateId.split(",").map((id: any) => parseInt(id, 10));
  //     whereConditions.push('"state_id" IN (:stateId)');
  //     replacements.stateId = idArray;
  //   }

  //   if (districtId) {
  //     const idArray = districtId.split(",").map((id: any) => parseInt(id, 10));
  //     whereConditions.push('"district_id" IN (:districtId)');
  //     replacements.districtId = idArray;
  //   }

  //   replacements.from = from;
  //   replacements.to = to;

  //   let query = `
  //     SELECT * FROM "lint-pricings"
  //     ${whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') + ' AND ' : 'WHERE '} 
  //     "startDate" >= :from AND "endDate" <= :to
  //     ORDER BY "id" DESC;
  //   `;

  //   const rows = await sequelize.query(query, {
  //     replacements,
  //     type: sequelize.QueryTypes.SELECT,
  //   });

  //   const count = rows.length;

  //   if (count === 0) {
  //     return res.sendSuccess(res, { state: [], reel: [], organic: [], conventional: [] });
  //   }

  //   const responseData: any = {
  //     state: [],
  //     reel: [],
  //     organic: [],
  //     conventional: []
  //   };

  //   const stateIds = rows.map((row: any) => row.state_id);
  //   const countryIds = rows.map((row: any) => row.country_id);

  //   const stateMap = await getStatesByCountryAndStateId(stateIds, countryIds);

  //   await Promise.all(rows.map(async (row: any) => {
  //     const { startDate, endDate, state_id, market_price } = row;

  //     const avgQuery = `
  //       SELECT 
  //         AVG(CASE WHEN ss."program_id" = 4 THEN CAST(ss."rate" AS FLOAT) END) AS "organic_average_price",
  //         AVG(CASE WHEN ss."program_id" = 5 THEN CAST(ss."rate" AS FLOAT) END) AS "reel_average_price"
  //       FROM "gin_sales" ss
  //       INNER JOIN "ginners" s ON ss."ginner_id" = s."id"
  //       WHERE ss."date" >= :startDate AND ss."date" <= :endDate
  //       ${whereConditions.length > 0 ? 'AND ' + whereConditions.join(' AND ') : ''};
  //     `;

  //     const [avgResult] = await sequelize.query(avgQuery, {
  //       replacements: { startDate, endDate, brandId: brandIdArray || [], ...replacements },
  //       type: sequelize.QueryTypes.SELECT,
  //     });

  //     const stateName = stateMap.get(state_id);

  //     if (stateName) {
  //       responseData.state.push(stateName);
  //       responseData.reel.push(avgResult.reel_average_price || 0);
  //       responseData.organic.push(avgResult.organic_average_price || 0);
  //       responseData.conventional.push(Number(market_price) || 0);
  //     }
  //   }));

  //   return res.sendSuccess(res, responseData);
  // }
  try {
    const { countryId, stateId, districtId, brandId, seasonId, from, to }: any =
      req.query;

    if (!countryId) {
      return res.sendError(res, "Please send countryId");
    }

    let whereConditions: string[] = [];
    let replacements: any = {};
    let brandIdArray = brandId ? brandId.split(",").map((id: any) => parseInt(id, 10)) : [];
    let avgQueryConditions: string[] = [];

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

    if (districtId) {
      addCondition("district_id", districtId, "lp");
    }

    let fromDate = new Date(from);
    fromDate.setHours(0, 0, 0, 0);
    replacements.from = fromDate;
    let toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    replacements.to = toDate;

    let allcountryIds: any = new Set();

    let queryNew = `
            SELECT 
    s."state_id",
      AVG(CASE WHEN ss."program_id" = 4 THEN CAST(ss."rate" AS FLOAT) END) AS "organic_average_price",
      AVG(CASE WHEN ss."program_id" = 5 THEN CAST(ss."rate" AS FLOAT) END) AS "reel_average_price"
    FROM "gin_sales" ss
    INNER JOIN "ginners" s ON ss."ginner_id" = s."id"
    WHERE ss."date" >= :from AND ss."date" <= :to
    ${avgQueryConditions.length > 0 ? 'AND ' + avgQueryConditions.join(' AND ') : ''}
    GROUP BY s."state_id"
    ORDER BY s."state_id" DESC;
        `;

    const rows = await sequelize.query(queryNew, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    rows.forEach((row: any) => {
      allcountryIds.add(row.state_id);
    })

    const avgQueryNew = `SELECT "state_id", AVG("market_price") AS "avg_market_price" FROM "lint-pricings" AS "lp"
      ${whereConditions.length > 0
        ? "WHERE " + whereConditions.join(" AND ") + " AND "
        : "WHERE "
      } 
      "lp"."startDate" >= :from AND "lp"."endDate" <= :to
      GROUP BY "lp"."state_id"
      ORDER BY "lp"."state_id" DESC
       `;

    const rows2 = await sequelize.query(avgQueryNew, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    rows2.forEach((row: any) => {
      allcountryIds.add(row.state_id);
    })

    const responseData: {
      state: string[],
      reel: string[],
      organic: number[],
      conventional: number[],
    } = {
      state: [],
      reel: [],
      organic: [],
      conventional: [],
    };

    await Promise.all(
      Array.from(allcountryIds).map(async (state_id: any, index: number) => {
        const stateName: string = await getStatesByCountryAndStateId(state_id);

        responseData.state.push(stateName);

        const data1Item = rows.find((item: any) => item.state_id === state_id);

        if (data1Item) {
          responseData.reel.push(data1Item.reel_average_price || 0);
          responseData.organic.push(data1Item.organic_average_price || 0);
        } else {
          responseData.reel.push("0");
          responseData.organic.push(0);
        }

        const data2Item = rows2.find((item: any) => item.state_id === state_id);

        if (data2Item) {

          responseData.conventional.push(Number(data2Item.avg_market_price) || 0);
        } else {
          responseData.conventional.push(0);
        }
      })
    );

    return res.sendSuccess(res, responseData);
  }
  catch (error: any) {
    return res.sendError(res, error.message);
  }
};

export {
  getPricyByCountry,
  getPricyByState
};