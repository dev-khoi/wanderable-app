import { type RefObject } from "react";
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  View,
} from "react-native";

import { wanderableTheme } from "@/constants/wanderableTheme";
import type { TripSummaryViewModel } from "@/lib/trips/types";

import { AddTripCard } from "./AddTripCard";
import { TripSwipeCard } from "./TripSwipeCard";

const { colors } = wanderableTheme;

type TripCardCarouselProps = {
  activeTripIndex: number;
  cardGap: number;
  cardWidth: number;
  carouselRef: RefObject<ScrollView | null>;
  onAddTripPress: () => void;
  onMomentumScrollEnd: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onTripPress: (tripId: string, index: number) => void;
  pageWidth: number;
  scale: number;
  sideInset: number;
  totalCardCount: number;
  trips: TripSummaryViewModel[];
};

export function TripCardCarousel({
  activeTripIndex,
  cardGap,
  cardWidth,
  carouselRef,
  onAddTripPress,
  onMomentumScrollEnd,
  onTripPress,
  pageWidth,
  scale,
  sideInset,
  totalCardCount,
  trips,
}: TripCardCarouselProps) {
  const s = (value: number) => value * scale;

  return (
    <View>
      <ScrollView
        ref={carouselRef}
        horizontal
        decelerationRate="fast"
        disableIntervalMomentum
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        snapToInterval={pageWidth}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingLeft: sideInset,
          paddingRight: sideInset - cardGap,
        }}
        onMomentumScrollEnd={onMomentumScrollEnd}>
        {trips.map((trip, index) => (
          <TripSwipeCard
            key={trip.id}
            active={index === activeTripIndex}
            cardWidth={cardWidth}
            isFirst={index === 0}
            scale={scale}
            spacing={cardGap}
            trip={trip}
            onPress={() => onTripPress(trip.id, index)}
          />
        ))}
        <AddTripCard
          active={activeTripIndex === trips.length}
          cardWidth={cardWidth}
          isFirst={trips.length === 0}
          scale={scale}
          spacing={cardGap}
          onPress={onAddTripPress}
        />
      </ScrollView>

      <View
        className="self-center flex-row items-center justify-center"
        style={{ marginTop: s(14), gap: s(8) }}>
        {Array.from({ length: totalCardCount }).map((_, index) => (
          <View
            key={index}
            style={{
              width: index === activeTripIndex ? s(20) : s(6),
              height: s(6),
              borderRadius: s(999),
              backgroundColor:
                index === activeTripIndex
                  ? colors.brand.secondary
                  : colors.surface.avatarFill,
            }}
          />
        ))}
      </View>
    </View>
  );
}
