import express from "express"
import cors from "cors"
import { validatePartialNote, validateNote } from "./schemas/lista.mjs";
import { PORT } from "./config.mjs";

const app = express()

// MIDDLEWARES
app.use(cors())
app.use(express.json())
app.use((req, res, next) => {
   console.log(req.method, req.path, req.body, req.query)
   console.log("-----------")
   next()
})

let lista = [
   {
      id: 1,
      name: "Redesigned notifications",
      date: "Jan 5, 2025",
      tags: ["work"],
   },
   {
      id: 2,
      name: "Fix bugs",
      date: "Feb 3, 2025",
      tags: ["school"],
   },
   {
      id: 3,
      name: "Redesigned Logo",
      date: "Mar 3, 2025",
      tags: ["home"],
   },
]

// GET: Home
app.get("/", (req, res) => {
   res.send("<h1>Home</h1>")
})

// GET: Listar notas y filtrar por etiquetas
app.get("/api/notes", (req, res) => {
   const { tag } = req.query

   if (tag) {
      const filteredNotes = lista.filter(nota => nota.tags.includes(tag))
      return res.json(filteredNotes)
   }

   res.json(lista)
})

// GET: Obtener nota por ID
app.get("/api/notes/:id", (req, res) => {
   const id = Number(req.params.id)
   const item = lista.find(item => item.id === id)

   if (item) {
      res.json(item)
   } else {
      res.status(404).json({ error: "Note not found" })
   }
})

// DELETE: Eliminar nota
app.delete("/api/notes/:id", (req, res) => {
   const id = Number(req.params.id)
   lista = lista.filter(item => item.id !== id)
   res.status(204).end()
})

// POST: Crear una nueva nota con etiquetas
app.post("/api/notes", (req, res) => {
   const result = validatePartialNote(req.body)

   if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
   }

   const ids = lista.map(note => note.id)
   const maxId = ids.length > 0 ? Math.max(...ids) : 0

   const newItem = {
      id: maxId + 1,
      ...result.data,
      date: new Date().toLocaleDateString("en-US", {
         year: "numeric",
         month: "short",
         day: "numeric",
      }),
      tags: result.data.tags ? result.data.tags : [], // Asegurar que tags sea un array
   }

   lista = [...lista, newItem]
   res.json(newItem)
})

// PATCH: Actualizar nota parcialmente
app.patch("/api/notes/:id", (req, res) => {
   const result = validatePartialNote(req.body)

   if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
   }

   const { id } = req.params
   const noteIndex = lista.findIndex(note => note.id === Number(id))

   if (noteIndex === -1) {
      return res.status(404).json({ message: "Note not found" })
   }

   const updatedNote = {
      ...lista[noteIndex],
      ...result.data,
      tags: result.data.tags || [],
   }

   lista[noteIndex] = updatedNote

   return res.json(updatedNote)
})

// Middleware 404
app.use((req, res) => {
   res.status(404).json({
      error: "Not Found"
   })
})

const hostname = "0.0.0.0"
app.listen(PORT, hostname, () => {
   console.log(`Server running at http://${hostname}:${PORT}/`)
})
