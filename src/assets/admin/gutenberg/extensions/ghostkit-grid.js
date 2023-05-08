/**
 * External Dependencies
 */
import classnames from 'classnames/dedupe';

/**
 * Internal Dependencies
 */
import { settings } from '../block';
import BlockSave from '../block-save';
import { BlockEdit, RenderEditorPreview } from '../block-edit';
import GhostKitGridWidePreview from '../components/ghostkit-grid-wide-preview';

/**
 * WordPress Dependencies
 */
const { AWBGutenbergData } = window;

const { addFilter } = wp.hooks;

const { PanelBody, ToolbarGroup, ToolbarButton, BaseControl } = wp.components;

const { hasBlockSupport } = wp.blocks;

const { __ } = wp.i18n;

/**
 * Filters registered block settings, extending attributes to include `fullheight`.
 *
 * @param  {Object} blockSettings Original block settings
 * @return {Object}               Filtered block settings
 */
export function addAttribute(blockSettings) {
  if (blockSettings.name === 'ghostkit/grid' || blockSettings.name === 'ghostkit/grid-column') {
    blockSettings.supports.awb = true;
  }

  let allow = false;

  if (hasBlockSupport(blockSettings, 'awb', false)) {
    allow = true;
  }

  if (allow) {
    Object.keys(settings.attributes).forEach((name) => {
      blockSettings.attributes[`awb_${name}`] = settings.attributes[name];
    });
    blockSettings.attributes.awb_align = {
      type: 'string',
      default: '',
    };
  }

  return blockSettings;
}

function prepareAWBprops(props) {
  const awbAttributes = {};
  Object.keys(settings.attributes).forEach((name) => {
    awbAttributes[name] = props.attributes[`awb_${name}`];

    // inside exported xml file almost all symbols are escaped.
    if (name === 'imageTag' && awbAttributes[name] && /^u003c/g.test(awbAttributes[name])) {
      awbAttributes[name] = awbAttributes[name]
        .replace(/u003c/g, '<')
        .replace(/u003e/g, '>')
        .replace(/u0022/g, '"')
        .replace(/u0026/g, '&');
    }
  });
  awbAttributes.align = props.attributes.awb_align;

  return {
    name: 'nk/awb',
    clientId: props.clientId,
    setAttributes(data) {
      const newData = {};

      Object.keys(data).forEach((name) => {
        newData[`awb_${name}`] = data[name];
      });

      props.setAttributes(newData);
    },
    attributes: awbAttributes,
    className: '',
    innerBlocks: [],
  };
}

/**
 * Override the default edit UI to include background preview.
 *
 * @param {Object} background background JSX.
 * @param {Object} props additional props.
 *
 * @return {Object} Control.
 */
function addEditorBackground(background, props) {
  if (hasBlockSupport(props.name, 'awb', false)) {
    const awbProps = prepareAWBprops(props);

    return (
      <GhostKitGridWidePreview {...props}>
        <RenderEditorPreview {...awbProps} />
      </GhostKitGridWidePreview>
    );
  }

  return background;
}

/**
 * Override background control to add AWB settings
 *
 * @param {Object} Control JSX control.
 * @param {Object} props additional props.
 *
 * @return {Object} Control.
 */
