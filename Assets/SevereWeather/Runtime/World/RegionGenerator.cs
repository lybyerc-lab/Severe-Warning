using System;
using SevereWeather.Damage;
using UnityEngine;

namespace SevereWeather.World
{
    [DisallowMultipleComponent]
    public sealed class RegionGenerator : MonoBehaviour
    {
        [SerializeField] private int seed = 8817;
        [SerializeField] private Vector2 regionSize = new Vector2(420f, 420f);
        [SerializeField] private Vector3 starterSpawnPosition = new Vector3(-122f, 2f, 112f);

        private Material distantGround;
        private Material grass;
        private Material field;
        private Material road;
        private Material roadEdge;
        private Material laneMarking;
        private Material residential;
        private Material commercial;
        private Material industrial;
        private Material roof;
        private Material metal;
        private Material glass;
        private Material crop;
        private Material tree;
        private Material trunk;
        private Material vehicleA;
        private Material vehicleB;
        private Material distantHill;

        public Vector3 StarterSpawnPosition => starterSpawnPosition;

        public void Generate()
        {
            if (transform.childCount > 0)
            {
                return;
            }

            UnityEngine.Random.InitState(seed);
            CreateMaterials();
            CreateBackdrop();
            CreateTerrain();
            CreateRoadNetwork();
            CreateFarmlandDistrict(new Vector3(-115f, 0f, 105f));
            CreateSmallTownDistrict(new Vector3(-20f, 0f, 65f));
            CreateSuburbanDistrict(new Vector3(92f, 0f, 72f));
            CreateCommercialDistrict(new Vector3(82f, 0f, -32f));
            CreateIndustrialDistrict(new Vector3(-75f, 0f, -95f));
            CreateCivicDistrict(new Vector3(20f, 0f, -118f));
            CreateUtilityCorridors();

            DensityReport report = WorldDensityValidator.Evaluate();
            Debug.Log($"[Severe Weather] Region density validation: {report}");
        }

        private void CreateMaterials()
        {
            distantGround = PrimitiveFactory.CreateMaterial("Distant Ground", new Color(0.16f, 0.24f, 0.16f), 0f, 0.02f);
            grass = PrimitiveFactory.CreateMaterial("Grass", new Color(0.25f, 0.43f, 0.22f), 0f, 0.12f);
            field = PrimitiveFactory.CreateMaterial("Field", new Color(0.5f, 0.39f, 0.13f), 0f, 0.08f);
            road = PrimitiveFactory.CreateMaterial("Road", new Color(0.095f, 0.105f, 0.115f), 0f, 0.3f);
            roadEdge = PrimitiveFactory.CreateMaterial("RoadEdge", new Color(0.3f, 0.28f, 0.24f), 0f, 0.08f);
            laneMarking = PrimitiveFactory.CreateMaterial("Lane Marking", new Color(0.95f, 0.72f, 0.16f), 0f, 0.14f);
            residential = PrimitiveFactory.CreateMaterial("Residential", new Color(0.72f, 0.59f, 0.4f), 0f, 0.22f);
            commercial = PrimitiveFactory.CreateMaterial("Commercial", new Color(0.37f, 0.52f, 0.58f), 0.05f, 0.3f);
            industrial = PrimitiveFactory.CreateMaterial("Industrial", new Color(0.34f, 0.36f, 0.39f), 0.25f, 0.28f);
            roof = PrimitiveFactory.CreateMaterial("Roof", new Color(0.12f, 0.15f, 0.18f), 0.05f, 0.22f);
            metal = PrimitiveFactory.CreateMaterial("Metal", new Color(0.42f, 0.47f, 0.52f), 0.72f, 0.42f);
            glass = PrimitiveFactory.CreateMaterial("Glass", new Color(0.2f, 0.55f, 0.7f, 0.76f), 0.15f, 0.75f, true);
            crop = PrimitiveFactory.CreateMaterial("Crop", new Color(0.76f, 0.6f, 0.1f), 0f, 0.06f);
            tree = PrimitiveFactory.CreateMaterial("Tree", new Color(0.11f, 0.32f, 0.12f), 0f, 0.12f);
            trunk = PrimitiveFactory.CreateMaterial("Trunk", new Color(0.27f, 0.16f, 0.075f), 0f, 0.08f);
            vehicleA = PrimitiveFactory.CreateMaterial("VehicleA", new Color(0.78f, 0.09f, 0.07f), 0.35f, 0.55f);
            vehicleB = PrimitiveFactory.CreateMaterial("VehicleB", new Color(0.06f, 0.3f, 0.75f), 0.35f, 0.55f);
            distantHill = PrimitiveFactory.CreateMaterial("Distant Hills", new Color(0.16f, 0.28f, 0.2f), 0f, 0.05f);
        }

