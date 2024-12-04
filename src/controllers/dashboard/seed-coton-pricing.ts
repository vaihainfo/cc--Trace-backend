import { Request, Response } from "express";
import sequelize from "../../util/dbConn";

const getPricyByCountry = async (req: Request, res: Response) => {
  try {
    const { countryId, districtId, brandId, seasonId, from, to }: any =
      req.query;

    let whereConditions: string[] = [];
    let replacements: any = {};
    let brandIdArray = brandId
      ? brandId.split(",").map((id: any) => parseInt(id, 10))
      : [];

    if (seasonId) {
      whereConditions.push('"season_id" = :seasonId');
      replacements.seasonId = Number(seasonId);
    }

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

    if (districtId) {
      const idArray = districtId.split(",").map((id: any) => parseInt(id, 10));
      whereConditions.push('"district_id" IN (:districtId)');
      replacements.districtId = idArray;
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
              "country_id",
              AVG(CASE WHEN "program_id" = 4 THEN CAST("rate" AS FLOAT) END) AS "organic_average_price",
              AVG(CASE WHEN "program_id" = 5 THEN CAST("rate" AS FLOAT) END) AS "reel_average_price"
            FROM "transactions"
            WHERE "date" >= :from AND "date" <= :to
            ${whereConditions.length > 0
        ? "AND " + whereConditions.join(" AND ")
        : ""
      }
           GROUP BY "country_id"
           ORDER BY "country_id" DESC;
           `;

    const rows = await sequelize.query(queryNew, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    rows.forEach((row: any) => {
      allcountryIds.add(row.country_id);
    })

    const avgQueryNew = `SELECT "country_id", AVG("market_price") AS "avg_market_price" FROM "seed-cotton-pricings"
      ${whereConditions.length > 0
        ? "WHERE " + whereConditions.join(" AND ") + " AND "
        : "WHERE "
      } 
      "startDate" >= :from AND "endDate" <= :to
      GROUP BY "country_id"
      ORDER BY "country_id" DESC
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
  return country ? country.county_name : "";
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

const getPricyByStates = async (req: Request, res: Response) => {
  // try {
  //   const { countryId, stateId, districtId, brandId, seasonId, from, to }: any =
  //     req.query;

  //   if (!countryId) {
  //     return res.sendError(res, "Please send countryId");
  //   }

  //   let whereConditions: string[] = [];
  //   let replacements: any = {};
  //   let brandIdArray = brandId
  //     ? brandId.split(",").map((id: any) => parseInt(id, 10))
  //     : [];

  //   if (stateId) {
  //     const idArray = stateId.split(",").map((id: any) => parseInt(id, 10));
  //     whereConditions.push('"state_id" IN (:stateId)');
  //     replacements.stateId = idArray;
  //   }

  //   if (seasonId) {
  //     whereConditions.push('"season_id" = :seasonId');
  //     replacements.seasonId = Number(seasonId);
  //   }

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

  //   let fromDate = new Date(from);
  //   fromDate.setHours(0, 0, 0, 0);
  //   replacements.from = fromDate;
  //   let toDate = new Date(to);
  //   toDate.setHours(23, 59, 59, 999);
  //   replacements.to = toDate;

  //   let query = `
  //      SELECT "state_id", AVG("market_price") AS "avg_market_price" FROM "seed-cotton-pricings"
  //     ${whereConditions.length > 0
  //       ? "WHERE " + whereConditions.join(" AND ") + " AND "
  //       : "WHERE "
  //     } 
  //     "startDate" >= :from AND "endDate" <= :to
  //     GROUP BY "state_id"
  //     ORDER BY "state_id" DESC;
  //   `;

  //   const rows = await sequelize.query(query, {
  //     replacements,
  //     type: sequelize.QueryTypes.SELECT,
  //   });

  //   console.log(rows, "=================")

  //   const count = rows.length;

  //   const responseData: {
  //     state: string[],
  //     reel: string[],
  //     organic: number[],
  //     conventional: number[],
  //   } = {
  //     state: [],
  //     reel: [],
  //     organic: [],
  //     conventional: [],
  //   };

  //   if (count !== 0) {
  //     await Promise.all(
  //       rows.map(async (row: any) => {
  //         const { state_id, avg_market_price } = row;

  //         const avgQuery = `
  //           SELECT 
  //             "state_id",
  //             AVG(CASE WHEN "program_id" = 4 THEN CAST("rate" AS FLOAT) END) AS "organic_average_price",
  //             AVG(CASE WHEN "program_id" = 5 THEN CAST("rate" AS FLOAT) END) AS "reel_average_price"
  //           FROM "transactions"
  //           WHERE "date" >= :from AND "date" <= :to
  //           ${whereConditions.length > 0
  //             ? "AND " + whereConditions.join(" AND ")
  //             : ""
  //           }
  //          GROUP BY "state_id"`;

  //         const [avgResult] = await sequelize.query(avgQuery, {
  //           replacements: {
  //             from,
  //             to,
  //             brandId: brandIdArray || [],
  //             ...replacements,
  //           },
  //           type: sequelize.QueryTypes.SELECT,
  //         });


  //         const stateName: string = await getStatesByCountryAndStateId(state_id);
  //         console.log(avgResult, stateName, state_id, row, 'ppppppppppppppppppppppppp')

  //         if (stateName) {
  //           responseData.state.push(stateName);
  //           responseData.reel.push(avgResult.reel_average_price || 0);
  //           responseData.organic.push(avgResult.organic_average_price || 0);
  //           responseData.conventional.push(Number(avg_market_price) || 0);
  //         }
  //       })
  //     );
  //   } else {
  //     const avgQuery = `
  //       SELECT 
  //         AVG(CASE WHEN "program_id" = 4 THEN CAST("rate" AS FLOAT) END) AS "organic_average_price",
  //         AVG(CASE WHEN "program_id" = 5 THEN CAST("rate" AS FLOAT) END) AS "reel_average_price",
  //         state_id as state_id
  //       FROM "transactions"
  //       WHERE "date" >= :from AND "date" <= :to
  //     ${whereConditions.length > 0 ? "AND " + whereConditions.join(" AND ") : ""
  //       } GROUP BY state_id`;

  //     const avgResult = await sequelize.query(avgQuery, {
  //       replacements: {
  //         from,
  //         to,
  //         brandId: brandIdArray || [],
  //         ...replacements,
  //       },
  //       type: sequelize.QueryTypes.SELECT,
  //     });

  //     await Promise.all(
  //       avgResult.map(async (item: any, index: number) => {
  //         const stateName: string = await getStatesByCountryAndStateId(item.state_id);
  //         responseData.state.push(stateName);
  //         responseData.reel.push(avgResult[index].reel_average_price || 0);
  //         responseData.organic.push(
  //           avgResult[index].organic_average_price || 0
  //         );
  //         responseData.conventional.push(0);
  //       })
  //     );
  //   }

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
    let brandIdArray = brandId
      ? brandId.split(",").map((id: any) => parseInt(id, 10))
      : [];

    if (seasonId) {
      whereConditions.push('"season_id" = :seasonId');
      replacements.seasonId = Number(seasonId);
    }

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

    let fromDate = new Date(from);
    fromDate.setHours(0, 0, 0, 0);
    replacements.from = fromDate;
    let toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    replacements.to = toDate;

    let allStateIds: any = new Set();

    let queryNew = `
            SELECT 
              "state_id",
              AVG(CASE WHEN "program_id" = 4 THEN CAST("rate" AS FLOAT) END) AS "organic_average_price",
              AVG(CASE WHEN "program_id" = 5 THEN CAST("rate" AS FLOAT) END) AS "reel_average_price"
            FROM "transactions"
            WHERE "date" >= :from AND "date" <= :to
            ${whereConditions.length > 0
        ? "AND " + whereConditions.join(" AND ")
        : ""
      }
           GROUP BY "state_id"
           ORDER BY "state_id" DESC;
           `;

    const rows = await sequelize.query(queryNew, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    rows.forEach((row: any) => {
      allStateIds.add(row.state_id);
    })

    const avgQueryNew = `SELECT "state_id", AVG("market_price") AS "avg_market_price" FROM "seed-cotton-pricings"
      ${whereConditions.length > 0
        ? "WHERE " + whereConditions.join(" AND ") + " AND "
        : "WHERE "
      } 
      "startDate" >= :from AND "endDate" <= :to
      GROUP BY "state_id"
      ORDER BY "state_id" DESC
       `;

    const rows2 = await sequelize.query(avgQueryNew, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    rows2.forEach((row: any) => {
      allStateIds.add(row.state_id);
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
      Array.from(allStateIds).map(async (state_id: any, index: number) => {
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
    console.log(error)
    return res.sendError(res, error.message);
  }
};

export { getPricyByCountry, getPricyByStates };