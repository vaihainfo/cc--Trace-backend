import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import * as yup from 'yup';
import SpinSales from "../../models/spin-sales.model";
import KnitSales from "../../models/knit-sales.model";
import Fabric from "../../models/fabric.model";
import Program from "../../models/program.model";
import WeaverSales from "../../models/weaver-sales.model";
import GarmentSales from "../../models/garment-sales.model";
import Garment from "../../models/garment.model";
import Weaver from "../../models/weaver.model";
import Knitter from "../../models/knitter.model";
import DyingSales from "../../models/dying-sales.model";
import Season from "../../models/season.model";

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
            block,
            village,
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
        await validator.validate(block);
        await validator.validate(village);
        if (!season) {
            const seasonOne = await Season.findOne({
                order: [
                    ['id', 'DESC']
                ]
            });
            season = seasonOne.id;
        }

        return {
            program,
            brand,
            season,
            country,
            state,
            district,
            block,
            village,
        };

    } catch (error: any) {
        throw {
            errCode: "REQ_ERROR"
        };
    }
};

const getKnitterYarn = async (
    req: Request, res: Response
) => {
    try {
        const reqData = await getQueryParams(req, res);
        const where = getSpinSalesWhereQuery(reqData, 'knitter');
        const yarnList = await getSpinYarnData('knitter', where);
        const data = getSpinYarnRes(yarnList);
        return res.sendSuccess(res, data);
    } catch (error: any) {
        const code = error.errCode
            ? error.errCode
            : "ERR_INTERNAL_SERVER_ERROR";
        return res.sendError(res, code);
    }
};

const getSpinYarnRes = (yarnList: any) => {
    let program: any = [];
    let totalQty: any = [];
    let stockQty: any = [];

    for (const yarn of yarnList) {
        program.push(yarn.dataValues.programName);
        totalQty.push(formatNumber(yarn.dataValues.totalQty));
        stockQty.push(formatNumber(yarn.dataValues.stockQty));
    }

    return {
        program,
        totalQty,
        stockQty
    };
};


const getSpinSalesWhereQuery = (
    reqData: any,
    type: 'knitter' | 'weaver'
) => {
    const where: any = {
        status: 'Sold'
    };

    if (reqData?.program)
        where.program_id = reqData.program;


    if (reqData?.season)
        where.season_id = reqData.season;

    if (type == 'knitter') {


        if (reqData?.brand)
            where['$knitter.brand$'] = {
                [Op.contains]: Sequelize.literal(`ARRAY [${ reqData.brand }]`)
            };


        if (reqData?.country)
            where['$knitter.country_id$'] = reqData.country;

        if (reqData?.state)
            where['$knitter.state_id$'] = reqData.state;

        if (reqData?.district)
            where['$knitter.district_id$'] = reqData.district;

    } else {


        if (reqData?.brand)
            where['$knitter.brand$'] = {
                [Op.contains]: Sequelize.literal(`ARRAY [${ reqData.brand }]`)
            };

        if (reqData?.country)
            where['$weaver.country_id$'] = reqData.country;

        if (reqData?.state)
            where['$weaver.state_id$'] = reqData.state;

        if (reqData?.district)
            where['$weaver.district_id$'] = reqData.district;
    }


    // if (reqData?.block)
    //     where['$farmer.block_id$'] = reqData.block;

    // if (reqData?.village)
    //     where['$farmer.village_id$'] = reqData.village;

    return where;


};

const getSpinYarnData = async (
    type: 'knitter' | 'weaver',
    where: any
) => {
    if (type === 'weaver') {
        where.buyer_id = {
            [Op.not]: null
        };
    }
    else {
        where.knitter_id = {
            [Op.not]: null
        };
    };

    const estimateAndProduction = await SpinSales.findAll({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.col('yarn_count')), 'totalQty'],
            [Sequelize.fn('SUM', Sequelize.col('qty_stock')), 'stockQty'],
            [Sequelize.col('program.id'), 'programId'],
            [Sequelize.col('program.program_name'), 'programName'],
        ],
        include: [{
            model: Program,
            as: 'program',
            attributes: [],
        }, {
            model: Weaver,
            as: 'weaver',
            attributes: [],
        }, {
            model: Knitter,
            as: 'knitter',
            attributes: [],
        }],
        where,
        group: ['program.id']
    });

    return estimateAndProduction;
};

