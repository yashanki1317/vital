from flask import Blueprint, jsonify
from demo_service import DemoService

demo_bp = Blueprint('demo', __name__)

@demo_bp.route('/data', methods=['GET'])
def get_demo_data():
    demo_payload = DemoService.generate_demo_dataset()
    return jsonify(demo_payload), 200
