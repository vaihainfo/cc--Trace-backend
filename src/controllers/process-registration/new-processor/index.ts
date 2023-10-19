import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import Ginner from "../../../models/ginner.model";
import User from "../../../models/user.model";
import hash from "../../../util/hash";
import Country from "../../../models/country.model";
import State from "../../../models/state.model";
import Program from "../../../models/program.model";
import UnitCertification from "../../../models/unit-certification.model";
import Brand from "../../../models/brand.model";
import UserRole from "../../../models/user-role.model";
import Spinner from "../../../models/spinner.model";
import Fabric from "../../../models/fabric.model";
import Garment from "../../../models/garment.model";
import Trader from "../../../models/trader.model";
import Weaver from "../../../models/weaver.model";
import Knitter from "../../../models/knitter.model";


const createProcessor = async (req: Request, res: Response) => {
    try {
        let userIds = [];
        for await (let user of req.body.userData) {
            const userData = {
                firstname: user.firstname,
                lastname: user.lastname ? user.lastname : ' ',
                position: user.position,
                email: user.email,
                password: await hash.generate(user.password),
                status: user.status,
                username: user.username,
                role: req.body.process_role[0],
                process_role: req.body.process_role,
                mobile: user.mobile
            };
            const result = await User.create(userData);
            userIds.push(result.id);
        }
        let mainData: any = [];
        let data = {
            name: req.body.name,
            short_name: req.body.shortName,
            address: req.body.address,
            country_id: req.body.countryId,
            state_id: req.body.stateId,
            district_id: req.body.districtId,
            program_id: req.body.programIds,
            latitude: req.body.latitude,
            longitude: req.body.latitude,
            website: req.body.website,
            org_logo: req.body.logo,
            org_photo: req.body.photo,
            unit_cert: req.body.unitCert,
            company_info: req.body.companyInfo,
            brand: req.body.brand,
            mobile: req.body.mobile,
            landline: req.body.landline,
            email: req.body.email,
            registration_document: req.body.registrationDocument,
            certs: req.body.certs,
            contact_person: req.body.contactPerson,
        }
        if (req.body.processType.includes('Ginner')) {
            let obj = {
                ...data,
                outturn_range_from: req.body.outturnRangeFrom,
                outturn_range_to: req.body.outturnRangeTo,
                bale_weight_from: req.body.baleWeightFrom,
                bale_weight_to: req.body.baleWeightTo,
                gin_type: req.body.ginType,
                ginnerUser_id: userIds
            }

            const result = await Ginner.create(obj);
            mainData.push(result);
        }
        if (req.body.processType.includes('Spinner')) {
            let obj = {
                ...data,
                yarn_count_range: req.body.yarnCountRange,
                realisation_range_from: req.body.rangeFrom,
                realisation_range_to: req.body.rangeTo,
                yarn_type: req.body.yarnType,
                spinnerUser_id: userIds,
            }
            console.log(obj)
            const result = await Spinner.create(obj);
            mainData.push(result);
        }
        if (req.body.processType.includes('Knitter')) {
            let obj = {
                ...data,
                knitterUser_id: userIds,
                no_of_machines: req.body.knitNoOfMachines,
                fabric_type: req.body.KnitFabricType,
                prod_cap: req.body.KnitProdCap,
                loss_from: req.body.KnitLossFrom,
                loss_to: req.body.KnitLossTo,
            }
            const result = await Knitter.create(obj);
            mainData.push(result);
        }
        if (req.body.processType.includes('Weaver')) {
            let obj = {
                ...data,
                loom_type: req.body.loomType,
                weaverUser_id: userIds,
                no_of_machines: req.body.weaverNoOfMachines,
                fabric_type: req.body.weaverFabricType,
                prod_cap: req.body.weaverProdCap,
                loss_from: req.body.weaverLossFrom,
                loss_to: req.body.weaverLossTo,
            }
            const result = await Weaver.create(obj);
            mainData.push(result);
        }
        if (req.body.processType.includes('Trader')) {
            let obj = {
                ...data,
                traderUser_id: userIds,
                material_trading: req.body.materialTrading,
            }
            const result = await Trader.create(obj);
            mainData.push(result);
        }
        if (req.body.processType.includes('Garment')) {
            let obj = {
                ...data,
                garmentUser_id: userIds,
                no_of_machines: req.body.garmentNoOfMachines,
                fabric_type: req.body.garmentFabricType,
                prod_cap: req.body.garmentProdCap,
                loss_from: req.body.garmentLossFrom,
                loss_to: req.body.garmentLossTo,
            }
            const result = await Garment.create(obj);
            mainData.push(result);
        }
        if (req.body.processType.includes('Fabric')) {
            let obj = {
                ...data,
                fabricUser_id: userIds,
                no_of_machines: req.body.fabricNoOfMachines,
                fabric_processor_type: req.body.fabricType,
                prod_capt: req.body.fabricProdCap,
                loss_from: req.body.fabricLossFrom,
                loss_to: req.body.fabricLossTo,
            }
            const result = await Fabric.create(obj);
            mainData.push(result);
        }

        res.sendSuccess(res, mainData);
    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_NOT_ABLE_CREATE_PROCESSOR");
    }
}

