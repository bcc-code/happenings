# Deployment Guide

## Prerequisites

1. **Google Cloud SDK** installed
   ```bash
   # macOS
   brew install google-cloud-sdk
   
   # Or download from: https://cloud.google.com/sdk/docs/install
   ```

2. **Terraform** >= 1.0 installed
   ```bash
   # macOS
   brew install terraform
   
   # Or download from: https://www.terraform.io/downloads
   ```

3. **GCP Project** created
   ```bash
   gcloud projects create your-project-id
   gcloud config set project your-project-id
   ```

4. **Billing** enabled on GCP project

## Initial Setup

### 1. Authenticate with GCP

```bash
gcloud auth login
gcloud auth application-default login
```

### 2. Set Up Terraform Variables

Copy the example variables file and fill in your values:

```bash
cd infra
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your project details:

```hcl
project_id = "your-gcp-project-id"
region     = "us-central1"
environment = "dev"
```

### 3. Enable Required GCP APIs

```bash
gcloud services enable \
  cloudresourcemanager.googleapis.com \
  compute.googleapis.com \
  sqladmin.googleapis.com \
  run.googleapis.com \
  storage-api.googleapis.com \
  secretmanager.googleapis.com \
  servicenetworking.googleapis.com \
  vpcaccess.googleapis.com \
  cloudbuild.googleapis.com \
  containerregistry.googleapis.com
```

### 4. Initialize Terraform

```bash
terraform init
```

## Deploying Infrastructure

### 1. Review Plan

```bash
terraform plan
```

Review the planned changes carefully.

### 2. Apply Configuration

```bash
terraform apply
```

Type `yes` when prompted to confirm.

### 3. Save Outputs

After deployment, save the outputs:

```bash
terraform output > outputs.txt
```

Important outputs:
- API URL
- Admin Dashboard URL
- End User App URL
- Database connection details

## Setting Up Secrets

After infrastructure is deployed, you need to add secret values:

### Database Password

The database password is automatically generated and stored in Secret Manager.

### Auth0 Secrets

Add your Auth0 credentials:

```bash
# Auth0 Domain
echo -n "your-domain.auth0.com" | gcloud secrets versions add dev-auth0-domain --data-file=-

# Auth0 Audience
echo -n "your-api-identifier" | gcloud secrets versions add dev-auth0-audience --data-file=-

# Auth0 Client ID
echo -n "your-client-id" | gcloud secrets versions add dev-auth0-client-id --data-file=-

# Auth0 Client Secret
echo -n "your-client-secret" | gcloud secrets versions add dev-auth0-client-secret --data-file=-
```

### JWT Secret

Generate and add JWT secret:

```bash
openssl rand -base64 32 | gcloud secrets versions add dev-jwt-secret --data-file=-
```

### SendGrid API Key (if using)

```bash
echo -n "your-sendgrid-api-key" | gcloud secrets versions add dev-sendgrid-api-key --data-file=-
```

## Building and Deploying Applications

### 1. Build Docker Images

For each service (api, admin-dashboard, end-user-app):

```bash
# API
cd ../api
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/dev-api

# Admin Dashboard
cd ../admin-dashboard
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/dev-admin

# End User App
cd ../end-user-app
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/dev-app
```

### 2. Update Cloud Run Services

The Terraform configuration references the container images. After building:

```bash
# Update API service
gcloud run services update dev-api \
  --image gcr.io/YOUR_PROJECT_ID/dev-api:latest \
  --region us-central1

# Update Admin Dashboard
gcloud run services update dev-admin \
  --image gcr.io/YOUR_PROJECT_ID/dev-admin:latest \
  --region us-central1

# Update End User App
gcloud run services update dev-app \
  --image gcr.io/YOUR_PROJECT_ID/dev-app:latest \
  --region us-central1
```

## Database Setup

### 1. Connect to Database

Get the connection name from Terraform outputs:

```bash
terraform output database_connection_name
```

### 2. Run Migrations

Use Cloud SQL Proxy or connect via Cloud Shell:

```bash
# Install Cloud SQL Proxy
gcloud components install cloud-sql-proxy

# Start proxy
cloud-sql-proxy YOUR_PROJECT_ID:REGION:INSTANCE_NAME

# In another terminal, run migrations
cd ../api
DATABASE_URL="postgresql://user:password@localhost:5432/bcc_events" npm run migrate
```

## Monitoring and Logs

### View Logs

```bash
# API logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=dev-api" --limit 50

# Admin Dashboard logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=dev-admin" --limit 50

# End User App logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=dev-app" --limit 50
```

### View Metrics

Access Cloud Console:
- Cloud Run: https://console.cloud.google.com/run
- Cloud SQL: https://console.cloud.google.com/sql
- Memorystore: https://console.cloud.google.com/memorystore

## Updating Infrastructure

### 1. Make Changes

Edit Terraform files as needed.

### 2. Plan Changes

```bash
terraform plan
```

### 3. Apply Changes

```bash
terraform apply
```

## Destroying Infrastructure

⚠️ **Warning**: This will delete all resources including the database!

```bash
terraform destroy
```

## Troubleshooting

### Common Issues

1. **API not enabled**
   ```bash
   gcloud services enable <api-name>
   ```

2. **Permission denied**
   - Check IAM roles
   - Ensure service account has required permissions

3. **Database connection issues**
   - Verify VPC connector is running
   - Check firewall rules
   - Verify private IP configuration

4. **Cloud Run service not starting**
   - Check container image exists
   - Verify environment variables
   - Check service account permissions
   - Review logs for errors

5. **Secret access denied**
   - Verify service account has `secretmanager.secretAccessor` role
   - Check secret exists and has versions

## Production Deployment

For production:

1. Update `terraform.tfvars`:
   ```hcl
   environment = "prod"
   database_tier = "db-n1-standard-2"  # Higher tier
   api_min_instances = 1  # Keep warm
   ```

2. Enable deletion protection:
   - Already configured for `environment == "prod"`

3. Set up monitoring and alerts

4. Configure custom domains:
   ```bash
   gcloud run domain-mappings create \
     --service dev-api \
     --domain api.yourdomain.com
   ```

5. Set up CI/CD pipeline for automated deployments

## Cost Optimization

- Use appropriate instance sizes
- Set min instances to 0 for dev/staging
- Use Cloud SQL read replicas for production
- Enable Cloud CDN for static assets
- Use Cloud Storage lifecycle policies
- Monitor and set up billing alerts

## Security Checklist

- [ ] Secrets stored in Secret Manager
- [ ] Database uses private IP
- [ ] VPC firewall rules configured
- [ ] IAM roles follow least privilege
- [ ] SSL/TLS enforced
- [ ] Regular security updates
- [ ] Backup strategy in place
- [ ] Monitoring and alerting configured
