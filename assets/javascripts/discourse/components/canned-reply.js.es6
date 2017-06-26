import showModal from 'discourse/lib/show-modal';
import { ajax } from 'discourse/lib/ajax';
import { popupAjaxError } from 'discourse/lib/ajax-error';

export default Ember.Component.extend({

  /**
   * Whether the content is shown or the excerpt.
   *
   * @type {Boolean}
   */
  isOpen: false,

  actions: {

    /**
     * Opens the content and hides the excerpt.
     */
    open: function() {
      this.set('isOpen', true);
    },

    /**
     * Hides the content and shows the excerpt.
     */
    close: function() {
      this.set('isOpen', false);
    },

    /**
     * Applies the canned reply.
     */
    apply: function() {
      // TODO: This is ugly. There _must_ be another way.
      // TODO: This code is also duplicated (see controller).
      const composer = Discourse.__container__.lookup('controller:composer');

      if (composer.model) {
        const newReply = composer.model.get('reply') + this.get('reply.content');
        composer.model.set('reply', newReply);
        if (!composer.model.get('title')) {
          composer.model.set('title', this.get('reply.title'));
        }
      }

      ajax(`/canned_replies/${this.get('reply.id')}/use`, {
        type: "PATCH"
      }).catch(popupAjaxError);

      this.appEvents.trigger('canned-replies:hide');
    },

    /**
     * Shows model used for editing current reply.
     */
    editReply: function () {
      // TODO: This is ugly. There _must_ be another way.
      // TODO: This code is also duplicated (see controller).
      const composer = Discourse.__container__.lookup('controller:composer');

      composer.send('closeModal');
      showModal('edit-reply').setProperties({
        composerModel: composer.composerModel,
        replyId: this.get('reply.id'),
        replyTitle: this.get('reply.title'),
        replyContent: this.get('reply.content')
      });
    }
  }

});