        private void CreateBackdrop()
        {
            PrimitiveFactory.CreateBox(
                transform,
                "Distant County Ground",
                new Vector3(0f, -1.35f, 0f),
                new Vector3(980f, 1f, 980f),
                distantGround,
                false);

            Vector3[] hillPositions =
            {
                new Vector3(-330f, 22f, 255f),
                new Vector3(-125f, 18f, 340f),
                new Vector3(135f, 24f, 330f),
                new Vector3(335f, 21f, 185f),
                new Vector3(350f, 18f, -140f),
                new Vector3(130f, 20f, -345f),
                new Vector3(-170f, 23f, -330f),
                new Vector3(-350f, 19f, -120f)
            };

            for (int i = 0; i < hillPositions.Length; i++)
            {
                PrimitiveFactory.CreateSphere(
                    transform,
                    $"Distant Hill {i}",
                    hillPositions[i],
                    new Vector3(105f + (i % 3) * 18f, 34f + (i % 2) * 8f, 76f),
                    distantHill,
                    false);
            }
        }

        private void CreateTerrain()
        {
            PrimitiveFactory.CreateBox(
                transform,
                "Regional Ground",
                new Vector3(0f, -0.55f, 0f),
                new Vector3(regionSize.x, 1f, regionSize.y),
                grass);

            PrimitiveFactory.CreateBox(
                transform,
                "Farmland Ground",
                new Vector3(-118f, -0.48f, 112f),
                new Vector3(145f, 0.15f, 122f),
                field);
        }

        private void CreateRoadNetwork()
        {
            CreateRoad("County Route East-West", new Vector3(0f, 0f, 38f), new Vector3(345f, 0.35f, 11f));
            CreateRoad("County Route North-South", new Vector3(18f, 0f, -18f), new Vector3(11f, 0.35f, 330f));
            CreateRoad("Industrial Connector", new Vector3(-74f, 0f, -48f), new Vector3(148f, 0.35f, 9f));
            CreateRoad("Suburban Loop", new Vector3(94f, 0f, 84f), new Vector3(9f, 0.35f, 128f));
            CreateRoad("Civic Avenue", new Vector3(41f, 0f, -116f), new Vector3(120f, 0.35f, 10f));
            CreateRoad("Farm Access Road", new Vector3(-87f, 0.02f, 104f), new Vector3(118f, 0.32f, 7f));
            CreateFarmRoadMarkings();
        }

        private void CreateRoad(string name, Vector3 position, Vector3 scale)
        {
            PrimitiveFactory.CreateBox(transform, name + " Shoulder", position + Vector3.down * 0.15f, scale + new Vector3(3f, 0.05f, 3f), roadEdge);
            PrimitiveFactory.CreateBox(transform, name, position, scale, road);
        }

        private void CreateFarmRoadMarkings()
        {
            for (int i = 0; i < 13; i++)
            {
                Vector3 position = new Vector3(-139f + i * 8.5f, 0.23f, 104f);
                PrimitiveFactory.CreateBox(
                    transform,
                    "Farm Road Center Mark",
                    position,
                    new Vector3(4.5f, 0.05f, 0.28f),
                    laneMarking,
                    false);
            }
        }

