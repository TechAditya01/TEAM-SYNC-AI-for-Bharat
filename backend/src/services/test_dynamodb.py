from dynamodb_service import put_user, get_user

# insert
put_user("3", "Ravi", "User")

# read
user = get_user("3")
print(user)