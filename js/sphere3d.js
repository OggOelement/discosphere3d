/**
 * @author Olivier Darmon
 */

(function(){

        /***************************************************************/
        /******     JAVASCRIPT (ES6) + AUDIO API (ANALYSER) + CSS3  ****/
        /***************************************************************/

        
        const circlesPerRings = 12;
        const rings = 6;
        const t = 360/ circlesPerRings;
        const p = 180 / rings;
        let circles = [];
        let tick = 0;
        let isLockChangeColor = true;
        let oRed = 255 , oGreen = 10, oBlue = 10;
        let intervalID;
        let rotateFactor = 0;
        let stage = document.querySelector('#stage');
        let content;
        let isPlay = false;

        //initialize context audio and connect analyser
        const soundMedia = document.querySelector("#sound");
        const toggleButton = document.querySelector("#button");
    

        let audioCtx, analyser, bufferLength, dataArray, audioSourceNode;


        function createContextAudio(){
            audioCtx = new(window.AudioContext || window.webkitAudioContext)();
            analyser  = audioCtx.createAnalyser();
            bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);
            audioSourceNode  = audioCtx.createMediaElementSource(soundMedia);

            analyser.fftSize = 128;
            analyser.getByteFrequencyData(dataArray);
            audioSourceNode.connect(analyser);
            analyser.connect(audioCtx.destination); 

        }





        soundMedia.addEventListener("ended" , ()=>{
            toggleButton.innerText = "PLAY SOUND";
            isPlay = false;        
        })

        //Toggle click handler play / pause sound
        toggleButton.addEventListener("click" , ()=>{

            if(!isPlay){
                if(!audioCtx) createContextAudio();
                soundMedia.play();
                toggleButton.innerText = "PAUSE";
                isPlay = true; 
                loop();

            }else{
                soundMedia.pause();
                toggleButton.innerText = "PLAY";
                isPlay = false;                
            }

        });


        //Random colors every 5s
        function changeColor(){

            intervalID = setInterval(()=>{
                oRed = Math.floor(Math.random() * 255);
                oGreen = Math.floor(Math.random() * 255);
                oBlue = Math.floor(Math.random() * 255);

                if(Math.random() > 0 &&  Math.random() < 1/3){
                    oRed = 255;
                }else if(Math.random() >= 1/3 && Math.random() < 1/2){
                    oGreen = 255;
                }else{
                    oBlue = 255;
                }

            }, 5000);
        }


        //draw circles to create sphere
        function drawSphere(){

            content = document.createElement("div");
            content.setAttribute('id' , 'content');
            let rotx, roty;
            let panel, circle;

            for (let i = 0; i < rings  ; i++) {

                panel = document.createElement("div");
                panel.classList.add('panel');
                rotx =  p*i;   
                
                for (let j = 0; j < circlesPerRings; j++) {

                    circle = document.createElement('div');
                    circle.classList.add('circle');
                    roty =  (t * j);
                    panel.appendChild(circle);
                    circle.style.backgroundColor = `rgba(${oRed}, ${oGreen}, ${oBlue}, 0.2)`,
                    circle.style.transform = `rotateY(${roty}deg) translate3d(${0}px , ${-10}px, ${90}px`;
                    circles.push(circle);
                    console.log("circle" + circle);
                    
                }
                
                content.appendChild(panel);
                panel.style.transform = `rotateX(${rotx}deg)`;
            }

            stage.appendChild(content);

        }




        //let the sphere dance
        function rotateSphere(){

            if(!soundMedia.paused){
                tick+=0.005;
                rotateFactor += Math.sin(tick);

                if(isLockChangeColor){
                    changeColor();
                    isLockChangeColor = false;
                }

            }else{

                if(!isLockChangeColor){
                    clearInterval(intervalID);
                    isLockChangeColor = true;
                }               
            }

            content.style.transform = `rotateY(${rotateFactor}deg) rotate3d(${1} , ${0} , ${1.5} , ${rotateFactor}deg)`;
        }


        //Anlyser work here and update circles.
        function updateCircles(){

            if(analyser) analyser.getByteTimeDomainData(dataArray);

            let amount;
            let styleCircle;

            for(let i = 0; i < bufferLength ; i++){

                if(circles[i] != null){                

                    amount = dataArray[i] /2;

                    if(amount > 70 ){

                        styleCircle = {
                            backgroundColor : `rgba(${oRed}, ${oGreen}, ${oBlue}, 1)`,
                            boxShadow : `0px 1px 30px 8px rgba(${oRed}, ${oGreen}, ${oBlue}, 0.8)`
                        }
                        
                    } else{
                        styleCircle = {
                            backgroundColor : `rgba(${oRed}, ${oGreen}, ${oBlue}, ${0.2})`,
                            boxShadow : `0px 1px 10px 8px rgba(${oRed}, ${oGreen}, ${oBlue}, 0)`
                        }
                    }
                
                    circles[i].style.backgroundColor = styleCircle.backgroundColor;
                    circles[i].style.boxShadow = styleCircle.boxShadow;
                }

            }

        }


        //animation with requestAnimationFrame
        function loop(){ 
            
            if(isPlay){
                requestAnimationFrame(loop);
            }

            rotateSphere();
            updateCircles();

        }




        drawSphere();
        
        loop();

    })();