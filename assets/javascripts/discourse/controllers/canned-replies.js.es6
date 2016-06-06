import ModalFunctionality from 'discourse/mixins/modal-functionality';

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
    }
  },

  refresh: function() {
  },

  onShow: function() {
    this.setProperties({selectedReply: "", selectedReplyID: ""});
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
    Discourse.ajax("/cannedreplies", {
      type: "GET"
    }).then(results => {
      const localReplies = [];
      for(var id in results.replies){
        localReplies.push(results.replies[id]);
      }
      this.set("replies", localReplies);
    }).catch(() => {
      bootbox.alert(I18n.t("poll.error_while_casting_votes"));
    });

    this.addObserver("selectedReplyID", function () {
      this.selectionChange();
    }.bind(this));
  }
});
