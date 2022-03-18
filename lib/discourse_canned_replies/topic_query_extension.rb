# frozen_string_literal: true

module DiscourseCannedReplies::TopicQueryExtension
  def list_canned_replies
    if SiteSetting.canned_replies_category.blank?
      raise Discourse::SiteSettingMissing.new('canned_replies_category')
    end

    create_list(
      :canned_replies,
      { category: SiteSetting.canned_replies_category.to_i, per_page: 999_999 }
    ) do |topics|
      topics.all.includes(:first_post).includes(:canned_reply_usage).where(
        visible: true,
        archived: false
      ) # filter out archived or unlisted topics
        .where('categories.topic_id IS DISTINCT FROM topics.id') # filter out the category description topic
        .reorder('topics.title ASC')
    end
  end
end
