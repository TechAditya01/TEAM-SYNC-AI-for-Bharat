<#
.SYNOPSIS
    Automated deployment script to build and sync the React Vite app to an AWS S3 Bucket.
.DESCRIPTION
    Builds the production assets and uses the AWS CLI to deploy the 'dist' directory to S3.
#>

param (
    [string]$BucketName = $(Read-Host -Prompt "Enter the target AWS S3 Bucket Name (must already exist or be created)")
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Deploying Frontend to AWS S3 " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Check if AWS CLI is installed
if (-not (Get-Command "aws" -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] AWS CLI is not installed or not in PATH. Please install it first." -ForegroundColor Red
    exit 1
}

Write-Host "[1/4] Starting npm install..." -ForegroundColor Yellow
npm install

Write-Host "[2/4] Building Vite app..." -ForegroundColor Yellow
npm run build 

if (-not (Test-Path ".\dist")) {
    Write-Host "[ERROR] Build failed. 'dist' directory not found." -ForegroundColor Red
    exit 1
}

Write-Host "[3/4] Configuring S3 bucket for Static Website Hosting..." -ForegroundColor Yellow
# This command ensures empty buckets are configured to index.html 
aws s3 website "s3://$BucketName" --index-document index.html --error-document index.html

Write-Host "[4/4] Syncing 'dist' folder to S3 bucket '$BucketName'..." -ForegroundColor Yellow
aws s3 sync .\dist\ "s3://$BucketName" --delete

Write-Host "==========================================" -ForegroundColor Green
Write-Host " Deployment Complete!" -ForegroundColor Green
Write-Host " -> S3 Bucket: $BucketName" -ForegroundColor Green
Write-Host " -> Potential HTTP URL (varies by region): http://$BucketName.s3-website.region.amazonaws.com" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Green
Write-Host "Note: Do not forget to configure your S3 bucket policy for public read access or connect it to a CloudFront distribution!" -ForegroundColor Yellow
