# frozen_string_literal: true

module DiscourseCannedReplies::UserExtension
  def can_use_canned_replies?
    return false if SiteSetting.canned_replies_category.blank?

    category = Category.find_by(id: SiteSetting.canned_replies_category.to_i)
    return false if category.blank?

    # the user can use canned replies if can see in the source category
    guardian.can_see?(category)
  end
end
