import { Request, Response } from "express";
import * as yup from 'yup';
import { Sequelize } from 'sequelize';
import { Op } from "sequelize";
import GarmentSales from "../../models/garment-sales.model";
import Brand from "../../models/brand.model";
import Garment from "../../models/garment.model";
import WeaverSales from "../../models/weaver-sales.model";
import Program from "../../models/program.model";
import KnitSales from "../../models/knit-sales.model";
import Weaver from "../../models/weaver.model";
import Knitter from "../../models/knitter.model";
import DyingSales from "../../models/dying-sales.model";
import Fabric from "../../models/fabric.model";
import PrintingSales from "../../models/printing-sales.model";
import WashingSales from "../../models/washing-sales.model";
import CompactingSales from "../../models/compacting-sales.model";
import Season from "../../models/season.model";
import GarmentProcess from "../../models/garment-process..model";
import moment from "moment";



const getTopSold = async (
    req: Request, res: Response
) => {
    try {
        const reqData = await getQueryParams(req, res);
        const where = getGarmentWhereQuery(reqData);
        const FabricData = await getTopSoldData(where);
        const data = getTopSoldRes(FabricData);
        return res.sendSuccess(res, data);

    } catch (error: any) {
        const code = error.errCode
            ? error.errCode
            : "ERR_INTERNAL_SERVER_ERROR";
        return res.sendError(res, code);
    }
};

const getTopSoldRes = (
    list: any[]
) => {
    const count: number[] = [];
    const name: string[] = [];
    for (const row of list) {
        if (row.dataValues && row.dataValues.garment_name) {
            count.push(mtConversion(row.dataValues.quantity));
            name.push(row.dataValues.garment_name);
        }
    }

    return {
        name,
        count
    };
};

const formatNumber = (data: string): number => {
    return Number(Number(data ?? 0).toFixed(2));
};

const mtConversion = (value: number) => {
    return value > 0 ? Number((value / 1000).toFixed(2)) : 0;
}

const getTopSoldData = async (
    where: any
) => {

    const result = await GarmentSales.findAll({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.col('total_no_of_pieces')), 'quantity'],
            [Sequelize.literal(`case 
          when buyer_id is not null 
            then buyer.brand_name 
          else processor_name end`), 'garment_name']
        ],
        include: [{
            model: Garment,
            as: 'garment',
            attributes: []
        }, {
            model: Brand,
            as: 'buyer',
            attributes: []
        }],
        where,
        order: [['quantity', 'desc']],
        limit: 10,
        group: ['garment_name']
    });

    return result;

};

const getGarmentWhereQuery = (
    reqData: any
) => {
    const where: any = {

    };

    where.status = 'Sold';
    if (reqData?.program)
        where.program_id = reqData.program;

    if (reqData?.brand)
        where['$garment.brand$'] = {
            [Op.contains]: Sequelize.literal(`ARRAY [${reqData.brand}]`)
        };

    if (reqData?.season)
        where.season_id = reqData.season;

    if (reqData?.country)
        where['$garment.country_id$'] = reqData.country;

    if (reqData?.state)
        where['$garment.state_id$'] = reqData.state;

    if (reqData?.district)
        where['$garment.district_id$'] = reqData.district;

    if (reqData?.garment)
        where['$garment.id$'] = reqData.garment;

    if (reqData?.fromDate)
        where.date = { [Op.gte]: reqData.fromDate };

    if (reqData?.toDate)
        where.date = { [Op.lt]: reqData.toDate };

    if (reqData?.fromDate && reqData?.toDate)
        where.date = { [Op.between]: [reqData.fromDate, reqData.toDate] };

    return where;
};


const getGarmentProcuredWhereQuery = (
    reqData: any,
) => {
    const where: any = {

    };

    where.buyer_type = "Garment";
    where.status = 'Sold';

    if (reqData?.program)
        where.program_id = reqData.program;

    if (reqData?.brand)
        where['$buyer.brand$'] = {
            [Op.contains]: Sequelize.literal(`ARRAY [${reqData.brand}]`)
        };

    if (reqData?.season)
        where.season_id = reqData.season;

    if (reqData?.country)
        where['$buyer.country_id$'] = reqData.country;

    if (reqData?.state)
        where['$buyer.state_id$'] = reqData.state;

    if (reqData?.district)
        where['$buyer.district_id$'] = reqData.district;

    if (reqData?.garment)
        where['$buyer.id$'] = reqData.garment;

    if (reqData?.fromDate)
        where.date = { [Op.gte]: reqData.fromDate };

    if (reqData?.toDate)
        where.date = { [Op.lt]: reqData.toDate };

    if (reqData?.fromDate && reqData?.toDate)
        where.date = { [Op.between]: [reqData.fromDate, reqData.toDate] };

    return where;
};

