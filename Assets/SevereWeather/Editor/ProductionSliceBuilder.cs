using System;
using System.IO;
using SevereWeather.Core;
using SevereWeather.World;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.SceneManagement;

namespace SevereWeather.Editor
{
    public static class ProductionSliceBuilder
    {
        private const string SceneDirectory = "Assets/SevereWeather/Scenes";
        private const string ScenePath = SceneDirectory + "/ProductionSlice.unity";
        private const string GeneratedDirectory = "Assets/__GeneratedBuild";
        private const string GeneratedResourcesDirectory = GeneratedDirectory + "/Resources";
        private const string ProductVersion = "0.1.9";
        private const int AndroidVersionCode = 9;

        [MenuItem("Tools/Severe Weather/Create Production Slice Scene", priority = 10)]
        public static void CreateProductionSliceScene()
        {
            ConfigureBuildIdentityAndMaterials();
            ConfigurePlayerAndQualitySettings();

            Directory.CreateDirectory(SceneDirectory);
            Scene scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
            GameObject bootstrap = new GameObject("SevereWeather_Bootstrap");
            bootstrap.AddComponent<GameBootstrap>();
            EditorSceneManager.SaveScene(scene, ScenePath);
            EditorBuildSettings.scenes = new[] { new EditorBuildSettingsScene(ScenePath, true) };

            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Selection.activeGameObject = bootstrap;
            Debug.Log($"[Severe Weather] Build #5.2 production slice created at {ScenePath}");
        }

        private static void ConfigureBuildIdentityAndMaterials()
        {
            if (AssetDatabase.IsValidFolder(GeneratedDirectory))
            {
                AssetDatabase.DeleteAsset(GeneratedDirectory);
            }

            Directory.CreateDirectory(GeneratedResourcesDirectory);
            AssetDatabase.Refresh();
            CreateMaterialAsset(
                GeneratedResourcesDirectory + "/RuntimeWorldLit.mat",
                FindRequiredShader("Standard", "SevereWeather/RuntimeColor"));
            CreateMaterialAsset(
                GeneratedResourcesDirectory + "/RuntimeUnlit.mat",
                FindRequiredShader("Sprites/Default", "Unlit/Color", "SevereWeather/RuntimeColor"));

            string revision = Environment.GetEnvironmentVariable("GIT_COMMIT");
            if (string.IsNullOrWhiteSpace(revision))
            {
                revision = Environment.GetEnvironmentVariable("BUILD_REVISION");
            }
            if (string.IsNullOrWhiteSpace(revision)) revision = "local";
            string cloudBuildNumber = Environment.GetEnvironmentVariable("BUILD_NUMBER");
            if (string.IsNullOrWhiteSpace(cloudBuildNumber)) cloudBuildNumber = "5.2";

            string buildInfo =
                $"version={ProductVersion}\n" +
                $"build={cloudBuildNumber}\n" +
                $"commit={revision}\n" +
                $"utc={DateTime.UtcNow:O}\n";
            File.WriteAllText(GeneratedResourcesDirectory + "/BuildInfo.txt", buildInfo);
            AssetDatabase.Refresh();
        }

        private static Shader FindRequiredShader(params string[] candidates)
        {
            Shader shader = FindOptionalShader(candidates);
            if (shader == null)
            {
                throw new InvalidOperationException(
                    "No compatible runtime shader was found. Tried: " + string.Join(", ", candidates));
            }

            return shader;
        }

        private static Shader FindOptionalShader(params string[] candidates)
        {
            for (int i = 0; i < candidates.Length; i++)
            {
                Shader shader = Shader.Find(candidates[i]);
                if (shader != null) return shader;
            }

            return null;
        }

        private static void CreateMaterialAsset(string path, Shader shader)
        {
            if (shader == null)
            {
                Debug.LogWarning($"[Severe Weather] Skipping generated material {path}; shader unavailable.");
                return;
            }

            Material material = new Material(shader)
            {
                name = Path.GetFileNameWithoutExtension(path),
                enableInstancing = true
            };
            if (material.HasProperty("_BaseColor")) material.SetColor("_BaseColor", Color.white);
            if (material.HasProperty("_Color")) material.SetColor("_Color", Color.white);
            if (material.HasProperty("_Metallic")) material.SetFloat("_Metallic", 0f);
            if (material.HasProperty("_Smoothness")) material.SetFloat("_Smoothness", 0.25f);
            if (material.HasProperty("_Glossiness")) material.SetFloat("_Glossiness", 0.25f);
            AssetDatabase.CreateAsset(material, path);
        }

