import { Op, Sequelize, where } from "sequelize";
import { Request, Response, raw } from "express";
import * as ExcelJS from "exceljs";
import * as path from "path";
import moment from "moment";
import sequelize from "../../util/dbConn";

const fetchDataMonitorGinnerPagination = async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { seasonId, countryId, brandId, type, processor, sort }: any = req.query;
    const duration = String(req.query.duration).trim();
    const offset = (page - 1) * limit;
    const whereCondition: any = [];
    try {
        if (seasonId) {
            const idArray: number[] = seasonId
              .split(",")
              .map((id: any) => parseInt(id, 10));
            whereCondition.push(`gp.season_id in (${idArray})`)
          }
    
          if (countryId) {
            const idArray: number[] = countryId
              .split(",")
              .map((id: any) => parseInt(id, 10));
            whereCondition.push(`g.country_id in (${idArray})`)
          }

          if (brandId) {
            const idArray = brandId.split(",").map((id: any) => parseInt(id, 10));
            whereCondition.push(`g.brand && ARRAY[${idArray.join(',')}]`);
          }

          if(!type){
            return res.sendError(res, "Type Process or Sales is required");
          }

          let startDate: string | null = null;

        if (duration) {
          const now = new Date();
          switch (duration) {
            case '7': {
              startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
              break;
            }
            case '14': {
              startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
              break;
            }
            case '30': {
              startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
              break;
            }
            case '45': {
              startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
              break;
            }
            case '90': {
              startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
              break;
            }
            default: {
              startDate = null;
              break
            }
          }
        }
  
        const whereClause = whereCondition.length > 0 ? `WHERE ${whereCondition.join(' AND ')} ` : '';

        let typeTable = ''

        if(type?.toLowerCase() === 'process'){
          typeTable= 'gin_processes'
        }else if(type?.toLowerCase() === 'sales'){
          typeTable= 'gin_sales'
        }else{
          return res.sendError(res, "Type Process or Sales is required");
        }

        const dataQuery = `
            SELECT 
              g.id AS ginner_id, 
              g.name AS ginner_name,
              c.id AS country_id,
              c.county_name AS country_name,
              STRING_AGG(DISTINCT s.name, ', ') AS season_name,
              MAX(gp.date) AS last_date,
              CASE 
                WHEN MAX(gp.date) IS NOT NULL THEN
                    CASE
                        WHEN CURRENT_DATE - MAX(gp.date) >= INTERVAL '365 days' THEN     
                            (EXTRACT(YEAR FROM AGE(CURRENT_DATE, MAX(gp.date)))) || ' year(s) ago'
                        WHEN CURRENT_DATE - MAX(gp.date) >= INTERVAL '30 days' THEN      
                            FLOOR(EXTRACT(DAY FROM (CURRENT_DATE - MAX(gp.date))) / 30) || ' month(s) ago'
                        ELSE
                            EXTRACT(DAY FROM (CURRENT_DATE - MAX(gp.date))) || ' day(s) ago'   
                    END
                ELSE 'No ${type?.toLowerCase()} record'
              END AS time_since_last_update 
            FROM ginners g 
            LEFT JOIN ${typeTable} gp ON g.id = gp.ginner_id
            LEFT JOIN countries c ON g.country_id = c.id
            LEFT JOIN seasons s on s.id = gp.season_id
            ${whereClause}
            GROUP BY  g.id,g.name,c.id
            HAVING MAX(gp.date) <= '${startDate}' OR MAX(gp.date) IS NULL
            ORDER BY last_date DESC nulls last
            LIMIT :limit OFFSET :offset`;


          const countQuery = `
            SELECT COUNT(g.id) AS total_count
             FROM ginners g 
            LEFT JOIN ${typeTable} gp ON g.id = gp.ginner_id
            LEFT JOIN countries c ON g.country_id = c.id
            LEFT JOIN seasons s on s.id = gp.season_id
            ${whereClause}
            GROUP BY  g.id,g.name,c.id
            HAVING MAX(gp.date) <= '${startDate}' OR MAX(gp.date) IS NULL
            `;


            const [countResult, rows] = await Promise.all([
                sequelize.query(countQuery, {
                  type: sequelize.QueryTypes.SELECT,
                }),
                sequelize.query(dataQuery, {
                  replacements: { limit, offset },
                  type: sequelize.QueryTypes.SELECT,
                })
              ]);


        const totalCount = countResult && countResult.length > 0 ? countResult.length : 0;

        return res.sendPaginationSuccess(res, rows, totalCount);

    } catch (error: any) {
      console.error(error);
      return res.sendError(res, error.message);
    }
  };

