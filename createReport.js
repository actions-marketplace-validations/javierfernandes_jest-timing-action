
const createReport = (threshold, diffs) => 
`
# Test execution times differences ${threshold ? `(dt >= ${threshold}%)` : ''}

${diffs.length > 0 ? diffs.map(fileReport).join('\n') : (threshold ? 'No significant changes' : 'No changed') }
`

const fileReport = ({ path, tests }) =>
`File: \`${path}\`

${createTable(tests)}`

const createTable = tests => 
`| test | previous time (ms) | current time (ms) | delta (ms) | delta (%) |
| ---- |          ---: |         ---: |        ---: |      ---: |
${
  tests.map(({ test, base, branch, delta, deltaPercentage }) => `| ${test} | ${number(base)} | ${number(branch)} | ${number(delta)} | ${deltaPercentage !== undefined ? deltaPercentage.toFixed(2) + '%' : '-'} |`)
  .join('\n')
}
`

const value = a => a !== undefined ? a : '-'
const number = n => n !== undefined ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '-'

module.exports = createReport
module.exports.fileReport = fileReport