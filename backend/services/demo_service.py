import random
from datetime import datetime, timedelta

class DemoService:

    @staticmethod
    def generate_demo_dataset():
        """Returns 30 days of realistic, synthetic demo health data."""
        today = datetime.utcnow().date()
        logs = []

        base_rhr = 70
        base_sleep = 7.4
        base_steps = 8500
        
        symptom_pool = ["Headache", "Fatigue", "Muscle pain", "Back pain", "Cramps"]

        for i in range(29, -1, -1):
            log_date = today - timedelta(days=i)
            is_weekend = log_date.weekday() in (5, 6)

            # Weekend variations
            sleep_hours = round(base_sleep + random.uniform(0.5, 1.3) if is_weekend else base_sleep + random.uniform(-0.8, 0.6), 1)
            sleep_quality = min(10, max(4, int(sleep_hours * 1.1 + random.randint(-1, 1))))
            
            stress = random.randint(2, 5) if is_weekend else random.randint(3, 7)
            energy = min(10, max(3, int(sleep_hours * 1.0 + (8 - stress) * 0.4 + random.uniform(-0.5, 0.5))))
            mood = min(10, max(4, int((energy + (10 - stress)) / 2 + random.uniform(-0.5, 0.5))))
            fatigue = max(1, 11 - energy)

            # RHR correlated with stress & sleep deficit
            rhr_variation = (7.5 - sleep_hours) * 2.0 + (stress - 4) * 1.5 + random.uniform(-2, 2)
            rhr = int(base_rhr + rhr_variation)

            # BP
            sys_bp = 118 + int(stress * 1.2 + random.randint(-3, 4))
            dia_bp = 76 + int(stress * 0.8 + random.randint(-2, 3))

            # Activity
            steps = base_steps + random.randint(1500, 4000) if is_weekend else base_steps + random.randint(-2000, 2000)
            exercise_mins = random.choice([0, 30, 45, 60]) if steps > 7500 else random.choice([0, 15, 20])
            exercise_type = random.choice(["Running", "Cycling", "Yoga", "Brisk Walk", "Strength Training"]) if exercise_mins > 0 else None

            # Lifestyle
            water_ml = random.randint(1800, 3000)
            caffeine_mg = random.choice([100, 150, 200, 250])
            alcohol_units = random.choice([0, 0, 0, 1, 2]) if is_weekend else 0

            # Symptoms
            day_symptoms = []
            if stress >= 6 or sleep_hours < 6.5:
                if random.random() > 0.4:
                    day_symptoms.append({'symptom_name': 'Fatigue', 'severity': 'Moderate'})
                if random.random() > 0.6:
                    day_symptoms.append({'symptom_name': 'Headache', 'severity': 'Mild'})
            elif is_weekend and random.random() > 0.8:
                day_symptoms.append({'symptom_name': 'Muscle pain', 'severity': 'Mild'})

            logs.append({
                'id': 1000 + i,
                'log_date': log_date.isoformat(),
                'vital': {
                    'resting_hr': rhr,
                    'bp_systolic': sys_bp,
                    'bp_diastolic': dia_bp,
                    'spo2': 98.5 + round(random.uniform(-0.5, 0.5), 1),
                    'temperature_c': 36.6 + round(random.uniform(-0.2, 0.3), 1),
                    'weight_kg': 72.5 + round(random.uniform(-0.4, 0.4), 1)
                },
                'sleep': {
                    'hours_slept': sleep_hours,
                    'quality_score': sleep_quality,
                    'bedtime': "23:15" if not is_weekend else "00:30",
                    'wake_time': "07:00" if not is_weekend else "08:45",
                    'awakenings': random.choice([0, 1, 1, 2])
                },
                'wellness': {
                    'energy_score': energy,
                    'mood_score': mood,
                    'stress_score': stress,
                    'fatigue_score': fatigue
                },
                'activity': {
                    'steps': steps,
                    'exercise_mins': exercise_mins,
                    'exercise_type': exercise_type,
                    'activity_level': 'High' if steps > 10000 else ('Moderate' if steps > 6000 else 'Light')
                },
                'lifestyle': {
                    'water_ml': water_ml,
                    'caffeine_mg': caffeine_mg,
                    'alcohol_units': alcohol_units,
                    'nicotine_used': False,
                    'nutrition_notes': 'Balanced meals with adequate protein'
                },
                'symptoms': day_symptoms,
                'cycle': None
            })

        # Calculate demo baselines
        rhrs = [l['vital']['resting_hr'] for l in logs]
        sleeps = [l['sleep']['hours_slept'] for l in logs]
        energies = [l['wellness']['energy_score'] for l in logs]
        stresses = [l['wellness']['stress_score'] for l in logs]
        moods = [l['wellness']['mood_score'] for l in logs]

        avg_rhr = round(sum(rhrs)/len(rhrs), 1)
        avg_sleep = round(sum(sleeps)/len(sleeps), 1)
        avg_energy = round(sum(energies)/len(energies), 1)
        avg_stress = round(sum(stresses)/len(stresses), 1)
        avg_mood = round(sum(moods)/len(moods), 1)

        baselines = {
            'resting_hr': {'avg': avg_rhr, 'range_low': round(avg_rhr - 3, 1), 'range_high': round(avg_rhr + 3, 1)},
            'hours_slept': {'avg': avg_sleep, 'range_low': round(avg_sleep - 0.8, 1), 'range_high': round(avg_sleep + 0.8, 1)},
            'energy_score': {'avg': avg_energy, 'range_low': round(avg_energy - 1, 1), 'range_high': round(avg_energy + 1, 1)},
            'stress_score': {'avg': avg_stress, 'range_low': round(avg_stress - 1, 1), 'range_high': round(avg_stress + 1, 1)},
            'mood_score': {'avg': avg_mood, 'range_low': round(avg_mood - 1, 1), 'range_high': round(avg_mood + 1, 1)},
            '_total_days_logged': 30,
            '_sufficient_data': True
        }

        alerts = [
            {
                'id': 'demo-notice-1',
                'severity': 'notice',
                'title': 'Sleep & Energy Co-occurrence',
                'message': 'In this sample dataset, nights with 7.5+ hours of sleep were followed by 1.8 points higher energy ratings on average.',
                'date': today.isoformat()
            },
            {
                'id': 'demo-notice-2',
                'severity': 'info',
                'title': 'Consistent Hydration Baseline',
                'message': 'Sample hydration logs average 2,350 ml per day, staying safely within the target range.',
                'date': today.isoformat()
            }
        ]

        insights = [
            {
                'id': 9901,
                'category': 'Sleep',
                'title': 'Weekend Sleep Extension Observed',
                'observation_type': 'Pattern',
                'content': 'In your sample logs, sleep duration increases by an average of 1h 15m on weekend nights. Maintaining a narrower sleep schedule gap can support smoother weekly rhythm.',
                'created_at': today.isoformat(),
                'is_read': False
            },
            {
                'id': 9902,
                'category': 'Energy',
                'title': 'Post-Workout Mood Lift',
                'observation_type': 'Correlation',
                'content': 'Logged entries with 30+ minutes of physical activity correlate with a +1.5 boost in reported mood score later in the day.',
                'created_at': today.isoformat(),
                'is_read': False
            },
            {
                'id': 9903,
                'category': 'Vitals',
                'title': 'Resting Heart Rate Stability',
                'observation_type': 'Baseline Shift',
                'content': 'Sample resting heart rate has remained stable around 71 bpm (range 68-75 bpm) over the 30-day period.',
                'created_at': today.isoformat(),
                'is_read': False
            }
        ]

        return {
            'profile': {
                'name': 'Alex Morgan (Demo)',
                'age': 32,
                'sex': 'non_binary',
                'height_cm': 175,
                'weight_kg': 72.5,
                'activity_level': 'moderately_active',
                'health_goals': ['Improve sleep quality', 'Lower stress levels', 'Track resting heart rate'],
                'has_bp_monitor': True,
                'uses_wearable': True,
                'cycle_tracking_enabled': False
            },
            'logs': logs,
            'baselines': baselines,
            'alerts': alerts,
            'insights': insights,
            'is_demo_data': True
        }