const getQueryParams = async (
    req: Request, res: Response
) => {
    try {
        let {
            program,
            brand,
            season,
            country,
            state,
            district,
            fromDate,
            toDate,
            garment
        } = req.query;
        const validator = yup.string()
            .notRequired()
            .nullable();

        await validator.validate(program);
        await validator.validate(brand);
        await validator.validate(season);
        await validator.validate(country);
        await validator.validate(state);
        await validator.validate(district);
        await validator.validate(fromDate);
        await validator.validate(toDate);
        await validator.validate(garment);

        return {
            program,
            brand,
            season,
            country,
            state,
            district,
            fromDate,
            toDate,
            garment
        };

    } catch (error: any) {
        throw {
            errCode: "REQ_ERROR"
        };
    }
};

const getGarmentFabric = async (
    req: Request, res: Response
) => {
    try {
        const reqData = await getQueryParams(req, res);
        const where = getGarmentProcuredWhereQuery(reqData);
        const weaverList = await getWeaverSalesFabricData(where);
        const knitList = await getKnitSalesFabricData(where);
        const data = getGarmentFabricRes(
            weaverList,
            knitList,
        );
        return res.sendSuccess(res, data);
    } catch (error: any) {
        const code = error.errCode
            ? error.errCode
            : "ERR_INTERNAL_SERVER_ERROR";
        return res.sendError(res, code);
    }
};

const getGarmentFabricRes = (
    weaverList: any,
    knitList: any
) => {
    let programIds: number[] = [];

    weaverList.forEach((weaver: any) => {
        if (weaver.dataValues.programId)
            programIds.push(weaver.dataValues.programId);
    });

    knitList.forEach((knit: any) => {
        if (!programIds.includes(knit.dataValues.programId))
            programIds.push(knit.dataValues.programId);
    });

    programIds = programIds.sort((a, b) => a - b);

    let program: string[] = [];
    let totalQty: number[] = [];
    let stockQty: number[] = [];

    for (const sessionId of programIds) {
        const fWeaver = weaverList.find((weaver: any) =>
            weaver.dataValues.programId == sessionId
        );
        const fKnit = knitList.find((knit: any) =>
            knit.dataValues.programId == sessionId
        );
        let data = {
            programName: '',
            totalQty: 0,
            stockQty: 0
        };

        if (fWeaver) {
            data.programName = fWeaver.dataValues.programName;
            data.totalQty += mtConversion(fWeaver.dataValues.totalQty);
            data.stockQty += mtConversion(fWeaver.dataValues.stockQty);
        }

        if (fKnit) {
            data.programName = fKnit.dataValues.programName;
            data.totalQty += mtConversion(fKnit.dataValues.totalQty);
            data.stockQty += mtConversion(fKnit.dataValues.stockQty);
        }

        program.push(data.programName);
        totalQty.push(data.totalQty);
        stockQty.push(data.stockQty);

    }

    return {
        program,
        totalQty,
        stockQty
    };
};

const getKnitSalesFabricData = async (
    where: any
) => {
    const estimateAndProduction = await KnitSales.findAll({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.col('total_fabric_weight')), 'totalQty'],
            [Sequelize.fn('SUM', Sequelize.col('qty_stock')), 'stockQty'],
            [Sequelize.col('program.id'), 'programId'],
            [Sequelize.col('program.program_name'), 'programName'],
        ],
        include: [{
            model: Program,
            as: 'program',
            attributes: [],
        }, {
            model: Garment,
            as: 'buyer',
            attributes: [],
        }],
        where,
        group: ['program.id']
    });

    return estimateAndProduction;
};

const getWeaverSalesFabricData = async (
    where: any
) => {
    const estimateAndProduction = await WeaverSales.findAll({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.col('total_fabric_length')), 'totalQty'],
            [Sequelize.fn('SUM', Sequelize.col('qty_stock')), 'stockQty'],
            [Sequelize.col('program.id'), 'programId'],
            [Sequelize.col('program.program_name'), 'programName'],
        ],
        include: [{
            model: Program,
            as: 'program',
            attributes: [],
        }, {
            model: Garment,
            as: 'buyer',
            attributes: [],
        }],
        where,
        group: ['program.id']
    });

    return estimateAndProduction;
};

