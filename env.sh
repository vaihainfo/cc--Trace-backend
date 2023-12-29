#!/bin/bash

# Retrieve the JSON data from AWS Secrets Manager
json_data=$(aws secretsmanager get-secret-value --secret-id arn:aws:secretsmanager:ap-south-1:665059252862:secret:new_tracebal-R8NjHg --query SecretString --output text --region ap-south-1)

# Convert the JSON data into an associative array with ordered keys
declare -A secrets

# Define the order of keys based on your JSON file
keys=("PORT" "DB_HOST" "DB_NAME" "DB_USERNAME" "DB_PASSWORD" "BASE_URL" "ADMIN_URL" "EMAIL_HOST" "EMAIL_USER" "EMAIL_PASS" "SENDER_EMAIL_ADDRESS")

# Create or overwrite the .env file with the environment variables
env_file=".env.development"

for key in "${keys[@]}"; do
    value=$(echo "$json_data" | jq -r ".$key")
    echo "$key=${value}" >> "$env_file"
    export "$key"="${value}"
done
