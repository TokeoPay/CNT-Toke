import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('generate-credentials', () => {
  it('runs generate-credentials cmd', async () => {
    const {stdout} = await runCommand('generate-credentials')
    expect(stdout).to.contain('hello world')
  })

  it('runs generate-credentials --name oclif', async () => {
    const {stdout} = await runCommand('generate-credentials --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
