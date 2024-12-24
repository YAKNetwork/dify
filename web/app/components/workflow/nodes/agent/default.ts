import { ALL_CHAT_AVAILABLE_BLOCKS, ALL_COMPLETION_AVAILABLE_BLOCKS } from '../../constants'
import type { NodeDefault } from '../../types'
import type { AgentNodeType } from './types'

const nodeDefault: NodeDefault<AgentNodeType> = {
  defaultValue: {
    max_iterations: 3,
  },
  getAvailablePrevNodes(isChatMode) {
    return isChatMode
      ? ALL_CHAT_AVAILABLE_BLOCKS
      : ALL_COMPLETION_AVAILABLE_BLOCKS
  },
  getAvailableNextNodes(isChatMode) {
    return isChatMode
      ? ALL_CHAT_AVAILABLE_BLOCKS
      : ALL_COMPLETION_AVAILABLE_BLOCKS
  },
  checkValid(payload) {
    let isValid = true
    let errorMessages = ''
    if (payload.type) {
      isValid = true
      errorMessages = ''
    }
    return {
      isValid,
      errorMessage: errorMessages,
    }
  },
}

export default nodeDefault