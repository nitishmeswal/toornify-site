#!/usr/bin/env bash
set -euo pipefail

: "${AZ_SUBSCRIPTION_ID:?Set AZ_SUBSCRIPTION_ID}"
: "${AZ_RESOURCE_GROUP:?Set AZ_RESOURCE_GROUP}"
: "${AZ_LOCATION:?Set AZ_LOCATION (e.g. eastus)}"
: "${AZ_APP_SERVICE_PLAN:?Set AZ_APP_SERVICE_PLAN}"
: "${AZ_WEBAPP_NAME:?Set AZ_WEBAPP_NAME}"

az account set --subscription "$AZ_SUBSCRIPTION_ID"

az group create \
  --name "$AZ_RESOURCE_GROUP" \
  --location "$AZ_LOCATION"

az appservice plan create \
  --name "$AZ_APP_SERVICE_PLAN" \
  --resource-group "$AZ_RESOURCE_GROUP" \
  --location "$AZ_LOCATION" \
  --is-linux \
  --sku B1

az webapp create \
  --resource-group "$AZ_RESOURCE_GROUP" \
  --plan "$AZ_APP_SERVICE_PLAN" \
  --name "$AZ_WEBAPP_NAME" \
  --runtime "NODE|20-lts"

az webapp config set \
  --resource-group "$AZ_RESOURCE_GROUP" \
  --name "$AZ_WEBAPP_NAME" \
  --web-sockets-enabled true

az webapp config appsettings set \
  --resource-group "$AZ_RESOURCE_GROUP" \
  --name "$AZ_WEBAPP_NAME" \
  --settings WEBSITES_PORT=3000

az webapp show \
  --resource-group "$AZ_RESOURCE_GROUP" \
  --name "$AZ_WEBAPP_NAME" \
  --query defaultHostName \
  -o tsv
