using UnityEngine;

namespace SevereWeather.Damage
{
    public readonly struct DamageEvent
    {
        public DamageEvent(
            DamageType type,
            float amount,
            Vector3 worldPoint,
            Vector3 impulse,
            GameObject source)
        {
            Type = type;
            Amount = amount;
            WorldPoint = worldPoint;
            Impulse = impulse;
            Source = source;
        }

        public DamageType Type { get; }
        public float Amount { get; }
        public Vector3 WorldPoint { get; }
        public Vector3 Impulse { get; }
        public GameObject Source { get; }
    }
}
