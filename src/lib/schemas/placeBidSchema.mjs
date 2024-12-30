const schema = {
    type: "object",
    properties: {
        body: {
            type: "object",
            properties: {
                amount: {
                    type: "number",
                },
            },
            required: ["amount"],
        },
    },
    required: ["body"], // required parameters (must be defined in the schema)
};

export default schema;
