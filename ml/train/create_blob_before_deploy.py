from azure.storage.blob import BlockBlobService, PublicAccess
import argparse

if __name__=='__main__':
	parser = argparse.ArgumentParser(description='[acct_name] [acct_key] [container_name]')
	parser.add_argument('acct_name', type=str, nargs='+',
	                   help='storage acct name')
	parser.add_argument('acct_key', type=str, nargs='+',
	                   help='storage acct key')
	parser.add_argument('container_name', type=str, nargs='+',
	                   help='container name')

	args = parser.parse_args()

	storage_account_name = args.acct_name[0]
	storage_account_key = args.acct_key[0]
	container_name = args.container_name[0]

	block_blob_service = BlockBlobService(account_name=storage_account_name, account_key=storage_account_key)

	# Create a container called 'quickstartblobs'.

	block_blob_service.create_container(container_name)
	# Set the permission so the blobs are public.
	block_blob_service.set_container_acl(container_name, public_access=PublicAccess.Container)