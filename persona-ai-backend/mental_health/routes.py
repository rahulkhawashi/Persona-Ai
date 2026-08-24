from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from mental_health.schema import StudentData, PredictionResponse
from mental_health.model_loader import predict_score
from db.database import get_db
from auth.routes import get_current_user
from auth.models import User, WellnessLog

router = APIRouter(prefix="/mental_health", tags=["Mental Health"])

@router.post("/predict", response_model=PredictionResponse)
def predict(data: StudentData, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    score = predict_score(data)
    
    # Save wellness log
    log_entry = WellnessLog(
        user_id=current_user.id,
        age=data.age,
        avg_daily_usage_hours=data.avg_daily_usage_hours,
        sleep_hours_per_night=data.sleep_hours_per_night,
        study_hours=data.study_hours,
        physical_activity_hours=data.physical_activity_hours,
        stress_level=data.stress_level,
        predicted_score=score
    )
    db.add(log_entry)
    db.commit()
    
    return PredictionResponse(predicted_mental_health_score=score)

@router.get("/history")
def get_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logs = db.query(WellnessLog).filter(WellnessLog.user_id == current_user.id).order_by(WellnessLog.created_at.asc()).all()
    return logs
