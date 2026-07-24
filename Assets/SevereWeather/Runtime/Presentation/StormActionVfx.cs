using System.Collections.Generic;
using SevereWeather.Damage;
using SevereWeather.World;
using UnityEngine;

namespace SevereWeather.Presentation
{
    public static class StormActionVfx
    {
        private const int MaxFxRoots = 18;
        private const int MaxFragments = 42;

        private static readonly List<GameObject> fxRoots = new List<GameObject>(MaxFxRoots + 4);
        private static readonly List<GameObject> fragments = new List<GameObject>(MaxFragments + 8);
        private static readonly Dictionary<string, Material> fragmentMaterials = new Dictionary<string, Material>();
        private static Material lineMaterial;

        public static int ActiveFxCount
        {
            get
            {
                Prune(fxRoots);
                return fxRoots.Count;
            }
        }

        public static int ActiveFragmentCount
        {
            get
            {
                Prune(fragments);
                return fragments.Count;
            }
        }

        public static int FxCapacity => MaxFxRoots;
        public static int FragmentCapacity => MaxFragments;

        public static void Ring(
            Vector3 center,
            float radius,
            Color color,
            float duration = 0.45f,
            float width = 0.55f)
        {
            const int segments = 48;
            Vector3[] points = new Vector3[segments];
            for (int i = 0; i < segments; i++)
            {
                float angle = i * Mathf.PI * 2f / segments;
                points[i] = center + new Vector3(Mathf.Cos(angle) * radius, 0.35f, Mathf.Sin(angle) * radius);
            }

            CreateLine("Storm Ring", points, true, color, duration, width);
        }

        public static void Arc(
            Vector3 center,
            Vector3 forward,
            float radius,
            float halfAngleDegrees,
            Color color,
            float duration = 0.5f,
            float width = 0.7f)
        {
            const int segments = 24;
            Vector3 flatForward = forward;
            flatForward.y = 0f;
            if (flatForward.sqrMagnitude < 0.001f) flatForward = Vector3.forward;
            flatForward.Normalize();

            Vector3[] points = new Vector3[segments];
            for (int i = 0; i < segments; i++)
            {
                float t = i / (float)(segments - 1);
                float angle = Mathf.Lerp(-halfAngleDegrees, halfAngleDegrees, t);
                Vector3 direction = Quaternion.Euler(0f, angle, 0f) * flatForward;
                points[i] = center + direction * radius + Vector3.up * 0.45f;
            }

            CreateLine("Storm Arc", points, false, color, duration, width);
        }

        public static void Swath(
            Vector3 center,
            Vector3 forward,
            float halfWidth,
            float length,
            Color color,
            float duration = 0.55f)
        {
            Vector3 flatForward = forward;
            flatForward.y = 0f;
            if (flatForward.sqrMagnitude < 0.001f) flatForward = Vector3.forward;
            flatForward.Normalize();
            Vector3 right = Vector3.Cross(Vector3.up, flatForward).normalized;
            Vector3 halfForward = flatForward * (length * 0.5f);
            Vector3 halfRight = right * halfWidth;
            Vector3 y = Vector3.up * 0.45f;

            Vector3[] points =
            {
                center - halfForward - halfRight + y,
                center + halfForward - halfRight + y,
                center + halfForward + halfRight + y,
                center - halfForward + halfRight + y
            };
            CreateLine("Storm Swath", points, true, color, duration, 0.65f);
        }

        public static void Bolt(
            Vector3 start,
            Vector3 end,
            Color color,
            float duration = 0.35f,
            float width = 0.42f)
        {
            const int segments = 8;
            Vector3[] points = new Vector3[segments];
            Vector3 direction = end - start;
            Vector3 normalized = direction.sqrMagnitude > 0.001f ? direction.normalized : Vector3.up;
            Vector3 side = Vector3.Cross(normalized, Vector3.up);
            if (side.sqrMagnitude < 0.01f) side = Vector3.right;
            Vector3 up = Vector3.Cross(side, normalized);

            for (int i = 0; i < segments; i++)
            {
                float t = i / (float)(segments - 1);
                Vector3 point = Vector3.Lerp(start, end, t);
                if (i > 0 && i < segments - 1)
                {
                    float taper = Mathf.Sin(t * Mathf.PI);
                    point += side * Random.Range(-1.8f, 1.8f) * taper;
                    point += up * Random.Range(-0.9f, 0.9f) * taper;
                }
                points[i] = point;
            }

            CreateLine("Lightning Bolt", points, false, color, duration, width);
        }

