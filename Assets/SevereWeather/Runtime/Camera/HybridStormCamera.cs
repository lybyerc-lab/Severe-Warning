using SevereWeather.Damage;
using SevereWeather.Storms;
using UnityEngine;

namespace SevereWeather.CameraSystem
{
    [RequireComponent(typeof(Camera))]
    public sealed class HybridStormCamera : MonoBehaviour
    {
        [SerializeField] private float navigationPitch = 50f;
        [SerializeField] private float impactPitch = 43f;
        [SerializeField] private float navigationDistance = 56f;
        [SerializeField] private float impactDistance = 42f;
        [SerializeField] private float tornadoLeashRadius = 22f;
        [SerializeField] private float supercellLeashRadius = 18f;
        [SerializeField] private float anchorCatchupSpeed = 2.1f;
        [SerializeField] private float impactTargetRadius = 42f;
        [SerializeField] private int impactTargetThreshold = 3;
        [SerializeField] private float transitionSpeed = 2.8f;
        [SerializeField] private float focusSmoothTime = 0.55f;
        [SerializeField] private float cameraSmoothTime = 0.3f;
        [SerializeField] private float yaw = 45f;
        [SerializeField] private float worldClamp = 440f;

        private readonly Collider[] nearbyBuffer = new Collider[128];
        private StormControllerBase target;
        private float currentPitch;
        private float currentDistance;
        private Vector3 cameraVelocity;
        private Vector3 focusVelocity;
        private Vector3 focusAnchor;
        private Vector3 smoothedFocus;
        private bool hasFocus;
        private float nextImpactSampleTime;
        private int significantTargetCount;

        public void SetTarget(StormControllerBase newTarget)
        {
            target = newTarget;
            if (target == null) return;
            focusAnchor = target.transform.position;
            smoothedFocus = focusAnchor;
            focusVelocity = Vector3.zero;
            hasFocus = true;
        }

        private void Awake()
        {
            currentPitch = navigationPitch;
            currentDistance = navigationDistance;
            Camera cameraComponent = GetComponent<Camera>();
            cameraComponent.fieldOfView = 52f;
            cameraComponent.nearClipPlane = 0.15f;
            cameraComponent.farClipPlane = 1400f;
            cameraComponent.allowMSAA = true;
        }

        private void LateUpdate()
        {
            if (target == null) return;
            if (!hasFocus) SetTarget(target);

            UpdateFocusAnchor();
            if (Time.unscaledTime >= nextImpactSampleTime)
            {
                nextImpactSampleTime = Time.unscaledTime + 0.25f;
                significantTargetCount = CountNearbySignificantTargets();
            }

            bool impact = target.HasRecentAction || significantTargetCount >= impactTargetThreshold;
            float targetPitch = impact ? impactPitch : navigationPitch;
            float targetDistance = impact ? impactDistance : navigationDistance;
            if (target.Kind == StormKind.Supercell)
            {
                targetDistance *= 1.08f;
            }

            float dt = Time.deltaTime;
            currentPitch = Mathf.Lerp(currentPitch, targetPitch, 1f - Mathf.Exp(-transitionSpeed * dt));
            currentDistance = Mathf.Lerp(currentDistance, targetDistance, 1f - Mathf.Exp(-transitionSpeed * dt));

            Vector3 focusGoal = focusAnchor + Vector3.up * (target.Kind == StormKind.Supercell ? 7f : 4f);
            smoothedFocus = Vector3.SmoothDamp(
                smoothedFocus,
                focusGoal,
                ref focusVelocity,
                focusSmoothTime,
                Mathf.Infinity,
                dt);

            Quaternion rotation = Quaternion.Euler(currentPitch, yaw, 0f);
            Vector3 desired = smoothedFocus - rotation * Vector3.forward * currentDistance;
            desired.x = Mathf.Clamp(desired.x, -worldClamp, worldClamp);
            desired.z = Mathf.Clamp(desired.z, -worldClamp, worldClamp);
            transform.position = Vector3.SmoothDamp(
                transform.position,
                desired,
                ref cameraVelocity,
                cameraSmoothTime,
                Mathf.Infinity,
                dt);
            transform.rotation = Quaternion.LookRotation(smoothedFocus - transform.position, Vector3.up);
        }

        private void UpdateFocusAnchor()
        {
            Vector3 targetPosition = target.transform.position;
            Vector3 planarDelta = targetPosition - focusAnchor;
            planarDelta.y = 0f;
            float leashRadius = target.Kind == StormKind.Supercell ? supercellLeashRadius : tornadoLeashRadius;
            float distance = planarDelta.magnitude;
            if (distance > leashRadius)
            {
                Vector3 direction = planarDelta / distance;
                Vector3 desiredAnchor = targetPosition - direction * leashRadius;
                float catchup = 1f - Mathf.Exp(-anchorCatchupSpeed * Time.deltaTime);
                focusAnchor = Vector3.Lerp(focusAnchor, desiredAnchor, catchup);

                float maximumOffset = leashRadius * 2.1f;
                Vector3 remaining = targetPosition - focusAnchor;
                remaining.y = 0f;
                if (remaining.magnitude > maximumOffset)
                {
                    focusAnchor = targetPosition - remaining.normalized * maximumOffset;
                }
            }

            focusAnchor.y = targetPosition.y;
        }

        private int CountNearbySignificantTargets()
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
                DamageableStructure damageable = nearbyBuffer[i].GetComponentInParent<DamageableStructure>();
                if (damageable == null || damageable.IsDestroyed) continue;
                if (damageable.MaterialClass == MaterialClass.Crop) continue;
                targets++;
            }
            return targets;
        }
    }
}
