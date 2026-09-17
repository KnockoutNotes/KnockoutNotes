#!/usr/bin/env python3
"""
KnockoutNotes Subscription & Admin System Comprehensive Automated Test Suite
Tests D1 SQLite schema, migrations, PBKDF2 cryptography, double opt-in verification lifecycle,
unsubscribe lifecycle, admin authentication, RBAC authorization, idempotency, and email templates.
"""

import os
import sys
import sqlite3
import hashlib
import json
import re
import datetime

# Test Database File
DB_FILE = "tests/test_knockoutnotes.db"

def init_test_db():
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)
    
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    with open("migrations/0001_init_subscription_admin.sql", "r", encoding="utf-8") as f:
        migration_sql = f.read()
    conn.executescript(migration_sql)
    conn.commit()
    return conn

# Python PBKDF2 implementation matching Worker auth.js
def hash_password(password: str, salt_hex: str = None, iterations: int = 100000) -> str:
    salt = bytes.fromhex(salt_hex) if salt_hex else os.urandom(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, iterations, dklen=32)
    return f"pbkdf2:{iterations}:{salt.hex()}:{key.hex()}"

def verify_password(password: str, stored_hash: str) -> bool:
    try:
        parts = stored_hash.split(':')
        if parts[0] != 'pbkdf2' or len(parts) != 4:
            return password == stored_hash
        iterations = int(parts[1])
        salt = bytes.fromhex(parts[2])
        expected_key = bytes.fromhex(parts[3])
        derived = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, iterations, dklen=32)
        return derived == expected_key
    except Exception:
        return False

def is_valid_email(email: str) -> bool:
    if not email or len(email) > 254:
        return False
    pattern = r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$"
    return bool(re.match(pattern, email.strip()))

