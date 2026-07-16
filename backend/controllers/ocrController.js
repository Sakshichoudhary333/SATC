import { logger } from '../utils/logger.js';

// Realistic receipt text patterns to simulate OCR scanning
const PRESET_SCANS = {
  fuel: {
    fuelCost: 4500,
    tollCost: 0,
    foodCost: 0,
    maintenanceCost: 0,
    notes: 'Auto-scanned: Indian Oil fuel receipt - 45 Liters @ ₹100/L',
  },
  toll: {
    fuelCost: 0,
    tollCost: 850,
    foodCost: 0,
    maintenanceCost: 0,
    notes: 'Auto-scanned: National Highways Authority (NHAI) toll charge',
  },
  food: {
    fuelCost: 0,
    tollCost: 0,
    foodCost: 350,
    maintenanceCost: 0,
    notes: 'Auto-scanned: Highway Plaza dhaba bill',
  },
  maintenance: {
    fuelCost: 0,
    tollCost: 0,
    foodCost: 0,
    maintenanceCost: 1200,
    notes: 'Auto-scanned: Spare part purchase (wheel bolts & alignment)',
  },
};

export const scanReceipt = async (req, res) => {
  try {
    const { receiptImage, preset } = req.body;

    logger.info('OCR Request received', { hasImage: !!receiptImage, preset });

    // Simulate 1 second network/OCR engine latency
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Handle presets for easy interactive testing
    if (preset && PRESET_SCANS[preset]) {
      logger.info('OCR matched preset', { preset });
      return res.status(200).json({
        message: `Successfully scanned ${preset} receipt preset`,
        data: PRESET_SCANS[preset],
      });
    }

    // Heuristics for custom base64 receipt uploads
    if (receiptImage) {
      // Look for custom text indicators in base64 string if text-based base64 was sent
      const decodedSnippet = receiptImage.slice(0, 1000).toLowerCase();
      
      let fuelCost = 0;
      let tollCost = 0;
      let foodCost = 0;
      let maintenanceCost = 0;
      let notes = 'Auto-scanned receipt';

      if (decodedSnippet.includes('fuel') || decodedSnippet.includes('diesel') || decodedSnippet.includes('petrol')) {
        fuelCost = Math.floor(Math.random() * 3000) + 1500;
        notes = `Auto-scanned: Fuel receipt (estimated ₹${fuelCost})`;
      } else if (decodedSnippet.includes('toll') || decodedSnippet.includes('highway') || decodedSnippet.includes('nhai')) {
        tollCost = Math.floor(Math.random() * 800) + 200;
        notes = `Auto-scanned: Toll charge (estimated ₹${tollCost})`;
      } else if (decodedSnippet.includes('food') || decodedSnippet.includes('hotel') || decodedSnippet.includes('restaurant')) {
        foodCost = Math.floor(Math.random() * 400) + 100;
        notes = `Auto-scanned: Food expense (estimated ₹${foodCost})`;
      } else {
        // Fallback random assignment to look realistic
        const categories = ['fuelCost', 'tollCost', 'foodCost', 'maintenanceCost'];
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const randomAmount = Math.floor(Math.random() * 2000) + 200;
        
        if (randomCategory === 'fuelCost') fuelCost = randomAmount;
        if (randomCategory === 'tollCost') tollCost = randomAmount;
        if (randomCategory === 'foodCost') foodCost = randomAmount;
        if (randomCategory === 'maintenanceCost') maintenanceCost = randomAmount;
        
        notes = `Auto-scanned receipt: categorized under ${randomCategory.replace('Cost', '')} (₹${randomAmount})`;
      }

      return res.status(200).json({
        message: 'Successfully scanned uploaded receipt image',
        data: {
          fuelCost,
          tollCost,
          foodCost,
          maintenanceCost,
          notes,
        },
      });
    }

    return res.status(400).json({ message: 'No receipt image or preset provided for OCR scanning' });
  } catch (error) {
    logger.error('OCR scanning failed', error);
    return res.status(500).json({ message: 'Failed to process OCR request', error: error.message });
  }
};
