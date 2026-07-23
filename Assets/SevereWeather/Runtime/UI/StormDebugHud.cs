using SevereWeather.Input;
using SevereWeather.Storms;
using UnityEngine;

namespace SevereWeather.UI
{
    public sealed class StormDebugHud : MonoBehaviour
    {
        private StormInput input;
        private StormControllerBase storm;
        private GUIStyle titleStyle;
        private GUIStyle smallStyle;
        private GUIStyle buttonStyle;

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
            if (titleStyle != null) return;
            titleStyle = new GUIStyle(GUI.skin.label)
            {
                fontSize = 18,
                fontStyle = FontStyle.Bold,
                normal = { textColor = Color.white }
            };
            smallStyle = new GUIStyle(GUI.skin.label)
            {
                fontSize = 13,
                normal = { textColor = new Color(0.9f, 0.95f, 1f) }
            };
            buttonStyle = new GUIStyle(GUI.skin.box)
            {
                alignment = TextAnchor.MiddleCenter,
                fontSize = 14,
                fontStyle = FontStyle.Bold,
                normal = { textColor = Color.white }
            };
        }

        private void OnGUI()
        {
            EnsureStyles();
            if (storm == null) return;

            float safeTop = Screen.safeArea.yMax < Screen.height ? Screen.height - Screen.safeArea.yMax : 10f;
            GUI.Box(new Rect(14f, safeTop + 12f, 265f, 92f), GUIContent.none);
            GUI.Label(new Rect(28f, safeTop + 22f, 240f, 25f), $"{storm.Kind} · LV {storm.Level:0}", titleStyle);
            GUI.Label(new Rect(28f, safeTop + 51f, 240f, 22f), $"Power {storm.Power:0}   Stability {storm.Stability:0}", smallStyle);
            GUI.Label(new Rect(28f, safeTop + 73f, 240f, 22f), "TAB or top-center: switch storm", smallStyle);

            float buttonSize = Mathf.Clamp(Screen.height * 0.18f, 66f, 105f);
            float gap = 10f;
            float right = Screen.width - Screen.safeArea.xMax + 16f;
            float bottom = Screen.height - Screen.safeArea.yMax + 18f;
            Rect primary = new Rect(Screen.width - right - buttonSize, Screen.height - bottom - buttonSize, buttonSize, buttonSize);
            Rect tertiary = new Rect(primary.x - gap - buttonSize * 0.82f, primary.y + buttonSize * 0.18f, buttonSize * 0.82f, buttonSize * 0.82f);
            Rect secondary = new Rect(tertiary.x - gap - buttonSize * 0.82f, tertiary.y, buttonSize * 0.82f, buttonSize * 0.82f);

            string primaryName = storm.Kind == StormKind.Tornado ? "SUCTION" : "HAIL SWATH";
            string secondaryName = storm.Kind == StormKind.Tornado ? "GUST" : "GUST FRONT";
            string tertiaryName = storm.Kind == StormKind.Tornado ? "LIGHTNING" : "NETWORK";
            GUI.Box(primary, primaryName, buttonStyle);
            GUI.Box(secondary, secondaryName, buttonStyle);
            GUI.Box(tertiary, tertiaryName, buttonStyle);

            Rect switchRect = new Rect(Screen.width * 0.39f, safeTop + 8f, Screen.width * 0.22f, 48f);
            GUI.Box(switchRect, $"STORM: {storm.Kind}", buttonStyle);

            GUI.Label(new Rect(16f, Screen.height - 32f, 420f, 24f), "Left drag: move · Right zones: abilities", smallStyle);
        }
    }
}
