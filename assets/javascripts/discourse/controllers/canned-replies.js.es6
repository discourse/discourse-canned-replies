import ModalFunctionality from 'discourse/mixins/modal-functionality';
import showModal from 'discourse/lib/show-modal';

export default Ember.Controller.extend(ModalFunctionality, {
  replies: [],
  selectedReply: "",
  selectedReplyID: "",


  actions: {
    apply: function() {
      var self = this;

      if (self.composerModel) {
        const newReply = self.composerModel.reply + this.selectedReply.content;
        self.composerModel.setProperties({reply: newReply});
      }
      this.send('closeModal');
    },
    newReply: function () {
      this.send('closeModal');
      showModal('new-reply').setProperties({composerModel: this.composerModel});
    },
    editReply: function () {
      this.send('closeModal');
      showModal('edit-reply').setProperties({
          composerModel: this.composerModel,
          reply_id: this.selectedReplyID,
          reply_title: this.selectedReply.title,
          reply_content: this.selectedReply.content
        });
    }
  },

  refresh: function() {
  },

  onShow: function() {
    this.setProperties({selectedReply: "", selectedReplyID: ""});
    Discourse.ajax("/cannedreplies").then(results => {
      const localReplies = [];
      for(var id in results.replies){
        localReplies.push(results.replies[id]);
      }
      this.set("replies", localReplies);
      // trigger update of the selected reply
      this.selectionChange();
    }).catch(e => {
      bootbox.alert(I18n.t("canned_replies.error.list") + e.errorThrown);
    });
  },

  selectionChange: function () {
    const localSelectedReplyID = this.selectedReplyID;
    var localSelectedReply = "";
    this.replies.forEach(function (entry) {
      if(entry.id == localSelectedReplyID){
        localSelectedReply = entry;
        return;
      }
    });
    this.set("selectedReply", localSelectedReply);
  },

  init: function () {
    this._super();
    this.replies = [];

    this.addObserver("selectedReplyID", function () {
      this.selectionChange();
    }.bind(this));
  }
});
