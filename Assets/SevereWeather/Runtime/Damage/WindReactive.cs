using SevereWeather.Core;
using UnityEngine;

namespace SevereWeather.Damage
{
    [DisallowMultipleComponent]
    public sealed class WindReactive : MonoBehaviour
    {
        [SerializeField, Range(0f, 24f)] private float maxLeanDegrees = 12f;
        [SerializeField, Range(0.1f, 20f)] private float responseSpeed = 7f;

        private Quaternion restRotation;

        private void Awake()
        {
            restRotation = transform.localRotation;
        }

        private void LateUpdate()
        {
            Storms.StormControllerBase storm = StormGameState.ActiveStorm;
            if (storm == null)
            {
                transform.localRotation = Quaternion.Slerp(transform.localRotation, restRotation, responseSpeed * Time.deltaTime);
                return;
            }

            Vector3 wind = storm.SampleWind(transform.position);
            float strength = Mathf.Clamp01(wind.magnitude / Mathf.Max(1f, storm.ReferenceWindSpeed));
            Vector3 localDirection = transform.parent != null
                ? transform.parent.InverseTransformDirection(wind.normalized)
                : wind.normalized;
            Quaternion target = restRotation * Quaternion.Euler(
                localDirection.z * maxLeanDegrees * strength,
                0f,
                -localDirection.x * maxLeanDegrees * strength);
            transform.localRotation = Quaternion.Slerp(transform.localRotation, target, responseSpeed * Time.deltaTime);
        }
    }
}
