using SevereWeather.CameraSystem;
using SevereWeather.Input;
using SevereWeather.Storms;
using SevereWeather.UI;
using SevereWeather.World;
using UnityEngine;

namespace SevereWeather.Core
{
    [DefaultExecutionOrder(-1000)]
    public sealed class GameBootstrap : MonoBehaviour
    {
        private StormInput input;
        private RegionGenerator region;
        private HybridStormCamera cameraRig;
        private StormDebugHud hud;
        private StormControllerBase activeStorm;
        private StormKind activeKind = StormKind.Tornado;
        private Material tornadoMaterial;
        private Material supercellMaterial;
        private Material rainMaterial;
        private string startupError;
        private GUIStyle startupErrorStyle;

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        private static void EnsureBootstrapExists()
        {
            if (Object.FindFirstObjectByType<GameBootstrap>() != null) return;
            GameObject root = new GameObject("SevereWeather_Bootstrap");
            root.AddComponent<GameBootstrap>();
        }

        private void Awake()
        {
            Application.targetFrameRate = 60;
            QualitySettings.vSyncCount = 0;
            Time.fixedDeltaTime = 1f / 60f;
            Screen.sleepTimeout = SleepTimeout.NeverSleep;

            try
            {
                Debug.Log("[Severe Weather] Startup: camera");
                CreateCamera();
                Debug.Log("[Severe Weather] Startup: lighting");
                CreateLighting();
                Debug.Log("[Severe Weather] Startup: input and HUD");
                CreateInput();
                CreateHud();
                Debug.Log("[Severe Weather] Startup: region");
                CreateRegion();
                Debug.Log("[Severe Weather] Startup: storm");
                CreateStorm(activeKind);
                Debug.Log("[Severe Weather] Startup complete");
            }
            catch (System.Exception exception)
            {
                startupError = exception.ToString();
                Debug.LogException(exception);
                EnsureEmergencyCamera();
            }
        }

        private void Update()
        {
            if (input != null && input.ConsumeSwitchStormPressed())
            {
                activeKind = activeKind == StormKind.Tornado ? StormKind.Supercell : StormKind.Tornado;
                CreateStorm(activeKind);
            }
        }

        private void OnGUI()
        {
            if (string.IsNullOrEmpty(startupError)) return;

            if (startupErrorStyle == null)
            {
                startupErrorStyle = new GUIStyle(GUI.skin.label)
                {
                    alignment = TextAnchor.UpperLeft,
                    fontSize = Mathf.Clamp(Screen.height / 48, 13, 20),
                    wordWrap = true,
                    normal = { textColor = Color.white }
                };
            }

            Rect panel = new Rect(18f, 18f, Screen.width - 36f, Screen.height - 36f);
            GUI.Box(panel, GUIContent.none);
            GUI.Label(
                new Rect(panel.x + 18f, panel.y + 18f, panel.width - 36f, panel.height - 36f),
                "SEVERE WEATHER STARTUP ERROR\n\n" + startupError,
                startupErrorStyle);
        }

        private void CreateLighting()
        {
            if (Object.FindFirstObjectByType<Light>() != null) return;
            GameObject lightObject = new GameObject("Sun");
            Light sun = lightObject.AddComponent<Light>();
            sun.type = LightType.Directional;
            sun.intensity = 1.15f;
            sun.color = new Color(1f, 0.93f, 0.82f);
            lightObject.transform.rotation = Quaternion.Euler(48f, -36f, 0f);
            RenderSettings.ambientLight = new Color(0.24f, 0.29f, 0.34f);
            RenderSettings.fog = true;
            RenderSettings.fogColor = new Color(0.34f, 0.42f, 0.45f);
            RenderSettings.fogDensity = 0.0016f;
        }

        private void CreateRegion()
        {
            GameObject regionObject = new GameObject("Living Region Graybox");
            region = regionObject.AddComponent<RegionGenerator>();
            region.Generate();
        }

        private void CreateInput()
        {
            GameObject inputObject = new GameObject("Storm Input");
            input = inputObject.AddComponent<StormInput>();
        }

        private void CreateCamera()
        {
            Camera existing = Camera.main;
            GameObject cameraObject;
            if (existing == null)
            {
                cameraObject = new GameObject("Main Camera");
                existing = cameraObject.AddComponent<Camera>();
                cameraObject.tag = "MainCamera";
                cameraObject.AddComponent<AudioListener>();
            }
            else
            {
                cameraObject = existing.gameObject;
            }

            ConfigureCameraSurface(existing);
            cameraRig = cameraObject.GetComponent<HybridStormCamera>();
            if (cameraRig == null)
            {
                cameraRig = cameraObject.AddComponent<HybridStormCamera>();
            }
            cameraObject.transform.position = new Vector3(-65f, 70f, -65f);
        }

