# VidTube Backend

VidTube is a YouTube-inspired backend API built with Node.js, Express, MongoDB, Mongoose, JWT authentication utilities, Multer file uploads, and Cloudinary media storage.

This project is currently an early backend build. The core app structure, database connection, user model, media upload helper, and first user registration route are in place.

## Quick Glance

- Runtime: Node.js with ES modules
- Server: Express
- Database: MongoDB with Mongoose
- Auth tooling: bcrypt and jsonwebtoken
- File uploads: Multer
- Media storage: Cloudinary
- API prefix: `/api/v1`
- Database name: `vidtube`
- Entry file: `src/index.js`

## Project Structure

```txt
VidTube/
├── src/
│   ├── app.js                         # Express app setup, middleware, routes
│   ├── index.js                       # Loads env, connects DB, starts server
│   ├── constants.js                   # Shared constants
│   ├── db/
│   │   └── index.js                   # MongoDB connection
│   ├── controllers/
│   │   ├── healthcheck.controllers.js # Healthcheck controller
│   │   └── user.controller.js         # User controller logic
│   ├── middlewares/
│   │   └── multer.middlewares.js      # Local upload storage config
│   ├── models/
│   │   ├── user.models.js             # User schema and auth token helpers
│   │   ├── video.models.js            # Video schema
│   │   ├── comment.models.js          # Comment schema
│   │   ├── like.models.js             # Like schema
│   │   ├── playlist.models.js         # Playlist schema
│   │   ├── subscription.models.js     # Subscription schema
│   │   └── tweet.models.js            # Tweet schema
│   ├── routes/
│   │   ├── healthcheck.routes.js      # /api/v1/healthcheck
│   │   └── user.routes.js             # /api/v1/users
│   └── utils/
│       ├── ApiError.js                # Custom API error class
│       ├── ApiResponse.js             # Standard API response class
│       ├── asyncHandler.js            # Async route wrapper
│       └── cloudinary.js              # Cloudinary upload helper
├── package.json
├── package-lock.json
└── README.md
```

## Requirements

Install these before running the project:

- Node.js
- npm
- MongoDB database, local or cloud hosted
- Cloudinary account for image/video uploads
- API client such as Postman, Thunder Client, or Insomnia

## Environment Variables

Create a `.env` file in the project root.

```env
PORT=8001
CORS_ORIGIN=http://localhost:3000

MONGODB_URI=mongodb://127.0.0.1:27017

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d

REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d
```

The database connection appends the database name automatically, so `MONGODB_URI` should point to the MongoDB server base URI. The app connects to:

```txt
${MONGODB_URI}/vidtube
```

## Install And Run

```bash
npm install
npm run dev
```

For normal start:

```bash
npm start
```

Default local server:

```txt
http://localhost:8001
```

## Available Scripts

```bash
npm run dev    # Start server with nodemon
npm start      # Start server with node
npm test       # Placeholder test command
```

## API Routes

### Healthcheck

```http
GET /api/v1/healthcheck
```

Checks if the server is alive.

### User Registration

```http
POST /api/v1/users/register
```

Expected body type: `multipart/form-data`

Fields:

```txt
fullName
email
username
password
avatar       # required file
coverImage   # optional file
```

Current behavior:

- Validates required user fields
- Checks for existing user by username or email
- Accepts avatar and cover image through Multer
- Uploads media files to Cloudinary

## Data Models

### User

Stores account details, avatar, optional cover image, password, refresh token, and watch history.

Important fields:

- `username`
- `email`
- `fullname`
- `avatar`
- `coverImage`
- `password`
- `refreshToken`
- `watchHistory`

Includes helper methods for:

- Password comparison
- Access token generation
- Refresh token generation

### Video

Stores uploaded video metadata.

Important fields:

- `videoFile`
- `thumbnail`
- `title`
- `description`
- `duration`
- `views`
- `isPublished`
- `owner`

### Comment

Stores comments on videos.

Important fields:

- `content`
- `video`
- `owner`

### Like

Stores likes for videos, comments, or tweets.

Important fields:

- `video`
- `comment`
- `tweet`
- `likedBy`

### Playlist

Stores user-created video collections.

Important fields:

- `name`
- `description`
- `videos`
- `owner`

### Subscription

Stores channel subscription relationships.

Important fields:

- `subscriber`
- `channel`

### Tweet

Stores short user posts.

Important fields:

- `content`
- `owner`

## Current Backend Flow

1. `src/index.js` loads environment variables.
2. MongoDB connection starts through `connectDB()`.
3. Express server starts after DB connection succeeds.
4. `src/app.js` applies common middleware.
5. Routes are mounted under `/api/v1`.
6. File uploads are temporarily stored in `public/temp`.
7. Cloudinary helper uploads local files and removes them after upload.

## Useful Notes

- The project uses ES module syntax because `package.json` has `"type": "module"`.
- Static files are served from the `public` folder.
- Uploaded files are temporarily written to `./public/temp`.
- Standard API success responses use `ApiResponse`.
- Async controller errors are wrapped with `asyncHandler`.
- Custom API errors can be thrown using `ApiError`.

## Suggested Next Steps

- Complete user registration response and database save logic.
- Add login, logout, refresh token, and current user routes.
- Add auth middleware for protected routes.
- Add video upload, update, delete, and listing endpoints.
- Add controllers and routes for comments, likes, playlists, subscriptions, and tweets.
- Add request validation and centralized error middleware.
- Add tests once routes become stable.

