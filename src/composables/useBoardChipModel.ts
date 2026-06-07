import {ref, type ComponentPublicInstance, type MaybeRefOrGetter, type Ref, toValue} from 'vue'
import type {BoardCell, BoardChip, CellCoord, ChipCoord} from '../types/game'

interface BoardChipModelOptions {
    size: MaybeRefOrGetter<number>
    cellRefs: Ref<HTMLElement[]>
}

export function useBoardChipModel({size, cellRefs}: BoardChipModelOptions) {
    const cells = ref<BoardCell[]>(createCellsArray())

    let chipIdCounter = 0
    let moveKeyCounter = 0

    function createCellsArray(boardSize = toValue(size)): BoardCell[] {
        return Array.from({length: boardSize * boardSize}, () => ({chips: []}))
    }

    function getCellIndex(c: CellCoord): number {
        return c.y * toValue(size) + c.x
    }

    function getCell(c: CellCoord): BoardCell {
        return cells.value[getCellIndex(c)]
    }

    function getCellEl(c: CellCoord): HTMLElement | null {
        const refs = cellRefs.value
        return Array.isArray(refs) ? refs[getCellIndex(c)] ?? null : null
    }

    function setCellRef(el: Element | ComponentPublicInstance | null, index: number): void {
        if (el instanceof HTMLElement) {
            if (!Array.isArray(cellRefs.value)) cellRefs.value = []
            cellRefs.value[index] = el
        }
    }

    function chipKey(ch: BoardChip): string {
        if (ch._moveKey != null) return 'move-' + ch._moveKey
        return 'chip-' + (ch._chipId != null ? ch._chipId : (ch._chipId = ++chipIdCounter))
    }

    function emptyCells(): void {
        cells.value.forEach((cell) => cell.chips.splice(0))
    }

    function reset(boardSize?: number): void {
        cells.value = createCellsArray(boardSize)
        chipIdCounter = 0
        moveKeyCounter = 0
    }

    function addChip(c: ChipCoord): void {
        const chip: BoardChip = {value: c.value, _chipId: ++chipIdCounter}
        cells.value[getCellIndex(c)].chips.push(chip)
    }

    function addChips(chips: ChipCoord[]): void {
        chips.forEach(addChip)
    }

    function populateFromBoard(board: number[][]): void {
        const boardSize = toValue(size)
        for (let y = 0; y < boardSize; y++) {
            for (let x = 0; x < boardSize; x++) {
                const value = board[y][x]
                if (value > 0) {
                    addChip({x, y, value})
                }
            }
        }
    }

    function moveChip(from: CellCoord, to: CellCoord): void {
        const fromCell = getCell(from)
        const fromCellEl = getCellEl(from)
        const toCell = getCell(to)
        const toCellEl = getCellEl(to)
        const chip = fromCell.chips.splice(0, 1)[0]
        if (!fromCellEl || !toCellEl) return

        const fromRect = fromCellEl.getBoundingClientRect()
        const toRect = toCellEl.getBoundingClientRect()
        chip.prevRelPos = {
            left: fromRect.left - toRect.left,
            top: fromRect.top - toRect.top,
        }
        chip._moveKey = ++moveKeyCounter
        toCell.chips.push(chip)
    }

    function moveChips(moves: Array<{ from: CellCoord; to: CellCoord }>): void {
        moves.forEach((move) => moveChip(move.from, move.to))
    }

    function consolidateChips(consolidations: ChipCoord[]): void {
        consolidations.forEach((c) => {
            const cell = getCell(c)
            const chips = cell.chips
            chips.splice(0, chips.length - 1)
            chips[0].value = c.value
        })
    }

    return {
        cells,
        chipKey,
        setCellRef,
        emptyCells,
        reset,
        addChips,
        populateFromBoard,
        moveChips,
        consolidateChips,
    }
}
