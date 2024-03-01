export const formatDataForGinnerProcess = (reelLotNo: any, data: any): any => {
    let treeData = {
        name: reelLotNo,
        type: 'cotton_image',
        width: 200,
        height: 100,
        isRoot: true,
        children: data.map((el: any) => {
            return {
                name: el.farm_name,
                type: 'farm',
                width: 200,
                height: 40,
                children: [
                    {
                        name: el.farm_name,
                        type: 'village_image',
                        width: 50,
                        height: 50,
                        children: [
                            {
                                name: 'Village',
                                type: 'village',
                                list: el.villages,
                                intro: `${el.villages.length > 1 ? 'Multiple' : 'Single'} Village${el.villages.length > 1 ? 's' : ''} Seed Cotton Consumption for REEL Bale Lot`,
                                width: 200,
                                height: el.villages.length * 40 + 60,
                            }
                        ]
                    }
                ]

            }
        })
    };

    return treeData;
}

const getVillagesForGinSales = (sales: any) => {
    let villages = new Set();
    sales.transaction.forEach((el: any) => {
        el = el.toJSON();
        villages.add(el.village.village_name);
    })
    return Array.from(villages);
}

export const formatDataForSpinnerProcess = (reelLotNo: any, data: any): any => {
    if (data.length == 0) return {
        name: reelLotNo,
        type: 'spinner_image',
        width: 200,
        height: 100,
        isRoot: true,
    };
    let treeData = {
        name: reelLotNo,
        type: 'spinner_image',
        width: 200,
        height: 100,
        isRoot: true,
        children: data[0].ginSales.map((el: any) => {
            return {
                name: el.ginner.name,
                type: 'farm',
                width: 200,
                height: 40,
                children: [
                    {
                        name: el.ginner.name,
                        type: 'cotton_image',
                        width: 200,
                        height: 100,
                        children: [
                            {
                                name: 'Ginner',
                                type: 'ginner',
                                list: el.reel_lot_no.split(',').map((el: any) => el.trim()),
                                intro: ``,
                                width: 200,
                                height: el.reel_lot_no.split(',').length * 40,
                                children: [
                                    {
                                        name: el.ginner.name,
                                        type: 'village_image',
                                        width: 50,
                                        height: 50,
                                        children: [
                                            {
                                                name: 'Village',
                                                type: 'village',
                                                list: getVillagesForGinSales(el),
                                                intro: `${getVillagesForGinSales(el).length > 1 ? 'Multiple' : 'Single'} Village${getVillagesForGinSales(el).length > 1 ? 's' : ''} Seed Cotton Consumption for REEL Bale Lot`,
                                                width: 200,
                                                height: getVillagesForGinSales(el).length * 40 + 60,
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        })
    };
    return treeData;
}