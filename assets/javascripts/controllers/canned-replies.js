import Controller from "@ember/controller";
import ModalFunctionality from "discourse/mixins/modal-functionality";
import showModal from "discourse/lib/show-modal";
import { ajax } from "discourse/lib/ajax";
import { observes } from "discourse-common/utils/decorators";
import { popupAjaxError } from "discourse/lib/ajax-error";
import applyReply from "discourse/plugins/discourse-canned-replies/lib/apply-reply";

export default Controller.extend(ModalFunctionality, {
  selectedReply: null,
  selectedReplyId: "",
  loadingReplies: true,
  canEdit: false,

  init() {
    this._super(...arguments);

    const currentUser = this.get("currentUser");
    const everyoneCanEdit =
      this.siteSettings.canned_replies_everyone_enabled &&
      this.siteSettings.canned_replies_everyone_can_edit;
    const currentUserCanEdit =
      this.siteSettings.canned_replies_enabled &&
      currentUser &&
      currentUser.can_edit_canned_replies;
    const canEdit = currentUserCanEdit ? currentUserCanEdit : everyoneCanEdit;
    this.set("canEdit", canEdit);

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

    newReply() {
      this.send("closeModal");

      showModal("new-reply").set("newContent", this.composerModel.reply);
    },

    editReply() {
      this.send("closeModal");

      showModal("edit-reply").setProperties({
        replyId: this.selectedReplyId,
        replyTitle: this.get("selectedReply.title"),
        replyContent: this.get("selectedReply.content"),
      });
    },
  },
});
