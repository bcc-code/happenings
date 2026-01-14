# Infrastructure as Code - Google Cloud Platform

This directory contains Terraform configurations for deploying the BCC Events Registration App to Google Cloud Platform.

## Architecture Overview

- **API**: Cloud Run (containerized Bun API)
- **Admin Dashboard**: Cloud Run (containerized Nuxt app)
- **End User App**: Cloud Run (containerized Nuxt app)
- **Database**: Cloud SQL (PostgreSQL with cache table)
- **Storage**: Cloud Storage (for files/resources)
- **Secrets**: Secret Manager
- **Networking**: VPC, Cloud Load Balancing

## Prerequisites

1. **Google Cloud SDK** installed and configured
2. **Terraform** >= 1.0 installed
3. **GCP Project** created
4. **Service Account** with appropriate permissions
5. **Billing** enabled on GCP project

## Setup

### 1. Authenticate with GCP

```bash
gcloud auth login
gcloud auth application-default login
```

### 2. Set Project ID

```bash
export TF_VAR_project_id=your-gcp-project-id
```

Or create a `terraform.tfvars` file:

```hcl
project_id = "your-gcp-project-id"
region     = "us-central1"
```

### 3. Enable Required APIs

```bash
gcloud services enable \
  cloudresourcemanager.googleapis.com \
  compute.googleapis.com \
  sqladmin.googleapis.com \
  run.googleapis.com \
  storage-api.googleapis.com \
  secretmanager.googleapis.com \
  servicenetworking.googleapis.com \
  vpcaccess.googleapis.com
```

### 4. Initialize Terraform

```bash
cd infra
terraform init
```

### 5. Plan Deployment

```bash
terraform plan
```

### 6. Apply Configuration

```bash
terraform apply
```

## Structure

```
infra/
├── main.tf                 # Main Terraform configuration
├── variables.tf            # Variable definitions
├── outputs.tf             # Output values
├── terraform.tfvars.example  # Example variables file
├── modules/
│   ├── network/           # VPC and networking
│   ├── database/          # Cloud SQL PostgreSQL
│   ├── storage/           # Cloud Storage buckets
│   ├── secrets/           # Secret Manager
│   ├── api/               # API Cloud Run service
│   ├── admin/             # Admin Dashboard Cloud Run
│   └── app/               # End User App Cloud Run
└── README.md
```

## Variables

Key variables (see `variables.tf` for full list):

- `project_id` - GCP Project ID
- `region` - GCP Region (default: us-central1)
- `environment` - Environment name (dev, staging, prod)
- `database_tier` - Cloud SQL instance tier
- `api_min_instances` - Minimum Cloud Run instances for API
- `api_max_instances` - Maximum Cloud Run instances for API

## Outputs

After deployment, outputs include:

- API URL
- Admin Dashboard URL
- End User App URL
- Database connection details
- Storage bucket names

## Cost Estimation

Approximate monthly costs (varies by usage):

- Cloud SQL (db-f1-micro): ~$10-20
- Cloud Run: Pay per use (~$0-50 depending on traffic)
- Memorystore (basic): ~$30-50
- Cloud Storage: ~$1-5
- Networking: ~$5-10

**Total**: ~$50-150/month for low-medium traffic

## Maintenance

### Update Infrastructure

```bash
terraform plan
terraform apply
```

### Destroy Infrastructure

```bash
terraform destroy
```

⚠️ **Warning**: This will delete all resources including the database!

## Security Notes

- Secrets are stored in Secret Manager
- Database uses private IP
- Cloud Run services use least-privilege IAM
- VPC connector for private networking
- SSL/TLS enforced

## Troubleshooting

### Common Issues

1. **API not enabled**: Run `gcloud services enable <api-name>`
2. **Permission denied**: Check service account permissions
3. **Quota exceeded**: Request quota increase in GCP Console
4. **Database connection**: Ensure VPC connector is configured

## Documentation

- [Terraform GCP Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [Memorystore Documentation](https://cloud.google.com/memorystore/docs)
