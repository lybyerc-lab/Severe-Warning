using SevereWeather.Damage;
using SevereWeather.Storms;
using UnityEngine;

namespace SevereWeather.CameraSystem
{
    [RequireComponent(typeof(Camera))]
    public sealed class HybridStormCamera : MonoBehaviour
    {
        [SerializeField] private float navigationPitch = 68f;
        [SerializeField] private float impactPitch = 45f;
        [SerializeField] private float navigationDistance = 92f;
        [SerializeField] private float impactDistance = 53f;
        [SerializeField] private float impactTargetRadius = 48f;
        [SerializeField] private int impactTargetThreshold = 4;
        [SerializeField] private float transitionSpeed = 2.6f;
        [SerializeField] private float yaw = 45f;

        private readonly Collider[] nearbyBuffer = new Collider[128];
        private StormControllerBase target;
        private float currentPitch;
        private float currentDistance;
        private Vector3 smoothVelocity;

        public void SetTarget(StormControllerBase newTarget)
        {
            target = newTarget;
        }

        private void Awake()
        {
            currentPitch = navigationPitch;
            currentDistance = navigationDistance;
            Camera cameraComponent = GetComponent<Camera>();
            cameraComponent.fieldOfView = 48f;
            cameraComponent.nearClipPlane = 0.15f;
            cameraComponent.farClipPlane = 1200f;
        }

        private void LateUpdate()
        {
            if (target == null) return;

            bool impact = CountNearbyTargets() >= impactTargetThreshold;
            float targetPitch = impact ? impactPitch : navigationPitch;
            float targetDistance = impact ? impactDistance : navigationDistance;

            if (target.Kind == StormKind.Supercell)
            {
                targetDistance *= 1.18f;
            }

            currentPitch = Mathf.Lerp(currentPitch, targetPitch, 1f - Mathf.Exp(-transitionSpeed * Time.deltaTime));
            currentDistance = Mathf.Lerp(currentDistance, targetDistance, 1f - Mathf.Exp(-transitionSpeed * Time.deltaTime));

            Quaternion rotation = Quaternion.Euler(currentPitch, yaw, 0f);
            Vector3 lookAhead = target.PlanarVelocity * 1.35f;
            Vector3 focus = target.transform.position + lookAhead;
            Vector3 desired = focus - rotation * Vector3.forward * currentDistance;
            transform.position = Vector3.SmoothDamp(transform.position, desired, ref smoothVelocity, 0.16f);
            transform.rotation = Quaternion.LookRotation(focus - transform.position, Vector3.up);
        }

        private int CountNearbyTargets()
        {
            int count = Physics.OverlapSphereNonAlloc(
                target.transform.position,
                impactTargetRadius,
                nearbyBuffer,
                ~0,
                QueryTriggerInteraction.Ignore);
            int targets = 0;
            for (int i = 0; i < count; i++)
            {
                if (nearbyBuffer[i].GetComponentInParent<DamageableStructure>() != null)
                {
                    targets++;
                }
            }
            return targets;
        }
    }
}
