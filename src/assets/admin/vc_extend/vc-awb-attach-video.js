/**
 * awb_attach_video VC control
 */
const { jQuery: $ } = window;

$('#vc_ui-panel-edit-element').on('click', '.awb_attach_video_btn', function (e) {
  e.preventDefault();
  const $this = $(this);
  const $input = $this.prev('.awb_attach_video').children('input');
  const $label = $this.next('.awb_attach_video_label');
  let frame = $this.data('wp-frame');

  // if selected - remove
  if ($this.hasClass('awb_attach_video_btn_selected')) {
    $input.val('');
    $label.html('');
    $this.val($this.attr('data-select-title'));
    $this.removeClass('awb_attach_video_btn_selected');
    return;
  }

  // If the media frame already exists, reopen it.
  if (frame) {
    frame.open();
    return;
  }

  if (!wp.media) {
    // eslint-disable-next-line
    console.error("Can't access wp.media object.");
    return;
  }

  // Create a new media frame
  frame = wp.media({
    title: 'Select or Upload Video',
    button: {
      text: 'Use this video',
    },
    multiple: false,
    library: {
      type: 'video',
    },
  });
  $this.data('wp-frame', frame);

  // When an video is selected in the media frame...
  frame.on('select', () => {
    // Get media attachment details from the frame state
    const attachment = frame.state().get('selection').first().toJSON();

    if (attachment) {
      $input.val(attachment.id);
      $label.html(attachment.filename);
      $this.val($this.attr('data-remove-title'));
      $this.addClass('awb_attach_video_btn_selected');
    }
  });

  // Finally, open the modal on click
  frame.open();
});
