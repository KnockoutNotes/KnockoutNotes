#!/usr/bin/env python3
"""
KnockoutNotes Admin Password Hash Generator
Generates a PBKDF2-HMAC-SHA256 hash compatible with the Cloudflare Worker Web Crypto implementation.
Format: pbkdf2:100000:<saltHex>:<hashHex>

Usage:
    python scripts/generate_password_hash.py
    (prompts securely without echoing to terminal)
"""
import hashlib
import os
import sys
import getpass

def hash_password(password: str, iterations: int = 100000) -> str:
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, iterations, dklen=32)
    return f"pbkdf2:{iterations}:{salt.hex()}:{key.hex()}"

def verify_password(password: str, stored_hash: str) -> bool:
    try:
        prefix, iter_str, salt_hex, hash_hex = stored_hash.split(':')
        if prefix != 'pbkdf2':
            return False
        iterations = int(iter_str)
        salt = bytes.fromhex(salt_hex)
        expected_key = bytes.fromhex(hash_hex)
        derived_key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, iterations, dklen=32)
        return derived_key == expected_key
    except Exception:
        return False

if __name__ == '__main__':
    if len(sys.argv) > 1:
        pwd = sys.argv[1]
    else:
        try:
            pwd = getpass.getpass("Enter admin password to hash (input will not echo): ")
        except Exception:
            pwd = sys.stdin.readline().strip()

    if not pwd:
        print("Error: Password cannot be empty.", file=sys.stderr)
        sys.exit(1)

    generated_hash = hash_password(pwd)
    # Never print the plaintext password
    print("\n--- Generated PBKDF2-HMAC-SHA256 Hash ---")
    print(generated_hash)
    assert verify_password(pwd, generated_hash), "Verification self-check failed!"
    print("\nVerification self-check passed. Use this hash for ADMIN_PASSWORD_HASH secret.")