const exportDataMonitorGinnerPagination = async (req: Request, res: Response) => {
  let excelFilePath = '';
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { seasonId, countryId, brandId, type, processor, sort }: any = req.query;
  const duration = String(req.query.duration).trim();
  const offset = (page - 1) * limit;
  const whereCondition: any = [];
  try {
      if (seasonId) {
          const idArray: number[] = seasonId
            .split(",")
            .map((id: any) => parseInt(id, 10));
          whereCondition.push(`gp.season_id in (${idArray})`)
        }
  
        if (countryId) {
          const idArray: number[] = countryId
            .split(",")
            .map((id: any) => parseInt(id, 10));
          whereCondition.push(`g.country_id in (${idArray})`)
        }

        if (brandId) {
          const idArray = brandId.split(",").map((id: any) => parseInt(id, 10));
          whereCondition.push(`g.brand && ARRAY[${idArray.join(',')}]`);
        }

        if(!type){
          return res.sendError(res, "Type Process or Sales is required");
        }

        let startDate: string | null = null;

      if (duration) {
        const now = new Date();
        switch (duration) {
          case '7': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          case '14': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          case '30': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          case '45': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          case '90': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          default: {
            startDate = null;
            break
          }
        }
      }

      const whereClause = whereCondition.length > 0 ? `WHERE ${whereCondition.join(' AND ')} ` : '';

      let typeTable = ''

      if(type?.toLowerCase() === 'process'){
        excelFilePath = path.join("./upload", "excel-data-monitor-ginner-process.xlsx");
        typeTable= 'gin_processes'
      }else if(type?.toLowerCase() === 'sales'){
        excelFilePath = path.join("./upload", "excel-data-monitor-ginner-sales.xlsx");
        typeTable= 'gin_sales'
      }else{
        return res.sendError(res, "Type Process or Sales is required");
      }

      // Create the excel workbook file
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:F1');
      const mergedCell = worksheet.getCell('A1');
      if(type?.toLowerCase() === 'process'){
        mergedCell.value = 'CottonConnect | Data Entry Monitoring Ginner Process';
      }else{
        mergedCell.value = 'CottonConnect | Data Entry Monitoring Ginner Sales';
      }
      
      mergedCell.font = { bold: true };
      mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
      // Set bold font for header row
      let headerRow;

        headerRow = worksheet.addRow([
          "Sr No.", "Ginner Name", "Season", "Country", `Last date data updated-${type?.toLowerCase() === 'process' ? "Process" : "Sale"} data`, "Historical Update"
        ]);
      headerRow.font = { bold: true };

      const dataQuery = `
          SELECT 
            g.id AS ginner_id, 
            g.name AS ginner_name,
            c.id AS country_id,
            c.county_name AS country_name,
            STRING_AGG(DISTINCT s.name, ', ') AS season_name,
            MAX(gp.date) AS last_date,
            CASE 
              WHEN MAX(gp.date) IS NOT NULL THEN
                  CASE
                      WHEN CURRENT_DATE - MAX(gp.date) >= INTERVAL '365 days' THEN     
                          (EXTRACT(YEAR FROM AGE(CURRENT_DATE, MAX(gp.date)))) || ' year(s) ago'
                      WHEN CURRENT_DATE - MAX(gp.date) >= INTERVAL '30 days' THEN      
                          FLOOR(EXTRACT(DAY FROM (CURRENT_DATE - MAX(gp.date))) / 30) || ' month(s) ago'
                      ELSE
                          EXTRACT(DAY FROM (CURRENT_DATE - MAX(gp.date))) || ' day(s) ago'   
                  END
              ELSE 'No ${type?.toLowerCase()} record'
            END AS time_since_last_update 
          FROM ginners g 
          LEFT JOIN ${typeTable} gp ON g.id = gp.ginner_id
          LEFT JOIN countries c ON g.country_id = c.id
          LEFT JOIN seasons s on s.id = gp.season_id
          ${whereClause}
          GROUP BY  g.id,g.name,c.id
          HAVING MAX(gp.date) <= '${startDate}' OR MAX(gp.date) IS NULL
          ORDER BY last_date DESC nulls last
          LIMIT :limit OFFSET :offset`;



          const [rows] = await Promise.all([
              sequelize.query(dataQuery, {
                replacements: { limit, offset },
                type: sequelize.QueryTypes.SELECT,
              })
            ]);


            for await (const [index, item] of rows.entries()) {
              let rowValues = Object.values({
                index: index + 1,
                ginner: item.ginner_name ? item.ginner_name : "",
                season: item.season_name ? item.season_name : "",
                country: item.country_name ? item.country_name : "",
                last_date: item.last_date ? item.last_date : "",
                time_since_last_update: item.time_since_last_update ? item.time_since_last_update : "",
              });
              worksheet.addRow(rowValues);
            }
        // Auto-adjust column widths based on content
        worksheet.columns.forEach((column: any) => {
          let maxCellLength = 0;
          column.eachCell({ includeEmpty: true }, (cell: any) => {
            const cellLength = (cell.value ? cell.value.toString() : "").length;
            maxCellLength = Math.max(maxCellLength, cellLength);
          });
          column.width = Math.min(15, maxCellLength + 2); // Limit width to 30 characters
        });

        // Save the workbook
        await workbook.xlsx.writeFile(excelFilePath);

        if(type?.toLowerCase() === 'process'){
          return res.status(200).send({
            success: true,
            messgage: "File successfully Generated",
            data: process.env.BASE_URL + "excel-data-monitor-ginner-process.xlsx",
          });
        }else{
          return res.status(200).send({
            success: true,
            messgage: "File successfully Generated",
            data: process.env.BASE_URL + "excel-data-monitor-ginner-sales.xlsx",
          });
        }
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.message);
  }
};


const fetchDataMonitorSpinnerPagination = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { seasonId, countryId, brandId, type, processor, sort }: any = req.query;
  const duration = String(req.query.duration).trim();
  const offset = (page - 1) * limit;
  const whereCondition: any = [];
  try {
      if (seasonId) {
          const idArray: number[] = seasonId
            .split(",")
            .map((id: any) => parseInt(id, 10));
          whereCondition.push(`sp.season_id in (${idArray})`)
        }
  
        if (countryId) {
          const idArray: number[] = countryId
            .split(",")
            .map((id: any) => parseInt(id, 10));
          whereCondition.push(`spin.country_id in (${idArray})`)
        }

        if (brandId) {
          const idArray = brandId.split(",").map((id: any) => parseInt(id, 10));
          whereCondition.push(`spin.brand && ARRAY[${idArray.join(',')}]`);
        }

        if(!type){
          return res.sendError(res, "Type Process or Sales is required");
        }

        let startDate: string | null = null;

      if (duration) {
        const now = new Date();
        switch (duration) {
          case '7': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          case '14': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          case '30': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          case '45': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          case '90': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          default: {
            startDate = null;
            break
          }
        }
      }

      const whereClause = whereCondition.length > 0 ? `WHERE ${whereCondition.join(' AND ')} ` : '';

      let typeTable = ''

        if(type?.toLowerCase() === 'process'){
          typeTable= 'spin_processes'
        }else if(type?.toLowerCase() === 'sales'){
          typeTable= 'spin_sales'
        }else{
          return res.sendError(res, "Type Process or Sales is required");
        }


      const dataQuery = `
          SELECT 
            spin.id AS spinner_id, 
            spin.name AS spinner_name,
            c.id AS country_id,
            c.county_name AS country_name,
            STRING_AGG(DISTINCT s.name, ', ') AS season_name,
            MAX(sp.date) AS last_date,
            CASE 
              WHEN MAX(sp.date) IS NOT NULL THEN
                  CASE
                      WHEN CURRENT_DATE - MAX(sp.date) >= INTERVAL '365 days' THEN     
                          (EXTRACT(YEAR FROM AGE(CURRENT_DATE, MAX(sp.date)))) || ' year(s) ago'
                      WHEN CURRENT_DATE - MAX(sp.date) >= INTERVAL '30 days' THEN      
                          FLOOR(EXTRACT(DAY FROM (CURRENT_DATE - MAX(sp.date))) / 30) || ' month(s) ago'
                      ELSE
                          EXTRACT(DAY FROM (CURRENT_DATE - MAX(sp.date))) || ' day(s) ago'   
                  END
              ELSE 'No ${type?.toLowerCase()} record'
            END AS time_since_last_update 
          FROM spinners spin 
          LEFT JOIN ${typeTable} sp ON spin.id = sp.spinner_id
          LEFT JOIN countries c ON spin.country_id = c.id
          LEFT JOIN seasons s on s.id = sp.season_id
          ${whereClause}
          GROUP BY  spin.id,spin.name,c.id
          HAVING MAX(sp.date) <= '${startDate}' OR MAX(sp.date) IS NULL
          ORDER BY last_date DESC nulls last
          LIMIT :limit OFFSET :offset`;


        const countQuery = `
          SELECT COUNT(spin.id) AS total_count
            FROM spinners spin 
          LEFT JOIN ${typeTable} sp ON spin.id = sp.spinner_id
          LEFT JOIN countries c ON spin.country_id = c.id
          LEFT JOIN seasons s on s.id = sp.season_id
          ${whereClause}
          GROUP BY  spin.id,spin.name,c.id
          HAVING MAX(sp.date) <= '${startDate}' OR MAX(sp.date) IS NULL
          `;


          const [countResult, rows] = await Promise.all([
              sequelize.query(countQuery, {
                type: sequelize.QueryTypes.SELECT,
              }),
              sequelize.query(dataQuery, {
                replacements: { limit, offset },
                type: sequelize.QueryTypes.SELECT,
              })
            ]);


      const totalCount = countResult && countResult.length > 0 ? countResult.length : 0;

      return res.sendPaginationSuccess(res, rows, totalCount);

  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.message);
  }
};

