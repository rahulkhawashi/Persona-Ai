from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import subprocess
from sqlalchemy.orm import Session
from db.database import get_db
from auth.models import User, ActionLog
from auth.routes import get_current_user
from os_actions.allowlist import ALLOWLIST

router = APIRouter(prefix="/action", tags=["OS Actions"])

class AppRequest(BaseModel):
    app_name: str

@router.post("/open-app")
def open_app(request: AppRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    app_name = request.app_name.lower().strip()
    
    if app_name not in ALLOWLIST:
        # Log failure
        log = ActionLog(user_id=current_user.id, app_requested=app_name, success=False)
        db.add(log)
        db.commit()
        raise HTTPException(status_code=403, detail=f"App '{app_name}' is not in the allowlist.")
    
    command = ALLOWLIST[app_name]
    try:
        # Execute securely using shell=True only for start/calc generic commands on windows
        subprocess.Popen(command, shell=True)
        success = True
        msg = f"Successfully launched {app_name}."
    except Exception as e:
        success = False
        msg = f"Failed to launch {app_name}: {str(e)}"
        
    # Log action
    log = ActionLog(user_id=current_user.id, app_requested=app_name, success=success)
    db.add(log)
    db.commit()
    
    if not success:
        raise HTTPException(status_code=500, detail=msg)
        
    return {"message": msg}
