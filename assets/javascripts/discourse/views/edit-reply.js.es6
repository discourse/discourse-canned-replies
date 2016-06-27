import ModalBodyView from 'discourse/views/modal-body';

export default ModalBodyView.extend({
  title: function () {
    return I18n.t("canned_replies.edit.modal_title");
  }.property()
});
