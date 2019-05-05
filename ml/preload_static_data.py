import azure.cosmos.documents as documents
import azure.cosmos.cosmos_client as cosmos_client
import azure.cosmos.errors as errors
import datetime

import samples.Shared.config as cfg

import pandas as pd

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

HOST = "https://edgeserverdatabaseaccount.documents.azure.com:443/"
MASTER_KEY = "ZdYMlvNLJQHsVmInhEeNafE1vNEeRNjl5s4LaDR0Vz7JI7Bw2kHfXu0LznwY8UG36q3Ge7MqaYVQcJyBixcSvA=="
DATABASE_ID = "edgeserverdatabase"
COLLECTION_ID = "staticData"

database_link = 'dbs/' + DATABASE_ID
collection_link = database_link + '/colls/' + COLLECTION_ID

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

class DocumentManagement:
    
    @staticmethod
    def CreateDocuments(client):
        print('Creating Documents')

        
        data = pd.read_csv("calving.csv")
        static_columns = ["LACT", "PDIM", "PDOPN", "PREFR", "PTOTF", "PTOTM", "PTOTS", "parity"]

        documents = []
        already_found = set()

        for key, value in data.iterrows():
            if value["ID"] not in already_found:
                # print(already_found)
                already_found.add(value["ID"])
                temp_doc = dict()
                temp_doc["id"] = str(value["ID"])

                for column in static_columns:
                    temp_doc[column] = value[column]
                
                documents.append(temp_doc)

        # print(DocumentManagement.GetSalesOrderV2("SalesOrder2"))

        for document in documents:
            try:
                client.CreateItem(collection_link, document)
                print(document)

            except:
                pass
        # client.CreateItem(collection_link, DocumentManagement.GetSalesOrderV2("SalesOrder2"))


    # @staticmethod
    # def ReadDocument(client, doc_id):
    #     print('\n1.2 Reading Document by Id\n')

    #     # Note that Reads require a partition key to be spcified. This can be skipped if your collection is not
    #     # partitioned i.e. does not have a partition key definition during creation.
    #     doc_link = collection_link + '/docs/' + doc_id
    #     response = client.ReadItem(doc_link)

    #     print('Document read by Id {0}'.format(doc_id))
    #     print('Account Number: {0}'.format(response.get('account_number')))

    # @staticmethod
    # def ReadDocuments(client):
    #     print('\n1.3 - Reading all documents in a collection\n')

    #     # NOTE: Use MaxItemCount on Options to control how many documents come back per trip to the server
    #     #       Important to handle throttles whenever you are doing operations such as this that might
    #     #       result in a 429 (throttled request)
    #     documentlist = list(client.ReadItems(collection_link, {'maxItemCount':10}))
        
    #     print('Found {0} documents'.format(documentlist.__len__()))
        
    #     for doc in documentlist:
    #         print('Document Id: {0}'.format(doc.get('id')))

    # @staticmethod
    # def GetSalesOrder(document_id):
    #     order1 = {'id' : document_id,
    #             'account_number' : 'Account1',
    #             'purchase_order_number' : 'PO18009186470',
    #             'order_date' : datetime.date(2005,1,10).strftime('%c'),
    #             'subtotal' : 419.4589,
    #             'tax_amount' : 12.5838,
    #             'freight' : 472.3108,
    #             'total_due' : 985.018,
    #             'items' : [
    #                 {'order_qty' : 1,
    #                  'product_id' : 100,
    #                  'unit_price' : 418.4589,
    #                  'line_price' : 418.4589
    #                 }
    #                 ],
    #             'ttl' : 60 * 60 * 24 * 30
    #             }

    #     return order1

    @staticmethod
    def GetSalesOrderV2(document_id):
        # notice new fields have been added to the sales order
        order2 = {'id' : document_id,
                'account_number' : 'Account2',
                'purchase_order_number' : 'PO15428132599',
                'order_date' : datetime.date(2005,7,11).strftime('%c'),
                'due_date' : datetime.date(2005,7,21).strftime('%c'),
                'shipped_date' : datetime.date(2005,7,15).strftime('%c'),
                'subtotal' : 6107.0820,
                'tax_amount' : 586.1203,
                'freight' : 183.1626,
                'discount_amt' : 1982.872,
                'total_due' : 4893.3929,
                'items' : [
                    {'order_qty' : 3,
                     'product_code' : 'A-123',      # notice how in item details we no longer reference a ProductId
                     'product_name' : 'Product 1',  # instead we have decided to denormalise our schema and include 
                     'currency_symbol' : '$',       # the Product details relevant to the Order on to the Order directly
                     'currecny_code' : 'USD',       # this is a typical refactor that happens in the course of an application
                     'unit_price' : 17.1,           # that would have previously required schema changes and data migrations etc.
                     'line_price' : 5.7
                    }
                    ],
                'ttl' : 60 * 60 * 24 * 30
                }

        return order2

def run_sample():

    with IDisposable(cosmos_client.CosmosClient(HOST, {'masterKey': MASTER_KEY} )) as client:
        try:
            # setup database for this sample
            # try:
            #     client.CreateDatabase({"id": DATABASE_ID})

            # except errors.HTTPFailure as e:
            #     if e.status_code == 409:
            #         pass
            #     else:
            #         raise errors.HTTPFailure(e.status_code)

            # # setup collection for this sample
            # try:
            #     client.CreateContainer(database_link, {"id": COLLECTION_ID})
            #     print('Collection with id \'{0}\' created'.format(COLLECTION_ID))

            # except errors.HTTPFailure as e:
            #     if e.status_code == 409:
            #         print('Collection with id \'{0}\' was found'.format(COLLECTION_ID))
            #     else:
            #         raise errors.HTTPFailure(e.status_code)

            DocumentManagement.CreateDocuments(client)
            # DocumentManagement.ReadDocument(client,'SalesOrder1')
            # DocumentManagement.ReadDocuments(client)

        except errors.HTTPFailure as e:
            print('\nrun_sample has caught an error. {0}'.format(e.message))
        
        finally:
            print("\nrun_sample done")

if __name__ == '__main__':
    try:
        run_sample()

    except Exception as e:
            print("Top level Error: args:{0}, message:N/A".format(e.args))