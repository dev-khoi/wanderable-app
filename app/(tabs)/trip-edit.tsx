import { type Href, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ActionButton,
  EditableTitleCard,
  EditHeader,
  EditSheet,
  HighlightCard,
  MetaPill,
  RouteConnector,
} from "@/components/trip-edit";
import { wanderableTheme } from "@/constants/wanderableTheme";
import {
  useTripViewData,
  useUpdateRouteSegmentTransport,
  useUpdateTripTitle,
} from "@/lib/trips/hooks";
import { type TransportMode } from "@/lib/trips/types";

const { colors } = wanderableTheme;

export default function TripEditScreen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const tripQuery = useTripViewData(tripId);
  const trip = tripQuery.data;
  const scale = Math.min(width / 375, height / 812);
  const s = (value: number) => value * scale;
  const [draftTitle, setDraftTitle] = useState("");
  const updateTitleMutation = useUpdateTripTitle(tripId);
  const updateTransportMutation = useUpdateRouteSegmentTransport(tripId);

  useEffect(() => {
    setDraftTitle(trip?.title ?? "");
  }, [trip?.title]);

  if (tripQuery.isLoading) {
    return <TripEditStatus scale={scale} title="Loading trip" body="Pulling the editable trip from Supabase." />;
  }

  if (tripQuery.error || !trip) {
    return <TripEditStatus scale={scale} title="Trip unavailable" body="We couldn't load this trip for editing right now." />;
  }

  const addHighlight = () => {};

  const updateTransport = (segmentId: string, transport: TransportMode) => {
    updateTransportMutation.mutate({ segmentId, transport });
  };

  return (
    <View className="flex-1" style={{ backgroundColor: "#D6D3DB" }}>
      <View
        className="absolute left-0 right-0 top-0"
        style={{ height: insets.top + s(228), backgroundColor: "#D1CED6" }}>
        <Image
          source={trip.coverUri ? { uri: trip.coverUri } : undefined}
          resizeMode="cover"
          style={{ width: "100%", height: "100%" }}
        />
        <View
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(28, 18, 67, 0.14)" }}
        />
      </View>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: s(32), minHeight: height }}>
        <EditHeader
          title="edit"
          top={insets.top}
          onBack={() =>
            router.replace({ pathname: "/trip-view", params: { tripId: trip.id } })
          }
          floating={false}
          scale={scale}
        />
        <View style={{ height: s(86) }} />
        <EditSheet
          style={{
            minHeight: height - insets.top - s(88),
            paddingHorizontal: s(20),
            paddingTop: s(26),
            paddingBottom: s(32),
          }}>
          <EditableTitleCard
            value={draftTitle}
            scale={scale}
            onChangeText={setDraftTitle}
            onEndEditing={() => {
              const nextTitle = draftTitle.trim();

              if (!nextTitle || nextTitle === trip.title) {
                setDraftTitle(trip.title);
                return;
              }

              updateTitleMutation.mutate({ nextTitle, tripId: trip.id });
            }}
          />

          <View className="mt-4 flex-row flex-wrap" style={{ gap: s(10) }}>
            <MetaPill label="Dates" value={trip.dateRange} scale={scale} />
            <MetaPill label="Length" value={trip.durationLabel} scale={scale} />
            <MetaPill
              label="Distance"
              value={trip.distanceLabel}
              scale={scale}
            />
          </View>

          <View style={{ marginTop: s(18), gap: s(4) }}>
            {trip.nodes.map((node) => {
              const day = trip.days.find((item) => item.id === node.dayId);
              const nextSegment = trip.routeSegments.find(
                (segment) => segment.fromNodeId === node.id,
              );

              return (
                <View key={node.id}>
                  <HighlightCard
                    coverUri={node.media[0]?.uri ?? null}
                    dateLabel={day ? `${day.label} - ${day.date}` : undefined}
                    locationName={node.locationName}
                    timeRange={node.timeRange}
                    title={node.title}
                    scale={scale}
                    onPress={() =>
                      router.push({
                        pathname: "/highlight-edit",
                        params: { nodeId: node.id, tripId: trip.id },
                      })
                    }
                  />
                  {nextSegment ? (
                    <RouteConnector
                      transport={nextSegment.transport}
                      onChangeTransport={(transport) =>
                        updateTransport(nextSegment.id, transport)
                      }
                      scale={scale}
                    />
                  ) : null}
                </View>
              );
            })}
          </View>

          <View style={{ marginTop: s(18) }}>
            <ActionButton
              title="+ Add highlight"
              onPress={addHighlight}
              disabled
              scale={scale}
            />
          </View>
        </EditSheet>
      </ScrollView>
    </View>
  );
}

function TripEditStatus({ body, scale, title }: { body: string; scale: number; title: string }) {
  const s = (value: number) => value * scale;

  return (
    <View className="flex-1 items-center justify-center px-8" style={{ backgroundColor: colors.background.surface }}>
      {title === "Loading trip" ? <ActivityIndicator color={colors.brand.primary} /> : null}
      <Text className="mt-4 font-extrabold" style={{ fontSize: s(22), color: colors.text.primary }}>
        {title}
      </Text>
      <Text className="mt-3 text-center font-semibold" style={{ fontSize: s(13), lineHeight: s(19), color: colors.text.muted }}>
        {body}
      </Text>
    </View>
  );
}
