import { Request, Response } from "express";
import { Op } from "sequelize";
import GinnerOrder from "../../models/ginner-order.model";
import Season from "../../models/season.model";
import Program from "../../models/program.model";
import Ginner from "../../models/ginner.model";
import Brand from "../../models/brand.model";
import StyleMark from "../../models/style-mark.model";
import GarmentType from "../../models/garment-type.model";
import GinnerExpectedCotton from "../../models/ginner-expected-cotton.model";
import Village from "../../models/village.model";
import FarmGroup from "../../models/farm-group.model";
import Country from "../../models/country.model";
import State from "../../models/state.model";
import District from "../../models/district.model";
import Block from "../../models/block.model";
import Farmer from "../../models/farmer.model";
import ICS from "../../models/ics.model";
import Farm from "../../models/farm.model";
import ProcessorList from "../../models/processor-list.model";
import Transaction from "../../models/transaction.model";
import { saveFailedRecord } from "../failed-records";
import VillageImpact from "../../models/village-impact.model";
import SeedCompany from "../../models/seed-company.model";
import SeedAvailability from "../../models/seed-availability.model";
import SeedDemand from "../../models/seed_demand.model";
import LabMaster from "../../models/lab-master.model";
import SeedTestingLinkage from "../../models/seed-testing-linkage.model";
import CropCurrentSeason from "../../models/crop-current-season.model";
import IcsQuantityEstimation from "../../models/ics-quantity-estimation.model";
import FarmGroupEvaluation from "../../models/farm-group-evaluation.model";
import OrganicIntegrity from "../../models/organic-integrity.model";
import { generateQrCode, updateQrCode } from "../../provider/qrcode";

