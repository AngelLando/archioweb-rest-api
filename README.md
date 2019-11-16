# API Geo Guess
Geo Guess is a RESTful API implemented with Express. It is about users who post thumbnails with a certain location and/or try to guess where photos from the thumbnails were taken.

We can :

* log in to the API
* post thumbnails / delete thumbnails
* make a guess on thumbnails (but the user who make the guess must be different from the user who posted the thumbnail)
* get the list of all users with their scores
* find a specific user whith his scores
* get the list of all thumbnails
* get the list of all guesses
* find all the guesses that made a specific user
* get the list of all guesses with scores higher than a specified number
* delete or update users
* delete or update thumbnails

## Requirements
Node.js 12.x
MongoDB 4.x

## Usage
```git clone git@github.com:AngelLando/archioweb-rest-api.git
cd archioweb-rest-api
npm ci
DEBUG=demo:* npm start
```

Visit http://localhost:3000.

To automatically reload the code and re-generate the API documentation on changes, use npm run dev instead of npm start.

## Documentation
The documentation of the API is available at the index page of the app. You can also read the documentation on-line [here](https://comem-archioweb-2019-2020-g.herokuapp.com/).

## Configuration
The app will attempt to connect to the MongoDB database at mongodb://localhost/comem-webdev-express-rest-demo by default.

Use the $DATABASE_URL or the $MONGODB_URI environment variables to specify a different connection URL.

## Resources
This API allows you to work with Movies and People:

A Movie MUST have one director (who is a Person)
Read the full documentation to know more.