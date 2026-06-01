export const API_URL = "/api/tickets"

export async function getTickets() {
    try {
        const response = await fetch(API_URL)
        const data = await response.json()

        if(!response.ok) {
            return {ok: false, data: data}
        }
        return {ok: true, data: data}
    } catch(err) {
        console.log(err)
         return {ok: false, data: err}
    }
}

export async function addTicket(ticket) {
    console.log(ticket)
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify(ticket),
            headers: {
                "Content-Type": "application/json"
            }
        })
        const data = await response.json()
        
        if(!response.ok) {
            return {ok: false, data: data}
        }
        return {ok: true, data: data}
    } catch(err) {
        console.log(err)
         return {ok: false, data: err}
    }
}
