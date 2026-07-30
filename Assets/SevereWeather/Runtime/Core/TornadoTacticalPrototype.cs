using System.Collections.Generic;
using SevereWeather.Damage;
using SevereWeather.Storms;
using SevereWeather.UI;
using SevereWeather.World;
using UnityEngine;

namespace SevereWeather.Core
{
    [DefaultExecutionOrder(900)]
    public sealed class TornadoTacticalPrototype : MonoBehaviour
    {
        private const float RunDuration = 180f;
        private readonly Queue<string> tickerQueue = new Queue<string>();
        private EFProgressionManager progression;
        private StormControllerBase storm;
        private Transform chaser;
        private float remaining = RunDuration;
        private float combo = 1f;
        private float comboHold;
        private int lastScore;
        private int cameraBonus;
        private int airborneCount;
        private string ticker = "TORNADO WARNING: TOUCHDOWN CONFIRMED IN LINCOLN COUNTY";
        private string breaking = "TACTICAL TORNADO RUN";
        private float breakingUntil;
        private bool initialized;
        private bool runEnded;
        private GUIStyle titleStyle;
        private GUIStyle bodyStyle;
        private GUIStyle tickerStyle;
        private GUIStyle buttonStyle;

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        private static void Install()
        {
            if (FindFirstObjectByType<TornadoTacticalPrototype>() != null) return;
            new GameObject("Tornado Tactical Prototype").AddComponent<TornadoTacticalPrototype>();
        }

        private void Start()
        {
            progression = EFProgressionManager.Instance;
            if (progression == null)
            {
                progression = new GameObject("Tornado Run Progression").AddComponent<EFProgressionManager>();
            }

            progression.OnScoreChanged += HandleScoreChanged;
            progression.OnEFRatingChanged += HandleEFRatingChanged;
            EnqueueTicker("PULL DEBRIS INWARD. GUST TO FLING IT. GRID ZAP CONDUCTIVE TARGETS.");
        }

        private void OnDestroy()
        {
            if (progression == null) return;
            progression.OnScoreChanged -= HandleScoreChanged;
            progression.OnEFRatingChanged -= HandleEFRatingChanged;
        }

        private void Update()
        {
            if (!initialized)
            {
                storm = StormGameState.ActiveStorm;
                if (storm == null) return;
                InitializePrototype();
            }

            if (storm == null) storm = StormGameState.ActiveStorm;
            if (!runEnded)
            {
                remaining = Mathf.Max(0f, remaining - Time.deltaTime);
                comboHold = Mathf.Max(0f, comboHold - Time.deltaTime);
                if (comboHold <= 0f) combo = Mathf.MoveTowards(combo, 1f, Time.deltaTime * 0.9f);
                if (remaining <= 0f) EndRun();
            }

            UpdateChaser();
            airborneCount = CountAirborneAnimals();
            if (tickerQueue.Count > 0 && Time.frameCount % 240 == 0)
            {
                ticker = tickerQueue.Dequeue();
            }
        }

        private void InitializePrototype()
        {
            initialized = true;
            StormDebugHud debugHud = FindFirstObjectByType<StormDebugHud>();
            if (debugHud != null) debugHud.enabled = false;

            Camera mainCamera = Camera.main;
            if (mainCamera != null && mainCamera.GetComponent<TacticalCameraOverride>() == null)
            {
                mainCamera.gameObject.AddComponent<TacticalCameraOverride>();
            }

            SpawnDenseTestPocket(storm.transform.position + new Vector3(38f, 0f, 12f));
            SpawnCow(storm.transform.position + new Vector3(18f, 0f, -10f));
            SpawnChaser(storm.transform.position + new Vector3(-55f, 0f, 48f));
            breaking = "LIVE: TORNADO TOUCHDOWN";
            breakingUntil = Time.unscaledTime + 4f;
        }

