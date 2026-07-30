using System;
using UnityEngine;

namespace SevereWeather.Core
{
    public static class BuildIdentity
    {
        private static bool loaded;
        private static string version = "0.2.0";
        private static string build = "Tornado Tactical P1";
        private static string commit = "local";
        private static string utc = "unknown";

        public static string Version
        {
            get
            {
                EnsureLoaded();
                return version;
            }
        }

        public static string Build
        {
            get
            {
                EnsureLoaded();
                return build;
            }
        }

        public static string Commit
        {
            get
            {
                EnsureLoaded();
                return commit;
            }
        }

        public static string ShortCommit
        {
            get
            {
                EnsureLoaded();
                return commit.Length > 8 ? commit.Substring(0, 8) : commit;
            }
        }

        public static string Utc
        {
            get
            {
                EnsureLoaded();
                return utc;
            }
        }

        public static string DisplayLabel => $"v{Version}  {Build}  {ShortCommit}";

        private static void EnsureLoaded()
        {
            if (loaded) return;
            loaded = true;

            if (!string.IsNullOrWhiteSpace(Application.version))
            {
                version = Application.version;
            }

            TextAsset asset = Resources.Load<TextAsset>("BuildInfo");
            if (asset == null) return;

            string[] lines = asset.text.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
            for (int i = 0; i < lines.Length; i++)
            {
                int separator = lines[i].IndexOf('=');
                if (separator <= 0 || separator >= lines[i].Length - 1) continue;
                string key = lines[i].Substring(0, separator).Trim();
                string value = lines[i].Substring(separator + 1).Trim();
                switch (key)
                {
                    case "version":
                        version = value;
                        break;
                    case "build":
                        build = value;
                        break;
                    case "commit":
                        commit = value;
                        break;
                    case "utc":
                        utc = value;
                        break;
                }
            }
        }
    }
}
