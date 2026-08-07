// ============================================================================
// [SW:PLAYCANVAS:ONE_STICK_CHASE_CAMERA]
// Third-person camera controller for a one-stick storm. Gameplay authority owns
// movement; this controller owns only the visible camera heading and basis.
// ============================================================================

export interface ChaseCameraConfig {
  readonly distance: number;
  readonly turnRateRadiansPerSecond: number;
  readonly headingDeadZoneRadians: number;
  readonly movementThreshold: number;
  readonly intentMagnitudeThreshold: number;
  readonly initialForwardX: number;
  readonly initialForwardZ: number;
}

export interface ChaseCameraPose {
  readonly cameraX: number;
  readonly cameraZ: number;
  readonly forwardX: number;
  readonly forwardZ: number;
  readonly headingRadians: number;
  readonly desiredHeadingRadians: number;
  readonly headingErrorRadians: number;
  readonly travelSpeed: number;
  readonly turning: boolean;
  readonly inputActive: boolean;
}

const TWO_PI = Math.PI * 2;
// Keep chase rotation approximately time-correct through ordinary frame drops,
// but cap a single step so returning from a long stall cannot whip the camera.
const MAX_CAMERA_STEP_SECONDS = 0.12;

// [SW:PLAYCANVAS:OWNER_TRAILING_POLISH]
// Larger-map hands-on testing found the camera caught up a little too far toward
// travel direction during sustained turns. Preserve the sealed 1.05 rad/s base
// config as the reference and retain 10% more trailing view in the camera-only
// presentation response. Gameplay movement and camera-relative input are unchanged.
const OWNER_TRAILING_TURN_SCALE = 0.9;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function wrapAngle(radians: number): number {
  let wrapped = (radians + Math.PI) % TWO_PI;
  if (wrapped < 0) wrapped += TWO_PI;
  return wrapped - Math.PI;
}

function shortestAngle(from: number, to: number): number {
  return wrapAngle(to - from);
}

function normalize2(x: number, z: number): Readonly<{ x: number; z: number }> {
  const length = Math.max(0.0001, Math.hypot(x, z));
  return Object.freeze({ x: x / length, z: z / length });
}

export class OneStickChaseCamera {
  private readonly config: ChaseCameraConfig;
  private readonly initialHeadingRadians: number;
  private headingRadians: number;
  private desiredHeadingRadians: number;
  private lastStormX: number;
  private lastStormZ: number;
  private inputActive = false;

  constructor(config: ChaseCameraConfig, stormX: number, stormZ: number) {
    this.config = config;
    const initialForward = normalize2(config.initialForwardX, config.initialForwardZ);
    this.initialHeadingRadians = Math.atan2(initialForward.z, initialForward.x);
    this.headingRadians = this.initialHeadingRadians;
    this.desiredHeadingRadians = this.initialHeadingRadians;
    this.lastStormX = stormX;
    this.lastStormZ = stormZ;
  }

  reset(stormX: number, stormZ: number): void {
    this.headingRadians = this.initialHeadingRadians;
    this.desiredHeadingRadians = this.initialHeadingRadians;
    this.lastStormX = stormX;
    this.lastStormZ = stormZ;
    this.inputActive = false;
  }

  setTravelIntent(worldX: number, worldZ: number, active: boolean): void {
    const magnitude = Math.hypot(worldX, worldZ);
    if (!active || magnitude < this.config.intentMagnitudeThreshold) {
      this.inputActive = false;
      return;
    }
    this.inputActive = true;
    this.desiredHeadingRadians = Math.atan2(worldZ, worldX);
  }

  screenToWorldDirection(screenX: number, screenY: number): Readonly<{ x: number; z: number }> {
    const forwardX = Math.cos(this.headingRadians);
    const forwardZ = Math.sin(this.headingRadians);
    const rightX = -forwardZ;
    const rightZ = forwardX;
    const screenUp = -screenY;
    const worldX = rightX * screenX + forwardX * screenUp;
    const worldZ = rightZ * screenX + forwardZ * screenUp;
    const magnitude = Math.hypot(worldX, worldZ);
    if (magnitude <= 1) return Object.freeze({ x: worldX, z: worldZ });
    return Object.freeze({ x: worldX / magnitude, z: worldZ / magnitude });
  }

  update(stormX: number, stormZ: number, deltaSeconds: number): ChaseCameraPose {
    const safeDelta = clamp(deltaSeconds, 0, MAX_CAMERA_STEP_SECONDS);
    const travelX = stormX - this.lastStormX;
    const travelZ = stormZ - this.lastStormZ;
    const travelDistance = Math.hypot(travelX, travelZ);
    const travelSpeed = safeDelta > 0.0001 ? travelDistance / safeDelta : 0;

    // Active one-stick intent is authoritative for camera recentering. When the
    // stick is released, observed storm travel becomes the fallback so the
    // camera can finish settling behind momentum without being welded to input.
    if (!this.inputActive && travelSpeed >= this.config.movementThreshold && travelDistance > 0.0001) {
      this.desiredHeadingRadians = Math.atan2(travelZ, travelX);
    }

    const rawError = shortestAngle(this.headingRadians, this.desiredHeadingRadians);
    const errorMagnitude = Math.abs(rawError);
    let appliedError = 0;
    if (errorMagnitude > this.config.headingDeadZoneRadians) {
      appliedError = rawError - Math.sign(rawError) * this.config.headingDeadZoneRadians;
    }

    const maximumTurn = this.config.turnRateRadiansPerSecond * OWNER_TRAILING_TURN_SCALE * safeDelta;
    const turnStep = clamp(appliedError, -maximumTurn, maximumTurn);
    this.headingRadians = wrapAngle(this.headingRadians + turnStep);

    const forwardX = Math.cos(this.headingRadians);
    const forwardZ = Math.sin(this.headingRadians);
    const cameraX = stormX - forwardX * this.config.distance;
    const cameraZ = stormZ - forwardZ * this.config.distance;

    this.lastStormX = stormX;
    this.lastStormZ = stormZ;

    return Object.freeze({
      cameraX,
      cameraZ,
      forwardX,
      forwardZ,
      headingRadians: this.headingRadians,
      desiredHeadingRadians: this.desiredHeadingRadians,
      headingErrorRadians: shortestAngle(this.headingRadians, this.desiredHeadingRadians),
      travelSpeed,
      turning: Math.abs(turnStep) > 0.0001,
      inputActive: this.inputActive,
    });
  }
}
