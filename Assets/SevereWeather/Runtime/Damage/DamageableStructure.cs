using SevereWeather.Presentation;
using UnityEngine;

namespace SevereWeather.Damage
{
    public enum MobilityClass
    {
        Light,
        Medium,
        Heavy,
        Structural
    }

    public enum DamageStage
    {
        Intact,
        Stressed,
        Damaged,
        Critical,
        Destroyed
    }

    [DisallowMultipleComponent]
    public sealed class DamageableStructure : MonoBehaviour, IDamageable
    {
        private static readonly int BaseColorId = Shader.PropertyToID("_BaseColor");
        private static readonly int ColorId = Shader.PropertyToID("_Color");

        [SerializeField, Min(1f)] private float maxHealth = 180f;
        [SerializeField] private MaterialClass materialClass = MaterialClass.Wood;
        [SerializeField] private bool conductive;
        [SerializeField] private MobilityClass mobilityClass = MobilityClass.Structural;
        [SerializeField] private Renderer[] visualRenderers;

        private static string recentImpactLabel = "IMPACT READY";
        private static float recentImpactUntil;

        private float health;
        private bool destroyed;
        private DamageStage stage;
        private Vector3 intactScale;
        private Quaternion intactRotation;
        private Color[] intactColors;
        private int[] colorPropertyIds;
        private MaterialPropertyBlock[] propertyBlocks;
        private Rigidbody body;
        private bool bodyConfigured;
        private float nextImpactFeedbackTime;

        public bool IsDestroyed => destroyed;
        public float HealthNormalized => maxHealth <= 0f ? 0f : Mathf.Clamp01(health / maxHealth);
        public MaterialClass MaterialClass => materialClass;
        public bool IsConductive => conductive;
        public MobilityClass Mobility => mobilityClass;
        public bool IsDynamic => body != null && !body.isKinematic;
        public DamageStage Stage => stage;
        public static string RecentImpactLabel => Time.unscaledTime <= recentImpactUntil
            ? recentImpactLabel
            : "IMPACT READY";

        public void Configure(
            float healthValue,
            MaterialClass material,
            bool isConductive,
            MobilityClass mobility = MobilityClass.Structural)
        {
            maxHealth = Mathf.Max(1f, healthValue);
            materialClass = material;
            conductive = isConductive;
            mobilityClass = mobility;
            health = maxHealth;
            destroyed = false;
            stage = DamageStage.Intact;
            bodyConfigured = false;
            EnsureBody(false);
            UpdateVisualStage();
        }

        private void Awake()
        {
            health = maxHealth;
            stage = DamageStage.Intact;
            intactScale = transform.localScale;
            intactRotation = transform.localRotation;
            CaptureVisuals();
            EnsureBody(false);
        }

        private void Start()
        {
            EnsureBody(false);
        }

        private void CaptureVisuals()
        {
            if (visualRenderers == null || visualRenderers.Length == 0)
            {
                visualRenderers = GetComponentsInChildren<Renderer>();
            }

            intactColors = new Color[visualRenderers.Length];
            colorPropertyIds = new int[visualRenderers.Length];
            propertyBlocks = new MaterialPropertyBlock[visualRenderers.Length];

            for (int i = 0; i < visualRenderers.Length; i++)
            {
                Material material = visualRenderers[i].sharedMaterial;
                if (material != null && material.HasProperty(BaseColorId))
                {
                    intactColors[i] = material.GetColor(BaseColorId);
                    colorPropertyIds[i] = BaseColorId;
                }
                else if (material != null && material.HasProperty(ColorId))
                {
                    intactColors[i] = material.GetColor(ColorId);
                    colorPropertyIds[i] = ColorId;
                }
                else
                {
                    intactColors[i] = Color.white;
                    colorPropertyIds[i] = ColorId;
                }

                propertyBlocks[i] = new MaterialPropertyBlock();
            }
        }

