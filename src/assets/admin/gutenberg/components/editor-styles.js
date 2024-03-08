/**
 * External dependencies
 */
const { compact, map } = window.lodash;

/**
 * WordPress dependencies
 */
const { useMemo } = wp.element;

const { transformStyles } = wp.blockEditor;

const EDITOR_STYLES_SELECTOR = '.editor-styles-wrapper';

export default function EditorStyles(props) {
  const { styles } = props;

  const renderStyles = useMemo(() => {
    const transformedStyles = transformStyles(
      [
        {
          css: styles,
        },
      ],
      EDITOR_STYLES_SELECTOR
    );

    let resultStyles = '';

    map(compact(transformedStyles), (updatedCSS) => {
      resultStyles += updatedCSS;
    });

    return resultStyles;
  }, [styles]);

  return (
    renderStyles && (
      <style
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: renderStyles,
        }}
      />
    )
  );
}
