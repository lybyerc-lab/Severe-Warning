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

        private float health;
        private bool destroyed;
        private Vector3 intactScale;
        private Quaternion intactRotation;
        private Color[] intactColors;
        private int[] colorPropertyIds;
        private MaterialPropertyBlock[] propertyBlocks;
        private Rigidbody body;
        private bool bodyConfigured;

        public bool IsDestroyed => destroyed;
        public float HealthNormalized => maxHealth <= 0f ? 0f : Mathf.Clamp01(health / maxHealth);
        public MaterialClass MaterialClass => materialClass;
        public bool IsConductive => conductive;
        public MobilityClass Mobility => mobilityClass;
        public bool IsDynamic => body != null && !body.isKinematic;

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
            bodyConfigured = false;
            EnsureBody(false);
        }

        private void Awake()
        {
            health = maxHealth;
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
            float adjusted = damageEvent.Amount * GetMaterialMultiplier(materialClass, damageEvent.Type);
            health = Mathf.Max(0f, health - adjusted);
            TryReleaseBody(adjusted, damageEvent.Impulse);

            if (body != null && !body.isKinematic && damageEvent.Impulse.sqrMagnitude > 0.01f)
            {
                body.AddForceAtPosition(damageEvent.Impulse, damageEvent.WorldPoint, ForceMode.Impulse);
            }

            UpdateVisualStage();

            if (health <= 0f)
            {
                Collapse(damageEvent);
            }
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
            float darken = Mathf.Lerp(1f, 0.38f, damage);
            float warm = materialClass == MaterialClass.Metal ? 0.92f : 1f;

            for (int i = 0; i < visualRenderers.Length; i++)
            {
                Renderer renderer = visualRenderers[i];
                if (renderer == null) continue;
                Color color = intactColors[i];
                color = new Color(color.r * darken, color.g * darken * warm, color.b * darken * warm, color.a);
                MaterialPropertyBlock block = propertyBlocks[i];
                renderer.GetPropertyBlock(block);
                block.SetColor(colorPropertyIds[i], color);
                renderer.SetPropertyBlock(block);
            }

            if (body == null || body.isKinematic)
            {
                transform.localRotation = intactRotation * Quaternion.Euler(0f, 0f, Mathf.Sin(damage * 11f) * damage * 2.5f);
                transform.localScale = new Vector3(
                    intactScale.x,
                    intactScale.y * Mathf.Lerp(1f, 0.86f, damage),
                    intactScale.z);
            }
        }

        private void Collapse(in DamageEvent damageEvent)
        {
            destroyed = true;
            EnsureBody(true);
            transform.localScale = new Vector3(intactScale.x, intactScale.y * 0.28f, intactScale.z);
            transform.localRotation = intactRotation * Quaternion.Euler(
                UnityEngine.Random.Range(-8f, 8f),
                UnityEngine.Random.Range(-18f, 18f),
                UnityEngine.Random.Range(-12f, 12f));

            if (body != null)
            {
                body.isKinematic = false;
                body.AddForce(damageEvent.Impulse + Vector3.up * 2.5f, ForceMode.Impulse);
                body.AddTorque(UnityEngine.Random.insideUnitSphere * 2.5f, ForceMode.Impulse);
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
