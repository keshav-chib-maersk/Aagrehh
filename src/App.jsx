import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main>
      <section className="card">
        <p className="eyebrow">React + Vite</p>
        <h1>Your project is ready.</h1>
        <p>Start building in <code>src/App.jsx</code>.</p>
        <button type="button" onClick={() => setCount((value) => value + 1)}>
          Count is {count}
        </button>
      </section>
    </main>
  )
}

export default App
