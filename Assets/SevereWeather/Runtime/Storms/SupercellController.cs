using System.Collections.Generic;
using SevereWeather.Damage;
using SevereWeather.Presentation;
using UnityEngine;

namespace SevereWeather.Storms
{
    public sealed class SupercellController : StormControllerBase
    {
        [SerializeField] private float stormRadius = 52f;
        [SerializeField] private float hailHalfWidth = 13f;
        [SerializeField] private float hailLength = 46f;
        [SerializeField] private float gustFrontRange = 58f;
        [SerializeField] private float gustFrontHalfAngle = 42f;
        [SerializeField] private float charge = 35f;

        private readonly HashSet<ConductiveNode> chainVisited = new HashSet<ConductiveNode>(16);
        private float gustCooldown;
        private float lightningCooldown;
        private float hailFeedbackTimer;
        private Vector3 velocitySmoothing;

        public override StormKind Kind => StormKind.Supercell;
        public override float InfluenceRadius => stormRadius;
        public float ElectricalCharge => charge;

        protected override void Awake()
        {
            base.Awake();
            moveSpeed = 16.5f;
            acceleration = 12f;
            referenceWindSpeed = 52f;
        }

        protected override void MoveStorm(Vector2 inputVector, float dt)
        {
            Vector3 desired = GetCameraRelativeDirection(inputVector) * moveSpeed;
            planarVelocity = Vector3.SmoothDamp(
                planarVelocity,
                desired,
                ref velocitySmoothing,
                0.48f,
                moveSpeed,
                dt);
            Vector3 displacement = planarVelocity * dt;
            body.MovePosition(body.position + displacement);
            RecordDisplacement(displacement);

            if (planarVelocity.sqrMagnitude > 0.1f)
            {
                transform.rotation = Quaternion.Slerp(
                    transform.rotation,
                    Quaternion.LookRotation(planarVelocity.normalized, Vector3.up),
                    1.25f * dt);
            }
        }

        protected override void RegenerateResources(float dt)
        {
            power = Mathf.Min(100f, power + 4.1f * dt);
            stability = Mathf.Min(100f, stability + 0.8f * dt);
            charge = Mathf.Min(100f, charge + (2.2f + stability * 0.012f) * dt);
            gustCooldown = Mathf.Max(0f, gustCooldown - dt);
            lightningCooldown = Mathf.Max(0f, lightningCooldown - dt);
            hailFeedbackTimer = Mathf.Max(0f, hailFeedbackTimer - dt);
        }

        protected override void ApplyPassiveField(float dt)
        {
            int count = Query(transform.position, stormRadius);
            for (int i = 0; i < count; i++)
            {
                Collider collider = overlapBuffer[i];
                if (!TryGetDamageable(collider, out DamageableStructure damageable)) continue;

                Vector3 offset = collider.bounds.center - transform.position;
                float distance01 = Mathf.Clamp01(offset.magnitude / stormRadius);
                float amount = Mathf.Lerp(1.4f, 0.2f, distance01) * dt;
                Vector3 wind = SampleWind(collider.bounds.center);
                ApplyDamage(damageable, DamageType.Wind, amount, collider.bounds.center, wind.normalized * amount * 0.03f);
            }
        }

        protected override void HandleAbilities(float dt)
        {
            if (stormInput == null) return;

            bool secondaryPressed = stormInput.ConsumeSecondaryPressed();
            bool tertiaryPressed = stormInput.ConsumeTertiaryPressed();

            if (stormInput.PrimaryHeld && power > 0.35f)
            {
                power = Mathf.Max(0f, power - 2.1f * dt);
                int targets = PaintHailSwath(dt);
                if (hailFeedbackTimer <= 0f)
                {
                    hailFeedbackTimer = 0.3f;
                    Vector3 heading = GetHeading();
                    Vector3 center = transform.position - heading * hailLength * 0.22f;
                    StormActionVfx.Swath(
                        center,
                        heading,
                        hailHalfWidth,
                        hailLength,
                        new Color(0.58f, 0.82f, 1f, 0.8f));
                    ReportAction(targets > 0 ? "HAIL SWATH" : "HAIL - NO TARGETS", targets, 0.8f);
                }
            }

            if (secondaryPressed && gustCooldown <= 0f && power >= 18f)
            {
                power -= 18f;
                gustCooldown = 4.5f;
                int targets = IntensifyGustFront();
                StormActionVfx.Arc(
                    transform.position,
                    GetHeading(),
                    gustFrontRange,
                    gustFrontHalfAngle,
                    new Color(1f, 0.72f, 0.25f, 0.92f),
                    0.65f,
                    0.9f);
                ReportAction(targets > 0 ? "GUST FRONT" : "GUST FRONT - NO TARGETS", targets);
            }

            if (tertiaryPressed && lightningCooldown <= 0f && charge >= 28f)
            {
                int chainCount = ReleaseElectricalNetwork();
                if (chainCount > 0)
                {
                    charge -= 28f;
                    lightningCooldown = 2.4f;
                    ReportAction("ELECTRICAL NETWORK", chainCount, 1.4f);
                }
                else
                {
                    ReportAction("NO CONDUCTIVE TARGET", 0, 1.5f);
                }
            }
        }

