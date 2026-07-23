using UnityEngine;

namespace SevereWeather.Storms
{
    public sealed class StormVisualAnimator : MonoBehaviour
    {
        [SerializeField] private float spinDegreesPerSecond = 85f;
        [SerializeField] private float pulseAmount = 0.025f;
        [SerializeField] private float pulseSpeed = 1.5f;
        [SerializeField] private Transform[] rotatingLayers;

        private Vector3 baseScale;

        public void Configure(float spin, Transform[] layers)
        {
            spinDegreesPerSecond = spin;
            rotatingLayers = layers;
        }

        private void Awake()
        {
            baseScale = transform.localScale;
        }

        private void Update()
        {
            if (rotatingLayers != null)
            {
                for (int i = 0; i < rotatingLayers.Length; i++)
                {
                    if (rotatingLayers[i] != null)
                    {
                        float direction = (i & 1) == 0 ? 1f : -0.65f;
                        rotatingLayers[i].Rotate(Vector3.up, spinDegreesPerSecond * direction * Time.deltaTime, Space.Self);
                    }
                }
            }

            float pulse = 1f + Mathf.Sin(Time.time * pulseSpeed) * pulseAmount;
            transform.localScale = new Vector3(baseScale.x * pulse, baseScale.y, baseScale.z * pulse);
        }
    }
}
