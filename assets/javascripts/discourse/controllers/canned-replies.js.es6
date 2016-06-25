import ModalFunctionality from 'discourse/mixins/modal-functionality';
import showModal from 'discourse/lib/show-modal';

export default Ember.Controller.extend(ModalFunctionality, {
  replies: [],
  selectedReply: "",
  selectedReplyID: "",


  actions: {
    apply: function() {
      var self = this, composerOutput = this.selectedReply.content;

      if (self.composerViewOld)
        self.composerViewOld.addMarkdown(composerOutput);
      else if (self.composerView) {
        self.composerView._addText(self.composerView._getSelected(), composerOutput);
      }
      this.send('closeModal');
    },
    newReply: function () {
      this.send('closeModal');
      showModal('new-reply').setProperties({composerView: this.composerView, composerViewOld: this.composerViewOld});
    },
    editReply: function () {
      this.send('closeModal');
      showModal('edit-reply').setProperties({
          composerView: this.composerView,
          composerViewOld: this.composerViewOld,
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
    }).catch(() => {
      bootbox.alert(I18n.t("poll.error_while_casting_votes"));
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
