# Festival Night replacement artwork

These batches are delivered assets for review and later installation into the Stage 1 renderer. Adding these files does not change the active campaign textures or gameplay.

- `middle-layer-v2/stage1_mid_v2.png`: 5120 x 720 connected Garden Quarter middle layer. Building baseline at y=399; road area from y=400 remains transparent.
- `fireworks-alley-v2/stage1_alley_a.png` through `stage1_alley_d.png`: four connected 1280 x 400 alley backdrop panels, baseline y=399.
- `road-decals-v1/stage1_decal_*.png`: ten separate transparent road overlays at their requested native dimensions. `manifest.json` records dimensions and atlas regions; `stage1_road_decals_sheet.png` contains the decals without labels.

Each folder includes previews and preserved built-in Imagegen sources/prompts. ZIP handoffs are included for the alley and decal batches. Export scripts use nearest-neighbor sampling and binary transparency. Render PNG assets with image smoothing disabled.
