import { Router, Request, Response } from 'express';
import Country from '../models/Country';
import State from '../models/State';
import City from '../models/City';
import Retailer from '../models/Retailer';
import Offer from '../models/Offer';
import SiteStat from '../models/SiteStat';
import Feedback from '../models/Feedback';
import { verifyAdmin, generateToken } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { validateId } from '../middleware/validation';

const router = Router();

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';

router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = generateToken({ role: 'admin' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

router.get('/feedback', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const feedback = await Feedback.find().sort({ date: -1 });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

router.post('/upload', verifyAdmin, upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }
  res.json({ url: '/uploads/' + req.file.filename });
});

router.post('/countries', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const newCountry = new Country(req.body);
    await newCountry.save();
    res.status(201).json(newCountry);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/states', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const newState = new State(req.body);
    await newState.save();
    res.status(201).json(newState);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/cities', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const newCity = new City(req.body);
    await newCity.save();
    res.status(201).json(newCity);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/retailers', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const newRetailer = new Retailer(req.body);
    await newRetailer.save();
    res.status(201).json(newRetailer);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/offers', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const newOffer = new Offer(req.body);
    await newOffer.save();
    res.status(201).json(newOffer);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/offers/:id', verifyAdmin, async (req: Request, res: Response) => {
  const id = req.params.id as string;
  console.log('PUT /offers/:id - Received ID:', id);
  console.log('PUT /offers/:id - Request body:', req.body);
  
  if (!validateId(id)) {
    console.error('Invalid ID format:', id);
    res.status(400).json({ error: 'Invalid ID format' });
    return;
  }
  try {
    const offerId = id || req.body.id;
    const updateData = { ...req.body };
    delete updateData.id;
    
    console.log('Searching for offer with ID:', offerId);
    
    // Check if it's a MongoDB ObjectId (24 hex characters) or custom ID
    const isObjectId = /^[a-f0-9]{24}$/i.test(offerId);
    const query = isObjectId 
      ? { $or: [{ id: offerId.toLowerCase() }, { _id: offerId }] }
      : { id: offerId.toLowerCase() };
    
    const updatedOffer = await Offer.findOneAndUpdate(
      query,
      updateData,
      { new: true, runValidators: false }
    );
    
    if (!updatedOffer) {
      console.error('Offer not found with ID:', offerId);
      res.status(404).json({ error: 'Offer not found' });
      return;
    }
    
    console.log('Offer updated successfully:', updatedOffer.id);
    res.json(updatedOffer);
  } catch (err: any) {
    console.error('Offer update error:', err);
    res.status(400).json({ error: err.message || 'Failed to update offer' });
  }
});

router.put('/countries/:id', verifyAdmin, async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!validateId(id)) {
    res.status(400).json({ error: 'Invalid ID format' });
    return;
  }
  try {
    const updatedCountry = await Country.findOneAndUpdate(
      { id: id.toLowerCase() },
      req.body,
      { new: true }
    );
    if (!updatedCountry) {
      res.status(404).json({ error: 'Country not found' });
      return;
    }
    res.json(updatedCountry);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/cities/:id', verifyAdmin, async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!validateId(id)) {
    res.status(400).json({ error: 'Invalid ID format' });
    return;
  }
  try {
    const updatedCity = await City.findOneAndUpdate(
      { id: id.toLowerCase() },
      req.body,
      { new: true }
    );
    if (!updatedCity) {
      res.status(404).json({ error: 'City not found' });
      return;
    }
    res.json(updatedCity);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/retailers/:id', verifyAdmin, async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!validateId(id)) {
    res.status(400).json({ error: 'Invalid ID format' });
    return;
  }
  try {
    const updatedRetailer = await Retailer.findOneAndUpdate(
      { id: id.toLowerCase() },
      req.body,
      { new: true }
    );
    if (!updatedRetailer) {
      res.status(404).json({ error: 'Retailer not found' });
      return;
    }
    res.json(updatedRetailer);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/countries/:id', verifyAdmin, async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!validateId(id)) {
    res.status(400).json({ error: 'Invalid ID format' });
    return;
  }
  try {
    await Country.findOneAndDelete({ id: id.toLowerCase() });
    res.json({ message: 'Country deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/states/:id', verifyAdmin, async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!validateId(id)) {
    res.status(400).json({ error: 'Invalid ID format' });
    return;
  }
  try {
    await State.findOneAndDelete({ id: id.toLowerCase() });
    res.json({ message: 'State deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/cities/:id', verifyAdmin, async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!validateId(id)) {
    res.status(400).json({ error: 'Invalid ID format' });
    return;
  }
  try {
    await City.findOneAndDelete({ id: id.toLowerCase() });
    res.json({ message: 'City deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/retailers/:id', verifyAdmin, async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!validateId(id)) {
    res.status(400).json({ error: 'Invalid ID format' });
    return;
  }
  try {
    await Retailer.findOneAndDelete({ id: id.toLowerCase() });
    res.json({ message: 'Retailer deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/offers/:id', verifyAdmin, async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!validateId(id)) {
    res.status(400).json({ error: 'Invalid ID format' });
    return;
  }
  try {
    await Offer.findOneAndDelete({ id: id.toLowerCase() });
    res.json({ message: 'Offer deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
