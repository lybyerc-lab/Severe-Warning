/**
 * [SW:ARCH:PHASE7_TRAFFIC_CONTRACTS]
 * Type definitions for ambient vehicle fleet, road waypoints, and panic reactions.
 */

export type VehicleModelType = 'town-car' | 'pickup-truck' | 'news-van' | 'storm-chaser-vehicle';

export interface TrafficWaypoint {
  x: number;
  z: number;
  dx: number;
  dz: number;
}

export interface TrafficVehicleState {
  id: string;
  model: VehicleModelType;
  x: number;
  z: number;
  speed: number;
  baseSpeed: number;
  headingRadians: number;
  color: string;
  isFleeing: boolean;
  isProtected: boolean; // First Law: Nothing that moves is ever harmed.
}

export interface TrafficFleetSnapshot {
  totalVehicles: number;
  modelDistribution: Record<VehicleModelType, number>;
  fleeingCount: number;
  averageSpeed: number;
  vehicles: TrafficVehicleState[];
}

export interface TrafficSystemContract {
  spawnFleet(count: number, waypoints: TrafficWaypoint[]): void;
  update(deltaSeconds: number, stormX?: number, stormZ?: number): void;
  getSnapshot(): TrafficFleetSnapshot;
  reset(): void;
}
