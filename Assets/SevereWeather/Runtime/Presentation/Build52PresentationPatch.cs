using System.Collections.Generic;
using SevereWeather.Damage;
using UnityEngine;

namespace SevereWeather.Presentation
{
    [DefaultExecutionOrder(900)]
    public sealed class Build52PresentationPatch : MonoBehaviour
    {
        private static readonly int BaseColorId = Shader.PropertyToID("_BaseColor");
        private static readonly int ColorId = Shader.PropertyToID("_Color");
        private static float startedAt;

        private readonly Dictionary<int, CropPose> crops = new Dictionary<int, CropPose>();
        private readonly List<int> staleCropIds = new List<int>();
        private Camera mainCamera;
        private float nextCropScan;

        public static float ElapsedSeconds => startedAt <= 0f ? 0f : Mathf.Max(0f, Time.unscaledTime - startedAt);
        public static int ManagedCropCount { get; private set; }
        public static int HiddenCropCount { get; private set; }

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        private static void Install()
        {
            if (Object.FindFirstObjectByType<Build52PresentationPatch>() != null) return;
            GameObject root = new GameObject("Build 5.2 Presentation Patch");
            root.AddComponent<Build52PresentationPatch>();
        }

        private void Awake()
        {
            startedAt = Time.unscaledTime;
        }

        private void Update()
        {
            PatchStormTrails();
            PatchLineArtifacts();

            if (Time.unscaledTime < nextCropScan) return;
            nextCropScan = Time.unscaledTime + 0.12f;
            if (mainCamera == null) mainCamera = Camera.main;
            CaptureCrops();
            UpdateCropAftermath();
        }

        private static void PatchStormTrails()
        {
            TrailRenderer[] trails = Object.FindObjectsByType<TrailRenderer>(FindObjectsSortMode.None);
            for (int i = 0; i < trails.Length; i++)
            {
                TrailRenderer trail = trails[i];
                if (trail == null) continue;
                string rootName = trail.transform.root != null ? trail.transform.root.name : string.Empty;
                if (!rootName.Contains("Player Supercell") && trail.startWidth <= 4f) continue;
                trail.emitting = false;
                trail.Clear();
                trail.enabled = false;
            }
        }

        private static void PatchLineArtifacts()
        {
            LineRenderer[] lines = Object.FindObjectsByType<LineRenderer>(FindObjectsSortMode.None);
            for (int i = 0; i < lines.Length; i++)
            {
                LineRenderer line = lines[i];
                if (line == null) continue;
                string objectName = line.gameObject.name;

                if (objectName.Contains("Ground Mist Arc"))
                {
                    line.enabled = false;
                    continue;
                }

                if (objectName.Contains("Dust Arc"))
                {
                    line.widthMultiplier = Mathf.Min(line.widthMultiplier, 0.075f);
                    line.startColor = new Color(0.52f, 0.39f, 0.24f, 0.025f);
                    line.endColor = new Color(0.52f, 0.39f, 0.24f, 0.11f);
                    continue;
                }

                if (objectName.StartsWith("Hail Drop"))
                {
                    line.widthMultiplier = Mathf.Min(line.widthMultiplier, 0.07f);
                    continue;
                }

                if (objectName == "Storm Ring" || objectName == "Storm Swath")
                {
                    Vector3 size = line.bounds.size;
                    float diameter = Mathf.Max(size.x, size.z);
                    if (diameter >= 12f || line.widthMultiplier >= 0.3f)
                    {
                        Object.Destroy(line.gameObject);
                    }
                }
            }
        }

        private void CaptureCrops()
        {
            DamageableStructure[] structures = Object.FindObjectsByType<DamageableStructure>(FindObjectsSortMode.None);
            for (int i = 0; i < structures.Length; i++)
            {
                DamageableStructure structure = structures[i];
                if (structure == null || structure.MaterialClass != MaterialClass.Crop) continue;
                int id = structure.GetInstanceID();
                if (!crops.ContainsKey(id)) crops.Add(id, CropPose.Capture(structure));
            }
        }

