import azure.cosmos.documents as documents
import azure.cosmos.cosmos_client as cosmos_client
import azure.cosmos.errors as errors
import datetime

import samples.Shared.config as cfg
import numpy as np
import csv

# ----------------------------------------------------------------------------------------------------------
# Prerequistes - 
# 
# 1. An Azure Cosmos account - 
#    https:#azure.microsoft.com/en-us/documentation/articles/documentdb-create-account/
#
# 2. Microsoft Azure Cosmos PyPi package - 
#    https://pypi.python.org/pypi/azure-cosmos/
# ----------------------------------------------------------------------------------------------------------
# Sample - demonstrates the basic CRUD operations on a Database resource for Azure Cosmos
#
# 1. Query for Database (QueryDatabases)
#
# 2. Create Database (CreateDatabase)
#
# 3. Get a Database by its Id property (ReadDatabase)
#
# 4. List all Database resources on an account (ReadDatabases)
#
# 5. Delete a Database given its Id property (DeleteDatabase)
# ----------------------------------------------------------------------------------------------------------


class IDisposable(cosmos_client.CosmosClient):
    """ A context manager to automatically close an object with a close method
    in a with statement. """

    def __init__(self, obj):
        self.obj = obj

    def __enter__(self):
        return self.obj # bound to target

    def __exit__(self, exception_type, exception_val, trace):
        # extra cleanup in here
        self = None

def run_query(input_query, HOST, MASTER_KEY, DATABASE_ID, COLLECTION_ID, csv_name):
    
    
    database_link = 'dbs/' + DATABASE_ID
    collection_link = database_link + '/colls/' + COLLECTION_ID
        
    with IDisposable(cosmos_client.CosmosClient(HOST, {'masterKey': MASTER_KEY} )) as client:
        try:
            query = {'query': input_query}

            options = {'enableCrossPartitionQuery': True}

            result_iterable = client.QueryItems(collection_link, query, options)
            # for item in iter(result_iterable):
            #     print(item)

             
            tot_sum = 0
            num_rows = 0
            rows = []
            for item in iter(result_iterable):
                rows.append(item)
                tot_sum += [int(item["runtime"])]
                num_rows += 1

            #write all the rows to csv    
            with open(csv_name, mode='w') as csv_file:
                csv_file.write('runtime\n')
                for row in rows:
                    csv_file.write(row + '\n')   

            print(float(tot_sum)/num_rows)
        except errors.HTTPFailure as e:
            print(e)


run_query('SELECT * FROM server s', 'https://edgeserverdatabaseaccount.documents.azure.com:443/', 'ZdYMlvNLJQHsVmInhEeNafE1vNEeRNjl5s4LaDR0Vz7JI7Bw2kHfXu0LznwY8UG36q3Ge7MqaYVQcJyBixcSvA==', 'edgeserverdatabase', 'latencyData', 'one_req_per_sec')