import $ from 'jquery';
import { serverHost } from './../../config/config';

window.jQuery = $;
window.$ = $;

jQuery(document).ready(function ($) {
    $("#issueForm").submit(function (event) {
        event.preventDefault();
        $('#submit').prop('disabled', true);
        var messageDiv = jQuery('#message');
        var $form = $(this);
        var recipientAddress = $form.find("input[name='recipientAddress']").val();

        if (recipientAddress.length !== 42) {
            messageDiv.removeClass().addClass('alert').addClass('alert-danger');
            messageDiv.html('Wrong address.');

            return;
        }

        $.ajax({
            type: "POST",
            url: serverHost + "/issue-demo-token",
            dataType: 'text',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({ recipientAddress: recipientAddress }),
            beforeSend: function () {
                messageDiv.removeClass().addClass('alert').addClass('alert-secondary');
                messageDiv.html('Processing. Please wait ...');
            },
            success: function (data, textStatus, jqXHR) {
                if (jqXHR.status == 200) {
                    messageDiv.removeClass().addClass('alert').addClass('alert-success');
                    messageDiv.html('Done. Thank you.');
                }
                else {
                    messageDiv.removeClass().addClass('alert').addClass('alert-danger');
                    messageDiv.html('Something went wrong.');
                }

                return false;
            },
            error: function () {
                messageDiv.removeClass().addClass('alert').addClass('alert-danger');
                messageDiv.html('There were some errors. Try later.');
            }
        });
    });
});
