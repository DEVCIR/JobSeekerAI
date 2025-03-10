from flask import Flask, request, jsonify, redirect, url_for
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, 
    create_access_token, 
    create_refresh_token,
    jwt_required,
    get_jwt_identity
)
import jwt 
from jwt import algorithms, PyJWKClient
from pymongo import MongoClient
import requests
import os
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta

load_dotenv()

app = Flask(__name__)
CORS(app)

# Mongo Configuration
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["auth_db"]
users_collection = db["users"]

# JWT Configuration
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=15)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=7)
jwt_manager = JWTManager(app)

# OAuth Credentials
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
LINKEDIN_CLIENT_ID = os.getenv("LINKEDIN_CLIENT_ID")
LINKEDIN_CLIENT_SECRET = os.getenv("LINKEDIN_CLIENT_SECRET")
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")

# Google OAuth URLs
GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"

# LinkedIn OpenID Connect URLs
LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization"
LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
LINKEDIN_OIDC_ISSUER = "https://www.linkedin.com"
LINKEDIN_OIDC_JWKS_URI = "https://www.linkedin.com/oauth/openid/jwks"

# GitHub OAuth URLs
GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USERINFO_URL = "https://api.github.com/user"
GITHUB_REDIRECT_URI = "http://localhost:5000/login/github/callback"

FRONTEND_DASHBOARD_URL = "http://localhost:3000/dashboard"
FRONTEND_ERROR_URL = "http://localhost:3000"


# ------------------------- Modified Callback Handlers ------------------------- #

def create_redirect_url(access_token, refresh_token):
    return f"{FRONTEND_DASHBOARD_URL}#access_token={access_token}&refresh_token={refresh_token}"



# ------------------------- Enhanced JWT Handlers ------------------------- #

@jwt_manager.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({
        "error": "token_expired",
        "message": "The access token has expired"
    }), 401

@jwt_manager.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({
        "error": "invalid_token",
        "message": "Signature verification failed"
    }), 401


def create_tokens(email):
    access_token = create_access_token(identity=email)
    refresh_token = create_refresh_token(identity=email)
    return access_token, refresh_token


# ------------------------- GOOGLE AUTHENTICATION ------------------------- #

@app.route("/login/google")
def login_google():
    """Redirect user to Google OAuth login."""
    google_redirect_uri = url_for("google_callback", _external=True)
    auth_url = (
        f"{GOOGLE_AUTH_URL}?client_id={GOOGLE_CLIENT_ID}&redirect_uri={google_redirect_uri}"
        f"&response_type=code&scope=email%20profile"
    )
    return redirect(auth_url)


@app.route("/login/google/callback")
def google_callback():
    """Handle Google OAuth callback."""
    code = request.args.get("code")
    if not code:
        return redirect(f"{FRONTEND_ERROR_URL}?message=Missing authorization code")

    try:
        google_redirect_uri = url_for("google_callback", _external=True)

        token_data = {
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": google_redirect_uri,
            "grant_type": "authorization_code",
        }
        token_response = requests.post(GOOGLE_TOKEN_URL, data=token_data).json()
        
        access_token = token_response.get("access_token")
        if not access_token:
            return jsonify({"error": "Failed to retrieve Google access token"}), 400

        user_info = requests.get(GOOGLE_USERINFO_URL, headers={"Authorization": f"Bearer {access_token}"}).json()
        email = user_info.get("email")
        name = user_info.get("name")

        if not email:
            return jsonify({"error": "Google login failed - no email returned"}), 400

        # Store or retrieve user from database
        existing_user = users_collection.find_one({"email": email})
        if existing_user:
            if existing_user.get("name") is None:
                users_collection.update_one(
                    {"email": email},
                    {"$set": {"name": name}}
                )
            print("Updated user name for existing user with null name!")
            # Ensure oauth_provider is a list and add Google if not present
            if "oauth_provider" in existing_user:
                providers = existing_user["oauth_provider"]
                if isinstance(providers, list):
                    if "google" not in providers:
                        users_collection.update_one(
                            {"email": email},
                            {"$addToSet": {"oauth_provider": "google"}}
                        )
                        print("Added Google to existing user!")
                else:
                    # Convert single provider string to a list and add Google
                    users_collection.update_one(
                        {"email": email},
                        {"$set": {"oauth_provider": [providers, "google"]}}
                    )
                    print("Converted oauth_provider to list and added Google!")
            else:
                # Initialize oauth_provider as a list with Google
                users_collection.update_one(
                    {"email": email},
                    {"$set": {"oauth_provider": ["google"]}}
                )
                print("Initialized oauth_provider list with Google!")
        else:
            # Insert new user with Google in oauth_provider list
            users_collection.insert_one({
                "email": email,
                "name": name,
                "oauth_provider": ["google"]
            })
            print("New user inserted successfully!")

        # Generate JWT access token
        access_token, refresh_token = create_tokens(email)
        return redirect(create_redirect_url(access_token, refresh_token))
        
    except Exception as e:
        return redirect(f"{FRONTEND_ERROR_URL}?message=Google login failed: {str(e)}")


