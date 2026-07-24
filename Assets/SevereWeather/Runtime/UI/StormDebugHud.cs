using SevereWeather.Core;
using SevereWeather.Input;
using SevereWeather.Storms;
using UnityEngine;
using UnityEngine.Rendering;

namespace SevereWeather.UI
{
    public sealed class StormDebugHud : MonoBehaviour
    {
        private const string LabLabel = "B4.1 MOTION + SILHOUETTE LAB";

        private StormInput input;
        private StormControllerBase storm;
        private GUIStyle titleStyle;
        private GUIStyle smallStyle;
        private GUIStyle buttonStyle;
        private GUIStyle telemetryStyle;
        private GUIStyle centeredStyle;
        private Texture2D joystickBaseTexture;
        private Texture2D joystickThumbTexture;
        private float smoothedFps = 60f;

        public void Configure(StormInput inputSource, StormControllerBase activeStorm)
        {
            input = inputSource;
            storm = activeStorm;
        }

        public void SetStorm(StormControllerBase activeStorm)
        {
            storm = activeStorm;
        }

        private void Update()
        {
            float instantaneous = Time.unscaledDeltaTime > 0.0001f ? 1f / Time.unscaledDeltaTime : 0f;
            smoothedFps = Mathf.Lerp(smoothedFps, instantaneous, 1f - Mathf.Exp(-3f * Time.unscaledDeltaTime));
        }

        private void EnsureStyles()
        {
            int baseSize = Mathf.Clamp(Screen.height / 52, 12, 18);
            if (titleStyle != null && titleStyle.fontSize == baseSize + 4) return;

            titleStyle = new GUIStyle(GUI.skin.label)
            {
                fontSize = baseSize + 4,
                fontStyle = FontStyle.Bold,
                normal = { textColor = Color.white }
            };
            smallStyle = new GUIStyle(GUI.skin.label)
            {
                fontSize = baseSize,
                normal = { textColor = new Color(0.92f, 0.96f, 1f) }
            };
            buttonStyle = new GUIStyle(GUI.skin.box)
            {
                alignment = TextAnchor.MiddleCenter,
                fontSize = baseSize + 1,
                fontStyle = FontStyle.Bold,
                wordWrap = false,
                normal = { textColor = Color.white }
            };
            telemetryStyle = new GUIStyle(GUI.skin.label)
            {
                fontSize = Mathf.Max(12, baseSize),
                normal = { textColor = new Color(0.8f, 0.94f, 1f) }
            };
            centeredStyle = new GUIStyle(GUI.skin.label)
            {
                alignment = TextAnchor.MiddleCenter,
                fontSize = baseSize + 1,
                fontStyle = FontStyle.Bold,
                normal = { textColor = Color.white }
            };

            if (joystickBaseTexture == null)
            {
                joystickBaseTexture = CreateCircleTexture(
                    128,
                    new Color(0.08f, 0.15f, 0.21f, 0.2f),
                    new Color(0.55f, 0.79f, 0.96f, 0.82f));
            }
            if (joystickThumbTexture == null)
            {
                joystickThumbTexture = CreateCircleTexture(
                    96,
                    new Color(0.94f, 0.97f, 1f, 0.96f),
                    new Color(1f, 0.54f, 0.08f, 1f));
            }
        }

        private void OnGUI()
        {
            EnsureStyles();
            if (storm == null) return;

            MobileControlLayout layout = MobileControlLayout.Calculate();
            DrawStatus(layout);
            DrawControls(layout);
        }

        private void DrawStatus(MobileControlLayout layout)
        {
            float topInset = Screen.height - layout.SafeArea.yMax;
            float panelWidth = Mathf.Clamp(layout.SafeArea.width * 0.32f, 340f, 430f);
            float panelHeight = Mathf.Clamp(layout.SafeArea.height * 0.34f, 224f, 252f);
            Rect panel = new Rect(layout.SafeArea.xMin + 12f, topInset + 12f, panelWidth, panelHeight);

            Color previous = GUI.color;
            GUI.color = new Color(0.025f, 0.055f, 0.075f, 0.9f);
            GUI.Box(panel, GUIContent.none);
            GUI.color = previous;

            GUI.Label(new Rect(panel.x + 14f, panel.y + 7f, panel.width - 28f, 27f), $"{storm.Kind} - LV {storm.Level:0}", titleStyle);
            GUI.Label(new Rect(panel.x + 14f, panel.y + 34f, panel.width - 28f, 21f), $"Power {storm.Power:0}   Stability {storm.Stability:0}", smallStyle);

            Vector2 move = input != null ? input.Move : Vector2.zero;
            Vector3 position = storm.transform.position;
            string motionState = move.sqrMagnitude <= 0.01f
                ? "IDLE"
                : storm.MotionBlocked || storm.Speed < 0.15f
                    ? "MOTION BLOCKED"
                    : "MOTION OK";

            GUI.Label(new Rect(panel.x + 14f, panel.y + 56f, panel.width - 28f, 20f), $"INPUT {move.x:+0.00;-0.00;0.00}, {move.y:+0.00;-0.00;0.00}   {motionState}", telemetryStyle);
            GUI.Label(new Rect(panel.x + 14f, panel.y + 77f, panel.width - 28f, 20f), $"POS {position.x:0.0}, {position.z:0.0}   ACTUAL {storm.Speed:0.0}", telemetryStyle);
            GUI.Label(new Rect(panel.x + 14f, panel.y + 98f, panel.width - 28f, 20f), $"DIST {storm.DistanceTravelled:0.0}   FPS {smoothedFps:0}", telemetryStyle);

            string pipeline = GraphicsSettings.currentRenderPipeline != null
                ? GraphicsSettings.currentRenderPipeline.GetType().Name
                : GraphicsSettings.defaultRenderPipeline != null
                    ? GraphicsSettings.defaultRenderPipeline.GetType().Name
                    : "Built-in";
            GUI.Label(new Rect(panel.x + 14f, panel.y + 119f, panel.width - 28f, 20f), $"RP {pipeline}   API {SystemInfo.graphicsDeviceType}", telemetryStyle);
            GUI.Label(new Rect(panel.x + 14f, panel.y + 140f, panel.width - 28f, 20f), $"{storm.ActionStatus}   TARGETS {storm.LastActionTargetCount}", telemetryStyle);
            GUI.Label(new Rect(panel.x + 14f, panel.y + panel.height - 30f, panel.width - 28f, 20f), $"{LabLabel}  {BuildIdentity.DisplayLabel}", telemetryStyle);
        }