        private static void ConfigureCameraSurface(Camera cameraComponent)
        {
            cameraComponent.clearFlags = CameraClearFlags.SolidColor;
            cameraComponent.backgroundColor = new Color(0.08f, 0.12f, 0.16f, 1f);
            cameraComponent.allowHDR = false;
        }

        private static void EnsureEmergencyCamera()
        {
            Camera emergency = Camera.main;
            if (emergency == null)
            {
                GameObject cameraObject = new GameObject("Emergency Camera");
                emergency = cameraObject.AddComponent<Camera>();
                cameraObject.tag = "MainCamera";
                cameraObject.AddComponent<AudioListener>();
                cameraObject.transform.position = new Vector3(0f, 12f, -18f);
                cameraObject.transform.rotation = Quaternion.Euler(25f, 0f, 0f);
            }

            ConfigureCameraSurface(emergency);
        }

        private void CreateHud()
        {
            GameObject hudObject = new GameObject("Storm Debug HUD");
            hud = hudObject.AddComponent<StormDebugHud>();
        }

        private void CreateStorm(StormKind kind)
        {
            Vector3 spawn = activeStorm != null ? activeStorm.transform.position : new Vector3(-135f, 2f, 122f);
            if (activeStorm != null)
            {
                activeStorm.gameObject.SetActive(false);
                Destroy(activeStorm.gameObject);
            }

            GameObject stormObject = new GameObject(kind == StormKind.Tornado ? "Player Tornado" : "Player Supercell");
            stormObject.transform.position = spawn;
            stormObject.AddComponent<Rigidbody>();

            if (kind == StormKind.Tornado)
            {
                TornadoController tornado = stormObject.AddComponent<TornadoController>();
                activeStorm = tornado;
                BuildTornadoVisual(stormObject.transform);
            }
            else
            {
                SupercellController supercell = stormObject.AddComponent<SupercellController>();
                activeStorm = supercell;
                BuildSupercellVisual(stormObject.transform);
            }

            activeStorm.ConfigureInput(input);
            cameraRig.SetTarget(activeStorm);
            hud.Configure(input, activeStorm);
            StormGameState.SetActiveStorm(activeStorm);
        }

        private void BuildTornadoVisual(Transform parent)
        {
            if (tornadoMaterial == null)
            {
                tornadoMaterial = PrimitiveFactory.CreateMaterial("Tornado", new Color(0.18f, 0.20f, 0.22f, 0.78f), 0f, 0.08f);
            }

            Transform[] layers = new Transform[7];
            for (int i = 0; i < layers.Length; i++)
            {
                float t = i / (float)(layers.Length - 1);
                float radius = Mathf.Lerp(1.1f, 8.5f, t);
                float y = 1.8f + i * 3.1f;
                GameObject layer = PrimitiveFactory.CreateCylinder(parent, $"Funnel Layer {i}", parent.position + Vector3.up * y, new Vector3(radius, 1.35f, radius), tornadoMaterial, false);
                layer.transform.position = parent.position + Vector3.up * y;
                layers[i] = layer.transform;
            }

            StormVisualAnimator animator = parent.gameObject.AddComponent<StormVisualAnimator>();
            animator.Configure(125f, layers);
        }

        private void BuildSupercellVisual(Transform parent)
        {
            if (supercellMaterial == null)
            {
                supercellMaterial = PrimitiveFactory.CreateMaterial("Supercell", new Color(0.16f, 0.19f, 0.24f, 0.92f), 0f, 0.1f);
                rainMaterial = PrimitiveFactory.CreateMaterial("Rain Core", new Color(0.18f, 0.38f, 0.52f, 0.5f), 0f, 0.18f);
            }

            Transform[] layers = new Transform[10];
            for (int i = 0; i < layers.Length; i++)
            {
                float angle = i * Mathf.PI * 2f / layers.Length;
                Vector3 offset = new Vector3(Mathf.Cos(angle) * 13f, 15f + (i % 3) * 3f, Mathf.Sin(angle) * 13f);
                GameObject cloud = GameObject.CreatePrimitive(PrimitiveType.Sphere);
                cloud.name = $"Cloud Mass {i}";
                cloud.transform.SetParent(parent, false);
                cloud.transform.position = parent.position + offset;
                cloud.transform.localScale = new Vector3(18f, 8f + (i % 2) * 3f, 18f);
                cloud.GetComponent<Renderer>().sharedMaterial = supercellMaterial;
                Destroy(cloud.GetComponent<Collider>());
                layers[i] = cloud.transform;
            }

            GameObject rain = PrimitiveFactory.CreateCylinder(parent, "Rain and Hail Core", parent.position + new Vector3(-8f, 6f, -10f), new Vector3(13f, 6f, 13f), rainMaterial, false);
            rain.transform.position = parent.position + new Vector3(-8f, 6f, -10f);

            StormVisualAnimator animator = parent.gameObject.AddComponent<StormVisualAnimator>();
            animator.Configure(22f, layers);
        }
    }
}
