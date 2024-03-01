import { Request, Response } from "express";
import { Sequelize, Op, where } from "sequelize";
import { encrypt, generateOnlyQrCode } from "../../provider/qrcode";
import * as ExcelJS from "exceljs";
import * as fs from "fs";
import * as path from "path";
import Season from "../../models/season.model";
import Program from "../../models/program.model";
import Spinner from "../../models/spinner.model";
import sequelize from "../../util/dbConn";
import Dyeing from "../../models/dyeing.model";
import SpinSales from "../../models/spin-sales.model";
import WeaverSales from "../../models/weaver-sales.model";
import FabricType from "../../models/fabric-type.model";
import Garment from "../../models/garment.model";
import Weaver from "../../models/weaver.model";
import YarnSelection from "../../models/yarn-seletions.model";
import YarnCount from "../../models/yarn-count.model";
import Fabric from "../../models/fabric.model";
import WeaverProcess from "../../models/weaver-process.model";
import WeaverFabricSelection from "../../models/weaver-fabric-selection.model";
import SpinProcess from "../../models/spin-process.model";
import SpinProcessYarnSelection from "../../models/spin-process-yarn-seletions.model";
import { send_weaver_mail } from "../send-emails";
import WeaverFabric from "../../models/weaver_fabric.model";

const createWeaverProcess = async (req: Request, res: Response) =>{
    try {
        let dyeing
            if (req.body.dyeingRequired) {
                dyeing = await Dyeing.create({
                    processor_name: req.body.processorName,
                    dyeing_address: req.body.dyeingAddress,
                    process_name: req.body.processName,
                    yarn_delivered: req.body.yarnDelivered,
                    process_loss: req.body.processLoss,
                    net_yarn: req.body.processNetYarnQty,
                });
            }
    
            const data = {
                weaver_id: req.body.weaverId,
                program_id: req.body.programId,
                season_id: req.body.seasonId,
                date: req.body.date,
                garment_order_ref: req.body.garmentOrderRef,
                brand_order_ref: req.body.brandOrderRef,
                other_mix: req.body.blendChoosen,
                cottonmix_type: req.body.cottonmixType ? req.body.cottonmixType : null,
                cottonmix_qty: req.body.cottonmixQty ? req.body.cottonmixQty : null,
                blend_material: req.body.blendMaterial,
                blend_vendor: req.body.blendVendor,
                yarn_qty: req.body.yarnQty,
                additional_yarn_qty: req.body.additionalYarnQty,
                total_yarn_qty: req.body.totalYarnQty,
                fabric_type: req.body.fabricType,
                fabric_gsm: req.body.fabricGsm,
                fabric_length: req.body.fabricLength,
                batch_lot_no: req.body.batchLotNo,
                reel_lot_no: req.body.reelLotNo ? req.body.reelLotNo : null,
                job_details_garment: req.body.jobDetailsGarment,
                no_of_rolls: req.body.noOfRolls,
                dyeing_required: req.body.dyeingRequired,
                dyeing_id: dyeing ? dyeing.id : null,
                qty_stock: req.body.totalFabricLength,
                physical_traceablity: req.body.physicalTraceablity,
                total_fabric_length: req.body.totalFabricLength,
                blend_invoice: req.body.blendInvoice,
                blend_document: req.body.blendDocuments,
                status: 'Pending'
            };
    
            const weaver = await WeaverProcess.create(data);
            let uniqueFilename = `weaver_procees_qrcode_${Date.now()}.png`;
            let da = encrypt(`Weaver,Process,${weaver.id}`);
            let aa = await generateOnlyQrCode(da, uniqueFilename);
            const gin = await WeaverProcess.update({ qr: uniqueFilename }, {
                where: {
                    id: weaver.id
                }
            });

            for await (let fabric of req.body.fabrics) {
                let data = {
                  process_id: weaver.id,
                  fabric_type: fabric.fabricType,
                  fabric_gsm: fabric.fabricGsm,
                  fabric_length: fabric.fabricLength,
                  sold_status: false,
                };
                const fab = await WeaverFabric.create(data);
              }
    
            if (req.body.chooseYarn && req.body.chooseYarn.length > 0) {
                for await (let obj of req.body.chooseYarn) {
                    let val = await SpinSales.findOne({ where: { id: obj.id } });
                    if (val) {
                        let update = await SpinSales.update({ qty_stock: val.dataValues.qty_stock - obj.qtyUsed }, { where: { id: obj.id } });
                        await YarnSelection.create({ yarn_id: obj.id,type: obj.type, sales_id: weaver.id, qty_used: obj.qtyUsed })
                    }
                }
            }
            res.sendSuccess(res, { weaver });
        } catch (error: any) {
            console.log(error)
            return res.sendError(res, error.meessage);
        }
    }


