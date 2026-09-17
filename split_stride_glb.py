import bpy
import os

glb_path = r"C:\Saumya_workspace\codeflux\3d assets\male_phone_walking_40_frames_loop.glb"
out_dir = r"C:\Saumya_workspace\codeflux\apps\mobile\android\app\src\main\assets"

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

bpy.ops.import_scene.gltf(filepath=glb_path)

# Move timeline to frame 20 (mid-stride, legs apart, arms swinging)
bpy.context.scene.frame_set(20)
bpy.context.view_layer.update()

# Bake armature physically into the mesh
for obj in bpy.data.objects:
    if obj.type == 'MESH':
        bpy.context.view_layer.objects.active = obj
        for mod in obj.modifiers:
            if mod.type == 'ARMATURE':
                bpy.ops.object.modifier_apply(modifier=mod.name)

# Delete skeleton to ensure 100% compatibility with Mapbox Native C++ engine
for obj in bpy.data.objects:
    if obj.type == 'ARMATURE':
        bpy.data.objects.remove(obj, do_unlink=True)

# Export the frozen mid-stride pose
bpy.ops.export_scene.gltf(
    filepath=os.path.join(out_dir, 'character_stride.glb'),
    export_format='GLB',
    export_animations=False
)

print("STRIDE GLB BAKE SUCCESS")
