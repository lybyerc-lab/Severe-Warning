using UnityEngine;

namespace SevereWeather.Storms
{
    public sealed class StormVisualAnimator : MonoBehaviour
    {
        private static readonly int BaseColorId = Shader.PropertyToID("_BaseColor");
        private static readonly int ColorId = Shader.PropertyToID("_Color");

        [SerializeField] private float spinDegreesPerSecond = 85f;
        [SerializeField] private float pulseAmount = 0.035f;
        [SerializeField] private float pulseSpeed = 1.7f;
        [SerializeField] private Transform spinRoot;
        [SerializeField] private Transform[] animatedLayers;
        [SerializeField] private int gameplayOcclusionLayerCount;

        private Vector3[] basePositions;
        private Vector3[] baseScales;
        private Renderer[] layerRenderers;
        private Color[] baseColors;
        private int[] colorPropertyIds;
        private MaterialPropertyBlock[] propertyBlocks;
        private float visibilityDemand;
        private float visibilityHold;
        private float visibilityBlend;

        public void Configure(
            float spin,
            Transform[] layers,
            Transform rotatingRoot,
            int occlusionLayers = 0)
        {
            spinDegreesPerSecond = spin;
            animatedLayers = layers;
            spinRoot = rotatingRoot;
            gameplayOcclusionLayerCount = Mathf.Clamp(occlusionLayers, 0, layers != null ? layers.Length : 0);
            CaptureLayerState();
        }

        public void RequestGameplayVisibility(float intensity, float holdSeconds)
        {
            visibilityDemand = Mathf.Max(visibilityDemand, Mathf.Clamp01(intensity));
            visibilityHold = Mathf.Max(visibilityHold, Mathf.Max(0.05f, holdSeconds));
        }

        private void CaptureLayerState()
        {
            if (animatedLayers == null)
            {
                basePositions = null;
                baseScales = null;
                layerRenderers = null;
                baseColors = null;
                colorPropertyIds = null;
                propertyBlocks = null;
                return;
            }

            int count = animatedLayers.Length;
            basePositions = new Vector3[count];
            baseScales = new Vector3[count];
            layerRenderers = new Renderer[count];
            baseColors = new Color[count];
            colorPropertyIds = new int[count];
            propertyBlocks = new MaterialPropertyBlock[count];

            for (int i = 0; i < count; i++)
            {
                Transform layer = animatedLayers[i];
                if (layer == null) continue;
                basePositions[i] = layer.localPosition;
                baseScales[i] = layer.localScale;

                Renderer renderer = layer.GetComponent<Renderer>();
                layerRenderers[i] = renderer;
                propertyBlocks[i] = new MaterialPropertyBlock();
                Material material = renderer != null ? renderer.sharedMaterial : null;
                if (material != null && material.HasProperty(BaseColorId))
                {
                    baseColors[i] = material.GetColor(BaseColorId);
                    colorPropertyIds[i] = BaseColorId;
                }
                else if (material != null && material.HasProperty(ColorId))
                {
                    baseColors[i] = material.GetColor(ColorId);
                    colorPropertyIds[i] = ColorId;
                }
                else
                {
                    baseColors[i] = Color.white;
                    colorPropertyIds[i] = ColorId;
                }
            }
        }

        private void Update()
        {
            if (spinRoot != null)
            {
                spinRoot.Rotate(Vector3.up, spinDegreesPerSecond * Time.deltaTime, Space.Self);
            }

            if (visibilityHold > 0f)
            {
                visibilityHold = Mathf.Max(0f, visibilityHold - Time.deltaTime);
            }
            else
            {
                visibilityDemand = 0f;
            }
            visibilityBlend = Mathf.MoveTowards(
                visibilityBlend,
                visibilityDemand,
                Time.deltaTime * (visibilityDemand > visibilityBlend ? 3.8f : 2.2f));

            if (animatedLayers == null || basePositions == null || baseScales == null) return;

            for (int i = 0; i < animatedLayers.Length; i++)
            {
                Transform layer = animatedLayers[i];
                if (layer == null) continue;
                float phase = Time.time * pulseSpeed + i * 0.73f;
                float pulse = 1f + Mathf.Sin(phase) * pulseAmount;
                Vector3 bob = Vector3.up * Mathf.Sin(phase * 0.83f) * 0.18f;
                layer.localPosition = basePositions[i] + bob;

                float heightScale = i < gameplayOcclusionLayerCount
                    ? Mathf.Lerp(1f, 0.82f, visibilityBlend)
                    : 1f;
                layer.localScale = new Vector3(
                    baseScales[i].x * pulse,
                    baseScales[i].y * heightScale,
                    baseScales[i].z * pulse);

                if (i >= gameplayOcclusionLayerCount || layerRenderers == null) continue;
                Renderer renderer = layerRenderers[i];
                if (renderer == null) continue;
                Color color = baseColors[i];
                color.a *= Mathf.Lerp(1f, 0.34f, visibilityBlend);
                MaterialPropertyBlock block = propertyBlocks[i];
                renderer.GetPropertyBlock(block);
                block.SetColor(colorPropertyIds[i], color);
                renderer.SetPropertyBlock(block);
            }
        }
    }

