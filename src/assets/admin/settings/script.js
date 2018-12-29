const $ = window.jQuery;

const $everywhereCheckbox = $( '[name="awb_general[disable_parallax][everywhere]"], [name="awb_general[disable_videos][everywhere]"]' );

// disable checkboxes, when Everywhere checkbox checked.
function maybeDisableCheckboxes() {
    $everywhereCheckbox.each( function() {
        const $checkbox = $( this );
        const $anotherCheckboxes = $checkbox.closest( 'fieldset' ).find( '[type="checkbox"]' ).not( this );

        if ( $checkbox.is( ':checked' ) ) {
            $anotherCheckboxes.attr( 'disabled', 'disabled' );
        } else {
            $anotherCheckboxes.removeAttr( 'disabled' );
        }
    } );
}

maybeDisableCheckboxes();
$everywhereCheckbox.on( 'change', maybeDisableCheckboxes );
