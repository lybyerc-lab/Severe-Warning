using System;
using UnityEngine;

namespace SevereWeather.Core
{
    public class EFProgressionManager : MonoBehaviour
    {
        public static EFProgressionManager Instance { get; private set; }

        public event Action<string, float> OnEFRatingChanged;
        public event Action<int> OnScoreChanged;

        [Header("Progression Telemetry")]
        [SerializeField] private int destructionScore;
        [SerializeField] private string currentEFRating = "EF-0";
        [SerializeField] private float damageMultiplier = 1.0f;
        [SerializeField] private float cameraZoomScale = 1.00f;

        public int DestructionScore => destructionScore;
        public string CurrentEFRating => currentEFRating;
        public float DamageMultiplier => damageMultiplier;
        public float CameraZoomScale => cameraZoomScale;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
        }

        public void AddDestructionScore(int points)
        {
            if (points <= 0) return;
            destructionScore += points;
            UpdateEFRating();
            OnScoreChanged?.Invoke(destructionScore);
        }

        private void UpdateEFRating()
        {
            string prevRating = currentEFRating;

            if (destructionScore > 2200)
            {
                currentEFRating = "EF-5 WEDGE";
                damageMultiplier = 3.5f;
                cameraZoomScale = 1.35f;
            }
            else if (destructionScore > 1400)
            {
                currentEFRating = "EF-4";
                damageMultiplier = 2.6f;
                cameraZoomScale = 1.25f;
            }
            else if (destructionScore > 850)
            {
                currentEFRating = "EF-3";
                damageMultiplier = 2.0f;
                cameraZoomScale = 1.18f;
            }
            else if (destructionScore > 400)
            {
                currentEFRating = "EF-2";
                damageMultiplier = 1.5f;
                cameraZoomScale = 1.10f;
            }
            else if (destructionScore > 150)
            {
                currentEFRating = "EF-1";
                damageMultiplier = 1.2f;
                cameraZoomScale = 1.05f;
            }
            else
            {
                currentEFRating = "EF-0";
                damageMultiplier = 1.0f;
                cameraZoomScale = 1.00f;
            }

            if (prevRating != currentEFRating)
            {
                OnEFRatingChanged?.Invoke(currentEFRating, damageMultiplier);
            }
        }
    }
}
