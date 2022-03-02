import Controller from "@ember/controller";
import ModalFunctionality from "discourse/mixins/modal-functionality";
import { ajax } from "discourse/lib/ajax";
import { observes } from "discourse-common/utils/decorators";
import { popupAjaxError } from "discourse/lib/ajax-error";
import applyReply from "discourse/plugins/discourse-canned-replies/lib/apply-reply";

export default Controller.extend(ModalFunctionality, {
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
      .then((results) => {
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
    this.get("replies").forEach((entry) => {
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
  },
});
