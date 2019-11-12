const app = require('../app');
const { expect } = require('chai');
const supertest = require('supertest');
const mongoose = require('mongoose');
var chai = require('chai');
chai.use(require('chai-http'));

const { cleanUpDatabase } = require('./utils');
const User = require('../models/user');

beforeEach(cleanUpDatabase);

/* Testing POST route */
describe('POST /users', function() {
    it('should create a user', async function() {
        const res = await supertest(app)
        .post('/users')
        .send({
          username: 'John Doe',
          password: '1234'
        })
        .expect(201)
        .expect('Content-Type', /json/);

        expect(res).to.have.header('location');
        expect(res.body).to.be.an('object');
        expect(res.body._id).to.be.a('string');
        expect(res.body.created_at).to.be.a('string');
        expect(res.body.username).to.equal('John Doe');
        expect(res.body).to.have.all.keys('__v', '_id', 'created_at', 'username');
    });
  });

/* Testing GET route */
describe('GET /users', function() {
    beforeEach(async function() {
        // Create 2 users before retrieving the list.
        await Promise.all([
          User.create({ username: 'John Doe', password: '1234' }),
          User.create({ username: 'Jane Doe', password: '1234' })
        ]);
    });

    it('should retrieve the list of users', async function() {
        const res = await supertest(app)
        .get('/users')
        .expect(200)
        .expect('Content-Type', /json/);

        expect(res.body).to.be.an('array');

        // Check that the first person is the correct one.
        expect(res.body[0]._id).to.be.a('string');
        expect(res.body[0].username).to.equal('Jane Doe');
        expect(res.body[0].created_at).to.be.a('string');
        expect(res.body[0].totalScore).to.equal(0);
        expect(res.body[0].maxScore).to.equal(null);
        expect(res.body[0].averageScore).to.equal(null);
        expect(res.body[0]).to.have.all.keys('_id', 'username', 'created_at', 'totalScore', 'maxScore', 'averageScore');

        // Check that the second person is the correct one.
        expect(res.body[1]._id).to.be.a('string');
        expect(res.body[1].username).to.equal('John Doe');
        expect(res.body[1].created_at).to.be.a('string');
        expect(res.body[1].totalScore).to.equal(0);
        expect(res.body[0].maxScore).to.equal(null);
        expect(res.body[0].averageScore).to.equal(null);
        expect(res.body[0]).to.have.all.keys('_id', 'username', 'created_at', 'totalScore', 'maxScore', 'averageScore');

        expect(res.body).to.have.lengthOf(2);
    });
  });
  
after(mongoose.disconnect);
