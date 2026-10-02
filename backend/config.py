import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'vital-default-secret-key-prod-change-2026')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'vital-jwt-secret-key-prod-change-2026')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    
    db_url = os.environ.get('DATABASE_URL', '').strip()
    if not db_url:
        db_url = f"sqlite:///{os.path.abspath(os.path.join(os.path.dirname(__file__), 'vital.db'))}"
    elif db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
        
    SQLALCHEMY_DATABASE_URI = db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY', '').strip()
    FLASK_ENV = os.environ.get('FLASK_ENV', 'development')
