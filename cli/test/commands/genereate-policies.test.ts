import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('genereate-policies', () => {
  it('runs genereate-policies cmd', async () => {
    const {stdout} = await runCommand('genereate-policies')
    expect(stdout).to.contain('hello world')
  })

  it('runs genereate-policies --name oclif', async () => {
    const {stdout} = await runCommand('genereate-policies --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
