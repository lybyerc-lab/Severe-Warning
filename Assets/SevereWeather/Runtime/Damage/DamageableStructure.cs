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
        private Vector3 intactLocalPosition;
        private Quaternion intactRotation;
        private Color[] intactColors;
        private int[] colorPropertyIds;
        private MaterialPropertyBlock[] propertyBlocks;
        private Rigidbody body;
        private bool bodyConfigured;
        private float nextImpactFeedbackTime;
        private Vector3 lastImpactDirectionWorld = Vector3.forward;
        private bool damagedComponentsApplied;
        private bool criticalComponentsApplied;

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
            damagedComponentsApplied = false;
            criticalComponentsApplied = false;
            EnsureBody(false);
            UpdateVisualStage();
        }

        private void Awake()
        {
            health = maxHealth;
            stage = DamageStage.Intact;
            intactScale = transform.localScale;
            intactLocalPosition = transform.localPosition;
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

            CaptureImpactDirection(damageEvent);
            EnsureBody(false);
            DamageStage previousStage = stage;
            float adjusted = damageEvent.Amount * GetMaterialMultiplier(materialClass, damageEvent.Type);
            health = Mathf.Max(0f, health - adjusted);
            stage = ResolveDamageStage();

            TryReleaseBody(adjusted, damageEvent.Impulse);

            if (body != null && !body.isKinematic && damageEvent.Impulse.sqrMagnitude > 0.01f)
            {
                Vector3 appliedImpulse = damageEvent.Impulse;
                if (materialClass == MaterialClass.Vegetation)
                {
                    appliedImpulse = Vector3.ClampMagnitude(appliedImpulse, 8f);
                    appliedImpulse.y = Mathf.Min(appliedImpulse.y, 1.5f);
                }
                body.AddForceAtPosition(appliedImpulse, damageEvent.WorldPoint, ForceMode.Impulse);
            }

            UpdateVisualStage();
            ApplyComponentStages(previousStage);
            bool stageChanged = stage != previousStage;
            ShowImpactFeedback(damageEvent, adjusted, stageChanged);

            if (health <= 0f)
            {
                Collapse(damageEvent);
            }
        }

        private void CaptureImpactDirection(in DamageEvent damageEvent)
        {
            Vector3 direction = damageEvent.Impulse;
            direction.y = 0f;
            if (direction.sqrMagnitude < 0.001f && damageEvent.Source != null)
            {
                direction = transform.position - damageEvent.Source.transform.position;
                direction.y = 0f;
            }

            if (direction.sqrMagnitude > 0.001f)
            {
                lastImpactDirectionWorld = direction.normalized;
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

            nextImpactFeedbackTime = Time.unscaledTime + (stageChanged ? 0.1f : 0.3f);
            float scale = Mathf.Clamp(Mathf.Sqrt(Mathf.Max(0.1f, adjustedDamage)) * 0.28f, 0.45f, 2.6f);
            bool critical = stageChanged && ((int)stage >= (int)DamageStage.Critical);

            StormActionVfx.MaterialImpact(
                damageEvent.WorldPoint,
                damageEvent.Impulse,
                materialClass,
                damageEvent.Type,
                scale,
                critical);

            recentImpactLabel = $"IMPACT {materialClass} {stage}";
            recentImpactUntil = Time.unscaledTime + 1.35f;
        }

        private void TryReleaseBody(float adjustedDamage, Vector3 impulse)
        {
            if (destroyed || mobilityClass == MobilityClass.Structural) return;
            if (materialClass == MaterialClass.Crop) return;
            if (materialClass == MaterialClass.Vegetation && (int)stage < (int)DamageStage.Critical) return;

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
            if (body != null)
            {
                if (materialClass == MaterialClass.Vegetation) body.mass = Mathf.Max(body.mass, 12f);
                if (materialClass == MaterialClass.Vehicle) body.mass = Mathf.Max(body.mass, 45f);
                body.isKinematic = false;
            }
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
            body.linearDamping = mobilityClass == MobilityClass.Light ? 0.35f : 0.8f;
            body.angularDamping = mobilityClass == MobilityClass.Light ? 0.25f : 1.1f;
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
                    density = 0.04f;
                    break;
                case MaterialClass.Vegetation:
                    density = 0.14f;
                    break;
                default:
                    density = 0.42f;
                    break;
            }

            float mobilityScale;
            switch (mobilityClass)
            {
                case MobilityClass.Light:
                    mobilityScale = materialClass == MaterialClass.Vegetation ? 0.42f : 0.18f;
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
            float darken = Mathf.Lerp(1f, 0.66f, damage);
            float desaturate = Mathf.Lerp(1f, 0.88f, damage);

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
            Vector3 localDirection = GetLocalImpactDirection();
            switch (materialClass)
            {
                case MaterialClass.Crop:
                    scale.x = intactScale.x * Mathf.Lerp(1f, 1.08f, damage);
                    scale.y = intactScale.y * Mathf.Lerp(1f, 0.14f, damage);
                    scale.z = intactScale.z * Mathf.Lerp(1f, 1.24f, damage);
                    euler.y = DirectionToYaw(localDirection) + 90f;
                    transform.localPosition = intactLocalPosition + Vector3.down * ((intactScale.y - scale.y) * 0.48f);
                    break;
                case MaterialClass.Vegetation:
                    euler.x = localDirection.z * damage * 38f;
                    euler.z = -localDirection.x * damage * 38f;
                    scale.y = intactScale.y * Mathf.Lerp(1f, 0.94f, damage);
                    break;
                case MaterialClass.Glass:
                    scale.y = intactScale.y * Mathf.Lerp(1f, 0.68f, damage);
                    euler.x = localDirection.z * damage * 4f;
                    euler.z = -localDirection.x * damage * 6f;
                    break;
                case MaterialClass.Metal:
                case MaterialClass.Infrastructure:
                    euler.x = localDirection.z * damage * 7f;
                    euler.z = -localDirection.x * damage * 7f;
                    scale.x = intactScale.x * Mathf.Lerp(1f, 0.96f, damage);
                    break;
                case MaterialClass.Vehicle:
                    euler.x = localDirection.z * damage * 4f;
                    euler.z = -localDirection.x * damage * 5f;
                    scale.y = intactScale.y * Mathf.Lerp(1f, 0.94f, damage);
                    break;
                case MaterialClass.Masonry:
                    euler.x = localDirection.z * damage * 2f;
                    euler.z = -localDirection.x * damage * 2.5f;
                    scale.y = intactScale.y * Mathf.Lerp(1f, 0.94f, damage);
                    break;
                default:
                    euler.x = localDirection.z * damage * 6f;
                    euler.z = -localDirection.x * damage * 7f;
                    scale.y = intactScale.y * Mathf.Lerp(1f, 0.84f, damage);
                    break;
            }

            transform.localRotation = intactRotation * Quaternion.Euler(euler);
            transform.localScale = scale;
        }

        private void ApplyComponentStages(DamageStage previousStage)
        {
            if (!damagedComponentsApplied &&
                (int)previousStage < (int)DamageStage.Damaged &&
                (int)stage >= (int)DamageStage.Damaged)
            {
                damagedComponentsApplied = true;
                ApplyDamagedComponents();
            }

            if (!criticalComponentsApplied &&
                (int)previousStage < (int)DamageStage.Critical &&
                (int)stage >= (int)DamageStage.Critical)
            {
                criticalComponentsApplied = true;
                ApplyCriticalComponents();
            }
        }

        private void ApplyDamagedComponents()
        {
            Renderer[] renderers = GetComponentsInChildren<Renderer>(true);
            bool hidOneWindow = false;
            for (int i = 0; i < renderers.Length; i++)
            {
                Renderer renderer = renderers[i];
                if (renderer == null) continue;
                string lower = renderer.gameObject.name.ToLowerInvariant();
                if (!hidOneWindow && lower.Contains("window"))
                {
                    renderer.enabled = false;
                    hidOneWindow = true;
                }
            }

            Transform door = FindChildContaining("door");
            if (door != null)
            {
                door.localRotation *= Quaternion.Euler(0f, 12f, 0f);
            }
        }

        private void ApplyCriticalComponents()
        {
            Renderer[] renderers = GetComponentsInChildren<Renderer>(true);
            for (int i = 0; i < renderers.Length; i++)
            {
                Renderer renderer = renderers[i];
                if (renderer == null) continue;
                string lower = renderer.gameObject.name.ToLowerInvariant();
                if (lower.Contains("window")) renderer.enabled = false;
            }

            Vector3 localDirection = GetLocalImpactDirection();
            Transform roof = FindChildContaining("roof");
            if (roof != null)
            {
                roof.localPosition += localDirection * 0.65f + Vector3.up * 0.22f;
                roof.localRotation *= Quaternion.Euler(localDirection.z * 8f, 5f, -localDirection.x * 12f);
            }

            Transform crossarm = FindChildContaining("crossarm");
            if (crossarm != null)
            {
                crossarm.localRotation *= Quaternion.Euler(0f, 0f, -localDirection.x * 24f + 12f);
                crossarm.localPosition += localDirection * 0.35f;
            }

            Transform crown = FindChildContaining("crown");
            if (crown != null)
            {
                crown.localPosition += localDirection * 0.75f + Vector3.down * 0.35f;
                crown.localScale *= 0.82f;
            }
        }

        private Transform FindChildContaining(string token)
        {
            Transform[] children = GetComponentsInChildren<Transform>(true);
            for (int i = 0; i < children.Length; i++)
            {
                Transform child = children[i];
                if (child == transform) continue;
                if (child.gameObject.name.ToLowerInvariant().Contains(token)) return child;
            }
            return null;
        }

        private Vector3 GetLocalImpactDirection()
        {
            Vector3 direction = lastImpactDirectionWorld;
            if (transform.parent != null)
            {
                direction = transform.parent.InverseTransformDirection(direction);
            }
            direction.y = 0f;
            return direction.sqrMagnitude > 0.001f ? direction.normalized : Vector3.forward;
        }

        private static float DirectionToYaw(Vector3 direction)
        {
            return Mathf.Atan2(direction.x, direction.z) * Mathf.Rad2Deg;
        }

        private void Collapse(in DamageEvent damageEvent)
        {
            destroyed = true;
            stage = DamageStage.Destroyed;

            if (materialClass == MaterialClass.Crop)
            {
                if (body != null) body.isKinematic = true;
                Vector3 localDirection = GetLocalImpactDirection();
                Vector3 scale = new Vector3(intactScale.x * 1.12f, intactScale.y * 0.055f, intactScale.z * 1.32f);
                transform.localScale = scale;
                transform.localPosition = intactLocalPosition + Vector3.down * ((intactScale.y - scale.y) * 0.49f);
                transform.localRotation = intactRotation * Quaternion.Euler(0f, DirectionToYaw(localDirection) + 90f, 0f);
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
                Vector3 impulse = damageEvent.Impulse;
                if (materialClass == MaterialClass.Vegetation)
                {
                    impulse = Vector3.ClampMagnitude(impulse, 7f);
                    impulse.y = Mathf.Min(impulse.y, 1f);
                }
                body.AddForce(impulse + Vector3.up * 1.25f, ForceMode.Impulse);
                body.AddTorque(UnityEngine.Random.insideUnitSphere * 1.8f, ForceMode.Impulse);
            }
        }

        private void ApplyStructuralCollapsePose()
        {
            Vector3 scale = intactScale;
            Vector3 localDirection = GetLocalImpactDirection();
            Vector3 euler;
            switch (materialClass)
            {
                case MaterialClass.Glass:
                    scale = new Vector3(intactScale.x * 0.84f, intactScale.y * 0.1f, intactScale.z * 0.84f);
                    euler = new Vector3(localDirection.z * 5f, 7f, -localDirection.x * 11f);
                    break;
                case MaterialClass.Masonry:
                    scale.y = intactScale.y * 0.44f;
                    euler = new Vector3(localDirection.z * 3f, 4f, -localDirection.x * 5f);
                    break;
                case MaterialClass.Metal:
                case MaterialClass.Infrastructure:
                    scale.y = intactScale.y * 0.3f;
                    euler = new Vector3(localDirection.z * 6f, 12f, -localDirection.x * 14f);
                    break;
                default:
                    scale.y = intactScale.y * 0.28f;
                    euler = new Vector3(localDirection.z * 8f, 15f, -localDirection.x * 18f);
                    break;
            }

            transform.localScale = scale;
            transform.localRotation = intactRotation * Quaternion.Euler(euler);
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
