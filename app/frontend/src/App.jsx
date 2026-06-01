import { useEffect } from 'react'
import { useState } from 'react'
import { addTicket, getTickets } from './api/ticket'

function App() {
  const [tickets, setTickets] = useState([])
  const [error, setError] = useState(null)
  const [email, setEmail] = useState("")
  const [success, setSuccess] = useState(false)
  const [description, setDescription] = useState("")

  function getAllTickets() {
    getTickets().then(response => {
      const { ok, data } = response
      if (ok) {
        setTickets(data)
        setError(null)
      } else {
        setError(JSON.stringify(data))
      }
    })
  }

  useEffect(() => {
    getAllTickets()
  }, [])

  async function sendTicket() {
    const { ok, data } = await addTicket({ description: description, email: email })
    if (ok) {
      setSuccess(true)
      setError(null)
      getAllTickets()
    } else {
      setSuccess(false)
      setError(data)
    }
  }

  return (
    <>
      <h1>Zgłoszenie awarii Internetu</h1>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <label>Twój email <input value={email} onInput={e => setEmail(e.target.value)} type='email' required></input></label>
        <label>Treść zgłoszenia <textarea value={description} onInput={e => setDescription(e.target.value)} type='text' required></textarea></label>
        <button onClick={sendTicket}>Wyślij</button>
        {success && <p>Wysłano!</p>}
      </div>

      {error && <div>Błąd: {error}</div>}

      <h2>Otrzymane zgłoszenia</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>email</th>
            <th>description</th>
          </tr>
        </thead>

        <tbody>
          {tickets.map(t => <tr key={t.id}>
            <td>{t.id}</td>
            <td>{t.email}</td>
            <td>{t.description}</td>
          </tr>)}
        </tbody>
      </table>
    </>
  )
}

export default App
