# AWS Deployment Guide for TEAM-SYNC-AI-for-Bharat Frontend

Since your entire backend logic is now executing via AWS Lambda functions triggered by AWS API Gateway, your frontend is completely decoupled as a static Single Page Application (SPA). This means it can be deployed directly to AWS using two main methods:

## Method 1: AWS Amplify (Recommended - Easiest & Fastest)
AWS Amplify provides CI/CD out-of-the-box and handles all HTTPS/CDN configuration for React/Vite applications automatically.

### Steps:
1. Push your latest code (with the API Gateway changes we just made) to GitHub, GitLab, or Bitbucket.
2. Log in to the [AWS Management Console](https://console.aws.amazon.com/).
3. Search for **AWS Amplify** and click on it.
4. Click **Create new app** -> **Host web app**.
5. Connect your repository provider (e.g., GitHub).
6. Select your repository (`TEAM-SYNC-AI-for-Bharat`) and the branch (e.g., `main`).
7. In the **App settings**, Amplify will automatically detect your build settings (`npm run build` and base directory `dist`).
8. Under **Advanced settings**, add all your Environment Variables from your `.env` file (e.g., `VITE_AWS_API_GATEWAY_URL`, `VITE_COGNITO_CLIENT_ID`, etc.).
9. Expand **Advanced Settings -> Build image settings** and ensure the base image is set to Amazon Linux 2023. 
10. Save and click **Deploy**. Your app will be live with a global CDN and HTTPS in ~3 minutes.

To fix Single Page App (SPA) routing issues in Amplify (React Router 404 on refresh):
1. In Amplify Console, select your App.
2. Click **Hosting** -> **Rewrites and redirects**.
3. Add a new rule:
   - Source address: `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>`
   - Target address: `/index.html`
   - Type: `200 (Rewrite)`

---

## Method 2: S3 + CloudFront (Using Provided Script)
For total control over deployment, you can host your Vite build (`dist/`) in an S3 Bucket and serve it via Amazon CloudFront (CDN).

I have generated a deployment script: `deploy_aws_s3.ps1`.

### Pre-requisites:
1. You must have [AWS CLI](https://aws.amazon.com/cli/) installed.
2. Ensure you have configured it by running `aws configure` in your terminal and providing your Access Key, Secret Key, and Region.

### Steps:
1. Open PowerShell.
2. CD into the `frontend` directory.
3. Run the script: `.\deploy_aws_s3.ps1`
4. This script will prompt you for your S3 bucket name. It will automatically build the React app, sync the `dist` folder to your S3 bucket, and output the S3 Website URL.

*(Note: To enable HTTPS, you must later map this S3 bucket to a CloudFront distribution via the AWS Console).*