        private static void ConfigurePlayerAndQualitySettings()
        {
            PlayerSettings.companyName = "Severe Weather Project";
            PlayerSettings.productName = "Severe Weather";
            PlayerSettings.bundleVersion = ProductVersion;
            PlayerSettings.defaultInterfaceOrientation = UIOrientation.LandscapeLeft;
            PlayerSettings.colorSpace = ColorSpace.Linear;
            PlayerSettings.SetApplicationIdentifier(NamedBuildTarget.Android, "com.lybyerclab.severewarning");
            PlayerSettings.SetScriptingBackend(NamedBuildTarget.Android, ScriptingImplementation.IL2CPP);
            PlayerSettings.SetManagedStrippingLevel(NamedBuildTarget.Android, ManagedStrippingLevel.Medium);
            PlayerSettings.Android.bundleVersionCode = AndroidVersionCode;
            PlayerSettings.Android.minSdkVersion = AndroidSdkVersions.AndroidApiLevel26;
            PlayerSettings.Android.targetSdkVersion = AndroidSdkVersions.AndroidApiLevelAuto;
            PlayerSettings.Android.targetArchitectures = AndroidArchitecture.ARM64;
            PlayerSettings.SetUseDefaultGraphicsAPIs(BuildTarget.Android, false);
            PlayerSettings.SetGraphicsAPIs(
                BuildTarget.Android,
                new[] { GraphicsDeviceType.Vulkan });
            EditorUserBuildSettings.buildAppBundle = false;

            QualitySettings.vSyncCount = 0;
            QualitySettings.antiAliasing = 2;
            QualitySettings.shadows = ShadowQuality.All;
            QualitySettings.shadowResolution = ShadowResolution.Medium;
            QualitySettings.shadowDistance = 130f;
            QualitySettings.anisotropicFiltering = AnisotropicFiltering.Enable;
            QualitySettings.pixelLightCount = 2;
        }

        [MenuItem("Tools/Severe Weather/Validate Production Starter", priority = 20)]
        public static void ValidateProductionStarter()
        {
            bool hasScene = File.Exists(ScenePath);
            bool hasBootstrap = UnityEngine.Object.FindFirstObjectByType<GameBootstrap>() != null;
            bool hasInputPackage = File.Exists("Packages/manifest.json") && File.ReadAllText("Packages/manifest.json").Contains("com.unity.inputsystem");
            bool hasUrpPackage = File.Exists("Packages/manifest.json") && File.ReadAllText("Packages/manifest.json").Contains("com.unity.render-pipelines.universal");
            bool hasStandardShader = Shader.Find("Standard") != null;
            bool hasUrpShader = Shader.Find("Universal Render Pipeline/Lit") != null;

            DensityReport density = Application.isPlaying
                ? WorldDensityValidator.Evaluate()
                : new DensityReport(0, 0, 0, 0f, 0f, false);

            string message =
                $"Scene file: {hasScene}\n" +
                $"Bootstrap in open scene: {hasBootstrap}\n" +
                $"Input System declared: {hasInputPackage}\n" +
                $"URP declared: {hasUrpPackage}\n" +
                $"Standard shader available: {hasStandardShader}\n" +
                $"URP Lit shader available: {hasUrpShader}\n" +
                $"Runtime density: {(Application.isPlaying ? density.ToString() : "Enter Play Mode to measure")}\n";

            if (!hasScene || !hasInputPackage || (!hasStandardShader && !hasUrpShader))
            {
                EditorUtility.DisplayDialog("Severe Weather Validation", message + "\nOne or more required items are missing.", "OK");
                Debug.LogError(message);
            }
            else
            {
                EditorUtility.DisplayDialog("Severe Weather Validation", message + "\nBuild #5.2 structure is ready for device testing.", "OK");
                Debug.Log(message);
            }
        }
    }
}
