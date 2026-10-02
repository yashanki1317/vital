from datetime import datetime, date
from database import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    profile = db.relationship('Profile', backref='user', uselist=False, cascade='all, delete-orphan')
    daily_logs = db.relationship('DailyLog', backref='user', cascade='all, delete-orphan')
    insights = db.relationship('AIInsight', backref='user', cascade='all, delete-orphan')
    conversations = db.relationship('ChatConversation', backref='user', cascade='all, delete-orphan')
    chat_messages = db.relationship('ChatMessage', backref='user', cascade='all, delete-orphan')
    goals = db.relationship('HealthGoal', backref='user', cascade='all, delete-orphan')
    notifications = db.relationship('Notification', backref='user', cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'profile': self.profile.to_dict() if self.profile else None
        }


class Profile(db.Model):
    __tablename__ = 'profiles'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True)
    name = db.Column(db.String(100), nullable=False)
    date_of_birth = db.Column(db.String(20), nullable=True) # YYYY-MM-DD
    age = db.Column(db.Integer, nullable=True)
    sex = db.Column(db.String(30), nullable=False, default='prefer_not_to_say')  # 'male', 'female', 'non_binary', 'prefer_not_to_say'
    height_cm = db.Column(db.Float, nullable=True)
    weight_kg = db.Column(db.Float, nullable=True)
    activity_level = db.Column(db.String(50), default='moderately_active')  # 'sedentary', 'lightly_active', etc.
    
    # Optional onboarding & profile fields
    health_goals = db.Column(db.JSON, default=list)  # list of strings
    typical_sleep_hrs = db.Column(db.Float, nullable=True)
    typical_rhr = db.Column(db.Integer, nullable=True)
    has_bp_monitor = db.Column(db.Boolean, default=False)
    uses_wearable = db.Column(db.Boolean, default=False)
    cycle_tracking_enabled = db.Column(db.Boolean, default=False)
    profile_picture_url = db.Column(db.String(255), nullable=True)
    emergency_contact = db.Column(db.String(150), nullable=True)

    notification_checkin_reminders = db.Column(db.Boolean, default=True)
    notification_weekly_summaries = db.Column(db.Boolean, default=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'date_of_birth': self.date_of_birth,
            'age': self.age,
            'sex': self.sex,
            'height_cm': self.height_cm,
            'weight_kg': self.weight_kg,
            'activity_level': self.activity_level,
            'health_goals': self.health_goals or [],
            'typical_sleep_hrs': self.typical_sleep_hrs,
            'typical_rhr': self.typical_rhr,
            'has_bp_monitor': self.has_bp_monitor,
            'uses_wearable': self.uses_wearable,
            'cycle_tracking_enabled': self.cycle_tracking_enabled,
            'profile_picture_url': self.profile_picture_url,
            'emergency_contact': self.emergency_contact,
            'notification_checkin_reminders': self.notification_checkin_reminders,
            'notification_weekly_summaries': self.notification_weekly_summaries
        }


class DailyLog(db.Model):
    __tablename__ = 'daily_logs'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    log_date = db.Column(db.Date, nullable=False, index=True)
    general_notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (db.UniqueConstraint('user_id', 'log_date', name='_user_log_date_uc'),)

    vital = db.relationship('Vital', backref='daily_log', uselist=False, cascade='all, delete-orphan')
    sleep = db.relationship('SleepLog', backref='daily_log', uselist=False, cascade='all, delete-orphan')
    wellness = db.relationship('WellnessLog', backref='daily_log', uselist=False, cascade='all, delete-orphan')
    activity = db.relationship('ActivityLog', backref='daily_log', uselist=False, cascade='all, delete-orphan')
    lifestyle = db.relationship('LifestyleLog', backref='daily_log', uselist=False, cascade='all, delete-orphan')
    symptoms = db.relationship('SymptomLog', backref='daily_log', cascade='all, delete-orphan')
    cycle = db.relationship('CycleLog', backref='daily_log', uselist=False, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'log_date': self.log_date.isoformat(),
            'general_notes': self.general_notes,
            'vital': self.vital.to_dict() if self.vital else None,
            'sleep': self.sleep.to_dict() if self.sleep else None,
            'wellness': self.wellness.to_dict() if self.wellness else None,
            'activity': self.activity.to_dict() if self.activity else None,
            'lifestyle': self.lifestyle.to_dict() if self.lifestyle else None,
            'symptoms': [s.to_dict() for s in self.symptoms],
            'cycle': self.cycle.to_dict() if self.cycle else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Vital(db.Model):
    __tablename__ = 'vitals'

    id = db.Column(db.Integer, primary_key=True)
    daily_log_id = db.Column(db.Integer, db.ForeignKey('daily_logs.id', ondelete='CASCADE'), nullable=False, unique=True)
    resting_hr = db.Column(db.Integer, nullable=True)
    bp_systolic = db.Column(db.Integer, nullable=True)
    bp_diastolic = db.Column(db.Integer, nullable=True)
    spo2 = db.Column(db.Float, nullable=True)
    temperature_c = db.Column(db.Float, nullable=True)
    weight_kg = db.Column(db.Float, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'resting_hr': self.resting_hr,
            'bp_systolic': self.bp_systolic,
            'bp_diastolic': self.bp_diastolic,
            'spo2': self.spo2,
            'temperature_c': self.temperature_c,
            'weight_kg': self.weight_kg
        }


class SleepLog(db.Model):
    __tablename__ = 'sleep_logs'

    id = db.Column(db.Integer, primary_key=True)
    daily_log_id = db.Column(db.Integer, db.ForeignKey('daily_logs.id', ondelete='CASCADE'), nullable=False, unique=True)
    hours_slept = db.Column(db.Float, nullable=False)
    quality_score = db.Column(db.Integer, nullable=False)  # 1-10
    bedtime = db.Column(db.String(20), nullable=True)      # e.g., "23:00"
    wake_time = db.Column(db.String(20), nullable=True)    # e.g., "07:15"
    awakenings = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            'id': self.id,
            'hours_slept': self.hours_slept,
            'quality_score': self.quality_score,
            'bedtime': self.bedtime,
            'wake_time': self.wake_time,
            'awakenings': self.awakenings
        }


