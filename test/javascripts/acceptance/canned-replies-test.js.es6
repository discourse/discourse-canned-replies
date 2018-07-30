import { acceptance } from "helpers/qunit-helpers";
import { clearPopupMenuOptionsCallback } from "discourse/controllers/composer";

acceptance("Canned Replies", {
  loggedIn: true,
  settings: { canned_replies_enabled: true },
  pretend(server, helper) {
    server.patch("/canned_replies/cd6680d7a04caaac1274e6f37429458c/use", () => {
      return helper.response({});
    });
    server.patch("/canned_replies/cd6680d7a04caaac1274e6f37429458c", () => {
      return helper.response({});
    });
    server.post("/canned_replies", () => {
      return helper.response({});
    });
    server.get("/canned_replies", () => {
      return helper.response({
        replies: [
          {
            id: "cd6680d7a04caaac1274e6f37429458c",
            title: "My first canned reply",
            excerpt: "This is an example canned reply",
            content:
              "This is an example canned reply.\nYou can user **markdown** to style your replies. Click the **new** button to create new replies or the **edit** button to edit or remove an existing canned reply.\n\n*This canned reply will be added when the replies list is empty.*"
          },
          {
            id: "1a1987620aa49135344abe65eb43302d",
            title: "Testing",
            excerpt: "",
            content: "<script>alert('ahah')</script>",
            usages: 1
          },
          {
            id: "5317b7fd066d3d4c15acde92d70f0377",
            title: "This is a test",
            excerpt: "Testing",
            content: "Testing testin **123**",
            usages: 1
          }
        ]
      });
    });
  },
  beforeEach() {
    clearPopupMenuOptionsCallback();
  }
});

QUnit.test("Inserting canned replies", async assert => {
  const popUpMenu = selectKit(".toolbar-popup-menu-options");

  await visit("/");

  await click("#create-topic");
  await popUpMenu.expand();
  await popUpMenu.selectRowByValue("showCannedRepliesButton");

  await click(".canned-reply-title");

  assert.ok(
    find(".canned-replies-content")
      .html()
      .indexOf("<strong>markdown</strong>") !== -1,
    "it should display the right cooked content"
  );

  await click(".canned-replies-apply");

  assert.ok(
    find(".d-editor-input")
      .val()
      .indexOf("This is an example canned reply.") !== -1,
    "it should contain the right selected output"
  );
});

QUnit.test("Editing a canned reply", async assert => {
  const popUpMenu = selectKit(".toolbar-popup-menu-options");

  await visit("/");

  await click("#create-topic");
  await popUpMenu.expand();
  await popUpMenu.selectRowByValue("showCannedRepliesButton");

  await click(".canned-replies-edit");

  await fillIn(".canned-replies-form-title-input", "Some title");
  await fillIn(".canned-replies-form-content-input textarea", "Some content");

  await click(".edit-reply-save-btn");

  assert.equal(find(".canned-replies-footer .msg").text(), I18n.t("saved"));
});

QUnit.test("Creating a new canned reply", async assert => {
  const popUpMenu = selectKit(".toolbar-popup-menu-options");

  await visit("/");

  await click("#create-topic");
  await popUpMenu.expand();
  await popUpMenu.selectRowByValue("showCannedRepliesButton");

  await click(".canned-replies-new");

  await fillIn(".canned-replies-form-title-input", "");
  await fillIn(".canned-replies-form-content-input textarea", "");

  assert.equal(
    find(".btn.new-reply-save-btn[disabled]").length,
    1,
    "save button should be disabled by default"
  );

  await fillIn(".canned-replies-form-title-input", "Some title");

  assert.equal(
    find(".btn.new-reply-save-btn[disabled]").length,
    1,
    "save button should be disabled when content is blank"
  );

  await fillIn(".canned-replies-form-content-input textarea", "Some content");
  await click(".new-reply-save-btn");
});
