import { Request, Response } from 'express';
import { Op } from 'sequelize';
import SpinnerPlaceLintOrder from '../../models/spinner-place-lint-order.model';
import Spinner from '../../models/spinner.model';
import Ginner from '../../models/ginner.model';
import SpinnerPlaceLintOrderSales from '../../models/spinner-place-lint-order-sales.model';
import GinSales from '../../models/gin-sales.model';

// Create a new lint order
export const createSpinnerPlaceLintOrder = async (req: Request, res: Response) => {
  try {
    const {
      spinnerId,
      ginnerId,
      quotationDate,
      dateCreatedOnTraceBale,
      quoteProcedureNo,
      ginnerContactPersonName,
      ginnerContactPersonNumber,
      ginnerMailId,
      ginnerAddress,
      orderMaterial,
      lintQuality,
      mic,
      uhml,
      mat,
      ui,
      strength,
      moisture,
      sfi,
      rdValue,
      totalLintQuantity,
      totalBales,
      pricePerCandy,
      dispatchWithinDays,
      tentativeDispatchDate,
      quotationValidTillDate,
      insuranceCoverageDetails,
      comments,
      insuranceDocument,
      otherDocument1,
      otherDocument2,
      orderDocumentPdfLink
    } = req.body;

    // Create the lint order
    const lintOrder = await SpinnerPlaceLintOrder.create({
      spinnerId,
      ginnerId,
      quotationDate,
      dateCreatedOnTraceBale,
      quoteProcedureNo,
      ginnerContactPersonName,
      ginnerContactPersonNumber,
      ginnerMailId,
      ginnerAddress,
      orderMaterial,
      lintQuality,
      mic,
      uhml,
      mat,
      ui,
      strength,
      moisture,
      sfi,
      rdValue,
      totalLintQuantity,
      totalBales,
      pricePerCandy,
      dispatchWithinDays,
      tentativeDispatchDate,
      quotationValidTillDate,
      insuranceCoverageDetails,
      comments,
      insuranceDocument,
      otherDocument1,
      otherDocument2,
      orderDocumentPdfLink,
      status: 'pending'
    });

    return res.sendSuccess(res, { 
      message: 'Lint order created successfully',
      data: lintOrder 
    });
  } catch (error: any) {
    console.error('Error creating lint order:', error);
    return res.sendError(res, error.message);
  }
};

