# frozen_string_literal: true

# name: discourse-canned-replies
# about: Add canned replies through the composer
# version: 2.0.0
# authors: Jay Pfaffman and André Pereira
# url: https://github.com/discourse/discourse-canned-replies
# transpile_js: true

enabled_site_setting :canned_replies_enabled

register_asset 'stylesheets/canned-replies.scss'

register_svg_icon 'far-clipboard' if respond_to?(:register_svg_icon)

after_initialize do
  module ::DiscourseCannedReplies
    PLUGIN_NAME ||= 'discourse-canned-replies'.freeze
    STORE_NAME ||= 'replies'.freeze

    class Engine < ::Rails::Engine
      engine_name DiscourseCannedReplies::PLUGIN_NAME
      isolate_namespace DiscourseCannedReplies
    end
  end

  %w[
    ../app/jobs/onceoff/rename_canned_replies.rb
    ../app/controllers/discourse_canned_replies/replies_controller.rb
    ../app/models/discourse_canned_replies/usage_count.rb
    ../app/serializers/discourse_canned_replies/replies_serializer.rb
    ../lib/discourse_canned_replies/guardian_extension.rb
    ../lib/discourse_canned_replies/topic_extension.rb
    ../lib/discourse_canned_replies/topic_query_extension.rb
    ../lib/discourse_canned_replies/user_extension.rb
  ].each { |path| load File.expand_path(path, __FILE__) }

  reloadable_patch do |plugin|
    Guardian.class_eval { prepend DiscourseCannedReplies::GuardianExtension }
    Topic.class_eval { prepend DiscourseCannedReplies::TopicExtension }
    TopicQuery.class_eval do
      prepend DiscourseCannedReplies::TopicQueryExtension
    end
    User.class_eval { prepend DiscourseCannedReplies::UserExtension }
  end

  add_to_serializer(:current_user, :can_use_canned_replies) do
    object.can_use_canned_replies?
  end

  Discourse::Application.routes.append do
    mount ::DiscourseCannedReplies::Engine, at: '/canned_replies'
  end

  DiscourseCannedReplies::Engine.routes.draw do
    resources :canned_replies, path: '/', only: [:index] do
      member { patch 'use' }
    end
  end
end
