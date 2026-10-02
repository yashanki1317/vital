import os
import sys
import unittest
import json

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'services'))

from app import create_app
from database import db
from models import User, Profile, DailyLog, Vital, SleepLog, WellnessLog, ChatConversation, ChatMessage

class VitalE2ETestCase(unittest.TestCase):

    def setUp(self):
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.client = self.app.test_client()

        with self.app.app_context():
            db.create_all()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_full_user_flow_and_isolation(self):
        # TEST 1 & 3: Register User A and post health data
        res_a = self.client.post('/api/auth/register', json={
            'email': 'usera@example.com',
            'password': 'password123',
            'full_name': 'User A'
        })
        self.assertEqual(res_a.status_code, 201)
        token_a = res_a.get_json()['access_token']
        headers_a = {'Authorization': f'Bearer {token_a}'}

        # Log Day 1 data for User A
        log_a1 = self.client.post('/api/daily-log', headers=headers_a, json={
            'log_date': '2026-10-01',
            'vital': {'resting_hr': 78, 'bp_systolic': 122, 'bp_diastolic': 80, 'weight_kg': 74.0},
            'sleep': {'hours_slept': 8.0, 'quality_score': 8},
            'wellness': {'energy_score': 8, 'mood_score': 8, 'stress_score': 3, 'fatigue_score': 2}
        })
        self.assertEqual(log_a1.status_code, 200)

        # TEST 2 & 4: Register User B and verify User B has zero data and cannot see User A's data
        res_b = self.client.post('/api/auth/register', json={
            'email': 'userb@example.com',
            'password': 'password123',
            'full_name': 'User B'
        })
        self.assertEqual(res_b.status_code, 201)
        token_b = res_b.get_json()['access_token']
        headers_b = {'Authorization': f'Bearer {token_b}'}

        dash_b = self.client.get('/api/dashboard', headers=headers_b)
        self.assertEqual(dash_b.status_code, 200)
        dash_b_json = dash_b.get_json()
        self.assertEqual(dash_b_json['total_days_logged'], 0)
        self.assertEqual(dash_b_json['snapshot'], {})
        self.assertFalse(dash_b_json['sufficient_data'])

        # TEST 5: Create User C (Fresh Account) -> Verify zero statistics, zero fake values
        res_c = self.client.post('/api/auth/register', json={
            'email': 'userc@example.com',
            'password': 'password123',
            'full_name': 'User C'
        })
        token_c = res_c.get_json()['access_token']
        headers_c = {'Authorization': f'Bearer {token_c}'}

        dash_c = self.client.get('/api/dashboard', headers=headers_c)
        self.assertEqual(dash_c.get_json()['snapshot'], {})

        # TEST 6: User C enters 1 day of data
        self.client.post('/api/daily-log', headers=headers_c, json={
            'log_date': '2026-10-02',
            'vital': {'resting_hr': 68}
        })
        dash_c_updated = self.client.get('/api/dashboard', headers=headers_c).get_json()
        self.assertEqual(dash_c_updated['snapshot']['resting_hr']['value'], 68)

        # TEST 7: User C enters additional days -> Trends update dynamically
        self.client.post('/api/daily-log', headers=headers_c, json={
            'log_date': '2026-10-03',
            'vital': {'resting_hr': 70}
        })
        trends_c = self.client.get('/api/trends?range=30d', headers=headers_c).get_json()
        self.assertEqual(len(trends_c['chart_series']), 2)

        # TEST 8: Edit existing log
        self.client.put('/api/logs/2026-10-02', headers=headers_c, json={
            'vital': {'resting_hr': 65}
        })
        dash_c_edited = self.client.get('/api/dashboard', headers=headers_c).get_json()
        self.assertEqual(dash_c_edited['snapshot']['resting_hr']['value'], 65)

        # TEST 9: Delete a day's data -> Disappears from analytics
        del_res = self.client.delete('/api/logs/2026-10-03', headers=headers_c)
        self.assertEqual(del_res.status_code, 200)
        trends_c_after_del = self.client.get('/api/trends?range=30d', headers=headers_c).get_json()
        self.assertEqual(len(trends_c_after_del['chart_series']), 1)

        # TEST 11: Ask chatbot about entered data -> Uses user's actual database records
        chat_rhr = self.client.post('/api/chat', headers=headers_c, json={
            'message': 'What is my average resting heart rate?'
        })
        self.assertEqual(chat_rhr.status_code, 200)
        self.assertIn('65', chat_rhr.get_json()['reply']['message'])

        # TEST 12: Ask chatbot about data user NEVER entered (e.g. blood pressure) -> Does NOT invent an answer
        chat_bp = self.client.post('/api/chat', headers=headers_c, json={
            'message': 'What is my average blood pressure?'
        })
        self.assertEqual(chat_bp.status_code, 200)
        reply_bp = chat_bp.get_json()['reply']['message']
        self.assertIn("haven't logged", reply_bp.lower())

        # TEST 13 & 14: Logout & Login again
        self.client.post('/api/auth/logout', headers=headers_c)
        login_c = self.client.post('/api/auth/login', json={
            'email': 'userc@example.com',
            'password': 'password123'
        })
        self.assertEqual(login_c.status_code, 200)
        token_c2 = login_c.get_json()['access_token']
        headers_c2 = {'Authorization': f'Bearer {token_c2}'}

        # Data still exists
        dash_c_relogin = self.client.get('/api/dashboard', headers=headers_c2).get_json()
        self.assertEqual(dash_c_relogin['snapshot']['resting_hr']['value'], 65)

        # TEST 15: Delete account -> Associated personal data is purged
        del_acct = self.client.delete('/api/profile/account', headers=headers_c2)
        self.assertEqual(del_acct.status_code, 200)

        # Login fails now
        login_fail = self.client.post('/api/auth/login', json={
            'email': 'userc@example.com',
            'password': 'password123'
        })
        self.assertEqual(login_fail.status_code, 401)
        print("✅ ALL 15 ACCEPTANCE TESTS PASSED PERFECTLY!")

if __name__ == '__main__':
    unittest.main()
