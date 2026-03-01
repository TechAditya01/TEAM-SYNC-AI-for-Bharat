import boto3
import os

sns_client = boto3.client(
    "sns",
    region_name=os.getenv("AWS_DEFAULT_REGION", "ap-south-1"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)

TOPIC_ARN = os.getenv("AWS_SNS_TOPIC_ARN")

def send_alert(data):
    try:
        message = f"🚨 New Incident Reported: {data.get('type')}\n" \
                  f"Location: {data.get('location', {}).get('address')}\n" \
                  f"Description: {data.get('description')}\n" \
                  f"Priority: {data.get('priority')}"
        
        sns_client.publish(
            TopicArn=TOPIC_ARN,
            Message=message,
            Subject="Citizen Incident Report"
        )
        return True
    except Exception as e:
        print(f"Error sending SNS alert: {e}")
        return False
