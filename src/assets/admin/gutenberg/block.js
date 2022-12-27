/**
 * Internal Dependencies
 */
import metadata from './block.json';
import iconAWB from './icons/awb.svg';
import { BlockEdit } from './block-edit';
import BlockSave from './block-save';

const validAlignments = ['full', 'wide'];

export const { name } = metadata;

export const settings = {
  ...metadata,
  icon: iconAWB,
  ghostkit: {
    supports: {
      spacings: true,
      display: true,
      customCSS: true,
    },
  },
  getEditWrapperProps(attributes) {
    const { align } = attributes;
    if (validAlignments.indexOf(align) !== -1) {
      return { 'data-align': align };
    }
    return {};
  },
  edit: BlockEdit,
  save: BlockSave,
};
