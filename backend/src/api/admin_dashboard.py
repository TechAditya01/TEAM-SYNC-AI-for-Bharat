from fastapi import APIRouter, Depends, HTTPException
from services.dynamodb_service import get_all_reports, escalate_old_reports, reports_table

router = APIRouter()

@router.get("/dashboard")
def dashboard():
    return get_all_reports()

@router.post("/update-status")
def update_status(data: dict):
    report_id = data.get("reportId")
    status = data.get("status")
    if not report_id or not status:
        raise HTTPException(status_code=400, detail="reportId and status required")
    
    try:
        reports_table.update_item(
            Key={"reportId": report_id},
            UpdateExpression="SET #s = :s",
            ExpressionAttributeNames={"#s": "status"},
            ExpressionAttributeValues={":s": status}
        )
        return {"status": "updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/escalate")
def escalate():
    return escalate_old_reports()