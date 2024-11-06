import {PlutusScript, applyParamsToScript, resolvePlutusScriptAddress, resolvePlutusScriptHash} from '@meshsdk/core'
import {readFile} from 'node:fs/promises'

export async function calcTokePolicy(file: string, controlPolicy: string, networkId: number) {
  const blueprint = JSON.parse((await readFile(file)).toString('utf8'))

  const validator = blueprint.validators.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (v: any) => v.title === 'toke_mint.toke_mint.mint',
  )

  const {compiledCode} = validator

  const result = applyParamsToScript(compiledCode, 
    [
      controlPolicy, 
      Buffer.from('$toke_ctrl').toString('hex')
    ])

  const script = {
    code: result,
    version: 'V3',
  } satisfies PlutusScript

  const address = resolvePlutusScriptAddress(script, networkId)

  const hash = resolvePlutusScriptHash(address)

  return {address, hash, script}
}
