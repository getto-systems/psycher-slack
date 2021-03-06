const job_store = require("../../lib/infra/job_store");

test("trigger", async () => {
  const {store, gitlab_api} = init_job_store();

  await store.deploy({
    job_token: {
      project_id: "PROJECT-ID",
      token: "TOKEN",
    },
    reply_to: {
      channel: "CHANNEL",
      timestamp: "TIMESTAMP",
    },
  });

  expect(gitlab_api.data).toEqual({
    trigger: [
      {
        project_id: "PROJECT-ID",
        token: "TOKEN",
        ref: "release",
        variables: {
          RELEASE: "true",
          channel: "CHANNEL",
          timestamp: "TIMESTAMP",
        },
      },
    ],
  });
});

const init_job_store = () => {
  const gitlab_api = init_gitlab_api();

  const store = job_store.init({
    gitlab_api,
  });

  return {
    store,
    gitlab_api,
  };
};

const init_gitlab_api = () => {
  let data = {
    trigger: [],
  };

  const trigger = async (struct) => {
    data.trigger.push(struct);
    return {
      status: 200,
    };
  };

  return {
    trigger,
    data,
  };
};