        public static void HailField(
            Vector3 center,
            Vector3 forward,
            float halfWidth,
            float length,
            int targetCount)
        {
            Vector3 flatForward = forward;
            flatForward.y = 0f;
            if (flatForward.sqrMagnitude < 0.001f) flatForward = Vector3.forward;
            flatForward.Normalize();

            GameObject root = new GameObject("Hail Impact Field");
            root.transform.position = center;
            root.transform.rotation = Quaternion.LookRotation(flatForward, Vector3.up);
            Register(fxRoots, root, MaxFxRoots);

            int streakCount = Mathf.Clamp(12 + targetCount, 12, 22);
            Transform[] streaks = new Transform[streakCount];
            LineRenderer[] lines = new LineRenderer[streakCount];
            for (int i = 0; i < streakCount; i++)
            {
                GameObject streakObject = new GameObject($"Hail Drop {i}");
                streakObject.transform.SetParent(root.transform, false);
                streakObject.transform.localPosition = new Vector3(
                    Random.Range(-halfWidth, halfWidth),
                    Random.Range(5.5f, 11.5f),
                    Random.Range(-length * 0.5f, length * 0.5f));

                LineRenderer line = streakObject.AddComponent<LineRenderer>();
                line.useWorldSpace = false;
                line.positionCount = 2;
                line.SetPosition(0, Vector3.zero);
                line.SetPosition(1, new Vector3(-0.08f, -Random.Range(0.7f, 1.35f), -0.12f));
                line.widthMultiplier = Random.Range(0.055f, 0.11f);
                line.numCapVertices = 2;
                line.alignment = LineAlignment.View;
                line.sharedMaterial = GetLineMaterial();
                Color color = new Color(0.8f, 0.95f, 1f, 0.82f);
                line.startColor = color;
                line.endColor = new Color(color.r, color.g, color.b, 0.08f);
                line.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off;
                line.receiveShadows = false;
                streaks[i] = streakObject.transform;
                lines[i] = line;
            }

            Material hailImpactMaterial = GetFragmentMaterial(MaterialClass.Glass, DamageType.Hail);
            int impactCount = Mathf.Clamp(8 + targetCount, 8, 15);
            for (int i = 0; i < impactCount; i++)
            {
                Vector3 position = center + root.transform.right * Random.Range(-halfWidth, halfWidth) +
                                   flatForward * Random.Range(-length * 0.5f, length * 0.5f) +
                                   Vector3.up * 0.12f;
                GameObject fragment = PrimitiveFactory.CreateBox(
                    root.transform,
                    $"Hail Impact {i}",
                    position,
                    new Vector3(0.045f, Random.Range(0.18f, 0.34f), 0.045f),
                    hailImpactMaterial,
                    false);
                Register(fragments, fragment, MaxFragments);
                TransientFragmentEffect transient = fragment.AddComponent<TransientFragmentEffect>();
                transient.Configure(
                    Vector3.up * Random.Range(0.6f, 1.4f) + Random.insideUnitSphere * 0.35f,
                    Random.insideUnitSphere * 180f,
                    Random.Range(0.32f, 0.48f),
                    7.5f);
            }

            TransientHailField effect = root.AddComponent<TransientHailField>();
            effect.Configure(streaks, lines, 0.62f, 26f, 12f);
        }

        public static void MaterialImpact(
            Vector3 center,
            Vector3 impulse,
            MaterialClass materialClass,
            DamageType damageType,
            float scale,
            bool critical)
        {
            int count = critical ? 8 : 5;
            switch (materialClass)
            {
                case MaterialClass.Masonry:
                    count = critical ? 7 : 4;
                    break;
                case MaterialClass.Crop:
                case MaterialClass.Vegetation:
                    count = critical ? 6 : 4;
                    break;
                case MaterialClass.Metal:
                case MaterialClass.Infrastructure:
                case MaterialClass.Vehicle:
                    count = critical ? 9 : 6;
                    break;
            }

            SpawnFragments(center, impulse, materialClass, damageType, scale, critical, count);
            if (damageType == DamageType.Electrical)
            {
                Ring(center, Mathf.Max(0.7f, scale * 0.72f), new Color(0.48f, 0.84f, 1f, 0.82f), 0.28f, 0.12f);
            }
        }

