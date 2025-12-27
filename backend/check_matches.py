from app.services.privacy_aggregator import privacy_aggregator
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')
query = 'joint hypermobility stretchy skin easy bruising'
vector = model.encode(query).tolist()

matches, context = privacy_aggregator.query_all_nodes(vector)

print(f'Total matches: {len(matches)}')
print(f'Context unique_matches: {context.unique_matches}')
print('\nSample match structure:')
for i, m in enumerate(matches[:5]):
    print(f'{i}: id={repr(m.get("id"))}, keys={list(m.keys())}')

print(f'\nAll unique IDs found:')
ids = [m.get('id', '') for m in matches]
unique_ids = set(ids)
print(f'Total IDs: {len(ids)}')
print(f'Unique IDs: {len(unique_ids)}')
print(f'Empty string IDs: {ids.count("")}')
print(f'Sample IDs: {list(unique_ids)[:10]}')
