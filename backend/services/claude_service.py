import os
import json
import logging
from analytics_service import AnalyticsService
from models import Profile, DailyLog, AIInsight, ChatConversation, ChatMessage
from database import db

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are VITAL AI, an empathetic, highly precise, non-diagnostic personal health data analyst for the VITAL health tracking app.
You help users understand their personal wellness, sleep, vitals, activity, and lifestyle patterns based STRICTLY on their self-logged database entries.

CRITICAL INSTRUCTIONS ON USER DATA & SAFETY:
1. NEVER INVENT OR FABRICATE HEALTH DATA. If the user has not logged data for a metric (or has zero logs overall), explicitly state that no data is logged for that metric yet and kindly invite them to start logging.
2. NEVER make medical diagnoses or claim to detect diseases, illnesses, or clinical conditions (e.g. sleep apnea, hypertension, diabetes, depression).
3. ALWAYS use precise observational, non-diagnostic language:
   - "Based on your logged data..."
   - "Your historical average is..."
   - "You reported..."
   - "A pattern appears in your recent logs..."
   - "Consider discussing persistent or concerning symptoms with a qualified healthcare professional."
4. Always prioritize comparing metrics against the user's OWN historical baseline rather than arbitrary population averages.
5. If the user asks for a medical diagnosis, remind them that VITAL provides informational health tracking only, and encourage them to consult a medical professional.
"""

class ClaudeService:

    @staticmethod
    def _get_anthropic_client():
        api_key = os.environ.get('ANTHROPIC_API_KEY', '').strip()
        if not api_key:
            return None
        try:
            from anthropic import Anthropic
            return Anthropic(api_key=api_key)
        except Exception as e:
            logger.warning(f"Could not initialize Anthropic client: {e}")
            return None

    @staticmethod
    def prepare_user_context(user_id):
        """Bundles profile, baselines, recent logs, symptoms, and trends into structured context."""
        profile = Profile.query.filter_by(user_id=user_id).first()
        baselines = AnalyticsService.calculate_baselines(user_id, window_days=30)
        correlations = AnalyticsService.calculate_correlations(user_id, days=60)
        logs = AnalyticsService.get_user_logs(user_id, days=14)

        recent_logs_summary = []
        symptom_counts = {}

        for log in logs:
            entry = {
                'date': log.log_date.isoformat(),
                'resting_hr': log.vital.resting_hr if log.vital else None,
                'bp': f"{log.vital.bp_systolic}/{log.vital.bp_diastolic}" if log.vital and log.vital.bp_systolic else None,
                'hours_slept': log.sleep.hours_slept if log.sleep else None,
                'sleep_quality': log.sleep.quality_score if log.sleep else None,
                'energy': log.wellness.energy_score if log.wellness else None,
                'mood': log.wellness.mood_score if log.wellness else None,
                'stress': log.wellness.stress_score if log.wellness else None,
                'steps': log.activity.steps if log.activity else None,
                'water_ml': log.lifestyle.water_ml if log.lifestyle else None,
                'caffeine_mg': log.lifestyle.caffeine_mg if log.lifestyle else None,
                'alcohol_units': log.lifestyle.alcohol_units if log.lifestyle else None,
                'symptoms': [s.symptom_name for s in log.symptoms]
            }
            recent_logs_summary.append(entry)

            for s in log.symptoms:
                symptom_counts[s.symptom_name] = symptom_counts.get(s.symptom_name, 0) + 1

        context = {
            'user_profile': {
                'name': profile.name if profile else 'User',
                'age': profile.age if profile else None,
                'sex': profile.sex if profile else None,
                'activity_level': profile.activity_level if profile else None,
                'goals': profile.health_goals if profile else []
            },
            'baselines_30_days': {
                'resting_hr_avg': baselines.get('resting_hr', {}).get('avg'),
                'sleep_hrs_avg': baselines.get('hours_slept', {}).get('avg'),
                'energy_avg': baselines.get('energy_score', {}).get('avg'),
                'mood_avg': baselines.get('mood_score', {}).get('avg'),
                'stress_avg': baselines.get('stress_score', {}).get('avg'),
                'weight_avg': baselines.get('weight_kg', {}).get('avg'),
                'total_days_logged': baselines.get('_total_days_logged', 0)
            },
            'observed_patterns': correlations.get('patterns', []),
            'frequent_symptoms_14d': symptom_counts,
            'recent_14d_logs': recent_logs_summary
        }
        return context

    @staticmethod
    def generate_insights(user_id):
        """Generates AI insights for user data. Returns empty array if user has no data."""
        context = ClaudeService.prepare_user_context(user_id)
        total_days = context['baselines_30_days']['total_days_logged']
        
        if total_days == 0:
            return []

        client = ClaudeService._get_anthropic_client()

        if client:
            try:
                prompt = f"""Given the following user health tracking data context:
{json.dumps(context, indent=2)}

