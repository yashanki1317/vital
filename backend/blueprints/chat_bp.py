from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from claude_service import ClaudeService
from models import ChatConversation, ChatMessage
from database import db

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('', methods=['POST'])
@jwt_required()
def send_chat_message():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    message = data.get('message', '').strip()
    conversation_id = data.get('conversation_id')

    if not message:
        return jsonify({'error': 'Message text is required.'}), 400

    reply_msg, conv_dict = ClaudeService.chat_with_data(user_id, message, conversation_id=conversation_id)
    return jsonify({
        'reply': reply_msg,
        'conversation': conv_dict
    }), 200


@chat_bp.route('/conversations', methods=['GET'])
@jwt_required()
def get_conversations():
    user_id = int(get_jwt_identity())
    convs = ChatConversation.query.filter_by(user_id=user_id).order_by(ChatConversation.updated_at.desc()).all()
    return jsonify({'conversations': [c.to_dict() for c in convs]}), 200


@chat_bp.route('/conversations', methods=['POST'])
@jwt_required()
def create_conversation():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    title = data.get('title', 'New Health Conversation').strip()

    conv = ChatConversation(user_id=user_id, title=title)
    db.session.add(conv)
    db.session.commit()
    return jsonify({'conversation': conv.to_dict()}), 201


@chat_bp.route('/conversations/<int:id>', methods=['GET'])
@jwt_required()
def get_conversation_messages(id):
    user_id = int(get_jwt_identity())
    conv = ChatConversation.query.filter_by(id=id, user_id=user_id).first()
    if not conv:
        return jsonify({'error': 'Conversation not found.'}), 404

    messages = ChatMessage.query.filter_by(conversation_id=id).order_by(ChatMessage.created_at.asc()).all()
    return jsonify({
        'conversation': conv.to_dict(),
        'messages': [m.to_dict() for m in messages]
    }), 200


@chat_bp.route('/conversations/<int:id>', methods=['PUT'])
@jwt_required()
def rename_conversation(id):
    user_id = int(get_jwt_identity())
    conv = ChatConversation.query.filter_by(id=id, user_id=user_id).first()
    if not conv:
        return jsonify({'error': 'Conversation not found.'}), 404

    data = request.get_json() or {}
    title = data.get('title', '').strip()
    if not title:
        return jsonify({'error': 'Title is required.'}), 400

    conv.title = title
    db.session.commit()
    return jsonify({'conversation': conv.to_dict()}), 200


@chat_bp.route('/conversations/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_conversation(id):
    user_id = int(get_jwt_identity())
    conv = ChatConversation.query.filter_by(id=id, user_id=user_id).first()
    if not conv:
        return jsonify({'error': 'Conversation not found.'}), 404

    db.session.delete(conv)
    db.session.commit()
    return jsonify({'message': 'Conversation deleted successfully.'}), 200
