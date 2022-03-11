import Component from "@ember/component";
import { action } from "@ember/object";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import discourseComputed from "discourse-common/utils/decorators";
import { ALL_TAGS_ID, NO_TAG_ID } from "select-kit/components/tag-drop";

export default Component.extend({
  classNames: ["canned-replies-filterable-list"],

  init() {
    this._super(...arguments);

    this.setProperties({
      loadingReplies: false,
      listFilter: "",
      replies: [],
      selectedTag: ALL_TAGS_ID,
      availableTags: [],
    });
  },

  didInsertElement() {
    this._load();
  },

  @discourseComputed("replies", "selectedTag", "listFilter")
  filteredReplies(replies, selectedTag, listFilter) {
    const filterTitle = listFilter.toLowerCase();
    return (
      replies
        .map((reply) => {
          /* Give a relevant score to each reply. */
          reply.score = 0;
          if (reply.title.toLowerCase().indexOf(filterTitle) !== -1) {
            reply.score += 2;
          } else if (reply.content.toLowerCase().indexOf(filterTitle) !== -1) {
            reply.score += 1;
          }
          return reply;
        })
        // Filter irrelevant replies.
        .filter((reply) => reply.score !== 0)
        // Filter only replies tagged with the selected tag.
        .filter((reply) => {
          if (selectedTag === ALL_TAGS_ID) {
            return true;
          }
          if (selectedTag === NO_TAG_ID && reply.tags.length === 0) {
            return true;
          }

          return reply.tags.indexOf(selectedTag) > -1;
        })
        .sort((a, b) => {
          /* Sort replies by relevance and title. */
          if (a.score !== b.score) {
            return a.score > b.score ? -1 : 1; /* descending */
          } else if (a.title !== b.title) {
            return a.title < b.title ? -1 : 1; /* ascending */
          }
          return 0;
        })
    );
  },

  @action
  changeSelectedTag(tagId) {
    this.set("selectedTag", tagId);
  },

  _load() {
    ajax("/canned_replies")
      .then((results) => {
        this.setProperties({
          replies: results.canned_replies,
          availableTags: this.siteSettings.tagging_enabled
            ? Object.values(
                results.canned_replies.reduce((availableTags, reply) => {
                  reply.tags.forEach((tag) => {
                    if (availableTags[tag]) {
                      availableTags[tag].count += 1;
                    } else {
                      availableTags[tag] = { id: tag, name: tag, count: 1 };
                    }
                  });

                  return availableTags;
                }, {})
              )
            : [],
        });
      })
      .catch(popupAjaxError)
      .finally(() => {
        this.set("loadingReplies", false);

        Ember.run.schedule("afterRender", () =>
          document.querySelector(".canned-replies-filter").focus()
        );
      });
  },
});
