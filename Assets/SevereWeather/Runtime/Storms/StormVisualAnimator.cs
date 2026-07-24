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
}
