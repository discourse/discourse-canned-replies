import { click, fillIn, visit } from "@ember/test-helpers";
import { clearPopupMenuOptionsCallback } from "discourse/controllers/composer";
import { acceptance, exists } from "discourse/tests/helpers/qunit-helpers";
import selectKit from "discourse/tests/helpers/select-kit-helper";
import { test } from "qunit";
import CannedRepliesFixtures from "../fixtures/canned-replies-fixtures";

function cannedRepliesPretender(server, helper) {
  const repliesPath = "/canned_replies";
  const replies = CannedRepliesFixtures[repliesPath];

  server.get(repliesPath, () => helper.response(replies));
  replies.canned_replies.forEach((reply) =>
    server.patch(`${repliesPath}/${reply.id}/use`, () => helper.response({}))
  );
}

acceptance("Canned Replies", function (needs) {
  needs.settings({
    canned_replies_enabled: true,
    tagging_enabled: true,
  });
  needs.user({
    can_use_canned_replies: true,
  });

  needs.pretender(cannedRepliesPretender);
  needs.hooks.beforeEach(() => clearPopupMenuOptionsCallback());

  test("Filtering by tags", async (assert) => {
    const popUpMenu = await selectKit(".toolbar-popup-menu-options");

    await visit("/");

    await click("#create-topic");
    await popUpMenu.expand();
    await popUpMenu.selectRowByValue("showCannedRepliesButton");

    const tagDropdown = selectKit(".canned-replies-filter-bar .tag-drop");
    await tagDropdown.expand();

    await tagDropdown.fillInFilter(
      "cupcake",
      ".canned-replies-filter-bar .tag-drop input"
    );
    assert.deepEqual(
      tagDropdown.displayedContent(),
      [
        {
          name: "cupcakes",
          id: "cupcakes",
        },
      ],
      "it should filter tags in the dropdown"
    );

    await tagDropdown.selectRowByIndex(0);
    assert.equal(
      document.querySelectorAll(".canned-replies-list .canned-reply").length,
      1,
      "it should filter replies by tag"
    );

    await click("#canned-reply-1 .canned-replies-apply");

    assert.equal(
      find(".d-editor-input").val().trim(),
      "Cupcake ipsum dolor sit amet cotton candy cheesecake jelly. Candy canes sugar plum soufflé sweet roll jelly-o danish jelly muffin. I love jelly-o powder topping carrot cake toffee.",
      "it should insert the canned reply in the composer"
    );
  });

  test("Filtering by text", async (assert) => {
    const popUpMenu = await selectKit(".toolbar-popup-menu-options");

    await visit("/");

    await click("#create-topic");
    await popUpMenu.expand();
    await popUpMenu.selectRowByValue("showCannedRepliesButton");

    await fillIn(
      ".canned-replies-filter-bar input.canned-replies-filter",
      "test"
    );
    assert.equal(
      document.querySelectorAll(".canned-replies-list .canned-reply").length,
      2,
      "it should filter by text"
    );

    await click("#canned-reply-8 .canned-replies-apply");

    assert.equal(
      find(".d-editor-input").val().trim(),
      "Testing testin **123**",
      "it should insert the canned reply in the composer"
    );
  });

  test("Replacing variables", async (assert) => {
    const popUpMenu = await selectKit(".toolbar-popup-menu-options");

    await visit("/");

    await click("#create-topic");
    await popUpMenu.expand();
    await popUpMenu.selectRowByValue("showCannedRepliesButton");

    await click("#canned-reply-9 .canned-replies-apply");

    assert.equal(
      find(".d-editor-input").val().trim(),
      "Hi there, regards eviltrout.",
      "it should replace variables"
    );
  });
});

acceptance("Canned Replies with tags disabled in Settings", function (needs) {
  needs.settings({
    canned_replies_enabled: true,
    tagging_enabled: false,
  });
  needs.user({
    can_use_canned_replies: true,
  });

  needs.pretender(cannedRepliesPretender);
  needs.hooks.beforeEach(() => clearPopupMenuOptionsCallback());

  test("Filtering by tags", async (assert) => {
    const popUpMenu = await selectKit(".toolbar-popup-menu-options");

    await visit("/");

    await click("#create-topic");
    await popUpMenu.expand();
    await popUpMenu.selectRowByValue("showCannedRepliesButton");

    assert.ok(
      !exists(".canned-replies-filter-bar .tag-drop"),
      "tag drop down is not displayed"
    );
  });
});
