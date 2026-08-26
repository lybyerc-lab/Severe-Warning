import type {
  Vector3D,
  DamageableEntity,
  CollisionEvent
} from './tornado-physics-contracts.ts';

export class CollisionDetectionSystem {
  private entities = new Map<string, DamageableEntity>();

  public registerEntity(entity: DamageableEntity): void {
    this.entities.set(entity.id, { ...entity });
  }

  public unregisterEntity(id: string): void {
    this.entities.delete(id);
  }

  /**
   * [SW:LAW:FIRST-LAW]
   * damageTarget is the single chokepoint every hazard reaches a target through.
   * Nothing that moves (protected actor) is ever harmed.
   */
  public damageTarget(
    targetId: string,
    damageAmount: number,
    stormX: number,
    stormZ: number,
    stormRadius: number
  ): CollisionEvent | null {
    const entity = this.entities.get(targetId);
    if (!entity) return null;

    // First Law check: Protected actors cannot be damaged
    if (entity.isProtected) {
      return null;
    }

    // Proximity check
    const dx = entity.position.x - stormX;
    const dz = entity.position.z - stormZ;
    const distSq = dx * dx + dz * dz;
    const effectiveRadius = stormRadius + entity.radius;

    if (distSq > effectiveRadius * effectiveRadius) {
      return null;
    }

    // Apply damage
    const appliedDamage = Math.min(entity.health, Math.max(0, damageAmount));
    entity.health -= appliedDamage;

    // Multi-stage degradation
    if (entity.maxStages > 1) {
      const healthFraction = entity.health / entity.maxHealth;
      entity.stage = Math.max(1, Math.min(entity.maxStages, Math.ceil(healthFraction * entity.maxStages)));
    }

    const isDestroyed = entity.health <= 0;
    const scoreAwarded = isDestroyed ? 100 * (entity.maxStages || 1) : Math.round(appliedDamage * 10);

    return {
      targetId,
      damageInflicted: appliedDamage,
      remainingHealth: entity.health,
      currentStage: entity.stage,
      isDestroyed,
      scoreAwarded
    };
  }

  public getEntity(id: string): DamageableEntity | undefined {
    const e = this.entities.get(id);
    return e ? { ...e } : undefined;
  }

  public reset(): void {
    this.entities.clear();
  }
}
