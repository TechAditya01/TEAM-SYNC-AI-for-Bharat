import json
import boto3
import os

client = boto3.client('cognito-idp')
client_id = os.environ.get('CLIENT_ID', 'mock_client_id')

def lambda_handler(event, context):
    try:
        if isinstance(event.get('body'), str):
            body = json.loads(event['body'])
        else:
            body = event.get('body', {})

        email = body.get('email')
        password = body.get('password')
        name = body.get('name')
        
        # Phone conversion logic if needed (e.g. +91...)
        phone = body.get('phone')
        if phone and not phone.startswith('+'):
            phone = f'+91{phone}'
            
        user_attributes = [
            {'Name': 'email', 'Value': email},
            {'Name': 'name', 'Value': name}
        ]
        
        if phone:
            user_attributes.append({'Name': 'phone_number', 'Value': phone})
            
        response = client.sign_up(
            ClientId=client_id,
            Username=email,
            Password=password,
            UserAttributes=user_attributes
        )
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps({
                'message': 'User registered successfully',
                'user_sub': response['UserSub']
            })
        }
    except client.exceptions.UsernameExistsException:
        return {
            'statusCode': 400, 
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'User account already exists.'})
        }
    except Exception as e:
        return {
            'statusCode': 500, 
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
