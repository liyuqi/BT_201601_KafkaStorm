# -*- coding: utf-8 -*-

from pymongo import MongoClient

client = MongoClient('localhost', 27017)
db = client.unit_test_db
collection = db.unit_test_col

doc = {"msisdn": "886922352852",
       "total_uplink": "38383388",
       "total_downlink": "77777777",
       }
object_id = collection.insert_one(doc).inserted_id
print("insert doc: %s, object_id: %s.", [doc, object_id])

query_doc = collection.find_one()
print("%s", query_doc)