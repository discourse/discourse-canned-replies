# frozen_string_literal: true

module DiscourseCannedReplies::TopicQueryExtension
  def list_canned_replies
    if SiteSetting.canned_replies_category.blank?
      raise Discourse::SiteSettingMissing.new('canned_replies_category')
    end

    create_list(
      :canned_replies,
      {
        category: SiteSetting.canned_replies_category.to_i,
        # limit defined in a hidden setting with a sane default value (1000) that should be enough to fetch all
        # canned replies at once in most cases, but it still small enough to prevent things to blow up if the user
        # selected the wrong category in settings with thousands and thousands of posts
        per_page: SiteSetting.canned_replies_max_replies_fetched.to_i
      }
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