        private void HandleScoreChanged(int score)
        {
            int gained = Mathf.Max(0, score - lastScore);
            lastScore = score;
            if (gained <= 0 || runEnded) return;

            combo = Mathf.Min(8f, combo + Mathf.Clamp(gained / 120f, 0.08f, 0.7f));
            comboHold = 2.8f;

            if (chaser != null && storm != null && Vector3.Distance(storm.transform.position, chaser.position) <= 92f)
            {
                int bonus = Mathf.Clamp(Mathf.RoundToInt(gained * 0.2f), 5, 100);
                cameraBonus += bonus;
                breaking = $"CAUGHT ON CAMERA +{bonus}";
                breakingUntil = Time.unscaledTime + 1.8f;
            }
        }

        private void HandleEFRatingChanged(string rating, float multiplier)
        {
            breaking = $"BREAKING: {rating} DAMAGE CONFIRMED";
            breakingUntil = Time.unscaledTime + 3f;
            EnqueueTicker($"NWS UPDATE: TORNADO INTENSIFIED TO {rating} NEAR THE TACTICAL TEST DISTRICT");
            if (storm != null) storm.transform.localScale = Vector3.one * Mathf.Lerp(1f, 1.75f, Mathf.InverseLerp(1f, 3.5f, multiplier));
        }

        private void EndRun()
        {
            runEnded = true;
            breaking = "RUN COMPLETE: LOCAL NEWS DAMAGE RECAP";
            ticker = $"FINAL REPORT: {progression.CurrentEFRating} | SCORE {TotalScore:N0} | AIRBORNE ANIMALS {airborneCount}";
        }

        private int TotalScore => progression != null ? progression.DestructionScore + cameraBonus : cameraBonus;

        private void EnqueueTicker(string message)
        {
            tickerQueue.Enqueue(message);
        }

        private void UpdateChaser()
        {
            if (chaser == null || storm == null) return;
            Vector3 away = chaser.position - storm.transform.position;
            away.y = 0f;
            float distance = away.magnitude;
            if (distance < 48f)
            {
                Vector3 direction = away.sqrMagnitude > 0.1f ? away.normalized : Vector3.right;
                chaser.position += direction * (34f * Time.deltaTime);
                chaser.rotation = Quaternion.LookRotation(direction, Vector3.up);
                ticker = "STORM CHASERS REPOSITIONING TO A SAFE OBSERVATION ROUTE";
            }
            else if (distance > 105f)
            {
                Vector3 target = storm.transform.position + away.normalized * 82f;
                chaser.position = Vector3.MoveTowards(chaser.position, target, 12f * Time.deltaTime);
            }
        }

        private static int CountAirborneAnimals()
        {
            InvincibleAnimal[] animals = FindObjectsByType<InvincibleAnimal>(FindObjectsSortMode.None);
            int count = 0;
            for (int i = 0; i < animals.Length; i++) if (animals[i].IsAirborne) count++;
            return count;
        }

        private static Material MakeMaterial(Color color)
        {
            Shader shader = Shader.Find("Universal Render Pipeline/Lit");
            if (shader == null) shader = Shader.Find("Standard");
            if (shader == null) shader = Shader.Find("Sprites/Default");
            return new Material(shader) { color = color };
        }

        private static GameObject Box(Transform parent, string name, Vector3 position, Vector3 scale, Material material)
        {
            GameObject box = GameObject.CreatePrimitive(PrimitiveType.Cube);
            box.name = name;
            box.transform.SetParent(parent, true);
            box.transform.position = position;
            box.transform.localScale = scale;
            box.GetComponent<Renderer>().sharedMaterial = material;
            return box;
        }

