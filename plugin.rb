# name: Canned Replies
# about: Add canned replies through the composer
# version: 1.1
# authors: Jay Pfaffman and André Pereira
# url: https://github.com/discourse/discourse-canned-replies

enabled_site_setting :canned_replies_enabled

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
        raise StandardError.new "replies.missing_title" if title.blank?
        raise StandardError.new "replies.missing_content" if content.blank?

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
        raise StandardError.new "replies.missing_title" if title.blank?
        raise StandardError.new "replies.missing_content" if content.blank?
        raise StandardError.new "replies.missing_reply" if reply_id.blank?

        record = {id: reply_id, title: title, content: content}
        remove(user_id, reply_id)

        replies = PluginStore.get(PLUGIN_NAME, STORE_NAME)
        replies = Hash.new if replies == nil

        replies[reply_id] = record
        PluginStore.set(PLUGIN_NAME, STORE_NAME, replies)

        record
      end

      def all (user_id)
        ensureStaff user_id
        replies = PluginStore.get(PLUGIN_NAME, STORE_NAME)

        if replies.blank?
          add_default_reply
          replies = PluginStore.get(PLUGIN_NAME, STORE_NAME)
        end

        return {} if replies.blank?

        replies.each do |id, value|
          value['cooked'] = PrettyText.cook(value['content'])
          value['usages'] = 0 unless value.key?('usages')
          replies[id] = value
        end
        #sort by usages
        replies =  replies.sort_by {|key, value| value['usages']}.reverse.to_h
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

      def use(user_id, reply_id)
        ensureStaff user_id

        replies = PluginStore.get(PLUGIN_NAME, STORE_NAME)
        reply = replies[reply_id]
        usages = 0
        usages = reply['usages'] if reply.key?('usages')
        usages += 1
        reply['usages'] = usages
        replies[reply_id] = reply
        PluginStore.set(PLUGIN_NAME, STORE_NAME, replies)
      end

      def add_default_reply()
        add(1, 'My first canned reply', %q{This is an example canned reply.
You can user **markdown** to style your replies. Click the **new** button to create new replies or the **edit** button to edit or remove an existing canned reply.

*This canned reply will be added when the replies list is empty.*})
      end

      def ensureStaff (user_id)
        user = User.find_by(id: user_id)

        unless user.try(:staff?)
          raise StandardError.new "replies.must_be_staff"
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

    def use
      reply_id = params.require(:reply_id)
      user_id  = current_user.id

      begin
        record = CannedReply::Reply.use(user_id, reply_id)
        render json: record
      rescue StandardError => e
        render_json_error e.message
      end
    end

    def index
      user_id  = current_user.id

      begin
        replies = CannedReply::Reply.all(user_id)
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
    put "/reply" => "cannedreplies#use"
  end

  Discourse::Application.routes.append do
    mount ::CannedReply::Engine, at: "/cannedreplies"
  end

end
