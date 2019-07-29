const slack_bot_event = require("../lib/slack_bot_event");
const psycher_secret = require("../lib/psycher_secret");

test("properties", () => {
  const secret = psycher_secret.init({
    slack: {
      bot_token: "SLACK_BOT_TOKEN",
    },
    gitlab: {
      user_id: "GITLAB_USER_ID",
      release_targets: {},
      trigger_tokens: {},
    },
  });

  expect(secret.slack.bot_token).toBe("SLACK_BOT_TOKEN");
  expect(secret.gitlab.user_id).toBe("GITLAB_USER_ID");
});

test("find elm token", () => {
  const secret = psycher_secret.init({
    slack: {
      bot_token: "",
    },
    gitlab: {
      user_id: "",
      release_targets: { "CHANNEL": "elm,rails" },
      trigger_tokens: { "CHANNEL": { "elm": "ELM_TOKEN", "rails": "RAILS_TOKEN" } },
    },
  });

  const bot_event = slack_bot_event.init({
    type: "app_mention",
    channel: "CHANNEL",
    timestamp: "TIMESTAMP",
    text: "elm",
  });

  expect(secret.gitlab.find_token(bot_event)).toBe("ELM_TOKEN");
});

test("find token failed", () => {
  const secret = psycher_secret.init({
    slack: {
      bot_token: "",
    },
    gitlab: {
      user_id: "",
      release_targets: { "CHANNEL": "elm,rails" },
      trigger_tokens: { "CHANNEL": { "elm": "ELM_TOKEN", "rails": "RAILS_TOKEN" } },
    },
  });

  const bot_event = slack_bot_event.init({
    type: "app_mention",
    channel: "UNKNOWN-CHANNEL",
    timestamp: "TIMESTAMP",
    text: "elm",
  });

  expect(secret.gitlab.find_token(bot_event)).toBe(null);
});