        private static void SpawnFragments(
            Vector3 center,
            Vector3 impulse,
            MaterialClass materialClass,
            DamageType damageType,
            float scale,
            bool critical,
            int count)
        {
            GameObject root = new GameObject($"{materialClass} Impact Fragments");
            root.transform.position = center;
            Register(fxRoots, root, MaxFxRoots);

            TransientRootEffect rootLifetime = root.AddComponent<TransientRootEffect>();
            rootLifetime.Configure(critical ? 1.05f : 0.82f);

            Vector3 direction = impulse.sqrMagnitude > 0.01f ? impulse.normalized : Vector3.up;
            Material material = GetFragmentMaterial(materialClass, damageType);
            Vector3 baseSize = GetFragmentSize(materialClass) * Mathf.Clamp(scale, 0.45f, 2.4f);
            float lifetime = critical ? 0.82f : 0.55f;

            for (int i = 0; i < count; i++)
            {
                Vector3 scatter = Random.insideUnitSphere;
                scatter.y = Mathf.Abs(scatter.y) + 0.15f;
                Vector3 velocity = direction * Random.Range(0.8f, 2.4f) + scatter * Random.Range(1.2f, 3.4f);
                if (materialClass == MaterialClass.Crop || materialClass == MaterialClass.Vegetation)
                {
                    velocity.y *= 0.45f;
                }

                GameObject fragment = PrimitiveFactory.CreateBox(
                    root.transform,
                    $"Fragment {i}",
                    center + Random.insideUnitSphere * 0.18f,
                    baseSize * Random.Range(0.7f, 1.25f),
                    material,
                    false);
                fragment.transform.rotation = Random.rotation;
                Register(fragments, fragment, MaxFragments);

                TransientFragmentEffect transient = fragment.AddComponent<TransientFragmentEffect>();
                transient.Configure(
                    velocity,
                    Random.insideUnitSphere * Random.Range(120f, 280f),
                    lifetime * Random.Range(0.8f, 1.15f),
                    materialClass == MaterialClass.Metal || materialClass == MaterialClass.Infrastructure ? 4.5f : 7.2f);
            }
        }

        private static Vector3 GetFragmentSize(MaterialClass materialClass)
        {
            switch (materialClass)
            {
                case MaterialClass.Glass:
                    return new Vector3(0.05f, 0.32f, 0.14f);
                case MaterialClass.Metal:
                case MaterialClass.Infrastructure:
                case MaterialClass.Vehicle:
                    return new Vector3(0.045f, 0.42f, 0.055f);
                case MaterialClass.Crop:
                case MaterialClass.Vegetation:
                    return new Vector3(0.055f, 0.28f, 0.08f);
                case MaterialClass.Masonry:
                    return new Vector3(0.2f, 0.16f, 0.18f);
                default:
                    return new Vector3(0.08f, 0.38f, 0.09f);
            }
        }

        private static Material GetFragmentMaterial(MaterialClass materialClass, DamageType damageType)
        {
            string key = materialClass + ":" + damageType;
            if (fragmentMaterials.TryGetValue(key, out Material material)) return material;

            Color color;
            if (damageType == DamageType.Electrical)
            {
                color = new Color(0.48f, 0.86f, 1f, 1f);
            }
            else if (damageType == DamageType.Hail)
            {
                color = new Color(0.8f, 0.95f, 1f, 1f);
            }
            else
            {
                switch (materialClass)
                {
                    case MaterialClass.Glass:
                        color = new Color(0.42f, 0.9f, 1f, 0.92f);
                        break;
                    case MaterialClass.Crop:
                    case MaterialClass.Vegetation:
                        color = new Color(0.56f, 0.68f, 0.18f, 1f);
                        break;
                    case MaterialClass.Metal:
                    case MaterialClass.Infrastructure:
                    case MaterialClass.Vehicle:
                        color = new Color(1f, 0.65f, 0.18f, 1f);
                        break;
                    case MaterialClass.Masonry:
                        color = new Color(0.62f, 0.52f, 0.42f, 1f);
                        break;
                    default:
                        color = new Color(0.58f, 0.36f, 0.17f, 1f);
                        break;
                }
            }

            material = PrimitiveFactory.CreateMaterial(
                "Impact Fragment " + key,
                color,
                0f,
                0f,
                false,
                true);
            fragmentMaterials[key] = material;
            return material;
        }

        private static void CreateLine(
            string name,
            Vector3[] points,
            bool loop,
            Color color,
            float duration,
            float width)
        {
            GameObject effectObject = new GameObject(name);
            Register(fxRoots, effectObject, MaxFxRoots);
            LineRenderer line = effectObject.AddComponent<LineRenderer>();
            line.useWorldSpace = true;
            line.loop = loop;
            line.positionCount = points.Length;
            line.SetPositions(points);
            line.widthMultiplier = width;
            line.numCapVertices = 2;
            line.numCornerVertices = 2;
            line.alignment = LineAlignment.View;
            line.textureMode = LineTextureMode.Stretch;
            line.sharedMaterial = GetLineMaterial();
            line.startColor = color;
            line.endColor = color;
            line.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off;
            line.receiveShadows = false;

            TransientLineEffect transient = effectObject.AddComponent<TransientLineEffect>();
            transient.Configure(line, color, duration);
        }

