from fastapi import APIRouter, Depends
from services.dynamodb_service import get_citizen_reports

router = APIRouter()

@router.get("/my-reports/{citizen_id}")
def my_reports(citizen_id: str):
    return get_citizen_reports(citizen_id)