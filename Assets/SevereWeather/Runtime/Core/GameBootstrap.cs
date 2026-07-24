using SevereWeather.CameraSystem;
using SevereWeather.Input;
using SevereWeather.Storms;
using SevereWeather.UI;
using SevereWeather.World;
using UnityEngine;
using UnityEngine.Rendering;

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
        private Material tornadoOuterMaterial;
        private Material tornadoInnerMaterial;
        private Material supercellMaterial;
        private Material rainMaterial;
        private Material dustMaterial;
        private Material shadowMaterial;
        private Material debrisMaterial;
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
            QualitySettings.antiAliasing = 2;
            QualitySettings.shadows = ShadowQuality.All;
            QualitySettings.shadowResolution = ShadowResolution.Medium;
            QualitySettings.shadowDistance = 130f;
            QualitySettings.anisotropicFiltering = AnisotropicFiltering.Enable;
            Time.fixedDeltaTime = 1f / 60f;
            Screen.sleepTimeout = SleepTimeout.NeverSleep;

            try
            {
                Debug.Log("[Severe Weather] Build #4 startup: camera");
                CreateCamera();
                Debug.Log("[Severe Weather] Build #4 startup: lighting");
                CreateLighting();
                Debug.Log("[Severe Weather] Build #4 startup: input and HUD");
                CreateInput();
                CreateHud();
                Debug.Log("[Severe Weather] Build #4 startup: region");
                CreateRegion();
                Debug.Log("[Severe Weather] Build #4 startup: storm");
                CreateStorm(activeKind);
                Debug.Log($"[Severe Weather] Build #4 startup complete: {BuildIdentity.DisplayLabel}");
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
            if (Object.FindFirstObjectByType<Light>() == null)
            {
                GameObject lightObject = new GameObject("Sun");
                Light sun = lightObject.AddComponent<Light>();
                sun.type = LightType.Directional;
                sun.intensity = 1.22f;
                sun.color = new Color(1f, 0.92f, 0.8f);
                sun.shadows = LightShadows.Soft;
                sun.shadowStrength = 0.78f;
                sun.shadowBias = 0.055f;
                sun.shadowNormalBias = 0.35f;
                lightObject.transform.rotation = Quaternion.Euler(48f, -36f, 0f);
            }

            RenderSettings.ambientMode = AmbientMode.Trilight;
            RenderSettings.ambientSkyColor = new Color(0.34f, 0.43f, 0.52f);
            RenderSettings.ambientEquatorColor = new Color(0.24f, 0.31f, 0.32f);
            RenderSettings.ambientGroundColor = new Color(0.12f, 0.14f, 0.12f);
            RenderSettings.fog = true;
            RenderSettings.fogMode = FogMode.ExponentialSquared;
            RenderSettings.fogColor = new Color(0.36f, 0.46f, 0.52f);
            RenderSettings.fogDensity = 0.0019f;
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
            cameraComponent.backgroundColor = new Color(0.34f, 0.46f, 0.56f, 1f);
            cameraComponent.allowHDR = false;
            cameraComponent.allowMSAA = true;
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
            Vector3 spawn = activeStorm != null
                ? activeStorm.transform.position
                : region != null ? region.StarterSpawnPosition : new Vector3(-122f, 2f, 112f);
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

        private void EnsureStormMaterials()
        {
            if (tornadoOuterMaterial != null) return;

            tornadoOuterMaterial = PrimitiveFactory.CreateMaterial(
                "Tornado Condensation",
                new Color(0.34f, 0.39f, 0.44f, 0.42f),
                0f,
                0.08f,
                true);
            tornadoInnerMaterial = PrimitiveFactory.CreateMaterial(
                "Tornado Core",
                new Color(0.08f, 0.09f, 0.11f, 0.82f),
                0f,
                0.04f,
                true);
            supercellMaterial = PrimitiveFactory.CreateMaterial(
                "Supercell Cloud",
                new Color(0.2f, 0.24f, 0.3f, 0.78f),
                0f,
                0.12f,
                true);
            rainMaterial = PrimitiveFactory.CreateMaterial(
                "Rain Core",
                new Color(0.12f, 0.33f, 0.52f, 0.42f),
                0f,
                0.18f,
                true);
            dustMaterial = PrimitiveFactory.CreateMaterial(
                "Ground Dust",
                new Color(0.48f, 0.34f, 0.2f, 0.5f),
                0f,
                0.05f,
                true);
            shadowMaterial = PrimitiveFactory.CreateMaterial(
                "Storm Ground Shadow",
                new Color(0.025f, 0.03f, 0.035f, 0.38f),
                0f,
                0f,
                true,
                true);
            debrisMaterial = PrimitiveFactory.CreateMaterial(
                "Storm Debris",
                new Color(0.22f, 0.16f, 0.1f, 1f),
                0f,
                0.05f);
        }

        private void BuildTornadoVisual(Transform parent)
        {
            EnsureStormMaterials();

            GameObject spinObject = new GameObject("Tornado Spin Rig");
            spinObject.transform.SetParent(parent, false);
            Transform spinRoot = spinObject.transform;

            Transform[] layers = new Transform[9];
            for (int i = 0; i < layers.Length; i++)
            {
                float t = i / (float)(layers.Length - 1);
                float radius = Mathf.Lerp(1.1f, 8.7f, t);
                float y = 1.8f + i * 2.75f;
                float angle = i * 51f * Mathf.Deg2Rad;
                Vector3 offset = new Vector3(Mathf.Cos(angle), 0f, Mathf.Sin(angle)) * Mathf.Lerp(0.08f, 1.15f, t);
                Material layerMaterial = i < 3 ? tornadoInnerMaterial : tornadoOuterMaterial;
                GameObject layer = PrimitiveFactory.CreateCylinder(
                    spinRoot,
                    $"Funnel Layer {i}",
                    parent.position + Vector3.up * y,
                    new Vector3(radius, 1.15f, radius * Mathf.Lerp(0.68f, 0.9f, t)),
                    layerMaterial,
                    false);
                layer.transform.localPosition = offset + Vector3.up * y;
                layer.transform.localRotation = Quaternion.Euler(
                    Mathf.Sin(angle) * 5f,
                    i * 17f,
                    Mathf.Cos(angle) * 5f);
                layers[i] = layer.transform;
            }

            for (int i = 0; i < 14; i++)
            {
                float angle = i * Mathf.PI * 2f / 14f;
                float radius = 5f + (i % 4) * 1.4f;
                GameObject debris = PrimitiveFactory.CreateBox(
                    spinRoot,
                    $"Debris {i}",
                    parent.position,
                    new Vector3(0.45f + (i % 3) * 0.18f, 0.3f, 0.65f),
                    debrisMaterial,
                    false);
                debris.transform.localPosition = new Vector3(
                    Mathf.Cos(angle) * radius,
                    1.2f + (i % 5) * 1.1f,
                    Mathf.Sin(angle) * radius);
                debris.transform.localRotation = Quaternion.Euler(i * 19f, i * 31f, i * 11f);
            }

            GameObject dustRing = PrimitiveFactory.CreateCylinder(
                parent,
                "Dust Contact Ring",
                parent.position + Vector3.up * 0.25f,
                new Vector3(9.5f, 0.08f, 9.5f),
                dustMaterial,
                false);
            dustRing.transform.localPosition = Vector3.up * 0.25f;

            GameObject groundShadow = PrimitiveFactory.CreateCylinder(
                parent,
                "Tornado Shadow",
                parent.position + Vector3.up * 0.08f,
                new Vector3(10.5f, 0.025f, 8.5f),
                shadowMaterial,
                false);
            groundShadow.transform.localPosition = Vector3.up * 0.08f;

            CreateTrail(parent.gameObject, dustMaterial, 2.1f, 6.5f, 0.2f);
            StormVisualAnimator animator = parent.gameObject.AddComponent<StormVisualAnimator>();
            animator.Configure(135f, layers, spinRoot);
        }

        private void BuildSupercellVisual(Transform parent)
        {
            EnsureStormMaterials();

            GameObject spinObject = new GameObject("Supercell Rotation Rig");
            spinObject.transform.SetParent(parent, false);
            Transform spinRoot = spinObject.transform;

            Transform[] layers = new Transform[13];
            for (int i = 0; i < layers.Length; i++)
            {
                float angle = i * Mathf.PI * 2f / layers.Length;
                float radius = 12f + (i % 4) * 2.2f;
                Vector3 offset = new Vector3(
                    Mathf.Cos(angle) * radius,
                    13f + (i % 4) * 2.2f,
                    Mathf.Sin(angle) * radius * 0.76f);
                GameObject cloud = PrimitiveFactory.CreateSphere(
                    spinRoot,
                    $"Cloud Mass {i}",
                    parent.position,
                    new Vector3(17f + (i % 3) * 2.4f, 7f + (i % 2) * 2.5f, 15f),
                    supercellMaterial,
                    false);
                cloud.transform.localPosition = offset;
                layers[i] = cloud.transform;
            }

            GameObject rain = PrimitiveFactory.CreateCylinder(
                parent,
                "Rain and Hail Core",
                parent.position,
                new Vector3(13f, 6f, 13f),
                rainMaterial,
                false);
            rain.transform.localPosition = new Vector3(-8f, 6f, -10f);

            GameObject groundShadow = PrimitiveFactory.CreateCylinder(
                parent,
                "Supercell Shadow",
                parent.position + Vector3.up * 0.08f,
                new Vector3(22f, 0.025f, 17f),
                shadowMaterial,
                false);
            groundShadow.transform.localPosition = Vector3.up * 0.08f;

            CreateTrail(parent.gameObject, rainMaterial, 3.2f, 13f, 1.4f);
            StormVisualAnimator animator = parent.gameObject.AddComponent<StormVisualAnimator>();
            animator.Configure(28f, layers, spinRoot);
        }

        private static void CreateTrail(
            GameObject target,
            Material material,
            float time,
            float startWidth,
            float endWidth)
        {
            TrailRenderer trail = target.AddComponent<TrailRenderer>();
            trail.time = time;
            trail.minVertexDistance = 0.7f;
            trail.startWidth = startWidth;
            trail.endWidth = endWidth;
            trail.sharedMaterial = material;
            trail.startColor = Color.white;
            trail.endColor = new Color(1f, 1f, 1f, 0f);
            trail.shadowCastingMode = ShadowCastingMode.Off;
            trail.receiveShadows = false;
            trail.emitting = true;
        }
    }
}
