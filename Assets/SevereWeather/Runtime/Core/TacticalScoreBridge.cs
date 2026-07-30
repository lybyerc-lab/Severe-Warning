using UnityEngine;

namespace SevereWeather.Core
{
    public sealed class TacticalScoreBridge : MonoBehaviour
    {
        private TornadoTacticalDirector director;
        private int lastScore;

        public void Configure(TornadoTacticalDirector runDirector)
        {
            director = runDirector;
            lastScore = EFProgressionManager.Instance != null ? EFProgressionManager.Instance.DestructionScore : 0;
        }

        private void Update()
        {
            if (director == null || EFProgressionManager.Instance == null) return;
            int current = EFProgressionManager.Instance.DestructionScore;
            int delta = current - lastScore;
            lastScore = current;
            if (delta <= 0) return;

            float estimatedDamage = delta / 0.4f;
            director.RecordImpact(estimatedDamage, delta >= 8, delta >= 28, "STRUCTURE");
        }
    }
}
