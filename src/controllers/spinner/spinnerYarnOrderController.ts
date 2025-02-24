import { Request, Response } from "express";
import SpinnerYarnOrder from "../../models/spinner-yarn-order.model";
import YarnOrderProcess from "../../models/yarn-order-process.model";
import Weaver from "../../models/weaver.model";
import Knitter from "../../models/knitter.model";
import CottonMix from "../../models/cotton-mix.model";
import SpinnerYarnOrderSales from "../../models/spinner-yarn-order-sales.model";
import YarnCount from "../../models/yarn-count.model";

export const createSpinnerYarnOrder = async (req: Request, res: Response) => {
  try {
    const {
      date,
      buyerType,
      buyerOption,
      orderReceivedDate,
      expectedYarnDispatchDate,
      brandOrderRefNumber,
      fabricMillOrderRefNumber,
      dateFabricMillPlacedOrder,
      spinnerInternalOrderNumber,
      yarnBlend,
      yarnTypeSelect,
      yarnTypeOther,
      yarnCount,
      totalOrderQuantity,
      tentativeOrderCompletionDate,
      agentDetails,
      order_document,
      contract_files,
      other_files,
      processorName,
      processorAddress,
      spinnerId,
      buyer_option_type,
    } = req.body;

    // Create processor first if it's a new buyer
    let processId = null;
    if (buyerType === "New Buyer" && processorName && processorAddress) {
      const process = await YarnOrderProcess.create({
        name: processorName,
        address: processorAddress,
        spinnerId: spinnerId,
      });
      processId = process.id;
    }

    const yarnOrder = await SpinnerYarnOrder.create({
      date: new Date(date),
      spinnerId: spinnerId,
      buyerType,
      buyerOption:
        buyerType === "Mapped" && buyerOption ? buyerOption.value : null,
      buyer_option_type: buyerType === "Mapped" ? buyer_option_type : null,
      orderReceivedDate: new Date(orderReceivedDate),
      expectedYarnDispatchDate: new Date(expectedYarnDispatchDate),
      brandOrderRefNumber,
      fabricMillOrderRefNumber,
      dateFabricMillPlacedOrder: new Date(dateFabricMillPlacedOrder),
      spinnerInternalOrderNumber,
      yarnBlend: yarnBlend?.value,
      yarnTypeSelect,
      yarnTypeOther: yarnTypeSelect === "Other" ? yarnTypeOther : null,
      yarnCount: yarnCount?.value,
      totalOrderQuantity,
      tentativeOrderCompletionDate: new Date(tentativeOrderCompletionDate),
      agent_details: agentDetails,
      order_document,
      contract_files,
      other_files,
      processId,
      order_status: true,
    });

    return res.status(201).json({
      success: true,
      message: "Yarn order created successfully",
      data: yarnOrder,
    });
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

export const getSpinnerYarnOrders = async (req: Request, res: Response) => {
  try {
    const spinnerId = req.query.spinnerId;

    // Get base yarn orders
    const yarnOrders = await SpinnerYarnOrder.findAll({
      where: { spinnerId },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: SpinnerYarnOrderSales,
          as: 'YarnOrderSales',
          attributes: ['quantity_used']
        },
        {
          model: YarnOrderProcess,
          as: 'YarnOrderProcess',
          attributes: ['id', 'name', 'address']
        }
      ]
    });

    // Get all buyer and process IDs
    const mappedBuyers = yarnOrders
      .filter((order: any) => order.buyerType === "Mapped" && order.buyerOption)
      .map((order: any) => ({
        id: order.buyerOption,
        type: order.buyer_option_type
      }));

    const knitterIds = mappedBuyers
      .filter((buyer: any) => buyer.type === "kniter")
      .map((buyer: any) => buyer.id);

    const weaverIds = mappedBuyers
      .filter((buyer: any) => buyer.type === "weaver")
      .map((buyer: any) => buyer.id);

    const yarnBlendIds = yarnOrders
      .filter((order: any) => order.yarnBlend)
      .map((order: any) => order.yarnBlend);

    const processIds = yarnOrders
      .filter((order: any) => order.processId)
      .map((order: any) => order.processId);
    const yarnCountIds = yarnOrders
      .filter((order: any) => order.yarnCount)
      .map((order: any) => order.yarnCount);
    // Get buyers and processes data
    let weavers: any = [];
    let processes: any = [];
    let yarnBlends: any = [];
    let yarnCounts: any = [];

    // Fetch buyers based on their type
    if (knitterIds.length > 0) {
      const knitters = await Knitter.findAll({
        where: { id: knitterIds },
        attributes: ["id", "name"],
      });
      weavers.push(...knitters.map((a: any) => ({ id: a.id, name: a.name, type: 'kniter' })));
    }

    if (weaverIds.length > 0) {
      const weaversList = await Weaver.findAll({
        where: { id: weaverIds },
        attributes: ["id", "name"],
      });
      weavers.push(...weaversList.map((a: any) => ({ id: a.id, name: a.name, type: 'weaver' })));
    }

    if(yarnBlendIds.length > 0){  
      yarnBlends = await CottonMix.findAll({
        where: { id: yarnBlendIds },
        attributes: ["id", "cottonMix_name"],
      });
    }

    if (processIds.length > 0) {
      processes = await YarnOrderProcess.findAll({
        where: { id: processIds },
        attributes: ["id", "name"],
      });
    }

    if (yarnCountIds.length > 0) {
      yarnCounts = await YarnCount.findAll({
        where: { id: yarnCountIds },
        attributes: ["id", "yarnCount_name"],
      });
    }

    // Create lookup maps
    const weaverMap = new Map(weavers.map((w: any) => [w.id, w]));
    const processMap = new Map(processes.map((p: any) => [p.id, p]));
    const yarnBlendMap = new Map(yarnBlends.map((p: any) => [p.id, p]));
    const yarnCountMap = new Map(yarnCounts.map((y: any) => [y.id, y]));

    // Combine the data
    const enrichedYarnOrders = yarnOrders.map((order: any) => {
      const totalSales = order.YarnOrderSales?.reduce(
        (sum: number, sale: any) => sum + (sale.quantity_used || 0),
        0
      ) || 0;

      const availableQty = order.totalOrderQuantity - totalSales;

      return {
        ...order.toJSON(),
        Weaver:
          order.buyerType === "Mapped" && order.buyerOption
            ? weaverMap.get(order.buyerOption)
            : null,
        YarnOrderProcess: order.processId
          ? processMap.get(order.processId)
          : null,
        CottonMix: order.yarnBlend
          ? yarnBlendMap.get(order.yarnBlend)
          : null,
        YarnCount: order.yarnCount
          ? yarnCountMap.get(order.yarnCount)
          : null,
        availableQty,
        totalSales
      };
    });
    return res.status(200).json({
      success: true,
      data: enrichedYarnOrders,
    });
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

export const getSpinnerYarnOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const yarnOrder = await SpinnerYarnOrder.findByPk(id, {
      include: [
        "Spinner",
        "CottonMix",
        "YarnCount",
        "Weaver",
        "YarnOrderProcess",
        {
          model: SpinnerYarnOrderSales,
          as: 'YarnOrderSales',
          attributes: ['quantity_used']
        }
      ],
    });

    if (!yarnOrder) {
      return res.status(404).json({
        success: false,
        message: "Yarn order not found",
      });
    }

    if (yarnOrder) {
      const totalSales = yarnOrder.YarnOrderSales?.reduce(
        (sum: number, sale: any) => sum + (sale.quantity_used || 0),
        0
      ) || 0;

      const availableQty = yarnOrder.totalOrderQuantity - totalSales;

      return res.status(200).json({
        success: true,
        data: {
          ...yarnOrder.toJSON(),
          availableQty,
          totalSales
        },
      });
    }

    return res.status(404).json({
      success: false,
      message: "Yarn order not found",
    });
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

export const updateSpinnerYarnOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const yarnOrder = await SpinnerYarnOrder.findByPk(id);

    if (!yarnOrder) {
      return res.status(404).json({
        success: false,
        message: "Yarn order not found",
      });
    }

    await yarnOrder.update(req.body);
    return res.status(200).json({
      success: true,
      message: "Yarn order updated successfully",
      data: yarnOrder,
    });
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};

export const deleteSpinnerYarnOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const yarnOrder = await SpinnerYarnOrder.findByPk(id);

    if (!yarnOrder) {
      return res.status(404).json({
        success: false,
        message: "Yarn order not found",
      });
    }

    await yarnOrder.destroy();
    return res.status(200).json({
      success: true,
      message: "Yarn order deleted successfully",
    });
  } catch (error: any) {
    console.log(error);
    return res.sendError(res, error.message);
  }
};
