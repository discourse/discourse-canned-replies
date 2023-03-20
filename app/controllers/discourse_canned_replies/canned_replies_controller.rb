# frozen_string_literal: true

module ::DiscourseCannedReplies
  class CannedRepliesController < ::ApplicationController
    requires_plugin DiscourseCannedReplies::PLUGIN_NAME
    before_action :ensure_logged_in
    before_action :ensure_canned_replies_enabled
    skip_before_action :check_xhr

    def index
      user_id = current_user.id
      replies = DiscourseCannedReplies::Reply.all(user_id)

      render json: { replies: replies }
    end

    def create
      guardian.ensure_can_edit_canned_replies!

      title = params.require(:title)
      content = params.require(:content)
      user_id = current_user.id

      record = DiscourseCannedReplies::Reply.add(user_id, title, content)
      render json: record
    end

    def update
      guardian.ensure_can_edit_canned_replies!

      reply_id = params.require(:id)
      title = params.require(:title)
      content = params.require(:content)
      user_id = current_user.id

      record = DiscourseCannedReplies::Reply.edit(user_id, reply_id, title, content)
      render json: record
    end

    def destroy
      guardian.ensure_can_edit_canned_replies!

      reply_id = params.require(:id)
      user_id = current_user.id
      record = DiscourseCannedReplies::Reply.remove(user_id, reply_id)

      render json: record
    end

    def reply
      reply_id = params.require(:id)
      user_id = current_user.id

      record = DiscourseCannedReplies::Reply.get_reply(user_id, reply_id)
      render json: record
    end

    def use
      reply_id = params.require(:id)
      user_id = current_user.id
      record = DiscourseCannedReplies::Reply.use(user_id, reply_id)

      render json: record
    end

    private

    def ensure_canned_replies_enabled
      guardian.ensure_can_use_canned_replies!
    end
  end
end
