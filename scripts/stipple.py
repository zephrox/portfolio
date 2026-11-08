import sys, numpy as np, base64, json
from PIL import Image, ImageFilter, ImageOps, ImageDraw
from scipy.spatial import cKDTree
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('L')
im = im.crop((112, 10, 308, 262))           # head + shoulders
W, H = 196*2, 252*2
im = im.resize((W, H), Image.LANCZOS)
im = ImageOps.autocontrast(im, cutoff=1)
a = np.asarray(im, dtype=np.float32) / 255.0
dark = 1.0 - a
# remove light wall: anything lighter than ~threshold gets no weight
bg = np.clip((dark - 0.18) / 0.82, 0, 1)
edges = np.asarray(im.filter(ImageFilter.FIND_EDGES), dtype=np.float32) / 255.0
edges = np.asarray(Image.fromarray((edges*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2)), dtype=np.float32)/255.0
w = bg ** 3.0 + 0.35 * edges * (bg > 0.08)
w = np.clip(w, 0, None)
# fade out the bottom so shoulders dissolve
yy = np.linspace(0, 1, H)[:, None]
w *= np.where(yy < 0.68, 1.0, np.clip((1 - yy) / 0.32, 0, 1) ** 1.6)
w[(yy[:,0] > 0.68)[:,None].repeat(W,1)] *= 0.55
P = int(sys.argv[3]) if len(sys.argv) > 3 else 9000  # point count; more points suit smaller dots
rng = np.random.default_rng(7)
flat = w.ravel() / w.sum()
idx = rng.choice(flat.size, P, replace=False, p=flat)
pts = np.stack([idx % W, idx // W], 1).astype(np.float64) + rng.random((P, 2))
ys, xs = np.mgrid[0:H, 0:W]
pix = np.stack([xs.ravel() + 0.5, ys.ravel() + 0.5], 1)
wf = w.ravel()
mask = wf > 1e-4
pix, wf = pix[mask], wf[mask]
for it in range(40):
    _, lab = cKDTree(pts).query(pix)
    sw = np.bincount(lab, wf, P)
    sx = np.bincount(lab, wf * pix[:, 0], P)
    sy = np.bincount(lab, wf * pix[:, 1], P)
    ok = sw > 0
    pts[ok, 0] = sx[ok] / sw[ok]
    pts[ok, 1] = sy[ok] / sw[ok]
# tone per point = local darkness (for alpha)
xi = np.clip(pts[:, 0].astype(int), 0, W - 1); yi = np.clip(pts[:, 1].astype(int), 0, H - 1)
tone = np.clip(0.45 + 0.55 * dark[yi, xi], 0, 1)
# pack: x,y as uint16 over [0,1], tone uint8
qx = np.round(pts[:, 0] / W * 65535).astype(np.uint16)
qy = np.round(pts[:, 1] / H * 65535).astype(np.uint16)
qt = np.round(tone * 255).astype(np.uint8)
buf = bytearray()
for i in range(P):
    buf += int(qx[i]).to_bytes(2, 'little') + int(qy[i]).to_bytes(2, 'little') + bytes([qt[i]])
b64 = base64.b64encode(bytes(buf)).decode()
open(out, 'w').write(json.dumps({'aspect': W / H, 'n': P, 'b64': b64}))
# preview
pv = Image.new('RGB', (W, H), (242, 213, 126))
dr = ImageDraw.Draw(pv)
for (x, y), t in zip(pts, tone):
    r = 1.6
    c = int(26 + (1 - t) * 120)
    dr.ellipse((x - r, y - r, x + r, y + r), fill=(c, c, c))
pv.save(out.replace('.json', '_preview.png'))
print(len(b64), W / H)