const getGarmentInventory = async (
    req: Request, res: Response
) => {
    try {
        const reqData = await getQueryParams(req, res);
        const where = getGarmentWhereQuery(reqData);
        const fabricList = await getGarmentInventoryData(where);
        const data = getKnitterFabricRes(fabricList);
        return res.sendSuccess(res, data);
    } catch (error: any) {
        const code = error.errCode
            ? error.errCode
            : "ERR_INTERNAL_SERVER_ERROR";
        return res.sendError(res, code);
    }
};

const getKnitterFabricRes = (yarnList: any) => {
    let programs: string[] = [];
    for (const yarn of yarnList) {
        if (!programs.includes(yarn.dataValues.programName))
            programs.push(yarn.dataValues.programName);
    }

    let fabricList: {
        name: string,
        data: number[];
    }[] = [];

    for (const yarn of yarnList) {
        const fabricWeight = (yarn.dataValues.fabricWeight);
        const fabricName = yarn.dataValues.fabricName ?? "";

        const fFabric = fabricList.find(fabric =>
            fabric.name === fabricName
        );
        if (fFabric) {
            const pIndex = programs.findIndex(program =>
                program == yarn.dataValues.programName
            );
            fFabric.data[pIndex] = fabricWeight;

        } else {
            const data: number[] = [];
            for (const program of programs) {
                data.push(yarn.dataValues.programName == program
                    ? fabricWeight
                    : 0
                );
            }

            fabricList.push({
                name: fabricName,
                data
            });
        }
    }

    return {
        program: programs,
        fabricList
    };
};

const getGarmentInventoryData = async (
    where: any
) => {
    const result = await GarmentSales.findAll({
        attributes: [
            [
                Sequelize.fn('sum', Sequelize.col('total_no_of_pieces')), 'fabricWeight'
            ],
            [Sequelize.col('program.program_name'), 'programName'],
            [Sequelize.literal(`unnest("garment_sales".garment_type)`), 'fabricName'],
        ],
        include: [{
            model: Garment,
            as: 'garment',
            attributes: [],
        }, {
            model: Program,
            as: 'program',
            attributes: [],
        }],
        where,
        group: ['program.id', 'fabricName']
    });

    return result;
};

const getFabricWeaverSales = async (
    where: any
) => {
    const result = await WeaverSales.findAll({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.col('total_fabric_length')), 'quantity'],
            [Sequelize.col(`weaver.name`), 'buyerName']
        ],
        include: [{
            model: Weaver,
            as: 'weaver',
            attributes: [],
        }, {
            model: Garment,
            as: 'buyer',
            attributes: [],
        }],
        where,
        group: ['buyerName'],
        order: [['quantity', 'desc']],
        limit: 10
    });

    return result;
};

const getFabricKnitterSales = async (
    where: any
) => {
    const result = await KnitSales.findAll({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.col('total_fabric_weight')), 'quantity'],
            [Sequelize.col(`knitter.name`), 'buyerName']
        ],
        include: [{
            model: Knitter,
            as: 'knitter',
            attributes: [],
        }, {
            model: Garment,
            as: 'buyer',
            attributes: [],
        }],
        where,
        group: ['buyerName'],
        order: [['quantity', 'desc']],
        limit: 10
    });

    return result;
};

const getFabricDyingSales = async (
    where: any
) => {
    const result = await DyingSales.findAll({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.col('total_fabric_quantity')), 'quantity'],
            [Sequelize.col(`dying_fabric.name`), 'buyerName']
        ],
        include: [{
            model: Fabric,
            as: 'dying_fabric',
            attributes: [],
        }, {
            model: Garment,
            as: 'buyer',
            attributes: [],
        }],
        where,
        group: ['buyerName'],
        order: [['quantity', 'desc']],
        limit: 10
    });

    return result;
};

const getFabricPrintingSales = async (
    where: any
) => {
    const result = await PrintingSales.findAll({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.col('total_fabric_quantity')), 'quantity'],
            [Sequelize.col(`printing.name`), 'buyerName']
        ],
        include: [{
            model: Fabric,
            as: 'printing',
            attributes: [],
        }, {
            model: Garment,
            as: 'buyer',
            attributes: [],
        }],
        where,
        group: ['buyerName'],
        order: [['quantity', 'desc']],
        limit: 10
    });

    return result;
};

const getFabricWashingSales = async (
    where: any
) => {
    const result = await WashingSales.findAll({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.col('total_fabric_quantity')), 'quantity'],
            [Sequelize.col(`washing.name`), 'buyerName']
        ],
        include: [{
            model: Fabric,
            as: 'washing',
            attributes: [],
        }, {
            model: Garment,
            as: 'buyer',
            attributes: [],
        }],
        where,
        group: ['buyerName'],
        order: [['quantity', 'desc']],
        limit: 10
    });

    return result;
};

