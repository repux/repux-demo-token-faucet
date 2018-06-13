import jQuery from 'jquery';
import { serverHost } from './../../config/config';

(function($) {
    $('#issueForm').submit(function (event) {
        event.preventDefault();
        var submitButton = $('#submit');
        var messageDiv = jQuery('#message');
        var $form = $(this);
        var recipientAddress = $form.find('input[name="recipientAddress"]').val();

        if (recipientAddress.length !== 42) {
            messageDiv.removeClass().addClass('alert').addClass('alert-danger');
            messageDiv.html('Wrong address.');

            return;
        }

        $.ajax({
            type: 'POST',
            url: serverHost + '/issue-demo-token',
            dataType: 'text',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify({ recipientAddress: recipientAddress }),
            beforeSend: function () {
                submitButton.prop('disabled', true);
                messageDiv.removeClass().addClass('alert alert-secondary');
                messageDiv.html('Processing. Please wait ...');
            },
            success: function (data, textStatus, jqXHR) {
                if (jqXHR.status == 200) {
                    messageDiv.removeClass().addClass('alert alert-success');
                    messageDiv.html('Done. Thank you.');
                }
                else {
                    messageDiv.removeClass().addClass('alert alert-danger');
                    messageDiv.html('Something went wrong.' + data);
                }

                return false;
            },
            complete: function() {
                submitButton.prop('disabled', false);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                messageDiv.removeClass().addClass('alert alert-danger');
                messageDiv.html('There were some errors.' + jqXHR.responseText || '');
            }
        });
    });
})(jQuery);