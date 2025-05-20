import { Request, Response } from 'express';
import { Op, Sequelize } from 'sequelize';
import sequelize from '../../util/dbConn';
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
      spinner_status: 'pending',
      ginner_status: 'pending',
      brand_status: 'pending'
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
    const page = req.query.page ? parseInt(req.query.page as string) - 1 : 0;
    const size = req.query.size ? parseInt(req.query.size as string) : 10;
    const search = req.query.search as string || '';
    const spinnerStatus = req.query.spinnerStatus as string;
    const ginnerStatus = req.query.ginnerStatus as string;
    const brandStatus = req.query.brandStatus as string;
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

    // Add status filters if provided
    if (spinnerStatus) {
      whereClause.spinner_status = spinnerStatus;
    }

    if (ginnerStatus) {
      whereClause.ginner_status = ginnerStatus;
    }

    if (brandStatus) {
      whereClause.brand_status = brandStatus;
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
      console.log(rows, whereClause, limit, offset)
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

    // Validate each item has id and at least one status type
    for (const item of items) {
      if (!item.id || !(item.spinnerStatus || item.ginnerStatus || item.brandStatus)) {
        return res.sendError(res, 'Each item must have id and at least one status type (spinnerStatus, ginnerStatus, or brandStatus)');
      }
    }

    const results = [];
    
    // Process each item in the array
    for (const item of items) {
      const lintOrder = await SpinnerPlaceLintOrder.findByPk(item.id);
      
      if (lintOrder) {
        const updateData: any = {};
        const statusUpdates = [];
        
        // Add spinner status if provided
        if (item.spinnerStatus) {
          updateData.spinner_status = item.spinnerStatus;
          updateData.spinner_status_updated_at = new Date();
          statusUpdates.push(`spinner status to ${item.spinnerStatus}`);
        }
        
        // Add ginner status if provided
        if (item.ginnerStatus) {
          updateData.ginner_status = item.ginnerStatus;
          updateData.ginner_status_updated_at = new Date();
          statusUpdates.push(`ginner status to ${item.ginnerStatus}`);
        }
        
        // Add brand status if provided
        if (item.brandStatus) {
          updateData.brand_status = item.brandStatus;
          updateData.brand_status_updated_at = new Date();
          statusUpdates.push(`brand status to ${item.brandStatus}`);
        }
        
        // Update the status fields
        await lintOrder.update(updateData);
        
        results.push({
          id: item.id,
          success: true,
          message: `Updated ${statusUpdates.join(', ')}`
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

// Get ginner chart data for lint orders by financial year with MT and Bales metrics
export const getGinnerPlaceLintChartData = async (req: Request, res: Response) => {
  try {
    // Get current date and calculate financial years (April to March)
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Determine the current financial year
    // If current month is January to March (0-2), we're in the previous year's financial year
    // Otherwise, we're in the current year's financial year
    const currentFinancialYearStart = currentMonth < 3 ? currentYear - 1 : currentYear;
    
    // Get the last 3 financial years
    const financialYearStarts = [
      currentFinancialYearStart - 2,
      currentFinancialYearStart - 1,
      currentFinancialYearStart
    ];
    
    // Create financial year labels (e.g., "2023-2024")
    const financialYearLabels = financialYearStarts.map(year => `${year}-${year + 1}`);
    
    // Prepare result structure
    const result = {
      years: financialYearLabels,
      received: {
        mt: [] as number[],
        bales: [] as number[]
      },
      completed: {
        mt: [] as number[],
        bales: [] as number[]
      },
      pending: {
        mt: [] as number[],
        bales: [] as number[]
      },
      statusBreakdown: {
        approved: [] as number[],
        rejected: [] as number[],
        pending: [] as number[],
        completed: [] as number[],
        cancelled: [] as number[],
        // Add any other statuses you need to track
      }
    };
    
    // Process data for each financial year
    for (const yearStart of financialYearStarts) {
      // Financial year runs from April 1st to March 31st of the next year
      const startDate = new Date(yearStart, 3, 1); // April 1st of the start year
      const endDate = new Date(yearStart + 1, 3, 0); // March 31st of the end year
      
      // Get all orders for this financial year
      const yearOrders = await SpinnerPlaceLintOrder.findAll({
        where: {
          quotationDate: {
            [Op.gte]: startDate,
            [Op.lte]: endDate
          }
        },
        attributes: [
          'id', 
          'totalLintQuantity', 
          'totalBales', 
          'ginner_status'
        ]
      });
      
      // Calculate metrics
      let totalMT = 0;
      let totalBales = 0;
      let completedMT = 0;
      let completedBales = 0;
      let pendingMT = 0;
      let pendingBales = 0;
      
      // Initialize status counters
      let statusCounts: Record<string, number> = {
        approved: 0,
        rejected: 0,
        pending: 0,
        completed: 0,
        cancelled: 0,
        // Add any other statuses you need to track
      };
      
      yearOrders.forEach((order: any) => {
        const orderData = order.toJSON();
        const lintQuantity = parseFloat(orderData.totalLintQuantity) || 0;
        const bales = parseInt(orderData.totalBales) || 0;
        const status = orderData.ginner_status || 'pending';
        
        // Add to total counts
        totalMT += lintQuantity;
        totalBales += bales;
        
        // Process by status
        if (status === 'completed') {
          completedMT += lintQuantity;
          completedBales += bales;
        } else {
          pendingMT += lintQuantity;
          pendingBales += bales;
        }
        
        // Increment status counter
        if (statusCounts.hasOwnProperty(status)) {
          statusCounts[status]++;
        }
      });
      
      // Add calculated metrics to result
      result.received.mt.push(parseFloat(totalMT.toFixed(2)));
      result.received.bales.push(totalBales);
      result.completed.mt.push(parseFloat(completedMT.toFixed(2)));
      result.completed.bales.push(completedBales);
      result.pending.mt.push(parseFloat(pendingMT.toFixed(2)));
      result.pending.bales.push(pendingBales);
      
      // Add status breakdown
      for (const [status, count] of Object.entries(statusCounts)) {
        if (result.statusBreakdown.hasOwnProperty(status)) {
          (result.statusBreakdown as any)[status].push(count);
        }
      }
    }
    
    return res.sendSuccess(res, result);
  } catch (error: any) {
    console.error('Error fetching ginner chart data:', error);
    return res.sendError(res, error.message);
  }
};

// Get spinner chart data for lint orders by financial year with MT and Bales metrics
export const getSpinnerPlaceLintChartData = async (req: Request, res: Response) => {
  try {
    // Get current date and calculate financial years (April to March)
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Determine the current financial year
    // If current month is January to March (0-2), we're in the previous year's financial year
    // Otherwise, we're in the current year's financial year
    const currentFinancialYearStart = currentMonth < 3 ? currentYear - 1 : currentYear;
    
    // Get the last 3 financial years
    const financialYearStarts = [
      currentFinancialYearStart - 2,
      currentFinancialYearStart - 1,
      currentFinancialYearStart
    ];
    
    // Create financial year labels (e.g., "2023-2024")
    const financialYearLabels = financialYearStarts.map(year => `${year}-${year + 1}`);
    
    // Prepare result structure
    const result = {
      years: financialYearLabels,
      received: {
        mt: [] as number[],
        bales: [] as number[]
      },
      completed: {
        mt: [] as number[],
        bales: [] as number[]
      },
      pending: {
        mt: [] as number[],
        bales: [] as number[]
      },
      statusBreakdown: {
        approved: [] as number[],
        rejected: [] as number[],
        pending: [] as number[],
        completed: [] as number[],
        cancelled: [] as number[],
        // Add any other statuses you need to track
      }
    };
    
    // Process data for each financial year
    for (const yearStart of financialYearStarts) {
      // Financial year runs from April 1st to March 31st of the next year
      const startDate = new Date(yearStart, 3, 1); // April 1st of the start year
      const endDate = new Date(yearStart + 1, 3, 0); // March 31st of the end year
      
      // Get all orders for this financial year
      const yearOrders = await SpinnerPlaceLintOrder.findAll({
        where: {
          quotationDate: {
            [Op.gte]: startDate,
            [Op.lte]: endDate
          }
        },
        attributes: [
          'id', 
          'totalLintQuantity', 
          'totalBales', 
          'spinner_status'
        ]
      });
      
      // Calculate metrics
      let totalMT = 0;
      let totalBales = 0;
      let completedMT = 0;
      let completedBales = 0;
      let pendingMT = 0;
      let pendingBales = 0;
      
      // Initialize status counters
      let statusCounts: Record<string, number> = {
        approved: 0,
        rejected: 0,
        pending: 0,
        completed: 0,
        cancelled: 0,
        // Add any other statuses you need to track
      };
      
      yearOrders.forEach((order: any) => {
        const orderData = order.toJSON();
        const lintQuantity = parseFloat(orderData.totalLintQuantity) || 0;
        const bales = parseInt(orderData.totalBales) || 0;
        const status = orderData.spinner_status || 'pending';
        
        // Add to total counts
        totalMT += lintQuantity;
        totalBales += bales;
        
        // Process by status
        if (status === 'completed') {
          completedMT += lintQuantity;
          completedBales += bales;
        } else {
          pendingMT += lintQuantity;
          pendingBales += bales;
        }
        
        // Increment status counter
        if (statusCounts.hasOwnProperty(status)) {
          statusCounts[status]++;
        }
      });
      
      // Add calculated metrics to result
      result.received.mt.push(parseFloat(totalMT.toFixed(2)));
      result.received.bales.push(totalBales);
      result.completed.mt.push(parseFloat(completedMT.toFixed(2)));
      result.completed.bales.push(completedBales);
      result.pending.mt.push(parseFloat(pendingMT.toFixed(2)));
      result.pending.bales.push(pendingBales);
      
      // Add status breakdown
      for (const [status, count] of Object.entries(statusCounts)) {
        if (result.statusBreakdown.hasOwnProperty(status)) {
          (result.statusBreakdown as any)[status].push(count);
        }
      }
    }
    
    return res.sendSuccess(res, result);
  } catch (error: any) {
    console.error('Error fetching spinner chart data:', error);
    return res.sendError(res, error.message);
  }
};
