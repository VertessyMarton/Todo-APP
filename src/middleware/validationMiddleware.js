export default function validate(schema) {
    return (req, res, next) => {
        const validated = schema.parse({ 
            body: req.body,
            params: req.params,
            query: req.query
         })

        Object.assign(req, validated)

        next()
    }
}