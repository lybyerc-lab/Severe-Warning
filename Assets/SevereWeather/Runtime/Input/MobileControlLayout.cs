using UnityEngine;

namespace SevereWeather.Input
{
    public readonly struct MobileControlLayout
    {
        private MobileControlLayout(
            Rect safeArea,
            Rect movementCapture,
            Vector2 joystickDefaultCenter,
            float joystickRadius,
            Rect primaryButton,
            Rect secondaryButton,
            Rect tertiaryButton,
            Rect stormSwitchButton)
        {
            SafeArea = safeArea;
            MovementCapture = movementCapture;
            JoystickDefaultCenter = joystickDefaultCenter;
            JoystickRadius = joystickRadius;
            PrimaryButton = primaryButton;
            SecondaryButton = secondaryButton;
            TertiaryButton = tertiaryButton;
            StormSwitchButton = stormSwitchButton;
        }

        public Rect SafeArea { get; }
        public Rect MovementCapture { get; }
        public Vector2 JoystickDefaultCenter { get; }
        public float JoystickRadius { get; }
        public Rect PrimaryButton { get; }
        public Rect SecondaryButton { get; }
        public Rect TertiaryButton { get; }
        public Rect StormSwitchButton { get; }

        public static MobileControlLayout Calculate()
        {
            Rect safe = Screen.safeArea;
            if (safe.width <= 1f || safe.height <= 1f)
            {
                safe = new Rect(0f, 0f, Screen.width, Screen.height);
            }

            float margin = Mathf.Clamp(safe.height * 0.028f, 10f, 22f);
            float joystickRadius = Mathf.Clamp(safe.height * 0.16f, 68f, 118f);
            Vector2 joystickCenter = new Vector2(
                safe.xMin + margin + joystickRadius,
                safe.yMin + margin + joystickRadius);

            Rect movementCapture = new Rect(
                safe.xMin,
                safe.yMin,
                safe.width * 0.50f,
                safe.height * 0.72f);

            float primarySize = Mathf.Clamp(safe.height * 0.17f, 76f, 118f);
            float companionSize = primarySize * 0.84f;
            float gap = Mathf.Clamp(safe.height * 0.018f, 8f, 14f);
            float primaryX = safe.xMax - margin - primarySize;
            float primaryY = safe.yMin + margin;

            Rect primary = new Rect(primaryX, primaryY, primarySize, primarySize);
            Rect tertiary = new Rect(
                primary.xMin - gap - companionSize,
                primary.yMin + (primarySize - companionSize) * 0.5f,
                companionSize,
                companionSize);
            Rect secondary = new Rect(
                tertiary.xMin - gap - companionSize,
                tertiary.yMin,
                companionSize,
                companionSize);

            float switchWidth = Mathf.Clamp(safe.width * 0.25f, 170f, 340f);
            float switchHeight = Mathf.Clamp(safe.height * 0.075f, 40f, 58f);
            Rect stormSwitch = new Rect(
                safe.center.x - switchWidth * 0.5f,
                safe.yMax - margin - switchHeight,
                switchWidth,
                switchHeight);

            return new MobileControlLayout(
                safe,
                movementCapture,
                joystickCenter,
                joystickRadius,
                primary,
                secondary,
                tertiary,
                stormSwitch);
        }

        public static Rect ToGuiRect(Rect screenRect)
        {
            return new Rect(
                screenRect.x,
                Screen.height - screenRect.yMax,
                screenRect.width,
                screenRect.height);
        }

        public static Vector2 ScreenToGuiPoint(Vector2 screenPoint)
        {
            return new Vector2(screenPoint.x, Screen.height - screenPoint.y);
        }
    }
}