//fetch Weaver process by id
const fetchWeaverProcessPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { weaverId, seasonId, programId, filter, lotNo, reelLotNo, noOfRolls, fabricType }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { garment_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
                { brand_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { blend_material: { [Op.iLike]: `%${searchTerm}%` } },
                { blend_vendor: { [Op.iLike]: `%${searchTerm}%` } },
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$yarncount.yarnCount_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$weaver.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$dyeing.processor_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$dyeing.process_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { job_details_garment: { [Op.iLike]: `%${searchTerm}%` } },
            ];
        }
        if (weaverId) {
            whereCondition.weaver_id = weaverId;
        }
        if (seasonId) {
            whereCondition.season_id = seasonId;
        }
        if (programId) {
            whereCondition.program_id = programId;
        }

        if (filter === 'Quantity') {
            whereCondition.qty_stock = { [Op.gt]: 0 }
        }

        if (lotNo) {
            const idArray: any[] = lotNo
                .split(",")
                .map((id: any) => id);
            whereCondition.batch_lot_no = { [Op.in]: idArray };
        }
        if (reelLotNo) {
            const idArray: any[] = reelLotNo
                .split(",")
                .map((id: any) => id);
            whereCondition.reel_lot_no = { [Op.in]: idArray };
        }
        if (noOfRolls) {
            const idArray: any[] = noOfRolls
                .split(",")
                .map((id: any) => id);
            whereCondition.no_of_rolls = { [Op.in]: idArray };
        }
        if (fabricType) {
            const idArray: any[] = fabricType
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.fabric_type = { [Op.overlap]: idArray };
        }

        let include = [
            {
                model: Weaver,
                as: "weaver",
                attributes: ['id', 'name', 'address']
            },
            {
                model: Season,
                as: "season",
                attributes: ['id', 'name']
            },
            {
                model: Program,
                as: "program",
                attributes: ['id', 'program_name']
            },
            {
                model: Dyeing,
                as: "dyeing",
            },
            {
                model: YarnCount,
                as: "yarncount",
                attributes: ['id', 'yarnCount_name']
            }
        ];
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await WeaverProcess.findAndCountAll({
                where: whereCondition,
                include: include,
                order: [
                    [
                        'id', 'desc'
                    ]
                ],
                offset: offset,
                limit: limit,
            });

            let data = [];

            for await (let row of rows) {
                const fabrictypes = await FabricType.findAll({
                    where: {
                        id: {
                            [Op.in]: row.dataValues.fabric_type,
                        },
                    },
                    attributes: ['id', 'fabricType_name']
                });
                data.push({
                    ...row.dataValues,
                    fabrictypes
                })
            }
            return res.sendPaginationSuccess(res, data, count);
        } else {
            const gin = await WeaverProcess.findAll({
                where: whereCondition,
                include: include,
                order: [
                    [
                        'id', 'desc'
                    ]
                ],
            });

            let data = [];

            for await (let row of gin) {
                const fabrictypes = await FabricType.findAll({
                    where: {
                        id: {
                            [Op.in]: row.dataValues.fabric_type,
                        },
                    },
                    attributes: ['id', 'fabricType_name']
                });
                data.push({
                    ...row.dataValues,
                    fabrictypes
                })
            }

            return res.sendSuccess(res, data);
        }
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

//create Weaver Sale
const createWeaverSales = async (req: Request, res: Response) => {
    try {
        const data = {
            weaver_id: req.body.weaverId,
            program_id: req.body.programId,
            season_id: req.body.seasonId,
            date: req.body.date,
            garment_order_ref: req.body.garmentOrderRef,
            brand_order_ref: req.body.brandOrderRef,
            buyer_type: req.body.buyerType,
            buyer_id: req.body.buyerId ? req.body.buyerId : null,
            fabric_id: req.body.fabricId ? req.body.fabricId : null,
            processor_name: req.body.processorName,
            processor_address: req.body.processorAddress,
            yarn_qty: req.body.totalYarnQty,
            total_yarn_qty: req.body.totalFabricLength,
            total_fabric_length: req.body.totalFabricLength,
            transaction_via_trader: req.body.transactionViaTrader,
            transaction_agent: req.body.transactionAgent,
            batch_lot_no: req.body.batchLotNo,
            invoice_no: req.body.invoiceNo,
            bill_of_ladding: req.body.billOfLadding,
            transporter_name: req.body.transporterName,
            vehicle_no: req.body.vehicleNo,
            tc_file: req.body.tcFiles,
            contract_file: req.body.contractFile,
            invoice_file: req.body.invoiceFile,
            delivery_notes: req.body.deliveryNotes,
            qty_stock: req.body.totalFabricLength,
            fabric_type: req.body.fabricType,
            no_of_rolls: req.body.noOfRolls,
            status: 'Pending for QR scanning'
        };
        const weaverSales = await WeaverSales.create(data);
        let uniqueFilename = `weaver_sales_qrcode_${Date.now()}.png`;
        let da = encrypt(`Weaver,Sale,${weaverSales.id}`);
        let aa = await generateOnlyQrCode(da, uniqueFilename);
        const gin = await WeaverSales.update({ qr: uniqueFilename }, {
            where: {
                id: weaverSales.id
            }
        });
        if (req.body.chooseFabric && req.body.chooseFabric.length > 0) {
            for await (let obj of req.body.chooseFabric) {
                let val = await WeaverProcess.findOne({ where: { id: obj.process_id } });
                if (val) {
                    let update = await WeaverProcess.update({ 
                        qty_stock: val.dataValues.qty_stock - obj.qtyUsed }, { where: { id: obj.process_id } });
                        let updatee = await WeaverFabric.update(
                            { sold_status: true },
                            { where: { id: obj.id } }
                          );
                    await WeaverFabricSelection.create({ 
                        weaver_fabric :obj.id,
                        fabric_id: obj.process_id, 
                        type: obj.type, 
                        sales_id: weaverSales.id, 
                        qty_used: obj.qtyUsed 
                    })
                }
            }
        }

        if(weaverSales){
            await send_weaver_mail(weaverSales.id);
        }
        return res.sendSuccess(res, { weaverSales });
    } catch (error: any) {
        console.error(error)
        return res.sendError(res, error.meessage);
    }
}

