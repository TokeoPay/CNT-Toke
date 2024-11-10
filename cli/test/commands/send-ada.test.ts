import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('send-ada', () => {
  it('runs send-ada cmd', async () => {
    const {stdout} = await runCommand('send-ada')
    expect(stdout).to.contain('hello world')
  })

  it('runs send-ada --name oclif', async () => {
    const {stdout} = await runCommand('send-ada --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
