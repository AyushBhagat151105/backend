# Backend Project

This is a backend project built with Node.js, Express, and MongoDB. It includes user authentication, email verification, and password reset functionality.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [License](#license)

## Installation

1. Clone the repository:
    ```sh
    git clone <repository-url>
    cd backend
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create a `.env` file in the root directory and add the required environment variables as shown in the `.env.sample` file.

## Usage

1. Start the development server:
    ```sh
    npm run dev
    ```

2. The server will start on the port specified in the `.env` file (default is 3000).

## Environment Variables

The following environment variables are required:

- `PORT`: The port on which the server will run.
- `BASE_URL`: The base URL of the application.
- `MONGO_URI`: The MongoDB connection string.
- `MAILTRAP_HOST`: The Mailtrap SMTP host.
- `MAILTRAP_PORT`: The Mailtrap SMTP port.
- `MAILTRAP_USER`: The Mailtrap SMTP user.
- `MAILTRAP_PASS`: The Mailtrap SMTP password.
- `MAILTRAP_SENDEREMAIL`: The sender email address for Mailtrap.
- `JWT`: The secret key for JWT.

## API Endpoints

### User Routes

- `POST /api/v1/users/register`: Register a new user.
- `GET /api/v1/users/verify/:token`: Verify a user's email.
- `POST /api/v1/users/login`: Login a user.
- `POST /api/v1/users/forgotpassword`: Send a password reset email.
- `POST /api/v1/users/resetpassword/:token`: Reset a user's password.
- `POST /api/v1/users/logout`: Logout a user.
- `GET /api/v1/users/me`: Verify user cookie.

## License

This project is licensed under the ISC License.