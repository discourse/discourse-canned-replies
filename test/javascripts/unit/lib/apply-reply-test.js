import EmberObject from "@ember/object";
import { discourseModule } from "discourse/tests/helpers/qunit-helpers";
import { prepareReply } from "discourse/plugins/discourse-canned-replies/lib/apply-reply";
import { test } from "qunit";

discourseModule(
  "Unit | Plugins | discourse-canned-replies | Lib | apply-reply",
  function () {
    test("prepareReply", function (assert) {
      const expectedVariables = {
        my_username: "heisenberg",
        my_name: "Walter White",
        original_poster_username: "mr_hide",
        original_poster_name: "Dr. Henry Jekyll",
        reply_to_username: "dracula",
        reply_to_name: "Vlad",
        last_poster_username: "frankenstein",
        reply_to_or_last_poster_username: "dracula",
      };

      const fakeModel = EmberObject.create({
        user: {
          username: expectedVariables.my_username,
          name: expectedVariables.my_name,
        },
        topic: {
          details: {
            created_by: {
              username: expectedVariables.original_poster_username,
              name: expectedVariables.original_poster_name,
            },
          },
          last_poster_username: expectedVariables.last_poster_username,
        },
        post: {
          username: expectedVariables.reply_to_username,
          name: expectedVariables.reply_to_name,
        },
      });

      Object.keys(expectedVariables).forEach((key) => {
        let template, expected, preparedReply;

        // simple replacement
        template = {
          replyTitle: `test title:%{${key}}`,
          replyContent: `test response:%{${key}}, %{${key}}, %{${key}}`,
        };
        expected = {
          replyTitle: `test title:${expectedVariables[key]}`,
          replyContent: `test response:${expectedVariables[key]}, ${expectedVariables[key]}, ${expectedVariables[key]}`,
        };

        preparedReply = prepareReply(
          template.replyTitle,
          template.replyContent,
          fakeModel
        );
        assert.strictEqual(
          preparedReply.replyTitle,
          expected.replyTitle,
          `%{${key}} simple replacement/title`
        );
        assert.strictEqual(
          preparedReply.replyContent,
          expected.replyContent,
          `%{${key}} simple replacement/content`
        );

        // replacement with fallback (variables defined)
        template = {
          replyTitle: `test title:%{${key},fallback:${key.toUpperCase()}}`,
          replyContent: `test response:%{${key},fallback:${key.toUpperCase()}}, %{${key},fallback:${key.toUpperCase()}}, %{${key},fallback:${key.toUpperCase()}}`,
        };

        preparedReply = prepareReply(
          template.replyTitle,
          template.replyContent,
          fakeModel
        );
        assert.strictEqual(
          preparedReply.replyTitle,
          expected.replyTitle,
          `%{${key}} replacement with fallback - variable defined/title`
        );
        assert.strictEqual(
          preparedReply.replyContent,
          expected.replyContent,
          `%{${key}} replacement with fallback - variable defined/content`
        );

        // replacement with fallback (variables undefined)
        expected = {
          replyTitle: `test title:${key.toUpperCase()}`,
          replyContent: `test response:${key.toUpperCase()}, ${key.toUpperCase()}, ${key.toUpperCase()}`,
        };

        preparedReply = prepareReply(
          template.replyTitle,
          template.replyContent,
          EmberObject.create()
        );
        assert.strictEqual(
          preparedReply.replyTitle,
          expected.replyTitle,
          `%{${key}} replacement with fallback - variable undefined/title`
        );
        assert.strictEqual(
          preparedReply.replyContent,
          expected.replyContent,
          `%{${key}} replacement with fallback - variable undefined/content`
        );
      });
    });
  }
);
