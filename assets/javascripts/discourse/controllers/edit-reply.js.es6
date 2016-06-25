import ModalFunctionality from 'discourse/mixins/modal-functionality';
import showModal from 'discourse/lib/show-modal';

export default Ember.Controller.extend(ModalFunctionality, {
  reply_title: "",
  reply_content: "",
  reply_id: "",


  actions: {
    add: function() {
      var self = this;
      Discourse.ajax("/cannedreplies/reply", {
        type: "POST",
        data: {reply_id: this.reply_id, title: this.reply_title, content: this.reply_content}
      }).then(results => {
        self.send('closeModal');
        showModal('canned-replies');
      }).catch(() => {
        bootbox.alert(I18n.t("poll.error_while_casting_votes"));
      });
    },
    useCurrent: function () {
      if (this.composerViewOld) {
        this.set("new_content", this.composerViewOld.value);
      }else if (this.composerView) {
        this.set("new_content", this.composerView.value);
      }
    }
  },

  refresh: function() {
  },
});