        private void CreateFarmlandDistrict(Vector3 center)
        {
            GameObject district = CreateDistrictRoot("Farmland District", DistrictKind.Farmland, center, new Vector3(150f, 30f, 130f));
            Vector2 spawnXZ = new Vector2(starterSpawnPosition.x, starterSpawnPosition.z);
            for (int row = 0; row < 12; row++)
            {
                for (int column = 0; column < 10; column++)
                {
                    Vector3 position = center + new Vector3(-57f + column * 7f, 0.55f, -45f + row * 7f);
                    Vector2 cropXZ = new Vector2(position.x, position.z);
                    if (Vector2.Distance(cropXZ, spawnXZ) < 11f) continue;

                    GameObject stalk = PrimitiveFactory.CreateBox(
                        district.transform,
                        "Crop",
                        position,
                        new Vector3(4.8f, 0.8f, 0.7f),
                        crop,
                        true);
                    PrimitiveFactory.AddDamageable(stalk, 16f, MaterialClass.Crop, false, MobilityClass.Light);
                    stalk.AddComponent<WindReactive>();
                }
            }

            CreateBuilding(district.transform, "Farmhouse", center + new Vector3(44f, 2.2f, 30f), new Vector3(13f, 4.5f, 10f), residential, 210f, MaterialClass.Wood);
            CreateBuilding(district.transform, "Barn", center + new Vector3(31f, 3.2f, 8f), new Vector3(20f, 6.2f, 14f), residential, 260f, MaterialClass.Wood);
            CreateSilo(district.transform, center + new Vector3(52f, 5.4f, 6f));
            CreateVehicle(district.transform, center + new Vector3(47f, 1.1f, 21f), true);
            CreateTreeLine(district.transform, center + new Vector3(58f, 0f, -25f), 7, Vector3.forward * 8f);
            CreateStarterTestPocket(district.transform);
        }

        private void CreateStarterTestPocket(Transform parent)
        {
            CreateBuilding(
                parent,
                "Storm Lab Shed",
                starterSpawnPosition + new Vector3(26f, 0.8f, 5f),
                new Vector3(11f, 5.4f, 9f),
                residential,
                165f,
                MaterialClass.Wood);
            CreateVehicle(parent, starterSpawnPosition + new Vector3(14f, -0.9f, -9f), false);
            CreateTree(parent, starterSpawnPosition + new Vector3(-14f, -2f, 13f), 6.2f);
            CreatePowerPole(parent, starterSpawnPosition + new Vector3(19f, -2f, -16f));
        }

        private void CreateSmallTownDistrict(Vector3 center)
        {
            GameObject district = CreateDistrictRoot("Small Town", DistrictKind.SmallTown, center, new Vector3(112f, 35f, 96f));
            for (int i = 0; i < 8; i++)
            {
                float x = -42f + (i % 4) * 25f;
                float z = (i / 4) * 27f - 13f;
                CreateBuilding(district.transform, "Town Building", center + new Vector3(x, 3f, z), new Vector3(15f, 6f, 12f), i < 4 ? commercial : residential, 280f, i < 4 ? MaterialClass.Masonry : MaterialClass.Wood);
            }
            for (int i = 0; i < 8; i++)
            {
                CreateVehicle(district.transform, center + new Vector3(-45f + i * 12f, 1.1f, 16f), (i & 1) == 0);
            }
        }

        private void CreateSuburbanDistrict(Vector3 center)
        {
            GameObject district = CreateDistrictRoot("Suburban District", DistrictKind.Suburban, center, new Vector3(132f, 32f, 130f));
            for (int row = 0; row < 3; row++)
            {
                for (int column = 0; column < 4; column++)
                {
                    Vector3 position = center + new Vector3(-44f + column * 28f, 2.5f, -36f + row * 34f);
                    CreateBuilding(district.transform, "Suburban House", position, new Vector3(14f, 5f, 11f), residential, 220f, MaterialClass.Wood);
                    CreateVehicle(district.transform, position + new Vector3(8f, -1.35f, -5f), ((row + column) & 1) == 0);
                    CreateTree(district.transform, position + new Vector3(-8f, -2.45f, 8f), 5f + ((row + column) % 3));
                }
            }
        }

