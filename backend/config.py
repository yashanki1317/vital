import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

def get_database_uri():
    db_url = os.environ.get('DATABASE_URL', '').strip()
    if db_url:
        if db_url.startswith("postgres://"):
            db_url = db_url.replace("postgres://", "postgresql://", 1)
        return db_url
    return f"sqlite:///{os.path.abspath(os.path.join(os.path.dirname(__file__), 'vital.db'))}"

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'vital-default-secret-key-prod-change-2026')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'vital-jwt-secret-key-prod-change-2026')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    
    SQLALCHEMY_DATABASE_URI = get_database_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY', '').strip()
    FLASK_ENV = os.environ.get('FLASK_ENV', 'development')

