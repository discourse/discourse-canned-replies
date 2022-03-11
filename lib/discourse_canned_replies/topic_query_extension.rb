# frozen_string_literal: true

module DiscourseCannedReplies::TopicQueryExtension
  def list_canned_replies
    raise Discourse::SiteSettingMissing.new("canned_replies_category") if SiteSetting.canned_replies_category.blank?

    create_list(:canned_replies, { category: SiteSetting.canned_replies_category.to_i, per_page: 999999 }) do |topics|
      topics
        .all
        .includes(:first_post)
        .includes(:canned_reply_usage)
        .where(visible: true, archived: false) # filter out archived or unlisted topics
        .where("categories.topic_id IS DISTINCT FROM topics.id") # filter out the category description topic
        .reorder("topics.title ASC")
    end
  end
end
