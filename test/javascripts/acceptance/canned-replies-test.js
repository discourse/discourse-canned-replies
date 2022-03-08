import { click, fillIn, visit } from "@ember/test-helpers";
import { clearPopupMenuOptionsCallback } from "discourse/controllers/composer";
import { acceptance } from "discourse/tests/helpers/qunit-helpers";
import selectKit from "discourse/tests/helpers/select-kit-helper";
import { test } from "qunit";

acceptance("Canned Replies", function (needs) {
  needs.user({
    can_use_canned_replies: true,
    can_edit_canned_replies: true,
  });
  needs.settings({
    canned_replies_enabled: true,
  });
  needs.pretender((server, helper) => {
    server.patch("/canned_replies/cd6680d7a04caaac1274e6f37429458c/use", () => {
      return helper.response({});
    });
    server.patch("/canned_replies/cd6680d7a04caaac1274e6f37429458c", () => {
      return helper.response({});
    });
    server.patch("/canned_replies/ce5fc200ab90dd0d5ac597ca9bb4708b", () => {
      return helper.response({});
    });
    server.patch("/canned_replies/ce5fc200ab90dd0d5ac597ca9bb4708b/use", () => {
      return helper.response({});
    });
    server.patch("/canned_replies/04697870e02acfef3c2130dab92fe6d8", () => {
      return helper.response({});
    });
    server.patch("/canned_replies/04697870e02acfef3c2130dab92fe6d8/use", () => {
      return helper.response({});
    });
    server.post("/canned_replies", () => {
      return helper.response({});
    });
    server.get("/canned_replies", () => {
      return helper.response({
        replies: [
          {
            id: "ce5fc200ab90dd0d5ac597ca9bb4708b",
            title: "Small markdown example",
            excerpt: "markdown",
            content: "**markdown**",
          },
          {
            id: "cd6680d7a04caaac1274e6f37429458c",
            title: "My first canned reply",
            excerpt: "This is an example canned reply",
            content:
              "This is an example canned reply.\nYou can user **markdown** to style your replies. Click the **new** button to create new replies or the **edit** button to edit or remove an existing canned reply.\n\n*This canned reply will be added when the replies list is empty.*",
          },
          {
            id: "1a1987620aa49135344abe65eb43302d",
            title: "Testing",
            excerpt: "",
            content: "<script>alert('ahah')</script>",
            usages: 1,
          },
          {
            id: "5317b7fd066d3d4c15acde92d70f0377",
            title: "This is a test",
            excerpt: "Testing",
            content: "Testing testin **123**",
            usages: 1,
          },
          {
            id: "04697870e02acfef3c2130dab92fe6d8",
            title: "Using variables",
            excerpt:
              "Hi %{reply_to_username,fallback:there}, regards %{my_username}.",
            content:
              "Hi %{reply_to_username,fallback:there}, regards %{my_username}.",
          },
        ],
      });
    });
  });
  needs.hooks.beforeEach(() => clearPopupMenuOptionsCallback());

  test("Inserting canned replies", async (assert) => {
    await visit("/");

    await click("#create-topic");
    await fillIn(".d-editor-input", "beforeafter");

    const editorInput = $(".d-editor-input")[0];
    editorInput.selectionStart = editorInput.selectionEnd = "before".length;

    const popUpMenu = await selectKit(".toolbar-popup-menu-options");
    await popUpMenu.expand();
    await popUpMenu.selectRowByValue("showCannedRepliesButton");
    await click(".canned-reply-title");

    assert.ok(
      find(".canned-replies-content")
        .html()
        .indexOf("<strong>markdown</strong>") !== -1,
      "it should display the right cooked content"
    );

    await click(
      "#canned-reply-ce5fc200ab90dd0d5ac597ca9bb4708b .canned-replies-apply"
    );

    assert.equal(
      find(".d-editor-input").val(),
      "before\n\n**markdown**\n\nafter",
      "it should contain the right selected output"
    );
  });

  test("Replacing variables", async (assert) => {
    const popUpMenu = await selectKit(".toolbar-popup-menu-options");

    await visit("/");

    await click("#create-topic");
    await popUpMenu.expand();
    await popUpMenu.selectRowByValue("showCannedRepliesButton");

    await click(
      "#canned-reply-04697870e02acfef3c2130dab92fe6d8 .canned-replies-apply"
    );

    assert.equal(
      find(".d-editor-input").val().trim(),
      "Hi there, regards eviltrout.",
      "it should replace variables"
    );
  });

  test("Reset modal content", async (assert) => {
    const popUpMenu = await selectKit(".toolbar-popup-menu-options");

    await visit("/");

    await click("#create-topic");
    await popUpMenu.expand();
    await popUpMenu.selectRowByValue("showCannedRepliesButton");

    await click(".canned-replies-new");

    await fillIn(".canned-replies-form-title-input", "Some title");
    await fillIn(".canned-replies-form-content-input textarea", "Some content");

    await click(".modal-close");

    await click(".canned-replies-new");

    assert.equal(
      find(".canned-replies-form-title-input").val(),
      "",
      "it should clear title"
    );
    assert.equal(
      find(".canned-replies-form-content-input textarea").val(),
      "",
      "it should clear content"
    );
  });
});
