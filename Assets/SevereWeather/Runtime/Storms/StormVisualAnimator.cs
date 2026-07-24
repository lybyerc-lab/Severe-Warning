using UnityEngine;

namespace SevereWeather.Storms
{
    public sealed class StormVisualAnimator : MonoBehaviour
    {
        [SerializeField] private float spinDegreesPerSecond = 85f;
        [SerializeField] private float pulseAmount = 0.035f;
        [SerializeField] private float pulseSpeed = 1.7f;
        [SerializeField] private Transform spinRoot;
        [SerializeField] private Transform[] animatedLayers;

        private Vector3[] basePositions;
        private Vector3[] baseScales;

        public void Configure(float spin, Transform[] layers, Transform rotatingRoot)
        {
            spinDegreesPerSecond = spin;
            animatedLayers = layers;
            spinRoot = rotatingRoot;
            CaptureLayerState();
        }

        private void CaptureLayerState()
        {
            if (animatedLayers == null)
            {
                basePositions = null;
                baseScales = null;
                return;
            }

            basePositions = new Vector3[animatedLayers.Length];
            baseScales = new Vector3[animatedLayers.Length];
            for (int i = 0; i < animatedLayers.Length; i++)
            {
                if (animatedLayers[i] == null) continue;
                basePositions[i] = animatedLayers[i].localPosition;
                baseScales[i] = animatedLayers[i].localScale;
            }
        }

        private void Update()
        {
            if (spinRoot != null)
            {
                spinRoot.Rotate(Vector3.up, spinDegreesPerSecond * Time.deltaTime, Space.Self);
            }

            if (animatedLayers == null || basePositions == null || baseScales == null) return;

            for (int i = 0; i < animatedLayers.Length; i++)
            {
                Transform layer = animatedLayers[i];
                if (layer == null) continue;
                float phase = Time.time * pulseSpeed + i * 0.73f;
                float pulse = 1f + Mathf.Sin(phase) * pulseAmount;
                Vector3 bob = Vector3.up * Mathf.Sin(phase * 0.83f) * 0.18f;
                layer.localPosition = basePositions[i] + bob;
                layer.localScale = new Vector3(
                    baseScales[i].x * pulse,
                    baseScales[i].y,
                    baseScales[i].z * pulse);
            }
        }
    }

    public sealed class PrecipitationFieldAnimator : MonoBehaviour
    {
        [SerializeField] private Transform[] streaks;
        [SerializeField] private float fieldHeight = 18.4f;
        [SerializeField] private float fallSpeed = 17f;
        [SerializeField] private float swayAmount = 0.45f;

        private Vector3[] startPositions;

        public void Configure(Transform[] rainStreaks, float height, float speed, float sway)
        {
            streaks = rainStreaks;
            fieldHeight = Mathf.Max(1f, height);
            fallSpeed = Mathf.Max(0.1f, speed);
            swayAmount = Mathf.Max(0f, sway);
            CaptureStarts();
        }

        private void CaptureStarts()
        {
            if (streaks == null)
            {
                startPositions = null;
                return;
            }

            startPositions = new Vector3[streaks.Length];
            for (int i = 0; i < streaks.Length; i++)
            {
                if (streaks[i] != null) startPositions[i] = streaks[i].localPosition;
            }
        }

        private void Update()
        {
            if (streaks == null || startPositions == null) return;

            float dt = Time.deltaTime;
            float time = Time.time;
            for (int i = 0; i < streaks.Length; i++)
            {
                Transform streak = streaks[i];
                if (streak == null) continue;

                Vector3 position = streak.localPosition;
                position.y -= fallSpeed * (1f + (i % 4) * 0.08f) * dt;
                position.x = startPositions[i].x + Mathf.Sin(time * 1.7f + i * 0.91f) * swayAmount;
                position.z = startPositions[i].z + Mathf.Cos(time * 1.23f + i * 0.67f) * swayAmount * 0.55f;
                if (position.y < -0.4f)
                {
                    position.y += fieldHeight;
                }

                streak.localPosition = position;
            }
        }
    }
}
