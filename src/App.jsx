import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'todo-list.todos'

const THAI_WEEKDAY_SHORT = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา']
const BADGE_COLORS = ['#FBD9BC', '#D9EAC2', '#E3D6F2', '#FBE3B5', '#CDE7E1']

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function getGreeting(hour) {
  if (hour >= 5 && hour < 12) return 'สวัสดีตอนเช้า'
  if (hour >= 12 && hour < 18) return 'สวัสดีตอนบ่าย'
  return 'สวัสดีตอนเย็น'
}

function getWeekDays(today) {
  const day = today.getDay() // 0 = Sun ... 6 = Sat
  const mondayOffset = (day + 6) % 7
  const monday = new Date(today)
  monday.setDate(today.getDate() - mondayOffset)

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

export default function App() {
  const [todos, setTodos] = useState(loadTodos)
  const [text, setText] = useState('')
  const [filter, setFilter] = useState('all')
  const [isAdding, setIsAdding] = useState(false)
  const inputRef = useRef(null)

  const today = new Date()

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  useEffect(() => {
    if (isAdding) inputRef.current?.focus()
  }, [isAdding])

  function addTodo(e) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    setTodos((prev) => [
      ...prev,
      { id: Date.now(), text: trimmed, done: false },
    ])
    setText('')
    setIsAdding(false)
  }

  function toggleTodo(id) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    )
  }

  function deleteTodo(id) {
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  const visibleTodos = todos.filter((t) => {
    if (filter === 'active') return !t.done
    if (filter === 'completed') return t.done
    return true
  })

  const remaining = todos.filter((t) => !t.done).length
  const weekDays = getWeekDays(today)
  const dateLabel = new Intl.DateTimeFormat('th-TH-u-ca-gregory', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(today)

  return (
    <div className="app">
      <div className="card">
        <header className="header">
          <div>
            <h1>{getGreeting(today.getHours())}</h1>
            <p className="date">{dateLabel}</p>
          </div>
          <div className="avatar" aria-hidden="true">
            🙂
          </div>
        </header>

        <div className="week-strip">
          {weekDays.map((d) => {
            const isToday = d.toDateString() === today.toDateString()
            return (
              <div key={d.toISOString()} className="week-day">
                <span className="week-day-label">
                  {THAI_WEEKDAY_SHORT[(d.getDay() + 6) % 7]}
                </span>
                <span className={`week-day-num${isToday ? ' active' : ''}`}>
                  {d.getDate()}
                </span>
              </div>
            )
          })}
        </div>

        <div className="reminder-card">
          <div className="reminder-text">
            <h2>ตั้งการแจ้งเตือน</h2>
            <p>อย่าลืมกิจวัตรประจำวันของคุณ! ตั้งเตือนไว้ไม่ให้พลาด</p>
            <button type="button" className="set-now-btn">
              ตั้งเตือนเลย
            </button>
          </div>
          <span className="reminder-bell" aria-hidden="true">
            🔔
          </span>
        </div>

        <div className="section-header">
          <h2>รายการวันนี้</h2>
          <div className="filters">
            {['all', 'active', 'completed'].map((f) => (
              <button
                key={f}
                className={filter === f ? 'active' : ''}
                onClick={() => setFilter(f)}
              >
                {f === 'all'
                  ? 'ทั้งหมด'
                  : f === 'active'
                    ? 'ยังไม่เสร็จ'
                    : 'เสร็จแล้ว'}
              </button>
            ))}
          </div>
        </div>

        <ul className="todo-list">
          {visibleTodos.map((todo, i) => (
            <li key={todo.id} className={todo.done ? 'done' : ''}>
              <button
                type="button"
                className={`check-dot${todo.done ? ' checked' : ''}`}
                onClick={() => toggleTodo(todo.id)}
                aria-label={todo.done ? 'ทำเครื่องหมายว่ายังไม่เสร็จ' : 'ทำเครื่องหมายว่าเสร็จแล้ว'}
              >
                {todo.done && '✓'}
              </button>
              <span
                className="icon-badge"
                style={{ background: BADGE_COLORS[i % BADGE_COLORS.length] }}
              >
                📋
              </span>
              <span className="todo-text">{todo.text}</span>
              <button
                className="delete-btn"
                onClick={() => deleteTodo(todo.id)}
                aria-label="ลบงานนี้"
              >
                ×
              </button>
            </li>
          ))}
          {visibleTodos.length === 0 && (
            <li className="empty">ไม่มีงานในหมวดนี้</li>
          )}
        </ul>

        <p className="count">เหลือ {remaining} งานที่ยังไม่เสร็จ</p>
      </div>

      {isAdding && (
        <form className="add-sheet" onSubmit={addTodo}>
          <input
            ref={inputRef}
            type="text"
            placeholder="เพิ่มงานใหม่..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={() => {
              if (!text.trim()) setIsAdding(false)
            }}
          />
          <button type="submit">เพิ่ม</button>
        </form>
      )}

      <button
        type="button"
        className="fab"
        onClick={() => setIsAdding((v) => !v)}
        aria-label="เพิ่มงานใหม่"
      >
        +
      </button>
    </div>
  )
}
