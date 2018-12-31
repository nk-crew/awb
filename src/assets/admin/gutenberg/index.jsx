import './editor.scss';

import * as block from './block.jsx';
import './block-spacings.jsx';
import './ghostkit-grid-extension.jsx';

const {
    registerBlockType,
} = wp.blocks;

jQuery( () => {
    registerBlockType( block.name, block.settings );
} );