        private void UpdateCropAftermath()
        {
            staleCropIds.Clear();
            HiddenCropCount = 0;

            foreach (KeyValuePair<int, CropPose> pair in crops)
            {
                CropPose pose = pair.Value;
                if (pose.Target == null)
                {
                    staleCropIds.Add(pair.Key);
                    continue;
                }

                if ((int)pose.Target.Stage < (int)DamageStage.Damaged)
                {
                    pose.SetVisible(true, false);
                    continue;
                }

                float yFactor;
                float widthFactor;
                float lengthFactor;
                float colorFactor;
                switch (pose.Target.Stage)
                {
                    case DamageStage.Damaged:
                        yFactor = 0.2f;
                        widthFactor = 0.84f;
                        lengthFactor = 1.04f;
                        colorFactor = 0.66f;
                        break;
                    case DamageStage.Critical:
                        yFactor = 0.075f;
                        widthFactor = 0.74f;
                        lengthFactor = 1.06f;
                        colorFactor = 0.54f;
                        break;
                    default:
                        yFactor = 0.026f;
                        widthFactor = 0.66f;
                        lengthFactor = 1.02f;
                        colorFactor = 0.45f;
                        break;
                }

                Vector3 scale = new Vector3(
                    pose.IntactScale.x * widthFactor,
                    pose.IntactScale.y * yFactor,
                    pose.IntactScale.z * lengthFactor);
                float yawVariation = Mathf.Abs(pose.Target.GetInstanceID() % 17) - 8f;
                pose.Target.transform.localScale = scale;
                pose.Target.transform.localRotation = pose.IntactRotation * Quaternion.Euler(0f, yawVariation, 0f);
                pose.Target.transform.localPosition = pose.IntactPosition +
                    Vector3.down * ((pose.IntactScale.y - scale.y) * 0.5f + 0.012f);

                bool patchThinning = pose.Target.Stage == DamageStage.Destroyed &&
                    Mathf.Abs(pose.Target.GetInstanceID() % 4) == 0;
                bool distant = mainCamera != null &&
                    Vector3.Distance(mainCamera.transform.position, pose.Target.transform.position) > 118f;
                bool hidden = patchThinning || distant;
                if (hidden) HiddenCropCount++;
                pose.ApplyColorAndVisibility(colorFactor, !hidden, distant);
            }

            for (int i = 0; i < staleCropIds.Count; i++) crops.Remove(staleCropIds[i]);
            ManagedCropCount = crops.Count;
        }

        private sealed class CropPose
        {
            public DamageableStructure Target;
            public Vector3 IntactScale;
            public Vector3 IntactPosition;
            public Quaternion IntactRotation;
            public Renderer[] Renderers;
            public Color[] IntactColors;
            public int[] ColorProperties;
            public MaterialPropertyBlock[] Blocks;

            public static CropPose Capture(DamageableStructure target)
            {
                Renderer[] renderers = target.GetComponentsInChildren<Renderer>(true);
                CropPose pose = new CropPose
                {
                    Target = target,
                    IntactScale = target.transform.localScale,
                    IntactPosition = target.transform.localPosition,
                    IntactRotation = target.transform.localRotation,
                    Renderers = renderers,
                    IntactColors = new Color[renderers.Length],
                    ColorProperties = new int[renderers.Length],
                    Blocks = new MaterialPropertyBlock[renderers.Length]
                };

                for (int i = 0; i < renderers.Length; i++)
                {
                    Renderer renderer = renderers[i];
                    Material material = renderer != null ? renderer.sharedMaterial : null;
                    if (material != null && material.HasProperty(BaseColorId))
                    {
                        pose.IntactColors[i] = material.GetColor(BaseColorId);
                        pose.ColorProperties[i] = BaseColorId;
                    }
                    else if (material != null && material.HasProperty(ColorId))
                    {
                        pose.IntactColors[i] = material.GetColor(ColorId);
                        pose.ColorProperties[i] = ColorId;
                    }
                    pose.Blocks[i] = new MaterialPropertyBlock();
                }
                return pose;
            }

            public void SetVisible(bool visible, bool forceOff)
            {
                for (int i = 0; i < Renderers.Length; i++)
                {
                    Renderer renderer = Renderers[i];
                    if (renderer == null) continue;
                    renderer.enabled = visible;
                    renderer.forceRenderingOff = forceOff;
                }
            }

            public void ApplyColorAndVisibility(float factor, bool visible, bool forceOff)
            {
                for (int i = 0; i < Renderers.Length; i++)
                {
                    Renderer renderer = Renderers[i];
                    if (renderer == null) continue;
                    renderer.enabled = visible;
                    renderer.forceRenderingOff = forceOff;
                    int propertyId = ColorProperties[i];
                    if (propertyId == 0) continue;

                    Color intact = IntactColors[i];
                    Color flattened = new Color(
                        intact.r * factor * 0.9f,
                        intact.g * factor,
                        intact.b * factor * 0.72f,
                        intact.a);
                    MaterialPropertyBlock block = Blocks[i];
                    renderer.GetPropertyBlock(block);
                    block.SetColor(propertyId, flattened);
                    renderer.SetPropertyBlock(block);
                }
            }
        }
    }
}
