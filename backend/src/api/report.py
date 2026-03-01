from fastapi import APIRouter, Depends, UploadFile, File
from services.dynamodb_service import create_report
from services.s3_service import get_presigned_url
from services.sns_service import send_alert

router = APIRouter()

@router.get("/get-presigned-url")
def get_presigned_url_endpoint(file_name: str, file_type: str):
    url = get_presigned_url(file_name, file_type)
    if not url:
        return {"error": "Failed to generate presigned URL"}
    return url

@router.post("/submit-report")
def submit_report(data: dict):
    # Save report to DynamoDB
    report_id = create_report(data)
    # Optionally, send alert via SNS
    send_alert(data)
    return {"message": "Report submitted", "reportId": report_id}