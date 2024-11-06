import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('create-mint-txn', () => {
  it('runs create-mint-txn cmd', async () => {
    const {stdout} = await runCommand('create-mint-txn')
    expect(stdout).to.contain('hello world')
  })

  it('runs create-mint-txn --name oclif', async () => {
    const {stdout} = await runCommand('create-mint-txn --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
