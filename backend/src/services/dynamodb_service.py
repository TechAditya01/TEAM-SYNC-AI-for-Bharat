from dotenv import load_dotenv
import boto3
import os
from datetime import datetime

load_dotenv()

AWS_REGION = os.getenv("AWS_DEFAULT_REGION", "ap-south-1")

dynamodb = boto3.resource(
    "dynamodb",
    region_name=AWS_REGION,
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)

users_table = dynamodb.Table("Users")
citizens_table = dynamodb.Table("Citizens")
admins_table = dynamodb.Table("Admin")
contact_table = dynamodb.Table("CitizenContact")
reports_table = dynamodb.Table("Reports")


# ================= USERS =================
def create_user(user_id, email, role):
    users_table.put_item(
        Item={
            "userId": user_id,
            "email": email,
            "role": role,
            "createdAt": datetime.utcnow().isoformat(),
        }
    )


def get_user(user_id):
    res = users_table.get_item(Key={"userId": user_id})
    return res.get("Item")


# ================= CITIZEN =================
def create_citizen(
    citizen_id,
    first_name,
    last_name,
    email,
    mobile,
    city,
    address,
):
    citizens_table.put_item(
        Item={
            "citizenId": citizen_id,
            "firstName": first_name,
            "lastName": last_name,
            "email": email,
            "mobile": mobile,
            "city": city,
            "address": address,
            "createdAt": datetime.utcnow().isoformat(),
        }
    )

    contact_table.put_item(
        Item={
            "mobile": mobile,
            "firstName": first_name,
            "lastName": last_name,
            "city": city,
        }
    )


def get_citizen_reports(citizen_id):
    res = reports_table.scan(
        FilterExpression="#cid = :cid",
        ExpressionAttributeNames={"#cid": "citizenId"},
        ExpressionAttributeValues={":cid": citizen_id},
    )
    return res.get("Items", [])


def get_citizen(citizen_id):
    res = citizens_table.get_item(Key={"citizenId": citizen_id})
    return res.get("Item")


# ================= ADMIN =================
def create_admin(
    admin_id,
    first_name,
    last_name,
    email,
    mobile,
    department,
):
    admins_table.put_item(
        Item={
            "adminId": admin_id,
            "firstName": first_name,
            "lastName": last_name,
            "email": email,
            "mobile": mobile,
            "department": department,
            "role": "admin",
            "createdAt": datetime.utcnow().isoformat(),
        }
    )


def get_admin(admin_id):
    res = admins_table.get_item(Key={"adminId": admin_id})
    return res.get("Item")


def get_all_reports():
    res = reports_table.scan()
    return res.get("Items", [])


def create_report(data):
    report_id = f"rep-{int(datetime.utcnow().timestamp())}"
    data["reportId"] = report_id
    data["createdAt"] = datetime.utcnow().isoformat()
    data["status"] = "Pending"
    reports_table.put_item(Item=data)
    return report_id


def escalate_old_reports():
    # Logic for escalation (e.g. if > 24h pending)
    # This is a stub for future implementation
    return {"status": "Escalation process triggered"}
