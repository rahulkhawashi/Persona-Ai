import database

# Global variable to hold the currently logged-in user
current_user_id = None

def set_current_user(user_id):
    global current_user_id
    current_user_id = user_id

def load_memories():
    if current_user_id is None:
        return []
    return database.get_memories(current_user_id)

def remember(fact: str) -> bool:
    if current_user_id is None:
        print("Error: No user logged in to remember fact.")
        return False
        
    fact = fact.strip()
    if not fact:
        return False
        
    return database.add_memory(current_user_id, fact)

def recall(query: str = None):
    if current_user_id is None:
        return []
    return database.get_memories(current_user_id, query)