Generate 1 to 3 personalized observations based ONLY on logged non-null numbers:
Return ONLY a valid JSON array of objects with schema:
[
  {{
    "category": "Sleep", // or "Energy", "Stress", "Vitals", "Lifestyle"
    "title": "Short punchy title",
    "observation_type": "Pattern", // or "Baseline Shift", "Correlation"
    "content": "Observation text strictly referencing user's logged values."
  }}
]
"""
                response = client.messages.create(
                    model="claude-3-5-haiku-20241022",
                    max_tokens=1000,
                    system=SYSTEM_PROMPT,
                    messages=[{"role": "user", "content": prompt}]
                )
                raw_text = response.content[0].text
                parsed = json.loads(raw_text)

                created_insights = []
                for item in parsed:
                    insight = AIInsight(
                        user_id=user_id,
                        category=item.get('category', 'General'),
                        title=item.get('title', 'Health Observation'),
                        content=item.get('content', ''),
                        observation_type=item.get('observation_type', 'Pattern')
                    )
                    db.session.add(insight)
                    created_insights.append(insight)

                db.session.commit()
                return [i.to_dict() for i in created_insights]

            except Exception as e:
                logger.error(f"Error calling Anthropic API for insights: {e}")

        # Fallback local generator (uses strictly logged values, no fake fallbacks)
        return ClaudeService._generate_analytical_insights(user_id, context)

    @staticmethod
    def _generate_analytical_insights(user_id, context):
        b = context.get('baselines_30_days', {})
        patterns = context.get('observed_patterns', [])
        insights_data = []

        if b.get('sleep_hrs_avg') is not None:
            sleep_avg = b['sleep_hrs_avg']
            insights_data.append({
                'category': 'Sleep',
                'title': 'Sleep Baseline Summary',
                'observation_type': 'Baseline Shift',
                'content': f"Your logged data shows a 30-day baseline average of {sleep_avg} hours of sleep per night across your logged entries."
            })

        if b.get('energy_avg') is not None and b.get('stress_avg') is not None:
            insights_data.append({
                'category': 'Energy',
                'title': 'Energy & Stress Dynamics',
                'observation_type': 'Pattern',
                'content': f"Your 30-day logged averages are {b['energy_avg']}/10 for energy and {b['stress_avg']}/10 for stress."
            })

        if patterns:
            p = patterns[0]
            insights_data.append({
                'category': 'Lifestyle',
                'title': p.get('title', 'Observed Co-occurrence'),
                'observation_type': 'Correlation',
                'content': p.get('observation', '')
            })

        created = []
        for d in insights_data:
            insight = AIInsight(
                user_id=user_id,
                category=d['category'],
                title=d['title'],
                content=d['content'],
                observation_type=d['observation_type']
            )
            db.session.add(insight)
            created.append(insight)

        db.session.commit()
        return [i.to_dict() for i in created]

    @staticmethod
    def chat_with_data(user_id, user_message, conversation_id=None):
        """Responds to user questions using Claude API or database-grounded engine."""
        context = ClaudeService.prepare_user_context(user_id)
        
        # Ensure conversation exists
        conv = None
        if conversation_id:
            conv = ChatConversation.query.filter_by(id=conversation_id, user_id=user_id).first()
        
        if not conv:
            title = user_message[:40] + ('...' if len(user_message) > 40 else '')
            conv = ChatConversation(user_id=user_id, title=title)
            db.session.add(conv)
            db.session.flush()

        # Save user message
        user_msg_obj = ChatMessage(
            conversation_id=conv.id,
            user_id=user_id,
            role='user',
            content=user_message
        )
        db.session.add(user_msg_obj)
        db.session.flush()

        total_days = context['baselines_30_days']['total_days_logged']
        client = ClaudeService._get_anthropic_client()
        assistant_reply = ""

        if client:
            try:
                chat_history = ChatMessage.query.filter_by(conversation_id=conv.id).order_by(ChatMessage.created_at.asc()).all()
                messages = []
                for m in chat_history[:-1]:
                    messages.append({"role": m.role, "content": m.content})

                user_prompt_with_context = f"""[User Database Context]:
{json.dumps(context, indent=2)}

