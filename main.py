import json
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

filename = 'test.json'

def add_positions(contents: dict) -> None:
    try:
        with open('positions.json', 'r') as f:
            positions = json.load(f)
        
        for node in contents['nodes']:
            name: str = node['data']['id']
            if name in positions:
                pos: dict = positions[name]
                node['position'] = pos
    except FileNotFoundError:
        pass
    except Exception as e:
        print(f"Error loading positions: {e}")

def turn_into_cyto(old_dict: dict, use_pos: bool) -> dict:
    new_dict = {'nodes': [], 'edges': []}
    nodes_and_parents: dict[str, str] = {}

    # append nodes to new_dict
    if 'groups' in old_dict:
        for group in old_dict['groups']:
            parent: str = group['parent'].upper()
            node: dict = {
                'data': {'id': parent}, 
                'classes': 'parent'}
            new_dict['nodes'].append(node)

            children = group['children']
            for c in children:
                node = {'data': {'id': c, 'parent': parent}}
                new_dict['nodes'].append(node)

                nodes_and_parents[c] = parent
    
    if 'parentless nodes' in old_dict:
        for n in old_dict['parentless nodes']:
            node: dict = {'data': {'id': n}}
            new_dict['nodes'].append(node)

            nodes_and_parents[n] = ''

    # append edges to new_dict
    for e in old_dict['edges']:
        source = e['concept']
        parent_source = nodes_and_parents[source]
        for concept in e['depends-on']:
            parent_concept = nodes_and_parents[concept]

            out = 'out' if parent_concept != parent_source else ''
            
            new_dict['edges'].append({
                'data': {'source': source, 'target': concept}, 
                'classes': out})
    
    if use_pos:
        add_positions(new_dict)

    return new_dict

def get_toggle_list(old_dict: dict) -> dict:
    new_dict = {}

    if 'groups' in old_dict:
        for group in old_dict['groups']:
            parent: str = group['parent'].upper()
            children: list[str] = group['children']

            new_dict[parent] = children

    if 'nodes without a parent' in old_dict:
        new_dict[''] = old_dict['nodes without a parent']

    return new_dict

@app.get('/load-toggle')
def load_toggle():
    try:
        with open(filename, 'r') as file:
            data = json.load(file)
            new_dict: dict = get_toggle_list(data)
            print(new_dict)
        return new_dict
    except FileNotFoundError:
        return {'error': f'File {filename} not found'}
    except json.JSONDecodeError:
        return {'error': f'Invalid JSON in {filename}'}
    except Exception as e:
        return {'error': f'Unexpected error: {str(e)}'}

@app.get('/nodes-json/{use_pos}')
def parse_nodes_json(use_pos: bool) -> dict:
    try:
        with open(filename, 'r') as file:
            data = json.load(file)
            new_dict: dict = turn_into_cyto(data, use_pos)
        return new_dict
    except FileNotFoundError:
        return {'error': f'File {filename} not found'}
    except json.JSONDecodeError:
        return {'error': f'Invalid JSON in {filename}'}
    except Exception as e:
        return {'error': f'Unexpected error: {str(e)}'}

@app.post('/save-positions')
async def save_positions(request: Request):
    try:
        positions = await request.json()
        # Here you can save the positions to a file or database
        # For now, let's just print them
        with open('positions.json', 'w') as f:
            json.dump(positions, f, indent=2)
        return {"message": "Positions saved successfully", "positions": positions}
    except Exception as e:
        return {"error": f"Failed to save positions: {str(e)}"}
 