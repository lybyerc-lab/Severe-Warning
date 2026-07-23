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
            if (damageables.Length < 2)
            {
                return new DensityReport(damageables.Length, 0f, 0f, true);
            }

            float maxNearest = 0f;
            float totalNearest = 0f;
            for (int i = 0; i < damageables.Length; i++)
            {
                float nearest = float.PositiveInfinity;
                Vector3 a = damageables[i].transform.position;
                for (int j = 0; j < damageables.Length; j++)
                {
                    if (i == j) continue;
                    float distance = Vector3.Distance(a, damageables[j].transform.position);
                    if (distance < nearest) nearest = distance;
                }

                maxNearest = Mathf.Max(maxNearest, nearest);
                totalNearest += nearest;
            }

            float meanNearest = totalNearest / damageables.Length;
            bool hasDeadGap = maxNearest > warningGapMeters;
            return new DensityReport(damageables.Length, meanNearest, maxNearest, hasDeadGap);
        }
    }

    public readonly struct DensityReport
    {
        public DensityReport(int targetCount, float meanNearestMeters, float maxNearestMeters, bool hasDeadGap)
        {
            TargetCount = targetCount;
            MeanNearestMeters = meanNearestMeters;
            MaxNearestMeters = maxNearestMeters;
            HasDeadGap = hasDeadGap;
        }

        public int TargetCount { get; }
        public float MeanNearestMeters { get; }
        public float MaxNearestMeters { get; }
        public bool HasDeadGap { get; }

        public override string ToString()
        {
            return $"Targets: {TargetCount}, mean nearest: {MeanNearestMeters:0.0} m, max nearest: {MaxNearestMeters:0.0} m, dead gap: {HasDeadGap}";
        }
    }
}