        public void ApplyDamage(in DamageEvent damageEvent)
        {
            if (destroyed || damageEvent.Amount <= 0f)
            {
                return;
            }

            EnsureBody(false);
            DamageStage previousStage = stage;
            float adjusted = damageEvent.Amount * GetMaterialMultiplier(materialClass, damageEvent.Type);
            health = Mathf.Max(0f, health - adjusted);
            stage = ResolveDamageStage();

            TryReleaseBody(adjusted, damageEvent.Impulse);

            if (body != null && !body.isKinematic && damageEvent.Impulse.sqrMagnitude > 0.01f)
            {
                body.AddForceAtPosition(damageEvent.Impulse, damageEvent.WorldPoint, ForceMode.Impulse);
            }

            UpdateVisualStage();
            bool stageChanged = stage != previousStage;
            ShowImpactFeedback(damageEvent, adjusted, stageChanged);

            if (health <= 0f)
            {
                Collapse(damageEvent);
            }
        }

        private DamageStage ResolveDamageStage()
        {
            if (health <= 0f) return DamageStage.Destroyed;

            float damage = 1f - HealthNormalized;
            if (damage >= 0.7f) return DamageStage.Critical;
            if (damage >= 0.38f) return DamageStage.Damaged;
            if (damage >= 0.12f) return DamageStage.Stressed;
            return DamageStage.Intact;
        }

        private void ShowImpactFeedback(in DamageEvent damageEvent, float adjustedDamage, bool stageChanged)
        {
            float significanceFloor = Mathf.Max(1.5f, maxHealth * 0.008f);
            if (!stageChanged && adjustedDamage < significanceFloor)
            {
                return;
            }

            if (!stageChanged && Time.unscaledTime < nextImpactFeedbackTime)
            {
                return;
            }

            nextImpactFeedbackTime = Time.unscaledTime + (stageChanged ? 0.08f : 0.24f);
            Color color = GetImpactColor(materialClass, damageEvent.Type);
            float scale = Mathf.Clamp(Mathf.Sqrt(Mathf.Max(0.1f, adjustedDamage)) * 0.34f, 0.55f, 3.2f);
            bool critical = stageChanged || stage == DamageStage.Critical || stage == DamageStage.Destroyed;

            StormActionVfx.ImpactBurst(
                damageEvent.WorldPoint,
                damageEvent.Impulse,
                color,
                scale,
                critical);

            recentImpactLabel = $"IMPACT {materialClass} {stage}";
            recentImpactUntil = Time.unscaledTime + 1.35f;
        }

        private void TryReleaseBody(float adjustedDamage, Vector3 impulse)
        {
            if (destroyed || mobilityClass == MobilityClass.Structural) return;

            float damageFraction = 1f - HealthNormalized;
            float impulseMagnitude = impulse.magnitude;
            bool release;
            switch (mobilityClass)
            {
                case MobilityClass.Light:
                    release = adjustedDamage >= 2.5f || damageFraction >= 0.22f || impulseMagnitude >= 0.35f;
                    break;
                case MobilityClass.Medium:
                    release = adjustedDamage >= 7f || damageFraction >= 0.14f || impulseMagnitude >= 2.5f;
                    break;
                case MobilityClass.Heavy:
                    release = adjustedDamage >= 24f || damageFraction >= 0.48f || impulseMagnitude >= 11f;
                    break;
                default:
                    release = false;
                    break;
            }

            if (!release) return;
            EnsureBody(true);
            if (body != null) body.isKinematic = false;
        }

        private void EnsureBody(bool createIfMissing)
        {
            if (body == null)
            {
                body = GetComponent<Rigidbody>();
            }

            if (body == null && createIfMissing)
            {
                body = gameObject.AddComponent<Rigidbody>();
            }

            if (body == null || bodyConfigured) return;
            body.mass = EstimateMass();
            body.drag = mobilityClass == MobilityClass.Light ? 0.35f : 0.8f;
            body.angularDrag = mobilityClass == MobilityClass.Light ? 0.25f : 1.1f;
            body.maxAngularVelocity = mobilityClass == MobilityClass.Light ? 28f : 16f;
            bodyConfigured = true;
        }