[User Question]:
{user_message}"""
                messages.append({"role": "user", "content": user_prompt_with_context})

                response = client.messages.create(
                    model="claude-3-5-haiku-20241022",
                    max_tokens=600,
                    system=SYSTEM_PROMPT,
                    messages=messages
                )
                assistant_reply = response.content[0].text
            except Exception as e:
                logger.error(f"Claude API chat error: {e}")

        if not assistant_reply:
            assistant_reply = ClaudeService._generate_analytical_chat_reply(user_message, context)

        assistant_msg_obj = ChatMessage(
            conversation_id=conv.id,
            user_id=user_id,
            role='assistant',
            content=assistant_reply
        )
        db.session.add(assistant_msg_obj)
        db.session.commit()

        return assistant_msg_obj.to_dict(), conv.to_dict()

    @staticmethod
    def _generate_analytical_chat_reply(user_message, context):
        msg_lower = user_message.lower()
        b = context.get('baselines_30_days', {})
        total_days = b.get('total_days_logged', 0)

        # Check for medical diagnosis queries
        if any(term in msg_lower for term in ['diagnose', 'disease', 'sick', 'apnea', 'hypertension', 'cancer', 'illness', 'diabetes']):
            return ("VITAL provides health tracking and informational insights. It does not replace professional medical advice. "
                    "I cannot provide medical diagnoses or diagnose illnesses. "
                    "If you are experiencing concerning symptoms or health changes, please consult a qualified healthcare professional.")

        if total_days == 0:
            return ("I don't have enough health history yet. Start logging your daily data using the Check-in form, "
                    "and I'll be able to help you understand your personal trends, baselines, and health patterns!")

        # Specific metric questions
        if 'heart' in msg_lower or 'rhr' in msg_lower or 'pulse' in msg_lower:
            avg_hr = b.get('resting_hr_avg')
            if avg_hr is not None:
                return f"Based on your logged entries, your 30-day average resting heart rate is {avg_hr} bpm across your recorded logs."
            return "You haven't logged any resting heart rate readings yet. You can log your resting heart rate during your daily check-in."

        if 'pressure' in msg_lower or 'bp' in msg_lower:
            avg_sys = b.get('bp_systolic_avg') or b.get('bp_systolic', {}).get('avg')
            if avg_sys is not None:
                return f"Based on your logged entries, your 30-day average blood pressure is {avg_sys} mmHg systolic."
            return "You haven't logged any blood pressure readings yet. You can log your blood pressure during your daily check-in."

        if 'sleep' in msg_lower:
            avg_s = b.get('sleep_hrs_avg')
            if avg_s is not None:
                return f"Your logged sleep over the last 30 days averages {avg_s} hours per night across {total_days} logged days."
            return "You haven't recorded any sleep duration entries yet. Log your sleep in the daily check-in form to start tracking your sleep trends!"

        if 'energy' in msg_lower:
            avg_e = b.get('energy_avg')
            if avg_e is not None:
                return f"Your 30-day average energy score is {avg_e}/10 based on your logged entries."
            return "You haven't logged energy scores yet. Complete a check-in to start tracking energy levels."

        if 'stress' in msg_lower:
            avg_str = b.get('stress_avg')
            if avg_str is not None:
                return f"Your 30-day average stress rating is {avg_str}/10 based on your logged entries."
            return "You haven't logged any stress ratings yet. Use the daily check-in to log how stressed you feel each day."

        if 'weight' in msg_lower:
            avg_w = b.get('weight_avg')
            if avg_w is not None:
                return f"Your average weight across your logged entries is {avg_w} kg."
            return "You haven't logged weight measurements yet. You can add weight readings in your daily check-in or profile."

        if 'pattern' in msg_lower or 'correlation' in msg_lower:
            patterns = context.get('observed_patterns', [])
            if patterns:
                p = patterns[0]
                return f"An observed pattern in your logged data is: **{p.get('title')}**. {p.get('observation')} *(Note: This reflects empirical co-occurrence in your logged data, not a clinical medical diagnosis).* "
            return "You don't have enough logged data points yet for correlation analysis. Continue logging daily entries to unlock co-occurrence insights!"

        # General summary
        metrics_logged = []
        if b.get('sleep_hrs_avg') is not None: metrics_logged.append(f"Sleep: {b['sleep_hrs_avg']}h")
        if b.get('resting_hr_avg') is not None: metrics_logged.append(f"Resting HR: {b['resting_hr_avg']} bpm")
        if b.get('energy_avg') is not None: metrics_logged.append(f"Energy: {b['energy_avg']}/10")
        if b.get('stress_avg') is not None: metrics_logged.append(f"Stress: {b['stress_avg']}/10")

        if metrics_logged:
            summary_str = ", ".join(metrics_logged)
            return f"Looking at your {total_days} logged day(s), your personal baseline averages are: {summary_str}. What specific metric would you like to explore?"

        return f"You have logged entries for {total_days} day(s). Log more detailed vitals or wellness scores in your check-in so I can analyze them for you!"
