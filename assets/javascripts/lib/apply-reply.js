export function prepareReply(replyTitle, replyContent, model) {
  // Replace variables with values.
  if (model) {
    const vars = {
      my_username: model.get("user.username"),
      my_name: model.get("user.name"),
      original_poster_username: model.get("topic.details.created_by.username"),
      original_poster_name: model.get("topic.details.created_by.name"),
      reply_to_username: model.get("post.username"),
      reply_to_name: model.get("post.name"),
      last_poster_username: model.get("topic.last_poster_username"),
      reply_to_or_last_poster_username:
        model.get("post.username") || model.get("topic.last_poster_username"),
    };

    for (let key in vars) {
      if (vars[key]) {
        replyTitle = replyTitle.replace(
          new RegExp(`%{${key}(,fallback:.[^}]*)?}`, "g"),
          vars[key]
        );
        replyContent = replyContent.replace(
          new RegExp(`%{${key}(,fallback:.[^}]*)?}`, "g"),
          vars[key]
        );
      } else {
        replyTitle = replyTitle.replace(
          new RegExp(`%{${key},fallback:(.[^}]*)}`, "g"),
          "$1"
        );
        replyTitle = replyTitle.replace(new RegExp(`%{${key}}`, "g"), "");
        replyContent = replyContent.replace(
          new RegExp(`%{${key},fallback:(.[^}]*)}`, "g"),
          "$1"
        );
        replyContent = replyContent.replace(new RegExp(`%{${key}}`, "g"), "");
      }
    }
  }

  return { replyTitle, replyContent };
}

export function insertReplyIntoComposer({ replyTitle, replyContent }) {
  const model = this.get("model");

  // insert the title if blank
  if (model && !model.title) {
    model.set("title", replyTitle);
  }

  // insert the content of the reply in the compose
  this.appEvents.trigger("composer:insert-block", replyContent);

  // hide the canned reply panel
  this.send("hide");
}
