import showModal from "discourse/lib/show-modal";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import { getOwner } from "discourse-common/lib/get-owner";

export default {
  setupComponent(args, component) {
    component.set("isVisible", false);
    component.set("loadingReplies", false);
    component.set("replies", []);
    component.set("tags", []);
    component.set("filteredReplies", []);

    if (!component.appEvents.has("canned-replies:show")) {
      component.appEvents.on("canned-replies:show", () => {
        component.send("show");
      });
    }

    if (!component.appEvents.has("canned-replies:hide")) {
      component.appEvents.on("canned-replies:hide", () => {
        component.send("hide");
      });
    }

    component.appEvents.on("composer:will-close", () => {
      component.appEvents.off("canned-replies:show");
      component.appEvents.off("canned-replies:hide");
    });

    component.addObserver("listFilter", function() {
      const filterTitle = component.get("listFilter").toLowerCase();
      const filtered = component
        .get("replies")
        .map(function(reply) {
          return computeReplySearchScore(reply, filterTitle);
        })
        .filter(function(reply) {
          /* Filter irrelevant replies. */
          return reply.score !== 0;
        })
        .sort(function(a, b) {
          /* Sort replies by relevance and title. */
          if (a.score !== b.score) {
            return a.score > b.score ? -1 : 1; /* descending */
          } else if (a.title !== b.title) {
            return a.title < b.title ? -1 : 1; /* ascending */
          }
          return 0;
        });
      component.set("filteredReplies", filtered);
    });

    function computeReplySearchScore(reply, filterTitle){
      /* Give a relevant score to each reply. */
      reply.score = 0;
      let tagsScore = 0;
      let matchedTags = false;

      // match tags
      const filterWords = filterTitle.split(" ");
      for (let i = filterWords.length - 1; i >= 0; i--) {
        const word = filterWords[i];
        if(word && reply.tags){
          for (let j = reply.tags.length - 1; j >= 0; j--) {
            const tag = reply.tags[j];
            if (tag && tag.toLowerCase().indexOf(word) !== -1) {
              tagsScore += 3;
              // Remove from list if it perfectly matches the tag.
              // This is to allow the user to refine their search inside the tag results
              if(tag.toLowerCase() === word){
                filterWords.splice(i, 1);
                matchedTags = true;
                break;
              }
            }
          }
        }
      }

      // Search in the title and content for the text without the matched tags
      const filterTitleAfterTags = filterWords.join(" ");
      if (reply.title.toLowerCase().indexOf(filterTitleAfterTags) !== -1) {
        reply.score += 2;
      } else if (reply.content.toLowerCase().indexOf(filterTitleAfterTags) !== -1) {
        reply.score += 1;
      }

      if(!matchedTags || (matchedTags && reply.score > 0)){
        reply.score += tagsScore;
      }

      return reply;
    }
  },


  actions: {
    show() {
      $("#reply-control .d-editor-preview-wrapper > .d-editor-preview").hide();
      this.set("isVisible", true);
      this.set("loadingReplies", true);

      ajax("/canned_replies")
        .then(results => {
          this.set("replies", results.replies);
          this.set("tags", results.tags);
          this.set("filteredReplies", results.replies);
        })
        .catch(popupAjaxError)
        .finally(() => {
          this.set("loadingReplies", false);

          Ember.run.schedule("afterRender", () => {
            $(".canned-replies-filter").focus();
          });
        });
    },

    hide() {
      $(".d-editor-preview-wrapper > .d-editor-preview").show();
      this.set("isVisible", false);
    },

    newReply(tags) {
      const composer = getOwner(this).lookup("controller:composer");
      composer.send("closeModal");

      showModal("new-reply").setProperties({
        newContent: composer.model.reply,
        allTags: this.get("tags")
      });
    }
  }
};
