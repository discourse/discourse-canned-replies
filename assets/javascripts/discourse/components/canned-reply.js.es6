import showModal from "discourse/lib/show-modal";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import applyReply from "discourse/plugins/Canned Replies/lib/apply-reply";

export default Ember.Component.extend({
  isOpen: false,

  actions: {
    toggle() {
      this.toggleProperty("isOpen");
    },

    apply: function() {
      const composer = Discourse.__container__.lookup("controller:composer");

      applyReply(
        this.get("reply.id"),
        this.get("reply.title"),
        this.get("reply.content"),
        composer.model
      );

      this.appEvents.trigger("canned-replies:hide");
    },

    editReply: function() {
      const composer = Discourse.__container__.lookup("controller:composer");

      composer.send("closeModal");
      showModal("edit-reply").setProperties({
        composerModel: composer.composerModel,
        replyId: this.get("reply.id"),
        replyTitle: this.get("reply.title"),
        replyContent: this.get("reply.content")
      });
    }
  }
});
