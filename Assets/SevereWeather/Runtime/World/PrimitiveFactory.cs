using SevereWeather.Damage;
using UnityEngine;
using UnityEngine.Rendering;

namespace SevereWeather.World
{
    public static class PrimitiveFactory
    {
        private const string BuiltInLitResource = "RuntimeWorldLit";
        private const string UrpLitResource = "RuntimeWorldUrpLit";
        private const string BuiltInUnlitResource = "RuntimeUnlit";
        private const string UrpUnlitResource = "RuntimeUrpUnlit";

        private static Material builtInLitTemplate;
        private static Material urpLitTemplate;
        private static Material builtInUnlitTemplate;
        private static Material urpUnlitTemplate;

        public static Material CreateMaterial(
            string name,
            Color color,
            float metallic = 0f,
            float smoothness = 0.25f,
            bool transparent = false,
            bool unlit = false)
        {
            Material template = ResolveTemplate(unlit);
            Material material = new Material(template)
            {
                name = name,
                enableInstancing = true
            };

            SetColor(material, color);
            if (material.HasProperty("_Metallic")) material.SetFloat("_Metallic", metallic);
            if (material.HasProperty("_Smoothness")) material.SetFloat("_Smoothness", smoothness);
            if (material.HasProperty("_Glossiness")) material.SetFloat("_Glossiness", smoothness);

            if (transparent || color.a < 0.995f)
            {
                ConfigureTransparent(material);
            }
            else
            {
                ConfigureOpaque(material);
            }

            return material;
        }

        private static Material ResolveTemplate(bool unlit)
        {
            bool scriptablePipeline = GraphicsSettings.currentRenderPipeline != null ||
                                      GraphicsSettings.defaultRenderPipeline != null;

            if (unlit)
            {
                if (scriptablePipeline)
                {
                    if (urpUnlitTemplate == null)
                    {
                        urpUnlitTemplate = LoadOrCreateTemplate(
                            UrpUnlitResource,
                            "Universal Render Pipeline/Unlit",
                            "Sprites/Default",
                            "SevereWeather/RuntimeColor");
                    }
                    return urpUnlitTemplate;
                }

                if (builtInUnlitTemplate == null)
                {
                    builtInUnlitTemplate = LoadOrCreateTemplate(
                        BuiltInUnlitResource,
                        "Sprites/Default",
                        "Unlit/Color",
                        "SevereWeather/RuntimeColor");
                }
                return builtInUnlitTemplate;
            }

            if (scriptablePipeline)
            {
                if (urpLitTemplate == null)
                {
                    urpLitTemplate = LoadOrCreateTemplate(
                        UrpLitResource,
                        "Universal Render Pipeline/Lit",
                        "SevereWeather/RuntimeColor");
                }
                return urpLitTemplate;
            }

            if (builtInLitTemplate == null)
            {
                builtInLitTemplate = LoadOrCreateTemplate(
                    BuiltInLitResource,
                    "Standard",
                    "SevereWeather/RuntimeColor");
            }
            return builtInLitTemplate;
        }

        private static Material LoadOrCreateTemplate(string resourceName, params string[] shaderNames)
        {
            Material loaded = Resources.Load<Material>(resourceName);
            if (loaded != null) return loaded;

            for (int i = 0; i < shaderNames.Length; i++)
            {
                Shader shader = Shader.Find(shaderNames[i]);
                if (shader != null)
                {
                    return new Material(shader)
                    {
                        name = resourceName + " Runtime Fallback",
                        hideFlags = HideFlags.DontSave,
                        enableInstancing = true
                    };
                }
            }

            throw new System.InvalidOperationException(
                "No compatible runtime material template or shader was available for " + resourceName + ".");
        }

        private static void SetColor(Material material, Color color)
        {
            if (material.HasProperty("_BaseColor")) material.SetColor("_BaseColor", color);
            if (material.HasProperty("_Color")) material.SetColor("_Color", color);
        }

        private static void ConfigureOpaque(Material material)
        {
            material.SetOverrideTag("RenderType", "Opaque");
            if (material.HasProperty("_Surface")) material.SetFloat("_Surface", 0f);
            if (material.HasProperty("_Mode")) material.SetFloat("_Mode", 0f);
            if (material.HasProperty("_SrcBlend")) material.SetFloat("_SrcBlend", (float)BlendMode.One);
            if (material.HasProperty("_DstBlend")) material.SetFloat("_DstBlend", (float)BlendMode.Zero);
            if (material.HasProperty("_ZWrite")) material.SetFloat("_ZWrite", 1f);
            material.DisableKeyword("_SURFACE_TYPE_TRANSPARENT");
            material.DisableKeyword("_ALPHABLEND_ON");
            material.DisableKeyword("_ALPHAPREMULTIPLY_ON");
            material.renderQueue = (int)RenderQueue.Geometry;
        }

        private static void ConfigureTransparent(Material material)
        {
            material.SetOverrideTag("RenderType", "Transparent");
            if (material.HasProperty("_Surface")) material.SetFloat("_Surface", 1f);
            if (material.HasProperty("_Blend")) material.SetFloat("_Blend", 0f);
            if (material.HasProperty("_Mode")) material.SetFloat("_Mode", 3f);
            if (material.HasProperty("_SrcBlend")) material.SetFloat("_SrcBlend", (float)BlendMode.SrcAlpha);
            if (material.HasProperty("_DstBlend")) material.SetFloat("_DstBlend", (float)BlendMode.OneMinusSrcAlpha);
            if (material.HasProperty("_ZWrite")) material.SetFloat("_ZWrite", 0f);
            material.EnableKeyword("_SURFACE_TYPE_TRANSPARENT");
            material.EnableKeyword("_ALPHABLEND_ON");
            material.DisableKeyword("_ALPHATEST_ON");
            material.DisableKeyword("_ALPHAPREMULTIPLY_ON");
            material.renderQueue = (int)RenderQueue.Transparent;
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
            ConfigureRendererAndCollider(box, material, collider);
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
            ConfigureRendererAndCollider(cylinder, material, collider);
            return cylinder;
        }

        public static GameObject CreateSphere(
            Transform parent,
            string name,
            Vector3 position,
            Vector3 scale,
            Material material,
            bool collider = true)
        {
            GameObject sphere = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            sphere.name = name;
            sphere.transform.SetParent(parent, false);
            sphere.transform.position = position;
            sphere.transform.localScale = scale;
            ConfigureRendererAndCollider(sphere, material, collider);
            return sphere;
        }

        private static void ConfigureRendererAndCollider(GameObject target, Material material, bool collider)
        {
            Renderer renderer = target.GetComponent<Renderer>();
            renderer.sharedMaterial = material;
            bool transparent = material != null && material.renderQueue >= (int)RenderQueue.Transparent;
            renderer.shadowCastingMode = transparent ? ShadowCastingMode.Off : ShadowCastingMode.On;
            renderer.receiveShadows = !transparent;

            if (!collider)
            {
                Collider existing = target.GetComponent<Collider>();
                if (existing != null) Object.Destroy(existing);
            }
        }

        public static DamageableStructure AddDamageable(
            GameObject target,
            float health,
            MaterialClass material,
            bool conductive = false,
            MobilityClass mobility = MobilityClass.Structural)
        {
            DamageableStructure damageable = target.GetComponent<DamageableStructure>();
            if (damageable == null)
            {
                damageable = target.AddComponent<DamageableStructure>();
            }
            damageable.Configure(health, material, conductive, mobility);
            return damageable;
        }
    }
}
