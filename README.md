# API Geo Guess
Geo Guess is a RESTful API implemented with Express. It is about users who post thumbnails with a certain location and/or try to guess where photos from the thumbnails were taken.

We can :

* log in to the API
* post thumbnails / delete thumbnails
* make a guess on thumbnails
* get the list of all users with their scores
* retrieve one specific user whith his scores
* get the list of all thumbnails
* retrieve one specific thumbnail
* get the list of all guesses
* find all the guesses that made a specific user
* get the list of all guesses with scores higher than a specified number
* delete or update users
* delete or update thumbnails

## Requirements
Node.js 12.x
MongoDB 4.x

## Usage
```
git clone git@github.com:AngelLando/archioweb-rest-api.git
cd archioweb-rest-api
npm ci
npm start
```

Visit http://localhost:3000.

To automatically reload the code and re-generate the API documentation on changes, use npm run dev instead of npm start.

## Real-time component
Websocket is implemented for the real-time component. An insight message is generated on every post action for guesses. The message format is generated in JSON, like this :

```
{
  "_id": "5dcd247d6cf01e5e88d8ce5b",
  "thumbnail_id": "5dc671768381e45f9443a632",
  "user_id": "5dc4258d9ee5943eb80270a4",
  "location": {
    "type": "Point",
    "coordinates": [
      -73.856077,
      40.848447
    ]
  },
  "score": 24,
  "created_at": "2019-11-14T09:55:09.563Z",
  "__v": 0
}
```

The websocket service is available at this URL :

ws://{PATH_to_the_application}
For example, if you work on your machine, the path should be like this :

ws://localhost:3000/

## Configuration
The app will attempt to connect to the MongoDB database at mongodb://localhost/comem-archioweb-2019-2020-g by default.

Use the $DATABASE_URL or the $MONGODB_URI environment variables to specify a different connection URL.

## Resources
This API allows you to work with Users, Thumbnails and Guesses:

* A Thumbnail MUST have one User.
* A Guess MUST have one User and one Thumbnail.
* A Guess CANNOT be made on a thumbnail if the user who make the guess is the same that the one who created the thumbnail.

Read the [full documentation](https://comem-archioweb-2019-2020-g.herokuapp.com/) to know more. The documentation of the API is also available at the index page of the app. 