// components/Wave.tsx
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";

export function Wave({ style }: { style?: any }) {
  return (
    <Svg width={260} height={120} viewBox="0 0 200 150" style={style}>
      <Defs>
        <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#0E7C66" />
          <Stop offset="50%" stopColor="#19E6A0" />
          <Stop offset="100%" stopColor="#0E7C66" />
        </LinearGradient>
      </Defs>

      <Path
        d="
          M 10 30
          C 60 10, 120 10, 160 60 
          S 220 110, 260 60
         
        "
        stroke="url(#grad)"
        strokeWidth={28}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}
