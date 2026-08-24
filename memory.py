import json
import os

BASE_DIR = os.path.dirname(__file__)
MEMORY_FILE = os.path.join(BASE_DIR, 'memory.json')


def load_memories():
    if not os.path.exists(MEMORY_FILE):
        return []
    try:
        with open(MEMORY_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if isinstance(data, list):
                return data
    except Exception:
        pass
    return []


def save_memories(memories):
    try:
        with open(MEMORY_FILE, 'w', encoding='utf-8') as f:
            json.dump(memories, f, ensure_ascii=False, indent=2)
        return True
    except Exception:
        return False


def remember(fact: str) -> bool:
    fact = fact.strip()
    if not fact:
        return False
    memories = load_memories()
    memories.append(fact)
    return save_memories(memories)


def recall(query: str = None):
    memories = load_memories()
    if not query:
        return memories
    q = query.lower().strip()
    return [m for m in memories if q in m.lower()]
