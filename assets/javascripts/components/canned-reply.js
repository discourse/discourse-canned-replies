import Component from "@ember/component";
import showModal from "discourse/lib/show-modal";
import applyReply from "discourse/plugins/discourse-canned-replies/lib/apply-reply";
import { getOwner } from "discourse-common/lib/get-owner";

export default Component.extend({
  canEdit: false,

  init() {
    this._super(...arguments);
    const currentUser = this.get("currentUser");
    const everyoneCanEdit =
      this.get("siteSettings.canned_replies_everyone_enabled") &&
      this.get("siteSettings.canned_replies_everyone_can_edit");
    const currentUserCanEdit =
      this.get("siteSettings.canned_replies_enabled") &&
      currentUser &&
      currentUser.can_edit_canned_replies;
    const canEdit = currentUserCanEdit ? currentUserCanEdit : everyoneCanEdit;
    this.set("canEdit", canEdit);
  },

  actions: {
    apply() {
      const composer = getOwner(this).lookup("controller:composer");

      applyReply(
        this.get("reply.id"),
        this.get("reply.title"),
        this.get("reply.content"),
        composer.model
      );

      this.appEvents.trigger("canned-replies:hide");
    },

    editReply() {
      const composer = getOwner(this).lookup("controller:composer");

      getOwner(this).lookup("service:modal").close();
      showModal("edit-reply").setProperties({
        composerModel: composer.composerModel,
        replyId: this.get("reply.id"),
        replyTitle: this.get("reply.title"),
        replyContent: this.get("reply.content"),
      });
    },
  },
});
