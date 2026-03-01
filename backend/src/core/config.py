import os
from dotenv import load_dotenv

load_dotenv()

AWS_REGION = os.getenv("AWS_DEFAULT_REGION", "ap-south-1")
DYNAMODB_TABLE_REPORTS = "Reports"
DYNAMODB_TABLE_CITIZENS = "Citizens"
S3_BUCKET = os.getenv("S3_BUCKET")
COGNITO_USER_POOL_ID = os.getenv("COGNITO_USER_POOL_ID")
COGNITO_CLIENT_ID = os.getenv("COGNITO_CLIENT_ID")