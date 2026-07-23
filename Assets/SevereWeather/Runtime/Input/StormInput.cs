using UnityEngine;
#if ENABLE_INPUT_SYSTEM
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.EnhancedTouch;
using EnhancedTouch = UnityEngine.InputSystem.EnhancedTouch.Touch;
#endif

namespace SevereWeather.Input
{
    [DisallowMultipleComponent]
    public sealed class StormInput : MonoBehaviour
    {
        private const float MoveDeadZone = 0.12f;
        private const float VisualPulseSeconds = 0.14f;

        private Vector2 move;
        private bool primaryHeld;
        private bool secondaryQueued;
        private bool tertiaryQueued;
        private bool switchStormQueued;
        private bool secondaryTouchHeld;
        private bool tertiaryTouchHeld;
        private bool switchTouchHeld;
        private float secondaryVisualTimer;
        private float tertiaryVisualTimer;
        private float switchVisualTimer;
        private int moveTouchId = -1;
        private Vector2 moveTouchStart;
        private Vector2 moveTouchPosition;

        public Vector2 Move => move;
        public bool PrimaryHeld => primaryHeld;
        public bool SecondaryVisualActive => secondaryTouchHeld || secondaryVisualTimer > 0f;
        public bool TertiaryVisualActive => tertiaryTouchHeld || tertiaryVisualTimer > 0f;
        public bool SwitchStormVisualActive => switchTouchHeld || switchVisualTimer > 0f;
        public bool MoveTouchActive => moveTouchId >= 0;

        public Vector2 JoystickCenter
        {
            get
            {
                MobileControlLayout layout = MobileControlLayout.Calculate();
                return MoveTouchActive ? moveTouchStart : layout.JoystickDefaultCenter;
            }
        }

        public Vector2 JoystickThumbPosition
        {
            get
            {
                MobileControlLayout layout = MobileControlLayout.Calculate();
                return JoystickCenter + move * layout.JoystickRadius;
            }
        }

        public float JoystickRadius => MobileControlLayout.Calculate().JoystickRadius;

        private void OnEnable()
        {
#if ENABLE_INPUT_SYSTEM
            EnhancedTouchSupport.Enable();
#endif
        }

        private void OnDisable()
        {
#if ENABLE_INPUT_SYSTEM
            EnhancedTouchSupport.Disable();
#endif
            moveTouchId = -1;
            move = Vector2.zero;
            primaryHeld = false;
        }

        private void Update()
        {
            float dt = Time.unscaledDeltaTime;
            secondaryVisualTimer = Mathf.Max(0f, secondaryVisualTimer - dt);
            tertiaryVisualTimer = Mathf.Max(0f, tertiaryVisualTimer - dt);
            switchVisualTimer = Mathf.Max(0f, switchVisualTimer - dt);

            primaryHeld = false;
            secondaryTouchHeld = false;
            tertiaryTouchHeld = false;
            switchTouchHeld = false;
            move = Vector2.zero;

            ReadKeyboardAndMouse();
            ReadTouches();
        }

        public bool ConsumeSecondaryPressed()
        {
            bool result = secondaryQueued;
            secondaryQueued = false;
            return result;
        }

        public bool ConsumeTertiaryPressed()
        {
            bool result = tertiaryQueued;
            tertiaryQueued = false;
            return result;
        }

        public bool ConsumeSwitchStormPressed()
        {
            bool result = switchStormQueued;
            switchStormQueued = false;
            return result;
        }

        private void QueueSecondary()
        {
            secondaryQueued = true;
            secondaryVisualTimer = VisualPulseSeconds;
        }

        private void QueueTertiary()
        {
            tertiaryQueued = true;
            tertiaryVisualTimer = VisualPulseSeconds;
        }

        private void QueueStormSwitch()
        {
            switchStormQueued = true;
            switchVisualTimer = VisualPulseSeconds;
        }

