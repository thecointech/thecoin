
// Runtime environment be set.  Current envs are gcloud and test
// Note though that jest uses it's own resolver in @jestutils
export const getConditions = ({conditions}) => [
  ...(process.env.RUNTIME_ENV)
    ? [process.env.RUNTIME_ENV, process.env.CONFIG_NAME || process.env.NODE_ENV]
    : [process.env.CONFIG_NAME || process.env.NODE_ENV],
  ...conditions,
]

export const addConditions = (context) => ({
  ...context,
  conditions: getConditions(context),
})
