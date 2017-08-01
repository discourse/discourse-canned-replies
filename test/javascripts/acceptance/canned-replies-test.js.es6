import { acceptance } from "helpers/qunit-helpers";

acceptance("Canned Replies", {
  loggedIn: true,
  settings: { canned_replies_enabled: true },
  beforeEach() {
    const response = object => {
      return [
        200,
        { "Content-Type": "application/json" },
        object
      ];
    };

    server.patch('/canned_replies/cd6680d7a04caaac1274e6f37429458c/use', () => { // eslint-disable-line no-undef
      return response({});
    });

    server.patch('/canned_replies/cd6680d7a04caaac1274e6f37429458c', () => { // eslint-disable-line no-undef
      return response({});
    });

    server.post('/canned_replies', () => { // eslint-disable-line no-undef
      return response({});
    });

    server.get('/canned_replies', () => { // eslint-disable-line no-undef
      return response({
        "replies": [
          {
            "id": "cd6680d7a04caaac1274e6f37429458c",
            "title": "My first canned reply",
            "excerpt": "This is an example canned reply",
            "content": "This is an example canned reply.\nYou can user **markdown** to style your replies. Click the **new** button to create new replies or the **edit** button to edit or remove an existing canned reply.\n\n*This canned reply will be added when the replies list is empty.*"
          },
          {
            "id": "1a1987620aa49135344abe65eb43302d",
            "title": "Testing",
            "excerpt": "",
            "content": "<script>alert('ahah')</script>",
            "usages": 1
          },
          {
            "id": "5317b7fd066d3d4c15acde92d70f0377",
            "title": "This is a test",
            "excerpt": "Testing",
            "content": "Testing testin **123**",
            "usages": 1
          }
        ]
      });
    });
  }
});

QUnit.test("Inserting canned replies", assert => {
  visit("/");

  click('#create-topic');
  click('button.options');
  click('.popup-menu .fa-clipboard');

  andThen(() => {
    click('.canned-replies-toggle-content');
  });

  andThen(() => {
    assert.ok(
      find('.canned-replies-content').html().indexOf("<strong>markdown</strong>") !== -1,
      'it should display the right cooked content'
    );
  });

  click('.canned-replies-apply');

  andThen(() => {
    assert.ok(
      find(".d-editor-input").val().indexOf("This is an example canned reply.") !== -1,
      'it should contain the right selected output'
    );
  });
});

QUnit.test("Editing a canned reply", assert => {
  visit("/");

  click('#create-topic');
  click('button.options');
  click('.popup-menu .fa-clipboard');

  andThen(() => {
    click('.canned-replies-edit');
  });

  fillIn('.canned-replies-form-title-input', 'Some title');
  fillIn('.canned-replies-form-content-input textarea', 'Some content');

  andThen(() => {
    click('.edit-reply-save-btn');
  });

  andThen(() => {
    assert.equal(find('.canned-replies-footer .msg').text(), I18n.t('saved'));
  });
});

QUnit.test("Creating a new canned reply", assert => {
  visit("/");

  click('#create-topic');
  click('button.options');
  click('.popup-menu .fa-clipboard');

  andThen(() => {
    click('.canned-replies-new');
  });

  andThen(() => {
    fillIn('.canned-replies-form-title-input', '');
    fillIn('.canned-replies-form-content-input textarea', '');
  });

  andThen(() => {
    assert.equal(
      find('.btn.new-reply-save-btn[disabled]').length,
      1,
      'save button should be disabled by default'
    );
  });

  fillIn('.canned-replies-form-title-input', 'Some title');

  andThen(() => {
    assert.equal(
      find('.btn.new-reply-save-btn[disabled]').length,
      1,
      'save button should be disabled when content is blank'
    );
  });

  fillIn('.canned-replies-form-content-input textarea', 'Some content');
  click('.new-reply-save-btn');
});
