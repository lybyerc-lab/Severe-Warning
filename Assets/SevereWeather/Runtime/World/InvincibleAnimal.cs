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
        private float altitude;
        private float orbitAngle;
        private float groundY;

        public bool IsAirborne => isAirborne;
        public string SoundQuote => soundQuote;

        private void Start()
        {
            groundY = transform.position.y;
            orbitAngle = Random.Range(0f, Mathf.PI * 2f);
        }

        private void Update()
        {
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
                transform.Rotate(Vector3.up, 120f * Time.deltaTime);
            }
            else if (isAirborne)
            {
                altitude = Mathf.MoveTowards(altitude, 0f, 6f * Time.deltaTime);
                Vector3 position = transform.position;
                position.y = groundY + altitude;
                transform.position = position;

                if (altitude <= 0.05f)
                {
                    LandSafely();
                }
            }
        }

        private void LandSafely()
        {
            isAirborne = false;
            altitude = 0f;
            Vector3 position = transform.position;
            position.y = groundY;
            transform.position = position;
            transform.rotation = Quaternion.identity;
        }
    }
}
