import ModalFunctionality from "discourse/mixins/modal-functionality";
import showModal from "discourse/lib/show-modal";
import { ajax } from "discourse/lib/ajax";
import { observes } from "ember-addons/ember-computed-decorators";
import { popupAjaxError } from "discourse/lib/ajax-error";

export default Ember.Controller.extend(ModalFunctionality, {
  selectedReply: null,
  selectedReplyId: "",
  loadingReplies: true,

  init() {
    this._super();
    this.replies = [];
  },

  @observes("selectedReplyId")
  _updateSelection() {
    this.selectionChange();
  },

  onShow() {
    ajax("/canned_replies")
      .then(results => {
        this.set("replies", results.replies);
        // trigger update of the selected reply
        this.selectionChange();
      })
      .catch(popupAjaxError)
      .finally(() => this.set("loadingReplies", false));
  },

  selectionChange() {
    const localSelectedReplyId = this.get("selectedReplyId");

    let localSelectedReply = "";
    this.get("replies").forEach(entry => {
      if (entry.id === localSelectedReplyId) {
        localSelectedReply = entry;
        return;
      }
    });

    this.set("selectedReply", localSelectedReply);
  },

  actions: {
    apply: function() {
      if (this.composerModel) {
        const newReply =
          this.composerModel.get("reply") + this.selectedReply.content;
        this.composerModel.set("reply", newReply);
        if (!this.composerModel.get("title")) {
          this.composerModel.set("title", this.selectedReply.title);
        }
      }

      ajax(`/canned_replies/${this.get("selectedReplyId")}/use`, {
        type: "PATCH"
      }).catch(popupAjaxError);

      this.send("closeModal");
    },

    newReply: function() {
      this.send("closeModal");

      showModal("new-reply").setProperties({
        newContent: this.composerModel.reply
      });
    },

    editReply: function() {
      this.send("closeModal");

      showModal("edit-reply").setProperties({
        replyId: this.get("selectedReplyId"),
        replyTitle: this.get("selectedReply.title"),
        replyContent: this.get("selectedReply.content")
      });
    }
  }
});
