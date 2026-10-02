from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from analytics_service import AnalyticsService

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/trends', methods=['GET'])
@jwt_required()
def get_trends():
    user_id = int(get_jwt_identity())
    range_param = request.args.get('range', '30d')

    days_map = {'7d': 7, '30d': 30, '90d': 90, '1y': 365}
    days = days_map.get(range_param, 30)

    logs = AnalyticsService.get_user_logs(user_id, days=days)

    chart_series = []
    for l in logs:
        chart_series.append({
            'date': l.log_date.isoformat(),
            'resting_hr': l.vital.resting_hr if l.vital else None,
            'bp_systolic': l.vital.bp_systolic if l.vital else None,
            'bp_diastolic': l.vital.bp_diastolic if l.vital else None,
            'weight_kg': l.vital.weight_kg if l.vital else None,
            'hours_slept': l.sleep.hours_slept if l.sleep else None,
            'sleep_quality': l.sleep.quality_score if l.sleep else None,
            'energy_score': l.wellness.energy_score if l.wellness else None,
            'mood_score': l.wellness.mood_score if l.wellness else None,
            'stress_score': l.wellness.stress_score if l.wellness else None,
            'steps': l.activity.steps if l.activity else None,
            'water_ml': l.lifestyle.water_ml if l.lifestyle else None
        })

    # Calculate summaries
    sleep_vals = [s['hours_slept'] for s in chart_series if s['hours_slept'] is not None]
    hr_vals = [s['resting_hr'] for s in chart_series if s['resting_hr'] is not None]
    energy_vals = [s['energy_score'] for s in chart_series if s['energy_score'] is not None]
    mood_vals = [s['mood_score'] for s in chart_series if s['mood_score'] is not None]

    summaries = []
    if len(sleep_vals) >= 2:
        half = len(sleep_vals) // 2
        first_half = sum(sleep_vals[:half]) / half
        second_half = sum(sleep_vals[half:]) / len(sleep_vals[half:])
        diff = round(second_half - first_half, 2)
        if abs(diff) >= 0.1:
            direction = "increased" if diff > 0 else "decreased"
            summaries.append(f"Your average sleep {direction} by {abs(diff)} hours over the selected period.")

    if len(hr_vals) >= 2:
        avg_hr = round(sum(hr_vals) / len(hr_vals), 1)
        summaries.append(f"Your average resting heart rate was {avg_hr} bpm across {len(hr_vals)} logged entries.")

    if len(energy_vals) >= 2:
        avg_e = round(sum(energy_vals) / len(energy_vals), 1)
        summaries.append(f"Average reported energy score: {avg_e}/10.")

    return jsonify({
        'range': range_param,
        'days': days,
        'data_points': len(chart_series),
        'chart_series': chart_series,
        'written_summaries': summaries
    }), 200


@analytics_bp.route('/baseline', methods=['GET'])
@jwt_required()
def get_baselines():
    user_id = int(get_jwt_identity())
    window = int(request.args.get('window', 30))
    baselines = AnalyticsService.calculate_baselines(user_id, window_days=window)
    return jsonify({'baselines': baselines}), 200


@analytics_bp.route('/correlations', methods=['GET'])
@jwt_required()
def get_correlations():
    user_id = int(get_jwt_identity())
    correlations = AnalyticsService.calculate_correlations(user_id, days=60)
    return jsonify(correlations), 200
