# start docker first
export myResourceGroup='myResourceGroup'
az group create --name $myResourceGroup --location eastus
az acr create --resource-group $myResourceGroup --name cowzureContainerReg --sku Basic
az acr login --name cowzureContainerReg
az acr list --resource-group $myResourceGroup --query "[].{acrLoginServer:loginServer}" --output table
docker push cowzurecontainerreg.azurecr.io/train_img:v1
rbac_assign=$(az ad sp create-for-rbac --skip-assignment)
app_id=$(echo "$rbac_assign"|jq -r ".appId")
pw=$(echo "$rbac_assign"|jq -r ".password")
acr_id=$(az acr show --resource-group $myResourceGroup --name cowzureContainerReg --query "id" --output tsv)
echo "$app_id"
echo "$acr_id"
sleep 20
az role assignment create --assignee $app_id --scope $acr_id --role acrpull
sleep 10
az aks create \
    --resource-group $myResourceGroup \
    --name trainCluster \
    --location centralus  \
    --node-count 1 \
    --service-principal $app_id \
    --client-secret $pw --generate-ssh-keys
az aks get-credentials --resource-group $myResourceGroup --name trainCluster
kubectl get nodes

#https://docs.microsoft.com/en-us/azure/aks/tutorial-kubernetes-deploy-application
az acr list --resource-group $myResourceGroup --query "[].{acrLoginServer:loginServer}" --output table
kubectl apply -f train_deployment.yaml
kubectl apply -f train_service.yaml
#if deploying the same name again
# rm ~/.kube/config 
