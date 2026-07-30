using SevereWeather.Core;
using SevereWeather.Storms;
using UnityEngine;

namespace SevereWeather.World
{
    [RequireComponent(typeof(Collider), typeof(Rigidbody))]
    public sealed class InvincibleAnimal : MonoBehaviour
    {
        public enum AnimalKind
        {
            Cow,
            Pig,
            Sheep,
            Chicken
        }

        [SerializeField] private AnimalKind kind = AnimalKind.Cow;
        [SerializeField] private string soundQuote = "MOOO!";
        [SerializeField] private float orbitRadius = 4f;
        [SerializeField] private float maxAltitude = 12f;

        private Rigidbody body;
        private StormControllerBase capturedBy;
        private bool isAirborne;
        private bool isCaptured;
        private bool landingReported;
        private float altitude;
        private float orbitAngle;
        private float groundY;
        private float safeLandingTimer;

        public bool IsAirborne => isAirborne;
        public bool IsCaptured => isCaptured;
        public string SoundQuote => soundQuote;

        private void Awake()
        {
            body = GetComponent<Rigidbody>();
            body.useGravity = true;
            body.collisionDetectionMode = CollisionDetectionMode.ContinuousDynamic;
        }

        private void Start()
        {
            groundY = transform.position.y;
            orbitAngle = Random.Range(0f, Mathf.PI * 2f);
        }

        public void Configure(AnimalKind animalKind, string quote, float radius, float altitudeLimit)
        {
            kind = animalKind;
            soundQuote = quote;
            orbitRadius = radius;
            maxAltitude = altitudeLimit;
        }

        public void Capture(StormControllerBase storm)
        {
            if (storm == null || isCaptured) return;
            capturedBy = storm;
            isCaptured = true;
            isAirborne = true;
            landingReported = false;
            safeLandingTimer = 0f;
            body.isKinematic = true;
            body.linearVelocity = Vector3.zero;
            body.angularVelocity = Vector3.zero;
            Debug.Log($"[WEATHER HUMOR] Invincible {kind} swept into storm! '{soundQuote}'");
            TornadoTacticalDirector.Instance?.RecordAnimalAirborne(this);
        }

        public void Fling(Vector3 impulse)
        {
            if (!isCaptured) return;
            isCaptured = false;
            capturedBy = null;
            body.isKinematic = false;
            body.useGravity = true;
            body.linearVelocity = Vector3.zero;
            body.angularVelocity = Random.onUnitSphere * 4f;
            body.AddForce(impulse, ForceMode.Impulse);
            safeLandingTimer = 1.1f;
        }

        private void Update()
        {
            if (isCaptured && capturedBy != null)
            {
                orbitAngle += 2.5f * Time.deltaTime;
                altitude = Mathf.MoveTowards(altitude, maxAltitude, 8f * Time.deltaTime);
                Vector3 offset = new Vector3(
                    Mathf.Cos(orbitAngle) * (orbitRadius + altitude * 0.2f),
                    altitude,
                    Mathf.Sin(orbitAngle) * (orbitRadius + altitude * 0.2f));
                transform.position = capturedBy.transform.position + offset;
                transform.Rotate(new Vector3(1f, 1f, 0.4f), 180f * Time.deltaTime, Space.Self);
                return;
            }

            if (!isAirborne) return;
            safeLandingTimer = Mathf.Max(0f, safeLandingTimer - Time.deltaTime);

            if (!isCaptured && safeLandingTimer <= 0f && transform.position.y <= groundY + 0.45f && body.linearVelocity.y <= 0.5f)
            {
                LandSafely();
            }

            if (transform.position.y < groundY - 8f || transform.position.sqrMagnitude > 900000f)
            {
                Vector3 safe = transform.position;
                safe.y = groundY + 0.5f;
                safe.x = Mathf.Clamp(safe.x, -380f, 380f);
                safe.z = Mathf.Clamp(safe.z, -380f, 380f);
                transform.position = safe;
                LandSafely();
            }
        }

        private void LandSafely()
        {
            isCaptured = false;
            capturedBy = null;
            isAirborne = false;
            altitude = 0f;
            body.isKinematic = false;
            body.linearVelocity = Vector3.zero;
            body.angularVelocity = Vector3.zero;
            Vector3 position = transform.position;
            position.y = groundY;
            transform.position = position;
            transform.rotation = Quaternion.identity;
            if (!landingReported)
            {
                landingReported = true;
                TornadoTacticalDirector.Instance?.RecordAnimalLanded(this);
            }
        }
    }
}
