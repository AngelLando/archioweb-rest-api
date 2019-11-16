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

beforeEach(cleanUpDatabase);

/* Testing POST thumbnail route */
describe('POST /thumbnails', function() {
    let user;

    beforeEach(async function() {
      user = await User.create({ username: 'John Doe', password: '1234' });
    });

  it('should create a thumbnail', async function() {
      const res = await supertest(app)
      .post('/thumbnails')
      .send({
        title: 'Thumbnail',
        user_id: user._id,
        location: {"type": "Point", "coordinates": [ -73.856077, 40.848447 ]},
      })
      .expect(201)
      .expect('Content-Type', /json/);

      expect(res).to.have.header('location');
      expect(res.body).to.be.an('object');
      expect(res.body._id).to.be.a('string');
      expect(res.body.created_at).to.be.a('string');
      expect(res.body.title).to.equal('Thumbnail');
      expect(res.body.user_id).to.be.a('string');
      expect(res.body.location.type).to.be.a('string');
      expect(res.body.location.coordinates).to.be.a('array');
      expect(res.body).to.have.all.keys('__v', '_id', 'title', 'user_id', 'location', 'created_at');
  });
});

/* Testing GET thumbnails route */
describe('GET /thumbnails', function() {
    let user;

    beforeEach(async function() {
        user = await User.create({ username: 'John Doe', password: '1234' });

        Thumbnail.create({
            title: 'Thumbnail', 
            user_id: user._id, 
            location: {'type': 'Point', 'coordinates': [ -73.856077, 40.848447 ]}
        })
    });
  
    it('should retrieve the list of users', async function() {
        const res = await supertest(app)
        .get('/thumbnails')
        .expect(200)
        .expect('Content-Type', /json/);
  
        expect(res.body).to.be.an('array');
  
        // Check that the first thumbnail is the correct one.
        expect(res.body[0]._id).to.be.a('string');
        expect(res.body[0].title).to.equal('Thumbnail');
        expect(res.body[0].created_at).to.be.a('string');
        expect(res.body[0].user_id).to.be.a('string');
        expect(res.body[0].location.type).to.be.a('string');
        expect(res.body[0].location.coordinates).to.be.a('array');
        expect(res.body[0]).to.have.all.keys('__v', '_id', 'title', 'user_id', 'location', 'created_at');
  
        expect(res.body).to.have.lengthOf(1);
    });
  });

  describe('GET /thumbnails/:id', function () {
    let user;
    let thumbnail;

    beforeEach(async function() {
        user = await User.create({ username: 'John Doe', password: '1234' });
    });

    beforeEach(async function() {
        thumbnail = await Thumbnail.create({
            title: 'Thumbnail', 
            user_id: user._id, 
            location: {'type': 'Point', 'coordinates': [ -73.856077, 40.848447 ]}
        })
    });

    it('should retrieve a specific thumbnail', async function () {
        const res = await supertest(app)
          .get('/thumbnails/' + thumbnail._id)
          .expect(200)
          .expect('Content-Type', /json/);
    });
  
    it('should not be able to retrieve a specific thumbnail with invalid id', async function () {
      const res = await supertest(app)
        .get('/thumbnails/abc123')
        .expect(404)
    });
  
    it('should not be able to retrieve a specific thumbnail with non-existent id', async function () {
      const res = await supertest(app)
        .get('/thumbnails/5dd02f93dbb192272c2d28d4')
        .expect(404)
    });
  
  });

/* Testing the DELETE thumbnail route */
describe('DELETE /thumbnails/:id', function(){
    let user;
    let thumbnail;

    beforeEach(async function() {
        user = await User.create({ username: 'John Doe', password: '1234' });
    });

    beforeEach(async function() {
        thumbnail = await Thumbnail.create({
            title: 'Thumbnail', 
            user_id: user._id, 
            location: {'type': 'Point', 'coordinates': [ -73.856077, 40.848447 ]}
        })
    });
  
    it('should delete a thumbnail', async function() {
      const exp = (new Date().getTime() + 7 * 24 * 3600 * 1000) / 1000;
      const claims = { sub: user._id.toString(), exp: exp };
  
      let token = jwt.sign(claims, secretKey);

      const res = await supertest(app)
        .del('/thumbnails/' + thumbnail._id)
        .set('Authorization', 'Bearer ' + token)
        .expect(204)
  
      expect(res.body).to.eql({});
    });
  });


/* Testing the PATCH thumbnails route */
describe('PATCH /thumbnails/:id', function () {
    let user;
    let thumbnail;

    beforeEach(async function() {
        user = await User.create({ username: 'John Doe', password: '1234' });
    });

    beforeEach(async function() {
        thumbnail = await Thumbnail.create({
            title: 'Thumbnail', 
            user_id: user._id, 
            location: {'type': 'Point', 'coordinates': [ -73.856077, 40.848447 ]}
        })
    });
  
    it('should update a thumbnail', async function() {
  
      const exp = (new Date().getTime() + 7 * 24 * 3600 * 1000) / 1000;
      const claims = { sub: user._id.toString(), exp: exp };
  
      let token = jwt.sign(claims, secretKey);
  
      const res = await supertest(app)
          .patch('/thumbnails/' + thumbnail._id)
          .send({
            title: 'Thumbnail PATCHED'
          })
          .set('Authorization', 'Bearer ' + token)
          .expect(200)
          .expect('Content-Type', /json/);
    });
  });

after(mongoose.disconnect);