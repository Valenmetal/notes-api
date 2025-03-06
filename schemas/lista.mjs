import z from "zod";

const listaSchema = z.object({
    name: z.string({
        invalid_type_error: 'Note must be a string',
        required_error: 'Note name is required.'
    }),
    important: z.boolean(),

})

function validateNote(input) {
    return listaSchema.safeParse(input)
}

function validatePartialNote(input) {
    return listaSchema.partial().safeParse(input)
}

export { validateNote, validatePartialNote }