const getFabricCompactingSales = async (
    where: any
) => {
    const result = await CompactingSales.findAll({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.col('total_fabric_quantity')), 'quantity'],
            [Sequelize.col(`compacting.name`), 'buyerName']
        ],
        include: [{
            model: Fabric,
            as: 'compacting',
            attributes: [],
        }, {
            model: Garment,
            as: 'buyer',
            attributes: [],
        }],
        where,
        group: ['buyerName'],
        order: [['quantity', 'desc']],
        limit: 10
    });

    return result;
};



const getFabricCompareCount = async (
    req: Request, res: Response
) => {
    try {
        const reqData = await getQueryParams(req, res);
        const where = getGarmentWhereQuery(reqData);
        const procuredWhere = getGarmentProcuredWhereQuery(reqData);
        const procuredList = await getFabricProcuredData(procuredWhere);
        const processedList = await getFabricProcessedData(where);
        const data = await getFabricCompareCountRes(
            processedList,
            procuredList,
            reqData.season
        );
        return res.sendSuccess(res, data);
    } catch (error: any) {
        const code = error.errCode
            ? error.errCode
            : "ERR_INTERNAL_SERVER_ERROR";
        return res.sendError(res, code);
    }
};


const getFabricCompareCountRes = async (
    fabricProcessedList: any[],
    fabricProcuredList: any[],
    reqSeason: any
) => {
    let seasonIds: number[] = [];

    fabricProcessedList.forEach((processed: any) => {
        if (processed.dataValues.seasonId)
            seasonIds.push(processed.dataValues.seasonId);
    });

    fabricProcuredList.forEach((procured: any) => {
        if (!seasonIds.includes(procured.dataValues.seasonId))
            seasonIds.push(procured.dataValues.seasonId);
    });

    const seasons = await Season.findAll({
        limit: 3,
        order: [
            ["id", "DESC"],
        ],
    });
    if (seasonIds.length != 3 && !reqSeason) {
        for (const season of seasons) {
            if (!seasonIds.includes(season.id))
                seasonIds.push(season.id);
        }
    }
    seasonIds = seasonIds.sort((a, b) => a - b).slice(-3);

    let season: any = [];
    let fabricProcessed: any = [];
    let fabricProcured: any = [];

    for (const sessionId of seasonIds) {
        const fProcessed = fabricProcessedList.find((processed: any) =>
            processed.dataValues.seasonId == sessionId
        );
        const fProcured = fabricProcuredList.filter((procured: any) =>
            procured.dataValues.seasonId == sessionId
        );
        let data = {
            seasonName: '',
            fabricProcessed: 0,
            fabricProcured: 0
        };
        if (fProcured.length) {
            fProcured.forEach(procured => {
                data.seasonName = procured.dataValues.seasonName;
                data.fabricProcured += mtConversion(procured.dataValues.procured);
            });
        }

        if (fProcessed) {
            data.seasonName = fProcessed.dataValues.seasonName;
            data.fabricProcessed = mtConversion(fProcessed.dataValues.processed);
        }

        if (!data.seasonName) {
            const fSeason = seasons.find((season: any) =>
                season.id == sessionId
            );
            if (fSeason) {
                data.seasonName = fSeason.name;
            }
        }

        season.push(data.seasonName);
        fabricProcessed.push(data.fabricProcessed);
        fabricProcured.push(data.fabricProcured);
    }

    return {
        season,
        fabricProcessed,
        fabricProcured
    };
};



const getFabricProcuredData = async (
    where: any
) => {
    const [
        weaverSalesData,
        knitSalesData,
        dyingSalesData,
        printingSalesData,
        washingSalesData,
        compactingSalesData
    ] = await Promise.all([
        getFabricWeaverSalesBySeason(where),
        getFabricKnitterSalesBySeason(where),
        getFabricDyingSalesBySeason(where),
        getFabricPrintingSalesBySeason(where),
        getFabricWashingSalesBySeason(where),
        getFabricCompactingSalesBySeason(where),
    ]);

    return [
        ...weaverSalesData,
        ...knitSalesData,
        ...dyingSalesData,
        ...printingSalesData,
        ...washingSalesData,
        ...compactingSalesData
    ];
};


const getFabricCompactingSalesBySeason = async (
    where: any
) => {
    const result = await CompactingSales.findAll({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.col('total_fabric_quantity')), 'procured'],
            [Sequelize.col('season.name'), 'seasonName'],
            [Sequelize.col('season.id'), 'seasonId']
        ],
        include: [{
            model: Season,
            as: 'season',
            attributes: []
        }, {
            model: Garment,
            as: 'buyer',
            attributes: [],
        }],
        where,
        order: [['seasonId', 'desc']],
        limit: 3,
        group: ['season.id']
    });

    return result;
};

