import showModal from 'discourse/lib/show-modal';
import ApplicationRoute from 'discourse/routes/application';
import ComposerView from 'discourse/views/composer';
import { onToolbarCreate } from 'discourse/components/d-editor';
import NewComposer from 'discourse/components/d-editor';

export default
{
  name: 'template-manager',
  initialize(container)
  {
    const siteSettings = container.lookup('site-settings:main');

    if (siteSettings.template_manager_enabled) {
      if (NewComposer !== "undefined") {
        NewComposer.reopen({
          actions: {
            showPollUI: function() {
              showModal('template-manager').setProperties({composerView: this});
            }
          }
        });

        onToolbarCreate(toolbar => {
          toolbar.addButton({
            id: "template_manager_button",
            group: "extras",
            icon: "clipboard",
            action: 'showPollUI'
          });
        });
      } else {
        ApplicationRoute.reopen({
          actions: {
            showPollUI: function (composerView) {
              showModal('template-manager');
              this.controllerFor('template-manager').setProperties({composerViewOld: composerView});
            }
          }
        });

        ComposerView.reopen({
          initEditor: function () {
            // overwrite and wrap.
            this._super();
            var view = this;
            var button_text = I18n.t("template_manager.composer_button_text");
            var btn = $('<button class="wmd-button wmd-template-manager-button" title="' + button_text + '" aria-label="' + button_text + '"></button>');
            btn.click(function () {
              view.get("controller").send("showPollUI", view);
            });
            $("#wmd-button-row,.wmd-button-row").append(btn);
          }
        });
      }
    }
  }
};
