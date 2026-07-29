using SevereWeather.Damage;
using UnityEngine;

namespace SevereWeather.Storms
{
    public sealed class DerechoController : StormControllerBase
    {
        [Header("Derecho Parameters")]
        [SerializeField] private float baseSweepRadius = 45f;
        [SerializeField] private float windWallDamage = 18f;
        [SerializeField] private float microburstRadius = 90f;
        [SerializeField] private float microburstDamage = 45f;
        [SerializeField] private float dustSurgeRadius = 60f;
        [SerializeField] private float microburstCooldown = 3.2f;
        [SerializeField] private float dustSurgeCooldown = 2.6f;

        private bool isSweeping;
        private float microburstTimer;
        private float dustSurgeTimer;

        public override StormKind Kind => StormKind.Derecho;
        public override float InfluenceRadius => isSweeping ? baseSweepRadius * 1.6f : baseSweepRadius;

        protected override void Awake()
        {
            base.Awake();
            moveSpeed = 20f;
            acceleration = 18f;
            referenceWindSpeed = 62f;
        }

        protected override void RegenerateResources(float dt)
        {
            base.RegenerateResources(dt);
            microburstTimer = Mathf.Max(0f, microburstTimer - dt);
            dustSurgeTimer = Mathf.Max(0f, dustSurgeTimer - dt);
        }

        protected override void HandleAbilities(float dt)
        {
            if (stormInput == null) return;

            bool secondaryPressed = stormInput.ConsumeSecondaryPressed();
            bool tertiaryPressed = stormInput.ConsumeTertiaryPressed();

            if (stormInput.PrimaryHeld && power > 0.5f)
            {
                isSweeping = true;
                power = Mathf.Max(0f, power - 15f * dt);
                ExecuteWindWallSweep(dt);
            }
            else
            {
                isSweeping = false;
            }

            if (secondaryPressed && microburstTimer <= 0f && power >= 30f)
            {
                power -= 30f;
                microburstTimer = microburstCooldown;
                ExecuteMicroburstBlast();
            }

            if (tertiaryPressed && dustSurgeTimer <= 0f && power >= 25f)
            {
                power -= 25f;
                dustSurgeTimer = dustSurgeCooldown;
                ExecuteDustSurge();
            }
        }

        protected override void ApplyPassiveField(float dt)
        {
            Vector3 center = transform.position;
            int count = Query(center, baseSweepRadius);
            int hitCount = 0;

            for (int i = 0; i < count; i++)
            {
                if (TryGetDamageable(overlapBuffer[i], out DamageableStructure damageable))
                {
                    Vector3 impulse = transform.forward * referenceWindSpeed * 0.4f;
                    ApplyDamage(
                        damageable,
                        DamageType.DerechoWind,
                        4f * dt,
                        overlapBuffer[i].transform.position,
                        impulse);
                    hitCount++;
                }
            }

            if (hitCount > 0 && !HasRecentAction)
            {
                ReportAction("PASSIVE DERECHO LINE", hitCount);
            }
        }

        private void ExecuteWindWallSweep(float dt)
        {
            Vector3 center = transform.position;
            int count = Query(center, InfluenceRadius);
            int hitCount = 0;

            Vector3 sweepDirection = transform.forward;
            if (sweepDirection.sqrMagnitude < 0.01f)
            {
                sweepDirection = Vector3.forward;
            }

            for (int i = 0; i < count; i++)
            {
                if (TryGetDamageable(overlapBuffer[i], out DamageableStructure damageable))
                {
                    Vector3 impulse = sweepDirection * referenceWindSpeed * 1.8f;
                    ApplyDamage(
                        damageable,
                        DamageType.DerechoWind,
                        windWallDamage * dt,
                        overlapBuffer[i].transform.position,
                        impulse);
                    hitCount++;
                }
            }

            ReportAction(hitCount > 0 ? "WIND WALL SWEEP" : "WIND WALL - NO TARGETS", hitCount, 0.7f);
        }

        private void ExecuteMicroburstBlast()
        {
            Vector3 center = transform.position;
            int count = Query(center, microburstRadius);
            int hitCount = 0;

            for (int i = 0; i < count; i++)
            {
                if (TryGetDamageable(overlapBuffer[i], out DamageableStructure damageable))
                {
                    Vector3 outward = overlapBuffer[i].transform.position - center;
                    outward.y = 0f;
                    if (outward.sqrMagnitude < 0.01f)
                    {
                        outward = transform.forward;
                    }
                    else
                    {
                        outward.Normalize();
                    }

                    Vector3 impulse = (outward + Vector3.up * 0.2f) * referenceWindSpeed * 3f;
                    ApplyDamage(
                        damageable,
                        DamageType.DerechoWind,
                        microburstDamage,
                        overlapBuffer[i].transform.position,
                        impulse);
                    hitCount++;
                }
            }

            ReportAction(hitCount > 0 ? "MICROBURST BLAST" : "MICROBURST - NO TARGETS", hitCount);
        }

        private void ExecuteDustSurge()
        {
            int count = Query(transform.position, dustSurgeRadius);
            ReportAction(count > 0 ? "DUST SURGE CLOUD" : "DUST SURGE - NO TARGETS", count);
        }

        public override Vector3 SampleWind(Vector3 worldPosition)
        {
            Vector3 offset = worldPosition - transform.position;
            offset.y = 0f;
            if (offset.magnitude > InfluenceRadius) return Vector3.zero;

            Vector3 forwardWind = transform.forward * referenceWindSpeed;
            if (isSweeping)
            {
                forwardWind *= 1.8f;
            }

            return forwardWind;
        }
    }
}
