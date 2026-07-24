using SevereWeather.Core;
using SevereWeather.Damage;
using SevereWeather.Input;
using UnityEngine;

namespace SevereWeather.Storms
{
    [RequireComponent(typeof(Rigidbody))]
    public abstract class StormControllerBase : MonoBehaviour
    {
        protected const int OverlapCapacity = 384;
        private const float PassiveFieldInterval = 0.1f;

        [SerializeField] protected float power = 100f;
        [SerializeField] protected float stability = 100f;
        [SerializeField] protected float level = 1f;
        [SerializeField] protected float moveSpeed = 16f;
        [SerializeField] protected float acceleration = 22f;
        [SerializeField] protected float referenceWindSpeed = 45f;

        protected readonly Collider[] overlapBuffer = new Collider[OverlapCapacity];
        protected StormInput stormInput;
        protected Rigidbody body;
        protected Vector3 planarVelocity;

        private float passiveAccumulator;
        private float distanceTravelled;
        private string actionStatus = "READY";
        private float actionStatusUntil;
        private int lastActionTargetCount;

        public abstract StormKind Kind { get; }
        public abstract float InfluenceRadius { get; }
        public float Power => power;
        public float Stability => stability;
        public float Level => level;
        public float ReferenceWindSpeed => referenceWindSpeed;
        public Vector3 PlanarVelocity => planarVelocity;
        public float Speed => planarVelocity.magnitude;
        public float DistanceTravelled => distanceTravelled;
        public bool HasRecentAction => Time.unscaledTime <= actionStatusUntil;
        public string ActionStatus => HasRecentAction ? actionStatus : "READY";
        public int LastActionTargetCount => HasRecentAction ? lastActionTargetCount : 0;

        protected virtual void Awake()
        {
            body = GetComponent<Rigidbody>();
            body.useGravity = false;
            body.isKinematic = true;
            body.interpolation = RigidbodyInterpolation.Interpolate;
        }

        protected virtual void OnEnable()
        {
            StormGameState.SetActiveStorm(this);
        }

        protected virtual void OnDisable()
        {
            StormGameState.Clear(this);
        }

        public void ConfigureInput(StormInput inputSource)
        {
            stormInput = inputSource;
        }

        protected virtual void FixedUpdate()
        {
            float dt = Time.fixedDeltaTime;
            Vector2 inputVector = stormInput != null ? stormInput.Move : Vector2.zero;
            MoveStorm(inputVector, dt);
            RegenerateResources(dt);

            passiveAccumulator += dt;
            if (passiveAccumulator >= PassiveFieldInterval)
            {
                float passiveDt = passiveAccumulator;
                passiveAccumulator = 0f;
                ApplyPassiveField(passiveDt);
            }

            HandleAbilities(dt);
        }

        protected virtual void MoveStorm(Vector2 inputVector, float dt)
        {
            Vector3 desired = GetCameraRelativeDirection(inputVector) * moveSpeed;
            planarVelocity = Vector3.MoveTowards(planarVelocity, desired, acceleration * dt);
            Vector3 displacement = planarVelocity * dt;
            body.MovePosition(body.position + displacement);
            RecordDisplacement(displacement);

            if (planarVelocity.sqrMagnitude > 0.15f)
            {
                transform.rotation = Quaternion.Slerp(
                    transform.rotation,
                    Quaternion.LookRotation(planarVelocity.normalized, Vector3.up),
                    4f * dt);
            }
        }

        protected void RecordDisplacement(Vector3 displacement)
        {
            distanceTravelled += displacement.magnitude;
        }

        protected Vector3 GetCameraRelativeDirection(Vector2 inputVector)
        {
            if (inputVector.sqrMagnitude <= 0.0001f)
            {
                return Vector3.zero;
            }

            Camera activeCamera = Camera.main;
            if (activeCamera == null)
            {
                return Vector3.ClampMagnitude(new Vector3(inputVector.x, 0f, inputVector.y), 1f);
            }

            Vector3 forward = activeCamera.transform.forward;
            forward.y = 0f;
            if (forward.sqrMagnitude <= 0.0001f)
            {
                forward = Vector3.forward;
            }
            else
            {
                forward.Normalize();
            }

            Vector3 right = activeCamera.transform.right;
            right.y = 0f;
            if (right.sqrMagnitude <= 0.0001f)
            {
                right = Vector3.right;
            }
            else
            {
                right.Normalize();
            }

            Vector3 direction = right * inputVector.x + forward * inputVector.y;
            return Vector3.ClampMagnitude(direction, 1f);
        }

        protected void ReportAction(string status, int targetCount, float visibleSeconds = 1.2f)
        {
            actionStatus = status;
            lastActionTargetCount = Mathf.Max(0, targetCount);
            actionStatusUntil = Time.unscaledTime + Mathf.Max(0.1f, visibleSeconds);
        }

        protected virtual void RegenerateResources(float dt)
        {
            power = Mathf.Min(100f, power + 3f * dt);
            stability = Mathf.Min(100f, stability + 0.65f * dt);
        }

        protected abstract void HandleAbilities(float dt);
        protected abstract void ApplyPassiveField(float dt);
        public abstract Vector3 SampleWind(Vector3 worldPosition);

        protected int Query(Vector3 center, float radius)
        {
            return Physics.OverlapSphereNonAlloc(
                center,
                radius,
                overlapBuffer,
                ~0,
                QueryTriggerInteraction.Ignore);
        }

        protected static bool TryGetDamageable(Collider collider, out DamageableStructure damageable)
        {
            damageable = collider.GetComponentInParent<DamageableStructure>();
            return damageable != null && !damageable.IsDestroyed;
        }

        protected void ApplyDamage(
            DamageableStructure damageable,
            DamageType type,
            float amount,
            Vector3 worldPoint,
            Vector3 impulse)
        {
            DamageEvent damageEvent = new DamageEvent(type, amount, worldPoint, impulse, gameObject);
            damageable.ApplyDamage(in damageEvent);
        }
    }
}
