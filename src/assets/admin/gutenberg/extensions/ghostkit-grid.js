/**
 * External Dependencies
 */
import classnames from 'classnames/dedupe';

/**
 * Internal Dependencies
 */
import { settings } from '../block';
import BlockSave from '../block-save';
import { BlockEdit, renderEditorPreview } from '../block-edit';
import GhostKitGridWidePreview from '../components/ghostkit-grid-wide-preview';

/**
 * WordPress Dependencies
 */
const AWBData = window.AWBGutenbergData;

const { addFilter } = wp.hooks;

const { PanelBody, ToolbarButton, BaseControl } = wp.components;

const { hasBlockSupport } = wp.blocks;

const { BlockAlignmentToolbar } = wp.blockEditor;

const validAlignments = ['full', 'wide'];

const { __ } = wp.i18n;

/**
 * Filters registered block settings, extending attributes to include `fullheight`.
 *
 * @param  {Object} blockSettings Original block settings
 * @return {Object}               Filtered block settings
 */
export function addAttribute(blockSettings) {
  if ('ghostkit/grid' === blockSettings.name || 'ghostkit/grid-column' === blockSettings.name) {
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
    if ('imageTag' === name && awbAttributes[name] && /^u003c/g.test(awbAttributes[name])) {
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
      <GhostKitGridWidePreview {...props}>{renderEditorPreview(awbProps)}</GhostKitGridWidePreview>
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
  if ('background' === props.attribute && hasBlockSupport(props.props.name, 'awb', false)) {
    const awbProps = prepareAWBprops(props.props);

    return (
      <PanelBody title={__('Background')} initialOpen={false}>
        <BlockEdit {...awbProps} inspectorControlsOnly />
        <PanelBody>
          <BaseControl label={__('Full width background')}>
            {AWBData.full_width_fallback ? (
              /* Fallback for align full */
              <ToolbarButton
                icon="align-full-width"
                label={__('Full Width')}
                isActive={'full' === awbProps.attributes.align}
                onClick={() =>
                  awbProps.setAttributes({
                    align: 'full' === awbProps.attributes.align ? '' : 'full',
                  })
                }
              />
            ) : (
              <BlockAlignmentToolbar
                controls={validAlignments}
                value={awbProps.attributes.align}
                onChange={(v) => awbProps.setAttributes({ align: v })}
              />
            )}
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

    if ('color' === awbProps.attributes.type && awbProps.attributes.color) {
      addBackground = true;
    }

    if (
      'image' === awbProps.attributes.type &&
      (awbProps.attributes.color || awbProps.attributes.imageTag)
    ) {
      addBackground = true;
    }

    if (
      'video' === awbProps.attributes.type &&
      (awbProps.attributes.color ||
        awbProps.attributes.videoMp4 ||
        awbProps.attributes.videoOgv ||
        awbProps.attributes.videoWebm ||
        awbProps.attributes.imageTag)
    ) {
      addBackground = true;
    }

    if (
      'yt_vm_video' === awbProps.attributes.type &&
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
