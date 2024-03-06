import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import SpinSales from "../../models/spin-sales.model";
import KnitSales from "../../models/knit-sales.model";
import Fabric from "../../models/fabric.model";
import Program from "../../models/program.model";
import WeaverSales from "../../models/weaver-sales.model";
import GarmentSales from "../../models/garment-sales.model";
import Garment from "../../models/garment.model";

const getKnitterYarn = async (
    req: Request, res: Response
) => {
    try {
        const yarnList = await getSpinYarnData('knitter');
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

const getSpinYarnData = async (
    type: 'knitter' | 'weaver'
) => {
    let where: any = {
        knitter_id: {
            [Op.not]: null
        }
    };
    if (type === 'weaver') {
        where = {
            buyer_id: {
                [Op.not]: null
            }
        };
    }
    const estimateAndProduction = await SpinSales.findAll({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.col('yarn_count')), 'totalQty'],
            [Sequelize.fn('SUM', Sequelize.col('qty_stock')), 'stockQty'],
            [Sequelize.col('program.id'), 'programId'],
            [Sequelize.col('program.program_name'), 'programName'],
        ],
        include: [
            {
                model: Program,
                as: 'program',
                attributes: [],
            },
        ],
        where,
        group: ['program.id']
    });

    return estimateAndProduction;
};

const getKnitterFabric = async (
    req: Request, res: Response
) => {
    try {
        const fabricList = await getKnitterFabricData();
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

const getKnitterFabricData = async (

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
        }
        ],
        group: ['program.id', 'dyingwashing.id']
    });

    return estimateAndProduction;
};

const getWeaverYarn = async (
    req: Request, res: Response
) => {
    try {
        const yarnList = await getSpinYarnData('weaver');
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
        const fabricList = await getWeaverFabricData();
        const data = getKnitterFabricRes(fabricList);
        return res.sendSuccess(res, data);
    } catch (error: any) {
        const code = error.errCode
            ? error.errCode
            : "ERR_INTERNAL_SERVER_ERROR";
        return res.sendError(res, code);
    }
};


const getWeaverFabricData = async (

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
        }
        ],
        group: ['program.id', 'dyingwashing.id']
    });

    return estimateAndProduction;
};

const getGarmentFabric = async (
    req: Request, res: Response
) => {
    try {
        const weaverList = await getWeaverSalesFabricData();
        const knitList = await getKnitSalesFabricData();
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

) => {
    const estimateAndProduction = await KnitSales.findAll({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.col('total_fabric_weight')), 'totalQty'],
            [Sequelize.fn('SUM', Sequelize.col('qty_stock')), 'stockQty'],
            [Sequelize.col('program.id'), 'programId'],
            [Sequelize.col('program.program_name'), 'programName'],
        ],
        include: [
            {
                model: Program,
                as: 'program',
                attributes: [],
            },
        ],
        group: ['program.id']
    });

    return estimateAndProduction;
};


const getWeaverSalesFabricData = async (

) => {
    const estimateAndProduction = await WeaverSales.findAll({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.col('total_fabric_length')), 'totalQty'],
            [Sequelize.fn('SUM', Sequelize.col('qty_stock')), 'stockQty'],
            [Sequelize.col('program.id'), 'programId'],
            [Sequelize.col('program.program_name'), 'programName'],
        ],
        include: [
            {
                model: Program,
                as: 'program',
                attributes: [],
            },
        ],
        group: ['program.id']
    });

    return estimateAndProduction;
};

const getGarmentInventory = async (
    req: Request, res: Response
) => {
    try {
        const fabricList = await getGarmentInventoryData();
        const data = getKnitterFabricRes(fabricList);
        return res.sendSuccess(res, data);
    } catch (error: any) {
        const code = error.errCode
            ? error.errCode
            : "ERR_INTERNAL_SERVER_ERROR";
        return res.sendError(res, code);
    }
};

const getGarmentInventoryData = async (

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
        }
        ],
        group: ['program.id', 'garment.id']
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
    getGarmentInventory
};