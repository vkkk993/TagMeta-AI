from pymongo import MongoClient
client = MongoClient("mongodb://localhost:27017/")
doc = client["tagmeta_db"]["transcripts"].find_one()
print("YOUR EXACT DATABASE KEYS ARE:\n", doc.keys())