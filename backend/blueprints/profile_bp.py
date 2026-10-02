import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from database import db
from models import Profile, User

profile_bp = Blueprint('profile', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif'}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@profile_bp.route('', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = int(get_jwt_identity())
    profile = Profile.query.filter_by(user_id=user_id).first()
    if not profile or not profile.name:
        return jsonify({'profile': profile.to_dict() if profile else None, 'onboarding_completed': False}), 200
    
    # Consider onboarding completed if name and basic stats exist
    onboarding_completed = bool(profile.name and (profile.age or profile.date_of_birth))
    return jsonify({'profile': profile.to_dict(), 'onboarding_completed': onboarding_completed}), 200


@profile_bp.route('', methods=['POST', 'PUT'])
@jwt_required()
def create_or_update_profile():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    name = data.get('name', '').strip() or data.get('full_name', '').strip()
    date_of_birth = data.get('date_of_birth')
    age = data.get('age')
    sex = data.get('sex', 'prefer_not_to_say')
    height_cm = data.get('height_cm')
    weight_kg = data.get('weight_kg')
    activity_level = data.get('activity_level', 'moderately_active')

    if not name:
        return jsonify({'error': 'Name is required.'}), 400

    profile = Profile.query.filter_by(user_id=user_id).first()
    if not profile:
        profile = Profile(user_id=user_id)

    profile.name = name
    if date_of_birth is not None:
        profile.date_of_birth = str(date_of_birth)
    if age is not None and age != '':
        profile.age = int(age)
    if sex:
        profile.sex = sex
    if height_cm is not None and height_cm != '':
        profile.height_cm = float(height_cm)
    if weight_kg is not None and weight_kg != '':
        profile.weight_kg = float(weight_kg)
    
    profile.activity_level = activity_level
    profile.health_goals = data.get('health_goals', profile.health_goals or [])
    profile.emergency_contact = data.get('emergency_contact', profile.emergency_contact)
    
    if 'typical_sleep_hrs' in data and data['typical_sleep_hrs'] is not None:
        profile.typical_sleep_hrs = float(data['typical_sleep_hrs'])
    if 'typical_rhr' in data and data['typical_rhr'] is not None:
        profile.typical_rhr = int(data['typical_rhr'])
        
    profile.has_bp_monitor = bool(data.get('has_bp_monitor', profile.has_bp_monitor))
    profile.uses_wearable = bool(data.get('uses_wearable', profile.uses_wearable))
    profile.cycle_tracking_enabled = bool(data.get('cycle_tracking_enabled', profile.cycle_tracking_enabled))
    
    profile.notification_checkin_reminders = bool(data.get('notification_checkin_reminders', profile.notification_checkin_reminders))
    profile.notification_weekly_summaries = bool(data.get('notification_weekly_summaries', profile.notification_weekly_summaries))

    db.session.add(profile)
    db.session.commit()

    return jsonify({
        'message': 'Profile updated successfully.',
        'profile': profile.to_dict()
    }), 200


@profile_bp.route('/avatar', methods=['POST'])
@jwt_required()
def upload_avatar():
    user_id = int(get_jwt_identity())
    profile = Profile.query.filter_by(user_id=user_id).first()
    if not profile:
        return jsonify({'error': 'Profile not found.'}), 404

    if 'avatar' not in request.files:
        return jsonify({'error': 'No image file provided in request.'}), 400

    file = request.files['avatar']
    if file.filename == '':
        return jsonify({'error': 'No file selected.'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Allowed formats: PNG, JPG, JPEG, WEBP, GIF.'}), 400

    # Read content to check length
    file_bytes = file.read()
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        return jsonify({'error': 'File size exceeds maximum limit of 5 MB.'}), 400

    # Ensure upload directory exists
    upload_dir = os.path.join(current_app.root_path, 'uploads', 'avatars')
    os.makedirs(upload_dir, exist_ok=True)

    ext = file.filename.rsplit('.', 1)[1].lower()
    unique_filename = f"user_{user_id}_{uuid.uuid4().hex[:8]}.{ext}"
    filepath = os.path.join(upload_dir, unique_filename)

    with open(filepath, 'wb') as f:
        f.write(file_bytes)

    # Remove old avatar file if exists
    if profile.profile_picture_url and '/uploads/avatars/' in profile.profile_picture_url:
        old_filename = profile.profile_picture_url.split('/uploads/avatars/')[-1]
        old_path = os.path.join(upload_dir, old_filename)
        if os.path.exists(old_path):
            try:
                os.remove(old_path)
            except Exception:
                pass

    # Save relative public URL
    profile.profile_picture_url = f"/uploads/avatars/{unique_filename}"
    db.session.commit()

    return jsonify({
        'message': 'Profile picture uploaded successfully.',
        'profile_picture_url': profile.profile_picture_url,
        'profile': profile.to_dict()
    }), 200


@profile_bp.route('/avatar', methods=['DELETE'])
@jwt_required()
def delete_avatar():
    user_id = int(get_jwt_identity())
    profile = Profile.query.filter_by(user_id=user_id).first()
    if not profile:
        return jsonify({'error': 'Profile not found.'}), 404

    if profile.profile_picture_url and '/uploads/avatars/' in profile.profile_picture_url:
        filename = profile.profile_picture_url.split('/uploads/avatars/')[-1]
        upload_dir = os.path.join(current_app.root_path, 'uploads', 'avatars')
        path = os.path.join(upload_dir, filename)
        if os.path.exists(path):
            try:
                os.remove(path)
            except Exception:
                pass

    profile.profile_picture_url = None
    db.session.commit()

    return jsonify({
        'message': 'Profile picture removed successfully.',
        'profile': profile.to_dict()
    }), 200


@profile_bp.route('', methods=['DELETE'])
@profile_bp.route('/account', methods=['DELETE'])
@jwt_required()
def delete_account():
    """Permanently deletes current user account and ALL associated records."""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found.'}), 404

    # Remove uploaded avatar file if exists
    profile = user.profile
    if profile and profile.profile_picture_url and '/uploads/avatars/' in profile.profile_picture_url:
        filename = profile.profile_picture_url.split('/uploads/avatars/')[-1]
        upload_dir = os.path.join(current_app.root_path, 'uploads', 'avatars')
        path = os.path.join(upload_dir, filename)
        if os.path.exists(path):
            try:
                os.remove(path)
            except Exception:
                pass

    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'Account and all associated health data permanently deleted.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete account: {str(e)}'}), 500
