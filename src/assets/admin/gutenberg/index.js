import * as block from './block';
import './block-styles';
import './ghostkit-grid-extension';

const { registerBlockType } = wp.blocks;

// Previously we used the jQuery's 'ready' event, but it was conflicting with PublishPress Blocks plugin.
document.addEventListener('DOMContentLoaded', () => {
  registerBlockType(block.name, block.settings);
});
