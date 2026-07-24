using SevereWeather.Damage;
using SevereWeather.Storms;
using UnityEngine;

namespace SevereWeather.CameraSystem
{
    [RequireComponent(typeof(Camera))]
    public sealed class HybridStormCamera : MonoBehaviour
    {
        [Header("Tornado framing")]
        [SerializeField] private float tornadoNavigationPitch = 50f;
        [SerializeField] private float tornadoImpactPitch = 43f;
        [SerializeField] private float tornadoNavigationDistance = 58f;
        [SerializeField] private float tornadoImpactDistance = 46f;
        [SerializeField] private float tornadoLeashRadius = 13f;

        [Header("Supercell framing")]
        [SerializeField] private float supercellNavigationPitch = 52f;
        [SerializeField] private float supercellImpactPitch = 46f;
        [SerializeField] private float supercellNavigationDistance = 82f;
        [SerializeField] private float supercellImpactDistance = 70f;
        [SerializeField] private float supercellLeashRadius = 15f;

        [Header("Screen containment")]
        [SerializeField] private float softViewportMargin = 0.22f;
        [SerializeField] private float hardViewportMargin = 0.08f;
        [SerializeField] private float tornadoCatchupMin = 4.8f;
        [SerializeField] private float tornadoCatchupMax = 8.5f;
        [SerializeField] private float supercellCatchupMin = 2.4f;
        [SerializeField] private float supercellCatchupMax = 3.6f;
        [SerializeField] private float softContainmentResponse = 11f;

        [Header("Shared camera")]
        [SerializeField] private float impactTargetRadius = 42f;
        [SerializeField] private int impactTargetThreshold = 3;
        [SerializeField] private float transitionSpeed = 3.2f;
        [SerializeField] private float yaw = 45f;
        [SerializeField] private float worldClamp = 440f;

        private readonly Collider[] nearbyBuffer = new Collider[128];
        private Camera cameraComponent;
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

        public bool IsTargetInsideSafeFrame { get; private set; } = true;
        public bool UsedHardContainment { get; private set; }

        public void SetTarget(StormControllerBase newTarget)
        {
            target = newTarget;
            if (target == null) return;

            focusAnchor = target.transform.position;
            smoothedFocus = focusAnchor + Vector3.up * GetFocusHeight();
            focusVelocity = Vector3.zero;
            cameraVelocity = Vector3.zero;
            hasFocus = true;
            IsTargetInsideSafeFrame = true;
            UsedHardContainment = false;
        }

        private void Awake()
        {
            cameraComponent = GetComponent<Camera>();
            currentPitch = tornadoNavigationPitch;
            currentDistance = tornadoNavigationDistance;
            cameraComponent.fieldOfView = 52f;
            cameraComponent.nearClipPlane = 0.15f;
            cameraComponent.farClipPlane = 1400f;
            cameraComponent.allowMSAA = true;
        }

        private void LateUpdate()
        {
            if (target == null) return;
            if (!hasFocus) SetTarget(target);

            float dt = Mathf.Max(0.0001f, Time.deltaTime);
            UpdateFocusAnchor(dt);

            if (Time.unscaledTime >= nextImpactSampleTime)
            {
                nextImpactSampleTime = Time.unscaledTime + 0.25f;
                significantTargetCount = CountNearbySignificantTargets();
            }

            bool impact = target.HasRecentAction || significantTargetCount >= impactTargetThreshold;
            bool supercell = target.Kind == StormKind.Supercell;
            float targetPitch = supercell
                ? impact ? supercellImpactPitch : supercellNavigationPitch
                : impact ? tornadoImpactPitch : tornadoNavigationPitch;
            float targetDistance = supercell
                ? impact ? supercellImpactDistance : supercellNavigationDistance
                : impact ? tornadoImpactDistance : tornadoNavigationDistance;

            float transition = 1f - Mathf.Exp(-transitionSpeed * dt);
            currentPitch = Mathf.Lerp(currentPitch, targetPitch, transition);
            currentDistance = Mathf.Lerp(currentDistance, targetDistance, transition);

            UpdateCameraPose(dt, false);
            ApplyViewportContainment(dt);
        }

