# Online Video Sharing Platform

A production-style REST API for a video sharing platform, built to demonstrate scalable backend architecture, authentication, and media management.

## Tech Stack

* Node.js
* Express.js
* MongoDB & Mongoose
* JWT Authentication
* Cloudinary
* Multer

## Features

* Secure JWT authentication
* Video upload and management
* Comments, likes, and subscriptions
* Playlists and watch history
* User channels
* RESTful API design

## Setup

```bash
git clone <repository-url>
cd Online-Video-Sharing-App
npm install
```

Create a `.env` file and configure your MongoDB, JWT, and Cloudinary credentials.

Run the server:

```bash
npm run dev
```

## Project Structure

```
src/
├── controllers/
├── models/
├── routes/
├── middlewares/
├── utils/
└── db/
```

## License

MIT License.
