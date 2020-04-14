import { useTheme } from '@nebula.js/ui/theme';

export default function useActionState(item) {
  const theme = useTheme();
  const disabled = typeof item.enabled === 'function' ? !item.enabled() : !!item.disabled;
  const hasSvgIconShape = typeof item.getSvgIconShape === 'function';

  return {
    hidden: item.hidden === true,
    disabled,
    style: {
      backgroundColor: item.active ? theme.palette.btn.active : undefined,
    },
    hasSvgIconShape,
  };
}
