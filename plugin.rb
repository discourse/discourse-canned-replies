# frozen_string_literal: true

# name: discourse-canned-replies
# about: Add canned replies through the composer
# version: 1.2
# authors: Jay Pfaffman and André Pereira
# url: https://github.com/discourse/discourse-canned-replies
# transpile_js: true

enabled_site_setting :canned_replies_enabled

register_asset 'stylesheets/canned-replies.scss'

register_svg_icon "far-clipboard" if respond_to?(:register_svg_icon)

after_initialize do

  load File.expand_path('../app/jobs/onceoff/rename_canned_replies.rb', __FILE__)

  module ::CannedReply
    PLUGIN_NAME ||= "discourse-canned-replies".freeze
    STORE_NAME ||= "replies".freeze

    class Engine < ::Rails::Engine
      engine_name CannedReply::PLUGIN_NAME
      isolate_namespace CannedReply
    end
  end

  class CannedReply::Reply
    class << self

      def add(user_id, title, content)
        id = SecureRandom.hex(16)
        record = { id: id, title: title, content: content }

        replies = PluginStore.get(CannedReply::PLUGIN_NAME, CannedReply::STORE_NAME) || {}

        replies[id] = record
        PluginStore.set(CannedReply::PLUGIN_NAME, CannedReply::STORE_NAME, replies)

        record
      end

      def edit(user_id, reply_id, title, content)
        record = { id: reply_id, title: title, content: content }
        remove(user_id, reply_id)

        replies = PluginStore.get(CannedReply::PLUGIN_NAME, CannedReply::STORE_NAME) || {}

        replies[reply_id] = record
        PluginStore.set(CannedReply::PLUGIN_NAME, CannedReply::STORE_NAME, replies)

        record
      end

      def all(user_id)
        replies = PluginStore.get(CannedReply::PLUGIN_NAME, CannedReply::STORE_NAME)

        if replies.blank?
          add_default_reply
          replies = PluginStore.get(CannedReply::PLUGIN_NAME, CannedReply::STORE_NAME)
        end

        return [] if replies.blank?
        replies.values.sort_by { |reply| reply['title'] || '' }
      end

      def get_reply(user_id, reply_id)
        replies = all(user_id)

        replies.detect { |reply| reply['id'] == reply_id }
      end

      def remove(user_id, reply_id)
        replies = PluginStore.get(CannedReply::PLUGIN_NAME, CannedReply::STORE_NAME)
        replies.delete(reply_id)
        PluginStore.set(CannedReply::PLUGIN_NAME, CannedReply::STORE_NAME, replies)
      end

      def use(user_id, reply_id)
        replies = PluginStore.get(CannedReply::PLUGIN_NAME, CannedReply::STORE_NAME)
        reply = replies[reply_id]
        reply['usages'] ||= 0
        reply['usages'] += 1
        replies[reply_id] = reply
        PluginStore.set(CannedReply::PLUGIN_NAME, CannedReply::STORE_NAME, replies)
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

    def create
      guardian.ensure_can_edit_canned_replies!

      title = params.require(:title)
      content = params.require(:content)
      user_id = current_user.id

      record = CannedReply::Reply.add(user_id, title, content)
      render json: record
    end

    def destroy
      guardian.ensure_can_edit_canned_replies!

      reply_id = params.require(:id)
      user_id = current_user.id
      record = CannedReply::Reply.remove(user_id, reply_id)

      render json: record
    end

    def reply
      reply_id = params.require(:id)
      user_id = current_user.id

      record = CannedReply::Reply.get_reply(user_id, reply_id)
      render json: record
    end

    def update
      guardian.ensure_can_edit_canned_replies!

      reply_id = params.require(:id)
      title = params.require(:title)
      content = params.require(:content)
      user_id = current_user.id

      record = CannedReply::Reply.edit(user_id, reply_id, title, content)
      render json: record
    end

    def use
      reply_id = params.require(:id)
      user_id = current_user.id
      record = CannedReply::Reply.use(user_id, reply_id)

      render json: record
    end

    def index
      category_id = SiteSetting.canned_replies_category.to_i
      query = TopicQuery.new(current_user, { category: category_id }).list_latest

      list = query.topics.map do |topic|
        { id: topic.id, title: topic.title, content: topic.first_post.raw, usages: 0 }
      end

      render json: { replies: list }
    end
  end

  add_to_class(:user, :can_edit_canned_replies?) do
    return true if staff?
    return true if SiteSetting.canned_replies_everyone_can_edit
    group_list = SiteSetting.canned_replies_groups.split("|").map(&:downcase)
    groups.any? { |group| group_list.include?(group.name.downcase) }
  end

  add_to_class(:user, :can_use_canned_replies?) do
    return true if staff?
    return true if SiteSetting.canned_replies_everyone_enabled
    group_list = SiteSetting.canned_replies_groups.split("|").map(&:downcase)
    groups.any? { |group| group_list.include?(group.name.downcase) }
  end

  add_to_class(:guardian, :can_edit_canned_replies?) do
    user && user.can_edit_canned_replies?
  end

  add_to_class(:guardian, :can_use_canned_replies?) do
    user && user.can_use_canned_replies?
  end

  add_to_serializer(:current_user, :can_use_canned_replies) do
    object.can_use_canned_replies?
  end

  add_to_serializer(:current_user, :can_edit_canned_replies) do
    object.can_edit_canned_replies?
  end

  CannedReply::Engine.routes.draw do
    resources :canned_replies, path: '/', only: [:index, :create, :destroy, :update] do
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
