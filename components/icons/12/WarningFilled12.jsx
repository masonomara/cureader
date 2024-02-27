import * as React from "react";
import Svg, { Path } from "react-native-svg";
const WarningFilled12 = ({ color, props }) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={10}
    height={10}
    fill="none"
    {...props}
  >
    <Path
      fill={color}
      d="M4.21345 0.458495C4.29215 0.319329 4.4064 0.203555 4.5445 0.123C4.6826 0.0424459 4.83962 0 4.9995 0C5.15938 0 5.3164 0.0424459 5.4545 0.123C5.5926 0.203555 5.70685 0.319329 5.78555 0.458495L9.87783 7.62798C10.2259 8.23803 9.78883 9.00008 9.09078 9.00008H0.90922C0.211172 9.00008 -0.225857 8.23803 0.122166 7.62798L4.21345 0.458495ZM4.49947 3.4997V4.49977C4.49947 4.63239 4.55215 4.75957 4.64592 4.85335C4.7397 4.94712 4.86688 4.9998 4.9995 4.9998C5.13212 4.9998 5.2593 4.94712 5.35308 4.85335C5.44685 4.75957 5.49953 4.63239 5.49953 4.49977V3.4997C5.49953 3.36708 5.44685 3.2399 5.35308 3.14612C5.2593 3.05235 5.13212 2.99967 4.9995 2.99967C4.86688 2.99967 4.7397 3.05235 4.64592 3.14612C4.55215 3.2399 4.49947 3.36708 4.49947 3.4997ZM4.9995 5.74986C4.80057 5.74986 4.6098 5.82888 4.46913 5.96954C4.32847 6.1102 4.24945 6.30098 4.24945 6.49991C4.24945 6.69883 4.32847 6.88961 4.46913 7.03027C4.6098 7.17093 4.80057 7.24996 4.9995 7.24996C5.19843 7.24996 5.3892 7.17093 5.52987 7.03027C5.67053 6.88961 5.74955 6.69883 5.74955 6.49991C5.74955 6.30098 5.67053 6.1102 5.52987 5.96954C5.3892 5.82888 5.19843 5.74986 4.9995 5.74986Z"
    />
  </Svg>
);
export default WarningFilled12;