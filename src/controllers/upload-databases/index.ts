import { Request, Response } from "express";
import { Sequelize, Op, where } from "sequelize";
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
import FarmerAgriArea from "../../models/farmer-agri-area.model";
import FarmerCottonArea from "../../models/farmer-cotton-area.model";
import Farm from "../../models/farm.model";
import { generateQrCode } from "../../provider/qrcode";

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
    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
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
    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
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
    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
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
    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
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
    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
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
            brand = await Brand.findOne({
                where: {
                    brand_name: req.body.brand
                }
            });

            if (!brand) {
                fail.push({
                    success: false,
                    message: "Brand not found"
                })
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
            farmGroup = await FarmGroup.findOne({
                where: {
                    name: req.body.farmGroup
                }
            });

            if (!farmGroup) {
                fail.push({
                    success: false,
                    message: "Farm Group not found"
                })
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
                return res.sendSuccess(res, { pass, fail });
            }
        }


        for await (const data of req.body.farmers) {
            if (!data.dateOfJoining) {
                fail.push({
                    success: false,
                    data: { farmerCode: data.farmerCode ? data.farmerCode : '', farmerName: data.firstName ? data.firstName : '' },
                    message: "Date of joining cannot be empty"
                });

            } else if (!data.firstName) {
                fail.push({
                    success: false,
                    data: { farmerCode: data.farmerCode ? data.farmerCode : '', farmerName: data.firstName ? data.firstName : '' },
                    message: "First Name cannot be empty"
                })
            } else if (!data.farmerCode) {
                fail.push({
                    success: false,
                    data: { farmerCode: data.farmerCode ? data.farmerCode : '', farmerName: data.firstName },
                    message: "Farmer Code cannot be empty"
                })
            } else if (!data.country) {
                fail.push({
                    success: false,
                    data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                    message: "Country cannot be empty"
                })
            } else if (!data.state) {
                fail.push({
                    success: false,
                    data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                    message: "Country cannot be empty"
                })
            } else if (!data.district) {
                fail.push({
                    success: false,
                    data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                    message: "Country cannot be empty"
                })
            } else if (!data.block) {
                fail.push({
                    success: false,
                    data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                    message: "Country cannot be empty"
                })
            } else if (!data.village) {
                fail.push({
                    success: false,
                    data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                    message: "Country cannot be empty"
                })
            } else if (program.program_name !== "Organic" && data.tracenetId) {
                fail.push({
                    success: false,
                    data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                    message: "Tracenet Id is only for Organic Program"
                })
            } else if (program.program_name !== "Organic" && data.icsName) {
                fail.push({
                    success: false,
                    data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                    message: "ICS name is only for Organic Program"
                })
            } else if (program.program_name !== "Organic" && data.certStatus) {
                fail.push({
                    success: false,
                    data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                    message: "Cert Status is only for Organic Program"
                })
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
                        })
                    } else {
                        if (data.state) {
                            state = await State.findOne({
                                where: {
                                    state_name: data.state
                                }
                            });
                            if (!state) {
                                fail.push({
                                    success: false,
                                    data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                                    message: "State not found"
                                })
                            } else {
                                if (data.district) {
                                    district = await District.findOne({
                                        where: {
                                            district_name: data.district
                                        }
                                    });

                                    if (!district) {
                                        fail.push({
                                            success: false,
                                            data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                                            message: "District not found"
                                        })
                                    } else {

                                        if (data.block) {
                                            block = await Block.findOne({
                                                where: {
                                                    block_name: data.block
                                                }
                                            });

                                            if (!block) {
                                                fail.push({
                                                    success: false,
                                                    data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                                                    message: "Block not found"
                                                })
                                            } else {
                                                if (data.village) {
                                                    village = await Village.findOne({
                                                        where: {
                                                            village_name: data.village
                                                        }
                                                    });

                                                    if (!village) {
                                                        fail.push({
                                                            success: false,
                                                            data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                                                            message: "Village not found"
                                                        })
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
                        })
                    }
                }

                if (country && state && district && block && village) {
                    let farmers = await Farmer.findOne({ where: { code: data.farmerCode } });

                    if (farmers) {
                        fail.push({
                            success: false,
                            data: { farmerCode: data.farmerCode, farmerName: data.firstName },
                            message: "Farmer with same farmer code is already exists"
                        })
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
                            cert_status: data.certStatus ? data.certStatus : null
                        };
                        const farmer = await Farmer.create(farmerdata);

                        const farmerAgriArea = await FarmerAgriArea.create({
                            farmer_id: farmer.id,
                            agri_total_area: data.agriTotalArea ? data.agriTotalArea : 0.0,
                            agri_estimated_yeld: data.agriEstimatedYield ? data.agriEstimatedYield : 0.0,
                            agri_estimated_prod: data.agriEstimatedProd ? data.agriEstimatedProd : 0.0
                        })
                        const farmerCottonArea = await FarmerCottonArea.create({
                            farmer_id: farmer.id,
                            cotton_total_area: data.cottonTotalArea ? data.cottonTotalArea : 0.0,
                            total_estimated_cotton: data.totalEstimatedCotton ? data.totalEstimatedCotton : 0.0,
                        })

                        const farmData = {
                            farmer_id: farmer.id,
                            program_id: program.id,
                            season_id: season.id,
                            cotton_id: farmerCottonArea.id,
                            agri_id: farmerAgriArea.id,
                            agri_total_area: String(data.agriTotalArea ? data.agriTotalArea : 0.0),
                            cotton_total_area: String(data.cottonTotalArea ? data.cottonTotalArea : 0.0)
                        };
                        const farm = await Farm.create(farmData);
                        let uniqueFilename = `qrcode_${Date.now()}.png`;
                        let name = farmer.firstName + " " + farmer.lastName
                        let data12 = await generateQrCode(`Farmer Code : ${farmer.code}  Farmer Id: ${farmer.id}`,
                            name, uniqueFilename, farmer.code, village.village_name);
                        const farmerP = await Farmer.update({ qrUrl: uniqueFilename }, {
                            where: {
                                id: farmer.id
                            },
                        });
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
    } catch (error) {
        console.log(error);
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}
export {
    uploadGinnerOrder,
    uploadStyleMark,
    uploadGarmentType,
    uploadGinnerExpectedSeed,
    uploadVillage,
    uploadFarmer
}