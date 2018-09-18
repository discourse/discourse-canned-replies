import showModal from "discourse/lib/show-modal";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";

export default Ember.Component.extend({
  isOpen: false,

  actions: {
    toggle() {
      this.toggleProperty("isOpen");
    },

    apply: function() {
      // TODO: This is ugly. There _must_ be another way.
      // TODO: This code is also duplicated (see controller).
      const composer = Discourse.__container__.lookup("controller:composer");
      const model = composer.model;

      let replyTitle = this.get("reply.title");
      let replyContent = this.get("reply.content");

      // Replace variables with values.
      if (model) {
        const vars = {
          user: this.get("currentUser.username"),
          op: model.get("topic.posters")
            ? model.get("topic.posters")[0].user.get("username")
            : "",
          replyto: model.get("post.reply_to_user.username"),
          last: model.get("topic.last_poster_username"),
          replyto_or_last:
            model.get("post.reply_to_user.username") ||
            model.get("topic.last_poster_username")
        };

        for (var key in vars) {
          if (vars[key]) {
            replyTitle = replyTitle.replace("#{" + key + "}", vars[key]);
            replyContent = replyContent.replace("#{" + key + "}", vars[key]);
          }
        }
      }

      // Finally canned reply.
      this.appEvents.trigger("composer:insert-block", replyContent);
      if (model && !model.get("title")) {
        model.set("title", replyTitle);
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
