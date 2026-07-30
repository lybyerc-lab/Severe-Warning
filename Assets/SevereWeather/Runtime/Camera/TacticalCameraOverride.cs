using SevereWeather.Storms;
using UnityEngine;

namespace SevereWeather.CameraSystem
{
    [RequireComponent(typeof(Camera))]
    public sealed class TacticalCameraOverride : MonoBehaviour
    {
        [SerializeField] private float height = 78f;
        [SerializeField] private float distance = 110f;
        [SerializeField] private float mobileScale = 1.18f;
        [SerializeField] private float lookAhead = 20f;
        [SerializeField] private float positionSmooth = 0.24f;
        [SerializeField] private float focusSmooth = 0.18f;
        [SerializeField] private float yaw = 0f;

        private TornadoController target;
        private Vector3 positionVelocity;
        private Vector3 focusVelocity;
        private Vector3 smoothedFocus;
        private Vector3 lastPosition;
        private Camera cameraComponent;

        public void Configure(TornadoController tornado)
        {
            target = tornado;
            if (target == null) return;
            lastPosition = target.transform.position;
            smoothedFocus = lastPosition;
            Snap();
        }

        private void Awake()
        {
            cameraComponent = GetComponent<Camera>();
            cameraComponent.fieldOfView = 45f;
            cameraComponent.nearClipPlane = 0.2f;
            cameraComponent.farClipPlane = 1600f;
        }

        private void LateUpdate()
        {
            if (target == null) return;
            float dt = Mathf.Max(0.0001f, Time.deltaTime);
            Vector3 velocity = (target.transform.position - lastPosition) / dt;
            lastPosition = target.transform.position;
            velocity.y = 0f;
            Vector3 direction = velocity.sqrMagnitude > 0.25f ? velocity.normalized : target.transform.forward;
            direction.y = 0f;
            if (direction.sqrMagnitude < 0.01f) direction = Vector3.forward;

            Vector3 focusGoal = target.transform.position + direction * lookAhead + Vector3.up * 3f;
            smoothedFocus = Vector3.SmoothDamp(smoothedFocus, focusGoal, ref focusVelocity, focusSmooth, Mathf.Infinity, dt);

            float scale = Application.isMobilePlatform ? mobileScale : 1f;
            Quaternion orbit = Quaternion.Euler(0f, yaw, 0f);
            Vector3 backward = orbit * new Vector3(0f, 0f, -distance * scale);
            Vector3 desired = smoothedFocus + backward + Vector3.up * height * scale;
            transform.position = Vector3.SmoothDamp(transform.position, desired, ref positionVelocity, positionSmooth, Mathf.Infinity, dt);
            transform.rotation = Quaternion.LookRotation(smoothedFocus - transform.position, Vector3.up);
        }

        private void Snap()
        {
            float scale = Application.isMobilePlatform ? mobileScale : 1f;
            Vector3 desired = smoothedFocus + new Vector3(0f, height * scale, -distance * scale);
            transform.position = desired;
            transform.rotation = Quaternion.LookRotation(smoothedFocus - transform.position, Vector3.up);
            positionVelocity = Vector3.zero;
            focusVelocity = Vector3.zero;
        }
    }
}