// Get all lint orders with pagination
export const fetchSpinnerPlaceLintOrderPagination = async (req: Request, res: Response) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 0;
    const size = req.query.size ? parseInt(req.query.size as string) : 10;
    const search = req.query.search as string || '';
    const status = req.query.status as string;
    const spinnerId = req.query.spinnerId as string;
    const ginnerId = req.query.ginnerId as string;
    const brandId = req.query.brandId as string;
    const isSales = req.query.isSales as string;

    const limit = size;
    const offset = page * size;

    const whereClause: any = {};

    // Add search condition if provided
    if (search) {
      whereClause[Op.or] = [
        { quoteProcedureNo: { [Op.like]: `%${search}%` } },
        { traceableReelQuotationOrderNumber: { [Op.like]: `%${search}%` } },
        { lintQuality: { [Op.like]: `%${search}%` } }
      ];
    }

    // Add status filter if provided
    if (status) {
      whereClause.status = status;
    }

    // Add spinner filter if provided
    if (spinnerId) {
      whereClause.spinnerId = spinnerId;
    }

    // Add ginner filter if provided
    if (ginnerId) {
      whereClause.ginnerId = ginnerId;
    }
    
    // Create include array for the query
    const includeOptions = [
      {
        model: Spinner,
        as: 'spinner',
        attributes: ['id', 'name', 'email']
      },
      {
        model: Ginner,
        as: 'ginner',
        attributes: ['id', 'name', 'email', 'brand']
      }
    ];

    // If brandId is provided, add a separate where condition for ginners
    if (brandId) {
      // Find ginners associated with the brand
      const ginners = await Ginner.findAll({
        where: { brand: {
          [Op.contains]: [parseInt(brandId)]
        } },
        attributes: ['id']
      });
      
      // Extract ginner IDs
      const ginnerIds = ginners.map((g: any)=> g.id);
      
      // Add to the main where clause
      if (ginnerIds.length > 0) {
        whereClause.ginnerId = { [Op.in]: ginnerIds };
      } else {
        // If no ginners found for this brand, return empty result
        return res.sendSuccess(res, { 
          message: 'No ginners found for this brand',
          totalItems: 0,
          data: [],
          totalPages: 0,
          currentPage: page
        });
      }
    }

    // Update include options to include sales data
    if (isSales === 'true') {
      // Include detailed sales information with gin sales data when isSales is true
      includeOptions.push({
        model: SpinnerPlaceLintOrderSales,
        as: 'LintOrderSales',
        attributes: ['id', 'quantity_used', 'ginner_sale_id'],
        include: [{
          model: GinSales,
          as: 'ginSale',
          attributes: ['id', 'invoice_no', 'invoice_file']
        }]
      } as any);
    } else {
      // Only include basic sales information when isSales is not true
      includeOptions.push({
        model: SpinnerPlaceLintOrderSales,
        as: 'LintOrderSales',
        attributes: ['quantity_used']
      });
    }

    // Fetch data with pagination
    if (req.query.pagination === "true") {
      const { rows, count } = await SpinnerPlaceLintOrder.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: includeOptions,
        distinct: true
      });

      // Process the data to include used quantities
      const ordersWithUsedQuantity = rows.map((order: any) => {
        const orderData = order.toJSON();
        
        // Calculate total used quantity from sales
        const totalUsed = orderData.LintOrderSales?.reduce(
          (sum: number, sale: any) => sum + (sale.quantity_used || 0),
          0
        ) || 0;
        
        const totalQuantity = parseInt(orderData.totalLintQuantity);
        
        // Create the base result object
        const result: any = {
          ...orderData,
          totalUsedQuantity: totalUsed,
          remainingQuantity: totalQuantity - totalUsed
        };
        
        // Add sales information with invoice details only if isSales is true
        if (isSales === 'true') {
          result.salesWithInvoices = orderData.LintOrderSales?.map((sale: any) => ({
            id: sale.id,
            quantity_used: sale.quantity_used,
            ginner_sale_id: sale.ginner_sale_id,
            invoice_no: sale.ginSale?.invoice_no || '',
            invoice_file: sale.ginSale?.invoice_file || []
          })) || [];
        }
        
        return result;
      });

      return res.sendSuccess(res, { 
        message: 'Lint orders fetched successfully',
        totalItems: count,
        data: ordersWithUsedQuantity,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      });
    } else {
      // Fetch all data without pagination
      const data = await SpinnerPlaceLintOrder.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        include: includeOptions
      });

      // Process the data to include used quantities
      const ordersWithUsedQuantity = data.map((order: any) => {
        const orderData = order.toJSON();
        
        // Calculate total used quantity from sales
        const totalUsed = orderData.LintOrderSales?.reduce(
          (sum: number, sale: any) => sum + (sale.quantity_used || 0),
          0
        ) || 0;
        
        const totalQuantity = parseInt(orderData.totalLintQuantity);
        
        // Create the base result object
        const result: any = {
          ...orderData,
          totalUsedQuantity: totalUsed,
          remainingQuantity: totalQuantity - totalUsed
        };
        
        // Add sales information with invoice details only if isSales is true
        if (isSales === 'true') {
          result.salesWithInvoices = orderData.LintOrderSales?.map((sale: any) => ({
            id: sale.id,
            quantity_used: sale.quantity_used,
            ginner_sale_id: sale.ginner_sale_id,
            invoice_no: sale.ginSale?.invoice_no || '',
            invoice_file: sale.ginSale?.invoice_file || []
          })) || [];
        }
        
        return result;
      });

      return res.sendSuccess(res, { 
        message: 'Lint orders fetched successfully',
        data: ordersWithUsedQuantity
      });
    }
  } catch (error: any) {
    console.error('Error fetching lint orders:', error);
    return res.sendError(res, error.message);
  }
};

// Get a single lint order by ID
export const fetchSpinnerPlaceLintOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.sendError(res, 'Lint order ID is required');
    }

    const lintOrder = await SpinnerPlaceLintOrder.findByPk(Number(id), {
      include: [
        {
          model: Spinner,
          as: 'spinner',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Ginner,
          as: 'ginner',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!lintOrder) {
      return res.sendError(res, 'Lint order not found');
    }

    return res.sendSuccess(res, { 
      message: 'Lint order fetched successfully',
      data: lintOrder 
    });
  } catch (error: any) {
    console.error('Error fetching lint order:', error);
    return res.sendError(res, error.message);
  }
};

// Update lint order status (bulk)
export const updateSpinnerPlaceLintOrderStatus = async (req: Request, res: Response) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.sendError(res, 'Valid items array is required');
    }

    // Validate each item has id and status
    for (const item of items) {
      if (!item.id || !item.status) {
        return res.sendError(res, 'Each item must have id and status');
      }
    }

    const results = [];
    
    // Process each item in the array
    for (const item of items) {
      const lintOrder = await SpinnerPlaceLintOrder.findByPk(item.id);
      
      if (lintOrder) {
        // Update the status
        await lintOrder.update({ status: item.status });
        
        results.push({
          id: item.id,
          success: true,
          message: `Status updated to ${item.status}`
        });
      } else {
        results.push({
          id: item.id,
          success: false,
          message: 'Lint order not found'
        });
      }
    }

    return res.sendSuccess(res, { 
      message: 'Lint order statuses updated',
      results 
    });
  } catch (error: any) {
    console.error('Error updating lint order statuses:', error);
    return res.sendError(res, error.message);
  }
};
// Delete lint order
export const deleteSpinnerPlaceLintOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.sendError(res, 'Lint order ID is required');
    }

    const lintOrder = await SpinnerPlaceLintOrder.findByPk(Number(id));

    if (!lintOrder) {
      return res.sendError(res, 'Lint order not found');
    }

    // Soft delete the lint order
    await lintOrder.destroy();

    return res.sendSuccess(res, { 
      message: 'Lint order deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting lint order:', error);
    return res.sendError(res, error.message);
  }
};