    public sealed class PrecipitationFieldAnimator : MonoBehaviour
    {
        [SerializeField] private Transform[] streaks;
        [SerializeField] private LineRenderer[] groundMist;
        [SerializeField] private float fieldHeight = 18.4f;
        [SerializeField] private float fallSpeed = 17f;
        [SerializeField] private float swayAmount = 0.45f;

        private Vector3[] startPositions;
        private float[] baseMistWidths;

        public void Configure(
            Transform[] rainStreaks,
            LineRenderer[] mistLines,
            float height,
            float speed,
            float sway)
        {
            streaks = rainStreaks;
            groundMist = mistLines;
            fieldHeight = Mathf.Max(1f, height);
            fallSpeed = Mathf.Max(0.1f, speed);
            swayAmount = Mathf.Max(0f, sway);
            CaptureStarts();
        }

        private void CaptureStarts()
        {
            if (streaks == null)
            {
                startPositions = null;
            }
            else
            {
                startPositions = new Vector3[streaks.Length];
                for (int i = 0; i < streaks.Length; i++)
                {
                    if (streaks[i] != null) startPositions[i] = streaks[i].localPosition;
                }
            }

            if (groundMist == null)
            {
                baseMistWidths = null;
                return;
            }

            baseMistWidths = new float[groundMist.Length];
            for (int i = 0; i < groundMist.Length; i++)
            {
                if (groundMist[i] != null) baseMistWidths[i] = groundMist[i].widthMultiplier;
            }
        }

        private void Update()
        {
            float dt = Time.deltaTime;
            float time = Time.time;
            if (streaks != null && startPositions != null)
            {
                for (int i = 0; i < streaks.Length; i++)
                {
                    Transform streak = streaks[i];
                    if (streak == null) continue;

                    Vector3 position = streak.localPosition;
                    position.y -= fallSpeed * (1f + (i % 5) * 0.055f) * dt;
                    position.x = startPositions[i].x + Mathf.Sin(time * 1.7f + i * 0.91f) * swayAmount;
                    position.z = startPositions[i].z + Mathf.Cos(time * 1.23f + i * 0.67f) * swayAmount * 0.55f;
                    if (position.y < -0.25f)
                    {
                        position.y += fieldHeight;
                    }

                    streak.localPosition = position;
                }
            }

            if (groundMist == null || baseMistWidths == null) return;
            for (int i = 0; i < groundMist.Length; i++)
            {
                LineRenderer line = groundMist[i];
                if (line == null) continue;
                line.transform.Rotate(Vector3.up, (7f + i * 2.5f) * dt, Space.Self);
                line.widthMultiplier = baseMistWidths[i] * (1f + Mathf.Sin(time * 0.9f + i) * 0.16f);
            }
        }
    }

    public sealed class TornadoGroundContactAnimator : MonoBehaviour
    {
        [SerializeField] private LineRenderer[] dustArcs;
        [SerializeField] private float rotationSpeed = 58f;

        private float[] baseWidths;

        public void Configure(LineRenderer[] arcs, float speed)
        {
            dustArcs = arcs;
            rotationSpeed = speed;
            baseWidths = new float[arcs != null ? arcs.Length : 0];
            for (int i = 0; i < baseWidths.Length; i++)
            {
                if (dustArcs[i] != null) baseWidths[i] = dustArcs[i].widthMultiplier;
            }
        }

        private void Update()
        {
            if (dustArcs == null) return;
            float time = Time.time;
            for (int i = 0; i < dustArcs.Length; i++)
            {
                LineRenderer arc = dustArcs[i];
                if (arc == null) continue;
                arc.transform.Rotate(Vector3.up, (rotationSpeed + i * 8f) * Time.deltaTime, Space.Self);
                if (i < baseWidths.Length)
                {
                    arc.widthMultiplier = baseWidths[i] * (1f + Mathf.Sin(time * 2.1f + i) * 0.18f);
                }
            }
        }
    }
}
