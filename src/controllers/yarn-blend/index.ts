import { Request, Response } from "express";
import YarnBlend from "../../models/yarn-blend";
import { Sequelize, Op } from "sequelize";
import SpinProcess from "../../models/spin-process.model";
import sequelize from "../../util/dbConn";
import * as path from "path";
import * as ExcelJS from "exceljs";
import CottonMix from "../../models/cotton-mix.model";


const fetchYarnBlendPagination = async (req: Request, res: Response) => {
    const sortOrder = req.query.sort || "desc";
    const status = req.query.status || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const searchTerm = req.query.search || '';
    const brandId: any = req.query.brandId || []

    try {
        const query = `
        SELECT 
            yb.id,
            yb.cotton_name,
            yb.cotton_percentage,
            yb.cotton_blend,
            yb.cotton_blend_percentage,
            array_agg(DISTINCT b.brand_name) AS brands,
            yb.status,
            array_agg(DISTINCT cm."cottonMix_name") AS cotton_mix_names,
            sp.yarn_blend_id IS NOT NULL AS is_used_in_spin_process
        FROM "yarn-blends" AS yb
        JOIN "cotton_mixes" AS cm
            ON cm.id = ANY(yb.cotton_blend)        
        JOIN "brands" AS b
            ON b.id = ANY(yb.brand_id)
        LEFT JOIN "spin_processes" AS sp
            ON sp.yarn_blend_id = yb.id
        ${searchTerm &&
            ` WHERE
            (yb.brand_id @> ARRAY(
                SELECT id FROM "brands" WHERE "brand_name" ILIKE :searchTerm
            ) 
            AND
            yb.cotton_blend @> ARRAY(
                SELECT id FROM "cotton_mixes" WHERE "cottonMix_name" ILIKE :searchTerm
            ))`
            }
    
        ${status && `${searchTerm ? ' AND ' : ' WHERE '} status = true`}
    
        ${brandId.length > 0 ? `${(searchTerm || status) ? ' AND ' : ' WHERE '} yb.brand_id @> ARRAY[:brandId]::integer[]` : ''}
    
        GROUP BY
            yb.id,
            yb.cotton_name,
            yb.cotton_percentage,
            yb.cotton_blend,
            yb.cotton_blend_percentage,
            yb.status,
            sp.yarn_blend_id -- Include the yarn_blend_id in the GROUP BY
        ORDER BY yb.id ${sortOrder}
        ${req.query.pagination === "true" ? 'LIMIT :limit OFFSET :offset' : ''};
    `;

        let replacements: any = {
            limit: limit,
            offset: offset,
        };

        if (searchTerm) {
            replacements.searchTerm = `%${searchTerm}%`;
        }

        if (req.query.brandId) {
            replacements.brandId = brandId;
        }

        const data = await sequelize.query(query, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT,
        });

        const countQuery = `
               SELECT 
                yb.id,
                yb.cotton_name,
                yb.cotton_percentage,
                yb.cotton_blend,
                yb.cotton_blend_percentage,
                array_agg(DISTINCT b.brand_name) AS brands,
                yb.status,
                array_agg(DISTINCT cm."cottonMix_name") AS cotton_mix_names
            FROM "yarn-blends" AS yb
            JOIN "cotton_mixes" AS cm
                ON cm.id = ANY(yb.cotton_blend)        
            JOIN "brands" AS b
                ON b.id = ANY(yb.brand_id)
            ${searchTerm &&
            ` WHERE
                (yb.brand_id @> ARRAY(
                    SELECT id FROM "brands" WHERE "brand_name" ILIKE :searchTerm
                ) 
                AND
                yb.cotton_blend @> ARRAY(
                    SELECT id FROM "cotton_mixes" WHERE "cottonMix_name" ILIKE :searchTerm
                ))`
            }

            ${status && `${searchTerm ? ' AND ' : ' WHERE '} status = true`}

            ${brandId.length > 0 ? `${(searchTerm || status) ? ' AND ' : ' WHERE '} yb.brand_id @> ARRAY[:brandId]::integer[]` : ''}

            GROUP BY
                yb.id,
                yb.cotton_name,
                yb.cotton_percentage,
                yb.cotton_blend,
                yb.cotton_blend_percentage,
                yb.status
            ORDER BY yb.cotton_name ${sortOrder};
        `;

        const countResult = await sequelize.query(countQuery, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT,
        });

        const count = countResult.length;

        return res.sendPaginationSuccess(res, data, Number(count));

    } catch (error) {
        console.log(error)
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
};

