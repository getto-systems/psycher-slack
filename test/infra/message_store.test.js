const message_store = require("../../lib/infra/message_store");

test("post", async () => {
  const slack_api = init_slack_api();

  const store = message_store.init({
    slack_api,
  });

  await store.post({
    token: "TOKEN",
    channel: "CHANNEL",
    text: "TEXT",
  });

  expect(slack_api.data.chat.postMessage.length).toBe(1);
  expect(JSON.stringify(slack_api.data.chat.postMessage[0])).toBe(JSON.stringify({
    token: "TOKEN",
    channel: "CHANNEL",
    text: "TEXT",
  }));
});

test("add", async () => {
  const slack_api = init_slack_api();

  const store = message_store.init({
    slack_api,
  });

  await store.add({
    token: "TOKEN",
    channel: "CHANNEL",
    timestamp: "TIMESTAMP",
    name: "NAME",
  });

  expect(slack_api.data.reactions.add.length).toBe(1);
  expect(JSON.stringify(slack_api.data.reactions.add[0])).toBe(JSON.stringify({
    token: "TOKEN",
    channel: "CHANNEL",
    timestamp: "TIMESTAMP",
    name: "NAME",
  }));
});

const init_slack_api = () => {
  let data = {
    chat: {
      postMessage: [],
    },
    reactions: {
      add: [],
    },
  };

  const chat = {
    postMessage: async (struct) => {
      data.chat.postMessage.push(struct);
      return {
        status: 200,
      };
    },
  };

  const reactions = {
    add: async (struct) => {
      data.reactions.add.push(struct);
      return {
        status: 200,
      };
    },
  };

  return {
    chat,
    reactions,
    data,
  };
};