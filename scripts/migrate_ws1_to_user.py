import uuid
from src.database.supabase_client import supabase_manager

ws1_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, 'ws_1'))
clerk_user_id = 'user_3FGB3zjJhpqdecshUi0ZFu1DUp1'
user_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, clerk_user_id))

print(f"Migrating documents from ws_1 ({ws1_uuid}) -> User ({user_uuid})")
admin = supabase_manager.get_admin_client()

# Fetch documents for ws_1
docs_res = admin.table('documents').select('*').eq('tenant_id', ws1_uuid).execute()
ws1_docs = docs_res.data or []
print(f"Found {len(ws1_docs)} documents in ws_1")

for doc in ws1_docs:
    orig_doc_id = doc['id']
    filename = doc['filename']
    status = doc.get('status', 'completed')
    
    # Check if document already exists for user_uuid
    existing = admin.table('documents').select('*').eq('tenant_id', user_uuid).eq('filename', filename).execute()
    if existing.data and len(existing.data) > 0:
        new_doc_id = existing.data[0]['id']
        print(f"Document '{filename}' already exists for user with ID: {new_doc_id}")
    else:
        new_doc_id = str(uuid.uuid4())
        doc_payload = {
            'id': new_doc_id,
            'tenant_id': user_uuid,
            'filename': filename,
            'status': status
        }
        res_doc = admin.table('documents').insert(doc_payload).execute()
        print(f"Created document '{filename}' for user: {new_doc_id}")

    # Fetch chunks from ws_1
    chunks_res = admin.table('document_chunks').select('*').eq('document_id', orig_doc_id).execute()
    ws1_chunks = chunks_res.data or []
    print(f"  Found {len(ws1_chunks)} chunks for '{filename}'")

    # Check how many chunks user already has for new_doc_id
    user_chunks_count = admin.table('document_chunks').select('id', count='exact').eq('document_id', new_doc_id).execute().count or 0
    if user_chunks_count >= len(ws1_chunks) and len(ws1_chunks) > 0:
        print(f"  Chunks already migrated ({user_chunks_count} chunks present). Skipping chunk insertion.")
        continue

    # Prepare chunks for user
    batch_size = 50
    chunks_to_insert = []
    for chunk in ws1_chunks:
        new_chunk = {
            'id': str(uuid.uuid4()),
            'document_id': new_doc_id,
            'tenant_id': user_uuid,
            'parent_id': chunk.get('parent_id'),
            'content': chunk.get('content'),
            'embedding': chunk.get('embedding'),
            'entities': chunk.get('entities'),
            'graph_score': chunk.get('graph_score'),
            'relationship_types': chunk.get('relationship_types')
        }
        chunks_to_insert.append(new_chunk)
        if len(chunks_to_insert) >= batch_size:
            admin.table('document_chunks').insert(chunks_to_insert).execute()
            print(f"  Inserted batch of {len(chunks_to_insert)} chunks...")
            chunks_to_insert = []

    if chunks_to_insert:
        admin.table('document_chunks').insert(chunks_to_insert).execute()
        print(f"  Inserted final batch of {len(chunks_to_insert)} chunks.")

print("\n--- Migration Complete ---")
# Verify
final_docs = admin.table('documents').select('*').eq('tenant_id', user_uuid).execute()
print(f"Total documents for user {clerk_user_id}: {len(final_docs.data)}")
for d in final_docs.data:
    cnt = admin.table('document_chunks').select('id', count='exact').eq('document_id', d['id']).execute().count
    print(f"  - {d['filename']} (ID: {d['id']}): {cnt} chunks")