const getFabricWashingSalesBySeason = async (
    where: any
) => {
    const result = await WashingSales.findAll({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.col('total_fabric_quantity')), 'procured'],
            [Sequelize.col('season.name'), 'seasonName'],
            [Sequelize.col('season.id'), 'seasonId']
        ],
        include: [{
            model: Season,
            as: 'season',
            attributes: []
        }, {
            model: Garment,
            as: 'buyer',
            attributes: [],
        }],
        where,
        order: [['seasonId', 'desc']],
        limit: 3,
        group: ['season.id']
    });

    return result;
};

const getFabricPrintingSalesBySeason = async (
    where: any
) => {
    const result = await PrintingSales.findAll({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.col('total_fabric_quantity')), 'procured'],
            [Sequelize.col('season.name'), 'seasonName'],
            [Sequelize.col('season.id'), 'seasonId']
        ],
        include: [{
            model: Season,
            as: 'season',
            attributes: []
        }, {
            model: Garment,
            as: 'buyer',
            attributes: [],
        }],
        where,
        order: [['seasonId', 'desc']],
        limit: 3,
        group: ['season.id']
    });

    return result;
};

const getFabricDyingSalesBySeason = async (
    where: any
) => {
    const result = await DyingSales.findAll({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.col('total_fabric_quantity')), 'procured'],
            [Sequelize.col('season.name'), 'seasonName'],
            [Sequelize.col('season.id'), 'seasonId']
        ],
        include: [{
            model: Season,
            as: 'season',
            attributes: []
        }, {
            model: Garment,
            as: 'buyer',
            attributes: [],
        }],
        where,
        order: [['seasonId', 'desc']],
        limit: 3,
        group: ['season.id']
    });

    return result;
};


const getFabricKnitterSalesBySeason = async (
    where: any
) => {
    const result = await KnitSales.findAll({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.col('total_fabric_weight')), 'procured'],
            [Sequelize.col('season.name'), 'seasonName'],
            [Sequelize.col('season.id'), 'seasonId']
        ],
        include: [{
            model: Season,
            as: 'season',
            attributes: []
        }, {
            model: Garment,
            as: 'buyer',
            attributes: [],
        }],
        where,
        order: [['seasonId', 'desc']],
        limit: 3,
        group: ['season.id']
    });

    return result;
};

const getFabricWeaverSalesBySeason = async (
    where: any
) => {
    const result = await WeaverSales.findAll({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.col('total_fabric_length')), 'procured'],
            [Sequelize.col('season.name'), 'seasonName'],
            [Sequelize.col('season.id'), 'seasonId']
        ],
        include: [{
            model: Season,
            as: 'season',
            attributes: []
        }, {
            model: Garment,
            as: 'buyer',
            attributes: [],
        }],
        where,
        order: [['seasonId', 'desc']],
        limit: 3,
        group: ['season.id']
    });

    return result;
};

const getFabricProcessedData = async (
    where: any
) => {
    const result = await GarmentProcess.findAll({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.col('fabric_length')), 'processed'],
            [Sequelize.col('season.name'), 'seasonName'],
            [Sequelize.col('season.id'), 'seasonId']
        ],
        include: [{
            model: Season,
            as: 'season',
            attributes: []
        }, {
            model: Garment,
            as: 'garment',
            attributes: [],
        }],
        where,
        order: [['seasonId', 'desc']],
        limit: 3,
        group: ['season.id']
    });

    return result;
};


const getGarmentCompareCount = async (
    req: Request, res: Response
) => {
    try {
        const reqData = await getQueryParams(req, res);
        const where = getGarmentWhereQuery(reqData);
        const processedList = await getGarmentProcessedData(where);
        const soldList = await getGarmentSoldData(where);
        const data = await getGarmentCompareCountRes(
            processedList,
            soldList,
            reqData.season
        );
        return res.sendSuccess(res, data);
    } catch (error: any) {
        const code = error.errCode
            ? error.errCode
            : "ERR_INTERNAL_SERVER_ERROR";
        return res.sendError(res, code);
    }
};



