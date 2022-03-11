# frozen_string_literal: true

module DiscourseCannedReplies::GuardianExtension
  def can_use_canned_replies?
    user&.can_use_canned_replies? || false
  end
end
