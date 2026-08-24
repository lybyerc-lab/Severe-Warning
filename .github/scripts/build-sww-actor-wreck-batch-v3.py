import json, math, os, struct
from pathlib import Path
import numpy as np
import trimesh
from trimesh.exchange import gltf

OUT = Path('assets/models')
OUT.mkdir(parents=True, exist_ok=True)
SRC = Path('/tmp/sww-batch-v3-source')
SRC.mkdir(parents=True, exist_ok=True)
import base64, gzip
for enc in Path('.github/sww-batch-v3-src').glob('*.glb.gz.b64'):
    raw = gzip.decompress(base64.b64decode(enc.read_text().strip()))
    (SRC / enc.name.removesuffix('.gz.b64')).write_bytes(raw)

MAT = {
    'cream': (224,218,194,255),
    'barn_red': (144,58,49,255),
    'dark_red': (104,37,34,255),
    'charcoal': (58,65,69,255),
    'dark': (41,56,61,255),
    'metal': (162,171,168,255),
    'metal_mid': (128,142,145,255),
    'metal_dark': (76,88,91,255),
    'blue': (49,92,128,255),
    'rust': (159,56,45,255),
    'silo_light': (181,187,180,255),
    'silo_mid': (150,160,158,255),
    'wood': (126,94,66,255),
    'wood_dark': (76,59,46,255),
    'grass': (92,126,91,255),
}

def cv(mesh, rgba):
    mesh.visual = trimesh.visual.ColorVisuals(mesh=mesh, vertex_colors=np.tile(np.array(rgba,dtype=np.uint8),(len(mesh.vertices),1)))
    return mesh

def box(center, extents, color, rot=None):
    m=trimesh.creation.box(extents=extents)
    if rot is not None: m.apply_transform(rot)
    m.apply_translation(center)
    return cv(m,color)

def ellipsoid(center, radii, color, subdivisions=1, rot=None):
    m=trimesh.creation.icosphere(subdivisions=subdivisions, radius=1.0)
    m.apply_scale(radii)
    if rot is not None: m.apply_transform(rot)
    m.apply_translation(center)
    return cv(m,color)

def cyl_between(a,b,radius,color,sections=8):
    a=np.array(a,float); b=np.array(b,float); v=b-a; h=np.linalg.norm(v)
    m=trimesh.creation.cylinder(radius=radius,height=h,sections=sections)
    T=trimesh.geometry.align_vectors([0,0,1],v/h)
    if T is not None: m.apply_transform(T)
    m.apply_translation((a+b)/2)
    return cv(m,color)

def cone(center, radius, height, color, sections=16, rot=None):
    m=trimesh.creation.cone(radius=radius,height=height,sections=sections)
    m.apply_translation([0,0,-height/2])
    if rot is not None: m.apply_transform(rot)
    m.apply_translation(center)
    return cv(m,color)

def torus(center, major, minor, color, major_sections=20, minor_sections=6, rot=None):
    verts=[]; faces=[]
    for i in range(major_sections):
        u=2*math.pi*i/major_sections
        cu,su=math.cos(u),math.sin(u)
        for j in range(minor_sections):
            v=2*math.pi*j/minor_sections
            cvv,sv=math.cos(v),math.sin(v)
            r=major+minor*cvv
            verts.append([r*cu,r*su,minor*sv])
    for i in range(major_sections):
        ni=(i+1)%major_sections
        for j in range(minor_sections):
            nj=(j+1)%minor_sections
            a=i*minor_sections+j; b=ni*minor_sections+j; c=ni*minor_sections+nj; d=i*minor_sections+nj
            faces += [[a,b,c],[a,c,d]]
    m=trimesh.Trimesh(np.array(verts,float),np.array(faces,int),process=False)
    if rot is not None: m.apply_transform(rot)
    m.apply_translation(center)
    return cv(m,color)

def merge(parts):
    m=trimesh.util.concatenate(parts)
    m.remove_unreferenced_vertices()
    if not isinstance(m.visual, trimesh.visual.ColorVisuals):
        m.visual = trimesh.visual.ColorVisuals(mesh=m, vertex_colors=np.tile(np.array((200,200,200,255),dtype=np.uint8),(len(m.vertices),1)))
    return m

