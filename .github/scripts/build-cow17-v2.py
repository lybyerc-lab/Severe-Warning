import json, math, struct, os
import numpy as np
import trimesh
from trimesh.exchange import gltf

OUT='assets/models/cow-17.glb'
TARGET=np.array([3.40,4.40,6.16], dtype=float)
WHITE=(232,229,218,255); CREAM=(222,213,190,255); BLACK=(31,35,35,255); DARK=(22,25,25,255); PINK=(206,132,139,255); HOOF=(52,45,39,255); EYE=(12,15,15,255)
parts=[]
def colorize(m,rgba): m.visual.vertex_colors=np.tile(np.array(rgba,dtype=np.uint8),(len(m.vertices),1)); return m
def ellipsoid(center,radii,color,subdivisions=1,rot=None):
 m=trimesh.creation.icosphere(subdivisions=subdivisions,radius=1.0); m.apply_scale(radii)
 if rot is not None: m.apply_transform(rot)
 m.apply_translation(center); colorize(m,color); parts.append(m); return m
def box(center,extents,color,rot=None):
 m=trimesh.creation.box(extents=extents)
 if rot is not None: m.apply_transform(rot)
 m.apply_translation(center); colorize(m,color); parts.append(m); return m
def cyl_between(a,b,radius,color,sections=8):
 a=np.array(a,float); b=np.array(b,float); v=b-a; h=np.linalg.norm(v)
 if h<=1e-8: return None
 m=trimesh.creation.cylinder(radius=radius,height=h,sections=sections); T=trimesh.geometry.align_vectors([0,0,1],v/h)
 if T is not None: m.apply_transform(T)
 m.apply_translation((a+b)/2); colorize(m,color); parts.append(m); return m
def cone_between(a,b,r1,r2,color,sections=8):
 a=np.array(a,float); b=np.array(b,float); v=b-a; h=np.linalg.norm(v); ang=np.linspace(0,2*np.pi,sections,endpoint=False); verts=[]
 for z,r in [(-h/2,r1),(h/2,r2)]:
  for t in ang: verts.append([r*np.cos(t),r*np.sin(t),z])
 faces=[]
 for i in range(sections):
  j=(i+1)%sections; faces += [[i,j,sections+j],[i,sections+j,sections+i]]
 cb=len(verts); verts.append([0,0,-h/2]); ct=len(verts); verts.append([0,0,h/2])
 for i in range(sections):
  j=(i+1)%sections; faces.append([cb,j,i]); faces.append([ct,sections+i,sections+j])
 m=trimesh.Trimesh(np.array(verts,float),np.array(faces,int),process=False); T=trimesh.geometry.align_vectors([0,0,1],v/h)
 if T is not None: m.apply_transform(T)
 m.apply_translation((a+b)/2); colorize(m,color); parts.append(m); return m
ellipsoid((0,2.55,0.38),(1.30,1.12,2.02),WHITE,2); ellipsoid((0,2.73,-0.95),(1.20,1.14,1.02),WHITE,1); ellipsoid((0,2.48,1.63),(1.18,1.02,0.88),WHITE,1)
neck_rot=trimesh.transformations.rotation_matrix(math.radians(-18),[1,0,0]); ellipsoid((0,3.12,-1.55),(0.70,0.85,0.82),WHITE,1,neck_rot); ellipsoid((0,3.58,-2.17),(0.73,0.72,0.76),WHITE,1); ellipsoid((0,3.42,-2.72),(0.66,0.48,0.47),PINK,1); ellipsoid((0,3.37,-2.36),(0.58,0.40,0.62),WHITE,1)
for sx in (-1,1):
 ear_rot=trimesh.transformations.rotation_matrix(math.radians(18*sx),[0,0,1]); ellipsoid((0.80*sx,3.86,-2.13),(0.43,0.16,0.27),BLACK,1,ear_rot); cone_between((0.43*sx,4.02,-2.13),(0.78*sx,4.30,-2.05),0.11,0.025,CREAM,7)
for sx in (-1,1): ellipsoid((0.57*sx,3.72,-2.65),(0.10,0.10,0.08),EYE,1); ellipsoid((0.31*sx,3.45,-3.13),(0.085,0.055,0.045),DARK,1)
for x,z,r in [(-0.78,-0.92,0.17),(0.78,-0.92,0.17),(-0.76,1.42,0.19),(0.76,1.42,0.19)]:
 out=0.08 if x>0 else -0.08; cyl_between((x,2.15,z),(x+out,1.05,z+0.03),r,WHITE,8); cyl_between((x+out,1.06,z+0.03),(x+out*1.25,0.34,z-0.02),r*0.72,WHITE,8); box((x+out*1.25,0.17,z-0.10),(0.34,0.34,0.48),HOOF)
