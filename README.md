# Flask Authentication Server

A secure authentication server with OAuth2 (Google, LinkedIn, GitHub) and JWT-based authentication system built with Flask and MongoDB.

## Features

- ✅ Google OAuth2 Login
- ✅ LinkedIn OpenID Connect
- ✅ GitHub OAuth2
- 🔑 JWT Token Authentication
- 🔄 Token Refresh
- 📝 Manual Registration/Login
- 🛡️ Protected Routes
- 🗄️ MongoDB Storage
- 🔒 Secure Password Hashing

## Prerequisites

- Python
- MongoDB instance (local or cloud)
- OAuth2 credentials for:
  - Google Cloud Platform
  - LinkedIn Developer Portal
  - GitHub Developer Settings

## Installation

1. Clone the repository:
```bash
git clone https://github.com/DEVCIR/JobSeekerAI.git
```

```bash
cd Backend
cd flask_auth_api
```

2. Create and activate virtual environment:
 ```bash
 python -m venv venv
 source venv/bin/activate  # On Windows: venv\Scripts\activate
 ```

3.Install dependencies:
```bash
pip install -r requirements.txt
```

# Configuration
Create a .env file in the root directory with these variables:
```bash
MONGO_URI=mongodb://localhost:27017
JWT_SECRET_KEY=your_super_secret_key_here

# OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

# Running the Server
```bash
python app.py
```
The server will run at `http://localhost:5000`

## API Endpoints

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/login` | POST | Manual user login |
| `/login/github` | GET | Initiate GitHub OAuth flow |
| `/login/google` | GET | Initiate Google OAuth flow |
| `/login/linkedin` | GET | Initiate LinkedIn OAuth flow |
| `/protected` | GET | Test protected route (requires JWT) |
| `/refresh` | POST | Refresh access token using refresh token |
| `/register` | POST | Manual user registration |


# OAuth Setup

### Google

1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add redirect URI: `http://localhost:5000/login/google/callback`

### LinkedIn
1. Create app at LinkedIn Developers
2. Enable OpenID Connect
3. Add redirect URI: `http://localhost:5000/login/linkedin/callback`

### GitHub
1. Create OAuth app in GitHub Settings
2. Add callback URL: `http://localhost:5000/login/github/callback`


## Frontend Integration
The server is configured to redirect to a frontend running at `http://localhost:3000` after authentication. To integrate with your frontend:
1. Handle the redirect from `/dashboard#access_token=...&refresh_token=...`
2. Store tokens in localStorage or cookies
3. Include Authorization: Bearer <access_token> header in protected requests

## Testing
Use Postman or a frontend client to test the endpoints. For OAuth flows, visit the login endpoints directly in your browser.


# React Application SetUp

### 1. Installation
```bash
cd frontend
cd jobseek
```

### 2. Installing Dependencies
```bash
npm install
```
If getting any errors us this command instead: 
```bash
npm install --force
npm audit fix --force
```

### 3. Start The Development Server
```bash
npm start
```
Frontend server will start serving at `http://localhost:3000`
