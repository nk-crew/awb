/**
 * External dependencies
 */
import classnames from 'classnames/dedupe';

/**
 * WordPress dependencies
 */
const { useSelect } = wp.data;

const { Dropdown, Button, TabPanel, ColorPalette, GradientPicker } = wp.components;

const { __experimentalUseMultipleOriginColorsAndGradients: useMultipleOriginColorsAndGradients } =
  wp.blockEditor;

function useColors() {
  // New way to get colors and gradients.
  if (useMultipleOriginColorsAndGradients && useMultipleOriginColorsAndGradients()) {
    const colorsData = useMultipleOriginColorsAndGradients();
    return {
      colors: colorsData.colors,
      gradients: colorsData.gradients,
    };
  }

  // Old way.
  const { colors, gradients } = useSelect((select) => {
    const settings = select('core/block-editor').getSettings();

    const themeColors = [];
    const themeGradients = [];

    if (settings.colors && settings.colors.length) {
      themeColors.push({ name: 'Theme', colors: settings.colors });
    }
    if (settings.gradients && settings.gradients.length) {
      themeGradients.push({ name: 'Theme', gradients: settings.gradients });
    }

    return {
      colors: themeColors,
      gradients: themeGradients,
    };
  });

  return { colors, gradients };
}

/**
 * Component Class
 */
export default function ColorPicker(props) {
  const { label, value, onChange, alpha = false, gradient = false, afterDropdownContent } = props;
  const { colors, gradients } = useColors();

  const isGradient = value && value.match(/gradient/);
  const colorValue = isGradient ? undefined : value;
  const gradientValue = isGradient ? value : undefined;

  const tabs = {
    solid: (
      <ColorPalette
        colors={colors}
        value={colorValue}
        enableAlpha={alpha}
        onChange={(val) => {
          onChange(val);
        }}
        __experimentalHasMultipleOrigins
        __experimentalIsRenderedInSidebar
      />
    ),
    gradient: (
      <GradientPicker
        __nextHasNoMargin
        value={gradientValue}
        onChange={(val) => {
          onChange(val);
        }}
        gradients={gradients}
      />
    ),
  };

  return (
    <Dropdown
      className="awb-component-color-picker__dropdown"
      contentClassName="awb-component-color-picker__dropdown-content"
      popoverProps={{
        placement: 'left-start',
        offset: 36,
        shift: true,
      }}
      renderToggle={({ isOpen, onToggle }) => (
        <Button
          className={classnames(
            'awb-component-color-toggle',
            isOpen ? 'awb-component-color-toggle-active' : ''
          )}
          onClick={onToggle}
        >
          <span
            className="awb-component-color-toggle-indicator"
            style={{ background: value || '' }}
          />
          <span className="awb-component-color-toggle-label">{label}</span>
        </Button>
      )}
      renderContent={() => (
        <div className="awb-component-color-picker">
          {gradient ? (
            <TabPanel
              tabs={[
                {
                  name: 'solid',
                  title: 'Solid',
                },
                {
                  name: 'gradient',
                  title: 'Gradient',
                },
              ]}
              initialTabName={isGradient ? 'gradient' : 'solid'}
            >
              {(tab) => {
                return tabs[tab.name];
              }}
            </TabPanel>
          ) : (
            tabs.solid
          )}
          {afterDropdownContent || ''}
        </div>
      )}
    />
  );
}
