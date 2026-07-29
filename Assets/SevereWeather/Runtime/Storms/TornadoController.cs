using System.Collections.Generic;
using SevereWeather.Damage;
using SevereWeather.Presentation;
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

        private readonly HashSet<ConductiveNode> lightningVisited = new HashSet<ConductiveNode>(16);
        private float gustTimer;
        private float lightningTimer;
        private float suctionFeedbackTimer;

        public override StormKind Kind => StormKind.Tornado;
        public override float InfluenceRadius => suctionRadius;

        protected override void Awake()
        {
            base.Awake();
            moveSpeed = 28f;
            acceleration = 62f;
            referenceWindSpeed = 68f;
        }

        protected override void RegenerateResources(float dt)
        {
            base.RegenerateResources(dt);
            gustTimer = Mathf.Max(0f, gustTimer - dt);
            lightningTimer = Mathf.Max(0f, lightningTimer - dt);
            suctionFeedbackTimer = Mathf.Max(0f, suctionFeedbackTimer - dt);
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

            bool secondaryPressed = stormInput.ConsumeSecondaryPressed();
            bool tertiaryPressed = stormInput.ConsumeTertiaryPressed();

            if (stormInput.PrimaryHeld && power > 0.5f)
            {
                power = Mathf.Max(0f, power - 3f * dt);
                int targets = ApplySuction(dt);
                if (suctionFeedbackTimer <= 0f)
                {
                    suctionFeedbackTimer = 0.24f;
                    StormActionVfx.Ring(
                        transform.position,
                        suctionRadius,
                        new Color(0.68f, 0.86f, 1f, 0.72f),
                        0.42f,
                        0.6f);
                    ReportAction(targets > 0 ? "SUCTION" : "SUCTION - NO TARGETS", targets, 0.7f);
                }
            }

            if (secondaryPressed && gustTimer <= 0f && power >= 14f)
            {
                power -= 14f;
                gustTimer = gustCooldown;
                int targets = ApplyGust();
                StormActionVfx.Ring(
                    transform.position,
                    24f,
                    new Color(1f, 0.72f, 0.24f, 0.92f),
                    0.55f,
                    1f);
                ReportAction(targets > 0 ? "GUST" : "GUST - NO TARGETS", targets);
            }

            if (tertiaryPressed && lightningTimer <= 0f && power >= 20f)
            {
                int chainCount = ApplyLightningChain();
                if (chainCount > 0)
                {
                    power -= 20f;
                    lightningTimer = lightningCooldown;
                    ReportAction("LIGHTNING CHAIN", chainCount, 1.4f);
                }
                else
                {
                    ReportAction("NO CONDUCTIVE TARGET", 0, 1.5f);
                }
            }
        }

        private int ApplySuction(float dt)
        {
            int count = Query(transform.position, suctionRadius);
            int targets = 0;
            for (int i = 0; i < count; i++)
            {
                Collider collider = overlapBuffer[i];
                if (!TryGetDamageable(collider, out DamageableStructure damageable)) continue;

                Vector3 offset = transform.position - collider.bounds.center;
                float distance = Mathf.Max(1f, offset.magnitude);
                float strength = 1f - Mathf.Clamp01(distance / suctionRadius);
                Vector3 force = offset.normalized * (7f + 22f * strength) + Vector3.up * (2f + 10f * strength);
                ApplyDamage(damageable, DamageType.Suction, (8f + 30f * strength) * dt, collider.bounds.center, force * dt);
                targets++;
            }
            return targets;
        }

        private int ApplyGust()
        {
            const float radius = 48f;
            int count = Query(transform.position, radius);
            int targets = 0;
            for (int i = 0; i < count; i++)
            {
                Collider collider = overlapBuffer[i];
                if (!TryGetDamageable(collider, out DamageableStructure damageable)) continue;

                Vector3 offset = collider.bounds.center - transform.position;
                float strength = 1f - Mathf.Clamp01(offset.magnitude / radius);
                Vector3 impulse = offset.normalized * Mathf.Lerp(8f, 32f, strength) + Vector3.up * 4f;
                ApplyDamage(damageable, DamageType.Wind, Mathf.Lerp(15f, 50f, strength), collider.bounds.center, impulse);
                targets++;
            }
            return targets;
        }

        private int ApplyLightningChain()
        {
            lightningVisited.Clear();
            ConductiveNode current = FindBestConductiveTarget(transform.position, 62f);
            if (current == null) return 0;

            Vector3 previousPosition = transform.position + Vector3.up * 10f;
            int chainCount = 0;
            for (int chain = 0; chain < 4 && current != null; chain++)
            {
                lightningVisited.Add(current);
                DamageableStructure damageable = current.GetComponentInParent<DamageableStructure>();
                if (damageable != null)
                {
                    ApplyDamage(damageable, DamageType.Electrical, 95f - chain * 15f, current.transform.position, Vector3.up * 1.5f);
                }

                StormActionVfx.Bolt(
                    previousPosition,
                    current.transform.position + Vector3.up * 1.5f,
                    new Color(0.58f, 0.86f, 1f, 1f));
                previousPosition = current.transform.position + Vector3.up * 1.5f;
                chainCount++;
                current = FindBestConductiveTarget(current.transform.position, current.ChainRadius);
            }

            return chainCount;
        }

        private ConductiveNode FindBestConductiveTarget(Vector3 center, float radius)
        {
            int count = Query(center, radius);
            ConductiveNode best = null;
            float bestScore = float.NegativeInfinity;
            for (int i = 0; i < count; i++)
            {
                ConductiveNode node = overlapBuffer[i].GetComponentInParent<ConductiveNode>();
                if (node == null || lightningVisited.Contains(node)) continue;

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
