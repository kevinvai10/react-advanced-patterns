// State Reducer
// http://localhost:3000/isolated/exercise/05.js

import * as React from 'react'
import {Switch} from '../switch'

const callAll = (...fns) => (...args) => fns.forEach(fn => fn?.(...args))

// default reducer for hook usage
function toggleReducer(state, {type, initialState}) {
  switch (type) {
    case 'toggle': {
      return {on: !state.on}
    }
    case 'reset': {
      return initialState
    }
    default: {
      throw new Error(`Unsupported type: ${type}`)
    }
  }
}

// 🐨 add a new option called `reducer` that defaults to `toggleReducer`
function useToggle({reducer = toggleReducer, initialOn = false} = {}) {
  const {current: initialState} = React.useRef({on: initialOn})
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const {on} = state

  const toggle = () => dispatch({type: 'toggle'})
  const reset = () => dispatch({type: 'reset', initialState})

  // props setters and getters pattern
  function getTogglerProps({onClick, ...props} = {}) {
    return {
      'aria-pressed': on,
      onClick: callAll(onClick, toggle),
      ...props,
    }
  }

  function getResetterProps({onClick, ...props} = {}) {
    return {
      onClick: callAll(onClick, reset),
      ...props,
    }
  }

  return {
    on,
    reset,
    toggle,
    getTogglerProps,
    getResetterProps,
  }
}

function App() {
  const [timesClicked, setTimesClicked] = React.useState(0)
  const clickedTooMuch = timesClicked >= 4

  // reducer provided by API user
  // below we have a reducer very similar to our default reducer
  /*function toggleStateReducer(state, action) {
    switch (action.type) {
      case 'toggle': {
        if (clickedTooMuch) {
          return {on: state.on}
        }
        return {on: !state.on}
      }
      case 'reset': {
        return {on: false}
      }
      default: {
        throw new Error(`Unsupported type: ${action.type}`)
      }
    }
  }*/

  // in order to avoid repeating ourselves we can re use the default reducer by exporting
  // reducer and hook on the same file, then importing and updating our custom reducer like this:
  function toggleStateReducer(state, action) {
    // rather than adding our own switch statement
    // we can validate with an if that covers our specific need (not clicking after 4 clicks)
    if (action.type === 'toggle' && clickedTooMuch) {
      return { on: state.on}
    }
    // otherwise we can let the default reducer handle the other events and not having to re write
    return toggleReducer(state, action)
  }


  const {on, getTogglerProps, getResetterProps} = useToggle({
    reducer: toggleStateReducer, // developer can provide any reducer and overwrite the functionality of our hook
  })

  return (
    <div>
      <Switch
        {...getTogglerProps({
          disabled: clickedTooMuch,
          on: on,
          onClick: () => setTimesClicked(count => count + 1),
        })}
      />
      {clickedTooMuch ? (
        <div data-testid="notice">
          Whoa, you clicked too much!
          <br />
        </div>
      ) : timesClicked > 0 ? (
        <div data-testid="click-count">Click count: {timesClicked}</div>
      ) : null}
      <button {...getResetterProps({onClick: () => setTimesClicked(0)})}>
        Reset
      </button>
    </div>
  )
}

export default App

/*
eslint
  no-unused-vars: "off",
*/