const getKnitterFabric = async (
    req: Request, res: Response
) => {
    try {
        const reqData = await getQueryParams(req, res);
        const where = getKnitterSalesWhereQuery(reqData);
        const fabricList = await getKnitterFabricData(where);
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
        const fabricWeight = formatNumber(yarn.dataValues.fabricWeight);
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


const getKnitterSalesWhereQuery = (
    reqData: any
) => {
    const where: any = {
        status: "Sold"
    };

    if (reqData?.program)
        where.program_id = reqData.program;

    if (reqData?.brand)
        where['$knitter.brand$'] = {
            [Op.contains]: Sequelize.literal(`ARRAY [${ reqData.brand }]`)
        };

    if (reqData?.country)
        where['$knitter.country_id$'] = reqData.country;

    if (reqData?.state)
        where['$knitter.state_id$'] = reqData.state;

    if (reqData?.district)
        where['$knitter.district_id$'] = reqData.district;

    // if (reqData?.block)
    //     where['$farmer.block_id$'] = reqData.block;

    // if (reqData?.village)
    //     where['$farmer.village_id$'] = reqData.village;

    return where;


};

const getKnitterFabricData = async (
    where: any
) => {
    const estimateAndProduction = await KnitSales.findAll({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.col('total_fabric_weight')), 'fabricWeight'],
            [Sequelize.col('program.program_name'), 'programName'],
            [Sequelize.col('dyingwashing.name'), 'fabricName'],
        ],
        include: [{
            model: Fabric,
            as: 'dyingwashing',
            attributes: [],
        }, {
            model: Program,
            as: 'program',
            attributes: [],
        }, {
            model: Knitter,
            as: 'knitter',
            attributes: [],
        }],
        where,
        group: ['program.id', 'dyingwashing.id']
    });

    return estimateAndProduction;
};

const getWeaverYarn = async (
    req: Request, res: Response
) => {
    try {
        const reqData = await getQueryParams(req, res);
        const where = getSpinSalesWhereQuery(reqData, 'weaver');
        const yarnList = await getSpinYarnData('weaver', where);
        const data = getSpinYarnRes(yarnList);
        return res.sendSuccess(res, data);
    } catch (error: any) {
        const code = error.errCode
            ? error.errCode
            : "ERR_INTERNAL_SERVER_ERROR";
        return res.sendError(res, code);
    }
};


const getWeaverFabric = async (
    req: Request, res: Response
) => {
    try {
        const reqData = await getQueryParams(req, res);
        const where = getWeaverSalesWhereQuery(reqData);
        const fabricList = await getWeaverFabricData(where);
        const data = getKnitterFabricRes(fabricList);
        return res.sendSuccess(res, data);
    } catch (error: any) {
        const code = error.errCode
            ? error.errCode
            : "ERR_INTERNAL_SERVER_ERROR";
        return res.sendError(res, code);
    }
};


const getWeaverSalesWhereQuery = (
    reqData: any
) => {
    const where: any = {
        status: "Sold"
    };

    if (reqData?.program)
        where.program_id = reqData.program;

    if (reqData?.brand)
        where['$weaver.brand$'] = {
            [Op.contains]: Sequelize.literal(`ARRAY [${ reqData.brand }]`)
        };

    if (reqData?.country)
        where['$weaver.country_id$'] = reqData.country;

    if (reqData?.state)
        where['$weaver.state_id$'] = reqData.state;

    if (reqData?.district)
        where['$weaver.district_id$'] = reqData.district;

    // if (reqData?.block)
    //     where['$farmer.block_id$'] = reqData.block;

    // if (reqData?.village)
    //     where['$farmer.village_id$'] = reqData.village;

    return where;


};

const getWeaverFabricData = async (
    where: any
) => {
    const estimateAndProduction = await WeaverSales.findAll({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.col('total_fabric_length')), 'fabricWeight'],
            [Sequelize.col('program.program_name'), 'programName'],
            [Sequelize.col('dyingwashing.name'), 'fabricName'],
        ],
        include: [{
            model: Fabric,
            as: 'dyingwashing',
            attributes: [],
        }, {
            model: Program,
            as: 'program',
            attributes: [],
        }, {
            model: Weaver,
            as: 'weaver',
            attributes: [],
        }],
        where,
        group: ['program.id', 'dyingwashing.id']
    });

    return estimateAndProduction;
};

