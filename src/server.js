import express from "express"

const app = express()
const PORT = process.env.PORT || 3000


app.listen(PORT, () => console.log(`Serves has started on port ${PORT}`))


