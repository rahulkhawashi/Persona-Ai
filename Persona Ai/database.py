import sqlite3
import os
import hashlib

BASE_DIR = os.path.dirname(__file__)
DB_FILE = os.path.join(BASE_DIR, 'persona.db')

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    # Create Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        )
    ''')
    # Create Memories table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS memories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            fact TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    # Create Chats table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            sender TEXT NOT NULL,
            message TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            model_used TEXT
        )
    ''')
    conn.commit()
    conn.close()

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def create_user(username, password):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO users (username, password_hash) VALUES (?, ?)", 
                       (username, hash_password(password)))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False  # Username already exists
    finally:
        conn.close()

def verify_user(username, password):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE username = ? AND password_hash = ?", 
                   (username, hash_password(password)))
    user = cursor.fetchone()
    conn.close()
    if user:
        return user[0]  # Return user_id
    return None

def add_memory(user_id, fact):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO memories (user_id, fact) VALUES (?, ?)", (user_id, fact))
    conn.commit()
    conn.close()
    return True

def get_memories(user_id, query=None):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    if query:
        cursor.execute("SELECT fact FROM memories WHERE user_id = ? AND fact LIKE ?", 
                       (user_id, f'%{query}%'))
    else:
        cursor.execute("SELECT fact FROM memories WHERE user_id = ?", (user_id,))
    
    results = [row[0] for row in cursor.fetchall()]
    conn.close()
    return results

def ensure_default_user():
    """Ensures a default user exists and returns their ID."""
    username = "User"
    password = "password"
    user_id = verify_user(username, password)
    if not user_id:
        create_user(username, password)
        user_id = verify_user(username, password)
    return user_id, username

def save_chat_message(session_id, sender, message, model_used=None):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO chats (session_id, sender, message, model_used)
        VALUES (?, ?, ?, ?)
    """, (session_id, sender, message, model_used))
    conn.commit()
    conn.close()
    return True

def get_chat_history(session_id):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT sender, message, timestamp, model_used 
        FROM chats 
        WHERE session_id = ? 
        ORDER BY timestamp ASC
    """, (session_id,))
    rows = cursor.fetchall()
    conn.close()
    return [{"sender": r[0], "message": r[1], "timestamp": r[2], "model_used": r[3]} for r in rows]

def get_chat_sessions():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT session_id FROM chats ORDER BY timestamp DESC")
    results = [row[0] for row in cursor.fetchall()]
    conn.close()
    return results

# Initialize the database file when this module is imported
init_db()
