from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from claude_service import ClaudeService
from models import AIInsight, ChatMessage
from database import db

insights_bp = Blueprint('insights', __name__)

@insights_bp.route('', methods=['GET'])
@jwt_required()
def get_insights():
    user_id = int(get_jwt_identity())
    insights = AIInsight.query.filter_by(user_id=user_id).order_by(AIInsight.created_at.desc()).all()
    
    # If user has no insights yet, generate initial insights automatically
    if not insights:
        insights_data = ClaudeService.generate_insights(user_id)
        return jsonify({'insights': insights_data}), 200

    return jsonify({'insights': [i.to_dict() for i in insights]}), 200


@insights_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_insights():
    user_id = int(get_jwt_identity())
    insights_data = ClaudeService.generate_insights(user_id)
    return jsonify({'message': 'Insights generated successfully.', 'insights': insights_data}), 200


@insights_bp.route('/chat', methods=['POST'])
@jwt_required()
def chat_with_data():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    message = data.get('message', '').strip()
    conversation_id = data.get('conversation_id')

    if not message:
        return jsonify({'error': 'Message is required.'}), 400

    reply_msg, conv = ClaudeService.chat_with_data(user_id, message, conversation_id=conversation_id)
    return jsonify({'reply': reply_msg, 'conversation': conv}), 200


@insights_bp.route('/chat/history', methods=['GET'])
@jwt_required()
def chat_history():
    user_id = int(get_jwt_identity())
    messages = ChatMessage.query.filter_by(user_id=user_id).order_by(ChatMessage.created_at.asc()).all()
    return jsonify({'messages': [m.to_dict() for m in messages]}), 200
