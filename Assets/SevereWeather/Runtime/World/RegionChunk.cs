using UnityEngine;

namespace SevereWeather.World
{
    public enum DistrictKind
    {
        Farmland,
        SmallTown,
        Suburban,
        Commercial,
        Industrial,
        Civic
    }

    public sealed class RegionChunk : MonoBehaviour
    {
        [SerializeField] private DistrictKind districtKind;
        [SerializeField] private Bounds worldBounds;

        public DistrictKind DistrictKind => districtKind;
        public Bounds WorldBounds => worldBounds;

        public void Configure(DistrictKind kind, Bounds bounds)
        {
            districtKind = kind;
            worldBounds = bounds;
        }
    }
}