        private void CreateCommercialDistrict(Vector3 center)
        {
            GameObject district = CreateDistrictRoot("Commercial Corridor", DistrictKind.Commercial, center, new Vector3(138f, 36f, 104f));
            for (int i = 0; i < 6; i++)
            {
                float x = -50f + i * 20f;
                CreateBuilding(district.transform, "Storefront", center + new Vector3(x, 3.2f, 16f), new Vector3(17f, 6.5f, 18f), commercial, 330f, MaterialClass.Masonry);
                CreateVehicle(district.transform, center + new Vector3(x, 1.1f, -7f), (i & 1) == 0);
            }
            CreateBuilding(district.transform, "Glass Showroom", center + new Vector3(0f, 4.5f, -31f), new Vector3(30f, 9f, 18f), glass, 245f, MaterialClass.Glass);
        }

        private void CreateIndustrialDistrict(Vector3 center)
        {
            GameObject district = CreateDistrictRoot("Industrial District", DistrictKind.Industrial, center, new Vector3(150f, 45f, 120f));
            CreateBuilding(district.transform, "Warehouse A", center + new Vector3(-36f, 5f, 15f), new Vector3(34f, 10f, 25f), industrial, 650f, MaterialClass.Metal);
            CreateBuilding(district.transform, "Warehouse B", center + new Vector3(14f, 5f, 12f), new Vector3(36f, 10f, 25f), industrial, 650f, MaterialClass.Metal);
            CreateBuilding(district.transform, "Maintenance Shop", center + new Vector3(50f, 3.8f, 4f), new Vector3(22f, 7.5f, 18f), industrial, 420f, MaterialClass.Metal);
            for (int i = 0; i < 5; i++)
            {
                CreateTank(district.transform, center + new Vector3(-48f + i * 24f, 3.3f, -24f));
            }
            CreateSubstation(district.transform, center + new Vector3(48f, 0f, -36f));
        }

        private void CreateCivicDistrict(Vector3 center)
        {
            GameObject district = CreateDistrictRoot("Civic District", DistrictKind.Civic, center, new Vector3(118f, 48f, 96f));
            CreateBuilding(district.transform, "County Hall", center + new Vector3(-22f, 7f, 0f), new Vector3(32f, 14f, 24f), commercial, 720f, MaterialClass.Masonry);
            CreateBuilding(district.transform, "Fire Station", center + new Vector3(24f, 4.2f, 4f), new Vector3(24f, 8.5f, 20f), residential, 430f, MaterialClass.Masonry);
            CreateBuilding(district.transform, "Library", center + new Vector3(0f, 4.6f, -31f), new Vector3(28f, 9f, 20f), glass, 360f, MaterialClass.Glass);
            CreateTreeLine(district.transform, center + new Vector3(-47f, 0f, -32f), 9, Vector3.right * 12f);
        }

        private void CreateUtilityCorridors()
        {
            for (int i = 0; i < 14; i++)
            {
                CreatePowerPole(transform, new Vector3(-150f + i * 24f, 0f, 27f));
            }
            for (int i = 0; i < 8; i++)
            {
                CreatePowerPole(transform, new Vector3(30f, 0f, -150f + i * 33f));
            }
        }

        private GameObject CreateDistrictRoot(string name, DistrictKind kind, Vector3 center, Vector3 size)
        {
            GameObject district = new GameObject(name);
            district.transform.SetParent(transform, false);
            RegionChunk chunk = district.AddComponent<RegionChunk>();
            chunk.Configure(kind, new Bounds(center, size));
            return district;
        }