const getGarmentFabric = async (
    req: Request, res: Response
) => {
    try {
        const reqData = await getQueryParams(req, res);
        const where = getWeaverSalesGarmentWhereQuery(reqData);
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
            data.totalQty += formatNumber(fWeaver.dataValues.totalQty);
            data.stockQty += formatNumber(fWeaver.dataValues.stockQty);
        }

        if (fKnit) {
            data.programName = fKnit.dataValues.programName;
            data.totalQty += formatNumber(fKnit.dataValues.totalQty);
            data.stockQty += formatNumber(fKnit.dataValues.stockQty);
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


const getWeaverSalesGarmentWhereQuery = (
    reqData: any
) => {
    const where: any = {
        status: "Sold"
    };

    if (reqData?.program)
        where.program_id = reqData.program;

    if (reqData?.brand)
        where['$buyer.brand$'] = {
            [Op.contains]: Sequelize.literal(`ARRAY [${ reqData.brand }]`)
        };

    if (reqData?.country)
        where['$buyer.country_id$'] = reqData.country;

    if (reqData?.state)
        where['$buyer.state_id$'] = reqData.state;

    if (reqData?.district)
        where['$buyer.district_id$'] = reqData.district;

    // if (reqData?.block)
    //     where['$farmer.block_id$'] = reqData.block;

    // if (reqData?.village)
    //     where['$farmer.village_id$'] = reqData.village;

    return where;


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
        const where = getGarmentSalesWhereQuery(reqData);
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


const getGarmentSalesWhereQuery = (
    reqData: any
) => {
    const where: any = {
        status: "Sold"
    };

    if (reqData?.program)
        where.program_id = reqData.program;

    if (reqData?.brand)
        where['$garment.brand$'] = {
            [Op.contains]: Sequelize.literal(`ARRAY [${ reqData.brand }]`)
        };

    if (reqData?.country)
        where['$garment.country_id$'] = reqData.country;

    if (reqData?.state)
        where['$garment.state_id$'] = reqData.state;

    if (reqData?.district)
        where['$garment.district_id$'] = reqData.district;

    // if (reqData?.block)
    //     where['$farmer.block_id$'] = reqData.block;

    // if (reqData?.village)
    //     where['$farmer.village_id$'] = reqData.village;

    return where;


};

const getGarmentInventoryData = async (
    where: any
) => {
    const result = await GarmentSales.findAll({
        attributes: [
            [
                Sequelize.fn('sum',
                    Sequelize.literal('(select sum(piece) from unnest(no_of_pieces) as piece)')
                ),
                'fabricWeight'
            ],
            [Sequelize.col('program.program_name'), 'programName'],
            [Sequelize.col('garment.name'), 'fabricName'],
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
        group: ['program.id', 'garment.id']
    });

    return result;
};


const getFabricYarn = async (
    req: Request, res: Response
) => {
    try {
        const reqData = await getQueryParams(req, res);
        const where = getDyingSalesWhereQuery(reqData);
        const yarnList = await getFabricYarnData(where);
        const data = getSpinYarnRes(yarnList);
        return res.sendSuccess(res, data);
    } catch (error: any) {
        const code = error.errCode
            ? error.errCode
            : "ERR_INTERNAL_SERVER_ERROR";
        return res.sendError(res, code);
    }
};


const getDyingSalesWhereQuery = (
    reqData: any
) => {
    const where: any = {

    };

    if (reqData?.program)
        where.program_id = reqData.program;

    if (reqData?.brand)
        where['$dying_fabric.brand$'] = {
            [Op.contains]: Sequelize.literal(`ARRAY [${ reqData.brand }]`)
        };

    if (reqData?.country)
        where['$dying_fabric.country_id$'] = reqData.country;

    if (reqData?.state)
        where['$dying_fabric.state_id$'] = reqData.state;

    if (reqData?.district)
        where['$dying_fabric.district_id$'] = reqData.district;

    // if (reqData?.block)
    //     where['$farmer.block_id$'] = reqData.block;

    // if (reqData?.village)
    //     where['$farmer.village_id$'] = reqData.village;

    return where;


};


const getFabricYarnData = async (
    where: any
) => {

    const result = await DyingSales.findAll({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.col('qty_stock')), 'stockQty'],
            [Sequelize.fn('SUM', Sequelize.col('total_fabric_quantity')), 'totalQty'],
            [Sequelize.col('program.id'), 'programId'],
            [Sequelize.col('program.program_name'), 'programName'],
        ],
        include: [{
            model: Program,
            as: 'program',
            attributes: [],
        }, {
            model: Fabric,
            as: 'dying_fabric',
            attributes: [],
        }],
        where,
        group: ['program.id']
    });

    return result;
};


const getFabric = async (
    req: Request, res: Response
) => {
    try {
        const reqData = await getQueryParams(req, res);
        const dyingWhere = getDyingSalesWhereQuery(reqData);
        const knitSaleWhere = getKnitSalesWhereQuery(reqData);
        const yarnList = await getFabricYarnData(dyingWhere);
        const KnitSales = await getKnitSaleData(knitSaleWhere);
        const weaverSales = await getWeaverSaleData(knitSaleWhere);
        const data = getFabricRes(
            yarnList,
            KnitSales,
            weaverSales
        );
        return res.sendSuccess(res, data);
    } catch (error: any) {
        const code = error.errCode
            ? error.errCode
            : "ERR_INTERNAL_SERVER_ERROR";
        return res.sendError(res, code);
    }
};


const getFabricRes = (
    yarnList: any,
    KnitSales: any,
    weaverSales: any
) => {
    let programs: string[] = [];

    for (const yarn of yarnList) {
        if (!programs.includes(yarn.dataValues.programName))
            programs.push(yarn.dataValues.programName);
    }

    for (const KnitSale of KnitSales) {
        if (!programs.includes(KnitSale.dataValues.programName))
            programs.push(KnitSale.dataValues.programName);
    }

    for (const weaverSale of weaverSales) {
        if (!programs.includes(weaverSale.dataValues.programName))
            programs.push(weaverSale.dataValues.programName);
    }

    const receivedList: number[] = [];
    const processedList: number[] = [];
    const stockList: number[] = [];

    for (const program of programs) {
        const fYarn = yarnList.find((yarn: any) =>
            yarn.dataValues.programName == program
        );

        const fKnit = KnitSales.find((knit: any) =>
            knit.dataValues.programName == program
        );

        const fWeaver = weaverSales.find((weaver: any) =>
            weaver.dataValues.programName == program
        );

        let data = {
            received: 0,
            processed: 0,
            stock: 0
        };

        if (fKnit) {
            data.received += formatNumber(fKnit.dataValues.totalQty);
            data.stock += formatNumber(fKnit.dataValues.stockQty);
        }

        if (fWeaver) {
            data.received += formatNumber(fWeaver.dataValues.totalQty);
            data.stock += formatNumber(fWeaver.dataValues.stockQty);
        }

        if (fYarn) {
            data.processed += formatNumber(fYarn.dataValues.totalQty);
        }

        receivedList.push(data.received);
        processedList.push(data.processed);
        stockList.push(data.stock);
    }

    return {
        programs,
        receivedList,
        processedList,
        stockList
    };
};


const getWeaverSaleData = async (
    where: any
) => {

    const result = await WeaverSales.findAll({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.col('qty_stock')), 'stockQty'],
            [Sequelize.fn('SUM', Sequelize.col('total_fabric_length')), 'totalQty'],
            [Sequelize.col('program.id'), 'programId'],
            [Sequelize.col('program.program_name'), 'programName'],
        ],
        include: [{
            model: Program,
            as: 'program',
            attributes: [],
        }, {
            model: Fabric,
            as: 'dyingwashing',
            attributes: [],
        }],
        where,
        group: ['program.id']
    });

    return result;
};

