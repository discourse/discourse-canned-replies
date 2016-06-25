# name: discourse-template-manager
# about: Add templates through the composer
# version: 0.1
# authors: Jay Pfaffman
# url: https://courses.literatecomputing.com

enabled_site_setting :template_manager_enabled

register_asset "javascripts/discourse/templates/canned-replies.hbs"

register_asset 'stylesheets/canned-replies.scss'

PLUGIN_NAME ||= "canned_replies".freeze
STORE_NAME ||= "replies".freeze

after_initialize do

  module ::CannedReply
    class Engine < ::Rails::Engine
      engine_name PLUGIN_NAME
      isolate_namespace CannedReply
    end
  end

  class CannedReply::Reply
    class << self

      def add(user_id, title, content)
        ensureStaff user_id

        # TODO add i18n string
        raise StandardError.new "poll.no_polls_associated_with_this_post" if title.blank?
        raise StandardError.new "poll.no_poll_with_this_name" if content.blank?

        id = SecureRandom.hex(16)
        record = {id: id, title: title, content: content}

        replies = PluginStore.get(PLUGIN_NAME, STORE_NAME)
        replies = Hash.new if replies == nil

        replies[id] = record
        PluginStore.set(PLUGIN_NAME, STORE_NAME, replies)

        record
      end

      def edit(user_id, reply_id, title, content)
        ensureStaff user_id

        # TODO add i18n string
        raise StandardError.new "poll.no_polls_associated_with_this_post" if title.blank?
        raise StandardError.new "poll.no_poll_with_this_name" if content.blank?

        record = {id: reply_id, title: title, content: content}
        remove(user_id, reply_id)

        replies = PluginStore.get(PLUGIN_NAME, STORE_NAME)
        replies = Hash.new if replies == nil

        replies[reply_id] = record
        PluginStore.set(PLUGIN_NAME, STORE_NAME, replies)

        record
      end

      def all (user_id)
        # ensureStaff user_id
        PluginStore.get(PLUGIN_NAME, STORE_NAME)
      end

      def get_reply(user_id, reply_id)
        ensureStaff user_id

        replies = PluginStore.get(PLUGIN_NAME, STORE_NAME)
        replies[reply_id]
      end

      def remove(user_id, reply_id)
        ensureStaff user_id

        replies = PluginStore.get(PLUGIN_NAME, STORE_NAME)
        replies.delete reply_id
        PluginStore.set(PLUGIN_NAME, STORE_NAME, replies)
      end

      def ensureStaff (user_id)
        user = User.find_by(id: user_id)

        unless user.try(:staff?)
          # TODO add i18n string // #I18n.t("poll.only_staff_or_op_can_toggle_status")
          raise StandardError.new "poll.only_staff_or_op_can_toggle_status"
        end
      end
    end
  end

  require_dependency "application_controller"

  class CannedReply::CannedrepliesController < ::ApplicationController
    requires_plugin PLUGIN_NAME

    before_filter :ensure_logged_in

    def create
      title   = params.require(:title)
      content = params.require(:content)
      user_id  = current_user.id

      begin
        record = CannedReply::Reply.add(user_id, title, content)
        render json: record
      rescue StandardError => e
        render_json_error e.message
      end
    end

    def remove
      reply_id = params.require(:reply_id)
      user_id  = current_user.id

      begin
        record = CannedReply::Reply.remove(user_id, reply_id)
        render json: record
      rescue StandardError => e
        render_json_error e.message
      end
    end

    def reply
      reply_id = params.require(:reply_id)
      user_id  = current_user.id

      begin
        record = CannedReply::Reply.get_reply(user_id, reply_id)
        render json: record
      rescue StandardError => e
        render_json_error e.message
      end
    end

    def update
      reply_id = params.require(:reply_id)
      title   = params.require(:title)
      content = params.require(:content)
      user_id  = current_user.id

      begin
        record = CannedReply::Reply.edit(user_id, reply_id, title, content)
        render json: record
      rescue StandardError => e
        render_json_error e.message
      end
    end

    def index
      user_id  = current_user.id

      begin
        replies = CannedReply::Reply.all(user_id)
        puts replies
        render json: {replies: replies}
      rescue StandardError => e
        render_json_error e.message
      end
    end
  end

  CannedReply::Engine.routes.draw do
    get "/" => "cannedreplies#index"
    post "/" => "cannedreplies#create"

    get "/reply" => "cannedreplies#reply"
    delete "/reply" => "cannedreplies#remove"
    post "/reply" => "cannedreplies#update"
  end

  Discourse::Application.routes.append do
    mount ::CannedReply::Engine, at: "/cannedreplies"
  end

end