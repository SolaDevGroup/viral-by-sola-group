import * as React from "react";
import Svg, {
  G,
  Path,
  Defs,
  ClipPath,
  LinearGradient,
  Stop,
  Circle,
} from "react-native-svg";
import { memo } from "react";
import colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { generateAccentColor } from "@/constants/colorGenerator";

const SvgComponent = ({ focused }) => {
  const { isDarkMode, accentColor } = useApp();
  const theme = isDarkMode ? colors.dark : colors.light;
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
      <Defs>
        <LinearGradient id="searchGradient" x1="0" y1="0" x2="1" y2="1">
          <Stop stopColor={accentColor} />
          <Stop offset="1" stopColor={generateAccentColor(accentColor)} />
        </LinearGradient>

        <ClipPath id="clip">
          <Path d="M0 0h28v28H0z" />
        </ClipPath>
      </Defs>
      {focused && <Circle cx="11" cy="11" r="8" fill="url(#searchGradient)" />}

      <G clipPath="url(#clip)">
        <Path
          d="M18.083 16.334h-.921l-.327-.315a7.584 7.584 0 0 0 1.727-6.23c-.549-3.243-3.255-5.833-6.522-6.23a7.589 7.589 0 0 0-8.482 8.482c.397 3.266 2.987 5.973 6.23 6.521a7.584 7.584 0 0 0 6.23-1.726l.315.326v.922l4.959 4.958c.478.479 1.26.479 1.738 0a1.232 1.232 0 0 0 0-1.738l-4.947-4.97Zm-7 0a5.243 5.243 0 0 1-5.25-5.25 5.243 5.243 0 0 1 5.25-5.25 5.243 5.243 0 0 1 5.25 5.25 5.243 5.243 0 0 1-5.25 5.25Z"
          fill={focused ? "url(#searchGradient)" : theme.tabInactive}
          fillOpacity={1}
        />
      </G>
    </Svg>
  );
};

const SearchIcon = memo(SvgComponent);
export default SearchIcon;
