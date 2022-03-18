# frozen_string_literal: true

module Jobs
  class RenameCannedReplies < ::Jobs::Onceoff
    OLD_PLUGIN_NAME = 'canned_replies'
    NEW_PLUGIN_NAME = 'discourse-canned-replies'

    def execute_onceoff(args)
      PluginStoreRow.where(plugin_name: NEW_PLUGIN_NAME).delete_all
      PluginStoreRow
        .where(plugin_name: OLD_PLUGIN_NAME)
        .update_all(plugin_name: NEW_PLUGIN_NAME)
    end
  end
end
