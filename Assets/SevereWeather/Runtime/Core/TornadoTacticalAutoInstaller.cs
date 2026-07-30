using System.Collections;
using SevereWeather.CameraSystem;
using SevereWeather.Input;
using SevereWeather.Storms;
using SevereWeather.UI;
using SevereWeather.World;
using UnityEngine;

namespace SevereWeather.Core
{
    [DefaultExecutionOrder(-2000)]
    public sealed class TornadoTacticalAutoInstaller : MonoBehaviour
    {
        private StormInput input;
        private bool installed;

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        private static void InstallRoot()
        {
            if (Object.FindFirstObjectByType<TornadoTacticalAutoInstaller>() != null) return;
            GameObject root = new GameObject("Tornado Tactical Runtime");
            DontDestroyOnLoad(root);
            root.AddComponent<TornadoTacticalAutoInstaller>();
        }

        private IEnumerator Start()
        {
            for (int attempt = 0; attempt < 120 && !installed; attempt++)
            {
                TryInstall();
                if (!installed) yield return null;
            }
        }

        private void Update()
        {
            if (input != null)
            {
                input.ConsumeSwitchStormPressed();
            }
        }

        private void TryInstall()
        {
            input = Object.FindFirstObjectByType<StormInput>();
            TornadoController tornado = Object.FindFirstObjectByType<TornadoController>();
            HybridStormCamera legacyCamera = Object.FindFirstObjectByType<HybridStormCamera>();
            if (input == null || tornado == null || legacyCamera == null) return;

            StormDebugHud debugHud = Object.FindFirstObjectByType<StormDebugHud>();
            if (debugHud != null) debugHud.enabled = false;

            TacticalCameraOverride tacticalCamera = legacyCamera.GetComponent<TacticalCameraOverride>();
            if (tacticalCamera == null)
            {
                tacticalCamera = legacyCamera.gameObject.AddComponent<TacticalCameraOverride>();
            }
            tacticalCamera.Configure(tornado);
            legacyCamera.enabled = false;

            if (EFProgressionManager.Instance == null)
            {
                gameObject.AddComponent<EFProgressionManager>();
            }

            TornadoTacticalDirector director = GetComponent<TornadoTacticalDirector>();
            if (director == null) director = gameObject.AddComponent<TornadoTacticalDirector>();
            director.Configure(input, tornado, legacyCamera);

            TacticalScoreBridge bridge = GetComponent<TacticalScoreBridge>();
            if (bridge == null) bridge = gameObject.AddComponent<TacticalScoreBridge>();
            bridge.Configure(director);

            TacticalTestDistrictSpawner.Spawn(tornado.transform.position);

            installed = true;
            Debug.Log("[Severe Weather] Tornado Tactical v1 runtime installed.");
        }
    }
}
