# Backend Assignment - Live Location Tracking System

## Overview

This project is a scalable backend system designed to track the live GPS location of users in real-time. The system handles location pings sent every 4 seconds and includes endpoints for user registration, login, and an admin interface to monitor and manage user data. The backend is built using Node.js with Express, and MongoDB is used as the primary database for flexible storage of location data. The system is designed to handle at least 500 live users concurrently.

## Features

### User Features

1. **Registration & Login:**
   - Users can register with a unique username and password.
   - JWT (JSON Web Tokens) are used for secure authentication.
   - Access and refresh tokens are implemented for enhanced security.

2. **Location Tracking:**
   - After logging in, users can send their GPS location to the server every 4 seconds.
   - The location data is stored in MongoDB for real-time tracking.

3. **Scalability:**
   - The backend is designed to handle at least 500 live users concurrently.
   - Rate limiting and indexing are applied to optimize performance.

### Admin Features

1. **User Monitoring:**
   - Admins can view all registered users through an admin interface.
   - Pagination is implemented to handle large datasets efficiently.

2. **Location Logs:**
   - Admins can view detailed location logs for individual users.
   - The admin panel includes user search capabilities for easy navigation.

## Technical Stack

- **Backend:** Node.js with Express framework.
- **Database:** MongoDB for flexible storage of location data.
- **Authentication:** JWT (JSON Web Tokens) for secure user authentication.
- **Optimization:** 
  - Indexing fields in MongoDB documents for faster queries.
  - Rate limiting to prevent abuse and ensure fair usage.
- **Environment Variables:** 
  - `PORT`: The port on which the server will run.
  - `MONGODB_URI`: The connection string for MongoDB.
  - `CORS_ORIGIN`: The allowed origin for CORS requests.
  - `ACCESS_TOKEN_SECRET`: Secret key for signing access tokens.
  - `ACCESS_TOKEN_EXPIRY`: Expiry time for access tokens.
  - `REFRESH_TOKEN_SECRET`: Secret key for signing refresh tokens.
  - `REFRESH_TOKEN_EXPIRY`: Expiry time for refresh tokens.

## Getting Started

### Prerequisites

- Node.js installed on your machine.
- MongoDB instance running (local or cloud).
- pnpm package manager installed.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Kartik-ui/gps_location_tracker.git
   cd gps_location_tracker
   ```
2. Install dependencies:
   ```bash
   npm i
   ```
3. Create a .env file in the root directory and fill in the required environment variables:
   ```bash
   PORT
   MONGODB_URI
   CORS_ORIGIN
   ACCESS_TOKEN_SECRET
   ACCESS_TOKEN_EXPIRY
   REFRESH_TOKEN_SECRET
   REFRESH_TOKEN_EXPIRY
   ```
4. Start the server
   ```bash
   npm run dev
   ```
## POSTMAN API json file
https://drive.google.com/file/d/1G6_A4YRL1a-sX29zmjZEGRgpMiQIQ2QY/view?usp=sharing
simply download the json file by visiting the link and import in your postman to run all the apis of the project in your postman.
## Admin email and password
```bash
{
   "email": "admin@gmail.com",
   "password": "1234"
}
```
