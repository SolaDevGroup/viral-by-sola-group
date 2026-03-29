import * as React from "react";
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg";
import { memo } from "react";
import { useApp } from "@/contexts/AppContext";
import colors from "@/constants/colors";
const SvgComponent = (props) => {
  const { isDarkMode, accentColor } = useApp();
  const theme = isDarkMode ? colors.dark : colors.light;
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={28}
      height={28}
      fill="none"
      {...props}
    >
      <G clipPath="url(#a)">
        <Path
          fill={theme.tabInactive}
          d="M21 7h-2.333A4.665 4.665 0 0 0 14 2.335a4.665 4.665 0 0 0-4.667 4.667H7a2.34 2.34 0 0 0-2.333 2.333v14A2.34 2.34 0 0 0 7 25.667h14a2.34 2.34 0 0 0 2.333-2.333v-14A2.34 2.34 0 0 0 21 7.001Zm-7-2.333a2.34 2.34 0 0 1 2.333 2.334h-4.666A2.34 2.34 0 0 1 14 4.667Zm7 18.667H7v-14h2.333v2.333a1.17 1.17 0 0 0 1.167 1.167 1.17 1.17 0 0 0 1.167-1.167V9.334h4.666v2.333a1.17 1.17 0 0 0 1.167 1.167 1.17 1.17 0 0 0 1.167-1.167V9.334H21v14Z"
        />
      </G>
      <Defs>
        <ClipPath id="a">
          <Path fill={theme.tabInactive} d="M0 0h28v28H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

const ShopIconOutline = memo(SvgComponent);
export default ShopIconOutline;
