import * as React from "react";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
import { memo } from "react";
import { useApp } from "@/contexts/AppContext";
import { generateAccentColor } from "@/constants/colorGenerator";
import colors from "@/constants/colors";

const SvgComponent = ({ focused }) => {
  const { isDarkMode, accentColor } = useApp();
  const theme = isDarkMode ? colors.dark : colors.light;
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
      {focused && (
        <Defs>
          <LinearGradient
            id="homeGradient"
            x1={4}
            y1={4}
            x2={14.625}
            y2={24.454}
            gradientUnits="userSpaceOnUse"
          >
            <Stop stopColor={accentColor} />
            <Stop offset={1} stopColor={generateAccentColor(accentColor)} />
          </LinearGradient>
        </Defs>
      )}

      <Path
        d="m22.8 9.636-7.143-5.1a2.83 2.83 0 0 0-3.314 0L5.2 9.636c-.757.543-1.2 1.4-1.2 2.328V23.35c0 .786.643 1.429 1.429 1.429h5.714v-8.572h5.714v8.572h5.714c.786 0 1.429-.643 1.429-1.429V11.964c0-.928-.443-1.785-1.2-2.328Z"
        fill={focused ? "url(#homeGradient)" : theme.tabInactive}
      />
    </Svg>
  );
};

const HomeIcon = memo(SvgComponent);
export default HomeIcon;
