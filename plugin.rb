# name: discourse-canned-replies
# about: Add canned replies through the composer
# version: 1.2
# authors: Jay Pfaffman and André Pereira
# url: https://github.com/discourse/discourse-canned-replies

enabled_site_setting :canned_replies_enabled

register_asset 'stylesheets/canned-replies.scss'

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
    skip_before_action :check_xhr

    def create
      title   = params.require(:title)
      content = params.require(:content)
      user_id = current_user.id

      record = CannedReply::Reply.add(user_id, title, content)
      render json: record
    end

    def destroy
      reply_id = params.require(:id)
      user_id  = current_user.id
      record = CannedReply::Reply.remove(user_id, reply_id)
      render json: record
    end

    def reply
      reply_id = params.require(:id)
      user_id  = current_user.id

      record = CannedReply::Reply.get_reply(user_id, reply_id)
      render json: record
    end

    def update
      reply_id = params.require(:id)
      title   = params.require(:title)
      content = params.require(:content)
      user_id = current_user.id

      record = CannedReply::Reply.edit(user_id, reply_id, title, content)
      render json: record
    end

    def use
      reply_id = params.require(:id)
      user_id  = current_user.id
      record = CannedReply::Reply.use(user_id, reply_id)
      render json: record
    end

    def index
      user_id = current_user.id
      replies = CannedReply::Reply.all(user_id)
      render json: { replies: replies }
    end
  end

  require_dependency 'current_user'
  class CannedRepliesConstraint
    def matches?(request)
      provider = Discourse.current_user_provider.new(request.env)
      group_list = SiteSetting.canned_replies_groups.split("|")
      group_list.map!(&:downcase)
      provider.current_user &&
        (provider.current_user.staff? || provider.current_user.groups.any? { |group| group_list.include?(group.name.downcase) })
    rescue Discourse::InvalidAccess, Discourse::ReadOnly
      false
    end
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
    mount ::CannedReply::Engine, at: "/canned_replies", constraints: CannedRepliesConstraint.new
  end

end
