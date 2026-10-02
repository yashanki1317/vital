import os
import sys
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate

# Ensure services and models are importable
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'services'))

from config import Config
from database import db
import models  # Ensure models are registered

from blueprints.auth_bp import auth_bp
from blueprints.profile_bp import profile_bp
from blueprints.daily_log_bp import daily_log_bp
from blueprints.dashboard_bp import dashboard_bp
from blueprints.analytics_bp import analytics_bp
from blueprints.insights_bp import insights_bp
from blueprints.timeline_bp import timeline_bp
from blueprints.chat_bp import chat_bp

migrate = Migrate()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable CORS for all origins in dev mode
    CORS(app, resources={r"/api/*": {"origins": "*"}, r"/uploads/*": {"origins": "*"}})

    db.init_app(app)
    migrate.init_app(app, db)
    jwt = JWTManager(app)

    @jwt.unauthorized_loader
    def unauthorized_response(callback):
        return jsonify({'error': 'Missing or invalid Authorization header.'}), 401

    @jwt.invalid_token_loader
    def invalid_token_response(callback):
        return jsonify({'error': 'Signature verification failed or token malformed.'}), 401

    @jwt.expired_token_loader
    def expired_token_response(jwt_header, jwt_payload):
        return jsonify({'error': 'Session expired. Please log in again.'}), 401

    # Register API blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(profile_bp, url_prefix='/api/profile')
    app.register_blueprint(daily_log_bp, url_prefix='/api')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(analytics_bp, url_prefix='/api')
    app.register_blueprint(insights_bp, url_prefix='/api/insights')
    app.register_blueprint(timeline_bp, url_prefix='/api/timeline')
    app.register_blueprint(chat_bp, url_prefix='/api/chat')

    # Static file serving for uploads (e.g. avatars)
    upload_folder = os.path.join(app.root_path, 'uploads')
    os.makedirs(upload_folder, exist_ok=True)
    os.makedirs(os.path.join(upload_folder, 'avatars'), exist_ok=True)

    @app.route('/uploads/<path:filename>')
    def serve_upload(filename):
        return send_from_directory(upload_folder, filename)

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'app': 'VITAL Personal Health & Wellness Platform',
            'version': '1.0.0',
            'database': app.config['SQLALCHEMY_DATABASE_URI'].split('://')[0]
        }), 200

    # Auto create tables in app context
    with app.app_context():
        try:
            db.create_all()
            print("✓ Database tables verified and created successfully.")
        except Exception as e:
            print(f"⚠️ Warning during database initialization: {e}")

    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"🚀 VITAL Flask server starting on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
