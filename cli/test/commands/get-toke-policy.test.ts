import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('get-toke-policy', () => {
  it('runs get-toke-policy cmd', async () => {
    const {stdout} = await runCommand('get-toke-policy')
    expect(stdout).to.contain('hello world')
  })

  it('runs get-toke-policy --name oclif', async () => {
    const {stdout} = await runCommand('get-toke-policy --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
