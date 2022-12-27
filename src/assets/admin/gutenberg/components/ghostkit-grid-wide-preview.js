import { throttle } from 'throttle-debounce';

import EditorStyles from './editor-styles';

const { Component, Fragment } = wp.element;

export default class GhostKitGridWidePreview extends Component {
  constructor(...args) {
    super(...args);

    this.state = {
      previewLeft: 0,
      previewRight: 0,
      previewAlign: false,
      previewSelector:
        this.props.name === 'ghostkit/grid'
          ? `[data-block="${this.props.clientId}"] > .ghostkit-grid > .awb-gutenberg-preview-block`
          : `[data-block="${this.props.clientId}"] > .awb-gutenberg-preview-block`,
    };

    this.updatePosition = throttle(300, this.updatePosition.bind(this));
  }

  componentDidMount() {
    window.addEventListener('resize', this.updatePosition);
    this.updatePosition();
  }

  componentDidUpdate() {
    const { awb_align: awbAlign } = this.props.attributes;

    const { previewAlign } = this.state;

    if (awbAlign && awbAlign === 'full' && previewAlign !== awbAlign) {
      this.updatePosition();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updatePosition);
  }

  updatePosition() {
    const { attributes } = this.props;

    const { previewLeft, previewRight, previewSelector } = this.state;

    const newState = {
      previewLeft: 0,
      previewRight: 0,
      previewAlign: attributes.awb_align,
    };

    if (attributes.awb_align === 'full') {
      const $layout = document.querySelector('.block-editor-block-list__layout');
      const $parentBlock = document.querySelector(
        '.block-editor-block-list__layout .wp-block:not([data-align])'
      );
      const $preview = document.querySelector(previewSelector);

      if ($layout && $parentBlock && $preview) {
        const layoutRect = $layout.getBoundingClientRect();
        const parentRect = $parentBlock.getBoundingClientRect();
        const previewRect = $preview.getBoundingClientRect();

        if (parentRect.left === previewRect.left - previewLeft) {
          newState.previewLeft = layoutRect.left - parentRect.left;
        }
        if (parentRect.right === previewRect.right + previewRight) {
          newState.previewRight = parentRect.right - layoutRect.right;
        }
      }
    }

    this.setState(newState);
  }

  render() {
    const { attributes } = this.props;

    const { previewLeft, previewRight, previewSelector } = this.state;

    let AWBpreviewStyles = '';

    if (attributes.awb_align && attributes.awb_align === 'full' && (previewLeft || previewRight)) {
      AWBpreviewStyles = `
        ${previewSelector} {
          margin-left: ${previewLeft}px;
          margin-right: ${previewRight}px;
        }
      `;
    }

    return (
      <Fragment>
        {AWBpreviewStyles ? <EditorStyles styles={AWBpreviewStyles} /> : ''}
        {this.props.children}
      </Fragment>
    );
  }
}
