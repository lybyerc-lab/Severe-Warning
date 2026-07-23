using SevereWeather.Damage;
using UnityEngine;

namespace SevereWeather.World
{
    public static class PrimitiveFactory
    {
        private const string RuntimeShaderResource = "SevereWeatherRuntime";
        private static Shader cachedShader;

        public static Material CreateMaterial(string name, Color color, float metallic = 0f, float smoothness = 0.25f)
        {
            if (cachedShader == null)
            {
                cachedShader = ResolveRuntimeShader();
            }

            Material material = new Material(cachedShader)
            {
                name = name
            };

            if (material.HasProperty("_BaseColor")) material.SetColor("_BaseColor", color);
            if (material.HasProperty("_Color")) material.SetColor("_Color", color);
            if (material.HasProperty("_Metallic")) material.SetFloat("_Metallic", metallic);
            if (material.HasProperty("_Smoothness")) material.SetFloat("_Smoothness", smoothness);
            return material;
        }

        private static Shader ResolveRuntimeShader()
        {
            Shader shader = Resources.Load<Shader>(RuntimeShaderResource);
            if (shader != null) return shader;

            shader = Shader.Find("Universal Render Pipeline/Lit");
            if (shader != null) return shader;

            shader = Shader.Find("Standard");
            if (shader != null) return shader;

            shader = Shader.Find("Unlit/Color");
            if (shader != null) return shader;

            throw new System.InvalidOperationException(
                "No runtime-compatible shader was available. Expected Resources/SevereWeatherRuntime.shader.");
        }

        public static GameObject CreateBox(
            Transform parent,
            string name,
            Vector3 position,
            Vector3 scale,
            Material material,
            bool collider = true)
        {
            GameObject box = GameObject.CreatePrimitive(PrimitiveType.Cube);
            box.name = name;
            box.transform.SetParent(parent, false);
            box.transform.position = position;
            box.transform.localScale = scale;
            box.GetComponent<Renderer>().sharedMaterial = material;
            if (!collider)
            {
                Object.Destroy(box.GetComponent<Collider>());
            }
            return box;
        }

        public static GameObject CreateCylinder(
            Transform parent,
            string name,
            Vector3 position,
            Vector3 scale,
            Material material,
            bool collider = true)
        {
            GameObject cylinder = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            cylinder.name = name;
            cylinder.transform.SetParent(parent, false);
            cylinder.transform.position = position;
            cylinder.transform.localScale = scale;
            cylinder.GetComponent<Renderer>().sharedMaterial = material;
            if (!collider)
            {
                Object.Destroy(cylinder.GetComponent<Collider>());
            }
            return cylinder;
        }

        public static DamageableStructure AddDamageable(
            GameObject target,
            float health,
            MaterialClass material,
            bool conductive = false)
        {
            DamageableStructure damageable = target.GetComponent<DamageableStructure>();
            if (damageable == null)
            {
                damageable = target.AddComponent<DamageableStructure>();
            }
            damageable.Configure(health, material, conductive);
            return damageable;
        }
    }
}
