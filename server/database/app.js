const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const  cors = require('cors')
const app = express()
const port = 3030;
const Cars = require('./inventory');

app.use(cors())
app.use(require('body-parser').urlencoded({ extended: false }));

const path = require('path');

const reviews_data = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'reviews.json'), 'utf8')
);

const dealerships_data = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'dealerships.json'), 'utf8')
);
const cars_data = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'data', 'car_records.json'), 'utf8')
);

mongoose.connect("mongodb://127.0.0.1:27017/", {
  dbName: "dealershipsDB"
});


const Reviews = require('./review');

const Dealerships = require('./dealership');

try {
  Reviews.deleteMany({}).then(()=>{
    Reviews.insertMany(reviews_data['reviews']);
  });
  Dealerships.deleteMany({}).then(()=>{
    Dealerships.insertMany(dealerships_data['dealerships']);
  });
  Cars.deleteMany({}).then(() => {
    Cars.insertMany(cars_data['cars']);
  });
  
} catch (error) {
  res.status(500).json({ error: 'Error fetching documents' });
}


// Express route to home
app.get('/', async (req, res) => {
    res.send("Welcome to the Mongoose API")
});

// Express route to fetch all reviews
app.get('/fetchReviews', async (req, res) => {
  try {
    const documents = await Reviews.find();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Express route to fetch reviews by a particular dealer
app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try {
    const documents = await Reviews.find({dealership: req.params.id});
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});


/* Fetch all dealerships */
app.get('/fetchDealers', async (req, res) => {
    try {
      const documents = await Dealerships.find();
      res.json(documents);
    } catch (error) {
      console.error('Error fetching dealerships:', error);
      res.status(500).json({ error: 'Error fetching dealerships' });
    }
  });
  
  /* Fetch dealerships by state */
  app.get('/fetchDealers/:state', async (req, res) => {
    try {
      const state = req.params.state;
  
      const documents = state.toLowerCase() === 'all'
        ? await Dealerships.find()
        : await Dealerships.find({
            state: { $regex: `^${state}$`, $options: 'i' }
          });
  
      res.json(documents);
    } catch (error) {
      console.error('Error fetching dealerships by state:', error);
      res.status(500).json({ error: 'Error fetching dealerships by state' });
    }
  });
  
  /* Fetch a dealership by its numeric ID */
  app.get('/fetchDealer/:id', async (req, res) => {
    try {
      const dealer = await Dealerships.findOne({
        id: Number(req.params.id)
      });
  
      if (!dealer) {
        return res.status(404).json({ error: 'Dealership not found' });
      }
  
      res.json([dealer]);
    } catch (error) {
      console.error('Error fetching dealership:', error);
      res.status(500).json({ error: 'Error fetching dealership' });
    }
  });
  

//Express route to insert review
app.post('/insert_review', express.raw({ type: '*/*' }), async (req, res) => {
  data = JSON.parse(req.body);
  const documents = await Reviews.find().sort( { id: -1 } )
  let new_id = documents[0]['id']+1

  const review = new Reviews({
		"id": new_id,
		"name": data['name'],
		"dealership": data['dealership'],
		"review": data['review'],
		"purchase": data['purchase'],
		"purchase_date": data['purchase_date'],
		"car_make": data['car_make'],
		"car_model": data['car_model'],
		"car_year": data['car_year'],
	});

  try {
    const savedReview = await review.save();
    res.json(savedReview);
  } catch (error) {
		console.log(error);
    res.status(500).json({ error: 'Error inserting review' });
  }
});

// Fetch all cars for the review form
app.get('/fetchCars', async (req, res) => {
    try {
      const documents = await Cars.find();
      res.json(documents);
    } catch (error) {
      console.error('Error fetching cars:', error);
      res.status(500).json({ error: 'Error fetching cars' });
    }
  });

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
