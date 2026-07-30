using SevereWeather.Damage;
using UnityEngine;

namespace SevereWeather.World
{
    public static class TacticalTestDistrictSpawner
    {
        public static void Spawn(Vector3 stormStart)
        {
            GameObject root = new GameObject("Tornado Tactical Test District");
            Vector3 center = stormStart + new Vector3(34f, 0f, 28f);

            for (int row = 0; row < 4; row++)
            {
                for (int column = 0; column < 5; column++)
                {
                    Vector3 position = center + new Vector3(column * 11f, 1.8f + (row % 2) * 0.4f, row * 11f);
                    GameObject target = GameObject.CreatePrimitive(PrimitiveType.Cube);
                    target.name = $"Tactical Target {row}-{column}";
                    target.transform.SetParent(root.transform, true);
                    target.transform.position = position;
                    target.transform.localScale = new Vector3(7f + (column % 2) * 2f, 4f + (row % 3), 7f);
                    Rigidbody body = target.AddComponent<Rigidbody>();
                    body.isKinematic = true;
                    DamageableStructure damageable = target.AddComponent<DamageableStructure>();
                    bool conductive = (row + column) % 4 == 0;
                    MaterialClass material = conductive ? MaterialClass.Metal : (row % 2 == 0 ? MaterialClass.Wood : MaterialClass.Masonry);
                    damageable.Configure(conductive ? 95f : 75f + row * 18f, material, conductive, conductive ? MobilityClass.Medium : MobilityClass.Light);
                    target.AddComponent<WindReactive>();
                    if (conductive)
                    {
                        ConductiveNode node = target.AddComponent<ConductiveNode>();
                        node.Configure(30f, 8);
                    }
                }
            }

            SpawnLandmark(root.transform, center + new Vector3(22f, 8f, 52f), "Tactical Water Tower", MaterialClass.Infrastructure);
            SpawnLandmark(root.transform, center + new Vector3(52f, 7f, 18f), "Tactical Grain Silo", MaterialClass.Metal);
        }

        private static void SpawnLandmark(Transform parent, Vector3 position, string name, MaterialClass material)
        {
            GameObject landmark = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            landmark.name = name;
            landmark.transform.SetParent(parent, true);
            landmark.transform.position = position;
            landmark.transform.localScale = new Vector3(5f, 9f, 5f);
            Rigidbody body = landmark.AddComponent<Rigidbody>();
            body.isKinematic = true;
            DamageableStructure damageable = landmark.AddComponent<DamageableStructure>();
            damageable.Configure(260f, material, true, MobilityClass.Heavy);
            landmark.AddComponent<WindReactive>();
            ConductiveNode node = landmark.AddComponent<ConductiveNode>();
            node.Configure(42f, 12);
        }
    }
}
