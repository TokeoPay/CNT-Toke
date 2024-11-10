import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('evaluate-txn', () => {
  it('runs evaluate-txn cmd', async () => {
    const {stdout} = await runCommand('evaluate-txn')
    expect(stdout).to.contain('hello world')
  })

  it('runs evaluate-txn --name oclif', async () => {
    const {stdout} = await runCommand('evaluate-txn --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