const exportDataMonitorSpinnerPagination = async (req: Request, res: Response) => {
  let excelFilePath = '';
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { seasonId, countryId, brandId, type, processor, sort }: any = req.query;
  const duration = String(req.query.duration).trim();
  const offset = (page - 1) * limit;
  const whereCondition: any = [];
  try {
        if (seasonId) {
          const idArray: number[] = seasonId
            .split(",")
            .map((id: any) => parseInt(id, 10));
          whereCondition.push(`sp.season_id in (${idArray})`)
        }

        if (countryId) {
          const idArray: number[] = countryId
            .split(",")
            .map((id: any) => parseInt(id, 10));
          whereCondition.push(`spin.country_id in (${idArray})`)
        }

        if (brandId) {
          const idArray = brandId.split(",").map((id: any) => parseInt(id, 10));
          whereCondition.push(`spin.brand && ARRAY[${idArray.join(',')}]`);
        }

        if(!type){
          return res.sendError(res, "Type Process or Sales is required");
        }

        let startDate: string | null = null;

      if (duration) {
        const now = new Date();
        switch (duration) {
          case '7': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          case '14': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          case '30': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          case '45': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          case '90': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          default: {
            startDate = null;
            break
          }
        }
      }

      const whereClause = whereCondition.length > 0 ? `WHERE ${whereCondition.join(' AND ')} ` : '';

      let typeTable = ''

      if(type?.toLowerCase() === 'process'){
        excelFilePath = path.join("./upload", "excel-data-monitor-spinner-process.xlsx");
        typeTable= 'spin_processes'
      }else if(type?.toLowerCase() === 'sales'){
        excelFilePath = path.join("./upload", "excel-data-monitor-spinner-sales.xlsx");
        typeTable= 'spin_sales'
      }else{
        return res.sendError(res, "Type Process or Sales is required");
      }

      // Create the excel workbook file
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:F1');
      const mergedCell = worksheet.getCell('A1');
      if(type?.toLowerCase() === 'process'){
        mergedCell.value = 'CottonConnect | Data Entry Monitoring Spinner Process';
      }else{
        mergedCell.value = 'CottonConnect | Data Entry Monitoring Spinner Sales';
      }
      
      mergedCell.font = { bold: true };
      mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
      // Set bold font for header row
      let headerRow;

        headerRow = worksheet.addRow([
          "Sr No.", "Spinner Name", "Season", "Country", `Last date data updated-${type?.toLowerCase() === 'process' ? "Process" : "Sale"} data`, "Historical Update"
        ]);
      headerRow.font = { bold: true };

    const dataQuery = `
        SELECT 
          spin.id AS spinner_id, 
          spin.name AS spinner_name,
          c.id AS country_id,
          c.county_name AS country_name,
          STRING_AGG(DISTINCT s.name, ', ') AS season_name,
          MAX(sp.date) AS last_date,
          CASE 
            WHEN MAX(sp.date) IS NOT NULL THEN
                CASE
                    WHEN CURRENT_DATE - MAX(sp.date) >= INTERVAL '365 days' THEN     
                        (EXTRACT(YEAR FROM AGE(CURRENT_DATE, MAX(sp.date)))) || ' year(s) ago'
                    WHEN CURRENT_DATE - MAX(sp.date) >= INTERVAL '30 days' THEN      
                        FLOOR(EXTRACT(DAY FROM (CURRENT_DATE - MAX(sp.date))) / 30) || ' month(s) ago'
                    ELSE
                        EXTRACT(DAY FROM (CURRENT_DATE - MAX(sp.date))) || ' day(s) ago'   
                END
            ELSE 'No ${type?.toLowerCase()} record'
          END AS time_since_last_update 
        FROM spinners spin 
        LEFT JOIN ${typeTable} sp ON spin.id = sp.spinner_id
        LEFT JOIN countries c ON spin.country_id = c.id
        LEFT JOIN seasons s on s.id = sp.season_id
        ${whereClause}
        GROUP BY  spin.id,spin.name,c.id
        HAVING MAX(sp.date) <= '${startDate}' OR MAX(sp.date) IS NULL
        ORDER BY last_date DESC nulls last
        LIMIT :limit OFFSET :offset`;


          const [rows] = await Promise.all([
              sequelize.query(dataQuery, {
                replacements: { limit, offset },
                type: sequelize.QueryTypes.SELECT,
              })
            ]);


            for await (const [index, item] of rows.entries()) {
              let rowValues = Object.values({
                index: index + 1,
                spinner: item.spinner_name ? item.spinner_name : "",
                season: item.season_name ? item.season_name : "",
                country: item.country_name ? item.country_name : "",
                last_date: item.last_date ? item.last_date : "",
                time_since_last_update: item.time_since_last_update ? item.time_since_last_update : "",
              });
              worksheet.addRow(rowValues);
            }
        // Auto-adjust column widths based on content
        worksheet.columns.forEach((column: any) => {
          let maxCellLength = 0;
          column.eachCell({ includeEmpty: true }, (cell: any) => {
            const cellLength = (cell.value ? cell.value.toString() : "").length;
            maxCellLength = Math.max(maxCellLength, cellLength);
          });
          column.width = Math.min(15, maxCellLength + 2); // Limit width to 30 characters
        });

        // Save the workbook
        await workbook.xlsx.writeFile(excelFilePath);

        if(type?.toLowerCase() === 'process'){
          return res.status(200).send({
            success: true,
            messgage: "File successfully Generated",
            data: process.env.BASE_URL + "excel-data-monitor-spinner-process.xlsx",
          });
        }else{
          return res.status(200).send({
            success: true,
            messgage: "File successfully Generated",
            data: process.env.BASE_URL + "excel-data-monitor-spinner-sales.xlsx",
          });
        }
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.message);
  }
};



