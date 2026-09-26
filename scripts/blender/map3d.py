# 3D map shot for the "Where we work" scene, rendered in Blender (Cycles).
#
# India is extruded from the website's own map outline, sits in a dark sea
# with slowly moving water, and a camera glides over the peninsula. Text is
# NOT rendered here: the port pins and labels stay in Remotion (film font,
# word sync), placed on screen from the camera tracking this script writes.
#
#   /opt/bpyenv/bin/python scripts/blender/map3d.py [--scale 0.5] [--frames a-b]
#
# Outputs: out/map3d/####.png (frames) and src/map3d-track.json
# (per-frame screen position of every port, in % of the frame).
# scripts/map3d.sh wraps this and encodes public/render/map3d.mp4.
import json
import math
import re
import sys
from pathlib import Path

import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
WEBSITE = ROOT.parent / "libraa-website"

args = sys.argv[1:]
SCALE = float(args[args.index("--scale") + 1]) if "--scale" in args else 0.5
FRAMES = args[args.index("--frames") + 1] if "--frames" in args else None
SECONDS = 9.0  # the map scene's length (npm run timeline)
FPS = 30
N = round(SECONDS * FPS)


def srgb(h, a=1.0):
    h = h.lstrip("#")
    c = [int(h[i : i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return (*lin, a)


NAVY, NAVY_MID, MINT = srgb("#0a0e2a"), srgb("#12184f"), srgb("#8fe0ac")

# --- facts from the website ---------------------------------------------------
map_src = (WEBSITE / "src/lib/indiaMap.ts").read_text()
path = re.search(r'INDIA_PATH =\s*"([^"]+)"', map_src).group(1)
data = (WEBSITE / "src/data.ts").read_text()
ports_src = re.search(r"export const PORTS[^=]*=\s*\[(.*?)\];", data, re.S).group(1)
PORTS = [
    {"name": m.group(1), "x": float(m.group(2)), "y": float(m.group(3))}
    for m in re.finditer(r'name: "([^"]+)".*?x: ([\d.]+), y: ([\d.]+)', ports_src)
]


def to_world(sx, sy):
    """SVG viewBox 0 0 800 900 -> Blender units, north = +Y."""
    return ((sx - 400) / 100, (450 - sy) / 100)


# --- scene --------------------------------------------------------------------
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = "CYCLES"
scene.cycles.device = "CPU"
scene.cycles.samples = 20
scene.cycles.use_denoising = True
scene.cycles.denoiser = "OPENIMAGEDENOISE"
scene.cycles.max_bounces = 4
scene.render.resolution_x, scene.render.resolution_y = 1920, 1080
scene.render.resolution_percentage = round(SCALE * 100)
scene.render.fps = FPS
scene.frame_start, scene.frame_end = 0, N - 1
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGB"
scene.view_settings.view_transform = "AgX"
scene.view_settings.look = "AgX - Medium High Contrast"
scene.render.film_transparent = False

world = bpy.data.worlds.new("World")
scene.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = NAVY
world.node_tree.nodes["Background"].inputs[1].default_value = 1.0


def material(name, build):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    build(m.node_tree)
    return m


# land: matte slate, a touch lighter than the sea
def land_nodes(t):
    b = t.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = srgb("#39406a")
    b.inputs["Roughness"].default_value = 0.72


# coastline: the mint stroke of the old 2D map, as a thin lit edge
def coast_nodes(t):
    b = t.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = MINT
    b.inputs["Emission Color"].default_value = MINT
    b.inputs["Emission Strength"].default_value = 2.2


# sea: dark, satin, with a slow swell (4D noise, W animated) so it never
# sits still
def sea_nodes(t):
    n, links = t.nodes, t.links
    b = n["Principled BSDF"]
    b.inputs["Base Color"].default_value = srgb("#0b1033")
    b.inputs["Roughness"].default_value = 0.36
    noise = n.new("ShaderNodeTexNoise")
    noise.noise_dimensions = "4D"
    noise.inputs["Scale"].default_value = 3.0
    noise.inputs["Detail"].default_value = 4.0
    coord = n.new("ShaderNodeTexCoord")
    links.new(coord.outputs["Object"], noise.inputs["Vector"])
    bump = n.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.12
    bump.inputs["Distance"].default_value = 0.02
    links.new(noise.outputs["Fac"], bump.inputs["Height"])
    links.new(bump.outputs["Normal"], b.inputs["Normal"])
    w = noise.inputs["W"]
    w.default_value = 0.0
    w.keyframe_insert("default_value", frame=0)
    w.default_value = 0.9
    w.keyframe_insert("default_value", frame=N)
    for fc in t.animation_data.action.fcurves:
        for k in fc.keyframe_points:
            k.interpolation = "LINEAR"


LAND, COAST, SEA = material("Land", land_nodes), material("Coast", coast_nodes), material("Sea", sea_nodes)

# polygons from the SVG path (absolute M/L/Z only); drop degenerate dots
polys = []
for sub in re.findall(r"M[^M]+", path):
    pts = [tuple(map(float, p.split(","))) for p in re.findall(r"[\d.]+,[\d.]+", sub)]
    uniq = {(round(x, 2), round(y, 2)) for x, y in pts}
    if len(uniq) >= 3:
        polys.append([to_world(x, y) for x, y in pts])

H = 0.05  # land height
land_curve = bpy.data.curves.new("India", "CURVE")
land_curve.dimensions = "2D"
land_curve.fill_mode = "BOTH"
land_curve.extrude = H / 2
land_curve.bevel_depth = 0.012
land_curve.bevel_resolution = 2
coast_curve = bpy.data.curves.new("Coast", "CURVE")
coast_curve.dimensions = "3D"
coast_curve.bevel_depth = 0.007
for poly in polys:
    for cu in (land_curve, coast_curve):
        s = cu.splines.new("POLY")
        s.points.add(len(poly) - 1)
        for p, (x, y) in zip(s.points, poly):
            p.co = (x, y, 0, 1)
        s.use_cyclic_u = True
land = bpy.data.objects.new("India", land_curve)
land.location.z = H / 2
land.data.materials.append(LAND)
coast = bpy.data.objects.new("Coast", coast_curve)
coast.location.z = H + 0.012
coast.data.materials.append(COAST)
bpy.ops.mesh.primitive_plane_add(size=80, location=(0, 0, 0.004))
sea = bpy.context.active_object
sea.data.materials.append(SEA)
for o in (land, coast):
    scene.collection.objects.link(o)

# light: a low sun from the north-east, behind the land as the camera sees
# it - it rims the coast and lays a soft sheen across the Bay of Bengal
sun_data = bpy.data.lights.new("Sun", "SUN")
sun_data.energy = 3.0
sun_data.angle = math.radians(8)
sun_data.color = (0.82, 0.9, 1.0)
sun = bpy.data.objects.new("Sun", sun_data)
sun.rotation_euler = (math.radians(74), 0, math.radians(150))
scene.collection.objects.link(sun)
fill_data = bpy.data.lights.new("Fill", "SUN")
fill_data.energy = 0.35
fill_data.color = (0.6, 0.7, 1.0)
fill = bpy.data.objects.new("Fill", fill_data)
fill.rotation_euler = (math.radians(35), 0, math.radians(-120))
scene.collection.objects.link(fill)

# --- camera: one slow, continuous glide over the peninsula --------------------
# The client asked for no zoom on the map, so the camera never pushes in: it
# keeps its distance and drifts sideways around the coast (parallax only).
# Everything the voice names lies in the south (Chennai, Kakinada, Port Blair
# and the other ports), so the move settles on the peninsula. Lens shift keeps
# the land in the right half of the frame, clear of the headline on the left.
TARGET = Vector((0.6, -2.4, 0))
cam_data = bpy.data.cameras.new("Cam")
cam_data.lens = 40
cam_data.sensor_width = 36
cam_data.shift_x = -0.21
cam_data.clip_end = 200
cam_data.dof.use_dof = True
cam_data.dof.aperture_fstop = 11
cam = bpy.data.objects.new("Cam", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam
aim = bpy.data.objects.new("Aim", None)
aim.location = TARGET
scene.collection.objects.link(aim)
cam_data.dof.focus_object = aim
track = cam.constraints.new("TRACK_TO")
track.target = aim
track.track_axis, track.up_axis = "TRACK_NEGATIVE_Z", "UP_Y"


def orbit(dist, elev, azim):
    e, a = math.radians(elev), math.radians(azim)
    return TARGET + Vector((dist * math.cos(e) * math.cos(a), dist * math.cos(e) * math.sin(a), dist * math.sin(e)))


# (frame, distance, elevation, azimuth measured from +X, south = -90)
for f, d, el, az in ((0, 10.5, 50, -106), (N - 1, 10.5, 44, -91)):
    cam.location = orbit(d, el, az)
    cam.keyframe_insert("location", frame=f)
for fc in cam.animation_data.action.fcurves:
    for k in fc.keyframe_points:
        # long, gentle ease: already moving at frame 0 (it is cut into),
        # settling at the end without stopping dead
        k.interpolation = "BEZIER"
        k.handle_left_type = k.handle_right_type = "FREE"
    a, b = fc.keyframe_points
    span = b.co.x - a.co.x
    a.handle_right = (a.co.x + span * 0.2, a.co.y + (b.co.y - a.co.y) * 0.12)
    b.handle_left = (b.co.x - span * 0.45, b.co.y)

# distance haze: the north of the country fades into the navy
scene.view_layers[0].use_pass_mist = True
world.mist_settings.start = 9.0
world.mist_settings.depth = 12.0
world.mist_settings.falloff = "QUADRATIC"
scene.use_nodes = True
ct = scene.node_tree
rl = ct.nodes["Render Layers"]
comp = ct.nodes["Composite"]
mix = ct.nodes.new("CompositorNodeMixRGB")
mix.inputs[2].default_value = NAVY
ct.links.new(rl.outputs["Mist"], mix.inputs[0])
ct.links.new(rl.outputs["Image"], mix.inputs[1])
ct.links.new(mix.outputs[0], comp.inputs["Image"])

# --- tracking: where each port is on screen, every frame ----------------------
track_out = {"fps": FPS, "frames": N, "ports": {}}
for p in PORTS:
    x, y = to_world(p["x"] * 8, p["y"] * 9)
    co = Vector((x, y, H + 0.012))
    pts = []
    for f in range(N):
        scene.frame_set(f)
        v = world_to_camera_view(scene, cam, co)
        pts.append([round(v.x * 100, 3), round((1 - v.y) * 100, 3)])
    track_out["ports"][p["name"]] = pts
(ROOT / "src/map3d-track.json").write_text(json.dumps(track_out, separators=(",", ":")) + "\n")
print("track written", len(PORTS), "ports")

# --- render -------------------------------------------------------------------
out = ROOT / "out/map3d"
out.mkdir(parents=True, exist_ok=True)
a, b = (map(int, FRAMES.split("-")) if FRAMES else (0, N - 1))
for f in range(a, b + 1):
    scene.frame_set(f)
    scene.render.filepath = str(out / f"{f:04d}.png")
    bpy.ops.render.render(write_still=True)
    print(f"frame {f}/{N - 1}", flush=True)
