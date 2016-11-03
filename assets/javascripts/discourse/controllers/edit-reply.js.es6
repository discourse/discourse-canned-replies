import ModalFunctionality from 'discourse/mixins/modal-functionality';
import showModal from 'discourse/lib/show-modal';
import { ajax } from 'discourse/lib/ajax';

export default Ember.Controller.extend(ModalFunctionality, {
  reply_title: "",
  reply_content: "",
  reply_id: "",


  actions: {
    save: function() {
      var self = this;
      ajax("/cannedreplies/reply", {
        type: "POST",
        data: {reply_id: this.reply_id, title: this.reply_title, content: this.reply_content}
      }).then(() => {
        self.send('closeModal');
        showModal('canned-replies');
      }).catch(e => {
        bootbox.alert(I18n.t("canned_replies.error.edit") + e.errorThrown);
      });
    },
    remove: function () {
      var self = this;
      bootbox.confirm(I18n.t("canned_replies.edit.remove_confirm"), function(result) {
        if (result) {
          ajax("/cannedreplies/reply", {
            type: "DELETE",
            data: {reply_id: self.reply_id}
          }).then(() => {
            self.send('closeModal');
            showModal('canned-replies');
          }).catch(e => {
            bootbox.alert(I18n.t("canned_replies.error.remove") + e.errorThrown);
          });
        }
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
