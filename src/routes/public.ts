import { Router, Request, Response } from 'express';
import Country from '../models/Country';
import State from '../models/State';
import City from '../models/City';
import Retailer from '../models/Retailer';
import Offer from '../models/Offer';
import SiteStat from '../models/SiteStat';
import Feedback from '../models/Feedback';
import { validateId } from '../middleware/validation';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'secure', message: 'DealNamaa API is running safely!' });
});

router.get('/countries', async (req: Request, res: Response) => {
  try {
    const countries = await Country.find();
    res.json(countries);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch countries' });
  }
});

router.get('/regions/:countryId', async (req: Request, res: Response) => {
  const countryId = req.params.countryId as string;
  if (!validateId(countryId)) {
    res.status(400).json({ error: 'Invalid ID format' });
    return;
  }
  try {
    const states = await State.find({ countryId: countryId.toLowerCase() });
    if (states.length > 0) {
      res.json({ type: 'states', data: states });
      return;
    }
    const cities = await City.find({ countryId: countryId.toLowerCase() });
    res.json({ type: 'cities', data: cities });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch regions' });
  }
});

router.get('/cities/:countryId', async (req: Request, res: Response) => {
  const countryId = req.params.countryId as string;
  if (!validateId(countryId)) {
    res.status(400).json({ error: 'Invalid ID format' });
    return;
  }
  try {
    const cities = await City.find({ countryId: countryId.toLowerCase() });
    res.json(cities);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cities' });
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

router.get('/retailers/:cityId', async (req: Request, res: Response) => {
  const cityId = req.params.cityId as string;
  if (!validateId(cityId)) {
    res.status(400).json({ error: 'Invalid ID format' });
    return;
  }
  try {
    const retailers = await Retailer.find({ cityId: cityId.toLowerCase() });
    res.json(retailers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch retailers' });
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

router.get('/retailer/:id', async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!validateId(id)) {
    res.status(400).json({ error: 'Invalid ID format' });
    return;
  }
  try {
    const retailer = await Retailer.findOne({ id: id.toLowerCase() });
    res.json(retailer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch retailer details' });
  }
});

router.get('/offers/:retailerId', async (req: Request, res: Response) => {
  const retailerId = req.params.retailerId as string;
  if (!validateId(retailerId)) {
    res.status(400).json({ error: 'Invalid ID format' });
    return;
  }
  try {
    const offers = await Offer.find({ retailerId: retailerId.toLowerCase() }).sort({ validUntil: -1 });
    res.json(offers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch offers' });
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

router.get('/offer/:id', async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!validateId(id)) {
    res.status(400).json({ error: 'Invalid ID format' });
    return;
  }
  try {
    const offer = await Offer.findOne({ id: id.toLowerCase() });
    if (!offer) {
      res.status(404).json({ error: 'Offer not found' });
      return;
    }
    res.json(offer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch offer details' });
  }
});

router.post('/offer/:id/like', async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!validateId(id)) {
    res.status(400).json({ error: 'Invalid ID format' });
    return;
  }
  try {
    const offer = await Offer.findOneAndUpdate(
      { id: id.toLowerCase() },
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!offer) {
      res.status(404).json({ error: 'Offer not found' });
      return;
    }
    res.json({ likes: offer.likes, dislikes: offer.dislikes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update' });
  }
});

router.post('/offer/:id/dislike', async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!validateId(id)) {
    res.status(400).json({ error: 'Invalid ID format' });
    return;
  }
  try {
    const offer = await Offer.findOneAndUpdate(
      { id: id.toLowerCase() },
      { $inc: { dislikes: 1 } },
      { new: true }
    );
    if (!offer) {
      res.status(404).json({ error: 'Offer not found' });
      return;
    }
    res.json({ likes: offer.likes, dislikes: offer.dislikes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update' });
  }
});

router.get('/redirect/offer/:id', async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!validateId(id)) {
    res.status(400).json({ error: 'Invalid ID format' });
    return;
  }
  try {
    const offer = await Offer.findOne({ id: id.toLowerCase() });
    if (!offer) {
      res.status(404).send('Offer not found');
      return;
    }
    
    offer.clicks += 1;
    await offer.save();

    let dest = offer.pdfUrl || '#';
    
    try {
      const urlObj = new URL(dest);
      urlObj.searchParams.set('utm_source', 'DealNamaa');
      urlObj.searchParams.set('utm_medium', 'coupon_link');
      urlObj.searchParams.set('utm_campaign', 'retailer_traffic');
      dest = urlObj.toString();
    } catch(e) {
      // Invalid URL format, use raw
    }
    
    res.redirect(dest);
  } catch (err) {
    res.status(500).send('Error processing redirect');
  }
});

router.post('/feedback', async (req: Request, res: Response) => {
  try {
    const newFeedback = new Feedback(req.body);
    await newFeedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to submit feedback' });
  }
});

router.post('/track/visit', async (req: Request, res: Response) => {
  try {
    await SiteStat.findOneAndUpdate(
      { id: 'global' },
      { $inc: { visits: 1 } },
      { upsert: true }
    );
    res.status(200).send('OK');
  } catch (e) {
    res.status(500).send('Error');
  }
});

router.post('/track/retailer/:id', async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!validateId(id)) {
    res.status(400).json({ error: 'Invalid ID format' });
    return;
  }
  try {
    await Retailer.findOneAndUpdate(
      { id: id.toLowerCase() },
      { $inc: { clicks: 1 } }
    );
    res.status(200).send('OK');
  } catch (e) {
    res.status(500).send('Error');
  }
});

router.post('/track/offer/:id', async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!validateId(id)) {
    res.status(400).json({ error: 'Invalid ID format' });
    return;
  }
  try {
    await Offer.findOneAndUpdate(
      { id: id.toLowerCase() },
      { $inc: { clicks: 1 } }
    );
    res.status(200).send('OK');
  } catch (e) {
    res.status(500).send('Error');
  }
});

router.post('/track/offer-stats/:id', async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!validateId(id)) {
    res.status(400).json({ error: 'Invalid ID format' });
    return;
  }
  try {
    const { duration, maxPage } = req.body;
    await Offer.findOneAndUpdate(
      { id: id.toLowerCase() },
      {
        $inc: { totalTimeSeconds: duration },
        $max: { maxPagesViewed: maxPage }
      }
    );
    res.status(200).send('OK');
  } catch (e) {
    res.status(500).send('Error');
  }
});

export default router;