const fetchDataMonitorKnitterPagination = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { seasonId, countryId, brandId, type, processor, sort }: any = req.query;
  const duration = String(req.query.duration).trim();
  const offset = (page - 1) * limit;
  const whereCondition: any = [];
  try {
      if (seasonId) {
          const idArray: number[] = seasonId
            .split(",")
            .map((id: any) => parseInt(id, 10));
          whereCondition.push(`kp.season_id in (${idArray})`)
        }
  
        if (countryId) {
          const idArray: number[] = countryId
            .split(",")
            .map((id: any) => parseInt(id, 10));
          whereCondition.push(`knit.country_id in (${idArray})`)
        }

        if (brandId) {
          const idArray = brandId.split(",").map((id: any) => parseInt(id, 10));
          whereCondition.push(`knit.brand && ARRAY[${idArray.join(',')}]`);
        }

        if(!type){
          return res.sendError(res, "Type Process or Sales is required");
        }

        let startDate: string | null = null;

      if (duration) {
        const now = new Date();
        switch (duration) {
          case '7': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          case '14': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          case '30': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          case '45': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          case '90': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          default: {
            startDate = null;
            break
          }
        }
      }

      const whereClause = whereCondition.length > 0 ? `WHERE ${whereCondition.join(' AND ')} ` : '';

      let typeTable = ''

        if(type?.toLowerCase() === 'process'){
          typeTable= 'knit_processes'
        }else if(type?.toLowerCase() === 'sales'){
          typeTable= 'knit_sales'
        }else{
          return res.sendError(res, "Type Process or Sales is required");
        }


      const dataQuery = `
          SELECT 
            knit.id AS knitter_id, 
            knit.name AS knitter_name,
            c.id AS country_id,
            c.county_name AS country_name,
            STRING_AGG(DISTINCT s.name, ', ') AS season_name,
            MAX(kp.date) AS last_date,
            CASE 
              WHEN MAX(kp.date) IS NOT NULL THEN
                  CASE
                      WHEN CURRENT_DATE - MAX(kp.date) >= INTERVAL '365 days' THEN     
                          (EXTRACT(YEAR FROM AGE(CURRENT_DATE, MAX(kp.date)))) || ' year(s) ago'
                      WHEN CURRENT_DATE - MAX(kp.date) >= INTERVAL '30 days' THEN      
                          FLOOR(EXTRACT(DAY FROM (CURRENT_DATE - MAX(kp.date))) / 30) || ' month(s) ago'
                      ELSE
                          EXTRACT(DAY FROM (CURRENT_DATE - MAX(kp.date))) || ' day(s) ago'   
                  END
              ELSE 'No ${type?.toLowerCase()} record'
            END AS time_since_last_update 
          FROM knitters knit 
          LEFT JOIN ${typeTable} kp ON knit.id = kp.knitter_id
          LEFT JOIN countries c ON knit.country_id = c.id
          LEFT JOIN seasons s on s.id = kp.season_id
          ${whereClause}
          GROUP BY  knit.id,knit.name,c.id
          HAVING MAX(kp.date) <= '${startDate}' OR MAX(kp.date) IS NULL
          ORDER BY last_date DESC nulls last
          LIMIT :limit OFFSET :offset`;


        const countQuery = `
          SELECT COUNT(knit.id) AS total_count
            FROM knitters knit 
          LEFT JOIN ${typeTable} kp ON knit.id = kp.knitter_id
          LEFT JOIN countries c ON knit.country_id = c.id
          LEFT JOIN seasons s on s.id = kp.season_id
          ${whereClause}
          GROUP BY  knit.id,knit.name,c.id
          HAVING MAX(kp.date) <= '${startDate}' OR MAX(kp.date) IS NULL
          `;


          const [countResult, rows] = await Promise.all([
              sequelize.query(countQuery, {
                type: sequelize.QueryTypes.SELECT,
              }),
              sequelize.query(dataQuery, {
                replacements: { limit, offset },
                type: sequelize.QueryTypes.SELECT,
              })
            ]);


      const totalCount = countResult && countResult.length > 0 ? countResult.length : 0;

      return res.sendPaginationSuccess(res, rows, totalCount);

  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.message);
  }
};

