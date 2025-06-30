
let currentSong = new Audio();

let songs;
let currFolder;

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }

    }

    let songUl = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUl.innerHTML = "";
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `
          <li>
                            <img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div class="sname">${song.replaceAll("%20", " ")}</div>
                                <div class="saname">Parth</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">  
                            </div> </li>`;

    }
    //play songs

    //add event listerner to each song

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach((e) => {
        e.addEventListener("click", element => {
            e.querySelector(".info").firstElementChild.innerHTML//that gives us song name 
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
            play.src = "img/pause.svg";
        })

    })


    return songs;
}


function formatTime(seconds) {
    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);

    // Add leading zero to seconds if less than 10
    if (secs < 10) {
        secs = "0" + secs;
    }

    return `${mins}:${secs}`;
}

const playMusic = (track, pause = false) => {
    let audio = new Audio("/songs/" + track)

    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
    }

    play.src = "img/play.svg"

    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    currentSong.addEventListener("loadedmetadata", () => {
        document.querySelector(".songtime").innerHTML =
            `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
    });

}


async function displayAlbums() {
    let a = await fetch("./songs/");
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let cardContainer = document.querySelector(".cardContainer")

    let anchors = div.getElementsByTagName("a")

    let array = Array.from(anchors)

    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0]
            //get metadata
            let a = await fetch(`./${folder}/info.json`);
            let response = await a.json();
            console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play" style="padding: 0px;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24"
                                fill="black" class="injected-svg" role="img" color="#4a4a4a">
                                <path
                                    d="M7.5241 19.0621C6.85783 19.4721 6 18.9928 6 18.2104V5.78956C6 5.00724 6.85783 4.52789 7.5241 4.93791L17.6161 11.1483C18.2506 11.5388 18.2506 12.4612 17.6161 12.8517L7.5241 19.0621Z"
                                    stroke="#000000" stroke-width="1.5" stroke-linejoin="round"></path>

                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h4>${response.title}</h4>
                        <p>${response.description}</p>
                    </div>`
        }


    }

       //add eventlistener to card for display song in library

    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])

        })
    })
}


async function main() {
    //get the list of songs
    await getSongs("songs/parth")

    playMusic(songs[0], true)
    //show all the songs in the playlist
    //display albums on the page
    displayAlbums()


    //attch event listener to play , next and previous button

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }

        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    //listen for time update event

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`

        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })



    //add event listener to seekbar

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let persent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;

        document.querySelector(".circle").style.left = persent + "%";

        currentSong.currentTime = ((currentSong.duration) * persent) / 100;

    })


    //add event listener to hamburger

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0" + "%";
    })

    //add event listener to hamberger for closing

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120" + "%";
    })

    //add event listener to previous button
    document.querySelector("#previous").addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        // console.log(index);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
            play.src = "pause.svg"

        }

    })

    //add event listener to next button
    document.querySelector("#next").addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        // console.log(index);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
            play.src = "img/pause.svg"
        }

    })

    //add volumn change 

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
    })

    //add muted option on volume

    document.querySelector("#mute").addEventListener("click",(e)=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src = "img/mute.svg" 
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value =0;
        }
        else{
            e.target.src = "img/volume.svg"
            document.querySelector(".range").getElementsByTagName("input")[0].value =10;
            currentSong.volume =0.1;
             

        }
    })
 
}


main()
