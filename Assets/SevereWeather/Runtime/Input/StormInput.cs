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
        private const float MoveRadiusPixels = 115f;

        private Vector2 move;
        private bool primaryHeld;
        private bool secondaryPressed;
        private bool tertiaryPressed;
        private bool switchStormPressed;
        private int moveTouchId = -1;
        private Vector2 moveTouchStart;

        public Vector2 Move => move;
        public bool PrimaryHeld => primaryHeld;
        public bool SecondaryPressed => secondaryPressed;
        public bool TertiaryPressed => tertiaryPressed;
        public bool SwitchStormPressed => switchStormPressed;

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
        }

        private void Update()
        {
            secondaryPressed = false;
            tertiaryPressed = false;
            switchStormPressed = false;
            primaryHeld = false;
            move = Vector2.zero;

            ReadKeyboardAndMouse();
            ReadTouches();
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
                secondaryPressed |= keyboard.qKey.wasPressedThisFrame;
                tertiaryPressed |= keyboard.eKey.wasPressedThisFrame;
                switchStormPressed |= keyboard.tabKey.wasPressedThisFrame;
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
            secondaryPressed |= UnityEngine.Input.GetKeyDown(KeyCode.Q);
            tertiaryPressed |= UnityEngine.Input.GetKeyDown(KeyCode.E);
            switchStormPressed |= UnityEngine.Input.GetKeyDown(KeyCode.Tab);
#endif
        }

        private void ReadTouches()
        {
#if ENABLE_INPUT_SYSTEM
            foreach (EnhancedTouch touch in EnhancedTouch.activeTouches)
            {
                Vector2 position = touch.screenPosition;
                int id = touch.touchId;
                if (position.x < Screen.width * 0.48f)
                {
                    if (moveTouchId < 0 || moveTouchId == id)
                    {
                        if (moveTouchId < 0)
                        {
                            moveTouchId = id;
                            moveTouchStart = position;
                        }

                        move = Vector2.ClampMagnitude((position - moveTouchStart) / MoveRadiusPixels, 1f);
                    }
                }
                else
                {
                    ReadAbilityTouch(position, touch.phase == UnityEngine.InputSystem.TouchPhase.Began);
                }
            }

            bool moveTouchStillActive = false;
            foreach (EnhancedTouch touch in EnhancedTouch.activeTouches)
            {
                if (touch.touchId == moveTouchId)
                {
                    moveTouchStillActive = true;
                    break;
                }
            }

            if (!moveTouchStillActive)
            {
                moveTouchId = -1;
            }
#else
            for (int i = 0; i < UnityEngine.Input.touchCount; i++)
            {
                UnityEngine.Touch touch = UnityEngine.Input.GetTouch(i);
                Vector2 position = touch.position;
                if (position.x < Screen.width * 0.48f)
                {
                    if (moveTouchId < 0 || moveTouchId == touch.fingerId)
                    {
                        if (moveTouchId < 0)
                        {
                            moveTouchId = touch.fingerId;
                            moveTouchStart = position;
                        }

                        move = Vector2.ClampMagnitude((position - moveTouchStart) / MoveRadiusPixels, 1f);
                    }
                }
                else
                {
                    ReadAbilityTouch(position, touch.phase == UnityEngine.TouchPhase.Began);
                }

                if (touch.phase == UnityEngine.TouchPhase.Ended || touch.phase == UnityEngine.TouchPhase.Canceled)
                {
                    if (touch.fingerId == moveTouchId)
                    {
                        moveTouchId = -1;
                    }
                }
            }
#endif
        }

        private void ReadAbilityTouch(Vector2 position, bool began)
        {
            float normalizedX = position.x / Mathf.Max(1f, Screen.width);
            float normalizedY = position.y / Mathf.Max(1f, Screen.height);

            if (normalizedY > 0.82f && normalizedX > 0.38f && normalizedX < 0.66f)
            {
                switchStormPressed |= began;
                return;
            }

            if (normalizedY < 0.34f)
            {
                primaryHeld = true;
            }
            else if (normalizedY < 0.62f)
            {
                tertiaryPressed |= began;
            }
            else
            {
                secondaryPressed |= began;
            }
        }
    }
}
