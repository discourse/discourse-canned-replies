# frozen_string_literal: true

module DiscourseCannedReplies
  module TopicQueryExtension
    def list_canned_replies()
      create_list(:canned_replies, { category: SiteSetting.canned_replies_category.to_i }) do |topics|
        topics
          .all
          .includes(:first_post)
          .includes(:canned_reply_usage)
          .where(visible: true, archived: false) # filter out archived or unlisted topics
          .where("categories.topic_id <> topics.id") # filter out the category description topic
          .reorder("topics.title ASC")
      end
    end
  end
end
