from datetime import datetime
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from analytics_service import AnalyticsService
from models import Profile, DailyLog, AIInsight

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('', methods=['GET'])
@jwt_required()
def get_dashboard_data():
    user_id = int(get_jwt_identity())
    profile = Profile.query.filter_by(user_id=user_id).first()
    
    # Today's date
    today = datetime.utcnow().date()
    today_log = DailyLog.query.filter_by(user_id=user_id, log_date=today).first()
    
    # If today's log doesn't exist, check latest log
    latest_log = DailyLog.query.filter_by(user_id=user_id).order_by(DailyLog.log_date.desc()).first()

    baselines = AnalyticsService.calculate_baselines(user_id, window_days=30)
    alerts = AnalyticsService.get_things_to_notice(user_id)

    recent_insights = AIInsight.query.filter_by(user_id=user_id)\
        .order_by(AIInsight.created_at.desc()).limit(3).all()

    # Snapshot comparisons
    active_log = today_log or latest_log
    snapshot = {}

    if active_log:
        vital = active_log.vital
        sleep = active_log.sleep
        wellness = active_log.wellness
        activity = active_log.activity
        lifestyle = active_log.lifestyle

        if vital and vital.resting_hr is not None:
            comp = AnalyticsService.compare_value_to_baseline(
                vital.resting_hr, baselines.get('resting_hr', {}), 'Resting HR', 'bpm'
            )
            snapshot['resting_hr'] = {
                'value': vital.resting_hr,
                'unit': 'bpm',
                'comparison': comp['message'],
                'status': comp['status']
            }

        if vital and (vital.bp_systolic or vital.bp_diastolic):
            snapshot['blood_pressure'] = {
                'systolic': vital.bp_systolic,
                'diastolic': vital.bp_diastolic,
                'formatted': f"{vital.bp_systolic or '--'}/{vital.bp_diastolic or '--'} mmHg"
            }

        if sleep and sleep.hours_slept is not None:
            comp = AnalyticsService.compare_value_to_baseline(
                sleep.hours_slept, baselines.get('hours_slept', {}), 'Sleep', 'h'
            )
            snapshot['sleep'] = {
                'value': sleep.hours_slept,
                'quality': sleep.quality_score,
                'formatted': f"{int(sleep.hours_slept)}h {int((sleep.hours_slept % 1)*60)}m",
                'comparison': comp['message'],
                'status': comp['status']
            }

        if wellness:
            snapshot['wellness'] = {
                'energy': wellness.energy_score,
                'mood': wellness.mood_score,
                'stress': wellness.stress_score,
                'fatigue': wellness.fatigue_score
            }

        if activity and activity.steps:
            snapshot['activity'] = {
                'steps': activity.steps,
                'exercise_mins': activity.exercise_mins,
                'exercise_type': activity.exercise_type
            }

        if lifestyle and lifestyle.water_ml:
            snapshot['hydration'] = {
                'water_ml': lifestyle.water_ml
            }

    sufficient_data = baselines.get('_sufficient_data', False)
    total_days = baselines.get('_total_days_logged', 0)

    return jsonify({
        'profile': profile.to_dict() if profile else None,
        'today_logged': today_log is not None,
        'snapshot_date': active_log.log_date.isoformat() if active_log else None,
        'snapshot': snapshot,
        'baselines': baselines,
        'alerts': alerts,
        'recent_insights': [i.to_dict() for i in recent_insights],
        'total_days_logged': total_days,
        'sufficient_data': sufficient_data,
        'empty_state_message': None if sufficient_data else (
            "Your baseline is still forming. Log a few more days to unlock personalized trends and correlations."
            if total_days > 0 else "Start logging daily to build your personal health baseline."
        )
    }), 200