const getGarmentCompareCountRes = async (
    fabricProcessedList: any[],
    fabricSoldList: any[],
    reqSeason: any
) => {
    let seasonIds: number[] = [];

    fabricProcessedList.forEach((processed: any) => {
        if (processed.dataValues.seasonId)
            seasonIds.push(processed.dataValues.seasonId);
    });

    fabricSoldList.forEach((sold: any) => {
        if (!seasonIds.includes(sold.dataValues.seasonId))
            seasonIds.push(sold.dataValues.seasonId);
    });

    const seasons = await Season.findAll({
        limit: 3,
        order: [
            ["id", "DESC"],
        ],
    });
    if (seasonIds.length != 3 && !reqSeason) {
        for (const season of seasons) {
            if (!seasonIds.includes(season.id))
                seasonIds.push(season.id);
        }
    }

    seasonIds = seasonIds.sort((a, b) => a - b).slice(-3);

    let season: any = [];
    let fabricProcessed: any = [];
    let fabricSold: any = [];

    for (const sessionId of seasonIds) {
        const fProcessed = fabricProcessedList.find((processed: any) =>
            processed.dataValues.seasonId == sessionId
        );
        const fSold = fabricSoldList.find((sold: any) =>
            sold.dataValues.seasonId == sessionId
        );
        let data = {
            seasonName: '',
            fabricProcessed: 0,
            fabricSold: 0
        };
        if (fProcessed) {
            data.seasonName = fProcessed.dataValues.seasonName;
            data.fabricProcessed = (fProcessed.dataValues.processed);
        }

        if (fSold) {
            data.seasonName = fSold.dataValues.seasonName;
            data.fabricSold = (fSold.dataValues.sold);
        }

        if (!data.seasonName) {
            const fSeason = seasons.find((season: any) =>
                season.id == sessionId
            );
            if (fSeason) {
                data.seasonName = fSeason.name;
            }
        }

        season.push(data.seasonName);
        fabricProcessed.push(data.fabricProcessed);
        fabricSold.push(data.fabricSold);
    }

    return {
        season,
        fabricProcessed,
        fabricSold
    };
};


const getGarmentSoldData = async (
    where: any
) => {
    const result = await GarmentSales.findAll({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.literal('total_no_of_pieces')), 'sold'],
            [Sequelize.col('season.name'), 'seasonName'],
            [Sequelize.col('season.id'), 'seasonId']
        ],
        include: [{
            model: Season,
            as: 'season',
            attributes: []
        }, {
            model: Garment,
            as: 'garment',
            attributes: [],
        }],
        where,
        order: [['seasonId', 'desc']],
        limit: 3,
        group: ['season.id']
    });

    return result;
};

const getGarmentProcessedData = async (
    where: any
) => {
    const result = await GarmentProcess.findAll({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.literal('(SELECT SUM(s) FROM UNNEST(no_of_pieces) s)')), 'processed'],
            [Sequelize.col('season.name'), 'seasonName'],
            [Sequelize.col('season.id'), 'seasonId']
        ],
        include: [{
            model: Season,
            as: 'season',
            attributes: []
        }, {
            model: Garment,
            as: 'garment',
            attributes: [],
        }],
        where,
        order: [['seasonId', 'desc']],
        limit: 3,
        group: ['season.id']
    });

    return result;
};



const getFabricGarmentMonthlyData = async (
    req: Request, res: Response
) => {
    try {
        const reqData = await getQueryParams(req, res);
        const seasonOne = await Season.findOne({
            where: {
                id: reqData.season ? reqData.season : '10'
            }
        });
        reqData.season = seasonOne.id;
        const garmentWhere = getGarmentWhereQuery(reqData);
        const procuredWhere = getGarmentProcuredWhereQuery(reqData);
        const fabricProcuredList = await getFabricProcuredMonthlyData(procuredWhere);
        const fabricProcessedList = await getFabricProcessedMonthlyData(garmentWhere);
        const garmentProcessedList = await getGarmentProcessedMonthlyData(garmentWhere);
        const garmentSoldList = await getGarmentSoldMonthlyData(garmentWhere);
        const data = getFabricGarmentMonthlyDataRes(
            fabricProcuredList,
            fabricProcessedList,
            garmentProcessedList,
            garmentSoldList,
            seasonOne
        );
        return res.sendSuccess(res, data);
    } catch (error: any) {
        const code = error.errCode
            ? error.errCode
            : "ERR_INTERNAL_SERVER_ERROR";
        return res.sendError(res, code);
    }
};