        private float EstimateMass()
        {
            Bounds bounds = new Bounds(transform.position, Vector3.one);
            bool hasBounds = false;
            if (visualRenderers != null)
            {
                for (int i = 0; i < visualRenderers.Length; i++)
                {
                    if (visualRenderers[i] == null) continue;
                    if (!hasBounds)
                    {
                        bounds = visualRenderers[i].bounds;
                        hasBounds = true;
                    }
                    else
                    {
                        bounds.Encapsulate(visualRenderers[i].bounds);
                    }
                }
            }

            Vector3 size = hasBounds ? bounds.size : Vector3.one;
            float volume = Mathf.Max(0.15f, size.x * size.y * size.z);
            float density;
            switch (materialClass)
            {
                case MaterialClass.Metal:
                case MaterialClass.Infrastructure:
                    density = 1.25f;
                    break;
                case MaterialClass.Masonry:
                    density = 1.6f;
                    break;
                case MaterialClass.Vehicle:
                    density = 0.55f;
                    break;
                case MaterialClass.Crop:
                case MaterialClass.Vegetation:
                    density = 0.08f;
                    break;
                default:
                    density = 0.42f;
                    break;
            }

            float mobilityScale;
            switch (mobilityClass)
            {
                case MobilityClass.Light:
                    mobilityScale = 0.18f;
                    break;
                case MobilityClass.Medium:
                    mobilityScale = 0.55f;
                    break;
                case MobilityClass.Heavy:
                    mobilityScale = 1.2f;
                    break;
                default:
                    mobilityScale = 2.2f;
                    break;
            }

            return Mathf.Clamp(volume * density * mobilityScale, 0.2f, 5000f);
        }

        private void UpdateVisualStage()
        {
            if (visualRenderers == null || intactColors == null) return;

            float damage = 1f - HealthNormalized;
            float darken = Mathf.Lerp(1f, 0.42f, damage);
            float desaturate = Mathf.Lerp(1f, 0.72f, damage);

            for (int i = 0; i < visualRenderers.Length; i++)
            {
                Renderer renderer = visualRenderers[i];
                if (renderer == null) continue;
                Color color = intactColors[i];
                color = new Color(
                    color.r * darken,
                    color.g * darken * desaturate,
                    color.b * darken * desaturate,
                    color.a);
                MaterialPropertyBlock block = propertyBlocks[i];
                renderer.GetPropertyBlock(block);
                block.SetColor(colorPropertyIds[i], color);
                renderer.SetPropertyBlock(block);
            }

            if (destroyed || (body != null && !body.isKinematic)) return;

            Vector3 scale = intactScale;
            Vector3 euler = Vector3.zero;
            switch (materialClass)
            {
                case MaterialClass.Crop:
                    scale.y = intactScale.y * Mathf.Lerp(1f, 0.18f, damage);
                    scale.z = intactScale.z * Mathf.Lerp(1f, 1.12f, damage);
                    euler.z = damage * 18f;
                    break;
                case MaterialClass.Vegetation:
                    euler.z = damage * 30f;
                    scale.y = intactScale.y * Mathf.Lerp(1f, 0.9f, damage);
                    break;
                case MaterialClass.Glass:
                    scale.y = intactScale.y * Mathf.Lerp(1f, 0.62f, damage);
                    euler.x = damage * 4f;
                    euler.z = damage * 6f;
                    break;
                case MaterialClass.Metal:
                case MaterialClass.Infrastructure:
                    euler.z = Mathf.Sin(damage * 18f) * damage * 8f;
                    scale.x = intactScale.x * Mathf.Lerp(1f, 0.96f, damage);
                    break;
                case MaterialClass.Vehicle:
                    euler.z = Mathf.Sin(damage * 13f) * damage * 5f;
                    scale.y = intactScale.y * Mathf.Lerp(1f, 0.92f, damage);
                    break;
                case MaterialClass.Masonry:
                    euler.z = damage * 2.5f;
                    scale.y = intactScale.y * Mathf.Lerp(1f, 0.92f, damage);
                    break;
                default:
                    euler.z = Mathf.Sin(damage * 11f) * damage * 7f;
                    scale.y = intactScale.y * Mathf.Lerp(1f, 0.82f, damage);
                    break;
            }

            transform.localRotation = intactRotation * Quaternion.Euler(euler);
            transform.localScale = scale;
        }

