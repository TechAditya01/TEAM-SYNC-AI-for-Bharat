import json
import boto3
import os

client = boto3.client('cognito-idp')
client_id = os.environ.get('CLIENT_ID', 'mock_client_id')

def lambda_handler(event, context):
    try:
        body = json.loads(event.get('body', '{}')) if isinstance(event.get('body'), str) else event.get('body', {})
        email = body.get('email')
        password = body.get('password')
        
        response = client.initiate_auth(
            ClientId=client_id,
            AuthFlow='USER_PASSWORD_AUTH',
            AuthParameters={
                'USERNAME': email,
                'PASSWORD': password
            }
        )
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps({
                'access_token': response['AuthenticationResult']['AccessToken'],
                'id_token': response['AuthenticationResult']['IdToken'],
                'refresh_token': response['AuthenticationResult']['RefreshToken']
            })
        }
    except client.exceptions.UserNotConfirmedException:
        return {
            'statusCode': 400, 
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'User not verified. Please confirm your email.'})
        }
    except client.exceptions.NotAuthorizedException:
        return {
            'statusCode': 400, 
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Incorrect email or password.'})
        }
    except Exception as e:
        return {
            'statusCode': 500, 
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
