import { acceptance } from "helpers/qunit-helpers";

acceptance("Canned Replies", {
  loggedIn: true,
  settings: { canned_replies_enabled: true },
  setup() {
    const response = object => {
      return [
        200,
        { "Content-Type": "application/json" },
        object
      ];
    };

    server.patch('/canned_replies/cd6680d7a04caaac1274e6f37429458c/use', () => {
      return response({});
    });

    server.patch('/canned_replies/cd6680d7a04caaac1274e6f37429458c', () => {
      return response({});
    });

    server.post('/canned_replies', () => {
      return response({});
    });

    server.get('/canned_replies', () => {
      return response({
        "replies": [
          {
            "id": "1a1987620aa49135344abe65eb43302d",
            "title": "Testing",
            "content": "<script>alert('ahah')</script>",
            "usages": 1
          },
          {
            "id": "5317b7fd066d3d4c15acde92d70f0377",
            "title": "This is a test",
            "content": "Testing testin **123**",
            "usages": 1
          },
          {
            "id": "cd6680d7a04caaac1274e6f37429458c",
            "title": "My first canned reply",
            "content": "This is an example canned reply.\nYou can user **markdown** to style your replies. Click the **new** button to create new replies or the **edit** button to edit or remove an existing canned reply.\n\n*This canned reply will be added when the replies list is empty.*"
          }
        ]
      });
    });
  }
});

test("Inserting canned replies", () => {
  visit("/");

  click('#create-topic');
  click('button.options');
  click('.popup-menu .fa-clipboard');

  andThen(() => {
    equal(find(".canned-replies-apply").length, 0, 'it should not display the apply button');
    equal(find(".canned-replies-edit").length, 0, 'it should not display the apply button');
  });

  fillIn('.reply-selector #canned-replies-combobox', 'cd6680d7a04caaac1274e6f37429458c');

  andThen(() => {
    ok(
      find('.details .content')[0].innerHTML.includes("<strong>markdown</strong>"),
      'it should display the right cooked content'
    );
  });


  click('.canned-replies-apply');

  andThen(() => {
    ok(
      find(".d-editor-input").val().includes("This is an example canned reply."),
      'it should contain the right selected output'
    );
  });
});

test("Editing a canned reply", () => {
  visit("/");

  click('#create-topic');
  click('button.options');
  click('.popup-menu .fa-clipboard');
  fillIn('.reply-selector #canned-replies-combobox', 'cd6680d7a04caaac1274e6f37429458c');
  click('.canned-replies-edit');

  fillIn('.canned-replies-form-title-input', 'Some title');
  fillIn('.canned-replies-form-content-input textarea', 'Some content');

  click('.edit-reply-save-btn');

  andThen(() => {
    equal(find('.canned-replies-footer span').text(), I18n.t('saved'));
  });
});

test("Creating a new canned reply", () => {
  visit("/");

  click('#create-topic');
  click('button.options');
  click('.popup-menu .fa-clipboard');
  click('.canned-replies-new');

  andThen(() => {
    equal(
      find('.btn.new-reply-save-btn[disabled]').length,
      1,
      'save button should be disabled by default'
    );
  });

  fillIn('.canned-replies-form-title-input', 'Some title');

  andThen(() => {
    equal(
      find('.btn.new-reply-save-btn[disabled]').length,
      1,
      'save button should be disabled when content is blank'
    );
  });

  fillIn('.canned-replies-form-content-input textarea', 'Some content');
  click('.new-reply-save-btn');

  andThen(() => {
    equal(
      find('.reply-selector #canned-replies-combobox').length,
      1,
      'it should return the user to canned replies selection page'
    )
  });
});
