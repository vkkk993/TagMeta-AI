import pandas as pd
from pymongo import MongoClient

# 1. Connect to Local MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["tagmeta_db"]          # Creates a database named 'tagmeta_db'
collection = db["transcripts"]     # Creates a collection (like a table) named 'transcripts'

def seed_database():
    print("Reading CSV...")
    try:
        # 2. Read the CSV and fill blank spaces
        df = pd.read_csv("FINAL_movie_metadata_complete.csv").fillna("Unknown")
        
        # 3. Convert the DataFrame to a list of Python dictionaries
        records = df.to_dict(orient='records')
        
        # 4. Clear the old database (prevents duplicates if you run this twice)
        collection.delete_many({})
        
        # 5. Insert all records into MongoDB
        collection.insert_many(records)
        print(f"Successfully seeded {len(records)} transcripts into MongoDB!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")

if __name__ == "__main__":
    seed_database()