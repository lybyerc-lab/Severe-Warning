using SevereWeather.Damage;
using UnityEngine;

namespace SevereWeather.Storms
{
    public sealed class TornadoController : StormControllerBase
    {
        [SerializeField] private float condensationRadius = 8f;
        [SerializeField] private float passiveDamageRadius = 18f;
        [SerializeField] private float suctionRadius = 30f;
        [SerializeField] private float gustCooldown = 2.8f;
        [SerializeField] private float lightningCooldown = 2.2f;

        private float gustTimer;
        private float lightningTimer;

        public override StormKind Kind => StormKind.Tornado;
        public override float InfluenceRadius => suctionRadius;

        protected override void Awake()
        {
            base.Awake();
            moveSpeed = 18f;
            acceleration = 34f;
            referenceWindSpeed = 62f;
        }

        protected override void RegenerateResources(float dt)
        {
            base.RegenerateResources(dt);
            gustTimer = Mathf.Max(0f, gustTimer - dt);
            lightningTimer = Mathf.Max(0f, lightningTimer - dt);
        }

        protected override void ApplyPassiveField(float dt)
        {
            int count = Query(transform.position, passiveDamageRadius);
            for (int i = 0; i < count; i++)
            {
                Collider collider = overlapBuffer[i];
                if (!TryGetDamageable(collider, out DamageableStructure damageable)) continue;

                Vector3 offset = collider.bounds.center - transform.position;
                float distance01 = Mathf.Clamp01(offset.magnitude / passiveDamageRadius);
                float amount = Mathf.Lerp(8f, 1.25f, distance01) * dt;
                Vector3 wind = SampleWind(collider.bounds.center);
                ApplyDamage(damageable, DamageType.Wind, amount, collider.bounds.center, wind.normalized * amount * 0.07f);
            }
        }

        protected override void HandleAbilities(float dt)
        {
            if (stormInput == null) return;

            if (stormInput.PrimaryHeld && power > 0.5f)
            {
                power = Mathf.Max(0f, power - 3f * dt);
                ApplySuction(dt);
            }

            if (stormInput.SecondaryPressed && gustTimer <= 0f && power >= 14f)
            {
                power -= 14f;
                gustTimer = gustCooldown;
                ApplyGust();
            }

            if (stormInput.TertiaryPressed && lightningTimer <= 0f && power >= 20f)
            {
                power -= 20f;
                lightningTimer = lightningCooldown;
                ApplyLightningChain();
            }
        }

        private void ApplySuction(float dt)
        {
            int count = Query(transform.position, suctionRadius);
            for (int i = 0; i < count; i++)
            {
                Collider collider = overlapBuffer[i];
                if (!TryGetDamageable(collider, out DamageableStructure damageable)) continue;

                Vector3 offset = transform.position - collider.bounds.center;
                float distance = Mathf.Max(1f, offset.magnitude);
                float strength = 1f - Mathf.Clamp01(distance / suctionRadius);
                Vector3 force = offset.normalized * (7f + 22f * strength) + Vector3.up * (2f + 10f * strength);
                ApplyDamage(damageable, DamageType.Suction, (8f + 30f * strength) * dt, collider.bounds.center, force * dt);
            }
        }

        private void ApplyGust()
        {
            const float radius = 24f;
            int count = Query(transform.position, radius);
            for (int i = 0; i < count; i++)
            {
                Collider collider = overlapBuffer[i];
                if (!TryGetDamageable(collider, out DamageableStructure damageable)) continue;

                Vector3 offset = collider.bounds.center - transform.position;
                float strength = 1f - Mathf.Clamp01(offset.magnitude / radius);
                Vector3 impulse = offset.normalized * Mathf.Lerp(3f, 18f, strength) + Vector3.up * 2f;
                ApplyDamage(damageable, DamageType.Wind, Mathf.Lerp(10f, 34f, strength), collider.bounds.center, impulse);
            }
        }

        private void ApplyLightningChain()
        {
            ConductiveNode first = FindBestConductiveTarget(transform.position, 62f, null);
            if (first == null) return;

            ConductiveNode current = first;
            ConductiveNode previous = null;
            for (int chain = 0; chain < 4 && current != null; chain++)
            {
                DamageableStructure damageable = current.GetComponentInParent<DamageableStructure>();
                if (damageable != null)
                {
                    ApplyDamage(damageable, DamageType.Electrical, 95f - chain * 15f, current.transform.position, Vector3.up * 1.5f);
                }

                ConductiveNode next = FindBestConductiveTarget(current.transform.position, current.ChainRadius, previous);
                previous = current;
                current = next;
            }
        }

        private ConductiveNode FindBestConductiveTarget(Vector3 center, float radius, ConductiveNode excluded)
        {
            int count = Query(center, radius);
            ConductiveNode best = null;
            float bestScore = float.NegativeInfinity;
            for (int i = 0; i < count; i++)
            {
                ConductiveNode node = overlapBuffer[i].GetComponentInParent<ConductiveNode>();
                if (node == null || node == excluded) continue;

                float distance = Vector3.Distance(center, node.transform.position);
                float score = node.Priority * 20f - distance;
                if (score > bestScore)
                {
                    bestScore = score;
                    best = node;
                }
            }

            return best;
        }

        public override Vector3 SampleWind(Vector3 worldPosition)
        {
            Vector3 offset = worldPosition - transform.position;
            offset.y = 0f;
            float distance = Mathf.Max(0.5f, offset.magnitude);
            float influence = Mathf.Clamp01(1f - distance / suctionRadius);
            Vector3 tangent = Vector3.Cross(Vector3.up, offset.normalized);
            Vector3 inward = -offset.normalized;
            return (tangent * 0.74f + inward * 0.46f + Vector3.up * 0.12f) * referenceWindSpeed * influence;
        }

        public void ConfigureVisualScale(float radius)
        {
            condensationRadius = radius;
        }
    }
}
