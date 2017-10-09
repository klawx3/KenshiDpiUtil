const Discord = require("discord.js");
const client = new Discord.Client();
const discord_token = 'secret';

const resolutions = [
    {"width": 1280, "height": 720},
    {"width": 1440, "height": 900},
    {"width": 1600, "height": 900},
    {"width": 1680, "height": 1050},
    {"width": 1920, "height": 1080},
    {"width": 2560, "height": 1080},
    {"width": 2560, "height": 1440},
    {"width": 2560, "height": 1080},
    {"width": 3840, "height": 2160}
];
let factors = {};
resolutions.forEach( (resolution) =>
  factors[resolution.width + "x" + resolution.height] = {
    width: resolution.width,
    height: resolution.height,
    ratio: resolution.width/resolution.height
  }
);
function calc(dpi,sensitivity,fov,callback){
    const inchp360 = (360 * 10 / 3) / (dpi * sensitivity * 0.022);
    const cmp360 = 2.54 * inchp360;
    const rawdotpdeg = dpi * inchp360 / 360;
    const dotpdeg = rawdotpdeg / 2;
    let output = {
        "inchp360" : inchp360,
        "cmp360" : cmp360,
        "rawdotpdeg" : rawdotpdeg,
        "dotpdeg" : dotpdeg
    };
    let rr = [];
    Object.keys(factors).forEach( (resolution) =>{
        const factor = factors[resolution];
        const pixeldeg = factor.ratio * factor.height / fov;
        const error = (pixeldeg > dotpdeg) ? true : false;
        const pixelskipped = pixeldeg - dotpdeg;
        const res = {
            "resolution" : resolution,
            "factor": factor,
            "error": error,
            "pixelskipped" : pixelskipped
        };
        rr.push(res);
    });
    output.resolutions = rr;
    callback(output);
};

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    const mensaje = msg.content;
    if(mensaje.startsWith("!kdpi")){
        commands = mensaje.split(" ");
        if(commands.length < 3){
            let replyy = "Uso !kdpi <dpi> <ow_sens> (resolucion: opcional : all) \n" ;
            replyy += "Ejemplo : !kdpi 800 5 1920x1080";
            msg.reply(replyy);
        }else{
            const dpi = parseInt(commands[1]);
            const sens = parseInt(commands[2]);
            let show_details = 0;
            let res;
            if(typeof commands[3] !== 'undefined') { 
                res = commands[3];
                show_details = (res === 'all') ? 1 : 2; // 1 all - 2 specific
            }
            calc(dpi,sens,103,output => {
                let output_text = Number((output.cmp360).toFixed(2)) + " cm/360"+ "\n";
                if(show_details == 1 ){ // all res
                    for(let i = 0 ; i < output.resolutions.length ; i++){ 
                        let r = output.resolutions[i];
                        output_text += "Resolución: " + r.resolution + " " ;
                        output_text += (r.error ? "CON saltos píxel" : "SIN saltos píxel") + "\n";
                    }
                }else if(show_details == 2){ // especific
                    for(let i = 0 ; i < output.resolutions.length ; i++){ 
                        let r = output.resolutions[i];
                        if(r.resolution == res ){
                            output_text += "Resolución: " + r.resolution + " " ;
                            output_text += (r.error ? "CON saltos píxel" : "SIN saltos píxel") + "\n";
                            if(r.error){                                
                                output_text += "Existen " + Number((r.pixelskipped).toFixed(1)) + " píxels perdidos por movimiento";
                            }                            
                            break;
                        }                        
                    }
                }        
                msg.reply(output_text);
            });
        }        
    }
});
  
client.login(discord_token);

// Web app (Express + EJS)
const http = require('http');
const express = require('express');
const app = express();

// set the port of our application
// process.env.PORT lets the port be set by Heroku
const port = process.env.PORT || 5000;

// set the view engine to ejs
app.set('view engine', 'ejs');

// make express look in the `public` directory for assets (css/js/img)
app.use(express.static(__dirname + '/public'));

// set the home page route
app.get('/', (request, response) => {
    // ejs render automatically looks in the views folder
    response.render('index');
});

app.listen(port, () => {
    // will echo 'Our app is running on http://localhost:5000 when run locally'
    console.log('Our app is running on http://localhost:' + port);
});

// pings server every 15 minutes to prevent dynos from sleeping
setInterval(() => {
 http.get('http://kenshi-dpi-util.herokuapp.com');
}, 900000);







