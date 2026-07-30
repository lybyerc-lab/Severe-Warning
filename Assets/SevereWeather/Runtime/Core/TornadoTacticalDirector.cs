using SevereWeather.CameraSystem;
using SevereWeather.Input;
using SevereWeather.Storms;
using SevereWeather.World;
using UnityEngine;

namespace SevereWeather.Core
{
    [DefaultExecutionOrder(-100)]
    public sealed class TornadoTacticalDirector : MonoBehaviour
    {
        public static TornadoTacticalDirector Instance { get; private set; }

        private const float RunDuration = 180f;
        private StormInput input;
        private TornadoController tornado;
        private HybridStormCamera cameraRig;
        private float timeRemaining = RunDuration;
        private float combo = 1f;
        private float comboHold;
        private int score;
        private int landmarksDestroyed;
        private string efRating = "EF-0";
        private string ticker = "TORNADO WARNING: TOUCHDOWN CONFIRMED IN LINCOLN COUNTY";
        private string breaking = "";
        private float breakingUntil;
        private bool runEnded;
        private GUIStyle bannerStyle;
        private GUIStyle titleStyle;
        private GUIStyle bodyStyle;
        private GUIStyle buttonStyle;
        private InvincibleAnimal cow;
        private Transform chaser;
        private Vector3 chaserHome;
        private bool chaserFilming;
        private float nextChaserUpdate;

        public int Score => score;
        public float Combo => combo;
        public string EFRating => efRating;
        public float TimeRemaining => timeRemaining;
        public bool RunEnded => runEnded;

        private void Awake()
        {
            Instance = this;
        }

        public void Configure(StormInput stormInput, TornadoController activeTornado, HybridStormCamera camera)
        {
            input = stormInput;
            tornado = activeTornado;
            cameraRig = camera;
            timeRemaining = RunDuration;
            score = 0;
            combo = 1f;
            comboHold = 0f;
            runEnded = false;
            SpawnCow();
            SpawnStormChaser();
            PostTicker("TORNADO WARNING: EF-0 TORNADO MOVING THROUGH FARMLAND");
        }

        private void Update()
        {
            if (tornado == null) return;

            if (!runEnded)
            {
                timeRemaining = Mathf.Max(0f, timeRemaining - Time.deltaTime);
                comboHold = Mathf.Max(0f, comboHold - Time.deltaTime);
                if (comboHold <= 0f)
                {
                    combo = Mathf.MoveTowards(combo, 1f, Time.deltaTime * 0.7f);
                }
                if (timeRemaining <= 0f)
                {
                    runEnded = true;
                    breaking = "FINAL WEATHER REPORT";
                    breakingUntil = float.PositiveInfinity;
                }
            }

            UpdateChaser();
        }

        public void RecordImpact(float adjustedDamage, bool stageChanged, bool destroyed, string targetName)
        {
            if (runEnded || adjustedDamage <= 0f) return;

            int basePoints = Mathf.Max(1, Mathf.RoundToInt(adjustedDamage * (stageChanged ? 1.25f : 0.35f)));
            if (destroyed) basePoints += 75;
            int awarded = Mathf.RoundToInt(basePoints * combo);
            if (chaserFilming)
            {
                awarded += 100;
                ShowBreaking("CAUGHT ON CAMERA +100");
            }

            score += awarded;
            combo = Mathf.Min(8f, combo + (destroyed ? 0.22f : 0.04f));
            comboHold = 2.8f;

            if (destroyed)
            {
                PostTicker($"DAMAGE CONFIRMED: {targetName.ToUpperInvariant()} DESTROYED");
            }
            UpdateEF();
        }

        public void RecordAnimalAirborne(InvincibleAnimal animal)
        {
            score += Mathf.RoundToInt(50f * combo);
            combo = Mathf.Min(8f, combo + 0.15f);
            comboHold = 3f;
            ShowBreaking("BOVINE BALLISTIC");
            PostTicker("MULTIPLE REPORTS OF AIRBORNE LIVESTOCK");
        }

        public void RecordAnimalLanded(InvincibleAnimal animal)
        {
            score += Mathf.RoundToInt(100f * combo);
            ShowBreaking("SAFE LANDING +100");
        }

        private void UpdateEF()
        {
            string next = score >= 4500 ? "EF-5" : score >= 3500 ? "EF-4" : score >= 2500 ? "EF-3" : score >= 1200 ? "EF-2" : score >= 400 ? "EF-1" : "EF-0";
            if (next == efRating) return;
            efRating = next;
            ShowBreaking($"TORNADO UPGRADED TO {efRating}");
            PostTicker($"EMERGENCY UPDATE: {efRating} DAMAGE NOW CONFIRMED");
            float scale = efRating == "EF-5" ? 1.75f : efRating == "EF-4" ? 1.55f : efRating == "EF-3" ? 1.38f : efRating == "EF-2" ? 1.22f : efRating == "EF-1" ? 1.1f : 1f;
            tornado.transform.localScale = Vector3.one * scale;
        }

        private void PostTicker(string message)
        {
            ticker = message;
        }

        private void ShowBreaking(string message)
        {
            breaking = message;
            breakingUntil = Time.unscaledTime + 2.2f;
        }

        private void SpawnCow()
        {
            if (cow != null) return;
            GameObject root = GameObject.CreatePrimitive(PrimitiveType.Cube);
            root.name = "Invincible Tactical Cow";
            root.transform.position = tornado.transform.position + new Vector3(22f, 1.4f, 10f);
            root.transform.localScale = new Vector3(2.6f, 1.5f, 1.2f);
            Rigidbody body = root.AddComponent<Rigidbody>();
            body.mass = 3.5f;
            body.linearDamping = 0.15f;
            body.angularDamping = 0.2f;
            cow = root.AddComponent<InvincibleAnimal>();
            cow.Configure(InvincibleAnimal.AnimalKind.Cow, "MOOO!", 5.5f, 13f);
        }

