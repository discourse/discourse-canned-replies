import { computed } from "@ember/object";
import TagDrop from "select-kit/components/tag-drop";

export default TagDrop.extend({
  topTags: computed("availableTags.[]", function () {
    // sort tags descending by count and ascending by name
    return (this.availableTags || []).sort((a, b) => {
      if (a.count !== b.count) {
        return b.count - a.count;
      } // descending
      if (a.name !== b.name) {
        return a.name < b.name ? -1 : 1;
      } // ascending
      return 0;
    });
  }),

  search(filter) {
    return (this.content || [])
      .map((tag) => {
        if (tag.id && tag.name) {
          return tag;
        }
        return this.defaultItem(tag, tag);
      })
      .filter((tag) => {
        if (filter == null) {
          return true;
        }

        const tagFilter = filter.toLowerCase();
        return (
          tag.id.toLowerCase().indexOf(tagFilter) !== -1 ||
          tag.name.toLowerCase().indexOf(tagFilter) !== -1
        );
      });
  },

  actions: {
    onChange(tagId, tag) {
      // overrides the action onChange of the parent with the value received in
      // the property onChange in the handlebars template
      this.onChange && this.onChange(tagId, tag);
    },
  },
});
