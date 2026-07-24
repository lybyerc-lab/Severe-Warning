using SevereWeather.World;
using UnityEngine;

namespace SevereWeather.Presentation
{
    public static class StormActionVfx
    {
        private static Material lineMaterial;

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
            Vector3 side = Vector3.Cross(direction.normalized, Vector3.up);
            if (side.sqrMagnitude < 0.01f) side = Vector3.right;
            Vector3 up = Vector3.Cross(side, direction.normalized);

            for (int i = 0; i < segments; i++)
            {
                float t = i / (float)(segments - 1);
                Vector3 point = Vector3.Lerp(start, end, t);
                if (i > 0 && i < segments - 1)
                {
                    float taper = Mathf.Sin(t * Mathf.PI);
                    point += side * UnityEngine.Random.Range(-1.8f, 1.8f) * taper;
                    point += up * UnityEngine.Random.Range(-0.9f, 0.9f) * taper;
                }
                points[i] = point;
            }

            CreateLine("Lightning Bolt", points, false, color, duration, width);
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
}
