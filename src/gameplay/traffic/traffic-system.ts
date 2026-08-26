import type {
  VehicleModelType,
  TrafficWaypoint,
  TrafficVehicleState,
  TrafficFleetSnapshot,
  TrafficSystemContract
} from './traffic-contracts.ts';

const VEHICLE_COLORS = [
  '#ef4444', '#3b82f6', '#22c55e', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#f97316',
  '#64748b', '#e11d48'
];

export class TrafficSystem implements TrafficSystemContract {
  private vehicles: TrafficVehicleState[] = [];
  private waypoints: TrafficWaypoint[] = [];

  constructor() {}

  public spawnFleet(count: number, waypoints: TrafficWaypoint[]): void {
    this.vehicles.length = 0;
    this.waypoints = [...waypoints];
    if (waypoints.length === 0) return;

    const models: VehicleModelType[] = [
      'town-car',
      'pickup-truck',
      'news-van',
      'storm-chaser-vehicle'
    ];

    for (let i = 0; i < count; i++) {
      const wp = waypoints[i % waypoints.length];
      const model = models[i % models.length];
      const color = VEHICLE_COLORS[i % VEHICLE_COLORS.length];
      const offset = (i * 24) % 460;
      const x = wp.x + wp.dx * offset;
      const z = wp.z + wp.dz * offset;
      const baseSpeed = 20 + (i % 5) * 2.5;

      this.vehicles.push({
        id: `traffic-${i + 1}`,
        model,
        x,
        z,
        speed: baseSpeed,
        baseSpeed,
        headingRadians: Math.atan2(wp.dx, wp.dz),
        color,
        isFleeing: false,
        isProtected: true // Protected by First Law
      });
    }
  }

  public update(deltaSeconds: number, stormX?: number, stormZ?: number): void {
    const dt = Math.max(0, Math.min(0.1, deltaSeconds));

    for (let i = 0; i < this.vehicles.length; i++) {
      const v = this.vehicles[i];
      const wp = this.waypoints[i % this.waypoints.length];

      // Check distance to storm for panic flee reaction
      if (typeof stormX === 'number' && typeof stormZ === 'number') {
        const dx = v.x - stormX;
        const dz = v.z - stormZ;
        const distSq = dx * dx + dz * dz;
        if (distSq < 60 * 60) {
          v.isFleeing = true;
          v.speed = v.baseSpeed * 1.6; // Accelerate away from vortex
        } else {
          v.isFleeing = false;
          v.speed = v.baseSpeed;
        }
      }

      v.x += wp.dx * v.speed * dt;
      v.z += wp.dz * v.speed * dt;

      // Wrap around county road bounds
      if (v.x > 240) v.x = -240;
      if (v.x < -240) v.x = 240;
      if (v.z > 240) v.z = -240;
      if (v.z < -240) v.z = 240;
    }
  }

  public getSnapshot(): TrafficFleetSnapshot {
    const distribution: Record<VehicleModelType, number> = {
      'town-car': 0,
      'pickup-truck': 0,
      'news-van': 0,
      'storm-chaser-vehicle': 0
    };

    let totalSpeed = 0;
    let fleeingCount = 0;

    for (const v of this.vehicles) {
      distribution[v.model] = (distribution[v.model] || 0) + 1;
      totalSpeed += v.speed;
      if (v.isFleeing) fleeingCount += 1;
    }

    const totalVehicles = this.vehicles.length;
    const averageSpeed = totalVehicles > 0 ? Number((totalSpeed / totalVehicles).toFixed(1)) : 0;

    return {
      totalVehicles,
      modelDistribution: distribution,
      fleeingCount,
      averageSpeed,
      vehicles: this.vehicles.map(v => ({ ...v }))
    };
  }

  public reset(): void {
    this.vehicles.length = 0;
    this.waypoints.length = 0;
  }
}