        private void UpdateFocusAnchor(float dt)
        {
            Vector3 targetPosition = target.transform.position;
            Vector3 planarDelta = targetPosition - focusAnchor;
            planarDelta.y = 0f;

            bool supercell = target.Kind == StormKind.Supercell;
            float leashRadius = supercell ? supercellLeashRadius : tornadoLeashRadius;
            float expectedTopSpeed = supercell ? 16.5f : 28f;
            float speed01 = Mathf.InverseLerp(0f, expectedTopSpeed, target.Speed);
            float catchupSpeed = supercell
                ? Mathf.Lerp(supercellCatchupMin, supercellCatchupMax, speed01)
                : Mathf.Lerp(tornadoCatchupMin, tornadoCatchupMax, speed01);

            float distance = planarDelta.magnitude;
            if (distance > leashRadius && distance > 0.0001f)
            {
                Vector3 direction = planarDelta / distance;
                Vector3 desiredAnchor = targetPosition - direction * leashRadius;
                float catchup = 1f - Mathf.Exp(-catchupSpeed * dt);
                focusAnchor = Vector3.Lerp(focusAnchor, desiredAnchor, catchup);
            }

            float maximumOffset = leashRadius * (supercell ? 1.5f : 1.35f);
            Vector3 remaining = targetPosition - focusAnchor;
            remaining.y = 0f;
            if (remaining.magnitude > maximumOffset)
            {
                focusAnchor = targetPosition - remaining.normalized * maximumOffset;
            }

            focusAnchor.y = targetPosition.y;
        }

        private void UpdateCameraPose(float dt, bool urgent)
        {
            bool supercell = target.Kind == StormKind.Supercell;
            float focusSmoothTime = urgent ? 0.08f : supercell ? 0.46f : 0.24f;
            float cameraSmoothTime = urgent ? 0.07f : supercell ? 0.32f : 0.18f;
            Vector3 focusGoal = focusAnchor + Vector3.up * GetFocusHeight();

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

        private void ApplyViewportContainment(float dt)
        {
            UsedHardContainment = false;
            Vector3 trackedPoint = target.transform.position + Vector3.up * GetTrackedPointHeight();
            Vector3 viewport = cameraComponent.WorldToViewportPoint(trackedPoint);

            float softMin = softViewportMargin;
            float softMax = 1f - softViewportMargin;
            float hardMin = hardViewportMargin;
            float hardMax = 1f - hardViewportMargin;
            bool inFront = viewport.z > 0f;
            bool outsideSoft = !inFront ||
                               viewport.x < softMin || viewport.x > softMax ||
                               viewport.y < softMin || viewport.y > softMax;
            bool outsideHard = !inFront ||
                               viewport.x < hardMin || viewport.x > hardMax ||
                               viewport.y < hardMin || viewport.y > hardMax;

            IsTargetInsideSafeFrame = !outsideSoft;
            if (!outsideSoft) return;

            Vector3 targetPosition = target.transform.position;
            if (outsideHard)
            {
                focusAnchor = targetPosition;
                focusAnchor.y = targetPosition.y;
                smoothedFocus = focusAnchor + Vector3.up * GetFocusHeight();
                focusVelocity = Vector3.zero;
                cameraVelocity = Vector3.zero;
                SnapCameraToCurrentFrame();
                UsedHardContainment = true;
                return;
            }

            float overflow = Mathf.Max(
                AxisOverflow(viewport.x, softMin, softMax),
                AxisOverflow(viewport.y, softMin, softMax));
            float response = Mathf.Lerp(
                softContainmentResponse * 0.7f,
                softContainmentResponse * 1.35f,
                Mathf.Clamp01(overflow / 0.16f));
            float blend = 1f - Mathf.Exp(-response * dt);
            focusAnchor = Vector3.Lerp(focusAnchor, targetPosition, blend);
            focusAnchor.y = targetPosition.y;
            UpdateCameraPose(dt, true);
        }

        private void SnapCameraToCurrentFrame()
        {
            Quaternion rotation = Quaternion.Euler(currentPitch, yaw, 0f);
            Vector3 desired = smoothedFocus - rotation * Vector3.forward * currentDistance;
            desired.x = Mathf.Clamp(desired.x, -worldClamp, worldClamp);
            desired.z = Mathf.Clamp(desired.z, -worldClamp, worldClamp);
            transform.position = desired;
            transform.rotation = Quaternion.LookRotation(smoothedFocus - transform.position, Vector3.up);
        }

        private float GetFocusHeight()
        {
            return target != null && target.Kind == StormKind.Supercell ? 10f : 4.5f;
        }

        private float GetTrackedPointHeight()
        {
            return target != null && target.Kind == StormKind.Supercell ? 9f : 5f;
        }

        private static float AxisOverflow(float value, float minimum, float maximum)
        {
            if (value < minimum) return minimum - value;
            if (value > maximum) return value - maximum;
            return 0f;
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