        private int PaintHailSwath(float dt)
        {
            Vector3 heading = GetHeading();
            Vector3 center = transform.position - heading * hailLength * 0.22f + Vector3.up * 5f;
            Quaternion orientation = Quaternion.LookRotation(heading, Vector3.up);
            Vector3 halfExtents = new Vector3(hailHalfWidth, 10f, hailLength * 0.5f);
            int count = Physics.OverlapBoxNonAlloc(
                center,
                halfExtents,
                overlapBuffer,
                orientation,
                ~0,
                QueryTriggerInteraction.Ignore);

            int targets = 0;
            for (int i = 0; i < count; i++)
            {
                Collider collider = overlapBuffer[i];
                if (!TryGetDamageable(collider, out DamageableStructure damageable)) continue;

                float materialScale = damageable.MaterialClass == MaterialClass.Glass ||
                                      damageable.MaterialClass == MaterialClass.Crop ||
                                      damageable.MaterialClass == MaterialClass.Vehicle
                    ? 1.45f
                    : 1f;
                Vector3 impulse = Vector3.down * 0.35f + heading * 0.08f;
                ApplyDamage(
                    damageable,
                    DamageType.Hail,
                    11f * materialScale * dt,
                    collider.bounds.center,
                    impulse * dt);
                targets++;
            }

            return targets;
        }

        private int IntensifyGustFront()
        {
            Vector3 heading = GetHeading();
            Vector3 origin = transform.position + heading * 8f;
            int count = Query(origin, gustFrontRange);
            float cosineThreshold = Mathf.Cos(gustFrontHalfAngle * Mathf.Deg2Rad);
            int targets = 0;

            for (int i = 0; i < count; i++)
            {
                Collider collider = overlapBuffer[i];
                if (!TryGetDamageable(collider, out DamageableStructure damageable)) continue;

                Vector3 offset = collider.bounds.center - origin;
                offset.y = 0f;
                float distance = offset.magnitude;
                if (distance < 0.1f) continue;

                float facing = Vector3.Dot(heading, offset.normalized);
                if (facing < cosineThreshold) continue;

                float strength = (1f - Mathf.Clamp01(distance / gustFrontRange)) *
                                 Mathf.InverseLerp(cosineThreshold, 1f, facing);
                Vector3 impulse = heading * Mathf.Lerp(3f, 16f, strength) + Vector3.up * 1.5f;
                ApplyDamage(
                    damageable,
                    DamageType.Wind,
                    Mathf.Lerp(8f, 31f, strength),
                    collider.bounds.center,
                    impulse);
                targets++;
            }

            return targets;
        }

        private int ReleaseElectricalNetwork()
        {
            ConductiveNode anchor = FindConductiveAnchor();
            if (anchor == null) return 0;

            chainVisited.Clear();
            ConductiveNode current = anchor;
            Vector3 previousPosition = transform.position + Vector3.up * 18f;
            int chainCount = 0;
            for (int chain = 0; chain < 6 && current != null; chain++)
            {
                chainVisited.Add(current);
                DamageableStructure damageable = current.GetComponentInParent<DamageableStructure>();
                if (damageable != null)
                {
                    ApplyDamage(
                        damageable,
                        DamageType.Electrical,
                        Mathf.Max(38f, 108f - chain * 13f),
                        current.transform.position,
                        Vector3.up * 1.7f);
                }

                StormActionVfx.Bolt(
                    previousPosition,
                    current.transform.position + Vector3.up * 1.5f,
                    new Color(0.5f, 0.82f, 1f, 1f));
                previousPosition = current.transform.position + Vector3.up * 1.5f;
                chainCount++;
                current = FindNextConductive(current);
            }

            return chainCount;
        }

        private ConductiveNode FindConductiveAnchor()
        {
            Vector3 heading = GetHeading();
            int count = Query(transform.position, 92f);
            ConductiveNode best = null;
            float bestScore = float.NegativeInfinity;

            for (int i = 0; i < count; i++)
            {
                ConductiveNode node = overlapBuffer[i].GetComponentInParent<ConductiveNode>();
                if (node == null) continue;

                Vector3 offset = node.transform.position - transform.position;
                float forward = offset.sqrMagnitude > 0.001f ? Vector3.Dot(heading, offset.normalized) : 0f;
                float score = node.Priority * 35f + forward * 24f - offset.magnitude;
                if (score > bestScore)
                {
                    bestScore = score;
                    best = node;
                }
            }

            return best;
        }

        private ConductiveNode FindNextConductive(ConductiveNode current)
        {
            int count = Query(current.transform.position, current.ChainRadius);
            ConductiveNode best = null;
            float bestScore = float.NegativeInfinity;

            for (int i = 0; i < count; i++)
            {
                ConductiveNode node = overlapBuffer[i].GetComponentInParent<ConductiveNode>();
                if (node == null || chainVisited.Contains(node)) continue;

                float distance = Vector3.Distance(current.transform.position, node.transform.position);
                float score = node.Priority * 28f - distance;
                if (score > bestScore)
                {
                    bestScore = score;
                    best = node;
                }
            }

            return best;
        }

        private Vector3 GetHeading()
        {
            if (planarVelocity.sqrMagnitude > 0.25f)
            {
                return planarVelocity.normalized;
            }

            Vector3 forward = transform.forward;
            forward.y = 0f;
            return forward.sqrMagnitude > 0.01f ? forward.normalized : Vector3.forward;
        }

        public override Vector3 SampleWind(Vector3 worldPosition)
        {
            Vector3 offset = worldPosition - transform.position;
            offset.y = 0f;
            float distance = Mathf.Max(0.5f, offset.magnitude);
            float influence = Mathf.Clamp01(1f - distance / stormRadius);
            Vector3 rotation = Vector3.Cross(Vector3.up, offset.normalized) * 0.45f;
            Vector3 inflow = -offset.normalized * 0.32f;
            Vector3 translation = GetHeading() * 0.65f;
            return (rotation + inflow + translation) * referenceWindSpeed * influence;
        }
    }
}