const fetchAllProcessor = async (req: Request, res: Response) => {
    try {
        if (!req.query.type) {
            return res.sendError(res, 'Need processor Type')
        }
        let userIds: any = [];
        let result
        if (req.query.type === 'Ginner') {
            result = await Ginner.findOne({
                where: {
                    id: req.query.id
                }
            });
            if (result) {
                userIds = result.ginnerUser_id
            }

        }
        if (req.query.type === 'Spinner') {
            result = await Spinner.findOne({
                where: {
                    id: req.query.id
                }
            });
            if (result) {
                userIds = result.spinnerUser_id
            }
        }
        if (req.query.type === 'Weaver') {
            result = await Weaver.findOne({
                where: {
                    id: req.query.id
                }
            });
            if (result) {
                userIds = result.weaverUser_id
            }
        }
        if (req.query.type === 'Knitter') {
            result = await Knitter.findOne({
                where: {
                    id: req.query.id
                }
            });
            if (result) {
                userIds = result.knitterUser_id
            }
        }
        if (req.query.type === 'Garment') {
            result = await Garment.findOne({
                where: {
                    id: req.query.id
                }
            });
            if (result) {
                userIds = result.garmentUser_id
            }
        }
        if (req.query.type === 'Fabric') {
            result = await Fabric.findOne({
                where: {
                    id: req.query.id
                }
            });
            if (result) {
                userIds = result.fabricUser_id
            }
        }
        if (req.query.type === 'Trader') {
            result = await Trader.findOne({
                where: {
                    id: req.query.id
                }
            });
            if (result) {
                userIds = result.traderUser_id
            }
        }
        let userData = [];
        let [ginner, spinner, weaver, knitter, garment, trader, fabric] = await Promise.all([
            Ginner.findOne({ where: { ginnerUser_id: { [Op.overlap]: userIds } } }),
            Spinner.findOne({ where: { spinnerUser_id: { [Op.overlap]: userIds } } }),
            Weaver.findOne({ where: { weaverUser_id: { [Op.overlap]: userIds } } }),
            Knitter.findOne({ where: { knitterUser_id: { [Op.overlap]: userIds } } }),
            Garment.findOne({ where: { garmentUser_id: { [Op.overlap]: userIds } } }),
            Trader.findOne({ where: { traderUser_id: { [Op.overlap]: userIds } } }),
            Fabric.findOne({ where: { fabricUser_id: { [Op.overlap]: userIds } } }),
        ])
        if (result) {
            for await (let user of userIds) {
                let us = await User.findOne({
                    where: { id: user }, attributes: {
                        exclude: ["password", "createdAt", "updatedAt"]
                    },
                    include: [
                        {
                            model: UserRole,
                            as: "user_role",
                        }
                    ]
                });
                userData.push(us)
            }
        }
        return res.sendSuccess(res, result ? { ginner, spinner, weaver, knitter, garment, trader, fabric, userData } : {});

    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_NOT_ABLE_FETCH_PROCESSOR");
    }
}