const fetchSingleYarn = async (req: Request, res: Response) => {
    const id = req.query.id;

    try {
        if (!id) {
            return res.sendError(res, "need id");
        }

        let rows = await YarnBlend.findOne({
            where: {
                id: id
            }
        });
        if (!rows) {
            return res.sendError(res, "Yarn blend does not exist");
        }

        let response = await SpinProcess.findOne({
            where: {
                yarn_blend_id: id
            }
        });
        let data = {
            rows,
            is_used_in_spin_process: response ? true : false
        }
        return res.sendSuccess(res, data);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const createYarnBlend = async (req: Request, res: Response) => {
    try {
        let {
            cotton_name,
            cotton_percentage,
            cotton_blend,
            cotton_blend_percentage,
            brand_id,
        } = req.body;
        if (
            !cotton_name ||
            !cotton_percentage ||
            !cotton_blend ||
            !cotton_blend_percentage ||
            !brand_id || brand_id.length === 0
        ) {
            return res.sendError(res, "MISSING FIELDS");
        }

        if (
            !Array.isArray(cotton_blend) ||
            !Array.isArray(cotton_blend_percentage) ||
            !Array.isArray(brand_id)
        ) {
            return res.sendError(res, "FIELDS MUST BE ARRAY");
        }
        if (cotton_blend.length < 2) {
            return res.sendError(res, "MINIMUM 2 COTTON MIXES REQUIRED");
        }

        if (cotton_blend.length !== cotton_blend_percentage.length) {
            return res.sendError(res, "COTTON BLEND AND COTTON BLEND PERCENTAGE ARRAY NOT EQUAL");
        }

        if (cotton_percentage === 100) {
            return res.sendError(res, "COTTON PERCENTAGE CANNOT BE 100%");
        }

        let total = 0;
        for (let i = 0; i < cotton_blend.length; i++) {
            total = total + cotton_blend_percentage[i]
        }

        if (total + cotton_percentage !== 100) {
            return res.sendError(res, "COTTON + COTTON MIX TOTAL PERCENTAGE MUST BE 100%");
        }

        // let result = await YarnBlend.findOne({
        //     where: {
        //         brand_id,
        //     },
        // });
        // if (result) {
        //     return res.sendError(res, "ALREADY_EXITS");
        // }

        let result = await YarnBlend.findOne({
            where: {
                cotton_name,
                cotton_percentage,
                cotton_blend,
                cotton_blend_percentage,
                brand_id,
            },
        });
        if (result) {
            return res.sendError(res, "ALREADY_EXITS");
        }

        let result2 = await YarnBlend.findOne({
            where: {
                cotton_name,
                cotton_percentage,
                cotton_blend,
                cotton_blend_percentage,
            },
        });
        if (result2) {
            return res.sendError(res, "THIS VALUE CAN ONLY BE UPDATED");
        }

        const data = {
            cotton_name,
            cotton_percentage,
            cotton_blend,
            cotton_blend_percentage,
            brand_id,
            status: true,
        };
        const yarnBlend = await YarnBlend.create(data);

        res.sendSuccess(res, yarnBlend);
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
};

const updateYarnBlend = async (req: Request, res: Response) => {
    try {
        let {
            cotton_name,
            cotton_percentage,
            cotton_blend,
            cotton_blend_percentage,
            brand_id,
            id
        } = req.body;

        if (cotton_blend.length < 2) {
            return res.sendError(res, "MINIMUM 2 COTTON MIXES REQUIRED");
        }

        if (cotton_blend.length !== cotton_blend_percentage.length) {
            return res.sendError(res, "COTTON_BLEND_AND_COTTON_BLEND_PERCENTAGE_ARRAY_NOT_EQUAL");
        }

        let total = 0;
        for (let i = 0; i < cotton_blend.length; i++) {
            total = total + cotton_blend_percentage[i]
        }

        if (total + cotton_percentage !== 100) {
            return res.sendError(res, "COTTON + COTTON MIX TOTAL PERCENTAGE MUST BE 100%");
        }

        const checkAssociation = await SpinProcess.findOne({
            where: {
                yarn_blend_id: id,
            },
        });

        let result = await YarnBlend.findOne({
            where: {
                cotton_name,
                cotton_percentage,
                cotton_blend,
                cotton_blend_percentage,
                brand_id,
            },
        });

        if (result && result.id !== id) {
            return res.sendError(res, "ALREADY_EXITS");
        }

        let checkAllBrands;
        let isValid = true;
        let isValid2 = true;
        if (checkAssociation) {
            checkAllBrands = await YarnBlend.findOne({
                where: {
                    id
                }
            });
            isValid = checkAllBrands.cotton_blend.every((item: number) => cotton_blend.includes(item));
            isValid2 = checkAllBrands.brand_id.every((item: number) => brand_id.includes(item));
        }

        if (!isValid || !isValid2) {
            res.sendError(
                res,
                "Cannot change existing brands, only add new ones"
            );
        } else {
            let updateData: any = {};
            if (cotton_name) {
                updateData.cotton_name = cotton_name;
            }
            if (cotton_percentage) {
                updateData.cotton_percentage = cotton_percentage;
            }
            if (cotton_blend) {
                updateData.cotton_blend = cotton_blend;
            }
            if (cotton_blend_percentage) {
                updateData.cotton_blend_percentage = cotton_blend_percentage;
            }
            if (brand_id) {
                updateData.brand_id = brand_id;
            }
            const cottonMix = await YarnBlend.update(updateData, {
                where: {
                    id: req.body.id,
                },
            });
            res.sendSuccess(res, cottonMix);
        }
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const updateYarnBlendStatus = async (req: Request, res: Response) => {
    try {
        const checkAssociation = await SpinProcess.findOne({
            where: {
                yarn_blend_id: req.body.id,
            },
        });
        if (checkAssociation) {
            res.sendError(
                res,
                "Unable to update the status of this blend as it is already used by spinner"
            );
        }
        const cottonMix = await YarnBlend.update(
            {
                status: req.body.status,
            },
            {
                where: {
                    id: req.body.id,
                },
            }
        );
        res.sendSuccess(res, cottonMix);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const deleteYarnBlend = async (req: Request, res: Response) => {
    try {
        const checkAssociation = await SpinProcess.findOne({
            where: {
                yarn_blend_id: req.body.id,
            },
        });
        if (checkAssociation) {
            return res.sendError(
                res,
                "Unable to delete this blend as it is already used by spinner"
            );
        }

        const data = await YarnBlend.destroy({
            where: {
                id: req.body.id,
            },
        });
        res.sendSuccess(res, { data });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const exportYarnBlend = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "yarn-blend.xlsx");

    const searchTerm = req.query.search || "";
    const sortOrder = req.query.sort || "asc";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {

        //     const query = `
        // SELECT 
        //     yb.id,
        //     yb.cotton_name,
        //     yb.cotton_percentage,
        //     yb.cotton_blend,
        //     yb.cotton_blend_percentage,
        //     array_agg(DISTINCT b.brand_name) AS brands,
        //     yb.status,
        //     array_agg(DISTINCT cm."cottonMix_name") AS cotton_mix_names
        // FROM "yarn-blends" AS yb
        // JOIN "cotton_mixes" AS cm
        //     ON cm.id = ANY(yb.cotton_blend)
        // JOIN "brands" AS b
        //     ON b.id = ANY(yb.brand_id)
        // ${req.query.brandId ? 'WHERE yb.brand_id @> ARRAY[:brandId]::integer[]' : ''}
        // ${searchTerm ?
        //             `AND (
        //         b.brand_name ILIKE '%' || :searchTerm || '%' 
        //         OR cm."cottonMix_name" ILIKE '%' || :searchTerm || '%'
        //     )`
        //             : ''}
        // GROUP BY 
        //     yb.id, 
        //     yb.cotton_name,
        //     yb.cotton_percentage,
        //     yb.cotton_blend,
        //     yb.cotton_blend_percentage,
        //     yb.status
        // ORDER BY yb.cotton_name ${sortOrder}
        // ${req.query.pagination === "true" ? 'LIMIT :limit OFFSET :offset' : ''};
        //     `;

        const query = `
            SELECT 
                yb.id,
                yb.cotton_name,
                yb.cotton_percentage,
                yb.cotton_blend,
                yb.cotton_blend_percentage,
                array_agg(DISTINCT b.brand_name) AS brands,
                yb.status,
                array_agg(DISTINCT cm."cottonMix_name") AS cotton_mix_names
            FROM "yarn-blends" AS yb
            JOIN "cotton_mixes" AS cm
                ON cm.id = ANY(yb.cotton_blend)        
            JOIN "brands" AS b
                ON b.id = ANY(yb.brand_id)

            WHERE
                (yb.brand_id @> ARRAY(
                    SELECT id FROM "brands" WHERE "brand_name" ILIKE :searchTerm
                ) 
                AND
                yb.cotton_blend @> ARRAY(
                    SELECT id FROM "cotton_mixes" WHERE "cottonMix_name" ILIKE :searchTerm
                ))

            GROUP BY
                yb.id,
                yb.cotton_name,
                yb.cotton_percentage,
                yb.cotton_blend,
                yb.cotton_blend_percentage,
                yb.status
            ORDER BY yb.cotton_name ${sortOrder}
            ${req.query.pagination === "true" ? 'LIMIT :limit OFFSET :offset' : ''};
        `;

        let replacements: any = {
            limit: limit,
            offset: offset,
        };

        if (searchTerm) {
            replacements.searchTerm = `%${searchTerm}%`;
        }

        if (req.query.brandId) {
            replacements.brandId = Number(req.query.brandId);
        }

        const data = await sequelize.query(query, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT,
        });

        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:E1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Yarn Blend';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Brand Name", "Cotton Percentage", "Cotton Mix Type", "Cotton Mix Percentage",
        ]);
        headerRow.font = { bold: true };

        for await (const [index, item] of data.entries()) {
            const modifiedArray = item.cotton_blend_percentage.map((num: number) => `${num}%`);
            const resultString = modifiedArray.join(", ");
            // Append data to worksheet
            const rowValues = Object.values({
                index: index + 1,
                brandName: item.brands ? item.brands.join(", ") : '',
                cottonPercentage: item.cotton_percentage ? `${item.cotton_percentage}%` : "",
                cottonMixType: item.cotton_mix_names ? item.cotton_mix_names.join(", ") : "",
                cottonMixPercentage: item.cotton_blend_percentage ? resultString : '',
            });
            worksheet.addRow(rowValues);
        }

        // Auto-adjust column widths based on content
        worksheet.columns.forEach((column: any) => {
            let maxCellLength = 0;
            column.eachCell({ includeEmpty: true }, (cell: any) => {
                const cellLength = (cell.value ? cell.value.toString() : '').length;
                maxCellLength = Math.max(maxCellLength, cellLength);
            });
            column.width = Math.min(14, maxCellLength + 2); // Limit width to 30 characters
        });

        // Save the workbook
        await workbook.xlsx.writeFile(excelFilePath);
        res.status(200).send({
            success: true,
            messgage: "File successfully Generated",
            data: process.env.BASE_URL + "yarn-blend.xlsx",
        });
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);

    }
};

export {
    fetchYarnBlendPagination,
    fetchSingleYarn,
    createYarnBlend,
    updateYarnBlend,
    updateYarnBlendStatus,
    deleteYarnBlend,
    exportYarnBlend,
};
