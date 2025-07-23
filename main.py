import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def turn_into_cyto(old_dict: dict) -> dict:
    new_dict = {'nodes': [], 'edges': []}
    all_nodes: dict[str, str] = {}
    for n in old_dict['nodes']:
        all_nodes[n] = ''
    for group in old_dict['groups']:
        all_nodes[group['name']] = ''
    
    for group in old_dict['groups']:
        parent: str = group['name']
        children = group['children']
        for c in children:
            all_nodes[c] = parent
    
    for node_name, parent in all_nodes.items():
        node = {'data': {'id': node_name}}
        if parent != '':
            node['data']['parent'] = parent
        new_dict['nodes'].append(node)
    
    for e in old_dict['edges']:
        concept = e['concept']
        for source in e['depends-on']:
            new_dict['edges'].append({'data': {'source': source, 'target': concept}})
    
    return new_dict




@app.get('/nodes-json')
def parse_nodes_json() -> dict:
    filename = 'large_example.json'
    
    try:
        with open(filename, 'r') as file:
            data = json.load(file)
            new_dict: dict = turn_into_cyto(data)
        return new_dict
    except FileNotFoundError:
        return {'error': f'File {filename} not found'}
    except json.JSONDecodeError:
        return {'error': f'Invalid JSON in {filename}'}