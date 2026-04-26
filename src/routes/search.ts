import { Router, Request, Response } from 'express';
import Retailer from '../models/Retailer';
import Offer from '../models/Offer';
import City from '../models/City';
import { validateId } from '../middleware/validation';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { q: query, category, cityId, retailerId } = req.query;
    
    const retailerFilter: any = {};
    if (query && typeof query === 'string') {
      const safeQuery = query.substring(0, 100);
      const escapedQuery = safeQuery.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      const regex = new RegExp(escapedQuery, 'i');
      retailerFilter.$or = [
        { name: regex },
        { category: regex }
      ];
    }
    if (category && category !== 'all') {
      retailerFilter.category = category;
    }
    if (cityId && cityId !== 'all' && typeof cityId === 'string') {
      if (!validateId(cityId)) {
        res.status(400).json({ error: 'Invalid cityId format' });
        return;
      }
      retailerFilter.cityId = cityId.toLowerCase();
    }
    
    const retailers = await Retailer.find(retailerFilter).lean();
    const retailerIds = retailers.map(r => r.id);
    
    const offerFilter: any = {};
    if (query && typeof query === 'string') {
      const safeQuery = query.substring(0, 100);
      const escapedQuery = safeQuery.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      const regex = new RegExp(escapedQuery, 'i');
      offerFilter.$or = [
        { title: regex },
        { badge: regex }
      ];
    }
    if (category && category !== 'all') {
      offerFilter.category = category;
    }
    if (retailerId && retailerId !== 'all' && typeof retailerId === 'string') {
      if (!validateId(retailerId)) {
        res.status(400).json({ error: 'Invalid retailerId format' });
        return;
      }
      offerFilter.retailerId = retailerId.toLowerCase();
    } else if (retailerIds.length > 0) {
      if (!offerFilter.$or) {
        offerFilter.retailerId = { $in: retailerIds };
      } else {
        offerFilter.$or.push({ retailerId: { $in: retailerIds } });
      }
    }
    
    const offers = await Offer.find(offerFilter).sort({ validUntil: -1 }).lean();
    
    res.json({ retailers, offers });
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

router.get('/filters', async (req: Request, res: Response) => {
  try {
    const cities = await City.find().select('id name').lean();
    const retailers = await Retailer.find().select('id name').lean();
    
    res.json({ categories: [], cities, retailers });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch filters' });
  }
});

export default router;
