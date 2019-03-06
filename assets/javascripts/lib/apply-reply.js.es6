import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";

export default function(replyId, replyTitle, replyContent, model) {
  // Replace variables with values.
  if (model) {
    const vars = {
      user: model.get("user.username"),
      original_poster: model.get("topic.details.created_by.username"),
      reply_to: model.get("post.reply_to_user.username"),
      last_user: model.get("topic.last_poster_username"),
      reply_to_or_last:
        model.get("post.reply_to_user.username") ||
        model.get("topic.last_poster_username")
    };

    for (var key in vars) {
      if (vars[key]) {
        replyTitle = replyTitle.replace("%{" + key + "}", vars[key]);
        replyContent = replyContent.replace("%{" + key + "}", vars[key]);
      }
    }
  }

  // Finally insert canned reply.
  model.appEvents.trigger("composer:insert-block", replyContent);
  if (model && !model.get("title")) {
    model.set("title", replyTitle);
  }

  ajax(`/canned_replies/${replyId}/use`, {
    type: "PATCH"
  }).catch(popupAjaxError);
}
