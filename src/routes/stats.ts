import { Router, Request, Response } from 'express';
import SiteStat from '../models/SiteStat';
import Retailer from '../models/Retailer';
import Offer from '../models/Offer';
import State from '../models/State';
import City from '../models/City';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const globalStat = await SiteStat.findOne({ id: 'global' });
    const topRetailers = await Retailer.find().sort({ clicks: -1 }).limit(5);
    const topOffers = await Offer.find().sort({ clicks: -1 }).limit(5);
    
    res.json({
      visits: globalStat ? globalStat.visits : 0,
      topRetailers,
      topOffers
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.get('/states', async (req: Request, res: Response) => {
  try {
    const states = await State.find();
    res.json(states);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch states' });
  }
});

router.get('/cities', async (req: Request, res: Response) => {
  try {
    const cities = await City.find();
    res.json(cities);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
});

router.get('/retailers', async (req: Request, res: Response) => {
  try {
    const retailers = await Retailer.find();
    res.json(retailers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch retailers' });
  }
});

router.get('/offers', async (req: Request, res: Response) => {
  try {
    const offers = await Offer.find().sort({ validUntil: -1 });
    res.json(offers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

export default router;
