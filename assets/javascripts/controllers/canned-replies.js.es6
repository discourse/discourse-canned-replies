import ModalFunctionality from "discourse/mixins/modal-functionality";
import showModal from "discourse/lib/show-modal";
import { ajax } from "discourse/lib/ajax";
import { observes } from "ember-addons/ember-computed-decorators";
import { popupAjaxError } from "discourse/lib/ajax-error";
import applyReply from "discourse/plugins/discourse-canned-replies/lib/apply-reply";

export default Ember.Controller.extend(ModalFunctionality, {
  selectedReply: null,
  selectedReplyId: "",
  loadingReplies: true,

  init() {
    this._super(...arguments);

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
    apply() {
      applyReply(
        this.get("selectedReplyId"),
        this.selectedReply.title,
        this.selectedReply.content,
        this.composerModel
      );

      this.send("closeModal");
    },

    newReply() {
      this.send("closeModal");

      showModal("new-reply").setProperties({
        newContent: this.composerModel.reply
      });
    },

    editReply() {
      this.send("closeModal");

      showModal("edit-reply").setProperties({
        replyId: this.get("selectedReplyId"),
        replyTitle: this.get("selectedReply.title"),
        replyContent: this.get("selectedReply.content")
      });
    }
  }
});