const exportDataMonitorKnitterPagination = async (req: Request, res: Response) => {
  let excelFilePath = '';
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { seasonId, countryId, brandId, type, processor, sort }: any = req.query;
  const duration = String(req.query.duration).trim();
  const offset = (page - 1) * limit;
  const whereCondition: any = [];
  try {
        if (seasonId) {
          const idArray: number[] = seasonId
            .split(",")
            .map((id: any) => parseInt(id, 10));
          whereCondition.push(`kp.season_id in (${idArray})`)
        }

        if (countryId) {
          const idArray: number[] = countryId
            .split(",")
            .map((id: any) => parseInt(id, 10));
          whereCondition.push(`knit.country_id in (${idArray})`)
        }

        if (brandId) {
          const idArray = brandId.split(",").map((id: any) => parseInt(id, 10));
          whereCondition.push(`knit.brand && ARRAY[${idArray.join(',')}]`);
        }

        if(!type){
          return res.sendError(res, "Type Process or Sales is required");
        }

        let startDate: string | null = null;

      if (duration) {
        const now = new Date();
        switch (duration) {
          case '7': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          case '14': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          case '30': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          case '45': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          case '90': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          default: {
            startDate = null;
            break
          }
        }
      }

      const whereClause = whereCondition.length > 0 ? `WHERE ${whereCondition.join(' AND ')} ` : '';

      let typeTable = ''

      if(type?.toLowerCase() === 'process'){
        excelFilePath = path.join("./upload", "excel-data-monitor-knitter-process.xlsx");
        typeTable= 'knit_processes'
      }else if(type?.toLowerCase() === 'sales'){
        excelFilePath = path.join("./upload", "excel-data-monitor-knitter-sales.xlsx");
        typeTable= 'knit_sales'
      }else{
        return res.sendError(res, "Type Process or Sales is required");
      }

      // Create the excel workbook file
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:F1');
      const mergedCell = worksheet.getCell('A1');
      if(type?.toLowerCase() === 'process'){
        mergedCell.value = 'CottonConnect | Data Entry Monitoring Knitter Process';
      }else{
        mergedCell.value = 'CottonConnect | Data Entry Monitoring Knitter Sales';
      }
      
      mergedCell.font = { bold: true };
      mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
      // Set bold font for header row
      let headerRow;

        headerRow = worksheet.addRow([
          "Sr No.", "Knitter Name", "Season", "Country", `Last date data updated-${type?.toLowerCase() === 'process' ? "Process" : "Sale"} data`, "Historical Update"
        ]);
      headerRow.font = { bold: true };


    const dataQuery = `
        SELECT 
          knit.id AS knitter_id, 
          knit.name AS knitter_name,
          c.id AS country_id,
          c.county_name AS country_name,
          STRING_AGG(DISTINCT s.name, ', ') AS season_name,
          MAX(kp.date) AS last_date,
          CASE 
            WHEN MAX(kp.date) IS NOT NULL THEN
                CASE
                    WHEN CURRENT_DATE - MAX(kp.date) >= INTERVAL '365 days' THEN     
                        (EXTRACT(YEAR FROM AGE(CURRENT_DATE, MAX(kp.date)))) || ' year(s) ago'
                    WHEN CURRENT_DATE - MAX(kp.date) >= INTERVAL '30 days' THEN      
                        FLOOR(EXTRACT(DAY FROM (CURRENT_DATE - MAX(kp.date))) / 30) || ' month(s) ago'
                    ELSE
                        EXTRACT(DAY FROM (CURRENT_DATE - MAX(kp.date))) || ' day(s) ago'   
                END
            ELSE 'No ${type?.toLowerCase()} record'
          END AS time_since_last_update 
        FROM knitters knit 
        LEFT JOIN ${typeTable} kp ON knit.id = kp.knitter_id
        LEFT JOIN countries c ON knit.country_id = c.id
        LEFT JOIN seasons s on s.id = kp.season_id
        ${whereClause}
        GROUP BY  knit.id,knit.name,c.id
        HAVING MAX(kp.date) <= '${startDate}' OR MAX(kp.date) IS NULL
        ORDER BY last_date DESC nulls last
        LIMIT :limit OFFSET :offset`;


          const [rows] = await Promise.all([
              sequelize.query(dataQuery, {
                replacements: { limit, offset },
                type: sequelize.QueryTypes.SELECT,
              })
            ]);


            for await (const [index, item] of rows.entries()) {
              let rowValues = Object.values({
                index: index + 1,
                knitter: item.knitter_name ? item.knitter_name : "",
                season: item.season_name ? item.season_name : "",
                country: item.country_name ? item.country_name : "",
                last_date: item.last_date ? item.last_date : "",
                time_since_last_update: item.time_since_last_update ? item.time_since_last_update : "",
              });
              worksheet.addRow(rowValues);
            }
        // Auto-adjust column widths based on content
        worksheet.columns.forEach((column: any) => {
          let maxCellLength = 0;
          column.eachCell({ includeEmpty: true }, (cell: any) => {
            const cellLength = (cell.value ? cell.value.toString() : "").length;
            maxCellLength = Math.max(maxCellLength, cellLength);
          });
          column.width = Math.min(15, maxCellLength + 2); // Limit width to 30 characters
        });

        // Save the workbook
        await workbook.xlsx.writeFile(excelFilePath);

        if(type?.toLowerCase() === 'process'){
          return res.status(200).send({
            success: true,
            messgage: "File successfully Generated",
            data: process.env.BASE_URL + "excel-data-monitor-knitter-process.xlsx",
          });
        }else{
          return res.status(200).send({
            success: true,
            messgage: "File successfully Generated",
            data: process.env.BASE_URL + "excel-data-monitor-knitter-sales.xlsx",
          });
        }
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.message);
  }
};



