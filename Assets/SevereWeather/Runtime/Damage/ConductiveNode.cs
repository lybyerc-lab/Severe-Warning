using UnityEngine;

namespace SevereWeather.Damage
{
    [DisallowMultipleComponent]
    public sealed class ConductiveNode : MonoBehaviour
    {
        [SerializeField] private float chainRadius = 24f;
        [SerializeField] private int priority = 1;

        public float ChainRadius => chainRadius;
        public int Priority => priority;

        public void Configure(float radius, int nodePriority)
        {
            chainRadius = Mathf.Max(1f, radius);
            priority = nodePriority;
        }
    }
}
