using UnityEditor;
using UnityEngine;

namespace SevereWeather.Editor
{
    public sealed class ProjectReadinessWindow : EditorWindow
    {
        [MenuItem("Tools/Severe Weather/Production Readiness", priority = 30)]
        private static void Open()
        {
            GetWindow<ProjectReadinessWindow>("Severe Weather Readiness");
        }

        private void OnGUI()
        {
            EditorGUILayout.LabelField("Severe Weather Production Starter", EditorStyles.boldLabel);
            EditorGUILayout.Space();
            EditorGUILayout.HelpBox(
                "This starter proves architecture and direct-control storm differentiation. " +
                "It does not contain final production art, final audio, or a finished living-region scene.",
                MessageType.Info);

            EditorGUILayout.LabelField("Required next gates", EditorStyles.boldLabel);
            EditorGUILayout.ToggleLeft("Unity 6.3 LTS project opens without compile errors", false);
            EditorGUILayout.ToggleLeft("Production slice scene generated", false);
            EditorGUILayout.ToggleLeft("Tornado and Supercell both playable", false);
            EditorGUILayout.ToggleLeft("Android device build completed", false);
            EditorGUILayout.ToggleLeft("Asset laboratory replaces graybox primitives", false);
            EditorGUILayout.ToggleLeft("Dense urban-rural region passes no-dead-zone test", false);
            EditorGUILayout.ToggleLeft("Realistic layered audio passes phone-speaker test", false);

            EditorGUILayout.Space();
            if (GUILayout.Button("Create Production Slice Scene"))
            {
                ProductionSliceBuilder.CreateProductionSliceScene();
            }
            if (GUILayout.Button("Validate Starter"))
            {
                ProductionSliceBuilder.ValidateProductionStarter();
            }
        }
    }
}
