import showModal from "discourse/lib/show-modal";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import computed from "ember-addons/ember-computed-decorators";

export default Ember.Component.extend({
  isOpen: false,

  @computed("isOpen")
  showContentIcon(isOpen) {
    return isOpen ? "chevron-down" : "chevron-left";
  },

  actions: {
    toggle() {
      this.toggleProperty("isOpen");
    },

    apply: function() {
      // TODO: This is ugly. There _must_ be another way.
      // TODO: This code is also duplicated (see controller).
      const composer = Discourse.__container__.lookup("controller:composer");

      if (composer.model) {
        const newReply =
          composer.model.get("reply") + this.get("reply.content");
        composer.model.set("reply", newReply);
        if (!composer.model.get("title")) {
          composer.model.set("title", this.get("reply.title"));
        }
      }

      ajax(`/canned_replies/${this.get("reply.id")}/use`, {
        type: "PATCH"
      }).catch(popupAjaxError);

      this.appEvents.trigger("canned-replies:hide");
    },

    editReply: function() {
      // TODO: This is ugly. There _must_ be another way.
      // TODO: This code is also duplicated (see controller).
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
