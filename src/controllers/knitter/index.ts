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
import KnitSales from "../../models/knit-sales.model";
import FabricType from "../../models/fabric-type.model";
import Garment from "../../models/garment.model";
import Knitter from "../../models/knitter.model";
import YarnCount from "../../models/yarn-count.model";
import KnitYarnSelection from "../../models/knit-yarn-seletions.model";
import Fabric from "../../models/fabric.model";
import KnitProcess from "../../models/knit-process.model";
import KnitFabricSelection from "../../models/knit-fabric-selectiion.model";
import SpinProcessYarnSelection from "../../models/spin-process-yarn-seletions.model";
import SpinProcess from "../../models/spin-process.model";
import { send_knitter_mail } from "../send-emails";

const createKnitterProcess = async (req: Request, res: Response) =>{
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
            knitter_id: req.body.knitterId,
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
            fabric_weight: req.body.fabricWeight,
            batch_lot_no: req.body.batchLotNo,
            reel_lot_no: req.body.reelLotNo ? req.body.reelLotNo : null,
            job_details_garment: req.body.jobDetailsGarment,
            no_of_rolls: req.body.noOfRolls,
            dyeing_required: req.body.dyeingRequired,
            dyeing_id: dyeing ? dyeing.id : null,
            qty_stock: req.body.totalFabricWeight,
            physical_traceablity: req.body.physicalTraceablity,
            total_fabric_weight: req.body.totalFabricWeight,
            blend_invoice: req.body.blendInvoice,
            blend_document: req.body.blendDocuments,
            status: 'Pending'
        };

        const knit = await KnitProcess.create(data);
        let uniqueFilename = `knit_procees_qrcode_${Date.now()}.png`;
        let da = encrypt(`Knitter,Process,${knit.id}`);
        let aa = await generateOnlyQrCode(da, uniqueFilename);
        const gin = await KnitProcess.update({ qr: uniqueFilename }, {
            where: {
                id: knit.id
            }
        });

        if (req.body.chooseYarn && req.body.chooseYarn.length > 0) {
            for await (let obj of req.body.chooseYarn) {
                let val = await SpinSales.findOne({ where: { id: obj.id } });
                if (val) {
                    let update = await SpinSales.update({ qty_stock: val.dataValues.qty_stock - obj.qtyUsed }, { where: { id: obj.id } });
                    await KnitYarnSelection.create({ yarn_id: obj.id, sales_id: knit.id, qty_used: obj.qtyUsed })
                }
            }
        }
        res.sendSuccess(res, { knit });
    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.meessage);
    }
}

