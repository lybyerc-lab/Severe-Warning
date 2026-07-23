using SevereWeather.Input;
using SevereWeather.Storms;
using UnityEngine;

namespace SevereWeather.UI
{
    public sealed class StormDebugHud : MonoBehaviour
    {
        private const string BuildLabel = "B3 INPUT LAB";

        private StormInput input;
        private StormControllerBase storm;
        private GUIStyle titleStyle;
        private GUIStyle smallStyle;
        private GUIStyle buttonStyle;
        private GUIStyle joystickStyle;
        private GUIStyle telemetryStyle;

        public void Configure(StormInput inputSource, StormControllerBase activeStorm)
        {
            input = inputSource;
            storm = activeStorm;
        }

        public void SetStorm(StormControllerBase activeStorm)
        {
            storm = activeStorm;
        }

        private void EnsureStyles()
        {
            int baseSize = Mathf.Clamp(Screen.height / 44, 13, 20);
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
                normal = { textColor = new Color(0.9f, 0.95f, 1f) }
            };
            buttonStyle = new GUIStyle(GUI.skin.box)
            {
                alignment = TextAnchor.MiddleCenter,
                fontSize = baseSize,
                fontStyle = FontStyle.Bold,
                wordWrap = true,
                normal = { textColor = Color.white }
            };
            joystickStyle = new GUIStyle(GUI.skin.box)
            {
                alignment = TextAnchor.MiddleCenter,
                fontSize = baseSize,
                fontStyle = FontStyle.Bold,
                normal = { textColor = Color.white }
            };
            telemetryStyle = new GUIStyle(GUI.skin.label)
            {
                fontSize = Mathf.Max(12, baseSize - 1),
                normal = { textColor = new Color(0.78f, 0.92f, 1f) }
            };
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
            float panelWidth = Mathf.Clamp(layout.SafeArea.width * 0.29f, 255f, 340f);
            Rect panel = new Rect(layout.SafeArea.xMin + 12f, topInset + 12f, panelWidth, 126f);

            GUI.Box(panel, GUIContent.none);
            GUI.Label(new Rect(panel.x + 14f, panel.y + 8f, panel.width - 28f, 28f), $"{storm.Kind} - LV {storm.Level:0}", titleStyle);
            GUI.Label(new Rect(panel.x + 14f, panel.y + 38f, panel.width - 28f, 22f), $"Power {storm.Power:0}   Stability {storm.Stability:0}", smallStyle);

            Vector2 move = input != null ? input.Move : Vector2.zero;
            Vector3 position = storm.transform.position;
            GUI.Label(
                new Rect(panel.x + 14f, panel.y + 62f, panel.width - 28f, 22f),
                $"MOVE {move.x:+0.00;-0.00;0.00}, {move.y:+0.00;-0.00;0.00}",
                telemetryStyle);
            GUI.Label(
                new Rect(panel.x + 14f, panel.y + 84f, panel.width - 28f, 22f),
                $"POS {position.x:0.0}, {position.z:0.0}",
                telemetryStyle);
            GUI.Label(
                new Rect(panel.x + 14f, panel.y + 105f, panel.width - 28f, 18f),
                BuildLabel,
                telemetryStyle);
        }

        private void DrawControls(MobileControlLayout layout)
        {
            bool primaryActive = input != null && input.PrimaryHeld;
            bool secondaryActive = input != null && input.SecondaryVisualActive;
            bool tertiaryActive = input != null && input.TertiaryVisualActive;
            bool switchActive = input != null && input.SwitchStormVisualActive;

            string primaryName = storm.Kind == StormKind.Tornado ? "SUCTION" : "HAIL SWATH";
            string secondaryName = storm.Kind == StormKind.Tornado ? "GUST" : "GUST FRONT";
            string tertiaryName = storm.Kind == StormKind.Tornado ? "LIGHTNING" : "NETWORK";

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

            Color previous = GUI.color;
            GUI.color = new Color(0.55f, 0.68f, 0.78f, 0.55f);
            GUI.Box(
                new Rect(centerGui.x - radius, centerGui.y - radius, radius * 2f, radius * 2f),
                "MOVE",
                joystickStyle);

            float thumbSize = radius * 0.62f;
            GUI.color = input != null && input.MoveTouchActive
                ? new Color(1f, 0.74f, 0.28f, 0.95f)
                : new Color(0.88f, 0.94f, 1f, 0.8f);
            GUI.Box(
                new Rect(thumbGui.x - thumbSize * 0.5f, thumbGui.y - thumbSize * 0.5f, thumbSize, thumbSize),
                GUIContent.none,
                joystickStyle);
            GUI.color = previous;
        }

        private void DrawButton(Rect screenRect, string label, bool active)
        {
            Rect guiRect = MobileControlLayout.ToGuiRect(screenRect);
            Color previous = GUI.color;
            GUI.color = active
                ? new Color(1f, 0.68f, 0.22f, 1f)
                : new Color(0.76f, 0.84f, 0.9f, 0.82f);
            GUI.Box(guiRect, label, buttonStyle);
            GUI.color = previous;
        }
    }
}
