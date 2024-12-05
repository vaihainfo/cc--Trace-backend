import { Request, Response } from "express";
import sequelize from "../../util/dbConn";


const getPricyByCountry = async (req: Request, res: Response) => {
  try {
    let { from, to }: any = req.query;
    const { countryId, districtId, brandId, seasonId}: any =
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

    const fixYearFormat = (dateString:any) => {
      const year = dateString.slice(0, 2);  
      const monthAndDay = dateString.slice(2); 
    
      const fullYear = `20${year}`;  
    
    
      return `${fullYear}${monthAndDay}`;
    };
    
    
    from = fixYearFormat(from);
    to = fixYearFormat(to);
    
    let fromDate = new Date(Date.parse(from)); 
    let toDate = new Date(Date.parse(to));     
    
    
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      console.error('Invalid date:', from, to);
    } else {
      fromDate.setUTCHours(0, 0, 0, 0); 
      toDate.setUTCHours(23, 59, 59, 999);    
    
      replacements.from = fromDate.toISOString();
      replacements.to = toDate.toISOString();
    }
    

    let allcountryIds: any = new Set();

    let queryNew = `
            SELECT 
    s."country_id",
      AVG(CASE WHEN ss."program_id" = 4 THEN CAST(ss."price" AS FLOAT) END) AS "organic_average_price",
      AVG(CASE WHEN ss."program_id" = 5 THEN CAST(ss."price" AS FLOAT) END) AS "reel_average_price"
    FROM "spin_sales" ss
    INNER JOIN "spinners" s ON ss."spinner_id" = s."id"
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

    const avgQueryNew = `SELECT "country_id", AVG("market_price") AS "avg_market_price" FROM "yarn-pricings" AS "lp"
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
      reel: number[],
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
          responseData.reel.push(0);
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
  try {
    let {from, to}: any = req.query;
    const { countryId, stateId, districtId, brandId, seasonId }: any =
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

    const fixYearFormat = (dateString:any) => {
      const year = dateString.slice(0, 2);  
      const monthAndDay = dateString.slice(2); 
    
      const fullYear = `20${year}`;  
    
    
      return `${fullYear}${monthAndDay}`;
    };
    
    
    from = fixYearFormat(from);
    to = fixYearFormat(to);
    
    let fromDate = new Date(Date.parse(from)); 
    let toDate = new Date(Date.parse(to));     
    
    
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      console.error('Invalid date:', from, to);
    } else {
      fromDate.setUTCHours(0, 0, 0, 0); 
      toDate.setUTCHours(23, 59, 59, 999);    
    
      replacements.from = fromDate.toISOString();
      replacements.to = toDate.toISOString();
    }
    

    let allcountryIds: any = new Set();

    let queryNew = `
            SELECT 
    s."state_id",
      AVG(CASE WHEN ss."program_id" = 4 THEN CAST(ss."price" AS FLOAT) END) AS "organic_average_price",
      AVG(CASE WHEN ss."program_id" = 5 THEN CAST(ss."price" AS FLOAT) END) AS "reel_average_price"
    FROM "spin_sales" ss
    INNER JOIN "spinners" s ON ss."spinner_id" = s."id"
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

    const avgQueryNew = `SELECT "state_id", AVG("market_price") AS "avg_market_price" FROM "yarn-pricings" AS "lp"
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
      reel: number[],
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
          responseData.reel.push(0);
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