# ------------------------- LINKEDIN AUTHENTICATION ------------------------- #

@app.route("/login/linkedin")
def login_linkedin():
    """Redirect user to LinkedIn for OpenID Connect authentication."""
    linkedin_redirect_uri = url_for("linkedin_callback", _external=True)
    
    auth_url = (
        f"{LINKEDIN_AUTH_URL}?response_type=code"
        f"&client_id={LINKEDIN_CLIENT_ID}"
        f"&redirect_uri={linkedin_redirect_uri}"
        f"&scope=openid%20profile%20email"
    )
    
    return redirect(auth_url)

@app.route("/login/linkedin/callback")
def linkedin_callback():
    """Handle LinkedIn OAuth callback."""
    code = request.args.get("code")
    if not code:
            return redirect(f"{FRONTEND_ERROR_URL}?message=Missing authorization code")

    try:
        linkedin_redirect_uri = url_for("linkedin_callback", _external=True)

        # Exchange authorization code for access token
        token_data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": linkedin_redirect_uri,
            "client_id": LINKEDIN_CLIENT_ID,
            "client_secret": LINKEDIN_CLIENT_SECRET,
        }
        token_response = requests.post(LINKEDIN_TOKEN_URL, data=token_data).json()

        access_token = token_response.get("access_token")
        id_token = token_response.get("id_token") 

        if not access_token or not id_token:
            return jsonify({"error": "Failed to retrieve access token or ID token"}), 400

        # Decode ID Token securely using LinkedIn's JWKS
        try:
            jwks_client = PyJWKClient(LINKEDIN_OIDC_JWKS_URI)
            signing_key = jwks_client.get_signing_key_from_jwt(id_token).key

            decoded_token = jwt.decode(
                id_token,
                key=signing_key,
                algorithms=["RS256"],
                audience=LINKEDIN_CLIENT_ID,
            )
            
            email = decoded_token.get("email")
            name = decoded_token.get("name")
            linkedin_id = decoded_token.get("sub")
        except Exception as e:
            return jsonify({"error": f"Could not decode ID Token: {str(e)}"}), 400

        # Store or retrieve user from database
        existing_user = users_collection.find_one({"email": email})
        if existing_user:
            # Update name if it's null
            if existing_user.get("name") is None:
                users_collection.update_one(
                    {"email": email},
                    {"$set": {"name": name}}
                )
                print("Updated user name for existing user with null name!")

            # Ensure oauth_provider is a list and add LinkedIn if not present
            if "oauth_provider" in existing_user:
                providers = existing_user["oauth_provider"]
                if isinstance(providers, list):
                    if "linkedin" not in providers:
                        users_collection.update_one(
                            {"email": email},
                            {"$addToSet": {"oauth_provider": "linkedin"}}
                        )
                        print("Added LinkedIn to existing user!")
                else:
                    # Convert single provider string to a list and add LinkedIn
                    users_collection.update_one(
                        {"email": email},
                        {"$set": {"oauth_provider": [providers, "linkedin"]}}
                    )
                    print("Converted oauth_provider to list and added LinkedIn!")
            else:
                # Initialize oauth_provider as a list with LinkedIn
                users_collection.update_one(
                    {"email": email},
                    {"$set": {"oauth_provider": ["linkedin"]}}
                )
                print("Initialized oauth_provider list with LinkedIn!")
        else:
            # Insert new user with LinkedIn in oauth_provider list
            users_collection.insert_one({
                "email": email,
                "name": name,
                "linkedin_id": linkedin_id,
                "oauth_provider": ["linkedin"]
            })
            print("New user inserted successfully!")

        access_token, refresh_token = create_tokens(email)
        return redirect(create_redirect_url(access_token, refresh_token))
        
    except Exception as e:
        return redirect(f"{FRONTEND_ERROR_URL}?message=LinkedIn login failed: {str(e)}")


# ------------------------- GitHub AUTHENTICATION ------------------------- #

@app.route("/login/github")
def login_github():
    """Redirect user to GitHub OAuth login."""
    github_redirect_uri = url_for("github_callback", _external=True)
    
    auth_url = (
        f"{GITHUB_AUTH_URL}?client_id={GITHUB_CLIENT_ID}"
        f"&redirect_uri={github_redirect_uri}"
        f"&scope=user:email"
    )
    
    return redirect(auth_url)


