from dotenv import load_dotenv
import boto3
import os
from datetime import datetime

load_dotenv()

AWS_REGION = os.getenv("AWS_DEFAULT_REGION", "ap-south-1")

print("AWS REGION:", AWS_REGION)

dynamodb = boto3.resource(
    "dynamodb",
    region_name=AWS_REGION,
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)

# ✅ MATCH AWS TABLE NAMES EXACTLY
users_table = dynamodb.Table("Users")
citizens_table = dynamodb.Table("Citizens")
admins_table = dynamodb.Table("Admin")
alerts_table = dynamodb.Table("CitizenContact")


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

    # contact table
    alerts_table.put_item(
        Item={
            "mobile": mobile,
            "firstName": first_name,
            "lastName": last_name,
            "city": city,
        }
    )


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