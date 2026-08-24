from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.database import engine, Base
from auth import routes as auth_routes
from mental_health import routes as mental_health_routes
from chat import routes as chat_routes
from os_actions import routes as os_actions_routes
import auth.models # Ensure models are loaded before Base.metadata.create_all

# Create DB tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="PersonaAI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(mental_health_routes.router)
app.include_router(chat_routes.router)
app.include_router(os_actions_routes.router)

@app.get("/")
def root():
    return {"message": "PersonaAI Backend is running."}