@app.route("/login/github/callback")
def github_callback():
    """Handle GitHub OAuth callback."""
    code = request.args.get("code")
    if not code:
        return redirect(f"{FRONTEND_ERROR_URL}?message=Missing authorization code") 

    try:
        # Exchange code for access token
        token_data = {
            "client_id": GITHUB_CLIENT_ID,
            "client_secret": GITHUB_CLIENT_SECRET,
            "code": code,
            "redirect_uri": GITHUB_REDIRECT_URI,
        }
        headers = {"Accept": "application/json"}
        token_response = requests.post(GITHUB_TOKEN_URL, data=token_data, headers=headers).json()

        access_token = token_response.get("access_token")
        if not access_token:
            return jsonify({"error": "Failed to retrieve GitHub access token"}), 400

        # Fetch GitHub user profile
        user_headers = {"Authorization": f"Bearer {access_token}"}
        user_info = requests.get(GITHUB_USERINFO_URL, headers=user_headers).json()
        email = user_info.get("email")
        name = user_info.get("name", "")

        # 🔍 GitHub hides email by default, so fetch emails explicitly
        if not email:
            emails_response = requests.get("https://api.github.com/user/emails", headers=user_headers).json()
            for email_obj in emails_response:
                if email_obj.get("primary") and email_obj.get("verified"):
                    email = email_obj.get("email")
                    break

        if not email:
            return jsonify({"error": "GitHub login failed - no email returned"}), 400

        print(f"User Info: Name={name}, Email={email}")

        existing_user = users_collection.find_one({"email": email})
        print(f"Existing User: {existing_user}")

        if existing_user:
            # Update name if it's null
            if existing_user.get("name") is None:
                users_collection.update_one(
                    {"email": email},
                    {"$set": {"name": name}}
                )
                print("Updated user name for existing user with null name!")

            # Ensure oauth_provider is a list and add GitHub if not present
            if "oauth_provider" in existing_user:
                providers = existing_user["oauth_provider"]
                if isinstance(providers, list):
                    if "github" not in providers:
                        users_collection.update_one(
                            {"email": email},
                            {"$addToSet": {"oauth_provider": "github"}}
                        )
                        print("Added GitHub to existing user!")
                else:
                    # Convert single provider string to a list and add GitHub
                    users_collection.update_one(
                        {"email": email},
                        {"$set": {"oauth_provider": [providers, "github"]}}
                    )
                    print("Converted oauth_provider to list and added GitHub!")
            else:
                # Initialize oauth_provider as a list with GitHub
                users_collection.update_one(
                    {"email": email},
                    {"$set": {"oauth_provider": ["github"]}}
                )
                print("Initialized oauth_provider list with GitHub!")
        else:
            # Insert new user with GitHub in oauth_provider list
            users_collection.insert_one({
                "email": email,
                "name": name,
                "oauth_provider": ["github"]
            })
            print("New user inserted successfully!")

        access_token, refresh_token = create_tokens(email)
        return redirect(create_redirect_url(access_token, refresh_token))
        
    except Exception as e:
        return redirect(f"{FRONTEND_ERROR_URL}?message=GitHub login failed: {str(e)}")


# ------------------------- Manual User Registration ------------------------- #

@app.route("/register", methods=["POST"])
def register():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    name = data.get("name")
    
    if not email or not password or not name:
        return jsonify({"error": "Missing required fields"}), 400
    
    existing_user = users_collection.find_one({"email": email})
    if existing_user:
        return jsonify({"error": "User already exists"}), 400
    
    hashed_password = generate_password_hash(password)
    users_collection.insert_one({
        "email": email,
        "name": name,
        "password": hashed_password,
        "oauth_provider": []
    })  
    access_token, refresh_token = create_tokens(email)
    return jsonify({
        "message": "Registered Successfully"
    })

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    
    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400
    
    user = users_collection.find_one({"email": email})
    if not user or not check_password_hash(user.get("password", ""), password):
        return jsonify({"error": "Invalid email or password"}), 401
    
    access_token, refresh_token = create_tokens(email)
    return jsonify({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "message": "Login successful"
    })


# ------------------------- Token Refresh Route ------------------------- #

@app.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user)
    return jsonify({"access_token": new_access_token})


# ------------------------- Protected Routes ------------------------- #

@app.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    user = users_collection.find_one({"email": current_user})
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    return jsonify({
        "message": f"Hello {user['name']}",
        "email": current_user,
        "oauth_providers": user.get("oauth_provider", [])
    })

# ------------------------- RUN FLASK SERVER ------------------------- #

if __name__ == "__main__":
    app.run(debug=True)
