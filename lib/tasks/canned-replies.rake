# frozen_string_literal: true

def create_category
  old_settings_canned_replies_groups =
    SiteSetting.find_by(name: 'canned_replies_groups')&.value || ''
  old_settings_canned_replies_everyone_enabled =
    SiteSetting
      .find_by(name: 'canned_replies_everyone_enabled')
      &.value
      &.starts_with?('topic') || false
  old_settings_canned_replies_everyone_can_edit =
    SiteSetting
      .find_by(name: 'canned_replies_everyone_can_edit')
      &.value
      &.starts_with?('topic') || false

  category = nil

  I18n.with_locale(SiteSetting.default_locale) do
    category =
      Category.new(
        name: I18n.t('default_category.name')[0...50], # category names are limited to 50 chars in discourse
        description: I18n.t('default_category.description'),
        user: Discourse.system_user,
        all_topics_wiki: true
      )
  end

  permissions = { staff: :full } # staff is always allowed to use and edit canned replies

  # get the existing groups and compares with the groups allowed to used canned replies
  # using the same algorithm that the plugin used to ensure that the same groups are authorized
  # if they are available
  groups = Group.all

  granted_group_list =
    old_settings_canned_replies_groups.split('|').map(&:downcase)

  groups
    .select { |group| granted_group_list.include?(group.name.downcase) }
    .each { |group| permissions.merge!({ group.name => :full }) }

  # insert privileges (or not) for everyone to use and edit canned replies
  # based on the two setting available
  if old_settings_canned_replies_everyone_enabled
    permissions.merge!(
      {
        everyone:
          old_settings_canned_replies_everyone_can_edit ? :full : :readonly
      }
    )
  end

  category.set_permissions(permissions)

  raise <<~ERROR unless category.save!
    ****************************
    ERROR while creating the existing_category to store the canned replies: #{category.errors.full_messages}

    If you can'topic fix the reason of the error, you can create a existing_category manually
    to store the canned replies and define it in Settings.canned_replies_category. 
    Then proceed with this migration.
  ERROR

  puts "Created category #{category.name}(id: #{category.id}) to store the canned replies"

  category
end

def create_topic_from_v1_reply(reply, category)
  topic =
    Topic.new(
      title: reply[:title],
      user: Discourse.system_user,
      category_id: category.id
    )
  topic.custom_fields = { DiscourseCannedReplies::PLUGIN_NAME => reply[:id] }
  topic.skip_callbacks = true

  unless topic.save!(validate: false)
    raise "ERROR importing #{reply[:id]}: #{reply[:title]} - #{errors.full_messages}"
  end

  post =
    topic.posts.build(
      raw: reply[:content],
      user: Discourse.system_user,
      wiki: true
    )
  unless post.save!(validate: false)
    raise "ERROR importing #{reply[:id]}: #{reply[:title]} - #{errors.full_messages}"
  end

  usage_count =
    DiscourseCannedReplies::UsageCount.new(
      topic_id: topic.id,
      usage_count: reply[:usages] || 0
    )
  usage_count.save

  topic
end

desc 'Migrate data from canned replies v1 to v2'
task 'canned-replies:migrate-to-v2' => [:environment] do |_, args|
  puts 'Migrating canned replies from v1 to v2'

  begin
    ActiveRecord::Base.transaction do
      category =
        if SiteSetting.canned_replies_category.blank?
          new_category = create_category
          SiteSetting.canned_replies_category = new_category.id

          new_category
        else
          existing_category =
            Category.find_by(id: SiteSetting.canned_replies_category.to_i)

          if existing_category.blank?
            raise 'Category specified not found. Check Settings.canned_replies_category'
          end

          puts '',
               '****************************',
               "Using existing_category #{existing_category.name}(id: #{existing_category.id}) defined in ",
               'Settings.canned_replies_category',
               'Please note that access to canned replies will follow this existing_category security settings',
               '****************************',
               ''

          existing_category
        end

      STORE_NAME = 'replies'
      replies_v1 =
        PluginStore.get(DiscourseCannedReplies::PLUGIN_NAME, STORE_NAME)

      count = replies_v1&.size || 0
      if count == 0
        puts 'no canned replies from v1 were located to be migrated to v2'
      end

      # duplicate topic titles must be temporarily enabled to ensure that all
      # canned replies can be imported since there is no guarantee that a previous
      # topic does not exist with the same title
      allow_duplicate_topic_titles = SiteSetting.allow_duplicate_topic_titles

      SiteSetting.allow_duplicate_topic_titles = true

      (replies_v1 || {}).each_with_index do |(_, reply), index|
        position = index + 1

        # search if a previous topic was already imported from this canned reply
        existing_topic =
          TopicCustomField.find_by(
            name: DiscourseCannedReplies::PLUGIN_NAME,
            value: reply[:id]
          )

        if existing_topic.blank?
          topic = create_topic_from_v1_reply(reply, category)

          puts "[#{position}/#{count}] canned reply #{reply[:id]}: #{reply[:title]} imported to topic #{topic.id}"
        else
          puts "[#{position}/#{count}] skipping #{reply[:title]}. Topic previously imported found!"
        end
      end

      # restores the setting to the previous value after importing the topics
      SiteSetting.allow_duplicate_topic_titles = allow_duplicate_topic_titles
    end
    puts '', 'Canned replies migration finished!'
  rescue StandardError => e
    puts e.to_s
    puts 'Transaction aborted! All changes were rolled back!'
  end
end

desc 'Purge old data from canned replies v1'
task 'canned-replies:purge-old-v1-data' => [:environment] do |_, args|
  puts 'Removing canned replies data from v1'

  begin
    ActiveRecord::Base.transaction do
      DB.exec <<~SQL
        DELETE FROM site_settings 
        WHERE name IN (
          'canned_replies_groups', 
          'canned_replies_everyone_enabled', 
          'canned_replies_everyone_can_edit'
        )
      SQL

      STORE_NAME = 'replies'
      old_replies =
        PluginStoreRow.find_by(
          plugin_name: DiscourseCannedReplies::PLUGIN_NAME,
          key: STORE_NAME
        )
      old_replies.destroy!

      puts 'Finished!'
    rescue StandardError => e
      puts e.to_s
      puts 'Transaction aborted! All changes were rolled back!'
    end
  end
end
