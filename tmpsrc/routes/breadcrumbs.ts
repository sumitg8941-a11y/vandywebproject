import { Router, Request, Response } from 'express';
import Country from '../models/Country';
import State from '../models/State';
import City from '../models/City';
import Retailer from '../models/Retailer';
import Offer from '../models/Offer';
import { validateId } from '../middleware/validation';

const router = Router();

router.get('/:type/:id', async (req: Request, res: Response) => {
  const { type } = req.params;
  const id = req.params.id as string;
  if (!validateId(id)) {
    res.status(400).json({ error: 'Invalid ID format' });
    return;
  }
  
  try {
    const result: any = {};
    
    if (type === 'city') {
      const city = await City.findOne({ id: id.toLowerCase() }).lean();
      if (!city) {
        res.status(404).json({ error: 'City not found' });
        return;
      }
      result.city = { id: city.id, name: city.name };
      
      if (city.stateId) {
        const state = await State.findOne({ id: city.stateId }).lean();
        if (state) result.state = { id: state.id, name: state.name };
      }
      
      const country = await Country.findOne({ id: city.countryId }).lean();
      if (country) result.country = { id: country.id, name: country.name };
    } else if (type === 'state') {
      const state = await State.findOne({ id: id.toLowerCase() }).lean();
      if (!state) {
        res.status(404).json({ error: 'State not found' });
        return;
      }
      result.state = { id: state.id, name: state.name };
      
      const country = await Country.findOne({ id: state.countryId }).lean();
      if (country) result.country = { id: country.id, name: country.name };
    } else if (type === 'retailer') {
      const retailer = await Retailer.findOne({ id: id.toLowerCase() }).lean();
      if (!retailer) {
        res.status(404).json({ error: 'Retailer not found' });
        return;
      }
      result.retailer = { id: retailer.id, name: retailer.name };
      
      const city = await City.findOne({ id: retailer.cityId }).lean();
      if (city) {
        result.city = { id: city.id, name: city.name };
        
        if (city.stateId) {
          const state = await State.findOne({ id: city.stateId }).lean();
          if (state) result.state = { id: state.id, name: state.name };
        }
        
        const country = await Country.findOne({ id: city.countryId }).lean();
        if (country) result.country = { id: country.id, name: country.name };
      }
    } else if (type === 'offer') {
      const offer = await Offer.findOne({ id: id.toLowerCase() }).lean();
      if (!offer) {
        res.status(404).json({ error: 'Offer not found' });
        return;
      }
      result.offer = { id: offer.id, name: offer.title };
      
      const retailer = await Retailer.findOne({ id: offer.retailerId }).lean();
      if (retailer) {
        result.retailer = { id: retailer.id, name: retailer.name };
        
        const city = await City.findOne({ id: retailer.cityId }).lean();
        if (city) {
          result.city = { id: city.id, name: city.name };
          
          if (city.stateId) {
            const state = await State.findOne({ id: city.stateId }).lean();
            if (state) result.state = { id: state.id, name: state.name };
          }
          
          const country = await Country.findOne({ id: city.countryId }).lean();
          if (country) result.country = { id: country.id, name: country.name };
        }
      }
    } else {
      res.status(400).json({ error: 'Invalid type. Use: city, state, retailer, or offer' });
      return;
    }
    
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to build breadcrumb' });
  }
});

export default router;