const getKnitSalesWhereQuery = (
    reqData: any
) => {
    const where: any = {
        status: "Sold"
    };

    if (reqData?.program)
        where.program_id = reqData.program;

    if (reqData?.brand)
        where['$dyingwashing.brand$'] = {
            [Op.contains]: Sequelize.literal(`ARRAY [${ reqData.brand }]`)
        };

    if (reqData?.country)
        where['$dyingwashing.country_id$'] = reqData.country;

    if (reqData?.state)
        where['$dyingwashing.state_id$'] = reqData.state;

    if (reqData?.district)
        where['$dyingwashing.district_id$'] = reqData.district;

    // if (reqData?.block)
    //     where['$farmer.block_id$'] = reqData.block;

    // if (reqData?.village)
    //     where['$farmer.village_id$'] = reqData.village;

    return where;
};

const getKnitSaleData = async (
    where: any
) => {

    const result = await KnitSales.findAll({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.col('qty_stock')), 'stockQty'],
            [Sequelize.fn('SUM', Sequelize.col('total_fabric_weight')), 'totalQty'],
            [Sequelize.col('program.id'), 'programId'],
            [Sequelize.col('program.program_name'), 'programName'],
        ],
        include: [{
            model: Program,
            as: 'program',
            attributes: [],
        }, {
            model: Fabric,
            as: 'dyingwashing',
            attributes: [],
        }],
        where,
        group: ['program.id']
    });

    return result;
};



const formatNumber = (data: string): number => {
    return Number(Number(data ?? 0).toFixed(2));
};

export {
    getKnitterYarn,
    getKnitterFabric,
    getWeaverYarn,
    getWeaverFabric,
    getGarmentFabric,
    getGarmentInventory,
    getFabricYarn as getFabricInventory,
    getFabric as getFabricType
};