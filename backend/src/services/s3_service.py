import boto3
import os
from botocore.exceptions import ClientError

s3_client = boto3.client(
    "s3",
    region_name=os.getenv("AWS_DEFAULT_REGION", "ap-south-1"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)

BUCKET_NAME = os.getenv("AWS_S3_BUCKET_NAME")

def get_presigned_url(file_name, file_type):
    try:
        response = s3_client.generate_presigned_post(
            Bucket=BUCKET_NAME,
            Key=file_name,
            Fields={"Content-Type": file_type},
            Conditions=[{"Content-Type": file_type}],
            ExpiresIn=3600
        )
        return response
    except ClientError as e:
        print(f"Error generating presigned URL: {e}")
        return None