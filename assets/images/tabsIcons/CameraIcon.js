import * as React from "react";
import Svg, {
  G,
  Path,
  Defs,
  ClipPath,
  LinearGradient,
  Stop,
} from "react-native-svg";
import { useApp } from "@/contexts/AppContext";

import colors from "@/constants/colors";
import { memo } from "react";

const SvgComponent = ({ focused }) => {
  const { isDarkMode, accentColor } = useApp();
  const theme = isDarkMode ? colors.dark : colors.light;
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
      <Defs>
        <LinearGradient id="cameraGradient" x1="0" y1="0" x2="1" y2="1">
          <Stop stopColor="#37B874" />
          <Stop offset="1" stopColor="#12FFAA" />
        </LinearGradient>

        <ClipPath id="clip">
          <Path d="M0 0h28v28H0z" />
        </ClipPath>
      </Defs>

      <G clipPath="url(#clip)">
        <Path
          d="M23.333 4.667h-3.698L17.5 2.334h-7L8.365 4.667H4.667a2.34 2.34 0 0 0-2.334 2.334v14a2.34 2.34 0 0 0 2.334 2.333h18.666a2.34 2.34 0 0 0 2.334-2.333V7a2.34 2.34 0 0 0-2.334-2.334Zm0 16.334H4.667V7h4.725l2.135-2.334h4.946l2.135 2.334h4.725v14ZM14 8.167a5.835 5.835 0 0 0-5.833 5.834A5.835 5.835 0 0 0 14 19.834a5.835 5.835 0 0 0 5.833-5.833A5.836 5.836 0 0 0 14 8.167Zm0 9.334a3.51 3.51 0 0 1-3.5-3.5 3.51 3.51 0 0 1 3.5-3.5 3.51 3.51 0 0 1 3.5 3.5 3.51 3.51 0 0 1-3.5 3.5Z"
          fill={focused ? "url(#cameraGradient)" : theme.tabInactive}
          fillOpacity={1}
        />
      </G>
    </Svg>
  );
};

const CameraIcon = memo(SvgComponent);
export default CameraIcon;