        private void SpawnStormChaser()
        {
            GameObject vehicle = GameObject.CreatePrimitive(PrimitiveType.Cube);
            vehicle.name = "Safe Storm Chaser SUV";
            chaserHome = tornado.transform.position + new Vector3(46f, 1.2f, -38f);
            vehicle.transform.position = chaserHome;
            vehicle.transform.localScale = new Vector3(4.5f, 1.8f, 2.2f);
            chaser = vehicle.transform;

            GameObject mast = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            mast.name = "Chaser Camera Mast";
            mast.transform.SetParent(chaser, false);
            mast.transform.localPosition = new Vector3(0f, 1.15f, 0f);
            mast.transform.localScale = new Vector3(0.12f, 0.65f, 0.12f);
        }

        private void UpdateChaser()
        {
            if (chaser == null || tornado == null) return;
            if (Time.unscaledTime < nextChaserUpdate) return;
            nextChaserUpdate = Time.unscaledTime + 0.2f;

            float distance = Vector3.Distance(chaser.position, tornado.transform.position);
            chaserFilming = distance >= 28f && distance <= 72f;
            if (distance < 24f)
            {
                Vector3 away = chaser.position - tornado.transform.position;
                away.y = 0f;
                if (away.sqrMagnitude < 0.1f) away = Vector3.right;
                chaser.position += away.normalized * 8f;
                chaserFilming = false;
                PostTicker("STORM CHASERS REPOSITIONING TO A SAFE DISTANCE");
            }
            else if (distance > 90f)
            {
                chaser.position = Vector3.MoveTowards(chaser.position, chaserHome, 3f);
            }
            chaser.LookAt(new Vector3(tornado.transform.position.x, chaser.position.y, tornado.transform.position.z));
        }

        private void EnsureStyles()
        {
            if (bannerStyle != null) return;
            bannerStyle = new GUIStyle(GUI.skin.box) { alignment = TextAnchor.MiddleCenter, fontSize = Mathf.Clamp(Screen.height / 48, 13, 18), fontStyle = FontStyle.Bold, normal = { textColor = Color.white } };
            titleStyle = new GUIStyle(GUI.skin.label) { fontSize = Mathf.Clamp(Screen.height / 34, 18, 28), fontStyle = FontStyle.Bold, normal = { textColor = Color.white } };
            bodyStyle = new GUIStyle(GUI.skin.label) { fontSize = Mathf.Clamp(Screen.height / 52, 12, 18), normal = { textColor = Color.white } };
            buttonStyle = new GUIStyle(GUI.skin.button) { fontSize = Mathf.Clamp(Screen.height / 50, 13, 18), fontStyle = FontStyle.Bold };
        }

        private void OnGUI()
        {
            if (tornado == null) return;
            EnsureStyles();

            Color prior = GUI.color;
            GUI.color = new Color(0.67f, 0.08f, 0.08f, 0.96f);
            GUI.Box(new Rect(0f, 0f, Screen.width, 34f), ticker, bannerStyle);
            GUI.color = prior;

            GUI.Box(new Rect(12f, 46f, Mathf.Min(390f, Screen.width * 0.44f), 128f), GUIContent.none);
            GUI.Label(new Rect(24f, 52f, 360f, 32f), $"TORNADO TACTICAL  {efRating}", titleStyle);
            GUI.Label(new Rect(24f, 86f, 350f, 24f), $"TIME {FormatTime(timeRemaining)}   SCORE {score}", bodyStyle);
            GUI.Label(new Rect(24f, 112f, 350f, 24f), $"COMBO {combo:0.0}x   CHASER {(chaserFilming ? "FILMING" : "REPOSITIONING")}", bodyStyle);
            GUI.Label(new Rect(24f, 138f, 350f, 24f), "PULL • GUST • GRID ZAP", bodyStyle);

            if (!string.IsNullOrEmpty(breaking) && Time.unscaledTime <= breakingUntil)
            {
                GUI.Box(new Rect(Screen.width * 0.3f, 48f, Screen.width * 0.4f, 48f), breaking, bannerStyle);
            }

            if (runEnded)
            {
                Rect panel = new Rect(Screen.width * 0.18f, Screen.height * 0.2f, Screen.width * 0.64f, Screen.height * 0.56f);
                GUI.Box(panel, GUIContent.none);
                GUI.Label(new Rect(panel.x + 24f, panel.y + 20f, panel.width - 48f, 44f), "FINAL WEATHER REPORT", titleStyle);
                GUI.Label(new Rect(panel.x + 24f, panel.y + 82f, panel.width - 48f, 120f), $"FINAL SCORE: {score}\nMAXIMUM RATING: {efRating}\nLANDMARKS: {landmarksDestroyed}\nANIMALS LANDED SAFELY", bodyStyle);
                if (GUI.Button(new Rect(panel.x + panel.width * 0.25f, panel.y + panel.height - 72f, panel.width * 0.5f, 48f), "RUN AGAIN", buttonStyle))
                {
                    UnityEngine.SceneManagement.SceneManager.LoadScene(UnityEngine.SceneManagement.SceneManager.GetActiveScene().buildIndex);
                }
            }
        }

        private static string FormatTime(float seconds)
        {
            int total = Mathf.CeilToInt(seconds);
            return $"{total / 60:00}:{total % 60:00}";
        }
    }
}
