import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('mint-initial', () => {
  it('runs mint-initial cmd', async () => {
    const {stdout} = await runCommand('mint-initial')
    expect(stdout).to.contain('hello world')
  })

  it('runs mint-initial --name oclif', async () => {
    const {stdout} = await runCommand('mint-initial --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