const fetchDataMonitorWeaverPagination = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { seasonId, countryId, brandId, type, processor, sort }: any = req.query;
  const duration = String(req.query.duration).trim();
  const offset = (page - 1) * limit;
  const whereCondition: any = [];
  try {
      if (seasonId) {
          const idArray: number[] = seasonId
            .split(",")
            .map((id: any) => parseInt(id, 10));
          whereCondition.push(`wp.season_id in (${idArray})`)
        }
  
        if (countryId) {
          const idArray: number[] = countryId
            .split(",")
            .map((id: any) => parseInt(id, 10));
          whereCondition.push(`weav.country_id in (${idArray})`)
        }

        if (brandId) {
          const idArray = brandId.split(",").map((id: any) => parseInt(id, 10));
          whereCondition.push(`weav.brand && ARRAY[${idArray.join(',')}]`);
        }

        if(!type){
          return res.sendError(res, "Type Process or Sales is required");
        }

        let startDate: string | null = null;

      if (duration) {
        const now = new Date();
        switch (duration) {
          case '7': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          case '14': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          case '30': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          case '45': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          case '90': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          default: {
            startDate = null;
            break
          }
        }
      }

      const whereClause = whereCondition.length > 0 ? `WHERE ${whereCondition.join(' AND ')} ` : '';

      let typeTable = ''

        if(type?.toLowerCase() === 'process'){
          typeTable= 'weaver_processes'
        }else if(type?.toLowerCase() === 'sales'){
          typeTable= 'weaver_sales'
        }else{
          return res.sendError(res, "Type Process or Sales is required");
        }


      const dataQuery = `
          SELECT 
            weav.id AS weaver_id, 
            weav.name AS weaver_name,
            c.id AS country_id,
            c.county_name AS country_name,
            STRING_AGG(DISTINCT s.name, ', ') AS season_name,
            MAX(wp.date) AS last_date,
            CASE 
              WHEN MAX(wp.date) IS NOT NULL THEN
                  CASE
                      WHEN CURRENT_DATE - MAX(wp.date) >= INTERVAL '365 days' THEN     
                          (EXTRACT(YEAR FROM AGE(CURRENT_DATE, MAX(wp.date)))) || ' year(s) ago'
                      WHEN CURRENT_DATE - MAX(wp.date) >= INTERVAL '30 days' THEN      
                          FLOOR(EXTRACT(DAY FROM (CURRENT_DATE - MAX(wp.date))) / 30) || ' month(s) ago'
                      ELSE
                          EXTRACT(DAY FROM (CURRENT_DATE - MAX(wp.date))) || ' day(s) ago'   
                  END
              ELSE 'No ${type?.toLowerCase()} record'
            END AS time_since_last_update 
          FROM weavers weav 
          LEFT JOIN ${typeTable} wp ON weav.id = wp.weaver_id
          LEFT JOIN countries c ON weav.country_id = c.id
          LEFT JOIN seasons s on s.id = wp.season_id
          ${whereClause}
          GROUP BY  weav.id,weav.name,c.id
          HAVING MAX(wp.date) <= '${startDate}' OR MAX(wp.date) IS NULL
          ORDER BY last_date DESC nulls last
          LIMIT :limit OFFSET :offset`;


        const countQuery = `
          SELECT COUNT(weav.id) AS total_count
            FROM weavers weav 
          LEFT JOIN ${typeTable} wp ON weav.id = wp.weaver_id
          LEFT JOIN countries c ON weav.country_id = c.id
          LEFT JOIN seasons s on s.id = wp.season_id
          ${whereClause}
          GROUP BY  weav.id,weav.name,c.id
          HAVING MAX(wp.date) <= '${startDate}' OR MAX(wp.date) IS NULL
          `;


          const [countResult, rows] = await Promise.all([
              sequelize.query(countQuery, {
                type: sequelize.QueryTypes.SELECT,
              }),
              sequelize.query(dataQuery, {
                replacements: { limit, offset },
                type: sequelize.QueryTypes.SELECT,
              })
            ]);


      const totalCount = countResult && countResult.length > 0 ? countResult.length : 0;

      return res.sendPaginationSuccess(res, rows, totalCount);

  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.message);
  }
};

const exportDataMonitorWeaverPagination = async (req: Request, res: Response) => {
  let excelFilePath = '';
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { seasonId, countryId, brandId, type, processor, sort }: any = req.query;
  const duration = String(req.query.duration).trim();
  const offset = (page - 1) * limit;
  const whereCondition: any = [];
  try {
        if (seasonId) {
          const idArray: number[] = seasonId
            .split(",")
            .map((id: any) => parseInt(id, 10));
          whereCondition.push(`wp.season_id in (${idArray})`)
        }

        if (countryId) {
          const idArray: number[] = countryId
            .split(",")
            .map((id: any) => parseInt(id, 10));
          whereCondition.push(`weav.country_id in (${idArray})`)
        }

        if (brandId) {
          const idArray = brandId.split(",").map((id: any) => parseInt(id, 10));
          whereCondition.push(`weav.brand && ARRAY[${idArray.join(',')}]`);
        }

        if(!type){
          return res.sendError(res, "Type Process or Sales is required");
        }

        let startDate: string | null = null;

      if (duration) {
        const now = new Date();
        switch (duration) {
          case '7': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          case '14': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          case '30': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          case '45': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          case '90': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          default: {
            startDate = null;
            break
          }
        }
      }

      const whereClause = whereCondition.length > 0 ? `WHERE ${whereCondition.join(' AND ')} ` : '';

      let typeTable = ''

      if(type?.toLowerCase() === 'process'){
        excelFilePath = path.join("./upload", "excel-data-monitor-weaver-process.xlsx");
        typeTable= 'weaver_processes'
      }else if(type?.toLowerCase() === 'sales'){
        excelFilePath = path.join("./upload", "excel-data-monitor-weaver-sales.xlsx");
        typeTable= 'weaver_sales'
      }else{
        return res.sendError(res, "Type Process or Sales is required");
      }

      // Create the excel workbook file
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:F1');
      const mergedCell = worksheet.getCell('A1');
      if(type?.toLowerCase() === 'process'){
        mergedCell.value = 'CottonConnect | Data Entry Monitoring Weaver Process';
      }else{
        mergedCell.value = 'CottonConnect | Data Entry Monitoring Weaver Sales';
      }
      
      mergedCell.font = { bold: true };
      mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
      // Set bold font for header row
      let headerRow;

        headerRow = worksheet.addRow([
          "Sr No.", "Weaver Name", "Season", "Country", `Last date data updated-${type?.toLowerCase() === 'process' ? "Process" : "Sale"} data`, "Historical Update"
        ]);
      headerRow.font = { bold: true };


      const dataQuery = `
          SELECT 
            weav.id AS weaver_id, 
            weav.name AS weaver_name,
            c.id AS country_id,
            c.county_name AS country_name,
            STRING_AGG(DISTINCT s.name, ', ') AS season_name,
            MAX(wp.date) AS last_date,
            CASE 
              WHEN MAX(wp.date) IS NOT NULL THEN
                  CASE
                      WHEN CURRENT_DATE - MAX(wp.date) >= INTERVAL '365 days' THEN     
                          (EXTRACT(YEAR FROM AGE(CURRENT_DATE, MAX(wp.date)))) || ' year(s) ago'
                      WHEN CURRENT_DATE - MAX(wp.date) >= INTERVAL '30 days' THEN      
                          FLOOR(EXTRACT(DAY FROM (CURRENT_DATE - MAX(wp.date))) / 30) || ' month(s) ago'
                      ELSE
                          EXTRACT(DAY FROM (CURRENT_DATE - MAX(wp.date))) || ' day(s) ago'   
                  END
              ELSE 'No ${type?.toLowerCase()} record'
            END AS time_since_last_update 
          FROM weavers weav 
          LEFT JOIN ${typeTable} wp ON weav.id = wp.weaver_id
          LEFT JOIN countries c ON weav.country_id = c.id
          LEFT JOIN seasons s on s.id = wp.season_id
          ${whereClause}
          GROUP BY  weav.id,weav.name,c.id
          HAVING MAX(wp.date) <= '${startDate}' OR MAX(wp.date) IS NULL
          ORDER BY last_date DESC nulls last
          LIMIT :limit OFFSET :offset`;

          const [rows] = await Promise.all([
              sequelize.query(dataQuery, {
                replacements: { limit, offset },
                type: sequelize.QueryTypes.SELECT,
              })
            ]);


            for await (const [index, item] of rows.entries()) {
              let rowValues = Object.values({
                index: index + 1,
                weaver: item.weaver_name ? item.weaver_name : "",
                season: item.season_name ? item.season_name : "",
                country: item.country_name ? item.country_name : "",
                last_date: item.last_date ? item.last_date : "",
                time_since_last_update: item.time_since_last_update ? item.time_since_last_update : "",
              });
              worksheet.addRow(rowValues);
            }
        // Auto-adjust column widths based on content
        worksheet.columns.forEach((column: any) => {
          let maxCellLength = 0;
          column.eachCell({ includeEmpty: true }, (cell: any) => {
            const cellLength = (cell.value ? cell.value.toString() : "").length;
            maxCellLength = Math.max(maxCellLength, cellLength);
          });
          column.width = Math.min(15, maxCellLength + 2); // Limit width to 30 characters
        });

        // Save the workbook
        await workbook.xlsx.writeFile(excelFilePath);

        if(type?.toLowerCase() === 'process'){
          return res.status(200).send({
            success: true,
            messgage: "File successfully Generated",
            data: process.env.BASE_URL + "excel-data-monitor-weaver-process.xlsx",
          });
        }else{
          return res.status(200).send({
            success: true,
            messgage: "File successfully Generated",
            data: process.env.BASE_URL + "excel-data-monitor-weaver-sales.xlsx",
          });
        }
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.message);
  }
};

