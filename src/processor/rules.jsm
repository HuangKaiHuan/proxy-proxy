import Ruleset from './ruleset.jsm'
import { getStateFromStroage } from '../general/storage.jsm'

let RULES = new Map()
let debug = window.debug('pproxy:prcs:rules')

async function ensureRuleset(key) {
  if (!RULES.has(key)) {
    RULES.set(key, newRuleset(key))
  }
  return RULES.get(key)
}

export function getRuleset(key) {
  if (!RULES.has(key)) {
    throw new Error(`Ruleset ${key} not found!`)
  }
  return RULES.get(key)
}

export function clearRulesets() {
  RULES.clear()
}

function newRuleset(key) {
  return new Ruleset(key)
}

async function readLines(path) {
  const res = await fetch(path)
  const text = await res.text()
  const list = text.split('\n').filter(s => !!s)
  return list
}

const typeMap = {
  host: 'addHost',
  regexp: 'addRegexp',
  ip: 'addIP'
}

async function loadIntoRuleset(path, ruleName, type) {
  debug(`loading ${type} file ${path} to ${ruleName}`)
  const list = await readLines(path)
  debug(`importing ${list.length} items ...`)
  const ruleset = await ensureRuleset(ruleName)
  for (const rule of list) {
    ruleset[typeMap[type]](rule)
  }
  debug('imported.')
}

async function loadFromStorage({ rulesets }) {
  for (const rulesetConfig of rulesets) {
    const rs = await ensureRuleset(rulesetConfig.name)
    rs.config = rulesetConfig
    if (rulesetConfig.imports) {
      for (const imp of rulesetConfig.imports) {
        await loadIntoRuleset(imp.url, rulesetConfig.name, imp.type)
      }
    }
  }
}

export async function initRules() {
  // await loadFiles()
  const { rulesets } = await getStateFromStroage(['rulesets'])
  await loadFromStorage({ rulesets })
  return { rulesets }
}