        private static void SpawnDenseTestPocket(Vector3 center)
        {
            GameObject root = new GameObject("Tactical Destruction Block");
            Material house = MakeMaterial(new Color(0.68f, 0.55f, 0.38f));
            Material roof = MakeMaterial(new Color(0.16f, 0.19f, 0.22f));
            Material utility = MakeMaterial(new Color(0.36f, 0.43f, 0.48f));

            for (int i = 0; i < 12; i++)
            {
                float x = (i % 4) * 13f - 19.5f;
                float z = (i / 4) * 15f - 15f;
                Vector3 p = center + new Vector3(x, 2.1f, z);
                GameObject building = Box(root.transform, $"Tactical House {i}", p, new Vector3(9f, 4.2f, 8f), house);
                DamageableStructure damageable = building.AddComponent<DamageableStructure>();
                damageable.Configure(75f + i * 4f, MaterialClass.Wood, false, MobilityClass.Medium);
                GameObject roofPiece = Box(building.transform, "Roof", p + Vector3.up * 2.8f, new Vector3(9.8f, 0.8f, 8.8f), roof);
                roofPiece.transform.SetParent(building.transform, true);
            }

            for (int i = 0; i < 5; i++)
            {
                Vector3 p = center + new Vector3(-26f + i * 13f, 4.5f, 24f);
                GameObject pole = Box(root.transform, $"Tactical Power Pole {i}", p, new Vector3(0.8f, 9f, 0.8f), utility);
                DamageableStructure damageable = pole.AddComponent<DamageableStructure>();
                damageable.Configure(55f, MaterialClass.Infrastructure, true, MobilityClass.Light);
                ConductiveNode node = pole.AddComponent<ConductiveNode>();
                node.Configure(28f, 8);
            }
        }

        private static void SpawnCow(Vector3 position)
        {
            GameObject root = new GameObject("Invincible Flingable Cow");
            root.transform.position = position;
            Material white = MakeMaterial(new Color(0.88f, 0.86f, 0.8f));
            Material dark = MakeMaterial(new Color(0.08f, 0.07f, 0.06f));
            Box(root.transform, "Cow Body", position + Vector3.up * 1.5f, new Vector3(3.2f, 1.8f, 1.5f), white);
            Box(root.transform, "Cow Head", position + new Vector3(2f, 1.7f, 0f), new Vector3(1.1f, 1.1f, 1.1f), dark);
            for (int i = 0; i < 4; i++)
            {
                float x = i < 2 ? -1f : 1f;
                float z = i % 2 == 0 ? -0.55f : 0.55f;
                Box(root.transform, $"Leg {i}", position + new Vector3(x, 0.45f, z), new Vector3(0.32f, 1.1f, 0.32f), dark);
            }
            BoxCollider collider = root.AddComponent<BoxCollider>();
            collider.center = new Vector3(0f, 1.4f, 0f);
            collider.size = new Vector3(4.4f, 2.8f, 2f);
            root.AddComponent<InvincibleAnimal>();
        }

        private void SpawnChaser(Vector3 position)
        {
            GameObject root = new GameObject("Safe Storm Chaser SUV");
            root.transform.position = position;
            Material body = MakeMaterial(new Color(0.12f, 0.25f, 0.42f));
            Material glass = MakeMaterial(new Color(0.18f, 0.55f, 0.72f));
            Box(root.transform, "SUV Body", position + Vector3.up * 1.1f, new Vector3(4.8f, 1.5f, 2.4f), body);
            Box(root.transform, "SUV Cabin", position + new Vector3(0.5f, 2.1f, 0f), new Vector3(2.8f, 1.2f, 2.1f), glass);
            Box(root.transform, "Camera Mast", position + new Vector3(-0.5f, 3.3f, 0f), new Vector3(0.18f, 1.7f, 0.18f), body);
            chaser = root.transform;
        }

        private void EnsureStyles()
        {
            if (titleStyle != null) return;
            titleStyle = new GUIStyle(GUI.skin.label) { fontSize = Mathf.Clamp(Screen.height / 34, 17, 27), fontStyle = FontStyle.Bold, normal = { textColor = Color.white } };
            bodyStyle = new GUIStyle(GUI.skin.label) { fontSize = Mathf.Clamp(Screen.height / 52, 12, 18), normal = { textColor = Color.white } };
            tickerStyle = new GUIStyle(bodyStyle) { alignment = TextAnchor.MiddleCenter, fontStyle = FontStyle.Bold };
            buttonStyle = new GUIStyle(GUI.skin.box) { alignment = TextAnchor.MiddleCenter, fontSize = Mathf.Clamp(Screen.height / 48, 12, 17), fontStyle = FontStyle.Bold, normal = { textColor = Color.white } };
        }

