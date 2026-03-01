import json
import boto3
import os
from src.utils.response import build_response

cognito = boto3.client('cognito-idp')
CLIENT_ID = os.environ.get('COGNITO_CLIENT_ID')

def lambda_handler(event, context):
    try:
        body = json.loads(event.get('body', '{}'))
        email = body.get('email')
        code = body.get('code')

        if not email or not code:
            return build_response(400, {"error": "Email and code are required."})

        # Submit the OTP to AWS Cognito to confirm the user account
        cognito.confirm_sign_up(
            ClientId=CLIENT_ID,
            Username=email,
            ConfirmationCode=code
        )
        
        return build_response(200, {"message": "Account verified successfully!"})

    except cognito.exceptions.CodeMismatchException:
        return build_response(400, {"error": "Invalid verification code."})
    except cognito.exceptions.ExpiredCodeException:
        return build_response(400, {"error": "Verification code has expired. Request a new one."})
    except Exception as e:
        print(f"Verify Error: {e}")
        return build_response(500, {"error": str(e)})