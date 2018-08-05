import Vue from '../../../lib/vue.jsm'
import { getDefaultState } from '../../general/defaultState.jsm'

async function init() {
  const state = getDefaultState()
  const options = {
    el: '#app',
    data: {
      ui: {
        currentTab: 'proxies',
        tabs: {
          scenes: '情景模式',
          rulesets: '规则组',
          proxies: '代理服务器'
        },
        currentRulesetIndex: 0
      },
      ...state
    },
    methods: {},
    computed: {
      uiCurrentRuleset() {
        return this.rulesets[this.ui.currentRulesetIndex]
      }
    }
  }
  const vm = new Vue(options)
  Object.keys(state).forEach(key => {
    vm.$watch(key, function() {}, { deep: true })
  })
  window.vm = vm
}

init().catch(console.error)