//fetch Weaver Sales with filters
const fetchWeaverSalesPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { weaverId, seasonId, programId }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
                { garment_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
                { brand_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$weaver.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
                { '$dyingwashing.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$buyer.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { vehicle_no: { [Op.iLike]: `%${searchTerm}%` } },
                { transaction_agent: { [Op.iLike]: `%${searchTerm}%` } },
                { transporter_name: { [Op.iLike]: `%${searchTerm}%` } },
                { bill_of_ladding: { [Op.iLike]: `%${searchTerm}%` } },
                { processor_name: { [Op.iLike]: `%${searchTerm}%` } },
                { processor_address: { [Op.iLike]: `%${searchTerm}%` } },
            ];
        }
        if (weaverId) {
            whereCondition.weaver_id = weaverId;
        }
        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.season_id = { [Op.in]: idArray };
        }

        if (programId) {
            const idArray: number[] = programId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.program_id = { [Op.in]: idArray };
        }


        let include = [
            {
                model: Weaver,
                as: "weaver",
                attributes: ['id', 'name', 'address']
            },
            {
                model: Season,
                as: "season",
                attributes: ['id', 'name']
            },
            {
                model: Program,
                as: "program",
                attributes: ['id', 'program_name']
            },
            {
                model: Garment,
                as: "buyer",
                attributes: ['id', 'name', 'address']
            },
            {
                model: Fabric,
                as: "dyingwashing",
                attributes: ['id', 'name', 'address']
            }
        ];
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await WeaverSales.findAndCountAll({
                where: whereCondition,
                include: include,
                order: [
                    [
                        'id', 'desc'
                    ]
                ],
                offset: offset,
                limit: limit,
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const gin = await WeaverSales.findAll({
                where: whereCondition,
                include: include,
                order: [
                    [
                        'id', 'desc'
                    ]
                ],
            });
            return res.sendSuccess(res, gin);
        }
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

//fetch knitter Sale by id
const fetchFabricReelLotNo = async (req: Request, res: Response) => {
    const { weaverId } = req.query;
    const whereCondition: any = {};
    try {
        if (!weaverId) {
            return res.sendError(res, "need weaverId id");
        }
        whereCondition.id = weaverId;

        const rows = await Weaver.findOne({
            where: whereCondition,
            attributes: ['id', 'name', 'short_name']
        });

        let count = await WeaverProcess.count({
            include: [
                {
                    model: Program,
                    as: 'program',
                    where: { program_name: { [Op.iLike]: 'Reel' } }
                }
            ],
            where: {
                weaver_id: weaverId
            }
        })

        let prcs_date = new Date().toLocaleDateString().replace(/\//g, '');
        let number = count + 1;
        let prcs_name = rows ? rows?.name.substring(0,3).toUpperCase() : '';

        let reelLotNo = "REEL-WEA-" + prcs_name + "-" + prcs_date + number;

        return res.sendSuccess(res, {reelLotNo})

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const exportWeaverSale = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "weaver-sale.xlsx");
    const { weaverId, seasonId, programId }: any = req.query;
    try {
        if (!weaverId) {
            return res.sendError(res, "Need weaver Id")
        }
        const whereCondition: any = {};
        const searchTerm = req.query.search || "";
        if (searchTerm) {
            whereCondition[Op.or] = [
                { garment_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
                { brand_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$weaver.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } },
                { '$dyingwashing.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$buyer.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { vehicle_no: { [Op.iLike]: `%${searchTerm}%` } },
                { transaction_agent: { [Op.iLike]: `%${searchTerm}%` } },
                { transporter_name: { [Op.iLike]: `%${searchTerm}%` } },
                { bill_of_ladding: { [Op.iLike]: `%${searchTerm}%` } },
                { processor_name: { [Op.iLike]: `%${searchTerm}%` } },
                { processor_address: { [Op.iLike]: `%${searchTerm}%` } },
            ];
        }

        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.season_id = { [Op.in]: idArray };
        }

        if (programId) {
            const idArray: number[] = programId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.program_id = { [Op.in]: idArray };
        }
        whereCondition.weaver_id = req.query.weaverId
        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:N1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Sale';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Season", "Sold To", "Program", "Garment Order Reference", "Brand Order Reference",
            "Invoice No", "Batch Lot No","Quanitity in Mts",
            "Vehicle No", "Transcation via trader", "Agent Details"
        ]);
        headerRow.font = { bold: true };
        let include = [
            {
                model: Weaver,
                as: "weaver",
                attributes: ['id', 'name', 'address']
            },
            {
                model: Season,
                as: "season",
                attributes: ['id', 'name']
            },
            {
                model: Program,
                as: "program",
                attributes: ['id', 'program_name']
            },
            {
                model: Garment,
                as: "buyer",
                attributes: ['id', 'name', 'address']
            },
            {
                model: Fabric,
                as: "dyingwashing",
                attributes: ['id', 'name', 'address']
            }
        ];;
        // const weaver = await WeaverSales.findAll({
        //     attributes: [
        //         [Sequelize.col('date'), 'date'],
        //         [Sequelize.col('"season"."name"'), 'seasons'],
        //         [Sequelize.col('"buyer"."name"'), 'buyers'],
        //         [Sequelize.col('garment_order_ref'), 'garment_order_ref'],
        //         [Sequelize.col('brand_order_ref'), 'brand_order_ref'],
        //         [Sequelize.col('invoice_no'), 'invoice_no'],
        //         [Sequelize.col('batch_lot_no'), 'batch_lot_no'],
        //         [Sequelize.col('bale_ids'), 'bale_ids'],
        //         [Sequelize.col('"fabric"."fabricType_name"'), 'fabrics'],
        //         [Sequelize.col('fabric_contruction'), 'fabric_contruction'],
        //         [Sequelize.col('fabric_length'), 'length'],
        //         [Sequelize.col('fabric_gsm'), 'fabric_gsm'],
        //         [Sequelize.col('fabric_weight'), 'fabric_weight'],
        //         [Sequelize.col('fabric_weight'), 'fabric_weight'],
        //         [Sequelize.col('transaction_via_trader'), 'transaction_via_trader'],
        //     ],
        //     where: whereCondition,
        //     include: include
        // });


        const weaver = await WeaverSales.findAll({
            where: whereCondition,
            include: include,
            order: [
                [
                    'id', 'desc'
                ]
            ]
        });

        // Append data to worksheet
        for await (const [index, item] of weaver.entries()) {

            const rowValues = Object.values({
                index: index + 1,
                date: item.date ? item.date : '',
                season: item.season ? item.season.name : '',
                buyer_id: item.buyer ? item.buyer.name : item.dyingwashing ? item.dyingwashing.name : item.processor_name,
                program: item.program ? item.program.program_name : '',
                garment_order_ref: item.garment_order_ref ? item.garment_order_ref : '',
                brand_order_ref: item.brand_order_ref ? item.brand_order_ref: '',
                invoice: item.invoice_no ? item.invoice_no : '',
                lotNo: item.batch_lot_no ? item.batch_lot_no : '',
                total: item.total_yarn_qty,
                vichle: item.vehicle_no ? item.vehicle_no : '',
                transaction_via_trader: item.transaction_via_trader ? 'Yes' : 'No',
                agent: item.transaction_agent ? item.transaction_agent : ''
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
            data: process.env.BASE_URL + "weaver-sale.xlsx",
        });
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);

    }
};


