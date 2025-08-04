import json
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

FILE_NAME = 'test.json'

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

    return new_dict

def has_cycles(edges: list[dict]) -> bool:
    # Build adjacency list from edges
    graph = {}
    for edge in edges:
        source = edge['concept']
        targets = edge['depends-on']
        
        if source not in graph:
            graph[source] = []
        graph[source].extend(targets)
    
    # DFS to detect cycles
    visited = set()
    rec_stack = set()
    
    def dfs(node: str) -> bool:
        visited.add(node)
        rec_stack.add(node)
        
        # Check all neighbors
        if node in graph:
            for neighbor in graph[node]:
                if neighbor not in visited:
                    if dfs(neighbor):
                        return True
                elif neighbor in rec_stack:
                    # Back edge found - cycle detected
                    print('Cycle found:', rec_stack)
                    return True
        
        rec_stack.remove(node)
        return False
    
    # Check for cycles starting from each unvisited node
    for node in graph:
        if node not in visited:
            if dfs(node):
                return True
    
    return False

def has_parent_cycles(data: dict) -> bool:
    # Build mapping from child to parent
    child_to_parent = {}
    
    # Map all children to their parents
    if 'groups' in data:
        for group in data['groups']:
            parent = group['parent'].upper()
            for child in group['children']:
                child_to_parent[child] = parent
    
    # Build parent-level graph
    parent_graph = {}
    
    for edge in data['edges']:
        source = edge['concept']
        targets = edge['depends-on']
        
        source_parent = child_to_parent.get(source, '')
        target_parents = [child_to_parent.get(target, '') for target in targets]
        
        # Add edges between parents
        if source_parent not in parent_graph:
            parent_graph[source_parent] = set()
        
        for target_parent in target_parents:
            if target_parent != source_parent:  # Don't add self-loops
                parent_graph[source_parent].add(target_parent)
    
    # Convert sets to lists for consistency with has_cycles
    parent_edges = []
    for source_parent, target_parents in parent_graph.items():
        for target_parent in target_parents:
            parent_edges.append({
                'concept': source_parent,
                'depends-on': [target_parent]
            })
    
    # Use the existing has_cycles function to check for cycles in parent graph
    return has_cycles(parent_edges)

@app.get('/load-toggle')
def load_toggle():
    try:
        with open(FILE_NAME, 'r') as file:
            data = json.load(file)
            new_dict: dict = get_toggle_list(data)
            # print(new_dict)
        return new_dict
    except FileNotFoundError:
        return {'error': f'File {FILE_NAME} not found'}
    except json.JSONDecodeError:
        return {'error': f'Invalid JSON in {FILE_NAME}'}
    except Exception as e:
        return {'error': f'Unexpected error: {str(e)}'}

@app.get('/nodes-json/{use_pos}')
def parse_nodes_json(use_pos: bool) -> dict:
    try:
        with open(FILE_NAME, 'r') as file:
            data = json.load(file)
            print('HAS CYCLES:', has_cycles(data['edges']))
            print('PARENTS HAVE CYCLES:', has_parent_cycles(data))
            new_dict: dict = turn_into_cyto(data, use_pos)
        return new_dict
    except FileNotFoundError:
        return {'error': f'File {FILE_NAME} not found'}
    except json.JSONDecodeError:
        return {'error': f'Invalid JSON in {FILE_NAME}'}
    except Exception as e:
        return {'error': f'Unexpected error: {str(e)}'}

@app.post('/save-positions')
async def save_positions(request: Request):
    try:
        positions = await request.json()
        with open('positions.json', 'w') as f:
            json.dump(positions, f, indent=2)
        return {"message": "Positions saved successfully", "positions": positions}
    except Exception as e:
        return {"error": f"Failed to save positions: {str(e)}"}
 