        private GameObject CreateBuilding(Transform parent, string name, Vector3 center, Vector3 size, Material wallMaterial, float health, MaterialClass materialClass)
        {
            GameObject root = new GameObject(name);
            root.transform.SetParent(parent, false);
            root.transform.position = center;

            PrimitiveFactory.CreateBox(root.transform, "Walls", center, size, wallMaterial, false);
            PrimitiveFactory.CreateBox(root.transform, "Roof", center + Vector3.up * (size.y * 0.58f), new Vector3(size.x * 1.08f, size.y * 0.18f, size.z * 1.08f), roof, false);
            PrimitiveFactory.CreateBox(root.transform, "Door", center + new Vector3(0f, -size.y * 0.17f, -size.z * 0.51f), new Vector3(size.x * 0.18f, size.y * 0.44f, 0.22f), industrial, false);
            PrimitiveFactory.CreateBox(root.transform, "Window", center + new Vector3(-size.x * 0.27f, 0f, -size.z * 0.52f), new Vector3(size.x * 0.2f, size.y * 0.26f, 0.18f), glass, false);
            PrimitiveFactory.CreateBox(root.transform, "Window", center + new Vector3(size.x * 0.27f, 0f, -size.z * 0.52f), new Vector3(size.x * 0.2f, size.y * 0.26f, 0.18f), glass, false);

            BoxCollider rootCollider = root.AddComponent<BoxCollider>();
            rootCollider.center = Vector3.zero;
            rootCollider.size = size;
            Rigidbody body = root.AddComponent<Rigidbody>();
            body.isKinematic = true;
            DamageableStructure damageable = root.AddComponent<DamageableStructure>();
            damageable.Configure(health, materialClass, materialClass == MaterialClass.Metal || materialClass == MaterialClass.Infrastructure, MobilityClass.Structural);
            return root;
        }

        private void CreateVehicle(Transform parent, Vector3 center, bool alternate)
        {
            GameObject vehicle = new GameObject(alternate ? "Pickup" : "Sedan");
            vehicle.transform.SetParent(parent, false);
            vehicle.transform.position = center;
            Vector3 bodySize = alternate ? new Vector3(5.4f, 1.35f, 2.25f) : new Vector3(4.5f, 1.25f, 2.05f);
            Material material = alternate ? vehicleA : vehicleB;
            PrimitiveFactory.CreateBox(vehicle.transform, "Chassis", center, bodySize, material, false);
            PrimitiveFactory.CreateBox(vehicle.transform, "Cabin", center + new Vector3(-0.2f, 1.1f, 0f), new Vector3(bodySize.x * 0.48f, 1.25f, bodySize.z * 0.84f), glass, false);
            BoxCollider collider = vehicle.AddComponent<BoxCollider>();
            collider.center = Vector3.zero;
            collider.size = new Vector3(bodySize.x, 2.3f, bodySize.z);
            Rigidbody body = vehicle.AddComponent<Rigidbody>();
            body.isKinematic = true;
            DamageableStructure damageable = vehicle.AddComponent<DamageableStructure>();
            damageable.Configure(95f, MaterialClass.Vehicle, true, MobilityClass.Medium);
            vehicle.AddComponent<WindReactive>();
        }

        private void CreateTreeLine(Transform parent, Vector3 start, int count, Vector3 step)
        {
            for (int i = 0; i < count; i++)
            {
                CreateTree(parent, start + step * i, 5f + (i % 3));
            }
        }

