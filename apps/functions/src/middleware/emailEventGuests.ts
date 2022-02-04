import { RequestHandler } from 'express';

const emailEventGuests: RequestHandler = async (req, _res, next) => {
    const functions = req.app.locals.functions;
    const nodemailer = req.app.locals.nodemailer;
    const { eventId, name, guests } = req.body;

    // NOTE: Using localhost because there is currently no domain registered for the website
    const eventUrl = `http://localhost:3000/event/${eventId}`;

    const { user, pass } = functions.config().hostemail;
    try {
        const transporter = nodemailer.createTransport({
            // NOTE: Using gmail as a sender because there is currently no domain for an email service
            service: 'gmail',
            auth: {
                user,
                pass,
            },
        });
        guests.forEach((email: string) => {
            if (email) {
                functions.logger.info(
                    `Sending event invitation email to ${email}`
                );
                const mailOptions = {
                    from: user,
                    to: email,
                    subject: 'You have been invited to join an event!',
                    html: `
                        <h1>WYA</h1>
                        <p>The following event is waiting for you to join: ${name}.</p>
                        <p>Click here to view event: <a href="${eventUrl}">${eventUrl}</a></p>`,
                };

                // eslint-disable-next-line
                transporter.sendMail(mailOptions, (err: any, info: any) => {
                    if (err) {
                        functions.logger.error(err);
                        functions.logger.error('Error sending email');
                    } else {
                        functions.logger.info(
                            `Event invitation email sent to ${email} `
                        );
                        functions.logger.info(`Response: ${info.response} `);
                    }
                });
            }
        });
    } catch (e) {
        functions.logger.error(e);
        functions.logger.error('Unexpected error occured when emailing guests');
    } finally {
        /**
         * We call next here regardless of what happens so the rest of the
         * request does not stop at this point
         */
        next();
    }
};

export default emailEventGuests;
