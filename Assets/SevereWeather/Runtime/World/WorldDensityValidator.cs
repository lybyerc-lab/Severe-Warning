using System.Collections.Generic;
using SevereWeather.Damage;
using UnityEngine;

namespace SevereWeather.World
{
    public static class WorldDensityValidator
    {
        public static DensityReport Evaluate(float warningGapMeters = 55f)
        {
            DamageableStructure[] damageables = Object.FindObjectsByType<DamageableStructure>(FindObjectsSortMode.None);
            List<DamageableStructure> interactables = new List<DamageableStructure>(damageables.Length);
            int missingInteractionGeometry = 0;

            for (int i = 0; i < damageables.Length; i++)
            {
                Collider collider = damageables[i].GetComponentInChildren<Collider>();
                if (collider == null)
                {
                    missingInteractionGeometry++;
                }
                else
                {
                    interactables.Add(damageables[i]);
                }
            }

            if (interactables.Count < 2)
            {
                return new DensityReport(
                    damageables.Length,
                    interactables.Count,
                    missingInteractionGeometry,
                    0f,
                    0f,
                    true);
            }

            float maxNearest = 0f;
            float totalNearest = 0f;
            for (int i = 0; i < interactables.Count; i++)
            {
                float nearest = float.PositiveInfinity;
                Vector3 a = interactables[i].transform.position;
                for (int j = 0; j < interactables.Count; j++)
                {
                    if (i == j) continue;
                    float distance = Vector3.Distance(a, interactables[j].transform.position);
                    if (distance < nearest) nearest = distance;
                }

                maxNearest = Mathf.Max(maxNearest, nearest);
                totalNearest += nearest;
            }

            float meanNearest = totalNearest / interactables.Count;
            bool hasDeadGap = maxNearest > warningGapMeters || missingInteractionGeometry > 0;
            return new DensityReport(
                damageables.Length,
                interactables.Count,
                missingInteractionGeometry,
                meanNearest,
                maxNearest,
                hasDeadGap);
        }
    }

    public readonly struct DensityReport
    {
        public DensityReport(
            int targetCount,
            int interactableCount,
            int missingInteractionGeometry,
            float meanNearestMeters,
            float maxNearestMeters,
            bool hasDeadGap)
        {
            TargetCount = targetCount;
            InteractableCount = interactableCount;
            MissingInteractionGeometry = missingInteractionGeometry;
            MeanNearestMeters = meanNearestMeters;
            MaxNearestMeters = maxNearestMeters;
            HasDeadGap = hasDeadGap;
        }

        public DensityReport(int targetCount, float meanNearestMeters, float maxNearestMeters, bool hasDeadGap)
            : this(targetCount, targetCount, 0, meanNearestMeters, maxNearestMeters, hasDeadGap)
        {
        }

        public int TargetCount { get; }
        public int InteractableCount { get; }
        public int MissingInteractionGeometry { get; }
        public float MeanNearestMeters { get; }
        public float MaxNearestMeters { get; }
        public bool HasDeadGap { get; }

        public override string ToString()
        {
            return
                $"Targets: {TargetCount}, interactable: {InteractableCount}, " +
                $"missing colliders: {MissingInteractionGeometry}, mean nearest: {MeanNearestMeters:0.0} m, " +
                $"max nearest: {MaxNearestMeters:0.0} m, dead gap: {HasDeadGap}";
        }
    }
}
