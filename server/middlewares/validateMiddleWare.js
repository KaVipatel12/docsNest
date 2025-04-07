const validate = (registerSchema) => async (req, res, next) => {        
    try {
        const parseBody = await registerSchema.parseAsync(req.body);
        req.body = parseBody; 
        next(); 
    } catch (err) {
        const status = 400;
        const message = "Please input properly";
        const extraDetails = err.errors[0].message;

        const error = {
          status,
          message,
          extraDetails
        };
        next(error);
    }
};

module.exports = { validate };