const fetchDataMonitorGarmentPagination = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { seasonId, countryId, brandId, type, processor, sort }: any = req.query;
  const duration = String(req.query.duration).trim();
  const offset = (page - 1) * limit;
  const whereCondition: any = [];
  try {
      if (seasonId) {
          const idArray: number[] = seasonId
            .split(",")
            .map((id: any) => parseInt(id, 10));
          whereCondition.push(`gp.season_id in (${idArray})`)
        }
  
        if (countryId) {
          const idArray: number[] = countryId
            .split(",")
            .map((id: any) => parseInt(id, 10));
          whereCondition.push(`garment.country_id in (${idArray})`)
        }

        if (brandId) {
          const idArray = brandId.split(",").map((id: any) => parseInt(id, 10));
          whereCondition.push(`garment.brand && ARRAY[${idArray.join(',')}]`);
        }

        if(!type){
          return res.sendError(res, "Type Process or Sales is required");
        }

        let startDate: string | null = null;

      if (duration) {
        const now = new Date();
        switch (duration) {
          case '7': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          case '14': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          case '30': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          case '45': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          case '90': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          default: {
            startDate = null;
            break
          }
        }
      }

      const whereClause = whereCondition.length > 0 ? `WHERE ${whereCondition.join(' AND ')} ` : '';

      let typeTable = ''

        if(type?.toLowerCase() === 'process'){
          typeTable= 'garment_processes'
        }else if(type?.toLowerCase() === 'sales'){
          typeTable= 'garment_sales'
        }else{
          return res.sendError(res, "Type Process or Sales is required");
        }


      const dataQuery = `
          SELECT 
            garment.id AS garment_id, 
            garment.name AS garment_name,
            c.id AS country_id,
            c.county_name AS country_name,
            STRING_AGG(DISTINCT s.name, ', ') AS season_name,
            MAX(gp.date) AS last_date,
            CASE 
              WHEN MAX(gp.date) IS NOT NULL THEN
                  CASE
                      WHEN CURRENT_DATE - MAX(gp.date) >= INTERVAL '365 days' THEN     
                          (EXTRACT(YEAR FROM AGE(CURRENT_DATE, MAX(gp.date)))) || ' year(s) ago'
                      WHEN CURRENT_DATE - MAX(gp.date) >= INTERVAL '30 days' THEN      
                          FLOOR(EXTRACT(DAY FROM (CURRENT_DATE - MAX(gp.date))) / 30) || ' month(s) ago'
                      ELSE
                          EXTRACT(DAY FROM (CURRENT_DATE - MAX(gp.date))) || ' day(s) ago'   
                  END
              ELSE 'No ${type?.toLowerCase()} record'
            END AS time_since_last_update 
          FROM garments garment 
          LEFT JOIN ${typeTable} gp ON garment.id = gp.garment_id
          LEFT JOIN countries c ON garment.country_id = c.id
          LEFT JOIN seasons s on s.id = gp.season_id
          ${whereClause}
          GROUP BY  garment.id,garment.name,c.id
          HAVING MAX(gp.date) <= '${startDate}' OR MAX(gp.date) IS NULL
          ORDER BY last_date DESC nulls last
          LIMIT :limit OFFSET :offset`;


        const countQuery = `
          SELECT COUNT(garment.id) AS total_count
            FROM garments garment 
          LEFT JOIN ${typeTable} gp ON garment.id = gp.garment_id
          LEFT JOIN countries c ON garment.country_id = c.id
          LEFT JOIN seasons s on s.id = gp.season_id
          ${whereClause}
          GROUP BY  garment.id,garment.name,c.id
          HAVING MAX(gp.date) <= '${startDate}' OR MAX(gp.date) IS NULL
          `;


          const [countResult, rows] = await Promise.all([
              sequelize.query(countQuery, {
                type: sequelize.QueryTypes.SELECT,
              }),
              sequelize.query(dataQuery, {
                replacements: { limit, offset },
                type: sequelize.QueryTypes.SELECT,
              })
            ]);


      const totalCount = countResult && countResult.length > 0 ? countResult.length : 0;

      return res.sendPaginationSuccess(res, rows, totalCount);

  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.message);
  }
};


