
let currentSong = new Audio();
let currentIndex = 0;

let songs;
let currFolder;

async function getSongs(folder) {
    currFolder = folder;

    // ✅ Fetch the new songList.json file instead of trying to read folder listing
    let response = await fetch(`./songs/${folder}/songList.json`);
    songs = await response.json();

    // 🎯 Display the song list in the UI
    let songUl = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUl.innerHTML = "";

    for (const song of songs) {
        songUl.innerHTML += `
          <li>
            <img class="invert" src="img/music.svg" alt="">
            <div class="info">
                <div class="sname">${song.replaceAll("%20", " ")}</div>
                <div class="saname">Parth</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/play.svg" alt="">  
            </div> 
          </li>`;
    }

    // ▶️ Add event listeners to play the song when clicked
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach((e) => {
        e.addEventListener("click", () => {
            let songName = e.querySelector(".info").firstElementChild.innerHTML.trim();
            playMusic(songName);
            play.src = "img/pause.svg";
        });
    });

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
    let index = songs.findIndex(song => decodeURIComponent(song) === decodeURIComponent(track));
    if (index !== -1) {
        currentIndex = index;
    }

    currentSong.src = `songs/${currFolder}/` + track;

    if (!pause) {
        currentSong.play();
    }

    play.src = "img/play.svg";
    document.querySelector(".songinfo").innerHTML = decodeURI(track);

    currentSong.addEventListener("loadedmetadata", () => {
        document.querySelector(".songtime").innerHTML =
            `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
    });
};



async function displayAlbums() {
    try {
        let response = await fetch("albums.json");
        let albums = await response.json();
        let cardContainer = document.querySelector(".cardContainer");

        cardContainer.innerHTML = "";

        for (const album of albums) {
            try {
                let folderEncoded = encodeURIComponent(album.folder);
                let metadata = await fetch(`songs/${folderEncoded}/info.json`);

                let info = await metadata.json();

                cardContainer.innerHTML += `
                <div data-folder="${album.folder}" class="card">
                    <div class="play" style="padding: 0px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24"
                            fill="black" class="injected-svg" role="img" color="#4a4a4a">
                            <path d="M7.5241 19.0621C6.85783 19.4721 6 18.9928 6 18.2104V5.78956C6 5.00724 6.85783 4.52789 7.5241 4.93791L17.6161 11.1483C18.2506 11.5388 18.2506 12.4612 17.6161 12.8517L7.5241 19.0621Z"
                                stroke="#000000" stroke-width="1.5" stroke-linejoin="round"></path>
                        </svg>
                    </div>
                    <img src="songs/${folderEncoded}/cover.jpg" alt="cover">
                    <h4>${info.title}</h4>
                    <p>${info.description}</p>
                </div>`;
            } catch (err) {
                console.warn(`Could not load album ${album.folder}`, err);
            }
        }

        // ✅ FIX: Encode folder name before using it in getSongs
        document.querySelectorAll(".card").forEach(card => {
            card.addEventListener("click", async (e) => {
                let folder = encodeURIComponent(e.currentTarget.dataset.folder);
                songs = await getSongs(folder);
                playMusic(songs[0]);
            });
        });

    } catch (err) {
        console.error("Error loading albums.json:", err);
    }
}


async function main() {
    //get the list of songs
    await getSongs("parth")

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
    if (currentIndex > 0) {
        currentIndex--;
        playMusic(songs[currentIndex]);
        play.src = "img/pause.svg";
    }
});



    //add event listener to next button
   document.querySelector("#next").addEventListener("click", () => {
    if (currentIndex + 1 < songs.length) {
        currentIndex++;
        playMusic(songs[currentIndex]);
        play.src = "img/pause.svg";
    }
});

//auto next 

    currentSong.addEventListener("ended", () => {
    if (currentIndex + 1 < songs.length) {
        currentIndex++;
        playMusic(songs[currentIndex]);
    }
});

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
