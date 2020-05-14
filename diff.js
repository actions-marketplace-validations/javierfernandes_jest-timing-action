const { propEq, prop, allPass, propSatisfies, test } = require('ramda')
const core = require('@actions/core')

const makeDiff = async (octokit, context, pullRequest) => {
  const files = await octokit.pulls.listFiles({
    ...context.repo,
    pull_number: pullRequest.number,
  })

  const modifiedSnapshots = await Promise.all(files.data
    .filter(isModifiedSnapshot)
    .map(prop('filename'))
    .map(fetchFilePairs(octokit, context, pullRequest.base.ref, pullRequest.head.ref))
  )
  
  return `
modified snapshots:
  ${modifiedSnapshots.map(({ path, base, branch }) => `
### path: ${path}
base:
${jsonSnippet(base)}
branch:
${jsonSnippet(branch)}
`)}
`

  // return JSON.stringify(pullRequest, null, 2)
}

const isModifiedSnapshot = allPass([
  propEq('status', 'modified'),
  propSatisfies(test(/__tsnapshots__\/.*\.tsnapshot/), 'filename')
])

const fetchFilePairs = (octokit, context, baseBranch, prBranch) => async filename => ({
  path: filename,
  base: await fetchFile(octokit, context, baseBranch)(filename),
  branch: await fetchFile(octokit, context, prBranch)(filename),
})

const fetchFile = (octokit, context, branch) => async filename => {
  core.info(`FETCHING file ${filename} from ${branch}`)
  const result = await octokit.repos.getContents({
    ...context.repo,
    path: filename,
    ref: branch
  })
  return JSON.parse(Buffer.from(result.data.content, 'base64'))
}

const jsonSnippet = obj => `
\`\`\`json
${JSON.stringify(obj, null, 2)}
\`\`\`
`

module.exports = makeDiff