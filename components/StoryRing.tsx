import React from "react";
import Svg, { Circle } from "react-native-svg";

type Props = {
  size?: number;
  strokeWidth?: number;
  postCount?: number;
  isViewed?: boolean;
  colors?: string[];
};

const StoryRing = ({
  size = 64,
  strokeWidth = 3,
  postCount = 1,
  isViewed = false,
  colors = [],
}: Props) => {
  const segments = isViewed ? 1 : Math.max(1, Number(postCount) || 1);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Gap only if multiple segments
  const gapAngle = segments === 1 ? 0 : 15;
  const totalGapAngle = gapAngle * segments;
  const segmentAngle = (360 - totalGapAngle) / segments;

  const segmentLength = (segmentAngle / 360) * circumference;

  const activeColors = colors.length > 0 ? colors : ["#12FFAA"];

  return (
    <Svg width={size} height={size} style={{ position: "absolute" }}>
      {Array.from({ length: segments }).map((_, index) => {
        const rotateAngle = -90 + index * (360 / segments);
        const strokeColor = isViewed
          ? "#FFFFFF29"
          : activeColors[index % activeColors.length];

        return (
          <Circle
            key={index}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${segmentLength} ${
              circumference - segmentLength
            }`}
            strokeLinecap="round"
            rotation={rotateAngle}
            origin={`${size / 2}, ${size / 2}`}
          />
        );
      })}
    </Svg>
  );
};

export default StoryRing;