def normalize_bounds(m, dims):
    dims=np.array(dims,float)
    lo,hi=m.bounds; ext=hi-lo
    m.vertices *= dims/ext
    lo,hi=m.bounds
    m.apply_translation([-(lo[0]+hi[0])/2, -lo[1], -(lo[2]+hi[2])/2])
    m.vertices[np.abs(m.vertices)<1e-9]=0.0
    return m

def flatten_source(path, target_dims):
    s=trimesh.load(path, force='scene')
    parts=[]
    for node in s.graph.nodes_geometry:
        T,gname=s.graph[node]
        g=s.geometry[gname].copy(); g.apply_transform(T)
        mat=getattr(g.visual,'material',None)
        color=np.array(getattr(mat,'main_color',[200,200,200,255]),dtype=np.uint8)
        g.visual=trimesh.visual.ColorVisuals(mesh=g, vertex_colors=np.tile(color,(len(g.vertices),1)))
        parts.append(g)
    return normalize_bounds(merge(parts), target_dims)

def patch_glb(blob, name):
    magic,version,total=struct.unpack_from('<4sII',blob,0); assert magic==b'glTF' and version==2
    off=12; jlen,jtype=struct.unpack_from('<I4s',blob,off); off+=8; assert jtype==b'JSON'
    j=json.loads(blob[off:off+jlen].decode('utf-8').rstrip(' \t\r\n\x00'))
    nextoff=off+jlen; blen,btype=struct.unpack_from('<I4s',blob,nextoff); nextoff+=8
    bchunk=blob[nextoff:nextoff+blen]
    j['asset']['generator']='SWW low-poly actor pipeline / trimesh 4.11.1'
    j['materials']=[{'name':'SWW_VertexColor_Flat','pbrMetallicRoughness':{'baseColorFactor':[1.0,1.0,1.0,1.0],'metallicFactor':0.0,'roughnessFactor':0.8}}]
    assert len(j.get('meshes',[]))==1 and len(j['meshes'][0]['primitives'])==1
    j['meshes'][0]['name']=name; j['meshes'][0]['extras']={'name':name}
    j['meshes'][0]['primitives'][0]['material']=0
    if len(j.get('nodes',[]))>=2:
        j['nodes'][0]['name']='world'; j['nodes'][1]['name']=name
    raw=json.dumps(j,separators=(',',':')).encode('utf-8'); raw+=b' '*((-len(raw))%4)
    bchunk+=b'\x00'*((-len(bchunk))%4)
    out=bytearray(); out+=struct.pack('<4sII',b'glTF',2,12+8+len(raw)+8+len(bchunk)); out+=struct.pack('<I4s',len(raw),b'JSON')+raw; out+=struct.pack('<I4s',len(bchunk),b'BIN\x00')+bchunk
    return bytes(out)

def export(m, name):
    m.metadata['name']=name
    _=m.vertex_normals
    scene=trimesh.Scene(); scene.add_geometry(m,node_name=name,geom_name=name)
    blob=gltf.export_glb(scene,include_normals=True,unitize_normals=True)
    blob=patch_glb(blob,name)
    p=OUT/f'{name}.glb'; p.write_bytes(blob)
    return p