        private static Material GetLineMaterial()
        {
            if (lineMaterial == null)
            {
                lineMaterial = PrimitiveFactory.CreateMaterial(
                    "Storm Action Lines",
                    Color.white,
                    0f,
                    0f,
                    true,
                    true);
            }
            return lineMaterial;
        }

        private static void Register(List<GameObject> list, GameObject target, int capacity)
        {
            Prune(list);
            while (list.Count >= capacity)
            {
                GameObject oldest = list[0];
                list.RemoveAt(0);
                if (oldest != null) Object.Destroy(oldest);
            }
            list.Add(target);
        }

        private static void Prune(List<GameObject> list)
        {
            for (int i = list.Count - 1; i >= 0; i--)
            {
                if (list[i] == null) list.RemoveAt(i);
            }
        }
    }

    public sealed class TransientRootEffect : MonoBehaviour
    {
        private float remaining;

        public void Configure(float lifetime)
        {
            remaining = Mathf.Max(0.1f, lifetime);
        }

        private void Update()
        {
            remaining -= Time.deltaTime;
            if (remaining <= 0f) Destroy(gameObject);
        }
    }

    public sealed class TransientLineEffect : MonoBehaviour
    {
        private LineRenderer line;
        private Color color;
        private float duration;
        private float remaining;

        public void Configure(LineRenderer targetLine, Color baseColor, float lifetime)
        {
            line = targetLine;
            color = baseColor;
            duration = Mathf.Max(0.05f, lifetime);
            remaining = duration;
        }

        private void Update()
        {
            remaining -= Time.deltaTime;
            if (remaining <= 0f)
            {
                Destroy(gameObject);
                return;
            }

            float alpha = Mathf.Clamp01(remaining / duration);
            Color faded = new Color(color.r, color.g, color.b, color.a * alpha);
            if (line != null)
            {
                line.startColor = faded;
                line.endColor = faded;
            }
        }
    }

    public sealed class TransientFragmentEffect : MonoBehaviour
    {
        private Vector3 velocity;
        private Vector3 angularVelocity;
        private float lifetime;
        private float remaining;
        private float gravity;
        private Vector3 startScale;

        public void Configure(Vector3 initialVelocity, Vector3 spin, float duration, float gravityStrength)
        {
            velocity = initialVelocity;
            angularVelocity = spin;
            lifetime = Mathf.Max(0.12f, duration);
            remaining = lifetime;
            gravity = Mathf.Max(0f, gravityStrength);
            startScale = transform.localScale;
        }

        private void Update()
        {
            float dt = Time.deltaTime;
            remaining -= dt;
            if (remaining <= 0f)
            {
                Destroy(gameObject);
                return;
            }

            velocity += Vector3.down * gravity * dt;
            transform.position += velocity * dt;
            transform.Rotate(angularVelocity * dt, Space.Self);
            float normalized = Mathf.Clamp01(remaining / lifetime);
            transform.localScale = startScale * Mathf.Lerp(0.15f, 1f, normalized);
        }
    }

    public sealed class TransientHailField : MonoBehaviour
    {
        private Transform[] streaks;
        private LineRenderer[] lines;
        private float duration;
        private float remaining;
        private float fallSpeed;
        private float resetHeight;

        public void Configure(
            Transform[] hailStreaks,
            LineRenderer[] hailLines,
            float lifetime,
            float speed,
            float height)
        {
            streaks = hailStreaks;
            lines = hailLines;
            duration = Mathf.Max(0.1f, lifetime);
            remaining = duration;
            fallSpeed = Mathf.Max(1f, speed);
            resetHeight = Mathf.Max(2f, height);
        }

        private void Update()
        {
            float dt = Time.deltaTime;
            remaining -= dt;
            if (remaining <= 0f)
            {
                Destroy(gameObject);
                return;
            }

            float alpha = Mathf.Clamp01(remaining / duration);
            for (int i = 0; i < streaks.Length; i++)
            {
                Transform streak = streaks[i];
                if (streak == null) continue;
                Vector3 position = streak.localPosition;
                position.y -= fallSpeed * dt;
                if (position.y < 0f) position.y += resetHeight;
                streak.localPosition = position;

                if (lines != null && i < lines.Length && lines[i] != null)
                {
                    Color color = new Color(0.8f, 0.95f, 1f, 0.82f * alpha);
                    lines[i].startColor = color;
                    lines[i].endColor = new Color(color.r, color.g, color.b, 0.05f * alpha);
                }
            }
        }
    }
}
