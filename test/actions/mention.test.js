const handler = require("../../lib/handler");

const conversation_factory = require("../../lib/conversation");

const session_factory = require("../../lib/conversation/progress/session");

const deployment_factory = require("../../lib/conversation/job/deployment");
const pipeline_factory = require("../../lib/conversation/job/pipeline");

const stream_factory = require("../../lib/conversation/message/stream");

const uuid_store_factory = require("../infra/uuid_store");
const document_store_factory = require("../infra/document_store");
const secret_store_factory = require("../infra/secret_store");
const message_store_factory = require("../infra/message_store");
const job_store_factory = require("../infra/job_store");

const i18n_factory = require("../i18n");

test("deploy elm", async () => {
  const {conversation, i18n, message_store, job_store} = init_conversation({
    started_conversations_exists: true,
    deploy_error: null,
    text: "deploy elm",
  });

  await handler.perform(handler.detect_actions({
    type: "app_mention",
    i18n,
    conversation,
  }));

  expect(message_store.data).toEqual({
    post: [],
    add: [
      {
        token: "MESSAGE-TOKEN",
        reply_to: {
          channel: "CHANNEL",
          timestamp: "TIMESTAMP",
        },
        name: "success",
      },
    ],
  });
  expect(job_store.data).toEqual({
    deploy: [
      {
        job_token: {
          project_id: "ELM-PROJECT-ID",
          token: "ELM-TOKEN",
        },
        reply_to: {
          channel: "CHANNEL",
          timestamp: "TIMESTAMP",
        },
      },
    ],
  });
});

test("deploy error", async () => {
  const {conversation, i18n, message_store, job_store} = init_conversation({
    started_conversations_exists: true,
    deploy_error: "deploy-error",
    text: "deploy elm",
  });

  await handler.perform(handler.detect_actions({
    type: "app_mention",
    i18n,
    conversation,
  }));

  expect(message_store.data).toEqual({
    post: [],
    add: [
      {
        token: "MESSAGE-TOKEN",
        reply_to: {
          channel: "CHANNEL",
          timestamp: "TIMESTAMP",
        },
        name: "failure",
      },
    ],
  });
  expect(job_store.data).toEqual({
    deploy: [],
  });
});

test("deploy target not found", async () => {
  const {conversation, i18n, message_store, job_store} = init_conversation({
    started_conversations_exists: true,
    deploy_error: null,
    text: "deploy unknown",
  });

  await handler.perform(handler.detect_actions({
    type: "app_mention",
    i18n,
    conversation,
  }));

  expect(message_store.data).toEqual({
    post: [
      {
        token: "MESSAGE-TOKEN",
        reply_to: {
          channel: "CHANNEL",
          timestamp: "TIMESTAMP",
        },
        text: "deploy_target_not_found",
      },
    ],
    add: [],
  });
  expect(job_store.data).toEqual({
    deploy: [],
  });
});

test("greeting", async () => {
  const {conversation, i18n, message_store, job_store} = init_conversation({
    started_conversations_exists: true,
    deploy_error: null,
    text: "hello",
  });

  await handler.perform(handler.detect_actions({
    type: "app_mention",
    i18n,
    conversation,
  }));

  expect(message_store.data).toEqual({
    post: [
      {
        token: "MESSAGE-TOKEN",
        reply_to: {
          channel: "CHANNEL",
          timestamp: "TIMESTAMP",
        },
        text: "greeting",
      },
    ],
    add: [],
  });
  expect(job_store.data).toEqual({
    deploy: [],
  });
});

test("unknown mention", async () => {
  const {conversation, i18n, message_store, job_store} = init_conversation({
    started_conversations_exists: true,
    deploy_error: null,
    text: "unknown",
  });

  await handler.perform(handler.detect_actions({
    type: "app_mention",
    i18n,
    conversation,
  }));

  expect(message_store.data).toEqual({
    post: [
      {
        token: "MESSAGE-TOKEN",
        reply_to: {
          channel: "CHANNEL",
          timestamp: "TIMESTAMP",
        },
        text: "unknown_mention",
      },
    ],
    add: [],
  });
  expect(job_store.data).toEqual({
    deploy: [],
  });
});

test("do not duplicate deploy", async () => {
  const {conversation, i18n, message_store, job_store} = init_conversation({
    started_conversations_exists: false,
    deploy_error: null,
    text: "deploy elm",
  });

  await handler.perform(handler.detect_actions({
    type: "app_mention",
    i18n,
    conversation,
  }));

  expect(message_store.data).toEqual({
    post: [],
    add: [],
  });
  expect(job_store.data).toEqual({
    deploy: [],
  });
});

const init_conversation = ({started_conversations_exists, type, deploy_error, text}) => {
  const {repository, message_store, job_store} = init_repository({
    started_conversations_exists,
    deploy_error,
  });

  const conversation = conversation_factory.init({
    event_info: {
      type,
      team: "TEAM",
      channel: "CHANNEL",
      timestamp: "TIMESTAMP",
      text,
    },
    repository,
  });

  const i18n = i18n_factory.init();

  return {
    conversation,
    i18n,
    message_store,
    job_store,
  };
};

const init_repository = ({started_conversations_exists, deploy_error}) => {
  const secret_store = secret_store_factory.init({
    message_token: "MESSAGE-TOKEN",
    job_targets: ["elm", "rails"],
    job_token: {project_id: "ELM-PROJECT-ID", token: "ELM-TOKEN"},
  });
  const message_store = message_store_factory.init();
  const job_store = job_store_factory.init({
    deploy_error,
  });

  const session = session_factory.init({
    uuid_store: uuid_store_factory.init({
      uuid: "UUID",
    }),
    document_store: document_store_factory.init({
      started_conversations_exists,
    }),
  });
  const deployment = deployment_factory.init({
    secret_store,
  });

  const stream = stream_factory.init({
    secret_store,
    message_store,
  });
  const pipeline = pipeline_factory.init({
    secret_store,
    job_store,
  });

  const repository = {
    session,
    deployment,
    stream,
    pipeline,
  };

  return {
    repository,
    message_store,
    job_store,
  };
};
