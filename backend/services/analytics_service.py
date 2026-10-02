import math
from datetime import datetime, timedelta
from database import db
from models import DailyLog, Vital, SleepLog, WellnessLog, ActivityLog, LifestyleLog, SymptomLog

class AnalyticsService:

    @staticmethod
    def get_user_logs(user_id, days=90):
        """Retrieve user daily logs for the last N days ordered by date ascending."""
        cutoff = datetime.utcnow().date() - timedelta(days=days)
        return DailyLog.query.filter(
            DailyLog.user_id == user_id,
            DailyLog.log_date >= cutoff
        ).order_by(DailyLog.log_date.asc()).all()

    @staticmethod
    def calculate_baselines(user_id, window_days=30):
        """
        Calculates personal baseline averages and standard deviations
        from the user's recent historical data (default 30 days).
        """
        logs = AnalyticsService.get_user_logs(user_id, days=window_days)
        
        metrics = {
            'resting_hr': [],
            'bp_systolic': [],
            'bp_diastolic': [],
            'hours_slept': [],
            'sleep_quality': [],
            'energy_score': [],
            'mood_score': [],
            'stress_score': [],
            'steps': [],
            'water_ml': [],
            'weight_kg': []
        }

        for log in logs:
            if log.vital:
                if log.vital.resting_hr is not None:
                    metrics['resting_hr'].append(log.vital.resting_hr)
                if log.vital.bp_systolic is not None:
                    metrics['bp_systolic'].append(log.vital.bp_systolic)
                if log.vital.bp_diastolic is not None:
                    metrics['bp_diastolic'].append(log.vital.bp_diastolic)
                if log.vital.weight_kg is not None:
                    metrics['weight_kg'].append(log.vital.weight_kg)

            if log.sleep:
                if log.sleep.hours_slept is not None:
                    metrics['hours_slept'].append(log.sleep.hours_slept)
                if log.sleep.quality_score is not None:
                    metrics['sleep_quality'].append(log.sleep.quality_score)

            if log.wellness:
                if log.wellness.energy_score is not None:
                    metrics['energy_score'].append(log.wellness.energy_score)
                if log.wellness.mood_score is not None:
                    metrics['mood_score'].append(log.wellness.mood_score)
                if log.wellness.stress_score is not None:
                    metrics['stress_score'].append(log.wellness.stress_score)

            if log.activity:
                if log.activity.steps is not None and log.activity.steps > 0:
                    metrics['steps'].append(log.activity.steps)

            if log.lifestyle:
                if log.lifestyle.water_ml is not None and log.lifestyle.water_ml > 0:
                    metrics['water_ml'].append(log.lifestyle.water_ml)

        baselines = {}
        total_days_logged = len(logs)

        for key, values in metrics.items():
            if not values:
                baselines[key] = {
                    'count': 0,
                    'avg': None,
                    'stddev': None,
                    'min': None,
                    'max': None,
                    'range_low': None,
                    'range_high': None
                }
                continue

            count = len(values)
            avg = round(sum(values) / count, 1)
            
            if count > 1:
                variance = sum((x - avg) ** 2 for x in values) / (count - 1)
                stddev = round(math.sqrt(variance), 1)
            else:
                stddev = 0.0

            low = round(max(0, avg - max(stddev, 1.0)), 1)
            high = round(avg + max(stddev, 1.0), 1)

            baselines[key] = {
                'count': count,
                'avg': avg,
                'stddev': stddev,
                'min': min(values),
                'max': max(values),
                'range_low': low,
                'range_high': high
            }

        baselines['_total_days_logged'] = total_days_logged
        baselines['_sufficient_data'] = total_days_logged >= 3
        return baselines

    @staticmethod
    def compare_value_to_baseline(value, baseline_info, metric_label, unit=''):
        """Generates clear, non-diagnostic comparative status text."""
        if value is None or baseline_info['avg'] is None:
            return {'status': 'neutral', 'message': 'No baseline established yet.'}

        avg = baseline_info['avg']
        low = baseline_info['range_low']
        high = baseline_info['range_high']

        if low <= value <= high:
            return {
                'status': 'normal',
                'comparison': 'usual',
                'message': f'Within your usual personal range ({low} - {high} {unit}).'
            }
        elif value > high:
            diff = round(value - avg, 1)
            return {
                'status': 'higher',
                'comparison': 'elevated',
                'message': f'Higher than your recent personal baseline ({avg} {unit}). (+{diff} {unit})'
            }
        else:
            diff = round(avg - value, 1)
            return {
                'status': 'lower',
                'comparison': 'decreased',
                'message': f'Lower than your recent personal baseline ({avg} {unit}). (-{diff} {unit})'
            }

    @staticmethod
    def calculate_correlations(user_id, days=60):
        """
        Calculates simple statistical correlations and patterns across logged variables.
        Explicitly non-causal.
        """
        logs = AnalyticsService.get_user_logs(user_id, days=days)
        if len(logs) < 5:
            return {
                'sufficient_data': False,
                'message': 'Log at least 5 days to unlock personalized correlation analysis.',
                'patterns': []
            }

        # Extract pairs
        sleep_vs_energy = []
        stress_vs_sleep = []
        caffeine_vs_sleep = []
        exercise_vs_mood = []
        hydration_vs_fatigue = []

        for log in logs:
            sleep_hrs = log.sleep.hours_slept if log.sleep else None
            energy = log.wellness.energy_score if log.wellness else None
            stress = log.wellness.stress_score if log.wellness else None
            mood = log.wellness.mood_score if log.wellness else None
            fatigue = log.wellness.fatigue_score if log.wellness else None
            caffeine = log.lifestyle.caffeine_mg if log.lifestyle else None
            exercise = log.activity.exercise_mins if log.activity else None
            water = log.lifestyle.water_ml if log.lifestyle else None

            if sleep_hrs is not None and energy is not None:
                sleep_vs_energy.append((sleep_hrs, energy))
            if stress is not None and sleep_hrs is not None:
                stress_vs_sleep.append((stress, sleep_hrs))
            if caffeine is not None and sleep_hrs is not None:
                caffeine_vs_sleep.append((caffeine, sleep_hrs))
            if exercise is not None and mood is not None:
                exercise_vs_mood.append((exercise, mood))
            if water is not None and fatigue is not None:
                hydration_vs_fatigue.append((water, fatigue))

        patterns = []

        # Sleep vs Energy pattern
        if len(sleep_vs_energy) >= 5:
            avg_sleep = sum(s for s, e in sleep_vs_energy) / len(sleep_vs_energy)
            high_sleep_energy = [e for s, e in sleep_vs_energy if s >= avg_sleep]
            low_sleep_energy = [e for s, e in sleep_vs_energy if s < avg_sleep]

            if high_sleep_energy and low_sleep_energy:
                avg_high_e = sum(high_sleep_energy) / len(high_sleep_energy)
                avg_low_e = sum(low_sleep_energy) / len(low_sleep_energy)
                diff = round(avg_high_e - avg_low_e, 1)

                if abs(diff) >= 0.5:
                    patterns.append({
                        'title': 'Sleep & Energy Co-occurrence',
                        'type': 'positive' if diff > 0 else 'negative',
                        'metric_a': 'Sleep Duration',
                        'metric_b': 'Energy Rating',
                        'observation': f"On days when your sleep was above your average ({round(avg_sleep, 1)}h), your logged energy score was {diff} points {'higher' if diff > 0 else 'lower'} on average.",
                        'disclaimer': 'This observation reflects co-occurrence in your logged data, not a direct medical cause.'
                    })

        # Stress vs Sleep pattern
        if len(stress_vs_sleep) >= 5:
            high_stress_sleep = [sl for st, sl in stress_vs_sleep if st >= 6]
            low_stress_sleep = [sl for st, sl in stress_vs_sleep if st < 6]
            if high_stress_sleep and low_stress_sleep:
                avg_hs_sl = sum(high_stress_sleep) / len(high_stress_sleep)
                avg_ls_sl = sum(low_stress_sleep) / len(low_stress_sleep)
                diff = round(avg_ls_sl - avg_hs_sl, 1)
                if diff >= 0.4:
                    patterns.append({
                        'title': 'Stress & Sleep Relationship',
                        'type': 'inverse',
                        'metric_a': 'Stress Level',
                        'metric_b': 'Sleep Duration',
                        'observation': f"On days with lower stress (<6/10), you logged an average of {round(avg_ls_sl, 1)}h of sleep compared to {round(avg_hs_sl, 1)}h on higher-stress days.",
                        'disclaimer': 'Logged relationship, not medical diagnosis.'
                    })

        # Exercise vs Mood pattern
        if len(exercise_vs_mood) >= 5:
            workout_days_mood = [m for ex, m in exercise_vs_mood if ex >= 20]
            rest_days_mood = [m for ex, m in exercise_vs_mood if ex < 20]
            if workout_days_mood and rest_days_mood:
                avg_wm = sum(workout_days_mood) / len(workout_days_mood)
                avg_rm = sum(rest_days_mood) / len(rest_days_mood)
                diff = round(avg_wm - avg_rm, 1)
                if abs(diff) >= 0.5:
                    patterns.append({
                        'title': 'Physical Activity & Mood',
                        'type': 'positive' if diff > 0 else 'neutral',
                        'metric_a': 'Exercise (>20m)',
                        'metric_b': 'Mood Score',
                        'observation': f"On active days (20+ min exercise), your average logged mood score was {round(avg_wm, 1)}/10 compared to {round(avg_rm, 1)}/10 on rest days.",
                        'disclaimer': 'Data correlation from your personal logs.'
                    })

        return {
            'sufficient_data': True,
            'total_logs_analyzed': len(logs),
            'patterns': patterns
        }

    @staticmethod
    def get_things_to_notice(user_id):
        """
        Generates conservative, safe 'Things to notice' (alerts/flags)
        based on personal baseline shifts and logging consistency.
        """
        logs = AnalyticsService.get_user_logs(user_id, days=14)
        baselines = AnalyticsService.calculate_baselines(user_id, window_days=30)
        alerts = []

        if not logs or not baselines.get('_sufficient_data'):
            return [{
                'id': 'baseline-forming',
                'severity': 'info',
                'title': 'Personal baseline forming',
                'message': 'Keep logging daily. VITAL needs at least 3-5 days of entries to calculate your personalized baselines and spot meaningful shifts.',
                'date': datetime.utcnow().strftime('%Y-%m-%d')
            }]

        latest = logs[-1]
        
        # Check resting HR streak
        recent_rhrs = [l.vital.resting_hr for l in logs[-5:] if l.vital and l.vital.resting_hr]
        rhr_base = baselines.get('resting_hr', {})
        if rhr_base.get('avg') and len(recent_rhrs) >= 3:
            high_count = sum(1 for r in recent_rhrs if r > rhr_base['range_high'])
            if high_count >= 3:
                alerts.append({
                    'id': 'elevated-rhr-streak',
                    'severity': 'notice',
                    'title': 'Resting Heart Rate Above Baseline',
                    'message': f"Your resting heart rate has been above your recent baseline average ({rhr_base['avg']} bpm) for {high_count} of your last 5 logs. Factors like stress, sleep debt, or intense workouts can influence this. Consider consulting a healthcare professional if you have concerns.",
                    'date': latest.log_date.isoformat()
                })

        # Check sleep drop
        sleep_base = baselines.get('hours_slept', {})
        if latest.sleep and latest.sleep.hours_slept and sleep_base.get('avg'):
            if latest.sleep.hours_slept < (sleep_base['avg'] - 1.2):
                alerts.append({
                    'id': 'sleep-duration-drop',
                    'severity': 'notice',
                    'title': 'Recent Sleep Below Baseline',
                    'message': f"Your recent logged sleep ({latest.sleep.hours_slept}h) was notably lower than your 30-day baseline average ({sleep_base['avg']}h).",
                    'date': latest.log_date.isoformat()
                })

        # Check blood pressure notice
        if latest.vital and (latest.vital.bp_systolic or latest.vital.bp_diastolic):
            sys = latest.vital.bp_systolic
            dia = latest.vital.bp_diastolic
            if (sys and sys >= 135) or (dia and dia >= 85):
                alerts.append({
                    'id': 'bp-elevation-notice',
                    'severity': 'warning',
                    'title': 'Blood Pressure Observation',
                    'message': f"Your logged blood pressure ({sys or '--'}/{dia or '--'} mmHg) is elevated compared to standard reference ranges. This application provides informational tracking only. Consider discussing persistent readings with a medical professional.",
                    'date': latest.log_date.isoformat()
                })

        # Logging streak notice
        if len(logs) >= 7:
            alerts.append({
                'id': 'consistency-kudos',
                'severity': 'info',
                'title': 'Great Logging Consistency',
                'message': f"You have logged health data on {len(logs)} days in the last 2 weeks! Your personal trends are becoming increasingly reliable.",
                'date': latest.log_date.isoformat()
            })

        return alerts
