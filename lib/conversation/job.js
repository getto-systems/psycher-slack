exports.init = (struct) => init(struct);

/**
 * struct : {
 *   job_signature : conversation.job_signature
 *   reply_to : conversation.reply_to
 *   includes : conversation.includes
 *   repository: {
 *     deployment
 *     pipeline
 *   }
 * }
 *
 * returns {
 *   has_deploy_target : () => check deploy target detected
 *   trigger_deploy_job : () => trigger deploy job
 * }
 */
const init = ({job_signature, reply_to, includes, repository: {deployment, pipeline}}) => {
  const has_deploy_target = async () => {
    return !!(await target());
  };

  const trigger_deploy_job = async () => {
    return pipeline.deploy({
      job_signature,
      reply_to,
      target: await target(),
    });
  };

  let data = null;
  const target = async () => {
    if (!data) {
      const targets = await deployment.targets({job_signature});
      data = {
        target: find_target(targets),
      };
    }

    return data.target;
  };

  const find_target = (targets) => {
    if (targets.length == 1) {
      return targets[0];
    }

    const filtered = targets.filter(includes);
    if (filtered.length > 0) {
      return filtered[0];
    }

    return null;
  };

  return {
    has_deploy_target,
    trigger_deploy_job,
  };
};
