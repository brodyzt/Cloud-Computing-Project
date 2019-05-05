# start docker first
docker tag predict_img cowzurecontainerreg.azurecr.io/predict_img:v1
export myResourceGroup='backend-server-group'
export cowzureContainerReg='cowzureContainerReg'

az acr login --name $cowzureContainerReg
az acr list --resource-group $myResourceGroup --query "[].{acrLoginServer:loginServer}" --output table
docker push cowzurecontainerreg.azurecr.io/predict_img:v5
rbac_assign=$(az ad sp create-for-rbac --skip-assignment)
app_id=$(echo "$rbac_assign"|jq -r ".appId")
pw=$(echo "$rbac_assign"|jq -r ".password")
acr_id=$(az acr show --resource-group $myResourceGroup --name $cowzureContainerReg --query "id" --output tsv)
echo "$app_id"
echo "$acr_id"
sleep 30
az role assignment create --assignee $app_id --scope $acr_id --role acrpull
sleep 30
az aks create \
    --resource-group $myResourceGroup \
    --name predictCluster \
    --node-count 2 \
    --location centralus \
    --service-principal $app_id \
    --client-secret $pw --generate-ssh-keys
az aks get-credentials --resource-group $myResourceGroup --name predictCluster
kubectl get nodes

#https://docs.microsoft.com/en-us/azure/aks/tutorial-kubernetes-deploy-application
az acr list --resource-group $myResourceGroup --query "[].{acrLoginServer:loginServer}" --output table
kubectl apply -f predict_deployment.yaml
kubectl apply -f predict_service.yaml
#if deploying the same name again
# rm ~/.kube/config 
