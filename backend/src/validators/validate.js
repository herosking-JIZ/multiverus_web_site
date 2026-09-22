const validate = (schema) => {
    return (req, res, next) => {

        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
            convert: true,
        });

        if (error) {
            const erreurs = error.details.map((detail) => ({
                champ: detail.context?.key ?? 'inconnu',
                message: detail.message.replace(/"/g, ''),
            }));

            return res.status(422).json({
                statut: 'erreur',
                message: 'Données invalides',
                erreurs,
            });
        }

        req.body = value;
        next();
    };
};

module.exports = validate;