const uploadGinnerOrder = async (req: Request, res: Response) => {
    try {
        let fail = [];
        let pass = []
        for await (const data of req.body.ginnerOrder) {
            if (!data.season) {
                fail.push({
                    success: false,
                    id: data.uploadDate ? data.uploadDate : '',
                    message: "Season cannot be empty"
                });

            } else if (!data.uploadDate) {
                fail.push({
                    success: false,
                    id: data.uploadDate ? data.uploadDate : '',
                    message: "Upload Date cannot be empty"
                })
            } else if (!data.ginningMill) {
                fail.push({
                    success: false,
                    id: data.uploadDate ? data.uploadDate : '',
                    message: "Ginning mill cannot be empty"
                })
            } else if (!data.brand) {
                fail.push({
                    success: false,
                    id: data.uploadDate ? data.uploadDate : '',
                    message: "Brand cannot be empty"
                })
            } else if (!data.program) {
                fail.push({
                    success: false,
                    id: data.uploadDate ? data.uploadDate : '',
                    message: "Programme cannot be empty"
                })
            } else if (!data.confirmedBales) {
                fail.push({
                    success: false,
                    id: data.uploadDate ? data.uploadDate : '',
                    message: "Confirmed Bales cannot be empty"
                })
            } else if (!data.confirmedLintOrder) {
                fail.push({
                    success: false,
                    id: data.uploadDate ? data.uploadDate : '',
                    message: "Confirmed Lint Order cannot be empty"
                })
            } else {
                let season;
                let program;
                let ginner;
                let brand;
                if (data.season) {
                    season = await Season.findOne({
                        where: {
                            name: data.season
                        }
                    });
                    if (!season) {
                        fail.push({
                            success: false,
                            id: data.uploadDate ? data.uploadDate : '',
                            message: "Season not found"
                        })
                    }
                }
                if (data.program) {
                    program = await Program.findOne({
                        where: {
                            program_name: data.program
                        }
                    });
                    if (!program) {
                        fail.push({
                            success: false,
                            id: data.uploadDate ? data.uploadDate : '',
                            message: "Programme not found"
                        })
                    }
                }
                if (data.ginningMill) {
                    ginner = await Ginner.findOne({
                        where: {
                            name: data.ginningMill
                        }
                    });

                    if (!ginner) {
                        fail.push({
                            success: false,
                            id: data.uploadDate ? data.uploadDate : '',
                            message: "Ginner not found"
                        })
                    }
                }

                if (data.brand) {
                    brand = await Brand.findOne({
                        where: {
                            brand_name: data.brand
                        }
                    });

                    if (!brand) {
                        fail.push({
                            success: false,
                            id: data.uploadDate ? data.uploadDate : '',
                            message: "Brand not found"
                        })
                    }
                }

                if (program && brand && ginner && season) {
                    const ginnerData = {
                        season_id: season.id,
                        upload_date: new Date(),
                        program_id: program.id,
                        brand_id: brand.id,
                        ginning_mill: data.ginningMill,
                        ginner_id: ginner.id,
                        confirmed_bales: Number(data.confirmedBales),
                        confirmed_lint_order: Number(data.confirmedLintOrder)
                    };
                    const result = await GinnerOrder.create(ginnerData);
                    pass.push({
                        success: true,
                        data: result,
                        id: data.uploadDate ? data.uploadDate : '',
                        message: "Ginner Order created"
                    });
                }
            }


        }
        res.sendSuccess(res, { pass, fail });
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

const uploadStyleMark = async (req: Request, res: Response) => {
    try {
        let fail = [];
        let pass = [];
        for await (const data of req.body.styleMark) {
            if (!data.style_mark_no) {
                fail.push({
                    success: false,
                    message: "Style Mark cannot be empty"
                });
            } else {
                let stylemark = await StyleMark.findOne({ where: { style_mark_no: data.style_mark_no } });
                if (stylemark) {
                    fail.push({
                        success: false,
                        data: { stylemark: data.style_mark_no },
                        message: "Already exist"
                    });
                } else {
                    const result = await StyleMark.create({ style_mark_no: data.style_mark_no });
                    pass.push({
                        success: true,
                        data: result,
                        message: "Style Mark created"
                    });
                }
            }
        }
        res.sendSuccess(res, { pass, fail });
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

const uploadGarmentType = async (req: Request, res: Response) => {
    try {
        let fail = [];
        let pass = [];
        for await (const data of req.body.garmentType) {
            if (!data.name) {
                fail.push({
                    success: false,
                    message: "Garment Type cannot be empty"
                });
            } else {
                let garmentType = await GarmentType.findOne({ where: { name: data.name } });
                if (garmentType) {
                    fail.push({
                        success: false,
                        data: { name: data.name },
                        message: "Already exist"
                    });
                } else {
                    const result = await GarmentType.create({ name: data.name });
                    pass.push({
                        success: true,
                        data: result,
                        message: "Garment Type created"
                    });
                }
            }
        }
        res.sendSuccess(res, { pass, fail });
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

const uploadGinnerExpectedSeed = async (req: Request, res: Response) => {
    try {
        let fail = [];
        let pass = []
        for await (const data of req.body.ginnerExpectedSeed) {
            if (!data.season) {
                fail.push({
                    success: false,
                    message: "Season cannot be empty"
                });

            } else if (!data.ginningMill) {
                fail.push({
                    success: false,
                    message: "Ginning mill cannot be empty"
                })
            } else if (!data.brand) {
                fail.push({
                    success: false,
                    message: "Brand cannot be empty"
                })
            } else if (!data.program) {
                fail.push({
                    success: false,
                    message: "Programme cannot be empty"
                })
            } else if (!data.expectedSeedCotton) {
                fail.push({
                    success: false,
                    message: "Expected Seed Cotton cannot be empty"
                })
            } else if (!data.expectedLint) {
                fail.push({
                    success: false,
                    message: "Expected Lint cannot be empty"
                })
            } else {
                let season;
                let program;
                let ginner;
                let brand;
                if (data.season) {
                    season = await Season.findOne({
                        where: {
                            name: data.season
                        }
                    });
                    if (!season) {
                        fail.push({
                            success: false,
                            message: "Season not found"
                        })
                    }
                }

                if (data.program) {
                    program = await Program.findOne({
                        where: {
                            program_name: data.program
                        }
                    });
                    if (!program) {
                        fail.push({
                            success: false,
                            message: "Programme not found"
                        })
                    }
                }

                if (data.ginningMill) {
                    ginner = await Ginner.findOne({
                        where: {
                            name: data.ginningMill
                        }
                    });

                    if (!ginner) {
                        fail.push({
                            success: false,
                            message: "Ginner not found"
                        })
                    }
                }

                if (data.brand) {
                    brand = await Brand.findOne({
                        where: {
                            brand_name: data.brand
                        }
                    });

                    if (!brand) {
                        fail.push({
                            success: false,
                            message: "Brand not found"
                        })
                    }
                }

                if (program && brand && ginner && season) {
                    const ginnerData = {
                        season_id: season.id,
                        upload_date: new Date(),
                        program_id: program.id,
                        brand_id: brand.id,
                        ginning_mill: data.ginningMill,
                        ginner_id: ginner.id,
                        expected_seed_cotton: data.expectedSeedCotton,
                        expected_lint: data.expectedLint
                    };
                    const result = await GinnerExpectedCotton.create(ginnerData);
                    pass.push({
                        success: true,
                        data: result,
                        message: "Ginner Experted Cotton created"
                    });
                }
            }
        }
        res.sendSuccess(res, { pass, fail });
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

const uploadVillage = async (req: Request, res: Response) => {
    try {
        let fail = [];
        let pass = [];

        for await (const data of req.body.villageData) {
            if (!data.village) {
                fail.push({
                    success: false,
                    message: "Village cannot be empty"
                });
            } else {
                const vill = {
                    block_id: req.body.blockId,
                    village_name: data.village,
                    village_latitude: 0,
                    village_longitude: 0
                };
                let village = await Village.findOne({
                    where:
                    {
                        block_id: req.body.blockId,
                        village_name: {
                            [Op.iLike]:
                                data.village
                        }
                    }
                })
                if (village) {
                    fail.push({
                        success: false,
                        data: { village: data.village },
                        message: "Village Already exists"
                    });
                } else {
                    const result = await Village.create(vill);
                    pass.push({
                        success: true,
                        data: result,
                        message: "Village created"
                    });
                }

            }
        }
        res.sendSuccess(res, { pass, fail });
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

const uploadFarmer = async (req: Request, res: Response) => {
    try {
        let fail: any = [];
        let pass: any = [];
        let season;
        let program;
        let farmGroup;
        let brand;
        if (!req.body.program) {
            fail.push({
                success: false,
                message: "Programme cannot be empty"
            });
            let failedRecord = {
                type: 'Farmer',
                season: '',
                farmerCode: '',
                farmerName: '',
                body: {},
                reason: "Programme cannot be empty"
            }
            saveFailedRecord(failedRecord)
            return res.sendSuccess(res, { pass, fail });
        } else {
            program = await Program.findOne({
                where: {
                    program_name: req.body.program
                }
            });

            if (!program) {
                fail.push({
                    success: false,
                    message: "Programme not found"
                })
                let failedRecord = {
                    type: 'Farmer',
                    season: '',
                    farmerCode: '',
                    farmerName: '',
                    body: {},
                    reason: "Programme not found"
                }
                saveFailedRecord(failedRecord)
                return res.sendSuccess(res, { pass, fail });
            }
        }
        if (!req.body.brand) {
            fail.push({
                success: false,
                message: "Brand cannot be empty"
            });
            let failedRecord = {
                type: 'Farmer',
                season: '',
                farmerCode: '',
                farmerName: '',
                body: {},
                reason: "Brand cannot be empty"
            }
            saveFailedRecord(failedRecord)
            return res.sendSuccess(res, { pass, fail });
        } else {
            brand = await Brand.findOne({
                where: {
                    brand_name: req.body.brand
                }
            });

            if (!brand) {
                fail.push({
                    success: false,
                    message: "Brand not found"
                });
                let failedRecord = {
                    type: 'Farmer',
                    season: '',
                    farmerCode: '',
                    farmerName: '',
                    body: {},
                    reason: "Brand not found"
                }
                saveFailedRecord(failedRecord)
                return res.sendSuccess(res, { pass, fail });
            }

            else {
                let brandCheck;
                if (req.body.brand) {
                    brandCheck = await Brand.findOne({
                        where: {
                            programs_id: {
                                [Op.contains]: [program.id]
                            },
                            id: brand.id
                        }
                    });
                    if (!brandCheck) {
                        fail.push({
                            success: false,
                            message: "Brand is not associated with the entered Programme"
                        });
                        let failedRecord = {
                            type: 'Farmer',
                            season: '',
                            farmerCode: '',
                            farmerName: '',
                            body: {},
                            reason: "Brand is not associated with the entered Programme"
                        }
                        saveFailedRecord(failedRecord)
                        return res.sendSuccess(res, { pass, fail });
                    }
                }
            }
        }
        if (!req.body.farmGroup) {
            fail.push({
                success: false,
                message: "FarmGroup cannot be empty"
            });
            let failedRecord = {
                type: 'Farmer',
                season: '',
                farmerCode: '',
                farmerName: '',
                body: {},
                reason: "FarmGroup cannot be empty"
            }
            saveFailedRecord(failedRecord)
            return res.sendSuccess(res, { pass, fail });
        } else {
            farmGroup = await FarmGroup.findOne({
                where: {
                    name: req.body.farmGroup,
                      brand_id: brand.id,
                }
            });

            if (!farmGroup) {
                fail.push({
                    success: false,
                    message: "Farm Group not found"
                });
                let failedRecord = {
                    type: 'Farmer',
                    season: '',
                    farmerCode: '',
                    farmerName: '',
                    body: {},
                    reason: "Farm Group not found"
                }
                saveFailedRecord(failedRecord)
                return res.sendSuccess(res, { pass, fail });
            }
            else {
                let farmCheck;
                if (req.body.brand) {
                    farmCheck = await FarmGroup.findOne({
                        where: {
                            brand_id: brand.id,
                            id: farmGroup.id
                        }
                    });
                    if (!farmCheck) {
                        fail.push({
                            success: false,
                            message: "Farm Group is not associated with the entered brand"
                        });
                        let failedRecord = {
                            type: 'Farmer',
                            season: '',
                            farmerCode: '',
                            farmerName: '',
                            body: {},
                            reason: "Farm Group is not associated with the entered brand"
                        }
                        saveFailedRecord(failedRecord)
                        return res.sendSuccess(res, { pass, fail });
                    }
                }
            }
        }
        if (!req.body.season) {
            fail.push({
                success: false,
                message: "Season cannot be empty"
            });
            let failedRecord = {
                type: 'Farmer',
                season: '',
                farmerCode: '',
                farmerName: '',
                body: {},
                reason: "Season cannot be empty"
            }
            saveFailedRecord(failedRecord)
            return res.sendSuccess(res, { pass, fail });
        } else {
            season = await Season.findOne({
                where: {
                    name: req.body.season
                }
            });
            if (!season) {
                fail.push({
                    success: false,
                    message: "Season not found"
                })
                let failedRecord = {
                    type: 'Farmer',
                    season: '',
                    farmerCode: '',
                    farmerName: '',
                    body: {},
                    reason: "Season not found"
                }
                saveFailedRecord(failedRecord)
                return res.sendSuccess(res, { pass, fail });
            }
        }

        for await (const data of req.body.farmers) {
            if (!data.firstName) {
                fail.push({
                    success: false,
                    data: { farmerCode: data.farmerCode ? data.farmerCode : '', farmerName: data.firstName ? data.firstName : '' },
                    message: "First Name cannot be empty"
                })
                let failedRecord = {
                    type: 'Farmer',
                    season: season,
                    farmerCode: data.farmerCode ? data.farmerCode : '',
                    farmerName: data.firstName ? data.firstName : '',
                    body: { ...data },
                    reason: "First Name cannot be empty"
                }
                saveFailedRecord(failedRecord)
            } else if (!data.farmerCode) {
                fail.push({
                    success: false,
                    data: { farmerCode: data.farmerCode ? data.farmerCode : '', farmerName: data.firstName },
                    message: "Farmer Code cannot be empty"
                })
                let failedRecord = {
                    type: 'Farmer',
                    season: season,
                    farmerCode: data.farmerCode ? data.farmerCode : '',
                    farmerName: data.firstName ? data.firstName : '',
                    body: { ...data },
                    reason: "Farmer Code cannot be empty"
                }
                saveFailedRecord(failedRecord)
            } else if (!data.country) {
                fail.push({
                    success: false,
                    data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                    message: "Country cannot be empty"
                });
                let failedRecord = {
                    type: 'Farmer',
                    season: season,
                    farmerCode: data.farmerCode ? data.farmerCode : '',
                    farmerName: data.firstName ? data.firstName : '',
                    body: { ...data },
                    reason: "Country cannot be empty"
                }
                saveFailedRecord(failedRecord)
            } else if (!data.state) {
                fail.push({
                    success: false,
                    data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                    message: "State cannot be empty"
                })
                let failedRecord = {
                    type: 'Farmer',
                    season: season,
                    farmerCode: data.farmerCode ? data.farmerCode : '',
                    farmerName: data.firstName ? data.firstName : '',
                    body: { ...data },
                    reason: "State cannot be empty"
                }
                saveFailedRecord(failedRecord)
            } else if (!data.district) {
                fail.push({
                    success: false,
                    data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                    message: "District cannot be empty"
                })
                let failedRecord = {
                    type: 'Farmer',
                    season: season,
                    farmerCode: data.farmerCode ? data.farmerCode : '',
                    farmerName: data.firstName ? data.firstName : '',
                    body: { ...data },
                    reason: "District cannot be empty"
                }
                saveFailedRecord(failedRecord)
            } else if (!data.block) {
                fail.push({
                    success: false,
                    data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                    message: "Block cannot be empty"
                })
                let failedRecord = {
                    type: 'Farmer',
                    season: season,
                    farmerCode: data.farmerCode ? data.farmerCode : '',
                    farmerName: data.firstName ? data.firstName : '',
                    body: { ...data },
                    reason: "Block cannot be empty"
                }
                saveFailedRecord(failedRecord)
            } else if (!data.village) {
                fail.push({
                    success: false,
                    data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                    message: "Village cannot be empty"
                })
                let failedRecord = {
                    type: 'Farmer',
                    season: season,
                    farmerCode: data.farmerCode ? data.farmerCode : '',
                    farmerName: data.firstName ? data.firstName : '',
                    body: { ...data },
                    reason: "Village cannot be empty"
                }
                saveFailedRecord(failedRecord)
            } else if (program.program_name !== "Organic" && data.tracenetId) {
                fail.push({
                    success: false,
                    data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                    message: "Tracenet Id is only for Organic Programme"
                });
                let failedRecord = {
                    type: 'Farmer',
                    season: season,
                    farmerCode: data.farmerCode ? data.farmerCode : '',
                    farmerName: data.firstName ? data.firstName : '',
                    body: { ...data },
                    reason: "Tracenet Id is only for Organic Programme"
                }
                saveFailedRecord(failedRecord)
            } else if (program.program_name !== "Organic" && data.icsName) {
                fail.push({
                    success: false,
                    data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                    message: "ICS name is only for Organic Programme"
                })
                let failedRecord = {
                    type: 'Farmer',
                    season: season,
                    farmerCode: data.farmerCode ? data.farmerCode : '',
                    farmerName: data.firstName ? data.firstName : '',
                    body: { ...data },
                    reason: "ICS name is only for Organic Programme"
                }
                saveFailedRecord(failedRecord)
            } else if (program.program_name !== "Organic" && data.certStatus) {
                fail.push({
                    success: false,
                    data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                    message: "Cert Status is only for Organic Programme"
                })
                let failedRecord = {
                    type: 'Farmer',
                    season: season,
                    farmerCode: data.farmerCode ? data.farmerCode : '',
                    farmerName: data.firstName ? data.firstName : '',
                    body: { ...data },
                    reason: "Cert Status is only for Organic Programme"
                }
                saveFailedRecord(failedRecord)
            } else {
                let country;
                let state;
                let district;
                let block;
                let village;
                let ics;
                if (data.country) {
                    country = await Country.findOne({
                        where: {
                            county_name: data.country
                        }
                    });
                    if (!country) {
                        fail.push({
                            success: false,
                            data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                            message: "Country not found"
                        });
                        let failedRecord = {
                            type: 'Farmer',
                            season: season,
                            farmerCode: data.farmerCode ? data.farmerCode : '',
                            farmerName: data.firstName ? data.firstName : '',
                            body: { ...data },
                            reason: "Country not found"
                        }
                        saveFailedRecord(failedRecord)
                    } else {
                        if (data.state) {
                            state = await State.findOne({
                                where: {
                                    country_id: country.id,
                                    state_name: data.state
                                }
                            });
                            if (!state) {
                                fail.push({
                                    success: false,
                                    data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                                    message: "State is not associated with the entered Country"
                                });
                                let failedRecord = {
                                    type: 'Farmer',
                                    season: season,
                                    farmerCode: data.farmerCode ? data.farmerCode : '',
                                    farmerName: data.firstName ? data.firstName : '',
                                    body: { ...data },
                                    reason: "State is not associated with the entered Country"
                                }
                                saveFailedRecord(failedRecord)
                            } else {
                                if (data.district) {
                                    district = await District.findOne({
                                        where: {
                                            state_id: state.id,
                                            district_name: data.district
                                        }
                                    });

                                    if (!district) {
                                        fail.push({
                                            success: false,
                                            data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                                            message: "District is not associated with entered State"
                                        });
                                        let failedRecord = {
                                            type: 'Farmer',
                                            season: season,
                                            farmerCode: data.farmerCode ? data.farmerCode : '',
                                            farmerName: data.firstName ? data.firstName : '',
                                            body: { ...data },
                                            reason: "District is not associated with entered State"
                                        }
                                        saveFailedRecord(failedRecord)
                                    } else {

                                        if (data.block) {
                                            block = await Block.findOne({
                                                where: {
                                                    district_id: district.id,
                                                    block_name: data.block
                                                }
                                            });

                                            if (!block) {
                                                fail.push({
                                                    success: false,
                                                    data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                                                    message: "Block is not associated with entered District"
                                                });
                                                let failedRecord = {
                                                    type: 'Farmer',
                                                    season: season,
                                                    farmerCode: data.farmerCode ? data.farmerCode : '',
                                                    farmerName: data.firstName ? data.firstName : '',
                                                    body: { ...data },
                                                    reason: "Block is not associated with entered District"
                                                }
                                                saveFailedRecord(failedRecord)
                                            } else {
                                                if (data.village) {
                                                    village = await Village.findOne({
                                                        where: {
                                                            block_id: block.id,
                                                            village_name: {
                                                                [Op.iLike]:
                                                                    data.village
                                                            }
                                                        }
                                                    });

                                                    if (!village) {
                                                        fail.push({
                                                            success: false,
                                                            data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                                                            message: "Village is not associated with entered Taluk/Block"
                                                        })
                                                        let failedRecord = {
                                                            type: 'Farmer',
                                                            season: season,
                                                            farmerCode: data.farmerCode ? data.farmerCode : '',
                                                            farmerName: data.firstName ? data.firstName : '',
                                                            body: { ...data },
                                                            reason: "Village is not associated with entered Taluk/Block"
                                                        }
                                                        saveFailedRecord(failedRecord)
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                if (data.icsName) {
                    ics = await ICS.findOne({
                        where: {
                            ics_name: data.icsName
                        }
                    });

                    if (!ics) {
                        fail.push({
                            success: false,
                            data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                            message: "ICS not found"
                        });
                        let failedRecord = {
                            type: 'Farmer',
                            season: season,
                            farmerCode: data.farmerCode ? data.farmerCode : '',
                            farmerName: data.firstName ? data.firstName : '',
                            body: { ...data },
                            reason: "ICS not found"
                        }
                        saveFailedRecord(failedRecord)
                    }
                }

                if (country && state && district && block && village) {
                    let farmers = await Farmer.findOne({ where: { code: data.farmerCode } });

                    if (farmers) {
                        const farmerdata = {
                            program_id: program.id,
                            brand_id: brand.id,
                            farmGroup_id: farmGroup.id,
                            firstName: data.firstName,
                            lastName: data.lastName,
                            code: data.farmerCode,
                            country_id: country.id,
                            state_id: state.id,
                            district_id: district.id,
                            block_id: block.id,
                            village_id: village.id,
                            joining_date: data.dateOfJoining ? new Date(data.dateOfJoining).toISOString() : null,
                            ics_id: ics ? ics.id : null,
                            tracenet_id: data.tracenetId ? data.tracenetId : null,
                            cert_status: data.certStatus ? data.certStatus : null,
                            cotton_total_area: data.cottonTotalArea ? data.cottonTotalArea : 0.0,
                            total_estimated_cotton: data.totalEstimatedCotton ? data.totalEstimatedCotton : 0.0,
                            agri_total_area: data.agriTotalArea ? data.agriTotalArea : 0.0,
                            agri_estimated_yeld: data.agriEstimatedYield ? data.agriEstimatedYield : 0.0,
                            agri_estimated_prod: data.agriEstimatedProd ? data.agriEstimatedProd : 0.0
                        };

                        const farmer = await Farmer.update(farmerdata, {
                            where: {
                                id: farmers.id,
                            },
                        });

                        let name = data.lastName ? data.firstName + " " + data.lastName : data.firstName
                        let uniqueFilename = `qrcode_${name.replace(/\//g, '-')}_${data.farmerCode.replace(/\//g, '-')}.png`;
                    
                        
                        const shouldUpdateQR = (
                            farmers.firstName !== data.firstName ||
                            farmers.lastName !== data.lastName ||
                            farmers.village_id !== village.id
                        );
                        
                        if (farmers && farmers.qrUrl == "" ||  shouldUpdateQR){
                            let aa = await updateQrCode(`${farmers.id}`,
                                name, uniqueFilename, data.farmerCode, village ? village.village_name : '');
                            const farmerPLace = await Farmer.update({ qrUrl: uniqueFilename }, {
                                where: {
                                    id: farmers.id
                                }
                            });
                        }
                       

                        //check if farm exists
                        const farm = await Farm.findOne({ where: { farmer_id: farmers.id, season_id: season.id } });

                        if (farm) {

                            const farmData = {
                                farmer_id: farmers.id,
                                program_id: program.id,
                                season_id: season.id,
                                agri_total_area: data.agriTotalArea ? data.agriTotalArea : 0.0,
                                agri_estimated_yeld: data.agriEstimatedYield ? data.agriEstimatedYield : 0.0,
                                agri_estimated_prod: data.agriEstimatedProd ? data.agriEstimatedProd : 0.0,
                                cotton_total_area: data.cottonTotalArea ? data.cottonTotalArea : 0.0,
                                total_estimated_cotton: data.totalEstimatedCotton ? data.totalEstimatedCotton : 0.0,
                                available_cotton: Number(data.totalEstimatedCotton) + (0.15 * Number(data.totalEstimatedCotton))
                            };
                            const updatedFarm = await Farm.update(farmData, {
                                where: {
                                    id: farm.id,
                                },
                            });

                            pass.push({
                                success: true,
                                data: farmers,
                                message: "Farmer created"
                            });

                        } else {
                            const farmData = {
                                farmer_id: farmers.id,
                                program_id: program.id,
                                season_id: season.id,
                                agri_total_area: data.agriTotalArea ? data.agriTotalArea : 0.0,
                                agri_estimated_yeld: data.agriEstimatedYield ? data.agriEstimatedYield : 0.0,
                                agri_estimated_prod: data.agriEstimatedProd ? data.agriEstimatedProd : 0.0,
                                cotton_total_area: data.cottonTotalArea ? data.cottonTotalArea : 0.0,
                                total_estimated_cotton: data.totalEstimatedCotton ? data.totalEstimatedCotton : 0.0,
                                available_cotton: Number(data.totalEstimatedCotton) + (0.15 * Number(data.totalEstimatedCotton))
                            };
                            const createdFarm = await Farm.create(farmData);
                            pass.push({
                                success: true,
                                data: farmers,
                                message: "Farmer created"
                            });
                        }

                    } else {
                        const farmerdata = {
                            program_id: program.id,
                            brand_id: brand.id,
                            farmGroup_id: farmGroup.id,
                            firstName: data.firstName,
                            lastName: data.lastName,
                            code: data.farmerCode,
                            country_id: country.id,
                            state_id: state.id,
                            district_id: district.id,
                            block_id: block.id,
                            village_id: village.id,
                            joining_date: data.dateOfJoining ? new Date(data.dateOfJoining).toISOString() : null,
                            ics_id: ics ? ics.id : null,
                            tracenet_id: data.tracenetId ? data.tracenetId : null,
                            cert_status: data.certStatus ? data.certStatus : null,
                            cotton_total_area: data.cottonTotalArea ? data.cottonTotalArea : 0.0,
                            total_estimated_cotton: data.totalEstimatedCotton ? data.totalEstimatedCotton : 0.0,
                            agri_total_area: data.agriTotalArea ? data.agriTotalArea : 0.0,
                            agri_estimated_yeld: data.agriEstimatedYield ? data.agriEstimatedYield : 0.0,
                            agri_estimated_prod: data.agriEstimatedProd ? data.agriEstimatedProd : 0.0
                        };

                        const farmer = await Farmer.create(farmerdata);

                        let name = farmer.lastName ? farmer.firstName + " " + farmer.lastName : farmer.firstName
                        let uniqueFilename = `qrcode_${name.replace(/\//g, '-')}_${farmer.code.replace(/\//g, '-')}.png`;
                        let aa = await generateQrCode(`${farmer.id}`,
                            name, uniqueFilename, farmer.code, village ? village.village_name : '');
                        const farmerPLace = await Farmer.update({ qrUrl: uniqueFilename }, {
                            where: {
                                id: farmer.id
                            }
                        });

                        const farmData = {
                            farmer_id: farmer.id,
                            program_id: program.id,
                            season_id: season.id,
                            agri_total_area: data.agriTotalArea ? data.agriTotalArea : 0.0,
                            agri_estimated_yeld: data.agriEstimatedYield ? data.agriEstimatedYield : 0.0,
                            agri_estimated_prod: data.agriEstimatedProd ? data.agriEstimatedProd : 0.0,
                            cotton_total_area: data.cottonTotalArea ? data.cottonTotalArea : 0.0,
                            total_estimated_cotton: data.totalEstimatedCotton ? data.totalEstimatedCotton : 0.0
                        };
                        const farm = await Farm.create(farmData);
                        pass.push({
                            success: true,
                            data: farmer,
                            message: "Farmer created"
                        });
                    }
                }
            }
        }
        res.sendSuccess(res, { pass, fail });
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

const uploadProcessorList = async (req: Request, res: Response) => {
    try {
        let fail = [];
        let pass = [];

        for await (const data of req.body.processorData) {
            if (!data.name) {
                fail.push({
                    success: false,
                    message: "Name cannot be empty"
                });
            } else if (!data.address) {
                fail.push({
                    success: false,
                    message: "Address cannot be empty"
                });
            } else {
                let list = await ProcessorList.findOne({ where: { name: data.name } })

                if (list) {
                    fail.push({
                        success: false,
                        data: { name: data.name },
                        message: "Processor Name Already exists"
                    });
                } else {
                    const obj = {
                        name: data.name,
                        address: data.address,
                        status: true
                    };
                    const result = await ProcessorList.create(obj);
                    pass.push({
                        success: true,
                        data: result,
                        message: "Processor Created"
                    });
                }

            }
        }
        res.sendSuccess(res, { pass, fail });
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

const uploadProcurementPrice = async (req: Request, res: Response) => {
    try {
        let fail = [];
        let pass = [];

        for await (const data of req.body.procurementPriceData) {
            if (!data.transactionId) {
                fail.push({
                    success: false,
                    data: { id: "" },
                    message: "Transaction Id cannot be empty"
                });
            } else if (!data.oldPrice) {
                fail.push({
                    success: false,
                    data: { id: data.transactionId },
                    message: "Old Price cannot be empty"
                });
            } else if (!data.newPrice) {
                fail.push({
                    success: false,
                    data: { id: data.transactionId },
                    message: "New Price cannot be empty"
                });
            } else {
                let list = await Transaction.findOne({ where: { id: data.transactionId } })

                if (!list) {
                    fail.push({
                        success: false,
                        data: { id: data.transactionId },
                        message: "Transaction Id not available"
                    });
                } else if (list.dataValues.rate != data.oldPrice) {
                    fail.push({
                        success: false,
                        data: { id: data.transactionId },
                        message: "Old Price is mismatching"
                    });
                } else {
                    const obj = {
                        rate: data.newPrice,
                        total_amount: data.newPrice * list.dataValues.qty_purchased
                    };
                    const result = await Transaction.update(obj, { where: { id: data.transactionId } });
                    pass.push({
                        success: true,
                        data: result,
                        message: "Transaction Updated"
                    });
                }

            }
        }
        res.sendSuccess(res, { pass, fail });
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

const uploadImpactData = async (req: Request, res: Response) => {
    try {
        let fail = [];
        let pass = [];

        if (!req.body.impactData || !Array.isArray(req.body.impactData))
            throw Error('Req Error');

        for (const data of req.body.impactData) {
            if (!data.village) {
                fail.push({
                    success: false,
                    data: { id: "" },
                    message: "village cannot be empty"
                });
            } else if (!data.reducedChemicalPesticide) {
                fail.push({
                    success: false,
                    data: { id: data.transactionId },
                    message: "Reduced chemical pesticide use by cannot be empty"
                });
            } else if (!data.reducedChemicalFertilizer) {
                fail.push({
                    success: false,
                    data: { id: data.transactionId },
                    message: "Reduced chemical fertilizer use by cannot be empty"
                });
            } else if (!data.reducedWater) {
                fail.push({
                    success: false,
                    data: { id: data.transactionId },
                    message: "Reduced water use by by cannot be empty"
                });
            } else if (!data.increasedYield) {
                fail.push({
                    success: false,
                    data: { id: data.transactionId },
                    message: "Increased yield by cannot be empty"
                });
            } else if (!data.increasedInputCost) {
                fail.push({
                    success: false,
                    data: { id: data.transactionId },
                    message: "Reduced input costs by cannot be empty"
                });
            } else if (!data.increasedProfit) {
                fail.push({
                    success: false,
                    data: { id: data.transactionId },
                    message: "Increased profit by cannot be empty"
                });
            } else {
                const village = await Village.findOne({
                    where: {
                        village_name: {
                            [Op.iLike]:
                                data.village
                        }
                    }
                });

                if (!village) {
                    fail.push({
                        success: false,
                        data: { id: data.transactionId },
                        message: "village Id not available"
                    });
                } else {
                    const obj = {
                        village: village.id,
                        reduced_chemical_pesticide: data.reducedChemicalPesticide,
                        reduced_chemical_fertilizer: data.reducedChemicalFertilizer,
                        reduced_water_use: data.reducedWater,
                        increased_yield: data.increasedYield,
                        reduced_input_costs: data.increasedInputCost,
                        increased_profit: data.increasedProfit
                    };
                    const result = await VillageImpact.create(obj);
                    pass.push({
                        success: true,
                        data: result,
                        message: "Impact Data Added"
                    });
                }

            }
        }
        res.sendSuccess(res, { pass, fail });
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
};

const uploadSeedAvailability = async (req: Request, res: Response) => {
    try {
        let fail = [];
        let pass = [];

        if (!req.body.season || !req.body.seedAvailabilities || !Array.isArray(req.body.seedAvailabilities)) {
            throw Error('Req Error');
        }

        const season = await Season.findOne({ where: { name: req.body.season } });

        for (const data of req.body.seedAvailabilities) {
            if (!season) {
                fail.push({
                    success: false,
                    message: "Season Id not available"
                });
            } else if (!data.seedCompanyName) {
                fail.push({
                    success: false,
                    message: "Seed Company Name cannot be empty"
                });
            } else if (!data.lotNo) {
                fail.push({
                    success: false,
                    message: "Lot No. cannot be empty"
                });
            } else if (!data.variety) {
                fail.push({
                    success: false,
                    message: "Variety cannot be empty"
                });
            } else if (!data.pkt450gm) {
                fail.push({
                    success: false,
                    message: "PKT cannot be empty"
                });
            } else if (!data.state) {
                fail.push({
                    success: false,
                    message: "State cannot be empty"
                });
            } else {
                const seedCompany = await SeedCompany.findOne({ where: { name: data.seedCompanyName } });

                if (!seedCompany) {
                    fail.push({
                        success: false,
                        message: "Seed Company Id not available"
                    });
                } else {
                    const obj = {
                        season_id: season.id,
                        seed_company_id: seedCompany.id,
                        lot_no: data.lotNo,
                        variety: data.variety,
                        pkt: data.pkt450gm,
                        state: data.state
                    };
                    const result = await SeedAvailability.create(obj);
                    pass.push({
                        success: true,
                        data: result,
                        message: "Seed Availability Added"
                    });
                }
            }
        }

        res.sendSuccess(res, { pass, fail });
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

const uploadSeedDemand = async (req: Request, res: Response) => {
    try {
        let fail = [];
        let pass = [];

        if (!req.body.season || !req.body.seedDemands || !Array.isArray(req.body.seedDemands)) {
            throw Error('Req Error');
        }

        const season = await Season.findOne({ where: { name: req.body.season } });

        for (const data of req.body.seedDemands) {
            if (!season) {
                fail.push({
                    success: false,
                    message: "Season Id not available"
                });
            } else if (!data.projectName) {
                fail.push({
                    success: false,
                    message: "Project Name cannot be empty"
                });
            } else if (!data.seedCompanyName) {
                fail.push({
                    success: false,
                    message: "Seed Company Name cannot be empty"
                });
            } else if (!data.seedVariety) {
                fail.push({
                    success: false,
                    message: "Seed Variety cannot be empty"
                });
            } else if (!data.numbersOfPackets) {
                fail.push({
                    success: false,
                    message: "Numbers of Packets cannot be empty"
                });
            } else if (!data.projectsLocation) {
                fail.push({
                    success: false,
                    message: "Projects Location cannot be empty"
                });
            } else if (!data.suggestionRemark) {
                fail.push({
                    success: false,
                    message: "Suggestion / Remark cannot be empty"
                });
            } else {
                const seedCompany = await SeedCompany.findOne({ where: { name: data.seedCompanyName } });

                if (!seedCompany) {
                    fail.push({
                        success: false,
                        message: "Seed Company Id not available"
                    });
                } else {
                    const obj = {
                        season_id: season.id,
                        project_name: data.projectName,
                        seed_company_id: seedCompany.id,
                        seed_variety: data.seedVariety,
                        numbers_of_packets: data.numbersOfPackets,
                        project_location: data.projectsLocation,
                        remark: data.suggestionRemark
                    };
                    const result = await SeedDemand.create(obj);
                    pass.push({
                        success: true,
                        data: result,
                        message: "Seed Availability Added"
                    });
                }
            }
        }

        res.sendSuccess(res, { pass, fail });
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

const uploadSeedTestingAndLinkage = async (req: Request, res: Response) => {
    try {
        let fail = [];
        let pass = [];

        if (!req.body.seedTestingAndLinkages || !Array.isArray(req.body.seedTestingAndLinkages)) {
            throw Error('Req Error');
        }

        for (const data of req.body.seedTestingAndLinkages) {
            if (!data.season) {
                fail.push({
                    success: false,
                    message: "Season cannot be empty"
                });
            } else if (!data.seed_company_name) {
                fail.push({
                    success: false,
                    message: "Seed Company Name cannot be empty"
                });
            } else if (!data.lotno) {
                fail.push({
                    success: false,
                    message: "Lot No. cannot be empty"
                });
            } else if (!data.variety) {
                fail.push({
                    success: false,
                    message: "Variety cannot be empty"
                });
            } else if (!data.packets) {
                fail.push({
                    success: false,
                    message: "Packets cannot be empty"
                });
            } else if (!data.district) {
                fail.push({
                    success: false,
                    message: "District cannot be empty"
                });
            } else if (!data.state) {
                fail.push({
                    success: false,
                    message: "State cannot be empty"
                });
            } else if (!data.testing_code) {
                fail.push({
                    success: false,
                    message: "Testing Code cannot be empty"
                });
            } else if (!data.seal_no) {
                fail.push({
                    success: false,
                    message: "Seal No. cannot be empty"
                });
            } else if (!data.date_sending_sample) {
                fail.push({
                    success: false,
                    message: "Date of Sending Sample to LAB cannot be empty"
                });
            } else if (!data.date_of_report) {
                fail.push({
                    success: false,
                    message: "Date of the report cannot be empty"
                });
            } else if (!data.report_no) {
                fail.push({
                    success: false,
                    message: "Report No. cannot be empty"
                });
            } else if (!data.nos) {
                fail.push({
                    success: false,
                    message: "NOS cannot be empty"
                });
            } else if (!data.thirtyfives) {
                fail.push({
                    success: false,
                    message: "35 S cannot be empty"
                });
            } else if (!data.result_of_lab) {
                fail.push({
                    success: false,
                    message: "Result of External Lab cannot be empty"
                });
            } else if (!data.lab_master_name) {
                fail.push({
                    success: false,
                    message: "Lab Master Name cannot be empty"
                });
            } else {
                const season = await Season.findOne({ where: { name: data.season } });
                const seedCompany = await SeedCompany.findOne({ where: { name: data.seed_company_name } });
                const labMaster = await LabMaster.findOne({ where: { name: data.lab_master_name } });

                if (!season) {
                    fail.push({
                        success: false,
                        message: "Season Id not available"
                    });
                } else if (!seedCompany) {
                    fail.push({
                        success: false,
                        message: "Seed Company Id not available"
                    });
                } else if (!labMaster) {
                    fail.push({
                        success: false,
                        message: "Lab Master Id not available"
                    });
                } else {
                    const obj = {
                        season_id: season.id,
                        seed_company_id: seedCompany.id,
                        lotno: data.lotno,
                        variety: data.variety,
                        packets: data.packets,
                        district: data.district,
                        state: data.state,
                        testing_code: data.testing_code,
                        seal_no: data.seal_no,
                        date_sending_sample: data.date_sending_sample,
                        date_of_report: data.date_of_report,
                        report_no: data.report_no,
                        nos: data.nos,
                        thirtyfives: data.thirtyfives,
                        result_of_lab: data.result_of_lab,
                        lab_master_id: labMaster.id,
                    };
                    const result = await SeedTestingLinkage.create(obj);
                    pass.push({
                        success: true,
                        data: result,
                        message: "Seed Testing and Linkage Added"
                    });
                }
            }
        }

        res.sendSuccess(res, { pass, fail });
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

const uploadIcsQuantityEstimation = async (req: Request, res: Response) => {
    try {
        let fail = [];
        let pass = [];

        if (!req.body.icsQuantityEstimations || !Array.isArray(req.body.icsQuantityEstimations)) {
            throw Error('Req Error');
        }

        for (const data of req.body.icsQuantityEstimations) {
            if (!data.season) {
                fail.push({
                    success: false,
                    message: "Season cannot be empty"
                });
            } else if (!data.farm_group) {
                fail.push({
                    success: false,
                    message: "Farm Group cannot be empty"
                });
            } else if (!data.ics_name) {
                fail.push({
                    success: false,
                    message: "ICS Name cannot be empty"
                });
            } else if (!data.no_of_farmer) {
                fail.push({
                    success: false,
                    message: "No. of farmers cannot be empty"
                });
            } else if (!data.total_area) {
                fail.push({
                    success: false,
                    message: "Total Area cannot be empty"
                });
            } else if (!data.est_cotton_area) {
                fail.push({
                    success: false,
                    message: "Est. Cotton Area cannot be empty"
                });
            } else if (!data.estimated_lint) {
                fail.push({
                    success: false,
                    message: "Estimated Lint cannot be empty"
                });
            } else if (!data.verified_row_cotton) {
                fail.push({
                    success: false,
                    message: "Verified volume by CB as per TC (RAW COTTON) cannot be empty"
                });
            } else if (!data.verified_ginner) {
                fail.push({
                    success: false,
                    message: "Verified volume by CB as per TC (GINNER) cannot be empty"
                });
            } else if (!data.crop_current_season) {
                fail.push({
                    success: false,
                    message: "Status for current season Crop cannot be empty"
                });
            } else if (!data.organic_standard) {
                fail.push({
                    success: false,
                    message: "Organic standard cannot be empty"
                });
            } else if (!data.certification_body) {
                fail.push({
                    success: false,
                    message: "Certification body cannot be empty"
                });
            } else if (!data.scope_issued_date) {
                fail.push({
                    success: false,
                    message: "Scope issued date cannot be empty"
                });
            } else if (!data.scope_certification_validity) {
                fail.push({
                    success: false,
                    message: "Scope certificate validity cannot be empty"
                });
            } else if (!data.scope_certification_no) {
                fail.push({
                    success: false,
                    message: "Scope Certificate No. cannot be empty"
                });
            } else if (!data.nop_scope_certification_no) {
                fail.push({
                    success: false,
                    message: "NOP Scope Certificate No. cannot be empty"
                });
            } else if (!data.district) {
                fail.push({
                    success: false,
                    message: "District cannot be empty"
                });
            } else if (!data.state) {
                fail.push({
                    success: false,
                    message: "State cannot be empty"
                });
            } else if (!data.remark) {
                fail.push({
                    success: false,
                    message: "Remark cannot be empty"
                });
            } else {
                const season = await Season.findOne({ where: { name: data.season } });
                const farmGroup = await FarmGroup.findOne({ where: { name: data.farm_group } });
                const ics = await ICS.findOne({ where: { ics_name: data.ics_name } });
                const cropCurrentSeason = await CropCurrentSeason.findOne({ where: { crop_name: data.crop_current_season } });

                if (!season) {
                    fail.push({
                        success: false,
                        message: "Season Id not available"
                    });
                } else if (!farmGroup) {
                    fail.push({
                        success: false,
                        message: "Farm Group Id not available"
                    });
                } else if (!ics) {
                    fail.push({
                        success: false,
                        message: "ICS Id not available"
                    });
                } else if (!cropCurrentSeason) {
                    fail.push({
                        success: false,
                        message: "Crop Current Season Id not available"
                    });
                } else {
                    const obj = {
                        season_id: season.id,
                        farm_group_id: farmGroup.id,
                        ics_id: ics.id,
                        no_of_farmer: data.no_of_farmer,
                        total_area: data.total_area,
                        est_cotton_area: data.est_cotton_area,
                        estimated_lint: data.estimated_lint,
                        verified_row_cotton: data.verified_row_cotton,
                        verified_ginner: data.verified_ginner,
                        crop_current_season_id: cropCurrentSeason.id,
                        organic_standard: data.organic_standard,
                        certification_body: data.certification_body,
                        scope_issued_date: data.scope_issued_date,
                        scope_certification_validity: data.scope_certification_validity,
                        scope_certification_no: data.scope_certification_no,
                        nop_scope_certification_no: data.nop_scope_certification_no,
                        district: data.district,
                        state: data.state,
                        remark: data.remark
                    };
                    const result = await IcsQuantityEstimation.create(obj);
                    pass.push({
                        success: true,
                        data: result,
                        message: "ICS Quantity Estimation Added"
                    });
                }
            }
        }

        res.sendSuccess(res, { pass, fail });
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

const uploadIcsName = async (req: Request, res: Response) => {
    try {
        let fail = [];
        let pass = [];

        if (!req.body.icsNames || !Array.isArray(req.body.icsNames)) {
            throw Error('Req Error');
        }

        for (const data of req.body.icsNames) {
            if (!data.farm_group) {
                fail.push({
                    success: false,
                    message: "Farm Group cannot be empty"
                });
            } else if (!data.ics_name) {
                fail.push({
                    success: false,
                    message: "ICS Name cannot be empty"
                });
            } else if (!data.latitude) {
                fail.push({
                    success: false,
                    message: "Latitude cannot be empty"
                });
            } else if (!data.longitude) {
                fail.push({
                    success: false,
                    message: "Longitude cannot be empty"
                });
            } else {
                const farmGroup = await FarmGroup.findOne({ where: { name: data.farm_group } });

                if (!farmGroup) {
                    fail.push({
                        success: false,
                        message: "Farm Group Id not available"
                    });
                } else {
                    const obj = {
                        ics_name: data.ics_name,
                        farmGroup_id: farmGroup.id,
                        ics_latitude: data.latitude,
                        ics_longitude: data.longitude
                    };
                    const result = await ICS.create(obj);
                    pass.push({
                        success: true,
                        data: result,
                        message: "ICS Name Added"
                    });
                }
            }
        }

        res.sendSuccess(res, { pass, fail });
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

const uploadFarmGroupEvaluationData = async (req: Request, res: Response) => {
    try {
        let fail = [];
        let pass = [];

        if (!req.body.farmGroupEvaluationData || !Array.isArray(req.body.farmGroupEvaluationData)) {
            throw Error('Req Error');
        }

        for (const data of req.body.farmGroupEvaluationData) {
            if (!data.season) {
                fail.push({
                    success: false,
                    message: "Season cannot be empty"
                });
            } else if (!data.agronomist_name) {
                fail.push({
                    success: false,
                    message: "Name of the Agronomist cannot be empty"
                });
            } else if (!data.visit_from) {
                fail.push({
                    success: false,
                    message: "Visit From cannot be empty"
                });
            } else if (!data.visit_to) {
                fail.push({
                    success: false,
                    message: "Visit To cannot be empty"
                });
            } else if (!data.address) {
                fail.push({
                    success: false,
                    message: "Address cannot be empty"
                });
            } else if (!data.registration_details) {
                fail.push({
                    success: false,
                    message: "Registration Details cannot be empty"
                });
            } else if (!data.company_type) {
                fail.push({
                    success: false,
                    message: "Type of company cannot be empty"
                });
            } else if (!data.parent_company_name) {
                fail.push({
                    success: false,
                    message: "Name of the parent company cannot be empty"
                });
            } else if (!data.owner_name) {
                fail.push({
                    success: false,
                    message: "Owner name cannot be empty"
                });
            } else if (!data.establishment_year) {
                fail.push({
                    success: false,
                    message: "Establishment year of organization cannot be empty"
                });
            } else if (!data.district_project_presence) {
                fail.push({
                    success: false,
                    message: "Districts where project has its presence cannot be empty"
                });
            } else if (!data.program_type_by_organization) {
                fail.push({
                    success: false,
                    message: "Type of programs undertaken by organization cannot be empty"
                });
            } else if (!data.total_beneficiaries) {
                fail.push({
                    success: false,
                    message: "Total beneficiaries with the programs cannot be empty"
                });
            } else if (!data.brand) {
                fail.push({
                    success: false,
                    message: "Brand cannot be empty"
                });
            } else if (!data.farm_group_type) {
                fail.push({
                    success: false,
                    message: "Farm Group type cannot be empty"
                });
            } else if (!['existing', 'new'].includes(data.farm_group_type.toLowerCase())) {
                fail.push({
                    success: false,
                    message: "Farm Group type is not valid"
                });
            } else if (!data.farm_group) {
                fail.push({
                    success: false,
                    message: "Farm Group cannot be empty"
                });
            } else if (!data.sustainable_cotton_program_type) {
                fail.push({
                    success: false,
                    message: "Type of sustainable cotton programs undertaken cannot be empty"
                });
            } else if (!data.total_no_farmers_in_organic_cotton) {
                fail.push({
                    success: false,
                    message: "Total number of farmers in organic cotton programs cannot be empty"
                });
            } else if (!data.program_wise_no_farmers_in_other_sustain_cotton_program) {
                fail.push({
                    success: false,
                    message: "Programme wise number of farmers in other sustainable cotton programs cannot be empty"
                });
            } else if (!data.total_number_of_current_ics) {
                fail.push({
                    success: false,
                    message: "Total number of current ICS cannot be empty"
                });
            } else if (!data.cotton_variety_grown_in_program_areas) {
                fail.push({
                    success: false,
                    message: "Cotton variety grown in program areas cannot be empty"
                });
            } else if (!data.state) {
                fail.push({
                    success: false,
                    message: "State cannot be empty"
                });
            } else if (!data.district) {
                fail.push({
                    success: false,
                    message: "District cannot be empty"
                });
            } else if (!data.block) {
                fail.push({
                    success: false,
                    message: "Taluka/ Block cannot be empty"
                });
            } else if (!data.village) {
                fail.push({
                    success: false,
                    message: "Village Name cannot be empty"
                });
            } else if (!data.no_of_farmers_met) {
                fail.push({
                    success: false,
                    message: "Number of farmers met cannot be empty"
                });
            } else if (data.scope_certificate_of_last_year_based_on_ics_score === "") {
                fail.push({
                    success: false,
                    message: "Scope certificates of last year based on the ICSs - score cannot be empty"
                });
            } else if (!data.scope_certificate_of_last_year_based_on_ics_action) {
                fail.push({
                    success: false,
                    message: "Scope certificates of last year based on the ICSs - action cannot be empty"
                });
            } else if (data.farmer_field_dairy_score === "") {
                fail.push({
                    success: false,
                    message: "Farmer Field Diary or Organic Survey tools - score cannot be empty"
                });
            } else if (!data.farmer_field_dairy_action) {
                fail.push({
                    success: false,
                    message: "Farmer Field Diary or Organic Survey tools - action cannot be empty"
                });
            } else if (data.farmer_training_attendence_register_score === "") {
                fail.push({
                    success: false,
                    message: "Farmer Training/Attendance Register - score cannot be empty"
                });
            } else if (!data.farmer_training_attendence_register_action) {
                fail.push({
                    success: false,
                    message: "Farmer Training/Attendance Register - action cannot be empty"
                });
            } else if (data.demonstration_register_score === "") {
                fail.push({
                    success: false,
                    message: "Demonstration Register (optional) - score cannot be empty"
                });
            } else if (!data.demonstration_register_action) {
                fail.push({
                    success: false,
                    message: "Demonstration Register (optional) - action cannot be empty"
                });
            } else if (data.farmers_are_aware_of_organization_score === "") {
                fail.push({
                    success: false,
                    message: "Farmers are aware of the organization - score cannot be empty"
                });
            } else if (!data.farmers_are_aware_of_organization_remarks) {
                fail.push({
                    success: false,
                    message: "Farmers are aware of the organization - remark cannot be empty"
                });
            } else if (data.farmers_getting_support_of_any_kind_score === "") {
                fail.push({
                    success: false,
                    message: "Farmers getting support of any kind (trainings, inputs etc.) - score cannot be empty"
                });
            } else if (!data.farmers_getting_support_of_any_kind_remarks) {
                fail.push({
                    success: false,
                    message: "Farmers getting support of any kind (trainings, inputs etc.) - remark cannot be empty"
                });
            } else if (data.frequency_of_selling_your_cotton_to_the_organization_score === "") {
                fail.push({
                    success: false,
                    message: "Frequency of selling your cotton to the organization - score cannot be empty"
                });
            } else if (!data.frequency_of_selling_your_cotton_to_the_organization_remarks) {
                fail.push({
                    success: false,
                    message: "Frequency of selling your cotton to the organization - remark cannot be empty"
                });
            } else if (data.farmers_associated_organic_program_score === "") {
                fail.push({
                    success: false,
                    message: "Are the farmers associated with Organic program - score cannot be empty"
                });
            } else if (!data.farmers_associated_organic_program_remarks) {
                fail.push({
                    success: false,
                    message: "Are the farmers associated with Organic program - remark cannot be empty"
                });
            } else if (data.field_executive_support_by_imparing_knowledge_score === "") {
                fail.push({
                    success: false,
                    message: "Do the field executive support by imparting knowledge or providing suggestions to the farmers - score cannot be empty"
                });
            } else if (!data.field_executive_support_by_imparing_knowledge_remarks) {
                fail.push({
                    success: false,
                    message: "Do the field executive support by imparting knowledge or providing suggestions to the farmers - remark cannot be empty"
                });
            } else if (data.farmers_knows_the_name_of_field_executive_score === "") {
                fail.push({
                    success: false,
                    message: "Do the farmers knows the name of the Field Executive of the ICS - score cannot be empty"
                });
            } else if (!data.farmers_knows_the_name_of_field_executive_remarks) {
                fail.push({
                    success: false,
                    message: "Do the farmers knows the name of the Field Executive of the ICS - remark cannot be empty"
                });
            } else if (data.awareness_of_the_farmers_organic_practices_score === "") {
                fail.push({
                    success: false,
                    message: "Awareness of the farmers in organic practices - score cannot be empty"
                });
            } else if (!data.awareness_of_the_farmers_organic_practices_remarks) {
                fail.push({
                    success: false,
                    message: "Awareness of the farmers in organic practices - remark cannot be empty"
                });
            } else if (data.awareness_of_the_farmers_regarding_organic_certification_score === "") {
                fail.push({
                    success: false,
                    message: "Awareness of the farmers regarding organic certification - score cannot be empty"
                });
            } else if (!data.awareness_of_the_farmers_regarding_organic_certification_remarks) {
                fail.push({
                    success: false,
                    message: "Awareness of the farmers regarding organic certification -remark cannot be empty"
                });
            } else {
                const season = await Season.findOne({ where: { name: data.season } });
                const brand = await Brand.findOne({ where: { brand_name: data.brand } });

                if (!season) {
                    fail.push({
                        success: false,
                        message: "Season Id not available"
                    });
                } else if (!brand) {
                    fail.push({
                        success: false,
                        message: "Brand Id not available"
                    });
                } else {
                    let farmGroup = null;
                    if (data.farm_group_type.toLowerCase() === 'existing') {
                        farmGroup = await FarmGroup.findOne({ where: { name: data.farm_group } });
                    } else {
                        const farmGroupData = {
                            brand_id: brand.id,
                            name: data.farm_group,
                            status: true,
                        };
                        farmGroup = await FarmGroup.create(farmGroupData);
                    }

                    if (!farmGroup) {
                        fail.push({
                            success: false,
                            message: "Farm Group Id not available"
                        });
                    } else {
                        const { sNo, season: season_name, brand: brand_name, farm_group_type, farm_group: farm_group_name, ...farmGroupEvaluationData } = data;
                        const obj = {
                            ...farmGroupEvaluationData,
                            name_of_organic_certification_agencies: "",
                            season_id: season.id,
                            farm_group_id: farmGroup.id,
                            brand_id: brand.id,
                            created_by: 1
                        };
                        const result = await FarmGroupEvaluation.create(obj);
                        pass.push({
                            success: true,
                            data: result,
                            message: "Farm Group Evaluation Data Added"
                        });
                    }
                }
            }
        }

        res.sendSuccess(res, { pass, fail });
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

const uploadIntegrityTest = async (req: Request, res: Response) => {
    try {
        let fail = [];
        let pass = [];

        if (!req.body.integrityTests || !Array.isArray(req.body.integrityTests)) {
            throw Error('Req Error');
        }

        for (const data of req.body.integrityTests) {
            if (!data.season) {
                fail.push({
                    success: false,
                    message: "Season cannot be empty"
                });
            } else if (!data.date) {
                fail.push({
                    success: false,
                    message: "Date cannot be empty"
                });
            } else if (!data.brand) {
                fail.push({
                    success: false,
                    message: "Brand cannot be empty"
                });
            } else if (!data.stageOfTesting) {
                fail.push({
                    success: false,
                    message: "Stage of testing cannot be empty"
                });
            } else if (!data.typeOfTest) {
                fail.push({
                    success: false,
                    message: "Type of test cannot be empty"
                });
            } else if (!data.farmGroup) {
                fail.push({
                    success: false,
                    message: "Farm Group cannot be empty"
                });
            } else if (!data.icsName) {
                fail.push({
                    success: false,
                    message: "ICS Name cannot be empty"
                });
            } else if (!data.farmer) {
                fail.push({
                    success: false,
                    message: "Farmer cannot be empty"
                });
            } else if (!data.sealNo) {
                fail.push({
                    success: false,
                    message: "Seal No. cannot be empty"
                });
            } else if (!data.tracenetId) {
                fail.push({
                    success: false,
                    message: "Tracenet Id cannot be empty"
                });
            } else if (!data.sampleCodeNo) {
                fail.push({
                    success: false,
                    message: "Sample Code No. cannot be empty"
                });
            } else if (!data.seedLotNo) {
                fail.push({
                    success: false,
                    message: "Seed Lot No. cannot be empty"
                });
            } else if (!data.integrityScore) {
                fail.push({
                    success: false,
                    message: "Integrity Score cannot be empty"
                });
            } else {
                const brand = await Brand.findOne({ where: { brand_name: data.brand } });
                const farmer = await Farmer.findOne({ where: { firstName: data.farmer } });
                const farmGroup = await FarmGroup.findOne({ where: { name: data.farmGroup } });
                const ics = await ICS.findOne({ where: { ics_name: data.icsName } });

                if (!brand) {
                    fail.push({
                        success: false,
                        message: "Brand Id not available"
                    });
                } else if (!farmer) {
                    fail.push({
                        success: false,
                        message: "Farmer Id not available"
                    });
                } else if (!farmGroup) {
                    fail.push({
                        success: false,
                        message: "Farm Group Id not available"
                    });
                } else if (!ics) {
                    fail.push({
                        success: false,
                        message: "ICS Id not available"
                    });
                } else {
                    const obj = {
                        date: data.date,
                        brand_id: brand.id,
                        farmGroup_id: farmGroup.id,
                        ics_id: ics.id,
                        ginner_id: 0,
                        test_stage: data.stageOfTesting,
                        farmer: farmer.id,
                        seal_no: data.sealNo,
                        sample_code: data.sampleCodeNo,
                        seed_lot: data.seedLotNo,
                        integrity_score: data.integrityScore.toLowerCase() === "positive" ? true : false,
                        documents: ""
                    };
                    const result = await OrganicIntegrity.create(obj);
                    pass.push({
                        success: true,
                        data: result,
                        message: "Organic Integrity Added"
                    });
                }
            }
        }

        res.sendSuccess(res, { pass, fail });
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

const uploadOrganicFarmer = async (req: Request, res: Response) => {
    try {
        let fail: any = [];
        let pass: any = [];

        let season;
        let program;
        let farmGroup;
        let brand;

        if (!req.body.program) {
            fail.push({
                success: false,
                message: "Programme cannot be empty"
            });
            return res.sendSuccess(res, { pass, fail });
        } else {
            program = await Program.findOne({ where: { program_name: req.body.program } });

            if (!program) {
                fail.push({
                    success: false,
                    message: "Programme not found"
                });
                return res.sendSuccess(res, { pass, fail });
            }
        }

        if (!req.body.brand) {
            fail.push({
                success: false,
                message: "Brand cannot be empty"
            });
            return res.sendSuccess(res, { pass, fail });
        } else {
            brand = await Brand.findOne({ where: { brand_name: req.body.brand } });

            if (!brand) {
                fail.push({
                    success: false,
                    message: "Brand not found"
                });
                return res.sendSuccess(res, { pass, fail });
            }
        }

        if (!req.body.farmGroup) {
            fail.push({
                success: false,
                message: "FarmGroup cannot be empty"
            });
            return res.sendSuccess(res, { pass, fail });
        } else {
            farmGroup = await FarmGroup.findOne({ where: { name: req.body.farmGroup , brand_id: brand.id} });

            if (!farmGroup) {
                fail.push({
                    success: false,
                    message: "Farm Group not found"
                });
                return res.sendSuccess(res, { pass, fail });
            }
        }

        if (!req.body.season) {
            fail.push({
                success: false,
                message: "Season cannot be empty"
            });
            return res.sendSuccess(res, { pass, fail });
        } else {
            season = await Season.findOne({ where: { name: req.body.season } });

            if (!season) {
                fail.push({
                    success: false,
                    message: "Season not found"
                });
                return res.sendSuccess(res, { pass, fail });
            }
        }

        for await (const data of req.body.organicFarmers) {
            if (!data.firstName) {
                fail.push({
                    success: false,
                    data: { farmerCode: data.farmerCode ? data.farmerCode : '', farmerName: data.firstName ? data.firstName : '' },
                    message: "First Name cannot be empty"
                });
            } else if (!data.farmerCode) {
                fail.push({
                    success: false,
                    data: { farmerCode: data.farmerCode ? data.farmerCode : '', farmerName: data.firstName },
                    message: "Farmer Code cannot be empty"
                });
            } else if (!data.country) {
                fail.push({
                    success: false,
                    data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                    message: "Country cannot be empty"
                });
            } else if (!data.state) {
                fail.push({
                    success: false,
                    data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                    message: "State cannot be empty"
                });
            } else if (!data.district) {
                fail.push({
                    success: false,
                    data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                    message: "District cannot be empty"
                });
            } else if (!data.block) {
                fail.push({
                    success: false,
                    data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                    message: "Block cannot be empty"
                });
            } else if (!data.village) {
                fail.push({
                    success: false,
                    data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                    message: "Village cannot be empty"
                });
            } else if (program.program_name !== "Organic" && data.tracenetId) {
                fail.push({
                    success: false,
                    data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                    message: "Tracenet Id is only for Organic Programme"
                });
            } else if (program.program_name !== "Organic" && data.icsName) {
                fail.push({
                    success: false,
                    data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                    message: "ICS name is only for Organic Programme"
                });
            } else if (program.program_name !== "Organic" && data.certStatus) {
                fail.push({
                    success: false,
                    data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                    message: "Cert Status is only for Organic Programme"
                });
            } else {
                let country;
                let state;
                let district;
                let block;
                let village;
                let ics;

                if (data.country) {
                    country = await Country.findOne({ where: { county_name: data.country } });

                    if (!country) {
                        fail.push({
                            success: false,
                            data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                            message: "Country not found"
                        });
                    } else {
                        if (data.state) {
                            state = await State.findOne({
                                where: {
                                    country_id: country.id,
                                    state_name: data.state
                                }
                            });

                            if (!state) {
                                fail.push({
                                    success: false,
                                    data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                                    message: "State is not associated with the entered Country"
                                });
                            } else {
                                if (data.district) {
                                    district = await District.findOne({
                                        where: {
                                            state_id: state.id,
                                            district_name: data.district
                                        }
                                    });

                                    if (!district) {
                                        fail.push({
                                            success: false,
                                            data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                                            message: "District is not associated with entered State"
                                        });
                                    } else {
                                        if (data.block) {
                                            block = await Block.findOne({
                                                where: {
                                                    district_id: district.id,
                                                    block_name: data.block
                                                }
                                            });

                                            if (!block) {
                                                fail.push({
                                                    success: false,
                                                    data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                                                    message: "Block is not associated with entered District"
                                                });
                                            } else {
                                                if (data.village) {
                                                    village = await Village.findOne({
                                                        where: {
                                                            block_id: block.id,
                                                            village_name: {
                                                                [Op.iLike]:
                                                                    data.village
                                                            }
                                                        }
                                                    });

                                                    if (!village) {
                                                        fail.push({
                                                            success: false,
                                                            data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                                                            message: "Village is not associated with entered Taluk/Block"
                                                        });
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                if (data.icsName) {
                    ics = await ICS.findOne({ where: { ics_name: data.icsName } });

                    if (!ics) {
                        fail.push({
                            success: false,
                            data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                            message: "ICS not found"
                        });
                    }
                }

                if (country && state && district && block && village) {
                    let farmer = await Farmer.findOne({ where: { code: data.farmerCode } });

                    if (farmer) {
                        const farmerdata = {
                            program_id: program.id,
                            brand_id: brand.id,
                            farmGroup_id: farmGroup.id,
                            firstName: data.firstName,
                            lastName: data.lastName,
                            code: data.farmerCode,
                            country_id: country.id,
                            state_id: state.id,
                            district_id: district.id,
                            block_id: block.id,
                            village_id: village.id,
                            joining_date: data.dateOfJoining ? new Date(data.dateOfJoining).toISOString() : null,
                            ics_id: ics ? ics.id : null,
                            tracenet_id: data.tracenetId ? data.tracenetId : null,
                            cert_status: data.certStatus ? data.certStatus : null,
                            cotton_total_area: data.cottonTotalArea ? data.cottonTotalArea : 0.0,
                            total_estimated_cotton: data.totalEstimatedCotton ? data.totalEstimatedCotton : 0.0,
                            agri_total_area: data.agriTotalArea ? data.agriTotalArea : 0.0,
                            agri_estimated_yeld: data.agriEstimatedYield ? data.agriEstimatedYield : 0.0,
                            agri_estimated_prod: data.agriEstimatedProd ? data.agriEstimatedProd : 0.0
                        };
                        await Farmer.update(farmerdata, {
                            where: { id: farmer.id }
                        });

                        const farm = await Farm.findOne({ where: { farmer_id: farmer.id, season_id: season.id } });

                        if (farm) {
                            const farmData = {
                                farmer_id: farmer.id,
                                program_id: program.id,
                                season_id: season.id,
                                agri_total_area: data.agriTotalArea ? data.agriTotalArea : 0.0,
                                agri_estimated_yeld: data.agriEstimatedYield ? data.agriEstimatedYield : 0.0,
                                agri_estimated_prod: data.agriEstimatedProd ? data.agriEstimatedProd : 0.0,
                                cotton_total_area: data.cottonTotalArea ? data.cottonTotalArea : 0.0,
                                total_estimated_cotton: data.totalEstimatedCotton ? data.totalEstimatedCotton : 0.0,
                                cluster: data.cluster ? data.cluster : null,
                                seed_packet_quantity: data.seedPacketQuantity ? data.seedPacketQuantity : null,
                                variety: data.variety ? data.variety : null,
                                lot_no: data.lotNo ? data.lotNo : null,
                                distribution_date: data.dateOfDistibution ? data.dateOfDistibution : null,
                                source_of_seed: data.sourceOfSeedSeedCompanyProducerAnyOtherSpecify ? data.sourceOfSeedSeedCompanyProducerAnyOtherSpecify : null
                            };
                            await Farm.update(farmData, {
                                where: { id: farm.id }
                            });

                            pass.push({
                                success: true,
                                data: farmer,
                                message: "Organic Farmer created"
                            });
                        } else {
                            const farmData = {
                                farmer_id: farmer.id,
                                program_id: program.id,
                                season_id: season.id,
                                agri_total_area: data.agriTotalArea ? data.agriTotalArea : 0.0,
                                agri_estimated_yeld: data.agriEstimatedYield ? data.agriEstimatedYield : 0.0,
                                agri_estimated_prod: data.agriEstimatedProd ? data.agriEstimatedProd : 0.0,
                                cotton_total_area: data.cottonTotalArea ? data.cottonTotalArea : 0.0,
                                total_estimated_cotton: data.totalEstimatedCotton ? data.totalEstimatedCotton : 0.0,
                                cluster: data.cluster ? data.cluster : null,
                                seed_packet_quantity: data.seedPacketQuantity ? data.seedPacketQuantity : null,
                                variety: data.variety ? data.variety : null,
                                lot_no: data.lotNo ? data.lotNo : null,
                                distribution_date: data.dateOfDistibution ? data.dateOfDistibution : null,
                                source_of_seed: data.sourceOfSeedSeedCompanyProducerAnyOtherSpecify ? data.sourceOfSeedSeedCompanyProducerAnyOtherSpecify : null
                            };
                            await Farm.create(farmData);

                            pass.push({
                                success: true,
                                data: farmer,
                                message: "Organic Farmer created"
                            });
                        }
                    } else {
                        const farmerdata = {
                            program_id: program.id,
                            brand_id: brand.id,
                            farmGroup_id: farmGroup.id,
                            firstName: data.firstName,
                            lastName: data.lastName,
                            code: data.farmerCode,
                            country_id: country.id,
                            state_id: state.id,
                            district_id: district.id,
                            block_id: block.id,
                            village_id: village.id,
                            joining_date: data.dateOfJoining ? new Date(data.dateOfJoining).toISOString() : null,
                            ics_id: ics ? ics.id : null,
                            tracenet_id: data.tracenetId ? data.tracenetId : null,
                            cert_status: data.certStatus ? data.certStatus : null,
                            cotton_total_area: data.cottonTotalArea ? data.cottonTotalArea : 0.0,
                            total_estimated_cotton: data.totalEstimatedCotton ? data.totalEstimatedCotton : 0.0,
                            agri_total_area: data.agriTotalArea ? data.agriTotalArea : 0.0,
                            agri_estimated_yeld: data.agriEstimatedYield ? data.agriEstimatedYield : 0.0,
                            agri_estimated_prod: data.agriEstimatedProd ? data.agriEstimatedProd : 0.0
                        };
                        const farmer = await Farmer.create(farmerdata);

                        const farmData = {
                            farmer_id: farmer.id,
                            program_id: program.id,
                            season_id: season.id,
                            agri_total_area: data.agriTotalArea ? data.agriTotalArea : 0.0,
                            agri_estimated_yeld: data.agriEstimatedYield ? data.agriEstimatedYield : 0.0,
                            agri_estimated_prod: data.agriEstimatedProd ? data.agriEstimatedProd : 0.0,
                            cotton_total_area: data.cottonTotalArea ? data.cottonTotalArea : 0.0,
                            total_estimated_cotton: data.totalEstimatedCotton ? data.totalEstimatedCotton : 0.0,
                            cluster: data.cluster ? data.cluster : null,
                            seed_packet_quantity: data.seedPacketQuantity ? data.seedPacketQuantity : null,
                            variety: data.variety ? data.variety : null,
                            lot_no: data.lotNo ? data.lotNo : null,
                            distribution_date: data.dateOfDistibution ? data.dateOfDistibution : null,
                            source_of_seed: data.sourceOfSeedSeedCompanyProducerAnyOtherSpecify ? data.sourceOfSeedSeedCompanyProducerAnyOtherSpecify : null
                        };
                        await Farm.create(farmData);

                        pass.push({
                            success: true,
                            data: farmer,
                            message: "Organic Farmer created"
                        });
                    }
                }
            }
        }

        res.sendSuccess(res, { pass, fail });
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
}

export {
    uploadGinnerOrder,
    uploadStyleMark,
    uploadGarmentType,
    uploadGinnerExpectedSeed,
    uploadVillage,
    uploadFarmer,
    uploadProcessorList,
    uploadProcurementPrice,
    uploadImpactData,
    uploadSeedAvailability,
    uploadSeedDemand,
    uploadSeedTestingAndLinkage,
    uploadIcsQuantityEstimation,
    uploadIcsName,
    uploadFarmGroupEvaluationData,
    uploadIntegrityTest,
    uploadOrganicFarmer
}
