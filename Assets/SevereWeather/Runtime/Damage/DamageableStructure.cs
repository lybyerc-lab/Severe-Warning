using UnityEngine;

namespace SevereWeather.Damage
{
    [DisallowMultipleComponent]
    public sealed class DamageableStructure : MonoBehaviour, IDamageable
    {
        [SerializeField, Min(1f)] private float maxHealth = 180f;
        [SerializeField] private MaterialClass materialClass = MaterialClass.Wood;
        [SerializeField] private bool conductive;
        [SerializeField] private Renderer[] visualRenderers;

        private float health;
        private bool destroyed;
        private Vector3 intactScale;
        private Quaternion intactRotation;
        private Color[] intactColors;
        private Material[] instanceMaterials;
        private Rigidbody body;

        public bool IsDestroyed => destroyed;
        public float HealthNormalized => maxHealth <= 0f ? 0f : Mathf.Clamp01(health / maxHealth);
        public MaterialClass MaterialClass => materialClass;
        public bool IsConductive => conductive;

        public void Configure(float healthValue, MaterialClass material, bool isConductive)
        {
            maxHealth = Mathf.Max(1f, healthValue);
            materialClass = material;
            conductive = isConductive;
            health = maxHealth;
        }

        private void Awake()
        {
            health = maxHealth;
            intactScale = transform.localScale;
            intactRotation = transform.localRotation;
            body = GetComponent<Rigidbody>();

            if (visualRenderers == null || visualRenderers.Length == 0)
            {
                visualRenderers = GetComponentsInChildren<Renderer>();
            }

            intactColors = new Color[visualRenderers.Length];
            instanceMaterials = new Material[visualRenderers.Length];
            for (int i = 0; i < visualRenderers.Length; i++)
            {
                Material material = visualRenderers[i].material;
                instanceMaterials[i] = material;
                intactColors[i] = material.HasProperty("_BaseColor")
                    ? material.GetColor("_BaseColor")
                    : material.color;
            }
        }

        public void ApplyDamage(in DamageEvent damageEvent)
        {
            if (destroyed || damageEvent.Amount <= 0f)
            {
                return;
            }

            float adjusted = damageEvent.Amount * GetMaterialMultiplier(materialClass, damageEvent.Type);
            health = Mathf.Max(0f, health - adjusted);

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

        private void UpdateVisualStage()
        {
            float damage = 1f - HealthNormalized;
            float darken = Mathf.Lerp(1f, 0.38f, damage);
            float warm = materialClass == MaterialClass.Metal ? 0.92f : 1f;

            for (int i = 0; i < visualRenderers.Length; i++)
            {
                Color color = intactColors[i];
                color = new Color(color.r * darken, color.g * darken * warm, color.b * darken * warm, color.a);
                Material material = instanceMaterials[i];
                if (material.HasProperty("_BaseColor"))
                {
                    material.SetColor("_BaseColor", color);
                }
                else
                {
                    material.color = color;
                }
            }

            transform.localRotation = intactRotation * Quaternion.Euler(0f, 0f, Mathf.Sin(damage * 11f) * damage * 2.5f);
            transform.localScale = new Vector3(
                intactScale.x,
                intactScale.y * Mathf.Lerp(1f, 0.86f, damage),
                intactScale.z);
        }

        private void Collapse(in DamageEvent damageEvent)
        {
            destroyed = true;
            transform.localScale = new Vector3(intactScale.x, intactScale.y * 0.28f, intactScale.z);
            transform.localRotation = intactRotation * Quaternion.Euler(
                Random.Range(-8f, 8f),
                Random.Range(-18f, 18f),
                Random.Range(-12f, 12f));

            if (body == null)
            {
                body = gameObject.AddComponent<Rigidbody>();
                body.mass = Mathf.Max(1f, intactScale.sqrMagnitude * 0.45f);
            }

            body.isKinematic = false;
            body.AddForce(damageEvent.Impulse + Vector3.up * 2.5f, ForceMode.Impulse);
            body.AddTorque(Random.insideUnitSphere * 2.5f, ForceMode.Impulse);
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
