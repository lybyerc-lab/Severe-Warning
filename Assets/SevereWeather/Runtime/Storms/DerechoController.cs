using SevereWeather.Damage;
using UnityEngine;

namespace SevereWeather.Storms
{
    public class DerechoController : StormControllerBase
    {
        [Header("Derecho Parameters")]
        [SerializeField] private float baseSweepRadius = 45f;
        [SerializeField] private float windWallDamage = 18f;
        [SerializeField] private float microburstRadius = 90f;
        [SerializeField] private float microburstDamage = 45f;
        [SerializeField] private float dustSurgeRadius = 60f;

        private bool isSweeping;
        private bool isMicrobursting;
        private bool isDustSurging;
        private float abilityTimer;

        public override StormKind Kind => StormKind.Derecho;
        public override float InfluenceRadius => isSweeping ? baseSweepRadius * 1.6f : baseSweepRadius;

        protected override void HandleAbilities(float dt)
        {
            if (stormInput == null) return;

            if (stormInput.PrimaryActionHold && power >= 20f)
            {
                isSweeping = true;
                power -= 15f * dt;
                ExecuteWindWallSweep(dt);
            }
            else
            {
                isSweeping = false;
            }

            if (stormInput.SecondaryActionTap && power >= 30f)
            {
                power -= 30f;
                ExecuteMicroburstBlast();
            }

            if (stormInput.TertiaryActionTap && power >= 25f)
            {
                power -= 25f;
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
                    ApplyDamage(damageable, DamageType.DerechoWind, 4f * dt, overlapBuffer[i].transform.position, impulse);
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
            float radius = InfluenceRadius;
            int count = Query(center, radius);
            int hitCount = 0;

            Vector3 sweepDirection = transform.forward;
            if (sweepDirection.sqrMagnitude < 0.01f) sweepDirection = Vector3.forward;

            for (int i = 0; i < count; i++)
            {
                if (TryGetDamageable(overlapBuffer[i], out DamageableStructure damageable))
                {
                    Vector3 impulse = sweepDirection * referenceWindSpeed * 1.8f;
                    ApplyDamage(damageable, DamageType.DerechoWind, windWallDamage * dt, overlapBuffer[i].transform.position, impulse);
                    hitCount++;
                }
            }

            ReportAction("WIND WALL SWEEP", hitCount);
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
                    Vector3 outward = (overlapBuffer[i].transform.position - center).normalized;
                    outward.y = 0.2f;
                    Vector3 impulse = outward * referenceWindSpeed * 3.0f;
                    ApplyDamage(damageable, DamageType.DerechoWind, microburstDamage, overlapBuffer[i].transform.position, impulse);
                    hitCount++;
                }
            }

            ReportAction("MICROBURST BLAST", hitCount);
        }

        private void ExecuteDustSurge()
        {
            Vector3 center = transform.position;
            int count = Query(center, dustSurgeRadius);
            ReportAction("DUST SURGE CLOUD", count);
        }

        public override Vector3 SampleWind(Vector3 worldPosition)
        {
            Vector3 diff = worldPosition - transform.position;
            diff.y = 0f;
            if (diff.magnitude > InfluenceRadius) return Vector3.zero;

            Vector3 forwardWind = transform.forward * referenceWindSpeed;
            if (isSweeping) forwardWind *= 1.8f;
            return forwardWind;
        }
    }
}