function addBackgroundControls(Control, props) {
  if (props.attribute === 'background' && hasBlockSupport(props.props.name, 'awb', false)) {
    const awbProps = prepareAWBprops(props.props);

    return (
      <PanelBody title={__('Background')} initialOpen={false}>
        <BlockEdit {...awbProps} inspectorControlsOnly />
        <PanelBody>
          <BaseControl label={__('Full width background')}>
            <ToolbarGroup>
              {AWBGutenbergData.full_width_fallback ? (
                /* Fallback for align full */
                <ToolbarButton
                  icon="align-full-width"
                  label={__('Full Width')}
                  isActive={awbProps.attributes.align === 'full'}
                  onClick={() =>
                    awbProps.setAttributes({
                      align: awbProps.attributes.align === 'full' ? '' : 'full',
                    })
                  }
                />
              ) : (
                <>
                  {/*
                   * We can't use the BlockAlignmentToolbar just because our plugin is used
                   * inside the Ghost Kit columns and `BlockAlignmentToolbar` will not display
                   * full and wide alignment in this case */}
                  <ToolbarButton
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M5 15h14V9H5v6zm0 4.8h14v-1.5H5v1.5zM5 4.2v1.5h14V4.2H5z" />
                      </svg>
                    }
                    label={__('None')}
                    onClick={() =>
                      awbProps.setAttributes({
                        align: '',
                      })
                    }
                  />
                  <ToolbarButton
                    icon="align-full-width"
                    label={__('Full width')}
                    isActive={awbProps.attributes.align === 'full'}
                    onClick={() =>
                      awbProps.setAttributes({
                        align: awbProps.attributes.align === 'full' ? '' : 'full',
                      })
                    }
                  />
                  <ToolbarButton
                    icon="align-wide"
                    label={__('Wide width')}
                    isActive={awbProps.attributes.align === 'wide'}
                    onClick={() =>
                      awbProps.setAttributes({
                        align: awbProps.attributes.align === 'wide' ? '' : 'wide',
                      })
                    }
                  />
                </>
              )}
            </ToolbarGroup>
          </BaseControl>
        </PanelBody>
      </PanelBody>
    );
  }

  return Control;
}

/**
 * Add SVG gradient for FontAwesome
 *
 * @param {Object} background Background jsx.
 * @param {Object} props  Block properties.
 *
 * @return {Object} Filtered props applied to save element.
 */
function addSaveBackground(background, props) {
  if (hasBlockSupport(props.name, 'awb', false)) {
    const awbProps = prepareAWBprops({
      attributes: props.attributes,
      saveAttributes: () => {},
    });
    let addBackground = false;

    if (awbProps.attributes.type === 'color' && awbProps.attributes.color) {
      addBackground = true;
    }

    if (
      awbProps.attributes.type === 'image' &&
      (awbProps.attributes.color || awbProps.attributes.imageTag)
    ) {
      addBackground = true;
    }

    if (
      awbProps.attributes.type === 'video' &&
      (awbProps.attributes.color ||
        awbProps.attributes.videoMp4 ||
        awbProps.attributes.videoOgv ||
        awbProps.attributes.videoWebm ||
        awbProps.attributes.imageTag)
    ) {
      addBackground = true;
    }

    if (
      awbProps.attributes.type === 'yt_vm_video' &&
      (awbProps.attributes.color || awbProps.attributes.video || awbProps.attributes.imageTag)
    ) {
      addBackground = true;
    }

    if (addBackground) {
      const className = classnames(
        'nk-awb',
        awbProps.attributes.align ? `align${awbProps.attributes.align}` : ''
      );
      return (
        <div className={className}>
          <BlockSave {...awbProps} backgroundHTMLOnly />
        </div>
      );
    }

    return null;
  }

  return background;
}

addFilter('blocks.registerBlockType', 'ghostkit/grid/awb/additional-attributes', addAttribute);
addFilter(
  'ghostkit.editor.controls',
  'ghostkit/grid/awb/addBackgroundControls',
  addBackgroundControls
);
addFilter(
  'ghostkit.editor.grid.background',
  'ghostkit/grid/awb/addEditorBackground',
  addEditorBackground
);
addFilter(
  'ghostkit.editor.grid-column.background',
  'ghostkit/grid-column/awb/addEditorBackground',
  addEditorBackground
);
addFilter(
  'ghostkit.blocks.grid.background',
  'ghostkit/grid/awb/addSaveBackground',
  addSaveBackground
);
addFilter(
  'ghostkit.blocks.grid-column.background',
  'ghostkit/grid-column/awb/addSaveBackground',
  addSaveBackground
);