const updateProcessor = async (req: Request, res: Response) => {
    try {
        let userIds = [];
        for await (let user of req.body.userData) {
            const userData = {
                firstname: user.firstname,
                lastname: user.lastname,
                position: user.position,
                mobile: user.mobile,
                password: user.password ? await hash.generate(user.password) : undefined,
                status: user.status,
                role: req.body.process_role[0],
                process_role: req.body.process_role,
                id: user.id
            };
            if (user.id) {
                const result = await User.update(userData, { where: { id: user.id } });
                userIds.push(user.id);
            } else {
                const result = await User.create({ ...userData, username: user.username, email: user.email });
                userIds.push(result.id);
            }
        }
        let mainData: any = [];
        let data = {
            name: req.body.name,
            short_name: req.body.shortName,
            address: req.body.address,
            country_id: req.body.countryId,
            state_id: req.body.stateId,
            district_id: req.body.districtId,
            program_id: req.body.programIds,
            latitude: req.body.latitude,
            longitude: req.body.latitude,
            website: req.body.website,
            org_logo: req.body.logo,
            org_photo: req.body.photo,
            unit_cert: req.body.unitCert,
            company_info: req.body.companyInfo,
            brand: req.body.brand,
            mobile: req.body.mobile,
            landline: req.body.landline,
            email: req.body.email,
            registration_document: req.body.registrationDocument,
            certs: req.body.certs,
            contact_person: req.body.contactPerson,
        }
        if (req.body.processType.includes('Ginner')) {

            let obj = {
                ...data,
                outturn_range_from: req.body.outturnRangeFrom,
                outturn_range_to: req.body.outturnRangeTo,
                bale_weight_from: req.body.baleWeightFrom,
                bale_weight_to: req.body.baleWeightTo,
                gin_type: req.body.ginType,
                ginnerUser_id: userIds
            }
            if (req.body.ginnerId) {
                const result = await Ginner.update(obj, { where: { id: req.body.ginnerId } });
                mainData.push(result);
            } else {
                const result = await Ginner.create(obj);
                mainData.push(result);
            }
        }
        if (req.body.processType.includes('Spinner')) {
            let obj = {
                ...data,
                yarn_count_range: req.body.yarnCountRange,
                realisation_range_from: req.body.rangeFrom,
                realisation_range_to: req.body.rangeTo,
                yarn_type: req.body.yarnType,
                spinnerUser_id: userIds,
            }
            if (req.body.spinnerId) {
                const result = await Spinner.update(obj, { where: { id: req.body.spinnerId } });
                mainData.push(result);
            } else {
                const result = await Spinner.create(obj);
                mainData.push(result);
            }

        }
        if (req.body.processType.includes('Knitter')) {
            let obj = {
                ...data,
                knitterUser_id: userIds,
                no_of_machines: req.body.knitNoOfMachines,
                fabric_type: req.body.KnitFabricType,
                prod_cap: req.body.KnitProdCap,
                loss_from: req.body.KnitLossFrom,
                loss_to: req.body.KnitLossTo,
            }
            if (req.body.knitterId) {
                const result = await Knitter.update(obj, { where: { id: req.body.knitterId } });
                mainData.push(result);
            } else {
                const result = await Knitter.create(obj);
                mainData.push(result);
            }

        }
        if (req.body.processType.includes('Weaver')) {
            let obj = {
                ...data,
                loom_type: req.body.loomType,
                weaverUser_id: userIds,
                no_of_machines: req.body.weaverNoOfMachines,
                fabric_type: req.body.weaverFabricType,
                prod_cap: req.body.weaverProdCap,
                loss_from: req.body.weaverLossFrom,
                loss_to: req.body.weaverLossTo,
            }
            if (req.body.weaverId) {
                const result = await Weaver.update(obj, { where: { id: req.body.weaverId } });
                mainData.push(result);
            } else {
                const result = await Weaver.create(obj);
                mainData.push(result);
            }

        }
        if (req.body.processType.includes('Trader')) {
            let obj = {
                ...data,
                traderUser_id: userIds,
                material_trading: req.body.materialTrading,
            }
            if (req.body.traderId) {
                const result = await Trader.update(obj, { where: { id: req.body.traderId } });
                mainData.push(result);
            } else {
                const result = await Trader.create(obj);
                mainData.push(result);
            }
        }
        if (req.body.processType.includes('Garment')) {
            let obj = {
                ...data,
                garmentUser_id: userIds,
                no_of_machines: req.body.garmentNoOfMachines,
                fabric_type: req.body.garmentFabricType,
                prod_cap: req.body.garmentProdCap,
                loss_from: req.body.garmentLossFrom,
                loss_to: req.body.garmentLossTo,
            }
            if (req.body.garmentId) {
                const result = await Garment.update(obj, { where: { id: req.body.garmentId } });
                mainData.push(result);
            } else {
                const result = await Garment.create(obj);
                mainData.push(result);
            }

        }
        if (req.body.processType.includes('Fabric')) {
            let obj = {
                ...data,
                fabricUser_id: userIds,
                no_of_machines: req.body.fabricNoOfMachines,
                fabric_processor_type: req.body.fabricType,
                prod_capt: req.body.fabricProdCap,
                loss_from: req.body.fabricLossFrom,
                loss_to: req.body.fabricLossTo,
            }
            if (req.body.fabricId) {
                const result = await Fabric.update(obj, { where: { id: req.body.fabricId } });
                mainData.push(result);
            } else {
                const result = await Fabric.create(obj);
                mainData.push(result);
            }

        }
        res.sendSuccess(res, mainData);
    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_NOT_ABLE_UPDATE_PROCESSOR");
    }
}

export {
    createProcessor,
    fetchAllProcessor,
    updateProcessor
}