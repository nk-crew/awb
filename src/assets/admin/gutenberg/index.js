import * as block from './block';

// Store.
import './store/index';

// Extensions.
import './extensions/block-styles';
import './extensions/ghostkit-grid';

const { registerBlockType } = wp.blocks;

// Previously we used the jQuery's 'ready' event, but it was conflicting with PublishPress Blocks plugin.
document.addEventListener('DOMContentLoaded', () => {
  registerBlockType(block.name, block.settings);
});
