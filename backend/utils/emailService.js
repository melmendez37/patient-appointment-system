import nodemailer from "nodemailer";
import Mailgen from "mailgen";

const transporter = nodemailer.createTransport({
    service : "gmail",
    auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    },
});
    
const MailGenerator = new Mailgen({
    theme: "default",
    product: {
    name: "Roundbout",
    link: "https://roundboutclinic.example.com/",
    },
});

export const sendAppointmentEmail = async ({
    patientName,
    patientEmail,
    startTime,
    status,
    referenceNumber
}) => {
    try {
        const response = {
            body: {
                name: patientName,
                intro: "Your appointment has been scheduled!",
                table: {
                data: [
                    {
                    "Patient Name": patientName,
                    "Appointment Date": startTime,
                    "Status": status,
                    "Reference Number": referenceNumber,
                    },
                ],
                },
                outro: "We look forward to seeing you soon!",
            },
        };

        const mail = MailGenerator.generate(response);

        const message = {
            from: process.env.EMAIL_USER,
            to: patientEmail,
            subject: "Appointment Scheduled Successfully",
            html: mail,
        };

        await transporter.sendMail(message)
        .then(() => {
            console.log("Email sent successfully", message);
        })
        .catch((error) => {
            console.error("Error sending email:", error);
        });
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

    

    

    

    