//fetch knitter process by id
const fetchKnitterProcessPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { knitterId, seasonId, programId, filter, lotNo, reelLotNo, noOfRolls, fabricType }: any = req.query;
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
                { '$knitter.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$dyeing.processor_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$dyeing.process_name$': { [Op.iLike]: `%${searchTerm}%` } },
                { job_details_garment: { [Op.iLike]: `%${searchTerm}%` } },
            ];
        }
        if (knitterId) {
            whereCondition.knitter_id = knitterId;
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
                model: Knitter,
                as: "knitter",
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
            const { count, rows } = await KnitProcess.findAndCountAll({
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
            const gin = await KnitProcess.findAll({
                where: whereCondition,
                include: include,
                order: [
                    [
                        'id', 'asc'
                    ]
                ]
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

//create knitter Sale
const createKnitterrSales = async (req: Request, res: Response) => {
    try {
        const data = {
            knitter_id: req.body.knitterId,
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
            total_yarn_qty: req.body.totalFabricWeight,
            total_fabric_weight: req.body.totalFabricWeight,
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
            qty_stock: req.body.totalFabricWeight,
            fabric_type: req.body.fabricType,
            no_of_rolls: req.body.noOfRolls,
            status: 'Pending for QR scanning'
        };
        const kniSale = await KnitSales.create(data);
        let uniqueFilename = `knitter_sales_qrcode_${Date.now()}.png`;
        let da = encrypt(`Knitter,Sale,${kniSale.id}`);
        let aa = await generateOnlyQrCode(da, uniqueFilename);
        const gin = await KnitSales.update({ qr: uniqueFilename }, {
            where: {
                id: kniSale.id
            }
        });
        if (req.body.chooseFabric && req.body.chooseFabric.length > 0) {
            for await (let obj of req.body.chooseFabric) {
                let val = await KnitProcess.findOne({ where: { id: obj.id } });
                if (val) {
                    let update = await KnitProcess.update({ qty_stock: val.dataValues.qty_stock - obj.qtyUsed }, { where: { id: obj.id } });
                    await KnitFabricSelection.create({ fabric_id: obj.id, sales_id: kniSale.id, qty_used: obj.qtyUsed })
                }
            }
        }

        if(kniSale){
            await send_knitter_mail(kniSale.id);
        }

        return res.sendSuccess(res,  kniSale );
    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.meessage);
    }
}

const deleteKnitterSales = async (req: Request, res: Response) => {
    try {
        if (!req.body.id) {
            return res.sendError(res, 'Need Sales Id');
        }
        let yarn_selections = await KnitYarnSelection.findAll({
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

        KnitSales.destroy({
            where: {
                id: req.body.id
            }
        });

        KnitYarnSelection.destroy({
            where: {
                sales_id: req.body.id
            }
        });
        return res.sendSuccess(res, { message: 'Successfully deleted this process' });

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

//fetch knitter Sales with filters
const fetchKnitterSalesPagination = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { knitterId, seasonId, programId } = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (searchTerm) {
            whereCondition[Op.or] = [
// Search by order ref
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$knitter.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { garment_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
                { brand_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
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
        if (knitterId) {
            whereCondition.knitter_id = knitterId;
        }
        if (seasonId) {
            whereCondition.season_id = seasonId;
        }
        if (programId) {
            whereCondition.program_id = programId;
        }

        let include = [
            {
                model: Knitter,
                as: "knitter",
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
            const { count, rows } = await KnitSales.findAndCountAll({
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
            const gin = await KnitSales.findAll({
                where: whereCondition,
                include: include,
                order: [
                    [
                        'id', 'desc'
                    ]
                ]
            });
            return res.sendSuccess(res, gin);
        }
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

//fetch knitter Sale by id
const fetchKnitterSale = async (req: Request, res: Response) => {
    const { salesId } = req.query;
    const whereCondition: any = {};
    try {
        if (!salesId) {
            return res.sendError(res, "need sales id");
        }
        whereCondition.id = salesId;


        let include = [
            {
                model: Knitter,
                as: "knitter",
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
        const rows = await KnitSales.findOne({
            where: whereCondition,
            include: include
        });
        return res.sendSuccess(res, rows);

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

//fetch fabric reel lot no
const fetchFabricReelLotNo = async (req: Request, res: Response) => {
    const { knitterId } = req.query;
    const whereCondition: any = {};
    try {
        if (!knitterId) {
            return res.sendError(res, "need knitterId id");
        }
        whereCondition.id = knitterId;

        const rows = await Knitter.findOne({
            where: whereCondition,
            attributes: ['id', 'name', 'short_name']
        });

        let count = await KnitProcess.count({
            include: [
                {
                    model: Program,
                    as: 'program',
                    where: { program_name: { [Op.iLike]: 'Reel' } }
                }
            ],
            where: {
                knitter_id: knitterId
            }
        })

        let prcs_date = new Date().toLocaleDateString().replace(/\//g, '');
        let number = count + 1;
        let prcs_name = rows ? rows?.name.substring(0,3).toUpperCase() : '';

        let reelLotNo = "REEL-KNI-" + prcs_name + "-" + prcs_date + number;

        return res.sendSuccess(res, {reelLotNo})

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const exportKnitterSale = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "knitter-sale.xlsx");

    try {
        const whereCondition: any = {};
        const searchTerm = req.query.search || "";
        if (searchTerm) {
            whereCondition[Op.or] = [
                { garment_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
                { brand_order_ref: { [Op.iLike]: `%${searchTerm}%` } }, // Search by order ref
                { '$season.name$': { [Op.iLike]: `%${searchTerm}%` } },
                { '$knitter.name$': { [Op.iLike]: `%${searchTerm}%` } },
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
        whereCondition.knitter_id = req.query.knitterId
        // Create the excel workbook file
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");
        worksheet.mergeCells('A1:M1');
        const mergedCell = worksheet.getCell('A1');
        mergedCell.value = 'CottonConnect | Sale';
        mergedCell.font = { bold: true };
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
        // Set bold font for header row
        // const headerRow = worksheet.addRow([
        //     "Sr No.", "Date", "Season", "Sold To", "Order Reference",
        //     "Invoice No", "Finished Batch/Lot No",
        //     "Job details from garment", "Knit Fabric Type", "Finished Fabric Length in Mts", "Finished Fabric GSM", "Finished Fabric Net Weight (Kgs)",
        //     "Transcation via trader"
        // ]);
        const headerRow = worksheet.addRow([
            "Sr No.", "Date", "Season", "Sold To", "Program", "Garment Order Reference", "Brand Order Reference",
            "Invoice No", "Batch Lot No","Quanitity in Kgs",
            "Vehicle No", "Transcation via trader", "Agent Details"
        ]);
        headerRow.font = { bold: true };
        let include = [
            {
                model: Knitter,
                as: "knitter",
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
        const weaver = await KnitSales.findAll({
            where: whereCondition,
            include: include
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
            data: process.env.BASE_URL + "knitter-sale.xlsx",
        });
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);

    }
};

const exportKnitterProcess = async (req: Request, res: Response) => {
    const excelFilePath = path.join("./upload", "knitter-process.xlsx");
    const { knitterId, seasonId, programId }: any = req.query;
    try {
        if (!knitterId) {
            return res.sendError(res, "Need knitter Id")
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
                { '$knitter.name$': { [Op.iLike]: `%${searchTerm}%` } },
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
        whereCondition.knitter_id = req.query.knitterId
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
        "Job Details from garment", "Knit Fabric Type", "Fabric Net Weight in Kgs","Fabric GSM","Total Finished Fabric Net Weight in Kgs", "Total Yarn Utilized"
        ]);
        headerRow.font = { bold: true };
        let include = [
            {
                model: Knitter,
                as: "knitter",
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


        const weaver = await KnitProcess.findAll({
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
            let fabricWeight: string = "";

            if (item.fabric_type && item.fabric_type.length > 0) {
                let type = await FabricType.findAll({ where: { id: { [Op.in]: item.fabric_type } } });
                for (let i of type) {
                    fabricType += `${i.fabricType_name},`
                }
            }

            fabricGSM = item?.fabric_gsm?.length > 0 ? item?.fabric_gsm.join(",") : "";
            fabricWeight = item?.fabric_weight?.length > 0 ? item?.fabric_weight.join(",") : "";

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
                fabricWeight: fabricWeight,
                fabricGSM: fabricGSM,
                totalLength: item.total_fabric_weight,
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
            data: process.env.BASE_URL + "knitter-process.xlsx",
        });
    } catch (error: any) {
        console.error("Error appending data:", error);
        return res.sendError(res, error.message);

    }
};

//fetch knitter transaction with filters
const fetchKnitterDashBoard = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { knitterId, status, filter, programId, spinnerId, invoice, lotNo, yarnCount, yarnType, reelLotNo }: any = req.query;
    const offset = (page - 1) * limit;
    const whereCondition: any = {};
    try {
        if (!knitterId) {
            return res.sendError(res, 'Need Knitter Id ');
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
            whereCondition.knitter_id = knitterId
            whereCondition.status = { [Op.in]: [ 'Pending' , 'Pending for QR scanning'] }
        } 
        if(status === 'Sold') {
            whereCondition.knitter_id = knitterId
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
                as: "yarncount"
            }
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
        return res.sendError(res, error.message);
    }
};

//update knitter transactions to accept and reject
const updateStatusKnitterSale = async (req: Request, res: Response) => {
    try {
        let update = [];
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

//count the number of bales and total quantity stock With Program
const countCottonBaleWithProgram = async (req: Request, res: Response) => {
    try {
        if (!req.query.knitterId) {
            return res.sendError(res, 'Need knitter Id');
        }
        let whereCondition: any = {}
        whereCondition.knitter_id = req.query.knitterId;
        whereCondition.status = 'Sold';
        const weaver = await SpinSales.findAll({
            where: whereCondition,
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
            include: [
                {
                    model: Program,
                    as: "program",
                    attributes: ["id", "program_name", "program_status"],
                }
            ],
            group: ["program.id"],
        });

        let data = await KnitSales.findAll({
            where: {
                knitter_id: req.query.knitterId
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
                    attributes: ["id", "program_name"],
                }
            ],
            group: ["fabric.id", "program.id"],
        });
        res.sendSuccess(res, { weaver, data });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const getProgram = async (req: Request, res: Response) => {
    try {
        if (!req.query.knitterId) {
            return res.sendError(res, 'Need Knitter Id');
        }

        let knitterId = req.query.knitterId;
        let result = await Knitter.findOne({ where: { id: knitterId } });

        let data = await Program.findAll({
            where: {
                id: { [Op.in]: result.program_id }
            }
        });
        res.sendSuccess(res, data);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const getSpinnerAndProgram = async (req: Request, res: Response) => {
    const { knitterId, status, filter, programId, spinnerId }: any = req.query;
    const whereCondition: any = {};
    try {
        if (!knitterId) {
            return res.sendError(res, 'Need Knitter Id ');
        }
        if (!status) {
            return res.sendError(res, 'Need  status');
        }

        if (status === 'Pending' ) {
            whereCondition.knitter_id = knitterId
            whereCondition.status = { [Op.in]: [ 'Pending' , 'Pending for QR scanning'] }
        } 
        if(status === 'Sold') {
            whereCondition.knitter_id = knitterId
            whereCondition.status = 'Sold';
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
        const program = await SpinSales.findAll({
            attributes: ['program_id', 'program.program_name'],
            where: whereCondition,
            include: [
                {
                    model: Program,
                    as: 'program',
                    attributes: ['id', 'program_name']
                }
            ],
            group: ['program_id', "program.id"]
        });
        res.sendSuccess(res, { spinner, program });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};

const getInvoiceAndyarnType = async (req: Request, res: Response) => {
    const { knitterId, status, spinnerId }: any = req.query;
    const whereCondition: any = {};
    try {
        if (!knitterId) {
            return res.sendError(res, 'Need Knitter Id ');
        }
        if (!status) {
            return res.sendError(res, 'Need  status');
        }
        if (status === 'Pending' ) {
            whereCondition.knitter_id = knitterId
            whereCondition.status = { [Op.in]: [ 'Pending' , 'Pending for QR scanning'] }
        } 
        if(status === 'Sold') {
            whereCondition.knitter_id = knitterId
            whereCondition.status = 'Sold';
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
        res.sendSuccess(res, { invoice, yarn_type, yarncount, reelLot });
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};


const getChooseFabricFilters = async (req: Request, res: Response) => {
    const { knitterId, programId }: any = req.query;
    const whereCondition: any = {};
    try {
        if (!knitterId) {
            return res.sendError(res, 'Need Knitter Id ');
        }

        if (knitterId) {
            whereCondition.knitter_id = knitterId;
        }
        if (programId) {
            const idArray: number[] = programId
                .split(",")
                .map((id: any) => parseInt(id, 10));
            whereCondition.program_id = { [Op.in]: idArray };
        }
        whereCondition.qty_stock = { [Op.gt]: 0 }
        
        const batchLotNo = await KnitProcess.findAll({
            attributes: ['batch_lot_no'],
            where: whereCondition,
            group: ['batch_lot_no']
        });
        const reelLot = await KnitProcess.findAll({
            attributes: ['reel_lot_no'],
            where: { ...whereCondition, reel_lot_no: { [Op.not]: null } },
            group: ['reel_lot_no']
        });
        const noOfRolls = await KnitProcess.findAll({
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
    let knitterId = req.query.knitterId;
    if (!knitterId) {
        return res.sendError(res, 'Need Knitter Id ');
    }
    let ress = await Knitter.findOne({ where: { id: knitterId } });
    if (!ress) {
        return res.sendError(res, 'No Knitter Found ');
    }
    let garment = await Garment.findAll({
        attributes: ['id', 'name'],
        where: { brand: { [Op.overlap]: ress.dataValues.brand } }
    })
    res.sendSuccess(res, garment);
}

const getFabrics = async (req: Request, res: Response) => {
    let knitterId = req.query.knitterId;
    if (!knitterId) {
        return res.sendError(res, 'Need Knitter Id ');
    }
    let ress = await Knitter.findOne({ where: { id: knitterId } });
    if (!ress) {
        return res.sendError(res, 'No Knitter Found ');
    }

    let fabric = await Fabric.findAll({
        attributes: ['id', 'name'],
        where: { brand: { [Op.overlap]: ress.dataValues.brand }, fabric_processor_type: { [Op.overlap]: [req.query.type] } }
    })
    res.sendSuccess(res, fabric);
}

export {
    createKnitterProcess,
    fetchKnitterProcessPagination,
    createKnitterrSales,
    fetchKnitterSalesPagination,
    fetchKnitterDashBoard,
    countCottonBaleWithProgram,
    updateStatusKnitterSale,
    exportKnitterSale,
    exportKnitterProcess,
    getProgram,
    getSpinnerAndProgram,
    getInvoiceAndyarnType,
    deleteKnitterSales,
    getGarments,
    fetchKnitterSale,
    getFabrics,
    fetchFabricReelLotNo,
    getChooseFabricFilters
}