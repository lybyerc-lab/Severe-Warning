using System.IO;
using SevereWeather.Core;
using SevereWeather.World;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace SevereWeather.Editor
{
    public static class ProductionSliceBuilder
    {
        private const string SceneDirectory = "Assets/SevereWeather/Scenes";
        private const string ScenePath = SceneDirectory + "/ProductionSlice.unity";

        [MenuItem("Tools/Severe Weather/Create Production Slice Scene", priority = 10)]
        public static void CreateProductionSliceScene()
        {
            Directory.CreateDirectory(SceneDirectory);
            Scene scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
            GameObject bootstrap = new GameObject("SevereWeather_Bootstrap");
            bootstrap.AddComponent<GameBootstrap>();
            EditorSceneManager.SaveScene(scene, ScenePath);
            EditorBuildSettings.scenes = new[] { new EditorBuildSettingsScene(ScenePath, true) };

            PlayerSettings.companyName = "Severe Weather Project";
            PlayerSettings.productName = "Severe Weather";
            PlayerSettings.defaultInterfaceOrientation = UIOrientation.LandscapeLeft;
            PlayerSettings.colorSpace = ColorSpace.Linear;

            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Selection.activeGameObject = bootstrap;
            Debug.Log($"[Severe Weather] Production slice created at {ScenePath}");
        }

        [MenuItem("Tools/Severe Weather/Validate Production Starter", priority = 20)]
        public static void ValidateProductionStarter()
        {
            bool hasScene = File.Exists(ScenePath);
            bool hasBootstrap = Object.FindFirstObjectByType<GameBootstrap>() != null;
            bool hasInputPackage = File.Exists("Packages/manifest.json") && File.ReadAllText("Packages/manifest.json").Contains("com.unity.inputsystem");
            bool hasUrpPackage = File.Exists("Packages/manifest.json") && File.ReadAllText("Packages/manifest.json").Contains("com.unity.render-pipelines.universal");

            DensityReport density = Application.isPlaying
                ? WorldDensityValidator.Evaluate()
                : new DensityReport(0, 0f, 0f, false);

            string message =
                $"Scene file: {hasScene}\n" +
                $"Bootstrap in open scene: {hasBootstrap}\n" +
                $"Input System declared: {hasInputPackage}\n" +
                $"URP declared: {hasUrpPackage}\n" +
                $"Runtime density: {(Application.isPlaying ? density.ToString() : "Enter Play Mode to measure")}\n";

            if (!hasScene || !hasInputPackage || !hasUrpPackage)
            {
                EditorUtility.DisplayDialog("Severe Weather Validation", message + "\nOne or more required items are missing.", "OK");
                Debug.LogError(message);
            }
            else
            {
                EditorUtility.DisplayDialog("Severe Weather Validation", message + "\nStarter structure is ready for editor testing.", "OK");
                Debug.Log(message);
            }
        }
    }
}
