import { useEffect, useState } from 'react'

const STORAGE_KEY = 'todo-list.todos'

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export default function App() {
  const [todos, setTodos] = useState(loadTodos)
  const [text, setText] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  function addTodo(e) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    setTodos((prev) => [
      ...prev,
      { id: Date.now(), text: trimmed, done: false },
    ])
    setText('')
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

  return (
    <div className="app">
      <h1>To-do List</h1>

      <form className="add-form" onSubmit={addTodo}>
        <input
          type="text"
          placeholder="เพิ่มงานใหม่..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit">เพิ่ม</button>
      </form>

      <div className="filters">
        {['all', 'active', 'completed'].map((f) => (
          <button
            key={f}
            className={filter === f ? 'active' : ''}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'ทั้งหมด' : f === 'active' ? 'ยังไม่เสร็จ' : 'เสร็จแล้ว'}
          </button>
        ))}
      </div>

      <ul className="todo-list">
        {visibleTodos.map((todo) => (
          <li key={todo.id} className={todo.done ? 'done' : ''}>
            <label>
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleTodo(todo.id)}
              />
              <span>{todo.text}</span>
            </label>
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
  )
}
