import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import LinenDetails from "../../models/linen-details.model";


const createLinenDetails = async (req: Request, res: Response) => {
    try {
        //create bulk linen from bulk upload

        const data = req.body.linen.map((obj: any) => {
            if(req.body.linen?.length > 0){
                return {
                    harvest: obj?.harvest,
                    farmer_no: obj?.farmerNo,
                    farmer_name: obj?.farmerName,
                    country: obj?.country,
                    town: obj?.town,
                    department: obj?.farmerDepartment,
                    area: obj?.area,
                    linen_variety: obj?.linenVariety,
                    cooperative_name: obj?.cooperativeName,
                    no_of_bales: obj?.noOfBales,
                    farm_lot_no: obj?.farmLotNo,
                    total_weight: obj?.totalWeight,
                    scutch_date: obj?.scutchDate,
                    scutching_lot_no: obj?.scutchingLotNo,
                    bales_after_scutching: obj?.balesAfterScutching,
                    weight_after_scutching: obj?.weightAfterScutching,
                    shipment_date: obj?.shipmentDate,
                    shipment_details: obj?.shipmentDetails,
                    shiped_to: obj?.shipedTo,
                    qty_stock: obj?.totalWeight,
                    program_id: obj?.program,
                    status: true,
                  };
            }
        })

        const linen = await LinenDetails.bulkCreate(data);
        res.sendSuccess(res, linen);
    } catch (error) {
        console.log(error)
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

const fetchlinenDetails = async (req: Request, res: Response) => {
    const searchTerm = req.query.search || '';
    // const sortOrder = req.query.sort || ''; 
    //   const sortField = req.query.sortBy || ''; 
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const whereCondition: any = {}

    const { harvest, country ,cooperative, linenVariety } = req.query;

    try {
        // apply filters
        if (harvest) {
            whereCondition.harvest = harvest;
        }
        if (country) {
            whereCondition.country = country;
        }
        if (cooperative) {
            whereCondition.cooperative_name = cooperative;
        }
        if (linenVariety) {
            whereCondition.linen_variety = linenVariety;
        }

         // apply search
        if (searchTerm) {
            whereCondition[Op.or] = [
                { department: { [Op.iLike]: `%${searchTerm}%` } }, 
                { cooperative_name: { [Op.iLike]: `%${searchTerm}%` } }, 
                { harvest: { [Op.iLike]: `%${searchTerm}%` } }, 
                { town: { [Op.iLike]: `%${searchTerm}%` } }, 
                { linen_variety: { [Op.iLike]: `%${searchTerm}%` } }, 
                { farmer_name: { [Op.iLike]: `%${searchTerm}%` } }, 
                { farmer_no: { [Op.iLike]: `%${searchTerm}%` } }, 
                { farm_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { shipment_details: { [Op.iLike]: `%${searchTerm}%` } },
                // { weight_after_scutching: { [Op.iLike]: `%${searchTerm}%` } },
                { scutching_lot_no: { [Op.iLike]: `%${searchTerm}%` } },
                { shiped_to: { [Op.iLike]: `%${searchTerm}%` } },
            ];
        }

        let queryOptions: any = {
            where: whereCondition,
        };

        // if (sortOrder === 'asc' || sortOrder === 'desc') {
        //     queryOptions.order = [['date', sortOrder]];
        // }
        
        // apply pagination
        if(req.query.pagination === 'true'){
            queryOptions.offset = offset;
            queryOptions.limit = limit;

            const { count, rows } = await LinenDetails.findAndCountAll(queryOptions);
            return res.sendPaginationSuccess(res, rows, count);
        }else{
             // fetch without filters
            const linen = await LinenDetails.findAll({
            });
            return res.sendSuccess(res, linen);
        }

    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

export {
    createLinenDetails,
    fetchlinenDetails,
    // updateLinen,
    // updateLinenStatus,
    // deleteLinen
};