class WellnessLog(db.Model):
    __tablename__ = 'wellness_logs'

    id = db.Column(db.Integer, primary_key=True)
    daily_log_id = db.Column(db.Integer, db.ForeignKey('daily_logs.id', ondelete='CASCADE'), nullable=False, unique=True)
    energy_score = db.Column(db.Integer, nullable=False)   # 1-10
    mood_score = db.Column(db.Integer, nullable=False)     # 1-10
    stress_score = db.Column(db.Integer, nullable=False)   # 1-10
    fatigue_score = db.Column(db.Integer, nullable=False)  # 1-10

    def to_dict(self):
        return {
            'id': self.id,
            'energy_score': self.energy_score,
            'mood_score': self.mood_score,
            'stress_score': self.stress_score,
            'fatigue_score': self.fatigue_score
        }


class ActivityLog(db.Model):
    __tablename__ = 'activity_logs'

    id = db.Column(db.Integer, primary_key=True)
    daily_log_id = db.Column(db.Integer, db.ForeignKey('daily_logs.id', ondelete='CASCADE'), nullable=False, unique=True)
    steps = db.Column(db.Integer, default=0)
    exercise_mins = db.Column(db.Integer, default=0)
    exercise_type = db.Column(db.String(100), nullable=True)
    activity_level = db.Column(db.String(50), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'steps': self.steps,
            'exercise_mins': self.exercise_mins,
            'exercise_type': self.exercise_type,
            'activity_level': self.activity_level
        }


class LifestyleLog(db.Model):
    __tablename__ = 'lifestyle_logs'

    id = db.Column(db.Integer, primary_key=True)
    daily_log_id = db.Column(db.Integer, db.ForeignKey('daily_logs.id', ondelete='CASCADE'), nullable=False, unique=True)
    water_ml = db.Column(db.Integer, default=0)
    caffeine_mg = db.Column(db.Integer, default=0)
    alcohol_units = db.Column(db.Float, default=0)
    nicotine_used = db.Column(db.Boolean, default=False)
    nutrition_notes = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'water_ml': self.water_ml,
            'caffeine_mg': self.caffeine_mg,
            'alcohol_units': self.alcohol_units,
            'nicotine_used': self.nicotine_used,
            'nutrition_notes': self.nutrition_notes
        }


class SymptomLog(db.Model):
    __tablename__ = 'symptom_logs'

    id = db.Column(db.Integer, primary_key=True)
    daily_log_id = db.Column(db.Integer, db.ForeignKey('daily_logs.id', ondelete='CASCADE'), nullable=False, index=True)
    symptom_name = db.Column(db.String(100), nullable=False)
    severity = db.Column(db.String(30), default='Moderate')  # 'Mild', 'Moderate', 'Severe'
    notes = db.Column(db.String(255), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'symptom_name': self.symptom_name,
            'severity': self.severity,
            'notes': self.notes
        }


class CycleLog(db.Model):
    __tablename__ = 'cycle_logs'

    id = db.Column(db.Integer, primary_key=True)
    daily_log_id = db.Column(db.Integer, db.ForeignKey('daily_logs.id', ondelete='CASCADE'), nullable=False, unique=True)
    is_period_day = db.Column(db.Boolean, default=False)
    flow_level = db.Column(db.String(30), nullable=True)
    cramps_level = db.Column(db.Integer, default=0)
    notes = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'is_period_day': self.is_period_day,
            'flow_level': self.flow_level,
            'cramps_level': self.cramps_level,
            'notes': self.notes
        }


class ChatConversation(db.Model):
    __tablename__ = 'chat_conversations'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False, default='Health Conversation')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    messages = db.relationship('ChatMessage', backref='conversation', cascade='all, delete-orphan', order_by='ChatMessage.created_at.asc()')

    def to_dict(self):
        last_msg = self.messages[-1].to_dict() if self.messages else None
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'last_message': last_msg
        }


class ChatMessage(db.Model):
    __tablename__ = 'chat_messages'

    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey('chat_conversations.id', ondelete='CASCADE'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    role = db.Column(db.String(20), nullable=False)  # 'user', 'assistant'
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'conversation_id': self.conversation_id,
            'user_id': self.user_id,
            'role': self.role,
            'content': self.content,
            'message': self.content, # for backwards compatibility
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class HealthGoal(db.Model):
    __tablename__ = 'health_goals'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    goal_type = db.Column(db.String(50), nullable=False) # e.g., 'sleep_hrs', 'steps', 'water_ml', 'weight_kg'
    target_value = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(30), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'goal_type': self.goal_type,
            'target_value': self.target_value,
            'unit': self.unit,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    type = db.Column(db.String(50), default='reminder')
    message = db.Column(db.String(255), nullable=False)
    read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'type': self.type,
            'message': self.message,
            'read': self.read,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class AIInsight(db.Model):
    __tablename__ = 'ai_insights'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    category = db.Column(db.String(50), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    observation_type = db.Column(db.String(50), default='Pattern')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_read = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            'id': self.id,
            'category': self.category,
            'title': self.title,
            'content': self.content,
            'observation_type': self.observation_type,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_read': self.is_read
        }

