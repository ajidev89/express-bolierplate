import Joi from "joi";
import ValidationClass from "..";

class RegisterRequest extends ValidationClass<{
    first_name: string;
    last_name: string;
    email: string;
    password: string;
}> {
    constructor() {
        const schema: Joi.ObjectSchema<{
            first_name: string;
            last_name: string;
            email: string;
            password: string;
        }> = Joi.object().keys({
            first_name: Joi.string().required(),
            last_name: Joi.string().required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(8).required(),
            password_confirmation: Joi.string()
                .valid(Joi.ref("password"))
                .required(),
        });

        super(schema);
    }
}

export default new RegisterRequest();
