using SevereWeather.Input;
using UnityEngine;

namespace SevereWeather.Core
{
    [DefaultExecutionOrder(-2000)]
    public sealed class TornadoTacticalInputLock : MonoBehaviour
    {
        private StormInput input;

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        private static void Install()
        {
            if (FindFirstObjectByType<TornadoTacticalInputLock>() != null) return;
            new GameObject("Tornado Tactical Input Lock").AddComponent<TornadoTacticalInputLock>();
        }

        private void Update()
        {
            if (input == null)
            {
                input = FindFirstObjectByType<StormInput>();
                if (input == null) return;
            }

            // The first production slice is Tornado-only. Consume the legacy
            // switch action before GameBootstrap can replace the active storm.
            input.ConsumeSwitchStormPressed();
        }
    }
}