const exportWeaverProcess = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "weaver-process.xlsx");
    const { weaverId, seasonId, programId }: any = req.query;
    try {
        if (!weaverId) {
            return res.sendError(res, "Need weaver Id")
        }
        const whereCondition: any = {};
        const searchTerm = req.query.search || "";
        if (searchTerm) {
            whereCondition[Op.or] = [
                { garment_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
                { brand_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { blend_material: { [Op.iLike]: `%${searchTerm}%` } },
                { blend_vendor: { [Op.iLike]: `%${searchTerm}%` } },
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$yarncount.yarnCount_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$weaver.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$dyeing.processor_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$dyeing.process_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { job_details_garment: { [Op.iLike]: `%${searchTerm}%` } },
            ];
        }

        if (seasonId) {
            const idArray: number[] = seasonId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.season_id = { [Op.in]: idArray };
        }

        if (programId) {
            const idArray: number[] = programId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.program_id = { [Op.in]: idArray };
        }
        whereCondition.weaver_id = req.query.weaverId
        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:N1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Process';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Season","Finished Batch Lot No", "Fabric Reel Lot No", "Garment Order Reference", "Brand Order Reference", "Program",
        "Job Details from garment", "Knit Fabric Type", "Fabric Length in Mts","Fabric GSM","Total Finished Fabric Length in Mts", "Total Yarn Utilized"
        ]);
        headerRow.font = { bold: true };
        let include = [
            {
                model: Weaver,
                as: "weaver",
                attributes: ['id', 'name', 'address']
            },
            {
                model: Season,
                as: "season",
                attributes: ['id', 'name']
            },
            {
                model: Program,
                as: "program",
                attributes: ['id', 'program_name']
            },
            {
                model: Dyeing,
                as: "dyeing",
            },
            {
                model: YarnCount,
                as: "yarncount",
                attributes: ['id', 'yarnCount_name']
            }
        ];;


        const weaver = await WeaverProcess.findAll({
            where: whereCondition,
            include: include,
            order: [
                [
                    'id', 'desc'
                ]
            ]
        });

        // Append data to worksheet
        for await (const [index, item] of weaver.entries()) {
            let fabricType: string = "";
            let fabricGSM: string = "";
            let fabricLength: string = "";

            if (item.fabric_type && item.fabric_type.length > 0) {
                let type = await FabricType.findAll({ where: { id: { [Op.in]: item.fabric_type } } });
                for (let i of type) {
                    fabricType += `${i.fabricType_name},`
                }
            }

            fabricGSM = item?.fabric_gsm?.length > 0 ? item?.fabric_gsm.join(",") : "";
            fabricLength = item?.fabric_length?.length > 0 ? item?.fabric_length.join(",") : "";

            const rowValues = Object.values({
                index: index + 1,
                date: item.date ? item.date : '',
                season: item.season ? item.season.name : '',
                lotNo: item.batch_lot_no ? item.batch_lot_no : '',
                reelLotNo: item.reel_lot_no ? item.reel_lot_no : '',
                garment_order_ref: item.garment_order_ref ? item.garment_order_ref : '',
                brand_order_ref: item.brand_order_ref ? item.brand_order_ref: '',
                program: item.program ? item.program.program_name : '',
                jobDetails: item.job_details_garment ? item.job_details_garment : '',
                fabricType: fabricType,
                fabricLength: fabricLength,
                fabricGSM: fabricGSM,
                totalLength: item.total_fabric_length,
                totalYarn: item.total_yarn_qty,
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
            data: process.env.BASE_URL + "weaver-process.xlsx",
        });
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);

    }
};

