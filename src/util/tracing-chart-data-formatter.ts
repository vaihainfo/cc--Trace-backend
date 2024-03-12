export const formatDataForGinnerProcess = (reelLotNo: any, data: any): any => {
    let treeData = {
        name: reelLotNo,
        type: 'cotton_image',
        width: 300,
        height: 100,
        isRoot: true,
        children: data.map((el: any) => {
            return {
                name: el.farm_name,
                type: 'farm',
                width: 300,
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
                                width: 300,
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
        width: 300,
        height: 100,
        isRoot: true,
    };

    const groupData: any = {

    };

    data[0].ginSales.forEach((el: any) => {
        const ginner_name = el.ginner.name;
        const reel = el.reel_lot_no.split(',').map((el: any) => el.trim());
        const villages = getVillagesForGinSales(el);
        if (!groupData[ginner_name]) {
            groupData[ginner_name] = {
                ginner_name,
                reels: [],
                villages: []
            }
        };
        reel.forEach((el:any) => {
            if (!groupData[ginner_name].reels.includes(el)) {
                groupData[ginner_name].reels.push(el)
            }
        })

        villages.forEach((el:any) => {
            if (!groupData[ginner_name].villages.includes(el)) {
                groupData[ginner_name].villages.push(el)
            }
        })
    });

    // console.log(groupData);

    let treeData = {
        name: reelLotNo,
        type: 'spinner_image',
        width: 300,
        height: 100,
        isRoot: true,
        groupData,
        children: Object.keys(groupData).map((el: any) => {
            return {
                name: el,
                type: 'farm',
                width: 300,
                height: 40,
                children: [
                    {
                        name: el,
                        type: 'cotton_image',
                        width: 50,
                        height: 50,
                        children: [
                            {
                                name: 'Ginner',
                                type: 'ginner',
                                list: groupData[el].reels,
                                intro: ``,
                                width: 300,
                                height: groupData[el].reels.length * 20 + 20,
                                children: [
                                    {
                                        name: el,
                                        type: 'village_image',
                                        width: 50,
                                        height: 50,
                                        children: [
                                            {
                                                name: 'Village',
                                                type: 'village',
                                                list: groupData[el].villages,
                                                intro: `${groupData[el].villages.length > 1 ? 'Multiple' : 'Single'} Village${groupData[el].villages.length > 1 ? 's' : ''} Seed Cotton Consumption for REEL Bale Lot`,
                                                width: 300,
                                                height: groupData[el].villages.length * 20 + 60,
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

export const formatDataFromKnitter = (title: any, data: any) : any => {
    let treeData = {
        name: title,
        type: 'knitter_image',
        width: 300,
        height: 100,
        isRoot: true,
        children: data[0].spin.filter((el: any) => el.children)
    };
    return treeData;
}


export const formatDataFromWeaver = (title: any, data: any) : any => {
    let treeData = {
        name: title,
        type: 'weaver_image',
        width: 300,
        height: 100,
        isRoot: true,
        children: data[0].spin.filter((el: any) => el.children)
    };
    return treeData;
}

export const formartDataForFabric = (title: any, data: any) : any => {
    let treeData = {
        name: title,
        type: 'fabric_image',
        width: 300,
        height: 100,
        isRoot: true,
        children: data.filter((el: any) => el.weavKnit.length > 0).map((el: any) => el.weavKnitChart)
    };
    return treeData;
}

export const formatDataForGarment = (title: any, data: any) : any => {
    let treeData = {
        name: title,
        type: 'garment_image',
        width: 300,
        height: 100,
        isRoot: true,
        children: data.map((el:any) => el.fabricChart)
    };
    return treeData;
}