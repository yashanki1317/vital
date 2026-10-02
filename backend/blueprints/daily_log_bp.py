from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models import (
    DailyLog, Vital, SleepLog, WellnessLog, ActivityLog, LifestyleLog, SymptomLog, CycleLog
)

daily_log_bp = Blueprint('daily_log', __name__)

@daily_log_bp.route('/daily-log', methods=['POST'])
@daily_log_bp.route('/logs', methods=['POST'])
@daily_log_bp.route('/daily-log/<date_str>', methods=['PUT'])
@daily_log_bp.route('/logs/<date_str>', methods=['PUT'])
@jwt_required()
def save_daily_log(date_str=None):
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    target_date_str = date_str or data.get('log_date')
    if target_date_str:
        try:
            target_date = datetime.strptime(target_date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD.'}), 400
    else:
        target_date = datetime.utcnow().date()

    daily_log = DailyLog.query.filter_by(user_id=user_id, log_date=target_date).first()
    if not daily_log:
        daily_log = DailyLog(user_id=user_id, log_date=target_date)
        db.session.add(daily_log)
        db.session.flush()

    daily_log.general_notes = data.get('general_notes', daily_log.general_notes)

    # 1. Vitals
    vital_data = data.get('vital')
    if vital_data:
        vital = daily_log.vital or Vital(daily_log_id=daily_log.id)
        vital.resting_hr = int(vital_data['resting_hr']) if vital_data.get('resting_hr') is not None and str(vital_data['resting_hr']).strip() != '' else None
        vital.bp_systolic = int(vital_data['bp_systolic']) if vital_data.get('bp_systolic') is not None and str(vital_data['bp_systolic']).strip() != '' else None
        vital.bp_diastolic = int(vital_data['bp_diastolic']) if vital_data.get('bp_diastolic') is not None and str(vital_data['bp_diastolic']).strip() != '' else None
        vital.spo2 = float(vital_data['spo2']) if vital_data.get('spo2') is not None and str(vital_data['spo2']).strip() != '' else None
        vital.temperature_c = float(vital_data['temperature_c']) if vital_data.get('temperature_c') is not None and str(vital_data['temperature_c']).strip() != '' else None
        vital.weight_kg = float(vital_data['weight_kg']) if vital_data.get('weight_kg') is not None and str(vital_data['weight_kg']).strip() != '' else None
        db.session.add(vital)

    # 2. Sleep
    sleep_data = data.get('sleep')
    if sleep_data and (sleep_data.get('hours_slept') is not None or sleep_data.get('quality_score') is not None):
        sleep = daily_log.sleep or SleepLog(daily_log_id=daily_log.id)
        if sleep_data.get('hours_slept') is not None and str(sleep_data['hours_slept']).strip() != '':
            sleep.hours_slept = float(sleep_data['hours_slept'])
        if sleep_data.get('quality_score') is not None and str(sleep_data['quality_score']).strip() != '':
            sleep.quality_score = int(sleep_data['quality_score'])
        sleep.bedtime = sleep_data.get('bedtime')
        sleep.wake_time = sleep_data.get('wake_time')
        sleep.awakenings = int(sleep_data.get('awakenings', 0)) if sleep_data.get('awakenings') is not None else 0
        db.session.add(sleep)

    # 3. Wellness
    wellness_data = data.get('wellness')
    if wellness_data:
        wellness = daily_log.wellness or WellnessLog(daily_log_id=daily_log.id)
        wellness.energy_score = int(wellness_data.get('energy_score', 5))
        wellness.mood_score = int(wellness_data.get('mood_score', 5))
        wellness.stress_score = int(wellness_data.get('stress_score', 5))
        wellness.fatigue_score = int(wellness_data.get('fatigue_score', 5))
        db.session.add(wellness)

    # 4. Activity
    act_data = data.get('activity')
    if act_data:
        act = daily_log.activity or ActivityLog(daily_log_id=daily_log.id)
        act.steps = int(act_data.get('steps', 0)) if act_data.get('steps') is not None else 0
        act.exercise_mins = int(act_data.get('exercise_mins', 0)) if act_data.get('exercise_mins') is not None else 0
        act.exercise_type = act_data.get('exercise_type')
        act.activity_level = act_data.get('activity_level', 'Moderate')
        db.session.add(act)

    # 5. Lifestyle
    life_data = data.get('lifestyle')
    if life_data:
        life = daily_log.lifestyle or LifestyleLog(daily_log_id=daily_log.id)
        life.water_ml = int(life_data.get('water_ml', 0)) if life_data.get('water_ml') is not None else 0
        life.caffeine_mg = int(life_data.get('caffeine_mg', 0)) if life_data.get('caffeine_mg') is not None else 0
        life.alcohol_units = float(life_data.get('alcohol_units', 0)) if life_data.get('alcohol_units') is not None else 0
        life.nicotine_used = bool(life_data.get('nicotine_used', False))
        life.nutrition_notes = life_data.get('nutrition_notes')
        db.session.add(life)

    # 6. Symptoms
    symptoms_data = data.get('symptoms')
    if symptoms_data is not None:
        SymptomLog.query.filter_by(daily_log_id=daily_log.id).delete()
        for s in symptoms_data:
            s_name = s.get('symptom_name') if isinstance(s, dict) else str(s)
            s_sev = s.get('severity', 'Moderate') if isinstance(s, dict) else 'Moderate'
            s_notes = s.get('notes') if isinstance(s, dict) else None
            if s_name:
                db.session.add(SymptomLog(
                    daily_log_id=daily_log.id,
                    symptom_name=s_name,
                    severity=s_sev,
                    notes=s_notes
                ))

    # 7. Cycle (Optional)
    cycle_data = data.get('cycle')
    if cycle_data:
        cycle = daily_log.cycle or CycleLog(daily_log_id=daily_log.id)
        cycle.is_period_day = bool(cycle_data.get('is_period_day', False))
        cycle.flow_level = cycle_data.get('flow_level')
        cycle.cramps_level = int(cycle_data.get('cramps_level', 0)) if cycle_data.get('cramps_level') is not None else 0
        cycle.notes = cycle_data.get('notes')
        db.session.add(cycle)

    db.session.commit()
    return jsonify({
        'message': 'Daily log saved successfully.',
        'log': daily_log.to_dict()
    }), 200


@daily_log_bp.route('/daily-log/<date_str>', methods=['GET'])
@daily_log_bp.route('/logs/<date_str>', methods=['GET'])
@jwt_required()
def get_log_by_date(date_str):
    user_id = int(get_jwt_identity())
    try:
        target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD.'}), 400

    log = DailyLog.query.filter_by(user_id=user_id, log_date=target_date).first()
    return jsonify({'log': log.to_dict() if log else None}), 200


@daily_log_bp.route('/daily-log/<date_str>', methods=['DELETE'])
@daily_log_bp.route('/logs/<date_str>', methods=['DELETE'])
@jwt_required()
def delete_log_by_date(date_str):
    user_id = int(get_jwt_identity())
    try:
        target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD.'}), 400

    log = DailyLog.query.filter_by(user_id=user_id, log_date=target_date).first()
    if not log:
        return jsonify({'error': 'Log entry not found for date.'}), 404

    db.session.delete(log)
    db.session.commit()
    return jsonify({'message': f'Log entry for {date_str} deleted successfully.'}), 200


@daily_log_bp.route('/daily-logs', methods=['GET'])
@daily_log_bp.route('/logs', methods=['GET'])
@jwt_required()
def get_daily_logs():
    user_id = int(get_jwt_identity())
    logs = DailyLog.query.filter_by(user_id=user_id).order_by(DailyLog.log_date.desc()).all()
    return jsonify({'logs': [l.to_dict() for l in logs]}), 200