const deleteWeaverSales = async (req: Request, res: Response) => {
    try {
        if (!req.body.id) {
            return res.sendError(res, 'Need Sales Id');
        }
        let yarn_selections = await YarnSelection.findAll({
            where: {
                sales_id: req.body.id
            }
        })
        yarn_selections.forEach((yarn: any) => {
            SpinSales.update(
                {
                    qty_stock: sequelize.literal(`qty_stock + ${yarn.qty_used}`)
                },
                {
                    where: {
                        id: yarn.yarn_id
                    }
                }
            );
        });

        WeaverSales.destroy({
            where: {
                id: req.body.id
            }
        });

        YarnSelection.destroy({
            where: {
                sales_id: req.body.id
            }
        });
        return res.sendSuccess(res, { message: 'Successfully deleted this process' });

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

const getWeaverDyeing = async (req: Request, res: Response) => {
    try {
        if (!req.query.id) {
            return res.sendError(res, 'Need Id');
        }

        let id = req.query.id;
        let weaver = await Dyeing.findOne({ where: { id: id } });


        res.sendSuccess(res, weaver);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

//fetch knitter Sale by id
const fetchWeaverSale = async (req: Request, res: Response) => {
    const { salesId } = req.query;
    const whereCondition: any = {};
    try {
        if (!salesId) {
            return res.sendError(res, "need sales id");
        }
        whereCondition.id = salesId;


        let include = [
            {
                model: Weaver,
                as: "weaver",
                attributes: ['id', 'name', 'address']
            },
            {
                model: Season,
                as: "season",
                attributes: ['id', 'name']
            },
            {
                model: Program,
                as: "program",
                attributes: ['id', 'program_name']
            },
            {
                model: Garment,
                as: "buyer",
                attributes: ['id', 'name', 'address']
            },
            {
                model: Fabric,
                as: "dyingwashing",
                attributes: ['id', 'name', 'address']
            }
        ];
        //fetch data with pagination
        const rows = await WeaverSales.findOne({
            where: whereCondition,
            include: include
        });
        return res.sendSuccess(res, rows);

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

//fetch Weaver transaction with filters
const fetchWeaverDashBoard = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { weaverId, status, filter, programId, spinnerId, invoice, lotNo, yarnCount, yarnType, reelLotNo }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (!weaverId) {
            return res.sendError(res, 'Need Weaver Id ');
        }
        if (!status) {
            return res.sendError(res, 'Need  status');
        }
        if (searchTerm) {
            whereCondition[Op.or] = [
                { order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by batch lot number
                { reel_lot_no: { [Op.iLike]: `%${searchTerm}%` } }, // Search by batch lot number
                { box_ids: { [Op.iLike]: `%${searchTerm}%` } }, // Search by batch lot number
                { batch_lot_no: { [Op.iLike]: `%${searchTerm}%` } }, // Search by batch lot number
                { invoice_no: { [Op.iLike]: `%${searchTerm}%` } }, // Search by invoice number
                { yarn_type: { [Op.iLike]: `%${searchTerm}%` } }, // Search by invoice number
                { vehicle_no: { [Op.iLike]: `%${searchTerm}%` } }, // Search by invoice number
                { '$program.program_name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search by program
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } }, // Search season name  
                { '$spinner.name$': { [Op.iLike]: `%${searchTerm}%` } },// Search season spinner name  
                { '$yarncount.yarnCount_name$': { [Op.iLike]: `%${searchTerm}%` } },// Search season spinner name  
            ];
        }
        if (status === 'Pending' ) {
            whereCondition.buyer_id = weaverId
            whereCondition.status = { [Op.in]: [ 'Pending' , 'Pending for QR scanning'] }
        } 
        if(status === 'Sold') {
            whereCondition.buyer_id = weaverId
            whereCondition.status = 'Sold';
        }
       
        if (spinnerId) {
            const idArray: number[] = spinnerId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.spinner_id = { [Op.in]: idArray };
        }
        if (filter === 'Quantity') {
            whereCondition.qty_stock = { [Op.gt]: 0 }
        }
        if (programId) {
            const idArray: number[] = programId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.program_id = { [Op.in]: idArray };
        }

        if (invoice) {
            const idArray: any[] = invoice
                .split(",")
                .map((id: any) => id);
            whereCondition.invoice_no = { [Op.in]: idArray };
        }
        if (lotNo) {
            const idArray: any[] = lotNo
                .split(",")
                .map((id: any) => id);
            whereCondition.batch_lot_no = { [Op.in]: idArray };
        }
        if (reelLotNo) {
            const filterValues: any[] = reelLotNo
              .split(",")
              .map((value: any) => value.trim());

            whereCondition[Op.or]= filterValues.map((value) => ({
                reel_lot_no: {[Op.iLike]: `%${value}%`}}))
        }
        if (yarnCount) {
            const idArray: number[] = yarnCount
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.yarn_count = { [Op.in]: idArray };
        }
        if (yarnType) {
            const idArray: any[] = yarnType
                .split(",")
                .map((id: any) => id);
            whereCondition.yarn_type = { [Op.in]: idArray };
        }

        let include = [
            {
                model: Spinner,
                as: "spinner",
            },
            {
                model: Season,
                as: "season",
            },
            {
                model: Program,
                as: "program",
            },
            {
                model: YarnCount,
                as: 'yarncount',
                attributes: ['id', 'yarnCount_name']
            },
        ];
        //fetch data with pagination
        if (req.query.pagination === "true") {
            const { count, rows } = await SpinSales.findAndCountAll({
                where: whereCondition,
                include: include,
                order: [
                    [
                        'id', 'asc'
                    ]
                ],
                offset: offset,
                limit: limit,
            });
            return res.sendPaginationSuccess(res, rows, count);
        } else {
            const gin = await SpinSales.findAll({
                where: whereCondition,
                include: include,
                order: [
                    [
                        'id', 'asc'
                    ]
                ]
            });
            return res.sendSuccess(res, gin);
        }
    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.message);
    }
};

//update Weaver transactions to accept and reject
const updateStatusWeaverSale = async (req: Request, res: Response) => {
    try {
        let update = []
        for (const obj of req.body.items) {
            const data = {
                status: obj.status,
                accept_date: obj.status === 'Sold' ? new Date().toISOString() : null
            };
            let result = await SpinSales.update(data, { where: { id: obj.id } });
            update.push(result);
        }

        res.sendSuccess(res, { update });
    } catch (error: any) {
        return res.sendError(res, error.meessage);
    }
}


const countCottonBaleWithProgram = async (req: Request, res: Response) => {
    try {
        if (!req.query.weaverId) {
            return res.sendError(res, 'Need Weaver Id');
        }
        let result = await Weaver.findOne({ where: { id: req.query.weaverId } });
        let program = await Program.findAll({
            where: {
                id: result.program_id
            },
            attributes: ['id', 'program_name']
        });
        let resulting: any = [];
        for await (let obj of program) {
            let whereCondition: any = {}
            whereCondition.buyer_id = req.query.weaverId;
            whereCondition.status = 'Sold';
            const weaver = await SpinSales.findOne({
                where: { ...whereCondition, program_id: obj.id },
                attributes: [
                    [
                        Sequelize.fn("SUM", Sequelize.col("total_qty")),
                        "totalQuantity",
                    ],
                    [
                        Sequelize.fn(
                            "SUM",
                            Sequelize.col("qty_stock")
                        ),
                        "totalQuantityStock",
                    ],
                ],
                group: ["program_id"],
            });

            let data = await WeaverSales.findAll({
                where: {
                    weaver_id: req.query.weaverId,
                    program_id: obj.id
                },
                attributes: [
                    [
                        Sequelize.fn("SUM", Sequelize.col("fabric_length")),
                        "total"
                    ]
                ],
                include: [
                    {
                        model: FabricType,
                        as: "fabric",
                        attributes: ["id", "fabricType_name"],
                    },
                    {
                        model: Program,
                        as: "program",
                        attributes: [],
                    }
                ],
                group: ["fabric.id", "program_id"],
            });
            resulting.push({ program: obj, fabric: data, quantity: weaver })
        }
        res.sendSuccess(res, resulting);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const getWeaverProgram = async (req: Request, res: Response) => {
    try {
        if (!req.query.weaverId) {
            return res.sendError(res, 'Need Weaver Id');
        }

        let weaverId = req.query.weaverId;
        let weaver = await Weaver.findOne({ where: { id: weaverId } });

        let data = await Program.findAll({
            where: {
                id: { [Op.in]: weaver.program_id }
            }
        });
        res.sendSuccess(res, data);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const getSpinnerTransaction = async (req: Request, res: Response) => {
    const { weaverId, status, filter, programId, spinnerId }: any = req.query;
    const whereCondition: any = {};
    try {
        if (!weaverId) {
            return res.sendError(res, 'Need Knitter Id ');
        }
        if (!status) {
            return res.sendError(res, 'Need  status');
        }

        if (status === 'Pending' ) {
            whereCondition.buyer_id = weaverId
            whereCondition.status = { [Op.in]: [ 'Pending' , 'Pending for QR scanning'] }
        } 
        if(status === 'Sold') {
            whereCondition.buyer_id = weaverId
            whereCondition.status = 'Sold';
        }

        if (filter === 'Quantity') {
            whereCondition.qty_stock = { [Op.gt]: 0 }
        }
        const spinner = await SpinSales.findAll({
            attributes: ['spinner_id', 'spinner.name'],
            where: whereCondition,
            include: [
                {
                    model: Spinner,
                    as: 'spinner',
                    attributes: ['id', 'name']
                }
            ],
            group: ['spinner_id', "spinner.id"]
        });

        res.sendSuccess(res, spinner);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const getInvoiceAndyarnType = async (req: Request, res: Response) => {
    const { weaverId, status, spinnerId, filter }: any = req.query;
    const whereCondition: any = {};
    try {
        if (!weaverId) {
            return res.sendError(res, 'Need Weaver Id ');
        }
        if (!status) {
            return res.sendError(res, 'Need  status');
        }

        if (status === 'Pending' ) {
            whereCondition.buyer_id = weaverId
            whereCondition.status = { [Op.in]: [ 'Pending' , 'Pending for QR scanning'] }
        } 
        
        if(status === 'Sold') {
            whereCondition.buyer_id = weaverId
            whereCondition.status = 'Sold';
        }

        if (filter === 'Quantity') {
            whereCondition.qty_stock = { [Op.gt]: 0 }
        }
        if (spinnerId) {
            const idArray: number[] = spinnerId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.spinner_id = { [Op.in]: idArray };
        }

        const invoice = await SpinSales.findAll({
            attributes: ['invoice_no', 'batch_lot_no'],
            where: whereCondition,
            group: ['invoice_no', 'batch_lot_no']
        });
        // const reelLot = await SpinSales.findAll({
        //     attributes: ['reel_lot_no'],
        //     where: { ...whereCondition, reel_lot_no: { [Op.not]: null } },
        //     group: ['reel_lot_no']
        // });
        const ids = await SpinSales.findAll({
            attributes: ['id'],
            where: { ...whereCondition, reel_lot_no: { [Op.not]: null } },
        });

        let salesId=ids.map((item: any) => item.dataValues.id)

        let reelLot = await SpinProcessYarnSelection.findAll({
            attributes: [[Sequelize.col('process.reel_lot_no'),'reel_lot_no']],
            where: {sales_id: {[Op.in]:salesId}},
            include:[
                {
                    model: SpinProcess,
                    as: 'process',
                    where :{reel_lot_no : {[Op.not]: null}},
                    attributes: []
                }
            ],
            group: ['process.reel_lot_no']
        });

        const yarncount = await SpinSales.findAll({
            attributes: ['yarn_count'],
            where: whereCondition,
            include: [
                {
                    model: YarnCount,
                    as: 'yarncount',
                    attributes: ['id', 'yarnCount_name']
                }
            ],
            group: ['yarn_count', 'yarncount.id']
        });
        const yarn_type = await SpinSales.findAll({
            attributes: ['yarn_type'],
            where: whereCondition,
            group: ['yarn_type']
        });
        res.sendSuccess(res, { invoice,reelLot, yarn_type, yarncount });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const getChooseFabricFilters = async (req: Request, res: Response) => {
    const { weaverId, programId }: any = req.query;
    const whereCondition: any = {};
    try {
        if (!weaverId) {
            return res.sendError(res, 'Need Weaver Id ');
        }

        if (weaverId) {
            whereCondition.weaver_id = weaverId;
        }
        if (programId) {
            const idArray: number[] = programId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.program_id = { [Op.in]: idArray };
        }
        whereCondition.qty_stock = { [Op.gt]: 0 }
        
        const batchLotNo = await WeaverProcess.findAll({
            attributes: ['batch_lot_no'],
            where: whereCondition,
            group: ['batch_lot_no']
        });
        const reelLot = await WeaverProcess.findAll({
            attributes: ['reel_lot_no'],
            where: { ...whereCondition, reel_lot_no: { [Op.not]: null } },
            group: ['reel_lot_no']
        });
        const noOfRolls = await WeaverProcess.findAll({
            attributes: ['no_of_rolls'],
            where: whereCondition,
            group: ['no_of_rolls']
        });

        res.sendSuccess(res, { batchLotNo,reelLot, noOfRolls });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const getGarments = async (req: Request, res: Response) => {
    let weaverId = req.query.weaverId;
    if (!weaverId) {
        return res.sendError(res, 'Need Weaver Id ');
    }
    let weaver = await Weaver.findOne({ where: { id: weaverId } });
    if (!weaver) {
        return res.sendError(res, 'No Weaver Found ');
    }
    let garment = await Garment.findAll({
        attributes: ['id', 'name'],
        where: { brand: { [Op.overlap]: weaver.dataValues.brand } }
    })
    res.sendSuccess(res, garment);
}

const getFabrics = async (req: Request, res: Response) => {
    let weaverId = req.query.weaverId;
    if (!weaverId) {
        return res.sendError(res, 'Need Weaver Id ');
    }
    let weaver = await Weaver.findOne({ where: { id: weaverId } });
    if (!weaver) {
        return res.sendError(res, 'No Weaver Found ');
    }

    let fabric = await Fabric.findAll({
        attributes: ['id', 'name'],
        where: { brand: { [Op.overlap]: weaver.dataValues.brand }, fabric_processor_type: { [Op.overlap]: [req.query.type] } }
    })
    res.sendSuccess(res, fabric);
}

const chooseWeaverFabric = async (req: Request, res: Response) => {
    const { weaverId, programId, lotNo, reelLotNo, noOfRolls, fabricType }: any =
      req.query;
  
    const whereCondition: any = {};
    try {
      if (weaverId) {
        whereCondition.weaver_id = weaverId;
      }
  
      if (programId) {
        whereCondition.program_id = programId;
      }
      if (lotNo) {
        const idArray: any[] = lotNo.split(",").map((id: any) => id);
        whereCondition.batch_lot_no = { [Op.in]: idArray };
      }
      if (reelLotNo) {
        const idArray: any[] = reelLotNo.split(",").map((id: any) => id);
        whereCondition.reel_lot_no = { [Op.in]: idArray };
      }
      if (noOfRolls) {
        const idArray: any[] = noOfRolls.split(",").map((id: any) => id);
        whereCondition.no_of_rolls = { [Op.in]: idArray };
      }
      if (fabricType) {
        const idArray: any[] = fabricType
          .split(",")
          .map((id: any) => parseInt(id, 10));
        whereCondition.fabric_type = { [Op.overlap]: idArray };
      }
  
      let include = [
        {
          model: Weaver,
          as: "weaver",
          attributes: ["id", "name"],
        },
        {
          model: Program,
          as: "program",
          attributes: ["id", "program_name"],
        },
        // {
        //     model: YarnCount,
        //     as: "yarncount",
        //     attributes: ['id', 'yarnCount_name']
        // }
      ];
      whereCondition.qty_stock = { [Op.gt]: 0 };
      //fetch data with pagination
  
      const process = await WeaverProcess.findAll({
        where: whereCondition,
        include: include,
        order: [["id", "desc"]],
      });
  
      let data = [];
  
      for await (let row of process) {
        let list = [];
  
        if (row) {
          list = await WeaverFabric.findAll({
            where: { process_id: row.dataValues?.id,sold_status: false },
            include: [
              {
                model: FabricType,
                as: "fabric"
              },
            ]
          });
        }
  
        data.push({
          ...row.dataValues,
          fabrics: list,
        });
      }
  
      return res.sendSuccess(res, data);
    } catch (error: any) {
      return res.sendError(res, error.message);
    }
  };
  

export {
    createWeaverProcess,
    fetchWeaverProcessPagination,
    exportWeaverProcess,
    createWeaverSales,
    fetchWeaverSalesPagination,
    fetchWeaverDashBoard,
    updateStatusWeaverSale,
    countCottonBaleWithProgram,
    exportWeaverSale,
    getWeaverProgram,
    getSpinnerTransaction,
    getInvoiceAndyarnType,
    deleteWeaverSales,
    getWeaverDyeing,
    getGarments,
    getFabrics,
    fetchFabricReelLotNo,
    getChooseFabricFilters,
    fetchWeaverSale,
    chooseWeaverFabric
}