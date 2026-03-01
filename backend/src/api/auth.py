from fastapi import APIRouter, HTTPException
import boto3
import os
from pydantic import BaseModel

router = APIRouter()

cognito = boto3.client(
    'cognito-idp',
    region_name=os.getenv("AWS_DEFAULT_REGION", "ap-south-1")
)

CLIENT_ID = os.environ.get('COGNITO_CLIENT_ID')

class VerifyUserRequest(BaseModel):
    email: str
    code: str

@router.post("/verify-otp")
def verify_otp(data: VerifyUserRequest):
    try:
        # Submit the OTP to AWS Cognito to confirm the user account
        cognito.confirm_sign_up(
            ClientId=CLIENT_ID,
            Username=data.email,
            ConfirmationCode=data.code
        )
        return {"message": "Account verified successfully!"}

    except cognito.exceptions.CodeMismatchException:
        raise HTTPException(status_code=400, detail="Invalid verification code.")
    except cognito.exceptions.ExpiredCodeException:
        raise HTTPException(status_code=400, detail="Verification code has expired. Request a new one.")
    except Exception as e:
        print(f"Verify Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
