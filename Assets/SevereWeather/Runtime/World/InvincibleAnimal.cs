using SevereWeather.Core;
using SevereWeather.Storms;
using UnityEngine;

namespace SevereWeather.World
{
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

        private bool isAirborne;
        private bool isLaunched;
        private float altitude;
        private float orbitAngle;
        private float groundY;
        private Vector3 launchVelocity;

        public bool IsAirborne => isAirborne;
        public string SoundQuote => soundQuote;

        private void Start()
        {
            groundY = transform.position.y;
            orbitAngle = Random.Range(0f, Mathf.PI * 2f);
        }

        private void Update()
        {
            if (isLaunched)
            {
                UpdateLaunch();
                return;
            }

            StormControllerBase activeStorm = StormGameState.ActiveStorm;
            if (activeStorm == null)
            {
                LandSafely();
                return;
            }

            Vector3 stormPosition = activeStorm.transform.position;
            float distance = Vector3.Distance(transform.position, stormPosition);

            if (distance < activeStorm.InfluenceRadius * 1.4f)
            {
                if (!isAirborne)
                {
                    isAirborne = true;
                    Debug.Log($"[WEATHER HUMOR] Invincible {kind} swept into storm! '{soundQuote}'");
                }

                orbitAngle += 2.5f * Time.deltaTime;
                altitude = Mathf.MoveTowards(altitude, maxAltitude, 8f * Time.deltaTime);

                Vector3 offset = new Vector3(
                    Mathf.Cos(orbitAngle) * (orbitRadius + altitude * 0.2f),
                    altitude,
                    Mathf.Sin(orbitAngle) * (orbitRadius + altitude * 0.2f));

                transform.position = stormPosition + offset;
                transform.Rotate(new Vector3(0.35f, 1f, 0.55f), 170f * Time.deltaTime, Space.Self);
            }
            else if (isAirborne)
            {
                DescendSafely();
            }
        }

        public void LaunchFrom(Vector3 stormPosition, float force)
        {
            Vector3 outward = transform.position - stormPosition;
            outward.y = 0f;
            if (outward.sqrMagnitude < 0.01f) outward = Vector3.forward;
            outward.Normalize();
            isAirborne = true;
            isLaunched = true;
            launchVelocity = outward * Mathf.Clamp(force, 12f, 38f) + Vector3.up * Mathf.Clamp(force * 0.42f, 7f, 15f);
            Debug.Log($"[WEATHER HUMOR] {kind} launched safely. '{soundQuote}'");
        }

        private void UpdateLaunch()
        {
            launchVelocity += Physics.gravity * 0.52f * Time.deltaTime;
            transform.position += launchVelocity * Time.deltaTime;
            transform.Rotate(new Vector3(1f, 0.7f, 0.45f), 420f * Time.deltaTime, Space.Self);

            if (transform.position.y <= groundY && launchVelocity.y <= 0f)
            {
                LandSafely();
            }

            if (Mathf.Abs(transform.position.x) > 430f || Mathf.Abs(transform.position.z) > 430f || transform.position.y < groundY - 8f)
            {
                LandSafely();
            }
        }

        private void DescendSafely()
        {
            altitude = Mathf.MoveTowards(altitude, 0f, 6f * Time.deltaTime);
            Vector3 position = transform.position;
            position.y = groundY + altitude;
            transform.position = position;
            if (altitude <= 0.05f) LandSafely();
        }

        private void LandSafely()
        {
            isAirborne = false;
            isLaunched = false;
            altitude = 0f;
            launchVelocity = Vector3.zero;
            Vector3 position = transform.position;
            position.y = groundY;
            transform.position = position;
            transform.rotation = Quaternion.identity;
        }
    }
}
