using System.Collections;
using System.Collections.Generic;
using SevereWeather.Damage;
using UnityEngine;

namespace SevereWeather.World
{
    public class PowerSubstationCascade : MonoBehaviour
    {
        [SerializeField] private List<GameObject> connectedPoles = new List<GameObject>();
        [SerializeField] private ParticleSystem sparkVFX;
        [SerializeField] private float cascadeDelay = 0.1f;

        private bool isBlackedOut;

        public void TriggerCascade()
        {
            if (isBlackedOut) return;
            isBlackedOut = true;

            StartCoroutine(PropagateCascadeRoutine());
        }

        private IEnumerator PropagateCascadeRoutine()
        {
            foreach (var pole in connectedPoles)
            {
                if (pole != null)
                {
                    if (sparkVFX != null)
                    {
                        Instantiate(sparkVFX, pole.transform.position + Vector3.up * 3f, Quaternion.identity);
                    }

                    var damageable = pole.GetComponent<DamageableStructure>();
                    if (damageable != null && !damageable.IsDestroyed)
                    {
                        DamageEvent e = new DamageEvent(DamageType.Electrical, 50f, pole.transform.position, Vector3.up * 10f, gameObject);
                        damageable.ApplyDamage(in e);
                    }
                }
                yield return new WaitForSeconds(cascadeDelay);
            }
        }
    }
}
