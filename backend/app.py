import os
import tempfile
import json
import re
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
import pymongo  
from google import genai
from dotenv import load_dotenv
from pypdf import PdfReader
import webvtt
from bson import ObjectId
from bson.errors import InvalidId

app = Flask(__name__)
CORS(app)

load_dotenv()
client = genai.Client()

# --- MONGODB CONNECTION ---
mongo_client = MongoClient("mongodb://localhost:27017/")
db = mongo_client["tagmeta_db"]
collection = db["transcripts"]
print("Connected to MongoDB successfully!")

# --- HELPER: CLEAN CSV STRING LISTS ---
def clean_str_list(raw_val):
    if isinstance(raw_val, list):
        return raw_val
    if isinstance(raw_val, str):
        cleaned = re.sub(r"[\[\]\'\"]", "", raw_val)
        return [item.strip() for item in cleaned.split(',') if item.strip()]
    return []

# --- PARSING LOGIC ---
def parse_file(filepath, filename):
    ext = filename.lower().split('.')[-1]
    text_content = ""
    segments = [] 
    if ext == 'txt':
        with open(filepath, 'r', encoding='utf-8') as f:
            text_content = f.read()
    elif ext == 'pdf':
        reader = PdfReader(filepath)
        for page in reader.pages:
            if page.extract_text():
                text_content += page.extract_text() + "\n"
    elif ext == 'vtt':
        for caption in webvtt.read(filepath):
            text_content += f"[{caption.start} -> {caption.end}] {caption.text}\n"
            segments.append({"start": caption.start, "end": caption.end, "text": caption.text})
    return text_content, segments

