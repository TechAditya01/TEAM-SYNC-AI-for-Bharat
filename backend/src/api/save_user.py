from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from src.services.dynamodb_service import (
    create_user,
    create_citizen,
    create_admin,
)

router = APIRouter()


class SaveUserRequest(BaseModel):
    sub: str
    email: str
    role: str
    firstName: str
    lastName: str
    mobile: str
    city: str | None = None
    address: str | None = None
    department: str | None = None


@router.post("/save-user")
def save_user(data: SaveUserRequest):
    try:
        print("✅ SAVE USER DATA:", data.dict())

        create_user(data.sub, data.email, data.role)

        if data.role == "citizen":
            create_citizen(
                citizen_id=data.sub,
                first_name=data.firstName,
                last_name=data.lastName,
                email=data.email,
                mobile=data.mobile,
                city=data.city,
                address=data.address,
            )

        elif data.role == "admin":
            create_admin(
                admin_id=data.sub,
                first_name=data.firstName,
                last_name=data.lastName,
                email=data.email,
                mobile=data.mobile,
                department=data.department,
            )

        print("✅ DYNAMODB SAVE SUCCESS")

        return {"status": "saved"}

    except Exception as e:
        print("❌ SAVE USER ERROR:", str(e))   # ← THIS WILL SHOW REAL ERROR
        raise HTTPException(status_code=500, detail=str(e))