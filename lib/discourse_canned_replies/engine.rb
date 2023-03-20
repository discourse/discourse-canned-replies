# frozen_string_literal: true

module ::DiscourseCannedReplies
  class Engine < ::Rails::Engine
    engine_name PLUGIN_NAME
    isolate_namespace DiscourseCannedReplies
  end
end