        private void DrawControls(MobileControlLayout layout)
        {
            bool primaryActive = input != null && input.PrimaryHeld;
            bool secondaryActive = input != null && input.SecondaryVisualActive;
            bool tertiaryActive = input != null && input.TertiaryVisualActive;
            bool switchActive = input != null && input.SwitchStormVisualActive;

            string primaryName = storm.Kind == StormKind.Tornado ? "PULL" : "HAIL";
            string secondaryName = storm.Kind == StormKind.Tornado ? "GUST" : "FRONT";
            string tertiaryName = storm.Kind == StormKind.Tornado ? "ZAP" : "GRID";

            DrawButton(layout.PrimaryButton, primaryName, primaryActive);
            DrawButton(layout.SecondaryButton, secondaryName, secondaryActive);
            DrawButton(layout.TertiaryButton, tertiaryName, tertiaryActive);
            DrawButton(layout.StormSwitchButton, $"STORM: {storm.Kind}", switchActive);
            DrawJoystick(layout);
        }

        private void DrawJoystick(MobileControlLayout layout)
        {
            Vector2 centerScreen = input != null ? input.JoystickCenter : layout.JoystickDefaultCenter;
            Vector2 thumbScreen = input != null ? input.JoystickThumbPosition : centerScreen;
            Vector2 centerGui = MobileControlLayout.ScreenToGuiPoint(centerScreen);
            Vector2 thumbGui = MobileControlLayout.ScreenToGuiPoint(thumbScreen);
            float radius = input != null ? input.JoystickRadius : layout.JoystickRadius;

            Rect baseRect = new Rect(centerGui.x - radius, centerGui.y - radius, radius * 2f, radius * 2f);
            GUI.DrawTexture(baseRect, joystickBaseTexture, ScaleMode.StretchToFill, true);
            GUI.Label(baseRect, "MOVE", centeredStyle);

            float thumbSize = radius * 0.68f;
            Rect thumbRect = new Rect(
                thumbGui.x - thumbSize * 0.5f,
                thumbGui.y - thumbSize * 0.5f,
                thumbSize,
                thumbSize);
            Color previous = GUI.color;
            GUI.color = input != null && input.MoveTouchActive
                ? new Color(1f, 0.78f, 0.42f, 1f)
                : new Color(1f, 1f, 1f, 0.9f);
            GUI.DrawTexture(thumbRect, joystickThumbTexture, ScaleMode.StretchToFill, true);
            GUI.color = previous;
        }

        private void DrawButton(Rect screenRect, string label, bool active)
        {
            Rect guiRect = MobileControlLayout.ToGuiRect(screenRect);
            Color previous = GUI.color;
            GUI.color = active
                ? new Color(1f, 0.5f, 0.08f, 1f)
                : new Color(0.08f, 0.18f, 0.26f, 0.96f);
            GUI.Box(guiRect, label, buttonStyle);
            GUI.color = previous;
        }

        private static Texture2D CreateCircleTexture(int size, Color centerColor, Color edgeColor)
        {
            Texture2D texture = new Texture2D(size, size, TextureFormat.RGBA32, false)
            {
                name = "Runtime Circle",
                filterMode = FilterMode.Bilinear,
                wrapMode = TextureWrapMode.Clamp,
                hideFlags = HideFlags.DontSave
            };

            Color[] pixels = new Color[size * size];
            Vector2 center = new Vector2((size - 1) * 0.5f, (size - 1) * 0.5f);
            float radius = size * 0.5f;
            for (int y = 0; y < size; y++)
            {
                for (int x = 0; x < size; x++)
                {
                    float distance = Vector2.Distance(new Vector2(x, y), center) / radius;
                    if (distance > 1f)
                    {
                        pixels[y * size + x] = Color.clear;
                        continue;
                    }

                    float edge = Mathf.SmoothStep(0f, 1f, Mathf.InverseLerp(0.58f, 1f, distance));
                    Color color = Color.Lerp(centerColor, edgeColor, edge);
                    color.a *= Mathf.SmoothStep(1f, 0.72f, distance);
                    pixels[y * size + x] = color;
                }
            }

            texture.SetPixels(pixels);
            texture.Apply(false, true);
            return texture;
        }

        private void OnDestroy()
        {
            if (joystickBaseTexture != null) Destroy(joystickBaseTexture);
            if (joystickThumbTexture != null) Destroy(joystickThumbTexture);
        }
    }
}
