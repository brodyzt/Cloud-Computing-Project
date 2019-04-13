# Print code as executed
set -x

echo "Deleting Edge Server"
az group delete --name edge-server-group

echo "Deleting Backend Server"
az group delete --name backend-server-group
