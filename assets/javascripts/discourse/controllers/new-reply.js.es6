import ModalFunctionality from 'discourse/mixins/modal-functionality';
import showModal from 'discourse/lib/show-modal';

export default Ember.Controller.extend(ModalFunctionality, {
  new_title: "",
  new_content: "",


  actions: {
    add: function() {
      Discourse.ajax("/cannedreplies", {
        type: "POST",
        data: {title: this.new_title, content: this.new_content}
      }).then(results => {
        this.send('closeModal');
        showModal('new-reply')
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