ellipsoid((0,1.62,1.25),(0.58,0.40,0.60),PINK,1)
for x in (-0.27,0.27):
 for z in (1.02,1.40): cyl_between((x,1.40,z),(x,1.06,z),0.075,PINK,7)
cyl_between((0,2.95,2.00),(0.08,2.42,2.48),0.10,WHITE,7); cyl_between((0.08,2.42,2.48),(0.12,1.53,2.65),0.075,WHITE,7); ellipsoid((0.12,1.39,2.69),(0.22,0.28,0.22),BLACK,1); ellipsoid((0,2.34,-1.70),(0.54,0.48,0.50),CREAM,1)
patches=[((-1.18,2.80,0.25),(0.16,0.55,0.72),(-8,0,5)),((1.18,2.55,-0.30),(0.16,0.48,0.84),(12,0,-5)),((-1.02,2.50,1.40),(0.17,0.52,0.48),(8,0,-10)),((0.92,2.88,1.18),(0.19,0.42,0.54),(-10,0,8)),((-0.88,3.20,-1.26),(0.16,0.37,0.44),(0,0,12)),((0.58,3.72,-2.08),(0.17,0.35,0.38),(0,0,-10)),((-0.48,3.65,-2.24),(0.17,0.29,0.31),(0,0,15))]
for c,r,deg in patches:
 rx,ry,rz=[math.radians(v) for v in deg]; ellipsoid(c,r,BLACK,1,trimesh.transformations.euler_matrix(rx,ry,rz,'sxyz'))
ellipsoid((0.20,3.60,0.72),(0.60,0.13,0.72),BLACK,1)
merged=trimesh.util.concatenate(parts); merged.remove_unreferenced_vertices(); mins,maxs=merged.bounds; merged.vertices *= TARGET/(maxs-mins); mins,maxs=merged.bounds; merged.apply_translation([-(mins[0]+maxs[0])/2,-mins[1],-(mins[2]+maxs[2])/2]); merged.vertices[np.abs(merged.vertices)<1e-8]=0.0; merged.metadata['name']='cow-17'; _=merged.vertex_normals
scene=trimesh.Scene(); scene.add_geometry(merged,node_name='cow-17',geom_name='cow-17'); blob=gltf.export_glb(scene,include_normals=True,unitize_normals=True)
def patch_glb_material(blob):
 magic,version,total=struct.unpack_from('<4sII',blob,0); assert magic==b'glTF' and version==2; off=12; jlen,jtype=struct.unpack_from('<I4s',blob,off); off+=8; assert jtype==b'JSON'; j=json.loads(blob[off:off+jlen].decode('utf-8').rstrip(' \t\r\n\x00')); nextoff=off+jlen; blen,btype=struct.unpack_from('<I4s',blob,nextoff); nextoff+=8; bchunk=blob[nextoff:nextoff+blen]; j['asset']['generator']='SWW authored low-poly actor pipeline / trimesh 4.11.1'; j['materials']=[{'name':'SWW_VertexColor_Flat','pbrMetallicRoughness':{'baseColorFactor':[1.0,1.0,1.0,1.0],'metallicFactor':0.0,'roughnessFactor':0.8}}]; assert len(j.get('meshes',[]))==1 and len(j['meshes'][0]['primitives'])==1; j['meshes'][0]['name']='cow-17'; j['meshes'][0]['extras']={'name':'cow-17'}; j['meshes'][0]['primitives'][0]['material']=0
 if len(j.get('nodes',[]))>=2: j['nodes'][0]['name']='world'; j['nodes'][1]['name']='cow-17'
 raw=json.dumps(j,separators=(',',':')).encode('utf-8'); raw+=b' '*((-len(raw))%4); bchunk+=b'\x00'*((-len(bchunk))%4); out=bytearray(); out+=struct.pack('<4sII',b'glTF',2,12+8+len(raw)+8+len(bchunk)); out+=struct.pack('<I4s',len(raw),b'JSON')+raw; out+=struct.pack('<I4s',len(bchunk),b'BIN\x00')+bchunk; return bytes(out)
blob=patch_glb_material(blob); open(OUT,'wb').write(blob)
print(len(blob))