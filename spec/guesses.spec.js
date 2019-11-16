const app = require('../app');
const supertest = require('supertest');
const mongoose = require('mongoose');

const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY || 'changeme';

const { expect } = require('chai');
var chai = require('chai');
chai.use(require('chai-http'));

const { cleanUpDatabase } = require('./utils');

const Thumbnail = require('../models/thumbnail');
const User = require('../models/user');
const Guess = require('../models/guess');

beforeEach(cleanUpDatabase);

/* Testing POST guess route */
describe('POST /guesses', function() {
    let user;
    let user2;
    let thumbnail;

    beforeEach(async function() {
      user = await User.create({ username: 'John Doe', password: '1234' });
      user2 = await User.create({ username: 'Jane Doe', password: '1234' });
    });

    beforeEach(async function() {
        thumbnail = await Thumbnail.create({
            title: 'Thumbnail', 
            user_id: user2._id, 
            location: {'type': 'Point', 'coordinates': [ -73.856077, 40.848447 ]}
        })
    });

  it('should create a guess', async function() {
      const res = await supertest(app)
      .post('/guesses')
      .send({
        thumbnail_id: thumbnail._id,
        user_id: user._id,
        location: {"type": "Point", "coordinates": [ -73.856077, 40.848447 ]},
        score: 100
      })
      .expect(201)
      .expect('Content-Type', /json/);

      expect(res).to.have.header('location');
      expect(res.body).to.be.an('object');
      expect(res.body._id).to.be.a('string');
      expect(res.body.created_at).to.be.a('string');
      expect(res.body.thumbnail_id).to.be.a('string');
      expect(res.body.user_id).to.be.a('string');
      expect(res.body.location.type).to.be.a('string');
      expect(res.body.location.coordinates).to.be.a('array');
      expect(res.body.score).to.be.a('Number');
      expect(res.body.score).to.equal(100);

      expect(res.body).to.have.all.keys('__v', '_id', 'thumbnail_id', 'user_id', 'location', 'score', 'created_at');
  });
});

/* Testing GET guesses route */
describe('GET /guesses', function() {

    let user;
    let user2;
    let thumbnail;
  
    beforeEach(async function () {
      user = await User.create({ username: 'John Doe', password: '1234' });
      user2 = await User.create({ username: 'Jane Doe', password: '1234' });
    });

    beforeEach(async function() {
        thumbnail = await Thumbnail.create({
            title: 'Thumbnail', 
            user_id: user._id, 
            location: {'type': 'Point', 'coordinates': [ -73.856077, 40.848447 ]}
        })
    });

    beforeEach(async function() {
        guess = await Guess.create({
            thumbnail_id: thumbnail._id,
            user_id: user2._id,
            location: {"type": "Point", "coordinates": [ -73.856077, 40.848447 ]},
            score: 100
        })
    });
  
    it('should retrieve the list of guesses', async function() {
        const res = await supertest(app)
        .get('/guesses')
        .expect(200)
        .expect('Content-Type', /json/);
  
        expect(res.body).to.be.an('array');
  
        // Check that the first guess is the correct one.
        expect(res.body[0]._id).to.be.a('string');
        expect(res.body[0].thumbnail_id).to.be.a('String');
        expect(res.body[0].user_id).to.be.a('string');
        expect(res.body[0].location.type).to.be.a('string');
        expect(res.body[0].location.coordinates).to.be.a('array');
        expect(res.body[0].score).to.be.a('Number');
        expect(res.body[0].score).to.equal(100);
        expect(res.body[0].created_at).to.be.a('string');
        expect(res.body[0]).to.have.all.keys('__v', '_id', 'thumbnail_id', 'user_id', 'location', 'score', 'created_at');
  
        expect(res.body).to.have.lengthOf(1);
    });
  });

/* describe('GET /guesses/:id', function () {

    let user;
    let user2;
    let thumbnail;
    let guess;
  
    beforeEach(async function () {
      user = await User.create({ username: 'John Doe', password: '1234' });
      user2 = await User.create({ username: 'Jane Doe', password: '1234' });
    });

    beforeEach(async function() {
        thumbnail = await Thumbnail.create({
            title: 'Thumbnail', 
            user_id: user._id, 
            location: {'type': 'Point', 'coordinates': [ -73.856077, 40.848447 ]}
        })
    });

    beforeEach(async function() {
        guess = await Guess.create({
            thumbnail_id: thumbnail._id,
            user_id: user2._id,
            location: {"type": "Point", "coordinates": [ -73.856077, 40.848447 ]},
            score: 100
        })
    });

    it('should retrieve a specific guess', async function () {
      const res = await supertest(app)
        .get('/guesses/' + guess._id)
        .expect(200)
        .expect('Content-Type', /json/);
    });
  
    it('should not be able to retrieve a specific guess with invalid id', async function () {
      const res = await supertest(app)
        .get('/guess/abc123')
        .expect(404)
    });
  
    it('should not be able to retrieve a specific guess with non-existent id', async function () {
      const res = await supertest(app)
        .get('/guess/5dd02f93dbb192272c2d28d4')
        .expect(404)
    });
  
  }); */

/* Testing the DELETE guess route */
describe('DELETE /guesses/:id', function(){
    let user;
    let user2;
    let thumbnail;

    beforeEach(async function() {
        user = await User.create({ username: 'John Doe', password: '1234' });
        user2 = await User.create({ username: 'Jane Doe', password: '1234' });
    });

    beforeEach(async function() {
        thumbnail = await Thumbnail.create({
            title: 'Thumbnail', 
            user_id: user._id, 
            location: {'type': 'Point', 'coordinates': [ -73.856077, 40.848447 ]}
        })
    });

    beforeEach(async function() {
        guess = await Guess.create({
            thumbnail_id: thumbnail._id,
            user_id: user2._id,
            location: {"type": "Point", "coordinates": [ -73.856077, 40.848447 ]},
            score: 100
        })
    });
  
    it('should delete a guess', async function() {
      const exp = (new Date().getTime() + 7 * 24 * 3600 * 1000) / 1000;
      const claims = { sub: user._id.toString(), exp: exp };
  
      let token = jwt.sign(claims, secretKey);

      const res = await supertest(app)
        .del('/guesses/' + guess._id)
        .set('Authorization', 'Bearer ' + token)
        .expect(204)
  
      expect(res.body).to.eql({});
    });
  });

after(mongoose.disconnect);