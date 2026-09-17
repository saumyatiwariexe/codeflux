import bpy
import os

glb_path = r"C:\Saumya_workspace\codeflux\3d assets\male_phone_walking_40_frames_loop.glb"
out_dir = r"C:\Saumya_workspace\codeflux\apps\mobile\android\app\src\main\assets"

# Delete default cube and all objects
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# Import the character GLB
bpy.ops.import_scene.gltf(filepath=glb_path)

# Move timeline to frame 10 (mid-walk cycle) so his arms are down at his sides
bpy.context.scene.frame_set(10)
bpy.context.view_layer.update()

# First, find all meshes and physically apply their armature modifiers
for obj in bpy.data.objects:
    if obj.type == 'MESH':
        bpy.context.view_layer.objects.active = obj
        for mod in obj.modifiers:
            if mod.type == 'ARMATURE':
                bpy.ops.object.modifier_apply(modifier=mod.name)

# Next, find and delete the Armature (skeleton) so the mesh is completely static
for obj in bpy.data.objects:
    if obj.type == 'ARMATURE':
        bpy.data.objects.remove(obj, do_unlink=True)

# Export the totally frozen idle character (WITHOUT animations or bones)
bpy.ops.export_scene.gltf(
    filepath=os.path.join(out_dir, 'character_idle.glb'),
    export_format='GLB',
    export_animations=False
)

print("IDLE GLB BAKE SUCCESS")
