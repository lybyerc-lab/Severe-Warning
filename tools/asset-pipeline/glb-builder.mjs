import { writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Lightweight, zero-dependency glTF 2.0 Binary (.glb) Mesh Builder
 * Supports box, cylinder, cone, and compound meshes with PBR materials.
 */
export class GlbBuilder {
  constructor() {
    this.positions = [];
    this.normals = [];
    this.colors = [];
    this.indices = [];
    this.materials = [];
    this.primitives = [];
  }

  addBox(center, size, colorHex, rotation = [0, 0, 0]) {
    const [cx, cy, cz] = center;
    const [sx, sy, sz] = [size[0] / 2, size[1] / 2, size[2] / 2];
    const col = parseHexColor(colorHex);

    // 6 faces of a box
    const faces = [
      { normal: [0, 0, 1], corners: [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]] }, // Front
      { normal: [0, 0, -1], corners: [[1, -1, -1], [-1, -1, -1], [-1, 1, -1], [1, 1, -1]] }, // Back
      { normal: [0, 1, 0], corners: [[-1, 1, 1], [1, 1, 1], [1, 1, -1], [-1, 1, -1]] }, // Top
      { normal: [0, -1, 0], corners: [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1]] }, // Bottom
      { normal: [1, 0, 0], corners: [[1, -1, 1], [1, -1, -1], [1, 1, -1], [1, 1, 1]] }, // Right
      { normal: [-1, 0, 0], corners: [[-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [-1, 1, -1]] }, // Left
    ];

    const startIndex = this.positions.length / 3;

    faces.forEach((face, fIdx) => {
      const vOffset = (this.positions.length / 3);
      const [nx, ny, nz] = rotateVector(face.normal, rotation);

      face.corners.forEach(c => {
        const local = [c[0] * sx, c[1] * sy, c[2] * sz];
        const rotLocal = rotateVector(local, rotation);
        this.positions.push(cx + rotLocal[0], cy + rotLocal[1], cz + rotLocal[2]);
        this.normals.push(nx, ny, nz);
        this.colors.push(col[0], col[1], col[2], 1.0);
      });

      this.indices.push(vOffset, vOffset + 1, vOffset + 2);
      this.indices.push(vOffset, vOffset + 2, vOffset + 3);
    });
  }

  addCylinder(center, radiusTop, radiusBottom, height, segments, colorHex, rotation = [0, 0, 0], options = {}) {
    const [cx, cy, cz] = center;
    const halfH = height / 2;
    const col = parseHexColor(colorHex);
    const startIndex = this.positions.length / 3;

    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const cos = Math.cos(theta);
      const sin = Math.sin(theta);

      // Bottom vertex
      const pBot = rotateVector([cos * radiusBottom, -halfH, sin * radiusBottom], rotation);
      this.positions.push(cx + pBot[0], cy + pBot[1], cz + pBot[2]);
      const nBot = rotateVector([cos, 0, sin], rotation);
      this.normals.push(nBot[0], nBot[1], nBot[2]);
      this.colors.push(col[0], col[1], col[2], 1.0);

      // Top vertex
      const pTop = rotateVector([cos * radiusTop, halfH, sin * radiusTop], rotation);
      this.positions.push(cx + pTop[0], cy + pTop[1], cz + pTop[2]);
      this.normals.push(nBot[0], nBot[1], nBot[2]);
      this.colors.push(col[0], col[1], col[2], 1.0);
    }

    for (let i = 0; i < segments; i++) {
      const idx = startIndex + i * 2;
      this.indices.push(idx, idx + 1, idx + 2);
      this.indices.push(idx + 1, idx + 3, idx + 2);
    }

    // Top cap
    if (radiusTop > 0 && options.topCap !== false) {
      const topCenterIdx = this.positions.length / 3;
      const pCap = rotateVector([0, halfH, 0], rotation);
      const nCap = rotateVector([0, 1, 0], rotation);
      this.positions.push(cx + pCap[0], cy + pCap[1], cz + pCap[2]);
      this.normals.push(nCap[0], nCap[1], nCap[2]);
      this.colors.push(col[0], col[1], col[2], 1.0);

      for (let i = 0; i < segments; i++) {
        const idx = startIndex + i * 2 + 1;
        const nextIdx = startIndex + ((i + 1) % segments) * 2 + 1;
        this.indices.push(topCenterIdx, nextIdx, idx);
      }
    }

    // Bottom cap
    if (radiusBottom > 0 && options.bottomCap !== false) {
      const botCenterIdx = this.positions.length / 3;
      const pCap = rotateVector([0, -halfH, 0], rotation);
      const nCap = rotateVector([0, -1, 0], rotation);
      this.positions.push(cx + pCap[0], cy + pCap[1], cz + pCap[2]);
      this.normals.push(nCap[0], nCap[1], nCap[2]);
      this.colors.push(col[0], col[1], col[2], 1.0);

      for (let i = 0; i < segments; i++) {
        const idx = startIndex + i * 2;
        const nextIdx = startIndex + ((i + 1) % segments) * 2;
        this.indices.push(botCenterIdx, idx, nextIdx);
      }
    }
  }

  addCone(center, radius, height, segments, colorHex, rotation = [0, 0, 0], options = {}) {
    this.addCylinder(center, 0, radius, height, segments, colorHex, rotation, options);
  }

  addSphere(center, radius, arg3, arg4, arg5) {
    const segments = typeof arg3 === 'number' && typeof arg4 === 'number' ? arg3 : (typeof arg3 === 'number' ? arg3 : 10);
    const colorHex = typeof arg4 === 'string' ? arg4 : (typeof arg5 === 'string' ? arg5 : '#ffffff');
    const [cx, cy, cz] = center;
    const col = parseHexColor(colorHex);
    const startIndex = this.positions.length / 3;

    for (let lat = 0; lat <= segments; lat++) {
      const theta = (lat * Math.PI) / segments;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      for (let lon = 0; lon <= segments; lon++) {
        const phi = (lon * 2 * Math.PI) / segments;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        const x = cosPhi * sinTheta;
        const y = cosTheta;
        const z = sinPhi * sinTheta;

        this.positions.push(cx + x * radius, cy + y * radius, cz + z * radius);
        this.normals.push(x, y, z);
        this.colors.push(col[0], col[1], col[2], 1.0);
      }
    }

    for (let lat = 0; lat < segments; lat++) {
      for (let lon = 0; lon < segments; lon++) {
        const first = startIndex + (lat * (segments + 1)) + lon;
        const second = first + segments + 1;
        this.indices.push(first, first + 1, second);
        this.indices.push(second, first + 1, second + 1);
      }
    }
  }

  addTorus(center, radius, tube, radialSegments, tubularSegments, colorHex, rotation = [0, 0, 0]) {
    const [cx, cy, cz] = center;
    const col = parseHexColor(colorHex);
    const startIndex = this.positions.length / 3;

    for (let j = 0; j <= radialSegments; j++) {
      for (let i = 0; i <= tubularSegments; i++) {
        const u = (i / tubularSegments) * Math.PI * 2;
        const v = (j / radialSegments) * Math.PI * 2;

        const x = (radius + tube * Math.cos(v)) * Math.cos(u);
        const y = (radius + tube * Math.cos(v)) * Math.sin(u);
        const z = tube * Math.sin(v);

        const p = rotateVector([x, y, z], rotation);
        const n = rotateVector([Math.cos(v) * Math.cos(u), Math.cos(v) * Math.sin(u), Math.sin(v)], rotation);

        this.positions.push(cx + p[0], cy + p[1], cz + p[2]);
        this.normals.push(n[0], n[1], n[2]);
        this.colors.push(col[0], col[1], col[2], 1.0);
      }
    }

    for (let j = 1; j <= radialSegments; j++) {
      for (let i = 1; i <= tubularSegments; i++) {
        const a = startIndex + (tubularSegments + 1) * j + i - 1;
        const b = startIndex + (tubularSegments + 1) * (j - 1) + i - 1;
        const c = startIndex + (tubularSegments + 1) * (j - 1) + i;
        const d = startIndex + (tubularSegments + 1) * j + i;
        this.indices.push(a, b, d);
        this.indices.push(b, c, d);
      }
    }
  }

  addWedge(center, size, colorHex, rotation = [0, 0, 0]) {
    const [cx, cy, cz] = center;
    const [sx, sy, sz] = [size[0] / 2, size[1] / 2, size[2] / 2];
    const col = parseHexColor(colorHex);

    const addFacet = (pts, normal) => {
      const idx = this.positions.length / 3;
      const rotNorm = rotateVector(normal, rotation);
      pts.forEach(pt => {
        const rotPt = rotateVector(pt, rotation);
        this.positions.push(cx + rotPt[0], cy + rotPt[1], cz + rotPt[2]);
        this.normals.push(rotNorm[0], rotNorm[1], rotNorm[2]);
        this.colors.push(col[0], col[1], col[2], 1.0);
      });
      if (pts.length === 3) {
        this.indices.push(idx, idx + 1, idx + 2);
      } else if (pts.length === 4) {
        this.indices.push(idx, idx + 1, idx + 2);
        this.indices.push(idx, idx + 2, idx + 3);
      }
    };

    // Front triangle (+Z)
    addFacet([[-sx, -sy, sz], [sx, -sy, sz], [0, sy, sz]], [0, 0, 1]);
    // Back triangle (-Z)
    addFacet([[sx, -sy, -sz], [-sx, -sy, -sz], [0, sy, -sz]], [0, 0, -1]);
    // Bottom quad (-Y)
    addFacet([[-sx, -sy, -sz], [sx, -sy, -sz], [sx, -sy, sz], [-sx, -sy, sz]], [0, -1, 0]);
    // Left slope quad
    const leftSlopeNorm = normalizeVector([-sy, sx, 0]);
    addFacet([[-sx, -sy, sz], [0, sy, sz], [0, sy, -sz], [-sx, -sy, -sz]], leftSlopeNorm);
    // Right slope quad
    const rightSlopeNorm = normalizeVector([sy, sx, 0]);
    addFacet([[0, sy, sz], [sx, -sy, sz], [sx, -sy, -sz], [0, sy, -sz]], rightSlopeNorm);
  }

  addPyramid(center, size, colorHex, rotation = [0, 0, 0]) {
    const [cx, cy, cz] = center;
    const [sx, sy, sz] = [size[0] / 2, size[1] / 2, size[2] / 2];
    const col = parseHexColor(colorHex);

    const addFacet = (pts, normal) => {
      const idx = this.positions.length / 3;
      const rotNorm = rotateVector(normal, rotation);
      pts.forEach(pt => {
        const rotPt = rotateVector(pt, rotation);
        this.positions.push(cx + rotPt[0], cy + rotPt[1], cz + rotPt[2]);
        this.normals.push(rotNorm[0], rotNorm[1], rotNorm[2]);
        this.colors.push(col[0], col[1], col[2], 1.0);
      });
      if (pts.length === 3) {
        this.indices.push(idx, idx + 1, idx + 2);
      } else if (pts.length === 4) {
        this.indices.push(idx, idx + 1, idx + 2);
        this.indices.push(idx, idx + 2, idx + 3);
      }
    };

    // Bottom base quad (-Y)
    addFacet([[-sx, -sy, sz], [sx, -sy, sz], [sx, -sy, -sz], [-sx, -sy, -sz]], [0, -1, 0]);
    // 4 Triangular Slopes
    addFacet([[-sx, -sy, sz], [0, sy, 0], [sx, -sy, sz]], normalizeVector([0, sz, sy])); // Front
    addFacet([[sx, -sy, sz], [0, sy, 0], [sx, -sy, -sz]], normalizeVector([sy, sz, 0])); // Right
    addFacet([[sx, -sy, -sz], [0, sy, 0], [-sx, -sy, -sz]], normalizeVector([0, sz, -sy])); // Back
    addFacet([[-sx, -sy, -sz], [0, sy, 0], [-sx, -sy, sz]], normalizeVector([-sy, sz, 0])); // Left
  }

  toGlbBuffer(options = { autoGround: true }) {
    // Compute bounding box
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    for (let i = 0; i < this.positions.length; i += 3) {
      const x = this.positions[i];
      const y = this.positions[i + 1];
      const z = this.positions[i + 2];
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
      if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
    }

    // Auto-ground: ensure minY is exactly 0.0 (ground level) per export contract
    if (options.autoGround && minY < 0 && minY > -100) {
      const yShift = -minY;
      for (let i = 1; i < this.positions.length; i += 3) {
        this.positions[i] += yShift;
      }
      maxY += yShift;
      minY = 0;
    }

    const posBuffer = Buffer.from(new Float32Array(this.positions).buffer);
    const normBuffer = Buffer.from(new Float32Array(this.normals).buffer);
    const colBuffer = Buffer.from(new Float32Array(this.colors).buffer);
    const idxBuffer = Buffer.from(new Uint32Array(this.indices).buffer);

    const pad = (buf, align = 4) => {
      const rem = buf.length % align;
      if (rem === 0) return buf;
      return Buffer.concat([buf, Buffer.alloc(align - rem)]);
    };

    const paddedPos = pad(posBuffer);
    const paddedNorm = pad(normBuffer);
    const paddedCol = pad(colBuffer);
    const paddedIdx = pad(idxBuffer);

    const posOffset = 0;
    const normOffset = paddedPos.length;
    const colOffset = normOffset + paddedNorm.length;
    const idxOffset = colOffset + paddedCol.length;
    const totalBinLength = idxOffset + paddedIdx.length;

    const binChunk = Buffer.concat([paddedPos, paddedNorm, paddedCol, paddedIdx]);

    const gltfJson = {
      asset: { generator: "SevereWeather-GlbBuilder-v1.0", version: "2.0" },
      scene: 0,
      scenes: [{ nodes: [0] }],
      nodes: [{ mesh: 0, name: "Root" }],
      materials: [
        {
          name: "DefaultVertexColorMaterial",
          pbrMetallicRoughness: {
            baseColorFactor: [1, 1, 1, 1],
            metallicFactor: 0.16,
            roughnessFactor: 0.54
          }
        }
      ],
      meshes: [
        {
          name: "ModelMesh",
          primitives: [
            {
              attributes: {
                POSITION: 0,
                NORMAL: 1,
                COLOR_0: 2
              },
              indices: 3,
              material: 0
            }
          ]
        }
      ],
      accessors: [
        {
          bufferView: 0,
          byteOffset: 0,
          componentType: 5126, // FLOAT
          count: this.positions.length / 3,
          type: "VEC3",
          max: [maxX, maxY, maxZ],
          min: [minX, minY, minZ]
        },
        {
          bufferView: 1,
          byteOffset: 0,
          componentType: 5126, // FLOAT
          count: this.normals.length / 3,
          type: "VEC3"
        },
        {
          bufferView: 2,
          byteOffset: 0,
          componentType: 5126, // FLOAT
          count: this.colors.length / 4,
          type: "VEC4"
        },
        {
          bufferView: 3,
          byteOffset: 0,
          componentType: 5125, // UNSIGNED_INT
          count: this.indices.length,
          type: "SCALAR"
        }
      ],
      bufferViews: [
        { buffer: 0, byteOffset: posOffset, byteLength: posBuffer.length, target: 34962 },
        { buffer: 0, byteOffset: normOffset, byteLength: normBuffer.length, target: 34962 },
        { buffer: 0, byteOffset: colOffset, byteLength: colBuffer.length, target: 34962 },
        { buffer: 0, byteOffset: idxOffset, byteLength: idxBuffer.length, target: 34963 }
      ],
      buffers: [{ byteLength: totalBinLength }]
    };

    let jsonStr = JSON.stringify(gltfJson);
    while (jsonStr.length % 4 !== 0) jsonStr += ' ';
    const jsonChunk = Buffer.from(jsonStr, 'utf8');

    const totalGlbLength = 12 + 8 + jsonChunk.length + 8 + binChunk.length;
    const header = Buffer.alloc(12);
    header.write('glTF', 0, 'ascii');
    header.writeUInt32LE(2, 4);
    header.writeUInt32LE(totalGlbLength, 8);

    const jsonChunkHeader = Buffer.alloc(8);
    jsonChunkHeader.writeUInt32LE(jsonChunk.length, 0);
    jsonChunkHeader.writeUInt32LE(0x4E4F534A, 4); // 'JSON'

    const binChunkHeader = Buffer.alloc(8);
    binChunkHeader.writeUInt32LE(binChunk.length, 0);
    binChunkHeader.writeUInt32LE(0x004E4942, 4); // 'BIN\0'

    return Buffer.concat([header, jsonChunkHeader, jsonChunk, binChunkHeader, binChunk]);
  }
}

function parseHexColor(hex) {
  let clean = hex.replace('#', '');
  if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  return [r, g, b];
}

function rotateVector(v, r) {
  let [x, y, z] = v;
  const [rx, ry, rz] = r;

  // Rot X
  if (rx !== 0) {
    const cosX = Math.cos(rx), sinX = Math.sin(rx);
    const y1 = y * cosX - z * sinX;
    const z1 = y * sinX + z * cosX;
    y = y1; z = z1;
  }
  // Rot Y
  if (ry !== 0) {
    const cosY = Math.cos(ry), sinY = Math.sin(ry);
    const x1 = x * cosY + z * sinY;
    const z1 = -x * sinY + z * cosY;
    x = x1; z = z1;
  }
  // Rot Z
  if (rz !== 0) {
    const cosZ = Math.cos(rz), sinZ = Math.sin(rz);
    const x1 = x * cosZ - y * sinZ;
    const y1 = x * sinZ + y * cosZ;
    x = x1; y = y1;
  }
  return [x, y, z];
}

function normalizeVector(v) {
  const len = Math.hypot(v[0], v[1], v[2]) || 1.0;
  return [v[0] / len, v[1] / len, v[2] / len];
}
