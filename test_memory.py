import memory

print("Memories before:", memory.load_memories())
memory.remember("Say hello to Persona")
print("Memories after:", memory.load_memories())
print("Recall hello:", memory.recall("hello"))
