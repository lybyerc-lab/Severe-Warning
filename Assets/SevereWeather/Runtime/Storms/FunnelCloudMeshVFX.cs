using SevereWeather.Core;
using UnityEngine;

namespace SevereWeather.Storms
{
    [RequireComponent(typeof(MeshFilter), typeof(MeshRenderer))]
    public class FunnelCloudMeshVFX : MonoBehaviour
    {
        [SerializeField] private int radialSegments = 24;
        [SerializeField] private int heightSegments = 16;
        [SerializeField] private float topRadius = 14f;
        [SerializeField] private float bottomRadius = 1.8f;
        [SerializeField] private float height = 28f;
        [SerializeField] private Color cloudColor = new Color(0.05f, 0.08f, 0.14f, 0.9f);

        private Mesh filterMesh;
        private MeshRenderer meshRenderer;

        private void Awake()
        {
            MeshFilter filter = GetComponent<MeshFilter>();
            filterMesh = new Mesh { name = "ProceduralFunnelCloud" };
            filter.mesh = filterMesh;
            meshRenderer = GetComponent<MeshRenderer>();
            
            GenerateFunnelMesh();
            EnsureMaterial();
        }

        private void EnsureMaterial()
        {
            if (meshRenderer.sharedMaterial == null)
            {
                Shader shader = Shader.Find("Standard");
                if (shader == null) shader = Shader.Find("Sprites/Default");
                Material mat = new Material(shader)
                {
                    color = cloudColor
                };
                meshRenderer.sharedMaterial = mat;
            }
        }

        private void GenerateFunnelMesh()
        {
            int numVertices = (radialSegments + 1) * (heightSegments + 1);
            Vector3[] vertices = new Vector3[numVertices];
            Vector2[] uvs = new Vector2[numVertices];
            int[] triangles = new int[radialSegments * heightSegments * 6];

            int vIndex = 0;
            for (int y = 0; y <= heightSegments; y++)
            {
                float v = (float)y / heightSegments;
                float currentRadius = Mathf.Lerp(bottomRadius, topRadius, v);
                float currentY = v * height;

                for (int x = 0; x <= radialSegments; x++)
                {
                    float u = (float)x / radialSegments;
                    float angle = u * Mathf.PI * 2f;

                    vertices[vIndex] = new Vector3(Mathf.Cos(angle) * currentRadius, currentY, Mathf.Sin(angle) * currentRadius);
                    uvs[vIndex] = new Vector2(u, v);
                    vIndex++;
                }
            }

            int tIndex = 0;
            for (int y = 0; y < heightSegments; y++)
            {
                for (int x = 0; x < radialSegments; x++)
                {
                    int current = y * (radialSegments + 1) + x;
                    int next = current + radialSegments + 1;

                    triangles[tIndex++] = current;
                    triangles[tIndex++] = next;
                    triangles[tIndex++] = current + 1;

                    triangles[tIndex++] = current + 1;
                    triangles[tIndex++] = next;
                    triangles[tIndex++] = next + 1;
                }
            }

            filterMesh.Clear();
            filterMesh.vertices = vertices;
            filterMesh.uv = uvs;
            filterMesh.triangles = triangles;
            filterMesh.RecalculateNormals();
            filterMesh.RecalculateBounds();
        }

        private void Update()
        {
            transform.Rotate(Vector3.up, 180f * Time.deltaTime, Space.Self);
        }
    }
}
