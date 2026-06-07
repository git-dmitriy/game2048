import {ref, computed, watch, type MaybeRefOrGetter, toValue} from 'vue'

interface BoardGeometryOptions {
    size: MaybeRefOrGetter<number>
    boardSizePx: MaybeRefOrGetter<number>
    boardEl: MaybeRefOrGetter<HTMLElement | null>
}

export function useBoardGeometry({size, boardSizePx, boardEl}: BoardGeometryOptions) {
    const boardSizeAutoPx = ref(0)

    const boardStyle = computed(() => ({
        width: '100%',
        height: '100%',
        borderRadius: 7 / toValue(size) + '%',
    }))

    const cellMarginPct = computed(() => 100 / (9 * toValue(size) + 1))
    const cellSizePct = computed(() => 8 * cellMarginPct.value)

    const cellStyle = computed(() => ({
        width: cellSizePct.value + '%',
        height: cellSizePct.value + '%',
        marginLeft: cellMarginPct.value + '%',
        marginTop: cellMarginPct.value + '%',
    }))

    const cellSizePx = computed(() => {
        const explicitPx = toValue(boardSizePx)
        const boardPx = explicitPx > 0 ? explicitPx : boardSizeAutoPx.value
        return (cellSizePct.value / 100) * boardPx
    })

    watch(
        () => toValue(boardSizePx),
        (px) => {
            if (px > 0) {
                boardSizeAutoPx.value = px
            }
        },
    )

    function initAutoSize(): void {
        const explicitPx = toValue(boardSizePx)
        const el = toValue(boardEl)
        boardSizeAutoPx.value =
            explicitPx > 0 ? explicitPx : el?.getBoundingClientRect().width || 0
    }

    return {
        boardStyle,
        cellStyle,
        cellSizePx,
        initAutoSize,
    }
}
