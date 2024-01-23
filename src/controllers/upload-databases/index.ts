import { Request, Response } from "express";
import { Sequelize, Op, where, JSON } from "sequelize";
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
import { generateQrCode } from "../../provider/qrcode";
import ProcessorList from "../../models/processor-list.model";
import Transaction from "../../models/transaction.model";
import { saveFailedRecord } from "../failed-records";

const uploadGinnerOrder = async (req: Request, res: Response) => {
    try {
        let fail = [];
        let pass = []
        for await (const data of req.body.ginnerOrder) {
            console.log(data);

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
                    message: "Program cannot be empty"
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
                            message: "Program not found"
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
            console.log(data);
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
                    message: "Program cannot be empty"
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
                            message: "Program not found"
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
                let village = await Village.findOne({ where: { block_id: req.body.blockId, village_name: data.village } })
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
                message: "Program cannot be empty"
            });
            let failedRecord = {
                type: 'Farmer',
                season: '',
                farmerCode: '',
                farmerName: '',
                body: {},
                reason: "Program cannot be empty"
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
                    message: "Program not found"
                })
                let failedRecord = {
                    type: 'Farmer',
                    season: '',
                    farmerCode: '',
                    farmerName: '',
                    body: {},
                    reason: "Program not found"
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
                    name: req.body.farmGroup
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
                    message: "Tracenet Id is only for Organic Program"
                });
                let failedRecord = {
                    type: 'Farmer',
                    season: season,
                    farmerCode: data.farmerCode ? data.farmerCode : '',
                    farmerName: data.firstName ? data.firstName : '',
                    body: { ...data },
                    reason: "Tracenet Id is only for Organic Program"
                }
                saveFailedRecord(failedRecord)
            } else if (program.program_name !== "Organic" && data.icsName) {
                fail.push({
                    success: false,
                    data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                    message: "ICS name is only for Organic Program"
                })
                let failedRecord = {
                    type: 'Farmer',
                    season: season,
                    farmerCode: data.farmerCode ? data.farmerCode : '',
                    farmerName: data.firstName ? data.firstName : '',
                    body: { ...data },
                    reason: "ICS name is only for Organic Program"
                }
                saveFailedRecord(failedRecord)
            } else if (program.program_name !== "Organic" && data.certStatus) {
                fail.push({
                    success: false,
                    data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                    message: "Cert Status is only for Organic Program"
                })
                let failedRecord = {
                    type: 'Farmer',
                    season: season,
                    farmerCode: data.farmerCode ? data.farmerCode : '',
                    farmerName: data.firstName ? data.firstName : '',
                    body: { ...data },
                    reason: "Cert Status is only for Organic Program"
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
                                                            village_name: data.village
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
                        const farm = await Farm.findOne({ where: { farmer_id: farmers.id, season_id: season.id } });
                        if (farm) {
                            fail.push({
                                success: false,
                                data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                                message: "Farmer with same farmer code and season is already exists"
                            })
                            let failedRecord = {
                                type: 'Farmer',
                                season: season,
                                farmerCode: data.farmerCode ? data.farmerCode : '',
                                farmerName: data.firstName ? data.firstName : '',
                                body: { ...data },
                                reason: "Farmer with same farmer code and season is already exists"
                            }
                            saveFailedRecord(failedRecord)
                        } else {
                            const farmData = {
                                farmer_id: farmers.id,
                                program_id: program.id,
                                season_id: season.id,
                                agri_total_area: data.agriTotalArea ? data.agriTotalArea : 0.0,
                                agri_estimated_yeld: data.agriEstimatedYield ? data.agriEstimatedYield : 0.0,
                                agri_estimated_prod: data.agriEstimatedProd ? data.agriEstimatedProd : 0.0,
                                cotton_total_area: data.cottonTotalArea ? data.cottonTotalArea : 0.0,
                                total_estimated_cotton: data.totalEstimatedCotton ? data.totalEstimatedCotton : 0.0
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
                            joining_date: new Date(data.dateOfJoining).toISOString(),
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
                            total_estimated_cotton: data.totalEstimatedCotton ? data.totalEstimatedCotton : 0.0
                        };
                        const farm = await Farm.create(farmData);
                        // let uniqueFilename = `qrcode_${Date.now()}.png`;
                        // let name = farmer.firstName + " " + farmer.lastName
                        // let data12 = await generateQrCode(`Farmer Code : ${farmer.code}  Farmer Id: ${farmer.id}`,
                        //     name, uniqueFilename, farmer.code, village.village_name);
                        // const farmerP = await Farmer.update({ qrUrl: uniqueFilename }, {
                        //     where: {
                        //         id: farmer.id
                        //     },
                        // });
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

export {
    uploadGinnerOrder,
    uploadStyleMark,
    uploadGarmentType,
    uploadGinnerExpectedSeed,
    uploadVillage,
    uploadFarmer,
    uploadProcessorList,
    uploadProcurementPrice
}
