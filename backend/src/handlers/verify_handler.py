import json
import boto3
import os

client = boto3.client('cognito-idp')
client_id = os.environ.get('CLIENT_ID', 'mock_client_id')

def lambda_handler(event, context):
    try:
        body = json.loads(event.get('body', '{}')) if isinstance(event.get('body'), str) else event.get('body', {})
        email = body.get('contact') # using contact based on OTPVerify.jsx
        code = body.get('otp')
        
        if not email or not code:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Contact and OTP code are required'})
            }
            
        response = client.confirm_sign_up(
            ClientId=client_id,
            Username=email,
            ConfirmationCode=code
        )
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps({
                'message': 'Verification successful',
                'token': 'mock-verified-token'
            })
        }
    except client.exceptions.CodeMismatchException:
        return {
            'statusCode': 400, 
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid verification code.'})
        }
    except Exception as e:
        return {
            'statusCode': 500, 
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