        private void CreateTree(Transform parent, Vector3 center, float height)
        {
            GameObject root = new GameObject("Tree");
            root.transform.SetParent(parent, false);
            root.transform.position = center;
            PrimitiveFactory.CreateCylinder(root.transform, "Trunk", center + Vector3.up * (height * 0.4f), new Vector3(0.45f, height * 0.4f, 0.45f), trunk, false);
            PrimitiveFactory.CreateSphere(root.transform, "Crown", center + Vector3.up * height, new Vector3(height * 0.8f, height * 0.72f, height * 0.8f), tree, false);
            CapsuleCollider collider = root.AddComponent<CapsuleCollider>();
            collider.center = new Vector3(0f, height * 0.55f, 0f);
            collider.height = height * 1.4f;
            collider.radius = height * 0.35f;
            Rigidbody body = root.AddComponent<Rigidbody>();
            body.isKinematic = true;
            DamageableStructure damageable = root.AddComponent<DamageableStructure>();
            damageable.Configure(90f, MaterialClass.Vegetation, false, MobilityClass.Light);
            root.AddComponent<WindReactive>();
        }

        private void CreatePowerPole(Transform parent, Vector3 center)
        {
            GameObject pole = new GameObject("Power Pole");
            pole.transform.SetParent(parent, false);
            pole.transform.position = center;
            PrimitiveFactory.CreateCylinder(pole.transform, "Pole", center + Vector3.up * 5.5f, new Vector3(0.25f, 5.5f, 0.25f), trunk, false);
            PrimitiveFactory.CreateBox(pole.transform, "Crossarm", center + Vector3.up * 10.2f, new Vector3(4.6f, 0.3f, 0.35f), trunk, false);
            CapsuleCollider collider = pole.AddComponent<CapsuleCollider>();
            collider.center = new Vector3(0f, 5.5f, 0f);
            collider.height = 11f;
            collider.radius = 0.6f;
            Rigidbody body = pole.AddComponent<Rigidbody>();
            body.isKinematic = true;
            DamageableStructure damageable = pole.AddComponent<DamageableStructure>();
            damageable.Configure(125f, MaterialClass.Infrastructure, true, MobilityClass.Heavy);
            pole.AddComponent<WindReactive>();
            ConductiveNode node = pole.AddComponent<ConductiveNode>();
            node.Configure(31f, 2);
        }

        private void CreateSilo(Transform parent, Vector3 center)
        {
            GameObject silo = PrimitiveFactory.CreateCylinder(parent, "Grain Silo", center, new Vector3(4.6f, 5.5f, 4.6f), metal);
            Rigidbody body = silo.AddComponent<Rigidbody>();
            body.isKinematic = true;
            PrimitiveFactory.AddDamageable(silo, 360f, MaterialClass.Metal, true, MobilityClass.Heavy);
            ConductiveNode node = silo.AddComponent<ConductiveNode>();
            node.Configure(30f, 3);
        }

        private void CreateTank(Transform parent, Vector3 center)
        {
            GameObject tank = PrimitiveFactory.CreateCylinder(parent, "Storage Tank", center, new Vector3(4.8f, 3.2f, 4.8f), metal);
            Rigidbody body = tank.AddComponent<Rigidbody>();
            body.isKinematic = true;
            PrimitiveFactory.AddDamageable(tank, 290f, MaterialClass.Metal, true, MobilityClass.Heavy);
            ConductiveNode node = tank.AddComponent<ConductiveNode>();
            node.Configure(28f, 4);
        }

        private void CreateSubstation(Transform parent, Vector3 center)
        {
            GameObject root = new GameObject("Electrical Substation");
            root.transform.SetParent(parent, false);
            root.transform.position = center;
            for (int x = -1; x <= 1; x++)
            {
                for (int z = -1; z <= 1; z++)
                {
                    Vector3 position = center + new Vector3(x * 5f, 1.4f, z * 5f);
                    GameObject equipment = PrimitiveFactory.CreateBox(root.transform, "Transformer", position, new Vector3(3.2f, 2.8f, 2.6f), metal);
                    Rigidbody body = equipment.AddComponent<Rigidbody>();
                    body.isKinematic = true;
                    PrimitiveFactory.AddDamageable(equipment, 170f, MaterialClass.Infrastructure, true, MobilityClass.Heavy);
                    ConductiveNode node = equipment.AddComponent<ConductiveNode>();
                    node.Configure(20f, 8);
                }
            }
        }
    }
}