const getFabricGarmentMonthlyDataRes = (
    fabricProcuredList: any[],
    fabricProcessedList: any[],
    garmentProcessedList: any[],
    garmentSoldList: any[],
    season: any
) => {
    const monthList = getMonthDate(season.from, season.to);

    const res: {
        [key: string]: Array<string | number>;
    } = {
        month: [],
        fabricProcured: [],
        fabricProcessed: [],
        garmentProcessed: [],
        garmentSold: []
    };

    for (const month of monthList) {
        const fFabricProcured = fabricProcuredList.find((procured: any) =>
            (procured.dataValues.month - 1) == month.month &&
            procured.dataValues.year == month.year
        );
        const fFabricProcessed = fabricProcessedList.find((processed: any) =>
            (processed.dataValues.month - 1) == month.month &&
            processed.dataValues.year == month.year
        );
        const fGarmentProcessed = garmentProcessedList.find((processed: any) =>
            (processed.dataValues.month - 1) == month.month &&
            processed.dataValues.year == month.year
        );
        const fGarmentSold = garmentSoldList.find((sold: any) =>
            (sold.dataValues.month - 1) == month.month &&
            sold.dataValues.year == month.year
        );

        let data = {
            fabricProcured: 0,
            fabricProcessed: 0,
            garmentProcessed: 0,
            garmentSold: 0
        };

        if (fFabricProcured)
            data.fabricProcured = mtConversion(fFabricProcured.dataValues.procured);

        if (fFabricProcessed)
            data.fabricProcessed = mtConversion(fFabricProcessed.dataValues.processed);

        if (fGarmentProcessed)
            data.garmentProcessed = (fGarmentProcessed.dataValues.processed);

        if (fGarmentSold)
            data.garmentSold = (fGarmentSold.dataValues.sold);

        res.month.push(getMonthName(month.month));
        res.fabricProcured.push(data.fabricProcured);
        res.fabricProcessed.push(data.fabricProcessed);
        res.garmentProcessed.push(data.garmentProcessed);
        res.garmentSold.push(data.garmentSold);

    }

    return res;

};


const getGarmentSoldMonthlyData = async (
    where: any
) => {
    const result = await GarmentSales.findAll({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.literal('total_no_of_pieces')), 'sold'],
            [Sequelize.literal("date_part('Month', date)"), 'month'],
            [Sequelize.literal("date_part('Year', date)"), 'year'],
        ],
        include: [{
            model: Garment,
            as: 'garment',
            attributes: [],
        }],
        where,
        group: ['month', 'year']
    });

    return result;
};

const getGarmentProcessedMonthlyData = async (
    where: any
) => {
    const result = await GarmentProcess.findAll({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.literal('(SELECT SUM(s) FROM UNNEST(no_of_pieces) s)')), 'processed'],
            [Sequelize.literal("date_part('Month', date)"), 'month'],
            [Sequelize.literal("date_part('Year', date)"), 'year'],
        ],
        include: [{
            model: Garment,
            as: 'garment',
            attributes: [],
        }],
        where,
        group: ['month', 'year']
    });

    return result;
};

const getFabricProcuredMonthlyData = async (
    where: any
) => {
    const [
        weaverSalesData,
        knitSalesData,
        dyingSalesData,
        printingSalesData,
        washingSalesData,
        compactingSalesData
    ] = await Promise.all([
        getFabricWeaverMonthlySales(where),
        getFabricKnitterMonthlySales(where),
        getFabricDyingMonthlySales(where),
        getFabricPrintingMonthlySales(where),
        getFabricWashingMonthlySales(where),
        getFabricCompactingMonthlySales(where),
    ]);

    return [
        ...weaverSalesData,
        ...knitSalesData,
        ...dyingSalesData,
        ...printingSalesData,
        ...washingSalesData,
        ...compactingSalesData
    ];
};


const getFabricCompactingMonthlySales = async (
    where: any
) => {
    const result = await CompactingSales.findAll({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.col('total_fabric_quantity')), 'procured'],
            [Sequelize.literal("date_part('Month', date)"), 'month'],
            [Sequelize.literal("date_part('Year', date)"), 'year'],
        ],
        include: [{
            model: Garment,
            as: 'buyer',
            attributes: [],
        }],
        where,
        group: ['month', 'year']
    });

    return result;
};

const getFabricWashingMonthlySales = async (
    where: any
) => {
    const result = await WashingSales.findAll({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.col('total_fabric_quantity')), 'procured'],
            [Sequelize.literal("date_part('Month', date)"), 'month'],
            [Sequelize.literal("date_part('Year', date)"), 'year'],
        ],
        include: [{
            model: Garment,
            as: 'buyer',
            attributes: [],
        }],
        where,
        group: ['month', 'year']
    });

    return result;
};

const getFabricPrintingMonthlySales = async (
    where: any
) => {
    const result = await PrintingSales.findAll({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.col('total_fabric_quantity')), 'procured'],
            [Sequelize.literal("date_part('Month', date)"), 'month'],
            [Sequelize.literal("date_part('Year', date)"), 'year'],
        ],
        include: [{
            model: Garment,
            as: 'buyer',
            attributes: [],
        }],
        where,
        group: ['month', 'year']
    });

    return result;
};

