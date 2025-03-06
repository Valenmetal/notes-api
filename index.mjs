import express from "express"
import cors from "cors"
import { validatePartialNote, validateNote } from "./schemas/lista.mjs";
import { PORT } from "./config.mjs";
const app = express()

//MIDDLEWARES
app.use(cors())
app.use(express.json())
app.use((req, res, next) => {
   console.log(req.method)
   console.log(req.path)
   console.log(req.body)
   console.log(req.query)

   console.log("-----------")
   next()
})

let lista = [
   {
      id: 1,
      name: "Redisegned notifications",
      date: "Jan 5, 2025",
      important: false,
   },
   {
      id: 2,
      name: "Bugs",
      date: "Feb 3, 2025",
      important: true,
   },
   {
      id: 3,
      name: "Redisegned Logo",
      date: "Mar 3, 2025",
      important: false,
   },
]

//GETs
app.get("/", (req, res) => {
   res.send("<h1>Home</h1>")
})
app.get("/api/notes", (req, res) => {
   // If: "/api/notes?important=true" we extract the important with req.query and filter, if not return all list
   const { important } = req.query
   if (important) {
      const filteredNotes = lista.filter(
         nota => nota.important === (important === "true")
      )
      console.log(filteredNotes)
      return res.json(filteredNotes)
   }

   res.json(lista)
})
app.get("/api/notes/:id", (req, res) => {

   const id = Number(req.params.id)
   const item = lista.find((item) => item.id === id)
   if (item) {
      res.json(item)
   } else {
      res.status(404).end()
   }
})

//DELETE
app.delete("/api/notes/:id", (req, res) => {
   const id = Number(req.params.id)
   lista = lista.filter((item) => item.id !== id)
   res.status(204).end()
})

//POST
app.post("/api/notes", (req, res) => {

   const result = validatePartialNote(req.body)

   if (!result.success) {
      // 422 Unprocessable Entity
      return res.status(400).json({ error: JSON.parse(result.error.message) })
   }
   let ids = lista.map(note => note.id)
   let maxId = Math.max(...ids)

   let newItem = {
      id: maxId > 0 ? maxId + 1 : 1,
      ...result.data,
      date: new Date().toLocaleDateString("en-US", {
         year: "numeric",
         month: "short",
         day: "numeric",
      }),
      important: false
   }
   lista = [...lista, newItem]
   res.json(newItem)
})

//PATCH
app.patch('/api/notes/:id', (req, res) => {
   const result = validatePartialNote(req.body)

   if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
   }

   const { id } = req.params
   const noteIndex = lista.findIndex(note => note.id === Number(id))

   if (noteIndex === -1) {
      return res.status(404).json({ message: 'Note not found' })
   }

   const updateNote = {
      ...lista[noteIndex],
      ...result.data
   }

   lista[noteIndex] = updateNote

   return res.json(updateNote)
})

//404
app.use((req, res) => {
   res.status(404).json({
      error: "Not Found"
   })
})
const hostname = "127.0.0.1"
app.listen(PORT, hostname, () => {
   console.log(`Server running at http://${hostname}:${PORT}/`)
})