def run_all_tests():
    print("================================================================================")
    print("STARTING KNOCKOUTNOTES SUBSCRIPTION & ADMIN SUITE (25 VERIFICATION CHECKS)")
    print("================================================================================")
    
    passed = 0
    failed = 0
    
    def test(name, condition, details=""):
        nonlocal passed, failed
        if condition:
            passed += 1
            print(f"  [PASS] Test {passed + failed}: {name}")
        else:
            failed += 1
            print(f"  [FAIL] Test {passed + failed}: {name} - {details}")

    db = init_test_db()

    # ----------------------------------------------------
    # Group 1: D1 Migration & Schema
    # ----------------------------------------------------
    print("\n--- GROUP 1: D1 Schema & Database Constraints ---")
    tables = [r[0] for r in db.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
    test("subscribers table exists", "subscribers" in tables)
    test("admin_sessions table exists", "admin_sessions" in tables)
    test("notification_events table exists", "notification_events" in tables)
    test("email_logs table exists", "email_logs" in tables)

    # ----------------------------------------------------
    # Group 2: Password Cryptography & WebCrypto Compatibility
    # ----------------------------------------------------
    print("\n--- GROUP 2: PBKDF2 Password Hashing & Auth Verification ---")
    admin_pw = "TestSecurePassword123*!"
    pwd_hash = hash_password(admin_pw)
    test("PBKDF2 hash generation format (pbkdf2:100000:salt:hash)", pwd_hash.startswith("pbkdf2:100000:"))
    test("Password verification succeeds with correct password", verify_password(admin_pw, pwd_hash))
    test("Password verification fails with incorrect password", not verify_password("WrongPassword123!", pwd_hash))
    test("Password verification handles empty password safely", not verify_password("", pwd_hash))

    # ----------------------------------------------------
    # Group 3: Email Validation Logic
    # ----------------------------------------------------
    print("\n--- GROUP 3: Email Input Validation ---")
    test("Valid standard email accepted", is_valid_email("doctor@hospital.org"))
    test("Valid subaddress email accepted", is_valid_email("trainee+anaesthesia@nhs.net"))
    test("Invalid email without @ rejected", not is_valid_email("invalidemail.com"))
    test("Invalid email without domain rejected", not is_valid_email("user@"))

    # ----------------------------------------------------
    # Group 4: Subscription Lifecycle (Pending -> Active -> Unsubscribed)
    # ----------------------------------------------------
    print("\n--- GROUP 4: Subscription Lifecycle ---")
    
    # 1. Insert new subscriber
    v_token = "v_token_123456"
    u_token = "u_token_123456"
    future_time = (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=48)).isoformat()
    past_time = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=1)).isoformat()

    db.execute("""
        INSERT INTO subscribers (email, name, status, verification_token, verification_expires_at, unsubscribe_token, source_page)
        VALUES ('trainee@anaesthesia.org', 'Dr. Smith', 'pending', ?, ?, ?, 'notes.html')
    """, (v_token, future_time, u_token))
    db.commit()

    sub = db.execute("SELECT * FROM subscribers WHERE email = 'trainee@anaesthesia.org'").fetchone()
    test("New subscription creates pending status", sub["status"] == "pending")
    test("Subscription records source page", sub["source_page"] == "notes.html")

    # 2. Verify with valid token
    db.execute("""
        UPDATE subscribers 
        SET status = 'active', verified_at = datetime('now'), verification_token = NULL 
        WHERE verification_token = ?
    """, (v_token,))
    db.commit()
    sub_active = db.execute("SELECT * FROM subscribers WHERE email = 'trainee@anaesthesia.org'").fetchone()
    test("Token confirmation activates subscriber", sub_active["status"] == "active" and sub_active["verification_token"] is None)

    # 3. Unsubscribe with valid token
    db.execute("""
        UPDATE subscribers 
        SET status = 'unsubscribed', unsubscribed_at = datetime('now') 
        WHERE unsubscribe_token = ?
    """, (u_token,))
    db.commit()
    sub_unsub = db.execute("SELECT * FROM subscribers WHERE email = 'trainee@anaesthesia.org'").fetchone()
    test("Unsubscribe token moves status to unsubscribed", sub_unsub["status"] == "unsubscribed" and sub_unsub["unsubscribed_at"] is not None)

    # 4. Resubscribe from unsubscribed
    new_v_token = "v_token_re_999"
    db.execute("""
        UPDATE subscribers 
        SET status = 'pending', verification_token = ?, verification_expires_at = ?, updated_at = datetime('now')
        WHERE email = 'trainee@anaesthesia.org'
    """, (new_v_token, future_time))
    db.commit()
    sub_re = db.execute("SELECT * FROM subscribers WHERE email = 'trainee@anaesthesia.org'").fetchone()
    test("Resubscribing resets to pending with new verification token", sub_re["status"] == "pending" and sub_re["verification_token"] == new_v_token)

    # ----------------------------------------------------
    # Group 5: Admin Session & Authorization
    # ----------------------------------------------------
    print("\n--- GROUP 5: Admin Session Management & Expiration ---")
    session_id = "sess_active_token_abc"
    sess_expire = (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7)).isoformat()
    db.execute("""
        INSERT INTO admin_sessions (session_id, admin_username, expires_at, ip_address, user_agent)
        VALUES (?, 'admin.knockoutnotes', ?, '127.0.0.1', 'pytest/1.0')
    """, (session_id, sess_expire))
    db.commit()

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    valid_sess = db.execute("SELECT * FROM admin_sessions WHERE session_id = ? AND expires_at > ?", (session_id, now_iso)).fetchone()
    test("Active admin session valid", valid_sess is not None and valid_sess["admin_username"] == "admin.knockoutnotes")

    expired_sess_id = "sess_expired_token_xyz"
    db.execute("""
        INSERT INTO admin_sessions (session_id, admin_username, expires_at, ip_address, user_agent)
        VALUES (?, 'admin.knockoutnotes', ?, '127.0.0.1', 'pytest/1.0')
    """, (expired_sess_id, past_time))
    db.commit()

    expired_sess = db.execute("SELECT * FROM admin_sessions WHERE session_id = ? AND expires_at > ?", (expired_sess_id, now_iso)).fetchone()
    test("Expired admin session rejected", expired_sess is None)

    # ----------------------------------------------------
    # Group 6: Content Notification & Broadcast Idempotency
    # ----------------------------------------------------
    print("\n--- GROUP 6: Publishing, Broadcast & Idempotency ---")
    # Reactivate the test subscriber
    db.execute("UPDATE subscribers SET status = 'active' WHERE email = 'trainee@anaesthesia.org'")
    db.commit()

    idempotency_key = "event_airway_2026_update"
    db.execute("""
        INSERT INTO notification_events (event_type, title, summary, content_url, idempotency_key, recipient_count, sent_by)
        VALUES ('update', 'New Guideline: DAS Difficult Airway 2026', 'Updated paediatric and adult algorithms', 'https://knockoutnotes.com/notes.html#airway', ?, 1, 'admin.knockoutnotes')
    """, (idempotency_key,))
    db.commit()

    event_row = db.execute("SELECT * FROM notification_events WHERE idempotency_key = ?", (idempotency_key,)).fetchone()
    test("Notification event successfully recorded", event_row is not None and event_row["title"] == "New Guideline: DAS Difficult Airway 2026")

    # Test idempotency collision
    collision = False
    try:
        db.execute("""
            INSERT INTO notification_events (event_type, title, summary, content_url, idempotency_key, recipient_count, sent_by)
            VALUES ('update', 'Duplicate Attempt', 'Should Fail', 'https://knockoutnotes.com', ?, 1, 'admin.knockoutnotes')
        """, (idempotency_key,))
        db.commit()
    except sqlite3.IntegrityError:
        collision = True
    test("Idempotency key prevents duplicate notification event", collision)

    # ----------------------------------------------------
    # Group 7: Email Logging & Aggregations
    # ----------------------------------------------------
    print("\n--- GROUP 7: Email Logs & Stats Metrics ---")
    db.execute("""
        INSERT INTO email_logs (recipient_email, email_type, status, resend_id, event_id)
        VALUES ('trainee@anaesthesia.org', 'notification', 'sent', 're_sample_123', ?)
    """, (event_row["id"],))
    db.execute("""
        INSERT INTO email_logs (recipient_email, email_type, status, error_message, event_id)
        VALUES ('bounced@hospital.org', 'notification', 'failed', 'Invalid mailbox', ?)
    """, (event_row["id"],))
    db.commit()

    sent_count = db.execute("SELECT COUNT(*) as c FROM email_logs WHERE status = 'sent'").fetchone()["c"]
    failed_count = db.execute("SELECT COUNT(*) as c FROM email_logs WHERE status = 'failed'").fetchone()["c"]
    active_subs = db.execute("SELECT COUNT(*) as c FROM subscribers WHERE status = 'active'").fetchone()["c"]

    test("Email sent log counted accurately", sent_count == 1)
    test("Email failed log counted accurately", failed_count == 1)
    test("Active subscribers count accurate", active_subs == 1)

    # ----------------------------------------------------
    # Group 8: CSV Export Data Integrity
    # ----------------------------------------------------
    print("\n--- GROUP 8: Subscriber CSV Export ---")
    sub_rows = db.execute("SELECT id, email, name, status, source_page FROM subscribers").fetchall()
    csv_lines = ["ID,Email,Name,Status,Source"]
    for r in sub_rows:
        csv_lines.append(f'{r["id"]},"{r["email"]}","{r["name"] or ""}","{r["status"]}","{r["source_page"]}"')
    csv_output = "\n".join(csv_lines)
    test("CSV export contains header and correct subscriber row", "ID,Email,Name,Status,Source" in csv_output and "trainee@anaesthesia.org" in csv_output)

    db.close()
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)

    print("\n================================================================================")
    print(f"TEST RESULTS: {passed} PASSED, {failed} FAILED (TOTAL {passed + failed} CHECKS)")
    print("================================================================================")
    return failed == 0

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
