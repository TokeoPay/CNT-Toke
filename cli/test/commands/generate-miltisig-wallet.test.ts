import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('generate-miltisig-wallet', () => {
  it('runs generate-miltisig-wallet cmd', async () => {
    const {stdout} = await runCommand('generate-miltisig-wallet')
    expect(stdout).to.contain('hello world')
  })

  it('runs generate-miltisig-wallet --name oclif', async () => {
    const {stdout} = await runCommand('generate-miltisig-wallet --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
