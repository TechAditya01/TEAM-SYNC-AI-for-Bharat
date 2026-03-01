from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from src.services.dynamodb_service import get_user

router = APIRouter()


class LoginRequest(BaseModel):
    sub: str   # Cognito user sub


@router.post("/login")
def login(data: LoginRequest):
    user = get_user(data.sub)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "userId": user["userId"],
        "role": user["role"],
    }