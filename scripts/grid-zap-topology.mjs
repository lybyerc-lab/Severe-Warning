export function selectGridZapTopology(poles, {
  stormX,
  stormZ,
  acquisitionRadius,
  maxHopDistance,
  maxNodes,
}) {
  const limit = Math.max(1, Math.floor(maxNodes));
  const seed = poles
    .map((pole) => ({ pole, distance: Math.hypot(pole.x - stormX, pole.z - stormZ) }))
    .filter((entry) => entry.distance <= acquisitionRadius)
    .sort((left, right) => left.distance - right.distance
      || left.pole.networkGroup.localeCompare(right.pole.networkGroup)
      || left.pole.networkIndex - right.pole.networkIndex)[0]?.pole;

  if (!seed) return [];

  const route = poles
    .filter((pole) => pole.networkGroup === seed.networkGroup)
    .slice()
    .sort((left, right) => left.networkIndex - right.networkIndex);

  function walk(direction) {
    const selected = [seed];
    const selectedNodes = new Set([`${seed.networkGroup}:${seed.networkIndex}`]);
    let previous = seed;
    while (selected.length < limit) {
      const nextIndex = previous.networkIndex + direction;
      const next = route.find((pole) => pole.networkIndex === nextIndex);
      if (!next) break;
      const nodeId = `${next.networkGroup}:${next.networkIndex}`;
      const hopDistance = Math.hypot(next.x - previous.x, next.z - previous.z);
      if (selectedNodes.has(nodeId) || hopDistance > maxHopDistance) break;
      selectedNodes.add(nodeId);
      selected.push(next);
      previous = next;
    }
    return selected;
  }

  const descending = walk(-1);
  const ascending = walk(1);
  return (ascending.length >= descending.length ? ascending : descending).slice(0, limit);
}

export const gridZapTopologyRuntime = selectGridZapTopology.toString();
