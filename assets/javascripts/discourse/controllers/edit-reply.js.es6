import ModalFunctionality from 'discourse/mixins/modal-functionality';
import showModal from 'discourse/lib/show-modal';

export default Ember.Controller.extend(ModalFunctionality, {
  reply_title: "",
  reply_content: "",
  reply_id: "",


  actions: {
    save: function() {
      var self = this;
      Discourse.ajax("/cannedreplies/reply", {
        type: "POST",
        data: {reply_id: this.reply_id, title: this.reply_title, content: this.reply_content}
      }).then(results => {
        self.send('closeModal');
        showModal('canned-replies');
      }).catch(e => {
        bootbox.alert(I18n.t("canned_replies.error.edit") + e.errorThrown);
      });
    },
    useCurrent: function () {
      if (this.composerViewOld) {
        this.set("new_content", this.composerViewOld.value);
      }else if (this.composerView) {
        this.set("new_content", this.composerView.value);
      }
    },
    remove: function () {
      var self = this;
      Discourse.ajax("/cannedreplies/reply", {
        type: "DELETE",
        data: {reply_id: this.reply_id}
      }).then(results => {
        self.send('closeModal');
        showModal('canned-replies');
      }).catch(e => {
        bootbox.alert(I18n.t("canned_replies.error.remove") + e.errorThrown);
      });
    }
  },

  refresh: function() {
  },
});
