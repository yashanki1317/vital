# VITAL — Personal Health, Wellness & Health-Data Tracking Platform

**VITAL** is a production-quality, personalized health, wellness, and health-data tracking platform built for individuals of all genders and ages.

VITAL brings sleep, physical activity, vitals, mood, energy, and everyday wellness data together into a cohesive personal health platform. Instead of making population-level assumptions or medical diagnoses, VITAL calculates your personal rolling baseline (averages and standard deviations) to help you understand your unique health patterns over time.

---

## 🌟 Key Features

1. **SaaS Product Landing Page**: High-conversion landing page presenting VITAL's vision: *"Understand your health. Not just your numbers."*
2. **Secure Authentication & Onboarding**:
   - Secure registration/login with bcrypt password hashing and JWT sessions.
   - Tailored 2-step onboarding collecting required demographics (Name, Age, Sex, Height, Weight, Activity Level) and optional goals/baselines with clear privacy messaging.
3. **Daily Health Check-in (30-60s Flow)**:
   - **Vitals**: Resting heart rate, Blood pressure (systolic/diastolic), SpO2, Temperature, Weight.
   - **Sleep**: Duration, quality rating (1-10), bedtime, wake time, awakenings.
   - **Wellness**: Subjective ratings for energy, mood, stress, and fatigue (1-10).
   - **Activity**: Daily steps, exercise minutes, exercise type, activity level.
   - **Lifestyle**: Water intake (ml), caffeine (mg), alcohol units, nicotine usage, nutrition notes.
   - **Symptoms**: Multi-select tags (Headache, Fatigue, Cramps, Bloating, Nausea, Dizziness, Muscle pain, Back pain, Sore throat) + custom symptom notes.
   - **Optional Cycle Module**: Toggleable menstrual tracking module (period days, flow, cramps) for users who want it, while the core app remains universal.
4. **Personal Baseline System**:
   - Calculates 30-day rolling mean, standard deviation, and expected usual range ($Mean \pm 1.0 \cdot StdDev$) for all metrics.
   - Highlights metric deviations with non-diagnostic comparative language (e.g. *"Within your usual personal range"*, *"Higher than your recent personal baseline"*).
5. **Analytics & Correlations Engine**:
   - Analyzes co-occurrences between metrics (e.g. Sleep vs Energy, Stress vs Sleep, Exercise vs Mood).
   - Enforces strict empirical correlation rules (*"Correlation is NOT causation"*).
6. **Health Trends Dashboard**:
   - Interactive Recharts visualizer with date filters (7d, 30d, 90d, 1y).
   - Supports metric switching with written trend summaries.
7. **Health Timeline**:
   - Chronological feed of daily records with expandable entry details.
8. **Claude AI Integration & "Ask Your Data" Chat**:
   - Claude API integration (`claude-3-5-haiku-20241022`) generating structured observations across Sleep, Energy, Stress, Vitals, and Lifestyle.
   - Conversational AI chat interface pre-loaded with user context chips.
   - Intelligent fallback analytical engine when API keys are not provided.
9. **"Things to Notice" Alerts**:
   - Non-alarmist flags for multi-day elevated resting HR, sudden sleep drops, or elevated blood pressure readings.
10. **Demo Mode**:
    - Synthetic 30-day sample dataset with clear "Demo data — not real health information" banners. Completely isolated from real user accounts.

---

## 🛠 Tech Stack

### Backend
- **Framework**: Python 3.13 / Flask 3.1
- **Database**: PostgreSQL (via `psycopg2-binary`) with automatic fallback to SQLite (`vital.db`) for out-of-the-box local execution.
- **ORM**: SQLAlchemy
- **Auth**: Flask-JWT-Extended, Werkzeug Security
- **AI**: Anthropic Claude API (`anthropic` SDK)

### Frontend
- **Framework**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS v3, PostCSS, Lucide React Icons
- **Charts**: Recharts
- **State/Theme**: Dark Mode + Light Mode toggle

---

## 🚀 Getting Started & Setup Instructions

### 1. Prerequisites
- Python 3.10+
- Node.js v18+ & npm

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Activate virtual environment
source venv/bin/activate  # On macOS/Linux
# or venv\Scripts\activate on Windows

# Install dependencies (if needed)
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env if you wish to provide a PostgreSQL DATABASE_URL or ANTHROPIC_API_KEY

# Start the Flask backend server (runs on http://localhost:5001)
python app.py
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if needed)
npm install

# Start Vite dev server (runs on http://localhost:5173)
npm run dev
```

---

## ⚙️ Environment Variables

Located in `backend/.env`:
```env
FLASK_ENV=development
PORT=5001
SECRET_KEY=vital-secret-key-super-secure-change-in-prod-2026
JWT_SECRET_KEY=vital-jwt-secret-key-prod-change-2026

# PostgreSQL Connection String (Optional, defaults to SQLite if empty)
# DATABASE_URL=postgresql://vital_user:vital_pass@localhost:5432/vital_db

# Anthropic Claude API Key (Optional, uses internal analytical fallback if empty)
# ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

---

## 🔒 Security & Privacy Notice

VITAL is designed to protect user health information:
- Password hashing prevents cleartext storage.
- Protected API routes ensure users can **only access their own data**.
- Clear medical disclaimers state that VITAL is an informational wellness tracker, **not a medical diagnostic tool**.
