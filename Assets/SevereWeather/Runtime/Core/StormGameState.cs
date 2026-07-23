using UnityEngine;

namespace SevereWeather.Core
{
    public static class StormGameState
    {
        public static Storms.StormControllerBase ActiveStorm { get; private set; }

        public static void SetActiveStorm(Storms.StormControllerBase storm)
        {
            ActiveStorm = storm;
        }

        public static void Clear(Storms.StormControllerBase storm)
        {
            if (ActiveStorm == storm)
            {
                ActiveStorm = null;
            }
        }
    }
}
