from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import DailyLog

timeline_bp = Blueprint('timeline', __name__)

@timeline_bp.route('', methods=['GET'])
@jwt_required()
def get_timeline():
    user_id = int(get_jwt_identity())
    logs = DailyLog.query.filter_by(user_id=user_id).order_by(DailyLog.log_date.desc()).all()
    return jsonify({
        'timeline': [l.to_dict() for l in logs]
    }), 200
