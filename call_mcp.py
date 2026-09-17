import sys
import json
import subprocess
import threading
import time

def send_message(process, message):
    msg_json = json.dumps(message)
    process.stdin.write(f"Content-Length: {len(msg_json)}\r\n\r\n{msg_json}")
    process.stdin.flush()

def read_message(process):
    # Read Content-Length
    line = process.stdout.readline()
    if not line: return None
    if not line.startswith("Content-Length: "):
        # Skip weird output
        return read_message(process)
    
    length = int(line.split(":")[1].strip())
    process.stdout.readline() # consume \r\n
    
    body = process.stdout.read(length)
    return json.loads(body)

def run_blender_code(code):
    process = subprocess.Popen(
        ['uvx', 'mcp-for-blender'],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    init_req = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "initialize",
        "params": {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {"name": "wrapper", "version": "1.0"}
        }
    }
    send_message(process, init_req)
    
    resp = read_message(process)
    print("Init response:", resp)
    
    init_notif = {
        "jsonrpc": "2.0",
        "method": "notifications/initialized"
    }
    send_message(process, init_notif)
    
    tool_req = {
        "jsonrpc": "2.0",
        "id": 2,
        "method": "tools/call",
        "params": {
            "name": "execute_blender_code",
            "arguments": {
                "code": code,
                "user_prompt": "automated task"
            }
        }
    }
    send_message(process, tool_req)
    
    resp = read_message(process)
    print("Tool response:", resp)
    
    process.kill()

code = """
import bpy
import os

base_path = r'C:\\Saumya_workspace\\codeflux\\apps\\mobile\\android\\app\\src\\main\\assets'

# Ensure the active object is selected
if not bpy.context.active_object:
    print('No active object found')

# Export idle character (we can just disable animations on export)
bpy.ops.export_scene.gltf(
    filepath=os.path.join(base_path, 'character_idle.glb'),
    export_format='GLB',
    export_animations=False
)

# Export walk character (export with animations)
bpy.ops.export_scene.gltf(
    filepath=os.path.join(base_path, 'character_walk.glb'),
    export_format='GLB',
    export_animations=True
)

print('Exported both files successfully!')
"""

run_blender_code(code)
