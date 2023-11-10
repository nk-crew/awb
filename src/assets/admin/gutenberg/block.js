/**
 * Internal Dependencies
 */
import metadata from './block.json';
import iconAWB from './icons/awb.svg';
import { BlockEdit } from './block-edit';
import BlockSave from './block-save';
import deprecated from './deprecated';

export const { name } = metadata;

export const settings = {
  icon: iconAWB,
  edit: BlockEdit,
  save: BlockSave,
  deprecated,
};