parts=[]
R=trimesh.transformations.euler_matrix(math.radians(12),math.radians(-8),math.radians(18),'sxyz')
parts.append(ellipsoid((0.15,3.15,0.35),(4.5,2.55,4.05),MAT['metal_mid'],2,R))
parts.append(ellipsoid((-2.65,3.25,-1.0),(1.25,0.45,1.7),MAT['metal_dark'],1,trimesh.transformations.euler_matrix(0,0,math.radians(-20),'sxyz')))
parts.append(torus((0.4,0.7,-0.35),4.25,0.12,MAT['metal_dark'],24,6,trimesh.transformations.euler_matrix(math.radians(78),0,math.radians(8),'sxyz')))
leg_tops=[(-1.0,5.9,-0.6),(0.9,5.1,-0.5),(-0.7,4.6,0.7),(0.8,5.6,0.9)]
leg_feet=[(-4.5,0.1,-4.45),(4.5,0.1,-4.45),(-4.5,0.1,4.45),(4.5,0.1,4.45)]
for a,b in zip(leg_tops,leg_feet): parts.append(cyl_between(a,b,0.22,MAT['metal_dark'],8))
for a,b in [((-4.0,0.55,-4.0),(3.2,2.0,-1.5)),((4.1,0.45,-4.0),(-2.4,1.8,-0.4)),((-4.0,0.45,4.0),(2.0,1.6,1.1)),((4.0,0.45,4.0),(-2.2,1.7,0.9))]: parts.append(cyl_between(a,b,0.10,MAT['charcoal'],6))
for z in [-1.5,-0.9,-0.3,0.3,0.9]: parts.append(cyl_between((-3.3,0.35,z),(-1.9,0.35,z+0.1),0.055,MAT['metal'],6))
parts += [box((2.9,1.05,-2.7),(1.8,0.18,1.1),MAT['blue'],trimesh.transformations.euler_matrix(0,math.radians(18),math.radians(-8),'sxyz')), box((-2.2,0.85,2.8),(1.5,0.16,0.9),MAT['rust'],trimesh.transformations.euler_matrix(0,math.radians(-22),math.radians(12),'sxyz'))]
wt=normalize_bounds(merge(parts),(10.4,9.30,10.4)); export(wt,'water-tower-wreck')

parts=[]
R=trimesh.transformations.euler_matrix(0,math.radians(88),math.radians(10),'sxyz')
barrel=trimesh.creation.cylinder(radius=3.55,height=5.8,sections=20); barrel.apply_translation([0,0,-2.9]); barrel.apply_transform(R); barrel.apply_translation([0.3,2.1,0.3]); cv(barrel,MAT['silo_light']); parts.append(barrel)
for zoff in (-2.1,-0.7,0.7,2.1):
    v=R[:3,:3] @ np.array([0.0,0.0,zoff]); c=np.array([0.3,2.1,0.3])+v
    parts.append(torus(tuple(c),3.58,0.075,MAT['silo_mid'],16,4,R))
Rroof=trimesh.transformations.euler_matrix(math.radians(8),math.radians(82),math.radians(-18),'sxyz')
parts.append(cone((-1.2,1.35,-2.0),3.7,2.3,MAT['silo_mid'],20,Rroof))
panels=[((-3.1,1.1,1.9),(2.6,0.22,2.0),(-18,8,24)),((2.9,0.8,2.2),(2.4,0.18,1.8),(8,-6,-20)),((2.5,1.25,-2.6),(2.1,0.20,1.7),(14,5,32)),((-2.5,0.7,-3.1),(2.0,0.16,1.4),(-10,4,-28))]
for c,e,deg in panels:
    rx,ry,rz=[math.radians(v) for v in deg]; parts.append(box(c,e,MAT['metal_mid'],trimesh.transformations.euler_matrix(rx,ry,rz,'sxyz')))
parts.append(ellipsoid((0.8,0.48,1.0),(2.4,0.5,1.8),(118,98,63,255),2))
parts.append(box((-1.0,0.45,3.0),(1.0,0.18,0.8),MAT['metal_dark'],trimesh.transformations.euler_matrix(0,math.radians(10),math.radians(16),'sxyz')))
for z in [-1.8,-1.2,-0.6,0.0,0.6]: parts.append(cyl_between((3.1,0.28,z),(4.0,0.28,z+0.12),0.05,MAT['metal_dark'],6))
parts.append(cyl_between((-3.8,0.55,2.4),(-0.7,1.15,0.2),0.18,MAT['charcoal'],8))
parts.append(box((3.0,0.95,-0.7),(1.2,0.4,0.75),MAT['blue'],trimesh.transformations.euler_matrix(0,math.radians(-8),math.radians(10),'sxyz')))
gs=normalize_bounds(merge(parts),(8.86,5.75,8.934978485107422)); export(gs,'grain-silo-wreck')

actors=[
    ('hart_barn.glb','hart-barn-v2',(24.7,19.3,19.9)),
    ('hart_farmhouse.glb','hart-farmhouse-v2',(9.5,17.7,11.5)),
    ('farm_windmill.glb','farm-windmill-v2',(9.6,19.8,10.5)),
]
for src,name,dims in actors:
    m=flatten_source(SRC/src,dims)
    export(m,name)

print('built', [p.name for p in OUT.glob('*.glb')])
