export function deferred(delayMs, func) {
  let executed = false
  function execute() {
    if (!executed) {
      func()
      executed = true
    }
  }
  function renew() {
    executed = false
    setTimeout(execute, delayMs)
  }
  renew()
  return {
    finish: execute,
    renew
  }
}
