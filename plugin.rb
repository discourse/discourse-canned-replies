# frozen_string_literal: true

# name: discourse-canned-replies
# about: Add canned replies through the composer
# version: 1.2
# authors: Jay Pfaffman and André Pereira
# url: https://github.com/discourse/discourse-canned-replies
# transpile_js: true

enabled_site_setting :canned_replies_enabled

register_asset "stylesheets/canned-replies.scss"

register_svg_icon "far-clipboard" if respond_to?(:register_svg_icon)

module ::DiscourseCannedReplies
  PLUGIN_NAME = "discourse-canned-replies"
  STORE_NAME = "replies"
end

require_relative "lib/discourse_canned_replies/engine"

after_initialize do
  AdminDashboardData.add_problem_check do
    "The discourse-canned-replies plugin is no longer supported. Please <a href='https://meta.discourse.org/t/discourse-templates/229250'>migrate to the new discourse-templates plugin</a> and uninstall discourse-canned-replies."
  end

  require_relative "app/jobs/onceoff/rename_canned_replies.rb"

  add_to_class(:user, :can_edit_canned_replies?) do
    return true if staff?
    return true if SiteSetting.canned_replies_everyone_can_edit
    group_list = SiteSetting.canned_replies_groups.split("|").map(&:downcase)
    groups.any? { |group| group_list.include?(group.name.downcase) }
  end

  add_to_class(:user, :can_use_canned_replies?) do
    return true if staff?
    return true if SiteSetting.canned_replies_everyone_enabled
    group_list = SiteSetting.canned_replies_groups.split("|").map(&:downcase)
    groups.any? { |group| group_list.include?(group.name.downcase) }
  end

  add_to_class(:guardian, :can_edit_canned_replies?) { user && user.can_edit_canned_replies? }

  add_to_class(:guardian, :can_use_canned_replies?) { user && user.can_use_canned_replies? }

  add_to_serializer(:current_user, :can_use_canned_replies) { object.can_use_canned_replies? }

  add_to_serializer(:current_user, :can_edit_canned_replies) { object.can_edit_canned_replies? }
end
