export function createSwipeListener(onSwipe) {
  const sens = 5
  let st

  function onStart(e) {
    st = e.touches[0]
    e.preventDefault()
  }

  function onEnd(e) {
    const et = e.changedTouches[0]
    const x = st.clientX - et.clientX
    const y = st.clientY - et.clientY
    const mx = Math.abs(x)
    const my = Math.abs(y)
    if (mx < sens && my < sens) return

    const d = mx > my
      ? x > 0 ? 'left' : 'right'
      : y > 0 ? 'up' : 'down'
    onSwipe(d)
  }

  return {
    attach(el) {
      el.addEventListener('touchstart', onStart, false)
      el.addEventListener('touchend', onEnd, false)
    },
    detach(el) {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchend', onEnd)
    }
  }
}
