using SevereWeather.Core;
using UnityEngine;

namespace SevereWeather.UI
{
    public class NOAAEASBanner : MonoBehaviour
    {
        [SerializeField] private float scrollSpeed = 80f;
        private string alertMessage = "🚨 NOAA EAS WARNING: EF-0 TORNADO TOUCHDOWN IN LINCOLN COUNTY";
        private GUIStyle bannerStyle;
        private float scrollPosition;

        private void OnEnable()
        {
            if (EFProgressionManager.Instance != null)
            {
                EFProgressionManager.Instance.OnEFRatingChanged += HandleEFRatingChanged;
            }
        }

        private void OnDisable()
        {
            if (EFProgressionManager.Instance != null)
            {
                EFProgressionManager.Instance.OnEFRatingChanged -= HandleEFRatingChanged;
            }
        }

        private void HandleEFRatingChanged(string newRating, float multiplier)
        {
            alertMessage = $"🚨 NOAA EAS WARNING: {newRating} SEVERE TOUCHDOWN IN LINCOLN COUNTY (MULT: {multiplier:0.0}x)";
        }

        private void EnsureStyle()
        {
            if (bannerStyle != null) return;
            bannerStyle = new GUIStyle(GUI.skin.box)
            {
                alignment = TextAnchor.MiddleCenter,
                fontSize = Mathf.Clamp(Screen.height / 48, 12, 16),
                fontStyle = FontStyle.Bold,
                normal = { textColor = Color.white }
            };
        }

        private void OnGUI()
        {
            EnsureStyle();
            float bannerHeight = 32f;
            Rect bannerRect = new Rect(0f, 0f, Screen.width, bannerHeight);

            Color prevColor = GUI.color;
            GUI.color = new Color(0.72f, 0.11f, 0.11f, 0.95f);
            GUI.Box(bannerRect, alertMessage, bannerStyle);
            GUI.color = prevColor;
        }
    }
}
