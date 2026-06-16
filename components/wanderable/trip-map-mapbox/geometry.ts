import type { RouteSegment, TripDay, TripNode } from "@/lib/trips/types";

export function buildTripCenterCoordinate(
  nodes: TripNode[],
): [number, number] {
  if (nodes.length === 0) {
    return [0, 20];
  }

  const [totalLongitude, totalLatitude] = nodes.reduce(
    ([longitude, latitude], node) => [
      longitude + node.coordinate[0],
      latitude + node.coordinate[1],
    ],
    [0, 0],
  );

  return [totalLongitude / nodes.length, totalLatitude / nodes.length];
}

export function buildRouteLines(
  routeSegments: RouteSegment[],
  nodeById: Map<string, TripNode>,
): [number, number][][] {
  const lines: [number, number][][] = [];
  let currentLine: [number, number][] = [];
  let previousToNodeId: string | null = null;

  for (const segment of routeSegments) {
    const fromCoordinate = nodeById.get(segment.fromNodeId)?.coordinate;
    const toCoordinate = nodeById.get(segment.toNodeId)?.coordinate;

    if (!fromCoordinate || !toCoordinate) {
      continue;
    }

    if (previousToNodeId !== segment.fromNodeId && currentLine.length >= 2) {
      lines.push(currentLine);
      currentLine = [];
    }

    if (currentLine.length === 0) {
      currentLine = [fromCoordinate, toCoordinate];
    } else {
      currentLine.push(toCoordinate);
    }

    previousToNodeId = segment.toNodeId;
  }

  if (currentLine.length >= 2) {
    lines.push(currentLine);
  }

  return lines;
}

export function buildRouteShape(routeLines: [number, number][][]) {
  if (routeLines.length <= 1) {
    return {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: routeLines[0] ?? [],
      },
    } as const;
  }

  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "MultiLineString",
      coordinates: routeLines,
    },
  } as const;
}

export function buildDayNumberByDayId(tripDays: TripDay[]) {
  return new Map(tripDays.map((day, index) => [day.id, index + 1]));
}
