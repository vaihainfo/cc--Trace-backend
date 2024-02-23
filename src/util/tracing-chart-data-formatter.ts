export const formatDataForGinnerProcess = (reelLotNo: any, data: any): any => {
    let treeData = {
        name: reelLotNo,
        type: 'cotton_image',
        width: 200,
        height: 100,
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
                                intro: `${el.villages.length > 1 ? 'Multiple': 'Single'} Village${el.villages.length > 1 ? 's' : ''} Seed Cotton Consumption for REEL Bale Lot`,
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