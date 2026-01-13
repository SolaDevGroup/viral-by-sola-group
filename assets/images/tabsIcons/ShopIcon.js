import * as React from "react";
import Svg, {
  SvgProps,
  Path,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";
import { memo } from "react";
import { useApp } from "@/contexts/AppContext";
import { generateAccentColor } from "@/constants/colorGenerator";
const SvgComponent = ({ focused }) => {
  const { accentColor } = useApp();
  return (
    <Svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none">
      <Path
        fill="url(#a)"
        d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2Zm-8 4c0 .55-.45 1-1 1s-1-.45-1-1V8h2v2Zm2-6c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2Zm4 6c0 .55-.45 1-1 1s-1-.45-1-1V8h2v2Z"
      />
      <Defs>
        <LinearGradient
          id="a"
          x1={4}
          x2={15.236}
          y1={2}
          y2={19.977}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor={accentColor} />
          <Stop offset={1} stopColor={generateAccentColor(accentColor)} />
        </LinearGradient>
      </Defs>
    </Svg>
  );
};

const ShopIcon = memo(SvgComponent);
export default ShopIcon;
