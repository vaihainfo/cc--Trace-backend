export const formatDataForGinnerProcess = (reelLotNo: any, data: any): any => {
    let treeData = {
        name: reelLotNo,
        processor_name: data.gnr_name,
        img_type: 'cotton_image',
        type: 'Ginner',
        width: 300,
        height: 100,
        isRoot: true,
        children: data?.transaction && data.transaction.map((el: any) => {
            return {
                name: el.farm_name,
                processor_name: el.farm_name,
                img_type: 'farm',
                type: 'Farm',
                width: 300,
                height: 100,
                // children: [
                //     {
                //         name: el.farm_name,
                //         type: 'village_image',
                //         width: 50,
                //         height: 50,
                //         children: [
                //             {
                //                 name: 'Village',
                //                 type: 'village',
                //                 list: el.villages,
                //                 intro: `${el.villages.length > 1 ? 'Multiple' : 'Single'} Village${el.villages.length > 1 ? 's' : ''} Seed Cotton Consumption for REEL Bale Lot`,
                //                 width: 300,
                //                 height: el.villages.length * 40 + 60,
                //             }
                //         ]
                //     }
                // ]

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
   let flattenedArray = data[0].ginSales.flat(); // Using flat()
    let treeData = {
        name: reelLotNo,
        processor_name: data[0]?.spinner?.name,
        img_type: 'spinner_image',
        type: 'Spinner',
        width: 300,
        height: 100,
        isRoot: true,
        children: flattenedArray? flattenedArray.filter((el: any) =>{
            if(el && el){
                return el
            }
        }) : []
    };
    return treeData;
    // const groupData: any = {

    // };

    // data[0].ginSales[0].forEach((el: any) => {
    //     const ginner_name = el.ginner.name;
    //     const reel = el.reel_lot_no?.split(',').map((el: any) => el.trim());
    //     const villages = getVillagesForGinSales(el);
    //     if (!groupData[ginner_name]) {
    //         groupData[ginner_name] = {
    //             ginner_name,
    //             reels: [],
    //             villages: []
    //         }
    //     };
    //     reel?.forEach((el:any) => {
    //         if (!groupData[ginner_name].reels.includes(el)) {
    //             groupData[ginner_name].reels.push(el)
    //         }
    //     })

    //     villages?.forEach((el:any) => {
    //         if (!groupData[ginner_name].villages.includes(el)) {
    //             groupData[ginner_name].villages.push(el)
    //         }
    //     })
    // });

    // // console.log(groupData);

    // let treeData = {
    //     name: reelLotNo,
    //     type: 'spinner_image',
    //     width: 300,
    //     height: 100,
    //     isRoot: true,
    //     groupData,
    //     children: Object.keys(groupData).map((el: any) => {
    //         return {
    //             name: el,
    //             type: 'farm',
    //             width: 300,
    //             height: 40,
    //             children: [
    //                 {
    //                     name: el,
    //                     type: 'cotton_image',
    //                     width: 50,
    //                     height: 50,
    //                     children: [
    //                         {
    //                             name: 'Ginner',
    //                             type: 'ginner',
    //                             list: groupData[el].reels,
    //                             intro: ``,
    //                             width: 300,
    //                             height: groupData[el].reels.length * 20 + 20,
    //                             children: [
    //                                 {
    //                                     name: el,
    //                                     type: 'village_image',
    //                                     width: 50,
    //                                     height: 50,
    //                                     children: [
    //                                         {
    //                                             name: 'Village',
    //                                             type: 'village',
    //                                             list: groupData[el].villages,
    //                                             intro: `${groupData[el].villages.length > 1 ? 'Multiple' : 'Single'} Village${groupData[el].villages.length > 1 ? 's' : ''} Seed Cotton Consumption for REEL Bale Lot`,
    //                                             width: 300,
    //                                             height: groupData[el].villages.length * 20 + 60,
    //                                         }
    //                                     ]
    //                                 }
    //                             ]
    //                         }
    //                     ]
    //                 }
    //             ]
    //         }
    //     })
    // };
    // return treeData;
}

export const formatDataFromKnitter = (title: any, data: any, width: number = 300, height: number =100,type?: any) : any => {
    let flattenedArray;
    let name;
    let processorName = "";
    if(type=='fabric'){
      flattenedArray = data?.spin?.flat();
      name=title
      processorName=data?.knitter?.name
    }else{
      flattenedArray = data[0]?.spin?.flat();
      name=data[0]?.reel_lot_no
      processorName=data[0]?.knitter?.name
    }
     let treeData = {
         name: name,
         processor_name: processorName,
         img_type: 'knitter_image',
         type: 'Knitter',
         width: width,
         height: height,
         isRoot: true,
         children: flattenedArray? flattenedArray.filter((el: any) =>{
             if(el && el.children){
                 return el.children
             }
         }) : []
     };
     return treeData;
 }
 
 
 export const formatDataFromWeaver = (title: any, data: any, width: number = 300, height: number =100,type?: any) : any => {

    let flattenedArray;
    let processorName = "";
    if (data?.spin) {
        flattenedArray = data.spin.flat();
        processorName=data?.weav_name
    } else if (data[0]?.spin) {
        flattenedArray = data[0].spin.flat();
        processorName=data[0]?.weav_name
    } else {
        flattenedArray = [];
    }

    let treeData = {
         name: title,
         processor_name: processorName,
         img_type: 'weaver_image',
         type: 'Weaver',
         width: width,
         height: height,
         isRoot: true,
         children: flattenedArray? flattenedArray.filter((el: any) =>{
            
            if(el && el.children){
                return el.children
            }
        }) : []
     };
     return treeData;
 }
 
 export const formartDataForFabric = (title: any, data: any, width: number = 300, height: number =100) : any => {
     let treeData = {
         name: title,
         processor_name: data[0] ? data[0].fabric_name : "",
         img_type: 'fabric_image',
         type: 'Fabric',
         width: width,
         height: height,
         isRoot: true,
         children: data[0] ? data[0].weavKnitChart : []
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
        children: data?.map((el:any) => el.fabricChart??[])
    };
    return treeData;
}

//Forawrd Chaining

export const formatForwardChainDataGinner = (title: any, data: any) : any => {
    let treeData = {
        name: `<div><b>${data.gnr_name}</b><br/>${title}<div>`,
        processor_name: data.gnr_name,
        img_type: 'cotton_image',
        type: 'Ginner',
        width: 300,
        height: 100,
        isRoot: true,
        children: data?.spin?.map((el:any) => el??[])
    };
    return treeData;
}

export const formatForwardChainDataSpinner = (title: any, data: any) : any => {
    let treeData = {
        name: `<div><b>${data?.spinner?.name}</b><br/>${data?.reel_lot_no}<div>`,
        processor_name: data?.spinner?.name,
        img_type: 'spinner_image',
        type: 'Spinner',
        width: 300,
        height: 100,
        isRoot: true,
        children: data?.weavKnitChart?.map((el:any) => el??[])
        // children: []
    };
    return treeData;
}

export const formatForwardChainDataKnitter = (title: any, data: any) : any => {
    let treeData = {
        name: `<div><b>${data?.knitter?.name}</b><br/>${data?.reel_lot_no}<div>`,
        processor_name: data?.knitter?.name,
        img_type: 'knitter_image',
        type: 'Knitter',
        width: 300,
        height: 100,
        isRoot: true,
        children: data?.garmentChart?.map((el:any) => el??[])
    };
    return treeData;
}

export const formatForwardChainDataWeaver = (title: any, data: any) : any => {
    let treeData = {
        name: `<div><b>${data?.weaver?.name}</b><br/>${data?.reel_lot_no}<div>`,
        processor_name: data?.weaver?.name,
        img_type: 'weaver_image',
        type: 'Weaver',
        width: 300,
        height: 100,
        isRoot: true,
        children: data?.garmentChart?.map((el:any) => el??[])
    };
    return treeData;
}


export const formatForwardChainDataFabric = (title: any, data: any) : any => {
    let treeData = {
        name: data?.fabric_name,
        processor_name: data?.fabric_name,
        img_type: 'fabric_image',
        type: 'Fabric',
        width: 300,
        height: 100,
        isRoot: true,
        children: data?.garmentChart?.map((el:any) => el??[])
    };
    return treeData;
}


export const formatForwardChainDataGarment = (reelLotNo: any, data: any): any => {
    let treeData = {
        name: `<div><b>${data?.garment_name}</b><br/>${reelLotNo}<div>`,
        processor_name: data.garment_name,
        img_type: 'garment_image',
        type: 'Garment',
        width: 300,
        height: 100,
        isRoot: true,
        children: data?.brands && data.brands.map((el: any) => {
            return {
                name: el.brand_name,
                processor_name: el.brand_name,
                img_type: 'brand',
                type: 'Brand',
                width: 300,
                height: 100,
            }
        })
    };

    return treeData;
}

