import showModal from 'discourse/lib/show-modal';
import { ajax } from 'discourse/lib/ajax';
import { popupAjaxError } from 'discourse/lib/ajax-error';
import computed from 'ember-addons/ember-computed-decorators';

export default Ember.Component.extend({
  isOpen: false,

  @computed('isOpen')
  showContentIcon(isOpen) {
    return isOpen ? 'chevron-down' : 'chevron-left';
  },

  actions: {
    toggle() {
        this.toggleProperty('isOpen');
    },

    apply: function() {
      // TODO: This is ugly. There _must_ be another way.
      // TODO: This code is also duplicated (see controller).
      const composer = Discourse.__container__.lookup('controller:composer');
      const model = composer.model;

      if (model) {

        /**
         * Variables to be replaced.
         */
        const vars = {
          'last': model.get('topic.last_poster_username'),
          'op': model.get('topic.posters') ? model.get('topic.posters')[0].user.get('username') : '',
          'replyto': model.get('post.reply_to_user.username'),
          'user': this.get('currentUser.username'),
        };

        /**
         * Replacing variables in content.
         */
        var content = this.get('reply.content');
        for (var key in vars) {
          if (vars[key]) {
            content = content.replace('@' + key, '@' + vars[key]);
          }
        }

        /**
         * Make changes in composer.
         */
        model.set('reply', model.get('reply') + content);
        if (!model.get('title')) {
          model.set('title', this.get('reply.title'));
        }
      }

      ajax(`/canned_replies/${this.get('reply.id')}/use`, {
        type: "PATCH"
      }).catch(popupAjaxError);

      this.appEvents.trigger('canned-replies:hide');
    },

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
