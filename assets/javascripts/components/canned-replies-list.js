import Component from "@ember/component";
import discourseComputed from "discourse-common/utils/decorators";
import { ALL_TAGS_ID, NO_TAG_ID } from "select-kit/components/tag-drop";

export default Component.extend({
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
          if (selectedTag === ALL_TAGS_ID) return true;
          if (selectedTag === NO_TAG_ID && reply.tags.length === 0) return true;

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
});