        private void ReadKeyboardAndMouse()
        {
#if ENABLE_INPUT_SYSTEM
            Keyboard keyboard = Keyboard.current;
            if (keyboard != null)
            {
                float x = 0f;
                float y = 0f;
                if (keyboard.aKey.isPressed || keyboard.leftArrowKey.isPressed) x -= 1f;
                if (keyboard.dKey.isPressed || keyboard.rightArrowKey.isPressed) x += 1f;
                if (keyboard.sKey.isPressed || keyboard.downArrowKey.isPressed) y -= 1f;
                if (keyboard.wKey.isPressed || keyboard.upArrowKey.isPressed) y += 1f;
                move = Vector2.ClampMagnitude(new Vector2(x, y), 1f);
                primaryHeld |= keyboard.spaceKey.isPressed;
                if (keyboard.qKey.wasPressedThisFrame) QueueSecondary();
                if (keyboard.eKey.wasPressedThisFrame) QueueTertiary();
                if (keyboard.tabKey.wasPressedThisFrame) QueueStormSwitch();
            }

            Mouse mouse = Mouse.current;
            if (mouse != null)
            {
                primaryHeld |= mouse.leftButton.isPressed && mouse.position.ReadValue().x > Screen.width * 0.55f;
            }
#else
            float x = UnityEngine.Input.GetAxisRaw("Horizontal");
            float y = UnityEngine.Input.GetAxisRaw("Vertical");
            move = Vector2.ClampMagnitude(new Vector2(x, y), 1f);
            primaryHeld |= UnityEngine.Input.GetKey(KeyCode.Space);
            if (UnityEngine.Input.GetKeyDown(KeyCode.Q)) QueueSecondary();
            if (UnityEngine.Input.GetKeyDown(KeyCode.E)) QueueTertiary();
            if (UnityEngine.Input.GetKeyDown(KeyCode.Tab)) QueueStormSwitch();
#endif
        }

        private void ReadTouches()
        {
            MobileControlLayout layout = MobileControlLayout.Calculate();
            bool moveTouchFound = false;

#if ENABLE_INPUT_SYSTEM
            foreach (EnhancedTouch touch in EnhancedTouch.activeTouches)
            {
                Vector2 position = touch.screenPosition;
                int id = touch.touchId;
                bool began = touch.phase == UnityEngine.InputSystem.TouchPhase.Began;
                bool ended = touch.phase == UnityEngine.InputSystem.TouchPhase.Ended ||
                             touch.phase == UnityEngine.InputSystem.TouchPhase.Canceled;

                if (id == moveTouchId)
                {
                    if (ended)
                    {
                        moveTouchId = -1;
                        continue;
                    }

                    moveTouchFound = true;
                    moveTouchPosition = position;
                    move = ApplyDeadZone((moveTouchPosition - moveTouchStart) / layout.JoystickRadius);
                    continue;
                }

                if (moveTouchId < 0 && began && layout.MovementCapture.Contains(position))
                {
                    moveTouchId = id;
                    moveTouchStart = position;
                    moveTouchPosition = position;
                    moveTouchFound = true;
                    continue;
                }

                if (!ended)
                {
                    ReadAbilityTouch(layout, position, began);
                }
            }
#else
            for (int i = 0; i < UnityEngine.Input.touchCount; i++)
            {
                UnityEngine.Touch touch = UnityEngine.Input.GetTouch(i);
                Vector2 position = touch.position;
                int id = touch.fingerId;
                bool began = touch.phase == UnityEngine.TouchPhase.Began;
                bool ended = touch.phase == UnityEngine.TouchPhase.Ended ||
                             touch.phase == UnityEngine.TouchPhase.Canceled;

                if (id == moveTouchId)
                {
                    if (ended)
                    {
                        moveTouchId = -1;
                        continue;
                    }

                    moveTouchFound = true;
                    moveTouchPosition = position;
                    move = ApplyDeadZone((moveTouchPosition - moveTouchStart) / layout.JoystickRadius);
                    continue;
                }

                if (moveTouchId < 0 && began && layout.MovementCapture.Contains(position))
                {
                    moveTouchId = id;
                    moveTouchStart = position;
                    moveTouchPosition = position;
                    moveTouchFound = true;
                    continue;
                }

                if (!ended)
                {
                    ReadAbilityTouch(layout, position, began);
                }
            }
#endif

            if (moveTouchId >= 0 && !moveTouchFound)
            {
                moveTouchId = -1;
            }
        }

        private void ReadAbilityTouch(MobileControlLayout layout, Vector2 position, bool began)
        {
            if (layout.PrimaryButton.Contains(position))
            {
                primaryHeld = true;
                return;
            }

            if (layout.SecondaryButton.Contains(position))
            {
                secondaryTouchHeld = true;
                if (began) QueueSecondary();
                return;
            }

            if (layout.TertiaryButton.Contains(position))
            {
                tertiaryTouchHeld = true;
                if (began) QueueTertiary();
                return;
            }

            if (layout.StormSwitchButton.Contains(position))
            {
                switchTouchHeld = true;
                if (began) QueueStormSwitch();
            }
        }

        private static Vector2 ApplyDeadZone(Vector2 raw)
        {
            float magnitude = Mathf.Clamp01(raw.magnitude);
            if (magnitude <= MoveDeadZone)
            {
                return Vector2.zero;
            }

            float remapped = Mathf.InverseLerp(MoveDeadZone, 1f, magnitude);
            return raw.normalized * remapped;
        }
    }
}
