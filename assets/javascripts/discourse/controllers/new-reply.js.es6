import ModalFunctionality from 'discourse/mixins/modal-functionality';
import showModal from 'discourse/lib/show-modal';
import { ajax } from 'discourse/lib/ajax';

export default Ember.Controller.extend(ModalFunctionality, {
  new_title: "",
  new_content: "",


  actions: {
    add: function() {
      var self = this;
      ajax("/cannedreplies", {
        type: "POST",
        data: {title: this.new_title, content: this.new_content}
      }).then(() => {
        self.send('closeModal');
        showModal('canned-replies');
      }).catch(e => {
        bootbox.alert(I18n.t("canned_replies.error.add") + e.errorThrown);
      });
    },
    cancel: function () {
      this.send('closeModal');
      showModal('canned-replies');
    }
  },

  refresh: function() {
  },
});
