import ModalFunctionality from 'discourse/mixins/modal-functionality';
import showModal from 'discourse/lib/show-modal';
import { ajax } from 'discourse/lib/ajax';

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

      ajax("/cannedreplies/reply", {
        type: "PUT",
        data: {reply_id: this.selectedReplyID}
      }).catch(e => {
        bootbox.alert(I18n.t("canned_replies.error.updatingUsages") + e.errorThrown);
      });

      this.send('closeModal');
    },
    newReply: function () {
      this.send('closeModal');
      showModal('new-reply').setProperties({new_content: this.composerModel.reply});
    },
    editReply: function () {
      this.send('closeModal');
      showModal('edit-reply').setProperties({
          composerModel: this.composerModel,
          reply_id: this.selectedReplyID,
          reply_title: this.selectedReply.title,
          reply_content: this.selectedReply.content
        });
    },
    sortAlphabetically: function () {
      var selectList = $('#repliesComboBox option');

      selectList.sort(function(a,b){
        a = a.text;
        b = b.text;

        return a.localeCompare(b);
      });

      $('#repliesComboBox').html(selectList);
      $('#sortCannedRepliesAlphabetically').hide();
      $('#sortCannedRepliesByUsage').show();
    },
    sortByUsage: function () {
      var selectList = $('#repliesComboBox option');

      for(var index = 0; index < selectList.length; index++){
        var entry = selectList[index];
        var reply = this.getReplyByID(entry.value);
        entry.setAttribute("usage", reply.usages);
      }

      selectList.sort(function(a,b){
        const usageA = a.getAttribute("usage");
        const usageB = b.getAttribute("usage");

        if(usageA === usageB === "undefined"){
          return a.text.localeCompare(b.text);
        }
        if (usageA == null && usageB != null){
          return 1;
        }
        if(usageA != null && usageB == null){
          return -1;
        }
        return usageA.localeCompare(usageB) * -1;
      });

      $('#repliesComboBox').html(selectList);
      $('#sortCannedRepliesByUsage').hide();
      $('#sortCannedRepliesAlphabetically').show();
    }
  },

  getReplyByID: function (id) {
    for(var index = 0; index < this.replies.length; index++) {
      var entry = this.replies[index];
      if (entry.id === id) {
        return entry;
      }
    }
  },

  refresh: function() {
  },

  onShow: function() {
    this.setProperties({selectedReply: "", selectedReplyID: ""});
    ajax("/cannedreplies").then(results => {
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
      if(entry.id === localSelectedReplyID){
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