        private void OnGUI()
        {
            EnsureStyles();
            float safeTop = Screen.safeArea.y;
            GUI.color = new Color(0.62f, 0.06f, 0.06f, 0.94f);
            GUI.Box(new Rect(0f, safeTop, Screen.width, 34f), GUIContent.none);
            GUI.color = Color.white;
            GUI.Label(new Rect(8f, safeTop, Screen.width - 16f, 34f), ticker, tickerStyle);

            float panelY = safeTop + 42f;
            GUI.color = new Color(0.02f, 0.05f, 0.08f, 0.86f);
            GUI.Box(new Rect(12f, panelY, Mathf.Min(390f, Screen.width * 0.48f), 155f), GUIContent.none);
            GUI.color = Color.white;
            GUI.Label(new Rect(24f, panelY + 8f, 360f, 30f), $"TORNADO TACTICAL  {progression?.CurrentEFRating ?? "EF-0"}", titleStyle);
            int minutes = Mathf.FloorToInt(remaining / 60f);
            int seconds = Mathf.FloorToInt(remaining % 60f);
            GUI.Label(new Rect(24f, panelY + 42f, 360f, 24f), $"TIME {minutes:00}:{seconds:00}   SCORE {TotalScore:N0}   COMBO {combo:0.0}x", bodyStyle);
            GUI.Label(new Rect(24f, panelY + 68f, 360f, 24f), $"POWER {(storm != null ? storm.Power : 0):0}   AIRBORNE {airborneCount}   CAMERA +{cameraBonus}", bodyStyle);
            GUI.Label(new Rect(24f, panelY + 94f, 360f, 24f), "OBJECTIVES: EF-3 | 4,500 PTS | FLING THE COW", bodyStyle);
            if (Time.unscaledTime <= breakingUntil || runEnded)
            {
                GUI.Label(new Rect(24f, panelY + 120f, 360f, 24f), breaking, bodyStyle);
            }

            float buttonY = Screen.safeArea.yMax - 74f;
            float size = Mathf.Clamp(Screen.height * 0.095f, 54f, 78f);
            float gap = 10f;
            float startX = Screen.safeArea.xMax - (size * 3f + gap * 2f) - 14f;
            GUI.color = new Color(0.03f, 0.11f, 0.17f, 0.9f);
            GUI.Box(new Rect(startX, buttonY, size, size), "PULL", buttonStyle);
            GUI.Box(new Rect(startX + size + gap, buttonY, size, size), "GUST", buttonStyle);
            GUI.Box(new Rect(startX + (size + gap) * 2f, buttonY, size, size), "ZAP", buttonStyle);
            GUI.color = Color.white;
        }
    }

    [DefaultExecutionOrder(1200)]
    public sealed class TacticalCameraOverride : MonoBehaviour
    {
        private Vector3 velocity;

        private void LateUpdate()
        {
            StormControllerBase storm = StormGameState.ActiveStorm;
            if (storm == null) return;
            Vector3 lookAhead = Vector3.ClampMagnitude(storm.PlanarVelocity * 1.35f, 26f);
            Vector3 focus = storm.transform.position + lookAhead + Vector3.up * 5f;
            Quaternion orbit = Quaternion.Euler(43f, 0f, 0f);
            Vector3 desired = focus - orbit * Vector3.forward * 118f;
            transform.position = Vector3.SmoothDamp(transform.position, desired, ref velocity, 0.24f);
            transform.rotation = Quaternion.LookRotation(focus - transform.position, Vector3.up);
            Camera cameraComponent = GetComponent<Camera>();
            if (cameraComponent != null) cameraComponent.fieldOfView = 48f;
        }
    }
}
