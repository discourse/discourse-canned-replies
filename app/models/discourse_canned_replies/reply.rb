# frozen_string_literal: true

module DiscourseCannedReplies
  class Reply
    def self.add(user_id, title, content)
      id = SecureRandom.hex(16)
      record = { id: id, title: title, content: content }

      replies =
        PluginStore.get(DiscourseCannedReplies::PLUGIN_NAME, DiscourseCannedReplies::STORE_NAME) ||
          {}

      replies[id] = record
      PluginStore.set(
        DiscourseCannedReplies::PLUGIN_NAME,
        DiscourseCannedReplies::STORE_NAME,
        replies,
      )

      record
    end

    def self.edit(user_id, reply_id, title, content)
      record = { id: reply_id, title: title, content: content }
      remove(user_id, reply_id)

      replies =
        PluginStore.get(DiscourseCannedReplies::PLUGIN_NAME, DiscourseCannedReplies::STORE_NAME) ||
          {}

      replies[reply_id] = record
      PluginStore.set(
        DiscourseCannedReplies::PLUGIN_NAME,
        DiscourseCannedReplies::STORE_NAME,
        replies,
      )

      record
    end

    def self.all(user_id)
      replies =
        PluginStore.get(DiscourseCannedReplies::PLUGIN_NAME, DiscourseCannedReplies::STORE_NAME)

      if replies.blank?
        add_default_reply
        replies =
          PluginStore.get(DiscourseCannedReplies::PLUGIN_NAME, DiscourseCannedReplies::STORE_NAME)
      end

      return [] if replies.blank?
      replies.values.sort_by { |reply| reply["title"] || "" }
    end

    def self.get_reply(user_id, reply_id)
      replies = all(user_id)

      replies.detect { |reply| reply["id"] == reply_id }
    end

    def self.remove(user_id, reply_id)
      replies =
        PluginStore.get(DiscourseCannedReplies::PLUGIN_NAME, DiscourseCannedReplies::STORE_NAME)
      replies.delete(reply_id)
      PluginStore.set(
        DiscourseCannedReplies::PLUGIN_NAME,
        DiscourseCannedReplies::STORE_NAME,
        replies,
      )
    end

    def self.use(user_id, reply_id)
      replies =
        PluginStore.get(DiscourseCannedReplies::PLUGIN_NAME, DiscourseCannedReplies::STORE_NAME)
      reply = replies[reply_id]
      reply["usages"] ||= 0
      reply["usages"] += 1
      replies[reply_id] = reply
      PluginStore.set(
        DiscourseCannedReplies::PLUGIN_NAME,
        DiscourseCannedReplies::STORE_NAME,
        replies,
      )
    end

    def self.add_default_reply()
      add(1, I18n.t("replies.default_reply.title"), I18n.t("replies.default_reply.body"))
    end
  end
end