# ==========================================
# --- 1. DYNAMIC DASHBOARD API ---
# ==========================================
@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    try:
        total_scripts = collection.count_documents({})
        
        genre_pipeline = [
            {"$project": {"normalized_genre": {"$ifNull": ["$genre", "$genres"]}}},
            {"$match": {"normalized_genre": {"$nin": [None, "", "Unknown"]}}},
            {"$group": {"_id": "$normalized_genre", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 7}
        ]
        genre_data = [{"genre": doc["_id"] if doc["_id"] else "Unknown", "count": doc["count"]} for doc in collection.aggregate(genre_pipeline)]

        emotion_pipeline = [
            {"$match": {"emotion": {"$nin": [None, "", "Unknown"]}}},
            {"$group": {"_id": "$emotion", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        colors = ['#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#ec4899', '#64748b']
        emotion_data = []
        for i, doc in enumerate(collection.aggregate(emotion_pipeline)):
            emotion_data.append({
                "name": doc["_id"],
                "value": doc["count"],
                "color": colors[i % len(colors)]
            })
            
        recent_cursor = collection.find().sort('_id', pymongo.DESCENDING).limit(6)
        recent_scripts = []
        for doc in recent_cursor:
            title = doc.get("title", doc.get("file_name", "Untitled"))
            if isinstance(title, str) and title.endswith('.txt'):
                title = title.replace('.txt', '')
                
            recent_scripts.append({
                "id": str(doc["_id"]),
                "title": title,
                "genre": doc.get("genre", doc.get("genres", "Unknown")),
                "status": "COMPLETED",
                "words": f"{doc.get('words', 0):,}"
            })

        return jsonify({
            "totalTranscripts": total_scripts,
            "analyzed": total_scripts, 
            "sourceFiles": total_scripts,
            "entities": total_scripts * 15, 
            "inProgress": 0,
            "pendingQueue": 0,
            "failed": 0,
            "genreData": genre_data,
            "emotionData": emotion_data,
            "recentScripts": recent_scripts
        }), 200
    except Exception as e:
        print(f"Dashboard Aggregation Error: {e}")
        return jsonify({"error": str(e)}), 500

# ==========================================
# --- 2. DYNAMIC SEARCH API ---
# ==========================================
@app.route('/api/search', methods=['GET'])
def search_transcripts():
    query = request.args.get('q', '').strip()
    genre = request.args.get('genre', 'All Categories')
    sentiment = request.args.get('sentiment', 'All Sentiments')
    emotion = request.args.get('emotion', 'All Emotions')
    character = request.args.get('character', '').strip()
    
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    skip = (page - 1) * limit
    
    conditions = []
    
    if query:
        conditions.append({
            "$or": [
                {"title": {"$regex": query, "$options": "i"}},
                {"file_name": {"$regex": query, "$options": "i"}},
                {"ai_summary": {"$regex": query, "$options": "i"}}
            ]
        })
    if genre != 'All Categories':
        conditions.append({
            "$or": [
                {"genre": {"$regex": genre, "$options": "i"}},
                {"genres": {"$regex": genre, "$options": "i"}}
            ]
        })
    if sentiment != 'All Sentiments':
        conditions.append({
            "$or": [
                {"sentiment": {"$regex": sentiment, "$options": "i"}},
                {"primary_sentiment_tone": {"$regex": sentiment, "$options": "i"}}
            ]
        })
    if emotion != 'All Emotions':
        conditions.append({"emotion": {"$regex": emotion, "$options": "i"}})
    if character:
        conditions.append({
            "$or": [
                {"named_entities.name": {"$regex": character, "$options": "i"}},
                {"extracted_people": {"$regex": character, "$options": "i"}}
            ]
        })
        
    search_criteria = {"$and": conditions} if len(conditions) > 1 else (conditions[0] if conditions else {})
    
    total_results = collection.count_documents(search_criteria)
    total_pages = (total_results + limit - 1) // limit
    
    cursor = collection.find(search_criteria).sort('_id', pymongo.DESCENDING).skip(skip).limit(limit)
    results = []
    
    for doc in cursor:
        title = doc.get('title', doc.get('file_name', 'Untitled'))
        if isinstance(title, str) and title.endswith('.txt'):
            title = title.replace('.txt', '')
            
        genre_val = doc.get('genre', doc.get('genres', 'Drama'))
        summary = doc.get('ai_summary', '')
        snippet = str(summary)[:200] + "..." if summary else "No summary available for bulk data."

        raw_chars = doc.get('named_entities', doc.get('extracted_people', []))
        cleaned_chars = clean_str_list(raw_chars)
        characters = [e.get('name', e) if isinstance(e, dict) else e for e in cleaned_chars][:3]

        score = 100
        if query:
            if query.lower() in title.lower():
                score = 99 
            else:
                score = 85 

        results.append({
            "id": str(doc['_id']),
            "title": title,
            "genre": genre_val,
            "source": "MongoDB",
            "words": doc.get('words', 'Unknown'),
            "snippet": snippet,
            "matchedIn": "DATABASE",
            "sentiment": doc.get('sentiment', doc.get('primary_sentiment_tone', 'Neutral')),
            "emotion": doc.get('emotion', 'Unknown'),
            "confidence": score, 
            "characters": characters
        })

    return jsonify({
        "total": total_results, 
        "page": page,
        "totalPages": total_pages,
        "results": results
    }), 200

# ==========================================
# --- 3. DYNAMIC INSIGHTS API ---
# ==========================================
@app.route('/api/insights/<script_id>', methods=['GET'])
def get_script_insights(script_id):
    try:
        doc = None
        
        if script_id and script_id not in ['default', 'null']:
            try:
                doc = collection.find_one({"_id": ObjectId(script_id)})
            except InvalidId:
                doc = collection.find_one({"id": str(script_id)})
                
        if not doc:
            doc = collection.find_one(sort=[('_id', pymongo.DESCENDING)])
            
        if not doc:
            return jsonify({"error": "Script not found"}), 404

        title = doc.get('title', doc.get('file_name', 'Unknown Title'))
        if isinstance(title, str) and title.endswith('.txt'):
            title = title.replace('.txt', '')

        raw_topics = doc.get('topics', doc.get('extracted_topics_keywords', []))
        cleaned_topics = clean_str_list(raw_topics)
        if cleaned_topics and isinstance(cleaned_topics[0], str):
            cleaned_topics = [{"theme": t, "score": 85} for t in cleaned_topics]
        else:
            cleaned_topics = raw_topics

        raw_chars = doc.get('named_entities', doc.get('extracted_people', []))
        cleaned_chars = clean_str_list(raw_chars)
        if cleaned_chars and isinstance(cleaned_chars[0], str):
            cleaned_chars = [{"name": c, "relevance": 85} for c in cleaned_chars]
        else:
            cleaned_chars = raw_chars

        raw_locs = doc.get('locations', doc.get('extracted_locations', []))
        cleaned_locs = clean_str_list(raw_locs)
        if cleaned_locs and isinstance(cleaned_locs[0], str):
            cleaned_locs = [{"name": c, "relevance": 85} for c in cleaned_locs]
        else:
            cleaned_locs = raw_locs

        raw_orgs = doc.get('organizations', doc.get('extracted_organizations', []))
        cleaned_orgs = clean_str_list(raw_orgs)
        if cleaned_orgs and isinstance(cleaned_orgs[0], str):
            cleaned_orgs = [{"name": c, "relevance": 85} for c in cleaned_orgs]
        else:
            cleaned_orgs = raw_orgs

        return jsonify({
            "id": str(doc['_id']),
            "title": title,
            "source": "MongoDB",
            "words": doc.get('words', 'Unknown'), 
            "scenes": doc.get('scenes', doc.get('total_scenes_detected', 0)), 
            "speakers": doc.get('unique_speakers_count', 4),
            "genre": doc.get('genre', doc.get('genres', 'Drama')),
            "subgenres": doc.get('subgenres', []),
            "tone": {
                "label": doc.get('sentiment', doc.get('primary_sentiment_tone', 'Neutral')), 
                "score": str(doc.get('sentiment_compound_score', '+0.0'))
            },
            "emotion": {"label": doc.get('emotion', 'Unknown'), "confidence": "98%"},
            "aiSummary": doc.get('ai_summary', 'No narrative summary generated during bulk ingestion.'),
            "topics": cleaned_topics,
            "namedEntities": cleaned_chars,
            "keywords": doc.get('keywords', []),
            "genreContext": "Character-driven storytelling.",
            "deepAnalysis": doc.get('deep_analysis', {
                "narrative_arc": "Deep analysis is only available for AI-processed scripts.",
                "thematic_execution": "Deep analysis is only available for AI-processed scripts."
            }),
            "metadataScores": {"entities": "85%", "topics": "88%", "sentiment": "98%", "segmentation": "100%"},
            "timeline": doc.get('timeline', []),
            "locations": cleaned_locs,
            "organizations": cleaned_orgs,
            "worksSongs": doc.get('works_songs', []),
            "otherEntities": doc.get('other_entities', []),
            "speakerMetrics": doc.get('speaker_metrics', []),
            # WIRED: Memorable Quotes safely pulled from DB
            "memorableQuotes": doc.get('memorable_quotes', doc.get('memorableQuotes', []))
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==========================================
# --- 4. UPLOAD & FORCE-REPLACE UPSERT ---
# ==========================================
@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
        
    file = request.files['file']
    ext = file.filename.lower().split('.')[-1]
    if ext not in {'txt', 'pdf', 'vtt'}:
        return jsonify({"error": f"Unsupported format: .{ext}"}), 400

    try:
        temp_dir = tempfile.gettempdir()
        filepath = os.path.join(temp_dir, file.filename)
        file.save(filepath)

        text_content, segments = parse_file(filepath, file.filename)
        safe_text = text_content[:150000]

        extraction_prompt = f"""
        You are an expert movie metadata analyst. Analyze the following transcript and extract the requested data.
        
        STRICT RULES:
        1. DO NOT fabricate information.
        2. Return ONLY a raw JSON object. Do not wrap it in markdown. Do not add explanations.
        
        JSON STRUCTURE:
        {{
            "ai_summary": "Detailed narrative summary",
            "genre": "Primary Genre",
            "subgenres": ["Subgenre 1", "Subgenre 2"],
            "sentiment": "Positive, Negative, or Neutral",
            "emotion": "Dominant emotion",
            "deep_analysis": {{
                "narrative_arc": "A detailed 2-sentence analysis of the narrative structure and plot pacing.",
                "thematic_execution": "A detailed 2-sentence analysis of how the core themes are executed."
            }},
            "topics": [
                {{"theme": "Theme Name", "score": 95, "sub_tags": ["tag1", "tag2"]}}
            ],
            "keywords": [
                {{"word": "keyword1", "count": "+152"}}
            ],
            "named_entities": [
                {{"name": "Character Name", "relevance": 98}}
            ],
            "locations": [
                {{"name": "City/Room/Setting", "relevance": 90}}
            ],
            "organizations": [
                {{"name": "Company/Group", "relevance": 85}}
            ],
            "works_songs": [
                {{"name": "Movie/Song/Book Ref", "relevance": 80}}
            ],
            "other_entities": [
                {{"name": "Event/Concept", "relevance": 75}}
            ],
            "speaker_metrics": [
                {{"speaker": "Name", "dialogue_lines": 45, "word_count": 320, "sentiment": "Neutral", "emotion": "Joy"}}
            ],
            "memorable_quotes": [
                {{"quote_text": "Exact quote from the text", "speaker": "Speaker Name", "reason": "Why it is memorable"}}
            ]
        }}

        TRANSCRIPT TO ANALYZE:
        {safe_text}
        """

        response = client.models.generate_content(
            model='gemini-3.5-flash',
            contents=extraction_prompt
        )

        raw_text = response.text.strip()
        if raw_text.startswith('```json'):
            raw_text = raw_text[7:-3]
        elif raw_text.startswith('```'):
            raw_text = raw_text[3:-3]
            
        ai_data = json.loads(raw_text.strip())
        
        clean_name = file.filename.rsplit('.', 1)[0]
        
        # Safely extract all keys regardless of camelCase or snake_case AI generation
        clean_metadata = {
            "title": clean_name,
            "file_name": file.filename,
            "words": len(text_content.split()),
            "ai_summary": ai_data.get("ai_summary", ai_data.get("aiSummary", "No summary generated.")),
            "genre": ai_data.get("genre", "Unknown"),
            "subgenres": ai_data.get("subgenres", []),
            "sentiment": ai_data.get("sentiment", "Neutral"),
            "emotion": ai_data.get("emotion", "Unknown"),
            "deep_analysis": ai_data.get("deep_analysis", {
                "narrative_arc": "No structural analysis generated.",
                "thematic_execution": "No thematic analysis generated."
            }),
            "topics": ai_data.get("topics", []),
            "keywords": ai_data.get("keywords", []),
            "timeline": segments,
            "named_entities": ai_data.get("named_entities", ai_data.get("namedEntities", [])),
            "locations": ai_data.get("locations", []),
            "organizations": ai_data.get("organizations", []),
            "works_songs": ai_data.get("works_songs", ai_data.get("worksSongs", [])),
            "other_entities": ai_data.get("other_entities", ai_data.get("otherEntities", [])),
            "speaker_metrics": ai_data.get("speaker_metrics", ai_data.get("speakerMetrics", [])),
            "memorable_quotes": ai_data.get("memorable_quotes", ai_data.get("memorableQuotes", []))
        }
        
        escaped_name = re.escape(clean_name)
        fuzzy_name = escaped_name.replace('\\ ', '[ _-]').replace('\\_', '[ _-]').replace('\\-', '[ _-]')
        
        existing_docs = list(collection.find({
            "$or": [
                {"file_name": {"$regex": f"^{fuzzy_name}", "$options": "i"}},
                {"title": {"$regex": f"^{fuzzy_name}", "$options": "i"}}
            ]
        }))
        
        # WIRED: If an old document exists, entirely DELETE it so the new insert gets a fresh Timestamp ID
        # This guarantees it pops to the top of the "Recent Dashboard" view!
        if existing_docs:
            for doc in existing_docs:
                collection.delete_one({"_id": doc["_id"]})
                print(f"DELETED OLD DB RECORD: {doc.get('title')}")
                
        # Insert fresh to generate a brand new Timestamped ObjectId
        insert_result = collection.insert_one(clean_metadata)
        clean_metadata['_id'] = str(insert_result.inserted_id)

        return jsonify({
            "message": "File parsed, analyzed, duplicates deleted, and saved to MongoDB!",
            "status": "Success",
            "metadata": clean_metadata
        })

    except Exception as e:
        error_str = str(e)
        if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
            clean_msg = "AI Speed Limit Reached: Please wait 60 seconds before analyzing another script."
            return jsonify({"error": clean_msg}), 429
        return jsonify({"error": "An unexpected error occurred during AI analysis. Please try again."}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)