import json
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    all_nodes: dict[str, str] = {}
    for n in old_dict['nodes']:
        all_nodes[n] = ''
    
    if ('groups' in old_dict):
        for group in old_dict['groups']:
            all_nodes[group['name']] = ''

        for group in old_dict['groups']:
            parent: str = group['name']
            children = group['children']
            for c in children:
                all_nodes[c] = parent
    
    for node_name, parent in all_nodes.items():
        node: dict = {'data': {'id': node_name}}
        if (node_name.upper() == node_name):
            node['classes'] = 'parent'
        if parent != '':
            node['data']['parent'] = parent
        new_dict['nodes'].append(node)
    
    for e in old_dict['edges']:
        concept = e['concept']
        for source in e['depends-on']:
            new_dict['edges'].append({'data': {'source': source, 'target': concept}})
    
    if use_pos:
        add_positions(new_dict)

    return new_dict

@app.get('/nodes-json/{use_pos}')
def parse_nodes_json(use_pos: bool) -> dict:
    filename = 'example_format.json'
    
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