const exportDataMonitorGarmentPagination = async (req: Request, res: Response) => {
  let excelFilePath = '';
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { seasonId, countryId, brandId, type, processor, sort }: any = req.query;
  const duration = String(req.query.duration).trim();
  const offset = (page - 1) * limit;
  const whereCondition: any = [];
  try {
      if (seasonId) {
        const idArray: number[] = seasonId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition.push(`gp.season_id in (${idArray})`)
      }

      if (countryId) {
        const idArray: number[] = countryId
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition.push(`garment.country_id in (${idArray})`)
      }

      if (brandId) {
        const idArray = brandId.split(",").map((id: any) => parseInt(id, 10));
        whereCondition.push(`garment.brand && ARRAY[${idArray.join(',')}]`);
      }

        if(!type){
          return res.sendError(res, "Type Process or Sales is required");
        }

        let startDate: string | null = null;

      if (duration) {
        const now = new Date();
        switch (duration) {
          case '7': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          case '14': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          case '30': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          case '45': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          case '90': {
            startDate = moment(now).subtract(duration, 'days').format('YYYY-MM-DD 00:00:00');
            break;
          }
          default: {
            startDate = null;
            break
          }
        }
      }

      const whereClause = whereCondition.length > 0 ? `WHERE ${whereCondition.join(' AND ')} ` : '';

      let typeTable = ''

      if(type?.toLowerCase() === 'process'){
        excelFilePath = path.join("./upload", "excel-data-monitor-garment-process.xlsx");
        typeTable= 'garment_processes'
      }else if(type?.toLowerCase() === 'sales'){
        excelFilePath = path.join("./upload", "excel-data-monitor-garment-sales.xlsx");
        typeTable= 'garment_sales'
      }else{
        return res.sendError(res, "Type Process or Sales is required");
      }

      // Create the excel workbook file
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:F1');
      const mergedCell = worksheet.getCell('A1');
      if(type?.toLowerCase() === 'process'){
        mergedCell.value = 'CottonConnect | Data Entry Monitoring Garment Process';
      }else{
        mergedCell.value = 'CottonConnect | Data Entry Monitoring Garment Sales';
      }
      
      mergedCell.font = { bold: true };
      mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
      // Set bold font for header row
      let headerRow;

        headerRow = worksheet.addRow([
          "Sr No.", "Garment Name", "Season", "Country", `Last date data updated-${type?.toLowerCase() === 'process' ? "Process" : "Sale"} data`, "Historical Update"
        ]);
      headerRow.font = { bold: true };


    const dataQuery = `
        SELECT 
          garment.id AS garment_id, 
          garment.name AS garment_name,
          c.id AS country_id,
          c.county_name AS country_name,
          STRING_AGG(DISTINCT s.name, ', ') AS season_name,
          MAX(gp.date) AS last_date,
          CASE 
            WHEN MAX(gp.date) IS NOT NULL THEN
                CASE
                    WHEN CURRENT_DATE - MAX(gp.date) >= INTERVAL '365 days' THEN     
                        (EXTRACT(YEAR FROM AGE(CURRENT_DATE, MAX(gp.date)))) || ' year(s) ago'
                    WHEN CURRENT_DATE - MAX(gp.date) >= INTERVAL '30 days' THEN      
                        FLOOR(EXTRACT(DAY FROM (CURRENT_DATE - MAX(gp.date))) / 30) || ' month(s) ago'
                    ELSE
                        EXTRACT(DAY FROM (CURRENT_DATE - MAX(gp.date))) || ' day(s) ago'   
                END
            ELSE 'No ${type?.toLowerCase()} record'
          END AS time_since_last_update 
        FROM garments garment 
        LEFT JOIN ${typeTable} gp ON garment.id = gp.garment_id
        LEFT JOIN countries c ON garment.country_id = c.id
        LEFT JOIN seasons s on s.id = gp.season_id
        ${whereClause}
        GROUP BY  garment.id,garment.name,c.id
        HAVING MAX(gp.date) <= '${startDate}' OR MAX(gp.date) IS NULL
        ORDER BY last_date DESC nulls last
        LIMIT :limit OFFSET :offset`;

          const [rows] = await Promise.all([
              sequelize.query(dataQuery, {
                replacements: { limit, offset },
                type: sequelize.QueryTypes.SELECT,
              })
            ]);


            for await (const [index, item] of rows.entries()) {
              let rowValues = Object.values({
                index: index + 1,
                garment: item.garment_name ? item.garment_name : "",
                season: item.season_name ? item.season_name : "",
                country: item.country_name ? item.country_name : "",
                last_date: item.last_date ? item.last_date : "",
                time_since_last_update: item.time_since_last_update ? item.time_since_last_update : "",
              });
              worksheet.addRow(rowValues);
            }
        // Auto-adjust column widths based on content
        worksheet.columns.forEach((column: any) => {
          let maxCellLength = 0;
          column.eachCell({ includeEmpty: true }, (cell: any) => {
            const cellLength = (cell.value ? cell.value.toString() : "").length;
            maxCellLength = Math.max(maxCellLength, cellLength);
          });
          column.width = Math.min(15, maxCellLength + 2); // Limit width to 30 characters
        });

        // Save the workbook
        await workbook.xlsx.writeFile(excelFilePath);

        if(type?.toLowerCase() === 'process'){
          return res.status(200).send({
            success: true,
            messgage: "File successfully Generated",
            data: process.env.BASE_URL + "excel-data-monitor-garment-process.xlsx",
          });
        }else{
          return res.status(200).send({
            success: true,
            messgage: "File successfully Generated",
            data: process.env.BASE_URL + "excel-data-monitor-garment-sales.xlsx",
          });
        }
  } catch (error: any) {
    console.error(error);
    return res.sendError(res, error.message);
  }
};



  export {
    fetchDataMonitorGinnerPagination,
    fetchDataMonitorSpinnerPagination,
    fetchDataMonitorKnitterPagination,
    fetchDataMonitorWeaverPagination,
    fetchDataMonitorGarmentPagination,
    exportDataMonitorGinnerPagination,
    exportDataMonitorSpinnerPagination,
    exportDataMonitorKnitterPagination,
    exportDataMonitorWeaverPagination,
    exportDataMonitorGarmentPagination
  }