        private void Collapse(in DamageEvent damageEvent)
        {
            destroyed = true;
            stage = DamageStage.Destroyed;

            if (materialClass == MaterialClass.Crop)
            {
                if (body != null) body.isKinematic = true;
                transform.localScale = new Vector3(intactScale.x, intactScale.y * 0.07f, intactScale.z * 1.18f);
                transform.localRotation = intactRotation * Quaternion.Euler(0f, 0f, 78f);
                return;
            }

            if (mobilityClass == MobilityClass.Structural)
            {
                if (body != null) body.isKinematic = true;
                ApplyStructuralCollapsePose();
                return;
            }

            EnsureBody(true);
            if (body != null)
            {
                body.isKinematic = false;
                body.AddForce(damageEvent.Impulse + Vector3.up * 2.5f, ForceMode.Impulse);
                body.AddTorque(UnityEngine.Random.insideUnitSphere * 2.5f, ForceMode.Impulse);
            }
        }

        private void ApplyStructuralCollapsePose()
        {
            Vector3 scale = intactScale;
            Vector3 euler;
            switch (materialClass)
            {
                case MaterialClass.Glass:
                    scale = new Vector3(intactScale.x * 0.84f, intactScale.y * 0.1f, intactScale.z * 0.84f);
                    euler = new Vector3(4f, 7f, 11f);
                    break;
                case MaterialClass.Masonry:
                    scale.y = intactScale.y * 0.44f;
                    euler = new Vector3(3f, 4f, 5f);
                    break;
                case MaterialClass.Metal:
                case MaterialClass.Infrastructure:
                    scale.y = intactScale.y * 0.3f;
                    euler = new Vector3(5f, 12f, 14f);
                    break;
                default:
                    scale.y = intactScale.y * 0.28f;
                    euler = new Vector3(7f, 15f, 18f);
                    break;
            }

            transform.localScale = scale;
            transform.localRotation = intactRotation * Quaternion.Euler(euler);
        }

        private static Color GetImpactColor(MaterialClass material, DamageType type)
        {
            if (type == DamageType.Electrical) return new Color(0.48f, 0.84f, 1f, 1f);
            if (type == DamageType.Hail) return new Color(0.78f, 0.94f, 1f, 0.95f);
            if (type == DamageType.Suction) return new Color(0.64f, 0.82f, 0.94f, 0.9f);

            switch (material)
            {
                case MaterialClass.Glass:
                    return new Color(0.42f, 0.9f, 1f, 0.95f);
                case MaterialClass.Crop:
                case MaterialClass.Vegetation:
                    return new Color(0.7f, 0.86f, 0.25f, 0.9f);
                case MaterialClass.Metal:
                case MaterialClass.Infrastructure:
                    return new Color(1f, 0.72f, 0.25f, 0.95f);
                case MaterialClass.Masonry:
                    return new Color(0.78f, 0.65f, 0.52f, 0.9f);
                case MaterialClass.Vehicle:
                    return new Color(1f, 0.5f, 0.24f, 0.95f);
                default:
                    return new Color(0.85f, 0.72f, 0.48f, 0.9f);
            }
        }

        private static float GetMaterialMultiplier(MaterialClass material, DamageType type)
        {
            switch (material)
            {
                case MaterialClass.Glass:
                    return type == DamageType.Hail || type == DamageType.Impact ? 2.2f : 1.4f;
                case MaterialClass.Crop:
                    return type == DamageType.Hail || type == DamageType.Wind ? 2.0f : 0.7f;
                case MaterialClass.Vehicle:
                    return type == DamageType.Hail ? 1.2f : type == DamageType.Suction ? 1.45f : 1f;
                case MaterialClass.Metal:
                    return type == DamageType.Electrical ? 1.35f : type == DamageType.Hail ? 0.72f : 0.9f;
                case MaterialClass.Masonry:
                    return type == DamageType.Wind ? 0.72f : type == DamageType.Impact ? 1.15f : 0.82f;
                case MaterialClass.Infrastructure:
                    return type == DamageType.Electrical ? 1.55f : type == DamageType.Hail ? 0.35f : 0.78f;
                case MaterialClass.Vegetation:
                    return type == DamageType.Wind || type == DamageType.Suction ? 1.55f : 0.8f;
                default:
                    return 1f;
            }
        }
    }
}