const getFabricDyingMonthlySales = async (
    where: any
) => {
    const result = await DyingSales.findAll({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.col('total_fabric_quantity')), 'procured'],
            [Sequelize.literal("date_part('Month', date)"), 'month'],
            [Sequelize.literal("date_part('Year', date)"), 'year'],
        ],
        include: [{
            model: Garment,
            as: 'buyer',
            attributes: [],
        }],
        where,
        group: ['month', 'year']
    });

    return result;
};


const getFabricKnitterMonthlySales = async (
    where: any
) => {
    const result = await KnitSales.findAll({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.col('total_fabric_weight')), 'procured'],
            [Sequelize.literal("date_part('Month', date)"), 'month'],
            [Sequelize.literal("date_part('Year', date)"), 'year'],
        ],
        include: [{
            model: Garment,
            as: 'buyer',
            attributes: [],
        }],
        where,
        group: ['month', 'year']
    });

    return result;
};

const getFabricWeaverMonthlySales = async (
    where: any
) => {
    const result = await WeaverSales.findAll({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.col('total_fabric_length')), 'procured'],
            [Sequelize.literal("date_part('Month', date)"), 'month'],
            [Sequelize.literal("date_part('Year', date)"), 'year'],
        ],
        include: [{
            model: Garment,
            as: 'buyer',
            attributes: [],
        }],
        where,
        group: ['month', 'year']
    });

    return result;
};

const getFabricProcessedMonthlyData = async (
    where: any
) => {
    const result = await GarmentProcess.findAll({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.col('fabric_length')), 'processed'],
            [Sequelize.literal("date_part('Month', date)"), 'month'],
            [Sequelize.literal("date_part('Year', date)"), 'year'],
        ],
        include: [{
            model: Garment,
            as: 'garment',
            attributes: [],
        }],
        where,
        group: ['month', 'year']
    });

    return result;
};


const getTopProcured = async (
    req: Request, res: Response
) => {
    try {
        const reqData = await getQueryParams(req, res);
        const where = getGarmentProcuredWhereQuery(reqData);
        const [
            weaverSalesData,
            knitSalesData,
            dyingSalesData,
            printingSalesData,
            washingSalesData,
            compactingSalesData
        ] = await Promise.all([
            getFabricWeaverSales(where),
            getFabricKnitterSales(where),
            getFabricDyingSales(where),
            getFabricPrintingSales(where),
            getFabricWashingSales(where),
            getFabricCompactingSales(where),

        ]);
        const data = getTopProcuredRes(
            weaverSalesData,
            knitSalesData,
            dyingSalesData,
            printingSalesData,
            washingSalesData,
            compactingSalesData
        );
        return res.sendSuccess(res, data);

    } catch (error: any) {
        const code = error.errCode
            ? error.errCode
            : "ERR_INTERNAL_SERVER_ERROR";
        return res.sendError(res, code);
    }

};

const getTopProcuredRes = (
    weaverSalesData: any,
    knitSalesData: any,
    dyingSalesData: any,
    printingSalesData: any,
    washingSalesData: any,
    compactingSalesData: any
) => {
    let procuredList = [
        ...weaverSalesData,
        ...knitSalesData,
        ...dyingSalesData,
        ...printingSalesData,
        ...washingSalesData,
        ...compactingSalesData
    ];

    procuredList.sort((first, second) =>
        second.dataValues.quantity - first.dataValues.quantity
    );

    procuredList = procuredList.slice(0, 10);

    const name: string[] = [];
    const count: number[] = [];
    for (const row of procuredList) {
        if (row.dataValues && row.dataValues.buyerName) {
            name.push(row.dataValues.buyerName);
            count.push(mtConversion(row.dataValues.quantity));
        }
    }

    return {
        name,
        count
    };
};


const getMonthDate = (
    from: string,
    to: string
) => {
    let start = moment(from).utc();
    const end = moment(to).utc();
    const monthList: {
        month: number,
        year: number;
    }[] = [];
    while (end.diff(start, 'days') > 0) {
        monthList.push({
            month: start.month(),
            year: start.year()
        });
        start = start.add(1, 'month');
    }
    return monthList;
};



const getMonthName = (
    month: number
): string => {
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    return monthNames[month];
};

export {
    getTopSold,
    getGarmentFabric,
    getGarmentInventory,
    getFabricCompareCount,
    getGarmentCompareCount,
    getFabricGarmentMonthlyData,
    getTopProcured
};