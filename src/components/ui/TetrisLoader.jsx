import { useState, useEffect, useCallback, useRef } from "react"

const TETRIS_PIECES = [
  { shape: [[1, 1, 1, 1]], color: 'bg-black dark:bg-white' },
  { shape: [[1, 1], [1, 1]], color: 'bg-black dark:bg-white' },
  { shape: [[0, 1, 0], [1, 1, 1]], color: 'bg-black dark:bg-white' },
  { shape: [[1, 0], [1, 0], [1, 1]], color: 'bg-black dark:bg-white' },
  { shape: [[0, 1, 1], [1, 1, 0]], color: 'bg-black dark:bg-white' },
  { shape: [[1, 1, 0], [0, 1, 1]], color: 'bg-black dark:bg-white' },
  { shape: [[0, 1], [0, 1], [1, 1]], color: 'bg-black dark:bg-white' },
]

export default function TetrisLoading({
  size = 'md',
  speed = 'normal',
  showLoadingText = true,
  loadingText = 'Loading...'
}) {
  const sizeConfig = {
    sm: { cellSize: 'w-1.5 h-1.5', gridWidth: 8, gridHeight: 14, padding: 'p-0.5' },
    md: { cellSize: 'w-3 h-3', gridWidth: 10, gridHeight: 20, padding: 'p-1' },
    lg: { cellSize: 'w-4 h-4', gridWidth: 10, gridHeight: 20, padding: 'p-1.5' }
  }
  const speedConfig = { slow: 150, normal: 80, fast: 40 }
  const config = sizeConfig[size]
  const fallSpeed = speedConfig[speed]

  const [grid, setGrid] = useState(() =>
    Array(config.gridHeight).fill(null).map(() =>
      Array(config.gridWidth).fill(null).map(() => ({ filled: false, color: '' }))
    )
  )
  const [fallingPiece, setFallingPiece] = useState(null)
  const [isClearing, setIsClearing] = useState(false)
  const frameRef = useRef()
  const lastUpdateRef = useRef(0)

  const rotateShape = useCallback((shape) => {
    const rows = shape.length, cols = shape[0].length
    const rotated = Array(cols).fill(null).map(() => Array(rows).fill(0))
    for (let i = 0; i < rows; i++)
      for (let j = 0; j < cols; j++)
        rotated[j][rows - 1 - i] = shape[i][j]
    return rotated
  }, [])

  const createNewPiece = useCallback(() => {
    const pieceData = TETRIS_PIECES[Math.floor(Math.random() * TETRIS_PIECES.length)]
    let shape = pieceData.shape
    const rotations = Math.floor(Math.random() * 4)
    for (let i = 0; i < rotations; i++) shape = rotateShape(shape)
    const maxX = config.gridWidth - shape[0].length
    return { shape, color: pieceData.color, x: Math.floor(Math.random() * (maxX + 1)), y: -shape.length, id: Math.random().toString(36).substr(2, 9) }
  }, [rotateShape, config.gridWidth])

  const canPlacePiece = useCallback((piece, newX, newY) => {
    for (let row = 0; row < piece.shape.length; row++)
      for (let col = 0; col < piece.shape[row].length; col++)
        if (piece.shape[row][col]) {
          const gx = newX + col, gy = newY + row
          if (gx < 0 || gx >= config.gridWidth || gy >= config.gridHeight) return false
          if (gy >= 0 && grid[gy][gx].filled) return false
        }
    return true
  }, [grid, config.gridWidth, config.gridHeight])

  const placePiece = useCallback((piece) => {
    setGrid(prev => {
      const next = prev.map(r => r.map(c => ({ ...c })))
      for (let row = 0; row < piece.shape.length; row++)
        for (let col = 0; col < piece.shape[row].length; col++)
          if (piece.shape[row][col]) {
            const gx = piece.x + col, gy = piece.y + row
            if (gy >= 0 && gy < config.gridHeight && gx >= 0 && gx < config.gridWidth)
              next[gy][gx] = { filled: true, color: piece.color }
          }
      return next
    })
  }, [config.gridHeight, config.gridWidth])

  const clearFullLines = useCallback(() => {
    setGrid(prev => {
      const toClear = prev.reduce((acc, row, i) => { if (row.every(c => c.filled)) acc.push(i); return acc }, [])
      if (!toClear.length) return prev
      setIsClearing(true)
      const next = prev.map((row, i) => toClear.includes(i) ? row.map(c => ({ ...c, color: 'bg-black dark:bg-white animate-pulse opacity-50' })) : row)
      setTimeout(() => {
        setGrid(cur => {
          const filtered = cur.filter((_, i) => !toClear.includes(i))
          const empty = Array(toClear.length).fill(null).map(() => Array(config.gridWidth).fill(null).map(() => ({ filled: false, color: '' })))
          setIsClearing(false)
          return [...empty, ...filtered]
        })
      }, 200)
      return next
    })
  }, [config.gridWidth])

  const checkAndReset = useCallback(() => {
    const topRows = grid.slice(0, 4)
    if (topRows.some(row => row.filter(c => c.filled).length > config.gridWidth * 0.7)) {
      setIsClearing(true)
      setTimeout(() => {
        setGrid(Array(config.gridHeight).fill(null).map(() => Array(config.gridWidth).fill(null).map(() => ({ filled: false, color: '' }))))
        setFallingPiece(null)
        setIsClearing(false)
      }, 500)
      return true
    }
    return false
  }, [grid, config.gridWidth, config.gridHeight])

  useEffect(() => {
    const loop = (ts) => {
      if (ts - lastUpdateRef.current >= fallSpeed) {
        lastUpdateRef.current = ts
        if (!isClearing && !checkAndReset()) {
          setFallingPiece(prev => {
            if (!prev) return createNewPiece()
            const newY = prev.y + 1
            if (canPlacePiece(prev, prev.x, newY)) return { ...prev, y: newY }
            placePiece(prev)
            setTimeout(clearFullLines, 50)
            return createNewPiece()
          })
        }
      }
      frameRef.current = requestAnimationFrame(loop)
    }
    frameRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameRef.current)
  }, [canPlacePiece, createNewPiece, placePiece, clearFullLines, checkAndReset, isClearing, fallSpeed])

  const renderGrid = () => {
    const display = grid.map(r => r.map(c => ({ ...c })))
    if (fallingPiece && !isClearing) {
      for (let row = 0; row < fallingPiece.shape.length; row++)
        for (let col = 0; col < fallingPiece.shape[row].length; col++)
          if (fallingPiece.shape[row][col]) {
            const gx = fallingPiece.x + col, gy = fallingPiece.y + row
            if (gy >= 0 && gy < config.gridHeight && gx >= 0 && gx < config.gridWidth)
              display[gy][gx] = { filled: true, color: fallingPiece.color }
          }
    }
    return display.map((row, ri) => (
      <div key={ri} className="flex">
        {row.map((cell, ci) => (
          <div key={`${ri}-${ci}`} className={`${config.cellSize} border border-gray-300 dark:border-gray-600 transition-all duration-100 ${cell.filled ? `${cell.color} scale-100` : 'bg-white dark:bg-black scale-95'} ${isClearing && ri < 4 ? 'animate-pulse' : ''}`} />
        ))}
      </div>
    ))
  }

  return (
    <div>
      <div className="mb-6">
        <div className={`border-2 border-gray-800 dark:border-gray-200 bg-white dark:bg-black ${config.padding} transition-colors w-fit`}>
          {renderGrid()}
        </div>
      </div>
      {showLoadingText && (
        <div className="text-center">
          <p className="text-black dark:text-white font-medium transition-colors">{loadingText}</p>
        </div>
      )}
    </div>
  )
}
