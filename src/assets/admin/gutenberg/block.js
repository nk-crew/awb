/**
 * Internal Dependencies
 */
import metadata from './block.json';
import { BlockEdit } from './block-edit';
import BlockSave from './block-save';
import deprecated from './deprecated';

export const { name } = metadata;

function AwbIcon() {
  return (
    <img src={window.AWBGutenbergData.icon_url} alt="" width={24} height={24} loading="lazy" />
  );
}

export const settings = {
  icon: AwbIcon,
  edit: BlockEdit,
  save: BlockSave,
  deprecated,
};
