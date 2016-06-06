import ModalBodyView from 'discourse/views/modal-body';

export default ModalBodyView.extend({
  title: function () {
    return I18n.t("template_manager.modal_title");
  }.property()
});
