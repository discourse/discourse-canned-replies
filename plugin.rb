# frozen_string_literal: true

# name: discourse-canned-replies
# about: Add canned replies through the composer
# version: 2.0.0
# authors: Jay Pfaffman and André Pereira
# url: https://github.com/discourse/discourse-canned-replies
# transpile_js: true

enabled_site_setting :canned_replies_enabled

register_asset 'stylesheets/canned-replies.scss'

register_svg_icon "far-clipboard" if respond_to?(:register_svg_icon)

after_initialize do

  module ::CannedReply
    PLUGIN_NAME ||= "discourse-canned-replies".freeze
    STORE_NAME ||= "replies".freeze

    class Engine < ::Rails::Engine
      engine_name CannedReply::PLUGIN_NAME
      isolate_namespace CannedReply
    end
  end

  [
    '../app/jobs/onceoff/rename_canned_replies.rb',
    "../app/models/discourse_canned_replies/usage_count.rb",
    "../lib/discourse_canned_replies/topic_extension.rb",
    "../lib/discourse_canned_replies/topic_query_extension.rb",
  ].each { |path| load File.expand_path(path, __FILE__) }

  reloadable_patch do |plugin|
    Topic.class_eval { prepend DiscourseCannedReplies::TopicExtension }
    TopicQuery.class_eval { prepend DiscourseCannedReplies::TopicQueryExtension }
  end

  class CannedReply::Reply
    class << self

      def all(user)
        query = TopicQuery.new(user).list_canned_replies

        query.topics.map do |topic|
          {
            id: topic.id,
            title: topic.title,
            content: topic.first_post.raw,
            tags: topic.tags.map(&:name),
            usages: topic.canned_reply_usage_count
          }
        end
      end

      def get_reply(user_id, reply_id)
        replies = all(user_id)

        replies.detect { |reply| reply['id'] == reply_id }
      end

      def use(user_id, reply_id)
        Topic.find_by(id: reply_id).increment_canned_reply_usage_count!
      end

      def add_default_reply()
        add(1, I18n.t("replies.default_reply.title"), I18n.t("replies.default_reply.body"))
      end
    end
  end

  require_dependency "application_controller"

  class CannedReply::CannedRepliesController < ::ApplicationController
    requires_plugin CannedReply::PLUGIN_NAME

    before_action :ensure_logged_in
    before_action :ensure_canned_replies_enabled
    skip_before_action :check_xhr

    def ensure_canned_replies_enabled
      guardian.ensure_can_use_canned_replies!
    end

    def reply
      reply_id = params.require(:id)
      user_id = current_user.id

      record = CannedReply::Reply.get_reply(user_id, reply_id)
      render json: record
    end

    def use
      reply_id = params.require(:id)
      user_id = current_user.id
      record = CannedReply::Reply.use(user_id, reply_id)

      render json: record
    end

    def index
      replies = CannedReply::Reply.all(current_user)

      render json: { replies: replies }
    end
  end

  add_to_class(:user, :can_use_canned_replies?) do
    return true if staff?
    return true if SiteSetting.canned_replies_everyone_enabled
    group_list = SiteSetting.canned_replies_groups.split("|").map(&:downcase)
    groups.any? { |group| group_list.include?(group.name.downcase) }
  end

  add_to_class(:guardian, :can_use_canned_replies?) do
    user && user.can_use_canned_replies?
  end

  add_to_serializer(:current_user, :can_use_canned_replies) do
    object.can_use_canned_replies?
  end

  CannedReply::Engine.routes.draw do
    resources :canned_replies, path: '/', only: [:index] do
      member do
        get "reply"
        patch "use"
      end
    end
  end

  Discourse::Application.routes.append do
    mount ::CannedReply::Engine, at: "/canned_replies"
  end

end
