# frozen_string_literal: true

module DiscourseCannedReplies
  class CannedRepliesController < ::ApplicationController
    requires_plugin PLUGIN_NAME

    before_action :ensure_logged_in
    before_action :ensure_canned_replies_enabled
    skip_before_action :check_xhr

    def ensure_canned_replies_enabled
      raise Discourse::InvalidAccess.new unless guardian.can_use_canned_replies?
    end

    def use
      reply_id = params.require(:id)
      topic = Topic.find_by(id: reply_id)

      if topic.blank?
        return render_json_error('Invalid canned reply id', status: 422)
      end

      canned_replies_category = SiteSetting.canned_replies_category.to_i
      subcategory_ids = Category.subcategory_ids(canned_replies_category)

      unless topic.category_id == canned_replies_category ||
               subcategory_ids.include?(topic.category_id)
        return(
          render_json_error('Id does not belong to a canned reply', status: 422)
        )
      end

      record = topic.increment_canned_reply_usage_count!

      render json: record
    end

    def index
      query = TopicQuery.new(current_user).list_canned_replies
      replies = query.topics

      render json: replies, each_serializer: CannedRepliesSerializer
    end
  end
end
