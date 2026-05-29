import Svg, { Path, type SvgProps } from 'react-native-svg';

type ArsenalIconProps = SvgProps & {
  color?: string;
  size?: number | string;
};

export function ArsenalIcon({
  color = 'currentColor',
  size = 24,
  ...props
}: ArsenalIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...props}>
      <Path
        d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6m-3 3l4 4m-1 1l2-2M14.5 6.5L18 3h3v3l-3.5 3.5M5 14l4 4m-2-1l-3 3m-1-1l2 2"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </Svg>
  );
}
