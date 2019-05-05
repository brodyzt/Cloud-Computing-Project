import azure.cosmos.documents as documents
import azure.cosmos.cosmos_client as cosmos_client
import azure.cosmos.errors as errors
import datetime

import samples.Shared.config as cfg
import numpy as np

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

def run_query(input_query, HOST, MASTER_KEY, DATABASE_ID, COLLECTION_ID):
    
    
    database_link = 'dbs/' + DATABASE_ID
    collection_link = database_link + '/colls/' + COLLECTION_ID
        
    with IDisposable(cosmos_client.CosmosClient(HOST, {'masterKey': MASTER_KEY} )) as client:
        try:
            query = {'query': input_query}

            options = {'enableCrossPartitionQuery': True}

            result_iterable = client.QueryItems(collection_link, query, options)
            # for item in iter(result_iterable):
            #     print(item)

                    
            return_array = []
            y_return_array = []

            for item in iter(result_iterable):
                
                new_row = [float(item["Daily_Rumination"])/float(item["Weekly_Rumination_Average"])]
                print(item)
                y_new_row = [int(item["period_to_calving"])]
                return_array.append(new_row)
                y_return_array.append(y_new_row)

            numpy_array = np.array(return_array)
            
            nan_idx = np.isnan(numpy_array).any(axis=1)
            numpy_array = numpy_array[~nan_idx]
            
            y_numpy_array = np.array(y_return_array)
            y_numpy_array = y_numpy_array[~nan_idx]
            y_numpy_array = [1 if y >= -10 else 0 for y in y_numpy_array]
            
            return numpy_array, y_numpy_array
        except errors.HTTPFailure as e:
            print(e)


#run_query('SELECT * FROM server s', 'https://edgeserverdatabaseaccount.documents.azure.com:443/', 'ZdYMlvNLJQHsVmInhEeNafE1vNEeRNjl5s4LaDR0Vz7JI7Bw2kHfXu0LznwY8UG36q3Ge7MqaYVQcJyBixcSvA==', 'edgeserverdatabase', 'regularsensordatacollection')
